function getIsoNow() {
  return new Date().toISOString();
}

function validateForeignKey(value, fieldName) {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`${fieldName} must be a string or number`);
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be an empty string`);
  }
  return typeof value === 'string' ? value.trim() : value;
}

function validateExternalId(value) {
  if (value === undefined || value === null) {
    throw new Error("external_id is required");
  }

  if (typeof value !== "string") {
    value = String(value);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("external_id cannot be empty");
  }

  return trimmed;
}

export function buildVendorIntegrationRecord({
  vendorId,
  integrationId,
  externalId,
}) {
  const now = getIsoNow();
  return {
    vendor_id: validateForeignKey(vendorId, "vendor_id"),
    integration_id: validateForeignKey(integrationId, "integration_id"),
    external_id: validateExternalId(externalId),
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

export function applyVendorIntegrationUpdates(existingRecord, updates = {}) {
  if (!existingRecord || typeof existingRecord !== "object") {
    throw new Error("existingRecord must be an object");
  }

  const next = { ...existingRecord };
  let updated = false;

  if ("vendorId" in updates || "vendor_id" in updates) {
    next.vendor_id = validateForeignKey(
      updates.vendorId ?? updates.vendor_id,
      "vendor_id"
    );
    updated = true;
  }

  if ("integrationId" in updates || "integration_id" in updates) {
    next.integration_id = validateForeignKey(
      updates.integrationId ?? updates.integration_id,
      "integration_id"
    );
    updated = true;
  }

  if ("externalId" in updates || "external_id" in updates) {
    next.external_id = validateExternalId(
      updates.externalId ?? updates.external_id
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

export function updateVendorIntegrationExternalId(record, externalId) {
  return applyVendorIntegrationUpdates(record, { externalId });
}

export function markVendorIntegrationDeleted(record) {
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




