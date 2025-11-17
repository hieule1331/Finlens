import { query, getClient, closePool } from '../utils/database';
import { generateAllSampleData, Stock, StockPrice } from '../utils/sampleData';

/**
 * Clear all existing data from tables
 */
async function clearData(): Promise<void> {
  console.log('🗑️  Clearing existing data...\n');

  try {
    // Delete in correct order due to foreign key constraints
    await query('DELETE FROM stock_prices');
    console.log('   ✓ Cleared stock_prices table');

    await query('DELETE FROM stocks');
    console.log('   ✓ Cleared stocks table');

    console.log('\n✅ All existing data cleared\n');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

/**
 * Insert stocks into database
 */
async function insertStocks(stocks: Stock[]): Promise<void> {
  console.log(`📊 Inserting ${stocks.length} stocks...\n`);

  const client = await getClient();

  try {
    await client.query('BEGIN');

    let insertedCount = 0;

    for (const stock of stocks) {
      await client.query(
        `
        INSERT INTO stocks (
          symbol, name, exchange, industry, sector, layer,
          listing_date, outstanding_shares, market_cap
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (symbol) DO NOTHING
      `,
        [
          stock.symbol,
          stock.name,
          stock.exchange,
          stock.industry,
          stock.sector,
          stock.layer,
          stock.listing_date,
          stock.outstanding_shares,
          stock.market_cap,
        ]
      );

      insertedCount++;

      // Log progress every 10 stocks
      if (insertedCount % 10 === 0) {
        console.log(`   ✓ Inserted ${insertedCount}/${stocks.length} stocks`);
      }
    }

    await client.query('COMMIT');

    console.log(`\n✅ Successfully inserted ${insertedCount} stocks\n`);

    // Show sample stocks by sector
    const sectorCounts = await query(`
      SELECT sector, COUNT(*) as count
      FROM stocks
      GROUP BY sector
      ORDER BY count DESC
    `);

    console.log('📈 Stocks by sector:');
    sectorCounts.rows.forEach((row) => {
      console.log(`   - ${row.sector}: ${row.count} stocks`);
    });
    console.log('');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting stocks:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Insert stock prices into database
 */
async function insertStockPrices(prices: StockPrice[]): Promise<void> {
  console.log(`💰 Inserting ${prices.length} price records...\n`);

  const client = await getClient();

  try {
    await client.query('BEGIN');

    let insertedCount = 0;

    for (const price of prices) {
      await client.query(
        `
        INSERT INTO stock_prices (
          symbol, date, open, high, low, close, volume, adjusted_close
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (symbol, date) DO NOTHING
      `,
        [
          price.symbol,
          price.date,
          price.open,
          price.high,
          price.low,
          price.close,
          price.volume,
          price.adjusted_close,
        ]
      );

      insertedCount++;

      // Log progress every 100 records
      if (insertedCount % 100 === 0) {
        console.log(
          `   ✓ Inserted ${insertedCount}/${prices.length} price records`
        );
      }
    }

    await client.query('COMMIT');

    console.log(
      `\n✅ Successfully inserted ${insertedCount} price records\n`
    );

    // Show date range
    const dateRange = await query(`
      SELECT
        MIN(date) as earliest_date,
        MAX(date) as latest_date,
        COUNT(DISTINCT date) as trading_days
      FROM stock_prices
    `);

    if (dateRange.rows.length > 0) {
      const range = dateRange.rows[0];
      console.log('📅 Price data range:');
      console.log(
        `   - Earliest: ${new Date(range.earliest_date).toLocaleDateString()}`
      );
      console.log(
        `   - Latest: ${new Date(range.latest_date).toLocaleDateString()}`
      );
      console.log(`   - Trading days: ${range.trading_days}`);
      console.log('');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting stock prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Display seeding summary
 */
async function displaySummary(): Promise<void> {
  console.log('📊 Database Summary:\n');

  // Count stocks by exchange
  const exchangeCounts = await query(`
    SELECT exchange, COUNT(*) as count
    FROM stocks
    GROUP BY exchange
    ORDER BY count DESC
  `);

  console.log('📍 Stocks by exchange:');
  exchangeCounts.rows.forEach((row) => {
    console.log(`   - ${row.exchange}: ${row.count} stocks`);
  });
  console.log('');

  // Total price records
  const totalPrices = await query('SELECT COUNT(*) as count FROM stock_prices');
  console.log(`💵 Total price records: ${totalPrices.rows[0].count}\n`);

  // Sample stock with prices
  const sampleStock = await query(`
    SELECT
      s.symbol,
      s.name,
      s.exchange,
      s.sector,
      COUNT(sp.id) as price_count
    FROM stocks s
    LEFT JOIN stock_prices sp ON s.symbol = sp.symbol
    GROUP BY s.symbol, s.name, s.exchange, s.sector
    LIMIT 5
  `);

  console.log('📋 Sample stocks with price counts:');
  sampleStock.rows.forEach((row) => {
    console.log(
      `   - ${row.symbol} (${row.name}) [${row.exchange}]: ${row.price_count} price records`
    );
  });
  console.log('');
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    console.log('='.repeat(50));
    console.log('');

    // Generate sample data
    console.log('🎲 Generating sample data...\n');
    const { stocks, prices } = generateAllSampleData();
    console.log(`   ✓ Generated ${stocks.length} stocks`);
    console.log(`   ✓ Generated ${prices.length} price records\n`);

    // Clear existing data
    await clearData();

    // Insert stocks
    await insertStocks(stocks);

    // Insert prices
    await insertStockPrices(prices);

    // Display summary
    await displaySummary();

    console.log('='.repeat(50));
    console.log('\n✨ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run seeding
seed()
  .then(() => {
    console.log('👍 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  });
