// Physique du ballon : gravité, résistance de l'air, rebonds, frottement au sol, poteaux, barre et filets.
// Le calcul est découpé en petits pas quand le ballon va vite, pour qu'il ne traverse jamais un poteau.
import { BALL, PITCH } from '../config.js';

const R = BALL.radius;
const HALF_GOAL = PITCH.goalWidth / 2;

export function stepBall(ball, dt) {
  if (ball.owner) return;
  const speed = ball.vel.length();
  const n = Math.min(16, Math.max(1, Math.ceil((speed * dt) / 0.06)));
  for (let i = 0; i < n; i++) integrate(ball, dt / n);
}

function integrate(ball, h) {
  const p = ball.pos, v = ball.vel;
  const sp = v.length();
  if (sp > 1e-4) v.multiplyScalar(Math.max(0, 1 - BALL.drag * sp * h));  // air
  const grounded = p.y <= R + 1e-3 && v.y <= 0.3;
  if (grounded) {
    p.y = R;
    if (v.y < 0) v.y = 0;
    const hs = Math.hypot(v.x, v.z);  // roulement sur l'herbe
    if (hs > 0) {
      const k = Math.max(0, hs - (BALL.rollFriction + BALL.rollDamping * hs) * h) / hs;
      v.x *= k;
      v.z *= k;
    }
  } else {
    v.y -= BALL.gravity * h;
  }
  const prevX = p.x;
  p.addScaledVector(v, h);
  if (p.y < R) {  // rebond
    p.y = R;
    if (v.y < -0.8) {
      v.y = -v.y * BALL.restitution;
      v.x *= BALL.bounceKeep;
      v.z *= BALL.bounceKeep;
    } else {
      v.y = 0;
    }
  }
  goalFrames(ball, prevX);
}

// Rebond sur un cylindre vertical (poteau) dans le plan du sol
function bounceCircle(p, v, cx, cz, minD) {
  const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
  if (d >= minD || d < 1e-6) return;
  const nx = dx / d, nz = dz / d;
  p.x = cx + nx * minD;
  p.z = cz + nz * minD;
  const vn = v.x * nx + v.z * nz;
  if (vn < 0) {
    v.x -= (1 + BALL.postRestitution) * vn * nx;
    v.z -= (1 + BALL.postRestitution) * vn * nz;
  }
}

function goalFrames(ball, prevX) {
  const p = ball.pos, v = ball.vel;
  const H = PITCH.goalHeight, D = PITCH.goalDepth, BH = PITCH.netBackHeight, minD = PITCH.postRadius + R;
  for (const s of [-1, 1]) {
    const gx = s * PITCH.halfL;
    if (Math.abs(p.x - gx) > D + 1) continue;
    // Le ballon franchit la ligne entre les poteaux et sous la barre : il entre dans le but
    if (!ball.inGoal && s * (prevX - gx) <= 0 && s * (p.x - gx) > 0 && Math.abs(p.z) < HALF_GOAL && p.y < H) ball.inGoal = s;
    if (p.y < H + R) {
      bounceCircle(p, v, gx, -HALF_GOAL, minD);
      bounceCircle(p, v, gx, HALF_GOAL, minD);
    }
    if (Math.abs(p.z) < HALF_GOAL + R) {  // barre transversale (cylindre couché le long de z)
      const dx = p.x - gx, dy = p.y - H, d = Math.hypot(dx, dy);
      if (d < minD && d > 1e-6) {
        const nx = dx / d, ny = dy / d;
        p.x = gx + nx * minD;
        p.y = H + ny * minD;
        const vn = v.x * nx + v.y * ny;
        if (vn < 0) {
          v.x -= (1 + BALL.postRestitution) * vn * nx;
          v.y -= (1 + BALL.postRestitution) * vn * ny;
        }
      }
    }
    if (ball.inGoal === s) {  // filets : ils amortissent le ballon, qui reste au fond du but
      const depth = s * (p.x - gx);
      if (depth > 0.3) {
        v.x *= 0.985;
        v.z *= 0.985;
      }
      if (depth > D - R) {
        p.x = gx + s * (D - R);
        if (s * v.x > 0) v.x = -v.x * 0.04;
        v.z *= 0.6;
        v.y *= 0.6;
      }
      if (Math.abs(p.z) > HALF_GOAL - R) {
        p.z = Math.sign(p.z) * (HALF_GOAL - R);
        v.z = -v.z * 0.12;
        v.x *= 0.7;
      }
      const top = H + (BH - H) * Math.min(1, Math.max(0, depth) / D);
      if (p.y > top - R) {
        p.y = top - R;
        if (v.y > 0) v.y = -v.y * 0.15;
      }
      if (depth < -2 * R) ball.inGoal = 0;  // ressorti sans être entré en entier
    }
  }
}

