// Le combat : deux combattants dans la cage, les coups (portée, garde, contres, esquives), les amenées au sol,
// le combat au sol (coups, se relever, soumissions avec lutte au bouton), les rounds, et la fin : KO, arrêt de
// l'arbitre (TKO), soumission, ou décision des trois juges (barème 10-9 à chaque round).
import { STRIKES, RULES, MOVE_MAP } from './data.js';
import { Fighter, clamp } from './fighter.js';

const SUB_NAMES = { top: 'étranglement bras-tête', bottom: 'triangle' };

export class Fight {
  // defs : [toi, adversaire] ; opts : { rounds, roundTime }
  constructor(scene, defs, opts = {}) {
    this.f = defs.map((d) => new Fighter(scene, d));
    this.rounds = opts.rounds || 3;
    this.roundTime = opts.roundTime || 90;
    this.onEvent = null;  // (texte principal, texte secondaire)
    this.time = 0;
    this.start();
  }
  dispose(scene) {
    for (const f of this.f) {
      scene.remove(f.model.root);
      f.model.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    }
  }
  start() {
    this.f[0].reset(-1.6, 0, Math.PI / 2);
    this.f[1].reset(1.6, 0, -Math.PI / 2);
    this.round = 1;
    this.cards = [[0, 0], [0, 0], [0, 0]];  // les trois juges
    this.roundCards = [];
    this.result = null;
    this.sub = null;
    this.groundIdle = 0;
    this.beginRound();
  }
  beginRound() {
    this.state = 'intro';
    this.stateT = 1.6;
    this.clock = this.roundTime;
    this.groundIdle = 0;
    for (const f of this.f) f.newRoundStats();
    this.emit(`Round ${this.round}`, this.round === this.rounds ? 'Dernier round' : 'Combattez !');
  }
  emit(a, b = '') {
    if (this.onEvent) this.onEvent(a, b);
  }
  other(f) {
    return f === this.f[0] ? this.f[1] : this.f[0];
  }
  dist() {
    const [a, b] = this.f;
    return Math.hypot(b.pos.x - a.pos.x, b.pos.z - a.pos.z);
  }

  // ---------- Boucle ----------
  update(dt) {
    this.time += dt;
    const [A, B] = this.f;
    if (this.state === 'intro') {
      this.stateT -= dt;
      if (this.stateT <= 0) this.state = 'fight';
    } else if (this.state === 'break') {
      this.stateT -= dt;
      if (this.stateT <= 0) this.beginRound();
    } else if (this.state === 'fight') {
      this.clock -= dt;
      for (const f of this.f) this.handleIntent(f, dt);
      for (const f of this.f) this.stepFighter(f, dt);
      if (this.sub) this.stepSub(dt);
      if (A.ground && !this.result) {
        (A.ground.role === 'top' ? A : B).round.control += dt;
        this.groundIdle += dt;
        if (this.groundIdle > RULES.standUpIdle) this.standUp("L'arbitre les relève");
      }
      if (this.clock <= 0 && !this.result) this.endRound();
    } else {
      for (const f of this.f) this.stepFighter(f, dt);
    }
    if (!A.ground && this.state !== 'over') {
      this.separate();
      for (const f of this.f) {
        if (f.state !== 'ko' && f.state !== 'win') f.face(this.other(f).pos.x, this.other(f).pos.z, dt);
      }
    }
    for (const f of this.f) f.updatePose(dt, this.time);
  }

  // ---------- Ce que chaque combattant veut faire (toi : commandes ; l'ordinateur : IA) ----------
  handleIntent(f, dt) {
    const i = f.intent, o = this.other(f);
    f.guard = !!i.guard && (f.state === 'stand' || !!f.ground) && !f.action;
    const p = i.press;
    i.press = null;
    if (!p || this.result) return;
    if (this.sub) {  // pendant une soumission, les boutons servent à serrer ou à se dégager
      if (f === this.sub.att && p.btn === 'grapple') this.subPress(f, 1);
      else if (f === this.sub.def && (p.btn === 'guard' || p.btn === 'grapple')) this.subPress(f, -1);
      return;
    }
    if (f.ground) return this.groundPress(f, p.btn);
    if (f.state !== 'stand' || f.t.hit > 0) return;
    if (p.btn === 'punch' || p.btn === 'kick') {
      f.strike(MOVE_MAP[p.btn][p.dir || 'neutral']);
    } else if (p.btn === 'grapple') {
      if (o.state === 'shoot') {  // l'adversaire plonge : on se défend en arrière (sprawl)
        f.cancelAction();
        f.state = 'sprawl';
        f.t.sprawl = 0.45;
        f.spend(4);
      } else if (!f.action && this.dist() <= RULES.takedownRange && f.stamina >= 10) {
        f.state = 'shoot';
        f.shootT = 0;
        f.spend(9);
        f.total.tdAttempts++;
      }
    }
  }

