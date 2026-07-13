import { z } from 'zod';
import type { PromptModule } from '../../../../types/ai.types.js';

export const RewriteProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).min(1),
  reasoning: z.array(z.string()).min(1),
});

export const RewriteProjectPrompt: PromptModule<z.infer<typeof RewriteProjectSchema>> = {
  id: 'rewrite-project',
  version: 1,
  temperature: 0.4,

  system(ctx) {
    const styleGuide: Record<string, string> = {
      'quantify': 'Add measurable outcomes. Use numbers, percentages, and scale where possible.',
      'action-verbs': 'Start every bullet with a strong action verb. Use: Designed, Built, Optimized, Led, etc.',
      'star-format': 'Use Situation-Task-Action-Result format for each bullet.',
      'ats': 'Include relevant keywords from the target role. Optimize for ATS parsing.',
    };
    return `You are a technical resume writer. Improve the project description for a ${ctx.targetRole} role.
${styleGuide[ctx.style || ''] || 'Improve clarity, impact, and professionalism of the bullet points.'}
Respond with JSON: { "title"?: string, "description"?: string, "bullets": string[], "reasoning": string[] }`;
  },

  user(ctx) {
    const p = ctx.sections.project;
    if (!p) return 'No project data provided.';
    return [
      `Target Role: ${ctx.targetRole}`,
      `Action: ${ctx.action}`,
      ctx.style ? `Style: ${ctx.style}` : '',
      ``,
      `Project: ${p.title}`,
      p.description ? `Description: ${p.description}` : '',
      p.techStack.length ? `Tech Stack: ${p.techStack.join(', ')}` : '',
      `Current Bullets:`,
      ...p.bullets.map((b, i) => `  ${i + 1}. ${b}`),
    ].filter(Boolean).join('\n');
  },

  schema: RewriteProjectSchema,
};
