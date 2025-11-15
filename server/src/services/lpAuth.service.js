import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.LP_CLIENT_ID;
const clientSecret = process.env.LP_CLIENT_SECRET;
const tokenUrl = process.env.LP_TOKEN_URL;

let cachedAccessToken = null;
let cachedExpiryTs = 0;

function isTokenValid() {
  return cachedAccessToken && Date.now() < cachedExpiryTs - 30_000; // 30s safety window
}

export async function getLpAccessToken() {
  if (isTokenValid()) return cachedAccessToken;
  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error('Missing LP OAuth env configuration');
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`LP token fetch failed: ${res.status} ${res.statusText} - ${text}`);
  }
  const json = JSON.parse(text);
  if (!json.access_token) {
    throw new Error('LP token response missing access_token');
  }
  const expiresInMs = typeof json.expires_in === 'number' ? json.expires_in * 1000 : 3600_000;
  cachedAccessToken = json.access_token;
  cachedExpiryTs = Date.now() + expiresInMs;
  return cachedAccessToken;
}


