// Outils de géométrie : fusionner plusieurs formes en une seule (un seul dessin pour la carte graphique,
// ce qui compte beaucoup pour la fluidité sur téléphone).
import * as THREE from 'three';

// parts : [{ geometry, color? }] (les formes sont déjà placées). withColor : couleur par sommet.
export function merge(parts, withColor) {
  let count = 0;
  const geos = parts.map((p) => {
    const g = p.geometry.index ? p.geometry.toNonIndexed() : p.geometry;
    count += g.attributes.position.count;
    return g;
  });
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const col = withColor ? new Float32Array(count * 3) : null;
  let o = 0;
  const c = new THREE.Color();
  geos.forEach((g, i) => {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
    if (col) {
      c.set(parts[i].color);
      for (let k = 0; k < n; k++) {
        col[(o + k) * 3] = c.r;
        col[(o + k) * 3 + 1] = c.g;
        col[(o + k) * 3 + 2] = c.b;
      }
    }
    o += n;
    if (g !== parts[i].geometry) g.dispose();
    parts[i].geometry.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}

// Boîte déjà placée (x, y, z = centre)
export function boxAt(w, h, d, x = 0, y = 0, z = 0) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}

// Texture dessinée dans un canevas (couleurs sRGB)
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
