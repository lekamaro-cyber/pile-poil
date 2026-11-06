// Ultimate Football : réglages du jeu. Distances en mètres, vitesses en m/s, durées en secondes.
// Repère : x dans la longueur du terrain (-52,5 à +52,5), z dans la largeur (-34 à +34), y vers le haut.
// La caméra filme depuis le côté z positif : à l'écran, la droite est +x et le haut de l'écran est -z.

export const VERSION = '0.1';

export const PITCH = {
  length: 105, width: 68,
  goalWidth: 7.32, goalHeight: 2.44, goalDepth: 2.0, netBackHeight: 1.9, postRadius: 0.06,
  penaltyDepth: 16.5, penaltyWidth: 40.32,
  goalAreaDepth: 5.5, goalAreaWidth: 18.32,
  penaltySpot: 11, circleRadius: 9.15, cornerRadius: 1, lineWidth: 0.12,
};
PITCH.halfL = PITCH.length / 2;
PITCH.halfW = PITCH.width / 2;

export const BALL = {
  radius: 0.11,
  gravity: 9.81,
  drag: 0.013,          // freinage de l'air, proportionnel à la vitesse au carré
  rollFriction: 0.6,    // freinage constant quand le ballon roule (m/s²)
  rollDamping: 0.3,     // freinage proportionnel à la vitesse quand le ballon roule (par seconde)
  restitution: 0.58,    // rebond sur la pelouse : part de la vitesse verticale gardée
  bounceKeep: 0.86,     // vitesse horizontale gardée à chaque rebond
  postRestitution: 0.7, // rebond sur les poteaux et la barre
};

export const PLAYER = {
  radius: 0.38,
  jogSpeed: 5.0, runSpeed: 6.9, sprintSpeed: 8.7,
  dribbleFactor: 0.9,   // vitesse avec le ballon au pied (fraction de la vitesse normale)
  accel: 16, turnSpeed: 10,
  controlRange: 0.85,   // distance pied-ballon pour contrôler un ballon libre
  maxControlSpeed: 23,  // au-delà, le ballon rebondit sur le joueur au lieu d'être contrôlé
  dribbleDist: 0.6,     // ballon tenu devant le pied pendant la conduite de balle
  kickNoPickup: 0.3,    // après une frappe, le tireur ne peut pas reprendre le ballon tout de suite
  slide: { speed: 9.5, time: 0.55, recover: 0.55, reach: 1.05 },  // tacle glissé
  poke: { range: 1.3, chance: 0.32, interval: 0.6 },              // tacle debout de l'IA
};

export const SHOT = { minSpeed: 13, maxSpeed: 31, chargeTime: 0.9 };
export const PASS = { minSpeed: 6, maxSpeed: 26, arriveSpeed: 5, chargeTime: 0.9 };
// Gardien. save : chance d'arrêt = base - vitesse du tir / speedDiv - étirement × stretch (entre min et max)
export const KEEPER = {
  speed: 5.6, reaction: 0.2, reach: 1.0, diveSpeed: 5.5, diveTime: 0.6, catchSpeed: 19, holdTime: 1.1,
  save: { base: 1.3, speedDiv: 34, stretch: 0.5, min: 0.06, max: 0.97 },
};
export const AI = { shootRange: 24, passPressure: 3.2 };
export const MATCH = { goalPause: 2.8, outPause: 1.1, kickoffPass: 0.6 };

// Clubs fictifs (aucun logo ni maillot réel). keeperKit : tenue du gardien.
export const TEAMS = [
  {
    id: 'rivermont', name: 'FC Rivermont', short: 'RIV', color: '#D7263D',
    kit: { shirt: '#D7263D', shorts: '#F4F4F4', socks: '#D7263D', trim: '#FFFFFF' },
    keeperKit: { shirt: '#22B573', shorts: '#14351F', socks: '#22B573', trim: '#0E2A18', gloves: '#F2F2F2' },
  },
  {
    id: 'portazur', name: 'Port Azur SC', short: 'PAZ', color: '#2B6CD4',
    kit: { shirt: '#2B6CD4', shorts: '#0E1E3A', socks: '#F4F4F4', trim: '#0E1E3A' },
    keeperKit: { shirt: '#F2C14E', shorts: '#2A2A2A', socks: '#F2C14E', trim: '#2A2A2A', gloves: '#F2F2F2' },
  },
];

// Formation 4-4-2, vue de l'équipe qui attaque vers la droite :
//   x : 0 = son propre but, 1 = but adverse ; z : -1 = son côté gauche, +1 = son côté droit
export const FORMATIONS = {
  '4-4-2': [
    { role: 'GK', x: 0.03, z: 0 },
    { role: 'LB', x: 0.2, z: -0.65 }, { role: 'CB', x: 0.17, z: -0.22 }, { role: 'CB', x: 0.17, z: 0.22 }, { role: 'RB', x: 0.2, z: 0.65 },
    { role: 'LM', x: 0.42, z: -0.7 }, { role: 'CM', x: 0.38, z: -0.22 }, { role: 'CM', x: 0.38, z: 0.22 }, { role: 'RM', x: 0.42, z: 0.7 },
    { role: 'ST', x: 0.6, z: -0.18 }, { role: 'ST', x: 0.6, z: 0.18 },
  ],
};
export const DEFENDERS = ['LB', 'CB', 'RB'];
export const SKIN_TONES = ['#F1C7A5', '#E0AC86', '#C68B5E', '#9A6440', '#6E4528'];
export const HAIR_COLORS = ['#20160F', '#4A3020', '#7A5232', '#C9A36A', '#111111'];
