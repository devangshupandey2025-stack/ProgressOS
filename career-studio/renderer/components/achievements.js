import { el } from '../renderer.js';

export function renderAchievements(achievements) {
  if (!achievements || achievements.length === 0) return null;

  return el('div', { className: 'resume-achievements' },
    ...achievements.map(a => {
      const iconMap = { emoji_events: '\uD83C\uDFC6', star: '\u2B50', trending_up: '\uD83D\uDCC8', code: '\uD83D\uDCBB', whatshot: '\uD83D\uDD25', military_tech: '\uD83C\uDF96\uFE0F' };
      const iconChar = iconMap[a.icon] || '\u2022';
      return el('div', { className: 'resume-achievement' },
        el('span', { className: 'resume-ach-icon' }, iconChar),
        el('div', { className: 'resume-ach-body' },
          el('span', { className: 'resume-ach-title' }, a.title),
          a.description ? el('p', { className: 'resume-ach-desc' }, a.description) : null
        ),
        a.source ? el('span', { className: 'resume-ach-source' }, a.source) : null
      );
    })
  );
}
