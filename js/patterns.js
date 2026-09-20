/* 555 STUDIO — all-over prints.
   Tiling patterns render into a cached tile; `full` patterns paint the
   whole 1000-unit design space in one go (tie-dye, acid wash, gradients). */
(function (SD) {
  'use strict';

  const TILE = 256;
  const cache = {};

  function blob(ctx, x, y, r, rnd, wobble, squash) {
    const pts = 9;
    const sq = squash == null ? 0.78 : squash;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const rr = r * (1 - wobble / 2 + rnd() * wobble);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * sq;
      if (!i) ctx.moveTo(px, py);
      else {
        const pa = ((i - 0.5) / pts) * Math.PI * 2, pr = r * (1 + wobble * 0.5);
        ctx.quadraticCurveTo(x + Math.cos(pa) * pr, y + Math.sin(pa) * pr * sq, px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  /* draw something nine times so it wraps cleanly across tile edges */
  function wrapped(ctx, fn) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        ctx.save();
        ctx.translate(dx * TILE, dy * TILE);
        fn(ctx);
        ctx.restore();
      }
    }
  }

  SD.PATTERNS = {
    none: { name: 'None', tile: null },

    camo: {
      base: 0.55,
      name: 'Camo',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        /* base, two shades of itself, then a few smaller patches of the second ink */
        const tones = [
          { c: SD.shade(c1, SD.isDark(c1) ? 0.12 : -0.14), n: 7, r: 0.15 },
          { c: SD.shade(c1, SD.isDark(c1) ? 0.24 : -0.28), n: 6, r: 0.11 },
          { c: c2, n: 4, r: 0.075 }
        ];
        const rnd = SD.rng(41);
        tones.forEach(function (tone, ti) {
          ctx.fillStyle = tone.c;
          for (let i = 0; i < tone.n; i++) {
            const x = rnd() * TILE, y = rnd() * TILE, r = TILE * (tone.r * (0.7 + rnd() * 0.8));
            wrapped(ctx, function (c) { blob(c, x, y, r, SD.rng(((i + 1) * (ti + 3) * 77) | 0), 0.85, 0.95); });
          }
        });
      }
    },

    leopard: {
      base: 0.42,
      name: 'Leopard',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        const rnd = SD.rng(9);
        for (let i = 0; i < 16; i++) {
          const x = rnd() * TILE, y = rnd() * TILE, r = TILE * (0.05 + rnd() * 0.04);
          const seed = ((i + 1) * 131) | 0;
          ctx.fillStyle = c2;
          wrapped(ctx, function (c) { blob(c, x, y, r * 1.55, SD.rng(seed), 0.8, 0.9); });
          ctx.fillStyle = c1;
          wrapped(ctx, function (c) { blob(c, x, y, r, SD.rng(seed + 5), 0.7, 0.9); });
        }
      }
    },

    check: {
      base: 0.5,
      name: 'Check',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, TILE / 2, TILE / 2);
        ctx.fillRect(TILE / 2, TILE / 2, TILE / 2, TILE / 2);
      }
    },

    stripe: {
      base: 0.42,
      name: 'Stripe',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, TILE, TILE / 2);
      }
    },

    pinstripe: {
      base: 0.45,
      name: 'Pinstripe',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, TILE * 0.08, TILE);
      }
    },

    plaid: {
      base: 0.8,
      name: 'Plaid',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = c2;
        ctx.fillRect(0, 0, TILE, TILE * 0.34);
        ctx.fillRect(0, 0, TILE * 0.34, TILE);
        ctx.globalAlpha = 0.9;
        ctx.fillRect(TILE * 0.62, 0, TILE * 0.08, TILE);
        ctx.fillRect(0, TILE * 0.62, TILE, TILE * 0.08);
        ctx.globalAlpha = 1;
      }
    },

    dots: {
      base: 0.45,
      name: 'Dots',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = c2;
        [[0.25, 0.25], [0.75, 0.75]].forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p[0] * TILE, p[1] * TILE, TILE * 0.13, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    grid: {
      base: 0.4,
      name: 'Grid',
      tile: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.strokeStyle = c2;
        ctx.lineWidth = TILE * 0.045;
        ctx.strokeRect(0, 0, TILE, TILE);
      }
    },

    monogram: {
      base: 0.62,
      name: 'Monogram',
      tile: function (ctx, c1, c2, opt) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        const def = SD.GRAPHICS[opt.graphic || 'star'];
        const s = TILE * 0.36;
        [[0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75]].forEach(function (p, i) {
          ctx.save();
          ctx.translate(p[0] * TILE, p[1] * TILE);
          if (i % 2) ctx.rotate(Math.PI);
          ctx.scale(s / 100, s / 100);
          ctx.translate(-50, -50);
          def.paths.forEach(function (q) {
            ctx.fillStyle = ctx.strokeStyle = c2;
            ctx.lineWidth = q.w || 8;
            if (q.d) {
              const path = new Path2D(q.d);
              if (q.mode === 'stroke') ctx.stroke(path); else ctx.fill(path);
            } else {
              ctx.beginPath();
              ctx.arc(q.cx, q.cy, q.r, 0, Math.PI * 2);
              if (q.mode === 'stroke') ctx.stroke(); else ctx.fill();
            }
          });
          ctx.restore();
        });
      }
    },

    wordmark: {
      base: 0.55,
      name: 'Wordmark',
      tile: function (ctx, c1, c2, opt) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, TILE, TILE);
        const word = (opt.text || '555').toUpperCase();
        ctx.fillStyle = c2;
        ctx.font = Math.round(TILE * 0.2) + 'px ' + SD.fontCss(opt.font || 'archivo');
        ctx.textBaseline = 'middle';
        [[0.02, 0.25], [0.52, 0.75]].forEach(function (p) {
          ctx.fillText(word, p[0] * TILE, p[1] * TILE);
          ctx.fillText(word, p[0] * TILE - TILE, p[1] * TILE);
        });
      }
    },

    /* painted across the whole garment rather than tiled */
    tiedye: {
      name: 'Tie-dye',
      full: function (ctx, c1, c2) {
        const mid = SD.shade(c2, SD.isDark(c2) ? 0.18 : -0.18);
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, 1000, 1000);
        const rnd = SD.rng(23);
        for (let k = 0; k < 3; k++) {
          const cx = 250 + rnd() * 500, cy = 250 + rnd() * 500;
          for (let i = 11; i > 0; i--) {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, i * 46);
            const col = i % 2 ? c2 : mid;
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.72, SD.rgba(col, 0));
            g.addColorStop(0.86, SD.rgba(col, 0.75));
            g.addColorStop(1, SD.rgba(col, 0));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 1000, 1000);
          }
        }
      }
    },

    acid: {
      name: 'Acid wash',
      full: function (ctx, c1, c2) {
        ctx.fillStyle = c1;
        ctx.fillRect(0, 0, 1000, 1000);
        const rnd = SD.rng(5);
        ctx.fillStyle = c2;
        for (let i = 0; i < 220; i++) {
          ctx.globalAlpha = 0.04 + rnd() * 0.16;
          blob(ctx, rnd() * 1000, rnd() * 1000, 24 + rnd() * 70, SD.rng((i * 31) | 0), 0.8);
        }
        ctx.globalAlpha = 1;
      }
    },

    fade: {
      name: 'Fade',
      full: function (ctx, c1, c2) {
        const g = ctx.createLinearGradient(0, 120, 0, 900);
        g.addColorStop(0, c2);
        g.addColorStop(1, c1);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1000, 1000);
      }
    }
  };

  SD.PATTERN_ORDER = ['none', 'camo', 'tiedye', 'check', 'stripe', 'pinstripe', 'plaid',
    'dots', 'grid', 'monogram', 'wordmark', 'leopard', 'acid', 'fade'];

  /** cached canvas for a pattern (tile or full-size) */
  SD.patternCanvas = function (id, c1, c2, opt) {
    const def = SD.PATTERNS[id];
    if (!def || (!def.tile && !def.full)) return null;
    opt = opt || {};
    const key = [id, c1, c2, opt.graphic, opt.text, opt.font].join('|');
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    const size = def.full ? 1000 : TILE;
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    (def.full || def.tile)(ctx, c1, c2, opt);
    cache[key] = c;
    return c;
  };
  SD.PATTERN_TILE = TILE;
})(window.SD);
