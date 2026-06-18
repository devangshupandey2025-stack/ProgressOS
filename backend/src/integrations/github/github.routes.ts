import { Router } from 'express';
import { gitHubController } from './github.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { AuthenticatedRequest } from '../../types/index.js';

const router = Router();

router.get('/status', requireAuth, (req, res, next) => gitHubController.getStatus(req as AuthenticatedRequest, res, next));
router.get('/profile', requireAuth, (req, res, next) => gitHubController.getProfile(req as AuthenticatedRequest, res, next));
router.get('/repositories', requireAuth, (req, res, next) => gitHubController.getRepositories(req as AuthenticatedRequest, res, next));
router.get('/activity', requireAuth, (req, res, next) => gitHubController.getActivity(req as AuthenticatedRequest, res, next));
router.get('/analytics', requireAuth, (req, res, next) => gitHubController.getAnalytics(req as AuthenticatedRequest, res, next));

export default router;
