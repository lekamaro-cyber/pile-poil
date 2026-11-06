// IA de base (étape 1) : placement selon la formation, pressing du porteur, couverture, porteur adverse qui
// dribble, passe ou tire, gardiens qui se placent, anticipent les tirs et plongent.
// L'étape 2 la remplacera par une IA collective plus fine (appels, démarquage, marquage, pressing organisé).
import { PITCH, PLAYER, KEEPER, AI, BALL, MATCH, DEFENDERS } from '../config.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist2 = (p, b) => (p.pos.x - b.pos.x) ** 2 + (p.pos.z - b.pos.z) ** 2;

export function updateAI(m, dt) {
  const ball = m.ball, owner = ball.owner;
  for (const team of m.teams) {
    const hasBall = !!owner && owner.team === team.index;
    const attacking = hasBall || (!owner && ball.lastTouch && ball.lastTouch.team === team.index);
    let presser = null, cover = null;
    if (m.state === 'play' && !hasBall) {
      const ranked = team.players.filter((p) => !p.isKeeper && p !== m.controlled).sort((a, b) => dist2(a, ball) - dist2(b, ball));
      if (team.index === 0) {
        // Équipe du joueur : c'est lui qui presse. Un coéquipier va au ballon libre seulement s'il est nettement plus près.
        const userD = m.controlled ? Math.sqrt(dist2(m.controlled, ball)) : Infinity;
        if (!owner && ranked[0] && Math.sqrt(dist2(ranked[0], ball)) < userD - 4) presser = ranked[0];
        if (owner) cover = ranked[0];
      } else {
        presser = ranked[0];
        cover = owner ? ranked[1] : null;
      }
    }
    for (const p of team.players) {
      p.pokeCool = Math.max(0, (p.pokeCool || 0) - dt);
      if (p.isKeeper) {
        keeperAI(m, p, dt);
        continue;
      }
      if (p === m.controlled && m.state === 'play') continue;  // dirigé par le joueur
      if (m.state !== 'play') {
        formation(m, team, p, attacking, 0.7);
        continue;
      }
      if (p === owner) {
        carrierAI(m, p, dt);
        continue;
      }
      if (p.receiveT > 0) {  // une passe arrive pour lui : il va à sa rencontre
        p.receiveT -= dt;
        p.moveTo(p.receiveX, p.receiveZ, PLAYER.runSpeed, 0.2);
        p.face(ball.pos.x, ball.pos.z);
        continue;
      }
      if (p === presser) {
        press(m, p);
        continue;
      }
      if (p === cover) {
        coverBall(m, team, p);
        continue;
      }
      formation(m, team, p, attacking, 1);
    }
  }
}

// Place dans le bloc de l'équipe : poste de la formation, décalé selon la position du ballon
function formation(m, team, p, attacking, speedMul) {
  const b = m.ball.pos;
  const prog = b.x * team.dir;  // avancée du ballon vue par l'équipe (+ = vers le but adverse)
  let u = (p.slot.x - 0.5) * PITCH.length * 0.78 + prog * 0.5 + (attacking ? 7 : -3);
  if (!attacking && DEFENDERS.includes(p.role)) u = Math.min(u, prog - 3);  // défenseurs entre le ballon et le but
  if (attacking && p.role === 'ST') u = Math.max(u, Math.min(prog + 9, PITCH.halfL - 12));  // attaquants devant le ballon
  u = clamp(u, -PITCH.halfL + 6, PITCH.halfL - 8);
  const z = clamp(p.slot.z * PITCH.halfW * (attacking ? 0.85 : 0.62) * team.dir + b.z * (attacking ? 0.25 : 0.4), -PITCH.halfW + 2, PITCH.halfW - 2);
  const x = u * team.dir;
  const d = Math.hypot(x - p.pos.x, z - p.pos.z);
  p.moveTo(x, z, (d > 12 ? PLAYER.runSpeed : d > 3 ? PLAYER.jogSpeed : 2.2) * speedMul, 0.8);
  p.face(b.x, b.z);
}

function press(m, p) {
  const b = m.ball;
  const tx = b.pos.x + b.vel.x * 0.25, tz = b.pos.z + b.vel.z * 0.25;
  const d = Math.hypot(tx - p.pos.x, tz - p.pos.z);
  p.moveTo(tx, tz, d > 8 ? PLAYER.sprintSpeed * 0.95 : PLAYER.runSpeed, 0.1);
  if (b.owner && b.owner.team !== p.team) m.tryPoke(p);
}

// Couverture : entre le ballon et son propre but, à 7 m du ballon
function coverBall(m, team, p) {
  const b = m.ball.pos, gx = -team.dir * PITCH.halfL;
  const dx = gx - b.x, dz = -b.z, d = Math.hypot(dx, dz) || 1, r = Math.min(7, d * 0.5);
  p.moveTo(b.x + (dx / d) * r, b.z + (dz / d) * r, PLAYER.runSpeed, 0.5);
  p.face(b.x, b.z);
}

