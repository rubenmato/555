/* 555 STUDIO — product metadata shared by the studio and the store. */
(function (SD) {
  'use strict';

  const PRICE = {
    tee: 55, longsleeve: 70, jersey: 80, hoodie: 110, zip: 125, crew: 100, track: 145,
    coach: 160, denim: 170, varsity: 240, puffer: 260, flannel: 120, sweats: 95, jeans: 120,
    cargo: 130, shorts: 75, mesh: 70, cap: 45, beanie: 40, bucket: 50, tote: 30, socks: 18
  };

  SD.defaultPrice = function (garment) { return PRICE[garment] || 60; };
  SD.money = function (n) { return '£' + Math.round(n); };

  SD.sizeRun = function (garment) {
    const kind = (SD.GARMENTS[garment] || {}).kind;
    if (garment === 'socks') return ['UK 6-8', 'UK 9-11', 'UK 12-14'];
    if (kind === 'head' || kind === 'bag') return ['ONE SIZE'];
    if (kind === 'bottom') return ['28', '30', '32', '34', '36'];
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };

  /** the biggest piece of type on the garment — usually the name of the piece */
  function headline(design) {
    let best = null;
    ['front', 'back'].forEach(function (v) {
      (design.layers[v] || []).forEach(function (L) {
        if (L.type !== 'text' || L.hidden) return;
        if (!best || L.size > best.size) best = L;
      });
    });
    if (!best) return null;
    return String(best.text).split('\n').join(' ').trim().slice(0, 22);
  }

  SD.autoTitle = function (design) {
    const g = SD.GARMENTS[design.garment];
    const pat = design.pattern && design.pattern.id !== 'none' ? SD.PATTERNS[design.pattern.id].name : null;
    const head = headline(design);
    let prefix = '';
    if (pat && pat !== 'Fade') prefix = pat;
    else if (head) prefix = head;
    const title = (prefix ? prefix + ' ' : '') + g.name;
    return title.toUpperCase().slice(0, 40);
  };

  /** a short product blurb built from what's actually on the garment */
  SD.describe = function (design) {
    const g = SD.GARMENTS[design.garment];
    const bits = [];
    const weight = design.garment === 'socks' ? 'Ribbed cotton' :
      { top: 'Heavyweight', bottom: 'Relaxed-fit', head: 'Structured', bag: 'Heavy canvas' }[g.kind] || '';
    bits.push(weight + ' ' + g.name.toLowerCase() + '.');
    if (design.pattern && design.pattern.id !== 'none') {
      bits.push(SD.PATTERNS[design.pattern.id].name.toLowerCase() + ' all-over print.');
    }
    const finishes = {};
    let hits = 0;
    ['front', 'back'].forEach(function (v) {
      (design.layers[v] || []).forEach(function (L) {
        if (L.hidden) return;
        hits++;
        finishes[L.finish || 'print'] = true;
      });
    });
    const fin = Object.keys(finishes).filter(function (f) { return f !== 'print'; });
    if (fin.length) bits.push(fin.join(' and ') + ' artwork.');
    else if (hits) bits.push('Screen-printed artwork.');
    const hasAccent = ['front', 'back'].some(function (v) { return (g.views[v].accent || []).length; });
    if (hasAccent) bits.push('Contrast panelling.');
    bits.push('Made in limited numbers.');
    return bits.join(' ');
  };

  /** fill in anything a saved piece is missing, without overwriting edits */
  SD.productMeta = function (drop) {
    const d = drop.design || {};
    return {
      title: drop.title || SD.autoTitle(d),
      price: drop.price == null ? SD.defaultPrice(d.garment) : drop.price,
      sizes: drop.sizes || SD.sizeRun(d.garment),
      soldOut: !!drop.soldOut
    };
  };
})(window.SD);
