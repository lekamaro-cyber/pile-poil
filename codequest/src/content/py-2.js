// CodeQuest — parcours Python, chapitre 2 « Répéter et manipuler » (unités py.u5 à py.u8).
CQ.addChapter('py', {
  id: 'py.c2',
  title: 'Répéter et manipuler',
  units: [
    // ---------------------------------------------------------------- py.u5
    {
      id: 'py.u5',
      title: 'Boucles for et while',
      summary: "Répéter une action sur chaque élément, ou tant qu'une condition tient, sans boucle infinie.",
      lessons: [
        {
          id: 'py.u5.l1',
          title: 'Parcourir avec for, range et enumerate',
          minutes: 7,
          objective: "Tu sais parcourir une séquence avec `for`, produire des nombres avec `range` (fin exclue) et accumuler un résultat : somme, compteur ou meilleur élément.",
          explain: `\`for x in sequence:\` prend chaque élément à tour de rôle : les éléments d'une liste, les caractères d'un texte, les nombres d'un \`range\`.

- \`range(fin)\` va de 0 à \`fin - 1\` ; \`range(debut, fin, pas)\` exclut toujours \`fin\` : \`range(10, 0, -3)\` donne 10, 7, 4, 1.
- Besoin du numéro et de l'élément ? \`for i, x in enumerate(liste, start=1):\` est plus clair que \`range(len(liste))\`.
- Deux listes en parallèle : \`for a, b in zip(liste1, liste2):\`.

Pour accumuler, initialise la variable **avant** la boucle (\`total = 0\`, \`compteur = 0\`) et mets-la à jour dedans. L'initialiser dans la boucle la remet à zéro à chaque tour.

Depuis PowerShell : \`foreach ($x in $liste)\` devient \`for x in liste:\`, mais \`1..5\` inclut 5 alors que \`range(1, 5)\` s'arrête à 4.`,
          example: {
            code: `pertes = [0.92, 0.61, 0.47, 0.40, 0.43]
meilleure = pertes[0]
for epoque, perte in enumerate(pertes, start=1):
    if perte < meilleure:
        meilleure = perte
    print(f"époque {epoque} : {perte}")
print("meilleure :", meilleure)
print(list(range(10, 0, -3)))`,
            output: `époque 1 : 0.92
époque 2 : 0.61
époque 3 : 0.47
époque 4 : 0.4
époque 5 : 0.43
meilleure : 0.4
[10, 7, 4, 1]`,
            notes: [
              { line: 2, text: "Le meilleur élément est initialisé avant la boucle, avec la première valeur." },
              { line: 3, text: "`enumerate(..., start=1)` fournit à chaque tour le numéro de l'époque et sa perte." },
              { line: 5, text: "Mise à jour seulement quand on trouve mieux." },
              { line: 8, text: "`range(10, 0, -3)` compte à rebours et s'arrête avant 0." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `for i in range(2, 11, 3):
    print(i, end=" ")`,
              answer: '2 5 8',
              mistakes: [
                { answer: '2 5 8 11', why: "`range` exclut toujours la fin : 11 n'est jamais produit." },
                { answer: '2 3 4 5 6 7 8 9 10', why: "Le troisième argument est le pas : on avance de 3 en 3." }
              ],
              hint: "Pars de 2, ajoute le pas, et arrête-toi avant d'atteindre 11.",
              explain: "`range(2, 11, 3)` produit 2, 5 et 8 : le nombre suivant serait 11, exclu car c'est la fin. `end=\" \"` remplace le retour à la ligne par une espace."
            },
            {
              type: 'bug',
              prompt: "Ce code doit compter les prédictions dont le score atteint 0.75 (il y en a 3), mais il affiche 1. Clique sur la ligne fautive.",
              code: `scores = [0.91, 0.42, 0.77, 0.88, 0.65]
nb_valides = 0
for s in scores:
    if s >= 0.75:
        nb_valides = 1
print(nb_valides, "prédictions au-dessus du seuil")`,
              bugLine: 5,
              why: "`nb_valides = 1` remet le compteur à 1 à chaque score valide au lieu de l'augmenter : on obtient 1 dès qu'il existe au moins un score valide.",
              fixes: [
                '        nb_valides += 1',
                '        nb_valides += s',
                '        nb_valides = nb_valides'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "On additionnerait les scores (2.56) au lieu de les compter.",
                2: "Cette ligne ne change rien : le compteur resterait à 0."
              },
              output: `3 prédictions au-dessus du seuil`,
              hint: "Un compteur doit grandir à chaque élément trouvé. Que fait cette ligne au deuxième score valide ?",
              explain: "`nb_valides += 1` ajoute 1 pour chaque score qui atteint le seuil : 0.91, 0.77 et 0.88 donnent 3. C'est le motif de l'accumulateur : initialisé avant la boucle, mis à jour dedans."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `meilleure_epoque(pertes)` : elle renvoie le **numéro** (à partir de 1) de l'époque où la perte est la plus basse. En cas d'égalité, garde la première. N'utilise ni `min` ni `index` : parcours la liste avec `for` et `enumerate`.",
            starter: `def meilleure_epoque(pertes):
    numero = 1
    # parcours les pertes et mets numero à jour
    return numero
`,
            solution: `def meilleure_epoque(pertes):
    numero = 1
    for i, perte in enumerate(pertes, start=1):
        if perte < pertes[numero - 1]:
            numero = i
    return numero
`,
            tests: [
              { code: 'assert meilleure_epoque([0.9, 0.5, 0.7]) == 2', label: 'meilleure_epoque([0.9, 0.5, 0.7]) renvoie 2' },
              { code: 'assert meilleure_epoque([0.3]) == 1', label: 'une seule époque : renvoie 1' },
              { code: 'assert meilleure_epoque([0.8, 0.6, 0.6, 0.4]) == 4', label: 'meilleure_epoque([0.8, 0.6, 0.6, 0.4]) renvoie 4' },
              { code: 'assert meilleure_epoque([0.5, 0.4, 0.4]) == 2', label: 'égalité : renvoie la première, 2' }
            ],
            checks: [
              { re: 'for\\s', label: 'Utilise une boucle for' },
              { re: 'enumerate', label: 'Utilise enumerate' }
            ],
            hint: "Garde le numéro du meilleur résultat vu jusqu'ici et compare chaque perte à la perte de ce numéro. Attention : les numéros commencent à 1, les indices à 0.",
            explain: "`enumerate(pertes, start=1)` donne le numéro « humain » de chaque époque. On ne met `numero` à jour que si la perte est **strictement** plus basse : en cas d'égalité, la première reste. `pertes[numero - 1]` convertit le numéro en indice."
          },
          recap: [
            "`for x in sequence:` parcourt listes, textes et `range`.",
            "`range(debut, fin, pas)` exclut toujours `fin`.",
            "`enumerate(liste, start=1)` donne le numéro et l'élément ; `zip` parcourt deux listes ensemble.",
            "Un accumulateur s'initialise avant la boucle et se met à jour dedans."
          ],
          check: {
            type: 'fill',
            prompt: "Complète pour calculer le temps de réponse moyen d'un serveur et compter les réponses lentes (plus de 100 ms). Résultat attendu : `126.25 2`.",
            code: `temps = [120, 95, 210, 80]
total = ___
lents = 0
for t in ___:
    total ___ t
    if t > 100:
        lents += 1
print(total / len(temps), lents)`,
            blanks: [
              {
                answers: ['0', '0.0'],
                why: {
                  '[]': "On additionne des nombres : le total part de 0, pas d'une liste vide.",
                  None: "`None + 120` lève une TypeError : un total part de 0."
                }
              },
              {
                answers: ['temps'],
                options: ['temps', 'range(temps)', 'len(temps)'],
                why: {
                  'range(temps)': "`range` attend un entier : TypeError: 'list' object cannot be interpreted as an integer.",
                  'len(temps)': "`len(temps)` vaut 4, un entier qu'on ne peut pas parcourir : TypeError: 'int' object is not iterable."
                }
              },
              {
                answers: ['+='],
                options: ['+=', '=', '=+'],
                why: {
                  '=': "`total = t` remplace le total par la valeur courante au lieu de l'additionner.",
                  '=+': "`total =+ t` se lit `total = +t` : le total est remplacé, pas augmenté."
                }
              }
            ],
            output: `126.25 2`,
            hint: "Un accumulateur part d'une valeur neutre, la boucle parcourt la liste elle-même, et la mise à jour ajoute la valeur courante.",
            explain: "Le total part de 0 et reçoit chaque temps (505 au total), d'où une moyenne de 505 / 4 = 126.25. Le compteur `lents` grandit pour 120 et 210. On parcourt directement la liste : pas besoin d'indices."
          }
        },
        {
          id: 'py.u5.l2',
          title: 'while, break et continue',
          minutes: 6,
          objective: "Tu sais écrire une boucle `while` qui s'arrête à coup sûr, et utiliser `break` et `continue` pour sortir d'une boucle ou passer au tour suivant.",
          explain: `\`while condition:\` répète son bloc tant que la condition est vraie. On l'utilise quand le nombre de tours n'est pas connu d'avance : entraîner jusqu'à ce que la perte passe sous un seuil, redemander une saisie jusqu'à ce qu'elle soit valide.

- La condition est testée **au début** de chaque tour. Si rien dans le bloc ne la rend fausse, la boucle est infinie (dans un terminal, Ctrl+C l'interrompt).
- Ajoute une limite de sécurité : \`while perte > 0.1 and epoque < 100:\`.
- \`break\` quitte la boucle immédiatement ; \`continue\` saute la fin du tour et passe au suivant.
- Motif courant : \`while True:\` avec un \`break\` quand la saisie est bonne.

\`break\` et \`continue\` fonctionnent aussi dans une boucle \`for\`.`,
          example: {
            code: `perte = 1.0
epoque = 0
while perte > 0.1 and epoque < 100:
    perte *= 0.6
    epoque += 1
print(epoque, round(perte, 4))
for ligne in ["x=1", "", "y=2", "FIN", "z=3"]:
    if ligne == "":
        continue
    if ligne == "FIN":
        break
    print("lu :", ligne)`,
            output: `5 0.0778
lu : x=1
lu : y=2`,
            notes: [
              { line: 3, text: "Deux conditions : la perte visée, et une limite d'époques au cas où elle ne serait jamais atteinte." },
              { line: 4, text: "La perte diminue à chaque tour : la condition finira par devenir fausse." },
              { line: 9, text: "`continue` ignore la ligne vide et passe à la suivante." },
              { line: 11, text: "`break` arrête tout à `FIN` : `z=3` n'est jamais lu." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre ce programme qui redemande un nombre tant qu'il n'est pas compris entre 1 et 10. L'utilisateur tape 15, puis 0, puis 7.",
              lines: [
                'while True:',
                '    n = int(input())',
                '    if 1 <= n <= 10:',
                '        break',
                '    print("Hors limites")',
                'print("Choisi :", n)'
              ],
              stdin: `15\n0\n7\n`,
              output: `Hors limites
Hors limites
Choisi : 7`,
              hint: "Le message « Hors limites » ne doit s'afficher que si on n'est pas sorti de la boucle.",
              explain: "`while True` répète sans fin ; seul `break` en sort, quand la saisie est valide. Le message vient après le `if` : il n'est atteint que pour 15 et 0. Le `print` final, hors de la boucle, s'exécute une fois sorti."
            },
            {
              type: 'logic',
              prompt: "Que vaut `total` à la fin de ce programme ?",
              code: `n = 0
total = 0
while total < 10:
    n += 1
    if n % 2 == 0:
        continue
    total += n`,
              answer: '16',
              mistakes: [
                { answer: '9', why: "Après l'ajout de 5, `total` vaut 9 : c'est encore moins que 10, donc la boucle continue (6 est sauté, puis 7 est ajouté)." },
                { answer: '25', why: "25 est la somme des impairs jusqu'à 9. Or la boucle s'arrête dès que `total` atteint 10 ou plus, juste après l'ajout de 7." }
              ],
              hint: "Seuls les nombres impairs sont ajoutés. Note `total` à la fin de chaque tour et repère quand la condition devient fausse.",
              explain: "Les nombres pairs sont sautés par `continue`. On ajoute 1, 3 et 5 (total 9, encore inférieur à 10), puis 7 : `total` vaut 16 et la condition `total < 10` est fausse au tour suivant."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Un planificateur divise le taux d'apprentissage par 2 à chaque palier. Complète `paliers(taux, seuil)` : elle renvoie le nombre de divisions nécessaires pour que `taux` devienne **strictement inférieur** à `seuil`. Si `taux` est déjà sous le seuil, elle renvoie 0. Utilise `while`.",
            starter: `def paliers(taux, seuil):
    nb = 0
    # divise taux par 2 tant que nécessaire
    return nb
`,
            solution: `def paliers(taux, seuil):
    nb = 0
    while taux >= seuil:
        taux /= 2
        nb += 1
    return nb
`,
            tests: [
              { code: 'assert paliers(0.1, 0.01) == 4', label: 'paliers(0.1, 0.01) renvoie 4' },
              { code: 'assert paliers(1, 0.2) == 3', label: 'paliers(1, 0.2) renvoie 3' },
              { code: 'assert paliers(0.005, 0.01) == 0', label: 'déjà sous le seuil : paliers(0.005, 0.01) renvoie 0' },
              { code: 'assert paliers(0.4, 0.1) == 3', label: "paliers(0.4, 0.1) renvoie 3 (0.1 n'est pas sous 0.1)" }
            ],
            checks: [
              { re: 'while\\s', label: 'Utilise une boucle while' }
            ],
            hint: "La condition de la boucle est l'inverse de la condition d'arrêt : on continue tant que `taux` n'est pas encore sous le seuil.",
            explain: "`while taux >= seuil` continue tant que le taux n'est pas strictement sous le seuil ; chaque tour divise et compte. Comme la condition est testée avant le premier tour, un taux déjà assez bas renvoie 0 sans entrer dans la boucle."
          },
          recap: [
            "`while` répète tant que la condition, testée au début de chaque tour, est vraie.",
            "Le bloc doit faire évoluer la condition ; ajoute une limite de sécurité si besoin.",
            "`break` sort de la boucle, `continue` passe au tour suivant.",
            "`while True:` + `break` : le motif classique pour redemander une saisie."
          ],
          check: {
            type: 'qcm',
            prompt: "Que fait ce programme ?",
            code: `i = 10
while i != 0:
    print(i)
    i -= 3`,
            run: false,
            choices: [
              "Il affiche 10, 7, 4, 1 puis s'arrête",
              "Il ne s'arrête jamais",
              "Il affiche 10, 7, 4, 1, -2 puis s'arrête",
              "Il lève une erreur quand i devient négatif"
            ],
            answer: 1,
            why: {
              0: "Après 1, `i` devient -2 : la condition `i != 0` reste vraie et la boucle continue.",
              2: "Rien n'arrête la boucle à -2 : `i` continue vers -5, -8… sans jamais valoir exactement 0.",
              3: "Un entier négatif est parfaitement valide : aucune erreur, la boucle tourne indéfiniment."
            },
            hint: "Écris les valeurs successives de `i`. L'une d'elles vaut-elle exactement 0 ?",
            explain: "`i` prend les valeurs 10, 7, 4, 1, -2, -5… et ne vaut jamais 0 : la condition `i != 0` reste vraie pour toujours. `while i > 0:` aurait été sûr. Ce programme n'est pas exécuté dans l'appli, justement parce qu'il ne s'arrête pas."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- py.u6
    {
      id: 'py.u6',
      title: 'Chaînes de caractères',
      summary: "Découper, nettoyer et assembler du texte : URL, saisies, données pour un modèle.",
      lessons: [
        {
          id: 'py.u6.l1',
          title: 'Indices, tranches et immutabilité',
          minutes: 6,
          objective: "Tu sais extraire une partie d'une chaîne avec les indices et les tranches (`s[debut:fin:pas]`), et tu sais qu'une chaîne ne se modifie pas : on en fabrique une nouvelle.",
          explain: `Une chaîne est une suite de caractères numérotés à partir de 0 : \`s[0]\` est le premier, \`s[-1]\` le dernier, \`len(s)\` la longueur. Un indice trop grand lève \`IndexError: string index out of range\`.

Une tranche \`s[debut:fin]\` va de \`debut\` à \`fin\` **exclu** ; un bord omis signifie « depuis le début » ou « jusqu'à la fin ». Le pas est optionnel : \`s[::-1]\` renverse la chaîne. Une tranche ne lève jamais d'erreur, même hors limites.

Les chaînes sont **immuables** : \`s[0] = "H"\` lève \`TypeError: 'str' object does not support item assignment\`. Les méthodes renvoient donc une nouvelle chaîne : \`s.upper()\` seul ne change rien, il faut écrire \`s = s.upper()\`.

\`"py" in s\` teste si un morceau de texte est présent.`,
          example: {
            code: `url = "https://exemple.fr/cours/python"
print(url[:5], url[-6:])
print(url[8:18])
print(url[::-1][:6])
fichier = "rapport.PDF"
fichier.lower()
print(fichier)
fichier = fichier.lower()
print(fichier, "pdf" in fichier)`,
            output: `https python
exemple.fr
nohtyp
rapport.PDF
rapport.pdf True`,
            notes: [
              { line: 2, text: "`[:5]` prend les 5 premiers caractères, `[-6:]` les 6 derniers." },
              { line: 3, text: "Le domaine commence à l'indice 8 (juste après `https://`) ; l'indice 18 est exclu." },
              { line: 6, text: "Le résultat de `lower()` n'est rangé nulle part : `fichier` ne change pas." },
              { line: 8, text: "On rattache le nom à la nouvelle chaîne : cette fois, elle est en minuscules." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `mot = "tokenisation"
print(mot[0], mot[-1], mot[5:])
print(mot[:5] + "s", len(mot[2:4]))`,
              answer: `t n isation
tokens 2`,
              mistakes: [
                { answer: `t n nisation
tokens 2`, why: "Les indices commencent à 0 : `mot[5]` est le sixième caractère, `i`." },
                { answer: `t n isation
tokens 3`, why: "La fin d'une tranche est exclue : `mot[2:4]` contient les indices 2 et 3, soit 2 caractères." }
              ],
              hint: "Numérote les lettres de `tokenisation` à partir de 0.",
              explain: "t(0) o(1) k(2) e(3) n(4) i(5)… : `mot[5:]` commence au `i`. `mot[:5]` vaut \"token\", d'où \"tokens\". `mot[2:4]` vaut \"ke\" : 2 caractères."
            },
            {
              type: 'qcm',
              prompt: "Que se passe-t-il quand on exécute ce code ?",
              code: `mdp = "secret"
mdp[0] = "S"
print(mdp)`,
              choices: [
                'Il affiche Secret',
                "Il lève TypeError: 'str' object does not support item assignment",
                'Il lève IndexError: string index out of range',
                'Il affiche S'
              ],
              answer: 1,
              why: {
                0: "Une chaîne ne peut pas être modifiée sur place, même d'un seul caractère.",
                2: "L'indice 0 existe bien : le problème n'est pas l'indice mais la modification.",
                3: "On ne remplace pas la chaîne entière : on essaie de changer un caractère, ce qui est interdit."
              },
              hint: "Peut-on changer un caractère à l'intérieur d'une chaîne existante ?",
              explain: "Les chaînes sont immuables : la ligne 2 lève une TypeError. Pour obtenir \"Secret\", on fabrique une nouvelle chaîne : `mdp = \"S\" + mdp[1:]`."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `masquer(numero)` : elle renvoie le numéro de carte où tous les caractères sont remplacés par `*`, sauf les 4 derniers. Un numéro de 4 caractères ou moins est renvoyé tel quel.",
            starter: `def masquer(numero):
    return numero
`,
            solution: `def masquer(numero):
    return "*" * (len(numero) - 4) + numero[-4:]
`,
            tests: [
              { code: 'assert masquer("1234567812345678") == "************5678"', label: 'masquer("1234567812345678") renvoie "************5678"' },
              { code: 'assert masquer("12345") == "*2345"', label: 'masquer("12345") renvoie "*2345"' },
              { code: 'assert masquer("1234") == "1234"', label: 'masquer("1234") renvoie "1234"' },
              { code: 'assert masquer("98") == "98"', label: 'masquer("98") renvoie "98"' }
            ],
            hint: "Deux morceaux à coller : une suite d'étoiles (combien ?) et une tranche des 4 derniers caractères.",
            explain: "`numero[-4:]` garde les 4 derniers caractères, et `\"*\" * (len(numero) - 4)` fabrique autant d'étoiles que de caractères masqués. On construit une nouvelle chaîne, puisque l'ancienne ne peut pas changer. Répéter un texte un nombre négatif de fois donne \"\", ce qui gère les numéros courts."
          },
          recap: [
            "`s[0]` est le premier caractère, `s[-1]` le dernier ; un indice hors limites lève IndexError.",
            "`s[debut:fin:pas]` exclut `fin` ; `s[::-1]` renverse ; une tranche ne lève jamais d'erreur.",
            "Les chaînes sont immuables : on en fabrique une nouvelle.",
            "Une méthode de chaîne renvoie un résultat : range-le (`s = s.lower()`)."
          ],
          check: {
            type: 'fill',
            prompt: "Complète pour obtenir l'extension du fichier en minuscules : `jpg`.",
            code: `nom_fichier = "photo_2026.JPG"
extension = nom_fichier[___:]
___
print(extension)`,
            blanks: [
              {
                answers: ['-3', '11'],
                why: {
                  '3': "`nom_fichier[3:]` part du quatrième caractère : on obtient \"to_2026.JPG\".",
                  '-4': "`[-4:]` garde aussi le point : \".JPG\"."
                }
              },
              {
                answers: ['extension = extension.lower()'],
                options: ['extension = extension.lower()', 'extension.lower()', 'lower(extension)', 'extension[0:] = extension.lower()'],
                why: {
                  'extension.lower()': "La nouvelle chaîne en minuscules n'est rangée nulle part : `extension` reste \"JPG\".",
                  'lower(extension)': "`lower` est une méthode des chaînes, pas une fonction : NameError: name 'lower' is not defined.",
                  'extension[0:] = extension.lower()': "On ne peut pas affecter une tranche de chaîne : TypeError: 'str' object does not support item assignment."
                }
              }
            ],
            output: `jpg`,
            hint: "Les 3 derniers caractères se prennent avec un indice négatif. Ensuite, souviens-toi qu'une méthode ne modifie pas la chaîne.",
            explain: "`nom_fichier[-3:]` donne \"JPG\" quelle que soit la longueur du nom (alors que `11` ne marche que pour ce nom-là). `extension.lower()` renvoie une nouvelle chaîne : il faut la ranger dans `extension` pour la garder."
          }
        },
        {
          id: 'py.u6.l2',
          title: 'Nettoyer et découper du texte',
          minutes: 7,
          objective: "Tu sais nettoyer et découper du texte avec `strip`, `lower`, `replace`, `split` et `join`, par exemple pour lire une URL ou préparer des données pour un modèle.",
          explain: `Les méthodes de chaîne renvoient toutes une **nouvelle** chaîne (ou une liste) :

- \`strip()\` enlève espaces et retours à la ligne aux deux bouts ; \`lower()\` et \`upper()\` changent la casse ;
- \`replace(a, b)\` remplace chaque \`a\` par \`b\` ;
- \`split(sep)\` découpe en liste. Sans argument, \`split()\` coupe sur tout blanc et ignore les espaces répétés, alors que \`split(" ")\` produit des chaînes vides ;
- \`sep.join(liste)\` fait l'inverse, mais la liste ne doit contenir que des chaînes ;
- \`startswith\`, \`endswith\`, \`find\` (indice, ou -1 si absent) et \`count\` inspectent sans modifier.

On les enchaîne de gauche à droite : \`texte.strip().lower().split()\` prépare une phrase pour un modèle de langage. C'est une version très simple de la « tokenisation ».`,
          example: {
            code: `url = "https://exemple.fr/recherche?q=python&page=2"
chemin, requete = url.split("?")
print(requete.split("&"))
phrase = "  Le modèle  APPREND vite\\n"
mots = phrase.strip().lower().split()
print(mots)
print("-".join(mots))
print("a  b".split(" "), url.endswith("page=2"))`,
            output: `['q=python', 'page=2']
['le', 'modèle', 'apprend', 'vite']
le-modèle-apprend-vite
['a', '', 'b'] True`,
            notes: [
              { line: 2, text: "`split(\"?\")` coupe en deux morceaux, rangés dans deux variables." },
              { line: 5, text: "Enchaînement : nettoyage, minuscules, puis découpage en mots (l'espace double est ignorée)." },
              { line: 7, text: "`join` recolle les mots avec le séparateur choisi." },
              { line: 8, text: "`split(\" \")` coupe à chaque espace : deux espaces de suite donnent une chaîne vide." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre ce programme qui extrait le nom et le domaine d'une adresse e-mail mal saisie, pour afficher `martin (exemple.fr)`.",
              lines: [
                'email = "  Lea.Martin@Exemple.FR "',
                'propre = email.strip().lower()',
                'utilisateur, domaine = propre.split("@")',
                'prenom, nom = utilisateur.split(".")',
                'print(f"{nom} ({domaine})")'
              ],
              output: `martin (exemple.fr)`,
              hint: "Chaque ligne utilise un nom créé par une ligne précédente : pars du texte brut.",
              explain: "On nettoie d'abord (espaces, majuscules), puis on découpe au `@`, puis au point. Découper avant de nettoyer laisserait des espaces et des majuscules dans les morceaux."
            },
            {
              type: 'bug',
              prompt: "Ce code doit compter les mots d'une saisie (il y en a 3), mais il en trouve 4. Clique sur la ligne fautive.",
              code: `saisie = "chat  chien oiseau"
mots = saisie.split(" ")
print(len(mots), "mots")`,
              bugLine: 2,
              why: "`split(\" \")` coupe à chaque espace : les deux espaces entre « chat » et « chien » produisent une chaîne vide, comptée comme un mot.",
              fixes: [
                'mots = saisie.split()',
                'mots = saisie.strip().split(" ")',
                'mots = saisie.replace(" ", "").split(" ")'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`strip()` n'enlève que les espaces aux deux bouts : l'espace double du milieu reste, on compte toujours 4 morceaux.",
                2: "Supprimer toutes les espaces colle les mots : \"chatchienoiseau\" ne donne plus qu'un seul morceau."
              },
              output: `3 mots`,
              hint: "Affiche `mots` : que contient la liste ?",
              explain: "Sans argument, `split()` coupe sur n'importe quelle suite de blancs (espaces, tabulations, retours à la ligne) et ne produit jamais de chaîne vide. C'est presque toujours ce qu'on veut pour découper des mots."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `slug(titre)` : elle transforme un titre en adresse web lisible (un « slug ») : sans espaces autour, en minuscules, avec les mots séparés par un seul tiret. Exemple : `\"  Mon Premier Modèle IA \"` donne `\"mon-premier-modèle-ia\"`.",
            starter: `def slug(titre):
    return titre.lower()
`,
            solution: `def slug(titre):
    return "-".join(titre.lower().split())
`,
            tests: [
              { code: 'assert slug("  Mon Premier Modèle IA ") == "mon-premier-modèle-ia"', label: 'slug("  Mon Premier Modèle IA ") renvoie "mon-premier-modèle-ia"' },
              { code: 'assert slug("Python") == "python"', label: 'slug("Python") renvoie "python"' },
              { code: 'assert slug("Data   Science  2026") == "data-science-2026"', label: 'les espaces multiples donnent un seul tiret' }
            ],
            hint: "Découpe en mots avec la bonne version de `split`, puis recolle-les avec `join`.",
            explain: "`split()` sans argument ignore les blancs aux bords et les espaces multiples ; `\"-\".join(...)` recolle les mots avec un tiret. Une ligne suffit, car chaque méthode renvoie une nouvelle valeur sur laquelle on enchaîne."
          },
          recap: [
            "`strip`, `lower`, `replace` renvoient une nouvelle chaîne : enchaîne-les ou range le résultat.",
            "`split()` sans argument découpe proprement les mots ; `split(\" \")` crée des chaînes vides.",
            "`sep.join(liste)` recolle une liste de chaînes (et uniquement de chaînes).",
            "`find` renvoie -1 si le morceau est absent ; `startswith` et `endswith` testent les bords."
          ],
          check: {
            type: 'predict',
            prompt: "Qu'affiche ce programme ?",
            code: `ligne = "id;nom;score\\n"
champs = ligne.strip().split(";")
print(len(champs), champs[-1])
print(ligne.count(";"), ligne.find("nom"), ligne.find("date"))`,
            answer: `3 score
2 3 -1`,
            mistakes: [
              { answer: `3 score
2 4 -1`, why: "Les indices commencent à 0 : \"id;\" occupe les indices 0 à 2, donc \"nom\" commence à l'indice 3." },
              { answer: `3 score
2 3 None`, why: "Quand le morceau est absent, `find` renvoie -1, pas None." }
            ],
            hint: "`strip` retire le retour à la ligne final avant le découpage. Pour `find`, compte les positions à partir de 0.",
            explain: "Après `strip()`, `split(\";\")` donne 3 champs, dont le dernier est \"score\". La ligne contient 2 points-virgules ; \"nom\" commence à l'indice 3 ; \"date\" est absent, donc `find` renvoie -1."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- py.u7
    {
      id: 'py.u7',
      title: 'Listes et tuples',
      summary: "Modifier des collections sans piège d'alias, et choisir le tuple pour les données fixes.",
      lessons: [
        {
          id: 'py.u7.l1',
          title: 'Listes : méthodes et compréhensions',
          minutes: 7,
          objective: "Tu sais modifier une liste avec ses méthodes (qui renvoient `None`), choisir entre `sort()` et `sorted()`, et construire une nouvelle liste avec une compréhension.",
          explain: `Une liste est **modifiable**. Ses méthodes la changent sur place et renvoient \`None\` :

- \`append(x)\` ajoute un élément ; \`extend(autre)\` ajoute tous les éléments d'une autre liste. \`l.append([4, 5])\` ajoute **une** liste comme un seul élément ;
- \`insert(i, x)\`, \`remove(x)\` (première occurrence), \`pop(i)\` (retire et renvoie l'élément, le dernier par défaut) ;
- \`sort()\` trie sur place. Piège : \`l = l.sort()\` remplace ta liste par \`None\`.

\`sorted(l)\` renvoie une **nouvelle** liste triée et laisse \`l\` intacte. Les deux acceptent \`reverse=True\` et \`key=\`, une fonction qui donne le critère de tri : \`sorted(mots, key=len)\`.

Une compréhension construit une nouvelle liste en une ligne : \`[expression for x in liste if condition]\`. Par exemple, \`[p for p in probas if p >= 0.5]\` filtre, et \`[round(s * 100) for s in scores]\` transforme.`,
          example: {
            code: `scores = [0.82, 0.95, 0.61]
scores.append(0.77)
scores.extend([0.58, 0.90])
meilleurs = sorted(scores, reverse=True)[:3]
print(meilleurs)
print(scores.sort())
print(scores)
pourcentages = [round(s * 100) for s in scores if s >= 0.75]
print(pourcentages)`,
            output: `[0.95, 0.9, 0.82]
None
[0.58, 0.61, 0.77, 0.82, 0.9, 0.95]
[77, 82, 90, 95]`,
            notes: [
              { line: 3, text: "`extend` ajoute les deux valeurs une par une : la liste a maintenant 6 éléments." },
              { line: 4, text: "`sorted` crée une nouvelle liste triée ; on en garde les 3 premiers éléments." },
              { line: 6, text: "`sort()` trie `scores` sur place et renvoie `None`." },
              { line: 8, text: "Compréhension : un filtre (`if`) et une transformation (`round(s * 100)`) en une ligne." }
            ]
          },
          exercises: [
            {
              type: 'logic',
              prompt: "Combien d'éléments contient `donnees` à la fin ?",
              code: `donnees = [1, 2, 3]
donnees.append([4, 5])
donnees.extend([6, 7])
donnees.insert(0, 0)`,
              answer: '7',
              mistakes: [
                { answer: '8', why: "`append([4, 5])` ajoute la liste `[4, 5]` comme **un seul** élément, pas deux." },
                { answer: '6', why: "`insert(0, 0)` ajoute bien un élément (le nombre 0) au début ; il ne remplace rien." }
              ],
              hint: "Compte ce que chaque méthode ajoute : un élément, ou plusieurs ?",
              explain: "3 éléments au départ, +1 avec `append` (la liste `[4, 5]` compte pour un), +2 avec `extend`, +1 avec `insert` : 7. La liste finale est `[0, 1, 2, 3, [4, 5], 6, 7]`."
            },
            {
              type: 'fill',
              prompt: "Complète pour garder les probabilités d'au moins 0.5, puis les afficher triées : `[0.66, 0.85, 0.97]`.",
              code: `probas = [0.12, 0.85, 0.40, 0.97, 0.66]
retenues = [p ___ p in probas ___ p >= 0.5]
print(___(retenues))`,
              blanks: [
                {
                  answers: ['for'],
                  options: ['for', 'while', 'if'],
                  why: {
                    while: "Une compréhension parcourt toujours avec `for`.",
                    if: "Le `if` vient après le `for`, pour filtrer."
                  }
                },
                {
                  answers: ['if'],
                  options: ['if', 'and', 'for'],
                  why: {
                    and: "Le filtre d'une compréhension s'écrit avec `if`.",
                    for: "Le parcours est déjà écrit ; ici, on filtre."
                  }
                },
                {
                  answers: ['sorted'],
                  options: ['sorted', 'sort', 'list'],
                  why: {
                    sort: "`sort` est une méthode (`retenues.sort()`), pas une fonction : NameError: name 'sort' is not defined.",
                    list: "`list(retenues)` copie la liste sans la trier : `[0.85, 0.97, 0.66]`."
                  }
                }
              ],
              output: `[0.66, 0.85, 0.97]`,
              hint: "Une compréhension se lit : « l'expression, pour chaque élément, si la condition ». Le tri qui renvoie une nouvelle liste est une fonction.",
              explain: "`[p for p in probas if p >= 0.5]` garde 0.85, 0.97 et 0.66 dans leur ordre d'origine. `sorted(...)` renvoie une nouvelle liste triée, qu'on peut afficher directement."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "`top_k(scores, k)` doit renvoyer les `k` meilleurs scores, du plus grand au plus petit, **sans modifier** la liste reçue. La version actuelle trie la liste de l'appelant. Corrige-la.",
            starter: `def top_k(scores, k):
    scores.sort(reverse=True)
    return scores[:k]
`,
            solution: `def top_k(scores, k):
    return sorted(scores, reverse=True)[:k]
`,
            tests: [
              { code: 'assert top_k([0.2, 0.9, 0.5, 0.7], 2) == [0.9, 0.7]', label: 'top_k([0.2, 0.9, 0.5, 0.7], 2) renvoie [0.9, 0.7]' },
              { code: 'l = [3, 1, 2]\ntop_k(l, 2)\nassert l == [3, 1, 2]', label: "la liste d'origine reste [3, 1, 2]" },
              { code: 'assert top_k([5], 3) == [5]', label: 'top_k([5], 3) renvoie [5]' }
            ],
            hint: "Quelle fonction trie en renvoyant une nouvelle liste, sans toucher à l'originale ?",
            explain: "`sorted` fabrique une copie triée : la liste de l'appelant n'est pas modifiée. Une fonction qui modifie en douce ses arguments crée des bugs difficiles à trouver, par exemple quand la même liste sert ensuite à une évaluation."
          },
          recap: [
            "`append`, `extend`, `insert`, `remove`, `sort` modifient la liste et renvoient `None`.",
            "`append([4, 5])` ajoute un seul élément ; `extend([4, 5])` en ajoute deux.",
            "`sorted(l)` renvoie une nouvelle liste ; `l = l.sort()` détruit ta liste.",
            "`[expr for x in l if cond]` filtre et transforme en une ligne."
          ],
          check: {
            type: 'qcm',
            prompt: "Tu veux garder `donnees` intacte et obtenir `propres` : les valeurs non nulles de `donnees`, mises au carré. Quelle ligne est correcte ?",
            choices: [
              'propres = [x ** 2 for x in donnees if x != 0]',
              'propres = donnees.remove(0)',
              'propres = [x ** 2 if x != 0 for x in donnees]',
              'propres = donnees.sort()'
            ],
            answer: 0,
            why: {
              1: "`remove` modifie `donnees`, ne retire que le premier 0 et renvoie `None` : `propres` vaudrait None.",
              2: "Un `if` de filtre se place après le `for`. Placé avant sans `else`, il donne SyntaxError: expected 'else' after 'if' expression.",
              3: "`sort()` trie `donnees` sur place et renvoie `None` : rien n'est filtré ni mis au carré."
            },
            hint: "Cherche la ligne qui fabrique une nouvelle liste, filtre et transforme à la fois.",
            explain: "La compréhension parcourt `donnees`, garde les `x` non nuls et range `x ** 2` dans une nouvelle liste. `donnees` n'est pas touchée, contrairement à ce que font les méthodes `remove` et `sort`."
          }
        },
        {
          id: 'py.u7.l2',
          title: 'Alias, copies et tuples',
          minutes: 8,
          objective: "Tu sais reconnaître quand deux noms désignent la même liste, la copier correctement, éviter de la modifier pendant qu'on la parcourt, et choisir un tuple pour des données fixes.",
          explain: `\`b = a\` ne copie pas une liste : \`a\` et \`b\` deviennent deux noms pour **le même objet** (un alias). Modifier par \`b\` modifie ce que voit \`a\`.

- Copier : \`a.copy()\`, \`a[:]\` ou \`list(a)\`. Ces copies sont « superficielles » : les listes imbriquées restent partagées. \`[[0] * 3] * 3\` crée même trois fois **la même** ligne ; écris \`[[0] * 3 for _ in range(3)]\`.
- Ne retire pas d'éléments d'une liste pendant que tu la parcours avec \`for\` : les éléments se décalent et certains sont sautés. Construis plutôt une nouvelle liste avec une compréhension.

Un **tuple** \`(x, y)\` est une séquence immuable : \`t[0] = 1\` lève \`TypeError: 'tuple' object does not support item assignment\`. Il convient aux données de taille fixe (coordonnées, couleur RGB, paire nom et score) et se dépaquette : \`r, g, b = pixel\`. Un tuple d'un seul élément s'écrit \`(5,)\`.`,
          example: {
            code: `train = [1, 2, 3]
alias = train
copie = train.copy()
alias.append(4)
print(train, copie)
grille = [[0] * 2] * 2
grille[0][0] = 9
print(grille)
pixel = (255, 128, 0)
r, g, b = pixel
print(r, type((5,)), type((5)))`,
            output: `[1, 2, 3, 4] [1, 2, 3]
[[9, 0], [9, 0]]
255 <class 'tuple'> <class 'int'>`,
            notes: [
              { line: 2, text: "Aucune copie : `alias` et `train` désignent la même liste." },
              { line: 4, text: "Ajouter par `alias` modifie `train`, mais pas `copie`." },
              { line: 7, text: "Les deux lignes de `grille` sont le même objet : modifier l'une modifie l'autre." },
              { line: 11, text: "C'est la virgule qui fait le tuple : `(5)` n'est qu'un entier entre parenthèses." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `point = (3, 4)
x, y = point
x += 1
print(point, x)
couleurs = [(255, 0, 0), (0, 0, 255)]
print(couleurs[1][2], len(couleurs[0]))`,
              answer: `(3, 4) 4
255 3`,
              mistakes: [
                { answer: `(4, 4) 4
255 3`, why: "Le dépaquetage range les valeurs dans `x` et `y` : rattacher `x` à 4 ne touche pas le tuple, qui est de toute façon immuable." },
                { answer: `(3, 4) 4
0 3`, why: "`couleurs[1]` est `(0, 0, 255)` ; son élément d'indice 2 est 255." }
              ],
              hint: "`x += 1` rattache le nom `x` à une nouvelle valeur. Pour `couleurs[1][2]`, prends d'abord l'élément 1 de la liste, puis l'élément 2 du tuple.",
              explain: "`x, y = point` range 3 et 4 dans deux noms indépendants ; `x += 1` rattache `x` à 4 sans toucher `point`. `couleurs[1][2]` lit le troisième élément du deuxième tuple : 255. Chaque tuple RGB a 3 éléments."
            },
            {
              type: 'code',
              prompt: "`nettoyer(mesures)` doit renvoyer une **nouvelle** liste sans les valeurs négatives (des erreurs de capteur), sans modifier la liste reçue. La version actuelle retire les éléments pendant le parcours et en oublie. Corrige-la.",
              starter: `def nettoyer(mesures):
    for m in mesures:
        if m < 0:
            mesures.remove(m)
    return mesures
`,
              solution: `def nettoyer(mesures):
    return [m for m in mesures if m >= 0]
`,
              tests: [
                { code: 'assert nettoyer([3, -1, -2, 5]) == [3, 5]', label: 'nettoyer([3, -1, -2, 5]) renvoie [3, 5]' },
                { code: 'assert nettoyer([-4, -4, 2]) == [2]', label: 'nettoyer([-4, -4, 2]) renvoie [2]' },
                { code: 'l = [1, -1]\nnettoyer(l)\nassert l == [1, -1]', label: "la liste d'origine n'est pas modifiée" },
                { code: 'assert nettoyer([]) == []', label: 'nettoyer([]) renvoie []' }
              ],
              hint: "Au lieu de retirer ce qui ne va pas, garde ce qui va dans une nouvelle liste.",
              explain: "Quand `remove` retire un élément, les suivants reculent d'une case alors que la boucle avance : l'élément qui suit est sauté. La compréhension construit une nouvelle liste sans jamais toucher à celle qu'on parcourt."
            }
          ],
          challenge: {
            type: 'bug',
            prompt: "Ce code doit afficher une grille de 3 × 3 points avec un `X` au centre, mais le `X` apparaît sur toutes les lignes. Clique sur la ligne fautive.",
            code: `plateau = [["."] * 3] * 3
plateau[1][1] = "X"
for ligne in plateau:
    print("".join(ligne))`,
            bugLine: 1,
            why: "`[...] * 3` répète **la même** liste intérieure trois fois : les trois lignes sont un seul objet, donc modifier `plateau[1]` modifie aussi les deux autres.",
            fixes: [
              'plateau = [["."] * 3 for _ in range(3)]',
              'plateau = list([["."] * 3] * 3)',
              'plateau = [["."] * 3].copy() * 3'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "`list(...)` copie la liste extérieure, mais ses trois éléments restent la même liste intérieure.",
              2: "`.copy()` copie la liste extérieure avant la répétition ; `* 3` répète ensuite toujours la même ligne."
            },
            output: `...
.X.
...`,
            hint: "Combien de listes intérieures distinctes existent vraiment en mémoire ?",
            explain: "La compréhension évalue `[\".\"] * 3` à chaque tour : elle crée trois lignes indépendantes. Ce piège touche toutes les matrices construites à la main : images, plateaux de jeu, tableaux de données."
          },
          recap: [
            "`b = a` crée un alias : une seule liste, deux noms.",
            "`a.copy()`, `a[:]`, `list(a)` copient, mais seulement le premier niveau.",
            "Ne retire pas d'éléments d'une liste que tu parcours : construis-en une nouvelle.",
            "Un tuple est immuable, se dépaquette (`x, y = point`) et s'écrit `(5,)` pour un seul élément."
          ],
          check: {
            type: 'logic',
            prompt: "Combien d'éléments contient `b` à la fin ?",
            code: `a = [1, 2, 3]
b = a
c = list(a)
b.append(4)
c.append(5)
a.append(6)`,
            answer: '5',
            mistakes: [
              { answer: '4', why: "`b` n'est pas une copie : c'est un autre nom pour la liste de `a`. L'ajout de 6 par `a` concerne donc aussi `b`." },
              { answer: '6', why: "`c` est une vraie copie (`list(a)`) : l'ajout de 5 dans `c` ne touche ni `a` ni `b`." }
            ],
            hint: "Combien de listes distinctes existent ? Quels noms désignent chacune ?",
            explain: "Il y a deux listes : celle que désignent `a` et `b` (alias), et la copie `c`. La première reçoit 4 puis 6 : `[1, 2, 3, 4, 6]`, soit 5 éléments. La copie devient `[1, 2, 3, 5]`."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- py.u8
    {
      id: 'py.u8',
      title: 'Dictionnaires et ensembles',
      summary: "Associer des clés à des valeurs, compter, dédoublonner et manipuler des données réelles.",
      lessons: [
        {
          id: 'py.u8.l1',
          title: 'Dictionnaires : clés, get et parcours',
          minutes: 7,
          objective: "Tu sais lire un dictionnaire sans `KeyError` grâce à `get`, compter des occurrences et parcourir clés et valeurs avec `items()`.",
          explain: `Un dictionnaire associe des **clés** à des valeurs : \`{"nom": "Ada", "score": 0.93}\`. C'est la forme d'un objet JSON renvoyé par une API, ou d'une table de hachage PowerShell \`@{nom = "Ada"}\`.

- \`d[cle]\` lève \`KeyError\` si la clé est absente ; \`d.get(cle)\` renvoie \`None\`, et \`d.get(cle, defaut)\` la valeur de secours choisie.
- \`cle in d\` teste les **clés**, pas les valeurs. \`d[cle] = valeur\` ajoute ou remplace.
- Compter : \`compte[x] = compte.get(x, 0) + 1\`.
- Parcourir : \`for cle, valeur in d.items():\`. L'ordre est celui d'insertion (garanti depuis Python 3.7).

Les clés doivent être immuables (str, int, tuple) : une liste comme clé lève \`TypeError: unhashable type: 'list'\`. Ajouter ou supprimer des clés pendant un parcours lève \`RuntimeError: dictionary changed size during iteration\`.`,
          example: {
            code: `reponse = {"statut": 200, "donnees": {"id": 7, "nom": "Ada"}}
print(reponse["donnees"]["nom"])
print(reponse.get("erreur"), reponse.get("erreur", "aucune"))
compte = {}
for mot in "le chat voit le chien le".split():
    compte[mot] = compte.get(mot, 0) + 1
print(compte)
for mot, n in compte.items():
    if n > 1:
        print(mot, n)`,
            output: `Ada
None aucune
{'le': 3, 'chat': 1, 'voit': 1, 'chien': 1}
le 3`,
            notes: [
              { line: 2, text: "Deux accès successifs pour descendre dans un dictionnaire imbriqué, comme dans une réponse JSON." },
              { line: 3, text: "`get` ne lève pas d'erreur : il renvoie None, ou la valeur de secours fournie." },
              { line: 6, text: "Le motif de comptage : 0 la première fois, puis +1 à chaque occurrence." },
              { line: 8, text: "`items()` donne les couples (clé, valeur), dans l'ordre d'insertion." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "`config = {\"modele\": \"mini-gpt\", \"epoques\": 10}`. Quelle expression vaut `0.001` quand la clé `\"taux\"` est absente, sans lever d'erreur ?",
              choices: [
                'config["taux"] or 0.001',
                'config.get("taux", 0.001)',
                'config.get("taux") == 0.001',
                'config.get(0.001, "taux")'
              ],
              answer: 1,
              why: {
                0: "`config[\"taux\"]` lève KeyError: 'taux' avant même que `or` soit évalué.",
                2: "`config.get(\"taux\")` vaut None : la comparaison donne False, pas 0.001.",
                3: "Les arguments sont inversés : on cherche la clé 0.001, absente, et on obtient la valeur de secours \"taux\"."
              },
              hint: "Quelle méthode accepte une valeur de secours en second argument ?",
              explain: "`get(cle, defaut)` renvoie la valeur si la clé existe, sinon `defaut`. C'est la façon standard de lire une configuration où certaines options sont facultatives."
            },
            {
              type: 'fill',
              prompt: "Complète pour compter les étiquettes d'un jeu d'entraînement : c'est ainsi qu'on repère des classes déséquilibrées.",
              code: `labels = ["chat", "chien", "chat", "oiseau", "chat"]
compte = {}
for l in labels:
    compte[l] = compte.___(l, ___) + 1
print(compte)`,
              blanks: [
                {
                  answers: ['get'],
                  options: ['get', 'items', 'keys'],
                  why: {
                    items: "`items()` ne prend pas d'argument et renvoie tous les couples, pas une valeur.",
                    keys: "`keys()` renvoie toutes les clés, pas la valeur associée à une clé."
                  }
                },
                {
                  answers: ['0'],
                  options: ['0', '1', 'None'],
                  why: {
                    '1': "Le `+ 1` compte déjà la première occurrence : partir de 1 donnerait 2 pour une étiquette vue une seule fois.",
                    None: "`None + 1` lève TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'."
                  }
                }
              ],
              output: `{'chat': 3, 'chien': 1, 'oiseau': 1}`,
              hint: "La première fois qu'on rencontre une étiquette, quelle valeur doit-on lire avant d'ajouter 1 ?",
              explain: "`compte.get(l, 0)` lit le compteur actuel, ou 0 pour une étiquette jamais vue ; on ajoute 1 et on range le résultat. Ici, 3 chats pour 1 chien et 1 oiseau : un jeu de données déséquilibré."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `parse_requete(texte)` : elle transforme la partie « requête » d'une URL, comme `\"q=python&page=2\"`, en dictionnaire `{\"q\": \"python\", \"page\": \"2\"}`. Les valeurs restent des textes. Un texte vide donne `{}`. Si une clé apparaît deux fois, la dernière valeur l'emporte.",
            starter: `def parse_requete(texte):
    resultat = {}
    # découpe aux "&", puis chaque morceau au "="
    return resultat
`,
            solution: `def parse_requete(texte):
    resultat = {}
    if texte == "":
        return resultat
    for morceau in texte.split("&"):
        cle, valeur = morceau.split("=")
        resultat[cle] = valeur
    return resultat
`,
            tests: [
              { code: 'assert parse_requete("q=python&page=2") == {"q": "python", "page": "2"}', label: 'parse_requete("q=python&page=2") renvoie {"q": "python", "page": "2"}' },
              { code: 'assert parse_requete("lang=fr") == {"lang": "fr"}', label: 'parse_requete("lang=fr") renvoie {"lang": "fr"}' },
              { code: 'assert parse_requete("") == {}', label: 'parse_requete("") renvoie {}' },
              { code: 'assert parse_requete("a=1&a=2") == {"a": "2"}', label: "clé répétée : la dernière valeur l'emporte" }
            ],
            hint: "Deux découpages successifs : d'abord entre les paramètres, puis entre clé et valeur. Pense au cas du texte vide.",
            explain: "`split(\"&\")` sépare les paramètres et `split(\"=\")` sépare clé et valeur. Attention : `\"\".split(\"&\")` donne `['']`, pas une liste vide, d'où le test du texte vide. Réaffecter une clé existante remplace sa valeur : la dernière l'emporte."
          },
          recap: [
            "`d[cle]` lève KeyError si la clé manque ; `d.get(cle, defaut)` ne lève jamais d'erreur.",
            "`cle in d` teste les clés, pas les valeurs.",
            "Compter : `compte[x] = compte.get(x, 0) + 1`.",
            "`for cle, valeur in d.items():` parcourt dans l'ordre d'insertion ; ne modifie pas les clés pendant ce parcours."
          ],
          check: {
            type: 'predict',
            prompt: "Qu'affiche ce programme ?",
            code: `stock = {"cpu": 4, "ram": 0, "ssd": 2}
print(stock.get("gpu", 0), "ram" in stock, 0 in stock)
for piece, n in stock.items():
    if not n:
        print("rupture :", piece)`,
            answer: `0 True False
rupture : ram`,
            mistakes: [
              { answer: `0 True True
rupture : ram`, why: "`in` teste les clés d'un dictionnaire, pas ses valeurs : 0 n'est pas une clé." },
              { answer: `None True False
rupture : ram`, why: "Quand la clé est absente, `get` renvoie la valeur de secours fournie (0), pas None." }
            ],
            hint: "Pour `in` sur un dictionnaire, regarde les clés. Dans la boucle, quelle valeur est fausse ?",
            explain: "\"gpu\" est absent : `get` renvoie 0. \"ram\" est une clé, 0 n'en est pas une. Dans la boucle, seule la valeur 0 est fausse : la RAM est en rupture."
          }
        },
        {
          id: 'py.u8.l2',
          title: 'Ensembles et données imbriquées',
          minutes: 8,
          objective: "Tu sais dédoublonner et comparer des collections avec un `set`, et parcourir une liste de dictionnaires comme un vrai jeu de données.",
          explain: `Un \`set\` (ensemble) contient des éléments **uniques**, sans ordre :

- \`set(liste)\` supprime les doublons ; \`len(set(liste))\` compte les valeurs distinctes ;
- \`x in s\` est très rapide, même sur un grand ensemble ;
- \`a | b\` (union), \`a & b\` (intersection), \`a - b\` (dans \`a\` mais pas dans \`b\`) ;
- \`s.add(x)\` ajoute un élément, qui doit être immuable (pas de liste).

Attention : \`{}\` crée un dictionnaire vide ; l'ensemble vide s'écrit \`set()\`. Et comme un set n'a pas d'ordre, affiche-le avec \`sorted(s)\`.

Les vraies données arrivent souvent en **liste de dictionnaires** (lignes d'un CSV, réponse JSON d'une API) : on les parcourt avec \`for\`, on lit les champs par leur clé, et on regroupe dans un dictionnaire de listes.`,
          example: {
            code: `images = [
    {"fichier": "a.png", "label": "chat"},
    {"fichier": "b.png", "label": "chien"},
    {"fichier": "c.png", "label": "chat"},
]
labels = set()
par_label = {}
for img in images:
    labels.add(img["label"])
    par_label[img["label"]] = par_label.get(img["label"], []) + [img["fichier"]]
print(sorted(labels), len(labels))
print(par_label)
print(type({}), sorted({"a", "b"} & {"b", "c"}))`,
            output: `['chat', 'chien'] 2
{'chat': ['a.png', 'c.png'], 'chien': ['b.png']}
<class 'dict'> ['b']`,
            notes: [
              { line: 1, text: "Un petit jeu de données : une liste de dictionnaires, un par image." },
              { line: 9, text: "`add` ignore les doublons : « chat » n'est stocké qu'une fois." },
              { line: 10, text: "Regroupement : la liste des fichiers de chaque étiquette, partie d'une liste vide la première fois." },
              { line: 13, text: "`{}` est un dictionnaire ; `&` garde les éléments communs aux deux ensembles." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre ce programme qui repère les fichiers en double d'un jeu de données. Il doit afficher les deux doublons, puis `3 fichiers uniques`.",
              lines: [
                'vus = set()',
                'for f in ["a.png", "b.png", "a.png", "c.png", "b.png"]:',
                '    if f in vus:',
                '        print("doublon :", f)',
                '    vus.add(f)',
                'print(len(vus), "fichiers uniques")'
              ],
              output: `doublon : a.png
doublon : b.png
3 fichiers uniques`,
              hint: "On teste si le fichier a déjà été vu **avant** de l'ajouter aux fichiers vus.",
              explain: "Pour chaque fichier, on vérifie d'abord s'il est dans `vus`, puis on l'ajoute. Si l'ajout passait avant le test, chaque fichier serait signalé comme doublon. `in` sur un set reste rapide même avec des millions de fichiers."
            },
            {
              type: 'qcm',
              prompt: "Que se passe-t-il quand on exécute ce code ?",
              code: `vus = {}
vus.add("a.png")
print(vus)`,
              choices: [
                "Il affiche {'a.png'}",
                "Il lève AttributeError: 'dict' object has no attribute 'add'",
                "Il affiche {'a.png': None}",
                "Il lève TypeError: unhashable type: 'dict'"
              ],
              answer: 1,
              why: {
                0: "Ce serait le cas avec `vus = set()` : `{}` ne crée pas un ensemble.",
                2: "Un dictionnaire n'a pas de méthode `add` : on y ajoute une clé avec `vus[cle] = valeur`.",
                3: "Rien n'est utilisé comme clé ici : l'erreur vient de la méthode `add`, qui n'existe pas sur un dictionnaire."
              },
              hint: "Quel type crée `{}` tout seul ?",
              explain: "`{}` crée un dictionnaire vide, qui n'a pas de méthode `add` : Python lève une AttributeError. L'ensemble vide s'écrit `set()`."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `moyenne_par_label(exemples)` : `exemples` est une liste de dictionnaires `{\"label\": ..., \"score\": ...}`. Elle renvoie un dictionnaire qui associe chaque étiquette à la moyenne de ses scores. Une liste vide donne `{}`.",
            starter: `def moyenne_par_label(exemples):
    resultat = {}
    # regroupe les scores par étiquette, puis calcule chaque moyenne
    return resultat
`,
            solution: `def moyenne_par_label(exemples):
    scores = {}
    for ex in exemples:
        scores[ex["label"]] = scores.get(ex["label"], []) + [ex["score"]]
    resultat = {}
    for label, valeurs in scores.items():
        resultat[label] = sum(valeurs) / len(valeurs)
    return resultat
`,
            tests: [
              { code: 'data = [{"label": "chat", "score": 1.0}, {"label": "chien", "score": 0.25}, {"label": "chat", "score": 0.5}]\nassert moyenne_par_label(data) == {"chat": 0.75, "chien": 0.25}', label: 'chat : 0.75, chien : 0.25' },
              { code: 'assert moyenne_par_label([{"label": "a", "score": 0.5}]) == {"a": 0.5}', label: 'un seul exemple : {"a": 0.5}' },
              { code: 'assert moyenne_par_label([]) == {}', label: 'liste vide : {}' }
            ],
            hint: "Deux étapes : d'abord un dictionnaire étiquette → liste de scores (comme dans l'exemple), puis un parcours avec `items()` pour calculer chaque moyenne.",
            explain: "On regroupe d'abord les scores par étiquette, puis on calcule chaque moyenne avec `sum` et `len`. C'est exactement le « group by » des outils de data, que tu retrouveras avec pandas."
          },
          recap: [
            "`set(liste)` dédoublonne ; `x in s` est rapide.",
            "`|` union, `&` intersection, `-` différence.",
            "`{}` est un dictionnaire vide ; l'ensemble vide s'écrit `set()`.",
            "Affiche un set avec `sorted(s)` : il n'a pas d'ordre.",
            "Un jeu de données = une liste de dictionnaires, qu'on parcourt et regroupe."
          ],
          check: {
            type: 'fill',
            prompt: "Complète pour trouver les visiteurs venus les deux jours, puis ceux venus seulement lundi.",
            code: `lundi = ["ada", "linus", "grace", "ada"]
mardi = ["grace", "alan", "linus"]
deux_jours = set(lundi) ___ set(mardi)
seulement_lundi = set(lundi) ___ set(mardi)
print(sorted(deux_jours), sorted(seulement_lundi))`,
            blanks: [
              {
                answers: ['&'],
                options: ['&', '|', '-', '+'],
                why: {
                  '|': "`|` est l'union : on obtiendrait tous les visiteurs des deux jours.",
                  '-': "`-` donne ceux du lundi absents le mardi : c'est le second calcul.",
                  '+': "`+` n'existe pas entre deux ensembles : TypeError: unsupported operand type(s) for +: 'set' and 'set'."
                }
              },
              {
                answers: ['-'],
                options: ['-', '&', '|', '+'],
                why: {
                  '&': "`&` donnerait les visiteurs communs, pas ceux du lundi seulement.",
                  '|': "`|` réunit tout le monde.",
                  '+': "`+` n'existe pas entre deux ensembles : TypeError."
                }
              }
            ],
            output: `['grace', 'linus'] ['ada']`,
            hint: "Intersection pour « les deux jours », différence pour « l'un mais pas l'autre ».",
            explain: "`set(lundi) & set(mardi)` garde les éléments présents des deux côtés ; `set(lundi) - set(mardi)` garde ceux du lundi absents le mardi. Le doublon « ada » disparaît dès la conversion en set, et `sorted` donne un affichage stable."
          }
        }
      ]
    }
  ]
});
