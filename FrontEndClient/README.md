# Dealership Configuration Assistant

A modern, multi-step dashboard for configuring dealership integrations with finance providers and DMS systems. Built with React, Redux, and Tailwind CSS.

## Features

✨ **Multi-Step Wizard Interface**
- General Information setup
- Finance provider configuration (RouteOne, DealerTrack)
- Product integration (F&I, PEN) with vendor and product selection
- DMS integration setup
- Review and submit

🎨 **Modern Dark Theme with Gradients**
- Custom gradient colors
- Responsive design for all screen sizes
- Smooth transitions and animations
- Professional UI/UX

🛠 **Tech Stack**
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **TanStack Query** - Server state management
- **Tailwind CSS 3** - Utility-first CSS framework
- **Lucide React** - Icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm preview
```

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── DashboardLayout.jsx    # Main layout with sidebar navigation
│   └── Steps/
│       ├── StepContainer.jsx       # Reusable step wrapper
│       ├── Step1GeneralInfo.jsx    # General information form
│       ├── Step2FinanceProviders.jsx # Finance provider config
│       ├── Step3Products.jsx       # Product integration & configuration
│       ├── Step4DMSIntegrations.jsx  # DMS integration setup
│       └── Step5Review.jsx         # Final review and submit
├── store/
│   ├── slices/
│   │   ├── configSlice.js         # Redux slice for configuration state
│   │   └── productsSlice.js       # Redux slice for products state
│   └── store.js                   # Redux store configuration
├── App.jsx                        # Main application component
├── main.jsx                       # Application entry point
└── index.css                      # Tailwind CSS imports

```

## Color Scheme

The application uses a custom dark theme with gradient accents:

- **Background**: Dark grays (#1a1d25, #252932)
- **Primary**: Blue gradient (#3b82f6 → #2563eb)
- **Secondary**: Cyan (#06b6d4)
- **Accent**: Purple (#8b5cf6)

## State Management

The application uses Redux Toolkit to manage:
- Current step navigation
- Completed steps tracking
- General information
- Finance provider configurations
- Product integration settings (F&I/PEN, vendors, products, configurations)
- DMS integration settings

## Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## Security Features

- Password fields for sensitive data
- Form validation before submission
- Environment variable support for API keys
- No hardcoded credentials

## License

MIT
