import { useSelector } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useEffect, useMemo } from 'react'
import { createAppTheme } from './theme'
import DashboardLayout from './components/Layout/DashboardLayout'
import Step1GeneralInfo from './components/Steps/Step1GeneralInfo'
import Step2FinanceProviders from './components/Steps/Step2FinanceProviders'
import Step3Products from './components/Steps/Step3Products'
import Step4DMSIntegrations from './components/Steps/Step4DMSIntegrations'
import Step5Review from './components/Steps/Step5Review'
import CustomCursor from './components/CustomCursor'
import Preloader from './components/Preloader'

function App() {
  const currentStep = useSelector((state) => state.config.currentStep)
  const currentTheme = useSelector((state) => state.config.theme || 'gold')
  const theme = useMemo(() => createAppTheme(currentTheme), [currentTheme])

  // Update CSS variables based on theme
  useEffect(() => {
    const root = document.documentElement
    // Set initial CSS variables
    if (currentTheme === 'blue') {
      root.style.setProperty('--theme-primary', '#515ada')
      root.style.setProperty('--theme-primary-dark', '#efd5ff')
      root.style.setProperty('--theme-primary-opacity-20', 'rgba(81, 90, 218, 0.2)')
      root.style.setProperty('--theme-primary-opacity-30', 'rgba(81, 90, 218, 0.3)')
      root.style.setProperty('--theme-gradient', 'linear-gradient(90deg, #515ada 0%, #efd5ff 100%)')
      root.style.setProperty('--theme-gradient-secondary', 'linear-gradient(135deg, #515ada 0%, #efd5ff 100%)')
      root.style.setProperty('--theme-gradient-card', 'linear-gradient(135deg, rgba(81, 90, 218, 0.15) 0%, rgba(239, 213, 255, 0.1) 100%)')
      root.style.setProperty('--theme-gradient-logo', 'linear-gradient(90deg, #515ada 0%, #efd5ff 100%)')
      // White backgrounds for blue theme
      root.style.setProperty('--theme-bg', '#ffffff')
      root.style.setProperty('--theme-surface', '#ffffff')
      root.style.setProperty('--theme-surface-light', '#f9fafb')
      root.style.setProperty('--theme-surface-warm', '#f9fafb')
      root.style.setProperty('--theme-border', '#e5e7eb')
      root.style.setProperty('--theme-text', '#1f2937')
      root.style.setProperty('--theme-text-secondary', '#6b7280')
      root.style.setProperty('--theme-button-text', '#ffffff')
      root.style.setProperty('--theme-disabled-bg', '#f3f4f6')
      root.style.setProperty('--theme-disabled-text', '#9ca3af')
      root.style.setProperty('--theme-disabled-border', '#e5e7eb')
    } else {
      root.style.setProperty('--theme-primary', '#E7E9BB')
      root.style.setProperty('--theme-primary-dark', '#403B4A')
      root.style.setProperty('--theme-primary-opacity-20', 'rgba(231, 233, 187, 0.2)')
      root.style.setProperty('--theme-primary-opacity-30', 'rgba(231, 233, 187, 0.3)')
      root.style.setProperty('--theme-gradient', 'linear-gradient(to right, #E7E9BB, #403B4A)')
      root.style.setProperty('--theme-gradient-secondary', 'linear-gradient(135deg, #E7E9BB 0%, #403B4A 100%)')
      root.style.setProperty('--theme-gradient-card', 'linear-gradient(135deg, rgba(231, 233, 187, 0.1) 0%, rgba(64, 59, 74, 0.05) 100%)')
      root.style.setProperty('--theme-gradient-logo', 'linear-gradient(to right, #E7E9BB, #403B4A)')
      // Dark backgrounds for gold theme
      root.style.setProperty('--theme-bg', '#1a1d25')
      root.style.setProperty('--theme-surface', '#252932')
      root.style.setProperty('--theme-surface-light', '#2d3240')
      root.style.setProperty('--theme-surface-warm', '#2a2d26')
      root.style.setProperty('--theme-border', '#3d4354')
      root.style.setProperty('--theme-text', '#e5e7eb')
      root.style.setProperty('--theme-text-secondary', '#9ca3af')
      root.style.setProperty('--theme-button-text', '#000000')
      root.style.setProperty('--theme-disabled-bg', '#2d3240')
      root.style.setProperty('--theme-disabled-text', '#6b7280')
      root.style.setProperty('--theme-disabled-border', '#3d4354')
    }
    // Force a re-render by updating a data attribute
    root.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1GeneralInfo />
      case 2:
        return <Step2FinanceProviders />
      case 3:
        return <Step3Products />
      case 4:
        return <Step4DMSIntegrations />
      case 5:
        return <Step5Review />
      default:
        return <Step1GeneralInfo />
    }
  }

  return (
    <ThemeProvider theme={theme} key={currentTheme}>
      <CssBaseline />
      <Preloader />
      <CustomCursor />
      <DashboardLayout>
        {renderStep()}
      </DashboardLayout>
    </ThemeProvider>
  )
}

export default App
