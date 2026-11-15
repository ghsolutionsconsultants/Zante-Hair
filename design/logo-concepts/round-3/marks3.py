"""Zante Beauty logo marks, round 3: hair-led symbols. Each concept: wordmark(scheme) + symbol(scheme).
Only the words "Zante Beauty" appear.
"""
import math
from marks import PLUM, PURPLE, PINK, PETAL, BLUSH, CREAM, SCHEMES


def c(s):
    return SCHEMES[s]


def word_block(k, x, y, size=46, track=12, anchor='start', serif=False):
    fam = "'Libre Caslon Display'" if serif else 'Jost'
    w = 400 if serif else 500
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family={fam} font-weight="{w}" font-size="{size}" letter-spacing="{track}" fill="{k["ink"]}">ZANTE</text>'
            f'<text x="{x + (0 if anchor == "start" else 0)}" y="{y + size * 0.62}" text-anchor="{anchor}" font-family="Jost" font-weight="500" font-size="{size * 0.27:.1f}" letter-spacing="{track * 0.95:.1f}" fill="{k["acc"]}">BEAUTY</text>')


# 1 ─ The Pick: an afro pick whose handle carries a cut-out Z
def _pick(k, uid):
    teeth = ''.join(f'<rect x="{31 + i * 9.4:.1f}" y="56" width="4.4" height="64" rx="2.2" fill="{k["ink"]}"/>' for i in range(7))
    return f'''<defs><mask id="{uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="130"><rect width="120" height="130" fill="#fff"/>
      <path d="M45 20 H74 L46 44 H75" fill="none" stroke="#000" stroke-width="5.2" stroke-linejoin="miter"/></mask></defs>
      <rect x="27" y="8" width="66" height="44" rx="18" fill="{k["ink"]}" mask="url(#{uid})"/>
      <rect x="27" y="50" width="66" height="8" rx="2" fill="{k["ink"]}"/>{teeth}
      <circle cx="93" cy="10" r="5" fill="{k["acc"]}"/>'''


def pick_word(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 470 150"><g transform="translate(6 12)">{_pick(k, "pk" + s)}</g>{word_block(k, 140, 78, 50, 14)}</svg>'


def pick_sym(s='light'):
    return f'<svg viewBox="8 2 104 122">{_pick(c(s), "pks" + s)}</svg>'


# 2 ─ The Curl: a geometric Z whose base winds into a coil
def _spiral(cx, cy, r0, r1, t0, turns, n=90):
    pts = []
    for i in range(n + 1):
        f = i / n
        t = t0 - f * turns * 2 * math.pi
        r = r0 + (r1 - r0) * f
        pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)


def _curl(k):
    sp = _spiral(80, 76, 22, 7, math.pi / 2, 1.25)
    return f'''<path d="M16 20 H98 L30 98 H80" fill="none" stroke="{k["ink"]}" stroke-width="9" stroke-linejoin="miter"/>
      <path d="M80 98 L{sp}" fill="none" stroke="{k["acc"]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'''


