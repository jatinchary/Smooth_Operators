import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateDMSIntegrations } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import { Server } from 'lucide-react'

const dmsSystems = [
  { value: '', label: 'Select DMS System' },
  { value: 'CDK', label: 'CDK Global' },
  { value: 'Reynolds', label: 'Reynolds & Reynolds' },
  { value: 'Dealertrack', label: 'Dealertrack DMS' },
  { value: 'Auto', label: 'AutoMate' },
  { value: 'PBS', label: 'PBS Systems' },
]

export default function Step4DMSIntegrations() {
  const dispatch = useDispatch()
  const dmsIntegrations = useSelector((state) => state.config.dmsIntegrations)
  
  const [formData, setFormData] = useState(dmsIntegrations)
  const [toastState, setToastState] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const showToast = (severity, message) => {
    setToastState({
      open: true,
      severity,
      message,
    })
  }

  const handleToastClose = (_, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setToastState((prev) => ({ ...prev, open: false }))
  }

  const ToastTransition = (props) => <Slide {...props} direction="left" />

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCredentialChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [name]: value }
    }))
  }

  const handleTestConnection = async () => {
    if (!formData.dmsSystem || !formData.apiEndpoint || !formData.credentials.username || !formData.credentials.password) {
      showToast('error', 'Please fill in all required fields before testing the connection.')
      return
    }

    try {
      // Simulate connection test - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      showToast('success', 'Connection test successful! DMS integration is working properly.')
    } catch (error) {
      const errorMsg = error?.message || 'Connection test failed. Please check your credentials and try again.'
      showToast('error', errorMsg)
    }
  }

  const handleNext = () => {
    dispatch(updateDMSIntegrations(formData))
  }

  const isValid = formData.dmsSystem && formData.apiEndpoint && 
                  formData.credentials.username && formData.credentials.password

  return (
    <StepContainer
      stepNumber={4}
      title="DMS Integrations"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-dark-surface-warm border border-brand-focus/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-brand-focus mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text mb-1">DMS Integration</h4>
              <p className="text-sm text-dark-text-secondary">
                Connect your Dealer Management System to sync inventory, customer data, and transactions.
              </p>
            </div>
          </div>
        </div>

        {/* DMS System Selection */}
        <TextField
          select
          label="DMS System"
          name="dmsSystem"
          value={formData.dmsSystem || ''}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          SelectProps={{
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <span style={{ color: '#9ca3af' }}>Select DMS System</span>;
              }
              const system = dmsSystems.find(s => s.value === selected);
              return system?.label || selected;
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          {dmsSystems.map((system) => (
            <MenuItem key={system.value} value={system.value} disabled={!system.value}>
              {system.label}
            </MenuItem>
          ))}
        </TextField>

        {/* API Endpoint */}
        <TextField
          label="API Endpoint"
          type="url"
          name="apiEndpoint"
          value={formData.apiEndpoint}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
        />

        {/* Credentials */}
        <div className="border-t border-dark-border pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-dark-text">API Credentials</h3>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.credentials.username}
                onChange={handleCredentialChange}
                required
                fullWidth
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.credentials.password}
                onChange={handleCredentialChange}
                required
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </div>

        {/* Test Connection Button */}
        <Button
          variant="contained"
          onClick={handleTestConnection}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          Test Connection
        </Button>
      </div>
      <Snackbar
        open={toastState.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={ToastTransition}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </StepContainer>
  )
}

