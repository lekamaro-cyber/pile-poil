// Sauvegarde locale sur le téléphone (localStorage). Clés préfixées « uf. ».
// Étape 1 : les réglages. Les carrières, résultats et transferts arriveront aux étapes 4 à 6.
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

export const DEFAULT_SETTINGS = { quality: 'auto', camera: 'normal', showFps: false, difficulty: 'normal', radar: true };

export function loadSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, storage.get('settings', {}));
}
export function saveSettings(s) {
  storage.set('settings', s);
}
