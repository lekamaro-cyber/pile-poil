// Entraînement libre : coups francs (position du ballon, mur et gardien au choix) ou penalties, autant de tirs
// que tu veux. Le ballon revient au même endroit après chaque tir.
import { PITCH } from '../config.js';
import { legalSpot } from '../ui/setpieceUi.js';

const GX = PITCH.halfL;

export class Training {
  constructor(sp, ui, settings) {
    this.sp = sp;
    this.ui = ui;
    this.s = settings;
    this.goals = 0;
    this.shots = 0;
  }
  start() {
    this.goals = 0;
    this.shots = 0;
    this.next();
  }
  options() {
    const s = this.s, spot = legalSpot(GX - s.trainDist, s.trainZ);
    return {
      kind: s.trainKind, spot, wall: s.trainWall, keeper: s.trainKeeper !== 'none',
      level: s.trainKeeper === 'none' ? 'normal' : s.trainKeeper, shooter: 0,
    };
  }
  next() {
    this.sp.setup(this.options());
    this.refresh();
  }
  refresh() {
    const o = this.sp.opts;
    const what = o.kind === 'penalty' ? 'Penalty' : `Coup franc · ${Math.round(Math.hypot(GX - o.spot.x, o.spot.z))} m`;
    this.ui.info(`${what} · Buts ${this.goals} / ${this.shots}`);
  }
  onResult(r) {
    this.shots++;
    if (r.goal) this.goals++;
    this.refresh();
  }
  update(dt) {
    this.sp.update(dt);
    if (this.sp.finished) this.next();
  }
}
