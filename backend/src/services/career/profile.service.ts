import { prisma } from '../../config/database.js';

const PROFILE_FIELDS = [
  'fullName', 'professionalTitle', 'email', 'phone', 'location',
  'website', 'linkedin', 'github', 'leetcode', 'codeforces',
  'portfolio', 'bio',
] as const;

type ProfileField = typeof PROFILE_FIELDS[number];

function computeCompletion(data: Record<string, unknown>): number {
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = data[f];
    return v !== null && v !== undefined && v !== '';
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

function missingFields(data: Record<string, unknown>): string[] {
  return PROFILE_FIELDS.filter((f) => {
    const v = data[f];
    return v === null || v === undefined || v === '';
  }).map((f) => {
    // convert camelCase to human-readable labels
    return f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  });
}

export class CareerProfileService {
  async getProfile(userId: string) {
    let profile = await prisma.careerProfile.findUnique({
      where: { userId },
      include: { photos: { where: { isDefault: true }, take: 1 } },
    });

    if (!profile) {
      profile = await prisma.careerProfile.create({
        data: { userId },
        include: { photos: { where: { isDefault: true }, take: 1 } },
      });
    }

    const data = profile as Record<string, unknown>;
    const completionPercentage = computeCompletion(data);
    const missing = missingFields(data);

    const defaultPhoto = profile.photos[0] ?? null;

    return {
      ...profile,
      defaultPhoto,
      completionPercentage,
      missingFields: missing,
    };
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const profile = await prisma.careerProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    const completionPercentage = computeCompletion(profile as unknown as Record<string, unknown>);
    const missing = missingFields(profile as unknown as Record<string, unknown>);

    return {
      ...profile,
      completionPercentage,
      missingFields: missing,
    };
  }
}

export const careerProfileService = new CareerProfileService();
