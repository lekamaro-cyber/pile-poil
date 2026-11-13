// Intelligence des coups de pied arrêtés : placement du mur et du gardien, réactions du gardien après la frappe
// (il voit le ballon partir, prévoit où il va passer, se déplace puis plonge), et tirs au but de l'ordinateur.
import { PITCH, KEEPER, SETPIECE } from '../config.js';

const DRAG = SETPIECE.diveDrag;
import { crossing } from '../physics/trajectoryFit.js';

const GX = PITCH.halfL;
const HALF_GOAL = PITCH.goalWidth / 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;

// ---------- Placement ----------
// Mur : le joueur du bout couvre le poteau le plus proche du ballon (un peu à l'extérieur), les autres se
// serrent vers le centre du but. Tous à 9,15 m du ballon. Renvoie les positions {x, z}.
export function wallLayout(ball, n) {
  if (n <= 0) return [];
  const near = ball.z < -0.3 ? -1 : ball.z > 0.3 ? 1 : -1;  // côté du poteau proche (au centre : le gauche)
  const outZ = near * (HALF_GOAL + 0.3);
  const D = SETPIECE.wallDistance;
  const a0 = Math.atan2(outZ - ball.z, GX - ball.x), step = SETPIECE.wallSpacing / D;
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 - near * step * i;
    out.push({ x: ball.x + Math.cos(a) * D, z: ball.z + Math.sin(a) * D });
  }
  return out;
}

// Gardien : au penalty, sur sa ligne au centre ; au coup franc, il couvre la partie du but que le mur ne cache
// pas (côté du second poteau), un peu devant sa ligne.
export function keeperSpot(ball, wall, kind) {
  if (kind === 'penalty') return { x: GX - 0.12, z: 0 };
  const x = GX - 0.7;
  let open0 = -HALF_GOAL, open1 = HALF_GOAL;  // partie du but que le tireur voit
  for (const w of wall) {
    for (const off of [-0.3, 0.3]) {  // épaules de chaque joueur du mur, prolongées jusqu'à la ligne de but
      const k = (GX - ball.x) / ((w.x - ball.x) || 1e-6);
      const z = ball.z + (w.z + off - ball.z) * k;
      if (ball.z <= 0) open0 = Math.max(open0, Math.min(HALF_GOAL, z));
      else open1 = Math.min(open1, Math.max(-HALF_GOAL, z));
    }
  }
  if (!wall.length) {  // sans mur : au milieu de l'angle de tir
    const a1 = Math.atan2(-HALF_GOAL - ball.z, GX - ball.x), a2 = Math.atan2(HALF_GOAL - ball.z, GX - ball.x);
    const a = (a1 + a2) / 2;
    return { x, z: clamp(ball.z + Math.tan(a) * (x - ball.x), -HALF_GOAL + 0.6, HALF_GOAL - 0.6) };
  }
  const mid = ball.z <= 0 ? open0 + (open1 - open0) * 0.45 : open1 + (open0 - open1) * 0.45;
  return { x, z: clamp(mid, -HALF_GOAL + 0.6, HALF_GOAL - 0.6) };
}

// ---------- Plongeon : vers un point (z, hauteur y) à atteindre dans tLeft secondes ----------
// Le corps bascule vers le ballon (roll), le gardien saute si le ballon est haut, et sa vitesse sur le côté est
// celle qu'il faut pour que ses mains arrivent à temps (dans la limite de ce qu'il peut faire).
export function diveTo(k, z, y, tLeft, mult = 1) {
  const side = Math.sign(z - k.pos.z) || 1;
  const D = Math.abs(z - k.pos.z);
  const roll = clamp(Math.atan2(D, Math.max(0.15, y - 0.7)), 0.3, 1.45);
  const handLat = 1.05 * Math.sin(roll), handUp = 1.05 * Math.cos(roll);
  const L = Math.max(0, D - handLat);
  const hips = 0.25 + 0.7 * Math.cos(roll);  // hauteur des hanches pendant le plongeon (sans saut)
  const V = y - (hips + handUp);
  const up = V > 0 ? Math.min(3.8, Math.sqrt(2 * 9.81 * V) + 0.4) : 0;
  const T = Math.max(0.15, tLeft - 0.04);
  const S = Math.min(KEEPER.diveSpeed * mult, (L * DRAG) / (1 - Math.exp(-DRAG * T)) + 0.4);
  k.dive(side, S, roll, up, 1.3);
}

