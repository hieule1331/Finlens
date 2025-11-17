import { readFileSync } from 'fs';
import { join } from 'path';
import { query, closePool } from '../utils/database';

/**
 * Run database migrations
 * Executes schema.sql to create tables and indexes
 */
async function runMigration(): Promise<void> {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read schema.sql file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    console.log('📄 Reading schema from:', schemaPath);

    // Execute the schema
    console.log('⚙️  Executing schema SQL...');
    await query(schemaSql);

    console.log('✅ Schema executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    tablesResult.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Get table details
    console.log('\n📋 Table details:\n');

    // Stocks table
    const stocksColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'stocks'
      ORDER BY ordinal_position;
    `);

    console.log('📦 STOCKS table:');
    stocksColumns.rows.forEach((col) => {
      console.log(
        `   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`
      );
    });

    // Stock prices table
    const pricesColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'stock_prices'
      ORDER BY ordinal_position;
    `);

    console.log('\n📦 STOCK_PRICES table:');
    pricesColumns.rows.forEach((col) => {
      console.log(
        `   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`
      );
    });

    // Check indexes
    const indexesResult = await query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('stocks', 'stock_prices')
      ORDER BY tablename, indexname;
    `);

    console.log('\n🔑 Indexes created:');
    indexesResult.rows.forEach((idx) => {
      console.log(`   ✓ ${idx.tablename}.${idx.indexname}`);
    });

    console.log('\n✨ Migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('👍 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });
