// Sauvegarde locale sur le téléphone (localStorage). Clés préfixées « uf. ».
// Les réglages, dont ceux de l'entraînement (type de tir, position du ballon, mur, gardien).
const PREFIX = 'uf.';

export const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) { /* stockage plein ou bloqué : le jeu continue sans sauvegarder */ }
  },
};

export const DEFAULT_SETTINGS = {
  quality: 'auto', camera: 'normal', showFps: false, difficulty: 'normal', radar: true, showFit: true,
  trainKind: 'freekick', trainDist: 24, trainZ: -5, trainWall: 4, trainKeeper: 'normal',
};

export function loadSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, storage.get('settings', {}));
}
export function saveSettings(s) {
  storage.set('settings', s);
}
