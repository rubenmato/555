/* 555 STUDIO — one-click layouts. Each builder gets the current print area
   and a palette, and returns layer descriptors (defaults filled in by app.js). */
(function (SD) {
  'use strict';

  const T = (o) => o;

  SD.TEMPLATES = [
    {
      id: 'box',
      name: 'BOX LOGO',
      desc: 'red box · condensed word',
      build: function (r, p) {
        const cx = r.x + r.w / 2, cy = r.y + r.h * 0.3;
        const bw = Math.min(r.w * 0.94, 330), bh = bw * 0.33;
        return [
          T({ type: 'shape', gid: 'rect', w: bw, h: bh, x: cx, y: cy, color: '#e0180f' }),
          T({ type: 'text', text: 'YOUR BRAND', font: 'archivo', size: bh * 0.52, letter: -1.5, color: '#fbf7ef', x: cx, y: cy })
        ];
      }
    },
    {
      id: 'arch',
      name: 'ARCH COLLEGE',
      desc: 'curved top · big hit · est. line',
      build: function (r, p) {
        const cx = r.x + r.w / 2;
        return [
          T({ type: 'text', text: 'STREETWEAR', font: 'anton', size: r.w * 0.14, letter: 4, curve: 42, color: p.ink, x: cx, y: r.y + r.h * 0.17 }),
          T({ type: 'text', text: '555', font: 'archivo', size: r.w * 0.52, letter: -6, color: p.ink, strokeW: 0, x: cx, y: r.y + r.h * 0.46 }),
          T({ type: 'text', text: 'EST. 2026 — CITY LIMITS', font: 'mono', size: r.w * 0.062, letter: 2.4, color: p.ink, x: cx, y: r.y + r.h * 0.72 })
        ];
      }
    },
    {
      id: 'tag',
      name: 'SMALL CHEST TAG',
      desc: 'left chest · mono + star',
      build: function (r, p) {
        const k = Math.min(1, r.w / 230);
        const wide = r.w > 220;
        const cx = wide ? r.x + r.w * 0.3 : r.x + r.w * 0.5;
        const y = r.y + r.h * (wide ? 0.12 : 0.2);
        return [
          T({ type: 'graphic', gid: 'star', w: 42 * k, h: 42 * k, x: cx - 64 * k, y: y, color: p.hot }),
          T({ type: 'text', text: '555 STUDIO', font: 'mono', size: 30 * k, letter: 2 * k, color: p.ink, x: cx + 22 * k, y: y })
        ];
      }
    },
    {
      id: 'gothic',
      name: 'GOTHIC',
      desc: 'blackletter · mono strap',
      build: function (r, p) {
        const cx = r.x + r.w / 2;
        return [
          T({ type: 'text', text: 'Five Five Five', font: 'gothic', size: r.w * 0.2, letter: 0, color: p.ink, x: cx, y: r.y + r.h * 0.38 }),
          T({ type: 'text', text: 'MADE ON THE BLOCK', font: 'mono', size: r.w * 0.058, letter: 5, color: p.ink, x: cx, y: r.y + r.h * 0.62 })
        ];
      }
    },
    {
      id: 'flame',
      name: 'FLAME HIT',
      desc: 'graphic behind · type on top',
      build: function (r, p) {
        const cx = r.x + r.w / 2, cy = r.y + r.h * 0.44;
        return [
          T({ type: 'graphic', gid: 'flame', w: r.w * 0.96, h: r.w * 1.02, x: cx, y: cy - r.h * 0.02, color: p.hot, altColor: '#ffb200', distress: 0.15 }),
          T({ type: 'text', text: 'BURN\nSLOW', font: 'anton', size: r.w * 0.17, letter: 1, lineh: 0.94, color: '#fbf7ef', strokeW: 5, strokeColor: '#101012', x: cx, y: cy + r.h * 0.1 })
        ];
      }
    },
    {
      id: 'stack',
      name: 'STACK TYPE',
      desc: 'three tight lines, outlined',
      build: function (r, p) {
        const cx = r.x + r.w / 2;
        return [
          T({
            type: 'text', text: 'NO\nRULES\n555', font: 'archivo', size: r.w * 0.29, letter: -3, lineh: 0.86,
            color: p.behind, strokeW: 4, strokeColor: p.ink, x: cx, y: r.y + r.h * 0.44
          })
        ];
      }
    },
    {
      id: 'seal',
      name: 'CIRCLE SEAL',
      desc: 'ring · text around · star',
      build: function (r, p) {
        const cx = r.x + r.w / 2, cy = r.y + r.h * 0.42, d = Math.min(r.w, r.h) * 0.6;
        return [
          T({ type: 'shape', gid: 'ring', w: d, h: d, x: cx, y: cy, color: p.ink }),
          T({ type: 'graphic', gid: 'star', w: d * 0.44, h: d * 0.44, x: cx, y: cy, color: p.ink }),
          T({ type: 'text', text: 'WORLDWIDE', font: 'oswald', size: d * 0.15, letter: 3, curve: 52, color: p.ink, x: cx, y: cy - d * 0.66 }),
          T({ type: 'text', text: 'SINCE 555', font: 'oswald', size: d * 0.13, letter: 3, curve: -50, color: p.ink, x: cx, y: cy + d * 0.66 })
        ];
      }
    },
    {
      id: 'bighit',
      name: 'BIG HIT',
      desc: 'one word, edge to edge, distressed',
      build: function (r, p) {
        const cx = r.x + r.w / 2;
        return [
          T({ type: 'text', text: 'STATIC', font: 'bungee', size: r.w * 0.24, letter: -2, color: p.ink, distress: 0.28, x: cx, y: r.y + r.h * 0.44 }),
          T({ type: 'graphic', gid: 'wire', w: r.w * 0.9, h: r.w * 0.34, x: cx, y: r.y + r.h * 0.72, color: p.ink, distress: 0.2 })
        ];
      }
    }
  ];
})(window.SD);
