import { prisma } from '../config/database.js';
import { calculateXP } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';
import { Category } from '@prisma/client';

export class ActivityService {
  async create(userId: string, data: { title: string; category: Category; hours: number }) {
    const xp = calculateXP(data.category, data.hours);

    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        category: data.category,
        hours: data.hours,
        xp,
        userId,
      },
    });

    // Update user totalXP and streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true, currentStreak: true, longestStreak: true },
    });

    let newStreak = 1;
    if (user?.lastActiveAt) {
      const lastDate = new Date(user.lastActiveAt);
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      if (lastDay.getTime() === today.getTime()) {
        newStreak = user.currentStreak;
      } else if (lastDay.getTime() === yesterday.getTime()) {
        newStreak = user.currentStreak + 1;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: { increment: xp },
        lastActiveAt: now,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user?.longestStreak || 0),
      },
    });

    return activity;
  }

  async findAll(userId: string, limit = 50, offset = 0) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findById(userId: string, id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, userId },
    });
    if (!activity) throw AppError.notFound('Activity not found');
    return activity;
  }

  async update(userId: string, id: string, data: Partial<{ title: string; category: Category; hours: number }>) {
    const existing = await this.findById(userId, id);
    let xpDiff = 0;

    if (data.category || data.hours) {
      const newCategory = data.category || existing.category;
      const newHours = data.hours || existing.hours;
      const newXP = calculateXP(newCategory, newHours);
      xpDiff = newXP - existing.xp;
      (data as any).xp = newXP;
    }

    const activity = await prisma.activity.update({
      where: { id },
      data,
    });

    if (xpDiff !== 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalXP: { increment: xpDiff } },
      });
    }

    return activity;
  }

  async delete(userId: string, id: string) {
    const activity = await this.findById(userId, id);

    await prisma.activity.delete({ where: { id } });

    await prisma.user.update({
      where: { id: userId },
      data: { totalXP: { decrement: activity.xp } },
    });

    return activity;
  }
}

export const activityService = new ActivityService();
