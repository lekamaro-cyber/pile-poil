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

// ---------- Coups de pied arrêtés ----------
// Caméra derrière le ballon, tournée vers le but. L'angle de vue est calculé pour que le ballon soit en bas de
// l'écran (ballNdc : -1 = tout en bas) et le centre du but un peu au-dessus du milieu (goalNdc), quelle que soit
// la distance : on voit le ballon, le mur, le gardien et tout le but.
export function aimBehindBall(camera, ball, goal, { back = 11, height = 3.6, ballNdc = -0.8, goalNdc = 0.2 } = {}) {
  let dx = goal.x - ball.x, dz = goal.z - ball.z;
  const dist = Math.hypot(dx, dz) || 1;
  dx /= dist;
  dz /= dist;
  const cx = ball.x - dx * back, cz = ball.z - dz * back;
  const aBall = Math.atan2(ball.y - height, back);
  const aGoal = Math.atan2(goal.y - height, dist + back);
  // Inclinaison p de la caméra : tan(aBall - p) / t = ballNdc et tan(aGoal - p) / t = goalNdc (t = tan(demi-angle))
  const g = (p) => Math.tan(aBall - p) - (ballNdc * Math.tan(aGoal - p)) / goalNdc;
  let lo = aBall + 1e-4, hi = aGoal - 1e-4;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) lo = mid;
    else hi = mid;
  }
  const p = (lo + hi) / 2;
  const t = Math.tan(aGoal - p) / goalNdc;
  camera.fov = THREE.MathUtils.clamp((2 * Math.atan(t) * 180) / Math.PI, 30, 64);
  camera.updateProjectionMatrix();
  camera.position.set(cx, height, cz);
  camera.lookAt(cx + dx * Math.cos(p) * 10, height + Math.sin(p) * 10, cz + dz * Math.cos(p) * 10);
  camera.updateMatrixWorld();
}

// Caméra derrière le but (tu joues le gardien) : on voit le gardien de dos, le tireur et le point de penalty
export function aimBehindGoal(camera, gx, spotX) {
  camera.fov = 30;
  camera.updateProjectionMatrix();
  camera.position.set(gx + 8, 3.4, 0);
  camera.lookAt(spotX + 1, 0.9, 0);
  camera.updateMatrixWorld();
}
