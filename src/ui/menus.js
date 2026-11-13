// Écrans : menu d'accueil (tirs au but, entraînement, match bonus), aide des commandes, pause, et réglages
// partagés entre l'accueil et la pause.
import { QUALITY } from '../engine/renderer.js';
import { CAMERA_PRESETS } from '../engine/camera.js';
import { DIFFICULTIES } from '../config.js';
import { saveSettings } from '../save/storage.js';

const $ = (id) => document.getElementById(id);

// Une ligne de réglage : un libellé et des boutons à choix unique
export function segRow(box, label, options, current, onPick) {
  const row = document.createElement('div');
  row.className = 'set-row';
  const name = document.createElement('span');
  name.textContent = label;
  const seg = document.createElement('div');
  seg.className = 'seg';
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', label);
  for (const [value, text] of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.setAttribute('aria-pressed', String(current === value));
    b.addEventListener('click', () => {
      if (current !== value) onPick(value);
    });
    seg.appendChild(b);
  }
  row.append(name, seg);
  box.appendChild(row);
  return row;
}

export class Menus {
  // handlers : play(jeu), resume, restart, quit, settingsChanged(key)
  constructor(settings, handlers) {
    this.settings = settings;
    this.h = handlers;
    $('shootoutBtn').addEventListener('click', () => handlers.play('shootout'));
    $('trainBtn').addEventListener('click', () => handlers.play('training'));
    $('matchBtn').addEventListener('click', () => handlers.play('match'));
    $('helpBtn').addEventListener('click', () => this.help(true));
    $('helpClose').addEventListener('click', () => this.help(false));
    $('resumeBtn').addEventListener('click', () => handlers.resume());
    $('restartBtn').addEventListener('click', () => handlers.restart());
    $('quitBtn').addEventListener('click', () => handlers.quit());
    $('pauseHelpBtn').addEventListener('click', () => this.help(true));
    this.renderSettings();
  }

  renderSettings() {
    for (const box of [$('menuSettings'), $('pauseSettings')]) {
      box.textContent = '';
      this.row(box, 'Difficulté', 'difficulty', Object.entries(DIFFICULTIES).map(([k, v]) => [k, v.label]));
      this.row(box, 'Trajectoire calculée', 'showFit', [[false, 'Masquer'], [true, 'Afficher']]);
      this.row(box, 'Caméra (match)', 'camera', Object.entries(CAMERA_PRESETS).map(([k, v]) => [k, v.label]));
      this.row(box, 'Mini-carte (match)', 'radar', [[false, 'Masquer'], [true, 'Afficher']]);
      this.row(box, 'Qualité', 'quality', Object.entries(QUALITY).map(([k, v]) => [k, v.label]));
      this.row(box, 'Images/s', 'showFps', [[false, 'Masquer'], [true, 'Afficher']]);
    }
  }
  row(box, label, key, options) {
    segRow(box, label, options, this.settings[key], (value) => {
      this.settings[key] = value;
      saveSettings(this.settings);
      this.renderSettings();
      this.h.settingsChanged(key);
    });
  }

  // Écran visible : 'menu', 'pause' ou null (en jeu)
  show(id) {
    $('menu').hidden = id !== 'menu';
    $('pause').hidden = id !== 'pause';
    if (id === null) this.help(false);
  }
  // Aide : les commandes du jeu en cours en premier
  helpFor(game) {
    $('helpSetpiece').hidden = game === 'match';
    $('helpMatch').hidden = game !== 'match' && game !== null;
  }
  help(v) {
    $('help').hidden = !v;
  }
}
