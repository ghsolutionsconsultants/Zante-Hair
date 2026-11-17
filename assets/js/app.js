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
    { id: 'halfwig', name: 'Kinky Straight Half Wig', type: 'Half wig', img: 'z-halfwig', alt: 'z-halfwig-2', pos: '50% 30%', texture: 'kinkyStraight', style: 'Kinky Straight', colour: '1b', tags: 'wigs curly', lengths: [16, 18, 20], prices: [2450, 2650, 2850], badge: 'Customer favourite', install: ['quick', 'glueless'], vibe: ['curls', 'sleek'] },
    { id: 'upart', name: 'Kinky Straight U-Part Wig', type: 'U-part wig', img: 'z-upart', alt: 'z-upart-2', pos: '50% 28%', texture: 'kinkyStraight', style: 'Kinky Straight', colour: '1b', tags: 'wigs curly', lengths: [16, 18, 20], prices: [2550, 2750, 2950], badge: 'Blends with leave-out', install: ['quick', 'glueless'], vibe: ['curls', 'sleek'] },
    { id: 'thandi', name: 'Thandi Glueless Wig', type: 'Wig', img: 'p-thandi', alt: 'p-thandi-2', pos: '50% 18%', texture: 'body', style: 'Body Wave', colour: '1b', tags: 'wigs wavy', lengths: [18, 22, 26], prices: [3650, 3950, 4450], install: ['glueless'], vibe: ['waves'] },
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

  // real client messages (WhatsApp), shared by Zante. First names left out on purpose.
  var REVIEWS = [
    ['People literally thought it\u2019s my natural hair. I fooled a few people and I was complimented on the hair.', 'It\u2019s a 5 star rating from me'],
    ['Your service was absolutely outstanding. I honestly felt like I matter. It never felt like just another purchase.', 'Supports Black female businesses'],
    ['What a pleasant surprise to receive such a beautifully packaged parcel, with a freshly washed wig and thoughtful freebies.', 'Opened her parcel'],
    ['I\u2019m still loving my Zante hair. I\u2019m actually rocking it now silk pressed.', 'Weeks later'],
    ['People at the office really think it\u2019s my hair.', 'Back at work'],
    ['I really love this hair. And thanks for the gifts inside. I wish there was a way to rate your service because it is top tier.', 'Collected in person'],
    ['You\u2019ve certainly left a beautiful impression on me. I will certainly be back for my second unit.', 'Coming back for more'],
    ['The hair looks and feels amazing! Thank you so much!', 'First wear'],
    ['I collected the wig yesterday. Thank you for your exceptional service and for the extra goodies. I rocked the wig today.', 'Day one']
  ];

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
          '<p class="card-type">' + esc(p.style) + ', ' + esc(COL[p.colour].name.toLowerCase()) + '</p>' +
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
        addToBag({ key: p.id + '-' + p.sel, name: p.name, variant: p.style + ', ' + COL[p.colour].name + ', ' + p.lengths[p.sel] + '"', price: p.prices[p.sel], img: p.img, pos: p.pos }, e.currentTarget);
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
      hint.textContent = p > 0.97 ? 'That’s everything. Keep scrolling for more.' : 'Scroll to see more hair';
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
      addToBag({ key: p.id + '-quiz', name: p.name + (p.sets ? ' × ' + p.sets : ''), variant: COL[p.colour].name + ', ' + p.lengths[mid] + '"', price: best.price, img: p.img, pos: p.pos }, e.currentTarget);
    });
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
    return '<article class="review"><span class="review-stars" aria-label="5 out of 5">★★★★★</span><q>' + esc(r[0]) + '</q>' +
      '<div class="review-who"><span class="review-av" aria-hidden="true">Z</span><p>Verified client<span>Sent on WhatsApp</span></p></div></article>';
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
      list.innerHTML = '<li class="bag-empty"><b>Your bag is empty</b><span>Start with the bestsellers.</span></li>';
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
      return '<li><button type="button" data-go="' + p.id + '" style="animation-delay:' + i * 35 + 'ms"><img class="dot" src="assets/img/' + p.img + '.jpg" alt="" style="object-position:' + p.pos + '"><span><b>' + hl(p.name) + '</b><small>' + hl(p.style + ', ' + COL[p.colour].name) + '</small></span><span>' + fmt(p.prices[0]) + '+</span></button></li>';
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
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.section-head, .match-grid, .melt-grid, .club-inner').forEach(function (el) {
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
  })();
})();
