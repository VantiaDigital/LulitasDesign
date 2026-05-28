/* =============================================================
   Lulitas Designs · cart.js  (bilingüe ES/EN)
   Carrito persistente (localStorage) + mailto con detalle.
   - Auto-enhance: cada .catalog-card y .tag-card recibe
     data-product + un botón "+ agregar al pedido".
   - Guarda ES + EN de cada producto, así el carrito se ve
     en el idioma activo aunque el item se haya agregado en
     el otro idioma.
   ============================================================= */

(() => {
  'use strict';

  const STORAGE_KEY = 'lulitas-cart-v2';
  const EMAIL = 'lulitasdesigns@gmail.com';

  // ---------- Helpers ----------
  const slugify = (s) => (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  const escapeHtml = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').trim();
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Idioma actual ----------
  const lang = () => (window.lulitasI18n?.current) || 'es';
  const t = (es, en) => lang() === 'en' ? en : es;

  // ---------- Cart state ----------
  const readCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  const writeCart = (cart) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch { /* quota / private mode */ }
    updateUI();
  };

  const addItem = (product) => {
    if (!product?.id) return;
    const cart = readCart();
    const ex = cart.find(it => it.id === product.id);
    if (ex) ex.qty += 1;
    else cart.push({ ...product, qty: 1 });
    writeCart(cart);
    bumpFab();
  };
  const changeQty = (id, delta) => {
    const cart = readCart();
    const i = cart.findIndex(it => it.id === id);
    if (i === -1) return;
    cart[i].qty += delta;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    writeCart(cart);
  };
  const removeItem = (id) => writeCart(readCart().filter(it => it.id !== id));
  const clearCart = () => writeCart([]);
  const totalQty = () => readCart().reduce((sum, it) => sum + it.qty, 0);

  // ---------- Auto-enhance cards ----------
  const getDualText = (el, fallback = '') => {
    if (!el) return { es: fallback, en: fallback };
    const visible = stripHtml(el.dataset._es ?? el.innerHTML);
    const enHtml = el.getAttribute('data-en');
    const en = enHtml ? stripHtml(enHtml) : visible;
    return { es: visible, en };
  };

  const enhanceCard = (card) => {
    const heading = card.querySelector('h3, h4');
    if (!heading) return;
    const name = getDualText(heading);

    let cat;
    if (card.classList.contains('catalog-card')) {
      const catHead = card.closest('.catalog-section')
                        ?.querySelector('.catalog-section-head h3');
      cat = getDualText(catHead, 'cuaderno');
    } else if (card.classList.contains('tag-card')) {
      cat = { es: 'servicios', en: 'services' };
    } else return;

    const fmtEl = card.querySelector('.cc-format');
    const format = fmtEl ? getDualText(fmtEl) : { es: '', en: '' };

    const id = `${slugify(cat.es)}--${slugify(name.es)}`;

    card.dataset.product = id;
    card.dataset.nameEs = name.es;
    card.dataset.nameEn = name.en;
    card.dataset.catEs = cat.es;
    card.dataset.catEn = cat.en;
    if (format.es) card.dataset.formatEs = format.es;
    if (format.en) card.dataset.formatEn = format.en;

    if (card.querySelector('.btn-add')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-add';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
      <span data-en="add to order">agregar al pedido</span>
    `;

    if (card.classList.contains('catalog-card')) {
      const foot = document.createElement('div');
      foot.className = 'card-foot';
      if (fmtEl) foot.appendChild(fmtEl);
      foot.appendChild(btn);
      card.appendChild(foot);
    } else {
      card.appendChild(btn);
    }
  };

  $$('.catalog-card, .tag-card').forEach(enhanceCard);

  // Re-apply i18n on newly created elements (los <span data-en> de los btns)
  if (window.lulitasI18n) window.lulitasI18n.apply(lang());

  // ---------- UI updaters ----------
  const updateCount = () => {
    const count = totalQty();
    const badge = $('#cartCount');
    if (badge) {
      badge.textContent = count;
      badge.hidden = count === 0;
    }
  };

  const renderCart = () => {
    const body = $('#cartBody');
    const totalEl = $('#cartTotalValue');
    const submit = $('#cartSubmit');
    if (!body) return;

    const cart = readCart();
    const count = totalQty();
    const currentLang = lang();

    if (totalEl) {
      const word = currentLang === 'en'
        ? `${count} piece${count === 1 ? '' : 's'}`
        : `${count} pieza${count === 1 ? '' : 's'}`;
      totalEl.textContent = word;
    }
    if (submit) submit.disabled = cart.length === 0;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-icon" aria-hidden="true">✿</span>
          <p>${t(
            'tu pedido está vacío —<br/>sumá productos desde<br/>servicios o el cuaderno ♡',
            'your order is empty —<br/>add products from<br/>services or notebook ♡'
          )}</p>
        </div>`;
      return;
    }

    body.innerHTML = cart.map(it => {
      const itName = currentLang === 'en' ? (it.nameEn || it.nameEs || it.name) : (it.nameEs || it.name);
      const itCat  = currentLang === 'en' ? (it.catEn  || it.catEs  || it.category) : (it.catEs  || it.category);
      const itFmt  = currentLang === 'en' ? (it.formatEn || it.formatEs || it.format) : (it.formatEs || it.format);
      return `
        <article class="cart-item" data-id="${escapeHtml(it.id)}">
          <div class="cart-item-info">
            <h4>${escapeHtml(itName || '')}</h4>
            <span class="cart-item-cat">${escapeHtml(itCat || '')}</span>
            ${itFmt ? `<span class="cart-item-format">· ${escapeHtml(itFmt)}</span>` : ''}
          </div>
          <div class="cart-item-qty">
            <button type="button" data-action="dec" aria-label="${t('Restar uno','Subtract one')}">−</button>
            <span>${it.qty}</span>
            <button type="button" data-action="inc" aria-label="${t('Sumar uno','Add one')}">+</button>
          </div>
          <button type="button" class="cart-item-remove" data-action="remove" aria-label="${t('Quitar producto','Remove product')}">×</button>
        </article>
      `;
    }).join('');
  };

  const updateUI = () => {
    updateCount();
    renderCart();
  };

  const bumpFab = () => {
    const fab = $('#cartFab');
    if (!fab) return;
    fab.classList.remove('is-bumping');
    void fab.offsetWidth;
    fab.classList.add('is-bumping');
  };

  // ---------- Drawer open / close ----------
  const drawer = $('#cartDrawer');
  const overlay = $('#cartOverlay');
  const fab = $('#cartFab');
  const closeBtn = $('#cartClose');

  const openCart = () => {
    drawer?.classList.add('is-open');
    overlay?.classList.add('is-open');
    drawer?.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  };
  const closeCart = () => {
    drawer?.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  };

  fab?.addEventListener('click', openCart);
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // ---------- Click delegation ----------
  document.addEventListener('click', e => {
    // Agregar al pedido
    const addBtn = e.target.closest('.btn-add');
    if (addBtn) {
      const card = addBtn.closest('[data-product]');
      if (!card) return;
      addItem({
        id: card.dataset.product,
        nameEs: card.dataset.nameEs,
        nameEn: card.dataset.nameEn,
        catEs: card.dataset.catEs,
        catEn: card.dataset.catEn,
        formatEs: card.dataset.formatEs || '',
        formatEn: card.dataset.formatEn || ''
      });
      const label = addBtn.querySelector('span');
      if (label) {
        const originalEs = label.dataset._es ?? label.textContent;
        const originalEn = label.getAttribute('data-en') || originalEs;
        addBtn.classList.add('is-added');
        label.textContent = t('✓ agregado', '✓ added');
        setTimeout(() => {
          addBtn.classList.remove('is-added');
          label.textContent = lang() === 'en' ? originalEn : originalEs;
        }, 1400);
      }
      return;
    }

    // Cart actions
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn && actionBtn.closest('.cart-item')) {
      const itemEl = actionBtn.closest('.cart-item');
      const id = itemEl?.dataset.id;
      if (!id) return;
      const action = actionBtn.dataset.action;
      if (action === 'inc') changeQty(id, 1);
      else if (action === 'dec') changeQty(id, -1);
      else if (action === 'remove') removeItem(id);
      return;
    }

    // Vaciar pedido
    if (e.target.closest('#cartClear')) {
      if (totalQty() > 0 && confirm(t('¿Vaciar todo el pedido?', 'Clear the whole order?'))) clearCart();
      return;
    }
  });

  // ---------- Submit del form: armar mailto ----------
  const form = $('#cartForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = readCart();
    if (cart.length === 0) return;

    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim() || t('(sin nombre)','(no name)');
    const contact = (fd.get('contact') || '').toString().trim() || t('(no especificado)','(not specified)');
    const notes = (fd.get('notes') || '').toString().trim();
    const total = totalQty();
    const currentLang = lang();

    const sep = '─'.repeat(40);
    let body;

    if (currentLang === 'en') {
      body = `Hi Patricia!\n\nI'd like a quote for these products:\n\n${sep}\n\n`;
      cart.forEach((it, i) => {
        const nm = it.nameEn || it.nameEs || it.name || '';
        const ct = it.catEn  || it.catEs  || it.category || '';
        const fm = it.formatEn || it.formatEs || it.format || '';
        body += `${String(i + 1).padStart(2, '0')}. ${nm}\n`;
        body += `    category: ${ct}\n`;
        if (fm) body += `    format:   ${fm}\n`;
        body += `    quantity: ${it.qty}\n\n`;
      });
      body += `${sep}\n`;
      body += `TOTAL: ${total} piece${total === 1 ? '' : 's'}\n`;
      body += `${sep}\n\n`;
      body += `My info:\n`;
      body += `  · name:    ${name}\n`;
      body += `  · contact: ${contact}\n`;
      if (notes) body += `\nComments:\n${notes}\n`;
      body += `\nThanks! ♡\n— sent from lulitas.designs`;
    } else {
      body = `¡Hola Patricia!\n\nQuiero pedir presupuesto por estos productos:\n\n${sep}\n\n`;
      cart.forEach((it, i) => {
        const nm = it.nameEs || it.name || '';
        const ct = it.catEs  || it.category || '';
        const fm = it.formatEs || it.format || '';
        body += `${String(i + 1).padStart(2, '0')}. ${nm}\n`;
        body += `    categoría: ${ct}\n`;
        if (fm) body += `    formato:   ${fm}\n`;
        body += `    cantidad:  ${it.qty}\n\n`;
      });
      body += `${sep}\n`;
      body += `TOTAL: ${total} pieza${total === 1 ? '' : 's'} seleccionada${total === 1 ? '' : 's'}\n`;
      body += `${sep}\n\n`;
      body += `Mis datos:\n`;
      body += `  · nombre:    ${name}\n`;
      body += `  · contacto:  ${contact}\n`;
      if (notes) body += `\nComentarios:\n${notes}\n`;
      body += `\n¡Gracias! ♡\n— enviado desde lulitas.designs`;
    }

    const subject = currentLang === 'en'
      ? `New order — ${total} piece${total === 1 ? '' : 's'} from Lulitas Designs`
      : `Nuevo pedido — ${total} pieza${total === 1 ? '' : 's'} de Lulitas Designs`;

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });

  // ---------- Re-render al cambiar idioma ----------
  window.addEventListener('lulitas:lang', () => {
    updateUI();
  });

  // ---------- Sincronizar entre pestañas ----------
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) updateUI();
  });

  // ---------- Init ----------
  updateUI();
})();
