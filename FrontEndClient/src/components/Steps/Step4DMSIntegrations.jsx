import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateDMSIntegrations } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
import MaterialInput from '../MaterialInput'
import MaterialSelect from '../MaterialSelect'
import { Server, ChevronDown } from 'lucide-react'

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
        <MaterialSelect
          label="DMS System"
          name="dmsSystem"
          value={formData.dmsSystem}
          onChange={handleChange}
          options={dmsSystems}
          required
        />

        {/* API Endpoint */}
        <MaterialInput
          label="API Endpoint"
          type="url"
          name="apiEndpoint"
          value={formData.apiEndpoint}
          onChange={handleChange}
          required
        />

        {/* Credentials */}
        <div className="border-t border-dark-border pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-dark-text">API Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaterialInput
              label="Username"
              type="text"
              name="username"
              value={formData.credentials.username}
              onChange={handleCredentialChange}
              required
            />
            
            <MaterialInput
              label="Password"
              type="password"
              name="password"
              value={formData.credentials.password}
              onChange={handleCredentialChange}
              required
            />
          </div>
        </div>

        {/* Test Connection Button */}
        <button
          type="button"
          className="w-full md:w-auto px-6 py-3 bg-gradient-primary text-dark-bg rounded-lg font-medium hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          Test Connection
        </button>
      </div>
    </StepContainer>
  )
}

