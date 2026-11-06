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
  show(v) {
    this.root.hidden = !v;
    if (!v) $('banner').hidden = true;
  }
}
