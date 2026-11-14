/* Zante Hair · homepage interactions (mock-up) */
(function () {
  'use strict';

  var Hair = window.ZanteHair;
  var TEX = Hair.TEXTURES, COL = Hair.COLOURS;
  var html = document.documentElement;
  var reduced = Hair.reduced;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var narrow = window.matchMedia('(max-width: 860px)');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(n) { return 'R' + Math.round(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 }).replace(/,/g, ' '); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tween(from, to, ms, cb) {
    if (reduced) { cb(to); return; }
    var t0 = performance.now();
    (function step(now) {
      var p = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3);
      cb(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ======================= DATA (sample content) =======================
  var PRODUCTS = [
    { id: 'thandi', name: 'Thandi Glueless Wig', cat: 'wigs', img: 'p-thandi', pos: '50% 18%', texture: 'body', colour: '1b', spec: '13x4 HD lace · 180% · glueless', lengths: [18, 22, 26], prices: [3650, 3950, 4450], badge: 'Signature', install: ['glueless'], vibe: ['waves'] },
    { id: 'naledi', name: 'Naledi Loose Wave Wig', cat: 'wigs', img: 'p-naledi', pos: '68% 40%', texture: 'body', style: 'Loose Wave', colour: '1b', spec: '5x5 HD closure · 180% · jet black', lengths: [20, 24, 28], prices: [2650, 2890, 3290], badge: 'Bestseller', install: ['glueless', 'quick'], vibe: ['waves', 'sleek'] },
    { id: 'amahle', name: 'Amahle Kinky Curly Wig', cat: 'wigs', img: 'p-amahle', pos: '50% 22%', texture: 'kinkyCurly', colour: '1b', spec: 'Headband or glueless · 250% · 4C blend', lengths: [14, 16, 18], prices: [2150, 2350, 2550], badge: 'No glue', install: ['quick', 'glueless'], vibe: ['curls'] },
    { id: 'lerato', name: 'Lerato Curly Wig', cat: 'wigs', img: 'p-lerato', pos: '50% 26%', texture: 'deep', style: 'Curly', colour: '1b', spec: '4x4 closure · 200% · bouncy curls', lengths: [16, 20], prices: [2450, 2790], badge: 'New drop', install: ['glueless', 'quick'], vibe: ['curls'] },
    { id: 'deepwave', name: 'Raw Deep Wave Bundles', cat: 'bundles', img: 'p-deepwave-bundles', pos: '62% 38%', texture: 'deep', colour: '1b', spec: '100 g · double weft · single donor', lengths: [16, 20, 24], prices: [960, 1120, 1290], badge: 'Bestseller', install: ['sewin'], vibe: ['curls', 'waves'], sets: 3 },
    { id: 'ombre', name: 'Ombre Body Wave Bundles', cat: 'bundles', img: 'p-ombre-bundles', pos: '50% 40%', texture: 'body', colour: 'ombre', spec: '100 g · bulk hair · tied', lengths: [18, 22, 26], prices: [1150, 1290, 1490], badge: 'New', install: ['sewin'], vibe: ['waves'], sets: 3 },
    { id: 'honey', name: 'Honey Blonde Wave Bundle', cat: 'bundles', img: 'p-honey-bundle', pos: '50% 50%', texture: 'body', colour: '27', spec: '100 g · double weft · colour 27', lengths: [18, 22], prices: [990, 1150], install: ['sewin'], vibe: ['waves'], sets: 3 },
    { id: 'platinum', name: 'Platinum 613 Bundle', cat: 'bundles', img: 'p-platinum-bundle', pos: '50% 45%', texture: 'straight', colour: '613', spec: '100 g · pre-lightened · tones easily', lengths: [16, 20, 24], prices: [1050, 1190, 1350], badge: 'Colour ready', install: ['sewin'], vibe: ['sleek'], sets: 3 }
  ];
  function styleOf(p) { return p.style || TEX[p.texture].label; }

  var REVIEWS = [
    ['The body wave survived a Durban summer and still bounces.', 'Nomsa K.', 'Durban', 'Body Wave Bundle, 22"', '#8C5A80', '#E7C3D3'],
    ['Glueless means I was ready for church in fifteen minutes.', 'Lindiwe M.', 'Soweto', 'Thandi Glueless Wig, 22"', '#2B1D2E', '#B07FA3'],
    ['The HD lace actually melted on my skin tone. No tinting at all.', 'Refilwe S.', 'Pretoria', '13x4 HD Lace Frontal', '#7A2238', '#E7C3D3'],
    ['Zante Mauve is the colour everyone stops me to ask about.', 'Ayanda T.', 'Cape Town', 'Thandi Glueless Wig, 26"', '#A9B2C6', '#8C5A80'],
    ['Ordered at nine, wearing it by five. Same-day is real.', 'Kgothatso D.', 'Midrand', 'Naledi Bob Wig, 12"', '#C4904F', '#2B1D2E'],
    ['Three bundles, full head, zero shedding after a month.', 'Precious N.', 'Bloemfontein', 'Deep Wave Bundle, 20"', '#3E2718', '#C4904F'],
    ['The headband wig blends with my 4C hair perfectly.', 'Zanele B.', 'Pietermaritzburg', 'Amahle Headband Wig, 16"', '#2B1D2E', '#E7C3D3'],
    ['Bought the 99J for my birthday. A proper soft life moment.', 'Thato R.', 'Polokwane', 'Lerato Frontal Wig, 24"', '#651A2D', '#F7AFC3']
  ];

  var TEX_BASE = { straight: 650, body: 720, deep: 780, kinkyStraight: 760, kinkyCurly: 820 };
  var COL_ADD = { '1b': 0, mauve: 180, '27': 140, '99j': 140, '613': 220 };
  var DENSITY = { 150: 1, 180: 1.12, 250: 1.35 };
  function bundlesNeeded(len) { return len <= 20 ? 3 : len <= 26 ? 4 : 5; }
  function quote(c) {
    var steps = (c.length - 10) / 2, add = COL_ADD[c.colour], tb = TEX_BASE[c.texture] - 650;
    if (c.unit === 'bundle') { var per = TEX_BASE[c.texture] + steps * 70 + add, n = bundlesNeeded(c.length); return { total: per * n, per: per, n: n }; }
    if (c.unit === 'closure') return { total: 1050 + steps * 60 + add + tb };
    if (c.unit === 'frontal') return { total: 1450 + steps * 80 + add + tb };
    var w = (2650 + steps * 160 + add * 2 + tb * 2) * DENSITY[c.density || 180];
    return { total: Math.round(w / 10) * 10 };
  }

  // ======================= THEME =======================
  var savedTheme = store('zante-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') html.dataset.theme = savedTheme;
  function isDark() {
    if (html.dataset.theme) return html.dataset.theme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  $('#themeBtn').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    html.dataset.theme = next; store('zante-theme', next);
    Hair.refreshAll();
    toast(next === 'dark' ? 'Night silk on' : 'Pearl mist on');
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { Hair.refreshAll(); });

  // ======================= TOASTS =======================
  function toast(msg, opts) {
    opts = opts || {};
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i></i><span>' + msg + '</span>';
    if (opts.copy) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Copy';
      b.addEventListener('click', function () {
        var code = t.querySelector('code');
        var done = function () { b.textContent = 'Copied'; };
        try {
          navigator.clipboard.writeText(opts.copy).then(done, function () { selectText(code); b.textContent = 'Selected'; });
        } catch (e) { selectText(code); b.textContent = 'Selected'; }
      });
      t.appendChild(b);
    }
    $('#toasts').appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 420); }, opts.ms || 3200);
  }
  function selectText(el) { if (!el) return; var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  // ======================= HERO LOOKS =======================
  var heroEl = $('#hero');
  var LOOKS = {
    body: { texture: 'body', bundle: { texture: 'body', colour: '1b', length: 24 } },
    loose: { texture: 'straight', product: 'naledi' },
    curly: { texture: 'deep', product: 'lerato' },
    kinky: { texture: 'kinkyCurly', product: 'amahle' }
  };
  var look = 'body';
  var hero = new Hair($('#heroCanvas'), {
    layout: 'curtain', texture: 'body', colour: 'mauve', length: 30, fit: 30, top: 0,
    count: narrow.matches ? 110 : 170, grow: true, autoGrow: false, always: true, glow: false, hit: heroEl, seed: 11
  });
  function lookItem(k) {
    var L = LOOKS[k];
    if (L.bundle) {
      var q = quote({ unit: 'bundle', texture: L.bundle.texture, colour: L.bundle.colour, length: L.bundle.length });
      return { key: 'look-body', name: 'Body Wave Bundles × ' + q.n, variant: COL[L.bundle.colour].name + ' 1B · ' + L.bundle.length + '" · ' + q.n * 100 + ' g', spec: 'Natural Black 1B · ' + L.bundle.length + '" · ' + q.n * 100 + ' g', price: q.total, img: 'hero-bodywave', pos: '50% 30%' };
    }
    var p = PRODUCTS.filter(function (x) { return x.id === L.product; })[0], m = Math.floor((p.lengths.length - 1) / 2);
    return { key: p.id + '-' + m, name: p.name, variant: COL[p.colour].name + ' · ' + p.lengths[m] + '"', spec: styleOf(p) + ' · ' + p.lengths[m] + '" · ' + p.spec.split(' · ')[0], price: p.prices[m], img: p.img, pos: p.pos };
  }
  function updateCapsule() {
    var it = lookItem(look);
    $('#capName').textContent = it.name;
    $('#capSpec').textContent = it.spec;
    var el = $('#capPrice'), from = el._v || it.price;
    tween(from, it.price, 600, function (v) { el.textContent = fmt(Math.round(v / 10) * 10); });
    el._v = it.price;
  }
  updateCapsule();

  function choose(group, attr, cb) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[' + attr + ']'); if (!b) return;
      $$('[' + attr + ']', group).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      cb(b.getAttribute(attr), b, e);
    });
  }
  var arch = $('#arch');
  choose($('#heroLooks'), 'data-look', function (v, b, e) {
    if (v === look) return;
    look = v;
    var r = arch.getBoundingClientRect();
    var cx = e && e.clientX ? clamp((e.clientX - r.left) / r.width * 100, 0, 100) : 50;
    $$('.arch-img', arch).forEach(function (img) {
      var on = img.dataset.look === v;
      img.classList.remove('was-on');
      if (img.classList.contains('is-on') && !on) img.classList.add('was-on');
      img.style.setProperty('--cx', (on ? 50 : cx) + '%');
      img.style.setProperty('--cy', on ? '100%' : '50%');
      img.classList.toggle('is-on', on);
    });
    setTimeout(function () { $$('.arch-img.was-on', arch).forEach(function (img) { img.classList.remove('was-on'); }); }, 1150);
    $('#hotspots').classList.toggle('is-off', v !== 'body');
    hero.set({ texture: LOOKS[v].texture });
    hero.flip(0.6);
    updateCapsule();
  });
  // gentle parallax on the arch photo
  arch.addEventListener('pointermove', function (e) {
    if (reduced || e.pointerType !== 'mouse') return;
    var r = arch.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    var img = $('.arch-img.is-on', arch);
    if (img) { img.style.setProperty('--px', (-x * 18).toFixed(1) + 'px'); img.style.setProperty('--py', (-y * 18).toFixed(1) + 'px'); }
  });
  arch.addEventListener('pointerleave', function () { $$('.arch-img', arch).forEach(function (img) { img.style.setProperty('--px', '0px'); img.style.setProperty('--py', '0px'); }); });
  arch.addEventListener('click', function (e) {
    var hs = e.target.closest('.hotspot');
    if (hs) { $$('.hotspot', arch).forEach(function (h) { h.classList.toggle('is-show', h === hs && !h.classList.contains('is-show')); }); return; }
    var t = $('#edit'); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
  $('#capAdd').addEventListener('click', function (e) {
    var it = lookItem(look);
    addToBag({ key: it.key, name: it.name, variant: it.variant, price: it.price, img: it.img, pos: it.pos }, e.currentTarget);
  });

  // ======================= INTRO =======================
  (function intro() {
    var el = $('#intro'), done = false;
    function finish(skipped) {
      if (done) return; done = true;
      if (skipped) html.classList.add('intro-skipped');
      el.classList.add('is-leaving');
      document.body.style.overflow = '';
      setTimeout(function () { hero.regrow(); }, skipped ? 0 : 250);
      setTimeout(function () { el.classList.add('is-gone'); }, 1200);
    }
    if (reduced) { el.classList.add('is-gone'); html.classList.add('intro-skipped'); hero.regrow(); return; }
    document.body.style.overflow = 'hidden';
    var c = $('#introCount');
    tween(0, 100, 2100, function (v) { c.textContent = String(Math.round(v)).padStart(3, '0'); });
    setTimeout(function () { finish(false); }, 2350);
    $('#introSkip').addEventListener('click', function () { finish(true); });
  })();

  // ======================= PEARL GAME =======================
  (function pearls() {
    var spots = [
      ['#pearls', 58, 16, 26, 8], ['#pearls', 90, 26, 18, 10], ['#pearls', 52, 58, 20, 11],
      ['#pearls', 94, 64, 28, 9], ['#lab', 90, 6, 22, 10], ['#club', 6, 18, 24, 12]
    ];
    var found = 0, goal = 5;
    spots.forEach(function (s, i) {
      var host = $(s[0]); if (!host) return;
      var p = document.createElement('button');
      p.type = 'button'; p.className = 'pearl'; p.setAttribute('aria-label', 'Hidden pearl');
      p.style.left = s[1] + '%'; p.style.top = s[2] + '%';
      p.style.setProperty('--s', s[3] + 'px'); p.style.setProperty('--dur', s[4] + 's');
      p.style.animationDelay = (-i * 1.7) + 's';
      if (s[0] !== '#pearls') { p.style.position = 'absolute'; p.style.zIndex = 3; }
      p.addEventListener('click', function (e) {
        if (p.classList.contains('is-popped')) return;
        p.classList.add('is-popped');
        burst(e.clientX, e.clientY, 10);
        found++;
        if (found < goal) toast('Pearl ' + found + ' of ' + goal + '. Keep looking.');
        else if (found === goal) toast('All 5 found. Use <code>SOFTLIFE10</code> for 10% off.', { copy: 'SOFTLIFE10', ms: 7000 });
        setTimeout(function () { p.remove(); }, 500);
      });
      host.appendChild(p);
    });
  })();
  function burst(x, y, n) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      var a = Math.PI * 2 * i / n + Math.random() * 0.4, d = 30 + Math.random() * 40;
      s.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;--tx:' + Math.cos(a) * d + 'px;--ty:' + Math.sin(a) * d + 'px;background:' + (i % 2 ? '#E7C3D3' : '#B07FA3');
      document.body.appendChild(s);
      setTimeout(function (el) { el.remove(); }.bind(null, s), 750);
    }
  }

  // ======================= HEADER =======================
  (function header() {
    var h = $('#header'), fill = $('#progressFill'), lastY = window.scrollY, ticking = false;
    var megaBtn = $('#megaBtn'), mega = $('#mega'), wrap = $('.has-mega'), closeT;
    function setMega(open) {
      mega.classList.toggle('is-open', open);
      megaBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    wrap.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { clearTimeout(closeT); setMega(true); } });
    wrap.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') closeT = setTimeout(function () { setMega(false); }, 180); });
    megaBtn.addEventListener('click', function () { setMega(!mega.classList.contains('is-open')); });
    mega.addEventListener('click', function (e) { if (e.target.closest('a')) setMega(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMega(false); closeMobile(); closeSearch(); closeBag(); } });

    function onScroll() {
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      h.classList.toggle('is-scrolled', y > 40);
      var hide = y > 500 && y > lastY + 4 && !mega.classList.contains('is-open') && !$('#mobileNav').classList.contains('is-open');
      if (hide) h.classList.add('is-hidden'); else if (y < lastY - 4 || y < 500) h.classList.remove('is-hidden');
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    // mobile nav
    var burger = $('#burgerBtn'), mnav = $('#mobileNav');
    burger.addEventListener('click', function () {
      var open = !mnav.classList.contains('is-open');
      mnav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMobile(); });
  })();
  function closeMobile() {
    var m = $('#mobileNav'); if (!m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); $('#burgerBtn').setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }

  // ======================= TEXTURE MARQUEE (scroll velocity) =======================
  (function marquee() {
    var track = $('#texMarquee'); if (!track || reduced) return;
    var x = 0, vel = 0, lastY = window.scrollY, visible = true, raf = 0;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(step); }).observe(track);
    window.addEventListener('scroll', function () { var y = window.scrollY; vel += (y - lastY) * 0.12; lastY = y; }, { passive: true });
    function step() {
      raf = 0;
      if (!visible) return;
      vel *= 0.9;
      var speed = 0.7 + Math.abs(vel);
      x -= speed * (vel < -0.5 ? -1 : 1);
      var half = track.scrollWidth / 2;
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = 'translate3d(' + x + 'px,0,0) skewX(' + clamp(-vel * 0.6, -12, 12) + 'deg)';
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  })();

  // ======================= TEXTURE WALL =======================
  (function wall() {
    var panels = $$('.tex-panel');
    function open(p) {
      panels.forEach(function (x) { x.classList.toggle('is-open', x === p); });
    }
    panels.forEach(function (p) {
      p.setAttribute('data-cursor', 'Open');
      p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') open(p); });
      p.addEventListener('click', function (e) { if (!e.target.closest('a')) open(p); });
      p.addEventListener('focus', function () { open(p); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } });
    });
  })();

  // ======================= PRODUCTS =======================
  var cardHair = {};
  var wishes = new Set();
  (function products() {
    var grid = $('#productGrid');
    grid.innerHTML = PRODUCTS.map(function (p) {
      var mid = Math.floor((p.lengths.length - 1) / 2);
      return '<article class="card" data-id="' + p.id + '" data-cat="' + p.cat + '" data-reveal>' +
        '<div class="card-media" data-cursor="View">' +
          '<img class="card-img" src="assets/img/' + p.img + '.jpg" alt="' + esc(p.name) + ', ' + esc(styleOf(p).toLowerCase()) + ' in ' + esc(COL[p.colour].name.toLowerCase()) + '" style="--pos:' + p.pos + '" loading="lazy">' +
          '<span class="lens" title="Live texture preview"><canvas aria-hidden="true"></canvas></span>' +
          (p.badge ? '<span class="card-badge">' + p.badge + '</span>' : '') +
          '<button type="button" class="card-heart" aria-pressed="false" aria-label="Save ' + esc(p.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" stroke-width="1.6" stroke-linejoin="round"/></svg></button>' +
          '<div class="card-quick"><button type="button" class="btn btn--solid" data-add><span>Quick add · <span data-len>' + p.lengths[mid] + '"</span></span></button></div>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-name">' + esc(p.name) + '</h3>' +
          '<p class="card-spec">' + styleOf(p) + ' · ' + COL[p.colour].name + ' · ' + esc(p.spec) + '</p>' +
          '<div class="card-lens" role="group" aria-label="Length">' + p.lengths.map(function (l, i) { return '<button type="button" class="' + (i === mid ? 'is-on' : '') + '" data-i="' + i + '" aria-pressed="' + (i === mid) + '">' + l + '"</button>'; }).join('') + '</div>' +
          '<p class="card-price"><b>' + fmt(p.prices[mid]) + '</b><span>or 3 × ' + fmt(p.prices[mid] / 3) + ' with PayJustNow</span></p>' +
        '</div></article>';
    }).join('');

    PRODUCTS.forEach(function (p, idx) {
      var card = $('[data-id="' + p.id + '"]', grid), media = $('.card-media', card);
      var mid = Math.floor((p.lengths.length - 1) / 2);
      p.sel = mid;
      cardHair[p.id] = new Hair($('.lens canvas', card), {
        layout: 'curtain', texture: p.texture, colour: p.colour, length: 30, fit: 30, top: 0,
        count: 44, glow: false, scale: 0.34, hit: media, seed: 40 + idx
      });
      media.addEventListener('pointerenter', function () { cardHair[p.id].set({ always: true }); });
      media.addEventListener('pointerleave', function () { cardHair[p.id].set({ always: false }); });
      // tilt + glare
      media.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduced) return;
        var r = media.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        media.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        media.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        media.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); media.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      media.addEventListener('pointerleave', function () { media.style.setProperty('--rx', '0deg'); media.style.setProperty('--ry', '0deg'); });
      // lengths
      $('.card-lens', card).addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var i = +b.dataset.i; p.sel = i;
        $$('.card-lens button', card).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
        var pb = $('.card-price b', card), from = pb._v || p.prices[mid];
        tween(from, p.prices[i], 500, function (v) { pb.textContent = fmt(v); });
        pb._v = p.prices[i];
        $('.card-price span', card).textContent = 'or 3 × ' + fmt(p.prices[i] / 3) + ' with PayJustNow';
        $('[data-len]', card).textContent = p.lengths[i] + '"';
        cardHair[p.id].flip(0.5);
      });
      // wishlist
      var heart = $('.card-heart', card);
      heart.addEventListener('click', function (e) {
        var on = !wishes.has(p.id);
        if (on) wishes.add(p.id); else wishes.delete(p.id);
        heart.classList.toggle('is-on', on); heart.setAttribute('aria-pressed', on);
        if (on) burst(e.clientX, e.clientY, 8);
        var wc = $('#wishCount'); wc.hidden = wishes.size === 0; wc.textContent = wishes.size; bump(wc);
        toast(on ? 'Saved ' + esc(p.name) : 'Removed from your wishlist');
      });
      // quick add
      $('[data-add]', card).addEventListener('click', function (e) {
        addToBag({ key: p.id + '-' + p.sel, name: p.name, variant: COL[p.colour].name + ' · ' + p.lengths[p.sel] + '"', price: p.prices[p.sel], img: p.img, pos: p.pos }, e.currentTarget);
      });
    });

    // filter tabs
    var tabs = $('#editTabs'), pill = $('.tab-pill', tabs);
    function placePill() { var on = $('.tab.is-on', tabs); if (!on) return; pill.style.width = on.offsetWidth + 'px'; pill.style.transform = 'translateX(' + on.offsetLeft + 'px)'; }
    function filter(cat) {
      $$('.tab', tabs).forEach(function (t) { var on = t.dataset.filter === cat; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
      placePill();
      $$('.card', grid).forEach(function (c) {
        var show = cat === 'all' || c.dataset.cat === cat;
        if (show) { c.hidden = false; requestAnimationFrame(function () { c.classList.remove('is-out'); }); }
        else { c.classList.add('is-out'); setTimeout(function () { if (c.classList.contains('is-out')) c.hidden = true; }, 350); }
      });
    }
    tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) filter(t.dataset.filter); });
    $$('[data-filter-link]').forEach(function (a) { a.addEventListener('click', function () { filter(a.dataset.filterLink); }); });
    window.addEventListener('resize', placePill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
    placePill();
  })();

  // ======================= TEXTURE LAB =======================
  (function lab() {
    var st = { unit: 'bundle', texture: 'body', colour: 'mauve', length: 22, density: 180 };
    var layoutFor = { bundle: 'weft', closure: 'closure', frontal: 'frontal', wig: 'dome' };
    var unitName = { bundle: 'Bundles', closure: '5x5 HD Closure', frontal: '13x4 HD Frontal', wig: 'Glueless Wig' };
    var labHair = new Hair($('#labCanvas'), {
      layout: 'weft', texture: st.texture, colour: st.colour, length: st.length, fit: 33, top: 0.08,
      count: 230, always: true, ruler: true, dark: true, headW: 0.2, seed: 3
    });
    var priceEl = $('#labPrice'), range = $('#labLength');
    function topFor(u) { return u === 'wig' ? 0.07 : u === 'frontal' ? 0.12 : u === 'closure' ? 0.1 : 0.08; }
    function render() {
      var q = quote(st);
      var from = priceEl._v || q.total;
      tween(from, q.total, 650, function (v) { priceEl.textContent = fmt(v); });
      priceEl._v = q.total;
      $('#labSplit').textContent = 'or 4 × ' + fmt(q.total / 4) + ' with Payflex';
      $('#labNeed').textContent = st.unit === 'bundle'
        ? 'You’ll need ' + q.n + ' bundles for a full sew-in (' + q.n * 100 + ' g) · ' + fmt(q.per) + ' each'
        : st.unit === 'wig' ? 'Glueless 13x4 HD wig at ' + st.density + '% density, ready to wear'
        : st.unit === 'closure' ? 'Pairs with 3 bundles for a closure sew-in'
        : 'Pairs with 3 or 4 bundles for an ear-to-ear install';
      $('#labTag').textContent = TEX[st.texture].label + ' · ' + COL[st.colour].name + ' · ' + st.length + '"';
      $('#labColourName').textContent = COL[st.colour].name + ' (' + COL[st.colour].code + ')';
      $('#labLenOut').textContent = st.length;
      range.style.setProperty('--fill', ((st.length - 10) / 20 * 100) + '%');
      $('#labDensityWrap').hidden = st.unit !== 'wig';
    }
    choose($('#labUnit'), 'data-unit', function (v) {
      st.unit = v;
      labHair.set({ layout: layoutFor[v], top: topFor(v), count: v === 'wig' ? 300 : 230, density: v === 'wig' ? DENSITY[st.density] : 1 });
      render();
    });
    choose($('#labTexture'), 'data-texture', function (v) { st.texture = v; labHair.set({ texture: v }); render(); });
    choose($('#labColour'), 'data-colour', function (v) { st.colour = v; labHair.set({ colour: v }); render(); });
    choose($('#labDensity'), 'data-density', function (v) { st.density = +v; labHair.set({ density: DENSITY[st.density] }); render(); });
    range.addEventListener('input', function () { st.length = +range.value; labHair.set({ length: st.length }); render(); });
    $('#labFlip').addEventListener('click', function () { labHair.flip(Math.random() < 0.5 ? -1 : 1); });
    $('#labForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = quote(st);
      addToBag({
        key: 'lab-' + [st.unit, st.texture, st.colour, st.length, st.density].join('-'),
        name: 'Custom ' + TEX[st.texture].label + ' ' + unitName[st.unit] + (st.unit === 'bundle' ? ' × ' + q.n : ''),
        variant: COL[st.colour].name + ' · ' + st.length + '"' + (st.unit === 'wig' ? ' · ' + st.density + '%' : ''),
        price: q.total, look: { layout: layoutFor[st.unit], texture: st.texture, colour: st.colour, length: st.length }
      }, $('#labAdd'));
    });
    $('.lab-stage').setAttribute('data-cursor', 'Part it');
    render();
  })();

  // ======================= LACE MELT =======================
  (function melt() {
    var stage = $('#meltStage'), range = $('#meltRange');
    new Hair($('#meltHair'), { layout: 'curtain', texture: 'straight', colour: '1b', length: 30, fit: 30, top: 0, count: 300, glow: false, hit: stage, seed: 9, dark: false });
    function set(v) { stage.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { set(range.value); });
    choose($('#tones'), 'data-tone', function (v) { stage.style.setProperty('--skin', v); });
    stage.setAttribute('data-cursor', 'Drag');
    // gentle hint: sweep the divider once when first seen
    if (!reduced) {
      var seen = false;
      new IntersectionObserver(function (e, o) {
        if (!e[0].isIntersecting || seen) return; seen = true; o.disconnect();
        tween(50, 22, 700, function (v) { set(v); range.value = v; });
        setTimeout(function () { tween(22, 50, 900, function (v) { set(v); range.value = v; }); }, 760);
      }, { threshold: 0.6 }).observe(stage);
    }
  })();

  // ======================= MATCH QUIZ =======================
  (function quiz() {
    var q = $('#quiz'), steps = $$('.quiz-step', q), bar = $('#quizBar'), ans = {}, best = null;
    function go(i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      bar.style.width = (i / 3 * 100) + '%';
    }
    q.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-opts button'); if (!b) return;
      ans[b.dataset.k] = b.dataset.v;
      var step = +b.closest('.quiz-step').dataset.step;
      if (step < 2) go(step + 1); else result();
    });
    function priceOf(p) { var m = Math.floor((p.lengths.length - 1) / 2); return p.prices[m] * (p.sets || 1); }
    function result() {
      var budget = +ans.budget;
      var scored = PRODUCTS.map(function (p) {
        var price = priceOf(p);
        var s = (p.install.indexOf(ans.install) >= 0 ? 50 : 0) + (p.vibe.indexOf(ans.vibe) >= 0 ? 32 : 0) + (price <= budget ? 18 : Math.max(0, 18 - (price - budget) / 150));
        return { p: p, s: s, price: price };
      }).sort(function (a, b) { return b.s - a.s; });
      best = scored[0];
      var pct = Math.min(99, Math.round(62 + best.s * 0.37));
      var p = best.p, mid = Math.floor((p.lengths.length - 1) / 2);
      go(3);
      $('#matchName').textContent = p.name + (p.sets ? ' × ' + p.sets : '');
      var inst = { sewin: 'sew-in', glueless: 'glueless', quick: 'quick-switch' }[ans.install];
      var vibe = { sleek: 'sleek', waves: 'soft-wave', curls: 'big-curl' }[ans.vibe];
      $('#matchWhy').textContent = 'Made for a ' + inst + ' install with a ' + vibe + ' finish. ' + styleOf(p) + ' in ' + COL[p.colour].name + ', ' + p.lengths[mid] + '".' + (best.price > budget ? ' A little over budget, but worth a look.' : '');
      $('#matchPrice').textContent = fmt(best.price) + (p.sets ? ' for ' + p.sets + ' bundles' : '');
      var mi = $('#matchImg');
      mi.src = 'assets/img/' + p.img + '.jpg'; mi.alt = p.name; mi.style.setProperty('--pos', p.pos);
      var ring = $('#ringFg'); ring.style.strokeDashoffset = 100;
      requestAnimationFrame(function () { requestAnimationFrame(function () { ring.style.strokeDashoffset = 100 - pct; }); });
      tween(0, pct, 1500, function (v) { $('#matchPct').textContent = Math.round(v); });
    }
    $('#matchRestart').addEventListener('click', function () { ans = {}; go(0); });
    $('#matchAdd').addEventListener('click', function (e) {
      if (!best) return;
      var p = best.p, mid = Math.floor((p.lengths.length - 1) / 2);
      addToBag({ key: p.id + '-quiz', name: p.name + (p.sets ? ' × ' + p.sets : ''), variant: COL[p.colour].name + ' · ' + p.lengths[mid] + '"', price: best.price, img: p.img, pos: p.pos }, e.currentTarget);
    });
  })();

  // ======================= REVIEWS =======================
  (function reviews() {
    var host = $('#reviews');
    function card(r) {
      var initials = r[1].split(' ').map(function (w) { return w[0]; }).join('');
      return '<article class="review"><span class="review-stars" aria-label="5 out of 5">★★★★★</span><q>' + esc(r[0]) + '</q>' +
        '<div class="review-who"><span class="review-av" style="--a1:' + r[4] + ';--a2:' + r[5] + '">' + initials + '</span><p>' + esc(r[1]) + ', ' + esc(r[2]) + '<span>' + esc(r[3]) + '</span></p></div></article>';
    }
    var a = REVIEWS.slice(0, 4), b = REVIEWS.slice(4);
    var rowA = a.concat(a, a).map(card).join(''), rowB = b.concat(b, b).map(card).join('');
    host.innerHTML = '<div class="review-row">' + rowA + rowA + '</div><div class="review-row review-row--rev">' + rowB + rowB + '</div>';
  })();

  // ======================= CARE (pinned horizontal) =======================
  (function care() {
    var sec = $('#care'), track = $('#careTrack'), dist = 0;
    function off() { return narrow.matches || reduced; }
    function measure() {
      if (off()) { sec.style.height = ''; track.style.transform = ''; return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = (innerHeight + dist) + 'px';
      onScroll();
    }
    function onScroll() {
      if (off()) return;
      var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      track.style.setProperty('--p', p.toFixed(4));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    narrow.addEventListener('change', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
  })();

  // ======================= CLUB =======================
  $('#clubForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#clubEmail'), msg = $('#clubMsg'), v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = 'Enter an email address like name@example.co.za.'; inp.focus(); return; }
    var r = inp.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 14);
    msg.textContent = 'Welcome to the club. This is a mock-up, so no email was sent.';
    inp.value = '';
  });

  // ======================= BAG =======================
  var bag = store('zante-bag') || [];
  var thumbs = [];
  function saveBag() { store('zante-bag', bag); }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function addToBag(item, from) {
    var found = bag.filter(function (x) { return x.key === item.key; })[0];
    if (found) found.qty++; else { item.qty = 1; bag.push(item); }
    saveBag();
    flyTo(from, $('#bagBtn'), function () { renderBag(); bump($('#bagCount')); });
    toast('Added ' + esc(item.name) + ' to your bag');
  }
  function flyTo(fromEl, toEl, done) {
    if (!fromEl || reduced || !fromEl.getBoundingClientRect) { done(); return; }
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    var x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    var dot = document.createElement('span'); dot.className = 'fly'; document.body.appendChild(dot);
    var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 140;
    var anim = dot.animate([
      { transform: 'translate(' + (x0 - 8) + 'px,' + (y0 - 8) + 'px) scale(1)' },
      { transform: 'translate(' + (mx - 8) + 'px,' + (my - 8) + 'px) scale(1.5)', offset: 0.45 },
      { transform: 'translate(' + (x1 - 8) + 'px,' + (y1 - 8) + 'px) scale(0.5)' }
    ], { duration: 820, easing: 'cubic-bezier(.5,0,.3,1)' });
    dot.style.left = '0'; dot.style.top = '0';
    anim.onfinish = function () { dot.remove(); done(); };
  }
  function renderBag() {
    thumbs.forEach(function (h) { h.destroy(); }); thumbs = [];
    var list = $('#bagLines'), count = 0, total = 0;
    bag.forEach(function (x) { count += x.qty; total += x.qty * x.price; });
    var bc = $('#bagCount'); bc.hidden = count === 0; bc.textContent = count;
    if (!bag.length) {
      list.innerHTML = '<li class="bag-empty"><b>Your bag is empty</b><span>Start with the Texture Lab or the edit.</span></li>';
    } else {
      list.innerHTML = bag.map(function (x, i) {
        var thumb = x.img ? '<img src="assets/img/' + x.img + '.jpg" alt="" style="--pos:' + (x.pos || '50% 30%') + '">' : '<canvas aria-hidden="true"></canvas>';
        return '<li class="bag-line"><div class="bag-thumb">' + thumb + '</div><div><h3>' + esc(x.name) + '</h3><p>' + esc(x.variant) + '</p>' +
          '<div class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="One less">−</button><span>' + x.qty + '</span><button type="button" data-q="1" data-i="' + i + '" aria-label="One more">+</button></div></div>' +
          '<div class="bag-line-price">' + fmt(x.price * x.qty) + '<button type="button" data-rm="' + i + '">Remove</button></div></li>';
      }).join('');
      $$('.bag-thumb', list).forEach(function (t, i) {
        var c = $('canvas', t); if (!c) return;
        var l = bag[i].look || {};
        thumbs.push(new Hair(c, { layout: l.layout || 'weft', texture: l.texture || 'body', colour: l.colour || '1b', length: l.length || 20, fit: 30, top: 0.12, headW: 0.26, count: 60, interactive: false, ambient: false, glow: false, scale: 0.18, seed: i + 1 }));
      });
    }
    $('#bagTotal').textContent = fmt(total);
    $('#bagSplit').textContent = total ? 'or 3 × ' + fmt(total / 3) + ' with PayJustNow' : '';
    var left = 1500 - total;
    $('#shipMsg').textContent = total === 0 ? 'Add R1 500 for free delivery' : left > 0 ? 'You’re ' + fmt(left) + ' away from free delivery' : 'Free delivery unlocked';
    $('#shipFill').style.width = clamp(total / 1500 * 100, 0, 100) + '%';
  }
  $('#bagLines').addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { var it = bag[+q.dataset.i]; it.qty += +q.dataset.q; if (it.qty <= 0) bag.splice(+q.dataset.i, 1); }
    else if (rm) bag.splice(+rm.dataset.rm, 1);
    else return;
    saveBag(); renderBag();
  });
  var lastFocus = null;
  function openBag() {
    lastFocus = document.activeElement;
    $('#bag').classList.add('is-open'); $('#bag').setAttribute('aria-hidden', 'false'); $('#scrim').hidden = false;
    document.body.style.overflow = 'hidden';
    renderBag();
    setTimeout(function () { $('#bagClose').focus(); }, 50);
  }
  function closeBag() {
    if (!$('#bag').classList.contains('is-open')) return;
    $('#bag').classList.remove('is-open'); $('#bag').setAttribute('aria-hidden', 'true'); $('#scrim').hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#bagBtn').addEventListener('click', openBag);
  $('#bagClose').addEventListener('click', closeBag);
  $('#scrim').addEventListener('click', closeBag);
  $('#checkoutBtn').addEventListener('click', function () { toast('Checkout is not part of this mock-up'); });
  $('#wishBtn').addEventListener('click', function () { toast(wishes.size ? 'You have ' + wishes.size + ' saved ' + (wishes.size === 1 ? 'style' : 'styles') : 'Tap the heart on any product to save it'); });
  renderBag();

  // ======================= SEARCH =======================
  var searchEl = $('#search'), sInput = $('#searchInput'), sRes = $('#searchResults');
  function openSearch() { searchEl.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(function () { sInput.focus(); }, 30); runSearch(); }
  function closeSearch() { if (searchEl.hidden) return; searchEl.hidden = true; document.body.style.overflow = ''; }
  function runSearch() {
    var q = sInput.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var hits = PRODUCTS.filter(function (p) {
      var hay = (p.name + ' ' + p.spec + ' ' + styleOf(p) + ' ' + TEX[p.texture].label + ' ' + COL[p.colour].name + ' ' + COL[p.colour].code + ' ' + p.cat + (p.texture === 'kinkyCurly' || p.texture === 'deep' ? ' curly curls' : '')).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) >= 0; });
    });
    if (!terms.length) hits = PRODUCTS;
    function hl(s) { var out = esc(s); terms.forEach(function (t) { if (t.length > 1) out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return out; }
    sRes.innerHTML = hits.length ? hits.map(function (p, i) {
      return '<li><button type="button" data-go="' + p.id + '" style="animation-delay:' + i * 40 + 'ms"><img class="dot" src="assets/img/' + p.img + '.jpg" alt="" style="object-position:' + p.pos + '"><span><b>' + hl(p.name) + '</b><small>' + hl(styleOf(p) + ' · ' + COL[p.colour].name + ' · ' + p.spec) + '</small></span><span>' + fmt(p.prices[0]) + '+</span></button></li>';
    }).join('') : '<li class="search-none">No match for “' + esc(q) + '”. Try a texture like “deep wave” or a lace size like “5x5”.</li>';
  }
  $('#searchBtn').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  sInput.addEventListener('input', runSearch);
  $('#searchSugg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { sInput.value = b.textContent; runSearch(); sInput.focus(); } });
  sRes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    closeSearch();
    var card = $('[data-id="' + b.dataset.go + '"]');
    $$('.tab').forEach(function (t) { if (t.dataset.filter === 'all') t.click(); });
    setTimeout(function () {
      card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { cardHair[b.dataset.go].flip(1); card.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-out' }); }, 650);
    }, 60);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && searchEl.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  // ======================= REVEALS, SPLITS, COUNTERS, FOOTER =======================
  (function reveals() {
    $$('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w, i) { return '<span class="w"><span style="--i:' + i + '">' + esc(w) + '</span></span>'; }).join(' ');
    });
    if (!('IntersectionObserver' in window) || reduced) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    var vh = innerHeight;
    $$('[data-split], [data-reveal], .section-lede, .care-card, .review-row').forEach(function (el, i) {
      if (el.getBoundingClientRect().top > vh * 0.92) {
        if (el.classList.contains('card')) el.style.setProperty('--rd', (i % 4) * 90 + 'ms');
        if (!el.hasAttribute('data-split')) el.setAttribute('data-reveal', '');
        el.classList.add('pre'); io.observe(el);
      }
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, n = +el.dataset.count, suf = el.dataset.suffix || '';
        tween(0, n, 1600, function (v) { el.textContent = Math.round(v) + suf; });
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
    var fm = $('.footer-mark');
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { fm.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe(fm);
  })();
  if (reduced || !('IntersectionObserver' in window)) {
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
    $('.footer-mark').classList.add('is-in');
  }

  // ======================= CURSOR, TRAIL, MAGNETIC =======================
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  if (fine && !reduced) {
    $$('.magnetic').forEach(function (m) {
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect();
        m.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + 'px)';
      });
      m.addEventListener('pointerleave', function () { m.style.transform = ''; });
    });

    html.classList.add('has-cursor');
    var cur = $('#cursor'), ring = $('.cursor-ring', cur), dot = $('.cursor-dot', cur), lab = $('#cursorLabel');
    var trail = $('#trail'), tctx = trail.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    var mx = -100, my = -100, rx = -100, ry = -100, pts = [], running = false;
    function sizeTrail() { trail.width = innerWidth * dpr; trail.height = innerHeight * dpr; }
    sizeTrail(); window.addEventListener('resize', sizeTrail);
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      pts.push({ x: mx, y: my, t: performance.now() });
      if (pts.length > 26) pts.shift();
      cur.style.opacity = 1;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.style.opacity = 0; });
    document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      var hov = e.target.closest('a, button, input, [role="tab"], .swatch, .tone');
      cur.classList.toggle('is-label', !!t && !hov);
      cur.classList.toggle('is-hover', !!hov);
      lab.textContent = t && !hov ? t.getAttribute('data-cursor') : '';
    });
    function tick(now) {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      lab.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      // silk trail
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.clearRect(0, 0, innerWidth, innerHeight);
      while (pts.length && now - pts[0].t > 420) pts.shift();
      if (pts.length > 2) {
        tctx.lineCap = 'round'; tctx.lineJoin = 'round';
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], life = 1 - (now - b.t) / 420;
          tctx.strokeStyle = 'rgba(176,127,163,' + (life * 0.5).toFixed(3) + ')';
          tctx.lineWidth = Math.max(0.4, life * 3.2);
          tctx.beginPath(); tctx.moveTo(a.x, a.y); tctx.lineTo(b.x, b.y); tctx.stroke();
          tctx.strokeStyle = 'rgba(169,178,198,' + (life * 0.35).toFixed(3) + ')';
          tctx.lineWidth = Math.max(0.3, life * 1.2);
          tctx.beginPath(); tctx.moveTo(a.x + 4 * life, a.y + 3 * life); tctx.lineTo(b.x + 4 * life, b.y + 3 * life); tctx.stroke();
        }
      }
      if (pts.length || Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) requestAnimationFrame(tick); else running = false;
    }
  }
})();
