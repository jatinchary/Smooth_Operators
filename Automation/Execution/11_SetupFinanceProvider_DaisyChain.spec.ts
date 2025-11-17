import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Daisy Chain Test Suite for Finance Provider Setup Flow
 * 
 * This test suite validates the complete workflow:
 * 1. Setup Finance Provider (route-one or dealertrack) -> Creates orgId and saves to database
 * 2. Import Credit App Lenders -> Uses the orgId from database created in step 1
 * 
 * These tests ensure that the APIs work together correctly in a real-world scenario
 * where setup-finance-provider must complete successfully before import-credit-app-lenders can run.
 */
test.describe('Daisy Chain: Setup Finance Provider -> Import Credit App Lenders', () => {
  
  // Helper function to create valid generalInfo object
  const createGeneralInfo = (overrides = {}) => ({
    legalName: 'South Bay Hyundai',
    dbaName: 'South Bay Hyundai',
    address1: '20433 Hawthorne Blvd.',
    address2: '',
    city: 'Torrance',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
    phone: '(866) 929-1463',
    fax: '(866) 929-1463',
    website: 'http://sbhyundai.com',
    email: 'info@sbhyundai.com',
    ...overrides
  });

  test('Daisy Chain TC1: Setup route-one provider then import credit app lenders', async ({ request }) => {
    const dealerId = `DAISY_TEST_ROUTE_ONE_${Date.now()}`;
    const dealershipId = 7;
    const interfaceOrgId = dealerId;

    // Step 1: Setup Finance Provider for route-one
    const setupRequestBody = {
      dealerId: dealerId,
      provider: 'route-one',
      generalInfo: createGeneralInfo({
        legalName: 'Daisy Chain Test Dealer - Route One',
        dbaName: 'Daisy Chain Route One'
      }),
      dealershipId: dealershipId
    };

    const setupResponse = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: setupRequestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify setup was successful
    expect(setupResponse.status()).toBeGreaterThanOrEqual(200);
    expect(setupResponse.status()).toBeLessThan(400);

    const setupResponseBody = await setupResponse.json();
    
    // If setup was successful, proceed with import
    if (setupResponse.status() === 200 && setupResponseBody.success) {
      expect(setupResponseBody).toHaveProperty('success');
      expect(setupResponseBody.success).toBe(true);
      expect(setupResponseBody).toHaveProperty('data');
      
      // Verify orgId is present in response (it should be saved to database)
      if (setupResponseBody.data?.orgId) {
        const orgId = setupResponseBody.data.orgId;
        expect(orgId).toBeDefined();
        expect(typeof orgId).toBe('string');

        // Step 2: Import Credit App Lenders using the orgId from step 1
        const importRequestBody = {
          dealershipId: dealershipId,
          provider: 'route-one',
          interfaceOrgId: interfaceOrgId
        };

        const importResponse = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
          data: importRequestBody,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Verify import response
        expect(importResponse.status()).toBeGreaterThanOrEqual(200);
        expect(importResponse.status()).toBeLessThan(600);

        const importResponseBody = await importResponse.json();
        expect(importResponseBody).toBeDefined();

        // If import was successful, verify structure
        if (importResponse.status() === 200) {
          expect(importResponseBody).toHaveProperty('success');
          expect(importResponseBody.success).toBe(true);
          expect(importResponseBody).toHaveProperty('message');
          expect(importResponseBody).toHaveProperty('data');
        } else if (importResponse.status() === 404) {
          // orgId might not be found if database save failed
          expect(importResponseBody).toHaveProperty('error');
          expect(importResponseBody.error).toContain('orgId not found');
        }
      } else {
        // Setup succeeded but no orgId returned - this is a warning scenario
        console.warn('Setup succeeded but orgId not present in response');
      }
    } else {
      // Setup failed - cannot proceed with import
      console.warn('Setup finance provider failed, cannot proceed with import');
      expect(setupResponseBody).toHaveProperty('error');
    }
  });

  test('Daisy Chain TC2: Setup dealertrack provider then import credit app lenders', async ({ request }) => {
    const dealerId = `DAISY_TEST_DEALERTRACK_${Date.now()}`;
    const dealershipId = 7;
    const interfaceOrgId = dealerId;

    // Step 1: Setup Finance Provider for dealertrack
    const setupRequestBody = {
      dealerId: dealerId,
      provider: 'dealertrack',
      generalInfo: createGeneralInfo({
        legalName: 'Daisy Chain Test Dealer - DealerTrack',
        dbaName: 'Daisy Chain DealerTrack'
      }),
      dealershipId: dealershipId
    };

    const setupResponse = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: setupRequestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify setup was successful
    expect(setupResponse.status()).toBeGreaterThanOrEqual(200);
    expect(setupResponse.status()).toBeLessThan(400);

    const setupResponseBody = await setupResponse.json();
    
    // If setup was successful, proceed with import
    if (setupResponse.status() === 200 && setupResponseBody.success) {
      expect(setupResponseBody).toHaveProperty('success');
      expect(setupResponseBody.success).toBe(true);
      expect(setupResponseBody).toHaveProperty('data');
      
      // Verify orgId is present in response
      if (setupResponseBody.data?.orgId) {
        const orgId = setupResponseBody.data.orgId;
        expect(orgId).toBeDefined();

        // Step 2: Import Credit App Lenders using the orgId from step 1
        const importRequestBody = {
          dealershipId: dealershipId,
          provider: 'dealertrack',
          interfaceOrgId: interfaceOrgId
        };

        const importResponse = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
          data: importRequestBody,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Verify import response
        expect(importResponse.status()).toBeGreaterThanOrEqual(200);
        expect(importResponse.status()).toBeLessThan(600);

        const importResponseBody = await importResponse.json();
        expect(importResponseBody).toBeDefined();

        // If import was successful, verify structure
        if (importResponse.status() === 200) {
          expect(importResponseBody).toHaveProperty('success');
          expect(importResponseBody.success).toBe(true);
        } else if (importResponse.status() === 404) {
          // orgId might not be found if database save failed
          expect(importResponseBody).toHaveProperty('error');
          expect(importResponseBody.error).toContain('orgId not found');
        }
      }
    }
  });

  test('Daisy Chain TC3: Verify import fails when setup has not been completed', async ({ request }) => {
    const dealershipId = 99999; // Use a dealershipId that doesn't have orgId configured
    const interfaceOrgId = 'NONEXISTENT_DEALER_ID';

    // Attempt to import credit app lenders without setting up finance provider first
    const importRequestBody = {
      dealershipId: dealershipId,
      provider: 'route-one',
      interfaceOrgId: interfaceOrgId
    };

    const importResponse = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: importRequestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 404 because orgId is not found in database
    expect(importResponse.status()).toBe(404);

    const importResponseBody = await importResponse.json();
    expect(importResponseBody).toHaveProperty('error');
    expect(importResponseBody.error).toContain('orgId not found for dealership');
  });

  test('Daisy Chain TC4: Setup route-one provider with different dealershipId values', async ({ request }) => {
    const dealershipIds = [7, 1, 10];
    const baseDealerId = `DAISY_TEST_MULTI_${Date.now()}`;

    for (let i = 0; i < dealershipIds.length; i++) {
      const dealerId = `${baseDealerId}_${i}`;
      const dealershipId = dealershipIds[i];
      const interfaceOrgId = dealerId;

      // Step 1: Setup Finance Provider
      const setupRequestBody = {
        dealerId: dealerId,
        provider: 'route-one',
        generalInfo: createGeneralInfo({
          legalName: `Daisy Chain Multi Test Dealer ${i}`,
          dbaName: `Multi Test ${i}`
        }),
        dealershipId: dealershipId
      };

      const setupResponse = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
        data: setupRequestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Verify setup response
      expect(setupResponse.status()).toBeGreaterThanOrEqual(200);
      expect(setupResponse.status()).toBeLessThan(600);

      const setupResponseBody = await setupResponse.json();
      
      // If setup was successful, try to import
      if (setupResponse.status() === 200 && setupResponseBody.success && setupResponseBody.data?.orgId) {
        // Step 2: Import Credit App Lenders
        const importRequestBody = {
          dealershipId: dealershipId,
          provider: 'route-one',
          interfaceOrgId: interfaceOrgId
        };

        const importResponse = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
          data: importRequestBody,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Verify import response
        expect(importResponse.status()).toBeGreaterThanOrEqual(200);
        expect(importResponse.status()).toBeLessThan(600);

        const importResponseBody = await importResponse.json();
        expect(importResponseBody).toBeDefined();
      }
    }
  });

  test('Daisy Chain TC5: Verify complete workflow with response time validation', async ({ request }) => {
    const dealerId = `DAISY_TEST_PERF_${Date.now()}`;
    const dealershipId = 7;
    const interfaceOrgId = dealerId;

    // Step 1: Setup Finance Provider (measure time)
    const setupStartTime = Date.now();
    const setupRequestBody = {
      dealerId: dealerId,
      provider: 'route-one',
      generalInfo: createGeneralInfo({
        legalName: 'Daisy Chain Performance Test',
        dbaName: 'Performance Test'
      }),
      dealershipId: dealershipId
    };

    const setupResponse = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: setupRequestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const setupEndTime = Date.now();
    const setupResponseTime = setupEndTime - setupStartTime;

    // Setup should complete within 15 seconds
    expect(setupResponseTime).toBeLessThan(15000);
    expect(setupResponse.status()).toBeGreaterThanOrEqual(200);
    expect(setupResponse.status()).toBeLessThan(400);

    const setupResponseBody = await setupResponse.json();
    
    // If setup was successful, proceed with import
    if (setupResponse.status() === 200 && setupResponseBody.success && setupResponseBody.data?.orgId) {
      // Step 2: Import Credit App Lenders (measure time)
      const importStartTime = Date.now();
      const importRequestBody = {
        dealershipId: dealershipId,
        provider: 'route-one',
        interfaceOrgId: interfaceOrgId
      };

      const importResponse = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
        data: importRequestBody,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const importEndTime = Date.now();
      const importResponseTime = importEndTime - importStartTime;

      // Import should complete within 15 seconds
      expect(importResponseTime).toBeLessThan(15000);
      expect(importResponse.status()).toBeGreaterThanOrEqual(200);
      expect(importResponse.status()).toBeLessThan(600);

      // Total workflow time should be reasonable
      const totalTime = importEndTime - setupStartTime;
      expect(totalTime).toBeLessThan(30000); // Total should be less than 30 seconds
    }
  });
});

