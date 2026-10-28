// Exécution réelle du code des apprenants, toujours isolée de l'appli :
// - Python : interpréteur MiniPy dans un Worker (sinon dans la page, sans accès à rien d'autre que le programme) ;
// - JavaScript : Worker créé pour chaque exécution, arrêté au bout de 5 s ;
// - JavaScript avec DOM : page bac à sable sans accès à l'appli (iframe sandbox="allow-scripts") ;
// - HTML/CSS : rendu dans un cadre sans script, puis vérifications sur la page rendue ;
// - SQL : SQLite (sql.js) chargé à la demande depuis un CDN.
(function (root) {
  var caps = { worker: null, python: 'idle', sql: 'idle', dom: null };
  var H = root.CQJsHarness;

  function isFullDoc(html) { return /<!doctype|<html[\s>]/i.test(html); }
  function wrapDoc(html) {
    return isFullDoc(html) ? html : '<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>html{font-size:16px}body{font-family:system-ui,-apple-system,sans-serif;margin:16px;color:#111;background:#fff}</style></head><body>' + html + '</body></html>';
  }

  // ---------- Python ----------
  var pyWorker = null, pyQueue = {}, pySeq = 0;
  function pyWorkerSource() {
    return 'var createMiniPy = ' + root.createMiniPy.toString() + ';\n' +
      'var MiniPy = createMiniPy();\n' +
      'onmessage = function (e) { var d = e.data, r;\n' +
      '  try { r = d.tests ? MiniPy.runTests(d.code, d.tests, d.opts) : MiniPy.run(d.code, d.opts); }\n' +
      '  catch (err) { r = { ok: false, stdout: "", error: { type: "InternalError", message: String(err && err.message || err), line: null, text: "InternalError" }, tests: [] }; }\n' +
      '  postMessage({ id: d.id, result: JSON.parse(JSON.stringify(r)) }); };';
  }
  function startPyWorker() {
    if (pyWorker || caps.worker === false || !root.createMiniPy) return pyWorker;
    try {
      var url = URL.createObjectURL(new Blob([pyWorkerSource()], { type: 'text/javascript' }));
      pyWorker = new Worker(url);
      pyWorker.onmessage = function (e) {
        var job = pyQueue[e.data.id];
        if (job) { delete pyQueue[e.data.id]; clearTimeout(job.timer); job.resolve(e.data.result); }
      };
      pyWorker.onerror = function () {
        // Le Worker n'a pas pu démarrer (politique de sécurité) : on passe à l'exécution dans la page.
        caps.worker = false; caps.python = 'main';
        var jobs = pyQueue; pyQueue = {}; pyWorker = null;
        Object.keys(jobs).forEach(function (id) { clearTimeout(jobs[id].timer); jobs[id].resolve(runPyMain(jobs[id].msg)); });
      };
      caps.python = 'worker';
    } catch (e) {
      caps.worker = false; caps.python = 'main'; pyWorker = null;
    }
    return pyWorker;
  }
  function runPyMain(msg) {
    var MP = root.MiniPy;
    return msg.tests ? MP.runTests(msg.code, msg.tests, msg.opts) : MP.run(msg.code, msg.opts);
  }
  function python(code, o) {
    o = o || {};
    if (!root.MiniPy) return Promise.resolve({ ok: false, stdout: '', tests: [], error: { type: 'Indisponible', message: "L'interpréteur Python n'est pas chargé.", line: null } });
    var msg = { code: code, tests: o.tests ? o.tests.map(function (t) { return { code: t.code }; }) : null, opts: { stdin: o.stdin || '', files: o.files || {} } };
    var w = startPyWorker();
    if (!w) return Promise.resolve(runPyMain(msg));
    return new Promise(function (resolve) {
      var id = ++pySeq;
      msg.id = id;
      var timer = setTimeout(function () {
        // Sécurité supplémentaire : MiniPy s'arrête normalement seul, mais on ne laisse jamais un Worker bloqué.
        if (!pyQueue[id]) return;
        delete pyQueue[id];
        try { pyWorker.terminate(); } catch (e) {}
        pyWorker = null;
        resolve({ ok: false, stdout: '', tests: [], error: { type: 'LimitError', message: "Le programme a dépassé la limite d'exécution (boucle infinie ?)", line: null } });
      }, 12000);
      pyQueue[id] = { resolve: resolve, timer: timer, msg: msg };
      w.postMessage(msg);
    });
  }

  // ---------- JavaScript (Worker) ----------
  function javascript(code, o) {
    o = o || {};
    var built = H.buildWorkerSource(code, o.tests || null);
    return new Promise(function (resolve) {
      var w, url, done = false;
      function finish(r) {
        if (done) return; done = true;
        clearTimeout(timer);
        try { w && w.terminate(); } catch (e) {}
        try { url && URL.revokeObjectURL(url); } catch (e) {}
        resolve(r);
      }
      var timer = setTimeout(function () {
        finish({ stdout: '', tests: [], error: { name: 'TimeoutError', message: 'Le programme a dépassé 5 secondes (boucle infinie ?)', line: null } });
      }, 5000);
      try {
        url = URL.createObjectURL(new Blob([built.source], { type: 'text/javascript' }));
        w = new Worker(url);
        caps.worker = caps.worker === false ? false : true;
      } catch (e) {
        caps.worker = false;
        finish({ stdout: '', tests: [], error: { name: 'Indisponible', message: "Ce navigateur bloque l'exécution isolée du JavaScript (Web Worker).", line: null }, unavailable: true });
        return;
      }
      w.onmessage = function (e) {
        var p = e.data || {};
        finish({ stdout: (p.logs || []).join('\n'), tests: p.results || [], error: p.error || null });
      };
      w.onerror = function (ev) {
        if (ev && ev.preventDefault) ev.preventDefault();
        var msg = ev && ev.message ? String(ev.message).replace(/^Uncaught\s+/, '') : 'Erreur';
        var m = /^(\w+Error):\s*(.*)$/.exec(msg);
        finish({ stdout: '', tests: [], error: { name: m ? m[1] : 'SyntaxError', message: m ? m[2] : msg, line: ev && ev.lineno ? ev.lineno - built.offset : null } });
      };
    });
  }

  // ---------- JavaScript avec une page (DOM) ----------
  var domSeq = 0;
  function dom(html, code, o) {
    o = o || {};
    var token = 'cq' + (++domSeq) + '_' + Math.random().toString(36).slice(2);
    var built = H.buildDomDocument(html, code, o.tests || null, token);
    var host = o.mount || hiddenHost();
    var frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('title', 'Aperçu de la page');
    frame.className = 'preview';
    if (!o.mount) frame.style.cssText = 'width:800px;height:600px';
    return new Promise(function (resolve) {
      var done = false;
      function finish(r) {
        if (done) return; done = true;
        clearTimeout(timer);
        window.removeEventListener('message', onMsg);
        if (!o.mount) setTimeout(function () { frame.remove(); }, 50);
        resolve(r);
      }
      function onMsg(e) {
        if (!e.data || e.data.__cq !== token) return;
        caps.dom = true;
        var p = e.data.payload || {};
        finish({ stdout: (p.logs || []).join('\n'), tests: p.results || [], error: p.error || null });
      }
      var timer = setTimeout(function () {
        if (caps.dom === null) caps.dom = false;
        finish({ stdout: '', tests: [], error: { name: 'Indisponible', message: "La page de test n'a pas répondu : l'exécution du DOM est peut-être bloquée dans cet environnement, ou le code boucle à l'infini.", line: null }, unavailable: caps.dom === false });
      }, 6000);
      window.addEventListener('message', onMsg);
      if (o.mount) o.mount.replaceChildren(frame); else host.appendChild(frame);
      frame.srcdoc = built.source;
    });
  }

  // ---------- HTML / CSS ----------
  var host = null;
  function hiddenHost() {
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:fixed;left:-12000px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
      document.body.appendChild(host);
    }
    return host;
  }
  // Affiche le HTML de l'apprenant dans un cadre visible, sans script.
  function htmlPreview(frame, html) {
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.srcdoc = wrapDoc(html);
  }
  function renderAt(html, width) {
    return new Promise(function (resolve) {
      var f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-same-origin');
      f.style.cssText = 'width:' + width + 'px;height:800px;border:0';
      var settled = false;
      function go() {
        if (settled) return;
        // Ignore le document vide initial : on attend le rendu du code (about:srcdoc).
        var d = null;
        try { d = f.contentDocument; } catch (e) { d = null; }
        if (d && d.URL !== 'about:srcdoc') return;
        settled = true;
        resolve(f);
      }
      f.srcdoc = wrapDoc(html);
      f.addEventListener('load', go);
      setTimeout(function () { settled = false; go(); settled = true; }, 4000);
      hiddenHost().appendChild(f);
    });
  }
  function htmlChecks(html, checks) {
    var C = root.CQHtmlChecks;
    var widths = C.widths(checks);
    var results = [];
    return widths.reduce(function (p, w) {
      return p.then(function () {
        return renderAt(html, w).then(function (f) {
          var idx = [], subset = [];
          checks.forEach(function (c, i) { if ((c.vw || 800) === w) { idx.push(i); subset.push(c); } });
          var r;
          try { r = C.run(f.contentDocument, f.contentWindow, subset); }
          catch (e) { r = subset.map(function (c) { return { label: c.label, ok: false, detail: 'Vérification impossible : ' + e.message }; }); }
          r.forEach(function (x, k) { results[idx[k]] = x; });
          f.remove();
        });
      });
    }, Promise.resolve()).then(function () { return results; });
  }

  // ---------- SQL ----------
  var SQL_URL = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/sql-asm.js';
  var sqlPromise = null, SQL = null;
  function sqlLoad() {
    if (sqlPromise) return sqlPromise;
    caps.sql = 'loading';
    sqlPromise = new Promise(function (resolve, reject) {
      function init() {
        root.initSqlJs().then(function (S) { SQL = S; caps.sql = 'ready'; resolve(S); }, function (e) { caps.sql = 'failed'; reject(e); });
      }
      if (root.initSqlJs) { init(); return; }
      var s = document.createElement('script');
      s.src = SQL_URL;
      s.async = true;
      var t = setTimeout(function () { caps.sql = 'failed'; reject(new Error('délai dépassé')); }, 30000);
      s.onload = function () { clearTimeout(t); if (root.initSqlJs) init(); else { caps.sql = 'failed'; reject(new Error('moteur absent')); } };
      s.onerror = function () { clearTimeout(t); caps.sql = 'failed'; reject(new Error('chargement bloqué')); };
      document.head.appendChild(s);
    });
    sqlPromise.catch(function () { sqlPromise = null; });
    return sqlPromise;
  }
  function lastResult(db, q) {
    var res = db.exec(q);
    return res.length ? res[res.length - 1] : { columns: [], values: [] };
  }
  function sqlRun(setup, query) {
    return sqlLoad().then(function (S) {
      var db = new S.Database();
      try {
        db.exec(setup || '');
        var r = lastResult(db, query);
        return { columns: r.columns, values: r.values };
      } catch (e) {
        return { error: String(e.message || e) };
      } finally { db.close(); }
    });
  }
  function sameRows(a, b, ordered) {
    if (a.columns.length !== b.columns.length) return false;
    var ra = a.values.map(function (r) { return JSON.stringify(r); });
    var rb = b.values.map(function (r) { return JSON.stringify(r); });
    if (!ordered) { ra.sort(); rb.sort(); }
    return JSON.stringify(ra) === JSON.stringify(rb);
  }
  // Compare la requête de l'apprenant à la solution sur deux bases neuves identiques.
  function sqlCompare(setup, userQuery, solution, o) {
    o = o || {};
    return sqlLoad().then(function (S) {
      function outcome(q) {
        var db = new S.Database();
        try {
          db.exec(setup || '');
          var r = lastResult(db, q);
          if (o.verify) r = lastResult(db, o.verify);
          return { columns: r.columns, values: r.values };
        } finally { db.close(); }
      }
      var expected = outcome(solution);
      var got;
      try { got = outcome(userQuery); } catch (e) { return { ok: false, error: String(e.message || e), expected: expected }; }
      var ok = sameRows(got, expected, !!o.ordered);
      var why = '';
      if (!ok) {
        if (got.columns.length !== expected.columns.length) why = 'Nombre de colonnes : ' + got.columns.length + ' au lieu de ' + expected.columns.length + '.';
        else if (got.values.length !== expected.values.length) why = 'Nombre de lignes : ' + got.values.length + ' au lieu de ' + expected.values.length + '.';
        else if (o.ordered && sameRows(got, expected, false)) why = 'Les bonnes lignes, mais pas dans le bon ordre.';
        else why = 'Les valeurs ne correspondent pas au résultat attendu.';
      }
      return { ok: ok, got: got, expected: expected, why: why };
    });
  }

  root.CQRun = {
    caps: caps,
    python: python,
    javascript: javascript,
    dom: dom,
    htmlPreview: htmlPreview,
    htmlChecks: htmlChecks,
    wrapDoc: wrapDoc,
    sqlLoad: sqlLoad,
    sqlRun: sqlRun,
    sqlCompare: sqlCompare
  };
})(typeof window !== 'undefined' ? window : globalThis);
