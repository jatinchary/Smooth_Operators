import dotenv from 'dotenv';

dotenv.config();

const fieApiBaseUrl =
  process.env.FIE_API_BASE_URL || 'https://uat-fandiexpress.app.coxautoinc.com/dspapi';
const fieUsername = process.env.FIE_USERNAME;
const fiePassword = process.env.FIE_PASSWORD;

let currentToken = process.env.FIE_API_TOKEN || null;
let lastUpdatedAt = null;
let refreshTimerId = null;

function isLikelyJwt(tokenString) {
  return typeof tokenString === 'string' && /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(tokenString);
}

function extractJwtFromJson(obj) {
  if (obj == null) return null;
  if (typeof obj === 'string') return isLikelyJwt(obj) ? obj : null;
  if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      const found = extractJwtFromJson(value);
      if (found) return found;
    }
  }
  return null;
}

async function requestTokenWithCredentials() {
  if (!fieUsername || !fiePassword) {
    throw new Error('Missing FIE_USERNAME or FIE_PASSWORD');
  }
  const url = `${fieApiBaseUrl}/EX1Authorization/apijson`;
  const body = {
    EX1AuthorizationRequest: {
      Password: fiePassword,
      Username: fieUsername
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${res.statusText} - ${text}`);
  }
  const token =
    (res.headers.get('content-type') || '').toLowerCase().includes('application/json')
      ? extractJwtFromJson(JSON.parse(text))
      : (isLikelyJwt(text) ? text : null);
  if (!token) {
    throw new Error('Auth response did not include a recognizable JWT token');
  }
  currentToken = token;
  lastUpdatedAt = Date.now();
  return currentToken;
}

async function requestTokenRefresh() {
  if (!currentToken) {
    throw new Error('No token to refresh');
  }
  const url = `${fieApiBaseUrl}/EX1Authorization/apijson`;
  const body = {
    EX1AuthorizationRequest: {
      RefreshToken: currentToken
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status} ${res.statusText} - ${text}`);
  }
  const token =
    (res.headers.get('content-type') || '').toLowerCase().includes('application/json')
      ? extractJwtFromJson(JSON.parse(text))
      : (isLikelyJwt(text) ? text : null);
  if (!token) {
    throw new Error('Refresh response did not include a recognizable JWT token');
  }
  currentToken = token;
  lastUpdatedAt = Date.now();
  return currentToken;
}

export async function getFieToken() {
  if (currentToken) return currentToken;
  // Attempt to login if we can
  try {
    return await requestTokenWithCredentials();
  } catch (_err) {
    return null;
  }
}

export function initializeFiAuthScheduler() {
  // Seed from env or credentials if none
  if (!currentToken && fieUsername && fiePassword) {
    requestTokenWithCredentials().catch(() => {
      // Intentionally swallow to avoid crashing on boot; will retry on schedule
    });
  }
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
  }
  // Refresh every 59 minutes
  refreshTimerId = setInterval(async () => {
    try {
      if (currentToken) {
        await requestTokenRefresh();
      } else if (fieUsername && fiePassword) {
        await requestTokenWithCredentials();
      }
    } catch (_err) {
      // Swallow to keep service running; next tick will retry
    }
  }, 59 * 60 * 1000);
}

export function __debug_getAuthState() {
  return {
    hasToken: Boolean(currentToken),
    lastUpdatedAt
  };
}

// Attempt an immediate refresh (or login if no token), returning the active token or null
export async function refreshTokenNow() {
  try {
    if (currentToken) {
      return await requestTokenRefresh();
    }
    return await requestTokenWithCredentials();
  } catch (_err) {
    return null;
  }
}


