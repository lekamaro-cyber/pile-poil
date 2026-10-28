// Parcours : chemin recommandé, bibliothèque des parcours, détail d'un parcours (chapitres, unités, leçons).
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  function unitNode(uid, status, n) {
    var inner = status === 'locked' ? ui.icon('lock') : status === 'done' ? ui.icon('check') : status === 'mastered' ? ui.icon('star') : String(n);
    return h('span', { class: 'unit-node', 'aria-hidden': 'true' }, inner);
  }
  function statusChip(status) {
    var cls = { locked: '', available: 'chip-accent', progress: 'chip-info', done: 'chip-ok', mastered: 'chip-gold' }[status];
    return h('span', { class: 'chip ' + cls }, M.STATUS_LABEL[status]);
  }
  App.unitStatusChip = statusChip;

  function pathCard() {
    var stages = M.mainPath();
    var g = M.nextGoal();
    var currentId = g && g.stage ? g.stage.id : null;
    return h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('div', null, h('h2', null, 'Chemin recommandé'), h('p', { class: 'small muted', style: { marginTop: '4px' } }, 'Un ordre cohérent pour progresser sans te disperser. Les autres parcours restent ouverts dans la bibliothèque.')),
        App.state.placement ? null : h('button', { class: 'btn btn-sm', onclick: App.startPlacement }, ui.icon('compass'), 'Test de positionnement')),
      h('ol', { class: 'path-steps', style: { margin: 0, padding: 0, listStyle: 'none' } }, stages.map(function (s, i) {
        var cur = s.id === currentId;
        var right;
        if (s.spec && !s.total) right = h('button', { class: 'btn btn-sm', onclick: function () { App.go('profil'); } }, 'Choisir');
        else right = h('span', { class: 'small muted num' }, s.done + ' / ' + s.total);
        return h('li', { class: 'path-step' + (s.complete ? ' done' : cur ? ' current' : '') },
          h('span', { class: 'path-dot' }, s.complete ? ui.icon('check') : String(i + 1)),
          h('div', { style: { minWidth: 0 } }, h('div', { style: { fontWeight: 650 } }, s.title), s.total ? h('div', { class: 'bar thin', style: { marginTop: '6px', maxWidth: '320px' } }, h('i', { style: { width: Math.round(100 * s.done / s.total) + '%' } })) : h('div', { class: 'tiny muted' }, 'IA et data, web, ou applications')),
          right);
      })));
  }

  function trackCard(t, reco) {
    var p = M.trackProgress(t.id);
    var lessons = 0; t.units.forEach(function (u) { lessons += u.lessons.length; });
    var missing = (t.requires || []).filter(function (r) { return M.unit[r] && !M.unitDone(r); });
    var chip;
    if (reco) chip = h('span', { class: 'chip chip-accent' }, 'Recommandé maintenant');
    else if (p.done === p.total && p.total) chip = h('span', { class: 'chip chip-ok' }, 'Terminé');
    else if (M.trackStarted(t.id)) chip = h('span', { class: 'chip chip-info' }, 'En cours');
    else if (missing.length) chip = h('span', { class: 'chip' }, ui.icon('lock'), 'Prérequis : ' + M.unit[missing[0]].title);
    else chip = h('span', { class: 'chip' }, 'Plus tard');
    return h('button', { class: 'track-card' + (reco ? ' reco' : ''), onclick: function () { App.go('parcours-' + t.id); } },
      h('div', { class: 'row-between' }, h('span', { class: 'lang-tag', 'data-t': t.id }, M.trackTag(t.id)), chip),
      h('div', null, h('h3', null, t.title), h('p', { class: 'small muted', style: { marginTop: '4px' } }, t.summary)),
      h('div', { class: 'bar thin' }, h('i', { style: { width: p.pct + '%' } })),
      h('div', { class: 'row-between small muted' }, h('span', { class: 'num' }, p.done + ' / ' + p.total + ' unités'), h('span', null, ui.plural(lessons, 'leçon'))));
  }

  App.views.parcours = function () {
    var reco = M.recommendedTrackIds();
    return h('div', { class: 'view' },
      h('div', { class: 'view-head' }, h('div', null, h('h1', null, 'Parcours'), h('p', null, 'Chapitres, unités et leçons courtes. Chaque unité se débloque quand la précédente est terminée, ou validée par une évaluation si tu la maîtrises déjà.'))),
      pathCard(),
      h('div', { class: 'stack' }, h('h2', null, 'Bibliothèque des parcours'),
        h('div', { class: 'track-grid' }, M.tracks.map(function (t) { return trackCard(t, reco.indexOf(t.id) !== -1); }))));
  };

  // ---------- Détail d'un parcours ----------
  var openUnit = null;
  App.views.track = function (tid) {
    var t = M.track[tid];
    if (!t) return App.views.parcours();
    var p = M.trackProgress(tid);
    var missing = (t.requires || []).filter(function (r) { return M.unit[r] && !M.unitDone(r); });
    var g = M.nextGoal();
    if (!openUnit || M.unit[openUnit] && M.unit[openUnit].trackId !== tid) {
      openUnit = null;
      if (g && g.unitId && M.unit[g.unitId].trackId === tid) openUnit = g.unitId;
      else { var firstOpen = t.units.filter(function (u) { var s = M.unitStatus(u.id); return s === 'available' || s === 'progress'; })[0]; openUnit = firstOpen ? firstOpen.id : null; }
    }
    var view = h('div', { class: 'view view-narrow' },
      h('div', null, h('button', { class: 'btn btn-sm btn-ghost', onclick: function () { App.go('parcours'); } }, ui.icon('arrowLeft'), 'Tous les parcours')),
      h('div', { class: 'row', style: { gap: '16px', alignItems: 'flex-start', flexWrap: 'nowrap' } },
        h('span', { class: 'lang-tag', 'data-t': t.id, style: { minWidth: '52px', height: '52px', fontSize: '0.95rem' } }, M.trackTag(t.id)),
        h('div', { class: 'stack', style: { gap: '6px', minWidth: 0 } }, h('h1', null, t.title), h('p', { class: 'muted' }, t.why || t.summary),
          h('div', { class: 'row small muted' }, h('span', { class: 'num' }, p.done + ' / ' + p.total + ' unités terminées'), h('div', { class: 'bar thin', style: { width: '160px' } }, h('i', { style: { width: p.pct + '%' } }))))),
      missing.length ? h('div', { class: 'notice warn' }, ui.icon('lock'), h('div', null, 'Ce parcours s’appuie sur ', missing.map(function (r, i) { return [i ? ', ' : '', h('a', { href: '#parcours-' + M.unit[r].trackId }, M.unitLabel(r))]; }), '. Termine ou valide ' + (missing.length > 1 ? 'ces unités' : 'cette unité') + ' pour l’ouvrir.')) : null,
      t.unlock === 'chapter' ? h('div', { class: 'notice' }, ui.icon('info'), h('div', null, 'Chaque chapitre est indépendant : commence par le langage qui t’intéresse. Ces langages ne s’exécutent pas dans CodeQuest : les leçons utilisent la lecture, la prédiction, les trous et la détection de bugs, et indiquent comment essayer sur ta machine.')) : null);

    var n = 0;
    t.chapters.forEach(function (ch) {
      var done = ch.units.filter(function (u) { return M.unitDone(u.id); }).length;
      var units = h('div', { class: 'units' });
      ch.units.forEach(function (u) {
        n += 1;
        var status = M.unitStatus(u.id);
        var expanded = openUnit === u.id;
        var btn = h('button', { class: 'unit-btn', 'aria-expanded': String(expanded), onclick: function () { openUnit = expanded ? null : u.id; App.rerender(); } },
          h('div', { class: 'row-between' }, h('span', { class: 't' }, u.title), statusChip(status)),
          h('span', { class: 'small muted' }, u.summary));
        var row = h('div', { class: 'unit-row', 'data-s': status }, unitNode(u.id, status, n), btn, h('span'));
        units.appendChild(row);
        if (expanded) units.appendChild(h('div', { class: 'unit-row', 'data-s': status, style: { paddingTop: 0 } }, h('span'), unitPanel(u, status), h('span')));
      });
      view.appendChild(h('section', { class: 'chapter' },
        h('div', { class: 'chapter-head' }, h('h2', null, ch.title), h('span', { class: 'small muted num' }, done + ' / ' + ch.units.length)),
        units));
    });
    return view;
  };

  function unitPanel(u, status) {
    var missing = M.missingRequires(u.id);
    var prev = M.previousUnit(u.id);
    var c = App.concept(u.id);
    var panel = h('div', { class: 'stack', style: { gap: '8px' } });
    if (status === 'locked') {
      var why = missing.length ? 'Prérequis : ' + missing.map(M.unitLabel).join(', ') + '.' : prev ? 'Termine d’abord « ' + prev.title + ' », ou valide cette unité par l’évaluation si tu la maîtrises déjà.' : '';
      panel.appendChild(h('div', { class: 'notice' }, ui.icon('lock'), h('div', null, why)));
    }
    u.lessons.forEach(function (l, i) {
      var done = M.lessonDone(l.id);
      var canStart = status !== 'locked';
      panel.appendChild(h('div', { class: 'lesson-row' },
        h('span', { class: 'lang-tag sm', style: done ? { color: 'var(--ok)' } : null }, done ? ui.icon('check') : String(i + 1)),
        h('div', { class: 't' }, h('div', { style: { fontWeight: 600 } }, l.title), h('div', { class: 'tiny muted' }, (l.minutes || 6) + ' min · ' + ui.md(l.objective).replace(/<[^>]+>/g, ''))),
        canStart ? h('button', { class: 'btn btn-sm ' + (done ? '' : 'btn-primary'), onclick: function () { App.startLesson(l.id); } }, done ? 'Revoir' : 'Commencer') : null));
    });
    var foot = h('div', { class: 'row', style: { marginTop: '4px' } });
    if (M.canTestOut(u.id)) foot.appendChild(h('button', { class: 'btn btn-sm', onclick: function () { App.startUnitTest(u.id); } }, ui.icon('target'), 'Je connais déjà : passer l’évaluation'));
    if (M.unitDone(u.id) && c) foot.appendChild(h('span', { class: 'small muted' }, 'Révision : ' + ui.fmtDay(c.next) + ' · ', App.meter(c.lvl)));
    if (App.state.units[u.id]) foot.appendChild(h('span', { class: 'chip chip-ok' }, App.state.units[u.id].via === 'placement' ? 'Validée par le test de positionnement' : 'Validée par évaluation'));
    if (foot.children.length) panel.appendChild(foot);
    return panel;
  }
})(App);
