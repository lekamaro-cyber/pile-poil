// Registre du contenu de CodeQuest : les fichiers de src/content/ y déclarent parcours, projets, katas, etc.
// Ce fichier tourne dans le navigateur (avant le contenu) et dans Node (outil de validation).
(function (root) {
  var CQ = root.CQ = root.CQ || {};
  CQ.tracks = CQ.tracks || [];
  CQ.projects = CQ.projects || [];
  CQ.katas = CQ.katas || [];
  CQ.placement = CQ.placement || [];
  CQ.placementSkills = CQ.placementSkills || [];
  CQ.puzzles = CQ.puzzles || [];
  CQ.datasets = CQ.datasets || {};

  // Donne un identifiant stable à chaque exercice d'une leçon et relie leçons, unités et parcours.
  function indexLesson(track, chapter, unit, lesson) {
    lesson.unitId = unit.id;
    lesson.trackId = track.id;
    (lesson.exercises || []).forEach(function (ex, i) {
      ex.id = lesson.id + '.e' + (i + 1);
      ex.role = 'exercise';
    });
    if (lesson.challenge) { lesson.challenge.id = lesson.id + '.ch'; lesson.challenge.role = 'challenge'; }
    if (lesson.check) { lesson.check.id = lesson.id + '.v'; lesson.check.role = 'check'; }
    lessonExercises(lesson).forEach(function (ex) {
      ex.unitId = unit.id;
      ex.lessonId = lesson.id;
      ex.lang = ex.lang || lesson.lang || track.lang;
    });
  }

  function lessonExercises(lesson) {
    var list = (lesson.exercises || []).slice();
    if (lesson.challenge) list.push(lesson.challenge);
    if (lesson.check) list.push(lesson.check);
    return list;
  }
  CQ.lessonExercises = lessonExercises;

  function indexChapter(track, chapter) {
    chapter.trackId = track.id;
    (chapter.units || []).forEach(function (unit) {
      unit.trackId = track.id;
      unit.chapterId = chapter.id;
      (unit.lessons || []).forEach(function (lesson) { indexLesson(track, chapter, unit, lesson); });
    });
  }

  CQ.addTrack = function (track) {
    track.chapters = track.chapters || [];
    track.chapters.forEach(function (ch) { indexChapter(track, ch); });
    CQ.tracks.push(track);
  };

  // Ajoute un chapitre à un parcours déjà déclaré (un parcours peut être écrit dans plusieurs fichiers).
  CQ.addChapter = function (trackId, chapter) {
    var track = CQ.tracks.filter(function (t) { return t.id === trackId; })[0];
    if (!track) throw new Error('Parcours inconnu : ' + trackId);
    indexChapter(track, chapter);
    track.chapters.push(chapter);
  };

  CQ.addProjects = function (list) {
    list.forEach(function (p) {
      (p.steps || []).forEach(function (s, i) {
        if (s.ex) { s.ex.id = p.id + '.s' + (i + 1); s.ex.lang = s.ex.lang || p.lang; s.ex.role = 'project'; }
      });
      CQ.projects.push(p);
    });
  };

  CQ.addKatas = function (list) {
    list.forEach(function (k) {
      k.ex.id = k.id;
      k.ex.lang = k.ex.lang || k.lang;
      k.ex.unitId = k.unit;
      k.ex.role = 'kata';
      CQ.katas.push(k);
    });
  };

  CQ.addPlacement = function (skills, items) {
    skills.forEach(function (s) { CQ.placementSkills.push(s); });
    items.forEach(function (it) {
      it.ex.id = it.id;
      it.ex.lang = it.ex.lang || 'python';
      it.ex.role = 'placement';
      CQ.placement.push(it);
    });
  };

  CQ.addPuzzles = function (list) {
    list.forEach(function (p) {
      p.ex.id = p.id;
      p.ex.lang = p.ex.lang || 'text';
      p.ex.role = 'puzzle';
      CQ.puzzles.push(p);
    });
  };

  CQ.addDataset = function (name, sql) { CQ.datasets[name] = sql; };
})(typeof window !== 'undefined' ? window : globalThis);
