import { query } from '../utils/database';

/**
 * Interface for layer strength result
 */
export interface LayerStrength {
  layer: string;
  strength: number;
  avgChange: number;
  adRatio: number;
  totalStocks: number;
  advancers: number;
  decliners: number;
  status: string;
}

/**
 * Interface for sector strength result
 */
export interface SectorStrength {
  sector: string;
  strength: number;
  avgChange: number;
  adRatio: number;
  totalStocks: number;
  advancers: number;
  decliners: number;
  status: string;
}

/**
 * Get strength status from strength score
 * @param strength - Composite strength score
 * @returns Status string
 */
export function getStrengthStatus(strength: number): string {
  if (strength > 3) return 'VERY_STRONG';
  if (strength > 1) return 'STRONG';
  if (strength > -1) return 'MODERATE';
  if (strength > -3) return 'WEAK';
  return 'VERY_WEAK';
}

/**
 * Calculate layer strength
 * @param layer - Stock layer (BLUECHIP/MIDCAP/PENNY)
 * @param date - Optional date (defaults to latest trading date)
 * @returns Layer strength data
 */
export async function calculateLayerStrength(
  layer: string,
  date?: string
): Promise<LayerStrength | null> {
  // Validate layer
  const validLayers = ['BLUECHIP', 'MIDCAP', 'PENNY'];
  if (!validLayers.includes(layer.toUpperCase())) {
    return null;
  }

  // Get the date to use (latest if not specified)
  let targetDate = date;
  if (!targetDate) {
    const latestDateResult = await query(`
      SELECT MAX(date) as latest_date
      FROM stock_prices
    `);
    targetDate = latestDateResult.rows[0].latest_date;
  }

  // Get stocks in the layer with their price changes
  const result = await query(
    `
    SELECT
      s.symbol,
      s.name,
      s.layer,
      today.close as current_price,
      yesterday.close as previous_price,
      CASE
        WHEN yesterday.close IS NOT NULL AND yesterday.close > 0
        THEN ((today.close - yesterday.close) / yesterday.close * 100)
        ELSE 0
      END as price_change_percent
    FROM stocks s
    INNER JOIN stock_prices today ON s.symbol = today.symbol AND today.date = $1
    LEFT JOIN LATERAL (
      SELECT close
      FROM stock_prices
      WHERE symbol = s.symbol AND date < $1
      ORDER BY date DESC
      LIMIT 1
    ) yesterday ON true
    WHERE s.layer = $2
  `,
    [targetDate, layer.toUpperCase()]
  );

  const stocks = result.rows;

  if (stocks.length === 0) {
    return null;
  }

  // Calculate metrics
  const totalStocks = stocks.length;
  const advancers = stocks.filter(
    (s) => parseFloat(s.price_change_percent) > 0
  ).length;
  const decliners = stocks.filter(
    (s) => parseFloat(s.price_change_percent) < 0
  ).length;

  // Calculate average price change
  const avgChange =
    stocks.reduce((sum, s) => sum + parseFloat(s.price_change_percent), 0) /
    totalStocks;

  // Calculate advance/decline ratio
  const adRatio = advancers / totalStocks;

  // Calculate composite strength score
  // Formula: (avgChange * 0.6) + ((adRatio - 0.5) * 10 * 0.4)
  const strength = avgChange * 0.6 + (adRatio - 0.5) * 10 * 0.4;

  // Get status
  const status = getStrengthStatus(strength);

  return {
    layer: layer.toUpperCase(),
    strength: parseFloat(strength.toFixed(2)),
    avgChange: parseFloat(avgChange.toFixed(2)),
    adRatio: parseFloat(adRatio.toFixed(2)),
    totalStocks,
    advancers,
    decliners,
    status,
  };
}

/**
 * Calculate sector strength
 * @param sector - Stock sector (BDS/NGANHANG/etc)
 * @param date - Optional date (defaults to latest trading date)
 * @returns Sector strength data
 */
export async function calculateSectorStrength(
  sector: string,
  date?: string
): Promise<SectorStrength | null> {
  // Get the date to use (latest if not specified)
  let targetDate = date;
  if (!targetDate) {
    const latestDateResult = await query(`
      SELECT MAX(date) as latest_date
      FROM stock_prices
    `);
    targetDate = latestDateResult.rows[0].latest_date;
  }

  // Get stocks in the sector with their price changes
  const result = await query(
    `
    SELECT
      s.symbol,
      s.name,
      s.sector,
      today.close as current_price,
      yesterday.close as previous_price,
      CASE
        WHEN yesterday.close IS NOT NULL AND yesterday.close > 0
        THEN ((today.close - yesterday.close) / yesterday.close * 100)
        ELSE 0
      END as price_change_percent
    FROM stocks s
    INNER JOIN stock_prices today ON s.symbol = today.symbol AND today.date = $1
    LEFT JOIN LATERAL (
      SELECT close
      FROM stock_prices
      WHERE symbol = s.symbol AND date < $1
      ORDER BY date DESC
      LIMIT 1
    ) yesterday ON true
    WHERE s.sector = $2
  `,
    [targetDate, sector.toUpperCase()]
  );

  const stocks = result.rows;

  if (stocks.length === 0) {
    return null;
  }

  // Calculate metrics
  const totalStocks = stocks.length;
  const advancers = stocks.filter(
    (s) => parseFloat(s.price_change_percent) > 0
  ).length;
  const decliners = stocks.filter(
    (s) => parseFloat(s.price_change_percent) < 0
  ).length;

  // Calculate average price change
  const avgChange =
    stocks.reduce((sum, s) => sum + parseFloat(s.price_change_percent), 0) /
    totalStocks;

  // Calculate advance/decline ratio
  const adRatio = advancers / totalStocks;

  // Calculate composite strength score
  // Formula: (avgChange * 0.6) + ((adRatio - 0.5) * 10 * 0.4)
  const strength = avgChange * 0.6 + (adRatio - 0.5) * 10 * 0.4;

  // Get status
  const status = getStrengthStatus(strength);

  return {
    sector: sector.toUpperCase(),
    strength: parseFloat(strength.toFixed(2)),
    avgChange: parseFloat(avgChange.toFixed(2)),
    adRatio: parseFloat(adRatio.toFixed(2)),
    totalStocks,
    advancers,
    decliners,
    status,
  };
}
