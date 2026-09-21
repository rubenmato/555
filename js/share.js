/* 555 STUDIO — pack a collection into a URL so a lookbook can be shared
   without a server. Deflate + base64url where the browser supports it. */
(function (SD) {
  'use strict';

  const S = {};
  SD.Share = S;

  function b64urlFromBytes(bytes) {
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function bytesFromB64url(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function squeeze(bytes) {
    if (typeof CompressionStream === 'undefined') return null;
    const cs = new CompressionStream('deflate-raw');
    const stream = new Blob([bytes]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function expand(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  /** "z" = deflated, "j" = plain json — both base64url */
  S.encode = async function (obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    const packed = await squeeze(raw);
    return packed ? 'z' + b64urlFromBytes(packed) : 'j' + b64urlFromBytes(raw);
  };

  S.decode = async function (str) {
    if (!str) return null;
    const kind = str[0], body = bytesFromB64url(str.slice(1));
    const raw = kind === 'z' ? await expand(body) : body;
    return JSON.parse(new TextDecoder().decode(raw));
  };

  /** drop everything heavy: uploaded artwork and photo backdrops */
  S.slim = function (drops) {
    let dropped = 0;
    const out = JSON.parse(JSON.stringify(drops)).map(function (d) {
      if (d.thumb) d.thumb = '';
      const design = d.design;
      if (design) {
        if (design.sceneImage) { design.sceneImage = null; design.scene = 'studio'; dropped++; }
        ['front', 'back'].forEach(function (v) {
          const arr = design.layers[v] || [];
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].type === 'image') { arr.splice(i, 1); dropped++; }
          }
        });
      }
      return d;
    });
    return { drops: out, dropped: dropped };
  };
})(window.SD);
