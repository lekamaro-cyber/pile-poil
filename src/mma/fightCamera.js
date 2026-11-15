// Caméra du combat : vue de côté, comme à la télévision. Elle reste perpendiculaire à l'axe entre les deux
// combattants, recule quand ils s'éloignent, et passe de l'autre côté seulement s'ils tournent beaucoup.
import * as THREE from 'three';

export const VIEWS = { close: { label: 'Proche', dist: 3.2, height: 1.55 }, wide: { label: 'Large', dist: 4.6, height: 2.1 } };

export class FightCamera {
  constructor(camera) {
    this.camera = camera;
    this.side = 1;
    this.pos = new THREE.Vector3(0, 2, 6);
    this.look = new THREE.Vector3(0, 1, 0);
    this.view = 'close';
    this.snap = true;
  }
  update(dt, a, b) {
    const v = VIEWS[this.view] || VIEWS.close;
    const mx = (a.pos.x + b.pos.x) / 2, mz = (a.pos.z + b.pos.z) / 2;
    let ax = b.pos.x - a.pos.x, az = b.pos.z - a.pos.z;
    const sep = Math.hypot(ax, az) || 1;
    ax /= sep;
    az /= sep;
    // Perpendiculaire à l'axe, du côté où se trouve déjà la caméra (pas de saut brusque)
    let px = -az, pz = ax;
    const cx = this.pos.x - mx, cz = this.pos.z - mz;
    if (px * cx + pz * cz < 0) {
      px = -px;
      pz = -pz;
    }
    const ground = a.ground || a.state === 'ko' || b.state === 'ko';
    const dist = v.dist + sep * 0.75 + (ground ? 0.3 : 0);
    const tx = mx + px * dist, ty = v.height + (ground ? -0.35 : 0) + sep * 0.1, tz = mz + pz * dist;
    const k = this.snap ? 1 : 1 - Math.exp(-dt * 4);
    this.snap = false;
    this.pos.x += (tx - this.pos.x) * k;
    this.pos.y += (ty - this.pos.y) * k;
    this.pos.z += (tz - this.pos.z) * k;
    this.look.x += (mx - this.look.x) * k;
    this.look.y += ((ground ? 0.55 : 1.05) - this.look.y) * k;
    this.look.z += (mz - this.look.z) * k;
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
  }
  // Menu : lent travelling autour de la cage
  overview(t) {
    this.camera.position.set(Math.cos(t * 0.12) * 8.5, 3.2, Math.sin(t * 0.12) * 8.5);
    this.camera.lookAt(0, 0.9, 0);
    this.snap = true;
  }
  // Droite de l'écran et « vers le fond » de l'écran, au sol (pour le joystick)
  basis() {
    const e = this.camera.matrixWorld.elements;
    let rx = e[0], rz = e[2], fx = -e[8], fz = -e[10];
    const rl = Math.hypot(rx, rz) || 1, fl = Math.hypot(fx, fz) || 1;
    rx /= rl;
    rz /= rl;
    fx /= fl;
    fz /= fl;
    return { rx, rz, fx, fz };
  }
}
