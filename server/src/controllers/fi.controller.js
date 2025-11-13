import dotenv from 'dotenv';

dotenv.config();

const fieApiBaseUrl =
  process.env.FIE_API_BASE_URL || 'https://uat-fandiexpress.app.coxautoinc.com/dspapi';
const fieApiToken = process.env.FIE_API_TOKEN;

export async function postDealerProduct(req, res) {
  try {
    const { dealerId } = req.body || {};
    if (!dealerId) {
      return res.status(400).json({ error: 'dealerId is required' });
    }
    if (!fieApiToken) {
      return res.status(500).json({ error: 'Server is missing FIE_API_TOKEN' });
    }

    const url = `${fieApiBaseUrl}/EX1DealerProduct/apijson`;
    const body = {
      EX1DealerProductRequest: {
        EX1DealerID: dealerId
      }
    };

    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fieApiToken}`
      },
      body: JSON.stringify(body)
    });

    const text = await upstreamRes.text();
    const isJson =
      upstreamRes.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false;
    const payload = isJson ? JSON.parse(text) : { raw: text };

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: 'Upstream request failed',
        status: upstreamRes.status,
        details: payload
      });
    }

    return res.status(200).json(payload);
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
    if (!fieApiToken) {
      return res.status(500).json({ error: 'Server is missing FIE_API_TOKEN' });
    }

    const url = `${fieApiBaseUrl}/EX1ProviderList/apijson`;
    const body = {
      EX1ProviderListRequest: {
        EX1DealerID: dealerId
      }
    };

    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fieApiToken}`
      },
      body: JSON.stringify(body)
    });

    const text = await upstreamRes.text();
    const isJson =
      upstreamRes.headers.get('content-type')?.toLowerCase().includes('application/json') ?? false;
    const payload = isJson ? JSON.parse(text) : { raw: text };

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: 'Upstream request failed',
        status: upstreamRes.status,
        details: payload
      });
    }

    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}


