import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateGeneralInfo } from '../../store/slices/configSlice'
import StepContainer from './StepContainer'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { fetchDealershipOptions, fetchDealershipDetails } from './helpers/dealersApi'

export default function Step1GeneralInfo() {
  const dispatch = useDispatch()
  const generalInfo = useSelector((state) => state.config.generalInfo)
  
  const [formData, setFormData] = useState(generalInfo)
  const [errors, setErrors] = useState({})
  const [dealershipOptions, setDealershipOptions] = useState([])
  const [dealershipsError, setDealershipsError] = useState('')
  const [isLoadingDealerships, setIsLoadingDealerships] = useState(false)
  const [isImportingDealership, setIsImportingDealership] = useState(false)
  const [selectedDealershipName, setSelectedDealershipName] = useState('')
  const [selectedDealershipId, setSelectedDealershipId] = useState('')

  useEffect(() => {
    setFormData(generalInfo)
  }, [generalInfo])

  useEffect(() => {
    let isMounted = true

    const loadDealerships = async () => {
      setIsLoadingDealerships(true)
      setDealershipsError('')
      try {
        const options = await fetchDealershipOptions()
        if (isMounted) {
          setDealershipOptions(options)
        }
      } catch (error) {
        console.error('Failed to load dealerships', error)
        if (isMounted) {
          setDealershipsError(error.message || 'Failed to load dealerships')
        }
      } finally {
        if (isMounted) {
          setIsLoadingDealerships(false)
        }
      }
    }

    loadDealerships()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedDealershipId && dealershipOptions.length > 0) {
      setSelectedDealershipId(String(dealershipOptions[0].id))
    }
  }, [dealershipOptions, selectedDealershipId])

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

  const handleImportDealership = async () => {
    if (!selectedDealershipId) {
      setDealershipsError('Select a dealership to import')
      return
    }

    const selectedOption = dealershipOptions.find(
      (option) => String(option.id) === String(selectedDealershipId)
    )

    setIsImportingDealership(true)
    setDealershipsError('')

    try {
      const details = await fetchDealershipDetails(selectedDealershipId)
      setFormData(details)
      dispatch(updateGeneralInfo(details))
      setErrors({})
      setSelectedDealershipName(selectedOption?.name || '')
    } catch (error) {
      console.error('Failed to import dealership', error)
      setDealershipsError(error.message || 'Failed to import dealership')
    } finally {
      setIsImportingDealership(false)
    }
  }

  const handleNext = () => {
    dispatch(updateGeneralInfo(formData))
  }

  // Require at least Legal Name and Email
  const isValid = formData.legalName && formData.email

  return (
    <StepContainer
      stepNumber={1}
      title="General Information"
      onNext={handleNext}
      canGoNext={isValid}
      headerActions={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            select
            label="Select Dealership"
            value={selectedDealershipId}
            onChange={(event) => {
              setSelectedDealershipId(event.target.value)
              setDealershipsError('')
            }}
            size="small"
            sx={{ minWidth: 220 }}
            disabled={isLoadingDealerships}
            SelectProps={{
              displayEmpty: true,
            }}
          >
            {isLoadingDealerships ? (
              <MenuItem value="" disabled>
                <CircularProgress size={18} sx={{ mr: 2 }} />
                Loading dealerships...
              </MenuItem>
            ) : dealershipOptions.length > 0 ? (
              dealershipOptions.map((dealer) => (
                <MenuItem key={dealer.id} value={String(dealer.id)}>
                  {dealer.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {dealershipsError || 'No dealerships found'}
              </MenuItem>
            )}
          </TextField>
          <Button
            variant="contained"
            onClick={handleImportDealership}
            disabled={
              isImportingDealership ||
              isLoadingDealerships ||
              !selectedDealershipId ||
              dealershipOptions.length === 0
            }
            size="large"
            sx={{ px: 4 }}
            startIcon={isImportingDealership ? <CircularProgress size={18} /> : null}
          >
            Import Dealership
          </Button>
        </Stack>
      }
    >
      <div className="space-y-6">
        {dealershipsError && (
          <Alert severity="error" onClose={() => setDealershipsError('')}>
            {dealershipsError}
          </Alert>
        )}

        {/* Row 1: Legal Name, DBA Name */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Legal Name"
              name="legalName"
              value={formData.legalName || ''}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="DBA Name"
              name="dbaName"
              value={formData.dbaName || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Row 2: Website, Email, Phone, Fax */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Website"
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="FAX"
            name="fax"
            value={formData.fax || ''}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Stack>

        {/* Row 4: Address 1 */}
        <TextField
          label="Address 1"
          name="address1"
          value={formData.address1 || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />

        {/* Row 5: Address 2 */}
        <TextField
          label="Address 2"
          name="address2"
          value={formData.address2 || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />

        {/* Row 3: Country, State, City, ZIP Code */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Country"
              name="country"
              value={formData.country || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="State"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9ca3af' }}>Select State</span>;
                  }
                  return selected;
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="" disabled>Select State</MenuItem>
              <MenuItem value="AL">AL</MenuItem>
              <MenuItem value="AK">AK</MenuItem>
              <MenuItem value="AZ">AZ</MenuItem>
              <MenuItem value="AR">AR</MenuItem>
              <MenuItem value="CA">CA</MenuItem>
              <MenuItem value="CO">CO</MenuItem>
              <MenuItem value="CT">CT</MenuItem>
              <MenuItem value="DE">DE</MenuItem>
              <MenuItem value="FL">FL</MenuItem>
              <MenuItem value="GA">GA</MenuItem>
              <MenuItem value="HI">HI</MenuItem>
              <MenuItem value="ID">ID</MenuItem>
              <MenuItem value="IL">IL</MenuItem>
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="IA">IA</MenuItem>
              <MenuItem value="KS">KS</MenuItem>
              <MenuItem value="KY">KY</MenuItem>
              <MenuItem value="LA">LA</MenuItem>
              <MenuItem value="ME">ME</MenuItem>
              <MenuItem value="MD">MD</MenuItem>
              <MenuItem value="MA">MA</MenuItem>
              <MenuItem value="MI">MI</MenuItem>
              <MenuItem value="MN">MN</MenuItem>
              <MenuItem value="MS">MS</MenuItem>
              <MenuItem value="MO">MO</MenuItem>
              <MenuItem value="MT">MT</MenuItem>
              <MenuItem value="NE">NE</MenuItem>
              <MenuItem value="NV">NV</MenuItem>
              <MenuItem value="NH">NH</MenuItem>
              <MenuItem value="NJ">NJ</MenuItem>
              <MenuItem value="NM">NM</MenuItem>
              <MenuItem value="NY">NY</MenuItem>
              <MenuItem value="NC">NC</MenuItem>
              <MenuItem value="ND">ND</MenuItem>
              <MenuItem value="OH">OH</MenuItem>
              <MenuItem value="OK">OK</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
              <MenuItem value="PA">PA</MenuItem>
              <MenuItem value="RI">RI</MenuItem>
              <MenuItem value="SC">SC</MenuItem>
              <MenuItem value="SD">SD</MenuItem>
              <MenuItem value="TN">TN</MenuItem>
              <MenuItem value="TX">TX</MenuItem>
              <MenuItem value="UT">UT</MenuItem>
              <MenuItem value="VT">VT</MenuItem>
              <MenuItem value="VA">VA</MenuItem>
              <MenuItem value="WA">WA</MenuItem>
              <MenuItem value="WV">WV</MenuItem>
              <MenuItem value="WI">WI</MenuItem>
              <MenuItem value="WY">WY</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="City"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode || ''}
              onChange={handleChange}
              inputProps={{ maxLength: 5 }}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
      </div>
    </StepContainer>
  )
}
