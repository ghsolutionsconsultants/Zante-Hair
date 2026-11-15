"""Zante Beauty logo concepts, round 2: presentation deck (16:9 pages with mock-ups).
Usage: python3 deck2.py <out.html>
"""
import sys
sys.path.insert(0, '.')
import importlib, os
from marks import PLUM, PURPLE, PINK, PETAL, BLUSH, CREAM
CONCEPTS = importlib.import_module(os.environ.get('MARKS', 'marks')).CONCEPTS
ROUND = os.environ.get('ROUND', '2')

FONTS = ('https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Jost:wght@300;400;500;600'
         '&family=Pinyon+Script&family=Sacramento&family=Syne:wght@800&family=Playfair+Display:wght@900&family=Bodoni+Moda:opsz,wght@6..96,400..800&display=swap')


def concept_page(num, name, word, sym, why, best):
    return f'''<section class="page">
  <header><span class="num">{num}</span><h2>{name}</h2><p class="best">{best}</p></header>
  <div class="layout">
    <div class="hero">{word('light')}</div>
    <div class="dark">{word('dark')}</div>
    <div class="syms"><div class="sym light">{sym('light')}</div><div class="sym pink">{sym('pink')}</div><div class="sym plum">{sym('dark')}</div></div>
    <div class="mock cards"><div class="card back">{sym('light')}</div><div class="card front">{word('dark')}</div></div>
    <div class="mock tags"><div class="tag">{sym('light')}</div><div class="tag t2">{sym('dark')}</div></div>
    <div class="mock ig"><div class="phone"><div class="ava">{sym('pink')}</div><b>Zante Beauty</b><div class="bars"><i></i><i></i><i></i></div>
      <div class="tiles"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>
  </div>
  <p class="why">{why}</p>
  <footer>Zante Beauty · Logo concepts · Round {ROUND}</footer>
</section>'''


