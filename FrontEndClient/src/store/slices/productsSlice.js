import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productIntegration: "F&I", // 'F&I' or 'PEN'
  dealerId: "",
  credentials: {
    fiUsername: "",
    fiPassword: "",
    penUsername: "",
    penPassword: "",
  },
  selectedVendors: [], // Now array of full {id, name} objects
  selectedProducts: [],
  importedProducts: [], // Array of imported product objects with id, name, category
  productConfigurations: [], // Array of {productId, productName, dealTypes: [], vehicleTypes: []}
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductIntegration: (state, action) => {
      state.productIntegration = action.payload;
    },
    setDealerId: (state, action) => {
      state.dealerId = action.payload;
    },
    updateCredentials: (state, action) => {
      state.credentials = { ...state.credentials, ...action.payload };
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = action.payload; // Array of full objects
    },
    toggleVendor: (state, action) => {
      const vendor = action.payload; // Full vendor object {id, name}
      const vendorId = vendor.id;
      const index = state.selectedVendors.findIndex((v) => v.id === vendorId);

      if (index > -1) {
        state.selectedVendors.splice(index, 1);
      } else {
        state.selectedVendors.push(vendor);
      }
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
    },
    toggleProduct: (state, action) => {
      const productId = action.payload;
      const index = state.selectedProducts.indexOf(productId);
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(productId);
      }
    },
    updateProductConfiguration: (state, action) => {
      const { productId, dealTypes, vehicleTypes } = action.payload;
      const existingIndex = state.productConfigurations.findIndex(
        (config) => config.productId === productId
      );

      if (existingIndex > -1) {
        state.productConfigurations[existingIndex] = {
          ...state.productConfigurations[existingIndex],
          dealTypes:
            dealTypes || state.productConfigurations[existingIndex].dealTypes,
          vehicleTypes:
            vehicleTypes ||
            state.productConfigurations[existingIndex].vehicleTypes,
        };
      } else {
        state.productConfigurations.push({
          productId,
          dealTypes: dealTypes || [],
          vehicleTypes: vehicleTypes || [],
        });
      }
    },
    setImportedProducts: (state, action) => {
      state.importedProducts = action.payload;
    },
    resetProducts: () => initialState,
  },
});

export const {
  setProductIntegration,
  setDealerId,
  updateCredentials,
  setSelectedVendors,
  toggleVendor,
  setSelectedProducts,
  toggleProduct,
  updateProductConfiguration,
  setImportedProducts,
  resetProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