// ---------- Le gardien de l'ordinateur ----------
// level : réglages de SET_LEVELS ; kind : 'freekick' ou 'penalty' ; history : côtés de tes penalties
export class KeeperBrain {
  constructor(keeper, level, kind, spot, history) {
    this.k = keeper;
    this.level = level;
    this.kind = kind;
    this.spot = spot;
    this.history = history;
    this.t = 0;
    this.kicked = false;
    this.done = false;
    this.guess = null;
  }
  onKick() {
    this.kicked = true;
    this.t = 0;
    // Au penalty, le gardien choisit souvent un côté au moment de la frappe (il n'a pas le temps de réagir à
    // un tir placé). Il retient les côtés où tu tires (learn).
    if (this.kind === 'penalty' && Math.random() < this.level.guess) {
      const h = this.history, learn = this.level.learn;
      const pLeft = (1 - learn) * 0.5 + learn * ((h.left + 1) / (h.left + h.right + 2));
      const side = Math.random() < pLeft ? -1 : 1;
      const r = Math.random();
      this.guess = { z: side * (1.9 + Math.random() * 1.2), y: r < 0.55 ? 0.45 : r < 0.85 ? 1.1 : 1.8 };
    }
  }
  update(dt, ball) {
    const k = this.k;
    if (!this.kicked) {  // avant la frappe : en place, face au ballon
      k.moveTo(this.spot.x, this.spot.z, 2.5, 0.06);
      k.face(ball.pos.x, ball.pos.z);
      return;
    }
    this.t += dt;
    if (this.done || k.state === 'dive') return;
    k.face(ball.pos.x, ball.pos.z);
    if (this.guess && this.t >= 0.05) {  // il a choisi son côté
      diveTo(k, this.guess.z, this.guess.y, 0.45, this.level.dive);
      this.done = true;
      return;
    }
    if (this.t < this.level.reaction || ball.held) {
      k.move(0, 0, 0);
      return;
    }
    // Où le ballon va-t-il passer ? (il ne voit qu'une partie de l'effet : spinRead)
    const sr = this.level.spinRead;
    const c = crossing(ball.pos, ball.vel, { x: ball.spin.x * sr, y: ball.spin.y * sr, z: ball.spin.z * sr }, k.pos.x, 1.6);
    if (!c.crossed || ball.vel.x <= 0.5) {  // le ballon ne vient pas (contré par le mur, trop court…)
      k.move(0, 0, 0);
      return;
    }
    if (Math.abs(c.z) > HALF_GOAL + 0.5 || c.y > PITCH.goalHeight + 0.4) {  // il le voit passer à côté
      k.move(0, 0, 0);
      return;
    }
    const dz = c.z - k.pos.z;
    if (Math.abs(dz) < 0.7 && c.y < 2.25) {  // à portée de mains : il se recentre
      k.move(0, dz, Math.min(this.level.shuffle, Math.abs(dz) * 6));
      return;
    }
    // Plonger maintenant, ou se rapprocher en pas chassés ?
    const reach = 1.0, S = KEEPER.diveSpeed * this.level.dive;
    const lat = Math.max(0, Math.abs(dz) - reach);
    const tNeed = lat > 0 ? -Math.log(Math.max(0.02, 1 - (lat * DRAG) / S)) / DRAG : 0.1;
    if (c.t <= tNeed + 0.12 || c.t < 0.32) {
      diveTo(k, c.z, c.y, c.t, this.level.dive);
      this.done = true;
    } else {
      k.move(0, dz, this.level.shuffle);
    }
  }
}

// ---------- Penalty tiré par l'ordinateur ----------
// Choix du coin (avant la course d'élan) ; l'imprécision est ajoutée au moment de la frappe.
export function penaltyPlan() {
  const r = Math.random();
  const side = r < 0.44 ? -1 : r < 0.88 ? 1 : 0;
  const high = Math.random() < 0.38;
  return {
    side,
    z: side === 0 ? (Math.random() - 0.5) * 0.9 : side * (2.0 + Math.random() * 1.3),
    y: high ? 1.45 + Math.random() * 0.75 : 0.2 + Math.random() * 0.45,
    speed: 21 + Math.random() * 7,
  };
}
// Juste avant de frapper, le tireur regarde le gardien : s'il plonge trop tôt, il peut tirer de l'autre côté
export function penaltyAdjust(plan, keeperDiveSide, level) {
  if (keeperDiveSide && Math.random() < level.read) {
    return { side: -keeperDiveSide, z: -keeperDiveSide * (1.4 + Math.random() * 1.2), y: 0.3 + Math.random() * 0.4, speed: plan.speed };
  }
  return plan;
}
export function penaltyError(plan, level) {
  return { z: plan.z + gauss() * level.kickError, y: Math.max(0.12, plan.y + gauss() * level.kickError * 0.6) };
}
