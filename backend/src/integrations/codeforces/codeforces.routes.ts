import { Router } from 'express';
import { codeforcesController } from './codeforces.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/index.js';

const router = Router();

/**
 * GET /api/codeforces/status
 * Check integration connection status
 */
router.get(
  '/status',
  requireAuth,
  (req, res, next) => codeforcesController.getStatus(req as AuthenticatedRequest, res, next)
);

/**
 * GET /api/codeforces/profile
 * Get connected profile stats
 */
router.get(
  '/profile',
  requireAuth,
  (req, res, next) => codeforcesController.getProfile(req as AuthenticatedRequest, res, next)
);

/**
 * GET /api/codeforces/rating-history
 * Get connected rating changes
 */
router.get(
  '/rating-history',
  requireAuth,
  (req, res, next) => codeforcesController.getRatingHistory(req as AuthenticatedRequest, res, next)
);

/**
 * GET /api/codeforces/analytics
 * Get connected profile submission analytics and predictions
 */
router.get(
  '/analytics',
  requireAuth,
  (req, res, next) => codeforcesController.getAnalytics(req as AuthenticatedRequest, res, next)
);

export default router;
