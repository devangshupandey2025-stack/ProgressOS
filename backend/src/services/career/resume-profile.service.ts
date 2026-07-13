import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';


const MAX_RESUME_PROFILES = 20;

const COMPLETION_WEIGHTS: { key: string; label: string; weight: number; computed?: boolean }[] = [
  { key: 'name', label: 'Name', weight: 0.075 },
  { key: 'targetRole', label: 'Target Role', weight: 0.075 },
  { key: 'photoId', label: 'Photo', weight: 0.1 },
  { key: 'description', label: 'Description', weight: 0.1 },
  { key: 'hasProjects', label: 'Projects', weight: 0.3, computed: true },
  { key: 'hasCertificates', label: 'Certificates', weight: 0.15, computed: true },
  { key: 'hasAchievements', label: 'Achievements', weight: 0.1, computed: true },
  { key: 'hasSkills', label: 'Skills', weight: 0.1, computed: true },
];

async function computeCompletion(resumeProfileId: string, profile: Record<string, unknown>) {
  const [projectCount, certCount, achievementCount] = await Promise.all([
    prisma.resumeProject.count({ where: { resumeProfileId } }),
    prisma.resumeCertificate.count({ where: { resumeProfileId } }),
    prisma.resumeAchievement.count({ where: { resumeProfileId } }),
  ]);

  const resumeProjects = await prisma.resumeProject.findMany({
    where: { resumeProfileId },
    include: { project: { select: { techStack: true } } },
  });
  const allTech = resumeProjects.flatMap((rp) => rp.project.techStack);
  const skillCount = new Set(allTech).size;

  const computedValues: Record<string, boolean> = {
    hasProjects: projectCount > 0,
    hasCertificates: certCount > 0,
    hasAchievements: achievementCount > 0,
    hasSkills: skillCount > 0,
  };

  const checks = COMPLETION_WEIGHTS.map((c) => {
    let done: boolean;
    if (c.computed) {
      done = computedValues[c.key] ?? false;
    } else {
      const v = profile[c.key];
      done = v !== null && v !== undefined && v !== '';
    }
    return { label: c.label, done, weight: c.weight };
  });

  const filledWeight = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  const percentage = Math.round(filledWeight * 100);

  return {
    percentage,
    checks,
    counts: {
      projects: projectCount,
      skills: skillCount,
      certificates: certCount,
      achievements: achievementCount,
    },
  };
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

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const completion = await computeCompletion(p.id, p as unknown as Record<string, unknown>);
        return { ...p, completion };
      })
    );

    return enriched;
  }

  async getById(userId: string, id: string) {
    const careerProfile = await this.getCareerProfile(userId);
    const profile = await prisma.resumeProfile.findFirst({
      where: { id, careerProfileId: careerProfile.id },
      include: { photo: true },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const completion = await computeCompletion(profile.id, profile as unknown as Record<string, unknown>);
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

    const completion = await computeCompletion(profile.id, profile as unknown as Record<string, unknown>);
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

    const completion = await computeCompletion(profile.id, profile as unknown as Record<string, unknown>);
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
      include: {
        resumeProjects: true,
        resumeCertificates: true,
        resumeAchievements: true,
      },
    });

    if (!original) throw AppError.notFound('Resume profile not found');

    const count = await prisma.resumeProfile.count({
      where: { careerProfileId: careerProfile.id },
    });

    if (count >= MAX_RESUME_PROFILES) {
      throw AppError.badRequest(`Maximum ${MAX_RESUME_PROFILES} resume profiles allowed`);
    }

    const clone = await prisma.resumeProfile.create({
      data: {
        careerProfileId: careerProfile.id,
        name: `${original.name} (Copy)`,
        targetRole: original.targetRole,
        template: original.template,
        pageSize: original.pageSize,
        summaryStrategy: original.summaryStrategy,
        photoId: original.photoId,
        description: original.description,
        sectionSettings: original.sectionSettings as any,
        displayOrder: original.displayOrder + 1,
        isDefault: false,
      },
      include: { photo: true },
    });

    if (original.resumeProjects.length > 0) {
      await prisma.resumeProject.createMany({
        data: original.resumeProjects.map((rp) => ({
          resumeProfileId: clone.id,
          projectId: rp.projectId,
          displayOrder: rp.displayOrder,
          selectedBulletIds: rp.selectedBulletIds as any,
        })),
      });
    }

    if (original.resumeCertificates.length > 0) {
      await prisma.resumeCertificate.createMany({
        data: original.resumeCertificates.map((rc) => ({
          resumeProfileId: clone.id,
          certificateId: rc.certificateId,
          displayOrder: rc.displayOrder,
        })),
      });
    }

    if (original.resumeAchievements.length > 0) {
      await prisma.resumeAchievement.createMany({
        data: original.resumeAchievements.map((ra) => ({
          resumeProfileId: clone.id,
          achievementKey: ra.achievementKey,
          displayOrder: ra.displayOrder,
        })),
      });
    }

    const completion = await computeCompletion(clone.id, clone as unknown as Record<string, unknown>);
    return { ...clone, completion };
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

    const completion = await computeCompletion(profile.id, profile as unknown as Record<string, unknown>);
    return { ...profile, completion };
  }
}

export const resumeProfileService = new ResumeProfileService();
