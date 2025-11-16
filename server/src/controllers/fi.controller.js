import dotenv from "dotenv";

dotenv.config();

const fieApiBaseUrl =
  process.env.FIE_API_BASE_URL ||
  "https://uat-fandiexpress.app.coxautoinc.com/dspapi";
import { getFieToken, refreshTokenNow } from "../services/fiAuth.service.js";

function payloadIndicatesInvalidToken(payload) {
  try {
    const stack = [payload];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (node.Description && typeof node.Description === "string") {
        if (node.Description.toLowerCase().includes("invalid token"))
          return true;
      }
      if (node.StatusCode === 1000) return true;
      for (const value of Object.values(node)) {
        stack.push(value);
      }
    }
  } catch (_err) {
    // ignore
  }
  return false;
}

export async function postDealerProduct(req, res) {
  try {
    const { dealerId } = req.body || {};
    if (!dealerId) {
      return res.status(400).json({ error: "dealerId is required" });
    }
    let fieApiToken = await getFieToken();
    if (!fieApiToken) {
      return res.status(500).json({ error: "FIE token unavailable" });
    }

    const url = `${fieApiBaseUrl}/EX1DealerProduct/apijson`;
    const buildBody = () => ({
      EX1DealerProductRequest: {
        EX1DealerID: dealerId,
      },
    });

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildBody()),
      });
      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json") ?? false;
      const payload = isJson ? JSON.parse(text) : { raw: text };
      return { upstreamRes, payload };
    }

    // First attempt
    let { upstreamRes, payload } = await doRequest(fieApiToken);
    if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
      return res.status(200).json(payload);
    }
    // If invalid token, try refresh/login and retry once
    if (
      payloadIndicatesInvalidToken(payload) ||
      upstreamRes.status === 401 ||
      upstreamRes.status === 403
    ) {
      const refreshed = await refreshTokenNow();
      if (refreshed) {
        ({ upstreamRes, payload } = await doRequest(refreshed));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
          return res.status(200).json(payload);
        }
      }
    }
    // Fallthrough: bubble upstream error/details
    return res.status(upstreamRes.status || 500).json({
      error: "Upstream request failed",
      status: upstreamRes.status || 500,
      details: payload,
    });
  } catch (err) {
    // Avoid leaking internal details to clients
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function postProviderList(req, res) {
  try {
    const { dealerId } = req.body || {};
    if (!dealerId) {
      return res.status(400).json({ error: "dealerId is required" });
    }
    let fieApiToken = await getFieToken();
    if (!fieApiToken) {
      return res.status(500).json({ error: "FIE token unavailable" });
    }

    const url = `${fieApiBaseUrl}/EX1ProviderList/apijson`;
    const buildBody = () => ({
      EX1ProviderListRequest: {
        EX1DealerID: dealerId,
      },
    });

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildBody()),
      });
      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json") ?? false;
      const payload = isJson ? JSON.parse(text) : { raw: text };
      return { upstreamRes, payload };
    }

    let { upstreamRes, payload } = await doRequest(fieApiToken);
    if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
      return res.status(200).json(payload);
    }
    if (
      payloadIndicatesInvalidToken(payload) ||
      upstreamRes.status === 401 ||
      upstreamRes.status === 403
    ) {
      const refreshed = await refreshTokenNow();
      if (refreshed) {
        ({ upstreamRes, payload } = await doRequest(refreshed));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
          return res.status(200).json(payload);
        }
      }
    }
    return res.status(upstreamRes.status || 500).json({
      error: "Upstream request failed",
      status: upstreamRes.status || 500,
      details: payload,
    });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function postProductList(req, res) {
  try {
    const { providerId } = req.body || {};
    if (!providerId) {
      return res.status(400).json({ error: "providerId is required" });
    }
    let fieApiToken = await getFieToken();
    if (!fieApiToken) {
      return res.status(500).json({ error: "FIE token unavailable" });
    }

    const url = `${fieApiBaseUrl}/EX1ProductList/apijson`;
    const buildBody = () => ({
      EX1ProductListRequest: {
        EX1ProviderID: providerId,
      },
    });

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildBody()),
      });
      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json") ?? false;
      const payload = isJson ? JSON.parse(text) : { raw: text };
      return { upstreamRes, payload };
    }

    let { upstreamRes, payload } = await doRequest(fieApiToken);
    if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
      return res.status(200).json(payload);
    }
    if (
      payloadIndicatesInvalidToken(payload) ||
      upstreamRes.status === 401 ||
      upstreamRes.status === 403
    ) {
      const refreshed = await refreshTokenNow();
      if (refreshed) {
        ({ upstreamRes, payload } = await doRequest(refreshed));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
          return res.status(200).json(payload);
        }
      }
    }
    return res.status(upstreamRes.status || 500).json({
      error: "Upstream request failed",
      status: upstreamRes.status || 500,
      details: payload,
    });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected server error" });
  }
}

export async function importProducts(req, res) {
  try {
    const { dealerId, vendorIds } = req.body || {};

    if (!dealerId) {
      return res.status(400).json({ error: "dealerId is required" });
    }

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res
        .status(400)
        .json({ error: "vendorIds must be a non-empty array" });
    }

    // Step 1: Fetch dealer products
    const dealerProductsRes = await fetch(
      `${fieApiBaseUrl}/EX1DealerProduct/apijson`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getFieToken()}`,
        },
        body: JSON.stringify({
          EX1DealerProductRequest: {
            EX1DealerID: dealerId,
          },
        }),
      }
    );

    if (!dealerProductsRes.ok) {
      return res.status(dealerProductsRes.status).json({
        error: "Failed to fetch dealer products",
        status: dealerProductsRes.status,
      });
    }

    const dealerProductsData = await dealerProductsRes.json();
    const dealerProducts =
      dealerProductsData?.EX1DealerProductResponse?.Products?.Product || [];

    // Extract dealer product IDs for matching
    const dealerProductIds = new Set(
      dealerProducts.map((product) => product.EX1ProductID || product.ProductID)
    );

    // Step 2: Fetch products for each vendor
    const vendorProductsPromises = vendorIds.map(async (vendorId) => {
      const vendorProductsRes = await fetch(
        `${fieApiBaseUrl}/EX1ProductList/apijson`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getFieToken()}`,
          },
          body: JSON.stringify({
            EX1ProductListRequest: {
              EX1ProviderID: vendorId,
            },
          }),
        }
      );

      if (!vendorProductsRes.ok) {
        throw new Error(`Failed to fetch products for vendor ${vendorId}`);
      }

      const vendorProductsData = await vendorProductsRes.json();
      return (
        vendorProductsData?.EX1ProductListResponse?.Products?.Product || []
      );
    });

    const vendorProductsArrays = await Promise.all(vendorProductsPromises);

    // Flatten all vendor products
    const allVendorProducts = vendorProductsArrays.flat();

    // Step 3: Find common products
    const commonProducts = allVendorProducts.filter((vendorProduct) => {
      const vendorProductId = vendorProduct.EX1ProductID;
      return dealerProductIds.has(vendorProductId);
    });

    // Remove duplicates based on EX1ProductID
    const uniqueCommonProducts = commonProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.EX1ProductID === product.EX1ProductID)
    );

    return res.status(200).json({
      success: true,
      dealerId,
      vendorIds,
      commonProducts: uniqueCommonProducts,
      totalCommonProducts: uniqueCommonProducts.length,
    });
  } catch (err) {
    console.error("Error in importProducts:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