def curl_word(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 470 140"><g transform="translate(4 8) scale(1.02)">{_curl(k)}</g>{word_block(k, 140, 74, 50, 14)}</svg>'


def curl_sym(s='light'):
    return f'<svg viewBox="4 6 112 106">{_curl(c(s))}</svg>'


# 3 ─ The Bundle: a weft of body-wave hair hanging inside an arch
def _bundle(k):
    strands = []
    for i in range(9):
        x = 26 + i * 7.5
        col = k['acc'] if i % 3 == 1 else k['ink']
        pts = []
        for j in range(0, 61):
            y = 38 + j * 1.25
            dx = 5 * math.sin(j / 60 * 2.6 * math.pi + i * 0.35) * (j / 60)
            gather = (60 - x) * 0.18 * (j / 60)
            pts.append(f'{x + dx + gather:.1f} {y:.1f}')
        strands.append(f'<path d="M{"L".join(pts)}" fill="none" stroke="{col}" stroke-width="3" stroke-linecap="round"/>')
    return f'''<path d="M12 116 V52 A48 48 0 0 1 108 52 V116" fill="none" stroke="{k["ink"]}" stroke-width="2.4"/>
      {''.join(strands)}<rect x="20" y="32" width="80" height="9" rx="4.5" fill="{k["ink"]}"/>'''


def bundle_word(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 480 150"><g transform="translate(6 10)">{_bundle(k)}</g>{word_block(k, 146, 80, 58, 10, serif=True)}</svg>'


def bundle_sym(s='light'):
    return f'<svg viewBox="6 0 108 122">{_bundle(c(s))}</svg>'


# 4 ─ The Texture: bold letters filled with wavy hair strands
def texture_word(s='light'):
    k = c(s); pid = 'tx' + s
    return f'''<svg viewBox="0 0 560 190"><defs><pattern id="{pid}" width="22" height="12" patternUnits="userSpaceOnUse">
      <rect width="22" height="12" fill="{k["ink"]}"/><path d="M-2 6 C3 1 8 11 13 6 S22 1 27 6" fill="none" stroke="{k["acc"]}" stroke-width="2.2"/></pattern></defs>
      <text x="280" y="128" text-anchor="middle" font-family="Syne" font-weight="800" font-size="100" letter-spacing="-1" fill="url(#{pid})">ZANTE</text>
      <text x="284" y="172" text-anchor="middle" font-family="Jost" font-weight="500" font-size="15" letter-spacing="16" fill="{k["ink"]}">BEAUTY</text></svg>'''


def texture_sym(s='light'):
    k = c(s); pid = 'txs' + s
    return f'''<svg viewBox="0 0 120 120"><defs><pattern id="{pid}" width="16" height="9" patternUnits="userSpaceOnUse">
      <rect width="16" height="9" fill="{k["ink"]}"/><path d="M-2 4.5 C2 0.5 6 8.5 10 4.5 S16 0.5 20 4.5" fill="none" stroke="{k["acc"]}" stroke-width="1.8"/></pattern></defs>
      <text x="60" y="98" text-anchor="middle" font-family="Syne" font-weight="800" font-size="104" fill="url(#{pid})">Z</text></svg>'''


# 5 ─ The Crown of Curls: an afro silhouette in profile, built from overlapping curls
def _afro(k):
    import random
    rnd = random.Random(7)
    cx, cy = 44, 46
    blobs = []
    for i in range(30):
        a = math.radians(-80 + i * (290 / 29))
        x, y = cx + 33 * math.cos(a), cy + 36 * math.sin(a)
        blobs.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{9 + rnd.random() * 4:.1f}"/>')
    face = ('M64 28 C70 34 73 44 74 52 L83 62 L77 65 C79 68 76 70 79 73 C76 76 78 80 72 83 '
            'C69 86 66 86 64 88 L64 108 L48 108 L48 70 Z')
    return f'''<g fill="{k["ink"]}"><ellipse cx="{cx}" cy="{cy}" rx="33" ry="36"/>{''.join(blobs)}</g>
      <path d="{face}" fill="{k["acc"]}"/>
      <line x1="57" y1="80" x2="57" y2="86" stroke="{k["ink"]}" stroke-width="1.4"/><circle cx="57" cy="90" r="4.2" fill="{k["ink"]}"/><circle cx="56" cy="89" r="1.4" fill="{CREAM}"/>'''


def afro_word(s='light'):
    k = c(s)
    return f'<svg viewBox="0 0 470 150"><g transform="translate(4 14)">{_afro(k)}</g>{word_block(k, 140, 80, 50, 14)}</svg>'


def afro_sym(s='light'):
    return f'<svg viewBox="-2 -6 100 118">{_afro(c(s))}</svg>'


# 6 ─ The Strand: a monoline script whose last letter flows off into a long hair strand
def strand_word(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 0 560 200">
      <text x="30" y="128" font-family="Sacramento" font-size="176" fill="{k["ink"]}">zante</text>
      <path d="M330 98 C362 92 384 66 372 54 C360 42 342 62 364 80 C392 104 440 66 480 88 S526 124 552 100" fill="none" stroke="{k["acc"]}" stroke-width="2.6" stroke-linecap="round"/>
      <text x="300" y="178" text-anchor="middle" font-family="Jost" font-weight="500" font-size="15" letter-spacing="15" fill="{k["ink"]}">BEAUTY</text></svg>'''


def strand_sym(s='light'):
    k = c(s)
    return f'''<svg viewBox="0 6 124 112"><path d="M14 22 H72 L20 82 H62" fill="none" stroke="{k["ink"]}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M62 82 C78 82 92 86 94 96 C96 106 82 108 80 98 C78 88 96 80 116 92" fill="none" stroke="{k["acc"]}" stroke-width="5" stroke-linecap="round"/></svg>'''

CONCEPTS = [
    ('01', 'The Pick', pick_word, pick_sym,
     'An afro pick, the most recognisable tool in Black hair culture, with a Z cut out of the handle. Instantly says hair, heritage and pride.',
     'Boldest cultural statement'),
    ('02', 'The Curl', curl_word, curl_sym,
     'A sharp geometric Z whose base winds into a pink coil. Straight edges meet natural texture, which is the whole product in one mark.',
     'Simple, strong, works tiny'),
    ('03', 'The Bundle', bundle_word, bundle_sym,
     'A weft of body-wave hair hanging inside a boutique arch. It shows exactly what she sells, in a refined, almost jewellery-like line style.',
     'Most literal, best for bundles'),
    ('04', 'The Texture', texture_word, texture_sym,
     'Heavy letters filled with wavy hair strands, so the name itself is made of hair. Loud, modern and made for social media.',
     'Maximum impact on social'),
    ('05', 'Crown of Curls', afro_word, afro_sym,
     'A woman in profile with a full crown of curls built from overlapping circles, and a pink pearl earring. Celebrates natural hair and the women who wear it.',
     'Warm, human, celebratory'),
    ('06', 'The Strand', strand_word, strand_sym,
     'A flowing handwritten "zante" whose final stroke becomes a loose strand of hair, curling once and drifting off. Soft, feminine and full of movement.',
     'Elegant and personal'),
]
