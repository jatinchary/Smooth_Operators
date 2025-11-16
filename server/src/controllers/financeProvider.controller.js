import dotenv from "dotenv";

dotenv.config();

export async function setupFinanceProvider(req, res) {
  try {
    const { dealerId, provider } = req.body || {};

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

    return res.status(200).json({
      success: true,
      message: `Finance provider ${provider} setup initiated for dealer ${dealerId}`,
    });
  } catch (err) {
    console.error("Error in setupFinanceProvider:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
