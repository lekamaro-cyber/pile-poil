// Un combattant : caractéristiques, santé (tête, corps, jambes), énergie, état (debout, en train de frapper, au
// sol, sonné, KO…), déplacements et pose du corps à chaque image. Les règles entre les deux combattants (coups qui
// touchent, amenées au sol, soumissions) sont dans fight.js.
import { STRIKES, RULES, STYLES, SKINS, HAIRS, WEIGHT_SCALE } from './data.js';
import { FighterModel, STANCE } from './fighterModel.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

// Poses (seulement les angles qui changent par rapport à la garde)
const PEAK = {
  jab: { twist: -0.6, lean: 0.18, head: 0.15, shLx: -1.57, shLy: -0.05, shLz: -0.05, elL: -0.05 },
  cross: { twist: 0.45, turn: 0.12, lean: 0.22, shRx: -1.57, shRy: 0.08, shRz: 0.05, elR: -0.05, hipRx: 0.45, kneeR: 0.15 },
  hook: { twist: 0.25, lean: 0.12, shLx: -0.15, shLy: -0.85, shLz: 1.35, elL: -1.45 },
  upper: { twist: 0.3, lean: -0.05, crouch: -0.02, shRx: -1.25, shRy: 0.2, shRz: 0.1, elR: -1.85 },
  low: { turn: 0.95, tilt: 0.18, lean: 0, hipRx: -0.55, hipRz: -0.75, kneeR: 0.25, kneeL: 0.25, shRx: 0.2, elR: -0.6 },
  body: { turn: 1.25, tilt: 0.38, lean: -0.08, hipRx: -0.8, hipRz: -1.05, kneeR: 0.12, kneeL: 0.2, shRx: 0.35, elR: -0.4 },
  high: { turn: 1.45, tilt: 0.65, lean: -0.22, hipRx: -0.95, hipRz: -1.5, kneeR: 0.08, kneeL: 0.18, shRx: 0.5, elR: -0.3 },
  teep: { turn: 0, lean: -0.3, hipLx: -1.55, kneeL: 0.15, hipRx: 0.15, kneeR: 0.3 },
  gpunch: { shRx: -1.05, shRy: 0.1, shRz: 0.05, elR: -0.1, twist: 0.35 },
  bpunch: { shLx: -2.45, elL: -0.2 },
};
const GUARD = { crouch: -0.1, head: 0.32, twist: 0, shLx: -1.35, shLy: 0.2, shLz: -0.35, elL: -2.35, shRx: -1.35, shRy: -0.2, shRz: 0.35, elR: -2.35 };
const SHOOT = { crouch: -0.38, lean: 0.95, turn: 0, twist: 0, head: -0.3, shLx: -1.3, shLy: 0, shLz: 0, elL: -0.5, shRx: -1.3, shRy: 0, shRz: 0, elR: -0.5, hipLx: -1.0, kneeL: 1.2, hipRx: 0.35, kneeR: 0.9 };
const SPRAWL = { crouch: -0.3, lean: 0.7, turn: 0, hipLx: 0.6, hipRx: 0.6, kneeL: 0.2, kneeR: 0.2, shLx: -1.0, elL: -0.6, shRx: -1.0, elR: -0.6 };
const BOTTOM = { crouch: -0.77, lie: -1.45, turn: 0, roll: 0, lean: 0.25, twist: 0, tilt: 0, head: 0.4, shLx: -2.5, shLy: 0, shLz: -0.2, elL: -1.6, shRx: -2.5, shRy: 0, shRz: 0.2, elR: -1.6, hipLx: -1.25, hipLz: 0.35, kneeL: 1.5, hipRx: -1.25, hipRz: -0.35, kneeR: 1.5 };
const TOP = { crouch: -0.48, lie: 0, turn: 0, roll: 0, lean: 0.75, twist: 0, tilt: 0, head: -0.2, shLx: -0.7, shLy: 0, shLz: -0.1, elL: -0.9, shRx: -0.7, shRy: 0, shRz: 0.1, elR: -0.9, hipLx: -0.5, hipLz: 0.2, kneeL: 1.9, hipRx: -0.5, hipRz: -0.2, kneeR: 1.9 };
const SUB_TOP = { lean: 1.15, head: -0.4, shLx: -1.7, shLz: 0.2, elL: -1.4, shRx: -1.7, shRz: -0.2, elR: -1.4 };
const SUB_BOTTOM = { hipLx: -2.1, kneeL: 1.4, hipRx: -2.1, kneeR: 1.4, shLx: -2.0, elL: -1.8, shRx: -2.0, elR: -1.8 };
const KO = { crouch: -0.8, lie: -1.52, turn: 0, roll: 0.1, lean: 0, twist: 0, tilt: 0, head: 0.1, shLx: -0.4, shLy: 0, shLz: 1.2, elL: -0.2, shRx: -0.4, shRy: 0, shRz: -1.2, elR: -0.2, hipLx: 0.1, hipLz: 0.15, kneeL: 0.15, hipRx: -0.1, hipRz: -0.15, kneeR: 0.2 };
const WIN = { crouch: 0, turn: 0, twist: 0, lean: -0.1, head: -0.25, shLx: -2.9, shLy: 0, shLz: 0.35, elL: -0.15, shRx: -2.9, shRy: 0, shRz: -0.35, elR: -0.15, hipLx: -0.05, kneeL: 0.05, hipRx: 0.05, kneeR: 0.05 };

