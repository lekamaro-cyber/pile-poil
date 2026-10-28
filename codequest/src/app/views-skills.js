// Compétences : chaque unité est une compétence, dont l'état vient des exercices réussis et des révisions.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;
  var tab = 'toutes';
  var TABS = [['toutes', 'Toutes'], ['acquises', 'Acquises'], ['lacunes', 'Lacunes'], ['erreurs', 'Dernières erreurs'], ['objectifs', 'Prochains objectifs'], ['projets', 'Projets terminés']];

  function skillCard(uid) {
    var u = M.unit[uid], c = App.concept(uid), s = M.skillStatus(uid);
    return h('div', { class: 'skill-card' },
      h('div', { class: 'row-between', style: { alignItems: 'flex-start', flexWrap: 'nowrap' } }, h('span', { class: 't' }, u.title), h('span', { class: 'chip ' + M.SKILL_CHIP[s] }, M.SKILL_LABEL[s])),
      h('div', { class: 'row-between small muted' }, App.meter(c ? c.lvl : 0), c ? h('span', { class: 'num' }, c.ok + ' réussite' + (c.ok > 1 ? 's' : '') + ' · ' + c.ko + ' erreur' + (c.ko > 1 ? 's' : '')) : h('span', null, M.STATUS_LABEL[M.unitStatus(uid)])),
      c && c.next ? h('div', { class: 'tiny muted' }, App.isDue(uid) ? 'Révision due maintenant' : 'Prochaine révision ' + ui.fmtDay(c.next)) : null);
  }
  function legend() {
    var counts = { new: 0, learning: 0, review: 0, acquired: 0, durable: 0 };
    M.allUnits.forEach(function (u) { counts[M.skillStatus(u.id)] += 1; });
    return h('div', { class: 'row', style: { gap: '8px' } }, Object.keys(counts).map(function (k) {
      return h('span', { class: 'chip ' + M.SKILL_CHIP[k] }, M.SKILL_LABEL[k] + ' · ' + counts[k]);
    }));
  }
  function gaps() {
    var out = [];
    Object.keys(App.state.concepts).forEach(function (uid) {
      var c = App.state.concepts[uid];
      if (!M.unit[uid]) return;
      var recentKo = c.h.slice(-4).filter(function (x) { return x[1] === 0; }).length;
      if (c.ko > c.ok || recentKo >= 1 || (c.lvl <= 1 && c.ko > 0)) out.push(uid);
    });
    var pl = App.state.placement;
    if (pl) window.CQ.placementSkills.forEach(function (s) {
      if ((pl.skills[s.id] || 0) < 2) (s.units || []).forEach(function (uid) { if (M.unit[uid] && !M.unitDone(uid) && out.indexOf(uid) === -1) out.push(uid); });
    });
    return out;
  }

  App.views.competences = function () {
    var view = h('div', { class: 'view' },
      h('div', { class: 'view-head' }, h('div', null, h('h1', null, 'Compétences'), h('p', null, 'Une compétence progresse avec les exercices réussis et les révisions espacées, jamais avec les pages ouvertes. « Acquise » demande trois révisions réussies à des jours différents ; « maîtrisée durablement », une réussite de plus après deux semaines d’intervalle.'))),
      legend(),
      h('div', { class: 'segmented', role: 'tablist', 'aria-label': 'Filtre' }, TABS.map(function (t) { return h('button', { type: 'button', role: 'tab', 'aria-pressed': String(tab === t[0]), 'aria-selected': String(tab === t[0]), onclick: function () { tab = t[0]; App.rerender(); } }, t[1]); })));

    if (tab === 'toutes') {
      M.tracks.forEach(function (t) {
        view.appendChild(h('section', { class: 'stack' },
          h('div', { class: 'row', style: { gap: '10px' } }, h('span', { class: 'lang-tag sm', 'data-t': t.id }, M.trackTag(t.id)), h('h2', null, t.title), h('span', { class: 'small muted num' }, M.trackProgress(t.id).done + ' / ' + t.units.length)),
          h('div', { class: 'grid grid-auto' }, t.units.map(function (u) { return skillCard(u.id); }))));
      });
    } else if (tab === 'acquises') {
      var acq = M.allUnits.filter(function (u) { var s = M.skillStatus(u.id); return s === 'acquired' || s === 'durable'; }).map(function (u) { return u.id; });
      view.appendChild(acq.length ? h('div', { class: 'grid grid-auto' }, acq.map(skillCard)) : h('div', { class: 'empty' }, ui.icon('medal'), h('strong', null, 'Pas encore de compétence acquise'), h('p', null, 'Une notion devient acquise après plusieurs révisions espacées réussies (environ 2 semaines après la leçon). C’est voulu : une seule bonne réponse ne prouve pas la maîtrise.')));
    } else if (tab === 'lacunes') {
      var g = gaps();
      view.appendChild(g.length ? h('div', { class: 'stack' }, h('p', { class: 'muted small' }, 'Notions avec des erreurs récentes, plus d’erreurs que de réussites, ou signalées par le test de positionnement.'),
        h('div', { class: 'grid grid-auto' }, g.map(skillCard)),
        h('div', null, h('button', { class: 'btn btn-primary', onclick: App.reviewMixed }, 'Lancer une session de révision'))) : h('div', { class: 'empty' }, ui.icon('check'), h('strong', null, 'Aucune lacune repérée pour l’instant'), h('p', null, 'Elles apparaîtront ici dès qu’une notion te pose problème.')));
    } else if (tab === 'erreurs') {
      var errs = M.openErrors();
      view.appendChild(errs.length ? App.errorsCard(errs.slice(0, 20)) : h('div', { class: 'empty' }, ui.icon('check'), h('strong', null, 'Aucune erreur en attente'), h('p', null, 'Les exercices ratés apparaissent ici jusqu’à ce que tu les réussisses du premier coup.')));
    } else if (tab === 'objectifs') {
      var goal = M.nextGoal();
      var upcoming = [];
      M.mainPath().forEach(function (s) { s.units.forEach(function (uid) { if (!M.unitDone(uid) && upcoming.length < 6) upcoming.push(uid); }); });
      view.appendChild(h('div', { class: 'card stack' },
        h('h3', null, 'Prochains objectifs'),
        goal && goal.unitId ? h('p', { class: 'muted' }, 'En cours : « ' + M.unit[goal.unitId].title + ' » (' + M.track[M.unit[goal.unitId].trackId].title + ').') : null,
        upcoming.length ? h('ol', { class: 'mini-list' }, upcoming.map(function (uid, i) {
          var st = M.unitStatus(uid);
          return h('li', null, h('span', { class: 'lang-tag sm', 'data-t': M.unit[uid].trackId }, String(i + 1)), h('div', null, h('div', { class: 't' }, M.unit[uid].title), h('div', { class: 'tiny muted' }, M.track[M.unit[uid].trackId].title)), App.unitStatusChip(st));
        })) : h('p', { class: 'muted' }, 'Le chemin conseillé est terminé.'),
        h('div', null, h('button', { class: 'btn btn-primary', onclick: App.continueJourney }, 'Continuer mon parcours'))));
    } else if (tab === 'projets') {
      var done = window.CQ.projects.filter(function (p) { var s = App.state.projects[p.id]; return s && s.finished; });
      view.appendChild(done.length ? h('ul', { class: 'mini-list' }, done.map(function (p) {
        return h('li', null, App.langTag(p.lang), h('div', null, h('div', { class: 't' }, p.title), h('div', { class: 'tiny muted' }, 'Terminé ' + ui.fmtDay(App.state.projects[p.id].finished))), h('button', { class: 'btn btn-sm', onclick: function () { App.go(App.projectHash(p)); } }, 'Ouvrir'));
      })) : h('div', { class: 'empty' }, ui.icon('projects'), h('strong', null, 'Aucun projet terminé pour l’instant'), h('div', null, h('button', { class: 'btn btn-primary', onclick: function () { App.go('projets'); } }, 'Voir les projets'))));
    }
    return view;
  };
})(App);
