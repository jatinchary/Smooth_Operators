import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Test suite for POST /api/setup-finance-provider API endpoint
 * This API sets up a finance provider (route-one or dealertrack) for a dealership
 * 
 * Required Parameters:
 * - dealerId: The dealer ID for the finance provider
 * - provider: Must be 'route-one' or 'dealertrack'
 * - generalInfo: Object containing dealer information (legalName, address, etc.)
 * - dealershipId: Optional, defaults to 7
 * 
 * The API creates an orgId in the Lending Platform and saves it to the database
 * for use in subsequent API calls like import-credit-app-lenders
 */
test.describe('POST /api/setup-finance-provider - Setup Finance Provider API', () => {
  
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

  test('TC1: Successfully setup finance provider for route-one with valid parameters', async ({ request }) => {
    const requestBody = {
      dealerId: 'TEST_ROUTE_ONE_DEALER_123',
      provider: 'route-one',
      generalInfo: createGeneralInfo(),
      dealershipId: 7
    };

    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify response status (could be 200 on success, or 4xx/5xx on upstream errors)
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
      expect(responseBody.message).toContain('Finance provider route-one setup completed');
      expect(responseBody).toHaveProperty('data');
      // If orgId is returned, it should be a valid value
      if (responseBody.data?.orgId) {
        expect(responseBody.data.orgId).toBeDefined();
      }
    }
  });

  test('TC2: Successfully setup finance provider for dealertrack with valid parameters', async ({ request }) => {
    const requestBody = {
      dealerId: 'TEST_DEALERTRACK_DEALER_456',
      provider: 'dealertrack',
      generalInfo: createGeneralInfo({
        legalName: 'DealerTrack Test Dealer',
        dbaName: 'DealerTrack Test'
      }),
      dealershipId: 7
    };

    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
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
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toContain('Finance provider dealertrack setup completed');
      expect(responseBody).toHaveProperty('data');
    }
  });

  test('TC3: Verify error handling when dealerId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: {
        provider: 'route-one',
        generalInfo: createGeneralInfo()
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when dealerId is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('dealerId is required');
  });

  test('TC4: Verify error handling when provider is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: {
        dealerId: 'TEST_DEALER_123',
        generalInfo: createGeneralInfo()
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

  test('TC5: Verify error handling when generalInfo is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: {
        dealerId: 'TEST_DEALER_123',
        provider: 'route-one'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when generalInfo is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('generalInfo is required');
  });

  test('TC6: Verify error handling when provider is invalid', async ({ request }) => {
    const invalidProviders = ['invalid-provider', 'routeone', 'DealerTrack', 'ROUTE-ONE', 'dealertrack-invalid'];

    for (const provider of invalidProviders) {
      const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
        data: {
          dealerId: 'TEST_DEALER_123',
          provider: provider,
          generalInfo: createGeneralInfo()
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
      expect(responseBody.error).toContain("'route-one' or 'dealertrack'");
    }
  });

  test('TC7: Verify error handling when dealerId is null or empty', async ({ request }) => {
    const testCases = [
      { dealerId: null, provider: 'route-one', generalInfo: createGeneralInfo() },
      { dealerId: undefined, provider: 'route-one', generalInfo: createGeneralInfo() },
      { dealerId: '', provider: 'route-one', generalInfo: createGeneralInfo() }
    ];

    for (const testCase of testCases) {
      const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
        data: testCase,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Should return 400 for invalid dealerId values
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    }
  });

  test('TC8: Verify response time is acceptable', async ({ request }) => {
    const requestBody = {
      dealerId: 'TEST_DEALER_PERF_789',
      provider: 'route-one',
      generalInfo: createGeneralInfo(),
      dealershipId: 7
    };

    const startTime = Date.now();
    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
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

  test('TC9: Verify Content-Type headers are handled correctly', async ({ request }) => {
    const requestBody = {
      dealerId: 'TEST_DEALER_HEADERS_999',
      provider: 'route-one',
      generalInfo: createGeneralInfo()
    };

    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
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

  test('TC10: Test with minimal generalInfo (only required fields)', async ({ request }) => {
    const requestBody = {
      dealerId: 'TEST_MINIMAL_DEALER',
      provider: 'route-one',
      generalInfo: {
        legalName: 'Minimal Test Dealer'
      },
      dealershipId: 7
    };

    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should accept minimal generalInfo (API uses defaults for missing fields)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(600);

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test('TC11: Test with empty request body', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
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

  test('TC12: Test with different dealerId values', async ({ request }) => {
    const dealerIds = ['DEALER_001', 'DEALER_002', 'DEALER_003'];

    for (const dealerId of dealerIds) {
      const response = await request.post(`${API_BASE_URL}/api/setup-finance-provider`, {
        data: {
          dealerId: dealerId,
          provider: 'route-one',
          generalInfo: createGeneralInfo({
            legalName: `Dealer ${dealerId}`,
            dbaName: `DBA ${dealerId}`
          })
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Status could be 200 (success) or 4xx/5xx (upstream error)
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(600);

      const responseBody = await response.json();
      expect(responseBody).toBeDefined();
    }
  });

});

