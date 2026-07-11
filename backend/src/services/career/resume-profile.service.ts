import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';

const MAX_RESUME_PROFILES = 20;

const COMPLETION_CHECKS = [
  { key: 'name', label: 'Name', weight: 0.25 },
  { key: 'targetRole', label: 'Target Role', weight: 0.25 },
  { key: 'photoId', label: 'Photo', weight: 0.25 },
  { key: 'description', label: 'Description', weight: 0.25 },
] as const;

function computeCompletion(profile: Record<string, unknown>): {
  percentage: number;
  checks: { label: string; done: boolean }[];
} {
  const checks = COMPLETION_CHECKS.map((c) => ({
    label: c.label,
    done: profile[c.key] !== null && profile[c.key] !== undefined && profile[c.key] !== '',
  }));
  const filledWeight = COMPLETION_CHECKS.reduce((sum, c, i) => sum + (checks[i].done ? c.weight : 0), 0);
  const percentage = Math.round(filledWeight * 100);
  return { percentage, checks };
}

export class ResumeProfileService {
  private async getCareerProfile(userId: string) {
    let profile = await prisma.careerProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.careerProfile.create({ data: { userId } });
    }
    return profile;
  }

  async list(userId: string) {
    const careerProfile = await this.getCareerProfile(userId);
    const profiles = await prisma.resumeProfile.findMany({
      where: { careerProfileId: careerProfile.id },
      include: { photo: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return profiles.map((p) => {
      const completion = computeCompletion(p as unknown as Record<string, unknown>);
      return { ...p, completion };
    });
  }

  async getById(userId: string, id: string) {
    const careerProfile = await this.getCareerProfile(userId);
    const profile = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
      include: { photo: true },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const completion = computeCompletion(profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }

  async create(userId: string, data: {
    name: string;
    targetRole: string;
    template?: string;
    pageSize?: string;
    summaryStrategy?: string;
    photoId?: string | null;
    description?: string | null;
    displayOrder?: number;
  }) {
    const careerProfile = await this.getCareerProfile(userId);

    const count = await prisma.resumeProfile.count({
      where: { careerProfileId: careerProfile.id },
    });

    if (count >= MAX_RESUME_PROFILES) {
      throw AppError.badRequest(`Maximum ${MAX_RESUME_PROFILES} resume profiles allowed`);
    }

    const isDefault = count === 0;

    const profile = await prisma.resumeProfile.create({
      data: {
        careerProfileId: careerProfile.id,
        name: data.name,
        targetRole: data.targetRole,
        template: data.template ?? 'modern',
        pageSize: data.pageSize ?? 'a4',
        summaryStrategy: data.summaryStrategy ?? 'manual',
        photoId: data.photoId ?? null,
        description: data.description ?? null,
        displayOrder: data.displayOrder ?? 0,
        isDefault,
      },
      include: { photo: true },
    });

    const completion = computeCompletion(profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }

  async update(userId: string, id: string, data: Partial<{
    name: string;
    targetRole: string;
    template: string;
    pageSize: string;
    summaryStrategy: string;
    photoId: string | null;
    description: string | null;
    displayOrder: number;
    isDefault: boolean;
  }>) {
    const careerProfile = await this.getCareerProfile(userId);

    const existing = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
    });

    if (!existing) throw AppError.notFound('Resume profile not found');

    if (data.isDefault === true) {
      await prisma.resumeProfile.updateMany({
        where: { careerProfileId: careerProfile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.resumeProfile.update({
      where: { id },
      data,
      include: { photo: true },
    });

    const completion = computeCompletion(profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }

  async delete(userId: string, id: string) {
    const careerProfile = await this.getCareerProfile(userId);

    const existing = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
    });

    if (!existing) throw AppError.notFound('Resume profile not found');

    const wasDefault = existing.isDefault;

    await prisma.resumeProfile.delete({ where: { id } });

    if (wasDefault) {
      const oldest = await prisma.resumeProfile.findFirst({
        where: { careerProfileId: careerProfile.id },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      });

      if (oldest) {
        await prisma.resumeProfile.update({
          where: { id: oldest.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async clone(userId: string, id: string) {
    const careerProfile = await this.getCareerProfile(userId);

    const original = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
    });

    if (!original) throw AppError.notFound('Resume profile not found');

    const count = await prisma.resumeProfile.count({
      where: { careerProfileId: careerProfile.id },
    });

    if (count >= MAX_RESUME_PROFILES) {
      throw AppError.badRequest(`Maximum ${MAX_RESUME_PROFILES} resume profiles allowed`);
    }

    const cloneData = {
      careerProfileId: careerProfile.id,
      name: `${original.name} (Copy)`,
      targetRole: original.targetRole,
      template: original.template,
      pageSize: original.pageSize,
      summaryStrategy: original.summaryStrategy,
      photoId: original.photoId,
      description: original.description,
      displayOrder: original.displayOrder + 1,
      isDefault: false,
    };

    const profile = await prisma.resumeProfile.create({
      data: cloneData,
      include: { photo: true },
    });

    const completion = computeCompletion(profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }

  async setDefault(userId: string, id: string) {
    const careerProfile = await this.getCareerProfile(userId);

    const existing = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
    });

    if (!existing) throw AppError.notFound('Resume profile not found');

    await prisma.resumeProfile.updateMany({
      where: { careerProfileId: careerProfile.id, isDefault: true },
      data: { isDefault: false },
    });

    const profile = await prisma.resumeProfile.update({
      where: { id },
      data: { isDefault: true },
      include: { photo: true },
    });

    const completion = computeCompletion(profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }
}

export const resumeProfileService = new ResumeProfileService();
