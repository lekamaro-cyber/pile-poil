// Joueur : silhouette humanoïde en volumes simples (9 morceaux articulés, couleurs par sommet), déplacement
// (accélération, virages) et animations calculées : course, frappe, tacle glissé, plongeon, célébration.
import * as THREE from 'three';
import { PLAYER, KEEPER } from '../config.js';
import { merge, boxAt } from '../engine/geometry.js';

const geoCache = new Map();
let material = null;
const mat = () => material || (material = new THREE.MeshLambertMaterial({ vertexColors: true }));
function geo(key, build) {
  if (!geoCache.has(key)) geoCache.set(key, merge(build(), true));
  return geoCache.get(key);
}

// Morceaux du corps (repère local : le joueur regarde vers +z)
const trunkGeo = (kit, skin, hair) => geo(`trunk|${kit.shirt}|${kit.shorts}|${kit.trim}|${skin}|${hair}`, () => [
  { geometry: boxAt(0.36, 0.24, 0.23, 0, -0.03, 0), color: kit.shorts },
  { geometry: boxAt(0.42, 0.5, 0.24, 0, 0.35, 0), color: kit.shirt },
  { geometry: boxAt(0.43, 0.06, 0.245, 0, 0.58, 0), color: kit.trim },
  { geometry: boxAt(0.18, 0.22, 0.012, 0, 0.36, -0.126), color: kit.trim },  // numéro (dos)
  { geometry: boxAt(0.1, 0.1, 0.1, 0, 0.65, 0), color: skin },
  { geometry: new THREE.SphereGeometry(0.115, 10, 8).translate(0, 0.8, 0), color: skin },
  { geometry: new THREE.SphereGeometry(0.122, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).translate(0, 0.815, -0.012), color: hair },
]);
const thighGeo = (kit, skin) => geo(`thigh|${kit.shorts}|${skin}`, () => [
  { geometry: boxAt(0.155, 0.13, 0.165, 0, -0.06, 0), color: kit.shorts },
  { geometry: boxAt(0.14, 0.31, 0.15, 0, -0.27, 0), color: skin },
]);
const shinGeo = (kit) => geo(`shin|${kit.socks}`, () => [
  { geometry: boxAt(0.125, 0.38, 0.13, 0, -0.19, 0), color: kit.socks },
  { geometry: boxAt(0.12, 0.08, 0.25, 0, -0.42, 0.05), color: '#121212' },
]);
const upperArmGeo = (kit) => geo(`uarm|${kit.shirt}`, () => [{ geometry: boxAt(0.1, 0.27, 0.11, 0, -0.13, 0), color: kit.shirt }]);
const foreArmGeo = (kit, skin) => geo(`farm|${skin}|${kit.gloves || skin}`, () => [
  { geometry: boxAt(0.085, 0.22, 0.09, 0, -0.11, 0), color: skin },
  { geometry: boxAt(0.09, 0.09, 0.1, 0, -0.26, 0), color: kit.gloves || skin },
]);

const KICK_TIME = 0.38;
const TOUCH_TIME = 0.22;
const fwd = new THREE.Vector3();
const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const smooth = (cur, target, k) => cur + (target - cur) * k;

export class Player {
  // team : 0 (équipe du joueur) ou 1 ; slot : poste dans la formation ; kit : couleurs
  constructor({ team, slot, number, kit, skin, hair, name }) {
    this.team = team;
    this.slot = slot;
    this.role = slot.role;
    this.isKeeper = slot.role === 'GK';
    this.number = number;
    this.name = name;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.heading = 0;
    this.want = { x: 0, z: 0, speed: 0 };
    this.faceAt = null;
    this.state = 'run';        // run | slide | recover | dive | stun | celebrate
    this.stateT = 0;
    this.timers = { noPickup: 0, kick: 0, touch: 0, ghost: 0 };  // ghost : le ballon le traverse (gardien battu)
    this.speedMul = 1;         // vitesse selon la difficulté (adversaires)
    this.touchCool = 0;
    this.phase = Math.random() * 6;
    this.slideHit = false;
    this.diveRoll = 0;
    this.isUser = false;
    // Pose courante (lissée)
    this.pose = { hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, shL: 0, shR: 0, elL: 0, elR: 0, armOut: 0.1, lean: 0, roll: 0, bob: 0 };
    this.build(kit, skin, hair);
  }

