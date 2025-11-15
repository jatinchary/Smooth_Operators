import { buildHealthStatus } from "../models/health.model.js";

export async function getHealth(req, res) {
  try {
    const payload = await buildHealthStatus();
    res.status(200).json(payload);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      service: "api",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
}
