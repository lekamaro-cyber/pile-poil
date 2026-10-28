#!/usr/bin/env node
// Vérifie le contenu de CodeQuest : structure des leçons et exercices, puis exécution réelle du code
// (python3, node, gcc, g++, java, php, bash, tsc, SQLite via sql.js, Chromium pour HTML/CSS et DOM).
//
// Utilisation :
//   node codequest/tools/validate.mjs                       -> tous les fichiers de src/content
//   node codequest/tools/validate.mjs src/content/sql.js    -> seulement ce fichier (les autres sont chargés pour les références)
//   options : --minipy (compare aussi avec l'interpréteur MiniPy), --no-browser, --quiet
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');
const CONTENT = path.join(ROOT, 'src', 'content');

const args = process.argv.slice(2);
const opt = { minipy: args.includes('--minipy'), browser: !args.includes('--no-browser'), quiet: args.includes('--quiet') };
const targets = args.filter((a) => !a.startsWith('--')).map((a) => path.resolve(a));

// ---------- Chargement ----------
for (const f of ['registry.js', 'htmlchecks.js', 'jsharness.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'src', 'core', f), 'utf8'), { filename: f });
}
const CQ = globalThis.CQ;
const H = globalThis.CQJsHarness;

let currentFile = null;
const wrap = (name, tag) => {
  const orig = CQ[name];
  CQ[name] = function (...a) { tag(...a); return orig.apply(CQ, a); };
};
wrap('addTrack', (t) => { t.__file = currentFile; (t.chapters || []).forEach((c) => { c.__file = currentFile; }); });
const origAddChapter = CQ.addChapter;
CQ.addChapter = function (trackId, ch) {
  if (!CQ.tracks.some((t) => t.id === trackId)) {
    CQ.addTrack({ id: trackId, title: '(parcours déclaré ailleurs)', lang: 'python', chapters: [], __stub: true });
  }
  ch.__file = currentFile;
  return origAddChapter.call(CQ, trackId, ch);
};
wrap('addProjects', (list) => list.forEach((p) => { p.__file = currentFile; }));
wrap('addKatas', (list) => list.forEach((k) => { k.__file = currentFile; }));
wrap('addPlacement', (skills, items) => items.forEach((i) => { i.__file = currentFile; }));
wrap('addPuzzles', (list) => list.forEach((p) => { p.__file = currentFile; }));
const datasetFiles = {};
wrap('addDataset', (name) => { datasetFiles[name] = currentFile; });

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where} : ${msg}`);
const warn = (where, msg) => warnings.push(`${where} : ${msg}`);

const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.js')).sort().map((f) => path.join(CONTENT, f));
for (const t of targets) if (!files.includes(t)) files.push(t);
const checkFiles = new Set(targets.length ? targets : files);
for (const f of files) {
  currentFile = f;
  try {
    vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f });
  } catch (e) {
    if (checkFiles.has(f)) err(path.basename(f), `le fichier ne se charge pas : ${e.stack.split('\n').slice(0, 3).join(' | ')}`);
  }
}
const mine = (o) => checkFiles.has(o.__file);

// ---------- Structure ----------
const isStr = (s) => typeof s === 'string' && s.trim().length > 0;
const RUNNABLE_CODE_LANGS = ['python', 'javascript', 'html', 'sql'];
const ids = new Map();
function uniqueId(id, where) {
  if (!isStr(id)) { err(where, 'identifiant manquant'); return; }
  if (ids.has(id)) err(where, `identifiant en double « ${id} » (déjà dans ${ids.get(id)})`);
  ids.set(id, where);
}

function checkCommon(ex, where) {
  if (!isStr(ex.prompt)) err(where, 'prompt manquant');
  if (!isStr(ex.hint)) err(where, 'hint manquant');
  if (!isStr(ex.explain)) err(where, 'explain manquant');
}

function blanksCount(code) { return (code.match(/___/g) || []).length; }

function checkExercise(ex, where) {
  if (!ex || typeof ex !== 'object') { err(where, 'exercice manquant'); return; }
  checkCommon(ex, where);
  const lang = ex.lang;
  switch (ex.type) {
    case 'qcm': {
      if (!Array.isArray(ex.choices) || ex.choices.length < 3 || ex.choices.length > 4) err(where, 'qcm : 3 ou 4 choix attendus');
      else {
        if (new Set(ex.choices).size !== ex.choices.length) err(where, 'qcm : choix en double');
        if (!(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < ex.choices.length)) err(where, 'qcm : answer invalide');
        ex.choices.forEach((c, i) => {
          if (i !== ex.answer && !(ex.why && isStr(ex.why[i]))) err(where, `qcm : why manquant pour le choix ${i} (« ${String(c).slice(0, 40)} »)`);
        });
      }
      break;
    }
    case 'predict': {
      if (!isStr(ex.code)) err(where, 'predict : code manquant');
      if (typeof ex.answer !== 'string') err(where, 'predict : answer (chaîne) manquant');
      (ex.mistakes || []).forEach((m, i) => {
        if (!isStr(m.answer) || !isStr(m.why)) err(where, `predict : mistakes[${i}] incomplet`);
      });
      break;
    }
    case 'fill': {
      if (!isStr(ex.code)) { err(where, 'fill : code manquant'); break; }
      const n = blanksCount(ex.code);
      if (!n) err(where, 'fill : aucun trou ___ dans le code');
      if (!Array.isArray(ex.blanks) || ex.blanks.length !== n) err(where, `fill : ${n} trou(s) dans le code mais ${ex.blanks ? ex.blanks.length : 0} dans blanks`);
      (ex.blanks || []).forEach((b, i) => {
        if (!Array.isArray(b.answers) || !b.answers.length || !b.answers.every((a) => typeof a === 'string' && a.trim())) err(where, `fill : blanks[${i}].answers invalide`);
        if (b.options && (!Array.isArray(b.options) || !b.options.includes(b.answers[0]))) err(where, `fill : blanks[${i}].options doit contenir answers[0]`);
        if (b.options && new Set(b.options).size !== b.options.length) err(where, `fill : blanks[${i}].options en double`);
      });
      break;
    }
    case 'order': {
      if (!Array.isArray(ex.lines) || ex.lines.length < 3 || ex.lines.length > 8) err(where, 'order : 3 à 8 lignes attendues');
      else if (new Set(ex.lines).size !== ex.lines.length) err(where, 'order : lignes en double (ordre ambigu)');
      break;
    }
    case 'bug': {
      if (!isStr(ex.code)) { err(where, 'bug : code manquant'); break; }
      const n = ex.code.split('\n').length;
      if (!(Number.isInteger(ex.bugLine) && ex.bugLine >= 1 && ex.bugLine <= n)) err(where, `bug : bugLine hors du code (1..${n})`);
      if (!isStr(ex.why)) err(where, 'bug : why manquant');
      if (!Array.isArray(ex.fixes) || ex.fixes.length < 2) err(where, 'bug : au moins 2 fixes');
      else {
        if (!(Number.isInteger(ex.fixAnswer) && ex.fixAnswer >= 0 && ex.fixAnswer < ex.fixes.length)) err(where, 'bug : fixAnswer invalide');
        ex.fixes.forEach((f, i) => { if (i !== ex.fixAnswer && !(ex.fixWhy && isStr(ex.fixWhy[i]))) err(where, `bug : fixWhy manquant pour la correction ${i}`); });
      }
      break;
    }
    case 'code': {
      if (!RUNNABLE_CODE_LANGS.includes(lang)) err(where, `code : langage « ${lang} » non exécutable dans l'appli (python, javascript, html, sql seulement)`);
      if (typeof ex.starter !== 'string') err(where, 'code : starter manquant');
      if (!isStr(ex.solution)) err(where, 'code : solution manquante');
      if (lang === 'python' || lang === 'javascript') {
        if (!(Array.isArray(ex.tests) && ex.tests.length) && typeof ex.expectOutput !== 'string') err(where, 'code : tests ou expectOutput requis');
        (ex.tests || []).forEach((t, i) => { if (!isStr(t.code) || !isStr(t.label)) err(where, `code : tests[${i}] incomplet (code + label)`); });
        if (ex.run === false) err(where, 'code : run: false interdit pour un exercice code');
      }
      if (lang === 'html' && !(Array.isArray(ex.checks) && ex.checks.length)) err(where, 'code html : checks requis');
      if (lang === 'html') (ex.checks || []).forEach((c, i) => { if (!isStr(c.label) || !(isStr(c.sel) || isStr(c.none))) err(where, `code html : checks[${i}] incomplet`); });
      if (lang === 'sql' && !isStr(ex.db) && !isStr(ex.setup)) err(where, 'code sql : db ou setup requis');
      if (lang === 'sql' && isStr(ex.db) && !CQ.datasets[ex.db]) err(where, `code sql : jeu de données « ${ex.db} » inconnu`);
      (ex.checks || []).forEach((c, i) => { if (lang !== 'html' && (!isStr(c.re) || !isStr(c.label))) err(where, `code : checks[${i}] incomplet (re + label)`); });
      break;
    }
    case 'logic': {
      if (ex.answer == null || String(ex.answer).trim() === '') err(where, 'logic : answer manquant');
      break;
    }
    default:
      err(where, `type d'exercice inconnu « ${ex.type} »`);
  }
}

