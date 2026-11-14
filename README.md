# Zante Hair: draft homepage and logo system

A high-end, animation-rich homepage mock-up for **Zante Hair**, a South African women's hair brand selling virgin human hair bundles, HD lace closures and frontals, and glueless wigs. It also includes a redesigned logo system.

All product names, prices, policies and reviews are **sample content** for the mock-up.

## View it

| What | Where |
| --- | --- |
| Homepage (the only page in this draft) | `index.html` |
| Brand and logo sheet (reference only, not part of the site) | `design/brand-sheet.html` |
| Logo files (SVG) | `assets/brand/` |
| Logo files (PNG, high resolution) | `assets/brand/png/` |

Open `index.html` in any modern browser. No build step or server is needed.

To get a public link without claude.ai, either:

- **Netlify Drop (about 1 minute, no setup):** go to https://app.netlify.com/drop and drag in the unzipped draft folder. Netlify gives you a link like `https://<name>.netlify.app`.
- **GitHub Pages:** see below.

To publish it on GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**, then pick this branch and `/ (root)`. The site will appear at `https://ghsolutionsconsultants.github.io/Zante-Hair/`.

## The big idea

Real hair photography, the way influencer hair stores sell it (bundles on satin pink, raw bundles in hand, models wearing the unit), combined with a **live strand engine** (`assets/js/strands.js`) that no other SA hair store has. The engine draws hundreds of individual strands on a canvas, and they:

- **part when you run your cursor or finger through them**, then spring back
- **morph between textures** (Silk Straight, Body Wave, Deep Wave, Kinky Straight, Kinky Curly). Kinky Curly even shrinks like real coily hair
- **cross-fade between colours** (1B Natural Black, Zante Mauve, 27 Honey Blonde, 99J Burgundy, 613 Platinum)
- **draw the real product shape**: a wig on a crown with a middle part, a bundle on a weft band, a 5x5 lace closure, a 13x4 lace frontal, a headband wig
- **"Flip it"**: a button that throws the hair to one side so it swings and settles

## What is on the homepage

This is a **draft**: one page only, with a "DRAFT" watermark, and `noindex` so search engines skip it. Light mode is the default; visitors can switch to dark.

1. **Intro**: the logo draws itself, then the curtain parts (under 2 seconds, with a Skip button).
2. **Hero**: a campaign image with one headline and two buttons. On phones it fits on one screen.
3. **Shop the hair**: as you scroll down, the catalogue moves sideways (left to right). Arrows, sideways swipes and the filter chips (Wigs, Bundles, Curly and coily, Wavy and straight, Blonde and 613) also work. A progress bar shows how far along you are.
4. **Find your match**: a three-tap quiz that recommends a product.
5. **Build your own**: the live configurator for bundles, closures, frontals and glueless wigs.
6. **Why Zante**: drag to compare standard lace with HD lace across five skin tones.
7. **Install diaries** and the **care ritual**: sideways rows.
8. **Soft Life Club** sign-up and the footer. Every link stays on this page.

## The logo

The new mark keeps what people already know about Zante (the pink-mauve colour, the glossy bubbles, the silk) and makes it work at every size. It now uses the site palette: pink, light pink and purple accents.

- **Monogram**: three strands of hair form a Z. The diagonal is a body wave. The strands start at a pearl, taken from the bubbles in the original artwork.
- **Wordmark**: custom monoline capitals. The A carries a pearl crown and a body-wave crossbar.
- **Versions**: primary, reversed, one colour, stacked, monogram, and light and dark app icons.

See `design/brand-sheet.html` for the before and after, the anatomy, the palette, the type and the usage rules.

## Research that shaped it

- **Slie's Collection** (sliescollection.co.za) sells human hair half wigs and headband wigs, roughly R950 to R2,200.
- **Hair City** and **Hair Majesty** compete on fast delivery, free-delivery thresholds (R500 to R1,200) and pay-later options (PayJustNow, Payflex).
- **Luxy Hair** and **Bellami** win with tools: shade matching, quizzes and stylist chat.
- Most South African hair stores use standard store templates with static photos. Interactive tools are the gap Zante can own.

## Photo credits

All photos are free to use under the [Pexels licence](https://www.pexels.com/license/). They are placeholders until Zante has its own product shoot. The people shown are models, not Zante customers.

| File | Pexels photo | Photographer |
| --- | --- | --- |
| `p-deepwave-bundles.jpg`, `p-deepwave-2.jpg` | [15868320](https://www.pexels.com/photo/15868320/), [15868321](https://www.pexels.com/photo/15868321/) | Kobi Brown |
| `p-ombre-bundles.jpg`, `p-honey-bundle.jpg`, `p-platinum-bundle.jpg`, `care-tools.jpg` | [18614262](https://www.pexels.com/photo/18614262/), [18614263](https://www.pexels.com/photo/18614263/), [18614268](https://www.pexels.com/photo/18614268/), [18614264](https://www.pexels.com/photo/18614264/) | Alina Skazka |
| `hero-soft-life.jpg`, `p-thandi.jpg`, `p-thandi-2.jpg` | [10375985](https://www.pexels.com/photo/10375985/), [10375983](https://www.pexels.com/photo/10375983/), [10375984](https://www.pexels.com/photo/10375984/) | RDNE Stock project |
| `p-naledi.jpg`, `p-naledi-2.jpg` | [2331545](https://www.pexels.com/photo/2331545/), [2331539](https://www.pexels.com/photo/2331539/) | Bestbe Models |
| `p-amahle.jpg` | [18775836](https://www.pexels.com/photo/18775836/) | Audu Samson |
| `p-lerato.jpg` | [20417302](https://www.pexels.com/photo/20417302/) | Sherman Trotz |
| `p-kinkystraight.jpg`, `p-afro.jpg` | [11515408](https://www.pexels.com/photo/11515408/), [4297233](https://www.pexels.com/photo/4297233/) | kehinde solomon o ogunsanya |

## Files

```
index.html            Homepage
design/brand-sheet.html  Brand and logo sheet (reference only)
assets/css/zante.css  Styles and design tokens (light and dark)
assets/js/strands.js  The live hair strand engine
assets/js/app.js      Page interactions, sample catalogue, bag, quiz, lab
assets/brand/         Logo SVGs, PNG exports and the original logo for comparison
assets/img/           Product and model photos (Pexels, free licence)
```

## Suggested next steps

1. Replace sample products, prices and policies with the real catalogue.
2. Replace the Pexels placeholders with Zante's own product and model shoot.
3. Move to a store platform (for example Shopify) and keep the strand engine as a custom section.
4. Run a trademark search on the new mark before final sign-off.
