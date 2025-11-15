import { useSelector, useDispatch } from 'react-redux'
import { setCurrentStep } from '../../store/slices/configSlice'
import { CheckCircle } from 'lucide-react'

const steps = [
  { id: 1, title: 'General Information' },
  { id: 2, title: 'Finance & Providers' },
  { id: 3, title: 'Products' },
  { id: 4, title: 'DMS Integrations' },
  { id: 5, title: 'Review & Submit' },
]

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch()
  const { currentStep, completedSteps } = useSelector((state) => state.config)

  const handleStepClick = (stepId) => {
    // Allow navigation to any step at any time
    dispatch(setCurrentStep(stepId))
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-gradient-dark border-b border-dark-border px-6 py-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl bg-gradient-logo bg-clip-text text-transparent">✦</span>
          <span className="bg-gradient-logo bg-clip-text text-transparent">
            Dealership Configuration Assistant
          </span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-88px)]">
        {/* Sidebar - Steps Navigation */}
        <aside className="w-full lg:w-80 bg-dark-surface border-b lg:border-b-0 lg:border-r border-dark-border p-6">
          <nav className="space-y-2">
            {steps.map((step) => {
              const isActive = currentStep === step.id
              const isCompleted = completedSteps.includes(step.id)

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    w-full text-left px-6 py-4 rounded-lg transition-all duration-200
                    flex items-center justify-between group cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-primary text-dark-bg shadow-glow font-semibold' 
                      : isCompleted
                      ? 'bg-dark-surface-light text-dark-text hover:bg-dark-border'
                      : 'text-dark-text-secondary hover:bg-dark-surface-light'
                    }
                  `}
                >
                  <span className={`font-medium ${isActive ? 'text-dark-bg' : ''}`}>{step.title}</span>
                  {isCompleted && !isActive && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-dark-bg">
          {children}
        </main>
      </div>
    </div>
  )
}

