// Profil et paramètres : niveau, badges, personnalisation, objectifs, test, sauvegarde (export/import), honnêteté.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  function storageLine() {
    var mode = App.storageMode();
    var text = {
      account: 'Ta progression est enregistrée sur ton compte claude.ai : tu la retrouves sur tes autres appareils en ouvrant cette page.',
      local: 'Ta progression est enregistrée dans ce navigateur seulement. Exporte-la de temps en temps pour la garder en sécurité.',
      none: 'Aucune sauvegarde n’est possible ici : la progression sera perdue en fermant la page. Exporte-la en JSON avant de partir.'
    }[mode];
    var title = { account: 'Sauvegardée sur ton compte', local: 'Sauvegardée dans ce navigateur', none: 'Non sauvegardée' }[mode];
    return h('div', { class: 'notice ' + (mode === 'none' ? 'warn' : mode === 'account' ? 'ok' : '') }, h('span', { class: 'storage-dot ' + mode, style: { marginTop: '7px' } }),
      h('div', null, h('strong', null, title), h('div', { class: 'small' }, text),
        App.storage.error ? h('div', { class: 'small', style: { color: 'var(--warn)', marginTop: '4px' } }, App.storage.error) : null,
        App.storage.lastSave ? h('div', { class: 'tiny muted', style: { marginTop: '4px' } }, 'Dernier enregistrement : ' + new Date(App.storage.lastSave).toLocaleTimeString('fr-FR')) : null));
  }

  function exportData() {
    var json = App.exportJSON();
    var name = 'codequest-progression-' + App.dayKey() + '.json';
    var c = window.claude;
    var fallback = function () {
      var ta = h('textarea', { class: 'textarea', rows: '10', readonly: true, 'aria-label': 'Sauvegarde JSON' });
      ta.value = json;
      var close = ui.modal(h('div', { class: 'stack' }, h('h2', null, 'Exporter ma progression'),
        h('p', { class: 'small muted' }, 'Copie ce texte et colle-le dans un fichier « ' + name + ' » (Bloc-notes, VS Code…). Pour le restaurer : Profil, puis Importer.'),
        ta, h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
          h('button', { class: 'btn btn-ghost', onclick: function () { close(); } }, 'Fermer'),
          h('button', { class: 'btn btn-primary', onclick: function (e) { ui.copyText(json, ta).then(function (ok) { e.target.textContent = ok ? 'Copié' : 'Texte sélectionné : Ctrl+C'; }); } }, ui.icon('copy'), 'Copier'))), { wide: true, label: 'Exporter' });
    };
    if (c && typeof c.use === 'function') {
      c.use('downloads').then(function (d) {
        if (!d) return fallback();
        d.save({ filename: name, data: json }).then(function (r) {
          ui.toast({ icon: 'download', title: r && r.status === 'delivered' ? 'Fichier transmis' : 'Fichier enregistré', text: name });
        }, function (e) {
          if (e && e.code === 'declined') return;
          fallback();
        });
      }, fallback);
    } else fallback();
  }

  function importData() {
    var ta = h('textarea', { class: 'textarea', rows: '8', placeholder: 'Colle ici le contenu de ta sauvegarde JSON', 'aria-label': 'Sauvegarde JSON à importer' });
    var file = h('input', { type: 'file', accept: '.json,application/json', class: 'input', 'aria-label': 'Fichier de sauvegarde', onchange: function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var r = new FileReader(); r.onload = function () { ta.value = String(r.result || ''); }; r.readAsText(f);
    } });
    var msg = h('p', { class: 'small', role: 'alert' });
    var close = ui.modal(h('div', { class: 'stack' }, h('h2', null, 'Importer une progression'),
      h('p', { class: 'small muted' }, 'Choisis un fichier exporté depuis CodeQuest, ou colle son contenu. Ta progression actuelle sera remplacée.'),
      file, ta, msg,
      h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
        h('button', { class: 'btn btn-ghost', onclick: function () { close(); } }, 'Annuler'),
        h('button', { class: 'btn btn-primary', onclick: function () {
          try { App.importJSON(ta.value); close(); ui.toast({ icon: 'upload', title: 'Progression importée' }); App.rerender(); }
          catch (e) { msg.style.color = 'var(--err)'; msg.textContent = e instanceof SyntaxError ? 'Ce texte n’est pas du JSON valide.' : e.message; }
        } }, 'Importer'))), { wide: true, label: 'Importer' });
  }

  function setting(title, text, control) {
    return h('div', { class: 'setting' }, h('div', null, h('div', { style: { fontWeight: 600 } }, title), text ? h('div', { class: 'small muted' }, text) : null), control);
  }
  function seg(values, current, onPick, label) {
    return h('div', { class: 'segmented', role: 'group', 'aria-label': label }, values.map(function (v) {
      return h('button', { type: 'button', 'aria-pressed': String(current === v[0]), onclick: function () { onPick(v[0]); } }, v[1]);
    }));
  }
  function setPref(k, v) { App.state.prefs[k] = v; App.applyPrefs(); App.save(); App.rerender(); }

  App.views.profil = function () {
    var st = App.state, lv = App.levelInfo(), p = st.prefs;
    var badgesOn = App.ACHIEVEMENTS.filter(function (a) { return st.achievements[a.id]; }).length;
    var rate = App.successRate();

    var profile = h('div', { class: 'card' },
      h('div', { class: 'row', style: { gap: '20px', alignItems: 'center' } },
        h('div', { class: 'ring', style: { '--p': lv.pct, width: '92px', height: '92px' } }, h('span', { style: { width: '74px', height: '74px', fontSize: '1.6rem', fontFamily: 'var(--font-display)' } }, String(lv.level))),
        h('div', { class: 'stack', style: { gap: '4px' } },
          h('div', { class: 'eyebrow' }, 'Niveau ' + lv.level),
          h('h1', null, lv.title),
          h('div', { class: 'small muted num' }, st.xp + ' XP · ' + (lv.next - st.xp) + ' XP avant le niveau ' + (lv.level + 1)),
          h('div', { class: 'small muted' }, 'Depuis le ' + new Date(st.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · meilleure série : ' + st.streak.best + ' j · ' + badgesOn + ' / ' + App.ACHIEVEMENTS.length + ' badges'))),
      h('div', { class: 'stats', style: { marginTop: '18px' } },
        statTile(String(st.stats.solved), 'Exercices réussis'), statTile(rate == null ? '—' : rate + ' %', 'Du premier coup'),
        statTile(ui.fmtDuration(st.timeTotal), 'Temps actif'), statTile(String(App.masteredCount()), 'Compétences maîtrisées')));

    var badges = h('div', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', null, 'Badges'), h('span', { class: 'small muted' }, badgesOn + ' / ' + App.ACHIEVEMENTS.length)),
      h('div', { class: 'badges' }, App.ACHIEVEMENTS.map(function (a) {
        var on = !!st.achievements[a.id];
        return h('div', { class: 'badge' + (on ? ' on' : '') }, h('div', { class: 'badge-icon' }, ui.icon(on ? a.icon : 'lock')), h('div', null, h('div', { style: { fontWeight: 650, fontSize: '0.92rem' } }, a.title), h('div', { class: 'tiny muted' }, on ? 'Obtenu ' + ui.fmtDay(st.achievements[a.id]) : a.text)));
      })));

    var looks = h('div', { class: 'card' }, h('h2', null, 'Personnalisation'),
      setting('Couleur d’accent', 'De nouvelles couleurs se débloquent avec les niveaux.', h('div', { class: 'swatches' }, App.ACCENTS.map(function (a) {
        var locked = a.level > lv.level;
        return h('button', { class: 'swatch', type: 'button', disabled: locked, 'aria-pressed': String(p.accent === a.id), title: locked ? 'Niveau ' + a.level : a.name, onclick: function () { setPref('accent', a.id); } },
          h('i', { style: { background: a.color } }), locked ? 'Niv. ' + a.level : a.name.split(' ')[0]);
      }))),
      setting('Taille du code', null, seg([[13, 'S'], [14, 'M'], [16, 'L'], [18, 'XL']], p.codeSize, function (v) { setPref('codeSize', v); }, 'Taille du code')),
      setting('Réduire les animations', 'Les animations sont déjà réduites si ton système le demande.', h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!p.reduceMotion), 'aria-label': 'Réduire les animations', onclick: function () { setPref('reduceMotion', !p.reduceMotion); } })));

    var goals = h('div', { class: 'card' }, h('h2', null, 'Objectifs'),
      setting('Objectif quotidien', 'Durée d’apprentissage actif visée par jour.', seg([[15, '15 min'], [20, '20 min'], [30, '30 min']], p.goal, function (v) { setPref('goal', v); }, 'Objectif quotidien')),
      setting('Spécialisation', 'Dernière étape du chemin recommandé, après Python, HTML/CSS, JavaScript, Git et SQL.', seg([['ia', 'IA et data'], ['web', 'Web'], ['apps', 'Applications'], [null, 'Plus tard']], p.spec, function (v) { setPref('spec', v); }, 'Spécialisation')),
      setting('Test de positionnement', st.placement ? 'Passé ' + ui.fmtDay(st.placement.at) + '. Le refaire peut valider de nouvelles unités (jamais en retirer).' : 'Pas encore passé.', h('button', { class: 'btn', onclick: App.startPlacement }, ui.icon('compass'), st.placement ? 'Refaire le test' : 'Passer le test')));

    var data = h('div', { class: 'card stack' }, h('h2', null, 'Sauvegarde et données'),
      storageLine(),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: exportData }, ui.icon('download'), 'Exporter (JSON)'),
        h('button', { class: 'btn', onclick: importData }, ui.icon('upload'), 'Importer'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn btn-danger', onclick: function () {
          ui.confirmBox({ title: 'Effacer toute la progression ?', text: 'XP, leçons, révisions, badges et projets seront remis à zéro, ici et sur ton compte. Pense à exporter avant si tu veux pouvoir revenir en arrière.', confirm: 'Tout effacer', danger: true }).then(function (ok) {
            if (ok) { App.resetState(); App.applyPrefs(); ui.toast({ icon: 'reset', title: 'Progression effacée' }); App.go('accueil'); App.rerender(); }
          });
        } }, ui.icon('trash'), 'Réinitialiser')),
      h('p', { class: 'small muted' }, 'Aucun compte à créer, aucune donnée envoyée ailleurs, aucune clé d’API ni abonnement. Les brouillons de code restent sur cet appareil.'));

    var about = h('div', { class: 'card stack' }, h('h2', null, 'Comment fonctionne CodeQuest'),
      ui.mdEl('- **XP** : seulement après un exercice réussi et vérifié (10 du premier coup, 6 après une erreur ou un indice, 0 si tu affiches la correction ; défis, katas et projets rapportent plus). Refaire un exercice déjà réussi rapporte peu.\n- **Niveaux** : niveau 2 à 100 XP, 3 à 250, 4 à 450, 5 à 700, puis des paliers de plus en plus espacés.\n- **Série** : un jour compte dès qu’un exercice est réussi. Un joker couvre automatiquement un jour manqué ; tu en gagnes un tous les 7 jours (2 au maximum).\n- **Révisions** : chaque notion revient après 1, 3, 7, 14 puis 30 jours ; une erreur la ramène au lendemain.\n- **Exécution** : Python (MiniPy, sous-ensemble de Python 3), JavaScript (Worker isolé), HTML/CSS (rendu réel), SQL (SQLite) tournent vraiment. Les autres langages sont enseignés sans exécution, et c’est indiqué à chaque fois.'));

    return h('div', { class: 'view view-narrow' },
      h('div', { class: 'view-head' }, h('h1', null, 'Profil et paramètres')),
      profile, badges, goals, looks, data, about);
  };
  function statTile(v, k) { return h('div', { class: 'stat' }, h('div', { class: 'v' }, v), h('div', { class: 'k' }, k)); }
})(App);
