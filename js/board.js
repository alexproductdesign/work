/* About board: live Berlin clock + draggable cards. */
(function () {
  // ---- Berlin weather (Open-Meteo, no key needed) ----
  const weather = document.getElementById('board-weather');
  if (weather) {
    const sub = document.getElementById('board-weather-sub');
    const icons = [
      [0, '☀️ clear'], [1, '🌤 mostly clear'], [2, '⛅ partly cloudy'], [3, '☁️ overcast'],
      [48, '🌫 fog'], [57, '🌦 drizzle'], [67, '🌧 rain'], [77, '❄️ snow'],
      [82, '🌦 showers'], [86, '❄️ snow showers'], [99, '⛈ thunderstorm'],
    ];
    fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current=temperature_2m,weather_code')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        const t = Math.round(d.current.temperature_2m);
        const code = d.current.weather_code;
        const label = (icons.find(function (i) { return code <= i[0]; }) || icons[0])[1];
        weather.textContent = t + '°C';
        if (sub) sub.textContent = label;
      })
      .catch(function () { /* leave the placeholder */ });
  }

  // ---- drag ----
  const board = document.getElementById('board');
  if (!board) return;

  // ---- entrance: cards fade up with a stagger on load ----
  // (Web Animations API so it releases after finishing and never
  //  fights the drag transform set inline by the handlers below.)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // mobile lays the board out as a static vertical column (≤900px):
    // a springy scale/rotate fly-in reads as a harsh bounce there, so use
    // a gentle fade-up instead. The playful fly-in stays on wider screens.
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    const cards = board.querySelectorAll('.bc');
    cards.forEach(function (card, i) {
      const rNum = parseFloat(card.style.getPropertyValue('--r')) || 0;
      if (mobile) {
        const r = (rNum / 2) + 'deg';   // matches the halved tilt of the mobile layout
        card.animate(
          [
            { opacity: 0, transform: 'translateY(18px) rotate(' + r + ')' },
            { opacity: 1, transform: 'translateY(0) rotate(' + r + ')' }
          ],
          { duration: 440, delay: 50 + i * 45, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'backwards' }
        );
      } else {
        const startRot = (rNum + 10) + 'deg';   // extra tilt that settles to --r
        const endRot = rNum + 'deg';
        card.animate(
          [
            { opacity: 0, transform: 'translateY(34px) scale(0.5) rotate(' + startRot + ')' },
            { opacity: 1, transform: 'translateY(0) scale(1) rotate(' + endRot + ')' }
          ],
          { duration: 620, delay: 90 + i * 65, easing: 'cubic-bezier(0.34, 1.45, 0.5, 1)', fill: 'backwards' }
        );
      }
    });
  }

  board.querySelectorAll('.bc').forEach(function (card) {
    let sx = 0, sy = 0, dx = 0, dy = 0, moved = false;
    // links would otherwise start a native drag and swallow pointermove
    card.addEventListener('dragstart', function (e) { e.preventDefault(); });
    const base = { dx: 0, dy: 0 };

    card.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      // touch drags only on wide screens (mobile layout is a static column)
      if (e.pointerType !== 'mouse' && window.innerWidth <= 900) return;
      if (getComputedStyle(card).position !== 'absolute') return;
      sx = e.clientX; sy = e.clientY; moved = false;
      card.setPointerCapture(e.pointerId);
      card.classList.add('dragging');

      function onMove(ev) {
        dx = base.dx + (ev.clientX - sx);
        dy = base.dy + (ev.clientY - sy);
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = true;
        card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(var(--r))';
      }
      function onUp(ev) {
        base.dx = dx; base.dy = dy;
        card.classList.remove('dragging');
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerup', onUp);
        card.removeEventListener('pointercancel', onUp);
        // swallow the click after a real drag so links/buttons don't fire
        if (moved) {
          card.addEventListener('click', function block(ce) {
            ce.stopPropagation(); ce.preventDefault();
            card.removeEventListener('click', block, true);
          }, true);
        }
      }
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerup', onUp);
      card.addEventListener('pointercancel', onUp);
    });
  });
})();
