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
      const dealershipId = req.body.dealershipId || 7;
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

    console.log("dealershipId", dealershipId);

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
