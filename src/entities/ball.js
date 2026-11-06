// Le ballon : sa position, sa vitesse, qui l'a au pied (owner) et qui l'a touché en dernier (lastTouch).
// Sa physique est dans physics/ballPhysics.js.
import * as THREE from 'three';
import { BALL } from '../config.js';
import { canvasTexture } from '../engine/geometry.js';

function ballTexture() {
  return canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#F7F7F2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1B2A4A';  // panneaux sombres
    const spots = [[32, 22], [96, 22], [160, 22], [224, 22], [0, 64], [64, 64], [128, 64], [192, 64], [256, 64],
      [32, 106], [96, 106], [160, 106], [224, 106]];
    for (const [x, y] of spots) {
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 11);
      }
      g.closePath();
      g.fill();
    }
    g.fillStyle = '#FF7A1A';  // bande orange : la signature du ballon du jeu
    g.fillRect(0, 44, w, 5);
    g.fillRect(0, 79, w, 5);
  });
}

const axis = new THREE.Vector3();
const spin = new THREE.Quaternion();

export class Ball {
  constructor(scene) {
    this.pos = new THREE.Vector3(0, BALL.radius, 0);
    this.vel = new THREE.Vector3();
    this.owner = null;      // joueur qui contrôle le ballon (conduite de balle, ou gardien qui le tient)
    this.held = false;      // true : dans les mains du gardien (le ballon ne roule plus)
    this.lastTouch = null;  // dernier joueur à l'avoir touché (touches, corners, buts)
    this.inGoal = 0;        // -1 ou 1 : le ballon est entré dans ce but (entre les poteaux, sous la barre)
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(BALL.radius, 20, 14), new THREE.MeshLambertMaterial({ map: ballTexture() }));
    scene.add(this.mesh);
  }
  place(x, z) {
    this.pos.set(x, BALL.radius, z);
    this.vel.set(0, 0, 0);
    this.inGoal = 0;
    this.held = false;
  }
  // Dessin : position et rotation du ballon qui roule
  sync(dt) {
    this.mesh.position.copy(this.pos);
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (hs > 0.05) {
      axis.set(this.vel.z, 0, -this.vel.x).normalize();
      spin.setFromAxisAngle(axis, (hs * dt) / BALL.radius);
      this.mesh.quaternion.premultiply(spin);
    }
  }
}