const exList = []; // { ex, where }
function addEx(ex, where) { if (ex) exList.push({ ex, where }); }
const exampleList = []; // { lesson, where }

for (const track of CQ.tracks) {
  const ownTrack = mine(track) && !track.__stub;
  if (ownTrack) {
    uniqueId(track.id, `parcours ${track.id}`);
    for (const k of ['title', 'lang', 'summary', 'why']) if (!isStr(track[k])) err(`parcours ${track.id}`, `${k} manquant`);
  }
  for (const ch of track.chapters) {
    if (!mine(ch)) continue;
    const cw = `chapitre ${ch.id}`;
    uniqueId(ch.id, cw);
    if (!String(ch.id).startsWith(track.id + '.c')) err(cw, `l'id doit commencer par ${track.id}.c`);
    if (!isStr(ch.title)) err(cw, 'title manquant');
    if (!Array.isArray(ch.units) || !ch.units.length) { err(cw, 'aucune unité'); continue; }
    for (const u of ch.units) {
      const uw = `unité ${u.id}`;
      uniqueId(u.id, uw);
      if (!/^[a-z]+\.u\d+$/.test(u.id) || !u.id.startsWith(track.id + '.u')) err(uw, `id attendu : ${track.id}.uN`);
      if (!isStr(u.title)) err(uw, 'title manquant');
      if (!isStr(u.summary)) err(uw, 'summary manquant');
      if (!Array.isArray(u.lessons) || !u.lessons.length) { err(uw, 'aucune leçon'); continue; }
      for (const l of u.lessons) {
        const lw = `leçon ${l.id}`;
        uniqueId(l.id, lw);
        if (!String(l.id).startsWith(u.id + '.l')) err(lw, `l'id doit commencer par ${u.id}.l`);
        for (const k of ['title', 'objective', 'explain']) if (!isStr(l[k])) err(lw, `${k} manquant`);
        if (typeof l.minutes !== 'number') err(lw, 'minutes manquant');
        if (isStr(l.explain)) {
          const words = l.explain.split(/\s+/).length;
          if (words < 40 || words > 260) warn(lw, `explain fait ${words} mots (viser 60 à 140)`);
        }
        if (!l.example || !isStr(l.example.code)) err(lw, 'example.code manquant');
        else {
          const n = l.example.code.split('\n').length;
          const notes = l.example.notes || [];
          if (notes.length < 2 || notes.length > 5) err(lw, 'example.notes : 2 à 4 notes attendues');
          notes.forEach((nt, i) => { if (!(Number.isInteger(nt.line) && nt.line >= 1 && nt.line <= n) || !isStr(nt.text)) err(lw, `example.notes[${i}] invalide (ligne 1..${n})`); });
          exampleList.push({ lesson: l, where: lw });
        }
        if (!Array.isArray(l.exercises) || l.exercises.length !== 2) err(lw, '2 exercices attendus');
        else if (l.exercises[0] && l.exercises[1] && l.exercises[0].type === l.exercises[1].type) err(lw, 'les 2 exercices doivent être de types différents');
        if (!l.challenge) err(lw, 'challenge manquant');
        if (!l.check) err(lw, 'check manquant');
        if (!Array.isArray(l.recap) || l.recap.length < 3 || l.recap.length > 5 || !l.recap.every(isStr)) err(lw, 'recap : 3 à 5 points attendus');
        (l.exercises || []).forEach((ex, i) => { checkExercise(ex, `${lw} exercice ${i + 1}`); addEx(ex, `${lw} exercice ${i + 1}`); });
        if (l.challenge) { checkExercise(l.challenge, `${lw} défi`); addEx(l.challenge, `${lw} défi`); }
        if (l.check) { checkExercise(l.check, `${lw} validation`); addEx(l.check, `${lw} validation`); }
      }
    }
  }
}

