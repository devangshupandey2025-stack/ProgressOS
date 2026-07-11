import { prisma } from '../../config/database.js';
import { careerProfileService } from './profile.service.js';
import { careerPhotoService } from './photo.service.js';

export interface CareerStats {
  profileCompletion: number;
  photoCount: number;
  linkedAccounts: number;
  projectCount: number;
  skillCount: number;
  fieldsCompleted: string;
}

export interface CareerContext {
  profile: Awaited<ReturnType<typeof careerProfileService.getProfile>>;
  photos: Awaited<ReturnType<typeof careerPhotoService.getPhotos>>;
  stats: CareerStats;
}

export class ContextBuilderService {
  async build(userId: string): Promise<CareerContext> {
    const [profile, photos, stats] = await Promise.all([
      careerProfileService.getProfile(userId),
      careerPhotoService.getPhotos(userId),
      this.computeStats(userId),
    ]);

    return { profile, photos, stats };
  }

  private async computeStats(userId: string): Promise<CareerStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        codeforcesHandle: true,
        leetcodeUsername: true,
        githubUsername: true,
        vitUsername: true,
      },
    });

    const linkedAccounts = [user?.codeforcesHandle, user?.leetcodeUsername, user?.githubUsername, user?.vitUsername]
      .filter(Boolean).length;

    const [projectCount, allTechStacks, photoCount, profile] = await Promise.all([
      prisma.projectEntry.count({ where: { userId } }),
      prisma.projectEntry.findMany({
        where: { userId },
        select: { techStack: true },
      }),
      prisma.careerPhoto.count({
        where: { careerProfile: { userId } },
      }),
      careerProfileService.getProfile(userId),
    ]);

    const allSkills = new Set(allTechStacks.flatMap((p) => p.techStack));

    return {
      profileCompletion: profile.completionPercentage,
      photoCount,
      linkedAccounts,
      projectCount,
      skillCount: allSkills.size,
      fieldsCompleted: `${12 - profile.missingFields.length} / 12`,
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
