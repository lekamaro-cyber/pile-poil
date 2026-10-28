// CodeQuest — parcours Python, chapitre 3 « Structurer son code » (unités py.u9 à py.u11).
CQ.addChapter('py', {
  id: 'py.c3',
  title: 'Structurer son code',
  units: [
    // ---------------------------------------------------------------- py.u9
    {
      id: 'py.u9',
      title: 'Fonctions',
      summary: "Découper un programme en fonctions qui reçoivent des paramètres et renvoient des résultats.",
      lessons: [
        {
          id: 'py.u9.l1',
          title: 'Définir une fonction : paramètres et return',
          minutes: 7,
          objective: "Tu sais écrire une fonction qui reçoit des paramètres et **renvoie** son résultat avec `return` (au lieu de l'afficher), et l'appeler avec des arguments positionnels ou nommés.",
          explain: `\`def nom(param1, param2):\` définit une fonction ; l'appeler exécute son corps avec les arguments fournis.

\`return valeur\` arrête la fonction et **renvoie** la valeur à l'appelant, qui peut la ranger, la tester ou la combiner. \`print\` ne fait qu'afficher : une fonction sans \`return\` renvoie \`None\`. D'où le piège classique : \`print(f(x))\` affiche ce que \`f\` imprime, puis \`None\`.

- \`return mini, maxi\` renvoie un tuple, à dépaqueter : \`a, b = f(liste)\`.
- Un paramètre peut avoir une valeur par défaut : \`def f(x, seuil=0.5):\`.
- À l'appel, nommer les arguments rend le code lisible : \`f(x, seuil=0.8)\`.
- Une docstring (\`"""..."""\`) en première ligne décrit la fonction.

Différence avec PowerShell : là-bas, tout ce qui part sur la sortie est renvoyé ; en Python, seul ce qui suit \`return\` l'est.`,
          example: {
            code: `def precision(correctes, total):
    """Renvoie la proportion de prédictions correctes."""
    if total == 0:
        return 0.0
    return correctes / total

def afficher_precision(correctes, total):
    print(f"{precision(correctes, total):.1%}")

p = precision(45, 60)
print(p, precision(total=0, correctes=0))
resultat = afficher_precision(45, 60)
print(resultat)`,
            output: `0.75 0.0
75.0%
None`,
            notes: [
              { line: 4, text: "`return` arrête la fonction tout de suite : la ligne 5 n'est pas exécutée quand `total` vaut 0." },
              { line: 10, text: "Le résultat est rangé dans `p` et peut servir à d'autres calculs." },
              { line: 11, text: "Arguments nommés : leur ordre n'a plus d'importance." },
              { line: 13, text: "`afficher_precision` affiche mais ne renvoie rien : `resultat` vaut None." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `def double_print(x):
    print(x * 2)

def double_return(x):
    return x * 2

a = double_print(3)
b = double_return(3)
print(a, b)`,
              answer: `6
None 6`,
              mistakes: [
                { answer: '6 6', why: "`double_print` affiche 6 mais ne renvoie rien : `a` vaut None. Et ce 6 s'affiche sur sa propre ligne, au moment de l'appel." },
                { answer: 'None 6', why: "L'appel `double_print(3)` exécute `print(x * 2)` : 6 s'affiche d'abord, avant la dernière ligne." }
              ],
              hint: "Distingue ce qui s'affiche pendant les appels et ce que chaque fonction renvoie.",
              explain: "Ligne 7 : `double_print(3)` affiche 6 et renvoie None, rangé dans `a`. Ligne 8 : `double_return(3)` n'affiche rien et renvoie 6. La dernière ligne affiche donc `None 6`."
            },
            {
              type: 'code',
              prompt: "Complète `normaliser(valeurs)` : elle **renvoie** une nouvelle liste où chaque valeur `v` devient `(v - mini) / (maxi - mini)`, ce qui ramène les données entre 0 et 1 (préparation classique avant un entraînement). Si toutes les valeurs sont égales, elle renvoie une liste de `0.0`.",
              starter: `def normaliser(valeurs):
    mini = min(valeurs)
    maxi = max(valeurs)
    # renvoie la liste normalisée
`,
              solution: `def normaliser(valeurs):
    mini = min(valeurs)
    maxi = max(valeurs)
    if maxi == mini:
        return [0.0 for v in valeurs]
    return [(v - mini) / (maxi - mini) for v in valeurs]
`,
              tests: [
                { code: 'assert normaliser([2, 4, 6]) == [0.0, 0.5, 1.0]', label: 'normaliser([2, 4, 6]) renvoie [0.0, 0.5, 1.0]' },
                { code: 'assert normaliser([10, 0]) == [1.0, 0.0]', label: 'normaliser([10, 0]) renvoie [1.0, 0.0]' },
                { code: 'assert normaliser([5, 5]) == [0.0, 0.0]', label: 'valeurs égales : [0.0, 0.0], sans division par zéro' },
                { code: 'assert normaliser([3, 1]) is not None', label: 'la fonction renvoie un résultat (pas None)' }
              ],
              hint: "Traite d'abord le cas `maxi == mini` : que vaudrait le dénominateur ? Une compréhension construit ensuite la liste.",
              explain: "La compréhension calcule chaque valeur normalisée et `return` renvoie la liste à l'appelant. Le test `maxi == mini` évite `ZeroDivisionError: division by zero` quand toutes les valeurs sont identiques."
            }
          ],
          challenge: {
            type: 'bug',
            prompt: "`premier_negatif` doit renvoyer l'indice du premier nombre négatif, ou `None` s'il n'y en a pas. Pour `[3, 5, -2, 8]`, elle devrait renvoyer 2, mais renvoie None. Clique sur la ligne fautive.",
            code: `def premier_negatif(valeurs):
    for i, v in enumerate(valeurs):
        if v < 0:
            return i
        return None

print(premier_negatif([3, 5, -2, 8]))`,
            bugLine: 5,
            why: "`return None` est indenté dans la boucle : dès le premier élément (3, positif), la fonction s'arrête et renvoie None sans regarder la suite.",
            fixes: [
              '    return None',
              '        return -1',
              '        break'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "La ligne reste dans la boucle : la fonction renverrait -1 dès le premier élément positif.",
              2: "`break` arrête la boucle au premier élément ; la fonction se termine alors sans `return` et renvoie None."
            },
            output: `2`,
            hint: "À quel moment la fonction peut-elle conclure qu'il n'y a aucun nombre négatif ?",
            explain: "On ne peut conclure « aucun négatif » qu'après avoir parcouru **toute** la liste : le `return None` se place après la boucle, au niveau du corps de la fonction. Ici, c'est l'indentation qui décide du comportement."
          },
          recap: [
            "`return` renvoie une valeur utilisable ; `print` ne fait qu'afficher.",
            "Une fonction sans `return` renvoie `None`.",
            "`return` arrête la fonction immédiatement, même au milieu d'une boucle.",
            "Valeurs par défaut (`seuil=0.5`) et arguments nommés (`f(x, seuil=0.8)`) clarifient les appels."
          ],
          check: {
            type: 'fill',
            prompt: "Complète `remise` : le taux vaut 0.1 par défaut, et la fonction doit **renvoyer** le prix réduit, arrondi à 2 décimales. Résultat attendu : `97.0`.",
            code: `def remise(prix, taux___):
    ___ round(prix * (1 - taux), 2)

total = remise(80) + remise(50, taux=0.5)
print(total)`,
            blanks: [
              {
                answers: ['=0.1', '= 0.1'],
                why: {
                  '0.1': "Il manque le signe `=` : une valeur par défaut s'écrit `taux=0.1`.",
                  '==0.1': "`==` compare ; dans la ligne `def`, une valeur par défaut s'écrit avec un seul `=`."
                }
              },
              {
                answers: ['return'],
                options: ['return', 'print'],
                why: {
                  print: "`print` affiche sans renvoyer : `remise(80)` vaudrait None, et l'addition lèverait TypeError: unsupported operand type(s) for +: 'NoneType' and 'NoneType'."
                }
              }
            ],
            output: `97.0`,
            hint: "Une valeur par défaut s'écrit dans la ligne `def`. Pour qu'un résultat serve dans une addition, il doit être renvoyé.",
            explain: "`taux=0.1` rend l'argument facultatif : `remise(80)` vaut 72.0. `remise(50, taux=0.5)` remplace le taux par défaut et vaut 25.0. Grâce à `return`, les deux résultats s'additionnent : 97.0."
          }
        },
        {
          id: 'py.u9.l2',
          title: 'Paramètres avancés et fonctions lambda',
          minutes: 8,
          objective: "Tu sais éviter le piège de la valeur par défaut mutable, accepter un nombre variable d'arguments (`*args`, `**kwargs`) et passer une fonction `lambda` à `sorted` ou `max`.",
          explain: `Une valeur par défaut est calculée **une seule fois**, quand \`def\` s'exécute. Une liste par défaut est donc partagée entre tous les appels : \`def ajouter(x, panier=[])\` accumule les éléments d'un appel à l'autre. La parade : \`panier=None\`, puis \`if panier is None: panier = []\` dans le corps.

- \`*args\` rassemble les arguments positionnels en trop dans un **tuple** ;
- \`**kwargs\` rassemble les arguments nommés en trop dans un **dictionnaire** (pratique pour des options, comme les hyperparamètres d'un modèle) ;
- à l'appel, \`f(*liste)\` et \`f(**options)\` font l'inverse : ils dépaquettent.

Une fonction est une valeur qu'on peut passer à une autre fonction. \`sorted(modeles, key=lambda m: m[1])\` trie selon le second élément de chaque couple. \`lambda x: expression\` crée une petite fonction sans nom, limitée à une seule expression.`,
          example: {
            code: `def ajouter(element, panier=[]):
    panier.append(element)
    return panier

print(ajouter("pomme"), ajouter("poire"))

def entrainer(nom, *couches, **options):
    print(nom, couches, options)

entrainer("mlp", 64, 32, epoques=5, taux=0.01)
modeles = [("cnn", 0.91), ("mlp", 0.84), ("rnn", 0.88)]
print(max(modeles, key=lambda m: m[1]))
print(sorted(modeles, key=lambda m: m[1])[0][0])`,
            output: `['pomme', 'poire'] ['pomme', 'poire']
mlp (64, 32) {'epoques': 5, 'taux': 0.01}
('cnn', 0.91)
mlp`,
            notes: [
              { line: 1, text: "La liste `[]` est créée une seule fois, au moment où la fonction est définie." },
              { line: 5, text: "Les deux appels renvoient la même liste partagée : elle contient les deux fruits." },
              { line: 10, text: "`couches` reçoit le tuple `(64, 32)`, `options` le dictionnaire des arguments nommés." },
              { line: 12, text: "`key` indique le critère de comparaison : ici, le score de chaque couple." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre la version corrigée de `ajouter`, qui crée une nouvelle liste à chaque appel. Le programme doit afficher `['a'] ['b']`.",
              lines: [
                'def ajouter(element, panier=None):',
                '    if panier is None:',
                '        panier = []',
                '    panier.append(element)',
                '    return panier',
                'print(ajouter("a"), ajouter("b"))'
              ],
              output: `['a'] ['b']`,
              hint: "La liste vide doit être créée dans le corps de la fonction, et seulement quand aucun panier n'est fourni.",
              explain: "`None` est immuable, donc sans danger comme valeur par défaut. Le corps de la fonction, lui, s'exécute à chaque appel : `panier = []` y crée une nouvelle liste chaque fois que l'appelant n'en fournit pas."
            },
            {
              type: 'qcm',
              prompt: "Avec cette fonction, quel appel renvoie `0.67` ?",
              code: `def stats(*valeurs, arrondi=2):
    return round(sum(valeurs) / len(valeurs), arrondi)`,
              choices: [
                'stats([1, 0, 1])',
                'stats(1, 0, 1)',
                'stats(1, 0, 1, 2)',
                'stats(1, 0, 1, arrondi=1)'
              ],
              answer: 1,
              why: {
                0: "La liste entière devient **un seul** argument : `valeurs` vaut `([1, 0, 1],)` et `sum` lève TypeError: unsupported operand type(s) for +: 'int' and 'list'.",
                2: "Le 2 est rangé dans `valeurs` comme les autres : (1 + 0 + 1 + 2) / 4 = 1.0.",
                3: "La moyenne vaut bien 0.666…, mais arrondie à 1 décimale elle donne 0.7."
              },
              hint: "`*valeurs` rassemble les arguments positionnels un par un. `arrondi` ne peut être changé qu'en le nommant.",
              explain: "`stats(1, 0, 1)` range `(1, 0, 1)` dans `valeurs` : 2 / 3 arrondi à 2 décimales donne 0.67. Pour passer une liste existante, il faudrait la dépaqueter : `stats(*[1, 0, 1])`."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `classer(resultats, critere=\"precision\")` : `resultats` est une liste de dictionnaires décrivant des modèles. La fonction renvoie la liste des **noms**, du meilleur au moins bon selon `critere` (plus grand = meilleur). Utilise `sorted` avec `key` et une `lambda`.",
            starter: `def classer(resultats, critere="precision"):
    return [r["nom"] for r in resultats]
`,
            solution: `def classer(resultats, critere="precision"):
    tries = sorted(resultats, key=lambda r: r[critere], reverse=True)
    return [r["nom"] for r in tries]
`,
            tests: [
              { code: 'R = [{"nom": "cnn", "precision": 0.91, "vitesse": 120}, {"nom": "mlp", "precision": 0.84, "vitesse": 300}, {"nom": "rnn", "precision": 0.88, "vitesse": 80}]\nassert classer(R) == ["cnn", "rnn", "mlp"]', label: 'par défaut, tri par précision : ["cnn", "rnn", "mlp"]' },
              { code: 'R = [{"nom": "cnn", "precision": 0.91, "vitesse": 120}, {"nom": "mlp", "precision": 0.84, "vitesse": 300}, {"nom": "rnn", "precision": 0.88, "vitesse": 80}]\nassert classer(R, critere="vitesse") == ["mlp", "cnn", "rnn"]', label: 'critere="vitesse" : ["mlp", "cnn", "rnn"]' },
              { code: 'assert classer([]) == []', label: 'liste vide : []' }
            ],
            checks: [
              { re: 'lambda', label: 'Utilise une lambda' }
            ],
            hint: "Donne à `sorted` une `lambda` qui, pour un dictionnaire `r`, renvoie la valeur du critère choisi. Pense à l'ordre décroissant, puis ne garde que les noms.",
            explain: "La `lambda` lit la valeur du critère choisi dans chaque dictionnaire, et `reverse=True` met la plus grande en premier. La valeur par défaut `\"precision\"` est un texte, immuable : aucun risque de partage entre les appels."
          },
          recap: [
            "Une valeur par défaut est créée une seule fois : jamais de liste ni de dictionnaire par défaut.",
            "Motif sûr : `param=None`, puis `if param is None: param = []`.",
            "`*args` reçoit un tuple, `**kwargs` un dictionnaire.",
            "`key=lambda x: ...` indique à `sorted`, `max` ou `min` le critère à utiliser."
          ],
          check: {
            type: 'logic',
            prompt: "Que renvoie le dernier appel, `noter(0.1)` ?",
            code: `def noter(score, historique=[]):
    historique.append(score)
    return len(historique)

noter(0.5)
noter(0.7)
noter(0.9, [])
noter(0.1)`,
            answer: '3',
            mistakes: [
              { answer: '1', why: "La liste par défaut n'est pas recréée à chaque appel : elle a été créée une fois, quand `def` s'est exécuté, et elle garde les scores précédents." },
              { answer: '4', why: "L'appel `noter(0.9, [])` fournit sa propre liste : 0.9 n'est pas ajouté à la liste par défaut." }
            ],
            hint: "Suis la liste par défaut d'un appel à l'autre, et repère l'appel qui en utilise une autre.",
            explain: "La liste par défaut reçoit 0.5, puis 0.7. L'appel avec `[]` travaille sur une liste neuve, sans toucher la liste par défaut. Le dernier appel y ajoute 0.1 : elle contient 3 scores."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- py.u10
    {
      id: 'py.u10',
      title: 'Portée des variables',
      summary: "Savoir quelle variable une fonction voit et modifie, et se passer des variables globales.",
      lessons: [
        {
          id: 'py.u10.l1',
          title: 'Variables locales et globales',
          minutes: 8,
          objective: "Tu sais prévoir quelle variable une fonction lit ou modifie (locale ou globale), éviter l'`UnboundLocalError`, et préférer `return` à `global`.",
          explain: `Les variables créées dans une fonction, paramètres compris, sont **locales** : elles n'existent que pendant l'appel et sont invisibles à l'extérieur (\`NameError\`).

- Une fonction peut **lire** une variable globale.
- Mais dès qu'elle **affecte** un nom quelque part dans son corps, ce nom est local dans toute la fonction. \`compteur += 1\` lève alors \`UnboundLocalError: cannot access local variable 'compteur' where it is not associated with a value\`.
- \`global compteur\` autorise la modification, mais rend le code difficile à tester. Préfère recevoir la valeur en paramètre et renvoyer la nouvelle valeur.
- Modifier une liste reçue (\`liste.append(x)\`) n'est pas une affectation : l'appelant voit le changement. Réaffecter le paramètre (\`liste = ...\`) ne change rien pour lui.

Python cherche un nom dans cet ordre : local, fonction englobante, global, puis fonctions intégrées. Une variable nommée \`max\` ou \`list\` masque donc la fonction intégrée.`,
          example: {
            code: `seuil = 0.5
appels = 0

def classer(p):
    global appels
    appels += 1
    return p >= seuil

def ajouter(liste, x):
    liste.append(x)

print(classer(0.7), classer(0.2), appels)
mesures = []
ajouter(mesures, 3)
print(mesures)`,
            output: `True False 2
[3]`,
            notes: [
              { line: 5, text: "Sans cette ligne, `appels += 1` lèverait une UnboundLocalError." },
              { line: 7, text: "`seuil` est seulement lu : la variable globale est trouvée sans déclaration." },
              { line: 10, text: "`append` modifie la liste de l'appelant : ce n'est pas une affectation du nom." },
              { line: 12, text: "Les arguments sont évalués de gauche à droite : quand `appels` est lu, il vaut déjà 2." }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `x = 10

def f():
    x = 99
    return x

def g():
    return x

print(f(), g(), x)`,
              answer: '99 10 10',
              mistakes: [
                { answer: '99 99 99', why: "`x = 99` dans `f` crée une variable **locale** : la variable globale `x` vaut toujours 10." },
                { answer: '99 99 10', why: "`g` n'a pas de variable locale `x` : elle lit la globale, qui vaut 10. Le `x` de `f` a disparu à la fin de son appel." }
              ],
              hint: "Pour chaque fonction, demande-toi : ce `x` est-il affecté dans la fonction, ou seulement lu ?",
              explain: "`f` affecte `x` : c'est une variable locale, détruite à la fin de l'appel. `g` ne fait que lire `x` : elle trouve la globale, 10. La variable globale n'a jamais été modifiée."
            },
            {
              type: 'code',
              prompt: "Réécris `retirer` sans `global` : elle reçoit le stock actuel et la quantité demandée, et **renvoie** le nouveau stock. Si la quantité dépasse le stock, elle renvoie le stock inchangé.",
              starter: `stock = 10

def retirer(quantite):
    global stock
    stock -= quantite
`,
              solution: `def retirer(stock, quantite):
    if quantite > stock:
        return stock
    return stock - quantite
`,
              tests: [
                { code: 'assert retirer(10, 3) == 7', label: 'retirer(10, 3) renvoie 7' },
                { code: 'assert retirer(2, 5) == 2', label: 'retirer(2, 5) renvoie 2 (quantité trop grande)' },
                { code: 'assert retirer(10, 3) == 7 and retirer(10, 3) == 7', label: 'deux appels identiques donnent le même résultat' },
                { code: 'assert retirer(4, 4) == 0', label: 'retirer(4, 4) renvoie 0' }
              ],
              hint: "Tout ce dont la fonction a besoin arrive par ses paramètres, et tout ce qu'elle produit repart par `return`.",
              explain: "Cette version ne dépend d'aucune variable extérieure : le même appel donne toujours le même résultat, ce qui la rend facile à tester. L'appelant décide quoi faire du résultat, par exemple `stock = retirer(stock, 3)`."
            }
          ],
          challenge: {
            type: 'logic',
            prompt: "Quel nombre affiche ce programme ?",
            code: `n = 1

def a():
    n = 2
    def b():
        return n * 10
    return b() + n

print(a() + n)`,
            answer: '23',
            mistakes: [
              { answer: '13', why: "`b` cherche `n` d'abord dans la fonction qui l'englobe, `a`, où `n` vaut 2 : `b()` renvoie 20, pas 10." },
              { answer: '24', why: "Le `n` de la dernière ligne est le `n` global, resté à 1 : l'affectation `n = 2` dans `a` est locale." }
            ],
            hint: "Cherche chaque `n` dans l'ordre : local, fonction englobante, global.",
            explain: "`b` n'a pas de `n` local : elle trouve celui de `a` (2) et renvoie 20. `a` renvoie 20 + 2 = 22. Dehors, le `n` global vaut 1 : 22 + 1 = 23."
          },
          recap: [
            "Une variable affectée dans une fonction est locale à cette fonction.",
            "Lire une globale est permis ; l'affecter sans `global` lève UnboundLocalError.",
            "Préfère les paramètres et `return` à `global`.",
            "`liste.append(x)` modifie la liste de l'appelant ; `liste = ...` ne change que le nom local.",
            "Ordre de recherche d'un nom : local, englobant, global, intégré."
          ],
          check: {
            type: 'bug',
            prompt: "`ajouter_label` doit ajouter une étiquette à la liste de l'appelant. Le programme devrait afficher `['chat', 'chien']`, mais affiche `['chat']`. Clique sur la ligne fautive.",
            code: `def ajouter_label(labels, nouveau):
    labels = labels + [nouveau]

mes_labels = ["chat"]
ajouter_label(mes_labels, "chien")
print(mes_labels)`,
            bugLine: 2,
            why: "`labels + [nouveau]` crée une **nouvelle** liste, et `labels = ...` rattache seulement le nom local à cette nouvelle liste. La liste de l'appelant n'est jamais touchée.",
            fixes: [
              '    labels.append(nouveau)',
              '    labels += nouveau',
              '    return labels + [nouveau]'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "`+=` modifie bien la liste sur place, mais ajoute un par un les caractères du texte : `['chat', 'c', 'h', 'i', 'e', 'n']`.",
              2: "La fonction renverrait la bonne liste, mais l'appelant ignore le résultat : `mes_labels` resterait `['chat']`."
            },
            output: `['chat', 'chien']`,
            hint: "La ligne modifie-t-elle la liste reçue, ou fabrique-t-elle une autre liste ?",
            explain: "`append` modifie l'objet liste lui-même, que l'appelant partage : il voit donc le changement. Une affectation (`labels = ...`) ne fait que déplacer le nom local. Une fonction qui modifie ses arguments doit le dire clairement ; sinon, qu'elle renvoie une nouvelle valeur."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- py.u11
    {
      id: 'py.u11',
      title: 'Modules et bibliothèques',
      summary: "Réutiliser la bibliothèque standard, installer des bibliothèques externes et lire leur documentation.",
      lessons: [
        {
          id: 'py.u11.l1',
          title: 'import et la bibliothèque standard',
          minutes: 7,
          objective: "Tu sais importer un module (`import`, `from … import`, `as`) et utiliser quelques modules standard (`math`, `statistics`, `collections`, `json`) au lieu de tout recoder.",
          explain: `Un **module** est un fichier \`.py\` qui regroupe des fonctions et des variables. La bibliothèque standard en fournit des dizaines, installés avec Python.

- \`import math\` puis \`math.sqrt(2)\` : le nom du module sert de préfixe ;
- \`from statistics import mean, median\` : on utilise \`mean\` directement ;
- \`import json as js\` : un alias, comme la convention \`import numpy as np\`.

Quelques modules utiles : \`math\` (\`sqrt\`, \`ceil\`, \`isclose\`), \`statistics\` (\`mean\`, \`median\`), \`collections\` (\`Counter\` pour compter), \`json\` (\`dumps\` : dictionnaire vers texte, \`loads\` : texte vers dictionnaire, comme \`ConvertTo-Json\` et \`ConvertFrom-Json\` en PowerShell).

Deux pièges : évite \`from module import *\`, qui mélange les noms. Et ne nomme jamais ton fichier \`random.py\` ou \`json.py\` : Python cherche d'abord dans ton dossier et importerait ton fichier à la place du module standard.`,
          example: {
            code: `import math
from statistics import mean, median
from collections import Counter
import json

scores = [0.82, 0.91, 0.77, 0.88, 0.35]
print(round(mean(scores), 3), median(scores))
print(math.ceil(1250 / 32), math.isclose(0.1 + 0.2, 0.3))
labels = ["chat", "chien", "chat", "chat", "oiseau", "chien"]
print(Counter(labels).most_common(2))
texte = json.dumps({"modele": "cnn", "score": 0.9})
print(texte, json.loads(texte)["score"])`,
            output: `0.746 0.82
40 True
[('chat', 3), ('chien', 2)]
{"modele": "cnn", "score": 0.9} 0.9`,
            notes: [
              { line: 2, text: "`from ... import` rend `mean` et `median` utilisables sans préfixe." },
              { line: 7, text: "La médiane résiste aux valeurs extrêmes comme 0.35, contrairement à la moyenne." },
              { line: 10, text: "`most_common(2)` donne les 2 éléments les plus fréquents, avec leur nombre." },
              { line: 11, text: "`dumps` produit un texte JSON (avec des guillemets doubles), `loads` le relit en dictionnaire." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "Ton dossier contient `random.py` (un fichier que tu as écrit) et `jeu.py`, qui fait `import random` puis `random.randint(1, 6)`. Python affiche : `AttributeError: module 'random' has no attribute 'randint' (consider renaming '…/random.py' since it has the same name as the standard library module named 'random' and prevents importing that standard library module)`. Pourquoi ?",
              choices: [
                "Le module random n'est pas installé",
                'Ton fichier random.py est importé à la place du module standard',
                "randint n'existe plus en Python 3.13",
                'Il faut écrire from random import * pour accéder à randint'
              ],
              answer: 1,
              why: {
                0: "Un module absent donnerait `ModuleNotFoundError: No module named 'random'`. Et `random` fait partie de la bibliothèque standard : il est toujours installé.",
                2: "`random.randint` existe toujours : c'est le module importé qui n'est pas le bon.",
                3: "`import *` importerait les noms de ton propre fichier, qui ne contient pas `randint` : le problème resterait."
              },
              hint: "Où Python cherche-t-il un module en premier ?",
              explain: "Python cherche d'abord dans le dossier du script : ton `random.py` masque le module standard. Depuis Python 3.13, le message de l'AttributeError le dit explicitement et suggère de renommer le fichier, par exemple en `de.py`."
            },
            {
              type: 'fill',
              prompt: "Complète les imports pour que ce programme affiche `4 3.0`.",
              code: `___ statistics import median
import math ___ m
valeurs = [3, 9, 4]
print(median(valeurs), m.sqrt(valeurs[1]))`,
              blanks: [
                {
                  answers: ['from'],
                  options: ['from', 'import', 'in'],
                  why: {
                    import: "`import statistics import median` est une erreur de syntaxe : pour importer un nom précis, on écrit `from module import nom`.",
                    in: "`in` teste l'appartenance ; il n'a aucun rôle dans un import."
                  }
                },
                {
                  answers: ['as'],
                  options: ['as', 'in', 'from'],
                  why: {
                    in: "Un alias se crée avec `as`, pas avec `in`.",
                    from: "`import math from m` n'existe pas : c'est une erreur de syntaxe."
                  }
                }
              ],
              output: `4 3.0`,
              hint: "Un mot pour importer un nom précis d'un module, un autre pour lui donner un surnom.",
              explain: "`from statistics import median` permet d'appeler `median` sans préfixe. `import math as m` crée l'alias `m` : on écrit alors `m.sqrt`. La racine carrée renvoie toujours un float, d'où `3.0`."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète `mots_frequents(texte, n)` : elle renvoie la liste des `n` mots les plus fréquents du texte, en minuscules, du plus fréquent au moins fréquent. Utilise `Counter` et sa méthode `most_common`.",
            starter: `from collections import Counter

def mots_frequents(texte, n):
    # découpe, compte, garde les n premiers
    return []
`,
            solution: `from collections import Counter

def mots_frequents(texte, n):
    compte = Counter(texte.lower().split())
    return [mot for mot, nb in compte.most_common(n)]
`,
            tests: [
              { code: 'assert mots_frequents("le chat et le chien et le lapin", 2) == ["le", "et"]', label: 'les 2 mots les plus fréquents : ["le", "et"]' },
              { code: 'assert mots_frequents("Python python PYTHON java", 1) == ["python"]', label: 'les majuscules ne comptent pas : ["python"]' },
              { code: 'assert mots_frequents("", 3) == []', label: 'texte vide : []' }
            ],
            checks: [
              { re: 'Counter\\(', label: 'Utilise Counter' },
              { re: 'most_common', label: 'Utilise most_common' }
            ],
            hint: "`Counter(liste)` compte les éléments ; `most_common(n)` renvoie des couples (mot, nombre) dont tu ne gardes que le mot.",
            explain: "`texte.lower().split()` prépare les mots, `Counter` les compte en une ligne et `most_common(n)` les classe. Une compréhension garde le premier élément de chaque couple. Tu viens de remplacer une dizaine de lignes de comptage à la main."
          },
          recap: [
            "`import m`, `from m import nom`, `import m as alias`.",
            "`math`, `statistics`, `collections.Counter` et `json` évitent de recoder l'existant.",
            "`json.loads` : texte vers dictionnaire ; `json.dumps` : dictionnaire vers texte.",
            "Ne nomme pas tes fichiers comme un module standard (`random.py`, `json.py`)."
          ],
          check: {
            type: 'order',
            prompt: "Remets dans l'ordre ce programme qui lit une configuration JSON, ajoute 5 époques, puis la retransforme en texte.",
            lines: [
              'import json',
              "config = json.loads('{\"modele\": \"cnn\", \"epoques\": 10}')",
              'config["epoques"] += 5',
              'texte = json.dumps(config)',
              'print(texte, type(texte))'
            ],
            output: `{"modele": "cnn", "epoques": 15} <class 'str'>`,
            hint: "Un module s'importe avant d'être utilisé ; on modifie le dictionnaire avant de le retransformer en texte.",
            explain: "`json.loads` transforme le texte en dictionnaire, qu'on modifie comme n'importe quel dictionnaire ; `json.dumps` refait un texte (`str`), prêt à être enregistré ou envoyé à une API. L'import vient en premier, sinon le nom `json` n'existe pas encore (NameError)."
          }
        },
        {
          id: 'py.u11.l2',
          title: 'pip, environnements virtuels et documentation',
          minutes: 8,
          lang: 'bash',
          objective: "Tu sais installer une bibliothèque externe avec `pip` dans un environnement virtuel, enregistrer ses versions dans `requirements.txt`, et lire une documentation pour appeler correctement une fonction.",
          explain: `La bibliothèque standard est fournie avec Python. Les autres (numpy, pandas, requests, scikit-learn…) se téléchargent depuis PyPI avec **pip**, dans un **terminal** (PowerShell sous Windows), jamais dans l'interpréteur Python : y taper \`pip install requests\` donne \`SyntaxError: invalid syntax\`.

- Un environnement virtuel par projet : \`python -m venv .venv\`, puis on l'active (\`.venv\\Scripts\\Activate.ps1\` sous Windows, \`source .venv/bin/activate\` sous macOS et Linux).
- \`python -m pip install requests\` installe dans l'environnement actif.
- \`python -m pip freeze > requirements.txt\` enregistre les versions exactes ; \`python -m pip install -r requirements.txt\` les réinstalle ailleurs.

Pour lire une documentation : la **signature** (paramètres obligatoires, valeurs par défaut), ce que la fonction **renvoie**, les erreurs possibles, puis les exemples.

CodeQuest n'exécute pas les bibliothèques externes : les exercices qui en parlent sont des lectures de code, à essayer sur ton ordinateur.`,
          example: {
            code: `python -m venv .venv
.venv\\Scripts\\Activate.ps1
python -m pip install requests pandas
python -m pip list
python -m pip freeze > requirements.txt
python mon_script.py`,
            run: false,
            notes: [
              { line: 1, text: "Crée un dossier `.venv` qui contiendra un Python et des bibliothèques propres au projet." },
              { line: 2, text: "Active l'environnement dans PowerShell (sous macOS et Linux : `source .venv/bin/activate`) ; `(.venv)` apparaît devant l'invite. Si PowerShell refuse le script, autorise une fois les scripts locaux : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`." },
              { line: 3, text: "`python -m pip` garantit que pip installe pour le Python de l'environnement actif." },
              { line: 5, text: "Enregistre les versions exactes installées, sous la forme `requests==2.32.3`." }
            ]
          },
          exercises: [
            {
              type: 'order',
              lang: 'bash',
              prompt: "Remets dans l'ordre les commandes à taper dans PowerShell pour démarrer un projet d'IA propre : créer le dossier et l'environnement virtuel, installer scikit-learn, puis enregistrer les versions.",
              lines: [
                'mkdir projet-ia',
                'cd projet-ia',
                'python -m venv .venv',
                '.venv\\Scripts\\Activate.ps1',
                'python -m pip install scikit-learn',
                'python -m pip freeze > requirements.txt'
              ],
              hint: "On n'active qu'un environnement déjà créé, et on n'enregistre les versions qu'une fois les bibliothèques installées.",
              explain: "Le dossier d'abord, puis l'environnement, son activation, l'installation, et enfin `freeze`, qui enregistre les versions exactes. Installer avant d'activer mettrait la bibliothèque dans le Python global de la machine, pas dans celui du projet."
            },
            {
              type: 'bug',
              lang: 'python',
              run: false,
              prompt: "Extrait de la documentation de pandas : `DataFrame.sort_values(by, *, axis=0, ascending=True, inplace=False, ...)`. Section **Returns** : « DataFrame or None. DataFrame with sorted values or None if inplace=True. » Ce code doit afficher le meilleur modèle (`mlp`), mais affiche `cnn`. Clique sur la ligne fautive.",
              code: `import pandas as pd

df = pd.DataFrame({"modele": ["cnn", "mlp", "rnn"], "score": [0.88, 0.91, 0.79]})
df.sort_values("score", ascending=False)
meilleur = df.iloc[0]["modele"]
print(meilleur)`,
              bugLine: 4,
              why: "D'après la documentation, `sort_values` **renvoie** un nouveau DataFrame trié (car `inplace=False` par défaut) : `df` lui-même n'est pas modifié. Le résultat n'est rangé nulle part, donc la première ligne reste `cnn`.",
              fixes: [
                'df = df.sort_values("score", ascending=False)',
                'df.sort_values("score")',
                'df.sort_values(by="score", ascending=False, inplace=False)'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Toujours aucun résultat rangé ; en plus, l'ordre croissant mettrait le plus mauvais score en premier.",
                2: "C'est l'appel d'origine, écrit avec ses valeurs par défaut explicites : le DataFrame trié est toujours perdu."
              },
              output: `mlp`,
              hint: "Relis la section Returns : la méthode modifie-t-elle `df`, ou renvoie-t-elle un nouvel objet ?",
              explain: "Comme `sorted` en Python pur, `sort_values` renvoie un nouvel objet : il faut le ranger (`df = ...`). Lire la section Returns évite ce bug très courant avec pandas. Ce code n'est pas exécuté dans l'appli : à essayer sur ton ordinateur après `python -m pip install pandas`."
            }
          ],
          challenge: {
            type: 'code',
            lang: 'python',
            prompt: "Un outil vérifie qu'une bibliothèque installée est assez récente. Complète `version_ok(installee, minimale)` : elle renvoie `True` si la version installée est supérieure ou égale à la version minimale, en comparant **numériquement** chaque partie (`\"2.10.0\"` est plus récente que `\"2.9.1\"`). Astuce : deux tuples se comparent élément par élément, de gauche à droite.",
            starter: `def version_ok(installee, minimale):
    return installee >= minimale
`,
            solution: `def en_tuple(version):
    return tuple(int(partie) for partie in version.split("."))

def version_ok(installee, minimale):
    return en_tuple(installee) >= en_tuple(minimale)
`,
            tests: [
              { code: 'assert version_ok("2.10.0", "2.9.1") is True', label: 'version_ok("2.10.0", "2.9.1") renvoie True' },
              { code: 'assert version_ok("1.26.4", "2.0.0") is False', label: 'version_ok("1.26.4", "2.0.0") renvoie False' },
              { code: 'assert version_ok("3.1.0", "3.1.0") is True', label: 'versions égales : True' },
              { code: 'assert version_ok("0.24.2", "0.3.0") is True', label: 'version_ok("0.24.2", "0.3.0") renvoie True' }
            ],
            hint: "Découpe chaque version aux points, convertis chaque morceau en entier, puis compare les deux tuples obtenus.",
            explain: "Comparées comme textes, les versions se comparent caractère par caractère : \"2.10.0\" < \"2.9.1\" car \"1\" < \"9\". Converties en tuples d'entiers, (2, 10, 0) > (2, 9, 1), car 10 est comparé à 9. pip fait ce genre de comparaison pour choisir les versions à installer."
          },
          recap: [
            "`pip` se lance dans un terminal, jamais dans l'interpréteur Python.",
            "Un environnement virtuel par projet : `python -m venv .venv`, puis activation.",
            "`pip freeze > requirements.txt` enregistre les versions ; `pip install -r requirements.txt` les réinstalle.",
            "Dans une documentation : signature, valeur renvoyée (Returns), erreurs, exemples.",
            "CodeQuest n'exécute pas les bibliothèques externes : teste-les sur ton ordinateur."
          ],
          check: {
            type: 'qcm',
            lang: 'bash',
            prompt: "Tu récupères un projet d'IA qui contient un fichier `requirements.txt`. Tu as créé et activé un environnement virtuel. Quelle commande installe exactement les versions prévues ?",
            choices: [
              'python -m pip install requirements.txt',
              'python -m pip install -r requirements.txt',
              'python -m pip freeze > requirements.txt',
              'import requirements'
            ],
            answer: 1,
            why: {
              0: "Sans `-r`, pip cherche sur PyPI un paquet nommé « requirements.txt » et échoue : il ne lit pas le fichier.",
              2: "`freeze >` **écrase** le fichier avec ce qui est installé maintenant, c'est-à-dire presque rien : tu perdrais la liste du projet.",
              3: "C'est une instruction Python, pas une commande de terminal ; elle chercherait un module `requirements` et lèverait `ModuleNotFoundError: No module named 'requirements'`."
            },
            hint: "pip a une option pour lire une liste de paquets dans un fichier.",
            explain: "`-r requirements.txt` demande à pip de lire le fichier ligne par ligne et d'installer chaque paquet dans la version indiquée. C'est ainsi qu'on reproduit l'environnement d'un projet sur une autre machine."
          }
        }
      ]
    }
  ]
});
