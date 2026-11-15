// Commandes du combat : joystick à gauche (il apparaît là où le pouce se pose), quatre boutons à droite
// (Poing, Pied, Garde à maintenir, Lutte). Plusieurs doigts en même temps. Clavier pour tester sur ordinateur :
// flèches ou ZQSD, J = poing, K = pied, L = garde (maintenir), Espace = lutte.
export const BUTTONS = ['punch', 'kick', 'guard', 'grapple'];
const KEYS = { KeyJ: 'punch', KeyK: 'kick', KeyL: 'guard', Space: 'grapple', KeyI: 'grapple' };
const MOVE_KEYS = {
  ArrowLeft: [-1, 0], KeyA: [-1, 0], KeyQ: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
  ArrowUp: [0, 1], KeyW: [0, 1], KeyZ: [0, 1], ArrowDown: [0, -1], KeyS: [0, -1],
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class MmaInput {
  constructor() {
    this.root = document.getElementById('mmaControls');
    this.zone = document.getElementById('mmaStick');
    this.base = document.getElementById('mmaStickBase');
    this.knob = document.getElementById('mmaStickKnob');
    this.move = { x: 0, y: 0 };  // x : droite de l'écran +, y : haut de l'écran +
    this.stick = { x: 0, y: 0 };
    this.stickId = null;
    this.origin = { x: 0, y: 0 };
    this.radius = 56;
    this.btn = {};
    this.els = {};
    this.presses = [];           // appuis à traiter (dans l'ordre), avec la direction du joystick à cet instant
    for (const b of BUTTONS) this.btn[b] = { down: false };
    this.keys = new Set();
    this.bindStick();
    this.bindButtons();
    this.bindKeys();
  }
  bindStick() {
    const z = this.zone;
    z.addEventListener('pointerdown', (e) => {
      if (this.stickId !== null) return;
      e.preventDefault();
      this.stickId = e.pointerId;
      try { z.setPointerCapture(e.pointerId); } catch (err) { /* déjà capturé */ }
      const r = z.getBoundingClientRect(), m = this.radius + 8;
      this.origin.x = clamp(e.clientX, r.left + m, r.right - m);
      this.origin.y = clamp(e.clientY, r.top + m, r.bottom - m);
      this.base.style.left = this.origin.x - r.left + 'px';
      this.base.style.top = this.origin.y - r.top + 'px';
      this.base.classList.add('active');
      this.track(e);
    });
    const move = (e) => { if (e.pointerId === this.stickId) this.track(e); };
    const end = (e) => {
      if (e.pointerId !== this.stickId) return;
      this.stickId = null;
      this.stick.x = this.stick.y = 0;
      this.knob.style.transform = '';
      this.base.classList.remove('active');
      this.base.style.left = this.base.style.top = '';
    };
    z.addEventListener('pointermove', move);
    z.addEventListener('pointerup', end);
    z.addEventListener('pointercancel', end);
    z.addEventListener('lostpointercapture', end);
  }
  track(e) {
    let dx = e.clientX - this.origin.x, dy = e.clientY - this.origin.y;
    const d = Math.hypot(dx, dy);
    if (d > this.radius) {
      dx *= this.radius / d;
      dy *= this.radius / d;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    let m = Math.min(1, d / this.radius);
    m = m < 0.15 ? 0 : (m - 0.15) / 0.85;
    const a = Math.atan2(-dy, dx);
    this.stick.x = Math.cos(a) * m;
    this.stick.y = Math.sin(a) * m;
  }
  bindButtons() {
    for (const el of document.querySelectorAll('#mmaButtons .act')) {
      const b = el.dataset.act, s = this.btn[b];
      this.els[b] = el;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* déjà capturé */ }
        if (s.down) return;
        s.down = true;
        this.presses.push(this.pressOf(b));
        el.classList.add('down');
        if (navigator.vibrate) navigator.vibrate(8);
      });
      const up = () => {
        s.down = false;
        el.classList.remove('down');
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }
  bindKeys() {
    addEventListener('keydown', (e) => {
      if (this.root.hidden) return;
      const b = KEYS[e.code];
      if (b) {
        e.preventDefault();
        if (!this.btn[b].down) {
          this.btn[b].down = true;
          this.presses.push(this.pressOf(b));
        }
      } else if (MOVE_KEYS[e.code]) {
        e.preventDefault();
        this.keys.add(e.code);
      }
    });
    addEventListener('keyup', (e) => {
      const b = KEYS[e.code];
      if (b) this.btn[b].down = false;
      this.keys.delete(e.code);
    });
  }
  // Un appui garde la direction du joystick au moment où le doigt touche le bouton (direct, crochet…)
  pressOf(b) {
    this.poll();
    return { btn: b, x: this.move.x, y: this.move.y };
  }
  // Direction finale (joystick, sinon clavier)
  poll() {
    if (this.stickId !== null) {
      this.move.x = this.stick.x;
      this.move.y = this.stick.y;
      return;
    }
    let x = 0, y = 0;
    for (const k of this.keys) {
      x += MOVE_KEYS[k][0];
      y += MOVE_KEYS[k][1];
    }
    const d = Math.hypot(x, y);
    this.move.x = d ? x / d : 0;
    this.move.y = d ? y / d : 0;
  }
  // Noms des boutons selon la situation (debout, au sol, soumission)
  labels(map) {
    for (const b of BUTTONS) if (map[b] && this.els[b].textContent !== map[b]) this.els[b].textContent = map[b];
  }
  reset() {
    for (const b of BUTTONS) this.btn[b].down = false;
    for (const el of Object.values(this.els)) el.classList.remove('down');
    this.presses.length = 0;
    this.stickId = null;
    this.stick.x = this.stick.y = this.move.x = this.move.y = 0;
    this.knob.style.transform = '';
    this.base.classList.remove('active');
    this.keys.clear();
  }
  show(v) {
    this.root.hidden = !v;
    if (!v) this.reset();
  }
}
