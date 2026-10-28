// Test de positionnement de CodeQuest : 9 compétences, 22 questions.
// Pour chaque compétence, l’appli pose le niveau 1, puis le niveau 2 s’il est réussi, puis le niveau 3 s’il existe.
// Une compétence est acquise si le niveau 2 est réussi : ses unités sont alors validées.
CQ.addPlacement(
  [
    { id: 'variables', title: 'Variables et types', units: ['py.u1', 'py.u2', 'py.u3'] },
    { id: 'conditions', title: 'Conditions', units: ['py.u4'] },
    { id: 'boucles', title: 'Boucles', units: ['py.u5'] },
    { id: 'collections', title: 'Listes et dictionnaires', units: ['py.u6', 'py.u7', 'py.u8'] },
    { id: 'fonctions', title: 'Fonctions', units: ['py.u9', 'py.u10'] },
    { id: 'lecture', title: 'Lecture de code', units: [] },
    { id: 'debogage', title: 'Débogage', units: [] },
    { id: 'logique', title: 'Logique algorithmique', units: [] },
    { id: 'web', title: 'Bases du web', units: ['web.u1', 'web.u2'] }
  ],
  [
    // ---------- Variables et types ----------
    {
      id: 'pl.variables.1', skill: 'variables', level: 1,
      ex: {
        type: 'qcm',
        prompt: 'Que contient `c` après ces trois lignes ?',
        code: `a = 7
b = 2
c = a / b`,
        choices: ['`3`, de type `int`', '`3.5`, de type `float`', '`3.0`, de type `float`', 'Une erreur : on ne peut pas diviser deux entiers'],
        answer: 1,
        why: {
          0: '`3` est le résultat de la division entière `a // b`. L’opérateur `/` fait une vraie division : il garde la partie décimale.',
          2: 'C’est bien un `float`, mais rien n’est arrondi : `/` calcule 7 ÷ 2 exactement, soit 3.5.',
          3: 'Diviser deux `int` est autorisé. Seule la division par zéro lève une erreur (`ZeroDivisionError`).'
        },
        hint: 'Python a deux opérateurs de division : `/` et `//`. Lequel est utilisé ici ?',
        explain: 'En Python 3, `/` renvoie toujours un `float`, même entre deux `int` : `7 / 2` vaut `3.5`. Pour le quotient entier, on utilise `//` (`7 // 2` vaut `3`) et pour le reste `%` (`7 % 2` vaut `1`).'
      }
    },
    {
      id: 'pl.variables.2', skill: 'variables', level: 2,
      ex: {
        type: 'predict',
        prompt: 'La personne tape `7` puis Entrée. Qu’affiche ce programme ?',
        code: `saisie = input()  # la personne tape 7
n = int(saisie)
print(saisie * 2, n * 2)
print(n // 2, n % 2, n ** 2)
print(f"Moitié : {n / 2:.2f}")`,
        stdin: '7\n',
        answer: `77 14
3 1 49
Moitié : 3.50`,
        mistakes: [
          { answer: '14 14\n3 1 49\nMoitié : 3.50', why: '`input()` renvoie toujours une chaîne : `saisie` vaut `\'7\'`, pas `7`. Une chaîne multipliée par 2 est répétée : `\'7\' * 2` donne `77`.' },
          { answer: '77 14\n3.5 1 49\nMoitié : 3.50', why: '`//` est la division entière : `7 // 2` vaut `3`, sans partie décimale.' },
          { answer: '77 14\n3 1 14\nMoitié : 3.5', why: '`**` est la puissance (`7 ** 2` vaut 49), pas une multiplication par 2. Et `:.2f` affiche toujours deux décimales : `3.50`.' }
        ],
        hint: 'Regarde d’abord le type de chaque variable : que renvoie `input()` ? Puis distingue `/`, `//`, `%` et `**`.',
        explain: '`input()` renvoie la chaîne `\'7\'` : `saisie * 2` la répète (`77`), alors que `n = int(saisie)` est un entier (`n * 2` vaut 14). `7 // 2` vaut 3 (quotient), `7 % 2` vaut 1 (reste) et `7 ** 2` vaut 49. Enfin `{n / 2:.2f}` affiche 3.5 avec deux décimales : `3.50`.'
      }
    },

    // ---------- Conditions ----------
    {
      id: 'pl.conditions.1', skill: 'conditions', level: 1,
      ex: {
        type: 'predict',
        prompt: 'Qu’affiche ce programme ?',
        code: `temperature = 18
if temperature > 25:
    print("chaud")
elif temperature > 15:
    print("doux")
elif temperature > 5:
    print("frais")
else:
    print("froid")`,
        answer: 'doux',
        mistakes: [
          { answer: 'doux\nfrais', why: 'Dans une chaîne `if / elif / else`, seul le premier bloc dont la condition est vraie s’exécute. Après `doux`, Python saute les `elif` suivants, même si `18 > 5` est vrai.' },
          { answer: 'frais', why: 'Les conditions sont testées de haut en bas. `18 > 15` est vrai : ce bloc s’exécute avant même d’arriver à `> 5`.' }
        ],
        hint: 'Teste les conditions dans l’ordre, de haut en bas. Que se passe-t-il après la première condition vraie ?',
        explain: 'Python teste `18 > 25` (faux), puis `18 > 15` (vrai) : il affiche `doux` et sort de toute la structure. Les `elif` suivants ne sont même pas évalués. C’est pour cela que l’ordre des conditions compte.'
      }
    },
    {
      id: 'pl.conditions.2', skill: 'conditions', level: 2,
      ex: {
        type: 'code',
        prompt: `Complète la fonction \`tarif(age, etudiant)\` qui renvoie le prix d’une place de cinéma, en euros :

- moins de 4 ans : 0 (gratuit) ;
- de 4 à 11 ans : 5 ;
- 65 ans et plus, ou étudiant (à partir de 12 ans) : 7 ;
- sinon : 10.

\`etudiant\` vaut \`True\` ou \`False\`. Exemples : \`tarif(8, False)\` renvoie 5, \`tarif(20, True)\` renvoie 7.`,
        starter: `def tarif(age, etudiant):
    if age < 12:
        return 5
    return 10
`,
        solution: `def tarif(age, etudiant):
    if age < 4:
        return 0
    elif age < 12:
        return 5
    elif etudiant or age >= 65:
        return 7
    else:
        return 10
`,
        tests: [
          { code: 'assert tarif(2, False) == 0', label: 'tarif(2, False) renvoie 0 (gratuit)' },
          { code: 'assert tarif(4, False) == 5', label: 'tarif(4, False) renvoie 5 (4 ans est inclus)' },
          { code: 'assert tarif(10, True) == 5', label: 'tarif(10, True) renvoie 5 (le tarif enfant passe avant le tarif étudiant)' },
          { code: 'assert tarif(20, True) == 7 and tarif(65, False) == 7', label: 'tarif(20, True) et tarif(65, False) renvoient 7' },
          { code: 'assert tarif(30, False) == 10 and tarif(64, False) == 10', label: 'tarif(30, False) et tarif(64, False) renvoient 10' }
        ],
        hint: 'Teste les âges du plus petit au plus grand avec `if / elif`. Une seule condition réunit deux cas avec `or`.',
        explain: 'Les conditions sont testées dans l’ordre : on traite d’abord les plus jeunes (`age < 4`, puis `age < 12`), donc un enfant étudiant reçoit bien le tarif enfant. Au troisième test, on sait déjà que l’âge est au moins 12 : `etudiant or age >= 65` suffit. Le `else` couvre tout le reste.'
      }
    },

    // ---------- Boucles ----------
    {
      id: 'pl.boucles.1', skill: 'boucles', level: 1,
      ex: {
        type: 'order',
        prompt: 'Remets ces lignes dans l’ordre pour que le programme affiche la somme des nombres de 1 à 4, c’est-à-dire `10`.',
        lines: ['total = 0', 'for i in range(1, 5):', '    total += i', 'print(total)'],
        output: '10',
        hint: 'L’accumulateur doit exister avant la boucle, et le résultat ne s’affiche qu’une fois, à la fin.',
        explain: 'On crée d’abord l’accumulateur `total = 0`. La boucle `for i in range(1, 5)` parcourt 1, 2, 3 et 4 (la borne 5 est exclue) et la ligne indentée ajoute chaque valeur. Le `print` n’est pas indenté : il s’exécute une seule fois, après la boucle. Placé avant la boucle, il afficherait 0.'
      }
    },
    {
      id: 'pl.boucles.2', skill: 'boucles', level: 2,
      ex: {
        type: 'fill',
        prompt: 'Complète le programme : il affiche sur une ligne les nombres impairs de 1 à 15 qui ne sont pas multiples de 3, puis combien il en a affiché.',
        code: `compte = 0
for n in range(1, 16, ___):
    if n % 3 == 0:
        ___
    print(n, end=" ")
    compte ___ 1
print()
print(compte)`,
        blanks: [
          { answers: ['2'], options: ['1', '2', '3'], why: { '1': 'Avec un pas de 1, la boucle parcourt aussi les nombres pairs.', '3': 'Un pas de 3 donne 1, 4, 7, 10, 13 : on obtient des nombres pairs et on rate des impairs.' } },
          { answers: ['continue'], options: ['continue', 'break', 'pass'], why: { 'break': '`break` arrête toute la boucle dès le 3 : seul 1 serait affiché.', 'pass': '`pass` ne fait rien : 3, 9 et 15 seraient quand même affichés.' } },
          { answers: ['+='], options: ['+=', '=', '=='], why: { '=': '`compte = 1` remet le compteur à 1 à chaque tour au lieu de l’augmenter.', '==': '`==` compare sans rien modifier : le compteur resterait à 0.' } }
        ],
        output: `1 5 7 11 13
5`,
        hint: 'Le troisième argument de `range` est le pas. Pour passer au tour suivant sans arrêter la boucle, il existe un mot-clé précis.',
        explain: '`range(1, 16, 2)` donne 1, 3, 5, …, 15. Quand `n` est multiple de 3, `continue` passe directement au tour suivant, alors que `break` arrêterait la boucle. `compte += 1` augmente le compteur à chaque nombre affiché : 1, 5, 7, 11 et 13, soit 5 nombres.'
      }
    },
    {
      id: 'pl.boucles.3', skill: 'boucles', level: 3,
      ex: {
        type: 'code',
        prompt: `Un capital placé rapporte \`taux\` % d’intérêts par an, ajoutés au capital chaque année. Complète \`annees_pour_doubler(capital, taux)\` : elle renvoie le nombre d’années nécessaires pour que le capital atteigne **au moins** le double de sa valeur de départ.

Si \`taux\` vaut 0 ou moins, le capital ne doublera jamais : renvoie \`None\`.

Exemple : 1000 € à 50 % donnent 1500 € après 1 an et 2250 € après 2 ans, donc \`annees_pour_doubler(1000, 50)\` renvoie 2.`,
        starter: `def annees_pour_doubler(capital, taux):
    annees = 0
    # ta boucle ici
    return annees
`,
        solution: `def annees_pour_doubler(capital, taux):
    if taux <= 0:
        return None
    objectif = capital * 2
    annees = 0
    while capital < objectif:
        capital = capital * (1 + taux / 100)
        annees += 1
    return annees
`,
        tests: [
          { code: 'assert annees_pour_doubler(1000, 50) == 2', label: 'annees_pour_doubler(1000, 50) renvoie 2' },
          { code: 'assert annees_pour_doubler(1000, 100) == 1', label: 'À 100 %, il faut 1 an (atteindre le double exact suffit)' },
          { code: 'assert annees_pour_doubler(500, 7) == 11', label: 'annees_pour_doubler(500, 7) renvoie 11' },
          { code: 'assert annees_pour_doubler(1000, 0) is None', label: 'Un taux de 0 renvoie None (pas de boucle infinie)' }
        ],
        hint: 'Tant que le capital reste sous l’objectif, ajoute les intérêts d’une année et compte cette année. Calcule l’objectif avant la boucle, et pense au cas où elle ne s’arrêterait jamais.',
        explain: 'On ne sait pas à l’avance combien de tours il faut : c’est le cas typique de `while`. L’objectif est calculé avant la boucle (sinon il grandirait avec le capital), puis chaque tour ajoute `taux` % et compte une année. Le test `taux <= 0` placé au début évite une boucle infinie.'
      }
    },

    // ---------- Listes et dictionnaires ----------
    {
      id: 'pl.collections.1', skill: 'collections', level: 1,
      ex: {
        type: 'qcm',
        prompt: 'Que vaut `notes[1:3]` ?',
        code: 'notes = [12, 8, 15, 10]',
        choices: ['`[8, 15]`', '`[12, 8, 15]`', '`[8, 15, 10]`', '`[12, 8]`'],
        answer: 0,
        why: {
          1: 'Les indices commencent à 0 : `notes[1]` vaut 8, pas 12. Le 12 est à l’indice 0.',
          2: 'La borne de fin est exclue : la tranche s’arrête avant l’indice 3, donc sans le 10.',
          3: 'Ce serait `notes[0:2]`. Ici, la tranche commence à l’indice 1.'
        },
        hint: 'Numérote les éléments à partir de 0. Dans une tranche `[début:fin]`, la fin est-elle incluse ?',
        explain: 'Une tranche `liste[début:fin]` prend les éléments de l’indice `début` inclus jusqu’à l’indice `fin` exclu : ici les indices 1 et 2, soit `[8, 15]`. C’est la même règle que pour `range` : la borne de fin n’est jamais incluse.'
      }
    },
    {
      id: 'pl.collections.2', skill: 'collections', level: 2,
      ex: {
        type: 'predict',
        prompt: 'Qu’affiche ce programme ?',
        code: `mot = "Python"
notes = [12, 15, 9]
notes.append(18)
premier, dernier = notes[0], notes[-1]
stock = {"pomme": 3, "kiwi": 0}
stock["poire"] = stock.get("poire", 0) + 2
print(mot[1:4].upper(), len(notes), premier + dernier)
print(sorted(stock), stock["poire"], len({1, 2, 2, 3}))`,
        answer: `YTH 4 30
['kiwi', 'poire', 'pomme'] 2 3`,
        mistakes: [
          { answer: 'PYT 4 30\n[\'kiwi\', \'poire\', \'pomme\'] 2 3', why: 'Les indices d’une chaîne commencent à 0 : `mot[1:4]` prend les caractères d’indices 1, 2 et 3, soit `yth`.' },
          { answer: 'YTH 4 21\n[\'kiwi\', \'poire\', \'pomme\'] 2 3', why: '`append` ajoute 18 à la fin de la liste : `notes[-1]` vaut donc 18, pas 9.' },
          { answer: 'YTH 4 30\n[\'pomme\', \'kiwi\', \'poire\'] 2 4', why: '`sorted` appliqué à un dictionnaire renvoie ses clés triées par ordre alphabétique. Et un ensemble ne garde pas les doublons : `{1, 2, 2, 3}` contient 3 éléments.' }
        ],
        hint: 'Traite chaque valeur à part : tranche de chaîne, effet de `append`, indice `-1`, `get` avec une valeur par défaut, `sorted` sur un dictionnaire, doublons dans un ensemble.',
        explain: '`mot[1:4]` donne `yth`, mis en majuscules. Après `append`, la liste a 4 éléments et `notes[-1]` vaut 18 : 12 + 18 = 30. `stock.get("poire", 0)` renvoie 0 car la clé n’existe pas encore, donc `stock["poire"]` vaut 2. `sorted(stock)` trie les clés, et l’ensemble `{1, 2, 2, 3}` ne garde que 3 valeurs distinctes.'
      }
    },
    {
      id: 'pl.collections.3', skill: 'collections', level: 3,
      ex: {
        type: 'code',
        prompt: `Complète \`mot_le_plus_frequent(texte)\` : elle renvoie le mot qui apparaît le plus souvent dans \`texte\`.

- Les majuscules ne comptent pas : \`Le\` et \`le\` sont le même mot. Renvoie le mot en minuscules.
- Les signes \`.\` \`,\` \`!\` et \`?\` sont ignorés.
- En cas d’égalité, renvoie le mot apparu en premier dans le texte.
- S’il n’y a aucun mot, renvoie \`None\`.

Exemple : \`mot_le_plus_frequent("Le chat voit le chien. Le chien dort.")\` renvoie \`"le"\`.`,
        starter: `def mot_le_plus_frequent(texte):
    compte = {}
    for mot in texte.split():
        compte[mot] = compte.get(mot, 0) + 1
    # à compléter
    return None
`,
        solution: `def mot_le_plus_frequent(texte):
    for signe in ".,!?":
        texte = texte.replace(signe, " ")
    compte = {}
    for mot in texte.lower().split():
        compte[mot] = compte.get(mot, 0) + 1
    meilleur = None
    for mot in compte:
        if meilleur is None or compte[mot] > compte[meilleur]:
            meilleur = mot
    return meilleur
`,
        tests: [
          { code: 'assert mot_le_plus_frequent("Le chat voit le chien. Le chien dort.") == "le"', label: 'Exemple de l’énoncé : renvoie "le"' },
          { code: 'assert mot_le_plus_frequent("Vite ! Vite, vite.") == "vite"', label: 'Majuscules et ponctuation ignorées : renvoie "vite"' },
          { code: 'assert mot_le_plus_frequent("pomme kiwi kiwi pomme") == "pomme"', label: 'Égalité : renvoie le mot apparu en premier' },
          { code: 'assert mot_le_plus_frequent("") is None and mot_le_plus_frequent(" ?! ") is None', label: 'Aucun mot : renvoie None' }
        ],
        hint: 'Nettoie d’abord le texte (ponctuation, minuscules), compte avec un dictionnaire, puis parcours-le en ne changeant de meilleur mot que si un autre fait strictement mieux.',
        explain: 'Chaque signe est remplacé par un espace, puis `lower().split()` donne des mots propres. Le dictionnaire `compte` associe chaque mot à son nombre d’apparitions. Un dictionnaire garde l’ordre d’insertion : en le parcourant avec une comparaison stricte `>`, le premier mot rencontré l’emporte en cas d’égalité. Sans aucun mot, `meilleur` reste à `None`.'
      }
    },

    // ---------- Fonctions ----------
    {
      id: 'pl.fonctions.1', skill: 'fonctions', level: 1,
      ex: {
        type: 'fill',
        prompt: 'Complète la fonction pour que le programme affiche `13`.',
        code: `def aire_rectangle(largeur, hauteur):
    ___ largeur * hauteur

surface = aire_rectangle(4, 3)
print(surface + 1)`,
        blanks: [
          {
            answers: ['return'],
            options: ['return', 'print', 'resultat ='],
            why: {
              'print': '`print` affiche 12, mais la fonction renvoie alors `None` : `surface + 1` lève une `TypeError`.',
              'resultat =': 'La valeur est rangée dans une variable locale, mais rien n’est renvoyé : la fonction renvoie `None` et `surface + 1` lève une erreur.'
            }
          }
        ],
        output: '13',
        hint: 'Le résultat de la fonction sert dans un calcul après l’appel. Quel mot-clé le fait sortir de la fonction ?',
        explain: '`return` renvoie la valeur à l’endroit de l’appel : `aire_rectangle(4, 3)` vaut 12, donc `surface + 1` affiche 13. Sans `return`, une fonction renvoie `None`, et `None + 1` provoque une erreur. Afficher une valeur et la renvoyer sont deux choses différentes.'
      }
    },
    {
      id: 'pl.fonctions.2', skill: 'fonctions', level: 2,
      ex: {
        type: 'predict',
        prompt: 'Qu’affiche ce programme ?',
        code: `compteur = 10

def ajouter(valeur, pas=1):
    compteur = valeur + pas
    return compteur

def incrementer():
    global compteur
    compteur += 1

print(ajouter(5), compteur)
incrementer()
print(ajouter(pas=3, valeur=1), compteur)`,
        answer: `6 10
4 11`,
        mistakes: [
          { answer: '6 6\n4 4', why: 'Dans `ajouter`, l’affectation `compteur = ...` crée une variable **locale** qui masque la globale. La variable globale `compteur` n’est pas modifiée par cette fonction.' },
          { answer: '6 10\n4 10', why: '`incrementer` déclare `global compteur` : cette fois, c’est bien la variable globale qui passe de 10 à 11.' },
          { answer: '6 10\n6 11', why: 'Les arguments nommés peuvent être donnés dans n’importe quel ordre : `ajouter(pas=3, valeur=1)` calcule 1 + 3 = 4.' }
        ],
        hint: 'Dans chaque fonction, demande-toi si `compteur` désigne la variable globale ou une variable locale. Regarde aussi quelles valeurs reçoivent `valeur` et `pas` à chaque appel.',
        explain: '`ajouter(5)` utilise la valeur par défaut `pas=1` et renvoie 6 ; l’affectation dans la fonction crée une variable locale, donc la globale vaut toujours 10. `incrementer` déclare `global` : la globale passe à 11. Enfin, avec des arguments nommés, l’ordre n’a pas d’importance : `ajouter(pas=3, valeur=1)` renvoie 4.'
      }
    },
    {
      id: 'pl.fonctions.3', skill: 'fonctions', level: 3,
      ex: {
        type: 'code',
        prompt: `En IA, on ramène souvent les données entre 0 et 1 avant l’entraînement. \`normaliser(valeurs)\` doit renvoyer une **nouvelle** liste où chaque valeur \`v\` devient \`(v - min) / (max - min)\`, sans modifier la liste reçue.

- \`normaliser([2, 4, 6])\` renvoie \`[0.0, 0.5, 1.0]\`.
- Si toutes les valeurs sont égales, renvoie une liste de \`0.0\` de même longueur.
- \`normaliser([])\` renvoie \`[]\`.

Le code actuel est faux : corrige-le.`,
        starter: `def normaliser(valeurs):
    for i in range(len(valeurs)):
        valeurs[i] = valeurs[i] / max(valeurs)
    return valeurs
`,
        solution: `def normaliser(valeurs):
    if not valeurs:
        return []
    mini, maxi = min(valeurs), max(valeurs)
    if mini == maxi:
        return [0.0] * len(valeurs)
    return [(v - mini) / (maxi - mini) for v in valeurs]
`,
        tests: [
          { code: 'assert normaliser([2, 4, 6]) == [0.0, 0.5, 1.0]', label: 'normaliser([2, 4, 6]) renvoie [0.0, 0.5, 1.0]' },
          { code: 'assert normaliser([10, 0, 5]) == [1.0, 0.0, 0.5]', label: 'normaliser([10, 0, 5]) renvoie [1.0, 0.0, 0.5]' },
          { code: 'donnees = [5, 1, 3]\nresultat = normaliser(donnees)\nassert donnees == [5, 1, 3]', label: 'La liste d’origine n’est pas modifiée' },
          { code: 'assert normaliser([7, 7, 7]) == [0.0, 0.0, 0.0]', label: 'Valeurs toutes égales : que des 0.0 (pas de division par zéro)' },
          { code: 'assert normaliser([]) == []', label: 'normaliser([]) renvoie []' }
        ],
        hint: 'Calcule le minimum et le maximum une seule fois, avant de construire la nouvelle liste. Traite à part la liste vide et le cas où `max - min` vaudrait 0.',
        explain: 'Le code de départ modifie la liste reçue et recalcule `max` pendant qu’il la change, ce qui fausse les résultats ; il oublie aussi le minimum. La solution calcule `mini` et `maxi` une fois, puis une compréhension de liste fabrique une nouvelle liste. Les cas particuliers sont traités avant : liste vide (`min([])` lèverait une erreur) et valeurs égales (division par zéro).'
      }
    },

    // ---------- Lecture de code ----------
    {
      id: 'pl.lecture.1', skill: 'lecture', level: 1,
      ex: {
        type: 'qcm',
        prompt: 'Que fait cette fonction ? Par exemple, que renvoie `mystere([3, 1, 3, 2, 1])` ?',
        code: `def mystere(elements):
    resultat = []
    for x in elements:
        if x not in resultat:
            resultat.append(x)
    return resultat`,
        choices: [
          'Elle enlève les doublons en gardant l’ordre : `[3, 1, 2]`',
          'Elle trie la liste : `[1, 1, 2, 3, 3]`',
          'Elle trie la liste et enlève les doublons : `[1, 2, 3]`',
          'Elle renvoie les valeurs en double : `[3, 1]`'
        ],
        answer: 0,
        why: {
          1: 'Aucune comparaison de taille n’est faite : la fonction ne trie rien. Et une valeur déjà présente n’est pas ajoutée une seconde fois.',
          2: 'Les valeurs sont ajoutées dans l’ordre où on les rencontre : 3 d’abord, puis 1, puis 2. Rien n’est trié.',
          3: 'La condition est `x not in resultat` : une valeur est ajoutée quand elle n’a **pas** encore été vue, donc à sa première apparition.'
        },
        hint: 'Suis la boucle à la main avec `[3, 1, 3, 2, 1]` : à chaque tour, `resultat` change-t-il ?',
        explain: 'La fonction construit une nouvelle liste et n’y ajoute une valeur que si elle n’y est pas déjà. Chaque valeur est donc gardée une seule fois, à sa première apparition : `[3, 1, 2]`. C’est une façon de supprimer les doublons sans perdre l’ordre, ce que `set` ne garantit pas.'
      }
    },
    {
      id: 'pl.lecture.2', skill: 'lecture', level: 2,
      ex: {
        type: 'qcm',
        prompt: 'Lis cette fonction. Que renvoie `mystere([3, 8, 2, 8, 5])`, et que calcule-t-elle en général ?',
        code: `def mystere(valeurs):
    a, b = None, None
    for v in valeurs:
        if a is None or v > a:
            a, b = v, a
        elif v != a and (b is None or v > b):
            b = v
    return b`,
        choices: [
          '`5` : la deuxième plus grande valeur distincte',
          '`8` : la deuxième plus grande valeur, doublons compris',
          '`3` : la valeur rencontrée juste avant le maximum',
          '`8` : la plus grande valeur'
        ],
        answer: 0,
        why: {
          1: 'Le second 8 n’est pas retenu : il n’est pas strictement plus grand que `a` (qui vaut 8), et la condition `v != a` l’écarte du `elif`.',
          2: '`b` prend bien la valeur 3 quand le 8 arrive, mais il change ensuite : 5 est différent de 8 et plus grand que 3.',
          3: 'La plus grande valeur est rangée dans `a`, mais la fonction renvoie `b`.'
        },
        hint: 'Suis `a` et `b` à chaque tour. Quand `a` change, que devient son ancienne valeur ?',
        explain: '`a` garde le maximum et `b` le meilleur second. Quand une valeur dépasse `a`, l’ancien maximum descend dans `b`. Sinon, une valeur différente de `a` et plus grande que `b` remplace `b`. Avec `[3, 8, 2, 8, 5]` : a = 3, puis a = 8 et b = 3 ; le 2 et le second 8 ne changent rien ; enfin b = 5. La fonction renvoie la deuxième plus grande valeur distincte.'
      }
    },

    // ---------- Débogage ----------
    {
      id: 'pl.debogage.1', skill: 'debogage', level: 1,
      ex: {
        type: 'bug',
        prompt: 'Nous sommes mardi, il est 20 h : ce programme devrait afficher `Fermé`, mais il affiche `Ouvert de 10 h à 18 h`. Clique sur la ligne fautive.',
        code: `jour = "mardi"
heure = 20
if jour == "samedi" or "dimanche":
    print("Ouvert de 10 h à 18 h")
elif 9 <= heure < 19:
    print("Ouvert")
else:
    print("Fermé")`,
        bugLine: 3,
        why: '`jour == "samedi" or "dimanche"` se lit `(jour == "samedi") or "dimanche"`. La première partie est fausse, mais une chaîne non vide comme `"dimanche"` compte comme vraie : la condition est donc toujours vraie.',
        fixes: [
          'if jour == "samedi" or jour == "dimanche":',
          'if jour == ("samedi" or "dimanche"):',
          'if jour == "samedi" and "dimanche":',
          'if (jour == "samedi") or ("dimanche"):'
        ],
        fixAnswer: 0,
        fixWhy: {
          1: '`("samedi" or "dimanche")` vaut simplement `"samedi"` : le dimanche ne serait jamais reconnu.',
          2: '`and "dimanche"` est toujours vrai : la condition revient à `jour == "samedi"`, et le dimanche est oublié.',
          3: 'Les parenthèses ne changent rien : `("dimanche")` reste une chaîne non vide, donc vraie.'
        },
        output: 'Fermé',
        hint: 'Une chaîne non vide, utilisée seule comme condition, est-elle vraie ou fausse ?',
        explain: 'Chaque côté d’un `or` doit être une condition complète : il faut répéter `jour ==` des deux côtés (ou écrire `jour in ("samedi", "dimanche")`). Une fois corrigé, mardi n’est pas un jour de week-end et 20 h n’est pas entre 9 h et 19 h : le programme affiche `Fermé`.'
      }
    },
    {
      id: 'pl.debogage.2', skill: 'debogage', level: 2,
      ex: {
        type: 'bug',
        prompt: 'Cette fonction doit retirer les nombres négatifs d’une liste. Avec `[3, -1, -2, 5]`, elle devrait renvoyer `[3, 5]`, mais elle renvoie `[3, -2, 5]`. Clique sur la ligne à corriger.',
        code: `def retirer_negatifs(valeurs):
    for v in valeurs:
        if v < 0:
            valeurs.remove(v)
    return valeurs

print(retirer_negatifs([3, -1, -2, 5]))`,
        bugLine: 2,
        why: 'La boucle parcourt la liste position par position. Quand `remove` retire `-1`, les éléments suivants reculent d’une place : `-2` prend la place de `-1`, et la boucle passe directement à `5`. `-2` n’est jamais examiné. Le problème vient de la liste parcourue : on ne doit pas parcourir la liste qu’on est en train de modifier.',
        fixes: [
          '    for v in valeurs[:]:',
          '    for v in range(len(valeurs)):',
          '    for v in valeurs.copy:'
        ],
        fixAnswer: 0,
        fixWhy: {
          1: '`v` deviendrait un indice (0, 1, 2, 3) et non une valeur : aucun indice n’est négatif, rien ne serait retiré.',
          2: 'Sans parenthèses, `valeurs.copy` désigne la méthode elle-même, pas une copie : Python lève une `TypeError` car une méthode n’est pas itérable.'
        },
        output: '[3, 5]',
        hint: 'Que deviennent les positions des éléments suivants quand on retire un élément pendant que la boucle avance dans la liste ?',
        explain: 'Il ne faut pas modifier une liste pendant qu’on la parcourt. `valeurs[:]` crée une copie : la boucle parcourt la copie intacte pendant que `remove` modifie l’original. Plus simple encore : construire une nouvelle liste avec `[v for v in valeurs if v >= 0]`.'
      }
    },

    // ---------- Logique algorithmique ----------
    {
      id: 'pl.logique.1', skill: 'logique', level: 1,
      ex: {
        type: 'logic',
        lang: 'text',
        prompt: 'Suis cet algorithme à la main. Quelle valeur affiche-t-il ?',
        code: `a ← 0
b ← 1
répéter 6 fois :
    c ← a + b
    a ← b
    b ← c
afficher b`,
        answer: '13',
        accept: ['treize'],
        mistakes: [
          { answer: '8', why: 'Un tour de moins. Note a et b après chaque tour : (1, 1), (1, 2), (2, 3), (3, 5), (5, 8), puis (8, 13) au 6e tour.' },
          { answer: '21', why: 'Un tour de trop : après le 6e tour, b vaut 13. 21 serait la valeur après un 7e tour.' }
        ],
        hint: 'Fais un tableau avec une colonne par variable et une ligne par tour. Attention : `a` reçoit l’**ancienne** valeur de `b`, sauvegardée grâce à `c`.',
        explain: 'À chaque tour, `b` devient la somme des deux valeurs précédentes et `a` reçoit l’ancienne valeur de `b`. Les valeurs successives de `b` sont 1, 2, 3, 5, 8 et 13 : c’est la suite de Fibonacci. Après 6 tours, l’algorithme affiche 13.'
      }
    },
    {
      id: 'pl.logique.2', skill: 'logique', level: 2,
      ex: {
        type: 'logic',
        lang: 'text',
        prompt: 'Quelqu’un choisit un nombre entier entre 1 et 100. Tu proposes un nombre, on te répond « plus grand », « plus petit » ou « trouvé ». Avec la meilleure stratégie, combien d’essais te faut-il **au maximum** pour être sûr de trouver ?',
        answer: '7',
        accept: ['sept', '7 essais'],
        mistakes: [
          { answer: '100', why: 'C’est le pire cas si tu essaies les nombres un par un. En proposant le milieu de l’intervalle restant, chaque réponse élimine la moitié des possibilités.' },
          { answer: '6', why: 'Avec 6 essais, on ne peut distinguer qu’au plus 63 nombres (1 + 2 + 4 + 8 + 16 + 32). Il en faut 100.' },
          { answer: '10', why: 'C’est le pire cas d’une approche par dizaines puis par unités. Couper l’intervalle en deux à chaque essai fait mieux.' }
        ],
        hint: 'Quelle proposition élimine le plus de possibilités, quelle que soit la réponse ? Combien de nombres restent après chaque essai ?',
        explain: 'La meilleure stratégie est la recherche dichotomique : proposer le milieu de l’intervalle restant. Chaque réponse élimine environ la moitié des nombres : 100, 50, 25, 12, 6, 3, 1. Avec k essais, on distingue au plus 1 + 2 + 4 + … nombres : 63 avec 6 essais (pas assez), 127 avec 7. Il faut donc 7 essais au maximum.'
      }
    },
    {
      id: 'pl.logique.3', skill: 'logique', level: 3,
      ex: {
        type: 'code',
        prompt: `Complète \`premier_doublon(valeurs)\` : elle lit la liste de gauche à droite et renvoie la première valeur rencontrée **pour la deuxième fois**. S’il n’y a aucun doublon, elle renvoie \`None\`.

Exemple : dans \`[3, 1, 4, 1, 5, 3]\`, le 1 réapparaît à l’indice 3, avant que le 3 ne réapparaisse (indice 5) : la fonction renvoie \`1\`.

Le code actuel est faux. Vise une solution qui parcourt la liste une seule fois.`,
        starter: `def premier_doublon(valeurs):
    for v in valeurs:
        if valeurs.count(v) > 1:
            return v
    return None
`,
        solution: `def premier_doublon(valeurs):
    deja_vus = set()
    for v in valeurs:
        if v in deja_vus:
            return v
        deja_vus.add(v)
    return None
`,
        tests: [
          { code: 'assert premier_doublon([3, 1, 4, 1, 5, 3]) == 1', label: 'premier_doublon([3, 1, 4, 1, 5, 3]) renvoie 1' },
          { code: 'assert premier_doublon([2, 5, 5, 2]) == 5', label: 'premier_doublon([2, 5, 5, 2]) renvoie 5' },
          { code: 'assert premier_doublon([1, 2, 3]) is None', label: 'Sans doublon : renvoie None' },
          { code: 'assert premier_doublon([]) is None', label: 'Liste vide : renvoie None' }
        ],
        hint: 'Garde en mémoire les valeurs déjà rencontrées. Quelle structure permet de tester très vite si une valeur y figure déjà ?',
        explain: 'Le code de départ renvoie la première valeur qui a un doublon quelque part (3), pas la première qui se répète (1). La bonne approche mémorise les valeurs vues dans un ensemble : dès qu’une valeur y est déjà, c’est le premier doublon. Le test `in` sur un `set` est quasi immédiat, donc la liste n’est parcourue qu’une fois, alors que `count` dans une boucle la reparcourt à chaque tour.'
      }
    },

    // ---------- Bases du web ----------
    {
      id: 'pl.web.1', skill: 'web', level: 1,
      ex: {
        type: 'fill',
        lang: 'html',
        prompt: 'Complète cette page : la partie qui décrit la page (avec le titre de l’onglet), l’adresse du lien et le texte alternatif de l’image.',
        code: `<!doctype html>
<html lang="fr">
  <___>
    <meta charset="utf-8">
    <title>Mon portfolio</title>
  </head>
  <body>
    <h1>Mes projets</h1>
    <a ___="projets.html">Voir mes projets</a>
    <img src="photo.jpg" ___="Photo de profil">
  </body>
</html>`,
        blanks: [
          { answers: ['head'], options: ['head', 'header', 'body'], why: { 'header': '`<header>` est un bloc visible de la page, souvent un bandeau. La partie qui décrit la page et contient le titre de l’onglet est `<head>`.', 'body': '`<body>` contient ce qui s’affiche, et il est déjà ouvert plus bas.' } },
          { answers: ['href'], options: ['href', 'src', 'link'], why: { 'src': '`src` indique la source d’une image ou d’un script, pas la destination d’un lien.', 'link': '`link` est une balise (pour relier une feuille de style), pas un attribut de `<a>`.' } },
          { answers: ['alt'], options: ['alt', 'title', 'name'], why: { 'title': '`title` affiche une bulle au survol, mais ne remplace pas l’image pour les lecteurs d’écran.', 'name': '`name` sert dans les formulaires, pas à décrire une image.' } }
        ],
        hint: 'Une page a deux grandes parties : l’une décrit la page, l’autre s’affiche. Pour le lien et l’image, pense à « référence hypertexte » et à « texte alternatif ».',
        explain: '`<head>` contient les informations sur la page (encodage, titre de l’onglet) et `<body>` ce qui s’affiche. L’attribut `href` donne la destination d’un lien. L’attribut `alt` décrit l’image : il est lu par les lecteurs d’écran et affiché si l’image ne se charge pas.'
      }
    },
    {
      id: 'pl.web.2', skill: 'web', level: 2,
      ex: {
        type: 'code',
        lang: 'html',
        prompt: `Cette page de présentation a plusieurs défauts. Corrige-la :

- ajoute le titre d’onglet \`Ada Lovelace\` ;
- garde un seul titre principal \`h1\` : le sous-titre doit devenir un \`h2\` ;
- remplace la balise \`b\` par la balise qui marque l’importance ;
- ajoute un texte alternatif à l’image ;
- transforme « En savoir plus » en lien vers \`https://fr.wikipedia.org/wiki/Ada_Lovelace\`.`,
        starter: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>Ada Lovelace</h1>
  <h1>Pionnière de la programmation</h1>
  <p>En 1843, elle publie ce qu’on considère souvent comme le <b>premier programme</b> informatique.</p>
  <img src="ada.jpg">
  <p>En savoir plus</p>
</body>
</html>
`,
        solution: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Ada Lovelace</title>
</head>
<body>
  <h1>Ada Lovelace</h1>
  <h2>Pionnière de la programmation</h2>
  <p>En 1843, elle publie ce qu’on considère souvent comme le <strong>premier programme</strong> informatique.</p>
  <img src="ada.jpg" alt="Portrait d’Ada Lovelace">
  <p><a href="https://fr.wikipedia.org/wiki/Ada_Lovelace">En savoir plus</a></p>
</body>
</html>
`,
        checks: [
          { sel: 'title', text: 'Ada Lovelace', label: 'Le titre de l’onglet est « Ada Lovelace »' },
          { sel: 'h1', count: 1, label: 'Un seul titre h1' },
          { sel: 'h2', text: 'Pionnière de la programmation', label: 'Le sous-titre est un h2' },
          { sel: 'strong', text: 'premier programme', label: '« premier programme » est dans une balise strong' },
          { none: 'b', label: 'Plus de balise b' },
          { sel: 'img', attr: 'alt', label: 'L’image a un texte alternatif' },
          { sel: 'a[href="https://fr.wikipedia.org/wiki/Ada_Lovelace"]', text: 'En savoir plus', label: '« En savoir plus » est un lien vers la page Wikipédia' }
        ],
        hint: 'Le titre de l’onglet se place dans `<head>`. Pour l’importance, pense à la balise de sens qui remplace `b`. Un lien s’écrit avec la balise `a` et son attribut `href`.',
        explain: '`<title>`, dans `<head>`, donne le titre de l’onglet et des résultats de recherche. Une page n’a qu’un `h1` ; les sous-titres utilisent `h2`, `h3`… dans l’ordre. `<strong>` indique une importance (du sens), alors que `<b>` ne fait que mettre en gras. `alt` décrit l’image pour qui ne la voit pas, et `<a href="…">` crée le lien.'
      }
    }
  ]
);
