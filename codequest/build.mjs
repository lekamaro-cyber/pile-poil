#!/usr/bin/env node
// Assemble CodeQuest en une seule page HTML.
//   node codequest/build.mjs                    -> codequest/index.html (page complète, ouvrable telle quelle)
//   node codequest/build.mjs --artifact <fichier> -> version « artefact » (sans <html>/<head>/<body>)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const core = ['core/registry.js', 'core/htmlchecks.js', 'core/jsharness.js', 'core/minipy.js', 'core/highlight.js', 'core/runners.js'];
const content = fs.readdirSync(path.join(SRC, 'content')).filter((f) => f.endsWith('.js')).sort().map((f) => 'content/' + f);
const app = ['app/ui.js', 'app/state.js', 'app/model.js', 'app/editor.js', 'app/exercise.js', 'app/player.js', 'app/placement.js',
  'app/views-home.js', 'app/views-parcours.js', 'app/views-review.js', 'app/views-practice.js', 'app/views-projects.js',
  'app/views-skills.js', 'app/views-profile.js', 'app/main.js'];

// Un </script> dans le code des leçons fermerait la balise : on l'échappe.
const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const parts = [];
for (const f of core.concat(content)) {
  if (!fs.existsSync(path.join(SRC, f))) { console.warn('absent : ' + f); continue; }
  parts.push(`/* ===== ${f} ===== */\n` + read(f));
}
// Le contenu est chargé dans un try : un fichier de contenu cassé ne doit pas empêcher l'appli de démarrer.
const scripts = parts.map((p) => `<script>\n${safe(p)}\n</script>`).join('\n') + '\n<script>\n' + safe(app.map((f) => `/* ===== ${f} ===== */\n` + read(f)).join('\n')) + '\n</script>';

const css = read('app.css');
const body = read('shell.html').replace('/*STYLE*/', () => css).replace('<!--SCRIPTS-->', () => scripts);

const args = process.argv.slice(2);
const ai = args.indexOf('--artifact');
if (ai !== -1) {
  const out = path.resolve(args[ai + 1]);
  fs.writeFileSync(out, body);
  console.log('artefact : ' + out + ' (' + Math.round(body.length / 1024) + ' Ko)');
} else {
  const full = '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#0b0e14">\n'
    + body.replace(/<div class="app"/, '</head>\n<body>\n<div class="app"') + '\n</body>\n</html>\n';
  const out = path.join(ROOT, 'index.html');
  fs.writeFileSync(out, full);
  console.log('page : ' + out + ' (' + Math.round(full.length / 1024) + ' Ko, ' + content.length + ' fichiers de contenu)');
}
