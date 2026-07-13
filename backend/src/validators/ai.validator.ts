import { z } from 'zod';

export const improveRequestSchema = z.object({
  resumeProfileId: z.string().min(1),
  section: z.enum(['summary', 'project', 'achievement']),
  sectionItemId: z.string().optional(),
  action: z.enum([
    'rewrite', 'improve', 'ats-optimize', 'shorten', 'expand',
    'technical', 'beginner-friendly', 'quantify', 'action-verbs',
    'star-format', 'recruiter-friendly',
  ]),
  style: z.string().optional(),
});

export const reviewActionSchema = z.object({
  reviewId: z.string().min(1),
  edited: z.record(z.string(), z.unknown()).optional(),
});

export const restoreSchema = z.object({
  profileId: z.string().min(1),
  revisionId: z.string().min(1),
});

export const getVersionSchema = z.object({
  versionId: z.string().min(1),
});
