import { el } from '../renderer.js';

export function renderProjects(projects) {
  if (!projects || projects.length === 0) return null;

  return el('div', { className: 'resume-projects' },
    ...projects.map(p => {
      const tags = p.techStack?.length
        ? el('div', { className: 'resume-project-tags' },
            ...p.techStack.map(t => el('span', { className: 'resume-tag' }, t))
          )
        : null;

      const bullets = p.bullets?.length
        ? el('ul', { className: 'resume-project-bullets' },
            ...p.bullets.map(b => el('li', null, b))
          )
        : null;

      const projectLinks = [];
      if (p.githubUrl) projectLinks.push(el('a', { className: 'resume-project-link', href: p.githubUrl, target: '_blank' }, 'GitHub'));
      if (p.liveUrl) projectLinks.push(el('a', { className: 'resume-project-link', href: p.liveUrl, target: '_blank' }, 'Live Demo'));

      return el('div', { className: 'resume-project' },
        el('div', { className: 'resume-project-header' },
          el('h3', { className: 'resume-project-title' }, p.title),
          tags
        ),
        p.description ? el('p', { className: 'resume-project-description' }, p.description) : null,
        bullets,
        projectLinks.length > 0 ? el('div', { className: 'resume-project-links' }, ...projectLinks) : null
      );
    })
  );
}
