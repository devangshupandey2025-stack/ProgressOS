import { prisma } from '../../../../config/database.js';
import { AppError } from '../../../../utils/AppError.js';
import { PromptRegistry } from '../prompts/registry.js';
import { ProviderRegistry } from '../adapter/registry.js';
import { resumeOverrides } from './overrides.js';
import type {
  ImproveRequest,
  PromptContext,
  AIReviewData,
  ResumeRevisionData,
} from '../../../../types/ai.types.js';
import type { ResumeContext } from '../../../../types/resume-context.js';
import { resumeCompositionService } from '../../resume-composition.service.js';

export class CareerIntelligenceEngine {
  async improve(userId: string, req: ImproveRequest): Promise<{ review: AIReviewData; suggestions: string[] }> {
    const context = await resumeCompositionService.buildResumeContext(userId, req.resumeProfileId);

    const prompt = PromptRegistry.get(req.section, req.action);
    if (!prompt) throw AppError.badRequest(`No prompt for ${req.section}:${req.action}`);

    const promptCtx = this.buildPromptContext(req, context);
    const provider = ProviderRegistry.getDefault();

    const response = await provider.generate(prompt, promptCtx);
    const data = response.data as any;

    const payload = {
      summary: data.summary,
      title: data.title,
      description: data.description,
      bullets: data.bullets,
    };

    const before = this.extractBefore(req, context);

    const review = await prisma.aIReview.create({
      data: {
        resumeProfileId: req.resumeProfileId,
        section: req.section,
        sectionItemId: req.sectionItemId || null,
        action: req.action,
        before: before as any,
        after: payload as any,
        reasoning: data.reasoning || [],
        confidence: null,
        latencyMs: response.latencyMs,
        tokens: response.tokens || null,
        status: 'pending',
        promptId: `${prompt.id}-v${prompt.version}`,
      },
    });

    return {
      review: this.mapReview(review),
      suggestions: data.reasoning || [],
    };
  }

  private buildPromptContext(req: ImproveRequest, context: ResumeContext): PromptContext {
    const base: PromptContext = {
      targetRole: context.metadata.targetRole,
      profileName: context.metadata.profileName,
      action: req.action,
      style: req.style,
      sections: {},
    };

    if (req.section === 'summary') {
      base.sections.summary = { bio: context.sections.profile.bio };
    }

    if (req.section === 'project' && req.sectionItemId) {
      const project = context.sections.projects.find(p => p.id === req.sectionItemId);
      if (project) {
        base.sections.project = {
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          bullets: project.bullets,
        };
      }
    }

    if (req.section === 'achievement' && req.sectionItemId) {
      const achievement = context.sections.achievements.find(a => a.key === req.sectionItemId);
      if (achievement) {
        base.sections.achievement = {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        };
      }
    }

    return base;
  }

  private extractBefore(req: ImproveRequest, context: ResumeContext): unknown {
    if (req.section === 'summary') {
      return { summary: context.sections.profile.bio };
    }
    if (req.section === 'project' && req.sectionItemId) {
      const p = context.sections.projects.find(x => x.id === req.sectionItemId);
      return p ? { title: p.title, description: p.description, bullets: p.bullets } : {};
    }
    if (req.section === 'achievement' && req.sectionItemId) {
      const a = context.sections.achievements.find(x => x.key === req.sectionItemId);
      return a ? { title: a.title, description: a.description } : {};
    }
    return {};
  }

  private mapReview(r: any): AIReviewData {
    return {
      id: r.id,
      resumeProfileId: r.resumeProfileId,
      section: r.section,
      sectionItemId: r.sectionItemId,
      action: r.action,
      before: r.before,
      after: r.after,
      reasoning: r.reasoning,
      confidence: r.confidence,
      status: r.status,
      createdAt: r.createdAt?.toISOString?.() || r.createdAt,
    };
  }
}

export const careerIntelligenceEngine = new CareerIntelligenceEngine();
