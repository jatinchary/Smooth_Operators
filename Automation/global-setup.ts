import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup that runs before all tests
 * Sets up any global state or configurations needed
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Smooth Operators Automation Test Suite');

  // Check if the frontend server is running
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await browser.close();
    console.log('✅ Frontend server is running');
  } catch (error) {
    console.warn('⚠️  Frontend server may not be running. Make sure to start it with: cd ../FrontEndClient && npm run dev');
  }

  // Check if the backend server is running
  try {
    const response = await fetch('http://localhost:3000/health', { timeout: 5000 });
    if (response.ok) {
      console.log('✅ Backend server is running');
    }
  } catch (error) {
    console.warn('⚠️  Backend server may not be running. Make sure to start it with: cd ../server && npm start');
  }

  console.log('🎯 Global setup complete');
}

export default globalSetup;