  // ---------- Déplacements, coups en cours, minuteries ----------
  stepFighter(f, dt) {
    const o = this.other(f);
    for (const k in f.t) if (k !== 'quiet' && k !== 'change') f.t[k] = Math.max(0, f.t[k] - dt);
    f.t.quiet += dt;
    if (f.state === 'rocked' && f.t.rocked <= 0) f.state = 'stand';
    if (f.state === 'sprawl' && f.t.sprawl <= 0) f.state = 'stand';
    if (f.state === 'stagger' && f.t.stagger <= 0) f.state = 'stand';
    if (f.state === 'getup') {
      f.getupT -= dt;
      if (f.getupT <= 0) f.state = 'stand';
    }
    // Coup en cours : impact au bon moment
    if (f.action && this.state === 'fight') {
      if (f.stepAction(dt) === 'impact' && !this.result) this.resolveStrike(f, o, f.action.s, f.action.name);
    } else if (f.action) {
      f.cancelAction();
    }
    // Action au sol en cours (se relever, soumission)
    if (f.gAction && this.state === 'fight') {
      f.gAction.t -= dt;
      if (f.gAction.t <= 0) this.finishGroundAction(f);
    }
    // Plongeon pour amener au sol
    if (f.state === 'shoot') {
      f.shootT += dt;
      const dx = o.pos.x - f.pos.x, dz = o.pos.z - f.pos.z, d = Math.hypot(dx, dz) || 1;
      f.vel.x = (dx / d) * 3.4;
      f.vel.z = (dz / d) * 3.4;
      if (f.shootT >= 0.4 * f.timeScale()) this.resolveTakedown(f, o);
    } else if (!f.ground && (f.state === 'stand' || f.state === 'rocked')) {
      // Marche : joystick (toi) ou IA, plus lente en garde, en frappant, sonné ou fatigué
      const m = f.intent.move, mag = Math.min(1, Math.hypot(m.x, m.z));
      let sp = RULES.walk * f.speedFactor * (f.guard ? 0.5 : 1) * (f.action ? 0.35 : 1) * (f.state === 'rocked' ? 0.5 : 1);
      const away = (m.x * (o.pos.x - f.pos.x) + m.z * (o.pos.z - f.pos.z)) < 0;
      if (away) sp *= 0.88;
      const tx = mag > 0.05 ? (m.x / (Math.hypot(m.x, m.z) || 1)) * sp * mag : 0;
      const tz = mag > 0.05 ? (m.z / (Math.hypot(m.x, m.z) || 1)) * sp * mag : 0;
      const k = 1 - Math.exp(-dt * 12);
      f.vel.x += (tx - f.vel.x) * k;
      f.vel.z += (tz - f.vel.z) * k;  // marcher ne fatigue pas, mais l'énergie remonte moins vite (plus bas)
    } else if (!f.ground) {
      const k = Math.exp(-dt * 6);
      f.vel.x *= k;
      f.vel.z *= k;
    } else {
      f.vel.x = f.vel.z = 0;
    }
    if (!f.ground) {
      f.pos.x += f.vel.x * dt;
      f.pos.z += f.vel.z * dt;
      const r = Math.hypot(f.pos.x, f.pos.z);
      if (r > RULES.cageRadius) {  // le grillage
        f.pos.x *= RULES.cageRadius / r;
        f.pos.z *= RULES.cageRadius / r;
      }
    }
    // Énergie : elle remonte quand on souffle (plus vite avec un bon cardio)
    if (f.state !== 'ko') {
      let regen = (6 + f.stats.cardio / 12) * dt;
      if (f.action || f.state === 'shoot') regen = 0;
      else if (f.guard) regen *= 0.45;
      else if (f.ground) regen *= 0.55;
      else if (Math.hypot(f.vel.x, f.vel.z) > 0.5) regen *= 0.65;
      f.stamina = Math.min(f.staminaMax, f.stamina + regen);
      if (f.t.quiet > 3 && f.hp.head < 100) f.hp.head = Math.min(100, f.hp.head + 0.7 * dt);
    }
  }

