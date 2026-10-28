// Parcours JavaScript, chapitre 4 : JavaScript moderne (js.u11 à js.u16).
// js.u11 (modules) n'est pas exécutable dans CodeQuest : import/export sont enseignés par qcm, fill et bug,
// et l'exercice de code porte sur une fonction pure. js.u13 utilise le faux serveur https://api.codequest.test.
CQ.addChapter('js', {
  id: 'js.c4',
  title: 'JavaScript moderne',
  units: [
    // ------------------------------------------------------------------ js.u11
    {
      id: 'js.u11',
      title: 'Modules',
      summary: 'Découper un programme en fichiers avec import et export.',
      lessons: [
        {
          id: 'js.u11.l1',
          title: 'import et export',
          minutes: 6,
          objective: "Tu sais exporter une fonction d'un fichier, l'importer dans un autre, et distinguer export nommé et export par défaut.",
          explain:
            "Un **module** est un fichier JavaScript qui choisit ce qu'il partage. Tout le reste lui est privé : ses variables ne débordent pas sur les autres fichiers.\n\n" +
            "- Export nommé : `export function formaterPrix(c) { ... }` ou `export const TVA = 0.2;`. On l'importe entre accolades, sous le **même nom** : `import { formaterPrix, TVA } from './prix.js';`. Pour renommer : `import { TVA as taux } from './prix.js';`.\n" +
            "- Export par défaut, un seul par fichier : `export default function prixTTC(c) { ... }`. On l'importe sans accolades, sous le nom de son choix : `import calculerTTC from './prix.js';`.\n" +
            "- `import * as prix from './prix.js'` regroupe tout dans un objet, comme `import prix` en Python.\n\n" +
            "Le chemin commence par `./` ou `../` pour un fichier du projet, avec l'extension `.js` dans le navigateur. Une page charge son script principal avec `<script type=\"module\" src=\"app.js\"></script>`.\n\n" +
            "Les modules ne s'exécutent pas dans CodeQuest : les exercices de code portent sur les fonctions qu'on y range. À essayer sur ton ordinateur : deux fichiers `.mjs` lancés avec `node app.mjs`.",
          example: {
            code: `// fichier prix.js
export const TVA = 0.2;
export function formaterPrix(centimes) {
  return \`\${(centimes / 100).toFixed(2)} €\`;
}
export default function prixTTC(centimes) {
  return Math.round(centimes * (1 + TVA));
}

// fichier app.js
import prixTTC, { formaterPrix } from './prix.js';
console.log(formaterPrix(prixTTC(1000)));`,
            run: false,
            notes: [
              { line: 2, text: "Export nommé : il s'importe entre accolades, sous le même nom." },
              { line: 4, text: "`toFixed(2)` écrit un nombre avec 2 décimales : `'12.00'`." },
              { line: 6, text: "Export par défaut : un seul par fichier, importé sans accolades." },
              { line: 11, text: "L'export par défaut et un export nommé en une ligne. `TVA` n'est pas importé : `app.js` ne peut pas l'utiliser directement." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: "Complète les deux fichiers : `texte.js` partage la fonction `majuscule`, et `app.js` l'importe.",
              code: `// fichier texte.js
___ function majuscule(mot) {
  return mot[0].toUpperCase() + mot.slice(1);
}

// fichier app.js
import { majuscule } ___ '___';
console.log(majuscule('codequest'));`,
              blanks: [
                {
                  answers: ['export'],
                  options: ['export', 'import', 'module', 'public'],
                  why: {
                    import: "`import` sert à récupérer ce qu'un autre fichier partage, pas à partager.",
                    module: "`module` n'est pas un mot-clé de déclaration en JavaScript.",
                    public: "`public` existe dans d'autres langages (Java, C#), pas pour les modules JavaScript."
                  }
                },
                {
                  answers: ['from'],
                  options: ['from', 'in', 'of', '='],
                  why: {
                    in: "`in` sert aux boucles et aux tests de clés ; un import s'écrit `import { ... } from '...'`.",
                    of: "`of` sert à la boucle `for...of`.",
                    '=': "Un import n'est pas une affectation : la syntaxe est `import { nom } from 'chemin'`."
                  }
                },
                {
                  answers: ['./texte.js'],
                  why: {
                    'texte.js': "Sans `./`, le navigateur cherche un paquet nommé `texte.js`, pas un fichier de ton projet.",
                    './texte': "Dans le navigateur, l'extension `.js` est obligatoire dans le chemin.",
                    texte: "Il faut un chemin relatif complet : `./texte.js`."
                  }
                }
              ],
              hint: "Le chemin vers un fichier du même dossier commence par un point et une barre oblique.",
              explain: "`export` rend la fonction visible hors de `texte.js`. `import { majuscule } from './texte.js'` la récupère sous le même nom. Le chemin relatif avec son extension est indispensable dans le navigateur."
            },
            {
              type: 'code',
              prompt: "Une fonction rangée dans un module doit être **pure** : elle ne dépend que de ses arguments et ne touche à rien d'autre, ce qui la rend facile à tester. Écris `slugifier(titre)`, que le module `texte.js` exporterait (la ligne `export` est retirée, non exécutable ici) : minuscules, espaces autour retirés, et chaque groupe d'espaces remplacé par un tiret. `'  Mon Projet  IA '` donne `'mon-projet-ia'`.",
              starter: `function slugifier(titre) {
  return titre.toLowerCase();
}
`,
              solution: `function slugifier(titre) {
  return titre
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(mot => mot !== '')
    .join('-');
}
`,
              tests: [
                { code: "assertEqual(slugifier('Projet IA'), 'projet-ia');", label: "slugifier('Projet IA') renvoie 'projet-ia'" },
                { code: "assertEqual(slugifier('  Mon Projet  IA '), 'mon-projet-ia');", label: 'espaces autour et espaces doubles gérés' },
                { code: "assertEqual(slugifier('Notes'), 'notes');", label: "slugifier('Notes') renvoie 'notes'" },
                { code: "assertEqual(slugifier(''), '');", label: "slugifier('') renvoie ''" }
              ],
              hint: "`split(' ')` découpe comme en Python, mais garde des morceaux vides entre deux espaces : filtre-les avant `join('-')`. Attention, `join` s'appelle sur le tableau : `mots.join('-')`.",
              explain: "`trim` retire les espaces autour, `split(' ')` découpe aux espaces, `filter` élimine les morceaux vides dus aux espaces doubles, et `join('-')` recolle avec des tirets. Aucun effet de bord : même entrée, même sortie."
            }
          ],
          challenge: {
            type: 'bug',
            prompt: "Au chargement, le navigateur signale : `The requested module './meteo.js' does not provide an export named 'default'`. Clique sur la ligne fautive.",
            code: `// fichier meteo.js
export function formaterMeteo(ville, degres) {
  return \`\${ville} : \${degres} °C\`;
}

// fichier app.js
import formaterMeteo from './meteo.js';
console.log(formaterMeteo('Lyon', 18));`,
            bugLine: 7,
            why: "`meteo.js` fait un export **nommé**. Sans accolades, `import formaterMeteo` réclame l'export par défaut, qui n'existe pas dans ce module.",
            fixes: [
              "import { formaterMeteo } from './meteo.js';",
              "import formaterMeteo from 'meteo.js';",
              "import { default } from './meteo.js';"
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "Le problème n'est pas le chemin mais la forme de l'import : sans accolades, on demande toujours l'export par défaut. Et sans `./`, le chemin deviendrait faux en plus.",
              2: "`default` est un mot réservé : cette syntaxe est invalide, et le module n'a de toute façon pas d'export par défaut."
            },
            hint: "Le message parle d'export « default » : quel type d'export le fichier `meteo.js` propose-t-il ?",
            explain: "Avec les accolades, on importe l'export nommé `formaterMeteo`. L'autre solution serait de modifier `meteo.js` en `export default function formaterMeteo(...)`, mais le code qui l'importe ailleurs devrait suivre."
          },
          recap: [
            "`export function f` / `export const X` : exports nommés, importés entre accolades.",
            "`export default` : un seul par fichier, importé sans accolades sous le nom de ton choix.",
            "Chemin relatif avec extension : `'./prix.js'`.",
            "Dans une page : `<script type=\"module\">`. Range des fonctions pures dans tes modules."
          ],
          check: {
            type: 'qcm',
            prompt: "Le fichier `panier.js` contient ceci. Quelle ligne de `app.js` importe correctement les deux fonctions ?",
            code: `// fichier panier.js
export default function creerPanier() {
  return [];
}
export function total(panier) {
  return panier.reduce((s, a) => s + a.prix, 0);
}`,
            run: false,
            choices: [
              "`import creerPanier, { total } from './panier.js';`",
              "`import { creerPanier, total } from './panier.js';`",
              "`import creerPanier, total from './panier.js';`",
              "`import * from './panier.js';`"
            ],
            answer: 0,
            why: {
              1: "`creerPanier` est l'export par défaut : il s'importe sans accolades. Entre accolades, on ne trouve que les exports nommés.",
              2: "`total` est un export nommé : il doit être entre accolades.",
              3: "`import *` exige un nom : `import * as panier from './panier.js'`, puis `panier.total(...)`. L'export par défaut serait alors `panier.default`."
            },
            hint: "Repère quelle fonction est l'export par défaut, et laquelle est nommée.",
            explain: "L'export par défaut vient en premier, sans accolades ; les exports nommés suivent entre accolades. Une seule ligne suffit pour les deux."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u12
    {
      id: 'js.u12',
      title: 'Promesses et async/await',
      summary: "Comprendre l'asynchrone : promesses, async/await et ordre d'exécution.",
      lessons: [
        {
          id: 'js.u12.l1',
          title: "Promesses, await et ordre d'exécution",
          minutes: 8,
          objective: "Tu sais attendre le résultat d'une promesse avec `await` et prévoir l'ordre d'affichage d'un code qui mélange code synchrone, promesses et `setTimeout`.",
          explain:
            "Une opération lente (réseau, minuterie) ne bloque pas JavaScript : elle renvoie tout de suite une **promesse**, un objet qui recevra le résultat plus tard. Une promesse est d'abord en attente, puis tenue (avec une valeur) ou rompue (avec une erreur).\n\n" +
            "`promesse.then(f)` appelle `f` avec la valeur quand elle arrive. Plus lisible : dans une fonction déclarée `async`, `await promesse` met **cette fonction** en pause jusqu'au résultat, sans bloquer le reste du programme. Une fonction `async` renvoie toujours une promesse. C'est proche d'`asyncio` en Python, sans `asyncio.run` : le moteur gère seul la boucle d'événements.\n\n" +
            "**Ordre d'exécution**, en version simplifiée :\n\n" +
            "- d'abord, tout le code synchrone, jusqu'au bout ;\n" +
            "- ensuite, les suites de promesses (`then`, reprises après un `await`) ;\n" +
            "- enfin, les minuteries (`setTimeout`), même avec un délai de 0.\n\n" +
            "`setTimeout(f, ms)` appelle `f` au bout de `ms` millisecondes au plus tôt. `Promise.all([p1, p2])` attend plusieurs promesses lancées en même temps et donne le tableau de leurs résultats, dans l'ordre.",
          example: {
            code: `function attendre(ms, valeur) {
  return new Promise(resolve => setTimeout(() => resolve(valeur), ms));
}
async function chargerProfil() {
  console.log('2. chargement...');
  const nom = await attendre(20, 'Ada');
  console.log('4. profil de', nom);
  return nom.length;
}
console.log('1. début');
chargerProfil().then(n => console.log('5. longueur', n));
console.log('3. fin du code synchrone');`,
            output: `1. début
2. chargement...
3. fin du code synchrone
4. profil de Ada
5. longueur 3`,
            notes: [
              { line: 2, text: "`new Promise(resolve => ...)` fabrique une promesse ; `resolve(valeur)` la tient, ici après `ms` millisecondes." },
              { line: 6, text: "`await` met `chargerProfil` en pause ; le programme continue ligne 12 en attendant." },
              { line: 8, text: "Le `return` d'une fonction `async` devient la valeur de la promesse qu'elle renvoie, reçue par le `then` de la ligne 11." },
              { line: 11, text: "Une fonction `async` s'exécute normalement jusqu'à son premier `await` : d'où le « 2 » avant le « 3 »." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
              answer: `A
D
C
B`,
              mistakes: [
                { answer: `A
B
C
D`, why: "Les rappels ne s'exécutent jamais au milieu du code synchrone : `A` puis `D` d'abord, quoi qu'il arrive." },
                { answer: `A
D
B
C`, why: "Les suites de promesses passent avant les minuteries, même quand le délai vaut 0." }
              ],
              hint: "Range chaque ligne dans une des trois catégories : synchrone, suite de promesse, minuterie.",
              explain: "`A` et `D` sont synchrones. `Promise.resolve()` est déjà tenue : son `then` passe juste après le code synchrone (`C`). La minuterie, même à 0 ms, vient en dernier (`B`)."
            },
            {
              type: 'order',
              prompt: "Remets dans l'ordre ce programme qui simule deux appels lents à un modèle d'IA, lancés **en même temps**, puis affiche `[ 5, 11 ]`.",
              lines: [
                'const analyser = (texte) => {',
                '  return new Promise(resolve => setTimeout(() => resolve(texte.length), 10));',
                '};',
                "const promesses = [analyser('Salut'), analyser('Hello world')];",
                'Promise.all(promesses).then(resultats => {',
                '  console.log(resultats);',
                '});'
              ],
              output: '[ 5, 11 ]',
              hint: "Une fonction fléchée rangée dans une `const` doit être définie avant d'être appelée.",
              explain: "On définit `analyser`, on lance les deux appels (les deux promesses démarrent en même temps), puis `Promise.all` attend les deux et donne leurs résultats dans l'ordre du tableau, quel que soit celui qui finit en premier."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "`analyserTout` doit renvoyer les résultats du modèle pour chaque texte, dans l'ordre, sous forme de tableau de **nombres**. Pour l'instant, elle renvoie des promesses en attente. Corrige-la. Bonus : lance tous les appels en même temps avec `Promise.all`.",
            starter: `// Simule un modèle d'IA lent : renvoie une promesse du nombre de mots.
function predire(texte) {
  return new Promise(resolve => {
    setTimeout(() => resolve(texte.split(' ').length), 20);
  });
}

async function analyserTout(textes) {
  const resultats = [];
  for (const t of textes) {
    resultats.push(predire(t));
  }
  return resultats;
}
`,
            solution: `// Simule un modèle d'IA lent : renvoie une promesse du nombre de mots.
function predire(texte) {
  return new Promise(resolve => {
    setTimeout(() => resolve(texte.split(' ').length), 20);
  });
}

async function analyserTout(textes) {
  const promesses = textes.map(t => predire(t));
  return Promise.all(promesses);
}
`,
            tests: [
              { code: "assertEqual(await analyserTout(['bonjour', 'il fait beau']), [1, 3]);", label: "analyserTout(['bonjour', 'il fait beau']) donne [1, 3]" },
              { code: "const p = analyserTout(['a b']);\nassert(typeof p.then === 'function', 'analyserTout doit renvoyer une promesse');\nassertEqual(await p, [2]);", label: 'renvoie une promesse qui donne [2]' },
              { code: 'assertEqual(await analyserTout([]), []);', label: 'aucun texte : []' }
            ],
            hint: "`predire(t)` renvoie une promesse : il faut l'attendre avant de ranger son résultat, ou attendre toutes les promesses d'un coup.",
            explain: "Version simple : `resultats.push(await predire(t));`, mais les appels se font l'un après l'autre. Avec `textes.map(predire)` puis `Promise.all`, tous les appels partent en même temps : 20 ms au total au lieu de 20 ms par texte."
          },
          recap: [
            "Une promesse représente un résultat futur ; `await` l'attend dans une fonction `async`.",
            "Une fonction `async` renvoie toujours une promesse.",
            "Ordre : code synchrone, puis suites de promesses, puis minuteries.",
            "`Promise.all` attend plusieurs promesses lancées en même temps."
          ],
          check: {
            type: 'logic',
            prompt: "Dans quel ordre s'affichent les lettres ? Réponds par les 5 lettres collées, par exemple `EDCBA`.",
            code: `setTimeout(() => console.log('E'), 0);
async function charger() {
  console.log('B');
  await Promise.resolve();
  console.log('D');
}
console.log('A');
charger();
console.log('C');`,
            answer: 'ABCDE',
            accept: ['A B C D E', 'A, B, C, D, E', 'abcde'],
            mistakes: [
              { answer: 'ABDCE', why: "`await` rend la main au code appelant : `C` s'affiche avant la reprise de `charger`." },
              { answer: 'EABCD', why: "Le `setTimeout` est écrit en premier, mais sa fonction ne s'exécute qu'après tout le code synchrone et les suites de promesses." },
              { answer: 'ACBDE', why: "Une fonction `async` s'exécute normalement jusqu'à son premier `await` : `B` s'affiche dès l'appel." }
            ],
            hint: "Suis le code synchrone ligne à ligne, en notant ce qui est remis à plus tard.",
            explain: "Synchrone : `A`, puis l'appel de `charger` affiche `B` et s'arrête au `await`, puis `C`. Ensuite la suite de promesse reprend `charger` : `D`. Enfin la minuterie : `E`."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u13
    {
      id: 'js.u13',
      title: 'API et fetch',
      summary: 'Interroger une API web avec fetch et exploiter sa réponse JSON.',
      lessons: [
        {
          id: 'js.u13.l1',
          title: 'Appeler une API avec fetch',
          minutes: 8,
          objective: "Tu sais envoyer une requête avec `fetch`, vérifier le statut de la réponse, lire son JSON et envoyer des données avec POST.",
          explain:
            "Une **API web** répond à des adresses (URL) avec des données, le plus souvent en **JSON**, un format proche des dictionnaires et listes Python. `fetch(url)` envoie la requête et renvoie une promesse de réponse. Il faut deux `await` :\n\n" +
            "- `const res = await fetch(url);` : la réponse arrive, avec son statut `res.status` ;\n" +
            "- `const data = await res.json();` : le corps est lu et converti en objet JavaScript.\n\n" +
            "Piège : `fetch` ne lève pas d'erreur pour un statut d'échec. Un 404 arrive comme une réponse normale : teste `res.ok` (vrai pour les statuts 200 à 299) avant d'utiliser les données.\n\n" +
            "Pour envoyer des données : `fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(objet) })`. `JSON.stringify` transforme un objet en texte JSON, `JSON.parse` fait l'inverse. C'est l'équivalent de `requests` en Python, en asynchrone.\n\n" +
            "**Dans CodeQuest, aucune requête ne part sur Internet** : `fetch` est remplacé par un faux serveur d'entraînement, qui répond aux adresses `https://api.codequest.test/...` : `/users`, `/users/1`, `/meteo?ville=Lyon` et `POST /users`. Toute autre adresse répond 404.",
          example: {
            code: `const API = 'https://api.codequest.test';
async function afficherMeteo(ville) {
  const res = await fetch(\`\${API}/meteo?ville=\${ville}\`);
  if (!res.ok) {
    console.log('Erreur', res.status);
    return;
  }
  const meteo = await res.json();
  console.log(\`\${meteo.ville} : \${meteo.temperature} °C, \${meteo.ciel}\`);
}
afficherMeteo('Lyon');`,
            output: 'Lyon : 18 °C, nuageux',
            notes: [
              { line: 1, text: "L'adresse du faux serveur de CodeQuest : rien ne part sur Internet." },
              { line: 3, text: "`await fetch(...)` attend la réponse : statut et en-têtes, pas encore le corps." },
              { line: 4, text: "Un 404 ne lève pas d'erreur : c'est à toi de tester `res.ok`." },
              { line: 8, text: "Deuxième `await` : la lecture et la conversion du JSON sont aussi asynchrones." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: "Complète `nomUtilisateur(id)` : elle renvoie le nom de l'utilisateur, ou `'inconnu'` si le serveur répond par une erreur.",
              code: `async function nomUtilisateur(id) {
  const res = await ___(\`https://api.codequest.test/users/\${id}\`);
  if (!res.___) {
    return 'inconnu';
  }
  const user = ___ res.json();
  return user.nom;
}
nomUtilisateur(2).then(nom => console.log(nom));
nomUtilisateur(99).then(nom => console.log(nom));`,
              blanks: [
                {
                  answers: ['fetch'],
                  options: ['fetch', 'get', 'request', 'open'],
                  why: {
                    get: "`get` n'est pas une fonction globale en JavaScript (c'est `requests.get` en Python).",
                    request: "Pas de fonction `request` dans le navigateur : on utilise `fetch`.",
                    open: "`open` ouvre une fenêtre ou un fichier, pas une requête HTTP."
                  }
                },
                {
                  answers: ['ok'],
                  options: ['ok', 'status', 'error', 'json'],
                  why: {
                    status: "`res.status` vaut 404 ici, un nombre truthy : `!res.status` serait faux et on lirait le corps d'erreur.",
                    error: "Une réponse n'a pas de propriété `error` : `!res.error` serait toujours vrai.",
                    json: "`res.json` est une méthode qui existe toujours : `!res.json` serait toujours faux."
                  }
                },
                {
                  answers: ['await'],
                  options: ['await', 'async', 'then', 'return'],
                  why: {
                    async: "`async` se place devant une fonction ; pour attendre une promesse, c'est `await`.",
                    then: "`then` est une méthode qui s'appelle avec un point et une fonction : `res.json().then(...)`.",
                    return: "Avec `return`, la fonction s'arrêterait là et la ligne suivante ne s'exécuterait jamais."
                  }
                }
              ],
              output: `Linus
inconnu`,
              hint: "Il faut lancer la requête, vérifier qu'elle a réussi, puis attendre la lecture du corps.",
              explain: "`fetch` lance la requête, `res.ok` vaut `false` pour le 404 de `/users/99`, et `await res.json()` attend l'objet utilisateur. Sans `await`, `user` serait une promesse et `user.nom` vaudrait `undefined`."
            },
            {
              type: 'qcm',
              prompt: "Ce code devrait afficher 3, le nombre d'utilisateurs, mais il affiche `undefined`. Pourquoi ?",
              code: `async function compterUtilisateurs() {
  const res = await fetch('https://api.codequest.test/users');
  const users = res.json();
  console.log(users.length);
}
compterUtilisateurs();`,
              choices: [
                "`res.json()` renvoie une promesse : il manque `await` devant",
                "Le serveur renvoie un objet, pas un tableau",
                "Il faut d'abord appeler `JSON.parse(res)`",
                "`fetch` a échoué : `res` vaut `undefined`"
              ],
              answer: 0,
              why: {
                1: "La route `/users` renvoie bien un tableau de 3 utilisateurs ; le problème est qu'on ne l'a pas encore reçu.",
                2: "`res` est un objet réponse, pas du texte JSON : `res.json()` fait déjà la lecture et la conversion, mais de façon asynchrone.",
                3: "Si `res` valait `undefined`, `res.json()` lèverait une `TypeError` à la ligne 3."
              },
              hint: "Qu'est-ce que `res.json()` renvoie, exactement ?",
              explain: "`res.json()` renvoie une promesse, et une promesse n'a pas de propriété `length`. Avec `const users = await res.json();`, `users` est le tableau et `users.length` vaut 3."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Écris `inscrire(nom)` : elle envoie `{ nom }` en **POST** à `https://api.codequest.test/users`, avec un corps JSON, et renvoie l'utilisateur créé par le serveur. Si la réponse n'est pas `ok` (le serveur refuse un nom vide), elle renvoie `null`.",
            starter: `async function inscrire(nom) {
  const res = await fetch('https://api.codequest.test/users');
  return res.json();
}
`,
            solution: `async function inscrire(nom) {
  const res = await fetch('https://api.codequest.test/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom }),
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}
`,
            tests: [
              { code: "assertEqual(await inscrire('Margaret'), { id: 4, nom: 'Margaret' });", label: "inscrire('Margaret') renvoie { id: 4, nom: 'Margaret' }" },
              { code: "assertEqual(await inscrire(''), null);", label: "un nom vide est refusé : inscrire('') renvoie null" }
            ],
            hint: "Le deuxième argument de `fetch` est un objet d'options : `method`, `headers` et `body`. Le corps doit être du texte : pense à `JSON.stringify`.",
            explain: "Sans `method: 'POST'`, `fetch` fait un GET. Sans `JSON.stringify`, le corps serait le texte `'[object Object]'`, illisible pour le serveur. L'en-tête `Content-Type` annonce du JSON : le faux serveur ne le vérifie pas, mais un vrai serveur en a besoin."
          },
          recap: [
            "`await fetch(url)` donne la réponse, `await res.json()` donne les données.",
            "Un 404 n'est pas une erreur pour `fetch` : teste toujours `res.ok`.",
            "POST : `method`, `headers` et `body: JSON.stringify(objet)`.",
            "Dans CodeQuest, `fetch` parle à un faux serveur : rien ne part sur Internet."
          ],
          check: {
            type: 'predict',
            prompt: "Qu'affiche ce programme ? (Rappel : sur le faux serveur, `/users/99` n'existe pas.)",
            code: `async function main() {
  const res = await fetch('https://api.codequest.test/users/99');
  console.log(res.ok, res.status);
  const data = await res.json();
  console.log(data.erreur);
}
main();`,
            answer: `false 404
introuvable`,
            mistakes: [
              { answer: `true 404
introuvable`, why: "`res.ok` n'est vrai que pour les statuts 200 à 299 : avec 404, il vaut `false`." },
              { answer: `false 404
undefined`, why: "Le serveur renvoie quand même un corps JSON avec le 404 : `{ erreur: 'introuvable' }`. `res.json()` le lit normalement." },
              { answer: 'Error: 404', why: "`fetch` ne lève pas d'erreur pour un statut d'échec : le programme continue normalement." }
            ],
            hint: "`fetch` ne lève pas d'erreur sur un 404 : la réponse arrive, avec son statut et son corps.",
            explain: "La requête aboutit : la réponse a le statut 404, donc `ok` vaut `false`. Son corps JSON contient le message d'erreur du serveur, lu comme n'importe quelle donnée."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u14
    {
      id: 'js.u14',
      title: 'Gestion des erreurs',
      summary: 'Lever, attraper et traiter les erreurs, y compris dans le code asynchrone.',
      lessons: [
        {
          id: 'js.u14.l1',
          title: 'try, catch, finally et throw',
          minutes: 8,
          objective: "Tu sais lever une erreur avec `throw`, l'attraper avec `try...catch`, exécuter un nettoyage avec `finally` et gérer l'échec d'un `await`.",
          explain:
            "Le mécanisme ressemble à celui de Python : `try { ... } catch (e) { ... } finally { ... }` correspond à `try / except / finally`.\n\n" +
            "- `throw new Error('message')` lève une erreur, comme `raise`. L'objet a un `name` (`'Error'`, `'TypeError'`...) et un `message`.\n" +
            "- `catch (e)` attrape **toutes** les erreurs : pas de filtre par type comme `except ValueError`. Pour trier, teste `e instanceof TypeError`, et relance avec `throw e` ce que tu ne sais pas traiter.\n" +
            "- `finally` s'exécute dans tous les cas, erreur ou pas, même après un `return` : idéal pour masquer un indicateur de chargement.\n\n" +
            "Avec `async`/`await`, une promesse rompue devient une erreur levée à la ligne du `await` : un `try...catch` classique l'attrape. Sans `await`, l'erreur arrive plus tard, hors du `try`, et passe à travers. Dans une fonction `async`, `throw` rompt la promesse renvoyée.\n\n" +
            "N'attrape une erreur que si tu sais quoi en faire : un `catch` vide cache les bugs.",
          example: {
            code: `function lireReglages(texte) {
  try {
    const reglages = JSON.parse(texte);
    if (typeof reglages.taille !== 'number') {
      throw new Error('taille manquante');
    }
    return reglages.taille;
  } catch (e) {
    console.log(\`\${e.name} : réglages par défaut\`);
    return 16;
  } finally {
    console.log('lecture terminée');
  }
}
console.log(lireReglages('{"taille": 20}'));
console.log(lireReglages('pas du JSON'));`,
            output: `lecture terminée
20
SyntaxError : réglages par défaut
lecture terminée
16`,
            notes: [
              { line: 3, text: "`JSON.parse` lève une `SyntaxError` si le texte n'est pas du JSON valide." },
              { line: 5, text: "`throw` lève notre propre erreur : l'exécution saute directement au `catch`." },
              { line: 9, text: "Le `catch` reçoit l'objet erreur, avec son `name` et son `message`." },
              { line: 12, text: "`finally` s'exécute même après le `return` de la ligne 7 : d'où « lecture terminée » avant 20." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `function diviser(a, b) {
  try {
    if (b === 0) {
      throw new Error('division par zéro');
    }
    return a / b;
  } catch (e) {
    return e.message;
  } finally {
    console.log('fin');
  }
}
console.log(diviser(10, 2));
console.log(diviser(1, 0));`,
              answer: `fin
5
fin
division par zéro`,
              mistakes: [
                { answer: `5
fin
division par zéro
fin`, why: "`finally` s'exécute avant que la fonction ne rende la main : « fin » s'affiche avant que `console.log` reçoive le résultat." },
                { answer: `fin
5
fin
Infinity`, why: "En JavaScript, `1 / 0` donne bien `Infinity` sans erreur, mais ici le `throw` de la ligne 4 a lieu avant la division." },
                { answer: `5
division par zéro`, why: "Le bloc `finally` s'exécute à chaque appel, qu'il y ait une erreur ou non." }
              ],
              hint: "Le `finally` s'exécute pendant l'appel de `diviser`, avant que son résultat ne soit affiché.",
              explain: "Premier appel : `return 5`, mais `finally` affiche « fin » avant que la valeur ne sorte. Deuxième appel : le `throw` saute au `catch`, qui renvoie le message, puis `finally` affiche « fin ». Note : sans le test, `1 / 0` donnerait `Infinity`, là où Python lève une `ZeroDivisionError`."
            },
            {
              type: 'bug',
              prompt: "Avec `afficher(99)`, on attend « Erreur : Profil 99 introuvable ». On obtient « Bonjour undefined », puis une erreur non attrapée dans la console. Clique sur la ligne fautive.",
              code: `async function chargerProfil(id) {
  const res = await fetch(\`https://api.codequest.test/users/\${id}\`);
  if (!res.ok) {
    throw new Error(\`Profil \${id} introuvable\`);
  }
  return res.json();
}
async function afficher(id) {
  try {
    const profil = chargerProfil(id);
    console.log('Bonjour', profil.nom);
  } catch (e) {
    console.log('Erreur :', e.message);
  }
}`,
              bugLine: 10,
              why: "Sans `await`, `chargerProfil(id)` renvoie une promesse en attente : aucune erreur n'est levée dans le `try`, et `profil.nom` vaut `undefined`. Quand la promesse est rompue plus tard, le `catch` est déjà passé.",
              fixes: [
                '    const profil = await chargerProfil(id);',
                '    const profil = chargerProfil(id).nom;',
                '    const profil = await chargerProfil;'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`chargerProfil(id)` est une promesse : elle n'a pas de propriété `nom`, et son erreur échapperait toujours au `try`.",
                2: "Sans parenthèses, on attend la fonction elle-même, pas son résultat : elle n'est jamais appelée."
              },
              hint: "Que contient `profil` juste après la ligne 10 ?",
              explain: "Avec `await`, la promesse rompue devient une erreur levée à la ligne 10, à l'intérieur du `try` : le `catch` l'attrape et affiche le message."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `profil(id)` : elle lève une `TypeError('id invalide')` si `id` n'est pas un entier (teste avec `Number.isInteger(id)`), puis une `Error('introuvable')` si la réponse du serveur n'est pas `ok`. Puis modifie `message(id)` pour qu'elle ne plante jamais : `'Bonjour Ada'` si tout va bien, `'Identifiant invalide'` pour une `TypeError`, `'Profil introuvable'` pour toute autre erreur.",
            starter: `const API = 'https://api.codequest.test';

async function profil(id) {
  // 1. lève une TypeError si id n'est pas un entier
  const res = await fetch(\`\${API}/users/\${id}\`);
  // 2. lève une Error('introuvable') si la réponse n'est pas ok
  return res.json();
}

async function message(id) {
  const u = await profil(id);
  return \`Bonjour \${u.nom}\`;
}
`,
            solution: `const API = 'https://api.codequest.test';

async function profil(id) {
  if (!Number.isInteger(id)) {
    throw new TypeError('id invalide');
  }
  const res = await fetch(\`\${API}/users/\${id}\`);
  if (!res.ok) {
    throw new Error('introuvable');
  }
  return res.json();
}

async function message(id) {
  try {
    const u = await profil(id);
    return \`Bonjour \${u.nom}\`;
  } catch (e) {
    if (e instanceof TypeError) {
      return 'Identifiant invalide';
    }
    return 'Profil introuvable';
  }
}
`,
            tests: [
              { code: "assertEqual(await message(1), 'Bonjour Ada');", label: "message(1) renvoie 'Bonjour Ada'" },
              { code: "assertEqual(await message(99), 'Profil introuvable');", label: "message(99) renvoie 'Profil introuvable'" },
              { code: "assertEqual(await message('abc'), 'Identifiant invalide');", label: "message('abc') renvoie 'Identifiant invalide'" },
              { code: "let recu = null;\ntry {\n  await profil(99);\n} catch (e) {\n  recu = e.message;\n}\nassertEqual(recu, 'introuvable');", label: "profil(99) lève une erreur « introuvable »" }
            ],
            hint: "Les `throw` vont dans `profil` ; le `try...catch` va dans `message`, autour du `await`. Dans le `catch`, `e instanceof TypeError` distingue les deux cas.",
            explain: "`profil` signale les problèmes avec `throw` sans décider quoi afficher ; `message` les attrape et choisit le texte. Ce partage des rôles est courant : la fonction bas niveau signale, la fonction proche de l'interface décide."
          },
          recap: [
            "`throw new Error('...')` lève une erreur ; `catch (e)` l'attrape, avec `e.name` et `e.message`.",
            "`catch` attrape tout : trie avec `instanceof`, relance ce que tu ne sais pas traiter.",
            "`finally` s'exécute toujours, même après un `return`.",
            "Pour attraper l'échec d'une promesse, il faut `await` dans le `try`."
          ],
          check: {
            type: 'logic',
            prompt: "Que vaut `journal` à la fin du programme ? Réponds par le texte, sans guillemets.",
            code: `let journal = '';
function etape(n) {
  try {
    journal += 'a';
    if (n > 1) {
      throw new Error('trop grand');
    }
    journal += 'b';
    return n;
  } catch (e) {
    journal += 'c';
  } finally {
    journal += 'd';
  }
}
etape(1);
etape(2);`,
            answer: 'abdacd',
            mistakes: [
              { answer: 'abacd', why: "`finally` s'exécute aussi quand le `try` se termine par un `return` : il ajoute `d` après `ab`." },
              { answer: 'abdacbd', why: "Après le `throw`, le reste du `try` est sauté : `b` n'est pas ajouté pendant `etape(2)`." },
              { answer: 'abdabcd', why: "Le `throw` a lieu avant `journal += 'b'` : pendant `etape(2)`, on passe de `a` directement au `catch`." }
            ],
            hint: "Déroule chaque appel séparément : quelles lignes du `try` s'exécutent, puis le `catch` a-t-il lieu ?",
            explain: "`etape(1)` : `a`, pas d'erreur, `b`, puis `return`, mais `finally` ajoute `d` avant de sortir : `abd`. `etape(2)` : `a`, le `throw` saute au `catch` (`c`), puis `finally` (`d`) : `acd`. Total : `abdacd`."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u15
    {
      id: 'js.u15',
      title: 'Tests',
      summary: "Écrire des tests qui prouvent qu'une fonction marche, et qui détectent quand elle casse.",
      lessons: [
        {
          id: 'js.u15.l1',
          title: 'Écrire des tests utiles',
          minutes: 8,
          objective: "Tu sais écrire des tests avec `assert` et `assertEqual` qui couvrent les cas normaux et les cas limites d'une fonction, et lire un test écrit pour Jest ou Vitest.",
          explain:
            "Un test appelle une fonction avec une entrée connue et vérifie le résultat. CodeQuest fournit deux outils :\n\n" +
            "- `assert(condition, 'message')` lève une erreur avec ce message si la condition est fausse ;\n" +
            "- `assertEqual(obtenu, attendu)` compare en profondeur : le contenu des tableaux et objets, pas leurs références.\n\n" +
            "Un bon test suit le schéma **préparer, agir, vérifier**. Les tests les plus utiles visent les **cas limites** : tableau vide, zéro, valeur négative, texte entouré d'espaces, égalité pile sur un seuil. Un test qui passe aussi avec une fonction fausse ne protège de rien : imagine les erreurs possibles, et écris le test qui les détecte.\n\n" +
            "En projet, on utilise un outil comme **Jest** ou **Vitest**, l'équivalent de `pytest` : `test('somme', () => { expect(somme(2, 3)).toBe(5); });`. `toBe` compare avec `===`, `toEqual` compare le contenu comme `assertEqual`. Ces outils ne tournent pas dans CodeQuest. À essayer sur ton ordinateur : `npm install --save-dev vitest`, un fichier `somme.test.js`, puis `npx vitest`.",
          example: {
            code: `function moyenne(valeurs) {
  if (valeurs.length === 0) {
    return 0;
  }
  return valeurs.reduce((s, v) => s + v, 0) / valeurs.length;
}
// cas normal
assertEqual(moyenne([10, 20]), 15);
// cas limites
assertEqual(moyenne([]), 0);
assertEqual(moyenne([7]), 7);
assert(moyenne([-4, 4]) === 0, 'les valeurs négatives doivent compter');
console.log('Tous les tests passent');`,
            output: 'Tous les tests passent',
            notes: [
              { line: 8, text: "Cas normal : une entrée simple dont tu connais le résultat de tête." },
              { line: 10, text: "Cas limite : sans le `if` des lignes 2 à 4, `0 / 0` donnerait `NaN` et ce test échouerait." },
              { line: 12, text: "Le message de `assert` explique ce qui est cassé quand le test échoue." },
              { line: 13, text: "Un test qui échoue lève une erreur et arrête le programme : cette ligne n'est atteinte que si tout passe." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "Avec Jest ou Vitest, quel test vérifie correctement que `trier([3, 1, 2])` renvoie `[1, 2, 3]` ?",
              choices: [
                '`expect(trier([3, 1, 2])).toEqual([1, 2, 3]);`',
                '`expect(trier([3, 1, 2])).toBe([1, 2, 3]);`',
                '`expect(trier([3, 1, 2]) === [1, 2, 3]).toBe(true);`',
                '`expect([1, 2, 3]).toEqual([1, 2, 3]);`'
              ],
              answer: 0,
              why: {
                1: "`toBe` compare avec `===` : deux tableaux distincts ne sont jamais `===`, même avec le même contenu. Ce test échouerait toujours.",
                2: "Même problème : `===` entre deux tableaux distincts vaut toujours `false`.",
                3: "Ce test n'appelle même pas `trier` : il passe toujours, il ne vérifie rien."
              },
              hint: "Souviens-toi de ce que `===` fait avec deux tableaux.",
              explain: "`toEqual` compare le contenu des tableaux, comme `assertEqual`. Garde `toBe` pour les valeurs simples : nombres, chaînes, booléens."
            },
            {
              type: 'fill',
              prompt: "Complète les résultats attendus des tests de `estSolide` (au moins 8 caractères, dont un chiffre). Chaque test vise un cas limite précis.",
              code: `function estSolide(mdp) {
  const aUnChiffre = [...mdp].some(c => c >= '0' && c <= '9');
  return mdp.length >= 8 && aUnChiffre;
}
assertEqual(estSolide('abcdefg1'), ___);
assertEqual(estSolide('abcdef1'), ___);
assertEqual(estSolide('abcdefgh'), ___);
console.log('3 tests passent');`,
              blanks: [
                { answers: ['true'], options: ['true', 'false'], why: { false: "`'abcdefg1'` fait exactement 8 caractères, dont un chiffre : la borne de 8 est incluse (`>=`)." } },
                { answers: ['false'], options: ['true', 'false'], why: { true: "`'abcdef1'` ne fait que 7 caractères : un de moins que le minimum." } },
                { answers: ['false'], options: ['true', 'false'], why: { true: "`'abcdefgh'` a la bonne longueur, mais aucun chiffre." } }
              ],
              output: '3 tests passent',
              hint: "Compte les caractères de chaque mot de passe, et cherche un chiffre.",
              explain: "Ces trois tests encadrent la règle : pile 8 caractères avec un chiffre (accepté), 7 caractères (refusé), 8 caractères sans chiffre (refusé). Une erreur sur `>=` ou sur la recherche du chiffre serait aussitôt détectée."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "`prixFinal(prix, code)` applique le code promo `'MOINS10'` : 10 € de réduction, sans jamais descendre sous 0. Tout autre code ne change rien. Écris dans `testerPrixFinal` des tests avec `assertEqual` qui **passent** pour une version correcte de `prixFinal`, et **échouent** pour les versions boguées que CodeQuest va leur soumettre. Pense aux cas limites.",
            starter: `function testerPrixFinal(prixFinal) {
  assertEqual(prixFinal(50, 'MOINS10'), 40);
  // ajoute tes tests de cas limites ici
}
`,
            solution: `function testerPrixFinal(prixFinal) {
  assertEqual(prixFinal(50, 'MOINS10'), 40);
  assertEqual(prixFinal(6, 'MOINS10'), 0);
  assertEqual(prixFinal(10, 'MOINS10'), 0);
  assertEqual(prixFinal(50, 'SOLDES'), 50);
  assertEqual(prixFinal(50, ''), 50);
}
`,
            tests: [
              { code: "const correcte = (prix, code) => (code === 'MOINS10' ? Math.max(prix - 10, 0) : prix);\ntesterPrixFinal(correcte);", label: 'tes tests passent sur une version correcte' },
              { code: "const boguee = (prix, code) => (code === 'MOINS10' ? prix - 10 : prix);\nlet detecte = false;\ntry {\n  testerPrixFinal(boguee);\n} catch (e) {\n  detecte = true;\n}\nassert(detecte, 'Une version qui renvoie un prix négatif passe tes tests');", label: 'tes tests détectent une version qui descend sous 0' },
              { code: "const boguee = (prix, code) => (code ? Math.max(prix - 10, 0) : prix);\nlet detecte = false;\ntry {\n  testerPrixFinal(boguee);\n} catch (e) {\n  detecte = true;\n}\nassert(detecte, \"Une version qui accepte n'importe quel code passe tes tests\");", label: "tes tests détectent une version qui accepte n'importe quel code" }
            ],
            hint: "Pour chaque règle de l'énoncé (« jamais sous 0 », « tout autre code ne change rien »), écris un test qui échouerait si la règle était oubliée.",
            explain: "Un prix inférieur à 10 avec `'MOINS10'` doit donner 0 : ce test piège la version sans plancher. Un autre code doit laisser le prix intact : ce test piège la version trop généreuse. C'est l'idée des tests par mutation : un bon test fait échouer une fonction fausse."
          },
          recap: [
            "`assert(condition, 'message')` pour une condition, `assertEqual(obtenu, attendu)` pour comparer des valeurs.",
            "Vise les cas limites : vide, zéro, négatif, borne exacte, espaces.",
            "Un test qui passe avec une fonction fausse ne sert à rien.",
            "Jest et Vitest : `expect(x).toBe(...)` pour `===`, `toEqual` pour le contenu."
          ],
          check: {
            type: 'bug',
            prompt: "`compterMots('  bonjour   le monde ')` renvoie 8 au lieu de 3 : ce test devrait donc échouer. Pourtant il passe et affiche « test passé ». Clique sur la ligne fautive du **test**.",
            code: `function compterMots(texte) {
  return texte.split(' ').length;
}
const resultat = compterMots('  bonjour   le monde ');
assert(resultat, 3);
console.log('test passé');`,
            bugLine: 5,
            why: "`assert(resultat, 3)` vérifie seulement que `resultat` est truthy (8 l'est) ; le 3 est pris pour le message d'erreur. Pour comparer deux valeurs, il faut `assertEqual`.",
            fixes: ['assertEqual(resultat, 3);', 'assert(resultat > 0, 3);', 'assert(3, resultat);'],
            fixAnswer: 0,
            fixWhy: {
              1: "Ce test vérifie seulement qu'il y a au moins un mot : il passe aussi avec 8.",
              2: "`3` est truthy : `assert(3, ...)` passe toujours, quel que soit le résultat."
            },
            hint: "Relis la signature de `assert` : que représente son deuxième argument ?",
            explain: "Avec `assertEqual(resultat, 3)`, le test échoue enfin et révèle le bug de `compterMots`. Un test qui ne peut pas échouer est pire que pas de test : il donne une fausse confiance."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u16
    {
      id: 'js.u16',
      title: 'Projets web interactifs',
      summary: 'Assembler DOM, événements et état dans une vraie mini-application de tâches.',
      lessons: [
        {
          id: 'js.u16.l1',
          title: 'Une liste de tâches dans la page',
          minutes: 8,
          objective: "Tu sais construire une mini-appli qui garde ses données dans un tableau et redessine la liste à chaque changement.",
          explain:
            "Une appli interactive repose sur une idée simple : les **données** (l'état) vivent dans des variables JavaScript, et la page n'en est qu'un **affichage**. À chaque action de l'utilisateur :\n\n" +
            "- l'écouteur modifie l'état, par exemple ajoute une tâche au tableau ;\n" +
            "- une fonction `afficher()` vide la liste et la reconstruit entièrement à partir de l'état.\n\n" +
            "Ne lis jamais tes données dans la page (« combien de `li` y a-t-il ? ») : c'est l'état qui fait foi. React, Vue ou Svelte reposent sur ce schéma ; ils automatisent surtout la deuxième étape.\n\n" +
            "Pour vider un élément : `liste.replaceChildren()`. Pour retrouver une tâche lors d'un clic, range son identifiant dans le `li` avec un attribut `data-` : `li.dataset.id = tache.id` crée `data-id=\"3\"`, que l'on relit avec `li.dataset.id`. Attention : on relit toujours une **chaîne**, à convertir avec `Number`.",
          example: {
            code: `const taches = [{ id: 1, titre: 'Lire la doc', faite: false }];
const liste = document.querySelector('#liste');
function afficher() {
  liste.replaceChildren();
  for (const t of taches) {
    const li = document.createElement('li');
    li.textContent = t.titre;
    li.dataset.id = t.id;
    li.classList.toggle('faite', t.faite);
    liste.append(li);
  }
}
afficher();`,
            run: false,
            notes: [
              { line: 1, text: "L'état : la seule source de vérité de l'appli." },
              { line: 4, text: "On repart de zéro à chaque affichage : pas de doublons possibles." },
              { line: 8, text: "`dataset.id` écrit l'attribut `data-id` : il servira à retrouver la tâche au clic." },
              { line: 9, text: "`toggle` avec un deuxième argument : ajoute la classe si `t.faite` est vrai, la retire sinon." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre `brancherAjout` : l'écouteur annule d'abord l'envoi, lit et nettoie le titre, ajoute la tâche à l'état s'il n'est pas vide, puis redessine.",
              lines: [
                'function brancherAjout(form, champ, taches, afficher) {',
                "  form.addEventListener('submit', (event) => {",
                '    event.preventDefault();',
                '    const titre = champ.value.trim();',
                "    if (titre !== '') taches.push({ titre: titre, faite: false });",
                '    afficher();',
                '  });',
                '}'
              ],
              hint: "L'état doit être modifié avant d'être redessiné.",
              explain: "Toujours la même séquence dans un écouteur : annuler l'action par défaut, lire la saisie, mettre à jour l'état, puis appeler `afficher()`. Redessiner avant de modifier l'état afficherait l'ancienne liste."
            },
            {
              type: 'fill',
              prompt: "Complète `afficher` : elle vide la liste, puis crée un `li` par tâche, avec l'identifiant rangé dans l'attribut `data-id`.",
              code: `function afficher(taches, liste) {
  liste.___();
  for (const t of taches) {
    const li = document.createElement('li');
    li.textContent = t.titre;
    li.dataset.___ = t.id;
    liste.append(li);
  }
}`,
              blanks: [
                {
                  answers: ['replaceChildren'],
                  options: ['replaceChildren', 'remove', 'clear', 'empty'],
                  why: {
                    remove: "`liste.remove()` retirerait la liste elle-même de la page, pas son contenu.",
                    clear: "Les éléments du DOM n'ont pas de méthode `clear`.",
                    empty: "`empty()` vient de la bibliothèque jQuery, pas du DOM standard."
                  }
                },
                {
                  answers: ['id'],
                  options: ['id', 'data-id', 'dataId'],
                  why: {
                    'data-id': "Dans `dataset`, on écrit le nom sans le préfixe `data-` : `dataset.id` correspond à l'attribut `data-id`. Et un tiret est impossible après un point.",
                    dataId: "`dataset.dataId` créerait l'attribut `data-data-id`."
                  }
                }
              ],
              hint: "`dataset` ajoute lui-même le préfixe `data-` au nom de l'attribut.",
              explain: "`replaceChildren()` sans argument retire tous les enfants : la liste repart vide à chaque affichage. `li.dataset.id = t.id` écrit `data-id` dans le HTML, ce qui permettra de retrouver la tâche lors d'un clic."
            }
          ],
          challenge: {
            type: 'code',
            dom: true,
            prompt: "Chaque tâche a un bouton « Supprimer ». Ajoute **un seul** écouteur `click` sur `#liste` : un clic sur un bouton retire la tâche correspondante de l'état (crée un nouveau tableau avec `filter`), puis redessine. Un clic sur le texte d'une tâche ne fait rien. Complète aussi `afficher` pour écrire `Tâches : 3` dans `#compteur`.",
            html: `<ul id="liste"></ul>
<p id="compteur"></p>`,
            starter: `let taches = [
  { id: 1, titre: 'Lire la doc' },
  { id: 2, titre: 'Coder la liste' },
  { id: 3, titre: 'Tester' },
];
const liste = document.querySelector('#liste');
const compteur = document.querySelector('#compteur');

function afficher() {
  liste.replaceChildren();
  for (const t of taches) {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    const texte = document.createElement('span');
    texte.textContent = t.titre;
    const bouton = document.createElement('button');
    bouton.textContent = 'Supprimer';
    li.append(texte, bouton);
    liste.append(li);
  }
  // compteur
}

// un seul écouteur sur #liste

afficher();
`,
            solution: `let taches = [
  { id: 1, titre: 'Lire la doc' },
  { id: 2, titre: 'Coder la liste' },
  { id: 3, titre: 'Tester' },
];
const liste = document.querySelector('#liste');
const compteur = document.querySelector('#compteur');

function afficher() {
  liste.replaceChildren();
  for (const t of taches) {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    const texte = document.createElement('span');
    texte.textContent = t.titre;
    const bouton = document.createElement('button');
    bouton.textContent = 'Supprimer';
    li.append(texte, bouton);
    liste.append(li);
  }
  compteur.textContent = \`Tâches : \${taches.length}\`;
}

liste.addEventListener('click', (event) => {
  const bouton = event.target.closest('button');
  if (!bouton) {
    return;
  }
  const id = Number(bouton.closest('li').dataset.id);
  taches = taches.filter(t => t.id !== id);
  afficher();
});

afficher();
`,
            tests: [
              { code: "assertEqual(document.querySelector('#compteur').textContent, 'Tâches : 3');", label: 'au départ, le compteur affiche « Tâches : 3 »' },
              { code: "document.querySelector('#liste li[data-id=\"2\"] button').click();\nconst titres = [...document.querySelectorAll('#liste li span')].map(s => s.textContent);\nassertEqual(titres, ['Lire la doc', 'Tester']);\nassertEqual(document.querySelector('#compteur').textContent, 'Tâches : 2');", label: 'supprimer « Coder la liste » laisse 2 tâches' },
              { code: "document.querySelector('#liste li span').click();\nassertEqual(document.querySelectorAll('#liste li').length, 2);", label: 'un clic sur le texte ne supprime rien' },
              { code: "for (let i = 0; i < 5; i++) {\n  const b = document.querySelector('#liste button');\n  if (b) {\n    b.click();\n  }\n}\nassertEqual(document.querySelectorAll('#liste li').length, 0);\nassertEqual(document.querySelector('#compteur').textContent, 'Tâches : 0');", label: 'tout supprimer donne « Tâches : 0 »' }
            ],
            hint: "Dans l'écouteur, `event.target.closest('button')` vaut `null` si le clic n'est pas sur un bouton. Sinon, remonte au `li` pour lire `dataset.id`, et n'oublie pas `Number`.",
            explain: "La délégation fonctionne même si `afficher` recrée tous les boutons : l'écouteur est sur `#liste`, qui reste. `filter` produit le nouvel état, puis `afficher` le dessine, compteur compris. Sans `Number`, `t.id !== '2'` serait toujours vrai et rien ne serait supprimé."
          },
          recap: [
            "L'état (un tableau de tâches) est la seule source de vérité ; la page n'est qu'un affichage.",
            "À chaque action : modifier l'état, puis appeler `afficher()`.",
            "`afficher()` vide la liste avec `replaceChildren()` et la reconstruit.",
            "`dataset.id` range un identifiant dans le `li` ; il revient en chaîne."
          ],
          check: {
            type: 'code',
            dom: true,
            prompt: "Construis le cœur de l'appli. Écris `afficher()` : elle vide `#liste`, puis ajoute un `li` par tâche avec son titre. Puis, à l'envoi du formulaire : annule le rechargement, nettoie le titre avec `trim()`, ajoute `{ titre: titre, faite: false }` au tableau `taches` si le titre n'est pas vide, vide le champ et redessine.",
            html: `<form id="ajout">
  <input name="titre" aria-label="Nouvelle tâche">
  <button>Ajouter</button>
</form>
<ul id="liste"></ul>`,
            starter: `const taches = [];
const form = document.querySelector('#ajout');
const liste = document.querySelector('#liste');

function afficher() {
  // vide la liste, puis un li par tâche
}

// écouteur submit du formulaire
`,
            solution: `const taches = [];
const form = document.querySelector('#ajout');
const liste = document.querySelector('#liste');

function afficher() {
  liste.replaceChildren();
  for (const t of taches) {
    const li = document.createElement('li');
    li.textContent = t.titre;
    liste.append(li);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const champ = form.elements.titre;
  const titre = champ.value.trim();
  if (titre !== '') {
    taches.push({ titre: titre, faite: false });
  }
  champ.value = '';
  afficher();
});
`,
            tests: [
              { code: "const f = document.querySelector('#ajout');\nf.elements.titre.value = '  Lire la doc  ';\nconst ev = new Event('submit', { cancelable: true });\nf.dispatchEvent(ev);\nassert(ev.defaultPrevented, \"L'envoi du formulaire n'est pas annulé\");\nconst lis = document.querySelectorAll('#liste li');\nassertEqual(lis.length, 1);\nassertEqual(lis[0].textContent, 'Lire la doc');\nassertEqual(f.elements.titre.value, '');", label: 'ajouter « Lire la doc » : un li, titre nettoyé, champ vidé' },
              { code: "const f = document.querySelector('#ajout');\nf.elements.titre.value = '   ';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nassertEqual(document.querySelectorAll('#liste li').length, 1);", label: 'un titre vide est ignoré' },
              { code: "const f = document.querySelector('#ajout');\nf.elements.titre.value = 'Coder';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nconst textes = [...document.querySelectorAll('#liste li')].map(li => li.textContent);\nassertEqual(textes, ['Lire la doc', 'Coder']);", label: 'deuxième ajout : 2 li, sans doublon' },
              { code: "assertEqual(taches, [{ titre: 'Lire la doc', faite: false }, { titre: 'Coder', faite: false }]);", label: "l'état contient les 2 tâches, sous forme d'objets" }
            ],
            hint: "Dans l'écouteur : `preventDefault`, lecture avec `form.elements.titre.value.trim()`, `push` si non vide, champ remis à `''`, puis `afficher()`.",
            explain: "L'écouteur ne touche jamais directement à la liste : il met à jour `taches`, et `afficher` reconstruit tout. Vider la liste au début d'`afficher` évite que la première tâche apparaisse deux fois au second ajout."
          }
        },
        {
          id: 'js.u16.l2',
          title: "Filtrer et gérer l'état",
          minutes: 8,
          objective: "Tu sais regrouper l'état d'une appli dans un objet, en déduire l'affichage (filtre, compteur) avec des fonctions pures, et mettre à jour cet état en réponse aux clics.",
          explain:
            "Quand l'appli grandit, regroupe tout l'état dans **un seul objet** : `const etat = { taches: [...], filtre: 'toutes' };`. Ce qui s'en déduit (la liste visible, le nombre de tâches restantes) ne se stocke pas : on le **calcule** à chaque affichage, avec des fonctions pures faciles à tester sans page.\n\n" +
            "- `tachesVisibles(etat)` renvoie les tâches à montrer selon le filtre ;\n" +
            "- `afficher()` dessine ce résultat, sans rien décider.\n\n" +
            "Les boutons de filtre portent leur valeur dans un attribut `data-filtre`. Un seul écouteur délégué lit `event.target.dataset.filtre`, met à jour `etat.filtre`, puis appelle `afficher()`.\n\n" +
            "Stocker une information en double (un compteur à part, une copie de la liste filtrée) crée tôt ou tard une incohérence : garde une seule source de vérité. Pour retrouver l'état à la prochaine visite, on l'enregistre en texte avec `localStorage.setItem('etat', JSON.stringify(etat))`, et on le relit avec `JSON.parse`. À essayer sur ton ordinateur, dans une vraie page.",
          example: {
            code: `const etat = {
  taches: [
    { id: 1, titre: 'Lire la doc', faite: true },
    { id: 2, titre: 'Coder le filtre', faite: false },
    { id: 3, titre: 'Tester', faite: false },
  ],
  filtre: 'a-faire',
};
function tachesVisibles(etat) {
  if (etat.filtre === 'faites') return etat.taches.filter(t => t.faite);
  if (etat.filtre === 'a-faire') return etat.taches.filter(t => !t.faite);
  return etat.taches;
}
console.log(tachesVisibles(etat).map(t => t.titre));
console.log(etat.taches.filter(t => !t.faite).length, 'restantes');`,
            output: `[ 'Coder le filtre', 'Tester' ]
2 restantes`,
            notes: [
              { line: 1, text: "Tout l'état dans un seul objet : les tâches et le filtre choisi." },
              { line: 9, text: "Fonction pure : elle ne lit que son argument et ne modifie rien. Elle se teste sans page." },
              { line: 14, text: "La liste visible est calculée, jamais stockée." },
              { line: 15, text: "Le compteur aussi : impossible qu'il se désynchronise des tâches." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `const etat = {
  taches: [{ id: 1, faite: false }, { id: 2, faite: true }],
  filtre: 'toutes',
};
function basculer(etat, id) {
  return {
    ...etat,
    taches: etat.taches.map(t => (t.id === id ? { ...t, faite: !t.faite } : t)),
  };
}
const suivant = basculer(etat, 1);
console.log(etat.taches[0].faite, suivant.taches[0].faite);
console.log(etat.taches[1] === suivant.taches[1], suivant.filtre);`,
              answer: `false true
true toutes`,
              mistakes: [
                { answer: `true true
true toutes`, why: "`basculer` ne modifie pas l'état reçu : la tâche 1 est remplacée par une **copie** modifiée dans le nouvel état." },
                { answer: `false true
false toutes`, why: "Pour la tâche 2, `map` renvoie `t` tel quel : c'est le même objet dans les deux états, donc `===` vaut `true`." },
                { answer: `false true
true undefined`, why: "`...etat` recopie toutes les clés de l'ancien état, dont `filtre`, avant de remplacer `taches`." }
              ],
              hint: "Repère ce qui est copié (spread) et ce qui est réutilisé tel quel.",
              explain: "`basculer` crée un nouvel état : `filtre` est recopié, `taches` est un nouveau tableau où seule la tâche 1 est une copie modifiée. L'ancien état reste intact, et la tâche 2 est partagée entre les deux : c'est sans risque, puisque personne ne la modifie."
            },
            {
              type: 'bug',
              prompt: "Un clic sur une tâche devrait la cocher, mais la console affiche `TypeError: Cannot read properties of undefined (reading 'faite')`. Les tâches ont des `id` numériques. Clique sur la ligne fautive.",
              code: `function brancherBascule(liste, etat, afficher) {
  liste.addEventListener('click', (event) => {
    const li = event.target.closest('li');
    if (!li) return;
    const tache = etat.taches.find(t => t.id === li.dataset.id);
    tache.faite = !tache.faite;
    afficher();
  });
}`,
              bugLine: 5,
              why: "`dataset` renvoie toujours des chaînes : `1 === '1'` est faux, donc `find` ne trouve rien et renvoie `undefined`. La ligne 6 échoue ensuite en lisant `faite` sur `undefined`.",
              fixes: [
                '    const tache = etat.taches.find(t => t.id === Number(li.dataset.id));',
                '    const tache = etat.taches.find(t => t.id = li.dataset.id);',
                '    const tache = etat.taches.filter(t => t.id === li.dataset.id);'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`=` affecte au lieu de comparer : la première tâche serait toujours « trouvée », et son `id` deviendrait une chaîne.",
                2: "`filter` renvoie un tableau, vide ici pour la même raison de type : `tache.faite` ne désignerait aucune tâche."
              },
              hint: "Quel est le type de `li.dataset.id` ? Et celui de `t.id` ?",
              explain: "`Number(li.dataset.id)` convertit l'identifiant lu dans la page : la comparaison stricte fonctionne et `find` renvoie la bonne tâche. L'erreur se manifeste à la ligne 6, mais elle naît à la ligne 5."
            }
          ],
          challenge: {
            type: 'code',
            dom: true,
            prompt: "Ajoute les filtres. Complète `tachesVisibles(etat)` (`'toutes'`, `'a-faire'` ou `'faites'`). Dans `afficher`, écris `2 sur 3 à faire` dans `#compteur` et donne la classe `actif` au seul bouton du filtre courant. Enfin, branche **un seul** écouteur sur `#filtres` : un clic sur un bouton met à jour `etat.filtre` d'après son `data-filtre`, puis redessine.",
            html: `<div id="filtres">
  <button data-filtre="toutes">Toutes</button>
  <button data-filtre="a-faire">À faire</button>
  <button data-filtre="faites">Faites</button>
</div>
<ul id="liste"></ul>
<p id="compteur"></p>`,
            starter: `const etat = {
  taches: [
    { id: 1, titre: 'Lire la doc', faite: true },
    { id: 2, titre: 'Coder le filtre', faite: false },
    { id: 3, titre: 'Tester', faite: false },
  ],
  filtre: 'toutes',
};
const liste = document.querySelector('#liste');
const compteur = document.querySelector('#compteur');

function tachesVisibles(etat) {
  // renvoie les tâches à montrer selon etat.filtre
  return etat.taches;
}

function afficher() {
  liste.replaceChildren();
  for (const t of tachesVisibles(etat)) {
    const li = document.createElement('li');
    li.textContent = t.titre;
    liste.append(li);
  }
  // compteur, puis classe actif sur le bon bouton
}

// écouteur délégué sur #filtres

afficher();
`,
            solution: `const etat = {
  taches: [
    { id: 1, titre: 'Lire la doc', faite: true },
    { id: 2, titre: 'Coder le filtre', faite: false },
    { id: 3, titre: 'Tester', faite: false },
  ],
  filtre: 'toutes',
};
const liste = document.querySelector('#liste');
const compteur = document.querySelector('#compteur');

function tachesVisibles(etat) {
  if (etat.filtre === 'a-faire') {
    return etat.taches.filter(t => !t.faite);
  }
  if (etat.filtre === 'faites') {
    return etat.taches.filter(t => t.faite);
  }
  return etat.taches;
}

function afficher() {
  liste.replaceChildren();
  for (const t of tachesVisibles(etat)) {
    const li = document.createElement('li');
    li.textContent = t.titre;
    liste.append(li);
  }
  const restantes = etat.taches.filter(t => !t.faite).length;
  compteur.textContent = \`\${restantes} sur \${etat.taches.length} à faire\`;
  for (const b of document.querySelectorAll('#filtres button')) {
    b.classList.toggle('actif', b.dataset.filtre === etat.filtre);
  }
}

document.querySelector('#filtres').addEventListener('click', (event) => {
  const bouton = event.target.closest('button');
  if (!bouton) {
    return;
  }
  etat.filtre = bouton.dataset.filtre;
  afficher();
});

afficher();
`,
            tests: [
              { code: "const e = { taches: [{ id: 1, faite: true }, { id: 2, faite: false }], filtre: 'faites' };\nassertEqual(tachesVisibles(e).map(t => t.id), [1]);", label: "tachesVisibles avec le filtre 'faites'" },
              { code: "const e = { taches: [{ id: 1, faite: true }, { id: 2, faite: false }], filtre: 'a-faire' };\nassertEqual(tachesVisibles(e).map(t => t.id), [2]);", label: "tachesVisibles avec le filtre 'a-faire'" },
              { code: "document.querySelector('[data-filtre=\"a-faire\"]').click();\nconst textes = [...document.querySelectorAll('#liste li')].map(li => li.textContent);\nassertEqual(textes, ['Coder le filtre', 'Tester']);\nassertEqual(document.querySelector('#compteur').textContent, '2 sur 3 à faire');", label: 'clic sur « À faire » : 2 tâches et le compteur' },
              { code: "document.querySelector('[data-filtre=\"faites\"]').click();\nconst textes = [...document.querySelectorAll('#liste li')].map(li => li.textContent);\nassertEqual(textes, ['Lire la doc']);\nconst actifs = [...document.querySelectorAll('#filtres .actif')].map(b => b.dataset.filtre);\nassertEqual(actifs, ['faites']);", label: 'clic sur « Faites » : 1 tâche, et seul ce bouton est actif' }
            ],
            hint: "`tachesVisibles` ne fait que des `filter`. Pour les boutons, parcours `#filtres button` et utilise `classList.toggle('actif', condition)`.",
            explain: "Le filtre est une donnée de l'état comme les autres : le clic ne fait que le changer, et `afficher` en déduit la liste, le compteur et le bouton actif. `tachesVisibles`, pure, se teste sans page : c'est ce que font les deux premiers tests."
          },
          recap: [
            "Un seul objet `etat` pour toute l'appli : les données et les choix de l'utilisateur.",
            "Ce qui se déduit de l'état (liste filtrée, compteur) se calcule, ne se stocke pas.",
            "Fonctions pures pour calculer, `afficher()` pour dessiner, écouteurs pour modifier l'état.",
            "`data-filtre` sur les boutons et un écouteur délégué sur leur parent."
          ],
          check: {
            type: 'logic',
            prompt: "Au départ, l'appli contient 4 tâches (ids 1 à 4), dont une seule faite : la tâche 1. Le filtre vaut `'toutes'`. Après ces actions, combien de `li` la liste affiche-t-elle ?",
            code: `ajouter('Écrire les tests');   // nouvelle tâche 5, non faite
basculer(2);                   // la tâche 2 devient faite
filtrer('a-faire');
supprimer(1);                  // la tâche 1 disparaît
basculer(3);                   // la tâche 3 devient faite`,
            run: false,
            answer: '2',
            accept: ['deux'],
            mistakes: [
              { answer: '3', why: "Après la suppression de la tâche 1, il reste les tâches 2 à 5, dont 2 faites (2 et 3) : seules 4 et 5 sont à faire." },
              { answer: '4', why: "Le filtre `'a-faire'` cache les tâches faites : il ne s'applique pas qu'au moment du clic, mais à chaque affichage." },
              { answer: '5', why: "La tâche 1 a été supprimée, et le filtre cache les tâches faites." }
            ],
            hint: "Tiens à jour la liste des tâches et de leur état après chaque ligne, puis applique le filtre à la fin.",
            explain: "Tâches finales : 2 (faite), 3 (faite), 4 et 5 (à faire). Le filtre `'a-faire'`, appliqué à chaque affichage, ne montre que 4 et 5 : 2 `li`. Raisonner sur l'état, et non sur la page, rend ce calcul simple."
          }
        }
      ]
    }
  ]
});
