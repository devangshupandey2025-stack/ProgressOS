import { el } from '../renderer.js';

export function renderSkills(skills) {
  if (!skills || skills.length === 0) return null;

  return el('div', { className: 'resume-skills' },
    ...skills.map(s => el('span', { className: 'resume-skill' }, s))
  );
}
