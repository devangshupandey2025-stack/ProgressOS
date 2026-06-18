import { Router } from 'express';
import { weeklyReviewController } from '../controllers/weekly-review.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) =>
  weeklyReviewController.getWeeklyReview(req as AuthenticatedRequest, res, next)
);

export default router;
