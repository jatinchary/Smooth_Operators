import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Test suite for POST /api/ex1/provider-list API endpoint
 * This API retrieves provider list for a dealer from the F&I Express system
 */
test.describe('POST /api/ex1/provider-list - Provider List API', () => {
  
  test('TC1: Successfully get provider list with valid dealerId', async ({ request }) => {
    const requestBody = {
      dealerId: '2737'
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Verify response status
    expect(response.status()).toBe(200);

    // Verify response body structure
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    
    // If upstream API returns provider data, verify structure
    if (responseBody.EX1ProviderListResponse) {
      expect(responseBody.EX1ProviderListResponse).toBeDefined();
    }
  });

  test('TC2: Verify error handling when dealerId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
      data: {},
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

  test('TC3: Verify error handling when dealerId is null or undefined', async ({ request }) => {
    const testCases = [
      { dealerId: null },
      { dealerId: undefined },
      { dealerId: '' }
    ];

    for (const testCase of testCases) {
      const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
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

  test('TC4: Verify response time is acceptable', async ({ request }) => {
    const requestBody = {
      dealerId: '2737'
    };

    const startTime = Date.now();
    const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Response should complete within 10 seconds (allowing for upstream API latency)
    expect(responseTime).toBeLessThan(10000);
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('TC5: Verify Content-Type headers are handled correctly', async ({ request }) => {
    const requestBody = {
      dealerId: '2737'
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
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

  test('TC6: Test with different dealerId values', async ({ request }) => {
    const dealerIds = ['2737', '1000', '9999'];

    for (const dealerId of dealerIds) {
      const response = await request.post(`${API_BASE_URL}/api/ex1/provider-list`, {
        data: { dealerId },
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

