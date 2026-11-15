// La salle : la cage à huit côtés (octogone), son tapis, le grillage, les poteaux, les lumières et le public
// dans la pénombre. Tout est inventé (aucun logo réel). Le grillage est une texture transparente : on voit à travers.
import * as THREE from 'three';
import { canvasTexture } from '../engine/geometry.js';

export const CAGE = { radius: 4.6, height: 1.75 };

function matTexture() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    g.fillStyle = '#C9CED6';
    g.fillRect(0, 0, w, h);
    const grad = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(178, 34, 34, 0.75)';
    g.lineWidth = 10;
    g.beginPath();
    g.arc(w / 2, h / 2, 150, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(20, 28, 40, 0.8)';
    g.font = '900 italic 110px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('MMA', w / 2, h / 2 - 10);
    g.font = '800 34px system-ui, sans-serif';
    g.fillText('COMBAT EN CAGE', w / 2, h / 2 + 70);
    g.font = '800 30px system-ui, sans-serif';
    g.fillStyle = 'rgba(20, 28, 40, 0.45)';
    for (const [x, y, r] of [[w / 2, 150, 0], [w / 2, h - 150, Math.PI], [150, h / 2, -Math.PI / 2], [w - 150, h / 2, Math.PI / 2]]) {
      g.save();
      g.translate(x, y);
      g.rotate(r);
      g.fillText('PILE-POIL ARENA', 0, 0);
      g.restore();
    }
  });
}

function fenceTexture() {
  const t = canvasTexture(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = 'rgba(30, 32, 36, 0.9)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, h / 2);
    g.lineTo(w / 2, 0);
    g.lineTo(w, h / 2);
    g.lineTo(w / 2, h);
    g.closePath();
    g.stroke();
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function buildArena(scene, crowdShare = 1) {
  const group = new THREE.Group();
  scene.add(group);
  const R = CAGE.radius, H = CAGE.height;
  const corner = (i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return [Math.cos(a) * R, Math.sin(a) * R];
  };
  // Sol de la salle et estrade
  group.add(new THREE.Mesh(new THREE.CircleGeometry(40, 40).rotateX(-Math.PI / 2).translate(0, -0.6, 0), new THREE.MeshLambertMaterial({ color: '#15181D' })));
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(R + 1.2, R + 1.4, 0.6, 8, 1).rotateY(Math.PI / 8).translate(0, -0.32, 0), new THREE.MeshLambertMaterial({ color: '#23272E' }));
  group.add(stage);
  // Tapis (octogone)
  const shape = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const [x, z] = corner(i);
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  }
  const matGeo = new THREE.ShapeGeometry(shape);
  const uv = matGeo.attributes.uv, pos = matGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (2 * R) + 0.5, pos.getY(i) / (2 * R) + 0.5);
  matGeo.rotateX(-Math.PI / 2).translate(0, 0.002, 0);  // tapis à plat, face vers le haut, texte à l'endroit
  group.add(new THREE.Mesh(matGeo, new THREE.MeshLambertMaterial({ map: matTexture() })));
  // Poteaux, boudins de protection et grillage
  const posts = new THREE.Group();
  const postMat = new THREE.MeshLambertMaterial({ color: '#1C1F24' });
  const padMat = new THREE.MeshLambertMaterial({ color: '#8E1B1B' });
  const fenceMat = new THREE.MeshBasicMaterial({ map: fenceTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false });
  for (let i = 0; i < 8; i++) {
    const [x, z] = corner(i), [x2, z2] = corner(i + 1);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, H + 0.1, 10), postMat);
    post.position.set(x, (H + 0.1) / 2, z);
    posts.add(post);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, H * 0.85, 10), padMat);
    pad.position.set(x, H * 0.47, z);
    posts.add(pad);
    const len = Math.hypot(x2 - x, z2 - z);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(len, H), fenceMat);
    panel.position.set((x + x2) / 2, H / 2 + 0.05, (z + z2) / 2);
    panel.rotation.y = -Math.atan2(z2 - z, x2 - x);
    fenceMat.map.repeat.set(len / 0.12, H / 0.12);
    posts.add(panel);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8).rotateZ(Math.PI / 2), padMat);
    rail.position.set((x + x2) / 2, H + 0.06, (z + z2) / 2);
    rail.rotation.y = -Math.atan2(z2 - z, x2 - x);
    posts.add(rail);
  }
  group.add(posts);
  // Public dans la pénombre, en gradins autour de la cage
  const crowd = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.8, 0.35), new THREE.MeshLambertMaterial({ color: '#FFFFFF' }), 900);
  crowd.frustumCulled = false;
  group.add(crowd);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  const tones = ['#3A4A5C', '#5C3A3A', '#3A5C46', '#5C553A', '#4B3A5C', '#2A2E36', '#6B6B6B'];
  let n = 0;
  for (let row = 0; row < 6; row++) {
    const rad = R + 4 + row * 1.1, y = -0.2 + row * 0.55, count = Math.floor(rad * 2 * Math.PI / 0.62);
    for (let k = 0; k < count && n < 900; k++) {
      if (Math.random() > crowdShare) continue;
      const a = (k / count) * Math.PI * 2 + row * 0.13;
      m.makeRotationY(-a + Math.PI / 2);
      m.setPosition(Math.cos(a) * rad, y + 0.4 + Math.random() * 0.08, Math.sin(a) * rad);
      crowd.setMatrixAt(n, m);
      crowd.setColorAt(n, c.set(tones[Math.floor(Math.random() * tones.length)]).multiplyScalar(0.55 + Math.random() * 0.3));
      n++;
    }
  }
  crowd.count = n;
  crowd.instanceMatrix.needsUpdate = true;
  if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
  // Lumières : la cage est éclairée, la salle reste sombre
  group.add(new THREE.HemisphereLight('#E6EEFF', '#202430', 1.1));
  const key = new THREE.DirectionalLight('#FFF6E8', 1.6);
  key.position.set(3, 12, 5);
  group.add(key);
  const rim = new THREE.DirectionalLight('#9FB8FF', 0.6);
  rim.position.set(-6, 8, -6);
  group.add(rim);
  return { group, setVisible: (v) => { group.visible = v; } };
}
