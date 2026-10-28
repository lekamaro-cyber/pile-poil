// CodeQuest — parcours « Data science et IA » (data), chapitre 3 « Maths utiles » : data.u8 à data.u10.
(function () {
  var units = [];

  // ---------- data.u8 Statistiques descriptives ----------
  units.push({
    id: 'data.u8',
    title: 'Statistiques descriptives',
    summary: "Résumer une série de nombres avec la moyenne, la médiane et l'écart-type, codés à la main.",
    lessons: [{
      id: 'data.u8.l1',
      title: 'Résumer une série de nombres',
      minutes: 8,
      objective: "Tu sais coder la moyenne, la médiane et l'écart-type, et choisir la mesure adaptée à des données.",
      explain: "Résumer une colonne en deux ou trois nombres est la première chose à faire sur des données.\n\n" +
        "- **moyenne** : somme divisée par le nombre de valeurs. Elle est sensible aux valeurs extrêmes : un seul très gros salaire la tire vers le haut ;\n" +
        "- **médiane** : la valeur du milieu de la liste triée (la moyenne des deux valeurs du milieu si leur nombre est pair). Elle résiste aux extrêmes ;\n" +
        "- **écart-type** : la dispersion autour de la moyenne. On fait la moyenne des carrés des écarts à la moyenne (la **variance**), puis on prend sa racine carrée pour revenir à l'unité des données.\n\n" +
        "Il existe deux écarts-types : divisé par `n` (population, le défaut de NumPy) ou par `n - 1` (échantillon, le défaut de pandas). Sur peu de valeurs, ils diffèrent nettement.\n\n" +
        "Le module `statistics` fournit `mean` et `median` ; ici, tu les codes toi-même pour savoir exactement ce qu'ils calculent.",
      example: {
        code: `import math

def moyenne(xs):
    return sum(xs) / len(xs)

def ecart_type(xs):
    m = moyenne(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / len(xs))

notes = [8, 10, 12, 14, 16]
print(moyenne(notes))
print(round(ecart_type(notes), 3))`,
        output: `12.0
2.828`,
        notes: [
          { line: 4, text: "La moyenne : somme divisée par le nombre de valeurs. `/` donne toujours un flottant." },
          { line: 8, text: "Écarts au carré (16, 4, 0, 4, 16), leur moyenne (8), puis la racine : environ 2.83." },
          { line: 12, text: "`round(..., 3)` limite l'affichage à 3 décimales." }
        ]
      },
      exercises: [
        {
          type: 'fill',
          prompt: "Complète la fonction `mediane`. Elle ne doit pas modifier la liste reçue.",
          code: `def mediane(xs):
    t = ___(xs)
    n = len(t)
    if n % 2 == 1:
        return t[___]
    return (t[n // 2 - 1] + t[n // 2]) / 2

print(mediane([7, 1, 3]), mediane([4, 1, 3, 2]))`,
          blanks: [
            { answers: ['sorted'], options: ['sorted', 'list', 'reversed'],
              why: { 'list': "`list(xs)` copie la liste sans la trier : la valeur du milieu ne serait pas la médiane.", 'reversed': "`reversed` inverse l'ordre sans trier." } },
            { answers: ['n // 2', 'n//2'],
              why: { 'n / 2': "`/` donne un flottant (1.5) : un indice de liste doit être un entier.", 'n // 2 + 1': "Les indices commencent à 0 : pour 3 valeurs, le milieu est l'indice 1, soit `3 // 2`." } }
          ],
          output: `3 2.5`,
          hint: "Il faut d'abord une copie triée, puis l'indice du milieu, qui doit être un entier.",
          explain: "`sorted` renvoie une copie triée sans toucher à la liste d'origine, contrairement à `xs.sort()`. Pour [1, 3, 7], l'indice du milieu est `3 // 2 = 1`. Pour 4 valeurs, on fait la moyenne des indices 1 et 2 : (2 + 3) / 2 = 2.5."
        },
        {
          type: 'qcm',
          prompt: "Les salaires mensuels d'une petite équipe sont `[1800, 1900, 2000, 2100, 50000]` (le dernier est celui du fondateur). Quelle valeur décrit le mieux le salaire « typique » ?",
          choices: ["La moyenne, 11 560", "La médiane, 2 000", "Le maximum, 50 000", "L'écart-type"],
          answer: 1,
          why: {
            0: "Un seul salaire extrême tire la moyenne à 11 560, alors que 4 personnes sur 5 gagnent environ 2 000.",
            2: "Le maximum décrit une seule personne, la plus éloignée du cas typique.",
            3: "L'écart-type mesure la dispersion des salaires, pas une valeur typique."
          },
          hint: "Quelle mesure ne bouge presque pas si le dernier salaire passe de 50 000 à 500 000 ?",
          explain: "La médiane est la valeur du milieu : elle ne dépend pas de l'ampleur des extrêmes. Quand la moyenne et la médiane divergent fortement, c'est le signe de valeurs extrêmes : un réflexe à avoir sur chaque colonne."
        }
      ],
      challenge: {
        type: 'bug',
        prompt: "Ce code devrait afficher l'écart-type de la série, 2.0, mais il affiche 0.0 pour n'importe quelle liste. Clique sur la ligne fautive.",
        code: `import math

def ecart_type(xs):
    m = sum(xs) / len(xs)
    total = sum(x - m for x in xs)
    return math.sqrt(total / len(xs))

print(ecart_type([2, 4, 4, 4, 5, 5, 7, 9]))`,
        bugLine: 5,
        why: "Les écarts à la moyenne se compensent : les positifs annulent exactement les négatifs, et leur somme vaut toujours 0. L'écart-type élève chaque écart au carré avant d'additionner, pour que tous comptent positivement.",
        fixes: [
          `    total = sum((x - m) ** 2 for x in xs)`,
          `    total = sum(abs(x - m) for x in xs)`,
          `    total = sum(x ** 2 - m for x in xs)`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "Avec des valeurs absolues, les écarts ne s'annulent plus, mais ce n'est pas la formule de l'écart-type : le résultat (environ 1.22) ne correspond à aucune mesure usuelle.",
          2: "Il faut élever au carré l'écart `x - m`, pas la valeur `x` seule : la formule serait fausse."
        },
        output: `2.0`,
        hint: "Calcule à la main la somme des écarts `x - m` pour une petite liste comme [1, 3].",
        explain: "Avec `(x - m) ** 2`, chaque écart compte positivement : 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32. Divisé par 8, cela donne une variance de 4, dont la racine vaut 2.0."
      },
      recap: [
        "Moyenne : somme / nombre de valeurs ; sensible aux valeurs extrêmes.",
        "Médiane : valeur du milieu de la liste triée ; résiste aux extrêmes.",
        "Écart-type : racine de la moyenne des carrés des écarts à la moyenne.",
        "Division par `n` (population) ou `n - 1` (échantillon) : NumPy et pandas n'ont pas le même défaut.",
        "Si la moyenne et la médiane divergent, cherche les valeurs extrêmes."
      ],
      check: {
        type: 'code',
        prompt: "Écris `resume(xs)` qui renvoie un dictionnaire `{'moyenne': ..., 'mediane': ..., 'ecart_type': ...}` pour une liste non vide de nombres. L'écart-type est celui de la population (division par `n`). Arrondis chaque valeur à 2 décimales avec `round`, et n'utilise pas le module `statistics`.",
        starter: `import math

def resume(xs):
    # ton code ici
    return {'moyenne': 0, 'mediane': 0, 'ecart_type': 0}
`,
        solution: `import math

def resume(xs):
    n = len(xs)
    moyenne = sum(xs) / n
    t = sorted(xs)
    if n % 2 == 1:
        mediane = t[n // 2]
    else:
        mediane = (t[n // 2 - 1] + t[n // 2]) / 2
    ecart = math.sqrt(sum((x - moyenne) ** 2 for x in xs) / n)
    return {'moyenne': round(moyenne, 2), 'mediane': round(mediane, 2), 'ecart_type': round(ecart, 2)}
`,
        tests: [
          { code: `assert resume([2, 4, 4, 4, 5, 5, 7, 9]) == {'moyenne': 5.0, 'mediane': 4.5, 'ecart_type': 2.0}`, label: "resume([2, 4, 4, 4, 5, 5, 7, 9]) : moyenne 5.0, médiane 4.5, écart-type 2.0" },
          { code: `assert resume([8, 10, 12, 14, 16]) == {'moyenne': 12.0, 'mediane': 12, 'ecart_type': 2.83}`, label: "resume([8, 10, 12, 14, 16]) : écart-type arrondi à 2.83" },
          { code: `r = resume([1800, 1900, 2000, 2100, 50000])
assert r['moyenne'] == 11560.0 and r['mediane'] == 2000`, label: "un salaire extrême tire la moyenne, pas la médiane" },
          { code: `donnees = [3, 1, 2]
resume(donnees)
assert donnees == [3, 1, 2]`, label: "la liste reçue n'est pas modifiée" }
        ],
        hint: "Enchaîne les trois calculs : la moyenne, la médiane sur une copie triée, puis la racine de la moyenne des carrés des écarts.",
        explain: "La fonction enchaîne les trois résumés. Sur les salaires, la moyenne (11 560) et la médiane (2 000) divergent fortement : c'est le signe d'une valeur extrême. Avec `round(..., 2)`, les comparaisons de flottants deviennent fiables."
      }
    }]
  });

  // ---------- data.u9 Probabilités ----------
  units.push({
    id: 'data.u9',
    title: 'Probabilités',
    summary: "Calculer une probabilité en dénombrant, l'estimer en simulant, et raisonner avec la probabilité conditionnelle et Bayes.",
    lessons: [{
      id: 'data.u9.l1',
      title: 'Compter, simuler, conditionner',
      minutes: 8,
      objective: "Tu sais calculer une probabilité par dénombrement, l'estimer par simulation et appliquer la formule de Bayes sur un exemple simple.",
      explain: "Une **probabilité** mesure la chance qu'un événement se produise, entre 0 et 1. Trois façons de l'obtenir :\n\n" +
        "- **dénombrer** : si tous les cas sont également probables, P = cas favorables / cas possibles. Avec deux dés, une boucle dans une boucle énumère les 36 cas ;\n" +
        "- **simuler** : répéter l'expérience des milliers de fois avec `random` et compter. La fréquence obtenue se rapproche de la probabilité quand le nombre d'essais grandit, mais elle varie d'une exécution à l'autre ;\n" +
        "- **conditionner** : P(A | B) = P(A et B) / P(B), la probabilité de A quand on sait déjà que B est vrai.\n\n" +
        "La formule de **Bayes** retourne une condition : P(A | B) = P(B | A) × P(A) / P(B). Elle explique pourquoi un test fiable donne surtout de fausses alertes quand la maladie est rare. Un classifieur qui renvoie une probabilité fait ce genre de calcul.",
      example: {
        code: `favorables = 0
total = 0
for d1 in range(1, 7):
    for d2 in range(1, 7):
        total += 1
        if d1 + d2 == 7:
            favorables += 1
print(favorables, "/", total)
print(round(favorables / total, 3))`,
        output: `6 / 36
0.167`,
        notes: [
          { line: 3, text: "Deux boucles imbriquées énumèrent les 36 couples (d1, d2), tous également probables." },
          { line: 6, text: "On compte les cas favorables : ceux dont la somme vaut 7." },
          { line: 9, text: "Probabilité = favorables / possibles = 6 / 36, environ 0.167." }
        ]
      },
      exercises: [
        {
          type: 'logic',
          prompt: "Une maladie touche 1 % d'une population de 10 000 personnes. Un test détecte 90 % des malades, mais il est aussi positif chez 5 % des personnes en bonne santé.\n\nParmi les personnes testées positives, quel pourcentage est réellement malade ? Donne un nombre entier (arrondi).",
          answer: '15',
          accept: ['15 %', '15%', '15,4', '15.4'],
          mistakes: [
            { answer: '90', why: "90 % est la proportion de malades détectés, P(positif | malade). La question demande l'inverse : P(malade | positif)." },
            { answer: '95', why: "95 % est la proportion de personnes saines correctement testées négatives ; ce n'est pas la question." }
          ],
          hint: "Compte des personnes : combien de malades, combien de positifs parmi eux, puis combien de faux positifs parmi les 9 900 personnes saines ?",
          explain: "100 malades donnent 90 vrais positifs ; 9 900 personnes saines donnent 495 faux positifs. Sur 585 positifs, seuls 90 sont malades : 90 / 585, environ 15 %. Quand un événement est rare, même un bon test produit surtout de fausses alertes."
        },
        {
          type: 'code',
          prompt: "Écris `proba_somme(cible)` qui renvoie la probabilité que la somme de deux dés à 6 faces soit égale à `cible`, en énumérant les 36 cas.",
          starter: `def proba_somme(cible):
    # ton code ici
    return 0
`,
          solution: `def proba_somme(cible):
    favorables = 0
    for d1 in range(1, 7):
        for d2 in range(1, 7):
            if d1 + d2 == cible:
                favorables += 1
    return favorables / 36
`,
          tests: [
            { code: `assert abs(proba_somme(7) - 6 / 36) < 1e-9`, label: "proba_somme(7) vaut 6/36" },
            { code: `assert abs(proba_somme(2) - 1 / 36) < 1e-9`, label: "proba_somme(2) vaut 1/36" },
            { code: `assert proba_somme(13) == 0`, label: "proba_somme(13) vaut 0" },
            { code: `assert abs(sum(proba_somme(s) for s in range(2, 13)) - 1) < 1e-9`, label: "les probabilités des sommes 2 à 12 totalisent 1" }
          ],
          hint: "Reprends la double boucle de l'exemple, mais compare la somme à `cible`.",
          explain: "Les 36 couples (d1, d2) sont également probables : la probabilité est le nombre de couples favorables divisé par 36. Pour 7, il y a 6 couples : (1, 6), (2, 5)… (6, 1). Le dernier test vérifie une propriété utile : les probabilités de tous les cas possibles font 1."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "On lance 4 fois un dé. La probabilité d'obtenir au moins un 6 vaut exactement `1 - (5 / 6) ** 4`, environ 0.518.\n\n" +
          "Écris `simuler(n)` qui répète `n` fois l'expérience avec `random.randint(1, 6)` et renvoie la **fréquence** des expériences qui contiennent au moins un 6 (un nombre entre 0 et 1). Les tests vérifient que ta fréquence est proche de la valeur exacte sur 10 000 essais.",
        starter: `import random

def simuler(n):
    reussites = 0
    # ton code ici
    return reussites
`,
        solution: `import random

def simuler(n):
    reussites = 0
    for _ in range(n):
        lancers = [random.randint(1, 6) for _ in range(4)]
        if 6 in lancers:
            reussites += 1
    return reussites / n
`,
        tests: [
          { code: `f = simuler(1000)
assert 0 <= f <= 1`, label: "renvoie une fréquence entre 0 et 1" },
          { code: `f = simuler(10000)
assert abs(f - (1 - (5 / 6) ** 4)) < 0.04`, label: "sur 10 000 essais, la fréquence est proche de 0.518" },
          { code: `assert simuler(1) in (0.0, 1.0)`, label: "avec un seul essai, la fréquence vaut 0 ou 1" }
        ],
        hint: "Pour chaque expérience, fais 4 lancers, puis teste si 6 fait partie des résultats.",
        explain: "Chaque expérience est un succès ou un échec ; la fréquence est le nombre de succès divisé par `n`. Elle change à chaque exécution, mais avec 10 000 essais elle s'écarte rarement de plus de 0,01 de la vraie probabilité. C'est pour cela que le test vérifie une propriété, et pas une valeur exacte."
      },
      recap: [
        "Dénombrer : cas favorables / cas possibles, quand tous les cas sont également probables.",
        "Simuler : la fréquence se rapproche de la probabilité quand le nombre d'essais grandit, mais elle varie.",
        "P(A | B) = P(A et B) / P(B) : on se restreint aux cas où B est vrai.",
        "Bayes : P(A | B) = P(B | A) × P(A) / P(B). Ne confonds jamais P(A | B) et P(B | A)."
      ],
      check: {
        type: 'fill',
        prompt: "Un filtre anti-spam sait que 20 % des mails sont des spams, que le mot « gratuit » apparaît dans 50 % des spams et dans 5 % des mails normaux. Complète le calcul de P(spam | « gratuit »).",
        code: `p_spam = 0.2
p_mot_si_spam = 0.5
p_mot_si_normal = 0.05

p_mot = p_spam * p_mot_si_spam + ___ * p_mot_si_normal
p_spam_si_mot = ___ / p_mot
print(round(p_mot, 2), round(p_spam_si_mot, 3))`,
        blanks: [
          { answers: ['(1 - p_spam)', '(1-p_spam)'],
            why: { '1 - p_spam': "Sans parenthèses, la multiplication passe avant la soustraction : on calculerait `1 - (p_spam * p_mot_si_normal)`.", 'p_spam': "Les mails normaux représentent la part `1 - p_spam` des mails, pas `p_spam`." } },
          { answers: ['p_spam * p_mot_si_spam', 'p_mot_si_spam * p_spam', 'p_spam*p_mot_si_spam', 'p_mot_si_spam*p_spam'],
            why: { 'p_mot_si_spam': "Il manque P(spam) : Bayes multiplie P(mot | spam) par P(spam).", 'p_spam': "Il manque P(mot | spam)." } }
        ],
        output: `0.14 0.714`,
        hint: "P(mot) additionne deux chemins : « spam et mot » ou « mail normal et mot ». Bayes divise ensuite le premier chemin par P(mot).",
        explain: "P(mot) = 0.2 × 0.5 + 0.8 × 0.05 = 0.14. Le chemin « spam et gratuit » vaut 0.1, donc P(spam | gratuit) = 0.1 / 0.14, environ 0.714. Un filtre bayésien naïf combine ce calcul sur de nombreux mots."
      }
    }]
  });

  // ---------- data.u10 Algèbre linéaire fondamentale ----------
  units.push({
    id: 'data.u10',
    title: 'Algèbre linéaire fondamentale',
    summary: "Vecteurs, produit scalaire et matrices en listes de listes : le langage de calcul des modèles.",
    lessons: [{
      id: 'data.u10.l1',
      title: 'Vecteurs et matrices en listes',
      minutes: 8,
      objective: "Tu sais coder le produit scalaire et le produit matrice-vecteur avec des listes, en vérifiant les dimensions.",
      explain: "Pour un modèle, une observation est un **vecteur** : une liste de nombres, ses caractéristiques (surface, pièces, étage). Un jeu de données est une **matrice** : une liste de lignes, une par observation.\n\n" +
        "- vecteurs : on les additionne élément par élément et on les multiplie par un nombre ;\n" +
        "- **produit scalaire** : u · v = u[0] × v[0] + u[1] × v[1] + … entre vecteurs de même longueur. C'est le calcul de base d'un neurone, et une mesure de ressemblance ;\n" +
        "- matrice : `M[i][j]` est l'élément de la ligne `i`, colonne `j` ; sa forme est (lignes, colonnes) ;\n" +
        "- **produit matrice-vecteur** M · v : le produit scalaire de chaque ligne de M avec v. Il faut autant de colonnes dans M que d'éléments dans v, et le résultat a autant d'éléments que M a de lignes.\n\n" +
        "En NumPy, ce produit s'écrit `M @ v`.",
      example: {
        code: `def produit_scalaire(u, v):
    return sum(a * b for a, b in zip(u, v))

M = [[1, 2, 0],
     [0, 1, 3]]
v = [3, 1, 2]
print(produit_scalaire([1, 2, 3], [4, 5, 6]))
print([produit_scalaire(ligne, v) for ligne in M])
print(len(M), "x", len(M[0]))`,
        output: `32
[5, 7]
2 x 3`,
        notes: [
          { line: 2, text: "`zip` associe les éléments de même position : 1×4 + 2×5 + 3×6 = 32." },
          { line: 4, text: "Une matrice est une liste de lignes : ici 2 lignes de 3 nombres." },
          { line: 8, text: "Produit matrice-vecteur : un produit scalaire par ligne, soit 3 + 2 + 0 = 5 et 0 + 1 + 6 = 7." },
          { line: 9, text: "La forme : nombre de lignes, puis nombre de colonnes (la longueur d'une ligne)." }
        ]
      },
      exercises: [
        {
          type: 'predict',
          prompt: "Qu'affiche ce programme ?",
          code: `M = [[1, 2, 3],
     [4, 5, 6]]
print(M[1][0])
print([ligne[2] for ligne in M])
print(len(M), len(M[0]))`,
          answer: `4
[3, 6]
2 3`,
          mistakes: [
            { answer: `2
[3, 6]
2 3`, why: "`M[1][0]` prend d'abord la ligne d'indice 1, `[4, 5, 6]`, puis l'élément d'indice 0 de cette ligne : 4. Le premier indice choisit la ligne, pas la colonne." },
            { answer: `4
[4, 5, 6]
2 3`, why: "`ligne[2]` prend le troisième élément de chaque ligne : on obtient la dernière colonne, [3, 6]." },
            { answer: `4
[3, 6]
3 2`, why: "`len(M)` compte les lignes (2) et `len(M[0])` les éléments d'une ligne, donc les colonnes (3)." }
          ],
          hint: "Une matrice en Python est une liste de lignes : le premier indice choisit la ligne.",
          explain: "`M[1]` est la deuxième ligne et `M[1][0]` son premier élément, 4. La compréhension extrait l'élément d'indice 2 de chaque ligne : c'est la troisième colonne. La forme est 2 lignes, 3 colonnes."
        },
        {
          type: 'fill',
          run: false,
          prompt: "Complète pour afficher la forme de `M`, puis le produit matrice-vecteur, en NumPy. (À essayer sur ton ordinateur : `pip install numpy`.)",
          code: `import numpy as np

M = np.array([[1, 2, 0],
              [0, 1, 3]])
v = np.array([3, 1, 2])
print(M.___)
print(M ___ v)`,
          blanks: [
            { answers: ['shape'], options: ['shape', 'len', 'size'],
              why: { 'len': "`len` est une fonction (`len(M)`), pas un attribut, et elle ne donne que le nombre de lignes.", 'size': "`M.size` donne le nombre total d'éléments, 6, pas la forme." } },
            { answers: ['@'], options: ['@', '*', '+'],
              why: { '*': "`*` multiplie élément par élément, en répétant v sur chaque ligne : on obtiendrait une matrice 2 x 3, pas le produit matrice-vecteur.", '+': "`+` additionne v à chaque ligne : ce n'est pas un produit." } }
          ],
          output: `(2, 3)
[5 7]`,
          hint: "Le produit matriciel a son propre opérateur en Python, différent de `*`.",
          explain: "`M.shape` vaut (2, 3) : 2 lignes, 3 colonnes. `M @ v` calcule le produit scalaire de chaque ligne avec v : 1×3 + 2×1 + 0×2 = 5 et 0×3 + 1×1 + 3×2 = 7, le même résultat que la compréhension de l'exemple."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "Le produit de deux matrices A (n lignes, k colonnes) et B (k lignes, m colonnes) est une matrice C de n lignes et m colonnes, où `C[i][j]` est le produit scalaire de la ligne `i` de A et de la colonne `j` de B.\n\nÉcris `mat_mat(A, B)`.",
        starter: `def mat_mat(A, B):
    # ton code ici
    return []
`,
        solution: `def mat_mat(A, B):
    colonnes = [[ligne[j] for ligne in B] for j in range(len(B[0]))]
    return [[sum(a * b for a, b in zip(ligne, col)) for col in colonnes] for ligne in A]
`,
        tests: [
          { code: `assert mat_mat([[1, 2], [3, 4]], [[5, 6], [7, 8]]) == [[19, 22], [43, 50]]`, label: "[[1, 2], [3, 4]] fois [[5, 6], [7, 8]] donne [[19, 22], [43, 50]]" },
          { code: `assert mat_mat([[1, 0], [0, 1]], [[2, 3], [4, 5]]) == [[2, 3], [4, 5]]`, label: "multiplier par la matrice identité ne change rien" },
          { code: `assert mat_mat([[1, 2, 3]], [[1], [0], [2]]) == [[7]]`, label: "une matrice 1 x 3 fois une matrice 3 x 1 donne [[7]]" },
          { code: `assert mat_mat([[2, 0, 1], [1, 1, 0]], [[1, 2], [0, 1], [3, 0]]) == [[5, 4], [1, 3]]`, label: "une matrice 2 x 3 fois une matrice 3 x 2 donne une matrice 2 x 2" }
        ],
        hint: "Construis d'abord la liste des colonnes de B : la colonne `j` est `[ligne[j] for ligne in B]`.",
        explain: "Une fois les colonnes de B extraites, chaque case du résultat est un produit scalaire ligne-colonne. Un réseau de neurones répète cette opération à chaque couche, sur des millions de nombres : NumPy et les cartes graphiques la font très vite."
      },
      recap: [
        "Une observation est un vecteur ; un jeu de données est une matrice (une liste de lignes).",
        "Produit scalaire : somme des produits élément par élément, entre vecteurs de même longueur.",
        "`M[i][j]` : ligne i, colonne j ; la forme est (lignes, colonnes).",
        "Produit matrice-vecteur : un produit scalaire par ligne ; NumPy l'écrit `M @ v`."
      ],
      check: {
        type: 'code',
        prompt: "Écris `mat_vec(M, v)` qui renvoie le produit de la matrice `M` (une liste de lignes) par le vecteur `v`. Si le nombre de colonnes de `M` ne correspond pas à la longueur de `v`, lève une `ValueError`.",
        starter: `def mat_vec(M, v):
    # ton code ici
    return []
`,
        solution: `def mat_vec(M, v):
    if len(M[0]) != len(v):
        raise ValueError("dimensions incompatibles")
    resultat = []
    for ligne in M:
        resultat.append(sum(a * b for a, b in zip(ligne, v)))
    return resultat
`,
        tests: [
          { code: `assert mat_vec([[1, 2], [3, 4]], [1, 1]) == [3, 7]`, label: "mat_vec([[1, 2], [3, 4]], [1, 1]) renvoie [3, 7]" },
          { code: `assert mat_vec([[2, 0, 1]], [1, 2, 3]) == [5]`, label: "une matrice d'une ligne donne un vecteur d'un élément" },
          { code: `try:
    mat_vec([[1, 2], [3, 4]], [1, 2, 3])
    ok = False
except ValueError:
    ok = True
assert ok`, label: "des dimensions incompatibles lèvent une ValueError" }
        ],
        hint: "Vérifie les dimensions avant tout calcul : `zip` s'arrête en silence à la liste la plus courte, il ne signalerait pas l'erreur.",
        explain: "Le test des dimensions est indispensable : sans lui, `zip` tronquerait sans prévenir et donnerait un résultat faux. Le résultat a une valeur par ligne de M. NumPy fait le même contrôle : `M @ v` lève une erreur si les formes ne correspondent pas."
      }
    }]
  });

  CQ.addChapter('data', { id: 'data.c3', title: 'Maths utiles', units: units });
})();
