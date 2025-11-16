// Vendor "table" model with timestamps and name field
// This is a pure model helper; persistence is intentionally not implemented here.

function getIsoNow() {
  return new Date().toISOString();
}

function coerceBoolean(value, fieldName) {
  if (value === undefined || value === null) {
    return false;
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

export function validateVendorName(name) {
  if (typeof name !== "string") {
    throw new Error("Vendor name must be a string");
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Vendor name cannot be empty");
  }
  return trimmed;
}

export function buildVendorRecord({ name, requiresRateBook }) {
  const validName = validateVendorName(name);
  const now = getIsoNow();
  return {
    name: validName,
    requires_rate_book: coerceBoolean(requiresRateBook, "requires_rate_book"),
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

export function applyVendorUpdates(existingRecord, updates = {}) {
  if (!existingRecord || typeof existingRecord !== "object") {
    throw new Error("existingRecord must be an object");
  }

  const next = { ...existingRecord };
  let updated = false;

  if ("name" in updates) {
    next.name = validateVendorName(updates.name);
    updated = true;
  }

  if ("requiresRateBook" in updates || "requires_rate_book" in updates) {
    next.requires_rate_book = coerceBoolean(
      updates.requiresRateBook ?? updates.requires_rate_book,
      "requires_rate_book"
    );
    updated = true;
  }

  if (!updated) {
    return existingRecord;
  }

  return {
    ...next,
    updated_at: getIsoNow(),
  };
}

export function markVendorDeleted(record) {
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


