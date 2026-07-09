/* Motion, split into independent pieces:
   1. fade-up reveal — ONLY the project cards on the home grid
   2. count-up — impact numbers on case pages
   3. draw-on wipe — charts flagged with data-anim
   Progressive enhancement: hidden/animated states are added by JS only,
   so with no JS (or reduced-motion) everything stays visible. */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 2. count-up ----------
  function countUp(el) {
    const raw = el.textContent.trim();
    const m = raw.match(/^(\D*?)(-?\d+(?:\.\d+)?)(.*)$/s);
    if (!m) return;                       // no number (e.g. "No devs") → leave as is
    const prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
    const decimals = (m[2].split('.')[1] || '').length;
    const dur = 1100, t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);   // ease-out cubic
      el.textContent = prefix + (target * e).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    el.textContent = prefix + (0).toFixed(decimals) + suffix;
    requestAnimationFrame(tick);
  }

  if (reduced) return;  // leave numbers/charts/cards at their final, visible state

  // ---------- 1. fade-up: home project cards only ----------
  const cards = Array.from(document.querySelectorAll('.work-grid .grid-card'));
  if (cards.length) {
    cards.forEach(function (c, i) {
      c.classList.add('reveal');
      if (i % 2) c.style.transitionDelay = '80ms';   // stagger the right column
    });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    cards.forEach(function (c) { io.observe(c); });
  }

  // ---------- 2 + 3: count-up numbers & chart wipes (no fade) ----------
  const watch = [];
  document.querySelectorAll('.impact-num').forEach(function (n) { watch.push(n); });
  document.querySelectorAll('[data-anim]').forEach(function (c) { watch.push(c); });
  if (watch.length) {
    const io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.classList.contains('impact-num')) countUp(el);
        if (el.dataset && el.dataset.anim) el.classList.add('anim-run');
        io2.unobserve(el);
      });
    }, { threshold: 0.3 });
    watch.forEach(function (el) { io2.observe(el); });
  }
})();
