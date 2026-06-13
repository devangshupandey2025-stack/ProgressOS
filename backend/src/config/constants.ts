import { Category } from '@prisma/client';

/**
 * XP rates per hour for each activity category.
 * XP is always calculated server-side — never trust frontend values.
 */
export const XP_RATES: Record<Category, number> = {
  DSA: 10,
  PROJECT: 20,
  ML: 15,
  CYBER: 15,
  ACADEMICS: 10,
  OPEN_SOURCE: 25,
};

/**
 * XP required per level.
 * Level = floor(totalXP / XP_PER_LEVEL) + 1
 */
export const XP_PER_LEVEL = 100;

/**
 * Calculate XP from hours and category.
 */
export function calculateXP(category: Category, hours: number): number {
  return Math.round(XP_RATES[category] * hours);
}

/**
 * Calculate level from total XP.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}
