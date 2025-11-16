import dotenv from "dotenv";
import nodeCron from "node-cron";

dotenv.config();

let currentToken = null;
let tokenExpiry = 0;

const TOKEN_URL = process.env.LENDING_PLATFORM_TOKEN_URL;
const CLIENT_ID = process.env.LENDING_PLATFORM_CLIENT_ID;
const CLIENT_SECRET = process.env.LENDING_PLATFORM_CLIENT_SECRET;

async function requestToken() {
  if (!TOKEN_URL || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("Lending Platform auth config missing");
    return null;
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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
    const expiresIn = data.expires_in || 7200; // Updated fallback to 7200 seconds (2 hours)

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

export async function getLendingToken() {
  if (currentToken && Date.now() < tokenExpiry) {
    return currentToken;
  }

  return await requestToken();
}

export async function refreshLendingToken() {
  currentToken = null;
  tokenExpiry = 0;
  return await requestToken();
}

export function initializeLendingAuthScheduler() {
  // Refresh token every 60 minutes (suitable for 2-hour expiry)
  nodeCron.schedule("0 * * * *", async () => {
    if (Date.now() >= tokenExpiry) {
      await refreshLendingToken();
      console.log("Lending Platform token refreshed");
    }
  });

  // Initial token fetch
  requestToken();
}
