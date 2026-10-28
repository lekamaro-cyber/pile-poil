// Test de positionnement adaptatif : pour chaque compétence, niveau 1, puis 2 (et 3) si la réponse est juste.
// Une compétence est « acquise » si le niveau 2 est réussi : ses unités sont validées, l'apprenant passe à la suite.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model, CQ = window.CQ;

  App.startPlacement = function () {
    var skills = CQ.placementSkills.slice();
    var bySkill = {};
    CQ.placement.forEach(function (it) { (bySkill[it.skill] = bySkill[it.skill] || {})[it.level] = it; });
    skills = skills.filter(function (s) { return bySkill[s.id] && bySkill[s.id][1]; });
    if (!skills.length) { ui.toast({ icon: 'warning', title: 'Test indisponible', text: 'Les questions du test ne sont pas chargées.' }); return; }

    var score = {}; // id -> niveau le plus haut réussi (0 à 3)
    var cursor = { skill: 0, level: 1 };
    var asked = 0;

    var intro = { kind: 'content', cta: 'Commencer le test', render: function () {
      return h('div', { class: 'stack', style: { gap: '18px' } },
        h('div', { class: 'eyebrow' }, 'Test de positionnement'),
        h('h1', null, 'Faisons le point sur tes bases'),
        ui.mdEl('Ce test s’adapte à tes réponses : chaque notion commence par une question simple, puis passe à une question plus difficile si tu réussis. Il mélange **prédiction de résultat**, **QCM**, **code à corriger** et **petits programmes à écrire**, exécutés pour de vrai.\n\n- ' + skills.length + ' notions : ' + skills.map(function (s) { return s.title.toLowerCase(); }).join(', ') + '.\n- Entre ' + skills.length + ' et ' + (skills.length * 2 + 4) + ' questions, environ 15 minutes, sans chronomètre.\n- Une seule tentative par question, et une explication après chaque réponse.\n- Le bouton « Je ne sais pas » est là pour ça : mieux vaut l’utiliser que deviner.'),
        h('div', { class: 'notice' }, ui.icon('info'), h('div', null, 'Quelques questions donnent une indication, pas une mesure précise de ton niveau. Les notions validées ici reviendront en révision pour confirmer qu’elles sont solides.')));
    } };

    function current() { return skills[cursor.skill]; }
    function nextItem() {
      while (cursor.skill < skills.length) {
        var s = current(), it = bySkill[s.id][cursor.level];
        if (it) return it;
        cursor.skill += 1; cursor.level = 1;
      }
      return null;
    }

    var session = {
      kind: 'placement', context: 'placement', oneShot: true, steps: [intro],
      progressTotal: function () { return skills.length; },
      progressIndex: function () { return Math.min(cursor.skill, skills.length); },
      next: function () {
        if (session.done) return null;
        var it = nextItem();
        if (!it) { session.done = true; return { kind: 'content', cta: 'Voir mon bilan', render: specChoice }; }
        asked += 1;
        var sk = current();
        return { kind: 'exercise', ex: it.ex, item: it, label: sk.title + ' · niveau ' + it.level };
      },
      afterExercise: function (step, out) {
        var it = step.item;
        if (!it) return;
        if (out.q > 0) {
          score[it.skill] = Math.max(score[it.skill] || 0, it.level);
          cursor.level += 1;
        } else {
          score[it.skill] = score[it.skill] || 0;
          cursor.skill += 1; cursor.level = 1;
        }
      },
      result: function () { return bilan(); },
      resultActions: function () {
        return [
          { label: 'Voir le parcours', fn: function () { App.player.close(true); App.go('parcours'); } },
          { label: 'Commencer mon parcours', fn: function () { App.player.close(true); App.continueJourney(); } }
        ];
      }
    };

    var specPick = App.state.prefs.spec;
    function specChoice() {
      var opts = [['ia', 'IA et data science'], ['web', 'Développement web'], ['apps', 'Applications'], ['', 'Je ne sais pas encore']];
      var group = h('div', { class: 'choices' });
      function draw() {
        group.replaceChildren.apply(group, opts.map(function (o, i) {
          var spec = M.SPECS[o[0]];
          return h('button', { class: 'choice', type: 'button', 'aria-pressed': String((specPick || '') === o[0]), onclick: function () { specPick = o[0] || null; draw(); } },
            h('span', { class: 'key' }, String(i + 1)), h('span', null, h('strong', null, o[1]), spec ? h('span', { class: 'small muted', style: { display: 'block' } }, spec.text) : h('span', { class: 'small muted', style: { display: 'block' } }, 'Tu pourras choisir plus tard dans ton profil.')));
        }));
      }
      draw();
      return h('div', { class: 'stack', style: { gap: '16px' } },
        h('div', { class: 'eyebrow' }, 'Dernière question, sans note'),
        h('h2', null, 'Quelle spécialisation t’attire le plus ?'),
        h('p', { class: 'muted' }, 'Le chemin conseillé passe d’abord par Python, HTML/CSS, JavaScript, Git et SQL. Ta réponse choisit la dernière étape. Tu peux la changer quand tu veux.'),
        group);
    }

    function bilan() {
      var st = App.state;
      if (!session.recorded) {
        session.recorded = true;
        st.prefs.spec = specPick || null;
        var validated = [];
        skills.forEach(function (s) {
          if ((score[s.id] || 0) >= 2) {
            (s.units || []).forEach(function (uid) {
              if (!M.unit[uid] || M.unitDone(uid)) return;
              st.units[uid] = { via: 'placement', at: Date.now() };
              App.updateConcept(uid, 2, 'placement');
              validated.push(uid);
            });
          }
        });
        st.placement = { at: Date.now(), skills: score, asked: asked, validated: validated };
        App.checkAchievements();
        App.save();
      }
      var p = st.placement;
      function label(n, s) {
        var max = bySkill[s.id][3] ? 3 : 2;
        if (n >= 2) return ['Acquis', 'chip-ok', n === max ? 'Toutes les questions réussies, y compris la plus difficile.' : 'Les bases et l’approfondissement sont réussis.'];
        if (n === 1) return ['À consolider', 'chip-warn', 'Les bases sont là ; la question plus poussée a coincé.'];
        return ['À travailler', 'chip-err', 'Commence par les leçons de cette notion.'];
      }
      var goal = M.nextGoal();
      var strong = skills.filter(function (s) { return (score[s.id] || 0) >= 2; });
      var weak = skills.filter(function (s) { return (score[s.id] || 0) < 2; });
      return h('div', { class: 'stack', style: { gap: '20px' } },
        h('div', null, h('div', { class: 'eyebrow' }, 'Ton bilan'), h('h1', null, strong.length + ' notion' + (strong.length > 1 ? 's' : '') + ' acquise' + (strong.length > 1 ? 's' : '') + ' sur ' + skills.length)),
        h('div', { class: 'card' }, h('ul', { class: 'mini-list' }, skills.map(function (s) {
          var lb = label(score[s.id] || 0, s);
          return h('li', null, h('div', null, h('div', { class: 't' }, s.title), h('div', { class: 'tiny muted' }, lb[2])), h('span', { class: 'chip ' + lb[1] }, lb[0]));
        }))),
        p.validated.length ? h('div', { class: 'notice ok' }, ui.icon('check'), h('div', null, h('strong', null, ui.plural(p.validated.length, 'unité validée', 'unités validées') + ' : '), p.validated.map(function (u) { return M.unit[u].title; }).join(', ') + '. Tu n’as pas à les refaire ; elles reviendront en révision.')) : null,
        weak.length ? h('div', { class: 'notice' }, ui.icon('target'), h('div', null, h('strong', null, 'À travailler en priorité : '), weak.map(function (s) { return s.title.toLowerCase(); }).join(', ') + '.')) : null,
        h('div', { class: 'card' }, h('div', { class: 'eyebrow', style: { marginBottom: '8px' } }, 'Parcours recommandé'),
          h('ol', { class: 'path-steps', style: { margin: 0, padding: 0, listStyle: 'none' } }, M.mainPath().map(function (s, i) {
            var cur = goal && goal.stage && goal.stage.id === s.id;
            return h('li', { class: 'path-step' + (s.complete ? ' done' : cur ? ' current' : '') }, h('span', { class: 'path-dot' }, s.complete ? ui.icon('check') : String(i + 1)), h('div', null, h('div', { style: { fontWeight: 650 } }, s.title), h('div', { class: 'tiny muted' }, s.total ? s.done + ' / ' + s.total + ' unités' : 'À choisir')), cur ? h('span', { class: 'chip chip-accent' }, 'Tu commences ici') : h('span'));
          }))),
        h('p', { class: 'small muted' }, 'Ce bilan repose sur ' + p.asked + ' questions : c’est une indication pour bien démarrer, pas une mesure précise de ton niveau. Tu peux refaire le test depuis ton profil.'));
    }

    App.player.open(session);
  };
})(App);