for (const p of CQ.projects.filter(mine)) {
  const pw = `projet ${p.id}`;
  uniqueId(p.id, pw);
  for (const k of ['title', 'summary', 'result', 'variant']) if (!isStr(p[k])) err(pw, `${k} manquant`);
  if (!(p.difficulty >= 1 && p.difficulty <= 4)) err(pw, 'difficulty 1 à 4');
  if (!Array.isArray(p.skills) || !p.skills.length) err(pw, 'skills manquant');
  if (!Array.isArray(p.steps) || p.steps.length < 3) err(pw, 'au moins 3 étapes');
  (p.steps || []).forEach((s, i) => {
    const sw = `${pw} étape ${i + 1}`;
    if (!isStr(s.title) || !isStr(s.explain)) err(sw, 'title et explain requis');
    if (s.ex) { checkExercise(s.ex, sw); addEx(s.ex, sw); }
    else if (!(Array.isArray(s.checklist) && s.checklist.length)) err(sw, 'ex ou checklist requis');
  });
  if (!p.solution || !isStr(p.solution.code) || !isStr(p.solution.explain)) err(pw, 'solution.code et solution.explain requis');
}
for (const k of CQ.katas.filter(mine)) {
  const kw = `kata ${k.id}`;
  uniqueId(k.id, kw);
  if (!isStr(k.title)) err(kw, 'title manquant');
  if (!(k.difficulty >= 1 && k.difficulty <= 4)) err(kw, 'difficulty 1 à 4');
  if (!isStr(k.unit)) err(kw, 'unit (prérequis) manquant');
  if (k.ex.type !== 'code') err(kw, 'un kata est un exercice de type code');
  checkExercise(k.ex, kw); addEx(k.ex, kw);
}
for (const it of CQ.placement.filter(mine)) {
  const w = `test ${it.id}`;
  uniqueId(it.id, w);
  if (!CQ.placementSkills.some((s) => s.id === it.skill)) err(w, `compétence inconnue « ${it.skill} »`);
  if (![1, 2, 3].includes(it.level)) err(w, 'level 1, 2 ou 3');
  checkExercise(it.ex, w); addEx(it.ex, w);
}
for (const p of CQ.puzzles.filter(mine)) {
  const w = `énigme ${p.id}`;
  uniqueId(p.id, w);
  checkExercise(p.ex, w); addEx(p.ex, w);
}

