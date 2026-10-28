// Projets : bibliothèque classée par difficulté, et construction pas à pas (étapes vérifiées ou à faire sur sa machine).
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;
  var DIFF = { 1: 'Débutant', 2: 'Intermédiaire', 3: 'Avancé', 4: 'Expert' };
  var diffFilter = 0;
  var currentStep = {};

  App.projectHash = function (p) { return 'projet-' + p.id.replace(/^pj\./, '').replace(/[^a-zA-Z0-9-]/g, '-'); };
  App.projectFromHash = function (slug) {
    return window.CQ.projects.filter(function (p) { return App.projectHash(p) === 'projet-' + slug; })[0] || null;
  };

  function pState(p) { return App.state.projects[p.id]; }
  function stepDone(p, i) {
    var s = pState(p), step = p.steps[i];
    if (!s) return false;
    if (step.ex) return !!(s.solved && s.solved[i]);
    var c = (s.checks && s.checks[i]) || [];
    return step.checklist.every(function (_, k) { return !!c[k]; });
  }
  function progress(p) { var n = 0; p.steps.forEach(function (_, i) { if (stepDone(p, i)) n++; }); return n; }
  function skillsReady(p) { return p.skills.filter(function (u) { return !M.unit[u] || M.unitDone(u); }).length; }
  function langTag(lang) { return App.langTag(lang); }

  function card(p) {
    var s = pState(p), n = progress(p), ready = skillsReady(p);
    var chip = s && s.finished ? h('span', { class: 'chip chip-ok' }, ui.icon('check'), 'Terminé') : s ? h('span', { class: 'chip chip-info' }, 'En cours · ' + n + '/' + p.steps.length) : ready === p.skills.length ? h('span', { class: 'chip chip-accent' }, 'Prêt') : h('span', { class: 'chip' }, ready + '/' + p.skills.length + ' compétences');
    return h('button', { class: 'project-card', onclick: function () { App.go(App.projectHash(p)); } },
      h('div', { class: 'row-between' }, langTag(p.lang), chip),
      h('h3', null, p.title),
      h('p', { class: 'small muted' }, p.summary),
      h('div', { class: 'row small muted' }, App.diffBars(p.difficulty), DIFF[p.difficulty], '·', ui.plural(p.steps.length, 'étape')));
  }

  App.views.projets = function () {
    var list = window.CQ.projects.slice().sort(function (a, b) { return a.difficulty - b.difficulty; });
    var view = h('div', { class: 'view' },
      h('div', { class: 'view-head' }, h('div', null, h('h1', null, 'Projets'), h('p', null, 'De vrais petits logiciels, construits étape par étape. Chaque étape est vérifiée par des tests quand le code peut tourner ici ; sinon elle se fait sur ta machine avec une liste de critères.')),
        h('div', { class: 'segmented', role: 'group', 'aria-label': 'Difficulté' }, [0, 1, 2, 3, 4].map(function (d) { return h('button', { type: 'button', 'aria-pressed': String(diffFilter === d), onclick: function () { diffFilter = d; App.rerender(); } }, d ? DIFF[d] : 'Tous'); }))));
    if (!list.length) { view.appendChild(h('div', { class: 'empty' }, 'La bibliothèque de projets n’est pas chargée.')); return view; }
    [1, 2, 3, 4].forEach(function (d) {
      if (diffFilter && diffFilter !== d) return;
      var group = list.filter(function (p) { return p.difficulty === d; });
      if (!group.length) return;
      view.appendChild(h('section', { class: 'stack' }, h('div', { class: 'row', style: { gap: '10px' } }, h('h2', null, DIFF[d]), App.diffBars(d)), h('div', { class: 'grid grid-auto' }, group.map(card))));
    });
    return view;
  };

  App.views.project = function (p) {
    App.learning = 'project';
    var s = pState(p);
    if (currentStep[p.id] == null) {
      var firstOpen = p.steps.map(function (_, i) { return i; }).filter(function (i) { return !stepDone(p, i); })[0];
      currentStep[p.id] = firstOpen == null ? p.steps.length - 1 : firstOpen;
    }
    var idx = currentStep[p.id];
    var step = p.steps[idx];
    var n = progress(p);

    function ensureState() {
      if (!App.state.projects[p.id]) App.state.projects[p.id] = { started: Date.now(), solved: {}, checks: {}, finished: null };
      return App.state.projects[p.id];
    }
    function maybeFinish() {
      var st = ensureState();
      if (st.finished) return;
      if (p.steps.every(function (_, i) { return stepDone(p, i); })) {
        st.finished = Date.now();
        App.state.stats.projects += 1;
        var verified = p.steps.filter(function (x) { return x.ex; }).length;
        if (verified) App.gain(50, 'project');
        App.checkAchievements();
        App.save();
        ui.toast({ icon: 'trophy', gold: true, title: 'Projet terminé : ' + p.title, text: verified ? '+50 XP. La solution complète et la variante sont débloquées.' : 'La solution complète et la variante sont débloquées.' });
      }
    }

    var stepsNav = h('ol', { class: 'steps-list' }, p.steps.map(function (st, i) {
      var done = stepDone(p, i);
      return h('li', { class: done ? 'done' : '' }, h('button', { type: 'button', 'aria-current': i === idx ? 'step' : null, onclick: function () { currentStep[p.id] = i; App.rerender(); } },
        h('span', { class: 'n' }, done ? ui.icon('check') : String(i + 1)),
        h('span', { style: { minWidth: 0 } }, h('span', { style: { display: 'block', fontWeight: 600 } }, st.title), h('span', { class: 'tiny muted' }, st.ex ? 'Vérifiée par des tests' : 'Sur ta machine')),
        ui.icon('chevronRight')));
    }));
    stepsNav.querySelectorAll('.n svg').forEach(function (x) { x.style.width = '16px'; x.style.height = '16px'; });

    var stepPanel = h('div', { class: 'stack', style: { gap: '14px' } },
      h('div', null, h('div', { class: 'eyebrow' }, 'Étape ' + (idx + 1) + ' sur ' + p.steps.length), h('h2', { style: { marginTop: '4px' } }, step.title)),
      ui.mdEl(step.explain));
    if (step.ex) {
      if (stepDone(p, idx)) stepPanel.appendChild(h('div', { class: 'notice ok' }, ui.icon('check'), h('div', null, 'Étape validée par les tests. Tu peux la refaire ci-dessous ou passer à la suite.')));
      stepPanel.appendChild(App.inlineExercise(step.ex, {
        context: 'project', roleLabel: 'Étape du projet', draftKey: undefined,
        onFinish: function (out) {
          if (out.q > 0) { var st = ensureState(); st.solved[idx] = Date.now(); App.save(); maybeFinish(); }
        },
        continueLabel: idx < p.steps.length - 1 ? 'Étape suivante' : 'Voir le bilan',
        onContinue: function () { currentStep[p.id] = Math.min(p.steps.length - 1, idx + 1); App.rerender(); window.scrollTo(0, 0); }
      }));
    } else {
      var st0 = pState(p);
      var checks = (st0 && st0.checks && st0.checks[idx]) || [];
      stepPanel.appendChild(h('div', { class: 'notice' }, ui.icon('practice'), h('div', null, 'À faire sur ta machine : ce code ne peut pas tourner dans CodeQuest. Coche chaque critère quand il est rempli. Ces étapes ne rapportent pas d’XP : elles servent à suivre ton avancement.')));
      stepPanel.appendChild(h('div', { class: 'stack', style: { gap: '8px' } }, step.checklist.map(function (c, k) {
        var id = 'chk-' + p.id.replace(/\W/g, '') + '-' + idx + '-' + k;
        return h('label', { class: 'check-row', for: id }, h('input', { type: 'checkbox', id: id, checked: !!checks[k], onchange: function (e) {
          var st = ensureState(); st.checks[idx] = st.checks[idx] || []; st.checks[idx][k] = e.target.checked; App.save(); maybeFinish(); App.rerender();
        } }), h('span', { html: ui.md(c).replace(/<\/?p>/g, '') }));
      })));
      if (step.code) stepPanel.appendChild(ui.codeWithHead(step.code, step.lang || p.lang));
      stepPanel.appendChild(h('div', { class: 'row' }, idx > 0 ? h('button', { class: 'btn btn-ghost', onclick: function () { currentStep[p.id] = idx - 1; App.rerender(); } }, ui.icon('arrowLeft'), 'Étape précédente') : null,
        h('span', { class: 'spacer' }), idx < p.steps.length - 1 ? h('button', { class: 'btn btn-primary', onclick: function () { currentStep[p.id] = idx + 1; App.rerender(); window.scrollTo(0, 0); } }, 'Étape suivante', ui.icon('arrowRight')) : null));
    }

    var finished = s && s.finished;
    var solutionBox = h('div', { class: 'card stack' },
      h('div', { class: 'row-between' }, h('h3', null, 'Solution expliquée'), finished ? h('span', { class: 'chip chip-ok' }, 'Débloquée') : null),
      finished ? null : h('p', { class: 'small muted' }, 'Elle se débloque à la fin du projet. Tu peux l’afficher avant, mais construire toi-même est ce qui te fait progresser.'),
      h('div', { id: 'pj-solution' }, finished ? solutionContent(p) : h('button', { class: 'btn', onclick: function () {
        ui.confirmBox({ title: 'Afficher la solution complète ?', text: 'Essaie d’abord les étapes : chaque étape a un indice et sa propre correction. Tu pourras toujours revenir aux étapes après.', confirm: 'Afficher la solution' }).then(function (ok) {
          if (ok) { var box = document.getElementById('pj-solution'); if (box) box.replaceChildren(solutionContent(p)); }
        });
      } }, ui.icon('eye'), 'Afficher quand même')));

    var ready = skillsReady(p);
    return h('div', { class: 'view' },
      h('div', null, h('button', { class: 'btn btn-sm btn-ghost', onclick: function () { App.go('projets'); } }, ui.icon('arrowLeft'), 'Tous les projets')),
      h('div', { class: 'row', style: { gap: '14px', alignItems: 'flex-start', flexWrap: 'nowrap' } }, langTag(p.lang),
        h('div', { class: 'stack', style: { gap: '6px', minWidth: 0 } }, h('h1', null, p.title), h('p', { class: 'muted' }, p.summary),
          h('div', { class: 'row small muted' }, App.diffBars(p.difficulty), DIFF[p.difficulty], '·', n + ' / ' + p.steps.length + ' étapes'))),
      h('div', { class: 'grid grid-2' },
        h('div', { class: 'card stack' }, h('h3', null, 'Résultat attendu'), ui.mdEl(p.result)),
        h('div', { class: 'card stack' }, h('div', { class: 'row-between' }, h('h3', null, 'Compétences nécessaires'), h('span', { class: 'small muted num' }, ready + ' / ' + p.skills.length)),
          h('div', { class: 'row', style: { gap: '6px' } }, p.skills.map(function (u) {
            if (!M.unit[u]) return null;
            var ok = M.unitDone(u);
            return h('a', { class: 'chip ' + (ok ? 'chip-ok' : ''), href: '#parcours-' + M.unit[u].trackId, title: M.unitLabel(u) }, ok ? ui.icon('check') : null, M.unit[u].title);
          })),
          ready < p.skills.length ? h('p', { class: 'small muted' }, 'Tu peux commencer quand même : les étapes rappellent ce qu’il faut savoir.') : null)),
      h('div', { class: 'project-layout' }, h('div', { class: 'stack' }, h('div', { class: 'bar' }, h('i', { style: { width: Math.round(100 * n / p.steps.length) + '%' } })), stepsNav), stepPanel),
      solutionBox,
      h('div', { class: 'card stack' }, h('h3', null, 'Pour aller plus loin'), ui.mdEl(p.variant)));
  };

  function solutionContent(p) {
    return h('div', { class: 'stack' }, ui.codeBlock(p.solution.code, p.lang), ui.mdEl(p.solution.explain));
  }
})(App);
