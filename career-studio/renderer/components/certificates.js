import { el } from '../renderer.js';

export function renderCertificates(certificates) {
  if (!certificates || certificates.length === 0) return null;

  return el('div', { className: 'resume-certificates' },
    ...certificates.map(c =>
      el('div', { className: 'resume-certificate' },
        el('span', { className: 'resume-cert-icon' }, '\u2713'),
        el('span', { className: 'resume-cert-name' }, c.name),
        c.issuer ? el('span', { className: 'resume-cert-issuer' }, c.issuer) : null
      )
    )
  );
}
