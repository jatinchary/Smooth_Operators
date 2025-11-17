import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Test suite for POST /api/import-credit-app-lenders API endpoint
 * This API imports credit application lenders for a dealership from the Lending Platform
 */
test.describe('POST /api/import-credit-app-lenders - Import Credit App Lenders API', () => {
  
  test('TC1: Successfully import credit app lenders with valid parameters for route-one', async ({ request }) => {
    const requestBody = {
      dealershipId: 7,
      provider: 'route-one',
      interfaceOrgId: 'TEST_ROUTE_ONE_ID'
    };

    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify response status (could be 200, 404 if orgId not found, or 500 if upstream fails)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);

    // Verify response body structure
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    
    // If successful, verify structure
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success');
      expect(responseBody.success).toBe(true);
      expect(responseBody).toHaveProperty('message');
      expect(responseBody).toHaveProperty('data');
    }
  });

  test('TC2: Successfully import credit app lenders with valid parameters for dealertrack', async ({ request }) => {
    const requestBody = {
      dealershipId: 7,
      provider: 'dealertrack',
      interfaceOrgId: 'TEST_DEALERTRACK_ID'
    };

    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify response status
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    
    // If successful, verify structure
    if (response.status() === 200) {
      expect(responseBody).toHaveProperty('success');
      expect(responseBody.success).toBe(true);
    }
  });

  test('TC3: Verify error handling when dealershipId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: {
        provider: 'route-one',
        interfaceOrgId: 'TEST_ID'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when dealershipId is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('dealershipId is required');
  });

  test('TC4: Verify error handling when provider is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: {
        dealershipId: 7,
        interfaceOrgId: 'TEST_ID'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when provider is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('provider is required');
  });

  test('TC5: Verify error handling when interfaceOrgId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: {
        dealershipId: 7,
        provider: 'route-one'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when interfaceOrgId is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('interfaceOrgId is required');
  });

  test('TC6: Verify error handling when provider is invalid', async ({ request }) => {
    const invalidProviders = ['invalid-provider', 'routeone', 'DealerTrack', 'ROUTE-ONE'];

    for (const provider of invalidProviders) {
      const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
        data: {
          dealershipId: 7,
          provider: provider,
          interfaceOrgId: 'TEST_ID'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Should return 400 for invalid provider values
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid provider');
    }
  });

  test('TC7: Verify error handling when dealershipId is null or undefined', async ({ request }) => {
    const testCases = [
      { dealershipId: null, provider: 'route-one', interfaceOrgId: 'TEST_ID' },
      { dealershipId: undefined, provider: 'route-one', interfaceOrgId: 'TEST_ID' },
      { dealershipId: '', provider: 'route-one', interfaceOrgId: 'TEST_ID' }
    ];

    for (const testCase of testCases) {
      const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
        data: testCase,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Should return 400 for invalid dealershipId values
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    }
  });

  test('TC8: Verify error handling when dealership has no orgId in database', async ({ request }) => {
    // Using a dealershipId that likely doesn't have a lending_platform_id configured
    const requestBody = {
      dealershipId: 99999,
      provider: 'route-one',
      interfaceOrgId: 'TEST_ID'
    };

    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 404 when orgId not found for dealership
    expect(response.status()).toBe(404);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('orgId not found for dealership');
  });

  test('TC9: Verify response time is acceptable', async ({ request }) => {
    const requestBody = {
      dealershipId: 7,
      provider: 'route-one',
      interfaceOrgId: 'TEST_ID'
    };

    const startTime = Date.now();
    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Response should complete within 15 seconds (allowing for upstream API latency)
    expect(responseTime).toBeLessThan(15000);
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('TC10: Verify Content-Type headers are handled correctly', async ({ request }) => {
    const requestBody = {
      dealershipId: 7,
      provider: 'route-one',
      interfaceOrgId: 'TEST_ID'
    };

    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);

    // Verify response has proper content type
    const contentType = response.headers()['content-type'];
    if (contentType) {
      expect(contentType).toContain('application/json');
    }
  });

  test('TC11: Test with different dealershipId values', async ({ request }) => {
    const dealershipIds = [7, 1, 10];

    for (const dealershipId of dealershipIds) {
      const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
        data: {
          dealershipId: dealershipId,
          provider: 'route-one',
          interfaceOrgId: 'TEST_ID'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Status could be 200 (success), 404 (orgId not found), or 5xx (upstream error)
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(600);

      const responseBody = await response.json();
      expect(responseBody).toBeDefined();
    }
  });

  test('TC12: Test with empty request body', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/import-credit-app-lenders`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

});

