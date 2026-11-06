// Affichage pendant le match : score, noms des équipes, messages (but, touche…), barre de puissance, images/s.
const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.root = $('hud');
    this.bannerTimer = 0;
  }
  setTeams(teams) {
    $('nameHome').textContent = teams[0].def.short;
    $('nameAway').textContent = teams[1].def.short;
    $('chipHome').style.background = teams[0].def.color;
    $('chipAway').style.background = teams[1].def.color;
    this.setScore(teams[0].score, teams[1].score);
  }
  setScore(a, b) {
    $('score').textContent = `${a} - ${b}`;
  }
  banner(title, sub = '', ms = 1500) {
    $('bannerTitle').textContent = title;
    $('bannerSub').textContent = sub;
    const el = $('banner');
    el.hidden = false;
    el.classList.remove('pop');
    void el.offsetWidth;  // relance l'animation
    el.classList.add('pop');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => { el.hidden = true; }, ms);
  }
  // value : 0 à 1, ou null pour cacher la barre
  power(value, label = '') {
    const el = $('power');
    if (value === null || value === undefined) {
      if (!el.hidden) el.hidden = true;
      return;
    }
    el.hidden = false;
    $('powerFill').style.width = Math.round(value * 100) + '%';
    $('powerFill').classList.toggle('max', value > 0.85);
    $('powerLabel').textContent = label;
  }
  fps(value, visible) {
    const el = $('fps');
    el.hidden = !visible;
    if (visible) el.textContent = Math.round(value) + ' i/s';
  }
  // Mini-carte : tout le terrain vu de dessus, les 22 joueurs, le ballon et le joueur que tu diriges
  radar(match, visible) {
    const c = $('radar');
    c.hidden = !visible;
    if (!visible) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = 132, H = 86;
    if (c.width !== W * dpr) {
      c.width = W * dpr;
      c.height = H * dpr;
    }
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const m = 4, sx = (W - 2 * m) / 105, sz = (H - 2 * m) / 68;
    const X = (x) => m + (x + 52.5) * sx, Z = (z) => m + (z + 34) * sz;
    g.fillStyle = 'rgba(20, 70, 40, 0.72)';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.lineWidth = 1;
    g.strokeRect(X(-52.5), Z(-34), 105 * sx, 68 * sz);
    g.beginPath();
    g.moveTo(X(0), Z(-34));
    g.lineTo(X(0), Z(34));
    g.stroke();
    for (const s of [-1, 1]) g.strokeRect(s > 0 ? X(36) : X(-52.5), Z(-20.16), 16.5 * sx, 40.32 * sz);
    for (const team of match.teams) {
      g.fillStyle = team.def.color;
      for (const p of team.players) {
        g.beginPath();
        g.arc(X(p.pos.x), Z(p.pos.z), p.isKeeper ? 2.2 : 2.6, 0, Math.PI * 2);
        g.fill();
      }
    }
    const u = match.controlled;
    if (u) {
      g.strokeStyle = '#FFE45C';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(X(u.pos.x), Z(u.pos.z), 4.2, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = '#FFFFFF';
    g.beginPath();
    g.arc(X(match.ball.pos.x), Z(match.ball.pos.z), 2, 0, Math.PI * 2);
    g.fill();
  }
  show(v) {
    this.root.hidden = !v;
    if (!v) $('banner').hidden = true;
  }
}
