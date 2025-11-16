import dotenv from "dotenv";

dotenv.config();

let currentToken = null;
let tokenExpiry = 0;

const AUTH_URL = `${process.env.TEKION_BASE_URI}/auth/v1/oauth2/token`;
const CLIENT_ID = process.env.TEKION_CLIENT_ID;
const ACCESS_KEY = process.env.TEKION_ACCESS_KEY;
const SECRET_KEY = process.env.TEKION_SECRET_KEY;
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes
let refreshTimer = null;

async function requestToken() {
  if (!AUTH_URL || !CLIENT_ID || !ACCESS_KEY || !SECRET_KEY) {
    console.error("Tekion auth config missing");
    return null;
  }

  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        client_id: CLIENT_ID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        "access-key": ACCESS_KEY,
        "secret-key": SECRET_KEY,
      }),
    });

    if (!response.ok) {
      console.error(
        `Token request failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    const token = data.access_token;
    const expiresIn = data.expires_in || 3600; // Default to 1 hour

    if (token) {
      currentToken = token;
      tokenExpiry = Date.now() + expiresIn * 1000 - 60000; // Refresh 1 min early
      return token;
    }

    return null;
  } catch (error) {
    console.error("Token request error:", error);
    return null;
  }
}

export async function getTekionToken() {
  if (currentToken && Date.now() < tokenExpiry) {
    return currentToken;
  }

  return await requestToken();
}

export async function refreshTekionToken() {
  currentToken = null;
  tokenExpiry = 0;
  return await requestToken();
}

export function initializeTekionAuthScheduler() {
  if (refreshTimer) {
    return;
  }

  const runRefresh = async () => {
    if (Date.now() >= tokenExpiry) {
      await refreshTekionToken();
      console.log("Tekion token refreshed");
    }
  };

  refreshTimer = setInterval(runRefresh, REFRESH_INTERVAL_MS);

  // Initial token fetch
  requestToken();
}
