# Guide d'écriture du contenu CodeQuest

Ce guide décrit comment écrire les parcours, leçons et exercices de CodeQuest (fichiers `src/content/*.js`)
et comment les vérifier avec `node codequest/tools/validate.mjs <fichier>`.

## 1. Le public

- Personne qui a déjà des bases en Python et a fait un petit projet d'IA. Ce n'est pas un débutant complet.
- Veut comprendre le code et l'écrire seule, sans dépendre d'une IA.
- Intérêts : intelligence artificielle, web, applications, ordinateurs, data science, projets concrets.
- Sessions de 15 à 30 minutes : une leçon dure 5 à 8 minutes.
- Ton : français, tutoiement, phrases courtes et claires, sérieux et motivant. Jamais enfantin.
- Interdits : emoji, « Bravo champion », mention de l'âge, de la classe ou de l'établissement, culpabilisation,
  promesses fausses (« tu es maintenant expert »).

## 2. Règles pédagogiques

1. Chaque exercice porte sur la notion de la leçon, ou sur des notions des unités précédentes du même parcours
   (ou des prérequis déclarés). Jamais sur une notion pas encore expliquée.
2. Les deux exercices d'une leçon sont de **types différents** (ex. `predict` puis `fill`). Varie les types d'une leçon
   à l'autre : sur un parcours, chaque type doit apparaître souvent, aucun ne doit dominer.
3. Le `challenge` (défi facultatif) est plus difficile, mais reste faisable avec la leçon.
4. Le `check` (validation de la maîtrise) vérifie l'**objectif** de la leçon. Il ne doit pas être un simple copier-coller
   d'un exercice précédent.
5. Chaque mauvaise réponse prévisible a une explication précise : pourquoi c'est faux, et le bon raisonnement.
6. L'indice (`hint`) aide sans donner la réponse.
7. `explain` explique brièvement pourquoi la bonne réponse fonctionne (2 à 4 phrases).
8. Le code est **exact** : il tourne vraiment et les sorties annoncées sont les vraies sorties (le validateur le vérifie).
9. Bibliothèques non exécutables dans CodeQuest (numpy, pandas, scikit-learn, requests, Flask, Express, etc.) : les
   expliquer par des cas pratiques, avec des exercices de lecture, prédiction, code à trous, remise en ordre, détection
   de bug. Ne jamais faire croire qu'elles tournent dans l'appli : pas d'exercice `code` avec ces bibliothèques.
   Une phrase de la leçon le précise (« À essayer sur ton ordinateur : … »).
10. Langages sans exécution dans l'appli (C, C++, Java, C#, PHP, TypeScript, Bash, Dart, Git) : exercices `qcm`,
    `predict`, `fill`, `order`, `bug`, `logic` uniquement (pas de `code`). La leçon donne la commande pour essayer
    sur sa machine.

## 3. Format des fichiers

Chaque fichier de `src/content/` est un script JavaScript qui appelle le registre global `CQ`
(voir `src/core/registry.js`). Pas d'`import`, pas d'`export`, pas de variables globales autres que des
constantes locales dans une fonction auto-appelée si besoin.

