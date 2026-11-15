// Écrans du jeu de MMA : accueil, mode libre (10 niveaux à débloquer), carrière (création du combattant, fiche,
// points à répartir, prochain adversaire), résultat du combat, pause, aide et réglages.
import {
  STYLES, LADDER, FREE_FIGHTERS, STAT_KEYS, STAT_LABELS, STAT_HELP, CAREER, WEIGHTS, SKINS, HAIRS, SHORTS,
  careerTier, careerOpponent, statsFor,
} from './data.js';
import { loadLadder, saveLadder, unlocked, loadCareer, saveCareer, deleteCareer, saveMmaSettings } from './save.js';
import { QUALITY } from '../engine/renderer.js';
import { VIEWS } from './fightCamera.js';
import { segRow } from '../ui/menus.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const overall = (st) => Math.round(STAT_KEYS.reduce((a, k) => a + st[k], 0) / STAT_KEYS.length);
const SCREENS = ['mmaMenu', 'ladderScreen', 'careerNew', 'careerHub', 'fightResult', 'mmaPause', 'mmaHelp'];

export class Screens {
  // h : { fight(setup), settingsChanged(key), resume(), quit() }
  constructor(settings, h) {
    this.s = settings;
    this.h = h;
    this.ladder = loadLadder();
    this.career = loadCareer();
    $('careerBtn').addEventListener('click', () => this.openCareer());
    $('freeBtn').addEventListener('click', () => this.openLadder());
    $('mmaHelpBtn').addEventListener('click', () => this.help(true));
    $('mmaHelpClose').addEventListener('click', () => this.help(false));
    $('pauseHelp').addEventListener('click', () => this.help(true));
    $('resumeFight').addEventListener('click', () => h.resume());
    $('quitFight').addEventListener('click', () => h.quit());
    for (const id of ['ladderBack', 'hubBack', 'newBack']) $(id).addEventListener('click', () => this.show('mmaMenu'));
    $('createBtn').addEventListener('click', () => this.createCareer());
    $('hubFight').addEventListener('click', () => this.fightCareer());
    $('hubReset').addEventListener('click', () => {
      if (!confirm('Effacer cette carrière et en commencer une nouvelle ?')) return;
      deleteCareer();
      this.career = null;
      this.openCareer();
    });
    this.renderSettings();
  }

  show(id) {
    for (const s of SCREENS) if (s !== 'mmaHelp') $(s).hidden = s !== id;
    if (id === null) this.help(false);
  }
  help(v) {
    $('mmaHelp').hidden = !v;
  }

  // ---------- Réglages (accueil et pause) ----------
  renderSettings() {
    for (const box of [$('mmaSettings'), $('pauseSettingsMma')]) {
      box.textContent = '';
      const row = (label, key, options) => segRow(box, label, options, this.s[key], (v) => {
        this.s[key] = v;
        saveMmaSettings(this.s);
        this.renderSettings();
        this.h.settingsChanged(key);
      });
      row('Durée des rounds', 'roundTime', [[60, '1 min'], [90, '1 min 30'], [120, '2 min'], [180, '3 min']]);
      row('Caméra', 'view', Object.entries(VIEWS).map(([k, v]) => [k, v.label]));
      row('Qualité', 'quality', Object.entries(QUALITY).map(([k, v]) => [k, v.label]));
      row('Images/s', 'showFps', [[false, 'Masquer'], [true, 'Afficher']]);
    }
  }

  // ---------- Mode libre ----------
  openLadder() {
    this.show('ladderScreen');
    const l = this.ladder, box = $('ladderStyle');
    box.textContent = '';
    segRow(box, 'Ton style', Object.entries(STYLES).map(([k, v]) => [k, v.label]), l.style, (v) => {
      l.style = v;
      saveLadder(l);
      this.openLadder();
    });
    const f = FREE_FIGHTERS[l.style];
    $('ladderMe').textContent = `${f.name} · ${STYLES[l.style].label} · niveau général ${overall(STYLES[l.style].stats)}`;
    const grid = $('ladderGrid');
    grid.textContent = '';
    LADDER.forEach((o, i) => {
      const open = unlocked(l, i);
      const b = el('button', 'lvl' + (open ? '' : ' locked'));
      b.type = 'button';
      b.disabled = !open;
      b.append(el('b', '', `${i + 1}. ${o.name}`), el('span', '', o.nick ? `« ${o.nick} »` : STYLES[o.style].label),
        el('span', 'meta', `${STYLES[o.style].label} · ${o.avg}`), el('span', 'stars', open ? stars(l.stars[i]) : 'verrouillé'));
      b.addEventListener('click', () => this.fightLadder(i));
      grid.appendChild(b);
    });
    const total = l.stars.reduce((a, n) => a + n, 0);
    $('ladderTotal').textContent = `${total} étoiles sur 30 · 3 étoiles : victoire avant la limite au 1er round ; 2 : avant la limite ; 1 : aux points.`;
  }
  fightLadder(i) {
    const l = this.ladder, o = LADDER[i], f = FREE_FIGHTERS[l.style];
    this.h.fight({
      mode: 'ladder', index: i, rounds: 3, level: o.level, oppStyle: o.style,
      me: { name: f.name, style: l.style, stats: Object.assign({}, STYLES[l.style].stats), look: f.look, weight: 'welter' },
      opp: { name: o.name, nick: o.nick, style: o.style, stats: statsFor(o.style, o.avg), look: o.look, weight: 'welter' },
    });
  }

