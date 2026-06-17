import { z } from 'zod';
import { TrackerSource } from '@prisma/client';

/**
 * Zod schema for creating a new goal.
 */
export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  target: z.number().positive('Target must be greater than zero'),
  current: z.number().nonnegative('Current progress cannot be negative').optional().default(0),
  unit: z.string().max(20, 'Unit name is too long').optional().default('%'),
  trackerSource: z.nativeEnum(TrackerSource).optional().default(TrackerSource.MANUAL),
});
