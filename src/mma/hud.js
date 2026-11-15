// Affichage du combat : noms, santé et énergie des deux combattants, round et chrono, messages (sonné, au sol,
// K.-O.…) et jauge de soumission.
const $ = (id) => document.getElementById(id);

export class MmaHud {
  constructor() {
    this.root = $('mmaHud');
    this.bannerTimer = 0;
    this.last = {};
  }
  setNames(a, b) {
    $('nameA').textContent = a;
    $('nameB').textContent = b;
  }
  banner(title, sub = '', ms = 1500) {
    $('mmaBannerTitle').textContent = title;
    $('mmaBannerSub').textContent = sub;
    const el = $('mmaBanner');
    el.hidden = false;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => { el.hidden = true; }, ms);
  }
  set(id, pct) {
    const v = Math.round(Math.max(0, Math.min(100, pct)));
    if (this.last[id] === v) return;
    this.last[id] = v;
    $(id).style.width = v + '%';
  }
  // À chaque image
  update(fight) {
    const [a, b] = fight.f;
    this.set('hpA', a.hp.head);
    this.set('hpB', b.hp.head);
    this.set('stA', a.stamina);
    this.set('stB', b.stamina);
    this.set('bodyA', a.hp.body);
    this.set('bodyB', b.hp.body);
    this.set('legsA', a.hp.legs);
    this.set('legsB', b.hp.legs);
    const t = Math.max(0, Math.ceil(fight.clock));
    const txt = `R${fight.round}/${fight.rounds} · ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    if (this.last.clock !== txt) {
      this.last.clock = txt;
      $('clock').textContent = txt;
    }
    const s = fight.sub, meter = $('subMeter');
    meter.hidden = !s;
    if (s) {
      this.set('subFill', s.m * 100);
      const you = s.att === a;
      $('subText').textContent = you ? 'Soumission : tape LUTTE vite pour serrer !' : 'Soumission ! Tape GARDE ou LUTTE vite pour te dégager !';
    }
  }
  show(v) {
    this.root.hidden = !v;
    if (!v) $('mmaBanner').hidden = true;
  }
}
