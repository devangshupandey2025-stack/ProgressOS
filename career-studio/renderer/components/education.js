import { el } from '../renderer.js';

export function renderEducation(education) {
  if (!education) return null;
  if (!education.institution && !education.cgpa && !education.creditsEarned) return null;

  const details = [];
  if (education.cgpa != null) details.push(el('span', { className: 'resume-edu-detail' }, `CGPA: ${education.cgpa}`));
  if (education.creditsEarned != null) {
    const creditsText = education.creditsRequired
      ? `Credits: ${education.creditsEarned} / ${education.creditsRequired}`
      : `Credits: ${education.creditsEarned}`;
    details.push(el('span', { className: 'resume-edu-detail' }, creditsText));
  }
  if (education.attendance != null) details.push(el('span', { className: 'resume-edu-detail' }, `Attendance: ${education.attendance}%`));

  return el('div', { className: 'resume-education' },
    education.institution ? el('h3', { className: 'resume-edu-institution' }, education.institution) : null,
    details.length > 0 ? el('div', { className: 'resume-edu-details' }, ...details) : null
  );
}
