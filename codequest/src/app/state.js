// État de l'apprenant : progression, XP, niveaux, série, révisions espacées, succès, sauvegarde.
// Tout ce qui est affiché vient de cet état, alimenté uniquement par des actions réelles dans l'appli.
(function (App) {
  var KEY = 'codequest.v1';
  var DRAFTS = 'codequest.drafts.v1';
  var DAY = 86400000;
  var listeners = {};
  App.on = function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  App.emit = function (ev, data) { (listeners[ev] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); };

  function dayKey(d) {
    d = d ? new Date(d) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dayStart(key) { var p = key.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }
  function daysBetween(a, b) { return Math.round((dayStart(b) - dayStart(a)) / DAY); }
  App.dayKey = dayKey;
  App.daysBetween = daysBetween;

  function fresh() {
    return {
      v: 1,
      created: Date.now(),
      updated: 0, // 0 = rien fait encore (une sauvegarde distante plus ancienne gagne toujours)
      xp: 0,
      xpLog: [],
      days: {},
      streak: { cur: 0, best: 0, last: null, freezes: 1, frozen: [] },
      stats: { attempts: 0, firstTry: 0, solved: 0, errors: 0, lessons: 0, perfect: 0, bugs: 0, functions: 0, reviews: 0, challenges: 0, dailies: 0, projects: 0, katas: 0, tests: 0 },
      timeTotal: 0,
      lessons: {},
      units: {},
      solved: {},
      concepts: {},
      errors: {},
      projects: {},
      katas: {},
      daily: {},
      achievements: {},
      placement: null,
      prefs: { accent: 'violet', goal: 20, spec: null, codeSize: 14, reduceMotion: false },
      lastLesson: null
    };
  }
  App.freshState = fresh;

  // Complète un état chargé (ancienne version, import) avec les champs manquants.
  function normalize(s) {
    var f = fresh();
    if (!s || typeof s !== 'object' || s.v !== 1) return null;
    Object.keys(f).forEach(function (k) {
      if (s[k] == null || typeof s[k] !== typeof f[k] || Array.isArray(f[k]) !== Array.isArray(s[k])) s[k] = f[k];
    });
    ['stats', 'prefs', 'streak'].forEach(function (k) { Object.keys(f[k]).forEach(function (kk) { if (s[k][kk] === undefined) s[k][kk] = f[k][kk]; }); });
    if (s.placement !== null && typeof s.placement !== 'object') s.placement = null;
    return s;
  }
  App.normalizeState = normalize;

  // ---------- Stockage ----------
  var storage = App.storage = { local: false, account: false, error: null, lastSave: null, syncing: false };
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  (function probe() {
    try { localStorage.setItem('codequest.probe', '1'); storage.local = localStorage.getItem('codequest.probe') === '1'; localStorage.removeItem('codequest.probe'); }
    catch (e) { storage.local = false; }
  })();
  var loaded = null;
  try { loaded = normalize(JSON.parse(lsGet(KEY) || 'null')); } catch (e) { loaded = null; storage.error = 'Sauvegarde locale illisible : nouvelle progression.'; }
  App.state = loaded || fresh();

  App.storageMode = function () { return storage.account ? 'account' : storage.local ? 'local' : 'none'; };

  var remote = { ref: null, writing: false, pending: false, timer: null };
  var localTimer = null;
  function writeLocal() {
    if (!storage.local) return;
    storage.local = lsSet(KEY, JSON.stringify(App.state));
    storage.lastSave = Date.now();
  }
  App.save = function (opts) {
    App.state.updated = Date.now();
    clearTimeout(localTimer);
    localTimer = setTimeout(writeLocal, opts && opts.now ? 0 : 250);
    scheduleRemote(opts && opts.now ? 0 : 2500);
    App.emit('change');
  };
  function scheduleRemote(ms) {
    if (!remote.ref) return;
    clearTimeout(remote.timer);
    remote.timer = setTimeout(pushRemote, ms);
  }
  function pushRemote() {
    if (!remote.ref) return;
    if (remote.writing) { remote.pending = true; return; }
    remote.writing = true;
    storage.syncing = true;
    var body = { v: 1, updated: App.state.updated, json: JSON.stringify(App.state) };
    remote.ref.set(body).then(function () {
      storage.account = true; storage.error = null; storage.lastSave = Date.now();
    }, function (e) {
      var code = e && e.code;
      if (code === 'unavailable' || code === 'resource_exhausted') { remote.pending = true; }
      else { storage.account = false; remote.ref = null; storage.error = 'La sauvegarde sur ton compte a échoué (' + (code || 'erreur') + ') : la progression reste dans ce navigateur.'; }
    }).then(function () {
      remote.writing = false; storage.syncing = false;
      App.emit('storage');
      if (remote.pending && remote.ref) { remote.pending = false; scheduleRemote(4000); }
    });
  }
  function hasProgress(s) { return s.updated > 0 && (s.xp > 0 || s.placement || Object.keys(s.lessons).length); }

  // Sauvegarde sur le compte claude.ai (capacité « db ») quand l'environnement la propose.
  App.initRemote = function () {
    var c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    Promise.all([c.use('user'), c.use('db')]).then(function (r) {
      var user = r[0], db = r[1];
      if (!user || !db) return;
      return user.id().then(function (id) {
        if (!id) return;
        var ref = db.doc('data/users/' + id + '/codequest');
        return ref.get().then(function (snap) {
          remote.ref = ref;
          storage.account = true;
          var data = snap.exists ? snap.data() : null;
          var other = null;
          if (data && typeof data.json === 'string') { try { other = normalize(JSON.parse(data.json)); } catch (e) { other = null; } }
          if (other && other.updated > App.state.updated) {
            App.state = other;
            writeLocal();
            App.emit('replaced');
            if (hasProgress(other)) App.ui.toast({ icon: 'cloud', title: 'Progression récupérée', text: 'Ta progression enregistrée sur ton compte a été chargée.' });
          } else if (hasProgress(App.state) && (!other || App.state.updated > other.updated)) {
            pushRemote();
          }
          App.emit('storage');
        });
      });
    }).catch(function () { App.emit('storage'); });
  };
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { writeLocal(); if (remote.timer) { clearTimeout(remote.timer); pushRemote(); } }
  });

  App.replaceState = function (s) {
    App.state = s;
    App.state.updated = Date.now();
    writeLocal();
    scheduleRemote(0);
    App.emit('replaced');
  };
  App.resetState = function () { App.replaceState(fresh()); };
  App.exportJSON = function () {
    return JSON.stringify({ app: 'CodeQuest', exported: new Date().toISOString(), state: App.state }, null, 2);
  };
  App.importJSON = function (text) {
    var data = JSON.parse(text);
    var s = normalize(data && data.state ? data.state : data);
    if (!s) throw new Error("Ce fichier n'est pas une sauvegarde CodeQuest valide.");
    App.replaceState(s);
  };

  // Brouillons de code : commodité propre à cet appareil, jamais synchronisés.
  var drafts = {};
  try { drafts = JSON.parse(lsGet(DRAFTS) || '{}') || {}; } catch (e) { drafts = {}; }
  App.drafts = {
    get: function (id) { return drafts[id]; },
    set: function (id, code) {
      drafts[id] = code;
      var keys = Object.keys(drafts);
      if (keys.length > 120) delete drafts[keys[0]];
      lsSet(DRAFTS, JSON.stringify(drafts));
    },
    clear: function (id) { delete drafts[id]; lsSet(DRAFTS, JSON.stringify(drafts)); }
  };

  // ---------- Jours, temps, série ----------
  function today() {
    var k = dayKey();
    var d = App.state.days[k];
    if (!d) { d = App.state.days[k] = { xp: 0, sec: 0, ok: 0, ko: 0 }; pruneDays(); }
    return d;
  }
  function pruneDays() {
    var keys = Object.keys(App.state.days).sort();
    while (keys.length > 400) delete App.state.days[keys.shift()];
  }
  App.today = today;

  // Une journée active = au moins un exercice réussi. Un joker couvre un jour manqué (sans culpabiliser).
  function recordActive() {
    var s = App.state.streak, k = dayKey();
    if (s.last === k) return;
    if (!s.last) s.cur = 1;
    else {
      var gap = daysBetween(s.last, k) - 1;
      if (gap <= 0) s.cur += 1;
      else if (gap <= s.freezes) {
        for (var i = 1; i <= gap; i++) s.frozen.push(dayKey(dayStart(s.last) + i * DAY + 3600000));
        s.freezes -= gap;
        s.cur += 1;
        App.emit('freeze', gap);
      } else s.cur = 1;
    }
    if (s.frozen.length > 30) s.frozen = s.frozen.slice(-30);
    s.last = k;
    if (s.cur > s.best) s.best = s.cur;
    if (s.cur % 7 === 0 && s.freezes < 2) { s.freezes += 1; App.emit('freezeEarned'); }
  }
  // Série affichée : 0 si le dernier jour actif est trop ancien pour être couvert par les jokers.
  App.currentStreak = function () {
    var s = App.state.streak;
    if (!s.last) return 0;
    var gap = daysBetween(s.last, dayKey()) - 1;
    if (gap <= 0) return s.cur;
    return gap <= s.freezes ? s.cur : 0;
  };

  // Temps d'apprentissage actif : compté seulement pendant une activité pédagogique, page visible, sans inactivité > 90 s.
  var lastInput = Date.now(), ticks = 0;
  App.learning = null;
  ['pointerdown', 'keydown', 'input', 'wheel', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, function () { lastInput = Date.now(); }, { passive: true, capture: true }); });
  setInterval(function () {
    if (!App.learning || document.visibilityState !== 'visible' || Date.now() - lastInput > 90000) return;
    today().sec += 5;
    App.state.timeTotal += 5;
    if (++ticks % 6 === 0) App.save();
  }, 5000);

  // ---------- XP et niveaux ----------
  App.levelFloor = function (n) { return 25 * (n - 1) * (n + 2); };
  var TITLES = ['Hello World', 'Variable', 'Condition', 'Boucle', 'Fonction', 'Module', 'Objet', 'Algorithme', 'Architecture', 'Système', 'Compilateur', 'Noyau'];
  App.levelTitle = function (n) { return TITLES[Math.min(n, TITLES.length) - 1]; };
  App.levelInfo = function (xp) {
    xp = xp == null ? App.state.xp : xp;
    var n = 1;
    while (App.levelFloor(n + 1) <= xp) n++;
    var floor = App.levelFloor(n), next = App.levelFloor(n + 1);
    return { level: n, title: App.levelTitle(n), floor: floor, next: next, into: xp - floor, span: next - floor, pct: Math.round(100 * (xp - floor) / (next - floor)) };
  };
  App.gain = function (amount, reason) {
    if (!amount) return 0;
    var before = App.levelInfo().level;
    App.state.xp += amount;
    today().xp += amount;
    App.state.xpLog.push([Date.now(), amount, reason]);
    if (App.state.xpLog.length > 120) App.state.xpLog = App.state.xpLog.slice(-120);
    var after = App.levelInfo().level;
    App.emit('xp', amount);
    if (after > before) App.emit('levelup', after);
    return amount;
  };

  // Barème : uniquement après une réussite vérifiée. q = 2 du premier coup sans indice, 1 après erreur ou indice, 0 correction affichée.
  App.xpFor = function (ex, q, context) {
    if (!q) return 0;
    var first = !App.state.solved[ex.id];
    switch (context) {
      case 'lesson':
        if (ex.role === 'challenge') return first ? (q === 2 ? 20 : 12) : 3;
        return first ? (q === 2 ? 10 : 6) : 2;
      case 'review': case 'errors': return q === 2 ? 6 : 3;
      case 'kata': return first ? (q === 2 ? 15 : 8) : 2;
      case 'project': return first ? (q === 2 ? 20 : 12) : 0;
      case 'test': return q === 2 ? 4 : 0;
      case 'placement': return q === 2 ? 3 : 0;
      case 'daily': return q === 2 ? 15 : 8;
      case 'transfer': return q === 2 ? 6 : 3;
      default: return 0;
    }
  };

  function codeHasFunction(ex, code) {
    var src = code || ex.solution || '';
    if (ex.lang === 'python') return /^\s*def\s+\w+/m.test(src);
    if (ex.lang === 'javascript') return /function\s*\w*\s*\(|=>/.test(src);
    return false;
  }

  // Enregistre le résultat d'un exercice noté. Renvoie les XP gagnés.
  App.recordExercise = function (ex, o) {
    var st = App.state, d = today();
    var q = o.q;
    st.stats.attempts += 1;
    if (q === 2) st.stats.firstTry += 1;
    var xp = App.xpFor(ex, q, o.context);
    if (q > 0) {
      st.stats.solved += 1;
      d.ok += 1;
      recordActive();
      if (ex.type === 'bug') st.stats.bugs += 1;
      if (ex.type === 'code' && codeHasFunction(ex, o.code)) st.stats.functions += 1;
      if (ex.role === 'challenge' && o.context === 'lesson') st.stats.challenges += 1;
      if (!st.solved[ex.id]) st.solved[ex.id] = Date.now();
    } else {
      d.ko += 1;
    }
    if (q === 0 && !o.hadError) {
      App.noteError(ex, true); // correction affichée sans essai : la notion est à revoir
    } else if (st.errors[ex.id] && q === 2) {
      st.errors[ex.id].fixed = Date.now();
    }
    if (xp) App.gain(xp, o.context);
    App.checkAchievements();
    App.save();
    return xp;
  };
  // Chaque mauvaise réponse est notée tout de suite (même si la session est quittée ensuite).
  App.noteError = function (ex, quiet) {
    var st = App.state;
    st.stats.errors += 1;
    var e = st.errors[ex.id] || { t: 0, unit: ex.unitId || null, n: 0, fixed: null };
    e.t = Date.now(); e.n += 1; e.fixed = null;
    st.errors[ex.id] = e;
    pruneErrors();
    if (!quiet) App.save();
  };
  function pruneErrors() {
    var ids = Object.keys(App.state.errors);
    if (ids.length <= 150) return;
    ids.sort(function (a, b) { return App.state.errors[a].t - App.state.errors[b].t; });
    ids.slice(0, ids.length - 150).forEach(function (id) { delete App.state.errors[id]; });
  }

  // ---------- Révisions espacées ----------
  var INTERVALS = [0, 1, 3, 7, 14, 30];
  App.INTERVALS = INTERVALS;
  function addDays(n) {
    var d = new Date(); d.setHours(4, 0, 0, 0); // échéance en début de journée
    return d.getTime() + n * DAY;
  }
  App.concept = function (unitId) { return App.state.concepts[unitId] || null; };
  // kind : 'learn' (leçon), 'review' (révision), 'test' (évaluation réussie), 'placement'
  App.updateConcept = function (unitId, q, kind) {
    if (!unitId) return;
    var now = Date.now();
    var c = App.state.concepts[unitId] || { lvl: 0, last: null, next: null, ok: 0, ko: 0, rev: 0, h: [] };
    if (q > 0) c.ok += 1; else c.ko += 1;
    c.h.push([now, q, kind[0]]);
    if (c.h.length > 30) c.h = c.h.slice(-30);
    var due = !c.next || now >= c.next - 12 * 3600000;
    if (kind === 'learn') {
      c.lvl = Math.max(c.lvl, 1);
    } else if (kind === 'review') {
      if (q === 2 && due) { c.lvl = Math.min(5, c.lvl + 1); c.rev += 1; }
      else if (q === 0) c.lvl = Math.max(1, c.lvl - 2);
    } else if (kind === 'test' || kind === 'placement') {
      if (q > 0) c.lvl = Math.max(c.lvl, 2);
    }
    // Une erreur rapproche la révision ; une réussite partielle n'allonge pas l'intervalle.
    if (q === 0) c.next = addDays(1);
    else if (q === 1) c.next = addDays(INTERVALS[Math.max(1, c.lvl - 1)]);
    else if (kind === 'review' && !due && c.next) { /* révision en avance : on garde l'échéance */ }
    else c.next = addDays(INTERVALS[Math.max(1, c.lvl)]);
    c.last = now;
    App.state.concepts[unitId] = c;
    if (kind === 'review' && q > 0) App.state.stats.reviews += 1;
  };
  // À découvrir, en cours, en révision, acquise, maîtrisée durablement.
  App.conceptStatus = function (unitId) {
    var c = App.state.concepts[unitId];
    if (!c) return 'new';
    if (c.lvl >= 5 && c.rev >= 2) return 'durable';
    if (c.lvl >= 4) return 'acquired';
    if (c.lvl >= 2 || (c.next && Date.now() >= c.next)) return 'review';
    return 'learning';
  };
  App.isDue = function (unitId, at) {
    var c = App.state.concepts[unitId];
    return !!(c && c.next && (at || Date.now()) >= c.next);
  };

  // ---------- Succès ----------
  var ACH = [
    { id: 'first-lesson', title: 'Première leçon', text: 'Terminer une leçon.', icon: 'book', test: function (s) { return s.stats.lessons >= 1; } },
    { id: 'placement', title: 'Point de départ', text: 'Terminer le test de positionnement.', icon: 'compass', test: function (s) { return !!s.placement; } },
    { id: 'ten-ex', title: 'Dix sur dix', text: 'Réussir 10 exercices.', icon: 'check', test: function (s) { return s.stats.solved >= 10; } },
    { id: 'first-bug', title: 'Chasseur de bugs', text: 'Corriger un premier bug.', icon: 'shield', test: function (s) { return s.stats.bugs >= 1; } },
    { id: 'first-function', title: 'Première fonction', text: 'Écrire une fonction qui passe ses tests.', icon: 'code', test: function (s) { return s.stats.functions >= 1; } },
    { id: 'first-review', title: 'Mémoire longue', text: 'Réussir une première révision espacée.', icon: 'review', test: function (s) { return s.stats.reviews >= 1; } },
    { id: 'first-challenge', title: 'Défi relevé', text: 'Réussir un défi facultatif.', icon: 'bolt', test: function (s) { return s.stats.challenges >= 1; } },
    { id: 'perfect', title: 'Sans faute', text: 'Terminer une leçon sans erreur ni indice.', icon: 'star', test: function (s) { return s.stats.perfect >= 1; } },
    { id: 'daily', title: 'Défi du jour', text: 'Réussir un défi du jour.', icon: 'calendar', test: function (s) { return s.stats.dailies >= 1; } },
    { id: 'week', title: 'Semaine régulière', text: 'Pratiquer 7 jours d’affilée.', icon: 'flame', test: function (s) { return s.streak.best >= 7; } },
    { id: 'first-project', title: 'Premier projet', text: 'Terminer un projet guidé.', icon: 'projects', test: function (s) { return s.stats.projects >= 1; } },
    { id: 'kata', title: 'Main chaude', text: 'Réussir 5 katas.', icon: 'terminal', test: function (s) { return s.stats.katas >= 5; } },
    { id: 'fifty-ex', title: 'Cinquantaine', text: 'Réussir 50 exercices.', icon: 'target', test: function (s) { return s.stats.solved >= 50; } },
    { id: 'unit-mastered', title: 'Notion ancrée', text: 'Amener une notion au niveau « acquise » par les révisions.', icon: 'medal', test: function (s) { return Object.keys(s.concepts).some(function (k) { return s.concepts[k].lvl >= 4; }); } },
    { id: 'polyglot', title: 'Polyglotte', text: 'Terminer des leçons dans 3 parcours.', icon: 'layers', test: function (s) { var t = {}; Object.keys(s.lessons).forEach(function (id) { t[id.split('.')[0]] = 1; }); return Object.keys(t).length >= 3; } },
    { id: 'level-5', title: 'Niveau 5', text: 'Atteindre le niveau 5.', icon: 'trophy', test: function () { return App.levelInfo().level >= 5; } },
    { id: 'hundred-ex', title: 'Centurion', text: 'Réussir 100 exercices.', icon: 'trophy', test: function (s) { return s.stats.solved >= 100; } },
    { id: 'ten-hours', title: 'Dix heures', text: 'Cumuler 10 heures d’apprentissage actif.', icon: 'clock', test: function (s) { return s.timeTotal >= 36000; } }
  ];
  App.ACHIEVEMENTS = ACH;
  App.checkAchievements = function () {
    var s = App.state, fresh = [];
    ACH.forEach(function (a) {
      if (!s.achievements[a.id] && a.test(s)) { s.achievements[a.id] = Date.now(); fresh.push(a); }
    });
    fresh.forEach(function (a) { App.emit('achievement', a); });
    return fresh;
  };

  // Accents débloqués par niveau (éléments cosmétiques).
  App.ACCENTS = [
    { id: 'violet', name: 'Violet électrique', color: '#9b6bff', level: 1 },
    { id: 'bleu', name: 'Bleu lumineux', color: '#3fb6ff', level: 1 },
    { id: 'menthe', name: 'Menthe', color: '#35d6a6', level: 3 },
    { id: 'ambre', name: 'Ambre', color: '#ffb547', level: 5 },
    { id: 'corail', name: 'Corail', color: '#ff7a6b', level: 8 },
    { id: 'aurore', name: 'Aurore', color: '#e36bff', level: 12 }
  ];
  App.applyPrefs = function () {
    var p = App.state.prefs, root = document.documentElement;
    var acc = App.ACCENTS.filter(function (a) { return a.id === p.accent; })[0];
    if (!acc || acc.level > App.levelInfo().level) acc = App.ACCENTS[0];
    if (acc.id === 'violet') root.removeAttribute('data-accent'); else root.setAttribute('data-accent', acc.id);
    root.style.setProperty('--code-size', (p.codeSize || 14) + 'px');
    if (p.reduceMotion) root.setAttribute('data-reduce-motion', '1'); else root.removeAttribute('data-reduce-motion');
  };
})(App);