def build():
    first_word = CONCEPTS[0][2]
    cover = f'''<section class="page cover"><div class="cover-in">
      <p class="kicker">Brand identity · Round {ROUND}</p><h1>Zante Beauty</h1><p class="sub">{len(CONCEPTS)} logo directions, each shown as a full system: wordmark, symbol, colour and real-world use.</p></div>
      <div class="cover-logo">{CONCEPTS[min(4, len(CONCEPTS)-1)][2]('dark')}</div><footer>Zante Beauty · Logo concepts · Round {ROUND}</footer></section>'''
    ov = ''.join(f'<div class="ov"><div class="ov-l">{w("light")}</div><p><span>{n}</span>{nm}</p></div>' for n, nm, w, *_ in CONCEPTS)
    overview = f'<section class="page"><header><h2>The {len(CONCEPTS)} directions</h2><p class="best">Choose one or two to refine</p></header><div class="ovgrid">{ov}</div><footer>Zante Beauty · Logo concepts · Round {ROUND}</footer></section>'
    palette = f'''<section class="page"><header><h2>Colour and type</h2><p class="best">Shared by every direction</p></header>
      <div class="pal">{''.join(f'<div class="sw" style="background:{h}"><span style="color:{t}">{nm}<br><b>{h}</b></span></div>' for nm, h, t in [("Plum", PLUM, CREAM), ("Orchid", PURPLE, CREAM), ("Zante Pink", PINK, CREAM), ("Petal", PETAL, PLUM), ("Blush", BLUSH, PLUM), ("Cream", CREAM, PLUM)])}</div>
      <p class="why">Plum carries the name. Pink is the signature accent and is used sparingly, so it always means Zante. Blush and cream are the backgrounds. Every logo also works in a single colour for printing, embossing and foil.</p>
      <footer>Zante Beauty · Logo concepts · Round {ROUND}</footer></section>'''
    pages = [cover, overview] + [concept_page(*c) for c in CONCEPTS] + [palette]
    return f'''<!doctype html><html><head><meta charset="utf-8"><title>Zante Beauty logo concepts</title><link rel="stylesheet" href="{FONTS}">
<style>
@page {{ size: 1600px 900px; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: Jost, sans-serif; color: {PLUM}; background: #ccc; }}
.page {{ width: 1600px; height: 900px; background: {CREAM}; position: relative; padding: 50px 64px 44px; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; gap: 18px; }}
header {{ display: flex; align-items: baseline; gap: 16px; }}
.num {{ font-size: 15px; font-weight: 600; color: {PINK}; letter-spacing: .08em; }}
h2 {{ margin: 0; font-family: 'Libre Caslon Display', serif; font-weight: 400; font-size: 46px; }}
.best {{ margin: 0 0 0 auto; font-size: 15px; letter-spacing: .12em; text-transform: uppercase; color: {PURPLE}; font-weight: 500; }}
footer {{ position: absolute; left: 64px; bottom: 18px; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #A58FA4; }}
.layout {{ flex: 1; min-height: 0; display: grid; gap: 14px; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 0.62fr 0.9fr;
  grid-template-areas: "hero hero dark" "hero hero syms" "cards tags ig"; }}
.layout > div {{ border-radius: 4px; overflow: hidden; min-height: 0; }}
.hero {{ grid-area: hero; background: {BLUSH}; display: grid; place-items: center; }}
.hero svg {{ width: 74%; max-height: 300px; }}
.dark {{ grid-area: dark; background: {PLUM}; display: grid; place-items: center; }}
.dark svg {{ width: 78%; max-height: 150px; }}
.syms {{ grid-area: syms; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }}
.sym {{ display: grid; place-items: center; border-radius: 4px; }}
.sym svg {{ width: 62%; max-height: 80%; }}
.sym.light {{ background: {BLUSH}; }} .sym.pink {{ background: {PINK}; }} .sym.plum {{ background: {PLUM}; }}
.mock {{ position: relative; background: #EFE4E8; }}
.cards {{ grid-area: cards; }}
.card {{ position: absolute; width: 250px; height: 145px; border-radius: 6px; display: grid; place-items: center; box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 18px 30px -14px rgba(43,20,51,.45); }}
.card svg {{ width: 70%; max-height: 70%; }}
.card.back {{ background: {BLUSH}; left: 46%; top: 22%; transform: rotate(7deg); }}
.card.back svg {{ width: 34%; }}
.card.front {{ background: {PLUM}; left: 8%; top: 28%; transform: rotate(-5deg); }}
.tags {{ grid-area: tags; display: flex; align-items: center; justify-content: center; gap: 26px; background: #E9DCE2; }}
.tag {{ width: 120px; height: 190px; border-radius: 10px 10px 16px 16px; background: {PETAL}; display: grid; place-items: center; position: relative; box-shadow: 0 16px 26px -14px rgba(43,20,51,.5); transform: rotate(-4deg); }}
.tag::before {{ content: ""; position: absolute; top: 14px; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: #E9DCE2; box-shadow: inset 0 1px 2px rgba(0,0,0,.25); }}
.tag svg {{ width: 64%; }}
.tag.t2 {{ background: {PLUM}; transform: rotate(5deg) translateY(10px); }}
.tag.t2::before {{ background: #E9DCE2; }}
.ig {{ grid-area: ig; display: grid; place-items: center; background: #F3E9ED; }}
.phone {{ width: 230px; height: 230px; background: #fff; border-radius: 14px; padding: 18px; display: grid; justify-items: center; align-content: start; gap: 8px; box-shadow: 0 18px 30px -16px rgba(43,20,51,.45); }}
.ava {{ width: 76px; height: 76px; border-radius: 50%; background: {PINK}; display: grid; place-items: center; box-shadow: 0 0 0 3px #fff, 0 0 0 5px {PETAL}; }}
.ava svg {{ width: 64%; }}
.phone b {{ font-size: 15px; font-weight: 600; }}
.bars {{ display: flex; gap: 6px; }} .bars i {{ display: block; width: 40px; height: 6px; border-radius: 3px; background: #EEE3E8; }}
.tiles {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; width: 100%; margin-top: 4px; }}
.tiles i {{ display: block; height: 24px; background: {BLUSH}; }} .tiles i:nth-child(2n) {{ background: {PETAL}; }} .tiles i:nth-child(3) {{ background: {PLUM}; }}
.why {{ margin: 0; font-size: 18px; line-height: 1.5; color: #5F4868; max-width: 1150px; }}
.cover {{ background: {PLUM}; color: {CREAM}; justify-content: center; }}
.cover-in {{ display: grid; gap: 16px; max-width: 760px; }}
.kicker {{ margin: 0; font-size: 15px; letter-spacing: .2em; text-transform: uppercase; color: {PETAL}; }}
.cover h1 {{ margin: 0; font-family: 'Libre Caslon Display', serif; font-weight: 400; font-size: 110px; line-height: 1; }}
.sub {{ margin: 0; font-size: 22px; line-height: 1.5; color: #E8CDE2; }}
.cover-logo {{ position: absolute; right: 64px; bottom: 90px; width: 420px; opacity: .95; }}
.cover footer {{ color: #9C7FA0; }}
.ovgrid {{ flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: 1fr 1fr; gap: 14px; }}
.ov {{ background: {BLUSH}; border-radius: 4px; display: grid; grid-template-rows: 1fr auto; padding: 16px 18px; }}
.ov-l {{ display: grid; place-items: center; min-height: 0; }} .ov-l svg {{ width: 86%; max-height: 130px; }}
.ov p {{ margin: 0; font-size: 15px; font-weight: 500; }} .ov span {{ color: {PINK}; margin-right: 8px; font-weight: 600; }}
.pal {{ display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; height: 520px; }}
.sw {{ border-radius: 4px; display: flex; align-items: flex-end; padding: 18px; box-shadow: inset 0 0 0 1px rgba(43,20,51,.06); }}
.sw span {{ font-size: 16px; line-height: 1.5; }} .sw b {{ font-weight: 500; letter-spacing: .06em; }}
</style></head><body>{''.join(pages)}</body></html>'''


if __name__ == '__main__':
    open(sys.argv[1], 'w').write(build())
    print('wrote')
