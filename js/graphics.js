/* 555 STUDIO — vector graphics + shapes, authored in a 100 x 100 box */
(function (SD) {
  'use strict';

  /* procedural starburst */
  function burst(points, r1, r2) {
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? r2 : r1;
      d += (i ? 'L ' : 'M ') + SD.round(50 + Math.cos(a) * r, 2) + ' ' + SD.round(50 + Math.sin(a) * r, 2) + ' ';
    }
    return d + 'Z';
  }

  const f = (d) => ({ d: d, mode: 'fill' });
  const s = (d, w) => ({ d: d, mode: 'stroke', w: w || 8 });
  const fa = (d) => ({ d: d, mode: 'fill', tone: 'alt' });
  const sa = (d, w) => ({ d: d, mode: 'stroke', w: w || 8, tone: 'alt' });
  const c = (cx, cy, r, tone) => ({ cx: cx, cy: cy, r: r, mode: 'fill', tone: tone });
  const cs = (cx, cy, r, w, tone) => ({ cx: cx, cy: cy, r: r, mode: 'stroke', w: w || 8, tone: tone });

  SD.GRAPHICS = {
    star: { name: 'Star', paths: [f('M50 3 L61.8 35.4 L96 36.5 L69 57.4 L78.5 90.5 L50 71.2 L21.5 90.5 L31 57.4 L4 36.5 L38.2 35.4 Z')] },
    spark: { name: 'Spark', paths: [f('M50 0 C55 30 70 45 100 50 C70 55 55 70 50 100 C45 70 30 55 0 50 C30 45 45 30 50 0 Z')] },
    burst: { name: 'Burst', paths: [f(burst(14, 48, 30))] },
    target: { name: 'Target', paths: [cs(50, 50, 45, 9), cs(50, 50, 30, 9), c(50, 50, 13)] },
    flame: {
      name: 'Flame',
      paths: [f('M50 2 C58 24 78 32 78 56 C78 80 64 98 50 98 C36 98 20 84 20 62 C20 46 30 42 36 28 C40 42 46 46 50 36 C53 28 51 14 50 2 Z'),
        fa('M50 46 C56 57 63 63 63 73 C63 85 57 93 50 93 C43 93 37 85 37 73 C37 62 45 57 50 46 Z')]
    },
    bolt: { name: 'Bolt', paths: [f('M60 2 L18 56 L44 56 L36 98 L82 40 L54 40 Z')] },
    skull: {
      name: 'Skull',
      paths: [f('M50 4 C24 4 11 22 11 44 C11 57 17 66 24 71 L24 82 C24 90 32 96 42 96 L58 96 C68 96 76 90 76 82 L76 71 C83 66 89 57 89 44 C89 22 76 4 50 4 Z'),
        c(35, 44, 10, 'alt'), c(65, 44, 10, 'alt'), fa('M50 56 L43 71 L57 71 Z'),
        sa('M38 80 L38 96', 5), sa('M50 80 L50 96', 5), sa('M62 80 L62 96', 5)]
    },
    crown: { name: 'Crown', paths: [f('M4 90 L13 20 L32 46 L50 8 L68 46 L87 20 L96 90 Z')] },
    heart: { name: 'Heart', paths: [f('M50 94 C18 72 4 52 4 34 C4 18 16 7 30 7 C39 7 46 12 50 21 C54 12 61 7 70 7 C84 7 96 18 96 34 C96 52 82 72 50 94 Z')] },
    smiley: { name: 'Smiley', paths: [c(50, 50, 47), c(36, 39, 7, 'alt'), c(64, 39, 7, 'alt'), sa('M28 60 C37 78 63 78 72 60', 9)] },
    eye: {
      name: 'Eye',
      paths: [f('M50 20 C76 20 93 40 99 50 C93 60 76 80 50 80 C24 80 7 60 1 50 C7 40 24 20 50 20 Z'),
        c(50, 50, 17, 'alt')]
    },
    peace: { name: 'Peace', paths: [cs(50, 50, 45, 9), s('M50 6 L50 94', 9), s('M50 50 L21 79', 9), s('M50 50 L79 79', 9)] },
    globe: { name: 'Globe', paths: [cs(50, 50, 45, 9), s('M50 5 C30 24 30 76 50 95', 7), s('M50 5 C70 24 70 76 50 95', 7), s('M6 50 L94 50', 7)] },
    dollar: { name: 'Dollar', paths: [s('M72 26 C64 12 36 10 32 26 C28 42 68 44 72 62 C76 80 44 88 30 74', 11), s('M50 4 L50 96', 9)] },
    cross: { name: 'Cross', paths: [f('M42 4 L58 4 L58 30 L84 30 L84 46 L58 46 L58 96 L42 96 L42 46 L16 46 L16 30 L42 30 Z')] },
    arrow: { name: 'Arrow', paths: [f('M50 2 L92 46 L68 46 L68 96 L32 96 L32 46 L8 46 Z')] },
    wire: {
      name: 'Barbed',
      paths: [s('M0 50 C20 38 32 62 50 50 C68 38 80 62 100 50', 5),
        s('M14 34 L26 58', 4), s('M26 34 L14 58', 4), s('M62 34 L74 58', 4), s('M74 34 L62 58', 4)]
    }
  };

  SD.SHAPES = {
    rect: { name: 'Box', paths: [{ d: 'M6 22 L94 22 L94 78 L6 78 Z', mode: 'fill' }] },
    frame: { name: 'Frame', paths: [{ d: 'M10 24 L90 24 L90 76 L10 76 Z', mode: 'stroke', w: 5 }] },
    circle: { name: 'Dot', paths: [{ cx: 50, cy: 50, r: 46, mode: 'fill' }] },
    ring: { name: 'Ring', paths: [{ cx: 50, cy: 50, r: 43, mode: 'stroke', w: 5 }] },
    tri: { name: 'Tri', paths: [{ d: 'M50 8 L94 90 L6 90 Z', mode: 'fill' }] },
    bar: { name: 'Bar', paths: [{ d: 'M2 40 L98 40 L98 60 L2 60 Z', mode: 'fill' }] },
    diamond: { name: 'Diamond', paths: [{ d: 'M50 4 L96 50 L50 96 L4 50 Z', mode: 'fill' }] },
    plus: { name: 'Plus', paths: [{ d: 'M40 6 L60 6 L60 40 L94 40 L94 60 L60 60 L60 94 L40 94 L40 60 L6 60 L6 40 L40 40 Z', mode: 'fill' }] }
  };

  /* svg markup for palette buttons + layer thumbs */
  SD.graphicSvg = function (def) {
    let inner = '';
    def.paths.forEach((p) => {
      const stroke = p.mode === 'stroke';
      const common = 'fill="' + (stroke ? 'none' : 'currentColor') + '" stroke="' + (stroke ? 'currentColor' : 'none') +
        '" stroke-width="' + (p.w || 8) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (p.tone === 'alt' ? '.55' : '1') + '"';
      inner += p.d ? '<path d="' + p.d + '" ' + common + '/>'
        : '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="' + p.r + '" ' + common + '/>';
    });
    return '<svg viewBox="-4 -4 108 108" aria-hidden="true">' + inner + '</svg>';
  };

  /* fonts offered to the type tool */
  SD.FONTS = [
    { id: 'anton', label: 'Anton', css: '"Anton", Impact, sans-serif' },
    { id: 'archivo', label: 'Archivo Black', css: '"Archivo Black", Arial Black, sans-serif' },
    { id: 'bebas', label: 'Bebas Neue', css: '"Bebas Neue", Impact, sans-serif' },
    { id: 'bungee', label: 'Bungee', css: '"Bungee", Impact, sans-serif' },
    { id: 'rubik', label: 'Rubik Mono', css: '"Rubik Mono One", monospace' },
    { id: 'teko', label: 'Teko', css: '"Teko", Impact, sans-serif' },
    { id: 'oswald', label: 'Oswald', css: '"Oswald", Impact, sans-serif' },
    { id: 'syne', label: 'Syne', css: '"Syne", sans-serif' },
    { id: 'chakra', label: 'Chakra Petch', css: '"Chakra Petch", sans-serif' },
    { id: 'mono', label: 'Space Mono', css: '"Space Mono", monospace' },
    { id: 'gothic', label: 'Blackletter', css: '"UnifrakturCook", "Pirata One", serif' },
    { id: 'pirata', label: 'Pirata One', css: '"Pirata One", serif' },
    { id: 'marker', label: 'Marker', css: '"Permanent Marker", cursive' }
  ];
  SD.fontCss = function (id) {
    for (let i = 0; i < SD.FONTS.length; i++) if (SD.FONTS[i].id === id) return SD.FONTS[i].css;
    return SD.FONTS[0].css;
  };
})(window.SD);
