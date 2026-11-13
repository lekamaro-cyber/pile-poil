// Physique du ballon : gravité, résistance de l'air, effet (rotation du ballon : effet Magnus), rebonds, frottement
// au sol, poteaux, barre et filets. Le calcul est découpé en petits pas quand le ballon va vite, pour qu'il ne
// traverse jamais un poteau.
import { BALL, PITCH, SPIN } from '../config.js';

const R = BALL.radius;
const HALF_GOAL = PITCH.goalWidth / 2;

// Le ballon roule librement même au pied d'un joueur (conduite par petites touches) ; seul le gardien qui le
// tient dans les mains l'immobilise (ball.held).
export function stepBall(ball, dt) {
  if (ball.held) return;
  const speed = ball.vel.length();
  const n = Math.min(16, Math.max(1, Math.ceil((speed * dt) / 0.06)));
  for (let i = 0; i < n; i++) integrate(ball, dt / n);
}

// Un petit pas de calcul (sans les buts) : forces, déplacement, rebond sur la pelouse.
// p, v : position et vitesse ; w : rotation du ballon (radians par seconde, axe = direction du vecteur).
// Le même calcul sert au vrai ballon et aux prévisions (tracé au doigt, gardien) : ils suivent la même physique.
// air : prévision « en vol seulement », sans pelouse (sert à viser : le calcul reste régulier).
export function moveBall(p, v, w, h, air = false) {
  const sp = Math.hypot(v.x, v.y, v.z);
  if (sp > 1e-4) {  // air
    const k = Math.max(0, 1 - BALL.drag * sp * h);
    v.x *= k;
    v.y *= k;
    v.z *= k;
  }
  const grounded = !air && p.y <= R + 1e-3 && v.y <= 0.3;
  if (grounded) {
    p.y = R;
    if (v.y < 0) v.y = 0;
    const hs = Math.hypot(v.x, v.z);  // roulement sur l'herbe
    if (hs > 0) {
      const k = Math.max(0, hs - (BALL.rollFriction + BALL.rollDamping * hs) * h) / hs;
      v.x *= k;
      v.z *= k;
    }
    if (w.x || w.y || w.z) {  // au sol, l'herbe freine vite la rotation
      const k = Math.max(0, 1 - SPIN.rollDecay * h);
      w.x *= k;
      w.y *= k;
      w.z *= k;
    }
  } else {
    if (w.x || w.y || w.z) {
      // Effet Magnus : le ballon qui tourne est poussé sur le côté (rotation × vitesse). Effet sur le côté : il
      // tourne à gauche ou à droite ; effet coupé (vers l'avant) : il plonge ; rétro : il flotte.
      const m = SPIN.magnus * h;
      const ax = w.y * v.z - w.z * v.y, ay = w.z * v.x - w.x * v.z, az = w.x * v.y - w.y * v.x;
      v.x += ax * m;
      v.y += ay * m;
      v.z += az * m;
      const k = Math.max(0, 1 - SPIN.decay * h);
      w.x *= k;
      w.y *= k;
      w.z *= k;
    }
    v.y -= BALL.gravity * h;
  }
  p.x += v.x * h;
  p.y += v.y * h;
  p.z += v.z * h;
  if (p.y < R && !air) {  // rebond
    p.y = R;
    if (v.y < -0.8) {
      v.y = -v.y * BALL.restitution;
      v.x *= BALL.bounceKeep;
      v.z *= BALL.bounceKeep;
      w.x *= SPIN.bounceKeep;
      w.y *= SPIN.bounceKeep;
      w.z *= SPIN.bounceKeep;
    } else {
      v.y = 0;
    }
  }
}

function integrate(ball, h) {
  const prevX = ball.pos.x;
  moveBall(ball.pos, ball.vel, ball.spin, h);
  goalFrames(ball, prevX);
}

// Prévision : vol d'un ballon (sans poteaux ni joueurs), par pas de h secondes. visit(x, y, z, t) est appelé à
// chaque pas ; la simulation s'arrête quand visit renvoie true ou après maxT secondes.
export function simulate(pos, vel, spin, h, maxT, visit, air = false) {
  const p = { x: pos.x, y: pos.y, z: pos.z }, v = { x: vel.x, y: vel.y, z: vel.z };
  const w = spin ? { x: spin.x, y: spin.y, z: spin.z } : { x: 0, y: 0, z: 0 };
  for (let t = h; t <= maxT + 1e-9; t += h) {
    moveBall(p, v, w, h, air);
    if (visit(p.x, p.y, p.z, t, v)) return;
  }
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
    return true;
  }
  return false;
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
      if (bounceCircle(p, v, gx, -HALF_GOAL, minD) || bounceCircle(p, v, gx, HALF_GOAL, minD)) ball.frameHits++;
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
          ball.frameHits++;
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
