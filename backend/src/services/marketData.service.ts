import { query } from '../utils/database';

/**
 * Interface for stock with latest price
 */
export interface StockWithPrice {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  latest_date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  price_change?: number;
  price_change_percent?: number;
}

/**
 * Interface for historical price data
 */
export interface HistoricalPrice {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
}

/**
 * Interface for stock history response
 */
export interface StockHistory {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  prices: HistoricalPrice[];
}

/**
 * Interface for market summary
 */
export interface MarketSummary {
  total_stocks: number;
  total_volume: number;
  exchanges: {
    exchange: string;
    stock_count: number;
    total_volume: number;
  }[];
  sectors: {
    sector: string;
    stock_count: number;
  }[];
  date: Date;
}

/**
 * Get latest prices for all stocks
 * @param limit - Maximum number of stocks to return (default: 50)
 * @returns Array of stocks with their latest prices
 */
export async function getLatestPrices(
  limit: number = 50
): Promise<StockWithPrice[]> {
  const result = await query(
    `
    SELECT
      s.symbol,
      s.name,
      s.exchange,
      s.sector,
      sp.date as latest_date,
      sp.open,
      sp.high,
      sp.low,
      sp.close,
      sp.volume
    FROM stocks s
    INNER JOIN LATERAL (
      SELECT date, open, high, low, close, volume
      FROM stock_prices
      WHERE symbol = s.symbol
      ORDER BY date DESC
      LIMIT 1
    ) sp ON true
    ORDER BY s.symbol
    LIMIT $1
  `,
    [limit]
  );

  return result.rows;
}

/**
 * Get historical price data for a specific stock
 * @param symbol - Stock symbol
 * @param days - Number of days of history (default: 30)
 * @returns Stock information with historical prices
 */
export async function getStockHistory(
  symbol: string,
  days: number = 30
): Promise<StockHistory | null> {
  // Get stock information
  const stockResult = await query(
    `
    SELECT symbol, name, exchange, sector
    FROM stocks
    WHERE symbol = $1
  `,
    [symbol]
  );

  if (stockResult.rows.length === 0) {
    return null;
  }

  const stock = stockResult.rows[0];

  // Get historical prices
  const pricesResult = await query(
    `
    SELECT
      date,
      open,
      high,
      low,
      close,
      volume,
      adjusted_close
    FROM stock_prices
    WHERE symbol = $1
    ORDER BY date DESC
    LIMIT $2
  `,
    [symbol, days]
  );

  return {
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
    sector: stock.sector,
    prices: pricesResult.rows,
  };
}

/**
 * Get overall market summary statistics
 * @returns Market summary with aggregated data
 */
export async function getMarketSummary(): Promise<MarketSummary> {
  // Get latest trading date
  const latestDateResult = await query(`
    SELECT MAX(date) as latest_date
    FROM stock_prices
  `);

  const latestDate = latestDateResult.rows[0].latest_date;

  // Get total stocks
  const totalStocksResult = await query(`
    SELECT COUNT(*) as total
    FROM stocks
  `);

  const totalStocks = parseInt(totalStocksResult.rows[0].total);

  // Get total volume for latest trading day
  const totalVolumeResult = await query(
    `
    SELECT COALESCE(SUM(volume), 0) as total_volume
    FROM stock_prices
    WHERE date = $1
  `,
    [latestDate]
  );

  const totalVolume = parseInt(totalVolumeResult.rows[0].total_volume);

  // Get stocks and volume by exchange
  const exchangesResult = await query(
    `
    SELECT
      s.exchange,
      COUNT(s.symbol) as stock_count,
      COALESCE(SUM(sp.volume), 0) as total_volume
    FROM stocks s
    LEFT JOIN stock_prices sp ON s.symbol = sp.symbol AND sp.date = $1
    GROUP BY s.exchange
    ORDER BY stock_count DESC
  `,
    [latestDate]
  );

  // Get stocks by sector
  const sectorsResult = await query(`
    SELECT
      sector,
      COUNT(*) as stock_count
    FROM stocks
    GROUP BY sector
    ORDER BY stock_count DESC
  `);

  return {
    total_stocks: totalStocks,
    total_volume: totalVolume,
    exchanges: exchangesResult.rows.map((row) => ({
      exchange: row.exchange,
      stock_count: parseInt(row.stock_count),
      total_volume: parseInt(row.total_volume),
    })),
    sectors: sectorsResult.rows.map((row) => ({
      sector: row.sector,
      stock_count: parseInt(row.stock_count),
    })),
    date: latestDate,
  };
}
