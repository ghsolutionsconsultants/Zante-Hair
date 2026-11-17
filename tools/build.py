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
    ('hair-guide.html', 'Hair guide'),
    ('our-story.html', 'Our story'),
    ('faqs.html', 'FAQs'),
]

PAGES = {
    # file: (body source, <title>, meta description, active nav file)
    'index.html': ('index.html', 'Zante Beauty', 'Zante Beauty: kinky straight half wigs and U-part wigs in 100% virgin human hair, pre-washed before dispatch. Ordered in two Zante Hair Drops a month.', None),
    'shop.html': ('shop.html', 'Shop · Zante Beauty', 'Shop the Zante Half Wig and U-Part Wig: 100% virgin human hair, kinky straight, 180% density, 10 to 22 inches.', 'shop.html'),
    'hair-drop.html': ('hair-drop.html', 'The Zante Hair Drop · Zante Beauty', 'How the Zante Hair Drop works: two preorder drops a month, cut-off dates, waiting times, delivery and tracking.', 'hair-drop.html'),
    'hair-guide.html': ('hair-guide.html', 'Hair guide · Zante Beauty', 'Half wig or U-part? Understand our kinky straight texture, 180% density and true-to-length hair.', 'hair-guide.html'),
    'our-story.html': ('our-story.html', 'Our story · Zante Beauty', 'Born from a name, built around her. The story of Zante Beauty and why we love kinky straight hair.', 'our-story.html'),
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
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" type="image/svg+xml" href="assets/brand/zante-app-icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Bodoni+Moda:opsz,wght@6..96,500..700&family=Fraunces:ital,opsz,wght@1,9..144,300..500&family=Manrope:wght@400..700&display=swap">
<link rel="stylesheet" href="assets/css/zante.css">
<script>
  /* Supabase keys go here once the project exists. Empty = reviews are kept on this device only. */
  window.ZANTE_CONFIG = {{ supabaseUrl: '', supabaseAnonKey: '' }};
</script>
</head>'''


def header(active, is_home):
    def links(cls=''):
        out = []
        for href, label in NAV:
            cur = ' aria-current="page"' if href == active else ''
            out.append(f'<a href="{href}"{cur}>{label}</a>')
        return ''.join(out)
    intro = '''
<!-- intro (homepage only) -->
<div class="intro" id="intro" aria-hidden="true">
  <p class="intro-mark"><span class="intro-z">Zante</span><span class="intro-b">Beauty</span></p>
</div>
''' if is_home else ''
    return f'''<body>
<a class="skip" href="#main">Skip to content</a>

{intro}
<!-- announcement: always the real next drop -->
<div class="announce">
  <p><span class="dot" aria-hidden="true"></span><b data-drop-name>The next Zante Hair Drop</b> closes <span data-drop-close>soon</span>. <a href="hair-drop.html">How the Drop works</a></p>
</div>

<header class="header" id="header">
  <div class="wrap header-in">
    <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
    <a class="logo" href="index.html" aria-label="Zante Beauty, home"><span class="logo-z">Zante</span><span class="logo-b">Beauty</span></a>
    <nav class="nav" aria-label="Main">{links()}</nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Search products">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <button class="icon-btn hide-sm" id="themeBtn" type="button" aria-label="Switch to dark mode">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </button>
      <button class="icon-btn bag-btn" id="bagBtn" type="button" aria-label="Open bag, 0 items">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
        <span class="bag-count" id="bagCount">0</span>
      </button>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="Mobile">
    <a href="index.html"{' aria-current="page"' if is_home else ''}>Home</a>{links()}
    <button type="button" id="themeBtnM">Dark mode</button>
  </nav>
</header>

<main id="main">
'''


def footer():
    return f'''</main>

<footer class="footer">
  <div class="wrap footer-in">
    <div class="footer-brand">
      <a class="logo logo--light" href="index.html" aria-label="Zante Beauty, home"><span class="logo-z">Zante</span><span class="logo-b">Beauty</span></a>
      <p>Your styling freedom. Wear it your way.</p>
    </div>
    <nav aria-label="Shop links"><p class="foot-h">Shop</p><a href="shop.html#p-halfwig">Half Wigs</a><a href="shop.html#p-upart">U-Part Wigs</a><a href="shop.html#cat-extensions">Extensions</a><a href="shop.html#cat-care">Care and accessories</a><a href="hair-drop.html">The Zante Hair Drop</a><a href="hair-guide.html">Hair guide</a></nav>
    <nav aria-label="Help links"><p class="foot-h">Help</p><a href="faqs.html">FAQs</a><a href="hair-drop.html#delivery">Shipping and delivery</a><a href="faqs.html#returns">Returns and refunds</a><a href="#contact" data-soon>Contact us</a></nav>
    <nav aria-label="Legal links"><p class="foot-h">Legal</p><a href="#privacy" data-soon>Privacy policy</a><a href="#terms" data-soon>Terms and conditions</a><a href="#payments" data-soon>Payment methods</a></nav>
  </div>
  <div class="wrap footer-base">
    <p>© <span id="year">2026</span> Zante Beauty. All rights reserved.</p>
    <p>Proudly South African. Pay in full or in 3 with PayJustNow.</p>
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
    <button class="btn btn--solid btn--full" type="button" id="checkoutBtn">Checkout</button>
  </div>
</aside>

<!-- review form -->
<div class="modal" id="reviewModal" role="dialog" aria-modal="true" aria-labelledby="rvTitle" hidden>
  <form class="modal-box" id="reviewForm" novalidate>
    <div class="drawer-head"><h2 id="rvTitle">Write a review</h2><button class="icon-btn" type="button" data-close aria-label="Close">{ICON_CLOSE}</button></div>
    <p class="small">Your name is never shown. We use your order number only to confirm you are a Zante client. Reviews appear after we approve them.</p>
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
    <label class="check"><input type="checkbox" name="consent" required> I agree that Zante Beauty may show this review on its website and social media, without my name.</label>
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