// ---------- Exécution ----------
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cq-validate-'));
const normOut = (s) => String(s == null ? '' : s).replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/^\n+|\n+$/g, '');

function fillCode(ex) {
  let i = 0;
  return ex.code.replace(/___/g, () => { const b = ex.blanks[i++]; return b ? b.answers[0] : '___'; });
}
function fixedBugCode(ex) {
  const lines = ex.code.split('\n');
  lines[ex.bugLine - 1] = ex.fixes[ex.fixAnswer];
  return lines.join('\n');
}

// Programmes à exécuter : { key, lang, code, tests, stdin, files, where, onResult }
const jobs = [];
function job(lang, code, where, onResult, extra = {}) { jobs.push({ key: jobs.length, lang, code, where, onResult, ...extra }); }

const outputCheck = (expected, where, label) => (r) => {
  if (r.error) { err(where, `${label} : erreur à l'exécution — ${r.error}`); return; }
  if (expected != null && normOut(r.stdout) !== normOut(expected)) err(where, `${label} : sortie attendue\n      ${JSON.stringify(normOut(expected))}\n    sortie réelle\n      ${JSON.stringify(normOut(r.stdout))}`);
};

const EXEC_LANGS = ['python', 'javascript', 'c', 'cpp', 'java', 'php', 'bash', 'typescript'];
for (const { lesson, where } of exampleList) {
  const lang = lesson.lang || (CQ.tracks.find((t) => t.id === lesson.trackId) || {}).lang;
  const exm = lesson.example;
  if (EXEC_LANGS.includes(lang) && exm.run !== false || (lang === 'python')) {
    if (EXEC_LANGS.includes(lang)) {
      if (exm.output != null) job(lang, exm.code, where, outputCheck(exm.output, where, 'exemple'), { stdin: exm.stdin, files: exm.files });
      else job(lang, exm.code, where, (r) => { if (r.error && !exm.error) warn(where, `exemple : erreur à l'exécution — ${r.error}`); }, { stdin: exm.stdin, files: exm.files });
    }
  } else if (lang === 'sql' && exm.output != null) {
    warn(where, 'exemple SQL : sortie non vérifiée');
  }
}

