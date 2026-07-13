import { Router } from 'express';
import { profileController } from '../controllers/career-studio/profile.controller.js';
import { photoController } from '../controllers/career-studio/photo.controller.js';
import { resumeProfileController } from '../controllers/career-studio/resume-profile.controller.js';
import { resumeCompositionController } from '../controllers/career-studio/resume-composition.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateCareerProfileSchema } from '../validators/career-profile.validator.js';
import { createResumeProfileSchema, updateResumeProfileSchema } from '../validators/resume-profile.validator.js';
import { uploadPhoto } from '../middleware/upload.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// ─── Profile ───────────────────────────────────────────────────────────────

router.get(
  '/profile',
  requireAuth,
  (req, res, next) => profileController.get(req as AuthenticatedRequest, res, next)
);

router.put(
  '/profile',
  requireAuth,
  validate(updateCareerProfileSchema),
  (req, res, next) => profileController.update(req as AuthenticatedRequest, res, next)
);

// ─── Stats ─────────────────────────────────────────────────────────────────

router.get(
  '/stats',
  requireAuth,
  (req, res, next) => profileController.stats(req as AuthenticatedRequest, res, next)
);

// ─── Photos ────────────────────────────────────────────────────────────────

router.get(
  '/photos',
  requireAuth,
  (req, res, next) => photoController.list(req as AuthenticatedRequest, res, next)
);

router.post(
  '/photos',
  requireAuth,
  uploadPhoto.single('photo'),
  (req, res, next) => photoController.upload(req as AuthenticatedRequest, res, next)
);

router.delete(
  '/photos/:id',
  requireAuth,
  (req, res, next) => photoController.delete(req as AuthenticatedRequest, res, next)
);

router.put(
  '/photos/:id/default',
  requireAuth,
  (req, res, next) => photoController.setDefault(req as AuthenticatedRequest, res, next)
);

// ─── Resume Profiles ───────────────────────────────────────────────────────

router.get(
  '/resume-profiles',
  requireAuth,
  (req, res, next) => resumeProfileController.list(req as AuthenticatedRequest, res, next)
);

router.get(
  '/resume-profiles/:id',
  requireAuth,
  (req, res, next) => resumeProfileController.getById(req as AuthenticatedRequest, res, next)
);

router.post(
  '/resume-profiles',
  requireAuth,
  validate(createResumeProfileSchema),
  (req, res, next) => resumeProfileController.create(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id',
  requireAuth,
  validate(updateResumeProfileSchema),
  (req, res, next) => resumeProfileController.update(req as AuthenticatedRequest, res, next)
);

router.delete(
  '/resume-profiles/:id',
  requireAuth,
  (req, res, next) => resumeProfileController.delete(req as AuthenticatedRequest, res, next)
);

router.post(
  '/resume-profiles/:id/clone',
  requireAuth,
  (req, res, next) => resumeProfileController.clone(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id/default',
  requireAuth,
  (req, res, next) => resumeProfileController.setDefault(req as AuthenticatedRequest, res, next)
);

// ─── Resume Composition ────────────────────────────────────────────────────

// Projects
router.get(
  '/resume-profiles/:id/projects',
  requireAuth,
  (req, res, next) => resumeCompositionController.getProjects(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id/projects',
  requireAuth,
  (req, res, next) => resumeCompositionController.updateProjects(req as AuthenticatedRequest, res, next)
);

// Certificates
router.get(
  '/resume-profiles/:id/certificates',
  requireAuth,
  (req, res, next) => resumeCompositionController.getCertificates(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id/certificates',
  requireAuth,
  (req, res, next) => resumeCompositionController.updateCertificates(req as AuthenticatedRequest, res, next)
);

// Achievements
router.get(
  '/resume-profiles/:id/achievements',
  requireAuth,
  (req, res, next) => resumeCompositionController.getAchievements(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id/achievements',
  requireAuth,
  (req, res, next) => resumeCompositionController.updateAchievements(req as AuthenticatedRequest, res, next)
);

// Sections
router.get(
  '/resume-profiles/:id/sections',
  requireAuth,
  (req, res, next) => resumeCompositionController.getSections(req as AuthenticatedRequest, res, next)
);

router.put(
  '/resume-profiles/:id/sections',
  requireAuth,
  (req, res, next) => resumeCompositionController.updateSections(req as AuthenticatedRequest, res, next)
);

// Context Preview v1 (legacy)
router.get(
  '/resume-profiles/:id/context/v1',
  requireAuth,
  (req, res, next) => resumeCompositionController.getContextV1(req as AuthenticatedRequest, res, next)
);

// Resume Context — canonical output for Phase 3+
router.get(
  '/resume-profiles/:id/context',
  requireAuth,
  (req, res, next) => resumeCompositionController.getContext(req as AuthenticatedRequest, res, next)
);

// ─── Standalone Certificate Management ─────────────────────────────────────

router.get(
  '/certificates',
  requireAuth,
  (req, res, next) => resumeCompositionController.listCertificates(req as AuthenticatedRequest, res, next)
);

router.post(
  '/certificates',
  requireAuth,
  (req, res, next) => resumeCompositionController.createCertificate(req as AuthenticatedRequest, res, next)
);

router.put(
  '/certificates/:id',
  requireAuth,
  (req, res, next) => resumeCompositionController.updateCertificate(req as AuthenticatedRequest, res, next)
);

router.delete(
  '/certificates/:id',
  requireAuth,
  (req, res, next) => resumeCompositionController.deleteCertificate(req as AuthenticatedRequest, res, next)
);

export default router;
