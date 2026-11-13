// Coups de pied arrêtés (coup franc, penalty) : le ballon, le tireur, le mur et le gardien, la frappe calculée à
// partir du tracé au doigt, les chocs du ballon contre les corps et le résultat du tir. Sert à l'entraînement et
// à la séance de tirs au but. Le but visé est toujours celui de droite (x = +52,5).
import * as THREE from 'three';
import { PITCH, BALL, KEEPER, SETPIECE, SET_LEVELS, TEAMS, SKIN_TONES, HAIR_COLORS } from '../config.js';
import { Player } from '../entities/player.js';
import { Ball } from '../entities/ball.js';
import { stepBall } from '../physics/ballPhysics.js';
import { fitShot, makeView, solveAim, launch } from '../physics/trajectoryFit.js';
import { capsuleHit, bounceOff } from '../physics/bodies.js';
import { wallLayout, keeperSpot, KeeperBrain, diveTo, penaltyPlan, penaltyAdjust, penaltyError } from '../ai/setPieceAI.js';
import { aimBehindBall, aimBehindGoal } from '../engine/camera.js';
import { canvasTexture } from '../engine/geometry.js';

const GX = PITCH.halfL;
const HALF_GOAL = PITCH.goalWidth / 2;
const R = BALL.radius;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const tmpM = new THREE.Matrix4();

// Direction « vers le haut du corps » d'un joueur, selon sa bascule (plongeon) et son orientation
function bodyAxis(p) {
  const r = p.pose.roll, h = p.heading;
  return { x: -Math.sin(r) * Math.cos(h), y: Math.cos(r), z: Math.sin(r) * Math.sin(h) };
}

export class SetPiece {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.ball = new Ball(scene);
    const mk = (team, role, number) => {
      const def = TEAMS[team];
      const p = new Player({
        team, slot: { role, x: 0, z: 0 }, number, kit: role === 'GK' ? def.keeperKit : def.kit,
        skin: pick(SKIN_TONES), hair: pick(HAIR_COLORS), name: `${def.short} ${number}`,
      });
      scene.add(p.root);
      return p;
    };
    this.kickers = [mk(0, 'ST', 10), mk(1, 'ST', 9)];
    this.keepers = [mk(0, 'GK', 1), mk(1, 'GK', 1)];
    this.wallPlayers = [4, 5, 6, 8, 3].map((n) => mk(1, 'CB', n));
    for (const w of this.wallPlayers) w.strafe = true;
    for (const k of this.keepers) {
      k.strafe = true;
      k.diveDrag = SETPIECE.diveDrag;
    }
    this.all = [...this.kickers, ...this.keepers, ...this.wallPlayers];
    this.makeShadows(scene);
    this.history = { left: 0, center: 0, right: 0 };  // côtés de tes penalties (le gardien s'en souvient)
    this.phase = 'idle';
    this.sync = false;         // true : calcul du tir sans arrière-plan (tests pas à pas)
    this.onPlan = null;        // (résultat du calcul) : trajectoire retenue
    this.onKick = null;        // () : le ballon part
    this.onResult = null;      // (résultat) : but, arrêt, à côté…
    this.fitId = 0;
    this.worker = null;
    try {
      this.worker = new Worker(new URL('../physics/fitWorker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => this.fitDone(e.data.id, e.data.result || null);
      this.worker.onerror = () => { this.worker = null; };
    } catch (err) {
      this.worker = null;  // pas de calcul en arrière-plan : on calcule directement
    }
    this.setVisible(false);
  }

  makeShadows(scene) {
    const tex = canvasTexture(64, 64, (g) => {
      const grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
      grad.addColorStop(0, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    });
    this.shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), this.all.length + 1);
    this.shadows.frustumCulled = false;
    scene.add(this.shadows);
  }

  setVisible(v) {
    this.visible = v;
    this.ball.mesh.visible = v;
    this.shadows.visible = v;
    for (const p of this.all) p.root.visible = v && !!p.used;
  }

