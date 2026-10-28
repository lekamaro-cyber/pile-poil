// CodeQuest — parcours « Autres langages », fichier 1 : comparer les langages, C, C++.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  // ---------------------------------------------------------------- autres.c1
  var c1 = {
    id: 'autres.c1',
    title: 'Comparer les langages',
    units: [
      {
        id: 'autres.u1',
        title: 'Familles de langages',
        summary: "Compilé ou interprété, typage statique ou dynamique, gestion de la mémoire : trois axes pour situer n'importe quel langage.",
        requires: ['py.u5'],
        lessons: [
          {
            id: 'autres.u1.l1',
            title: 'Trois questions pour situer un langage',
            minutes: 7,
            lang: 'c',
            objective: "Tu sais situer un langage selon trois axes (compilé ou interprété, typage statique ou dynamique, gestion de la mémoire) et en déduire ses forces et ses limites.",
            explain: P(
              "Trois questions suffisent pour situer un langage :",
              "- **Compilé ou interprété ?** Un compilateur traduit tout le programme en code machine avant l'exécution (C, C++, Rust, Go) : c'est rapide, mais il faut recompiler pour chaque système. Python et Bash sont lus par un interpréteur. Java, C# et Dart passent par un intermédiaire : du **bytecode** exécuté par une machine virtuelle, qui compile à la volée.\n- **Typage statique ou dynamique ?** Statique : le type de chaque variable est connu et vérifié **avant** l'exécution (C, Java, TypeScript). Dynamique : il est vérifié pendant l'exécution (Python, PHP, JavaScript). Le statique attrape des erreurs plus tôt, le dynamique va plus vite à écrire.\n- **Qui libère la mémoire ?** Le programmeur (C, C++ : rapide mais source de plantages), un ramasse-miettes (Java, C#, Python, JS, Dart) ou des règles vérifiées par le compilateur (Rust).",
              "Repères :",
              "- C, C++ : compilés, statiques, mémoire manuelle (systèmes, moteurs de jeux et d'IA)\n- Java, C# : machine virtuelle, statiques, ramasse-miettes (entreprise, Android, Unity)\n- Python : interprété, dynamique (IA, data, scripts)\n- PHP : interprété, dynamique (sites web)\n- TypeScript : compilé en JavaScript, statique (web)\n- Dart : machine virtuelle en développement, compilé pour la production (Flutter)\n- Bash : interprété, sans types (automatisation)"
            ),
            example: {
              code: `#include <stdio.h>

/* En Python : def moyenne(a, b): return (a + b) / 2   donne 3.5 */
double moyenne(int a, int b) {
    return (a + b) / 2;      /* int / int : division entière */
}

int main(void) {
    printf("%.1f\\n", moyenne(3, 4));
    printf("%.1f\\n", (3 + 4) / 2.0);
    return 0;
}`,
              output: `3.0
3.5`,
              notes: [
                { line: 4, text: "Typage statique : les paramètres et le résultat ont un type déclaré, vérifié par le compilateur." },
                { line: 5, text: "`a + b` vaut 7, un `int` ; divisé par l'`int` 2, le résultat est l'entier 3, ensuite converti en 3.0. Python, lui, donnerait 3.5." },
                { line: 10, text: "Avec `2.0` (un `double`), la division devient réelle : 3.5." },
                { line: 9, text: "Pour l'essayer : `gcc moyenne.c -o moyenne` puis `./moyenne` (le chapitre C détaille l'installation)." }
              ]
            },
            exercises: [
              {
                type: 'order',
                lang: 'text',
                prompt: "Remets dans l'ordre les étapes qui mènent du code source C à son exécution.",
                lines: [
                  "Tu écris le code source dans moyenne.c",
                  "Tu lances gcc moyenne.c -o moyenne",
                  "Le compilateur vérifie les types et signale les erreurs",
                  "Il traduit le programme en code machine dans le fichier moyenne",
                  "Tu lances ./moyenne : le processeur exécute ce code directement"
                ],
                hint: "Les erreurs de type sont détectées avant que le moindre fichier exécutable existe.",
                explain: "Avec un langage compilé, la vérification et la traduction ont lieu une seule fois, avant l'exécution. Le fichier produit contient du code machine pour ce processeur et ce système : pour un autre système, on recompile. Avec Python, ces étapes n'existent pas : l'interpréteur lit le source à chaque lancement."
              },
              {
                type: 'predict',
                prompt: "En C, une variable garde le type déclaré, quoi qu'on y range. Qu'affiche ce programme ?",
                code: `#include <stdio.h>

int main(void) {
    int note = 15.75;          /* la variable reste un int */
    double moyenne = 31 / 2;
    printf("%d\\n", note);
    printf("%.1f\\n", moyenne);
    printf("%.1f\\n", 31 / 2.0);
    return 0;
}`,
                answer: `15
15.0
15.5`,
                mistakes: [
                  { answer: `15.75
15.5
15.5`, why: "C'est le raisonnement Python. En C, `int note` ne peut contenir qu'un entier : 15.75 est tronqué à 15. Et `31 / 2` est une division entre deux `int`, calculée avant d'être rangée dans le `double`." },
                  { answer: `16
15.0
15.5`, why: "La conversion d'un réel en entier tronque (elle coupe la partie décimale), elle n'arrondit pas." }
                ],
                hint: "Le type de la variable décide de ce qu'elle peut contenir, et le type des opérandes décide du type de division.",
                explain: "Le typage statique a des conséquences concrètes : `note` est un `int`, donc 15. `31 / 2` vaut 15 (division entière) avant d'être converti en 15.0. Seule `31 / 2.0` fait une division réelle. En Python, `/` donne toujours un réel et `//` la division entière : en C, c'est le type des opérandes qui choisit."
              }
            ],
            challenge: {
              type: 'logic',
              prompt: "Dans leur usage habituel, combien de ces langages sont compilés en **code machine natif avant l'exécution** : C, Python, Java, C++, PHP, Bash, Rust ?",
              answer: '3',
              accept: ['trois'],
              mistakes: [
                { answer: '4', why: "Java est compilé, mais en bytecode, pas en code machine : c'est la machine virtuelle Java qui l'exécute (et le compile à la volée)." },
                { answer: '2', why: "Rust aussi est compilé en code machine natif, comme C et C++." }
              ],
              hint: "Distingue « compilé en code machine », « compilé en bytecode pour une machine virtuelle » et « interprété ».",
              explain: "C, C++ et Rust produisent un exécutable natif. Java produit du bytecode pour la JVM ; Python, PHP et Bash sont interprétés (Python et PHP compilent en bytecode interne, mais à l'exécution). Ce classement explique les écarts de vitesse au démarrage et de portabilité."
            },
            recap: [
              "Compilé (C, C++, Rust) : rapide, mais recompilé pour chaque système ; interprété (Python, Bash) : souple, plus lent.",
              "Java, C#, Dart : bytecode et machine virtuelle, entre les deux.",
              "Typage statique : erreurs trouvées avant l'exécution ; dynamique : pendant.",
              "Mémoire : manuelle (C, C++), ramasse-miettes (Java, Python…), vérifiée par le compilateur (Rust).",
              "Pour essayer l'exemple : `gcc moyenne.c -o moyenne` puis `./moyenne`."
            ],
            check: {
              type: 'qcm',
              prompt: "Quelle description de **Java** est exacte ?",
              choices: [
                "Interprété ligne à ligne, typage dynamique, mémoire gérée à la main",
                "Compilé en code machine natif, typage dynamique, ramasse-miettes",
                "Compilé en bytecode exécuté par une machine virtuelle, typage statique, ramasse-miettes",
                "Compilé en JavaScript, typage statique, mémoire gérée à la main"
              ],
              answer: 2,
              why: {
                0: "Java est compilé (par `javac`) et statiquement typé ; c'est un ramasse-miettes qui libère la mémoire.",
                1: "Le compilateur Java produit du bytecode, pas du code machine natif. Et le typage de Java est statique.",
                3: "C'est un mélange : TypeScript se compile en JavaScript, et aucun des deux ne gère la mémoire à la main."
              },
              hint: "Pense aux trois axes un par un : forme compilée, moment où les types sont vérifiés, qui libère la mémoire.",
              explain: "`javac` vérifie les types et produit du bytecode (`.class`) ; la JVM l'exécute sur n'importe quel système, en compilant à la volée les parties souvent utilisées. Un ramasse-miettes libère la mémoire. C'est le même modèle que C# avec .NET."
            }
          }
        ]
      },
      {
        id: 'autres.u2',
        title: 'Choisir un langage pour un projet',
        summary: "Choisir selon l'écosystème, la cible, la performance et l'équipe, pour l'IA, le web, le mobile, le système ou les scripts.",
        lessons: [
          {
            id: 'autres.u2.l1',
            title: 'Le bon outil pour le bon projet',
            minutes: 7,
            lang: 'python',
            objective: "Tu sais choisir un langage adapté à un projet (IA, web, mobile, système, scripts) en pesant l'écosystème, la cible, la performance et l'équipe.",
            explain: P(
              "Le « meilleur langage » n'existe pas : on choisit selon le projet. Les critères qui comptent vraiment :",
              "- l'**écosystème** : bibliothèques, outils, documentation (l'IA, c'est d'abord PyTorch et Hugging Face, donc Python) ;\n- la **cible** : navigateur, téléphone, serveur, microcontrôleur ;\n- la **performance** nécessaire, et où elle se joue (souvent dans une bibliothèque déjà écrite en C++) ;\n- l'**équipe** : ce qu'elle connaît, ce qu'on trouve à recruter.",
              "Repères :",
              "- **IA et data** : Python ; C++ et CUDA sous le capot pour la vitesse.\n- **Web** : TypeScript côté navigateur ; côté serveur, Node avec TypeScript, Python, PHP, Java, C# ou Go.\n- **Mobile** : Kotlin (Android), Swift (iOS), ou un seul code pour les deux avec Flutter (Dart) ou React Native.\n- **Système, embarqué** : C, C++, Rust.\n- **Jeux** : C# (Unity), C++ (Unreal).\n- **Scripts** : Bash sous Linux, PowerShell sous Windows, Python partout.",
              "Pour comparer honnêtement, une **grille pondérée** aide : chaque critère a un poids, chaque langage une note."
            ),
            example: {
              code: `poids = {"ecosysteme": 3, "performance": 1, "equipe": 2}

candidats = {
    "Python": {"ecosysteme": 5, "performance": 2, "equipe": 5},
    "C++":    {"ecosysteme": 4, "performance": 5, "equipe": 1},
    "Julia":  {"ecosysteme": 2, "performance": 4, "equipe": 1},
}

for nom, notes in candidats.items():
    score = sum(poids[c] * notes[c] for c in poids)
    print(nom, score)`,
              output: `Python 27
C++ 19
Julia 12`,
              notes: [
                { line: 1, text: "Les poids traduisent le projet : ici un prototype d'IA, où l'écosystème compte trois fois plus que la vitesse brute." },
                { line: 5, text: "C++ gagne en performance, mais l'équipe ne le connaît pas : ça pèse." },
                { line: 10, text: "Score = somme des notes multipliées par leur poids." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Une start-up doit sortir une appli sur iOS **et** Android en trois mois, avec deux développeurs qui connaissent déjà JavaScript. Quel choix est le plus raisonnable ?",
                choices: [
                  "Deux applis natives : Swift pour iOS et Kotlin pour Android",
                  "Un seul code avec React Native (JavaScript ou TypeScript), ou Flutter (Dart)",
                  "C++, pour avoir les meilleures performances",
                  "PHP, puisqu'il sert déjà à faire des sites web"
                ],
                answer: 1,
                why: {
                  0: "Deux langages nouveaux et deux applis à écrire et maintenir : intenable à deux en trois mois.",
                  2: "Les performances ne sont pas le problème d'une appli classique, et écrire une interface mobile en C++ est long et rare.",
                  3: "PHP s'exécute sur un serveur ; il ne produit pas d'appli installée sur un téléphone."
                },
                hint: "Les contraintes fortes : deux plateformes, peu de temps, une équipe qui connaît JavaScript.",
                explain: "Un framework multiplateforme écrit un seul code pour iOS et Android. React Native réutilise directement les compétences JavaScript de l'équipe ; Flutter est l'autre choix courant. Le natif reste pertinent quand on a besoin de chaque détail de la plateforme et d'une équipe par système."
              },
              {
                type: 'predict',
                prompt: "Grille pondérée pour une appli mobile. Qu'affiche ce programme ?",
                code: `poids = {"multiplateforme": 3, "performance": 1}
notes = {
    "Kotlin": {"multiplateforme": 1, "performance": 5},
    "Flutter": {"multiplateforme": 5, "performance": 4},
}
scores = {nom: sum(poids[c] * n[c] for c in poids) for nom, n in notes.items()}
print(scores)
print(max(scores, key=scores.get))`,
                answer: `{'Kotlin': 8, 'Flutter': 19}
Flutter`,
                mistakes: [
                  { answer: `{'Kotlin': 6, 'Flutter': 9}
Flutter`, why: "Ce sont les sommes des notes, sans les poids. Kotlin : 3 × 1 + 1 × 5 = 8 ; Flutter : 3 × 5 + 1 × 4 = 19." },
                  { answer: `{'Kotlin': 8, 'Flutter': 19}
19`, why: "`max` sur un dictionnaire parcourt les clés : avec `key=scores.get`, il compare les scores mais renvoie la clé." }
                ],
                hint: "Calcule chaque score à la main : poids × note, pour chaque critère, puis additionne.",
                explain: "Kotlin obtient 8 et Flutter 19 : quand le multiplateforme pèse lourd, Flutter l'emporte malgré une performance un peu moindre. `max(scores, key=scores.get)` renvoie la clé dont la valeur est la plus grande. Change les poids, et le résultat peut s'inverser : la grille rend les priorités explicites."
              }
            ],
            challenge: {
              type: 'fill',
              prompt: "Certains critères ne se compensent pas : si le projet doit tourner dans un navigateur, un langage qui ne le permet pas est éliminé, quel que soit son score. Complète pour garder seulement les langages qui couvrent **toutes** les contraintes, puis trouver le meilleur.",
              code: `contraintes = {"navigateur"}
langages = {
    "TypeScript": {"cibles": {"navigateur", "serveur"}, "score": 8},
    "Python": {"cibles": {"serveur", "data"}, "score": 9},
    "Dart": {"cibles": {"mobile", "navigateur"}, "score": 6},
}
possibles = {nom: info["score"] for nom, info in langages.items() if contraintes.___(info["cibles"])}
print(sorted(possibles))
print(max(possibles, key=possibles.___))`,
              blanks: [
                { answers: ['issubset'], options: ['issubset', 'union', 'add'], why: { 'union': "`union` renvoie un nouvel ensemble, toujours non vide ici, donc toujours vrai : aucun langage ne serait éliminé.", 'add': "`add` modifie l'ensemble et renvoie `None` (faux) : tous les langages seraient éliminés." } },
                { answers: ['get'], options: ['get', 'values', 'items'], why: { 'values': "`key` attend une fonction qui, pour une clé, donne la valeur à comparer : c'est `possibles.get`.", 'items': "`possibles.items` ne prend pas d'argument : `max` lèverait une erreur." } }
              ],
              output: `['Dart', 'TypeScript']
TypeScript`,
              hint: "« Toutes les contraintes sont dans les cibles » se dit : l'ensemble des contraintes est inclus dans celui des cibles.",
              explain: "`contraintes.issubset(cibles)` élimine d'abord Python, qui ne tourne pas dans un navigateur, malgré le meilleur score. Parmi les langages restants, TypeScript l'emporte. Dans une vraie décision, on sépare ainsi les contraintes éliminatoires des critères à pondérer."
            },
            recap: [
              "Critères : écosystème, cible, performance réellement nécessaire, équipe.",
              "IA : Python ; web : TypeScript ; mobile : Kotlin, Swift ou Flutter ; système : C, C++, Rust.",
              "Une grille pondérée rend les priorités explicites.",
              "Les contraintes éliminatoires passent avant le score."
            ],
            check: {
              type: 'logic',
              prompt: "Tu écris le logiciel d'un capteur connecté : 8 Ko de mémoire vive, pas de système d'exploitation, des délais stricts à la milliseconde. Parmi Python, Java, C et PHP, quel langage choisis-tu ? (Un mot.)",
              answer: 'C',
              accept: ['c', 'le C', 'langage C'],
              mistakes: [
                { answer: 'Python', why: "Même MicroPython demande plus de mémoire que ça et n'offre pas de garantie de délai : son ramasse-miettes peut se déclencher à tout moment." },
                { answer: 'Java', why: "Une machine virtuelle Java et son ramasse-miettes ne tiennent pas dans 8 Ko, et les pauses du ramasse-miettes cassent les délais stricts." },
                { answer: 'PHP', why: "PHP est fait pour générer des pages web sur un serveur ; il ne tourne pas sur un microcontrôleur." }
              ],
              hint: "Mémoire minuscule, pas de système, délais garantis : il faut un langage compilé, sans machine virtuelle ni ramasse-miettes.",
              explain: "C compile en code machine compact, sans machine virtuelle ni ramasse-miettes : chaque octet et chaque cycle sont sous ton contrôle. C'est le langage historique de l'embarqué ; C++ et Rust sont les alternatives modernes."
            }
          }
        ]
      }
    ]
  };

  // ---------------------------------------------------------------- autres.c2
  var c2 = {
    id: 'autres.c2',
    title: 'C',
    units: [
      {
        id: 'autres.u3',
        title: 'Bases du C',
        summary: "Compiler avec gcc, déclarer des variables typées, afficher avec printf et écrire des fonctions.",
        requires: ['py.u9'],
        lessons: [
          {
            id: 'autres.u3.l1',
            title: 'Premier programme en C',
            minutes: 8,
            lang: 'c',
            objective: "Tu sais écrire, compiler et lancer un petit programme C avec des variables typées, `printf` et des fonctions.",
            explain: P(
              "Le **C** (1972) est le langage des systèmes : noyaux Linux et Windows, microcontrôleurs, et même l'interpréteur Python officiel (CPython), écrit en C. **Forces** : vitesse, contrôle total de la mémoire, disponible partout. **Limites** : peu de garde-fous (une erreur de mémoire fait planter ou ouvre une faille), pas de listes ni de chaînes pratiques, beaucoup de code pour peu de choses.",
              "Par rapport à Python :",
              "- chaque variable a un **type fixe** déclaré : `int`, `double`, `char` (un caractère) ;\n- les blocs sont entre `{ }`, chaque instruction finit par `;` ;\n- une fonction déclare le type de ses paramètres et de son résultat ; le programme démarre dans `main`, qui renvoie 0 si tout va bien ;\n- `printf` affiche avec des formats : `%d` entier, `%f` réel (`%.2f` : deux décimales), `%c` caractère, `%s` texte, `\\n` retour à la ligne.",
              "À essayer sur ton ordinateur : sous Windows, installe WSL (`wsl --install`) puis `sudo apt install gcc` ; sous macOS, `xcode-select --install`. Compile avec `gcc -Wall bonjour.c -o bonjour`, puis lance `./bonjour`."
            ),
            example: {
              code: `#include <stdio.h>

double prix_ttc(double ht, double taux) {
    return ht * (1 + taux / 100);
}

int main(void) {
    int quantite = 3;
    char categorie = 'B';
    double total = prix_ttc(12.5, 20) * quantite;
    printf("Catégorie %c : %d articles\\n", categorie, quantite);
    printf("Total : %.2f euros\\n", total);
    return 0;
}`,
              output: `Catégorie B : 3 articles
Total : 45.00 euros`,
              notes: [
                { line: 1, text: "`#include` importe les déclarations de la bibliothèque d'entrées-sorties (comme un `import`)." },
                { line: 3, text: "Type du résultat, nom, puis paramètres typés. Python : `def prix_ttc(ht, taux):`." },
                { line: 9, text: "Un `char` s'écrit entre apostrophes ; les guillemets doubles sont réservés aux chaînes." },
                { line: 11, text: "Chaque `%` du format est remplacé, dans l'ordre, par un argument du bon type." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `#include <stdio.h>

int carre(int x) {
    return x * x;
}

int main(void) {
    int n = 7;
    printf("%d\\n", carre(n) / 2);
    printf("%.1f\\n", carre(n) / 2.0);
    printf("%c%c\\n", 'O', 'K');
    return 0;
}`,
                answer: `24
24.5
OK`,
                mistakes: [
                  { answer: `24.5
24.5
OK`, why: "`carre(n)` est un `int` (49) et 2 aussi : la division est entière, 24. Il faut un réel (`2.0`) pour obtenir 24.5." },
                  { answer: `24
24.5
O K`, why: "Le format `%c%c` ne contient pas d'espace : les deux caractères sont collés." }
                ],
                hint: "Le type des deux opérandes décide du type de la division.",
                explain: "49 / 2 entre deux entiers donne 24 (la partie décimale est perdue) ; 49 / 2.0 donne 24.5. Le format `%c%c` colle deux caractères. Le format doit toujours correspondre au type de l'argument : `%d` pour un `int`, `%f` pour un `double`."
              },
              {
                type: 'fill',
                prompt: "Complète le type de retour de `moyenne` et les formats de `printf`.",
                code: `#include <stdio.h>

___ moyenne(int a, int b) {
    return (a + b) / 2.0;
}

int main(void) {
    char nom[] = "Ada";
    printf("%___ a %d ans\\n", nom, 36);
    printf("Moyenne : %___\\n", moyenne(12, 15));
    return 0;
}`,
                blanks: [
                  { answers: ['double'], options: ['double', 'int', 'void'], why: { 'int': "La fonction calcule 13.5 ; avec `int`, le résultat serait tronqué à 13.", 'void': "`void` signifie « ne renvoie rien », or la fonction renvoie une valeur." } },
                  { answers: ['s'], options: ['s', 'c', 'd'], why: { 'c': "`%c` affiche un seul caractère ; `nom` est une chaîne.", 'd': "`%d` attend un entier ; lui donner une chaîne affiche n'importe quoi." } },
                  { answers: ['.1f'], options: ['.1f', 'd', 's'], why: { 'd': "`%d` attend un `int` ; avec un `double`, le comportement est indéfini (le plus souvent une valeur absurde).", 's': "`%s` attend une chaîne : le programme planterait probablement." } }
                ],
                output: `Ada a 36 ans
Moyenne : 13.5`,
                hint: "En C, une chaîne est un tableau de `char` (`char nom[] = \"Ada\";`). Chaque format correspond à un type.",
                explain: "`double` garde la partie décimale du calcul. `%s` affiche une chaîne, `%.1f` un réel avec une décimale. Le compilateur ne vérifie pas toujours la correspondance entre format et argument : avec `-Wall`, gcc avertit dans les cas simples, d'où l'intérêt de toujours compiler avec cette option."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Le stock vaut 0, mais le programme affiche « En stock : 0 ». Clique sur la ligne fautive.",
              code: `#include <stdio.h>

int main(void) {
    int stock = 0;
    if (stock = 0) {
        printf("Rupture de stock\\n");
    } else {
        printf("En stock : %d\\n", stock);
    }
    return 0;
}`,
              bugLine: 5,
              why: "`stock = 0` est une **affectation**, pas une comparaison : elle range 0 dans `stock` et vaut 0, c'est-à-dire faux. On passe donc toujours dans le `else`.",
              fixes: [
                "    if (stock == 0) {",
                "    if (stock === 0) {",
                "    if (stock != 0) {"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`===` n'existe pas en C (c'est du JavaScript) : erreur de compilation.",
                2: "Ça inverse la logique : avec un stock nul, on afficherait encore « En stock »."
              },
              output: `Rupture de stock`,
              hint: "En C, une affectation est aussi une expression qui a une valeur. Laquelle ici ?",
              explain: "En C, `=` affecte et `==` compare, et une affectation peut se glisser dans un `if` sans erreur. Python l'interdit justement (`if x = 0:` est une erreur de syntaxe). `gcc -Wall` signale ce piège avec un avertissement : lis toujours les avertissements du compilateur."
            },
            recap: [
              "Types fixes déclarés : `int`, `double`, `char`, chaînes en tableaux de `char`.",
              "`{ }` pour les blocs, `;` à chaque instruction, le programme démarre dans `main`.",
              "`printf` : `%d`, `%f`, `%.2f`, `%c`, `%s`, et `\\n` pour aller à la ligne.",
              "`gcc -Wall fichier.c -o prog` puis `./prog` ; `=` affecte, `==` compare."
            ],
            check: {
              type: 'order',
              prompt: "Remets ce programme C dans l'ordre pour qu'il affiche `25`.",
              lines: [
                "#include <stdio.h>",
                "void afficher_carre(int x) { printf(\"%d\\n\", x * x); }",
                "int main(void) {",
                "    afficher_carre(5);",
                "    return 0;",
                "}"
              ],
              output: `25`,
              hint: "En C, une fonction doit être déclarée avant d'être utilisée, et `printf` vient de `stdio.h`.",
              explain: "L'`#include` vient en premier car `afficher_carre` utilise `printf`. La fonction est définie avant `main`, qui l'appelle (le compilateur lit le fichier de haut en bas). `return 0;` termine `main` en signalant que tout s'est bien passé."
            }
          }
        ]
      },
      {
        id: 'autres.u4',
        title: 'Pointeurs et mémoire',
        summary: "Comprendre les adresses, les pointeurs, les tableaux et l'allocation dynamique avec malloc et free.",
        lessons: [
          {
            id: 'autres.u4.l1',
            title: 'Adresses, pointeurs et malloc',
            minutes: 8,
            lang: 'c',
            objective: "Tu sais lire et utiliser un pointeur (`&`, `*`), parcourir un tableau, et allouer puis libérer de la mémoire avec `malloc` et `free`.",
            explain: P(
              "Chaque variable vit à une **adresse** en mémoire. Un **pointeur** est une variable qui contient une adresse :",
              "- `int *p = &x;` : `&x` donne l'adresse de `x`, et `p` la garde ;\n- `*p` lit ou modifie la valeur rangée à cette adresse : `*p = 10;` change `x`.",
              "En C, les arguments sont **copiés** : pour qu'une fonction modifie une variable, on lui passe son adresse. Python fait quelque chose de proche, sans le montrer, quand tu passes une liste à une fonction.",
              "Un **tableau** `int t[5]` est une suite de cases contiguës ; `t` se comporte comme l'adresse de la première case, et `t[i]` vaut `*(t + i)`. C ne vérifie pas les bornes : `t[5]` lit n'importe quoi.",
              "Quand la taille n'est connue qu'à l'exécution, on réserve la mémoire avec `malloc(n * sizeof(int))` (de `stdlib.h`), on vérifie que le résultat n'est pas `NULL`, puis on la rend avec `free`. Oublier `free` crée une **fuite** ; utiliser la mémoire après `free` est un bug grave. C'est le travail que le ramasse-miettes de Python fait pour toi.",
              "À essayer : `gcc -Wall -fsanitize=address prog.c -o prog` ajoute un détecteur de débordements et de fuites."
            ),
            example: {
              code: `#include <stdio.h>
#include <stdlib.h>

void doubler(int *valeur) { *valeur = *valeur * 2; }

int main(void) {
    int x = 21;
    doubler(&x);
    int *t = malloc(3 * sizeof(int));
    if (t == NULL) return 1;
    for (int i = 0; i < 3; i++) t[i] = i * 10;
    printf("%d %d\\n", x, t[2]);
    free(t);
    return 0;
}`,
              output: `42 20`,
              notes: [
                { line: 4, text: "La fonction reçoit une adresse (`int *`) ; `*valeur` désigne la variable de l'appelant." },
                { line: 8, text: "`&x` passe l'adresse de `x` : après l'appel, `x` vaut 42." },
                { line: 9, text: "`malloc` réserve 3 entiers (`sizeof(int)` octets chacun) et renvoie leur adresse, ou `NULL` en cas d'échec." },
                { line: 13, text: "Chaque `malloc` doit avoir son `free`, une seule fois." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `#include <stdio.h>

int main(void) {
    int a = 5;
    int *p = &a;
    *p = *p + 1;
    int b = *p * 2;
    p = &b;
    *p = 0;
    printf("%d %d\\n", a, b);
    return 0;
}`,
                answer: `6 0`,
                mistakes: [
                  { answer: `5 12`, why: "`*p = *p + 1` modifie la valeur à l'adresse de `a` : c'est bien `a` qui passe à 6." },
                  { answer: `0 12`, why: "Après `p = &b;`, le pointeur désigne `b` : `*p = 0` met `b` à 0 et ne touche plus à `a`." },
                  { answer: `6 12`, why: "La ligne `*p = 0;` s'exécute après `p = &b;` : elle remet `b` à 0." }
                ],
                hint: "Suis deux choses à chaque ligne : la valeur de chaque variable, et la variable que désigne `p`.",
                explain: "`p` désigne d'abord `a`, qui passe à 6 ; `b` vaut alors 12. Puis `p` change de cible et désigne `b`, que `*p = 0` remet à 0. Un pointeur est une variable comme une autre : on peut le faire pointer ailleurs."
              },
              {
                type: 'bug',
                prompt: "Ce programme devrait échanger `x` et `y` et afficher `2 1`, mais il plante. Clique sur la ligne fautive.",
                code: `#include <stdio.h>

void echanger(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 1, y = 2;
    echanger(x, y);
    printf("%d %d\\n", x, y);
    return 0;
}`,
                bugLine: 11,
                why: "`echanger` attend des adresses (`int *`), mais reçoit les valeurs 1 et 2. Elle les prend pour des adresses mémoire et écrit n'importe où : plantage. gcc l'avertit d'ailleurs à la compilation.",
                fixes: [
                  "    echanger(&x, &y);",
                  "    echanger(*x, *y);",
                  "    echanger(&x, y);"
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "`*x` signifie « valeur à l'adresse contenue dans `x` », mais `x` est un `int`, pas un pointeur : erreur de compilation.",
                  2: "Le second argument est toujours une valeur et non une adresse : même problème pour `y`."
                },
                output: `2 1`,
                hint: "Regarde le type des paramètres de `echanger`, puis ce que reçoit l'appel.",
                explain: "Pour qu'une fonction modifie des variables de l'appelant, on lui passe leurs adresses avec `&`. Dans `echanger`, `*a` et `*b` désignent alors `x` et `y`. Sans pointeurs, la fonction ne travaillerait que sur des copies."
              }
            ],
            challenge: {
              type: 'logic',
              prompt: "Que vaut `resultat` à la fin de ce code ?",
              code: `int t[5] = {10, 20, 30, 40, 50};
int *p = t + 1;
int resultat = *(p + 2) + p[0];`,
              answer: '60',
              mistakes: [
                { answer: '40', why: "`p` ne pointe pas sur `t[0]` mais sur `t[1]` (`t + 1`). Les décalages se comptent à partir de là." },
                { answer: '50', why: "`p + 2` désigne `t[3]` (1 + 2), pas `t[2]`. Et `p[0]` est `t[1]`, soit 20 : 40 + 20 = 60." }
              ],
              hint: "`p` désigne `t[1]`. Alors `p + 2` désigne `t[1 + 2]`, et `p[0]` vaut `*(p + 0)`.",
              explain: "`p` pointe sur `t[1]` (20). `*(p + 2)` lit `t[3]` (40) et `p[0]` lit `t[1]` (20) : 60. En C, `p[i]` n'est qu'une écriture de `*(p + i)`, et ajouter 1 à un pointeur d'`int` avance d'un `int` entier, pas d'un octet."
            },
            recap: [
              "`&x` : adresse de `x` ; `int *p` : pointeur ; `*p` : valeur pointée.",
              "Passer une adresse permet à une fonction de modifier la variable de l'appelant.",
              "`t[i]` vaut `*(t + i)`, et C ne vérifie pas les bornes.",
              "`malloc`, test de `NULL`, puis `free` une fois : sinon fuite ou plantage."
            ],
            check: {
              type: 'fill',
              prompt: "Complète ce programme qui réserve un tableau de `n` entiers, le remplit, affiche la dernière case puis libère la mémoire.",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 4;
    int *carres = ___(n * sizeof(int));
    if (carres == ___) return 1;
    for (int i = 0; i < n; i++) carres[i] = i * i;
    printf("%d\\n", carres[n - 1]);
    ___(carres);
    return 0;
}`,
              blanks: [
                { answers: ['malloc'], options: ['malloc', 'free', 'sizeof'], why: { 'free': "`free` rend de la mémoire ; ici il faut d'abord en réserver.", 'sizeof': "`sizeof` donne une taille en octets, il ne réserve rien." } },
                { answers: ['NULL', '0'], options: ['NULL', 'None', 'nullptr'], why: { 'None': "`None` est l'écriture Python ; en C, l'adresse nulle s'écrit `NULL`.", 'nullptr': "`nullptr` appartient à C++ (et aux versions très récentes de C) ; le C classique utilise `NULL`." } },
                { answers: ['free'], options: ['free', 'delete', 'del'], why: { 'delete': "`delete` est l'opérateur de C++, pas une fonction C.", 'del': "`del` est l'instruction Python ; en C, on rend la mémoire avec `free`." } }
              ],
              output: `9`,
              hint: "Réserver, vérifier, utiliser, libérer : quatre étapes, toujours dans cet ordre.",
              explain: "`malloc` réserve `n * sizeof(int)` octets et peut échouer (il renvoie alors `NULL`, à tester). Après usage, `free` rend la mémoire. Ce cycle manuel est la principale différence avec Python, où le ramasse-miettes libère tout seul ce qui n'est plus utilisé."
            }
          }
        ]
      }
    ]
  };

  // ---------------------------------------------------------------- autres.c3
  var c3 = {
    id: 'autres.c3',
    title: 'C++',
    units: [
      {
        id: 'autres.u5',
        title: 'Bases du C++',
        summary: "Écrire du C++ moderne avec iostream, std::string, std::vector, des références et des classes.",
        requires: ['autres.u3'],
        lessons: [
          {
            id: 'autres.u5.l1',
            title: 'Le C++ moderne',
            minutes: 8,
            lang: 'cpp',
            objective: "Tu sais écrire un programme C++ moderne avec `std::string`, `std::vector`, des références et une classe simple.",
            explain: P(
              "Le **C++** ajoute au C des classes, une bibliothèque standard riche et des abstractions **sans coût** à l'exécution. Il fait tourner les moteurs de jeux (Unreal), les navigateurs, la finance haute fréquence, et le cœur de PyTorch et TensorFlow. **Limites** : un langage immense, des messages d'erreur longs, et les mêmes dangers mémoire que le C si on l'écrit « à l'ancienne ».",
              "Le C++ moderne évite les pointeurs bruts :",
              "- `std::string` : du texte qui gère sa mémoire (`+` pour concaténer, `.size()`) ;\n- `std::vector<int>` : un tableau dynamique, comme une `list` Python mais d'un seul type (`push_back`, `size()`, `for (int x : v)`) ;\n- une **référence** `int& r = x;` est un autre nom pour `x`. Un paramètre `const std::vector<int>& v` évite une copie coûteuse ; `std::vector<int>& v` permet de modifier l'original ;\n- `std::cout << ... << '\\n'` affiche.",
              "Une **classe** regroupe données et méthodes, avec des parties `public` et `private`.",
              "À essayer sur ton ordinateur : `g++ -std=c++17 -Wall main.cpp -o main` puis `./main` (sous Windows : WSL, ou Visual Studio Community)."
            ),
            example: {
              code: `#include <iostream>
#include <string>
#include <vector>

class Compte {
public:
    Compte(std::string titulaire) : titulaire_(titulaire) {}
    void deposer(int montant) { solde_ += montant; }
    std::string resume() const { return titulaire_ + " : " + std::to_string(solde_); }
private:
    std::string titulaire_;
    int solde_ = 0;
};

int main() {
    std::vector<int> depots = {100, 250, 50};
    Compte c("Ada");
    for (int d : depots) c.deposer(d);
    std::cout << c.resume() << '\\n';
}`,
              output: `Ada : 400`,
              notes: [
                { line: 7, text: "Le constructeur initialise les attributs (liste après les deux-points). Python : `def __init__(self, titulaire):`." },
                { line: 9, text: "`const` promet que la méthode ne modifie pas l'objet ; `std::to_string` convertit l'entier en texte." },
                { line: 10, text: "Les attributs privés ne sont accessibles que par les méthodes de la classe." },
                { line: 18, text: "Boucle sur les éléments, comme `for d in depots:` en Python." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Pourquoi écrire `double moyenne(const std::vector<double>& notes)` plutôt que `double moyenne(std::vector<double> notes)` ?",
                choices: [
                  "Parce qu'on ne peut pas passer un vecteur par valeur en C++",
                  "Pour éviter de copier tout le vecteur, tout en garantissant que la fonction ne le modifie pas",
                  "Pour que la fonction puisse ajouter des notes au vecteur de l'appelant",
                  "C'est obligatoire dès qu'une fonction renvoie un `double`"
                ],
                answer: 1,
                why: {
                  0: "C'est possible, mais tout le vecteur est alors copié à chaque appel : coûteux pour un million de notes.",
                  2: "`const` interdit justement toute modification : le compilateur refuserait `notes.push_back(...)`.",
                  3: "Le type de retour n'a aucun lien avec la façon de passer les paramètres."
                },
                hint: "Décompose : que fait `&` ? Et que fait `const` ?",
                explain: "`&` passe une référence, donc aucune copie ; `const` garantit que la fonction ne modifie pas le vecteur. C'est la façon idiomatique de passer un gros objet en lecture seule en C++. En Python, une liste n'est jamais copiée lors d'un appel, mais rien n'empêche la fonction de la modifier."
              },
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> mots = {"chat", "chien"};
    mots.push_back("loup");
    std::string initiales;
    for (const std::string& m : mots) initiales += m[0];
    std::cout << mots.size() << ' ' << initiales << '\\n';
    int x = 5;
    int& r = x;
    r = 8;
    std::cout << x << '\\n';
}`,
                answer: `3 ccl
8`,
                mistakes: [
                  { answer: `3 ccl
5`, why: "`r` est une référence : un autre nom pour `x`. Modifier `r`, c'est modifier `x`." },
                  { answer: `2 cc
8`, why: "`push_back` ajoute « loup » à la fin : le vecteur contient 3 mots." }
                ],
                hint: "`m[0]` est le premier caractère de chaque mot. Et une référence n'est pas une copie.",
                explain: "Après `push_back`, le vecteur a 3 éléments ; on concatène leurs premières lettres : « ccl ». Puis `r` désigne la même variable que `x` : `r = 8` change `x`. La boucle utilise aussi une référence constante (`const std::string&`) pour ne pas copier chaque mot."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "`ajouter_bonus` devrait ajouter 1 point à chaque note, mais le programme affiche toujours `12 15`. Clique sur la ligne fautive.",
              code: `#include <iostream>
#include <vector>

void ajouter_bonus(std::vector<int> notes) {
    for (int& n : notes) n += 1;
}

int main() {
    std::vector<int> mes_notes = {12, 15};
    ajouter_bonus(mes_notes);
    std::cout << mes_notes[0] << ' ' << mes_notes[1] << '\\n';
}`,
              bugLine: 4,
              why: "Le paramètre est passé **par valeur** : la fonction reçoit une copie du vecteur et modifie cette copie, détruite à la fin de l'appel.",
              fixes: [
                "void ajouter_bonus(std::vector<int>& notes) {",
                "void ajouter_bonus(const std::vector<int>& notes) {",
                "void ajouter_bonus(std::vector<int>* notes) {"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`const` interdit la modification : la boucle `n += 1` ne compilerait plus.",
                2: "Un pointeur demanderait aussi de changer l'appel (`&mes_notes`) et la boucle : en l'état, ça ne compile pas."
              },
              output: `13 16`,
              hint: "Le `int&` de la boucle est déjà correct. Que reçoit la fonction : l'original ou une copie ?",
              explain: "Avec `std::vector<int>&`, la fonction travaille sur le vecteur de l'appelant. C'est l'inverse de Python, où une liste passée à une fonction est toujours partagée : en C++, la copie est le comportement par défaut, et la référence se demande explicitement."
            },
            recap: [
              "`std::string` et `std::vector` gèrent leur mémoire : pas de `malloc` à la main.",
              "Une référence (`int& r = x`) est un autre nom pour une variable.",
              "Paramètres : par valeur (copie), `T&` (modifiable), `const T&` (lecture sans copie).",
              "Classe : constructeur, méthodes `const`, attributs `private`."
            ],
            check: {
              type: 'fill',
              prompt: "Complète la classe `Produit` et l'affichage.",
              code: `#include <iostream>
#include <string>

class Produit {
public:
    Produit(std::string nom, double prix) : nom_(nom), prix_(prix) {}
    double prix_ttc() ___ { return prix_ * 1.2; }
    std::string nom() const { return nom_; }
___:
    std::string nom_;
    double prix_;
};

int main() {
    Produit p("Clavier", 50);
    std::___ << p.nom() << " : " << p.prix_ttc() << '\\n';
}`,
              blanks: [
                { answers: ['const'], options: ['const', 'static', 'void'], why: { 'static': "Une méthode `static` n'a pas d'objet : elle ne pourrait pas lire `prix_`.", 'void': "`void` se place avant le nom, comme type de retour ; ici le type de retour est déjà `double`." } },
                { answers: ['private'], options: ['private', 'hidden', 'self'], why: { 'hidden': "Ce mot-clé n'existe pas en C++.", 'self': "`self` est le premier paramètre des méthodes Python ; en C++, l'objet courant s'appelle `this` et n'a rien à faire ici." } },
                { answers: ['cout'], options: ['cout', 'print', 'printf'], why: { 'print': "`std::print` n'existe qu'à partir de C++23, et ne s'utilise pas avec `<<`.", 'printf': "`printf` est la fonction du C ; elle ne fonctionne pas avec l'opérateur `<<`." } }
              ],
              output: `Clavier : 60`,
              hint: "Une méthode qui ne modifie pas l'objet le promet après ses parenthèses. Les attributs sont cachés dans une section dédiée.",
              explain: "`const` après la signature garantit que `prix_ttc` ne modifie pas l'objet. La section `private` cache les attributs : on y accède par les méthodes publiques. `std::cout` avec `<<` enchaîne l'affichage de valeurs de types différents."
            }
          }
        ]
      }
    ]
  };

  CQ.addTrack({
    id: 'autres',
    title: 'Autres langages',
    lang: 'c',
    unlock: 'chapter',
    summary: "Découvrir C, C++, Java, C#, PHP, TypeScript, Bash et Dart en les comparant à Python, et savoir lequel choisir.",
    why: "Chaque domaine a ses langages : systèmes en C, jeux en C++ ou C#, web en PHP ou TypeScript, mobile avec Dart et Flutter. Savoir les lire et choisir le bon t'ouvre tous les projets, et chaque nouveau langage s'apprend plus vite que le précédent.",
    requires: [],
    chapters: [c1, c2, c3]
  });
})();
