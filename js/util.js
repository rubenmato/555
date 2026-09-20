/* 555 STUDIO — helpers */
window.SD = window.SD || {};

(function (SD) {
  'use strict';

  /* ── dom ── */
  SD.$ = (sel, root) => (root || document).querySelector(sel);
  SD.$$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  SD.el = function (tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  };

  SD.uid = () => Math.random().toString(36).slice(2, 9);
  SD.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  SD.round = (v, p) => { const m = Math.pow(10, p || 0); return Math.round(v * m) / m; };
  SD.deg = (r) => (r * 180) / Math.PI;
  SD.rad = (d) => (d * Math.PI) / 180;

  /* ── colour ── */
  function hex2rgb(hex) {
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgb2hex(r, g, b) {
    const t = (v) => SD.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + t(r) + t(g) + t(b);
  }
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0; const l = (mx + mn) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d !== 0) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return { h: h, s: s, l: l };
  }
  function hsl2hex(h, s, l) {
    s = SD.clamp(s, 0, 1); l = SD.clamp(l, 0, 1);
    const c = (1 - Math.abs(2 * l - 1)) * s, hp = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp < 1) { r = c; g = x; } else if (hp < 2) { r = x; g = c; }
    else if (hp < 3) { g = c; b = x; } else if (hp < 4) { g = x; b = c; }
    else if (hp < 5) { r = x; b = c; } else { r = c; b = x; }
    const m = l - c / 2;
    return rgb2hex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  SD.hex2rgb = hex2rgb;
  SD.rgb2hex = rgb2hex;

  /** shift lightness by amount (-1..1), keeping hue */
  SD.shade = function (hex, amt) {
    const c = hex2rgb(hex), h = rgb2hsl(c.r, c.g, c.b);
    return hsl2hex(h.h, h.s, h.l + amt);
  };
  /** perceived luminance 0..1 */
  SD.lum = function (hex) {
    const c = hex2rgb(hex);
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  };
  SD.isDark = (hex) => SD.lum(hex) < 0.45;
  /** ink that reads on top of the given colour */
  SD.contrast = (hex) => (SD.isDark(hex) ? '#f4f4f2' : '#111112');
  SD.rgba = function (hex, a) {
    const c = hex2rgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  };

  /* ── seeded rng ── */
  SD.rng = function (seed) {
    let s = (seed || 1) >>> 0;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };
  SD.pick = function (arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; };

  /* ── textures (generated once, cached) ── */
  const cache = {};

  /** woven fabric noise, tiles seamlessly enough at low alpha */
  SD.fabricTexture = function () {
    if (cache.fabric) return cache.fabric;
    const s = 256, c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d'), img = x.createImageData(s, s), d = img.data, rnd = SD.rng(7);
    for (let i = 0; i < s * s; i++) {
      const px = i % s, py = (i / s) | 0;
      const weave = (px % 3 === 0 ? 10 : 0) + (py % 3 === 0 ? 10 : 0);
      const v = 128 + (rnd() - 0.5) * 46 + weave - 8;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    cache.fabric = c;
    return c;
  };

  /** grunge mask used to distress prints — white speckle + scratches on transparent */
  SD.grungeTexture = function () {
    if (cache.grunge) return cache.grunge;
    const s = 512, c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d'), rnd = SD.rng(99);
    x.clearRect(0, 0, s, s);
    x.fillStyle = '#fff';
    for (let i = 0; i < 26000; i++) {
      const r = rnd() * 2.6 + 0.2;
      x.globalAlpha = 0.25 + rnd() * 0.75;
      x.beginPath();
      x.arc(rnd() * s, rnd() * s, r, 0, Math.PI * 2);
      x.fill();
    }
    x.strokeStyle = '#fff'; x.lineCap = 'round';
    for (let i = 0; i < 240; i++) {
      x.globalAlpha = 0.2 + rnd() * 0.6;
      x.lineWidth = 0.4 + rnd() * 2.2;
      const sx = rnd() * s, sy = rnd() * s, a = rnd() * Math.PI * 2, len = 20 + rnd() * 190;
      x.beginPath(); x.moveTo(sx, sy);
      x.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      x.stroke();
    }
    x.globalAlpha = 1;
    cache.grunge = c;
    return c;
  };

  /* ── misc ── */
  SD.download = function (url, name) {
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  let toastT = null;
  SD.toast = function (msg) {
    const t = SD.$('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), 1900);
  };
})(window.SD);
