/*
 * Zante Hair · strand engine
 * Draws hair as hundreds of live strands on a 2D canvas.
 * Layouts: dome (wig on a crown), half (headband wig), weft (bundle),
 * closure (5x5 lace patch), frontal (13x4 lace arc), curtain (hanging sheet).
 * Textures morph smoothly, colours cross-fade, and the pointer parts the hair.
 */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgb(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }
  function rng(seed) {
    var s = (seed * 2654435761) >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 1000003) / 1000003; };
  }

  // Wave length (wl) and amplitude (amp) are in pixels at scale 1.
  var TEXTURES = {
    straight:      { amp: 2.4, wl: 520, curl: 0,    crimp: 0,   vol: 0,  label: 'Silk Straight' },
    body:          { amp: 15,  wl: 150, curl: 0,    crimp: 0,   vol: 8,  label: 'Body Wave' },
    deep:          { amp: 8.5, wl: 58,  curl: 0.25, crimp: 0,   vol: 18, label: 'Deep Wave' },
    kinkyStraight: { amp: 3,   wl: 300, curl: 0,    crimp: 1.1, vol: 14, label: 'Kinky Straight' },
    kinkyCurly:    { amp: 6.5, wl: 23,  curl: 1,    crimp: 0.4, vol: 44, label: 'Kinky Curly' }
  };

  var COLOURS = {
    '1b':  { name: 'Natural Black', code: '1B',  stops: ['#100B0E', '#241920', '#3B2B34'], hi: '#A28D99', swatch: '#2A1E24' },
    mauve: { name: 'Pink Ombre',    code: 'PK',  stops: ['#2B1433', '#A6478A', '#F7B3CF'], hi: '#FFF3FA', swatch: '#E06AA0' },
    '27':  { name: 'Honey Blonde',  code: '27',  stops: ['#3C2617', '#A06A39', '#E6BA78'], hi: '#FFF1D4', swatch: '#C4904F' },
    '99j': { name: 'Burgundy',      code: '99J', stops: ['#1D0710', '#651A2D', '#A83C58'], hi: '#F7AFC3', swatch: '#7A2238' },
    '613': { name: 'Platinum',      code: '613', stops: ['#857870', '#CBBDAF', '#F0E6DA'], hi: '#FFFFFF', swatch: '#E6DACB' },
    ombre: { name: 'Ombre 4/613',   code: '4/613', stops: ['#3B2A22', '#A8835E', '#EFE3CC'], hi: '#FFFFFF', swatch: '#C9AE88' }
  };

  var all = [];
  // options that change without rebuilding geometry
  var LIVE_KEYS = ['texture', 'colour', 'always', 'ambient', 'ruler', 'dark', 'glow'];
  var raf = 0;

  function themeIsDark() {
    var r = document.documentElement;
    if (r.dataset.theme === 'dark') return true;
    if (r.dataset.theme === 'light') return false;
    return global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(loop); }
  function loop(now) {
    raf = 0;
    var more = false;
    for (var i = 0; i < all.length; i++) {
      var h = all[i];
      if (!h.visible || !h.alive) continue;
      if (h.needsFrame()) { h.draw(now); if (h.needsFrame()) more = true; }
    }
    if (more) schedule();
  }

  var io = 'IntersectionObserver' in global ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var h = e.target.__hair; if (!h) return;
      h.visible = e.isIntersecting;
      if (h.visible) { h.dirty = true; if (h.o.grow && !h.growStarted && h.o.autoGrow) h.regrow(); schedule(); }
    });
  }, { rootMargin: '120px' }) : null;

  function Hair(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = Object.assign({
      layout: 'curtain', texture: 'body', colour: 'mauve', length: 22, density: 1,
      count: 160, ambient: true, always: false, grow: false, autoGrow: true, ruler: false,
      seed: 7, interactive: true, cx: 0.5, top: 0.1, headW: 0.17, spread: 1, label: '',
      hit: null, fit: 30, glow: true
    }, opts || {});
    this.tex = Object.assign({}, TEXTURES[this.o.texture]);
    this.pal = this.palette(this.o.colour);
    this.palT = this.palette(this.o.colour);
    this.ptr = { x: -1e4, y: -1e4, inside: false };
    this.time = 0; this.last = 0;
    this.dirty = true; this.visible = !io; this.alive = true; this.hover = false;
    this.energy = 0; this.growStart = -1; this.growStarted = false;
    this.sheen = 0.5;
    canvas.__hair = this;
    this.bind();
    this.resize();
    if (io) io.observe(canvas);
    all.push(this);
    if (this.o.grow && !this.o.autoGrow) this.growStart = Infinity;
    schedule();
  }

  Hair.TEXTURES = TEXTURES;
  Hair.COLOURS = COLOURS;
  Hair.reduced = reduced;
  Hair.refreshAll = function () { all.forEach(function (h) { h.dirty = true; }); schedule(); };

  Hair.prototype.palette = function (key) {
    var c = COLOURS[key] || COLOURS.mauve;
    return { s: c.stops.map(hex), hi: hex(c.hi) };
  };

  Hair.prototype.bind = function () {
    var self = this;
    var target = this.o.hit || this.c;
    if ('ResizeObserver' in global) {
      new ResizeObserver(function () { if (self.alive) { self.resize(); schedule(); } }).observe(this.c);
    } else {
      global.addEventListener('resize', function () { self.resize(); schedule(); });
    }
    if (!this.o.interactive) return;
    function move(e) {
      var r = self.c.getBoundingClientRect();
      self.ptr.x = e.clientX - r.left; self.ptr.y = e.clientY - r.top;
      self.ptr.inside = self.ptr.x >= 0 && self.ptr.y >= 0 && self.ptr.x <= r.width && self.ptr.y <= r.height;
      self.hover = true; self.energy = 1; schedule();
    }
    function leave() { self.ptr.inside = false; self.hover = false; self.ptr.x = -1e4; schedule(); }
    target.addEventListener('pointermove', move, { passive: true });
    target.addEventListener('pointerdown', move, { passive: true });
    target.addEventListener('pointerleave', leave);
    target.addEventListener('pointercancel', leave);
  };

  Hair.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === this.w && h === this.h && this.strands) return;
    this.w = w; this.h = h;
    this.dpr = Math.min(global.devicePixelRatio || 1, 2);
    this.c.width = Math.round(w * this.dpr); this.c.height = Math.round(h * this.dpr);
    this.build();
    this.dirty = true;
  };

  Hair.prototype.set = function (p) {
    var rebuild = false;
    for (var k in p) {
      if (p[k] === this.o[k]) continue;
      if (k === 'colour') this.palT = this.palette(p[k]);
      else if (LIVE_KEYS.indexOf(k) < 0) rebuild = true;
      this.o[k] = p[k];
    }
    if (rebuild) this.build();
    this.dirty = true; this.energy = Math.max(this.energy, 0.5);
    schedule();
  };

  Hair.prototype.regrow = function () {
    this.growStart = this.time; this.growStarted = true; this.dirty = true; schedule();
  };

  Hair.prototype.flip = function (dir) {
    var F = (dir || 1) * 26 * this.k;
    this.strands.forEach(function (s) {
      for (var i = 0; i < s.n; i++) s.vx[i] += F * Math.pow(i / s.n, 1.4) * s.f[i] * (0.7 + s.r * 0.6);
    });
    this.energy = 1; schedule();
  };

  Hair.prototype.destroy = function () {
    this.alive = false;
    if (io) io.unobserve(this.c);
    var i = all.indexOf(this); if (i >= 0) all.splice(i, 1);
  };

  // ---------- geometry ----------
  Hair.prototype.build = function () {
    var o = this.o, W = this.w, H = this.h;
    var R = rng(o.seed);
    var k = this.k = o.scale || clamp(Math.min(W, H * 0.9) / 620, 0.32, 1.35);
    var count = Math.round(o.count * o.density);
    var ds = this.ds = Math.max(2.4, 3.2 * k);
    var layout = o.layout;
    var top = H * o.top;
    this.rootY = top;
    // pixels per inch so that `fit` inches fill the canvas below the roots
    var pxIn = this.pxIn = (H - top - 18 * k) / o.fit;
    var lenPx = o.length * pxIn;
    var cx = W * o.cx;
    var strands = [];
    var deco = this.deco = { layout: layout, cx: cx, top: top };

    function mk(nPts) {
      return {
        n: nPts,
        bx: new Float32Array(nPts), by: new Float32Array(nPts),
        tx: new Float32Array(nPts), ty: new Float32Array(nPts),
        f: new Float32Array(nPts),
        ox: new Float32Array(nPts), vx: new Float32Array(nPts)
      };
    }
    function finish(s) {
      s.ph = R() * TAU; s.ph2 = R() * TAU; s.r = R();
      s.w = 0.55 + R() * 1.05;
      s.a = 0.5 + R() * 0.45;
      s.hi = R() < 0.14;
      s.volj = 0.55 + R() * 0.8;
      s.d = R() * 0.55;
      strands.push(s);
    }
    function straightDown(s, i0, x, y, ramp) {
      for (var i = i0; i < s.n; i++) {
        var t = i / (s.n - 1);
        s.bx[i] = x; s.by[i] = y + (i - i0) * ds;
        s.tx[i] = 0; s.ty[i] = 1;
        s.f[i] = smooth(0, ramp, t);
      }
    }

    if (layout === 'dome' || layout === 'half') {
      var ax = Math.min(W * o.headW, H * 0.2, 230 * k / 0.9 + 40);
      ax = Math.max(ax, 28);
      var ay = ax * 1.08;
      var ecy = top + ay;
      deco.ax = ax; deco.ay = ay; deco.ecy = ecy;
      var spread = o.spread;
      for (var j = 0; j < count; j++) {
        var back = j < count * 0.34;
        var L = lenPx * (0.86 + R() * 0.2);
        var n = Math.max(8, Math.min(240, Math.round(L / ds)));
        var s = mk(n);
        var side, lift, theta, i0 = 0, x, y;
        if (back) {
          // hair behind the face, falling from the sides at different heights
          side = R() < 0.5 ? -1 : 1;
          lift = (2 + R() * 16) * k * spread;
          var drop = -R() * ay * 0.15;
          x = cx + side * (ax + lift); y = ecy - drop;
          s.layer = -1 + R() * 0.2;
          straightDown(s, 0, x, y, 0.05);
          for (var b = 0; b < n; b++) s.bx[b] += side * Math.pow(b / n, 1.6) * 30 * k * spread;
          s.out = side;
        } else {
          // Each strand rides its own "track": an ellipse from the middle part to the side of the head.
          // rho 0 = the crown outline, rho 1 = the front hairline. Front tracks sit lower and lie on top.
          var rho = Math.pow(R(), 0.8);
          side = R() < 0.5 ? -1 : 1;
          var end = side > 0 ? 0 : Math.PI;
          var yRoot = top + rho * ay * 0.62;
          var ecyR = ecy + rho * ay * 0.42;
          lift = (R() * 3 + (1 - rho) * 4) * k;
          var rx = ax * (1 - 0.1 * rho) + lift + (1 - rho) * 3 * k;
          var ry = Math.max(8, ecyR - yRoot) + lift * 0.4;
          theta = Math.PI / 2 - side * (0.015 + R() * 0.05) * Math.PI;
          s.layer = rho + R() * 0.12;
          var th = theta, i = 0;
          // walk over the scalp toward the side of the head
          while (i < n) {
            x = cx + rx * Math.cos(th); y = ecyR - ry * Math.sin(th);
            var dxd = -rx * Math.sin(th), dyd = -ry * Math.cos(th);
            var sp = Math.sqrt(dxd * dxd + dyd * dyd) || 1;
            var dir = side > 0 ? -1 : 1; // theta decreases on the right, increases on the left
            s.bx[i] = x; s.by[i] = y;
            s.tx[i] = dxd * dir / sp; s.ty[i] = dyd * dir / sp;
            s.f[i] = smooth(0.55, 1, 1 - Math.abs(th - end) / (Math.PI / 2)) * 0.25;
            i++;
            var nth = th + dir * ds / sp;
            if ((side > 0 && nth <= end) || (side < 0 && nth >= end)) break;
            th = nth;
          }
          i0 = i;
          x = cx + side * rx; y = ecyR;
          for (; i < n; i++) {
            var u = (i - i0) * ds;
            var splay = side * (0.05 + 0.05 * spread) * u + side * Math.pow(u / (lenPx + 1), 2) * 22 * k * spread;
            s.bx[i] = x + splay; s.by[i] = y + u;
            s.tx[i] = side * 0.06; s.ty[i] = 1;
            s.f[i] = 0.25 + 0.75 * smooth(0, 40 * k, u);
          }
          s.out = side;
        }
        finish(s);
      }
      strands.sort(function (a, b) { return a.layer - b.layer; });
    } else if (layout === 'weft' || layout === 'curtain') {
      var bw = layout === 'curtain' ? W * 1.1 : Math.min(W * 0.62, 430 * k + 60);
      var x0 = cx - bw / 2;
      deco.bw = bw; deco.x0 = x0;
      for (var q = 0; q < count; q++) {
        var L2 = lenPx * (layout === 'curtain' ? 0.8 + R() * 0.3 : 0.93 + R() * 0.09);
        var n2 = Math.max(8, Math.min(240, Math.round(L2 / ds)));
        var s2 = mk(n2);
        var rx2 = x0 + R() * bw;
        var ry2 = top + (layout === 'curtain' ? -8 + R() * 10 : R() * 2 * k);
        var rel = (rx2 - cx) / (bw / 2);
        straightDown(s2, 0, rx2, ry2, layout === 'curtain' ? 0.12 : 0.08);
        if (layout === 'weft') {
          for (var g = 0; g < n2; g++) s2.bx[g] += (cx - rx2) * 0.14 * smooth(0, 1, g / n2);
        }
        s2.out = rel;
        s2.layer = R();
        finish(s2);
      }
    } else if (layout === 'closure') {
      var S = Math.min(W * 0.36, 250 * k + 40);
      deco.S = S;
      for (var c = 0; c < count; c++) {
        var L3 = lenPx * (0.9 + R() * 0.12);
        var n3 = Math.max(8, Math.min(240, Math.round(L3 / ds)));
        var s3 = mk(n3);
        var px = cx - S / 2 + R() * S;
        if (Math.abs(px - cx) < 2 * k) px += 4 * k;
        var py = top + R() * S * 0.34;
        var sd = px < cx ? -1 : 1;
        for (var m = 0; m < n3; m++) {
          var tt = m / (n3 - 1);
          s3.bx[m] = px + sd * S * 0.16 * smooth(0, 0.2, tt);
          s3.by[m] = py + m * ds;
          s3.tx[m] = 0; s3.ty[m] = 1;
          s3.f[m] = smooth(0.02, 0.16, tt);
        }
        s3.out = sd * 0.7;
        s3.layer = (py - top) / S;
        finish(s3);
      }
    } else if (layout === 'frontal') {
      var A = Math.min(W * 0.74, 540 * k + 40);
      deco.A = A;
      for (var fr = 0; fr < count; fr++) {
        var L4 = lenPx * (0.9 + R() * 0.12);
        var n4 = Math.max(8, Math.min(240, Math.round(L4 / ds)));
        var s4 = mk(n4);
        var th4 = 0.06 * Math.PI + R() * 0.88 * Math.PI;
        if (Math.abs(th4 - Math.PI / 2) < 0.02 * Math.PI) th4 += 0.04 * Math.PI;
        var ax4 = cx + Math.cos(th4) * A / 2;
        var ay4 = top + (1 - Math.sin(th4)) * A * 0.2 + R() * 10 * k;
        var sd4 = Math.cos(th4);
        for (var p = 0; p < n4; p++) {
          var t4 = p / (n4 - 1);
          s4.bx[p] = ax4 + sd4 * 34 * k * smooth(0, 0.22, t4);
          s4.by[p] = ay4 + p * ds;
          s4.tx[p] = 0; s4.ty[p] = 1;
          s4.f[p] = smooth(0.02, 0.15, t4);
        }
        s4.out = sd4;
        s4.layer = R();
        finish(s4);
      }
    }
    this.strands = strands;
    // gradient range
    this.gTop = top - 10;
    this.gBot = top + lenPx * 1.05;
  };

  // ---------- frame logic ----------
  Hair.prototype.morphing = function () {
    var t = TEXTURES[this.o.texture], m = this.tex;
    if (Math.abs(t.amp - m.amp) > 0.02 || Math.abs(t.wl - m.wl) > 0.3 || Math.abs(t.curl - m.curl) > 0.004 ||
        Math.abs(t.vol - m.vol) > 0.05 || Math.abs(t.crimp - m.crimp) > 0.004) return true;
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) if (Math.abs(this.pal.s[i][j] - this.palT.s[i][j]) > 0.6) return true;
    return false;
  };

  Hair.prototype.growing = function () {
    return this.o.grow && this.growStart !== -1 && this.growStart !== Infinity && !reduced && (this.time - this.growStart) < 2.4;
  };

  Hair.prototype.needsFrame = function () {
    if (this.dirty) return true;
    if (this.growStart === Infinity) return false;
    if (this.growing()) return true;
    if (this.morphing()) return true;
    if (this.energy > 0.002) return true;
    if (!reduced && this.o.ambient && (this.o.always || this.hover)) return true;
    return false;
  };

  Hair.prototype.draw = function (now) {
    var dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    if (!reduced) this.time += dt;
    this.dirty = false;

    // morph texture and colour
    var T = TEXTURES[this.o.texture], m = this.tex, e = reduced ? 1 : 0.075;
    m.amp += (T.amp - m.amp) * e; m.wl += (T.wl - m.wl) * e; m.curl += (T.curl - m.curl) * e;
    m.vol += (T.vol - m.vol) * e; m.crimp += (T.crimp - m.crimp) * e;
    var pe = reduced ? 1 : 0.08;
    for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) this.pal.s[a][b] += (this.palT.s[a][b] - this.pal.s[a][b]) * pe;
    for (var h = 0; h < 3; h++) this.pal.hi[h] += (this.palT.hi[h] - this.pal.hi[h]) * pe;

    var ctx = this.ctx, W = this.w, H = this.h, k = this.k, ds = this.ds;
    var dark = this.o.dark != null ? this.o.dark : themeIsDark();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (this.o.glow) this.drawGlow(ctx, dark);
    this.drawUnder(ctx, dark);

    var grad = ctx.createLinearGradient(0, this.gTop, 0, this.gBot);
    var P = this.pal.s;
    grad.addColorStop(0, rgb(P[0])); grad.addColorStop(0.45, rgb(P[1])); grad.addColorStop(1, rgb(P[2]));
    var hiC = this.pal.hi;
    var lumTip = (P[2][0] * 0.3 + P[2][1] * 0.59 + P[2][2] * 0.11) / 255;
    var shadow = !dark && lumTip > 0.72;

    var time = this.time;
    var amp = m.amp * k, wl = m.wl * k, curl = m.curl, crimp = m.crimp * k, vol = m.vol * k;
    var ptr = this.ptr, Rr = 86 * Math.max(0.6, k), Rr2 = Rr * Rr;
    var energetic = this.energy > 0.002 || ptr.inside;
    var amb = !reduced && this.o.ambient;
    var visFrac = 1 - 0.3 * curl;
    var sheenX = (Math.sin(time * 0.35) * 0.5 + 0.5) * W;
    var maxE = 0;
    var grow = this.o.grow && this.growStart !== -1;
    var gt = grow ? (this.growStart === Infinity ? 0 : this.time - this.growStart) : 9;

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    var strands = this.strands;
    for (var si = 0; si < strands.length; si++) {
      var s = strands[si];
      var g = reduced ? 1 : easeOut(clamp((gt - s.d) / 1.5, 0, 1));
      if (g <= 0.001) continue;
      var n = s.n;
      var vis = Math.max(2, Math.floor(n * visFrac * g));
      var X = this._x || (this._x = new Float32Array(260));
      var Y = this._y || (this._y = new Float32Array(260));
      for (var i = 0; i < vis; i++) {
        var f = s.f[i], t = i / (n - 1);
        var sArc = i * ds;
        var ang = TAU * sArc / wl + s.ph + (amb ? time * 0.3 : 0);
        var env = f * (0.35 + 0.65 * t);
        var w = amp * env * Math.sin(ang);
        var cu = curl * amp * env * Math.cos(ang);
        var cr = crimp * f * (Math.sin(sArc * 0.31 / k + s.ph2) + 0.55 * Math.sin(sArc * 0.67 / k + s.ph2 * 1.3));
        var sway = amb ? Math.sin(time * 0.9 + s.ph * 0.5 + s.by[i] * 0.004) * 2.6 * k * f * t : 0;
        var vo = vol * s.volj * smooth(0, 1, t) * s.out * f;
        // tangent (tx,ty) and normal (-ty,tx)
        var tx = s.tx[i], ty = s.ty[i];
        var bx = s.bx[i] - ty * (w + cr) + tx * cu + vo + sway;
        var by = s.by[i] + tx * (w + cr) + ty * cu;
        // pointer parting
        if (energetic && f > 0) {
          var target = 0;
          if (ptr.inside) {
            var ddx = bx - ptr.x, ddy = by - ptr.y, d2 = ddx * ddx + ddy * ddy;
            if (d2 < Rr2) { var d = Math.sqrt(d2), fo = 1 - d / Rr; target = (ddx >= 0 ? 1 : -1) * fo * fo * Rr * 0.95 * f; }
          }
          var vx = s.vx[i];
          vx += (target - s.ox[i]) * 0.085;
          vx *= 0.86;
          s.vx[i] = vx;
          s.ox[i] += vx;
          if (i > 0) s.ox[i] += (s.ox[i - 1] - s.ox[i]) * 0.1;
          var en = Math.abs(vx) + Math.abs(s.ox[i]) * 0.02;
          if (en > maxE) maxE = en;
        }
        X[i] = bx + s.ox[i]; Y[i] = by;
      }
      // shadow under light hair
      if (shadow) {
        ctx.beginPath(); ctx.moveTo(X[0] + 0.8, Y[0] + 0.8);
        for (var q = 1; q < vis; q++) ctx.lineTo(X[q] + 0.8, Y[q] + 0.8);
        ctx.strokeStyle = 'rgba(60,40,50,0.16)'; ctx.globalAlpha = 1;
        ctx.lineWidth = s.w * Math.max(0.65, k) + 0.9; ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(X[0], Y[0]);
      for (var z = 1; z < vis; z++) ctx.lineTo(X[z], Y[z]);
      if (s.hi) {
        var sx = X[vis >> 1];
        var sh = Math.exp(-Math.pow((sx - sheenX) / (W * 0.16), 2));
        ctx.strokeStyle = rgb(hiC, (dark ? 0.32 : 0.2) + sh * 0.6);
        ctx.globalAlpha = 1;
        ctx.lineWidth = s.w * Math.max(0.55, k) * 0.8;
      } else {
        ctx.strokeStyle = grad;
        ctx.globalAlpha = s.a;
        ctx.lineWidth = s.w * Math.max(0.65, k);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    this.energy = ptr.inside ? 1 : maxE;
    this.drawOver(ctx, dark);
    if (this.o.ruler) this.drawRuler(ctx, dark);
  };

  Hair.prototype.drawGlow = function (ctx, dark) {
    var d = this.deco, W = this.w, H = this.h;
    var cy = d.ecy || (d.top + H * 0.3);
    var r = Math.max(W, H) * 0.55;
    var gg = ctx.createRadialGradient(d.cx, cy, 0, d.cx, cy, r);
    if (dark) { gg.addColorStop(0, 'rgba(201,154,240,0.30)'); gg.addColorStop(0.5, 'rgba(123,63,166,0.14)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); }
    else { gg.addColorStop(0, 'rgba(255,255,255,0.85)'); gg.addColorStop(0.45, 'rgba(250,196,218,0.38)'); gg.addColorStop(1, 'rgba(250,196,218,0)'); }
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
  };

  Hair.prototype.drawUnder = function (ctx, dark) {
    var d = this.deco, k = this.k;
    if (d.layout === 'closure') {
      var S = d.S, x = d.cx - S / 2, y = d.top - 6 * k;
      ctx.save();
      ctx.fillStyle = dark ? 'rgba(231,195,211,0.12)' : 'rgba(214,170,150,0.28)';
      roundRect(ctx, x - 6 * k, y, S + 12 * k, S * 0.42, 6 * k); ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(231,195,211,0.25)' : 'rgba(140,90,110,0.25)';
      ctx.lineWidth = 0.6;
      for (var gx = x; gx <= x + S; gx += 6 * k) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + S * 0.42); ctx.stroke(); }
      for (var gy = y; gy <= y + S * 0.42; gy += 6 * k) { ctx.beginPath(); ctx.moveTo(x - 6 * k, gy); ctx.lineTo(x + S + 6 * k, gy); ctx.stroke(); }
      ctx.restore();
      label(ctx, '5x5 HD LACE', d.cx, y - 8 * k, k, dark);
    } else if (d.layout === 'frontal') {
      var A = d.A;
      ctx.save();
      ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var th = Math.PI - i / 40 * Math.PI;
        var px = d.cx + Math.cos(th) * A / 2, py = d.top + (1 - Math.sin(th)) * A * 0.2;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = dark ? 'rgba(231,195,211,0.16)' : 'rgba(214,170,150,0.34)';
      ctx.lineWidth = 18 * k; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
      label(ctx, '13x4 HD LACE', d.cx, d.top - 16 * k, k, dark);
    }
  };

  Hair.prototype.drawOver = function (ctx, dark) {
    var d = this.deco, k = this.k;
    if (d.layout === 'weft') {
      var y = d.top - 5 * k, h = 10 * k;
      ctx.save();
      ctx.fillStyle = dark ? '#FFEFF6' : '#2B1433';
      roundRect(ctx, d.x0 - 8 * k, y, d.bw + 16 * k, h, h / 2); ctx.fill();
      ctx.fillStyle = dark ? '#2B1433' : '#FFEFF6';
      ctx.font = '500 ' + Math.max(7, 7.5 * k) + 'px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (k > 0.42) ctx.fillText('ZANTE · 100 g · DOUBLE WEFT', d.cx, y + h / 2 + 0.5);
      ctx.restore();
    } else if (d.layout === 'half') {
      // satin headband across the crown
      ctx.save();
      var ax = d.ax + 10 * k, ay = d.ay + 10 * k;
      ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var th = 0.04 * Math.PI + i / 40 * 0.92 * Math.PI;
        var px = d.cx + ax * Math.cos(th), py = d.ecy - ay * Math.sin(th) * 0.86 + ay * 0.12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      var bg = ctx.createLinearGradient(d.cx - ax, 0, d.cx + ax, 0);
      bg.addColorStop(0, '#7B3FA6'); bg.addColorStop(0.5, '#FAC4DA'); bg.addColorStop(1, '#7B3FA6');
      ctx.strokeStyle = bg; ctx.lineWidth = 13 * k; ctx.lineCap = 'round'; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2 * k; ctx.stroke();
      ctx.restore();
    }
  };

  Hair.prototype.drawRuler = function (ctx, dark) {
    var x = this.w - 30, y0 = this.rootY, pxIn = this.pxIn, k = this.k;
    ctx.save();
    ctx.strokeStyle = dark ? 'rgba(245,237,243,0.5)' : 'rgba(43,29,46,0.45)';
    ctx.fillStyle = dark ? 'rgba(245,237,243,0.75)' : 'rgba(43,29,46,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + pxIn * 30); ctx.stroke();
    ctx.font = '500 10px "DM Mono", ui-monospace, monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (var i = 0; i <= 30; i++) {
      var y = y0 + i * pxIn;
      var major = i % 2 === 0 && i >= 8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (major ? 10 : 5), y); ctx.stroke();
      if (major && i % 4 === 2) ctx.fillText(i + '"', x - 6, y);
    }
    // marker at selected length
    var my = y0 + this.o.length * pxIn * (1 - 0.3 * this.tex.curl);
    ctx.fillStyle = '#E06AA0';
    ctx.beginPath(); ctx.arc(x + 5, my, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(x + 3.6, my - 1.6, 1.6, 0, TAU); ctx.fill();
    ctx.restore();
  };

  function label(ctx, txt, x, y, k, dark) {
    if (k < 0.42) return;
    ctx.save();
    ctx.font = '500 ' + Math.max(8, 9 * k) + 'px "DM Mono", ui-monospace, monospace';
    ctx.fillStyle = dark ? 'rgba(245,237,243,0.6)' : 'rgba(43,29,46,0.55)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(txt, x, y);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  global.ZanteHair = Hair;
})(window);
