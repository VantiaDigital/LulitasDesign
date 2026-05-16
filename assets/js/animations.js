/* =============================================================
   Lulitas Designs · animations.js
   Reveals on scroll, parallax decorativo, count-up stats.
   ============================================================= */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Mostrar todo sin animar
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
    return;
  }

  // ---------- IntersectionObserver para reveals ----------
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-in'), delay);
        // marcar también el step y stat parent si aplica
        el.closest('.step')?.classList.add('is-in');
        el.closest('.stat')?.classList.add('is-in');
        if (el.classList.contains('pf-card')) el.classList.add('is-in');
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // Steps observan independientemente para activar línea/num
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        stepObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.step').forEach(s => stepObserver.observe(s));

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat').forEach(s => statObserver.observe(s));

  // ---------- Count-up de stats (números con + o %) ----------
  const animateNumber = (el) => {
    const text = el.textContent.trim();
    const match = text.match(/^([+])?(\d+)(%)?$/);
    if (!match) return;
    const prefix = match[1] || '';
    const target = parseInt(match[2], 10);
    const suffix = match[3] || '';
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      el.textContent = `${prefix}${current}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat strong').forEach(animateNumber);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.about-stats').forEach(s => countObserver.observe(s));

  // ---------- Parallax suave de hero decoraciones ----------
  const parallaxEls = [
    { el: document.querySelector('.hero-deco-1'), speed: 0.12 },
    { el: document.querySelector('.hero-deco-2'), speed: -0.10 },
    { el: document.querySelector('.hero-monogram'), speed: 0.18 },
    { el: document.querySelector('.hero-deco-3'), speed: 0.2 },
    { el: document.querySelector('.hero-deco-4'), speed: -0.16 },
    { el: document.querySelector('.hero-deco-5'), speed: 0.14 },
  ].filter(p => p.el);

  let ticking = false;
  const onParallax = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      parallaxEls.forEach(({ el, speed }) => {
        const ty = y * speed;
        el.style.transform = `translateY(${ty}px)`;
      });
      ticking = false;
    });
    ticking = true;
  };
  window.addEventListener('scroll', onParallax, { passive: true });
  onParallax();

  // ---------- Mouse parallax sutil del monograma hero ----------
  const heroMono = document.querySelector('.hero-monogram');
  const hero = document.querySelector('.hero');
  if (heroMono && hero && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      heroMono.style.transform = `translateY(${window.scrollY * 0.18}px) translate(${px * 18}px, ${py * 18}px)`;
    });
  }

  // ---------- Marquee duplicate guard (asegurar loop suave) ----------
  // ya está duplicado en HTML

  // ---------- Eyebrow dot pulse on hover ----------
  document.querySelectorAll('.eyebrow').forEach(eb => {
    eb.addEventListener('mouseenter', () => {
      const dot = eb.querySelector('.eyebrow-dot');
      if (dot) {
        dot.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }],
          { duration: 500, easing: 'ease-out' }
        );
      }
    });
  });

})();
