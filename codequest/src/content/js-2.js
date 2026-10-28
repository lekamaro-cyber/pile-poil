// Parcours JavaScript, chapitre 2 : données (js.u6 et js.u7).
CQ.addChapter('js', {
  id: 'js.c2',
  title: 'Données',
  units: [
    // ------------------------------------------------------------------ js.u6
    {
      id: 'js.u6',
      title: 'Tableaux et objets',
      summary: 'Ranger des données en listes et en fiches, les copier et les déstructurer sans surprise.',
      lessons: [
        {
          id: 'js.u6.l1',
          title: 'Tableaux et objets',
          minutes: 7,
          objective: "Tu sais créer, lire et modifier un tableau et un objet, et parcourir les clés et valeurs d'un objet.",
          explain:
            "Un **tableau** ressemble à une liste Python : `const panier = ['pain', 'lait']`. `panier[0]` lit le premier élément, `panier.length` donne la taille, `push` ajoute à la fin, `pop` retire le dernier, `includes` teste la présence (le `in` de Python). Attention : `panier[-1]` ne lit pas le dernier élément, il vaut `undefined`. Écris `panier.at(-1)`.\n\n" +
            "Un **objet** ressemble à un dictionnaire : `const note = { titre: 'Courses', epinglee: false }`. Les clés s'écrivent sans guillemets. On lit avec `note.titre`, ou `note[cle]` quand la clé est dans une variable. Une clé absente donne `undefined`, pas une `KeyError`. Affecter une clé l'ajoute : `note.couleur = 'jaune'`.\n\n" +
            "`Object.keys(obj)`, `Object.values(obj)` et `Object.entries(obj)` renvoient des tableaux, comme `keys()`, `values()` et `items()`. La boucle `for (const [cle, valeur] of Object.entries(obj))` est l'équivalent de `for cle, valeur in d.items()`.\n\n" +
            "Un objet peut contenir des fonctions, ses **méthodes** : `{ valeur: 0, ajouter() { this.valeur += 1; } }`. Dans une méthode, `this` désigne l'objet placé devant le point lors de l'appel (`compteur.ajouter()`), comme `self` en Python, mais sans paramètre à écrire. Une fonction fléchée n'a pas son propre `this` : n'en fais pas une méthode.",
          example: {
            code: `const panier = ['pain', 'lait'];
panier.push('miel');
console.log(panier.length, panier.at(-1), panier[-1]);
console.log(panier.includes('lait'));
const prix = { pain: 1.2, lait: 0.9 };
prix.miel = 4.5;
const article = 'lait';
console.log(prix[article], prix.beurre);
for (const [nom, p] of Object.entries(prix)) {
  console.log(\`\${nom} : \${p} €\`);
}`,
            output: `3 miel undefined
true
0.9 undefined
pain : 1.2 €
lait : 0.9 €
miel : 4.5 €`,
            notes: [
              { line: 3, text: "`at(-1)` lit le dernier élément ; `panier[-1]` cherche une clé « -1 » qui n'existe pas : `undefined`." },
              { line: 6, text: "Affecter une clé inexistante l'ajoute à l'objet." },
              { line: 8, text: "Crochets avec une variable : on lit la clé `'lait'`. Une clé absente (`beurre`) donne `undefined`." },
              { line: 9, text: "`Object.entries` donne des paires `[clé, valeur]`, comme `items()` en Python." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `const note = {
  titre: 'Idées',
  tags: ['ia'],
  ajouterTag(tag) {
    this.tags.push(tag);
  },
};
note.ajouterTag('web');
note.auteur = 'Sam';
console.log(Object.keys(note).length);
console.log(note.tags.length, note.date);`,
              answer: `4
2 undefined`,
              mistakes: [
                { answer: `3
2 undefined`, why: "La méthode `ajouterTag` est aussi une clé de l'objet. Avec `titre`, `tags` et `auteur` (ajoutée ligne 9), on compte 4 clés." },
                { answer: `4
1 undefined`, why: "Lors de l'appel `note.ajouterTag('web')`, `this` désigne `note` : le tag est bien ajouté à `note.tags`. Et `const` n'empêche pas de modifier le contenu." },
                { answer: `4
2 null`, why: "Une clé absente vaut `undefined`, jamais `null` : `null` doit être affecté volontairement." }
              ],
              hint: "Une méthode est une clé comme une autre. Et dans `note.ajouterTag(...)`, qui est devant le point ?",
              explain: "L'objet a 4 clés : `titre`, `tags`, la méthode `ajouterTag` et `auteur`. L'appel `note.ajouterTag('web')` exécute la méthode avec `this` égal à `note` : `tags` passe à 2 éléments. `date` n'a jamais été définie : elle vaut `undefined`, sans erreur."
            },
            {
              type: 'fill',
              prompt: "Complète pour afficher le score de chaque modèle, puis le nombre de modèles.",
              code: `const scores = { alpha: 0.91, beta: 0.84 };
scores.gamma = 0.88;
for (const [modele, score] of Object.___(scores)) {
  console.log(modele, score);
}
console.log(Object.keys(scores).___);`,
              blanks: [
                {
                  answers: ['entries'],
                  options: ['entries', 'keys', 'values', 'items'],
                  why: {
                    keys: "`Object.keys` ne donne que les clés, des chaînes : il manquerait les scores.",
                    values: "`Object.values` ne donne que les scores, sans les noms des modèles.",
                    items: "`items()` est la méthode des dictionnaires Python ; en JavaScript, c'est `Object.entries`."
                  }
                },
                {
                  answers: ['length'],
                  options: ['length', 'size', 'len()', 'count'],
                  why: {
                    size: "`size` existe pour `Map` et `Set`, pas pour les tableaux.",
                    'len()': "`len()` est du Python. En JavaScript, la taille est une propriété : `.length`, sans parenthèses.",
                    count: "Un tableau n'a pas de propriété `count`."
                  }
                }
              ],
              output: `alpha 0.91
beta 0.84
gamma 0.88
3`,
              hint: "Il faut des paires `[clé, valeur]` pour remplir `[modele, score]`.",
              explain: "`Object.entries(scores)` donne `[['alpha', 0.91], ...]`, que la boucle découpe en `modele` et `score`. `Object.keys(scores)` est un tableau : sa taille se lit avec `.length`."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Un panier est un objet `{ article: quantité }`. Corrige `ajouterAuPanier(panier, article, quantite = 1)` pour qu'elle **ajoute** la quantité à celle déjà présente (ou crée l'article). Puis complète `totalArticles(panier)`, qui renvoie la somme des quantités.",
            starter: `function ajouterAuPanier(panier, article, quantite = 1) {
  panier[article] = quantite;
}

function totalArticles(panier) {
  let total = 0;
  // additionne les quantités
  return total;
}
`,
            solution: `function ajouterAuPanier(panier, article, quantite = 1) {
  if (panier[article] === undefined) {
    panier[article] = 0;
  }
  panier[article] += quantite;
}

function totalArticles(panier) {
  let total = 0;
  for (const q of Object.values(panier)) {
    total += q;
  }
  return total;
}
`,
            tests: [
              { code: "const p = {};\najouterAuPanier(p, 'pain');\najouterAuPanier(p, 'pain', 2);\najouterAuPanier(p, 'lait');\nassertEqual(p, { pain: 3, lait: 1 });", label: "ajouter pain, puis 2 pains, puis lait donne { pain: 3, lait: 1 }" },
              { code: 'assertEqual(totalArticles({ pain: 3, lait: 1 }), 4);', label: 'totalArticles({ pain: 3, lait: 1 }) renvoie 4' },
              { code: 'assertEqual(totalArticles({}), 0);', label: 'panier vide : 0 article' }
            ],
            hint: "Une clé absente vaut `undefined` : traite ce cas avant d'additionner. Pour le total, `Object.values` donne directement les quantités.",
            explain: "Sans le test, `undefined + 2` donnerait `NaN`. Une écriture plus compacte existe : `panier[article] = (panier[article] || 0) + quantite;`. Pour le total, on parcourt les valeurs de l'objet."
          },
          recap: [
            "Tableau : `t[i]`, `t.length`, `push`, `pop`, `includes`, `at(-1)` pour le dernier.",
            "Objet : `obj.cle` ou `obj[variable]` ; une clé absente vaut `undefined`.",
            "`Object.keys`, `Object.values`, `Object.entries` renvoient des tableaux.",
            "`for (const [cle, valeur] of Object.entries(obj))` parcourt un objet.",
            "Dans une méthode, `this` désigne l'objet devant le point, comme `self` en Python."
          ],
          check: {
            type: 'order',
            prompt: "Remets dans l'ordre ce programme qui compte les mots, comme un `Counter` Python fait main. Il doit afficher `2 undefined 4`.",
            lines: [
              'const compte = {};',
              "for (const mot of ['le', 'chat', 'et', 'le', 'chien']) {",
              '  compte[mot] = (compte[mot] || 0) + 1;',
              '}',
              'const distincts = Object.keys(compte).length;',
              'console.log(compte.le, compte.lapin, distincts);'
            ],
            output: '2 undefined 4',
            hint: "On ne peut compter les clés qu'une fois la boucle terminée.",
            explain: "L'objet vide est créé avant la boucle. Pour chaque mot, `compte[mot] || 0` vaut 0 au premier passage (clé absente), puis on ajoute 1. Après la boucle, `Object.keys` donne les 4 mots distincts ; `lapin` n'a jamais été compté."
          }
        },
        {
          id: 'js.u6.l2',
          title: 'Déstructuration, spread et références',
          minutes: 8,
          objective: "Tu sais extraire des valeurs par déstructuration, copier un tableau ou un objet avec `...`, et prévoir quand deux variables désignent le même objet.",
          explain:
            "**Déstructurer**, c'est extraire plusieurs valeurs d'un coup. `const { titre, tags } = note;` crée deux variables à partir des clés du même nom, avec une valeur par défaut possible : `const { couleur = 'jaune' } = note;`. Pour un tableau, c'est la position qui compte : `const [premier, ...reste] = scores;` équivaut à `premier, *reste = scores`. Raccourci inverse : `{ titre, tags }` vaut `{ titre: titre, tags: tags }`.\n\n" +
            "Le **spread** `...` étale un tableau ou un objet : `[...a, ...b]` fusionne deux tableaux, `{ ...note, epinglee: true }` copie `note` puis remplace une clé. C'est la façon courante de créer une version modifiée sans toucher à l'original.\n\n" +
            "**Références** : comme en Python, une variable contient une référence vers l'objet, pas l'objet lui-même. `const b = a;` ne copie rien : une modification via `b` se voit via `a`. `===` compare les références : deux objets au contenu identique ne sont pas égaux. Le spread fait une copie **superficielle** : les tableaux et objets imbriqués restent partagés.",
          example: {
            code: `const note = { titre: 'Projet IA', tags: ['ml'] };
const { titre, couleur = 'jaune' } = note;
console.log(titre, couleur);
const alias = note;
const copie = { ...note, titre: 'Projet web' };
alias.titre = 'Projet data';
console.log(note.titre, copie.titre);
copie.tags.push('web');
console.log(note.tags.length, note === alias, note === copie);`,
            output: `Projet IA jaune
Projet data Projet web
2 true false`,
            notes: [
              { line: 2, text: "`titre` vient de `note.titre` ; `couleur` n'existe pas dans `note`, la valeur par défaut s'applique." },
              { line: 4, text: "Aucune copie : `alias` et `note` désignent le même objet, d'où `Projet data` à la ligne 7." },
              { line: 5, text: "Copie avec spread, puis `titre` remplacé dans la copie seulement." },
              { line: 8, text: "Copie superficielle : `copie.tags` est le même tableau que `note.tags`, la modification se voit des deux côtés." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `const scores = [3, 1, 2];
const [premier, ...reste] = scores;
const alias = scores;
alias.push(4);
console.log(premier, reste.length, scores.length);
console.log(scores === alias, [1] === [1]);`,
              answer: `3 2 4
true false`,
              mistakes: [
                { answer: `3 2 3
true false`, why: "`alias` n'est pas une copie : `push` via `alias` modifie le tableau désigné aussi par `scores`." },
                { answer: `3 3 4
true false`, why: "`reste` a été créé à la ligne 2, avant le `push` : c'est un nouveau tableau `[1, 2]`, indépendant de `scores`." },
                { answer: `3 2 4
true true`, why: "`===` compare les références : deux tableaux créés séparément sont deux objets distincts, même avec le même contenu." }
              ],
              hint: "Repère les lignes qui créent un nouveau tableau et celles qui ne font que copier une référence.",
              explain: "La déstructuration crée `premier` (3) et un nouveau tableau `reste` (`[1, 2]`). `alias` désigne le même tableau que `scores`, qui passe à 4 éléments. `[1] === [1]` compare deux objets différents : `false`."
            },
            {
              type: 'bug',
              prompt: "`ajouterTag` devrait renvoyer une **nouvelle** note avec le tag en plus, sans modifier l'originale. Pourtant, le code affiche `2 2` au lieu de `1 2`. Clique sur la ligne fautive.",
              code: `function ajouterTag(note, tag) {
  const copie = { ...note };
  copie.tags.push(tag);
  return copie;
}
const original = { titre: 'Idées', tags: ['ia'] };
const nouvelle = ajouterTag(original, 'web');
console.log(original.tags.length, nouvelle.tags.length);`,
              bugLine: 3,
              why: "`{ ...note }` est une copie superficielle : `copie.tags` et `note.tags` sont le même tableau. Le `push` de la ligne 3 modifie donc aussi l'original.",
              fixes: ['  copie.tags = [...note.tags, tag];', '  copie.tags.push([tag]);', '  note.tags.push(tag);'],
              fixAnswer: 0,
              fixWhy: {
                1: "On modifie toujours le tableau partagé, et on y range un tableau `['web']` au lieu du texte.",
                2: "Modifier `note.tags`, c'est précisément modifier l'original : le comportement à éviter."
              },
              output: '1 2',
              hint: "Que copie vraiment `{ ...note }` quand une des valeurs est un tableau ?",
              explain: "`[...note.tags, tag]` crée un **nouveau** tableau qui contient les anciens tags plus le nouveau, et le range dans la copie. L'original garde son propre tableau, intact."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Cette fonction modifie le tableau reçu, ce qui casse l'historique « annuler » de l'appli. Réécris `marquerFaite(taches, id)` pour qu'elle renvoie un **nouveau** tableau, où la tâche concernée est remplacée par une **copie** avec `faite: true`. Le tableau d'origine et ses objets ne doivent pas changer.",
            starter: `function marquerFaite(taches, id) {
  for (const t of taches) {
    if (t.id === id) {
      t.faite = true;
    }
  }
  return taches;
}
`,
            solution: `function marquerFaite(taches, id) {
  const resultat = [];
  for (const t of taches) {
    if (t.id === id) {
      resultat.push({ ...t, faite: true });
    } else {
      resultat.push(t);
    }
  }
  return resultat;
}
`,
            tests: [
              { code: "const r = marquerFaite([{ id: 1, faite: false }, { id: 2, faite: false }], 2);\nassertEqual(r, [{ id: 1, faite: false }, { id: 2, faite: true }]);", label: 'la tâche 2 est marquée faite dans le résultat' },
              { code: "const avant = [{ id: 1, titre: 'Lire', faite: false }];\nmarquerFaite(avant, 1);\nassertEqual(avant[0].faite, false);", label: "l'objet d'origine n'est pas modifié" },
              { code: "const avant = [{ id: 1, titre: 'Lire', faite: false }];\nassert(marquerFaite(avant, 1) !== avant, 'Le résultat doit être un nouveau tableau');", label: 'le résultat est un nouveau tableau' }
            ],
            hint: "Construis un tableau vide, puis ajoute pour chaque tâche soit l'objet tel quel, soit une copie modifiée avec `{ ...t, faite: true }`.",
            explain: "Le nouveau tableau réutilise les tâches inchangées (aucun risque, on ne les modifie pas) et contient une copie pour la tâche marquée. C'est le principe des mises à jour immuables, que tu retrouveras dans les applis web."
          },
          recap: [
            "`const { a, b = 1 } = obj` et `const [x, ...reste] = tab` extraient des valeurs.",
            "`[...a, ...b]` et `{ ...obj, cle: v }` créent de nouveaux tableaux et objets.",
            "`const b = a` copie la référence, pas l'objet ; `===` compare les références.",
            "Le spread copie un seul niveau : les tableaux imbriqués restent partagés."
          ],
          check: {
            type: 'logic',
            prompt: "Que vaut `total` à la fin ? Réponds par un nombre.",
            code: `const a = { n: 1 };
const b = a;
const c = { ...a };
b.n = 2;
c.n = 3;
const total = a.n + b.n + c.n;`,
            answer: '7',
            mistakes: [
              { answer: '6', why: "`b` n'est pas une copie : `b.n = 2` modifie aussi `a.n`. On a donc 2 + 2 + 3." },
              { answer: '9', why: "`{ ...a }` crée un nouvel objet : `c.n = 3` ne touche ni `a` ni `b`." },
              { answer: '5', why: "`a.n` ne vaut plus 1 : `a` et `b` sont le même objet, modifié en ligne 4." }
            ],
            hint: "Combien d'objets différents existent vraiment ici ?",
            explain: "Il n'y a que deux objets : celui désigné par `a` et `b` (dont `n` vaut 2), et la copie `c` (dont `n` vaut 3). Total : 2 + 2 + 3 = 7."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u7
    {
      id: 'js.u7',
      title: 'Méthodes des tableaux',
      summary: 'Transformer, filtrer, résumer et trier des données sans écrire la boucle à la main.',
      lessons: [
        {
          id: 'js.u7.l1',
          title: 'map, filter, find, some, every',
          minutes: 7,
          objective: "Tu sais transformer un tableau avec `map`, le filtrer avec `filter`, et y chercher avec `find`, `some` ou `every`.",
          explain:
            "Ces méthodes prennent une fonction, souvent fléchée, appelée pour chaque élément :\n\n" +
            "- `map(f)` renvoie un nouveau tableau de même taille avec `f(x)` pour chaque `x` : l'équivalent de `[f(x) for x in liste]`.\n" +
            "- `filter(f)` garde les éléments pour lesquels `f(x)` est truthy : `[x for x in liste if test]`.\n" +
            "- `find(f)` renvoie le **premier** élément qui convient, ou `undefined`.\n" +
            "- `some(f)` répond `true` si au moins un élément convient (`any` en Python), `every(f)` si tous conviennent (`all`).\n\n" +
            "Aucune ne modifie le tableau d'origine. Elles s'enchaînent : `notes.filter(...).map(...)`. La fonction reçoit aussi l'indice en deuxième argument : `map((x, i) => ...)`.\n\n" +
            "Piège classique : une fléchée avec accolades doit contenir `return`. `map(x => { x * 2 })` renvoie un tableau de `undefined`.",
          example: {
            code: `const modeles = [
  { nom: 'alpha', precision: 0.91, gratuit: true },
  { nom: 'beta', precision: 0.78, gratuit: false },
  { nom: 'gamma', precision: 0.85, gratuit: true },
];
const noms = modeles.map(m => m.nom);
const bons = modeles.filter(m => m.precision > 0.8);
console.log(noms, bons.length);
console.log(modeles.find(m => !m.gratuit).nom);
console.log(modeles.some(m => m.precision > 0.9), modeles.every(m => m.gratuit));`,
            output: `[ 'alpha', 'beta', 'gamma' ] 2
beta
true false`,
            notes: [
              { line: 6, text: "`map` : un nouveau tableau qui ne contient que les noms." },
              { line: 7, text: "`filter` garde les modèles dont la précision dépasse 0.8 : alpha et gamma." },
              { line: 9, text: "`find` renvoie l'objet lui-même (le premier modèle payant), d'où l'accès à `.nom`." },
              { line: 10, text: "`some` : au moins un au-dessus de 0.9 ? Oui. `every` : tous gratuits ? Non." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: "Complète pour obtenir les titres des notes épinglées, en majuscules (`toUpperCase()` est l'équivalent de `upper()`).",
              code: `const notes = [
  { titre: 'courses', epinglee: true },
  { titre: 'film', epinglee: false },
  { titre: 'projet', epinglee: true },
];
const titres = notes
  .___(n => n.epinglee)
  .___(n => n.titre.toUpperCase());
console.log(titres);`,
              blanks: [
                {
                  answers: ['filter'],
                  options: ['filter', 'map', 'find', 'some'],
                  why: {
                    map: "`map` garderait les 3 notes, transformées en booléens `true` / `false`.",
                    find: "`find` s'arrête au premier élément trouvé et renvoie un objet, pas un tableau : la suite de la chaîne échouerait.",
                    some: "`some` renvoie un seul booléen, pas un tableau."
                  }
                },
                {
                  answers: ['map'],
                  options: ['map', 'filter', 'every', 'find'],
                  why: {
                    filter: "`filter` ne transforme rien : il garderait les objets entiers, car un titre non vide est truthy.",
                    every: "`every` renvoie un seul booléen.",
                    find: "`find` renvoie un seul élément, pas la liste des titres."
                  }
                }
              ],
              output: "[ 'COURSES', 'PROJET' ]",
              hint: "D'abord on garde certaines notes, ensuite on transforme celles qui restent.",
              explain: "`filter` garde les 2 notes épinglées, puis `map` transforme chacune en son titre en majuscules. Filtrer avant de transformer évite de calculer des valeurs inutiles."
            },
            {
              type: 'order',
              prompt: "Remets dans l'ordre ce programme qui repère les relevés de température au-dessus de 20 degrés et déclenche une alerte si l'un d'eux dépasse 25.",
              lines: [
                'const releves = [18, 24, 21, 15, 27];',
                'const chauds = releves.filter(t => t > 20);',
                'const alerte = chauds.some(t => t > 25);',
                "const message = alerte ? 'Alerte chaleur' : 'RAS';",
                'console.log(chauds, message);'
              ],
              output: '[ 24, 21, 27 ] Alerte chaleur',
              hint: "Chaque ligne utilise une variable créée par la ligne précédente.",
              explain: "Les données d'abord, puis le filtrage, puis le test `some` sur les relevés chauds, puis le message. Chaque étape dépend de la précédente : c'est un petit pipeline de données."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Tableau de bord d'un modèle d'IA : chaque résultat est `{ tache, score }`. Écris `tachesReussies(resultats, seuil = 0.8)`, qui renvoie les **noms** des tâches dont le score atteint le seuil, et `premierEchec(resultats, seuil = 0.8)`, qui renvoie le nom de la première tâche sous le seuil, ou `null` s'il n'y en a pas.",
            starter: `function tachesReussies(resultats, seuil = 0.8) {
  // noms des tâches dont le score atteint le seuil
}

function premierEchec(resultats, seuil = 0.8) {
  // nom de la première tâche sous le seuil, ou null
}
`,
            solution: `function tachesReussies(resultats, seuil = 0.8) {
  return resultats.filter(r => r.score >= seuil).map(r => r.tache);
}

function premierEchec(resultats, seuil = 0.8) {
  const echec = resultats.find(r => r.score < seuil);
  return echec ? echec.tache : null;
}
`,
            tests: [
              { code: "const R = [{ tache: 'traduction', score: 0.82 }, { tache: 'résumé', score: 0.64 }, { tache: 'classement', score: 0.9 }, { tache: 'questions', score: 0.71 }];\nassertEqual(tachesReussies(R), ['traduction', 'classement']);", label: 'tâches réussies avec le seuil par défaut 0.8' },
              { code: "const R = [{ tache: 'traduction', score: 0.82 }, { tache: 'résumé', score: 0.64 }, { tache: 'classement', score: 0.9 }, { tache: 'questions', score: 0.71 }];\nassertEqual(tachesReussies(R, 0.7), ['traduction', 'classement', 'questions']);", label: 'tâches réussies avec un seuil de 0.7' },
              { code: "const R = [{ tache: 'traduction', score: 0.82 }, { tache: 'résumé', score: 0.64 }, { tache: 'classement', score: 0.9 }];\nassertEqual(premierEchec(R), 'résumé');", label: "premier échec : 'résumé'" },
              { code: "const R = [{ tache: 'traduction', score: 0.82 }, { tache: 'résumé', score: 0.64 }];\nassertEqual(premierEchec(R, 0.5), null);", label: 'aucun échec sous 0.5 : null' }
            ],
            checks: [
              { re: '\\.filter\\(', label: 'Utilise filter' },
              { re: '\\.find\\(', label: 'Utilise find' }
            ],
            hint: "Enchaîne `filter` puis `map` pour la première fonction. Pour la seconde, `find` renvoie `undefined` quand rien ne convient : traite ce cas.",
            explain: "`filter(...).map(...)` garde puis transforme. `find` renvoie l'objet trouvé ou `undefined` : le ternaire `echec ? echec.tache : null` évite de lire `.tache` sur `undefined`, ce qui lèverait une `TypeError`."
          },
          recap: [
            "`map` transforme, `filter` garde : les deux renvoient un nouveau tableau.",
            "`find` renvoie le premier élément qui convient, ou `undefined`.",
            "`some` = au moins un (`any`), `every` = tous (`all`).",
            "Fléchée avec accolades : n'oublie pas `return`."
          ],
          check: {
            type: 'predict',
            prompt: "Qu'affiche ce programme ?",
            code: `const prix = [12, 5, 30, 8];
const soldes = prix.map(p => p / 2);
const petits = prix.filter(p => p < 10);
console.log(soldes, petits);
console.log(prix.find(p => p > 10), prix.find(p => p > 100));
console.log(prix.some(p => p > 25), prix.every(p => p > 5));`,
            answer: `[ 6, 2.5, 15, 4 ] [ 5, 8 ]
12 undefined
true false`,
            accept: [`[6, 2.5, 15, 4] [5, 8]
12 undefined
true false`],
            mistakes: [
              { answer: `[ 6, 2.5, 15, 4 ] [ 5, 8 ]
[ 12, 30 ] undefined
true false`, why: "`find` ne renvoie que le **premier** élément qui convient, pas tous : 12." },
              { answer: `[ 6, 2.5, 15, 4 ] [ 5, 8 ]
12 null
true false`, why: "Quand rien ne convient, `find` renvoie `undefined`, pas `null`." },
              { answer: `[ 6, 2.5, 15, 4 ] [ 5, 8 ]
12 undefined
true true`, why: "`every` exige que **tous** conviennent : 5 n'est pas strictement supérieur à 5." }
            ],
            hint: "Pour chaque méthode, demande-toi ce qu'elle renvoie : un tableau, un élément ou un booléen ?",
            explain: "`map` et `filter` renvoient des tableaux. `find` renvoie le premier élément supérieur à 10 (12), puis `undefined` faute de candidat. `some` trouve 30 > 25 ; `every` échoue sur 5."
          }
        },
        {
          id: 'js.u7.l2',
          title: 'reduce et sort sans pièges',
          minutes: 8,
          objective: "Tu sais résumer un tableau avec `reduce` et le trier correctement avec `sort` et une fonction de comparaison.",
          explain:
            "`reduce((acc, x) => ..., depart)` parcourt le tableau en transportant un **accumulateur** : chaque appel renvoie la nouvelle valeur de `acc`. Pour une somme : `prix.reduce((total, p) => total + p, 0)`. Donne toujours la valeur de départ : sans elle, `reduce` démarre avec le premier élément, et lève une `TypeError` sur un tableau vide.\n\n" +
            "`sort` cache deux pièges :\n\n" +
            "- Sans argument, il trie comme du **texte** : `[10, 9, 1].sort()` donne `[1, 10, 9]`. Pour des nombres, passe une fonction de comparaison : `(a, b) => a - b` (croissant) ou `(a, b) => b - a` (décroissant). Un résultat négatif place `a` avant `b`, positif le place après.\n" +
            "- Il **modifie** le tableau d'origine (contrairement à `sorted` en Python) et renvoie ce même tableau. Pour garder l'original, trie une copie : `[...scores].sort(...)`, ou utilise `toSorted`, plus récent.\n\n" +
            "Pour comparer deux textes dans une fonction de tri, `a.localeCompare(b)` renvoie un nombre négatif, nul ou positif selon l'ordre alphabétique.",
          example: {
            code: `const scores = [10, 9, 100, 25];
console.log([...scores].sort());
console.log([...scores].sort((a, b) => a - b));
const total = scores.reduce((acc, s) => acc + s, 0);
console.log(total, total / scores.length);
const classement = [
  { modele: 'beta', score: 78 },
  { modele: 'alpha', score: 91 },
];
classement.sort((a, b) => b.score - a.score);
console.log(classement[0].modele);`,
            output: `[ 10, 100, 25, 9 ]
[ 9, 10, 25, 100 ]
144 36
alpha`,
            notes: [
              { line: 2, text: "Tri par défaut, comme du texte : `'100'` vient avant `'25'` car `'1'` est avant `'2'`." },
              { line: 3, text: "`a - b` négatif : `a` passe devant. Tri numérique croissant, sur une copie." },
              { line: 4, text: "L'accumulateur part de 0 et reçoit chaque score à tour de rôle." },
              { line: 10, text: "`b.score - a.score` : tri décroissant sur une propriété. Ici, `sort` modifie `classement` lui-même." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `const tailles = [4, 15, 9];
const triees = tailles.sort();
console.log(triees);
console.log(tailles, tailles === triees);`,
              answer: `[ 15, 4, 9 ]
[ 15, 4, 9 ] true`,
              accept: [`[15, 4, 9]
[15, 4, 9] true`],
              mistakes: [
                { answer: `[ 4, 9, 15 ]
[ 4, 9, 15 ] true`, why: "Sans fonction de comparaison, les nombres sont triés comme du texte : `'15'` passe avant `'4'` car `'1'` est avant `'4'`." },
                { answer: `[ 15, 4, 9 ]
[ 4, 15, 9 ] false`, why: "`sort` trie le tableau sur place et renvoie ce même tableau : `tailles` est modifié et `triees` désigne le même objet." }
              ],
              hint: "Deux questions : comment `sort` compare-t-il sans argument, et renvoie-t-il une copie ?",
              explain: "Le tri par défaut compare les textes `'4'`, `'15'` et `'9'` : `'15'` < `'4'` < `'9'`. Et `sort` modifie `tailles` puis renvoie une référence vers lui : `triees === tailles`."
            },
            {
              type: 'bug',
              prompt: "`totalPanier` plante avec `TypeError: Reduce of empty array with no initial value` quand le panier est vide. Clique sur la ligne fautive.",
              code: `function totalPanier(articles) {
  return articles.reduce((total, a) => total + a.prix * a.quantite);
}
console.log(totalPanier([]));
console.log(totalPanier([{ prix: 3, quantite: 2 }, { prix: 4, quantite: 1 }]));`,
              bugLine: 2,
              why: "Sans valeur de départ, `reduce` prend le premier élément comme accumulateur : erreur sur un tableau vide, et sinon l'accumulateur est un **objet** article, pas un nombre.",
              fixes: [
                '  return articles.reduce((total, a) => total + a.prix * a.quantite, 0);',
                '  return articles.reduce((total, a) => total + a.prix * a.quantite, []);',
                '  return articles.length === 0 ? 0 : articles.reduce((total, a) => total + a.prix * a.quantite);'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Avec `[]` comme départ, `[] + 6` donne la chaîne `'6'` : on obtiendrait du texte, pas une somme.",
                2: "Le panier vide est réglé, mais l'accumulateur commence toujours par le premier objet article : `objet + 4` donne `'[object Object]4'`."
              },
              output: `0
10`,
              hint: "Quel est le deuxième argument de `reduce`, et que se passe-t-il s'il manque ?",
              explain: "Avec 0 comme valeur de départ, l'accumulateur est un nombre dès le premier tour, et un tableau vide renvoie simplement 0. Prends l'habitude de toujours donner cette valeur."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Le classement d'un concours de modèles d'IA est faux. Corrige `classement(resultats)` : noms triés par score décroissant, puis par nom alphabétique en cas d'égalité, **sans modifier** le tableau reçu. Corrige aussi `scoreMoyen(resultats)` : moyenne des scores, 0 pour un tableau vide.",
            starter: `function classement(resultats) {
  return resultats.sort().map(r => r.nom);
}

function scoreMoyen(resultats) {
  const total = resultats.reduce((acc, r) => acc + r.score);
  return total / resultats.length;
}
`,
            solution: `function classement(resultats) {
  return [...resultats]
    .sort((a, b) => b.score - a.score || a.nom.localeCompare(b.nom))
    .map(r => r.nom);
}

function scoreMoyen(resultats) {
  if (resultats.length === 0) {
    return 0;
  }
  const total = resultats.reduce((acc, r) => acc + r.score, 0);
  return total / resultats.length;
}
`,
            tests: [
              { code: "const R = [{ nom: 'beta', score: 78 }, { nom: 'alpha', score: 91 }, { nom: 'delta', score: 78 }, { nom: 'gamma', score: 85 }];\nassertEqual(classement(R), ['alpha', 'gamma', 'beta', 'delta']);", label: 'classement par score décroissant, puis par nom' },
              { code: "const R = [{ nom: 'beta', score: 78 }, { nom: 'alpha', score: 91 }];\nclassement(R);\nassertEqual(R.map(r => r.nom), ['beta', 'alpha']);", label: "le tableau d'origine n'est pas modifié" },
              { code: "const R = [{ nom: 'beta', score: 78 }, { nom: 'alpha', score: 91 }, { nom: 'delta', score: 78 }, { nom: 'gamma', score: 85 }];\nassertEqual(scoreMoyen(R), 83);", label: 'scoreMoyen renvoie 83' },
              { code: 'assertEqual(scoreMoyen([]), 0);', label: 'scoreMoyen([]) renvoie 0' }
            ],
            hint: "Copie avant de trier. Pour départager les égalités : quand `b.score - a.score` vaut 0, compare les noms.",
            explain: "`b.score - a.score || a.nom.localeCompare(b.nom)` : si la différence de scores vaut 0 (falsy), `||` passe à la comparaison des noms. La copie `[...resultats]` protège l'original, et `reduce` avec 0 au départ donne une vraie somme."
          },
          recap: [
            "`reduce((acc, x) => ..., depart)` : donne toujours la valeur de départ.",
            "`sort()` sans argument trie comme du texte, même des nombres.",
            "`(a, b) => a - b` pour croissant, `b - a` pour décroissant.",
            "`sort` modifie le tableau : trie une copie `[...t]` pour garder l'original."
          ],
          check: {
            type: 'qcm',
            prompt: "Quel appel trie `scores` (des nombres) du plus grand au plus petit, **sans modifier** `scores` ?",
            choices: [
              '`[...scores].sort((a, b) => b - a)`',
              '`scores.sort((a, b) => b - a)`',
              '`[...scores].sort().reverse()`',
              '`[...scores].sort((a, b) => a < b)`'
            ],
            answer: 0,
            why: {
              1: "Le tri est correct, mais `sort` modifie `scores` lui-même : l'ordre d'origine est perdu.",
              2: "`sort()` sans argument trie comme du texte : `[9, 100, 25]` donnerait `[100, 25, 9]` puis, inversé, `[9, 25, 100]`.",
              3: "La fonction de comparaison doit renvoyer un **nombre** négatif, nul ou positif. Un booléen ne dit jamais « `a` avant `b` » : le résultat est faux ou imprévisible."
            },
            hint: "Il faut trois choses : une copie, une comparaison numérique, et le bon sens.",
            explain: "`[...scores]` crée une copie, et `(a, b) => b - a` renvoie un nombre positif quand `b` est plus grand : `b` passe devant. On obtient un ordre décroissant, et `scores` reste intact."
          }
        }
      ]
    }
  ]
});
