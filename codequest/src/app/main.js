// Navigation, routage par ancre (#accueil, #parcours-py…), barre latérale, démarrage.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  var NAV = [
    { id: 'accueil', label: 'Accueil', icon: 'home' },
    { id: 'parcours', label: 'Parcours', icon: 'path' },
    { id: 'reviser', label: 'Réviser', icon: 'review', badge: function () { return M.dueUnits().length; } },
    { id: 'pratique', label: 'Pratique', icon: 'practice' },
    { id: 'projets', label: 'Projets', icon: 'projects' },
    { id: 'competences', label: 'Compétences', icon: 'skills' },
    { id: 'profil', label: 'Profil et paramètres', short: 'Profil', icon: 'profile' }
  ];
  var MOBILE = ['accueil', 'parcours', 'reviser', 'pratique'];

  function currentRoute() {
    var r = (location.hash || '').replace(/^#/, '');
    return r || 'accueil';
  }
  function section(route) {
    if (route.indexOf('parcours') === 0) return 'parcours';
    if (route.indexOf('projet') === 0) return 'projets';
    return route;
  }
  App.go = function (route) {
    if (location.hash === '#' + route) { App.rerender(); return; }
    location.hash = route;
  };

  function renderNav() {
    var sec = section(currentRoute());
    var nav = document.getElementById('nav');
    nav.replaceChildren.apply(nav, NAV.map(function (n) {
      var b = n.badge ? n.badge() : 0;
      return h('button', { class: 'nav-item', type: 'button', 'aria-current': sec === n.id ? 'page' : null, onclick: function () { if (n.id === 'pratique') App.resetPracticeView(); App.go(n.id); } },
        ui.icon(n.icon), h('span', null, window.innerWidth < 1100 && n.short ? n.short : n.label), b ? h('span', { class: 'nav-badge', 'aria-label': b + ' à réviser' }, String(b)) : null);
    }));
    var tab = document.getElementById('tabbar');
    var inMore = MOBILE.indexOf(sec) === -1;
    tab.replaceChildren.apply(tab, MOBILE.map(function (id) {
      var n = NAV.filter(function (x) { return x.id === id; })[0];
      var b = n.badge ? n.badge() : 0;
      return h('button', { class: 'tab', type: 'button', 'aria-current': sec === id ? 'page' : null, onclick: function () { if (id === 'pratique') App.resetPracticeView(); App.go(id); } }, ui.icon(n.icon), n.short || n.label, b ? h('span', { class: 'nav-badge' }, String(b)) : null);
    }).concat([h('button', { class: 'tab', type: 'button', 'aria-current': inMore ? 'page' : null, 'aria-haspopup': 'dialog', onclick: openMore }, ui.icon('more'), 'Plus')]));

    var lv = App.levelInfo();
    var foot = document.getElementById('side-foot');
    var mode = App.storageMode();
    foot.replaceChildren(
      h('div', { class: 'row' }, h('span', { class: 'level-title' }, 'Niv. ' + lv.level + ' · ' + lv.title)),
      h('div', { class: 'bar thin' }, h('i', { style: { width: lv.pct + '%' } })),
      h('div', { class: 'row small muted', style: { justifyContent: 'space-between' } },
        h('span', { class: 'row', style: { gap: '4px' } }, ui.icon('flame'), h('span', { class: 'num' }, String(App.currentStreak()) + ' j')),
        h('span', { class: 'num' }, App.state.xp + ' XP')),
      h('div', { class: 'row tiny muted', style: { gap: '6px', flexWrap: 'nowrap' }, title: { account: 'Progression sauvegardée sur ton compte', local: 'Progression sauvegardée dans ce navigateur', none: 'Progression non sauvegardée : exporte-la' }[mode] },
        h('span', { class: 'storage-dot ' + mode }), { account: 'Sauvegardé sur ton compte', local: 'Sauvegardé dans ce navigateur', none: 'Non sauvegardé' }[mode]));
    foot.querySelectorAll('svg').forEach(function (s) { s.style.width = '15px'; s.style.height = '15px'; });
  }

  function openMore() {
    var close = ui.modal(h('div', { class: 'stack' }, h('h2', null, 'Plus'),
      h('div', { class: 'sheet-list' }, NAV.filter(function (n) { return MOBILE.indexOf(n.id) === -1; }).map(function (n) {
        return h('button', { class: 'mini-row', onclick: function () { close(); App.go(n.id); } }, ui.icon(n.icon), h('span', { style: { flex: 1, fontWeight: 600 } }, n.label), ui.icon('chevronRight'));
      })),
      h('button', { class: 'btn btn-ghost', onclick: function () { close(); } }, 'Fermer')), { label: 'Plus de sections' });
    document.querySelectorAll('#modal .mini-row svg').forEach(function (s) { s.style.width = '20px'; s.style.height = '20px'; });
  }

  var lastRoute = null;
  App.rerender = function () {
    var route = currentRoute();
    var main = document.getElementById('main');
    var view;
    try {
      if (!App.player.isOpen()) App.learning = null;
      if (route.indexOf('parcours-') === 0) view = App.views.track(route.slice(9));
      else if (route.indexOf('projet-') === 0) { var p = App.projectFromHash(route.slice(7)); view = p ? App.views.project(p) : App.views.projets(); }
      else if (App.views[route] && route !== 'track' && route !== 'project') view = App.views[route]();
      else view = App.views.accueil();
    } catch (e) {
      console.error(e);
      view = h('div', { class: 'view' }, h('div', { class: 'notice warn' }, ui.icon('warning'), h('div', null, 'Cet écran n’a pas pu s’afficher : ' + e.message)));
    }
    var y = route === lastRoute ? window.scrollY : 0;
    main.replaceChildren(view);
    if (route !== lastRoute) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    else window.scrollTo(0, y);
    lastRoute = route;
    renderNav();
    document.title = 'CodeQuest';
  };

  window.addEventListener('hashchange', function () { if (App.player.isOpen()) App.player.close(); App.rerender(); });
  window.addEventListener('resize', (function () { var t; return function () { clearTimeout(t); t = setTimeout(renderNav, 150); }; })());
  App.on('route', App.rerender);
  App.on('replaced', function () { App.applyPrefs(); App.rerender(); });
  App.on('storage', renderNav);
  App.on('change', function () { if (App.player.isOpen()) return; renderNav(); });

  App.on('achievement', function (a) { ui.toast({ icon: a.icon, gold: true, title: 'Badge obtenu : ' + a.title, text: a.text }); });
  App.on('freeze', function (n) { ui.toast({ icon: 'shield', title: 'Série préservée', text: ui.plural(n, 'joker utilisé', 'jokers utilisés') + ' pour ' + ui.plural(n, 'jour manqué', 'jours manqués') + '.' }); });
  App.on('freezeEarned', function () { ui.toast({ icon: 'shield', title: 'Joker gagné', text: '7 jours de série : un jour manqué sera couvert automatiquement.' }); });
  App.on('levelup', function (n) {
    App.applyPrefs();
    var unlocked = App.ACCENTS.filter(function (a) { return a.level === n; });
    setTimeout(function () {
      var close = ui.modal(h('div', { class: 'stack level-up' },
        h('div', { class: 'eyebrow' }, 'Niveau supérieur'),
        h('div', { class: 'level-num num' }, String(n)),
        h('h2', null, App.levelTitle(n)),
        h('p', { class: 'muted' }, 'Prochain palier à ' + App.levelFloor(n + 1) + ' XP.' + (unlocked.length ? ' Nouvelle couleur d’accent disponible : ' + unlocked.map(function (a) { return a.name; }).join(', ') + ' (dans ton profil).' : '')),
        h('button', { class: 'btn btn-primary', autofocus: true, onclick: function () { close(); } }, 'Continuer')), { label: 'Niveau ' + n });
    }, 250);
  });

  // Démarrage
  App.applyPrefs();
  App.checkAchievements();
  App.rerender();
  App.initRemote();
  if (App.storage.error) ui.toast({ icon: 'warning', title: 'Sauvegarde', text: App.storage.error });
  if (!App.storage.local) setTimeout(function () {
    if (App.storageMode() === 'none') ui.toast({ icon: 'warning', title: 'Progression non sauvegardée ici', text: 'Ce navigateur bloque le stockage : exporte ta progression depuis ton profil.', ms: 7000 });
  }, 12000);
})(App);