  // Les deux combattants ne se traversent pas
  separate() {
    const [a, b] = this.f;
    let dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 1e-6;
    if (d >= RULES.minGap) return;
    dx /= d;
    dz /= d;
    const push = (RULES.minGap - d) / 2;
    a.pos.x -= dx * push;
    a.pos.z -= dz * push;
    b.pos.x += dx * push;
    b.pos.z += dz * push;
  }

  // ---------- Un coup arrive au moment de l'impact : touche, bloqué ou raté ----------
  resolveStrike(a, d, s, name) {
    if (d.state === 'ko') return;
    const dx = d.pos.x - a.pos.x, dz = d.pos.z - a.pos.z, dist = Math.hypot(dx, dz) || 1e-6;
    if (s.kind !== 'ground') {
      if (d.ground || dist > s.reach) return;  // trop loin : raté
      if (s.straight) {  // coup droit : on l'esquive en se décalant sur le côté
        const lat = Math.abs((d.vel.x * dz - d.vel.z * dx) / dist);
        if (lat > 1.2 && Math.random() < 0.5) return;
      }
      if (!d.busy && Math.random() < (d.stats.defense - 50) / 400) return;  // esquive (Défense)
    }
    let dmg = RULES.damage * s.dmg * (0.6 + (a.stats.power / 100) * 0.6) * a.tired * (s.kind === 'kick' ? a.style.kicks : 1);
    let counter = false;
    if (d.action && d.action.phase === 'windup') {  // contre : il frappait en même temps
      dmg *= 1.3;
      counter = true;
      d.cancelAction();
    }
    let blocked = false;
    const canGuard = d.guard && (d.state === 'stand' || (d.ground && d.ground.role === 'bottom'));
    if (canGuard && s.block > 0) {
      dmg *= 1 - s.block * (0.85 + d.stats.defense / 400);
      blocked = true;
      d.spend(1.5);
    }
    if (s.zone === 'head') dmg *= 1.25 - d.stats.chin / 200;
    d.hp[s.zone] = Math.max(0, d.hp[s.zone] - dmg);
    a.round[s.zone] += dmg;
    a.total.damage += dmg;
    if (!blocked) a.total.landed++;
    d.t.hit = blocked ? 0.1 : 0.25;
    d.hitZone = s.zone;
    d.t.quiet = 0;
    this.groundIdle = 0;
    if (s.push && !blocked) {
      d.vel.x += (dx / dist) * 2.8;
      d.vel.z += (dz / dist) * 2.8;
    }
    if (counter) this.emit('Contre !', `${a.name} : ${s.label.toLowerCase()}`);
    // Sonné : un gros coup à la tête, surtout s'il en a déjà beaucoup pris
    if (s.zone === 'head' && !blocked && !d.ground && dmg >= 5 && d.state !== 'rocked'
      && Math.random() < dmg / 18 + (1 - d.hp.head / 100) * 0.45 - d.stats.chin / 400) {
      d.cancelAction();
      d.state = 'rocked';
      d.t.rocked = 1.4;
      a.round.rocks++;
      a.total.rocks++;
      this.emit('Sonné !', d.name);
    }
    if (d.hp.head <= 0) this.finish(a, d.ground ? 'TKO' : 'KO', d.ground ? 'coups au sol' : s.label.toLowerCase());
    else if (d.hp.legs <= 0) this.finish(a, 'TKO', 'il ne tient plus sur ses jambes');
    else if (d.hp.body <= 0) this.finish(a, 'TKO', 'coups au corps');
  }

