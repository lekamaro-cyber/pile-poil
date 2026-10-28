// Pratique : bac à sable (Python, JavaScript, HTML/CSS, SQL) et katas vérifiés par des tests.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  var SAMPLES = {
    python: '# Bac à sable Python, exécuté par MiniPy dans ton navigateur\nnotes = {"Ada": 17, "Linus": 12, "Grace": 15}\nmoyenne = sum(notes.values()) / len(notes)\nprint(f"Moyenne : {moyenne:.2f}")\n\nfor nom, note in sorted(notes.items(), key=lambda x: -x[1]):\n    print(f"{nom:<6} {note:>3}")\n',
    javascript: '// Bac à sable JavaScript, exécuté dans un Worker isolé\nconst scores = [0.91, 0.78, 0.85];\nconst moyenne = scores.reduce((a, b) => a + b, 0) / scores.length;\nconsole.log(`Moyenne : ${moyenne.toFixed(2)}`);\n\n// fetch parle à un faux serveur d\'entraînement (aucune requête sur Internet)\nconst reponse = await fetch("https://api.codequest.test/users/1");\nconst user = await reponse.json();\nconsole.log(user.nom);\n',
    html: '<style>\n  .carte { display: flex; gap: 12px; align-items: center; padding: 16px;\n           border-radius: 12px; background: #f3f0ff; font-family: system-ui; }\n  .carte strong { color: #5b33d6; }\n</style>\n<div class="carte">\n  <strong>CodeQuest</strong>\n  <span>Modifie ce code : l’aperçu se met à jour tout seul.</span>\n</div>\n',
    sql: ''
  };
  var LANGS = [['python', 'Python'], ['javascript', 'JavaScript'], ['html', 'HTML / CSS'], ['sql', 'SQL']];
  var sandboxLang = 'python';
  var sqlDb = null;
  var kataFilter = { lang: 'all', diff: 0 };
  var openKata = null;

  function sandbox() {
    var datasets = Object.keys(window.CQ.datasets);
    if (!sqlDb) sqlDb = datasets[0] || null;
    if (!SAMPLES.sql) SAMPLES.sql = sqlDb ? '-- Base « ' + sqlDb + ' » (SQLite)\n' + firstQuery(sqlDb) : 'SELECT 1 + 1 AS resultat;';
    var key = 'sandbox:' + sandboxLang;
    var out = h('div', { class: 'stack', style: { gap: '8px' } });
    var preview = sandboxLang === 'html' ? h('iframe', { class: 'preview', title: 'Aperçu' }) : null;
    var stdin = sandboxLang === 'python' ? h('textarea', { class: 'textarea', rows: '2', placeholder: 'Entrées pour input(), une par ligne', 'aria-label': 'Entrées pour input()' }) : null;
    var timer = null;
    var editor = App.Editor({ lang: sandboxLang, value: App.drafts.get(key) || SAMPLES[sandboxLang], minLines: 12, onChange: function (v) {
      App.drafts.set(key, v);
      if (preview) { clearTimeout(timer); timer = setTimeout(function () { window.CQRun.htmlPreview(preview, editor.value); }, 350); }
    }, onSubmit: run });
    if (preview) setTimeout(function () { window.CQRun.htmlPreview(preview, editor.value); }, 0);
    var runBtn = h('button', { class: 'btn btn-primary', onclick: run }, ui.icon('run'), sandboxLang === 'html' ? 'Actualiser' : 'Exécuter');
    function run() {
      App.learning = 'practice';
      var R = window.CQRun;
      runBtn.disabled = true;
      out.replaceChildren(h('div', { class: 'console sys' }, h('span', { class: 'loading' }), ' Exécution…'));
      var p;
      if (sandboxLang === 'python') p = R.python(editor.value, { stdin: stdin.value }).then(function (r) { out.replaceChildren(h('div', { class: 'console' + (r.stdout ? '' : ' sys') }, r.stdout || (r.error ? '' : '(rien n’a été affiché)')), App.errorBox(r.error) || h('span')); });
      else if (sandboxLang === 'javascript') p = R.javascript(editor.value).then(function (r) { out.replaceChildren(h('div', { class: 'console' + (r.stdout ? '' : ' sys') }, r.stdout || (r.error ? '' : '(rien n’a été affiché)')), App.errorBox(r.error) || h('span')); });
      else if (sandboxLang === 'sql') p = R.sqlRun(window.CQ.datasets[sqlDb] || '', editor.value).then(function (r) { out.replaceChildren(App.sqlTable(r)); }, function () { out.replaceChildren(h('div', { class: 'notice warn' }, ui.icon('warning'), h('div', null, 'Le moteur SQLite n’a pas pu être chargé (CDN inaccessible ou bloqué).'))); });
      else { R.htmlPreview(preview, editor.value); p = Promise.resolve(); out.replaceChildren(); }
      p.catch(function (e) { out.replaceChildren(h('div', { class: 'console' }, h('span', { class: 'err' }, String(e && e.message || e)))); }).then(function () { runBtn.disabled = false; });
    }
    var seg = h('div', { class: 'segmented', role: 'group', 'aria-label': 'Langage' }, LANGS.map(function (l) {
      return h('button', { type: 'button', 'aria-pressed': String(l[0] === sandboxLang), onclick: function () { sandboxLang = l[0]; App.rerender(); } }, l[1]);
    }));
    var dbSelect = sandboxLang === 'sql' && datasets.length ? h('select', { class: 'select', style: { width: 'auto', minHeight: '36px' }, 'aria-label': 'Base de données', onchange: function (e) { sqlDb = e.target.value; App.rerender(); } }, datasets.map(function (d) { return h('option', { value: d, selected: d === sqlDb }, 'Base « ' + d + ' »'); })) : null;
    var notes = {
      python: 'MiniPy exécute un sous-ensemble de Python 3 : bases, fonctions, classes, exceptions, modules math, random, collections, json, csv… Pas de numpy, pandas ni accès réseau.',
      javascript: 'Ton code tourne dans un Worker isolé : pas de DOM, pas d’accès à la page ni à tes données. `fetch` parle au faux serveur https://api.codequest.test.',
      html: 'Rendu dans un cadre sans script : idéal pour tester HTML et CSS.',
      sql: 'SQLite réel (sql.js), chargé à la demande. Chaque exécution part d’une copie neuve de la base : tu peux tout casser sans risque.'
    };
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h2', null, 'Bac à sable'), seg),
      h('p', { class: 'small muted', html: ui.md(notes[sandboxLang]).replace(/<\/?p>/g, '') }),
      dbSelect ? h('div', { class: 'row' }, dbSelect, h('details', { class: 'small' }, h('summary', { class: 'muted', style: { cursor: 'pointer' } }, 'Structure'), ui.codeBlock(schema(window.CQ.datasets[sqlDb]), 'sql'))) : null,
      editor.el,
      h('div', { class: 'editor-tools' }, runBtn, h('button', { class: 'btn btn-ghost btn-sm', onclick: function () { editor.value = SAMPLES[sandboxLang]; App.drafts.clear(key); } }, ui.icon('reset'), 'Réinitialiser'), h('span', { class: 'spacer' }), h('span', { class: 'editor-help' }, 'Ctrl+Entrée : exécuter')),
      stdin ? h('div', { class: 'field' }, h('label', { class: 'label' }, 'Entrées'), stdin) : null,
      preview, out);
  }
  function schema(sql) { return String(sql || '').split(';').filter(function (s) { return /create\s+table/i.test(s); }).map(function (s) { return s.trim() + ';'; }).join('\n\n'); }
  function firstQuery(db) {
    var m = /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)/i.exec(window.CQ.datasets[db] || '');
    return 'SELECT * FROM ' + (m ? m[1] : 'sqlite_master') + '\nLIMIT 5;\n';
  }

  function kataLocked(k) { return k.unit && M.unit[k.unit] && !M.unitDone(k.unit) && !M.unitStarted(k.unit); }
  function langTag(lang) { var t = { python: ['py', 'py'], javascript: ['js', 'js'], html: ['web', '</>'], sql: ['sql', 'sql'] }[lang] || ['autres', lang]; return h('span', { class: 'lang-tag sm', 'data-t': t[0] }, t[1]); }
  function diffBars(n) { var d = h('span', { class: 'diff', 'aria-label': 'Difficulté ' + n + ' sur 4' }); for (var i = 1; i <= 4; i++) d.appendChild(h('i', { class: i <= n ? 'on' : '' })); return d; }
  App.diffBars = diffBars;
  App.langTag = langTag;

  function katas() {
    var all = window.CQ.katas;
    var langs = ['all'].concat(all.map(function (k) { return k.lang; }).filter(function (l, i, a) { return a.indexOf(l) === i; }));
    var list = all.filter(function (k) { return (kataFilter.lang === 'all' || k.lang === kataFilter.lang) && (!kataFilter.diff || k.difficulty === kataFilter.diff); });
    list.sort(function (a, b) { return (kataLocked(a) - kataLocked(b)) || a.difficulty - b.difficulty; });
    var names = { all: 'Tous', python: 'Python', javascript: 'JavaScript', html: 'HTML/CSS', sql: 'SQL' };
    return h('div', { class: 'stack' },
      h('div', { class: 'row-between' }, h('div', null, h('h2', null, 'Katas'), h('p', { class: 'small muted', style: { marginTop: '4px' } }, 'Des exercices de code autonomes, vérifiés par des tests. Chacun se débloque avec la notion qu’il demande.')),
        h('div', { class: 'row' },
          h('div', { class: 'segmented', role: 'group', 'aria-label': 'Langage' }, langs.map(function (l) { return h('button', { type: 'button', 'aria-pressed': String(kataFilter.lang === l), onclick: function () { kataFilter.lang = l; App.rerender(); } }, names[l] || l); })),
          h('div', { class: 'segmented', role: 'group', 'aria-label': 'Difficulté' }, [0, 1, 2, 3, 4].map(function (d) { return h('button', { type: 'button', 'aria-pressed': String(kataFilter.diff === d), onclick: function () { kataFilter.diff = d; App.rerender(); } }, d ? String(d) : 'Toutes'); })))),
      list.length ? h('div', { class: 'grid grid-auto' }, list.map(function (k) {
        var locked = kataLocked(k), done = App.state.katas[k.id];
        return h('button', { class: 'project-card', disabled: locked, style: locked ? { opacity: 0.6, cursor: 'not-allowed' } : null, onclick: function () { if (!locked) { openKata = k.id; App.rerender(); window.scrollTo(0, 0); } } },
          h('div', { class: 'row-between' }, langTag(k.lang), done ? h('span', { class: 'chip chip-ok' }, ui.icon('check'), 'Réussi') : locked ? h('span', { class: 'chip' }, ui.icon('lock'), 'Verrouillé') : h('span', { class: 'chip chip-accent' }, '+15 XP')),
          h('h3', null, k.title),
          h('div', { class: 'row small muted' }, diffBars(k.difficulty), h('span', null, locked ? 'Après « ' + M.unit[k.unit].title + ' »' : M.unit[k.unit] ? M.unit[k.unit].title : '')));
      })) : h('div', { class: 'empty' }, 'Aucun kata pour ces filtres.'));
  }

  // Exercice affiché dans la page (kata, étape de projet) avec ses actions en dessous.
  App.inlineExercise = function (ex, o) {
    var footWrap = h('div', { class: 'inline-foot' });
    var runner = App.runExercise(ex, {
      context: o.context, roleLabel: o.roleLabel, draftKey: o.draftKey,
      onLayout: function (kind) { footWrap.className = 'inline-foot' + (kind ? ' ' + kind : ''); },
      onFinish: o.onFinish, onContinue: o.onContinue, continueLabel: o.continueLabel
    });
    footWrap.appendChild(runner.foot);
    return h('div', { class: 'card stack', style: { gap: '18px' } }, runner.body, footWrap);
  };

  function kataView(k) {
    App.learning = 'kata';
    return h('div', { class: 'view view-narrow' },
      h('div', null, h('button', { class: 'btn btn-sm btn-ghost', onclick: function () { openKata = null; App.learning = null; App.rerender(); } }, ui.icon('arrowLeft'), 'Tous les katas')),
      h('div', { class: 'row', style: { gap: '12px' } }, langTag(k.lang), h('div', null, h('h1', null, k.title), h('div', { class: 'row small muted' }, diffBars(k.difficulty), M.unit[k.unit] ? 'Notion : ' + M.unitLabel(k.unit) : ''))),
      App.inlineExercise(k.ex, {
        context: 'kata', roleLabel: 'Kata',
        onFinish: function (out) {
          if (out.q > 0 && !App.state.katas[k.id]) { App.state.katas[k.id] = { done: Date.now(), q: out.q }; App.state.stats.katas += 1; App.checkAchievements(); App.save(); }
        },
        continueLabel: 'Kata suivant',
        onContinue: function () {
          var next = window.CQ.katas.filter(function (x) { return x.id !== k.id && !App.state.katas[x.id] && !kataLocked(x); })[0];
          openKata = next ? next.id : null; App.rerender(); window.scrollTo(0, 0);
        }
      }));
  }

  function capabilities() {
    var c = window.CQRun.caps;
    var py = window.MiniPy ? 'MiniPy ' + (window.MiniPy.version || '') + (c.python === 'main' ? ' · exécuté dans la page (Worker indisponible)' : '') : 'non chargé';
    var sqlState = { idle: 'chargé à la première utilisation', loading: 'chargement…', ready: 'prêt', failed: 'indisponible (CDN inaccessible)' }[c.sql];
    var rows = [
      ['Python', py, !!window.MiniPy],
      ['JavaScript', c.worker === false ? 'bloqué par le navigateur' : 'Worker isolé, arrêté au bout de 5 s', c.worker !== false],
      ['JavaScript avec page (DOM)', c.dom === false ? 'indisponible ici' : 'page bac à sable séparée de l’appli', c.dom !== false],
      ['HTML et CSS', 'rendu réel dans un cadre sans script', true],
      ['SQL', 'SQLite via sql.js : ' + sqlState, c.sql !== 'failed'],
      ['C, C++, Java, C#, PHP, TypeScript, Bash, Dart', 'pas de compilateur ici : lecture, prédiction, trous, bugs (sorties vérifiées avec les vrais outils lors de la création des leçons)', null]
    ];
    return h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', null, 'Ce qui s’exécute vraiment ici'), c.sql === 'failed' ? h('button', { class: 'btn btn-sm', onclick: function () { window.CQRun.sqlLoad().then(App.rerender, App.rerender); } }, 'Réessayer SQL') : null),
      h('ul', { class: 'mini-list' }, rows.map(function (r) {
        return h('li', null, h('span', { class: 'storage-dot ' + (r[2] === null ? '' : r[2] ? 'account' : 'none') }), h('div', null, h('div', { class: 't' }, r[0]), h('div', { class: 'tiny muted' }, r[1])));
      })),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, 'Aucun résultat n’est simulé : quand un code ne peut pas être exécuté ici, l’appli le dit et propose un autre type d’exercice.'));
  }

  App.views.pratique = function () {
    if (openKata && M.kata[openKata]) return kataView(M.kata[openKata]);
    openKata = null;
    return h('div', { class: 'view' },
      h('div', { class: 'view-head' }, h('div', null, h('h1', null, 'Pratique'), h('p', null, 'Écris, exécute, recommence. Le bac à sable sert à expérimenter librement ; les katas te font écrire du code vérifié par des tests.'))),
      sandbox(), katas(), capabilities());
  };
  App.resetPracticeView = function () { openKata = null; };
})(App);
