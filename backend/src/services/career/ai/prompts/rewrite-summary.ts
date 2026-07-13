import { z } from 'zod';
import type { PromptModule } from '../../../../types/ai.types.js';

export const RewriteSummarySchema = z.object({
  summary: z.string().min(10),
  reasoning: z.array(z.string()).min(1),
});

export const RewriteSummaryPrompt: PromptModule<z.infer<typeof RewriteSummarySchema>> = {
  id: 'rewrite-summary',
  version: 1,
  temperature: 0.6,

  system(ctx) {
    const styleGuide: Record<string, string> = {
      'ats-optimize': 'Optimize for ATS parsing — use standard section headers, include keywords naturally, avoid tables/columns.',
      'shorten': 'Shorten to 2-3 concise sentences. Remove fluff.',
      'expand': 'Expand into a detailed 4-5 sentence professional narrative.',
      'technical': 'Emphasize technical skills, tools, and engineering impact.',
      'beginner-friendly': 'Make accessible for early-career roles. Focus on potential and fundamentals.',
    };
    return `You are a senior resume writer. Improve the professional summary for a ${ctx.targetRole} role.
${styleGuide[ctx.style || ''] || 'Improve clarity, impact, and professionalism.'}
Respond with JSON: { "summary": string, "reasoning": string[] }`;
  },

  user(ctx) {
    return [
      `Target Role: ${ctx.targetRole}`,
      `Current Summary: ${ctx.sections.summary?.bio || '(none provided)'}`,
      `Action: ${ctx.action}`,
      ctx.style ? `Style: ${ctx.style}` : '',
    ].filter(Boolean).join('\n');
  },

  schema: RewriteSummarySchema,
};
