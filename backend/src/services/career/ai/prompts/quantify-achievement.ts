import { z } from 'zod';
import type { PromptModule } from '../../../../types/ai.types.js';

export const QuantifyAchievementSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  reasoning: z.array(z.string()).min(1),
});

export const QuantifyAchievementPrompt: PromptModule<z.infer<typeof QuantifyAchievementSchema>> = {
  id: 'quantify-achievement',
  version: 1,
  temperature: 0.5,

  system(ctx) {
    const styleGuide: Record<string, string> = {
      'quantify': 'Add numbers, percentages, and measurable impact.',
      'recruiter-friendly': 'Make achievements compelling to recruiters. Emphasize relevance and scale.',
    };
    return `You are a resume achievement optimizer. Improve this achievement for a ${ctx.targetRole} role.
${styleGuide[ctx.style || ''] || 'Rewrite to be more impactful.'}
Respond with JSON: { "title": string, "description": string, "reasoning": string[] }`;
  },

  user(ctx) {
    const a = ctx.sections.achievement;
    if (!a) return 'No achievement data provided.';
    return [
      `Target Role: ${ctx.targetRole}`,
      `Action: ${ctx.action}`,
      ctx.style ? `Style: ${ctx.style}` : '',
      ``,
      `Achievement: ${a.title}`,
      `Description: ${a.description}`,
    ].filter(Boolean).join('\n');
  },

  schema: QuantifyAchievementSchema,
};
