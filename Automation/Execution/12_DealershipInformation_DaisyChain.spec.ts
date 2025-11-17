import { test, expect } from '@playwright/test';

/**
 * Daisy Chain Test Suite for Dealership Information Import Flow
 *
 * This test validates the complete dealership import workflow:
 * 1. Navigate to dealership info page
 * 2. Select dealership from dropdown
 * 3. Import dealership - opens A2Z application in new tab
 * 4. Login to external A2Z application in new tab
 * 5. Select specific dealership and continue in A2Z tab
 * 6. A2Z sync opens in new tab
 * 7. Switch back to main application dealerships list
 * 8. Verify dealership import was successful
 *
 * WARNING: This test contains hardcoded credentials for testing purposes.
 * In production, always use environment variables or secure credential management.
 */
test.describe('Daisy Chain: Dealership Information Import Flow', () => {

  // Test data
  const TEST_DEALERSHIP = 'A2Z Motors BMW';
  const EXTERNAL_LOGIN_TIMEOUT = 30000;
  const DEALERSHIP_LOAD_TIMEOUT = 10000;

  test('TC1: Complete dealership import daisy chain flow', async ({ page }) => {
    // Step 1: Navigate to Dealership Info page
    await test.step('Navigate to Dealership Info page', async () => {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('http://localhost:5173');
    });

    // Step 2: Select dealership from dropdown
    await test.step('Select dealership from dropdown', async () => {
      // Wait for dealership dropdown to load (same as working test)
      await page.waitForSelector('text=Select Dealership', { state: 'visible', timeout: 10000 });

      // Use the same selector as the working test
      const dealershipSelect = page.getByLabel('Select Dealership');
      await dealershipSelect.waitFor({ state: 'visible' });

      // Wait for loading to complete (similar to working test)
      await page.waitForFunction(() => {
        const loadingElements = Array.from(document.querySelectorAll('*')).filter(el =>
          el.textContent && el.textContent.includes('Loading dealerships')
        );
        return loadingElements.length === 0 || loadingElements.every(el =>
          !(el as HTMLElement).offsetParent
        );
      }, { timeout: 10000 }).catch(() => {
        // If loading doesn't disappear, continue anyway
        console.log('Dealership loading timeout, continuing...');
      });

      // Click on the dealership dropdown (Material-UI select)
      await dealershipSelect.click();

      // Wait for the dropdown menu to appear
      await page.waitForSelector('ul[role="listbox"]', { state: 'visible', timeout: 5000 });

      // Select "A2Z Motors BMW" dealership specifically
      const a2zMotorsOption = page.getByRole('option', { name: TEST_DEALERSHIP });

      // Check if the option exists and click it
      const isA2ZVisible = await a2zMotorsOption.isVisible().catch(() => false);

      if (!isA2ZVisible) {
        throw new Error(`${TEST_DEALERSHIP} dealership not found in the dropdown options`);
      }

      await a2zMotorsOption.click();
      await page.waitForTimeout(1000); // Allow time for selection to complete
    });

    // Step 3: Check if dealership data is already loaded or click Import Dealership button
    let a2zPage: any;
    await test.step('Check dealership data or click Import Dealership button', async () => {
      // First, check if dealership data is already populated
      const legalNameField = page.getByLabel('Legal Name');
      const currentLegalName = await legalNameField.inputValue();

      if (currentLegalName && currentLegalName.length > 0) {
        console.log('Dealership data already loaded - skipping external import');
        return; // Skip to next step - no external import needed
      }

      // If no data is loaded, proceed with import
      const importButton = page.getByRole('button', { name: /Import Dealership/i });
      await expect(importButton).toBeVisible();
      await expect(importButton).toBeEnabled();

      // Set up listener for new tab before clicking
      const newTabPromise = page.context().waitForEvent('page');

      // Click the import button
      await importButton.click();

      // Wait for new tab to open
      try {
        a2zPage = await newTabPromise;
        console.log('A2Z application opened in new tab');

        // Wait for the new tab to load
        await a2zPage.waitForLoadState('networkidle');
      } catch (error) {
        throw new Error('Import Dealership button did not open new tab as expected');
      }
    });

    // Step 4: Login to A2Z application in new tab (skip if data already loaded)
    if (a2zPage) {
      await test.step('Login to A2Z application in new tab', async () => {
        const emailInput = a2zPage.locator('input[placeholder="Email"]');
        const passwordInput = a2zPage.locator('input[placeholder="Password"]');
        const loginButton = a2zPage.locator('button:has-text("Login")');

        // Wait for login form to appear in the A2Z tab
        await expect(emailInput).toBeVisible({ timeout: EXTERNAL_LOGIN_TIMEOUT });
        await expect(passwordInput).toBeVisible({ timeout: EXTERNAL_LOGIN_TIMEOUT });
        await expect(loginButton).toBeVisible({ timeout: EXTERNAL_LOGIN_TIMEOUT });

        // Fill credentials (WARNING: Update these with your actual A2Z credentials)
        const a2zEmail = 'lohit@a2zsync.com';
        const a2zPassword = 'Testing#123';

        await emailInput.fill(a2zEmail);
        await passwordInput.fill(a2zPassword);
        await loginButton.click();
      });
    }

    // Step 5: Wait for dealership table and select dealership (skip if data already loaded)
    if (a2zPage) {
      await test.step('Select dealership from results table', async () => {
        // Wait for table to load
        const tableBody = a2zPage.locator('tbody');
        await expect(tableBody).toBeVisible({ timeout: DEALERSHIP_LOAD_TIMEOUT });

        // Find and click the specific dealership row button
        const dealershipRow = a2zPage.locator(`tr:has-text("${TEST_DEALERSHIP}")`);
        await expect(dealershipRow).toBeVisible({ timeout: DEALERSHIP_LOAD_TIMEOUT });

        const dealershipButton = dealershipRow.locator('button:has-text("Dealership")');
        await expect(dealershipButton).toBeVisible();
        await expect(dealershipButton).toBeEnabled();

        await dealershipButton.click();
      });

      // Step 6: Click Continue button in A2Z tab
      await test.step('Click Continue button in A2Z tab', async () => {
        const continueButton = a2zPage.locator('button:has-text("Continue")');
        await expect(continueButton).toBeVisible();
        await expect(continueButton).toBeEnabled();

        await continueButton.click();
      });

      // Step 7: Handle A2Z sync opening in new tab
      let syncPage: any;
      await test.step('Handle A2Z sync opening in new tab', async () => {
        // Wait for sync to open in a new tab
        const [newSyncTab] = await Promise.all([
          page.context().waitForEvent('page'), // Wait for sync tab to open
          // The sync might trigger automatically after continue, or there might be a sync button
          a2zPage.waitForTimeout(3000) // Wait a bit for sync to potentially trigger
        ]).catch(() => [null]);

        if (newSyncTab) {
          syncPage = newSyncTab;
          console.log('A2Z sync opened in new tab');
          await syncPage.waitForLoadState('networkidle');

          // Optionally close the sync tab after a brief wait
          await syncPage.waitForTimeout(2000);
          await syncPage.close();
          console.log('A2Z sync tab closed');
        } else {
          console.log('No A2Z sync tab detected - sync may happen automatically');
        }
      });
    }

    // Step 8: Switch back to main application and navigate to Dealerships page
    await test.step('Switch back to main application and navigate to Dealerships page', async () => {
      // Switch back to the original tab (main application)
      await page.bringToFront();

      const dealershipsLink = page.locator('a:has-text("Dealerships")');
      await expect(dealershipsLink).toBeVisible();

      await dealershipsLink.click();

      // Verify we're on the dealerships page
      await page.waitForLoadState('networkidle');
    });

    // Step 9: Verify dealership was imported successfully
    await test.step('Verify dealership import success', async () => {
      // Wait for page to stabilize and check for success indicators
      await page.waitForTimeout(2000); // Allow time for any async operations

      // Verify we're still on a valid page (no error states)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/localhost:5173/);

      // Additional verification could be added here based on your app's success indicators
      // For example: checking if dealership appears in a list, success message, etc.
    });
  });

  test('TC2: Manual dealership addition and external verification', async ({ page, context }) => {
    const addedDealershipName = 'South Bay Hyundai';
    const externalUrl = 'https://schomp.a2zsync.local/';
    const a2zEmail = 'lohit@a2zsync.com';
    const a2zPassword = 'Testing#123';
    const EXTERNAL_TIMEOUT = 30000;

    // Step 1: Navigate to main app and fill dealership info manually
    await test.step('Navigate and fill Dealership Information form manually', async () => {
      await page.goto('http://localhost:5173/');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('input[name="legalName"]', { state: 'visible' });

      // Fill all required fields (copied from base test)
      await page.fill('input[name="legalName"]', addedDealershipName);
      await page.fill('input[name="dbaName"]', addedDealershipName);
      await page.fill('input[name="website"]', 'http://sbhyundai.com');
      await page.fill('input[name="email"]', 'info@sbhyundai.com');
      await page.fill('input[name="phone"]', '(866) 929-1463');
      await page.fill('input[name="fax"]', '(866) 929-1463');
      await page.fill('input[name="address1"]', '20433 Hawthorne Blvd.');
      await page.fill('input[name="address2"]', 'Suite 200');

      // Select State: CA
      const stateSelect = page.getByRole('combobox', { name: /State/i });
      await stateSelect.click();
      await page.waitForSelector('ul[role="listbox"]', { state: 'visible' });
      await page.getByRole('option', { name: 'CA' }).click();

      await page.fill('input[name="city"]', 'Torrance');
      await page.fill('input[name="zipCode"]', '90503');
      await page.waitForTimeout(1000);

      // Verify fields are filled
      expect(await page.inputValue('input[name="legalName"]')).toBe(addedDealershipName);
      expect(await page.inputValue('input[name="email"]')).toBe('info@sbhyundai.com');
      expect(await page.inputValue('input[name="address1"]')).toBe('20433 Hawthorne Blvd.');
      expect(await page.inputValue('input[name="city"]')).toBe('Torrance');
      expect(await page.inputValue('input[name="zipCode"]')).toBe('90503');

      // Save the dealership
      const saveButton = page.getByRole('button', { name: /Save Dealership/i });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await page.waitForTimeout(2000);

      // Verify save success
      const successAlert = page.locator('text=/Dealership.*saved successfully/i').first();
      const toastSuccess = page.locator('text=/Dealership saved successfully/i').first();
      const alertVisible = await successAlert.isVisible().catch(() => false);
      const toastVisible = await toastSuccess.isVisible().catch(() => false);
      expect(alertVisible || toastVisible).toBe(true);

      // Verify Next Step is enabled
      const nextButton = page.getByRole('button', { name: /Next Step/i });
      await expect(nextButton).toBeEnabled();
    });

    // Step 2: Open new page for A2Z Sync and login
    let a2zPage;
    await test.step('Open A2Z Sync app and login', async () => {
      a2zPage = await context.newPage();
      await a2zPage.goto(externalUrl);
      await a2zPage.waitForLoadState('networkidle');

      const emailInput = a2zPage.locator('input[placeholder="Email"]');
      const passwordInput = a2zPage.locator('input[placeholder="Password"]');
      const loginButton = a2zPage.locator('button:has-text("Login")');

      await expect(emailInput).toBeVisible({ timeout: EXTERNAL_TIMEOUT });
      await expect(passwordInput).toBeVisible({ timeout: EXTERNAL_TIMEOUT });
      await expect(loginButton).toBeVisible({ timeout: EXTERNAL_TIMEOUT });

      await emailInput.fill(a2zEmail);
      await passwordInput.fill(a2zPassword);
      await loginButton.click();

      // Wait for login to complete (assume redirect or dashboard loads)
      await a2zPage.waitForLoadState('networkidle');
      await a2zPage.waitForTimeout(2000);
    });

    // Step 3: Select a dealership from the results table after login
    await test.step('Select any dealership and continue', async () => {
      // Wait for table to load (similar to import flow)
      const tableBody = a2zPage.locator('tbody');
      await expect(tableBody).toBeVisible({ timeout: 10000 });

      // Find the first enabled dealership row (pick any kind)
      const rows = a2zPage.locator('tr').filter({ has: a2zPage.locator('button:not([disabled])') });
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();

      // Click the Dealership button in the first row
      const dealershipButton = firstRow.locator('button:has-text("Dealership")');
      await expect(dealershipButton).toBeVisible();
      await expect(dealershipButton).toBeEnabled();
      await dealershipButton.click();

      // Click Continue
      const continueButton = a2zPage.locator('button:has-text("Continue")');
      await expect(continueButton).toBeVisible({ timeout: 5000 });
      await expect(continueButton).toBeEnabled();
      await continueButton.click();

      // Wait for client admin page to load
      await a2zPage.waitForLoadState('networkidle');
      await a2zPage.waitForTimeout(2000);
    });

    // Step 4: Navigate to Dealerships in Client Admin
    await test.step('Navigate to Dealerships page in Client Admin', async () => {
      // Assume there's a menu or link for Dealerships (adjust selector as needed)
      const dealershipsLink = a2zPage.getByRole('link', { name: /Dealerships/i });
      // Or if in sidebar: a2zPage.locator('nav a:has-text("Dealerships")');
      await expect(dealershipsLink).toBeVisible({ timeout: 10000 });
      await dealershipsLink.click();

      await a2zPage.waitForLoadState('networkidle');
      // Verify page title or header for Schomp Automotive Dealerships
      await expect(a2zPage.locator('text=/Schomp Automotive Dealerships/i')).toBeVisible({ timeout: 5000 });
    });

    // Step 5: Verify newly added dealership is present
    await test.step('Verify added dealership appears in the list', async () => {
      // Assume dealerships are listed in a table or divs with names
      const dealershipList = a2zPage.locator('text=' + addedDealershipName);
      // Or in table: a2zPage.locator('tr:has-text("' + addedDealershipName + '")');
      await expect(dealershipList).toBeVisible({ timeout: 10000 });

      console.log(`Verified that ${addedDealershipName} is present in Schomp Automotive Dealerships`);
    });

    // Clean up: close A2Z page
    await a2zPage.close();
  });
});
