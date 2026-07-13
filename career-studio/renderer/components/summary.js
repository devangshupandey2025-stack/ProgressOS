import { el } from '../renderer.js';

export function renderSummary(bio) {
  if (bio && bio.trim()) {
    return el('div', { className: 'resume-summary-content' },
      el('p', { className: 'resume-summary-text' }, bio),
      el('span', { className: 'resume-ai-badge' }, 'AI Rewrite — Coming Soon')
    );
  }

  return el('div', { className: 'resume-summary-content' },
    el('p', { className: 'resume-summary-text resume-summary-empty' }, 'Using Professional Bio'),
    el('span', { className: 'resume-ai-badge' }, 'AI Rewrite — Coming Soon')
  );
}
