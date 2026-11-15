// L'adversaire de l'ordinateur : il « voit » tes gestes avec un temps de réaction, garde la distance qui convient à
// son style, frappe, enchaîne, tente des amenées au sol et des soumissions selon ses points forts. Il utilise
// exactement les mêmes commandes que toi (déplacement, Poing, Pied, Garde, Lutte) : aucun avantage caché.
import { aiLevel, MOVE_MAP, STRIKES } from './data.js';

// Coup → bouton et direction du joystick qui le déclenchent
const HOW = {};
for (const btn of Object.keys(MOVE_MAP)) for (const [dir, name] of Object.entries(MOVE_MAP[btn])) HOW[name] = { btn, dir };
const RANGE = { boxer: 1.05, kick: 1.25, wrestler: 0.95, bjj: 1.0 };
const weighted = (list) => {
  let tot = 0;
  for (const [, w] of list) tot += w;
  let r = Math.random() * tot;
  for (const [v, w] of list) if ((r -= w) <= 0) return v;
  return list[list.length - 1][0];
};

export class FighterAI {
  constructor(fight, me, level, styleKey) {
    this.fight = fight;
    this.me = me;
    this.L = aiLevel(level);
    this.styleKey = styleKey;
    this.thinkT = 0.8;
    this.pending = [];       // réactions qui arriveront après le temps de réaction
    this.seen = null;
    this.seenShoot = false;
    this.guardT = 0;
    this.backT = 0;
    this.circle = Math.random() < 0.5 ? -1 : 1;
    this.circleT = 2;
    this.mashT = 0;
  }

  update(dt) {
    const fight = this.fight, f = this.me, o = fight.other(f), L = this.L, i = f.intent;
    i.move.x = i.move.z = 0;
    if (fight.state !== 'fight' || fight.result) {
      i.guard = false;
      return;
    }
    // Soumission : il appuie vite (selon son niveau)
    if (fight.sub && (fight.sub.att === f || fight.sub.def === f)) {
      i.guard = false;
      this.mashT -= dt;
      if (this.mashT <= 0) {
        i.press = { btn: fight.sub.att === f ? 'grapple' : 'guard' };
        this.mashT = 1 / (L.mash * (0.75 + Math.random() * 0.5));
      }
      return;
    }
    // Il remarque ce que tu fais… avec un temps de réaction
    if (o.action && o.action !== this.seen) {
      this.seen = o.action;
      const dur = (o.action.s.windup + o.action.s.active) * o.action.k + 0.1;
      if (Math.random() < L.guard) this.pending.push({ t: L.reaction * (0.8 + Math.random() * 0.4), kind: 'guard', dur });
      else if (!f.ground && Math.random() < 0.25 + L.guard * 0.3) this.pending.push({ t: L.reaction, kind: 'back', dur: 0.35 });
    }
    if (o.state === 'shoot' && !this.seenShoot) {
      this.seenShoot = true;
      if (Math.random() < L.sprawl) this.pending.push({ t: L.reaction * 0.7, kind: 'sprawl' });
    }
    if (o.state !== 'shoot') this.seenShoot = false;
    for (const r of this.pending) r.t -= dt;
    while (this.pending.length && this.pending[0].t <= 0) {
      const r = this.pending.shift();
      if (r.kind === 'guard') this.guardT = r.dur;
      else if (r.kind === 'back') this.backT = r.dur;
      else if (r.kind === 'sprawl' && o.state === 'shoot') i.press = { btn: 'grapple' };
    }
    this.guardT = Math.max(0, this.guardT - dt);
    this.backT = Math.max(0, this.backT - dt);
    this.thinkT -= dt;
    if (f.ground) this.groundThink(f, o);
    else this.standThink(dt, f, o);
  }

