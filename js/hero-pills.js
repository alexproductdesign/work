/* Falling, colliding, draggable skill pills in the hero — powered by
   Matter.js (loaded from CDN in index.html). Falls back to a static
   arrangement when the engine or animation frames are unavailable. */
(function () {
  const stage = document.getElementById('pill-stage');
  if (!stage) return;

  // on narrow screens, drop the longest pills so the pile isn't overcrowded
  const els = Array.from(stage.querySelectorAll('.pill')).filter(function (el) {
    if (window.innerWidth <= 860 && el.hasAttribute('data-mhide')) {
      el.style.display = 'none';
      return false;
    }
    return true;
  });

  // Wait for webfonts so pill widths are measured correctly (with a
  // timeout fallback in case the fonts CDN is slow or unreachable).
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((res) => setTimeout(res, 1200)),
  ]);
  fontsReady.then(init);

  /* Static fallback: a loose organic pile near the bottom. Used when
     Matter.js failed to load or animation frames never fire. */
  function placeStatic() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    let cursorX = 12;
    els.forEach((el) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (cursorX + w > W - 12) cursorX = 12 + Math.random() * 50;
      const x = Math.min(cursorX, W - w - 12);
      const y = H - 46 - h - Math.random() * 120;
      const a = Math.random() * 20 - 10;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + a + 'deg)';
      el.style.visibility = 'visible';
      cursorX += w * (0.78 + Math.random() * 0.2);
    });
  }

  function init() {
    if (typeof Matter === 'undefined') { placeStatic(); return; }

    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Sleeping, Events } = Matter;

    let W = stage.clientWidth;
    let H = stage.clientHeight;

    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.4;

    // pill bodies: rounded rectangles (chamfer ≈ capsule)
    const bodies = els.map((el, i) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = 40 + Math.random() * Math.max(60, W - 80);
      const y = -h - 80 - i * 110 - Math.random() * 60;
      const body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: Math.min(h / 2 - 1, 26) },
        angle: (Math.random() * 16 - 8) * Math.PI / 180,
        restitution: 0.25,
        friction: 0.6,
        frictionAir: 0.012,
        density: 0.0018,
        sleepThreshold: 40,
      });
      body.el = el;
      body.w = w;
      body.h = h;
      return body;
    });

    function walls() {
      const t = 200; // thickness
      return [
        Bodies.rectangle(W / 2, H - 46 + t / 2, W * 3, t, { isStatic: true }), // floor
        Bodies.rectangle(-t / 2, H / 2 - H, t, H * 4, { isStatic: true }),     // left
        Bodies.rectangle(W + t / 2, H / 2 - H, t, H * 4, { isStatic: true }),  // right
      ];
    }
    let wallBodies = walls();
    Composite.add(engine.world, [...bodies, ...wallBodies]);

    // drag with the mouse / finger
    const mouse = Mouse.create(stage);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.15, damping: 0.15, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);
    // let the page still scroll over the hero: don't capture the wheel,
    // and on touch screens leave scrolling to the browser (pills are
    // then display-only there, which beats trapping the page)
    mouse.element.removeEventListener('wheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    mouse.element.removeEventListener('touchstart', mouse.mousedown);
    mouse.element.removeEventListener('touchmove', mouse.mousemove);
    mouse.element.removeEventListener('touchend', mouse.mouseup);

    Events.on(mouseConstraint, 'startdrag', (e) => {
      if (e.body) { Sleeping.set(e.body, false); e.body.el.style.zIndex = 30; }
    });
    Events.on(mouseConstraint, 'enddrag', (e) => {
      if (e.body) e.body.el.style.zIndex = '';
    });

    // keep DOM in sync with physics
    let frames = 0;
    function render() {
      frames += 1;
      bodies.forEach((b) => {
        const x = b.position.x - b.w / 2;
        const y = b.position.y - b.h / 2;
        b.el.style.transform =
          'translate(' + x + 'px,' + y + 'px) rotate(' + (b.angle * 180 / Math.PI) + 'deg)';
      });
      requestAnimationFrame(render);
    }

    els.forEach((el) => { el.style.visibility = 'visible'; });
    const runner = Runner.create();
    Runner.run(runner, engine);
    requestAnimationFrame(render);

    // background tabs never fire animation frames — place pills
    // statically so the hero is never empty
    setTimeout(() => {
      if (frames < 5) {
        Runner.stop(runner);
        placeStatic();
      }
    }, 900);

    // re-fit the world on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = stage.clientWidth;
        H = stage.clientHeight;
        Composite.remove(engine.world, wallBodies);
        wallBodies = walls();
        Composite.add(engine.world, wallBodies);
        bodies.forEach((b) => {
          Sleeping.set(b, false);
          if (b.position.x > W - 20) Body.setPosition(b, { x: W - b.w / 2 - 20, y: b.position.y });
        });
      }, 250);
    });
  }
})();
