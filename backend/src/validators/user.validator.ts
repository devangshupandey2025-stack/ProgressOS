import { z } from 'zod';

/**
 * Zod schema for updating user profile.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).nullable().optional(),
  codeforcesHandle: z.string().trim().min(1).max(50).nullable().optional(),
  leetcodeUsername: z.string().trim().min(1).max(50).nullable().optional(),
  githubUsername: z.string().trim().min(1).max(50).nullable().optional(),
}).refine((data) => data.name || data.email || data.hasOwnProperty('username') || data.hasOwnProperty('codeforcesHandle') || data.hasOwnProperty('leetcodeUsername') || data.hasOwnProperty('githubUsername'), {
  message: 'At least one field must be provided',
});
