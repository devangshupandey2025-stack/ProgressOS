import { Router } from 'express';
import { insightsController } from '../controllers/insights.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) =>
  insightsController.getInsights(req as AuthenticatedRequest, res, next)
);

export default router;
