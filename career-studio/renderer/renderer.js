export function el(tag, attrs, ...children) {
  const element = document.createElement(tag);
  if (attrs) {
    for (let [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === 'className') { element.className = value; }
      else if (key === 'style' && typeof value === 'object') { Object.assign(element.style, value); }
      else if (key === 'checked') { element.checked = !!value; }
      else if (key === 'disabled') { element.disabled = !!value; }
      else if (key.startsWith('on') && typeof value === 'function') { element.addEventListener(key.slice(2).toLowerCase(), value); }
      else if (key === 'htmlFor') { element.setAttribute('for', value); }
      else { element.setAttribute(key, value); }
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') { element.appendChild(document.createTextNode(String(child))); }
    else if (child instanceof Node) { element.appendChild(child); }
  }
  return element;
}

const DEFAULT_LABELS = { summary: 'Professional Summary', codingProfiles: 'Coding Profiles' };

export class Renderer {
  static get css() { return ''; }
  get name() { return 'base'; }

  components = {};

  render(ctx) {
    throw new Error('Template must implement render()');
  }

  renderSections(ctx) {
    const fragment = document.createDocumentFragment();
    for (const key of ctx.sectionOrder) {
      if (ctx.visibility[key] === false) continue;
      const sectionEl = this.renderSection(key, ctx);
      if (sectionEl) fragment.appendChild(sectionEl);
    }
    return fragment;
  }

  renderSection(key, ctx) {
    const fn = this.components[key];
    if (!fn) return null;
    const content = fn(ctx.sections, ctx);
    if (!content) return null;
    const label = ctx.sectionLabels?.[key] || DEFAULT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
    return el('section', { className: `resume-section resume-${key}` },
      el('h2', { className: 'resume-section-title' }, label),
      content
    );
  }
}
