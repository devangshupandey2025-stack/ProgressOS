import { z } from 'zod';

export const createActivitySchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['DSA', 'PROJECT', 'ML', 'CYBER', 'ACADEMICS', 'OPEN_SOURCE']),
  hours: z.number().min(0.25).max(24),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['DSA', 'PROJECT', 'ML', 'CYBER', 'ACADEMICS', 'OPEN_SOURCE']).optional(),
  hours: z.number().min(0.25).max(24).optional(),
});
