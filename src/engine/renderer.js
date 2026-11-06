// Moteur de rendu 3D (WebGL avec Three.js) et qualité graphique adaptée au téléphone.
import * as THREE from 'three';

// pixelRatio : finesse de l'image (2 = très net, 1 = plus rapide) ; crowd : part des places occupées en tribune
export const QUALITY = {
  auto:   { label: 'Auto', pixelRatio: 2, antialias: true, crowd: 1 },
  high:   { label: 'Haute', pixelRatio: 2, antialias: true, crowd: 1 },
  medium: { label: 'Moyenne', pixelRatio: 1.5, antialias: true, crowd: 0.6 },
  low:    { label: 'Basse', pixelRatio: 1, antialias: false, crowd: 0.3 },
};
export const presetFor = (q) => QUALITY[q] || QUALITY.auto;

export function createRenderer(canvas, quality) {
  const p = presetFor(quality);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: p.antialias, powerPreference: 'high-performance', stencil: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, p.pixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  return renderer;
}

// Qualité « Auto » : si le téléphone n'arrive pas à garder ~55 images par seconde, on baisse la finesse de
// l'image par paliers ; s'il a de la marge pendant plusieurs secondes, on la remonte.
export class AdaptiveQuality {
  constructor(renderer) {
    this.renderer = renderer;
    this.enabled = false;
    this.max = 2;
    this.min = 1;
    this.acc = 0;
    this.frames = 0;
    this.fps = 60;
    this.calm = 0;
  }
  configure(quality) {
    this.enabled = quality === 'auto';
    this.max = Math.max(1, Math.min(window.devicePixelRatio || 1, presetFor(quality).pixelRatio));
    this.min = Math.min(1, this.max);
    this.renderer.setPixelRatio(this.max);
  }
  frame(dt) {
    this.acc += dt;
    this.frames++;
    if (this.acc < 1) return;
    this.fps = this.frames / this.acc;
    this.acc = 0;
    this.frames = 0;
    if (!this.enabled) return;
    const r = this.renderer.getPixelRatio();
    if (this.fps < 52 && r > this.min) {
      this.renderer.setPixelRatio(Math.max(this.min, r - 0.25));
      this.calm = 0;
    } else if (this.fps > 58.5 && r < this.max) {
      if (++this.calm >= 4) {
        this.renderer.setPixelRatio(Math.min(this.max, r + 0.25));
        this.calm = 0;
      }
    } else {
      this.calm = 0;
    }
  }
}
