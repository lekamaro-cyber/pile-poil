// Accueil : tableau de bord calculé uniquement à partir des actions réelles.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;
  App.views = App.views || {};

  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  App.continueJourney = function () {
    var g = M.nextGoal();
    if (!App.state.placement && App.state.xp === 0 && !Object.keys(App.state.lessons).length) { App.startPlacement(); return; }
    if (!g) { App.go('parcours'); return; }
    if (g.needSpec) { App.go('profil'); ui.toast({ icon: 'compass', title: 'Choisis ta spécialisation', text: 'Dans « Objectifs », pour continuer le chemin conseillé.' }); return; }
    if (g.lesson) App.startLesson(g.lesson.id);
    else App.go('parcours-' + M.unit[g.unitId].trackId);
  };

  function stat(v, k, extra) {
    return h('div', { class: 'stat' }, h('div', { class: 'v' }, v, extra ? h('small', null, extra) : null), h('div', { class: 'k' }, k));
  }
  function successRate() {
    var s = App.state.stats;
    return s.attempts ? Math.round(100 * s.firstTry / s.attempts) : null;
  }
  App.successRate = successRate;
  function masteredCount() {
    return Object.keys(App.state.concepts).filter(function (u) { var s = App.conceptStatus(u); return s === 'acquired' || s === 'durable'; }).length;
  }
  App.masteredCount = masteredCount;

  function heatmap() {
    var weeks = 26, cells = [];
    var end = new Date(); end.setHours(0, 0, 0, 0);
    var start = new Date(end); start.setDate(end.getDate() - end.getDay() - (weeks - 1) * 7);
    var max = 1;
    Object.keys(App.state.days).forEach(function (k) { max = Math.max(max, App.state.days[k].ok || 0); });
    var grid = h('div', { class: 'heat', role: 'img', 'aria-label': 'Activité des ' + weeks + ' dernières semaines' });
    for (var d = new Date(start); d <= end || d.getDay() !== 0; d.setDate(d.getDate() + 1)) {
      if (d > end) { grid.appendChild(h('i', { 'data-l': 'x' })); continue; }
      var k = App.dayKey(d), day = App.state.days[k];
      var n = day ? day.ok : 0;
      var lvl = n === 0 ? 0 : n < max * 0.34 ? 1 : n < max * 0.67 ? 2 : 3;
      grid.appendChild(h('i', { 'data-l': String(lvl), title: k + ' : ' + n + ' exercice' + (n > 1 ? 's' : '') + ' réussi' + (n > 1 ? 's' : '') }));
      cells.push(n);
    }
    var activeDays = Object.keys(App.state.days).filter(function (k) { return App.state.days[k].ok > 0; }).length;
    return h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', null, 'Activité'), h('span', { class: 'small muted' }, ui.plural(activeDays, 'jour actif', 'jours actifs') + ' au total')),
      grid,
      h('div', { class: 'row small muted', style: { marginTop: '10px', gap: '6px' } }, 'Moins', [0, 1, 2, 3].map(function (l) { return h('i', { style: { width: '11px', height: '11px', borderRadius: '3px', display: 'inline-block', background: l === 0 ? 'var(--surface-3)' : l === 3 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) ' + (l === 1 ? 35 : 60) + '%, var(--surface-3))' } }); }), 'Plus'));
  }

  function weekStrip() {
    var wrap = h('div', { class: 'week' });
    var d = new Date(); d.setHours(12, 0, 0, 0);
    var monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    var frozen = App.state.streak.frozen || [];
    var todayK = App.dayKey();
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (lbl, i) {
      var day = new Date(monday); day.setDate(monday.getDate() + i);
      var k = App.dayKey(day), rec = App.state.days[k];
      var cls = rec && rec.ok > 0 ? 'on' : frozen.indexOf(k) !== -1 ? 'frozen' : '';
      wrap.appendChild(h('div', null, h('b', { class: cls + (k === todayK ? ' today' : ''), title: k }, cls === 'on' ? ui.icon('check') : cls === 'frozen' ? ui.icon('shield') : String(day.getDate())), lbl));
    });
    wrap.querySelectorAll('b svg').forEach(function (s) { s.style.width = '14px'; s.style.height = '14px'; });
    return wrap;
  }

  function dailyCard() {
    var d = M.dailyChallenge();
    if (!d) {
      return h('div', { class: 'card' }, h('div', { class: 'card-head' }, h('h3', null, 'Défi du jour')), h('p', { class: 'muted small' }, 'Le défi du jour apparaît dès que des énigmes ou des leçons sont disponibles.'));
    }
    var done = App.state.daily[App.dayKey()] && App.state.daily[App.dayKey()].done;
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'Défi du jour'), done ? h('span', { class: 'chip chip-ok' }, ui.icon('check'), 'Réussi') : h('span', { class: 'chip chip-accent' }, '+15 XP')),
      h('p', { class: 'small muted' }, App.TYPE_LABEL[d.ex.type] + (d.ex.unitId ? ' · ' + M.unitLabel(d.ex.unitId) : ' · logique')),
      h('div', { class: 'small', style: { color: 'var(--fg-2)' }, html: ui.md(String(d.ex.prompt).split('\n')[0].slice(0, 160)) }),
      h('div', null, h('button', { class: 'btn ' + (done ? '' : 'btn-primary'), onclick: App.startDaily }, done ? 'Le refaire (sans XP)' : 'Relever le défi')));
  }

  function goalCard() {
    var goalMin = App.state.prefs.goal || 20;
    var today = App.state.days[App.dayKey()] || { sec: 0, ok: 0 };
    var mins = Math.floor(today.sec / 60);
    var pct = Math.min(100, Math.round(100 * mins / goalMin));
    var streak = App.currentStreak();
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'Aujourd’hui'), h('span', { class: 'small muted' }, 'Objectif : ' + goalMin + ' min')),
      h('div', { class: 'row', style: { gap: '16px', flexWrap: 'nowrap' } },
        h('div', { class: 'ring', style: { '--p': pct }, role: 'img', 'aria-label': mins + ' minutes sur ' + goalMin }, h('span', null, mins + '′')),
        h('div', { class: 'stack', style: { gap: '2px' } },
          h('div', { style: { fontWeight: 650 } }, pct >= 100 ? 'Objectif atteint' : mins ? 'Encore ' + (goalMin - mins) + ' min pour l’objectif' : 'Pas encore de session aujourd’hui'),
          h('div', { class: 'small muted' }, today.ok + ' exercice' + (today.ok > 1 ? 's' : '') + ' réussi' + (today.ok > 1 ? 's' : '') + ' aujourd’hui'))),
      h('hr', { class: 'divider' }),
      h('div', { class: 'row-between' }, h('div', { class: 'row', style: { gap: '6px' } }, ui.icon('flame'), h('strong', { class: 'num' }, streak), h('span', { class: 'small muted' }, 'jour' + (streak > 1 ? 's' : '') + ' de série')),
        h('span', { class: 'small muted', title: 'Un joker couvre automatiquement un jour sans pratique. Tu en gagnes un tous les 7 jours de série (2 au maximum).' }, ui.plural(App.state.streak.freezes, 'joker'))),
      weekStrip());
  }

  function nextGoalCard(g) {
    if (!g) return h('div', { class: 'card' }, h('h3', null, 'Prochain objectif'), h('p', { class: 'muted small', style: { marginTop: '8px' } }, 'Tout le chemin conseillé est terminé. Explore la bibliothèque des parcours.'));
    if (g.needSpec) {
      return h('div', { class: 'card stack' }, h('h3', null, 'Prochain objectif'), h('p', { class: 'muted small' }, 'Choisis ta spécialisation pour la dernière étape du chemin : IA et data, web ou applications.'), h('div', null, h('button', { class: 'btn btn-primary', onclick: function () { App.go('profil'); } }, 'Choisir')));
    }
    var target = M.unit[g.target], reach = M.unit[g.unitId];
    var stage = g.stage;
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'Prochain objectif'), h('span', { class: 'lang-tag sm', 'data-t': target.trackId }, M.trackTag(target.trackId))),
      h('div', null, h('div', { style: { fontWeight: 650 } }, 'Terminer « ' + target.title + ' »'), h('div', { class: 'small muted' }, M.track[target.trackId].title + (stage && stage.total ? ' · étape « ' + stage.title + ' » : ' + stage.done + ' / ' + stage.total + ' unités' : ''))),
      stage && stage.total ? h('div', { class: 'bar' }, h('i', { style: { width: Math.round(100 * stage.done / stage.total) + '%' } })) : null,
      g.unitId !== g.target ? h('p', { class: 'small muted' }, 'Prérequis d’abord : « ' + reach.title + ' » (' + M.track[reach.trackId].title + ').') : null);
  }

  function projectsQuick() {
    var st = App.state.projects;
    var list = window.CQ.projects.slice();
    var inProgress = list.filter(function (p) { return st[p.id] && !st[p.id].finished; });
    var ready = list.filter(function (p) { return !st[p.id] && p.skills.every(function (u) { return !M.unit[u] || M.unitDone(u); }); });
    var show = inProgress.concat(ready).slice(0, 3);
    if (!show.length) show = list.slice().sort(function (a, b) { return a.difficulty - b.difficulty; }).slice(0, 3);
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'Mes projets'), h('button', { class: 'btn btn-sm btn-ghost', onclick: function () { App.go('projets'); } }, 'Tous les projets', ui.icon('arrowRight'))),
      show.length ? h('div', { class: 'stack', style: { gap: '8px' } }, show.map(function (p) {
        var s = st[p.id];
        var doneSteps = s ? Object.keys(s.solved || {}).length : 0;
        return h('button', { class: 'mini-row', onclick: function () { App.go(App.projectHash(p)); } },
          h('span', { class: 'lang-tag sm', 'data-t': p.lang === 'python' ? 'py' : p.lang === 'html' ? 'web' : 'js' }, p.lang === 'python' ? 'py' : p.lang === 'html' ? '</>' : 'js'),
          h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 650 } }, p.title), h('div', { class: 'tiny muted' }, s ? (s.finished ? 'Terminé' : 'En cours · ' + doneSteps + ' / ' + p.steps.length + ' étapes') : 'Prêt à démarrer')),
          ui.icon('chevronRight'));
      })) : h('p', { class: 'muted small' }, 'La bibliothèque de projets n’est pas chargée.'));
  }

  function dueCard() {
    var due = M.dueUnits();
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'À réviser'), h('span', { class: 'chip ' + (due.length ? 'chip-warn' : '') }, String(due.length))),
      due.length ? h('ul', { class: 'mini-list' }, due.slice(0, 4).map(function (uid) {
        var c = App.concept(uid);
        return h('li', null, h('div', null, h('div', { class: 't' }, M.unit[uid].title), h('div', { class: 'tiny muted' }, M.track[M.unit[uid].trackId].title + ' · prévue ' + ui.fmtDay(c.next))), App.meter(c.lvl));
      })) : h('p', { class: 'muted small' }, Object.keys(App.state.concepts).length ? 'Rien d’échu. Prochaine révision : ' + nextReviewText() + '.' : 'Les notions apparaîtront ici quelques jours après tes leçons, au bon moment pour les ancrer.'),
      due.length ? h('div', null, h('button', { class: 'btn btn-primary', onclick: function () { App.go('reviser'); } }, 'Réviser maintenant')) : null);
  }
  function nextReviewText() {
    var nexts = Object.keys(App.state.concepts).map(function (u) { return App.state.concepts[u].next; }).filter(Boolean).sort();
    return nexts.length ? ui.fmtDay(nexts[0]) : '—';
  }

  App.views.accueil = function () {
    var st = App.state, now = new Date();
    var isNew = !st.placement && st.xp === 0 && !Object.keys(st.lessons).length;
    var lv = App.levelInfo();
    var g = M.nextGoal();
    var hour = now.getHours();
    var hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir';
    var rate = successRate();
    var todaySec = (st.days[App.dayKey()] || {}).sec || 0;

    var head = h('div', { class: 'view-head' },
      h('div', null, h('div', { class: 'eyebrow' }, DAYS[now.getDay()] + ' ' + now.getDate() + ' ' + MONTHS[now.getMonth()]),
        h('h1', null, isNew ? 'Bienvenue sur CodeQuest' : hello + '.'),
        h('p', null, 'Apprends à coder. Construis pour de vrai.')),
      null);

    var hero;
    if (isNew) {
      hero = h('div', { class: 'hero' },
        h('div', { class: 'card continue' },
          h('div', { class: 'eyebrow' }, 'Pour commencer'),
          h('h2', null, 'Un test de positionnement d’environ 15 minutes'),
          h('p', { class: 'muted', style: { maxWidth: '58ch' } }, 'Tu as déjà des bases en Python : inutile de tout refaire. Le test s’adapte à tes réponses, valide ce que tu maîtrises et te propose un parcours sur mesure. Prédictions, QCM, bugs à corriger et petits programmes exécutés pour de vrai.'),
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-primary btn-lg', onclick: App.startPlacement }, ui.icon('compass'), 'Passer le test'),
            h('button', { class: 'btn btn-ghost', onclick: function () { var l = M.nextLessonInUnit('py.u1'); if (l) App.startLesson(l.id); else App.go('parcours'); } }, 'Commencer au début de Python'))),
        h('div', { class: 'card level-card' },
          h('div', { class: 'eyebrow' }, 'Ton niveau'),
          h('div', { class: 'row', style: { alignItems: 'baseline', gap: '12px' } }, h('span', { class: 'level-num num' }, '1'), h('span', { class: 'level-title' }, lv.title)),
          h('div', { class: 'bar' }, h('i', { style: { width: '0%' } })),
          h('p', { class: 'small muted' }, '0 / ' + lv.next + ' XP pour le niveau 2. Les XP ne s’obtiennent qu’en réussissant des exercices.')));
    } else {
      var lessonLine = g && g.lesson ? [M.track[M.unit[g.unitId].trackId].title, M.unit[g.unitId].title] : [];
      hero = h('div', { class: 'hero' },
        h('div', { class: 'card continue' },
          h('div', { class: 'path-line' }, g && g.unitId ? h('span', { class: 'lang-tag sm', 'data-t': M.unit[g.unitId].trackId }, M.trackTag(M.unit[g.unitId].trackId)) : null, lessonLine.join(' / ')),
          h('h2', null, g && g.lesson ? g.lesson.title : g && g.needSpec ? 'Choisis ta spécialisation' : 'Explore la bibliothèque'),
          g && g.lesson ? h('p', { class: 'muted' }, ui.md(g.lesson.objective).replace(/<[^>]+>/g, '')) : null,
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-primary btn-lg', onclick: App.continueJourney }, ui.icon('play'), 'Continuer mon parcours'),
            g && g.lesson ? h('span', { class: 'small muted' }, 'Environ ' + (g.lesson.minutes || 6) + ' min') : null)),
        h('div', { class: 'card level-card' },
          h('div', { class: 'eyebrow' }, 'Niveau'),
          h('div', { class: 'row', style: { alignItems: 'baseline', gap: '12px' } }, h('span', { class: 'level-num num' }, String(lv.level)), h('span', { class: 'level-title' }, lv.title)),
          h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(lv.span), 'aria-valuenow': String(lv.into) }, h('i', { style: { width: lv.pct + '%' } })),
          h('p', { class: 'small muted num' }, lv.into + ' / ' + lv.span + ' XP vers le niveau ' + (lv.level + 1))));
    }

    var stats = h('div', { class: 'stats' },
      stat(String(st.xp), 'XP gagnés'),
      stat(String(App.currentStreak()), 'Série quotidienne', 'j'),
      stat(String(st.stats.lessons), 'Leçons terminées'),
      stat(ui.fmtDuration(st.timeTotal), 'Temps d’apprentissage', todaySec && todaySec < st.timeTotal ? 'dont ' + ui.fmtDuration(todaySec) + ' auj.' : null),
      stat(rate == null ? '—' : rate + ' %', 'Réussite du premier coup'),
      stat(String(masteredCount()), 'Compétences maîtrisées'),
      stat(String(M.dueUnits().length), 'Notions à réviser'),
      stat(String(st.stats.solved), 'Exercices réussis'));

    var view = h('div', { class: 'view' }, head, hero, stats);
    if (isNew) view.appendChild(h('p', { class: 'small muted', style: { marginTop: '-8px' } }, 'Tout est à zéro : ces chiffres viendront uniquement de ce que tu fais dans l’appli.'));
    view.appendChild(h('div', { class: 'grid grid-3' }, dailyCard(), goalCard(), nextGoalCard(g)));
    view.appendChild(h('div', { class: 'grid grid-2' }, dueCard(), projectsQuick()));
    view.appendChild(heatmap());
    return view;
  };
})(App);
