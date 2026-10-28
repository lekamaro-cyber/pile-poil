// Construit le programme JavaScript réellement exécuté pour un exercice : le code de l'apprenant, puis les tests,
// dans un environnement isolé (Worker sans DOM, ou page bac à sable pour les exercices DOM).
// Partagé entre l'appli et l'outil de validation, pour que les deux exécutent exactement la même chose.
(function (root) {
  // Faux serveur d'entraînement : aucune requête ne part sur Internet.
  var FAKE_FETCH = String(function cqFakeFetch(input, init) {
    init = init || {};
    var url = String(input && input.url ? input.url : input);
    var method = String(init.method || 'GET').toUpperCase();
    var users = [{ id: 1, nom: 'Ada' }, { id: 2, nom: 'Linus' }, { id: 3, nom: 'Grace' }];
    var texts = { 200: 'OK', 201: 'Created', 400: 'Bad Request', 404: 'Not Found' };
    function respond(status, body) {
      var text = JSON.stringify(body);
      var res = {
        ok: status >= 200 && status < 300,
        status: status,
        statusText: texts[status] || '',
        url: url,
        headers: { get: function (name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null; } },
        json: function () { return Promise.resolve(JSON.parse(text)); },
        text: function () { return Promise.resolve(text); }
      };
      return new Promise(function (resolve) { setTimeout(function () { resolve(res); }, 15); });
    }
    var m = url.match(/^https:\/\/api\.codequest\.test(\/[^?#]*)?(\?[^#]*)?/);
    if (!m) return Promise.reject(new TypeError('Failed to fetch'));
    var path = (m[1] || '/').replace(/\/+$/, '') || '/';
    var query = {};
    (m[2] || '').replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
    });
    if (method === 'GET' && path === '/users') return respond(200, users);
    var um = path.match(/^\/users\/(\d+)$/);
    if (method === 'GET' && um) {
      var u = users.filter(function (x) { return x.id === Number(um[1]); })[0];
      return u ? respond(200, u) : respond(404, { erreur: 'introuvable' });
    }
    if (method === 'GET' && path === '/meteo') {
      return respond(200, { ville: query.ville || 'Paris', temperature: 18, ciel: 'nuageux' });
    }
    if (method === 'POST' && path === '/users') {
      var body = {};
      try { body = JSON.parse(init.body || '{}'); } catch (e) { return respond(400, { erreur: 'JSON invalide' }); }
      if (!body.nom) return respond(400, { erreur: 'nom manquant' });
      return respond(201, { id: 4, nom: body.nom });
    }
    return respond(404, { erreur: 'introuvable' });
  });

  // Affichage proche de console.log de Node pour les cas courants.
  var PRELUDE = [
    'var __logs = [], __pending = 0;',
    'function __q(s) { return "\'" + String(s).replace(/\\\\/g, "\\\\\\\\").replace(/\'/g, "\\\\\'").replace(/\\n/g, "\\\\n") + "\'"; }',
    'function __fmt(v, depth, top) {',
    '  depth = depth || 0;',
    '  if (typeof v === "string") return top ? v : __q(v);',
    '  if (typeof v === "number") return Object.is(v, -0) ? "-0" : String(v);',
    '  if (typeof v === "bigint") return String(v) + "n";',
    '  if (v === undefined) return "undefined";',
    '  if (v === null) return "null";',
    '  if (typeof v === "boolean" || typeof v === "symbol") return String(v);',
    '  if (typeof v === "function") return v.prototype && /^class\\b/.test(Function.prototype.toString.call(v)) ? "[class " + (v.name || "(anonymous)") + "]" : "[Function: " + (v.name || "(anonymous)") + "]";',
    '  if (v instanceof Error) return (v.stack && depth === 0 ? String(v.name) + ": " + v.message : "[" + v.name + ": " + v.message + "]");',
    '  if (depth > 2) return Array.isArray(v) ? "[Array]" : "[Object]";',
    '  if (Array.isArray(v)) { if (!v.length) return "[]"; return "[ " + v.map(function (x) { return __fmt(x, depth + 1); }).join(", ") + " ]"; }',
    '  if (v instanceof Map) { var me = []; v.forEach(function (val, k) { me.push(__fmt(k, depth + 1) + " => " + __fmt(val, depth + 1)); }); return "Map(" + v.size + ") " + (me.length ? "{ " + me.join(", ") + " }" : "{}"); }',
    '  if (v instanceof Set) { var se = []; v.forEach(function (val) { se.push(__fmt(val, depth + 1)); }); return "Set(" + v.size + ") " + (se.length ? "{ " + se.join(", ") + " }" : "{}"); }',
    '  if (v instanceof Promise) return "Promise { <pending> }";',
    '  if (v instanceof Date) return v.toISOString();',
    '  var keys = Object.keys(v);',
    '  var proto = Object.getPrototypeOf(v);',
    '  var name = proto && proto !== Object.prototype && proto.constructor && proto.constructor.name ? proto.constructor.name + " " : (proto === null ? "[Object: null prototype] " : "");',
    '  if (!keys.length) return name + "{}";',
    '  return name + "{ " + keys.map(function (k) { return (/^[A-Za-z_$][\\w$]*$/.test(k) ? k : __q(k)) + ": " + __fmt(v[k], depth + 1); }).join(", ") + " }";',
    '}',
    'function __log() { __logs.push(Array.prototype.map.call(arguments, function (a) { return __fmt(a, 0, true); }).join(" ")); }',
    'console.log = __log; console.info = __log; console.warn = __log; console.error = __log; console.table = __log;',
    'function __deepEq(a, b) {',
    '  if (Object.is(a, b)) return true;',
    '  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;',
    '  if (Array.isArray(a) !== Array.isArray(b)) return false;',
    '  var ka = Object.keys(a), kb = Object.keys(b);',
    '  if (ka.length !== kb.length) return false;',
    '  return ka.every(function (k) { return Object.prototype.hasOwnProperty.call(b, k) && __deepEq(a[k], b[k]); });',
    '}',
    'function assert(cond, message) { if (!cond) throw new Error(message || "Assertion fausse"); }',
    'function assertEqual(actual, expected, message) { if (!__deepEq(actual, expected)) throw new Error(message || ("Attendu " + __fmt(expected) + ", obtenu " + __fmt(actual))); }',
    'var __setTimeout = setTimeout, __clearTimeout = clearTimeout;',
    'var __timers = {};',
    'setTimeout = function (fn, ms) { var args = Array.prototype.slice.call(arguments, 2); __pending++; var id = __setTimeout(function () { if (__timers[id]) { delete __timers[id]; __pending--; } fn.apply(null, args); }, ms); __timers[id] = true; return id; };',
    'clearTimeout = function (id) { if (__timers[id]) { delete __timers[id]; __pending--; } __clearTimeout(id); };',
    'setInterval = function () { throw new Error("setInterval est désactivé dans CodeQuest : utilise setTimeout."); };',
    'var fetch = ' + FAKE_FETCH + ';',
    'function __errInfo(e, offset) {',
    '  var line = null, m = e && e.stack ? String(e.stack).match(/(?:<anonymous>|blob:[^)\\s]*|__cq\\.js|about:srcdoc):(\\d+):(\\d+)/) : null;',
    '  if (m) line = Number(m[1]) - offset;',
    '  return { name: e && e.name ? String(e.name) : "Error", message: e && e.message !== undefined ? String(e.message) : String(e), line: line > 0 ? line : null };',
    '}',
    'function __settle(limit) { var start = Date.now(); return new Promise(function (resolve) { (function wait() { if (__pending <= 0 || Date.now() - start > limit) resolve(); else __setTimeout(wait, 10); })(); }); }'
  ];

  function testsSource(tests) {
    return '[' + (tests || []).map(function (t) {
      return 'async function () {\n' + t.code + '\n}';
    }).join(',\n') + ']';
  }

  // Programme complet. Le code de l'apprenant commence à la ligne offset + 1.
  function build(userCode, tests, reportExpr, extraOffset) {
    var head = PRELUDE.concat([
      '(async function () {',
      '  var __results = [], __error = null, __tests;',
      '  try {'
    ]);
    var offset = head.join('\n').split('\n').length;
    var tail = [
      '',
      '  ;__tests = ' + testsSource(tests) + ';',
      '  } catch (__e) { __error = __errInfo(__e, ' + (offset + (extraOffset || 0)) + '); }',
      '  if (!__error && __tests) {',
      '    for (var __i = 0; __i < __tests.length; __i++) {',
      '      try { await __tests[__i](); __results.push({ ok: true }); }',
      '      catch (__e) { __results.push({ ok: false, message: __e && __e.message ? String(__e.message) : String(__e) }); }',
      '    }',
      '  }',
      '  await __settle(1500);',
      '  ' + reportExpr + '({ logs: __logs, results: __results, error: __error });',
      '})();'
    ];
    // Le code de l'apprenant et les tests partagent la même portée : les tests voient ses fonctions et variables.
    return { source: head.join('\n') + '\n' + userCode + '\n' + tail.join('\n'), offset: offset };
  }

  // Pour un Worker : le résultat repart par postMessage.
  function buildWorkerSource(userCode, tests) {
    return build(userCode, tests, 'postMessage');
  }

  // Pour une page bac à sable (exercices DOM) : le résultat repart vers la page parente.
  function buildDomDocument(html, userCode, tests, token) {
    var report = '(function (p) { try { parent.postMessage({ __cq: ' + JSON.stringify(token) + ', payload: p }, "*"); } catch (e) {} window.__cqResult = p; })';
    var head = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>\n'
      + (html || '') + '\n<script>\n'
      + 'window.addEventListener("error", function (ev) { if (window.__cqResult) return; var p = { logs: typeof __logs !== "undefined" ? __logs : [], results: [], error: { name: "SyntaxError", message: ev.message, line: ev.lineno ? ev.lineno - __CQ_OFFSET__ : null } }; window.__cqResult = p; try { parent.postMessage({ __cq: ' + JSON.stringify(token) + ', payload: p }, "*"); } catch (e) {} });\n'
      + '</script>\n<script>\n';
    // Dans la page, les numéros de ligne comptent depuis le début du document : on décale d'autant.
    var before = head.split('\n').length - 1;
    var b = build(userCode, tests, report, before);
    var offset = before + b.offset;
    return { source: head.replace('__CQ_OFFSET__', String(offset)) + b.source + '\n</script></body></html>', offset: offset };
  }

  root.CQJsHarness = { buildWorkerSource: buildWorkerSource, buildDomDocument: buildDomDocument, FAKE_FETCH: FAKE_FETCH };
})(typeof window !== 'undefined' ? window : globalThis);