  // ---------- Carrière ----------
  openCareer() {
    if (!this.career) return this.openNew();
    this.show('careerHub');
    this.renderHub();
  }
  openNew() {
    this.show('careerNew');
    this.draft = this.draft || { name: '', style: 'boxer', weight: 'welter', look: { skin: 1, hair: 0, shorts: SHORTS[0] } };
    const d = this.draft, box = $('newOptions');
    box.textContent = '';
    const re = () => this.openNew();
    segRow(box, 'Style', Object.entries(STYLES).map(([k, v]) => [k, v.label]), d.style, (v) => { d.style = v; re(); });
    segRow(box, 'Catégorie', Object.entries(WEIGHTS).map(([k, v]) => [k, v.replace('Poids ', '')]), d.weight, (v) => { d.weight = v; re(); });
    segRow(box, 'Peau', SKINS.map((c, i) => [i, '●']), d.look.skin, (v) => { d.look.skin = v; re(); });
    segRow(box, 'Cheveux', HAIRS.map((c, i) => [i, '●']), d.look.hair, (v) => { d.look.hair = v; re(); });
    segRow(box, 'Short', SHORTS.map((c) => [c, '■']), d.look.shorts, (v) => { d.look.shorts = v; re(); });
    // Pastilles de couleur sur les boutons
    const rows = box.querySelectorAll('.set-row');
    const paint = (row, colors) => row.querySelectorAll('.seg button').forEach((b, i) => { b.style.color = colors[i]; });
    paint(rows[2], SKINS);
    paint(rows[3], HAIRS);
    paint(rows[4], SHORTS);
    const st = STYLES[d.style].stats;
    $('newStats').textContent = STAT_KEYS.map((k) => `${STAT_LABELS[k]} ${st[k]}`).join(' · ');
    const input = $('newName');
    if (!input.dataset.bound) {
      input.dataset.bound = '1';
      input.addEventListener('input', () => { d.name = input.value; });
    }
    input.value = d.name;
  }
  createCareer() {
    const d = this.draft, name = ($('newName').value || '').trim().slice(0, 24);
    if (!name) {
      $('newName').focus();
      $('newHint').textContent = 'Donne un nom à ton combattant.';
      return;
    }
    this.career = {
      name, style: d.style, weight: d.weight, look: Object.assign({}, d.look),
      stats: Object.assign({}, STYLES[d.style].stats), points: 0, rung: 1, wins: 0, losses: 0, draws: 0,
      champion: false, seed: Math.floor(Math.random() * 1e9), history: [],
    };
    saveCareer(this.career);
    this.draft = null;
    this.openCareer();
  }
  renderHub() {
    const c = this.career;
    $('hubName').textContent = c.name;
    $('hubInfo').textContent = `${WEIGHTS[c.weight]} · ${STYLES[c.style].label} · bilan ${c.wins}-${c.losses}${c.draws ? '-' + c.draws : ''}`
      + (c.champion ? ' · CHAMPION' : '');
    const rung = c.rung, o = careerOpponent(c.seed, rung);
    $('hubStep').textContent = rung <= CAREER.fights ? `Combat ${rung} sur ${CAREER.fights} · ${careerTier(rung)}`
      : `${careerTier(rung)} n° ${rung - CAREER.fights}`;
    $('hubOpp').textContent = `${o.name}${o.nick ? ` « ${o.nick} »` : ''} · ${STYLES[o.style].label} · niveau ${Math.round(o.avg)}`;
    $('hubRounds').textContent = rung >= CAREER.fights ? `${CAREER.titleRounds} rounds` : '3 rounds';
    // Échelle : 15 cases
    const lad = $('hubLadder');
    lad.textContent = '';
    for (let i = 1; i <= CAREER.fights; i++) {
      const cell = el('span', 'rung' + (i < rung ? ' done' : i === rung ? ' now' : ''), i === CAREER.fights ? '🏆' : String(i));
      lad.appendChild(cell);
    }
    // Caractéristiques et points à répartir
    $('hubPoints').textContent = c.points ? `${c.points} point${c.points > 1 ? 's' : ''} à répartir` : 'Gagne des combats pour gagner des points';
    const list = $('hubStats');
    list.textContent = '';
    for (const k of STAT_KEYS) {
      const row = el('div', 'stat');
      const bar = el('span', 'sbar');
      const fill = el('i');
      fill.style.width = c.stats[k] + '%';
      bar.appendChild(fill);
      const plus = el('button', 'plus', '+');
      plus.type = 'button';
      plus.disabled = !c.points || c.stats[k] >= CAREER.statMax;
      plus.setAttribute('aria-label', `Ajouter un point en ${STAT_LABELS[k]}`);
      plus.addEventListener('click', () => {
        if (!c.points || c.stats[k] >= CAREER.statMax) return;
        c.stats[k]++;
        c.points--;
        saveCareer(c);
        this.renderHub();
      });
      row.append(el('span', 'sname', STAT_LABELS[k]), bar, el('b', '', String(c.stats[k])), plus);
      row.title = STAT_HELP[k];
      list.appendChild(row);
    }
    const hist = $('hubHistory');
    hist.textContent = c.history.length ? c.history.slice(-4).reverse().map((h) => `${h.res} contre ${h.opp} (${h.method})`).join(' · ') : '';
  }
  fightCareer() {
    const c = this.career, o = careerOpponent(c.seed, c.rung);
    this.h.fight({
      mode: 'career', rung: c.rung, rounds: c.rung >= CAREER.fights ? CAREER.titleRounds : 3, level: o.level, oppStyle: o.style,
      me: { name: c.name, style: c.style, stats: Object.assign({}, c.stats), look: c.look, weight: c.weight },
      opp: { name: o.name, nick: o.nick, style: o.style, stats: statsFor(o.style, o.avg), look: o.look, weight: c.weight },
    });
  }

