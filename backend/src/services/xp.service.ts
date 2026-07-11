import { prisma } from '../config/database.js';
import { eventBus, Events } from '../core/eventBus.js';

class XPService {
  async award(
    userId: string,
    amount: number,
    source: string,
    sourceId?: string,
    description?: string,
    category?: string,
  ) {
    const tx = await prisma.xPTransaction.create({
      data: {
        amount,
        source,
        sourceId: sourceId || null,
        description: description || null,
        category: category || null,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalXP: { increment: amount } },
    });

    await eventBus.emit(Events.XP_AWARDED, { userId, transaction: tx });
    return tx;
  }

  async getTodayXP(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await prisma.xPTransaction.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getXPByPeriod(userId: string, start: Date, end: Date): Promise<number> {
    const result = await prisma.xPTransaction.aggregate({
      where: { userId, createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getXPByCategory(userId: string, start: Date, end: Date): Promise<Record<string, number>> {
    const txs = await prisma.xPTransaction.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
    });

    const byCategory: Record<string, number> = {};
    txs.forEach(tx => {
      const cat = tx.category || 'UNCATEGORIZED';
      byCategory[cat] = (byCategory[cat] || 0) + tx.amount;
    });
    return byCategory;
  }

  async getRecentTransactions(userId: string, limit = 20) {
    return prisma.xPTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const xpService = new XPService();
