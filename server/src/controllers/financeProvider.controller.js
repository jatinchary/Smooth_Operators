import dotenv from "dotenv";

dotenv.config();

import { v4 as uuidv4 } from "uuid";
import {
  getLendingToken,
  refreshLendingToken,
} from "../services/lendingAuth.service.js";
import { logOutgoingRequest } from "../services/logging.service.js";
import { query } from "../services/database.service.js"; // Add this import

const LENDING_BASE_PATH = process.env.LENDING_PLATFORM_LENDING_BASE_PATH;

// Helper function to format phone/fax to US standard (XXX) XXX-XXXX
function formatPhone(phoneStr) {
  if (!phoneStr || typeof phoneStr !== "string") return "";

  // Extract digits only
  const digits = phoneStr.replace(/\D/g, "");

  if (digits.length === 10) {
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6, 10)}`;
    console.log(`Formatted phone/fax: ${formatted}`);
    return formatted;
  } else {
    console.warn(
      `Phone/fax formatting failed for input "${phoneStr}" (digits: ${digits.length}), using empty`
    );
    return "";
  }
}

function payloadIndicatesInvalidToken(payload) {
  try {
    const stack = [payload];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (
        node.error_description &&
        typeof node.error_description === "string"
      ) {
        if (
          node.error_description.toLowerCase().includes("invalid token") ||
          node.error_description.toLowerCase().includes("unauthorized")
        )
          return true;
      }
      if (node.error === "invalid_token") return true;
      for (const value of Object.values(node)) {
        stack.push(value);
      }
    }
  } catch (_err) {
    // ignore
  }
  return false;
}

export async function setupFinanceProvider(req, res) {
  try {
    const { dealerId, provider, generalInfo } = req.body || {};

    if (!dealerId) {
      return res.status(400).json({ error: "dealerId is required" });
    }

    if (!provider) {
      return res.status(400).json({ error: "provider is required" });
    }

    if (!["route-one", "dealertrack"].includes(provider)) {
      return res.status(400).json({
        error: "Invalid provider. Must be 'route-one' or 'dealertrack'",
      });
    }

    if (!generalInfo) {
      return res.status(400).json({ error: "generalInfo is required" });
    }

    if (!LENDING_BASE_PATH) {
      return res
        .status(500)
        .json({ error: "Lending Platform base path not configured" });
    }

    let lendingToken = await getLendingToken();
    if (!lendingToken) {
      return res
        .status(500)
        .json({ error: "Lending Platform token unavailable" });
    }

    const url = `${LENDING_BASE_PATH}/orgs`;

    // Map provider to interfaceType
    const interfaceType = provider === "route-one" ? "RouteOne" : "DealerTrack";
    const interfaceOrgId = dealerId;

    // Build payload from generalInfo and other data
    const payload = {
      orgType: "Dealer",
      parentId: 123, // Hardcoded as per example
      name: generalInfo.dbaName || generalInfo.legalName || "Unknown Dealer",
      legalName: generalInfo.legalName || "Unknown Dealer",
      address: generalInfo.address1 || "",
      suiteNo: generalInfo.address2 || "",
      city: generalInfo.city || "",
      state: generalInfo.state || "",
      country: generalInfo.country || "USA",
      zipCode: generalInfo.zipCode || "",
      externalSystemId: uuidv4(), // Assuming dealerId is the external ID
      phone: formatPhone(generalInfo.phone),
      fax: formatPhone(generalInfo.fax),
      website: generalInfo.website,
      modifyusername: "System", // Hardcoded, adjust as needed
      isTest: true,
      interfaces: [
        {
          interfaceType: interfaceType,
          interfaceOrgId: interfaceOrgId,
          isDisabled: false,
        },
      ],
    };

    async function doRequest(token) {
      const requestId = uuidv4();
      const startTime = Date.now();

      const requestMeta = {
        method: "POST",
        url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer [REDACTED]",
        },
        bodySize: JSON.stringify(payload).length,
        body: JSON.stringify(payload),
        startTime,
      };

      const loggedFetch = () =>
        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

      const upstreamRes = await logOutgoingRequest(
        loggedFetch,
        "lending-platform",
        requestId,
        requestMeta
      );

      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json") ?? false;
      const responsePayload = isJson ? JSON.parse(text) : { raw: text };

      return { upstreamRes, payload: responsePayload };
    }

    // First attempt
    let { upstreamRes, payload: responsePayload } = await doRequest(
      lendingToken
    );

    if (upstreamRes.ok && !payloadIndicatesInvalidToken(responsePayload)) {
      // Log the setup
      console.log(
        `Successfully set up finance provider: ${provider} for dealer ID: ${dealerId}`
      );

      // Extract orgId and save to database
      const orgId = responsePayload?.orgId;
      const dealershipId = req.body.dealershipId;
      if (orgId && dealershipId) {
        const recordId = uuidv4();
        try {
          await query(
            `INSERT INTO entity_configuration (id, configurable_type, configurable_id, "key", value, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [recordId, "dealership", dealershipId, "lending_platform_id", orgId]
          );
          console.log(
            `Saved Lending Platform orgId ${orgId} for dealership ${dealershipId}`
          );
        } catch (dbError) {
          console.error(
            `Failed to save orgId to database for dealership ${dealershipId}:`,
            dbError
          );
          // Continue without failing the response
        }
      } else {
        console.warn(
          `Missing orgId or dealershipId: orgId=${orgId}, dealershipId=${dealershipId}`
        );
      }

      // Save interfaceOrgId to dealership_variables for route-one
      if (provider === "route-one" && interfaceOrgId && dealershipId) {
        try {
          await query(
            `INSERT INTO dealership_variables (name, value, client_editable, dealership_id, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            ["routeone_dealer", interfaceOrgId, 0, dealershipId]
          );
          console.log(
            `Saved routeone_dealer interfaceOrgId ${interfaceOrgId} for dealership ${dealershipId}`
          );
        } catch (dbError) {
          console.error(
            `Failed to save interfaceOrgId to dealership_variables for dealership ${dealershipId}:`,
            dbError
          );
          // Continue without failing the response
        }
      }

      return res.status(200).json({
        success: true,
        message: `Finance provider ${provider} setup completed for dealer ${dealerId}`,
        data: responsePayload,
      });
    }

    // If invalid token, try refresh and retry once
    if (
      payloadIndicatesInvalidToken(responsePayload) ||
      upstreamRes.status === 401 ||
      upstreamRes.status === 403
    ) {
      const refreshed = await refreshLendingToken();
      if (refreshed) {
        ({ upstreamRes, payload: responsePayload } = await doRequest(
          refreshed
        ));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(responsePayload)) {
          console.log(
            `Successfully set up finance provider: ${provider} for dealer ID: ${dealerId} after token refresh`
          );

          // Extract orgId and save to database (same logic as above)
          const orgId = responsePayload?.orgId;
          const dealershipId = req.body.dealershipId;
          if (orgId && dealershipId) {
            const recordId = uuidv4();
            try {
              await query(
                `INSERT INTO entity_configuration (id, configurable_type, configurable_id, "key", value, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                  recordId,
                  "dealership",
                  dealershipId,
                  "lending_platform_id",
                  orgId,
                ]
              );
              console.log(
                `Saved Lending Platform orgId ${orgId} for dealership ${dealershipId}`
              );
            } catch (dbError) {
              console.error(
                `Failed to save orgId to database for dealership ${dealershipId}:`,
                dbError
              );
              // Continue without failing the response
            }
          } else {
            console.warn(
              `Missing orgId or dealershipId: orgId=${orgId}, dealershipId=${dealershipId}`
            );
          }

          // Save interfaceOrgId to dealership_variables for route-one
          if (provider === "route-one" && interfaceOrgId && dealershipId) {
            try {
              await query(
                `INSERT INTO dealership_variables (name, value, client_editable, dealership_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, NOW(), NOW())`,
                ["routeone_dealer", interfaceOrgId, 0, dealershipId]
              );
              console.log(
                `Saved routeone_dealer interfaceOrgId ${interfaceOrgId} for dealership ${dealershipId}`
              );
            } catch (dbError) {
              console.error(
                `Failed to save interfaceOrgId to dealership_variables for dealership ${dealershipId}:`,
                dbError
              );
              // Continue without failing the response
            }
          }

          return res.status(200).json({
            success: true,
            message: `Finance provider ${provider} setup completed for dealer ${dealershipId}`,
            data: responsePayload,
          });
        }
      }
    }

    // Fallthrough: bubble upstream error
    console.error(
      `Lending Platform API error for ${provider}:`,
      responsePayload
    );
    return res.status(upstreamRes.status || 500).json({
      error: "Lending Platform setup failed",
      status: upstreamRes.status || 500,
      details: responsePayload,
    });
  } catch (err) {
    console.error("Error in setupFinanceProvider:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function importCreditAppLenders(req, res) {
  try {
    const { dealershipId, provider, interfaceOrgId } = req.body || {};

    if (!dealershipId) {
      return res.status(400).json({ error: "dealershipId is required" });
    }

    if (!provider) {
      return res.status(400).json({ error: "provider is required" });
    }

    if (!["route-one", "dealertrack"].includes(provider)) {
      return res.status(400).json({
        error: "Invalid provider. Must be 'route-one' or 'dealertrack'",
      });
    }

    if (!interfaceOrgId) {
      return res.status(400).json({ error: "interfaceOrgId is required" });
    }

    if (!LENDING_BASE_PATH) {
      return res
        .status(500)
        .json({ error: "Lending Platform base path not configured" });
    }

    let lendingToken = await getLendingToken();
    if (!lendingToken) {
      return res
        .status(500)
        .json({ error: "Lending Platform token unavailable" });
    }

    // Query orgId from database
    const orgResult = await query(
      `SELECT value as orgId FROM entity_configuration 
       WHERE configurable_type = 'dealership' 
       AND configurable_id = ? 
       AND "key" = 'lending_platform_id'`,
      [dealershipId]
    );

    if (!orgResult.rows || !orgResult.rows.length) {
      return res.status(404).json({ error: "orgId not found for dealership" });
    }

    const orgId = orgResult.rows[0].orgId;

    const interfaceType = provider === "route-one" ? "RouteOne" : "DealerTrack";
    const url = `${LENDING_BASE_PATH}/orgs/${orgId}/associations/${interfaceType}?interfaceOrgId=${interfaceOrgId}`;

    const payload = {}; // Empty payload for import

    async function doRequest(token) {
      const requestId = uuidv4();
      const startTime = Date.now();

      const requestMeta = {
        method: "POST",
        url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer [REDACTED]",
        },
        bodySize: JSON.stringify(payload).length,
        body: JSON.stringify(payload),
        startTime,
      };

      const loggedFetch = () =>
        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

      const upstreamRes = await logOutgoingRequest(
        loggedFetch,
        "lending-platform",
        requestId,
        requestMeta
      );

      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json") ?? false;
      const responsePayload = isJson ? JSON.parse(text) : { raw: text };

      return { upstreamRes, payload: responsePayload };
    }

    // First attempt
    let { upstreamRes, payload: responsePayload } = await doRequest(
      lendingToken
    );

    if (upstreamRes.ok && !payloadIndicatesInvalidToken(responsePayload)) {
      console.log(
        `Successfully imported credit app lenders for ${provider} dealer interfaceOrgId: ${interfaceOrgId}`
      );

      return res.status(200).json({
        success: true,
        message: `Credit app lenders imported for ${provider}`,
        data: responsePayload, // Assume this contains the lenders list
      });
    }

    // If invalid token, try refresh and retry once
    if (
      payloadIndicatesInvalidToken(responsePayload) ||
      upstreamRes.status === 401 ||
      upstreamRes.status === 403
    ) {
      const refreshed = await refreshLendingToken();
      if (refreshed) {
        ({ upstreamRes, payload: responsePayload } = await doRequest(
          refreshed
        ));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(responsePayload)) {
          console.log(
            `Successfully imported credit app lenders for ${provider} after token refresh`
          );

          return res.status(200).json({
            success: true,
            message: `Credit app lenders imported for ${provider}`,
            data: responsePayload,
          });
        }
      }
    }

    // Fallthrough: bubble upstream error
    console.error(
      `Lending Platform API error for import ${provider}:`,
      responsePayload
    );
    return res.status(upstreamRes.status || 500).json({
      error: "Lending Platform import failed",
      status: upstreamRes.status || 500,
      details: responsePayload,
    });
  } catch (err) {
    console.error("Error in importCreditAppLenders:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function saveCreditAppLenders(req, res) {
  let connection;
  try {
    const { dealershipId, lenders } = req.body || {};

    if (!dealershipId) {
      return res.status(400).json({ error: "dealershipId is required" });
    }

    if (!lenders || !Array.isArray(lenders) || lenders.length === 0) {
      return res
        .status(400)
        .json({ error: "lenders array is required and must not be empty" });
    }

    // Fetch all states from database to create a mapping
    const statesResult = await query(`SELECT id, abbreviation FROM states`);

    if (!statesResult.rows || !statesResult.rows.length) {
      return res
        .status(500)
        .json({ error: "Failed to fetch states from database" });
    }

    // Create a map of state abbreviation to state ID
    const stateMap = {};
    for (const state of statesResult.rows) {
      stateMap[state.abbreviation.toUpperCase()] = state.id;
    }

    console.log(`Fetched ${Object.keys(stateMap).length} states from database`);

    // Fetch deal types (finance and lease) from database
    const dealTypesResult = await query(
      `SELECT id, name FROM deal_types WHERE deleted_at IS NULL AND (name LIKE '%finance%' OR name LIKE '%lease%')`
    );

    if (!dealTypesResult.rows || !dealTypesResult.rows.length) {
      console.warn("No finance or lease deal types found in database");
    }

    // Create a map of deal type name to deal type ID
    const dealTypeMap = {};
    let financeDealTypeId = null;
    let leaseDealTypeId = null;

    for (const dealType of dealTypesResult.rows || []) {
      const nameLower = dealType.name.toLowerCase();
      dealTypeMap[nameLower] = dealType.id;

      if (nameLower.includes("finance") && !leaseDealTypeId) {
        financeDealTypeId = dealType.id;
      }
      if (nameLower.includes("lease")) {
        leaseDealTypeId = dealType.id;
      }
    }

    console.log(
      `Fetched deal types - Finance ID: ${financeDealTypeId}, Lease ID: ${leaseDealTypeId}`
    );

    // Get a connection for transaction
    connection = (await query.constructor.prototype.constructor.prototype
      .getConnection)
      ? await query.constructor.prototype.constructor.prototype.getConnection()
      : null;

    // If we can't get a transaction connection, we'll just process without transactions
    const savedLenders = [];
    const failedLenders = [];

    for (const lender of lenders) {
      try {
        // Extract and validate lender data
        const dmsLenderId = lender.id || null; // DMS lender ID for reference only
        const creditAppLenderId = null; // Keep as null for now - different from DMS lender ID
        const name = lender.name || lender.lienHolder || "Unknown Lender";
        const addressLine1 =
          lender.lienHolderAddress?.addressLine1 ||
          lender.lienHolderAddress?.street ||
          lender.lienHolderAddress?.address ||
          "";
        const addressLine2 = lender.lienHolderAddress?.addressLine2 || null;
        const city = lender.lienHolderAddress?.city || "";
        const stateAbbr = lender.lienHolderAddress?.state || "";
        const zipCode =
          lender.lienHolderAddress?.zipCode ||
          lender.lienHolderAddress?.zip ||
          "";
        const phone = lender.phone || null;
        const email = lender.email || null;
        const fax = lender.fax || null;

        // Validate required fields
        if (!name || !city || !stateAbbr || !zipCode) {
          console.warn(
            `Skipping lender ${dmsLenderId}: Missing required fields`
          );
          failedLenders.push({
            dmsLenderId,
            name,
            reason: "Missing required fields (name, city, state, or zip code)",
          });
          continue;
        }

        // Get state ID from mapping
        const stateId = stateMap[stateAbbr.toUpperCase()];
        if (!stateId) {
          console.warn(
            `Skipping lender ${dmsLenderId}: Invalid state abbreviation ${stateAbbr}`
          );
          failedLenders.push({
            dmsLenderId,
            name,
            reason: `Invalid state abbreviation: ${stateAbbr}`,
          });
          continue;
        }

        // Check if lender already exists by name, city, and state
        const lenderResult = await query(
          `SELECT id FROM lenders 
           WHERE name = ? 
           AND city = ? 
           AND state_id = ? 
           AND deleted_at IS NULL 
           LIMIT 1`,
          [name, city, stateId]
        );

        let lenderId;

        if (lenderResult && lenderResult.rows && lenderResult.rows.length > 0) {
          // Update existing lender
          lenderId = lenderResult.rows[0].id;
          await query(
            `UPDATE lenders 
             SET address_line_1 = ?, 
                 address_line_2 = ?, 
                 zip_code = ?, 
                 phone = ?, 
                 email = ?, 
                 fax = ?, 
                 updated_at = NOW()
             WHERE id = ?`,
            [addressLine1, addressLine2, zipCode, phone, email, fax, lenderId]
          );
          console.log(`Updated existing lender ID ${lenderId}: ${name}`);
        } else {
          // Insert new lender
          const insertResult = await query(
            `INSERT INTO lenders 
             (credit_app_lender_id, name, address_line_1, address_line_2, city, state_id, zip_code, phone, email, fax, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [
              creditAppLenderId,
              name,
              addressLine1,
              addressLine2,
              city,
              stateId,
              zipCode,
              phone,
              email,
              fax,
            ]
          );
          lenderId = insertResult.rows.insertId;
          console.log(`Inserted new lender ID ${lenderId}: ${name}`);
        }

        // Check if lender_dealerships relationship already exists
        const relationshipResult = await query(
          `SELECT id FROM lender_dealerships 
           WHERE lender_id = ? AND dealership_id = ? AND deleted_at IS NULL`,
          [lenderId, dealershipId]
        );

        if (!relationshipResult.rows || relationshipResult.rows.length === 0) {
          // Insert lender_dealerships relationship
          await query(
            `INSERT INTO lender_dealerships 
             (lender_id, dealership_id, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            [lenderId, dealershipId]
          );
          console.log(
            `Created lender_dealerships relationship for lender ID ${lenderId} and dealership ID ${dealershipId}`
          );
        } else {
          console.log(
            `Lender_dealerships relationship already exists for lender ID ${lenderId} and dealership ID ${dealershipId}`
          );
        }

        // Check if lender name contains "finance" or "lease" and create deal type relationships
        const nameLower = name.toLowerCase();
        const dealTypesToAssociate = [];

        if (nameLower.includes("finance") && financeDealTypeId) {
          dealTypesToAssociate.push({
            dealTypeId: financeDealTypeId,
            typeName: "finance",
          });
        }

        if (nameLower.includes("lease") && leaseDealTypeId) {
          dealTypesToAssociate.push({
            dealTypeId: leaseDealTypeId,
            typeName: "lease",
          });
        }

        // Insert lender_deal_types relationships
        for (const dealType of dealTypesToAssociate) {
          const dealTypeRelResult = await query(
            `SELECT id FROM lender_deal_types 
             WHERE lender_id = ? AND deal_type_id = ? AND deleted_at IS NULL`,
            [lenderId, dealType.dealTypeId]
          );

          if (!dealTypeRelResult.rows || dealTypeRelResult.rows.length === 0) {
            await query(
              `INSERT INTO lender_deal_types 
               (lender_id, deal_type_id, created_at, updated_at)
               VALUES (?, ?, NOW(), NOW())`,
              [lenderId, dealType.dealTypeId]
            );
            console.log(
              `Created lender_deal_types relationship for lender ID ${lenderId} with ${dealType.typeName} deal type`
            );
          } else {
            console.log(
              `Lender_deal_types relationship already exists for lender ID ${lenderId} with ${dealType.typeName} deal type`
            );
          }
        }

        savedLenders.push({
          lenderId,
          dmsLenderId,
          name,
          dealTypes: dealTypesToAssociate.map((dt) => dt.typeName),
        });
      } catch (lenderError) {
        console.error(`Error processing lender ${lender.id}:`, lenderError);
        failedLenders.push({
          dmsLenderId: lender.id,
          name: lender.name || "Unknown",
          reason: lenderError.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully saved ${savedLenders.length} lender(s)`,
      data: {
        saved: savedLenders.length,
        failed: failedLenders.length,
        savedLenders,
        failedLenders,
      },
    });
  } catch (err) {
    console.error("Error in saveCreditAppLenders:", err);
    return res
      .status(500)
      .json({ error: "Unexpected server error", details: err.message });
  } finally {
    if (connection && connection.release) {
      connection.release();
    }
  }
}
