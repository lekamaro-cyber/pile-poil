// Combat MMA : réglages et données (coups, styles, niveaux du mode libre, échelle de la carrière, noms inventés).
// Distances en mètres, durées en secondes, dégâts en points de santé (sur 100).

export const MMA_VERSION = '1.0';

// Caractéristiques d'un combattant (40 à 99)
export const STAT_KEYS = ['power', 'speed', 'wrestling', 'grappling', 'defense', 'cardio', 'chin'];
export const STAT_LABELS = {
  power: 'Frappe', speed: 'Vitesse', wrestling: 'Lutte', grappling: 'Sol (soumissions)', defense: 'Défense',
  cardio: 'Cardio', chin: 'Menton',
};
export const STAT_HELP = {
  power: 'dégâts des coups', speed: 'rapidité des coups et des déplacements', wrestling: 'amenées au sol et défense',
  grappling: 'soumissions et défense au sol', defense: 'garde plus solide, esquives', cardio: 'énergie qui remonte plus vite',
  chin: 'encaisse mieux les coups à la tête',
};

// Styles de départ (mode libre et création de carrière)
export const STYLES = {
  boxer:    { label: 'Boxeur',     stats: { power: 64, speed: 66, wrestling: 42, grappling: 40, defense: 62, cardio: 56, chin: 60 }, kicks: 0.9, likes: { punch: 0.7, kick: 0.15, grapple: 0.15 } },
  kick:     { label: 'Kickboxeur', stats: { power: 66, speed: 60, wrestling: 44, grappling: 42, defense: 56, cardio: 58, chin: 56 }, kicks: 1.15, likes: { punch: 0.45, kick: 0.45, grapple: 0.1 } },
  wrestler: { label: 'Lutteur',    stats: { power: 54, speed: 50, wrestling: 72, grappling: 56, defense: 54, cardio: 64, chin: 58 }, kicks: 0.9, likes: { punch: 0.45, kick: 0.15, grapple: 0.4 } },
  bjj:      { label: 'Jiu-jitsu',  stats: { power: 48, speed: 52, wrestling: 58, grappling: 74, defense: 54, cardio: 60, chin: 56 }, kicks: 0.9, likes: { punch: 0.4, kick: 0.2, grapple: 0.4 } },
};

// Coups. windup : temps avant l'impact ; active : fenêtre où le coup touche ; recover : retour en garde.
// reach : distance (centre à centre) où le coup touche ; dmg : dégâts de base ; cost : énergie dépensée ;
// block : part des dégâts arrêtée par la garde (0 = la garde n'y fait rien) ; straight : coup droit (on peut
// l'esquiver en se déplaçant sur le côté) ; push : recul de l'adversaire touché.
export const STRIKES = {
  jab:    { label: 'Jab',         kind: 'punch', zone: 'head', windup: 0.10, active: 0.06, recover: 0.16, reach: 1.15, dmg: 4,  cost: 3,  block: 0.8,  straight: true },
  cross:  { label: 'Direct',      kind: 'punch', zone: 'head', windup: 0.16, active: 0.06, recover: 0.24, reach: 1.2,  dmg: 8,  cost: 5,  block: 0.75, straight: true },
  hook:   { label: 'Crochet',     kind: 'punch', zone: 'head', windup: 0.20, active: 0.07, recover: 0.28, reach: 1.0,  dmg: 10, cost: 6,  block: 0.6 },
  upper:  { label: 'Uppercut',    kind: 'punch', zone: 'head', windup: 0.18, active: 0.06, recover: 0.28, reach: 0.9,  dmg: 11, cost: 6,  block: 0.45 },
  low:    { label: 'Low kick',    kind: 'kick',  zone: 'legs', windup: 0.22, active: 0.08, recover: 0.30, reach: 1.3,  dmg: 7,  cost: 6,  block: 0 },
  body:   { label: 'Middle kick', kind: 'kick',  zone: 'body', windup: 0.28, active: 0.08, recover: 0.34, reach: 1.35, dmg: 10, cost: 8,  block: 0.7 },
  high:   { label: 'High kick',   kind: 'kick',  zone: 'head', windup: 0.36, active: 0.08, recover: 0.42, reach: 1.4,  dmg: 17, cost: 10, block: 0.7 },
  teep:   { label: 'Front kick',  kind: 'kick',  zone: 'body', windup: 0.22, active: 0.08, recover: 0.28, reach: 1.4,  dmg: 5,  cost: 5,  block: 0.6,  straight: true, push: 0.7 },
  gpunch: { label: 'Coup au sol', kind: 'ground', zone: 'head', windup: 0.18, active: 0.05, recover: 0.3, reach: 9, dmg: 5,  cost: 5, block: 0.7 },
  bpunch: { label: 'Coup du dessous', kind: 'ground', zone: 'head', windup: 0.14, active: 0.05, recover: 0.22, reach: 9, dmg: 2.5, cost: 3, block: 0.6 },
};
// Bouton + direction du joystick → coup (neutre, vers l'adversaire, sur le côté, en reculant)
export const MOVE_MAP = {
  punch: { neutral: 'jab', forward: 'cross', lateral: 'hook', back: 'upper' },
  kick: { neutral: 'low', forward: 'body', lateral: 'high', back: 'teep' },
};

