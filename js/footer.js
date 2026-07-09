/* Footer: eyes that follow the cursor + copy-email button. */
(function () {
  // --- eyes ---
  const eyes = Array.from(document.querySelectorAll('.d-eye'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (eyes.length && !reduced) {
    let px = null, py = null, raf = null;

    function update() {
      raf = null;
      eyes.forEach(function (eye) {
        const r = eye.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const a = Math.atan2(dy, dx);
        // elliptical travel, keeps the pupil inside the egg shape
        const rx = r.width * 0.20;
        const ry = r.height * 0.24;
        const d = Math.min(1, Math.hypot(dx, dy) / 300);
        const pupil = eye.firstElementChild;
        pupil.style.transform =
          'translate(' + (Math.cos(a) * rx * d).toFixed(1) + 'px,' +
          (Math.sin(a) * ry * d).toFixed(1) + 'px)';
      });
    }

    document.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  // --- scroll reveal: hill, eyes and text ride up as footer enters ---
  const footer = document.querySelector('.dome-footer');
  if (footer && !reduced) {
    const hill = footer.querySelector('.dome-bg');
    const eyesWrap = footer.querySelector('.dome-eyes');
    const content = footer.querySelector('.dome-content');
    let ticking = null;

    function reveal() {
      ticking = null;
      const r = footer.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the footer just peeks in, 1 when its top reaches ~1/4 of screen
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      const e = 1 - Math.pow(1 - p, 3); // ease-out
      const rise = (1 - e) * 300;
      hill.style.transform = 'translateX(-50%) translateY(' + rise.toFixed(1) + 'px)';
      eyesWrap.style.transform = 'translateY(' + rise.toFixed(1) + 'px)';
      content.style.transform = 'translateY(' + (rise * 0.6).toFixed(1) + 'px)';
      content.style.opacity = (0.15 + 0.85 * e).toFixed(2);
    }

    document.addEventListener('scroll', function () {
      if (!ticking) ticking = requestAnimationFrame(reveal);
    }, { passive: true });
    reveal();
  }

  // --- copy email ---
  document.querySelectorAll('.js-copy-email').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // visual feedback fires on click, independent of clipboard permission
      const node = btn.childNodes[0];
      const original = node.textContent;
      node.textContent = 'Copied! ';
      setTimeout(function () { node.textContent = original; }, 1500);
      const wrap = document.querySelector('.dome-eyes');
      if (wrap) {
        wrap.classList.add('is-blinking');
        setTimeout(function () { wrap.classList.remove('is-blinking'); }, 460);
      }
      try { navigator.clipboard && navigator.clipboard.writeText(btn.dataset.email); } catch (e) {}
    });
  });
})();
