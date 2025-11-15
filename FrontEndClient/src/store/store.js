import { configureStore } from '@reduxjs/toolkit'
import configReducer from './slices/configSlice'
import productsReducer from './slices/productsSlice'

export const store = configureStore({
  reducer: {
    config: configReducer,
    products: productsReducer,
  },
})