  // ---------- Préparer un tir ----------
  // kind : 'freekick' ou 'penalty' ; spot : {x, z} du coup franc ; wall : joueurs dans le mur (0 à 5) ;
  // keeper : gardien présent ; level : niveau (SET_LEVELS) ; shooter : 0 = toi, 1 = l'ordinateur (tu es gardien)
  setup(opts) {
    const o = this.opts = Object.assign({ kind: 'freekick', spot: { x: GX - 24, z: -5 }, wall: 4, keeper: true, level: 'normal', shooter: 0 }, opts);
    this.level = SET_LEVELS[o.level] || SET_LEVELS.normal;
    const spot = o.kind === 'penalty' ? { x: GX - SETPIECE.penaltySpot, z: 0 } : o.spot;
    const b = this.ball;
    b.place(spot.x, spot.z);
    b.owner = null;
    b.lastTouch = null;
    for (const p of this.all) p.used = false;
    // Tireur : il prend son élan en arrière et à gauche du ballon (pied droit)
    let dx = GX - spot.x, dz = 0 - spot.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    this.dir = { x: dx, z: dz };
    const rx = -dz, rz = dx;  // droite du tireur
    const kicker = this.kicker = this.kickers[o.shooter];
    const back = o.kind === 'penalty' ? 2.6 : 2.2;
    kicker.reset(spot.x - dx * back - rx * 1.3, spot.z - dz * back - rz * 1.3, Math.atan2(dx, dz));
    kicker.used = true;
    this.contact = { x: spot.x - dx * 0.5 - rx * 0.18, z: spot.z - dz * 0.5 - rz * 0.18 };
    // Mur (coup franc seulement)
    const n = o.kind === 'freekick' && o.shooter === 0 ? Math.max(0, Math.min(5, o.wall | 0)) : 0;
    const layout = wallLayout(spot, n);
    this.wall = this.wallPlayers.slice(0, n);
    this.wall.forEach((w, i) => {
      w.reset(layout[i].x, layout[i].z, Math.atan2(spot.x - layout[i].x, spot.z - layout[i].z));
      w.face(spot.x, spot.z);
      w.used = true;
      w.jumpAt = -1;
    });
    // Gardien
    this.keeper = null;
    this.brain = null;
    if (o.keeper) {
      const k = this.keeper = this.keepers[1 - o.shooter];
      const ks = keeperSpot(spot, layout, o.kind);
      k.reset(ks.x, ks.z, Math.atan2(spot.x - ks.x, spot.z - ks.z));
      k.face(spot.x, spot.z);
      k.used = true;
      k.hand = { x: 0, y: 0, z: 0 };
      if (o.shooter === 0) this.brain = new KeeperBrain(k, this.level, o.kind, ks, this.history);
    }
    this.setVisible(this.visible);
    // Caméra
    if (o.shooter === 0) aimBehindBall(this.camera, b.pos, { x: GX, y: 1.22, z: 0 });
    else aimBehindGoal(this.camera, GX, spot.x);
    this.phase = 'aim';
    this.t = 0;
    this.plan = null;
    this.result = null;
    this.kicked = false;
    this.flightT = 0;
    this.doneT = 0;
    this.touched = { keeper: false, wall: false };
    this.userDive = null;
    this.held = false;
    this.request = null;
    this.fitId++;
    this.ai = o.shooter === 1 ? { plan: penaltyPlan(), wait: 1.2, committed: false } : null;
    this.hint = o.shooter === 0
      ? 'Trace la trajectoire avec le doigt : du ballon jusqu’au but'
      : 'Glisse le doigt vers un côté pour plonger (touche l’écran pour sauter sur place)';
    this.syncVisual(0);
  }

  get finished() {
    return this.phase === 'done' && this.doneT <= 0;
  }

  // ---------- Commandes ----------
  // Tracé terminé (points à l'écran, en pixels) : on calcule la frappe et le tireur prend son élan
  stroke(pts) {
    if (this.phase !== 'aim' || this.opts.shooter !== 0) return false;
    const cam = this.camera;
    cam.updateMatrixWorld();
    const pv = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const view = {
      pv: Array.from(pv.elements), ipv: Array.from(pv.clone().invert().elements),
      pos: { x: cam.position.x, y: cam.position.y, z: cam.position.z }, w: innerWidth, h: innerHeight,
    };
    const start = { x: this.ball.pos.x, y: this.ball.pos.y, z: this.ball.pos.z };
    const id = ++this.fitId;
    this.phase = 'runup';
    this.t = 0;
    this.hint = '';
    this.request = { id, start, path: pts, view, goalX: GX };
    if (this.worker && !this.sync) this.worker.postMessage(this.request);
    else this.fitNow();
    return true;
  }
  // Calcul direct (tests pas à pas, ou calcul en arrière-plan indisponible ou trop lent)
  fitNow() {
    const q = this.request;
    if (!q || this.plan) return;
    const { project, ray } = makeView(q.view);
    this.fitDone(q.id, fitShot({ start: q.start, path: q.path, project, ray, goalX: q.goalX }));
  }
  fitDone(id, result) {
    if (id !== this.fitId || !result || (this.phase !== 'runup' && this.phase !== 'strike')) return;
    this.plan = { vel: result.vel, spin: result.spin, side: result.hit.z };
    if (this.onPlan) this.onPlan(result);
  }