  build(kit, skin, hair) {
    const m = mat();
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.body.position.y = 0.95;
    this.root.add(this.body);
    this.body.add(new THREE.Mesh(trunkGeo(kit, skin, hair), m));
    const leg = (side) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.1, -0.08, 0);
      hip.add(new THREE.Mesh(thighGeo(kit, skin), m));
      const knee = new THREE.Group();
      knee.position.y = -0.42;
      knee.add(new THREE.Mesh(shinGeo(kit), m));
      hip.add(knee);
      this.body.add(hip);
      return [hip, knee];
    };
    const arm = (side) => {
      const sh = new THREE.Group();
      sh.position.set(side * 0.27, 0.53, 0);
      sh.add(new THREE.Mesh(upperArmGeo(kit), m));
      const el = new THREE.Group();
      el.position.y = -0.27;
      el.add(new THREE.Mesh(foreArmGeo(kit, skin), m));
      sh.add(el);
      this.body.add(sh);
      return [sh, el];
    };
    [this.hipL, this.kneeL] = leg(1);
    [this.hipR, this.kneeR] = leg(-1);
    [this.shL, this.elL] = arm(1);
    [this.shR, this.elR] = arm(-1);
    const s = 0.96 + Math.random() * 0.08;
    this.root.scale.setScalar(s);
  }

  forward(out = fwd) {
    return out.set(Math.sin(this.heading), 0, Math.cos(this.heading));
  }

  // ---------- Ordres de déplacement (donnés par les commandes ou l'IA à chaque image) ----------
  move(dx, dz, speed) {
    const d = Math.hypot(dx, dz);
    if (d < 1e-4 || speed <= 0) {
      this.want.speed = 0;
      return;
    }
    this.want.x = dx / d;
    this.want.z = dz / d;
    this.want.speed = speed * this.speedMul;
  }
  moveTo(x, z, speed, arrive = 0.4) {
    const dx = x - this.pos.x, dz = z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < arrive) return this.move(0, 0, 0);
    this.move(dx, dz, d < 2.5 ? Math.min(speed, 1.2 + d * 1.6) : speed);  // on ralentit en arrivant
  }
  face(x, z) {
    this.faceAt = { x, z };
  }
  reset(x, z, heading) {
    this.pos.set(x, 0, z);
    this.vel.set(0, 0, 0);
    this.heading = heading;
    this.want.speed = 0;
    this.state = 'run';
    this.stateT = 0;
    this.timers.noPickup = 0;
    this.timers.kick = 0;
    this.timers.ghost = 0;
    this.receiveT = 0;
    this.root.position.copy(this.pos);
    this.root.rotation.y = heading;
  }

  // ---------- Actions ----------
  kick() {
    this.timers.kick = KICK_TIME;
  }
  // Petite touche de balle pendant la conduite
  touch() {
    this.timers.touch = TOUCH_TIME;
  }
  startSlide(dx, dz) {
    const d = Math.hypot(dx, dz) || 1;
    this.state = 'slide';
    this.stateT = PLAYER.slide.time;
    this.slideHit = false;
    this.heading = Math.atan2(dx / d, dz / d);
    this.vel.set((dx / d) * PLAYER.slide.speed, 0, (dz / d) * PLAYER.slide.speed);
  }
  // Plongeon du gardien : side = direction en z (-1 ou 1)
  dive(side, speed) {
    this.state = 'dive';
    this.stateT = KEEPER.diveTime;
    this.vel.set(0, 0, side * speed);
    // côté vers lequel le corps bascule, selon l'orientation du gardien
    const leftX = Math.cos(this.heading), leftZ = -Math.sin(this.heading);
    this.diveRoll = (leftX * 0 + leftZ * side) > 0 ? -1.35 : 1.35;
  }
  stun(t) {
    if (this.state === 'slide' || this.state === 'dive') return;
    this.state = 'stun';
    this.stateT = t;
  }
  celebrate(t) {
    this.state = 'celebrate';
    this.stateT = t;
  }

  // ---------- Mise à jour : déplacement puis animation ----------
  update(dt) {
    for (const k in this.timers) this.timers[k] = Math.max(0, this.timers[k] - dt);
    if (this.stateT > 0) {
      this.stateT -= dt;
      if (this.stateT <= 0) {
        this.stateT = 0;
        if (this.state === 'slide') {
          this.state = 'recover';
          this.stateT = PLAYER.slide.recover;
        } else {
          this.state = 'run';
        }
      }
    }

    if (this.state === 'slide' || this.state === 'dive') {
      const k = Math.max(0, 1 - dt * (this.state === 'slide' ? 1.8 : 2.4));
      this.vel.x *= k;
      this.vel.z *= k;
    } else {
      let cap = this.want.speed;
      if (this.state === 'stun') cap = Math.min(cap, 1.2);
      if (this.state === 'recover') cap = Math.min(cap, 2.2);
      if (this.state === 'celebrate') cap = Math.min(cap, 3);
      const tx = this.want.x * cap, tz = this.want.z * cap;
      let dx = tx - this.vel.x, dz = tz - this.vel.z;
      // Démarrer est plus lent que freiner : on freine fort pour ralentir ou changer de direction (pas de glissade)
      const cur = Math.hypot(this.vel.x, this.vel.z);
      const braking = cap < cur - 0.2 || tx * this.vel.x + tz * this.vel.z < cur * cap * 0.5;
      const dv = Math.hypot(dx, dz), max = (braking ? PLAYER.brake : PLAYER.accel) * dt;
      if (dv > max) {
        dx *= max / dv;
        dz *= max / dv;
      }
      this.vel.x += dx;
      this.vel.z += dz;
    }
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;

    // Orientation : dans le sens de la course, sinon vers le point regardé
    const speed = Math.hypot(this.vel.x, this.vel.z);
    if (this.state !== 'slide' && this.state !== 'dive') {
      let target = null;
      if (speed > 0.6 && this.want.speed > 0) target = Math.atan2(this.vel.x, this.vel.z);
      else if (this.faceAt) target = Math.atan2(this.faceAt.x - this.pos.x, this.faceAt.z - this.pos.z);
      if (target !== null) this.heading = lerpAngle(this.heading, target, Math.min(1, PLAYER.turnSpeed * dt));
    }
    this.root.position.set(this.pos.x, 0, this.pos.z);
    this.root.rotation.y = this.heading;
    this.animate(dt, speed);
  }

  animate(dt, speed) {
    // Foulées : la fréquence suit la vitesse (environ 1 m par pas en trottinant, 1,6 m en sprint) : pas de patinage
    const amp = Math.min(1, speed / 4.5);
    this.phase += dt * Math.PI * 2 * (speed > 0.25 ? 0.9 + speed * 0.2 : 0.5);
    const s = Math.sin(this.phase), c = Math.cos(this.phase);
    const t = {
      hipL: -s * 0.75 * amp, hipR: s * 0.75 * amp,
      kneeL: 0.05 + (0.1 + 0.9 * Math.max(0, c)) * amp, kneeR: 0.05 + (0.1 + 0.9 * Math.max(0, -c)) * amp,
      shL: s * 0.6 * amp, shR: -s * 0.6 * amp,
      elL: -0.35 - 0.7 * amp, elR: -0.35 - 0.7 * amp,
      armOut: 0.1, lean: 0.14 * Math.min(1, speed / 8), roll: 0, bob: Math.abs(s) * 0.05 * amp,
    };
    if (this.isKeeper && speed < 1.5 && this.state === 'run') {  // gardien : position d'attente
      Object.assign(t, { hipL: -0.35, hipR: -0.35, kneeL: 0.6, kneeR: 0.6, lean: 0.3, shL: -0.7, shR: -0.7, elL: -0.6, elR: -0.6, armOut: 0.35, bob: -0.12 });
    }
    if (this.timers.kick > 0) {  // frappe : jambe droite armée puis lancée vers l'avant
      const k = 1 - this.timers.kick / KICK_TIME;
      t.hipR = k < 0.35 ? (k / 0.35) * 0.9 : 0.9 - Math.min(1, (k - 0.35) / 0.35) * 2.2;
      t.kneeR = k < 0.35 ? 1.2 : Math.max(0.05, 1.2 - (k - 0.35) * 5);
      t.hipL = -0.15;
      t.kneeL = 0.25;
      t.shL = -0.6;
      t.shR = 0.5;
      t.armOut = 0.5;
      t.lean = -0.08;
    }
    if (this.timers.touch > 0 && this.timers.kick <= 0) {  // touche de balle : petit coup de pied droit
      const k = 1 - this.timers.touch / TOUCH_TIME;
      t.hipR = k < 0.4 ? 0.25 : 0.25 - Math.min(1, (k - 0.4) / 0.3) * 0.85;
      t.kneeR = k < 0.4 ? 0.6 : 0.15;
    }
    if (this.state === 'slide') {
      Object.assign(t, { hipL: -1.4, hipR: -1.1, kneeL: 0.1, kneeR: 0.7, lean: -1.0, bob: -0.55, shL: -0.2, shR: 0.9, armOut: 0.6 });
    } else if (this.state === 'dive') {
      Object.assign(t, { hipL: -0.3, hipR: 0.2, kneeL: 0.3, kneeR: 0.5, shL: -2.9, shR: -2.9, elL: 0, elR: 0, armOut: 0.2, roll: this.diveRoll, bob: -0.25, lean: 0 });
    } else if (this.state === 'celebrate') {
      const j = Math.abs(Math.sin(this.phase * 0.8));
      Object.assign(t, { shL: -2.8, shR: -2.8, elL: -0.2, elR: -0.2, armOut: 0.5, bob: j * 0.25, lean: -0.05 });
    } else if (this.state === 'stun') {
      t.lean = -0.25;
      t.armOut = 0.6;
    }
    const k = Math.min(1, dt * 16), p = this.pose;
    for (const key in t) p[key] = smooth(p[key], t[key], k);
    this.hipL.rotation.x = p.hipL;
    this.hipR.rotation.x = p.hipR;
    this.kneeL.rotation.x = p.kneeL;
    this.kneeR.rotation.x = p.kneeR;
    this.shL.rotation.x = p.shL;
    this.shR.rotation.x = p.shR;
    this.shL.rotation.z = p.armOut;
    this.shR.rotation.z = -p.armOut;
    this.elL.rotation.x = p.elL;
    this.elR.rotation.x = p.elR;
    this.body.rotation.x = p.lean;
    this.body.rotation.z = p.roll;
    this.body.position.y = 0.95 + p.bob;
  }
}
