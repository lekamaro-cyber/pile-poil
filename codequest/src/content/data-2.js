// CodeQuest — parcours « Data science et IA » (data), chapitre 2 « Outils » : data.u4 à data.u7.
// NumPy, pandas et matplotlib ne tournent pas dans l'appli : leurs exercices sont en run: false.
(function () {
  var units = [];

  // ---------- data.u4 NumPy ----------
  units.push({
    id: 'data.u4',
    title: 'NumPy',
    summary: "Calculer sur des tableaux entiers d'un coup, et comprendre ce que NumPy fait à la place de tes boucles.",
    lessons: [{
      id: 'data.u4.l1',
      title: 'Calculer sur des tableaux entiers',
      minutes: 7,
      objective: "Tu sais prévoir le résultat des opérations vectorisées de NumPy et les réécrire en Python pur.",
      explain: "En Python pur, doubler chaque valeur d'une liste demande une boucle ou une compréhension. **NumPy** fait ces calculs sur un tableau entier d'un coup : c'est la **vectorisation**. `np.array([12, 15, 9])` crée un tableau ; `a * 2`, `a + b` ou `a > 10` s'appliquent à chaque élément, en code compilé, bien plus vite qu'une boucle Python.\n\n" +
        "Quelques règles :\n\n" +
        "- un tableau contient un seul type (que des entiers, ou que des flottants) ;\n" +
        "- `a + b` additionne élément par élément, alors que `liste1 + liste2` **colle** deux listes ;\n" +
        "- `a[a > 10]` garde les éléments qui vérifient la condition : c'est un masque de booléens ;\n" +
        "- `a.mean()`, `a.sum()`, `a.max()` résument le tableau ; `a.shape` donne sa forme.\n\n" +
        "Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install numpy`).",
      example: {
        run: false,
        code: `import numpy as np

notes = np.array([12, 15, 9, 18])
print(notes * 2)
print(notes.mean())
print(notes[notes >= 12])
print(notes.shape)`,
        output: `[24 30 18 36]
13.5
[12 15 18]
(4,)`,
        notes: [
          { line: 3, text: "`np.array` transforme une liste en tableau NumPy." },
          { line: 4, text: "Le calcul s'applique à chaque élément, sans boucle. NumPy affiche ses tableaux sans virgules." },
          { line: 6, text: "`notes >= 12` donne un masque `[True True False True]` ; `notes[masque]` garde les éléments à `True`." },
          { line: 7, text: "La forme `(4,)` signifie : une seule dimension, de 4 éléments." }
        ]
      },
      exercises: [
        {
          type: 'predict',
          run: false,
          prompt: "Qu'affiche ce programme ? (À essayer sur ton ordinateur.)",
          code: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
print(a + b)
print([1, 2, 3] + [10, 20, 30])`,
          answer: `[11 22 33]
[1, 2, 3, 10, 20, 30]`,
          mistakes: [
            { answer: `[11 22 33]
[11, 22, 33]`, why: "Avec des listes Python, `+` concatène : la seconde liste est collée au bout de la première. Seul NumPy additionne élément par élément." },
            { answer: `[11, 22, 33]
[1, 2, 3, 10, 20, 30]`, why: "Le calcul est juste, mais NumPy affiche ses tableaux sans virgules : `[11 22 33]`. C'est un bon moyen de distinguer un tableau d'une liste à l'affichage." }
          ],
          hint: "Le même symbole `+` n'a pas le même sens pour un tableau NumPy et pour une liste.",
          explain: "Pour deux tableaux de même forme, `+` additionne les éléments de même position. Pour deux listes, `+` les met bout à bout. Confondre les deux est une source d'erreurs fréquente quand on mélange listes et tableaux."
        },
        {
          type: 'code',
          prompt: "En NumPy, `a - a.mean()` **centre** un tableau : chaque valeur devient son écart à la moyenne. Écris l'équivalent en Python pur : `centrer(valeurs)` renvoie la liste des `valeur - moyenne`, dans le même ordre.",
          starter: `def centrer(valeurs):
    # ton code ici
    return valeurs
`,
          solution: `def centrer(valeurs):
    moyenne = sum(valeurs) / len(valeurs)
    return [v - moyenne for v in valeurs]
`,
          tests: [
            { code: `assert centrer([1, 2, 3]) == [-1.0, 0.0, 1.0]`, label: "centrer([1, 2, 3]) renvoie [-1.0, 0.0, 1.0]" },
            { code: `assert centrer([10]) == [0.0]`, label: "centrer([10]) renvoie [0.0]" },
            { code: `r = centrer([4, 8, 9])
assert abs(sum(r)) < 1e-9 and abs(r[0] + 3) < 1e-9`, label: "les écarts de centrer([4, 8, 9]) ont une somme nulle" }
          ],
          hint: "Calcule la moyenne une seule fois, avant la compréhension, et pas à chaque élément.",
          explain: "La moyenne est calculée une fois, puis soustraite à chaque valeur. La somme des écarts vaut toujours 0, aux arrondis près. NumPy fait exactement ce calcul avec `a - a.mean()`, sans boucle visible."
        }
      ],
      challenge: {
        type: 'bug',
        run: false,
        prompt: "Ce code devrait afficher les températures strictement comprises entre 10 et 20, mais il lève une `ValueError`. Clique sur la ligne fautive.",
        code: `import numpy as np

temperatures = np.array([8, 14, 21, 17, 25, 12])
douces = temperatures[(temperatures > 10) and (temperatures < 20)]
print(douces)`,
        bugLine: 4,
        why: "`and` attend deux booléens simples : Python demande à NumPy si le tableau entier est vrai ou faux, ce qui est ambigu, d'où `ValueError: The truth value of an array with more than one element is ambiguous`. Pour combiner deux masques élément par élément, NumPy utilise `&` (et `|` pour « ou »), avec des parenthèses autour de chaque condition.",
        fixes: [
          `douces = temperatures[(temperatures > 10) & (temperatures < 20)]`,
          `douces = temperatures[temperatures > 10 and temperatures < 20]`,
          `douces = temperatures[(temperatures > 10) | (temperatures < 20)]`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "Sans parenthèses, c'est toujours `and` : la même `ValueError` apparaît.",
          2: "`|` signifie « ou » : chaque température est supérieure à 10 ou inférieure à 20, le filtre garderait donc tout."
        },
        output: `[14 17 12]`,
        hint: "Le mot-clé `and` fonctionne sur deux booléens, pas sur deux tableaux de booléens.",
        explain: "`(temperatures > 10) & (temperatures < 20)` combine les deux masques position par position. Les parenthèses sont obligatoires, car `&` est prioritaire sur les comparaisons."
      },
      recap: [
        "NumPy applique une opération à tout un tableau d'un coup : c'est la vectorisation.",
        "Avec des tableaux, `+` additionne élément par élément ; avec des listes, il les colle.",
        "`a[a > 10]` filtre avec un masque ; combine des masques avec `&` et `|`, pas `and` et `or`.",
        "`axis=0` calcule colonne par colonne, `axis=1` ligne par ligne."
      ],
      check: {
        type: 'qcm',
        run: false,
        prompt: "Ce tableau a 2 lignes et 3 colonnes. Que vaut `m.sum(axis=0)` ?",
        code: `import numpy as np

m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.shape)            # (2, 3)
print(m.sum(axis=0))`,
        choices: ['`[5 7 9]`', '`[ 6 15]`', '`21`', '`[1 2 3 4 5 6]`'],
        answer: 0,
        why: {
          1: "C'est `m.sum(axis=1)` : la somme de chaque ligne (1 + 2 + 3 et 4 + 5 + 6).",
          2: "C'est `m.sum()` sans axe : la somme de tous les éléments.",
          3: "`sum` additionne ; il ne se contente pas d'aplatir le tableau."
        },
        hint: "`axis=0` fait disparaître la dimension des lignes : il reste une valeur par colonne.",
        explain: "`axis=0` additionne en descendant le long des lignes, donc colonne par colonne : 1 + 4, 2 + 5, 3 + 6. Le résultat a une valeur par colonne. En Python pur, ce serait `[sum(col) for col in zip(*m)]`."
      }
    }]
  });

  // ---------- data.u5 pandas ----------
  units.push({
    id: 'data.u5',
    title: 'pandas',
    summary: "Lire, filtrer et résumer un tableau de données avec les DataFrames de pandas.",
    lessons: [{
      id: 'data.u5.l1',
      title: 'DataFrame : lire et sélectionner',
      minutes: 7,
      objective: "Tu sais lire un DataFrame, sélectionner des colonnes et filtrer des lignes avec une condition.",
      explain: "**pandas** manipule des tableaux de données comme un tableur programmable. Son objet central, le **DataFrame**, range les données en colonnes nommées : c'est le format en colonnes de l'unité 2. Chaque colonne est une **Series**, qui se comporte comme un tableau NumPy.\n\n" +
        "- `pd.read_csv('films.csv')` lit un CSV et convertit les colonnes numériques ;\n" +
        "- `df['note']` sélectionne une colonne, `df[['titre', 'note']]` plusieurs ;\n" +
        "- `df[df['annee'] >= 2000]` garde les lignes qui vérifient la condition : un masque, comme en NumPy ;\n" +
        "- `len(df)`, `df.shape` (lignes, colonnes) et `df.head()` donnent un premier aperçu.\n\n" +
        "Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install pandas`).",
      example: {
        run: false,
        code: `import pandas as pd

df = pd.DataFrame({
    "titre": ["Alien", "Matrix", "Her", "Up"],
    "annee": [1979, 1999, 2013, 2009],
    "note": [8.5, 8.7, 8.0, 8.3],
})
recents = df[df["annee"] >= 2000]
print(len(recents))
print(recents["titre"].tolist())
print(df["note"].max())`,
        output: `2
['Her', 'Up']
8.7`,
        notes: [
          { line: 3, text: "Un dictionnaire de colonnes devient un DataFrame de 4 lignes et 3 colonnes." },
          { line: 8, text: "`df['annee'] >= 2000` est un masque de booléens ; `df[masque]` garde les lignes à `True`." },
          { line: 10, text: "`.tolist()` transforme une colonne (Series) en liste Python." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "`films` est la même table en Python pur, sous forme de liste de dictionnaires. Quel code donne le même résultat que `df[df['annee'] >= 2000]['titre'].tolist()` ?",
          choices: [
            "`[f['titre'] for f in films if f['annee'] >= 2000]`",
            "`[f for f in films if f['annee'] >= 2000]`",
            "`[f['annee'] >= 2000 for f in films]`",
            "`[f['titre'] for f in films]`"
          ],
          answer: 0,
          why: {
            1: "Ce code garde les lignes entières (des dictionnaires), pas seulement les titres.",
            2: "Ce code construit le masque lui-même : une liste de booléens, sans rien filtrer.",
            3: "Ce code renvoie tous les titres : il manque la condition."
          },
          hint: "Le résultat pandas contient des titres, et seulement ceux des films récents.",
          explain: "Le masque pandas correspond au `if` de la compréhension, et la sélection de la colonne `['titre']` à l'expression `f['titre']`. pandas fait la même chose, en plus court et bien plus vite sur de grands tableaux."
        },
        {
          type: 'code',
          prompt: "pandas filtre en deux temps : il calcule un masque (une liste de booléens), puis garde les lignes où le masque vaut `True`. Reproduis ce mécanisme en Python pur :\n\n" +
            "- `masque(lignes, cle, seuil)` renvoie la liste des booléens `ligne[cle] >= seuil` ;\n" +
            "- `appliquer(lignes, m)` renvoie les lignes dont le booléen correspondant dans `m` vaut `True`.",
          starter: `def masque(lignes, cle, seuil):
    return []

def appliquer(lignes, m):
    return lignes
`,
          solution: `def masque(lignes, cle, seuil):
    return [ligne[cle] >= seuil for ligne in lignes]

def appliquer(lignes, m):
    return [ligne for ligne, garder in zip(lignes, m) if garder]
`,
          tests: [
            { code: `films = [{'t': 'Alien', 'a': 1979}, {'t': 'Her', 'a': 2013}, {'t': 'Up', 'a': 2009}]
assert masque(films, 'a', 2000) == [False, True, True]`, label: "masque(films, 'a', 2000) renvoie [False, True, True]" },
            { code: `films = [{'t': 'Alien', 'a': 1979}, {'t': 'Her', 'a': 2013}, {'t': 'Up', 'a': 2009}]
assert appliquer(films, [False, True, True]) == films[1:]`, label: "appliquer garde les lignes où le masque vaut True" },
            { code: `assert appliquer([{'x': 1}, {'x': 2}], [True, False]) == [{'x': 1}]`, label: "appliquer(..., [True, False]) garde seulement la première ligne" }
          ],
          hint: "`zip(lignes, m)` parcourt en même temps chaque ligne et son booléen.",
          explain: "Le masque contient autant de booléens que de lignes ; `zip` les associe un à un. C'est exactement ce que fait `df[df['a'] >= 2000]` : `df['a'] >= 2000` construit le masque, puis `df[...]` l'applique."
        }
      ],
      challenge: {
        type: 'predict',
        run: false,
        prompt: "Qu'affiche ce programme ? (À essayer sur ton ordinateur.)",
        code: `import pandas as pd

df = pd.DataFrame({
    "ville": ["Lyon", "Paris", "Lyon", "Nice"],
    "ventes": [10, 25, 5, 8],
})
print(df.shape)
print(df[df["ville"] == "Lyon"]["ventes"].sum())
print(df["ventes"].mean())`,
        answer: `(4, 2)
15
12.0`,
        mistakes: [
          { answer: `(2, 4)
15
12.0`, why: "`shape` donne d'abord le nombre de lignes, puis le nombre de colonnes : 4 lignes, 2 colonnes." },
          { answer: `(4, 2)
2
12.0`, why: "Le filtre garde les 2 lignes de Lyon, puis `.sum()` additionne leurs ventes : 10 + 5 = 15. Pour compter les lignes, on utiliserait `len(...)`." }
        ],
        hint: "Pour chaque `print`, dis-toi en français ce qu'il calcule avant de faire le calcul.",
        explain: "Le DataFrame a 4 lignes et 2 colonnes. Le masque `ville == 'Lyon'` garde 2 lignes dont les ventes font 15. La moyenne des ventes vaut 48 / 4 = 12.0 : une moyenne est toujours un flottant."
      },
      recap: [
        "Un DataFrame est un tableau en colonnes nommées ; chaque colonne est une Series.",
        "`pd.read_csv` lit un CSV et convertit les colonnes numériques.",
        "`df[condition]` filtre les lignes avec un masque de booléens.",
        "`df.shape` vaut (lignes, colonnes) ; `.tolist()` redonne une liste Python."
      ],
      check: {
        type: 'fill',
        run: false,
        prompt: "Complète pour lire `films.csv` et garder les films dont la note dépasse 8.4.",
        files: { 'films.csv': "titre,annee,note\nAlien,1979,8.5\nMatrix,1999,8.7\nHer,2013,8.0\nUp,2009,8.3\n" },
        code: `import pandas as pd

df = pd.___("films.csv")
bons = df[df["note"] ___ 8.4]
print(bons["titre"].tolist())
print(len(df) - len(bons))`,
        blanks: [
          { answers: ['read_csv'], options: ['read_csv', 'open', 'DictReader'],
            why: { 'open': "`open` ouvre un fichier texte ; il ne crée pas de DataFrame.", 'DictReader': "`DictReader` appartient au module `csv`, pas à pandas." } },
          { answers: ['>', '>='],
            why: { '<': "`<` garderait les films dont la note est inférieure à 8.4.", '==': "`==` ne garderait que les films notés exactement 8.4 : aucun ici." } }
        ],
        output: `['Alien', 'Matrix']
2`,
        hint: "pandas a une fonction de lecture pour chaque format de fichier ; son nom commence par `read_`.",
        explain: "`pd.read_csv` lit le fichier et reconnaît que `note` contient des nombres : la comparaison avec 8.4 fonctionne sans conversion, contrairement à `csv.DictReader`. Le masque garde Alien et Matrix ; 2 films sont écartés."
      }
    }, {
      id: 'data.u5.l2',
      title: 'Grouper et résumer',
      minutes: 8,
      objective: "Tu sais calculer des statistiques par groupe avec `groupby` et prévoir son résultat en le recodant en Python pur.",
      explain: "Beaucoup de questions se posent **par groupe** : les ventes par ville, la note moyenne par genre. pandas suit le schéma « séparer, appliquer, combiner » :\n\n" +
        "- **séparer** les lignes selon la valeur d'une colonne (`groupby('ville')`) ;\n" +
        "- **appliquer** un calcul à chaque groupe (`sum`, `mean`, `count`, `max`) ;\n" +
        "- **combiner** les résultats dans une Series indexée par les groupes.\n\n" +
        "`df.groupby('ville')['ventes'].sum()` répond donc à « combien de ventes par ville ? ». `value_counts()` compte les lignes de chaque catégorie et `idxmax()` donne le groupe qui a la plus grande valeur.\n\n" +
        "En Python pur, un groupby est un dictionnaire qu'on remplit en parcourant les lignes, comme dans l'unité 2.\n\n" +
        "Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install pandas`).",
      example: {
        run: false,
        code: `import pandas as pd

df = pd.DataFrame({
    "ville": ["Lyon", "Paris", "Lyon", "Nice", "Paris"],
    "ventes": [10, 25, 5, 8, 15],
})
par_ville = df.groupby("ville")["ventes"].sum()
print(par_ville["Lyon"], par_ville["Paris"])
print(par_ville.idxmax())
print(df["ville"].value_counts()["Paris"])`,
        output: `15 40
Paris
2`,
        notes: [
          { line: 7, text: "Une somme des ventes par ville : le résultat est une Series dont les étiquettes sont les villes." },
          { line: 9, text: "`idxmax()` renvoie l'étiquette du maximum (la ville), pas la valeur." },
          { line: 10, text: "`value_counts()` compte les lignes de chaque ville, sans regarder les ventes." }
        ]
      },
      exercises: [
        {
          type: 'code',
          prompt: "Recode `df.groupby(cle_groupe)[cle_valeur].sum()` en Python pur : écris `somme_par_groupe(lignes, cle_groupe, cle_valeur)` qui renvoie un dictionnaire `{groupe: somme des valeurs}`.",
          starter: `def somme_par_groupe(lignes, cle_groupe, cle_valeur):
    resultat = {}
    # ton code ici
    return resultat
`,
          solution: `def somme_par_groupe(lignes, cle_groupe, cle_valeur):
    resultat = {}
    for ligne in lignes:
        groupe = ligne[cle_groupe]
        resultat[groupe] = resultat.get(groupe, 0) + ligne[cle_valeur]
    return resultat
`,
          tests: [
            { code: `ventes = [{'ville': 'Lyon', 'v': 10}, {'ville': 'Paris', 'v': 25}, {'ville': 'Lyon', 'v': 5}]
assert somme_par_groupe(ventes, 'ville', 'v') == {'Lyon': 15, 'Paris': 25}`, label: "ventes par ville : Lyon 15, Paris 25" },
            { code: `pts = [{'eq': 'A', 'p': 3}, {'eq': 'B', 'p': 1}, {'eq': 'A', 'p': 0}, {'eq': 'B', 'p': 3}]
assert somme_par_groupe(pts, 'eq', 'p') == {'A': 3, 'B': 4}`, label: "points par équipe : A 3, B 4" },
            { code: `assert somme_par_groupe([], 'ville', 'v') == {}`, label: "aucune ligne donne un dictionnaire vide" }
          ],
          hint: "`dictionnaire.get(cle, 0)` renvoie 0 quand le groupe n'a pas encore été vu.",
          explain: "Chaque ligne ajoute sa valeur au total de son groupe ; `get(groupe, 0)` fait démarrer un nouveau groupe à 0. C'est le « séparer, appliquer, combiner » de pandas, en une seule boucle."
        },
        {
          type: 'predict',
          run: false,
          prompt: "Qu'affiche ce programme ? (À essayer sur ton ordinateur.)",
          code: `import pandas as pd

df = pd.DataFrame({
    "equipe": ["A", "B", "A", "B", "A"],
    "points": [3, 1, 0, 2, 3],
})
moy = df.groupby("equipe")["points"].mean()
print(moy["A"], moy["B"])
print(df["equipe"].value_counts()["A"])`,
          answer: `2.0 1.5
3`,
          mistakes: [
            { answer: `6 3
3`, why: "`.mean()` calcule une moyenne, pas une somme : A a 6 points en 3 lignes, soit 2.0 ; B a 3 points en 2 lignes, soit 1.5." },
            { answer: `2.0 1.5
6`, why: "`value_counts()` compte les lignes de chaque équipe (3 pour A), sans regarder les points." }
          ],
          hint: "Fais les groupes à la main : quelles lignes appartiennent à l'équipe A ?",
          explain: "Le groupe A contient les points 3, 0 et 3 (moyenne 2.0), le groupe B les points 1 et 2 (moyenne 1.5). `value_counts()` compte simplement les lignes : A apparaît 3 fois."
        }
      ],
      challenge: {
        type: 'order',
        run: false,
        prompt: "Remets dans l'ordre ce programme pandas qui trouve le produit qui rapporte le plus. L'import vient en premier.",
        files: { 'ventes.csv': "produit,prix,quantite\nstylo,1.5,10\ncahier,3.2,0\nsac,24.9,2\nstylo,1.5,4\n" },
        lines: [
          `import pandas as pd`,
          `ventes = pd.read_csv("ventes.csv")`,
          `ventes["total"] = ventes["prix"] * ventes["quantite"]`,
          `valides = ventes[ventes["total"] > 0]`,
          `par_produit = valides.groupby("produit")["total"].sum()`,
          `print(par_produit.idxmax(), par_produit.max())`
        ],
        output: `sac 49.8`,
        hint: "Chaque ligne utilise une variable ou une colonne créée par la ligne précédente.",
        explain: "On lit le fichier, on crée une colonne calculée sur toutes les lignes d'un coup, on filtre, on groupe par produit, puis `idxmax` donne le produit du maximum. Le stylo, vendu deux fois, cumule 21 ; le sac rapporte 49,8."
      },
      recap: [
        "`groupby` sépare les lignes par groupe, applique un calcul, puis combine les résultats.",
        "`sum`, `mean` et `count` ne répondent pas à la même question : vérifie lequel tu veux.",
        "`value_counts()` compte les lignes de chaque catégorie, `idxmax()` donne le groupe du maximum.",
        "En Python pur, un groupby est un dictionnaire rempli dans une boucle."
      ],
      check: {
        type: 'bug',
        run: false,
        prompt: "Ce code devrait afficher le total des ventes de Lyon (15), mais il affiche 2. Clique sur la ligne fautive.",
        code: `import pandas as pd

df = pd.DataFrame({
    "ville": ["Lyon", "Paris", "Lyon", "Nice", "Paris"],
    "ventes": [10, 25, 5, 8, 15],
})
par_ville = df.groupby("ville")["ventes"].count()
print(par_ville["Lyon"])`,
        bugLine: 7,
        why: "`count()` compte les lignes de chaque groupe (2 lignes pour Lyon) au lieu d'additionner leurs valeurs.",
        fixes: [
          `par_ville = df.groupby("ville")["ventes"].sum()`,
          `par_ville = df.groupby("ville")["ventes"].mean()`,
          `par_ville = df.groupby("ventes")["ville"].count()`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "`mean()` donnerait la moyenne des ventes de Lyon, 7.5, pas leur total.",
          2: "On grouperait par montant de vente au lieu de grouper par ville : `par_ville['Lyon']` n'existerait plus."
        },
        output: `15`,
        hint: "Quel calcul est appliqué à chaque groupe ? Correspond-il à un « total » ?",
        explain: "Le regroupement par ville est correct ; c'est le calcul appliqué à chaque groupe qui est faux. `sum()` additionne les ventes de Lyon : 10 + 5 = 15."
      }
    }]
  });

  // ---------- data.u6 Nettoyage de données ----------
  units.push({
    id: 'data.u6',
    title: 'Nettoyage de données',
    summary: "Repérer et traiter valeurs manquantes, doublons, mauvais types et valeurs aberrantes.",
    lessons: [{
      id: 'data.u6.l1',
      title: "Nettoyer avant d'analyser",
      minutes: 8,
      objective: "Tu sais traiter valeurs manquantes, doublons, mauvais types et valeurs aberrantes en Python pur, et reconnaître les fonctions pandas qui font la même chose.",
      explain: "Les données réelles sont sales. Avant toute analyse, on traite quatre problèmes :\n\n" +
        "- **valeurs manquantes** (`''`, `'NA'`, `None`) : les retirer, ou les remplacer par une valeur raisonnable comme la médiane ;\n" +
        "- **doublons** : la même observation enregistrée deux fois, à ne garder qu'une fois ;\n" +
        "- **mauvais types** : `' 17 '` avec des espaces, `'17,5'` avec une virgule décimale, à convertir ;\n" +
        "- **valeurs aberrantes** : `-999` écrit par un capteur en panne, une durée de 3 000 minutes. On les écarte avec une règle qui a du sens, comme une plage de valeurs possibles.\n\n" +
        "Compte toujours ce que tu retires, et dis-le : une analyse qui jette 40 % des lignes en silence n'est pas fiable.\n\n" +
        "Avec pandas : `dropna`, `fillna`, `drop_duplicates`, `pd.to_numeric(..., errors='coerce')`. Cette bibliothèque ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install pandas`).",
      example: {
        code: `brut = ["21.5", "", "22,0", " 23.1 ", "-999", "NA", "20.8"]

def nettoyer(valeurs):
    propres = []
    for v in valeurs:
        v = v.strip().replace(",", ".")
        if v in ("", "NA"):
            continue
        x = float(v)
        if -50 <= x <= 60:
            propres.append(x)
    return propres

propres = nettoyer(brut)
print(propres)
print(len(brut) - len(propres), "valeurs retirées")`,
        output: `[21.5, 22.0, 23.1, 20.8]
3 valeurs retirées`,
        notes: [
          { line: 6, text: "Types : on enlève les espaces et on remplace la virgule décimale avant de convertir." },
          { line: 7, text: "Valeurs manquantes : les cases vides et `'NA'` sont sautées." },
          { line: 10, text: "Valeurs aberrantes : une température hors de -50 à 60 °C est écartée (ici, le code -999)." },
          { line: 16, text: "On annonce combien de valeurs ont été retirées." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Un capteur de température écrit `-999` quand il est en panne. Ta colonne contient 500 mesures, dont 12 valent `-999`. Que fais-tu avant de calculer la température moyenne ?",
          choices: [
            "Je garde tout : retirer des données, c'est tricher.",
            "Je traite les `-999` comme des valeurs manquantes, je les retire (ou je les remplace) et je note combien il y en avait.",
            "Je remplace les `-999` par 0.",
            "Je supprime toute la colonne, elle n'est pas fiable."
          ],
          answer: 1,
          why: {
            0: "-999 n'est pas une température, c'est un code d'erreur. Le garder ferait chuter la moyenne d'environ 24 degrés.",
            2: "0 °C est une vraie température possible : la moyenne serait encore faussée, et en silence.",
            3: "488 mesures sur 500 sont valides : jeter la colonne ferait perdre une information utile."
          },
          hint: "-999 est-il une mesure, ou un message du capteur ?",
          explain: "Un code comme -999 signifie « pas de mesure ». On le traite comme une valeur manquante, on le retire ou on le remplace, et on annonce combien de valeurs sont concernées (12 sur 500 ici)."
        },
        {
          type: 'bug',
          prompt: "Ce code devrait garder chaque `id` une seule fois et afficher 3, mais il affiche 0. Clique sur la ligne fautive.",
          code: `lignes = [{"id": 1, "v": 5}, {"id": 2, "v": 7}, {"id": 1, "v": 5}, {"id": 3, "v": 2}]
vus = set()
uniques = []
for ligne in lignes:
    if ligne["id"] in vus:
        vus.add(ligne["id"])
        uniques.append(ligne)
print(len(uniques))`,
          bugLine: 5,
          why: "La condition est inversée : au départ `vus` est vide, donc aucun `id` n'y est, et rien n'est jamais ajouté. Il faut garder une ligne quand son `id` n'a **pas** encore été vu.",
          fixes: [
            `    if ligne["id"] not in vus:`,
            `    if ligne in vus:`,
            `    if ligne["v"] not in vus:`
          ],
          fixAnswer: 0,
          fixWhy: {
            1: "Un dictionnaire ne peut pas être cherché dans un set (il n'est pas hachable) : `TypeError`. Et c'est l'`id` qu'on veut comparer.",
            2: "On dédoublonnerait selon la valeur `v` : deux observations différentes qui ont la même valeur seraient fusionnées."
          },
          output: `3`,
          hint: "Déroule la première itération : que contient `vus` à ce moment-là ?",
          explain: "Le set `vus` mémorise les identifiants déjà rencontrés. On garde la ligne seulement si son `id` est nouveau, puis on l'ajoute à `vus` : la deuxième ligne d'`id` 1 est écartée."
        }
      ],
      challenge: {
        type: 'fill',
        run: false,
        prompt: "Complète ce nettoyage pandas : supprimer les lignes en double, convertir la température (le texte `'abc'` devient une valeur manquante), puis remplacer les manquants par la médiane.",
        code: `import pandas as pd

df = pd.DataFrame({
    "id": [1, 2, 2, 3, 4, 5],
    "temp": ["21.5", None, None, "abc", "19.5", "23"],
})
df = df.___()
df["temp"] = pd.to_numeric(df["temp"], errors="coerce")
df["temp"] = df["temp"].___(df["temp"].median())
print(len(df))
print(df["temp"].tolist())`,
        blanks: [
          { answers: ['drop_duplicates'], options: ['drop_duplicates', 'dropna', 'unique'],
            why: { 'dropna': "`dropna` retire les lignes qui ont une valeur manquante, pas les doublons : ici, il retirerait les deux lignes d'id 2.", 'unique': "`unique` s'applique à une colonne et renvoie ses valeurs distinctes, pas un DataFrame nettoyé." } },
          { answers: ['fillna'], options: ['fillna', 'dropna', 'replace'],
            why: { 'dropna': "`dropna` supprimerait les lignes manquantes au lieu de les remplacer par la médiane.", 'replace': "`replace` remplace des valeurs précises que tu indiques ; pour remplir les valeurs manquantes, on utilise `fillna`." } }
        ],
        output: `5
[21.5, 21.5, 21.5, 19.5, 23.0]`,
        hint: "Les deux fonctions portent presque le nom de ce qu'elles font, en anglais : « supprimer les doublons » et « remplir les manquants ».",
        explain: "`drop_duplicates` retire la deuxième ligne d'id 2. `to_numeric(..., errors='coerce')` transforme `'abc'` en valeur manquante au lieu de planter. `fillna` remplace les deux manquants par la médiane des valeurs restantes, 21.5."
      },
      recap: [
        "Quatre problèmes à traiter : manquants, doublons, mauvais types, valeurs aberrantes.",
        "Un code comme -999 n'est pas une mesure : traite-le comme une valeur manquante.",
        "Nettoie le texte (`strip`, virgule décimale) avant de le convertir, et attrape les `ValueError`.",
        "Compte et annonce ce que tu retires.",
        "pandas : `dropna`, `fillna`, `drop_duplicates`, `to_numeric(errors='coerce')`."
      ],
      check: {
        type: 'code',
        prompt: "Écris `nettoyer_notes(lignes)` qui reçoit des dictionnaires `{'id': ..., 'note': texte}` lus dans un fichier et renvoie un dictionnaire `{id: note en float}` :\n\n" +
          "- garde seulement la première ligne de chaque `id` ;\n" +
          "- accepte les espaces et la virgule décimale (`' 12,5 '` donne 12.5) ;\n" +
          "- ignore les notes vides ou illisibles (`''`, `'abs'`) ;\n" +
          "- ignore les notes hors de l'intervalle 0 à 20 (bornes comprises).",
        starter: `def nettoyer_notes(lignes):
    resultat = {}
    for ligne in lignes:
        resultat[ligne["id"]] = float(ligne["note"])
    return resultat
`,
        solution: `def nettoyer_notes(lignes):
    resultat = {}
    for ligne in lignes:
        if ligne["id"] in resultat:
            continue
        texte = ligne["note"].strip().replace(",", ".")
        try:
            note = float(texte)
        except ValueError:
            continue
        if 0 <= note <= 20:
            resultat[ligne["id"]] = note
    return resultat
`,
        tests: [
          { code: `lignes = [{'id': 1, 'note': '12'}, {'id': 2, 'note': ' 14,5 '}, {'id': 1, 'note': '3'}]
assert nettoyer_notes(lignes) == {1: 12.0, 2: 14.5}`, label: "doublon d'id ignoré, espaces et virgule acceptés" },
          { code: `lignes = [{'id': 1, 'note': ''}, {'id': 2, 'note': 'abs'}, {'id': 3, 'note': '9'}]
assert nettoyer_notes(lignes) == {3: 9.0}`, label: "notes vides ou illisibles ignorées" },
          { code: `lignes = [{'id': 1, 'note': '25'}, {'id': 2, 'note': '-1'}, {'id': 3, 'note': '20'}]
assert nettoyer_notes(lignes) == {3: 20.0}`, label: "notes hors de 0 à 20 ignorées (20 est acceptée)" }
        ],
        hint: "Pour un texte illisible, `float` lève une `ValueError` : attrape-la avec `try` / `except` et passe à la ligne suivante.",
        explain: "Chaque règle traite un des quatre problèmes : doublons (`id` déjà présent), types (espaces et virgule), manquants ou illisibles (`try` / `except`), aberrantes (la plage 0 à 20). L'ordre compte : on nettoie le texte avant de le convertir, et on convertit avant de comparer."
      }
    }]
  });

  // ---------- data.u7 Visualisation ----------
  units.push({
    id: 'data.u7',
    title: 'Visualisation',
    summary: "Choisir le graphique adapté à une question, le lire correctement et repérer un graphique trompeur.",
    lessons: [{
      id: 'data.u7.l1',
      title: 'Choisir et lire un graphique',
      minutes: 6,
      objective: "Tu sais choisir le graphique adapté à une question et repérer un graphique trompeur.",
      explain: "Un graphique répond à une question. Choisis-le d'après elle :\n\n" +
        "- **évolution dans le temps** : une courbe (`plt.plot`) ;\n" +
        "- **comparer des catégories** : des barres (`plt.bar`) ;\n" +
        "- **répartition d'une variable** (combien de valeurs dans chaque tranche) : un histogramme (`plt.hist`) ;\n" +
        "- **lien entre deux variables numériques** : un nuage de points (`plt.scatter`).\n\n" +
        "Pour lire un graphique, regarde d'abord les axes : ce qu'ils mesurent, leurs unités, et où ils commencent. Un axe de barres qui ne part pas de zéro grossit les écarts. Et deux courbes qui montent ensemble ne prouvent pas que l'une cause l'autre.\n\n" +
        "Cette bibliothèque (matplotlib) ne s'exécute pas dans CodeQuest : essaie ce code sur ton ordinateur (`pip install matplotlib`). Les exercices de cette leçon se font sans exécution.",
      example: {
        run: false,
        code: `import matplotlib.pyplot as plt

mois = ["jan", "fév", "mar", "avr", "mai"]
ventes = [120, 135, 128, 160, 172]

plt.plot(mois, ventes, marker="o")
plt.title("Ventes mensuelles")
plt.xlabel("Mois")
plt.ylabel("Ventes (unités)")
plt.show()`,
        notes: [
          { line: 6, text: "Une courbe, car la question porte sur l'évolution dans le temps ; `marker='o'` marque chaque mois d'un point." },
          { line: 7, text: "Le titre dit ce que montre le graphique." },
          { line: 9, text: "Chaque axe est nommé, avec son unité." },
          { line: 10, text: "`plt.show()` ouvre la fenêtre du graphique." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Tu as mesuré, pour 200 personnes, le nombre d'heures de sommeil et le score à un test de concentration. Tu veux voir si les deux sont liés. Quel graphique choisis-tu ?",
          choices: [
            "Une courbe `plt.plot` des scores, dans l'ordre des personnes",
            "Un nuage de points `plt.scatter`, le sommeil en x et le score en y",
            "Des barres `plt.bar`, une barre par personne",
            "Un histogramme `plt.hist` des heures de sommeil"
          ],
          answer: 1,
          why: {
            0: "Une courbe relie des points dans l'ordre : elle convient au temps qui passe. Ici, l'ordre des personnes n'a aucun sens.",
            2: "200 barres côte à côte, une par personne, ne montrent pas le lien entre deux variables.",
            3: "Un histogramme montre la répartition d'une seule variable ; il ne dit rien du score."
          },
          hint: "Combien de variables numériques veux-tu mettre en relation ?",
          explain: "Pour le lien entre deux variables numériques, chaque personne devient un point (sommeil, score). Si le nuage monte de gauche à droite, les deux vont ensemble ; cela ne prouve pas pour autant que le sommeil cause le score."
        },
        {
          type: 'logic',
          prompt: "Un diagramme en barres compare deux applis : A a une note de 96 sur 100, B une note de 98 sur 100. L'axe vertical commence à 95, si bien que la barre de B paraît trois fois plus haute que celle de A.\n\nEn réalité, de combien de pourcents la note de B dépasse-t-elle celle de A ? Donne un nombre entier (arrondi).",
          answer: '2',
          accept: ['2 %', '2%', '2,1', '2.1', '2,08', '2.08'],
          mistakes: [
            { answer: '200', why: "C'est l'écart que suggèrent les barres (3 contre 1, soit +200 %), parce que l'axe démarre à 95. Les vraies notes sont 96 et 98." },
            { answer: '3', why: "3 est le rapport des hauteurs à l'écran, pas l'écart réel entre les notes." }
          ],
          hint: "Calcule (98 - 96) / 96, puis multiplie par 100.",
          explain: "(98 - 96) / 96 vaut environ 0,021, soit à peu près 2 %. Avec un axe qui part de 95, les barres mesurent 1 et 3 : l'écran suggère un écart de 200 %. Pour des barres, l'axe doit partir de zéro."
        }
      ],
      challenge: {
        type: 'bug',
        run: false,
        prompt: "Ce code doit montrer comment se répartissent les durées de trajet (combien de trajets durent entre 10 et 20 minutes, etc.), mais il trace une ligne brisée sans signification. Clique sur la ligne fautive.",
        code: `import matplotlib.pyplot as plt

durees = [12, 25, 31, 8, 45, 22, 19, 27, 33, 15]   # en minutes
plt.plot(durees)
plt.xlabel("Durée (min)")
plt.ylabel("Nombre de trajets")
plt.show()`,
        bugLine: 4,
        why: "`plt.plot` relie les valeurs dans l'ordre de la liste : l'axe horizontal devient l'ordre de saisie, pas la durée. Pour une répartition, il faut un histogramme, qui range les valeurs dans des tranches et compte chaque tranche.",
        fixes: [
          `plt.hist(durees, bins=4)`,
          `plt.bar(durees, durees)`,
          `plt.scatter(durees, durees)`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "Une barre par valeur, de hauteur égale à la valeur elle-même : ce n'est pas un comptage par tranche.",
          2: "Un nuage de points d'une variable contre elle-même donne une simple diagonale."
        },
        hint: "Les étiquettes des axes décrivent un comptage par tranche de durée : quel graphique fait ce comptage ?",
        explain: "`plt.hist(durees, bins=4)` découpe les durées en 4 tranches de même largeur et dessine une barre par tranche, de hauteur égale au nombre de trajets. Les étiquettes des axes correspondent alors à ce qui est dessiné."
      },
      recap: [
        "Courbe pour une évolution, barres pour comparer des catégories, histogramme pour une répartition, nuage de points pour un lien entre deux variables.",
        "Lis les axes avant la forme : ce qu'ils mesurent, l'unité, le point de départ.",
        "Un axe de barres qui ne part pas de zéro exagère les écarts.",
        "Deux variables qui évoluent ensemble ne prouvent pas une cause."
      ],
      check: {
        type: 'qcm',
        run: false,
        prompt: "Tu veux montrer l'évolution de la température moyenne annuelle de 1990 à 2024. `annees` et `temperatures` sont deux listes de même longueur. Quel code choisis-tu ?",
        choices: [
          "`plt.pie(temperatures, labels=annees)`",
          "`plt.plot(annees, temperatures)`, avec un titre et des axes nommés, unité comprise",
          "`plt.hist(temperatures)`",
          "`plt.bar(annees, temperatures)`, avec un axe vertical qui commence à la température minimale"
        ],
        answer: 1,
        why: {
          0: "Un camembert montre les parts d'un tout. Des températures ne s'additionnent pas en un total qui aurait un sens.",
          2: "Un histogramme perd l'ordre des années : il montre seulement combien d'années ont eu telle température.",
          3: "Des barres dont l'axe ne part pas de zéro grossissent les écarts : le graphique serait trompeur."
        },
        hint: "La question parle d'évolution dans le temps, et un bon graphique n'exagère pas les écarts.",
        explain: "Une courbe montre l'évolution dans le temps ; son axe vertical peut ne pas partir de zéro, car on lit une pente et non une longueur de barre. Le titre et l'unité (°C) rendent le graphique lisible sans explication."
      }
    }]
  });

  CQ.addChapter('data', { id: 'data.c2', title: 'Outils', units: units });
})();