  // Glissé du doigt quand tu es gardien : dx, dy en pixels à l'écran
  swipe(dx, dy) {
    if (this.opts.shooter !== 1 || !this.keeper || this.userDive || this.phase === 'done') return;
    const k = this.keeper, len = Math.hypot(dx, dy);
    // Droite de l'écran → direction sur le terrain (la caméra est derrière le but)
    const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
    if (len < 18) {  // toucher : saut sur place, bras en l'air
      k.jump(3.2);
      this.userDive = { side: 0, t: this.t, phase: this.phase };
      return;
    }
    const side = Math.sign(dx * right.z) || 1;
    const lat = Math.abs(dx) / len, up = Math.max(0, -dy) / len;
    const strength = Math.min(1, len / 140);
    if (lat < 0.35) {  // vers le haut : saut
      k.jump(2.6 + 1.2 * strength);
      this.userDive = { side: 0, t: this.t, phase: this.phase };
      return;
    }
    const roll = Math.min(1.45, Math.max(0.35, Math.atan2(lat, up)));
    const speed = KEEPER.diveSpeed * (0.45 + 0.55 * strength) * Math.min(1.1, 0.75 + lat * 0.4);
    k.dive(side, speed, roll, up > 0.25 ? 1.2 + 2.6 * up * strength : 0, 1.3);
    this.userDive = { side, t: this.t, phase: this.phase };
  }

  // ---------- Boucle ----------
  update(dt) {
    if (this.phase === 'idle') return;
    this.t += dt;
    const b = this.ball, k = this.kicker, o = this.opts;
    // Tireur de l'ordinateur : il se prépare puis s'élance
    if (this.phase === 'aim' && this.ai && this.t >= this.ai.wait) {
      this.phase = 'runup';
      this.t = 0;
    }
    if (this.phase === 'aim') {
      k.move(0, 0, 0);
      k.face(b.pos.x, b.pos.z);
    } else if (this.phase === 'runup') {
      const c = this.contact, dist = Math.hypot(c.x - k.pos.x, c.z - k.pos.z);
      if (this.ai && !this.ai.committed && dist < 0.9) {  // dernier coup d'œil au gardien
        this.ai.committed = true;
        const early = this.userDive && this.userDive.side ? this.userDive.side : 0;
        const p = penaltyAdjust(this.ai.plan, early, this.level);
        const e = penaltyError(p, this.level);
        this.plan = { target: { x: GX, y: e.y, z: e.z }, speed: p.speed };
      }
      if (dist > 0.1 && this.t < 3) {
        k.moveTo(c.x, c.z, SETPIECE.runSpeed, 0.04);
      } else if (this.plan) {
        k.move(0, 0, 0);
        k.kick();
        this.phase = 'strike';
        this.strikeT = 0.12;  // la jambe arrive au ballon
      } else {
        k.move(0, 0, 0);  // calcul pas encore fini : il attend
        if (this.t > 1.5) this.fitNow();
      }
      k.face(b.pos.x + this.dir.x * 5, b.pos.z + this.dir.z * 5);
    } else if (this.phase === 'strike') {
      this.strikeT -= dt;
      if (this.strikeT <= 0) this.strike();
    } else {
      k.move(this.dir.x, this.dir.z, this.flightT < 0.4 ? 2 : 0);  // il accompagne sa frappe puis s'arrête
    }
    // Mur : chacun saute au moment prévu
    for (const w of this.wall) {
      w.move(0, 0, 0);
      w.face(b.pos.x, b.pos.z);
      if (w.jumpAt >= 0 && this.kicked && this.flightT >= w.jumpAt) {
        w.jump(SETPIECE.wallJumpSpeed);
        w.jumpAt = -1;
      }
    }
    // Gardien
    if (this.keeper) {
      if (this.brain) this.brain.update(dt, b);
      else if (this.keeper.state !== 'dive') {
        this.keeper.move(0, 0, 0);
        this.keeper.face(b.pos.x, b.pos.z);
      }
      this.keeperHands(dt);
    }
    for (const p of this.all) if (p.used) p.update(dt);
    // Ballon
    if (this.kicked) {
      this.flightT += dt;
      const prevX = b.pos.x;
      if (this.held) {
        this.holdBall();
      } else {
        // Petits pas (8 cm au plus) : un ballon rapide ne peut pas traverser un joueur entre deux images
        const n = Math.min(24, Math.max(1, Math.ceil((b.vel.length() * dt) / 0.08)));
        for (let i = 0; i < n && !this.held; i++) {
          stepBall(b, dt / n);
          this.collide();
        }
      }
      if (!this.result) this.judge(prevX);
    }
    if (this.phase === 'done') this.doneT -= dt;
    this.syncVisual(dt);
  }

