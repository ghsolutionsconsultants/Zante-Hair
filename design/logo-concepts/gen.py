"""Builds the Zante Beauty logo concept deck as one HTML file (one 16:9 page per concept).
Usage: python3 gen.py <out.html>
"""
import sys

INK, PURPLE, PINK, LIGHT, BLUSH, NIGHT = '#2B1433', '#7B3FA6', '#E06AA0', '#FAC4DA', '#FFF0F6', '#2D1240'
ZPATH = 'M31 32 H85 Q90 32 87 36 C76 50 58 52 56 60 C54 68 44 74 36 83 Q33 87 40 87 H90'
WORD = ('M0 20 H44 L0 80 H46 M72 80 L93.6 28.4 M122 80 L100.4 28.4 M81.6 59 C89 49 105 69 112.4 59 '
        'M148 80 V20 L192 80 V20 M218 20 H264 M241 20 V80 M330 20 H290 V80 H330 M290 50 H322')
uid = [0]


def nid(p):
    uid[0] += 1
    return f'{p}{uid[0]}'


def pal(dark):
    """Colours for a light background (dark=False) or a deep purple/pink one (dark=True)."""
    return dict(ink='#FFF4F9' if dark else INK, accent=LIGHT if dark else PINK, deep='#E9C9F5' if dark else PURPLE)


# ---------------- 1. Silk Strand (refined current mark) ----------------
def silk(dark=False, icon=False):
    c = pal(dark); g = nid('s')
    z = f'''<defs><linearGradient id="{g}" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{c['deep']}"/><stop offset=".55" stop-color="{c['accent']}"/><stop offset="1" stop-color="{LIGHT}"/></linearGradient></defs>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="{ZPATH}" stroke="{c['ink']}" stroke-width="2.8" transform="translate(0 -4.2)"/>
        <path d="{ZPATH}" stroke="url(#{g})" stroke-width="4"/>
        <path d="{ZPATH}" stroke="#CDB0E8" stroke-width="2.3" transform="translate(0 4.2)"/></g>
      <circle cx="23" cy="28" r="7" fill="{c['accent']}"/>'''
    if icon:
        return f'<svg viewBox="12 14 92 86">{z}</svg>'
    return f'''<svg viewBox="0 0 520 140">
      <g transform="translate(0 6) scale(1.05)">{z}</g>
      <g transform="translate(150 22)"><path d="{WORD}" fill="none" stroke="{c['ink']}" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="97" cy="21" r="6.2" fill="{c['accent']}"/></g>
      <text x="315" y="128" text-anchor="middle" font-family="Outfit" font-size="15" letter-spacing="9" fill="{c['accent']}">BEAUTY</text></svg>'''


# ---------------- 2. Couture (fashion-house serif) ----------------
def couture(dark=False, icon=False):
    c = pal(dark)
    if icon:
        return f'''<svg viewBox="0 0 100 100"><text x="50" y="70" text-anchor="middle" font-family="Bodoni Moda" font-weight="500" font-size="70" style="font-variation-settings:'opsz' 11" fill="{c['ink']}">Z</text>
          <path d="M22 82 q7 -5 14 0 t14 0 t14 0 t14 0" fill="none" stroke="{c['accent']}" stroke-width="1.6"/></svg>'''
    return f'''<svg viewBox="0 0 560 170">
      <text x="291" y="98" text-anchor="middle" font-family="Bodoni Moda" font-weight="500" font-size="96" letter-spacing="22" style="font-variation-settings:'opsz' 11" fill="{c['ink']}">ZANTE</text>
      <path d="M150 124 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="{c['accent']}" stroke-width="1.6"/>
      <text x="285" y="160" text-anchor="middle" font-family="Outfit" font-size="15" letter-spacing="12" fill="{c['ink']}">BEAUTY · JOHANNESBURG</text></svg>'''


