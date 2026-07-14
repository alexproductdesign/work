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