  // Contact pied-ballon : le ballon part avec la vitesse et l'effet calculés
  strike() {
    const b = this.ball, o = this.opts;
    if (o.shooter === 0) {
      b.vel.set(this.plan.vel.x, this.plan.vel.y, this.plan.vel.z);
      b.spin.set(this.plan.spin.x, this.plan.spin.y, this.plan.spin.z);
      if (o.kind === 'penalty') {
        const z = this.plan.side;
        this.history[z < -0.9 ? 'left' : z > 0.9 ? 'right' : 'center']++;
      }
    } else {
      const side = (Math.random() - 0.5) * 16;  // petit effet naturel
      const { q } = solveAim(b.pos, this.plan.target, this.plan.speed, side, 0);
      const v = {}, w = {};
      launch(q, v, w);
      b.vel.set(v.x, v.y, v.z);
      b.spin.set(w.x, w.y, w.z);
    }
    b.lastTouch = this.kicker;
    this.kickSpeed = b.vel.length();
    this.kicked = true;
    this.phase = 'flight';
    this.flightT = 0;
    if (this.brain) this.brain.onKick();
    for (const w of this.wall) w.jumpAt = Math.random() < this.level.wallJump ? 0.05 + Math.random() * 0.12 : -1;
    if (this.onKick) this.onKick();
  }

  // Gardien debout : ses mains vont vers le ballon quand il arrive près de lui (6 m/s au plus)
  keeperHands(dt) {
    const k = this.keeper, b = this.ball, hd = k.hand;
    let tx = 0, ty = 0, tz = 0;
    if (this.kicked && !this.held && k.state === 'run') {
      const u = bodyAxis(k), lift = k.lift + 0.95 + k.pose.bob;
      const cx = k.pos.x + u.x * 0.45, cy = lift + u.y * 0.45, cz = k.pos.z + u.z * 0.45;
      const dx = b.pos.x - cx, dy = b.pos.y - cy, dz = b.pos.z - cz, d = Math.hypot(dx, dy, dz);
      if (d < 2.4 && b.vel.x > 0) {
        const s = Math.min(0.95, d) / (d || 1);
        tx = dx * s;
        ty = dy * s;
        tz = dz * s;
      }
    }
    const ex = tx - hd.x, ey = ty - hd.y, ez = tz - hd.z, e = Math.hypot(ex, ey, ez), max = 6 * dt;
    const f = e > max ? max / e : 1;
    hd.x += ex * f;
    hd.y += ey * f;
    hd.z += ez * f;
    k.reach = Math.min(1, Math.hypot(hd.x, hd.y, hd.z) / 0.95);
  }

