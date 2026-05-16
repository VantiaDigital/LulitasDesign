/* =============================================================
   Lulitas Designs · main.js  ·  v2
   Sin cursor custom. Nav, drawer, smooth scroll, año footer.
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

  // ---------- Smooth scroll a anchors ----------
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
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = `${Math.min(100, Math.max(0, scrolled * 100))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Active nav link mientras scrolleás ----------
  const sectionIds = ['servicios', 'proceso', 'portfolio', 'sobre', 'contacto'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-links a');

  if (sections.length && navLinks.length) {
    const setActive = id => {
      navLinks.forEach(a => {
        const isMatch = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('is-active', isMatch);
      });
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          setActive(entry.target.id);
        }
      });
    }, { threshold: [0.35, 0.6] });
    sections.forEach(s => observer.observe(s));
  }

})();
