import { listDealerships, getDealershipById } from "../services/dealerships.service.js";

function buildDealershipResponse(dealership) {
  if (!dealership) {
    return null;
  }

  const {
    id,
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
  } = dealership;

  return {
    id,
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




