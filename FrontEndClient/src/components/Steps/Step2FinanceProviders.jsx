import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { updateFinanceProviders } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
import MaterialInput from '../MaterialInput'
import MaterialSelect from '../MaterialSelect'
import { Lock, ChevronDown, Settings, Download } from 'lucide-react'

const providers = ['RouteOne', 'DealerTrack', 'Both']

// Mock API functions - replace with actual API calls
const fetchDMSLenders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    { id: 'lender1', name: 'Chase Auto Finance', dmsId: 'DMS001' },
    { id: 'lender2', name: 'Wells Fargo Dealer Services', dmsId: 'DMS002' },
    { id: 'lender3', name: 'Ally Financial', dmsId: 'DMS003' },
    { id: 'lender4', name: 'Capital One Auto Finance', dmsId: 'DMS004' },
    { id: 'lender5', name: 'Bank of America', dmsId: 'DMS005' },
  ]
}

const fetchCreditAppLenders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    { id: 'ca1', name: 'Chase Auto Finance' },
    { id: 'ca2', name: 'Wells Fargo Dealer Services' },
    { id: 'ca3', name: 'Ally Financial' },
    { id: 'ca4', name: 'Capital One Auto Finance' },
    { id: 'ca5', name: 'Bank of America' },
    { id: 'ca6', name: 'TD Auto Finance' },
    { id: 'ca7', name: 'GM Financial' },
  ]
}

