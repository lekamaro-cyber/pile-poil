// Réviser : notions à échéance, erreurs, notions anciennes, session mixte. Intervalles de départ J+1, 3, 7, 14, 30.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  function pickExercises(units, perUnit, max) {
    var avoid = {}, out = [];
    units.forEach(function (uid) {
      M.pickForUnit(uid, perUnit, avoid).forEach(function (ex) { if (out.length < max && App.usable(ex)) { avoid[ex.id] = true; out.push(ex); } });
    });
    return out;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  App.reviewDue = function () {
    var due = M.dueUnits();
    App.startReview('due', pickExercises(due, due.length > 6 ? 1 : 2, 10), 'Notions à échéance');
  };
  App.reviewErrors = function (ids) {
    var list = (ids || M.openErrors()).map(function (id) { return M.ex[id]; }).filter(function (ex) { return ex && App.usable(ex); }).slice(0, 10);
    App.startReview('errors', list, 'Mes erreurs');
  };
  App.reviewMixed = function () {
    var due = M.dueUnits();
    var errs = M.openErrors().slice(0, 3).map(function (id) { return M.ex[id]; }).filter(Boolean);
    var known = Object.keys(App.state.concepts).filter(function (u) { return M.unit[u]; });
    var picks = pickExercises(shuffle(due).slice(0, 4), 1, 4);
    var seen = {}; picks.concat(errs).forEach(function (e) { seen[e.id] = true; });
    shuffle(known).forEach(function (uid) {
      if (picks.length + errs.length >= 8) return;
      M.pickForUnit(uid, 1, seen).forEach(function (ex) { if (App.usable(ex)) { seen[ex.id] = true; picks.push(ex); } });
    });
    App.startReview('mixed', shuffle(picks.concat(errs)).slice(0, 8), 'Session mixte');
  };
  App.reviewOld = function () {
    App.startReview('old', pickExercises(M.oldConcepts().slice(0, 5), 1, 6), 'Notions anciennes');
  };

  function actionCard(icon, title, count, text, label, fn, primary) {
    var empty = !count;
    return h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('div', { class: 'row', style: { gap: '10px' } }, h('span', { class: 'badge-icon', style: { width: '38px', height: '38px', background: 'var(--accent-soft)', color: 'var(--accent-strong)' } }, ui.icon(icon)), h('h3', null, title)), h('span', { class: 'num', style: { fontSize: '1.4rem', fontWeight: 650 } }, String(count))),
      h('p', { class: 'small muted' }, text),
      h('div', null, h('button', { class: 'btn ' + (primary && !empty ? 'btn-primary' : ''), disabled: empty, onclick: fn }, label)));
  }

  App.views.reviser = function () {
    var st = App.state;
    var known = Object.keys(st.concepts).filter(function (u) { return M.unit[u]; });
    var due = M.dueUnits();
    var errs = M.openErrors();
    var view = h('div', { class: 'view' },
      h('div', { class: 'view-head' }, h('div', null, h('h1', null, 'Réviser'),
        h('p', null, 'Chaque notion revient juste avant d’être oubliée : après 1 jour, puis 3, 7, 14 et 30 jours si tu réussis. Une erreur la fait revenir dès le lendemain. Une notion n’est jamais considérée comme maîtrisée après une seule bonne réponse.'))));
    if (!known.length) {
      view.appendChild(h('div', { class: 'empty' }, ui.icon('review'), h('strong', null, 'Aucune notion à réviser pour l’instant'), h('p', null, 'Termine une leçon ou passe le test de positionnement : les notions apparaîtront ici, avec leur date de révision.'),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn btn-primary', onclick: App.continueJourney }, 'Continuer mon parcours'))));
      return view;
    }
    view.appendChild(h('div', { class: 'grid grid-2' },
      actionCard('calendar', 'À échéance', due.length, due.length ? 'Les notions dont la date de révision est arrivée.' : 'Aucune notion n’est due. Reviens à la prochaine date prévue.', 'Lancer la révision', App.reviewDue, true),
      actionCard('x', 'Mes erreurs', errs.length, errs.length ? 'Les exercices ratés récemment, à refaire jusqu’à les réussir du premier coup.' : 'Aucune erreur en attente.', 'Revoir mes erreurs', function () { App.reviewErrors(); }, true),
      actionCard('layers', 'Session mixte', Math.min(8, known.length + errs.length), 'Un mélange de notions dues, d’erreurs et de notions déjà vues, pour une session de 10 à 15 minutes.', 'Lancer une session mixte', App.reviewMixed, false),
      actionCard('clock', 'Notions anciennes', Math.min(5, M.oldConcepts().length), 'Les notions revues il y a le plus longtemps, même si elles ne sont pas encore dues.', 'Réviser les plus anciennes', App.reviewOld, false)));

    // Calendrier des 7 prochains jours
    var up = M.upcoming(7);
    var maxC = Math.max.apply(null, up.map(function (d) { return d.count; }).concat([1]));
    var WD = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    view.appendChild(h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', null, 'Révisions prévues'), h('span', { class: 'small muted' }, '7 prochains jours')),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', alignItems: 'end', height: '120px' } }, up.map(function (d, i) {
        var dt = new Date(d.day);
        return h('div', { style: { display: 'grid', gap: '6px', justifyItems: 'center', alignContent: 'end', height: '100%' } },
          h('span', { class: 'tiny num muted' }, String(d.count)),
          h('div', { style: { width: '100%', maxWidth: '36px', height: Math.max(4, Math.round(70 * d.count / maxC)) + 'px', borderRadius: '6px', background: d.count ? (i === 0 ? 'var(--warn)' : 'var(--accent)') : 'var(--surface-3)' } }),
          h('span', { class: 'tiny muted' }, i === 0 ? 'auj.' : WD[dt.getDay()]));
      }))));

    // Liste des notions
    var rows = known.slice().sort(function (a, b) { return (st.concepts[a].next || 0) - (st.concepts[b].next || 0); });
    view.appendChild(h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', null, 'Tes notions'), h('span', { class: 'small muted' }, ui.plural(rows.length, 'notion'))),
      h('div', { style: { overflowX: 'auto' } }, h('table', { class: 'data-table' },
        h('thead', null, h('tr', null, ['Notion', 'État', 'Maîtrise', 'Réussites / erreurs', 'Dernière révision', 'Prochaine'].map(function (x) { return h('th', null, x); }))),
        h('tbody', null, rows.map(function (uid) {
          var c = st.concepts[uid], s = M.skillStatus(uid);
          return h('tr', null,
            h('td', null, h('div', { style: { fontWeight: 600 } }, M.unit[uid].title), h('div', { class: 'tiny muted' }, M.track[M.unit[uid].trackId].title)),
            h('td', null, h('span', { class: 'chip ' + M.SKILL_CHIP[s] }, M.SKILL_LABEL[s])),
            h('td', null, App.meter(c.lvl)),
            h('td', { class: 'num' }, c.ok + ' / ' + c.ko),
            h('td', null, ui.fmtDay(c.last)),
            h('td', null, App.isDue(uid) ? h('span', { class: 'chip chip-warn' }, 'maintenant') : ui.fmtDay(c.next)));
        }))))));

    if (errs.length) view.appendChild(App.errorsCard(errs.slice(0, 12)));
    return view;
  };

  App.errorsCard = function (ids) {
    return h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h3', null, 'Dernières erreurs'), h('button', { class: 'btn btn-sm', onclick: function () { App.reviewErrors(ids); } }, 'Tout refaire')),
      h('ul', { class: 'mini-list' }, ids.map(function (id) {
        var ex = M.ex[id], e = App.state.errors[id];
        return h('li', null,
          h('div', null, h('div', { class: 't', html: ui.md(String(ex.prompt).split('\n')[0].slice(0, 200)).replace(/<\/?p>/g, '') }), h('div', { class: 'tiny muted' }, (ex.unitId ? M.unitLabel(ex.unitId) + ' · ' : '') + App.TYPE_LABEL[ex.type] + ' · ' + ui.fmtDay(e.t) + (e.n > 1 ? ' · ' + e.n + ' erreurs' : ''))),
          h('button', { class: 'btn btn-sm', onclick: function () { App.reviewErrors([id]); } }, 'Refaire'));
      })));
  };
})(App);
