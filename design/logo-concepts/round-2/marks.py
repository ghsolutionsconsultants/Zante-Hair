"""Zante Beauty logo marks, round 2. Each concept is a small identity system:
wordmark(colour scheme) and symbol(colour scheme). Flat colours only.
"""
PLUM, PURPLE, PINK, PETAL, BLUSH, CREAM = '#2B1433', '#6E3290', '#D9558F', '#F6B8CF', '#FDEEF4', '#FFF8F5'
ZPATH = 'M31 32 H85 Q90 32 87 36 C76 50 58 52 56 60 C54 68 44 74 36 83 Q33 87 40 87 H90'
WORD = ('M0 20 H44 L0 80 H46 M72 80 L93.6 28.4 M122 80 L100.4 28.4 M81.6 59 C89 49 105 69 112.4 59 '
        'M148 80 V20 L192 80 V20 M218 20 H264 M241 20 V80 M330 20 H290 V80 H330 M290 50 H322')

# scheme: main ink and accent for each background
SCHEMES = {
    'light': dict(ink=PLUM, acc=PINK, soft=PETAL),
    'dark': dict(ink=CREAM, acc=PETAL, soft='#8E5AA8'),
    'pink': dict(ink=PLUM, acc=CREAM, soft=CREAM),
}


def c(s):
    return SCHEMES[s]


# 1 ─ Editorial: lowercase Caslon wordmark; the z sweeps into a hair wave under the word
def editorial_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 520 190">
  <text x="40" y="112" font-family="Libre Caslon Display" font-size="132" letter-spacing="-2" fill="{k['ink']}">zante</text>
  <path d="M60 128 C150 150 230 112 320 130 S440 140 478 120" fill="none" stroke="{k['acc']}" stroke-width="2.4" stroke-linecap="round"/>
  <text x="262" y="176" text-anchor="middle" font-family="Jost" font-size="15" font-weight="500" letter-spacing="11" fill="{k['ink']}">BEAUTY</text></svg>'''


def editorial_sym(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 120 120"><text x="58" y="82" text-anchor="middle" font-family="Libre Caslon Display" font-size="104" fill="{k['ink']}">z</text>
  <path d="M26 96 C50 106 74 86 98 94" fill="none" stroke="{k['acc']}" stroke-width="3" stroke-linecap="round"/></svg>'''


# 2 ─ Monogram: Z and B in a high-contrast serif, overlapped like a fashion-house crest
def monogram_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 560 200">
  <g transform="translate(20 10)">{_zb(k, 0.95)}</g>
  <line x1="208" y1="50" x2="208" y2="150" stroke="{k['ink']}" stroke-opacity=".25" stroke-width="1.2"/>
  <text x="236" y="108" font-family="Bodoni Moda" font-weight="500" font-size="54" letter-spacing="14" style="font-variation-settings:'opsz' 28" fill="{k['ink']}">ZANTE</text>
  <text x="239" y="142" font-family="Jost" font-size="14" font-weight="500" letter-spacing="12.5" fill="{k['acc']}">BEAUTY</text></svg>'''


def _zb(k, sc=1):
    return f'''<g transform="scale({sc})">
    <text x="78" y="170" font-family="Bodoni Moda" font-weight="500" font-size="150" style="font-variation-settings:'opsz' 30" fill="{k['acc']}">B</text>
    <text x="18" y="146" font-family="Bodoni Moda" font-weight="500" font-size="170" style="font-variation-settings:'opsz' 30" fill="{k['ink']}">Z</text></g>'''


def monogram_sym(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 200 200"><g transform="translate(14 6)">{_zb(k, 0.92)}</g></svg>'


# 3 ─ Modern: lowercase geometric sans; the z is redrawn with a soft wave in its diagonal
def _wavez(col, x=0, y=0, sc=1.0, w=11):
    return (f'<path transform="translate({x} {y}) scale({sc})" d="M4 6 H46 C30 18 40 26 24 32 C10 38 18 46 4 54 H48" '
            f'fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="square" stroke-linejoin="miter"/>')


def modern_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 360 170">
  {_wavez(k['ink'], 34, 50, 1.18, 10)}
  <text x="98" y="114" font-family="Jost" font-weight="500" font-size="96" letter-spacing="-1" fill="{k['ink']}">ante</text>
  <circle cx="295" cy="108" r="7.5" fill="{k['acc']}"/>
  <text x="38" y="152" font-family="Jost" font-size="15" font-weight="500" letter-spacing="9.5" fill="{k['ink']}" fill-opacity=".75">BEAUTY</text></svg>'''


