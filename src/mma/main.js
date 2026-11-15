// Jeu de MMA : point d'entrée. Crée la salle et la cage, les écrans, et fait tourner les combats (mode libre et
// carrière). Le jeu de football reste disponible dans football.html (bouton « Autres jeux » de l'accueil).
import * as THREE from 'three';
import { MMA_VERSION } from './data.js';
import { createRenderer, AdaptiveQuality, presetFor } from '../engine/renderer.js';
import { buildArena } from './arena.js';
import { FightCamera } from './fightCamera.js';
import { Fight } from './fight.js';
import { FighterAI, stepLater } from './ai.js';
import { MmaInput } from './input.js';
import { MmaHud } from './hud.js';
import { Screens } from './screens.js';
import { loadMmaSettings } from './save.js';

const $ = (id) => document.getElementById(id);
const settings = loadMmaSettings();
$('mmaVersion').textContent = 'v' + MMA_VERSION;

// ---------- Scène ----------
const renderer = createRenderer($('game'), settings.quality);
const quality = new AdaptiveQuality(renderer);
quality.configure(settings.quality);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0B0E13');
scene.fog = new THREE.Fog('#0B0E13', 14, 40);
const arena = buildArena(scene, presetFor(settings.quality).crowd);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 120);
const cam = new FightCamera(camera);
cam.view = settings.view;
const hud = new MmaHud();
const input = new MmaInput();

let mode = 'menu';     // menu | fight | pause | result
let fight = null, ai = null, setup = null, resultT = 0;
const isPortrait = () => innerHeight > innerWidth;

function enterFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => (screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null))
    .catch(() => {});
}

// ---------- Combats ----------
function startFight(s) {
  setup = s;
  if (fight) fight.dispose(scene);
  fight = new Fight(scene, [s.me, s.opp], { rounds: s.rounds, roundTime: settings.roundTime });
  ai = new FighterAI(fight, fight.f[1], s.level, s.oppStyle);
  fight.onEvent = (a, b) => hud.banner(a, b, 1500);
  hud.setNames(s.me.name, s.opp.nick ? `${s.opp.name} « ${s.opp.nick} »` : s.opp.name);
  cam.snap = true;
  resultT = 0;
  enterFullscreen();
  setMode('fight');
  history.pushState({ mma: 'fight' }, '');
}
function setMode(m) {
  mode = m;
  pending = 0;
  screens.show(m === 'menu' ? (screens.current || 'mmaMenu') : m === 'pause' ? 'mmaPause' : m === 'result' ? 'fightResult' : null);
  hud.show(m === 'fight' || m === 'pause');
  input.show(m === 'fight');
  updateRotate();
}
function pause() {
  if (mode === 'fight') setMode('pause');
}
function quitFight() {
  // Quitter un combat de carrière compte comme une défaite (abandon)
  if (fight && !fight.result && setup.mode === 'career') {
    fight.finish(fight.f[1], 'Abandon', 'combat quitté');
    endFight();
    return;
  }
  if (fight) fight.dispose(scene);
  fight = null;
  screens.current = setup && setup.mode === 'career' ? 'careerHub' : 'ladderScreen';
  setMode('menu');
  if (setup && setup.mode === 'career') screens.openCareer();
  else screens.openLadder();
}
function endFight() {
  const reward = screens.record(setup, fight.result);
  screens.showResult(setup, fight.result, fight, reward);
  setMode('result');
}
function updateRotate() {
  const show = mode !== 'menu' && isPortrait();
  $('mmaRotate').hidden = !show;
  if (show && mode === 'fight') pause();
}

const screens = new Screens(settings, {
  fight: startFight,
  resume: () => { if (!isPortrait()) setMode('fight'); },
  quit: quitFight,
  settingsChanged(key) {
    if (key === 'view') cam.view = settings.view;
    if (key === 'quality') quality.configure(settings.quality);
  },
});
$('resContinue').addEventListener('click', () => {
  if (fight) fight.dispose(scene);
  fight = null;
  if (setup.mode === 'career') {
    screens.current = 'careerHub';
    setMode('menu');
    screens.openCareer();
  } else {
    screens.current = 'ladderScreen';
    setMode('menu');
    screens.openLadder();
  }
});
$('resAgain').addEventListener('click', () => {
  if (setup.mode === 'career') screens.fightCareer();
  else screens.fightLadder(setup.index);
});
$('mmaPauseBtn').addEventListener('click', pause);

