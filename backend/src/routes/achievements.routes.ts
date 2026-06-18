import { Router } from 'express';
import { achievementsController } from '../controllers/achievements.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) =>
  achievementsController.getAll(req as AuthenticatedRequest, res, next)
);

export default router;
