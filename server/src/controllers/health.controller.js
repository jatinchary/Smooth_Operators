import { buildHealthStatus } from '../models/health.model.js';

export function getHealth(req, res) {
  const payload = buildHealthStatus();
  res.status(200).json(payload);
}


