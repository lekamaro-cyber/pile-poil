// Point d'entrée : crée la scène 3D et le stade, les trois jeux (tirs au but, entraînement, match bonus), les
// commandes et les écrans, puis lance la boucle.
import * as THREE from 'three';
import { VERSION, GAME_SPEED } from './config.js';
import { createRenderer, AdaptiveQuality, presetFor } from './engine/renderer.js';
import { MatchCamera } from './engine/camera.js';
import { buildPitch } from './world/pitch.js';
import { buildStadium } from './world/stadium.js';
import { Match } from './game/match.js';
import { SetPiece } from './game/setpiece.js';
import { Training } from './game/training.js';
import { Shootout } from './game/shootout.js';
import { TouchControls } from './input/touch.js';
import { Gesture } from './input/gesture.js';
import { Hud } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { SetPieceUi } from './ui/setpieceUi.js';
import { loadSettings } from './save/storage.js';
import { TEAMS } from './config.js';  // noms des clubs (écran de fin des tirs au but)
import * as physics from './physics/ballPhysics.js';

const $ = (id) => document.getElementById(id);
const settings = loadSettings();
$('version').textContent = 'v' + VERSION;

// ---------- Scène ----------
const renderer = createRenderer($('game'), settings.quality);
const quality = new AdaptiveQuality(renderer);
quality.configure(settings.quality);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9CC7EE');
scene.fog = new THREE.Fog('#9CC7EE', 140, 320);
scene.add(new THREE.HemisphereLight('#E8F2FF', '#4A6B3A', 1.6));
const sun = new THREE.DirectionalLight('#FFF4E0', 1.5);
sun.position.set(-30, 60, 40);
scene.add(sun);
buildPitch(scene);
const stadium = buildStadium(scene, presetFor(settings.quality).crowd);

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.3, 700);
const matchCam = new MatchCamera(camera, settings.camera);
const hud = new Hud();
const input = new TouchControls();
const match = new Match(scene, input, hud);
match.setDifficulty(settings.difficulty);
match.setVisible(false);

// Coups de pied arrêtés : un seul moteur (ballon, tireur, mur, gardien) pour l'entraînement et les tirs au but
const sp = new SetPiece(scene, camera);
const gesture = new Gesture();
const spUi = new SetPieceUi(settings, {
  openPanel: () => {
    if (mode !== 'play') return;
    setMode('panel');
    spUi.openPanel();
  },
  closePanel: () => {
    spUi.closePanel();
    training.start();
    setMode('play');
  },
  again: () => start(game),
  menu: () => quit(),
});
const training = new Training(sp, spUi, settings);
const shootout = new Shootout(sp, spUi, settings, hud);
shootout.onEnd = (winner, kicks) => {
  const g = kicks.map((k) => k.filter(Boolean).length);
  setTimeout(() => {
    if (game !== 'shootout' || mode !== 'play') return;
    setMode('result');
    spUi.result(true, winner === 0 ? 'Victoire !' : 'Défaite',
      `${TEAMS[0].name} ${g[0]} - ${g[1]} ${TEAMS[1].name} aux tirs au but (${kicks[0].length} tirs chacun).`);
  }, 600);
};
const RESULT_TEXT = {
  goal: 'BUT !', saved: 'Arrêt du gardien', wall: 'Dans le mur', post: 'Sur le poteau', wide: 'À côté',
  over: 'Au-dessus', short: 'Trop court', stopped: 'Contré',
};
sp.onPlan = (r) => {
  if (settings.showFit) gesture.showFit(r.screen);
};
sp.onKick = () => gesture.fadeAll(0.7);
sp.onResult = (r) => {
  let title = RESULT_TEXT[r.how] || '', sub = `${r.speed} km/h`;
  if (r.shooter === 1) {  // tu étais le gardien
    title = r.goal ? `But de ${TEAMS[1].short}` : r.how === 'saved' ? 'ARRÊT !' : 'Raté !';
    if (!r.goal && r.how !== 'saved') sub = RESULT_TEXT[r.how].toLowerCase();
  } else if (r.goal && r.post) {
    sub += ' · rentré après le poteau';
  }
  hud.banner(title, sub, 1800);
  if (game === 'training') training.onResult(r);
  else if (game === 'shootout') shootout.onResult(r);
};
gesture.onStroke = (pts) => {
  if (mode === 'play' && game !== 'match') sp.stroke(pts);
};
gesture.onShort = () => hud.banner('Tracé trop court', 'Pars du ballon et va jusqu’au but', 1400);
gesture.onSwipe = (dx, dy) => {
  if (mode === 'play' && game !== 'match') sp.swipe(dx, dy);
};

// ---------- États de l'application : menu, jeu, pause, panneau, résultat ----------
let mode = 'menu';
let game = null;  // 'shootout' | 'training' | 'match'
const isPortrait = () => innerHeight > innerWidth;

function enterFullscreen() {
  // Plein écran et paysage verrouillé (Android). Sans effet si le navigateur refuse : le jeu marche quand même.
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return Promise.resolve();
  return el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => (screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null))
    .catch(() => {});
}