export const RULES = {
  damage: 0.6,          // réglage général des dégâts (combats qui vont plus souvent au bout, comme en vrai)
  cageRadius: 4.1,      // les combattants restent dans la cage (rayon intérieur)
  minGap: 0.62,         // distance minimale entre les deux combattants
  walk: 2.0,            // vitesse de déplacement (m/s), modifiée par Vitesse, jambes et énergie
  takedownRange: 1.5,   // distance pour tenter d'amener au sol
  standUpIdle: 15,      // l'arbitre relève les combattants après 15 s sans action au sol
  breakTime: 3,         // pause entre les rounds (s)
  subMax: 7,            // durée maximale d'une soumission (s)
};

// Niveau de l'ordinateur (1 à 10) : réaction (s), garde quand tu frappes, défense de lutte, agressivité,
// enchaînements, vitesse pour se dégager d'une soumission (appuis par seconde)
export function aiLevel(n) {
  const k = (Math.max(1, Math.min(10, n)) - 1) / 9;
  return {
    n,
    reaction: 0.55 - 0.41 * k,
    guard: 0.08 + 0.57 * k,
    sprawl: 0.05 + 0.55 * k,
    aggression: 0.35 + 0.4 * k,
    combo: 0.1 + 0.5 * k,
    think: 0.6 - 0.35 * k,
    mash: 3.5 + 5 * k,
  };
}

// ---------- Mode libre : 10 niveaux à débloquer ----------
const mk = (name, nick, style, avg, level, look) => ({ name, nick, style, avg, level, look });
export const LADDER = [
  mk('Léo Barrat', 'Le Novice', 'boxer', 44, 1, { skin: 0, hair: 1, shorts: '#2E7D32' }),
  mk('Sami Kordel', '', 'wrestler', 48, 2, { skin: 2, hair: 0, shorts: '#455A64' }),
  mk('Hugo Delvane', 'Marteau', 'kick', 52, 3, { skin: 1, hair: 3, shorts: '#F9A825' }),
  mk('Ilan Ferrazi', '', 'bjj', 56, 4, { skin: 1, hair: 4, shorts: '#1565C0' }),
  mk('Bastien Rouk', 'Bulldozer', 'wrestler', 60, 5, { skin: 0, hair: 2, shorts: '#6D4C41' }),
  mk('Teo Malvane', "L'Éclair", 'boxer', 65, 6, { skin: 3, hair: 0, shorts: '#FFFFFF' }),
  mk('Rayan Ostrik', '', 'kick', 70, 7, { skin: 2, hair: 4, shorts: '#C62828' }),
  mk('Viktor Sallem', 'Le Python', 'bjj', 75, 8, { skin: 0, hair: 3, shorts: '#4A148C' }),
  mk('Kenji Moraht', 'Typhon', 'kick', 80, 9, { skin: 1, hair: 4, shorts: '#00838F' }),
  mk('Axel Tamberg', 'Le Roc', 'wrestler', 86, 10, { skin: 0, hair: 1, shorts: '#212121' }),
];
// Combattants proposés en mode libre (un par style)
export const FREE_FIGHTERS = {
  boxer: { name: 'Nico Varenne', look: { skin: 1, hair: 0, shorts: '#D32F2F' } },
  kick: { name: 'Yanis Corval', look: { skin: 3, hair: 4, shorts: '#1976D2' } },
  wrestler: { name: 'Max Doran', look: { skin: 0, hair: 2, shorts: '#388E3C' } },
  bjj: { name: 'Lucas Brenet', look: { skin: 2, hair: 1, shorts: '#7B1FA2' } },
};

