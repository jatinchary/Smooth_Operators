// Vendor "table" model with timestamps and name field
// This is a pure model helper; persistence is intentionally not implemented here.

function getIsoNow() {
  return new Date().toISOString();
}

export function validateVendorName(name) {
  if (typeof name !== 'string') {
    throw new Error('Vendor name must be a string');
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error('Vendor name cannot be empty');
  }
  return trimmed;
}

export function buildVendorRecord({ name }) {
  const validName = validateVendorName(name);
  const now = getIsoNow();
  return {
    name: validName,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };
}

export function updateVendorName(vendor, newName) {
  const validName = validateVendorName(newName);
  return {
    ...vendor,
    name: validName,
    updatedAt: getIsoNow()
  };
}

export function markVendorDeleted(vendor) {
  const now = getIsoNow();
  return {
    ...vendor,
    deletedAt: now,
    updatedAt: now
  };
}


