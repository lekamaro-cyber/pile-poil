// Écrans : menu d'accueil, aide des commandes, pause, et réglages (qualité, caméra, images/s),
// partagés entre l'accueil et la pause.
import { QUALITY } from '../engine/renderer.js';
import { CAMERA_PRESETS } from '../engine/camera.js';
import { DIFFICULTIES } from '../config.js';
import { saveSettings } from '../save/storage.js';

const $ = (id) => document.getElementById(id);

export class Menus {
  // handlers : play, resume, restart, quit, settingsChanged(key)
  constructor(settings, handlers) {
    this.settings = settings;
    this.h = handlers;
    $('playBtn').addEventListener('click', () => handlers.play());
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
      this.row(box, 'Caméra', 'camera', Object.entries(CAMERA_PRESETS).map(([k, v]) => [k, v.label]));
      this.row(box, 'Mini-carte', 'radar', [[false, 'Masquer'], [true, 'Afficher']]);
      this.row(box, 'Qualité', 'quality', Object.entries(QUALITY).map(([k, v]) => [k, v.label]));
      this.row(box, 'Images/s', 'showFps', [[false, 'Masquer'], [true, 'Afficher']]);
    }
  }
  row(box, label, key, options) {
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
      b.setAttribute('aria-pressed', String(this.settings[key] === value));
      b.addEventListener('click', () => {
        if (this.settings[key] === value) return;
        this.settings[key] = value;
        saveSettings(this.settings);
        this.renderSettings();
        this.h.settingsChanged(key);
      });
      seg.appendChild(b);
    }
    row.append(name, seg);
    box.appendChild(row);
  }

  // Écran visible : 'menu', 'pause' ou null (match)
  show(id) {
    $('menu').hidden = id !== 'menu';
    $('pause').hidden = id !== 'pause';
    if (id === null) this.help(false);
  }
  help(v) {
    $('help').hidden = !v;
  }
}
