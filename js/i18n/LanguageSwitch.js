import { i18n, LANGUAGES } from './I18n.js';

/**
 * Renders a segmented language picker into every element matching
 * `#lang-switch, [data-lang-switch]`, and keeps them all in sync.
 *
 * Containers are marked `data-i18n-skip`, so the language names always
 * render in their own language rather than being translated.
 */
function renderSwitches(root = document) {
  const targets = root.querySelectorAll('#lang-switch, [data-lang-switch]');

  for (const el of targets) {
    if (el.dataset.langReady === '1') {
      paint(el);
      continue;
    }

    el.dataset.langReady = '1';
    el.innerHTML = LANGUAGES.map((l) => `
      <button type="button" class="lang-btn" data-lang="${l.code}" lang="${l.code}">${l.label}</button>
    `).join('');

    el.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (!btn) return;
      i18n.setLanguage(btn.dataset.lang);
    });

    paint(el);
  }
}

function paint(el) {
  for (const btn of el.querySelectorAll('.lang-btn')) {
    btn.classList.toggle('active', btn.dataset.lang === i18n.lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === i18n.lang ? 'true' : 'false');
  }
}

function initLanguageSwitch() {
  renderSwitches();
  i18n.onChange(() => renderSwitches());

  // Panels such as Settings rebuild their markup, so re-render on demand.
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType !== Node.ELEMENT_NODE) continue;
        if (n.matches?.('#lang-switch, [data-lang-switch]') ||
            n.querySelector?.('#lang-switch, [data-lang-switch]')) {
          renderSwitches();
          return;
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export { initLanguageSwitch, renderSwitches };
