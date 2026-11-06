// Terrain : pelouse tondue en bandes, lignes réglementaires (en un seul objet 3D) et deux cages avec filets.
import * as THREE from 'three';
import { PITCH } from '../config.js';
import { merge, canvasTexture } from '../engine/geometry.js';

const LINE_Y = 0.012;

function grassTexture() {
  const t = canvasTexture(1024, 64, (g, w, h) => {
    const stripes = 18;  // bandes de tonte perpendiculaires à la longueur
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 ? '#3D8B40' : '#47A04A';
      g.fillRect(Math.floor(i * w / stripes), 0, Math.ceil(w / stripes) + 1, h);
    }
    for (let i = 0; i < 5000; i++) {  // petites irrégularités du gazon
      g.fillStyle = `rgba(0,0,0,${(Math.random() * 0.07).toFixed(3)})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
  });
  t.anisotropy = 4;
  return t;
}

// Morceaux de lignes, tous à plat sur la pelouse
function rect(cx, cz, lx, lz) {
  return new THREE.PlaneGeometry(lx, lz).rotateX(-Math.PI / 2).translate(cx, LINE_Y, cz);
}
// Arc de cercle : centre, rayon, angle central (repère du sol : direction (cos a, -sin a) en x et z)
function arc(cx, cz, r, start, len, seg = 48) {
  const w = PITCH.lineWidth;
  return new THREE.RingGeometry(r - w / 2, r + w / 2, seg, 1, start, len).rotateX(-Math.PI / 2).translate(cx, LINE_Y, cz);
}
function spot(cx, cz) {
  return new THREE.CircleGeometry(0.15, 16).rotateX(-Math.PI / 2).translate(cx, LINE_Y, cz);
}

function lines() {
  const { halfL, halfW, lineWidth: w } = PITCH;
  const parts = [
    rect(0, -halfW, PITCH.length + w, w), rect(0, halfW, PITCH.length + w, w),   // lignes de touche
    rect(-halfL, 0, w, PITCH.width + w), rect(halfL, 0, w, PITCH.width + w),       // lignes de but
    rect(0, 0, w, PITCH.width),                                                    // ligne médiane
    arc(0, 0, PITCH.circleRadius, 0, Math.PI * 2, 72), spot(0, 0),                 // rond central
  ];
  for (const s of [-1, 1]) {
    const pa = halfL - PITCH.penaltyDepth, ga = halfL - PITCH.goalAreaDepth;
    const pw = PITCH.penaltyWidth / 2, gw = PITCH.goalAreaWidth / 2;
    parts.push(
      rect(s * pa, 0, w, PITCH.penaltyWidth + w),                                   // surface de réparation
      rect(s * (halfL + pa) / 2, -pw, PITCH.penaltyDepth, w),
      rect(s * (halfL + pa) / 2, pw, PITCH.penaltyDepth, w),
      rect(s * ga, 0, w, PITCH.goalAreaWidth + w),                                  // surface de but
      rect(s * (halfL + ga) / 2, -gw, PITCH.goalAreaDepth, w),
      rect(s * (halfL + ga) / 2, gw, PITCH.goalAreaDepth, w),
      spot(s * (halfL - PITCH.penaltySpot), 0),                                     // point de penalty
    );
    // Arc de la surface : la partie du cercle de 9,15 m qui dépasse de la surface
    const half = Math.acos((PITCH.penaltyDepth - PITCH.penaltySpot) / PITCH.circleRadius);
    const center = s > 0 ? Math.PI : 0;  // vers le centre du terrain
    parts.push(arc(s * (halfL - PITCH.penaltySpot), 0, PITCH.circleRadius, center - half, half * 2, 32));
    // Arcs de coin
    for (const sz of [-1, 1]) {
      const a = Math.atan2(sz, -s);  // direction vers l'intérieur du terrain
      parts.push(arc(s * halfL, sz * halfW, PITCH.cornerRadius, a - Math.PI / 4, Math.PI / 2, 12));
    }
  }
  const geo = merge(parts.map((g) => ({ geometry: g })), false);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#F2F4F0' }));
}

// Filet : grille de traits sur les faces arrière, haut et côtés
function netGeometry(s) {
  const { halfL } = PITCH, hw = PITCH.goalWidth / 2, H = PITCH.goalHeight, D = PITCH.goalDepth, BH = PITCH.netBackHeight;
  const pts = [];
  const step = 0.25;
  const seg = (a, b) => pts.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const X = (d) => s * (halfL + d);
  const topAt = (d) => H + (BH - H) * (d / D);
  for (let z = -hw; z <= hw + 1e-6; z += step) {
    seg([X(D), 0, z], [X(D), BH, z]);              // fond (traits verticaux)
    seg([X(0), H, z], [X(D), BH, z]);              // toit
  }
  for (let y = 0; y <= BH + 1e-6; y += step) seg([X(D), y, -hw], [X(D), y, hw]);  // fond (traits horizontaux)
  for (let d = 0; d <= D + 1e-6; d += step) seg([X(d), topAt(d), -hw], [X(d), topAt(d), hw]);  // toit
  for (const z of [-hw, hw]) {                      // côtés
    for (let d = 0; d <= D + 1e-6; d += step) seg([X(d), 0, z], [X(d), topAt(d), z]);
    for (let y = 0; y <= H + 1e-6; y += step) {
      const dMax = y <= BH ? D : D * (H - y) / (H - BH);
      seg([X(0), y, z], [X(Math.max(0, dMax)), y, z]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function goal(s) {
  const group = new THREE.Group();
  const { halfL } = PITCH, hw = PITCH.goalWidth / 2, H = PITCH.goalHeight, r = PITCH.postRadius;
  const D = PITCH.goalDepth, BH = PITCH.netBackHeight;
  const white = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
  const frame = [
    new THREE.CylinderGeometry(r, r, H + r, 10).translate(s * halfL, (H + r) / 2, -hw),
    new THREE.CylinderGeometry(r, r, H + r, 10).translate(s * halfL, (H + r) / 2, hw),
    new THREE.CylinderGeometry(r, r, PITCH.goalWidth + 2 * r, 10).rotateX(Math.PI / 2).translate(s * halfL, H, 0),
  ];
  group.add(new THREE.Mesh(merge(frame.map((geometry) => ({ geometry })), false), white));
  // Armature arrière (tubes fins gris)
  const back = [
    new THREE.CylinderGeometry(0.03, 0.03, BH, 6).translate(s * (halfL + D), BH / 2, -hw),
    new THREE.CylinderGeometry(0.03, 0.03, BH, 6).translate(s * (halfL + D), BH / 2, hw),
    new THREE.CylinderGeometry(0.03, 0.03, PITCH.goalWidth, 6).rotateX(Math.PI / 2).translate(s * (halfL + D), BH, 0),
  ];
  group.add(new THREE.Mesh(merge(back.map((geometry) => ({ geometry })), false), new THREE.MeshLambertMaterial({ color: '#B8BEC6' })));
  group.add(new THREE.LineSegments(netGeometry(s), new THREE.LineBasicMaterial({ color: '#E9EDF2', transparent: true, opacity: 0.55 })));
  return group;
}

export function buildPitch(scene) {
  // Herbe autour du terrain, puis le terrain tondu en bandes
  const around = new THREE.Mesh(new THREE.PlaneGeometry(150, 110).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#357A38' }));
  scene.add(around);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PITCH.length + 6, PITCH.width + 6).rotateX(-Math.PI / 2).translate(0, 0.004, 0),
    new THREE.MeshLambertMaterial({ map: grassTexture() }));
  scene.add(pitch);
  scene.add(lines());
  scene.add(goal(-1), goal(1));
}
