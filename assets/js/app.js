/* Zante Hair · homepage interactions (mock-up) */
(function () {
  'use strict';

  var Hair = window.ZanteHair;
  var TEX = Hair.TEXTURES, COL = Hair.COLOURS;
  var html = document.documentElement;
  var reduced = Hair.reduced;

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
      var p = clamp((now - t0) / ms, 0, 1);
      cb(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function choose(group, attr, cb) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[' + attr + ']'); if (!b) return;
      $$('[' + attr + ']', group).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      cb(b.getAttribute(attr), b);
    });
  }

  // ======================= CATALOGUE (sample content) =======================
  // tags drive the filter chips: wigs, bundles, curly, wavy, blonde
  var PRODUCTS = [
    { id: 'thandi', name: 'Thandi Glueless Wig', type: 'Wig', img: 'p-thandi', alt: 'p-thandi-2', pos: '50% 18%', texture: 'body', style: 'Body Wave', colour: '1b', tags: 'wigs wavy', lengths: [18, 22, 26], prices: [3650, 3950, 4450], badge: 'Bestseller', install: ['glueless'], vibe: ['waves'] },
    { id: 'deepwave', name: 'Raw Deep Wave Bundles', type: 'Bundles', img: 'p-deepwave-bundles', alt: 'p-deepwave-2', pos: '62% 38%', texture: 'deep', style: 'Deep Wave', colour: '1b', tags: 'bundles curly', lengths: [16, 20, 24], prices: [960, 1120, 1290], badge: 'New drop', install: ['sewin'], vibe: ['curls'], sets: 3 },
    { id: 'amahle', name: 'Amahle Kinky Curly Wig', type: 'Headband wig', img: 'p-amahle', pos: '50% 22%', texture: 'kinkyCurly', style: 'Kinky Curly', colour: '1b', tags: 'wigs curly', lengths: [14, 16, 18], prices: [2150, 2350, 2550], badge: 'No glue', install: ['quick', 'glueless'], vibe: ['curls'] },
    { id: 'naledi', name: 'Naledi Loose Wave Wig', type: 'Wig', img: 'p-naledi', alt: 'p-naledi-2', pos: '68% 40%', texture: 'body', style: 'Loose Wave', colour: '1b', tags: 'wigs wavy', lengths: [20, 24, 28], prices: [2650, 2890, 3290], install: ['glueless', 'quick'], vibe: ['waves', 'sleek'] },
    { id: 'lerato', name: 'Lerato Curly Wig', type: 'Wig', img: 'p-lerato', pos: '50% 26%', texture: 'deep', style: 'Curly', colour: '1b', tags: 'wigs curly', lengths: [16, 20], prices: [2450, 2790], install: ['glueless', 'quick'], vibe: ['curls'] },
    { id: 'kinky', name: 'Kinky Straight Bundles', type: 'Bundles', img: 'p-kinkystraight', pos: '50% 22%', texture: 'kinkyStraight', style: 'Kinky Straight', colour: '1b', tags: 'bundles curly', lengths: [16, 20, 24], prices: [990, 1150, 1320], badge: '4B and 4C blend', install: ['sewin'], vibe: ['curls', 'sleek'], sets: 3 },
    { id: 'bontle', name: 'Bontle Afro Wig', type: 'Wig', img: 'p-afro', pos: '50% 28%', texture: 'kinkyCurly', style: 'Afro Kinky', colour: '1b', tags: 'wigs curly', lengths: [10, 12], prices: [1890, 2090], install: ['glueless', 'quick'], vibe: ['curls'] },
    { id: 'ombre', name: 'Ombre Body Wave Bundles', type: 'Bundles', img: 'p-ombre-bundles', pos: '50% 40%', texture: 'body', style: 'Body Wave', colour: 'ombre', tags: 'bundles wavy blonde', lengths: [18, 22, 26], prices: [1150, 1290, 1490], install: ['sewin'], vibe: ['waves'], sets: 3 },
    { id: 'honey', name: 'Honey Blonde Wave Bundle', type: 'Bundles', img: 'p-honey-bundle', pos: '50% 50%', texture: 'body', style: 'Loose Wave', colour: '27', tags: 'bundles wavy blonde', lengths: [18, 22], prices: [990, 1150], install: ['sewin'], vibe: ['waves'], sets: 3 },
    { id: 'platinum', name: 'Platinum 613 Bundle', type: 'Bundles', img: 'p-platinum-bundle', pos: '50% 45%', texture: 'straight', style: 'Silky Straight', colour: '613', tags: 'bundles wavy blonde', lengths: [16, 20, 24], prices: [1050, 1190, 1350], badge: 'Colour ready', install: ['sewin'], vibe: ['sleek'], sets: 3 }
  ];

  var REVIEWS = [
    ['The body wave survived a Durban summer and still bounces.', 'Nomsa K.', 'Durban', 'Thandi Glueless Wig, 22"'],
    ['Glueless means I was ready for church in fifteen minutes.', 'Lindiwe M.', 'Soweto', 'Thandi Glueless Wig, 22"'],
    ['The HD lace actually melted on my skin tone. No tinting at all.', 'Refilwe S.', 'Pretoria', '13x4 HD frontal'],
    ['Three bundles, full head, zero shedding after a month.', 'Precious N.', 'Bloemfontein', 'Raw Deep Wave Bundles, 20"'],
    ['The kinky straight blends with my 4C leave-out perfectly.', 'Zanele B.', 'Pietermaritzburg', 'Kinky Straight Bundles, 20"'],
    ['Ordered at nine, wearing it by five. Same-day is real.', 'Kgothatso D.', 'Midrand', 'Amahle Kinky Curly Wig, 16"'],
    ['My 613 took colour so well. My stylist was impressed.', 'Thato R.', 'Polokwane', 'Platinum 613 Bundle, 20"']
  ];

  var TEX_BASE = { straight: 650, body: 720, deep: 780, kinkyStraight: 760, kinkyCurly: 820 };
  var COL_ADD = { '1b': 0, mauve: 180, '27': 140, '99j': 140, '613': 220, ombre: 200 };
  var DENSITY = { 150: 1, 180: 1.12, 250: 1.35 };
  function bundlesNeeded(len) { return len <= 20 ? 3 : len <= 26 ? 4 : 5; }
  function quote(c) {
    var steps = (c.length - 10) / 2, add = COL_ADD[c.colour], tb = TEX_BASE[c.texture] - 650;
    if (c.unit === 'bundle') { var per = TEX_BASE[c.texture] + steps * 70 + add, n = bundlesNeeded(c.length); return { total: per * n, per: per, n: n }; }
    if (c.unit === 'closure') return { total: 1050 + steps * 60 + add + tb };
    if (c.unit === 'frontal') return { total: 1450 + steps * 80 + add + tb };
    return { total: Math.round((2650 + steps * 160 + add * 2 + tb * 2) * DENSITY[c.density || 180] / 10) * 10 };
  }

  // ======================= THEME (light by default) =======================
  var savedMode = store('zante-mode');
  function applyMode(m) {
    html.dataset.mode = m;
    $('#themeBtn').setAttribute('aria-label', m === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    $('#themeBtnM').textContent = m === 'dark' ? 'Light mode' : 'Dark mode';
    Hair.refreshAll();
  }
  applyMode(savedMode === 'dark' ? 'dark' : 'light');
  function toggleTheme() { var next = html.dataset.mode === 'dark' ? 'light' : 'dark'; store('zante-mode', next); applyMode(next); }
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#themeBtnM').addEventListener('click', toggleTheme);

  // ======================= TOASTS =======================
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i></i><span>' + msg + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 380); }, 2800);
  }

  // ======================= INTRO =======================
  (function intro() {
    var el = $('#intro'), done = false;
    function finish(skipped) {
      if (done) return; done = true;
      if (skipped) html.classList.add('intro-skipped');
      el.classList.add('is-leaving');
      document.body.style.overflow = '';
      setTimeout(function () { el.classList.add('is-gone'); }, 1100);
    }
    if (reduced) { el.classList.add('is-gone'); html.classList.add('intro-skipped'); return; }
    document.body.style.overflow = 'hidden';
    setTimeout(function () { finish(false); }, 1700);
    $('#introSkip').addEventListener('click', function () { finish(true); });
  })();

  // ======================= ANNOUNCEMENT =======================
  (function announce() {
    var msgs = $$('.announce-msg'), i = 0;
    if (reduced || msgs.length < 2) return;
    setInterval(function () {
      msgs[i].classList.remove('is-on');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-on');
    }, 4000);
  })();

  // ======================= HEADER =======================
  (function header() {
    var h = $('#header'), lastY = window.scrollY, ticking = false;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMobile(); closeSearch(); closeBag(); } });
    function onScroll() {
      var y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 30);
      var menuOpen = $('#mobileNav').classList.contains('is-open');
      if (y > 400 && y > lastY + 4 && !menuOpen) h.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 400) h.classList.remove('is-hidden');
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
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

  // ======================= RAILS (drag + arrows) =======================
  function dragScroll(rail) {
    var down = false, moved = false, x0 = 0, s0 = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('is-dragging'); }
      if (moved) rail.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { setTimeout(function () { rail.classList.remove('is-dragging'); }, 30); }
    });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  $$('.rail').forEach(dragScroll);

  // ======================= SHOP: scroll down, catalogue moves sideways =======================
  (function shop() {
    var sec = $('#shop'), pin = $('#shopPin'), track = $('#rail'), bar = $('#shopBar'), hint = $('#shopHint');
    track.innerHTML = PRODUCTS.map(function (p) {
      var mid = Math.floor((p.lengths.length - 1) / 2);
      return '<article class="card" data-id="' + p.id + '" data-tags="' + p.tags + '">' +
        '<div class="card-media">' +
          '<img class="card-img" src="assets/img/' + p.img + '.jpg" alt="' + esc(p.name) + ', ' + esc(p.style.toLowerCase()) + ' in ' + esc(COL[p.colour].name.toLowerCase()) + '" style="--pos:' + p.pos + '" loading="lazy" draggable="false">' +
          (p.alt ? '<img class="card-img card-img--alt" src="assets/img/' + p.alt + '.jpg" alt="" style="--pos:' + p.pos + '" loading="lazy" draggable="false">' : '') +
          (p.badge ? '<span class="card-badge">' + esc(p.badge) + '</span>' : '') +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-type">' + esc(p.type) + ' · ' + esc(p.style) + ' · ' + esc(COL[p.colour].code) + '</p>' +
          '<h3 class="card-name">' + esc(p.name) + '</h3>' +
          '<div class="card-lens" role="group" aria-label="Length">' + p.lengths.map(function (l, i) { return '<button type="button" class="' + (i === mid ? 'is-on' : '') + '" data-i="' + i + '" aria-pressed="' + (i === mid) + '">' + l + '"</button>'; }).join('') + '</div>' +
          '<div class="card-foot"><p class="card-price"><b>' + fmt(p.prices[mid]) + '</b><span>or 3 × ' + fmt(p.prices[mid] / 3) + ' PayJustNow</span></p>' +
          '<button type="button" class="add-btn" data-add aria-label="Add ' + esc(p.name) + ' to bag"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
        '</div></article>';
    }).join('');

    PRODUCTS.forEach(function (p) {
      var card = $('[data-id="' + p.id + '"]', track), mid = Math.floor((p.lengths.length - 1) / 2);
      p.sel = mid;
      $('.card-lens', card).addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var i = +b.dataset.i; p.sel = i;
        $$('.card-lens button', card).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
        var pb = $('.card-price b', card), from = pb._v || p.prices[mid];
        tween(from, p.prices[i], 450, function (v) { pb.textContent = fmt(v); });
        pb._v = p.prices[i];
        $('.card-price span', card).textContent = 'or 3 × ' + fmt(p.prices[i] / 3) + ' PayJustNow';
      });
      $('[data-add]', card).addEventListener('click', function (e) {
        addToBag({ key: p.id + '-' + p.sel, name: p.name, variant: p.style + ' · ' + COL[p.colour].name + ' · ' + p.lengths[p.sel] + '"', price: p.prices[p.sel], img: p.img, pos: p.pos }, e.currentTarget);
      });
    });

    // the section is as tall as the sideways distance, so every pixel scrolled down moves the row one pixel left
    var dist = 0;
    function measure() {
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = (pin.offsetHeight + dist) + 'px';
      onScroll();
    }
    function progress() {
      var top = sec.getBoundingClientRect().top;
      return dist > 0 ? clamp(-top / dist, 0, 1) : 0;
    }
    function onScroll() {
      var p = progress();
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      hint.textContent = p > 0.97 ? 'That’s the full range. Keep scrolling' : 'Keep scrolling to browse sideways';
      prev.disabled = p < 0.01; next.disabled = p > 0.99;
    }
    var prev = $('#railPrev'), next = $('#railNext');
    function stepPx() { var c = $('.card:not([hidden])', track); return c ? (c.offsetWidth + 20) * 2 : 500; }
    prev.addEventListener('click', function () { window.scrollBy({ top: -stepPx(), behavior: reduced ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { window.scrollBy({ top: stepPx(), behavior: reduced ? 'auto' : 'smooth' }); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    $$('img', track).forEach(function (im) { if (!im.complete) im.addEventListener('load', measure, { once: true }); });

    // sideways trackpad swipes and finger swipes also move the row
    sec.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) { e.preventDefault(); window.scrollBy(0, e.deltaX); }
    }, { passive: false });
    var tx = 0, ty = 0, sideways = null;
    track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; sideways = null; }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
      if (sideways === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) sideways = Math.abs(dx) > Math.abs(dy);
      if (sideways) { e.preventDefault(); window.scrollBy(0, -dx); tx = e.touches[0].clientX; }
    }, { passive: false });

    // filters
    var filters = $('#filters');
    function filter(tag) {
      $$('.chip', filters).forEach(function (c) { var on = c.dataset.filter === tag; c.classList.toggle('is-on', on); c.setAttribute('aria-selected', on); });
      $$('.card', track).forEach(function (c) {
        var show = tag === 'all' || (' ' + c.dataset.tags + ' ').indexOf(' ' + tag + ' ') >= 0;
        c.hidden = !show;
        if (show) { c.classList.add('is-out'); requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('is-out'); }); }); }
      });
      measure();
      if (sec.getBoundingClientRect().top < 0) window.scrollTo({ top: sec.offsetTop, behavior: 'auto' });
    }
    filters.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (c) filter(c.dataset.filter); });
    $$('[data-filter-link]').forEach(function (a) { a.addEventListener('click', function () { filter(a.dataset.filterLink); }); });
    window.__zanteShopGoTo = function (id) {
      filter('all');
      var card = $('[data-id="' + id + '"]', track);
      var x = clamp(card.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), 0, dist);
      window.scrollTo({ top: sec.offsetTop + x, behavior: reduced ? 'auto' : 'smooth' });
      setTimeout(function () { card.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-out' }); }, 900);
    };
    measure();
  })();

  // ======================= MATCH QUIZ =======================
  (function quiz() {
    var q = $('#quiz'), steps = $$('.quiz-step', q), bar = $('#quizBar'), ans = {}, best = null;
    function go(i) { steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); bar.style.width = (i / 3 * 100) + '%'; }
    q.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-opts button'); if (!b) return;
      ans[b.dataset.k] = b.dataset.v;
      var step = +b.closest('.quiz-step').dataset.step;
      if (step < 2) go(step + 1); else result();
    });
    function priceOf(p) { var m = Math.floor((p.lengths.length - 1) / 2); return p.prices[m] * (p.sets || 1); }
    function result() {
      var budget = +ans.budget;
      best = PRODUCTS.map(function (p) {
        var price = priceOf(p);
        var s = (p.install.indexOf(ans.install) >= 0 ? 50 : 0) + (p.vibe.indexOf(ans.vibe) >= 0 ? 32 : 0) + (price <= budget ? 18 : Math.max(0, 18 - (price - budget) / 150));
        return { p: p, s: s, price: price };
      }).sort(function (a, b) { return b.s - a.s; })[0];
      var pct = Math.min(99, Math.round(62 + best.s * 0.37));
      var p = best.p, mid = Math.floor((p.lengths.length - 1) / 2);
      go(3);
      $('#matchName').textContent = p.name + (p.sets ? ' × ' + p.sets : '');
      var inst = { sewin: 'sew-in', glueless: 'glueless', quick: 'quick-switch' }[ans.install];
      var vibe = { sleek: 'sleek', waves: 'soft-wave', curls: 'curly' }[ans.vibe];
      $('#matchWhy').textContent = 'Made for a ' + inst + ' install with a ' + vibe + ' finish. ' + p.style + ' in ' + COL[p.colour].name + ', ' + p.lengths[mid] + '".' + (best.price > budget ? ' A little over budget, but worth a look.' : '');
      $('#matchPrice').textContent = fmt(best.price) + (p.sets ? ' for ' + p.sets + ' bundles' : '');
      var mi = $('#matchImg'); mi.src = 'assets/img/' + p.img + '.jpg'; mi.alt = p.name; mi.style.setProperty('--pos', p.pos);
      var ring = $('#ringFg'); ring.style.strokeDashoffset = 100;
      requestAnimationFrame(function () { requestAnimationFrame(function () { ring.style.strokeDashoffset = 100 - pct; }); });
      tween(0, pct, 1400, function (v) { $('#matchPct').textContent = Math.round(v); });
    }
    $('#matchRestart').addEventListener('click', function () { ans = {}; go(0); });
    $('#matchAdd').addEventListener('click', function (e) {
      if (!best) return;
      var p = best.p, mid = Math.floor((p.lengths.length - 1) / 2);
      addToBag({ key: p.id + '-quiz', name: p.name + (p.sets ? ' × ' + p.sets : ''), variant: COL[p.colour].name + ' · ' + p.lengths[mid] + '"', price: best.price, img: p.img, pos: p.pos }, e.currentTarget);
    });
  })();

  // ======================= BUILD YOUR OWN (Texture Lab) =======================
  (function lab() {
    var st = { unit: 'bundle', texture: 'body', colour: '1b', length: 22, density: 180 };
    var layoutFor = { bundle: 'weft', closure: 'closure', frontal: 'frontal', wig: 'dome' };
    var unitName = { bundle: 'Bundles', closure: '5x5 HD Closure', frontal: '13x4 HD Frontal', wig: 'Glueless Wig' };
    var labHair = new Hair($('#labCanvas'), { layout: 'weft', texture: st.texture, colour: st.colour, length: st.length, fit: 33, top: 0.08, count: 230, always: true, ruler: true, dark: true, headW: 0.2, seed: 3 });
    var priceEl = $('#labPrice'), range = $('#labLength');
    function topFor(u) { return u === 'wig' ? 0.07 : u === 'frontal' ? 0.12 : u === 'closure' ? 0.1 : 0.08; }
    function render() {
      var q = quote(st), from = priceEl._v || q.total;
      tween(from, q.total, 600, function (v) { priceEl.textContent = fmt(v); });
      priceEl._v = q.total;
      $('#labSplit').textContent = 'or 4 × ' + fmt(q.total / 4) + ' with Payflex';
      $('#labNeed').textContent = st.unit === 'bundle' ? 'You’ll need ' + q.n + ' bundles for a full sew-in (' + q.n * 100 + ' g) · ' + fmt(q.per) + ' each'
        : st.unit === 'wig' ? 'Glueless 13x4 HD wig at ' + st.density + '% density, ready to wear'
        : st.unit === 'closure' ? 'Pairs with 3 bundles for a closure sew-in' : 'Pairs with 3 or 4 bundles for an ear-to-ear install';
      $('#labTag').textContent = TEX[st.texture].label + ' · ' + COL[st.colour].name + ' · ' + st.length + '"';
      $('#labColourName').textContent = COL[st.colour].name + ' (' + COL[st.colour].code + ')';
      $('#labLenOut').textContent = st.length;
      range.style.setProperty('--fill', ((st.length - 10) / 20 * 100) + '%');
      $('#labDensityWrap').hidden = st.unit !== 'wig';
    }
    choose($('#labUnit'), 'data-unit', function (v) { st.unit = v; labHair.set({ layout: layoutFor[v], top: topFor(v), count: v === 'wig' ? 300 : 230, density: v === 'wig' ? DENSITY[st.density] : 1 }); render(); });
    choose($('#labTexture'), 'data-texture', function (v) { st.texture = v; labHair.set({ texture: v }); render(); });
    choose($('#labColour'), 'data-colour', function (v) { st.colour = v; labHair.set({ colour: v }); render(); });
    choose($('#labDensity'), 'data-density', function (v) { st.density = +v; labHair.set({ density: DENSITY[st.density] }); render(); });
    range.addEventListener('input', function () { st.length = +range.value; labHair.set({ length: st.length }); render(); });
    $('#labForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = quote(st);
      addToBag({ key: 'lab-' + [st.unit, st.texture, st.colour, st.length, st.density].join('-'), name: 'Custom ' + TEX[st.texture].label + ' ' + unitName[st.unit] + (st.unit === 'bundle' ? ' × ' + q.n : ''), variant: COL[st.colour].name + ' · ' + st.length + '"' + (st.unit === 'wig' ? ' · ' + st.density + '%' : ''), price: q.total, look: { layout: layoutFor[st.unit], texture: st.texture, colour: st.colour, length: st.length } }, $('#labAdd'));
    });
    render();
  })();

  // ======================= HD LACE MELT =======================
  (function melt() {
    var stage = $('#meltStage'), range = $('#meltRange');
    new Hair($('#meltHair'), { layout: 'curtain', texture: 'kinkyStraight', colour: '1b', length: 30, fit: 30, top: 0, count: 300, glow: false, hit: stage, seed: 9, dark: false });
    function set(v) { stage.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { set(range.value); });
    choose($('#tones'), 'data-tone', function (v) { stage.style.setProperty('--skin', v); });
  })();

  // ======================= REVIEWS =======================
  $('#reviewRail').innerHTML = REVIEWS.map(function (r) {
    var initials = r[1].split(' ').map(function (w) { return w[0]; }).join('');
    return '<article class="review"><span class="review-stars" aria-label="5 out of 5">★★★★★</span><q>' + esc(r[0]) + '</q>' +
      '<div class="review-who"><span class="review-av">' + initials + '</span><p>' + esc(r[1]) + ', ' + esc(r[2]) + '<span>' + esc(r[3]) + '</span></p></div></article>';
  }).join('');

  // ======================= CLUB =======================
  $('#clubForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#clubEmail'), msg = $('#clubMsg'), v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = 'Enter an email address like name@example.co.za.'; inp.focus(); return; }
    msg.textContent = 'Welcome to the club. This is a draft, so no email was sent.';
    inp.value = '';
  });

  // ======================= BAG =======================
  var bag = store('zante-bag2') || [];
  var thumbs = [];
  function saveBag() { store('zante-bag2', bag); }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function addToBag(item, from) {
    var found = bag.filter(function (x) { return x.key === item.key; })[0];
    if (found) found.qty++; else { item.qty = 1; bag.push(item); }
    saveBag();
    flyTo(from, $('#bagBtn'), function () { renderBag(); bump($('#bagCount')); });
    toast('Added ' + esc(item.name) + ' to your bag');
  }
  function flyTo(fromEl, toEl, done) {
    if (!fromEl || reduced || !fromEl.getBoundingClientRect || !toEl.offsetParent) { done(); return; }
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    var x0 = a.left + a.width / 2 - 8, y0 = a.top + a.height / 2 - 8, x1 = b.left + b.width / 2 - 8, y1 = b.top + b.height / 2 - 8;
    var dot = document.createElement('span'); dot.className = 'fly'; document.body.appendChild(dot);
    var anim = dot.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)' },
      { transform: 'translate(' + (x0 + x1) / 2 + 'px,' + (Math.min(y0, y1) - 120) + 'px) scale(1.4)', offset: 0.45 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(0.5)' }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = function () { dot.remove(); done(); };
  }
  function renderBag() {
    thumbs.forEach(function (h) { h.destroy(); }); thumbs = [];
    var list = $('#bagLines'), count = 0, total = 0;
    bag.forEach(function (x) { count += x.qty; total += x.qty * x.price; });
    var bc = $('#bagCount'); bc.hidden = count === 0; bc.textContent = count;
    if (!bag.length) {
      list.innerHTML = '<li class="bag-empty"><b>Your bag is empty</b><span>Start with the bestsellers or build your own.</span></li>';
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
  $('#checkoutBtn').addEventListener('click', function () { toast('Checkout is not part of this draft'); });
  renderBag();

  // ======================= SEARCH =======================
  var searchEl = $('#search'), sInput = $('#searchInput'), sRes = $('#searchResults');
  function openSearch() { searchEl.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(function () { sInput.focus(); }, 30); runSearch(); }
  function closeSearch() { if (searchEl.hidden) return; searchEl.hidden = true; document.body.style.overflow = ''; }
  function runSearch() {
    var q = sInput.value.trim().toLowerCase(), terms = q.split(/\s+/).filter(Boolean);
    var hits = !terms.length ? PRODUCTS : PRODUCTS.filter(function (p) {
      var hay = (p.name + ' ' + p.type + ' ' + p.style + ' ' + TEX[p.texture].label + ' ' + COL[p.colour].name + ' ' + COL[p.colour].code + ' ' + p.tags + (p.tags.indexOf('wigs') >= 0 ? ' glueless' : '')).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) >= 0; });
    });
    function hl(s) { var out = esc(s); terms.forEach(function (t) { if (t.length > 1) out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return out; }
    sRes.innerHTML = hits.length ? hits.map(function (p, i) {
      return '<li><button type="button" data-go="' + p.id + '" style="animation-delay:' + i * 35 + 'ms"><img class="dot" src="assets/img/' + p.img + '.jpg" alt="" style="object-position:' + p.pos + '"><span><b>' + hl(p.name) + '</b><small>' + hl(p.type + ' · ' + p.style + ' · ' + COL[p.colour].name) + '</small></span><span>' + fmt(p.prices[0]) + '+</span></button></li>';
    }).join('') : '<li class="search-none">No match for “' + esc(q) + '”. Try a texture like “deep wave” or a colour like “613”.</li>';
  }
  $('#searchBtn').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  sInput.addEventListener('input', runSearch);
  $('#searchSugg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { sInput.value = b.textContent; runSearch(); sInput.focus(); } });
  sRes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    closeSearch();
    window.__zanteShopGoTo(b.dataset.go);
  });

  // ======================= REVEALS, COUNTERS, FOOTER MARK, RANGE FILL =======================
  (function reveals() {
    if (!('IntersectionObserver' in window) || reduced) {
      $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
      $('.footer-mark').classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.section-head, .match-grid, .lab-grid, .melt-grid, .club-inner').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight * 0.92) { el.setAttribute('data-reveal', ''); el.classList.add('pre'); io.observe(el); }
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, n = +el.dataset.count, suf = el.dataset.suffix || '';
        tween(0, n, 1400, function (v) { el.textContent = Math.round(v) + suf; });
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
    var fm = $('.footer-mark');
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { fm.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe(fm);
  })();
})();
