import { ZH_TW, ZH_TW_PATTERNS } from './dict.zh-TW.js';
import { ZH_CN, ZH_CN_PATTERNS } from './dict.zh-CN.js';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh-TW', label: '繁體中文', short: '繁' },
  { code: 'zh-CN', label: '简体中文', short: '简' }
];

const DICTS = {
  'zh-TW': ZH_TW,
  'zh-CN': ZH_CN
};

const PATTERNS = {
  'zh-TW': ZH_TW_PATTERNS,
  'zh-CN': ZH_CN_PATTERNS
};

const STORAGE_KEY = 'k8sgames.lang';

// Never translate inside these: they render simulated kubectl / YAML output,
// which must stay byte-identical to the real tool.
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'NOSCRIPT', 'KBD', 'CANVAS'
]);

const ATTRS = ['title', 'placeholder', 'aria-label'];

class I18n {
  constructor() {
    this.lang = this._readStored();
    this.state = new WeakMap();      // text node -> { src, out }
    this.attrState = new WeakMap();  // element -> { [attr]: { src, out } }
    this.observer = null;
    this.applying = false;
    this.pending = new Set();
    this.frame = null;
    this._listeners = new Set();
  }

  _readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && LANGUAGES.some((l) => l.code === v)) return v;
    } catch (e) { /* private mode */ }
    return 'en';
  }

  get languages() {
    return LANGUAGES;
  }

  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /** Translate a single string. Returns the input unchanged when there is no entry. */
  t(text) {
    if (this.lang === 'en') return text;
    const dict = DICTS[this.lang];
    if (!dict) return text;

    const trimmed = text.trim();
    if (!trimmed) return text;

    const hit = dict[trimmed];
    if (hit !== undefined) return this._preserveSpace(text, trimmed, hit);

    const patterns = PATTERNS[this.lang] || [];
    for (const [re, tpl] of patterns) {
      re.lastIndex = 0;
      const m = re.exec(trimmed);
      if (m && m[0].length === trimmed.length) {
        // Captures are translated too, so "Chapter 1: Foundations" picks up
        // the dictionary entry for "Foundations".
        const out = tpl.replace(/\$(\d)/g, (_, i) => {
          const cap = m[Number(i)];
          return cap === undefined ? '' : this._lookup(cap);
        });
        return this._preserveSpace(text, trimmed, out);
      }
    }

    return text;
  }

  /** Plain dictionary lookup with no pattern fallback (avoids recursion). */
  _lookup(text) {
    const dict = DICTS[this.lang];
    if (!dict) return text;
    const trimmed = text.trim();
    const hit = dict[trimmed];
    return hit === undefined ? text : hit;
  }

  _preserveSpace(original, trimmed, translated) {
    const start = original.indexOf(trimmed);
    const lead = original.slice(0, start);
    const tail = original.slice(start + trimmed.length);
    return lead + translated + tail;
  }

  setLanguage(code) {
    if (!LANGUAGES.some((l) => l.code === code)) return false;
    this.lang = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }

    document.documentElement.setAttribute('lang', code);
    document.documentElement.setAttribute('data-lang', code);

    this._applyTitle();
    this.applyTo(document.body);
    for (const fn of this._listeners) {
      try { fn(code); } catch (e) { /* a listener must not break switching */ }
    }
    return true;
  }

  start() {
    document.documentElement.setAttribute('lang', this.lang);
    document.documentElement.setAttribute('data-lang', this.lang);
    this._applyTitle();
    this.applyTo(document.body);
    this._observe();
  }

  _applyTitle() {
    if (this._titleSrc === undefined) this._titleSrc = document.title;
    document.title = this.t(this._titleSrc);
  }

  _observe() {
    if (this.observer) return;
    this.observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'childList') {
          for (const n of r.addedNodes) this.pending.add(n);
        } else if (r.type === 'characterData') {
          // Skip the echo of our own write; anything else is a real update.
          const st = this.state.get(r.target);
          if (st && st.out === r.target.nodeValue) continue;
          this.pending.add(r.target);
        } else {
          const store = this.attrState.get(r.target);
          const prev = store && store[r.attributeName];
          if (prev && prev.out === r.target.getAttribute(r.attributeName)) continue;
          this.pending.add(r.target);
        }
      }
      this._drain();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  /**
   * Translate everything queued, synchronously.
   *
   * This runs in the observer's own microtask rather than on a timer or
   * requestAnimationFrame: both are throttled in a background tab, which
   * would leave freshly rendered English on screen when the tab came back.
   * Our own writes come back as echoes on the next microtask and are
   * filtered out above, so this settles after one extra pass.
   */
  _drain() {
    if (this._draining || !this.pending.size) return;
    this._draining = true;
    try {
      const nodes = [...this.pending];
      this.pending.clear();
      for (const n of nodes) {
        if (!n.isConnected) continue;
        try {
          this.applyTo(n);
        } catch (e) {
          // One bad node must not stall the rest of the queue.
        }
      }
    } finally {
      this._draining = false;
    }
  }

  _skipped(el) {
    for (let n = el; n; n = n.parentElement) {
      if (SKIP_TAGS.has(n.tagName)) return true;
      if (n.hasAttribute && n.hasAttribute('data-i18n-skip')) return true;
    }
    return false;
  }

  /**
   * Translate a node and everything under it.
   *
   * Writes are idempotent: each node remembers the English it came from, so
   * re-running over already-translated content produces the same string and
   * writes nothing. That is what lets the observer stay dumb — it can replay
   * our own mutations without looping.
   */
  applyTo(root) {
    if (!root) return;
    try {
      if (root.nodeType === Node.TEXT_NODE) {
        this._applyText(root);
      } else if (root.nodeType === Node.ELEMENT_NODE) {
        if (this._skipped(root)) return;
        this._applyAttrs(root);

        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (SKIP_TAGS.has(node.tagName) || node.hasAttribute('data-i18n-skip')) {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              }
              return node.nodeValue && node.nodeValue.trim()
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
            }
          }
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeType === Node.ELEMENT_NODE) this._applyAttrs(node);
          else this._applyText(node);
        }
      }
    } finally {
      this.applying = false;
    }
  }

  _applyText(node) {
    const cur = node.nodeValue;
    if (!cur || !cur.trim()) return;
    if (node.parentElement && this._skipped(node.parentElement)) return;

    const prev = this.state.get(node);
    // If the value is still what we last wrote, the remembered English is the source.
    // Otherwise the app just wrote something new — that becomes the new source.
    const src = prev && prev.out === cur ? prev.src : cur;

    const out = this.t(src);
    if (out !== cur) node.nodeValue = out;
    this.state.set(node, { src, out });
  }

  _applyAttrs(el) {
    if (!el.getAttribute) return;
    let store = this.attrState.get(el);

    for (const attr of ATTRS) {
      const cur = el.getAttribute(attr);
      if (cur === null || !cur.trim()) continue;

      const prev = store && store[attr];
      const src = prev && prev.out === cur ? prev.src : cur;

      const out = this.t(src);
      if (out !== cur) el.setAttribute(attr, out);

      if (!store) { store = {}; this.attrState.set(el, store); }
      store[attr] = { src, out };
    }
  }
}

const i18n = new I18n();

export { i18n, I18n, LANGUAGES };
