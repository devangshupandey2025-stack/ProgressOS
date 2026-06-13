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

    // Update user totalXP
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: { increment: xp },
        lastActiveAt: new Date(),
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
