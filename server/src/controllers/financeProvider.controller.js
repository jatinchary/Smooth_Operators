import dotenv from "dotenv";

dotenv.config();

import {
  getLendingToken,
  refreshLendingToken,
} from "../services/lendingAuth.service.js";

const LENDING_BASE_PATH = process.env.LENDING_PLATFORM_LENDING_BASE_PATH;

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
      externalSystemId: dealerId, // Assuming dealerId is the external ID
      phone: generalInfo.phone || "",
      fax: generalInfo.fax || "",
      website: generalInfo.website || "",
      modifyusername: "System", // Hardcoded, adjust as needed
      interfaces: [
        {
          interfaceType: interfaceType,
          interfaceOrgId: interfaceOrgId,
          isDisabled: false,
        },
      ],
    };

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

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

          return res.status(200).json({
            success: true,
            message: `Finance provider ${provider} setup completed for dealer ${dealerId}`,
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
