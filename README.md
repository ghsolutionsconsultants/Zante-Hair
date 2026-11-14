# Zante Hair: homepage mock-up and logo system

A high-end, animation-rich homepage mock-up for **Zante Hair**, a South African women's hair brand selling virgin human hair bundles, HD lace closures and frontals, and glueless wigs. It also includes a redesigned logo system.

All product names, prices, policies and reviews are **sample content** for the mock-up.

## View it

| What | Where |
| --- | --- |
| Homepage | `index.html` |
| Brand and logo sheet | `brand.html` |
| Logo files (SVG) | `assets/brand/` |
| Logo files (PNG, high resolution) | `assets/brand/png/` |

Open `index.html` in any modern browser. No build step or server is needed.

To publish it on GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**, then pick this branch and `/ (root)`. The site will appear at `https://ghsolutionsconsultants.github.io/Zante-Hair/`.

## The big idea

Every hair visual on the page is **drawn live in code** by one strand engine (`assets/js/strands.js`). There are no stock photos. Hundreds of individual strands are rendered on a canvas, and they:

- **part when you run your cursor or finger through them**, then spring back
- **morph between textures** (Silk Straight, Body Wave, Deep Wave, Kinky Straight, Kinky Curly). Kinky Curly even shrinks like real coily hair
- **cross-fade between colours** (1B Natural Black, Zante Mauve, 27 Honey Blonde, 99J Burgundy, 613 Platinum)
- **draw the real product shape**: a wig on a crown with a middle part, a bundle on a weft band, a 5x5 lace closure, a 13x4 lace frontal, a headband wig
- **"Flip it"**: a button that throws the hair to one side so it swings and settles

## What is on the homepage

1. **Intro**: the logo draws itself strand by strand, a "Detangling 000–100%" counter runs, then the curtain parts and the hair falls into place.
2. **Hero try-on**: change the texture and colour of the hero wig live. A glass price card updates as you go.
3. **Texture marquee**: speeds up and skews with your scroll speed.
4. **Texture wall**: five expanding panels, each a live swatch.
5. **The edit**: product cards with 3D tilt, light glare, length selectors that change the price and the hair length, a wishlist heart burst, and a quick add that flies a pearl into the bag.
6. **Texture Lab**: build a custom unit (bundles, closure, frontal or glueless wig), with texture, colour, length (10–30") and density. An inch ruler, a bundle calculator ("You'll need 4 bundles for a full sew-in") and a price with Payflex split update live.
7. **HD lace melt**: drag a pearl to compare standard lace with HD lace across five skin tones.
8. **Find your match**: a three-tap quiz that scores the catalogue and returns a match percentage.
9. **Install diaries**: two review rows drifting in opposite directions.
10. **Care ritual**: a pinned section that scrolls sideways while a strand draws through the five steps.
11. **Soft Life Club**: email sign-up with a pearl burst.
12. **Footer**: a giant wordmark that draws itself.

Also: a custom pearl cursor with a silk trail, magnetic buttons, a mega menu with a live hair preview, an instant search overlay (press `/`), a bag drawer with a free-delivery progress bar, light and dark themes, and a hidden game. **Find 5 pearls on the page to unlock a code.**

It works on phones, respects "reduce motion" settings, and is keyboard accessible.

## The logo

The new mark keeps what people already know about Zante (the mauve, the glossy bubbles, the silk) and makes it work at every size:

- **Monogram**: three strands of hair form a Z. The diagonal is a body wave. The strands start at a pearl, taken from the bubbles in the original artwork.
- **Wordmark**: custom monoline capitals. The A carries a pearl crown and a body-wave crossbar.
- **Versions**: primary, reversed, one colour, stacked, monogram, and light and dark app icons.

See `brand.html` for the before and after, the anatomy, the palette, the type and the usage rules.

## Research that shaped it

- **Slie's Collection** (sliescollection.co.za) sells human hair half wigs and headband wigs, roughly R950 to R2,200.
- **Hair City** and **Hair Majesty** compete on fast delivery, free-delivery thresholds (R500 to R1,200) and pay-later options (PayJustNow, Payflex).
- **Luxy Hair** and **Bellami** win with tools: shade matching, quizzes and stylist chat.
- Most South African hair stores use standard store templates with static photos. Interactive tools are the gap Zante can own.

## Files

```
index.html            Homepage
brand.html            Brand and logo sheet
assets/css/zante.css  Styles and design tokens (light and dark)
assets/js/strands.js  The live hair strand engine
assets/js/app.js      Page interactions, sample catalogue, bag, quiz, lab
assets/brand/         Logo SVGs, PNG exports and the original logo for comparison
```

## Suggested next steps

1. Replace sample products, prices and policies with the real catalogue.
2. Add real model photography beside the live hair renders, for product pages.
3. Move to a store platform (for example Shopify) and keep the strand engine as a custom section.
4. Run a trademark search on the new mark before final sign-off.
