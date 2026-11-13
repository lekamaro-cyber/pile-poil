// Tir au doigt : le joueur dessine sur l'écran la trajectoire qu'il veut donner au ballon, et ce module cherche
// la vraie frappe (vitesse, direction, effet) dont la trajectoire, vue par la caméra, ressemble le plus au tracé.
// Le ballon suit ensuite la vraie physique (gravité, air, effet Magnus) : un tracé impossible (trop courbé, trop
// lent…) donne la frappe réaliste la plus proche, pas une trajectoire truquée.
// Ce module n'utilise pas Three.js : la caméra arrive sous forme de deux fonctions (project et ray).
import { BALL, SHOT, SPIN } from '../config.js';
import { simulate } from './ballPhysics.js';

const H = 1 / 240;   // pas de calcul des prévisions (s)
const N = 24;        // nombre de points comparés entre le tracé et la trajectoire
const MAX_T = 3;     // durée maximale d'un vol prévu (s)
export const LIMITS = { minSpeed: 8, maxSpeed: SHOT.maxSpeed, minElev: -0.03, maxElev: 0.85 };

// ---------- La caméra sans Three.js (pour le calcul en arrière-plan) ----------
// pv : matrice projection × vue (16 nombres, rangés par colonnes comme dans Three.js), ipv : son inverse,
// pos : position de la caméra, w, h : taille de l'écran en pixels CSS.
export function makeView({ pv, ipv, pos, w, h }) {
  const m = pv, n = ipv;
  const project = (x, y, z, out) => {
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.01) return false;
    out[0] = ((m[0] * x + m[4] * y + m[8] * z + m[12]) / cw + 1) * 0.5 * w;
    out[1] = (1 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / cw) * 0.5 * h;
    return true;
  };
  const ray = (sx, sy) => {
    const nx = (sx / w) * 2 - 1, ny = 1 - (sy / h) * 2, nz = 0.5;
    const W = n[3] * nx + n[7] * ny + n[11] * nz + n[15];
    let dx = (n[0] * nx + n[4] * ny + n[8] * nz + n[12]) / W - pos.x;
    let dy = (n[1] * nx + n[5] * ny + n[9] * nz + n[13]) / W - pos.y;
    let dz = (n[2] * nx + n[6] * ny + n[10] * nz + n[14]) / W - pos.z;
    const L = Math.hypot(dx, dy, dz) || 1;
    dx /= L;
    dy /= L;
    dz /= L;
    return { o: { x: pos.x, y: pos.y, z: pos.z }, d: { x: dx, y: dy, z: dz } };
  };
  return { project, ray };
}

// ---------- Outils sur les lignes dessinées (tableaux de [x, y] en pixels) ----------
export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

// n points également espacés le long de la ligne
export function resample(pts, n, out = []) {
  const L = pathLength(pts);
  out.length = n;
  if (pts.length === 1 || L < 1e-6) {
    for (let i = 0; i < n; i++) out[i] = [pts[0][0], pts[0][1]];
    return out;
  }
  let seg = 1, acc = 0, segLen = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  for (let i = 0; i < n; i++) {
    const want = (L * i) / (n - 1);
    while (seg < pts.length - 1 && acc + segLen < want) {
      acc += segLen;
      seg++;
      segLen = Math.hypot(pts[seg][0] - pts[seg - 1][0], pts[seg][1] - pts[seg - 1][1]);
    }
    const t = segLen > 1e-9 ? Math.min(1, Math.max(0, (want - acc) / segLen)) : 0;
    const a = pts[seg - 1], b = pts[seg];
    out[i] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  return out;
}

// Lissage léger (le doigt tremble un peu)
function smoothPath(pts) {
  if (pts.length < 4) return pts.map((q) => [q[0], q[1]]);
  const out = [[pts[0][0], pts[0][1]]];
  for (let i = 1; i < pts.length - 1; i++) {
    out.push([(pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4]);
  }
  out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
  return out;
}

// Le tracé commence là où le doigt s'est posé, pas forcément pile sur le ballon : on déforme seulement le début
// du tracé (le premier tiers) pour qu'il parte du ballon. Le reste de la forme et le point d'arrivée (l'endroit
// visé) restent exactement là où le doigt est passé.
function anchor(pts, ballX, ballY) {
  const L = pathLength(pts) || 1;
  const dx = ballX - pts[0][0], dy = ballY - pts[0][1];
  let acc = 0;
  return pts.map((q, i) => {
    if (i > 0) acc += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]);
    const k = Math.max(0, 1 - acc / (L * 0.33)) ** 2;
    return [q[0] + dx * k, q[1] + dy * k];
  });
}

