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
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error('external_id must be a string if provided');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error('external_id cannot be an empty string');
  }
  return trimmed;
}

export function buildVendorIntegrationRecord({ vendorId, integrationId, externalId }) {
  const now = getIsoNow();
  return {
    vendor_id: validateForeignKey(vendorId, 'vendor_id'),
    integration_id: validateForeignKey(integrationId, 'integration_id'),
    external_id: validateExternalId(externalId),
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
}

export function updateVendorIntegrationExternalId(record, externalId) {
  return {
    ...record,
    external_id: validateExternalId(externalId),
    updated_at: getIsoNow()
  };
}

export function markVendorIntegrationDeleted(record) {
  const now = getIsoNow();
  return {
    ...record,
    deleted_at: now,
    updated_at: now
  };
}




