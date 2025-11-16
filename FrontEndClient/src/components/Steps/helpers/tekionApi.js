const API_BASE = "/api"; // Backend routes mounted under /api

export async function fetchDealerSettings(dealerId) {
  const response = await fetch(`${API_BASE}/deal/settings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealerId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dealer settings: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch dealer settings");
  }

  return result.data;
}

export async function fetchLenders(dealerId) {
  const response = await fetch(`${API_BASE}/lenders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealerId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lenders: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch lenders");
  }

  return result.data;
}

export async function fetchCreditAppLenders(dealerId) {
  const response = await fetch(`${API_BASE}/credit-app-lenders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealerId }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch credit app lenders: ${response.statusText}`
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch credit app lenders");
  }

  return result.data;
}
