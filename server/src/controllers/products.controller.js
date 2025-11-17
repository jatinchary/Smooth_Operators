import { logWithRequestId, logger } from "../services/logging.service.js";
import { persistProductsSnapshot } from "../services/productSnapshot.service.js";

function sanitizeSummary(summary) {
  if (!Array.isArray(summary)) {
    return [];
  }

  return summary.map((entry) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return entry;
    }
    return { value: entry };
  });
}

export async function postProductsLogSummary(req, res, next) {
  try {
    const { summary, context } = req.body || {};

    if (!Array.isArray(summary) || summary.length === 0) {
      return res.status(400).json({ error: "summary must be a non-empty array" });
    }

    const safeSummary = sanitizeSummary(summary);
    const metadata = {
      summary: safeSummary,
      context: context && typeof context === "object" ? context : {},
    };

    const requestId = req.requestId;

    if (requestId) {
      logWithRequestId("info", "PRODUCTS_SUMMARY", requestId, metadata);
    } else {
      logger.info("PRODUCTS_SUMMARY", metadata);
    }

    await persistProductsSnapshot({
      products: Array.isArray(context?.products) ? context.products : [],
      productConfigurations: Array.isArray(context?.productConfigurations)
        ? context.productConfigurations
        : [],
      dealerId: context?.dealerId,
      dealershipId: context?.dealershipId,
      productIntegration: context?.productIntegration,
    });

    res.status(200).json({ status: "logged" });
  } catch (error) {
    next(error);
  }
}