Chaînes de code : utilise des gabarits `` `...` `` (backticks) pour le code multiligne. Attention aux caractères
`` ` `` et `${` à l'intérieur d'un gabarit : échappe-les (`` \` `` et `\${`), surtout pour le JavaScript.
L'indentation du code Python doit être exacte (4 espaces).

### 3.1 Parcours

```js
CQ.addTrack({
  id: 'py',                       // identifiant court, fixé par le plan (voir § 7)
  title: 'Python',
  lang: 'python',                 // langage par défaut des exercices
  summary: 'Une phrase sur ce que le parcours apporte.',
  why: 'À quoi ça sert dans la vraie vie (2 phrases).',
  requires: [],                   // unités d'autres parcours à terminer avant (ex. ['py.u9'])
  unlock: 'linear',               // 'linear' (défaut) ou 'chapter' (chaque chapitre se débloque seul)
  chapters: [ chapitre, ... ]
});

CQ.addChapter('py', chapitre);    // pour ajouter un chapitre depuis un autre fichier
```

### 3.2 Chapitre et unité

```js
{
  id: 'py.c1',
  title: 'Fondations',
  units: [
    {
      id: 'py.u1',                // un parcours = py.u1, py.u2, ... dans l'ordre du plan
      title: 'Variables et types',
      summary: 'Une phrase.',
      requires: [],               // optionnel : unités d'autres parcours nécessaires (ex. ['web.u2'])
      lessons: [ leçon, ... ]     // au moins 1 leçon, 2 pour les notions riches
    }
  ]
}
```

### 3.3 Leçon

```js
{
  id: 'py.u1.l1',                 // commence par l'id de l'unité
  title: 'Ranger des valeurs',
  minutes: 6,
  lang: 'python',                 // optionnel, sinon celui du parcours
  objective: 'Objectif mesurable : « Tu sais … » (une phrase, verbe d'action vérifiable).',
  explain: `Explication courte (60 à 140 mots) en mini-markdown.`,
  example: {
    code: `...`,                  // 3 à 15 lignes, exact et exécutable si le langage l'est
    output: `...`,                // optionnel : sortie exacte du code (vérifiée)
    notes: [                      // 2 à 4 lignes importantes expliquées
      { line: 1, text: 'Ce que fait la ligne 1.' }
    ]
  },
  exercises: [ exercice1, exercice2 ],   // 2 exercices de types différents
  challenge: exercice,                    // défi facultatif, plus difficile
  recap: ['Point clé 1', 'Point clé 2', 'Point clé 3'],   // 3 à 5 points
  check: exercice                         // validation de la maîtrise
}
```

Les identifiants des exercices de leçon sont générés automatiquement (`py.u1.l1.e1`, `.e2`, `.ch`, `.v`).

Mini-markdown accepté dans `explain`, `prompt`, `hint`, textes d'explication : `` `code` ``, `**gras**`,
paragraphes séparés par une ligne vide, listes avec `- ` en début de ligne. Rien d'autre (pas de HTML, pas de liens).

### 3.4 Champs communs à tous les exercices

```js
{
  type: 'qcm',                    // qcm | predict | fill | order | bug | code | logic
  prompt: 'Consigne claire (mini-markdown).',
  code: `...`,                    // code affiché (selon le type)
  lang: 'python',                 // optionnel (sinon celui de la leçon)
  hint: 'Indice qui ne donne pas la réponse.',
  explain: 'Pourquoi la bonne réponse est correcte.'
}
```

### 3.5 Types d'exercices

**qcm** — choix unique (sert aussi pour la lecture et compréhension de code avec `code`).
```js
{ type: 'qcm', prompt: '...', code: `...` /* optionnel */,
  choices: ['A', 'B', 'C', 'D'],  // 3 ou 4 choix, plausibles
  answer: 2,                      // index (0 = premier) de la bonne réponse
  why: { 0: 'Pourquoi A est faux.', 1: 'Pourquoi B est faux.', 3: 'Pourquoi D est faux.' },  // une entrée par choix faux
  hint: '...', explain: '...' }
```

**predict** — prédire la sortie exacte du code.
```js
{ type: 'predict', prompt: 'Qu’affiche ce programme ?', code: `...`,
  answer: `sortie exacte`,        // vérifiée en exécutant le code (python, javascript, c, cpp, java, php, bash, typescript)
  accept: ['autre forme acceptée'],               // optionnel
  mistakes: [ { answer: 'erreur fréquente', why: 'Explication de cette erreur précise.' } ],  // 1 à 3
  hint: '...', explain: '...' }
```
Sortie courte (1 à 4 lignes). La comparaison ignore les espaces en fin de ligne et les lignes vides au début et
à la fin. Pour du SQL : la requête doit renvoyer **une seule valeur** (1 ligne, 1 colonne) et `answer` est cette valeur.

**fill** — code à trous. Chaque `___` (trois tirets bas) dans `code` est un trou.
```js
{ type: 'fill', prompt: '...', code: `for i in ___(3):\n    print(i)`,
  blanks: [
    { answers: ['range'],                     // réponses acceptées (la première sert à la vérification)
      options: ['range', 'len', 'list'],      // optionnel : propose des choix (sinon saisie libre)
      why: { 'len': 'len donne une longueur, pas une suite de nombres.' } }   // optionnel : erreurs fréquentes
  ],
  output: `0\n1\n2`,              // optionnel : sortie attendue du code complété (vérifiée)
  hint: '...', explain: '...' }
```
Saisie libre : les réponses sont comparées sans tenir compte des espaces autour. Prévois toutes les écritures
correctes raisonnables dans `answers` (ex. `["'a'", '"a"']`).

**order** — remettre des lignes dans l'ordre.
```js
{ type: 'order', prompt: '...',
  lines: ['ligne 1', '    ligne 2', 'ligne 3'],   // dans le BON ordre (l'appli mélange). Indentation incluse.
  output: `...`,                  // optionnel : sortie du programme remis en ordre (vérifiée)
  hint: '...', explain: '...' }
```
3 à 7 lignes. Une seule ordonnance correcte doit exister (évite les lignes interchangeables, ou rends-les
différentes). Lignes toutes différentes.

**bug** — trouver la ligne fautive, puis choisir la correction.
```js
{ type: 'bug', prompt: 'Ce code devrait afficher … mais …. Clique sur la ligne fautive.',
  code: `...`,
  bugLine: 3,                     // numéro de ligne (1 = première) de la ligne fautive
  why: 'Explication du bug (affichée après la bonne ligne ou la solution).',
  fixes: ['correction A', 'correction B', 'correction C'],   // textes de remplacement de la ligne fautive
  fixAnswer: 0,
  fixWhy: { 1: 'Pourquoi B ne corrige pas.', 2: '...' },
  output: `...`,                  // optionnel : sortie du code une fois corrigé avec fixes[fixAnswer] (vérifiée)
  hint: '...', explain: '...' }
```
Les corrections remplacent la ligne entière : garde l'indentation d'origine dans `fixes`.

**code** — écrire ou modifier du code, vérifié par des tests réellement exécutés.
Uniquement pour `python`, `javascript`, `html` (HTML + CSS) et `sql`.
```js
// Python : le code de l'apprenant s'exécute, puis chaque test s'exécute dans le même espace de noms.
{ type: 'code', lang: 'python', prompt: '...',
  starter: `def carre(n):\n    # ton code ici\n    pass\n`,
  solution: `def carre(n):\n    return n * n\n`,
  tests: [ { code: 'assert carre(3) == 9', label: 'carre(3) renvoie 9' } ],
  expectOutput: `...`,            // optionnel : la sortie complète du programme doit être exactement celle-ci
  stdin: `Alice\n17\n`,           // optionnel : réponses aux input()
  files: { 'notes.txt': '...' },  // optionnel : fichiers virtuels lisibles avec open()
  checks: [ { re: 'for\\s', label: 'Utilise une boucle for' } ],   // optionnel : contraintes sur le texte du code
  hint: '...', explain: '...' }

// JavaScript : même principe. Dans les tests : assert(condition, 'message') et assertEqual(a, b) (égalité profonde).
// Les tests peuvent utiliser await. console.log est capturé.
{ type: 'code', lang: 'javascript', starter: `...`, solution: `...`,
  tests: [ { code: 'assertEqual(double([1, 2]), [2, 4])', label: '...' } ], expectOutput: `...` }

// JavaScript avec une page (DOM) : ajoute dom: true et html. Le code et les tests tournent dans la page.
{ type: 'code', lang: 'javascript', dom: true,
  html: `<button id="b">0</button>`,
  starter: `...`, solution: `...`,
  tests: [ { code: "document.querySelector('#b').click(); assert(document.querySelector('#b').textContent === '1')", label: '...' } ] }

// HTML/CSS : starter et solution sont des fragments HTML (avec <style> si besoin). Les vérifications lisent
// la page rendue et les styles calculés (valeurs telles que le navigateur les calcule : 'flex', '16px', 'rgb(255, 0, 0)').
{ type: 'code', lang: 'html', starter: `...`, solution: `...`,
  checks: [
    { sel: 'h1', label: 'Un titre principal h1' },                    // existe
    { sel: 'nav a', count: 3, label: 'Trois liens' },                // nombre exact (min, max possibles)
    { sel: 'img', attr: 'alt', label: 'Les images ont un attribut alt' },
    { sel: 'input', attrs: { type: 'email' }, label: '...' },
    { sel: 'h1', text: 'Bonjour', label: '...' },
    { sel: '.carte', style: { display: 'flex' }, label: '...' },     // valeur calculée (ou liste de valeurs)
    { sel: '.grille', style: { 'grid-template-columns': '100px 100px' }, vw: 360, label: '...' },  // à 360 px de large
    { none: 'font', label: 'Pas de balise obsolète font' }
  ] }

// SQL (SQLite) : la requête de l'apprenant et la solution s'exécutent sur la même base ; les résultats sont comparés.
{ type: 'code', lang: 'sql', db: 'boutique',  // jeu de données déclaré avec CQ.addDataset, ou setup: `CREATE TABLE ...`
  starter: `SELECT `, solution: `SELECT nom FROM clients WHERE ville = 'Lyon'`,
  ordered: false,                 // true si l'ordre des lignes compte (ORDER BY demandé)
  verify: `SELECT * FROM clients`,   // optionnel pour INSERT/UPDATE/DELETE : requête comparée après exécution
  hint: '...', explain: '...' }
```
Pour chaque exercice `code` : le `starter` ne doit PAS passer les tests (le validateur le vérifie), la
`solution` doit les passer. 2 à 5 tests, avec des `label` compréhensibles (« moyenne([]) renvoie 0 »).

**logic** — petit défi de logique, réponse courte (nombre ou mot).
```js
{ type: 'logic', prompt: '...', code: `...` /* optionnel */, answer: '42', accept: ['quarante-deux'],
  mistakes: [ { answer: '41', why: '...' } ], hint: '...', explain: '...' }
```

## 4. Python exécuté dans CodeQuest (MiniPy)

Le Python de CodeQuest est exécuté par MiniPy, un interpréteur d'un sous-ensemble de Python 3 écrit en JavaScript.
Les exercices `code`, `predict`, `fill`, `order`, `bug` en Python doivent rester dans ce sous-ensemble :

- Types : int (précision illimitée), float, str, bool, None, list, tuple, dict, set, range.
- Opérateurs : + - * / // % **, comparaisons (enchaînées aussi), and or not, in, not in, is, is not,
  expression conditionnelle `a if c else b`, affectations augmentées (+= etc.), affectation multiple et
  dépaquetage (`a, b = b, a`, `for k, v in d.items()`, `premier, *reste = liste`).
- Instructions : if/elif/else, for/while (avec break, continue, else), def (valeurs par défaut, arguments nommés,
  *args, **kwargs), return, lambda, global, nonlocal, pass, del, assert, try/except/else/finally, raise,
  class (héritage, super(), méthodes, attributs de classe, @staticmethod, @classmethod, @property, __init__,
  __str__, __repr__, __eq__, __lt__, __len__, __add__, __contains__, __getitem__, __iter__ simple),
  with (fichiers), import / from … import … / as.
- Compréhensions de liste, dict, set, et générateurs dans un appel (`sum(x * x for x in l)`).
- f-strings avec format (`{x:.2f}`, `{x:>8}`, `{x:05d}`, `{x:,}`, `{x:.1%}`, `{x!r}`, `{x=}`), str.format, `%`.
- Fonctions : print (sep, end), input, len, range, int, float, str, bool, list, tuple, dict, set, type, isinstance,
  abs, min, max (key, default), sum, sorted (key, reverse), reversed, enumerate (start), zip, map, filter, round,
  pow, divmod, ord, chr, hex, bin, any, all, repr, iter, next, hasattr, getattr, setattr.
- Méthodes usuelles de str, list, dict, set, tuple.
- Modules : math, random (valeurs différentes de CPython : jamais de sortie attendue qui dépend du hasard),
  string, collections (Counter, defaultdict, deque, namedtuple), json (dumps, loads), csv (reader, DictReader,
  writer), time (time), statistics (mean, median), functools (reduce).
- Fichiers : `open()` lit et écrit dans un système de fichiers virtuel en mémoire, propre à chaque exécution,
  pré-rempli par `files` dans l'exercice. Modes r, w, a ; read, readline, readlines, write, itération ligne à ligne.
- Messages d'erreur identiques à CPython 3.13 pour les erreurs courantes.

Non disponible : `yield` (générateurs écrits à la main), async, décorateurs maison, numpy, pandas, requests,
sklearn, Flask, accès réseau, `match`, `:=`. Ces notions peuvent être enseignées, mais dans des exercices sans
exécution (qcm, fill, order, bug, predict non vérifié par MiniPy) : dans ce cas mets `run: false` sur l'exercice
pour dire « non exécuté dans l'appli ». Le validateur exécute quand même ce code avec le vrai Python (numpy et
pandas sont installés pour la vérification).

Ne jamais afficher directement un `set` de chaînes ni dépendre de l'ordre d'un set (utilise `sorted(...)`).
Pas de sortie qui dépend du hasard, de l'heure ou de la machine.

## 5. JavaScript exécuté dans CodeQuest

Le JavaScript tourne dans un Worker isolé (sans accès à l'appli). Pas de DOM sauf avec `dom: true`.
`fetch` y est remplacé par un **faux serveur d'entraînement** qui répond aux adresses
`https://api.codequest.test/...` (aucune requête ne part sur Internet) ; la leçon doit le dire clairement.
Routes du faux serveur :
- `GET /users` → `[{ "id": 1, "nom": "Ada" }, { "id": 2, "nom": "Linus" }, { "id": 3, "nom": "Grace" }]`
- `GET /users/1` (2, 3) → l'objet correspondant ; `/users/99` → statut 404 et `{ "erreur": "introuvable" }`
- `GET /meteo?ville=Lyon` → `{ "ville": "Lyon", "temperature": 18, "ciel": "nuageux" }` (toute ville : température 18)
- `POST /users` avec un corps JSON `{ "nom": "..." }` → statut 201 et `{ "id": 4, "nom": "..." }`
- toute autre adresse → statut 404.
Les objets renvoyés ont `ok`, `status`, `json()` et `text()`.

## 6. Vérification

```
node codequest/tools/validate.mjs codequest/src/content/mon-fichier.js
```
Exercices HTML : si le code contient `<!doctype` ou `<html`, il est rendu comme un document complet ; sinon il est placé dans le `<body>` d'une page.

Le validateur contrôle la structure, puis exécute le code avec les vrais outils (python3, node, gcc, g++, java,
php, bash, tsc, SQLite via sql.js, Chromium pour le HTML/CSS et le DOM). Corrige toutes les erreurs.
Les avertissements « non vérifié » (C#, Dart, Git) demandent une relecture attentive à la main.

## 7. Plan des parcours (identifiants fixés)

- `py` Python : chapitres py.c1 à py.c6, unités py.u1 à py.u21 (voir la liste dans le cahier des charges).
- `web` HTML et CSS : web.u1 à web.u14.
- `js` JavaScript : js.u1 à js.u16. js.u8 (DOM) demande `web.u2`.
- `git` Git et outils : git.u1 à git.u12.
- `sql` SQL et bases de données : sql.u1 à sql.u12.
- `api` Back-end et API : api.u1 à api.u12. Parcours qui demande `js.u6`.
- `data` Data science et IA : data.u1 à data.u19. Parcours qui demande `py.u9`.
- `autres` Autres langages : unlock 'chapter', un chapitre par langage (C, C++, Java, C#, PHP, TypeScript, Bash,
  Dart et Flutter) plus un chapitre « Comparer les langages ». Parcours qui demande `py.u9`.
