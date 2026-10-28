// Parcours Python, chapitre 5 : « Algorithmique » (unités py.u15 à py.u17).
(function () {
  var u15 = {
    id: 'py.u15',
    title: 'Algorithmes et complexité',
    summary: 'Mesurer le coût d\'un algorithme en comptant ses opérations, et chercher vite dans des données triées.',
    lessons: [
      {
        id: 'py.u15.l1',
        title: 'Compter les opérations : la notation O',
        minutes: 8,
        objective: 'Tu sais estimer le coût d\'un algorithme (O(1), O(n), O(n log n), O(n²)) en comptant ses comparaisons selon la taille des données.',
        explain: `Deux programmes corrects peuvent avoir des durées très différentes. Pour les comparer sans chronomètre, on **compte les opérations** en fonction de la taille \`n\` des données. La **notation O** ne garde que le terme qui domine quand \`n\` grandit.

- **O(1)** : coût constant. Lire \`liste[i]\`, tester \`cle in dico\`.
- **O(n)** : une boucle sur les données. Recherche linéaire, \`max\`, \`x in liste\`.
- **O(n log n)** : les bons tris, comme \`sorted()\`. Pour un million d'éléments, environ 20 millions d'opérations.
- **O(n²)** : deux boucles imbriquées sur les données (comparer toutes les paires, tri par sélection). Pour un million d'éléments : de l'ordre de mille milliards.

Repère pratique : quand \`n\` est multiplié par 10, un O(n) coûte 10 fois plus, un O(n²) 100 fois plus. On parle aussi de **meilleur cas** et de **pire cas** : une recherche peut trouver dès la première case, ou tout parcourir.`,
        example: {
          code: `def tri_selection(liste):
    t = list(liste)
    comparaisons = 0
    for i in range(len(t)):
        mini = i
        for j in range(i + 1, len(t)):
            comparaisons += 1
            if t[j] < t[mini]:
                mini = j
        t[i], t[mini] = t[mini], t[i]
    return t, comparaisons

for n in [10, 100, 200]:
    donnees = list(range(n, 0, -1))
    print(n, "->", tri_selection(donnees)[1], "comparaisons")`,
          output: `10 -> 45 comparaisons
100 -> 4950 comparaisons
200 -> 19900 comparaisons`,
          notes: [
            { line: 6, text: `Boucle imbriquée : pour chaque i, on parcourt le reste de la liste. C'est la signature d'un O(n²).` },
            { line: 7, text: `On compte chaque comparaison : au total n × (n - 1) / 2.` },
            { line: 13, text: `n × 10 donne environ 100 fois plus de comparaisons ; n × 2 en donne 4 fois plus.` }
          ]
        },
        exercises: [
          {
            type: 'logic',
            prompt: `Pour une liste de 1000 éléments, combien de fois la ligne \`comparaisons += 1\` s'exécute-t-elle ?`,
            code: `def doublons(liste):
    comparaisons = 0
    for i in range(len(liste)):
        for j in range(len(liste)):
            if i != j:
                comparaisons += 1
    return comparaisons`,
            answer: '999000',
            accept: ['999 000'],
            mistakes: [
              { answer: '1000000', why: `La condition i != j exclut les 1000 cas où i et j sont égaux : 1000 × 1000 - 1000.` },
              { answer: '499500', why: `Ce serait le cas si j partait de i + 1. Ici, j parcourt toute la liste à chaque tour de i.` },
              { answer: '2000', why: `Les deux boucles sont imbriquées, pas l'une après l'autre : on multiplie, on n'additionne pas.` }
            ],
            hint: `Combien de couples (i, j) au total, et combien parmi eux ont i égal à j ?`,
            explain: `Il y a 1000 × 1000 couples (i, j), dont 1000 avec i == j. Résultat : 999 000 comparaisons. C'est un O(n²) : avec 10 000 éléments, on passerait à près de 100 millions.`
          },
          {
            type: 'qcm',
            prompt: `Tu as une liste \`ids\` de 100 000 identifiants autorisés. Pour chacun des 100 000 événements d'un journal, tu dois vérifier si son identifiant est autorisé. Quelle approche choisir ?`,
            choices: [
              `Tester if e in ids pour chaque événement, avec ids en liste.`,
              `Convertir ids en set une seule fois, puis tester if e in autorises.`,
              `Trier ids avant chaque test, puis chercher dedans.`,
              `Peu importe : in est toujours instantané en Python.`
            ],
            answer: 1,
            why: {
              0: `in sur une liste est une recherche linéaire en O(n) : 100 000 tests × jusqu'à 100 000 comparaisons, soit jusqu'à 10 milliards d'opérations.`,
              2: `Trier coûte O(n log n) à chaque fois : c'est encore pire que la recherche linéaire. On trie au plus une fois.`,
              3: `in est en O(1) sur un set ou un dict, mais en O(n) sur une liste : la structure de données change tout.`
            },
            hint: `Quel est le coût de in sur une liste ? Et sur un set ?`,
            explain: `La conversion coûte O(n) une fois, puis chaque test est en O(1) en moyenne. Le total passe de O(n²) à O(n) : quelques centaines de milliers d'opérations au lieu de milliards.`
          }
        ],
        challenge: {
          type: 'predict',
          prompt: `Qu'affiche ce programme ?`,
          code: `def cout_recherche(liste, cible):
    comparaisons = 0
    for x in liste:
        comparaisons += 1
        if x == cible:
            break
    return comparaisons

notes = [12, 7, 15, 9, 7, 20]
print(cout_recherche(notes, 12), cout_recherche(notes, 7), cout_recherche(notes, 20), cout_recherche(notes, 3))`,
          answer: `1 2 6 6`,
          mistakes: [
            { answer: `1 5 6 6`, why: `break arrête la boucle au premier 7 trouvé (position 2) : le second 7 n'est jamais examiné.` },
            { answer: `1 2 6 0`, why: `Quand la cible est absente, la boucle examine tous les éléments avant de s'arrêter : 6 comparaisons, le pire cas.` },
            { answer: `0 1 5 6`, why: `Le compteur est incrémenté avant le test : trouver dès le premier élément coûte déjà 1 comparaison.` }
          ],
          hint: `Pour chaque appel, compte combien d'éléments sont examinés avant le break, ou jusqu'à la fin de la liste.`,
          explain: `Meilleur cas (cible en tête) : 1 comparaison, O(1). Pire cas (cible en fin de liste ou absente) : n comparaisons, O(n). La notation O décrit en général le pire cas.`
        },
        recap: [
          `On mesure un algorithme en comptant ses opérations selon la taille n des données.`,
          `O(1) constant, O(n) une boucle, O(n log n) un bon tri, O(n²) deux boucles imbriquées.`,
          `n × 10 : un O(n) coûte 10 fois plus, un O(n²) 100 fois plus.`,
          `in coûte O(n) sur une liste, O(1) en moyenne sur un set ou un dict.`
        ],
        check: {
          type: 'code',
          prompt: `Voici un tri par insertion. Ajoute le comptage : \`comparaisons\` doit augmenter de 1 **chaque fois que \`t[j]\` est comparé à \`cle\`**. Les tests vérifient le meilleur cas (liste déjà triée) et le pire cas (liste inversée). Tu devras peut-être réécrire la condition du while pour pouvoir compter.`,
          starter: `def tri_insertion(liste):
    t = list(liste)
    comparaisons = 0
    for i in range(1, len(t)):
        cle = t[i]
        j = i - 1
        while j >= 0 and t[j] > cle:
            t[j + 1] = t[j]
            j -= 1
        t[j + 1] = cle
    return t, comparaisons
`,
          solution: `def tri_insertion(liste):
    t = list(liste)
    comparaisons = 0
    for i in range(1, len(t)):
        cle = t[i]
        j = i - 1
        while j >= 0:
            comparaisons += 1
            if t[j] > cle:
                t[j + 1] = t[j]
                j -= 1
            else:
                break
        t[j + 1] = cle
    return t, comparaisons
`,
          tests: [
            { code: `assert tri_insertion([3, 1, 2])[0] == [1, 2, 3]`, label: `la liste est toujours triée correctement` },
            { code: `assert tri_insertion([1, 2, 3, 4, 5])[1] == 4`, label: `liste déjà triée de 5 éléments : 4 comparaisons (meilleur cas, O(n))` },
            { code: `assert tri_insertion([5, 4, 3, 2, 1])[1] == 10`, label: `liste inversée de 5 éléments : 10 comparaisons (pire cas, O(n²))` },
            { code: `assert tri_insertion(list(range(100, 0, -1)))[1] == 4950`, label: `liste inversée de 100 éléments : 4950 comparaisons` }
          ],
          hint: `Avec while j >= 0 and t[j] > cle, la comparaison qui fait sortir de la boucle n'est pas comptée. Transforme-la en while j >= 0, avec un if et un break à l'intérieur.`,
          explain: `Dans une liste triée, chaque élément n'est comparé qu'à son voisin de gauche : n - 1 comparaisons, O(n). Dans une liste inversée, chaque élément remonte jusqu'au début : 1 + 2 + … + (n - 1) = n(n - 1)/2, O(n²). Le même algorithme a donc des coûts très différents selon les données.`
        }
      },
      {
        id: 'py.u15.l2',
        title: 'La recherche dichotomique',
        minutes: 8,
        objective: 'Tu sais appliquer une recherche dichotomique à une liste triée, en connaissant sa condition d\'usage et son coût O(log n).',
        explain: `Dans une liste **triée**, inutile de tout parcourir : regarde l'élément du milieu. S'il est trop petit, la cible ne peut être qu'à droite ; s'il est trop grand, qu'à gauche. Chaque comparaison **élimine la moitié** des candidats.

On garde deux bornes, \`debut\` et \`fin\`, et on recommence tant que \`debut <= fin\`.

Combien d'étapes ? 1 000 000, puis 500 000, 250 000… jusqu'à 1 : une vingtaine de divisions par 2, car \`2 ** 20\` vaut environ un million. C'est **O(log n)** : doubler les données n'ajoute qu'**une** étape.

Le prix à payer : la liste doit être triée. Trier coûte O(n log n), ce qui devient rentable dès qu'on fait beaucoup de recherches. C'est aussi le principe de \`git bisect\`, qui retrouve le commit fautif parmi des milliers, et du module \`bisect\` de Python.`,
        example: {
          code: `def dichotomie(liste, cible):
    debut, fin = 0, len(liste) - 1
    etapes = 0
    while debut <= fin:
        etapes += 1
        milieu = (debut + fin) // 2
        if liste[milieu] == cible:
            return milieu, etapes
        elif liste[milieu] < cible:
            debut = milieu + 1
        else:
            fin = milieu - 1
    return -1, etapes

nombres = list(range(0, 2000000, 2))
print(dichotomie(nombres, 1234568))
print(dichotomie(nombres, 7))`,
          output: `(617284, 17)
(-1, 20)`,
          notes: [
            { line: 4, text: `Tant qu'il reste au moins une case entre les bornes, on continue.` },
            { line: 6, text: `// 2 donne un indice entier au milieu de la zone restante.` },
            { line: 10, text: `On exclut le milieu et toute la moitié gauche : la zone de recherche est divisée par 2.` },
            { line: 15, text: `Un million de nombres pairs : 20 étapes au plus, là où une recherche linéaire en ferait jusqu'à un million.` }
          ]
        },
        exercises: [
          {
            type: 'fill',
            prompt: `Complète cette recherche dichotomique.`,
            code: `def dichotomie(liste, cible):
    debut, fin = 0, len(liste) - 1
    while debut ___ fin:
        milieu = (debut + fin) // 2
        if liste[milieu] == cible:
            return milieu
        elif liste[milieu] < cible:
            debut = ___
        else:
            fin = milieu - 1
    return -1

triee = [3, 8, 15, 23, 42, 57]
print(dichotomie(triee, 42), dichotomie(triee, 57), dichotomie(triee, 10))`,
            blanks: [
              { answers: ['<='], options: ['<=', '<', '!='], why: { '<': `Avec <, la boucle s'arrête quand il reste une seule case (debut == fin) sans l'examiner : 57 ne serait pas trouvé.`, '!=': `Avec !=, une zone d'une seule case (debut == fin) n'est pas examinée, et si les bornes se croisent (fin < debut), la boucle peut ne jamais s'arrêter.` } },
              { answers: ['milieu + 1'], options: ['milieu + 1', 'milieu', 'milieu - 1'], why: { 'milieu': `Si debut vaut déjà milieu, la zone ne rétrécit plus : boucle infinie.`, 'milieu - 1': `La cible est à droite du milieu : reculer debut agrandit la zone au lieu de la réduire.` } }
            ],
            output: `4 5 -1`,
            hint: `Le milieu a déjà été examiné : la nouvelle zone commence juste après lui. Et une zone d'une seule case doit encore être examinée.`,
            explain: `La boucle continue tant que la zone [debut, fin] contient au moins une case, d'où <=. Quand le milieu est trop petit, on l'exclut avec debut = milieu + 1 : la zone rétrécit à chaque tour, ce qui garantit la fin de la boucle.`
          },
          {
            type: 'logic',
            prompt: `Une liste triée contient 1000 éléments. Au **maximum**, combien d'éléments une recherche dichotomique examine-t-elle avant de conclure ?`,
            answer: '10',
            accept: ['dix'],
            mistakes: [
              { answer: '500', why: `500, c'est le nombre moyen de comparaisons d'une recherche linéaire. La dichotomie divise la zone par 2 à chaque étape.` },
              { answer: '1000', why: `C'est le pire cas d'une recherche linéaire, pas d'une dichotomie.` },
              { answer: '9', why: `2 ** 9 = 512 ne suffit pas à couvrir 1000 éléments : il faut 2 ** 10 = 1024, donc 10 étapes au pire.` }
            ],
            hint: `Combien de fois peux-tu diviser 1000 par 2 avant d'arriver à 1 ? Pense aux puissances de 2.`,
            explain: `Chaque étape divise la zone par 2 : 1000, 500, 250, 125, 62, 31, 15, 7, 3, 1. Au pire, 10 éléments sont examinés, car 2 ** 10 = 1024 ≥ 1000. Pour un milliard d'éléments, il en faudrait seulement 30.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Dans une liste **triée** de scores, écris \`premier_indice(liste, seuil)\` qui renvoie l'indice du **premier** élément supérieur ou égal à \`seuil\`, ou \`len(liste)\` s'il n'y en a aucun. Ainsi, \`len(liste) - premier_indice(liste, seuil)\` donne le nombre de scores qui atteignent le seuil. La version linéaire fournie est correcte mais trop lente : un test vérifie que ta fonction lit au plus 21 cases dans une liste d'un million d'éléments.`,
          starter: `def premier_indice(liste, seuil):
    for i in range(len(liste)):
        if liste[i] >= seuil:
            return i
    return len(liste)
`,
          solution: `def premier_indice(liste, seuil):
    debut, fin = 0, len(liste)
    while debut < fin:
        milieu = (debut + fin) // 2
        if liste[milieu] < seuil:
            debut = milieu + 1
        else:
            fin = milieu
    return debut
`,
          tests: [
            { code: `assert premier_indice([10, 20, 30, 40], 25) == 2`, label: `premier_indice([10, 20, 30, 40], 25) renvoie 2` },
            { code: `assert premier_indice([10, 20, 30, 40], 20) == 1`, label: `un élément égal au seuil compte : renvoie 1 pour le seuil 20` },
            { code: `assert premier_indice([10, 20, 30, 40], 50) == 4 and premier_indice([10, 20, 30, 40], 5) == 0`, label: `renvoie 4 si aucun élément n'atteint le seuil, 0 si tous l'atteignent` },
            { code: `assert premier_indice([5, 7, 7, 7, 9], 7) == 1`, label: `avec des doublons, renvoie le premier 7 (indice 1)` },
            { code: `class ListeEspion:
    def __init__(self, n):
        self.n = n
        self.lectures = 0
    def __len__(self):
        return self.n
    def __getitem__(self, i):
        if i >= self.n:
            raise IndexError("indice hors limites")
        self.lectures += 1
        return i * 2
espion = ListeEspion(1000000)
assert premier_indice(espion, 777777) == 388889
assert espion.lectures <= 21`, label: `un million d'éléments : bon résultat en 21 lectures au plus (O(log n))` }
          ],
          hint: `Garde cette règle à chaque tour : tout ce qui est avant debut est < seuil, tout ce qui est à partir de fin est >= seuil. Quand le milieu atteint le seuil, il peut être la réponse : ne l'exclus pas (fin = milieu).`,
          explain: `La zone [debut, fin) contient toujours la réponse. Si le milieu est trop petit, la réponse est après lui ; sinon, elle est au milieu ou avant. Quand debut == fin, la zone est réduite à la réponse. On divise par 2 à chaque tour : environ 20 lectures pour un million d'éléments, contre 388 890 pour la version linéaire.`
        },
        recap: [
          `La dichotomie ne fonctionne que sur des données triées.`,
          `Chaque étape examine le milieu et élimine la moitié de la zone restante.`,
          `Coût O(log n) : environ 20 étapes pour un million d'éléments, 30 pour un milliard.`,
          `Les bornes doivent toujours se rapprocher : debut = milieu + 1 ou fin = milieu - 1.`
        ],
        check: {
          type: 'bug',
          prompt: `95 fait bien partie des scores, mais ce programme affiche False. La fonction de recherche est pourtant correcte. Clique sur la ligne fautive.`,
          code: `def contient(liste, cible):
    debut, fin = 0, len(liste) - 1
    while debut <= fin:
        milieu = (debut + fin) // 2
        if liste[milieu] == cible:
            return True
        if liste[milieu] < cible:
            debut = milieu + 1
        else:
            fin = milieu - 1
    return False

scores = [88, 12, 95, 40, 67, 23, 71]
print(contient(scores, 95))`,
          bugLine: 13,
          why: `La dichotomie suppose une liste triée : elle écarte toute une moitié en se fiant à l'ordre. Ici, le milieu vaut 40, inférieur à 95, donc la fonction cherche à droite, alors que 95 est à gauche.`,
          fixes: [
            `scores = sorted([88, 12, 95, 40, 67, 23, 71])`,
            `scores = [88, 12, 95, 40, 67, 23, 71].sort()`,
            `scores = [88, 12, 95, 40, 67, 23, 71] * 2`
          ],
          fixAnswer: 0,
          fixWhy: {
            1: `sort() trie la liste sur place mais renvoie None : scores vaudrait None et len(None) lèverait une TypeError.`,
            2: `Dupliquer la liste ne la trie pas : la recherche reste fausse.`
          },
          output: `True`,
          hint: `Relis la condition d'usage de la dichotomie, puis regarde les données.`,
          explain: `sorted() renvoie une nouvelle liste triée : [12, 23, 40, 67, 71, 88, 95]. La dichotomie peut alors éliminer des moitiés sans risque. Si on cherche souvent, on trie une seule fois au départ.`
        }
      }
    ]
  };

  var u16 = {
    id: 'py.u16',
    title: 'Récursivité',
    summary: 'Résoudre un problème en le ramenant à une version plus petite de lui-même, sans faire exploser le nombre d\'appels.',
    lessons: [
      {
        id: 'py.u16.l1',
        title: 'Penser récursif',
        minutes: 7,
        objective: 'Tu sais écrire une fonction récursive avec un cas de base et un appel qui se rapproche de ce cas.',
        explain: `Une fonction **récursive** s'appelle elle-même sur un problème plus petit. Elle a toujours deux parties :

- le **cas de base** : un cas assez simple pour répondre directement, sans nouvel appel ;
- le **cas récursif** : on réduit le problème (n - 1, la liste sans son premier élément…) et on fait confiance à l'appel pour résoudre ce morceau.

Sans cas de base, ou si l'appel ne s'en rapproche pas, les appels s'empilent jusqu'à \`RecursionError\` : Python limite la pile à environ 1000 appels.

Chaque appel attend le résultat du suivant : les calculs se terminent **au retour**, du plus profond jusqu'au premier appel.

La récursivité est naturelle pour les structures imbriquées : dossiers qui contiennent des dossiers, JSON fait de listes de dict, arbres de décision.`,
        example: {
          code: `def somme(liste):
    if not liste:
        return 0
    return liste[0] + somme(liste[1:])

def profondeur(donnee):
    if not isinstance(donnee, list):
        return 0
    return 1 + max([profondeur(x) for x in donnee], default=0)

print(somme([4, 8, 15]))
print(profondeur([1, [2, [3, 4]], 5]))`,
          output: `27
3`,
          notes: [
            { line: 2, text: `Cas de base : la somme d'une liste vide vaut 0, sans appel récursif.` },
            { line: 4, text: `Cas récursif : le premier élément plus la somme du reste, une liste plus courte d'un élément.` },
            { line: 7, text: `Pour une structure imbriquée, le cas de base est « ce n'est pas une liste ».` },
            { line: 9, text: `Une liste ajoute un niveau à la plus grande profondeur de ses éléments.` }
          ]
        },
        exercises: [
          {
            type: 'predict',
            prompt: `Qu'affiche ce programme ?`,
            code: `def compte(n):
    if n == 0:
        print("décollage")
        return
    print("descente", n)
    compte(n - 1)
    print("retour", n)

compte(2)`,
            answer: `descente 2
descente 1
décollage
retour 1
retour 2`,
            mistakes: [
              { answer: `descente 2
descente 1
décollage
retour 2
retour 1`, why: `Le dernier appel lancé est le premier à se terminer : compte(1) affiche « retour 1 » avant que compte(2) ne reprenne.` },
              { answer: `descente 2
retour 2
descente 1
retour 1
décollage`, why: `compte(n - 1) doit se terminer entièrement avant que la ligne suivante (« retour ») s'exécute.` }
            ],
            hint: `Chaque appel est mis en pause sur la ligne compte(n - 1), et ne reprend qu'une fois cet appel terminé.`,
            explain: `Les « descente » s'affichent en allant vers le cas de base. Puis chaque appel en pause reprend dans l'ordre inverse : compte(1) d'abord, compte(2) ensuite. C'est le fonctionnement d'une pile d'appels.`
          },
          {
            type: 'bug',
            prompt: `Ce code devrait afficher 1024, mais il plante avec RecursionError. Clique sur la ligne fautive.`,
            code: `def puissance(base, exposant):
    if exposant == 0:
        return 1
    return base * puissance(base, exposant)

print(puissance(2, 10))`,
            bugLine: 4,
            why: `L'appel récursif reçoit le même exposant : il ne se rapproche jamais du cas de base exposant == 0, et les appels s'empilent jusqu'à la limite.`,
            fixes: [
              `    return base * puissance(base, exposant - 1)`,
              `    return puissance(base, exposant - 1)`,
              `    return base * puissance(base - 1, exposant)`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `La récursion se termine, mais on oublie de multiplier par base : le résultat serait 1.`,
              2: `C'est l'exposant qui doit diminuer pour atteindre le cas de base ; diminuer base ne change rien à la condition exposant == 0.`
            },
            output: `1024`,
            hint: `Quelle valeur doit changer d'un appel à l'autre pour atteindre le cas de base ?`,
            explain: `2 puissance 10 vaut 2 × (2 puissance 9). En passant exposant - 1, chaque appel se rapproche de 0, où le cas de base renvoie 1 et arrête la descente.`
          }
        ],
        challenge: {
          type: 'order',
          prompt: `Un projet est représenté par des dict imbriqués : un dossier est un dict, un fichier est sa taille en Ko. Remets dans l'ordre la fonction récursive qui calcule la taille totale.`,
          lines: [
            `def taille(element):`,
            `    if isinstance(element, dict):`,
            `        return sum(taille(sous) for sous in element.values())`,
            `    else:`,
            `        return element`,
            `print(taille({"src": {"app.py": 120, "utils.py": 80}, "README.md": 30}))`
          ],
          output: `230`,
          hint: `Un dossier contient d'autres éléments dont il faut calculer la taille ; un fichier, c'est directement un nombre.`,
          explain: `Le cas récursif traite les dossiers : la taille d'un dossier est la somme des tailles de son contenu, quel que soit le niveau d'imbrication. Le cas de base est le fichier, dont la taille est connue. Ici : 120 + 80 + 30 = 230.`
        },
        recap: [
          `Une fonction récursive s'appelle sur un problème plus petit.`,
          `Le cas de base répond sans appel ; chaque appel doit s'en rapprocher.`,
          `Les appels s'empilent puis se terminent dans l'ordre inverse.`,
          `Idéal pour les structures imbriquées : dossiers, JSON, arbres.`
        ],
        check: {
          type: 'code',
          prompt: `Une API renvoie des données imbriquées. Écris la fonction **récursive** \`aplatir(liste)\` qui renvoie une liste simple de tous les éléments, quel que soit le niveau d'imbrication, dans l'ordre.`,
          starter: `def aplatir(liste):
    resultat = []
    for x in liste:
        resultat.append(x)
    return resultat
`,
          solution: `def aplatir(liste):
    resultat = []
    for x in liste:
        if isinstance(x, list):
            resultat.extend(aplatir(x))
        else:
            resultat.append(x)
    return resultat
`,
          tests: [
            { code: `assert aplatir([1, [2, 3], 4]) == [1, 2, 3, 4]`, label: `aplatir([1, [2, 3], 4]) renvoie [1, 2, 3, 4]` },
            { code: `assert aplatir([[1, [2, [3]]], [], 4]) == [1, 2, 3, 4]`, label: `fonctionne sur plusieurs niveaux et avec des listes vides` },
            { code: `assert aplatir([]) == []`, label: `aplatir([]) renvoie []` },
            { code: `assert aplatir(["ia", ["web", ["data"]]]) == ["ia", "web", "data"]`, label: `fonctionne aussi avec des chaînes` }
          ],
          checks: [ { re: 'def\\s+aplatir[\\s\\S]*[^\\w]aplatir\\(', label: `La fonction s'appelle elle-même` } ],
          hint: `Pour chaque élément : si c'est une liste, aplatis-la d'abord (appel récursif) et ajoute tous ses éléments avec extend ; sinon, ajoute-le tel quel.`,
          explain: `Le cas de base est un élément qui n'est pas une liste : on l'ajoute. Une sous-liste est un problème plus petit du même type : aplatir(x) renvoie une liste plate, que extend ajoute élément par élément. La profondeur d'imbrication n'a pas besoin d'être connue à l'avance.`
        }
      },
      {
        id: 'py.u16.l2',
        title: 'Diviser pour régner et mémoïsation',
        minutes: 8,
        objective: 'Tu sais reconnaître une récursion efficace (tri fusion, O(n log n)) et une récursion qui recalcule tout, et corriger la seconde par mémoïsation.',
        explain: `**Diviser pour régner** : couper le problème en deux moitiés, résoudre chacune récursivement, puis combiner. Le **tri fusion** coupe la liste en deux, trie chaque moitié, puis fusionne les deux moitiés triées en un seul passage. Il y a environ log₂(n) niveaux de découpe et chaque niveau coûte n : total **O(n log n)**, comme \`sorted()\`.

À l'inverse, une récursion qui **recalcule** les mêmes sous-problèmes explose. \`fib(n) = fib(n - 1) + fib(n - 2)\` écrit naïvement fait 21 891 appels pour fib(20), et près de 30 millions pour fib(35).

La **mémoïsation** range chaque résultat dans un dict : un sous-problème déjà résolu est relu en O(1) au lieu d'être recalculé. fib(20) ne demande alors que 39 appels. Sur ton ordinateur, le décorateur \`@functools.lru_cache\` le fait automatiquement.`,
        example: {
          code: `def fusionner(a, b):
    resultat = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            resultat.append(a[i])
            i += 1
        else:
            resultat.append(b[j])
            j += 1
    return resultat + a[i:] + b[j:]

def tri_fusion(liste):
    if len(liste) <= 1:
        return liste
    milieu = len(liste) // 2
    return fusionner(tri_fusion(liste[:milieu]), tri_fusion(liste[milieu:]))

print(tri_fusion([38, 27, 43, 3, 9, 82, 10]))`,
          output: `[3, 9, 10, 27, 38, 43, 82]`,
          notes: [
            { line: 4, text: `La fusion avance dans deux listes déjà triées, en prenant toujours le plus petit des deux en tête : un seul passage, O(n).` },
            { line: 11, text: `Quand une liste est épuisée, on ajoute le reste de l'autre, déjà trié.` },
            { line: 14, text: `Cas de base : une liste de 0 ou 1 élément est déjà triée.` },
            { line: 17, text: `Diviser (deux moitiés), régner (deux appels récursifs), combiner (fusionner).` }
          ]
        },
        exercises: [
          {
            type: 'order',
            prompt: `Remets dans l'ordre la version mémoïsée de Fibonacci : elle calcule fib(50) instantanément.`,
            lines: [
              `def fib(n, memo):`,
              `    if n < 2:`,
              `        return n`,
              `    if n not in memo:`,
              `        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)`,
              `    return memo[n]`,
              `print(fib(50, {}))`
            ],
            output: `12586269025`,
            hint: `Le cas de base vient en premier. Ensuite, on ne calcule que si le résultat n'est pas déjà dans memo.`,
            explain: `Chaque valeur de n n'est calculée qu'une fois, puis relue dans memo. fib(50) demande environ 100 appels au lieu de plusieurs dizaines de milliards avec la version naïve.`
          },
          {
            type: 'logic',
            prompt: `Avec cette version naïve, combien d'appels à \`fib\` au total pour calculer \`fib(5)\`, en comptant le premier appel ?`,
            code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
            answer: '15',
            accept: ['quinze'],
            mistakes: [
              { answer: '5', why: `Ce serait vrai si chaque valeur n'était calculée qu'une fois. Ici, fib(3) est calculé 2 fois, fib(2) 3 fois, et ainsi de suite.` },
              { answer: '8', why: `8 est la valeur de fib(6), pas un nombre d'appels. Compte les nœuds de l'arbre des appels.` },
              { answer: '9', why: `9, c'est le nombre d'appels pour fib(4). Pour fib(5), ajoute le premier appel et ceux de fib(3) : 1 + 9 + 5.` }
            ],
            hint: `Note a(n) le nombre d'appels pour fib(n) : a(0) = a(1) = 1, et a(n) = 1 + a(n - 1) + a(n - 2).`,
            explain: `a(2) = 1 + 1 + 1 = 3, a(3) = 1 + 3 + 1 = 5, a(4) = 1 + 5 + 3 = 9, a(5) = 1 + 9 + 5 = 15. Ce nombre grandit presque comme fib lui-même : de façon exponentielle.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Un robot se déplace sur une grille en n'allant que vers le bas ou vers la droite. \`chemins(lignes, colonnes, memo)\` compte les chemins possibles pour faire \`lignes\` pas vers le bas et \`colonnes\` pas vers la droite. La version fournie est juste mais explose dès 15 × 15. Ajoute la **mémoïsation** avec le dict \`memo\` (clé : le tuple \`(lignes, colonnes)\`).`,
          starter: `def chemins(lignes, colonnes, memo):
    if lignes == 0 or colonnes == 0:
        return 1
    return chemins(lignes - 1, colonnes, memo) + chemins(lignes, colonnes - 1, memo)
`,
          solution: `def chemins(lignes, colonnes, memo):
    if lignes == 0 or colonnes == 0:
        return 1
    cle = (lignes, colonnes)
    if cle not in memo:
        memo[cle] = chemins(lignes - 1, colonnes, memo) + chemins(lignes, colonnes - 1, memo)
    return memo[cle]
`,
          tests: [
            { code: `assert chemins(2, 2, {}) == 6`, label: `chemins(2, 2) renvoie 6` },
            { code: `assert chemins(3, 5, {}) == 56`, label: `chemins(3, 5) renvoie 56` },
            { code: `memo = {}
chemins(4, 4, memo)
assert (4, 4) in memo`, label: `les résultats sont rangés dans memo avec la clé (lignes, colonnes)` },
            { code: `assert chemins(20, 20, {}) == 137846528820`, label: `chemins(20, 20) répond rapidement (137 846 528 820 chemins)` }
          ],
          hint: `Même schéma que fib : cas de base, puis calcul seulement si la clé n'est pas déjà dans memo, puis return memo[cle].`,
          explain: `Sans mémoïsation, le nombre d'appels est du même ordre que le résultat : plus de 100 milliards pour 20 × 20. Avec memo, chaque couple (lignes, colonnes) n'est calculé qu'une fois : 400 calculs au plus. Un tuple peut servir de clé de dict car il n'est pas modifiable.`
        },
        recap: [
          `Diviser pour régner : couper en deux, résoudre chaque moitié, combiner.`,
          `Le tri fusion fait log₂(n) niveaux de découpe à n opérations chacun : O(n log n).`,
          `Une récursion qui recalcule les mêmes sous-problèmes devient exponentielle.`,
          `Mémoïser : ranger chaque résultat dans un dict et le relire au lieu de le recalculer.`
        ],
        check: {
          type: 'qcm',
          prompt: `Laquelle de ces fonctions récursives gagne le plus à être mémoïsée ?`,
          choices: [
            `fib(n) naïve, qui appelle fib(n - 1) et fib(n - 2).`,
            `tri_fusion(liste), qui trie deux moitiés puis les fusionne.`,
            `somme(liste), qui renvoie liste[0] + somme(liste[1:]).`,
            `aplatir(liste), qui aplatit chaque sous-liste.`
          ],
          answer: 0,
          why: {
            1: `Les moitiés traitées par le tri fusion sont toutes différentes : aucun sous-problème ne revient, donc rien à relire dans un cache.`,
            2: `somme fait un seul appel par élément, chacun sur une liste différente : il n'y a aucun calcul répété.`,
            3: `Chaque sous-liste n'est aplatie qu'une fois : la mémoïsation n'apporterait rien.`
          },
          hint: `La mémoïsation n'aide que si les mêmes sous-problèmes reviennent plusieurs fois.`,
          explain: `fib(n - 1) recalcule fib(n - 2), qui est aussi calculé directement : les mêmes valeurs reviennent un nombre exponentiel de fois. La mémoïsation ramène le coût à O(n). Les trois autres fonctions ne recalculent jamais le même sous-problème.`
        }
      }
    ]
  };

  var u17 = {
    id: 'py.u17',
    title: 'Structures de données',
    summary: 'Choisir la bonne structure (pile, file, table de hachage, graphe) pour rendre un programme simple et rapide.',
    lessons: [
      {
        id: 'py.u17.l1',
        title: 'Pile et file',
        minutes: 7,
        objective: 'Tu sais choisir entre une pile (list) et une file (collections.deque) et les manipuler avec les opérations en O(1).',
        explain: `Deux structures simples organisent des éléments en attente.

**Pile** (dernier entré, premier sorti) : comme une pile d'assiettes. Une liste suffit : \`append\` empile, \`pop()\` dépile le dernier, tous deux en O(1). Usages : bouton « Annuler » d'un éditeur, retour arrière du navigateur, vérification des parenthèses, et la pile d'appels de la récursivité.

**File** (premier entré, premier sorti) : comme une file d'attente. \`liste.pop(0)\` fonctionne mais coûte O(n), car tous les éléments suivants sont décalés. Utilise \`collections.deque\` : \`append\` ajoute à droite, \`popleft()\` retire à gauche, tous deux en O(1). Usages : requêtes à traiter dans l'ordre d'arrivée, file d'impression, parcours en largeur (leçon suivante).

Une \`deque\` sait aussi ajouter devant avec \`appendleft\`, pour un élément prioritaire.`,
        example: {
          code: `from collections import deque

historique = []
for action in ["écrire A", "écrire B", "gras"]:
    historique.append(action)
print("annuler :", historique.pop())

attente = deque()
for client in ["Ada", "Linus", "Grace"]:
    attente.append(client)
print("servi :", attente.popleft())
print("en attente :", list(attente))`,
          output: `annuler : gras
servi : Ada
en attente : ['Linus', 'Grace']`,
          notes: [
            { line: 6, text: `Pile : pop() retire la dernière action, celle qu'on annule en premier.` },
            { line: 8, text: `deque() crée une file vide ; deque(["a", "b"]) en crée une déjà remplie.` },
            { line: 11, text: `File : popleft() sert le premier arrivé, en O(1).` },
            { line: 12, text: `list(attente) convertit la deque pour l'afficher comme une liste.` }
          ]
        },
        exercises: [
          {
            type: 'qcm',
            prompt: `Un serveur reçoit des millions de requêtes par heure et doit les traiter dans leur **ordre d'arrivée**. Quelle combinaison choisir ?`,
            choices: [
              `Une liste, append pour ajouter, pop() pour retirer.`,
              `Une liste, append pour ajouter, pop(0) pour retirer.`,
              `Une deque, append pour ajouter, popleft() pour retirer.`,
              `Un dict, avec le numéro de requête comme clé.`
            ],
            answer: 2,
            why: {
              0: `pop() retire le dernier élément : c'est une pile, la requête la plus récente passerait en premier.`,
              1: `L'ordre est bon, mais pop(0) décale tous les éléments restants : O(n) par retrait, ce qui devient très lent avec des millions de requêtes.`,
              3: `Un dict ne donne pas directement « la plus ancienne requête » : il faudrait chercher la plus petite clé à chaque fois.`
            },
            hint: `Il faut l'ordre « premier arrivé, premier servi », et des opérations en temps constant.`,
            explain: `Une deque est faite pour les files : ajout à droite et retrait à gauche en O(1), quelle que soit sa taille. C'est la structure standard pour une file d'attente en Python.`
          },
          {
            type: 'fill',
            prompt: `Complète ce vérificateur de parenthèses, utilisé par les éditeurs de code : chaque fermante doit correspondre à la dernière ouvrante encore ouverte.`,
            code: `def equilibre(texte):
    pile = []
    paires = {")": "(", "]": "[", "}": "{"}
    for c in texte:
        if c in "([{":
            pile.___(c)
        elif c in paires:
            if not pile or pile.___() != paires[c]:
                return False
    return len(pile) == ___

print(equilibre("f(x[0])"), equilibre("(]"), equilibre("(("))`,
            blanks: [
              { answers: ['append'], options: ['append', 'pop', 'insert'], why: { 'pop': `pop retire un élément ; ici, on doit mémoriser l'ouvrante.`, 'insert': `insert demande une position et un élément ; append empile directement au sommet.` } },
              { answers: ['pop'], options: ['pop', 'popleft', 'append'], why: { 'popleft': `popleft est une méthode de deque, pas de list (AttributeError). Et on veut la dernière ouvrante, pas la première.`, 'append': `Il faut retirer l'ouvrante correspondante, pas en ajouter une.` } },
              { answers: ['0'] }
            ],
            output: `True False False`,
            hint: `La dernière parenthèse ouverte doit être la première fermée. À la fin, il ne doit rien rester d'ouvert.`,
            explain: `Chaque ouvrante est empilée. Une fermante doit correspondre au sommet de la pile, qu'on dépile. À la fin, une pile non vide signifie des parenthèses jamais fermées, comme dans "((".`
          }
        ],
        challenge: {
          type: 'predict',
          prompt: `Qu'affiche ce programme ?`,
          code: `from collections import deque

taches = deque(["A", "B", "C"])
ordre = []
while taches:
    t = taches.popleft()
    ordre.append(t)
    if t == "A":
        taches.append("A-suite")
    if t == "B":
        taches.appendleft("urgent")
print(ordre)`,
          answer: `['A', 'B', 'urgent', 'C', 'A-suite']`,
          mistakes: [
            { answer: `['A', 'B', 'C', 'A-suite', 'urgent']`, why: `appendleft ajoute devant la file : "urgent" est traité juste après "B", avant "C".` },
            { answer: `['A', 'B', 'C', 'urgent', 'A-suite']`, why: `Après "B", la file contient ["urgent", "C", "A-suite"] : "urgent" passe avant "C".` },
            { answer: `['A', 'A-suite', 'B', 'urgent', 'C']`, why: `append ajoute en fin de file : "A-suite" attend derrière "B" et "C".` }
          ],
          hint: `Écris le contenu de la deque après chaque tour de boucle.`,
          explain: `Départ : [A, B, C]. On traite A et on ajoute A-suite à la fin : [B, C, A-suite]. On traite B et on met urgent devant : [urgent, C, A-suite]. Les trois restants sortent ensuite dans cet ordre.`
        },
        recap: [
          `Pile (dernier entré, premier sorti) : list avec append et pop().`,
          `File (premier entré, premier sorti) : deque avec append et popleft().`,
          `list.pop(0) coûte O(n) : pour une file, utilise une deque.`,
          `appendleft ajoute en tête de file, pour un élément prioritaire.`
        ],
        check: {
          type: 'code',
          prompt: `Complète la classe \`Editeur\` avec deux piles. \`annuler()\` retire le dernier mot écrit et le garde de côté ; \`retablir()\` remet le dernier mot annulé. Écrire un nouveau mot efface les mots qu'on pouvait rétablir (comme dans tous les éditeurs). Annuler ou rétablir sans rien à traiter ne fait rien.`,
          starter: `class Editeur:
    def __init__(self):
        self.mots = []
        self.annules = []

    def ecrire(self, mot):
        self.mots.append(mot)

    def annuler(self):
        # retire le dernier mot écrit et garde-le pour retablir
        pass

    def retablir(self):
        # remet le dernier mot annulé
        pass

    def texte(self):
        return " ".join(self.mots)
`,
          solution: `class Editeur:
    def __init__(self):
        self.mots = []
        self.annules = []

    def ecrire(self, mot):
        self.mots.append(mot)
        self.annules = []

    def annuler(self):
        if self.mots:
            self.annules.append(self.mots.pop())

    def retablir(self):
        if self.annules:
            self.mots.append(self.annules.pop())

    def texte(self):
        return " ".join(self.mots)
`,
          tests: [
            { code: `e = Editeur()
for m in ["Bonjour", "tout", "le monde"]:
    e.ecrire(m)
e.annuler()
assert e.texte() == "Bonjour tout"`, label: `annuler retire le dernier mot écrit` },
            { code: `e = Editeur()
for m in ["Bonjour", "tout", "le monde"]:
    e.ecrire(m)
e.annuler()
e.annuler()
e.retablir()
assert e.texte() == "Bonjour tout"`, label: `deux annulations puis un rétablissement remettent « tout »` },
            { code: `e = Editeur()
e.ecrire("a")
e.ecrire("b")
e.annuler()
e.ecrire("c")
e.retablir()
assert e.texte() == "a c"`, label: `écrire après une annulation empêche de rétablir l'ancien mot` },
            { code: `e = Editeur()
e.annuler()
e.retablir()
assert e.texte() == ""`, label: `annuler ou rétablir sur un éditeur vide ne plante pas` }
          ],
          hint: `Annuler, c'est dépiler de mots pour empiler dans annules ; rétablir fait l'inverse. Teste d'abord que la pile n'est pas vide.`,
          explain: `Les deux listes sont des piles : le dernier mot écrit est le premier annulé, et le dernier annulé est le premier rétabli. Vider annules à chaque écriture évite de rétablir un mot qui n'a plus de sens après une modification.`
        }
      },
      {
        id: 'py.u17.l2',
        title: 'Tables de hachage et graphes',
        minutes: 8,
        objective: 'Tu sais expliquer pourquoi un dict trouve une clé en O(1), représenter un graphe avec un dict et le parcourir en largeur.',
        explain: `Un **dict** est une **table de hachage** : à partir de la clé, Python calcule un nombre, son **hash**, qui indique directement la case où ranger la valeur. Retrouver une clé ne demande pas de parcourir les autres : O(1) en moyenne, contre O(n) dans une liste. Les \`set\` fonctionnent pareil. Les clés doivent donc être **non modifiables** (str, int, tuple) : si une clé changeait, son hash changerait aussi.

Un **graphe**, ce sont des sommets reliés par des arêtes : réseau social, plan de métro, pages web et leurs liens. Représentation simple : un dict qui associe à chaque sommet la liste de ses voisins.

Le **parcours en largeur** explore les sommets couche par couche (voisins directs, puis voisins des voisins) avec une **file** \`deque\`. On note les sommets déjà vus pour ne jamais les revisiter. Il donne la plus courte distance en nombre d'arêtes.`,
        example: {
          code: `from collections import deque

amis = {"Ada": ["Linus", "Grace"], "Linus": ["Ada", "Alan"],
        "Grace": ["Ada", "Alan"], "Alan": ["Linus", "Grace", "Margaret"],
        "Margaret": ["Alan"]}

def distances(graphe, depart):
    dist = {depart: 0}
    file = deque([depart])
    while file:
        sommet = file.popleft()
        for voisin in graphe[sommet]:
            if voisin not in dist:
                dist[voisin] = dist[sommet] + 1
                file.append(voisin)
    return dist

print(distances(amis, "Ada"))`,
          output: `{'Ada': 0, 'Linus': 1, 'Grace': 1, 'Alan': 2, 'Margaret': 3}`,
          notes: [
            { line: 3, text: `Le graphe : chaque personne est associée à la liste de ses amis.` },
            { line: 8, text: `dist sert à la fois de résultat et d'ensemble des sommets déjà vus.` },
            { line: 13, text: `voisin not in dist est en O(1) grâce à la table de hachage.` },
            { line: 15, text: `Les voisins découverts passent en fin de file : la couche suivante attend que la couche actuelle soit finie.` }
          ]
        },
        exercises: [
          {
            type: 'logic',
            prompt: `Une table de hachage à 8 cases utilise cette fonction de hachage (volontairement mauvaise). Combien de mots de la liste tombent dans la **même case** que "web", en comptant "web" lui-même ?`,
            code: `def case(mot):
    return len(mot) % 8

mots = ["ia", "web", "data", "api", "git", "python", "sql", "cloud"]`,
            answer: '4',
            accept: ['quatre'],
            mistakes: [
              { answer: '3', why: `N'oublie pas de compter "web" lui-même : web, api, git et sql ont tous 3 lettres.` },
              { answer: '1', why: `La case ne dépend que de la longueur du mot : tous les mots de 3 lettres partagent la case 3.` }
            ],
            hint: `La case ne dépend que du nombre de lettres. Combien de mots ont la même longueur que "web" ?`,
            explain: `web, api, git et sql ont 3 lettres : ils tombent tous dans la case 3. Ces collisions obligent à chercher parmi plusieurs mots dans la même case, et la recherche redevient lente. La vraie fonction de hachage de Python répartit les clés bien plus uniformément : c'est ce qui garantit le O(1) moyen.`
          },
          {
            type: 'order',
            prompt: `Remets dans l'ordre ce programme qui regroupe les anagrammes en une seule passe, grâce à un dict : deux anagrammes ont les mêmes lettres une fois triées.`,
            lines: [
              `groupes = {}`,
              `for mot in ["chien", "niche", "lion", "chine", "loin"]:`,
              `    cle = "".join(sorted(mot))`,
              `    if cle not in groupes:`,
              `        groupes[cle] = []`,
              `    groupes[cle].append(mot)`,
              `print(list(groupes.values()))`
            ],
            output: `[['chien', 'niche', 'chine'], ['lion', 'loin']]`,
            hint: `Calcule d'abord la clé du mot ; crée le groupe s'il n'existe pas, puis ajoute le mot dedans.`,
            explain: `Chaque mot est traité une fois, et chaque accès au dict coûte O(1) en moyenne. Comparer toutes les paires de mots serait en O(n²). Utiliser une forme « normalisée » comme clé de dict est une technique très courante.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Écris \`distance(graphe, depart, arrivee)\` qui renvoie le nombre minimal de liaisons entre deux stations du plan de métro, ou -1 si l'arrivée est inaccessible. Utilise un parcours en largeur.`,
          starter: `from collections import deque

plan = {"Gare": ["Centre", "Port"], "Centre": ["Gare", "Musée", "Parc"],
        "Port": ["Gare", "Plage"], "Musée": ["Centre"], "Parc": ["Centre", "Stade"],
        "Plage": ["Port"], "Stade": ["Parc"], "Dépôt": []}

def distance(graphe, depart, arrivee):
    # parcours en largeur depuis depart
    return -1
`,
          solution: `from collections import deque

plan = {"Gare": ["Centre", "Port"], "Centre": ["Gare", "Musée", "Parc"],
        "Port": ["Gare", "Plage"], "Musée": ["Centre"], "Parc": ["Centre", "Stade"],
        "Plage": ["Port"], "Stade": ["Parc"], "Dépôt": []}

def distance(graphe, depart, arrivee):
    dist = {depart: 0}
    file = deque([depart])
    while file:
        sommet = file.popleft()
        if sommet == arrivee:
            return dist[sommet]
        for voisin in graphe[sommet]:
            if voisin not in dist:
                dist[voisin] = dist[sommet] + 1
                file.append(voisin)
    return -1
`,
          tests: [
            { code: `assert distance(plan, "Gare", "Stade") == 3`, label: `Gare → Stade : 3 liaisons` },
            { code: `assert distance(plan, "Plage", "Musée") == 4`, label: `Plage → Musée : 4 liaisons` },
            { code: `assert distance(plan, "Gare", "Gare") == 0`, label: `une station est à 0 liaison d'elle-même` },
            { code: `assert distance(plan, "Gare", "Dépôt") == -1`, label: `le Dépôt, sans liaison, est inaccessible : -1` }
          ],
          checks: [ { re: 'popleft\\(\\)', label: `Utilise une file avec popleft()` } ],
          hint: `Reprends le schéma de l'exemple : un dict des distances, une deque. Arrête-toi dès que tu retires arrivee de la file.`,
          explain: `Le parcours en largeur découvre les stations par distance croissante : la première fois qu'on retire arrivee de la file, sa distance est forcément minimale. Si la file se vide sans l'avoir atteinte, elle est inaccessible.`
        },
        recap: [
          `Un dict ou un set est une table de hachage : recherche d'une clé en O(1) en moyenne.`,
          `Les clés doivent être non modifiables : str, int, tuple.`,
          `Un graphe se représente par un dict : sommet vers liste de voisins.`,
          `Le parcours en largeur utilise une file et un ensemble de sommets vus ; il donne les plus courtes distances.`
        ],
        check: {
          type: 'bug',
          prompt: `Dans ce réseau, D est à 2 liens de A (A, B, D), mais le programme affiche 3. Clique sur la ligne fautive.`,
          code: `from collections import deque

reseau = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "E"], "D": ["B", "E"], "E": ["C", "D", "F"], "F": ["E"]}

def distances(graphe, depart):
    dist = {depart: 0}
    file = deque([depart])
    while file:
        sommet = file.pop()
        for voisin in graphe[sommet]:
            if voisin not in dist:
                dist[voisin] = dist[sommet] + 1
                file.append(voisin)
    return dist

print(distances(reseau, "A")["D"])`,
          bugLine: 9,
          why: `pop() retire le dernier sommet ajouté : la deque se comporte comme une pile, et le parcours part en profondeur (A, C, E, puis D par E). D reçoit alors la distance 3 avant d'avoir été atteint par B.`,
          fixes: [
            `        sommet = file.popleft()`,
            `        sommet = file.pop(0)`,
            `        sommet = file[0]`
          ],
          fixAnswer: 0,
          fixWhy: {
            1: `La méthode pop d'une deque n'accepte pas d'argument : pop(0) lève une TypeError.`,
            2: `file[0] lit le premier sommet sans le retirer : la boucle tournerait indéfiniment.`
          },
          output: `2`,
          hint: `Un parcours en largeur traite les sommets dans leur ordre de découverte. Quelle structure, et quelle opération, garantissent cet ordre ?`,
          explain: `Avec popleft(), la deque est une vraie file : on traite toute la couche à distance 1 (B, C) avant la couche à distance 2. D est découvert depuis B avec la distance 2, qui est bien la plus courte.`
        }
      }
    ]
  };

  CQ.addChapter('py', {
    id: 'py.c5',
    title: 'Algorithmique',
    units: [u15, u16, u17]
  });
})();
