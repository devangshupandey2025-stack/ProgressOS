import { z } from 'zod';

export const connectVitSchema = z.object({
  username: z.string().min(1, 'VIT username is required'),
  password: z.string().min(1, 'VIT password is required'),
});
