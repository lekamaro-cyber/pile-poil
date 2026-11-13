// Affichage des coups de pied arrêtés : consigne en bas de l'écran, compteur de l'entraînement, tableau des
// tirs au but, panneau « Réglages du tir » (position du ballon sur une mini-carte, mur, gardien) et écran de fin.
import { PITCH, SET_LEVELS, TEAMS } from '../config.js';
import { segRow } from './menus.js';
import { saveSettings } from '../save/storage.js';

const $ = (id) => document.getElementById(id);
const GX = PITCH.halfL;
const BOX_D = PITCH.penaltyDepth, BOX_W = PITCH.penaltyWidth / 2;
// Mini-carte : les 40 derniers mètres, le but en haut
const MAP = { depth: 40, width: 68 };

// Position de coup franc autorisée : hors de la surface, entre 17 et 38 m du but, dans le terrain
export function legalSpot(x, z) {
  z = Math.max(-PITCH.halfW + 1, Math.min(PITCH.halfW - 1, z));
  x = Math.min(GX - 1, x);
  if (x > GX - BOX_D - 0.5 && Math.abs(z) < BOX_W + 0.5) {  // dans la surface : on sort par le côté le plus proche
    const front = (GX - BOX_D - 0.7) - x, side = BOX_W + 0.7 - Math.abs(z);
    if (-front < side) x = GX - BOX_D - 0.7;
    else z = Math.sign(z || 1) * (BOX_W + 0.7);
  }
  const d = Math.hypot(GX - x, z);
  if (d > 38) {
    x = GX - (GX - x) * (38 / d);
    z *= 38 / d;
  }
  return { x, z };
}

