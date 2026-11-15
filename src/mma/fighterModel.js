// Combattant en 3D : corps articulé en volumes simples (bassin, buste, tête, bras, jambes), couleurs par sommet,
// un seul matériau. Les animations sont des « poses » (angles des articulations) calculées par le combat :
// le bras est tendu au moment exact où le coup touche.
import * as THREE from 'three';
import { merge, boxAt } from '../engine/geometry.js';

let material = null;
const mat = () => material || (material = new THREE.MeshLambertMaterial({ vertexColors: true }));
const piece = (parts) => new THREE.Mesh(merge(parts, true), mat());

// Pose de garde (position de combat, pied gauche devant) : toutes les autres poses partent de celle-ci
export const STANCE = {
  crouch: -0.06, turn: 0.3, lie: 0, roll: 0, lean: 0.1, twist: -0.2, tilt: 0, head: 0.12,
  shLx: -1.0, shLy: 0.15, shLz: -0.25, elL: -1.95,
  shRx: -0.85, shRy: -0.25, shRz: 0.3, elR: -2.2,
  hipLx: -0.3, hipLz: 0.08, kneeL: 0.3, hipRx: 0.28, hipRz: -0.1, kneeR: 0.38,
};
export const POSE_KEYS = Object.keys(STANCE);

export class FighterModel {
  // look : { skin, hair, shorts, gloves } (couleurs) ; scale : gabarit
  constructor(scene, look, scale = 1) {
    const { skin, hair, shorts } = look, gloves = look.gloves || '#151515', trim = look.trim || '#F2F2F2';
    this.root = new THREE.Group();
    this.hips = new THREE.Group();
    this.hips.rotation.order = 'YXZ';
    this.root.add(this.hips);
    this.hips.add(piece([
      { geometry: boxAt(0.37, 0.25, 0.25, 0, -0.03, 0), color: shorts },
      { geometry: boxAt(0.375, 0.05, 0.255, 0, 0.08, 0), color: trim },
    ]));
    this.torso = new THREE.Group();
    this.torso.rotation.order = 'YXZ';
    this.torso.position.y = 0.08;
    this.hips.add(this.torso);
    this.torso.add(piece([
      { geometry: boxAt(0.34, 0.3, 0.21, 0, 0.14, 0), color: skin },
      { geometry: boxAt(0.45, 0.3, 0.25, 0, 0.42, 0), color: skin },
      { geometry: boxAt(0.11, 0.1, 0.11, 0, 0.61, 0), color: skin },
    ]));
    this.headG = new THREE.Group();
    this.headG.position.y = 0.62;
    this.torso.add(this.headG);
    this.headG.add(piece([
      { geometry: new THREE.SphereGeometry(0.118, 12, 9).translate(0, 0.15, 0.01), color: skin },
      { geometry: new THREE.SphereGeometry(0.124, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.45).translate(0, 0.165, -0.01), color: hair },
    ]));
    const arm = (side) => {
      const sh = new THREE.Group();
      sh.rotation.order = 'YXZ';
      sh.position.set(side * 0.27, 0.5, 0);
      sh.add(piece([{ geometry: boxAt(0.12, 0.29, 0.125, 0, -0.13, 0), color: skin }]));
      const el = new THREE.Group();
      el.position.y = -0.28;
      el.add(piece([
        { geometry: boxAt(0.1, 0.2, 0.1, 0, -0.09, 0), color: skin },
        { geometry: boxAt(0.135, 0.14, 0.15, 0, -0.25, 0.005), color: gloves },
        { geometry: boxAt(0.137, 0.03, 0.152, 0, -0.19, 0.005), color: trim },
      ]));
      sh.add(el);
      this.torso.add(sh);
      return [sh, el];
    };
    [this.shL, this.elL] = arm(1);
    [this.shR, this.elR] = arm(-1);
    const leg = (side) => {
      const hip = new THREE.Group();
      hip.rotation.order = 'YXZ';
      hip.position.set(side * 0.1, -0.1, 0);
      hip.add(piece([
        { geometry: boxAt(0.18, 0.2, 0.19, 0, -0.07, 0), color: shorts },
        { geometry: boxAt(0.155, 0.27, 0.165, 0, -0.3, 0), color: skin },
      ]));
      const knee = new THREE.Group();
      knee.position.y = -0.44;
      knee.add(piece([
        { geometry: boxAt(0.125, 0.39, 0.135, 0, -0.2, 0), color: skin },
        { geometry: boxAt(0.11, 0.07, 0.25, 0, -0.43, 0.05), color: skin },
      ]));
      hip.add(knee);
      this.hips.add(hip);
      return [hip, knee];
    };
    [this.hipL, this.kneeL] = leg(1);
    [this.hipR, this.kneeR] = leg(-1);
    this.root.scale.setScalar(scale);
    this.pose = Object.assign({}, STANCE);
    scene.add(this.root);
  }

  // Place le combattant (position au sol, orientation) et applique la pose
  apply(x, z, heading) {
    const p = this.pose;
    this.root.position.set(x, 0, z);
    this.root.rotation.y = heading;
    this.hips.position.y = 0.95 + p.crouch;
    this.hips.rotation.set(p.lie, p.turn, p.roll);
    this.torso.rotation.set(p.lean, p.twist, p.tilt);
    this.headG.rotation.x = p.head;
    this.shL.rotation.set(p.shLx, p.shLy, p.shLz);
    this.shR.rotation.set(p.shRx, p.shRy, p.shRz);
    this.elL.rotation.x = p.elL;
    this.elR.rotation.x = p.elR;
    this.hipL.rotation.set(p.hipLx, 0, p.hipLz);
    this.hipR.rotation.set(p.hipRx, 0, p.hipRz);
    this.kneeL.rotation.x = p.kneeL;
    this.kneeR.rotation.x = p.kneeR;
  }

  // Rapproche la pose actuelle de la pose voulue (k : 0 à 1)
  blend(target, k) {
    const p = this.pose;
    for (const key of POSE_KEYS) p[key] += (target[key] - p[key]) * k;
  }

  // Point du corps en coordonnées du monde (tête, bassin) : sert à la caméra et aux effets
  worldOf(part, out) {
    const g = part === 'head' ? this.headG : this.hips;
    g.updateWorldMatrix(true, false);
    return out.setFromMatrixPosition(g.matrixWorld);
  }

  setVisible(v) {
    this.root.visible = v;
  }
}