# ---------------- 3. Signature (influencer script) ----------------
def signature(dark=False, icon=False):
    c = pal(dark); g = nid('g')
    grad = f'<defs><linearGradient id="{g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{c["deep"]}"/><stop offset="1" stop-color="{c["accent"]}"/></linearGradient></defs>'
    if icon:
        return f'<svg viewBox="0 0 100 100">{grad}<text x="52" y="78" text-anchor="middle" font-family="Great Vibes" font-size="92" fill="url(#{g})">Z</text></svg>'
    return f'''<svg viewBox="0 0 520 190">{grad}
      <text x="250" y="128" text-anchor="middle" font-family="Great Vibes" font-size="150" fill="url(#{g})">Zante</text>
      <text x="388" y="168" text-anchor="middle" font-family="Outfit" font-size="16" font-weight="600" letter-spacing="10" fill="{c['ink']}">BEAUTY</text></svg>'''


# ---------------- 4. Arch Boutique ----------------
def arch(dark=False, icon=False):
    c = pal(dark)
    fill = '#FFF4F9' if dark else LIGHT
    letter = PURPLE
    emblem = f'''<path d="M10 120 V55 A45 45 0 0 1 100 55 V120 Z" fill="{fill}"/>
      <text x="55" y="104" text-anchor="middle" font-family="Playfair Display" font-style="italic" font-weight="500" font-size="78" fill="{letter}">z</text>
      <path d="M24 38 q8 -10 16 -4 t16 -2" fill="none" stroke="{PINK}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="80" cy="36" r="4" fill="{PINK}"/>'''
    if icon:
        return f'<svg viewBox="0 0 110 126">{emblem}</svg>'
    return f'''<svg viewBox="0 0 470 140">
      <g transform="translate(0 8)">{emblem}</g>
      <text x="132" y="82" font-family="Cormorant Garamond" font-weight="600" font-size="66" letter-spacing="10" fill="{c['ink']}">ZANTE</text>
      <text x="135" y="116" font-family="Outfit" font-size="14" letter-spacing="8.5" fill="{c['accent']}">BEAUTY BOUTIQUE</text></svg>'''


# ---------------- 5. Bubble Pop (evolution of the original) ----------------
def bubble(dark=False, icon=False):
    g, cl = nid('b'), nid('c')
    top_c, bot_c, edge = ('#FFFFFF', '#FAC4DA', '#7B3FA6') if dark else ('#F7A8C8', '#C2357A', '#9E2A63')
    defs = f'''<defs><linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top_c}"/><stop offset="1" stop-color="{bot_c}"/></linearGradient>
      <clipPath id="{cl}"><rect x="0" y="0" width="600" height="72"/></clipPath></defs>'''
    def word(txt, x, y, size, anchor='middle'):
        base = f'font-family="Fredoka" font-weight="700" font-size="{size}" text-anchor="{anchor}" letter-spacing="2"'
        return (f'<text x="{x}" y="{y}" {base} fill="url(#{g})" stroke="{edge}" stroke-width="2.5" paint-order="stroke">{txt}</text>'
                f'<text x="{x}" y="{y}" {base} fill="#fff" opacity=".35" clip-path="url(#{cl})">{txt}</text>')
    bubbles = ('<circle cx="34" cy="30" r="11" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2"/><circle cx="31" cy="27" r="3" fill="#fff"/>'
               '<circle cx="466" cy="104" r="8" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2"/>')
    if icon:
        return f'<svg viewBox="0 0 100 100">{defs}{word("Z", 50, 82, 92)}</svg>'
    sub = '#FFF4F9' if dark else PURPLE
    return f'''<svg viewBox="0 0 500 160">{defs}<rect width="0" height="0"/>
      {word("ZANTE", 250, 112, 108)}{bubbles}
      <text x="250" y="150" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="22" letter-spacing="6" fill="{sub}">beauty</text></svg>'''