  // Chocs du ballon contre le mur et le gardien
  collide() {
    const b = this.ball;
    for (const w of this.wall) {
      const y0 = w.lift + 0.1, y1 = w.lift + SETPIECE.wallHeight - SETPIECE.wallRadius;
      const hit = capsuleHit(b.pos, w.pos.x, y0, w.pos.z, w.pos.x, y1, w.pos.z, SETPIECE.wallRadius);
      if (hit && bounceOff(b, hit, 0.35, 0.7, 0.3)) {
        this.touched.wall = true;
        b.lastTouch = w;
      }
    }
    const k = this.keeper;
    if (!k) return;
    const u = bodyAxis(k);
    const px = k.pos.x, py = k.lift + 0.95 + k.pose.bob, pz = k.pos.z;
    const diving = k.state === 'dive', airborne = k.lift > 0.02;
    const top = diving || airborne ? 1.08 : 0.82;
    const parts = [[px - u.x * 0.92, py - u.y * 0.92, pz - u.z * 0.92, px + u.x * top, py + u.y * top, pz + u.z * top, diving ? 0.2 : 0.24, 'body']];
    const hd = k.hand;
    if (!diving && Math.hypot(hd.x, hd.y, hd.z) > 0.05) {
      const cx = px + u.x * 0.45, cy = py + u.y * 0.45, cz = pz + u.z * 0.45;
      parts.push([cx, cy, cz, cx + hd.x, cy + hd.y, cz + hd.z, 0.13, 'hands']);
    }
    for (const [ax, ay, az, bx, by, bz, r, part] of parts) {
      const hit = capsuleHit(b.pos, ax, ay, az, bx, by, bz, r);
      if (!hit) continue;
      const rel = Math.hypot(b.vel.x - k.vel.x, b.vel.y - k.liftV, b.vel.z - k.vel.z);
      const atHands = part === 'hands' || hit.s > 0.62;
      const fingertip = diving && hit.s > 0.9;
      this.touched.keeper = true;
      b.lastTouch = k;
      if (atHands && !fingertip && rel < KEEPER.catchSpeed * (diving ? 0.8 : 1)) {  // il le capte
        this.held = true;
        b.vel.set(0, 0, 0);
        b.spin.set(0, 0, 0);
        this.holdBall();
        return;
      }
      const kv = { x: k.vel.x, y: k.liftV, z: k.vel.z };
      if (fingertip) bounceOff(b, hit, 0.2, 0.85, 0.5, kv);  // du bout des doigts : il dévie à peine
      else bounceOff(b, hit, 0.4, 0.6, 0.3, kv);           // il repousse
      return;
    }
  }
  holdBall() {
    const k = this.keeper, b = this.ball, u = bodyAxis(k);
    const py = k.lift + 0.95 + k.pose.bob;
    const f = { x: Math.sin(k.heading), z: Math.cos(k.heading) };
    b.pos.set(k.pos.x + u.x * 0.6 + f.x * 0.25, Math.max(R, py + u.y * 0.6), k.pos.z + u.z * 0.6 + f.z * 0.25);
    b.vel.set(0, 0, 0);
  }

  // Résultat du tir : but, arrêt, mur, poteau, à côté, au-dessus, trop court
  judge(prevX) {
    const b = this.ball, sp = b.vel.length();
    let how = null;
    if (b.inGoal === 1) how = 'goal';
    else if (prevX < GX && b.pos.x >= GX) how = Math.abs(b.pos.z) <= HALF_GOAL + R && b.pos.y > PITCH.goalHeight ? 'over' : 'wide';
    else if (this.held) how = 'saved';
    else if (Math.abs(b.pos.z) > PITCH.halfW || b.pos.x > GX + 3) how = 'wide';
    else if ((this.touched.keeper || this.touched.wall) && b.vel.x < -0.3 && b.pos.x < GX - 0.5) how = 'stopped';
    else if (sp < 0.3 && b.pos.y <= R + 0.01) how = 'short';
    else if (this.flightT > SETPIECE.maxFlight) how = 'short';
    if (!how) return;
    if (how !== 'goal') {  // pas de but : on dit pourquoi (dans l'ordre : gardien, mur, poteau)
      if (this.touched.keeper) how = 'saved';
      else if (this.touched.wall) how = 'wall';
      else if (b.frameHits > 0) how = 'post';
    }
    this.result = {
      goal: how === 'goal', how, speed: Math.round(this.kickSpeed * 3.6), shooter: this.opts.shooter,
      kind: this.opts.kind, post: b.frameHits > 0, keeper: this.touched.keeper,
    };
    this.phase = 'done';
    this.doneT = SETPIECE.resultPause;
    if (this.keeper && this.opts.shooter === 0 && !this.result.goal) this.keeper.celebrate(1.2);
    if (this.result.goal) this.kicker.celebrate(1.6);
    if (this.onResult) this.onResult(this.result);
  }

  // Dessin : ballon et ombres
  syncVisual(dt) {
    this.ball.sync(dt);
    const m = tmpM;
    let i = 0;
    for (const p of this.all) {
      m.makeScale(p.used ? 1.1 : 0, 1, p.used ? 1.1 : 0);
      m.setPosition(p.pos.x, 0.02, p.pos.z);
      this.shadows.setMatrixAt(i++, m);
    }
    const b = this.ball.pos, s = Math.max(0.25, 0.5 - b.y * 0.06);
    m.makeScale(s, 1, s);
    m.setPosition(b.x, 0.021, b.z);
    this.shadows.setMatrixAt(i, m);
    this.shadows.instanceMatrix.needsUpdate = true;
  }
}

export { diveTo };
