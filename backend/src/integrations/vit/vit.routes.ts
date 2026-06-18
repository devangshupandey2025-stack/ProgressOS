import { Router } from 'express';
import { vitController } from './vit.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { connectVitSchema } from './vit.validator.js';
import { AuthenticatedRequest } from '../../types/index.js';

const router = Router();

router.get('/status', requireAuth, (req, res, next) => vitController.getStatus(req as AuthenticatedRequest, res, next));
router.post('/connect', requireAuth, validate(connectVitSchema), (req, res, next) => vitController.connect(req as AuthenticatedRequest, res, next));
router.post('/disconnect', requireAuth, (req, res, next) => vitController.disconnect(req as AuthenticatedRequest, res, next));
router.get('/profile', requireAuth, (req, res, next) => vitController.getProfile(req as AuthenticatedRequest, res, next));
router.get('/analytics', requireAuth, (req, res, next) => vitController.getAnalytics(req as AuthenticatedRequest, res, next));
router.get('/courses', requireAuth, (req, res, next) => vitController.getCourses(req as AuthenticatedRequest, res, next));

export default router;