// ---------- Carrière : 15 combats jusqu'à la ceinture ----------
export const CAREER = { fights: 15, titleRounds: 5, pointsDecision: 3, pointsFinish: 4, pointsQuick: 1, statMax: 99 };
export function careerTier(rung) {
  if (rung >= 15) return rung === 15 ? 'Combat pour le titre' : 'Défense du titre';
  if (rung >= 12) return 'Éliminatoire';
  if (rung >= 5) return 'Professionnel';
  return 'Amateur';
}
export const WEIGHTS = { light: 'Poids légers', welter: 'Poids welters', middle: 'Poids moyens', heavy: 'Poids lourds' };
export const WEIGHT_SCALE = { light: 0.96, welter: 1, middle: 1.03, heavy: 1.08 };

export const SKINS = ['#F1C7A5', '#E0AC86', '#C68B5E', '#9A6440', '#6E4528'];
export const HAIRS = ['#20160F', '#4A3020', '#7A5232', '#C9A36A', '#111111'];
export const SHORTS = ['#D32F2F', '#1976D2', '#388E3C', '#212121', '#F9A825', '#7B1FA2'];

// Noms inventés pour les adversaires de carrière (aucun vrai combattant)
const FIRST = ['Adam', 'Bruno', 'Cyril', 'Dorian', 'Elio', 'Fabien', 'Gaël', 'Hadrien', 'Ivo', 'Jonas', 'Karim', 'Loïc',
  'Mathis', 'Nael', 'Oscar', 'Pavel', 'Quentin', 'Romain', 'Soren', 'Tiago', 'Ulric', 'Valentin', 'Wesley', 'Yoann', 'Zeno'];
const LAST = ['Arvane', 'Belcourt', 'Cardel', 'Dravik', 'Estrol', 'Fennard', 'Gorvan', 'Halbrecht', 'Iverno', 'Jaskel',
  'Korvel', 'Lambrac', 'Morvane', 'Nestrak', 'Orvalle', 'Pradel', 'Quernot', 'Rostand', 'Sevrin', 'Talvik', 'Urbach',
  'Valdren', 'Wexler', 'Ystrem', 'Zandor'];
const NICKS = ['', '', 'Le Requin', 'La Foudre', 'Le Bûcheron', "L'Ombre", 'Le Taureau', 'Le Viking', 'Le Scorpion', 'La Tornade',
  'Le Mur', 'Le Chirurgien', "L'Enclume", 'Le Loup', 'Le Volcan'];
const STYLE_KEYS = Object.keys(STYLES);

// Petit tirage au sort reproductible (même carrière → mêmes adversaires)
export function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function careerOpponent(seed, rung) {
  const r = seeded(seed * 97 + rung * 7919);
  const pick = (list) => list[Math.floor(r() * list.length)];
  const avg = Math.min(92, 42 + rung * 3.1);
  return {
    name: `${pick(FIRST)} ${pick(LAST)}`, nick: pick(NICKS), style: pick(STYLE_KEYS), avg,
    level: Math.min(10, Math.ceil(rung / 1.5)),
    look: { skin: Math.floor(r() * SKINS.length), hair: Math.floor(r() * HAIRS.length), shorts: pick(SHORTS) },
  };
}

// Caractéristiques d'un adversaire : celles de son style, ramenées à la moyenne voulue
export function statsFor(style, avg) {
  const base = STYLES[style].stats, keys = STAT_KEYS;
  const mean = keys.reduce((a, k) => a + base[k], 0) / keys.length;
  const out = {};
  for (const k of keys) out[k] = Math.round(Math.max(30, Math.min(99, base[k] + (avg - mean))));
  return out;
}
