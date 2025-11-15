import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateDMSIntegrations } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
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
        <div className="bg-gradient-card border border-brand-primary/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-brand-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text mb-1">DMS Integration</h4>
              <p className="text-sm text-dark-text-secondary">
                Connect your Dealer Management System to sync inventory, customer data, and transactions.
              </p>
            </div>
          </div>
        </div>

        {/* DMS System Selection */}
        <div>
          <label className="block text-dark-text font-medium mb-2">
            DMS System *
          </label>
          <div className="relative">
            <select
              name="dmsSystem"
              value={formData.dmsSystem}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
            >
              {dmsSystems.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-secondary pointer-events-none" />
          </div>
        </div>

        {/* API Endpoint */}
        <div>
          <label className="block text-dark-text font-medium mb-2">
            API Endpoint *
          </label>
          <input
            type="url"
            name="apiEndpoint"
            value={formData.apiEndpoint}
            onChange={handleChange}
            placeholder="https://api.yourdms.com/v1"
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>

        {/* Credentials */}
        <div className="border-t border-dark-border pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-dark-text">API Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dark-text font-medium mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.credentials.username}
                onChange={handleCredentialChange}
                placeholder="API Username"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
            
            <div>
              <label className="block text-dark-text font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.credentials.password}
                onChange={handleCredentialChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Test Connection Button */}
        <button
          type="button"
          className="w-full md:w-auto px-6 py-3 bg-dark-surface-light border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-all"
        >
          Test Connection
        </button>
      </div>
    </StepContainer>
  )
}

