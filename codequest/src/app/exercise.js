// Composants d'exercices : affichage, réponse, correction précise, solution.
// Chaque composant renvoie { el, canCheck(), check() -> Promise<résultat>, reveal() -> élément, lock(), key(e) }.
// résultat : { correct, partial?, body (élément ou null) }
(function (App) {
  var ui = App.ui, h = ui.h;

  function normOut(s) {
    return String(s == null ? '' : s).replace(/\r\n/g, '\n').split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/^\n+|\n+$/g, '');
  }
  App.normOut = normOut;
  function seeded(id) {
    var x = 2166136261;
    for (var i = 0; i < id.length; i++) { x ^= id.charCodeAt(i); x = Math.imul(x, 16777619); }
    return function () { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; };
  }
  function shuffle(arr, id) {
    var r = seeded(id || String(Math.random())), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function inlineMd(s) { return h('span', { class: 'choice-text', html: ui.md(s).replace(/^<p>|<\/p>$/g, '') }); }
  function para(text) { return ui.mdEl(text); }
  function consoleBox(text, cls) { return h('div', { class: 'console' + (cls ? ' ' + cls : '') }, text); }

  // Explications françaises des erreurs les plus fréquentes.
  var ERR_FR = {
    SyntaxError: 'Le code ne peut pas être lu : il manque peut-être « : », une parenthèse, un guillemet, ou un mot est mal placé.',
    IndentationError: 'Le décalage des lignes ne correspond pas à la structure : chaque bloc qui suit « : » doit être décalé (4 espaces), et toutes ses lignes au même niveau.',
    TabError: 'Tabulations et espaces mélangés : utilise uniquement des espaces.',
    NameError: 'Un nom est utilisé alors qu’il n’existe pas (encore) : faute de frappe, variable définie plus bas ou dans une autre fonction, ou guillemets oubliés autour d’un texte.',
    UnboundLocalError: 'Tu lis une variable locale avant de lui avoir donné une valeur dans cette fonction (une affectation dans la fonction la rend locale).',
    TypeError: 'Opération impossible avec ces types (par exemple texte + nombre), ou appel avec un mauvais nombre d’arguments.',
    ValueError: 'Le type est bon mais la valeur ne convient pas (par exemple int("abc")).',
    ZeroDivisionError: 'Division (ou modulo) par zéro.',
    IndexError: 'Position inexistante : les positions vont de 0 à len(...) - 1.',
    KeyError: 'Cette clé n’existe pas dans le dictionnaire. Vérifie avec `in` ou utilise `.get()`.',
    AttributeError: 'Cet objet n’a pas cette méthode ou cet attribut (par exemple append sur une chaîne).',
    RecursionError: 'La fonction s’appelle elle-même sans fin : vérifie le cas de base et que chaque appel s’en rapproche.',
    ModuleNotFoundError: 'Ce module n’est pas disponible dans CodeQuest (les bibliothèques externes comme numpy ou pandas ne sont pas installées ici). Sur ton ordinateur : `pip install nom-du-module`.',
    ImportError: 'Ce nom n’existe pas dans le module importé, ou le module n’est pas disponible ici.',
    FileNotFoundError: 'Ce fichier n’existe pas dans les fichiers de l’exercice. Vérifie le nom exact.',
    EOFError: 'Le programme attend une saisie (`input()`) mais aucune entrée n’est fournie : remplis la zone « Entrées ».',
    LimitError: 'Le programme tourne trop longtemps : boucle infinie probable (la condition du while devient-elle fausse un jour ?).',
    TimeoutError: 'Le programme tourne trop longtemps : boucle infinie probable.',
    AssertionError: 'Une vérification (`assert`) est fausse.',
    ReferenceError: 'Variable ou fonction inconnue à cet endroit : faute de frappe, ou déclarée plus loin avec let/const.',
    RangeError: 'Valeur hors limites (par exemple une récursion sans fin ou une longueur de tableau invalide).'
  };
  App.errorHelp = function (type) { return ERR_FR[type] || ''; };
  function errorBox(err) {
    if (!err) return null;
    var type = err.type || err.name || 'Error';
    var line = err.line ? 'Ligne ' + err.line + ' · ' : '';
    var help = ERR_FR[type];
    return h('div', { class: 'stack', style: { gap: '6px' } },
      h('div', { class: 'console' }, h('span', { class: 'err' }, line + type + ': ' + (err.message || ''))),
      help ? h('p', { class: 'small muted', html: ui.md(help).replace(/^<p>|<\/p>$/g, '') }) : null);
  }
  App.errorBox = errorBox;

  // ---------- QCM ----------
  function qcm(ex, ctx) {
    var sel = null, locked = false;
    var order = ex.choices.map(function (_, i) { return i; });
    var buttons = order.map(function (i, k) {
      var b = h('button', { class: 'choice', type: 'button', 'aria-pressed': 'false', onclick: function () { pick(i); } },
        h('span', { class: 'key' }, String(k + 1)), inlineMd(ex.choices[i]));
      b.dataset.i = i;
      return b;
    });
    function pick(i) {
      if (locked) return;
      sel = i;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); b.classList.remove('wrong'); });
      ctx.onChange();
    }
    var el = h('div', { class: 'stack' }, ex.code ? ui.codeWithHead(ex.code, ex.lang) : null, h('div', { class: 'choices', role: 'group', 'aria-label': 'Choix' }, buttons));
    return {
      el: el,
      canCheck: function () { return sel !== null; },
      check: function () {
        var ok = sel === ex.answer;
        buttons.forEach(function (b) { if (+b.dataset.i === sel) b.classList.add(ok ? 'correct' : 'wrong'); });
        return Promise.resolve({ correct: ok, body: ok ? null : (ex.why && ex.why[sel] ? para(ex.why[sel]) : null) });
      },
      reveal: function () {
        buttons.forEach(function (b) { if (+b.dataset.i === ex.answer) b.classList.add('correct'); });
        return h('div', null, h('p', null, h('strong', null, 'Bonne réponse : '), inlineMd(ex.choices[ex.answer])));
      },
      lock: function () { locked = true; buttons.forEach(function (b) { b.disabled = true; }); },
      unlock: function () { locked = false; buttons.forEach(function (b) { b.disabled = false; b.classList.remove('wrong', 'correct'); }); },
      key: function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= buttons.length && !locked) { pick(+buttons[n - 1].dataset.i); return true; } return false; }
    };
  }

  // ---------- Prédire la sortie ----------
  function predict(ex, ctx) {
    var multi = ex.answer.indexOf('\n') !== -1;
    var input = multi
      ? h('textarea', { class: 'textarea', rows: String(ex.answer.split('\n').length + 1), spellcheck: 'false', autocapitalize: 'off', 'aria-label': 'Sortie prévue', placeholder: 'Écris la sortie exacte, une ligne par ligne affichée', oninput: function () { ctx.onChange(); } })
      : h('input', { class: 'input mono', type: 'text', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Sortie prévue', placeholder: 'Sortie exacte', oninput: function () { ctx.onChange(); }, onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); ctx.submit(); } } });
    var label = ex.lang === 'sql' ? 'Valeur renvoyée par la requête' : 'Ce qui s’affiche';
    var el = h('div', { class: 'stack' },
      ui.codeWithHead(ex.code, ex.lang),
      ex.run === false ? h('div', { class: 'honest' }, ui.icon('info'), 'Code non exécuté dans CodeQuest : la sortie attendue a été vérifiée avec le vrai ' + ui.langName(ex.lang) + '.') : null,
      h('div', { class: 'field' }, h('label', { class: 'label' }, label), input));
    function matches(v) {
      var n = normOut(v);
      return [ex.answer].concat(ex.accept || []).some(function (a) { return normOut(a) === n; });
    }
    return {
      el: el,
      canCheck: function () { return input.value.trim().length > 0; },
      check: function () {
        var v = input.value;
        if (matches(v)) return Promise.resolve({ correct: true });
        var n = normOut(v), body = null;
        var m = (ex.mistakes || []).filter(function (x) { return normOut(x.answer) === n; })[0];
        if (m) body = para(m.why);
        else if (normOut(v.replace(/['"]/g, '')) === normOut(ex.answer.replace(/['"]/g, ''))) body = para('Presque : attention aux guillemets. Une fonction d’affichage montre le texte sans les guillemets, sauf quand la valeur est dans une liste ou un dictionnaire.');
        else if (n.toLowerCase() === normOut(ex.answer).toLowerCase()) body = para('Presque : attention aux majuscules et minuscules.');
        else if (n.replace(/\s+/g, '') === normOut(ex.answer).replace(/\s+/g, '')) body = para('Les bonnes valeurs, mais pas la bonne mise en forme : vérifie les espaces et les retours à la ligne.');
        else if (n.split('\n').length !== normOut(ex.answer).split('\n').length) body = para('Le nombre de lignes affichées n’est pas le bon : compte combien de fois l’affichage est exécuté.');
        else body = para('Ce n’est pas la sortie exacte. Suis le code ligne par ligne en notant la valeur de chaque variable.');
        return Promise.resolve({ correct: false, body: body });
      },
      reveal: function () { return h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'label' }, 'Sortie exacte'), consoleBox(ex.answer)); },
      lock: function () { input.readOnly = true; },
      unlock: function () { input.readOnly = false; },
      focus: function () { input.focus(); }
    };
  }

  // ---------- Code à trous ----------
  function fill(ex, ctx) {
    var segs = ex.code.split('___');
    var html = segs.map(function (s) { return window.CQHighlight.html(s, ex.lang); });
    var joined = '';
    html.forEach(function (s, i) { joined += s; if (i < html.length - 1) joined += '<span data-blank="' + i + '"></span>'; });
    var pre = h('pre', { class: 'code fill-code' });
    joined.split('\n').forEach(function (l, i) { pre.insertAdjacentHTML('beforeend', '<div class="ln"><span>' + (i + 1) + '</span><span>' + (l || ' ') + '</span></div>'); });
    var inputs = ex.blanks.map(function (b, i) {
      var inp;
      if (b.options) {
        inp = h('select', { class: 'blank-input', 'aria-label': 'Trou ' + (i + 1), onchange: function () { ctx.onChange(); } },
          h('option', { value: '' }, '…'),
          shuffle(b.options, ex.id + i).map(function (o) { return h('option', { value: o }, o); }));
      } else {
        var w = Math.max(4, Math.max.apply(null, b.answers.map(function (a) { return a.length; })) + 2);
        inp = h('input', { class: 'blank-input', type: 'text', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Trou ' + (i + 1), style: { width: w + 'ch' }, oninput: function () { ctx.onChange(); }, onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); ctx.submit(); } } });
      }
      var ph = pre.querySelector('[data-blank="' + i + '"]');
      if (ph) ph.replaceWith(inp);
      return inp;
    });
    var el = h('div', { class: 'stack' }, h('div', { class: 'code-head' }, h('span', { class: 'code-lang' }, ui.langName(ex.lang) + ' · ' + ui.plural(inputs.length, 'trou'))), pre);
    function same(v, a) {
      var x = v.trim(), y = a.trim();
      return x === y || x.replace(/\s+/g, '') === y.replace(/\s+/g, '');
    }
    return {
      el: el,
      canCheck: function () { return inputs.every(function (i) { return i.value.trim() !== ''; }); },
      check: function () {
        var wrong = [], notes = [];
        inputs.forEach(function (inp, i) {
          var b = ex.blanks[i];
          var ok = b.answers.some(function (a) { return same(inp.value, a); });
          inp.classList.toggle('ok', ok); inp.classList.toggle('ko', !ok);
          if (!ok) {
            wrong.push(i);
            var why = b.why && (b.why[inp.value.trim()] || b.why[inp.value]);
            notes.push((inputs.length > 1 ? '**Trou ' + (i + 1) + '** : ' : '') + (why || 'pas encore la bonne valeur.'));
          }
        });
        return Promise.resolve({ correct: !wrong.length, body: wrong.length ? para(notes.join('\n\n')) : null });
      },
      reveal: function () {
        inputs.forEach(function (inp, i) {
          var a = ex.blanks[i].answers[0];
          if (inp.tagName === 'SELECT') inp.value = a; else inp.value = a;
          inp.classList.add('ok'); inp.classList.remove('ko');
        });
        var full = ex.code; ex.blanks.forEach(function (b) { full = full.replace('___', b.answers[0]); });
        return h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'label' }, 'Code complet'), ui.codeBlock(full, ex.lang));
      },
      lock: function () { inputs.forEach(function (i) { i.disabled = true; }); },
      unlock: function () { inputs.forEach(function (i) { i.disabled = false; i.classList.remove('ko'); }); },
      focus: function () { if (inputs[0]) inputs[0].focus(); }
    };
  }

  // ---------- Remettre dans l'ordre ----------
  function order(ex, ctx) {
    var idx = ex.lines.map(function (_, i) { return i; });
    var pool = shuffle(idx, ex.id);
    var tries = 0;
    while (pool.every(function (v, i) { return v === i; }) && tries++ < 5) pool = shuffle(idx, ex.id + tries);
    var answer = [], locked = false, marks = null;
    var built = h('div', { class: 'order-zone', role: 'list', 'aria-label': 'Ton programme' });
    var avail = h('div', { class: 'order-zone', role: 'list', 'aria-label': 'Lignes disponibles' });
    function lineBtn(i, inAnswer, pos) {
      var cls = 'order-line' + (marks && inAnswer ? (marks[pos] ? ' ok' : ' ko') : '');
      return h('button', { class: cls, type: 'button', role: 'listitem', disabled: locked, 'aria-label': (inAnswer ? 'Retirer : ' : 'Ajouter : ') + ex.lines[i].trim(), onclick: function () {
        if (locked) return;
        marks = null;
        if (inAnswer) { answer.splice(pos, 1); pool.push(i); } else { pool.splice(pool.indexOf(i), 1); answer.push(i); }
        render(); ctx.onChange();
      } }, h('span', { class: 'idx' }, inAnswer ? String(pos + 1) : '+'), ex.lines[i]);
    }
    function render() {
      built.replaceChildren.apply(built, answer.length ? answer.map(function (i, p) { return lineBtn(i, true, p); }) : [h('p', { class: 'small faint', style: { padding: '8px' } }, 'Touche les lignes ci-dessous dans l’ordre d’exécution.')]);
      avail.replaceChildren.apply(avail, pool.length ? pool.map(function (i) { return lineBtn(i, false); }) : [h('p', { class: 'small faint', style: { padding: '8px' } }, 'Toutes les lignes sont placées.')]);
    }
    render();
    var el = h('div', { class: 'stack' },
      h('div', { class: 'label' }, 'Ton programme (' + ui.langName(ex.lang) + ')'), built,
      h('div', { class: 'label' }, 'Lignes disponibles'), avail);
    return {
      el: el,
      canCheck: function () { return answer.length === ex.lines.length; },
      check: function () {
        marks = answer.map(function (v, i) { return ex.lines[v] === ex.lines[i]; });
        var good = marks.filter(Boolean).length;
        render();
        var ok = good === ex.lines.length;
        return Promise.resolve({ correct: ok, body: ok ? null : para(good + ' ligne' + (good > 1 ? 's' : '') + ' sur ' + ex.lines.length + ' à la bonne place (en vert). Touche une ligne pour la retirer, puis replace-la.') });
      },
      reveal: function () {
        answer = idx.slice(); pool = []; marks = answer.map(function () { return true; }); locked = true; render();
        return h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'label' }, 'Ordre correct'), ui.codeBlock(ex.lines.join('\n'), ex.lang));
      },
      lock: function () { locked = true; render(); },
      unlock: function () { locked = false; render(); }
    };
  }

  // ---------- Trouver le bug ----------
  function bug(ex, ctx) {
    var stage = 1, sel = null, fix = null, locked = false;
    var lines = window.CQHighlight.lines(ex.code, ex.lang);
    var codeEl = h('div', { class: 'code bug-code', role: 'group', 'aria-label': 'Code : choisis la ligne fautive' });
    var rows = lines.map(function (l, i) {
      var b = h('button', { class: 'ln', type: 'button', 'aria-label': 'Ligne ' + (i + 1), onclick: function () {
        if (locked || stage !== 1) return;
        sel = i + 1;
        rows.forEach(function (r, k) { r.classList.toggle('sel', k === i); });
        ctx.onChange();
      } });
      b.innerHTML = '<span>' + (i + 1) + '</span><span>' + (l || ' ') + '</span>';
      codeEl.appendChild(b);
      return b;
    });
    var fixBox = h('div', { class: 'stack', hidden: true });
    var fixButtons = ex.fixes.map(function (f, i) {
      return h('button', { class: 'choice', type: 'button', 'aria-pressed': 'false', onclick: function () {
        if (locked) return;
        fix = i;
        fixButtons.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); b.classList.remove('wrong'); });
        ctx.onChange();
      } }, h('span', { class: 'key' }, String(i + 1)), h('code', { class: 'choice-text', style: { whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' } }, f.trim()));
    });
    fixBox.append(h('div', { class: 'label' }, 'Quelle correction pour la ligne ' + ex.bugLine + ' ?'), h('div', { class: 'choices' }, fixButtons));
    var el = h('div', { class: 'stack' }, h('div', { class: 'code-head' }, h('span', { class: 'code-lang' }, ui.langName(ex.lang) + ' · touche la ligne fautive')), codeEl, fixBox);
    function showFixed() {
      rows.forEach(function (r, k) { r.classList.remove('sel'); if (k === ex.bugLine - 1) r.classList.add('fixed'); });
      var b = rows[ex.bugLine - 1];
      b.innerHTML = '<span>' + ex.bugLine + '</span><span>' + window.CQHighlight.html(ex.fixes[ex.fixAnswer], ex.lang) + '</span>';
    }
    return {
      el: el,
      canCheck: function () { return stage === 1 ? sel !== null : fix !== null; },
      check: function () {
        if (stage === 1) {
          if (sel === ex.bugLine) {
            stage = 2; fixBox.hidden = false;
            rows[sel - 1].classList.add('sel');
            setTimeout(function () { fixButtons[0].focus(); }, 30);
            return Promise.resolve({ correct: false, partial: true, body: para('Bien vu : l’erreur est à la **ligne ' + ex.bugLine + '**. Choisis maintenant la correction.') });
          }
          rows[sel - 1].classList.remove('sel');
          return Promise.resolve({ correct: false, body: para('La ligne ' + sel + ' fait bien ce qu’elle doit. Relis l’énoncé : quel résultat est attendu, et à quel endroit le programme s’en écarte ?') });
        }
        var ok = fix === ex.fixAnswer;
        if (ok) showFixed(); else fixButtons[fix].classList.add('wrong');
        return Promise.resolve({ correct: ok, body: ok ? para(ex.why) : para((ex.fixWhy && ex.fixWhy[fix]) || 'Cette correction ne règle pas le problème.') });
      },
      reveal: function () {
        stage = 2; fixBox.hidden = false; showFixed();
        fixButtons.forEach(function (b, k) { if (k === ex.fixAnswer) b.classList.add('correct'); });
        return h('div', { class: 'stack', style: { gap: '6px' } }, para('**Ligne ' + ex.bugLine + '** : ' + ex.why), h('div', { class: 'label' }, 'Correction'), ui.codeBlock(ex.fixes[ex.fixAnswer].trim(), ex.lang));
      },
      lock: function () { locked = true; },
      unlock: function () { locked = false; fixButtons.forEach(function (b) { b.classList.remove('wrong'); }); },
      stage: function () { return stage; }
    };
  }

  // ---------- Logique ----------
  function logic(ex, ctx) {
    var input = h('input', { class: 'input mono', type: 'text', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Ta réponse', placeholder: 'Ta réponse', oninput: function () { ctx.onChange(); }, onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); ctx.submit(); } } });
    function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.。]$/, '').replace(/(\d)\s+(?=\d)/g, '$1').replace(',', '.'); }
    function eq(a, b) {
      var x = norm(a), y = norm(b);
      if (x === y) return true;
      var nx = Number(x), ny = Number(y);
      return x !== '' && !isNaN(nx) && !isNaN(ny) && Math.abs(nx - ny) < 1e-9;
    }
    var el = h('div', { class: 'stack' }, ex.code ? ui.codeWithHead(ex.code, ex.lang === 'text' ? 'text' : ex.lang, { label: ex.lang === 'text' ? 'Énoncé' : null }) : null, h('div', { class: 'field' }, h('label', { class: 'label' }, 'Ta réponse'), input));
    return {
      el: el,
      canCheck: function () { return input.value.trim() !== ''; },
      check: function () {
        var ok = [String(ex.answer)].concat(ex.accept || []).some(function (a) { return eq(input.value, a); });
        if (ok) return Promise.resolve({ correct: true });
        var m = (ex.mistakes || []).filter(function (x) { return eq(input.value, x.answer); })[0];
        return Promise.resolve({ correct: false, body: m ? para(m.why) : para('Pas encore. Reprends le raisonnement étape par étape, sur un petit exemple.') });
      },
      reveal: function () { return h('p', null, h('strong', null, 'Réponse : '), h('code', { class: 'inline-code' }, String(ex.answer))); },
      lock: function () { input.readOnly = true; },
      unlock: function () { input.readOnly = false; },
      focus: function () { input.focus(); }
    };
  }

  // ---------- Écrire du code (tests réellement exécutés) ----------
  function sqlTable(r) {
    if (!r) return null;
    if (r.error) return h('div', { class: 'console' }, h('span', { class: 'err' }, r.error));
    if (!r.columns || !r.columns.length) return h('div', { class: 'console sys' }, 'Requête exécutée. Aucun résultat à afficher.');
    var max = 50;
    return h('div', { style: { overflowX: 'auto' } }, h('table', { class: 'sql-table' },
      h('thead', null, h('tr', null, r.columns.map(function (c) { return h('th', null, c); }))),
      h('tbody', null, r.values.slice(0, max).map(function (row) { return h('tr', null, row.map(function (v) { return h('td', { class: v === null ? 'faint' : '' }, v === null ? 'NULL' : String(v)); })); }))),
      r.values.length > max ? h('p', { class: 'tiny muted' }, (r.values.length - max) + ' lignes de plus non affichées.') : null,
      h('p', { class: 'tiny muted' }, ui.plural(r.values.length, 'ligne')));
  }
  App.sqlTable = sqlTable;
  function testsList(items) {
    return h('ul', { class: 'tests' }, items.map(function (t) {
      return h('li', { class: t.ok ? 'ok' : 'ko' }, ui.icon(t.ok ? 'check' : 'x'), h('span', null, t.label, t.detail ? h('span', { class: 'detail' }, t.detail) : null));
    }));
  }
  function engineNote(ex) {
    var map = {
      python: 'Exécuté par MiniPy, un interpréteur d’un sous-ensemble de Python 3, dans ton navigateur.',
      javascript: ex.dom ? 'Exécuté dans une page isolée de l’appli (bac à sable).' : 'Exécuté dans un Worker isolé : pas d’accès à la page ni à tes données.',
      html: 'Rendu par ton navigateur dans un cadre sans script, puis vérifié sur la page rendue.',
      sql: 'Exécuté par SQLite (sql.js) sur une copie neuve de la base.'
    };
    return h('div', { class: 'honest' }, ui.icon('info'), map[ex.lang] || '');
  }

  function code(ex, ctx) {
    var draftId = ctx.draftKey === false ? null : 'ex:' + ex.id;
    var initial = (draftId && App.drafts.get(draftId)) || ex.starter;
    var needsStdin = ex.lang === 'python' && /input\s*\(/.test(ex.starter + '\n' + ex.solution);
    var stdinBox = needsStdin ? h('textarea', { class: 'textarea', rows: '3', 'aria-label': 'Entrées pour input()', placeholder: 'Une réponse par ligne', spellcheck: 'false' }) : null;
    if (stdinBox) stdinBox.value = ex.stdin || '';
    var out = h('div', { class: 'stack', style: { gap: '10px' } });
    var preview = null, previewTimer = null;
    var editor = App.Editor({
      lang: ex.lang, value: initial, minLines: Math.min(14, Math.max(6, initial.split('\n').length + 1)),
      onChange: function (v) {
        if (draftId) App.drafts.set(draftId, v);
        ctx.onChange();
        if (preview) { clearTimeout(previewTimer); previewTimer = setTimeout(function () { App.CQRunSafe(function () { window.CQRun.htmlPreview(preview, editor.value); }); }, 350); }
      },
      onSubmit: function () { ctx.submit(); }
    });
    if (ex.lang === 'html') {
      preview = h('iframe', { class: 'preview', title: 'Aperçu de ta page' });
      setTimeout(function () { window.CQRun.htmlPreview(preview, editor.value); }, 0);
    }
    var domMount = ex.dom ? h('div') : null;
    var running = false;
    function setOut(nodes) { out.replaceChildren.apply(out, nodes.filter(Boolean)); }

    function run() {
      if (running) return;
      running = true;
      runBtn.disabled = true;
      setOut([h('div', { class: 'console sys' }, h('span', { class: 'loading' }), ' Exécution…')]);
      var p;
      var R = window.CQRun;
      if (ex.lang === 'python') {
        p = R.python(editor.value, { stdin: stdinBox ? stdinBox.value : ex.stdin, files: ex.files }).then(function (r) {
          setOut([h('div', { class: 'label' }, 'Sortie'), consoleBox(r.stdout || (r.error ? '' : '(rien n’a été affiché)'), r.stdout ? '' : 'sys'), errorBox(r.error)]);
        });
      } else if (ex.lang === 'javascript' && ex.dom) {
        p = R.dom(ex.html, editor.value, { mount: domMount }).then(function (r) {
          setOut([h('div', { class: 'label' }, 'Ta page'), domMount, r.stdout ? consoleBox(r.stdout) : null, errorBox(r.error)]);
        });
      } else if (ex.lang === 'javascript') {
        p = R.javascript(editor.value, {}).then(function (r) {
          setOut([h('div', { class: 'label' }, 'Console'), consoleBox(r.stdout || (r.error ? '' : '(rien n’a été affiché)'), r.stdout ? '' : 'sys'), errorBox(r.error)]);
        });
      } else if (ex.lang === 'sql') {
        p = R.sqlRun(ex.setup || window.CQ.datasets[ex.db], editor.value).then(function (r) {
          setOut([h('div', { class: 'label' }, 'Résultat'), sqlTable(r)]);
        }, function () { setOut([sqlUnavailable()]); });
      } else if (ex.lang === 'html') {
        R.htmlPreview(preview, editor.value);
        p = Promise.resolve();
        setOut([]);
      }
      return Promise.resolve(p).catch(function (e) { setOut([consoleBox(String(e && e.message || e), 'err')]); }).then(function () { running = false; runBtn.disabled = false; });
    }
    function sqlUnavailable() {
      return h('div', { class: 'notice warn' }, ui.icon('warning'), h('div', null, 'Le moteur SQLite n’a pas pu être chargé (pas de connexion au CDN ou chargement bloqué). Les exercices SQL à exécuter sont indisponibles pour le moment ; les autres exercices fonctionnent.'));
    }

    var runBtn = h('button', { class: 'btn btn-sm', type: 'button', onclick: run }, ui.icon('run'), ex.lang === 'html' ? 'Actualiser l’aperçu' : 'Exécuter');
    var resetBtn = h('button', { class: 'btn btn-sm btn-ghost', type: 'button', onclick: function () {
      editor.value = ex.starter; if (draftId) App.drafts.clear(draftId); setOut([]); editor.focus();
    } }, ui.icon('reset'), 'Réinitialiser');
    var extraTools = ctx.tools || null;

    var filesInfo = null;
    if (ex.files && Object.keys(ex.files).length) {
      filesInfo = h('details', { class: 'small' }, h('summary', { class: 'muted', style: { cursor: 'pointer' } }, 'Fichiers de l’exercice : ' + Object.keys(ex.files).join(', ')),
        Object.keys(ex.files).map(function (name) { return h('div', { style: { marginTop: '8px' } }, h('div', { class: 'code-lang' }, name), h('div', { class: 'console' }, ex.files[name])); }));
    }
    var dbInfo = null;
    if (ex.lang === 'sql') {
      dbInfo = h('details', { class: 'small' }, h('summary', { class: 'muted', style: { cursor: 'pointer' } }, 'Voir la structure de la base' + (ex.db ? ' « ' + ex.db + ' »' : '')),
        ui.codeBlock(schemaOf(ex.setup || window.CQ.datasets[ex.db] || ''), 'sql'));
    }

    var el = h('div', { class: 'stack' },
      editor.el,
      h('div', { class: 'editor-tools' }, runBtn, resetBtn, extraTools, h('span', { class: 'spacer' }), h('span', { class: 'editor-help' }, 'Tab : indenter · Échap puis Tab : sortir · Ctrl+Entrée : vérifier')),
      stdinBox ? h('div', { class: 'field' }, h('label', { class: 'label' }, 'Entrées (une par ligne, lues par input())'), stdinBox) : null,
      filesInfo, dbInfo,
      preview ? h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'label' }, 'Aperçu'), preview) : null,
      out,
      engineNote(ex));

    function runChecks(src) {
      return (ex.checks && ex.lang !== 'html' ? ex.checks : []).map(function (c) {
        var hit = new RegExp(c.re, c.flags || 'm').test(src);
        return { label: c.label, ok: c.not ? !hit : hit };
      });
    }

    return {
      el: el,
      editor: editor,
      canCheck: function () { return editor.value.trim() !== '' && !running; },
      check: function () {
        var R = window.CQRun, src = editor.value;
        running = true;
        setOut([h('div', { class: 'console sys' }, h('span', { class: 'loading' }), ' Vérification…')]);
        var done = function (x) { running = false; return x; };
        if (ex.lang === 'python' || ex.lang === 'javascript') {
          var tests = ex.tests || [];
          var p = ex.lang === 'python'
            ? R.python(src, { tests: tests, stdin: stdinBox ? stdinBox.value : ex.stdin, files: ex.files })
            : ex.dom ? R.dom(ex.html, src, { tests: tests }) : R.javascript(src, { tests: tests });
          return p.then(function (r) {
            if (r.unavailable) {
              setOut([h('div', { class: 'notice warn' }, ui.icon('warning'), h('div', null, r.error.message))]);
              return done({ correct: false, unavailable: true, body: para('L’exécution n’est pas disponible ici : cet exercice ne peut pas être vérifié. Tu peux le passer sans pénalité.') });
            }
            var items = tests.map(function (t, i) {
              var res = r.tests && r.tests[i];
              return { label: t.label, ok: !!(res && res.ok), detail: res && !res.ok && res.message ? res.message : (!res && r.error ? 'non exécuté (erreur avant les tests)' : '') };
            });
            if (ex.expectOutput != null) {
              var okOut = !r.error && normOut(r.stdout) === normOut(ex.expectOutput);
              items.push({ label: 'La sortie est exactement celle attendue', ok: okOut, detail: okOut ? '' : 'Attendu :\n' + ex.expectOutput });
            }
            items = items.concat(runChecks(src));
            var correct = !r.error && items.every(function (x) { return x.ok; });
            setOut([
              ex.dom ? null : h('div', { class: 'label' }, ex.lang === 'python' ? 'Sortie' : 'Console'),
              ex.dom ? null : consoleBox(r.stdout || '(rien n’a été affiché)', r.stdout ? '' : 'sys'),
              errorBox(r.error),
              items.length ? h('div', { class: 'label' }, 'Tests') : null,
              items.length ? testsList(items) : null
            ]);
            var passed = items.filter(function (x) { return x.ok; }).length;
            var body = correct ? null : para(r.error ? 'Ton programme s’arrête sur une erreur avant la fin : corrige-la d’abord (détails sous l’éditeur).' : passed + ' test' + (passed > 1 ? 's' : '') + ' réussi' + (passed > 1 ? 's' : '') + ' sur ' + items.length + '. Regarde le détail des tests sous l’éditeur.');
            return done({ correct: correct, body: body, code: src });
          });
        }
        if (ex.lang === 'html') {
          R.htmlPreview(preview, src);
          return R.htmlChecks(src, ex.checks).then(function (res) {
            var correct = res.every(function (x) { return x.ok; });
            setOut([h('div', { class: 'label' }, 'Vérifications'), testsList(res)]);
            var passed = res.filter(function (x) { return x.ok; }).length;
            return done({ correct: correct, body: correct ? null : para(passed + ' vérification' + (passed > 1 ? 's' : '') + ' sur ' + res.length + ' réussie' + (passed > 1 ? 's' : '') + '. Le détail est sous l’aperçu.'), code: src });
          });
        }
        if (ex.lang === 'sql') {
          var setup = ex.setup || window.CQ.datasets[ex.db];
          return R.sqlCompare(setup, src, ex.solution, { ordered: ex.ordered, verify: ex.verify }).then(function (r) {
            if (r.error) { setOut([h('div', { class: 'label' }, 'Résultat'), sqlTable({ error: r.error })]); return done({ correct: false, body: para('SQLite signale une erreur : lis le message sous l’éditeur (mot-clé mal placé, nom de colonne ou de table inexact, guillemet oublié…).') }); }
            setOut([h('div', { class: 'label' }, ex.verify ? 'Contenu de la table après ta requête' : 'Ton résultat'), sqlTable(r.got)]);
            return done({ correct: r.ok, body: r.ok ? null : para(r.why + ' Compare avec ce que demande l’énoncé.'), code: src });
          }, function () {
            setOut([sqlUnavailable()]);
            return done({ correct: false, unavailable: true, body: para('Le moteur SQL n’est pas disponible : cet exercice ne peut pas être vérifié pour le moment. Tu peux le passer sans pénalité.') });
          });
        }
        return Promise.resolve(done({ correct: false }));
      },
      reveal: function () {
        var use = h('button', { class: 'btn btn-sm', type: 'button', onclick: function () { editor.value = ex.solution; if (preview) window.CQRun.htmlPreview(preview, ex.solution); } }, ui.icon('copy'), 'Mettre la solution dans l’éditeur');
        return h('div', { class: 'stack', style: { gap: '8px' } }, h('div', { class: 'row-between' }, h('div', { class: 'label' }, 'Solution'), use), ui.codeBlock(ex.solution, ex.lang));
      },
      lock: function () { editor.setDisabled(true); },
      unlock: function () { editor.setDisabled(false); },
      focus: function () { editor.focus(); },
      run: run
    };
  }
  function schemaOf(sql) {
    return sql.split(';').filter(function (s) { return /create\s+table/i.test(s); }).map(function (s) { return s.trim() + ';'; }).join('\n\n') || sql;
  }

  App.CQRunSafe = function (fn) { try { fn(); } catch (e) { console.error(e); } };

  var TYPES = { qcm: qcm, predict: predict, fill: fill, order: order, bug: bug, code: code, logic: logic };
  App.TYPE_LABEL = { qcm: 'QCM', predict: 'Prédire la sortie', fill: 'Code à trous', order: 'Remettre dans l’ordre', bug: 'Trouver le bug', code: 'Écrire du code', logic: 'Défi de logique' };
  App.TYPE_ICON = { qcm: 'list', predict: 'terminal', fill: 'code', order: 'layers', bug: 'shield', code: 'practice', logic: 'compass' };

  // Exercice utilisable dans cet environnement (SQL ou DOM indisponibles : on l'écarte des révisions).
  App.usable = function (ex) {
    var c = window.CQRun.caps;
    if (ex.type === 'code' && ex.lang === 'sql' && c.sql === 'failed') return false;
    if (ex.type === 'code' && ex.dom && c.dom === false) return false;
    if (ex.type === 'code' && ex.lang === 'python' && !window.MiniPy) return false;
    return true;
  };

  App.mountExercise = function (ex, ctx) {
    var make = TYPES[ex.type];
    if (!make) return { el: h('p', null, 'Type d’exercice inconnu.'), canCheck: function () { return false; }, check: function () { return Promise.resolve({ correct: false }); }, reveal: function () { return null; }, lock: function () {}, unlock: function () {} };
    return make(ex, ctx);
  };
})(App);