// ---------- Frappe : paramètres → vitesse et rotation de départ ----------
// q = [vitesse (m/s), élévation (rad), direction (rad, 0 = vers +x), effet sur le côté, effet coupé (rad/s)]
export function launch(q, vel, spin) {
  const [s, e, a, side, top] = q;
  const ce = Math.cos(e), ca = Math.cos(a), sa = Math.sin(a);
  vel.x = s * ce * ca;
  vel.y = s * Math.sin(e);
  vel.z = s * ce * sa;
  // effet sur le côté : axe vertical ; effet coupé : axe horizontal, perpendiculaire à la direction du tir
  spin.x = top * sa;
  spin.y = side;
  spin.z = -top * ca;
}

function clampQ(q) {
  return [
    Math.min(LIMITS.maxSpeed, Math.max(LIMITS.minSpeed, q[0])),
    Math.min(LIMITS.maxElev, Math.max(LIMITS.minElev, q[1])),
    q[2],
    Math.min(SPIN.maxSide, Math.max(-SPIN.maxSide, q[3])),
    Math.min(SPIN.maxTop, Math.max(-SPIN.maxBack, q[4])),
  ];
}

// Où le ballon passe-t-il le plan x = planeX (la ligne de but) ? Renvoie { y, z, t, crossed }.
// air : sans tenir compte de la pelouse (vol seulement), pour viser.
export function crossing(start, vel, spin, planeX, maxT = MAX_T, air = false) {
  let px = start.x, py = start.y, pz = start.z, pt = 0, res = null;
  simulate(start, vel, spin, H, maxT, (x, y, z, t) => {
    if (x >= planeX) {
      const k = (planeX - px) / ((x - px) || 1e-9);
      res = { y: py + (y - py) * k, z: pz + (z - pz) * k, t: pt + (t - pt) * k, crossed: true };
      return true;
    }
    px = x; py = y; pz = z; pt = t;
    return false;
  }, air);
  return res || { y: py, z: pz, t: pt, crossed: false };
}

// Visée : direction et élévation pour qu'un tir à la vitesse speed (avec l'effet side, top) passe par le point
// target (dans le plan x = target.x). Méthode de Newton ; guess = [élévation, direction] d'un calcul voisin.
export function solveAim(start, target, speed, side = 0, top = 0, guess = null) {
  const dx = target.x - start.x, dz = target.z - start.z, dist = Math.hypot(dx, dz) || 1;
  const t0 = dist / (speed * 0.9);
  let e = guess ? guess[0] : Math.atan2(target.y - start.y + 0.5 * BALL.gravity * t0 * t0, dist);
  let a = guess ? guess[1] : Math.atan2(dz, dx);
  const vel = { x: 0, y: 0, z: 0 }, spin = { x: 0, y: 0, z: 0 };
  const at = (ee, aa) => {
    launch([speed, ee, aa, side, top], vel, spin);
    return crossing(start, vel, spin, target.x, MAX_T, true);
  };
  let c = at(e, a);
  for (let it = 0; it < 6; it++) {
    const ey = target.y - c.y, ez = target.z - c.z;
    if (Math.abs(ey) < 0.015 && Math.abs(ez) < 0.015) break;
    const d = 0.002, ce = at(e + d, a), ca = at(e, a + d);
    const j11 = (ce.y - c.y) / d, j12 = (ca.y - c.y) / d, j21 = (ce.z - c.z) / d, j22 = (ca.z - c.z) / d;
    const det = j11 * j22 - j12 * j21;
    if (Math.abs(det) < 1e-9) break;
    e += Math.max(-0.3, Math.min(0.3, (ey * j22 - ez * j12) / det));
    a += Math.max(-0.3, Math.min(0.3, (ez * j11 - ey * j21) / det));
    e = Math.min(LIMITS.maxElev, Math.max(LIMITS.minElev, e));
    c = at(e, a);
  }
  return { q: [speed, e, a, side, top], hit: c, miss: Math.hypot(target.y - c.y, target.z - c.z) };
}

