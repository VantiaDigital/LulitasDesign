/* =============================================================
   Lulitas Designs · i18n.js
   Bilingüe ES/EN vía data-en attributes.
   - Cada elemento con `data-en="texto en inglés"` se swappea
     al cambiar de idioma (innerHTML).
   - Para atributos: data-en-placeholder, data-en-aria-label,
     data-en-title, data-en-alt.
   - El idioma elegido persiste en localStorage.
   - Dispara CustomEvent 'lulitas:lang' para que cart.js
     reaccione.
   ============================================================= */

(() => {
  'use strict';

  const STORAGE_KEY = 'lulitas-lang';
  const DEFAULT_LANG = 'es';

  const readStored = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'es' || v === 'en') return v;
    } catch {}
    return DEFAULT_LANG;
  };

  let currentLang = readStored();

  const apply = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;

    // 1) Swap innerHTML donde haya data-en
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset._es === undefined) {
        el.dataset._es = el.innerHTML;
      }
      const enHtml = el.getAttribute('data-en');
      el.innerHTML = lang === 'en' ? enHtml : el.dataset._es;
    });

    // 2) Swap atributos (placeholder, aria-label, title, alt)
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(attr => {
      const dataKey = `data-en-${attr}`;
      const cacheKey = `_es${attr.replace(/-/g, '_')}`;
      document.querySelectorAll(`[${dataKey}]`).forEach(el => {
        if (el.dataset[cacheKey] === undefined) {
          el.dataset[cacheKey] = el.getAttribute(attr) || '';
        }
        const enVal = el.getAttribute(dataKey);
        el.setAttribute(attr, lang === 'en' ? enVal : el.dataset[cacheKey]);
      });
    });

    // 3) Estado visual del toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // 4) Persistir
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}

    // 5) Avisar a otros scripts (cart.js)
    window.dispatchEvent(new CustomEvent('lulitas:lang', { detail: { lang } }));
  };

  // Click handler del toggle
  document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    const lang = btn.dataset.lang;
    if (lang && lang !== currentLang) apply(lang);
  });

  // Sincronizar entre pestañas
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY && (e.newValue === 'es' || e.newValue === 'en')) {
      apply(e.newValue);
    }
  });

  // API pública
  window.lulitasI18n = {
    get current() { return currentLang; },
    apply,
    t: (es, en) => currentLang === 'en' ? en : es
  };

  // Init
  apply(currentLang);
})();
