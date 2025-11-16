import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  setProductIntegration,
  setDealerId,
  toggleVendor,
  toggleProduct,
  updateProductConfiguration,
} from "../../store/slices/productsSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import { Package, Download, Settings } from "lucide-react";

// API function to fetch vendors
const fetchVendors = async (dealerId) => {
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
  // Assuming the API returns vendors in a structure that needs mapping
  // Adjust this transformation based on actual API response structure
  if (data?.EX1ProviderListResponse?.Providers) {
    return data.EX1ProviderListResponse.Providers.map((provider) => ({
      id: provider.ProviderID || provider.id,
      name:
        provider.ProviderName ||
        provider.name ||
        `Provider ${provider.ProviderID || provider.id}`,
    }));
  }

  // Fallback: if the structure is different, return empty array or handle accordingly
  return [];
};

const fetchProducts = async () => {
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

const dealTypeOptions = ["Cash", "Finance", "Lease"];
const vehicleTypeOptions = ["New", "Used"];

// Static products for configuration display
const staticProducts = [
  { id: "config1", name: "Extended Warranty" },
  { id: "config2", name: "GAP Insurance" },
  { id: "config3", name: "Paint Protection" },
  { id: "config4", name: "Tire & Wheel" },
];

export default function Step3Products() {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);

  const [showVendors, setShowVendors] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors", productsState.dealerId],
    queryFn: () => fetchVendors(productsState.dealerId),
    enabled: Boolean(showVendors && productsState.dealerId),
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: showProducts,
  });

  const handleIntegrationChange = (value) => {
    dispatch(setProductIntegration(value));
  };

  const handleDealerIdChange = (e) => {
    dispatch(setDealerId(e.target.value));
  };

  const handleImportVendors = () => {
    setShowVendors(true);
  };

  const handleImportProducts = () => {
    setShowProducts(true);
  };

  const handleDealTypeToggle = (productId, dealType) => {
    const config = productsState.productConfigurations.find(
      (c) => c.productId === productId
    );
    const currentDealTypes = config?.dealTypes || [];

    const newDealTypes = currentDealTypes.includes(dealType)
      ? currentDealTypes.filter((dt) => dt !== dealType)
      : [...currentDealTypes, dealType];

    dispatch(
      updateProductConfiguration({ productId, dealTypes: newDealTypes })
    );
  };

  const handleVehicleTypeToggle = (productId, vehicleType) => {
    const config = productsState.productConfigurations.find(
      (c) => c.productId === productId
    );
    const currentVehicleTypes = config?.vehicleTypes || [];

    const newVehicleTypes = currentVehicleTypes.includes(vehicleType)
      ? currentVehicleTypes.filter((vt) => vt !== vehicleType)
      : [...currentVehicleTypes, vehicleType];

    dispatch(
      updateProductConfiguration({ productId, vehicleTypes: newVehicleTypes })
    );
  };

  const isValid = productsState.dealerId;

  return (
    <StepContainer stepNumber={3} title="Products" canGoNext={isValid}>
      <div className="space-y-8">
        {/* Product Integration Selection */}
        <div>
          <label className="block text-dark-text font-medium mb-3 flex items-center gap-2">
            <Package
              className="w-5 h-5"
              style={{ color: "rgb(231 233 187 / var(--tw-text-opacity))" }}
            />
            Choose your product integration
          </label>
          <RadioGroup
            value={productsState.productIntegration}
            onChange={(e) => handleIntegrationChange(e.target.value)}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <div
                  className={`
                  p-6 rounded-lg border transition-all duration-200
                  ${
                    productsState.productIntegration === "F&I"
                      ? "border-brand-focus bg-gradient-card"
                      : "border-dark-border hover:border-brand-focus"
                  }
                `}
                >
                  <FormControlLabel
                    value="F&I"
                    control={<Radio />}
                    label={<span className="text-lg font-semibold">F&I</span>}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div
                  className={`
                  p-6 rounded-lg border transition-all duration-200
                  ${
                    productsState.productIntegration === "PEN"
                      ? "border-brand-focus bg-gradient-card"
                      : "border-dark-border hover:border-brand-focus"
                  }
                `}
                >
                  <FormControlLabel
                    value="PEN"
                    control={<Radio />}
                    label={<span className="text-lg font-semibold">PEN</span>}
                  />
                </div>
              </Grid>
            </Grid>
          </RadioGroup>
        </div>

        {/* Dealer ID */}
        <TextField
          label="Dealer ID"
          value={productsState.dealerId}
          onChange={handleDealerIdChange}
          required
          fullWidth
          variant="outlined"
        />

        {/* Choose Vendors */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">
              Choose Vendors
            </h3>
            <Button
              onClick={handleImportVendors}
              disabled={!isValid}
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
            >
              Import Vendors
            </Button>
          </div>

          {showVendors && (
            <div className="space-y-2">
              {vendorsLoading ? (
                <div className="text-dark-text-secondary py-4">
                  Loading vendors...
                </div>
              ) : (
                vendors?.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light transition-all"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={productsState.selectedVendors.includes(
                            vendor.id
                          )}
                          onChange={() => dispatch(toggleVendor(vendor.id))}
                        />
                      }
                      label={vendor.name}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Choose Products */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">
              Choose Products to Import
            </h3>
            <Button
              onClick={handleImportProducts}
              disabled={!isValid || productsState.selectedVendors.length === 0}
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
            >
              Import Products
            </Button>
          </div>

          {showProducts && (
            <div className="space-y-2">
              {productsLoading ? (
                <div className="text-dark-text-secondary py-4">
                  Loading products...
                </div>
              ) : (
                products?.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light transition-all"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={productsState.selectedProducts.includes(
                            product.id
                          )}
                          onChange={() => dispatch(toggleProduct(product.id))}
                        />
                      }
                      label={
                        <div>
                          <span className="text-dark-text font-medium">
                            {product.name}
                          </span>
                          <span className="text-dark-text-secondary text-sm ml-2">
                            ({product.category})
                          </span>
                        </div>
                      }
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Configure Product Deal Type and Vehicle Types */}
        <div className="border-t border-dark-border pt-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4 flex items-center gap-2">
            <Settings
              className="w-5 h-5"
              style={{ color: "rgb(231 233 187 / var(--tw-text-opacity))" }}
            />
            Configure Product Deal Type and Vehicle Types
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {staticProducts.map((product) => {
              const config = productsState.productConfigurations.find(
                (c) => c.productId === product.id
              );

              return (
                <div
                  key={product.id}
                  className="bg-dark-bg rounded-lg p-4 border border-dark-border"
                >
                  <h4 className="font-semibold text-dark-text mb-4">
                    {product.name}
                  </h4>

                  {/* Deal Types */}
                  <div className="mb-4">
                    <label className="block text-sm text-dark-text-secondary mb-2">
                      Deal Types
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {dealTypeOptions.map((dealType) => (
                        <FormControlLabel
                          key={dealType}
                          control={
                            <Checkbox
                              checked={
                                config?.dealTypes?.includes(dealType) || false
                              }
                              onChange={() =>
                                handleDealTypeToggle(product.id, dealType)
                              }
                              size="small"
                            />
                          }
                          label={<span className="text-sm">{dealType}</span>}
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Types */}
                  <div>
                    <label className="block text-sm text-dark-text-secondary mb-2">
                      Vehicle Types
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {vehicleTypeOptions.map((vehicleType) => (
                        <FormControlLabel
                          key={vehicleType}
                          control={
                            <Checkbox
                              checked={
                                config?.vehicleTypes?.includes(vehicleType) ||
                                false
                              }
                              onChange={() =>
                                handleVehicleTypeToggle(product.id, vehicleType)
                              }
                              size="small"
                            />
                          }
                          label={<span className="text-sm">{vehicleType}</span>}
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
