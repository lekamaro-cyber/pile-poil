// Lecture du contenu et règles de progression : déblocage des unités, état des unités, chemin recommandé,
// révisions dues, défi du jour.
(function (App) {
  var CQ = window.CQ;
  var TRACK_ORDER = ['py', 'web', 'js', 'git', 'sql', 'api', 'data', 'autres'];
  var TRACK_TAG = { py: 'py', web: '</>', js: 'js', git: 'git', sql: 'sql', api: 'api', data: 'ia', autres: '+' };

  var M = App.model = {};
  M.tracks = CQ.tracks.slice().sort(function (a, b) {
    var ia = TRACK_ORDER.indexOf(a.id), ib = TRACK_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  M.trackTag = function (id) { return TRACK_TAG[id] || id; };
  M.track = {}; M.unit = {}; M.lesson = {}; M.ex = {}; M.chapter = {};
  M.unitOrder = {}; // id -> index dans son parcours
  M.allUnits = [];
  M.tracks.forEach(function (t) {
    M.track[t.id] = t;
    var units = [];
    t.chapters.forEach(function (ch) {
      M.chapter[ch.id] = ch;
      ch.units.forEach(function (u) {
        M.unit[u.id] = u;
        M.unitOrder[u.id] = units.length;
        units.push(u);
        M.allUnits.push(u);
        u.lessons.forEach(function (l) {
          M.lesson[l.id] = l;
          CQ.lessonExercises(l).forEach(function (ex) { M.ex[ex.id] = ex; });
        });
      });
    });
    t.units = units;
  });
  CQ.katas.forEach(function (k) { M.ex[k.ex.id] = k.ex; });
  CQ.projects.forEach(function (p) { p.steps.forEach(function (s) { if (s.ex) M.ex[s.ex.id] = s.ex; }); });
  CQ.placement.forEach(function (it) { M.ex[it.ex.id] = it.ex; });
  CQ.puzzles.forEach(function (p) { M.ex[p.ex.id] = p.ex; });
  M.kata = {}; CQ.katas.forEach(function (k) { M.kata[k.id] = k; });
  M.project = {}; CQ.projects.forEach(function (p) { M.project[p.id] = p; });

  M.unitLabel = function (uid) {
    var u = M.unit[uid];
    if (!u) return uid;
    return M.track[u.trackId].title + ' · ' + u.title;
  };
  M.unitExercises = function (uid) {
    var u = M.unit[uid];
    if (!u) return [];
    var list = [];
    u.lessons.forEach(function (l) { list = list.concat(CQ.lessonExercises(l)); });
    CQ.katas.forEach(function (k) { if (k.unit === uid) list.push(k.ex); });
    return list;
  };

  // ---------- États ----------
  function st() { return App.state; }
  M.lessonDone = function (lid) { return !!(st().lessons[lid] && st().lessons[lid].done); };
  M.unitValidated = function (uid) { return !!st().units[uid]; };
  M.unitDone = function (uid) {
    var u = M.unit[uid];
    if (!u) return false;
    if (M.unitValidated(uid)) return true;
    return u.lessons.every(function (l) { return M.lessonDone(l.id); });
  };
  M.unitStarted = function (uid) {
    var u = M.unit[uid];
    return !!u && u.lessons.some(function (l) { return M.lessonDone(l.id); });
  };
  // Prérequis manquants (unités d'autres parcours, ou du parcours lui-même).
  M.missingRequires = function (uid) {
    var u = M.unit[uid];
    if (!u) return [];
    var t = M.track[u.trackId];
    var req = (t.requires || []).concat(u.requires || []);
    return req.filter(function (r) { return M.unit[r] && !M.unitDone(r); });
  };
  M.previousUnit = function (uid) {
    var u = M.unit[uid], t = M.track[u.trackId];
    if (t.unlock === 'chapter') {
      var ch = M.chapter[u.chapterId], i = ch.units.indexOf(u);
      return i > 0 ? ch.units[i - 1] : null;
    }
    var idx = M.unitOrder[uid];
    return idx > 0 ? t.units[idx - 1] : null;
  };
  M.unitUnlocked = function (uid) {
    if (M.missingRequires(uid).length) return false;
    var prev = M.previousUnit(uid);
    return !prev || M.unitDone(prev.id);
  };
  // L'évaluation pour passer une unité est possible dès que les prérequis d'autres parcours sont remplis.
  M.canTestOut = function (uid) { return !M.unitDone(uid) && !M.missingRequires(uid).length; };
  M.unitStatus = function (uid) {
    if (M.unitDone(uid)) return App.state.concepts[uid] && App.state.concepts[uid].lvl >= 4 ? 'mastered' : 'done';
    if (M.unitStarted(uid)) return 'progress';
    return M.unitUnlocked(uid) ? 'available' : 'locked';
  };
  M.STATUS_LABEL = { locked: 'Verrouillée', available: 'Disponible', progress: 'En cours', done: 'Terminée', mastered: 'Maîtrisée' };
  M.nextLessonInUnit = function (uid) {
    var u = M.unit[uid];
    if (!u) return null;
    for (var i = 0; i < u.lessons.length; i++) if (!M.lessonDone(u.lessons[i].id)) return u.lessons[i];
    return null;
  };
  M.trackProgress = function (tid) {
    var t = M.track[tid], done = 0;
    t.units.forEach(function (u) { if (M.unitDone(u.id)) done++; });
    return { done: done, total: t.units.length, pct: t.units.length ? Math.round(100 * done / t.units.length) : 0 };
  };
  M.trackStarted = function (tid) { return M.track[tid].units.some(function (u) { return M.unitStarted(u.id) || M.unitValidated(u.id); }); };

  // Remonte les prérequis jusqu'à une unité réellement disponible.
  M.firstReachable = function (uid, seen) {
    seen = seen || {};
    if (seen[uid]) return null;
    seen[uid] = true;
    if (M.unitDone(uid)) return null;
    var missing = M.missingRequires(uid);
    for (var i = 0; i < missing.length; i++) { var r = M.firstReachable(missing[i], seen); if (r) return r; }
    if (M.unitUnlocked(uid)) return uid;
    var prev = M.previousUnit(uid);
    return prev ? M.firstReachable(prev.id, seen) : uid;
  };

  // ---------- Chemin recommandé ----------
  function range(prefix, a, b) { var out = []; for (var i = a; i <= b; i++) out.push(prefix + '.u' + i); return out.filter(function (id) { return M.unit[id]; }); }
  M.SPECS = {
    ia: { title: 'IA et data science', text: 'Données, statistiques, machine learning, réseaux de neurones, API d’IA.', units: function () { return range('data', 1, 19); } },
    web: { title: 'Développement web', text: 'JavaScript moderne, back-end, API, sites complets.', units: function () { return range('web', 12, 14).concat(range('js', 11, 16), range('api', 1, 12)); } },
    apps: { title: 'Applications', text: 'Applis interactives, TypeScript, Dart et Flutter, API.', units: function () { return range('js', 11, 16).concat(['autres.u9', 'autres.u11'].filter(function (id) { return M.unit[id]; }), range('api', 1, 6)); } }
  };
  M.mainPath = function () {
    var spec = App.state.prefs.spec;
    var stages = [
      { id: 'py-bases', title: 'Bases de Python', units: range('py', 1, 8) },
      { id: 'py-inter', title: 'Python intermédiaire', units: range('py', 9, 14) },
      { id: 'web', title: 'HTML et CSS', units: range('web', 1, 11) },
      { id: 'js', title: 'JavaScript', units: range('js', 1, 10) },
      { id: 'git', title: 'Git et GitHub', units: range('git', 1, 8) },
      { id: 'sql', title: 'SQL et bases de données', units: range('sql', 1, 9) },
      { id: 'spe', title: spec && M.SPECS[spec] ? 'Spécialisation : ' + M.SPECS[spec].title : 'Choix d’une spécialisation', units: spec && M.SPECS[spec] ? M.SPECS[spec].units() : [], spec: true }
    ];
    return stages.filter(function (s) { return s.units.length || s.spec; }).map(function (s) {
      var done = s.units.filter(M.unitDone).length;
      s.done = done; s.total = s.units.length;
      s.complete = s.total > 0 && done === s.total;
      return s;
    });
  };
  // Prochain objectif : première unité non terminée du chemin, ramenée à une unité accessible.
  M.nextGoal = function () {
    var stages = M.mainPath();
    for (var i = 0; i < stages.length; i++) {
      var s = stages[i];
      if (s.spec && !s.units.length) return { stage: s, needSpec: true };
      for (var j = 0; j < s.units.length; j++) {
        var uid = s.units[j];
        if (M.unitDone(uid)) continue;
        var reach = M.firstReachable(uid) || uid;
        return { stage: s, unitId: reach, target: uid, lesson: M.nextLessonInUnit(reach) };
      }
    }
    // Chemin principal terminé : la suite du parcours Python, puis le reste de la bibliothèque.
    for (var k = 0; k < M.allUnits.length; k++) {
      var u = M.allUnits[k];
      if (!M.unitDone(u.id) && M.unitUnlocked(u.id)) return { stage: { title: M.track[u.trackId].title }, unitId: u.id, target: u.id, lesson: M.nextLessonInUnit(u.id) };
    }
    return null;
  };
  // Parcours conseillés maintenant (sans disperser) : ceux de l'étape en cours.
  M.recommendedTrackIds = function () {
    var g = M.nextGoal();
    var ids = {};
    if (g && g.unitId) ids[M.unit[g.unitId].trackId] = true;
    if (g && g.target) ids[M.unit[g.target].trackId] = true;
    return Object.keys(ids);
  };

  // ---------- Révisions ----------
  M.dueUnits = function () {
    var now = Date.now();
    return Object.keys(App.state.concepts).filter(function (uid) { return M.unit[uid] && App.isDue(uid, now); })
      .sort(function (a, b) { return App.state.concepts[a].next - App.state.concepts[b].next; });
  };
  M.upcoming = function (days) {
    var out = [];
    var start = new Date(); start.setHours(0, 0, 0, 0);
    for (var i = 0; i < days; i++) out.push({ day: start.getTime() + i * 86400000, count: 0 });
    Object.keys(App.state.concepts).forEach(function (uid) {
      var c = App.state.concepts[uid];
      if (!c.next || !M.unit[uid]) return;
      var idx = Math.max(0, Math.floor((c.next - start.getTime()) / 86400000));
      if (idx < days) out[idx].count += 1;
    });
    return out;
  };
  M.openErrors = function () {
    var e = App.state.errors;
    return Object.keys(e).filter(function (id) { return !e[id].fixed && M.ex[id] && M.ex[id].role !== 'placement'; })
      .sort(function (a, b) { return e[b].t - e[a].t; });
  };
  M.oldConcepts = function () {
    return Object.keys(App.state.concepts).filter(function (uid) { return M.unit[uid] && !App.isDue(uid); })
      .sort(function (a, b) { return (App.state.concepts[a].last || 0) - (App.state.concepts[b].last || 0); });
  };
  // Exercices pour réviser une notion : d'abord ceux ratés, puis les moins récemment vus.
  M.pickForUnit = function (uid, n, avoid) {
    avoid = avoid || {};
    var pool = M.unitExercises(uid).filter(function (ex) { return !avoid[ex.id] && App.usable(ex); });
    var errs = App.state.errors;
    pool.sort(function (a, b) {
      var ea = errs[a.id] && !errs[a.id].fixed ? 1 : 0, eb = errs[b.id] && !errs[b.id].fixed ? 1 : 0;
      if (ea !== eb) return eb - ea;
      return (App.state.solved[a.id] || 0) - (App.state.solved[b.id] || 0) || (Math.random() - 0.5);
    });
    return pool.slice(0, n);
  };

  // ---------- Défi du jour ----------
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  M.dailyChallenge = function () {
    var k = App.dayKey();
    var saved = App.state.daily[k];
    if (saved && M.ex[saved.id]) return { ex: M.ex[saved.id], done: !!saved.done };
    var pool = [];
    CQ.puzzles.forEach(function (p) { if (!p.unit || M.unitDone(p.unit) || M.unitStarted(p.unit)) pool.push(p.ex); });
    M.allUnits.forEach(function (u) {
      if (!(M.unitDone(u.id) || M.unitStarted(u.id))) return;
      u.lessons.forEach(function (l) {
        if (!M.lessonDone(l.id) && !M.unitValidated(u.id)) return;
        CQ.lessonExercises(l).forEach(function (ex) { if (ex.type !== 'code') pool.push(ex); });
      });
    });
    if (!pool.length) return null;
    var ex = pool[hash('codequest-' + k) % pool.length];
    App.state.daily[k] = { id: ex.id, done: null };
    var keys = Object.keys(App.state.daily).sort();
    while (keys.length > 60) delete App.state.daily[keys.shift()];
    return { ex: ex, done: false };
  };

  // Compétences à découvrir / en cours / etc. pour toutes les unités.
  M.skillStatus = function (uid) {
    var s = App.conceptStatus(uid);
    if (s === 'new' && (M.unitStarted(uid) || M.unitValidated(uid))) return 'learning';
    return s;
  };
  M.SKILL_LABEL = { new: 'À découvrir', learning: 'En cours', review: 'En révision', acquired: 'Acquise', durable: 'Maîtrisée durablement' };
  M.SKILL_CHIP = { new: '', learning: 'chip-info', review: 'chip-warn', acquired: 'chip-ok', durable: 'chip-gold' };
})(App);