def modern_sym(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 120 120">{_wavez(k["ink"], 28, 28, 1.15, 10)}<circle cx="94" cy="88" r="7" fill="{k["acc"]}"/></svg>'


# 4 ─ Fashion caps: wide geometric capitals, the A has no crossbar (Λ) — quiet luxury
def _caps(k, x0=0, y0=0, h=64, w=4.2):
    # letters drawn as strokes so the Λ matches the rest exactly
    sp = h * 0.42
    lw = h * 0.74
    p = []
    x = x0
    p.append(f'M{x} {y0} H{x+lw} L{x} {y0+h} H{x+lw}'); x += lw + sp
    p.append(f'M{x} {y0+h} L{x+lw*0.55} {y0} L{x+lw*1.1} {y0+h}'); x += lw * 1.1 + sp
    p.append(f'M{x} {y0+h} V{y0} L{x+lw*0.9} {y0+h} V{y0}'); x += lw * 0.9 + sp
    p.append(f'M{x} {y0} H{x+lw} M{x+lw/2} {y0} V{y0+h}'); x += lw + sp
    p.append(f'M{x+lw*0.82} {y0} H{x} V{y0+h} H{x+lw*0.82} M{x} {y0+h/2} H{x+lw*0.7}'); x += lw * 0.82
    return f'<path d="{" ".join(p)}" fill="none" stroke="{k["ink"]}" stroke-width="{w}" stroke-linejoin="miter" stroke-linecap="butt"/>', x - x0


def caps_word(s='light'):
    k = c(s)
    g, wd = _caps(k, 0, 0, 64, 4.2)
    return f'''<svg viewBox="-40 -40 {wd+80} 170"><g>{g}</g>
  <text x="{wd/2}" y="112" text-anchor="middle" font-family="Jost" font-size="14" font-weight="500" letter-spacing="14" fill="{k['acc']}">BEAUTY</text></svg>'''


def caps_sym(s='light'):
    k = c(s)
    lw, h = 52, 70
    d = f'M14 20 H{14+lw} L14 {20+h} H{14+lw}'
    return f'''<svg viewBox="0 0 120 120"><path d="{d}" fill="none" stroke="{k['ink']}" stroke-width="4.5" stroke-linejoin="miter"/>
  <path d="M60 {20+h} L{60+19} 20 L{60+38} {20+h}" fill="none" stroke="{k['acc']}" stroke-width="4.5" stroke-linejoin="miter"/></svg>'''


# 5 ─ Silk Strand: the custom strand Z and monoline wordmark, now flat (no gradients)
def silk_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 520 150">
  <g transform="translate(0 8) scale(1.05)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="{ZPATH}" stroke="{k['ink']}" stroke-width="3" transform="translate(0 -4.4)"/>
    <path d="{ZPATH}" stroke="{k['acc']}" stroke-width="3.6"/>
    <path d="{ZPATH}" stroke="{k['soft']}" stroke-width="2.6" transform="translate(0 4.4)"/></g>
  <g transform="translate(150 22)"><path d="{WORD}" fill="none" stroke="{k['ink']}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="97" cy="21" r="5.6" fill="{k['acc']}"/></g>
  <text x="315" y="134" text-anchor="middle" font-family="Jost" font-size="14" font-weight="500" letter-spacing="10" fill="{k['ink']}" fill-opacity=".7">BEAUTY</text></svg>'''


def silk_sym(s='light'):
    k = c(s)
    return f'''<svg viewBox="16 16 84 84"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="{ZPATH}" stroke="{k['ink']}" stroke-width="3.4" transform="translate(0 -4.6)"/>
    <path d="{ZPATH}" stroke="{k['acc']}" stroke-width="4"/>
    <path d="{ZPATH}" stroke="{k['soft']}" stroke-width="3" transform="translate(0 4.6)"/></g>
    <circle cx="23" cy="28" r="6" fill="{k['acc']}"/></svg>'''


# 6 ─ Signature: a refined contemporary script with a spaced sans descriptor
def signature_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 520 210">
  <text x="258" y="136" text-anchor="middle" font-family="Pinyon Script" font-size="112" fill="{k['ink']}">Zante</text>
  <text x="262" y="190" text-anchor="middle" font-family="Jost" font-size="14" font-weight="500" letter-spacing="13" fill="{k['acc']}">BEAUTY</text></svg>'''


def signature_sym(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 120 120"><text x="60" y="94" text-anchor="middle" font-family="Pinyon Script" font-size="104" fill="{k['ink']}">Z</text></svg>'''



# 7 ─ Statement: heavy serif capitals sliced by a hair wave cut straight through the letters
def statement_word(s='light'):
    k = c(s); m = f'cut{s}'
    return f'''<svg viewBox="0 0 560 210"><defs><mask id="{m}" maskUnits="userSpaceOnUse" x="0" y="0" width="560" height="210">
    <rect width="560" height="210" fill="#fff"/>
    <path d="M-10 104 C60 74 120 130 200 100 S330 74 400 104 S500 128 570 92" fill="none" stroke="#000" stroke-width="16"/></mask></defs>
  <text x="280" y="138" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="124" letter-spacing="0" fill="{k['ink']}" mask="url(#{m})">ZANTE</text>
  <path d="M-10 104 C60 74 120 130 200 100 S330 74 400 104 S500 128 570 92" fill="none" stroke="{k['acc']}" stroke-width="2.6"/>
  <text x="283" y="188" text-anchor="middle" font-family="Jost" font-size="15" font-weight="500" letter-spacing="16" fill="{k['ink']}">BEAUTY</text></svg>'''


def statement_sym(s='light'):
    k = c(s); m = f'cuts{s}'
    return f'''<svg viewBox="0 0 120 120"><defs><mask id="{m}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
    <rect width="120" height="120" fill="#fff"/><path d="M0 62 C30 44 60 80 120 52" fill="none" stroke="#000" stroke-width="10"/></mask></defs>
  <text x="60" y="98" text-anchor="middle" font-family="Playfair Display" font-weight="900" font-size="110" fill="{k['ink']}" mask="url(#{m})">Z</text>
  <path d="M0 62 C30 44 60 80 120 52" fill="none" stroke="{k['acc']}" stroke-width="2"/></svg>'''

CONCEPTS = [
    ('01', 'Editorial', editorial_word, editorial_sym,
     'A lowercase serif wordmark with a single hand-drawn hair wave under the word. Calm and confident, the way premium beauty brands present themselves.',
     'Premium, timeless, works on everything'),
    ('02', 'Maison Monogram', monogram_word, monogram_sym,
     'A Z and B monogram in a high-contrast serif, set like a fashion-house crest beside a spaced wordmark. Made for embossing, foiling and packaging.',
     'Luxury and packaging'),
    ('03', 'Modern Wave', modern_word, modern_sym,
     'A clean lowercase sans where the z is redrawn with a soft hair wave in its diagonal, finished with a pink full stop. Friendly, current and very readable on a phone.',
     'Social media and a young audience'),
    ('04', 'Quiet Luxury', caps_word, caps_sym,
     'Wide geometric capitals with an open A (no crossbar), the way fashion houses draw their names. Minimal and expensive-looking.',
     'Upmarket positioning'),
    ('05', 'Silk Strand', silk_word, silk_sym,
     'The custom mark from the website, now in flat colour. Three strands of hair form the Z, and a pearl crowns the A. Fully custom, so nobody else can own it.',
     'Ownable, matches the website'),
    ('06', 'Signature', signature_word, signature_sym,
     'A refined contemporary script, as if the founder signed it, balanced by a spaced sans line. Personal and warm, the influencer-brand feel done properly.',
     'A personal, founder-led brand'),
    ('07', 'Statement', statement_word, statement_sym,
     'Heavy high-contrast capitals with a hair wave cut straight through the letters. Bold enough for a billboard, and the cut makes it unmistakably about hair.',
     'Maximum impact and recall'),
]
