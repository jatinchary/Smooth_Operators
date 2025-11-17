import { useSelector } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import DashboardLayout from './components/Layout/DashboardLayout'
import Step1GeneralInfo from './components/Steps/Step1GeneralInfo'
import Step2FinanceProviders from './components/Steps/Step2FinanceProviders'
import Step3Products from './components/Steps/Step3Products'
import Step4DMSIntegrations from './components/Steps/Step4DMSIntegrations'
import Step5Review from './components/Steps/Step5Review'

function App() {
  const currentStep = useSelector((state) => state.config.currentStep)

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardLayout>
        {renderStep()}
      </DashboardLayout>
    </ThemeProvider>
  )
}

export default App
