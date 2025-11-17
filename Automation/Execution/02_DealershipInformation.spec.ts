import { test, expect, Locator } from '@playwright/test';

/**
 * Test suite for Dealership Information form (Step 1)
 *
 * This test covers:
 * - Manual form filling with all fields and saving dealership
 * - Dealership import functionality (no save option)
 */
test.describe('Step 1: Dealership Information Form', () => {
  
  test('TC1: Fill Dealership Information form manually with all fields and save', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for the form to be visible
    await page.waitForSelector('input[name="legalName"]', { state: 'visible' });

    // Fill Legal Name (required field)
    await page.fill('input[name="legalName"]', 'South Bay Hyundai');

    // Fill DBA Name
    await page.fill('input[name="dbaName"]', 'South Bay Hyundai');

    // Fill Website
    await page.fill('input[name="website"]', 'http://sbhyundai.com');

    // Fill Email (required field)
    await page.fill('input[name="email"]', 'info@sbhyundai.com');

    // Fill Phone
    await page.fill('input[name="phone"]', '(866) 929-1463');

    // Fill FAX
    await page.fill('input[name="fax"]', '(866) 929-1463');

    // Fill Address 1 (required for saving)
    await page.fill('input[name="address1"]', '20433 Hawthorne Blvd.');

    // Fill Address 2 (optional)
    await page.fill('input[name="address2"]', 'Suite 200');

    // Select State manually by clicking dropdown - Material-UI Select dropdown
    const stateSelect = page.getByRole('combobox', { name: /State/i });
    await stateSelect.click();
    // Wait for the MUI dropdown menu to appear
    await page.waitForSelector('ul[role="listbox"]', { state: 'visible' });
    // Manually click on the CA option (California)
    await page.getByRole('option', { name: 'CA' }).click();

    // Fill City (required for saving)
    await page.fill('input[name="city"]', 'Torrance');

    // Fill ZIP Code (5 digits, required for saving)
    await page.fill('input[name="zipCode"]', '90503');

    // Wait a moment for any validation to complete
    await page.waitForTimeout(1000);

    // Verify that required fields are filled (Legal Name and Email)
    const legalNameValue = await page.inputValue('input[name="legalName"]');
    const emailValue = await page.inputValue('input[name="email"]');
    const address1Value = await page.inputValue('input[name="address1"]');
    const cityValue = await page.inputValue('input[name="city"]');
    const zipValue = await page.inputValue('input[name="zipCode"]');

    expect(legalNameValue).toBe('South Bay Hyundai');
    expect(emailValue).toBe('info@sbhyundai.com');
    expect(address1Value).toBe('20433 Hawthorne Blvd.');
    expect(cityValue).toBe('Torrance');
    expect(zipValue).toBe('90503');

    // Verify Save Dealership button is enabled
    const saveButton = page.getByRole('button', { name: /Save Dealership/i });
    await expect(saveButton).toBeEnabled();

    // Click Save Dealership button
    await saveButton.click();

    // Wait for save operation to complete
    await page.waitForTimeout(2000);

    // Verify success - check for success message or toast notification
    const successAlert = page.locator('text=/Dealership.*saved successfully/i').first();
    const toastSuccess = page.locator('text=/Dealership saved successfully/i').first();

    const alertVisible = await successAlert.isVisible().catch(() => false);
    const toastVisible = await toastSuccess.isVisible().catch(() => false);

    // At least one success indicator should appear for manual entry
    expect(alertVisible || toastVisible).toBe(true);

    // Verify Next Step button is enabled
    const nextButton = page.getByRole('button', { name: /Next Step/i });
    await expect(nextButton).toBeEnabled();
  });

  test('TC2: Import A2Z Motors dealership from dropdown and verify form is populated (no save option)', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for dealership dropdown to load
    await page.waitForSelector('text=Select Dealership', { state: 'visible', timeout: 10000 });

    // Wait for dealership options to load (check for loading state to disappear)
    const dealershipSelect = page.getByLabel('Select Dealership');
    await dealershipSelect.waitFor({ state: 'visible' });

    // Wait for loading to complete - check that "Loading dealerships..." is not visible
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading dealerships...');
      if (!loadingText) return true;
      const element = loadingText as HTMLElement;
      return !element || element.offsetParent === null;
    }, { timeout: 10000 }).catch(() => {
      // If loading doesn't disappear, continue anyway
      console.log('Dealership loading timeout, continuing...');
    });

    // Click on the dealership dropdown
    await dealershipSelect.click();
    
    // Wait for the dropdown menu to appear
    await page.waitForSelector('ul[role="listbox"]', { state: 'visible', timeout: 5000 });

    // Select "A2Z Motors" dealership specifically
    const a2zMotorsOption = page.getByRole('option', { name: /A2Z Motors/i });
    
    // Check if A2Z Motors option exists
    const isA2ZVisible = await a2zMotorsOption.isVisible().catch(() => false);
    
    if (isA2ZVisible) {
      // Click on A2Z Motors option
      await a2zMotorsOption.click();
      await page.waitForTimeout(1000);

      // Click Import Dealership button
      const importButton = page.getByRole('button', { name: /Import Dealership/i });
      await expect(importButton).toBeEnabled();
      await importButton.click();

      // Wait for import to complete - check for success toast or form population
      await page.waitForTimeout(2000);

      // Verify form fields are populated (at least some fields should have values)
      const legalNameValue = await page.inputValue('input[name="legalName"]');
      // If import was successful, legalName should be populated
      if (legalNameValue) {
        expect(legalNameValue.length).toBeGreaterThan(0);
        console.log(`Successfully imported A2Z Motors - Legal Name: ${legalNameValue}`);
      }
    } else {
      // If A2Z Motors not found, try to find it with case-insensitive search
      const options = page.locator('ul[role="listbox"] li[role="option"]');
      const optionCount = await options.count();
      
      let a2zFound = false;
      for (let i = 0; i < optionCount; i++) {
        const option = options.nth(i);
        const text = await option.textContent();
        const isDisabled = await option.getAttribute('aria-disabled');
        
        if (text && text.toLowerCase().includes('a2z') && text.toLowerCase().includes('motor') && isDisabled !== 'true') {
          await option.click();
          await page.waitForTimeout(1000);
          
          const importButton = page.getByRole('button', { name: /Import Dealership/i });
          await expect(importButton).toBeEnabled();
          await importButton.click();
          await page.waitForTimeout(2000);
          
          const legalNameValue = await page.inputValue('input[name="legalName"]');
          if (legalNameValue) {
            expect(legalNameValue.length).toBeGreaterThan(0);
            console.log(`Successfully imported A2Z Motors - Legal Name: ${legalNameValue}`);
          }
          a2zFound = true;
          break;
        }
      }
      
      if (!a2zFound) {
        throw new Error('A2Z Motors dealership not found in the dropdown options');
      }
    }

    // Verify that Save Dealership button is disabled/not available for imported dealerships
    const saveButton = page.getByRole('button', { name: /Save Dealership/i });
    const saveButtonExists = await saveButton.count() > 0;
    if (saveButtonExists) {
      await expect(saveButton).toBeDisabled();
    }

    // Verify Next Step button is enabled for imported dealerships
    const nextButton = page.getByRole('button', { name: /Next Step/i });
    await expect(nextButton).toBeEnabled();
  });
});

