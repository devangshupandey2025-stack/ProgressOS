import { prisma } from '../config/database.js';
import { calculateLevel } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';

/**
 * User Service
 *
 * Handles all user-related business logic and database operations.
 */
export class UserService {
  /**
   * Get user profile by internal database ID.
   * Includes computed level from totalXP.
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      ...user,
      level: calculateLevel(user.totalXP),
    };
  }

  /**
   * Get user profile by Clerk ID.
   */
  async getUserByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      ...user,
      level: calculateLevel(user.totalXP),
    };
  }

  /**
   * Update user profile fields (name, email, codeforcesHandle).
   */
  async updateUser(
    userId: string,
    data: { name?: string; email?: string; codeforcesHandle?: string | null; codeforcesLastSync?: Date | null; leetcodeUsername?: string | null; leetcodeLastSync?: Date | null; githubUsername?: string | null; githubLastSync?: Date | null }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      ...user,
      level: calculateLevel(user.totalXP),
    };
  }

  /**
   * Sync user data from Clerk (called on login).
   * Updates name and email if they changed on the Clerk side.
   */
  async syncUser(
    clerkId: string,
    data: { email: string; name: string | null }
  ) {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: data.email,
        name: data.name,
      },
      create: {
        clerkId,
        email: data.email,
        name: data.name,
      },
    });

    return {
      ...user,
      level: calculateLevel(user.totalXP),
    };
  }
}

export const userService = new UserService();
