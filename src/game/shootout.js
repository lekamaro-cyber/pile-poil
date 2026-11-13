// Séance de tirs au but contre l'ordinateur, avec les vraies règles : tirs alternés, 5 chacun, arrêt dès qu'une
// équipe ne peut plus être rattrapée, puis mort subite (un tir chacun jusqu'à ce qu'une seule équipe marque).
// Tu tires pour FC Rivermont ; quand l'ordinateur tire, tu es le gardien.

// Qui a gagné ? kicks[0] et kicks[1] : liste des tirs (true = but). Renvoie 0, 1 ou null (pas encore fini).
export function shootoutWinner(kicks) {
  const [a, b] = kicks, ga = a.filter(Boolean).length, gb = b.filter(Boolean).length;
  if (a.length <= 5 && b.length <= 5) {
    if (ga > gb + (5 - b.length)) return 0;
    if (gb > ga + (5 - a.length)) return 1;
    return null;
  }
  if (a.length === b.length && ga !== gb) return ga > gb ? 0 : 1;  // mort subite
  return null;
}

export class Shootout {
  constructor(sp, ui, settings, hud) {
    this.sp = sp;
    this.ui = ui;
    this.s = settings;
    this.hud = hud;
    this.onEnd = null;  // (gagnant, tirs)
  }
  start() {
    this.kicks = [[], []];
    this.first = Math.random() < 0.5 ? 0 : 1;  // tirage au sort
    this.turn = 0;
    this.over = false;
    this.winner = null;
    this.introT = 1.8;
    this.ui.scoreboard(this.kicks);
    this.hud.banner('Tirs au but', this.first === 0 ? 'Tirage au sort : tu tires en premier' : "Tirage au sort : l'adversaire tire en premier", 1800);
    this.setupKick();
  }
  get team() {
    return (this.first + this.turn) % 2;
  }
  setupKick() {
    this.sp.setup({ kind: 'penalty', shooter: this.team, keeper: true, level: this.s.difficulty });
    this.shown = false;
  }
  onResult(r) {
    this.kicks[this.team].push(r.goal);
    this.turn++;
    this.ui.scoreboard(this.kicks);
    this.winner = shootoutWinner(this.kicks);
  }
  update(dt) {
    if (this.over) return;
    if (this.introT > 0) {
      this.introT -= dt;
      return;
    }
    if (!this.shown) {  // annonce du tir
      this.shown = true;
      const n = this.kicks[this.team].length + 1;
      const sub = n > 5 ? 'Mort subite' : `Tir ${n} sur 5`;
      this.hud.banner(this.team === 0 ? 'À toi de tirer' : "À toi d'arrêter", sub, 1300);
    }
    this.sp.update(dt);
    if (!this.sp.finished) return;
    if (this.winner !== null) {
      this.over = true;
      if (this.onEnd) this.onEnd(this.winner, this.kicks);
      return;
    }
    this.setupKick();
  }
}
