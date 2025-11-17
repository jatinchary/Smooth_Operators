/**
 * Test Flow Configuration for Smooth Operators
 * Defines the logical flow of tests and their dependencies
 */

export interface TestFlow {
  name: string;
  description: string;
  tests: string[];
  dependencies: string[];
  parallel: boolean;
}

export const TEST_FLOWS: TestFlow[] = [
  {
    name: 'setup',
    description: 'Initial setup and environment validation',
    tests: ['00_FullTestSuite.spec.ts'],
    dependencies: [],
    parallel: false
  },
  {
    name: 'authentication',
    description: 'Login and authentication flow',
    tests: ['01_Login.spec.ts'],
    dependencies: ['setup'],
    parallel: false
  },
  {
    name: 'dealership-configuration',
    description: 'Dealership information setup and validation',
    tests: [
      '02_DealershipInformation.spec.ts',
      '12_DealershipInformation_DaisyChain.spec.ts'
    ],
    dependencies: ['authentication'],
    parallel: false
  },
  {
    name: 'finance-providers',
    description: 'Finance provider setup and configuration',
    tests: [
      '10_SetupFinanceProvider_API.spec.ts',
      '11_SetupFinanceProvider_DaisyChain.spec.ts'
    ],
    dependencies: ['dealership-configuration'],
    parallel: false
  },
  {
    name: 'products-configuration',
    description: 'F&I and PEN products import and configuration',
    tests: [
      '03_F&IProducts.spec.ts',
      '04_PENProducts.spec.ts',
      '05_DealerProduct_API.spec.ts',
      '07_ProductList_API.spec.ts',
      '08_ImportProducts_API.spec.ts'
    ],
    dependencies: ['finance-providers'],
    parallel: true // These can run in parallel within the flow
  },
  {
    name: 'api-integrations',
    description: 'API integrations and data synchronization',
    tests: [
      '06_ProviderList_API.spec.ts',
      '09_ImportCreditAppLenders_API.spec.ts'
    ],
    dependencies: ['products-configuration'],
    parallel: true
  },
  {
    name: 'dms-integration',
    description: 'DMS system integrations',
    tests: ['04_DMSIntegrations.spec.ts'],
    dependencies: ['api-integrations'],
    parallel: false
  },
  {
    name: 'review-submit',
    description: 'Final review and submission flow',
    tests: ['05_ReviewSubmit.spec.ts'],
    dependencies: ['dms-integration'],
    parallel: false
  }
];

/**
 * Get test flow by name
 */
export function getTestFlow(name: string): TestFlow | undefined {
  return TEST_FLOWS.find(flow => flow.name === name);
}

/**
 * Get all tests in a specific flow
 */
export function getTestsInFlow(flowName: string): string[] {
  const flow = getTestFlow(flowName);
  return flow ? flow.tests : [];
}

/**
 * Get all flows that a test belongs to
 */
export function getFlowsForTest(testFile: string): TestFlow[] {
  return TEST_FLOWS.filter(flow => flow.tests.includes(testFile));
}

/**
 * Get execution order for all flows
 */
export function getExecutionOrder(): TestFlow[] {
  const executed = new Set<string>();
  const result: TestFlow[] = [];

  function addFlow(flow: TestFlow) {
    if (executed.has(flow.name)) return;

    // Add dependencies first
    for (const dep of flow.dependencies) {
      const depFlow = getTestFlow(dep);
      if (depFlow) addFlow(depFlow);
    }

    executed.add(flow.name);
    result.push(flow);
  }

  for (const flow of TEST_FLOWS) {
    addFlow(flow);
  }

  return result;
}

/**
 * Validate flow dependencies
 */
export function validateFlowDependencies(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const flowNames = new Set(TEST_FLOWS.map(f => f.name));

  for (const flow of TEST_FLOWS) {
    for (const dep of flow.dependencies) {
      if (!flowNames.has(dep)) {
        errors.push(`Flow "${flow.name}" depends on unknown flow "${dep}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
