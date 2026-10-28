// Parcours JavaScript, chapitre 1 : bases du langage (js.u1 à js.u5).
// Les chapitres suivants sont dans js-2.js, js-3.js et js-4.js.
CQ.addTrack({
  id: 'js',
  title: 'JavaScript',
  lang: 'javascript',
  summary: "Le langage du web, des bases jusqu'aux pages interactives et aux appels d'API, en t'appuyant sur ce que tu sais déjà de Python.",
  why: "JavaScript est le seul langage que tous les navigateurs exécutent : chaque bouton, formulaire ou tableau de bord interactif en dépend. Avec Node.js, il fait aussi tourner des serveurs et des outils, et la plupart des interfaces d'applis d'IA sont écrites avec lui.",
  requires: [],
  chapters: [
    {
      id: 'js.c1',
      title: 'Bases du langage',
      units: [
        // ------------------------------------------------------------------ js.u1
        {
          id: 'js.u1',
          title: 'Variables et constantes',
          summary: 'Déclarer des valeurs avec let et const, et comprendre la portée de bloc.',
          lessons: [
            {
              id: 'js.u1.l1',
              title: 'let, const et portée de bloc',
              minutes: 6,
              objective: "Tu sais choisir entre `const` et `let` pour déclarer une valeur, et prévoir où une variable existe grâce à la portée de bloc.",
              explain:
                "En Python, `x = 5` crée la variable. En JavaScript, tu la **déclares** d'abord avec un mot-clé :\n\n" +
                "- `const` : le nom ne sera jamais réaffecté. C'est le choix par défaut.\n" +
                "- `let` : la valeur va changer (un compteur, un total).\n" +
                "- `var` : l'ancienne façon, à éviter dans du code neuf.\n\n" +
                "`const` interdit de réaffecter le nom (`total = 3` lève une `TypeError`), mais pas de modifier le contenu d'un tableau ou d'un objet : `const notes = []; notes.push('idée');` est permis.\n\n" +
                "Une variable déclarée avec `let` ou `const` n'existe que dans son **bloc**, entre `{` et `}`. En Python, une variable créée dans un `if` existe encore après ; en JavaScript, y accéder hors du bloc lève une `ReferenceError`.\n\n" +
                "`console.log(a, b)` affiche les valeurs séparées par une espace, comme `print`. Les noms s'écrivent en camelCase : `nbNotes`, pas `nb_notes`.",
              example: {
                code: `const appli = 'Carnet';
let nbNotes = 2;
nbNotes = nbNotes + 1;
if (nbNotes > 2) {
  const message = 'Carnet bien rempli';
  console.log(message);
}
console.log(appli, nbNotes);`,
                output: `Carnet bien rempli
Carnet 3`,
                notes: [
                  { line: 1, text: "`const` : ce nom désignera toujours la même valeur." },
                  { line: 3, text: "Réaffectation permise, car `nbNotes` est déclarée avec `let`. Pas de mot-clé ici : la variable existe déjà." },
                  { line: 5, text: "`message` n'existe qu'entre les accolades du `if`. Un `console.log(message)` à la ligne 8 lèverait une `ReferenceError`." },
                  { line: 8, text: "Comme `print`, `console.log` sépare ses valeurs par une espace." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `let niveau = 1;
if (niveau > 0) {
  let niveau = 5;
  console.log(niveau);
}
console.log(niveau);`,
                  answer: `5
1`,
                  mistakes: [
                    { answer: `5
5`, why: "Réflexe Python : ici, le `let` de la ligne 3 crée une **nouvelle** variable `niveau`, propre au bloc. Celle de la ligne 1 n'est pas modifiée et vaut toujours 1 après le bloc." },
                    { answer: `1
1`, why: "Dans le bloc, c'est la variable la plus proche qui compte : la ligne 4 lit le `niveau` déclaré ligne 3, qui vaut 5." }
                  ],
                  hint: "Compte les `let` : chacun crée une variable distincte, valable dans son propre bloc.",
                  explain: "La ligne 3 déclare une deuxième variable `niveau` qui masque la première entre les accolades. À la sortie du bloc, elle disparaît, et la ligne 6 lit la variable de la ligne 1, restée à 1."
                },
                {
                  type: 'bug',
                  prompt: "Ce code devrait afficher `Carnet 0` puis `Carnet 1`, mais il s'arrête avec `TypeError: Assignment to constant variable` à la ligne 4. Clique sur la ligne qui est vraiment en cause.",
                  code: `const appli = 'Carnet';
const nbNotes = 0;
console.log(appli, nbNotes);
nbNotes = nbNotes + 1;
console.log(appli, nbNotes);`,
                  bugLine: 2,
                  why: "L'erreur se manifeste à la ligne 4, mais elle naît à la ligne 2 : `const` interdit toute réaffectation. Une valeur qui change doit être déclarée avec `let`.",
                  fixes: ['let nbNotes = 0;', 'const nbNotes = 1;', 'nbNotes = 0;'],
                  fixAnswer: 0,
                  fixWhy: {
                    1: "La valeur de départ change, mais `const` interdit toujours la réaffectation de la ligne 4 : même erreur.",
                    2: "Sans mot-clé, tu crées une variable globale implicite. Ça semble marcher, mais c'est interdit en mode strict et source de bugs : déclare toujours avec `let` ou `const`."
                  },
                  output: `Carnet 0
Carnet 1`,
                  hint: "Le message parle de « constant variable » : cherche où cette variable a été déclarée.",
                  explain: "Avec `let nbNotes = 0;`, la ligne 4 a le droit de réaffecter la variable. Retiens le réflexe : la ligne signalée par une erreur est celle où le problème se manifeste, pas forcément celle où il est né."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Panier : déclare `prixUnitaire` (12) et `quantite` (2) avec le mot-clé le plus adapté. Le client ajoute un article : augmente `quantite` de 1. Enfin, déclare `total`, égal à `prixUnitaire * quantite`.",
                starter: `// Déclare prixUnitaire et quantite

// Ajoute 1 à quantite

// Déclare total
`,
                solution: `const prixUnitaire = 12;
let quantite = 2;
quantite = quantite + 1;
const total = prixUnitaire * quantite;
`,
                tests: [
                  { code: 'assertEqual(total, 36);', label: 'total vaut 36' },
                  { code: 'assertEqual(quantite, 3);', label: "quantite vaut 3 après l'ajout" }
                ],
                checks: [
                  { re: 'const\\s+prixUnitaire', label: 'prixUnitaire est déclaré avec const (il ne change pas)' },
                  { re: 'let\\s+quantite', label: 'quantite est déclarée avec let (elle change)' }
                ],
                hint: "Une seule de ces trois valeurs est réaffectée après sa déclaration.",
                explain: "`prixUnitaire` et `total` ne changent jamais : `const`. `quantite` est réaffectée : `let`. Te demander « cette valeur va-t-elle changer ? » à chaque déclaration rend le code plus facile à relire."
              },
              recap: [
                "`const` par défaut, `let` seulement si la variable est réaffectée, jamais `var`.",
                "`const` empêche la réaffectation, pas la modification du contenu d'un tableau ou d'un objet.",
                "`let` et `const` n'existent que dans leur bloc `{ }`, contrairement à Python.",
                "Une erreur signalée à une ligne peut venir d'une déclaration plus haut."
              ],
              check: {
                type: 'fill',
                prompt: "Complète avec le mot-clé le plus adapté : le taux de TVA ne change jamais, le montant du panier augmente.",
                code: `___ TAUX_TVA = 0.2;
___ montant = 0;
montant = montant + 50;
montant = montant + 30;
console.log(montant, montant * TAUX_TVA);`,
                blanks: [
                  {
                    answers: ['const'],
                    options: ['const', 'let', 'var'],
                    why: {
                      let: "Ça fonctionnerait, mais `TAUX_TVA` n'est jamais réaffecté : `const` le protège d'une modification par erreur.",
                      var: "`var` est l'ancienne façon de déclarer : sa portée est la fonction entière, pas le bloc. À éviter."
                    }
                  },
                  {
                    answers: ['let'],
                    options: ['const', 'let', 'var'],
                    why: {
                      const: "`montant` est réaffecté aux lignes 3 et 4 : avec `const`, ce serait une `TypeError`.",
                      var: "`var` fonctionnerait, mais c'est l'ancienne façon de déclarer, avec une portée trop large. Préfère `let`."
                    }
                  }
                ],
                output: '80 16',
                hint: "Pour chaque ligne, demande-toi si la variable est réaffectée plus bas.",
                explain: "Règle simple : `const` par défaut, `let` seulement si tu réaffectes. Le nom en majuscules signale une constante de configuration, une convention courante."
              }
            }
          ]
        },

        // ------------------------------------------------------------------ js.u2
        {
          id: 'js.u2',
          title: 'Types et opérateurs',
          summary: 'Connaître les types de base, comparer avec === et éviter les pièges de la coercition et de NaN.',
          lessons: [
            {
              id: 'js.u2.l1',
              title: 'Types, === et coercition',
              minutes: 7,
              objective: "Tu sais prévoir le résultat d'une comparaison avec `===` ou `==`, repérer une coercition de type et tester un `NaN`.",
              explain:
                "Types de base : `number` (un seul type pour les entiers et les décimaux : `7 / 2` donne `3.5`), `string`, `boolean` (`true` et `false` en minuscules), `undefined` (pas de valeur), `null` (vide volontaire) et `object`. `typeof x` renvoie le nom du type sous forme de chaîne.\n\n" +
                "**Comparer** : `===` compare la valeur et le type ; `==` convertit d'abord les deux côtés, c'est la **coercition** : `'5' == 5` est vrai. Utilise toujours `===` et `!==`.\n\n" +
                "La coercition agit aussi dans les calculs, là où Python lèverait une `TypeError` : `'5' + 1` donne `'51'` (le `+` colle les chaînes), mais `'5' - 1` donne `4`. Convertis toi-même avec `Number(...)` ou `String(...)`.\n\n" +
                "`NaN` (« pas un nombre ») est le résultat d'un calcul impossible, comme `Number('abc')`. Piège : `NaN === NaN` est faux. Teste-le avec `Number.isNaN(x)`.\n\n" +
                "Les **gabarits**, écrits entre accents graves, insèrent une valeur avec `${...}` : c'est l'équivalent des f-strings (dernière ligne de l'exemple).",
              example: {
                code: `const saisie = '3';
console.log(typeof saisie);
console.log(saisie == 3, saisie === 3);
console.log(saisie + 1, saisie - 1);
const n = Number('trois');
console.log(n, Number.isNaN(n));
console.log(\`Quantité finale : \${Number(saisie) + 1}\`);`,
                output: `string
true false
31 2
NaN true
Quantité finale : 4`,
                notes: [
                  { line: 1, text: "Une valeur lue dans un formulaire est toujours une chaîne, même si elle ressemble à un nombre." },
                  { line: 3, text: "`==` convertit la chaîne en nombre avant de comparer ; `===` voit deux types différents et répond `false`." },
                  { line: 4, text: "`+` avec une chaîne colle (`'31'`), `-` convertit en nombre (`2`)." },
                  { line: 7, text: "Gabarit : `${...}` insère le résultat d'une expression, comme `{...}` dans une f-string." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "Laquelle de ces expressions vaut `true` ?",
                  choices: ["`'0' === 0`", "`NaN === NaN`", "`typeof 42 === 'int'`", "`'abc' === 'abc'`"],
                  answer: 3,
                  why: {
                    0: "`===` ne convertit rien : une chaîne et un nombre ne sont jamais strictement égaux.",
                    1: "`NaN` n'est égal à rien, pas même à lui-même. Pour le détecter, utilise `Number.isNaN(x)`.",
                    2: "JavaScript n'a pas de type entier séparé : `typeof 42` vaut `'number'`."
                  },
                  hint: "`===` exige le même type et la même valeur.",
                  explain: "Deux chaînes identiques sont strictement égales : même type, même contenu. Les chaînes se comparent par leur valeur, comme en Python."
                },
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `const prix = '20';
const quantite = 3;
console.log(prix * quantite);
console.log(prix + quantite);
console.log(typeof (prix + quantite));`,
                  answer: `60
203
string`,
                  mistakes: [
                    { answer: `60
23
number`, why: "`+` avec une chaîne ne fait pas d'addition : il colle `'20'` et `'3'`, ce qui donne la chaîne `'203'`." },
                    { answer: `60
60
number`, why: "Seuls `-`, `*` et `/` convertissent en nombre. Le `+` choisit la concaténation dès qu'un côté est une chaîne." }
                  ],
                  hint: "`*` et `+` ne réagissent pas pareil face à une chaîne.",
                  explain: "`*` convertit `'20'` en nombre : 60. `+` voit une chaîne et concatène : `'203'`, de type `string`. C'est la cause classique des totaux de panier faux."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Les prix arrivent d'un formulaire sous forme de texte. Corrige le code pour que `total` soit le **nombre** 20 et que `message` vaille `'Total : 20 €'`, construit avec un gabarit.",
                starter: `const prixA = '12.5';
const prixB = '7.5';
const total = prixA + prixB;
const message = 'Total : ' + total;
`,
                solution: `const prixA = '12.5';
const prixB = '7.5';
const total = Number(prixA) + Number(prixB);
const message = \`Total : \${total} €\`;
`,
                tests: [
                  { code: "assertEqual(typeof total, 'number');", label: 'total est un nombre' },
                  { code: 'assertEqual(total, 20);', label: 'total vaut 20' },
                  { code: "assertEqual(message, 'Total : 20 €');", label: "message vaut 'Total : 20 €'" }
                ],
                checks: [
                  { re: '`', label: 'message est construit avec un gabarit (accents graves)' }
                ],
                hint: "Convertis chaque prix avec `Number(...)` avant d'additionner.",
                explain: "`Number('12.5')` donne le nombre 12.5 : l'addition devient une vraie addition. Le gabarit insère ensuite `total` dans le texte. Convertir explicitement évite de dépendre de la coercition."
              },
              recap: [
                "`typeof` donne le type sous forme de chaîne ; il n'y a qu'un type `number`.",
                "Compare toujours avec `===` et `!==` : `==` convertit les types en douce.",
                "`+` colle dès qu'une chaîne est en jeu ; convertis avec `Number(...)`.",
                "`NaN` n'est égal à rien : teste-le avec `Number.isNaN`."
              ],
              check: {
                type: 'logic',
                prompt: "Combien de ces six expressions valent `true` ? Réponds par un nombre.",
                code: `'1' == 1
'1' === 1
'5' - 1 === 4
'5' + 1 === 6
NaN === NaN
typeof 'abc' === 'string'`,
                answer: '3',
                accept: ['trois'],
                mistakes: [
                  { answer: '2', why: "Tu as sans doute compté `'5' - 1 === 4` comme faux : le `-` convertit `'5'` en nombre, donc `4 === 4` est vrai." },
                  { answer: '4', why: "Une des expressions comptées est fausse : `NaN === NaN` vaut `false`, et `'5' + 1` donne la chaîne `'51'`, pas 6." }
                ],
                hint: "Évalue chaque ligne séparément : y a-t-il conversion, concaténation, ou NaN ?",
                explain: "Vraies : `'1' == 1` (coercition), `'5' - 1 === 4` (le `-` convertit) et `typeof 'abc' === 'string'`. Fausses : `'1' === 1` (types différents), `'5' + 1 === 6` (donne `'51'`) et `NaN === NaN`."
              }
            }
          ]
        },

        // ------------------------------------------------------------------ js.u3
        {
          id: 'js.u3',
          title: 'Conditions',
          summary: 'Écrire des branches avec if, else if et else, et savoir ce qui compte comme vrai.',
          lessons: [
            {
              id: 'js.u3.l1',
              title: 'if, else et valeurs truthy',
              minutes: 7,
              objective: "Tu sais écrire une condition à plusieurs branches avec `if`, `else if` et `else`, et prévoir si une valeur compte comme vraie ou fausse.",
              explain:
                "Une condition s'écrit `if (test) { ... }` : parenthèses obligatoires autour du test, accolades autour du bloc. L'indentation n'a pas de sens pour JavaScript, mais elle reste indispensable pour te relire. Le `elif` de Python s'écrit `else if`.\n\n" +
                "Opérateurs logiques : `&&` (et), `||` (ou), `!` (non).\n\n" +
                "Dans un `if`, toute valeur est vue comme vraie ou fausse. Les valeurs **falsy** sont `false`, `0`, `''`, `null`, `undefined` et `NaN`. Tout le reste est **truthy**. Piège pour un habitué de Python : un tableau vide `[]` et un objet vide `{}` sont truthy.\n\n" +
                "L'opérateur ternaire `test ? siVrai : siFaux` équivaut à `siVrai if test else siFaux`. Et `a || b` renvoie `a` s'il est truthy, sinon `b` : pratique pour une valeur de secours.\n\n" +
                "Dans certains exercices, ton code est placé dans une fonction `function nom(param) { ... }` : c'est l'équivalent de `def`, et `return` fonctionne comme en Python. L'unité 5 détaille les fonctions.",
              example: {
                code: `const precision = 0.87;
let verdict;
if (precision >= 0.9) {
  verdict = 'excellent';
} else if (precision >= 0.75) {
  verdict = 'correct';
} else {
  verdict = 'à revoir';
}
console.log(verdict);
const tags = [];
console.log(tags ? 'tableau truthy' : 'tableau falsy');`,
                output: `correct
tableau truthy`,
                notes: [
                  { line: 2, text: "`let verdict;` déclare sans valeur : `verdict` vaut `undefined` jusqu'à l'affectation." },
                  { line: 5, text: "`else if` remplace le `elif` de Python. Une seule branche s'exécute : la première dont le test est vrai." },
                  { line: 12, text: "En Python, `[]` est faux ; en JavaScript, un tableau vide est truthy : le ternaire choisit la première valeur." }
                ]
              },
              exercises: [
                {
                  type: 'fill',
                  prompt: "Complète cette alerte météo pour qu'elle affiche `Canicule`.",
                  code: `const temperature = 31;
___ (temperature > 30) {
  console.log('Canicule');
} ___ (temperature > 20) {
  console.log('Doux');
} ___ {
  console.log('Frais');
}`,
                  blanks: [
                    { answers: ['if'], options: ['if', 'elif', 'else if', 'else'], why: { 'else if': "Une chaîne de conditions commence toujours par un simple `if`." } },
                    { answers: ['else if'], options: ['if', 'elif', 'else if', 'else'], why: { elif: "`elif` n'existe pas en JavaScript : c'est une `SyntaxError`.", if: "Un `if` ici ouvrirait une nouvelle condition indépendante, et la syntaxe `} if (...)` est incorrecte après un bloc." } },
                    { answers: ['else'], options: ['if', 'elif', 'else if', 'else'], why: { 'else if': "Un `else if` exige un test entre parenthèses ; la dernière branche, sans test, est un simple `else`." } }
                  ],
                  output: 'Canicule',
                  hint: "La dernière branche n'a pas de test entre parenthèses.",
                  explain: "`if` ouvre la chaîne, `else if` ajoute une branche avec son propre test, `else` attrape tous les autres cas. Ici, 31 > 30 : seule la première branche s'exécute."
                },
                {
                  type: 'qcm',
                  prompt: "Cette appli de notes devrait afficher « Aucune note » quand la liste est vide. Pourquoi affiche-t-elle « Tu as des notes » ?",
                  code: `const notes = [];
if (notes) {
  console.log('Tu as des notes');
} else {
  console.log('Aucune note');
}`,
                  choices: [
                    "Un tableau vide est truthy en JavaScript : il faut tester `notes.length === 0`",
                    "Il faut écrire `if (notes == true)`",
                    "`const` empêche de lire le tableau dans un `if`",
                    "Il manque un `elif` pour le cas vide"
                  ],
                  answer: 0,
                  why: {
                    1: "`notes == true` déclenche une coercition piégeuse : il vaut `false` même pour un tableau rempli comme `['café']`. Ce n'est pas un test fiable.",
                    2: "`const` empêche seulement de réaffecter `notes` ; on peut le lire partout dans sa portée.",
                    3: "`elif` n'existe pas en JavaScript, et le problème vient du test lui-même."
                  },
                  hint: "Relis la liste des six valeurs falsy : les tableaux n'y figurent pas.",
                  explain: "Seules six valeurs sont falsy, et `[]` n'en fait pas partie. Pour savoir si un tableau est vide, teste sa longueur : `notes.length === 0` (`.length` joue le rôle de `len()`)."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Écris le corps de `niveauConfiance(score)` pour un modèle d'IA. Le score doit être un nombre entre 0 et 1 (bornes comprises), sinon renvoie `'invalide'`. Ensuite : `'élevée'` s'il vaut au moins 0.9, `'moyenne'` s'il vaut au moins 0.6, `'faible'` sinon.",
                starter: `function niveauConfiance(score) {
  // ton code ici
}
`,
                solution: `function niveauConfiance(score) {
  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 1) {
    return 'invalide';
  }
  if (score >= 0.9) {
    return 'élevée';
  } else if (score >= 0.6) {
    return 'moyenne';
  } else {
    return 'faible';
  }
}
`,
                tests: [
                  { code: "assertEqual(niveauConfiance(0.95), 'élevée');", label: "niveauConfiance(0.95) renvoie 'élevée'" },
                  { code: "assertEqual(niveauConfiance(0.6), 'moyenne');", label: "niveauConfiance(0.6) renvoie 'moyenne' (borne incluse)" },
                  { code: "assertEqual(niveauConfiance(0.2), 'faible');", label: "niveauConfiance(0.2) renvoie 'faible'" },
                  { code: "assertEqual(niveauConfiance(1.5), 'invalide');\nassertEqual(niveauConfiance('0.8'), 'invalide');", label: "un score hors de [0, 1] ou en texte est 'invalide'" },
                  { code: "assertEqual(niveauConfiance(NaN), 'invalide');", label: "niveauConfiance(NaN) renvoie 'invalide'" }
                ],
                hint: "Écarte d'abord les cas invalides : pense au type, à l'intervalle, et au fait que `typeof NaN` vaut `'number'`.",
                explain: "Vérifier d'abord les entrées invalides et sortir tout de suite avec `return` évite d'imbriquer les conditions. Sans `Number.isNaN`, un `NaN` passerait le premier test (ses comparaisons valent toutes `false`) et finirait en `'faible'`."
              },
              recap: [
                "Parenthèses autour du test, accolades autour du bloc, `else if` au lieu de `elif`.",
                "Falsy : `false`, `0`, `''`, `null`, `undefined`, `NaN`. Tout le reste est truthy, y compris `[]` et `{}`.",
                "Pour un tableau vide, teste `.length === 0`.",
                "`=` affecte, `===` compare : ne les confonds pas dans un `if`."
              ],
              check: {
                type: 'bug',
                prompt: "Avec un stock à 0, ce code devrait afficher « Rupture de stock », mais il affiche « Disponible ». Clique sur la ligne fautive.",
                code: `let stock = 0;
if (stock = 0) {
  console.log('Rupture de stock');
} else {
  console.log('Disponible');
}`,
                bugLine: 2,
                why: "`stock = 0` est une **affectation**, pas une comparaison : elle range 0 dans `stock` et vaut 0, une valeur falsy. Le `if` part donc toujours dans le `else`.",
                fixes: ['if (stock === 0) {', 'if (stock) {', 'if (stock = 1) {'],
                fixAnswer: 0,
                fixWhy: {
                  1: "`if (stock)` est vrai quand le stock n'est **pas** nul : la logique est inversée.",
                  2: "Encore une affectation : elle vaut 1, truthy, donc « Rupture de stock » s'afficherait même avec 50 articles en stock."
                },
                output: 'Rupture de stock',
                hint: "Combien de signes `=` faut-il pour comparer ?",
                explain: "`=` affecte, `===` compare. Avec `stock === 0`, le test vaut `true` et la bonne branche s'exécute."
              }
            }
          ]
        },

        // ------------------------------------------------------------------ js.u4
        {
          id: 'js.u4',
          title: 'Boucles',
          summary: 'Répéter avec for, for...of et while, et contrôler la boucle avec break et continue.',
          lessons: [
            {
              id: 'js.u4.l1',
              title: 'for, for...of et while',
              minutes: 7,
              objective: "Tu sais parcourir un tableau avec `for...of`, compter avec une boucle `for` classique et contrôler une boucle avec `break` et `continue`.",
              explain:
                "La boucle `for` classique a trois parties : `for (let i = 0; i < 3; i++)` donne le départ, la condition pour continuer et le pas. `i++` ajoute 1 à `i`. C'est l'équivalent de `for i in range(3)`.\n\n" +
                "Pour parcourir les **valeurs** d'un tableau ou d'une chaîne, utilise `for (const x of liste)`, l'équivalent du `for x in liste` de Python.\n\n" +
                "Faux ami : `for...in` existe aussi, mais il parcourt les **clés**. Sur un tableau, il donne les indices sous forme de chaînes (`'0'`, `'1'`...). Réserve-le aux objets.\n\n" +
                "`while (test) { ... }` répète tant que le test est vrai. `break` sort de la boucle, `continue` passe directement au tour suivant, comme en Python.\n\n" +
                "`total += x` est le raccourci de `total = total + x`, et `liste.length` donne la taille d'un tableau.",
              example: {
                code: `const scores = [0.82, 0.91, 0.67];
for (let i = 0; i < scores.length; i++) {
  console.log(\`Modèle \${i + 1} : \${scores[i]}\`);
}
let meilleurs = 0;
for (const s of scores) {
  if (s < 0.8) {
    continue;
  }
  meilleurs += 1;
}
console.log(meilleurs, 'modèles au-dessus de 0.8');`,
                output: `Modèle 1 : 0.82
Modèle 2 : 0.91
Modèle 3 : 0.67
2 modèles au-dessus de 0.8`,
                notes: [
                  { line: 2, text: "Départ `i = 0`, on continue tant que `i < scores.length` (ici 3), et `i++` après chaque tour." },
                  { line: 3, text: "`scores[i]` lit l'élément d'indice `i`, comme en Python." },
                  { line: 6, text: "`for...of` donne directement les valeurs : pas besoin d'indice." },
                  { line: 8, text: "`continue` saute la fin du tour pour les scores sous 0.8." }
                ]
              },
              exercises: [
                {
                  type: 'order',
                  prompt: "Remets dans l'ordre ce programme qui affiche les messages d'une discussion jusqu'au marqueur `'FIN'`, sans l'afficher.",
                  lines: [
                    "const messages = ['Salut', 'Ça va ?', 'FIN', 'Ignoré'];",
                    'for (let i = 0; i < messages.length; i++) {',
                    "  if (messages[i] === 'FIN') {",
                    '    break;',
                    '  }',
                    '  console.log(messages[i]);',
                    '}'
                  ],
                  output: `Salut
Ça va ?`,
                  hint: "Le test du marqueur doit avoir lieu avant l'affichage, sinon `FIN` serait affiché.",
                  explain: "À chaque tour, on vérifie d'abord si le message est `'FIN'` : si oui, `break` quitte la boucle avant l'affichage. Les messages suivants ne sont jamais lus."
                },
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `const notes = ['café', 'doc'];
for (const x in notes) {
  console.log(x);
}
for (const x of notes) {
  console.log(x);
}`,
                  answer: `0
1
café
doc`,
                  mistakes: [
                    { answer: `café
doc
café
doc`, why: "`for...in` ne donne pas les valeurs : il parcourt les clés du tableau, c'est-à-dire ses indices." },
                    { answer: `0
1
0
1`, why: "`for...of` donne bien les valeurs, comme le `for x in liste` de Python." }
                  ],
                  hint: "`in` parcourt les clés, `of` parcourt les valeurs.",
                  explain: "La première boucle affiche les indices `'0'` et `'1'` (des chaînes, d'ailleurs). La seconde affiche les éléments. Pour un tableau, `for...of` est presque toujours ce que tu veux."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Un capteur météo envoie des températures, et `-1` signale une mesure en panne. Complète `moyenneValide(mesures)` : elle renvoie la moyenne des mesures positives ou nulles, en ignorant les négatives, et `null` s'il n'y a aucune mesure valide.",
                starter: `function moyenneValide(mesures) {
  let somme = 0;
  let nb = 0;
  // parcours les mesures ici
  return somme / nb;
}
`,
                solution: `function moyenneValide(mesures) {
  let somme = 0;
  let nb = 0;
  for (const m of mesures) {
    if (m < 0) {
      continue;
    }
    somme += m;
    nb++;
  }
  if (nb === 0) {
    return null;
  }
  return somme / nb;
}
`,
                tests: [
                  { code: 'assertEqual(moyenneValide([18, 20, 22]), 20);', label: 'moyenneValide([18, 20, 22]) renvoie 20' },
                  { code: 'assertEqual(moyenneValide([18, -1, 22]), 20);', label: 'la mesure -1 est ignorée' },
                  { code: 'assertEqual(moyenneValide([-1, -1]), null);', label: 'aucune mesure valide : null' },
                  { code: 'assertEqual(moyenneValide([]), null);', label: 'tableau vide : null' }
                ],
                hint: "Ignore une mesure négative avec `continue`, et traite le cas « aucune mesure valide » avant de diviser.",
                explain: "La boucle n'additionne et ne compte que les mesures valides. Sans le test `nb === 0`, la division `0 / 0` donnerait `NaN` : renvoyer `null` signale clairement « pas de donnée »."
              },
              recap: [
                "`for (let i = 0; i < n; i++)` pour compter, comme `range(n)`.",
                "`for (const x of liste)` pour les valeurs ; `for...in` donne les clés.",
                "`break` sort de la boucle, `continue` passe au tour suivant.",
                "Pense au cas « aucun élément » avant de diviser."
              ],
              check: {
                type: 'logic',
                prompt: "Combien de nombres ce programme affiche-t-il ?",
                code: `for (let i = 0; i < 10; i += 3) {
  if (i === 6) {
    continue;
  }
  console.log(i);
}`,
                answer: '3',
                accept: ['trois'],
                mistakes: [
                  { answer: '4', why: "`i` prend bien les valeurs 0, 3, 6 et 9, mais `continue` saute l'affichage quand `i` vaut 6." },
                  { answer: '2', why: "9 est inférieur à 10 : le tour `i = 9` a lieu et affiche 9." },
                  { answer: '10', why: "`i += 3` avance de 3 en 3, pas de 1 en 1." }
                ],
                hint: "Écris la suite des valeurs de `i`, puis raye celles qui n'affichent rien.",
                explain: "`i` vaut 0, 3, 6, 9, puis 12 arrête la boucle. Le tour `i = 6` est sauté par `continue` : 0, 3 et 9 sont affichés, soit 3 nombres."
              }
            }
          ]
        },

        // ------------------------------------------------------------------ js.u5
        {
          id: 'js.u5',
          title: 'Fonctions',
          summary: 'Déclarer des fonctions classiques et fléchées, avec valeurs par défaut, et comprendre les closures.',
          lessons: [
            {
              id: 'js.u5.l1',
              title: 'Fonctions fléchées et closures',
              minutes: 8,
              objective: "Tu sais écrire une fonction classique ou fléchée avec une valeur par défaut, et expliquer ce qu'une closure garde en mémoire.",
              explain:
                "Une fonction se déclare avec `function nom(a, b) { return a + b; }`. Sans `return`, elle renvoie `undefined`, le `None` de Python.\n\n" +
                "La **fonction fléchée** est une écriture courte, très utilisée : `const double = (n) => n * 2;`. Avec un seul paramètre, les parenthèses sont facultatives. Sans accolades, la valeur de l'expression est renvoyée ; avec un bloc `{ }`, il faut écrire `return`.\n\n" +
                "Les **valeurs par défaut** s'écrivent comme en Python : `function saluer(nom = 'invité')`. Elles s'appliquent quand l'argument manque ou vaut `undefined`, mais pas pour `0` ou `null`.\n\n" +
                "Une fonction est une valeur : on peut la ranger dans une variable, la passer à une autre fonction ou la renvoyer. Une fonction créée dans une autre garde accès aux variables de celle-ci, même après la fin de son appel : c'est une **closure**. Elle garde un lien vers ces variables, pas une copie. Chaque appel de la fonction extérieure crée un nouvel environnement, donc une mémoire séparée.",
              example: {
                code: `function creerCompteur(depart = 0) {
  let valeur = depart;
  return () => {
    valeur += 1;
    return valeur;
  };
}
const clics = creerCompteur();
const vues = creerCompteur(100);
console.log(clics(), clics(), vues());
const double = n => n * 2;
console.log(double(21));`,
                output: `1 2 101
42`,
                notes: [
                  { line: 1, text: "`depart = 0` : valeur par défaut, utilisée car `creerCompteur()` est appelée sans argument à la ligne 8." },
                  { line: 3, text: "La fonction fléchée renvoyée garde accès à `valeur` : c'est la closure." },
                  { line: 9, text: "Nouvel appel, nouvel environnement : `vues` a son propre `valeur`, indépendant de celui de `clics`." },
                  { line: 11, text: "Fléchée sans accolades : le résultat de `n * 2` est renvoyé automatiquement." }
                ]
              },
              exercises: [
                {
                  type: 'fill',
                  prompt: "Complète pour que `formaterNote` soit une fonction fléchée dont l'auteur vaut `'anonyme'` par défaut.",
                  code: `const formaterNote = (titre, auteur ___ 'anonyme') ___ \`\${titre} (par \${auteur})\`;
console.log(formaterNote('Courses'));
console.log(formaterNote('Projet IA', 'Sam'));`,
                  blanks: [
                    {
                      answers: ['='],
                      options: ['=', ':', '=>', '=='],
                      why: {
                        ':': "`:` sert dans les objets ; une valeur par défaut s'écrit avec `=`, comme en Python.",
                        '=>': "`=>` sépare les paramètres du corps de la fonction ; il n'a rien à faire dans la liste des paramètres.",
                        '==': "`==` compare ; une valeur par défaut s'écrit avec un seul `=`."
                      }
                    },
                    {
                      answers: ['=>'],
                      options: ['=>', '->', '=', ':'],
                      why: {
                        '->': "`->` n'existe pas en JavaScript : la flèche s'écrit `=>`.",
                        '=': "Sans flèche, JavaScript ne comprend pas que c'est une fonction : `SyntaxError`.",
                        ':': "`:` n'introduit pas un corps de fonction (ce n'est pas le `lambda x:` de Python)."
                      }
                    }
                  ],
                  output: `Courses (par anonyme)
Projet IA (par Sam)`,
                  hint: "La valeur par défaut s'écrit comme en Python ; la flèche est faite de deux caractères.",
                  explain: "`(titre, auteur = 'anonyme') => ...` est une fonction fléchée sans accolades : le gabarit est renvoyé directement. Le premier appel n'a qu'un argument, donc `auteur` prend sa valeur par défaut."
                },
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `function remise(prix, pourcentage = 10) {
  const montant = prix * pourcentage / 100;
  prix - montant;
}
const f = (prix, pourcentage = 10) => prix - prix * pourcentage / 100;
console.log(remise(50));
console.log(f(50), f(50, undefined), f(50, 0));`,
                  answer: `undefined
45 45 50`,
                  mistakes: [
                    { answer: `45
45 45 50`, why: "La fonction `remise` calcule `prix - montant` mais ne le renvoie pas : sans `return`, un appel vaut `undefined`." },
                    { answer: `undefined
45 NaN 50`, why: "Passer `undefined` revient à ne rien passer : la valeur par défaut 10 s'applique." },
                    { answer: `undefined
45 45 45`, why: "La valeur par défaut ne remplace que `undefined`. `0` est une vraie valeur : aucune remise." }
                  ],
                  hint: "Trois questions : `remise` renvoie-t-elle quelque chose ? Que fait un `undefined` passé en argument ? Et un `0` ?",
                  explain: "Une fonction déclarée sans `return` renvoie `undefined`. La fléchée sans accolades renvoie son expression. La valeur par défaut s'applique pour un argument absent ou `undefined`, pas pour `0`."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Une API d'IA limite le nombre de requêtes. Complète `creerLimiteur(max)` : elle renvoie une fonction qui répond `true` pour les `max` premiers appels, puis `false`. Chaque limiteur a son propre compteur. Sans argument, `max` vaut 3.",
                starter: `function creerLimiteur(max = 3) {
  // garde ici le nombre d'appels déjà faits
  return () => {
    // renvoie true tant que la limite n'est pas atteinte
  };
}
`,
                solution: `function creerLimiteur(max = 3) {
  let appels = 0;
  return () => {
    if (appels >= max) {
      return false;
    }
    appels += 1;
    return true;
  };
}
`,
                tests: [
                  { code: 'const essayer = creerLimiteur(2);\nassertEqual([essayer(), essayer(), essayer()], [true, true, false]);', label: 'creerLimiteur(2) autorise 2 appels, puis refuse' },
                  { code: 'const a = creerLimiteur(1);\nconst b = creerLimiteur(1);\na();\nassertEqual(b(), true);', label: 'deux limiteurs ont chacun leur propre compteur' },
                  { code: 'const c = creerLimiteur();\nassertEqual([c(), c(), c(), c()], [true, true, true, false]);', label: 'sans argument, la limite est 3' }
                ],
                hint: "Le compteur doit être déclaré dans `creerLimiteur`, hors de la fonction renvoyée : chaque appel de `creerLimiteur` en crée un nouveau.",
                explain: "`appels` vit dans l'environnement créé par chaque appel de `creerLimiteur`. La fonction renvoyée le lit et le modifie grâce à la closure. Un compteur déclaré hors de `creerLimiteur` serait partagé par tous les limiteurs."
              },
              recap: [
                "`function nom() {}` ou `const nom = () => ...` ; sans `return`, on obtient `undefined`.",
                "Fléchée sans accolades : la valeur est renvoyée ; avec accolades : `return` obligatoire.",
                "Une valeur par défaut s'applique pour un argument absent ou `undefined`.",
                "Une closure garde un lien vers les variables de la fonction qui l'a créée."
              ],
              check: {
                type: 'qcm',
                prompt: "Quand `bonjour('Ada')` s'exécute, l'appel de `creerSalutation` est terminé depuis longtemps. Pourquoi la fonction connaît-elle encore `formule` ?",
                code: `function creerSalutation(formule) {
  return (nom) => \`\${formule}, \${nom} !\`;
}
const bonjour = creerSalutation('Bonjour');
console.log(bonjour('Ada'));`,
                choices: [
                  "Une fonction garde accès aux variables de l'endroit où elle a été créée : c'est une closure",
                  "`formule` est devenue une variable globale",
                  "JavaScript a recopié le texte `'Bonjour'` dans le code de la fonction fléchée",
                  "Elle ne la connaît pas : le code affiche `undefined, Ada !`"
                ],
                answer: 0,
                why: {
                  1: "`formule` est un paramètre : il n'existe que dans `creerSalutation`. Ailleurs dans le programme, `formule` lèverait une `ReferenceError`.",
                  2: "Rien n'est recopié dans le code : la fonction garde un **lien** vers la variable. Si `formule` changeait dans `creerSalutation` après la création, la fonction verrait la nouvelle valeur.",
                  3: "Le code affiche bien `Bonjour, Ada !` : la valeur de `formule` est retrouvée grâce à la closure."
                },
                hint: "Où la fonction fléchée a-t-elle été créée, et à quelles variables avait-elle accès à ce moment-là ?",
                explain: "La fonction fléchée a été créée dans `creerSalutation`, là où `formule` existe. Elle garde un lien vers cet environnement : même après la fin de l'appel, `formule` reste accessible pour elle, et pour elle seule."
              }
            }
          ]
        }
      ]
    }
  ]
});
