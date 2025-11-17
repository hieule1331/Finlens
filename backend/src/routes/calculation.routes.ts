import { Router } from 'express';
import * as calculationController from '../controllers/calculation.controller';

const router = Router();

/**
 * Calculation Routes
 * Base path: /api/v1/calculation
 */

/**
 * @route   GET /api/v1/calculation/layer/:layer
 * @desc    Get strength calculation for a specific layer
 * @param   layer - Stock layer (BLUECHIP, MIDCAP, PENNY)
 * @query   date - Optional date in YYYY-MM-DD format (defaults to latest)
 * @access  Public
 */
router.get('/layer/:layer', calculationController.getLayerStrength);

/**
 * @route   GET /api/v1/calculation/sector/:sector
 * @desc    Get strength calculation for a specific sector
 * @param   sector - Stock sector (BDS, NGANHANG, etc.)
 * @query   date - Optional date in YYYY-MM-DD format (defaults to latest)
 * @access  Public
 */
router.get('/sector/:sector', calculationController.getSectorStrength);

export default router;
