/* Zante Beauty · draft homepage behaviour */
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
  var LENGTHS = [10, 12, 14, 16, 18, 20, 22];
  var PRODUCTS = [
    {
      id: 'halfwig', name: 'The Zante Half Wig', short: 'Half Wig', tag: 'Everyday versatility', tagClass: 'tag--half',
      line: 'Your everyday style, without the effort.',
      img: 'z-halfwig', alt: 'z-halfwig-2',
      prices: [2350, 2450, 2600, 2700, 2800, 3050, 3300],
      desc: 'Meet the half wig that makes switching up your look easier. It adds natural-looking length, fullness and movement while letting you include your own hair in the style. Wear it with a little leave-out, style it with a headband or try different finishes.',
      details: ['100% virgin human hair', 'Signature kinky straight texture', '180% density', 'Your choice of length, 10" to 22"', 'Pre-washed by Zante Beauty before dispatch', 'Made for versatile, removable styling'],
      quote: 'Your hair doesn’t have to be complicated to look beautiful.'
    },
    {
      id: 'upart', name: 'The Zante U-Part Wig', short: 'U-Part Wig', tag: 'Natural blend', tagClass: 'tag--upart',
      line: 'The blend you love. The freedom you need.',
      img: 'z-upart', alt: 'z-upart-2',
      prices: [2400, 2500, 2650, 2750, 2850, 3100, 3350],
      desc: 'If you love the full, blended look of a traditional sew-in but want something you can remove and wear again, meet the Zante U-Part. The U-shaped opening lets you include your own hair for a seamless finish. Wear it sleek, add curls or create your own signature look.',
      details: ['100% virgin human hair', 'Signature kinky straight texture', '180% density', 'Your choice of length, 10" to 22"', 'U-shaped leave-out opening', 'Pre-washed by Zante Beauty before dispatch', 'Removable and reusable'],
      quote: 'Think sew-in-inspired styling, with the freedom to take it off.'
    }
  ];
  var DEFAULT_LEN = 3; // 16"

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
    ['Is your hair 100% human hair?', 'Yes. Our units are made from 100% virgin human hair in our signature kinky straight texture.'],
    ['What does 180% density mean?', 'Density describes how full your wig is. All our standard units are 180% density. It is about fullness, not length.'],
    ['Why do your units look longer than most?', 'Our hair is true to length, so you get the full inches you pay for.'],
    ['Half wig or U-part: which is more protective?', 'Both help you protect your natural hair. Choose the one that suits your lifestyle. Our hair guide above can help.'],
    ['Can I wear a middle or side part with a half wig?', 'Not a defined part. You can wear a middle or side flip-over with no distinct parting. If you want a defined part, choose the U-part wig.'],
    ['Can I straighten or curl my Zante unit?', 'Yes. It is human hair and can be heat styled. Always use heat protection and moderate temperatures. The natural texture can return after washing, moisture or high humidity.'],
    ['Can kinky straight be bone straight?', 'It can be silk pressed for a straight finish, but it keeps a subtle texture. It gives a fuller, more natural-looking straight finish rather than bone straight.'],
    ['Once I silk press my unit, will it stay straight?', 'No. The hair goes back to its natural, full blow-out texture after washing, moisture or high humidity.'],
    ['Do I need to straighten my natural hair?', 'Not always. It depends on your natural texture and the look you want. Avoid unnecessary heat or tension, and style the unit to match your hair.'],
    ['Can I colour a Zante unit?', 'Yes, human hair can be coloured, but results vary and colour can affect the condition of the hair. We recommend a professional colourist and a strand test first.'],
    ['Can I sew in my Zante unit?', 'Yes. Remove the clips and combs first so they do not rub against and damage your natural hair.'],
    ['Are the wigs ready to wear?', 'Yes. We inspect and pre-wash every unit before dispatch at no extra cost. If you may want to return it, please do not wear it, so it stays eligible for a refund.'],
    ['Why do preorders take longer?', 'We group orders into a production drop before the hair is made and shipped to South Africa. This lets us source and prepare every unit properly. Allow 3 to 4 weeks from your drop’s cut-off.'],
    ['Can I change my order after payment?', 'Contact us as soon as possible. Changes may be possible before your drop closes, but we cannot guarantee them once the drop has gone to production.'],
    ['Do you offer installation?', 'Not at the moment. Our collection is designed for beginner-friendly, DIY, removable styling.']
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
    var el = $('#intro');
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
    $('#dropDates').innerHTML = list.map(function (d) {
      return '<li><span>' + esc(d.name) + '</span><span>' + esc(sastDate(d.close)) + '</span></li>';
    }).join('');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var left = current.close - new Date();
    if (left <= 0) { renderDrops(); left = current.close - new Date(); } // never count down to a past date
    var s = Math.floor(left / 1000);
    $('#cdD').textContent = pad(Math.floor(s / 86400));
    $('#cdH').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(s % 3600 / 60));
    $('#cdS').textContent = pad(s % 60);
  }
  renderDrops(); tick(); setInterval(tick, 1000);

  // ======================= PRODUCTS =======================
  $('#products').innerHTML = PRODUCTS.map(function (p) {
    return '<article class="product reveal" id="p-' + p.id + '" data-id="' + p.id + '">' +
      '<div class="product-media">' +
        '<span class="tag ' + p.tagClass + '">' + esc(p.tag) + '</span>' +
        '<img src="assets/img/' + p.img + '.jpg" alt="' + esc(p.name) + ', worn" loading="lazy" width="900" height="1200">' +
        '<img class="alt" src="assets/img/' + p.alt + '.jpg" alt="' + esc(p.name) + ' on a mannequin" loading="lazy" width="900" height="1200">' +
        '<div class="thumbs"><button type="button" class="is-on" aria-label="Show worn photo"></button><button type="button" aria-label="Show mannequin photo"></button></div>' +
      '</div>' +
      '<div><h3 class="product-name">' + esc(p.name) + '</h3><p class="product-line">' + esc(p.line) + '</p></div>' +
      '<p class="product-spec">100% virgin human hair · Kinky straight · 180% density · Pre-washed</p>' +
      '<p class="product-desc">' + esc(p.desc) + '</p>' +
      '<div><p class="lens-label">Length</p><div class="lens" role="group" aria-label="Length">' +
        LENGTHS.map(function (l, i) { return '<button type="button" data-i="' + i + '" class="' + (i === DEFAULT_LEN ? 'is-on' : '') + '" aria-pressed="' + (i === DEFAULT_LEN) + '">' + l + '"</button>'; }).join('') +
      '</div></div>' +
      '<div class="buy"><p class="price"><b>' + fmt(p.prices[DEFAULT_LEN]) + '</b><span>or 3 × ' + fmt(p.prices[DEFAULT_LEN] / 3) + ' with PayJustNow</span></p>' +
        '<button type="button" class="btn btn--solid" data-add>Add to bag</button></div>' +
      '<details class="details"><summary>Details</summary><ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul><q>' + esc(p.quote) + '</q></details>' +
    '</article>';
  }).join('');

  PRODUCTS.forEach(function (p) {
    var card = $('#p-' + p.id); p.sel = DEFAULT_LEN;
    var media = $('.product-media', card), dots = $$('.thumbs button', card);
    dots.forEach(function (b, i) {
      b.addEventListener('click', function () {
        media.classList.toggle('show-alt', i === 1);
        dots.forEach(function (x, j) { x.classList.toggle('is-on', i === j); });
      });
    });
    $('.lens', card).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      p.sel = +b.dataset.i;
      $$('.lens button', card).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      $('.price b', card).textContent = fmt(p.prices[p.sel]);
      $('.price span', card).textContent = 'or 3 × ' + fmt(p.prices[p.sel] / 3) + ' with PayJustNow';
    });
    $('[data-add]', card).addEventListener('click', function () {
      addToBag({ key: p.id + '-' + LENGTHS[p.sel], name: p.short, variant: 'Kinky straight, ' + LENGTHS[p.sel] + '"', price: p.prices[p.sel], img: p.img });
    });
  });

  // ======================= BAG =======================
  var BAG_KEY = 'zante-bag3', bag = [];
  try { bag = JSON.parse(store(BAG_KEY) || '[]') || []; } catch (e) { bag = []; }
  var drawer = $('#bag'), scrim = $('#scrim');
  function saveBag() { store(BAG_KEY, JSON.stringify(bag)); renderBag(); }
  function renderBag() {
    var n = bag.reduce(function (a, b) { return a + b.qty; }, 0), total = bag.reduce(function (a, b) { return a + b.qty * b.price; }, 0);
    $('#bagCount').textContent = n;
    $('#bagBtn').setAttribute('aria-label', 'Open bag, ' + n + ' item' + (n === 1 ? '' : 's'));
    $('#bagList').innerHTML = bag.length ? bag.map(function (b, i) {
      return '<li class="bag-item"><img src="assets/img/' + b.img + '.jpg" alt=""><div><p>' + esc(b.name) + (b.qty > 1 ? ' × ' + b.qty : '') + '</p><small>' + esc(b.variant) + '</small><br><button type="button" data-rm="' + i + '">Remove</button></div><b>' + fmt(b.price * b.qty) + '</b></li>';
    }).join('') : '<li class="bag-empty">Your bag is empty.</li>';
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
  $('#bagList').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (!b) return; bag.splice(+b.dataset.rm, 1); saveBag(); });
  $('#checkoutBtn').addEventListener('click', function () { toast('Checkout is not live in this draft.'); });
  renderBag();

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
  $('#reviewOpen').addEventListener('click', function () { openModal(true); });
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
  $('#faqList').innerHTML = FAQS.map(function (q) {
    return '<details class="faq-item"><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>';
  }).join('');

  // ======================= CLUB =======================
  $('#clubForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#clubEmail'), msg = $('#clubMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { msg.textContent = 'Enter an email address like name@example.co.za.'; inp.focus(); return; }
    msg.textContent = 'You are on the list. This is a draft, so no email was sent.'; inp.value = '';
  });

  // ======================= DRAFT LINKS, REVEAL, YEAR =======================
  $$('[data-draft]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); toast('This page is coming soon. Only the homepage works in this draft.'); }); });
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); ro.unobserve(x.target); } }); }, { threshold: 0.12 });
    $$('.reveal, .why-card, .vs-card, .steps li, .panel, .facts article').forEach(function (el) { el.classList.add('reveal'); ro.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }
  $('#year').textContent = new Date().getFullYear();

  // exposed for checks
  window.__zanteDrops = upcomingDrops;
})();
