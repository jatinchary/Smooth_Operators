import { query } from "../services/database.service.js";
import crypto from "node:crypto";
import { upsertVendors, ensureVendorsTable } from "./vendors.service.js";

function getMysqlNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

async function ensureProductsTable() {
  // Schema is managed externally.
  return;
}

async function ensureSnapshotTables() {
  await ensureProductsTable();
  await ensureVendorsTable();
}

function normalizeVendorList(products = []) {
  const map = new Map();
  for (const product of products) {
    if (!Array.isArray(product?.vendors)) continue;
    for (const vendor of product.vendors) {
      const id = vendor?.id;
      if (!id) continue;
      const key = String(id);
      if (!map.has(key)) {
        map.set(key, {
          ex1ProviderId: key,
          providerName: vendor?.name || "Unknown vendor",
        });
      }
    }
  }
  return Array.from(map.values());
}

function buildVendorIdMap(savedResults = []) {
  const map = new Map();
  for (const vendor of savedResults) {
    if (!vendor?.ex1ProviderId) continue;
    map.set(String(vendor.ex1ProviderId), vendor.id);
  }
  return map;
}

const tableSchemaCache = new Map();

function formatColumn(columnName) {
  if (!columnName) return "";
  const safe = String(columnName).replace(/`/g, "``");
  return `\`${safe}\``;
}

async function getTableSchema(tableName) {
  if (tableSchemaCache.has(tableName)) {
    return tableSchemaCache.get(tableName);
  }

  try {
    const { rows: columns = [] } = await query(`SHOW COLUMNS FROM ${tableName}`);
    const columnMap = new Map();
    const primaryKeys = [];
    for (const column of columns) {
      const lower = column.Field.toLowerCase();
      columnMap.set(lower, column.Field);
      if (column.Key === "PRI") {
        primaryKeys.push(column.Field);
      }
    }

    let uniqueColumns = new Set();
    try {
      const { rows: indexes = [] } = await query(`SHOW INDEX FROM ${tableName}`);
      uniqueColumns = new Set(
        indexes
          .filter((index) => index.Non_unique === 0 && index.Column_name)
          .map((index) => index.Column_name.toLowerCase())
      );
    } catch (error) {
      console.warn(`Unable to inspect indexes for table ${tableName}`, error);
    }

    const schema = {
      columnMap,
      primaryKeys,
      uniqueColumns,
    };
    tableSchemaCache.set(tableName, schema);
    return schema;
  } catch (error) {
    console.warn(
      `Unable to inspect schema for table ${tableName}`,
      error.message || error
    );
    tableSchemaCache.set(tableName, null);
    return null;
  }
}

function resolveColumn(schema, candidates = []) {
  for (const name of candidates) {
    const column = schema.columnMap.get(name.toLowerCase());
    if (column) {
      return column;
    }
  }
  return null;
}

function hasUniqueConstraint(schema, columnName) {
  if (!schema || !columnName) return false;
  return schema.uniqueColumns.has(columnName.toLowerCase());
}

async function upsertProduct(product, { dealerId, integration, primaryVendorId }) {
  const schema = await getTableSchema("products");
  if (!schema) {
    console.warn("Skipping product snapshot; unable to inspect products table schema.");
    return null;
  }

  const productIdColumn = resolveColumn(schema, [
    "ex1_product_id",
    "ex1productid",
    "product_id",
    "productid",
    "ext_vendor_id",
    "extvendorid",
  ]);

  if (!productIdColumn) {
    console.warn(
      "Skipping product snapshot persistence; products table is missing an identifiable EX1 product column.",
      { productId: product.EX1ProductID }
    );
    return null;
  }

  const productNameColumn = resolveColumn(schema, [
    "product_name",
    "productname",
    "name",
  ]);
  const productCodeColumn = resolveColumn(schema, [
    "product_code",
    "productcode",
    "code",
  ]);
  const dealerColumn = resolveColumn(schema, [
    "dealer_id",
    "dealerid",
    "dealer",
  ]);
  const integrationColumn = resolveColumn(schema, [
    "integration",
    "product_integration",
  ]);
  const vendorColumn = resolveColumn(schema, [
    "vendor_id",
    "vendorid",
    "vendor",
    "primary_vendor_id",
    "primaryvendorid",
  ]);
  const dealerFkColumn = resolveColumn(schema, [
    "dealership_id",
    "dealershipid",
  ]);
  const vendorPullRatesColumn = resolveColumn(schema, [
    "vendor_pull_rates",
    "vendorpullrates",
  ]);
  const vendorAllPlansColumn = resolveColumn(schema, [
    "vendor_all_plans",
    "vendorallplans",
  ]);
  const costColumn = resolveColumn(schema, [
    "cost",
  ]);
  const taxableColumn = resolveColumn(schema, [
    "taxable",
  ]);
  const typeIdColumn = resolveColumn(schema, [
    "type_id",
    "typeid",
  ]);
  const iconColumn = resolveColumn(schema, [
    "icon",
  ]);
  const showGraphColumn = resolveColumn(schema, [
    "show_graph",
    "showgraph",
  ]);
  const orderColumn = resolveColumn(schema, [
    "order",
    "display_order",
    "displayorder",
  ]);
  const verifyDealerCostColumn = resolveColumn(schema, [
    "verify_dealer_cost",
    "verifydealercost",
  ]);
  const uuidColumn = resolveColumn(schema, ["uuid"]);
  const createdAtColumn = resolveColumn(schema, ["created_at", "createdat"]);
  const updatedAtColumn = resolveColumn(schema, ["updated_at", "updatedat"]);

  if (vendorColumn && primaryVendorId == null) {
    console.warn(
      "Skipping product snapshot persistence; vendor_id column requires a value but no matching vendor was found.",
      { productId: product.EX1ProductID }
    );
    return null;
  }

  const usedColumns = new Set([productIdColumn]);
  const columnList = [productIdColumn];
  const placeholderList = ["?"];
  const values = [product.EX1ProductID];
  const updateAssignments = [];

  const now = getMysqlNow();

  function addColumn(columnName, value, { includeInUpdate = true } = {}) {
    if (!columnName || usedColumns.has(columnName)) {
      return;
    }
    usedColumns.add(columnName);
    columnList.push(columnName);
    placeholderList.push("?");
    values.push(value);
    if (includeInUpdate && columnName !== productIdColumn) {
      const formatted = formatColumn(columnName);
      updateAssignments.push(`${formatted} = VALUES(${formatted})`);
    }
  }

  addColumn(productNameColumn, product.ProductName || "Unnamed Product");
  addColumn(productCodeColumn, product.ProductCode || null);
  addColumn(dealerColumn, dealerId || null);
  if (dealerFkColumn) {
    addColumn(dealerFkColumn, dealerId || 11);
  }
  addColumn(integrationColumn, integration || null);
  if (vendorColumn && primaryVendorId != null) {
    addColumn(vendorColumn, primaryVendorId);
  }
  if (vendorPullRatesColumn) {
    addColumn(vendorPullRatesColumn, 1);
  }
  if (vendorAllPlansColumn) {
    addColumn(vendorAllPlansColumn, 0);
  }
  if (costColumn) {
    addColumn(costColumn, product.Cost ?? 9999);
  }
  if (taxableColumn) {
    addColumn(taxableColumn, product.Taxable ?? 0);
  }
  if (typeIdColumn) {
    addColumn(typeIdColumn, product.TypeID ?? 1);
  }
  if (iconColumn) {
    addColumn(iconColumn, product.Icon ?? "");
  }
  if (showGraphColumn) {
    addColumn(showGraphColumn, product.ShowGraph ?? 0);
  }
  if (orderColumn) {
    addColumn(orderColumn, product.Order ?? 4);
  }
  if (verifyDealerCostColumn) {
    addColumn(verifyDealerCostColumn, product.VerifyDealerCost ?? 0);
  }
  if (uuidColumn) {
    const uuidValue = product.UUID || crypto.randomUUID();
    addColumn(uuidColumn, uuidValue);
  }
  addColumn(updatedAtColumn, now);
  addColumn(createdAtColumn, now, { includeInUpdate: false });

  const formattedColumns = columnList.map(formatColumn);
  const insertSql = `INSERT INTO products (${formattedColumns.join(
    ", "
  )}) VALUES (${placeholderList.join(", ")})`;

  let finalSql = insertSql;
  if (hasUniqueConstraint(schema, productIdColumn)) {
    if (updateAssignments.length > 0) {
      finalSql = `${insertSql} ON DUPLICATE KEY UPDATE ${updateAssignments.join(
        ", "
      )}`;
    } else {
      const formattedId = formatColumn(productIdColumn);
      finalSql = `${insertSql} ON DUPLICATE KEY UPDATE ${formattedId} = VALUES(${formattedId})`;
    }
  }

  try {
    await query(finalSql, values);
  } catch (error) {
    console.error("Failed to upsert product snapshot", {
      productId: product.EX1ProductID,
      error,
    });
    return null;
  }

  const primaryKeyColumn =
    schema.primaryKeys && schema.primaryKeys.length > 0
      ? schema.primaryKeys[0]
      : productIdColumn;

  const selectSql = `SELECT ${formatColumn(primaryKeyColumn)} FROM products WHERE ${formatColumn(
    productIdColumn
  )} = ? LIMIT 1`;
  const { rows } = await query(selectSql, [product.EX1ProductID]);
  if (!rows || rows.length === 0) {
    console.warn(
      "Unable to locate product row after snapshot insert/update.",
      { productId: product.EX1ProductID }
    );
    return null;
  }
  return rows[0][primaryKeyColumn];
}

function mapVehicleTypeCode(code) {
  if (!code) return null;
  switch (String(code).toLowerCase()) {
    case "new":
      return 1;
    case "used":
      return 2;
    case "certified":
      return 3;
    default:
      return null;
  }
}

function mapDealTypeCode(code) {
  if (!code) return null;
  switch (String(code).toLowerCase()) {
    case "cash":
      return 1;
    case "finance":
      return 2;
    case "lease":
      return 3;
    default:
      return null;
  }
}

export async function persistProductsSnapshot({
  products = [],
  productConfigurations = [],
  dealerId,
  productIntegration,
}) {
  if (!Array.isArray(products) || products.length === 0) {
    return;
  }

  await ensureSnapshotTables();

  const vendorRecords = normalizeVendorList(products);
  let vendorIdMap = new Map();
  if (vendorRecords.length > 0) {
    const upsertResult = await upsertVendors(
      vendorRecords.map((vendor) => ({
        ex1ProviderId: vendor.ex1ProviderId,
        providerName: vendor.providerName,
      }))
    );
    vendorIdMap = buildVendorIdMap(upsertResult.saved || []);
  }

  const configMap = new Map();
  for (const config of productConfigurations) {
    if (!config?.productId) continue;
    configMap.set(String(config.productId), config);
  }

  for (const product of products) {
    if (!product?.EX1ProductID) {
      continue;
    }

    const vendorRelationships = [];
    let primaryVendorTableId = null;

    if (Array.isArray(product.vendors) && product.vendors.length > 0) {
      for (const vendor of product.vendors) {
        const vendorKey = vendor?.id ? String(vendor.id) : null;
        if (!vendorKey) continue;

        let vendorTableId = vendorIdMap.get(vendorKey);

        if (!vendorTableId) {
          const upsertResult = await upsertVendors([
            {
              ex1ProviderId: vendorKey,
              providerName: vendor?.name || "Unknown vendor",
            },
          ]);
          const saved = upsertResult.saved?.[0];
          if (saved?.ex1ProviderId) {
            vendorIdMap.set(String(saved.ex1ProviderId), saved.id);
            vendorTableId = saved.id;
          }
        }

        if (!vendorTableId) continue;

        if (primaryVendorTableId == null) {
          primaryVendorTableId = vendorTableId;
        }

        vendorRelationships.push({
          vendorTableId,
          vendorKey,
        });
      }
    }

    const now = getMysqlNow();

    const deferredVendorIntegrations = [];
    for (const relationship of vendorRelationships) {
      const persisted = await upsertVendorIntegrationRow({
        vendorId: relationship.vendorTableId,
        productPrimaryId: null,
        productExternalId: product.EX1ProductID,
        integration: productIntegration,
        timestamp: now,
      });
      if (!persisted) {
        deferredVendorIntegrations.push(relationship.vendorTableId);
      }
    }

    const productId = await upsertProduct(product, {
      dealerId,
      integration: productIntegration,
      primaryVendorId: primaryVendorTableId,
    });

    if (!productId) {
      continue;
    }

    for (const vendorTableId of deferredVendorIntegrations) {
      await upsertVendorIntegrationRow({
        vendorId: vendorTableId,
        productPrimaryId: productId,
        productExternalId: null,
        integration: productIntegration,
        timestamp: now,
      });
    }

    const config = configMap.get(String(product.EX1ProductID));
    if (config) {
      if (Array.isArray(config.vehicleTypes)) {
        for (const vehicleType of config.vehicleTypes) {
          const vehicleTypeId = mapVehicleTypeCode(vehicleType);
          if (!vehicleTypeId) continue;

          await upsertProductVehicleTypeRow({
            productId,
            vehicleTypeId,
            timestamp: now,
          });
        }
      }

      if (Array.isArray(config.dealTypes)) {
        for (const dealType of config.dealTypes) {
          const dealTypeId = mapDealTypeCode(dealType);
          if (!dealTypeId) continue;

          await upsertDealTypeProductRow({
            productId,
            dealTypeId,
            timestamp: now,
          });
        }
      }
    }
  }
}

async function upsertVendorIntegrationRow({
  vendorId,
  productPrimaryId,
  productExternalId,
  integration,
  timestamp,
}) {
  const schema = await getTableSchema("vendor_integrations");
  if (!schema) return false;

  const vendorColumn = resolveColumn(schema, [
    "vendor_id",
    "vendorid",
    "vendor",
  ]);
  const productPrimaryColumn = resolveColumn(schema, [
    "product_id",
    "productid",
    "product",
    "primary_product_id",
    "primaryproductid",
  ]);
  const productExternalColumn = resolveColumn(schema, [
    "product_uuid",
    "productuuid",
    "ex1_product_id",
    "ex1productid",
    "external_product_id",
    "externalproductid",
    "ext_vendor_id",
    "extvendorid",
  ]);
  const integrationColumn = resolveColumn(schema, [
    "integration",
    "product_integration",
  ]);
  const createdAtColumn = resolveColumn(schema, ["created_at", "createdat"]);
  const updatedAtColumn = resolveColumn(schema, ["updated_at", "updatedat"]);

  if (!vendorColumn) {
    console.warn(
      "Skipping vendor integration persistence; vendor column is missing.",
      { vendorColumn }
    );
    return false;
  }

  let chosenProductColumn = null;
  let productColumnValue = null;

  if (productExternalColumn && productExternalId != null) {
    chosenProductColumn = productExternalColumn;
    productColumnValue = productExternalId;
  } else if (productPrimaryColumn && productPrimaryId != null) {
    chosenProductColumn = productPrimaryColumn;
    productColumnValue = productPrimaryId;
  }

  if (!chosenProductColumn) {
    // Could not satisfy requirements yet (likely waiting on product primary id)
    return false;
  }

  try {
    const { rows } = await query(
      `SELECT ${formatColumn(chosenProductColumn)} FROM vendor_integrations WHERE ${formatColumn(
        vendorColumn
      )} = ? AND ${formatColumn(chosenProductColumn)} = ? LIMIT 1`,
      [vendorId, productColumnValue]
    );

    if (rows && rows.length > 0) {
      const updates = [];
      const values = [];

      if (integrationColumn) {
        updates.push(`${formatColumn(integrationColumn)} = ?`);
        values.push(integration || null);
      }
      if (updatedAtColumn) {
        updates.push(`${formatColumn(updatedAtColumn)} = ?`);
        values.push(timestamp);
      }

      if (updates.length > 0) {
        values.push(vendorId, productColumnValue);
        await query(
          `UPDATE vendor_integrations SET ${updates.join(
            ", "
          )} WHERE ${formatColumn(vendorColumn)} = ? AND ${formatColumn(
            chosenProductColumn
          )} = ?`,
          values
        );
      }
      return true;
    }
  } catch (error) {
    console.error("Failed to inspect vendor_integrations table", {
      vendorId,
      productId: productPrimaryId ?? productExternalId,
      error,
    });
    return false;
  }

  const columns = [vendorColumn, chosenProductColumn];
  const placeholders = ["?", "?"];
  const values = [vendorId, productColumnValue];

  if (integrationColumn) {
    columns.push(integrationColumn);
    placeholders.push("?");
    values.push(integration || null);
  }
  if (createdAtColumn) {
    columns.push(createdAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }
  if (updatedAtColumn) {
    columns.push(updatedAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }

  try {
    await query(
      `INSERT INTO vendor_integrations (${columns
        .map(formatColumn)
        .join(", ")}) VALUES (${placeholders.join(", ")})`,
      values
    );
    return true;
  } catch (error) {
    console.error("Failed to insert vendor integration snapshot row", {
      vendorId,
      productId: productPrimaryId ?? productExternalId,
      error,
    });
    return false;
  }
}

async function upsertProductVehicleTypeRow({
  productId,
  vehicleTypeId,
  timestamp,
}) {
  const schema = await getTableSchema("product_vehicle_types");
  if (!schema) return;

  const productColumn = resolveColumn(schema, [
    "product_id",
    "productid",
    "product",
  ]);
  const vehicleColumn = resolveColumn(schema, [
    "vehicle_type_id",
    "vehicletypeid",
    "vehicle_type",
  ]);

  if (!productColumn || !vehicleColumn) {
    console.warn(
      "Skipping product vehicle type persistence; required columns are missing."
    );
    return;
  }

  const createdAtColumn = resolveColumn(schema, ["created_at", "createdat"]);
  const updatedAtColumn = resolveColumn(schema, ["updated_at", "updatedat"]);

  try {
    const { rows } = await query(
      `SELECT ${vehicleColumn} FROM product_vehicle_types WHERE ${productColumn} = ? AND ${vehicleColumn} = ? LIMIT 1`,
      [productId, vehicleTypeId]
    );

    if (rows && rows.length > 0) {
      if (updatedAtColumn) {
        await query(
          `UPDATE product_vehicle_types SET ${formatColumn(updatedAtColumn)} = ? WHERE ${formatColumn(
            productColumn
          )} = ? AND ${formatColumn(vehicleColumn)} = ?`,
          [timestamp, productId, vehicleTypeId]
        );
      }
      return;
    }
  } catch (error) {
    console.error("Failed to inspect product_vehicle_types table", {
      productId,
      vehicleTypeId,
      error,
    });
    return;
  }

  const columns = [productColumn, vehicleColumn];
  const placeholders = ["?", "?"];
  const values = [productId, vehicleTypeId];

  if (createdAtColumn) {
    columns.push(createdAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }
  if (updatedAtColumn) {
    columns.push(updatedAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }

  try {
    await query(
      `INSERT INTO product_vehicle_types (${columns.join(
        ", "
      )}) VALUES (${placeholders.join(", ")})`,
      values
    );
  } catch (error) {
    console.error("Failed to insert product vehicle type snapshot row", {
      productId,
      vehicleTypeId,
      error,
    });
  }
}

async function upsertDealTypeProductRow({
  productId,
  dealTypeId,
  timestamp,
}) {
  const schema = await getTableSchema("deal_type_product");
  if (!schema) return;

  const productColumn = resolveColumn(schema, [
    "product_id",
    "productid",
    "product",
  ]);
  const dealTypeColumn = resolveColumn(schema, [
    "deal_type_id",
    "dealtypeid",
    "deal_type",
  ]);

  if (!productColumn || !dealTypeColumn) {
    console.warn(
      "Skipping deal type product persistence; required columns are missing."
    );
    return;
  }

  const createdAtColumn = resolveColumn(schema, ["created_at", "createdat"]);
  const updatedAtColumn = resolveColumn(schema, ["updated_at", "updatedat"]);

  try {
    const { rows } = await query(
      `SELECT ${dealTypeColumn} FROM deal_type_product WHERE ${productColumn} = ? AND ${dealTypeColumn} = ? LIMIT 1`,
      [productId, dealTypeId]
    );

    if (rows && rows.length > 0) {
      if (updatedAtColumn) {
        await query(
          `UPDATE deal_type_product SET ${formatColumn(updatedAtColumn)} = ? WHERE ${formatColumn(
            productColumn
          )} = ? AND ${formatColumn(dealTypeColumn)} = ?`,
          [timestamp, productId, dealTypeId]
        );
      }
      return;
    }
  } catch (error) {
    console.error("Failed to inspect deal_type_product table", {
      productId,
      dealTypeId,
      error,
    });
    return;
  }

  const columns = [productColumn, dealTypeColumn];
  const placeholders = ["?", "?"];
  const values = [productId, dealTypeId];

  if (createdAtColumn) {
    columns.push(createdAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }
  if (updatedAtColumn) {
    columns.push(updatedAtColumn);
    placeholders.push("?");
    values.push(timestamp);
  }

  try {
    await query(
      `INSERT INTO deal_type_product (${columns.join(
        ", "
      )}) VALUES (${placeholders.join(", ")})`,
      values
    );
  } catch (error) {
    console.error("Failed to insert deal type product snapshot row", {
      productId,
      dealTypeId,
      error,
    });
  }
}


