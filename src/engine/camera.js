// Caméra de match, façon retransmission télé : elle filme depuis le côté du terrain et suit le ballon
// en douceur, en regardant un peu devant lui.
import * as THREE from 'three';
import { PITCH } from '../config.js';

// height, dist : position de la caméra ; look : point visé dans la largeur = base + ballon × follow (entre min et max).
// Le point visé est décalé vers le côté proche : la caméra voit loin derrière ce point, mais peu devant.
// Normale : presque toute la largeur visible ; Large : tout le terrain en largeur ; Proche : joueurs plus grands.
// edge : la caméra s'arrête à cette distance des lignes de but (plus de pelouse, moins de tribune).
export const CAMERA_PRESETS = {
  close:  { label: 'Proche', height: 18, dist: 24, fov: 40, base: 6, follow: 0.8, min: -12, max: 24, edge: 8 },
  normal: { label: 'Normale', height: 20, dist: 30, fov: 42, base: 14, follow: 0.35, min: 2, max: 26, edge: 16 },
  wide:   { label: 'Large', height: 28, dist: 36, fov: 45, base: 20, follow: 0.15, min: 14, max: 24, edge: 24 },
};

export class MatchCamera {
  constructor(camera, preset) {
    this.camera = camera;
    this.focus = new THREE.Vector3();
    this.snap = true;
    this.setPreset(preset);
  }
  setPreset(name) {
    this.preset = CAMERA_PRESETS[name] ? name : 'normal';
    this.camera.fov = CAMERA_PRESETS[this.preset].fov;
    this.camera.updateProjectionMatrix();
  }
  // Pendant le match : suit le ballon (et regarde un peu dans le sens où il va)
  update(dt, ball) {
    const p = CAMERA_PRESETS[this.preset];
    const aspect = this.camera.aspect;
    const pull = aspect < 1.5 ? 1.5 / Math.max(aspect, 0.45) : 1;  // écran étroit : on recule
    const fx = THREE.MathUtils.clamp(ball.pos.x + ball.vel.x * 0.35, -PITCH.halfL + p.edge, PITCH.halfL - p.edge);
    const fz = THREE.MathUtils.clamp(p.base + ball.pos.z * p.follow, p.min, p.max);
    const k = this.snap ? 1 : 1 - Math.exp(-dt * 2.8);
    this.snap = false;
    this.focus.x += (fx - this.focus.x) * k;
    this.focus.z += (fz - this.focus.z) * k * 0.8;
    this.camera.position.set(this.focus.x, p.height * pull, this.focus.z + p.dist * pull);
    this.camera.lookAt(this.focus.x, 0, this.focus.z);
  }
  // Au menu : lent travelling au-dessus du stade
  overview(t) {
    this.camera.position.set(Math.sin(t * 0.07) * 34, 24, 50);
    this.camera.lookAt(0, 0, -2);
    this.snap = true;
  }
}