# ---------------- 6. Seal (circular badge for packaging) ----------------
def seal(dark=False, icon=False):
    c = pal(dark); top, bot, g = nid('t'), nid('u'), nid('z')
    body = f'''<defs><path id="{top}" d="M30 100 A70 70 0 0 1 170 100"/><path id="{bot}" d="M22 100 A78 78 0 0 0 178 100"/>
      <linearGradient id="{g}" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{c['deep']}"/><stop offset="1" stop-color="{c['accent']}"/></linearGradient></defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="{c['deep']}" stroke-width="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="{c['deep']}" stroke-width="0.8"/>
      <text font-family="Outfit" font-weight="600" font-size="16" letter-spacing="5" fill="{c['ink']}"><textPath href="#{top}" startOffset="50%" text-anchor="middle">ZANTE BEAUTY</textPath></text>
      <text font-family="Outfit" font-size="11" letter-spacing="4" fill="{c['accent']}"><textPath href="#{bot}" startOffset="50%" text-anchor="middle">HAIR AND BEAUTY · SA</textPath></text>
      <circle cx="26" cy="104" r="2.5" fill="{c['accent']}"/><circle cx="174" cy="104" r="2.5" fill="{c['accent']}"/>
      <g transform="translate(58 52) scale(0.72)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="{ZPATH}" stroke="url(#{g})" stroke-width="6"/><circle cx="23" cy="28" r="7" fill="{c['accent']}" stroke="none"/></g>'''
    return f'<svg viewBox="0 0 200 200">{body}</svg>'


# ---------------- 7. Crown (queen of the strand) ----------------
def crown(dark=False, icon=False):
    c = pal(dark)
    crown_g = f'''<path d="M0 26 L6 6 L16 18 L24 0 L32 18 L42 6 L48 26 Z" fill="{c['accent']}"/>
      <circle cx="6" cy="5" r="3.4" fill="{c['deep']}"/><circle cx="24" cy="0" r="3.8" fill="{c['deep']}"/><circle cx="42" cy="5" r="3.4" fill="{c['deep']}"/>'''
    if icon:
        return f'''<svg viewBox="0 0 100 100"><g transform="translate(26 6)">{crown_g}</g>
          <text x="50" y="92" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="80" fill="{c['ink']}">Z</text></svg>'''
    return f'''<svg viewBox="0 0 470 170"><g transform="translate(78 6) rotate(-8 24 13)">{crown_g}</g>
      <text x="236" y="118" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="104" letter-spacing="6" fill="{c['ink']}">Zante</text>
      <text x="236" y="156" text-anchor="middle" font-family="Outfit" font-size="15" letter-spacing="11" fill="{c['accent']}">BEAUTY</text></svg>'''


CONCEPTS = [
    ('01', 'Silk Strand', silk, 'The refined current mark. Three hair strands form a body-wave Z, and the pearl comes from the bubbles in the original logo. Custom lettering, so nobody else can own it.', 'Premium and ownable. Works small.'),
    ('02', 'Couture', couture, 'A fashion-house wordmark in a high-contrast serif with a hair-wave line. It positions Zante next to luxury beauty brands.', 'Best for luxury pricing and packaging.'),
    ('03', 'Signature', signature, 'A flowing handwritten signature, like the founder signed it. Personal and warm, the look many influencer hair brands use.', 'Best for Instagram and TikTok.'),
    ('04', 'Arch Boutique', arch, 'A pink arch, like a salon mirror, holding an italic z with a hair flick. Reads as a boutique you can walk into.', 'Best for a shopfront and stickers.'),
    ('05', 'Bubble Pop', bubble, 'A cleaner, bolder version of the original glossy bubble letters. It keeps what people already recognise, with sharper shapes that print well.', 'Closest to the current logo. Young and fun.'),
    ('06', 'Seal', seal, 'A round badge with the strand Z at its centre and the brand around the edge. Made for bundle labels, wig boxes and satin bags.', 'Best as a packaging stamp.'),
    ('07', 'Crown', crown, 'An elegant serif wordmark with a small pearl crown. Says "queen" without being loud.', 'Classic and confident. Clear meaning.'),
]


def page_concept(num, name, fn, why, best):
    return f'''<section class="page">
  <header><span class="num">{num}</span><h2>{name}</h2><p class="best">{best}</p></header>
  <div class="grid">
    <div class="hero light">{fn()}</div>
    <div class="side">
      <div class="tile dark">{fn(dark=True)}</div>
      <div class="tile pink">{fn(dark=True)}</div>
      <div class="row">
        <div class="av light-av">{fn(icon=True)}</div>
        <div class="av dark-av">{fn(dark=True, icon=True)}</div>
        <div class="av tiny light-av">{fn(icon=True)}</div>
      </div>
    </div>
  </div>
  <p class="why">{why}</p>
  <footer>Zante Beauty · Logo concepts for review</footer>
</section>'''