export class Fighter {
  // def : { name, nick, style, stats, look: { skin (indice ou couleur), hair, shorts }, weight }
  constructor(scene, def) {
    this.def = def;
    this.name = def.name;
    this.stats = Object.assign({}, def.stats);
    this.style = STYLES[def.style] || STYLES.boxer;
    const look = def.look || {};
    this.model = new FighterModel(scene, {
      skin: typeof look.skin === 'number' ? SKINS[look.skin] : look.skin || SKINS[1],
      hair: typeof look.hair === 'number' ? HAIRS[look.hair] : look.hair || HAIRS[0],
      shorts: look.shorts || '#D32F2F', gloves: look.gloves,
    }, WEIGHT_SCALE[def.weight] || 1);
    this.pos = { x: 0, z: 0 };
    this.vel = { x: 0, z: 0 };
    this.heading = 0;
    this.target = Object.assign({}, STANCE);
    this.phase = 0;
    this.reset(0, 0, 0);
  }

  // Début du combat
  reset(x, z, heading) {
    this.pos.x = x;
    this.pos.z = z;
    this.vel.x = this.vel.z = 0;
    this.heading = heading;
    this.hp = { head: 100, body: 100, legs: 100 };
    this.stamina = 100;
    this.state = 'stand';
    this.action = null;
    this.queued = null;
    this.guard = false;
    this.ground = null;     // { role: 'top' | 'bottom' } quand le combat est au sol
    this.t = { hit: 0, rocked: 0, stagger: 0, sprawl: 0, quiet: 0, change: 0 };
    this.hitZone = null;
    this.intent = { move: { x: 0, z: 0 }, guard: false, press: null };
    this.stats.cardio = this.stats.cardio || 50;
    this.newRoundStats();
    this.total = { landed: 0, thrown: 0, takedowns: 0, tdAttempts: 0, subAttempts: 0, rocks: 0, damage: 0 };
    Object.assign(this.model.pose, STANCE);
    this.model.apply(x, z, heading);
  }
  newRoundStats() {
    this.round = { head: 0, body: 0, legs: 0, takedowns: 0, control: 0, subs: 0, rocks: 0 };
  }

  // ---------- Valeurs dérivées des caractéristiques et de la fatigue ----------
  get staminaMax() {
    return Math.max(35, 100 - (100 - this.hp.body) * 0.5);
  }
  get tired() {  // 1 = en forme, jusqu'à 0,6 quand l'énergie est vide
    return 0.6 + 0.4 * Math.min(1, this.stamina / 40);
  }
  get speedFactor() {
    return (0.75 + this.stats.speed / 200) * (0.6 + 0.4 * this.hp.legs / 100) * this.tired;
  }
  // Durée d'un coup (plus vite avec Vitesse, plus lent fatigué)
  timeScale() {
    return (1.15 - this.stats.speed / 300) / Math.min(1.05, this.tired + 0.1);
  }
  get busy() {
    return this.state !== 'stand' || !!this.action;
  }
  isDown() {
    return this.state === 'ko';
  }
  spend(n) {
    this.stamina = Math.max(0, this.stamina - n);
    this.t.quiet = 0;
  }

  // ---------- Coups ----------
  // Lance un coup (si possible). Renvoie true s'il part.
  strike(name) {
    const s = STRIKES[name];
    if (!s) return false;
    const onGround = !!this.ground;
    if (onGround !== (s.kind === 'ground')) return false;
    if (this.action) {  // coup demandé pendant le coup en cours : il partira juste après (enchaînement)
      if (this.action.phase !== 'windup') this.queued = { name, t: 0.35 };
      return false;
    }
    if (!onGround && this.state !== 'stand') return false;
    if (this.stamina < s.cost * 0.5) return false;  // trop fatigué
    const k = this.timeScale() * (s.kind === 'kick' ? 1 / Math.max(0.8, this.style.kicks) : 1);
    this.action = { name, s, t: 0, k, phase: 'windup', done: false };
    this.spend(s.cost * (1.15 - this.stats.cardio / 400));
    this.total.thrown++;
    return true;
  }

