// Outils d'interface : construction d'éléments, mini-markdown, icônes, notifications, fenêtres.
var App = window.App = window.App || {};
(function (App) {
  var HL = window.CQHighlight;

  // h('div', { class: 'card', onclick: fn }, enfant, [enfants], 'texte')
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    if (typeof c === 'string' || typeof c === 'number') { el.appendChild(document.createTextNode(String(c))); return; }
    el.appendChild(c);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // Mini-markdown : `code`, **gras**, paragraphes, listes « - ».
  function inline(s) {
    var parts = String(s).split('`');
    return parts.map(function (p, i) {
      if (i % 2 === 1) return '<code>' + esc(p) + '</code>';
      return esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }).join('');
  }
  function md(text) {
    if (!text) return '';
    var blocks = String(text).replace(/\r\n/g, '\n').split(/\n\s*\n/);
    return blocks.map(function (b) {
      var lines = b.split('\n');
      if (lines.every(function (l) { return /^\s*-\s+/.test(l) || !l.trim(); })) {
        return '<ul>' + lines.filter(function (l) { return l.trim(); }).map(function (l) { return '<li>' + inline(l.replace(/^\s*-\s+/, '')) + '</li>'; }).join('') + '</ul>';
      }
      var out = [], list = null;
      lines.forEach(function (l) {
        if (/^\s*-\s+/.test(l)) { if (!list) { list = []; out.push(list); } list.push(l.replace(/^\s*-\s+/, '')); }
        else { list = null; out.push(l); }
      });
      var html = '', para = [];
      function flush() { if (para.length) { html += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; } }
      out.forEach(function (x) {
        if (Array.isArray(x)) { flush(); html += '<ul>' + x.map(function (li) { return '<li>' + inline(li) + '</li>'; }).join('') + '</ul>'; }
        else para.push(x);
      });
      flush();
      return html;
    }).join('');
  }
  function mdEl(text, cls) { return h('div', { class: 'md' + (cls ? ' ' + cls : ''), html: md(text) }); }

  // ---------- Icônes (traits 24 × 24) ----------
  var P = {
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    path: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
    review: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4.5h-4.5"/><path d="M12 8v4l2.5 2.5"/>',
    practice: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m7.5 9.5 3 2.5-3 2.5M12.5 15h4"/>',
    projects: '<path d="m12 3 8.5 4.5L12 12 3.5 7.5z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>',
    skills: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5 16 12l-4 4.5L8 12z"/>',
    profile: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>',
    more: '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    flame: '<path d="M12 21c3.9 0 6.5-2.6 6.5-6.3 0-3.4-2.3-5.6-3.6-7.6-.4 1.7-1.3 2.8-2.4 3.3.2-2.9-1-5.6-3.4-7.4.1 3-1.6 5-3.1 6.8C4.8 11.2 5.5 13 5.5 14.7 5.5 18.4 8.1 21 12 21z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v3.5M8.5 20.5h7M9.5 20.5c0-2 1-4 2.5-4s2.5 2 2.5 4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.4"/>',
    hint: '<path d="M9 17.5h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4.5h4.5"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    code: '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9a4.8 4.8 0 0 1-.5 9.5z"/>',
    warning: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.5 6 3.5h4l2 4.5 2-4.5h4l-2.5 7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.5 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.5z"/>',
    terminal: '<path d="m5 7.5 4.5 4.5L5 16.5M12 17h7"/>',
    run: '<path d="M7 5.5v13l11-6.5z"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    sparkle: '<path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2z"/>',
    skip: '<path d="M6 5.5 15 12l-9 6.5zM18 5.5v13"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    layers: '<path d="m12 3 8.5 4.5L12 12 3.5 7.5z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/>',
    grad: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z"/><path d="M6.5 11v5c1.4 1.4 3.4 2.2 5.5 2.2s4.1-.8 5.5-2.2v-5M21.5 9v6"/>'
  };
  function icon(name, cls) {
    var span = document.createElement('span');
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + (P[name] || P.info) + '</svg>';
    return span.firstChild;
  }
  function iconHtml(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.info) + '</svg>';
  }

  // ---------- Code ----------
  // Affiche un bloc de code avec numéros de ligne. o.mark : lignes surlignées ; o.notes : lignes cliquables.
  function codeBlock(code, lang, o) {
    o = o || {};
    var lines = HL.lines(code, lang);
    var pre = h('pre', { class: 'code' + (o.cls ? ' ' + o.cls : ''), tabindex: '0', 'aria-label': 'Code ' + langName(lang) });
    lines.forEach(function (l, i) {
      var n = i + 1;
      var row = h('div', { class: 'ln' + (o.mark && o.mark.indexOf(n) !== -1 ? ' hl' : '') + (o.noteLines && o.noteLines.indexOf(n) !== -1 ? ' code-note-line' : ''), dataset: { line: n } });
      row.innerHTML = '<span>' + n + '</span><span>' + (l || ' ') + '</span>';
      pre.appendChild(row);
    });
    return pre;
  }
  var LANG_NAMES = { python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript', html: 'HTML', css: 'CSS', sql: 'SQL', bash: 'Bash', git: 'Terminal', c: 'C', cpp: 'C++', java: 'Java', csharp: 'C#', php: 'PHP', dart: 'Dart', json: 'JSON', text: 'Texte', markdown: 'Markdown' };
  function langName(lang) { return LANG_NAMES[lang] || (lang ? String(lang) : 'Code'); }
  function codeWithHead(code, lang, o) {
    o = o || {};
    return h('div', null,
      h('div', { class: 'code-head' }, h('span', { class: 'code-lang' }, o.label || langName(lang)), o.extra || null),
      codeBlock(code, lang, o));
  }

  // ---------- Notifications et fenêtres ----------
  function toast(o) {
    var box = document.getElementById('toasts');
    var t = h('div', { class: 'toast', role: 'status' },
      h('div', { class: 'badge-icon', style: o.gold ? { background: 'rgba(245,199,106,.14)', color: 'var(--gold)' } : { color: 'var(--accent-strong)', background: 'var(--accent-soft)' } }, icon(o.icon || 'info')),
      h('div', null, h('div', { style: { fontWeight: 650 } }, o.title), o.text ? h('div', { class: 'small muted' }, o.text) : null));
    box.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity 300ms'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, o.ms || 4200);
  }

  var modalStack = [];
  function modal(content, o) {
    o = o || {};
    var root = document.getElementById('modal');
    var prevFocus = document.activeElement;
    var box = h('div', { class: 'modal-box' + (o.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.label || 'Fenêtre' }, content);
    root.replaceChildren(box);
    root.hidden = false;
    function close() {
      root.hidden = true;
      root.replaceChildren();
      document.removeEventListener('keydown', onKey, true);
      modalStack.pop();
      if (o.onClose) o.onClose();
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    }
    function onKey(e) { if (e.key === 'Escape' && o.dismissable !== false) { e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);
    root.onclick = function (e) { if (e.target === root && o.dismissable !== false) close(); };
    modalStack.push(close);
    setTimeout(function () { var f = box.querySelector('[autofocus], button, input, textarea, select'); if (f) f.focus(); }, 30);
    return close;
  }
  // Confirmation intégrée à la page (les boîtes confirm() du navigateur sont bloquées).
  function confirmBox(o) {
    return new Promise(function (resolve) {
      var answered = false;
      var close = modal(h('div', { class: 'stack' },
        h('h2', null, o.title),
        o.text ? mdEl(o.text) : null,
        h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
          h('button', { class: 'btn btn-ghost', onclick: function () { answered = true; close(); resolve(false); } }, o.cancel || 'Annuler'),
          h('button', { class: 'btn ' + (o.danger ? 'btn-danger' : 'btn-primary'), autofocus: true, onclick: function () { answered = true; close(); resolve(true); } }, o.confirm || 'Confirmer'))
      ), { label: o.title, onClose: function () { if (!answered) resolve(false); } });
    });
  }

  // ---------- Formats ----------
  function fmtDuration(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec ? sec + ' s' : '0 min';
    var m = Math.round(sec / 60);
    if (m < 60) return m + ' min';
    var hh = Math.floor(m / 60), mm = m % 60;
    return hh + ' h' + (mm ? ' ' + String(mm).padStart(2, '0') : '');
  }
  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function fmtDay(ts) {
    if (!ts) return '—';
    var d = new Date(ts), now = new Date();
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var diff = Math.round((a - b) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return 'demain';
    if (diff === -1) return 'hier';
    if (diff > 1 && diff < 7) return 'dans ' + diff + ' jours';
    if (diff < -1 && diff > -7) return 'il y a ' + (-diff) + ' jours';
    return 'le ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function plural(n, one, many) { return n + ' ' + (n > 1 ? (many || one + 's') : one); }

  // Copie dans le presse-papiers, avec repli sur la sélection du texte.
  function copyText(text, fallbackEl) {
    try {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { selectEl(fallbackEl); return false; });
    } catch (e) { selectEl(fallbackEl); return Promise.resolve(false); }
  }
  function selectEl(el) {
    if (!el) return;
    try { el.focus(); if (el.select) el.select(); else { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } } catch (e) {}
  }

  App.ui = {
    h: h, esc: esc, md: md, mdEl: mdEl, icon: icon, iconHtml: iconHtml, codeBlock: codeBlock, codeWithHead: codeWithHead,
    langName: langName, toast: toast, modal: modal, confirmBox: confirmBox, fmtDuration: fmtDuration, fmtDay: fmtDay,
    plural: plural, copyText: copyText, closeAllModals: function () { while (modalStack.length) modalStack[modalStack.length - 1](); }
  };
})(App);