// ---------- Le tracé au doigt → la frappe ----------
// start : position du ballon {x, y, z} ; path : points du doigt [[x, y], …] en pixels ;
// project(x, y, z, out) : écrit dans out = [x, y] la position à l'écran (renvoie false si derrière la caméra) ;
// ray(x, y) : { o, d } rayon de la caméra qui passe par ce pixel ; goalX : ligne de but visée (le tir va vers +x).
export function fitShot({ start, path, project, ray, goalX }) {
  const b = [0, 0];
  project(start.x, start.y, start.z, b);
  const drawn = resample(anchor(smoothPath(path), b[0], b[1]), N);
  const end = drawn[N - 1];

  // Point visé : là où le rayon du doigt levé coupe la ligne de but (ou la pelouse devant le but)
  const r = ray(end[0], end[1]);
  let target;
  if (r.d.x > 1e-4 && r.o.x < goalX) {
    const k = (goalX - r.o.x) / r.d.x;
    target = { x: goalX, y: r.o.y + r.d.y * k, z: r.o.z + r.d.z * k };
  } else {
    target = { x: goalX, y: 1, z: start.z };
  }
  target.y = Math.min(14, Math.max(BALL.radius, target.y));
  target.z = Math.min(30, Math.max(-30, target.z));

  // Trajectoire vue de la caméra pour des paramètres q, comparée au tracé (points à la même fraction de longueur)
  const vel = { x: 0, y: 0, z: 0 }, spin = { x: 0, y: 0, z: 0 }, scr = [0, 0];
  const sim = [], samp = [];
  const trace = (q) => {
    launch(q, vel, spin);
    sim.length = 0;
    sim.push([b[0], b[1]]);
    let px = start.x, py = start.y, pz = start.z, crossed = false, step = 0;
    simulate(start, vel, spin, H, MAX_T, (x, y, z) => {
      step++;
      if (x >= goalX) {
        const k = (goalX - px) / ((x - px) || 1e-9);
        if (project(goalX, py + (y - py) * k, pz + (z - pz) * k, scr)) sim.push([scr[0], scr[1]]);
        crossed = true;
        return true;
      }
      px = x; py = y; pz = z;
      if (step % 3 === 0 && project(x, y, z, scr)) sim.push([scr[0], scr[1]]);
      return false;
    });
    if (!crossed && project(px, py, pz, scr)) sim.push([scr[0], scr[1]]);
    return crossed;
  };
  // Pour une vitesse et un effet donnés, la direction et l'élévation sont calculées pour arriver pile au point
  // visé ; on ne cherche donc que 3 réglages (vitesse, effet sur le côté, effet coupé) qui donnent la bonne forme.
  let guess = null, lastQ = null;
  const cost = (raw) => {
    const sp = Math.min(LIMITS.maxSpeed, Math.max(LIMITS.minSpeed, raw[0]));
    const side = Math.min(SPIN.maxSide, Math.max(-SPIN.maxSide, raw[1]));
    const top = Math.min(SPIN.maxTop, Math.max(-SPIN.maxBack, raw[2]));
    const pen = (raw[0] - sp) ** 2 * 40 + ((raw[1] - side) ** 2 + (raw[2] - top) ** 2) * 2;
    const aim = solveAim(start, target, sp, side, top, guess);
    guess = [aim.q[1], aim.q[2]];
    lastQ = aim.q;
    const crossed = trace(aim.q);
    resample(sim, N, samp);
    let c = 0, wsum = 0;
    for (let i = 1; i < N; i++) {
      const u = i / (N - 1), w = 1 + 2 * u * u;
      c += w * ((samp[i][0] - drawn[i][0]) ** 2 + (samp[i][1] - drawn[i][1]) ** 2);
      wsum += w;
    }
    c /= wsum;
    c += 2 * ((samp[N - 1][0] - end[0]) ** 2 + (samp[N - 1][1] - end[1]) ** 2);  // point visé hors d'atteinte
    c += 1.5 * ((side / 30) ** 2 + (top / 30) ** 2);  // à forme presque égale, on préfère moins d'effet
    return c + pen + (crossed ? 0 : 400);
  };
  const qOf = (x) => {  // réglages complets (avec direction et élévation) pour x = [vitesse, côté, coupé]
    cost(x);
    return lastQ;
  };

  // Premier essai sur une grille, puis affinage par le simplexe depuis les deux meilleurs points de la grille
  const grid = [];
  for (const sp of [14, 20, 26, 32]) {
    guess = null;
    for (const side of [-40, 0, 40]) for (const top of [-20, 0, 25]) grid.push({ x: [sp, side, top], c: cost([sp, side, top]) });
  }
  grid.sort((u, v) => u.c - v.c);
  let best = null;
  for (const g of grid.slice(0, 2)) {
    guess = null;
    let r = nelderMead(cost, g.x, [3, 15, 12], 90);
    r = nelderMead(cost, r.x, [1.2, 6, 6], 60);
    if (!best || r.c < best.c) best = r;
  }
  best.x = qOf(best.x);
  const q = best.x;
  launch(q, vel, spin);
  trace(q);
  const screen = sim.map((s) => [s[0], s[1]]);
  return {
    q, cost: best.c, target, screen, drawn,
    vel: { x: vel.x, y: vel.y, z: vel.z }, spin: { x: spin.x, y: spin.y, z: spin.z },
    hit: crossing(start, vel, spin, goalX),
  };
}

