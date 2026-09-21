/* 555 STUDIO — app shell: state, history, interaction, panels */
(function (SD) {
  'use strict';
  const $ = SD.$, $$ = SD.$$, el = SD.el, clamp = SD.clamp;
  const SPACE = SD.Render.SPACE;
  const LS_CUR = '555studio:current', LS_DROPS = '555studio:drops', LS_THEME = '555studio:theme';

  /* ───────────────── state ───────────────── */
  const state = {
    brand: '555 STUDIO',
    garment: 'tee',
    color: '#111214',
    accentColor: null,
    pattern: { id: 'none', color: '#f4f2ec', scale: 1, rot: 0, opacity: 1, graphic: 'star', text: '555', font: 'archivo' },
    zone: 'main',
    view: 'front',
    printArea: true,
    texture: true,
    shadow: true,
    layers: { front: [], back: [] },
    sel: null
  };

  SD.state = state;      /* exposed for debugging in the console */

  const INK_PRESETS = ['#fbf7ef', '#101012', '#e0180f', '#d6ff3f', '#2b4a72', '#e7c479', '#ff5a1f', '#8ad0ff'];

  function layersNow() { return state.layers[state.view]; }
  function selected() {
    if (!state.sel) return null;
    return layersNow().filter((l) => l.id === state.sel)[0] || null;
  }

  function inkFor(bg) { return SD.isDark(bg) ? '#fbf7ef' : '#101012'; }
  function palette() {
    return { ink: inkFor(state.color), behind: SD.isDark(state.color) ? '#101012' : '#fbf7ef', hot: '#e0180f', acid: '#d6ff3f' };
  }

  function newLayer(o) {
    const L = {
      id: SD.uid(), seed: (Math.random() * 9999) | 0, x: 500, y: 460, rot: 0,
      opacity: 1, distress: 0, finish: 'print', hidden: false, locked: false, flipX: false
    };
    if (o.type === 'text') {
      Object.assign(L, {
        text: 'TEXT', font: 'anton', size: 100, letter: 0, lineh: 1.02, align: 'center',
        curve: 0, color: palette().ink, strokeW: 0, strokeColor: palette().behind
      });
    } else if (o.type === 'image') {
      Object.assign(L, { w: 320, h: 320 });
    } else {
      Object.assign(L, { w: 220, h: 220, color: palette().ink, altColor: null });
    }
    return Object.assign(L, o);
  }

  function layerName(L) {
    if (L.type === 'text') return (String(L.text).split('\n')[0] || 'Type').slice(0, 22) || 'Type';
    if (L.type === 'image') return 'Artwork';
    const def = (L.type === 'shape' ? SD.SHAPES : SD.GRAPHICS)[L.gid];
    return def ? def.name : L.type;
  }

  function printRect() { return SD.zoneRect(state.garment, state.view, state.zone); }

  function addLayer(partial, quiet) {
    const r = printRect();
    const L = newLayer(Object.assign({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, partial));
    layersNow().push(L);
    state.sel = L.id;
    if (!quiet) { commit(); paint(); buildLayers(); buildProps(); }
    return L;
  }

  /* ───────────────── history ───────────────── */
  const hist = { stack: [], at: -1 };
  function snapshot() {
    return JSON.stringify({
      brand: state.brand, garment: state.garment, color: state.color, accentColor: state.accentColor,
      pattern: state.pattern, view: state.view, layers: state.layers
    });
  }
  function commit() {
    const s = snapshot();
    if (hist.stack[hist.at] === s) return;
    hist.stack = hist.stack.slice(0, hist.at + 1);
    hist.stack.push(s);
    if (hist.stack.length > 70) hist.stack.shift();
    hist.at = hist.stack.length - 1;
    refreshHistBtns();
    autosave();
  }
  function restore(s) {
    const o = JSON.parse(s);
    state.garment = o.garment; state.color = o.color; state.view = o.view; state.layers = o.layers;
    if (o.brand) state.brand = o.brand;
    state.accentColor = o.accentColor || null;
    if (o.pattern) state.pattern = o.pattern;
    if (!layersNow().some((l) => l.id === state.sel)) state.sel = null;
    $('#brandName').value = state.brand;
    buildGarments(); buildSwatches(); buildAccent(); buildPatterns(); buildPatternSliders();
    syncPatternOpts(); buildZones();
    syncChrome(); paint(); buildLayers(); buildProps();
  }
  function undo() { if (hist.at > 0) { hist.at--; restore(hist.stack[hist.at]); refreshHistBtns(); autosave(); } }
  function redo() { if (hist.at < hist.stack.length - 1) { hist.at++; restore(hist.stack[hist.at]); refreshHistBtns(); autosave(); } }
  function refreshHistBtns() {
    $('#btnUndo').disabled = hist.at <= 0;
    $('#btnRedo').disabled = hist.at >= hist.stack.length - 1;
  }

  let saveT = null;
  function writeCurrent() {
    try { localStorage.setItem(LS_CUR, snapshot()); } catch (e) { /* quota — ignore */ }
  }
  function autosave() {
    clearTimeout(saveT);
    saveT = setTimeout(writeCurrent, 400);
  }
  /* don't let a pending autosave die when the tab closes or you head to the store */
  function flushSave() { clearTimeout(saveT); writeCurrent(); }
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushSave();
  });

  /* ───────────────── canvas ───────────────── */
  const canvas = $('#stage'), wrap = $('#canvasWrap');
  function sizeCanvas() {
    const box = Math.min(wrap.clientWidth, wrap.clientHeight) - 4;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = clamp(Math.round(box * dpr), 320, 2200);
    canvas.style.width = canvas.style.height = box + 'px';
    if (canvas.width !== px) { canvas.width = canvas.height = px; }
    paint();
  }
  let rafP = 0;
  function paint() {
    if (rafP) return;
    rafP = requestAnimationFrame(function () {
      rafP = 0;
      SD.Render.draw(canvas, state, { selection: state.sel, onload: paint });
    });
  }
  const res = () => canvas.width / SPACE;

  function toDesign(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * SPACE, y: ((ev.clientY - r.top) / r.height) * SPACE };
  }
  /* handle hit tests happen in screen px → convert using on-screen scale */
  const screenRes = () => canvas.getBoundingClientRect().width / SPACE;

  /* ───────────────── pointer interaction ───────────────── */
  let drag = null;

  canvas.addEventListener('pointerdown', function (ev) {
    canvas.setPointerCapture(ev.pointerId);
    const pt = toDesign(ev);
    const sel = selected();

    if (sel) {
      const h = SD.Render.hitHandle(sel, pt, screenRes());
      if (h !== null) {
        const b = SD.Render.bbox(sel);
        const loc = SD.Render.toLocal(sel, pt);
        drag = {
          mode: h === 'rot' ? 'rot' : 'scale', L: sel,
          start: pt, base: JSON.parse(JSON.stringify(sel)),
          d0: Math.max(4, Math.hypot(loc.x, loc.y)),
          a0: Math.atan2(pt.y - sel.y, pt.x - sel.x), rot0: sel.rot || 0,
          diag: Math.max(4, Math.hypot(b.w / 2, b.h / 2))
        };
        setHint(drag.mode === 'rot' ? 'Rotating — hold Shift to snap 15°' : 'Scaling');
        return;
      }
    }

    const hit = SD.Render.hitLayer(layersNow(), pt);
    if (hit) {
      state.sel = hit.id;
      drag = { mode: 'move', L: hit, start: pt, ox: hit.x - pt.x, oy: hit.y - pt.y };
      buildLayers(); buildProps(); paint();
      setHint('Moving · Shift locks an axis');
    } else if (state.sel) {
      state.sel = null; buildLayers(); buildProps(); paint();
    }
  });

  canvas.addEventListener('pointermove', function (ev) {
    if (!drag) {
      const sel = selected();
      if (sel) {
        const h = SD.Render.hitHandle(sel, toDesign(ev), screenRes());
        canvas.style.cursor = h === 'rot' ? 'grab' : h !== null ? 'nwse-resize' : 'default';
      } else canvas.style.cursor = 'default';
      return;
    }
    const pt = toDesign(ev), L = drag.L;

    if (drag.mode === 'move') {
      let nx = pt.x + drag.ox, ny = pt.y + drag.oy;
      if (ev.shiftKey) {
        if (Math.abs(pt.x - drag.start.x) > Math.abs(pt.y - drag.start.y)) ny = drag.start.y + drag.oy;
        else nx = drag.start.x + drag.ox;
      }
      L.x = clamp(Math.round(nx), -200, SPACE + 200);
      L.y = clamp(Math.round(ny), -200, SPACE + 200);
    } else if (drag.mode === 'scale') {
      const loc = SD.Render.toLocal(L, pt);
      const k = clamp(Math.hypot(loc.x, loc.y) / drag.d0, 0.08, 14);
      if (L.type === 'text') L.size = clamp(SD.round(drag.base.size * k, 1), 6, 620);
      else {
        L.w = clamp(SD.round(drag.base.w * k, 1), 8, 1600);
        L.h = clamp(SD.round(drag.base.h * k, 1), 8, 1600);
      }
    } else {
      const a = Math.atan2(pt.y - L.y, pt.x - L.x);
      let deg = drag.rot0 + SD.deg(a - drag.a0);
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
      L.rot = SD.round(((deg % 360) + 360) % 360, 1);
    }
    paint();
    syncPropValues();
  });

  function endDrag() {
    if (!drag) return;
    drag = null;
    commit(); buildLayers(); buildProps();
    setHint('');
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('dblclick', function (ev) {
    const hit = SD.Render.hitLayer(layersNow(), toDesign(ev));
    if (hit && hit.type === 'text') {
      state.sel = hit.id; buildLayers(); buildProps(); paint();
      openPanel('layers');
      const ta = $('#pText'); if (ta) { ta.focus(); ta.select(); }
    }
  });

  let hintT = null;
  function setHint(msg) {
    const h = $('#stageHint');
    clearTimeout(hintT);
    if (msg) { h.textContent = msg; return; }
    hintT = setTimeout(function () {
      h.textContent = 'Drag to move · corner handles scale · top handle rotates · double-click type to edit';
    }, 400);
  }

  /* ───────────────── left panel: garments, colours ───────────────── */
  function buildGarments() {
    const grid = $('#garmentGrid');
    grid.innerHTML = '';
    SD.GARMENT_ORDER.forEach(function (id) {
      const g = SD.GARMENTS[id];
      const card = el('button', { class: 'gcard' + (id === state.garment ? ' is-active' : ''), title: g.name });
      card.innerHTML = SD.garmentIcon(id) + '<span>' + g.short + '</span>';
      card.addEventListener('click', function () {
        if (state.garment === id) return;
        const prevKind = SD.GARMENTS[state.garment].kind;
        state.garment = id;
        if (SD.GARMENTS[id].kind !== prevKind) state.color = SD.PALETTES[SD.GARMENTS[id].kind][0];
        buildGarments(); buildSwatches(); buildAccent(); buildZones(); buildPatterns();
        syncChrome(); commit(); paint(); buildProps();
      });
      grid.appendChild(card);
    });
  }

  function buildSwatches() {
    const box = $('#colorSwatches');
    box.innerHTML = '';
    const pal = SD.PALETTES[SD.GARMENTS[state.garment].kind];
    pal.forEach(function (c) {
      const b = el('button', { class: 'sw' + (c.toLowerCase() === state.color.toLowerCase() ? ' is-active' : ''), title: c });
      b.style.background = c;
      b.addEventListener('click', function () {
        state.color = c; $('#colorCustom').value = c;
        buildSwatches(); buildGarments(); buildPatterns(); commit(); paint();
      });
      box.appendChild(b);
    });
    $('#colorCustom').value = state.color;
  }

  $('#brandName').addEventListener('input', function (e) {
    state.brand = e.target.value || '555 STUDIO';
    if (state.pattern.id === 'wordmark' && !state.pattern.custom) {
      state.pattern.text = state.brand;
      $('#wordText').value = state.pattern.text;
      buildPatterns();
    }
    paint();
  });
  $('#brandName').addEventListener('change', commit);

  /* ── contrast panels ── */
  function accentColor() { return SD.accentFor(state); }
  function buildAccent() {
    const g = SD.GARMENTS[state.garment];
    const has = ['front', 'back'].some(function (v) {
      return (g.views[v].accent || []).length;
    });
    $('#accentBlock').hidden = !has;
    if (!has) return;
    const box = $('#accentSwatches');
    box.innerHTML = '';
    SD.PALETTES[g.kind].forEach(function (c) {
      const b = el('button', { class: 'sw' + (c.toLowerCase() === accentColor().toLowerCase() ? ' is-active' : ''), title: c });
      b.style.background = c;
      b.addEventListener('click', function () {
        state.accentColor = c;
        $('#accentCustom').value = c;
        buildAccent(); commit(); paint();
      });
      box.appendChild(b);
    });
    $('#accentCustom').value = accentColor();
  }
  $('#accentCustom').addEventListener('input', function (e) {
    state.accentColor = e.target.value; buildAccent(); paint();
  });
  $('#accentCustom').addEventListener('change', commit);

  /* ── all-over prints ── */
  function patternSwatch(id) {
    const c = document.createElement('canvas');
    c.width = c.height = 54;
    const x = c.getContext('2d');
    if (id === 'none') {
      x.fillStyle = state.color;
      x.fillRect(0, 0, 54, 54);
      x.strokeStyle = 'rgba(128,128,128,.7)';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(8, 46); x.lineTo(46, 8); x.stroke();
      return c;
    }
    const pc = SD.patternCanvas(id, state.color, state.pattern.color,
      { graphic: state.pattern.graphic, text: state.pattern.text, font: state.pattern.font });
    if (pc) x.drawImage(pc, 0, 0, SD.PATTERNS[id].full ? 54 : 27, SD.PATTERNS[id].full ? 54 : 27,
      0, 0, 54, 54);
    return c;
  }
  function buildPatterns() {
    const grid = $('#patternGrid');
    grid.innerHTML = '';
    SD.PATTERN_ORDER.forEach(function (id) {
      const b = el('button', { class: 'pat' + (id === state.pattern.id ? ' is-active' : ''), title: SD.PATTERNS[id].name });
      b.appendChild(patternSwatch(id));
      b.appendChild(el('span', null, SD.PATTERNS[id].name));
      b.addEventListener('click', function () {
        state.pattern.id = id;
        if (id === 'wordmark' && !state.pattern.custom) state.pattern.text = state.brand;
        syncPatternOpts(); buildPatterns(); commit(); paint();
      });
      grid.appendChild(b);
    });
  }
  function syncPatternOpts() {
    const on = state.pattern.id !== 'none';
    $('#patternOpts').hidden = !on;
    $('#monoRow').hidden = state.pattern.id !== 'monogram';
    $('#wordRow').hidden = state.pattern.id !== 'wordmark';
    $('#patternColor').value = state.pattern.color;
    $('#wordText').value = state.pattern.text || '';
  }
  function buildPatternSliders() {
    const box = $('#patternSliders');
    box.innerHTML = '';
    const mk = function (label, key, min, max, step, fmt) {
      const wrapEl = el('label', { class: 'slider' });
      const head = el('span', null, label + '<b>' + fmt(state.pattern[key]) + '</b>');
      const inp = el('input', { type: 'range', min: min, max: max, step: step });
      inp.value = state.pattern[key];
      inp.addEventListener('input', function () {
        state.pattern[key] = parseFloat(inp.value);
        head.querySelector('b').textContent = fmt(state.pattern[key]);
        paint();
      });
      inp.addEventListener('change', function () { commit(); buildPatterns(); });
      wrapEl.appendChild(head); wrapEl.appendChild(inp);
      box.appendChild(wrapEl);
    };
    mk('Scale', 'scale', 0.25, 4, 0.05, (v) => SD.round(v, 2) + '×');
    mk('Angle', 'rot', -90, 90, 1, (v) => Math.round(v) + '°');
    mk('Strength', 'opacity', 0.1, 1, 0.01, (v) => Math.round(v * 100) + '%');
  }
  $('#patternColor').addEventListener('input', function (e) {
    state.pattern.color = e.target.value; paint();
  });
  $('#patternColor').addEventListener('change', function () { commit(); buildPatterns(); });
  $('#wordText').addEventListener('input', function (e) {
    state.pattern.text = e.target.value; state.pattern.custom = true; paint();
  });
  $('#wordText').addEventListener('change', function () { commit(); buildPatterns(); });

  /* ── placement zones ── */
  function buildZones() {
    const box = $('#zoneChips');
    box.innerHTML = '';
    const zs = SD.GARMENTS[state.garment].views[state.view].zones;
    if (!zs.some((z) => z.id === state.zone)) state.zone = zs[0].id;
    zs.forEach(function (z) {
      const b = el('button', { class: 'chip' + (z.id === state.zone ? ' is-active' : '') }, z.name);
      b.addEventListener('click', function () {
        state.zone = z.id;
        buildZones(); paint();
        SD.toast(z.name.toLowerCase() + ' — ' + printSizeLabel());
      });
      box.appendChild(b);
    });
  }
  /** the selected placement in centimetres, the way a printer quotes it */
  function printSizeLabel() {
    const r = printRect(), cm = (SD.GARMENT_CM[state.garment] || 120) / 1000;
    return SD.round(r.w * cm, 1) + ' × ' + SD.round(r.h * cm, 1) + ' cm';
  }
  SD.printSizeLabel = printSizeLabel;

  $('#colorCustom').addEventListener('input', function (e) {
    state.color = e.target.value; buildSwatches(); paint();
  });
  $('#colorCustom').addEventListener('change', commit);

  /* view toggles (two copies: panel + stage bar) */
  function setView(v) {
    if (state.view === v) return;
    state.view = v;
    state.sel = null;
    buildZones();
    syncChrome(); paint(); buildLayers(); buildProps();
  }
  $$('#viewSegment button, #viewSegment2 button').forEach(function (b) {
    b.addEventListener('click', function () { setView(b.dataset.view); });
  });

  ['printArea:togglePrintArea', 'texture:toggleTexture', 'shadow:toggleShadow'].forEach(function (pair) {
    const k = pair.split(':')[0], id = pair.split(':')[1];
    $('#' + id).addEventListener('change', function (e) { state[k] = e.target.checked; paint(); });
  });

  function syncChrome() {
    $$('#viewSegment button, #viewSegment2 button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.view === state.view);
    });
    $('#stageTitle').textContent = SD.GARMENTS[state.garment].name.toUpperCase() + ' · ' + state.view.toUpperCase();
    $$('.gcard').forEach(function (c, i) {
      c.classList.toggle('is-active', SD.GARMENT_ORDER[i] === state.garment);
    });
    $('#colorCustom').value = state.color;
  }

  /* ───────────────── add panel ───────────────── */
  $('#btnAddText').addEventListener('click', function () {
    const r = printRect();
    addLayer({ type: 'text', text: 'YOUR TEXT', size: Math.round(r.w * 0.24) });
    openPanel('layers');
  });
  $('#btnAddUpload').addEventListener('click', function () { $('#fileInput').click(); });
  $('#fileInput').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = function () {
      const im = new Image();
      im.onload = function () {
        const r = printRect();
        const maxW = r.w * 0.92, k = Math.min(maxW / im.width, (r.h * 0.9) / im.height, 3);
        addLayer({ type: 'image', src: rd.result, w: Math.round(im.width * k), h: Math.round(im.height * k) });
        SD.toast('art added');
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
    e.target.value = '';
  });

  function buildPalette(target, dict, type) {
    const grid = $(target);
    grid.innerHTML = '';
    Object.keys(dict).forEach(function (gid) {
      const def = dict[gid];
      const b = el('button', { class: 'gr', title: def.name });
      b.innerHTML = SD.graphicSvg(def);
      b.addEventListener('click', function () {
        const r = printRect(), s = Math.round(Math.min(r.w, r.h) * 0.52);
        addLayer({ type: type, gid: gid, w: s, h: s });
      });
      grid.appendChild(b);
    });
  }

  /* ───────────────── templates ───────────────── */
  function buildTemplates() {
    const list = $('#templateList');
    list.innerHTML = '';
    SD.TEMPLATES.forEach(function (t) {
      const b = el('button', { class: 'tpl' });
      b.innerHTML = '<b>' + t.name + '</b><i>' + t.desc + '</i>';
      b.addEventListener('click', function () { applyTemplate(t); });
      list.appendChild(b);
    });
  }
  /** shrink anything a preset built wider than the print area */
  function fitToPrint(made) {
    const r = printRect();
    made.forEach(function (L) {
      const b = SD.Render.bbox(L);
      if (b.w <= r.w) return;
      const k = r.w / b.w;
      if (L.type === 'text') L.size = Math.max(8, SD.round(L.size * k, 1));
      else { L.w = SD.round(L.w * k, 1); L.h = SD.round(L.h * k, 1); }
    });
  }

  function applyTemplate(t) {
    const parts = t.build(printRect(), palette());
    const made = parts.map(newLayer);
    fitToPrint(made);
    made.forEach(function (L) { layersNow().push(L); });
    state.sel = layersNow().length ? layersNow()[layersNow().length - 1].id : null;
    commit(); paint(); buildLayers(); buildProps();
    SD.toast(t.name + ' dropped');
  }
  $('#btnClear').addEventListener('click', function () {
    if (!layersNow().length) return;
    state.layers[state.view] = [];
    state.sel = null;
    commit(); paint(); buildLayers(); buildProps();
    SD.toast('cleared');
  });

  /* ───────────────── layer list ───────────────── */
  function buildLayers() {
    const list = $('#layerList');
    list.innerHTML = '';
    const ls = layersNow();
    $('#layerCount').textContent = ls.length;
    if (!ls.length) {
      list.appendChild(el('li', { class: 'hint hint--center' }, 'No layers on the ' + state.view + '.'));
      return;
    }
    ls.slice().reverse().forEach(function (L) {
      const li = el('li', { class: 'ly' + (L.id === state.sel ? ' is-active' : '') + (L.hidden ? ' is-hidden' : '') });
      const thumb = el('div', { class: 'ly__thumb' });
      if (L.type === 'text') thumb.textContent = (String(L.text).trim()[0] || 'T').toUpperCase();
      else if (L.type === 'image') thumb.innerHTML = '<img src="' + L.src + '" alt="" />';
      else thumb.innerHTML = SD.graphicSvg((L.type === 'shape' ? SD.SHAPES : SD.GRAPHICS)[L.gid]);
      li.appendChild(thumb);
      const meta = L.type + (L.finish && L.finish !== 'print' ? ' · ' + L.finish : '') + (L.locked ? ' · locked' : '');
      li.appendChild(el('div', { class: 'ly__name' }, layerName(L) + '<small>' + meta + '</small>'));

      const btns = el('div', { class: 'ly__btns' });
      const eye = el('button', { title: 'Show / hide' }, L.hidden ? '◌' : '●');
      eye.addEventListener('click', function (e) { e.stopPropagation(); L.hidden = !L.hidden; commit(); paint(); buildLayers(); });
      const lock = el('button', { title: 'Lock' }, L.locked ? '🔒' : '🔓');
      lock.addEventListener('click', function (e) { e.stopPropagation(); L.locked = !L.locked; commit(); paint(); buildLayers(); buildProps(); });
      const del = el('button', { title: 'Delete' }, '✕');
      del.addEventListener('click', function (e) { e.stopPropagation(); removeLayer(L.id); });
      btns.appendChild(eye); btns.appendChild(lock); btns.appendChild(del);
      li.appendChild(btns);

      li.addEventListener('click', function () { state.sel = L.id; buildLayers(); buildProps(); paint(); });
      list.appendChild(li);
    });
  }

  function removeLayer(id) {
    const ls = layersNow(), i = ls.findIndex((l) => l.id === id);
    if (i < 0) return;
    ls.splice(i, 1);
    if (state.sel === id) state.sel = null;
    commit(); paint(); buildLayers(); buildProps();
  }
  function duplicate() {
    const L = selected();
    if (!L) return;
    const c = JSON.parse(JSON.stringify(L));
    c.id = SD.uid(); c.seed = (Math.random() * 9999) | 0; c.x += 26; c.y += 26;
    layersNow().push(c);
    state.sel = c.id;
    commit(); paint(); buildLayers(); buildProps();
  }
  function reorder(dir) {
    const ls = layersNow(), i = ls.findIndex((l) => l.id === state.sel);
    if (i < 0) return;
    const j = clamp(i + dir, 0, ls.length - 1);
    if (i === j) return;
    ls.splice(j, 0, ls.splice(i, 1)[0]);
    commit(); paint(); buildLayers();
  }

  $('#btnDelete').addEventListener('click', function () { if (state.sel) removeLayer(state.sel); });
  $('#btnDuplicate').addEventListener('click', duplicate);

  /* ───────────────── properties ───────────────── */
  const bound = [];   // live inputs, refreshed while dragging on canvas

  function slider(labelTxt, val, min, max, step, fmt, onInput) {
    const wrapEl = el('label', { class: 'slider' });
    const head = el('span', null, labelTxt + '<b>' + fmt(val) + '</b>');
    const inp = el('input', { type: 'range', min: min, max: max, step: step });
    inp.value = val;
    inp.addEventListener('input', function () {
      const v = parseFloat(inp.value);
      head.querySelector('b').textContent = fmt(v);
      onInput(v);
      paint();
    });
    inp.addEventListener('change', commit);
    wrapEl.appendChild(head); wrapEl.appendChild(inp);
    bound.push({ inp: inp, head: head, fmt: fmt });
    return wrapEl;
  }

  function colorRow(labelTxt, value, onPick) {
    const row = el('div');
    row.appendChild(el('div', { class: 'label' }, labelTxt));
    const line = el('div', { class: 'row' });
    const inp = el('input', { type: 'color' });
    inp.value = /^#/.test(value || '') ? value : '#ffffff';
    inp.style.width = '44px'; inp.style.height = '30px';
    inp.addEventListener('input', function () { onPick(inp.value); paint(); });
    inp.addEventListener('change', commit);
    line.appendChild(inp);
    INK_PRESETS.forEach(function (c) {
      const b = el('button', { class: 'sw', title: c });
      b.style.background = c; b.style.width = '22px'; b.style.height = '22px'; b.style.aspectRatio = 'auto';
      b.addEventListener('click', function () { inp.value = c; onPick(c); paint(); commit(); });
      line.appendChild(b);
    });
    row.appendChild(line);
    return row;
  }

  function miniRow(opts, current, onPick) {
    const g = el('div', { class: 'mini-grid' });
    opts.forEach(function (o) {
      const b = el('button', { class: 'mini' + (o.v === current ? ' is-active' : '') }, o.t);
      b.addEventListener('click', function () {
        onPick(o.v);
        $$('.mini', g).forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        paint(); commit();
      });
      g.appendChild(b);
    });
    return g;
  }

  function buildProps() {
    const box = $('#props');
    bound.length = 0;
    box.innerHTML = '';
    const L = selected();
    if (!L) {
      box.appendChild(el('p', { class: 'hint hint--center' },
        'Nothing selected.<br />Add type, a graphic or your own art — then drag it on the garment.'));
      return;
    }

    box.appendChild(el('div', { class: 'label' }, layerName(L) + ' · ' + L.type));

    if (L.type === 'text') {
      const ta = el('textarea', { id: 'pText', rows: 2, spellcheck: 'false' });
      ta.value = L.text;
      ta.addEventListener('input', function () { L.text = ta.value; paint(); buildLayers(); });
      ta.addEventListener('change', commit);
      box.appendChild(ta);

      box.appendChild(el('div', { class: 'label' }, 'Typeface'));
      const fl = el('div', { class: 'font-list' });
      SD.FONTS.forEach(function (f) {
        const b = el('button', { class: 'font-opt' + (f.id === L.font ? ' is-active' : '') }, f.label);
        b.style.fontFamily = f.css;
        b.addEventListener('click', function () {
          L.font = f.id;
          $$('.font-opt', fl).forEach((x) => x.classList.remove('is-active'));
          b.classList.add('is-active');
          paint(); commit(); buildLayers();
        });
        fl.appendChild(b);
      });
      box.appendChild(fl);

      box.appendChild(slider('Size', L.size, 10, 460, 1, (v) => Math.round(v) + 'px', (v) => { L.size = v; }));
      box.appendChild(slider('Tracking', L.letter, -20, 60, 0.5, (v) => SD.round(v, 1), (v) => { L.letter = v; }));
      box.appendChild(slider('Leading', L.lineh, 0.7, 2, 0.01, (v) => SD.round(v, 2), (v) => { L.lineh = v; }));
      box.appendChild(slider('Arch', L.curve, -100, 100, 1, (v) => Math.round(v), (v) => { L.curve = v; }));
      box.appendChild(el('div', { class: 'label' }, 'Align'));
      box.appendChild(miniRow([{ t: 'L', v: 'left' }, { t: 'C', v: 'center' }, { t: 'R', v: 'right' }], L.align, (v) => { L.align = v; }));
      box.appendChild(colorRow('Ink', L.color, (c) => { L.color = c; }));
      box.appendChild(slider('Outline', L.strokeW, 0, 26, 0.5, (v) => SD.round(v, 1), (v) => { L.strokeW = v; }));
      box.appendChild(colorRow('Outline ink', L.strokeColor, (c) => { L.strokeColor = c; }));
    }

    if (L.type === 'graphic' || L.type === 'shape') {
      const def = (L.type === 'shape' ? SD.SHAPES : SD.GRAPHICS)[L.gid];
      box.appendChild(slider('Width', L.w, 20, 1100, 1, (v) => Math.round(v), (v) => { L.w = v; }));
      box.appendChild(slider('Height', L.h, 20, 1100, 1, (v) => Math.round(v), (v) => { L.h = v; }));
      box.appendChild(colorRow('Ink', L.color, (c) => { L.color = c; }));
      const hasAlt = def && def.paths.some((p) => p.tone === 'alt');
      if (hasAlt) box.appendChild(colorRow('Second ink', L.altColor || L.color, (c) => { L.altColor = c; }));
    }

    if (L.type === 'image') {
      const ratio = L.h / L.w;
      box.appendChild(slider('Size', L.w, 30, 1200, 1, (v) => Math.round(v), function (v) { L.w = v; L.h = v * ratio; }));
    }

    box.appendChild(el('div', { class: 'label' }, 'Finish'));
    box.appendChild(miniRow([
      { t: 'PRINT', v: 'print' }, { t: 'PUFF', v: 'puff' }, { t: 'EMB', v: 'embroidery' },
      { t: 'FOIL', v: 'foil' }, { t: 'VINYL', v: 'vinyl' }
    ], L.finish || 'print', function (v) { L.finish = v; }));

    box.appendChild(slider('Rotation', L.rot, -180, 180, 1, (v) => Math.round(v) + '°', (v) => { L.rot = v; }));
    box.appendChild(slider('Distress', L.distress, 0, 0.9, 0.01, (v) => Math.round(v * 100) + '%', (v) => { L.distress = v; }));
    box.appendChild(slider('Opacity', L.opacity, 0.05, 1, 0.01, (v) => Math.round(v * 100) + '%', (v) => { L.opacity = v; }));

    box.appendChild(el('div', { class: 'label' }, 'Layer'));
    const acts = el('div', { class: 'mini-grid' });
    [['↑', () => reorder(1), 'Bring forward'], ['↓', () => reorder(-1), 'Send back'],
      ['⇋', () => { L.flipX = !L.flipX; paint(); commit(); }, 'Flip'],
      ['⧉', duplicate, 'Duplicate']].forEach(function (a) {
      const b = el('button', { class: 'mini', title: a[2] }, a[0]);
      b.addEventListener('click', a[1]);
      acts.appendChild(b);
    });
    box.appendChild(acts);

    const center = el('div', { class: 'mini-grid' });
    center.style.marginTop = '5px';
    [['CENTRE X', function () { const r = printRect(); L.x = r.x + r.w / 2; }],
      ['CENTRE Y', function () { const r = printRect(); L.y = r.y + r.h / 2; }]].forEach(function (a) {
      const b = el('button', { class: 'mini' }, a[0]);
      b.style.gridColumn = 'span 2';
      b.addEventListener('click', function () { a[1](); paint(); commit(); });
      center.appendChild(b);
    });
    box.appendChild(center);

    const dl = el('button', { class: 'btn btn--wide btn--danger' }, 'DELETE LAYER');
    dl.style.marginTop = '12px';
    dl.addEventListener('click', function () { removeLayer(L.id); });
    box.appendChild(dl);
  }

  /** keep sliders in step with canvas dragging without rebuilding the panel */
  function syncPropValues() {
    const L = selected();
    if (!L || !bound.length) return;
    bound.forEach(function (b) {
      const label = b.head.textContent;
      let v = null;
      if (/^Size/.test(label)) v = L.type === 'text' ? L.size : L.w;
      else if (/^Width/.test(label)) v = L.w;
      else if (/^Height/.test(label)) v = L.h;
      else if (/^Rotation/.test(label)) v = L.rot;
      if (v == null) return;
      b.inp.value = v;
      b.head.querySelector('b').textContent = b.fmt(v);
    });
  }

  /* ───────────────── keyboard ───────────────── */
  document.addEventListener('keydown', function (e) {
    const t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); return; }
    if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); saveDrop(); return; }
    if (meta && e.key.toLowerCase() === 'e') { e.preventDefault(); exportPng(); return; }
    const L = selected();
    if (!L) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeLayer(L.id); return; }
    if (e.key === 'Escape') { state.sel = null; buildLayers(); buildProps(); paint(); return; }
    if (e.key === '[') { reorder(-1); return; }
    if (e.key === ']') { reorder(1); return; }
    const step = e.shiftKey ? 12 : 2;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      L.x += moves[e.key][0]; L.y += moves[e.key][1];
      paint();
      clearTimeout(saveT); commit();
    }
  });

  /* ───────────────── export / save ───────────────── */
  function fileStem() {
    return '555-' + state.garment + '-' + state.view + '-' + Date.now().toString(36);
  }
  function exportPng() {
    const c = SD.Render.exportCanvas(state, 2200);
    SD.download(c.toDataURL('image/png'), fileStem() + '.png');
    SD.toast('png exported');
  }
  $('#btnExport').addEventListener('click', exportPng);

  /* ── sheets ── */
  function sheetStem(kind) {
    return String(state.brand || '555').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
      '-' + kind + '-' + Date.now().toString(36);
  }
  function exportTechPack() {
    const c = SD.Sheets.techPack(state);
    SD.download(c.toDataURL('image/png'), sheetStem('techpack') + '.png');
    SD.toast('tech pack exported');
  }
  $('#btnTechPack').addEventListener('click', exportTechPack);

  function exportLookbook() {
    const drops = readDrops();
    if (!drops.length) { SD.toast('save some pieces first'); return; }
    const c = SD.Sheets.lookbook(drops, state.brand);
    SD.download(c.toDataURL('image/png'), sheetStem('lookbook') + '.png');
    SD.toast('lookbook exported');
  }
  $('#btnLookbook').addEventListener('click', exportLookbook);

  function readDrops() {
    try { return JSON.parse(localStorage.getItem(LS_DROPS) || '[]'); } catch (e) { return []; }
  }
  function writeDrops(arr) {
    try { localStorage.setItem(LS_DROPS, JSON.stringify(arr)); return true; }
    catch (e) { SD.toast('storage full — export json instead'); return false; }
  }
  function saveDrop() {
    const arr = readDrops();
    const design = JSON.parse(snapshot());
    arr.unshift({
      id: SD.uid(), at: Date.now(),
      name: SD.GARMENTS[state.garment].short + ' · ' + new Date().toLocaleDateString(),
      title: SD.autoTitle(design),
      price: SD.defaultPrice(state.garment),
      sizes: SD.sizeRun(state.garment),
      thumb: SD.Render.thumb(state, 240).toDataURL('image/png'),
      design: design
    });
    if (writeDrops(arr.slice(0, 24))) SD.toast('added to the collection');
    buildDrops();
  }
  $('#btnSave').addEventListener('click', saveDrop);

  function buildDrops() {
    const grid = $('#dropsGrid');
    const arr = readDrops();
    grid.innerHTML = '';
    if (!arr.length) {
      grid.appendChild(el('p', { class: 'hint' },
        'Nothing saved yet. Hit SAVE to add a piece — the collection feeds the lookbook and your store page.'));
      return;
    }
    arr.forEach(function (d) {
      const card = el('div', { class: 'drop' });
      const img = el('img', { src: d.thumb, alt: d.name, title: 'Open' });
      img.addEventListener('click', function () {
        restore(JSON.stringify(d.design));
        commit();
        $('#dropsModal').hidden = true;
        SD.toast('loaded');
      });
      card.appendChild(img);

      /* product name + price travel with the piece into the store page */
      const m = SD.productMeta(d);
      const edit = el('div', { class: 'drop__edit' });
      const nameIn = el('input', { type: 'text', value: m.title, maxlength: '40', spellcheck: 'false' });
      const priceIn = el('input', { type: 'number', value: m.price, min: '0', max: '9999', step: '5' });
      function persist() {
        const all = readDrops();
        const row = all.filter((k) => k.id === d.id)[0];
        if (!row) return;
        row.title = nameIn.value.toUpperCase().slice(0, 40) || m.title;
        row.price = Math.max(0, parseInt(priceIn.value, 10) || 0);
        writeDrops(all);
      }
      nameIn.addEventListener('change', persist);
      priceIn.addEventListener('change', persist);
      edit.appendChild(nameIn);
      edit.appendChild(priceIn);
      card.appendChild(edit);

      const meta = el('div', { class: 'drop__meta' });
      const g = d.design && SD.GARMENTS[d.design.garment];
      meta.appendChild(el('span', null, (g ? g.name : d.name) + ' · ' + (d.design ? d.design.color : '')));
      const x = el('button', { title: 'Delete' }, '✕');
      x.addEventListener('click', function () {
        writeDrops(readDrops().filter((k) => k.id !== d.id));
        buildDrops();
      });
      meta.appendChild(x);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }
  function openDrops() { buildDrops(); $('#dropsModal').hidden = false; }
  $('#btnDrops').addEventListener('click', openDrops);
  $('#btnDropsM').addEventListener('click', openDrops);
  $('#btnCloseDrops').addEventListener('click', function () { $('#dropsModal').hidden = true; });
  $('#dropsModal').addEventListener('click', function (e) { if (e.target === $('#dropsModal')) $('#dropsModal').hidden = true; });

  $('#btnExportJson').addEventListener('click', function () {
    const blob = new Blob([snapshot()], { type: 'application/json' });
    SD.download(URL.createObjectURL(blob), fileStem() + '.json');
  });
  $('#btnImportJson').addEventListener('click', function () { $('#jsonInput').click(); });
  $('#jsonInput').addEventListener('change', function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = function () {
      try {
        const o = JSON.parse(rd.result);
        if (!o.layers) throw new Error('bad file');
        restore(JSON.stringify(o)); commit();
        $('#dropsModal').hidden = true;
        SD.toast('design imported');
      } catch (err) { SD.toast('could not read that file'); }
    };
    rd.readAsText(f);
    e.target.value = '';
  });

  /* ───────────────── random ───────────────── */
  $('#btnRandom').addEventListener('click', function () {
    const pal = SD.PALETTES[SD.GARMENTS[state.garment].kind];
    state.color = SD.pick(pal);
    state.accentColor = Math.random() < 0.5 ? SD.pick(pal) : null;
    if (Math.random() < 0.45) {
      state.pattern.id = SD.pick(SD.PATTERN_ORDER.slice(1));
      state.pattern.color = SD.pick(pal);
      state.pattern.scale = SD.round(0.5 + Math.random() * 1.6, 2);
      if (state.pattern.id === 'wordmark') { state.pattern.text = state.brand; state.pattern.custom = false; }
    } else {
      state.pattern.id = 'none';
    }
    state.layers[state.view] = [];
    const t = SD.pick(SD.TEMPLATES);
    const parts = t.build(printRect(), palette());
    const made = parts.map(function (p) {
      if (p.type === 'text' && Math.random() < 0.55) p.font = SD.pick(SD.FONTS).id;
      if (Math.random() < 0.3) p.distress = SD.round(Math.random() * 0.4, 2);
      if (Math.random() < 0.35) p.finish = SD.pick(['puff', 'embroidery', 'foil', 'vinyl']);
      return newLayer(p);
    });
    fitToPrint(made);
    made.forEach(function (L) { layersNow().push(L); });
    state.sel = null;
    buildSwatches(); buildGarments(); buildAccent(); buildPatterns(); syncPatternOpts();
    buildPatternSliders(); syncChrome();
    commit(); paint(); buildLayers(); buildProps();
    SD.toast(t.name.toLowerCase());
  });

  /* ───────────────── chrome: tabs, theme, mobile ───────────────── */
  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.tab').forEach((t) => t.classList.remove('is-active'));
      $$('.tabpane').forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      $('.tabpane[data-pane="' + tab.dataset.tab + '"]').classList.add('is-active');
    });
  });

  function openPanel(which) {
    if (window.innerWidth > 880) return;
    const L = $('#panelLeft'), R = $('#panelRight');
    L.classList.remove('is-open'); R.classList.remove('is-open');
    if (which === 'layers') R.classList.add('is-open');
    else if (which !== 'stage') {
      L.classList.add('is-open');
      const tab = $('.tab[data-tab="' + (which === 'add' ? 'add' : 'garment') + '"]');
      if (tab) tab.click();
    }
    $$('.mobilebar button').forEach(function (b) { b.classList.toggle('is-active', b.dataset.mob === which); });
  }
  $$('.mobilebar button').forEach(function (b) {
    b.addEventListener('click', function () { openPanel(b.dataset.mob); setTimeout(sizeCanvas, 60); });
  });

  function flipTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(LS_THEME, next); } catch (e) {}
    paint();
  }
  $('#btnTheme').addEventListener('click', flipTheme);
  $('#btnThemeM').addEventListener('click', flipTheme);
  $('#btnUndo').addEventListener('click', undo);
  $('#btnRedo').addEventListener('click', redo);

  /* ───────────────── boot ───────────────── */
  function seedDesign() {
    const t = SD.TEMPLATES[1];  // arch college on the front
    const made = t.build(printRect(), palette()).map(newLayer);
    fitToPrint(made);
    made.forEach(function (L) { layersNow().push(L); });
  }

  function boot() {
    try {
      const saved = localStorage.getItem(LS_THEME);
      if (saved) document.documentElement.dataset.theme = saved;
    } catch (e) {}

    const mono = $('#monoGraphic');
    Object.keys(SD.GRAPHICS).forEach(function (gid) {
      mono.appendChild(el('option', { value: gid }, SD.GRAPHICS[gid].name));
    });
    mono.value = state.pattern.graphic;
    mono.addEventListener('change', function () {
      state.pattern.graphic = mono.value;
      buildPatterns(); commit(); paint();
    });

    buildGarments();
    buildSwatches();
    buildPalette('#graphicGrid', SD.GRAPHICS, 'graphic');
    buildPalette('#shapeGrid', SD.SHAPES, 'shape');
    buildTemplates();

    let loaded = false;
    try {
      const cur = localStorage.getItem(LS_CUR);
      if (cur) {
        const o = JSON.parse(cur);
        if (o && o.layers && SD.GARMENTS[o.garment]) {
          state.garment = o.garment; state.color = o.color; state.view = o.view || 'front'; state.layers = o.layers;
          if (o.brand) state.brand = o.brand;
          state.accentColor = o.accentColor || null;
          if (o.pattern) state.pattern = o.pattern;
          loaded = true;
        }
      }
    } catch (e) {}
    if (!loaded) seedDesign();

    $('#brandName').value = state.brand;
    buildGarments(); buildSwatches(); buildAccent(); buildPatterns(); buildPatternSliders();
    syncPatternOpts(); buildZones(); syncChrome(); buildLayers(); buildProps();
    commit();
    sizeCanvas();

    if (window.ResizeObserver) new ResizeObserver(sizeCanvas).observe(wrap);
    window.addEventListener('resize', sizeCanvas);

    /* web fonts land after first paint — redraw when they do */
    if (document.fonts) {
      const probes = SD.FONTS.map(function (f) {
        return document.fonts.load('40px ' + f.css.split(',')[0]).catch(function () {});
      });
      Promise.all(probes).then(paint);
      document.fonts.ready.then(paint);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.SD);