  // ---------- Après le combat : résultat, étoiles ou points ----------
  // Renvoie le texte de récompense
  record(setup, res) {
    const won = res.winner === 0, finish = ['KO', 'TKO', 'Soumission'].includes(res.method);
    if (setup.mode === 'ladder') {
      const l = this.ladder;
      const st = won ? (finish && res.round === 1 ? 3 : finish ? 2 : 1) : 0;
      if (st > l.stars[setup.index]) l.stars[setup.index] = st;
      saveLadder(l);
      return won ? `${stars(st)}${setup.index < LADDER.length - 1 ? ' · niveau suivant débloqué' : ' · tu as battu tout le mode libre !'}` : 'Réessaie : le niveau suivant se débloque avec une victoire.';
    }
    const c = this.career, opp = setup.opp.name;
    let text;
    if (won) {
      const pts = (finish ? CAREER.pointsFinish : CAREER.pointsDecision) + (finish && res.round === 1 ? CAREER.pointsQuick : 0);
      c.points += pts;
      c.wins++;
      if (c.rung === CAREER.fights) c.champion = true;
      text = `+${pts} points à répartir` + (c.rung === CAREER.fights ? ' · TU ES CHAMPION !' : '');
      c.rung++;
    } else if (res.winner === 1) {
      c.losses++;
      text = 'Défaite : tu peux retenter ce combat.';
    } else {
      c.draws++;
      text = 'Match nul : tu peux retenter ce combat.';
    }
    c.history.push({ res: won ? 'Victoire' : res.winner === 1 ? 'Défaite' : 'Nul', opp, method: res.method });
    if (c.history.length > 30) c.history.shift();
    saveCareer(c);
    return text;
  }
  showResult(setup, res, fight, reward) {
    this.show('fightResult');
    const won = res.winner === 0;
    $('resTitle').textContent = res.winner === null ? 'Match nul' : won ? 'Victoire !' : 'Défaite';
    $('resTitle').className = won ? 'win' : res.winner === 1 ? 'lose' : '';
    const how = res.method.startsWith('Décision') || res.method === 'Match nul'
      ? `${res.method} (juges : ${res.cards.map(([a, b]) => `${a}-${b}`).join(', ')})`
      : `${res.method} (${res.detail}) au round ${res.round}, à ${Math.floor(res.time / 60)}:${String(Math.floor(res.time % 60)).padStart(2, '0')}`;
    $('resMethod').textContent = how;
    const [a, b] = fight.f;
    $('resStats').textContent = `Coups portés : ${a.total.landed} / ${a.total.thrown} (adversaire ${b.total.landed} / ${b.total.thrown}) · `
      + `Amenées au sol : ${a.total.takedowns} sur ${a.total.tdAttempts} · Soumissions tentées : ${a.total.subAttempts}`;
    $('resReward').textContent = reward;
    $('resAgain').textContent = won ? 'Rejouer ce combat' : 'Revanche';
    $('resAgain').hidden = setup.mode === 'career' && won;
  }
}