// Méthode du simplexe (Nelder-Mead) : cherche le minimum de f sans dérivées
export function nelderMead(f, x0, steps, maxEval) {
  const n = x0.length;
  let pts = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const p = x0.slice();
    p[i] += steps[i];
    pts.push(p);
  }
  let vals = pts.map(f), evals = n + 1;
  const comb = (a, b, t) => a.map((ai, i) => ai + (b[i] - ai) * t);
  while (evals < maxEval) {
    const order = vals.map((v, i) => i).sort((i, j) => vals[i] - vals[j]);
    pts = order.map((i) => pts[i]);
    vals = order.map((i) => vals[i]);
    if (vals[n] - vals[0] < 0.05) break;
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) c[k] += pts[i][k] / n;
    const xr = comb(c, pts[n], -1), fr = f(xr);
    evals++;
    if (fr < vals[0]) {
      const xe = comb(c, pts[n], -2), fe = f(xe);
      evals++;
      if (fe < fr) { pts[n] = xe; vals[n] = fe; } else { pts[n] = xr; vals[n] = fr; }
    } else if (fr < vals[n - 1]) {
      pts[n] = xr;
      vals[n] = fr;
    } else {
      const outside = fr < vals[n];
      const xc = comb(c, outside ? xr : pts[n], 0.5), fc = f(xc);
      evals++;
      if (fc < (outside ? fr : vals[n])) {
        pts[n] = xc;
        vals[n] = fc;
      } else {
        for (let i = 1; i <= n; i++) {
          pts[i] = comb(pts[0], pts[i], 0.5);
          vals[i] = f(pts[i]);
          evals++;
        }
      }
    }
  }
  let bi = 0;
  for (let i = 1; i < vals.length; i++) if (vals[i] < vals[bi]) bi = i;
  return { x: pts[bi], c: vals[bi], evals };
}