  standThink(dt, f, o) {
    const L = this.L, i = f.intent, fight = this.fight;
    const dx = o.pos.x - f.pos.x, dz = o.pos.z - f.pos.z, d = Math.hypot(dx, dz) || 1;
    const ux = dx / d, uz = dz / d, lx = -uz * this.circle, lz = ux * this.circle;
    const range = RANGE[this.styleKey] || 1.05;
    const tired = f.stamina < 22, hurt = f.state === 'rocked' || f.hp.head < 25;
    const finishing = o.state === 'rocked';
    this.circleT -= dt;
    if (this.circleT <= 0) {
      this.circle = -this.circle;
      this.circleT = 1.5 + Math.random() * 2.5;
    }
    // Déplacement
    let mx = 0, mz = 0;
    if (this.backT > 0 || ((tired || hurt) && d < 1.8 && !finishing)) {
      mx = -ux + lx * 0.6;
      mz = -uz + lz * 0.6;
    } else if (d > range + 0.15) {
      mx = ux + lx * 0.25;
      mz = uz + lz * 0.25;
    } else if (d < range - 0.3 && this.styleKey !== 'wrestler' && this.styleKey !== 'bjj') {
      mx = -ux * 0.7 + lx * 0.4;
      mz = -uz * 0.7 + lz * 0.4;
    } else {
      mx = lx * 0.45;
      mz = lz * 0.45;
    }
    i.move.x = mx;
    i.move.z = mz;
    i.guard = this.guardT > 0 || ((tired || hurt) && d < 1.5 && !f.action);
    // Attaque
    if (this.thinkT > 0 || f.busy || i.press) return;
    this.thinkT = L.think * (0.7 + Math.random() * 0.6);
    const aggr = L.aggression * (finishing ? 1.6 : 1) * (tired ? 0.4 : 1) * (hurt ? 0.3 : 1);
    if (Math.random() > aggr) return;
    const likes = f.style.likes;
    const cat = weighted([['punch', likes.punch], ['kick', likes.kick], ['grapple', likes.grapple]]);
    if (cat === 'grapple') {
      if (d <= 1.4 && f.stamina > 20) i.press = { btn: 'grapple' };
      return;
    }
    const options = cat === 'punch'
      ? [['jab', 0.4], ['cross', 0.3], ['hook', 0.2], ['upper', 0.1]]
      : [['low', 0.45], ['body', 0.35], ['high', 0.15], ['teep', 0.05]];
    const inReach = options.filter(([n]) => STRIKES[n].reach >= d - 0.02);
    if (!inReach.length) return;
    const name = weighted(inReach);
    i.press = HOW[name];
    if (Math.random() < L.combo) {  // enchaînement : un deuxième coup juste après
      const next = weighted([['cross', 0.4], ['hook', 0.35], ['low', 0.25]]);
      setTimeoutFight(fight, f, HOW[next], 0.12 + STRIKES[name].windup);
    }
  }

  groundThink(f, o) {
    const L = this.L, i = f.intent, top = f.ground.role === 'top';
    // En dessous, il garde les bras devant le visage la plupart du temps (surtout s'il est touché)
    i.guard = !top && (this.guardT > 0 || (o.action && Math.random() < 0.5 + L.guard * 0.4) || f.hp.head < 40);
    if (this.thinkT > 0 || f.busy && f.action || f.gAction || i.press) return;
    this.thinkT = L.think * (0.8 + Math.random() * 0.5);
    const g = f.stats.grappling, striker = this.styleKey === 'boxer' || this.styleKey === 'kick';
    if (top) {
      const choice = weighted([
        ['punch', 0.45 * L.aggression + 0.15],
        ['grapple', Math.max(0.03, (g - 45) / 100) * (o.state === 'rocked' ? 1.5 : 1)],
        ['kick', (striker ? 0.18 : 0.03) + (f.stamina < 20 ? 0.3 : 0)],
        ['wait', 0.25],
      ]);
      if (choice !== 'wait') i.press = { btn: choice };
    } else {
      const choice = weighted([
        ['kick', 0.25 + (striker ? 0.2 : 0)],
        ['grapple', this.styleKey === 'bjj' ? 0.22 : 0.05],
        ['punch', 0.15],
        ['wait', 0.35],
      ]);
      if (choice !== 'wait') i.press = { btn: choice };
    }
  }
}

// Appui différé (enchaînement) : posé dans la liste du combat, traité à l'image voulue
function setTimeoutFight(fight, f, press, delay) {
  if (!fight.later) fight.later = [];
  fight.later.push({ f, press, t: delay });
}
// À appeler à chaque image avant l'IA : les appuis différés arrivés à échéance deviennent des appuis réels
export function stepLater(fight, dt) {
  if (!fight.later) return;
  for (const l of fight.later) {
    l.t -= dt;
    if (l.t <= 0 && !l.f.intent.press) l.f.intent.press = l.press;
  }
  fight.later = fight.later.filter((l) => l.t > 0);
}
