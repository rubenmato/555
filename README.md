# 555 STUDIO — streetwear design lab

A browser tool for designing your own clothing line: pick a silhouette, colour the
fabric, run an all-over print, place your artwork, choose how it's printed, then
export a mockup, a lookbook, or the tech pack you'd hand a factory — and put the
whole collection on a store page under your own brand name.

**No install, no build step, no internet needed.** Double-click `index.html`
(the studio) or `shop.html` (your store).

---

## The rack — 22 garments

| Tops | Outerwear | Bottoms | Headwear & extras |
| --- | --- | --- | --- |
| Boxy tee · Longsleeve | Track jacket · Coach jacket | Sweatpants · Jeans | Cap · Beanie |
| Football jersey · Crewneck | Denim jacket · Varsity | Cargo pants · Shorts | Bucket hat |
| Hoodie · Zip hoodie | Puffer · Flannel shirt | Mesh shorts | Tote · Socks |

Every garment has a front and a back view, drawn as vector artwork that recolours
properly — shading, seams, ribbed cuffs, kangaroo pockets, denim topstitching and
rivets all follow the colour you pick. Two-tone garments (varsity sleeves, track
stripes, jersey sleeves and collar, contrast ribbing) get a second colour of their own.

## Designing

**All-over prints** — camo, tie-dye, checkerboard, stripes, pinstripe, plaid, dots,
grid, monogram, wordmark (tiles your brand name), leopard, acid wash and fade. Set
the second ink, the repeat size, the angle and the strength.

**Placements** — the dashed guide follows real production placements: full front,
chest, small chest, full back, upper back, back neck, sleeve left/right, hem; thigh,
hip, leg and cuff on bottoms. Switching placement tells you the size in centimetres.

**Type** — 13 bundled typefaces (Anton, Archivo Black, Bebas, Bungee, Rubik Mono,
Teko, Oswald, Syne, Chakra Petch, Space Mono, two blackletters and a marker) with
size, tracking, leading, alignment, outline and an **arch** slider for curved hits.

**Graphics and artwork** — star, spark, burst, target, flame, bolt, skull, crown,
heart, smiley, eye, peace, globe, dollar, cross, arrow, barbed wire, plus basic
shapes. Or upload your own PNG/JPG/SVG — it's read in the browser and never uploaded
anywhere.

**Finishes** — screen print, puff, embroidery, foil and vinyl, per layer, plus a
distress slider that eats into the ink like a worn print.

**Scenes** — the backdrop behind the garment, carried into your exports: studio
sweep, noir, concrete, blueprint, spotlight, or a photo you upload. Technical flats
on the tech pack always stay on white.

**Presets** — eight one-click layouts (box logo, arch college, small chest tag,
gothic, flame hit, stack type, circle seal, big hit) that measure their own type and
fit themselves to the placement you're on.

## Output

| | |
| --- | --- |
| **EXPORT PNG** | 2200 × 2200 transparent mockup of the current garment |
| **SAVE** | keeps the piece in your collection (stored in this browser) |
| **EXPORT LOOKBOOK** | a contact sheet of the whole collection under your brand name |
| **TECH PACK** | A4 production sheet: front and back flats, colourway with hex codes, a placement table with real print sizes in cm, the typefaces used, size run and printer notes |
| **EXPORT / IMPORT .JSON** | move designs between browsers or machines |

## The store page

`shop.html` turns your saved collection into a storefront under your brand name:
a hero, a filterable product grid, and a product page with a front/back toggle,
size run, spec table and an auto-written description built from what's actually on
the garment ("Heavyweight hoodie. Camo all-over print. Puff artwork.").

Product names and prices are generated when you save a piece — "CAMO HOODIE",
"NO RULES 555 CARGO PANTS" — and you can edit both on the cards in **COLLECTION**.

### Selling for real

