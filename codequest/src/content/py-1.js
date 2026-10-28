// CodeQuest — parcours Python, chapitre 1 « Fondations » (unités py.u1 à py.u4).
CQ.addTrack({
  id: 'py',
  title: 'Python',
  lang: 'python',
  summary: "Du premier script aux fonctions et aux modules : écrire du Python exact, lisible et sans les pièges classiques.",
  why: "Python est le langage de l'IA, de la data et de l'automatisation. Bien maîtriser ses bases te permet de lire, corriger et écrire toi-même le code d'un projet, au lieu de le subir.",
  requires: [],
  chapters: [
    {
      id: 'py.c1',
      title: 'Fondations',
      units: [
        // ---------------------------------------------------------------- py.u1
        {
          id: 'py.u1',
          title: 'Variables et types',
          summary: "Nommer des valeurs, connaître leur type et les convertir sans surprise.",
          lessons: [
            {
              id: 'py.u1.l1',
              title: 'Des noms posés sur des valeurs',
              minutes: 6,
              objective: "Tu sais prévoir la valeur de chaque variable après une suite d'affectations, y compris un échange en une ligne avec `a, b = b, a`.",
              explain: `En Python, une variable n'est pas une boîte : c'est un **nom** attaché à une valeur. L'instruction \`x = expression\` calcule d'abord tout le côté droit, puis attache le nom \`x\` au résultat.

- Réaffecter un nom le déplace vers une nouvelle valeur ; les autres noms ne bougent pas.
- Le type appartient à la valeur, pas au nom : \`x\` peut désigner un entier, puis un texte.
- \`a, b = b, a\` échange deux valeurs sans variable intermédiaire, car le côté droit est entièrement évalué avant l'affectation.

Les noms sont sensibles à la casse (\`score\` et \`Score\` sont deux variables) et s'écrivent en \`snake_case\`. Si tu viens de PowerShell : pas de \`$\` devant les noms, et \`$Score\` y désigne la même variable que \`$score\`, ce qui n'est pas le cas en Python.`,
              example: {
                code: `epoque = 1
perte = 0.92
epoque = epoque + 1
perte = perte * 0.5
meilleur, actuel = 0.80, 0.85
meilleur, actuel = actuel, meilleur
print(epoque, perte)
print(meilleur, actuel)`,
                output: `2 0.46
0.85 0.8`,
                notes: [
                  { line: 3, text: "Le côté droit est calculé avec l'ancienne valeur (1), puis `epoque` est rattaché à 2." },
                  { line: 5, text: "Affectation multiple : deux noms reçoivent deux valeurs, dans l'ordre." },
                  { line: 6, text: "Échange : le couple `(actuel, meilleur)` est construit avant que les noms ne bougent." },
                  { line: 8, text: "`0.80` s'affiche `0.8` : Python montre l'écriture la plus courte du nombre." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `x = 5
y = x
x = x + 3
print(x, y)`,
                  answer: '8 5',
                  mistakes: [
                    { answer: '8 8', why: "`y = x` attache `y` à la valeur 5, pas au nom `x`. Quand `x` est rattaché à 8, `y` désigne toujours 5." },
                    { answer: '5 5', why: "La ligne 3 rattache bien `x` au résultat de `5 + 3`, donc à 8." }
                  ],
                  hint: "Suis chaque ligne : à quelle valeur chaque nom est-il attaché juste après ?",
                  explain: "`y = x` donne à `y` la valeur actuelle de `x` (5). La ligne 3 crée la valeur 8 et y rattache `x` ; `y` n'est pas concerné. Avec des nombres et des textes, c'est toujours sûr ; avec des listes, tu verras un piège proche dans l'unité 7."
                },
                {
                  type: 'qcm',
                  prompt: "Lequel de ces noms de variable est valide en Python ?",
                  choices: ['2e_essai', 'taux-apprentissage', 'class', 'nb_epoques_max'],
                  answer: 3,
                  why: {
                    0: "Un nom ne peut pas commencer par un chiffre : `2e_essai` provoque une erreur de syntaxe.",
                    1: "Le tiret est lu comme une soustraction : Python comprend `taux - apprentissage`.",
                    2: "`class` est un mot réservé du langage (il sert à définir des classes) : impossible de l'utiliser comme nom."
                  },
                  hint: "Un nom commence par une lettre ou `_`, ne contient que des lettres, des chiffres et des `_`, et n'est pas un mot-clé.",
                  explain: "`nb_epoques_max` respecte toutes les règles. Le style `snake_case` (mots en minuscules séparés par `_`) est la convention de Python pour les variables et les fonctions."
                }
              ],
              challenge: {
                type: 'logic',
                prompt: "Que vaut `b` à la fin de ce programme ?",
                code: `a = 2
b = a * 3
a = b - a
b = a + b`,
                answer: '10',
                mistakes: [
                  { answer: '8', why: "Tu as utilisé l'ancienne valeur de `a` (2) à la ligne 4. Après la ligne 3, `a` vaut `6 - 2 = 4`, donc `b = 4 + 6 = 10`." },
                  { answer: '6', why: "6 est la valeur de `b` après la ligne 2 ; la ligne 4 la remplace." }
                ],
                hint: "Fais un petit tableau : une colonne `a`, une colonne `b`, une ligne par instruction.",
                explain: "Ligne 1 : a = 2. Ligne 2 : b = 6. Ligne 3 : a = 6 - 2 = 4. Ligne 4 : b = 4 + 6 = 10. Chaque calcul utilise les valeurs du moment où la ligne s'exécute."
              },
              recap: [
                "Une variable est un nom attaché à une valeur ; `=` calcule d'abord le côté droit.",
                "Réaffecter un nom ne modifie pas les autres noms qui désignaient l'ancienne valeur.",
                "`a, b = b, a` échange deux valeurs en une ligne.",
                "Noms en `snake_case`, sensibles à la casse, sans chiffre au début ni mot-clé."
              ],
              check: {
                type: 'code',
                prompt: "Les deux scores ont été enregistrés à l'envers. Échange `ancien` et `nouveau` **en une seule ligne**, puis crée `progression`, égale à `nouveau - ancien`.",
                starter: `ancien = 0.91
nouveau = 0.84
# échange les deux valeurs ici

# crée progression ici
`,
                solution: `ancien = 0.91
nouveau = 0.84
ancien, nouveau = nouveau, ancien
progression = nouveau - ancien
`,
                tests: [
                  { code: 'assert ancien == 0.84 and nouveau == 0.91', label: 'ancien vaut 0.84 et nouveau vaut 0.91' },
                  { code: 'assert round(progression, 2) == 0.07', label: 'progression vaut environ 0.07' }
                ],
                checks: [
                  { re: '\\w+\\s*,\\s*\\w+\\s*=\\s*\\w+\\s*,\\s*\\w+', label: "Échange en une ligne, sur le modèle a, b = b, a" }
                ],
                hint: "Le côté droit `nouveau, ancien` est évalué en entier avant que les noms ne changent.",
                explain: "`ancien, nouveau = nouveau, ancien` construit d'abord le couple (0.84, 0.91), puis l'attache aux deux noms. La progression vaut environ 0.07 : le petit écart affiché (0.07000000000000006) vient des flottants, étudiés dans l'unité 3."
              }
            },
            {
              id: 'py.u1.l2',
              title: 'Types et conversions',
              minutes: 7,
              objective: "Tu sais identifier le type d'une valeur et la convertir entre `int`, `float`, `str` et `bool` en prévoyant ce que la conversion perd.",
              explain: `Chaque valeur a un type, que \`type(x)\` affiche :

- \`int\` : entier, sans limite de taille ; \`float\` : nombre à virgule, stocké de façon approchée ;
- \`str\` : texte ; \`None\` : absence de valeur ;
- \`bool\` : \`True\` ou \`False\`, qui valent 1 et 0 dans un calcul.

Les conversions sont explicites : \`int("42")\`, \`float("3.5")\`, \`str(7)\`. Prévois ce qu'elles perdent : \`int(3.99)\` donne \`3\` (troncature, pas arrondi) et \`int("3.5")\` lève une \`ValueError\`. \`bool(x)\` vaut \`False\` seulement pour les valeurs « vides » (\`0\`, \`0.0\`, \`""\`, \`None\`…) : \`bool("False")\` vaut \`True\`, car ce texte n'est pas vide.

Python ne mélange pas les types à ta place : \`"3" + 4\` lève une \`TypeError\`, et \`"3" * 4\` répète le texte (\`"3333"\`). PowerShell, lui, convertit en silence : \`"3" + 4\` y donne \`"34"\`.`,
              example: {
                code: `precision = 0.875
nb_images = 12000
pret = True
print(type(precision), type(nb_images), type(None))
print(int(precision * 100), str(nb_images) + " images")
print(bool("False"), bool(""), pret + pret)
print(isinstance(nb_images, int), float("1e-3"))`,
                output: `<class 'float'> <class 'int'> <class 'NoneType'>
87 12000 images
True False 2
True 0.001`,
                notes: [
                  { line: 5, text: "`precision * 100` vaut 87.5 ; `int()` coupe la partie décimale et donne 87. `str()` permet ensuite de coller du texte." },
                  { line: 6, text: "`bool(\"False\")` vaut `True` : seul le texte vide est faux. `True + True` vaut 2." },
                  { line: 7, text: "`isinstance(x, int)` teste un type ; `float()` comprend la notation scientifique `1e-3`, courante pour un taux d'apprentissage." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "Que vaut l'expression `True + False + True` ?",
                  choices: ['2', 'True', 'Une TypeError', '"TrueFalseTrue"'],
                  answer: 0,
                  why: {
                    1: "L'addition ne renvoie pas un booléen : `+` traite `True` comme l'entier 1.",
                    2: "Aucune erreur : `bool` est un cas particulier de `int`, l'addition est donc permise.",
                    3: "On n'additionne pas des textes : `True` n'est pas la chaîne `\"True\"`."
                  },
                  hint: "Quel entier se cache derrière `True` ? Et derrière `False` ?",
                  explain: "`True` vaut 1 et `False` vaut 0 dans un calcul, donc la somme vaut 2. C'est pratique en IA : additionner des booléens « prédiction correcte » donne directement le nombre de bonnes réponses."
                },
                {
                  type: 'fill',
                  prompt: "La taille d'un fichier est lue comme du texte. Complète pour la convertir en mégaoctets, puis afficher un nombre entier : `2560 Mo`.",
                  code: `taille_go = "2.5"            # lu dans un fichier de configuration
taille_mo = ___(taille_go) * 1024
print(___(taille_mo), "Mo")`,
                  blanks: [
                    {
                      answers: ['float'],
                      options: ['float', 'int', 'str'],
                      why: {
                        int: "`int(\"2.5\")` lève une ValueError : `int()` n'accepte pas un texte avec une partie décimale.",
                        str: "`taille_go` est déjà un texte : `str()` ne change rien, et `\"2.5\" * 1024` répéterait le texte 1024 fois."
                      }
                    },
                    {
                      answers: ['int'],
                      options: ['int', 'float', 'bool'],
                      why: {
                        float: "On obtiendrait `2560.0` : `float` garde la partie décimale.",
                        bool: "`bool(2560.0)` vaut `True`, pas un nombre de mégaoctets."
                      }
                    }
                  ],
                  output: `2560 Mo`,
                  hint: "Quel type accepte le texte \"2.5\" ? Lequel enlève la partie décimale de 2560.0 ?",
                  explain: "`float(\"2.5\")` donne 2.5, qui multiplié par 1024 donne 2560.0. `int(2560.0)` donne 2560. Attention, `int()` tronque : sur 2560.7, il donnerait aussi 2560."
                }
              ],
              challenge: {
                type: 'bug',
                prompt: "Ce code doit afficher la taille totale de 3 fichiers (`Total : 6144 Ko`), mais il affiche un nombre énorme. Clique sur la ligne fautive.",
                code: `taille_ko = "2048"          # lu dans un fichier texte
nb_fichiers = 3
total = taille_ko * nb_fichiers
print("Total :", total, "Ko")`,
                bugLine: 3,
                why: "`taille_ko` est un texte : `\"2048\" * 3` répète la chaîne et donne `\"204820482048\"`. Il faut convertir en entier avant de multiplier.",
                fixes: [
                  'total = int(taille_ko) * nb_fichiers',
                  'total = str(taille_ko * nb_fichiers)',
                  'total = taille_ko * int(nb_fichiers)'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "`str()` est appliqué après la répétition : le résultat reste `\"204820482048\"`.",
                  2: "`nb_fichiers` est déjà un entier ; c'est `taille_ko` qu'il faut convertir."
                },
                output: `Total : 6144 Ko`,
                hint: "Que fait l'opérateur `*` entre un texte et un entier ?",
                explain: "Avec `int(taille_ko)`, la multiplication devient numérique : 2048 × 3 = 6144. Python ne lève aucune erreur ici, ce qui rend ce bug sournois : `*` est défini entre un texte et un entier (c'est la répétition)."
              },
              recap: [
                "`type(x)` donne le type d'une valeur ; `isinstance(x, int)` le teste.",
                "`int()` tronque (`int(3.99)` vaut 3) et refuse le texte `\"3.5\"`.",
                "`bool()` ne vaut `False` que pour les valeurs vides : `bool(\"False\")` vaut `True`.",
                "Python ne convertit jamais en silence : `\"3\" + 4` est une TypeError, `\"3\" * 4` répète le texte."
              ],
              check: {
                type: 'code',
                prompt: "Les dimensions d'une image arrivent sous forme de textes. Crée `pixels` (entier) = largeur × hauteur, puis `pixels_reduits` (entier) = `pixels` × `ratio`.",
                starter: `largeur = "1920"
hauteur = "1080"
ratio = "0.5"
pixels = 0
pixels_reduits = 0
`,
                solution: `largeur = "1920"
hauteur = "1080"
ratio = "0.5"
pixels = int(largeur) * int(hauteur)
pixels_reduits = int(pixels * float(ratio))
`,
                tests: [
                  { code: 'assert pixels == 2073600', label: 'pixels vaut 2073600' },
                  { code: 'assert pixels_reduits == 1036800', label: 'pixels_reduits vaut 1036800' },
                  { code: 'assert type(pixels) == int and type(pixels_reduits) == int', label: 'les deux résultats sont des int' }
                ],
                checks: [
                  { re: 'float\\(', label: 'Convertit ratio avec float()' }
                ],
                hint: "Convertis chaque texte dans le bon type avant de calculer : `ratio` contient une partie décimale.",
                explain: "`int(largeur) * int(hauteur)` donne 2073600. `float(ratio)` donne 0.5 ; le produit 1036800.0 est un float, d'où le `int()` final pour obtenir un entier."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- py.u2
        {
          id: 'py.u2',
          title: 'Affichage et saisie',
          summary: "Afficher un résultat au caractère près et lire ce que tape l'utilisateur.",
          lessons: [
            {
              id: 'py.u2.l1',
              title: 'Afficher proprement : print et f-strings',
              minutes: 6,
              objective: "Tu sais produire un affichage exact avec `print` (`sep`, `end`) et les f-strings formatées (`:.2f`, `:.1%`, `:>8`, `:,`).",
              explain: `\`print(a, b, c)\` sépare les valeurs par une espace et finit par un retour à la ligne. Deux paramètres changent cela : \`sep\` (le séparateur) et \`end\` (la fin, \`"\\n"\` par défaut).

Une f-string (\`f"..."\`) remplace chaque \`{expression}\` par sa valeur. Après \`:\`, un format précise l'affichage :

- \`{x:.2f}\` : 2 décimales ; \`{x:.1%}\` : pourcentage (multiplie par 100) ;
- \`{x:>8}\`, \`{x:<8}\`, \`{x:^8}\` : aligné à droite, à gauche ou centré sur 8 caractères ;
- \`{x:,}\` : séparateur de milliers ; \`{x:05d}\` : zéros devant ;
- \`{x=}\` : affiche le nom et la valeur, idéal pour déboguer.

Le format ne change que l'affichage : la variable garde toute sa précision. Oublier le \`f\` devant les guillemets affiche les accolades telles quelles.`,
              example: {
                code: `modele = "mini-gpt"
precision = 0.91347
params = 124000000
print("epoch", 3, "loss", 0.42, sep=" | ")
print(f"{modele} : {precision:.2%} de précision")
print(f"{params:,} paramètres")
print(f"{'nom':<10}|{'score':>7}")
print(f"{modele:<10}|{precision:>7.3f}")
print(f"{precision=}")`,
                output: `epoch | 3 | loss | 0.42
mini-gpt : 91.35% de précision
124,000,000 paramètres
nom       |  score
mini-gpt  |  0.913
precision=0.91347`,
                notes: [
                  { line: 4, text: "`sep` remplace l'espace placée entre les valeurs." },
                  { line: 5, text: "`.2%` multiplie par 100, garde 2 décimales et ajoute `%`." },
                  { line: 7, text: "`<10` et `>7` réservent une largeur fixe : c'est ainsi qu'on aligne un tableau." },
                  { line: 9, text: "`{precision=}` affiche `precision=` suivi de la valeur." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `print("a", "b", "c", sep="")
print("chargement", end="...")
print("ok")`,
                  answer: `abc
chargement...ok`,
                  mistakes: [
                    { answer: `a b c
chargement...ok`, why: "`sep=\"\"` remplace l'espace par un texte vide : les lettres sont collées." },
                    { answer: `abc
chargement...
ok`, why: "`end` remplace le retour à la ligne : après `...`, rien ne passe à la ligne, donc `ok` s'affiche juste après." }
                  ],
                  hint: "Que met `print` entre les valeurs ? Et à la fin, quand `end` est changé ?",
                  explain: "Le premier `print` colle les valeurs car le séparateur est vide. Le second finit par `...` au lieu de `\"\\n\"`, donc le `print` suivant continue sur la même ligne."
                },
                {
                  type: 'fill',
                  prompt: "Complète les formats pour obtenir exactement `Perte : 0.12` puis `Taux : 87.7%`.",
                  code: `perte = 0.123456
taux = 0.8768
print(f"Perte : {perte:___}")
print(f"Taux : {taux:___}")`,
                  blanks: [
                    {
                      answers: ['.2f'],
                      why: {
                        '.2': "Sans `f`, `.2` compte des chiffres significatifs : ici on obtiendrait 0.12 par chance, mais 12.3456 s'afficherait `1.2e+01`.",
                        '2f': "Il manque le point : `.2f` signifie « 2 chiffres après la virgule »."
                      }
                    },
                    {
                      answers: ['.1%'],
                      why: {
                        '.1f': "`.1f` afficherait `0.9` : il ne multiplie pas par 100 et n'ajoute pas `%`.",
                        '%': "Sans précision, `%` affiche 6 décimales : `87.680000%`."
                      }
                    }
                  ],
                  output: `Perte : 0.12
Taux : 87.7%`,
                  hint: "Un format de décimales commence par un point ; le pourcentage a son propre code.",
                  explain: "`.2f` arrondit l'affichage à 2 décimales. `.1%` multiplie par 100, garde 1 décimale et ajoute le signe `%`. Les variables, elles, ne changent pas."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Affiche ce rapport **exactement**, à partir des variables (la taille en Mo vaut `octets / 1048576`) :\n\n- `dataset.csv : 1,536,000 octets`\n- `Lignes : 48,213`\n- `Taille : 1.46 Mo`",
                starter: `fichier = "dataset.csv"
octets = 1536000
lignes = 48213
# affiche les 3 lignes du rapport
`,
                solution: `fichier = "dataset.csv"
octets = 1536000
lignes = 48213
print(f"{fichier} : {octets:,} octets")
print(f"Lignes : {lignes:,}")
print(f"Taille : {octets / 1048576:.2f} Mo")
`,
                expectOutput: `dataset.csv : 1,536,000 octets
Lignes : 48,213
Taille : 1.46 Mo`,
                checks: [
                  { re: '\\{octets\\s*:[^}]*,', label: 'Formate octets avec le séparateur de milliers {octets:,}' },
                  { re: '1048576|1024\\s*\\*\\s*1024|1024\\s*\\*\\*\\s*2|1024\\s*/\\s*1024', label: 'Calcule la taille en Mo (division par 1048576)' }
                ],
                hint: "Trois `print` avec des f-strings : `:,` pour les milliers, `:.2f` pour les décimales. Le calcul peut se faire directement entre les accolades.",
                explain: "`{octets:,}` insère les séparateurs de milliers, `{octets / 1048576:.2f}` calcule puis arrondit l'affichage à 2 décimales (1.46484375 devient 1.46). Une expression complète peut figurer entre les accolades."
              },
              recap: [
                "`sep` change le séparateur de `print`, `end` sa fin de ligne.",
                "f-string : `{x:.2f}` pour les décimales, `{x:.1%}` pour un pourcentage, `{x:,}` pour les milliers.",
                "`{x:>8}` et `{x:<8}` alignent sur une largeur fixe ; `{x=}` aide à déboguer.",
                "Le format change l'affichage, jamais la valeur de la variable."
              ],
              check: {
                type: 'qcm',
                prompt: "`s = 0.875`. Quelle ligne affiche exactement `Score : 87.5%` ?",
                choices: [
                  'print(f"Score : {s:.1%}")',
                  'print(f"Score : {s:.1f}%")',
                  'print("Score : {s:.1%}")',
                  'print(f"Score : {s:%}")'
                ],
                answer: 0,
                why: {
                  1: "`.1f` n'est pas un pourcentage : on obtient `Score : 0.9%`.",
                  2: "Sans le `f` devant les guillemets, ce n'est pas une f-string : les accolades s'affichent telles quelles.",
                  3: "`%` sans précision affiche 6 décimales : `Score : 87.500000%`."
                },
                hint: "Il faut à la fois le préfixe `f`, le code du pourcentage et une seule décimale.",
                explain: "`{s:.1%}` multiplie 0.875 par 100, garde une décimale et ajoute `%` : `87.5%`. Le préfixe `f` est indispensable pour que les accolades soient remplacées par les valeurs."
              }
            },
            {
              id: 'py.u2.l2',
              title: 'Lire une saisie : input et conversions',
              minutes: 6,
              objective: "Tu sais lire une saisie avec `input()`, la nettoyer et la convertir dans le bon type avant de calculer.",
              explain: `\`input()\` attend que l'utilisateur tape une ligne et la renvoie **toujours sous forme de texte** (\`str\`), même s'il tape \`42\`. Le texte entre parenthèses (\`input("Prix : ")\`) n'est qu'une invite affichée.

- Convertis avant de calculer : \`int(input())\`, \`float(input())\`.
- Nettoie les espaces parasites avec \`.strip()\` : \`"  Ada \\n"\` devient \`"Ada"\`.
- Plusieurs valeurs sur une ligne : \`a, b = input().split()\` découpe aux espaces ; convertis ensuite chaque morceau.

Une saisie non convertible lève une erreur : \`int("douze")\` donne \`ValueError: invalid literal for int() with base 10: 'douze'\`. Tu verras plus tard comment l'intercepter. Même piège en PowerShell : \`Read-Host\` renvoie aussi du texte, qu'on convertit avec \`[int]\`.

Dans CodeQuest, les exercices fournissent à l'avance les lignes « tapées ».`,
              example: {
                code: `modele = input("Nom du modèle : ").strip()
epoques = int(input("Nombre d'époques : "))
taux = float(input("Taux d'apprentissage : "))
largeur, hauteur = input("Taille d'image : ").split()
print(f"{modele} : {epoques} époques, taux {taux}")
print(f"Pixels : {int(largeur) * int(hauteur)}")`,
                stdin: `  mini-gpt \n20\n0.001\n224 224\n`,
                notes: [
                  { line: 1, text: "`.strip()` enlève les espaces autour de la saisie avant de la ranger." },
                  { line: 2, text: "`int(...)` convertit le texte tapé ; sans lui, `epoques` serait la chaîne `\"20\"`." },
                  { line: 4, text: "`.split()` découpe `\"224 224\"` en deux textes, convertis plus bas avec `int()`." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "L'utilisateur tape `3` puis Entrée. Que fait ce programme ?",
                  code: `quantite = input("Quantité : ")
print(quantite + 1)`,
                  stdin: `3\n`,
                  choices: [
                    'Il affiche 4',
                    'Il affiche 31',
                    'Il lève TypeError: can only concatenate str (not "int") to str',
                    'Il affiche 3 1'
                  ],
                  answer: 2,
                  why: {
                    0: "Ce serait le cas avec `int(quantite) + 1` : `input()` renvoie le texte `\"3\"`, pas le nombre 3.",
                    1: "Python ne convertit pas 1 en texte de lui-même ; il faudrait écrire `quantite + \"1\"` pour obtenir `31`.",
                    3: "`print` n'affiche rien : l'erreur survient pendant le calcul de `quantite + 1`, avant l'affichage."
                  },
                  hint: "Quel est le type de la valeur renvoyée par `input()` ?",
                  explain: "`quantite` vaut le texte `\"3\"`. Ajouter un texte et un entier n'a pas de sens pour Python, qui lève une TypeError au lieu de deviner. La correction : `quantite = int(input(\"Quantité : \"))`."
                },
                {
                  type: 'code',
                  prompt: "Un formulaire envoie deux lignes : un nom d'utilisateur entouré d'espaces, puis un nombre d'articles. Corrige le code pour obtenir `utilisateur` (texte nettoyé), `articles` (entier) et `total` = `articles` × 4.5.",
                  starter: `utilisateur = input()
articles = input()
total = articles * 4.5
`,
                  solution: `utilisateur = input().strip()
articles = int(input())
total = articles * 4.5
`,
                  stdin: `  lea_dev  \n3\n`,
                  tests: [
                    { code: 'assert utilisateur == "lea_dev"', label: 'utilisateur vaut "lea_dev", sans espaces' },
                    { code: 'assert articles == 3 and type(articles) == int', label: "articles est l'entier 3" },
                    { code: 'assert total == 13.5', label: 'total vaut 13.5' }
                  ],
                  hint: "Une méthode enlève les espaces autour d'un texte ; une fonction transforme `\"3\"` en 3.",
                  explain: "`input().strip()` renvoie `\"lea_dev\"`. `int(input())` convertit `\"3\"` en 3, ce qui rend la multiplication possible : 3 × 4.5 = 13.5. Sans conversion, `\"3\" * 4.5` lève une TypeError."
                }
              ],
              challenge: {
                type: 'bug',
                prompt: "L'utilisateur tape un prix unitaire (`2.5`) puis une quantité (`4`). Le programme devrait afficher `Total : 10.00`, mais il plante. Clique sur la ligne fautive.",
                code: `prix = int(input())
quantite = int(input())
print(f"Total : {prix * quantite:.2f}")`,
                stdin: `2.5\n4\n`,
                bugLine: 1,
                why: "`int(\"2.5\")` lève `ValueError: invalid literal for int() with base 10: '2.5'` : `int()` n'accepte que du texte qui représente un entier.",
                fixes: [
                  'prix = float(input())',
                  'prix = int(float(input()))',
                  'prix = input()'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "Plus d'erreur, mais `int(2.5)` tronque à 2 : le total devient 8.00 au lieu de 10.00.",
                  2: "`prix` resterait un texte : `\"2.5\" * 4` donne `\"2.52.52.52.5\"`, puis le format `.2f` lève `ValueError: Unknown format code 'f' for object of type 'str'`."
                },
                output: `Total : 10.00`,
                hint: "Lis le message d'erreur : quelle valeur `int()` refuse-t-il ?",
                explain: "Un prix peut avoir des décimales : `float()` est le bon type. `float(\"2.5\") * 4` vaut 10.0, affiché `10.00` grâce au format `.2f`."
              },
              recap: [
                "`input()` renvoie toujours un `str`, même quand on tape un nombre.",
                "Convertis avant de calculer : `int(...)` pour un entier, `float(...)` pour un décimal.",
                "`.strip()` enlève les espaces parasites ; `.split()` découpe une ligne en morceaux.",
                "Une saisie non convertible lève `ValueError: invalid literal for int() with base 10`."
              ],
              check: {
                type: 'order',
                prompt: "Remets dans l'ordre ce programme qui lit `1920 1080` sur une seule ligne et affiche le nombre de mégapixels : `2.1 Mpx`.",
                lines: [
                  'ligne = input()',
                  'largeur, hauteur = ligne.split()',
                  'pixels = int(largeur) * int(hauteur)',
                  'megapixels = pixels / 1000000',
                  'print(f"{megapixels:.1f} Mpx")'
                ],
                stdin: `1920 1080\n`,
                output: `2.1 Mpx`,
                hint: "On ne peut découper qu'une ligne déjà lue, et calculer qu'avec des nombres déjà convertis.",
                explain: "Lecture, découpage, conversion et calcul, puis affichage : chaque ligne utilise un nom créé par la précédente. La conversion `int()` arrive avant toute multiplication, car `split()` produit des textes."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- py.u3
        {
          id: 'py.u3',
          title: 'Opérateurs et calculs',
          summary: "Diviser, arrondir et comparer des nombres en évitant les pièges des flottants.",
          lessons: [
            {
              id: 'py.u3.l1',
              title: 'Diviser : /, // et %',
              minutes: 6,
              objective: "Tu sais choisir entre `/`, `//` et `%` pour découper une quantité (lots, pages, minutes) et prévoir le type du résultat.",
              explain: `Python a trois opérateurs de division, à ne pas confondre :

- \`/\` donne **toujours** un \`float\` : \`10 / 2\` vaut \`5.0\` ;
- \`//\` donne le quotient entier, arrondi vers le bas : \`7 // 2\` vaut \`3\`, mais \`-7 // 2\` vaut \`-4\` ;
- \`%\` donne le reste : \`7 % 2\` vaut \`1\`. Il sert à tester la parité (\`n % 2 == 0\`) ou à revenir au début d'un cycle.

\`divmod(a, b)\` renvoie les deux d'un coup : \`divmod(125, 60)\` donne \`(2, 5)\`.

Pour un découpage qui doit **tout** couvrir (nombre de lots, de pages), arrondis vers le haut : \`(n + taille - 1) // taille\`.

\`**\` (puissance) passe avant \`*\`, \`/\`, \`//\` et \`%\`, qui passent avant \`+\` et \`-\`. Attention : \`-2 ** 2\` vaut \`-4\`. Dans le doute, mets des parenthèses.`,
              example: {
                code: `images = 1250
lot = 32
print(images / lot)
print(images // lot, images % lot)
print((images + lot - 1) // lot)
minutes, secondes = divmod(3725, 60)
print(f"{minutes} min {secondes} s")
print(2 ** 10, -7 // 2, -2 ** 2)`,
                output: `39.0625
39 2
40
62 min 5 s
1024 -4 -4`,
                notes: [
                  { line: 3, text: "`/` donne un float, même quand la division tombe juste." },
                  { line: 4, text: "39 lots complets de 32 images, et 2 images restantes." },
                  { line: 5, text: "Arrondi vers le haut : il faut 40 lots pour couvrir les 1250 images." },
                  { line: 6, text: "`divmod` renvoie le quotient et le reste, rangés dans deux variables." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `print(10 / 5, 10 // 4, 10 % 4)
print(2 + 3 * 2 ** 2)`,
                  answer: `2.0 2 2
14`,
                  mistakes: [
                    { answer: `2 2 2
14`, why: "`/` renvoie toujours un float : `10 / 5` vaut `2.0`." },
                    { answer: `2.0 2.5 2
14`, why: "`//` ne garde que le quotient entier : `10 // 4` vaut 2." },
                    { answer: `2.0 2 2
100`, why: "Les priorités s'appliquent : `2 ** 2` d'abord (4), puis `3 * 4` (12), puis `2 + 12`." }
                  ],
                  hint: "Ligne 1 : quel type renvoie `/` ? Ligne 2 : quel opérateur passe en premier ?",
                  explain: "`10 / 5` vaut 2.0, `10 // 4` vaut 2 et `10 % 4` vaut 2. Ensuite `**` passe avant `*`, qui passe avant `+` : 2 + 3 × 4 = 14."
                },
                {
                  type: 'logic',
                  prompt: "Une API renvoie 20 résultats par page, en commençant à la page 1. Sur quelle page se trouve le résultat n° 87, sachant que le premier résultat porte le n° 1 ?",
                  answer: '5',
                  mistakes: [
                    { answer: '4', why: "`87 // 20` vaut 4, mais les pages commencent à 1 : les résultats 81 à 100 sont sur la page 5." },
                    { answer: '4.35', why: "Un numéro de page est un entier : il faut un quotient entier, pas une division `/`." }
                  ],
                  hint: "Page 1 : résultats 1 à 20. Page 2 : résultats 21 à 40. Continue.",
                  explain: "La formule est `(n - 1) // 20 + 1` : (87 - 1) // 20 = 4, plus 1 donne la page 5. Le `- 1` gère les cas limites : le résultat n° 80 est bien sur la page 4."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Découpe la durée `duree` (en secondes) en `heures`, `minutes` et `secondes`, puis range dans `texte` le format `HH:MM:SS`. Pour 3725 secondes : `01:02:05`. Utilise `//`, `%` ou `divmod`, et le format `:02d` pour les zéros devant.",
                starter: `duree = 3725
# calcule heures, minutes et secondes

texte = ""
`,
                solution: `duree = 3725
heures, reste = divmod(duree, 3600)
minutes, secondes = divmod(reste, 60)
texte = f"{heures:02d}:{minutes:02d}:{secondes:02d}"
`,
                tests: [
                  { code: 'assert (heures, minutes, secondes) == (1, 2, 5)', label: 'heures, minutes et secondes valent 1, 2 et 5' },
                  { code: 'assert texte == "01:02:05"', label: 'texte vaut "01:02:05"' }
                ],
                checks: [
                  { re: '//|%|divmod', label: 'Calcule avec //, % ou divmod' }
                ],
                hint: "Commence par les heures (3600 secondes), puis découpe le reste en minutes et en secondes.",
                explain: "`divmod(3725, 3600)` donne (1, 125) : 1 heure et 125 secondes restantes. `divmod(125, 60)` donne (2, 5). Le format `:02d` complète avec un zéro à gauche : 1 devient `01`."
              },
              recap: [
                "`/` renvoie toujours un float ; `//` le quotient entier (arrondi vers le bas) ; `%` le reste.",
                "`divmod(a, b)` donne le quotient et le reste en une fois.",
                "Nombre de lots ou de pages : `(n + t - 1) // t`.",
                "`**` passe avant `*`, `/`, `//`, `%`, eux-mêmes avant `+` et `-`."
              ],
              check: {
                type: 'qcm',
                prompt: "Tu as `n` exemples d'entraînement et des lots de taille `t`. Le dernier lot peut être incomplet. Quelle expression donne le nombre de lots nécessaires ?",
                choices: ['n / t', 'n // t', 'n // t + 1', '(n + t - 1) // t'],
                answer: 3,
                why: {
                  0: "`/` donne un float (39.0625 pour 1250 et 32) : on ne peut pas faire 39,06 lots.",
                  1: "`//` oublie le lot incomplet : avec 1250 et 32, il manque le lot des 2 dernières images.",
                  2: "Faux quand la division tombe juste : avec 64 et 32, on obtient 3 au lieu de 2."
                },
                hint: "Teste chaque expression avec n = 64, t = 32 (division exacte), puis avec n = 65, t = 32.",
                explain: "`(n + t - 1) // t` arrondit vers le haut : 64 donne 2, 65 donne 3. Ajouter `t - 1` fait passer au lot suivant dès qu'il reste au moins un exemple."
              }
            },
            {
              id: 'py.u3.l2',
              title: 'Flottants : calculer sans se faire piéger',
              minutes: 7,
              objective: "Tu sais comparer des flottants avec une tolérance, arrondir correctement avec `round` et mettre à jour une variable avec `+=` ou `*=`.",
              explain: `Les \`float\` sont stockés en binaire, de façon approchée : \`0.1 + 0.2\` vaut \`0.30000000000000004\`. Conséquences :

- ne compare jamais deux flottants avec \`==\` : teste plutôt un petit écart, \`abs(a - b) < 1e-9\` (le module \`math\` offre aussi \`math.isclose\`, vu en unité 11) ;
- \`round(x, 2)\` arrondit, mais les demis vont vers le chiffre **pair** : \`round(2.5)\` vaut \`2\`, \`round(3.5)\` vaut \`4\` ;
- \`int(x)\` tronque : \`int(19.99 * 100)\` vaut \`1998\`, car le produit vaut \`1998.9999999999998\` ;
- pour de l'argent, calcule en centimes entiers.

Les affectations augmentées raccourcissent les mises à jour : \`total += x\` équivaut à \`total = total + x\`. Il existe aussi \`-=\`, \`*=\`, \`/=\` et \`//=\`.`,
              example: {
                code: `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3, abs((0.1 + 0.2) - 0.3) < 1e-9)
print(round(2.5), round(3.5), round(0.123456, 3))
taux = 0.01
taux *= 0.5
taux *= 0.5
print(taux)
centimes = 1999 + 2999
print(centimes // 100, centimes % 100)`,
                output: `0.30000000000000004
False True
2 4 0.123
0.0025
49 98`,
                notes: [
                  { line: 1, text: "Résultat approché : 0.1 et 0.2 n'ont pas d'écriture binaire exacte." },
                  { line: 2, text: "`==` échoue, la comparaison avec tolérance réussit." },
                  { line: 3, text: "Arrondi au pair pour les demis : 2.5 donne 2, 3.5 donne 4." },
                  { line: 9, text: "En centimes entiers, aucun écart : 49 euros et 98 centimes." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `print(round(0.5), round(1.5), round(2.5))
print(int(2.99), round(2.99), round(2.99, 1))`,
                  answer: `0 2 2
2 3 3.0`,
                  mistakes: [
                    { answer: `1 2 3
2 3 3.0`, why: "Python n'arrondit pas les demis vers le haut : il choisit le chiffre pair (0, 2, 2)." },
                    { answer: `0 2 2
3 3 3.0`, why: "`int()` n'arrondit pas : il coupe la partie décimale, donc `int(2.99)` vaut 2." },
                    { answer: `0 2 2
2 3 3`, why: "Avec un nombre de décimales, `round` renvoie un float : `round(2.99, 1)` vaut `3.0`." }
                  ],
                  hint: "Deux règles : les demis vont vers le pair, et `int()` coupe sans arrondir.",
                  explain: "Les demis exacts sont arrondis vers le chiffre pair (« arrondi bancaire »), ce qui évite de biaiser les sommes vers le haut. `int()` tronque, `round()` arrondit, et `round(x, n)` renvoie un float."
                },
                {
                  type: 'fill',
                  prompt: "Complète : ajoute 0.2 à `solde` avec une affectation augmentée, compare le résultat à 0.3 avec une tolérance, puis affiche-le arrondi à 2 décimales.",
                  code: `solde = 0.1
solde ___ 0.2
print(solde == 0.3)
print(___(solde - 0.3) < 1e-9)
print(___(solde, 2))`,
                  blanks: [
                    {
                      answers: ['+='],
                      options: ['+=', '=+', '==', '+'],
                      why: {
                        '=+': "`solde =+ 0.2` se lit `solde = +0.2` : la valeur 0.1 est remplacée par 0.2 au lieu d'être augmentée.",
                        '==': "`==` compare sans rien modifier : `solde` resterait 0.1.",
                        '+': "`solde + 0.2` calcule une valeur mais ne la range nulle part."
                      }
                    },
                    {
                      answers: ['abs'],
                      options: ['abs', 'round', 'int'],
                      why: {
                        round: "`round(...)` arrondit l'écart à l'entier : un écart de 0.4 deviendrait 0 et passerait le test à tort.",
                        int: "`int()` tronque l'écart : un écart de 0.9 deviendrait 0 et passerait le test à tort."
                      }
                    },
                    {
                      answers: ['round'],
                      options: ['round', 'int', 'abs'],
                      why: {
                        int: "`int(solde, 2)` lève une TypeError : le second argument d'`int` est une base de numération, pas un nombre de décimales.",
                        abs: "`abs` ne prend qu'un argument : `abs(solde, 2)` lève une TypeError."
                      }
                    }
                  ],
                  output: `False
True
0.3`,
                  hint: "Une mise à jour courte, une valeur absolue, un arrondi.",
                  explain: "`solde += 0.2` met à jour la variable. `solde` vaut 0.30000000000000004, donc `==` renvoie False alors que l'écart absolu est minuscule. `round(solde, 2)` donne 0.3 pour l'affichage."
                }
              ],
              challenge: {
                type: 'bug',
                prompt: "Un modèle renvoie trois probabilités qui doivent faire 1 au total. Le code affiche `Distribution valide : False` alors que tout va bien. Clique sur la ligne fautive.",
                code: `proba_chat = 0.7
proba_chien = 0.2
proba_oiseau = 0.1
somme = proba_chat + proba_chien + proba_oiseau
print("Distribution valide :", somme == 1.0)`,
                bugLine: 5,
                why: "`somme` vaut 0.9999999999999999 à cause des arrondis binaires : `==` exige une égalité parfaite et renvoie False.",
                fixes: [
                  'print("Distribution valide :", abs(somme - 1.0) < 1e-9)',
                  'print("Distribution valide :", round(somme) == 1)',
                  'print("Distribution valide :", somme >= 1.0)'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "`round(somme)` arrondit à l'entier : une somme de 0.6 ou de 1.4 donnerait aussi True. Le test devient trop laxiste.",
                  2: "0.9999999999999999 est plus petit que 1.0 : le résultat reste False, et une somme de 5 serait acceptée."
                },
                output: `Distribution valide : True`,
                hint: "Affiche `somme` pour voir sa vraie valeur.",
                explain: "On vérifie que l'écart avec 1 est négligeable au lieu d'exiger une égalité exacte. Les bibliothèques d'IA procèdent ainsi pour contrôler qu'une sortie de type softmax somme bien à 1."
              },
              recap: [
                "Les float sont approchés : `0.1 + 0.2 == 0.3` vaut False.",
                "Compare des flottants avec une tolérance : `abs(a - b) < 1e-9`.",
                "`round` arrondit les demis vers le pair ; `int` tronque.",
                "`+=`, `-=`, `*=` mettent à jour une variable ; l'argent se calcule en centimes entiers."
              ],
              check: {
                type: 'code',
                prompt: "Un panier contient 3 articles à 19.99 €. Le code calcule `centimes` (prix d'un article en centimes) puis `total_centimes`, mais il trouve 1998 au lieu de 1999. Corrige-le pour obtenir des entiers exacts.",
                starter: `prix = 19.99
quantite = 3
centimes = int(prix * 100)
total_centimes = centimes * quantite
`,
                solution: `prix = 19.99
quantite = 3
centimes = round(prix * 100)
total_centimes = centimes * quantite
`,
                tests: [
                  { code: 'assert centimes == 1999', label: 'centimes vaut 1999' },
                  { code: 'assert total_centimes == 5997', label: 'total_centimes vaut 5997' },
                  { code: 'assert type(total_centimes) == int', label: 'total_centimes est un entier' }
                ],
                hint: "Que vaut exactement `19.99 * 100` ? Quelle fonction choisit l'entier le plus proche au lieu de couper ?",
                explain: "`19.99 * 100` vaut 1998.9999999999998 ; `int()` coupe et donne 1998, alors que `round()` donne l'entier le plus proche, 1999. Une fois en centimes entiers, les calculs suivants sont exacts."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- py.u4
        {
          id: 'py.u4',
          title: 'Conditions',
          summary: "Choisir un chemin avec if, elif et else, et écrire des conditions qui disent vraiment ce que tu veux.",
          lessons: [
            {
              id: 'py.u4.l1',
              title: "if, elif, else : l'ordre compte",
              minutes: 6,
              objective: "Tu sais écrire une chaîne `if` / `elif` / `else` dont les conditions sont testées dans le bon ordre, avec des comparaisons enchaînées comme `0 <= p <= 1`.",
              explain: `Python teste les conditions **de haut en bas** et n'exécute que le premier bloc dont la condition est vraie ; les \`elif\` suivants sont ignorés, même s'ils sont vrais. Place donc les cas les plus précis en premier : écrire \`if statut >= 400\` avant \`elif statut == 404\` rend le second inaccessible.

- Un bloc commence après \`:\` et se délimite par l'indentation (4 espaces).
- \`else\` attrape tout le reste, y compris les valeurs inattendues : traite d'abord les cas invalides.
- Les comparaisons s'enchaînent : \`0 <= p <= 1\` signifie \`0 <= p and p <= 1\`.

Depuis PowerShell : \`-eq\`, \`-gt\`, \`-le\` deviennent \`==\`, \`>\`, \`<=\`, et \`elseif\` devient \`elif\`. Attention, \`==\` est sensible à la casse en Python (\`"Oui" == "oui"\` vaut \`False\`), alors que \`-eq\` ne l'est pas.`,
              example: {
                code: `confiance = 0.72
if not 0 <= confiance <= 1:
    verdict = "valeur invalide"
elif confiance >= 0.9:
    verdict = "très sûr"
elif confiance >= 0.6:
    verdict = "probable"
else:
    verdict = "incertain"
print(verdict)`,
                output: `probable`,
                notes: [
                  { line: 2, text: "Le cas invalide est traité en premier ; `not` inverse la comparaison enchaînée." },
                  { line: 4, text: "0.72 n'atteint pas 0.9 : on passe au `elif` suivant." },
                  { line: 6, text: "Première condition vraie : son bloc s'exécute et la chaîne s'arrête là." },
                  { line: 8, text: "`else` ne reçoit plus que les valeurs comprises entre 0 et 0.6." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `statut = 404
if statut >= 400:
    print("erreur")
elif statut == 404:
    print("page introuvable")
else:
    print("ok")`,
                  answer: 'erreur',
                  mistakes: [
                    { answer: 'page introuvable', why: "La condition `statut >= 400` est testée d'abord et elle est vraie : son bloc s'exécute et les `elif` sont ignorés." },
                    { answer: `erreur
page introuvable`, why: "Un seul bloc d'une chaîne `if` / `elif` / `else` s'exécute : le premier dont la condition est vraie." }
                  ],
                  hint: "Teste les conditions dans l'ordre et arrête-toi à la première qui est vraie.",
                  explain: "404 est supérieur ou égal à 400 : le premier bloc s'exécute et la chaîne s'arrête. Pour distinguer le 404, il faudrait tester `statut == 404` avant `statut >= 400`."
                },
                {
                  type: 'order',
                  prompt: "Remets dans l'ordre pour qu'un code 503 soit classé « erreur du serveur », un 404 « erreur du client » et un 200 « succès ». Le programme teste le code 503.",
                  lines: [
                    'code = 503',
                    'if code >= 500:',
                    '    print("erreur du serveur")',
                    'elif code >= 400:',
                    '    print("erreur du client")',
                    'else:',
                    '    print("succès")'
                  ],
                  output: `erreur du serveur`,
                  hint: "Les seuils se chevauchent : 503 est aussi supérieur à 400. Quelle condition doit passer en premier ?",
                  explain: "Avec des seuils qui se chevauchent, on teste du plus restrictif au plus large : `>= 500`, puis `>= 400`, puis le reste. Dans l'ordre inverse, 503 serait classé « erreur du client »."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Complète la fonction `force(mdp)`. Les fonctions sont détaillées dans l'unité 9 : ici, `return` renvoie simplement le résultat. Elle renvoie `\"vide\"` si le mot de passe est vide, `\"faible\"` s'il fait moins de 8 caractères, `\"moyen\"` de 8 à 11 caractères, et `\"fort\"` à partir de 12.",
                starter: `def force(mdp):
    longueur = len(mdp)
    # teste les cas dans le bon ordre
    return "?"
`,
                solution: `def force(mdp):
    longueur = len(mdp)
    if longueur == 0:
        return "vide"
    elif longueur < 8:
        return "faible"
    elif longueur < 12:
        return "moyen"
    else:
        return "fort"
`,
                tests: [
                  { code: 'assert force("") == "vide"', label: 'force("") renvoie "vide"' },
                  { code: 'assert force("abc") == "faible"', label: 'force("abc") renvoie "faible"' },
                  { code: 'assert force("abcdefgh") == "moyen"', label: '8 caractères : "moyen"' },
                  { code: 'assert force("abcdefghijk") == "moyen"', label: '11 caractères : "moyen"' },
                  { code: 'assert force("abcdefghijkl") == "fort"', label: '12 caractères : "fort"' }
                ],
                hint: "Commence par le cas le plus particulier (longueur 0), puis monte les seuils : `< 8`, `< 12`, puis le reste.",
                explain: "Chaque `elif` n'est atteint que si les conditions précédentes sont fausses : `longueur < 12` n'est testé que pour une longueur d'au moins 8. Placer `longueur < 8` avant `longueur == 0` classerait le mot de passe vide en « faible »."
              },
              recap: [
                "Seul le premier bloc dont la condition est vraie s'exécute.",
                "Avec des seuils qui se chevauchent, teste du plus restrictif au plus large.",
                "Traite d'abord les cas invalides ou particuliers ; `else` vient en dernier.",
                "`0 <= p <= 1` est une comparaison enchaînée ; `==` est sensible à la casse."
              ],
              check: {
                type: 'logic',
                prompt: "Avec cette fonction, combien des valeurs suivantes donnent `\"probable\"` : 0.95, 0.5, 0.49, 0.9, -0.1, 0.75 ?",
                code: `def niveau(p):
    if p >= 0.9:
        return "sûr"
    elif p >= 0.5:
        return "probable"
    elif p >= 0:
        return "faible"
    else:
        return "invalide"`,
                answer: '2',
                mistakes: [
                  { answer: '3', why: "0.9 vérifie `p >= 0.9` : il est classé « sûr » et n'atteint jamais le premier `elif`." },
                  { answer: '4', why: "0.95 et 0.9 s'arrêtent au premier test (« sûr »). Seuls 0.5 et 0.75 donnent « probable »." }
                ],
                hint: "Pour chaque valeur, cherche la première condition vraie en partant du haut.",
                explain: "0.95 et 0.9 : « sûr ». 0.5 et 0.75 : « probable » (0.5 est inclus grâce à `>=`). 0.49 : « faible ». -0.1 : « invalide ». Il y a donc 2 valeurs « probable »."
              }
            },
            {
              id: 'py.u4.l2',
              title: 'Vrai, faux, None : and, or, is',
              minutes: 7,
              objective: "Tu sais prévoir une condition qui utilise des valeurs vides, `and` / `or`, `None` et `is`, et éviter le piège `x == \"a\" or \"b\"`.",
              explain: `Dans un \`if\`, toute valeur est vraie ou fausse. Sont **fausses** : \`False\`, \`0\`, \`0.0\`, \`""\`, \`[]\`, \`{}\` et \`None\`. Tout le reste est vrai, même \`"0"\` ou \`" "\`. Ainsi, \`if nom:\` teste que \`nom\` n'est pas vide.

\`and\` et \`or\` s'arrêtent dès que le résultat est connu et renvoient **l'une des deux valeurs**, pas forcément un booléen : \`"" or "anonyme"\` vaut \`"anonyme"\`. Attention, \`x or defaut\` remplace aussi \`0\` et \`""\`.

Piège classique : \`reponse == "oui" or "o"\` se lit \`(reponse == "oui") or "o"\`, qui est toujours vrai. Écris \`reponse == "oui" or reponse == "o"\`, ou \`reponse in ["oui", "o"]\`.

\`==\` compare les valeurs ; \`is\` vérifie qu'il s'agit du **même objet**. Deux listes égales peuvent être deux objets distincts. Réserve \`is\` à \`None\` : \`if resultat is None:\`.`,
              example: {
                code: `saisie = ""
nom = saisie or "anonyme"
print(nom, bool([]), bool("0"))
a = [0.9, 0.8]
b = [0.9, 0.8]
print(a == b, a is b)
resultat = None
print(resultat is None)
reponse = "non"
print(reponse == "oui" or "o")`,
                output: `anonyme False True
True False
True
o`,
                notes: [
                  { line: 2, text: "`saisie` est vide donc fausse : `or` renvoie la seconde valeur." },
                  { line: 6, text: "Mêmes valeurs, mais deux listes distinctes en mémoire : `==` vaut True, `is` vaut False." },
                  { line: 8, text: "La bonne façon de tester l'absence de valeur." },
                  { line: 10, text: "`reponse == \"oui\"` est False, donc `or` renvoie `\"o\"`, une valeur vraie : un `if` passerait toujours." }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: "Qu'affiche ce programme ?",
                  code: `print(0 or 5, 3 and 0, "" or None)
print(bool([]), bool([0]), bool(" "))`,
                  answer: `5 0 None
False True True`,
                  mistakes: [
                    { answer: `True False False
False True True`, why: "`and` et `or` renvoient l'une des valeurs, pas un booléen : `0 or 5` vaut 5." },
                    { answer: `5 0 None
False False False`, why: "`[0]` est une liste non vide (elle contient un élément) et `\" \"` un texte non vide : les deux sont vrais." }
                  ],
                  hint: "`or` renvoie la première valeur vraie (sinon la dernière) ; `and` la première valeur fausse (sinon la dernière).",
                  explain: "`0 or 5` : 0 est faux, on renvoie 5. `3 and 0` : 3 est vrai, on renvoie 0. `\"\" or None` : les deux sont faux, on renvoie le dernier, None. Seuls les conteneurs vides sont faux : `[0]` et `\" \"` sont vrais."
                },
                {
                  type: 'bug',
                  prompt: "Ce code devrait afficher `Annulé` quand la réponse est `non`, mais il lance le téléchargement. Clique sur la ligne fautive.",
                  code: `reponse = "non"
if reponse == "oui" or "o":
    print("Téléchargement lancé")
else:
    print("Annulé")`,
                  bugLine: 2,
                  why: "La condition se lit `(reponse == \"oui\") or \"o\"`. Quand la première partie est fausse, `or` renvoie `\"o\"`, un texte non vide donc vrai : le `if` passe toujours.",
                  fixes: [
                    'if reponse == "oui" or reponse == "o":',
                    'if reponse == ("oui" or "o"):',
                    'if reponse == "oui" and "o":'
                  ],
                  fixAnswer: 0,
                  fixWhy: {
                    1: "`(\"oui\" or \"o\")` vaut `\"oui\"` : la condition ne teste plus que \"oui\", et la réponse \"o\" serait refusée.",
                    2: "`and` ne compare toujours pas `reponse` à \"o\" : la réponse \"o\" donnerait False et serait refusée."
                  },
                  output: `Annulé`,
                  hint: "Ajoute des parenthèses selon les priorités : que vaut chaque côté du `or` ?",
                  explain: "Chaque comparaison doit être complète : `reponse == \"oui\" or reponse == \"o\"`. Une écriture plus courte et équivalente est `reponse in [\"oui\", \"o\"]`."
                }
              ],
              challenge: {
                type: 'logic',
                prompt: "Parmi ces 7 valeurs, combien sont considérées comme fausses dans un `if` : `0`, `\"0\"`, `[]`, `[[]]`, `0.0`, `\" \"`, `None` ?",
                answer: '4',
                mistakes: [
                  { answer: '5', why: "Un texte non vide est vrai, même `\"0\"` ou `\" \"`, et `[[]]` contient un élément. Seuls `0`, `[]`, `0.0` et `None` sont faux." },
                  { answer: '6', why: "`\"0\"` et `\" \"` contiennent un caractère, `[[]]` contient un élément (une liste vide) : ces trois valeurs sont vraies." },
                  { answer: '3', why: "`0.0` est faux comme `0` : un nombre nul est faux, qu'il soit entier ou flottant." }
                ],
                hint: "Une valeur est fausse si c'est zéro, un conteneur vide ou None. Regarde ce que contient chaque texte et chaque liste.",
                explain: "Fausses : `0`, `[]`, `0.0`, `None`. Vraies : `\"0\"` et `\" \"` (textes d'un caractère) et `[[]]` (liste qui contient un élément). Réponse : 4."
              },
              recap: [
                "Sont fausses : `False`, `0`, `0.0`, `\"\"`, `[]`, `{}`, `None` ; tout le reste est vrai.",
                "`and` et `or` renvoient l'une des deux valeurs et s'arrêtent dès que possible.",
                "`x == \"a\" or \"b\"` est toujours vrai : répète la comparaison ou utilise `in`.",
                "`==` compare les valeurs, `is` l'identité : réserve `is` à `None`."
              ],
              check: {
                type: 'code',
                prompt: "`lire_option` lit une option de configuration ; `valeur` vaut `None` si l'option est absente. La fonction doit renvoyer `defaut` **seulement** dans ce cas : `0`, `\"\"` et `False` sont des choix valides. Corrige-la.",
                starter: `def lire_option(valeur, defaut):
    return valeur or defaut
`,
                solution: `def lire_option(valeur, defaut):
    if valeur is None:
        return defaut
    return valeur
`,
                tests: [
                  { code: 'assert lire_option(None, 0.7) == 0.7', label: 'lire_option(None, 0.7) renvoie 0.7' },
                  { code: 'assert lire_option(0, 0.7) == 0', label: 'lire_option(0, 0.7) renvoie 0' },
                  { code: 'assert lire_option(0.2, 0.7) == 0.2', label: 'lire_option(0.2, 0.7) renvoie 0.2' },
                  { code: 'assert lire_option("", "fr") == ""', label: 'lire_option("", "fr") renvoie ""' }
                ],
                hint: "`or` remplace toute valeur fausse. Quel test vise uniquement l'absence de valeur ?",
                explain: "`valeur or defaut` remplace aussi 0 et \"\" : une température de 0 (réponses déterministes d'un modèle de langage) serait ignorée. `valeur is None` ne vise que l'absence de valeur : c'est l'usage recommandé de `is`."
              }
            }
          ]
        }
      ]
    }
  ]
});
