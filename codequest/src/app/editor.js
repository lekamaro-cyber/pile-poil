// Éditeur de code : numéros de ligne, coloration, indentation automatique, Tab pour indenter.
// Échap rend le focus au clavier (puis Tab passe à la suite) ; Ctrl+Entrée lance l'action principale.
(function (App) {
  var h = App.ui.h, HL = window.CQHighlight;

  function indentUnit(lang) { return lang === 'python' ? '    ' : '  '; }

  App.Editor = function (o) {
    var lang = o.lang || 'text';
    var unit = indentUnit(lang);
    var gutter = h('div', { class: 'editor-gutter', 'aria-hidden': 'true' });
    var pre = h('pre', { 'aria-hidden': 'true' });
    var ta = h('textarea', {
      spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off',
      'aria-label': o.label || 'Éditeur de code ' + App.ui.langName(lang), id: o.id || null
    });
    var root = h('div', { class: 'editor' }, h('div', { class: 'editor-inner' }, gutter, h('div', { class: 'editor-code' }, pre, ta)));
    var escaped = false;

    function render() {
      var v = ta.value;
      pre.innerHTML = HL.html(v, lang) + '\n ';
      var n = v.split('\n').length;
      var minLines = o.minLines || 6;
      var nums = [];
      for (var i = 1; i <= Math.max(n, minLines); i++) nums.push(i <= n ? i : '');
      gutter.textContent = nums.join('\n');
      if (n < minLines) pre.innerHTML += new Array(minLines - n + 1).join('\n');
    }
    function insert(text) {
      ta.focus();
      var ok = false;
      try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
      if (!ok) {
        var s = ta.selectionStart;
        ta.setRangeText(text, s, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    }
    function lineStart(v, pos) { return v.lastIndexOf('\n', pos - 1) + 1; }

    ta.addEventListener('input', function () { render(); if (o.onChange) o.onChange(ta.value); });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (o.onSubmit) o.onSubmit(); return; }
      if (e.key === 'Escape') { escaped = true; return; }
      if (e.key === 'Tab') {
        if (escaped) { escaped = false; return; } // laisse Tab sortir de l'éditeur
        e.preventDefault();
        var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
        if (s === en && !e.shiftKey) { insert(unit); return; }
        // Indente ou désindente toutes les lignes sélectionnées.
        var ls = lineStart(v, s);
        var block = v.slice(ls, en);
        var lines = block.split('\n');
        var changed = lines.map(function (l) {
          if (e.shiftKey) return l.indexOf(unit) === 0 ? l.slice(unit.length) : l.replace(/^ {1,4}/, '');
          return unit + l;
        }).join('\n');
        ta.setSelectionRange(ls, en);
        insert(changed);
        ta.setSelectionRange(ls, ls + changed.length);
        return;
      }
      escaped = false;
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        var val = ta.value, pos = ta.selectionStart;
        var cur = val.slice(lineStart(val, pos), pos);
        var ind = (cur.match(/^[ \t]*/) || [''])[0];
        var trimmed = cur.replace(/\s+$/, '');
        if (lang === 'python' && /:$/.test(trimmed)) ind += unit;
        else if (/[{[(]$/.test(trimmed) && lang !== 'python') ind += unit;
        else if (lang === 'python' && /^\s*(return|pass|break|continue|raise)\b/.test(cur)) ind = ind.slice(0, Math.max(0, ind.length - unit.length));
        insert('\n' + ind);
        return;
      }
      if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
        var v2 = ta.value, p2 = ta.selectionStart;
        var before = v2.slice(lineStart(v2, p2), p2);
        if (before.length && /^ +$/.test(before) && before.length % unit.length === 0) {
          e.preventDefault();
          ta.setSelectionRange(p2 - unit.length, p2);
          insert('');
        }
      }
    });

    ta.value = o.value || '';
    render();

    return {
      el: root,
      textarea: ta,
      get value() { return ta.value; },
      set value(v) { ta.value = v; render(); if (o.onChange) o.onChange(v); },
      focus: function () { ta.focus(); },
      setDisabled: function (d) { ta.readOnly = !!d; root.style.opacity = d ? '0.8' : ''; }
    };
  };
})(App);
