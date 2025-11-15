import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateGeneralInfo } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
import MaterialInput from '../MaterialInput'
import MaterialSelect from '../MaterialSelect'

const countryOptions = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Australia', label: 'Australia' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Japan', label: 'Japan' },
  { value: 'China', label: 'China' },
  { value: 'India', label: 'India' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Other', label: 'Other' },
]

export default function Step1GeneralInfo() {
  const dispatch = useDispatch()
  const generalInfo = useSelector((state) => state.config.generalInfo)
  
  const [formData, setFormData] = useState(generalInfo)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    
    // Validate ZIP code
    if (name === 'zipCode' && value) {
      if (!/^\d{5}$/.test(value) && value.length === 5) {
        setErrors((prev) => ({ ...prev, zipCode: 'Not a valid zip' }))
      }
    }
  }

  const handleNext = () => {
    dispatch(updateGeneralInfo(formData))
  }

  const isValid = formData.legalName && formData.dbaName && formData.email

  return (
    <StepContainer
      stepNumber={1}
      title="General Information"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-6">
        {/* Legal and DBA Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MaterialInput
            label="Legal Name"
            type="text"
            name="legalName"
            value={formData.legalName}
            onChange={handleChange}
            required
          />
          <MaterialInput
            label="DBA Name"
            type="text"
            name="dbaName"
            value={formData.dbaName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Website and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MaterialInput
            label="Website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
          <MaterialInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <MaterialInput
              label="Address 1"
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <MaterialInput
              label="Address 2"
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
            />
          </div>

          {/* Phone, FAX, Country */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MaterialInput
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <MaterialInput
              label="FAX"
              type="text"
              name="fax"
              value={formData.fax}
              onChange={handleChange}
            />
            <MaterialSelect
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
            />
          </div>

          <div>
            <MaterialInput
              label="City"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <MaterialSelect
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              options={[
                { value: 'AL', label: 'AL' },
                { value: 'AK', label: 'AK' },
                { value: 'AZ', label: 'AZ' },
                { value: 'AR', label: 'AR' },
                { value: 'CA', label: 'CA' },
                { value: 'CO', label: 'CO' },
                { value: 'CT', label: 'CT' },
                { value: 'DE', label: 'DE' },
                { value: 'FL', label: 'FL' },
                { value: 'GA', label: 'GA' },
                { value: 'HI', label: 'HI' },
                { value: 'ID', label: 'ID' },
                { value: 'IL', label: 'IL' },
                { value: 'IN', label: 'IN' },
                { value: 'IA', label: 'IA' },
                { value: 'KS', label: 'KS' },
                { value: 'KY', label: 'KY' },
                { value: 'LA', label: 'LA' },
                { value: 'ME', label: 'ME' },
                { value: 'MD', label: 'MD' },
                { value: 'MA', label: 'MA' },
                { value: 'MI', label: 'MI' },
                { value: 'MN', label: 'MN' },
                { value: 'MS', label: 'MS' },
                { value: 'MO', label: 'MO' },
                { value: 'MT', label: 'MT' },
                { value: 'NE', label: 'NE' },
                { value: 'NV', label: 'NV' },
                { value: 'NH', label: 'NH' },
                { value: 'NJ', label: 'NJ' },
                { value: 'NM', label: 'NM' },
                { value: 'NY', label: 'NY' },
                { value: 'NC', label: 'NC' },
                { value: 'ND', label: 'ND' },
                { value: 'OH', label: 'OH' },
                { value: 'OK', label: 'OK' },
                { value: 'OR', label: 'OR' },
                { value: 'PA', label: 'PA' },
                { value: 'RI', label: 'RI' },
                { value: 'SC', label: 'SC' },
                { value: 'SD', label: 'SD' },
                { value: 'TN', label: 'TN' },
                { value: 'TX', label: 'TX' },
                { value: 'UT', label: 'UT' },
                { value: 'VT', label: 'VT' },
                { value: 'VA', label: 'VA' },
                { value: 'WA', label: 'WA' },
                { value: 'WV', label: 'WV' },
                { value: 'WI', label: 'WI' },
                { value: 'WY', label: 'WY' },
              ]}
            />
            
            <MaterialInput
              label="Zip"
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              maxLength={5}
              error={errors.zipCode}
            />
          </div>
        </div>

        {/* Contact Info moved above within Address */}
      </div>
    </StepContainer>
  )
}

