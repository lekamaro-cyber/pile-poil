// Point d'entrée : crée la scène 3D, le stade, le match, les commandes et les écrans, puis lance la boucle.
import * as THREE from 'three';
import { VERSION } from './config.js';
import { createRenderer, AdaptiveQuality, presetFor } from './engine/renderer.js';
import { MatchCamera } from './engine/camera.js';
import { buildPitch } from './world/pitch.js';
import { buildStadium } from './world/stadium.js';
import { Match } from './game/match.js';
import { TouchControls } from './input/touch.js';
import { Hud } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { loadSettings } from './save/storage.js';
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

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.5, 700);
const matchCam = new MatchCamera(camera, settings.camera);
const hud = new Hud();
const input = new TouchControls();
const match = new Match(scene, input, hud);

// ---------- États de l'application : menu, match, pause ----------
let mode = 'menu';
const isPortrait = () => innerHeight > innerWidth;

function enterFullscreen() {
  // Plein écran et paysage verrouillé (Android). Sans effet si le navigateur refuse : le jeu marche quand même.
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return Promise.resolve();
  return el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => (screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null))
    .catch(() => {});
}

function play() {
  enterFullscreen();
  match.resetMatch();
  matchCam.snap = true;
  setMode('play');
  history.pushState({ uf: 'match' }, '');
}
function pause() {
  if (mode !== 'play') return;
  setMode('pause');
}
function resume() {
  if (isPortrait()) return;
  setMode('play');
}
function quit() {
  setMode('menu');
}
function setMode(m) {
  mode = m;
  menus.show(m === 'play' ? null : m);
  hud.show(m !== 'menu');
  input.show(m === 'play');
  if (m !== 'play') hud.power(null);
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
  restart: () => {
    match.resetMatch();
    matchCam.snap = true;
    setMode('play');
  },
  quit,
  settingsChanged(key) {
    if (key === 'camera') matchCam.setPreset(settings.camera);
    if (key === 'quality') {
      quality.configure(settings.quality);
      stadium.setCrowd(presetFor(settings.quality).crowd);
    }
  },
});
$('pauseBtn').addEventListener('click', pause);

// Bouton « retour » d'Android pendant le match : pause (au lieu de quitter le jeu)
addEventListener('popstate', () => {
  if (mode === 'play') {
    pause();
    history.pushState({ uf: 'match' }, '');
  } else if (mode === 'pause') {
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
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (mode === 'play' && manual) {
    matchCam.update(dt, match.ball);
  } else if (mode === 'play') {
    input.poll();
    match.update(dt);
    input.endFrame();
    matchCam.update(dt, match.ball);
  } else if (mode === 'pause') {
    matchCam.update(0, match.ball);
  } else {
    menuTime += dt;
    matchCam.overview(menuTime);
  }
  renderer.render(scene, camera);
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
  VERSION, match, input, renderer, camera, settings, quality, stadium, physics, cam: matchCam,
  get mode() { return mode; },
  setManual(v) { manual = v; },
  // Avance le match de n images de durée dt, avec les commandes déjà posées dans UF.input (move, btn)
  step(n, dt = 1 / 60) {
    for (let i = 0; i < n; i++) {
      match.update(dt);
      input.endFrame();
    }
  },
};
