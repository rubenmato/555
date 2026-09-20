# 555 STUDIO — streetwear design lab

A browser tool for designing your own clothes: tees, hoodies, crewnecks, sweatpants,
jeans, shorts and caps — front and back, any fabric colour, your own type and artwork
on top. Built for streetwear-style graphics (box logos, arched college type,
blackletter, distressed prints).

**No install, no build step, no internet needed.** Double-click `index.html`.

---

## What you can do

**Garments** — boxy tee · hoodie · crewneck · sweatpants · jeans · shorts · cap.
Each one has a front and a back view with its own print area, and takes any fabric
colour (12 presets per category plus a colour picker).

**Type** — 13 typefaces bundled with the app: Anton, Archivo Black, Bebas Neue,
Bungee, Rubik Mono, Teko, Oswald, Syne, Chakra Petch, Space Mono, two blackletter
faces and a marker. Control size, tracking, leading, alignment, ink, outline, and
**arch** (curve the type up over a chest hit or down under a seal).

**Graphics** — star, spark, burst, target, flame, bolt, skull, crown, heart, smiley,
eye, peace, globe, dollar, cross, arrow, barbed wire — plus basic shapes (box, frame,
dot, ring, triangle, bar, diamond, plus). All recolourable.

**Your own art** — `+ UPLOAD ART` drops in any PNG/JPG/SVG from your machine. Nothing
is uploaded anywhere; the file is read in the browser.

**Distress** — every layer has a distress slider that eats into the print like a
worn screen print.

**Presets** — eight one-click layouts (box logo, arch college, small chest tag,
gothic, flame hit, stack type, circle seal, big hit). They're starting points; edit
everything afterwards.

**Export** — `EXPORT PNG` writes a 2200 × 2200 transparent PNG of the mockup.
`SAVE` keeps a design in **MY DROPS** (stored in your browser). `EXPORT .JSON` /
`IMPORT .JSON` move designs between browsers or machines.

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

The dashed box is the **print area** — a realistic guide for what a printer can
actually put on that garment. You can design outside it; prints are clipped to the
fabric, not to the box.

## Running it

Double-click `index.html`, or serve the folder if you prefer:

```sh
npx http-server -p 8080 .      # then open http://localhost:8080
```

To put it online, upload the whole folder to any static host (GitHub Pages, Netlify,
Vercel) — there is no backend.

## How designs are stored

Your current design autosaves to this browser's `localStorage`, and MY DROPS keeps up
to 24 saved designs there too. That means **designs live in the browser you made them
in** — clearing site data wipes them. Use `EXPORT .JSON` for anything you want to
keep or move.

## Project layout

```
index.html        markup + panels
css/app.css       interface styling, dark + light themes
css/fonts.css     self-hosted @font-face rules
js/util.js        colour maths, seeded noise, fabric + grunge textures
js/garments.js    garment blueprints — every silhouette, seam, rib and print area
js/graphics.js    vector graphics, shapes, font list
js/templates.js   the one-click preset layouts
js/render.js      canvas renderer, hit-testing, export
js/app.js         state, history, interaction, panels, save/load
assets/fonts/     bundled woff2 files
```

Garments are hand-authored paths in a 1000 × 1000 design space (`js/garments.js`).
Adding one means adding an entry with `body`, `shade`, `light`, `lines` and a `print`
rectangle for each view — everything else (colouring, texture, clipping, export)
picks it up automatically.

## Fonts

The bundled typefaces are from Google Fonts under the SIL Open Font License 1.1 —
see `assets/fonts/OFL.txt`. They're included so the app works offline and prints
with the right type.
