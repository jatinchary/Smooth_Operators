/**
 * Fetch list of dealerships for import dropdown.
 * @returns {Promise<Array<{id: string | number, name: string}>>}
 */
export const fetchDealershipOptions = async () => {
  const response = await fetch('/api/dealerships', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dealerships: ${response.statusText}`);
  }

  const data = await response.json();

  return (data?.dealerships ?? []).map((dealer) => ({
    id: dealer.id,
    name:
      dealer.displayName ||
      dealer.dbaName ||
      dealer.legalName ||
      `Dealership ${dealer.id}`,
  }));
};

/**
 * Fetch dealership general information details by id.
 * @param {string | number} dealershipId
 * @returns {Promise<Object>} Dealership details keyed to general info form.
 */
export const fetchDealershipDetails = async (dealershipId) => {
  if (!dealershipId) {
    throw new Error('dealershipId is required');
  }

  const response = await fetch(`/api/dealerships/${encodeURIComponent(dealershipId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dealership details: ${response.statusText}`);
  }

  const data = await response.json();
  const dealership = data?.dealership ?? {};

  return {
    legalName: dealership.legalName ?? '',
    dbaName: dealership.dbaName ?? '',
    website: dealership.website ?? '',
    phone: dealership.phone ?? '',
    fax: dealership.fax ?? '',
    email: dealership.email ?? '',
    address1: dealership.address1 ?? '',
    address2: dealership.address2 ?? '',
    city: dealership.city ?? '',
    state: dealership.state ?? '',
    stateId: dealership.stateId ?? null,
    zipCode: dealership.zipCode ?? '',
    country: dealership.country ?? '',
    dmsCode: dealership.dmsCode ?? '',
    dmsNumber: dealership.dmsNumber ?? '',
  };
};

export const saveDealership = async (payload) => {
  const response = await fetch('/api/dealerships', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to save dealership');
  }

  return await response.json();
};