export default function Step2FinanceProviders() {
  const dispatch = useDispatch()
  const financeProviders = useSelector((state) => state.config.financeProviders)
  
  const [formData, setFormData] = useState(financeProviders)
  const [showDMSLenders, setShowDMSLenders] = useState(false)
  const [showCreditAppLenders, setShowCreditAppLenders] = useState(false)

  // Fetch DMS Lenders
  const { data: dmsLenders, isLoading: dmsLendersLoading } = useQuery({
    queryKey: ['dmsLenders'],
    queryFn: fetchDMSLenders,
    enabled: showDMSLenders,
  })

  // Fetch Credit App Lenders
  const { data: creditAppLenders, isLoading: creditAppLendersLoading } = useQuery({
    queryKey: ['creditAppLenders'],
    queryFn: fetchCreditAppLenders,
    enabled: showCreditAppLenders,
  })

  const handleProviderChange = (provider) => {
    setFormData((prev) => ({ ...prev, primaryProvider: provider }))
  }

  const handleViaLPToggle = () => {
    setFormData((prev) => ({ ...prev, viaLP: !prev.viaLP }))
  }

  const handleRouteOneChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      routeOneConfig: { ...prev.routeOneConfig, [name]: value }
    }))
  }

  const handleDealerTrackChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      dealerTrackConfig: { ...prev.dealerTrackConfig, [name]: value }
    }))
  }

  const handleRouteOneSetup = () => {
    setFormData((prev) => ({
      ...prev,
      routeOneConfig: { ...prev.routeOneConfig, isConfigured: true }
    }))
  }

  const handleDealerTrackSetup = () => {
    setFormData((prev) => ({
      ...prev,
      dealerTrackConfig: { ...prev.dealerTrackConfig, isConfigured: true }
    }))
  }

  const handleImportDMSLenders = () => {
    setShowDMSLenders(true)
  }

  const handleImportCreditAppLenders = () => {
    setShowCreditAppLenders(true)
  }

  const handleDMSLenderToggle = (lenderId) => {
    setFormData((prev) => {
      const currentLenders = prev.dmsLenders || []
      const exists = currentLenders.find(l => l.id === lenderId)
      
      if (exists) {
        return {
          ...prev,
          dmsLenders: currentLenders.filter(l => l.id !== lenderId)
        }
      } else {
        const lender = dmsLenders.find(l => l.id === lenderId)
        return {
          ...prev,
          dmsLenders: [...currentLenders, lender]
        }
      }
    })
  }

  const handleCreditAppLenderToggle = (lenderId) => {
    setFormData((prev) => {
      const currentLenders = prev.creditAppLenders || []
      const exists = currentLenders.find(l => l.id === lenderId)
      
      if (exists) {
        return {
          ...prev,
          creditAppLenders: currentLenders.filter(l => l.id !== lenderId)
        }
      } else {
        const lender = creditAppLenders.find(l => l.id === lenderId)
        return {
          ...prev,
          creditAppLenders: [...currentLenders, lender]
        }
      }
    })
  }

  const handleNext = () => {
    dispatch(updateFinanceProviders(formData))
  }

  const showRouteOne = formData.primaryProvider === 'RouteOne' || formData.primaryProvider === 'Both'
  const showDealerTrack = formData.primaryProvider === 'DealerTrack' || formData.primaryProvider === 'Both'
  
  const isRouteOneValid = formData.routeOneConfig.dealerId && 
                          formData.routeOneConfig.username && 
                          formData.routeOneConfig.password
  const isDealerTrackValid = formData.dealerTrackConfig.dealerId && 
                             formData.dealerTrackConfig.apiKey
  
  const isValid = formData.primaryProvider && 
    ((showRouteOne && isRouteOneValid) || 
     (showDealerTrack && isDealerTrackValid))

  return (
    <StepContainer
      stepNumber={2}
      title="Finance & Providers"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-8">
        {/* Primary Finance Provider */}
        <MaterialSelect
          label="Primary Finance Provider"
          name="primaryProvider"
          value={formData.primaryProvider}
          onChange={(e) => handleProviderChange(e.target.value)}
          options={providers.map(provider => ({ value: provider, label: provider }))}
        />

        {/* Via LP Toggle */}
        <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border">
          <span className="text-dark-text font-medium">Via LP</span>
          <button
            type="button"
            onClick={handleViaLPToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${formData.viaLP ? 'bg-gradient-primary' : 'bg-dark-surface-light'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${formData.viaLP ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* RouteOne Configuration */}
        {showRouteOne && (
          <div className="border-l-4 border-brand-focus pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text flex items-center gap-2">
                RouteOne Configuration
              </h3>
              {formData.routeOneConfig.isConfigured && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Configured
                </span>
              )}
            </div>
            
            <MaterialInput
              label="Dealer ID"
              type="text"
              name="dealerId"
              value={formData.routeOneConfig.dealerId}
              onChange={handleRouteOneChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MaterialInput
                label="Username"
                type="text"
                name="username"
                value={formData.routeOneConfig.username}
                onChange={handleRouteOneChange}
              />
              
              <MaterialInput
                label="Password"
                type="password"
                name="password"
                value={formData.routeOneConfig.password}
                onChange={handleRouteOneChange}
              />
            </div>

            <button
              type="button"
              onClick={handleRouteOneSetup}
              disabled={!isRouteOneValid || formData.routeOneConfig.isConfigured}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                ${isRouteOneValid && !formData.routeOneConfig.isConfigured
                  ? 'bg-gradient-primary text-dark-bg hover:shadow-glow'
                  : 'bg-dark-surface-light text-dark-text-secondary cursor-not-allowed'
                }
              `}
            >
              <Settings className="w-4 h-4" />
              {formData.routeOneConfig.isConfigured ? 'Configuration Complete' : 'Configuration Setup'}
            </button>
          </div>
        )}

        {/* DealerTrack Configuration */}
        {showDealerTrack && (
          <div className="border-l-4 border-brand-secondary pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text">
                DealerTrack Configuration
              </h3>
              {formData.dealerTrackConfig.isConfigured && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Configured
                </span>
              )}
            </div>
            
            <MaterialInput
              label="Dealer ID"
              type="text"
              name="dealerId"
              value={formData.dealerTrackConfig.dealerId}
              onChange={handleDealerTrackChange}
            />

            <MaterialInput
              label="API Key"
              type="password"
              name="apiKey"
              value={formData.dealerTrackConfig.apiKey}
              onChange={handleDealerTrackChange}
            />

            <button
              type="button"
              onClick={handleDealerTrackSetup}
              disabled={!isDealerTrackValid || formData.dealerTrackConfig.isConfigured}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                ${isDealerTrackValid && !formData.dealerTrackConfig.isConfigured
                  ? 'bg-gradient-primary text-dark-bg hover:shadow-glow'
                  : 'bg-dark-surface-light text-dark-text-secondary cursor-not-allowed'
                }
              `}
            >
              <Settings className="w-4 h-4" />
              {formData.dealerTrackConfig.isConfigured ? 'Configuration Complete' : 'Configuration Setup'}
            </button>
          </div>
        )}

        {/* Import DMS Lenders ID from Credit App Lenders */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">Import DMS Lenders ID from Credit App Lenders</h3>
            <button
              type="button"
              onClick={handleImportDMSLenders}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-gradient-primary text-dark-bg hover:shadow-glow"
            >
              <Download className="w-4 h-4" />
              Import DMS Lenders
            </button>
          </div>

          {showDMSLenders && (
            <div className="space-y-2">
              {dmsLendersLoading ? (
                <div className="text-dark-text-secondary py-4">Loading DMS lenders...</div>
              ) : (
                dmsLenders?.map((lender) => (
                  <label
                    key={lender.id}
                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.dmsLenders?.some(l => l.id === lender.id) || false}
                        onChange={() => handleDMSLenderToggle(lender.id)}
                        className="w-5 h-5 rounded border-dark-border text-brand-focus focus:ring-brand-focus"
                      />
                      <div>
                        <span className="text-dark-text font-medium">{lender.name}</span>
                        <span className="text-dark-text-secondary text-sm ml-2">({lender.dmsId})</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Associated Credit App Lenders with Dealerships */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">Associated Credit App Lenders with Dealerships</h3>
            <button
              type="button"
              onClick={handleImportCreditAppLenders}
              disabled={(formData.dmsLenders?.length || 0) === 0}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                ${(formData.dmsLenders?.length || 0) > 0
                  ? 'bg-gradient-primary text-dark-bg hover:shadow-glow'
                  : 'bg-dark-surface-light text-dark-text-secondary cursor-not-allowed'
                }
              `}
            >
              <Download className="w-4 h-4" />
              Import Credit App Lenders
            </button>
          </div>

          {showCreditAppLenders && (
            <div className="space-y-2">
              {creditAppLendersLoading ? (
                <div className="text-dark-text-secondary py-4">Loading credit app lenders...</div>
              ) : (
                creditAppLenders?.map((lender) => (
                  <label
                    key={lender.id}
                    className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.creditAppLenders?.some(l => l.id === lender.id) || false}
                      onChange={() => handleCreditAppLenderToggle(lender.id)}
                      className="w-5 h-5 rounded border-dark-border text-brand-focus focus:ring-brand-focus"
                    />
                    <span className="text-dark-text">{lender.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </StepContainer>
  )
}

