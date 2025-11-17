import { test as baseTest, Page, expect } from '@playwright/test';

/**
 * Extended test fixtures for Smooth Operators application
 */
type TestFixtures = {
  authenticatedPage: Page;
  dealershipConfiguredPage: Page;
  financeProviderConfiguredPage: Page;
  productsConfiguredPage: Page;
};

/**
 * Common test data
 */
export const TEST_DATA = {
  dealership: {
    legalName: 'Test Dealership Corp',
    dbaName: 'Test DBA',
    website: 'https://testdealership.com',
    email: 'contact@testdealership.com',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    address1: '123 Test Street',
    address2: 'Suite 100',
    city: 'Test City',
    state: 'California',
    zipCode: '12345',
    country: 'United States'
  },
  dealerId: '2737'
};

/**
 * Helper functions for common test actions
 */
export class TestHelpers {
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  static async fillDealershipForm(page: Page, data = TEST_DATA.dealership): Promise<void> {
    await page.waitForSelector('input[name="legalName"]', { state: 'visible' });

    await page.fill('input[name="legalName"]', data.legalName);
    await page.fill('input[name="dbaName"]', data.dbaName);
    await page.fill('input[name="website"]', data.website);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="phone"]', data.phone);
    await page.fill('input[name="fax"]', data.fax);
    await page.fill('input[name="address1"]', data.address1);
    await page.fill('input[name="address2"]', data.address2);
    await page.fill('input[name="city"]', data.city);

    // Select state
    await page.click('[data-testid="state-select"]');
    await page.click(`text="${data.state}"`);

    await page.fill('input[name="zipCode"]', data.zipCode);
    await page.fill('input[name="country"]', data.country);
  }

  static async navigateToStep(page: Page, stepNumber: number): Promise<void> {
    const stepSelectors = {
      1: 'text="General Information"',
      2: 'text="Finance & Providers"',
      3: 'text="Products"',
      4: 'text="DMS Integrations"',
      5: 'text="Review & Submit"'
    };

    await page.click(`button:has-text("${stepSelectors[stepNumber]}")`);
    await page.waitForSelector(`text="Step ${stepNumber}:"`, { state: 'visible' });
  }

  static async saveAndContinue(page: Page): Promise<void> {
    await page.click('button:has-text("Save Dealership")');
    await page.click('button:has-text("Next Step")');
  }

  static async waitForToastMessage(page: Page, message: string, timeout = 5000): Promise<boolean> {
    try {
      await page.waitForSelector(`text=${message}`, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  static async dismissToastIfPresent(page: Page): Promise<void> {
    const dismissSelectors = [
      'button[aria-label*="close"]',
      'button[aria-label*="dismiss"]',
      '.close-button',
      '[data-testid="close-toast"]',
      'button:has-text("×")',
      'button:has-text("Close")'
    ];

    for (const selector of dismissSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click();
          return;
        }
      } catch {
        continue;
      }
    }
  }
}

/**
 * Extended test with custom fixtures
 */
export const test = baseTest.extend<TestFixtures>({
  // Fixture for authenticated page
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');
    await TestHelpers.waitForPageLoad(page);
    await expect(page).toHaveTitle("Dealership Configuration");
    await use(page);
  },

  // Fixture for page with dealership configured
  dealershipConfiguredPage: async ({ authenticatedPage }, use) => {
    await TestHelpers.fillDealershipForm(authenticatedPage);
    await TestHelpers.saveAndContinue(authenticatedPage);
    await use(authenticatedPage);
  },

  // Fixture for page with finance provider configured
  financeProviderConfiguredPage: async ({ dealershipConfiguredPage }, use) => {
    await TestHelpers.navigateToStep(dealershipConfiguredPage, 2);
    // Add finance provider setup logic here if needed
    await use(dealershipConfiguredPage);
  },

  // Fixture for page with products configured
  productsConfiguredPage: async ({ financeProviderConfiguredPage }, use) => {
    await TestHelpers.navigateToStep(financeProviderConfiguredPage, 3);
    // Add product setup logic here if needed
    await use(financeProviderConfiguredPage);
  },
});

export { expect };
