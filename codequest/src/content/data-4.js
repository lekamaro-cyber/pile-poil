// CodeQuest — parcours « Data science et IA » (data), chapitre 4 « Machine learning » : data.u11 à data.u14.
// Les algorithmes sont codés en Python pur ; scikit-learn est présenté en run: false.
(function () {
  var units = [];

  // ---------- data.u11 Machine learning ----------
  units.push({
    id: 'data.u11',
    title: 'Machine learning',
    summary: "Comprendre l'apprentissage supervisé, puis coder les k plus proches voisins et découvrir scikit-learn.",
    lessons: [{
      id: 'data.u11.l1',
      title: "Apprendre à partir d'exemples",
      minutes: 7,
      objective: "Tu sais distinguer caractéristiques, étiquette, entraînement et prédiction, et reconnaître un problème de classification ou de régression.",
      explain: "En **apprentissage supervisé**, on donne au programme des exemples déjà résolus : pour chaque observation, des **caractéristiques** (X : taille, poids, mots d'un mail) et la bonne réponse, l'**étiquette** (y : espèce, spam ou non, prix).\n\n" +
        "- **entraînement** : le modèle ajuste ses paramètres pour que ses réponses collent aux exemples ;\n" +
        "- **prédiction** : on applique le modèle entraîné à de nouvelles observations, sans étiquette.\n\n" +
        "Si l'étiquette est une catégorie, c'est une **classification** (spam ou non, chiffre de 0 à 9) ; si c'est une quantité, une **régression** (un prix, une température). Sans étiquette, on parle d'apprentissage non supervisé, par exemple pour regrouper des clients qui se ressemblent.\n\n" +
        "Si ton projet d'IA reconnaissait des images ou classait des textes, c'était de la classification supervisée. Le modèle le plus simple possible : un seuil appris à partir des exemples.",
      example: {
        code: `exemples = [(4.2, "A"), (4.8, "A"), (5.1, "A"), (6.3, "B"), (6.9, "B"), (7.4, "B")]

def moyenne_classe(donnees, classe):
    xs = [x for x, y in donnees if y == classe]
    return sum(xs) / len(xs)

# Entraînement : le seuil est le milieu entre les deux moyennes
seuil = (moyenne_classe(exemples, "A") + moyenne_classe(exemples, "B")) / 2

def predire(x):
    return "A" if x < seuil else "B"

print(round(seuil, 2))
print(predire(5.5), predire(6.0))`,
        output: `5.78
A B`,
        notes: [
          { line: 1, text: "Chaque exemple est un couple (caractéristique x, étiquette y) : une taille et une espèce." },
          { line: 8, text: "L'entraînement calcule le seul paramètre du modèle : le seuil, à partir des exemples." },
          { line: 10, text: "La prédiction applique le seuil appris à une nouvelle valeur, dont on ne connaît pas l'étiquette." },
          { line: 14, text: "5.5 est sous le seuil (classe A), 6.0 au-dessus (classe B)." }
        ]
      },
      exercises: [
        {
          type: 'logic',
          prompt: "Combien de ces problèmes sont des **régressions** ?\n\n" +
            "- prédire le prix de vente d'un appartement ;\n" +
            "- dire si un mail est un spam ;\n" +
            "- prévoir la température de demain à midi ;\n" +
            "- reconnaître un chiffre manuscrit de 0 à 9 ;\n" +
            "- estimer le nombre de visiteurs d'un site demain.",
          answer: '3',
          accept: ['trois'],
          mistakes: [
            { answer: '4', why: "Le chiffre manuscrit est une classification : 0 à 9 sont ici dix catégories (des symboles), pas des quantités. Prédire 4,5 n'aurait aucun sens." },
            { answer: '2', why: "Le nombre de visiteurs est une quantité : on peut se tromper d'un peu ou de beaucoup, c'est une régression." }
          ],
          hint: "Pour chaque problème, demande-toi si une réponse « entre deux » (comme 4,5) aurait un sens.",
          explain: "Prix, température et nombre de visiteurs sont des quantités : 3 régressions. Spam et chiffre manuscrit sont des catégories : 2 classifications. Le piège : des catégories peuvent s'écrire avec des chiffres."
        },
        {
          type: 'fill',
          prompt: "Chaque observation contient la taille, le poids et l'espèce. Complète pour séparer les caractéristiques `X` de l'étiquette `y`.",
          code: `donnees = [(4.2, 1.1, "A"), (6.3, 2.0, "B"), (5.0, 1.4, "A")]
X = [___ for taille, poids, espece in donnees]
y = [___ for taille, poids, espece in donnees]
print(X)
print(y)`,
          blanks: [
            { answers: ['(taille, poids)', '(taille,poids)', '[taille, poids]', '[taille,poids]'], options: ['(taille, poids)', 'espece', 'taille'],
              why: { 'espece': "`espece` est l'étiquette : c'est ce que le modèle doit prédire, elle ne fait pas partie des caractéristiques.", 'taille': "Il manque le poids : X contient toutes les caractéristiques de chaque observation." } },
            { answers: ['espece'], options: ['espece', '(taille, poids)', 'donnees'],
              why: { '(taille, poids)': "Ce sont les caractéristiques : y contient seulement la réponse attendue.", 'donnees': "`donnees` est la liste entière ; y doit contenir une étiquette par observation." } }
          ],
          output: `[(4.2, 1.1), (6.3, 2.0), (5.0, 1.4)]
['A', 'B', 'A']`,
          hint: "X regroupe ce qu'on mesure ; y est ce qu'on veut prédire.",
          explain: "X contient un tuple de caractéristiques par observation, y l'étiquette correspondante, dans le même ordre. C'est le format attendu par scikit-learn : `modele.fit(X, y)`."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "« Apprendre », c'est souvent chercher le paramètre qui fait le moins d'erreurs sur les exemples. On classe avec la règle : `1` si `x >= seuil`, sinon `0`.\n\n" +
          "Écris `meilleur_seuil(exemples, candidats)` : `exemples` est une liste de couples `(x, etiquette)` avec des étiquettes 0 ou 1, `candidats` une liste de seuils possibles. Renvoie le candidat qui classe correctement le plus d'exemples ; en cas d'égalité, le premier de la liste.",
        starter: `def meilleur_seuil(exemples, candidats):
    # ton code ici
    return candidats[0]
`,
        solution: `def meilleur_seuil(exemples, candidats):
    meilleur = candidats[0]
    meilleur_score = -1
    for s in candidats:
        score = sum(1 for x, y in exemples if (1 if x >= s else 0) == y)
        if score > meilleur_score:
            meilleur = s
            meilleur_score = score
    return meilleur
`,
        tests: [
          { code: `ex = [(1, 0), (2, 0), (3, 1), (4, 1)]
assert meilleur_seuil(ex, [1.5, 2.5, 3.5]) == 2.5`, label: "le seuil 2.5 classe parfaitement les 4 exemples" },
          { code: `ex = [(1, 0), (2, 1), (3, 0), (4, 1), (5, 1)]
assert meilleur_seuil(ex, [0, 1.5, 3.5, 6]) == 1.5`, label: "en cas d'égalité, le premier candidat est gardé" },
          { code: `assert meilleur_seuil([(5, 1), (6, 1)], [7, 5]) == 5`, label: "meilleur_seuil([(5, 1), (6, 1)], [7, 5]) renvoie 5" }
        ],
        hint: "Pour chaque seuil candidat, compte les exemples bien classés, et ne garde le seuil que si son score est strictement meilleur.",
        explain: "On essaie chaque seuil, on mesure son score sur les exemples et on garde le meilleur : c'est un entraînement par recherche exhaustive. Les vrais modèles ont des millions de paramètres : impossible de tout essayer, d'où des méthodes plus malignes comme la descente de gradient (unité 15)."
      },
      recap: [
        "Caractéristiques X : ce qu'on mesure ; étiquette y : ce qu'on veut prédire.",
        "Entraîner : ajuster les paramètres sur des exemples étiquetés ; prédire : appliquer le modèle à de nouvelles données.",
        "Classification : une catégorie ; régression : une quantité.",
        "Apprendre, c'est chercher les paramètres qui font le moins d'erreurs sur les exemples."
      ],
      check: {
        type: 'qcm',
        prompt: "Un modèle apprend sur 10 000 photos étiquetées « chat » ou « chien », puis on lui montre une nouvelle photo. Quelle phrase est exacte ?",
        choices: [
          "Les étiquettes sont les photos, et les caractéristiques sont les mots « chat » et « chien ».",
          "C'est une régression, car le modèle renvoie une probabilité entre 0 et 1.",
          "L'entraînement ajuste le modèle sur les photos étiquetées ; la prédiction l'applique à une photo sans étiquette.",
          "Pendant la prédiction, le modèle continue d'apprendre à partir de la nouvelle photo."
        ],
        answer: 2,
        why: {
          0: "C'est l'inverse : les pixels de la photo sont les caractéristiques, « chat » ou « chien » est l'étiquette.",
          1: "La probabilité est un intermédiaire : la réponse finale est une catégorie, c'est donc une classification.",
          3: "En général, un modèle ne change plus pendant la prédiction : il n'apprend que si on le réentraîne, avec des exemples étiquetés."
        },
        hint: "Repère ce qui est connu pendant l'entraînement, et ce qui ne l'est pas pendant la prédiction.",
        explain: "L'entraînement utilise des couples (caractéristiques, étiquette) ; la prédiction ne reçoit que des caractéristiques et renvoie une étiquette. C'est une classification, car la réponse est une catégorie, même si le modèle calcule une probabilité en chemin."
      }
    }, {
      id: 'data.u11.l2',
      title: 'Les k plus proches voisins',
      minutes: 8,
      objective: "Tu sais coder l'algorithme des k plus proches voisins en Python pur et lire son équivalent scikit-learn.",
      explain: "L'algorithme des **k plus proches voisins** (kNN) classe un nouveau point d'après les exemples qui lui ressemblent le plus :\n\n" +
        "- calculer la distance entre le nouveau point et chaque exemple (distance euclidienne : racine de la somme des carrés des différences) ;\n" +
        "- garder les k exemples les plus proches ;\n" +
        "- renvoyer l'étiquette majoritaire parmi eux.\n\n" +
        "Il n'y a pas vraiment d'entraînement : le modèle garde les exemples en mémoire. On choisit k impair pour éviter les égalités entre deux classes. Attention aux échelles : une caractéristique en euros (des milliers) écrase une caractéristique en années (des dizaines) dans la distance, d'où la normalisation vue à l'unité 1.\n\n" +
        "Dans scikit-learn : `KNeighborsClassifier(n_neighbors=3)`, puis `fit(X, y)` et `predict(...)`. Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install scikit-learn`).",
      example: {
        code: `import math
from collections import Counter

X = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 7], [6, 7]]
y = ["rouge", "rouge", "rouge", "bleu", "bleu", "bleu"]

def distance(a, b):
    return math.sqrt(sum((p - q) ** 2 for p, q in zip(a, b)))

def knn(point, k):
    voisins = sorted(zip(X, y), key=lambda e: distance(point, e[0]))[:k]
    votes = Counter(etiquette for _, etiquette in voisins)
    return votes.most_common(1)[0][0]

print(knn([2, 2], 3), knn([5, 6], 3))`,
        output: `rouge bleu`,
        notes: [
          { line: 8, text: "Distance euclidienne : racine de la somme des carrés des différences, pour n'importe quel nombre de caractéristiques." },
          { line: 11, text: "On trie les couples (point, étiquette) par distance au nouveau point, puis on garde les k premiers." },
          { line: 12, text: "`Counter` compte les votes de chaque étiquette." },
          { line: 13, text: "`most_common(1)` renvoie `[(étiquette, nombre)]` : on prend l'étiquette gagnante." }
        ]
      },
      exercises: [
        {
          type: 'predict',
          prompt: "Qu'affiche ce programme ?",
          code: `exemples = [(1.0, "A"), (2.0, "A"), (4.0, "B"), (5.0, "B"), (9.0, "B")]
point = 3.2
tries = sorted(exemples, key=lambda e: abs(e[0] - point))
print(tries[0])
print([e[1] for e in tries[:3]])`,
          answer: `(4.0, 'B')
['B', 'A', 'B']`,
          mistakes: [
            { answer: `(2.0, 'A')
['A', 'B', 'B']`, why: "Le point 3.2 est plus près de 4.0 (écart 0.8) que de 2.0 (écart 1.2)." },
            { answer: `(1.0, 'A')
['A', 'A', 'B']`, why: "`sorted` trie ici par distance au point (la clé `abs(e[0] - point)`), pas par valeur de x." }
          ],
          hint: "Calcule l'écart entre 3.2 et chaque x, puis range les exemples du plus petit écart au plus grand.",
          explain: "La clé de tri est la distance au point. Le plus proche est 4.0 (B), puis 2.0 (A), puis 5.0 (B). Avec k = 3, le vote donne B deux fois contre une : le point est classé B."
        },
        {
          type: 'order',
          run: false,
          prompt: "Remets dans l'ordre ce programme scikit-learn : import, données, création du modèle, entraînement, prédiction. (À essayer sur ton ordinateur : `pip install scikit-learn`.)",
          lines: [
            `from sklearn.neighbors import KNeighborsClassifier`,
            `X = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 7], [6, 7]]`,
            `y = ["rouge" if a + b < 8 else "bleu" for a, b in X]`,
            `modele = KNeighborsClassifier(n_neighbors=3)`,
            `modele.fit(X, y)`,
            `print(modele.predict([[2, 2], [5, 6]]))`
          ],
          output: `['rouge' 'bleu']`,
          hint: "`y` est calculé à partir de `X`, et on ne peut prédire qu'avec un modèle entraîné.",
          explain: "On importe la classe, on prépare X et y, on crée le modèle avec k = 3, `fit` mémorise les exemples, puis `predict` classe deux nouveaux points. scikit-learn renvoie un tableau NumPy, affiché sans virgule : `['rouge' 'bleu']`. C'est l'algorithme de l'exemple, en quelques lignes."
        }
      ],
      challenge: {
        type: 'bug',
        run: false,
        prompt: "Ce code devrait classer le point [2, 2], mais il lève une `ValueError`. Clique sur la ligne fautive.",
        code: `from sklearn.neighbors import KNeighborsClassifier

X = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 7], [6, 7]]
y = ["rouge", "rouge", "rouge", "bleu", "bleu", "bleu"]
modele = KNeighborsClassifier(n_neighbors=3)
modele.fit(X, y)
print(modele.predict([2, 2]))`,
        bugLine: 7,
        why: "`predict` attend une **liste de points** (un tableau à 2 dimensions), même pour un seul point. `[2, 2]` est lu comme une seule dimension, d'où l'erreur `ValueError: Expected 2D array, got 1D array instead`.",
        fixes: [
          `print(modele.predict([[2, 2]]))`,
          `print(modele.predict(2, 2))`,
          `print(modele.predict(X))`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "`predict` attend un seul argument : la liste des points à classer.",
          2: "Le code tournerait, mais il reclasserait les 6 exemples d'entraînement au lieu du nouveau point [2, 2]."
        },
        output: `['rouge']`,
        hint: "Regarde la forme de X : une liste de points, chaque point étant lui-même une liste. Que reçoit `predict` ?",
        explain: "`[[2, 2]]` est une liste qui contient un seul point : sa forme (1, 2) correspond à celle de X (6, 2). C'est l'erreur la plus fréquente avec scikit-learn, et le message `Expected 2D array` la signale à chaque fois."
      },
      recap: [
        "kNN : distances, k plus proches exemples, vote majoritaire.",
        "Il n'y a pas d'entraînement : le modèle garde les exemples en mémoire.",
        "Choisis k impair, et mets les caractéristiques à la même échelle.",
        "scikit-learn : `KNeighborsClassifier(n_neighbors=k)`, `fit(X, y)`, puis `predict` avec une liste de points."
      ],
      check: {
        type: 'code',
        prompt: "Écris `knn(point, X, y, k)` qui renvoie l'étiquette majoritaire parmi les `k` exemples de `X` les plus proches de `point` (distance euclidienne). `X` est une liste de points (des listes de nombres) et `y` la liste des étiquettes correspondantes. Les tests utilisent un `k` impair et deux classes : il n'y a jamais d'égalité de votes.",
        starter: `import math

def knn(point, X, y, k):
    # ton code ici
    return y[0]
`,
        solution: `import math

def distance(a, b):
    return math.sqrt(sum((p - q) ** 2 for p, q in zip(a, b)))

def knn(point, X, y, k):
    paires = sorted(zip(X, y), key=lambda e: distance(point, e[0]))
    votes = {}
    for _, etiquette in paires[:k]:
        votes[etiquette] = votes.get(etiquette, 0) + 1
    return max(votes, key=lambda e: votes[e])
`,
        tests: [
          { code: `X = [[1, 1], [1, 2], [2, 1], [6, 5], [7, 7], [6, 7]]
y = ['rouge', 'rouge', 'rouge', 'bleu', 'bleu', 'bleu']
assert knn([2, 2], X, y, 3) == 'rouge' and knn([6, 6], X, y, 3) == 'bleu'`, label: "[2, 2] est rouge et [6, 6] est bleu avec k = 3" },
          { code: `X = [[0], [1], [2], [10]]
y = ['a', 'a', 'b', 'b']
assert knn([1.8], X, y, 1) == 'b' and knn([1.8], X, y, 3) == 'a'`, label: "k change la réponse : 1 voisin donne b, 3 voisins donnent a" },
          { code: `X = [[0, 0], [10, 10], [10, 11]]
y = ['x', 'y', 'y']
assert knn([9, 9], X, y, 3) == 'y'`, label: "avec k = 3, la majorité l'emporte" }
        ],
        hint: "Trie les couples `(point, étiquette)` par distance, garde les `k` premiers, puis compte les étiquettes dans un dictionnaire.",
        explain: "Trier par distance puis garder les k premiers donne les voisins ; un dictionnaire compte les votes et `max` avec une clé renvoie l'étiquette la plus fréquente. Le deuxième test montre l'influence de k : un seul voisin suit le point le plus proche, trois voisins lissent la décision."
      }
    }]
  });

  // ---------- data.u12 Séparation entraînement et test ----------
  units.push({
    id: 'data.u12',
    title: 'Séparation entraînement et test',
    summary: "Séparer les données en entraînement et test pour mesurer honnêtement un modèle, sans fuite d'information.",
    lessons: [{
      id: 'data.u12.l1',
      title: 'Garder des données pour le test',
      minutes: 7,
      objective: "Tu sais séparer un jeu de données en entraînement et test, et expliquer pourquoi on n'évalue jamais un modèle sur ses données d'entraînement.",
      explain: "Évaluer un modèle sur ses données d'entraînement, c'est donner à un examen les exercices déjà corrigés : un kNN avec k = 1 y obtient 100 %, sans rien prouver. On réserve donc une partie des données, souvent 20 à 30 %, comme **jeu de test** : le modèle ne la voit jamais pendant l'entraînement.\n\n" +
        "- **mélanger** avant de couper, car les fichiers sont souvent triés (par date, par classe) ;\n" +
        "- fixer une **graine** (`random_state`) pour que la séparation soit reproductible ;\n" +
        "- éviter les **fuites** : aucune information du test ne doit servir à l'entraînement. Par exemple une normalisation calculée sur toutes les données, ou le même client présent des deux côtés ;\n" +
        "- pour des données dans le temps, entraîner sur le passé et tester sur le futur.\n\n" +
        "Dans scikit-learn : `train_test_split(X, y, test_size=0.2, random_state=42)`. Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install scikit-learn`).",
      example: {
        code: `import random

def separer(donnees, part_test):
    copie = donnees[:]
    random.shuffle(copie)
    n_test = int(len(copie) * part_test)
    return copie[n_test:], copie[:n_test]

donnees = list(range(1, 11))
entrainement, test = separer(donnees, 0.2)
print(len(entrainement), len(test))
print(sorted(entrainement + test) == donnees)
print(set(entrainement) & set(test))`,
        output: `8 2
True
set()`,
        notes: [
          { line: 4, text: "On mélange une copie, pour ne pas modifier la liste d'origine." },
          { line: 5, text: "`random.shuffle` mélange sur place : le contenu des deux parts change à chaque exécution, pas leur taille." },
          { line: 12, text: "Aucune donnée n'est perdue : les deux parts réunies redonnent la liste d'origine." },
          { line: 13, text: "L'intersection est vide : aucun exemple n'est à la fois dans l'entraînement et dans le test." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Ton fichier contient 500 photos de chats suivies de 500 photos de chiens, dans cet ordre. Tu prends les 200 dernières lignes comme jeu de test, sans mélanger. Quel est le problème ?",
          choices: [
            "Aucun : 200 sur 1 000, c'est bien 20 %.",
            "Le test ne contient que des chiens, et l'entraînement a moins de chiens que de chats (300 contre 500) : la mesure ne représente pas le vrai problème.",
            "Le jeu de test est trop grand : il faut 5 % au maximum.",
            "Il faudrait plutôt prendre les 200 premières lignes."
          ],
          answer: 1,
          why: {
            0: "La proportion est bonne, mais pas le contenu : le fichier est trié par classe.",
            2: "20 % est une proportion courante ; le vrai problème est l'ordre du fichier.",
            3: "Les 200 premières lignes ne contiendraient que des chats : même problème, dans l'autre sens."
          },
          hint: "Regarde quelles photos se trouvent dans les 200 dernières lignes.",
          explain: "Un fichier trié par classe donne un test d'une seule classe. Il faut mélanger avant de couper, et vérifier que chaque classe garde à peu près la même proportion des deux côtés (l'option `stratify=y` de scikit-learn s'en charge)."
        },
        {
          type: 'code',
          prompt: "Pour des données dans le temps, on entraîne sur le passé et on teste sur le futur. Écris `separer_par_date(lignes, date_limite)` : chaque ligne est un dictionnaire avec une clé `'date'` au format `'AAAA-MM-JJ'`. Renvoie le couple `(entrainement, test)` : les lignes strictement antérieures à `date_limite` vont dans l'entraînement, les autres dans le test, en gardant leur ordre.",
          starter: `def separer_par_date(lignes, date_limite):
    # ton code ici
    return lignes, []
`,
          solution: `def separer_par_date(lignes, date_limite):
    entrainement = [l for l in lignes if l["date"] < date_limite]
    test = [l for l in lignes if l["date"] >= date_limite]
    return entrainement, test
`,
          tests: [
            { code: `lignes = [{'date': '2024-01-05', 'v': 1}, {'date': '2024-03-10', 'v': 2}, {'date': '2024-02-20', 'v': 3}]
ent, tst = separer_par_date(lignes, '2024-02-01')
assert [l['v'] for l in ent] == [1] and [l['v'] for l in tst] == [2, 3]`, label: "coupe au 1er février 2024 en gardant l'ordre" },
            { code: `lignes = [{'date': '2023-12-31'}, {'date': '2024-01-01'}]
ent, tst = separer_par_date(lignes, '2024-01-01')
assert len(ent) == 1 and tst == [{'date': '2024-01-01'}]`, label: "une ligne datée du jour limite va dans le test" },
            { code: `ent, tst = separer_par_date([], '2024-01-01')
assert ent == [] and tst == []`, label: "aucune ligne donne deux listes vides" }
          ],
          hint: "Au format AAAA-MM-JJ, comparer deux dates comme des textes donne le bon ordre chronologique.",
          explain: "L'ordre alphabétique des dates au format AAAA-MM-JJ est aussi l'ordre chronologique, d'où la comparaison directe. Couper par date évite une fuite subtile : sinon, le modèle apprendrait à partir de jours postérieurs à ceux qu'il doit prévoir."
        }
      ],
      challenge: {
        type: 'bug',
        prompt: "On veut normaliser les données d'entraînement en les divisant par leur maximum, sans utiliser le jeu de test (la valeur 100). Le programme devrait afficher `[0.25, 0.5, 0.75, 1.0]`. Clique sur la ligne fautive.",
        code: `valeurs = [2, 4, 6, 8, 100]
entrainement, test = valeurs[:4], valeurs[4:]
maxi = max(valeurs)
entrainement_norm = [v / maxi for v in entrainement]
test_norm = [v / maxi for v in test]
print(entrainement_norm)`,
        bugLine: 3,
        why: "Le maximum est calculé sur toutes les valeurs, y compris le test (100). Une information du jeu de test s'infiltre dans la préparation de l'entraînement : c'est une **fuite de données**, qui rend le score mesuré sur le test trop optimiste.",
        fixes: [
          `maxi = max(entrainement)`,
          `maxi = max(test)`,
          `maxi = max(valeurs) / 2`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "On normaliserait avec le seul jeu de test : c'est la fuite maximale.",
          2: "Le maximum vient toujours de toutes les données, test compris : la fuite reste."
        },
        output: `[0.25, 0.5, 0.75, 1.0]`,
        hint: "Quelles données ont le droit de servir à calculer les paramètres de la normalisation ?",
        explain: "Les paramètres de préparation (maximum, moyenne, écart-type) se calculent sur l'entraînement seul, puis s'appliquent tels quels au test. Ici, la valeur de test devient 100 / 8 = 12.5, au-delà de 1 : c'est normal, et c'est ce qui arrivera avec de vraies données nouvelles."
      },
      recap: [
        "Ne jamais évaluer un modèle sur ses données d'entraînement : le score serait trop optimiste.",
        "Mélanger avant de couper, avec une graine pour pouvoir reproduire la séparation.",
        "Préparation (normalisation…) : paramètres calculés sur l'entraînement seul, sinon fuite de données.",
        "Données dans le temps : entraîner sur le passé, tester sur le futur.",
        "`train_test_split` renvoie `X_train, X_test, y_train, y_test`, dans cet ordre."
      ],
      check: {
        type: 'fill',
        run: false,
        prompt: "Complète pour séparer `X` et `y` en réservant 30 % des données au test. (À essayer sur ton ordinateur : `pip install scikit-learn`.)",
        code: `from sklearn.model_selection import train_test_split

X = [[i] for i in range(10)]
y = [i % 2 for i in range(10)]
___ = train_test_split(X, y, test_size=___, random_state=0)
print(len(X_train), len(X_test), len(y_test))`,
        blanks: [
          { answers: ['X_train, X_test, y_train, y_test'], options: ['X_train, X_test, y_train, y_test', 'X_train, y_train, X_test, y_test', 'train, test'],
            why: { 'X_train, y_train, X_test, y_test': "`train_test_split` coupe chaque argument en deux, dans l'ordre : d'abord X (entraînement, test), puis y. Avec cet ordre, `y_train` contiendrait en réalité le X de test.", 'train, test': "La fonction renvoie quatre morceaux (deux pour X, deux pour y) : on ne peut pas les ranger dans deux variables." } },
          { answers: ['0.3', '.3'],
            why: { '30': "`test_size=30` demanderait 30 lignes de test, alors qu'il n'y en a que 10 : erreur.", '3': "Un entier est compris comme un nombre de lignes : cela donne bien 3 lignes ici, mais la consigne demande une proportion, qui reste juste quelle que soit la taille des données." } }
        ],
        output: `7 3 3`,
        hint: "La fonction coupe chacun de ses arguments en deux, dans l'ordre où tu les lui donnes. La taille du test est une proportion entre 0 et 1.",
        explain: "`train_test_split` mélange (avec la graine `random_state=0`, donc toujours de la même façon), puis coupe X et y aux mêmes positions : 7 lignes d'entraînement, 3 de test. L'ordre `X_train, X_test, y_train, y_test` est une source d'erreurs fréquente : relis-le à chaque fois."
      }
    }]
  });

  // ---------- data.u13 Surapprentissage et généralisation ----------
  units.push({
    id: 'data.u13',
    title: 'Surapprentissage et généralisation',
    summary: "Distinguer un modèle qui apprend par cœur d'un modèle qui généralise, en comparant ses scores.",
    lessons: [{
      id: 'data.u13.l1',
      title: 'Apprendre par cœur ou généraliser',
      minutes: 7,
      objective: "Tu sais repérer le surapprentissage en comparant les scores d'entraînement et de test, et choisir un modèle qui généralise.",
      explain: "Un modèle **généralise** s'il fonctionne sur des données qu'il n'a jamais vues. Deux échecs possibles :\n\n" +
        "- **surapprentissage** : le modèle colle aux détails et au bruit des exemples (erreurs d'étiquetage, cas exceptionnels). Excellent en entraînement, nettement moins bon en test ;\n" +
        "- **sous-apprentissage** : le modèle est trop simple pour la tâche. Mauvais partout.\n\n" +
        "Le signe à surveiller est l'**écart** entre le score d'entraînement et le score de test. Avec kNN, k = 1 apprend par cœur (100 % en entraînement) ; un k très grand finit par prédire toujours la classe majoritaire.\n\n" +
        "Remèdes au surapprentissage : plus de données, un modèle plus simple, de la régularisation, et le choix des réglages (comme k) sur un jeu de **validation** distinct du test. Si ton projet d'IA affichait 99 % à l'entraînement et 70 % en test, c'était ce phénomène.",
      example: {
        code: `train = [(1, "A"), (2, "A"), (3, "B"), (4, "A"), (5, "B"), (6, "B")]
test = [(2.8, "A"), (3.4, "A"), (4.2, "B"), (4.6, "B")]

def par_coeur(x):
    return min(train, key=lambda e: abs(e[0] - x))[1]

def simple(x):
    return "A" if x < 3.5 else "B"

def exactitude(modele, donnees):
    return round(sum(modele(x) == y for x, y in donnees) / len(donnees), 2)

for modele in (par_coeur, simple):
    print(exactitude(modele, train), exactitude(modele, test))`,
        output: `1.0 0.25
0.67 1.0`,
        notes: [
          { line: 1, text: "(3, 'B') et (4, 'A') sont du bruit : des exemples mal étiquetés ou exceptionnels." },
          { line: 5, text: "Un seul plus proche voisin : le modèle répète l'étiquette de l'exemple le plus proche, bruit compris." },
          { line: 8, text: "Une seule règle, plus simple : elle se trompe sur les 2 exemples bruités." },
          { line: 14, text: "Par cœur : 100 % en entraînement, 25 % en test. Simple : 67 %, puis 100 %. L'exemple est fabriqué pour être net ; en vrai, l'écart est rarement aussi spectaculaire." }
        ]
      },
      exercises: [
        {
          type: 'logic',
          prompt: "Tu règles un kNN. Voici l'exactitude sur l'entraînement et sur un jeu de **validation**, selon k :\n\n" +
            "- k = 1 : entraînement 1.00, validation 0.71\n" +
            "- k = 5 : entraînement 0.90, validation 0.86\n" +
            "- k = 15 : entraînement 0.80, validation 0.79\n" +
            "- k = 51 : entraînement 0.62, validation 0.60\n\n" +
            "Quelle valeur de k choisis-tu ?",
          answer: '5',
          accept: ['k = 5', 'k=5', 'cinq'],
          mistakes: [
            { answer: '1', why: "100 % en entraînement mais 71 % en validation : k = 1 apprend par cœur, c'est du surapprentissage." },
            { answer: '51', why: "Mauvais partout : k = 51 est trop simple, c'est du sous-apprentissage." },
            { answer: '15', why: "L'écart entre les deux scores est petit, mais le score de validation (0.79) est plus bas qu'avec k = 5 : un petit écart ne suffit pas, il faut aussi un bon score." }
          ],
          hint: "Le critère est le score sur des données que le modèle n'a pas vues pendant l'entraînement.",
          explain: "On choisit le réglage qui donne le meilleur score de validation : k = 5 (0.86). Le jeu de test, lui, reste de côté jusqu'à la toute fin, pour mesurer une seule fois le modèle choisi."
        },
        {
          type: 'qcm',
          prompt: "Ton modèle obtient 99 % d'exactitude sur l'entraînement et 62 % sur le test. Quel est le diagnostic le plus probable ?",
          choices: [
            "Surapprentissage : le modèle a appris les exemples par cœur.",
            "Sous-apprentissage : le modèle est trop simple.",
            "Fuite de données entre l'entraînement et le test.",
            "Le modèle est excellent : 99 %, c'est presque parfait."
          ],
          answer: 0,
          why: {
            1: "Un modèle trop simple serait mauvais aussi en entraînement ; ici, il y est presque parfait.",
            2: "Une fuite donnerait au contraire un score de test trop beau, pas un score de test faible.",
            3: "Seul le score de test dit ce qui se passera avec de nouvelles données : 62 %."
          },
          hint: "Compare les deux scores : lequel dit ce qui se passera avec de nouvelles données ?",
          explain: "Un grand écart entre entraînement (99 %) et test (62 %) est la signature du surapprentissage. Pistes : plus de données, un modèle plus simple (un k plus grand pour un kNN), de la régularisation."
        }
      ],
      challenge: {
        type: 'predict',
        prompt: "Les exemples (3, 'B') et (4, 'A') sont du bruit. Qu'affiche ce programme ?",
        code: `train = [(1, "A"), (2, "A"), (3, "B"), (4, "A"), (5, "B"), (6, "B")]

def knn(x, k):
    voisins = sorted(train, key=lambda e: abs(e[0] - x))[:k]
    etiquettes = [y for _, y in voisins]
    return max(sorted(set(etiquettes)), key=lambda e: etiquettes.count(e))

print(knn(3.2, 1), knn(3.2, 3))
print(knn(4.4, 1), knn(4.4, 5))`,
        answer: `B A
A B`,
        mistakes: [
          { answer: `B B
A A`, why: "Avec k = 3 autour de 3.2, les voisins sont 3 (B), 4 (A) et 2 (A) : A l'emporte 2 contre 1. Avec k = 5 autour de 4.4, B l'emporte 3 contre 2." },
          { answer: `A A
B B`, why: "Avec k = 1, seul le voisin le plus proche compte : pour 3.2, c'est 3, étiqueté B ; pour 4.4, c'est 4, étiqueté A." }
        ],
        hint: "Pour chaque appel, range les exemples par distance au point, puis fais voter les k premiers.",
        explain: "Avec k = 1, le modèle suit l'exemple le plus proche, même bruité : 3.2 devient B et 4.4 devient A. Avec plus de voisins, le vote lisse le bruit : 3.2 devient A et 4.4 devient B, conformément à la tendance générale (petits x en A, grands x en B)."
      },
      recap: [
        "Surapprentissage : très bon en entraînement, nettement moins bon en test.",
        "Sous-apprentissage : mauvais partout, le modèle est trop simple.",
        "Surveille l'écart entre les deux scores, et juge sur des données jamais vues.",
        "Choisis les réglages (comme k) sur un jeu de validation, et garde le test pour la fin."
      ],
      check: {
        type: 'code',
        prompt: "Écris `diagnostic(score_train, score_test)` qui renvoie :\n\n" +
          "- `'sous-apprentissage'` si `score_train` est inférieur à 0.7 ;\n" +
          "- sinon `'surapprentissage'` si `score_train - score_test` dépasse strictement 0.1 ;\n" +
          "- sinon `'correct'`.",
        starter: `def diagnostic(score_train, score_test):
    # ton code ici
    return 'correct'
`,
        solution: `def diagnostic(score_train, score_test):
    if score_train < 0.7:
        return 'sous-apprentissage'
    if score_train - score_test > 0.1:
        return 'surapprentissage'
    return 'correct'
`,
        tests: [
          { code: `assert diagnostic(0.99, 0.62) == 'surapprentissage'`, label: "99 % puis 62 % : surapprentissage" },
          { code: `assert diagnostic(0.6, 0.58) == 'sous-apprentissage'`, label: "60 % puis 58 % : sous-apprentissage" },
          { code: `assert diagnostic(0.9, 0.86) == 'correct'`, label: "90 % puis 86 % : correct" },
          { code: `assert diagnostic(0.65, 0.4) == 'sous-apprentissage'`, label: "un modèle mauvais en entraînement est d'abord en sous-apprentissage" }
        ],
        hint: "L'ordre des tests compte : vérifie d'abord le score d'entraînement.",
        explain: "Si le modèle n'apprend même pas ses exemples, inutile de parler d'écart : c'est du sous-apprentissage. Sinon, un grand écart signale le surapprentissage. Les seuils 0.7 et 0.1 sont arbitraires : en pratique, ils dépendent du problème et de ce qu'on sait faire de mieux."
      }
    }]
  });

  // ---------- data.u14 Évaluation des modèles ----------
  units.push({
    id: 'data.u14',
    title: 'Évaluation des modèles',
    summary: "Mesurer un classifieur avec la matrice de confusion, l'exactitude, la précision et le rappel.",
    lessons: [{
      id: 'data.u14.l1',
      title: 'Mesurer un modèle honnêtement',
      minutes: 8,
      objective: "Tu sais calculer à la main la matrice de confusion, l'exactitude, la précision et le rappel, et choisir la mesure adaptée au problème.",
      explain: "Pour un classifieur à deux classes (positif = ce qu'on cherche : fraude, maladie, spam), on compte quatre cas : **VP** (vrais positifs), **FP** (fausses alertes), **FN** (cas ratés) et **VN** (vrais négatifs). C'est la **matrice de confusion**.\n\n" +
        "- **exactitude** = (VP + VN) / total : la part de bonnes réponses ;\n" +
        "- **précision** = VP / (VP + FP) : quand le modèle dit « positif », a-t-il raison ?\n" +
        "- **rappel** = VP / (VP + FN) : parmi les vrais positifs, combien sont trouvés ?\n\n" +
        "Avec des classes déséquilibrées, l'exactitude trompe : si 99 % des transactions sont normales, un modèle qui répond toujours « normal » a 99 % d'exactitude et 0 % de rappel. Un modèle à 95 % d'exactitude peut donc être inutile.\n\n" +
        "Choisis selon le coût des erreurs : rater une maladie est grave, surveille le rappel ; jeter un vrai mail dans les spams est gênant, surveille la précision. scikit-learn fournit `confusion_matrix`, `precision_score` et `recall_score`.",
      example: {
        code: `reel   = [1, 0, 1, 1, 0, 0, 1, 0]
predit = [1, 0, 0, 1, 1, 1, 1, 0]

vp = sum(1 for r, p in zip(reel, predit) if r == 1 and p == 1)
fp = sum(1 for r, p in zip(reel, predit) if r == 0 and p == 1)
fn = sum(1 for r, p in zip(reel, predit) if r == 1 and p == 0)
vn = sum(1 for r, p in zip(reel, predit) if r == 0 and p == 0)
print(vp, fp, fn, vn)
print("précision :", vp / (vp + fp))
print("rappel :", vp / (vp + fn))`,
        output: `3 2 1 2
précision : 0.6
rappel : 0.75`,
        notes: [
          { line: 4, text: "VP : le cas était positif et le modèle a dit positif." },
          { line: 5, text: "FP : fausse alerte, le modèle a dit positif à tort." },
          { line: 9, text: "Précision : sur 5 alertes, 3 étaient justes." },
          { line: 10, text: "Rappel : sur 4 vrais positifs, 3 ont été trouvés." }
        ]
      },
      exercises: [
        {
          type: 'logic',
          prompt: "Sur 1 000 transactions, 10 sont des fraudes. Un modèle répond « pas de fraude » à toutes les transactions. Quelle est son exactitude, en pourcentage ?",
          answer: '99',
          accept: ['99 %', '99%', '0.99', '0,99'],
          mistakes: [
            { answer: '1', why: "1 % est la part de fraudes. Le modèle a raison sur les 990 transactions normales : 990 / 1 000 = 99 %." },
            { answer: '0', why: "0 % est son rappel : il ne trouve aucune fraude. Mais son exactitude, la part de bonnes réponses, est de 99 %." }
          ],
          hint: "Compte les bonnes réponses : sur quelles transactions ce modèle a-t-il raison ?",
          explain: "Le modèle a raison sur les 990 transactions normales : 99 % d'exactitude. Pourtant, il ne détecte aucune fraude : son rappel est de 0 %. Sur des classes déséquilibrées, une exactitude élevée ne prouve rien ; regarde toujours la précision et le rappel."
        },
        {
          type: 'code',
          prompt: "Écris `matrice_confusion(reel, predit)` qui renvoie un dictionnaire `{'vp': ..., 'fp': ..., 'fn': ..., 'vn': ...}` à partir de deux listes de 0 et de 1 de même longueur (1 = positif).",
          starter: `def matrice_confusion(reel, predit):
    m = {'vp': 0, 'fp': 0, 'fn': 0, 'vn': 0}
    # ton code ici
    return m
`,
          solution: `def matrice_confusion(reel, predit):
    m = {'vp': 0, 'fp': 0, 'fn': 0, 'vn': 0}
    for r, p in zip(reel, predit):
        if r == 1 and p == 1:
            m['vp'] += 1
        elif r == 0 and p == 1:
            m['fp'] += 1
        elif r == 1 and p == 0:
            m['fn'] += 1
        else:
            m['vn'] += 1
    return m
`,
          tests: [
            { code: `assert matrice_confusion([1, 0, 1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 1, 1, 0]) == {'vp': 3, 'fp': 2, 'fn': 1, 'vn': 2}`, label: "les données de l'exemple donnent VP 3, FP 2, FN 1, VN 2" },
            { code: `assert matrice_confusion([0, 0, 1], [0, 0, 0]) == {'vp': 0, 'fp': 0, 'fn': 1, 'vn': 2}`, label: "un modèle qui ne prédit jamais 1 n'a ni VP ni FP" },
            { code: `m = matrice_confusion([1, 0] * 50, [1, 1] * 50)
assert m['vp'] == 50 and m['fp'] == 50 and sum(m.values()) == 100`, label: "les quatre cases totalisent le nombre d'exemples" }
          ],
          hint: "Parcours les deux listes ensemble avec `zip`, et range chaque couple (réel, prédit) dans une des quatre cases.",
          explain: "Chaque exemple tombe dans exactement une case : la somme des quatre vaut le nombre d'exemples. Toutes les autres mesures (exactitude, précision, rappel) se calculent à partir de ce dictionnaire."
        }
      ],
      challenge: {
        type: 'predict',
        run: false,
        prompt: "Ce sont les données de l'exemple, évaluées avec scikit-learn. Qu'affiche ce programme ? (À essayer sur ton ordinateur : `pip install scikit-learn`.)",
        code: `from sklearn.metrics import accuracy_score, precision_score, recall_score

reel   = [1, 0, 1, 1, 0, 0, 1, 0]
predit = [1, 0, 0, 1, 1, 1, 1, 0]
print(accuracy_score(reel, predit))
print(precision_score(reel, predit), recall_score(reel, predit))`,
        answer: `0.625
0.6 0.75`,
        mistakes: [
          { answer: `0.625
0.75 0.6`, why: "Précision et rappel sont inversés : précision = VP / (VP + FP) = 3 / 5 = 0.6 ; rappel = VP / (VP + FN) = 3 / 4 = 0.75." },
          { answer: `0.375
0.6 0.75`, why: "0.375 est la part de bonnes réponses positives seules (3 sur 8). L'exactitude compte aussi les vrais négatifs : (3 + 2) / 8 = 0.625." }
        ],
        hint: "Reprends les quatre cases de l'exemple : VP = 3, FP = 2, FN = 1, VN = 2.",
        explain: "Exactitude : (3 + 2) / 8 = 0.625. Précision : 3 / 5 = 0.6. Rappel : 3 / 4 = 0.75. scikit-learn calcule exactement ce que tu as codé ; savoir le refaire à la main permet de vérifier qu'on lui passe les bons arguments, dans le bon ordre (le réel d'abord)."
      },
      recap: [
        "Matrice de confusion : VP, FP, FN, VN ; tout le reste se calcule à partir d'elle.",
        "Exactitude = (VP + VN) / total ; trompeuse quand les classes sont déséquilibrées.",
        "Précision = VP / (VP + FP) : la fiabilité des alertes.",
        "Rappel = VP / (VP + FN) : la part des vrais positifs trouvés.",
        "Choisis la mesure selon le coût de chaque type d'erreur."
      ],
      check: {
        type: 'qcm',
        prompt: "Un modèle anti-fraude obtient sur le test : VP = 40, FP = 10, FN = 60, VN = 890. Quelle affirmation est exacte ?",
        choices: [
          "Son exactitude est de 93 %, il attrape donc bien les fraudes.",
          "Précision 0.8 et rappel 0.4 : quand il alerte, il a souvent raison, mais il rate 60 % des fraudes.",
          "Précision 0.4 et rappel 0.8 : il trouve la plupart des fraudes, mais avec beaucoup de fausses alertes.",
          "Son rappel est de 4 % : 40 fraudes trouvées sur 1 000 transactions."
        ],
        answer: 1,
        why: {
          0: "L'exactitude vaut bien 93 %, mais elle est portée par les 890 transactions normales : le modèle ne trouve que 40 fraudes sur 100.",
          2: "Les deux mesures sont inversées : précision = 40 / (40 + 10), rappel = 40 / (40 + 60).",
          3: "Le rappel se calcule parmi les vraies fraudes (VP + FN = 100), pas parmi toutes les transactions."
        },
        hint: "Calcule VP / (VP + FP), puis VP / (VP + FN).",
        explain: "Précision = 40 / 50 = 0.8 ; rappel = 40 / 100 = 0.4. Pour de la fraude, rater 60 % des cas est grave : il faudrait améliorer le rappel, quitte à accepter un peu plus de fausses alertes. Les 93 % d'exactitude masquaient ce problème."
      }
    }]
  });

  CQ.addChapter('data', { id: 'data.c4', title: 'Machine learning', units: units });
})();
