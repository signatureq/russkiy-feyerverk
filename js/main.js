(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка и меню ---------- */
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Кнопка звонка на телефоне ---------- */
  var mobileCall = document.querySelector('.mobile-call');
  var contacts = document.getElementById('contacts');
  var contactsVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      contactsVisible = entries[0].isIntersecting;
      updateMobileCall();
    }, { threshold: 0.15 }).observe(contacts);
  }
  function updateMobileCall() {
    mobileCall.classList.toggle('is-visible', window.scrollY > 520 && !contactsVisible);
  }
  window.addEventListener('scroll', updateMobileCall, { passive: true });

  /* ---------- Появление при прокрутке ---------- */
  var revealGroups = [
    '.section-head', '.split-head > *', '.range', '.brands', '.clients',
    '.g-item', '.benefit', '.term', '.discounts', '.b-item',
    '.return-info', '.steps', '.about-photo', '.about-card', '.cert', '.contacts-info', '.map'
  ];
  var revealEls = document.querySelectorAll(revealGroups.join(','));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.matches(revealGroups.join(','));
      });
      var i = siblings.indexOf(el);
      el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  var ladder = document.getElementById('ladder');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ladderObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        ladder.classList.add('is-in');
        ladderObserver.disconnect();
      }
    }, { threshold: 0.2 });
    ladderObserver.observe(ladder);
  } else {
    ladder.classList.add('is-in');
  }

  /* ---------- Калькулятор скидки ---------- */
  var input = document.getElementById('calc-input');
  var range = document.getElementById('calc-range');
  var outPercent = document.getElementById('calc-percent');
  var outSave = document.getElementById('calc-save');
  var result = outPercent.closest('.calc-result');
  var rows = Array.prototype.slice.call(ladder.querySelectorAll('li'));
  var fmt = new Intl.NumberFormat('ru-RU');

  var MIN = 10000, MAX = 5000000;
  function amountFromRange(v) {
    var a = MIN * Math.pow(MAX / MIN, v / 1000);
    var step = a < 100000 ? 1000 : a < 1000000 ? 5000 : 50000;
    return Math.round(a / step) * step;
  }
  function rangeFromAmount(a) {
    a = Math.min(Math.max(a, MIN), MAX);
    return Math.round(1000 * Math.log(a / MIN) / Math.log(MAX / MIN));
  }
  function paintRange() {
    range.style.setProperty('--p', (range.value / 10) + '%');
  }

  function update(amount) {
    var active = null;
    rows.forEach(function (row) {
      if (amount >= Number(row.dataset.min)) active = row;
    });
    rows.forEach(function (row) { row.classList.toggle('is-active', row === active); });

    result.classList.remove('is-small');
    if (!active) {
      outPercent.textContent = '-';
      outSave.textContent = 'первый заказ от 20 000 ₽';
      result.classList.add('is-small');
    } else if (!active.dataset.pct) {
      outPercent.textContent = 'особая';
      outSave.textContent = 'согласуем лично';
      result.classList.add('is-small');
    } else {
      var pct = Number(active.dataset.pct);
      outPercent.textContent = pct + '%';
      outSave.textContent = fmt.format(Math.round(amount * pct / 100)) + ' ₽';
    }
  }

  function parseInput() {
    return Number(input.value.replace(/\D/g, '')) || 0;
  }

  input.addEventListener('input', function () {
    var amount = parseInput();
    var caret = input.value.length - input.selectionStart;
    input.value = amount ? fmt.format(amount) : '';
    var pos = Math.max(0, input.value.length - caret);
    input.setSelectionRange(pos, pos);
    range.value = rangeFromAmount(amount);
    paintRange();
    update(amount);
  });
  range.addEventListener('input', function () {
    var amount = amountFromRange(Number(range.value));
    input.value = fmt.format(amount);
    paintRange();
    update(amount);
  });

  var initial = parseInput();
  input.value = fmt.format(initial);
  range.value = rangeFromAmount(initial);
  paintRange();
  update(initial);

  /* ---------- Просмотр фото ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox.querySelector('img');
  var lbCap = lightbox.querySelector('figcaption');
  var lbItems = [];
  var lbIndex = 0;

  function showItem(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var link = lbItems[lbIndex];
    var thumb = link.querySelector('img');
    lbImg.src = link.getAttribute('href');
    lbImg.alt = thumb ? thumb.alt : '';
    lbCap.textContent = (thumb ? thumb.alt : '') + '  ·  ' + (lbIndex + 1) + ' / ' + lbItems.length;
  }

  if (typeof lightbox.showModal === 'function') {
    document.querySelectorAll('[data-gallery]').forEach(function (group) {
      var links = Array.prototype.slice.call(group.querySelectorAll('a'));
      links.forEach(function (link, i) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          lbItems = links;
          showItem(i);
          lightbox.showModal();
        });
      });
    });

    lightbox.querySelector('.lb-close').addEventListener('click', function () { lightbox.close(); });
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { showItem(lbIndex - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { showItem(lbIndex + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showItem(lbIndex - 1);
      if (e.key === 'ArrowRight') showItem(lbIndex + 1);
    });
    lightbox.addEventListener('close', function () { lbImg.removeAttribute('src'); });

    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showItem(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Салют на фоне ---------- */
  var COLORS = ['#FFC824', '#FFD966', '#FFB13B', '#FF8A3D', '#FF5A3D', '#FFF4CC'];

  function fireworks(canvas, opts) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var rockets = [], sparks = [];
    var running = false, visible = false, rafId = 0, last = 0, nextLaunch = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function launch() {
      var zones = opts.zones;
      var zone = zones[Math.floor(Math.random() * zones.length)];
      var x = W * rand(zone[0], zone[1]);
      var targetY = H * rand(opts.top[0], opts.top[1]);
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      rockets.push({ x: x, y: H + 10, tx: x + rand(-40, 40), ty: targetY, color: color, t: 0, dur: rand(55, 80) });
    }

    function burst(x, y, color) {
      var count = Math.round(rand(opts.sparks[0], opts.sparks[1]) * (W < 700 ? 0.6 : 1));
      var power = rand(2.2, 3.6) * (W < 700 ? 0.75 : 1);
      var second = Math.random() < 0.35 ? COLORS[Math.floor(Math.random() * COLORS.length)] : color;
      for (var i = 0; i < count; i++) {
        var a = (Math.PI * 2 * i) / count + rand(-0.05, 0.05);
        var s = power * rand(0.55, 1);
        sparks.push({
          x: x, y: y,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0, max: rand(55, 85),
          color: i % 2 ? color : second,
          size: rand(1.1, 2.1)
        });
      }
    }

    function frame(now) {
      if (!running) return;
      var dt = Math.min((now - last) / 16.67, 3);
      last = now;

      if (now > nextLaunch) {
        launch();
        nextLaunch = now + rand(opts.every[0], opts.every[1]);
      }

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + (0.22 * dt) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i];
        r.t += dt;
        var k = Math.min(r.t / r.dur, 1);
        var e = 1 - Math.pow(1 - k, 3);
        var px = r.x + (r.tx - r.x) * e;
        var py = (H + 10) + (r.ty - (H + 10)) * e;
        ctx.fillStyle = 'rgba(255, 230, 170, ' + (0.9 - k * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (k >= 1) {
          burst(px, py, r.color);
          rockets.splice(i, 1);
        }
      }

      for (var j = sparks.length - 1; j >= 0; j--) {
        var p = sparks[j];
        p.life += dt;
        p.vx *= Math.pow(0.965, dt);
        p.vy = p.vy * Math.pow(0.965, dt) + 0.035 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var alpha = 1 - p.life / p.max;
        if (alpha <= 0) { sparks.splice(j, 1); continue; }
        ctx.globalAlpha = alpha * opts.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(frame);
    }

    function setRunning() {
      var should = visible && !document.hidden;
      if (should && !running) {
        running = true;
        last = performance.now();
        nextLaunch = last + 300;
        rafId = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', setRunning);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning();
    }).observe(canvas);
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var heroCanvas = document.querySelector('.hero-canvas');
    var contactsCanvas = document.querySelector('.contacts-canvas');
    if (heroCanvas) {
      fireworks(heroCanvas, {
        zones: [[0.05, 0.45], [0.55, 0.95]],
        top: [0.08, 0.42],
        every: [700, 1500],
        sparks: [60, 95],
        alpha: 0.9
      });
    }
    if (contactsCanvas) {
      fireworks(contactsCanvas, {
        zones: [[0.05, 0.95]],
        top: [0.08, 0.35],
        every: [1400, 2600],
        sparks: [50, 80],
        alpha: 0.55
      });
    }
  }

  /* ---------- Год в подвале ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
