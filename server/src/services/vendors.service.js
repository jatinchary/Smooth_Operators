import { query } from "../services/database.service.js";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ex1_provider_id VARCHAR(191) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    city VARCHAR(255),
    state_province VARCHAR(255),
    country VARCHAR(3),
    postal_code VARCHAR(32),
    raw_payload JSON,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uniq_ex1_provider_id (ex1_provider_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const UPSERT_VENDOR_SQL = `
  INSERT INTO vendors (
    ex1_provider_id,
    provider_name,
    address_line1,
    address_line2,
    address_line3,
    city,
    state_province,
    country,
    postal_code,
    raw_payload,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?)
  ON DUPLICATE KEY UPDATE
    provider_name = VALUES(provider_name),
    address_line1 = VALUES(address_line1),
    address_line2 = VALUES(address_line2),
    address_line3 = VALUES(address_line3),
    city = VALUES(city),
    state_province = VALUES(state_province),
    country = VALUES(country),
    postal_code = VALUES(postal_code),
    raw_payload = VALUES(raw_payload),
    updated_at = VALUES(updated_at);
`;

function normalizeString(value, fallback = null) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeCountry(value) {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return normalized.slice(0, 3).toUpperCase();
}

function buildPayloadRecord(vendor) {
  const now = new Date();
  const isoNow = now.toISOString().slice(0, 19).replace("T", " ");

  const address = vendor?.address ?? {};

  return {
    params: [
      normalizeString(vendor?.ex1ProviderId || vendor?.EX1ProviderID),
      normalizeString(vendor?.providerName || vendor?.ProviderName) ?? "Unknown vendor",
      normalizeString(address.AddressLine1),
      normalizeString(address.AddressLine2),
      normalizeString(address.AddressLine3),
      normalizeString(address.City),
      normalizeString(address.StateProvince),
      normalizeCountry(address.Country),
      normalizeString(address.PostalCode),
      JSON.stringify(vendor?.raw ?? vendor ?? {}),
      isoNow,
      isoNow,
    ],
  };
}

export async function ensureVendorsTable() {
  await query(CREATE_TABLE_SQL);
}

export async function upsertVendors(vendors = []) {
  if (!Array.isArray(vendors) || vendors.length === 0) {
    return { inserted: 0, updated: 0, skipped: vendors.length };
  }

  await ensureVendorsTable();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const processedIds = [];

  for (const vendor of vendors) {
    const { params } = buildPayloadRecord(vendor);
    const providerId = params[0];
    if (!providerId) {
      skipped += 1;
      console.warn("Skipping vendor with missing provider id", vendor);
      continue;
    }

    const { rows } = await query(UPSERT_VENDOR_SQL, params);
    const result = rows;

    if (result?.affectedRows === 1) {
      inserted += 1;
    } else if (result?.affectedRows === 2) {
      updated += 1;
    } else {
      skipped += 1;
      console.warn("Unexpected result when saving vendor", { providerId, result });
    }
    processedIds.push(providerId);
  }

  let savedVendors = [];
  if (processedIds.length > 0) {
    const placeholders = processedIds.map(() => "?").join(", ");
    const selectSql = `
      SELECT id, ex1_provider_id as ex1ProviderId, provider_name as providerName
      FROM vendors
      WHERE ex1_provider_id IN (${placeholders})
    `;
    const { rows } = await query(selectSql, processedIds);
    savedVendors = rows;
  }

  return { inserted, updated, skipped, saved: savedVendors };
}

function normalizeExternalId(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function findVendorIntegrationsByExternalIds(externalIds = []) {
  if (!Array.isArray(externalIds) || externalIds.length === 0) {
    return [];
  }

  const sanitized = Array.from(
    new Set(
      externalIds
        .map(normalizeExternalId)
        .filter(Boolean)
    )
  );

  if (sanitized.length === 0) {
    return [];
  }

  const placeholders = sanitized.map(() => "?").join(", ");
  const sql = `
    SELECT
      vi.external_id AS externalId,
      vi.vendor_id AS vendorId,
      vi.integration_id AS integrationId,
      v.id AS vendorTableId,
      v.ex1_provider_id AS ex1ProviderId,
      v.provider_name AS providerName
    FROM vendor_integrations AS vi
    INNER JOIN vendors AS v ON v.id = vi.vendor_id
    WHERE vi.external_id IN (${placeholders})
  `;

  const { rows } = await query(sql, sanitized);
  return rows;
}


