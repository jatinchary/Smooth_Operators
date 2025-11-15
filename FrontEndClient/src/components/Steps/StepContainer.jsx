import { useDispatch, useSelector } from 'react-redux'
import { setCurrentStep, markStepComplete } from '../../store/slices/configSlice'

export default function StepContainer({ 
  stepNumber, 
  title, 
  children, 
  onNext,
  onPrevious,
  canGoNext = true 
}) {
  const dispatch = useDispatch()
  const { currentStep } = useSelector((state) => state.config)

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
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-logo bg-clip-text text-transparent">
            Step {stepNumber}: {title}
          </span>
        </h2>
        <div className="h-1 w-24 bg-gradient-logo rounded-full"></div>
      </div>

      {/* Step Content */}
      <div className="bg-dark-surface rounded-2xl p-8 shadow-xl border border-dark-border">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevious}
          disabled={stepNumber === 1}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${stepNumber === 1
              ? 'bg-dark-surface-light text-dark-text-secondary cursor-not-allowed'
              : 'bg-dark-surface text-dark-text hover:bg-dark-surface-light border border-dark-border'
            }
          `}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
            ${canGoNext
              ? 'bg-gradient-primary text-dark-bg hover:shadow-glow hover:scale-105'
              : 'bg-dark-surface-light text-dark-text-secondary cursor-not-allowed'
            }
          `}
        >
          {stepNumber === 5 ? 'Submit' : 'Next Step'}
          {stepNumber !== 5 && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

