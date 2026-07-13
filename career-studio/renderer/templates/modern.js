import { Renderer, el } from '../renderer.js';
import { renderHeader } from '../components/header.js';
import { renderSummary } from '../components/summary.js';
import { renderProjects } from '../components/projects.js';
import { renderSkills } from '../components/skills.js';
import { renderEducation } from '../components/education.js';
import { renderAchievements } from '../components/achievements.js';
import { renderCertificates } from '../components/certificates.js';
import { renderCodingProfiles } from '../components/coding-profiles.js';

export class ModernRenderer extends Renderer {
  get name() { return 'modern'; }

  static get css() {
    return `
.resume-modern {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.5;
  color: #1e293b;
}

/* ── Sidebar ───────────────────────────────────── */
.resume-modern .resume-sidebar {
  background: #f8fafc;
  padding: 36px 24px;
  border-right: 1px solid #e2e8f0;
}

/* ── Photo ─────────────────────────────────────── */
.resume-modern .resume-header-photo {
  text-align: center;
  margin-bottom: 20px;
}
.resume-modern .resume-header-photo img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ── Header ────────────────────────────────────── */
.resume-modern .resume-header-name {
  font-size: 16pt;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
  line-height: 1.2;
}
.resume-modern .resume-header-title {
  font-size: 10pt;
  color: #64748b;
  margin: 0 0 14px;
  font-weight: 500;
}
.resume-modern .resume-contact {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 12px;
}
.resume-modern .resume-contact-item {
  font-size: 8.5pt;
  color: #475569;
}
.resume-modern .resume-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.resume-modern .resume-link {
  font-size: 8.5pt;
  color: #FF9933;
  text-decoration: none;
  font-weight: 600;
}
.resume-modern .resume-link:hover {
  text-decoration: underline;
}

/* ── Sidebar Skills ────────────────────────────── */
.resume-modern .resume-sidebar .resume-skills {
  margin-top: 20px;
}
.resume-modern .resume-sidebar .resume-skills::before {
  content: 'Skills';
  display: block;
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 8px;
}
.resume-modern .resume-skill {
  display: inline-block;
  background: #e2e8f0;
  color: #334155;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 7.5pt;
  font-weight: 500;
  margin: 0 3px 4px 0;
}

/* ── Sidebar Coding Profiles ───────────────────── */
.resume-modern .resume-sidebar .resume-coding-profiles {
  margin-top: 20px;
}
.resume-modern .resume-sidebar .resume-coding-profiles::before {
  content: 'Profiles';
  display: block;
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 8px;
}
.resume-modern .resume-coding-link {
  display: block;
  font-size: 8.5pt;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 3px;
}
.resume-modern .resume-coding-link:hover {
  text-decoration: underline;
}
.resume-modern .resume-coding-item {
  margin-bottom: 6px;
}
.resume-modern .resume-coding-stats {
  display: block;
  font-size: 7pt;
  color: #94a3b8;
  margin-top: 1px;
}

/* ── Main Content ──────────────────────────────── */
.resume-modern .resume-main {
  padding: 36px 32px;
}

/* ── Sections ──────────────────────────────────── */
.resume-modern .resume-section {
  margin-bottom: 20px;
}
.resume-modern .resume-section-title {
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #FF9933;
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #FF9933;
}

/* ── Summary ───────────────────────────────────── */
.resume-modern .resume-summary-text {
  font-size: 9.5pt;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}
.resume-modern .resume-summary-empty {
  color: #94a3b8;
  font-style: italic;
}
.resume-modern .resume-ai-badge {
  display: inline-block;
  margin-top: 6px;
  font-size: 7pt;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

/* ── Projects ──────────────────────────────────── */
.resume-modern .resume-project {
  margin-bottom: 14px;
}
.resume-modern .resume-project:last-child {
  margin-bottom: 0;
}
.resume-modern .resume-project-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}
.resume-modern .resume-project-title {
  font-size: 10.5pt;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.resume-modern .resume-project-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 3px;
}
.resume-modern .resume-tag {
  font-size: 7pt;
  font-weight: 600;
  color: #FF9933;
  background: #fff7ed;
  padding: 1px 6px;
  border-radius: 3px;
}
.resume-modern .resume-project-description {
  font-size: 9pt;
  color: #64748b;
  margin: 2px 0 4px;
}
.resume-modern .resume-project-bullets {
  margin: 4px 0 0;
  padding-left: 18px;
  list-style: none;
}
.resume-modern .resume-project-bullets li {
  font-size: 9pt;
  color: #475569;
  position: relative;
  margin-bottom: 1px;
}
.resume-modern .resume-project-bullets li::before {
  content: '\u2022';
  position: absolute;
  left: -14px;
  color: #FF9933;
}
.resume-modern .resume-project-links {
  margin-top: 4px;
  display: flex;
  gap: 10px;
}
.resume-modern .resume-project-link {
  font-size: 8pt;
  font-weight: 600;
  color: #FF9933;
  text-decoration: none;
}

/* ── Education ─────────────────────────────────── */
.resume-modern .resume-edu-institution {
  font-size: 10pt;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}
.resume-modern .resume-edu-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.resume-modern .resume-edu-detail {
  font-size: 9pt;
  color: #475569;
}

/* ── Achievements ──────────────────────────────── */
.resume-modern .resume-achievement {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  align-items: flex-start;
}
.resume-modern .resume-achievement:last-child {
  margin-bottom: 0;
}
.resume-modern .resume-ach-icon {
  font-size: 12pt;
  flex-shrink: 0;
  line-height: 1.4;
}
.resume-modern .resume-ach-body {
  flex: 1;
}
.resume-modern .resume-ach-title {
  font-size: 9.5pt;
  font-weight: 600;
  color: #0f172a;
}
.resume-modern .resume-ach-desc {
  font-size: 8.5pt;
  color: #64748b;
  margin: 1px 0 0;
}
.resume-modern .resume-ach-source {
  font-size: 7pt;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ── Certificates ──────────────────────────────── */
.resume-modern .resume-certificate {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 9pt;
}
.resume-modern .resume-cert-icon {
  color: #128807;
  font-weight: 700;
  font-size: 10pt;
}
.resume-modern .resume-cert-name {
  font-weight: 600;
  color: #0f172a;
}
.resume-modern .resume-cert-issuer {
  color: #64748b;
}
`;
  }

  components = {
    summary: (sections, ctx) => renderSummary(sections.profile?.bio),
    projects: (sections, ctx) => renderProjects(sections.projects),
    education: (sections, ctx) => renderEducation(sections.education),
    achievements: (sections, ctx) => renderAchievements(sections.achievements),
    certificates: (sections, ctx) => renderCertificates(sections.certificates),
  };

  render(ctx) {
    return el('div', { className: 'resume resume-modern' },
      el('div', { className: 'resume-sidebar' },
        renderHeader(ctx.sections.profile, ctx.sections.photo),
        renderSkills(ctx.sections.skills),
        renderCodingProfiles(ctx.sections.codingProfiles)
      ),
      el('div', { className: 'resume-main' },
        this.renderSections(ctx)
      )
    );
  }
}
