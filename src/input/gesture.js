// Gestes au doigt pour les coups de pied arrêtés :
//  - « draw » : tracer la trajectoire du ballon (le doigt part du ballon et va jusqu'au but) ;
//  - « swipe » : glisser pour faire plonger le gardien (ou toucher l'écran pour sauter sur place).
// Le tracé est dessiné en direct sur un calque transparent, puis s'efface doucement. Marche aussi à la souris.
import { SETPIECE } from '../config.js';
import { pathLength } from '../physics/trajectoryFit.js';

const $ = (id) => document.getElementById(id);

export class Gesture {
  constructor() {
    this.zone = $('gestureZone');
    this.canvas = $('drawLayer');
    this.g = this.canvas.getContext('2d');
    this.mode = null;
    this.id = null;
    this.pts = null;
    this.t0 = 0;
    this.trails = [];         // lignes affichées : { pts, kind: 'finger' | 'fit', alpha, fade }
    this.onStroke = null;     // (points, durée en ms) : tracé terminé
    this.onSwipe = null;      // (dx, dy, durée en ms) : glissé terminé (dx, dy en pixels)
    this.onShort = null;      // tracé trop court
    this.dirty = true;
    this.bind();
  }

  bind() {
    const z = this.zone;
    z.addEventListener('pointerdown', (e) => {
      if (!this.mode || this.id !== null) return;
      e.preventDefault();
      this.id = e.pointerId;
      try { z.setPointerCapture(e.pointerId); } catch (err) { /* déjà capturé */ }
      this.pts = [[e.clientX, e.clientY]];
      this.t0 = performance.now();
      if (this.mode === 'draw') {
        this.trails = this.trails.filter((t) => t.kind !== 'finger');
        this.live = { pts: this.pts, kind: 'finger', alpha: 1, fade: 0 };
        this.trails.push(this.live);
      }
      this.dirty = true;
    });
    z.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.id) return;
      const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const c of (list.length ? list : [e])) {
        const last = this.pts[this.pts.length - 1];
        if (Math.hypot(c.clientX - last[0], c.clientY - last[1]) >= 2) this.pts.push([c.clientX, c.clientY]);
      }
      this.dirty = true;
    });
    const end = (e) => {
      if (e.pointerId !== this.id) return;
      const pts = this.pts, ms = performance.now() - this.t0, mode = this.mode;
      this.id = null;
      this.pts = null;
      if (this.live) this.live.fade = 1.2;
      this.live = null;
      this.dirty = true;
      if (e.type === 'pointercancel' || !pts) return;
      if (mode === 'draw') {
        if (pathLength(pts) >= SETPIECE.drawMin) {
          if (this.onStroke) this.onStroke(pts, ms);
        } else if (this.onShort) {
          this.onShort();
        }
      } else if (mode === 'swipe' && this.onSwipe) {
        const a = pts[0], b = pts[pts.length - 1];
        this.onSwipe(b[0] - a[0], b[1] - a[1], ms);
      }
    };
    z.addEventListener('pointerup', end);
    z.addEventListener('pointercancel', end);
  }

  // 'draw', 'swipe' ou null (gestes ignorés)
  setMode(m) {
    this.mode = m;
    this.zone.hidden = !m;
    if (!m) {
      this.id = null;
      this.pts = null;
      this.live = null;
    }
  }

  // Trajectoire calculée (pointillés jaunes), affichée pendant l'élan du tireur
  showFit(pts) {
    this.trails = this.trails.filter((t) => t.kind !== 'fit');
    if (pts && pts.length > 1) this.trails.push({ pts, kind: 'fit', alpha: 1, fade: 0 });
    this.dirty = true;
  }
  fadeAll(time = 0.5) {
    for (const t of this.trails) if (!t.fade) t.fade = time;
    this.dirty = true;
  }
  clear() {
    this.trails = [];
    this.dirty = true;
  }

  // À chaque image : effacement progressif et dessin
  frame(dt) {
    for (const t of this.trails) {
      if (t.fade > 0) {
        t.alpha -= dt / t.fade;
        this.dirty = true;
      }
    }
    this.trails = this.trails.filter((t) => t.alpha > 0);
    if (!this.dirty) return;
    this.dirty = false;
    const c = this.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    const g = this.g;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const t of this.trails) {
      if (t.pts.length < 2) continue;
      g.globalAlpha = Math.max(0, Math.min(1, t.alpha));
      g.beginPath();
      g.moveTo(t.pts[0][0], t.pts[0][1]);
      for (let i = 1; i < t.pts.length; i++) g.lineTo(t.pts[i][0], t.pts[i][1]);
      if (t.kind === 'finger') {
        g.setLineDash([]);
        g.strokeStyle = 'rgba(8, 19, 31, 0.55)';
        g.lineWidth = 9;
        g.stroke();
        g.strokeStyle = '#FFFFFF';
        g.lineWidth = 5;
        g.stroke();
      } else {
        g.setLineDash([3, 9]);
        g.strokeStyle = '#FFE45C';
        g.lineWidth = 4;
        g.stroke();
        g.setLineDash([]);
      }
    }
    g.globalAlpha = 1;
  }
}
