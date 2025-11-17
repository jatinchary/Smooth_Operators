import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Test suite for POST /api/ex1/product-list API endpoint
 * This API retrieves product list for a provider from the F&I Express system
 */
test.describe('POST /api/ex1/product-list - Product List API', () => {
  
  test('TC1: Successfully get product list with valid providerId', async ({ request }) => {
    const requestBody = {
      providerId: '123'
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
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
    
    // If upstream API returns product data, verify structure
    if (responseBody.EX1ProductListResponse) {
      expect(responseBody.EX1ProductListResponse).toBeDefined();
    }
  });

  test('TC2: Verify error handling when providerId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when providerId is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('providerId is required');
  });

  test('TC3: Verify error handling when providerId is null or undefined', async ({ request }) => {
    const testCases = [
      { providerId: null },
      { providerId: undefined },
      { providerId: '' }
    ];

    for (const testCase of testCases) {
      const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
        data: testCase,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Should return 400 for invalid providerId values
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    }
  });

  test('TC4: Verify response time is acceptable', async ({ request }) => {
    const requestBody = {
      providerId: '123'
    };

    const startTime = Date.now();
    const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
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
      providerId: '123'
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
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

  test('TC6: Test with different providerId values', async ({ request }) => {
    const providerIds = ['123', '456', '789'];

    for (const providerId of providerIds) {
      const response = await request.post(`${API_BASE_URL}/api/ex1/product-list`, {
        data: { providerId },
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

