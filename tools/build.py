"""Build the Zante Beauty pages.

Every page shares one head, header, footer, bag and review form. Only the page body differs.
Edit the bodies in src/pages/*.html and the shared parts below, then run:

    python3 tools/build.py

It writes index.html, shop.html, hair-drop.html, hair-guide.html, our-story.html and faqs.html in the repo root.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'pages'

NAV = [
    ('shop.html', 'Shop'),
    ('hair-drop.html', 'The Hair Drop'),
    ('hair-guide.html', 'Hair Guide'),
    ('our-story.html', 'Our Story'),
    ('faqs.html', 'FAQs'),
]

PAGES = {
    # file: (body source, <title>, meta description, active nav file)
    'index.html': ('index.html', 'Zante Beauty', 'Zante Beauty: kinky straight half wigs and U-part wigs in 100% virgin human hair, pre-washed before dispatch. Ordered in two Zante Hair Drops a month.', None),
    'shop.html': ('shop.html', 'Shop · Zante Beauty', 'Shop the Zante Half Wig and U-Part Wig: 100% virgin human hair, kinky straight, 180% density, 10 to 22 inches.', 'shop.html'),
    'hair-drop.html': ('hair-drop.html', 'The Zante Hair Drop · Zante Beauty', 'How the Zante Hair Drop works: two preorder drops a month, cut-off dates, waiting times, delivery and tracking.', 'hair-drop.html'),
    'hair-guide.html': ('hair-guide.html', 'Hair guide · Zante Beauty', 'Half wig or U-part? Understand our kinky straight texture, 180% density and true-to-length hair.', 'hair-guide.html'),
    'our-story.html': ('our-story.html', 'Our story · Zante Beauty', 'Born from a name, built around her. The story of Zante Beauty and why we love kinky straight hair.', 'our-story.html'),
    'privacy.html': ('privacy.html', 'Privacy policy · Zante Beauty', 'How Zante Beauty collects, uses and protects your personal information under POPIA.', None),
    'terms.html': ('terms.html', 'Terms and conditions · Zante Beauty', 'Zante Beauty terms and conditions, in line with the South African Consumer Protection Act and ECTA: preorders, cancellations, the 7-day cooling-off period, defects, returns and refunds.', None),
    'faqs.html': ('faqs.html', 'FAQs · Zante Beauty', 'Answers about Zante hair, styling, preorders, delivery and returns.', 'faqs.html'),
}

ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'


def head(title, desc):
    return f'''<!doctype html>
<html lang="en-ZA" data-mode="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="{desc}">
<meta name="theme-color" content="#FAF7F5">
<link rel="icon" type="image/svg+xml" href="assets/brand/zante-app-icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Fredoka:wght@600&family=DM+Sans:opsz,wght@9..40,400..600&display=swap">
<link rel="stylesheet" href="assets/css/zante.css">
<script>
  /* Supabase keys go here once the project exists. Empty = reviews are kept on this device only. */
  window.ZANTE_CONFIG = {{ supabaseUrl: '', supabaseAnonKey: '' }};
</script>
</head>'''


def header(active, is_home):
    def links(items):
        out = []
        for href, label in items:
            cur = ' aria-current="page"' if href == active else ''
            out.append(f'<a href="{href}"{cur}>{label}</a>')
        return ''.join(out)
    return f'''<body>
<a class="skip" href="#main">Skip to content</a>

<!-- one slim announcement bar -->
<div class="announce">
  <p>Preorders open · <a href="hair-drop.html"><b data-drop-name>the next Zante Hair Drop</b></a></p>
</div>

<header class="header" id="header">
  <div class="wrap header-in">
    <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
    <nav class="nav nav--left" aria-label="Main">{links(NAV[:3])}</nav>
    <a class="logo" href="index.html" aria-label="Zante Beauty, home"><span class="logo-z">Zante</span><span class="logo-b">Beauty</span></a>
    <div class="header-right">
      <nav class="nav nav--right" aria-label="More">{links(NAV[3:])}</nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-search-open aria-label="Search products">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
        <button class="icon-btn bag-btn" id="bagBtn" type="button" aria-label="Open bag, 0 items">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
          <span class="bag-count" id="bagCount">0</span>
        </button>
      </div>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="Mobile">
    <a href="index.html"{' aria-current="page"' if is_home else ''}>Home</a>{links(NAV)}
    <button type="button" id="themeBtnM">Dark mode</button>
  </nav>
</header>

<main id="main">
'''


def footer():
    return f'''</main>

<footer class="footer">
<div class="silk silk--foot" aria-hidden="true">
  <svg viewBox="0 0 1440 260" preserveAspectRatio="none">
    <defs>
      <linearGradient id="sfa" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#C79BB8" stop-opacity=".0"/><stop offset=".25" stop-color="#C79BB8" stop-opacity=".55"/><stop offset=".7" stop-color="#D9B6CC" stop-opacity=".5"/><stop offset="1" stop-color="#C79BB8" stop-opacity=".15"/></linearGradient>
      <linearGradient id="sfb" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#C9CFE0" stop-opacity=".5"/><stop offset=".5" stop-color="#E4DDF0" stop-opacity=".55"/><stop offset="1" stop-color="#BFC9DA" stop-opacity=".45"/></linearGradient>
      <linearGradient id="sfc" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#F1DDE8" stop-opacity=".7"/><stop offset=".6" stop-color="#E9CFDF" stop-opacity=".6"/><stop offset="1" stop-color="#F5E7EF" stop-opacity=".7"/></linearGradient>
      <radialGradient id="sfp" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#F6EEF3"/><stop offset="1" stop-color="#D9C5D3"/></radialGradient>
    </defs>
    <g class="w1"><path d="M0 150 C 220 70, 420 210, 700 140 S 1180 60, 1440 120 L1440 260 L0 260 Z" fill="url(#sfb)"/></g>
    <g class="w2"><path d="M0 190 C 260 120, 480 250, 760 180 S 1200 110, 1440 170 L1440 260 L0 260 Z" fill="url(#sfa)"/></g>
    <g class="w3"><path d="M0 225 C 300 175, 560 260, 860 215 S 1250 165, 1440 205 L1440 260 L0 260 Z" fill="url(#sfc)"/></g>
    <path d="M0 160 C 240 85, 440 215, 720 148 S 1190 72, 1440 130" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>
    <path d="M0 198 C 270 132, 500 252, 780 188 S 1210 122, 1440 178" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
    <g fill="#fff" class="sparkle"><circle cx="180" cy="150" r="1.6"/><circle cx="410" cy="196" r="1.2"/><circle cx="640" cy="160" r="1.8"/><circle cx="905" cy="128" r="1.3"/><circle cx="1120" cy="104" r="1.7"/><circle cx="1330" cy="150" r="1.2"/><circle cx="300" cy="212" r="1"/><circle cx="1010" cy="190" r="1.1"/></g>
    <g class="pearls"><circle cx="1240" cy="150" r="9" fill="url(#sfp)"/><circle cx="252" cy="178" r="6" fill="url(#sfp)"/><circle cx="820" cy="206" r="5" fill="url(#sfp)"/></g>
  </svg>
</div>

  <div class="wrap footer-in">
    <div class="footer-brand">
      <a class="logo" href="index.html" aria-label="Zante Beauty, home"><span class="logo-z">Zante</span><span class="logo-b">Beauty</span></a>
      <p>Your styling freedom. Wear it your way.</p>
    </div>
    <nav aria-label="Shop links"><p class="foot-h">Shop</p><a href="shop.html#p-halfwig">The Half Wig</a><a href="shop.html#p-upart">The U-Part Wig</a><a href="hair-drop.html">The Zante Hair Drop</a><a href="hair-guide.html">Hair Guide</a></nav>
    <nav aria-label="Help links"><p class="foot-h">Help</p><a href="faqs.html">FAQs</a><a href="hair-drop.html#delivery">Shipping and delivery</a><a href="terms.html#t-returns">Returns and refunds</a><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms and conditions</a></nav>
    <div class="foot-contact"><p class="foot-h">Contact</p>
      <p>WhatsApp: <a href="https://wa.me/27686954639" target="_blank" rel="noopener">+27 68 695 4639</a></p>
      <p>Email: <a href="mailto:zantebeauty@outlook.com">zantebeauty@outlook.com</a></p>
      <p>Preorders close on the first and third Monday of each month at 18:00 SAST.</p>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© <span id="year">2026</span> Zante Beauty, a trading name of Zamasante Suppliers (Pty) Ltd. Reg. 2021/430581/07.</p>
    <button type="button" class="link-btn" id="themeBtn" aria-label="Switch to dark mode">Dark mode</button>
  </div>
</footer>

<!-- bag -->
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="bag" aria-label="Your bag" aria-hidden="true">
  <div class="drawer-head"><h2>Your bag</h2><button class="icon-btn" id="bagClose" type="button" aria-label="Close bag">{ICON_CLOSE}</button></div>
  <p class="bag-drop">Allocated to <b data-drop-name>the next drop</b></p>
  <ul class="bag-list" id="bagList"></ul>
  <div class="bag-upsell" id="bagUpsell"></div>
  <div class="drawer-foot">
    <p class="bag-total"><span>Subtotal</span><b id="bagTotal">R0</b></p>
    <p class="small" id="bagPjn">Delivery is calculated at checkout.</p>
    <button class="btn btn--solid btn--full" type="button" id="checkoutBtn">Order on WhatsApp</button>
    <p class="small bag-note">Online card payment is coming soon. Your order is sent to us on WhatsApp and we confirm payment details with you.</p>
  </div>
</aside>

<!-- review form -->
<div class="modal" id="reviewModal" role="dialog" aria-modal="true" aria-labelledby="rvTitle" hidden>
  <form class="modal-box" id="reviewForm" novalidate>
    <div class="drawer-head"><h2 id="rvTitle">Write a review</h2><button class="icon-btn" type="button" data-close aria-label="Close">{ICON_CLOSE}</button></div>
    <p class="small">Your name is never shown. We use your order number only to confirm you are a Zante client. Reviews appear after we approve them. <a href="privacy.html#p-collect">How we use your information</a>.</p>
    <fieldset class="stars-in"><legend>Your rating</legend><div class="stars-row">
      <input type="radio" name="rating" id="r5" value="5" checked><label for="r5" title="5 stars">★</label>
      <input type="radio" name="rating" id="r4" value="4"><label for="r4" title="4 stars">★</label>
      <input type="radio" name="rating" id="r3" value="3"><label for="r3" title="3 stars">★</label>
      <input type="radio" name="rating" id="r2" value="2"><label for="r2" title="2 stars">★</label>
      <input type="radio" name="rating" id="r1" value="1"><label for="r1" title="1 star">★</label>
    </div></fieldset>
    <div class="field-row">
      <label class="field">Product
        <select name="product" required><option value="">Choose</option><option value="halfwig">Half Wig</option><option value="upart">U-Part Wig</option></select>
      </label>
      <label class="field">Length
        <select name="length"><option value="">Not sure</option><option>10"</option><option>12"</option><option>14"</option><option>16"</option><option>18"</option><option>20"</option><option>22"</option></select>
      </label>
    </div>
    <label class="field">Your review
      <textarea name="body" rows="4" maxlength="600" required placeholder="How does it look, feel and wear?"></textarea>
    </label>
    <div class="field-row">
      <label class="field">Order number <span class="opt">(optional)</span><input name="order_ref" maxlength="40" placeholder="e.g. ZB-2026-12-01_07"></label>
      <label class="field">City <span class="opt">(optional)</span><input name="city" maxlength="40" placeholder="e.g. Durban"></label>
    </div>
    <label class="check"><input type="checkbox" name="consent" required> I agree that Zante Beauty may show this review on its website and social media, without my name (see our <a href="terms.html#t-reviews">terms</a>).</label>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="form-msg" id="reviewMsg" role="status"></p>
    <button class="btn btn--solid btn--full" type="submit">Submit review</button>
  </form>
</div>

<!-- quick view -->
<div class="qv" id="quickView" role="dialog" aria-modal="true" aria-labelledby="qvTitle" hidden><div class="qv-box"></div></div>

<!-- search -->
<div class="search" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Search products" hidden>
  <div class="search-box">
    <div class="search-row">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <label class="sr" for="searchInput">Search products</label>
      <input id="searchInput" type="search" placeholder="Search half wigs, U-parts, bonnets…" autocomplete="off">
      <button class="icon-btn" type="button" data-search-close aria-label="Close search">{ICON_CLOSE}</button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="assets/js/app.js"></script>
</body>
</html>
'''


def build():
    for out, (src, title, desc, active) in PAGES.items():
        body = (SRC / src).read_text()
        html = head(title, desc) + '\n' + header(active, out == 'index.html') + '<span id="top"></span>\n' + body + footer()
        (ROOT / out).write_text(html)
        print('wrote', out)


if __name__ == '__main__':
    build()
