// Déroulé des exercices et des sessions (leçon, révision, évaluation, test de positionnement, défi du jour).
// Correction immédiate : explication précise de l'erreur, indice avant la solution, nouvel essai,
// exercice de transfert après une erreur, correction complète sur demande.
(function (App) {
  var ui = App.ui, h = ui.h, M = App.model;

  var ROLE_LABEL = { exercise: 'Exercice', challenge: 'Défi facultatif', check: 'Validation de la maîtrise', transfer: 'Exercice de transfert', kata: 'Kata', project: 'Étape du projet', placement: 'Test de positionnement', puzzle: 'Énigme' };

  // ---------- Un exercice : corps + pied (retour et actions) ----------
  App.runExercise = function (ex, o) {
    o = o || {};
    var s = { attempts: 0, hint: false, revealed: false, done: false, hadError: false, phase: 'answer', feedback: null, footKind: '' };
    var foot = h('div', { class: 'foot-inner' });
    var comp = App.mountExercise(ex, { onChange: render, submit: function () { primary(); }, draftKey: o.draftKey, tools: null });
    var head = h('div', { class: 'stack', style: { gap: '10px' } },
      h('div', { class: 'row' },
        h('span', { class: 'chip ' + (ex.role === 'challenge' ? 'chip-gold' : ex.role === 'check' ? 'chip-ok' : ex.role === 'transfer' ? 'chip-info' : 'chip-accent') }, ui.icon(App.TYPE_ICON[ex.type] || 'info'), o.roleLabel || ROLE_LABEL[ex.role] || 'Exercice'),
        h('span', { class: 'chip' }, App.TYPE_LABEL[ex.type] || ex.type),
        ex.unitId && o.showUnit ? h('span', { class: 'small muted' }, M.unitLabel(ex.unitId)) : null),
      h('div', { class: 'prompt' }, ui.mdEl(ex.prompt)));
    var body = h('div', { class: 'stack', style: { gap: '16px' }, 'data-ex': ex.id }, head, comp.el);

    function setFeedback(kind, title, nodes) {
      s.footKind = kind;
      s.feedback = h('div', { class: 'feedback ' + kind, role: 'status' },
        h('div', { class: 'feedback-title' }, ui.icon(kind === 'ok' ? 'check' : kind === 'ko' ? 'x' : 'info'), title),
        nodes.filter(Boolean));
    }
    function explainNode() { return ex.explain ? h('div', null, h('div', { class: 'label', style: { marginBottom: '4px' } }, 'Pourquoi'), ui.mdEl(ex.explain)) : null; }
    function hintNode() { return ex.hint ? h('div', { class: 'notice', style: { padding: '10px 12px' } }, ui.icon('hint'), h('div', null, h('strong', null, 'Indice : '), h('span', { html: ui.md(ex.hint).replace(/^<p>|<\/p>$/g, '') }))) : null; }

    function finish(q, extra) {
      s.done = true; s.phase = 'done';
      comp.lock && comp.lock();
      var xp = 0;
      if (!extra || !extra.skipped) {
        xp = App.recordExercise(ex, { q: q, context: o.context, hadError: s.hadError, code: extra && extra.code });
      }
      if (o.onFinish) o.onFinish({ q: q, revealed: s.revealed, skipped: !!(extra && extra.skipped), xp: xp, hadError: s.hadError });
      return xp;
    }

    var checking = false;
    function check() {
      if (checking || s.done || !comp.canCheck()) return;
      checking = true; render();
      comp.check().then(function (res) {
        checking = false;
        if (res.unavailable) {
          setFeedback('info', 'Vérification indisponible', [res.body]);
          s.phase = 'unavailable';
        } else if (res.partial) {
          setFeedback('info', 'Bonne piste', [res.body]);
        } else if (res.correct) {
          var q = s.attempts === 0 && !s.hint ? 2 : 1;
          var xp = finish(q, { code: res.code });
          setFeedback('ok', q === 2 ? 'Correct' : 'Correct, cette fois', [
            xp ? h('div', { class: 'player-xp' }, '+' + xp + ' XP') : null,
            res.body, explainNode()]);
        } else {
          s.attempts += 1; s.hadError = true;
          App.noteError(ex);
          if (o.oneShot) {
            finish(0);
            setFeedback('ko', 'Pas tout à fait', [res.body, comp.reveal(), explainNode()]);
          } else {
            s.phase = 'retry';
            var showHint = s.attempts >= 1 && !s.hint && o.allowHints !== false;
            if (showHint) s.hint = true;
            setFeedback('ko', s.attempts >= 2 ? 'Toujours pas' : 'Pas encore', [res.body, showHint || s.hint ? hintNode() : null,
              s.attempts >= 2 ? h('p', { class: 'small muted' }, 'Tu peux réessayer, ou afficher la correction complète (sans XP pour cet exercice).') : null]);
          }
        }
        render();
      }, function (e) {
        checking = false;
        setFeedback('info', 'Vérification impossible', [h('p', null, String(e && e.message || e))]);
        render();
      });
    }
    function retry() {
      s.phase = 'answer'; s.feedback = null; s.footKind = '';
      comp.unlock && comp.unlock();
      render();
      if (comp.focus) comp.focus();
    }
    function reveal() {
      if (s.done) return;
      s.revealed = true;
      var sol = comp.reveal();
      finish(0);
      setFeedback('info', 'Correction', [sol, explainNode(), h('p', { class: 'small muted' }, 'Cette notion reviendra vite dans tes révisions.')]);
      render();
    }
    function showHint() {
      s.hint = true;
      setFeedback('info', 'Indice', [hintNode()]);
      s.phase = s.phase === 'retry' ? 'retry' : 'answer';
      render();
    }
    function skip() {
      if (s.done) return;
      finish(null, { skipped: true });
      if (o.onContinue) o.onContinue({ skipped: true });
    }
    function cont() { if (o.onContinue) o.onContinue({ q: s.q }); }
    function dontKnow() {
      s.attempts += 1; s.hadError = true;
      App.noteError(ex, true);
      finish(0);
      setFeedback('ko', 'Voici la réponse', [comp.reveal(), explainNode()]);
      render();
    }

    function primary() {
      if (s.phase === 'done' || s.phase === 'unavailable') return s.phase === 'unavailable' ? skip() : cont();
      if (s.phase === 'retry') return retry();
      return check();
    }

    function render() {
      var actions = [];
      if (s.phase === 'done') {
        actions.push(h('span', { class: 'spacer' }), h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: cont, 'data-primary': '1' }, o.continueLabel || 'Continuer', ui.icon('arrowRight')));
      } else if (s.phase === 'unavailable') {
        actions.push(h('span', { class: 'spacer' }), h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: skip, 'data-primary': '1' }, 'Passer cet exercice', ui.icon('skip')));
      } else {
        if (o.oneShot) {
          actions.push(h('button', { class: 'btn btn-ghost', type: 'button', onclick: dontKnow }, 'Je ne sais pas'));
        } else {
          if (o.allowHints !== false && ex.hint && !s.hint) actions.push(h('button', { class: 'btn btn-ghost', type: 'button', onclick: showHint }, ui.icon('hint'), 'Indice'));
          actions.push(h('button', { class: 'btn btn-ghost', type: 'button', onclick: reveal }, ui.icon('eye'), 'Voir la correction'));
        }
        if (o.optional) actions.push(h('button', { class: 'btn btn-ghost', type: 'button', onclick: skip }, 'Passer le défi'));
        actions.push(h('span', { class: 'spacer' }));
        if (s.phase === 'retry') actions.push(h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: retry, 'data-primary': '1' }, ui.icon('reset'), 'Réessayer'));
        else actions.push(h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: check, disabled: !comp.canCheck() || checking, 'data-primary': '1' }, checking ? h('span', { class: 'loading' }) : null, ex.type === 'bug' && comp.stage && comp.stage() === 1 ? 'Valider la ligne' : 'Vérifier'));
      }
      foot.replaceChildren(s.feedback || h('span'), h('div', { class: 'foot-actions' }, actions));
      if (!s.feedback) foot.firstChild.remove();
      if (o.onLayout) o.onLayout(s.footKind);
    }
    render();
    setTimeout(function () { if (comp.focus && ex.type !== 'code') comp.focus(); }, 60);

    return {
      body: body, foot: foot, state: s,
      primary: primary,
      key: function (e) { return s.phase === 'answer' && comp.key ? comp.key(e) : false; },
      comp: comp
    };
  };

  // ---------- Lecteur plein écran ----------
  var P = { el: null, session: null, idx: 0, runner: null, xp: 0, startTime: 0 };
  function playerEl() { return document.getElementById('player'); }

  function onKey(e) {
    if (!P.session) return;
    var t = e.target, tag = t && t.tagName;
    if (e.key === 'Escape' && !document.getElementById('modal').hidden) return;
    if (P.runner && P.runner.key(e) && !(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')) { e.preventDefault(); return; }
    if (e.key === 'Enter' && !e.shiftKey && !(tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON')) {
      var btn = playerEl().querySelector('[data-primary="1"]:not([disabled])');
      if (btn) { e.preventDefault(); btn.click(); }
    }
  }
  document.addEventListener('keydown', onKey);
  App.on('xp', function (n) { if (P.session) { P.xp += n; var x = playerEl().querySelector('.player-xp'); if (x) x.textContent = '+' + P.xp + ' XP'; } });

  App.player = {
    open: function (session) {
      P.session = session; P.idx = 0; P.xp = 0; P.startTime = Date.now();
      session.results = session.results || [];
      App.learning = session.kind;
      var root = playerEl();
      root.hidden = false;
      document.body.style.overflow = 'hidden';
      renderStep();
    },
    close: function (force) {
      if (!P.session) return;
      var s = P.session;
      var started = s.results.length > 0 && !s.finished;
      var doClose = function () {
        P.session = null; P.runner = null; App.learning = null;
        playerEl().hidden = true; playerEl().replaceChildren();
        document.body.style.overflow = '';
        if (s.onClose) s.onClose();
        App.emit('route');
      };
      if (force || !started || s.kind === 'daily') return doClose();
      ui.confirmBox({ title: 'Quitter la session ?', text: 'Les exercices déjà réussis restent comptés. ' + (s.kind === 'lesson' ? 'La leçon ne sera pas marquée comme terminée.' : s.kind === 'placement' ? 'Le test devra être repris depuis le début.' : ''), confirm: 'Quitter', cancel: 'Rester' }).then(function (ok) { if (ok) doClose(); });
    },
    isOpen: function () { return !!P.session; }
  };

  function progressBar() {
    var s = P.session;
    var total = s.progressTotal ? s.progressTotal() : s.steps.length;
    var cur = s.progressIndex ? s.progressIndex() : P.idx;
    var bar = h('div', { class: 'player-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(cur) });
    for (var i = 0; i < total; i++) bar.appendChild(h('i', { class: i < cur ? 'done' : i === cur ? 'cur' : '' }));
    return bar;
  }

  function renderStep() {
    var s = P.session, root = playerEl();
    var step = s.steps[P.idx];
    if (!step && s.next) { step = s.next(); if (step) s.steps.push(step); }
    if (!step) { s.finished = true; step = { kind: 'result' }; }
    var bodyInner = h('div', { class: 'player-inner' });
    var foot = h('div', { class: 'player-foot' });
    var top = h('div', { class: 'player-top' },
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Fermer', onclick: function () { App.player.close(step.kind === 'result'); } }, ui.icon('x')),
      progressBar(),
      h('span', { class: 'player-xp', 'aria-label': 'XP gagnés pendant la session' }, '+' + P.xp + ' XP'));
    var body = h('div', { class: 'player-body' }, bodyInner);
    root.replaceChildren(top, body, foot);
    P.runner = null;

    function simpleFoot(label, fn, extra) {
      foot.className = 'player-foot';
      foot.replaceChildren(h('div', { class: 'foot-inner' }, h('div', { class: 'foot-actions' }, extra || null, h('span', { class: 'spacer' }),
        h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: fn, 'data-primary': '1' }, label, ui.icon('arrowRight')))));
    }
    function next() { P.idx += 1; renderStep(); body.scrollTop = 0; }

    if (step.kind === 'exercise') {
      var runner = App.runExercise(step.ex, {
        context: step.context || s.context,
        roleLabel: step.label,
        oneShot: s.oneShot,
        allowHints: !s.oneShot,
        optional: step.optional,
        showUnit: s.showUnit,
        onLayout: function (kind) { foot.className = 'player-foot' + (kind ? ' ' + kind : ''); },
        onFinish: function (out) {
          s.results.push({ ex: step.ex, step: step, q: out.q, skipped: out.skipped, revealed: out.revealed, xp: out.xp, hadError: out.hadError });
          if (s.afterExercise) s.afterExercise(step, out);
        },
        onContinue: function () { next(); }
      });
      P.runner = runner;
      bodyInner.append(runner.body);
      foot.replaceChildren(runner.foot);
    } else if (step.kind === 'content') {
      bodyInner.append(step.render());
      simpleFoot(step.cta || 'Continuer', next, step.secondary ? step.secondary(next) : null);
    } else if (step.kind === 'result') {
      bodyInner.append(s.result(P));
      var actions = s.resultActions ? s.resultActions() : [{ label: 'Terminer', fn: function () { App.player.close(true); } }];
      foot.className = 'player-foot';
      foot.replaceChildren(h('div', { class: 'foot-inner' }, h('div', { class: 'foot-actions' }, h('span', { class: 'spacer' }),
        actions.map(function (a, i) { return h('button', { class: 'btn ' + (i === actions.length - 1 ? 'btn-primary btn-lg' : 'btn-ghost'), type: 'button', onclick: a.fn, 'data-primary': i === actions.length - 1 ? '1' : null }, a.label); }))));
    }
    setTimeout(function () { var f = root.querySelector('.player-body'); if (f) f.focus && f.focus(); }, 0);
  }

  // ---------- Sessions ----------
  function resultTile(v, k) { return h('div', { class: 'stat' }, h('div', { class: 'v' }, v), h('div', { class: 'k' }, k)); }
  function firstTryRate(results) {
    var graded = results.filter(function (r) { return !r.skipped; });
    if (!graded.length) return '—';
    return Math.round(100 * graded.filter(function (r) { return r.q === 2; }).length / graded.length) + ' %';
  }

  // Leçon complète : objectif, explication, exemple, exercices, défi, récap, validation.
  App.startLesson = function (lessonId) {
    var l = M.lesson[lessonId];
    if (!l) return;
    var u = M.unit[l.unitId], t = M.track[l.trackId];
    var lang = l.lang || t.lang;
    var transfers = 0, used = {};
    CQ_lessonExercises(l).forEach(function (e) { used[e.id] = true; });
    var steps = [
      { kind: 'content', render: function () {
        return h('div', { class: 'stack', style: { gap: '18px' } },
          h('div', { class: 'eyebrow' }, t.title + ' · ' + u.title),
          h('h1', null, l.title),
          h('div', { class: 'objective' }, ui.icon('target'), h('div', null, h('div', { class: 'label', style: { color: 'var(--accent-strong)' } }, 'Objectif'), ui.mdEl(l.objective))),
          ui.mdEl(l.explain),
          h('p', { class: 'small muted' }, 'Environ ' + (l.minutes || 6) + ' minutes · ' + ui.plural((l.exercises || []).length + 1, 'exercice') + (l.challenge ? ' + un défi facultatif' : '')));
      } },
      { kind: 'content', render: function () {
        var notes = l.example.notes || [];
        var block = ui.codeBlock(l.example.code, lang, { noteLines: notes.map(function (n) { return n.line; }) });
        var list = h('ul', { class: 'notes' }, notes.map(function (n) {
          var li = h('li', { tabindex: '0', onclick: function () { focusLine(n.line, li); }, onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusLine(n.line, li); } } }, h('span', { class: 'lnum' }, 'L' + n.line), h('span', { html: ui.md(n.text).replace(/^<p>|<\/p>$/g, '') }));
          return li;
        }));
        function focusLine(line, li) {
          block.querySelectorAll('.ln').forEach(function (r) { r.classList.toggle('hl', +r.dataset.line === line); });
          list.querySelectorAll('li').forEach(function (x) { x.classList.toggle('active', x === li); });
        }
        block.addEventListener('click', function (e) {
          var row = e.target.closest('.ln'); if (!row) return;
          var n = +row.dataset.line, idx = notes.map(function (x) { return x.line; }).indexOf(n);
          if (idx !== -1) focusLine(n, list.children[idx]);
        });
        return h('div', { class: 'stack', style: { gap: '16px' } },
          h('div', { class: 'eyebrow' }, 'Exemple commenté'),
          h('h2', null, 'Lis le code, puis les lignes importantes'),
          ui.codeWithHead(l.example.code, lang).firstChild, block,
          l.example.output != null ? h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'label' }, 'Ce que ça affiche'), h('div', { class: 'console' }, l.example.output)) : null,
          list);
      } }
    ];
    (l.exercises || []).forEach(function (ex, i) { steps.push({ kind: 'exercise', ex: ex, label: 'Exercice ' + (i + 1) + ' sur ' + l.exercises.length }); });
    if (l.challenge) steps.push({ kind: 'exercise', ex: l.challenge, optional: true, label: 'Défi facultatif' });
    steps.push({ kind: 'content', render: function () {
      return h('div', { class: 'stack', style: { gap: '16px' } },
        h('div', { class: 'eyebrow' }, 'Récapitulatif'),
        h('h2', null, 'À retenir'),
        h('ul', { class: 'recap' }, l.recap.map(function (r) { return h('li', null, ui.icon('check'), ui.mdEl(r)); })),
        h('p', { class: 'muted' }, 'Dernière étape : un exercice de validation pour vérifier que l’objectif est atteint.'));
    } });
    if (l.check) steps.push({ kind: 'exercise', ex: l.check, label: 'Validation de la maîtrise' });

    var session = {
      kind: 'lesson', context: 'lesson', steps: steps, lesson: l,
      afterExercise: function (step, out) {
        // Après une erreur, un exercice de transfert sur la même notion vérifie que c'est compris.
        if ((out.hadError || out.revealed) && !out.skipped && step.ex.role !== 'challenge' && transfers < 2) {
          var pool = M.unitExercises(l.unitId).filter(function (e) { return !used[e.id] && e.role !== 'challenge' && App.usable(e) && e.lessonId !== undefined && M.lessonDone(e.lessonId); });
          if (!pool.length) pool = M.unitExercises(l.unitId).filter(function (e) { return !used[e.id] && e.role === 'kata' && App.usable(e); });
          if (pool.length) {
            var pick = pool[Math.floor(Math.random() * pool.length)];
            used[pick.id] = true; transfers += 1;
            var at = session.steps.indexOf(step) + 1;
            session.steps.splice(at, 0, { kind: 'exercise', ex: pick, context: 'transfer', label: 'Exercice de transfert' });
          }
        }
      },
      result: function () { return lessonResult(session); },
      resultActions: function () {
        var nxt = nextAfter(l);
        var acts = [{ label: 'Retour au parcours', fn: function () { App.player.close(true); App.go('parcours-' + t.id); } }];
        if (nxt) acts.push({ label: 'Leçon suivante', fn: function () { App.player.close(true); App.startLesson(nxt.id); } });
        else acts.push({ label: 'Terminer', fn: function () { App.player.close(true); } });
        return acts;
      }
    };
    App.state.lastLesson = l.id;
    App.player.open(session);
  };
  function CQ_lessonExercises(l) { return window.CQ.lessonExercises(l); }
  function nextAfter(l) {
    var nl = M.nextLessonInUnit(l.unitId);
    if (nl) return nl;
    var g = M.nextGoal();
    return g && g.lesson ? g.lesson : null;
  }

  function lessonResult(session) {
    var l = session.lesson, st = App.state;
    var res = session.results;
    var required = res.filter(function (r) { return r.step.ex.role === 'exercise' || r.step.ex.role === 'check'; });
    var check = res.filter(function (r) { return r.step.ex.role === 'check'; })[0];
    var qCheck = check ? check.q : 2;
    var qAll = required.reduce(function (m, r) { return Math.min(m, r.q == null ? 0 : r.q); }, 2);
    var conceptQ = qCheck === 0 ? 0 : (qAll === 2 ? 2 : 1);
    var prev = st.lessons[l.id];
    var first = !prev || !prev.done;
    var perfect = required.length > 0 && required.every(function (r) { return r.q === 2; });
    var score = required.length ? Math.round(100 * required.filter(function (r) { return r.q > 0; }).length / required.length) : 100;
    var bonus = 0;
    if (!session.recorded) {
      session.recorded = true;
      st.lessons[l.id] = { done: Date.now(), n: (prev ? prev.n : 0) + 1, best: Math.max(score, prev ? prev.best : 0), perfect: perfect || !!(prev && prev.perfect) };
      if (first) { st.stats.lessons += 1; if (qCheck > 0) bonus = App.gain(10, 'lesson-complete'); }
      if (perfect && first) st.stats.perfect += 1;
      App.updateConcept(l.unitId, conceptQ, 'learn');
      App.checkAchievements();
      App.save();
      session.bonus = bonus;
    }
    var c = App.concept(l.unitId);
    var unitDone = M.unitDone(l.unitId);
    return h('div', { class: 'stack', style: { gap: '20px', justifyItems: 'start' } },
      h('div', { class: 'big-check' }, ui.icon('check')),
      h('div', null, h('div', { class: 'eyebrow' }, 'Leçon terminée'), h('h1', null, l.title)),
      h('div', { class: 'result-grid', style: { width: '100%' } },
        resultTile('+' + P.xp, 'XP gagnés'),
        resultTile(firstTryRate(res), 'Réussite du premier coup'),
        resultTile(ui.fmtDuration((Date.now() - P.startTime) / 1000), 'Durée de la leçon')),
      qCheck === 0
        ? h('div', { class: 'notice warn' }, ui.icon('warning'), h('div', null, 'La validation n’est pas réussie : la notion reviendra dès demain en révision. Tu peux aussi refaire la leçon maintenant.'))
        : h('div', { class: 'notice ok' }, ui.icon('check'), h('div', null, 'Objectif atteint. ' + (session.bonus ? 'Bonus de fin de leçon : +' + session.bonus + ' XP. ' : '') + (c && c.next ? 'Prochaine révision de « ' + M.unit[l.unitId].title + ' » : ' + ui.fmtDay(c.next) + '.' : ''))),
      unitDone ? h('p', { class: 'muted' }, 'Unité « ' + M.unit[l.unitId].title + ' » terminée. Elle sera « maîtrisée » quand tes révisions espacées l’auront confirmée.') : null);
  }

  // Session de révision (notions dues, erreurs, mixte, anciennes).
  App.startReview = function (kind, exercises, title) {
    if (!exercises.length) { ui.toast({ icon: 'info', title: 'Rien à réviser ici pour le moment' }); return; }
    var steps = exercises.map(function (ex, i) { return { kind: 'exercise', ex: ex, label: title + ' · ' + (i + 1) + '/' + exercises.length }; });
    var before = {};
    exercises.forEach(function (ex) { if (ex.unitId) before[ex.unitId] = (App.concept(ex.unitId) || {}).lvl || 0; });
    var session = {
      kind: 'review', context: kind === 'errors' ? 'errors' : 'review', steps: steps, showUnit: true,
      afterExercise: function (step, out) {
        if (out.skipped || !step.ex.unitId) return;
        App.updateConcept(step.ex.unitId, out.q, 'review');
        App.save();
      },
      result: function () {
        App.checkAchievements();
        var units = Object.keys(before);
        return h('div', { class: 'stack', style: { gap: '20px' } },
          h('div', { class: 'big-check' }, ui.icon('review')),
          h('div', null, h('div', { class: 'eyebrow' }, 'Révision terminée'), h('h1', null, title)),
          h('div', { class: 'result-grid' }, resultTile('+' + P.xp, 'XP gagnés'), resultTile(firstTryRate(session.results), 'Réussite du premier coup'), resultTile(String(session.results.filter(function (r) { return !r.skipped; }).length), 'Exercices')),
          units.length ? h('div', { class: 'card' }, h('h3', { style: { marginBottom: '10px' } }, 'Tes notions après cette révision'),
            h('ul', { class: 'mini-list' }, units.map(function (uid) {
              var c = App.concept(uid) || { lvl: 0 };
              var st = M.skillStatus(uid);
              return h('li', null, h('div', null, h('div', { class: 't' }, M.unitLabel(uid)), h('div', { class: 'tiny muted' }, 'Prochaine révision : ' + ui.fmtDay(c.next))),
                h('span', { class: 'chip ' + M.SKILL_CHIP[st] }, M.SKILL_LABEL[st]), meter(c.lvl));
            }))) : null);
      }
    };
    App.player.open(session);
  };
  function meter(lvl) {
    var m = h('span', { class: 'meter' + (lvl >= 5 ? ' gold' : lvl >= 4 ? ' ok' : ''), 'aria-label': 'Maîtrise ' + lvl + ' sur 5' });
    for (var i = 1; i <= 5; i++) m.appendChild(h('i', { class: i <= lvl ? 'on' : '' }));
    return m;
  }
  App.meter = meter;

  // Évaluation pour passer une unité déjà maîtrisée : une seule tentative par question, 80 % requis.
  App.startUnitTest = function (uid) {
    var u = M.unit[uid];
    var pool = [];
    u.lessons.forEach(function (l) {
      [l.exercises && l.exercises[1], l.check, l.exercises && l.exercises[0]].forEach(function (ex) { if (ex && App.usable(ex) && pool.indexOf(ex) === -1) pool.push(ex); });
    });
    pool = pool.slice(0, Math.max(4, Math.min(8, u.lessons.length * 3)));
    var steps = pool.map(function (ex, i) { return { kind: 'exercise', ex: ex, label: 'Évaluation · ' + (i + 1) + '/' + pool.length }; });
    steps.unshift({ kind: 'content', cta: 'Commencer l’évaluation', render: function () {
      return h('div', { class: 'stack', style: { gap: '16px' } },
        h('div', { class: 'eyebrow' }, 'Évaluation · ' + M.track[u.trackId].title),
        h('h1', null, u.title),
        ui.mdEl('Tu penses déjà maîtriser cette unité ? Réponds à **' + pool.length + ' questions**, une seule tentative chacune, sans indice. Avec **80 %** de bonnes réponses, l’unité est validée et la suite se débloque. Sinon, tu sauras exactement quelle leçon faire.'),
        h('div', { class: 'notice' }, ui.icon('info'), h('div', null, 'Les notions validées ainsi reviennent quand même en révision espacée, pour vérifier qu’elles tiennent dans le temps.')));
    } });
    var session = {
      kind: 'test', context: 'test', oneShot: true, steps: steps,
      result: function () {
        var graded = session.results.filter(function (r) { return !r.skipped; });
        var ok = graded.filter(function (r) { return r.q > 0; }).length;
        var pct = graded.length ? Math.round(100 * ok / graded.length) : 0;
        var pass = graded.length > 0 && pct >= 80;
        if (!session.recorded) {
          session.recorded = true;
          App.state.stats.tests += 1;
          if (pass) {
            App.state.units[uid] = { via: 'test', at: Date.now() };
            App.updateConcept(uid, 2, 'test');
            App.gain(15, 'unit-test');
          }
          App.checkAchievements();
          App.save();
        }
        var missed = graded.filter(function (r) { return !r.q; }).map(function (r) { return r.ex.lessonId; });
        var firstMissed = missed.length ? M.lesson[missed[0]] : null;
        return h('div', { class: 'stack', style: { gap: '20px' } },
          h('div', { class: 'big-check', style: pass ? null : { background: 'var(--warn-soft)', color: 'var(--warn)', borderColor: 'rgba(255,194,75,.4)' } }, ui.icon(pass ? 'check' : 'target')),
          h('div', null, h('div', { class: 'eyebrow' }, pass ? 'Unité validée' : 'Pas encore validée'), h('h1', null, ok + ' / ' + graded.length + ' (' + pct + ' %)')),
          pass ? h('p', { class: 'muted' }, '« ' + u.title + ' » est validée. La suite du parcours est débloquée et la notion reviendra en révision dans quelques jours.')
            : h('p', { class: 'muted' }, 'Il faut 80 %. ' + (firstMissed ? 'Commence par la leçon « ' + firstMissed.title + ' » : elle couvre ce qui t’a manqué.' : '')));
      },
      resultActions: function () {
        var acts = [{ label: 'Retour au parcours', fn: function () { App.player.close(true); App.go('parcours-' + u.trackId); } }];
        var nl = M.nextLessonInUnit(uid);
        if (!M.unitDone(uid) && nl && M.unitUnlocked(uid)) acts.push({ label: 'Faire la leçon', fn: function () { App.player.close(true); App.startLesson(nl.id); } });
        return acts;
      }
    };
    App.player.open(session);
  };

  // Défi du jour : un exercice, XP une seule fois par jour.
  App.startDaily = function () {
    var d = M.dailyChallenge();
    if (!d) return;
    var k = App.dayKey();
    var session = {
      kind: 'daily', context: App.state.daily[k] && App.state.daily[k].done ? 'practice' : 'daily', showUnit: true,
      steps: [{ kind: 'exercise', ex: d.ex, label: 'Défi du jour' }],
      afterExercise: function (step, out) {
        if (out.q > 0 && !App.state.daily[k].done) { App.state.daily[k].done = Date.now(); App.state.stats.dailies += 1; App.checkAchievements(); App.save(); }
      },
      result: function () {
        var done = App.state.daily[k] && App.state.daily[k].done;
        return h('div', { class: 'stack', style: { gap: '18px' } },
          h('div', { class: 'big-check' }, ui.icon(done ? 'check' : 'calendar')),
          h('h1', null, done ? 'Défi du jour réussi' : 'Défi du jour'),
          h('p', { class: 'muted' }, done ? 'Un nouveau défi t’attend demain.' : 'Tu pourras le retenter quand tu veux aujourd’hui.'));
      }
    };
    App.player.open(session);
  };
})(App);
