import { Renderer, el } from '../renderer.js';
import { renderHeader } from '../components/header.js';
import { renderSummary } from '../components/summary.js';
import { renderProjects } from '../components/projects.js';
import { renderSkills } from '../components/skills.js';
import { renderEducation } from '../components/education.js';
import { renderAchievements } from '../components/achievements.js';
import { renderCertificates } from '../components/certificates.js';
import { renderCodingProfiles } from '../components/coding-profiles.js';

export class MinimalRenderer extends Renderer {
  get name() { return 'minimal'; }

  static get css() {
    return `
.resume-minimal {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 10pt;
  line-height: 1.5;
  color: #1a1a1a;
  padding: 40px 48px;
}

/* ── Header ────────────────────────────────────── */
.resume-minimal .resume-header {
  text-align: center;
  margin-bottom: 24px;
}
.resume-minimal .resume-header-photo {
  display: none;
}
.resume-minimal .resume-header-name {
  font-size: 18pt;
  font-weight: 700;
  color: #000;
  margin: 0 0 2px;
  letter-spacing: 0.02em;
}
.resume-minimal .resume-header-title {
  font-size: 10.5pt;
  color: #555;
  margin: 0 0 8px;
  font-weight: 400;
}
.resume-minimal .resume-contact {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px 10px;
  margin-bottom: 6px;
  font-size: 8.5pt;
  color: #555;
}
.resume-minimal .resume-contact-item:not(:last-child)::after {
  content: '|';
  margin-left: 10px;
  color: #ccc;
}
.resume-minimal .resume-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px 10px;
  font-size: 8.5pt;
}
.resume-minimal .resume-link {
  color: #555;
  text-decoration: none;
}
.resume-minimal .resume-link:hover {
  text-decoration: underline;
}

/* ── Sections ──────────────────────────────────── */
.resume-minimal .resume-section {
  margin-bottom: 18px;
}
.resume-minimal .resume-section-title {
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #000;
  margin: 0 0 6px;
  padding-bottom: 3px;
  border-bottom: 1px solid #ccc;
}

/* ── Summary ───────────────────────────────────── */
.resume-minimal .resume-summary-text {
  font-size: 9.5pt;
  line-height: 1.6;
  color: #333;
  margin: 0;
}
.resume-minimal .resume-summary-empty {
  color: #999;
  font-style: italic;
}
.resume-minimal .resume-ai-badge {
  display: none;
}

/* ── Projects ──────────────────────────────────── */
.resume-minimal .resume-project {
  margin-bottom: 12px;
}
.resume-minimal .resume-project:last-child {
  margin-bottom: 0;
}
.resume-minimal .resume-project-header {
  margin-bottom: 1px;
}
.resume-minimal .resume-project-title {
  display: inline;
  font-size: 10pt;
  font-weight: 700;
  color: #000;
  margin: 0;
}
.resume-minimal .resume-project-tags {
  display: inline;
  margin-left: 6px;
  font-size: 8pt;
  color: #555;
}
.resume-minimal .resume-tag {
  font-weight: 400;
}
.resume-minimal .resume-tag:not(:last-child)::after {
  content: ', ';
}
.resume-minimal .resume-project-description {
  font-size: 9pt;
  color: #444;
  margin: 1px 0 0;
}
.resume-minimal .resume-project-bullets {
  margin: 3px 0 0;
  padding-left: 18px;
  list-style: none;
}
.resume-minimal .resume-project-bullets li {
  font-size: 9pt;
  color: #333;
  position: relative;
  margin-bottom: 1px;
}
.resume-minimal .resume-project-bullets li::before {
  content: '\u2022';
  position: absolute;
  left: -14px;
  color: #666;
}
.resume-minimal .resume-project-links {
  display: none;
}
.resume-minimal .resume-project-link {
  display: none;
}

/* ── Skills ────────────────────────────────────── */
.resume-minimal .resume-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 4px;
}
.resume-minimal .resume-skill {
  font-size: 9pt;
  color: #333;
}
.resume-minimal .resume-skill:not(:last-child)::after {
  content: ', ';
}

/* ── Education ─────────────────────────────────── */
.resume-minimal .resume-edu-institution {
  font-size: 10pt;
  font-weight: 700;
  color: #000;
  margin: 0 0 2px;
}
.resume-minimal .resume-edu-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 9pt;
  color: #444;
}

/* ── Achievements ──────────────────────────────── */
.resume-minimal .resume-achievement {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
  align-items: flex-start;
  font-size: 9pt;
}
.resume-minimal .resume-achievement:last-child {
  margin-bottom: 0;
}
.resume-minimal .resume-ach-icon {
  display: none;
}
.resume-minimal .resume-ach-title {
  font-weight: 600;
  color: #000;
}
.resume-minimal .resume-ach-desc {
  color: #444;
  margin: 0;
}
.resume-minimal .resume-ach-source {
  color: #666;
  font-size: 8pt;
  margin-left: 4px;
}

/* ── Certificates ──────────────────────────────── */
.resume-minimal .resume-certificate {
  display: flex;
  gap: 4px;
  margin-bottom: 3px;
  font-size: 9pt;
}
.resume-minimal .resume-cert-icon {
  display: none;
}
.resume-minimal .resume-cert-name {
  font-weight: 600;
  color: #000;
}
.resume-minimal .resume-cert-issuer {
  color: #555;
}

/* ── Coding Profiles ───────────────────────────── */
.resume-minimal .resume-coding-profiles {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  font-size: 9pt;
}
.resume-minimal .resume-coding-link {
  color: #333;
  text-decoration: none;
}
.resume-minimal .resume-coding-link:hover {
  text-decoration: underline;
}
.resume-minimal .resume-coding-stats {
  font-size: 7.5pt;
  color: #888;
}
`;
  }

  components = {
    summary: (sections, ctx) => renderSummary(sections.profile?.bio),
    projects: (sections, ctx) => renderProjects(sections.projects),
    skills: (sections, ctx) => renderSkills(sections.skills),
    education: (sections, ctx) => renderEducation(sections.education),
    achievements: (sections, ctx) => renderAchievements(sections.achievements),
    certificates: (sections, ctx) => renderCertificates(sections.certificates),
    codingProfiles: (sections, ctx) => renderCodingProfiles(sections.codingProfiles),
  };

  render(ctx) {
    const root = el('div', { className: 'resume resume-minimal' });
    const headerEl = renderHeader(ctx.sections.profile, ctx.sections.photo);
    if (headerEl) root.appendChild(headerEl);
    const sectionsEl = this.renderSections(ctx);
    root.appendChild(sectionsEl);
    return root;
  }
}
