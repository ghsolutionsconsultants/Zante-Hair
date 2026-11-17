/* Zante Beauty · site behaviour */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' '); }
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 3200); }

  // ======================= PRODUCTS (real prices from Zante's price list) =======================
  // Prices marked est: true are estimates, to be finalised with Zante's price list.
  var L = [10, 12, 14, 16, 18, 20, 22];
  function lens(ls, prices) { return ls.map(function (l, i) { return { label: l + '"', price: prices[i] }; }); }
  var HAIR = ['100% virgin human hair', 'Signature kinky straight texture', '180% density', 'Pre-washed by Zante Beauty before dispatch'];
  var PRODUCTS = [
    { id: 'halfwig', type: 'Half wig', cat: 'wigs', name: 'The Zante Half Wig', short: 'Half Wig', tag: 'Bestseller', line: 'Your everyday style, without the effort.',
      img: 'z-halfwig.jpg', alt: 'z-halfwig-2.jpg', optLabel: 'Length', def: 3,
      opts: lens(L, [2350, 2450, 2600, 2700, 2800, 3050, 3300]),
      details: HAIR.concat(['Wear it with leave-out or a headband', 'Removable, grab-and-go styling']) },
    { id: 'upart', type: 'U-part wig', cat: 'wigs', name: 'The Zante U-Part Wig', short: 'U-Part Wig', tag: 'Natural blend', line: 'The blend you love. The freedom you need.',
      img: 'z-upart.jpg', alt: 'z-upart-2.jpg', optLabel: 'Length', def: 3,
      opts: lens(L, [2400, 2500, 2650, 2750, 2850, 3100, 3350]),
      details: HAIR.concat(['U-shaped leave-out opening', 'Middle or side part', 'Removable and reusable']) },
    { id: 'sleek', type: 'U-part wig', cat: 'wigs', est: true, name: 'Silk Press U-Part Wig', short: 'Silk Press U-Part', tag: 'New', line: 'Sleek and pressed, ready on day one.',
      img: 'z-sleek.jpg', alt: 'z-sleek-2.jpg', optLabel: 'Length', def: 3,
      opts: lens(L, [2700, 2800, 2950, 3050, 3150, 3400, 3650]),
      details: HAIR.concat(['Silk pressed by us before dispatch', 'Returns to its blow-out texture after washing']) },
    { id: 'duo', type: 'Wig set', cat: 'wigs', est: true, name: 'The Zante Duo', short: 'Duo: Half Wig + U-Part', tag: 'Save R400', line: 'Both units, one length. Switch styles all week.',
      img: 'z-upart-front.jpg', alt: 'z-halfwig-side.jpg', optLabel: 'Length', def: 3,
      opts: lens(L, [4350, 4550, 4850, 5050, 5250, 5750, 6250]),
      details: ['One Half Wig and one U-Part Wig in the same length'].concat(HAIR) },
    { id: 'clipins', type: 'Clip-ins', cat: 'extensions', est: true, name: 'Kinky Straight Clip-Ins', short: 'Clip-Ins', line: 'Seven pieces. Instant length and fullness.',
      img: 'z-clip.jpg', alt: 'z-halfwig-back.jpg', optLabel: 'Length', def: 1,
      opts: lens([14, 16, 18, 20, 22], [1650, 1750, 1850, 1990, 2150]),
      details: ['7 pieces, about 120 g', 'Silicone-lined clips'].concat(HAIR) },
    { id: 'bundles', type: 'Bundles', cat: 'extensions', est: true, name: 'Kinky Straight Bundles', short: 'Bundles (set of 3)', line: 'For sew-ins and custom units.',
      img: 'z-texture.jpg', alt: 'z-halfwig-back.jpg', optLabel: 'Length', def: 3,
      opts: lens(L, [1650, 1800, 1950, 2100, 2250, 2450, 2650]),
      details: ['3 bundles, about 100 g each'].concat(HAIR) },
    { id: 'carekit', type: 'Hair care', cat: 'care', est: true, name: 'Zante Care Kit', short: 'Care Kit', line: 'Everything your unit needs between wears.',
      img: null, soon: true, optLabel: 'Kit', def: 0, opts: [{ label: 'Full kit', price: 650 }],
      details: ['Sulphate-free shampoo', 'Moisture conditioner', 'Heat protectant spray', 'Wide-tooth comb'] },
    { id: 'bonnet', type: 'Accessories', cat: 'care', est: true, name: 'Satin Bonnet', short: 'Satin Bonnet', line: 'Protect your hair and your unit overnight.',
      img: null, soon: true, optLabel: 'Colour', def: 0, opts: [{ label: 'Blush', price: 180 }, { label: 'Plum', price: 180 }],
      details: ['Double-layer satin', 'Wide, soft elastic band', 'Fits long units'] },
    { id: 'headbands', type: 'Accessories', cat: 'care', est: true, name: 'Satin Headband Set', short: 'Headband Set', line: 'Three headbands to finish your half wig.',
      img: null, soon: true, optLabel: 'Set', def: 0, opts: [{ label: 'Set of 3', price: 220 }],
      details: ['Plum, blush and champagne', 'Padded satin, gentle on edges'] },
    { id: 'stand', type: 'Tools', cat: 'care', est: true, name: 'Mannequin Head and Stand', short: 'Mannequin and Stand', line: 'Store, style and wash your unit with ease.',
      img: null, soon: true, optLabel: 'Set', def: 0, opts: [{ label: 'Head + tripod', price: 450 }],
      details: ['Canvas head with pin-friendly surface', 'Adjustable tripod stand'] },
    { id: 'heat', type: 'Hair care', cat: 'care', est: true, name: 'Zante Heat Shield', short: 'Heat Shield', line: 'Heat protection for silk presses and curls.',
      img: null, soon: true, optLabel: 'Size', def: 0, opts: [{ label: '200 ml', price: 220 }],
      details: ['Protects up to 230°C', 'Light, non-greasy finish', 'Safe for virgin human hair'] },
    { id: 'grip', type: 'Accessories', cat: 'care', est: true, name: 'Velvet Wig Grip', short: 'Wig Grip', line: 'Keeps your unit secure, no glue needed.',
      img: null, soon: true, optLabel: 'Colour', def: 0, opts: [{ label: 'Plum', price: 150 }, { label: 'Black', price: 150 }],
      details: ['Soft velvet band', 'Adjustable fastening', 'Gentle on edges'] },
    { id: 'comb', type: 'Tools', cat: 'care', est: true, name: 'Wide-Tooth Detangling Comb', short: 'Detangling Comb', line: 'Detangle gently without pulling.',
      img: null, soon: true, optLabel: 'Size', def: 0, opts: [{ label: 'One size', price: 90 }],
      details: ['Seamless teeth', 'For wet or dry hair'] },
    { id: 'wigbag', type: 'Accessories', cat: 'care', est: true, name: 'Satin Wig Bag', short: 'Wig Bag', line: 'Store and travel with your unit tangle-free.',
      img: null, soon: true, optLabel: 'Size', def: 0, opts: [{ label: 'Fits up to 22"', price: 250 }],
      details: ['Satin lined', 'Drawstring close', 'Fits up to 22" units'] },
    { id: 'giftcard', type: 'Gift card', cat: 'gifts', est: true, name: 'Zante Gift Card', short: 'Gift Card', tag: 'Gift', line: 'Give her styling freedom.',
      img: 'prod-giftcard.svg', optLabel: 'Amount', def: 1, opts: [500, 1000, 2500, 3000].map(function (v) { return { label: fmt(v), price: v }; }),
      details: ['Sent by email', 'Use on any drop', 'Valid for 3 years'] }
  ];

  var REVIEWS = [
    ['People literally thought it’s my natural hair. I fooled a few people and I was complimented on the hair.', 5],
    ['Your service was absolutely outstanding. I honestly felt like I matter. It never felt like just another purchase.', 5],
    ['What a pleasant surprise to receive such a beautifully packaged parcel, with a freshly washed wig and thoughtful freebies.', 5],
    ['I’m still loving my Zante hair. I’m actually rocking it now silk pressed.', 5],
    ['People at the office really think it’s my hair.', 5],
    ['I really love this hair. And thanks for the gifts inside. I wish there was a way to rate your service because it is top tier.', 5],
    ['You’ve certainly left a beautiful impression on me. I will certainly be back for my second unit.', 5],
    ['The hair looks and feels amazing! Thank you so much!', 5],
    ['I collected the wig yesterday. Thank you for your exceptional service and for the extra goodies. I rocked the wig today.', 5]
  ];

  var FAQS = [
    ['Is your hair 100% human hair?', 'Yes. Our units are made from 100% virgin human hair in our signature kinky straight texture.', 'hair'],
    ['What does 180% density mean?', 'Density describes how full your wig is. All our standard units are 180% density. It is about fullness, not length.', 'hair'],
    ['Why do your units look longer than most?', 'Our hair is true to length, so you get the full inches you pay for.', 'hair'],
    ['Half wig or U-part: which is more protective?', 'Both help you protect your natural hair. Choose the one that suits your lifestyle. Our hair guide above can help.', 'styling'],
    ['Can I wear a middle or side part with a half wig?', 'Not a defined part. You can wear a middle or side flip-over with no distinct parting. If you want a defined part, choose the U-part wig.', 'styling'],
    ['Can I straighten or curl my Zante unit?', 'Yes. It is human hair and can be heat styled. Always use heat protection and moderate temperatures. The natural texture can return after washing, moisture or high humidity.', 'styling'],
    ['Can kinky straight be bone straight?', 'It can be silk pressed for a straight finish, but it keeps a subtle texture. It gives a fuller, more natural-looking straight finish rather than bone straight.', 'styling'],
    ['Once I silk press my unit, will it stay straight?', 'No. The hair goes back to its natural, full blow-out texture after washing, moisture or high humidity.', 'styling'],
    ['Do I need to straighten my natural hair?', 'Not always. It depends on your natural texture and the look you want. Avoid unnecessary heat or tension, and style the unit to match your hair.', 'styling'],
    ['Can I colour a Zante unit?', 'Yes, human hair can be coloured, but results vary and colour can affect the condition of the hair. We recommend a professional colourist and a strand test first.', 'styling'],
    ['Can I sew in my Zante unit?', 'Yes. Remove the clips and combs first so they do not rub against and damage your natural hair.', 'styling'],
    ['Are the wigs ready to wear?', 'Yes. We inspect and pre-wash every unit before dispatch at no extra cost. If you may want to return it, please do not wear it, so it stays eligible for a refund.', 'orders'],
    ['Why do preorders take longer?', 'We group orders into a production drop before the hair is made and shipped to South Africa. This lets us source and prepare every unit properly. Allow 3 to 4 weeks from your drop’s cut-off.', 'orders'],
    ['Can I change my order after payment?', 'Contact us as soon as possible. Changes may be possible before your drop closes, but we cannot guarantee them once the drop has gone to production.', 'orders'],
    ['Do you offer installation?', 'Not at the moment. Our collection is designed for beginner-friendly, DIY, removable styling.', 'orders']
  ];

  // ======================= THEME =======================
  function applyMode(m) {
    html.dataset.mode = m;
    $('#themeBtn').setAttribute('aria-label', m === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    $('#themeBtnM').textContent = m === 'dark' ? 'Light mode' : 'Dark mode';
  }
  applyMode(store('zante-mode') === 'dark' ? 'dark' : 'light');
  function toggleTheme() { var n = html.dataset.mode === 'dark' ? 'light' : 'dark'; store('zante-mode', n); applyMode(n); }
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#themeBtnM').addEventListener('click', toggleTheme);

  // ======================= INTRO =======================
  (function intro() {
    var el = $('#intro'); if (!el) return;
    var seen = false;
    try { seen = sessionStorage.getItem('zante-intro') === '1'; sessionStorage.setItem('zante-intro', '1'); } catch (e) { /* private mode */ }
    setTimeout(function () { el.classList.add('is-done'); }, seen || reduce ? 0 : 1400);
  })();

  // ======================= MENU =======================
  var burger = $('#burger'), mnav = $('#mnav');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
  });
  $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); mnav.classList.remove('is-open'); }); });

  // ======================= THE ZANTE HAIR DROP =======================
  // Cut-offs: first and third Monday of each month, 18:00 SAST (UTC+2, no daylight saving).
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function nthMonday(y, m, n) {
    var first = new Date(Date.UTC(y, m, 1)).getUTCDay();         // 0 Sunday … 6 Saturday
    var day = 1 + ((8 - first) % 7) + (n - 1) * 7;                 // date of the nth Monday
    return new Date(Date.UTC(y, m, day, 16, 0, 0));                // 18:00 SAST = 16:00 UTC
  }
  function upcomingDrops(count, from) {
    var out = [], now = from || new Date(), y = now.getUTCFullYear(), m = now.getUTCMonth();
    while (out.length < count) {
      [1, 3].forEach(function (n) {
        var d = nthMonday(y, m, n);
        if (d > now && out.length < count) {
          out.push({
            close: d, first: n === 1,
            name: (n === 1 ? 'The First Drop' : 'The Second Drop') + ' – ' + MONTHS[m] + ' ' + y,
            ref: 'ZB-' + y + '-' + String(m + 1).padStart(2, '0') + '-0' + (n === 1 ? 1 : 2)
          });
        }
      });
      m++; if (m > 11) { m = 0; y++; }
    }
    return out;
  }
  function sastDate(d) {
    var s = new Date(d.getTime() + 2 * 3600e3);
    return 'Monday ' + s.getUTCDate() + ' ' + MONTHS[s.getUTCMonth()];
  }
  var current;
  function renderDrops() {
    var list = upcomingDrops(4);
    current = list[0];
    $$('[data-drop-name]').forEach(function (el) { el.textContent = current.name; });
    $$('[data-drop-date]').forEach(function (el) { el.textContent = sastDate(current.close); });
    $$('[data-drop-close]').forEach(function (el) { el.textContent = sastDate(current.close) + ' at 18:00 SAST'; });
    var dd = $('#dropDates'); if (dd) dd.innerHTML = list.map(function (d, i) {
      var s = new Date(d.close.getTime() + 2 * 3600e3);
      return '<li class="' + (i ? '' : 'is-next') + '"><span class="cal-date"><small>Mon</small><b>' + s.getUTCDate() + '</b><small>' + MONTHS[s.getUTCMonth()].slice(0, 3) + '</small></span>' +
        '<span class="cal-info"><b>' + esc(d.name.split(' – ')[0]) + '</b><small>' + esc(MONTHS[s.getUTCMonth()] + ' ' + s.getUTCFullYear()) + ' · closes 18:00 SAST</small></span>' +
        (i ? '' : '<span class="cal-tag">Open now</span>') + '</li>';
    }).join('');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var left = current.close - new Date();
    if (left <= 0) { renderDrops(); left = current.close - new Date(); } // never count down to a past date
    var s = Math.floor(left / 1000);
    var v = { d: pad(Math.floor(s / 86400)), h: pad(Math.floor(s % 86400 / 3600)), m: pad(Math.floor(s % 3600 / 60)), s: pad(s % 60) };
    $$('[data-cd]').forEach(function (el) {
      var nv = v[el.dataset.cd];
      if (el.textContent === nv) return;
      el.textContent = nv;
      if (!reduce) { el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
    });
  }
  renderDrops(); tick(); setInterval(tick, 1000);

  // ======================= BAG =======================
  var BAG_KEY = 'zante-bag4', bag = [];
  try { bag = JSON.parse(store(BAG_KEY) || '[]') || []; } catch (e) { bag = []; }
  var drawer = $('#bag'), scrim = $('#scrim');
  function saveBag() { store(BAG_KEY, JSON.stringify(bag)); renderBag(); }
  function renderBag() {
    var n = bag.reduce(function (a, b) { return a + b.qty; }, 0), total = bag.reduce(function (a, b) { return a + b.qty * b.price; }, 0);
    $('#bagCount').textContent = n;
    $('#bagBtn').setAttribute('aria-label', 'Open bag, ' + n + ' item' + (n === 1 ? '' : 's'));
    $('#bagList').innerHTML = bag.length ? bag.map(function (b, i) {
      return '<li class="bag-item"><img src="assets/img/' + b.img + '" alt=""><div><p>' + esc(b.name) + (b.qty > 1 ? ' × ' + b.qty : '') + '</p><small>' + esc(b.variant) + '</small><br><button type="button" data-rm="' + i + '">Remove</button></div><b>' + fmt(b.price * b.qty) + '</b></li>';
    }).join('') : '<li class="bag-empty">Your bag is empty.</li>';
    var up = $('#bagUpsell');
    if (up) {
      var inBag = bag.map(function (b) { return b.key.split('-')[0]; });
      var picks = PRODUCTS.filter(function (p) { return !p.soon && p.img && inBag.indexOf(p.id) < 0; }).map(function (p) { return p.id; }).slice(0, 3);
      up.innerHTML = bag.length && picks.length ? '<p class="small">Complete your look</p><div class="upsell">' + picks.map(function (id) {
        var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
        return '<button type="button" class="up-item" data-up="' + id + '"><img src="assets/img/' + p.img + '" alt=""><span>' + esc(p.short) + '<b>' + fmt(p.opts[0].price) + '</b></span><i aria-hidden="true">+</i></button>';
      }).join('') + '</div>' : '';
    }
    $('#bagTotal').textContent = fmt(total);
    $('#bagPjn').textContent = total ? 'Or 3 × ' + fmt(total / 3) + ' with PayJustNow. Delivery is calculated at checkout.' : 'Delivery is calculated at checkout.';
  }
  function addToBag(item) {
    var found = bag.filter(function (b) { return b.key === item.key; })[0];
    if (found) found.qty++; else { item.qty = 1; bag.push(item); }
    saveBag();
    var c = $('#bagCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    toast(item.name + ', ' + item.variant + ' added to ' + current.name.split(' – ')[0]);
  }
  function openBag(open) {
    drawer.classList.toggle('is-open', open); drawer.setAttribute('aria-hidden', !open); scrim.hidden = !open;
    if (open) $('#bagClose').focus();
  }
  $('#bagBtn').addEventListener('click', function () { openBag(true); });
  $('#bagClose').addEventListener('click', function () { openBag(false); });
  scrim.addEventListener('click', function () { openBag(false); });
  var upEl = $('#bagUpsell');
  if (upEl) upEl.addEventListener('click', function (e) {
    var u = e.target.closest('[data-up]'); if (!u) return;
    var p = PRODUCTS.filter(function (x) { return x.id === u.dataset.up; })[0], o = p.opts[p.def];
    addToBag({ key: p.id + '-' + p.def, name: p.short, variant: p.optLabel + ': ' + o.label, price: o.price, img: p.img });
  });
  $('#bagList').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (!b) return; bag.splice(+b.dataset.rm, 1); saveBag(); });
  $('#checkoutBtn').addEventListener('click', function () { toast('Checkout opens with our launch. Message us on WhatsApp to order now.'); });
  renderBag();

  // ======================= LIVE HERO =======================
  (function liveHero() {
    var hero = $('#hero.hero--live'); if (!hero) return;
    // 1. rotating word
    var words = ['Your way.', 'Your texture.', 'Your freedom.', 'Your rules.', 'Your style.'], wi = 0;
    var rot = $('.rot-word', hero);
    // 2. slideshows with story bars, the two sides offset so something always changes
    var DUR = 4800;
    var shows = $$('.split-panel', hero).map(function (panel, k) {
      var slides = $$('.slide', panel), bars = $('.bars', panel);
      bars.innerHTML = slides.map(function () { return '<i><b></b></i>'; }).join('');
      return { panel: panel, slides: slides, bars: $$('i', bars), i: 0, offset: k * (DUR / 2) };
    });
    function show(s, i) {
      s.slides.forEach(function (el, j) {
        var on = j === i;
        el.classList.toggle('is-on', on);
        if (el.tagName === 'VIDEO') {
          if (on) { if (!el.src) el.src = el.dataset.src; el.currentTime = 0; el.play().catch(function () {}); } else el.pause();
        }
      });
      s.bars.forEach(function (b, j) { b.className = j < i ? 'done' : j === i ? 'run' : ''; });
      s.i = i;
    }
    var running = false, timers = [];
    function start() {
      if (running || reduce) return; running = true;
      shows.forEach(function (s) {
        show(s, s.i);
        timers.push(setTimeout(function step() {
          show(s, (s.i + 1) % s.slides.length);
          timers.push(setTimeout(step, DUR));
        }, DUR - s.offset));
      });
      timers.push(setInterval(function () {
        wi = (wi + 1) % words.length;
        rot.classList.add('out');
        setTimeout(function () { rot.textContent = words[wi]; rot.classList.remove('out'); rot.classList.add('in'); setTimeout(function () { rot.classList.remove('in'); }, 450); }, 280);
      }, 2600));
    }
    function stop() { running = false; timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; shows.forEach(function (s) { s.bars.forEach(function (b) { if (b.className === 'run') b.className = 'paused'; }); }); }
    if (reduce) { shows.forEach(function (s) { show(s, 0); }); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.15 }).observe(hero);
    else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    // 3. pointer parallax
    var split = $('#split');
    split.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = split.getBoundingClientRect();
      split.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      split.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    split.addEventListener('pointerleave', function () { split.style.setProperty('--px', 0); split.style.setProperty('--py', 0); });
  })();

  // ======================= HERO MOTION DESIGN =======================
  (function heroMotion() {
    var heroes = $$('.hero--live, .page-hero--rich');
    if (!heroes.length) return;
    // 1. masked word reveal on the headline
    heroes.forEach(function (h) {
      var t = $('.hero-title, .page-title', h); if (!t || t.dataset.split) return;
      t.dataset.split = '1';
      var i = 0;
      function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              var m = document.createElement('span'); m.className = 'mw';
              var s = document.createElement('span'); s.className = 'mw-in'; s.style.setProperty('--i', i++); s.textContent = w;
              m.appendChild(s); frag.appendChild(m);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.classList.contains('rotator')) {
            var m2 = document.createElement('span'); m2.className = 'mw';
            n.parentNode.insertBefore(m2, n); m2.appendChild(n); n.classList.add('mw-in'); n.style.setProperty('--i', i++);
          } else if (n.nodeType === 1) { wrap(n); }
        });
      }
      wrap(t);
    });
    requestAnimationFrame(function () { setTimeout(function () { heroes.forEach(function (h) { h.classList.add('is-live'); }); }, document.getElementById('intro') && !reduce ? 1100 : 60); });
    if (reduce) return;

    // 2. pointer: tilt, parallax, spotlight
    heroes.forEach(function (h) {
      h.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = h.getBoundingClientRect();
        h.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        h.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        h.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        h.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      });
      h.addEventListener('pointerleave', function () { h.style.setProperty('--mx', 0); h.style.setProperty('--my', 0); });
    });

    // 3. scroll-linked depth, plus marquee speed from scroll velocity
    var lastY = scrollY, vel = 0, ticking = false;
    function frame() {
      ticking = false;
      var y = scrollY; vel = vel * 0.85 + (y - lastY) * 0.15; lastY = y;
      heroes.forEach(function (h) {
        var r = h.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
        h.style.setProperty('--sy', p.toFixed(3));
        h.style.setProperty('--vel', Math.max(-1, Math.min(1, vel / 40)).toFixed(3));
      });
      if (Math.abs(vel) > 0.1) { ticking = true; requestAnimationFrame(frame); }
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });

    // 4. magnetic buttons
    $$('.hero--live .btn, .page-hero--rich .btn').forEach(function (b) {
      b.classList.add('magnetic');
      b.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  })();

  // ======================= PRODUCTS =======================
  // <div id="products" data-limit="4" data-cat="wigs"> renders a grid; #shopFilters adds category chips.
  var SOON_TILE = '<div class="soon-tile" aria-hidden="true"><span class="soon-z">Zante</span><span class="soon-t">Photo coming soon</span></div>';
  function pimg(p, cls) { return p.img ? '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="assets/img/' + p.img + '" alt="' + esc(p.name) + '" loading="lazy" width="400" height="500">' : SOON_TILE; }
  function thumb(p) { return p.img ? '<img src="assets/img/' + p.img + '" alt="">' : '<span class="soon-mini" aria-hidden="true">Z</span>'; }
  function card(p) {
    var o = p.opts[p.def];
    return '<article class="pcard" id="p-' + p.id + '" data-id="' + p.id + '" data-cat="' + p.cat + '">' +
      '<div class="pcard-media" data-quick="' + p.id + '" role="button" tabindex="0" aria-label="Quick view: ' + esc(p.name) + '">' +
        (p.soon ? '<span class="tag tag--soon">Coming soon</span>' : p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
        pimg(p) +
        (p.alt ? '<img class="alt" src="assets/img/' + p.alt + '" alt="" loading="lazy" width="400" height="500">' : '') +
      '<span class="qv-hint">Quick view</span></div>' +
      '<div class="pcard-body">' +
        '<h3 class="pcard-name"><button type="button" data-quick="' + p.id + '">' + esc(p.name) + '</button></h3>' +
        '<p class="pcard-line">' + esc(p.line) + '</p>' +
        '<div class="pcard-row">' +
          (p.opts.length > 1 ? '<label class="pcard-opt"><span class="sr">' + p.optLabel + '</span><select data-opt>' +
            p.opts.map(function (x, i) { return '<option value="' + i + '"' + (i === p.def ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('') +
          '</select></label>' : '<span class="pcard-single">' + esc(o.label) + '</span>') +
          '<p class="pcard-price"><b>' + fmt(o.price) + '</b></p>' +
        '</div>' +
        '<p class="pcard-pjn">or 3 × <span>' + fmt(o.price / 3) + '</span> PayJustNow</p>' +
        (p.soon ? '<button type="button" class="btn btn--sm" data-notify>Notify me</button>' : '<button type="button" class="btn btn--solid btn--sm" data-add>Add to bag</button>') +
        '<details class="pcard-more"><summary>Details</summary><ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></details>' +
      '</div></article>';
  }
  $$('[data-products]').forEach(function (grid) {
    var lim = +grid.dataset.limit || PRODUCTS.length, cat = grid.dataset.cat;
    grid.innerHTML = PRODUCTS.filter(function (p) { return !cat || p.cat === cat; }).slice(0, lim).map(card).join('');
  });
  $$('.pcard').forEach(function (el) {
    var p = PRODUCTS.filter(function (x) { return x.id === el.dataset.id; })[0], sel = p.def;
    var s = $('[data-opt]', el);
    if (s) s.addEventListener('change', function () {
      sel = +s.value;
      $('.pcard-price b', el).textContent = fmt(p.opts[sel].price);
      $('.pcard-pjn span', el).textContent = fmt(p.opts[sel].price / 3);
    });
    var nb = $('[data-notify]', el);
    if (nb) nb.addEventListener('click', function () { toast('We will let you know when ' + p.short + ' is available. Join the list below for drop reminders.'); });
    var ab = $('[data-add]', el);
    if (ab) ab.addEventListener('click', function () {
      var o = p.opts[sel];
      addToBag({ key: p.id + '-' + sel, name: p.short, variant: p.optLabel + ': ' + o.label, price: o.price, img: p.img });
    });
  });
  // ======================= SHOP FILTERS =======================
  var CATS = { all: 'All', wigs: 'Wigs', extensions: 'Extensions', care: 'Care and accessories', gifts: 'Gifts' };
  var catTabs = $('#catTabs');
  if (catTabs) (function shopFilters() {
    var state = { cat: 'all', lengths: [], price: '', types: [], flags: [], sort: 'featured' };
    var grid = $('#products'), fpanel = $('#fpanel');
    var allLens = [10, 12, 14, 16, 18, 20, 22];
    var types = PRODUCTS.map(function (p) { return p.type; }).filter(function (t, i, a) { return a.indexOf(t) === i; });
    $('#fLength').innerHTML = allLens.map(function (l) { return '<label class="fchip"><input type="checkbox" value="' + l + '"><span>' + l + '"</span></label>'; }).join('');
    $('#fType').innerHTML = types.map(function (t) { return '<label class="fcheck"><input type="checkbox" value="' + esc(t) + '" data-type> ' + esc(t) + '</label>'; }).join('');

    function flagsOf(p) { var t = (p.tag || '').toLowerCase(), f = []; if (t === 'new') f.push('new'); if (t === 'bestseller') f.push('best'); if (/save/.test(t)) f.push('deal'); return f; }
    function minPrice(p) { return Math.min.apply(null, p.opts.map(function (o) { return o.price; })); }
    function match(p, ignoreCat) {
      if (!ignoreCat && state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.lengths.length && !p.opts.some(function (o) { return state.lengths.indexOf(parseInt(o.label, 10)) > -1; })) return false;
      if (state.price) {
        var r = state.price.split('-'), cand = p.opts.filter(function (o) { return !state.lengths.length || state.lengths.indexOf(parseInt(o.label, 10)) > -1; });
        if (!cand.some(function (o) { return o.price >= +r[0] && o.price < +r[1]; })) return false;
      }
      if (state.types.length && state.types.indexOf(p.type) < 0) return false;
      if (state.flags.length && !state.flags.some(function (f) { return flagsOf(p).indexOf(f) > -1; })) return false;
      return true;
    }
    function apply() {
      var list = PRODUCTS.filter(function (p) { return match(p); });
      list.sort(function (a, b) { return (a.soon ? 1 : 0) - (b.soon ? 1 : 0); });
      var soonLast = function (a, b) { return (a.soon ? 1 : 0) - (b.soon ? 1 : 0); };
      if (state.sort === 'price-asc') list.sort(function (a, b) { return soonLast(a, b) || minPrice(a) - minPrice(b); });
      if (state.sort === 'price-desc') list.sort(function (a, b) { return soonLast(a, b) || minPrice(b) - minPrice(a); });
      if (state.sort === 'name') list.sort(function (a, b) { return soonLast(a, b) || a.name.localeCompare(b.name); });
      var cards = {};
      $$('.pcard', grid).forEach(function (c) { cards[c.dataset.id] = c; c.hidden = true; });
      list.forEach(function (p) { var c = cards[p.id]; c.hidden = false; grid.appendChild(c); });
      var n = list.length;
      $('#shopCount').textContent = n + ' product' + (n === 1 ? '' : 's') + (state.cat !== 'all' ? ' in ' + CATS[state.cat] : '');
      $('#fCount').textContent = n;
      $('#shopEmpty').hidden = n > 0;
      // category counts honour the other filters
      $$('.cat-tab', catTabs).forEach(function (b) {
        var c = b.dataset.cat, k = PRODUCTS.filter(function (p) { return match(p, true) && (c === 'all' || p.cat === c); }).length;
        b.innerHTML = CATS[c] + ' <span>' + k + '</span>';
      });
      // active filter pills
      var pills = [];
      state.lengths.forEach(function (l) { pills.push(['len', l, l + '"']); });
      if (state.price) pills.push(['price', state.price, $('input[name="fprice"][value="' + state.price + '"]').parentNode.textContent.trim()]);
      state.types.forEach(function (t) { pills.push(['type', t, t]); });
      state.flags.forEach(function (f) { pills.push(['flag', f, { new: 'New in', best: 'Bestsellers', deal: 'Deals' }[f]]); });
      $('#activeFilters').innerHTML = pills.map(function (x) { return '<button type="button" class="pill" data-k="' + x[0] + '" data-v="' + esc(x[1]) + '">' + esc(x[2]) + ' <span aria-hidden="true">×</span><span class="sr"> remove filter</span></button>'; }).join('') +
        (pills.length ? '<button type="button" class="pill pill--clear" data-clear>Clear all</button>' : '');
      var b = $('#fBadge'); b.hidden = !pills.length; b.textContent = pills.length;
      try { history.replaceState(null, '', state.cat === 'all' ? location.pathname : '#cat-' + state.cat); } catch (e) { /* file:// */ }
    }
    function readInputs() {
      state.lengths = $$('#fLength input:checked').map(function (i) { return +i.value; });
      state.price = ($('input[name="fprice"]:checked') || {}).value || '';
      state.types = $$('[data-type]:checked').map(function (i) { return i.value; });
      state.flags = $$('[data-flag]:checked').map(function (i) { return i.value; });
      apply();
    }
    function clearAll() {
      $$('input[type="checkbox"]', fpanel).forEach(function (i) { i.checked = false; });
      $('input[name="fprice"][value=""]').checked = true;
      readInputs();
    }
    fpanel.addEventListener('change', readInputs);
    $('#fClear').addEventListener('click', clearAll);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear]')) { clearAll(); return; }
      var pill = e.target.closest('.pill[data-k]'); if (!pill) return;
      var k = pill.dataset.k, v = pill.dataset.v;
      if (k === 'len') $('#fLength input[value="' + v + '"]').checked = false;
      if (k === 'price') $('input[name="fprice"][value=""]').checked = true;
      if (k === 'type') $$('[data-type]').forEach(function (i) { if (i.value === v) i.checked = false; });
      if (k === 'flag') $('[data-flag][value="' + v + '"]').checked = false;
      readInputs();
    });
    catTabs.addEventListener('click', function (e) {
      var b = e.target.closest('.cat-tab'); if (!b) return;
      state.cat = b.dataset.cat;
      $$('.cat-tab', catTabs).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      apply();
    });
    $('#fSort').addEventListener('change', function () { state.sort = this.value; apply(); });
    // mobile sheet
    function sheet(open) { fpanel.classList.toggle('is-open', open); document.body.classList.toggle('no-scroll', open); if (open) $('#fClose').focus(); }
    $('#fOpen').addEventListener('click', function () { sheet(true); });
    $('#fClose').addEventListener('click', function () { sheet(false); });
    $('#fApply').addEventListener('click', function () { sheet(false); grid.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') sheet(false); });

    var want = (location.hash.match(/^#cat-(\w+)/) || [])[1];
    var wb = want && $('.cat-tab[data-cat="' + want + '"]', catTabs);
    if (wb) wb.click(); else apply();
  })();

  // ======================= QUICK VIEW =======================
  var qv = $('#quickView');
  function bodyAt(len) { // where a length falls on a 165 cm frame (inches from the crown, roughly)
    var m = { 10: ['Chin to shoulder', 30], 12: ['Shoulder', 36], 14: ['Below the shoulder', 42], 16: ['Collarbone to chest', 49], 18: ['Mid-chest', 56], 20: ['Bra strap', 63], 22: ['Mid-back', 70] };
    return m[len] || null;
  }
  function openQuick(id) {
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0]; if (!p || !qv) return;
    var sel = p.def, imgs = p.img ? [p.img].concat(p.alt ? [p.alt] : []) : [];
    function lensRow() {
      var l = parseInt(p.opts[sel].label, 10), at = bodyAt(l);
      return at ? '<div class="lv"><svg viewBox="0 0 120 100" aria-hidden="true"><circle cx="60" cy="18" r="11" fill="currentColor" opacity=".18"/><path d="M38 100 C38 60 44 40 60 36 C76 40 82 60 82 100" fill="currentColor" opacity=".12"/>' +
        '<path d="M49 12 C40 30 42 ' + (at[1]) + ' 44 ' + (at[1] + 6) + ' M71 12 C80 30 78 ' + at[1] + ' 76 ' + (at[1] + 6) + '" stroke="var(--pink-ink)" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<line x1="20" x2="100" y1="' + (at[1] + 6) + '" y2="' + (at[1] + 6) + '" stroke="var(--purple)" stroke-dasharray="3 3"/></svg><p><b>' + l + '" length</b><span>Falls about at: ' + at[0] + '</span><small>Based on an average height. Kinky straight hair is true to length.</small></p></div>' : '';
    }
    function render() {
      var o = p.opts[sel];
      qv.querySelector('.qv-box').innerHTML =
        '<button class="icon-btn qv-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
        '<div class="qv-media">' + (imgs.length ? '<img class="qv-main" src="assets/img/' + imgs[0] + '" alt="' + esc(p.name) + '">' : '<div class="qv-main qv-soon">' + SOON_TILE + '</div>') +
          (imgs.length > 1 ? '<div class="qv-thumbs">' + imgs.map(function (s, i) { return '<button type="button" data-img="' + s + '" class="' + (i ? '' : 'is-on') + '"><img src="assets/img/' + s + '" alt="View ' + (i + 1) + '"></button>'; }).join('') + '</div>' : '') + '</div>' +
        '<div class="qv-info">' + (p.soon ? '<span class="tag tag--inline">Coming soon</span>' : p.tag ? '<span class="tag tag--inline">' + esc(p.tag) + '</span>' : '') +
          '<h2 class="qv-name" id="qvTitle">' + esc(p.name) + '</h2><p class="product-line">' + esc(p.line) + '</p>' +
          '<p class="qv-price"><b>' + fmt(o.price) + '</b> <span>or 3 × ' + fmt(o.price / 3) + ' with PayJustNow</span></p>' +
          (p.opts.length > 1 ? '<p class="lens-label">' + p.optLabel + '</p><div class="lens" role="group" aria-label="' + p.optLabel + '">' + p.opts.map(function (x, i) { return '<button type="button" data-i="' + i + '" class="' + (i === sel ? 'is-on' : '') + '" aria-pressed="' + (i === sel) + '">' + esc(x.label) + '</button>'; }).join('') + '</div>' : '') +
          lensRow() +
          (p.soon ? '<button type="button" class="btn btn--full" data-qnotify>Notify me when available</button>' : '<button type="button" class="btn btn--solid btn--full" data-qadd>Add to bag</button>') +
          (p.soon ? '<p class="small qv-drop">Coming soon. Prices are a guide and may change at launch.</p>' : '<p class="small qv-drop">Ships with <b>' + esc(current.name) + '</b>. Pre-washed before dispatch.</p>') +
          '<ul class="ticks">' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
        '</div>';
    }
    render();
    qv.hidden = false; document.body.classList.add('no-scroll');
    qv.onclick = function (e) {
      if (e.target === qv || e.target.closest('.qv-close')) { closeQuick(); return; }
      var t = e.target.closest('[data-img]');
      if (t) { $('.qv-main', qv).src = 'assets/img/' + t.dataset.img; $$('.qv-thumbs button', qv).forEach(function (x) { x.classList.toggle('is-on', x === t); }); return; }
      var l = e.target.closest('.lens button'); if (l) { sel = +l.dataset.i; render(); return; }
      if (e.target.closest('[data-qnotify]')) { toast('We will let you know when ' + p.short + ' is available.'); closeQuick(); return; }
      if (e.target.closest('[data-qadd]')) { var o = p.opts[sel]; addToBag({ key: p.id + '-' + sel, name: p.short, variant: p.optLabel + ': ' + o.label, price: o.price, img: p.img }); closeQuick(); }
    };
    $('.qv-close', qv).focus();
  }
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.pcard-media[data-quick]')) { e.preventDefault(); openQuick(e.target.dataset.quick); } });
  function closeQuick() { if (!qv || qv.hidden) return; qv.hidden = true; document.body.classList.remove('no-scroll'); }
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQuick(); });
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-quick]'); if (!q) return;
    e.preventDefault(); openQuick(q.dataset.quick);
  });

  // ======================= SEARCH =======================
  var so = $('#searchOverlay'), si = $('#searchInput'), sr = $('#searchResults');
  function openSearch(open) {
    if (!so) return;
    so.hidden = !open; document.body.classList.toggle('no-scroll', open);
    if (open) { si.value = ''; renderSearch(''); setTimeout(function () { si.focus(); }, 30); }
  }
  function renderSearch(q) {
    var t = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var hits = PRODUCTS.filter(function (p) {
      var hay = (p.name + ' ' + p.type + ' ' + p.line + ' ' + CATS[p.cat] + ' ' + p.details.join(' ')).toLowerCase();
      return t.every(function (w) { return hay.indexOf(w) > -1; });
    });
    sr.innerHTML = (t.length ? '' : '<p class="small">Popular</p>') + (hits.length ? hits.slice(0, t.length ? 8 : 4).map(function (p) {
      return '<button type="button" class="sr-item" data-quick="' + p.id + '">' + thumb(p) + '<span><b>' + esc(p.name) + '</b><small>' + esc(p.type) + (p.soon ? ' · coming soon' : '') + ' · from ' + fmt(Math.min.apply(null, p.opts.map(function (o) { return o.price; }))) + '</small></span></button>';
    }).join('') : '<p class="small">No products found. Try "half wig", "U-part" or "bonnet".</p>');
  }
  if (so) {
    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', function () { openSearch(true); }); });
    $('[data-search-close]', so).addEventListener('click', function () { openSearch(false); });
    so.addEventListener('click', function (e) { if (e.target === so) openSearch(false); if (e.target.closest('[data-quick]')) openSearch(false); });
    si.addEventListener('input', function () { renderSearch(si.value); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') openSearch(false);
      if (e.key === '/' && so.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(true); }
    });
  }

  // ======================= RAILS (drag on desktop) =======================
  $$('.rail').forEach(function (rail) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); } rail.scrollLeft = s0 - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { rail.classList.remove('is-dragging'); }, 30); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  // ======================= VIDEOS =======================
  var reels = $$('.reel');
  var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = $('video', en.target);
      if (en.isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; }
        if (!reduce) v.play().catch(function () {});
      } else { v.pause(); }
    });
  }, { threshold: 0.4 }) : null;
  reels.forEach(function (r) {
    if (vio) vio.observe(r); else { var v0 = $('video', r); v0.src = v0.dataset.src; }
    r.addEventListener('click', function () {
      var v = $('video', r), turnOn = v.muted;
      reels.forEach(function (o) { $('video', o).muted = true; o.classList.remove('has-sound'); });
      if (!v.src) v.src = v.dataset.src;
      v.muted = !turnOn; r.classList.toggle('has-sound', turnOn);
      v.play().catch(function () {});
    });
  });
  if (reduce) $$('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // ======================= REVIEWS =======================
  // Review record, the same shape as the Supabase table in supabase/schema.sql:
  // { rating 1–5, product 'halfwig'|'upart', length_in, body, order_ref, city, consent: true, status: 'pending' }
  var CFG = window.ZANTE_CONFIG || {};
  var LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  var PENDING_KEY = 'zante-reviews-pending';
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey, 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + path, opts);
  }
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  function reviewCard(r) {
    var prod = r.product === 'upart' ? 'U-Part Wig' : r.product === 'halfwig' ? 'Half Wig' : '';
    var meta = r.pending ? 'Waiting for approval' : [prod && (prod + (r.length_in ? ' ' + r.length_in + '"' : '')), r.city].filter(Boolean).join(', ') || 'Sent on WhatsApp';
    return '<article class="review' + (r.pending ? ' is-pending' : '') + '"><span class="review-stars" aria-label="' + r.rating + ' out of 5">' + stars(r.rating) + '</span><q>' + esc(r.body) + '</q>' +
      '<div class="review-who"><span class="review-av" aria-hidden="true">Z</span><p>Verified client<small>' + esc(meta) + '</small></p></div></article>';
  }
  function localPending() { try { return JSON.parse(store(PENDING_KEY) || '[]') || []; } catch (e) { return []; } }
  function renderReviews(approved) {
    if (!$('#reviewRail')) return;
    var seed = REVIEWS.map(function (r) { return { body: r[0], rating: r[1] }; });
    var mine = localPending().map(function (r) { r.pending = true; return r; });
    $('#reviewRail').innerHTML = mine.concat(approved || [], seed).map(reviewCard).join('');
  }
  renderReviews([]);
  if (LIVE) {
    api('reviews?select=rating,product,length_in,body,city&status=eq.approved&order=created_at.desc&limit=30')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { renderReviews(rows); })
      .catch(function () {});
  }

  var modal = $('#reviewModal'), form = $('#reviewForm'), lastFocus;
  function openModal(open) {
    modal.hidden = !open;
    if (open) { lastFocus = document.activeElement; $('textarea', form).focus(); } else if (lastFocus) lastFocus.focus();
  }
  $$('#reviewOpen, [data-review-open]').forEach(function (b) { b.addEventListener('click', function () { openModal(true); }); });
  $('[data-close]', modal).addEventListener('click', function () { openModal(false); });
  modal.addEventListener('click', function (e) { if (e.target === modal) openModal(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!modal.hidden) openModal(false); openBag(false); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, msg = $('#reviewMsg');
    if (f.website.value) return; // bot trap
    var body = f.body.value.trim();
    if (!f.product.value) { msg.textContent = 'Please choose the product you bought.'; f.product.focus(); return; }
    if (body.length < 10) { msg.textContent = 'Please write a few more words about your hair.'; f.body.focus(); return; }
    if (!f.consent.checked) { msg.textContent = 'Please tick the box so we may show your review.'; f.consent.focus(); return; }
    var review = {
      rating: +form.querySelector('input[name="rating"]:checked').value,
      product: f.product.value,
      length_in: f.length.value ? parseInt(f.length.value, 10) : null,
      body: body,
      order_ref: f.order_ref.value.trim() || null,
      city: f.city.value.trim() || null,
      consent: true
    };
    var done = function () {
      form.reset(); msg.textContent = '';
      openModal(false);
      toast('Thank you. Your review will appear once we approve it.');
    };
    if (LIVE) {
      msg.textContent = 'Sending…';
      api('reviews', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(review) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(function () { msg.textContent = 'Something went wrong. Please try again, or send us your review on WhatsApp.'; });
    } else {
      var list = localPending(); review.created_at = new Date().toISOString(); list.unshift(review);
      store(PENDING_KEY, JSON.stringify(list.slice(0, 10)));
      renderReviews([]); done();
    }
  });

  // ======================= FAQ =======================
  function faqItem(q) { return '<details class="faq-item"><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>'; }
  var faqList = $('#faqList');
  if (faqList) faqList.innerHTML = FAQS.slice(0, +faqList.dataset.limit || FAQS.length).map(faqItem).join('');
  var faqGroups = $('#faqGroups');
  if (faqGroups) {
    var GROUPS = [['hair', 'Our hair'], ['styling', 'Styling and wear'], ['orders', 'Orders and the Hair Drop']];
    faqGroups.innerHTML = GROUPS.map(function (g) {
      return '<div class="faq-group" id="faq-' + g[0] + '"><h2 class="h3">' + g[1] + '</h2><div class="faq-list">' +
        FAQS.filter(function (q) { return q[2] === g[0]; }).map(faqItem).join('') + '</div></div>';
    }).join('');
    $('#faqJump').innerHTML = GROUPS.map(function (g) { return '<a class="chip" href="#faq-' + g[0] + '">' + g[1] + '</a>'; }).join('') + '<a class="chip" href="#returns">Returns</a>';
  }

  // ======================= CLUB =======================
  var club = $('#clubForm');
  if (club) club.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#clubEmail'), msg = $('#clubMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { msg.textContent = 'Enter an email address like name@example.co.za.'; inp.focus(); return; }
    msg.textContent = 'You are on the list. We will remind you before each cut-off.'; inp.value = '';
  });

  // ======================= COMING-SOON LINKS, REVEAL, YEAR =======================
  $$('[data-soon]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); toast('This page is coming soon.'); }); });
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); ro.unobserve(x.target); } }); }, { threshold: 0.12 });
    $$('.reveal, .why-card, .vs-card, .steps li, .panel, .facts article').forEach(function (el) { el.classList.add('reveal'); ro.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }
  $('#year').textContent = new Date().getFullYear();

  // exposed for checks
  window.__zanteDrops = upcomingDrops;
})();
