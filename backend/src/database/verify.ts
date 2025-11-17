import { query, closePool } from '../utils/database';

/**
 * Verify database tables and schema
 * Checks that all required tables exist and have correct structure
 */
async function verifyDatabase(): Promise<void> {
  try {
    console.log('🔍 Verifying database schema...\n');

    // Check if tables exist
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name IN ('stocks', 'stock_prices')
      ORDER BY table_name;
    `);

    const existingTables = tablesResult.rows.map((row) => row.table_name);
    const requiredTables = ['stocks', 'stock_prices'];

    console.log('📋 Required tables:', requiredTables.join(', '));
    console.log('✅ Existing tables:', existingTables.join(', '));

    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:', missingTables.join(', '));
      console.log('👉 Run "npm run migrate" to create tables\n');
      process.exit(1);
    }

    console.log('\n✅ All required tables exist!\n');

    // Count rows in each table
    for (const table of requiredTables) {
      const countResult = await query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      const count = countResult.rows[0].count;
      console.log(`📊 ${table}: ${count} rows`);
    }

    // Check for indexes on stock_prices
    const indexesResult = await query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = 'stock_prices'
      ORDER BY indexname;
    `);

    console.log('\n🔑 Indexes on stock_prices:');
    indexesResult.rows.forEach((row) => {
      console.log(`   ✓ ${row.indexname}`);
    });

    // Check foreign key constraints
    const constraintsResult = await query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `);

    console.log('\n🔗 Foreign key constraints:');
    constraintsResult.rows.forEach((row) => {
      console.log(
        `   ✓ ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`
      );
    });

    console.log('\n✨ Database schema verification complete!\n');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run verification
verifyDatabase()
  .then(() => {
    console.log('👍 Verification successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification error:', error);
    process.exit(1);
  });
