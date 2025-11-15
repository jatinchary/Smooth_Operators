import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentStep: 1,
  completedSteps: [],
  generalInfo: {
    dealershipName: '',
    dealerCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
  },
  financeProviders: {
    primaryProvider: 'RouteOne',
    viaLP: false,
    routeOneConfig: {
      dealerId: '',
      username: '',
      password: '',
      isConfigured: false,
    },
    dealerTrackConfig: {
      dealerId: '',
      apiKey: '',
      isConfigured: false,
    },
    dmsLenders: [],
    creditAppLenders: [],
  },
  dmsIntegrations: {
    dmsSystem: '',
    apiEndpoint: '',
    credentials: {
      username: '',
      password: '',
    },
  },
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },
    markStepComplete: (state, action) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload)
      }
    },
    updateGeneralInfo: (state, action) => {
      state.generalInfo = { ...state.generalInfo, ...action.payload }
    },
    updateFinanceProviders: (state, action) => {
      state.financeProviders = { ...state.financeProviders, ...action.payload }
    },
    updateDMSIntegrations: (state, action) => {
      state.dmsIntegrations = { ...state.dmsIntegrations, ...action.payload }
    },
    resetConfig: () => initialState,
  },
})

export const {
  setCurrentStep,
  markStepComplete,
  updateGeneralInfo,
  updateFinanceProviders,
  updateDMSIntegrations,
  resetConfig,
} = configSlice.actions

export default configSlice.reducer

