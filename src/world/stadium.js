// Stade : quatre tribunes en gradins, supporters (un seul objet « instancié » par tribune, très léger),
// panneaux publicitaires inventés autour du terrain et quatre pylônes d'éclairage.
import * as THREE from 'three';
import { PITCH, TEAMS } from '../config.js';
import { merge, boxAt, canvasTexture } from '../engine/geometry.js';

const ROWS = 12, ROW_DEPTH = 0.85, ROW_RISE = 0.5, BASE = 1.0, SEAT = 0.55;
const CROWD_COLORS = [TEAMS[0].kit.shirt, TEAMS[0].kit.shirt, TEAMS[1].kit.shirt, TEAMS[1].kit.shirt,
  '#F4F4F4', '#2A2E35', '#3B4A63', '#E8C547', '#7E8C9A', '#B23A48', '#1F3F7A'];

// Une tribune le long d'un côté. length : longueur ; front : distance du centre au premier rang ;
// axis 'x' (tribune parallèle à la longueur, côté z) ou 'z' (derrière un but, côté x) ; side : -1 ou 1.
function standStructure(scene, { length, front, axis, side }, state) {
  // Gradins : une marche par rang, fusionnées en un seul objet
  const steps = [];
  for (let i = 0; i < ROWS; i++) {
    const top = BASE + i * ROW_RISE, d = front + (i + 0.5) * ROW_DEPTH;
    steps.push(axis === 'x' ? boxAt(length, top, ROW_DEPTH, 0, top / 2, side * d) : boxAt(ROW_DEPTH, top, length, side * d, top / 2, 0));
  }
  const backTop = BASE + ROWS * ROW_RISE + 2.5, backD = front + ROWS * ROW_DEPTH + 0.3;
  steps.push(axis === 'x' ? boxAt(length, backTop, 0.6, 0, backTop / 2, side * backD) : boxAt(0.6, backTop, length, side * backD, backTop / 2, 0));
  // Toit
  const roofD = front + ROWS * ROW_DEPTH * 0.55;
  steps.push(axis === 'x' ? boxAt(length, 0.3, ROWS * ROW_DEPTH * 0.9, 0, backTop + 1.2, side * roofD) : boxAt(ROWS * ROW_DEPTH * 0.9, 0.3, length, side * roofD, backTop + 1.2, 0));
  scene.add(new THREE.Mesh(merge(steps.map((geometry) => ({ geometry })), false), state.concrete));
}

// Supporters : petits blocs colorés assis sur les gradins (crowdRatio : part des places occupées)
function standCrowd({ length, front, axis, side }, crowdRatio, state) {
  const seats = [];
  const perRow = Math.floor(length / SEAT);
  for (let i = 0; i < ROWS; i++) {
    for (let k = 0; k < perRow; k++) {
      if (Math.random() > crowdRatio * 0.92) continue;  // places vides
      const along = -length / 2 + (k + 0.5) * SEAT + (Math.random() - 0.5) * 0.12;
      const d = front + (i + 0.45) * ROW_DEPTH, y = BASE + i * ROW_RISE + 0.3;
      seats.push(axis === 'x' ? [along, y, side * d] : [side * d, y, along]);
    }
  }
  if (!seats.length) return null;
  const crowd = new THREE.InstancedMesh(state.fanGeo, state.fanMat, seats.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), c = new THREE.Color();
  const face = axis === 'x' ? (side > 0 ? Math.PI : 0) : (side > 0 ? -Math.PI / 2 : Math.PI / 2);
  seats.forEach(([x, y, z], i) => {
    const h = 0.85 + Math.random() * 0.3;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), face + (Math.random() - 0.5) * 0.4);
    m.compose(pos.set(x, y + (h - 1) * 0.3, z), q, s.set(1, h, 1));
    crowd.setMatrixAt(i, m);
    crowd.setColorAt(i, c.set(CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)]));
  });
  crowd.instanceMatrix.needsUpdate = true;
  crowd.computeBoundingSphere();
  return crowd;
}