  // ---------- Amenée au sol ----------
  resolveTakedown(a, d) {
    a.vel.x = a.vel.z = 0;
    if (this.dist() > 1.0 || d.ground || d.state === 'ko') {  // il a reculé : plongeon dans le vide
      a.state = 'stagger';
      a.t.stagger = 0.6;
      return;
    }
    const W = (f) => f.stats.wrestling;
    const p = clamp(0.32 + ((W(a) - W(d)) / 100) * 0.9 + (a.stamina - d.stamina) / 250 + (d.action ? 0.22 : 0)
      + (d.state === 'rocked' ? 0.3 : 0) - (d.state === 'sprawl' || d.t.sprawl > 0 ? 0.38 : 0), 0.05, 0.92);
    if (Math.random() < p) {
      a.round.takedowns++;
      a.total.takedowns++;
      this.goGround(a, d);
      this.emit('Au sol !', `${a.name} amène ${d.name} au sol`);
    } else {
      a.state = 'stagger';
      a.t.stagger = 0.7;
      this.emit('Amenée défendue', d.name);
    }
  }
  goGround(top, bottom) {
    for (const f of this.f) {
      f.cancelAction();
      f.state = 'ground';
      f.vel.x = f.vel.z = 0;
      f.gAction = null;
    }
    top.ground = { role: 'top', sub: false };
    bottom.ground = { role: 'bottom', sub: false };
    // Le combat au sol se déroule à au moins 1,2 m du grillage
    let bx = bottom.pos.x, bz = bottom.pos.z;
    const r = Math.hypot(bx, bz), lim = RULES.cageRadius - 1.2;
    if (r > lim) {
      bx *= lim / r;
      bz *= lim / r;
    }
    let dx = top.pos.x - bx, dz = top.pos.z - bz;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    bottom.pos.x = bx;
    bottom.pos.z = bz;
    top.pos.x = bx + dx * 0.78;
    top.pos.z = bz + dz * 0.78;
    bottom.heading = Math.atan2(dx, dz);
    top.heading = Math.atan2(-dx, -dz);
    this.groundIdle = 0;
  }
  standUp(text) {
    const [a, b] = this.f;
    let dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    const cx = (a.pos.x + b.pos.x) / 2, cz = (a.pos.z + b.pos.z) / 2;
    a.pos.x = cx - dx * 0.6;
    a.pos.z = cz - dz * 0.6;
    b.pos.x = cx + dx * 0.6;
    b.pos.z = cz + dz * 0.6;
    for (const f of this.f) {
      f.ground = null;
      f.gAction = null;
      f.cancelAction();
      f.guard = false;
      f.state = 'getup';
      f.getupT = 0.5;
    }
    this.sub = null;
    if (text) this.emit('Debout', text);
  }

  // ---------- Au sol : Poing = frapper, Pied = se relever, Garde = bloquer, Lutte = soumission ----------
  groundPress(f, btn) {
    if (f.gAction || f.state !== 'ground') return;
    const top = f.ground.role === 'top', o = this.other(f);
    if (btn === 'punch') {
      f.strike(top ? 'gpunch' : 'bpunch');
    } else if (btn === 'kick' && !f.action) {
      f.gAction = { kind: 'getup', t: top ? 0.35 : 0.7 };
      f.spend(top ? 2 : 8);
      this.groundIdle = 0;
    } else if (btn === 'grapple' && !f.action && f.stamina >= 8) {
      f.gAction = { kind: 'sub', t: 0.45 };
      f.spend(8);
      f.round.subs++;
      f.total.subAttempts++;
      this.groundIdle = 0;
      if (o === this.f[0] || f === this.f[0]) this.emit('Soumission tentée', f.name);
    }
  }
  finishGroundAction(f) {
    const g = f.gAction, o = this.other(f);
    f.gAction = null;
    if (!f.ground || this.result) return;
    const top = f.ground.role === 'top';
    if (g.kind === 'getup') {
      if (top) return this.standUp(`${f.name} se relève`);
      const p = clamp(0.35 + ((f.stats.wrestling - o.stats.wrestling) / 100) * 0.8 + (f.stamina - o.stamina) / 200
        - (o.guard ? 0.25 : 0), 0.08, 0.85);
      if (Math.random() < p) this.standUp(`${f.name} se relève`);
      else if (f === this.f[0]) this.emit('Bloqué au sol', 'Il te maintient');
    } else if (g.kind === 'sub') {
      const G = (x) => x.stats.grappling;
      const p = clamp((top ? 0.45 : 0.3) + ((G(f) - G(o)) / 100) * 0.9 + (f.stamina - o.stamina) / 220
        + (o.state === 'rocked' ? 0.25 : 0) - (o.guard ? 0.1 : 0), 0.05, 0.85);
      if (Math.random() < p) {
        this.sub = { att: f, def: o, m: 0.35, t: 0, name: SUB_NAMES[f.ground.role] };
        f.ground.sub = o.ground.sub = true;
        o.cancelAction();
        f.cancelAction();
        this.emit('Soumission !', `${this.sub.name} : ${f === this.f[0] ? 'tape Lutte vite' : 'tape Garde ou Lutte vite'}`);
      } else if (f === this.f[0]) {
        this.emit('Soumission ratée', `${o.name} se défend`);
      }
    }
  }
  // Lutte au bouton : chaque appui serre (attaquant) ou desserre (défenseur)
  subPress(f, sign) {
    const s = this.sub;
    if (!s) return;
    if (sign > 0) s.m += 0.045 * (0.6 + (f.stats.grappling / 100) * 0.8) * f.tired;
    else s.m -= 0.05 * (0.6 + ((f.stats.grappling * 0.6 + f.stats.wrestling * 0.4) / 100) * 0.8) * f.tired;
    f.spend(0.7);
  }
  stepSub(dt) {
    const s = this.sub;
    s.t += dt;
    s.m += (0.02 * (s.att.stats.grappling - s.def.stats.grappling) / 50 - 0.03) * dt;
    if (s.m >= 1) {
      const name = s.name;
      this.sub = null;
      this.finish(s.att, 'Soumission', name);
    } else if (s.m <= 0 || s.t >= RULES.subMax) {
      s.att.ground.sub = s.def.ground.sub = false;
      this.sub = null;
      this.groundIdle = 0;
      this.emit('Il se dégage !', s.def.name);
    }
  }

