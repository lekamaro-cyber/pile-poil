// CodeQuest — parcours « Autres langages », fichier 3 : TypeScript, Bash, Dart et Flutter.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  // ---------------------------------------------------------------- autres.c7
  CQ.addChapter('autres', {
    id: 'autres.c7',
    title: 'TypeScript',
    units: [
      {
        id: 'autres.u9',
        title: 'Bases de TypeScript',
        summary: "Typer du JavaScript : types, interfaces, unions et génériques simples, vérifiés avant l'exécution.",
        requires: ['js.u5'],
        lessons: [
          {
            id: 'autres.u9.l1',
            title: 'Du JavaScript avec des types',
            minutes: 8,
            lang: 'typescript',
            objective: "Tu sais typer des variables, des fonctions et des objets en TypeScript avec des interfaces, des unions et un générique simple, et comprendre les erreurs du compilateur.",
            explain: P(
              "**TypeScript** est du JavaScript avec des **types vérifiés avant l'exécution**. Le compilateur `tsc` contrôle le code puis produit du JavaScript ordinaire : les types disparaissent à l'exécution. C'est le standard des gros projets web (Angular, VS Code, et beaucoup de projets React et Node). **Forces** : erreurs repérées dès l'éditeur, autocomplétion, modifications sûres. **Limites** : une étape de compilation, et aucune vérification des données reçues à l'exécution (un JSON peut mentir à tes types : il faut le valider).",
              "L'essentiel :",
              "- `let age: number = 36;` (souvent inutile : le type est **déduit**) ;\n- `function aire(l: number, h: number): number` ;\n- `interface Livre { titre: string; pages?: number }` décrit la forme d'un objet (`?` : facultatif) ;\n- une **union** `string | null` accepte l'un ou l'autre ; on la **rétrécit** avec un test (`if (x !== null)`). `type Forme = A | B` donne un nom à une union ;\n- un **générique** `function premier<T>(liste: T[]): T | undefined` marche pour tout type en gardant l'information.",
              "C'est l'équivalent des annotations Python (`def aire(l: float) -> float`), mais vérifié à chaque compilation.",
              "À essayer sur ton ordinateur : `npm install -D typescript`, puis `npx tsc main.ts` et `node main.js`. Les versions récentes de Node (comme Node 24) lancent aussi un `.ts` simple directement : `node main.ts`."
            ),
            example: {
              code: `interface Livre {
  titre: string;
  pages?: number;
}

function resume(livre: Livre): string {
  const pages = livre.pages ?? 0;
  return \`\${livre.titre} (\${pages} pages)\`;
}

function premier<T>(liste: T[]): T | undefined {
  return liste[0];
}

const pile: Livre[] = [{ titre: "Dune", pages: 896 }, { titre: "Ubik" }];
console.log(resume(pile[1]));
console.log(premier(pile)?.titre);`,
              output: `Ubik (0 pages)
Dune`,
              notes: [
                { line: 3, text: "`pages?` est facultatif : son type est en réalité `number | undefined`." },
                { line: 7, text: "`??` donne 0 si `pages` est `undefined` (ou `null`), comme une valeur par défaut." },
                { line: 11, text: "Générique : `T` prend le type de la liste reçue. Ici `premier(pile)` est de type `Livre | undefined`." },
                { line: 17, text: "`?.` n'accède à `titre` que si le résultat n'est pas `undefined`." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Ce code compile-t-il avec `tsc --strict` ?",
                code: `function longueur(texte: string | null): number {
  return texte.length;
}`,
                choices: [
                  "Oui : TypeScript convertit `null` en chaîne vide",
                  "Oui, mais l'appel `longueur(null)` plantera toujours à l'exécution",
                  "Non : une fonction ne peut pas recevoir une union",
                  "Non : `texte` peut être `null`, il faut d'abord le tester"
                ],
                answer: 3,
                why: {
                  0: "TypeScript ne convertit rien : les types disparaissent à la compilation, il ne fait que vérifier.",
                  1: "En mode strict, le compilateur refuse ce code avant toute exécution : c'est justement son rôle.",
                  2: "Les unions sont faites pour ça ; le problème est l'usage de `.length` sans vérification."
                },
                hint: "Que se passerait-il en JavaScript si on lisait `.length` sur `null` ? Le compilateur le sait.",
                explain: "Avec `strict`, `null` n'est plus accepté partout : le compilateur signale que `texte` est peut-être `null`. On rétrécit l'union avec un test (`if (texte === null) return 0;`), et après ce test TypeScript sait que `texte` est une `string`. C'est l'erreur `TypeError: Cannot read properties of null` attrapée avant l'exécution."
              },
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `type Forme =
  | { type: "cercle"; rayon: number }
  | { type: "rectangle"; largeur: number; hauteur: number };

function aire(f: Forme): number {
  if (f.type === "cercle") {
    return Math.round(3.14 * f.rayon * f.rayon);
  }
  return f.largeur * f.hauteur;
}

const formes: Forme[] = [{ type: "cercle", rayon: 2 }, { type: "rectangle", largeur: 3, hauteur: 4 }];
console.log(formes.map(aire).join(" + "));`,
                answer: `13 + 12`,
                mistakes: [
                  { answer: `12.56 + 12`, why: "`Math.round` arrondit 12.56 à l'entier le plus proche : 13." },
                  { answer: `13,12`, why: "`join(\" + \")` relie les éléments avec la chaîne « + » entourée d'espaces." }
                ],
                hint: "Calcule chaque aire, puis regarde ce que fait `join`.",
                explain: "Le cercle donne `Math.round(12.56)`, soit 13 ; le rectangle 12. Le champ `type` sert de **discriminant** : après `if (f.type === \"cercle\")`, TypeScript sait que `f` a un `rayon`, et dans la suite, qu'il a `largeur` et `hauteur`. Accéder à `f.rayon` hors du `if` serait une erreur de compilation."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "`tsc` refuse de compiler ce fichier : « 'u.email' is possibly 'undefined' ». Clique sur la ligne fautive, puis choisis la correction qui compile **et** fonctionne pour les deux appels.",
              code: `interface Utilisateur {
  nom: string;
  email?: string;
}

function domaine(u: Utilisateur): string {
  return u.email.split("@")[1];
}

console.log(domaine({ nom: "Ada", email: "ada@exemple.fr" }));
console.log(domaine({ nom: "Linus" }));`,
              bugLine: 7,
              why: "`email` est facultatif : pour Linus, `u.email` vaut `undefined`, et `.split` planterait. Le compilateur exige qu'on traite ce cas.",
              fixes: [
                "  return u.email ? u.email.split(\"@\")[1] : \"inconnu\";",
                "  return u.email!.split(\"@\")[1];",
                "  return (u.email as string).split(\"@\")[1];"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Le `!` dit au compilateur « fais-moi confiance, ce n'est pas undefined » : ça compile, mais l'appel pour Linus plante à l'exécution (`TypeError`).",
                2: "`as string` force le type sans rien vérifier : même plantage à l'exécution pour Linus."
              },
              output: `exemple.fr
inconnu`,
              hint: "Deux corrections font taire le compilateur. Une seule traite réellement le cas où l'e-mail manque.",
              explain: "Le test `u.email ? ... : ...` rétrécit le type dans chaque branche : dans la première, `u.email` est une `string`. Le `!` et `as` ne font que masquer l'erreur : le compilateur se tait, mais le bug reste. Utilise-les seulement quand tu sais quelque chose que le compilateur ne peut pas savoir."
            },
            recap: [
              "TypeScript = JavaScript + types vérifiés par `tsc` ; les types disparaissent à l'exécution.",
              "Interfaces pour la forme des objets, `?` pour les champs facultatifs.",
              "Unions (`string | null`) rétrécies par des tests ; génériques `<T>` réutilisables.",
              "`!` et `as` font taire le compilateur sans rien vérifier : à éviter."
            ],
            check: {
              type: 'fill',
              prompt: "Complète : une forme d'objet avec un champ facultatif, une union rétrécie par un test, et une fonction générique.",
              code: `___ Produit {
  nom: string;
  prix: number;
  promo?: number;
}

function prixFinal(p: Produit): number {
  return p.promo !== ___ ? p.prix - p.promo : p.prix;
}

function dernier<___>(liste: T[]): T | undefined {
  return liste[liste.length - 1];
}

const panier: Produit[] = [{ nom: "Clavier", prix: 50, promo: 10 }, { nom: "Souris", prix: 20 }];
console.log(panier.map(prixFinal).join(", "));
console.log(dernier(panier)?.nom);`,
              blanks: [
                { answers: ['interface'], options: ['interface', 'object', 'dict'], why: { 'object': "`object` est un type, pas un mot-clé de déclaration : on décrit une forme avec `interface` (ou `type Produit = { ... }`).", 'dict': "`dict` est un type Python ; il n'existe pas en TypeScript." } },
                { answers: ['undefined'], options: ['undefined', 'null', '0'], why: { 'null': "Un champ facultatif absent vaut `undefined`, pas `null` : après `!== null`, `p.promo` serait encore `number | undefined` et la soustraction ne compilerait pas.", '0': "Comparer à 0 ne retire pas `undefined` du type : erreur de compilation sur `p.prix - p.promo`." } },
                { answers: ['T'], options: ['T', 'any', 'number'], why: { 'any': "`<any>` n'est pas un paramètre de type valide ici, et `T` resterait inconnu dans la signature.", 'number': "Le paramètre de type doit s'appeler comme celui utilisé ensuite (`T[]`, `T | undefined`)." } }
              ],
              output: `40, 20
Souris`,
              hint: "Un champ facultatif absent vaut `undefined`. Le paramètre de type déclaré entre chevrons doit être celui qu'on utilise ensuite.",
              explain: "`interface` décrit la forme d'un `Produit`. Le test `!== undefined` rétrécit `promo` en `number` dans la branche où on soustrait. `<T>` déclare le paramètre de type de `dernier`, qui renvoie alors un `Produit | undefined`, d'où le `?.` pour lire son nom."
            }
          }
        ]
      }
    ]
  });

  // ---------------------------------------------------------------- autres.c8
  CQ.addChapter('autres', {
    id: 'autres.c8',
    title: 'Bash',
    units: [
      {
        id: 'autres.u10',
        title: 'Scripts Bash',
        summary: "Variables, conditions, boucles, arguments et pipes, en comparaison avec PowerShell.",
        requires: [],
        lessons: [
          {
            id: 'autres.u10.l1',
            title: 'Bash pour qui connaît PowerShell',
            minutes: 8,
            lang: 'bash',
            objective: "Tu sais écrire un script Bash avec variables, conditions, boucles et arguments, enchaîner des commandes avec des pipes, et dire ce qui change par rapport à PowerShell.",
            explain: P(
              "**Bash** est le shell standard de Linux (disponible aussi sur macOS, et sous Windows avec WSL ou Git Bash) : serveurs, conteneurs Docker, pipelines d'intégration continue. **Forces** : présent sur tous les serveurs, idéal pour enchaîner des commandes. **Limites** : syntaxe piégeuse, pas de vrais types ; au-delà d'une centaine de lignes, passe à Python.",
              "Ce qui change par rapport à PowerShell :",
              "- **les pipes transportent du texte**, pas des objets : `ls -l | sort -k5 -n` trie des lignes selon leur 5e colonne, là où `Get-ChildItem | Sort-Object Length` trie des objets par propriété ;\n- variables : `nom=\"Ada\"` **sans espaces** autour de `=`, lues avec `$nom`, toujours entre guillemets (`\"$nom\"`) ;\n- arguments : `$1`, `$2`…, tous avec `\"$@\"`, leur nombre avec `$#` (au lieu de `$args`) ;\n- conditions : `if [ \"$n\" -gt 5 ]; then … fi`, avec `-eq`, `-lt`, `-gt` comme en PowerShell ;\n- boucles : `for f in *.txt; do … done` ; calcul entier : `$((a + b))` ; `$(commande)` capture une sortie.",
              "Comme en PowerShell, les guillemets doubles remplacent les variables et les apostrophes non.",
              "À essayer sur ton ordinateur : `wsl --install` sous Windows, puis un fichier `script.sh` qui commence par `#!/usr/bin/env bash` ; rends-le exécutable avec `chmod +x script.sh` et lance `./script.sh un deux`."
            ),
            example: {
              code: `#!/usr/bin/env bash
set -- rapport.txt photo.jpg notes.md   # simule : ./script.sh rapport.txt photo.jpg notes.md

echo "Arguments : $#"
for fichier in "$@"; do
  if [[ "$fichier" == *.jpg ]]; then
    echo "image : $fichier"
  else
    echo "autre : $fichier"
  fi
done
printf '%s\\n' "$@" | sort | head -n 1`,
              output: `Arguments : 3
autre : rapport.txt
image : photo.jpg
autre : notes.md
notes.md`,
              notes: [
                { line: 2, text: "`set --` remplace les arguments du script : pratique pour tester sans relancer avec d'autres paramètres." },
                { line: 5, text: "`\"$@\"` donne chaque argument séparément, même s'il contient des espaces. PowerShell : `foreach ($f in $args)`." },
                { line: 6, text: "`[[ ... == *.jpg ]]` compare à un motif (le `*` remplace n'importe quels caractères)." },
                { line: 12, text: "Un pipe de texte : une ligne par argument, triées, et on garde la première." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "En PowerShell, `Get-ChildItem | Where-Object Length -gt 1MB` filtre des objets selon leur propriété `Length`. En Bash, que circule-t-il entre `ls -l` et `awk '$5 > 1048576'` dans `ls -l | awk '$5 > 1048576'` ?",
                choices: [
                  "Des objets fichiers avec une propriété de taille",
                  "Un tableau JSON",
                  "Des lignes de texte : `awk` découpe chaque ligne en colonnes et compare la 5e",
                  "Rien : en Bash, `|` sert seulement à écrire dans un fichier"
                ],
                answer: 2,
                why: {
                  0: "C'est le modèle de PowerShell. En Bash, une commande ne transmet que du texte à la suivante.",
                  1: "Aucun format structuré n'est imposé : `ls -l` écrit des lignes destinées à un humain.",
                  3: "L'écriture dans un fichier se fait avec `>` ; `|` envoie la sortie d'une commande à l'entrée de la suivante."
                },
                hint: "Pense à ce que tu vois quand tu lances `ls -l` seul : c'est exactement ce que reçoit la commande suivante.",
                explain: "En Bash, tout pipe transporte du texte. `awk` découpe chaque ligne en colonnes (la 5e de `ls -l` est la taille) et garde celles qui dépassent 1 Mio. C'est puissant mais fragile : si le format des lignes change, le script casse, là où PowerShell lirait une propriété nommée."
              },
              {
                type: 'predict',
                prompt: "Qu'affiche ce script ?",
                code: `nom="Ada"
langage='Python'
echo "Bonjour $nom"
echo 'Bonjour $nom'
total=$((3 + 4))
echo "$langage : $total"`,
                answer: `Bonjour Ada
Bonjour $nom
Python : 7`,
                mistakes: [
                  { answer: `Bonjour Ada
Bonjour Ada
Python : 7`, why: "Entre apostrophes, Bash ne remplace rien : `'Bonjour $nom'` s'affiche tel quel. C'est la même règle qu'en PowerShell." },
                  { answer: `Bonjour Ada
Bonjour $nom
Python : 3 + 4`, why: "`$((...))` calcule l'expression entière : `total` vaut 7." }
                ],
                hint: "Guillemets doubles ou apostrophes ? Et que fait `$((...))` ?",
                explain: "Les guillemets doubles remplacent les variables, les apostrophes gardent le texte littéral. `$((3 + 4))` effectue un calcul entier ; sans lui, Bash traite tout comme du texte (`total=3+4` rangerait la chaîne « 3+4 »)."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Ce script devrait afficher `12 dépasse 10`, mais Bash affiche « seuil: command not found » puis « 12 ne dépasse pas ». Clique sur la ligne fautive.",
              code: `#!/usr/bin/env bash
set -- 12

seuil = 10
if [ "$1" -gt "$seuil" ]; then
  echo "$1 dépasse $seuil"
else
  echo "$1 ne dépasse pas $seuil"
fi`,
              bugLine: 4,
              why: "Avec des espaces, Bash lit `seuil = 10` comme la commande `seuil` avec deux arguments, `=` et `10`. La variable n'est jamais créée, et le test compare 12 à une chaîne vide.",
              fixes: [
                "seuil=10",
                "$seuil = 10",
                "seuil == 10"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "C'est l'écriture PowerShell. En Bash, le `$` sert à lire une variable, pas à l'affecter : `$seuil` (vide) disparaît et Bash cherche la commande `=`.",
                2: "Même problème, avec une commande `seuil` et les arguments `==` et `10`."
              },
              output: `12 dépasse 10`,
              hint: "Habitude PowerShell : `$seuil = 10`. Comment s'écrit une affectation en Bash ?",
              explain: "En Bash, une affectation s'écrit sans espaces et sans `$` : `seuil=10`. Le `$` ne sert qu'à lire la valeur. Erreur très fréquente en venant de PowerShell ou de Python, où les espaces autour de `=` sont permis."
            },
            recap: [
              "Pipes de texte (Bash) contre pipes d'objets (PowerShell).",
              "`nom=\"valeur\"` sans espaces ; on lit avec `\"$nom\"`, toujours entre guillemets.",
              "Arguments : `$1`, `\"$@\"`, `$#` ; tests : `[ \"$a\" -gt \"$b\" ]` ; calcul : `$((a + b))`.",
              "Commence tes scripts par `#!/usr/bin/env bash` (et souvent `set -euo pipefail`, qui arrête le script à la première erreur)."
            ],
            check: {
              type: 'order',
              prompt: "Remets ce script dans l'ordre : il cherche le plus grand de ses arguments et affiche `Maximum : 15`.",
              lines: [
                "#!/usr/bin/env bash",
                "set -- 3 8 15",
                "max=$1",
                "for n in \"$@\"; do",
                "  if [ \"$n\" -gt \"$max\" ]; then max=$n; fi",
                "done",
                "echo \"Maximum : $max\""
              ],
              output: `Maximum : 15`,
              hint: "La ligne `#!` vient toujours en premier. Il faut des arguments avant de lire `$1`, et `max` doit exister avant la boucle.",
              explain: "Le shebang indique l'interpréteur. `set --` fixe les arguments, `max=$1` initialise avec le premier, la boucle parcourt tous les arguments et met à jour `max` quand elle trouve plus grand. L'affichage vient après `done`, une fois la boucle terminée."
            }
          }
        ]
      }
    ]
  });

  // ---------------------------------------------------------------- autres.c9
  CQ.addChapter('autres', {
    id: 'autres.c9',
    title: 'Dart et Flutter',
    units: [
      {
        id: 'autres.u11',
        title: 'Dart et Flutter',
        summary: "La syntaxe de Dart, la sécurité contre null, et les interfaces Flutter construites en arbre de widgets.",
        requires: ['js.u5'],
        lessons: [
          {
            id: 'autres.u11.l1',
            title: 'Une appli, toutes les plateformes',
            minutes: 8,
            lang: 'dart',
            objective: "Tu sais lire du code Dart qui utilise la sécurité contre `null`, et expliquer comment Flutter construit une interface sous forme d'arbre de widgets.",
            explain: P(
              "**Dart** est le langage de **Flutter**, le framework de Google qui produit, avec un seul code, des applis Android, iOS, web et bureau. **Forces** : une seule base de code, des interfaces fluides, et le **hot reload** : tu modifies le code, l'appli en cours se met à jour en une seconde, sans perdre son état. **Limites** : des applis plus lourdes qu'en natif, et Dart peu utilisé hors de Flutter.",
              "Dart ressemble à Java et à JavaScript : types (`int`, `double`, `String`, `bool`, `List<String>`) ou `var` et `final`, accolades et `;`. Sa **sécurité contre null** est stricte : une `String` ne peut jamais valoir `null`, une `String?` le peut. C'est l'équivalent de `Optional[str]` en Python, mais vérifié par le compilateur. Pour utiliser une `String?`, on teste (`if (nom != null)`), on donne une valeur par défaut (`nom ?? 'invité'`) ou on accède prudemment (`nom?.length`).",
              "Dans Flutter, **tout est widget** : un écran est un **arbre** (`MaterialApp`, puis `Scaffold`, `Column`, `Text`, `ElevatedButton`…). Un `StatelessWidget` affiche des données fixes ; un `StatefulWidget` garde un état et appelle `setState` pour se redessiner.",
              "À essayer sur ton ordinateur : installe Flutter (flutter.dev, Dart est inclus), vérifie avec `flutter doctor`, puis `flutter create mon_appli`, `cd mon_appli` et `flutter run`. Pour Dart seul : DartPad dans le navigateur, ou `dart create -t console bonjour` puis `dart run`."
            ),
            example: {
              code: `import 'package:flutter/material.dart';

void main() => runApp(const MonAppli());

class MonAppli extends StatelessWidget {
  const MonAppli({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('CodeQuest')),
        body: const Center(child: Text('Bonjour Flutter')),
      ),
    );
  }
}`,
              notes: [
                { line: 3, text: "`runApp` installe le widget racine de l'appli. `=>` écrit une fonction d'une seule expression." },
                { line: 5, text: "Un widget sans état : il ne fait que décrire l'interface à partir de ses paramètres." },
                { line: 9, text: "`build` renvoie l'arbre de widgets ; Flutter l'appelle chaque fois qu'il faut redessiner." },
                { line: 11, text: "`Scaffold` fournit la structure d'un écran : une barre en haut (`appBar`) et un contenu (`body`)." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Dans cet arbre de widgets, quel est le **parent direct** du bouton ?",
                code: `Scaffold(
  body: Center(
    child: Column(
      children: [
        Text('Score : 3'),
        ElevatedButton(onPressed: ajouter, child: Text('+1')),
      ],
    ),
  ),
)`,
                choices: [
                  "`Center`",
                  "`Column`",
                  "`Text('Score : 3')`",
                  "`Scaffold`"
                ],
                answer: 1,
                why: {
                  0: "`Center` a un seul enfant direct, `Column` ; le bouton est un niveau plus bas.",
                  2: "`Text('Score : 3')` est un **frère** du bouton : ils sont tous les deux dans la liste `children` de `Column`.",
                  3: "`Scaffold` est la racine de cet écran, trois niveaux au-dessus du bouton."
                },
                hint: "Suis l'imbrication : `child` désigne un enfant unique, `children` une liste d'enfants.",
                explain: "`Column` aligne verticalement ses `children` : le texte puis le bouton. L'interface se lit comme un arbre : `Scaffold`, puis `Center`, puis `Column`, puis ses deux enfants. On compose de petits widgets plutôt que de placer des éléments à des coordonnées."
              },
              {
                type: 'fill',
                prompt: "Complète ce programme Dart pour qu'il gère les valeurs `null` sans erreur de compilation.",
                code: `String salutation(String? prenom) {
  return 'Bonjour \${prenom ___ 'invité'}';
}

int longueur(String? texte) {
  if (texte ___ null) return 0;
  return texte.length;
}

void main() {
  ___ nom = 'Ada';
  print(salutation(null));
  print(longueur(nom));
}`,
                blanks: [
                  { answers: ['??'], options: ['??', '||', '?.'], why: { '||': "`||` est le « ou » logique entre booléens ; la valeur par défaut d'une expression nullable s'écrit `??`.", '?.': "`?.` sert à accéder à un membre (`prenom?.length`), pas à fournir une valeur de remplacement." } },
                  { answers: ['=='], options: ['==', '!=', 'is'], why: { '!=': "La logique serait inversée : on renverrait 0 pour un vrai texte, et on lirait `.length` sur `null` (refusé par le compilateur).", 'is': "`is` teste un type (`texte is String`) ; `null` n'est pas un nom de type." } },
                  { answers: ['final'], options: ['final', 'let', 'val'], why: { 'let': "`let` est le mot-clé de JavaScript ; en Dart, c'est `var` ou `final`.", 'val': "`val` vient de Kotlin ; Dart utilise `final` pour une variable affectée une seule fois." } }
                ],
                output: `Bonjour invité
3`,
                hint: "Valeur par défaut, test de `null`, variable affectée une seule fois.",
                explain: "`??` fournit une valeur quand `prenom` est `null`. Après `if (texte == null) return 0;`, Dart sait que `texte` n'est plus `null` (on parle de promotion de type) et autorise `texte.length`. `final` déclare une variable qu'on n'affectera plus, comme `const` en JavaScript."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Ce code ne compile pas : Dart refuse d'appeler `toUpperCase` sur une valeur qui peut être `null`. Clique sur la ligne fautive, puis choisis la correction qui marche aussi pour Linus.",
              code: `class Profil {
  final String nom;
  final String? ville;
  Profil(this.nom, this.ville);
}

String presentation(Profil p) {
  return '\${p.nom} habite à \${p.ville.toUpperCase()}';
}

void main() {
  print(presentation(Profil('Ada', 'Londres')));
  print(presentation(Profil('Linus', null)));
}`,
              bugLine: 8,
              why: "`ville` est de type `String?` : elle peut valoir `null` (c'est le cas pour Linus), et appeler une méthode sur `null` planterait. Le compilateur l'interdit.",
              fixes: [
                "  return '\${p.nom} habite à \${p.ville?.toUpperCase() ?? 'une ville inconnue'}';",
                "  return '\${p.nom} habite à \${p.ville!.toUpperCase()}';",
                "  return '\${p.nom} habite à \${p.ville.toUpperCase() ?? ''}';"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Le `!` affirme que `ville` n'est pas `null` : ça compile, mais l'appel pour Linus plante à l'exécution.",
                2: "L'appel `p.ville.toUpperCase()` est toujours refusé : le `??` placé après arrive trop tard."
              },
              output: `Ada habite à LONDRES
Linus habite à une ville inconnue`,
              hint: "Il faut à la fois un accès prudent et une valeur de remplacement.",
              explain: "`p.ville?.toUpperCase()` vaut `null` si `ville` est `null`, au lieu de planter ; `?? 'une ville inconnue'` remplace alors ce `null`. Comme le `!` de TypeScript, celui de Dart fait taire le compilateur sans rien vérifier : à réserver aux cas où tu es certain que la valeur existe."
            },
            recap: [
              "Flutter : un seul code Dart pour Android, iOS, web et bureau, avec le hot reload.",
              "Tout est widget ; l'écran est un arbre (`child`, `children`) que `build` décrit.",
              "`String` ne vaut jamais `null`, `String?` peut ; `??`, `?.` et les tests gèrent le cas.",
              "`flutter create`, `flutter run` ; DartPad pour essayer Dart seul."
            ],
            check: {
              type: 'predict',
              prompt: "Qu'affiche ce programme Dart ?",
              code: `void main() {
  final notes = <int>[12, 15, 9];
  notes.add(18);
  int? bonus = notes.contains(20) ? 5 : null;
  final total = notes.reduce((a, b) => a + b) + (bonus ?? 2);
  print('\${notes.length} notes, total $total');
  print(notes.where((n) => n >= 12).toList());
}`,
              answer: `4 notes, total 56
[12, 15, 18]`,
              mistakes: [
                { answer: `4 notes, total 54
[12, 15, 18]`, why: "La liste ne contient pas 20 : `bonus` vaut `null`, et `bonus ?? 2` donne 2, qui s'ajoute à la somme." },
                { answer: `3 notes, total 38
[12, 15]`, why: "`final` empêche de réaffecter `notes`, pas de modifier son contenu : `add(18)` fonctionne." }
              ],
              hint: "`final` fige la variable, pas le contenu de la liste. Puis calcule `bonus` avant la somme.",
              explain: "La liste passe à 4 notes (12, 15, 9, 18), de somme 54. `bonus` est `null` car 20 est absent, donc `bonus ?? 2` vaut 2 : total 56. `where` garde les notes d'au moins 12, et `print` affiche une liste entre crochets, comme Python."
            }
          }
        ]
      }
    ]
  });
})();
