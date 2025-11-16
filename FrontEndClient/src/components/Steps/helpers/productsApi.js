// API helper functions for products-related operations

/**
 * Fetch available vendors/providers for a dealer
 * @param {string} dealerId - The dealer ID
 * @returns {Promise<Array>} Array of vendor objects
 */
export const fetchVendors = async (dealerId) => {
  const response = await fetch("/api/ex1/provider-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealerId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vendors: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform the API response to match expected format
  // The API returns vendors in EX1ProviderListResponse.Providers.Provider structure
  if (data?.EX1ProviderListResponse?.Providers?.Provider) {
    return data.EX1ProviderListResponse.Providers.Provider.map((provider) => ({
      id: provider.EX1ProviderID || provider.id,
      name:
        provider.ProviderName ||
        provider.name ||
        `Provider ${provider.EX1ProviderID || provider.id}`,
    }));
  }

  // Fallback: if the structure is different, return empty array or handle accordingly
  return [];
};

/**
 * Import products that are common between dealer and selected vendors
 * @param {string} dealerId - The dealer ID
 * @param {Array<string>} vendorIds - Array of selected vendor IDs
 * @returns {Promise<Object>} Response containing common products
 */
export const importProducts = async (dealerId, vendorIds) => {
  const response = await fetch("/api/ex1/import-products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dealerId, vendorIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to import products: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch static products for configuration (fallback/mock data)
 * @returns {Promise<Array>} Array of static product objects
 */
export const fetchStaticProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { id: "prod1", name: "Premium Extended Warranty", category: "Warranty" },
    { id: "prod2", name: "GAP Insurance", category: "Insurance" },
    { id: "prod3", name: "Paint & Fabric Protection", category: "Protection" },
    { id: "prod4", name: "Tire & Wheel Coverage", category: "Protection" },
    { id: "prod5", name: "Maintenance Package", category: "Maintenance" },
    { id: "prod6", name: "Road Hazard Protection", category: "Protection" },
  ];
};

/**
 * Transform imported products to match the expected format for the UI
 * @param {Array} importedProducts - Products from the import API response
 * @returns {Array} Transformed products
 */
export const transformImportedProducts = (importedProducts) => {
  return importedProducts.map((product) => ({
    id: product.EX1ProductID,
    name: product.ProductName,
    category: product.ProductCode || "General",
    vendors: product.vendors || [], // Include vendors array
  }));
};