for (const { ex, where } of exList) {
  const lang = ex.lang;
  // run: false en JavaScript = code non exécutable seul (modules, DOM sans page) : pas d'exécution.
  const canRun = EXEC_LANGS.includes(lang) && !(ex.run === false && lang !== 'python');
  if (ex.type === 'predict') {
    if (lang === 'sql') { job('sqlvalue', ex.code, where, (r) => {
      if (r.error) err(where, `predict sql : ${r.error}`);
      else if (normOut(r.value) !== normOut(ex.answer)) err(where, `predict sql : valeur réelle « ${r.value} », answer « ${ex.answer} »`);
    }, { db: ex.db, setup: ex.setup }); continue; }
    if (!canRun) { warn(where, `predict en ${lang} : non vérifié automatiquement`); continue; }
    job(lang, ex.code, where, (r) => {
      outputCheck(ex.answer, where, 'predict')(r);
      if (!r.error) (ex.mistakes || []).forEach((m) => { if (normOut(m.answer) === normOut(r.stdout)) err(where, `predict : l'erreur fréquente « ${m.answer} » est en fait la bonne sortie`); });
    }, { stdin: ex.stdin, files: ex.files });
  } else if (ex.type === 'fill' && canRun && ex.blanks && blanksCount(ex.code) === ex.blanks.length) {
    if (ex.output != null || lang === 'python' || lang === 'javascript') job(lang, fillCode(ex), where, ex.output != null ? outputCheck(ex.output, where, 'fill (code complété)') : (r) => { if (r.error) warn(where, `fill : le code complété lève une erreur — ${r.error}`); }, { stdin: ex.stdin, files: ex.files });
  } else if (ex.type === 'order' && canRun && Array.isArray(ex.lines)) {
    if (ex.output != null) job(lang, ex.lines.join('\n'), where, outputCheck(ex.output, where, 'order'), { stdin: ex.stdin, files: ex.files });
    else if (lang === 'python' || lang === 'javascript') job(lang, ex.lines.join('\n'), where, (r) => { if (r.error) warn(where, `order : le code remis en ordre lève une erreur — ${r.error}`); }, { stdin: ex.stdin, files: ex.files });
  } else if (ex.type === 'bug' && canRun && Array.isArray(ex.fixes) && ex.fixes[ex.fixAnswer] != null) {
    const fixed = fixedBugCode(ex);
    let fixedRes = null; let buggyRes = null;
    const compare = () => {
      if (!fixedRes || !buggyRes) return;
      if (ex.output != null && !buggyRes.error && normOut(buggyRes.stdout) === normOut(ex.output)) err(where, 'bug : le code bogué produit déjà la sortie attendue');
    };
    job(lang, fixed, where, (r) => { fixedRes = r; if (ex.output != null) outputCheck(ex.output, where, 'bug (code corrigé)')(r); else if (r.error && lang === 'python') warn(where, `bug : le code corrigé lève une erreur — ${r.error}`); compare(); }, { stdin: ex.stdin, files: ex.files });
    job(lang, ex.code, where, (r) => { buggyRes = r; compare(); }, { stdin: ex.stdin, files: ex.files });
  } else if (ex.type === 'code') {
    if (lang === 'python' || lang === 'javascript') {
      const testsOk = (r, label) => {
        if (r.error) return `${label} : erreur — ${r.error}`;
        const failed = (r.tests || []).map((t, i) => (t.ok ? null : `« ${ex.tests[i].label} » (${t.message || 'échec'})`)).filter(Boolean);
        if (failed.length) return `${label} : tests en échec ${failed.join(', ')}`;
        if (ex.expectOutput != null && normOut(r.stdout) !== normOut(ex.expectOutput)) return `${label} : sortie ${JSON.stringify(normOut(r.stdout))} au lieu de ${JSON.stringify(normOut(ex.expectOutput))}`;
        return null;
      };
      const reCheck = (code) => (ex.checks || []).filter((c) => { const ok = new RegExp(c.re, c.flags || 'm').test(code); return c.not ? ok : !ok; }).map((c) => c.label);
      job(lang, ex.solution, where, (r) => {
        const pb = testsOk(r, 'solution'); if (pb) err(where, pb);
        const rc = reCheck(ex.solution); if (rc.length) err(where, `solution : contrainte non respectée (${rc.join(', ')})`);
      }, { tests: ex.tests, stdin: ex.stdin, files: ex.files, dom: ex.dom, html: ex.html });
      job(lang, ex.starter, where, (r) => {
        if (!testsOk(r, 'starter') && !reCheck(ex.starter).length) err(where, 'starter : passe déjà tous les tests (il doit échouer)');
      }, { tests: ex.tests, stdin: ex.stdin, files: ex.files, dom: ex.dom, html: ex.html });
    } else if (lang === 'html') {
      job('html', ex.solution, where, (r) => {
        const failed = r.results.filter((c) => !c.ok).map((c) => `« ${c.label} » (${c.detail})`);
        if (failed.length) err(where, `solution html : vérifications en échec ${failed.join(', ')}`);
      }, { checks: ex.checks });
      job('html', ex.starter, where, (r) => {
        if (r.results.every((c) => c.ok)) err(where, 'starter html : passe déjà toutes les vérifications');
      }, { checks: ex.checks });
    } else if (lang === 'sql') {
      job('sqlcompare', ex.solution, where, (r) => {
        if (r.error) err(where, `solution sql : ${r.error}`);
        else if (r.starterMatches) err(where, 'starter sql : donne déjà le bon résultat');
      }, { db: ex.db, setup: ex.setup, starter: ex.starter, verify: ex.verify });
    }
  } else if (ex.type === 'logic' || ex.type === 'qcm') {
    // rien à exécuter, mais le code affiché doit être valide quand il est exécutable
    if (ex.code && canRun && ex.run !== false && (lang === 'python' || lang === 'javascript')) {
      job(lang, ex.code, where, (r) => { if (r.error && !/Error/.test(ex.prompt + ex.explain)) warn(where, `${ex.type} : le code affiché lève une erreur — ${r.error}`); }, { stdin: ex.stdin, files: ex.files });
    }
  }
}

