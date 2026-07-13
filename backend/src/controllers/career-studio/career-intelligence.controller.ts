import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../utils/response.js';
import { prisma } from '../../config/database.js';
import { careerIntelligenceEngine } from '../../services/career/ai/engine/career-intelligence.js';
import { revisionService } from '../../services/career/ai/revision/revision.service.js';
import { resumeOverrides } from '../../services/career/ai/engine/overrides.js';
import { resumeCompositionService } from '../../services/career/resume-composition.service.js';
import { improveRequestSchema, reviewActionSchema, restoreSchema } from '../../validators/ai.validator.js';
import type { ResumeChangeData } from '../../types/ai.types.js';

export class CareerIntelligenceController {
  async improveSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = improveRequestSchema.parse(req.body);
      const result = await careerIntelligenceEngine.improve(req.dbUserId!, parsed);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async acceptReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };
      const result = await revisionService.acceptReview(reviewId, req.dbUserId!);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async rejectReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };
      await revisionService.rejectReview(reviewId);
      sendSuccess(res, { status: 'rejected' });
    } catch (error) { next(error); }
  }

  async editAndAccept(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };
      const parsed = reviewActionSchema.parse(req.body);
      const result = await revisionService.editAndAccept(reviewId, parsed.edited || {}, req.dbUserId!);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async listVersions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params as { profileId: string };
      const versions = await revisionService.listVersions(profileId);
      sendSuccess(res, { versions });
    } catch (error) { next(error); }
  }

  async getVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { profileId, versionId } = req.params as { profileId: string; versionId: string };
      const result = await revisionService.getVersion(req.dbUserId!, profileId, versionId);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async restoreVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { profileId, revisionId } = restoreSchema.parse(req.body);
      await revisionService.restoreVersion(profileId, revisionId, req.dbUserId!);
      sendSuccess(res, { status: 'restored' });
    } catch (error) { next(error); }
  }

  async getEffectiveContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params as { profileId: string };
      const context = await resumeCompositionService.buildResumeContext(req.dbUserId!, profileId);

      const profile = await prisma.resumeProfile.findUnique({
        where: { id: profileId },
        select: { activeRevisionId: true },
      });

      if (profile?.activeRevisionId) {
        const revision = await prisma.resumeRevision.findUnique({
          where: { id: profile.activeRevisionId },
          include: { changes: true },
        });
        if (revision) {
          const changes: ResumeChangeData[] = revision.changes.map(c => ({
            id: c.id,
            section: c.section,
            sectionItemId: c.sectionItemId,
            changeType: c.changeType,
            payload: c.payload as Record<string, unknown>,
          }));
          const overridden = resumeOverrides.apply(context, changes);
          sendSuccess(res, overridden);
          return;
        }
      }

      sendSuccess(res, context);
    } catch (error) { next(error); }
  }
}

export const careerIntelligenceController = new CareerIntelligenceController();
