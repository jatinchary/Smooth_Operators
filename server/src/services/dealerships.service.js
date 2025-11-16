import { query } from "../services/database.service.js";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS dealerships (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    name VARCHAR(128) COLLATE utf8mb3_unicode_ci NOT NULL,
    address VARCHAR(128) COLLATE utf8mb3_unicode_ci NOT NULL,
    address_2 VARCHAR(128) COLLATE utf8mb3_unicode_ci NOT NULL,
    city VARCHAR(128) COLLATE utf8mb3_unicode_ci NOT NULL,
    state_id INT NOT NULL,
    zip_code CHAR(10) COLLATE utf8mb3_unicode_ci NOT NULL,
    phone VARCHAR(12) COLLATE utf8mb3_unicode_ci NOT NULL,
    fax VARCHAR(12) COLLATE utf8mb3_unicode_ci NOT NULL,
    email VARCHAR(128) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
    website VARCHAR(128) COLLATE utf8mb3_unicode_ci NOT NULL,
    dms_code VARCHAR(6) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
    dms_number VARCHAR(3) COLLATE utf8mb3_unicode_ci NOT NULL,
    legal_name VARCHAR(128) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
    dba_name VARCHAR(128) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
    PRIMARY KEY (id),
    KEY dealerships_name_index (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
`;

const LIST_DEALERSHIPS_SQL = `
  SELECT *
  FROM dealerships
  WHERE deleted_at IS NULL
  ORDER BY
    name
`;

const GET_DEALERSHIP_SQL = `
  SELECT *
  FROM dealerships
  WHERE id = ?
    AND deleted_at IS NULL
  LIMIT 1
`;

export async function ensureDealershipsTable() {
  await query(CREATE_TABLE_SQL);
}

function normalizeString(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickValue(row, keys = []) {
  for (const key of keys) {
    if (key in row) {
      const normalized = normalizeString(row[key]);
      if (normalized) {
        return normalized;
      }
    }
  }
  return null;
}

function normalizeDealershipRow(row) {
  if (!row) {
    return null;
  }

  const legalName = pickValue(row, [
    "legal_name",
    "legalName",
    "dealership_legal_name",
    "dealershipLegalName",
    "name",
  ]);

  const dbaName = pickValue(row, [
    "dba_name",
    "dbaName",
    "doing_business_as",
    "doingBusinessAs",
  ]);

  const address1 = pickValue(row, [
    "address1",
    "address_1",
    "address_line1",
    "address_line_1",
    "address",
    "street1",
    "street",
  ]);

  const address2 = pickValue(row, [
    "address2",
    "address_2",
    "address_line2",
    "address_line_2",
    "street2",
    "suite",
  ]);

  const zipCode = pickValue(row, [
    "zip_code",
    "zip",
    "zipcode",
    "postal_code",
    "postcode",
  ]);

  const displayName =
    pickValue(row, ["display_name", "displayName", "name"]) ??
    dbaName ??
    legalName ??
    `Dealership ${row.id}`;

  const state =
    pickValue(row, [
      "state",
      "state_province",
      "stateCode",
      "state_code",
      "province",
    ]) ??
    (row.state_id !== undefined && row.state_id !== null
      ? String(row.state_id)
      : null);

  return {
    id: row.id,
    legalName,
    dbaName,
    displayName,
    website: pickValue(row, ["website", "web_site", "site_url", "url"]),
    email: pickValue(row, ["email", "email_address", "contact_email"]),
    phone: pickValue(row, ["phone", "phone_number", "contact_phone", "telephone"]),
    fax: pickValue(row, ["fax", "fax_number"]),
    address1,
    address2,
    city: pickValue(row, ["city", "locality"]),
    state,
    zipCode,
    country: pickValue(row, ["country", "country_code"]),
  };
}

export async function listDealerships() {
  await ensureDealershipsTable();
  const { rows } = await query(LIST_DEALERSHIPS_SQL);
  console.log('rows', rows)
  return rows.map(normalizeDealershipRow);
}

export async function getDealershipById(id) {
  await ensureDealershipsTable();
  const { rows } = await query(GET_DEALERSHIP_SQL, [id]);
  if (!rows || rows.length === 0) {
    return null;
  }
  return normalizeDealershipRow(rows[0]);
}