export class SetPieceUi {
  // handlers : apply() (réglages de l'entraînement changés), again(), menu()
  constructor(settings, handlers) {
    this.s = settings;
    this.h = handlers;
    this.map = $('spotMap');
    $('placeBtn').addEventListener('click', () => handlers.openPanel());
    $('trainGo').addEventListener('click', () => handlers.closePanel());
    $('againBtn').addEventListener('click', () => handlers.again());
    $('resultMenuBtn').addEventListener('click', () => handlers.menu());
    this.map.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = this.map.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      const spot = legalSpot(GX - v * MAP.depth, u * MAP.width - MAP.width / 2);
      this.s.trainDist = Math.round((GX - spot.x) * 10) / 10;
      this.s.trainZ = Math.round(spot.z * 10) / 10;
      saveSettings(this.s);
      this.drawMap();
    });
  }

  // ---------- Pendant le jeu ----------
  // game : 'training', 'shootout' ou null (match, menu)
  showFor(game) {
    $('hint').hidden = true;
    $('spInfo').hidden = game !== 'training';
    $('placeBtn').hidden = game !== 'training';
    $('shootout').hidden = game !== 'shootout';
    document.querySelector('.scorebar').hidden = game === 'training';
    $('radar').classList.toggle('off', game !== 'match' && game !== null);
  }
  hint(text) {
    const el = $('hint');
    if (!text) {
      el.hidden = true;
      return;
    }
    if (el.textContent !== text) el.textContent = text;
    el.hidden = false;
  }
  info(text) {
    $('spInfo').textContent = text;
  }
  // Tirs au but : score et pastilles (● but, ✕ raté, ○ à tirer)
  scoreboard(kicks) {
    $('nameHome').textContent = TEAMS[0].short;
    $('nameAway').textContent = TEAMS[1].short;
    $('chipHome').style.background = TEAMS[0].color;
    $('chipAway').style.background = TEAMS[1].color;
    const goals = kicks.map((k) => k.filter(Boolean).length);
    $('score').textContent = `${goals[0]} - ${goals[1]}`;
    const n = Math.max(5, kicks[0].length, kicks[1].length);
    [['soHome', 0], ['soAway', 1]].forEach(([id, t]) => {
      const row = $(id);
      row.textContent = '';
      const tag = document.createElement('b');
      tag.textContent = TEAMS[t].short;
      row.appendChild(tag);
      for (let i = 0; i < n; i++) {
        const dot = document.createElement('span');
        const v = kicks[t][i];
        dot.className = 'dot ' + (v === undefined ? 'todo' : v ? 'in' : 'miss');
        dot.textContent = v === undefined ? '○' : v ? '●' : '✕';
        row.appendChild(dot);
      }
    });
  }

  // ---------- Panneau « Réglages du tir » (entraînement) ----------
  openPanel() {
    $('trainPanel').hidden = false;
    this.renderPanel();
  }
  closePanel() {
    $('trainPanel').hidden = true;
  }
  renderPanel() {
    const box = $('trainSettings'), s = this.s;
    box.textContent = '';
    const set = (key) => (value) => {
      s[key] = value;
      saveSettings(s);
      this.renderPanel();
    };
    segRow(box, 'Tir', [['freekick', 'Coup franc'], ['penalty', 'Penalty']], s.trainKind, set('trainKind'));
    if (s.trainKind === 'freekick') segRow(box, 'Mur', [0, 1, 2, 3, 4, 5].map((n) => [n, String(n)]), s.trainWall, set('trainWall'));
    segRow(box, 'Gardien', [['none', 'Sans'], ...Object.entries(SET_LEVELS).map(([k, v]) => [k, v.label])], s.trainKeeper, set('trainKeeper'));
    segRow(box, 'Trajectoire calculée', [[false, 'Masquer'], [true, 'Afficher']], s.showFit, set('showFit'));
    $('spotBox').hidden = s.trainKind !== 'freekick';
    this.drawMap();
  }
  drawMap() {
    const c = this.map, dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 255, H = 150;
    if (c.width !== W * dpr) {
      c.width = W * dpr;
      c.height = H * dpr;
    }
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const X = (z) => ((z + MAP.width / 2) / MAP.width) * W, Y = (x) => ((GX - x) / MAP.depth) * H;
    g.fillStyle = '#2E7D3A';
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 8; i += 2) g.fillRect(0, (i * H) / 8, W, H / 8);
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 1.2;
    g.strokeRect(X(-BOX_W), Y(GX), X(BOX_W) - X(-BOX_W), Y(GX - BOX_D));
    const ga = PITCH.goalAreaWidth / 2;
    g.strokeRect(X(-ga), Y(GX), X(ga) - X(-ga), Y(GX - PITCH.goalAreaDepth));
    g.beginPath();  // arc de la surface
    const sx = X(0), sy = Y(GX - PITCH.penaltySpot), r = (PITCH.circleRadius / MAP.width) * W;
    const half = Math.acos((BOX_D - PITCH.penaltySpot) / PITCH.circleRadius);
    g.ellipse(sx, sy, r, (PITCH.circleRadius / MAP.depth) * H, 0, Math.PI / 2 - half, Math.PI / 2 + half);
    g.stroke();
    g.fillStyle = '#FFFFFF';
    g.fillRect(sx - 1.2, sy - 1.2, 2.4, 2.4);
    g.fillRect(X(-PITCH.goalWidth / 2), 0, X(PITCH.goalWidth / 2) - X(-PITCH.goalWidth / 2), 3);  // but
    // Le ballon
    const bx = X(this.s.trainZ), by = Y(GX - this.s.trainDist);
    g.beginPath();
    g.arc(bx, by, 5, 0, Math.PI * 2);
    g.fillStyle = '#FFFFFF';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = '#FFE45C';
    g.stroke();
    const dist = Math.hypot(this.s.trainDist, this.s.trainZ);
    $('spotText').textContent = `Ballon à ${Math.round(dist)} m du but. Touche la carte pour le déplacer.`;
  }

  // ---------- Fin des tirs au but ----------
  result(show, title = '', text = '') {
    $('result').hidden = !show;
    if (show) {
      $('resultTitle').textContent = title;
      $('resultText').textContent = text;
    }
  }
}
