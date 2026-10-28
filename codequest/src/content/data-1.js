// CodeQuest — parcours « Data science et IA » (data), chapitre 1 « Données » : data.u1 à data.u3.
// Les chapitres suivants sont dans data-2.js à data-5.js (CQ.addChapter).
(function () {
  var units = [];

  // ---------- data.u1 Révisions Python ----------
  units.push({
    id: 'data.u1',
    title: 'Révisions Python',
    summary: "Filtrer, transformer et résumer des données avec des listes, des dictionnaires, des compréhensions et des fonctions.",
    lessons: [{
      id: 'data.u1.l1',
      title: 'Transformer une liste de mesures',
      minutes: 7,
      objective: "Tu sais filtrer, transformer et résumer une liste de données avec des compréhensions et des fonctions.",
      explain: "En data science, l'essentiel du travail consiste à **préparer** les données : en garder une partie, les transformer, puis les résumer par quelques nombres. Si tu as préparé des données avant de les donner à un modèle dans ton projet d'IA, tu as déjà fait ce travail.\n\n" +
        "Trois outils Python suffisent pour commencer :\n\n" +
        "- la compréhension de liste `[f(x) for x in donnees if condition]` filtre et transforme en une ligne ;\n" +
        "- la compréhension de dictionnaire `{cle: valeur for ...}` associe un résultat à chaque élément ;\n" +
        "- une fonction (`def moyenne(valeurs)`) donne un nom à un calcul pour le réutiliser.\n\n" +
        "Une donnée manquante est souvent notée `None` : retire-la **avant** de calculer, sinon `sum` lève une erreur.",
      example: {
        code: `temperatures = [12.5, 14.0, None, 17.5, 21.0, None, 19.5]

def moyenne(valeurs):
    return sum(valeurs) / len(valeurs)

mesures = [t for t in temperatures if t is not None]
fahrenheit = [round(t * 9 / 5 + 32, 1) for t in mesures]
print(len(mesures), "mesures valides")
print(fahrenheit)
print(f"Moyenne : {moyenne(mesures):.1f} °C")`,
        output: `5 mesures valides
[54.5, 57.2, 63.5, 69.8, 67.1]
Moyenne : 16.9 °C`,
        notes: [
          { line: 3, text: "La fonction donne un nom au calcul : on pourra la réutiliser sur n'importe quelle liste de nombres." },
          { line: 6, text: "Filtre : on ne garde que les valeurs qui ne sont pas `None`." },
          { line: 7, text: "Transformation : chaque température est convertie en degrés Fahrenheit, arrondie à 0,1." },
          { line: 10, text: "Résumé : `:.1f` affiche la moyenne avec une seule décimale." }
        ]
      },
      exercises: [
        {
          type: 'predict',
          prompt: "Qu'affiche ce programme ?",
          code: `ventes = {"lundi": 120, "mardi": 0, "mercredi": 95, "jeudi": 140}
bons_jours = [j for j, v in ventes.items() if v >= 100]
print(bons_jours)
print(sum(ventes.values()) // len(ventes))`,
          answer: `['lundi', 'jeudi']
88`,
          mistakes: [
            { answer: `['lundi', 'jeudi']
88.75`, why: "`//` est la division entière : elle garde seulement la partie entière de 355 / 4, soit 88. La division décimale s'écrit `/`." },
            { answer: `['lundi', 'mercredi', 'jeudi']
88`, why: "Mercredi a 95 ventes : `95 >= 100` est faux, ce jour est donc filtré." }
          ],
          hint: "Parcours le dictionnaire paire par paire, puis regarde bien l'opérateur de division.",
          explain: "`ventes.items()` donne les paires (jour, valeur) ; la condition garde lundi (120) et jeudi (140). La somme des ventes vaut 355 et `355 // 4` donne 88 : la division entière ignore les décimales."
        },
        {
          type: 'fill',
          prompt: "Complète pour obtenir un dictionnaire qui associe chaque nom à sa longueur.",
          code: `noms = ["Ada", "Linus", "Grace"]
longueurs = {___: len(nom) for nom in ___}
print(longueurs)`,
          blanks: [
            { answers: ['nom'], options: ['nom', 'len(nom)', 'noms'],
              why: { 'len(nom)': "La clé doit être le nom lui-même ; la longueur est la valeur, déjà écrite après les deux-points.", 'noms': "`noms` est la liste entière : une liste ne peut pas servir de clé de dictionnaire." } },
            { answers: ['noms'], options: ['noms', 'nom', 'longueurs'],
              why: { 'nom': "On parcourt la liste `noms` ; `nom` est la variable qui prend chaque valeur à tour de rôle.", 'longueurs': "`longueurs` n'existe pas encore : c'est le dictionnaire qu'on est en train de construire." } }
          ],
          output: `{'Ada': 3, 'Linus': 5, 'Grace': 5}`,
          hint: "Une compréhension de dictionnaire s'écrit `{cle: valeur for variable in liste}`.",
          explain: "Pour chaque `nom` de la liste `noms`, on crée l'entrée `nom: len(nom)`. On obtient en une ligne ce qu'une boucle `for` et trois affectations auraient fait."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "La normalisation min-max ramène des valeurs entre 0 et 1 avec `(x - mini) / (maxi - mini)`. Beaucoup de modèles d'IA apprennent mieux quand toutes les variables sont à la même échelle.\n\n" +
          "Écris `normaliser(valeurs)` qui renvoie la liste normalisée, dans le même ordre. Si toutes les valeurs sont égales, renvoie une liste de `0.0` de même longueur (sinon on diviserait par zéro).",
        starter: `def normaliser(valeurs):
    # ton code ici
    return []
`,
        solution: `def normaliser(valeurs):
    mini = min(valeurs)
    maxi = max(valeurs)
    if maxi == mini:
        return [0.0 for v in valeurs]
    return [(v - mini) / (maxi - mini) for v in valeurs]
`,
        tests: [
          { code: `assert normaliser([10, 20, 30]) == [0.0, 0.5, 1.0]`, label: "normaliser([10, 20, 30]) renvoie [0.0, 0.5, 1.0]" },
          { code: `r = normaliser([4, 2, 8])
assert abs(r[0] - 1 / 3) < 1e-9 and r[1] == 0.0 and r[2] == 1.0`, label: "normaliser([4, 2, 8]) garde l'ordre des valeurs" },
          { code: `assert normaliser([5, 5, 5]) == [0.0, 0.0, 0.0]`, label: "des valeurs toutes égales donnent des 0.0" }
        ],
        hint: "Calcule `min` et `max` une seule fois, traite le cas où ils sont égaux, puis utilise une compréhension.",
        explain: "La plus petite valeur devient 0, la plus grande 1, et les autres se placent entre les deux en proportion. Le test `maxi == mini` évite une `ZeroDivisionError`. Tu retrouveras cette mise à l'échelle avant les k plus proches voisins."
      },
      recap: [
        "`[f(x) for x in liste if condition]` filtre et transforme en une seule ligne.",
        "`{cle: valeur for ...}` construit un dictionnaire à partir d'une liste.",
        "Retire les valeurs manquantes (`None`) avant de calculer une somme ou une moyenne.",
        "Une fonction nomme un calcul pour le réutiliser sur d'autres données."
      ],
      check: {
        type: 'code',
        prompt: "Écris `resume(notes)` qui ignore les `None` et renvoie un dictionnaire `{'nb': ..., 'moyenne': ..., 'max': ...}` calculé sur les notes restantes. S'il ne reste aucune note, `'moyenne'` et `'max'` valent `None`.",
        starter: `def resume(notes):
    valides = notes
    return {'nb': len(valides), 'moyenne': None, 'max': None}
`,
        solution: `def resume(notes):
    valides = [n for n in notes if n is not None]
    if not valides:
        return {'nb': 0, 'moyenne': None, 'max': None}
    return {'nb': len(valides), 'moyenne': sum(valides) / len(valides), 'max': max(valides)}
`,
        tests: [
          { code: `assert resume([12, None, 15, 9]) == {'nb': 3, 'moyenne': 12.0, 'max': 15}`, label: "resume([12, None, 15, 9]) donne 3 notes, moyenne 12.0, max 15" },
          { code: `assert resume([None, None]) == {'nb': 0, 'moyenne': None, 'max': None}`, label: "sans note valide : nb 0, moyenne et max à None" },
          { code: `r = resume([7.5, 10])
assert r['nb'] == 2 and abs(r['moyenne'] - 8.75) < 1e-9 and r['max'] == 10`, label: "resume([7.5, 10]) donne une moyenne de 8.75" }
        ],
        hint: "Commence par construire la liste des notes valides, puis traite le cas où elle est vide.",
        explain: "Le filtre `n is not None` retire les manquants ; `if not valides` gère la liste vide avant toute division. Ce schéma (filtrer, vérifier, résumer) revient dans presque toutes les analyses."
      }
    }]
  });

  // ---------- data.u2 Données structurées ----------
  units.push({
    id: 'data.u2',
    title: 'Données structurées',
    summary: "Représenter un tableau de données en lignes ou en colonnes, et vérifier le type de chaque colonne.",
    lessons: [{
      id: 'data.u2.l1',
      title: 'Lignes, colonnes et types',
      minutes: 7,
      objective: "Tu sais représenter un tableau en liste de dictionnaires, le convertir en colonnes et choisir le bon type pour chaque colonne.",
      explain: "Un jeu de données est un **tableau** : chaque ligne est une observation (un film, une vente, une mesure), chaque colonne une variable (titre, prix, date).\n\n" +
        "En Python pur, deux formats existent :\n\n" +
        "- **en lignes** : une liste de dictionnaires, un par observation. Pratique pour lire ou ajouter une observation ;\n" +
        "- **en colonnes** : un dictionnaire de listes, une par variable. Pratique pour calculer sur une variable (la moyenne des notes). C'est ainsi que pandas range ses données.\n\n" +
        "Chaque colonne a un **type** : nombre (une quantité qu'on peut additionner), catégorie (ville, genre), booléen, date. Attention : un nombre lu dans un fichier arrive souvent sous forme de texte (`'17'`), et un code postal s'écrit avec des chiffres mais reste une catégorie.",
      example: {
        code: `films = [
    {"titre": "Alien", "annee": 1979, "note": 8.5},
    {"titre": "Matrix", "annee": 1999, "note": 8.7},
    {"titre": "Her", "annee": 2013, "note": 8.0},
]
colonnes = {cle: [f[cle] for f in films] for cle in films[0]}
print(colonnes["titre"])
print(colonnes["annee"])
print(round(sum(colonnes["note"]) / len(films), 2))`,
        output: `['Alien', 'Matrix', 'Her']
[1979, 1999, 2013]
8.4`,
        notes: [
          { line: 2, text: "Format en lignes : un dictionnaire par film, avec les mêmes clés partout." },
          { line: 6, text: "Passage en colonnes : pour chaque clé, on rassemble la valeur de chaque ligne." },
          { line: 9, text: "En colonnes, la moyenne d'une variable se calcule directement sur sa liste." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Un fichier de clients contient une colonne `code_postal` avec des valeurs comme `'69001'` ou `'01000'`. Que fais-tu de cette colonne ?",
          choices: [
            "La convertir en `int` pour pouvoir calculer sa moyenne.",
            "La garder en texte : c'est une catégorie, pas une quantité.",
            "La convertir en `float` pour garder les décimales.",
            "La supprimer : une colonne de chiffres stockés en texte est forcément une erreur."
          ],
          answer: 1,
          why: {
            0: "Une moyenne de codes postaux n'a aucun sens, et `int('01000')` donne 1000 : le zéro du début disparaît.",
            2: "Un code postal n'a pas de décimales, et le zéro du début serait perdu de la même façon.",
            3: "La colonne est utile, par exemple pour regrouper les clients par zone : il suffit de la traiter comme une catégorie."
          },
          hint: "Demande-toi si additionner deux codes postaux aurait un sens.",
          explain: "Le bon type dépend du sens de la variable, pas des caractères qu'elle contient. Un code postal sert à regrouper ou à filtrer : c'est une catégorie. Le garder en texte conserve aussi le zéro du début."
        },
        {
          type: 'predict',
          prompt: "Ces ventes ont été lues dans un fichier. Qu'affiche ce programme ?",
          code: `ventes = [
    {"produit": "stylo", "qte": "3"},
    {"produit": "cahier", "qte": "2"},
    {"produit": "stylo", "qte": "5"},
]
total = {}
for v in ventes:
    total[v["produit"]] = total.get(v["produit"], 0) + int(v["qte"])
print(total)
print(ventes[0]["qte"] * 2)`,
          answer: `{'stylo': 8, 'cahier': 2}
33`,
          mistakes: [
            { answer: `{'stylo': 8, 'cahier': 2}
6`, why: "`ventes[0]['qte']` vaut le texte `'3'`, pas le nombre 3. Multiplier un texte par 2 le répète : `'33'`, que `print` affiche sans guillemets." },
            { answer: `{'stylo': '35', 'cahier': '2'}
33`, why: "Dans la boucle, `int(...)` convertit chaque quantité : les additions se font bien sur des nombres." }
          ],
          hint: "Repère où les quantités sont converties avec `int`, et où elles ne le sont pas.",
          explain: "La boucle additionne par produit les quantités converties : stylo 3 + 5 = 8. La dernière ligne utilise la valeur brute `'3'` : c'est du texte, et `'3' * 2` donne `'33'`. C'est l'erreur de type la plus courante avec des données lues dans un fichier."
        }
      ],
      challenge: {
        type: 'order',
        prompt: "Remets dans l'ordre la fonction `en_lignes`, qui fait le chemin inverse de l'exemple : elle transforme un tableau en colonnes en liste de dictionnaires.",
        lines: [
          `def en_lignes(colonnes):`,
          `    cles = list(colonnes)`,
          `    n = len(colonnes[cles[0]])`,
          `    return [{cle: colonnes[cle][i] for cle in cles} for i in range(n)]`,
          `print(en_lignes({"x": [1, 2], "y": [3, 4]}))`
        ],
        output: `[{'x': 1, 'y': 3}, {'x': 2, 'y': 4}]`,
        hint: "Il faut connaître les clés avant de pouvoir mesurer la longueur d'une colonne.",
        explain: "On récupère les noms de colonnes, puis le nombre de lignes (la longueur d'une colonne). La ligne numéro `i` est un dictionnaire qui prend la `i`-ième valeur de chaque colonne."
      },
      recap: [
        "En lignes : une liste de dictionnaires, un par observation.",
        "En colonnes : un dictionnaire de listes, une par variable (le format de pandas).",
        "Le type d'une colonne dépend de son sens : un code postal reste une catégorie.",
        "Les valeurs lues dans un fichier sont du texte : convertis-les avant de calculer."
      ],
      check: {
        type: 'code',
        prompt: "Des lignes lues dans un fichier ne contiennent que du texte. Écris `colonne_numerique(lignes, cle)` qui renvoie la liste des valeurs de la colonne `cle` converties en `float`, en ignorant les cases vides (`''` ou seulement des espaces).",
        starter: `def colonne_numerique(lignes, cle):
    return [ligne[cle] for ligne in lignes]
`,
        solution: `def colonne_numerique(lignes, cle):
    valeurs = []
    for ligne in lignes:
        texte = ligne[cle].strip()
        if texte != "":
            valeurs.append(float(texte))
    return valeurs
`,
        tests: [
          { code: `data = [{'prix': '2.5'}, {'prix': ''}, {'prix': ' 4 '}]
assert colonne_numerique(data, 'prix') == [2.5, 4.0]`, label: "les cases vides sont ignorées et les nombres convertis" },
          { code: `data = [{'a': '1', 'b': 'x'}, {'a': '3', 'b': 'y'}]
assert colonne_numerique(data, 'a') == [1.0, 3.0]`, label: "colonne_numerique(data, 'a') renvoie [1.0, 3.0]" },
          { code: `r = colonne_numerique([{'v': '10'}], 'v')
assert isinstance(r[0], float)`, label: "les valeurs renvoyées sont des float" }
        ],
        hint: "`strip()` enlève les espaces autour d'un texte : une case vide devient alors `''`.",
        explain: "On parcourt les lignes, on extrait la case de la colonne, on la nettoie avec `strip()` et on ne convertit que si elle n'est pas vide. Le résultat est une vraie colonne numérique, prête pour une moyenne."
      }
    }]
  });

  // ---------- data.u3 CSV et JSON ----------
  units.push({
    id: 'data.u3',
    title: 'CSV et JSON',
    summary: "Lire et écrire des fichiers CSV et JSON avec les modules csv et json, et convertir ce qu'ils contiennent.",
    lessons: [{
      id: 'data.u3.l1',
      title: 'Lire et écrire des fichiers de données',
      minutes: 8,
      objective: "Tu sais lire un fichier CSV avec `csv.DictReader` et un fichier JSON avec `json.loads`, puis convertir les valeurs lues.",
      explain: "Deux formats de fichiers dominent pour échanger des données.\n\n" +
        "**CSV** : du texte, une ligne par observation, des valeurs séparées par des virgules et une première ligne d'en-têtes. `csv.DictReader(f)` transforme chaque ligne en dictionnaire `{en-tête: valeur}`. Toutes les valeurs sont du **texte** : à toi de les convertir.\n\n" +
        "**JSON** : du texte qui décrit des dictionnaires et des listes imbriqués, comme en Python. Il conserve les types simples (nombres, `true`/`false`, et `null` qui devient `None`). On lit le texte du fichier, puis `json.loads(texte)` le transforme en objets Python ; `json.dumps(objet)` fait l'inverse. Sur ton ordinateur, `json.load(f)` et `json.dump(objet, f)` font la même chose directement avec le fichier.\n\n" +
        "Dans CodeQuest, les fichiers des exercices sont virtuels : ils n'existent que le temps de l'exécution.",
      example: {
        code: `import csv

with open("meteo.csv") as f:
    lignes = list(csv.DictReader(f))

print(lignes[0])
pluie = [float(l["pluie_mm"]) for l in lignes]
print(f"Total : {sum(pluie)} mm sur {len(lignes)} jours")`,
        files: { 'meteo.csv': "jour,temp,pluie_mm\nlun,14,0.0\nmar,12,3.5\nmer,15,1.5\n" },
        output: `{'jour': 'lun', 'temp': '14', 'pluie_mm': '0.0'}
Total : 5.0 mm sur 3 jours`,
        notes: [
          { line: 4, text: "`list(...)` lit toutes les lignes d'un coup : chacune devient un dictionnaire dont les clés sont les en-têtes." },
          { line: 6, text: "Les valeurs sont des textes, même `'14'` : le CSV ne garde aucun type." },
          { line: 7, text: "On convertit avec `float` avant de calculer la somme." }
        ]
      },
      exercises: [
        {
          type: 'order',
          prompt: "Remets dans l'ordre ce programme qui lit le fichier `joueurs.json` et affiche le meilleur joueur. L'import vient en premier.",
          lines: [
            `import json`,
            `with open("joueurs.json") as f:`,
            `    texte = f.read()`,
            `joueurs = json.loads(texte)`,
            `meilleur = max(joueurs, key=lambda j: j["score"])`,
            `print(meilleur["pseudo"], meilleur["score"])`
          ],
          files: { 'joueurs.json': '[{"pseudo": "ada", "score": 42}, {"pseudo": "linus", "score": 57}, {"pseudo": "grace", "score": 49}]' },
          output: `linus 57`,
          hint: "On ne peut décoder le texte qu'après l'avoir lu, et chercher le maximum qu'après l'avoir décodé.",
          explain: "On ouvre le fichier, on lit son texte, `json.loads` le transforme en liste de dictionnaires, puis `max` avec `key` compare les scores. Contrairement au CSV, le score est déjà un nombre : JSON conserve les types."
        },
        {
          type: 'fill',
          prompt: "Complète ce programme qui écrit un fichier CSV puis le relit.",
          code: `import csv

scores = [["pseudo", "score"], ["ada", 42], ["linus", 57]]
with open("scores.csv", "___") as f:
    ecrivain = csv.___(f)
    for ligne in scores:
        ecrivain.writerow(ligne)

with open("scores.csv") as f:
    for ligne in csv.reader(f):
        print(ligne)`,
          blanks: [
            { answers: ['w'], options: ['w', 'r', 'a'],
              why: { 'r': "`'r'` ouvre en lecture seule : impossible d'écrire.", 'a': "`'a'` ajoute à la fin d'un fichier existant ; ici on veut créer le fichier, ou le remplacer s'il existe." } },
            { answers: ['writer'], options: ['writer', 'reader', 'DictReader'],
              why: { 'reader': "`csv.reader` sert à lire ; pour écrire, il faut `csv.writer`.", 'DictReader': "`DictReader` lit des lignes sous forme de dictionnaires, il n'écrit rien." } }
          ],
          output: `['pseudo', 'score']
['ada', '42']
['linus', '57']`,
          hint: "Il faut ouvrir le fichier en écriture, puis créer l'objet qui écrit des lignes CSV.",
          explain: "Le mode `'w'` crée le fichier et `csv.writer` écrit chaque liste comme une ligne aux valeurs séparées par des virgules. À la relecture, 42 revient sous forme de texte `'42'` : le CSV ne garde aucun type. Sur ton ordinateur, ajoute `newline=''` à `open` quand tu écris un CSV, pour éviter des lignes vides sous Windows."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "Le fichier `ventes.csv` contient les colonnes `produit`, `prix` et `quantite`. Certaines quantités sont vides : ignore ces lignes.\n\nÉcris `chiffre_affaires(nom_fichier)` qui renvoie la somme des `prix × quantite`, sous forme de `float`.",
        files: { 'ventes.csv': "produit,prix,quantite\nstylo,1.5,10\ncahier,3.2,\nsac,24.9,2\ngomme,0.8,5\n" },
        starter: `import csv

def chiffre_affaires(nom_fichier):
    total = 0.0
    # ton code ici
    return total
`,
        solution: `import csv

def chiffre_affaires(nom_fichier):
    total = 0.0
    with open(nom_fichier) as f:
        for ligne in csv.DictReader(f):
            if ligne["quantite"].strip() == "":
                continue
            total += float(ligne["prix"]) * int(ligne["quantite"])
    return total
`,
        tests: [
          { code: `assert abs(chiffre_affaires('ventes.csv') - 68.8) < 1e-9`, label: "chiffre_affaires('ventes.csv') renvoie 68.8" },
          { code: `with open('mini.csv', 'w') as f:
    f.write('produit,prix,quantite\\na,2,3\\nb,1.5,\\n')
assert abs(chiffre_affaires('mini.csv') - 6.0) < 1e-9`, label: "fonctionne sur un autre fichier (la ligne sans quantité est ignorée)" }
        ],
        hint: "Avec `csv.DictReader`, chaque ligne est un dictionnaire de textes : teste la case vide avant de convertir.",
        explain: "On ouvre le fichier reçu en paramètre, on parcourt les lignes en dictionnaires, on saute celles dont la quantité est vide et on additionne `prix × quantite` après conversion. Le cahier sans quantité est ignoré : 15 + 49,8 + 4 = 68,8."
      },
      recap: [
        "`csv.DictReader(f)` donne un dictionnaire par ligne, avec des valeurs en texte.",
        "`json.loads(texte)` transforme du JSON en listes et dictionnaires Python ; `json.dumps` fait l'inverse.",
        "Le JSON conserve les nombres et les booléens, le CSV non.",
        "`with open(...)` referme le fichier automatiquement à la fin du bloc."
      ],
      check: {
        type: 'code',
        prompt: "Le fichier `capteurs.json` contient une liste de capteurs, chacun avec un `id` et une liste de `mesures` (parfois vide).\n\nÉcris `moyennes(nom_fichier)` qui renvoie un dictionnaire `{id: moyenne des mesures}`, sans les capteurs qui n'ont aucune mesure. Lis le texte du fichier, puis utilise `json.loads`.",
        files: { 'capteurs.json': '[{"id": "A", "mesures": [21.5, 22.0]}, {"id": "B", "mesures": []}, {"id": "C", "mesures": [19.0, 18.5, 20.0]}]' },
        starter: `import json

def moyennes(nom_fichier):
    # ton code ici
    return {}
`,
        solution: `import json

def moyennes(nom_fichier):
    with open(nom_fichier) as f:
        capteurs = json.loads(f.read())
    resultat = {}
    for c in capteurs:
        if c["mesures"]:
            resultat[c["id"]] = sum(c["mesures"]) / len(c["mesures"])
    return resultat
`,
        tests: [
          { code: `assert sorted(moyennes('capteurs.json')) == ['A', 'C']`, label: "le capteur B, sans mesure, est exclu" },
          { code: `r = moyennes('capteurs.json')
assert abs(r['A'] - 21.75) < 1e-9 and abs(r['C'] - 57.5 / 3) < 1e-9`, label: "A vaut 21.75 et C environ 19.17" },
          { code: `with open('deux.json', 'w') as f:
    f.write('[{"id": "Z", "mesures": [1, 2, 3, 4]}]')
assert moyennes('deux.json') == {'Z': 2.5}`, label: "fonctionne sur un autre fichier" }
        ],
        hint: "Une liste vide est considérée comme fausse dans un `if` : c'est pratique pour sauter les capteurs sans mesure.",
        explain: "`json.loads` redonne directement des listes de nombres : aucune conversion n'est nécessaire, contrairement au CSV. Le test `if c['mesures']` écarte les listes vides avant la division."
      }
    }]
  });

  CQ.addTrack({
    id: 'data',
    title: 'Data science et IA',
    lang: 'python',
    summary: "Analyser des données et comprendre l'IA en codant toi-même les algorithmes, puis en découvrant les bibliothèques qui les font à grande échelle.",
    why: "Les données sont partout : ventes, capteurs, textes, images. Savoir les nettoyer, les analyser et comprendre comment un modèle apprend te permet de mener tes propres projets d'IA et de ne pas croire n'importe quel chiffre.",
    requires: ['py.u9'],
    chapters: [{ id: 'data.c1', title: 'Données', units: units }]
  });
})();
