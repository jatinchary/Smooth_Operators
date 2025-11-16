import { useSelector, useDispatch } from "react-redux";
import { updateProductConfiguration } from "../../../store/slices/productsSlice";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";

const dealTypeOptions = ["Cash", "Finance", "Lease"];
const vehicleTypeOptions = ["New", "Used"];

const ProductConfiguration = () => {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);

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

  // Get selected products with their configurations
  const selectedProducts = productsState.selectedProducts.map((productId) => {
    const config = productsState.productConfigurations.find(
      (c) => c.productId === productId
    );
    // Find the imported product to get the actual name
    const importedProduct = productsState.importedProducts.find(
      (p) => p.id === productId
    );

    return {
      id: productId,
      name: importedProduct?.name || `Product ${productId}`,
      vendors: importedProduct?.vendors || [], // Include vendors
      dealTypes: config?.dealTypes || [],
      vehicleTypes: config?.vehicleTypes || [],
    };
  });

  if (selectedProducts.length === 0) {
    return (
      <div className="border-t border-dark-border pt-6">
        <h3 className="text-lg font-semibold text-dark-text mb-4">
          Product Configuration
        </h3>
        <div className="text-center py-8 text-dark-text-secondary">
          <p>Please import and select products first to configure them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-dark-border pt-6">
      <h3 className="text-lg font-semibold text-dark-text mb-4">
        Configure Product Deal Type and Vehicle Types
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-dark-bg rounded-lg p-4 border border-dark-border"
          >
            <h4 className="font-semibold text-dark-text mb-4">
              {(() => {
                const displayName = product.name;
                if (product.vendors.length === 0) return displayName;
                if (product.vendors.length === 1)
                  return `${displayName} (${product.vendors[0].name})`;
                return `${displayName} (Multiple Vendors)`;
              })()}
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
                        checked={product.dealTypes.includes(dealType)}
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
                        checked={product.vehicleTypes.includes(vehicleType)}
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
        ))}
      </div>
    </div>
  );
};

export default ProductConfiguration;
