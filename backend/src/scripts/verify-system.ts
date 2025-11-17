/**
 * System Verification Script
 * Checks if the entire system is set up correctly and running
 *
 * This script verifies:
 * 1. PostgreSQL database connection
 * 2. Database tables exist
 * 3. Sample data is seeded
 * 4. API server is responsive
 * 5. All API endpoints are working
 */

import { query, closePool } from '../utils/database';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const API_URL = process.env.API_URL || 'http://localhost:3000';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

/**
 * Print section header
 */
function printSection(title: string): void {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Print check result
 */
function printResult(result: CheckResult): void {
  const icon =
    result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
}

/**
 * Check 1: Docker Containers
 */
async function checkDockerContainers(): Promise<CheckResult> {
  try {
    const { stdout } = await execAsync('docker compose ps --format json');
    const containers = stdout
      .trim()
      .split('\n')
      .filter((line) => line)
      .map((line) => JSON.parse(line));

    const postgres = containers.find((c) =>
      c.Name?.includes('finlens-postgres')
    );
    const redis = containers.find((c) => c.Name?.includes('finlens-redis'));

    if (!postgres || !redis) {
      return {
        name: 'Docker Containers',
        status: 'fail',
        message: 'Containers not found',
        details:
          'Run: docker compose up -d (in the backend directory)',
      };
    }

    const postgresRunning = postgres.State === 'running';
    const redisRunning = redis.State === 'running';

    if (!postgresRunning || !redisRunning) {
      return {
        name: 'Docker Containers',
        status: 'fail',
        message: 'Containers not running',
        details: 'Run: docker compose restart',
      };
    }

    return {
      name: 'Docker Containers',
      status: 'pass',
      message: 'PostgreSQL and Redis running',
    };
  } catch (error) {
    return {
      name: 'Docker Containers',
      status: 'fail',
      message: 'Cannot check containers',
      details: 'Ensure Docker is installed and running',
    };
  }
}

/**
 * Check 2: PostgreSQL Connection
 */
async function checkPostgresConnection(): Promise<CheckResult> {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      name: 'PostgreSQL Connection',
      status: 'pass',
      message: 'Database connection successful',
      details: `Connected at: ${result.rows[0].current_time}`,
    };
  } catch (error) {
    return {
      name: 'PostgreSQL Connection',
      status: 'fail',
      message: 'Cannot connect to database',
      details: 'Check .env file and Docker containers',
    };
  }
}

/**
 * Check 3: Database Tables
 */
