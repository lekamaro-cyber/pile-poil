// Caméra de match, façon retransmission télé : elle filme depuis le côté du terrain et suit le ballon
// en douceur, en regardant un peu devant lui.
import * as THREE from 'three';
import { PITCH } from '../config.js';

export const CAMERA_PRESETS = {
  close:  { label: 'Proche', height: 10, dist: 19, fov: 36 },
  normal: { label: 'Normale', height: 13, dist: 26, fov: 35 },
  wide:   { label: 'Large', height: 19, dist: 34, fov: 36 },
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
    const fx = THREE.MathUtils.clamp(ball.pos.x + ball.vel.x * 0.35, -PITCH.halfL + 8, PITCH.halfL - 8);
    const fz = THREE.MathUtils.clamp(ball.pos.z * 0.45 + ball.vel.z * 0.1, -PITCH.halfW * 0.5, PITCH.halfW * 0.5);
    const k = this.snap ? 1 : 1 - Math.exp(-dt * 2.8);
    this.snap = false;
    this.focus.x += (fx - this.focus.x) * k;
    this.focus.z += (fz - this.focus.z) * k * 0.8;
    this.camera.position.set(this.focus.x, p.height * pull, this.focus.z + p.dist * pull);
    this.camera.lookAt(this.focus.x, 0, this.focus.z - 3);
  }
  // Au menu : lent travelling au-dessus du stade
  overview(t) {
    this.camera.position.set(Math.sin(t * 0.07) * 34, 24, 50);
    this.camera.lookAt(0, 0, -2);
    this.snap = true;
  }
}