// --- Python (CPython) ---
const PY_DRIVER = String.raw`
import sys, json, io, os, signal, tempfile, contextlib, traceback, builtins
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
out = []
class Timeout(BaseException): pass
def on_alarm(sig, frame): raise Timeout()
signal.signal(signal.SIGALRM, on_alarm)
base = os.getcwd()
for job in jobs:
    d = tempfile.mkdtemp(dir=base)
    os.chdir(d)
    for name, content in (job.get('files') or {}).items():
        with open(name, 'w', encoding='utf-8') as fh: fh.write(content)
    buf = io.StringIO()
    res = {'key': job['key'], 'stdout': '', 'error': None, 'tests': []}
    sys.stdin = io.StringIO(job.get('stdin') or '')
    ns = {'__name__': '__main__'}
    signal.alarm(8)
    try:
        with contextlib.redirect_stdout(buf):
            try:
                exec(compile(job['code'], 'main.py', 'exec'), ns)
            except Timeout:
                res['error'] = 'Timeout: plus de 8 secondes'
            except BaseException as e:
                tb = traceback.extract_tb(e.__traceback__)
                line = next((f.lineno for f in reversed(tb) if f.filename == 'main.py'), getattr(e, 'lineno', None))
                res['error'] = type(e).__name__ + ': ' + str(e) + (' (ligne %s)' % line if line else '')
            if not res['error']:
                for t in job.get('tests') or []:
                    try:
                        exec(compile(t['code'], 'test.py', 'exec'), ns)
                        res['tests'].append({'ok': True})
                    except Timeout:
                        res['tests'].append({'ok': False, 'message': 'Timeout'})
                    except BaseException as e:
                        res['tests'].append({'ok': False, 'message': type(e).__name__ + ': ' + str(e)})
    finally:
        signal.alarm(0)
    res['stdout'] = buf.getvalue()
    out.append(res)
    os.chdir(base)
sys.stdout.write(json.dumps(out))
`;

function runPythonJobs(list) {
  if (!list.length) return [];
  const dir = fs.mkdtempSync(path.join(TMP, 'py-'));
  fs.writeFileSync(path.join(dir, 'driver.py'), PY_DRIVER);
  fs.writeFileSync(path.join(dir, 'jobs.json'), JSON.stringify(list.map((j) => ({ key: j.key, code: j.code, tests: j.tests, stdin: j.stdin, files: j.files }))));
  const r = spawnSync('python3', ['-I', 'driver.py', 'jobs.json'], { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 600000 });
  if (r.status !== 0) throw new Error('Le pilote Python a échoué : ' + r.stderr);
  return JSON.parse(r.stdout);
}

// --- JavaScript (Node, même enveloppe que dans l'appli) ---
async function runJsJob(j) {
  const built = H.buildWorkerSource(j.code, j.tests);
  let payload = null;
  const ctx = vm.createContext({ setTimeout, clearTimeout, Promise, Date, Math, JSON, postMessage: (p) => { payload = p; } });
  try {
    vm.runInContext(built.source, ctx, { filename: '__cq.js', timeout: 3000 });
  } catch (e) {
    const m = String(e.stack || '').match(/__cq\.js:(\d+)/);
    return { stdout: '', error: `${e.name}: ${e.message}${m ? ` (ligne ${Number(m[1]) - built.offset})` : ''}`, tests: [] };
  }
  const start = Date.now();
  while (!payload && Date.now() - start < 4000) await new Promise((r) => setTimeout(r, 10));
  if (!payload) return { stdout: '', error: 'Timeout', tests: [] };
  return {
    stdout: payload.logs.join('\n'),
    error: payload.error ? `${payload.error.name}: ${payload.error.message}${payload.error.line ? ` (ligne ${payload.error.line})` : ''}` : null,
    tests: payload.results
  };
}
function runNodeReal(code) {
  const f = path.join(fs.mkdtempSync(path.join(TMP, 'js-')), 'main.js');
  fs.writeFileSync(f, code);
  const r = spawnSync('node', [f], { encoding: 'utf8', timeout: 10000 });
  return { stdout: r.stdout, error: r.status === 0 ? null : (r.stderr.split('\n').find((l) => /Error/.test(l)) || 'erreur') };
}

