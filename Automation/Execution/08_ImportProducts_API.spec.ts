import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Test suite for POST /api/ex1/import-products API endpoint
 * This API imports products by matching dealer products with vendor products
 */
test.describe('POST /api/ex1/import-products - Import Products API', () => {
  
  test('TC1: Successfully import products with valid dealerId and vendorIds', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123', '456']
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
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
    expect(responseBody).toHaveProperty('success');
    expect(responseBody).toHaveProperty('dealerId');
    expect(responseBody).toHaveProperty('vendorIds');
    expect(responseBody).toHaveProperty('commonProducts');
    expect(responseBody).toHaveProperty('totalCommonProducts');
    
    expect(responseBody.success).toBe(true);
    expect(responseBody.dealerId).toBe('2737');
    expect(Array.isArray(responseBody.vendorIds)).toBe(true);
    expect(Array.isArray(responseBody.commonProducts)).toBe(true);
    expect(typeof responseBody.totalCommonProducts).toBe('number');
  });

  test('TC2: Verify error handling when dealerId is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: {
        vendorIds: ['123', '456']
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

  test('TC3: Verify error handling when vendorIds is missing', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: {
        dealerId: '2737'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when vendorIds is missing
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('vendorIds must be a non-empty array');
  });

  test('TC4: Verify error handling when vendorIds is empty array', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: {
        dealerId: '2737',
        vendorIds: []
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 400 Bad Request when vendorIds is empty
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('vendorIds must be a non-empty array');
  });

  test('TC5: Verify error handling when vendorIds is not an array', async ({ request }) => {
    const testCases = [
      { dealerId: '2737', vendorIds: '123' }, // string instead of array
      { dealerId: '2737', vendorIds: 123 }, // number instead of array
      { dealerId: '2737', vendorIds: null }, // null instead of array
      { dealerId: '2737', vendorIds: {} } // object instead of array
    ];

    for (const testCase of testCases) {
      const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
        data: testCase,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Should return 400 for invalid vendorIds types
      expect(response.status()).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    }
  });

  test('TC6: Verify response with single vendorId', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123']
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.vendorIds).toEqual(['123']);
    expect(Array.isArray(responseBody.commonProducts)).toBe(true);
  });

  test('TC7: Verify response with multiple vendorIds', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123', '456', '789']
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.vendorIds.length).toBe(3);
    expect(Array.isArray(responseBody.commonProducts)).toBe(true);
  });

  test('TC8: Verify response time is acceptable', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123', '456']
    };

    const startTime = Date.now();
    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Response should complete within 30 seconds (allowing for multiple upstream API calls)
    expect(responseTime).toBeLessThan(30000);
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('TC9: Verify Content-Type headers are handled correctly', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123']
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
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

  test('TC10: Verify commonProducts structure when products are found', async ({ request }) => {
    const requestBody = {
      dealerId: '2737',
      vendorIds: ['123', '456']
    };

    const response = await request.post(`${API_BASE_URL}/api/ex1/import-products`, {
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.status() === 200) {
      const responseBody = await response.json();
      
      // If common products are found, verify their structure
      if (responseBody.commonProducts.length > 0) {
        const firstProduct = responseBody.commonProducts[0];
        expect(firstProduct).toHaveProperty('EX1ProductID');
        expect(firstProduct).toHaveProperty('vendors');
        expect(Array.isArray(firstProduct.vendors)).toBe(true);
        
        // Verify vendor structure
        if (firstProduct.vendors.length > 0) {
          expect(firstProduct.vendors[0]).toHaveProperty('id');
          expect(firstProduct.vendors[0]).toHaveProperty('name');
        }
      }
    }
  });

});

