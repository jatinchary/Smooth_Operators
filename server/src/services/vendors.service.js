import { query } from "../services/database.service.js";

function normalizeString(value, fallback = null) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

const vendorSchemaCache = new Map();

function getMysqlNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function resolveColumn(schema, candidates = []) {
  if (!schema) return null;
  for (const name of candidates) {
    if (!name) continue;
    const column = schema.columnMap.get(name.toLowerCase());
    if (column) {
      return column;
    }
  }
  return null;
}

async function getVendorsSchema() {
  if (vendorSchemaCache.has("vendors")) {
    return vendorSchemaCache.get("vendors");
  }

  try {
    const { rows: columns = [] } = await query("SHOW COLUMNS FROM vendors");
    const columnMap = new Map();
    const primaryKeys = [];

    for (const column of columns) {
      if (!column?.Field) continue;
      const lower = column.Field.toLowerCase();
      columnMap.set(lower, column.Field);
      if (column.Key === "PRI") {
        primaryKeys.push(column.Field);
      }
    }

    const schema = { columnMap, primaryKeys };
    vendorSchemaCache.set("vendors", schema);
    return schema;
  } catch (error) {
    console.warn("Unable to inspect vendors table schema", error.message);
    vendorSchemaCache.set("vendors", null);
    return null;
  }
}

export async function ensureVendorsTable() {
  // Tables and default values are managed externally (legacy schema).
  // No-op to avoid unintended schema changes.
  return;
}

