import { test, expect } from '@playwright/test';

test('Step 1: Login - Verify page title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Dealership Configuration");
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
});

