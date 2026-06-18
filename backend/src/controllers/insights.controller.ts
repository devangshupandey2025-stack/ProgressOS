import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { insightsService } from '../services/insights.service.js';
import { sendSuccess } from '../utils/response.js';

export class InsightsController {
  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await insightsService.generate(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const insightsController = new InsightsController();