function start(kind) {
  game = kind;
  spUi.result(false);
  spUi.closePanel();
  gesture.clear();
  const isMatch = kind === 'match';
  match.setVisible(isMatch);
  sp.setVisible(!isMatch);
  spUi.showFor(kind);
  menus.helpFor(kind);
  if (isMatch) {
    matchCam.setPreset(settings.camera);
    hud.setTeams(match.teams);
    match.resetMatch();
    matchCam.snap = true;
  } else if (kind === 'training') {
    training.start();
  } else {
    shootout.start();
  }
  setMode('play');
}
function play(kind) {
  enterFullscreen();
  start(kind);
  history.pushState({ uf: 'game' }, '');
}
function pause() {
  if (mode !== 'play' && mode !== 'panel') return;
  spUi.closePanel();
  setMode('pause');
}
function resume() {
  if (isPortrait()) return;
  setMode('play');
}
function quit() {
  spUi.result(false);
  spUi.closePanel();
  match.setVisible(false);
  sp.setVisible(false);
  gesture.clear();
  game = null;
  spUi.showFor(null);
  menus.helpFor(null);
  matchCam.setPreset(settings.camera);
  setMode('menu');
}
function setMode(m) {
  mode = m;
  pending = 0;
  menus.show(m === 'menu' || m === 'pause' ? m : null);
  hud.show(m !== 'menu');
  input.show(m === 'play' && game === 'match');
  if (m !== 'play') {
    hud.power(null);
    gesture.setMode(null);
    spUi.hint('');
  }
  updateRotate();
}
function updateRotate() {
  const show = mode !== 'menu' && isPortrait();
  $('rotate').hidden = !show;
  if (show && mode === 'play') pause();
}

const menus = new Menus(settings, {
  play,
  resume,
  restart: () => start(game),
  quit,
  settingsChanged(key) {
    if (key === 'camera' && game === 'match') matchCam.setPreset(settings.camera);
    if (key === 'difficulty') match.setDifficulty(settings.difficulty);
    if (key === 'quality') {
      quality.configure(settings.quality);
      stadium.setCrowd(presetFor(settings.quality).crowd);
    }
  },
});
menus.helpFor(null);
$('pauseBtn').addEventListener('click', pause);

// Bouton « retour » d'Android pendant le jeu : pause (au lieu de quitter le jeu)
addEventListener('popstate', () => {
  if (mode === 'play' || mode === 'panel') {
    pause();
    history.pushState({ uf: 'game' }, '');
  } else if (mode === 'pause' || mode === 'result') {
    quit();
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

// ---------- Boucle ----------
let last = performance.now();
let menuTime = 0;
let manual = false;  // tests automatiques : le jeu n'avance que quand le test le demande (UF.step)
// Temps de jeu par pas fixes de 1/60 s : le jeu va à la même vitesse quel que soit le nombre d'images par seconde
const STEP = 1 / 60;
let pending = 0;
function stepGame(dt, poll = true) {
  if (game === 'match') {
    if (poll) input.poll();
    match.update(dt);
    input.endFrame();
  } else if (game === 'training') {
    training.update(dt);
  } else if (game === 'shootout') {
    shootout.update(dt);
  }
}
// Gestes permis selon le moment : tracer quand tu dois tirer, glisser quand tu es gardien
function gestureState() {
  if (mode !== 'play' || game === 'match' || !game) return;
  const yourShot = sp.opts && sp.opts.shooter === 0 && sp.phase === 'aim';
  const yourSave = sp.opts && sp.opts.shooter === 1 && !sp.userDive && sp.phase !== 'done' && sp.phase !== 'idle';
  const ready = !(game === 'shootout' && shootout.introT > 0);
  gesture.setMode(ready && yourShot ? 'draw' : ready && yourSave ? 'swipe' : null);
  spUi.hint(ready && (yourShot || (yourSave && sp.phase === 'aim')) ? sp.hint : '');
}
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (mode === 'play' && !manual) {
    pending += dt * GAME_SPEED;
    let n = 0;
    while (pending >= STEP && n < 6) {
      stepGame(STEP);
      pending -= STEP;
      n++;
    }
    if (n === 6) pending = 0;  // téléphone très lent : on ne cherche pas à rattraper
  }
  if (mode === 'menu') {
    menuTime += dt;
    matchCam.overview(menuTime);
  } else if (game === 'match') {
    matchCam.update(mode === 'play' ? dt : 0, match.ball);
  }
  gestureState();
  gesture.frame(dt);
  renderer.render(scene, camera);
  if (mode !== 'menu' && game === 'match') hud.radar(match, settings.radar);
  quality.frame(dt);
  hud.fps(quality.fps, settings.showFps && mode !== 'menu');
  requestAnimationFrame(frame);
}
setMode('menu');
requestAnimationFrame(frame);

// Appli installée : le service worker garde le jeu pour jouer hors ligne et prend les mises à jour
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Accès pour les tests et la console (F12)
window.UF = {
  VERSION, match, sp, training, shootout, gesture, input, renderer, camera, settings, quality, stadium, physics, cam: matchCam,
  get mode() { return mode; },
  get game() { return game; },
  start,
  setManual(v) {
    manual = v;
    sp.sync = v;  // pas à pas : le tir est calculé tout de suite (sans arrière-plan)
  },
  // Avance le jeu en cours de n images de durée dt (commandes déjà posées dans UF.input pour le match)
  step(n, dt = 1 / 60) {
    for (let i = 0; i < n; i++) stepGame(dt, false);
  },
};