async function checkDatabaseTables(): Promise<CheckResult> {
  try {
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name IN ('stocks', 'stock_prices')
      ORDER BY table_name
    `);

    const tables = result.rows.map((row) => row.table_name);
    const requiredTables = ['stocks', 'stock_prices'];
    const missingTables = requiredTables.filter(
      (table) => !tables.includes(table)
    );

    if (missingTables.length > 0) {
      return {
        name: 'Database Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
        details: 'Run: npm run migrate',
      };
    }

    return {
      name: 'Database Tables',
      status: 'pass',
      message: 'All required tables exist',
      details: `Found: ${tables.join(', ')}`,
    };
  } catch (error) {
    return {
      name: 'Database Tables',
      status: 'fail',
      message: 'Cannot check tables',
      details: String(error),
    };
  }
}

/**
 * Check 4: Sample Data
 */
async function checkSampleData(): Promise<CheckResult> {
  try {
    const stocksResult = await query('SELECT COUNT(*) as count FROM stocks');
    const pricesResult = await query(
      'SELECT COUNT(*) as count FROM stock_prices'
    );

    const stockCount = parseInt(stocksResult.rows[0].count);
    const priceCount = parseInt(pricesResult.rows[0].count);

    if (stockCount === 0) {
      return {
        name: 'Sample Data',
        status: 'fail',
        message: 'No stocks in database',
        details: 'Run: npm run seed',
      };
    }

    if (priceCount === 0) {
      return {
        name: 'Sample Data',
        status: 'warn',
        message: 'No price data in database',
        details: 'Run: npm run seed',
      };
    }

    return {
      name: 'Sample Data',
      status: 'pass',
      message: 'Database is seeded',
      details: `${stockCount} stocks, ${priceCount} price records`,
    };
  } catch (error) {
    return {
      name: 'Sample Data',
      status: 'fail',
      message: 'Cannot check data',
      details: String(error),
    };
  }
}

/**
 * Check 5: API Server
 */
async function checkAPIServer(): Promise<CheckResult> {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    if (response.status !== 200 || data.status !== 'healthy') {
      return {
        name: 'API Server',
        status: 'fail',
        message: 'Server not healthy',
        details: 'Start server: npm run dev',
      };
    }

    return {
      name: 'API Server',
      status: 'pass',
      message: 'Server is running and healthy',
      details: `Uptime: ${data.uptime?.toFixed(2)}s`,
    };
  } catch (error) {
    return {
      name: 'API Server',
      status: 'fail',
      message: 'Server not responding',
      details: 'Start server: npm run dev (in a separate terminal)',
    };
  }
}

/**
 * Check 6: API Endpoints
 */
async function checkAPIEndpoints(): Promise<CheckResult> {
  try {
    // Test latest prices endpoint
    const latestResponse = await fetch(
      `${API_URL}/api/v1/market/latest?limit=5`
    );
    if (latestResponse.status !== 200) {
      return {
        name: 'API Endpoints',
        status: 'fail',
        message: '/api/v1/market/latest failed',
        details: `Status: ${latestResponse.status}`,
      };
    }

    const latestData = await latestResponse.json();
    if (!latestData.success || !latestData.data) {
      return {
        name: 'API Endpoints',
        status: 'fail',
        message: 'Invalid response format',
      };
    }

    // Test stock history endpoint
    if (latestData.data.length > 0) {
      const symbol = latestData.data[0].symbol;
      const historyResponse = await fetch(
        `${API_URL}/api/v1/market/history/${symbol}?days=7`
      );
      if (historyResponse.status !== 200) {
        return {
          name: 'API Endpoints',
          status: 'warn',
          message: '/api/v1/market/history partially working',
        };
      }
    }

    // Test market summary endpoint
    const summaryResponse = await fetch(`${API_URL}/api/v1/market/summary`);
    if (summaryResponse.status !== 200) {
      return {
        name: 'API Endpoints',
        status: 'warn',
        message: '/api/v1/market/summary failed',
      };
    }

    return {
      name: 'API Endpoints',
      status: 'pass',
      message: 'All endpoints responding correctly',
    };
  } catch (error) {
    return {
      name: 'API Endpoints',
      status: 'fail',
      message: 'Cannot test endpoints',
      details: String(error),
    };
  }
}

/**
 * Main verification function
 */
async function verifySystem(): Promise<void> {
  console.log('\n🔍 Finlens System Verification\n');
  console.log('Checking all system components...\n');

  // Check Docker containers
  printSection('Infrastructure');
  results.push(await checkDockerContainers());
  printResult(results[results.length - 1]);

  // Check PostgreSQL connection
  printSection('Database');
  results.push(await checkPostgresConnection());
  printResult(results[results.length - 1]);

  // Only continue if database is connected
  if (results[results.length - 1].status === 'pass') {
    results.push(await checkDatabaseTables());
    printResult(results[results.length - 1]);

    results.push(await checkSampleData());
    printResult(results[results.length - 1]);
  }

  // Check API server
  printSection('API Server');
  results.push(await checkAPIServer());
  printResult(results[results.length - 1]);

  // Only check endpoints if server is running
  if (results[results.length - 1].status === 'pass') {
    results.push(await checkAPIEndpoints());
    printResult(results[results.length - 1]);
  }

  // Summary
  printSection('Summary');

  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log(`Total Checks: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0 && warned === 0) {
    console.log('\n🎉 All systems operational!\n');
    console.log('You can start using the API at:', API_URL);
    console.log('\nQuick start commands:');
    console.log('  - Test endpoints: npm run test:api');
    console.log('  - View docs: See README.md and TEST.md');
    console.log('');
  } else if (failed === 0) {
    console.log('\n⚠️  System operational with warnings\n');
    console.log('Review warnings above and fix if needed.\n');
  } else {
    console.log('\n❌ System verification failed!\n');
    console.log('Please fix the issues above before proceeding.\n');

    // Print recommended actions
    console.log('Recommended actions:\n');
    const dockerFailed = results.find(
      (r) => r.name === 'Docker Containers' && r.status === 'fail'
    );
    const dbFailed = results.find(
      (r) => r.name === 'PostgreSQL Connection' && r.status === 'fail'
    );
    const tablesFailed = results.find(
      (r) => r.name === 'Database Tables' && r.status === 'fail'
    );
    const dataFailed = results.find(
      (r) => r.name === 'Sample Data' && r.status === 'fail'
    );
    const serverFailed = results.find(
      (r) => r.name === 'API Server' && r.status === 'fail'
    );

    if (dockerFailed) {
      console.log('1. Start Docker containers:');
      console.log('   docker compose up -d\n');
    }
    if (dbFailed && !dockerFailed) {
      console.log('2. Check database configuration in .env file\n');
    }
    if (tablesFailed) {
      console.log('3. Run database migrations:');
      console.log('   npm run migrate\n');
    }
    if (dataFailed) {
      console.log('4. Seed sample data:');
      console.log('   npm run seed\n');
    }
    if (serverFailed) {
      console.log('5. Start the API server:');
      console.log('   npm run dev\n');
    }

    process.exit(1);
  }

  await closePool();
  process.exit(0);
}

// Run verification
verifySystem().catch((error) => {
  console.error('\n💥 Verification failed with error:', error);
  process.exit(1);
});
