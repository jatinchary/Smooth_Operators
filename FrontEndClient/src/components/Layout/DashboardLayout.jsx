import { useSelector, useDispatch } from "react-redux";
import { setCurrentStep } from "../../store/slices/configSlice";
import { CheckCircle } from "lucide-react";
import ThemeSwitcher from "../ThemeSwitcher";

const steps = [
  { id: 1, title: "Dealership Information" },
  { id: 2, title: "Finance & Providers" },
  { id: 3, title: "Products" },
  { id: 4, title: "DMS Integrations" },
  { id: 5, title: "Review" },
];

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const { currentStep, completedSteps } = useSelector((state) => state.config);

  const handleStepClick = (stepId) => {
    // Allow navigation to any step at any time
    dispatch(setCurrentStep(stepId));
  };

  const currentTheme = useSelector((state) => state.config.theme || 'gold')
  
  return (
    <div className={`min-h-screen ${currentTheme === 'blue' ? 'bg-white' : 'bg-dark-bg'}`}>
      <ThemeSwitcher />
      {/* Header - Fixed at top */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${currentTheme === 'blue' ? 'bg-white border-b border-gray-200' : 'bg-gradient-dark border-b border-dark-border'} px-6 py-6`}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl bg-gradient-logo bg-clip-text text-transparent">
            ✦
          </span>
          <span className="bg-gradient-logo bg-clip-text text-transparent">
            Dealership Configuration Assistant
          </span>
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row pt-[88px]">
        {/* Sidebar - Fixed on left */}
        <aside className={`fixed top-[88px] left-0 bottom-0 w-full lg:w-80 ${currentTheme === 'blue' ? 'bg-white border-b lg:border-b-0 lg:border-r border-gray-200' : 'bg-dark-surface border-b lg:border-b-0 lg:border-r border-dark-border'} p-6 z-40`}>
          <nav className="space-y-2">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    w-full text-left px-6 py-4 rounded-xl state-layer
                    flex items-center justify-between group cursor-pointer
                    [transition:all_var(--md-sys-motion-duration-short4)_var(--md-sys-motion-easing-emphasized)]
                    ${
                      isActive
                        ? currentTheme === 'blue'
                          ? "bg-gradient-primary text-white elevation-1 font-semibold"
                          : "bg-gradient-primary text-dark-bg elevation-1 font-semibold"
                        : isCompleted
                        ? currentTheme === 'blue'
                          ? "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:elevation-1"
                          : "bg-dark-surface-light text-dark-text hover:bg-dark-border hover:elevation-1"
                        : currentTheme === 'blue'
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-dark-text-secondary hover:bg-dark-surface-light"
                    }
                  `}
                >
                  <span
                    className={`font-medium ${isActive ? (currentTheme === 'blue' ? "text-white" : "text-dark-bg") : ""}`}
                  >
                    {step.title}
                  </span>
                  {isCompleted && !isActive && (
                    <CheckCircle className="w-5 h-5 text-brand-focus" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area - Scrollable */}
        <main className={`flex-1 lg:ml-80 min-h-[calc(100vh-88px)] overflow-y-auto ${currentTheme === 'blue' ? 'bg-gray-50' : 'bg-dark-bg'}`}>{children}</main>
      </div>
    </div>
  );
}
