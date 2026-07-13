import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { careerIntelligenceController } from '../controllers/career-studio/career-intelligence.controller.js';

const router = Router();

router.post('/improve', requireAuth, (req, res, next) =>
  careerIntelligenceController.improveSection(req as AuthenticatedRequest, res, next)
);

router.post('/review/:reviewId/accept', requireAuth, (req, res, next) =>
  careerIntelligenceController.acceptReview(req as AuthenticatedRequest, res, next)
);
router.post('/review/:reviewId/reject', requireAuth, (req, res, next) =>
  careerIntelligenceController.rejectReview(req as AuthenticatedRequest, res, next)
);
router.post('/review/:reviewId/edit', requireAuth, (req, res, next) =>
  careerIntelligenceController.editAndAccept(req as AuthenticatedRequest, res, next)
);

router.get('/versions/:profileId', requireAuth, (req, res, next) =>
  careerIntelligenceController.listVersions(req as AuthenticatedRequest, res, next)
);
router.get('/versions/:profileId/:versionId', requireAuth, (req, res, next) =>
  careerIntelligenceController.getVersion(req as AuthenticatedRequest, res, next)
);
router.post('/versions/restore', requireAuth, (req, res, next) =>
  careerIntelligenceController.restoreVersion(req as AuthenticatedRequest, res, next)
);

router.get('/context/:profileId', requireAuth, (req, res, next) =>
  careerIntelligenceController.getEffectiveContext(req as AuthenticatedRequest, res, next)
);

export default router;
