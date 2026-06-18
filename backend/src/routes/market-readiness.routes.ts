import { Router } from 'express';
import { marketReadinessController } from '../controllers/market-readiness.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) =>
  marketReadinessController.getReadiness(req as AuthenticatedRequest, res, next)
);

export default router;
