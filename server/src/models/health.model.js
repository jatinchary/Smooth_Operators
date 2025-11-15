import { databaseHealthCheck } from "../services/database.service.js";

export async function buildHealthStatus() {
  const dbHealth = await databaseHealthCheck();

  const health = {
    status: dbHealth.status === "healthy" ? "ok" : "error",
    service: "api",
    timestamp: new Date().toISOString(),
    database: dbHealth,
  };

  return health;
}
