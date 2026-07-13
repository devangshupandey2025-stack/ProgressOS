import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import type {
  ResumeContext,
  ResumeContextProfile,
  ResumeContextProject,
  ResumeContextCertificate,
  ResumeContextAchievement,
  ResumeContextEducation,
  ResumeContextCodingProfile,
  ResumeContextMetadata,
  ResumeContextSections,
  ResumeContextWarnings,
} from '../../types/resume-context.js';

const COMPLETION_CHECKS: { key: string; label: string; weight: number; computed?: boolean }[] = [
  { key: 'name', label: 'Name', weight: 0.075 },
  { key: 'targetRole', label: 'Target Role', weight: 0.075 },
  { key: 'photoId', label: 'Photo', weight: 0.1 },
  { key: 'description', label: 'Description', weight: 0.1 },
  { key: 'hasProjects', label: 'Projects', weight: 0.3, computed: true },
  { key: 'hasCertificates', label: 'Certificates', weight: 0.15, computed: true },
  { key: 'hasAchievements', label: 'Achievements', weight: 0.1, computed: true },
  { key: 'hasSkills', label: 'Skills', weight: 0.1, computed: true },
];

interface ProjectSelection {
  projectId: string;
  displayOrder: number;
  selectedBulletIds: string[];
}

interface CertificateSelection {
  certificateId: string;
  displayOrder: number;
}

interface AchievementSelection {
  achievementKey: string;
  displayOrder: number;
}

interface SectionSettings {
  order?: string[];
  visibility?: Record<string, boolean>;
  labels?: Record<string, string>;
  projects?: Record<string, unknown>;
}

const DEFAULT_SECTION_ORDER = [
  'summary',
  'projects',
  'skills',
  'achievements',
  'education',
  'certificates',
  'codingProfiles',
];

const DEFAULT_SECTION_VISIBILITY: Record<string, boolean> = {
  summary: true,
  projects: true,
  skills: true,
  achievements: true,
  education: true,
  certificates: true,
  codingProfiles: true,
};

export class ResumeCompositionService {
  // ─── Projects ─────────────────────────────────────────────────────────────

