import dotenv from 'dotenv';

dotenv.config();

const fieApiBaseUrl =
  process.env.FIE_API_BASE_URL || 'https://uat-fandiexpress.app.coxautoinc.com/dspapi';
import { getFieToken, refreshTokenNow } from '../services/fiAuth.service.js';

function payloadIndicatesInvalidToken(payload) {
  try {
    const stack = [payload];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== 'object') continue;
      if (node.Description && typeof node.Description === 'string') {
        if (node.Description.toLowerCase().includes('invalid token')) return true;
      }
      if (node.StatusCode === 1000) return true;
      for (const value of Object.values(node)) {
        stack.push(value);
      }
    }
  } catch (_err) {
    // ignore
  }
  return false;
}

export async function postDealerProduct(req, res) {
  try {
    const { dealerId } = req.body || {};
    if (!dealerId) {
      return res.status(400).json({ error: 'dealerId is required' });
    }
    let fieApiToken = await getFieToken();
    if (!fieApiToken) {
      return res.status(500).json({ error: 'FIE token unavailable' });
    }

    const url = `${fieApiBaseUrl}/EX1DealerProduct/apijson`;
    const buildBody = () => ({
      EX1DealerProductRequest: {
        EX1DealerID: dealerId
      }
    });

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildBody())
      });
      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false;
      const payload = isJson ? JSON.parse(text) : { raw: text };
      return { upstreamRes, payload };
    }

    // First attempt
    let { upstreamRes, payload } = await doRequest(fieApiToken);
    if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
      return res.status(200).json(payload);
    }
    // If invalid token, try refresh/login and retry once
    if (payloadIndicatesInvalidToken(payload) || upstreamRes.status === 401 || upstreamRes.status === 403) {
      const refreshed = await refreshTokenNow();
      if (refreshed) {
        ({ upstreamRes, payload } = await doRequest(refreshed));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
          return res.status(200).json(payload);
        }
      }
    }
    // Fallthrough: bubble upstream error/details
    return res.status(upstreamRes.status || 500).json({
      error: 'Upstream request failed',
      status: upstreamRes.status || 500,
      details: payload
    });
  } catch (err) {
    // Avoid leaking internal details to clients
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}

export async function postProviderList(req, res) {
  try {
    const { dealerId } = req.body || {};
    if (!dealerId) {
      return res.status(400).json({ error: 'dealerId is required' });
    }
    let fieApiToken = await getFieToken();
    if (!fieApiToken) {
      return res.status(500).json({ error: 'FIE token unavailable' });
    }

    const url = `${fieApiBaseUrl}/EX1ProviderList/apijson`;
    const buildBody = () => ({
      EX1ProviderListRequest: {
        EX1DealerID: dealerId
      }
    });

    async function doRequest(token) {
      const upstreamRes = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildBody())
      });
      const text = await upstreamRes.text();
      const isJson =
        upstreamRes.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false;
      const payload = isJson ? JSON.parse(text) : { raw: text };
      return { upstreamRes, payload };
    }

    let { upstreamRes, payload } = await doRequest(fieApiToken);
    if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
      return res.status(200).json(payload);
    }
    if (payloadIndicatesInvalidToken(payload) || upstreamRes.status === 401 || upstreamRes.status === 403) {
      const refreshed = await refreshTokenNow();
      if (refreshed) {
        ({ upstreamRes, payload } = await doRequest(refreshed));
        if (upstreamRes.ok && !payloadIndicatesInvalidToken(payload)) {
          return res.status(200).json(payload);
        }
      }
    }
    return res.status(upstreamRes.status || 500).json({
      error: 'Upstream request failed',
      status: upstreamRes.status || 500,
      details: payload
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}


