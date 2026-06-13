import { z } from 'zod';

/**
 * Zod schema for updating user profile.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.name || data.email, {
  message: 'At least one field (name or email) must be provided',
});
