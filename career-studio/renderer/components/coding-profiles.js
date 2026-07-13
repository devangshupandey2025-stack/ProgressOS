import { el } from '../renderer.js';

function formatStats(p) {
  if (!p.stats) return null;
  const parts = [];
  switch (p.platform) {
    case 'github':
      if (p.stats.repoCount != null) parts.push(`${p.stats.repoCount} repos`);
      if (p.stats.stars != null) parts.push(`${p.stats.stars} stars`);
      if (p.stats.commits != null) parts.push(`${p.stats.commits} commits`);
      break;
    case 'leetcode':
      if (p.stats.totalSolved != null) parts.push(`${p.stats.totalSolved} solved`);
      if (p.stats.contestRating != null) parts.push(`${p.stats.contestRating} rating`);
      break;
    case 'codeforces':
      if (p.stats.rating != null) parts.push(`${p.stats.rating} rating`);
      break;
  }
  return parts.length ? parts.join(' · ') : null;
}

export function renderCodingProfiles(profiles) {
  if (!profiles || profiles.length === 0) return null;
  const enabled = profiles.filter(p => p.enabled);
  if (enabled.length === 0) return null;

  const platformColors = {
    github: '#24292e',
    leetcode: '#ffa116',
    codeforces: '#1f8acb'
  };

  return el('div', { className: 'resume-coding-profiles' },
    ...enabled.map(p => {
      const statsStr = formatStats(p);
      return el('div', { className: 'resume-coding-item' },
        el('a', {
          className: 'resume-coding-link',
          href: p.url || '#',
          target: '_blank',
          style: { color: platformColors[p.platform] || '#64748b' }
        }, p.label + (p.username ? `: ${p.username}` : '')),
        statsStr ? el('span', { className: 'resume-coding-stats' }, statsStr) : null
      );
    })
  );
}