function adBoards(scene) {
  const tex = canvasTexture(1024, 64, (g, w, h) => {
    g.fillStyle = '#0B1830';
    g.fillRect(0, 0, w, h);
    g.font = 'italic 900 34px system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.textAlign = 'center';
    const items = [['ULTIMATE FOOTBALL', '#FFFFFF'], ['BULLEO STUDIO', '#FF8A2A']];
    items.forEach(([text, color], i) => {
      g.fillStyle = color;
      g.fillText(text, (i + 0.5) * (w / items.length), h / 2 + 2);
    });
  });
  tex.wrapS = THREE.RepeatWrapping;
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const gap = 4.5, H = 0.9;
  const sideLen = PITCH.length + 14, endLen = PITCH.width + 10;
  const boards = [
    [sideLen, 0, -(PITCH.halfW + gap), 0], [sideLen, 0, PITCH.halfW + gap, Math.PI],
    [endLen, -(PITCH.halfL + gap), 0, Math.PI / 2], [endLen, PITCH.halfL + gap, 0, -Math.PI / 2],
  ];
  for (const [len, x, z, rot] of boards) {
    const t = tex.clone();
    t.repeat.set(len / 24, 1);
    t.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, H, 0.12), mat.clone());
    m.material.map = t;
    m.position.set(x, H / 2, z);
    m.rotation.y = rot;
    scene.add(m);
  }
}

function floodlights(scene) {
  const pole = new THREE.MeshLambertMaterial({ color: '#6C7480' });
  const lamp = new THREE.MeshBasicMaterial({ color: '#FFF8DC' });
  const parts = [], lamps = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = sx * (PITCH.halfL + 16), z = sz * (PITCH.halfW + 18);
      parts.push(new THREE.CylinderGeometry(0.35, 0.6, 32, 8).translate(x, 16, z));
      const panel = new THREE.BoxGeometry(6, 3, 0.4);
      panel.rotateY(Math.atan2(-x, -z));
      lamps.push(panel.translate(x * 0.98, 33, z * 0.98));
    }
  }
  scene.add(new THREE.Mesh(merge(parts.map((geometry) => ({ geometry })), false), pole));
  scene.add(new THREE.Mesh(merge(lamps.map((geometry) => ({ geometry })), false), lamp));
}

// crowdRatio : part des places occupées (réglage de qualité). Renvoie une fonction pour la changer.
export function buildStadium(scene, crowdRatio) {
  const state = {
    concrete: new THREE.MeshLambertMaterial({ color: '#8A929C' }),
    fanGeo: new THREE.BoxGeometry(0.42, 0.62, 0.34),
    fanMat: new THREE.MeshLambertMaterial({ color: '#FFFFFF' }),
    crowds: [],
  };
  const stands = [
    { length: PITCH.length + 16, front: PITCH.halfW + 7, axis: 'x', side: -1 },
    { length: PITCH.length + 16, front: PITCH.halfW + 7, axis: 'x', side: 1 },
    { length: PITCH.width + 12, front: PITCH.halfL + 8, axis: 'z', side: -1 },
    { length: PITCH.width + 12, front: PITCH.halfL + 8, axis: 'z', side: 1 },
  ];
  for (const st of stands) standStructure(scene, st, state);
  const fill = (ratio) => {  // seuls les supporters changent avec la qualité
    for (const c of state.crowds) {
      scene.remove(c);
      c.dispose();
    }
    state.crowds = [];
    for (const st of stands) {
      const c = standCrowd(st, ratio, state);
      if (c) {
        scene.add(c);
        state.crowds.push(c);
      }
    }
  };
  fill(crowdRatio);
  adBoards(scene);
  floodlights(scene);
  return { setCrowd: fill, crowdCount: () => state.crowds.reduce((n, c) => n + c.count, 0) };
}
