import dotenv from 'dotenv';
import { getLpAccessToken } from '../services/lpAuth.service.js';

dotenv.config();

const lpApiBaseUrl =
  process.env.LP_API_BASE_URL || 'https://stage-lp-lending.testinglane.com';

export async function postCreateOrg(req, res) {
  try {
    const token = await getLpAccessToken();
    const url = `${lpApiBaseUrl}/api/v1/orgs`;
    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(req.body ?? {})
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

export async function putUpdateOrg(req, res) {
  try {
    const { dealerId } = req.params || {};
    if (!dealerId) {
      return res.status(400).json({ error: 'dealerId param is required' });
    }
    const token = await getLpAccessToken();
    const url = `${lpApiBaseUrl}/api/v1/orgs/${encodeURIComponent(dealerId)}`;
    const upstreamRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(req.body ?? {})
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

export async function postCreateAssociation(req, res) {
  try {
    const { dealerId, lender, orgId, ...rest } = req.body || {};
    if (!dealerId || !lender || !orgId) {
      return res.status(400).json({ error: 'dealerId, lender, and orgId are required in body' });
    }
    const token = await getLpAccessToken();
    const url = `${lpApiBaseUrl}/api/v1/orgs/${encodeURIComponent(
      dealerId
    )}/associations/${encodeURIComponent(lender)}/${encodeURIComponent(orgId)}`;
    const upstreamRes = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(Object.keys(rest).length ? rest : {})
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


