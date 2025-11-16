function getIsoNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

const STRING_FIELDS = [
  "name",
  "address",
  "address_2",
  "city",
  "zip_code",
  "phone",
  "fax",
  "email",
  "website",
  "dms_code",
  "dms_number",
  "legal_name",
  "dba_name",
];

const NUMERIC_FIELDS = ["state_id"];

const REQUIRED_STRING_FIELDS = ["name", "address", "city", "zip_code"];

const FIELD_LIMITS = {
  name: 128,
  address: 128,
  address_2: 128,
  city: 128,
  zip_code: 10,
  phone: 12,
  fax: 12,
  email: 128,
  website: 128,
  dms_code: 6,
  dms_number: 3,
  legal_name: 128,
  dba_name: 128,
};

const NULLABLE_FIELDS = new Set(["email", "dms_code", "legal_name", "dba_name"]);

const STATE_ABBREVIATION_TO_ID = {
  AL: 1,
  AK: 2,
  AZ: 4,
  AR: 5,
  CA: 6,
  CO: 8,
  CT: 9,
  DE: 10,
  DC: 11,
  FL: 12,
  GA: 13,
  HI: 15,
  ID: 16,
  IL: 17,
  IN: 18,
  IA: 19,
  KS: 20,
  KY: 21,
  LA: 22,
  ME: 23,
  MD: 24,
  MA: 25,
  MI: 26,
  MN: 27,
  MS: 28,
  MO: 29,
  MT: 30,
  NE: 31,
  NV: 32,
  NH: 33,
  NJ: 34,
  NM: 35,
  NY: 36,
  NC: 37,
  ND: 38,
  OH: 39,
  OK: 40,
  OR: 41,
  PA: 42,
  RI: 44,
  SC: 45,
  SD: 46,
  TN: 47,
  TX: 48,
  UT: 49,
  VT: 50,
  VA: 51,
  WA: 53,
  WV: 54,
  WI: 55,
  WY: 56,
};

function camelCase(key) {
  return key.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
}

function pickValue(source, keys) {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }
  return undefined;
}

function coerceString(value, fieldName, { required = false, maxLength } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }
  const stringValue = typeof value === "string" ? value : String(value);
  let trimmed = stringValue.trim();
  if (maxLength && trimmed.length > maxLength) {
    trimmed = trimmed.slice(0, maxLength);
  }
  if (required && trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  if (!required && trimmed.length === 0) {
    return "";
  }
  return trimmed;
}

function coerceNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeDealershipPayload(input, { forUpdate = false } = {}) {
  if (!input || typeof input !== "object") {
    throw new Error("Dealership payload must be an object");
  }

  const payload = {};

  const aliasMap = {
    address1: "address",
    address_1: "address",
    addressLine1: "address",
    address2: "address_2",
    address_2: "address_2",
    addressLine2: "address_2",
    zipCode: "zip_code",
    zip: "zip_code",
    phoneNumber: "phone",
    faxNumber: "fax",
    websiteUrl: "website",
    legalName: "legal_name",
    dbaName: "dba_name",
    stateId: "state_id",
  };

  const stateStringCandidates = [
    "state",
    "state_code",
    "stateCode",
    "state_abbreviation",
    "stateAbbreviation",
    "stateName",
  ];

  const rawStateString = (() => {
    for (const key of stateStringCandidates) {
      const value = input[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return undefined;
  })();

  const getValue = (field) => {
    const candidates = new Set([
      field,
      camelCase(field),
      field.toUpperCase(),
      field.toLowerCase(),
    ]);

    for (const [alias, actual] of Object.entries(aliasMap)) {
      if (actual === field) {
        candidates.add(alias);
        candidates.add(camelCase(alias));
      }
    }

    return pickValue(input, Array.from(candidates));
  };

  for (const field of STRING_FIELDS) {
    const required = !forUpdate && REQUIRED_STRING_FIELDS.includes(field);
    const value = getValue(field);
    if (value !== undefined || required) {
      payload[field] = coerceString(value, field, {
        required,
        maxLength: FIELD_LIMITS[field],
      });
    }
  }

  for (const field of NUMERIC_FIELDS) {
    const value = getValue(field);
    if (value !== undefined || !forUpdate) {
      payload[field] = coerceNumber(value, field);
    }
  }

  if (
    (payload.state_id === null || payload.state_id === undefined) &&
    rawStateString
  ) {
    const normalized =
      typeof rawStateString === "string"
        ? rawStateString.trim().toUpperCase()
        : String(rawStateString).trim().toUpperCase();
    if (STATE_ABBREVIATION_TO_ID[normalized] !== undefined) {
      payload.state_id = STATE_ABBREVIATION_TO_ID[normalized];
    }
  }

  return payload;
}

export function buildDealershipRecord(input) {
  const now = getIsoNow();
  const payload = normalizeDealershipPayload(input, { forUpdate: false });

  if (payload.state_id === null || payload.state_id === undefined) {
    throw new Error("state_id is required");
  }

  const optionalOrNull = (field) => {
    const value = payload[field];
    if (value === undefined || value === null) {
      return NULLABLE_FIELDS.has(field) ? null : "";
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return NULLABLE_FIELDS.has(field) ? null : "";
      }
      return trimmed;
    }
    return value;
  };

  return {
    name: optionalOrNull("name"),
    address: optionalOrNull("address"),
    address_2: optionalOrNull("address_2"),
    city: optionalOrNull("city"),
    state_id: payload.state_id,
    zip_code: optionalOrNull("zip_code"),
    phone: optionalOrNull("phone"),
    fax: optionalOrNull("fax"),
    email: optionalOrNull("email"),
    website: optionalOrNull("website"),
    dms_code: optionalOrNull("dms_code"),
    dms_number: optionalOrNull("dms_number"),
    legal_name: optionalOrNull("legal_name"),
    dba_name: optionalOrNull("dba_name"),
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

export function applyDealershipUpdates(existingRecord, updates = {}) {
  if (!existingRecord || typeof existingRecord !== "object") {
    throw new Error("existingRecord must be an object");
  }

  const normalized = normalizeDealershipPayload(updates, { forUpdate: true });

  return {
    ...existingRecord,
    ...normalized,
    updated_at: getIsoNow(),
  };
}

export function markDealershipDeleted(record) {
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


