import { Request, Response } from 'express';
import * as marketDataService from '../services/marketData.service';

/**
 * Get latest prices for all stocks
 * GET /api/v1/market/latest
 * Query params:
 *   - limit: number (optional, default: 50)
 */
export async function getLatestPrices(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Validate limit
    if (limit < 1 || limit > 100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be between 1 and 100',
      });
      return;
    }

    const stocks = await marketDataService.getLatestPrices(limit);

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks,
    });
  } catch (error) {
    console.error('Error in getLatestPrices:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch latest prices',
    });
  }
}

/**
 * Get historical price data for a specific stock
 * GET /api/v1/market/history/:symbol
 * Path params:
 *   - symbol: string (required)
 * Query params:
 *   - days: number (optional, default: 30)
 */
export async function getStockHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    // Validate symbol
    if (!symbol || symbol.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Stock symbol is required',
      });
      return;
    }

    // Validate days
    if (days < 1 || days > 365) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Days must be between 1 and 365',
      });
      return;
    }

    const stockHistory = await marketDataService.getStockHistory(
      symbol.toUpperCase(),
      days
    );

    if (!stockHistory) {
      res.status(404).json({
        error: 'Not Found',
        message: `Stock with symbol '${symbol.toUpperCase()}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: stockHistory,
    });
  } catch (error) {
    console.error('Error in getStockHistory:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch stock history',
    });
  }
}

/**
 * Get overall market summary statistics
 * GET /api/v1/market/summary
 */
export async function getMarketSummary(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const summary = await marketDataService.getMarketSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error in getMarketSummary:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch market summary',
    });
  }
}