  // ---------- Fin de round, décision, fin du combat ----------
  roundPoints(f) {
    const r = f.round;
    return r.head + r.body * 0.8 + r.legs * 0.6 + r.takedowns * 6 + r.control * 0.25 + r.subs * 3 + r.rocks * 8;
  }
  endRound() {
    const pa = this.roundPoints(this.f[0]), pb = this.roundPoints(this.f[1]);
    const scores = this.cards.map((card) => {
      const a = pa * (1 + (Math.random() - 0.5) * 0.3), b = pb * (1 + (Math.random() - 0.5) * 0.3);
      let sa = 10, sb = 10;
      if (Math.abs(a - b) > 1e-6) {
        const win = Math.max(a, b), lose = Math.min(a, b);
        const loser = win > 25 && lose < win * 0.35 ? 8 : 9;  // round très dominé : 10-8
        if (a > b) sb = loser;
        else sa = loser;
      }
      card[0] += sa;
      card[1] += sb;
      return [sa, sb];
    });
    this.roundCards.push(scores);
    if (this.round >= this.rounds) return this.decision();
    if (this.sub) this.sub = null;
    if (this.f[0].ground) this.standUp('');
    this.state = 'break';
    this.stateT = RULES.breakTime;
    this.emit(`Fin du round ${this.round}`, 'Les combattants récupèrent');
    this.round++;
    for (const f of this.f) {  // repos entre les rounds
      f.hp.head = Math.min(100, f.hp.head + 18);
      f.hp.body = Math.min(100, f.hp.body + 8);
      f.hp.legs = Math.min(100, f.hp.legs + 8);
      f.stamina = f.staminaMax;
      f.cancelAction();
      f.state = 'stand';
      f.t.rocked = 0;
    }
    this.f[0].pos.x = -1.6;  // chacun retourne dans son coin
    this.f[0].pos.z = 0;
    this.f[1].pos.x = 1.6;
    this.f[1].pos.z = 0;
  }
  decision() {
    let a = 0, b = 0, draw = 0;
    for (const [sa, sb] of this.cards) {
      if (sa > sb) a++;
      else if (sb > sa) b++;
      else draw++;
    }
    let winner = null, method = 'Match nul';
    if (a >= 2 || b >= 2) {
      winner = a > b ? this.f[0] : this.f[1];
      const w = Math.max(a, b);
      method = w === 3 ? 'Décision unanime' : draw ? 'Décision majoritaire' : 'Décision partagée';
    }
    this.finish(winner, method, this.cards.map(([x, y]) => `${x}-${y}`).join(', '));
  }
  finish(winner, method, detail) {
    if (this.result) return;
    const loser = winner ? this.other(winner) : null;
    this.result = {
      winner: winner ? this.f.indexOf(winner) : null, method, detail, round: this.round,
      time: Math.max(0, this.roundTime - this.clock), cards: this.cards.map((c) => c.slice()),
    };
    this.state = 'over';
    this.sub = null;
    for (const f of this.f) {
      f.cancelAction();
      f.gAction = null;
      f.guard = false;
    }
    if (winner) {
      if (winner.ground) {
        winner.ground = null;
        winner.pos.x += Math.sin(winner.heading) * -0.6;
        winner.pos.z += Math.cos(winner.heading) * -0.6;
      }
      winner.state = 'win';
      if (method === 'KO' || method === 'TKO' || method === 'Soumission') {
        loser.ground = null;
        loser.state = 'ko';
      }
    }
    const title = winner ? (method.startsWith('Décision') ? 'Décision' : method) : 'Match nul';
    this.emit(title === 'KO' ? 'K.-O. !' : title, winner ? `${winner.name} gagne` : 'Personne ne gagne');
  }
}
