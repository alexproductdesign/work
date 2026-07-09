/* Cover parallax: the screen inside a project card drifts after the
   cursor and zooms slightly. Skipped for touch and reduced motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.grid-card').forEach(function (card) {
    const target = card.querySelector('.grid-cover img, .grid-cover .cover-statement');
    if (!target) return;

    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      target.style.transform =
        'scale(1.05) translate(' + (x * -12).toFixed(1) + 'px,' + (y * -9).toFixed(1) + 'px)';
    });

    card.addEventListener('pointerleave', function () {
      target.style.transform = '';
    });
  });
})();
