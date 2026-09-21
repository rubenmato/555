/* 555 STUDIO — canvas renderer.
   The design space is 1000 x 1000; the canvas transform maps it to device pixels. */
(function (SD) {
  'use strict';

  const R = {};
  SD.Render = R;
  const SPACE = 1000;
  R.SPACE = SPACE;

  /* ── caches ── */
  const pathCache = {};
  function P(d) { return pathCache[d] || (pathCache[d] = new Path2D(d)); }

  const silCache = {};
  function silhouette(gid, view) {
    const k = gid + ':' + view;
    if (silCache[k]) return silCache[k];
    const p = new Path2D();
    SD.GARMENTS[gid].views[view].body.forEach((d) => p.addPath(P(d)));
    return (silCache[k] = p);
  }

  const imgCache = {};
  R.image = function (src, onload) {
    if (imgCache[src]) return imgCache[src];
    const im = new Image();
    im.onload = function () { im._ok = true; if (onload) onload(); };
    im.onerror = function () { im._bad = true; };
    im.src = src;
    imgCache[src] = im;
    return im;
  };

  let measureCtx = null;
  function mctx() {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    return measureCtx;
  }

  const scratches = [];
  /** a cleared scratch canvas of the given size (reused between frames) */
  function scratch(i, w, h) {
    if (!scratches[i]) scratches[i] = document.createElement('canvas');
    const cv = scratches[i];
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    return c;
  }
  function scratchCanvas(i) { return scratches[i]; }

  /* ── type metrics ── */
  function fontString(L) { return Math.max(4, L.size) + 'px ' + SD.fontCss(L.font); }
  function lines(L) { return String(L.text == null ? '' : L.text).split('\n'); }

  function applySpacing(ctx, L) {
    if ('letterSpacing' in ctx) { ctx.letterSpacing = (L.letter || 0) + 'px'; return true; }
    return false;
  }
  function measureLine(ctx, str, L, native) {
    let w = ctx.measureText(str).width;
    if (!native) w += (L.letter || 0) * Math.max(0, str.length - 1);
    return w;
  }

  R.textMetrics = function (L) {
    const ctx = mctx();
    ctx.save();
    ctx.font = fontString(L);
    const native = applySpacing(ctx, L);
    const ls = lines(L);
    let w = 0;
    ls.forEach((s) => { w = Math.max(w, measureLine(ctx, s || ' ', L, native)); });
    ctx.restore();
    const lh = L.size * (L.lineh == null ? 1.02 : L.lineh);
    return { w: w, h: lh * (ls.length - 1) + L.size * 0.98, lh: lh, count: ls.length, native: native };
  };

  /** bounding box (design units, un-rotated) centred on the layer origin */
  R.bbox = function (L) {
    if (L.type === 'text') {
      const m = R.textMetrics(L);
      const pad = (L.strokeW || 0);
      let w = m.w + pad * 2, h = m.h + pad * 2;
      if (L.curve) { const s = 1 + Math.abs(L.curve) / 110; w *= s; h += m.w * Math.abs(L.curve) / 620; }
      return { w: Math.max(w, 10), h: Math.max(h, 10) };
    }
    return { w: L.w, h: L.h };
  };

  /* ── layer drawing ── */
  function drawGlyphRun(ctx, str, L, x, y, native) {
    // x,y = left baseline
    if (native) {
      if (L.strokeW) ctx.strokeText(str, x, y);
      ctx.fillText(str, x, y);
      return;
    }
    let cx = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (L.strokeW) ctx.strokeText(ch, cx, y);
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + (L.letter || 0);
    }
  }

  function drawText(ctx, L) {
    const m = R.textMetrics(L);
    ctx.font = fontString(L);
    const native = applySpacing(ctx, L);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = L.color;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (L.strokeW) { ctx.strokeStyle = L.strokeColor || '#000'; ctx.lineWidth = L.strokeW * 2; }

    const ls = lines(L);
    const curve = L.curve || 0;

    if (!curve) {
      const top = -m.h / 2 + L.size * 0.78;
      ls.forEach((str, i) => {
        const lw = measureLine(ctx, str, L, native);
        let x = -lw / 2;
        if (L.align === 'left') x = -m.w / 2;
        else if (L.align === 'right') x = m.w / 2 - lw;
        drawGlyphRun(ctx, str, L, x, top + i * m.lh, native);
      });
      return;
    }

    // arched type: lay each line on a circle
    const dir = curve > 0 ? 1 : -1;
    ls.forEach((str, i) => {
      const lw = measureLine(ctx, str, L, native) || 1;
      const radius = (lw * 120) / (Math.abs(curve) * Math.PI) + L.size * 0.2;
      const total = lw / radius;                       // arc swept, radians
      const rr = radius + (dir > 0 ? -i * m.lh : i * m.lh);
      ctx.save();
      ctx.translate(0, dir > 0 ? rr - m.h / 2 + L.size * 0.5 : -rr + m.h / 2 - L.size * 0.5);
      let a = -total / 2;
      for (let k = 0; k < str.length; k++) {
        const ch = str[k];
        const cw = ctx.measureText(ch).width + (L.letter || 0);
        const step = cw / rr;
        ctx.save();
        /* up-arch: centre below the type · down-arch: centre above it — letters stay upright */
        ctx.rotate((a + step / 2) * dir);
        ctx.translate(0, -rr * dir);
        if (L.strokeW) ctx.strokeText(ch, -cw / 2, 0);
        ctx.fillText(ch, -cw / 2, 0);
        ctx.restore();
        a += step;
      }
      ctx.restore();
    });
  }

  function drawVector(ctx, L) {
    const def = (L.type === 'shape' ? SD.SHAPES : SD.GRAPHICS)[L.gid];
    if (!def) return;
    ctx.save();
    ctx.translate(-L.w / 2, -L.h / 2);
    ctx.scale(L.w / 100, L.h / 100);
    const uni = Math.max(0.04, (L.w / 100 + L.h / 100) / 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    def.paths.forEach((p) => {
      const col = p.tone === 'alt' ? (L.altColor || L.color) : L.color;
      if (p.mode === 'stroke') {
        ctx.strokeStyle = col;
        /* keep stroke weight even when the shape is scaled unevenly */
        ctx.lineWidth = (p.w || 8) * uni / Math.max(0.04, L.w / 100);
      }
      else ctx.fillStyle = col;
      if (p.d) {
        const path = P(p.d);
        if (p.mode === 'stroke') ctx.stroke(path); else ctx.fill(path);
      } else {
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
        if (p.mode === 'stroke') ctx.stroke(); else ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawImageLayer(ctx, L, onload) {
    const im = R.image(L.src, onload);
    if (!im._ok) return;
    ctx.drawImage(im, -L.w / 2, -L.h / 2, L.w, L.h);
  }

  function drawLayerRaw(ctx, L, onload) {
    ctx.save();
    ctx.translate(L.x, L.y);
    if (L.rot) ctx.rotate(SD.rad(L.rot));
    if (L.flipX) ctx.scale(-1, 1);
    ctx.globalAlpha = L.opacity == null ? 1 : L.opacity;
    if (L.type === 'text') drawText(ctx, L);
    else if (L.type === 'image') drawImageLayer(ctx, L, onload);
    else drawVector(ctx, L);
    ctx.restore();
  }

  /** flat silhouette of whatever is on `src`, filled with `color` */
  function tinted(src, color, W, H) {
    const t = scratch(1, W, H);
    t.drawImage(src, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = color;
    t.fillRect(0, 0, W, H);
    t.globalCompositeOperation = 'source-over';
    return scratchCanvas(1);
  }

  /** how the ink sits on the fabric: screen print, puff, embroidery, foil, vinyl */
  function applyFinish(ctx, layerCanvas, L, env) {
    const W = env.pxW, H = env.pxH, k = env.res;
    const finish = L.finish || 'print';

    if (finish === 'puff' || finish === 'embroidery') {
      const depth = finish === 'puff' ? 8 : 2.6;
      const dark = tinted(layerCanvas, 'rgba(0,0,0,.55)', W, H);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'blur(' + Math.max(1, 2.2 * k) + 'px)';
      ctx.globalAlpha = finish === 'puff' ? 0.85 : 0.6;
      ctx.drawImage(dark, depth * k * 0.6, depth * k);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* the layer itself */
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();

    if (finish === 'puff') {
      const lite = tinted(layerCanvas, 'rgba(255,255,255,.5)', W, H);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.filter = 'blur(' + Math.max(1, 2.6 * k) + 'px)';
      ctx.globalAlpha = 0.5;
      ctx.drawImage(lite, -2.4 * k, -3.2 * k);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    if (finish === 'embroidery' || finish === 'foil' || finish === 'vinyl') {
      const t = scratch(2, W, H);
      t.drawImage(layerCanvas, 0, 0);
      t.globalCompositeOperation = 'source-atop';
      if (finish === 'embroidery') {
        const st = SD.stitchTexture();
        const pat = t.createPattern(st, 'repeat');
        if (pat && pat.setTransform) {
          const m = new DOMMatrix();
          pat.setTransform(m.rotate(38).scale(Math.max(0.6, k * 0.9)));
        }
        t.fillStyle = pat;
        t.fillRect(0, 0, W, H);
      } else {
        const g = t.createLinearGradient(0, 0, W * 0.7, H);
        if (finish === 'foil') {
          g.addColorStop(0, 'rgba(255,255,255,.9)');
          g.addColorStop(0.16, 'rgba(0,0,0,.42)');
          g.addColorStop(0.34, 'rgba(255,255,255,.8)');
          g.addColorStop(0.52, 'rgba(0,0,0,.5)');
          g.addColorStop(0.7, 'rgba(255,255,255,.92)');
          g.addColorStop(0.86, 'rgba(0,0,0,.36)');
          g.addColorStop(1, 'rgba(255,255,255,.7)');
        } else {
          g.addColorStop(0, 'rgba(255,255,255,.34)');
          g.addColorStop(0.42, 'rgba(255,255,255,0)');
          g.addColorStop(1, 'rgba(0,0,0,.14)');
        }
        t.fillStyle = g;
        t.fillRect(0, 0, W, H);
      }
      t.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(scratchCanvas(2), 0, 0);
      ctx.restore();
    }
  }

  /** draw one layer; distress and non-flat finishes route through a scratch canvas */
  function drawLayer(ctx, L, env) {
    if (L.hidden) return;
    const distress = L.distress || 0;
    const finish = L.finish || 'print';
    if (distress <= 0 && finish === 'print') { drawLayerRaw(ctx, L, env.onload); return; }

    const W = env.pxW, H = env.pxH;
    const t = scratch(0, W, H);
    t.setTransform(env.res, 0, 0, env.res, 0, 0);
    drawLayerRaw(t, L, env.onload);
    t.setTransform(1, 0, 0, 1, 0, 0);

    if (distress > 0) {
      t.globalCompositeOperation = 'destination-out';
      const g = SD.grungeTexture();
      const seed = SD.rng((L.seed || 1) * 977);
      const scale = 1.1 + seed() * 0.9;
      t.globalAlpha = SD.clamp(distress * 1.05, 0, 1);
      for (let oy = -1; oy < Math.ceil(H / (g.height * scale)) + 1; oy++) {
        for (let ox = -1; ox < Math.ceil(W / (g.width * scale)) + 1; ox++) {
          t.drawImage(g, ox * g.width * scale + seed() * 40, oy * g.height * scale + seed() * 40,
            g.width * scale, g.height * scale);
        }
      }
      t.globalAlpha = 1;
      t.globalCompositeOperation = 'source-over';
    }

    if (finish === 'print') {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(scratchCanvas(0), 0, 0);
      ctx.restore();
    } else {
      applyFinish(ctx, scratchCanvas(0), L, env);
    }
  }

  /* ── garment ── */
  function paintGarment(ctx, state, env) {
    const g = SD.GARMENTS[state.garment];
    const v = g.views[state.view];
    const base = state.color;
    const dark = SD.isDark(base);
    const seam = SD.shade(base, dark ? 0.16 : -0.22);

    /* shadow on the stage */
    if (state.shadow && !env.flat) {
      ctx.save();
      ctx.filter = 'blur(14px)';
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.translate(14, 20);
      v.body.forEach((d) => ctx.fill(P(d)));
      ctx.restore();
      ctx.filter = 'none';
    }

    /* fabric — pieces that sit behind (a hood) get their outline first so the
       body covers it, instead of leaving a seam across the shoulders */
    const behind = v.behind || 0;
    ctx.fillStyle = base;
    v.body.forEach((d) => ctx.fill(P(d)));
    if (behind) {
      ctx.strokeStyle = SD.rgba('#000000', dark ? 0.5 : 0.26);
      ctx.lineWidth = 3;
      for (let i = 0; i < behind; i++) ctx.stroke(P(v.body[i]));
      ctx.fillStyle = base;
      for (let i = behind; i < v.body.length; i++) ctx.fill(P(v.body[i]));
    }

    const sil = silhouette(state.garment, state.view);

    /* contrast panels — varsity sleeves, track stripes, raglan, ribbing */
    if (v.accent && v.accent.length) {
      ctx.save();
      ctx.clip(sil);
      ctx.fillStyle = SD.accentFor(state);
      v.accent.forEach((d) => ctx.fill(P(d)));
      ctx.restore();
    }

    /* all-over print */
    const pat = state.pattern;
    if (pat && pat.id && pat.id !== 'none') {
      const c1 = base, c2 = pat.color || (dark ? '#f4f2ec' : '#111214');
      const pc = SD.patternCanvas(pat.id, c1, c2, { graphic: pat.graphic, text: pat.text, font: pat.font });
      if (pc) {
        ctx.save();
        ctx.clip(sil);
        ctx.globalAlpha = pat.opacity == null ? 1 : pat.opacity;
        if (SD.PATTERNS[pat.id].full) {
          ctx.drawImage(pc, 0, 0, SPACE, SPACE);
        } else {
          const p2 = ctx.createPattern(pc, 'repeat');
          const k = (pat.scale == null ? 1 : pat.scale) * (SD.PATTERNS[pat.id].base || 0.9);
          if (p2.setTransform) {
            const m = new DOMMatrix();
            p2.setTransform(m.rotate(pat.rot || 0).scale(k, k));
            ctx.fillStyle = p2;
            ctx.fillRect(0, 0, SPACE, SPACE);
          } else {
            ctx.fillStyle = p2;
            ctx.fillRect(0, 0, SPACE, SPACE);
          }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    /* global light across the garment */
    ctx.save();
    ctx.clip(sil);
    const gr = ctx.createLinearGradient(0, 80, 0, 940);
    gr.addColorStop(0, 'rgba(255,255,255,.10)');
    gr.addColorStop(0.45, 'rgba(255,255,255,0)');
    gr.addColorStop(1, 'rgba(0,0,0,.13)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, SPACE, SPACE);
    const side = ctx.createLinearGradient(140, 0, 880, 0);
    side.addColorStop(0, 'rgba(0,0,0,.10)');
    side.addColorStop(0.35, 'rgba(255,255,255,.05)');
    side.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, SPACE, SPACE);
    ctx.restore();

    /* authored shading */
    (v.shade || []).forEach((p) => { ctx.fillStyle = 'rgba(0,0,0,' + p.a + ')'; ctx.fill(P(p.d)); });
    (v.light || []).forEach((p) => { ctx.fillStyle = 'rgba(255,255,255,' + p.a + ')'; ctx.fill(P(p.d)); });
    return { sil: sil, seam: seam, v: v, g: g };
  }

  function paintDetails(ctx, info, state) {
    const v = info.v, seam = info.seam;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    (v.lines || []).forEach((p) => {
      ctx.strokeStyle = SD.rgba(SD.isDark(state.color) ? '#ffffff' : '#000000', p.a);
      ctx.lineWidth = p.w;
      ctx.lineCap = p.cap || 'round';
      ctx.stroke(P(p.d));
    });
    ctx.lineCap = 'round';
    /* drawcords */
    (v.cord || []).forEach((p) => {
      ctx.strokeStyle = SD.shade(state.color, SD.isDark(state.color) ? 0.3 : -0.32);
      ctx.lineWidth = p.w;
      ctx.stroke(P(p.d));
    });
    /* topstitch */
    const stitch = info.g.stitch || SD.shade(state.color, SD.isDark(state.color) ? 0.34 : -0.3);
    if (v.stitch) {
      ctx.save();
      ctx.strokeStyle = stitch;
      v.stitch.forEach((p) => {
        ctx.lineWidth = p.w || 2.6;
        ctx.setLineDash(p.dash || []);
        ctx.stroke(P(p.d));
      });
      ctx.restore();
    }
    /* rivets, eyelets, aglets */
    (v.dots || []).forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.stitch ? stitch : SD.shade(state.color, SD.isDark(state.color) ? 0.24 : -0.26);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,.18)';
      ctx.stroke();
    });
    /* silhouette edge */
    ctx.strokeStyle = SD.rgba('#000000', SD.isDark(state.color) ? 0.55 : 0.28);
    ctx.lineWidth = 3;
    (v.body || []).forEach((d, i) => { if (i >= (v.behind || 0)) ctx.stroke(P(d)); });
  }

  function paintTexture(ctx, info) {
    const tex = SD.fabricTexture();
    ctx.save();
    ctx.clip(info.sil);
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    const pat = ctx.createPattern(tex, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, SPACE, SPACE);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /** the backdrop: a generated scene, or a photo the designer dropped in */
  function paintScene(ctx, state, opts) {
    const id = state.scene;
    if (!id || id === 'none') return;
    if (id === 'photo') {
      if (!state.sceneImage) return;
      const im = R.image(state.sceneImage, opts.onload);
      if (!im._ok) return;
      /* cover-fit the photo across the square */
      const k = Math.max(SPACE / im.width, SPACE / im.height);
      const w = im.width * k, h = im.height * k;
      ctx.drawImage(im, (SPACE - w) / 2, (SPACE - h) / 2, w, h);
      return;
    }
    const c = SD.sceneCanvas(id, { tint: state.sceneTint });
    if (c) ctx.drawImage(c, 0, 0, SPACE, SPACE);
  }

  /* ── main ── */
  /** opts: {res, flat (no stage extras), selection (layer id), onload} */
  R.draw = function (canvas, state, opts) {
    opts = opts || {};
    const res = opts.res || canvas.width / SPACE;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.setTransform(res, 0, 0, res, 0, 0);
    if (!opts.noScene) paintScene(ctx, state, opts);

    const env = { res: res, pxW: canvas.width, pxH: canvas.height, onload: opts.onload, flat: opts.flat };
    const info = paintGarment(ctx, state, env);

    /* prints, clipped to the fabric */
    const layers = state.layers[state.view] || [];
    ctx.save();
    ctx.clip(info.sil);
    layers.forEach((L) => drawLayer(ctx, L, env));
    ctx.restore();
    ctx.setTransform(res, 0, 0, res, 0, 0);
    ctx.globalAlpha = 1;

    if (state.texture) paintTexture(ctx, info);
    paintDetails(ctx, info, state);

    if (!opts.flat && state.printArea) {
      const r = SD.zoneRect(state.garment, state.view, state.zone);
      ctx.save();
      ctx.setLineDash([9, 8]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(214,255,63,.75)';
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.setLineDash([]);
      ctx.font = '600 15px ' + '"Space Mono", monospace';
      ctx.fillStyle = 'rgba(214,255,63,.8)';
      ctx.fillText(r.name || 'PRINT AREA', r.x, r.y - 9);
      ctx.restore();
    }

    if (!opts.flat && opts.selection) {
      const L = layers.filter((l) => l.id === opts.selection)[0];
      if (L && !L.hidden) drawSelection(ctx, L, res);
    }
    return ctx;
  };

  /* ── selection chrome ── */
  const HANDLE = 11;   // device px
  R.handleSize = HANDLE;

  function corners(L) {
    const b = R.bbox(L), hw = b.w / 2, hh = b.h / 2;
    return [{ x: -hw, y: -hh }, { x: hw, y: -hh }, { x: hw, y: hh }, { x: -hw, y: hh }];
  }
  R.corners = corners;

  function drawSelection(ctx, L, res) {
    const b = R.bbox(L);
    ctx.save();
    ctx.translate(L.x, L.y);
    if (L.rot) ctx.rotate(SD.rad(L.rot));
    const lw = 1.5 / res;
    ctx.lineWidth = lw;
    ctx.strokeStyle = '#d6ff3f';
    ctx.setLineDash([6 / res, 5 / res]);
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.setLineDash([]);
    /* rotate stalk */
    const ry = -b.h / 2 - 34 / res;
    ctx.beginPath();
    ctx.moveTo(0, -b.h / 2);
    ctx.lineTo(0, ry);
    ctx.stroke();
    const hs = HANDLE / res;
    ctx.fillStyle = '#d6ff3f';
    ctx.strokeStyle = '#0b0b0c';
    ctx.lineWidth = 1.2 / res;
    ctx.beginPath(); ctx.arc(0, ry, hs * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (!L.locked) {
      corners(L).forEach((c) => {
        ctx.beginPath();
        ctx.rect(c.x - hs / 2, c.y - hs / 2, hs, hs);
        ctx.fill(); ctx.stroke();
      });
    }
    ctx.restore();
  }

  /* ── geometry helpers ── */
  R.toLocal = function (L, pt) {
    const dx = pt.x - L.x, dy = pt.y - L.y, a = -SD.rad(L.rot || 0);
    return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
  };

  /** which handle (0..3 corner, 'rot') is under pt for the selected layer */
  R.hitHandle = function (L, pt, res) {
    const p = R.toLocal(L, pt), b = R.bbox(L), hs = (HANDLE + 7) / res;
    const ry = -b.h / 2 - 34 / res;
    if (Math.abs(p.x) < hs && Math.abs(p.y - ry) < hs) return 'rot';
    if (L.locked) return null;
    const cs = corners(L);
    for (let i = 0; i < cs.length; i++) {
      if (Math.abs(p.x - cs[i].x) < hs && Math.abs(p.y - cs[i].y) < hs) return i;
    }
    return null;
  };

  R.hitLayer = function (layers, pt) {
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.hidden || L.locked) continue;
      const p = R.toLocal(L, pt), b = R.bbox(L);
      const pad = 6;
      if (Math.abs(p.x) <= b.w / 2 + pad && Math.abs(p.y) <= b.h / 2 + pad) return L;
    }
    return null;
  };

  /* ── export ── */
  R.exportCanvas = function (state, px, opts) {
    const c = document.createElement('canvas');
    c.width = c.height = px || 2000;
    R.draw(c, state, Object.assign({ res: c.width / SPACE, flat: true }, opts || {}));
    return c;
  };
  R.thumb = function (state, px) {
    const c = document.createElement('canvas');
    c.width = c.height = px || 220;
    R.draw(c, state, { res: c.width / SPACE, flat: true, bg: '#17171a' });
    return c;
  };
})(window.SD);
