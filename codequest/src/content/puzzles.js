// Énigmes du défi du jour de CodeQuest : 24 énigmes courtes de logique algorithmique.
// unit : null (aucun prérequis) ou l’unité à avoir terminée quand l’énigme contient du Python.
CQ.addPuzzles([
  {
    id: 'pz.01', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Quel nombre vient ensuite ?\n\n`1, 3, 6, 10, 15, ?`',
      answer: '21',
      accept: ['vingt et un', 'vingt-et-un'],
      mistakes: [
        { answer: '20', why: 'Les écarts ne sont pas constants : +2, +3, +4, +5… Le suivant est donc +6, pas +5.' },
        { answer: '25', why: 'Ce n’est pas une suite de multiples de 5 : regarde plutôt la différence entre deux nombres voisins.' }
      ],
      hint: 'Calcule la différence entre chaque nombre et le suivant.',
      explain: 'Les écarts augmentent de 1 à chaque fois : +2, +3, +4, +5, puis +6. Donc 15 + 6 = 21. Ce sont les nombres triangulaires : le n-ième vaut 1 + 2 + … + n, soit n × (n + 1) / 2. On les retrouve dès qu’on compte des paires ou des tours de boucles imbriquées.'
    }
  },
  {
    id: 'pz.02', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Le nombre binaire `110101` vaut combien en décimal ?',
      answer: '53',
      accept: ['cinquante-trois', 'cinquante trois'],
      mistakes: [
        { answer: '43', why: 'Tu as lu les poids dans le mauvais sens. Le bit le plus à droite vaut 1, puis 2, 4, 8, 16, et le plus à gauche vaut 32.' },
        { answer: '4', why: '4 est le nombre de bits à 1, pas la valeur du nombre. Chaque 1 vaut une puissance de 2 différente selon sa position.' }
      ],
      hint: 'De droite à gauche, les positions valent 1, 2, 4, 8, 16 et 32. Additionne celles où il y a un 1.',
      explain: 'Chaque position vaut une puissance de 2, en partant de la droite : 1, 2, 4, 8, 16, 32. `110101` = 32 + 16 + 4 + 1 = 53. C’est le même principe qu’en décimal, où les positions valent 1, 10, 100, 1 000…'
    }
  },
  {
    id: 'pz.03', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Six personnes se retrouvent. Chacune serre la main de chacune des autres, une seule fois. Combien de poignées de main y a-t-il en tout ?',
      answer: '15',
      accept: ['quinze'],
      mistakes: [
        { answer: '30', why: '6 × 5 = 30 compte chaque poignée de main deux fois : celle d’Ana avec Ben et celle de Ben avec Ana sont la même. Il faut diviser par 2.' },
        { answer: '36', why: '6 × 6 compterait aussi les personnes qui se serrent la main à elles-mêmes, et chaque poignée deux fois.' }
      ],
      hint: 'Combien de mains serre chaque personne ? Une poignée de main concerne combien de personnes ?',
      explain: 'Chaque personne serre 5 mains : 6 × 5 = 30. Mais chaque poignée de main concerne deux personnes, donc elle a été comptée deux fois : 30 / 2 = 15. C’est le nombre de paires dans un groupe de 6. Un algorithme qui compare chaque élément à tous les autres fait exactement ce calcul.'
    }
  },
  {
    id: 'pz.04', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Suis cet algorithme à la main. Quelle valeur affiche-t-il ?',
      code: `i ← 1
tours ← 0
tant que i < 100 :
    i ← i × 3
    tours ← tours + 1
afficher tours`,
      answer: '5',
      accept: ['cinq'],
      mistakes: [
        { answer: '4', why: 'Après 4 tours, i vaut 81, qui est encore inférieur à 100 : la boucle fait un tour de plus.' },
        { answer: '33', why: 'Ce serait le nombre de tours si i augmentait de 3 à chaque fois. Ici, i est multiplié par 3 : il grandit beaucoup plus vite.' }
      ],
      hint: 'Note la valeur de i après chaque tour, et vérifie la condition `i < 100` avant chaque nouveau tour.',
      explain: 'Les valeurs de i sont 1, 3, 9, 27, 81, puis 243. La condition `i < 100` est encore vraie à 81, donc un 5e tour a lieu et i passe à 243. Quand une valeur est multipliée à chaque tour, le nombre de tours reste très petit : il grandit comme un logarithme.'
    }
  },
  {
    id: 'pz.05', unit: 'py.u4',
    ex: {
      type: 'predict',
      lang: 'python',
      prompt: 'Qu’affiche ce programme ?',
      code: `x = 0
print(x != 0 and 10 / x > 1)
print(x == 0 or 10 / x > 1)`,
      answer: `False
True`,
      mistakes: [
        { answer: 'ZeroDivisionError: division by zero', why: 'Python n’évalue pas toujours les deux côtés : avec `and`, si la gauche est fausse, la droite est ignorée ; avec `or`, si la gauche est vraie, la droite est ignorée. La division par zéro n’a jamais lieu.' },
        { answer: 'False\nFalse', why: 'Avec `or`, il suffit qu’un côté soit vrai : `x == 0` est vrai, donc le résultat est `True`.' }
      ],
      hint: 'Python a-t-il besoin de regarder le côté droit d’un `and` quand le côté gauche est déjà faux ?',
      explain: '`and` et `or` s’arrêtent dès que le résultat est connu : c’est l’évaluation en court-circuit. `x != 0` est faux, donc `and` renvoie `False` sans calculer `10 / x`. `x == 0` est vrai, donc `or` renvoie `True`, là aussi sans diviser. On s’en sert pour protéger une opération risquée : `if x != 0 and 10 / x > 1:`.'
    }
  },
  {
    id: 'pz.06', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Aujourd’hui, nous sommes mercredi. Quel jour de la semaine serons-nous dans 100 jours ?',
      answer: 'vendredi',
      accept: ['Vendredi', 'un vendredi'],
      mistakes: [
        { answer: 'jeudi', why: '100 = 14 × 7 + 2 : après 14 semaines complètes, on est de nouveau mercredi, puis on avance encore de 2 jours, pas d’un seul.' },
        { answer: 'mercredi', why: '100 n’est pas un multiple de 7 : après 14 semaines (98 jours), il reste encore 2 jours.' }
      ],
      hint: 'Tous les 7 jours, on retombe sur mercredi. Combien de jours restent après les semaines complètes ?',
      explain: 'Tous les 7 jours, on retombe sur le même jour. Seul compte le reste de la division de 100 par 7 : 100 = 7 × 14 + 2, donc `100 % 7` vaut 2. Mercredi + 2 jours = vendredi. Le modulo sert partout pour les cycles : heures, jours de la semaine, positions dans un tableau circulaire.'
    }
  },
  {
    id: 'pz.07', unit: null,
    ex: {
      type: 'qcm',
      prompt: 'Un éditeur de texte garde l’historique de tes actions pour le raccourci « Annuler » : chaque appui annule la **dernière** action faite. Quelle structure de données convient le mieux ?',
      choices: [
        'Une pile : le dernier élément ajouté sort le premier',
        'Une file : le premier élément ajouté sort le premier',
        'Un ensemble',
        'Un dictionnaire trié par nom d’action'
      ],
      answer: 0,
      why: {
        1: 'Une file rendrait d’abord l’action la plus ancienne : « Annuler » déferait ta toute première modification.',
        2: 'Un ensemble n’a pas d’ordre et ne garde pas les doublons : impossible de savoir quelle action est la dernière.',
        3: 'Trier par nom fait perdre l’ordre chronologique, qui est justement l’information utile ici.'
      },
      hint: 'Quelle action est annulée en premier : la plus ancienne ou la plus récente ?',
      explain: '« Annuler » défait toujours l’action la plus récente : c’est le principe de la pile, dernier entré, premier sorti. Chaque action est empilée ; « Annuler » retire le sommet. En Python, une liste suffit : `append` pour empiler, `pop()` pour dépiler. Le bouton « Précédent » d’un navigateur fonctionne de la même façon.'
    }
  },
  {
    id: 'pz.08', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Les nombres de 1 à 10 sont écrits au tableau. À chaque étape, tu effaces deux nombres et tu écris à leur place leur différence (le plus grand moins le plus petit). Après 9 étapes, il ne reste qu’un nombre. Est-il pair ou impair ?',
      answer: 'impair',
      accept: ['Impair', 'impaire', 'il est impair', 'un nombre impair'],
      mistakes: [
        { answer: 'pair', why: 'Une quantité ne change jamais d’une étape à l’autre : la parité de la somme. Elle vaut 55 au départ, impaire, et le reste jusqu’au bout.' },
        { answer: 'ça dépend', why: 'On pourrait le croire, car les choix sont libres. Mais la parité de la somme ne change à aucune étape : le résultat est toujours le même.' }
      ],
      hint: 'Cherche ce qui ne change pas d’une étape à l’autre. Compare la somme de tous les nombres avant et après une étape.',
      explain: 'Remplacer a et b par a − b fait baisser la somme totale de 2 × b : la somme garde donc sa parité. Au départ, 1 + 2 + … + 10 = 55, qui est impair. Le dernier nombre est la somme finale : il est forcément impair, quels que soient les choix. Une propriété qui ne change jamais s’appelle un invariant ; on s’en sert pour prouver qu’un algorithme est correct.'
    }
  },
  {
    id: 'pz.09', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Quel nombre vient ensuite ?\n\n`2, 3, 5, 9, 17, ?`',
      answer: '33',
      accept: ['trente-trois', 'trente trois'],
      mistakes: [
        { answer: '25', why: 'L’écart ne reste pas à 8 : les écarts doublent (1, 2, 4, 8). Le suivant est 16.' },
        { answer: '34', why: '34 est le double de 17. La règle est « le double moins 1 » : 2 × 17 − 1 = 33.' }
      ],
      hint: 'Compare chaque nombre au double du précédent. Ou regarde comment évoluent les écarts.',
      explain: 'Chaque terme vaut le double du précédent moins 1 : 2 × 2 − 1 = 3, 2 × 3 − 1 = 5, …, 2 × 17 − 1 = 33. Autre lecture : les écarts doublent (1, 2, 4, 8, puis 16). Chaque terme est une puissance de 2 plus 1 : 1 + 1, 2 + 1, 4 + 1, 8 + 1, 16 + 1, 32 + 1.'
    }
  },
  {
    id: 'pz.10', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Combien de bits faut-il au minimum pour écrire le nombre 200 en binaire ?',
      answer: '8',
      accept: ['huit', '8 bits'],
      mistakes: [
        { answer: '7', why: 'Avec 7 bits, le plus grand nombre est 127 (64 + 32 + 16 + 8 + 4 + 2 + 1). 200 ne rentre pas.' },
        { answer: '3', why: '3 est le nombre de chiffres de 200 en décimal. En binaire, chaque chiffre ne vaut que 0 ou 1 : il en faut davantage.' }
      ],
      hint: 'Avec 1 bit, on va jusqu’à 1 ; avec 2 bits, jusqu’à 3 ; avec 3 bits, jusqu’à 7. Jusqu’où va-t-on avec 7 bits ?',
      explain: 'Avec n bits, on écrit les nombres de 0 à 2 puissance n moins 1 : jusqu’à 127 avec 7 bits, jusqu’à 255 avec 8 bits. 200 est entre 128 et 255 : il faut 8 bits. En binaire, 200 s’écrit `11001000`, soit 128 + 64 + 8.'
    }
  },
  {
    id: 'pz.11', unit: null,
    ex: {
      type: 'logic',
      prompt: 'A, B et C valent chacun vrai ou faux, soit 8 combinaisons possibles. Pour combien de ces combinaisons l’expression `(A ou B) et non C` est-elle vraie ?',
      answer: '3',
      accept: ['trois'],
      mistakes: [
        { answer: '6', why: '`A ou B` est vrai dans 6 combinaisons sur 8, mais il faut aussi que C soit faux, ce qui en élimine la moitié.' },
        { answer: '4', why: '`non C` est vrai dans 4 combinaisons, mais parmi elles, celle où A et B sont tous les deux faux ne convient pas.' }
      ],
      hint: 'Commence par la condition sur C : combien de combinaisons la respectent ? Parmi elles, lesquelles rendent `A ou B` vrai ?',
      explain: 'Il faut C faux (4 combinaisons sur 8) et au moins un de A ou B vrai. Parmi les 4 combinaisons de A et B, seule « A faux, B faux » échoue. Il reste 3 combinaisons : (vrai, vrai), (vrai, faux) et (faux, vrai), toujours avec C faux.'
    }
  },
  {
    id: 'pz.12', unit: 'py.u5',
    ex: {
      type: 'predict',
      lang: 'python',
      prompt: 'Qu’affiche ce programme ?',
      code: `n = 1000
etapes = 0
while n > 1:
    n = n // 2
    etapes += 1
print(etapes)`,
      answer: '9',
      mistakes: [
        { answer: '10', why: '1000 n’est pas une puissance de 2 : `//` arrondit vers le bas (125 // 2 donne 62) et on atteint 1 après 9 divisions.' },
        { answer: '500', why: 'n n’est pas diminué de 2 à chaque tour, il est divisé par 2 : il fond très vite.' }
      ],
      hint: 'Écris la valeur de n après chaque tour. `//` arrondit vers le bas.',
      explain: 'Les valeurs de n sont 1000, 500, 250, 125, 62, 31, 15, 7, 3, puis 1 : 9 divisions. Diviser par 2 à chaque tour donne un nombre de tours proche du logarithme en base 2 de n : environ 10 pour mille, 20 pour un million. C’est ce qui rend la recherche dichotomique si rapide.'
    }
  },
  {
    id: 'pz.13', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Tu as 9 billes identiques en apparence ; l’une d’elles est un peu plus lourde. Avec une balance à deux plateaux, sans poids, combien de pesées faut-il au minimum pour être sûr de trouver la bille lourde ?',
      answer: '2',
      accept: ['deux', '2 pesées'],
      mistakes: [
        { answer: '3', why: 'C’est ce qu’on obtient en coupant en deux (4 contre 4). Une pesée a trois issues possibles (gauche, droite, équilibre) : on peut couper en trois.' },
        { answer: '4', why: 'Peser les billes deux par deux est trop lent. En pesant 3 billes contre 3, une seule pesée élimine déjà 6 billes.' }
      ],
      hint: 'Une pesée a trois résultats possibles, pas deux. Peux-tu en profiter pour éliminer plus de la moitié des billes ?',
      explain: 'Pèse 3 billes contre 3. Si un plateau penche, la lourde est parmi ces 3 ; sinon, elle est parmi les 3 restantes. Avec ces 3 billes, pèse 1 contre 1 : soit un plateau penche, soit c’est la troisième. Chaque pesée divise les candidates par 3 : 9, puis 3, puis 1, soit 2 pesées.'
    }
  },
  {
    id: 'pz.14', unit: null,
    ex: {
      type: 'qcm',
      prompt: 'Pour trouver les doublons d’une liste de 1 000 éléments, un programme compare chaque élément à tous les autres, chaque paire une seule fois. Environ combien de comparaisons fait-il ?',
      choices: ['Environ 2 000', 'Environ 10 000', 'Environ 500 000', 'Environ 1 000 000 000'],
      answer: 2,
      why: {
        0: '2 000 correspond à un ou deux parcours de la liste. Ici, chaque élément est comparé à presque tous les autres.',
        1: 'C’est beaucoup trop peu : le premier élément à lui seul est comparé à 999 autres, le deuxième à 998, et ainsi de suite.',
        3: 'Un milliard, c’est 1 000 × 1 000 × 1 000. Le nombre de paires est de l’ordre de 1 000 × 1 000, divisé par 2.'
      },
      hint: 'Combien de comparaisons pour le premier élément ? Pour le deuxième ? Pense aux poignées de main dans un groupe.',
      explain: 'Le premier élément est comparé à 999 autres, le deuxième à 998, etc. : 999 + 998 + … + 1 = 1 000 × 999 / 2 = 499 500. Le travail grandit comme le carré de la taille : c’est un algorithme quadratique. Avec un ensemble (`set`), on trouve les doublons en un seul parcours.'
    }
  },
  {
    id: 'pz.15', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Suis cet algorithme à la main. Que vaut b à la fin ?',
      code: `a ← 3
b ← 5
a ← a + b
b ← a − b
a ← a − b`,
      answer: '3',
      accept: ['trois', 'b = 3', 'b=3'],
      mistakes: [
        { answer: '5', why: 'b change à la 4e ligne : a vaut alors 8, donc b devient 8 − 5 = 3.' },
        { answer: '-2', why: 'Tu as utilisé l’ancienne valeur de a. À la 4e ligne, a vaut déjà 8 (3 + 5).' }
      ],
      hint: 'Note les valeurs de a et b après chaque ligne. Une affectation utilise les valeurs du moment.',
      explain: 'Après `a ← a + b`, a vaut 8. Puis `b ← a − b` donne 8 − 5 = 3, et `a ← a − b` donne 8 − 3 = 5. Les deux valeurs ont été échangées sans variable temporaire. Astuce amusante, mais en Python on écrit simplement `a, b = b, a`.'
    }
  },
  {
    id: 'pz.16', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Pour aller d’un point A à un point B dans un quartier quadrillé, tu dois faire exactement 3 pas vers la droite et 3 pas vers le bas, dans l’ordre que tu veux. Combien de trajets différents existe-t-il ?',
      answer: '20',
      accept: ['vingt'],
      mistakes: [
        { answer: '6', why: '6 est le nombre total de pas. La vraie question est : parmi ces 6 pas, lesquels vont vers la droite ?' },
        { answer: '9', why: '3 × 3 ne compte pas les ordres possibles des pas. Il faut choisir les positions des 3 pas « droite » parmi les 6.' },
        { answer: '720', why: '6 × 5 × 4 × 3 × 2 × 1 compte comme différents des trajets identiques : échanger deux pas « droite » entre eux ne change pas le trajet.' }
      ],
      hint: 'Écris un trajet comme un mot de 6 lettres avec 3 D et 3 B. De combien de façons peux-tu placer les 3 D ?',
      explain: 'Un trajet est une suite de 6 pas : 3 « droite » et 3 « bas ». Il suffit de choisir les positions des 3 pas « droite » parmi les 6 : 6 × 5 × 4 / (3 × 2 × 1) = 20. On peut aussi compter carrefour par carrefour : le nombre de trajets vers un carrefour est la somme des trajets vers celui de gauche et celui du dessus (triangle de Pascal).'
    }
  },
  {
    id: 'pz.17', unit: 'py.u7',
    ex: {
      type: 'predict',
      lang: 'python',
      prompt: 'Qu’affiche ce programme ?',
      code: `a = [1, 2, 3]
b = a
b.append(4)
c = a[:]
c.append(5)
print(len(a), len(b), len(c))`,
      answer: '4 4 5',
      mistakes: [
        { answer: '3 4 5', why: '`b = a` ne copie pas la liste : a et b désignent la même liste. Ajouter un élément via b, c’est l’ajouter à a.' },
        { answer: '5 5 5', why: '`a[:]` crée une copie indépendante : ajouter 5 à c ne modifie ni a ni b.' }
      ],
      hint: 'Combien de listes différentes existent vraiment en mémoire ? Une affectation copie-t-elle une liste ?',
      explain: '`b = a` donne un deuxième nom à la même liste : après `b.append(4)`, a et b ont 4 éléments. `a[:]` fabrique une copie : `c.append(5)` ne touche que c, qui a 5 éléments. À retenir : une affectation ne copie jamais une liste.'
    }
  },
  {
    id: 'pz.18', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Alice dit : « Bob ment. » Bob dit : « Charlie ment. » Charlie dit : « Alice et Bob mentent tous les deux. » Chaque personne dit soit toujours la vérité, soit toujours un mensonge. Qui dit la vérité ?',
      answer: 'Bob',
      accept: ['bob', 'Bob seul', 'seulement Bob', 'uniquement Bob'],
      mistakes: [
        { answer: 'Charlie', why: 'Si Charlie disait vrai, Alice et Bob mentiraient tous les deux. Mais si Alice ment, sa phrase « Bob ment » est fausse : Bob dit vrai. Contradiction.' },
        { answer: 'Alice', why: 'Si Alice disait vrai, Bob mentirait, donc Charlie dirait vrai : Alice et Bob mentiraient tous les deux. Contradiction avec l’hypothèse de départ.' }
      ],
      hint: 'Fais une hypothèse sur une seule personne, par exemple Bob, et déroule les conséquences jusqu’à une contradiction ou une situation cohérente.',
      explain: 'Supposons que Bob mente : alors Alice dit vrai, et Charlie aussi (puisque Bob, qui l’accuse, ment). Mais Charlie affirme qu’Alice ment : contradiction. Donc Bob dit vrai : Charlie ment, et Alice, qui accuse Bob, ment aussi. Vérification : Charlie dit qu’Alice et Bob mentent, ce qui est faux puisque Bob dit vrai. Tout est cohérent.'
    }
  },
  {
    id: 'pz.19', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Une pizzeria propose 5 garnitures. Chacune peut être présente ou absente sur une pizza. Combien de pizzas différentes peut-on composer, y compris celle sans aucune garniture ?',
      answer: '32',
      accept: ['trente-deux', 'trente deux'],
      mistakes: [
        { answer: '10', why: '5 × 2 additionne les possibilités au lieu de les multiplier. Chaque nouvelle garniture double le nombre de pizzas possibles.' },
        { answer: '25', why: '5 × 5 ne correspond à rien ici : chaque garniture est un choix à 2 possibilités, et ces choix se multiplient.' },
        { answer: '31', why: '31 oublie la pizza sans garniture, que l’énoncé demande de compter.' }
      ],
      hint: 'Avec 1 garniture, combien de pizzas ? Avec 2 ? Avec 3 ? Comment le nombre évolue-t-il à chaque garniture ajoutée ?',
      explain: 'Chaque garniture est un choix oui ou non : 2 possibilités. Les choix sont indépendants, donc on multiplie : 2 × 2 × 2 × 2 × 2 = 32. C’est exactement le nombre de nombres binaires sur 5 bits, de 00000 à 11111 : chaque bit dit si une garniture est présente.'
    }
  },
  {
    id: 'pz.20', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Combien vaut compteur à la fin ? Les bornes des boucles « pour » sont incluses.',
      code: `compteur ← 0
pour i de 1 à 4 :
    pour j de i à 4 :
        compteur ← compteur + 1
afficher compteur`,
      answer: '10',
      accept: ['dix'],
      mistakes: [
        { answer: '16', why: '4 × 4 suppose que j va toujours de 1 à 4. Ici, j commence à i : la boucle intérieure raccourcit à chaque tour.' },
        { answer: '6', why: '6 correspondrait à j allant de i + 1 à 4. Ici, j commence à i lui-même, ce qui ajoute un tour pour chaque valeur de i.' }
      ],
      hint: 'Pour chaque valeur de i, compte combien de valeurs prend j.',
      explain: 'Pour i = 1, j prend 4 valeurs ; pour i = 2, 3 valeurs ; pour i = 3, 2 ; pour i = 4, 1. Total : 4 + 3 + 2 + 1 = 10. Ce motif « triangulaire » est fréquent : comparer chaque élément avec lui-même et les suivants donne n × (n + 1) / 2 tours.'
    }
  },
  {
    id: 'pz.21', unit: null,
    ex: {
      type: 'qcm',
      prompt: 'Un programme compare chaque élément d’une liste à tous les autres. Il met 2 secondes pour 1 000 éléments. Combien de temps environ lui faut-il pour 2 000 éléments ?',
      choices: ['Environ 4 secondes', 'Environ 8 secondes', 'Environ 3 secondes', 'Environ 2 secondes'],
      answer: 1,
      why: {
        0: 'Le temps doublerait si le travail grandissait comme la taille, avec un seul parcours. Ici, le nombre de paires grandit comme le carré de la taille.',
        2: 'Rien ne justifie d’ajouter une seconde : le travail dépend du nombre de paires à comparer.',
        3: 'Le temps ne reste constant que si le travail ne dépend pas de la taille, comme lire le premier élément d’une liste.'
      },
      hint: 'Si la liste est deux fois plus longue, combien de fois plus de paires y a-t-il à comparer ?',
      explain: 'Le nombre de comparaisons est proportionnel au carré du nombre d’éléments. Doubler la taille multiplie donc le travail par 2 × 2 = 4 : environ 8 secondes. Avec 10 000 éléments, ce serait 100 fois plus que pour 1 000, soit plus de 3 minutes. D’où l’intérêt des algorithmes plus efficaces.'
    }
  },
  {
    id: 'pz.22', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Que vaut `f(1987)` ? Ici, `mod` donne le reste de la division entière et `div` le quotient.',
      code: `fonction f(n) :
    si n < 10 :
        renvoyer n
    sinon :
        renvoyer (n mod 10) + f(n div 10)`,
      answer: '25',
      accept: ['vingt-cinq', 'vingt cinq'],
      mistakes: [
        { answer: '7', why: '7 n’est que le premier `n mod 10`. La fonction s’appelle ensuite elle-même sur 198, puis 19, puis 1.' },
        { answer: '24', why: 'Tu as oublié le dernier appel : f(1) renvoie 1, qui s’ajoute aussi.' }
      ],
      hint: 'Déroule les appels un par un : que valent `1987 mod 10` et `1987 div 10` ?',
      explain: '`n mod 10` donne le dernier chiffre et `n div 10` enlève ce chiffre. Donc f(1987) = 7 + f(198) = 7 + 8 + f(19) = 7 + 8 + 9 + f(1) = 7 + 8 + 9 + 1 = 25. La fonction calcule la somme des chiffres ; le cas `n < 10` arrête la récursivité.'
    }
  },
  {
    id: 'pz.23', unit: null,
    ex: {
      type: 'logic',
      prompt: 'Tu comptes sur tes 10 doigts en binaire : un doigt levé vaut 1, un doigt baissé vaut 0. En partant de 0 (tous les doigts baissés), jusqu’à quel nombre peux-tu compter ?',
      answer: '1023',
      accept: ['1 023', 'mille vingt-trois', 'mille vingt trois'],
      mistakes: [
        { answer: '10', why: 'En comptant normalement, chaque doigt ajoute 1. En binaire, chaque doigt ajouté double le nombre de combinaisons.' },
        { answer: '1024', why: 'Il y a bien 1 024 combinaisons, mais la première représente 0 : on compte donc de 0 à 1 023.' }
      ],
      hint: 'Avec 1 doigt, tu comptes jusqu’à 1 ; avec 2 doigts, jusqu’à 3 ; avec 3 doigts, jusqu’à 7. Quelle est la règle ?',
      explain: '10 doigts, ce sont 10 bits : 2 puissance 10 = 1 024 combinaisons. Comme on commence à 0, le plus grand nombre est 1 023, tous les doigts levés : 512 + 256 + … + 2 + 1. Le même calcul explique qu’un octet (8 bits) va de 0 à 255.'
    }
  },
  {
    id: 'pz.24', unit: 'py.u16',
    ex: {
      type: 'predict',
      lang: 'python',
      prompt: 'Qu’affiche ce programme ?',
      code: `def f(n):
    if n == 0:
        return ""
    return f(n // 2) + str(n % 2)

print(f(13))`,
      answer: '1101',
      mistakes: [
        { answer: '1011', why: 'Les restes sont calculés dans l’ordre 1, 0, 1, 1, mais chaque appel place son reste **après** le résultat de l’appel suivant : la chaîne se construit dans l’ordre inverse.' },
        { answer: '13', why: '`f` renvoie une chaîne construite chiffre par chiffre, pas le nombre lui-même : chaque appel ajoute `str(n % 2)`, un 0 ou un 1.' }
      ],
      hint: 'Déroule les appels : f(13) appelle f(6), qui appelle f(3)… Puis remonte en ajoutant chaque reste à la fin.',
      explain: 'f(13) = f(6) + "1", f(6) = f(3) + "0", f(3) = f(1) + "1", f(1) = f(0) + "1" et f(0) = "". En remontant, on obtient "1", "11", "110", puis "1101". La fonction écrit n en binaire : 13 = 8 + 4 + 1. La récursivité remet naturellement les restes dans le bon ordre.'
    }
  }
]);