export async function upsertVendors(vendors = []) {
  if (!Array.isArray(vendors) || vendors.length === 0) {
    return { inserted: 0, updated: 0, skipped: vendors.length, saved: [] };
  }

  const schema = await getVendorsSchema();
  if (!schema) {
    console.warn(
      "Skipping vendor snapshot persistence; unable to inspect vendors table schema."
    );
    return { inserted: 0, updated: 0, skipped: vendors.length, saved: [] };
  }

  const idColumn = resolveColumn(schema, [
    "ex1_provider_id",
    "ex1providerid",
    "provider_id",
    "providerid",
    "external_id",
    "externalid",
    "id",
  ]);

  if (!idColumn) {
    console.warn(
      "Skipping vendor snapshot persistence; vendors table lacks an EX1 provider identifier column."
    );
    return { inserted: 0, updated: 0, skipped: vendors.length, saved: [] };
  }

  const providerNameColumn = resolveColumn(schema, [
    "provider_name",
    "providername",
  ]);
  const vendorNameColumn = resolveColumn(schema, [
    "name",
    "vendor_name",
    "vendorname",
  ]);
  const createdAtColumn = resolveColumn(schema, ["created_at", "createdat"]);
  const updatedAtColumn = resolveColumn(schema, ["updated_at", "updatedat"]);
  const primaryKeyColumn =
    (schema.primaryKeys && schema.primaryKeys[0]) || "id";

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const processedIds = [];
  const now = getMysqlNow();

  for (const vendor of vendors) {
    const providerId = normalizeString(
      vendor?.ex1ProviderId || vendor?.EX1ProviderID
    );
    if (!providerId) {
      skipped += 1;
      console.warn("Skipping vendor with missing provider id", vendor);
      continue;
    }

    const providerName =
      normalizeString(vendor?.providerName || vendor?.ProviderName) ??
      "Unknown vendor";

    let existingRow = null;
    try {
      const { rows } = await query(
        `SELECT ${primaryKeyColumn} FROM vendors WHERE ${idColumn} = ? LIMIT 1`,
        [providerId]
      );
      existingRow = rows && rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Failed to inspect vendors table before upsert", {
        providerId,
        error,
      });
      skipped += 1;
      continue;
    }

    if (existingRow) {
      const updates = [];
      const values = [];

      if (providerNameColumn) {
        updates.push(`${providerNameColumn} = ?`);
        values.push(providerName);
      }
      if (vendorNameColumn) {
        updates.push(`${vendorNameColumn} = ?`);
        values.push(providerName);
      }
      if (updatedAtColumn) {
        updates.push(`${updatedAtColumn} = ?`);
        values.push(now);
      }

      if (updates.length > 0) {
        values.push(providerId);
        try {
          await query(
            `UPDATE vendors SET ${updates.join(
              ", "
            )} WHERE ${idColumn} = ?`,
            values
          );
          updated += 1;
        } catch (error) {
          console.error("Failed to update vendor snapshot row", {
            providerId,
            error,
          });
          skipped += 1;
          continue;
        }
      } else {
        skipped += 1;
      }
    } else {
      const columns = [idColumn];
      const placeholders = ["?"];
      const values = [providerId];

      if (providerNameColumn) {
        columns.push(providerNameColumn);
        placeholders.push("?");
        values.push(providerName);
      }
      if (vendorNameColumn) {
        columns.push(vendorNameColumn);
        placeholders.push("?");
        values.push(providerName);
      }
      if (createdAtColumn) {
        columns.push(createdAtColumn);
        placeholders.push("?");
        values.push(now);
      }
      if (updatedAtColumn) {
        columns.push(updatedAtColumn);
        placeholders.push("?");
        values.push(now);
      }

      try {
        await query(
          `INSERT INTO vendors (${columns.join(
            ", "
          )}) VALUES (${placeholders.join(", ")})`,
          values
        );
        inserted += 1;
      } catch (error) {
        console.error("Failed to insert vendor snapshot row", {
          providerId,
          error,
        });
        skipped += 1;
        continue;
      }
    }

    processedIds.push(providerId);
  }

  let savedVendors = [];
  if (processedIds.length > 0) {
    const placeholders = processedIds.map(() => "?").join(", ");
    const selectColumns = [
      `${primaryKeyColumn} AS id`,
      `${idColumn} AS ex1ProviderId`,
    ];
    if (providerNameColumn) {
      selectColumns.push(`${providerNameColumn} AS providerName`);
    }
    if (vendorNameColumn) {
      selectColumns.push(`${vendorNameColumn} AS vendorName`);
    }

    try {
      const { rows } = await query(
        `SELECT ${selectColumns.join(
          ", "
        )} FROM vendors WHERE ${idColumn} IN (${placeholders})`,
        processedIds
      );
      savedVendors =
        rows?.map((row) => ({
          id: row.id,
          ex1ProviderId: row.ex1ProviderId,
          providerName: row.providerName ?? row.ex1ProviderId,
          vendorName: row.vendorName ?? row.ex1ProviderId,
        })) ?? [];
    } catch (error) {
      console.error("Failed to load vendor snapshot rows", error);
    }
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

  const schema = await getVendorsSchema();
  if (!schema) {
    return [];
  }

  const idColumn = resolveColumn(schema, [
    "ex1_provider_id",
    "ex1providerid",
    "provider_id",
    "providerid",
    "external_id",
    "externalid",
    "id",
  ]);

  const nameColumn = resolveColumn(schema, [
    "provider_name",
    "providername",
    "name",
    "vendor_name",
    "vendorname",
  ]);

  const primaryKeyColumn =
    (schema.primaryKeys && schema.primaryKeys[0]) || "id";

  if (!idColumn) {
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
  const selectColumns = [
    `v.${primaryKeyColumn} AS vendorTableId`,
    `v.${idColumn} AS ex1ProviderId`,
  ];
  if (nameColumn) {
    selectColumns.push(`v.${nameColumn} AS providerName`);
  }

  const sql = `
    SELECT
      vi.external_id AS externalId,
      vi.vendor_id AS vendorId,
      vi.integration_id AS integrationId,
      ${selectColumns.join(", ")}
    FROM vendor_integrations AS vi
    INNER JOIN vendors AS v ON v.${primaryKeyColumn} = vi.vendor_id
    WHERE vi.external_id IN (${placeholders})
  `;

  const { rows } = await query(sql, sanitized);
  return rows;
}


