/* =============================================================
   Lulitas Designs · animations.js  ·  v2
   IntersectionObserver para reveals + count-up de stats.
   Sin cursor, sin parallax pesado.
   ============================================================= */

(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Mostrar todo sin animar
    document.querySelectorAll(
      '[data-reveal], .polaroid, .tag-card, .why-sticker, .check-item, .channel, .letter-stats'
    ).forEach(el => el.classList.add('is-in'));
    return;
  }

  // ---------- Observer genérico ----------
  const generalSelector = [
    '[data-reveal]',
    '.polaroid',
    '.tag-card',
    '.why-sticker',
    '.check-item',
    '.channel',
    '.letter-stats',
    '.note',
    '.notebook',
    '.photo-frame'
  ].join(',');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll(generalSelector).forEach(el => observer.observe(el));

  // ---------- Stagger en checklist ----------
  const checkItems = document.querySelectorAll('.check-item');
  const checkObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.parentElement.querySelectorAll('.check-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('is-in'), i * 180);
        });
        checkObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  if (checkItems.length) checkObserver.observe(checkItems[0]);

  // ---------- Count-up en stats ----------
  const animateNumber = (el) => {
    const text = el.textContent.trim();
    const match = text.match(/^([+])?(\d+)(%)?$/);
    if (!match) return;
    const prefix = match[1] || '';
    const target = parseInt(match[2], 10);
    const suffix = match[3] || '';
    const duration = 1300;
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
        entry.target.querySelectorAll('strong').forEach(animateNumber);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.letter-stats').forEach(s => countObserver.observe(s));

  // ---------- Tilt micro de doodles con scroll (parallax muy suave) ----------
  const doodles = document.querySelectorAll('.doodle, .badge-handmade');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      doodles.forEach((d, i) => {
        const speed = (i % 2 === 0 ? .08 : -.06) + (i * 0.005);
        d.style.translate = `0 ${y * speed}px`;
      });
      ticking = false;
    });
    ticking = true;
  };
  if (doodles.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

})();
