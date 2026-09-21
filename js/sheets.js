/* 555 STUDIO — printable sheets: the lookbook and the production tech pack. */
(function (SD) {
  'use strict';

  const S = {};
  SD.Sheets = S;
  const MONO = '"Space Mono", monospace';
  const HEAVY = '"Archivo Black", Arial Black, sans-serif';

  function text(ctx, str, x, y, size, font, color, align, spacing) {
    ctx.save();
    ctx.font = size + 'px ' + (font || MONO);
    ctx.fillStyle = color || '#111112';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx && spacing) ctx.letterSpacing = spacing + 'px';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  function rule(ctx, x1, y, x2, color, w) {
    ctx.strokeStyle = color || '#c9c9c4';
    ctx.lineWidth = w || 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y); ctx.lineTo(x2, y);
    ctx.stroke();
  }

  function swatch(ctx, x, y, size, color, label) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#111112';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, size, size);
    text(ctx, label, x, y + size + 22, 15, MONO, '#40403c');
    text(ctx, String(color).toUpperCase(), x, y + size + 42, 15, MONO, '#90908a');
  }

  function flat(state, view, px) {
    const s = JSON.parse(JSON.stringify(state));
    s.view = view;
    s.printArea = false;
    s.shadow = false;
    return SD.Render.exportCanvas(s, px || 900, { noScene: true });
  }

  /* ── tech pack ─────────────────────────────────────────────────────
     A4 at 200dpi. Flats front and back, the colourway, and a placement
     table with real print sizes — what you'd actually send a factory. */
  S.techPack = function (state) {
    const W = 1654, H = 2339;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const M = 90;
    const g = SD.GARMENTS[state.garment];
    const cmPer = (SD.GARMENT_CM[state.garment] || 120) / 1000;
    const today = new Date().toISOString().slice(0, 10);

    /* header */
    text(ctx, (state.brand || '555 STUDIO').toUpperCase(), M, M + 54, 54, HEAVY, '#111112', 'left', 1);
    text(ctx, 'TECH PACK', W - M, M + 54, 30, MONO, '#111112', 'right', 4);
    rule(ctx, M, M + 82, W - M, '#111112', 3);

    const rows = [
      ['STYLE', g.name.toUpperCase()],
      ['DATE', today],
      ['FABRIC', String(state.color).toUpperCase()],
      ['ALL-OVER', state.pattern && state.pattern.id !== 'none' ? SD.PATTERNS[state.pattern.id].name.toUpperCase() : 'NONE']
    ];
    rows.forEach(function (r, i) {
      const x = M + (i % 2) * ((W - M * 2) / 2);
      const y = M + 130 + Math.floor(i / 2) * 36;
      text(ctx, r[0], x, y, 16, MONO, '#90908a', 'left', 2);
      text(ctx, r[1], x + 150, y, 16, MONO, '#111112', 'left', 1);
    });

    /* flats */
    const flatW = (W - M * 2 - 40) / 2;
    ['front', 'back'].forEach(function (view, i) {
      const x = M + i * (flatW + 40), y = M + 230;
      ctx.fillStyle = '#f4f4f1';
      ctx.fillRect(x, y, flatW, flatW);
      ctx.strokeStyle = '#dcdcd6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, flatW, flatW);
      ctx.drawImage(flat(state, view, 1000), x, y, flatW, flatW);
      text(ctx, view.toUpperCase(), x + 6, y + flatW + 26, 16, MONO, '#40403c', 'left', 3);
    });

    /* colourway */
    let y = M + 230 + flatW + 90;
    text(ctx, 'COLOURWAY', M, y, 20, MONO, '#111112', 'left', 4);
    rule(ctx, M, y + 16, W - M);
    y += 56;
    const chips = [[state.color, 'FABRIC']];
    const hasAccent = ['front', 'back'].some(function (v) { return (g.views[v].accent || []).length; });
    if (hasAccent) chips.push([SD.accentFor(state), 'CONTRAST']);
    if (state.pattern && state.pattern.id !== 'none') chips.push([state.pattern.color, 'ALL-OVER']);
    const inks = {};
    ['front', 'back'].forEach(function (v) {
      (state.layers[v] || []).forEach(function (L) {
        if (L.color) inks[L.color] = true;
        if (L.strokeW && L.strokeColor) inks[L.strokeColor] = true;
      });
    });
    Object.keys(inks).slice(0, 6).forEach(function (k, i) { chips.push([k, 'INK ' + (i + 1)]); });
    chips.forEach(function (ch, i) { swatch(ctx, M + i * 150, y, 96, ch[0], ch[1]); });

    /* placements */
    y += 210;
    text(ctx, 'PRINT PLACEMENTS', M, y, 20, MONO, '#111112', 'left', 4);
    rule(ctx, M, y + 16, W - M);
    y += 50;
    const cols = [M, M + 120, M + 620, M + 940, M + 1180];
    ['VIEW', 'ARTWORK', 'SIZE', 'FINISH', 'ROT'].forEach(function (h, i) {
      text(ctx, h, cols[i], y, 15, MONO, '#90908a', 'left', 2);
    });
    y += 12;
    rule(ctx, M, y, W - M);
    y += 32;

    let count = 0;
    ['front', 'back'].forEach(function (v) {
      (state.layers[v] || []).forEach(function (L) {
        if (count >= 22) return;
        const b = SD.Render.bbox(L);
        const name = L.type === 'text' ? '"' + String(L.text).split('\n').join(' / ').slice(0, 30) + '"'
          : L.type === 'image' ? 'UPLOADED ARTWORK'
            : ((L.type === 'shape' ? SD.SHAPES : SD.GRAPHICS)[L.gid] || {}).name || L.type;
        text(ctx, v.toUpperCase(), cols[0], y, 16, MONO, '#40403c');
        text(ctx, name.toUpperCase(), cols[1], y, 16, MONO, '#111112');
        text(ctx, SD.round(b.w * cmPer, 1) + ' × ' + SD.round(b.h * cmPer, 1) + ' cm', cols[2], y, 16, MONO, '#111112');
        text(ctx, (L.finish || 'print').toUpperCase(), cols[3], y, 16, MONO, '#111112');
        text(ctx, Math.round(L.rot || 0) + '°', cols[4], y, 16, MONO, '#111112');
        y += 34;
        count++;
      });
    });
    if (!count) text(ctx, 'NO ARTWORK PLACED', cols[0], y, 16, MONO, '#90908a');

    /* type used */
    const fonts = {};
    ['front', 'back'].forEach(function (v) {
      (state.layers[v] || []).forEach(function (L) { if (L.type === 'text') fonts[L.font] = true; });
    });
    const used = Object.keys(fonts);
    if (used.length) {
      y += 48;
      text(ctx, 'TYPEFACES', M, y, 20, MONO, '#111112', 'left', 4);
      rule(ctx, M, y + 16, W - M);
      y += 52;
      used.forEach(function (f) {
        const def = SD.FONTS.filter((x) => x.id === f)[0];
        if (!def) return;
        text(ctx, def.label, M, y, 30, def.css, '#111112');
        text(ctx, 'ABCDEFGHIJKLM 0123456789', M + 420, y, 26, def.css, '#70706a');
        y += 44;
      });
    }

    /* size run */
    y += 56;
    text(ctx, 'SIZE RUN', M, y, 20, MONO, '#111112', 'left', 4);
    rule(ctx, M, y + 16, W - M);
    y += 52;
    const sizes = g.kind === 'head' ? ['ONE SIZE'] :
      g.kind === 'bag' ? ['ONE SIZE'] :
        g.kind === 'bottom' ? ['28', '30', '32', '34', '36'] : ['S', 'M', 'L', 'XL', 'XXL'];
    sizes.forEach(function (sz, i) {
      const x = M + i * 120;
      ctx.strokeStyle = '#111112';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y - 26, sizes.length === 1 ? 200 : 96, 44);
      text(ctx, sz, x + (sizes.length === 1 ? 100 : 48), y + 4, 20, MONO, '#111112', 'center', 2);
    });

    /* notes */
    y += 90;
    text(ctx, 'NOTES', M, y, 20, MONO, '#111112', 'left', 4);
    rule(ctx, M, y + 16, W - M);
    y += 46;
    [
      'Artwork supplied as vector or 300dpi PNG on transparent background.',
      'Confirm ink colours against physical Pantone references before the run.',
      'All-over prints: match repeat across panels and side seams.',
      'Puff and embroidery add 2–3mm relief — allow for it on the placement.'
    ].forEach(function (line) {
      text(ctx, '— ' + line, M, y, 16, MONO, '#40403c');
      y += 28;
    });

    /* footer */
    text(ctx, 'GENERATED IN 555 STUDIO · MEASUREMENTS ARE APPROXIMATE, CONFIRM WITH YOUR PRINTER',
      M, H - M, 14, MONO, '#90908a', 'left', 1);
    return c;
  };

  /* ── lookbook ──────────────────────────────────────────────────────
     A contact sheet of everything saved in the collection. */
  S.lookbook = function (drops, brand) {
    const cols = drops.length <= 2 ? drops.length || 1 : drops.length <= 6 ? 3 : 4;
    const cell = 520, pad = 34, M = 80;
    const rowsN = Math.ceil(drops.length / cols) || 1;
    const W = M * 2 + cols * cell + (cols - 1) * pad;
    const H = M + 190 + rowsN * (cell + 86) + M;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, W, H);

    text(ctx, (brand || '555 STUDIO').toUpperCase(), M, M + 78, 78, HEAVY, '#f5f5f6', 'left', 1);
    text(ctx, 'LOOKBOOK · ' + drops.length + ' PIECE' + (drops.length === 1 ? '' : 'S') + ' · ' +
      new Date().getFullYear(), M, M + 122, 20, MONO, '#d6ff3f', 'left', 5);
    rule(ctx, M, M + 156, W - M, '#26262b', 2);

    drops.forEach(function (d, i) {
      const cx = M + (i % cols) * (cell + pad);
      const cy = M + 190 + Math.floor(i / cols) * (cell + 86);
      ctx.fillStyle = '#17171a';
      ctx.fillRect(cx, cy, cell, cell);
      const st = d.design;
      if (st) {
        const copy = JSON.parse(JSON.stringify(st));
        const front = (copy.layers && copy.layers.front) || [];
        const back = (copy.layers && copy.layers.back) || [];
        copy.view = (!front.length && back.length) ? 'back' : 'front';
        copy.printArea = false;
        copy.shadow = true;
        copy.texture = true;
        ctx.drawImage(SD.Render.exportCanvas(copy, 900), cx, cy, cell, cell);
      } else if (d.thumb) {
        const im = SD.Render.image(d.thumb);
        if (im._ok) ctx.drawImage(im, cx, cy, cell, cell);
      }
      const g = st && SD.GARMENTS[st.garment];
      text(ctx, String(i + 1).padStart(2, '0'), cx, cy + cell + 34, 18, MONO, '#d6ff3f', 'left', 2);
      text(ctx, (g ? g.name : d.name || '').toUpperCase(), cx + 46, cy + cell + 34, 18, MONO, '#f5f5f6', 'left', 2);
      if (st) text(ctx, String(st.color).toUpperCase(), cx + 46, cy + cell + 58, 15, MONO, '#8c8c96', 'left', 1);
    });
    return c;
  };
})(window.SD);
