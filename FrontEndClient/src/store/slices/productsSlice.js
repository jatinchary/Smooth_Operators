import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  productIntegration: 'F&I', // 'F&I' or 'PEN'
  dealerId: '',
  credentials: {
    fiUsername: '',
    fiPassword: '',
    penUsername: '',
    penPassword: '',
  },
  selectedVendors: [],
  selectedProducts: [],
  productConfigurations: [], // Array of {productId, productName, dealTypes: [], vehicleTypes: []}
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductIntegration: (state, action) => {
      state.productIntegration = action.payload
    },
    setDealerId: (state, action) => {
      state.dealerId = action.payload
    },
    updateCredentials: (state, action) => {
      state.credentials = { ...state.credentials, ...action.payload }
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = action.payload
    },
    toggleVendor: (state, action) => {
      const vendorId = action.payload
      const index = state.selectedVendors.indexOf(vendorId)
      if (index > -1) {
        state.selectedVendors.splice(index, 1)
      } else {
        state.selectedVendors.push(vendorId)
      }
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload
    },
    toggleProduct: (state, action) => {
      const productId = action.payload
      const index = state.selectedProducts.indexOf(productId)
      if (index > -1) {
        state.selectedProducts.splice(index, 1)
      } else {
        state.selectedProducts.push(productId)
      }
    },
    updateProductConfiguration: (state, action) => {
      const { productId, dealTypes, vehicleTypes } = action.payload
      const existingIndex = state.productConfigurations.findIndex(
        (config) => config.productId === productId
      )
      
      if (existingIndex > -1) {
        state.productConfigurations[existingIndex] = {
          ...state.productConfigurations[existingIndex],
          dealTypes: dealTypes || state.productConfigurations[existingIndex].dealTypes,
          vehicleTypes: vehicleTypes || state.productConfigurations[existingIndex].vehicleTypes,
        }
      } else {
        state.productConfigurations.push({
          productId,
          dealTypes: dealTypes || [],
          vehicleTypes: vehicleTypes || [],
        })
      }
    },
    resetProducts: () => initialState,
  },
})

export const {
  setProductIntegration,
  setDealerId,
  updateCredentials,
  setSelectedVendors,
  toggleVendor,
  setSelectedProducts,
  toggleProduct,
  updateProductConfiguration,
  resetProducts,
} = productsSlice.actions

export default productsSlice.reducer

