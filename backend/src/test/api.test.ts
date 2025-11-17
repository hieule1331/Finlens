/**
 * API Endpoint Tests
 * Simple test suite to verify all API endpoints are working
 *
 * Run this after:
 * 1. Starting Docker containers (docker compose up -d)
 * 2. Running migrations (npm run migrate)
 * 3. Seeding database (npm run seed)
 * 4. Starting the server (npm run dev)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    throw new Error(`Request failed: ${error}`);
  }
}

/**
 * Test 1: Health Check Endpoint
 */
async function testHealthCheck(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(`${BASE_URL}/health`);
    const data = await response.json();

    if (response.status !== 200) {
      return {
        name: 'Health Check',
        passed: false,
        error: `Expected status 200, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (data.status !== 'healthy') {
      return {
        name: 'Health Check',
        passed: false,
        error: `Expected status 'healthy', got '${data.status}'`,
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Health Check',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Health Check',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 2: Root Endpoint
 */
async function testRootEndpoint(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const data = await response.json();

    if (response.status !== 200) {
      return {
        name: 'Root Endpoint',
        passed: false,
        error: `Expected status 200, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.message || !data.endpoints) {
      return {
        name: 'Root Endpoint',
        passed: false,
        error: 'Missing expected fields (message, endpoints)',
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Root Endpoint',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Root Endpoint',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 3: Get Latest Prices
 */
async function testLatestPrices(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/v1/market/latest?limit=10`
    );
    const data = await response.json();

    if (response.status !== 200) {
      return {
        name: 'Get Latest Prices',
        passed: false,
        error: `Expected status 200, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.success || !Array.isArray(data.data)) {
      return {
        name: 'Get Latest Prices',
        passed: false,
        error: 'Response does not match expected format',
        duration: Date.now() - startTime,
      };
    }

    if (data.data.length === 0) {
      return {
        name: 'Get Latest Prices',
        passed: false,
        error: 'No data returned (database may not be seeded)',
        duration: Date.now() - startTime,
      };
    }

    // Verify data structure
    const firstStock = data.data[0];
    const requiredFields = ['symbol', 'name', 'exchange', 'close', 'volume'];
    const missingFields = requiredFields.filter(
      (field) => !(field in firstStock)
    );

    if (missingFields.length > 0) {
      return {
        name: 'Get Latest Prices',
        passed: false,
        error: `Missing fields: ${missingFields.join(', ')}`,
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Get Latest Prices',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Get Latest Prices',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 4: Get Stock History
 */
async function testStockHistory(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    // First, get a stock symbol
    const latestResponse = await makeRequest(
      `${BASE_URL}/api/v1/market/latest?limit=1`
    );
    const latestData = await latestResponse.json();

    if (!latestData.data || latestData.data.length === 0) {
      return {
        name: 'Get Stock History',
        passed: false,
        error: 'No stocks available for testing',
        duration: Date.now() - startTime,
      };
    }

    const symbol = latestData.data[0].symbol;

    // Test stock history
    const response = await makeRequest(
      `${BASE_URL}/api/v1/market/history/${symbol}?days=7`
    );
    const data = await response.json();

    if (response.status !== 200) {
      return {
        name: 'Get Stock History',
        passed: false,
        error: `Expected status 200, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.success || !data.data || !data.data.prices) {
      return {
        name: 'Get Stock History',
        passed: false,
        error: 'Response does not match expected format',
        duration: Date.now() - startTime,
      };
    }

    if (!Array.isArray(data.data.prices) || data.data.prices.length === 0) {
      return {
        name: 'Get Stock History',
        passed: false,
        error: 'No price history returned',
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Get Stock History',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Get Stock History',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 5: Get Stock History - Invalid Symbol (404)
 */
async function testStockHistoryNotFound(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/v1/market/history/INVALID123`
    );
    const data = await response.json();

    if (response.status !== 404) {
      return {
        name: 'Get Stock History - Not Found',
        passed: false,
        error: `Expected status 404, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.error) {
      return {
        name: 'Get Stock History - Not Found',
        passed: false,
        error: 'Expected error message in response',
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Get Stock History - Not Found',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Get Stock History - Not Found',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 6: Get Market Summary
 */
async function testMarketSummary(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/market/summary`);
    const data = await response.json();

    if (response.status !== 200) {
      return {
        name: 'Get Market Summary',
        passed: false,
        error: `Expected status 200, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.success || !data.data) {
      return {
        name: 'Get Market Summary',
        passed: false,
        error: 'Response does not match expected format',
        duration: Date.now() - startTime,
      };
    }

    const summary = data.data;
    const requiredFields = [
      'total_stocks',
      'total_volume',
      'exchanges',
      'sectors',
    ];
    const missingFields = requiredFields.filter(
      (field) => !(field in summary)
    );

    if (missingFields.length > 0) {
      return {
        name: 'Get Market Summary',
        passed: false,
        error: `Missing fields: ${missingFields.join(', ')}`,
        duration: Date.now() - startTime,
      };
    }

    if (summary.total_stocks === 0) {
      return {
        name: 'Get Market Summary',
        passed: false,
        error: 'No stocks in database (may not be seeded)',
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Get Market Summary',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Get Market Summary',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 7: Invalid Endpoint (404)
 */
async function testNotFoundEndpoint(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/invalid`);
    const data = await response.json();

    if (response.status !== 404) {
      return {
        name: 'Invalid Endpoint - Not Found',
        passed: false,
        error: `Expected status 404, got ${response.status}`,
        duration: Date.now() - startTime,
      };
    }

    if (!data.error) {
      return {
        name: 'Invalid Endpoint - Not Found',
        passed: false,
        error: 'Expected error message in response',
        duration: Date.now() - startTime,
      };
    }

    return {
      name: 'Invalid Endpoint - Not Found',
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'Invalid Endpoint - Not Found',
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Run all tests
 */
async function runTests(): Promise<void> {
  console.log('\n🧪 Running API Tests...\n');
  console.log('='.repeat(60));
  console.log(`Testing API at: ${BASE_URL}\n`);

  // Run all tests
  results.push(await testHealthCheck());
  results.push(await testRootEndpoint());
  results.push(await testLatestPrices());
  results.push(await testStockHistory());
  results.push(await testStockHistoryNotFound());
  results.push(await testMarketSummary());
  results.push(await testNotFoundEndpoint());

  // Print results
  console.log('\nTest Results:\n');
  console.log('='.repeat(60));

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? `(${result.duration}ms)` : '';

    console.log(`${index + 1}. ${status} - ${result.name} ${duration}`);

    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`Success Rate: ${((passedCount / results.length) * 100).toFixed(1)}%\n`);

  if (failedCount > 0) {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
