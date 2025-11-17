import { Router } from 'express';
import * as marketController from '../controllers/market.controller';

const router = Router();

/**
 * Market Data Routes
 * Base path: /api/v1/market
 */

/**
 * @route   GET /api/v1/market/latest
 * @desc    Get latest prices for all stocks
 * @query   limit - Maximum number of stocks to return (1-100, default: 50)
 * @access  Public
 */
router.get('/latest', marketController.getLatestPrices);

/**
 * @route   GET /api/v1/market/history/:symbol
 * @desc    Get historical price data for a specific stock
 * @param   symbol - Stock symbol (e.g., VCB, VIC, FPT)
 * @query   days - Number of days of history (1-365, default: 30)
 * @access  Public
 */
router.get('/history/:symbol', marketController.getStockHistory);

/**
 * @route   GET /api/v1/market/summary
 * @desc    Get overall market summary statistics
 * @access  Public
 */
router.get('/summary', marketController.getMarketSummary);

export default router;