// --- Autres langages ---
function runCompiled(lang, code, stdin) {
  const dir = fs.mkdtempSync(path.join(TMP, lang + '-'));
  const sh = (cmd, a, o = {}) => spawnSync(cmd, a, { cwd: dir, encoding: 'utf8', timeout: 20000, input: stdin || '', ...o });
  let r;
  if (lang === 'c' || lang === 'cpp') {
    const src = path.join(dir, lang === 'c' ? 'main.c' : 'main.cpp');
    fs.writeFileSync(src, code);
    const c = lang === 'c' ? sh('gcc', ['-std=c11', '-Wall', '-o', 'prog', src, '-lm']) : sh('g++', ['-std=c++17', '-Wall', '-o', 'prog', src]);
    if (c.status !== 0) return { stdout: '', error: 'compilation : ' + c.stderr.split('\n').slice(0, 3).join(' ') };
    r = sh(path.join(dir, 'prog'), []);
  } else if (lang === 'java') {
    const m = code.match(/public\s+(?:final\s+)?class\s+(\w+)/);
    const name = m ? m[1] : 'Main';
    fs.writeFileSync(path.join(dir, name + '.java'), code);
    const c = sh('javac', [name + '.java']);
    if (c.status !== 0) return { stdout: '', error: 'compilation : ' + c.stderr.split('\n').slice(0, 3).join(' ') };
    r = sh('java', ['-cp', dir, name]);
  } else if (lang === 'php') {
    fs.writeFileSync(path.join(dir, 'main.php'), code);
    r = sh('php', ['main.php']);
  } else if (lang === 'bash') {
    fs.writeFileSync(path.join(dir, 'main.sh'), code);
    r = sh('bash', ['main.sh']);
  } else if (lang === 'typescript') {
    fs.writeFileSync(path.join(dir, 'main.ts'), code);
    const c = sh('tsc', ['--target', 'es2020', '--module', 'commonjs', '--strict', '--outDir', 'out', 'main.ts']);
    if (c.status !== 0) return { stdout: '', error: 'compilation : ' + (c.stdout + c.stderr).split('\n').slice(0, 3).join(' ') };
    r = sh('node', [path.join('out', 'main.js')]);
  }
  return { stdout: r.stdout, error: r.status === 0 ? null : 'sortie ' + r.status + ' ' + String(r.stderr).split('\n').slice(0, 2).join(' ') };
}

// --- SQL (SQLite via sql.js) ---
let SQL = null;
async function sqlEngine() {
  if (!SQL) { const init = require(path.join(TOOLS, 'node_modules', 'sql.js', 'dist', 'sql-asm.js')); SQL = await init(); }
  return SQL;
}
function lastResult(db, query) {
  const res = db.exec(query);
  return res.length ? res[res.length - 1] : { columns: [], values: [] };
}
function sameRows(a, b, ordered) {
  if (a.columns.length !== b.columns.length) return false;
  const ra = a.values.map((r) => JSON.stringify(r));
  const rb = b.values.map((r) => JSON.stringify(r));
  if (!ordered) { ra.sort(); rb.sort(); }
  return JSON.stringify(ra) === JSON.stringify(rb);
}
async function runSqlJob(j) {
  const S = await sqlEngine();
  const setup = j.setup || CQ.datasets[j.db] || '';
  const fresh = () => { const db = new S.Database(); db.exec(setup); return db; };
  if (j.lang === 'sqlvalue') {
    try {
      const r = lastResult(fresh(), j.code);
      if (r.values.length !== 1 || r.columns.length !== 1) return { error: `la requête doit renvoyer 1 valeur (reçu ${r.values.length} ligne(s), ${r.columns.length} colonne(s))` };
      return { value: String(r.values[0][0]) };
    } catch (e) { return { error: e.message }; }
  }
  const outcome = (q) => {
    const db = fresh();
    const r = lastResult(db, q);
    return j.verify ? lastResult(db, j.verify) : r;
  };
  let sol;
  try { sol = outcome(j.code); } catch (e) { return { error: e.message }; }
  if (!j.verify && sol.columns.length === 0) return { error: 'la solution ne renvoie aucun résultat (ajoute verify pour INSERT/UPDATE/DELETE)' };
  let starterMatches = false;
  try { const st = outcome(j.starter || ''); starterMatches = sameRows(st, sol, false); } catch (e) { starterMatches = false; }
  return { error: null, starterMatches };
}

// --- Navigateur (HTML/CSS et DOM) ---
async function runBrowserJobs(list) {
  if (!list.length) return new Map();
  const results = new Map();
  if (!opt.browser) { list.forEach((j) => warn(j.where, 'vérification navigateur ignorée (--no-browser)')); return results; }
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const checksSrc = fs.readFileSync(path.join(ROOT, 'src', 'core', 'htmlchecks.js'), 'utf8');
  for (const j of list) {
    try {
      if (j.lang === 'html') {
        const all = [];
        for (const w of globalThis.CQHtmlChecks.widths(j.checks)) {
          await page.setViewportSize({ width: w, height: 800 });
          await page.setContent(/<!doctype|<html[\s>]/i.test(j.code) ? j.code : `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>${j.code}</body></html>`);
          await page.addScriptTag({ content: checksSrc });
          const sub = j.checks.map((c, i) => ({ c, i })).filter((x) => (x.c.vw || 800) === w);
          const r = await page.evaluate((cs) => window.CQHtmlChecks.run(document, window, cs), sub.map((x) => x.c));
          sub.forEach((x, k) => { all[x.i] = r[k]; });
        }
        results.set(j.key, { results: all });
      } else {
        const d = H.buildDomDocument(j.html, j.code, j.tests, 'v');
        await page.setViewportSize({ width: 800, height: 800 });
        await page.setContent(d.source);
        await page.waitForFunction(() => window.__cqResult, null, { timeout: 5000 });
        const p = await page.evaluate(() => window.__cqResult);
        results.set(j.key, {
          stdout: p.logs.join('\n'),
          error: p.error ? `${p.error.name}: ${p.error.message}${p.error.line ? ` (ligne ${p.error.line})` : ''}` : null,
          tests: p.results
        });
      }
    } catch (e) {
      results.set(j.key, j.lang === 'html' ? { results: [{ ok: false, label: 'page', detail: e.message }] } : { stdout: '', error: 'navigateur : ' + e.message, tests: [] });
    }
  }
  await browser.close();
  return results;
}

