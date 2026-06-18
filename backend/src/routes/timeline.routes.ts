import { Router } from 'express';
import { timelineController } from '../controllers/timeline.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) =>
  timelineController.getTimeline(req as AuthenticatedRequest, res, next)
);

export default router;
