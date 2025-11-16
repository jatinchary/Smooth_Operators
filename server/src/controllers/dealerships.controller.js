import { listDealerships, getDealershipById, createDealership } from "../services/dealerships.service.js";

function buildDealershipResponse(dealership) {
  if (!dealership) {
    return null;
  }

  const {
    id,
    name,
    legalName,
    dbaName,
    displayName,
    website,
    email,
    phone,
    fax,
    address1,
    address2,
    city,
    state,
    zipCode,
    country,
    stateId,
    dmsCode,
    dmsNumber,
  } = dealership;

  return {
    id,
    name: name ?? "",
    legalName: legalName ?? "",
    dbaName: dbaName ?? "",
    displayName,
    website: website ?? "",
    email: email ?? "",
    phone: phone ?? "",
    fax: fax ?? "",
    address1: address1 ?? "",
    address2: address2 ?? "",
    city: city ?? "",
    state: state ?? "",
    zipCode: zipCode ?? "",
    country: country ?? "",
    stateId: stateId ?? null,
    dmsCode: dmsCode ?? "",
    dmsNumber: dmsNumber ?? "",
  };
}

export async function listDealershipsHandler(req, res, next) {
  try {
    const dealerships = await listDealerships();
    const payload = (dealerships ?? []).map((dealership) => buildDealershipResponse(dealership));
    res.json({ dealerships: payload });
  } catch (error) {
    next(error);
  }
}

export async function getDealershipHandler(req, res, next) {
  try {
    const { dealershipId } = req.params;

    if (!dealershipId) {
      return res.status(400).json({ error: "dealershipId parameter is required" });
    }

    const dealership = await getDealershipById(dealershipId);

    if (!dealership) {
      return res.status(404).json({ error: "Dealership not found" });
    }

    res.json({ dealership: buildDealershipResponse(dealership) });
  } catch (error) {
    next(error);
  }
}

export async function createDealershipHandler(req, res, next) {
  try {
    const dealership = await createDealership(req.body || {});
    res.status(201).json({ dealership: buildDealershipResponse(dealership) });
  } catch (error) {
    if (error && typeof error === "object") {
      if (error.code === "ER_DATA_TOO_LONG") {
        return res
          .status(400)
          .json({ error: "One or more fields exceed the allowed length." });
      }
      if (error.code === "ER_BAD_NULL_ERROR") {
        return res
          .status(400)
          .json({ error: "Missing required dealership fields." });
      }
      if (error.code === "ER_TRUNCATED_WRONG_VALUE") {
        return res.status(400).json({
          error:
            error.sqlMessage ||
            "Invalid value provided for a dealership field.",
        });
      }
      if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
        return res.status(400).json({
          error:
            error.sqlMessage ||
            "Invalid value provided for a dealership field.",
        });
      }
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res
          .status(400)
          .json({ error: "Invalid state supplied for the dealership." });
      }
      if (error.sqlMessage) {
        return res.status(400).json({ error: error.sqlMessage });
      }
    }
    if (error instanceof Error && /required/i.test(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}





