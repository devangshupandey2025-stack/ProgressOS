import { z } from 'zod';

export const updateCareerProfileSchema = z.object({
  fullName: z.string().min(1).max(200).nullable().optional(),
  professionalTitle: z.string().max(200).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().max(20).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal('')),
  linkedin: z.string().url().nullable().optional().or(z.literal('')),
  github: z.string().url().nullable().optional().or(z.literal('')),
  leetcode: z.string().url().nullable().optional().or(z.literal('')),
  codeforces: z.string().url().nullable().optional().or(z.literal('')),
  portfolio: z.string().url().nullable().optional().or(z.literal('')),
  bio: z.string().max(2000).nullable().optional(),
  preferences: z.record(z.string(), z.unknown()).nullable().optional(),
});
