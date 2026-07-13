import type { ResumeContext } from '../../../../types/resume-context.js';
import type { ResumeChangeData } from '../../../../types/ai.types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class ResumeOverrides {
  apply(context: ResumeContext, changes: ResumeChangeData[]): ResumeContext {
    if (!changes.length) return context;

    const result = deepClone(context);

    for (const change of changes) {
      switch (change.section) {
        case 'summary': {
          if (typeof change.payload.summary === 'string') {
            result.sections.profile.bio = change.payload.summary;
          }
          break;
        }

        case 'projects': {
          const project = result.sections.projects.find(p => p.id === change.sectionItemId);
          if (!project) break;
          if (typeof change.payload.title === 'string') project.title = change.payload.title;
          if (typeof change.payload.description === 'string') project.description = change.payload.description;
          if (Array.isArray(change.payload.bullets)) project.bullets = change.payload.bullets as string[];
          break;
        }

        case 'achievements': {
          const achievement = result.sections.achievements.find(a => a.key === change.sectionItemId);
          if (!achievement) break;
          if (typeof change.payload.title === 'string') achievement.title = change.payload.title;
          if (typeof change.payload.description === 'string') achievement.description = change.payload.description;
          break;
        }
      }
    }

    return result;
  }
}

export const resumeOverrides = new ResumeOverrides();
