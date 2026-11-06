// Commandes tactiles : joystick à gauche (il apparaît là où le pouce se pose), six boutons à droite.
// Plusieurs doigts en même temps (« Pointer Events ») : on peut courir, sprinter et frapper ensemble.
// Le clavier marche aussi, pour tester sur ordinateur (flèches ou ZQSD, Espace = tir, J = passe…).

export const ACTIONS = ['pass', 'shoot', 'cross', 'sprint', 'tackle', 'switch'];
const KEYS = {
  Space: 'shoot', KeyK: 'shoot', KeyJ: 'pass', KeyL: 'cross', ShiftLeft: 'sprint', ShiftRight: 'sprint',
  KeyI: 'tackle', KeyE: 'switch', KeyU: 'switch',
};
const MOVE_KEYS = {
  ArrowLeft: [-1, 0], KeyA: [-1, 0], KeyQ: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
  ArrowUp: [0, 1], KeyW: [0, 1], KeyZ: [0, 1], ArrowDown: [0, -1], KeyS: [0, -1],
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class TouchControls {
  constructor() {
    this.root = document.getElementById('controls');
    this.zone = document.getElementById('stickZone');
    this.base = document.getElementById('stickBase');
    this.knob = document.getElementById('stickKnob');
    this.move = { x: 0, y: 0 };   // x : droite +, y : haut de l'écran +
    this.stick = { x: 0, y: 0 };
    this.stickId = null;
    this.origin = { x: 0, y: 0 };
    this.radius = 58;
    this.btn = {};
    this.els = {};
    for (const a of ACTIONS) this.btn[a] = { down: false, pressed: false, released: false };
    this.keysDown = new Set();
    this.context = {};
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
      const r = z.getBoundingClientRect(), m = this.radius + 10;
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
    const d = Math.hypot(dx, dy), max = this.radius;
    if (d > max) {
      dx *= max / d;
      dy *= max / d;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    let m = Math.min(1, d / max);
    m = m < 0.12 ? 0 : (m - 0.12) / 0.88;  // petite zone morte au centre
    const a = Math.atan2(-dy, dx);
    this.stick.x = Math.cos(a) * m;
    this.stick.y = Math.sin(a) * m;
  }

  bindButtons() {
    for (const el of document.querySelectorAll('#buttons .act')) {
      const a = el.dataset.act, s = this.btn[a];
      this.els[a] = el;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* déjà capturé */ }
        if (s.down) return;
        s.down = true;
        s.pressed = true;
        el.classList.add('down');
        if (navigator.vibrate) navigator.vibrate(8);
      });
      const up = () => {
        if (!s.down) return;
        s.down = false;
        s.released = true;
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
      const a = KEYS[e.code];
      if (a) {
        e.preventDefault();
        const s = this.btn[a];
        if (!s.down) {
          s.down = true;
          s.pressed = true;
        }
      } else if (MOVE_KEYS[e.code]) {
        e.preventDefault();
        this.keysDown.add(e.code);
      }
    });
    addEventListener('keyup', (e) => {
      const a = KEYS[e.code];
      if (a && this.btn[a].down) {
        this.btn[a].down = false;
        this.btn[a].released = true;
      }
      this.keysDown.delete(e.code);
    });
  }

  // À appeler au début de chaque image : direction finale (joystick, sinon clavier)
  poll() {
    if (this.stickId !== null) {
      this.move.x = this.stick.x;
      this.move.y = this.stick.y;
      return;
    }
    let x = 0, y = 0;
    for (const k of this.keysDown) {
      x += MOVE_KEYS[k][0];
      y += MOVE_KEYS[k][1];
    }
    const d = Math.hypot(x, y);
    this.move.x = d ? x / d : 0;
    this.move.y = d ? y / d : 0;
  }
  pressed(a) {
    return this.btn[a].pressed;
  }
  // À appeler à la fin de chaque image : les appuis « juste pressés » ont été lus
  endFrame() {
    for (const a of ACTIONS) {
      this.btn[a].pressed = false;
      this.btn[a].released = false;
    }
  }
  // Boutons grisés quand ils ne servent à rien (passe, tir et centre sans ballon restent utilisables :
  // ils préparent une reprise en une touche si le ballon arrive dans la demi-seconde)
  setContext(c) {
    const off = { tackle: !c.canTackle, switch: !c.canSwitch, pass: !c.hasBall, shoot: !c.hasBall, cross: !c.hasBall };
    for (const a in off) {
      if (this.context[a] === off[a]) continue;
      this.context[a] = off[a];
      this.els[a].classList.toggle('off', off[a]);
    }
  }
  reset() {
    for (const a of ACTIONS) Object.assign(this.btn[a], { down: false, pressed: false, released: false });
    for (const el of Object.values(this.els)) el.classList.remove('down');
    this.stickId = null;
    this.stick.x = this.stick.y = this.move.x = this.move.y = 0;
    this.knob.style.transform = '';
    this.base.classList.remove('active');
    this.base.style.left = this.base.style.top = '';
    this.keysDown.clear();
  }
  show(v) {
    this.root.hidden = !v;
    if (!v) this.reset();
  }
}
