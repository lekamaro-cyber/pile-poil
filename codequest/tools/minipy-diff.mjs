#!/usr/bin/env node
// Tests différentiels de MiniPy : chaque programme du corpus est exécuté avec le vrai Python (python3 -I)
// et avec MiniPy ; on compare la sortie standard, le type et le message de l'erreur, et sa ligne.
//
// Utilisation :
//   node codequest/tools/minipy-diff.mjs            -> tout le corpus
//   node codequest/tools/minipy-diff.mjs dict       -> seulement les fichiers dont le chemin contient « dict »
//   options : --verbose (affiche les sorties complètes), --quiet (seulement le total), --jobs=8
//
// Directives possibles en tête d'un fichier du corpus (lignes commençant par « #! ») :
//   #! stdin: "Alice\n17\n"                  réponses pour input() (chaîne JSON)
//   #! files: {"notes.txt": "a\nb\n"}       fichiers virtuels (objet JSON)
//   #! expect-error: ModuleNotFoundError: No module named 'numpy'
//                                            CPython n'est pas lancé : MiniPy doit lever exactement cette erreur
//   #! expect-stdout: "texte"                (avec expect-error) sortie attendue avant l'erreur
//   #! tests: ["assert f(2) == 4", "assert f(0) == 1"]
//                                            mode runTests : les tests sont exécutés après le programme
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');
const CORPUS = path.join(TOOLS, 'minipy-corpus');
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const quiet = args.includes('--quiet');
const jobsArg = args.find((a) => a.startsWith('--jobs='));
const JOBS = jobsArg ? Number(jobsArg.slice(7)) : Math.max(2, Math.min(8, os.cpus().length));
const filters = args.filter((a) => !a.startsWith('--'));

// Chargement de MiniPy (même code que dans l'appli)
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'src', 'core', 'minipy.js'), 'utf8'), { filename: 'minipy.js' });
const MiniPy = globalThis.MiniPy;

function listPy(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listPy(p));
    else if (e.name.endsWith('.py')) out.push(p);
  }
  return out.sort();
}

function directives(src) {
  const d = {};
  for (const line of src.split('\n')) {
    const m = /^#!\s*([\w-]+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const v = m[2].trim();
    if (m[1] === 'expect-error') d[m[1]] = v;
    else d[m[1]] = JSON.parse(v);
  }
  return d;
}

// Exécute le fichier comme un vrai script : python3 -I main.py (dans un dossier temporaire)
function parseTraceback(stderr, code) {
  if (code === 0) return { error: null, line: null };
  const lines = stderr.replace(/\s+$/, '').split('\n');
  let ln = null;
  for (const l of lines) {
    const m = /^\s*File "([^"]*)", line (\d+)/.exec(l);
    if (m && path.basename(m[1]) === 'main.py') ln = Number(m[2]);
  }
  const last = lines[lines.length - 1] || '';
  if (!/Traceback|File "/.test(stderr)) return { error: 'SystemExit: ' + last, line: null };
  return { error: last, line: ln };
}
function runCPython(src, d) {
  return new Promise((resolve) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'minipy-diff-'));
    fs.writeFileSync(path.join(dir, 'main.py'), src);
    for (const [k, v] of Object.entries(d.files || {})) fs.writeFileSync(path.join(dir, k), v);
    const child = spawn('python3', ['-I', 'main.py'], { cwd: dir, env: { PATH: process.env.PATH, LANG: 'C.UTF-8', PYTHONIOENCODING: 'utf-8' } });
    let stdout = '', stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (b) => { stdout += b; });
    child.stderr.on('data', (b) => { stderr += b; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 20000);
    child.on('close', (code) => {
      clearTimeout(timer);
      const files = {};
      for (const name of fs.readdirSync(dir)) {
        if (name === 'main.py' || name === '__pycache__') continue;
        const p = path.join(dir, name);
        if (fs.statSync(p).isFile()) files[name] = fs.readFileSync(p, 'utf8');
      }
      fs.rmSync(dir, { recursive: true, force: true });
      const tb = parseTraceback(stderr, code);
      resolve({ stdout, error: tb.error, line: tb.line, files });
    });
    child.stdin.end(d.stdin || '');
  });
}

function show(s) { return JSON.stringify(s); }

async function main() {
  let files = listPy(CORPUS);
  if (filters.length) files = files.filter((f) => filters.some((x) => path.relative(CORPUS, f).includes(x)));
  let ok = 0, fail = 0, slow = [];
  const failures = [];
  const queue = files.slice();
  const results = new Map();
  async function worker() {
    while (queue.length) {
      const f = queue.shift();
      const src = fs.readFileSync(f, 'utf8');
      const d = directives(src);
      let ref;
      if (d['expect-error'] !== undefined) {
        const m = /^(\w+)(?::\s?(.*))?$/.exec(d['expect-error']);
        ref = { stdout: d['expect-stdout'] || '', error: d['expect-error'], line: null, files: null, noLine: true };
        void m;
      } else ref = await runCPython(src, d);
      results.set(f, { src, d, ref });
    }
  }
  await Promise.all(Array.from({ length: JOBS }, worker));
  for (const f of files) {
    const { src, d, ref } = results.get(f);
    const rel = path.relative(CORPUS, f);
    const t0 = Date.now();
    let mini;
    try {
      mini = d.tests ? MiniPy.runTests(src, d.tests.map((c) => ({ code: c })), { stdin: d.stdin || '', files: d.files || {} })
        : MiniPy.run(src, { stdin: d.stdin || '', files: d.files || {} });
    } catch (e) {
      mini = { stdout: '', error: { text: 'CRASH ' + e.stack, line: null } };
    }
    const dt = Date.now() - t0;
    if (dt > 1500) slow.push(`${rel} (${dt} ms)`);
    const problems = [];
    if (mini.stdout !== ref.stdout) problems.push(`stdout\n      CPython : ${show(ref.stdout)}\n      MiniPy  : ${show(mini.stdout)}`);
    const mErr = mini.error ? mini.error.text : null;
    if ((mErr || null) !== (ref.error || null)) problems.push(`erreur\n      CPython : ${ref.error}\n      MiniPy  : ${mErr}`);
    else if (ref.error && !ref.noLine && mini.error.line !== ref.line) problems.push(`ligne de l'erreur : CPython ${ref.line}, MiniPy ${mini.error.line}`);
    if (ref.files && mini.files && !ref.error) {
      for (const [k, v] of Object.entries(ref.files)) {
        if (mini.files[k] !== v) problems.push(`fichier ${k}\n      CPython : ${show(v)}\n      MiniPy  : ${show(mini.files[k])}`);
      }
    }
    if (problems.length) {
      fail++;
      failures.push(`✗ ${rel}\n    ` + problems.join('\n    '));
    } else {
      ok++;
      if (verbose) console.log(`✓ ${rel}`);
    }
  }
  if (!quiet) for (const x of failures) console.log(x);
  if (slow.length && !quiet) console.log('\nLents (> 1,5 s) : ' + slow.join(', '));
  const total = ok + fail;
  console.log(`\nMiniPy ${MiniPy.version} : ${ok}/${total} programmes identiques à CPython (${total ? (100 * ok / total).toFixed(1) : 0} %)`);
  process.exit(fail ? 1 : 0);
}
main();
