function normalizeForeignKey(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      throw new Error(`${fieldName} must not be NaN`);
    }
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      if (required) {
        throw new Error(`${fieldName} cannot be empty`);
      }
      return null;
    }
    return trimmed;
  }

  throw new Error(`${fieldName} must be a string or number`);
}

export function buildProductVehicleTypeRecord({ productId, vehicleTypeId }) {
  return {
    product_id: normalizeForeignKey(productId, "product_id", { required: true }),
    vehicle_type_id: normalizeForeignKey(vehicleTypeId, "vehicle_type_id", {
      required: true,
    }),
  };
}

export function applyProductVehicleTypeUpdates(existingRecord, updates = {}) {
  if (!existingRecord || typeof existingRecord !== "object") {
    throw new Error("existingRecord must be an object");
  }

  const normalized = {};

  if ("productId" in updates || "product_id" in updates) {
    normalized.product_id = normalizeForeignKey(
      updates.productId ?? updates.product_id,
      "product_id",
      { required: true }
    );
  }

  if ("vehicleTypeId" in updates || "vehicle_type_id" in updates) {
    normalized.vehicle_type_id = normalizeForeignKey(
      updates.vehicleTypeId ?? updates.vehicle_type_id,
      "vehicle_type_id",
      { required: true }
    );
  }

  if (Object.keys(normalized).length === 0) {
    return existingRecord;
  }

  return {
    ...existingRecord,
    ...normalized,
  };
}
