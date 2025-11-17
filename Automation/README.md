# Smooth Operators Automation Suite

A comprehensive Playwright test suite for the Smooth Operators dealership configuration platform, organized with flow-wise execution and proper test dependencies.

## 🏗️ Architecture

### Test Flows
The tests are organized into logical flows that represent the user journey through the application:

1. **Setup** - Environment validation and initial setup
2. **Authentication** - Login and access verification
3. **Dealership Configuration** - Dealership information setup
4. **Finance Providers** - Finance provider setup and configuration
5. **Products Configuration** - F&I and PEN products import/setup
6. **API Integrations** - Provider lists and lender imports
7. **DMS Integration** - DMS system integrations
8. **Review & Submit** - Final configuration review and submission

### Flow Dependencies
Each flow has dependencies that must complete before it can run, ensuring proper test sequencing and data setup.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Frontend server running on `http://localhost:5173`
- Backend server running on `http://localhost:3000`

### Installation
```bash
npm install
npx playwright install
```

### Running Tests

#### Flow-wise Execution (Recommended)
```bash
# Run all tests in proper flow sequence
npm run test:flow

# Run with UI mode for debugging
npm run test:flow:ui

# Run with browser visible
npm run test:flow:headed

# Debug mode
npm run test:flow:debug
```

#### Individual Flow Execution
```bash
npm run test:setup         # Setup validation
npm run test:auth          # Authentication
npm run test:dealership    # Dealership configuration
npm run test:finance       # Finance providers
npm run test:products      # Products configuration
npm run test:api           # API integrations
npm run test:dms           # DMS integration
npm run test:review        # Review & submit
```

#### Specialized Test Runs
```bash
npm run test:smoke         # Run only TC1 tests (smoke tests)
npm run test:regression    # Run regression suite
```

#### Legacy Test Execution
```bash
npm run test:review-submit          # Review & Submit tests
npm run test:import-lenders         # Import lenders tests
npm run test:dealership-daisy-chain # Dealership daisy chain tests
```

## 📁 Project Structure

```
Automation/
├── Execution/                 # Test files
│   ├── 00_FullTestSuite.spec.ts
│   ├── 01_Login.spec.ts
│   ├── 02_DealershipInformation.spec.ts
│   └── ... (other test files)
├── fixtures/                  # Shared test fixtures and utilities
│   └── test-fixtures.ts
├── playwright.config.ts       # Playwright configuration
├── test-flows.config.ts       # Flow definitions and dependencies
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test cleanup
└── README.md                 # This file
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- Defines test projects with proper dependencies
- Configures web server auto-start
- Sets up reporting and tracing
- Configures browser settings

### Test Flows Config (`test-flows.config.ts`)
- Defines logical test groupings
- Manages flow dependencies
- Provides utilities for flow management

### Test Fixtures (`fixtures/test-fixtures.ts`)
- Shared test data and constants
- Common helper functions
- Pre-configured page states

## 🧪 Test Organization

### Test Naming Convention
- `TC1:` - Primary/smoke tests
- `TC2:` - UI/layout tests
- `TC3:` - Edge cases and validation
- `TC4:` - Core functionality
- `TC5+:` - Additional scenarios

### Test Categories
- **UI Tests**: User interface validation and interactions
- **API Tests**: Backend API integration testing
- **Flow Tests**: End-to-end user journey testing
- **Daisy Chain Tests**: Sequential dependency testing

## 📊 Reporting

### HTML Report
```bash
npm run report        # Open latest report
npm run report:open   # Open specific report
```

### JSON Results
Test results are saved to `test-results/results.json` for CI/CD integration.

## 🔍 Debugging

### Debug Mode
```bash
npm run test:flow:debug
```

### Browser Developer Tools
Use `--headed` flag to see browser interactions:
```bash
npm run test:flow:headed
```

### Step-by-Step Execution
Use Playwright UI mode for interactive debugging:
```bash
npm run test:flow:ui
```

## 🚨 Troubleshooting

### Common Issues

1. **Frontend/Backend Server Not Running**
   ```bash
   # Start frontend
   cd ../FrontEndClient && npm run dev

   # Start backend
   cd ../server && npm start
   ```

2. **Browser Installation**
   ```bash
   npm run install:browsers
   ```

3. **Test Timeouts**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Verify server responsiveness

### Environment Variables
Create a `.env` file for sensitive configuration:
```env
BASE_URL=http://localhost:5173
API_URL=http://localhost:3000
TEST_USER=username
TEST_PASSWORD=password
```

## 🤝 Contributing

### Adding New Tests
1. Add test file to appropriate flow in `test-flows.config.ts`
2. Update dependencies if needed
3. Add corresponding npm script if creating new flow
4. Update this README

### Test Best Practices
- Use descriptive test names
- Follow existing naming conventions
- Include proper assertions
- Add comments for complex logic
- Use fixtures for common setup

## 📈 CI/CD Integration

The flow-wise setup is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Flow Tests
  run: npm run test:flow
- name: Generate Report
  run: npm run report
```

## 🏷️ Tags and Filtering

Tests can be filtered using tags:
- `@smoke` - Critical path tests
- `@regression` - Regression tests
- `@api` - API-only tests
- `@ui` - UI-only tests

```bash
npx playwright test --grep "@smoke"
```