addEventListener('popstate', () => {
  if (mode === 'fight') {
    pause();
    history.pushState({ mma: 'fight' }, '');
  } else if (mode === 'pause') {
    setMode('fight');
    history.pushState({ mma: 'fight' }, '');
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('contextmenu', (e) => e.preventDefault());

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  updateRotate();
}
addEventListener('resize', resize);
resize();

// ---------- Tes commandes → intentions de ton combattant ----------
function applyInput() {
  const me = fight.f[0], o = fight.f[1];
  input.poll();
  const b = cam.basis(), m = input.move;
  const wx = b.rx * m.x + b.fx * m.y, wz = b.rz * m.x + b.fz * m.y;
  me.intent.move.x = wx;
  me.intent.move.z = wz;
  me.intent.guard = input.btn.guard.down;
  if (input.presses.length && !me.intent.press) {
    const pr = input.presses.shift();
    // Direction du joystick (au moment de l'appui) par rapport à l'adversaire : vers lui, en reculant, sur le
    // côté, ou neutre
    const px = b.rx * pr.x + b.fx * pr.y, pz = b.rz * pr.x + b.fz * pr.y;
    let dir = 'neutral';
    const mag = Math.hypot(px, pz);
    if (mag > 0.3) {
      const dx = o.pos.x - me.pos.x, dz = o.pos.z - me.pos.z, d = Math.hypot(dx, dz) || 1;
      const c = (px * dx + pz * dz) / (mag * d);
      dir = c > 0.55 ? 'forward' : c < -0.55 ? 'back' : 'lateral';
    }
    me.intent.press = { btn: pr.btn, dir };
  }
  // Noms des boutons selon la situation
  if (fight.sub) {
    const att = fight.sub.att === me;
    input.labels({ punch: '—', kick: '—', guard: att ? '—' : 'Dégager', grapple: att ? 'Serrer' : 'Dégager' });
  } else if (me.ground) {
    input.labels({ punch: 'Frapper', kick: 'Se relever', guard: 'Bloquer', grapple: 'Soumission' });
  } else {
    input.labels({ punch: 'Poing', kick: 'Pied', guard: 'Garde', grapple: 'Lutte' });
  }
}

// ---------- Boucle (pas fixes de 1/60 s) ----------
const STEP = 1 / 60;
let pending = 0, last = performance.now(), menuTime = 0, manual = false;
function step(dt) {
  if (!fight) return;
  if (mode === 'fight') applyInput();
  stepLater(fight, dt);
  ai.update(dt);
  fight.update(dt);
  if (fight.result && mode === 'fight') {
    resultT += dt;
    if (resultT > 2.6) endFight();
  }
}
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if ((mode === 'fight' || mode === 'result') && !manual && fight) {
    pending += dt;
    let n = 0;
    while (pending >= STEP && n < 6) {
      step(STEP);
      pending -= STEP;
      n++;
    }
    if (n === 6) pending = 0;
  }
  if (fight && mode !== 'menu') {
    cam.update(mode === 'pause' ? 0 : dt, fight.f[0], fight.f[1]);
    hud.update(fight);
  } else {
    menuTime += dt;
    cam.overview(menuTime);
  }
  renderer.render(scene, camera);
  quality.frame(dt);
  const fps = $('mmaFps');
  fps.hidden = !(settings.showFps && mode !== 'menu');
  if (!fps.hidden) fps.textContent = Math.round(quality.fps) + ' i/s';
  requestAnimationFrame(frame);
}
setMode('menu');
requestAnimationFrame(frame);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Accès pour les tests et la console (F12)
window.MMA = {
  VERSION: MMA_VERSION, settings, input, camera, cam, screens, arena,
  get fight() { return fight; },
  get ai() { return ai; },
  get mode() { return mode; },
  get setup() { return setup; },
  startFight,
  setManual(v) { manual = v; },
  step(n, dt = 1 / 60) { for (let i = 0; i < n; i++) step(dt); },
};
