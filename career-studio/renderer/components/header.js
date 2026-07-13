import { el } from '../renderer.js';

export function renderHeader(profile, photo) {
  if (!profile) return null;
  const hasName = profile.fullName && profile.fullName.trim();
  if (!hasName) return null;

  const photoEl = photo?.url
    ? el('div', { className: 'resume-header-photo' },
        el('img', { src: photo.url, alt: '' })
      )
    : null;

  const contactParts = [];
  if (profile.email) contactParts.push(el('span', { className: 'resume-contact-item' }, profile.email));
  if (profile.phone) contactParts.push(el('span', { className: 'resume-contact-item' }, profile.phone));
  if (profile.location) contactParts.push(el('span', { className: 'resume-contact-item' }, profile.location));

  const links = [];
  if (profile.linkedin) links.push(el('a', { className: 'resume-link', href: profile.linkedin, target: '_blank' }, 'LinkedIn'));
  if (profile.website) links.push(el('a', { className: 'resume-link', href: profile.website, target: '_blank' }, 'Website'));
  if (profile.portfolio) links.push(el('a', { className: 'resume-link', href: profile.portfolio, target: '_blank' }, 'Portfolio'));
  if (profile.github) links.push(el('a', { className: 'resume-link', href: profile.github, target: '_blank' }, 'GitHub'));
  if (profile.leetcode) links.push(el('a', { className: 'resume-link', href: profile.leetcode, target: '_blank' }, 'LeetCode'));
  if (profile.codeforces) links.push(el('a', { className: 'resume-link', href: profile.codeforces, target: '_blank' }, 'Codeforces'));

  return el('header', { className: 'resume-header' },
    photoEl,
    el('h1', { className: 'resume-header-name' }, profile.fullName),
    profile.professionalTitle ? el('p', { className: 'resume-header-title' }, profile.professionalTitle) : null,
    contactParts.length > 0 ? el('div', { className: 'resume-contact' }, ...contactParts) : null,
    links.length > 0 ? el('div', { className: 'resume-links' }, ...links) : null
  );
}
