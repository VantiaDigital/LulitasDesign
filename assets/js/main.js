/* =============================================================
   Lulitas Designs · main.js  ·  v3
   Sin cursor custom. Nav, drawer, smooth scroll a anchors locales,
   active link por pathname (multipágina), año footer, loader.
   ============================================================= */

(() => {
  'use strict';

  // ---------- Loader ----------
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 350);
  });
  setTimeout(() => loader && loader.classList.add('is-hidden'), 2200);

  // ---------- Año footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile drawer ----------
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('drawer');
  const closeDrawer = () => {
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    drawer?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  };
  const openDrawer = () => {
    burger?.classList.add('is-open');
    burger?.setAttribute('aria-expanded', 'true');
    drawer?.classList.add('is-open');
    drawer?.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  };
  burger?.addEventListener('click', () => {
    burger.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // ---------- Smooth scroll para anchors locales (#xxx) ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Progress bar ----------
  const progress = document.createElement('div');
  progress.className = 'progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progress.style.width = `${Math.min(100, Math.max(0, scrolled * 100))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Vantia link: forzar apertura en nueva pestaña ----------
  // Algunos entornos sandbox bloquean target=_blank; este fallback
  // garantiza que el credit del footer siempre vaya a vantia.digital.
  document.querySelectorAll('a.vantia-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const url = link.href;
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = url; // fallback si popups bloqueados
    });
  });

  // ---------- Active nav link según página actual ----------
  // body[data-page="servicios"] → marca <a href="...servicios.html">
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll('.nav-links a, .drawer-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const matchesPage = href.endsWith(`${page}.html`);
      const matchesHome = page === 'home' && (href.endsWith('index.html') || href === 'index.html');
      if (matchesPage || matchesHome) a.classList.add('is-active');
    });
  }

})();
