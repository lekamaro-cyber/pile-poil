// Le match : 22 joueurs, le ballon, la possession, les actions (passe, tir, centre, tacle, changement de joueur),
// les gardiens, les buts et les sorties de terrain (remises en jeu simplifiées à l'étape 1).
import * as THREE from 'three';
import { PITCH, BALL, PLAYER, SHOT, PASS, KEEPER, MATCH, TEAMS, FORMATIONS, SKIN_TONES, HAIR_COLORS, DIFFICULTIES } from '../config.js';
import { Player } from '../entities/player.js';
import { Ball } from '../entities/ball.js';
import { stepBall, speedForRoll, lobVelocity, shotLift } from '../physics/ballPhysics.js';
import { updateAI } from '../ai/simpleAI.js';
import { canvasTexture } from '../engine/geometry.js';

const R = BALL.radius;
const NUMBERS = [1, 3, 4, 5, 2, 11, 8, 6, 7, 10, 9];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;  // à peu près une loi normale
const tmpV = new THREE.Vector3();
const tmpF = new THREE.Vector3();

export class Match {
  constructor(scene, input, hud) {
    this.scene = scene;
    this.input = input;
    this.hud = hud;
    this.ball = new Ball(scene);
    this.teams = TEAMS.map((def, i) => ({ index: i, def, dir: i === 0 ? 1 : -1, players: [], score: 0 }));
    for (const team of this.teams) {
      FORMATIONS['4-4-2'].forEach((slot, k) => {
        const p = new Player({
          team: team.index, slot, number: NUMBERS[k], kit: slot.role === 'GK' ? team.def.keeperKit : team.def.kit,
          skin: pick(SKIN_TONES), hair: pick(HAIR_COLORS), name: `${team.def.short} ${NUMBERS[k]}`,
        });
        scene.add(p.root);
        team.players.push(p);
      });
    }
    this.all = this.teams[0].players.concat(this.teams[1].players);
    this.controlled = null;
    this.state = 'play';
    this.stateT = 0;
    this.restart = null;
    this.kickoffT = 0;
    this.charge = { act: null, t: 0 };
    this.buffer = null;
    this.pending = null;  // frappe demandée alors que le ballon n'est pas encore à portée de pied
    this.time = 0;
    this.diff = DIFFICULTIES.normal;
    this.autoplay = false;  // mode démo (tests) : l'ordinateur joue aussi ton équipe
    this.makeMarkers(scene);
    hud.setTeams(this.teams);
    this.kickoff(0);
  }