  async getProjects(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const [allProjects, selected] = await Promise.all([
      prisma.projectEntry.findMany({
        where: { userId },
        include: {
          bullets: { orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.resumeProject.findMany({
        where: { resumeProfileId },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    const selectedMap = new Map(selected.map((s) => [s.projectId, s]));

    return allProjects.map((project) => {
      const sel = selectedMap.get(project.id);
      const selectedBulletIds: string[] = sel
        ? (sel.selectedBulletIds as unknown as string[])
        : [];

      return {
        ...project,
        selected: !!sel,
        displayOrder: sel?.displayOrder ?? null,
        selectedBulletIds,
        bulletCount: project.bullets.length,
        selectedBulletCount: selectedBulletIds.length,
      };
    });
  }

  async updateProjects(userId: string, resumeProfileId: string, selections: ProjectSelection[]) {
    await this.ensureOwnership(userId, resumeProfileId);

    await prisma.$transaction(async (tx) => {
      await tx.resumeProject.deleteMany({ where: { resumeProfileId } });

      if (selections.length > 0) {
        await tx.resumeProject.createMany({
          data: selections.map((s, i) => ({
            resumeProfileId,
            projectId: s.projectId,
            displayOrder: s.displayOrder ?? i,
            selectedBulletIds: (s.selectedBulletIds ?? []) as any,
          })),
        });
      }
    });

    return this.getProjects(userId, resumeProfileId);
  }

  // ─── Certificates ─────────────────────────────────────────────────────────

  async getCertificates(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const [allCerts, selected] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      }),
      prisma.resumeCertificate.findMany({
        where: { resumeProfileId },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    const selectedMap = new Map(selected.map((s) => [s.certificateId, s]));

    return allCerts.map((cert) => ({
      ...cert,
      selected: selectedMap.has(cert.id),
      displayOrder: selectedMap.get(cert.id)?.displayOrder ?? null,
    }));
  }

  async updateCertificates(userId: string, resumeProfileId: string, selections: CertificateSelection[]) {
    await this.ensureOwnership(userId, resumeProfileId);

    await prisma.$transaction(async (tx) => {
      await tx.resumeCertificate.deleteMany({ where: { resumeProfileId } });

      if (selections.length > 0) {
        await tx.resumeCertificate.createMany({
          data: selections.map((s, i) => ({
            resumeProfileId,
            certificateId: s.certificateId,
            displayOrder: s.displayOrder ?? i,
          })),
        });
      }
    });

    return this.getCertificates(userId, resumeProfileId);
  }

  // ─── Achievements ─────────────────────────────────────────────────────────

  async getAchievements(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const { achievementsService } = await import('../achievements.service.js');
    const allAchievements = await achievementsService.getAll(userId);

    const selected = await prisma.resumeAchievement.findMany({
      where: { resumeProfileId },
      orderBy: { displayOrder: 'asc' },
    });

    const selectedKeys = new Set(selected.map((s) => s.achievementKey));
    const selectedOrder = new Map(selected.map((s) => [s.achievementKey, s.displayOrder]));

    const categories = ['milestone', 'streak', 'integration', 'dsa', 'project', 'readiness'] as const;

    const grouped = categories.map((cat) => ({
      category: cat,
      items: allAchievements
        .filter((a) => a.category === cat)
        .map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          category: a.category,
          unlocked: a.unlocked,
          progress: a.progress,
          selected: selectedKeys.has(a.id),
          displayOrder: selectedOrder.get(a.id) ?? null,
        })),
    }));

    return { grouped, allItems: allAchievements.map((a) => ({
      ...a,
      selected: selectedKeys.has(a.id),
      displayOrder: selectedOrder.get(a.id) ?? null,
    })) };
  }

  async updateAchievements(userId: string, resumeProfileId: string, selections: AchievementSelection[]) {
    await this.ensureOwnership(userId, resumeProfileId);

    await prisma.$transaction(async (tx) => {
      await tx.resumeAchievement.deleteMany({ where: { resumeProfileId } });

      if (selections.length > 0) {
        await tx.resumeAchievement.createMany({
          data: selections.map((s, i) => ({
            resumeProfileId,
            achievementKey: s.achievementKey,
            displayOrder: s.displayOrder ?? i,
          })),
        });
      }
    });

    return this.getAchievements(userId, resumeProfileId);
  }

  // ─── Sections ─────────────────────────────────────────────────────────────

  async getSectionSettings(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: resumeProfileId },
      select: { sectionSettings: true },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const settings = profile.sectionSettings as SectionSettings | null;

    return {
      order: settings?.order ?? DEFAULT_SECTION_ORDER,
      visibility: settings?.visibility ?? DEFAULT_SECTION_VISIBILITY,
      labels: settings?.labels ?? {},
      projects: settings?.projects ?? { maxBullets: 3 },
    };
  }

  async updateSectionSettings(userId: string, resumeProfileId: string, settings: SectionSettings) {
    await this.ensureOwnership(userId, resumeProfileId);

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: resumeProfileId },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const existing = (profile.sectionSettings as SectionSettings) ?? {};
    const merged = {
      order: settings.order ?? existing.order ?? DEFAULT_SECTION_ORDER,
      visibility: { ...DEFAULT_SECTION_VISIBILITY, ...existing.visibility, ...settings.visibility },
      labels: { ...existing.labels, ...settings.labels },
      projects: { ...existing.projects, ...settings.projects },
    };

    await prisma.resumeProfile.update({
      where: { id: resumeProfileId },
      data: { sectionSettings: merged as any },
    });

    return merged;
  }

  // ─── Context Preview v1 ───────────────────────────────────────────────────

  async buildContextV1(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: resumeProfileId },
      include: {
        photo: true,
        careerProfile: true,
      },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const [resumeProjects, resumeCerts, resumeAchievements, allBullets] = await Promise.all([
      prisma.resumeProject.findMany({
        where: { resumeProfileId },
        include: { project: { include: { bullets: { orderBy: { displayOrder: 'asc' } } } } },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.resumeCertificate.findMany({
        where: { resumeProfileId },
        include: { certificate: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.resumeAchievement.findMany({
        where: { resumeProfileId },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.projectBullet.findMany({
        where: {
          project: {
            userId,
          },
        },
      }),
    ]);

    const bulletMap = new Map(allBullets.map((b) => [b.id, b.text]));

    const sections: Record<string, unknown> = {};

    sections.projects = resumeProjects.map((rp) => {
      const selectedBulletIds = rp.selectedBulletIds as unknown as string[];
      const selectedBullets = selectedBulletIds
        .map((id) => bulletMap.get(id))
        .filter(Boolean);

      return {
        id: rp.project.id,
        title: rp.project.title,
        description: rp.project.description,
        techStack: rp.project.techStack,
        githubUrl: rp.project.githubUrl,
        liveUrl: rp.project.liveUrl,
        status: rp.project.status,
        startDate: rp.project.startDate,
        endDate: rp.project.endDate,
        bullets: selectedBullets,
        displayOrder: rp.displayOrder,
      };
    });

    const allProjectTechStacks = resumeProjects.flatMap((rp) => rp.project.techStack);
    sections.skills = [...new Set(allProjectTechStacks)].sort();

    sections.certificates = resumeCerts.map((rc) => ({
      id: rc.certificate.id,
      name: rc.certificate.name,
      issuer: rc.certificate.issuer,
      credentialUrl: rc.certificate.credentialUrl,
      displayOrder: rc.displayOrder,
    }));

    sections.achievements = resumeAchievements.map((ra) => ({
      key: ra.achievementKey,
      displayOrder: ra.displayOrder,
    }));

    const latestSnapshot = await prisma.vITSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    sections.education = latestSnapshot
      ? {
          cgpa: latestSnapshot.cgpa,
          creditsEarned: latestSnapshot.creditsEarned,
          creditsRequired: latestSnapshot.creditsRequired,
          attendance: latestSnapshot.attendance,
        }
      : null;

    const careerProfile = profile.careerProfile;

    const context = {
      profile: {
        fullName: careerProfile.fullName,
        professionalTitle: careerProfile.professionalTitle,
        email: careerProfile.email,
        phone: careerProfile.phone,
        location: careerProfile.location,
        bio: careerProfile.bio,
        linkedin: careerProfile.linkedin,
        github: careerProfile.github,
        leetcode: careerProfile.leetcode,
        codeforces: careerProfile.codeforces,
        portfolio: careerProfile.portfolio,
        website: careerProfile.website,
      },
      photo: profile.photo
        ? {
            url: profile.photo.originalUrl,
            thumbnailUrl: profile.photo.thumbnailUrl,
          }
        : null,
      resumeName: profile.name,
      targetRole: profile.targetRole,
      description: profile.description,
      sections,
      sectionOrder: ((profile.sectionSettings as SectionSettings)?.order) ?? DEFAULT_SECTION_ORDER,
      visibleSections: ((profile.sectionSettings as SectionSettings)?.visibility) ?? DEFAULT_SECTION_VISIBILITY,
      sectionLabels: ((profile.sectionSettings as SectionSettings)?.labels) ?? {},
    };

    const stats = {
      projects: resumeProjects.length,
      skills: (sections.skills as string[]).length,
      certificates: resumeCerts.length,
      achievements: resumeAchievements.length,
    };

    const warnings: string[] = [];
    if (!profile.photoId) warnings.push('No photo selected');
    if (resumeProjects.length === 0) warnings.push('No projects selected');
    if (resumeCerts.length === 0) warnings.push('No certificates selected');
    if (resumeAchievements.length === 0) warnings.push('No achievements selected');
    if (!careerProfile.bio) warnings.push('No bio / summary written');
    if ((sections.skills as string[]).length === 0) warnings.push('No skills (selected projects have no tech stack)');

    return { context, stats, warnings };
  }

  // ─── Resume Context Builder ─────────────────────────────────────────────

  async buildResumeContext(userId: string, resumeProfileId: string) {
    await this.ensureOwnership(userId, resumeProfileId);

    const profile = await prisma.resumeProfile.findUnique({
      where: { id: resumeProfileId },
      include: {
        photo: true,
        careerProfile: true,
      },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');

    const careerProfile = profile.careerProfile;

    const [resumeProjects, resumeCerts, resumeAchievements, user] = await Promise.all([
      prisma.resumeProject.findMany({
        where: { resumeProfileId },
        include: { project: { include: { bullets: { orderBy: { displayOrder: 'asc' } } } } },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.resumeCertificate.findMany({
        where: { resumeProfileId },
        include: { certificate: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.resumeAchievement.findMany({
        where: { resumeProfileId },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          githubUsername: true,
          leetcodeUsername: true,
          codeforcesHandle: true,
        },
      }),
    ]);

    const { achievementsService } = await import('../achievements.service.js');
    const allAchievements = await achievementsService.getAll(userId);
    const selectedAchievementKeys = new Set(resumeAchievements.map((ra) => ra.achievementKey));
    const achievementDefMap = new Map(allAchievements.map((a) => [a.id, a]));

    // ─── Build section data ──────────────────────────────────────────────

    const bulletMap = new Map<string, string>();
    for (const rp of resumeProjects) {
      for (const b of rp.project.bullets) {
        bulletMap.set(b.id, b.text);
      }
    }

    const projects: ResumeContextProject[] = resumeProjects.map((rp) => {
      const selectedBulletIds = rp.selectedBulletIds as unknown as string[];
      const selectedBullets = selectedBulletIds
        .map((id) => bulletMap.get(id))
        .filter((b): b is string => !!b);

      return {
        id: rp.project.id,
        title: rp.project.title,
        description: rp.project.description,
        techStack: [...rp.project.techStack],
        githubUrl: rp.project.githubUrl,
        liveUrl: rp.project.liveUrl,
        bullets: selectedBullets,
      };
    });

    const allTechStacks = resumeProjects.flatMap((rp) => rp.project.techStack);
    const skills = [...new Set(allTechStacks)].sort();

    const certificates: ResumeContextCertificate[] = resumeCerts.map((rc) => ({
      id: rc.certificate.id,
      name: rc.certificate.name,
      issuer: rc.certificate.issuer,
      credentialUrl: rc.certificate.credentialUrl,
    }));

    const achievements: ResumeContextAchievement[] = resumeAchievements.map((ra) => {
      const def = achievementDefMap.get(ra.achievementKey);
      const source = this.deriveAchievementSource(ra.achievementKey);
      return {
        key: ra.achievementKey,
        title: def?.title ?? ra.achievementKey,
        description: def?.description ?? '',
        icon: def?.icon ?? 'emoji_events',
        source,
      };
    });

    const latestSnapshot = await prisma.vITSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const education: ResumeContextEducation | null = latestSnapshot
      ? {
          institution: 'Vellore Institute of Technology',
          cgpa: latestSnapshot.cgpa,
          creditsEarned: latestSnapshot.creditsEarned,
          creditsRequired: latestSnapshot.creditsRequired,
          attendance: latestSnapshot.attendance,
        }
      : null;

    // ─── Coding profiles ─────────────────────────────────────────────────

    const [latestLeetCode, latestCodeforces, latestGitHub] = await Promise.all([
      prisma.leetCodeSnapshot.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { totalSolved: true, contestRating: true },
      }),
      prisma.codeforcesEntry.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
        select: { rating: true },
      }),
      prisma.gitHubSnapshot.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { repoCount: true, stars: true, commits: true },
      }),
    ]);

    const codingProfiles: ResumeContextCodingProfile[] = [
      {
        platform: 'github',
        label: 'GitHub',
        url: careerProfile.github ?? null,
        username: user?.githubUsername ?? null,
        enabled: !!careerProfile.github,
        stats: latestGitHub
          ? { repoCount: latestGitHub.repoCount, stars: latestGitHub.stars, commits: latestGitHub.commits }
          : undefined,
      },
      {
        platform: 'leetcode',
        label: 'LeetCode',
        url: careerProfile.leetcode ?? null,
        username: user?.leetcodeUsername ?? null,
        enabled: !!careerProfile.leetcode,
        stats: latestLeetCode
          ? { totalSolved: latestLeetCode.totalSolved, contestRating: latestLeetCode.contestRating ?? undefined }
          : undefined,
      },
      {
        platform: 'codeforces',
        label: 'Codeforces',
        url: careerProfile.codeforces ?? null,
        username: user?.codeforcesHandle ?? null,
        enabled: !!careerProfile.codeforces,
        stats: latestCodeforces
          ? { rating: latestCodeforces.rating }
          : undefined,
      },
    ];

    // ─── Profile section ─────────────────────────────────────────────────

    const profileSection: ResumeContextProfile = {
      fullName: careerProfile.fullName,
      professionalTitle: careerProfile.professionalTitle,
      email: careerProfile.email,
      phone: careerProfile.phone,
      location: careerProfile.location,
      bio: careerProfile.bio,
      website: careerProfile.website,
      linkedin: careerProfile.linkedin,
      portfolio: careerProfile.portfolio,
    };

    const photo = profile.photo
      ? { url: profile.photo.originalUrl, thumbnailUrl: profile.photo.thumbnailUrl }
      : null;

    const sectionSettings = profile.sectionSettings as SectionSettings | null;
    const sectionOrder = sectionSettings?.order ?? DEFAULT_SECTION_ORDER;
    const visibility = sectionSettings?.visibility ?? DEFAULT_SECTION_VISIBILITY;
    const sectionLabels = sectionSettings?.labels ?? {};

    // ─── Completion ──────────────────────────────────────────────────────

    const completion = this.computeCompletion(profile, resumeProjects.length, certificates.length, achievements.length, skills.length);

    // ─── Warnings ────────────────────────────────────────────────────────

    const warnings: ResumeContextWarnings = { critical: [], suggestions: [] };
    if (!careerProfile.fullName) warnings.critical.push('No name set');
    if (!careerProfile.professionalTitle) warnings.critical.push('No professional title');
    if (resumeProjects.length === 0) warnings.critical.push('No projects selected');
    if (skills.length === 0 && resumeProjects.length > 0) warnings.suggestions.push('Selected projects have no tech stack — skills will be empty');
    if (!careerProfile.bio) warnings.suggestions.push('Add a professional summary (bio)');
    if (!profile.photoId) warnings.suggestions.push('Add a profile photo');
    if (resumeCerts.length === 0) warnings.suggestions.push('No certificates selected');
    if (resumeAchievements.length === 0) warnings.suggestions.push('No achievements selected');

    // ─── Missing fields ──────────────────────────────────────────────────

    const missing: string[] = [];
    if (!profile.photoId) missing.push('Photo');
    if (resumeProjects.length === 0) missing.push('Projects');
    if (resumeCerts.length === 0) missing.push('Certificates');
    if (resumeAchievements.length === 0) missing.push('Achievements');
    if (!careerProfile.bio) missing.push('Professional Summary');
    if (skills.length === 0) missing.push('Skills');

    // ─── Assemble ────────────────────────────────────────────────────────

    const sections: ResumeContextSections = {
      profile: profileSection,
      photo,
      projects,
      skills,
      certificates,
      achievements,
      education,
      codingProfiles,
    };

    const context: ResumeContext = {
      metadata: {
        version: 1,
        generatedAt: new Date().toISOString(),
        profileName: profile.name,
        targetRole: profile.targetRole,
        completion,
        includedProjectIds: resumeProjects.map((rp) => rp.project.id),
        includedCertificateIds: resumeCerts.map((rc) => rc.certificate.id),
        includedAchievementKeys: resumeAchievements.map((ra) => ra.achievementKey),
      },
      sections,
      sectionOrder,
      visibility,
      sectionLabels,
      computed: {
        skills,
        projectCount: projects.length,
        skillCount: skills.length,
      },
      warnings,
      missing: { fields: missing },
      stats: {
        projects: projects.length,
        skills: skills.length,
        certificates: certificates.length,
        achievements: achievements.length,
      },
    };

    return context;
  }

  private deriveAchievementSource(key: string): string | null {
    if (key.startsWith('leetcode_')) return 'leetcode';
    if (key.startsWith('codeforces_')) return 'codeforces';
    if (key.startsWith('github_')) return 'github';
    if (key.startsWith('streak_')) return 'streak';
    if (key.startsWith('xp_')) return 'xp';
    if (key.startsWith('level_')) return 'level';
    if (key.startsWith('readiness_')) return 'readiness';
    if (key.startsWith('first_')) return 'milestone';
    if (key.startsWith('opensource_')) return 'open-source';
    if (key.startsWith('all_')) return 'integration';
    return null;
  }

  private computeCompletion(
    profile: { name: string; targetRole: string; photoId: string | null; description: string | null },
    projectCount: number,
    certCount: number,
    achievementCount: number,
    skillCount: number,
  ): number {
    const values: Record<string, unknown> = {
      name: profile.name,
      targetRole: profile.targetRole,
      photoId: profile.photoId,
      description: profile.description,
    };

    const computedValues: Record<string, boolean> = {
      hasProjects: projectCount > 0,
      hasCertificates: certCount > 0,
      hasAchievements: achievementCount > 0,
      hasSkills: skillCount > 0,
    };

    const filled = COMPLETION_CHECKS.reduce((sum, c) => {
      let done: boolean;
      if (c.computed) {
        done = computedValues[c.key] ?? false;
      } else {
        const v = values[c.key];
        done = v !== null && v !== undefined && v !== '';
      }
      return sum + (done ? c.weight : 0);
    }, 0);

    return Math.round(filled * 100);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async ensureOwnership(userId: string, resumeProfileId: string) {
    const profile = await prisma.resumeProfile.findFirst({
      where: {
        id: resumeProfileId,
        careerProfile: { userId },
      },
    });

    if (!profile) throw AppError.notFound('Resume profile not found');
  }
}

export const resumeCompositionService = new ResumeCompositionService();