// Porteur du ballon contrôlé par l'IA
function carrierAI(m, p, dt) {
  const team = m.teams[p.team], gx = team.dir * PITCH.halfL;
  p.aiT = (p.aiT || 0) + dt;
  if (m.kickoffT > 0) {  // coup d'envoi : passe en retrait
    if (p.aiT > MATCH.kickoffPass) m.aiPass(p, true);
    else p.move(0, 0, 0);
    return;
  }
  const toGoal = Math.hypot(gx - p.pos.x, p.pos.z);
  let near = null, nearD = Infinity;
  for (const o of m.teams[1 - p.team].players) {
    const d = Math.sqrt(dist2(o, p));
    if (d < nearD) { near = o; nearD = d; }
  }
  if (toGoal < AI.shootRange && Math.abs(p.pos.z) < 17 && (toGoal < 15 || nearD < 3 || p.aiT > 1.2)) {
    m.shoot(p, 0.55 + Math.random() * 0.3, null);
    return;
  }
  if (nearD < AI.passPressure && p.aiT > 0.35 && m.aiPass(p, false)) return;
  if (p.aiT > 2.6 && Math.random() < dt * 0.8 && m.aiPass(p, false)) return;
  // Dribble vers le but en s'écartant du défenseur le plus proche
  let dx = gx - p.pos.x, dz = -p.pos.z * 0.3;
  const d = Math.hypot(dx, dz) || 1;
  dx /= d;
  dz /= d;
  if (near && nearD < 5) {
    const ax = p.pos.x - near.pos.x, az = p.pos.z - near.pos.z, ad = Math.hypot(ax, az) || 1;
    dx += (ax / ad) * 0.7;
    dz += (az / ad) * 0.7;
  }
  p.move(dx, dz, PLAYER.runSpeed * PLAYER.dribbleFactor);
}

// Gardien : placement sur la bissectrice, lecture des tirs, plongeon, sortie sur ballon libre dans la surface
function keeperAI(m, k, dt) {
  const team = m.teams[k.team], b = m.ball, s = -team.dir, gx = s * PITCH.halfL, halfGoal = PITCH.goalWidth / 2;
  if (b.owner === k) {  // il a le ballon dans les mains : il relance après un court instant
    k.move(0, 0, 0);
    k.face(0, 0);
    k.holdT = (k.holdT || 0) - dt;
    if (k.holdT <= 0 && m.state === 'play') m.keeperRelease(k);
    return;
  }
  if (k.state === 'dive') return;
  let tx = null, tz = null;
  if (m.state === 'play' && !b.owner && s * b.vel.x > 5) {  // ballon qui vient vers son but
    const t = (gx - b.pos.x) / b.vel.x;
    if (t > 0 && t < 2.2) {
      const zc = b.pos.z + b.vel.z * t;
      const yc = b.pos.y + b.vel.y * t - 0.5 * BALL.gravity * t * t;
      if (Math.abs(zc) < halfGoal + 0.8 && yc < PITCH.goalHeight + 0.5) {
        k.react = (k.react || 0) + dt;
        if (k.react > KEEPER.reaction) {
          const goalZ = clamp(zc, -halfGoal + 0.2, halfGoal - 0.2);
          const lateral = goalZ - k.pos.z;
          if (Math.abs(lateral) > 0.9 && t < 0.75) {
            k.dive(Math.sign(lateral), Math.min(KEEPER.diveSpeed, Math.abs(lateral) / Math.max(0.2, t) + 1));
            return;
          }
          tx = gx - s * 0.5;
          tz = goalZ;
        }
      }
    }
  } else {
    k.react = 0;
  }
  if (tx === null) {
    const dx = b.pos.x - gx, dz = b.pos.z, d = Math.hypot(dx, dz) || 1;
    const r = clamp(d * 0.11, 0.6, 5);
    tx = gx + (dx / d) * r;
    tz = clamp((dz / d) * r, -halfGoal + 0.3, halfGoal - 0.3);
    // Sortie : ballon libre dans sa surface et personne n'est plus près que lui
    const inBox = s * b.pos.x > PITCH.halfL - PITCH.penaltyDepth && Math.abs(b.pos.z) < PITCH.penaltyWidth / 2;
    if (m.state === 'play' && !b.owner && inBox && b.pos.y < 2) {
      const kd = Math.sqrt(dist2(k, b));
      if (m.all.every((q) => q === k || Math.sqrt(dist2(q, b)) > kd - 0.5)) {
        tx = b.pos.x;
        tz = b.pos.z;
      }
    }
  }
  k.moveTo(tx, tz, KEEPER.speed, 0.15);
  k.face(b.pos.x, b.pos.z);
}