// ---------- Outils pour viser : quelle vitesse donner au ballon pour qu'il arrive où on veut ----------

// Distance parcourue par un ballon qui roule à la vitesse v jusqu'à l'arrêt (tableau calculé une fois)
const STEP = 0.25, VMAX = 45, H_TABLE = 1 / 120;
const ROLL = [];
for (let i = 0; i <= VMAX / STEP; i++) {
  let v = i * STEP, d = 0;
  while (v > 0.05) {
    v = Math.max(0, v - (BALL.drag * v * v + BALL.rollFriction + BALL.rollDamping * v) * H_TABLE);
    d += v * H_TABLE;
  }
  ROLL.push(d);
}
export function rollDistance(v) {
  const f = Math.max(0, v) / STEP, i = Math.floor(f);
  if (i >= ROLL.length - 1) return ROLL[ROLL.length - 1];
  return ROLL[i] + (ROLL[i + 1] - ROLL[i]) * (f - i);
}
// Vitesse de départ d'une passe à terre pour parcourir dist et arriver encore à la vitesse arrive
export function speedForRoll(dist, arrive = 0) {
  const need = dist + rollDistance(arrive);
  let lo = 0, hi = VMAX;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (rollDistance(mid) < need) lo = mid;
    else hi = mid;
  }
  return hi;
}

// Simulation rapide d'un ballon en l'air (sans rebond) ; renvoie la distance au sol et la hauteur à distX
function flight(vh, vy, distX) {
  let x = 0, y = R, vx = vh, vyy = vy, heightAt = null;
  for (let i = 0; i < 1500; i++) {
    const sp = Math.hypot(vx, vyy), k = Math.max(0, 1 - BALL.drag * sp * H_TABLE);
    vx *= k;
    vyy = vyy * k - BALL.gravity * H_TABLE;
    x += vx * H_TABLE;
    y += vyy * H_TABLE;
    if (heightAt === null && distX !== undefined && x >= distX) heightAt = y;
    if (y <= R && vyy < 0) return { land: x, heightAt: heightAt === null ? R : heightAt };
  }
  return { land: x, heightAt: heightAt === null ? y : heightAt };
}

// Ballon lobé (centre, longue passe) : vitesse pour retomber à la distance voulue après environ T secondes
export function lobVelocity(dx, dz, T, out) {
  const dist = Math.hypot(dx, dz) || 1;
  let vh = dist / T;
  const vy = 0.5 * BALL.gravity * T;
  for (let it = 0; it < 4; it++) {
    const { land } = flight(vh, vy);
    if (land < 0.1) break;
    vh *= dist / land;
  }
  return out.set((dx / dist) * vh, vy, (dz / dist) * vh);
}

// Tir : vitesse verticale pour que le ballon passe à la hauteur h quand il a parcouru dist mètres
export function shotLift(speed, dist, h) {
  let t = dist / (speed * 0.85);
  let vy = (h - R) / t + 0.5 * BALL.gravity * t;
  for (let it = 0; it < 3; it++) {
    const got = flight(speed, vy, dist).heightAt;
    vy += (h - got) / Math.max(0.15, t);
  }
  return Math.max(0, vy);
}
