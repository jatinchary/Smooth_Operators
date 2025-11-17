import { useDispatch, useSelector } from 'react-redux'
import { setCurrentStep, markStepComplete } from '../../store/slices/configSlice'
import Button from '@mui/material/Button'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CheckIcon from '@mui/icons-material/Check'

export default function StepContainer({ 
  stepNumber, 
  title, 
  children, 
  onNext,
  onPrevious,
  canGoNext = true,
  headerActions = null,
}) {
  const dispatch = useDispatch()
  const { currentStep } = useSelector((state) => state.config)
  const currentTheme = useSelector((state) => state.config.theme || 'gold')

  const handleNext = () => {
    if (onNext) {
      onNext()
    }
    dispatch(markStepComplete(stepNumber))
    dispatch(setCurrentStep(stepNumber + 1))
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    }
    dispatch(setCurrentStep(stepNumber - 1))
  }

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      {/* Step Title */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
        <h2 className={`text-4xl font-bold mb-2 ${currentTheme === 'blue' ? 'text-gray-900' : ''}`}>
          <span className={currentTheme === 'blue' ? 'text-gray-900' : 'bg-gradient-logo bg-clip-text text-transparent'}>
            Step {stepNumber}: {title}
          </span>
        </h2>
        <div className={`h-1 w-24 rounded-full ${currentTheme === 'blue' ? 'bg-gradient-logo' : 'bg-gradient-logo'}`}></div>
        </div>
        {headerActions ? (
          <div className="flex items-center gap-3">{headerActions}</div>
        ) : null}
      </div>

      {/* Step Content */}
      <div className={`${currentTheme === 'blue' ? 'bg-white border-gray-200' : 'bg-dark-surface border-dark-border/50'} rounded-3xl p-8 elevation-2 border`}>
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={handlePrevious}
          disabled={stepNumber === 1}
          variant="contained"
          size="large"
          startIcon={<ChevronLeftIcon />}
          sx={{ px: 4 }}
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          variant="contained"
          size="large"
          startIcon={stepNumber === 5 ? <CheckIcon /> : null}
          endIcon={stepNumber !== 5 ? <ChevronRightIcon /> : null}
          sx={{ px: 4 }}
        >
          {stepNumber === 5 ? 'Submit' : 'Next Step'}
        </Button>
      </div>
    </div>
  )
}

