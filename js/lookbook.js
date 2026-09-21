/* 555 STUDIO — the shareable lookbook. Reads a collection out of the URL
   hash (so a link carries the whole thing), or falls back to this browser's
   own collection when there's no hash. */
(function (SD) {
  'use strict';
  const $ = SD.$, el = SD.el;

  function safeLink(url) {
    if (!url) return null;
    try {
      const u = new URL(url, location.href);
      return (u.protocol === 'https:' || u.protocol === 'http:') ? u : null;
    } catch (e) { return null; }
  }

  function render(payload) {
    const drops = (payload && payload.drops || []).filter(function (d) {
      return d && d.design && SD.GARMENTS[d.design.garment];
    });
    const brand = (payload && payload.brand) || '555 STUDIO';
    ['navBrand', 'heroBrand', 'footBrand'].forEach(function (id) { $('#' + id).textContent = brand; });
    document.title = 'Lookbook — ' + brand;
    $('#heroCount').textContent = drops.length + ' PIECE' + (drops.length === 1 ? '' : 'S');
    if (payload && payload.season) $('#heroSeason').textContent = payload.season;

    const grid = $('#lbGrid');
    grid.innerHTML = '';
    $('#empty').hidden = drops.length > 0;

    drops.forEach(function (d, i) {
      const meta = SD.productMeta(d);
      const st = JSON.parse(JSON.stringify(d.design));
      const front = (st.layers.front || []).length, back = (st.layers.back || []).length;
      st.view = (!front && back) ? 'back' : 'front';
      st.printArea = false;

      const fig = el('figure', { class: 'lbcard' });
      const canvas = el('canvas', { width: 900, height: 900 });
      fig.appendChild(canvas);
      SD.Render.draw(canvas, st, {
        res: canvas.width / SD.Render.SPACE, flat: true,
        onload: function () { SD.Render.draw(canvas, st, { res: canvas.width / SD.Render.SPACE, flat: true }); }
      });

      const cap = el('figcaption');
      cap.appendChild(el('span', { class: 'lbcard__n' }, String(i + 1).padStart(2, '0')));
      cap.appendChild(el('b', null, meta.title));
      cap.appendChild(el('span', { class: 'lbcard__p' }, SD.money(meta.price)));
      const link = safeLink(d.link);
      if (link) {
        const a = el('a', {
          class: 'lbcard__buy', href: link.href, target: '_blank', rel: 'noopener noreferrer',
          title: 'Opens ' + link.hostname
        }, 'BUY');
        cap.appendChild(a);
      }
      fig.appendChild(cap);
      fig.appendChild(el('p', { class: 'lbcard__desc' }, SD.describe(d.design)));
      grid.appendChild(fig);
    });
  }

  async function boot() {
    let payload = null;
    const hash = location.hash.replace(/^#/, '');
    if (hash) {
      try { payload = await SD.Share.decode(hash); }
      catch (e) { payload = null; }
    }
    if (!payload) {
      let drops = [];
      let brand = '555 STUDIO';
      try { drops = JSON.parse(localStorage.getItem('555studio:drops') || '[]'); } catch (e) {}
      try { brand = (JSON.parse(localStorage.getItem('555studio:current') || '{}') || {}).brand || brand; } catch (e) {}
      payload = { brand: brand, drops: drops };
    }
    render(payload);
  }

  function start() {
    if (document.fonts) document.fonts.ready.then(boot);
    boot();
  }
  window.addEventListener('hashchange', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.SD);
