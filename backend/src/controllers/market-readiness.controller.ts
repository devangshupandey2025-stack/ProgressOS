import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { marketReadinessService } from '../services/market-readiness.service.js';
import { sendSuccess } from '../utils/response.js';

export class MarketReadinessController {
  async getReadiness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await marketReadinessService.compute(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const marketReadinessController = new MarketReadinessController();
