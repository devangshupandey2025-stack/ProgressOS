import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createActivitySchema, updateActivitySchema } from '../validators/activity.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.post('/', requireAuth, validate(createActivitySchema), (req, res, next) =>
  activityController.create(req as unknown as AuthenticatedRequest, res, next));

router.get('/', requireAuth, (req, res, next) =>
  activityController.findAll(req as unknown as AuthenticatedRequest, res, next));

router.get('/:id', requireAuth, (req, res, next) =>
  activityController.findById(req as unknown as AuthenticatedRequest, res, next));

router.put('/:id', requireAuth, validate(updateActivitySchema), (req, res, next) =>
  activityController.update(req as unknown as AuthenticatedRequest, res, next));

router.delete('/:id', requireAuth, (req, res, next) =>
  activityController.delete(req as unknown as AuthenticatedRequest, res, next));

export default router;
