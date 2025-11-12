export function buildHealthStatus() {
  return {
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString()
  };
}