  // ---------- Repères visuels : joueur sélectionné et ombres ----------
  makeMarkers(scene) {
    const yellow = new THREE.MeshBasicMaterial({ color: '#FFE45C', transparent: true, opacity: 0.95, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 32).rotateX(-Math.PI / 2), yellow);
    this.arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.38, 8).rotateX(Math.PI), yellow);
    scene.add(this.ring, this.arrow);
    const shadowTex = canvasTexture(64, 64, (g) => {
      const grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
      grad.addColorStop(0, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    });
    this.shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), this.all.length + 1);
    this.shadows.frustumCulled = false;
    scene.add(this.shadows);
    this.shadowM = new THREE.Matrix4();
  }

  // Difficulté : vitesse des adversaires (les autres réglages sont lus par l'IA, les tacles et les gardiens)
  setDifficulty(key) {
    this.diffKey = DIFFICULTIES[key] ? key : 'normal';
    this.diff = DIFFICULTIES[this.diffKey];
    for (const p of this.teams[1].players) p.speedMul = this.diff.oppSpeed;
  }

  setControlled(p) {
    if (this.controlled) this.controlled.isUser = false;
    this.controlled = p;
    if (p) p.isUser = true;
    this.charge.act = null;
  }

  // ---------- Coup d'envoi ----------
  kickoff(teamIndex) {
    this.state = 'play';
    this.restart = null;
    this.ball.place(0, 0);
    this.ball.owner = null;
    for (const team of this.teams) {
      const kicking = team.index === teamIndex;
      for (const p of team.players) {
        const u = Math.min(p.slot.x, 0.47);
        let x = (u - 0.5) * PITCH.length * team.dir, z = p.slot.z * PITCH.halfW * 0.85 * team.dir;
        if (!kicking && Math.hypot(x, z) < 9.8) {  // l'équipe qui ne donne pas le coup d'envoi reste hors du rond
          const d = Math.hypot(x, z) || 1;
          x = (x / d) * 9.8;
          z = (z / d) * 9.8;
        }
        p.reset(x, z, team.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
    }
    const team = this.teams[teamIndex];
    const kicker = team.players.find((p) => p.role === 'ST');
    kicker.reset(-team.dir * 0.45, 0, team.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    this.give(kicker);
    if (this.autoplay) this.setControlled(null);
    else if (teamIndex === 0) this.setControlled(kicker);
    else this.setControlled(this.teams[0].players.find((p) => p.role === 'ST'));
    this.kickoffT = teamIndex === 1 ? 2 : 0;
    this.hud.banner("Coup d'envoi", this.teams[teamIndex].def.name, 1300);
  }

  // Remet le match à zéro (score compris)
  resetMatch() {
    for (const t of this.teams) t.score = 0;
    this.hud.setScore(0, 0);
    this.buffer = null;
    this.kickoff(0);
  }

  // ---------- Boucle ----------
  update(dt) {
    this.time += dt;
    this.kickoffT = Math.max(0, this.kickoffT - dt);
    if (this.state !== 'play') {
      this.stateT -= dt;
      if (this.stateT <= 0) this.resume();
    }
    if (this.state === 'play') this.handleInput(dt);
    updateAI(this, dt);
    for (const p of this.all) p.update(dt);
    this.separatePlayers(dt);
    this.dribble(dt);
    this.firePending(dt);
    stepBall(this.ball, dt);
    if (this.state === 'play') {
      this.keeperSaves();
      this.slideTackles();
      this.pickups();
      this.ballBodies();
      this.rules();
    }
    if (this.buffer && (this.buffer.t -= dt) <= 0) this.buffer = null;
    this.ball.sync(dt);
    this.updateMarkers();
    const has = this.ball.owner === this.controlled && !!this.controlled;
    this.input.setContext({
      hasBall: has,
      canTackle: !has && !!this.controlled && this.controlled.state === 'run',
      canSwitch: !has,
    });
  }

  // ---------- Commandes du joueur ----------
  handleInput(dt) {
    const p = this.controlled;
    if (!p) return;
    const inp = this.input, ball = this.ball;
    const has = ball.owner === p;
    const mv = inp.move, mag = Math.min(1, Math.hypot(mv.x, mv.y));
    const dx = mag > 0.05 ? mv.x / mag : 0, dz = mag > 0.05 ? -mv.y / mag : 0;  // haut de l'écran = -z
    if (p.state === 'run' || p.state === 'recover' || p.state === 'stun') {
      // Pendant la charge d'une frappe, le joystick sert seulement à viser : le joueur garde sa course (et le ballon).
      // Frappe demandée avec le ballon un peu loin : il court le rattraper pour frapper.
      const aiming = has && !!this.charge.act;
      const chasing = has && !!this.pending && this.pending.p === p;
      p.trapping = has && mag <= 0.08 && !aiming && !chasing;
      if (chasing) {
        const fd = this.footDist(p);
        p.move(ball.pos.x - p.pos.x, ball.pos.z - p.pos.z, Math.min(PLAYER.sprintSpeed, ball.vel.length() + 2 + fd * 2));
      } else if (aiming) {
        p.move(this.charge.dirX, this.charge.dirZ, this.charge.speed);
      } else if (mag > 0.08) {
        let sp = inp.btn.sprint.down ? PLAYER.sprintSpeed : PLAYER.jogSpeed + (PLAYER.runSpeed - PLAYER.jogSpeed) * Math.min(1, mag * 1.25);
        if (has) sp *= PLAYER.dribbleFactor;
        p.move(dx, dz, sp * Math.max(0.35, Math.min(1, mag * 1.4)));
      } else if (has && !ball.held && (this.footDist(p) > 0.5 || ball.vel.length() > 1.2)) {
        // Joystick lâché avec le ballon : le joueur court le bloquer sous le pied au lieu de le laisser filer
        const fd = this.footDist(p);
        p.move(ball.pos.x - p.pos.x, ball.pos.z - p.pos.z, Math.min(PLAYER.sprintSpeed, ball.vel.length() + 1.5 + fd * 2));
      } else {
        p.move(0, 0, 0);
        if (!has) p.face(ball.pos.x, ball.pos.z);
      }
    }
    if (inp.pressed('switch') && !has) this.switchPlayer();
    if (inp.pressed('tackle') && !has && p.state === 'run') {
      let tx = dx, tz = dz;
      if (mag < 0.2) {  // sans direction : vers le ballon
        tx = ball.pos.x - p.pos.x;
        tz = ball.pos.z - p.pos.z;
      }
      p.startSlide(tx, tz);
    }
    for (const act of ['shoot', 'pass', 'cross']) {
      if (!inp.pressed(act)) continue;
      if (has) {  // on retient la course du joueur au moment où il commence à charger
        const moving = p.want.speed > 0.3;
        this.charge = { act, t: 0, dirX: moving ? p.want.x : 0, dirZ: moving ? p.want.z : 0, speed: moving ? p.want.speed : 0 };
      } else {
        this.buffer = { act, t: 0.5 };  // reprise de volée / passe en une touche si le ballon arrive
      }
    }
    if (this.charge.act) {
      if (!has) {
        this.charge.act = null;
      } else {
        this.charge.t += dt;
        const max = this.charge.act === 'shoot' ? SHOT.chargeTime : PASS.chargeTime;
        const power = Math.min(1, this.charge.t / max);
        if (!inp.btn[this.charge.act].down || this.charge.t >= max + 0.15) {
          const act = this.charge.act;
          this.charge.act = null;
          this.execute(p, act, power, mag > 0.3 ? dx : null, mag > 0.3 ? dz : null);
        }
      }
    }
    const label = { shoot: 'Tir', pass: 'Passe', cross: 'Centre' }[this.charge.act];
    this.hud.power(this.charge.act ? Math.min(1, this.charge.t / (this.charge.act === 'shoot' ? SHOT.chargeTime : PASS.chargeTime)) : null, label);
  }

  // Distance entre le pied du joueur et le ballon
  footDist(p) {
    const f = p.forward(tmpF), b = this.ball.pos;
    return Math.hypot(b.x - (p.pos.x + f.x * 0.3), b.z - (p.pos.z + f.z * 0.3));
  }
  canKick(p) {
    return this.ball.owner === p && (this.ball.held || this.footDist(p) <= PLAYER.dribble.kickReach);
  }

  // Le joueur frappe dès que le ballon est à portée de pied (il a jusqu'à 0,7 s pour le rattraper)
  execute(p, act, power, dx, dz) {
    if (!this.canKick(p)) {
      this.pending = { p, act, power, dx, dz, t: 0.7 };
      return;
    }
    this.pending = null;
    this.kick(p, act, power, dx, dz);
  }
  firePending(dt) {
    const k = this.pending;
    if (!k) return;
    if (this.ball.owner !== k.p || this.state !== 'play') {
      this.pending = null;
      return;
    }
    if (this.canKick(k.p)) {
      this.pending = null;
      this.kick(k.p, k.act, k.power, k.dx, k.dz);
    } else if ((k.t -= dt) <= 0) {
      this.pending = null;
    }
  }
  kick(p, act, power, dx, dz) {
    if (act === 'shoot') this.shoot(p, power, dz === null ? null : clamp(dz * 2.7, -2.7, 2.7));
    else if (act === 'pass') this.pass(p, power, { dx, dz });
    else this.cross(p, power, { dx, dz });
  }

  switchPlayer() {
    const ball = this.ball;
    const list = this.teams[0].players.filter((q) => q !== this.controlled && !q.isKeeper)
      .sort((a, b) => a.pos.distanceToSquared(ball.pos) - b.pos.distanceToSquared(ball.pos));
    if (list.length) this.setControlled(list[0]);
  }

  // ---------- Frappes ----------
  release(p, vx, vy, vz) {
    const b = this.ball;
    b.owner = null;
    b.held = false;
    b.vel.set(vx, vy, vz);
    b.pos.y = Math.max(b.pos.y, R);
    b.lastTouch = p;
    p.timers.noPickup = PLAYER.kickNoPickup;
    p.aiT = 0;
    p.kick();
    for (const q of this.all) q.receiveT = 0;
  }

  // Tir : la puissance (0 à 1) vient du temps d'appui. aimZ : où viser dans la largeur du but (null = au hasard
  // pour l'IA, ou petit filet opposé pour le joueur sans direction)
  shoot(p, power, aimZ) {
    const team = this.teams[p.team], b = this.ball, gx = team.dir * PITCH.halfL;
    if (aimZ === null) {
      aimZ = p.isUser ? -Math.sign(b.pos.z || 0.01) * 2.4 : (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 1.7);
    }
    const dx = gx - b.pos.x, dz = aimZ - b.pos.z, dist = Math.hypot(dx, dz);
    const speed = SHOT.minSpeed + (SHOT.maxSpeed - SHOT.minSpeed) * power;
    const running = Math.hypot(p.vel.x, p.vel.z) > 7.5 ? 0.03 : 0;
    // Trop de puissance, trop loin ou en pleine course : moins précis. Les adversaires selon la difficulté.
    const err = (0.015 + 0.08 * power ** 3 + dist / 1200 + running) * (p.team === 1 ? this.diff.shotError : 1);
    const ang = Math.atan2(dz, dx) + gauss() * err;
    const height = clamp(SHOT.height + power * SHOT.heightPerPower + gauss() * err * 8, 0.15, 4);
    this.release(p, Math.cos(ang) * speed, shotLift(speed, dist, height), Math.sin(ang) * speed);
    this.ball.shotBy = p;
  }

  // Passe à terre vers un coéquipier dans la direction voulue (ou vers l'avant), en anticipant sa course
  pass(p, power, { dx = null, dz = null, target = null } = {}) {
    const b = this.ball;
    if (dx === null) {
      const f = p.forward(tmpV);
      dx = f.x;
      dz = f.z;
    }
    const recv = target || this.passTarget(p, dx, dz);
    let ax, az;
    if (recv) {
      const lead = Math.min(1.1, Math.hypot(recv.pos.x - b.pos.x, recv.pos.z - b.pos.z) / 16);
      ax = recv.pos.x + recv.vel.x * lead;
      az = recv.pos.z + recv.vel.z * lead;
    } else {
      ax = b.pos.x + dx * (12 + power * 14);
      az = b.pos.z + dz * (12 + power * 14);
    }
    ax = clamp(ax, -PITCH.halfL + 0.5, PITCH.halfL - 0.5);
    az = clamp(az, -PITCH.halfW + 0.5, PITCH.halfW - 0.5);
    const vx = ax - b.pos.x, vz = az - b.pos.z, d = Math.hypot(vx, vz) || 1;
    const v0 = clamp(speedForRoll(d, PASS.arriveSpeed + power * 4), PASS.minSpeed, PASS.maxSpeed);
    this.release(p, (vx / d) * v0, 0, (vz / d) * v0);
    this.expect(recv, ax, az, 2.2);
  }

  // Centre (ou longue passe en l'air si on n'est pas près de la surface adverse)
  cross(p, power, { dx = null, dz = null } = {}) {
    const team = this.teams[p.team], b = this.ball, gx = team.dir * PITCH.halfL;
    let recv = null, ax, az;
    if (b.pos.x * team.dir > PITCH.halfL - 35) {
      const spotX = gx - team.dir * 9;
      const inBox = team.players.filter((q) => q !== p && !q.isKeeper && Math.abs(q.pos.z) < 20 && q.pos.x * team.dir > PITCH.halfL - 19);
      inBox.sort((a, c) => Math.hypot(a.pos.x - spotX, a.pos.z) - Math.hypot(c.pos.x - spotX, c.pos.z));
      recv = inBox[0] || null;
      if (recv) {
        ax = recv.pos.x + recv.vel.x * 0.9;
        az = recv.pos.z + recv.vel.z * 0.9;
      } else {
        ax = gx - team.dir * (8 + Math.random() * 4);
        az = (Math.random() - 0.5) * 8;
      }
    } else {
      if (dx === null) {
        const f = p.forward(tmpV);
        dx = f.x;
        dz = f.z;
      }
      recv = this.passTarget(p, dx, dz);
      const L = 22 + power * 18;
      ax = recv ? recv.pos.x + recv.vel.x * 1.2 : b.pos.x + dx * L;
      az = recv ? recv.pos.z + recv.vel.z * 1.2 : b.pos.z + dz * L;
    }
    ax = clamp(ax, -PITCH.halfL + 1, PITCH.halfL - 1);
    az = clamp(az, -PITCH.halfW + 1, PITCH.halfW - 1);
    const d = Math.hypot(ax - b.pos.x, az - b.pos.z);
    const T = 0.85 + d / 32 + (1 - power) * 0.25;
    const v = lobVelocity(ax - b.pos.x, az - b.pos.z, T, tmpV);
    this.release(p, v.x, v.y, v.z);
    this.expect(recv, ax, az, T + 0.6);
  }

  // Le receveur va vers le point d'arrivée ; si c'est un coéquipier du joueur, il en prend le contrôle
  expect(recv, x, z, t) {
    if (!recv) return;
    recv.receiveT = t;
    recv.receiveX = x;
    recv.receiveZ = z;
    if (recv.team === 0 && !this.autoplay) this.setControlled(recv);
  }

  // Coéquipier le mieux placé dans la direction (dx, dz) : dans un cône de 60°, pas trop loin, ligne libre
  passTarget(p, dx, dz) {
    const opp = this.teams[1 - p.team].players;
    let best = null, bestS = -Infinity;
    for (const q of this.teams[p.team].players) {
      if (q === p) continue;
      const vx = q.pos.x - p.pos.x, vz = q.pos.z - p.pos.z, d = Math.hypot(vx, vz);
      if (d < 3 || d > 55) continue;
      const cos = (vx * dx + vz * dz) / d;
      if (cos < 0.5) continue;
      let s = cos * 3 - d / 25 - (q.isKeeper ? 2 : 0);
      if (laneBlocked(p.pos, q.pos, opp)) s -= 1.5;
      if (s > bestS) {
        bestS = s;
        best = q;
      }
    }
    return best;
  }

  // Passe décidée par l'IA, vers un coéquipier démarqué. mode : 'forward' (au moins 3 m vers le but adverse),
  // 'back' (en retrait, coup d'envoi) ou 'any'
  aiPass(p, mode = 'any') {
    const backwards = mode === 'back';
    const team = this.teams[p.team], opp = this.teams[1 - p.team].players;
    let best = null, bestS = -Infinity;
    for (const q of team.players) {
      if (q === p || (q.isKeeper && !backwards)) continue;
      const vx = q.pos.x - p.pos.x, vz = q.pos.z - p.pos.z, d = Math.hypot(vx, vz);
      if (d < 4 || d > 40) continue;
      const progress = vx * team.dir;
      if (mode === 'forward' && progress < 3) continue;
      let open = Infinity;
      for (const o of opp) open = Math.min(open, Math.hypot(o.pos.x - q.pos.x, o.pos.z - q.pos.z));
      let s = (backwards ? -progress : progress) * 0.12 + Math.min(open, 10) * 0.25 - d / 35;
      if (laneBlocked(p.pos, q.pos, opp)) s -= 3;
      if (s > bestS) {
        bestS = s;
        best = q;
      }
    }
    if (!best) return false;
    this.pass(p, 0.4, { target: best });
    return true;
  }

  // Le gardien relance : passe courte à un défenseur libre, sinon dégagement lobé
  keeperRelease(k) {
    const team = this.teams[k.team];
    const opp = this.teams[1 - k.team].players;
    let best = null, bestS = -Infinity;
    for (const q of team.players) {
      if (q === k) continue;
      let open = Infinity;
      for (const o of opp) open = Math.min(open, Math.hypot(o.pos.x - q.pos.x, o.pos.z - q.pos.z));
      const d = Math.hypot(q.pos.x - k.pos.x, q.pos.z - k.pos.z);
      const s = Math.min(open, 12) - d / 12;
      if (s > bestS) {
        bestS = s;
        best = q;
      }
    }
    if (!best) return;
    const d = Math.hypot(best.pos.x - k.pos.x, best.pos.z - k.pos.z);
    this.ball.pos.y = R;
    if (d < 28) {
      this.pass(k, 0.5, { target: best });
    } else {
      const v = lobVelocity(best.pos.x - k.pos.x, best.pos.z - k.pos.z, 1.2 + d / 30, tmpV);
      this.release(k, v.x, v.y, v.z);
      this.expect(best, best.pos.x, best.pos.z, 2.5);
    }
  }

  // ---------- Possession ----------
  // Prise de balle. Un gardien dans sa surface le prend dans les mains ; un joueur l'amortit (le ballon garde
  // la vitesse du joueur, puis la conduite de balle prend le relais).
  give(p) {
    const b = this.ball;
    b.owner = p;
    b.lastTouch = p;
    b.inGoal = 0;
    b.held = p.isKeeper && this.inOwnBox(p, b.pos);
    if (b.held) b.vel.set(0, 0, 0);
    else b.vel.set(p.vel.x * 0.8, Math.min(0, b.vel.y), p.vel.z * 0.8);
    p.aiT = 0;
    p.receiveT = 0;
    p.touchCool = 0.12;
    p.trapping = false;
    if (p.isKeeper) p.holdT = KEEPER.holdTime;
    if (p.team === 0 && !p.isKeeper && !this.autoplay) this.setControlled(p);
    if (this.buffer && p === this.controlled) {  // passe ou tir en une touche
      const act = this.buffer.act;
      this.buffer = null;
      const mv = this.input.move, mag = Math.hypot(mv.x, mv.y);
      this.execute(p, act, act === 'shoot' ? 0.65 : 0.4, mag > 0.3 ? mv.x / mag : null, mag > 0.3 ? -mv.y / mag : null);
    }
  }

  // Conduite de balle par petites touches : le ballon roule vraiment devant le joueur. Quand il revient près du
  // pied (ou part sur le côté), une touche le renvoie un peu devant, là où le joueur sera dans 0,4 s. À l'arrêt,
  // le joueur bloque le ballon sous la semelle. Trop loin : le ballon lui échappe (un adversaire peut le prendre).
  dribble(dt) {
    const b = this.ball, o = b.owner;
    if (!o) return;
    const f = o.forward(tmpV);
    if (b.held) {  // gardien : ballon dans les mains
      b.pos.set(o.pos.x + f.x * 0.35, 1.1, o.pos.z + f.z * 0.35);
      b.vel.set(0, 0, 0);
      return;
    }
    const D = PLAYER.dribble;
    const dx = b.pos.x - o.pos.x, dz = b.pos.z - o.pos.z, dist = Math.hypot(dx, dz);
    if (dist > D.keep || b.pos.y > 2) {
      b.owner = null;
      return;
    }
    o.touchCool -= dt;
    if (o.want.speed <= 0.3 || o.state !== 'run' || o.trapping) {
      if (this.footDist(o) < D.stop && b.pos.y < 0.5) {  // à l'arrêt : ballon bloqué devant le pied
        const tx = o.pos.x + f.x * D.foot, tz = o.pos.z + f.z * D.foot, k = Math.min(1, dt * 8);
        b.vel.x += ((tx - b.pos.x) * 4 - b.vel.x) * k;
        b.vel.z += ((tz - b.pos.z) * 4 - b.vel.z) * k;
      }
      return;
    }
    if (this.pending && this.pending.p === o) return;  // frappe demandée : il rattrape le ballon au lieu de le pousser
    // Pendant la charge d'une frappe : touches plus courtes, pour avoir le ballon à portée de pied en relâchant
    const preparing = o === this.controlled && !!this.charge.act;
    const wx = o.want.x, wz = o.want.z, speed = Math.hypot(o.vel.x, o.vel.z);
    const ahead = dx * wx + dz * wz, side = Math.abs(dx * wz - dz * wx);
    const due = ahead < D.foot + speed * 0.05 || side > 0.55;
    if (!due || o.touchCool > 0 || dist > D.kickReach || b.pos.y > 0.6) return;
    const T = preparing ? 0.3 : 0.35, lead = preparing ? D.foot : D.foot + 0.05 + speed * 0.07;  // ballon gardé près du pied
    const tx = o.pos.x + o.vel.x * T + wx * lead, tz = o.pos.z + o.vel.z * T + wz * lead;
    let vx = (tx - b.pos.x) / T, vz = (tz - b.pos.z) / T;
    const v = Math.hypot(vx, vz), max = speed + D.base + speed * D.gain + 2;
    if (v > max) {
      vx *= max / v;
      vz *= max / v;
    }
    b.vel.set(vx, 0, vz);
    b.lastTouch = o;
    o.touchCool = D.touchEvery;
    o.touch();
  }

  inOwnBox(p, pos) {
    const s = -this.teams[p.team].dir;
    return s * pos.x > PITCH.halfL - PITCH.penaltyDepth && Math.abs(pos.z) < PITCH.penaltyWidth / 2;
  }

  // Prise de balle : un ballon libre va au joueur le plus proche dans son rayon de contrôle (s'il n'est ni trop
  // haut ni trop rapide ; sinon il rebondit sur lui, voir ballBodies). Un ballon conduit peut être pris par un
  // adversaire plus près du ballon que le porteur, quand le porteur l'a poussé un peu loin.
  pickups() {
    const b = this.ball;
    if (b.held) return;
    const owner = b.owner, ownerD = owner ? this.footDist(owner) : Infinity;
    const speed = b.vel.length();
    let best = null, bestD = Infinity;
    for (const p of this.all) {
      if (p === owner || p.timers.noPickup > 0 || p.timers.ghost > 0 || p.state === 'slide' || p.state === 'dive') continue;
      // Ballon conduit : seulement s'il est vraiment loin du pied du porteur (sinon il faut le tacler)
      if (owner && (p.team === owner.team || ownerD < 0.9)) continue;
      const keeperZone = p.isKeeper && this.inOwnBox(p, b.pos);
      const range = keeperZone ? KEEPER.reach + 0.2 : PLAYER.controlRange;
      const maxH = keeperZone ? 2.5 : speed < 13 ? 1.7 : 0.95;
      if (b.pos.y > maxH || speed > (keeperZone ? KEEPER.catchSpeed : PLAYER.maxControlSpeed)) continue;
      const d = this.footDist(p);
      if (owner && d > ownerD - 0.2) continue;
      if (d < range && d < bestD) {
        best = p;
        bestD = d;
      }
    }
    if (!best) return;
    if (owner) owner.timers.noPickup = 0.35;
    this.give(best);
  }

  // Arrêts du gardien : quand le ballon passe à portée de ses mains, il a une chance de l'arrêter qui baisse
  // avec la vitesse du tir et quand il doit s'étirer. Arrêté : capté s'il n'est pas trop fort, sinon repoussé.
  // Raté : le ballon passe (le gardien devient « transparent » un instant).
  keeperSaves() {
    const b = this.ball;
    if (b.owner) return;
    for (const team of this.teams) {
      const k = team.players[0];
      const s = -team.dir;
      if (k.timers.noPickup > 0 || k.timers.ghost > 0 || s * b.vel.x <= 2) continue;
      const diving = k.state === 'dive';
      const reach = diving ? 1.3 : 0.8;
      const dx = b.pos.x - k.pos.x, dz = b.pos.z - k.pos.z;
      if (Math.abs(dx) < 0.75 && Math.abs(dz) < reach && b.pos.y < (diving ? 1.7 : 2.45)) {
        const sp = b.vel.length(), S = KEEPER.save;
        const stretch = Math.abs(dz) / reach + Math.max(0, b.pos.y - 1.9) * 1.5;
        const skill = team.index === 1 ? this.diff.oppKeeper : this.diff.ourKeeper;
        const chance = clamp((S.base - sp / S.speedDiv - stretch * S.stretch) * skill, S.min, S.max);
        if (Math.random() >= chance) {
          k.timers.ghost = 0.5;
          continue;
        }
        if (sp < KEEPER.catchSpeed * (diving ? 0.8 : 1) && stretch < 0.7) {
          this.give(k);
        } else {  // trop fort ou trop loin : il repousse
          b.vel.x = -b.vel.x * 0.3;
          b.vel.z = b.vel.z * 0.3 + (Math.sign(dz) || 1) * (3 + Math.random() * 3);
          b.vel.y = Math.abs(b.vel.y) * 0.3 + 2.5;
          b.lastTouch = k;
          k.timers.noPickup = 0.5;
        }
        this.hud.banner('Arrêt !', k.name, 900);
        return;
      }
    }
  }

  // Tacle glissé : le pied qui touche le ballon le fait sauter, même s'il est au pied d'un adversaire
  slideTackles() {
    const b = this.ball;
    for (const p of this.all) {
      if (p.state !== 'slide' || p.slideHit) continue;
      const f = p.forward(tmpV);
      const d = Math.hypot(b.pos.x - (p.pos.x + f.x * 0.75), b.pos.z - (p.pos.z + f.z * 0.75));
      if (d > PLAYER.slide.reach || b.pos.y > 0.6) continue;
      const o = b.owner;
      if (o && (o.team === p.team || b.held)) continue;  // pas de tacle sur un coéquipier ni sur un gardien qui tient le ballon
      if (o) {
        o.timers.noPickup = 0.8;
        o.stun(0.55);
      }
      b.owner = null;
      b.vel.set(f.x * 6.5 + (Math.random() - 0.5) * 2, 0.6, f.z * 6.5 + (Math.random() - 0.5) * 2);
      b.lastTouch = p;
      p.slideHit = true;
      p.timers.noPickup = 0.25;
    }
  }

  // Tacle debout de l'IA (appelé par l'IA quand elle presse le porteur)
  tryPoke(p) {
    const b = this.ball, o = b.owner;
    if (!o || o.team === p.team || b.held || p.pokeCool > 0) return false;
    const f = p.forward(tmpV);
    if (Math.hypot(b.pos.x - (p.pos.x + f.x * 0.4), b.pos.z - (p.pos.z + f.z * 0.4)) > PLAYER.poke.range) return false;
    const d = p.team === 1 ? this.diff : DIFFICULTIES.normal;  // les adversaires suivent la difficulté
    p.pokeCool = d.pokeEvery;
    p.touch();
    if (Math.random() >= d.pokeChance) return false;
    o.timers.noPickup = 0.6;
    o.stun(0.35);
    b.owner = null;
    const ax = p.pos.x - b.pos.x, az = p.pos.z - b.pos.z, ad = Math.hypot(ax, az) || 1;
    b.vel.set((ax / ad) * 2.5 + (Math.random() - 0.5) * 2, 0, (az / ad) * 2.5 + (Math.random() - 0.5) * 2);
    b.lastTouch = p;
    return true;
  }

  // Ballon libre qui heurte un joueur sans être contrôlé (trop rapide, trop haut) : il rebondit
  ballBodies() {
    const b = this.ball;
    if (b.held || b.pos.y > 1.9) return;
    for (const p of this.all) {
      if (p === b.owner || (p.timers.noPickup > 0 && p === b.lastTouch) || p.timers.ghost > 0) continue;
      const dx = b.pos.x - p.pos.x, dz = b.pos.z - p.pos.z, d = Math.hypot(dx, dz), min = PLAYER.radius * 0.8 + R;
      if (d >= min || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d;
      b.pos.x = p.pos.x + nx * min;
      b.pos.z = p.pos.z + nz * min;
      const vn = b.vel.x * nx + b.vel.z * nz;
      if (vn < 0) {
        b.vel.x = (b.vel.x - 1.5 * vn * nx) * 0.6;
        b.vel.z = (b.vel.z - 1.5 * vn * nz) * 0.6;
      }
      b.lastTouch = p;
    }
  }

  // Les joueurs ne se traversent pas (écartement doux, pour éviter qu'ils glissent les uns sur les autres)
  separatePlayers(dt) {
    const all = this.all, min = PLAYER.radius * 2;
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      for (let j = i + 1; j < all.length; j++) {
        const c = all[j];
        const dx = c.pos.x - a.pos.x, dz = c.pos.z - a.pos.z, d2 = dx * dx + dz * dz;
        if (d2 >= min * min || d2 < 1e-8) continue;
        const d = Math.sqrt(d2), push = Math.min((min - d) / 2, 3 * dt), nx = dx / d, nz = dz / d;
        a.pos.x -= nx * push;
        a.pos.z -= nz * push;
        c.pos.x += nx * push;
        c.pos.z += nz * push;
      }
    }
    for (const p of all) {  // pas plus loin que le bord du terrain (+ 4 m)
      p.pos.x = clamp(p.pos.x, -PITCH.halfL - 4, PITCH.halfL + 4);
      p.pos.z = clamp(p.pos.z, -PITCH.halfW - 3, PITCH.halfW + 3);
    }
  }

  // ---------- Règles : but et sorties ----------
  rules() {
    const b = this.ball.pos;
    if (this.ball.inGoal) {
      const s = this.ball.inGoal;
      if (s * (b.x - s * PITCH.halfL) > R) this.goal(s);
      return;
    }
    if (Math.abs(b.x) > PITCH.halfL + R || Math.abs(b.z) > PITCH.halfW + R) this.out();
  }

  goal(s) {
    const team = this.teams.find((t) => t.dir === s);
    team.score++;
    const last = this.ball.lastTouch;
    const own = last && last.team !== team.index;
    this.ball.owner = null;
    this.state = 'goal';
    this.stateT = MATCH.goalPause;
    this.restart = { type: 'kickoff', team: 1 - team.index };
    this.charge.act = null;
    this.buffer = null;
    this.hud.power(null);
    this.hud.setScore(this.teams[0].score, this.teams[1].score);
    this.hud.banner(own ? 'But contre son camp' : 'BUT !', team.def.name + (last && !own ? ' · ' + last.name : ''), 2400);
    for (const p of team.players) if (!p.isKeeper) p.celebrate(MATCH.goalPause);
  }

  out() {
    const b = this.ball.pos, last = this.ball.lastTouch, lastTeam = last ? last.team : 0;
    let r;
    if (Math.abs(b.z) > PITCH.halfW + R) {
      r = { type: 'throw', team: 1 - lastTeam, x: clamp(b.x, -PITCH.halfL + 2, PITCH.halfL - 2), z: Math.sign(b.z) * (PITCH.halfW - 1.3), label: 'Touche' };
    } else {
      const s = Math.sign(b.x), defending = this.teams.find((t) => t.dir === -s).index;
      if (lastTeam === defending) {
        r = { type: 'corner', team: 1 - defending, x: s * (PITCH.halfL - 1.2), z: (Math.sign(b.z) || 1) * (PITCH.halfW - 1.2), label: 'Corner' };
      } else {
        r = { type: 'goalkick', team: defending, x: s * (PITCH.halfL - PITCH.goalAreaDepth), z: (Math.sign(b.z) || 1) * 4.5, label: 'Six mètres' };
      }
    }
    this.ball.owner = null;
    this.ball.vel.set(0, 0, 0);
    this.state = 'out';
    this.stateT = MATCH.outPause;
    this.restart = r;
    this.charge.act = null;
    this.hud.power(null);
    this.hud.banner(r.label, this.teams[r.team].def.name, 1100);
  }

  // Reprise du jeu après un but ou une sortie (remise en jeu simplifiée : le tireur repart ballon au pied,
  // placé dans le terrain juste derrière le ballon et tourné vers l'intérieur)
  resume() {
    const r = this.restart;
    if (!r || r.type === 'kickoff') return this.kickoff(r ? r.team : 0);
    const team = this.teams[r.team];
    let taker;
    if (r.type === 'goalkick') {
      taker = team.players[0];
    } else {
      const field = team.players.filter((p) => !p.isKeeper);
      field.sort((a, c) => Math.hypot(a.pos.x - r.x, a.pos.z - r.z) - Math.hypot(c.pos.x - r.x, c.pos.z - r.z));
      taker = field[0];
    }
    const ix = r.type === 'throw' ? 0 : -Math.sign(r.x), iz = r.type === 'goalkick' ? 0 : -Math.sign(r.z);
    const id = Math.hypot(ix, iz) || 1;
    taker.reset(r.x - (ix / id) * 0.7, r.z - (iz / id) * 0.7, Math.atan2(ix / id, iz / id));
    this.ball.place(r.x, r.z);
    for (const p of this.teams[1 - r.team].players) {  // les adversaires reculent à 4 m
      const dx = p.pos.x - r.x, dz = p.pos.z - r.z, d = Math.hypot(dx, dz);
      if (d < 4) {
        p.pos.x = r.x + ((dx || 1) / (d || 1)) * 4;
        p.pos.z = r.z + (dz / (d || 1)) * 4;
      }
    }
    this.state = 'play';
    this.restart = null;
    this.give(taker);
    if (taker.isKeeper) taker.holdT = KEEPER.holdTime * 0.8;
  }

  // ---------- Dessin des repères ----------
  updateMarkers() {
    const p = this.controlled;
    const show = !!p && this.state !== 'goal';
    this.ring.visible = this.arrow.visible = show;
    if (show) {
      this.ring.position.set(p.pos.x, 0.03, p.pos.z);
      this.arrow.position.set(p.pos.x, 2.35 + Math.sin(this.time * 6) * 0.08, p.pos.z);
    }
    const m = this.shadowM;
    this.all.forEach((q, i) => {
      m.makeScale(1.1, 1, 1.1);
      m.setPosition(q.pos.x, 0.02, q.pos.z);
      this.shadows.setMatrixAt(i, m);
    });
    const b = this.ball.pos, s = Math.max(0.25, 0.5 - b.y * 0.06);
    m.makeScale(s, 1, s);
    m.setPosition(b.x, 0.021, b.z);
    this.shadows.setMatrixAt(this.all.length, m);
    this.shadows.instanceMatrix.needsUpdate = true;
  }
}

// Un adversaire à moins de 1,6 m de la ligne de passe ?
function laneBlocked(a, b, opponents) {
  const vx = b.x - a.x, vz = b.z - a.z, len2 = vx * vx + vz * vz || 1;
  for (const o of opponents) {
    const t = clamp(((o.pos.x - a.x) * vx + (o.pos.z - a.z) * vz) / len2, 0, 1);
    const px = a.x + vx * t - o.pos.x, pz = a.z + vz * t - o.pos.z;
    if (t > 0.1 && t < 0.95 && px * px + pz * pz < 1.6 * 1.6) return true;
  }
  return false;
}
