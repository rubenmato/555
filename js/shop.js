/* 555 STUDIO — the store front. Reads the collection saved by the studio
   (localStorage) and renders each piece with the same canvas engine. */
(function (SD) {
  'use strict';
  const $ = SD.$, $$ = SD.$$, el = SD.el;
  const LS_DROPS = '555studio:drops', LS_CUR = '555studio:current', LS_BAG = '555studio:bag';

  let drops = [];
  let bag = [];
  let current = null;        // open product
  let currentView = 'front';
  let currentSize = null;
  let filter = 'all';
  const shotCache = {};

  /* ── data ── */
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || fallback); } catch (e) { return JSON.parse(fallback); }
  }
  function brandName() {
    const cur = read(LS_CUR, '{}');
    if (cur && cur.brand) return cur.brand;
    for (let i = 0; i < drops.length; i++) if (drops[i].design && drops[i].design.brand) return drops[i].design.brand;
    return '555 STUDIO';
  }

  /** render a piece once and keep the data url */
  function shot(drop, view, px) {
    const key = drop.id + view + (px || 700);
    if (shotCache[key]) return shotCache[key];
    const st = JSON.parse(JSON.stringify(drop.design));
    st.view = view;
    st.printArea = false;
    st.shadow = true;
    const url = SD.Render.exportCanvas(st, px || 700).toDataURL('image/png');
    shotCache[key] = url;
    return url;
  }
  /** the side the piece was actually designed on */
  function heroView(drop) {
    const L = drop.design.layers || {};
    return (!(L.front || []).length && (L.back || []).length) ? 'back' : 'front';
  }

  /* ── grid ── */
  function kindOf(drop) { return (SD.GARMENTS[drop.design.garment] || {}).kind || 'top'; }

  function buildFilters() {
    const box = $('#filters');
    box.innerHTML = '';
    const kinds = ['all'].concat(['top', 'bottom', 'head', 'bag'].filter(function (k) {
      return drops.some(function (d) { return kindOf(d) === k; });
    }));
    const label = { all: 'ALL', top: 'TOPS', bottom: 'BOTTOMS', head: 'HEADWEAR', bag: 'BAGS' };
    kinds.forEach(function (k) {
      const b = el('button', { class: 'filter' + (k === filter ? ' is-active' : '') }, label[k]);
      b.addEventListener('click', function () { filter = k; buildFilters(); buildGrid(); });
      box.appendChild(b);
    });
  }

  function buildGrid() {
    const grid = $('#grid');
    grid.innerHTML = '';
    const list = drops.filter(function (d) { return filter === 'all' || kindOf(d) === filter; });
    $('#empty').hidden = drops.length > 0;
    list.forEach(function (d, i) {
      const meta = SD.productMeta(d);
      const card = el('button', { class: 'card' });
      const shotBox = el('div', { class: 'card__shot' });
      const img = el('img', { src: shot(d, heroView(d)), alt: meta.title, loading: 'lazy' });
      shotBox.appendChild(img);
      if (i === 0) shotBox.appendChild(el('span', { class: 'card__tag' }, 'NEW'));
      card.appendChild(shotBox);
      const line = el('div', { class: 'card__meta' });
      line.appendChild(el('span', { class: 'card__name' }, meta.title));
      line.appendChild(el('span', { class: 'card__price' }, SD.money(meta.price)));
      card.appendChild(line);
      card.appendChild(el('div', { class: 'card__sizes' }, meta.sizes.join(' · ')));
      card.addEventListener('click', function () { openProduct(d); });
      grid.appendChild(card);
    });
  }

  function buildLookbook() {
    const strip = $('#lookStrip');
    strip.innerHTML = '';
    drops.forEach(function (d) {
      const meta = SD.productMeta(d);
      const fig = el('figure');
      fig.appendChild(el('img', { src: shot(d, heroView(d)), alt: meta.title, loading: 'lazy' }));
      fig.appendChild(el('figcaption', null, meta.title + ' — ' + SD.money(meta.price)));
      fig.addEventListener('click', function () { openProduct(d); });
      strip.appendChild(fig);
    });
    $('#lookbook').hidden = !drops.length;
  }

  /* ── product view ── */
  function openProduct(d) {
    current = d;
    currentView = heroView(d);
    currentSize = null;
    const meta = SD.productMeta(d);
    $('#pdpTitle').textContent = meta.title;
    $('#pdpPrice').textContent = SD.money(meta.price);
    $('#pdpDesc').textContent = SD.describe(d.design);

    const sizes = $('#pdpSizes');
    sizes.innerHTML = '';
    meta.sizes.forEach(function (sz) {
      const b = el('button', { class: 'size' }, sz);
      b.addEventListener('click', function () {
        currentSize = sz;
        $$('.size', sizes).forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        $('#pdpAdd').textContent = 'ADD TO BAG';
      });
      sizes.appendChild(b);
    });

    const spec = $('#pdpSpec');
    spec.innerHTML = '';
    const g = SD.GARMENTS[d.design.garment];
    const rows = [['STYLE', g.name], ['COLOURWAY', String(d.design.color).toUpperCase()]];
    if (d.design.pattern && d.design.pattern.id !== 'none') {
      rows.push(['ALL-OVER', SD.PATTERNS[d.design.pattern.id].name]);
    }
    const fins = {};
    ['front', 'back'].forEach(function (v) {
      (d.design.layers[v] || []).forEach(function (L) { fins[L.finish || 'print'] = true; });
    });
    if (Object.keys(fins).length) rows.push(['PRINT', Object.keys(fins).join(', ')]);
    rows.push(['SIZES', meta.sizes.join(' ')]);
    rows.forEach(function (r) {
      const row = el('div');
      row.appendChild(el('dt', null, r[0]));
      row.appendChild(el('dd', null, String(r[1]).toUpperCase()));
      spec.appendChild(row);
    });

    syncViews();
    drawProduct();
    $('#pdp').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function syncViews() {
    $$('.pdp__views button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.view === currentView);
    });
  }
  function drawProduct() {
    if (!current) return;
    const c = $('#pdpCanvas');
    const st = JSON.parse(JSON.stringify(current.design));
    st.view = currentView;
    st.printArea = false;
    st.shadow = true;
    SD.Render.draw(c, st, { res: c.width / SD.Render.SPACE, flat: true, onload: drawProduct });
  }
  $$('.pdp__views button').forEach(function (b) {
    b.addEventListener('click', function () { currentView = b.dataset.view; syncViews(); drawProduct(); });
  });
  function closeProduct() {
    $('#pdp').hidden = true;
    document.body.style.overflow = '';
  }
  $('#pdpClose').addEventListener('click', closeProduct);
  $('#pdp').addEventListener('click', function (e) { if (e.target === $('#pdp')) closeProduct(); });

  $('#pdpAdd').addEventListener('click', function () {
    if (!current) return;
    const meta = SD.productMeta(current);
    if (!currentSize) {
      $('#pdpAdd').textContent = 'PICK A SIZE FIRST';
      return;
    }
    bag.push({
      id: current.id, size: currentSize, title: meta.title, price: meta.price,
      shot: shot(current, heroView(current), 220)
    });
    saveBag();
    closeProduct();
    openBag();
  });

  /* ── bag ── */
  function saveBag() {
    try { localStorage.setItem(LS_BAG, JSON.stringify(bag)); } catch (e) { /* full — keep it in memory */ }
    renderBag();
  }
  function renderBag() {
    $('#bagCount').textContent = bag.length;
    const box = $('#bagItems');
    box.innerHTML = '';
    if (!bag.length) {
      box.appendChild(el('p', { class: 'bag__note' }, 'Your bag is empty.'));
    }
    bag.forEach(function (item, i) {
      const line = el('div', { class: 'bagline' });
      line.appendChild(el('img', { src: item.shot, alt: '' }));
      const txt = el('div', { class: 'bagline__txt' });
      txt.appendChild(el('b', null, item.title));
      txt.appendChild(el('span', null, 'SIZE ' + item.size + ' · ' + SD.money(item.price)));
      line.appendChild(txt);
      const x = el('button', { title: 'Remove' }, '✕');
      x.addEventListener('click', function () { bag.splice(i, 1); saveBag(); });
      line.appendChild(x);
      box.appendChild(line);
    });
    const total = bag.reduce(function (n, i) { return n + i.price; }, 0);
    $('#bagTotal').textContent = SD.money(total);
    $('#bagCheckout').disabled = !bag.length;
  }
  function openBag() { $('#bag').hidden = false; $('#scrim').hidden = false; }
  function closeBag() { $('#bag').hidden = true; $('#scrim').hidden = true; }
  $('#btnBag').addEventListener('click', openBag);
  $('#bagClose').addEventListener('click', closeBag);
  $('#scrim').addEventListener('click', closeBag);
  $('#bagCheckout').addEventListener('click', function () {
    $('#bagCheckout').textContent = 'PREVIEW ONLY — NO CHECKOUT';
    setTimeout(function () { $('#bagCheckout').textContent = 'CHECKOUT'; }, 2200);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#pdp').hidden) closeProduct();
    else if (!$('#bag').hidden) closeBag();
  });

  /* ── boot ── */
  function boot() {
    drops = read(LS_DROPS, '[]').filter(function (d) {
      return d && d.design && d.design.garment && SD.GARMENTS[d.design.garment];
    });
    bag = read(LS_BAG, '[]');

    const brand = brandName();
    ['navBrand', 'heroBrand', 'footBrand'].forEach(function (id) { $('#' + id).textContent = brand; });
    document.title = 'Store — ' + brand;
    $('#heroCount').textContent = drops.length + ' PIECE' + (drops.length === 1 ? '' : 'S');
    $('#heroDrop').textContent = drops.length ? 'DROP LIVE NOW' : 'NOTHING DROPPED YET';

    buildFilters();
    buildGrid();
    buildLookbook();
    renderBag();
  }

  function start() {
    if (document.fonts) {
      Promise.all(SD.FONTS.map(function (f) {
        return document.fonts.load('40px ' + f.css.split(',')[0]).catch(function () {});
      })).then(function () { Object.keys(shotCache).forEach(function (k) { delete shotCache[k]; }); boot(); });
    }
    boot();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.SD);