// --- MiniPy (optionnel) ---
let MiniPy = null;
if (opt.minipy) {
  const f = path.join(ROOT, 'src', 'core', 'minipy.js');
  if (fs.existsSync(f)) { vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: 'minipy.js' }); MiniPy = globalThis.MiniPy; }
  else warn('MiniPy', 'src/core/minipy.js introuvable');
}
function miniPyCompare(j, cpy) {
  if (!MiniPy || j.run === false) return;
  let r;
  try { r = MiniPy.runTests(j.code, (j.tests || []).map((t) => ({ code: t.code })), { stdin: j.stdin || '', files: j.files || {} }); }
  catch (e) { err(j.where, `MiniPy a planté : ${e.stack}`); return; }
  const syntax = (t) => /^(SyntaxError|IndentationError|TabError)/.test(t || '');
  let mErr = r.error ? `${r.error.type}: ${r.error.message}` : null;
  let cErr = cpy.error ? cpy.error.replace(/ \(ligne \d+\)$/, '') : null;
  if (syntax(mErr) && syntax(cErr)) { mErr = mErr.split(':')[0]; cErr = cErr.split(':')[0]; }
  if (normOut(r.stdout) !== normOut(cpy.stdout) || (mErr || '') !== (cErr || '')) {
    err(j.where, `MiniPy diffère de CPython\n      CPython : ${JSON.stringify(normOut(cpy.stdout))} ${cErr || ''}\n      MiniPy  : ${JSON.stringify(normOut(r.stdout))} ${mErr || ''}`);
  } else if ((cpy.tests || []).some((t, i) => !!t.ok !== !!(r.tests[i] && r.tests[i].ok))) {
    err(j.where, 'MiniPy : résultats de tests différents de CPython');
  }
}

// ---------- Lancement ----------
const pyJobs = jobs.filter((j) => j.lang === 'python');
const pyRes = runPythonJobs(pyJobs);
const runFlags = new Map(exList.map(({ ex, where }) => [where, ex.run]));
for (const r of pyRes) {
  const j = jobs[r.key];
  const res = { stdout: r.stdout, error: r.error, tests: r.tests };
  j.onResult(res);
  if (opt.minipy && runFlags.get(j.where) !== false) miniPyCompare(j, res);
}

for (const j of jobs.filter((x) => x.lang === 'javascript' && !x.dom)) {
  const r = await runJsJob(j);
  j.onResult(r);
  if (!j.tests && !r.error) {
    const real = runNodeReal(j.code);
    if (!real.error && normOut(real.stdout) !== normOut(r.stdout)) warn(j.where, `affichage différent entre Node (${JSON.stringify(normOut(real.stdout))}) et l'appli (${JSON.stringify(normOut(r.stdout))}) : simplifie ce qui est affiché`);
  }
}
const browserJobs = jobs.filter((x) => x.lang === 'html' || (x.lang === 'javascript' && x.dom));
const bRes = await runBrowserJobs(browserJobs);
for (const j of browserJobs) if (bRes.has(j.key)) j.onResult(bRes.get(j.key));

for (const j of jobs.filter((x) => ['c', 'cpp', 'java', 'php', 'bash', 'typescript'].includes(x.lang))) j.onResult(runCompiled(j.lang, j.code, j.stdin));
for (const j of jobs.filter((x) => x.lang === 'sqlvalue' || x.lang === 'sqlcompare')) j.onResult(await runSqlJob(j));

fs.rmSync(TMP, { recursive: true, force: true });

// ---------- Rapport ----------
const counts = { lessons: exampleList.length, exercises: exList.length, jobs: jobs.length };
const label = targets.length ? targets.map((t) => path.basename(t)).join(', ') : 'tout le contenu';
console.log(`CodeQuest — validation de ${label}`);
console.log(`${counts.lessons} leçon(s), ${counts.exercises} exercice(s), ${counts.jobs} exécution(s).`);
if (!opt.quiet) warnings.forEach((w) => console.log('  avertissement  ' + w));
errors.forEach((e) => console.log('  ERREUR  ' + e));
console.log(errors.length ? `${errors.length} erreur(s), ${warnings.length} avertissement(s).` : `Aucune erreur. ${warnings.length} avertissement(s).`);
process.exit(errors.length ? 1 : 0);