def build():
    pages = []
    pages.append(f'''<section class="page cover">
  <div class="cover-in">{silk()}<h1>Logo concepts</h1><p>7 directions for Zante Beauty, shown on light, purple and pink, with app and Instagram icons.</p>
  <p class="small">Choose one or two favourites. The final logo is then refined and supplied in every format.</p></div>
  <footer>Zante Beauty · Logo concepts for review</footer></section>''')
    overview = ''.join(f'<div class="ov"><div class="ov-logo">{fn()}</div><p><b>{n}</b> {name}</p></div>' for n, name, fn, *_ in CONCEPTS)
    pages.append(f'<section class="page"><header><h2>All directions at a glance</h2></header><div class="ovgrid">{overview}</div><footer>Zante Beauty · Logo concepts for review</footer></section>')
    for c in CONCEPTS:
        pages.append(page_concept(*c))
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>Zante Beauty logo concepts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Fredoka:wght@400;600;700&family=Playfair+Display:ital,wght@1,500&family=Cormorant+Garamond:wght@500;600&family=Bodoni+Moda:opsz,wght@6..96,500&family=Outfit:wght@300;400;600&display=swap">
<style>
@page {{ size: 1600px 900px; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: Outfit, sans-serif; color: {INK}; background: #ddd; }}
.page {{ width: 1600px; height: 900px; background: #FFFAFC; position: relative; padding: 56px 72px; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; gap: 22px; }}
header {{ display: flex; align-items: baseline; gap: 18px; }}
.num {{ font-size: 18px; color: {PINK}; font-weight: 600; }}
h2 {{ margin: 0; font-family: 'Bodoni Moda', serif; font-weight: 500; font-size: 44px; }}
.best {{ margin: 0 0 0 auto; font-size: 18px; color: {PURPLE}; font-weight: 600; }}
.grid {{ flex: 1; display: grid; grid-template-columns: 1.55fr 1fr; gap: 18px; min-height: 0; }}
.hero, .tile {{ border-radius: 8px; display: grid; place-items: center; overflow: hidden; }}
.hero {{ background: {BLUSH}; padding: 60px; }}
.hero svg {{ width: 88%; max-height: 380px; }}
.side {{ display: grid; grid-template-rows: 1fr 1fr auto; gap: 18px; min-height: 0; }}
.tile {{ padding: 28px; }}
.tile svg {{ width: 78%; max-height: 150px; }}
.dark {{ background: {NIGHT}; }}
.pink {{ background: {PINK}; }}
.row {{ display: flex; gap: 18px; align-items: center; }}
.av {{ width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; overflow: hidden; }}
.av svg {{ width: 66%; height: 66%; }}
.av.tiny {{ width: 48px; height: 48px; }}
.light-av {{ background: {BLUSH}; box-shadow: 0 0 0 1px #eed5e1; }}
.dark-av {{ background: {NIGHT}; }}
.why {{ margin: 0; font-size: 19px; line-height: 1.5; max-width: 1050px; color: #5F4868; }}
footer {{ position: absolute; right: 72px; bottom: 22px; font-size: 13px; color: #A08AA3; }}
.cover {{ background: {BLUSH}; justify-content: center; }}
.cover-in {{ display: grid; gap: 22px; max-width: 760px; }}
.cover-in svg {{ width: 520px; }}
.cover h1 {{ margin: 18px 0 0; font-family: 'Bodoni Moda', serif; font-weight: 500; font-size: 72px; }}
.cover p {{ margin: 0; font-size: 22px; color: #5F4868; }}
.cover .small {{ font-size: 17px; }}
.ovgrid {{ flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }}
.ov {{ background: #fff; border: 1px solid #f0dbe6; border-radius: 8px; display: grid; grid-template-rows: 1fr auto; padding: 18px; }}
.ov-logo {{ display: grid; place-items: center; min-height: 0; }}
.ov-logo svg {{ width: 90%; max-height: 140px; }}
.ov p {{ margin: 8px 0 0; font-size: 15px; }} .ov b {{ color: {PINK}; margin-right: 6px; }}
</style></head><body>{''.join(pages)}</body></html>'''


if __name__ == '__main__':
    open(sys.argv[1], 'w').write(build())
    print('wrote', sys.argv[1])
