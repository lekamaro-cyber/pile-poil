// Chocs du ballon contre les corps des joueurs (mur, gardien). Chaque partie du corps est une « gélule » : un
// segment A-B épaissi d'un rayon r. Le ballon rebondit selon l'angle du choc et la souplesse du corps.
import { BALL } from '../config.js';

const R = BALL.radius;

// Le ballon touche-t-il la gélule ? Renvoie null, ou { nx, ny, nz } (direction du choc, vers le ballon),
// s (0 = point A, 1 = point B) et la profondeur d'enfoncement.
export function capsuleHit(pos, ax, ay, az, bx, by, bz, r) {
  const abx = bx - ax, aby = by - ay, abz = bz - az;
  const L2 = abx * abx + aby * aby + abz * abz;
  let s = L2 > 1e-9 ? ((pos.x - ax) * abx + (pos.y - ay) * aby + (pos.z - az) * abz) / L2 : 0;
  s = Math.max(0, Math.min(1, s));
  const cx = ax + abx * s, cy = ay + aby * s, cz = az + abz * s;
  let nx = pos.x - cx, ny = pos.y - cy, nz = pos.z - cz;
  const d = Math.hypot(nx, ny, nz), min = r + R;
  if (d >= min) return null;
  if (d < 1e-6) {
    nx = -1;
    ny = 0;
    nz = 0;
  } else {
    nx /= d;
    ny /= d;
    nz /= d;
  }
  return { nx, ny, nz, s, depth: min - d, cx, cy, cz };
}

// Rebond : restitution = part de la vitesse « dans le corps » renvoyée ; keep = part de la vitesse le long du
// corps gardée ; spinKeep = rotation gardée. bodyVel : vitesse du corps (un gardien qui plonge pousse le ballon).
export function bounceOff(ball, hit, restitution, keep, spinKeep, bodyVel = null) {
  const p = ball.pos, v = ball.vel;
  p.x += hit.nx * hit.depth;
  p.y += hit.ny * hit.depth;
  p.z += hit.nz * hit.depth;
  const bx = bodyVel ? bodyVel.x : 0, by = bodyVel ? bodyVel.y : 0, bz = bodyVel ? bodyVel.z : 0;
  let rx = v.x - bx, ry = v.y - by, rz = v.z - bz;  // vitesse du ballon vue du corps
  const vn = rx * hit.nx + ry * hit.ny + rz * hit.nz;
  if (vn >= 0) return false;  // il s'éloigne déjà
  const tx = rx - vn * hit.nx, ty = ry - vn * hit.ny, tz = rz - vn * hit.nz;
  rx = tx * keep - vn * restitution * hit.nx;
  ry = ty * keep - vn * restitution * hit.ny;
  rz = tz * keep - vn * restitution * hit.nz;
  v.set(rx + bx, ry + by, rz + bz);
  ball.spin.multiplyScalar(spinKeep);
  if (p.y < R) p.y = R;
  return true;
}
