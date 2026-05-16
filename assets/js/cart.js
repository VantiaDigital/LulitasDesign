/* =============================================================
   Lulitas Designs · cart.js
   Carrito persistente (localStorage) + mailto con detalle.
   Auto-enhance: cada .catalog-card y .tag-card recibe data-*
   y un botón "+ agregar al pedido" sin tocar el HTML existente.
   ============================================================= */

(() => {
  'use strict';

  const STORAGE_KEY = 'lulitas-cart-v1';
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

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
  const enhanceCard = (card) => {
    const heading = card.querySelector('h3, h4');
    if (!heading) return;
    const name = heading.textContent.trim();

    let cat;
    if (card.classList.contains('catalog-card')) {
      cat = card.closest('.catalog-section')
            ?.querySelector('.catalog-section-head h3')
            ?.textContent?.trim() || 'cuaderno';
    } else if (card.classList.contains('tag-card')) {
      cat = 'servicios';
    } else return;

    const fmtEl = card.querySelector('.cc-format');
    const format = fmtEl?.textContent?.trim() || '';
    const id = `${slugify(cat)}--${slugify(name)}`;

    card.dataset.product = id;
    card.dataset.name = name;
    card.dataset.cat = cat;
    if (format) card.dataset.format = format;

    if (card.querySelector('.btn-add')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-add';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
      <span>agregar al pedido</span>
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

    if (totalEl) totalEl.textContent = `${count} pieza${count === 1 ? '' : 's'}`;
    if (submit) submit.disabled = cart.length === 0;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-icon" aria-hidden="true">✿</span>
          <p>tu pedido está vacío —<br/>sumá productos desde<br/>servicios o el cuaderno ♡</p>
        </div>`;
      return;
    }

    body.innerHTML = cart.map(it => `
      <article class="cart-item" data-id="${escapeHtml(it.id)}">
        <div class="cart-item-info">
          <h4>${escapeHtml(it.name)}</h4>
          <span class="cart-item-cat">${escapeHtml(it.category)}</span>
          ${it.format ? `<span class="cart-item-format">· ${escapeHtml(it.format)}</span>` : ''}
        </div>
        <div class="cart-item-qty">
          <button type="button" data-action="dec" aria-label="Restar uno">−</button>
          <span>${it.qty}</span>
          <button type="button" data-action="inc" aria-label="Sumar uno">+</button>
        </div>
        <button type="button" class="cart-item-remove" data-action="remove" aria-label="Quitar producto">×</button>
      </article>
    `).join('');
  };

  const updateUI = () => {
    updateCount();
    renderCart();
  };

  const bumpFab = () => {
    const fab = $('#cartFab');
    if (!fab) return;
    fab.classList.remove('is-bumping');
    // reflow para reiniciar la animación
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
    // 1) Agregar al pedido
    const addBtn = e.target.closest('.btn-add');
    if (addBtn) {
      const card = addBtn.closest('[data-product]');
      if (!card) return;
      addItem({
        id: card.dataset.product,
        name: card.dataset.name,
        category: card.dataset.cat,
        format: card.dataset.format || ''
      });
      const label = addBtn.querySelector('span');
      if (label) {
        const original = label.textContent;
        addBtn.classList.add('is-added');
        label.textContent = '✓ agregado';
        setTimeout(() => {
          addBtn.classList.remove('is-added');
          label.textContent = original;
        }, 1400);
      }
      return;
    }

    // 2) Acciones dentro del cart drawer
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

    // 3) Vaciar pedido
    if (e.target.closest('#cartClear')) {
      if (totalQty() > 0 && confirm('¿Vaciar todo el pedido?')) clearCart();
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
    const name = (fd.get('name') || '').toString().trim() || '(no especificado)';
    const contact = (fd.get('contact') || '').toString().trim() || '(no especificado)';
    const notes = (fd.get('notes') || '').toString().trim();
    const total = totalQty();

    // Construir el cuerpo del email
    const sep = '─'.repeat(40);
    let body = `¡Hola Patricia!\n\nQuiero pedir presupuesto por estos productos:\n\n${sep}\n\n`;

    cart.forEach((it, i) => {
      body += `${String(i + 1).padStart(2, '0')}. ${it.name}\n`;
      body += `    categoría: ${it.category}\n`;
      if (it.format) body += `    formato:   ${it.format}\n`;
      body += `    cantidad:  ${it.qty}\n\n`;
    });

    body += `${sep}\n`;
    body += `TOTAL: ${total} pieza${total === 1 ? '' : 's'} seleccionada${total === 1 ? '' : 's'}\n`;
    body += `${sep}\n\n`;
    body += `Mis datos:\n`;
    body += `  · nombre:    ${name}\n`;
    body += `  · contacto:  ${contact}\n`;
    if (notes) {
      body += `\nComentarios:\n${notes}\n`;
    }
    body += `\n¡Gracias! ♡\n— enviado desde lulitas.designs`;

    const subject = `Nuevo pedido — ${total} pieza${total === 1 ? '' : 's'} de Lulitas Designs`;
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });

  // ---------- Sincronizar entre pestañas ----------
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) updateUI();
  });

  // ---------- Init ----------
  updateUI();
})();
