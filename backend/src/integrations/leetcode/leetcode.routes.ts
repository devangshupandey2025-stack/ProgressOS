import { Router } from 'express';
import { leetCodeController } from './leetcode.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/index.js';

const router = Router();

router.get('/status', requireAuth, (req, res, next) => leetCodeController.getStatus(req as AuthenticatedRequest, res, next));
router.get('/profile', requireAuth, (req, res, next) => leetCodeController.getProfile(req as AuthenticatedRequest, res, next));
router.get('/contest', requireAuth, (req, res, next) => leetCodeController.getContest(req as AuthenticatedRequest, res, next));
router.get('/analytics', requireAuth, (req, res, next) => leetCodeController.getAnalytics(req as AuthenticatedRequest, res, next));
router.get('/insights', requireAuth, (req, res, next) => leetCodeController.getInsights(req as AuthenticatedRequest, res, next));
router.get('/readiness', requireAuth, (req, res, next) => leetCodeController.getReadiness(req as AuthenticatedRequest, res, next));

export default router;
