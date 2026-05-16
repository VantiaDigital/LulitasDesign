/* =============================================================
   Lulitas Designs · main.js
   Nav, drawer, smooth scroll, año footer, loader.
   ============================================================= */

(() => {
  'use strict';

  // ---------- Loader ----------
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 350);
  });
  // Failsafe — siempre ocultar el loader pase lo que pase
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

  // ---------- Smooth scroll para anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Progress bar al hacer scroll ----------
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

  // ---------- Cursor (solo desktop) ----------
  const cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();

    const hoverables = 'a, button, .pf-card, .service-card, .contact-card, .why-card, .about-frame, .nav-cta';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ---------- Active nav link mientras scrolleás ----------
  const sections = ['hero', 'servicios', 'proceso', 'portfolio', 'sobre', 'contacto']
    .map(id => document.getElementById(id)).filter(Boolean);
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

  // ---------- Tilt sutil de portfolio cards ----------
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.pf-card').forEach(card => {
      const art = card.querySelector('.pf-art');
      if (!art) return;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `translateY(-4px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
