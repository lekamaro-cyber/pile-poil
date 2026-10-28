// CodeQuest : bibliothèque de projets guidés (1/2).
// Projets débutants et intermédiaires : calculatrice, devinettes, site personnel, mots de passe,
// gestionnaire de tâches, analyseur CSV, quiz interactif.
// Chaque étape vérifiée reprend la solution des étapes précédentes : le code est donc assemblé à partir
// de blocs (une fonction par bloc) pour que starter et solution restent cohérents d'une étape à l'autre.
(function () {
  // Assemble des blocs Python séparés par deux lignes vides (convention PEP 8).
  const py = (...blocs) => blocs.join('\n\n\n') + '\n';
  // Assemble des blocs JavaScript séparés par une ligne vide.
  const js = (...blocs) => blocs.join('\n\n') + '\n';

  // =====================================================================================
  // Projet 1 : Calculatrice Python
  // =====================================================================================
  const CA_ADD = `def additionner(a, b):
    return a + b`;
  const CA_SUB = `def soustraire(a, b):
    return a - b`;
  const CA_MUL = `def multiplier(a, b):
    return a * b`;
  const CA_DIV = `def diviser(a, b):
    return a / b`;
  const CA_SUB_0 = `def soustraire(a, b):
    # À toi : renvoie a moins b
    pass`;
  const CA_MUL_0 = `def multiplier(a, b):
    # À toi : renvoie a fois b
    pass`;
  const CA_DIV_0 = `def diviser(a, b):
    # À toi : renvoie a divisé par b
    pass`;
  const CA_CALC = `def calculer(a, operateur, b):
    if operateur == "+":
        return additionner(a, b)
    if operateur == "-":
        return soustraire(a, b)
    if operateur == "*":
        return multiplier(a, b)
    if operateur == "/":
        return diviser(a, b)
    raise ValueError(f"opérateur inconnu : {operateur}")`;
  const CA_CALC_0 = `def calculer(a, operateur, b):
    # À toi : appelle la bonne fonction selon operateur ("+", "-", "*" ou "/").
    # Pour tout autre opérateur, lève un ValueError avec un message clair.
    pass`;
  const CA_DIV2 = `def diviser(a, b):
    if b == 0:
        raise ValueError("division par zéro impossible")
    return a / b`;
  const CA_DIV2_0 = `def diviser(a, b):
    # À toi : si b vaut 0, lève ValueError("division par zéro impossible")
    return a / b`;
  const CA_NOMBRE = `def en_nombre(texte):
    # Fournie : essaie un entier, puis un nombre à virgule.
    try:
        return int(texte)
    except ValueError:
        pass
    try:
        return float(texte)
    except ValueError:
        raise ValueError(f"« {texte} » n'est pas un nombre")`;
  const CA_ANALYSER = `def analyser(texte):
    morceaux = texte.split()
    if len(morceaux) != 3:
        raise ValueError("écris un calcul comme 3 + 4, avec des espaces")
    a = en_nombre(morceaux[0])
    b = en_nombre(morceaux[2])
    return a, morceaux[1], b`;
  const CA_ANALYSER_0 = `def analyser(texte):
    # À toi : découpe texte en 3 morceaux (nombre, opérateur, nombre).
    # S'il n'y a pas exactement 3 morceaux, lève un ValueError.
    # Convertis les deux nombres avec en_nombre et renvoie le tuple (a, operateur, b).
    pass`;
  const CA_FORMATER = `def formater(nombre):
    # Fournie : 7.0 devient "7" et 0.333333 devient "0.3333".
    nombre = round(nombre, 4)
    if nombre == int(nombre):
        return str(int(nombre))
    return str(nombre)`;
  const CA_EVALUER = `def evaluer(texte):
    try:
        a, operateur, b = analyser(texte)
        resultat = calculer(a, operateur, b)
    except ValueError as erreur:
        return f"Erreur : {erreur}"
    return f"{formater(a)} {operateur} {formater(b)} = {formater(resultat)}"`;
  const CA_EVALUER_0 = `def evaluer(texte):
    # À toi : analyse le texte puis calcule le résultat.
    # Si tout va bien, renvoie par exemple "3 + 4 = 7" (utilise formater).
    # Si un ValueError survient, renvoie "Erreur : " suivi du message de l'erreur.
    pass`;
  const CA_BOUCLE = `def calculatrice():
    print("Calculatrice : écris un calcul comme 3 + 4, ou q pour quitter.")
    historique = []
    while True:
        texte = input("> ")
        if texte.strip().lower() == "q":
            break
        ligne = evaluer(texte)
        print(ligne)
        historique.append(ligne)
    print(f"{len(historique)} calcul(s) effectué(s). À bientôt.")
    return historique`;
  const CA_BOUCLE_0 = `def calculatrice():
    # À toi : demande un calcul avec input() tant que l'utilisateur ne tape pas q.
    # Affiche le résultat de evaluer() et garde chaque ligne dans une liste historique.
    # À la fin, renvoie historique.
    pass`;

  const CA_S1 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV);
  const CA_S2 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV, CA_CALC);
  const CA_S3 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC);
  const CA_S4 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER);
  const CA_S5 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER, CA_FORMATER, CA_EVALUER);
  const CA_S6 = py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER, CA_FORMATER, CA_EVALUER, CA_BOUCLE);

  const projetCalculatrice = {
    id: 'pj.calculatrice',
    title: 'Calculatrice Python',
    difficulty: 1,
    lang: 'python',
    summary: 'Une calculatrice en ligne de commande qui comprend « 3 + 4 » et ne plante jamais sur une mauvaise saisie.',
    result: 'Un programme qui lit des calculs tapés au clavier et répond : « 3 + 4 » donne « 3 + 4 = 7 », « 7 / 2 » donne « 7 / 2 = 3.5 », « 10 / 0 » donne « Erreur : division par zéro impossible », et « q » arrête le programme en affichant le nombre de calculs faits.',
    skills: ['py.u3', 'py.u4', 'py.u5', 'py.u6', 'py.u9', 'py.u12'],
    steps: [
      {
        title: 'Étape 1 : les quatre opérations',
        explain: 'Une calculatrice repose sur quatre opérations. On écrit **une fonction par opération** : chacune reçoit deux nombres et **renvoie** le résultat avec `return`, sans rien afficher.\n\nPourquoi renvoyer plutôt qu’afficher ? Parce qu’une valeur renvoyée peut être réutilisée : testée, formatée, combinée à d’autres calculs. C’est ce qui rend le programme vérifiable étape par étape. L’affichage viendra à la toute fin, dans la boucle principale.',
        ex: {
          type: 'code',
          prompt: 'Complète `soustraire`, `multiplier` et `diviser` sur le modèle de `additionner`. Chaque fonction **renvoie** son résultat.',
          starter: py(CA_ADD, CA_SUB_0, CA_MUL_0, CA_DIV_0),
          solution: CA_S1,
          tests: [
            { code: 'assert soustraire(10, 4) == 6', label: 'soustraire(10, 4) renvoie 6' },
            { code: 'assert multiplier(6, 7) == 42', label: 'multiplier(6, 7) renvoie 42' },
            { code: 'assert diviser(7, 2) == 3.5', label: 'diviser(7, 2) renvoie 3.5' },
            { code: 'assert soustraire(2, 5) == -3 and multiplier(-2, 3) == -6', label: 'Les nombres négatifs fonctionnent' }
          ],
          hint: 'Chaque fonction tient en une ligne : `return` suivi de l’opération entre `a` et `b`.',
          explain: 'Chaque fonction renvoie le résultat de l’opération. En Python, `/` donne toujours un nombre à virgule (7 / 2 vaut 3.5), alors que `//` ferait une division entière : pour une calculatrice, `/` est le bon choix.'
        }
      },
      {
        title: 'Étape 2 : choisir l’opération',
        explain: 'L’utilisateur ne tape pas « multiplier », il tape `*`. Il faut donc une fonction **aiguillage** qui reçoit l’opérateur sous forme de texte et appelle la bonne fonction.\n\nQue faire d’un opérateur inconnu comme `^` ? Renvoyer `None` cacherait le problème plus loin. On **lève une exception** `ValueError` avec un message clair : l’erreur est signalée tout de suite, à l’endroit où elle se produit, et le programme pourra l’attraper plus tard pour l’afficher proprement.',
        ex: {
          type: 'code',
          prompt: 'Écris `calculer(a, operateur, b)` : elle appelle la fonction qui correspond à `"+"`, `"-"`, `"*"` ou `"/"`, et lève un `ValueError` pour tout autre opérateur.',
          starter: py(CA_ADD, CA_SUB, CA_MUL, CA_DIV, CA_CALC_0),
          solution: CA_S2,
          tests: [
            { code: 'assert calculer(3, "+", 4) == 7', label: 'calculer(3, "+", 4) renvoie 7' },
            { code: 'assert calculer(10, "-", 4) == 6 and calculer(6, "*", 7) == 42', label: 'La soustraction et la multiplication sont reliées' },
            { code: 'assert calculer(9, "/", 2) == 4.5', label: 'calculer(9, "/", 2) renvoie 4.5' },
            { code: `try:
    calculer(2, "^", 3)
    leve = False
except ValueError:
    leve = True
assert leve, "calculer(2, '^', 3) doit lever un ValueError"`, label: 'Un opérateur inconnu lève un ValueError' }
          ],
          hint: 'Enchaîne des `if operateur == "+":` qui font chacun un `return`. Après le dernier test, il ne reste que le cas inconnu : `raise ValueError(...)`.',
          explain: 'Chaque `if` se termine par un `return`, donc la dernière ligne n’est atteinte que si aucun opérateur ne correspond : c’est là qu’on lève l’erreur. Autre écriture possible : un dictionnaire `{"+": additionner, ...}` qui associe chaque symbole à sa fonction.'
        }
      },
      {
        title: 'Étape 3 : la division par zéro',
        explain: 'Essaie mentalement `diviser(5, 0)` : Python lève `ZeroDivisionError`. Le programme s’arrêterait avec un message en anglais peu clair pour l’utilisateur.\n\nOn choisit une règle simple pour toute la calculatrice : **chaque erreur due à la saisie devient un `ValueError` avec un message en français**. Ainsi, la boucle principale n’aura qu’un seul type d’erreur à attraper. On vérifie donc le diviseur **avant** de diviser : c’est le principe « vérifier d’abord, agir ensuite ».',
        ex: {
          type: 'code',
          prompt: 'Modifie `diviser` : si `b` vaut 0, lève `ValueError("division par zéro impossible")`. Sinon, renvoie `a / b` comme avant.',
          starter: py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2_0, CA_CALC),
          solution: CA_S3,
          tests: [
            { code: 'assert diviser(8, 2) == 4.0', label: 'diviser(8, 2) renvoie toujours 4.0' },
            { code: `try:
    diviser(5, 0)
    leve = False
except ValueError:
    leve = True
assert leve, "diviser(5, 0) doit lever un ValueError"`, label: 'diviser(5, 0) lève un ValueError' },
            { code: `try:
    diviser(5, 0)
    message = ""
except ValueError as e:
    message = str(e)
assert "zéro" in message, "le message doit parler de zéro"`, label: 'Le message d’erreur mentionne le zéro' },
            { code: `try:
    calculer(1, "/", 0)
    leve = False
except ValueError:
    leve = True
assert leve`, label: 'calculer(1, "/", 0) lève aussi un ValueError' }
          ],
          hint: 'Ajoute un `if b == 0:` au début de la fonction, avec un `raise` à l’intérieur.',
          explain: 'Le test `if b == 0` arrive avant la division : l’opération dangereuse n’est jamais exécutée. Comme `calculer` appelle `diviser`, elle profite automatiquement de la correction, sans rien changer d’autre.'
        }
      },
      {
        title: 'Étape 4 : lire une expression « 3 + 4 »',
        explain: 'L’utilisateur tape du **texte** : `"3 + 4"`. Il faut le transformer en données utilisables : un nombre, un opérateur, un autre nombre. C’est l’**analyse** (en anglais, *parsing*).\n\nLa méthode `split()` sans argument découpe sur les espaces et ignore les espaces en trop : `"  10   /  4 ".split()` donne `["10", "/", "4"]`. La fonction fournie `en_nombre` convertit `"3"` en `3` et `"2.5"` en `2.5`, ou lève un `ValueError` si le texte n’est pas un nombre. Toute saisie mal formée doit produire un `ValueError`.',
        ex: {
          type: 'code',
          prompt: 'Écris `analyser(texte)` : découpe le texte, vérifie qu’il y a exactement 3 morceaux (sinon `ValueError`), convertis les nombres avec `en_nombre` et renvoie le tuple `(a, operateur, b)`.',
          starter: py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER_0),
          solution: CA_S4,
          tests: [
            { code: 'assert analyser("3 + 4") == (3, "+", 4)', label: 'analyser("3 + 4") renvoie (3, "+", 4)' },
            { code: 'assert analyser("2.5 * 4") == (2.5, "*", 4)', label: 'Les nombres à virgule sont acceptés' },
            { code: 'assert analyser("  10   /  4 ") == (10, "/", 4)', label: 'Les espaces en trop sont ignorés' },
            { code: `try:
    analyser("3+4")
    leve = False
except ValueError:
    leve = True
assert leve, "sans espaces, il n'y a qu'un morceau : ValueError attendu"`, label: '"3+4" (un seul morceau) lève un ValueError' },
            { code: `try:
    analyser("trois + 4")
    leve = False
except ValueError:
    leve = True
assert leve`, label: '"trois + 4" lève un ValueError' }
          ],
          hint: 'Commence par `morceaux = texte.split()`, puis teste `len(morceaux)`. Le premier nombre est `morceaux[0]`, l’opérateur `morceaux[1]`.',
          explain: '`split()` fait le découpage, `len` vérifie la forme, `en_nombre` vérifie le contenu. Si `en_nombre` lève un `ValueError`, il remonte tout seul jusqu’à l’appelant : inutile de l’attraper ici.'
        }
      },
      {
        title: 'Étape 5 : évaluer sans jamais planter',
        explain: 'On assemble les pièces : `analyser` puis `calculer`. Chacune peut lever un `ValueError`. La fonction `evaluer` les appelle dans un bloc `try` et, en cas d’erreur, **renvoie un message** au lieu de planter.\n\nC’est une bonne organisation : les fonctions de calcul signalent les problèmes avec des exceptions, et **une seule fonction, à la frontière avec l’utilisateur, les transforme en texte lisible**. La fonction fournie `formater` évite d’afficher `7.0` ou `0.3333333333333333`.',
        ex: {
          type: 'code',
          prompt: 'Écris `evaluer(texte)` : elle renvoie `"3 + 4 = 7"` pour un calcul valide (avec `formater` pour chaque nombre), ou `"Erreur : "` suivi du message si un `ValueError` survient.',
          starter: py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER, CA_FORMATER, CA_EVALUER_0),
          solution: CA_S5,
          tests: [
            { code: 'assert evaluer("3 + 4") == "3 + 4 = 7"', label: 'evaluer("3 + 4") renvoie "3 + 4 = 7"' },
            { code: 'assert evaluer("7 / 2") == "7 / 2 = 3.5" and evaluer("1 / 3") == "1 / 3 = 0.3333"', label: 'Les résultats décimaux sont bien formatés' },
            { code: 'assert evaluer("5 / 0") == "Erreur : division par zéro impossible"', label: 'La division par zéro donne un message d’erreur' },
            { code: 'assert evaluer("bonjour").startswith("Erreur : ")', label: 'Une saisie absurde donne un message d’erreur' }
          ],
          hint: 'Mets les deux appels (`analyser` puis `calculer`) dans le `try`. Dans `except ValueError as erreur:`, `str(erreur)` ou `{erreur}` dans une f-string donne le message.',
          explain: 'Le `try` protège les deux appels à la fois. `except ValueError as erreur` récupère l’objet exception, et la f-string affiche son message. Le `return` final n’est exécuté que si aucune erreur n’a eu lieu.'
        }
      },
      {
        title: 'Étape 6 : la boucle interactive',
        explain: 'Dernière pièce : l’échange avec l’utilisateur. Une boucle `while True` demande un calcul avec `input()`, affiche la réponse, et recommence. Le mot `q` fait sortir de la boucle avec `break`.\n\nLa fonction **renvoie aussi l’historique** des réponses : c’est pratique pour la tester. Dans CodeQuest, les saisies sont fournies automatiquement : `3 + 4`, `10 / 0`, `2.5 * 4`, puis `q`. Sur ta machine, il suffira d’appeler `calculatrice()` à la fin du fichier pour jouer pour de vrai.',
        ex: {
          type: 'code',
          prompt: 'Écris `calculatrice()` : boucle qui lit un calcul, s’arrête sur `q`, affiche `evaluer(texte)` et range chaque réponse dans une liste `historique`, renvoyée à la fin.',
          starter: py(CA_ADD, CA_SUB, CA_MUL, CA_DIV2, CA_CALC, CA_NOMBRE, CA_ANALYSER, CA_FORMATER, CA_EVALUER, CA_BOUCLE_0),
          solution: CA_S6,
          stdin: '3 + 4\n10 / 0\n2.5 * 4\nq\n',
          tests: [
            { code: `historique = calculatrice()
assert isinstance(historique, list), "calculatrice() doit renvoyer la liste des réponses"`, label: 'calculatrice() renvoie la liste des réponses' },
            { code: 'assert historique[0] == "3 + 4 = 7"', label: 'La première réponse est "3 + 4 = 7"' },
            { code: 'assert historique[1] == "Erreur : division par zéro impossible"', label: 'La division par zéro ne fait pas planter la boucle' },
            { code: 'assert len(historique) == 3, "q doit arrêter la boucle sans compter comme un calcul"', label: 'q arrête la boucle (3 réponses, pas 4)' }
          ],
          hint: 'Dans `while True:`, lis `texte = input("> ")`. Teste `q` avant d’appeler `evaluer`, sinon « q » serait traité comme un calcul.',
          explain: '`while True` tourne jusqu’au `break`. Comme `evaluer` ne lève jamais d’exception, la boucle ne peut pas planter, même sur `10 / 0`. `texte.strip().lower()` accepte aussi « Q » ou « q » suivi d’un espace.'
        }
      }
    ],
    solution: {
      code: CA_S6 + '\n\n# Sur ta machine : lance la calculatrice.\ncalculatrice()\n',
      explain: 'Le programme est découpé en couches. En bas, des fonctions de calcul pures (`additionner`… `calculer`) qui renvoient des valeurs et lèvent `ValueError` en cas de problème. Au milieu, `analyser` transforme le texte en données. En haut, `evaluer` est la seule à transformer les erreurs en messages, et `calculatrice` gère le dialogue.\n\nCe découpage rend chaque morceau testable séparément. Alternatives : un dictionnaire d’opérateurs à la place des `if`, ou le module `operator` (`operator.add`, etc.). À éviter absolument : `eval(texte)`, qui exécuterait n’importe quel code tapé par l’utilisateur.'
    },
    variant: 'Ajoute la puissance `**` et le modulo `%` dans `calculer` (deux lignes chacun). Garde le dernier résultat dans une variable `ans` utilisable dans le calcul suivant (« ans * 2 »). Plus ambitieux : accepte des calculs à plusieurs opérateurs comme « 2 + 3 * 4 » en respectant les priorités (traite d’abord les `*` et `/`).'
  };

  // =====================================================================================
  // Projet 2 : Jeu de devinettes
  // =====================================================================================
  const DV_COMPARER = `def comparer(proposition, secret):
    if proposition < secret:
        return "trop petit"
    if proposition > secret:
        return "trop grand"
    return "gagné"`;
  const DV_COMPARER_0 = `def comparer(proposition, secret):
    # À toi : renvoie "trop petit", "trop grand" ou "gagné"
    pass`;
  const DV_SIMULEE = `def partie_simulee(secret, propositions, max_essais=7):
    for numero, proposition in enumerate(propositions[:max_essais], start=1):
        if comparer(proposition, secret) == "gagné":
            return numero
    return None`;
  const DV_SIMULEE_0 = `def partie_simulee(secret, propositions, max_essais=7):
    # À toi : parcours les propositions dans l'ordre (au plus max_essais).
    # Renvoie le numéro de l'essai gagnant (1 pour le premier), ou None si perdu.
    pass`;
  const DV_AUTO = `def partie_auto(secret, bas=1, haut=100):
    essais = 0
    while True:
        proposition = (bas + haut) // 2
        essais += 1
        reponse = comparer(proposition, secret)
        if reponse == "gagné":
            return essais
        if reponse == "trop petit":
            bas = proposition + 1
        else:
            haut = proposition - 1`;
  const DV_AUTO_0 = `def partie_auto(secret, bas=1, haut=100):
    # À toi : propose toujours le milieu de l'intervalle [bas, haut],
    # puis réduis l'intervalle selon la réponse de comparer().
    # Renvoie le nombre d'essais utilisés.
    pass`;
  const DV_LIRE = `def lire_proposition(bas=1, haut=100):
    while True:
        texte = input(f"Ta proposition ({bas}-{haut}) : ")
        try:
            nombre = int(texte)
        except ValueError:
            print("Ce n'est pas un nombre entier.")
            continue
        if bas <= nombre <= haut:
            return nombre
        print(f"Choisis un nombre entre {bas} et {haut}.")`;
  const DV_LIRE_0 = `def lire_proposition(bas=1, haut=100):
    # À toi : redemande tant que la saisie n'est pas un entier entre bas et haut.
    # Affiche un message d'aide à chaque saisie refusée. Renvoie l'entier valide.
    pass`;
  const DV_JOUER = `def jouer(secret, max_essais=7):
    print(f"J'ai choisi un nombre entre 1 et 100. Tu as {max_essais} essais.")
    for essai in range(1, max_essais + 1):
        proposition = lire_proposition()
        reponse = comparer(proposition, secret)
        if reponse == "gagné":
            print(f"Gagné en {essai} essai(s) !")
            return essai
        print(f"{proposition} : {reponse}.")
    print(f"Perdu : le nombre était {secret}.")
    return None`;
  const DV_JOUER_0 = `def jouer(secret, max_essais=7):
    # À toi : au plus max_essais tours. À chaque tour, lis une proposition,
    # compare-la au secret et affiche la réponse.
    # Renvoie le numéro de l'essai gagnant, ou None si la partie est perdue.
    pass`;

  const DV_S2 = py(DV_COMPARER, DV_SIMULEE);
  const DV_S3 = py(DV_COMPARER, DV_SIMULEE, DV_AUTO);
  const DV_S4 = py(DV_COMPARER, DV_SIMULEE, DV_AUTO, DV_LIRE);
  const DV_S5 = py(DV_COMPARER, DV_SIMULEE, DV_AUTO, DV_LIRE, DV_JOUER);

  const projetDevinettes = {
    id: 'pj.devinettes',
    title: 'Jeu de devinettes',
    difficulty: 1,
    lang: 'python',
    summary: 'Le jeu du nombre secret, construit avec une logique testable et une stratégie d’ordinateur imbattable.',
    result: 'Un jeu en console : l’ordinateur choisit un nombre entre 1 et 100, tu as 7 essais. À chaque proposition il répond « trop petit » ou « trop grand », refuse poliment « abc » ou « 150 », et annonce « Gagné en 4 essai(s) ! » ou le nombre secret en cas de défaite. Bonus : une fonction prouve qu’une bonne stratégie trouve toujours en 7 essais au plus.',
    skills: ['py.u2', 'py.u4', 'py.u5', 'py.u7', 'py.u9', 'py.u11', 'py.u12'],
    steps: [
      {
        title: 'Étape 1 : comparer une proposition',
        explain: 'Le cœur du jeu est une règle simple : comparer une proposition au nombre secret. On l’isole dans une **fonction qui renvoie un texte**, sans `input()` ni `print()`.\n\nC’est le principe le plus utile de ce projet : **séparer la logique du dialogue**. Une fonction sans saisie se teste en une ligne (`comparer(30, 42)`), alors qu’une boucle avec `input()` demande de jouer une partie entière à chaque essai. Les étapes suivantes s’appuieront toutes sur `comparer`.',
        ex: {
          type: 'code',
          prompt: 'Écris `comparer(proposition, secret)` : elle renvoie `"trop petit"`, `"trop grand"` ou `"gagné"`.',
          starter: py(DV_COMPARER_0),
          solution: py(DV_COMPARER),
          tests: [
            { code: 'assert comparer(30, 42) == "trop petit"', label: 'comparer(30, 42) renvoie "trop petit"' },
            { code: 'assert comparer(50, 42) == "trop grand"', label: 'comparer(50, 42) renvoie "trop grand"' },
            { code: 'assert comparer(42, 42) == "gagné"', label: 'comparer(42, 42) renvoie "gagné"' }
          ],
          hint: 'Deux `if` avec `return` suffisent : si ce n’est ni plus petit ni plus grand, c’est égal.',
          explain: 'Après les deux premiers tests, il ne reste qu’un cas possible : l’égalité. Le dernier `return` n’a donc pas besoin de condition.'
        }
      },
      {
        title: 'Étape 2 : simuler une partie',
        explain: 'Avant de jouer au clavier, on **simule** une partie : la fonction reçoit la liste des propositions d’un joueur imaginaire et renvoie le numéro de l’essai gagnant.\n\nDeux outils rendent le code court. `enumerate(liste, start=1)` numérote les éléments à partir de 1. Le découpage `propositions[:max_essais]` garde seulement les premiers essais autorisés : au-delà de 7 essais, la partie est perdue et la fonction renvoie `None`. Simuler permet de tester des dizaines de parties en une fraction de seconde.',
        ex: {
          type: 'code',
          prompt: 'Écris `partie_simulee(secret, propositions, max_essais=7)` : renvoie le numéro (à partir de 1) du premier essai gagnant, ou `None` si le secret n’est pas trouvé dans les `max_essais` premiers essais.',
          starter: py(DV_COMPARER, DV_SIMULEE_0),
          solution: DV_S2,
          tests: [
            { code: 'assert partie_simulee(42, [50, 25, 42]) == 3', label: 'Trouvé au 3e essai : renvoie 3' },
            { code: 'assert partie_simulee(42, [42]) == 1 and partie_simulee(42, [10, 42, 99]) == 2', label: 'La partie s’arrête dès que le secret est trouvé' },
            { code: 'assert partie_simulee(42, [1, 2, 3]) is None', label: 'Jamais trouvé : renvoie None' },
            { code: 'assert partie_simulee(42, [1, 2, 3, 4, 5, 6, 7, 42]) is None', label: 'Trouvé au 8e essai seulement : perdu (None)' },
            { code: 'assert partie_simulee(42, [50, 42], max_essais=1) is None', label: 'max_essais est respecté' }
          ],
          hint: 'Parcours `enumerate(propositions[:max_essais], start=1)` : tu obtiens à la fois le numéro et la proposition. Utilise `comparer` pour savoir si c’est gagné.',
          explain: 'Le découpage `[:max_essais]` règle la limite d’essais sans compteur ni `break`. Si la boucle se termine sans `return`, aucune proposition n’a gagné : la fonction renvoie `None`.'
        }
      },
      {
        title: 'Étape 3 : la stratégie de l’ordinateur',
        explain: 'Combien d’essais faut-il au pire ? La meilleure stratégie consiste à proposer **le milieu de l’intervalle possible**. Si c’est trop petit, le secret est au-dessus : on remonte la borne basse. Sinon on baisse la borne haute. Chaque essai **divise l’intervalle par deux** : c’est la **recherche dichotomique**.\n\nDe 100 possibilités, on passe à 50, 25, 12, 6, 3, 1 : 7 essais suffisent toujours. C’est pour cela que le jeu en accorde 7. Ton code va le prouver en testant les 100 secrets possibles.',
        ex: {
          type: 'code',
          prompt: 'Écris `partie_auto(secret, bas=1, haut=100)` : l’ordinateur propose `(bas + haut) // 2`, ajuste `bas` ou `haut` selon `comparer`, et renvoie le nombre d’essais utilisés.',
          starter: py(DV_COMPARER, DV_SIMULEE, DV_AUTO_0),
          solution: DV_S3,
          tests: [
            { code: 'assert partie_auto(50) == 1', label: 'Le secret 50 est trouvé au premier essai' },
            { code: 'assert partie_auto(25) == 2', label: 'Le secret 25 est trouvé au deuxième essai' },
            { code: 'assert max(partie_auto(s) for s in range(1, 101)) == 7', label: 'Aucun secret de 1 à 100 ne demande plus de 7 essais' },
            { code: 'assert partie_auto(7, 1, 10) <= 4', label: 'Fonctionne aussi sur un autre intervalle (1 à 10)' }
          ],
          hint: 'Si la réponse est « trop petit », le secret est strictement au-dessus de la proposition : `bas = proposition + 1`. Dans l’autre cas, `haut = proposition - 1`.',
          explain: 'À chaque tour, la moitié des nombres restants est éliminée. Le `+ 1` et le `- 1` sont essentiels : sans eux, l’intervalle pourrait ne plus rétrécir et la boucle tournerait à l’infini.'
        }
      },
      {
        title: 'Étape 4 : lire une proposition au clavier',
        explain: 'Place au vrai joueur. `input()` renvoie toujours du **texte** : il faut le convertir avec `int()`, qui lève un `ValueError` si l’on tape « abc ». On l’attrape avec `try` / `except` et on redemande.\n\nUn nombre valide doit aussi être **dans l’intervalle** : « 150 » est un entier, mais pas une proposition acceptable. La fonction redemande donc tant que la saisie n’est pas correcte. Dans CodeQuest, les saisies sont fournies automatiquement : `abc`, `150`, `42`, puis `7`.',
        ex: {
          type: 'code',
          prompt: 'Écris `lire_proposition(bas=1, haut=100)` : redemande avec `input()` tant que la saisie n’est pas un entier entre `bas` et `haut`, en affichant un message d’aide, puis renvoie l’entier.',
          starter: py(DV_COMPARER, DV_SIMULEE, DV_AUTO, DV_LIRE_0),
          solution: DV_S4,
          stdin: 'abc\n150\n42\n7\n',
          tests: [
            { code: 'assert lire_proposition() == 42', label: 'Après « abc » et « 150 », la saisie 42 est acceptée' },
            { code: 'assert lire_proposition() == 7', label: 'L’appel suivant lit la saisie 7' }
          ],
          hint: 'Structure : `while True:` puis `try: nombre = int(texte)` / `except ValueError:` avec `continue`. Après la conversion, vérifie `bas <= nombre <= haut`.',
          explain: '`continue` relance la boucle dès que la conversion échoue. La comparaison enchaînée `bas <= nombre <= haut` vérifie les deux bornes à la fois. Seul un `return` fait sortir de la boucle : la fonction ne renvoie jamais une saisie invalide.'
        }
      },
      {
        title: 'Étape 5 : la vraie partie',
        explain: 'Tout est prêt : il reste à assembler. La fonction `jouer` fait au plus `max_essais` tours ; à chaque tour, elle lit une proposition, la compare au secret et affiche la réponse.\n\nLe secret est un **paramètre** : dans les tests on choisit 42, et sur ta machine on passera `random.randint(1, 100)`. Rendre le hasard extérieur à la fonction est une technique classique pour tester un programme qui utilise des valeurs aléatoires. Saisies fournies : `50`, `25`, `37`, `42`, puis `10`, `abc`, `90`.',
        ex: {
          type: 'code',
          prompt: 'Écris `jouer(secret, max_essais=7)` avec `lire_proposition` et `comparer`. Renvoie le numéro de l’essai gagnant, ou `None` après `max_essais` essais ratés (en révélant le secret).',
          starter: py(DV_COMPARER, DV_SIMULEE, DV_AUTO, DV_LIRE, DV_JOUER_0),
          solution: DV_S5,
          stdin: '50\n25\n37\n42\n10\nabc\n90\n',
          tests: [
            { code: 'assert jouer(42) == 4', label: 'Avec 50, 25, 37 puis 42 : gagné en 4 essais' },
            { code: 'assert jouer(5, max_essais=2) is None', label: 'Avec 2 essais ratés (10 puis 90) : perdu, renvoie None' }
          ],
          hint: 'Une boucle `for essai in range(1, max_essais + 1):` donne directement le numéro de l’essai. Après la boucle, c’est perdu.',
          explain: 'La boucle `for` limite naturellement le nombre d’essais. La saisie « abc » ne coûte pas d’essai, car `lire_proposition` redemande sans rendre la main. Toute la logique de comparaison vient de `comparer`, déjà testée.'
        }
      }
    ],
    solution: {
      code: 'import random\n\n\n' + DV_S5 + '\n\n# Sur ta machine : une partie avec un secret tiré au hasard.\njouer(random.randint(1, 100))\n',
      explain: 'La logique (`comparer`, `partie_simulee`, `partie_auto`) est séparée du dialogue (`lire_proposition`, `jouer`). Les premières se testent instantanément, les secondes se testent avec des saisies simulées.\n\nLe secret est passé en paramètre au lieu d’être tiré dans `jouer` : c’est ce qui rend la partie testable. La dichotomie de `partie_auto` explique le choix des 7 essais : 2 puissance 7 vaut 128, plus que les 100 possibilités.'
    },
    variant: 'Ajoute des niveaux de difficulté (1 à 10 avec 4 essais, 1 à 1000 avec 10 essais : calcule le bon nombre d’essais avec la dichotomie). Garde le meilleur score dans un fichier texte. Inverse les rôles : tu choisis le nombre et l’ordinateur devine avec `partie_auto`, en te demandant « trop petit » ou « trop grand ».'
  };

  // =====================================================================================
  // Projet 3 : Site personnel (portfolio)
  // =====================================================================================
  // Construit la page complète à partir de ses morceaux (meta viewport, CSS, corps).
  const sitePage = (o) => '<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="utf-8">\n'
    + (o.viewport ? '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' : '')
    + '  <title>Alex Martin, développeur web</title>\n'
    + (o.css != null ? '  <style>\n' + o.css + '  </style>\n' : '')
    + '</head>\n<body>\n' + o.body + '</body>\n</html>\n';

  const SI_HEADER = `  <header>
    <h1>Alex Martin</h1>
    <p>Développeur web et data. Je construis des applications utiles, rapides et accessibles.</p>
    <nav>
      <ul>
        <li><a href="#a-propos">À propos</a></li>
        <li><a href="#projets">Projets</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
`;
  const SI_HEADER_A11Y = SI_HEADER.replace('<nav>', '<nav aria-label="Menu principal">');
  const SI_APROPOS = `    <section id="a-propos">
      <h2>À propos</h2>
      <p>J’apprends Python, JavaScript et la data science. J’aime transformer une idée en programme qui marche, puis l’améliorer pas à pas.</p>
    </section>
`;
  const SI_APROPOS_PHOTO = `    <section id="a-propos">
      <h2>À propos</h2>
      <img src="photo-alex.jpg" alt="Portrait d’Alex Martin" width="160" height="160">
      <p>J’apprends Python, JavaScript et la data science. J’aime transformer une idée en programme qui marche, puis l’améliorer pas à pas.</p>
    </section>
`;
  const SI_PROJETS_VIDE = `    <section id="projets">
      <h2>Projets</h2>
      <p>Mes projets arrivent bientôt.</p>
    </section>
`;
  const SI_PROJETS = `    <section id="projets">
      <h2>Projets</h2>
      <div class="projets">
        <article class="projet">
          <h3>Calculatrice Python</h3>
          <p>Une calculatrice en console qui comprend « 3 + 4 » et gère toutes les erreurs de saisie.</p>
          <p class="techno">Python, exceptions, tests</p>
        </article>
        <article class="projet">
          <h3>Quiz interactif</h3>
          <p>Un quiz dans le navigateur : questions, réponses au clic, score et écran de fin.</p>
          <p class="techno">JavaScript, DOM, événements</p>
        </article>
        <article class="projet">
          <h3>Compteurs vélo</h3>
          <p>Analyse d’un extrait de données de comptage : nettoyage, moyennes et effet de la pluie.</p>
          <p class="techno">Python, CSV, statistiques</p>
        </article>
      </div>
    </section>
`;
  const SI_CONTACT = `    <section id="contact">
      <h2>Contact</h2>
      <p>Écris-moi : <a href="mailto:alex.martin@example.com">alex.martin@example.com</a></p>
    </section>
`;
  const SI_CONTACT_FORM = `    <section id="contact">
      <h2>Contact</h2>
      <p>Écris-moi : <a href="mailto:alex.martin@example.com">alex.martin@example.com</a>, ou utilise ce formulaire.</p>
      <form action="#" method="post">
        <label for="nom">Nom</label>
        <input id="nom" name="nom" type="text" autocomplete="name" required>
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required></textarea>
        <button type="submit">Envoyer</button>
      </form>
    </section>
`;
  const SI_FOOTER = `  <footer>
    <p>© 2026 Alex Martin</p>
  </footer>
`;
  const siBody = (header, apropos, projets, contact, mainOuvrant) => header
    + (mainOuvrant || '  <main>\n') + apropos + projets + contact + '  </main>\n' + SI_FOOTER;

  const SI_CSS_BASE = `    :root {
      --fond: #f8f9fc;
      --texte: #1f2333;
      --accent: #3b5bdb;
    }
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      line-height: 1.6;
      color: var(--texte);
      background: var(--fond);
    }
    header, main, footer {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0;
    }
    nav ul {
      display: flex;
      gap: 1rem;
      list-style: none;
      padding: 0;
    }
    nav a {
      color: var(--accent);
      font-weight: bold;
      text-decoration: none;
    }
`;
  const SI_CSS_GRILLE = `    .projets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
    }
    .projet {
      background: #ffffff;
      border: 1px solid #dde1ee;
      border-radius: 8px;
      padding: 1rem;
    }
    .projet h3 {
      margin-top: 0;
    }
    .techno {
      color: #5c6178;
      font-size: 0.9rem;
    }
`;
  const SI_CSS_RESPONSIVE = `    img {
      max-width: 100%;
      height: auto;
      border-radius: 50%;
    }
    @media (max-width: 600px) {
      h1 {
        font-size: 1.75rem;
      }
      nav ul {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
`;
  const SI_CSS_A11Y = `    .evitement {
      position: absolute;
      left: -999px;
    }
    .evitement:focus {
      left: 1rem;
      top: 1rem;
      padding: 0.5rem;
      background: #ffffff;
    }
    a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 2px;
    }
    form {
      display: grid;
      gap: 0.5rem;
      max-width: 420px;
    }
`;

  const SI_S1 = sitePage({ body: siBody(SI_HEADER, SI_APROPOS, SI_PROJETS_VIDE, SI_CONTACT) });
  const SI_S2 = sitePage({ css: SI_CSS_BASE, body: siBody(SI_HEADER, SI_APROPOS, SI_PROJETS_VIDE, SI_CONTACT) });
  const SI_S3 = sitePage({ css: SI_CSS_BASE + SI_CSS_GRILLE, body: siBody(SI_HEADER, SI_APROPOS, SI_PROJETS, SI_CONTACT) });
  const SI_S4 = sitePage({ viewport: true, css: SI_CSS_BASE + SI_CSS_GRILLE + SI_CSS_RESPONSIVE, body: siBody(SI_HEADER, SI_APROPOS_PHOTO, SI_PROJETS, SI_CONTACT) });
  const SI_S5 = sitePage({
    viewport: true,
    css: SI_CSS_BASE + SI_CSS_GRILLE + SI_CSS_RESPONSIVE + SI_CSS_A11Y,
    body: '  <a class="evitement" href="#contenu">Aller au contenu</a>\n'
      + siBody(SI_HEADER_A11Y, SI_APROPOS_PHOTO, SI_PROJETS, SI_CONTACT_FORM, '  <main id="contenu">\n')
  });

  const projetSite = {
    id: 'pj.site-perso',
    title: 'Site personnel',
    difficulty: 1,
    lang: 'html',
    summary: 'Ton portfolio de développeur : une page claire, bien structurée, lisible sur téléphone et accessible.',
    result: 'Une page web d’une seule page avec un en-tête (nom, présentation, menu), une section « À propos » avec photo, une grille de trois projets qui se réorganise seule selon la largeur de l’écran, un formulaire de contact accessible, et un menu qui s’empile sur téléphone. Elle s’ouvre dans n’importe quel navigateur et peut être publiée telle quelle.',
    skills: ['web.u1', 'web.u2', 'web.u4', 'web.u5', 'web.u7', 'web.u9', 'web.u10', 'web.u11', 'web.u13'],
    steps: [
      {
        title: 'Étape 1 : la structure sémantique',
        explain: 'Avant la moindre couleur, on pose la **structure**. Chaque partie de la page a une balise qui dit ce qu’elle est : `header` pour l’en-tête, `nav` pour le menu, `main` pour le contenu principal, `section` pour chaque partie, `footer` pour le pied de page.\n\nCes balises **sémantiques** aident les lecteurs d’écran (utilisés notamment par les personnes aveugles ou malvoyantes), les moteurs de recherche et toi-même quand tu reliras ton code. Un seul `h1` par page : ton nom. Les sections ont des `id` pour que les liens du menu (`href="#projets"`) y mènent directement.',
        ex: {
          type: 'code',
          prompt: 'Remplis le `body` : un `header` avec ton nom en `h1`, une phrase de présentation et un `nav` de 3 liens (`#a-propos`, `#projets`, `#contact`) ; un `main` avec 3 `section` (id `a-propos`, `projets`, `contact`), chacune avec un `h2` ; un lien `mailto:` dans le contact ; un `footer`.',
          starter: sitePage({ body: '  <!-- À toi : header (h1, présentation, nav de 3 liens), main (3 sections avec un h2), footer. -->\n' }),
          solution: SI_S1,
          checks: [
            { sel: 'h1', count: 1, label: 'Un seul titre h1 sur la page' },
            { sel: 'header h1', label: 'Le h1 est dans le header' },
            { sel: 'header nav a', count: 3, label: 'Le menu (nav dans le header) contient 3 liens' },
            { sel: 'nav a[href="#projets"]', label: 'Un lien du menu mène à #projets' },
            { sel: 'main > section', count: 3, label: 'Le main contient 3 sections' },
            { sel: 'section#a-propos, section#projets, section#contact', count: 3, label: 'Les sections ont les id a-propos, projets et contact' },
            { sel: 'main section h2', count: 3, label: 'Chaque section a un titre h2' },
            { sel: '#contact a[href^="mailto:"]', label: 'Un lien e-mail (mailto:) dans la section contact' },
            { sel: 'footer', label: 'Un pied de page footer' },
            { none: 'div', label: 'Pas de div pour la structure : uniquement des balises qui ont un sens' }
          ],
          hint: 'Écris d’abord les grandes boîtes vides (`header`, `main`, `footer`), puis remplis-les. Le menu est une liste : `nav > ul > li > a`.',
          explain: 'La page se lit comme un plan : un titre, un menu, trois parties, un pied de page. Le `ul` dans le `nav` est la façon recommandée d’écrire un menu : c’est une liste de liens, et les lecteurs d’écran annoncent leur nombre.'
        }
      },
      {
        title: 'Étape 2 : la mise en forme',
        explain: 'On ajoute un bloc `style` dans le `head`. On commence par des **variables CSS** (`--accent: #3b5bdb;`) : la couleur principale est définie une seule fois et réutilisée avec `var(--accent)`. Changer de thème ne demandera qu’une ligne.\n\nTrois réglages font une grande différence : supprimer la marge par défaut du `body`, **limiter la largeur du texte** (une ligne de plus de 80 caractères se lit mal) avec `max-width` et `margin: 0 auto` pour centrer, et un menu horizontal en **flexbox**, sans puces ni soulignement.',
        ex: {
          type: 'code',
          prompt: 'Dans le `style` : variables `--fond`, `--texte`, `--accent: #3b5bdb` ; `body` sans marge ; `header`, `main`, `footer` limités à `max-width: 960px` et centrés ; `h1` à `2.5rem` ; `nav ul` en `display: flex` avec `gap: 1rem` et sans puces ; liens du menu de couleur `var(--accent)` sans soulignement.',
          starter: sitePage({ css: '    /* À toi : variables, body, largeur du contenu, h1, menu en flexbox. */\n', body: siBody(SI_HEADER, SI_APROPOS, SI_PROJETS_VIDE, SI_CONTACT) }),
          solution: SI_S2,
          checks: [
            { sel: 'body', style: { 'margin-top': '0px' }, label: 'Le body n’a plus de marge (margin: 0)' },
            { sel: 'main', style: { 'max-width': '960px' }, label: 'Le contenu est limité à 960 px de large' },
            { sel: 'h1', style: { 'font-size': '40px' }, label: 'Le h1 mesure 2.5rem (40 px)' },
            { sel: 'nav ul', style: { display: 'flex' }, label: 'Le menu est en flexbox' },
            { sel: 'nav ul', style: { 'list-style-type': 'none' }, label: 'Le menu n’a plus de puces' },
            { sel: 'nav a', style: { color: 'rgb(59, 91, 219)', 'text-decoration-line': 'none' }, label: 'Liens du menu : couleur #3b5bdb, sans soulignement' }
          ],
          hint: '`list-style: none` retire les puces, `text-decoration: none` retire le soulignement. Pour centrer un bloc de largeur limitée : `margin: 0 auto`.',
          explain: '`max-width` (et non `width`) laisse le contenu rétrécir sur un petit écran tout en le limitant sur un grand. Les variables CSS rendent le thème facile à changer et la couleur d’accent reste cohérente partout.'
        }
      },
      {
        title: 'Étape 3 : la grille de projets',
        explain: 'Un portfolio montre des **projets**. Chacun devient une carte `article` (un contenu qui a du sens seul) avec un titre `h3`, une description et les technologies utilisées.\n\nPour les ranger, on utilise **CSS Grid** sur un conteneur `div class="projets"`. Ici le `div` est légitime : c’est une boîte de mise en page sans sens particulier. La ligne clé est `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` : « autant de colonnes que possible, chacune d’au moins 220 px ». La grille passe toute seule de 3 colonnes à 1 sur un téléphone, sans media query.',
        ex: {
          type: 'code',
          prompt: 'Remplace le paragraphe de la section projets par un `div class="projets"` contenant 3 `article class="projet"` (un `h3` et une description chacun). En CSS : `.projets` en grille avec `repeat(auto-fit, minmax(220px, 1fr))` et `gap: 1.5rem` ; `.projet` sur fond blanc `#ffffff` avec `border-radius: 8px`.',
          starter: SI_S2.replace('<p>Mes projets arrivent bientôt.</p>', '<!-- À toi : un div.projets avec 3 article.projet (h3 + description) -->\n      <p>Mes projets arrivent bientôt.</p>').replace('  </style>', '    /* À toi : la grille .projets et les cartes .projet */\n  </style>'),
          solution: SI_S3,
          checks: [
            { sel: '#projets .projets > article.projet', count: 3, label: '3 cartes article.projet dans le conteneur .projets' },
            { sel: '.projet h3', count: 3, label: 'Chaque carte a un titre h3' },
            { sel: '.projets', style: { display: 'grid' }, label: 'Le conteneur .projets est une grille (display: grid)' },
            { sel: '.projets', style: { 'column-gap': '24px', 'row-gap': '24px' }, label: 'Espace de 1.5rem (24 px) entre les cartes' },
            { sel: '.projet', style: { 'background-color': 'rgb(255, 255, 255)', 'border-top-left-radius': '8px' }, label: 'Cartes blanches aux coins arrondis (8 px)' }
          ],
          hint: 'La grille se règle sur le **conteneur** `.projets`, pas sur les cartes. Les cartes, elles, reçoivent le fond, la bordure et le `padding`.',
          explain: '`auto-fit` crée autant de colonnes que la largeur le permet, et `minmax(220px, 1fr)` impose un minimum de 220 px puis partage l’espace restant. Le `h3` respecte la hiérarchie : les cartes sont des sous-parties de la section « Projets » (h2).'
        }
      },
      {
        title: 'Étape 4 : adapter la page au téléphone',
        explain: 'Plus de la moitié des visites se font sur téléphone. Trois gestes rendent la page **responsive**.\n\nD’abord la balise `meta name="viewport"` : sans elle, le téléphone affiche la page comme sur un écran d’ordinateur, en tout petit. Ensuite `img { max-width: 100%; height: auto; }` : une image ne dépasse jamais de son conteneur. Enfin une **media query** `@media (max-width: 600px)` applique des règles seulement sur les petits écrans : un titre plus petit et un menu empilé en colonne. On ajoute aussi une photo, avec son texte alternatif `alt`.',
        ex: {
          type: 'code',
          prompt: 'Ajoute la `meta name="viewport"` (`width=device-width, initial-scale=1`), une `img` avec un `alt` descriptif dans la section À propos, la règle `img { max-width: 100%; height: auto; }`, et une media query `(max-width: 600px)` qui met le `h1` à `1.75rem` et le menu en `flex-direction: column`.',
          starter: SI_S3.replace('  <title>', '  <!-- À toi : la balise meta viewport -->\n  <title>').replace('      <h2>À propos</h2>\n', '      <h2>À propos</h2>\n      <!-- À toi : une photo avec un texte alternatif -->\n').replace('  </style>', '    /* À toi : images fluides et media query pour les écrans de moins de 600 px */\n  </style>'),
          solution: SI_S4,
          checks: [
            { sel: 'meta[name="viewport"]', label: 'La balise meta viewport est présente' },
            { sel: '#a-propos img', attr: 'alt', label: 'La photo de la section À propos a un texte alternatif (alt)' },
            { sel: 'img', style: { 'max-width': '100%' }, label: 'Les images ne dépassent pas de leur conteneur (max-width: 100%)' },
            { sel: 'nav ul', style: { 'flex-direction': 'column' }, vw: 360, label: 'Sur un écran de 360 px, le menu s’empile (flex-direction: column)' },
            { sel: 'nav ul', style: { 'flex-direction': 'row' }, vw: 800, label: 'Sur un écran de 800 px, le menu reste en ligne' },
            { sel: 'h1', style: { 'font-size': '28px' }, vw: 360, label: 'Sur un écran de 360 px, le h1 passe à 1.75rem (28 px)' }
          ],
          hint: 'La media query s’écrit à la fin du CSS : `@media (max-width: 600px) { h1 { ... } nav ul { ... } }`. Les règles à l’intérieur remplacent les précédentes seulement sur petit écran.',
          explain: 'La media query vient en dernier pour l’emporter sur les règles générales. La grille de projets n’a besoin de rien : `auto-fit` l’adapte déjà. Le `alt` décrit l’image pour qui ne la voit pas ; une image purement décorative aurait `alt=""`.'
        }
      },
      {
        title: 'Étape 5 : l’accessibilité',
        explain: 'Une page accessible se parcourt **au clavier** et avec un **lecteur d’écran**. Quatre ajouts concrets.\n\nUn **lien d’évitement** en tout premier : invisible tant qu’on ne l’atteint pas avec Tab, il permet de sauter le menu et d’aller au `main id="contenu"`. Un **nom accessible** pour le menu : `aria-label="Menu principal"`. Un **contour de focus** visible avec `:focus-visible`. Enfin un **formulaire de contact** où chaque champ a son `label` relié par `for` et `id` : cliquer sur l’étiquette active le champ, et le lecteur d’écran lit l’étiquette. Pour envoyer vraiment le message, il faudra un serveur (parcours Back-end).',
        ex: {
          type: 'code',
          prompt: 'Ajoute en premier dans le `body` un lien `a class="evitement" href="#contenu"` (en `position: absolute`, hors de l’écran sauf au focus), `id="contenu"` sur le `main`, `aria-label="Menu principal"` sur le `nav`, et dans le contact un formulaire : 3 `label` reliés aux champs `nom`, `email` (`type="email"`, `required`) et `message` (`textarea`), plus un `button type="submit"`.',
          starter: SI_S4.replace('<body>\n', '<body>\n  <!-- À toi : le lien d’évitement, en tout premier -->\n').replace('</a></p>\n    </section>', '</a></p>\n      <!-- À toi : le formulaire de contact (nom, email, message, bouton) -->\n    </section>').replace('  </style>', '    /* À toi : .evitement et le contour de focus */\n  </style>'),
          solution: SI_S5,
          checks: [
            { sel: 'body > a.evitement:first-child', attrs: { href: '#contenu' }, label: 'Le premier élément du body est un lien d’évitement vers #contenu' },
            { sel: 'main#contenu', label: 'Le main porte l’id contenu' },
            { sel: '.evitement', style: { position: 'absolute' }, label: 'Le lien d’évitement est sorti du flux (position: absolute)' },
            { sel: 'nav', attrs: { 'aria-label': 'Menu principal' }, label: 'Le nav a un nom accessible : aria-label="Menu principal"' },
            { sel: '#contact form label[for="nom"], #contact form label[for="email"], #contact form label[for="message"]', count: 3, label: 'Les 3 champs ont un label relié (for = id du champ)' },
            { sel: 'input#email', attrs: { type: 'email' }, label: 'Le champ e-mail est de type email' },
            { sel: 'input#email', attr: 'required', label: 'Le champ e-mail est obligatoire (required)' },
            { sel: 'textarea#message', label: 'Le message se saisit dans un textarea id="message"' },
            { sel: '#contact form button', attrs: { type: 'submit' }, label: 'Un bouton d’envoi de type submit' }
          ],
          hint: 'Le lien d’évitement se cache avec `position: absolute; left: -999px;` et réapparaît avec `.evitement:focus { left: 1rem; }`. Pour relier un label, son `for` doit valoir exactement l’`id` du champ.',
          explain: 'Le lien d’évitement fait gagner des dizaines d’appuis sur Tab à chaque page. `type="email"` affiche le bon clavier sur téléphone et vérifie le format, `required` empêche l’envoi d’un champ vide. Le `:focus-visible` n’est pas vérifié ici : teste-le toi-même avec la touche Tab.'
        }
      }
    ],
    solution: {
      code: SI_S5,
      explain: 'La page tient en un seul fichier : structure sémantique, puis CSS du général au particulier (variables, base, grille, media query, accessibilité). La grille `auto-fit` évite une media query pour les projets ; une seule media query règle le titre et le menu.\n\nPour la publier, dépose `index.html` (et ta photo) sur un hébergeur de pages statiques comme GitHub Pages. Vérifie ensuite la page avec l’outil Lighthouse des outils de développement de ton navigateur : il signale les contrastes insuffisants et les oublis d’accessibilité. Pour que le formulaire envoie vraiment, il faudra un petit serveur (parcours Back-end) ou un service de formulaires.'
    },
    variant: 'Ajoute un thème sombre avec `@media (prefers-color-scheme: dark)` en redéfinissant seulement les variables `--fond` et `--texte`. Mets un lien « Voir le code » sur chaque carte de projet. Ajoute une section « Compétences » sous forme de liste et vérifie que chaque niveau de titre suit l’ordre h1, h2, h3 sans en sauter.'
  };

  // =====================================================================================
  // Projet 4 : Générateur de mots de passe
  // =====================================================================================
  const MP_ENTETE = `import math
import random
import string

SYMBOLES = "!#$%&*+-=?@_"`;
  const MP_CLASSES = `def classes_presentes(mot_de_passe):
    classes = set()
    for c in mot_de_passe:
        if c.islower():
            classes.add("minuscule")
        elif c.isupper():
            classes.add("majuscule")
        elif c.isdigit():
            classes.add("chiffre")
        else:
            classes.add("symbole")
    return classes`;
  const MP_CLASSES_0 = `def classes_presentes(mot_de_passe):
    # À toi : renvoie l'ensemble des classes présentes parmi
    # "minuscule", "majuscule", "chiffre" et "symbole" (tout le reste).
    pass`;
  const MP_DICO = `MOTS_COURANTS = ["motdepasse", "password", "azerty", "qwerty", "soleil", "bonjour",
                 "admin", "dragon", "football", "chocolat", "loulou", "doudou"]

REMPLACEMENTS = {"@": "a", "4": "a", "3": "e", "1": "i", "0": "o", "$": "s", "5": "s", "7": "t"}`;
  const MP_NORMALISER = `def normaliser(mot_de_passe):
    resultat = ""
    for c in mot_de_passe.lower():
        resultat += REMPLACEMENTS.get(c, c)
    return resultat`;
  const MP_NORMALISER_0 = `def normaliser(mot_de_passe):
    # À toi : passe en minuscules et remplace chaque caractère présent
    # dans REMPLACEMENTS (par exemple "@" devient "a").
    pass`;
  const MP_CONTIENT = `def contient_mot_courant(mot_de_passe):
    texte = normaliser(mot_de_passe)
    for mot in MOTS_COURANTS:
        if mot in texte:
            return True
    return False`;
  const MP_CONTIENT_0 = `def contient_mot_courant(mot_de_passe):
    # À toi : True si un mot de MOTS_COURANTS apparaît dans le mot de passe normalisé.
    pass`;
  const MP_LONGUEUR = 'LONGUEUR_MIN = 12';
  const MP_PROBLEMES = `def problemes(mot_de_passe):
    liste = []
    if len(mot_de_passe) < LONGUEUR_MIN:
        liste.append(f"trop court : {len(mot_de_passe)} caractères (minimum {LONGUEUR_MIN})")
    presentes = classes_presentes(mot_de_passe)
    manquantes = [c for c in ["minuscule", "majuscule", "chiffre", "symbole"] if c not in presentes]
    if manquantes:
        liste.append("il manque : " + ", ".join(manquantes))
    if contient_mot_courant(mot_de_passe):
        liste.append("contient un mot de passe courant")
    return liste`;
  const MP_PROBLEMES_0 = `def problemes(mot_de_passe):
    # À toi : renvoie la liste des problèmes, dans cet ordre :
    # 1. "trop court : 11 caractères (minimum 12)" si la longueur est insuffisante
    # 2. "il manque : majuscule, chiffre" avec les classes absentes, dans l'ordre
    #    minuscule, majuscule, chiffre, symbole
    # 3. "contient un mot de passe courant"
    pass`;
  const MP_ROBUSTE = `def est_robuste(mot_de_passe):
    return problemes(mot_de_passe) == []`;
  const MP_ROBUSTE_0 = `def est_robuste(mot_de_passe):
    # À toi : True s'il n'y a aucun problème
    pass`;
  const MP_GENERER = `def generer_mot_de_passe(longueur=16):
    if longueur < LONGUEUR_MIN:
        raise ValueError(f"longueur minimale : {LONGUEUR_MIN} caractères")
    familles = [string.ascii_lowercase, string.ascii_uppercase, string.digits, SYMBOLES]
    caracteres = [random.choice(famille) for famille in familles]
    tous = "".join(familles)
    while len(caracteres) < longueur:
        caracteres.append(random.choice(tous))
    random.shuffle(caracteres)
    return "".join(caracteres)`;
  const MP_GENERER_0 = `def generer_mot_de_passe(longueur=16):
    # À toi :
    # - lève un ValueError si longueur < LONGUEUR_MIN
    # - prends un caractère au hasard dans chaque famille (minuscules, majuscules, chiffres, SYMBOLES)
    # - complète avec des caractères pris dans toutes les familles réunies
    # - mélange la liste, puis renvoie-la sous forme de texte
    pass`;
  const MP_MOTS = `MOTS_PHRASE = ["cerise", "volcan", "piano", "nuage", "tigre", "rivage", "bambou", "cactus",
               "orbite", "lanterne", "galet", "renard", "cobalt", "violon", "sapin", "comete"]`;
  const MP_ENTROPIE = `def entropie_bits(taille_alphabet, nombre_tirages):
    return nombre_tirages * math.log2(taille_alphabet)`;
  const MP_ENTROPIE_0 = `def entropie_bits(taille_alphabet, nombre_tirages):
    # À toi : nombre_tirages fois le logarithme en base 2 de taille_alphabet
    pass`;
  const MP_PHRASE = `def generer_phrase(mots, nombre_mots=5, separateur="-"):
    choisis = [random.choice(mots) for _ in range(nombre_mots)]
    return separateur.join(choisis)`;
  const MP_PHRASE_0 = `def generer_phrase(mots, nombre_mots=5, separateur="-"):
    # À toi : tire nombre_mots mots au hasard et relie-les avec separateur
    pass`;

  const MP_S1 = py(MP_ENTETE, MP_CLASSES);
  const MP_S2 = py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT);
  const MP_S3 = py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES, MP_ROBUSTE);
  const MP_S4 = py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES, MP_ROBUSTE, MP_GENERER);
  const MP_S5 = py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES, MP_ROBUSTE, MP_GENERER, MP_MOTS, MP_ENTROPIE, MP_PHRASE);

  const projetMotsDePasse = {
    id: 'pj.mots-de-passe',
    title: 'Générateur de mots de passe',
    difficulty: 2,
    lang: 'python',
    summary: 'Un outil qui évalue la robustesse d’un mot de passe et en génère de solides, avec des règles de sécurité réalistes.',
    result: 'Un module Python qui explique pourquoi « Soleil2026! » est faible (« trop court : 11 caractères », « contient un mot de passe courant »), qui génère des mots de passe de 16 caractères contenant toujours minuscules, majuscules, chiffres et symboles, qui produit des phrases de passe comme « galet-volcan-piano-renard-cobalt », et qui calcule leur force en bits d’entropie.',
    skills: ['py.u4', 'py.u5', 'py.u6', 'py.u7', 'py.u8', 'py.u9', 'py.u11', 'py.u12'],
    steps: [
      {
        title: 'Étape 1 : reconnaître les classes de caractères',
        explain: 'Un mot de passe mélange plusieurs **classes de caractères** : minuscules, majuscules, chiffres, symboles. Plus il y en a, plus l’attaquant doit essayer de combinaisons.\n\nOn commence par une fonction qui renvoie l’**ensemble** (`set`) des classes présentes. Un ensemble est l’outil idéal : chaque classe n’y figure qu’une fois, même si le mot de passe contient dix chiffres, et l’ordre n’a pas d’importance. Les méthodes `islower()`, `isupper()` et `isdigit()` font le tri ; tout le reste (ponctuation, espace) compte comme symbole.',
        ex: {
          type: 'code',
          prompt: 'Écris `classes_presentes(mot_de_passe)` : elle renvoie un `set` contenant `"minuscule"`, `"majuscule"`, `"chiffre"` et/ou `"symbole"` selon les caractères présents.',
          starter: py(MP_ENTETE, MP_CLASSES_0),
          solution: MP_S1,
          tests: [
            { code: 'assert classes_presentes("abc") == {"minuscule"}', label: '"abc" ne contient que des minuscules' },
            { code: 'assert classes_presentes("Abc12") == {"minuscule", "majuscule", "chiffre"}', label: '"Abc12" : minuscule, majuscule, chiffre' },
            { code: 'assert classes_presentes("a B!") == {"minuscule", "majuscule", "symbole"}', label: 'L’espace et « ! » comptent comme symboles' },
            { code: 'assert classes_presentes("") == set()', label: 'Un mot de passe vide donne un ensemble vide' }
          ],
          hint: 'Crée un ensemble vide avec `set()` (et non `{}`, qui crée un dictionnaire), puis ajoute avec `.add()` dans une boucle sur les caractères.',
          explain: 'La chaîne de `if` / `elif` / `else` range chaque caractère dans exactement une classe. Comme `add` n’ajoute pas de doublon, l’ensemble final contient au plus 4 éléments.'
        }
      },
      {
        title: 'Étape 2 : repérer les mots de passe courants',
        explain: 'La longueur ne suffit pas : « Motdepasse2026! » est long et varié, mais les attaquants essaient d’abord les **mots de passe les plus utilisés**, avec leurs variantes. Ils remplacent aussi les lettres par des chiffres ressemblants : « P@ssw0rd » ne trompe personne.\n\nOn **normalise** donc le mot de passe : minuscules, puis chaque caractère de substitution remplacé par la lettre qu’il imite, grâce au dictionnaire `REMPLACEMENTS`. Ensuite on cherche chaque mot de la liste avec l’opérateur `in`. La liste fournie est courte ; les vraies listes de mots de passe divulgués en contiennent des millions.',
        ex: {
          type: 'code',
          prompt: 'Écris `normaliser(mot_de_passe)` (minuscules et remplacements de `REMPLACEMENTS`) puis `contient_mot_courant(mot_de_passe)`, qui renvoie `True` si un mot de `MOTS_COURANTS` apparaît dans le mot de passe normalisé.',
          starter: py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER_0, MP_CONTIENT_0),
          solution: MP_S2,
          tests: [
            { code: 'assert normaliser("P@ssw0rd") == "password"', label: 'normaliser("P@ssw0rd") renvoie "password"' },
            { code: 'assert contient_mot_courant("Soleil2026!")', label: '"Soleil2026!" contient un mot courant' },
            { code: 'assert contient_mot_courant("P@ssw0rd123")', label: 'Les substitutions (@ pour a, 0 pour o) sont déjouées' },
            { code: 'assert not contient_mot_courant("vT8#qL2m!Rx9")', label: 'Un mot de passe aléatoire ne contient aucun mot courant' }
          ],
          hint: '`REMPLACEMENTS.get(c, c)` renvoie le remplacement de `c` s’il existe, sinon `c` lui-même.',
          explain: '`dict.get(cle, defaut)` évite un `if` : les caractères sans remplacement restent identiques. L’opérateur `in` entre deux chaînes cherche une sous-chaîne, donc « soleil » est trouvé dans « soleil2026! ».'
        }
      },
      {
        title: 'Étape 3 : évaluer la robustesse',
        explain: 'On combine les vérifications en une fonction qui renvoie **la liste des problèmes**, plutôt qu’un simple vrai ou faux. L’utilisateur sait ainsi exactement quoi corriger.\n\nLes règles suivent les recommandations actuelles : **au moins 12 caractères**, les quatre classes, aucun mot de passe courant. La longueur est la règle la plus importante : chaque caractère en plus multiplie le nombre de combinaisons. `est_robuste` devient alors une ligne : aucun problème signifie robuste.',
        ex: {
          type: 'code',
          prompt: 'Écris `problemes(mot_de_passe)` (liste de messages, dans l’ordre : longueur, classes manquantes, mot courant) et `est_robuste(mot_de_passe)`. Les messages exacts sont indiqués dans les commentaires du code.',
          starter: py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES_0, MP_ROBUSTE_0),
          solution: MP_S3,
          tests: [
            { code: 'assert problemes("vT8#qL2m!Rx9") == []', label: 'Un bon mot de passe n’a aucun problème' },
            { code: 'assert problemes("Soleil2026!") == ["trop court : 11 caractères (minimum 12)", "contient un mot de passe courant"]', label: '"Soleil2026!" : trop court et mot courant' },
            { code: 'assert problemes("abcdefghijklmnop") == ["il manque : majuscule, chiffre, symbole"]', label: 'Les classes manquantes sont listées dans l’ordre' },
            { code: 'assert est_robuste("vT8#qL2m!Rx9") and not est_robuste("Azerty123456!")', label: 'est_robuste distingue un bon et un mauvais mot de passe' }
          ],
          hint: 'Parcours la liste `["minuscule", "majuscule", "chiffre", "symbole"]` pour garder son ordre, et garde celles qui ne sont pas dans `classes_presentes(...)`. `", ".join(liste)` les relie.',
          explain: 'Parcourir une liste fixe (et non l’ensemble) garantit un ordre stable des messages. « Azerty123456! » a 13 caractères et 4 classes, mais contient « azerty » : la règle du dictionnaire le rejette.'
        }
      },
      {
        title: 'Étape 4 : générer un mot de passe',
        explain: 'Pour générer, on tire d’abord **un caractère de chaque famille** (ce qui garantit les 4 classes), on complète avec des caractères pris dans toutes les familles, puis on **mélange** pour que le symbole ne soit pas toujours en deuxième position.\n\n**Attention, point de sécurité important** : le module `random` produit des suites prévisibles, il sert ici à apprendre. Pour de vrais mots de passe, Python fournit le module `secrets` (`secrets.choice(...)`, et `secrets.SystemRandom().shuffle(...)` pour mélanger), conçu pour la cryptographie. Il n’est pas disponible dans CodeQuest. Comme le résultat est aléatoire, les tests vérifient des **propriétés** (longueur, classes), jamais une valeur précise.',
        ex: {
          type: 'code',
          prompt: 'Écris `generer_mot_de_passe(longueur=16)` : `ValueError` si `longueur < LONGUEUR_MIN`, un caractère de chaque famille, complément aléatoire, mélange avec `random.shuffle`, puis renvoi sous forme de texte.',
          starter: py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES, MP_ROBUSTE, MP_GENERER_0),
          solution: MP_S4,
          tests: [
            { code: 'assert len(generer_mot_de_passe()) == 16 and len(generer_mot_de_passe(20)) == 20', label: 'La longueur demandée est respectée (16 par défaut)' },
            { code: 'assert all(classes_presentes(generer_mot_de_passe(12)) == {"minuscule", "majuscule", "chiffre", "symbole"} for _ in range(50))', label: '50 mots de passe générés contiennent tous les 4 classes' },
            { code: `autorises = string.ascii_lowercase + string.ascii_uppercase + string.digits + SYMBOLES
assert all(c in autorises for c in generer_mot_de_passe(40))`, label: 'Seuls des caractères autorisés sont utilisés' },
            { code: 'assert generer_mot_de_passe() != generer_mot_de_passe()', label: 'Deux mots de passe générés sont différents' },
            { code: `try:
    generer_mot_de_passe(8)
    leve = False
except ValueError:
    leve = True
assert leve, "une longueur de 8 doit être refusée"`, label: 'Une longueur de 8 est refusée (ValueError)' }
          ],
          hint: 'Une liste en compréhension `[random.choice(f) for f in familles]` donne un caractère par famille. Ensuite une boucle `while len(caracteres) < longueur:` complète. `"".join(liste)` transforme la liste en texte.',
          explain: 'On travaille sur une liste, car une chaîne ne peut pas être mélangée sur place. Le premier tirage garantit les 4 classes quelle que soit la chance, le mélange final rend leur position imprévisible.'
        }
      },
      {
        title: 'Étape 5 : mesurer la force et générer une phrase de passe',
        explain: 'Comment comparer deux méthodes ? Avec l’**entropie** en bits : pour des tirages vraiment aléatoires, c’est `nombre_tirages × log2(taille_alphabet)`. 16 caractères parmi 74 donnent environ 99 bits ; chaque bit en plus double le travail de l’attaquant.\n\nUne **phrase de passe** tire des mots au hasard : 6 mots parmi une liste de 7776 donnent environ 77,5 bits, et c’est bien plus facile à retenir. Notre liste de 16 mots est un jouet : 5 mots n’y valent que 20 bits. Une vraie liste contient des milliers de mots. Attention : ce calcul ne vaut que si les mots sont tirés au hasard, pas choisis par une personne.',
        ex: {
          type: 'code',
          prompt: 'Écris `entropie_bits(taille_alphabet, nombre_tirages)` avec `math.log2`, puis `generer_phrase(mots, nombre_mots=5, separateur="-")`, qui tire des mots au hasard dans `mots` et les relie avec `separateur`.',
          starter: py(MP_ENTETE, MP_CLASSES, MP_DICO, MP_NORMALISER, MP_CONTIENT, MP_LONGUEUR, MP_PROBLEMES, MP_ROBUSTE, MP_GENERER, MP_MOTS, MP_ENTROPIE_0, MP_PHRASE_0),
          solution: MP_S5,
          tests: [
            { code: 'assert round(entropie_bits(74, 16), 1) == 99.4', label: '16 caractères parmi 74 : environ 99.4 bits' },
            { code: 'assert round(entropie_bits(7776, 6), 1) == 77.5', label: '6 mots parmi 7776 : environ 77.5 bits' },
            { code: `phrase = generer_phrase(MOTS_PHRASE)
morceaux = phrase.split("-")
assert len(morceaux) == 5 and all(m in MOTS_PHRASE for m in morceaux)`, label: 'Une phrase de 5 mots de la liste, séparés par des tirets' },
            { code: 'assert generer_phrase(["galet"], 3, " ") == "galet galet galet"', label: 'Le nombre de mots et le séparateur sont respectés' }
          ],
          hint: '`math.log2(8)` vaut 3.0. Pour la phrase, une compréhension avec `random.choice(mots)` répétée `nombre_mots` fois, puis `separateur.join(...)`.',
          explain: 'L’entropie multiplie le nombre de tirages par l’information apportée par chacun. Elle montre que la longueur pèse lourd : passer de 12 à 16 caractères ajoute près de 25 bits, soit environ 30 millions de fois plus d’essais.'
        }
      }
    ],
    solution: {
      code: MP_S5.replace('import random\n', 'import random  # pour apprendre ; en vrai : import secrets\n'),
      explain: 'Le module se lit du plus simple au plus complet : analyse des classes, dictionnaire, liste de problèmes, génération, mesure. Chaque fonction est petite et testée seule.\n\nPour un usage réel, remplace `random.choice` par `secrets.choice` et `random.shuffle(liste)` par `secrets.SystemRandom().shuffle(liste)` : le module `secrets` utilise la source d’aléa du système, imprévisible. Pour les phrases de passe, utilise une liste publique de plusieurs milliers de mots, comme celles conçues pour la méthode Diceware. Enfin, le meilleur conseil reste d’utiliser un gestionnaire de mots de passe et un mot de passe différent par site.'
    },
    variant: 'Ajoute une option pour exclure les caractères ambigus (0 et O, 1, l et I). Écris une fonction `score(mot_de_passe)` de 0 à 4 qui tient compte de l’entropie. Charge une liste de mots depuis un fichier texte (un mot par ligne) pour générer des phrases de passe vraiment solides sur ta machine.'
  };

  // =====================================================================================
  // Projet 5 : Gestionnaire de tâches
  // =====================================================================================
  const TA_ENTETE = `import json

PRIORITES = {1: "haute", 2: "moyenne", 3: "basse"}`;
  const TA_AJOUTER = `def ajouter(taches, titre, priorite=2):
    titre = titre.strip()
    if titre == "":
        raise ValueError("le titre ne peut pas être vide")
    if priorite not in PRIORITES:
        raise ValueError("la priorité doit valoir 1, 2 ou 3")
    nouvel_id = max([t["id"] for t in taches], default=0) + 1
    tache = {"id": nouvel_id, "titre": titre, "priorite": priorite, "fait": False}
    taches.append(tache)
    return tache`;
  const TA_AJOUTER_0 = `def ajouter(taches, titre, priorite=2):
    # À toi :
    # - retire les espaces autour du titre ; titre vide : ValueError
    # - priorité absente de PRIORITES : ValueError
    # - id = plus grand id existant + 1 (1 si la liste est vide)
    # - ajoute le dictionnaire {"id", "titre", "priorite", "fait": False} et renvoie-le
    pass`;
  const TA_TROUVER = `def trouver(taches, id_tache):
    for tache in taches:
        if tache["id"] == id_tache:
            return tache
    return None`;
  const TA_SUPPRIMER = `def supprimer(taches, id_tache):
    tache = trouver(taches, id_tache)
    if tache is None:
        return False
    taches.remove(tache)
    return True`;
  const TA_FAIT = `def marquer_fait(taches, id_tache):
    tache = trouver(taches, id_tache)
    if tache is None:
        return False
    tache["fait"] = True
    return True`;
  const TA_GERER_0 = `def trouver(taches, id_tache):
    # À toi : renvoie la tâche qui a cet id, ou None
    pass


def supprimer(taches, id_tache):
    # À toi : retire la tâche de la liste ; True si trouvée, False sinon
    pass


def marquer_fait(taches, id_tache):
    # À toi : passe "fait" à True ; True si trouvée, False sinon
    pass`;
  const TA_TRIER = `def trier(taches):
    return sorted(taches, key=lambda t: (t["fait"], t["priorite"], t["id"]))`;
  const TA_LIGNES = `def lignes(taches):
    resultat = []
    for t in trier(taches):
        case = "x" if t["fait"] else " "
        resultat.append(f"[{case}] #{t['id']} {t['titre']} ({PRIORITES[t['priorite']]})")
    return resultat`;
  const TA_TRIER_0 = `def trier(taches):
    # À toi : nouvelle liste triée : tâches à faire d'abord, puis par priorité, puis par id
    pass


def lignes(taches):
    # À toi : une ligne par tâche triée, par exemple "[ ] #3 Préparer la démo (haute)"
    # ou "[x] #2 Envoyer le CV (haute)" pour une tâche faite
    pass`;
  const TA_SAUVER = `def sauvegarder(taches, nom_fichier):
    with open(nom_fichier, "w") as f:
        f.write(json.dumps(taches))`;
  const TA_CHARGER = `def charger(nom_fichier):
    try:
        with open(nom_fichier) as f:
            return json.loads(f.read())
    except FileNotFoundError:
        return []`;
  const TA_FICHIER_0 = `def sauvegarder(taches, nom_fichier):
    # À toi : écris json.dumps(taches) dans le fichier
    pass


def charger(nom_fichier):
    # À toi : relis le fichier avec json.loads ; s'il n'existe pas, renvoie []
    pass`;
  const TA_CHARGER2 = `def charger(nom_fichier):
    try:
        with open(nom_fichier) as f:
            donnees = json.loads(f.read())
    except FileNotFoundError:
        return []
    except ValueError:
        print(f"Attention : {nom_fichier} est abîmé, on repart d'une liste vide.")
        return []
    if not isinstance(donnees, list):
        return []
    return donnees`;
  const TA_CHARGER2_0 = `def charger(nom_fichier):
    # À toi : si le contenu n'est pas du JSON valide (ValueError), affiche un avertissement
    # et renvoie [] ; si le JSON n'est pas une liste, renvoie [] aussi.
    try:
        with open(nom_fichier) as f:
            return json.loads(f.read())
    except FileNotFoundError:
        return []`;
  const TA_COUPER = `def couper(texte):
    # Fournie : "fait 3" donne ("fait", "3") et "liste" donne ("liste", "").
    morceaux = texte.strip().split(" ", 1)
    if len(morceaux) == 1:
        return morceaux[0], ""
    return morceaux[0], morceaux[1]`;
  const TA_EXECUTER = `def executer(taches, commande):
    action, argument = couper(commande)
    action = action.lower()
    if action == "ajouter":
        priorite, titre = couper(argument)
        if priorite not in ["1", "2", "3"]:
            return "Erreur : écris par exemple « ajouter 1 Réviser les boucles »."
        try:
            tache = ajouter(taches, titre, int(priorite))
        except ValueError as erreur:
            return f"Erreur : {erreur}."
        return f"Tâche #{tache['id']} ajoutée."
    if action == "fait" or action == "suppr":
        if not argument.isdigit():
            return "Erreur : indique le numéro de la tâche."
        numero = int(argument)
        if action == "fait":
            ok = marquer_fait(taches, numero)
        else:
            ok = supprimer(taches, numero)
        if not ok:
            return f"Erreur : aucune tâche #{numero}."
        return f"Tâche #{numero} terminée." if action == "fait" else f"Tâche #{numero} supprimée."
    if action == "liste":
        if not taches:
            return "Aucune tâche."
        return "\\n".join(lignes(taches))
    return "Commandes : ajouter <priorité> <titre>, fait <n°>, suppr <n°>, liste."`;
  const TA_EXECUTER_0 = `def executer(taches, commande):
    # À toi : renvoie un message selon la commande.
    # "ajouter 1 Réviser les boucles" -> "Tâche #1 ajoutée." (priorité 1, 2 ou 3, sinon un message "Erreur : ...")
    # "fait 1"  -> "Tâche #1 terminée."   ou "Erreur : aucune tâche #1."
    # "suppr 1" -> "Tâche #1 supprimée."  ou "Erreur : aucune tâche #1."
    # "liste"   -> les lignes de lignes(taches) reliées par des retours à la ligne, ou "Aucune tâche."
    # autre chose -> un message d'aide qui commence par "Commandes"
    pass`;
  const TA_MAIN = `def main(nom_fichier="taches.json"):
    taches = charger(nom_fichier)
    print("Gestionnaire de tâches. Tape « aide » pour les commandes, « quitter » pour sortir.")
    while True:
        commande = input("> ")
        if commande.strip().lower() == "quitter":
            break
        print(executer(taches, commande))
        sauvegarder(taches, nom_fichier)
    print("Tâches enregistrées.")`;

  const TA_FIX_FICHIER = "{\"id\": 1, \"titre\": \"Lire le chapitre 3\", \"priorite\": 2, \"fait\": true}";
  const TA_FILES = { 'taches.json': '[' + TA_FIX_FICHIER + ', {"id": 2, "titre": "Envoyer le CV", "priorite": 1, "fait": false}]' };
  const TA_FIXTURE = `TACHES = [
    {"id": 1, "titre": "Lire le chapitre 3", "priorite": 2, "fait": False},
    {"id": 2, "titre": "Envoyer le CV", "priorite": 1, "fait": True},
    {"id": 3, "titre": "Préparer la démo", "priorite": 1, "fait": False},
    {"id": 4, "titre": "Ranger le bureau", "priorite": 3, "fait": False},
]`;

  const TA_S1 = py(TA_ENTETE, TA_AJOUTER);
  const TA_S2 = py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT);
  const TA_S3 = py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES);
  const TA_S4 = py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_SAUVER, TA_CHARGER);
  const TA_S5 = py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_SAUVER, TA_CHARGER2);
  const TA_S6 = py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_SAUVER, TA_CHARGER2, TA_COUPER, TA_EXECUTER);

  const projetTaches = {
    id: 'pj.taches',
    title: 'Gestionnaire de tâches',
    difficulty: 2,
    lang: 'python',
    summary: 'Une liste de tâches en ligne de commande, triée par priorité et sauvegardée en JSON.',
    result: 'Un programme en console qui comprend des commandes comme « ajouter 1 Réviser les boucles », « fait 2 », « suppr 3 » et « liste ». La liste s’affiche triée (tâches à faire d’abord, par priorité) sous la forme « [ ] #3 Préparer la démo (haute) », et elle est sauvegardée dans `taches.json` : on la retrouve au lancement suivant, même si le fichier a été abîmé.',
    skills: ['py.u7', 'py.u8', 'py.u9', 'py.u11', 'py.u12', 'py.u13'],
    steps: [
      {
        title: 'Étape 1 : le modèle de données',
        explain: 'Chaque tâche est un **dictionnaire** : `{"id": 1, "titre": "Lire", "priorite": 2, "fait": False}`, et toutes les tâches forment une **liste**. C’est exactement la forme des données échangées par les applications web en JSON.\n\nL’`id` est un numéro unique qui permet de désigner une tâche sans ambiguïté, même si deux tâches ont le même titre. La fonction `ajouter` **valide** les données avant de les accepter : un titre vide ou une priorité de 5 sont refusés avec un `ValueError`. Valider à l’entrée évite des données incohérentes partout ailleurs.',
        ex: {
          type: 'code',
          prompt: 'Écris `ajouter(taches, titre, priorite=2)` : nettoie et valide le titre et la priorité, calcule le nouvel `id`, ajoute le dictionnaire à la liste et renvoie-le.',
          starter: py(TA_ENTETE, TA_AJOUTER_0),
          solution: TA_S1,
          tests: [
            { code: `t = []
tache = ajouter(t, "Réviser les boucles", 1)
assert tache == {"id": 1, "titre": "Réviser les boucles", "priorite": 1, "fait": False}
assert t == [tache]`, label: 'La première tâche reçoit l’id 1 et est ajoutée à la liste' },
            { code: `t = []
ajouter(t, "A")
b = ajouter(t, "B")
assert b["id"] == 2 and b["priorite"] == 2`, label: 'Les id se suivent ; la priorité vaut 2 par défaut' },
            { code: 'assert ajouter([], "  Lire le chapitre 3  ")["titre"] == "Lire le chapitre 3"', label: 'Les espaces autour du titre sont retirés' },
            { code: `t = []
try:
    ajouter(t, "   ")
    leve = False
except ValueError:
    leve = True
assert leve and t == [], "un titre vide doit être refusé sans rien ajouter"`, label: 'Un titre vide est refusé (ValueError)' },
            { code: `try:
    ajouter([], "Lire", 5)
    leve = False
except ValueError:
    leve = True
assert leve`, label: 'Une priorité de 5 est refusée (ValueError)' }
          ],
          hint: '`max([...], default=0)` renvoie 0 quand la liste est vide. Pour la priorité, `priorite not in PRIORITES` teste les clés du dictionnaire.',
          explain: 'Les vérifications sont faites avant toute modification : en cas d’erreur, la liste reste intacte. `max(..., default=0) + 1` donne 1 pour une liste vide et un id jamais utilisé par les tâches présentes.'
        }
      },
      {
        title: 'Étape 2 : retrouver, supprimer, terminer',
        explain: 'Trois opérations reviennent sans cesse : retrouver une tâche par son `id`, la supprimer, la marquer comme faite. Toutes commencent par la même recherche : on l’écrit **une seule fois** dans `trouver`, et les deux autres l’utilisent.\n\nCes fonctions **renvoient un booléen** : `True` si l’opération a eu lieu, `False` si l’id n’existe pas. L’appelant (plus tard, l’interface) décidera du message à afficher. Remarque : modifier `tache["fait"]` modifie bien la tâche dans la liste, car la liste contient le dictionnaire lui-même, pas une copie.',
        ex: {
          type: 'code',
          prompt: 'Écris `trouver(taches, id_tache)` (la tâche ou `None`), puis `supprimer` et `marquer_fait`, qui s’appuient sur `trouver` et renvoient `True` ou `False`.',
          starter: py(TA_ENTETE, TA_AJOUTER, TA_GERER_0),
          solution: TA_S2,
          tests: [
            { code: `t = []
for titre in ["Lire", "Coder", "Tester"]:
    ajouter(t, titre)
assert trouver(t, 2)["titre"] == "Coder" and trouver(t, 9) is None`, label: 'trouver renvoie la bonne tâche, ou None' },
            { code: `assert supprimer(t, 2) is True and [x["id"] for x in t] == [1, 3]
assert supprimer(t, 2) is False`, label: 'supprimer retire la tâche 2, puis renvoie False la deuxième fois' },
            { code: 'assert marquer_fait(t, 3) is True and trouver(t, 3)["fait"] is True', label: 'marquer_fait passe la tâche 3 à faite' },
            { code: 'assert marquer_fait(t, 42) is False', label: 'marquer_fait renvoie False pour un id inconnu' }
          ],
          hint: 'Dans `supprimer`, appelle d’abord `trouver`. Si le résultat est `None`, renvoie `False` ; sinon `taches.remove(tache)`.',
          explain: '`trouver` centralise la recherche : si un jour les tâches sont stockées autrement, une seule fonction changera. Tester `is None` est la façon correcte de vérifier l’absence de résultat.'
        }
      },
      {
        title: 'Étape 3 : trier et afficher',
        explain: 'Une liste utile montre d’abord **ce qui reste à faire**, puis **le plus urgent**. `sorted` accepte une **clé de tri** : une fonction qui transforme chaque tâche en valeur comparable. Avec un **tuple** `(fait, priorite, id)`, Python compare le premier élément, puis le deuxième en cas d’égalité, et ainsi de suite. Comme `False < True`, les tâches à faire passent devant.\n\n`sorted` renvoie une **nouvelle liste** : l’ordre d’origine n’est pas modifié. L’affichage se fait ensuite ligne par ligne avec une f-string : `[x]` pour une tâche faite.',
        ex: {
          type: 'code',
          prompt: 'Écris `trier(taches)` avec `sorted` et une clé `(fait, priorite, id)`, puis `lignes(taches)`, qui renvoie la liste des lignes de texte des tâches triées, au format `[ ] #3 Préparer la démo (haute)`.',
          starter: py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER_0),
          solution: TA_S3,
          tests: [
            { code: TA_FIXTURE + `
assert [t["id"] for t in trier(TACHES)] == [3, 1, 4, 2]`, label: 'Ordre : à faire d’abord, puis par priorité, puis par id' },
            { code: 'assert [t["id"] for t in TACHES] == [1, 2, 3, 4]', label: 'trier ne modifie pas la liste d’origine' },
            { code: 'assert lignes(TACHES)[0] == "[ ] #3 Préparer la démo (haute)"', label: 'Première ligne : "[ ] #3 Préparer la démo (haute)"' },
            { code: 'assert lignes(TACHES)[3] == "[x] #2 Envoyer le CV (haute)"', label: 'Une tâche faite s’affiche avec [x], en dernier' }
          ],
          hint: '`sorted(taches, key=lambda t: (...))` : mets dans le tuple les trois critères dans l’ordre d’importance. Pour la case : `"x" if t["fait"] else " "`.',
          explain: 'La comparaison de tuples règle un tri sur plusieurs critères en une ligne. `PRIORITES[t["priorite"]]` traduit le chiffre en mot, sans aucun `if`.'
        }
      },
      {
        title: 'Étape 4 : sauvegarder en JSON',
        explain: 'Sans sauvegarde, tout disparaît à la fermeture du programme. Le format **JSON** est parfait pour une liste de dictionnaires : il est lisible, et tous les langages savent le lire. `json.dumps(taches)` transforme la liste en texte, `json.loads(texte)` fait l’inverse.\n\nAu tout premier lancement, le fichier n’existe pas encore : `open` lève `FileNotFoundError`. Ce n’est pas une vraie erreur, juste une liste vide : on l’attrape et on renvoie `[]`. Ici les fichiers sont **virtuels** : `taches.json` existe déjà avec deux tâches, rien n’est écrit sur ton disque.',
        ex: {
          type: 'code',
          prompt: 'Écris `sauvegarder(taches, nom_fichier)` avec `json.dumps`, et `charger(nom_fichier)` avec `json.loads`, qui renvoie `[]` si le fichier n’existe pas.',
          starter: py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_FICHIER_0),
          solution: TA_S4,
          files: TA_FILES,
          tests: [
            { code: `t = charger("taches.json")
assert len(t) == 2 and t[1] == {"id": 2, "titre": "Envoyer le CV", "priorite": 1, "fait": False}`, label: 'charger lit les 2 tâches de taches.json' },
            { code: 'assert charger("absent.json") == []', label: 'Un fichier absent donne une liste vide' },
            { code: `t = []
ajouter(t, "Réviser les dictionnaires", 1)
ajouter(t, "Écrire des tests")
sauvegarder(t, "copie.json")
assert charger("copie.json") == t`, label: 'Sauvegarder puis recharger redonne la même liste' },
            { code: `with open("copie.json") as f:
    contenu = f.read()
assert json.loads(contenu)[0]["titre"] == "Réviser les dictionnaires"`, label: 'Le fichier contient bien du JSON' }
          ],
          hint: 'Écriture : `with open(nom_fichier, "w") as f:` puis `f.write(...)`. Lecture : `json.loads(f.read())` dans un `try`, avec `except FileNotFoundError:`.',
          explain: 'Le `with` ferme le fichier automatiquement, même en cas d’erreur. Le JSON garde les types : `true` redevient `True`, les nombres restent des nombres. Seules les clés changent de nature : un dictionnaire `{1: "haute"}` aurait des clés texte après un aller-retour, c’est pour cela que les tâches n’utilisent que des clés texte.'
        }
      },
      {
        title: 'Étape 5 : résister à un fichier abîmé',
        explain: 'Un fichier peut être **abîmé** : coupure pendant l’écriture, modification à la main ratée. `json.loads` lève alors une erreur de décodage (`json.JSONDecodeError`, qui est une sorte de `ValueError`). Sans précaution, le programme refuserait de démarrer.\n\nOn attrape donc aussi `ValueError` : on **prévient** l’utilisateur et on repart d’une liste vide. On vérifie aussi que le JSON lu est bien une **liste** : un fichier qui contient un objet seul ne correspond pas au format attendu. Règle générale : **ne jamais faire confiance à des données lues de l’extérieur**.',
        ex: {
          type: 'code',
          prompt: 'Améliore `charger` : si le JSON est invalide (`ValueError`), affiche un avertissement et renvoie `[]` ; si le JSON lu n’est pas une liste, renvoie `[]`. Les fichiers virtuels `abime.json` et `objet.json` servent aux tests.',
          starter: py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_SAUVER, TA_CHARGER2_0),
          solution: TA_S5,
          files: Object.assign({}, TA_FILES, { 'abime.json': '[{"id": 1, "titre": "Lire"', 'objet.json': TA_FIX_FICHIER }),
          tests: [
            { code: 'assert charger("abime.json") == []', label: 'Un fichier au JSON invalide donne une liste vide' },
            { code: 'assert charger("objet.json") == []', label: 'Un JSON qui n’est pas une liste est ignoré' },
            { code: 'assert len(charger("taches.json")) == 2 and charger("absent.json") == []', label: 'Les cas normaux fonctionnent toujours' }
          ],
          hint: 'Ajoute un second `except ValueError:` après celui de `FileNotFoundError`. Range le résultat de `json.loads` dans une variable, puis teste `isinstance(donnees, list)` après le bloc `try`.',
          explain: 'Chaque `except` traite un cas précis avec la bonne réaction. `isinstance` vérifie la forme des données avant de les utiliser : sans ce test, un fichier contenant un objet ferait planter `trier` bien plus loin, avec un message incompréhensible.'
        }
      },
      {
        title: 'Étape 6 : les commandes texte',
        explain: 'Il reste à piloter tout cela au clavier. On écrit un **interpréteur de commandes** : `executer(taches, commande)` reçoit une ligne comme `ajouter 1 Réviser les boucles` et renvoie le message à afficher.\n\nLa fonction fournie `couper` sépare le premier mot du reste. Pour `ajouter`, on la réutilise sur l’argument pour séparer la priorité du titre. Chaque erreur de saisie produit un message clair au lieu d’une exception. La boucle avec `input()` (dans la solution complète) n’aura plus qu’à appeler `executer` et sauvegarder.',
        ex: {
          type: 'code',
          prompt: 'Écris `executer(taches, commande)` pour les commandes `ajouter <priorité> <titre>`, `fait <n°>`, `suppr <n°>` et `liste`. Les messages exacts sont dans les commentaires du code.',
          starter: py(TA_ENTETE, TA_AJOUTER, TA_TROUVER, TA_SUPPRIMER, TA_FAIT, TA_TRIER, TA_LIGNES, TA_SAUVER, TA_CHARGER2, TA_COUPER, TA_EXECUTER_0),
          solution: TA_S6,
          tests: [
            { code: `t = []
assert executer(t, "ajouter 1 Réviser les boucles") == "Tâche #1 ajoutée."
assert t[0]["priorite"] == 1 and t[0]["titre"] == "Réviser les boucles"`, label: '« ajouter 1 Réviser les boucles » crée la tâche #1 en priorité haute' },
            { code: 'assert executer(t, "fait 1") == "Tâche #1 terminée." and executer(t, "fait 9") == "Erreur : aucune tâche #9."', label: '« fait » marque la tâche, ou signale un numéro inconnu' },
            { code: 'assert executer(t, "ajouter haute Lire").startswith("Erreur") and len(t) == 1', label: 'Une priorité invalide donne une erreur sans rien ajouter' },
            { code: `assert executer([], "liste") == "Aucune tâche."
ajouter(t, "Lire", 2)
assert executer(t, "liste") == "[ ] #2 Lire (moyenne)\\n[x] #1 Réviser les boucles (haute)"`, label: '« liste » affiche les tâches triées' },
            { code: 'assert executer(t, "suppr 1") == "Tâche #1 supprimée." and executer(t, "aide").startswith("Commandes")', label: '« suppr » supprime ; une commande inconnue affiche l’aide' }
          ],
          hint: 'Commence par `action, argument = couper(commande)`. Pour `fait` et `suppr`, `argument.isdigit()` vérifie qu’on a bien un numéro avant d’appeler `int`.',
          explain: 'L’interpréteur ne fait que traduire du texte en appels aux fonctions déjà testées : il ne contient aucune règle métier. Les vérifications (`isdigit`, priorité dans la liste) empêchent `int()` de lever une exception sur une saisie fantaisiste.'
        }
      }
    ],
    solution: {
      code: TA_S6 + '\n\n' + TA_MAIN + '\n\n\n# Sur ta machine : lance le gestionnaire.\nmain()\n',
      explain: 'Le programme sépare trois niveaux : le modèle (`ajouter`, `trouver`, `supprimer`, `marquer_fait`, `trier`), la persistance (`sauvegarder`, `charger`) et l’interface (`executer`, `main`). La boucle `main` sauvegarde après chaque commande, ce qui évite de perdre des données en cas de fermeture brutale.\n\nAlternatives : une classe `Tache` avec des attributs (parcours POO), ou une base SQLite quand le nombre de tâches grandit (parcours SQL). Le JSON reste le meilleur choix pour quelques centaines de tâches : simple, lisible et facile à déboguer.'
    },
    variant: 'Ajoute une date limite (`"echeance": "2026-11-15"`) et une commande `retard` qui liste les tâches dépassées : les dates au format AAAA-MM-JJ se comparent directement comme du texte. Ajoute une commande `renommer 2 Nouveau titre`. Écris l’historique des commandes dans un fichier `journal.txt` en mode ajout (`"a"`).'
  };

  // =====================================================================================
  // Projet 6 : Analyseur de fichiers CSV
  // =====================================================================================
  const CS_FILES = {
    'jeux.csv': 'titre,annee,genre,ma_note,heures\n'
      + 'Hollow Knight,2017,metroidvania,9.5,42\n'
      + 'Celeste,2018,plateforme,9,15\n'
      + 'Stardew Valley,2016,simulation,,120\n'
      + 'Hades,2020,rogue-lite,9.5,\n'
      + 'Outer Wilds,2019,exploration,10,22\n'
      + 'Terraria,2011,bac à sable, 8,95\n'
      + 'Dead Cells,2018,rogue-lite,8.5,environ 30\n',
    'capteurs.csv': 'heure,salle,temperature,co2\n'
      + '08:00,A,19.5,420\n'
      + '09:00,A,20.1,610\n'
      + '10:00,A,,850\n'
      + '08:00,B,18.9,400\n'
      + '09:00,B,19.4,\n'
      + '10:00,B,21.0,980\n'
  };
  const CS_ENTETE = 'import csv';
  const CS_CHARGER = `def charger(nom_fichier):
    lignes = []
    with open(nom_fichier) as f:
        for ligne in csv.DictReader(f):
            propre = {}
            for colonne, valeur in ligne.items():
                propre[colonne] = valeur.strip()
            lignes.append(propre)
    return lignes`;
  const CS_CHARGER_0 = `def charger(nom_fichier):
    # À toi : lis le fichier avec csv.DictReader et renvoie la liste des lignes
    # (des dictionnaires), en retirant les espaces autour de chaque valeur.
    pass`;
  const CS_NOMBRE = `def est_nombre(texte):
    try:
        float(texte)
        return True
    except ValueError:
        return False`;
  const CS_TYPE = `def type_colonne(lignes, colonne):
    remplies = [ligne[colonne] for ligne in lignes if ligne[colonne] != ""]
    nombres = [v for v in remplies if est_nombre(v)]
    if len(nombres) > len(remplies) / 2:
        return "nombre"
    return "texte"`;
  const CS_TYPES_0 = `def est_nombre(texte):
    # À toi : True si float(texte) fonctionne, False sinon
    pass


def type_colonne(lignes, colonne):
    # À toi : "nombre" si plus de la moitié des valeurs non vides sont des nombres, sinon "texte"
    pass`;
  const CS_MANQUANTES = `def manquantes(lignes):
    resultat = {}
    for colonne in lignes[0]:
        resultat[colonne] = 0
    for ligne in lignes:
        for colonne, valeur in ligne.items():
            if valeur == "":
                resultat[colonne] += 1
    return resultat`;
  const CS_MANQUANTES_0 = `def manquantes(lignes):
    # À toi : dictionnaire {colonne: nombre de valeurs vides}, avec toutes les colonnes
    pass`;
  const CS_STATS = `def stats(lignes, colonne):
    valeurs = []
    invalides = 0
    for ligne in lignes:
        texte = ligne[colonne]
        if texte == "":
            continue
        if est_nombre(texte):
            valeurs.append(float(texte))
        else:
            invalides += 1
    if not valeurs:
        return {"n": 0, "min": None, "max": None, "moyenne": None, "invalides": invalides}
    return {
        "n": len(valeurs),
        "min": min(valeurs),
        "max": max(valeurs),
        "moyenne": round(sum(valeurs) / len(valeurs), 2),
        "invalides": invalides,
    }`;
  const CS_STATS_0 = `def stats(lignes, colonne):
    # À toi : ignore les cases vides, compte les valeurs non numériques comme "invalides",
    # et renvoie {"n", "min", "max", "moyenne" (arrondie à 2 décimales), "invalides"}.
    # S'il n'y a aucune valeur numérique : n vaut 0 et min, max, moyenne valent None.
    pass`;
  const CS_FORMATER = `def formater(nombre):
    # Fournie : 2017.0 devient "2017" et 9.0833 devient "9.08".
    nombre = round(nombre, 2)
    if nombre == int(nombre):
        return str(int(nombre))
    return str(nombre)`;
  const CS_RAPPORT = `def rapport(nom_fichier):
    lignes = charger(nom_fichier)
    vides = manquantes(lignes)
    texte = [f"Rapport de {nom_fichier} : {len(lignes)} lignes, {len(lignes[0])} colonnes"]
    for colonne in lignes[0]:
        nature = type_colonne(lignes, colonne)
        ligne = f"- {colonne} ({nature}) : {vides[colonne]} manquante(s)"
        if nature == "nombre":
            s = stats(lignes, colonne)
            if s["invalides"] > 0:
                ligne += f", {s['invalides']} invalide(s)"
            ligne += f", min {formater(s['min'])}, max {formater(s['max'])}, moyenne {formater(s['moyenne'])}"
        texte.append(ligne)
    return "\\n".join(texte)`;
  const CS_RAPPORT_0 = `def rapport(nom_fichier):
    # À toi : une première ligne "Rapport de jeux.csv : 7 lignes, 5 colonnes",
    # puis une ligne par colonne :
    # "- titre (texte) : 0 manquante(s)"
    # "- heures (nombre) : 1 manquante(s), 1 invalide(s), min 15, max 120, moyenne 58.8"
    # (", N invalide(s)" seulement s'il y en a ; nombres passés par formater).
    # Renvoie les lignes reliées par des retours à la ligne.
    pass`;
  const CS_EXPORTER = `def exporter(nom_csv, nom_sortie):
    lignes = charger(nom_csv)
    vides = manquantes(lignes)
    with open(nom_sortie, "w") as f:
        ecrivain = csv.writer(f)
        ecrivain.writerow(["colonne", "type", "manquantes", "invalides", "min", "max", "moyenne"])
        for colonne in lignes[0]:
            nature = type_colonne(lignes, colonne)
            if nature == "nombre":
                s = stats(lignes, colonne)
                ecrivain.writerow([colonne, nature, vides[colonne], s["invalides"],
                                   formater(s["min"]), formater(s["max"]), formater(s["moyenne"])])
            else:
                ecrivain.writerow([colonne, nature, vides[colonne], "", "", "", ""])`;
  const CS_EXPORTER_0 = `def exporter(nom_csv, nom_sortie):
    # À toi : écris avec csv.writer un fichier dont l'en-tête est
    # colonne,type,manquantes,invalides,min,max,moyenne
    # puis une ligne par colonne (nombres passés par formater ; cases vides pour le texte).
    pass`;

  const CS_S1 = py(CS_ENTETE, CS_CHARGER);
  const CS_S2 = py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE);
  const CS_S3 = py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES);
  const CS_S4 = py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS);
  const CS_S5 = py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS, CS_FORMATER, CS_RAPPORT);
  const CS_S6 = py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS, CS_FORMATER, CS_RAPPORT, CS_EXPORTER);

  const projetCsv = {
    id: 'pj.analyseur-csv',
    title: 'Analyseur de fichiers CSV',
    difficulty: 2,
    lang: 'python',
    summary: 'Un outil qui inspecte n’importe quel fichier CSV : types de colonnes, valeurs manquantes, statistiques et rapport.',
    result: 'Une fonction `rapport("jeux.csv")` qui affiche « Rapport de jeux.csv : 7 lignes, 5 colonnes » puis, pour chaque colonne, son type, ses valeurs manquantes ou invalides et ses statistiques, par exemple « - heures (nombre) : 1 manquante(s), 1 invalide(s), min 15, max 120, moyenne 58.8 ». Le même code fonctionne sur un autre fichier (relevés de capteurs) et exporte ses statistiques dans un nouveau CSV.',
    skills: ['py.u6', 'py.u7', 'py.u8', 'py.u9', 'py.u11', 'py.u12', 'py.u13'],
    steps: [
      {
        title: 'Étape 1 : charger un CSV',
        explain: 'Un fichier **CSV** est un tableau en texte : une ligne d’en-tête avec les noms de colonnes, puis une ligne par enregistrement, les valeurs séparées par des virgules. On ne le découpe pas à la main avec `split(",")` : une valeur peut contenir une virgule entre guillemets. Le module `csv` gère ces cas.\n\n`csv.DictReader` renvoie chaque ligne sous forme de **dictionnaire** `{colonne: valeur}`. Toutes les valeurs sont du **texte**, même les nombres. On retire les espaces parasites dès le chargement : `" 8"` devient `"8"`. Deux fichiers virtuels servent d’exemples : tes jeux préférés (`jeux.csv`) et des relevés de capteurs (`capteurs.csv`).',
        ex: {
          type: 'code',
          prompt: 'Écris `charger(nom_fichier)` : lis le fichier avec `csv.DictReader` et renvoie la liste des lignes, chaque valeur nettoyée avec `strip()`.',
          starter: py(CS_ENTETE, CS_CHARGER_0),
          solution: CS_S1,
          files: CS_FILES,
          tests: [
            { code: 'assert len(charger("jeux.csv")) == 7 and len(charger("capteurs.csv")) == 6', label: '7 lignes dans jeux.csv, 6 dans capteurs.csv (en-tête non compté)' },
            { code: 'assert charger("jeux.csv")[0]["titre"] == "Hollow Knight"', label: 'Chaque ligne est un dictionnaire indexé par le nom de colonne' },
            { code: 'assert charger("jeux.csv")[5]["ma_note"] == "8"', label: 'Les espaces autour des valeurs sont retirés (" 8" devient "8")' },
            { code: 'assert charger("capteurs.csv")[2]["temperature"] == ""', label: 'Une case vide reste une chaîne vide' }
          ],
          hint: 'Dans `with open(nom_fichier) as f:`, parcours `csv.DictReader(f)`. Pour chaque ligne, construis un nouveau dictionnaire avec `valeur.strip()`.',
          explain: '`DictReader` lit l’en-tête une fois et l’utilise comme clés pour toutes les lignes. Nettoyer dès le chargement évite de répéter `strip()` dans chaque fonction d’analyse.'
        }
      },
      {
        title: 'Étape 2 : deviner le type de chaque colonne',
        explain: 'Pour calculer une moyenne, il faut savoir quelles colonnes sont **numériques**. Une valeur est un nombre si `float()` réussit à la convertir : on essaie, et on attrape le `ValueError`. C’est le style Python : « essayer et gérer l’échec » plutôt que tout vérifier à l’avance.\n\nUne colonne réelle contient souvent des **erreurs de saisie** : « environ 30 » dans une colonne d’heures. On ne va pas la déclarer « texte » pour autant. Règle choisie : la colonne est numérique si **plus de la moitié** de ses valeurs non vides sont des nombres. Les autres seront signalées comme invalides.',
        ex: {
          type: 'code',
          prompt: 'Écris `est_nombre(texte)` avec `try` / `except ValueError`, puis `type_colonne(lignes, colonne)` qui renvoie `"nombre"` si plus de la moitié des valeurs non vides sont des nombres, sinon `"texte"`.',
          starter: py(CS_ENTETE, CS_CHARGER, CS_TYPES_0),
          solution: CS_S2,
          files: CS_FILES,
          tests: [
            { code: 'assert est_nombre("9.5") and est_nombre("2017") and est_nombre("-3")', label: 'Entiers, décimaux et négatifs sont des nombres' },
            { code: 'assert not est_nombre("environ 30") and not est_nombre("")', label: '« environ 30 » et le vide ne sont pas des nombres' },
            { code: `JEUX = charger("jeux.csv")
assert type_colonne(JEUX, "heures") == "nombre" and type_colonne(JEUX, "genre") == "texte"`, label: '« heures » est numérique malgré une erreur, « genre » est du texte' },
            { code: 'assert type_colonne(charger("capteurs.csv"), "heure") == "texte"', label: 'Une heure « 08:00 » n’est pas un nombre' }
          ],
          hint: '`float(texte)` dans un `try`, `return True` juste après ; `return False` dans le `except`. Pour le type, construis la liste des valeurs non vides, puis celle des valeurs numériques.',
          explain: 'La règle de la majorité rend l’analyse robuste aux fautes de saisie isolées. Les valeurs vides sont écartées du calcul : elles ne disent rien du type de la colonne.'
        }
      },
      {
        title: 'Étape 3 : compter les valeurs manquantes',
        explain: 'Première question à poser sur un jeu de données : **qu’est-ce qui manque ?** Une moyenne calculée sur 5 valeurs au lieu de 7 n’a pas la même fiabilité. Les data scientists commencent toujours par ce bilan.\n\nOn construit un **dictionnaire de compteurs** : une entrée par colonne, initialisée à 0, même pour les colonnes complètes (le rapport doit toutes les afficher). Puis on parcourt chaque ligne et chaque case vide incrémente le compteur de sa colonne. Les colonnes viennent des clés de la première ligne.',
        ex: {
          type: 'code',
          prompt: 'Écris `manquantes(lignes)` : renvoie un dictionnaire `{colonne: nombre de valeurs vides}` contenant toutes les colonnes.',
          starter: py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES_0),
          solution: CS_S3,
          files: CS_FILES,
          tests: [
            { code: 'assert manquantes(charger("jeux.csv")) == {"titre": 0, "annee": 0, "genre": 0, "ma_note": 1, "heures": 1}', label: 'jeux.csv : une note et une durée manquantes' },
            { code: 'assert manquantes(charger("capteurs.csv")) == {"heure": 0, "salle": 0, "temperature": 1, "co2": 1}', label: 'capteurs.csv : une température et un CO2 manquants' }
          ],
          hint: 'Parcourir un dictionnaire (`for colonne in lignes[0]:`) donne ses clés : c’est la liste des colonnes. Initialise chaque compteur à 0 avant de compter.',
          explain: 'Initialiser toutes les colonnes à 0 garantit que chacune figure dans le résultat. La double boucle (lignes puis cases) visite chaque valeur une seule fois.'
        }
      },
      {
        title: 'Étape 4 : les statistiques d’une colonne',
        explain: 'Pour une colonne numérique, on calcule le **minimum**, le **maximum** et la **moyenne**, en ignorant les cases vides et en comptant à part les valeurs **invalides** (« environ 30 »). Le nombre `n` de valeurs réellement utilisées accompagne toujours une statistique : une moyenne sur 5 valeurs n’a pas le même poids qu’une moyenne sur 5000.\n\nUn cas limite doit être prévu : une colonne sans aucune valeur numérique. `min([])` lèverait une erreur : on renvoie alors `None` pour les statistiques. Penser aux cas limites (liste vide, zéro, valeur absente) est une habitude essentielle.',
        ex: {
          type: 'code',
          prompt: 'Écris `stats(lignes, colonne)` : renvoie `{"n", "min", "max", "moyenne", "invalides"}` (moyenne arrondie à 2 décimales), avec `None` pour min, max et moyenne s’il n’y a aucune valeur numérique.',
          starter: py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS_0),
          solution: CS_S4,
          files: CS_FILES,
          tests: [
            { code: 'assert stats(charger("jeux.csv"), "ma_note") == {"n": 6, "min": 8.0, "max": 10.0, "moyenne": 9.08, "invalides": 0}', label: 'Statistiques de ma_note (6 valeurs, moyenne 9.08)' },
            { code: `s = stats(charger("jeux.csv"), "heures")
assert s["n"] == 5 and s["invalides"] == 1 and s["moyenne"] == 58.8`, label: 'heures : « environ 30 » est compté comme invalide et exclu' },
            { code: 'assert stats(charger("capteurs.csv"), "temperature")["moyenne"] == 19.78', label: 'Température moyenne des capteurs : 19.78' },
            { code: 'assert stats([{"x": ""}, {"x": "abc"}], "x") == {"n": 0, "min": None, "max": None, "moyenne": None, "invalides": 1}', label: 'Sans aucune valeur numérique : None, sans planter' }
          ],
          hint: 'Construis la liste `valeurs` des nombres convertis avec `float`, et compte les invalides dans une variable. Ensuite `min`, `max` et `sum(...) / len(...)`.',
          explain: 'Séparer « vide » et « invalide » est important : une case vide est une absence connue, une valeur invalide est une erreur à corriger dans la source. Le test `if not valeurs` protège contre la division par zéro et le `min` d’une liste vide.'
        }
      },
      {
        title: 'Étape 5 : le rapport',
        explain: 'On assemble tout dans un **rapport lisible** : une ligne de résumé, puis une ligne par colonne avec son type, ses manquants et, pour les colonnes numériques, ses statistiques. La fonction fournie `formater` affiche `2017` au lieu de `2017.0`.\n\nLa fonction construit une **liste de lignes** puis les relie avec `"\\n".join(...)`. C’est plus efficace et plus lisible que d’ajouter des morceaux à une chaîne. Le rapport fonctionne sur **n’importe quel CSV** : rien n’y dépend des noms de colonnes de `jeux.csv`.',
        ex: {
          type: 'code',
          prompt: 'Écris `rapport(nom_fichier)` selon le format décrit dans les commentaires du code, en réutilisant `charger`, `manquantes`, `type_colonne`, `stats` et `formater`.',
          starter: py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS, CS_FORMATER, CS_RAPPORT_0),
          solution: CS_S5,
          files: CS_FILES,
          tests: [
            { code: `R = rapport("jeux.csv").split("\\n")
assert R[0] == "Rapport de jeux.csv : 7 lignes, 5 colonnes"`, label: 'Ligne de résumé : 7 lignes, 5 colonnes' },
            { code: 'assert R[1] == "- titre (texte) : 0 manquante(s)"', label: 'Une colonne texte n’affiche que ses manquants' },
            { code: 'assert R[4] == "- ma_note (nombre) : 1 manquante(s), min 8, max 10, moyenne 9.08"', label: 'Ligne de ma_note avec ses statistiques' },
            { code: 'assert R[5] == "- heures (nombre) : 1 manquante(s), 1 invalide(s), min 15, max 120, moyenne 58.8"', label: 'Les invalides apparaissent quand il y en a' },
            { code: 'assert "- co2 (nombre) : 1 manquante(s), min 400, max 980, moyenne 652" in rapport("capteurs.csv").split("\\n")', label: 'Le même code fonctionne sur capteurs.csv' }
          ],
          hint: 'Commence par `texte = [ligne de résumé]`, puis une boucle sur les colonnes qui fait `texte.append(...)`. Construis chaque ligne en plusieurs fois avec `+=`.',
          explain: 'Le rapport ne contient aucune logique de calcul : il ne fait qu’appeler les fonctions déjà testées et mettre en forme. Si une statistique change, une seule fonction est à corriger.'
        }
      },
      {
        title: 'Étape 6 : exporter les statistiques en CSV',
        explain: 'Un rapport texte est fait pour être lu ; un **fichier CSV** est fait pour être réutilisé : ouvert dans un tableur, ou relu par un autre programme. On exporte donc un tableau de synthèse : une ligne par colonne analysée.\n\n`csv.writer(f)` fournit `writerow(liste)`, qui écrit une ligne en ajoutant virgules et guillemets si besoin. Les colonnes texte reçoivent des cases vides pour les statistiques. Sur ta machine, ouvre le fichier avec `open(nom, "w", newline="")` : sous Windows, cela évite des lignes vides parasites.',
        ex: {
          type: 'code',
          prompt: 'Écris `exporter(nom_csv, nom_sortie)` : avec `csv.writer`, écris l’en-tête `colonne,type,manquantes,invalides,min,max,moyenne` puis une ligne par colonne (nombres passés par `formater`, cases vides pour les colonnes texte).',
          starter: py(CS_ENTETE, CS_CHARGER, CS_NOMBRE, CS_TYPE, CS_MANQUANTES, CS_STATS, CS_FORMATER, CS_RAPPORT, CS_EXPORTER_0),
          solution: CS_S6,
          files: CS_FILES,
          tests: [
            { code: `exporter("jeux.csv", "stats.csv")
with open("stats.csv") as f:
    T = list(csv.reader(f))
assert T[0] == ["colonne", "type", "manquantes", "invalides", "min", "max", "moyenne"]`, label: 'L’en-tête du fichier exporté est correct' },
            { code: 'assert len(T) == 6', label: 'Une ligne par colonne de jeux.csv (5) plus l’en-tête' },
            { code: 'assert T[4] == ["ma_note", "nombre", "1", "0", "8", "10", "9.08"]', label: 'La ligne de ma_note contient ses statistiques' },
            { code: 'assert T[1] == ["titre", "texte", "0", "", "", "", ""]', label: 'Une colonne texte a des cases vides pour les statistiques' }
          ],
          hint: 'Ouvre le fichier de sortie en mode `"w"`, crée `ecrivain = csv.writer(f)`, puis appelle `ecrivain.writerow([...])` pour l’en-tête et pour chaque colonne.',
          explain: 'Relu avec `csv.reader`, chaque valeur redevient du texte : c’est pour cela que le test compare `"1"` et non `1`. Le CSV produit s’ouvre directement dans un tableur.'
        }
      }
    ],
    solution: {
      code: CS_S6 + '\n\n# Sur ta machine : analyse un fichier CSV placé à côté du script.\nprint(rapport("jeux.csv"))\nexporter("jeux.csv", "stats_jeux.csv")\n',
      explain: 'L’analyseur suit le chemin classique d’une analyse de données : charger, nettoyer, typer, mesurer les manques, calculer, présenter. Chaque étape est une fonction générique, qui ne connaît pas les noms des colonnes : le même code analyse des jeux, des capteurs ou des ventes.\n\nAvec pandas (parcours Data), `pd.read_csv` puis `df.info()`, `df.isna().sum()` et `df.describe()` font l’essentiel en trois lignes. Écrire l’outil à la main fait comprendre ce que ces fonctions calculent, et ce qu’elles décident à ta place (par exemple le traitement des valeurs invalides).'
    },
    variant: 'Ajoute la médiane avec `statistics.median` et le nombre de valeurs distinctes pour les colonnes texte. Détecte les doublons (deux lignes identiques). Accepte les CSV français séparés par des points-virgules, avec virgule décimale : `csv.DictReader(f, delimiter=";")` et `texte.replace(",", ".")` avant `float`.'
  };

  // =====================================================================================
  // Projet 7 : Quiz interactif (JavaScript, page DOM)
  // =====================================================================================
  const QZ_HTML = `<main id="quiz">
  <p id="progression"></p>
  <h2 id="question"></h2>
  <div id="choix"></div>
  <p id="retour" aria-live="polite"></p>
  <p id="score">Score : 0</p>
  <button id="suivante" type="button" hidden>Question suivante</button>
</main>
<style>
  #choix button { display: block; min-width: 220px; margin: 6px 0; padding: 8px 12px; text-align: left; }
  #choix button.correct { background: #d3f9d8; }
  #choix button.faux { background: #ffe3e3; }
</style>`;
  const QZ_DONNEES = `const QUESTIONS = [
  { texte: 'Quel mot-clé déclare une variable qu’on ne réassigne jamais ?', choix: ['let', 'const', 'var'], bonne: 1 },
  { texte: 'Que vaut [10, 20, 30].length ?', choix: ['2', '3', '30'], bonne: 1 },
  { texte: 'Quelle méthode ajoute un élément à la fin d’un tableau ?', choix: ['push()', 'pop()', 'shift()'], bonne: 0 },
];`;
  const QZ_ETAT = `function creerEtat() {
  return { index: 0, score: 0, repondu: false };
}

function questionCourante(etat) {
  return QUESTIONS[etat.index];
}`;
  const QZ_REPONDRE = `function repondre(etat, choix) {
  if (etat.repondu) return null;
  etat.repondu = true;
  const juste = choix === questionCourante(etat).bonne;
  if (juste) etat.score += 1;
  return juste;
}

function passerSuivante(etat) {
  etat.index += 1;
  etat.repondu = false;
  return etat.index < QUESTIONS.length;
}`;
  const QZ_REPONDRE_0 = `function repondre(etat, choix) {
  // À toi : si la question a déjà reçu une réponse, renvoie null.
  // Sinon, note qu’elle a reçu une réponse, augmente le score si choix est la bonne réponse,
  // et renvoie true (juste) ou false (faux).
}

function passerSuivante(etat) {
  // À toi : passe à la question suivante (index + 1, repondu remis à false)
  // et renvoie true s’il reste une question à afficher, false sinon.
}`;
  const QZ_ZONES = `const etat = creerEtat();
const zoneProgression = document.querySelector('#progression');
const zoneQuestion = document.querySelector('#question');
const zoneChoix = document.querySelector('#choix');`;
  const QZ_AFFICHER = `function afficherQuestion() {
  const question = questionCourante(etat);
  zoneProgression.textContent = \`Question \${etat.index + 1} / \${QUESTIONS.length}\`;
  zoneQuestion.textContent = question.texte;
  zoneChoix.innerHTML = '';
  question.choix.forEach((texte, i) => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.textContent = texte;
    zoneChoix.append(bouton);
  });
}`;
  const QZ_AFFICHER_0 = `function afficherQuestion() {
  // À toi :
  // - écris « Question 1 / 3 » dans zoneProgression (d’après etat.index)
  // - écris le texte de la question courante dans zoneQuestion
  // - vide zoneChoix, puis ajoute un <button type="button"> par choix
}`;
  const QZ_AFFICHER2 = QZ_AFFICHER.replace("    zoneChoix.append(bouton);", "    bouton.addEventListener('click', () => choisir(i, bouton));\n    zoneChoix.append(bouton);");
  const QZ_AFFICHER2_0 = QZ_AFFICHER.replace("    zoneChoix.append(bouton);", "    // À toi : au clic sur ce bouton, appelle choisir(i, bouton)\n    zoneChoix.append(bouton);");
  const QZ_ZONES2 = `const zoneRetour = document.querySelector('#retour');
const zoneScore = document.querySelector('#score');
const boutonSuivante = document.querySelector('#suivante');`;
  const QZ_CHOISIR = `function choisir(i, bouton) {
  const juste = repondre(etat, i);
  if (juste === null) return;
  const question = questionCourante(etat);
  bouton.classList.add(juste ? 'correct' : 'faux');
  zoneRetour.textContent = juste
    ? 'Bonne réponse !'
    : \`Raté : la bonne réponse était « \${question.choix[question.bonne]} ».\`;
  zoneScore.textContent = \`Score : \${etat.score}\`;
  for (const b of zoneChoix.querySelectorAll('button')) {
    b.disabled = true;
  }
  boutonSuivante.hidden = false;
}`;
  const QZ_CHOISIR_0 = `function choisir(i, bouton) {
  // À toi :
  // - enregistre la réponse avec repondre(etat, i) (si elle renvoie null, ne fais rien)
  // - ajoute au bouton la classe 'correct' ou 'faux'
  // - écris « Bonne réponse ! » ou « Raté : la bonne réponse était « const ». » dans zoneRetour
  // - écris « Score : 1 » dans zoneScore
  // - désactive tous les boutons de choix et affiche boutonSuivante
}`;
  const QZ_FIN = `function afficherFin() {
  zoneProgression.textContent = 'Quiz terminé';
  zoneQuestion.textContent = \`Score final : \${etat.score} / \${QUESTIONS.length}\`;
  zoneChoix.innerHTML = '';
  zoneRetour.textContent = '';
  boutonSuivante.hidden = true;
}`;
  const QZ_FIN_0 = `function afficherFin() {
  // À toi : « Quiz terminé » dans zoneProgression, « Score final : 2 / 3 » dans zoneQuestion,
  // vide zoneChoix et zoneRetour, cache boutonSuivante.
}`;
  const QZ_SUIVANTE = `boutonSuivante.addEventListener('click', () => {
  if (passerSuivante(etat)) {
    zoneRetour.textContent = '';
    boutonSuivante.hidden = true;
    afficherQuestion();
  } else {
    afficherFin();
  }
});`;
  const QZ_SUIVANTE_0 = `// À toi : au clic sur boutonSuivante, passe à la question suivante avec passerSuivante(etat).
// S’il en reste une : vide zoneRetour, cache boutonSuivante et affiche la question.
// Sinon : affiche la fin.`;
  const QZ_MESSAGE = `function message(score, total) {
  if (score === total) return 'Parfait : toutes les réponses sont justes.';
  if (score >= total / 2) return 'Bon résultat : relis les questions manquées.';
  return 'Relis la leçon, puis retente le quiz.';
}`;
  const QZ_MESSAGE_0 = `function message(score, total) {
  // À toi : 'Parfait : toutes les réponses sont justes.' si tout est juste,
  // 'Bon résultat : relis les questions manquées.' si au moins la moitié est juste,
  // 'Relis la leçon, puis retente le quiz.' sinon.
}`;
  const QZ_RECOMMENCER = `function recommencer() {
  Object.assign(etat, creerEtat());
  zoneScore.textContent = 'Score : 0';
  zoneRetour.textContent = '';
  afficherQuestion();
}`;
  const QZ_RECOMMENCER_0 = `function recommencer() {
  // À toi : remets etat à zéro (etat est const : modifie ses propriétés),
  // remets « Score : 0 », vide zoneRetour et affiche la première question.
}`;
  const QZ_FIN2 = `function afficherFin() {
  zoneProgression.textContent = 'Quiz terminé';
  zoneQuestion.textContent = \`Score final : \${etat.score} / \${QUESTIONS.length}\`;
  zoneRetour.textContent = message(etat.score, QUESTIONS.length);
  zoneChoix.innerHTML = '';
  boutonSuivante.hidden = true;
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.id = 'recommencer';
  bouton.textContent = 'Recommencer';
  bouton.addEventListener('click', recommencer);
  zoneChoix.append(bouton);
}`;
  const QZ_FIN2_0 = QZ_FIN.replace("  boutonSuivante.hidden = true;\n}", "  boutonSuivante.hidden = true;\n  // À toi : écris message(...) dans zoneRetour (au lieu de le vider)\n  // et ajoute dans zoneChoix un bouton id=\"recommencer\" qui appelle recommencer.\n}");
  const QZ_DEMARRER = 'afficherQuestion();';

  const QZ_S1 = js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE);
  const QZ_S2 = js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_AFFICHER, QZ_DEMARRER);
  const QZ_S3 = js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2, QZ_CHOISIR, QZ_DEMARRER);
  const QZ_S4 = js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2, QZ_CHOISIR, QZ_FIN, QZ_SUIVANTE, QZ_DEMARRER);
  const QZ_S5 = js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2, QZ_CHOISIR, QZ_MESSAGE, QZ_RECOMMENCER, QZ_FIN2, QZ_SUIVANTE, QZ_DEMARRER);

  const projetQuiz = {
    id: 'pj.quiz',
    title: 'Quiz interactif',
    difficulty: 2,
    lang: 'javascript',
    summary: 'Un quiz dans le navigateur : questions à choix, correction immédiate, score, écran de fin et nouvelle partie.',
    result: 'Une page qui affiche « Question 1 / 3 » et trois boutons de réponse. Un clic colore la réponse en vert ou en rouge, affiche « Bonne réponse ! » ou la bonne réponse, met à jour le score et bloque les autres choix. Le bouton « Question suivante » avance jusqu’à l’écran « Score final : 2 / 3 » avec un message adapté et un bouton « Recommencer ».',
    skills: ['js.u5', 'js.u6', 'js.u7', 'js.u8', 'js.u9'],
    steps: [
      {
        title: 'Étape 1 : la logique du quiz, sans page',
        explain: 'Un quiz, c’est d’abord des **données** (un tableau de questions) et un **état** : la question en cours, le score, et si l’on a déjà répondu. On écrit la logique dans des fonctions qui ne touchent **pas** à la page : elles se testent sans clic.\n\nLe champ `repondu` empêche de répondre deux fois à la même question : un double clic ne doit pas donner deux points. Dans ce cas `repondre` renvoie `null`, une valeur distincte de `true` et `false` qui signifie « réponse ignorée ». Les fonctions `creerEtat` et `questionCourante` sont fournies.',
        ex: {
          type: 'code',
          prompt: 'Complète `repondre(etat, choix)` (renvoie `true`, `false`, ou `null` si la question a déjà reçu une réponse) et `passerSuivante(etat)` (renvoie `true` s’il reste une question).',
          starter: js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE_0),
          solution: QZ_S1,
          tests: [
            { code: "const e = creerEtat();\nassert(repondre(e, 1) === true, 'const est la bonne réponse : repondre doit renvoyer true');\nassertEqual(e.score, 1);", label: 'Une bonne réponse renvoie true et ajoute un point' },
            { code: "const e = creerEtat();\nassert(repondre(e, 2) === false, 'var est faux : repondre doit renvoyer false');\nassertEqual(e.score, 0);", label: 'Une mauvaise réponse renvoie false sans point' },
            { code: "const e = creerEtat();\nrepondre(e, 1);\nassert(repondre(e, 1) === null, 'une deuxième réponse doit être ignorée (null)');\nassertEqual(e.score, 1);", label: 'Une deuxième réponse à la même question est ignorée' },
            { code: "const e = creerEtat();\nrepondre(e, 1);\nassert(passerSuivante(e) === true, 'il reste des questions');\nassertEqual(e.index, 1);\nassertEqual(e.repondu, false);", label: 'passerSuivante avance et autorise une nouvelle réponse' },
            { code: "const e = creerEtat();\npasserSuivante(e);\npasserSuivante(e);\nassert(passerSuivante(e) === false, 'après la 3e question, il n’y a plus de suite');", label: 'Après la dernière question, passerSuivante renvoie false' }
          ],
          hint: 'Commence `repondre` par le cas à ignorer : `if (etat.repondu) return null;`. Compare ensuite `choix` à `questionCourante(etat).bonne`.',
          explain: 'L’état est un objet modifié par les fonctions : c’est la seule source de vérité du quiz. Séparer cette logique de l’affichage permet de la tester ici sans page, puis de la réutiliser telle quelle.'
        }
      },
      {
        title: 'Étape 2 : afficher la question',
        explain: 'On passe à la **page**. Le HTML fournit des zones vides (`#progression`, `#question`, `#choix`…) que le JavaScript remplit. On récupère chaque zone une fois avec `document.querySelector`, puis `afficherQuestion` écrit le texte avec `textContent` et **crée un bouton par choix** avec `document.createElement`.\n\nAvant d’ajouter les nouveaux boutons, on vide la zone (`innerHTML = \'\'`) : sinon, les choix de la question précédente resteraient affichés. `textContent` est préféré à `innerHTML` pour écrire du texte : il n’interprète jamais de HTML, ce qui évite les mauvaises surprises.',
        ex: {
          type: 'code',
          dom: true,
          html: QZ_HTML,
          prompt: 'Complète `afficherQuestion()` : progression « Question 1 / 3 », texte de la question, puis un `button` par choix dans `#choix`. Le code l’appelle déjà au démarrage.',
          starter: js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_AFFICHER_0, QZ_DEMARRER),
          solution: QZ_S2,
          tests: [
            { code: "assertEqual(document.querySelector('#question').textContent, QUESTIONS[0].texte);", label: 'La première question est affichée' },
            { code: "assertEqual(document.querySelector('#progression').textContent, 'Question 1 / 3');", label: 'La progression indique « Question 1 / 3 »' },
            { code: "const textes = [...document.querySelectorAll('#choix button')].map((b) => b.textContent);\nassertEqual(textes, ['let', 'const', 'var']);", label: 'Trois boutons let, const, var dans #choix' }
          ],
          hint: 'Dans `question.choix.forEach((texte, i) => { ... })`, crée le bouton, donne-lui son `textContent`, puis `zoneChoix.append(bouton)`. Pour la progression, pense que `etat.index` commence à 0.',
          explain: 'Les zones sont récupérées une seule fois, en haut du code. `afficherQuestion` reconstruit entièrement la zone des choix à chaque appel : c’est simple et sans risque d’oublier un ancien bouton.'
        }
      },
      {
        title: 'Étape 3 : répondre au clic',
        explain: 'Chaque bouton doit réagir au **clic**. Dans `afficherQuestion`, on ajoute un écouteur avec `addEventListener(\'click\', ...)`. La fonction fléchée `() => choisir(i, bouton)` se souvient de `i` et du bouton : chaque bouton appelle `choisir` avec son propre numéro.\n\n`choisir` utilise la logique de l’étape 1 (`repondre`), puis met à jour la page : classe CSS `correct` ou `faux`, message dans `#retour`, score, et **désactivation** des boutons (`disabled = true`) pour qu’on ne puisse plus changer d’avis. Enfin, le bouton « Question suivante » apparaît (`hidden = false`). La zone `#retour` a `aria-live="polite"` : les lecteurs d’écran annoncent le message.',
        ex: {
          type: 'code',
          dom: true,
          html: QZ_HTML,
          prompt: 'Dans `afficherQuestion`, ajoute un écouteur de clic qui appelle `choisir(i, bouton)`. Complète `choisir` : classe `correct`/`faux`, message, score, boutons désactivés, bouton suivant visible.',
          starter: js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2_0, QZ_CHOISIR_0, QZ_DEMARRER),
          solution: QZ_S3,
          tests: [
            { code: "document.querySelectorAll('#choix button')[1].click();\nassertEqual(document.querySelector('#retour').textContent, 'Bonne réponse !');", label: 'Un clic sur « const » affiche « Bonne réponse ! »' },
            { code: "assertEqual(document.querySelector('#score').textContent, 'Score : 1');", label: 'Le score passe à « Score : 1 »' },
            { code: "const boutons = [...document.querySelectorAll('#choix button')];\nassert(boutons.every((b) => b.disabled), 'tous les choix doivent être désactivés après une réponse');\nassert(boutons[1].classList.contains('correct'), 'le bouton choisi doit avoir la classe correct');", label: 'Les choix sont désactivés, le bon choix est marqué correct' },
            { code: "assert(!document.querySelector('#suivante').hidden, 'le bouton Question suivante doit apparaître');", label: 'Le bouton « Question suivante » apparaît' }
          ],
          hint: 'Dans `choisir`, appelle `repondre(etat, i)` et garde le résultat dans `juste`. L’opérateur `juste ? \'correct\' : \'faux\'` choisit la classe en une ligne.',
          explain: 'L’écouteur est ajouté au moment où chaque bouton est créé, donc les nouveaux boutons de chaque question en ont un. Désactiver les boutons et ignorer les réponses en double (`null`) protègent le score de deux façons complémentaires.'
        }
      },
      {
        title: 'Étape 4 : question suivante et fin du quiz',
        explain: 'Le bouton « Question suivante » existe dans le HTML : on lui ajoute **un seul écouteur**, une fois pour toutes. Au clic, `passerSuivante(etat)` avance et indique s’il reste une question. Si oui, on efface le message, on recache le bouton et on affiche la question. Sinon, on affiche **l’écran de fin** avec le score final.\n\nRemarque l’organisation : chaque fonction d’affichage (`afficherQuestion`, `afficherFin`) part de l’état et redessine sa zone. La logique de l’étape 1 n’a pas changé d’une ligne depuis le début.',
        ex: {
          type: 'code',
          dom: true,
          html: QZ_HTML,
          prompt: 'Complète `afficherFin()` et ajoute l’écouteur de clic de `boutonSuivante` : question suivante s’il en reste une, écran de fin sinon.',
          starter: js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2, QZ_CHOISIR, QZ_FIN_0, QZ_SUIVANTE_0, QZ_DEMARRER),
          solution: QZ_S4,
          tests: [
            { code: "document.querySelectorAll('#choix button')[1].click();\ndocument.querySelector('#suivante').click();\nassertEqual(document.querySelector('#progression').textContent, 'Question 2 / 3');\nassertEqual(document.querySelector('#question').textContent, QUESTIONS[1].texte);", label: 'Le bouton suivant affiche la question 2' },
            { code: "assertEqual(document.querySelector('#retour').textContent, '');\nassert(document.querySelector('#suivante').hidden, 'le bouton suivant doit être caché tant qu’on n’a pas répondu');", label: 'Le message est effacé et le bouton suivant recaché' },
            { code: "document.querySelectorAll('#choix button')[0].click();\nassertEqual(document.querySelector('#retour').textContent, 'Raté : la bonne réponse était « 3 ».');\nassertEqual(document.querySelector('#score').textContent, 'Score : 1');", label: 'Une mauvaise réponse affiche la bonne réponse, sans point' },
            { code: "document.querySelector('#suivante').click();\ndocument.querySelectorAll('#choix button')[0].click();\ndocument.querySelector('#suivante').click();\nassertEqual(document.querySelector('#question').textContent, 'Score final : 2 / 3');\nassertEqual(document.querySelector('#progression').textContent, 'Quiz terminé');\nassertEqual(document.querySelectorAll('#choix button').length, 0);", label: 'Après la 3e question : « Score final : 2 / 3 »' }
          ],
          hint: '`boutonSuivante.addEventListener(\'click\', () => { if (passerSuivante(etat)) { ... } else { afficherFin(); } });`',
          explain: '`passerSuivante` fait deux choses à la fois : elle avance et elle dit s’il reste une question. L’écouteur n’a donc qu’un `if` à écrire. L’écran de fin réutilise les mêmes zones que les questions.'
        }
      },
      {
        title: 'Étape 5 : message final et nouvelle partie',
        explain: 'Un bon écran de fin donne un **retour utile** et propose de **rejouer**. La fonction `message(score, total)` choisit un texte selon le résultat : c’est une fonction pure, facile à tester.\n\nPour recommencer, il faut remettre l’état à zéro. Mais `etat` est déclaré avec `const` : on ne peut pas lui affecter un nouvel objet. On peut en revanche **modifier ses propriétés** : `Object.assign(etat, creerEtat())` recopie les valeurs de départ dans l’objet existant. `const` empêche de réassigner la variable, pas de modifier l’objet qu’elle désigne. Le bouton « Recommencer » est créé dans l’écran de fin, avec son propre écouteur.',
        ex: {
          type: 'code',
          dom: true,
          html: QZ_HTML,
          prompt: 'Écris `message(score, total)` et `recommencer()`, puis modifie `afficherFin` : elle affiche le message dans `#retour` et ajoute un bouton `id="recommencer"` qui relance le quiz.',
          starter: js(QZ_DONNEES, QZ_ETAT, QZ_REPONDRE, QZ_ZONES, QZ_ZONES2, QZ_AFFICHER2, QZ_CHOISIR, QZ_MESSAGE_0, QZ_RECOMMENCER_0, QZ_FIN2_0, QZ_SUIVANTE, QZ_DEMARRER),
          solution: QZ_S5,
          tests: [
            { code: "assertEqual(message(3, 3), 'Parfait : toutes les réponses sont justes.');\nassertEqual(message(2, 3), 'Bon résultat : relis les questions manquées.');\nassertEqual(message(1, 3), 'Relis la leçon, puis retente le quiz.');", label: 'message choisit le bon texte selon le score' },
            { code: "for (const i of [1, 1, 0]) {\n  document.querySelectorAll('#choix button')[i].click();\n  document.querySelector('#suivante').click();\n}\nassertEqual(document.querySelector('#question').textContent, 'Score final : 3 / 3');\nassertEqual(document.querySelector('#retour').textContent, 'Parfait : toutes les réponses sont justes.');", label: 'Un sans-faute affiche « Parfait » à la fin' },
            { code: "const bouton = document.querySelector('#recommencer');\nassert(bouton, 'un bouton #recommencer doit apparaître à la fin');\nbouton.click();\nassertEqual(document.querySelector('#progression').textContent, 'Question 1 / 3');\nassertEqual(document.querySelector('#score').textContent, 'Score : 0');\nassertEqual(etat.score, 0);\nassertEqual(document.querySelectorAll('#choix button').length, 3);", label: 'Recommencer remet le quiz à la question 1 avec un score de 0' }
          ],
          hint: 'Dans `message`, teste d’abord le sans-faute (`score === total`), puis `score >= total / 2`. Dans `afficherFin`, crée le bouton comme les boutons de choix, avec `bouton.id = \'recommencer\'`.',
          explain: '`Object.assign` modifie l’objet existant : toutes les fonctions qui utilisent `etat` voient immédiatement les valeurs remises à zéro. Créer le bouton dans `#choix` permet qu’il disparaisse tout seul quand `afficherQuestion` vide la zone.'
        }
      }
    ],
    solution: {
      code: '/* Page HTML attendue dans index.html (ce fichier quiz.js se charge à la fin du body, avec une balise script et son attribut src) :\n' + QZ_HTML.replace(/\n<style>[\s\S]*$/, '') + '\n*/\n\n' + QZ_S5,
      explain: 'Le code suit une organisation en trois couches. Les données (`QUESTIONS`), la logique (`creerEtat`, `repondre`, `passerSuivante`, `message`) qui ne touche jamais la page, et l’affichage (`afficherQuestion`, `choisir`, `afficherFin`) qui lit l’état et redessine. Les événements ne font que relier un clic à une fonction.\n\nPour ajouter des questions, il suffit de compléter le tableau : rien d’autre ne change. Sur ta machine, mets le HTML dans `index.html` et le code dans `quiz.js`, chargé à la fin du `body` (ou avec l’attribut `defer`) pour que les zones existent quand le script s’exécute.'
    },
    variant: 'Mélange l’ordre des questions au démarrage (algorithme de Fisher-Yates) et celui des choix. Ajoute une explication à chaque question, affichée après la réponse. Permets de répondre au clavier avec les touches 1, 2 et 3 (`keydown` sur `document`). Charge les questions depuis un fichier JSON avec `fetch` sur ta machine.'
  };

  CQ.addProjects([projetCalculatrice, projetDevinettes, projetSite, projetMotsDePasse, projetTaches, projetCsv, projetQuiz]);
})();
