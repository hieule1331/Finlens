import { Request, Response } from 'express';
import * as calculationService from '../services/calculation.service';

/**
 * Get layer strength
 * GET /api/v1/calculation/layer/:layer
 * Path params:
 *   - layer: string (required) - BLUECHIP/MIDCAP/PENNY
 * Query params:
 *   - date: string (optional) - YYYY-MM-DD format
 */
export async function getLayerStrength(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { layer } = req.params;
    const date = req.query.date as string | undefined;

    // Validate layer
    if (!layer || layer.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Layer is required',
      });
      return;
    }

    const validLayers = ['BLUECHIP', 'MIDCAP', 'PENNY'];
    if (!validLayers.includes(layer.toUpperCase())) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Layer must be one of: BLUECHIP, MIDCAP, PENNY',
      });
      return;
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Date must be in YYYY-MM-DD format',
        });
        return;
      }
    }

    const layerStrength = await calculationService.calculateLayerStrength(
      layer,
      date
    );

    if (!layerStrength) {
      res.status(404).json({
        error: 'Not Found',
        message: `No data found for layer '${layer.toUpperCase()}'${date ? ` on date ${date}` : ''}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: layerStrength,
    });
  } catch (error) {
    console.error('Error in getLayerStrength:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate layer strength',
    });
  }
}

/**
 * Get sector strength
 * GET /api/v1/calculation/sector/:sector
 * Path params:
 *   - sector: string (required) - BDS/NGANHANG/etc
 * Query params:
 *   - date: string (optional) - YYYY-MM-DD format
 */
export async function getSectorStrength(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { sector } = req.params;
    const date = req.query.date as string | undefined;

    // Validate sector
    if (!sector || sector.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Sector is required',
      });
      return;
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Date must be in YYYY-MM-DD format',
        });
        return;
      }
    }

    const sectorStrength = await calculationService.calculateSectorStrength(
      sector,
      date
    );

    if (!sectorStrength) {
      res.status(404).json({
        error: 'Not Found',
        message: `No data found for sector '${sector.toUpperCase()}'${date ? ` on date ${date}` : ''}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sectorStrength,
    });
  } catch (error) {
    console.error('Error in getSectorStrength:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate sector strength',
    });
  }
}