Paste a checkout link from your own payment provider (Stripe Payment Links, PayPal,
Gumroad — anything with a URL) into a product's **payment link** field in the
collection. That product's button becomes **BUY NOW** and hands off to that page,
and the store names the host it's sending you to.

Without a link the bag stays a local preview: it remembers what you added in your
browser and takes no payment, places no order and talks to no server. 555 STUDIO
never handles money or card details either way — your provider does.

### Sharing a lookbook

**COPY SHARE LINK** packs the whole collection into a `lookbook.html#…` URL —
compressed, no server, no account. Anyone who opens it sees your pieces rendered
from scratch in their own browser, with prices, descriptions and BUY buttons where
you've set a link. Uploaded artwork and photo backdrops are too heavy for a URL, so
they're left out of the link (the app tells you when that happens) — use
`EXPORT .JSON` for those.

Set your brand name at the top of the GARMENT panel — it runs through the wordmark
print, the lookbook and the tech pack.

## Working on the canvas

| Action | How |
| --- | --- |
| Move a layer | drag it (hold <kbd>Shift</kbd> to lock an axis) |
| Scale | drag a corner handle |
| Rotate | drag the round handle above the layer (<kbd>Shift</kbd> snaps to 15°) |
| Edit type | double-click it |
| Nudge | arrow keys (<kbd>Shift</kbd> = bigger steps) |
| Undo / redo | <kbd>⌘/Ctrl</kbd>+<kbd>Z</kbd> / <kbd>⌘/Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>Z</kbd> |
| Duplicate | <kbd>⌘/Ctrl</kbd>+<kbd>D</kbd> |
| Delete | <kbd>Delete</kbd> |
| Layer order | <kbd>[</kbd> and <kbd>]</kbd> |
| Save / export | <kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> / <kbd>⌘/Ctrl</kbd>+<kbd>E</kbd> |

Prints are clipped to the fabric, not to the guide box — you can design outside the
placement if you want it running off the edge.

## Running it

Double-click `index.html`, or serve the folder if you prefer:

```sh
npx http-server -p 8080 .      # then open http://localhost:8080
```

To put it online, upload the whole folder to any static host (GitHub Pages, Netlify,
Vercel) — there is no backend.

## How designs are stored

Your current design autosaves to this browser's `localStorage`, and the collection
keeps up to 24 saved pieces there too. **Designs live in the browser you made them
in** — clearing site data wipes them. Use `EXPORT .JSON` for anything you want to
keep or move.

## Project layout

```
index.html        markup + panels
css/app.css       interface styling, dark + light themes
css/fonts.css     self-hosted @font-face rules
js/util.js        colour maths, seeded noise, fabric + grunge + stitch textures
js/garments.js    garment blueprints — silhouettes, seams, ribs, placements, scale
js/graphics.js    vector graphics, shapes, font list
js/patterns.js    all-over prints
js/product.js     product names, prices, size runs, descriptions
js/templates.js   the one-click preset layouts
js/render.js      canvas renderer, finishes, hit-testing, export
js/sheets.js      lookbook and tech pack generators
js/app.js         state, history, interaction, panels, save/load
js/share.js       packs a collection into a shareable URL
js/shop.js        the store page
js/lookbook.js    the shareable lookbook page
shop.html         storefront   · css/shop.css its styling
lookbook.html     shared lookbook
assets/fonts/     bundled woff2 files
```

Garments are hand-authored paths in a 1000 × 1000 design space (`js/garments.js`).
Adding one means an entry with `body`, `shade`, `light`, `lines` and a `print`
rectangle per view — placements, colouring, patterns, texture, clipping and export
all pick it up automatically. `accent` paths take the contrast colour; `behind: n`
marks leading pieces (a hood) that sit behind the body.

## Fonts

The bundled typefaces are from Google Fonts under the SIL Open Font License 1.1 —
see `assets/fonts/OFL.txt`. They're included so the app works offline and prints
with the right type.
