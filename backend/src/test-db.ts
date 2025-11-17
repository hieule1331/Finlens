import { testConnection, closePool } from './utils/database';

/**
 * Test database connection script
 * Run this after starting Docker containers
 */
async function main() {
  console.log('🔄 Testing database connection...\n');

  const isConnected = await testConnection();

  if (isConnected) {
    console.log('\n✅ All database tests passed!');
  } else {
    console.log('\n❌ Database connection failed!');
    process.exit(1);
  }

  await closePool();
  process.exit(0);
}

main().catch((error) => {
  console.error('Error during database test:', error);
  process.exit(1);
});
