import { z } from 'zod';

const TEMPLATES = ['modern', 'minimal', 'classic'] as const;
const PAGE_SIZES = ['a4', 'letter'] as const;
const SUMMARY_STRATEGIES = ['manual', 'ai', 'career-report'] as const;

export const createResumeProfileSchema = z.object({
  name: z.string().min(1).max(200),
  targetRole: z.string().min(1).max(200),
  template: z.enum(TEMPLATES).optional(),
  pageSize: z.enum(PAGE_SIZES).optional(),
  summaryStrategy: z.enum(SUMMARY_STRATEGIES).optional(),
  photoId: z.string().uuid().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export const updateResumeProfileSchema = createResumeProfileSchema.partial();
