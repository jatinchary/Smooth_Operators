function getIsoNow() {
  return new Date().toISOString();
}

const BOOLEAN_FIELDS = [
  "available_amazon",
  "available_online",
  "contracting_disabled",
  "different_tax_percent",
  "residualize",
  "show_graph",
  "taxable",
  "vendor_all_plans",
  "vendor_auto_pull",
  "vendor_pull_rates",
  "verify_dealer_cost",
];

const NUMERIC_FIELDS = [
  "cost",
  "custom_fee_type",
  "dealership_id",
  "dms_field_type_id",
  "dms_field_type_lease_id",
  "equipment_residualizable_id",
  "integration_id",
  "order",
  "pack",
  "product_category_id",
  "retail_markup",
  "type_id",
  "updated_by",
  "vendor_id",
  "vendor_product_id",
];

const STRING_FIELDS = [
  "description",
  "dms_key",
  "ext_vendor_id",
  "ext_vendor_name",
  "iframe_url",
  "icon",
  "more_info_link",
  "name",
  "subtitle",
  "photo",
  "uuid",
];

const BOOLEAN_DEFAULTS = {
  available_amazon: false,
  available_online: false,
  contracting_disabled: false,
  different_tax_percent: false,
  residualize: false,
  vendor_auto_pull: false,
};

const NUMERIC_DEFAULTS = {
  custom_fee_type: 0,
  equipment_residualizable_id: 0,
};

const REQUIRED_BOOLEAN_FIELDS = new Set([
  "show_graph",
  "taxable",
  "vendor_all_plans",
  "vendor_pull_rates",
  "verify_dealer_cost",
]);

const REQUIRED_NUMERIC_FIELDS = new Set([
  "cost",
  "dealership_id",
  "order",
  "type_id",
  "vendor_id",
]);

const REQUIRED_STRING_FIELDS = new Set(["icon", "name"]);

function coerceBoolean(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      throw new Error(`${fieldName} must not be NaN`);
    }
    return value !== 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "true" || trimmed === "1") {
      return true;
    }
    if (trimmed === "false" || trimmed === "0") {
      return false;
    }
  }

  throw new Error(`${fieldName} must be a boolean-compatible value`);
}

function coerceNumber(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldName} must be numeric`);
  }

  return parsed;
}

function coerceString(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value !== "string") {
    value = String(value);
  }

  const trimmed = value.trim();

  if (required && trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }

  return trimmed.length > 0 ? trimmed : null;
}

function pickValue(source, keys) {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }
  return undefined;
}

function normalizeProductPayload(input, { forUpdate = false } = {}) {
  if (!input || typeof input !== "object") {
    throw new Error("Product payload must be an object");
  }

  const payload = {};

  for (const field of BOOLEAN_FIELDS) {
    const value = pickValue(input, [field, camelCase(field)]);
    const isRequired = REQUIRED_BOOLEAN_FIELDS.has(field);
    if (value !== undefined) {
      payload[field] = coerceBoolean(value, field, {
        required: !forUpdate && isRequired,
      });
    } else if (!forUpdate) {
      if (isRequired) {
        throw new Error(`${field} is required`);
      }
      if (Object.prototype.hasOwnProperty.call(BOOLEAN_DEFAULTS, field)) {
        payload[field] = BOOLEAN_DEFAULTS[field];
      }
    }
  }

  for (const field of NUMERIC_FIELDS) {
    const value = pickValue(input, [field, camelCase(field)]);
    const isRequired = REQUIRED_NUMERIC_FIELDS.has(field);
    if (value !== undefined) {
      payload[field] = coerceNumber(value, field, {
        required: !forUpdate && isRequired,
      });
    } else if (!forUpdate) {
      if (isRequired) {
        throw new Error(`${field} is required`);
      }
      if (Object.prototype.hasOwnProperty.call(NUMERIC_DEFAULTS, field)) {
        payload[field] = NUMERIC_DEFAULTS[field];
      }
    }
  }

  for (const field of STRING_FIELDS) {
    const value = pickValue(input, [field, camelCase(field)]);
    const isRequired = REQUIRED_STRING_FIELDS.has(field);
    if (value !== undefined || (!forUpdate && isRequired)) {
      payload[field] = coerceString(value, field, {
        required: !forUpdate && isRequired,
      });
    }
  }

  return payload;
}

function camelCase(snake) {
  return snake.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function buildProductRecord(input) {
  const now = getIsoNow();
  const payload = normalizeProductPayload(input, { forUpdate: false });

  return {
    uuid: payload.uuid ?? null,
    created_at: now,
    updated_at: now,
    updated_by: payload.updated_by ?? null,
    deleted_at: null,
    name: payload.name,
    subtitle: payload.subtitle ?? null,
    product_category_id: payload.product_category_id ?? null,
    description: payload.description ?? null,
    ext_vendor_id: payload.ext_vendor_id ?? null,
    ext_vendor_name: payload.ext_vendor_name ?? null,
    integration_id: payload.integration_id ?? null,
    vendor_id: payload.vendor_id,
    vendor_pull_rates: payload.vendor_pull_rates,
    vendor_auto_pull: payload.vendor_auto_pull ?? false,
    vendor_product_id: payload.vendor_product_id ?? null,
    vendor_all_plans: payload.vendor_all_plans,
    contracting_disabled: payload.contracting_disabled ?? false,
    available_online: payload.available_online ?? false,
    available_amazon: payload.available_amazon ?? false,
    cost: payload.cost,
    taxable: payload.taxable,
    different_tax_percent: payload.different_tax_percent ?? false,
    custom_fee_type: payload.custom_fee_type ?? 0,
    type_id: payload.type_id,
    dealership_id: payload.dealership_id,
    icon: payload.icon,
    photo: payload.photo ?? null,
    iframe_url: payload.iframe_url ?? null,
    more_info_link: payload.more_info_link ?? null,
    show_graph: payload.show_graph,
    residualize: payload.residualize ?? false,
    equipment_residualizable_id: payload.equipment_residualizable_id ?? 0,
    dms_key: payload.dms_key ?? null,
    dms_field_type_id: payload.dms_field_type_id ?? null,
    dms_field_type_lease_id: payload.dms_field_type_lease_id ?? null,
    order: payload.order,
    verify_dealer_cost: payload.verify_dealer_cost,
    pack: payload.pack ?? null,
    retail_markup: payload.retail_markup ?? null,
  };
}

export function applyProductUpdates(existingRecord, updates = {}) {
  if (!existingRecord || typeof existingRecord !== "object") {
    throw new Error("existingRecord must be an object");
  }

  const normalized = normalizeProductPayload(updates, { forUpdate: true });

  return {
    ...existingRecord,
    ...normalized,
    updated_at: getIsoNow(),
  };
}

export function markProductDeleted(record) {
  if (!record || typeof record !== "object") {
    throw new Error("record must be an object");
  }

  const now = getIsoNow();

  return {
    ...record,
    deleted_at: now,
    updated_at: now,
  };
}