  // Avance le coup en cours ; renvoie 'impact' à l'instant où il doit toucher
  stepAction(dt) {
    const a = this.action;
    if (!a) return null;
    a.t += dt;
    const w = a.s.windup * a.k, act = a.s.active * a.k, rec = a.s.recover * a.k;
    let ev = null;
    if (a.phase === 'windup' && a.t >= w) {
      a.phase = 'active';
      ev = 'impact';
    }
    if (a.phase === 'active' && a.t >= w + act) a.phase = 'recover';
    if (a.phase === 'recover' && a.t >= w + act + rec) {
      this.action = null;
      if (this.queued && this.queued.t > 0) {
        const q = this.queued.name;
        this.queued = null;
        this.strike(q);
      }
    }
    if (this.queued && (this.queued.t -= dt) <= 0) this.queued = null;
    return ev;
  }
  cancelAction() {
    this.action = null;
    this.queued = null;
  }

  // ---------- Pose voulue à cet instant (animation calculée à partir de l'état) ----------
  updatePose(dt, time) {
    const T = this.target;
    Object.assign(T, STANCE);
    let rate = 12;
    const st = this.state;
    if (st === 'ko') {
      Object.assign(T, KO);
      rate = 7;
    } else if (st === 'win') {
      Object.assign(T, WIN);
      T.crouch = Math.abs(Math.sin(time * 5)) * 0.06 - 0.03;
      rate = 8;
    } else if (this.ground) {
      Object.assign(T, this.ground.role === 'top' ? TOP : BOTTOM);
      if (this.ground.sub) Object.assign(T, this.ground.role === 'top' ? SUB_TOP : SUB_BOTTOM);
      if (this.guard && this.ground.role === 'bottom') Object.assign(T, { shLx: -2.2, elL: -2.3, shRx: -2.2, elR: -2.3, head: 0.55 });
      if (this.action && this.action.phase !== 'recover') {
        Object.assign(T, PEAK[this.action.name]);
        rate = 24;
      }
      if (st === 'getup') {  // se relève
        Object.assign(T, STANCE);
        rate = 6;
      }
    } else if (st === 'shoot') {
      Object.assign(T, SHOOT);
      rate = 18;
    } else if (st === 'sprawl') {
      Object.assign(T, SPRAWL);
      rate = 18;
    } else if (st === 'stagger') {
      Object.assign(T, { crouch: -0.2, lean: 0.55, head: -0.1, shLx: -0.6, elL: -0.8, shRx: -0.6, elR: -0.8, kneeL: 0.6, kneeR: 0.6 });
    } else {
      if (this.guard) Object.assign(T, GUARD);
      if (this.action) {
        if (this.action.phase !== 'recover') {
          Object.assign(T, PEAK[this.action.name]);
          rate = 26;
        } else {
          rate = 16;
        }
      }
      // Jeu de jambes : petits pas selon la vitesse
      const sp = Math.hypot(this.vel.x, this.vel.z), amp = Math.min(1, sp / 2.2);
      this.phase += dt * (6 + sp * 3);
      if (!this.action || this.action.s.kind === 'punch') {
        T.hipLx += Math.sin(this.phase) * 0.22 * amp;
        T.hipRx -= Math.sin(this.phase) * 0.22 * amp;
        T.kneeL += Math.max(0, Math.cos(this.phase)) * 0.3 * amp;
        T.kneeR += Math.max(0, -Math.cos(this.phase)) * 0.3 * amp;
      }
      if (st === 'rocked') {  // sonné : garde basse, il vacille
        Object.assign(T, { shLx: -0.4, elL: -1.0, shRx: -0.4, elR: -1.0, head: -0.1 });
        T.tilt = Math.sin(time * 6.5) * 0.22;
        T.kneeL += 0.35;
        T.kneeR += 0.35;
        T.crouch -= 0.1;
      }
      T.crouch += Math.sin(time * 3.2 + this.phase * 0.1) * 0.012;  // respiration, rebond léger
    }
    if (this.t.hit > 0 && st !== 'ko') {  // il encaisse : la tête part en arrière, il se plie ou fléchit
      const k = this.t.hit / 0.25;
      if (this.hitZone === 'head') {
        T.head -= 0.55 * k;
        T.lean -= 0.35 * k;
      } else if (this.hitZone === 'body') {
        T.lean += 0.45 * k;
        T.crouch -= 0.08 * k;
      } else if (this.hitZone === 'legs') {
        T.kneeL += 0.5 * k;
        T.crouch -= 0.1 * k;
        T.tilt += 0.15 * k;
      }
      rate = Math.max(rate, 20);
    }
    this.model.blend(T, 1 - Math.exp(-dt * rate));
    this.model.apply(this.pos.x, this.pos.z, this.heading);
  }

  face(x, z, dt, rate = 10) {
    const h = Math.atan2(x - this.pos.x, z - this.pos.z);
    this.heading = dt > 0 ? lerpAngle(this.heading, h, Math.min(1, dt * rate)) : h;
  }
}

export { clamp };
