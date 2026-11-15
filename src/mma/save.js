// Sauvegardes du jeu de MMA sur le téléphone (clés « uf.mma.* ») : réglages, progression du mode libre, carrière.
import { storage } from '../save/storage.js';
import { LADDER } from './data.js';

export const MMA_DEFAULTS = { quality: 'auto', view: 'close', roundTime: 90, showFps: false };

export function loadMmaSettings() {
  return Object.assign({}, MMA_DEFAULTS, storage.get('mma.settings', {}));
}
export function saveMmaSettings(s) {
  storage.set('mma.settings', s);
}

// Mode libre : étoiles obtenues à chaque niveau (0 à 3) et style choisi
export function loadLadder() {
  const l = Object.assign({ stars: [], style: 'boxer' }, storage.get('mma.ladder', {}));
  l.stars = LADDER.map((_, i) => Math.max(0, Math.min(3, l.stars[i] | 0)));
  return l;
}
export function saveLadder(l) {
  storage.set('mma.ladder', l);
}
// Niveau i débloqué : le premier, puis chaque niveau dont le précédent est gagné
export function unlocked(l, i) {
  return i === 0 || l.stars[i - 1] > 0;
}

// Carrière (null s'il n'y en a pas)
export function loadCareer() {
  return storage.get('mma.career', null);
}
export function saveCareer(c) {
  storage.set('mma.career', c);
}
export function deleteCareer() {
  storage.set('mma.career', null);
}
