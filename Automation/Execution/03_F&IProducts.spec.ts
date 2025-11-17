import { test, expect } from '@playwright/test';

test('Step 3: F&I Products - Import vendors and configure products', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:5173/');

  // Navigate to Products page (Step 3) by clicking on the sidebar button
  await page.click('button:has-text("Products")');
  
  // Wait for the Products page to load
  await page.waitForSelector('text=Products', { state: 'visible' });

  // Select F&I from product integration radio buttons
  await page.getByRole('radio', { name: 'F&I' }).click();
  
  // Wait a moment for the selection to register
  await page.waitForTimeout(500);

  // Enter Dealer ID
  await page.getByLabel('Dealer ID').type('2737');

  // Wait for Import Vendors button to be enabled
  await page.waitForSelector('button:has-text("Import Vendors")', { state: 'visible' });
  
  // Click on Import Vendors button
  await page.click('button:has-text("Import Vendors")');

  // Wait for vendors to load
  await page.waitForSelector('text=Loading vendors...', { state: 'visible' }).catch(() => {});
  // Wait for vendors list to appear (or loading to finish)
  await page.waitForTimeout(2000);

  // Select vendors: "acura" and "acura(safe-guard)"
  // Wait for vendors list to appear (check for vendor count or vendor items)
  await page.waitForSelector('text=Showing', { state: 'visible' }).catch(() => {});
  await page.waitForTimeout(1000);
  
  // Find and click acura vendor checkbox
  // Look for the vendor name in the label and click the associated checkbox
  const acuraVendorLabel = page.locator('label', { hasText: /^acura$/i }).first();
  await acuraVendorLabel.waitFor({ state: 'visible', timeout: 10000 });
  await acuraVendorLabel.click();
  
  // Wait a moment
  await page.waitForTimeout(500);

  // Find and click acura(safe-guard) vendor checkbox
  const acuraSafeGuardLabel = page.locator('label', { hasText: /acura.*safe.*guard/i }).first();
  await acuraSafeGuardLabel.waitFor({ state: 'visible', timeout: 10000 });
  await acuraSafeGuardLabel.click();

  // Wait for Import Products button to be enabled
  await page.waitForSelector('button:has-text("Import Products")', { state: 'visible' });
  await page.waitForTimeout(500);

  // Click on Import Products button
  await page.click('button:has-text("Import Products")');

  // Wait for import to complete and success message to appear
  await page.waitForSelector('text=Import Successful', { state: 'visible', timeout: 30000 });
  
  // Wait for imported products to appear
  await page.waitForSelector('text=maintenance', { state: 'visible' });
  await page.waitForSelector('text=vsc', { state: 'visible' });

  // Verify products are displayed (they should be auto-selected)
  // Wait for product checkboxes to be visible
  await page.waitForTimeout(1000);
  
  // Products should already be auto-selected, but verify they're visible
  // Find maintenance product checkbox
  const maintenanceLabel = page.locator('label', { hasText: /maintenance/i }).first();
  await maintenanceLabel.waitFor({ state: 'visible' });
  
  // Find vsc product checkbox
  const vscLabel = page.locator('label', { hasText: /vsc/i }).first();
  await vscLabel.waitFor({ state: 'visible' });
  
  // Ensure products are selected (click if not already selected)
  const maintenanceCheckbox = maintenanceLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await maintenanceCheckbox.isChecked())) {
    await maintenanceLabel.click();
  }
  
  const vscCheckbox = vscLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await vscCheckbox.isChecked())) {
    await vscLabel.click();
  }

  // Wait for Product Configuration section to appear
  await page.waitForSelector('text=Product Configuration', { state: 'visible' });

  // Configure maintenance product (vendor acura)
  // Find the maintenance product card by looking for the heading with "maintenance" and "acura"
  const maintenanceHeading = page.locator('h4', { hasText: /maintenance.*acura/i }).first();
  await maintenanceHeading.waitFor({ state: 'visible' });
  const maintenanceCard = maintenanceHeading.locator('..').first();
  
  // Select Finance deal type for maintenance
  // Find Finance checkbox within the maintenance card
  const maintenanceFinanceLabel = maintenanceCard.locator('label', { hasText: /^Finance$/ }).first();
  await maintenanceFinanceLabel.waitFor({ state: 'visible' });
  const maintenanceFinanceCheckbox = maintenanceFinanceLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await maintenanceFinanceCheckbox.isChecked())) {
    await maintenanceFinanceLabel.click();
  }
  
  // Select New vehicle type for maintenance
  const maintenanceNewLabel = maintenanceCard.locator('label', { hasText: /^New$/ }).first();
  await maintenanceNewLabel.waitFor({ state: 'visible' });
  const maintenanceNewCheckbox = maintenanceNewLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await maintenanceNewCheckbox.isChecked())) {
    await maintenanceNewLabel.click();
  }

  // Configure vsc product
  // Find the vsc product card
  const vscHeading = page.locator('h4', { hasText: /vsc/i }).first();
  await vscHeading.waitFor({ state: 'visible' });
  const vscCard = vscHeading.locator('..').first();
  
  // Select Cash deal type for vsc
  const vscCashLabel = vscCard.locator('label', { hasText: /^Cash$/ }).first();
  await vscCashLabel.waitFor({ state: 'visible' });
  const vscCashCheckbox = vscCashLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await vscCashCheckbox.isChecked())) {
    await vscCashLabel.click();
  }
  
  // Select Used vehicle type for vsc
  const vscUsedLabel = vscCard.locator('label', { hasText: /^Used$/ }).first();
  await vscUsedLabel.waitFor({ state: 'visible' });
  const vscUsedCheckbox = vscUsedLabel.locator('..').locator('input[type="checkbox"]').first();
  if (!(await vscUsedCheckbox.isChecked())) {
    await vscUsedLabel.click();
  }

  // Wait a moment to ensure all selections are saved
  await page.waitForTimeout(2000);

  // Optional: Pause to see the result
  // await page.pause();
});

