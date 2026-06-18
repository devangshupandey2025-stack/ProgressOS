import { prisma } from '../config/database.js';
import { gitHubService } from '../integrations/github/github.service.js';
import { AppError } from '../utils/AppError.js';

interface TimelineEntry {
  date: string;
  type: 'activity' | 'github' | 'leetcode' | 'codeforces';
  icon: string;
  title: string;
  subtitle: string;
  xp?: number;
  category?: string;
  color: string;
}

export interface TimelineResponse {
  entries: TimelineEntry[];
  grouped: Record<string, TimelineEntry[]>;
}

export class TimelineService {
  async generate(userId: string, days: number = 30): Promise<TimelineResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true, leetcodeUsername: true, codeforcesHandle: true },
    });
    if (!user) throw AppError.notFound('User not found');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries: TimelineEntry[] = [];

    // ── Activities ──────────────────────────────────────────
    const activities = await prisma.activity.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const iconMap: Record<string, string> = {
      DSA: 'code', PROJECT: 'terminal', ML: 'psychology',
      CYBER: 'security', ACADEMICS: 'menu_book', OPEN_SOURCE: 'diversity_3',
    };
    const colorMap: Record<string, string> = {
      DSA: 'text-primary', PROJECT: 'text-secondary', ML: 'text-purple-600',
      CYBER: 'text-tertiary', ACADEMICS: 'text-blue-800', OPEN_SOURCE: 'text-tertiary',
    };

    activities.forEach(a => {
      entries.push({
        date: a.createdAt.toISOString(),
        type: 'activity',
        icon: iconMap[a.category] || 'task',
        title: a.title,
        subtitle: `${a.category} · ${a.hours}h`,
        xp: a.xp,
        category: a.category,
        color: colorMap[a.category] || 'text-on-surface-variant',
      });
    });

    // ── GitHub events ───────────────────────────────────────
    if (user.githubUsername) {
      try {
        const repos = await gitHubService.getRepositories(userId, user.githubUsername);
        repos.filter(r => r.isActive).slice(0, 5).forEach(r => {
          entries.push({
            date: r.lastPushed,
            type: 'github',
            icon: 'push_pin',
            title: `Pushed to ${r.name}`,
            subtitle: `${r.language || 'N/A'} · ${r.stars}⭐`,
            color: 'text-gray-700',
          });
        });
      } catch {}
    }

    // ── LeetCode ────────────────────────────────────────────
    if (user.leetcodeUsername) {
      try {
        const { leetCodeService } = await import('../integrations/leetcode/leetcode.service.js');
        const profile = await leetCodeService.getProfile(userId, user.leetcodeUsername);
        if (profile.totalSolved > 0) {
          entries.push({
            date: new Date().toISOString(),
            type: 'leetcode',
            icon: 'psychology',
            title: `${profile.totalSolved} problems solved total`,
            subtitle: `${profile.easy}E · ${profile.medium}M · ${profile.hard}H`,
            color: 'text-amber-600',
          });
        }
      } catch {}
    }

    // ── Codeforces ──────────────────────────────────────────
    if (user.codeforcesHandle) {
      try {
        const { codeforcesService } = await import('../integrations/codeforces/codeforces.service.js');
        const profile = await codeforcesService.getProfile(userId, user.codeforcesHandle);
        if (profile.rating > 0) {
          entries.push({
            date: new Date().toISOString(),
            type: 'codeforces',
            icon: 'military_tech',
            title: `CF Rating: ${profile.rating} (${profile.rank})`,
            subtitle: `Max: ${profile.maxRating}`,
            color: 'text-sky-600',
          });
        }
      } catch {}
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const grouped: Record<string, TimelineEntry[]> = {};
    entries.forEach(e => {
      const day = new Date(e.date).toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(e);
    });

    return { entries, grouped };
  }
}

export const timelineService = new TimelineService();
