import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateGeneralInfo } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'

export default function Step1GeneralInfo() {
  const dispatch = useDispatch()
  const generalInfo = useSelector((state) => state.config.generalInfo)
  
  const [formData, setFormData] = useState(generalInfo)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    dispatch(updateGeneralInfo(formData))
  }

  const isValid = formData.dealershipName && formData.dealerCode && formData.email

  return (
    <StepContainer
      stepNumber={1}
      title="General Information"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-6">
        {/* Dealership Name */}
        <div>
          <label className="block text-dark-text font-medium mb-2">
            Dealership Name *
          </label>
          <input
            type="text"
            name="dealershipName"
            value={formData.dealershipName}
            onChange={handleChange}
            placeholder="Enter dealership name"
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>

        {/* Dealer Code */}
        <div>
          <label className="block text-dark-text font-medium mb-2">
            Dealer Code *
          </label>
          <input
            type="text"
            name="dealerCode"
            value={formData.dealerCode}
            onChange={handleChange}
            placeholder="e.g., DLR12345"
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-dark-text font-medium mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
          
          <div>
            <label className="block text-dark-text font-medium mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-dark-text font-medium mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="ST"
                maxLength={2}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
            
            <div>
              <label className="block text-dark-text font-medium mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="12345"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-text font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
          
          <div>
            <label className="block text-dark-text font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@dealership.com"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
        </div>
      </div>
    </StepContainer>
  )
}

