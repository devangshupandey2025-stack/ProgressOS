import { prisma } from '../../../../config/database.js';
import { AppError } from '../../../../utils/AppError.js';
import { resumeOverrides } from '../engine/overrides.js';
import { resumeCompositionService } from '../../resume-composition.service.js';
import type { ResumeRevisionData, ResumeChangeData } from '../../../../types/ai.types.js';
import type { ResumeContext } from '../../../../types/resume-context.js';
import type { Prisma } from '@prisma/client';

export class RevisionService {
  async acceptReview(reviewId: string, userId: string): Promise<ResumeRevisionData> {
    const review = await prisma.aIReview.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound('Review not found');
    if (review.status !== 'pending') throw AppError.badRequest('Review already processed');

    await prisma.aIReview.update({ where: { id: reviewId }, data: { status: 'accepted' } });

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: review.resumeProfileId },
      select: { activeRevisionId: true },
    });

    const context = await resumeCompositionService.buildResumeContext(userId, review.resumeProfileId);

    const changePayload: Prisma.InputJsonValue = (review.edited || review.after) as Prisma.InputJsonValue;

    const revision = await prisma.resumeRevision.create({
      data: {
        resumeProfileId: review.resumeProfileId,
        parentRevisionId: profile?.activeRevisionId || null,
        label: `AI ${review.action}: ${review.section}${review.sectionItemId ? ` (${review.sectionItemId})` : ''}`,
        changes: {
          create: {
            section: review.section,
            sectionItemId: review.sectionItemId || null,
            changeType: 'replace',
            payload: changePayload,
          },
        },
      },
      include: { changes: true },
    });

    await prisma.resumeProfile.update({
      where: { id: review.resumeProfileId },
      data: { activeRevisionId: revision.id },
    });

    return this.mapRevision(revision);
  }

  async rejectReview(reviewId: string): Promise<void> {
    const review = await prisma.aIReview.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound('Review not found');
    await prisma.aIReview.update({ where: { id: reviewId }, data: { status: 'rejected' } });
  }

  async editAndAccept(reviewId: string, edited: Record<string, unknown>, userId: string): Promise<ResumeRevisionData> {
    const review = await prisma.aIReview.findUnique({ where: { id: reviewId } });
    if (!review) throw AppError.notFound('Review not found');

    await prisma.aIReview.update({
      where: { id: reviewId },
      data: { status: 'accepted', edited: edited as any },
    });

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: review.resumeProfileId },
      select: { activeRevisionId: true },
    });

    const editPayload: Prisma.InputJsonValue = edited as Prisma.InputJsonValue;

    const revision = await prisma.resumeRevision.create({
      data: {
        resumeProfileId: review.resumeProfileId,
        parentRevisionId: profile?.activeRevisionId || null,
        label: `Manual edit: ${review.section}`,
        changes: {
          create: {
            section: review.section,
            sectionItemId: review.sectionItemId || null,
            changeType: 'replace',
            payload: editPayload,
          },
        },
      },
      include: { changes: true },
    });

    await prisma.resumeProfile.update({
      where: { id: review.resumeProfileId },
      data: { activeRevisionId: revision.id },
    });

    return this.mapRevision(revision);
  }

  async listVersions(profileId: string): Promise<ResumeRevisionData[]> {
    const revisions = await prisma.resumeRevision.findMany({
      where: { resumeProfileId: profileId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { changes: true } } },
    });
    return revisions.map(r => ({
      id: r.id,
      resumeProfileId: r.resumeProfileId,
      parentRevisionId: r.parentRevisionId,
      label: r.label,
      createdAt: r.createdAt.toISOString(),
      changeCount: r._count.changes,
    }));
  }

  async getVersion(userId: string, profileId: string, versionId: string): Promise<{ revision: ResumeRevisionData; context: ResumeContext }> {
    const revision = await prisma.resumeRevision.findUnique({
      where: { id: versionId, resumeProfileId: profileId },
      include: { changes: true },
    });
    if (!revision) throw AppError.notFound('Revision not found');

    const baseContext = await resumeCompositionService.buildResumeContext(userId, profileId);

    const changes: ResumeChangeData[] = revision.changes.map(c => ({
      id: c.id,
      section: c.section,
      sectionItemId: c.sectionItemId,
      changeType: c.changeType,
      payload: c.payload as Record<string, unknown>,
    }));

    const effectiveContext = resumeOverrides.apply(baseContext, changes);

    return {
      revision: {
        id: revision.id,
        resumeProfileId: revision.resumeProfileId,
        parentRevisionId: revision.parentRevisionId,
        label: revision.label,
        createdAt: revision.createdAt.toISOString(),
        changeCount: revision.changes.length,
      },
      context: effectiveContext,
    };
  }

  async restoreVersion(profileId: string, versionId: string, userId: string): Promise<void> {
    const revision = await prisma.resumeRevision.findUnique({
      where: { id: versionId, resumeProfileId: profileId },
    });
    if (!revision) throw AppError.notFound('Revision not found');

    await prisma.resumeProfile.update({
      where: { id: profileId },
      data: { activeRevisionId: versionId },
    });
  }

  private mapRevision(r: any): ResumeRevisionData {
    return {
      id: r.id,
      resumeProfileId: r.resumeProfileId,
      parentRevisionId: r.parentRevisionId,
      label: r.label,
      createdAt: r.createdAt?.toISOString?.() || r.createdAt,
      changeCount: r.changes?.length || 0,
    };
  }
}

export const revisionService = new RevisionService();
