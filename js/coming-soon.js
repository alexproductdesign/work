/* "Coming soon" pill that follows the cursor over disabled nav items. */
(function () {
  const items = document.querySelectorAll('.coming-soon');
  if (!items.length) return;

  const tip = document.createElement('div');
  tip.className = 'coming-soon-tip';
  tip.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    'Coming soon';
  document.body.appendChild(tip);

  function move(e) {
    tip.style.left = (e.clientX + 16) + 'px';
    tip.style.top = (e.clientY + 20) + 'px';
  }

  items.forEach(function (el) {
    el.addEventListener('pointerenter', function (e) {
      tip.classList.add('is-visible');
      move(e);
    });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', function () {
      tip.classList.remove('is-visible');
    });
    el.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();

/* Eyes pill that follows the cursor over live work cards. */
(function () {
  const cards = document.querySelectorAll('.grid-card:not(.coming-soon)');
  if (!cards.length) return;

  const tip = document.createElement('div');
  tip.className = 'view-tip';
  tip.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<ellipse cx="8.6" cy="12" rx="4.3" ry="5.6" fill="#ffffff"/>' +
    '<ellipse cx="15.4" cy="12" rx="4.3" ry="5.6" fill="#ffffff"/>' +
    '<circle cx="9.8" cy="12.8" r="1.7" fill="#101012"/>' +
    '<circle cx="16.6" cy="12.8" r="1.7" fill="#101012"/>' +
    '</svg>';
  document.body.appendChild(tip);

  function move(e) {
    tip.style.left = (e.clientX + 16) + 'px';
    tip.style.top = (e.clientY + 20) + 'px';
  }

  cards.forEach(function (el) {
    el.addEventListener('pointerenter', function (e) {
      tip.classList.add('is-visible');
      move(e);
    });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', function () {
      tip.classList.remove('is-visible');
    });
  });
})();
