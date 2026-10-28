// Katas de pratique de CodeQuest : 36 exercices de code autonomes.
// unit : unité à avoir terminée avant de pouvoir faire le kata (prérequis).
// Avant py.u9 (fonctions), les katas Python sont de petits programmes vérifiés par leurs variables et leur sortie.
CQ.addKatas([
  // =====================================================================
  // Python (20)
  // =====================================================================
  {
    id: 'kata.py.temperatures', title: 'Conversion de températures', lang: 'python', difficulty: 1, unit: 'py.u3',
    ex: {
      type: 'code',
      prompt: `Le programme lit une température en degrés Celsius, éventuellement avec des décimales. Calcule :

- \`fahrenheit\` : la température en degrés Fahrenheit, avec F = C × 9 / 5 + 32 ;
- \`kelvin\` : la température en kelvins, avec K = C + 273.15.

Affiche ensuite une seule ligne, avec 1 décimale pour °C et °F et 2 décimales pour K. Ici, la personne tape \`21.5\`, et le programme doit afficher :

\`21.5 °C = 70.7 °F = 294.65 K\``,
      stdin: '21.5\n',
      starter: `celsius = input()
fahrenheit = celsius * 9 / 5 + 32
kelvin = 0
print(celsius, "°C =", fahrenheit, "°F =", kelvin, "K")
`,
      solution: `celsius = float(input())
fahrenheit = celsius * 9 / 5 + 32
kelvin = celsius + 273.15
print(f"{celsius:.1f} °C = {fahrenheit:.1f} °F = {kelvin:.2f} K")
`,
      tests: [
        { code: 'assert isinstance(celsius, float)', label: 'celsius est converti en nombre décimal (float)' },
        { code: 'assert abs(fahrenheit - 70.7) < 1e-9', label: 'fahrenheit vaut 70.7 pour 21.5 °C' },
        { code: 'assert abs(kelvin - 294.65) < 1e-9', label: 'kelvin vaut 294.65 pour 21.5 °C' }
      ],
      expectOutput: '21.5 °C = 70.7 °F = 294.65 K',
      hint: '`input()` renvoie une chaîne : convertis-la avant tout calcul. Pour les décimales affichées, utilise une f-string avec `:.1f` ou `:.2f`.',
      explain: '`float(input())` transforme la saisie en nombre décimal ; `int` échouerait sur `21.5`. Les formules s’écrivent telles quelles, car Python respecte les priorités : multiplication et division avant l’addition. Les f-strings `{x:.1f}` et `{x:.2f}` arrondissent seulement l’affichage, sans changer la valeur des variables.'
    }
  },
  {
    id: 'kata.py.bissextile', title: 'Année bissextile', lang: 'python', difficulty: 1, unit: 'py.u4',
    ex: {
      type: 'code',
      prompt: `Une année est bissextile si elle est divisible par 4, **sauf** si elle est divisible par 100… **sauf** si elle est aussi divisible par 400. Ainsi 2024 et 2000 sont bissextiles, mais 2023 et 1900 ne le sont pas.

Le programme lit une année. Range dans \`bissextile\` un booléen (\`True\` ou \`False\`), puis affiche par exemple \`2024 est bissextile\` ou \`1900 n'est pas bissextile\`.

Ici, la personne tape \`1900\`. Corrige le programme.`,
      stdin: '1900\n',
      starter: `annee = int(input())
bissextile = annee % 4 == 0
if bissextile:
    print(annee, "est bissextile")
else:
    print(annee, "n'est pas bissextile")
`,
      solution: `annee = int(input())
bissextile = (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0
if bissextile:
    print(annee, "est bissextile")
else:
    print(annee, "n'est pas bissextile")
`,
      tests: [
        { code: 'assert annee == 1900', label: 'annee contient l’entier 1900' },
        { code: 'assert isinstance(bissextile, bool)', label: 'bissextile est un booléen' },
        { code: 'assert bissextile is False', label: '1900 n’est pas bissextile (divisible par 100 mais pas par 400)' }
      ],
      expectOutput: "1900 n'est pas bissextile",
      hint: 'Traduis la règle mot à mot : « divisible par 4 et pas par 100 », ou « divisible par 400 ». Teste ensuite mentalement 2000, 1900 et 2024.',
      explain: 'La règle se traduit directement : `(annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0`. Les parenthèses rendent la lecture claire (`and` passe de toute façon avant `or`). 1900 est divisible par 4 et par 100, mais pas par 400 : il n’est pas bissextile. Ranger la condition dans une variable booléenne rend le `if` qui suit très lisible.'
    }
  },
  {
    id: 'kata.py.fizzbuzz', title: 'FizzBuzz revisité', lang: 'python', difficulty: 1, unit: 'py.u5',
    ex: {
      type: 'code',
      prompt: `Pour chaque nombre de 1 à 35, la réponse est :

- \`Fizz\` si le nombre est multiple de 3, \`Buzz\` s’il est multiple de 5, \`Bang\` s’il est multiple de 7 ;
- si plusieurs règles s’appliquent, les mots se collent dans cet ordre : 15 donne \`FizzBuzz\`, 21 donne \`FizzBang\`, 35 donne \`BuzzBang\` ;
- sinon, le nombre lui-même.

Construis dans la chaîne \`ligne\` toutes les réponses séparées par un espace, puis affiche \`ligne\`. Compte aussi dans \`remplaces\` combien de nombres ont été remplacés par au moins un mot.

Début attendu : \`1 2 Fizz 4 Buzz Fizz Bang 8 Fizz Buzz 11 Fizz 13 Bang FizzBuzz …\``,
      starter: `ligne = ""
remplaces = 0
for n in range(1, 36):
    if n % 3 == 0:
        ligne += "Fizz "
    elif n % 5 == 0:
        ligne += "Buzz "
    else:
        ligne += str(n) + " "
print(ligne)
`,
      solution: `ligne = ""
remplaces = 0
for n in range(1, 36):
    mot = ""
    if n % 3 == 0:
        mot += "Fizz"
    if n % 5 == 0:
        mot += "Buzz"
    if n % 7 == 0:
        mot += "Bang"
    if mot == "":
        mot = str(n)
    else:
        remplaces += 1
    ligne += mot + " "
print(ligne)
`,
      tests: [
        { code: 'assert ligne.split()[:5] == ["1", "2", "Fizz", "4", "Buzz"]', label: 'Les 5 premières réponses : 1 2 Fizz 4 Buzz' },
        { code: 'assert ligne.split()[6] == "Bang" and ligne.split()[13] == "Bang"', label: '7 et 14 donnent Bang' },
        { code: 'assert ligne.split()[14] == "FizzBuzz" and ligne.split()[20] == "FizzBang"', label: '15 donne FizzBuzz et 21 donne FizzBang' },
        { code: 'assert ligne.split()[34] == "BuzzBang" and len(ligne.split()) == 35', label: '35 donne BuzzBang, et il y a 35 réponses' },
        { code: 'assert remplaces == 19', label: 'remplaces vaut 19' }
      ],
      expectOutput: '1 2 Fizz 4 Buzz Fizz Bang 8 Fizz Buzz 11 Fizz 13 Bang FizzBuzz 16 17 Fizz 19 Buzz FizzBang 22 23 Fizz Buzz 26 Fizz Bang 29 FizzBuzz 31 32 Fizz 34 BuzzBang',
      hint: 'Au lieu d’enchaîner des `elif`, construis le mot petit à petit : trois `if` indépendants qui ajoutent chacun leur morceau. Si le mot est resté vide, utilise le nombre.',
      explain: 'Avec des `elif`, une seule règle peut s’appliquer : 15 donnerait seulement `Fizz`. Trois `if` indépendants qui complètent `mot` gèrent toutes les combinaisons, et ajouter une quatrième règle ne demande qu’un `if` de plus. Un mot vide signifie « aucune règle » : on prend alors `str(n)`, sinon on compte un remplacement.'
    }
  },
  {
    id: 'kata.py.cesar', title: 'Chiffre de César', lang: 'python', difficulty: 2, unit: 'py.u6',
    ex: {
      type: 'code',
      prompt: `Le chiffre de César décale chaque lettre de l’alphabet d’un nombre fixe de rangs. Avec un décalage de 3, \`a\` devient \`d\`, \`b\` devient \`e\`… et en fin d’alphabet on repart au début : \`x\` devient \`a\`, \`y\` devient \`b\`, \`z\` devient \`c\`.

À partir de \`message\` (en minuscules, sans accents) et de \`decalage\`, construis la chaîne \`code\` :

- chaque lettre de \`a\` à \`z\` est décalée ;
- les autres caractères (espaces, chiffres, ponctuation) restent tels quels.

Avec le message de départ \`"zut, 3 kiwis !"\` et un décalage de 3, on obtient \`"cxw, 3 nlzlv !"\`.

Utile : \`ord("a")\` vaut 97 et \`chr(97)\` vaut \`"a"\`.`,
      starter: `message = "zut, 3 kiwis !"
decalage = 3
code = ""
for lettre in message:
    code += chr(ord(lettre) + decalage)
print(code)
`,
      solution: `message = "zut, 3 kiwis !"
decalage = 3
code = ""
for lettre in message:
    if "a" <= lettre <= "z":
        position = ord(lettre) - ord("a")
        code += chr(ord("a") + (position + decalage) % 26)
    else:
        code += lettre
print(code)
`,
      tests: [
        { code: 'assert code[0] == "c"', label: 'z devient c (retour au début de l’alphabet)' },
        { code: 'assert code[3:7] == ", 3 "', label: 'Espaces, chiffres et ponctuation sont inchangés' },
        { code: 'assert len(code) == len(message)', label: 'Le message codé a la même longueur que l’original' },
        { code: 'assert code == "cxw, 3 nlzlv !"', label: 'Le message codé est « cxw, 3 nlzlv ! »' }
      ],
      expectOutput: 'cxw, 3 nlzlv !',
      hint: 'Pour une lettre, calcule sa position de 0 à 25 avec `ord(lettre) - ord("a")`, ajoute le décalage, puis ramène le résultat entre 0 et 25 avec `% 26`.',
      explain: 'Passer par la position (0 pour `a`, 25 pour `z`) rend le retour au début très simple : `(position + decalage) % 26` reste toujours entre 0 et 25, puis `chr(ord("a") + ...)` reconvertit en lettre. Le test `"a" <= lettre <= "z"` laisse passer les autres caractères sans les toucher. Bonus : avec un décalage de -3, le même code déchiffre le message, car `%` renvoie toujours un résultat positif en Python.'
    }
  },
  {
    id: 'kata.py.statistiques', title: 'Statistiques simples', lang: 'python', difficulty: 2, unit: 'py.u7',
    ex: {
      type: 'code',
      prompt: `À partir de la liste \`notes\`, calcule sans le module \`statistics\` :

- \`moyenne\` : la moyenne, arrondie à 2 décimales avec \`round\` ;
- \`mediane\` : la valeur du milieu de la liste triée ; si le nombre de notes est pair, la moyenne des deux valeurs du milieu ;
- \`etendue\` : la plus grande note moins la plus petite ;
- \`au_dessus\` : le nombre de notes strictement supérieures à la moyenne.

La liste \`notes\` ne doit pas être modifiée : elle garde son ordre d’origine.`,
      starter: `notes = [12, 15.5, 8, 17, 9.5, 14]
moyenne = sum(notes) / len(notes)
notes.sort()
mediane = notes[len(notes) // 2]
etendue = 0
au_dessus = 0
`,
      solution: `notes = [12, 15.5, 8, 17, 9.5, 14]
moyenne = round(sum(notes) / len(notes), 2)
triees = sorted(notes)
milieu = len(triees) // 2
if len(triees) % 2 == 0:
    mediane = (triees[milieu - 1] + triees[milieu]) / 2
else:
    mediane = triees[milieu]
etendue = max(notes) - min(notes)
au_dessus = 0
for note in notes:
    if note > moyenne:
        au_dessus += 1
print(moyenne, mediane, etendue, au_dessus)
`,
      tests: [
        { code: 'assert moyenne == 12.67', label: 'moyenne vaut 12.67' },
        { code: 'assert mediane == 13', label: 'mediane vaut 13 (moyenne de 12 et 14, car il y a 6 notes)' },
        { code: 'assert etendue == 9', label: 'etendue vaut 9' },
        { code: 'assert au_dessus == 3', label: 'au_dessus vaut 3' },
        { code: 'assert notes == [12, 15.5, 8, 17, 9.5, 14]', label: 'notes n’est pas modifiée' }
      ],
      hint: '`sorted(notes)` renvoie une copie triée sans toucher à `notes`. Pour la médiane, distingue le cas d’un nombre pair de notes avec `len(...) % 2`.',
      explain: '`sorted` crée une nouvelle liste triée, alors que `notes.sort()` modifierait l’originale. Avec 6 notes, les deux valeurs du milieu sont aux indices 2 et 3 (`milieu - 1` et `milieu`), d’où (12 + 14) / 2 = 13. `max` et `min` donnent l’étendue en une ligne, et une boucle avec un compteur trouve les notes au-dessus de la moyenne.'
    }
  },
  {
    id: 'kata.py.transposee', title: 'Matrice transposée', lang: 'python', difficulty: 2, unit: 'py.u7',
    ex: {
      type: 'code',
      prompt: `Ici, une matrice est une liste de lignes, et chaque ligne une liste de nombres. Sa **transposée** échange lignes et colonnes : l’élément ligne i, colonne j se retrouve ligne j, colonne i.

Construis \`transposee\` à partir de \`matrice\`, sans modifier \`matrice\`.

Exemple : \`[[1, 2, 3], [4, 5, 6]]\` (2 lignes, 3 colonnes) donne \`[[1, 4], [2, 5], [3, 6]]\` (3 lignes, 2 colonnes).

En data science, transposer sert par exemple à passer d’une liste d’exemples à une liste de colonnes (une par caractéristique).`,
      starter: `matrice = [[5, 0, 2, 7], [1, 3, 8, 4], [9, 6, 0, 1]]
transposee = []
for ligne in matrice:
    transposee.append(ligne)
`,
      solution: `matrice = [[5, 0, 2, 7], [1, 3, 8, 4], [9, 6, 0, 1]]
nb_lignes = len(matrice)
nb_colonnes = len(matrice[0])
transposee = []
for j in range(nb_colonnes):
    nouvelle_ligne = []
    for i in range(nb_lignes):
        nouvelle_ligne.append(matrice[i][j])
    transposee.append(nouvelle_ligne)
print(transposee)
`,
      tests: [
        { code: 'assert len(transposee) == 4 and all(len(l) == 3 for l in transposee)', label: '4 lignes de 3 nombres : les dimensions sont échangées' },
        { code: 'assert transposee[0] == [5, 1, 9]', label: 'La première ligne est la première colonne : [5, 1, 9]' },
        { code: 'assert transposee == [[5, 1, 9], [0, 3, 6], [2, 8, 0], [7, 4, 1]]', label: 'transposee est complète et exacte' },
        { code: 'assert matrice == [[5, 0, 2, 7], [1, 3, 8, 4], [9, 6, 0, 1]]', label: 'matrice n’est pas modifiée' }
      ],
      hint: 'La ligne j de la transposée contient l’élément j de chaque ligne de `matrice`. Fais une boucle sur les colonnes, et à l’intérieur une boucle sur les lignes.',
      explain: 'La boucle extérieure parcourt les colonnes de `matrice` : chacune devient une ligne de la transposée. La boucle intérieure lit l’élément `matrice[i][j]` de chaque ligne. Une matrice non carrée est le bon cas de test : 3 × 4 donne 4 × 3. Version courte, une fois les compréhensions connues : `[[ligne[j] for ligne in matrice] for j in range(len(matrice[0]))]`.'
    }
  },
  {
    id: 'kata.py.comptage-mots', title: 'Compter les mots', lang: 'python', difficulty: 2, unit: 'py.u8',
    ex: {
      type: 'code',
      prompt: `Construis le dictionnaire \`compte\` qui associe chaque mot de \`texte\` à son nombre d’apparitions :

- les mots sont mis en minuscules : \`Le\` et \`le\` comptent ensemble ;
- la ponctuation \`. , ; : ! ?\` est ignorée ;
- l’apostrophe sépare les mots : \`L'IA\` donne \`l\` et \`ia\`.

Range ensuite dans \`top3\` la liste des 3 mots les plus fréquents, du plus fréquent au moins fréquent. En cas d’égalité, départage par ordre alphabétique.`,
      starter: `texte = "L'IA apprend vite. L'IA se trompe, puis elle corrige : elle apprend encore ! Et toi, tu apprends ?"
compte = {}
for mot in texte.split():
    compte[mot] = 1
top3 = []
`,
      solution: `texte = "L'IA apprend vite. L'IA se trompe, puis elle corrige : elle apprend encore ! Et toi, tu apprends ?"
propre = texte.lower().replace("'", " ")
for signe in ".,;:!?":
    propre = propre.replace(signe, " ")
compte = {}
for mot in propre.split():
    compte[mot] = compte.get(mot, 0) + 1
paires = []
for mot, n in compte.items():
    paires.append((-n, mot))
paires.sort()
top3 = [mot for n, mot in paires[:3]]
print(top3)
`,
      tests: [
        { code: 'assert compte["apprend"] == 2 and compte["vite"] == 1', label: 'compte["apprend"] vaut 2 et compte["vite"] vaut 1' },
        { code: 'assert compte["l"] == 2 and compte["ia"] == 2', label: 'L’apostrophe sépare « l » et « ia », en minuscules' },
        { code: 'assert "vite." not in compte and "?" not in compte and "" not in compte', label: 'Aucune ponctuation dans les clés' },
        { code: 'assert len(compte) == 14', label: '14 mots différents en tout' },
        { code: 'assert top3 == ["apprend", "elle", "ia"]', label: 'top3 vaut ["apprend", "elle", "ia"] (égalités départagées par ordre alphabétique)' }
      ],
      hint: 'Nettoie d’abord le texte : minuscules, puis apostrophe et ponctuation remplacées par des espaces, et enfin `split()`. Pour le classement, une liste de tuples `(-nombre, mot)` triée fait tout le travail.',
      explain: '`compte.get(mot, 0) + 1` évite de tester si la clé existe déjà. Pour classer, on fabrique des tuples `(-n, mot)` : Python compare les tuples élément par élément, donc le tri met les plus grands nombres en premier (grâce au signe moins), puis départage par ordre alphabétique. Ici, 4 mots apparaissent 2 fois : `apprend`, `elle`, `ia` et `l`, et les 3 premiers gagnent. Plus tard, `collections.Counter` fera ce comptage en une ligne.'
    }
  },
  {
    id: 'kata.py.anagrammes', title: 'Familles d’anagrammes', lang: 'python', difficulty: 2, unit: 'py.u8',
    ex: {
      type: 'code',
      prompt: `Deux mots sont des anagrammes s’ils utilisent exactement les mêmes lettres dans un ordre différent, comme \`chien\` et \`niche\`.

À partir de la liste \`mots\`, construis le dictionnaire \`familles\` :

- la clé est la **signature** du mot : ses lettres triées puis recollées (\`"chien"\` donne \`"cehin"\`) ;
- la valeur est la liste des mots qui ont cette signature, dans l’ordre de la liste \`mots\`.

Range ensuite dans \`groupes\` la liste des familles d’au moins 2 mots, dans l’ordre où elles apparaissent dans \`familles\`.`,
      starter: `mots = ["chien", "niche", "ordre", "lion", "chine", "marie", "dorer", "aimer", "piano", "loin", "rame", "amer"]
familles = {}
for mot in mots:
    signature = sorted(mot)
    familles[signature] = [mot]
groupes = []
`,
      solution: `mots = ["chien", "niche", "ordre", "lion", "chine", "marie", "dorer", "aimer", "piano", "loin", "rame", "amer"]
familles = {}
for mot in mots:
    signature = "".join(sorted(mot))
    if signature not in familles:
        familles[signature] = []
    familles[signature].append(mot)
groupes = []
for liste in familles.values():
    if len(liste) >= 2:
        groupes.append(liste)
print(groupes)
`,
      tests: [
        { code: 'assert familles["cehin"] == ["chien", "niche", "chine"]', label: 'La famille « cehin » contient chien, niche et chine, dans cet ordre' },
        { code: 'assert familles["ainop"] == ["piano"]', label: 'piano est seul dans sa famille' },
        { code: 'assert len(familles) == 6', label: '6 signatures différentes' },
        { code: 'assert groupes == [["chien", "niche", "chine"], ["ordre", "dorer"], ["lion", "loin"], ["marie", "aimer"], ["rame", "amer"]]', label: 'groupes contient les 5 familles d’au moins 2 mots, dans l’ordre' }
      ],
      hint: 'Une liste ne peut pas servir de clé de dictionnaire : transforme `sorted(mot)` en chaîne avec `"".join(...)`. Crée la liste d’une signature la première fois que tu la rencontres, puis ajoute-y les mots.',
      explain: 'Deux anagrammes ont les mêmes lettres, donc la même liste de lettres triées : c’est une signature parfaite. Une clé de dictionnaire doit être non modifiable, d’où la chaîne recollée avec `join` (le code de départ plante justement sur ce point). Le dictionnaire regroupe les mots en un seul parcours, au lieu de comparer chaque mot à tous les autres. Les dictionnaires gardent l’ordre d’insertion, ce qui donne l’ordre de `groupes`.'
    }
  },
  {
    id: 'kata.py.palindrome', title: 'Palindromes', lang: 'python', difficulty: 1, unit: 'py.u9',
    ex: {
      type: 'code',
      prompt: `Un palindrome se lit de la même façon dans les deux sens. Écris \`est_palindrome(phrase)\` qui renvoie \`True\` si la phrase en est un, en ignorant les majuscules, les espaces et la ponctuation : seuls les lettres et les chiffres comptent.

- \`est_palindrome("Radar")\` renvoie \`True\` ;
- \`est_palindrome("Engage le jeu, que je le gagne !")\` renvoie \`True\` ;
- \`est_palindrome("Python")\` renvoie \`False\`.

Une phrase sans aucune lettre ni chiffre, comme \`""\`, est considérée comme un palindrome.`,
      starter: `def est_palindrome(phrase):
    return phrase == phrase[::-1]
`,
      solution: `def est_palindrome(phrase):
    propre = ""
    for c in phrase.lower():
        if c.isalnum():
            propre += c
    return propre == propre[::-1]
`,
      tests: [
        { code: 'assert est_palindrome("Radar") is True', label: 'Majuscules ignorées : « Radar » est un palindrome' },
        { code: 'assert est_palindrome("Engage le jeu, que je le gagne !") is True and est_palindrome("Un roc si biscornu") is True', label: 'Espaces et ponctuation ignorés' },
        { code: 'assert est_palindrome("Python") is False and est_palindrome("ab") is False', label: '« Python » et « ab » ne sont pas des palindromes' },
        { code: 'assert est_palindrome("12321") is True and est_palindrome("") is True', label: 'Chiffres pris en compte, chaîne vide acceptée' }
      ],
      hint: 'Construis d’abord une version « propre » de la phrase : en minuscules, en ne gardant que les caractères pour lesquels `isalnum()` est vrai. Compare-la ensuite à son inverse.',
      explain: 'Le cœur du problème est la normalisation : une fois la phrase réduite à ses lettres et chiffres en minuscules, la comparaison avec `propre[::-1]` (la chaîne à l’envers) suffit. Séparer « nettoyer » et « comparer » rend le code lisible et facile à tester. La chaîne vide est égale à son inverse : elle compte comme un palindrome.'
    }
  },
  {
    id: 'kata.py.mot-de-passe', title: 'Validation de mot de passe', lang: 'python', difficulty: 2, unit: 'py.u9',
    ex: {
      type: 'code',
      prompt: `Écris \`problemes_mot_de_passe(mdp)\` qui renvoie la **liste des problèmes** d’un mot de passe, dans cet ordre, ou une liste vide s’il est valide :

- \`"trop court"\` s’il fait moins de 12 caractères ;
- \`"pas de majuscule"\` ;
- \`"pas de minuscule"\` ;
- \`"pas de chiffre"\` ;
- \`"pas de caractère spécial"\` s’il ne contient aucun caractère qui ne soit ni une lettre ni un chiffre (par exemple \`!\`, \`#\`, \`-\` ou une espace).

Exemple : \`problemes_mot_de_passe("soleil2024")\` renvoie \`["trop court", "pas de majuscule", "pas de caractère spécial"]\`.`,
      starter: `def problemes_mot_de_passe(mdp):
    problemes = []
    if len(mdp) < 12:
        problemes.append("trop court")
    return problemes
`,
      solution: `def problemes_mot_de_passe(mdp):
    problemes = []
    if len(mdp) < 12:
        problemes.append("trop court")
    if not any(c.isupper() for c in mdp):
        problemes.append("pas de majuscule")
    if not any(c.islower() for c in mdp):
        problemes.append("pas de minuscule")
    if not any(c.isdigit() for c in mdp):
        problemes.append("pas de chiffre")
    if all(c.isalnum() for c in mdp):
        problemes.append("pas de caractère spécial")
    return problemes
`,
      tests: [
        { code: 'assert problemes_mot_de_passe("soleil2024") == ["trop court", "pas de majuscule", "pas de caractère spécial"]', label: 'Exemple de l’énoncé' },
        { code: 'assert problemes_mot_de_passe("Correct-Cheval-42") == []', label: '« Correct-Cheval-42 » est valide : liste vide' },
        { code: 'assert problemes_mot_de_passe("MOT DE PASSE 99") == ["pas de minuscule"]', label: 'L’espace compte comme caractère spécial ; seule la minuscule manque' },
        { code: 'assert problemes_mot_de_passe("") == ["trop court", "pas de majuscule", "pas de minuscule", "pas de chiffre", "pas de caractère spécial"]', label: 'Mot de passe vide : les 5 problèmes, dans l’ordre' }
      ],
      hint: 'Une condition par règle, dans l’ordre demandé, chacune ajoutant son message. `any(c.isdigit() for c in mdp)` répond à la question « contient-il au moins un chiffre ? ».',
      explain: 'Renvoyer la liste des problèmes plutôt qu’un simple `True` ou `False` permet d’afficher un message utile. Chaque règle est un `if` indépendant (pas de `elif`), sinon on s’arrêterait au premier problème. `any(...)` vérifie qu’au moins un caractère respecte un critère. Pour le caractère spécial, on vérifie l’inverse : si tous les caractères sont des lettres ou des chiffres (`all(c.isalnum() ...)`), il en manque un.'
    }
  },
  {
    id: 'kata.py.rle', title: 'Compression RLE', lang: 'python', difficulty: 3, unit: 'py.u9',
    ex: {
      type: 'code',
      prompt: `La compression RLE (run-length encoding) remplace chaque suite de caractères identiques par le caractère suivi du nombre de répétitions : \`"aaabccdddd"\` devient \`"a3b1c2d4"\`. On l’utilise par exemple pour des images simples, avec de grandes zones de même couleur.

Écris deux fonctions :

- \`compresser(texte)\` renvoie la version compressée ;
- \`decompresser(code)\` fait l’inverse.

Le texte ne contient jamais de chiffres, mais une suite peut dépasser 9 caractères : douze \`x\` deviennent \`"x12"\`. Le texte vide donne \`""\` dans les deux sens.`,
      starter: `def compresser(texte):
    resultat = ""
    for c in texte:
        resultat += c + "1"
    return resultat


def decompresser(code):
    return ""
`,
      solution: `def compresser(texte):
    if texte == "":
        return ""
    resultat = ""
    courant = texte[0]
    compte = 1
    for c in texte[1:]:
        if c == courant:
            compte += 1
        else:
            resultat += courant + str(compte)
            courant = c
            compte = 1
    return resultat + courant + str(compte)


def decompresser(code):
    resultat = ""
    lettre = ""
    nombre = ""
    for c in code:
        if c.isdigit():
            nombre += c
        else:
            if lettre != "":
                resultat += lettre * int(nombre)
            lettre = c
            nombre = ""
    if lettre != "":
        resultat += lettre * int(nombre)
    return resultat
`,
      tests: [
        { code: 'assert compresser("aaabccdddd") == "a3b1c2d4"', label: 'compresser("aaabccdddd") renvoie "a3b1c2d4"' },
        { code: 'assert compresser("x" * 12 + "yy") == "x12y2"', label: 'Une suite de plus de 9 caractères : "x12y2"' },
        { code: 'assert decompresser("a3b1c2d4") == "aaabccdddd" and decompresser("x12y2") == "x" * 12 + "yy"', label: 'decompresser inverse les deux exemples' },
        { code: 'assert compresser("") == "" and decompresser("") == ""', label: 'Texte vide dans les deux sens' },
        { code: 'texte = "  --==##  ok"\nassert decompresser(compresser(texte)) == texte', label: 'Aller-retour : decompresser(compresser(t)) redonne t, espaces et symboles compris' }
      ],
      hint: 'Pour compresser, garde le caractère courant et un compteur ; quand le caractère change, écris la paire et repars à 1. Pour décompresser, accumule les chiffres dans une chaîne tant que tu en lis : le nombre peut avoir plusieurs chiffres.',
      explain: 'La compression parcourt le texte une seule fois en comptant les répétitions ; le piège classique est d’oublier d’écrire la dernière suite après la boucle. La décompression lit des chiffres jusqu’à la lettre suivante, ce qui gère `x12` correctement : lire un seul chiffre donnerait `x1` puis un `2` orphelin. Le test aller-retour est une excellente habitude : il vérifie que les deux fonctions sont cohérentes entre elles.'
    }
  },
  {
    id: 'kata.py.tokenizer', title: 'Mini-tokenizer pour l’IA', lang: 'python', difficulty: 4, unit: 'py.u9',
    ex: {
      type: 'code',
      prompt: `Avant d’entrer dans un modèle de langage, un texte est découpé en **tokens**, puis chaque token est remplacé par un numéro. Écris trois fonctions :

1. \`decouper(phrase)\` met la phrase en minuscules et renvoie la liste de ses tokens. Les mots sont séparés par des espaces ; chaque signe \`.\` \`,\` \`!\` \`?\` est un token à part ; une apostrophe reste collée au mot qui la précède (\`"l'ia"\` donne \`"l'"\` et \`"ia"\`).
2. \`construire_vocabulaire(phrases)\` renvoie un dictionnaire token → numéro. Les numéros 0 et 1 sont réservés à \`"<pad>"\` et \`"<inconnu>"\` ; les autres tokens reçoivent 2, 3, 4… dans l’ordre de leur première apparition.
3. \`encoder(phrase, vocab)\` renvoie la liste des numéros des tokens de la phrase ; un token absent du vocabulaire reçoit le numéro de \`"<inconnu>"\`.

Exemple : \`decouper("L'IA apprend, vite !")\` renvoie \`["l'", "ia", "apprend", ",", "vite", "!"]\`.`,
      starter: `def decouper(phrase):
    return phrase.split()


def construire_vocabulaire(phrases):
    vocab = {"<pad>": 0, "<inconnu>": 1}
    return vocab


def encoder(phrase, vocab):
    return []
`,
      solution: `def decouper(phrase):
    phrase = phrase.lower().replace("'", "' ")
    for signe in ".,!?":
        phrase = phrase.replace(signe, " " + signe + " ")
    return phrase.split()


def construire_vocabulaire(phrases):
    vocab = {"<pad>": 0, "<inconnu>": 1}
    for phrase in phrases:
        for token in decouper(phrase):
            if token not in vocab:
                vocab[token] = len(vocab)
    return vocab


def encoder(phrase, vocab):
    return [vocab.get(token, vocab["<inconnu>"]) for token in decouper(phrase)]
`,
      tests: [
        { code: 'assert decouper("L\'IA apprend, vite !") == ["l\'", "ia", "apprend", ",", "vite", "!"]', label: 'decouper : minuscules, apostrophe et ponctuation séparées' },
        { code: 'assert decouper("Fin.") == ["fin", "."] and decouper("") == []', label: 'decouper : point collé au mot, phrase vide' },
        { code: 'v = construire_vocabulaire(["Le chat dort.", "Le chien dort !"])\nassert v == {"<pad>": 0, "<inconnu>": 1, "le": 2, "chat": 3, "dort": 4, ".": 5, "chien": 6, "!": 7}', label: 'Vocabulaire : numéros dans l’ordre de première apparition, sans doublon' },
        { code: 'v = construire_vocabulaire(["Le chat dort."])\nassert encoder("Le chat dort.", v) == [2, 3, 4, 5]', label: 'encoder une phrase connue' },
        { code: 'v = construire_vocabulaire(["Le chat dort."])\nassert encoder("Le lapin dort !", v) == [2, 1, 4, 1]', label: 'Les tokens inconnus reçoivent le numéro 1' }
      ],
      hint: 'Pour `decouper`, inutile de parcourir caractère par caractère : ajoute des espaces autour de chaque signe avec `replace`, puis laisse `split()` faire le travail. Pour le vocabulaire, `len(vocab)` donne justement le prochain numéro libre.',
      explain: 'Entourer chaque signe d’espaces transforme le problème en un simple `split()`, qui ignore les espaces multiples. Le vocabulaire réutilise `decouper` : une fonction, un rôle. Comme les numéros commencent à 0 sans trou, `len(vocab)` est toujours le prochain numéro libre. `vocab.get(token, ...)` gère les tokens jamais vus, comme le token « inconnu » des vrais modèles. Les vrais tokenizers (BPE, par exemple) découpent aussi les mots en morceaux, mais le principe reste le même.'
    }
  },
  {
    id: 'kata.py.cosinus', title: 'Similarité cosinus', lang: 'python', difficulty: 2, unit: 'py.u11',
    ex: {
      type: 'code',
      prompt: `En IA, les mots et les documents sont souvent représentés par des vecteurs, c’est-à-dire des listes de nombres. La **similarité cosinus** mesure si deux vecteurs pointent dans la même direction : 1 pour la même direction, 0 pour des directions perpendiculaires, -1 pour des directions opposées.

similarité = produit scalaire / (norme de a × norme de b)

- produit scalaire : somme des \`a[i] * b[i]\` ;
- norme : racine carrée de la somme des carrés (utilise \`math.sqrt\`).

Écris \`similarite_cosinus(a, b)\` qui renvoie ce nombre arrondi à 3 décimales. Si les vecteurs n’ont pas la même longueur, ou si l’un d’eux est nul (norme 0), renvoie \`None\`.`,
      starter: `import math


def similarite_cosinus(a, b):
    produit = 0
    for i in range(len(a)):
        produit += a[i] * b[i]
    return produit
`,
      solution: `import math


def similarite_cosinus(a, b):
    if len(a) != len(b):
        return None
    produit = sum(x * y for x, y in zip(a, b))
    norme_a = math.sqrt(sum(x * x for x in a))
    norme_b = math.sqrt(sum(y * y for y in b))
    if norme_a == 0 or norme_b == 0:
        return None
    return round(produit / (norme_a * norme_b), 3)
`,
      tests: [
        { code: 'assert similarite_cosinus([1, 2, 3], [2, 4, 6]) == 1.0', label: 'Même direction : [1, 2, 3] et [2, 4, 6] donnent 1.0' },
        { code: 'assert similarite_cosinus([1, 0], [0, 5]) == 0.0', label: 'Directions perpendiculaires : 0.0' },
        { code: 'assert similarite_cosinus([1, 1], [-2, -2]) == -1.0', label: 'Directions opposées : -1.0' },
        { code: 'assert similarite_cosinus([3, 1, 0], [1, 2, 2]) == 0.527', label: '[3, 1, 0] et [1, 2, 2] donnent 0.527' },
        { code: 'assert similarite_cosinus([0, 0], [1, 2]) is None and similarite_cosinus([1, 2], [1, 2, 3]) is None', label: 'Vecteur nul ou longueurs différentes : None' }
      ],
      hint: 'Vérifie d’abord les cas où le calcul est impossible. `zip(a, b)` parcourt les deux listes en parallèle, et `math.sqrt` calcule une racine carrée.',
      explain: 'Le produit scalaire mesure à quel point les vecteurs vont dans le même sens ; la division par les normes enlève l’effet de leur longueur, pour ne garder que l’angle. Les vérifications du début évitent un calcul faux (longueurs différentes) ou une division par zéro (vecteur nul). C’est cette mesure qu’utilisent les moteurs de recherche sémantique pour comparer des textes transformés en vecteurs.'
    }
  },
  {
    id: 'kata.py.notes-robustes', title: 'Lecture robuste de nombres', lang: 'python', difficulty: 2, unit: 'py.u12',
    ex: {
      type: 'code',
      prompt: `Des notes ont été saisies à la main dans un formulaire, avec des erreurs. Écris \`lire_notes(saisies)\` qui reçoit une liste de chaînes et renvoie un tuple \`(notes, rejets)\` :

- \`notes\` : la liste des notes valides, converties en \`float\`, dans l’ordre ;
- \`rejets\` : le nombre de saisies rejetées.

Une saisie est valide si, après avoir enlevé les espaces autour et remplacé la virgule par un point, \`float(...)\` la convertit **et** que la note est comprise entre 0 et 20 inclus.

Utilise \`try / except ValueError\` plutôt que d’essayer de prévoir toutes les fautes de frappe.

Exemple : \`lire_notes(["12", " 14,5 ", "abc", "25"])\` renvoie \`([12.0, 14.5], 2)\`.`,
      starter: `def lire_notes(saisies):
    notes = []
    for s in saisies:
        notes.append(float(s))
    return notes, 0
`,
      solution: `def lire_notes(saisies):
    notes = []
    rejets = 0
    for s in saisies:
        try:
            note = float(s.strip().replace(",", "."))
        except ValueError:
            rejets += 1
            continue
        if 0 <= note <= 20:
            notes.append(note)
        else:
            rejets += 1
    return notes, rejets
`,
      tests: [
        { code: 'assert lire_notes(["12", " 14,5 ", "abc", "25"]) == ([12.0, 14.5], 2)', label: 'Exemple de l’énoncé' },
        { code: 'assert lire_notes(["0", "20", "20,01", "-1"]) == ([0.0, 20.0], 2)', label: 'Bornes 0 et 20 acceptées, 20,01 et -1 rejetées' },
        { code: 'assert lire_notes(["", "  ", "1 2", "12.5.3"]) == ([], 4)', label: 'Saisies vides ou mal formées : toutes rejetées, sans planter' },
        { code: 'assert lire_notes([]) == ([], 0)', label: 'Liste vide : ([], 0)' }
      ],
      hint: 'Dans la boucle, place seulement la conversion dans le `try`. Dans le `except ValueError`, compte le rejet et passe à la saisie suivante. Vérifie ensuite que la note est entre 0 et 20.',
      explain: '`float()` lève une `ValueError` dès que la chaîne n’est pas un nombre : plutôt que de prévoir toutes les fautes possibles, on essaie et on rattrape l’erreur. Le bloc `try` reste court pour ne pas masquer d’autres erreurs par accident. La vérification de 0 à 20 est une règle métier, différente d’une erreur de format : un simple `if` suffit. Renvoyer le nombre de rejets permet de prévenir la personne qui a saisi les notes.'
    }
  },
  {
    id: 'kata.py.fichier-notes', title: 'Moyennes depuis un fichier', lang: 'python', difficulty: 3, unit: 'py.u13',
    ex: {
      type: 'code',
      prompt: `Le fichier \`notes.csv\` contient une ligne d’en-tête, puis une ligne par note, au format \`nom;matiere;note\`. Écris \`moyennes_par_eleve(chemin)\` qui lit ce fichier et renvoie un dictionnaire nom → moyenne arrondie à 2 décimales :

- ignore les lignes vides ;
- enlève les espaces autour des noms et des notes ;
- garde l’ordre de première apparition des élèves.

Écris aussi \`meilleur_eleve(chemin)\` qui renvoie le nom de l’élève qui a la meilleure moyenne (le premier en cas d’égalité), ou \`None\` si le fichier ne contient aucune note.

Les tests utilisent \`notes.csv\` et \`vide.csv\` (qui ne contient que l’en-tête).`,
      files: {
        'notes.csv': 'nom;matiere;note\nAda;maths;16\nLinus;maths;12\nAda;info;19\n\nGrace;info;17\nLinus;info; 15\n Grace ;maths;14\n',
        'vide.csv': 'nom;matiere;note\n'
      },
      starter: `def moyennes_par_eleve(chemin):
    moyennes = {}
    with open(chemin) as fichier:
        for ligne in fichier:
            nom, matiere, note = ligne.split(";")
            moyennes[nom] = float(note)
    return moyennes


def meilleur_eleve(chemin):
    return None
`,
      solution: `def moyennes_par_eleve(chemin):
    notes = {}
    with open(chemin) as fichier:
        fichier.readline()
        for ligne in fichier:
            ligne = ligne.strip()
            if ligne == "":
                continue
            nom, matiere, note = ligne.split(";")
            nom = nom.strip()
            if nom not in notes:
                notes[nom] = []
            notes[nom].append(float(note))
    return {nom: round(sum(liste) / len(liste), 2) for nom, liste in notes.items()}


def meilleur_eleve(chemin):
    moyennes = moyennes_par_eleve(chemin)
    meilleur = None
    for nom in moyennes:
        if meilleur is None or moyennes[nom] > moyennes[meilleur]:
            meilleur = nom
    return meilleur
`,
      tests: [
        { code: 'assert moyennes_par_eleve("notes.csv") == {"Ada": 17.5, "Linus": 13.5, "Grace": 15.5}', label: 'Les moyennes de notes.csv sont exactes' },
        { code: 'assert list(moyennes_par_eleve("notes.csv")) == ["Ada", "Linus", "Grace"]', label: 'Ordre de première apparition, noms sans espaces' },
        { code: 'assert meilleur_eleve("notes.csv") == "Ada"', label: 'meilleur_eleve("notes.csv") renvoie "Ada"' },
        { code: 'assert moyennes_par_eleve("vide.csv") == {} and meilleur_eleve("vide.csv") is None', label: 'Fichier sans note : {} et None' }
      ],
      hint: 'Lis et ignore la première ligne avec `readline()`. Pour chaque ligne suivante : `strip()`, passe si elle est vide, puis `split(";")`. Accumule les notes de chaque élève dans une liste avant de calculer les moyennes.',
      explain: '`with open(...)` ferme le fichier automatiquement. On lit l’en-tête à part, puis chaque ligne est nettoyée : sans `strip()`, le retour à la ligne final et les espaces fausseraient les noms. Garder toutes les notes d’un élève dans une liste, puis calculer les moyennes à la fin, sépare la lecture du calcul. `meilleur_eleve` réutilise la première fonction au lieu de relire le fichier à sa façon.'
    }
  },
  {
    id: 'kata.py.compte-bancaire', title: 'Classe CompteBancaire', lang: 'python', difficulty: 3, unit: 'py.u14',
    ex: {
      type: 'code',
      prompt: `Complète la classe \`CompteBancaire\` :

- \`CompteBancaire(titulaire, solde=0)\` crée un compte ; l’attribut \`historique\` est une liste, vide au départ ;
- \`deposer(montant)\` ajoute le montant au solde et ajoute le tuple \`("dépôt", montant)\` à l’historique ;
- \`retirer(montant)\` enlève le montant et ajoute \`("retrait", montant)\` ; si le solde est insuffisant, lève \`ValueError("solde insuffisant")\` sans rien modifier ;
- un montant nul ou négatif lève \`ValueError("montant invalide")\`, pour un dépôt comme pour un retrait ;
- \`virer(montant, autre)\` retire le montant de ce compte et le dépose sur le compte \`autre\` ;
- \`str(compte)\` renvoie par exemple \`"Ada : 150.00 €"\`, avec 2 décimales.`,
      starter: `class CompteBancaire:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self.solde = solde

    def deposer(self, montant):
        self.solde += montant

    def retirer(self, montant):
        self.solde -= montant
`,
      solution: `class CompteBancaire:
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self.solde = solde
        self.historique = []

    def verifier_montant(self, montant):
        if montant <= 0:
            raise ValueError("montant invalide")

    def deposer(self, montant):
        self.verifier_montant(montant)
        self.solde += montant
        self.historique.append(("dépôt", montant))

    def retirer(self, montant):
        self.verifier_montant(montant)
        if montant > self.solde:
            raise ValueError("solde insuffisant")
        self.solde -= montant
        self.historique.append(("retrait", montant))

    def virer(self, montant, autre):
        self.retirer(montant)
        autre.deposer(montant)

    def __str__(self):
        return f"{self.titulaire} : {self.solde:.2f} €"
`,
      tests: [
        { code: 'c = CompteBancaire("Ada", 100)\nc.deposer(50)\nc.retirer(30)\nassert c.solde == 120 and c.historique == [("dépôt", 50), ("retrait", 30)]', label: 'Dépôt puis retrait : solde 120 et historique à jour' },
        { code: `c = CompteBancaire("Ada", 100)
try:
    c.retirer(500)
    assert False, "aucune erreur levée"
except ValueError as e:
    assert str(e) == "solde insuffisant"
assert c.solde == 100 and c.historique == []`, label: 'Retrait trop grand : ValueError("solde insuffisant"), et rien ne change' },
        { code: `c = CompteBancaire("Ada")
try:
    c.deposer(0)
    assert False, "aucune erreur pour un dépôt de 0"
except ValueError as e:
    assert str(e) == "montant invalide"
try:
    c.retirer(-5)
    assert False, "aucune erreur pour un retrait de -5"
except ValueError as e:
    assert str(e) == "montant invalide"`, label: 'Montant nul ou négatif : ValueError("montant invalide")' },
        { code: 'a = CompteBancaire("Ada", 200)\nb = CompteBancaire("Linus")\na.virer(75, b)\nassert a.solde == 125 and b.solde == 75', label: 'Virement de 75 € : 125 € d’un côté, 75 € de l’autre' },
        { code: `a = CompteBancaire("Ada", 20)
b = CompteBancaire("Linus")
try:
    a.virer(50, b)
except ValueError:
    pass
assert a.solde == 20 and b.solde == 0
assert str(CompteBancaire("Grace", 150)) == "Grace : 150.00 €"`, label: 'Virement impossible : aucun compte ne change ; str donne « Grace : 150.00 € »' }
      ],
      hint: 'Commence par compléter `__init__` avec `self.historique = []`. Dans chaque méthode, vérifie d’abord et lève l’erreur si besoin, puis seulement ensuite modifie le solde. Pour `virer`, réutilise `retirer` et `deposer`.',
      explain: 'Une classe regroupe des données (titulaire, solde, historique) et les règles qui les protègent. Chaque méthode vérifie avant d’agir : si une erreur est levée, rien n’a encore été modifié, donc le compte reste cohérent. `virer` réutilise `retirer` puis `deposer` : si le retrait échoue, l’exception arrête tout avant le dépôt. `__str__` donne un affichage lisible avec `print(compte)`.'
    }
  },
  {
    id: 'kata.py.tri-insertion', title: 'Tri par insertion à la main', lang: 'python', difficulty: 3, unit: 'py.u15',
    ex: {
      type: 'code',
      prompt: `Le tri par insertion trie comme on range des cartes dans sa main : on prend les éléments un par un et on décale vers la droite les éléments plus grands, jusqu’à trouver la place de l’élément.

Écris \`tri_insertion(valeurs)\` **sans** \`sorted\` ni \`.sort()\`. Elle renvoie un tuple \`(triee, decalages)\` :

- \`triee\` : une nouvelle liste triée par ordre croissant (la liste reçue n’est pas modifiée) ;
- \`decalages\` : le nombre total de fois où un élément a été décalé d’une case vers la droite.

Exemple : \`tri_insertion([3, 1, 2])\` renvoie \`([1, 2, 3], 2)\` : pour insérer 1, on décale 3 ; pour insérer 2, on décale encore 3.`,
      starter: `def tri_insertion(valeurs):
    decalages = 0
    for i in range(1, len(valeurs)):
        element = valeurs[i]
        j = i - 1
        # décale ici les éléments plus grands que element
        valeurs[j + 1] = element
    return valeurs, decalages
`,
      solution: `def tri_insertion(valeurs):
    triee = list(valeurs)
    decalages = 0
    for i in range(1, len(triee)):
        element = triee[i]
        j = i - 1
        while j >= 0 and triee[j] > element:
            triee[j + 1] = triee[j]
            decalages += 1
            j -= 1
        triee[j + 1] = element
    return triee, decalages
`,
      tests: [
        { code: 'assert tri_insertion([3, 1, 2]) == ([1, 2, 3], 2)', label: 'Exemple : ([1, 2, 3], 2)' },
        { code: 'assert tri_insertion([5, 4, 3, 2, 1]) == ([1, 2, 3, 4, 5], 10)', label: 'Liste à l’envers : 10 décalages, le pire cas' },
        { code: 'assert tri_insertion([1, 2, 3, 4]) == ([1, 2, 3, 4], 0)', label: 'Liste déjà triée : aucun décalage' },
        { code: 'assert tri_insertion([2, -1, 2, 0]) == ([-1, 0, 2, 2], 3)', label: 'Doublons et négatifs : ([-1, 0, 2, 2], 3)' },
        { code: 'donnees = [4, 2]\ntri_insertion(donnees)\nassert donnees == [4, 2] and tri_insertion([]) == ([], 0)', label: 'La liste reçue n’est pas modifiée ; liste vide : ([], 0)' }
      ],
      hint: 'Copie d’abord la liste avec `list(valeurs)`. Pour chaque élément à partir du deuxième, recule avec une boucle `while` tant que l’élément de gauche est plus grand : décale-le d’une case et compte ce décalage.',
      explain: 'À chaque tour, la partie gauche de la liste est déjà triée : on y insère l’élément suivant en décalant les plus grands. La comparaison stricte `>` laisse les valeurs égales en place, ce qui rend le tri stable. Le nombre de décalages est le nombre de paires mal rangées : 0 pour une liste triée, n × (n − 1) / 2 pour une liste à l’envers. Ce tri est donc rapide sur une liste presque triée, mais quadratique dans le pire cas.'
    }
  },
  {
    id: 'kata.py.dichotomie', title: 'Recherche dichotomique', lang: 'python', difficulty: 4, unit: 'py.u15',
    ex: {
      type: 'code',
      prompt: `Écris \`premiere_position(valeurs, cible)\`. \`valeurs\` est une liste **triée** par ordre croissant, qui peut contenir des doublons. La fonction renvoie l’indice de la **première** occurrence de \`cible\`, ou \`-1\` si elle est absente.

Elle doit être rapide : à chaque étape, regarde l’élément du milieu de la zone restante et élimine la moitié de la zone. Sur une liste de 1 000 éléments, elle ne doit pas lire plus de 25 éléments. N’utilise donc ni \`in\`, ni \`.index()\`, ni de boucle sur tous les éléments.

Exemple : \`premiere_position([1, 3, 3, 3, 8], 3)\` renvoie 1. Le code actuel est une recherche dichotomique classique : corrige-la.`,
      starter: `def premiere_position(valeurs, cible):
    gauche, droite = 0, len(valeurs) - 1
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if valeurs[milieu] == cible:
            return milieu
        elif valeurs[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    return -1
`,
      solution: `def premiere_position(valeurs, cible):
    gauche, droite = 0, len(valeurs)
    while gauche < droite:
        milieu = (gauche + droite) // 2
        if valeurs[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu
    if gauche < len(valeurs) and valeurs[gauche] == cible:
        return gauche
    return -1
`,
      tests: [
        { code: 'assert premiere_position([1, 3, 3, 3, 8], 3) == 1', label: 'premiere_position([1, 3, 3, 3, 8], 3) renvoie 1 (première occurrence)' },
        { code: 'assert premiere_position([2, 4, 6], 5) == -1 and premiere_position([2, 4, 6], 7) == -1 and premiere_position([], 1) == -1', label: 'Cible absente (au milieu, après la fin) ou liste vide : -1' },
        { code: 'assert premiere_position([5, 5, 5, 5], 5) == 0 and premiere_position([1, 2, 9], 9) == 2', label: 'Cible au tout début ou à la fin' },
        { code: `class Espion:
    def __init__(self, donnees):
        self.donnees = donnees
        self.lectures = 0

    def __len__(self):
        return len(self.donnees)

    def __getitem__(self, i):
        self.lectures += 1
        return self.donnees[i]


espion = Espion([n // 3 for n in range(1000)])
assert premiere_position(espion, 200) == 600
assert espion.lectures <= 25, f"{espion.lectures} éléments lus"`, label: 'Rapide : au plus 25 éléments lus sur une liste de 1 000' }
      ],
      hint: 'Garde une zone où la réponse peut se trouver, de `gauche` inclus à `droite` exclu. Si l’élément du milieu est plus petit que la cible, la réponse est à droite du milieu ; sinon, elle est au milieu ou à sa gauche. Ne t’arrête pas dès que tu trouves la cible.',
      explain: 'La recherche dichotomique classique s’arrête dès qu’elle trouve la cible, et peut tomber sur n’importe quelle occurrence. Ici, on continue à resserrer la zone vers la gauche, même quand `valeurs[milieu] == cible`. À la fin, `gauche` est la première position où `cible` pourrait se trouver : il reste à vérifier qu’elle y est vraiment. Chaque tour divise la zone par deux : environ 10 lectures pour 1 000 éléments, 20 pour un million. C’est ce que fait `bisect.bisect_left` en Python.'
    }
  },
  {
    id: 'kata.py.aplatir', title: 'Aplatir une liste imbriquée', lang: 'python', difficulty: 3, unit: 'py.u16',
    ex: {
      type: 'code',
      prompt: `Une liste peut contenir d’autres listes, elles-mêmes imbriquées, sur une profondeur quelconque. Écris la fonction **récursive** \`aplatir(liste)\` qui renvoie une nouvelle liste avec tous les éléments qui ne sont pas des listes, dans l’ordre de lecture.

Exemple : \`aplatir([1, [2, [3, 4]], [], 5])\` renvoie \`[1, 2, 3, 4, 5]\`.

Écris aussi \`profondeur(liste)\` : 1 pour une liste sans sous-liste, et 1 de plus par niveau d’imbrication. \`profondeur([1, [2, [3]]])\` renvoie 3 et \`profondeur([])\` renvoie 1.`,
      starter: `def aplatir(liste):
    resultat = []
    for element in liste:
        if isinstance(element, list):
            resultat.extend(element)
        else:
            resultat.append(element)
    return resultat


def profondeur(liste):
    return 1
`,
      solution: `def aplatir(liste):
    resultat = []
    for element in liste:
        if isinstance(element, list):
            resultat.extend(aplatir(element))
        else:
            resultat.append(element)
    return resultat


def profondeur(liste):
    plus_profond = 0
    for element in liste:
        if isinstance(element, list):
            plus_profond = max(plus_profond, profondeur(element))
    return 1 + plus_profond
`,
      tests: [
        { code: 'assert aplatir([1, [2, [3, 4]], [], 5]) == [1, 2, 3, 4, 5]', label: 'Exemple de l’énoncé' },
        { code: 'assert aplatir([[[["a"]]], "b", ["c", ["d"]]]) == ["a", "b", "c", "d"]', label: 'Imbrication profonde, avec des chaînes' },
        { code: 'assert aplatir([]) == [] and aplatir([[], [[]]]) == []', label: 'Listes vides : résultat vide' },
        { code: 'assert profondeur([1, [2, [3]]]) == 3 and profondeur([]) == 1 and profondeur([[], [[[]]]]) == 4', label: 'profondeur renvoie 3, 1 et 4' },
        { code: 'donnees = [1, [2]]\naplatir(donnees)\nassert donnees == [1, [2]]', label: 'La liste reçue n’est pas modifiée' }
      ],
      hint: 'Pour chaque élément : si c’est une liste, appelle `aplatir` sur elle et ajoute tout son résultat ; sinon, ajoute l’élément. Le cas de base est implicite : une liste sans sous-liste ne déclenche aucun appel.',
      explain: 'La structure est récursive (une liste contient des listes), donc la solution l’est aussi : chaque sous-liste est aplatie par le même code, quelle que soit sa profondeur. `extend` ajoute un à un les éléments renvoyés, alors que `append` ajouterait la liste entière. `profondeur` suit le même schéma : 1 pour le niveau courant, plus la profondeur de la sous-liste la plus profonde. `isinstance(element, list)` évite de découper les chaînes, qui sont elles aussi parcourables.'
    }
  },
  {
    id: 'kata.py.parentheses', title: 'Parenthèses équilibrées', lang: 'python', difficulty: 3, unit: 'py.u17',
    ex: {
      type: 'code',
      prompt: `Un éditeur de code vérifie que les parenthèses \`()\`, crochets \`[]\` et accolades \`{}\` sont équilibrés : chaque ouvrante a une fermante du même type, et elles se ferment dans le bon ordre.

Écris \`premiere_erreur(texte)\` en utilisant une **pile**. Elle renvoie :

- \`-1\` si tout est équilibré ;
- sinon, l’indice du premier caractère fautif : une fermante qui ne correspond pas à la dernière ouvrante (ou qui n’a pas d’ouvrante) ; ou, si le texte se termine avec des ouvrantes non fermées, l’indice de la **première** ouvrante restée ouverte.

Les autres caractères sont ignorés. Exemples : \`premiere_erreur("f(x[0]) + {a: 1}")\` renvoie -1, \`premiere_erreur("(]")\` renvoie 1 et \`premiere_erreur("((a)")\` renvoie 0.`,
      starter: `def premiere_erreur(texte):
    if texte.count("(") != texte.count(")"):
        return 0
    return -1
`,
      solution: `def premiere_erreur(texte):
    paires = {")": "(", "]": "[", "}": "{"}
    pile = []
    for i, c in enumerate(texte):
        if c in "([{":
            pile.append((c, i))
        elif c in paires:
            if not pile or pile[-1][0] != paires[c]:
                return i
            pile.pop()
    if pile:
        return pile[0][1]
    return -1
`,
      tests: [
        { code: 'assert premiere_erreur("f(x[0]) + {a: 1}") == -1 and premiere_erreur("") == -1', label: 'Texte équilibré ou vide : -1' },
        { code: 'assert premiere_erreur("(]") == 1 and premiere_erreur("([)]") == 2', label: 'Mauvais type ou mauvais ordre : indice de la fermante fautive' },
        { code: 'assert premiere_erreur("a)b(") == 1', label: 'Fermante sans ouvrante : son indice' },
        { code: 'assert premiere_erreur("((a)") == 0 and premiere_erreur("x = [1, {2}") == 4', label: 'Ouvrante jamais fermée : indice de la première restée ouverte' }
      ],
      hint: 'Empile chaque ouvrante avec son indice. À chaque fermante, le sommet de la pile doit être l’ouvrante correspondante, sinon c’est l’erreur. À la fin, regarde ce qui reste dans la pile.',
      explain: 'La dernière parenthèse ouverte doit être la première fermée : c’est exactement le fonctionnement d’une pile. Un dictionnaire fermante → ouvrante évite une série de `if`. Garder l’indice avec chaque ouvrante permet de signaler précisément l’erreur, comme le font les éditeurs de code. Compter les parenthèses ne suffit pas : `([)]` a le bon nombre de chaque, mais dans le mauvais ordre.'
    }
  },

  // =====================================================================
  // JavaScript (8)
  // =====================================================================
  {
    id: 'kata.js.multiples', title: 'Multiples de 3 ou de 5', lang: 'javascript', difficulty: 1, unit: 'js.u4',
    ex: {
      type: 'code',
      prompt: `Avec une boucle, calcule :

- \`somme\` : la somme des entiers **strictement inférieurs à 1000** qui sont multiples de 3 **ou** de 5 (un multiple de 15 ne compte qu’une fois) ;
- \`compte\` : combien il y a de tels nombres ;
- \`plusGrand\` : le plus grand d’entre eux.

Pour vérifier ton raisonnement : en dessous de 10, ces nombres sont 3, 5, 6 et 9, et leur somme vaut 23.

Affiche enfin les trois valeurs avec \`console.log(somme, compte, plusGrand)\`.`,
      starter: `let somme = 0;
let compte = 0;
let plusGrand = 0;
for (let n = 1; n <= 1000; n++) {
  if (n % 3 === 0 && n % 5 === 0) {
    somme += n;
    compte++;
  }
}
console.log(somme, compte, plusGrand);
`,
      solution: `let somme = 0;
let compte = 0;
let plusGrand = 0;
for (let n = 1; n < 1000; n++) {
  if (n % 3 === 0 || n % 5 === 0) {
    somme += n;
    compte++;
    plusGrand = n;
  }
}
console.log(somme, compte, plusGrand);
`,
      tests: [
        { code: 'assertEqual(somme, 233168)', label: 'somme vaut 233168' },
        { code: 'assertEqual(compte, 466)', label: 'compte vaut 466 (333 multiples de 3, plus 199 de 5, moins 66 de 15)' },
        { code: 'assertEqual(plusGrand, 999)', label: 'plusGrand vaut 999 (1000 est exclu)' }
      ],
      expectOutput: '233168 466 999',
      hint: '`||` signifie « ou » : un nombre est gardé s’il est multiple de 3 ou de 5. « Strictement inférieur à 1000 » se traduit par `n < 1000`.',
      explain: 'La condition `n % 3 === 0 || n % 5 === 0` garde un nombre dès qu’une des deux divisions tombe juste ; un multiple de 15 n’est compté qu’une fois, puisqu’il n’est examiné qu’une fois. Avec `&&`, on ne garderait que les multiples de 15. La boucle va de 1 à 999 en montant : le dernier nombre retenu est donc forcément le plus grand.'
    }
  },
  {
    id: 'kata.js.duree', title: 'Formater une durée', lang: 'javascript', difficulty: 1, unit: 'js.u5',
    ex: {
      type: 'code',
      prompt: `Écris la fonction \`formaterDuree(secondes)\` qui transforme un nombre entier de secondes en texte lisible :

- \`formaterDuree(3725)\` renvoie \`"1 h 02 min 05 s"\` ;
- \`formaterDuree(65)\` renvoie \`"1 min 05 s"\` : pas d’heures si elles valent 0 ;
- \`formaterDuree(9)\` renvoie \`"9 s"\`.

Les minutes et les secondes s’écrivent toujours avec 2 chiffres quand une unité plus grande les précède.

Utile : \`Math.floor\` pour le quotient entier, \`%\` pour le reste, et \`String(5).padStart(2, "0")\` pour obtenir \`"05"\`.`,
      starter: `function formaterDuree(secondes) {
  const minutes = secondes / 60;
  const reste = secondes % 60;
  return minutes + " min " + reste + " s";
}
`,
      solution: `function deuxChiffres(n) {
  return String(n).padStart(2, "0");
}

function formaterDuree(secondes) {
  const heures = Math.floor(secondes / 3600);
  const minutes = Math.floor((secondes % 3600) / 60);
  const reste = secondes % 60;
  if (heures > 0) {
    return \`\${heures} h \${deuxChiffres(minutes)} min \${deuxChiffres(reste)} s\`;
  }
  if (minutes > 0) {
    return \`\${minutes} min \${deuxChiffres(reste)} s\`;
  }
  return \`\${reste} s\`;
}
`,
      tests: [
        { code: 'assertEqual(formaterDuree(3725), "1 h 02 min 05 s")', label: '3725 s donne « 1 h 02 min 05 s »' },
        { code: 'assertEqual(formaterDuree(65), "1 min 05 s")', label: '65 s donne « 1 min 05 s » (pas d’heures)' },
        { code: 'assertEqual(formaterDuree(9), "9 s")', label: '9 s donne « 9 s »' },
        { code: 'assertEqual(formaterDuree(3600), "1 h 00 min 00 s")', label: '3600 s donne « 1 h 00 min 00 s »' },
        { code: 'assertEqual(formaterDuree(0), "0 s")', label: '0 s donne « 0 s »' }
      ],
      hint: 'Calcule d’abord les heures, puis les minutes avec ce qui reste après les heures (`secondes % 3600`), puis les secondes. Choisis ensuite le format selon la plus grande unité non nulle.',
      explain: '`Math.floor` donne le quotient entier et `%` le reste : 3725 s = 1 h (3600 s) + 125 s, soit 2 min et 5 s. Une petite fonction `deuxChiffres` évite de répéter `padStart`. Chaque `return` traite un format ; dès qu’un `return` s’exécute, la fonction s’arrête, donc pas besoin de `else`.'
    }
  },
  {
    id: 'kata.js.panier', title: 'Total du panier', lang: 'javascript', difficulty: 2, unit: 'js.u6',
    ex: {
      type: 'code',
      prompt: `Un panier est un tableau d’objets \`{ nom, prix, quantite }\`, avec des prix en euros. Écris \`totalPanier(panier, codePromo)\` qui renvoie un objet \`{ articles, sousTotal, remise, total }\` :

- \`articles\` : le nombre total d’articles (somme des quantités) ;
- \`sousTotal\` : la somme des \`prix × quantite\` ;
- \`remise\` : 10 % du sous-total si \`codePromo\` vaut exactement \`"BIENVENUE"\`, sinon 0 ;
- \`total\` : \`sousTotal - remise\`.

Arrondis chaque montant au centime avec \`Math.round(x * 100) / 100\`. Utilise une boucle \`for...of\`. Le panier ne doit pas être modifié.`,
      starter: `function totalPanier(panier, codePromo) {
  let sousTotal = 0;
  for (const ligne of panier) {
    sousTotal += ligne.prix;
  }
  return { articles: panier.length, sousTotal: sousTotal, remise: 0, total: sousTotal };
}
`,
      solution: `function arrondir(x) {
  return Math.round(x * 100) / 100;
}

function totalPanier(panier, codePromo) {
  let articles = 0;
  let sousTotal = 0;
  for (const ligne of panier) {
    articles += ligne.quantite;
    sousTotal += ligne.prix * ligne.quantite;
  }
  sousTotal = arrondir(sousTotal);
  const remise = codePromo === "BIENVENUE" ? arrondir(sousTotal * 0.1) : 0;
  return { articles: articles, sousTotal: sousTotal, remise: remise, total: arrondir(sousTotal - remise) };
}
`,
      tests: [
        { code: `const panier = [
  { nom: "Clavier", prix: 49.9, quantite: 1 },
  { nom: "Câble USB", prix: 7.5, quantite: 3 },
  { nom: "Tapis", prix: 12, quantite: 2 },
];
assertEqual(totalPanier(panier, ""), { articles: 6, sousTotal: 96.4, remise: 0, total: 96.4 });`, label: 'Sans code promo : 6 articles, 96.4 €' },
        { code: `const panier = [
  { nom: "Clavier", prix: 49.9, quantite: 1 },
  { nom: "Câble USB", prix: 7.5, quantite: 3 },
  { nom: "Tapis", prix: 12, quantite: 2 },
];
assertEqual(totalPanier(panier, "BIENVENUE"), { articles: 6, sousTotal: 96.4, remise: 9.64, total: 86.76 });`, label: 'Avec le code BIENVENUE : 9.64 € de remise, total 86.76 €' },
        { code: 'assertEqual(totalPanier([{ nom: "Stylo", prix: 2, quantite: 1 }], "PROMO").remise, 0)', label: 'Code inconnu : pas de remise' },
        { code: 'assertEqual(totalPanier([], "BIENVENUE"), { articles: 0, sousTotal: 0, remise: 0, total: 0 })', label: 'Panier vide : tout vaut 0' },
        { code: `const panier = [{ nom: "Clavier", prix: 49.9, quantite: 2 }];
const avant = JSON.stringify(panier);
totalPanier(panier, "BIENVENUE");
assertEqual(JSON.stringify(panier), avant);`, label: 'Le panier n’est pas modifié' }
      ],
      hint: 'Deux accumulateurs dans la même boucle : un pour les quantités, un pour les montants. Calcule la remise à partir du sous-total déjà arrondi.',
      explain: 'Une seule boucle `for...of` suffit pour accumuler les quantités et les montants. Le prix d’une ligne vaut `prix * quantite`, pas seulement `prix`. L’opérateur conditionnel `condition ? a : b` choisit la remise en une ligne. On arrondit au centime car les nombres à virgule ne sont pas exacts en binaire : `0.1 + 0.2` vaut `0.30000000000000004` en JavaScript.'
    }
  },
  {
    id: 'kata.js.statistiques', title: 'Statistiques avec reduce', lang: 'javascript', difficulty: 2, unit: 'js.u7',
    ex: {
      type: 'code',
      prompt: `Écris \`statistiques(notes)\` qui renvoie \`{ min, max, moyenne }\` pour un tableau de nombres, en un seul passage avec \`reduce\`. La moyenne est arrondie à 2 décimales avec \`Math.round(x * 100) / 100\`. Pour un tableau vide, renvoie \`null\`.

Exemple : \`statistiques([12, 8, 15])\` renvoie \`{ min: 8, max: 15, moyenne: 11.67 }\`.`,
      starter: `function statistiques(notes) {
  let somme = 0;
  for (const n of notes) {
    somme += n;
  }
  return { min: 0, max: 0, moyenne: somme / notes.length };
}
`,
      solution: `function statistiques(notes) {
  if (notes.length === 0) {
    return null;
  }
  const bilan = notes.reduce(
    (acc, n) => ({
      min: Math.min(acc.min, n),
      max: Math.max(acc.max, n),
      somme: acc.somme + n,
    }),
    { min: Infinity, max: -Infinity, somme: 0 }
  );
  return {
    min: bilan.min,
    max: bilan.max,
    moyenne: Math.round((bilan.somme / notes.length) * 100) / 100,
  };
}
`,
      tests: [
        { code: 'assertEqual(statistiques([12, 8, 15]), { min: 8, max: 15, moyenne: 11.67 })', label: 'statistiques([12, 8, 15]) renvoie { min: 8, max: 15, moyenne: 11.67 }' },
        { code: 'assertEqual(statistiques([-3, -7]), { min: -7, max: -3, moyenne: -5 })', label: 'Nombres négatifs : min -7, max -3, moyenne -5' },
        { code: 'assertEqual(statistiques([4]), { min: 4, max: 4, moyenne: 4 })', label: 'Un seul élément : min, max et moyenne valent 4' },
        { code: 'assertEqual(statistiques([]), null)', label: 'Tableau vide : null' }
      ],
      checks: [{ re: '\\.reduce\\(', label: 'Utilise reduce' }],
      hint: 'L’accumulateur de `reduce` peut être un objet `{ min, max, somme }`. Pour le minimum, une valeur de départ `Infinity` est plus grande que tout nombre.',
      explain: '`reduce` parcourt le tableau une seule fois en transportant un accumulateur ; ici, un objet qui garde le minimum, le maximum et la somme. Partir de `Infinity` et `-Infinity` garantit que le premier nombre remplace ces valeurs, même s’il est négatif (partir de 0 donnerait un maximum faux pour `[-3, -7]`). Le cas du tableau vide est traité à part, sinon la moyenne serait une division par zéro.'
    }
  },
  {
    id: 'kata.js.regrouper', title: 'Regrouper des objets', lang: 'javascript', difficulty: 3, unit: 'js.u7',
    ex: {
      type: 'code',
      prompt: `Écris \`regrouperPar(elements, cle)\` qui regroupe les objets d’un tableau selon la valeur d’une de leurs propriétés, avec \`reduce\`. Elle renvoie un objet : chaque valeur rencontrée y est associée au tableau des objets correspondants, dans l’ordre d’origine.

Exemple : avec \`[{ nom: "Ada", ville: "Lyon" }, { nom: "Linus", ville: "Paris" }, { nom: "Grace", ville: "Lyon" }]\` et la clé \`"ville"\`, on obtient \`{ Lyon: [objet d’Ada, objet de Grace], Paris: [objet de Linus] }\`.

Écris aussi \`compterPar(elements, cle)\` qui renvoie le nombre d’objets par valeur, par exemple \`{ Lyon: 2, Paris: 1 }\`, en réutilisant \`regrouperPar\`.`,
      starter: `function regrouperPar(elements, cle) {
  const groupes = {};
  for (const element of elements) {
    groupes[element[cle]] = [element];
  }
  return groupes;
}

function compterPar(elements, cle) {
  return {};
}
`,
      solution: `function regrouperPar(elements, cle) {
  return elements.reduce((groupes, element) => {
    const valeur = element[cle];
    if (!groupes[valeur]) {
      groupes[valeur] = [];
    }
    groupes[valeur].push(element);
    return groupes;
  }, {});
}

function compterPar(elements, cle) {
  const groupes = regrouperPar(elements, cle);
  const comptes = {};
  for (const valeur in groupes) {
    comptes[valeur] = groupes[valeur].length;
  }
  return comptes;
}
`,
      tests: [
        { code: `const personnes = [
  { nom: "Ada", ville: "Lyon", langage: "Python" },
  { nom: "Linus", ville: "Paris", langage: "C" },
  { nom: "Grace", ville: "Lyon", langage: "COBOL" },
  { nom: "Guido", ville: "Nantes", langage: "Python" },
];
const g = regrouperPar(personnes, "ville");
assertEqual(Object.keys(g), ["Lyon", "Paris", "Nantes"]);
assertEqual(g.Lyon.map((p) => p.nom), ["Ada", "Grace"]);`, label: 'Regroupement par ville, dans l’ordre d’origine' },
        { code: `const personnes = [
  { nom: "Ada", ville: "Lyon", langage: "Python" },
  { nom: "Guido", ville: "Nantes", langage: "Python" },
];
const g = regrouperPar(personnes, "langage");
assert(g.Python[1] === personnes[1], "les groupes doivent contenir les objets d’origine");`, label: 'Les groupes contiennent les objets complets d’origine' },
        { code: 'assertEqual(regrouperPar([], "ville"), {})', label: 'Tableau vide : objet vide' },
        { code: `const personnes = [
  { nom: "Ada", ville: "Lyon", langage: "Python" },
  { nom: "Linus", ville: "Paris", langage: "C" },
  { nom: "Grace", ville: "Lyon", langage: "COBOL" },
  { nom: "Guido", ville: "Nantes", langage: "Python" },
];
assertEqual(compterPar(personnes, "langage"), { Python: 2, C: 1, COBOL: 1 });`, label: 'compterPar par langage : { Python: 2, C: 1, COBOL: 1 }' }
      ],
      checks: [{ re: '\\.reduce\\(', label: 'Utilise reduce' }],
      hint: 'L’accumulateur de `reduce` est l’objet des groupes, qui part de `{}`. Si la valeur n’a pas encore de tableau, crée-le, puis ajoute l’élément avec `push`. N’oublie pas de renvoyer l’accumulateur à chaque tour.',
      explain: 'Le code de départ remplace le tableau à chaque fois au lieu d’y ajouter l’élément : il ne garde que le dernier objet de chaque groupe. Avec `reduce`, l’accumulateur commence vide et se remplit tour après tour ; l’oubli du `return groupes` est l’erreur la plus fréquente. `compterPar` réutilise `regrouperPar` au lieu de refaire le même travail. Les navigateurs récents proposent `Object.groupBy`, qui fait la même chose que `regrouperPar`.'
    }
  },
  {
    id: 'kata.js.compteur-dom', title: 'Compteur de clics', lang: 'javascript', difficulty: 2, unit: 'js.u9',
    ex: {
      type: 'code',
      dom: true,
      html: `<p>Valeur : <output id="valeur">0</output></p>
<button id="moins" type="button">-1</button>
<button id="plus" type="button">+1</button>
<button id="raz" type="button">Remettre à zéro</button>`,
      prompt: `La page contient un affichage \`#valeur\` et trois boutons \`#moins\`, \`#plus\` et \`#raz\`. Programme le compteur :

- \`#plus\` ajoute 1, \`#moins\` enlève 1, \`#raz\` remet à 0 ;
- la valeur ne descend jamais sous 0 ;
- le bouton \`#moins\` est désactivé (\`disabled\`) quand la valeur vaut 0, et réactivé sinon ;
- l’affichage est mis à jour à chaque clic.

Au chargement, la valeur vaut 0, donc \`#moins\` est déjà désactivé.`,
      starter: `const affichage = document.querySelector("#valeur");
let valeur = 0;

document.querySelector("#plus").addEventListener("click", () => {
  valeur++;
});
`,
      solution: `const affichage = document.querySelector("#valeur");
const boutonMoins = document.querySelector("#moins");
let valeur = 0;

function afficher() {
  affichage.textContent = valeur;
  boutonMoins.disabled = valeur === 0;
}

document.querySelector("#plus").addEventListener("click", () => {
  valeur++;
  afficher();
});

boutonMoins.addEventListener("click", () => {
  if (valeur > 0) {
    valeur--;
  }
  afficher();
});

document.querySelector("#raz").addEventListener("click", () => {
  valeur = 0;
  afficher();
});

afficher();
`,
      tests: [
        { code: 'assertEqual(document.querySelector("#valeur").textContent, "0");\nassert(document.querySelector("#moins").disabled, "#moins devrait être désactivé au départ");', label: 'Au départ : 0 affiché et #moins désactivé' },
        { code: 'const plus = document.querySelector("#plus");\nplus.click();\nplus.click();\nplus.click();\nassertEqual(document.querySelector("#valeur").textContent, "3");\nassert(!document.querySelector("#moins").disabled, "#moins devrait être actif");', label: 'Trois clics sur +1 : affiche 3 et active -1' },
        { code: 'document.querySelector("#moins").click();\nassertEqual(document.querySelector("#valeur").textContent, "2");', label: 'Un clic sur -1 : affiche 2' },
        { code: 'document.querySelector("#raz").click();\nassertEqual(document.querySelector("#valeur").textContent, "0");\nassert(document.querySelector("#moins").disabled, "#moins devrait être désactivé à 0");\ndocument.querySelector("#moins").click();\nassertEqual(document.querySelector("#valeur").textContent, "0");', label: 'Remise à zéro, puis -1 ne descend pas sous 0' }
      ],
      hint: 'Écris une fonction `afficher()` qui met à jour le texte et l’état `disabled` du bouton, et appelle-la après chaque changement, ainsi qu’une fois au chargement.',
      explain: 'La valeur vit dans une variable ; la page n’en est qu’un reflet. Centraliser la mise à jour dans `afficher()` évite d’oublier une étape dans l’un des trois écouteurs. `boutonMoins.disabled = valeur === 0` active ou désactive le bouton en une ligne. Le test `valeur > 0` reste utile même avec le bouton désactivé : une règle importante se protège dans le code, pas seulement dans l’interface.'
    }
  },
  {
    id: 'kata.js.annuaire-fetch', title: 'Annuaire avec fetch', lang: 'javascript', difficulty: 3, unit: 'js.u13',
    ex: {
      type: 'code',
      prompt: `Le faux serveur d’entraînement de CodeQuest répond aux adresses \`https://api.codequest.test/...\` : aucune requête ne part sur Internet.

- \`GET /users\` renvoie la liste des utilisateurs \`[{ id, nom }, ...]\` ;
- \`GET /users/2\` renvoie un utilisateur ; un id inconnu, comme \`/users/99\`, répond avec le statut 404.

Écris deux fonctions asynchrones :

- \`nomsTries()\` renvoie le tableau des noms, triés par ordre alphabétique ;
- \`nomUtilisateur(id)\` renvoie le nom de l’utilisateur, ou \`null\` si le serveur répond 404. Pour tout autre statut d’erreur, elle lève une \`Error\`.

Rappel : \`fetch\` renvoie une promesse, et \`reponse.json()\` aussi.`,
      starter: `const API = "https://api.codequest.test";

async function nomsTries() {
  const reponse = fetch(API + "/users");
  return reponse.json();
}

async function nomUtilisateur(id) {
  const reponse = await fetch(API + "/users/" + id);
  const utilisateur = await reponse.json();
  return utilisateur.nom;
}
`,
      solution: `const API = "https://api.codequest.test";

async function nomsTries() {
  const reponse = await fetch(API + "/users");
  const utilisateurs = await reponse.json();
  return utilisateurs.map((u) => u.nom).sort();
}

async function nomUtilisateur(id) {
  const reponse = await fetch(API + "/users/" + id);
  if (reponse.status === 404) {
    return null;
  }
  if (!reponse.ok) {
    throw new Error("Erreur du serveur : " + reponse.status);
  }
  const utilisateur = await reponse.json();
  return utilisateur.nom;
}
`,
      tests: [
        { code: 'assertEqual(await nomsTries(), ["Ada", "Grace", "Linus"]);', label: 'nomsTries() renvoie ["Ada", "Grace", "Linus"]' },
        { code: 'assertEqual(await nomUtilisateur(2), "Linus");', label: 'nomUtilisateur(2) renvoie "Linus"' },
        { code: 'assertEqual(await nomUtilisateur(99), null);', label: 'nomUtilisateur(99) renvoie null (statut 404)' },
        { code: `const vraiFetch = fetch;
fetch = () => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) });
let erreur = null;
try {
  await nomUtilisateur(1);
} catch (e) {
  erreur = e;
} finally {
  fetch = vraiFetch;
}
assert(erreur instanceof Error, "une Error devrait être levée pour le statut 500");`, label: 'Statut 500 (serveur simulé en panne) : une Error est levée' }
      ],
      hint: 'Chaque appel qui renvoie une promesse doit être attendu avec `await`. Regarde `reponse.status` (ou `reponse.ok`) avant de lire le corps de la réponse.',
      explain: 'Sans `await`, `reponse` est une promesse et non une réponse : `reponse.json` n’existe pas encore. Un statut 404 n’est pas une erreur réseau, `fetch` ne lève donc rien tout seul : c’est à toi de tester `reponse.status` ou `reponse.ok`. Distinguer « introuvable » (`null`, une situation normale) d’une vraie panne (une `Error`) permet à l’appelant de réagir correctement. Enfin, `map` puis `sort` transforment la liste d’objets en noms triés.'
    }
  },
  {
    id: 'kata.js.lire-prix', title: 'Lire un prix sans planter', lang: 'javascript', difficulty: 2, unit: 'js.u14',
    ex: {
      type: 'code',
      prompt: `Écris \`lirePrix(texte)\` qui convertit en nombre un prix saisi par une personne :

- les espaces autour et le symbole \`€\` sont ignorés, et la virgule est acceptée comme séparateur décimal : \`" 12,50 € "\` donne \`12.5\` ;
- si \`texte\` n’est pas une chaîne, elle lève une \`TypeError\` ;
- si le texte n’est pas un nombre valide (ou s’il est vide), elle lève une \`Error\` dont le message est \`"prix invalide : "\` suivi du texte reçu ;
- si le prix est négatif, elle lève une \`RangeError\`.

Écris ensuite \`prixOuDefaut(texte, defaut)\` qui renvoie \`lirePrix(texte)\`, ou \`defaut\` si une erreur est levée.

Attention : \`Number("")\` vaut 0 et \`Number("abc")\` vaut \`NaN\`, que \`Number.isNaN\` permet de détecter.`,
      starter: `function lirePrix(texte) {
  return Number(texte);
}

function prixOuDefaut(texte, defaut) {
  return lirePrix(texte);
}
`,
      solution: `function lirePrix(texte) {
  if (typeof texte !== "string") {
    throw new TypeError("le prix doit être une chaîne");
  }
  const nettoye = texte.replace("€", "").trim().replace(",", ".");
  const prix = Number(nettoye);
  if (nettoye === "" || Number.isNaN(prix)) {
    throw new Error("prix invalide : " + texte);
  }
  if (prix < 0) {
    throw new RangeError("le prix ne peut pas être négatif");
  }
  return prix;
}

function prixOuDefaut(texte, defaut) {
  try {
    return lirePrix(texte);
  } catch (erreur) {
    return defaut;
  }
}
`,
      tests: [
        { code: 'assertEqual(lirePrix(" 12,50 € "), 12.5);\nassertEqual(lirePrix("7"), 7);', label: '« 12,50 € » donne 12.5 et « 7 » donne 7' },
        { code: 'let e = null;\ntry { lirePrix("douze"); } catch (err) { e = err; }\nassert(e instanceof Error, "aucune erreur levée pour « douze »");\nassertEqual(e.message, "prix invalide : douze");', label: 'Texte non numérique : Error « prix invalide : douze »' },
        { code: 'let e = null;\ntry { lirePrix(""); } catch (err) { e = err; }\nassert(e instanceof Error, "le texte vide doit être refusé");\nassertEqual(e.message, "prix invalide : ");', label: 'Texte vide refusé (Number("") vaudrait 0)' },
        { code: 'let e1 = null;\nlet e2 = null;\ntry { lirePrix(12); } catch (err) { e1 = err; }\ntry { lirePrix("-3"); } catch (err) { e2 = err; }\nassert(e1 instanceof TypeError, "TypeError attendue pour le nombre 12");\nassert(e2 instanceof RangeError, "RangeError attendue pour -3");', label: 'Nombre au lieu de texte : TypeError ; prix négatif : RangeError' },
        { code: 'assertEqual(prixOuDefaut("3,99", 0), 3.99);\nassertEqual(prixOuDefaut("gratuit", 0), 0);\nassertEqual(prixOuDefaut(null, -1), -1);', label: 'prixOuDefaut renvoie le prix, ou la valeur par défaut en cas d’erreur' }
      ],
      hint: 'Vérifie le type en premier avec `typeof`. Nettoie ensuite le texte (`replace`, `trim`), convertis-le avec `Number`, puis vérifie le résultat avant de le renvoyer.',
      explain: 'Chaque type d’erreur dit ce qui ne va pas : `TypeError` pour une valeur du mauvais type, `RangeError` pour une valeur hors des limites, `Error` pour le reste. `Number` ne lève jamais d’erreur, il renvoie `NaN` : c’est à nous de le détecter, et de refuser le texte vide qu’il transformerait en 0. `prixOuDefaut` montre l’autre côté : `try...catch` attrape l’erreur là où l’on sait quoi faire, ici renvoyer une valeur de secours.'
    }
  },

  // =====================================================================
  // SQL (4) : jeu de données « boutique »
  // =====================================================================
  {
    id: 'kata.sql.fiches-incompletes', title: 'Fiches clients incomplètes', lang: 'sql', difficulty: 1, unit: 'sql.u2',
    ex: {
      type: 'code',
      db: 'boutique',
      prompt: `Le service client veut compléter les fiches incomplètes. Dans la table \`clients\`, affiche le prénom, le nom, l’e-mail et la ville des clients dont l’e-mail **ou** la ville n’est pas renseigné (valeur NULL).

Le code actuel ne renvoie aucune ligne : corrige-le.`,
      starter: `SELECT prenom, nom, email, ville
FROM clients
WHERE email = NULL OR ville = NULL;`,
      solution: `SELECT prenom, nom, email, ville
FROM clients
WHERE email IS NULL OR ville IS NULL;`,
      ordered: false,
      hint: 'Une valeur manquante ne se compare jamais avec `=`. Quel opérateur teste l’absence de valeur ?',
      explain: '`NULL` signifie « valeur inconnue » : `email = NULL` ne vaut jamais vrai, d’où le résultat vide. On teste l’absence de valeur avec `IS NULL` (et sa présence avec `IS NOT NULL`). Avec `OR`, il suffit qu’une des deux informations manque pour que la ligne soit gardée : 4 clients sont concernés, dont une cliente sans e-mail ni ville.'
    }
  },
  {
    id: 'kata.sql.categories', title: 'Bilan par catégorie', lang: 'sql', difficulty: 2, unit: 'sql.u6',
    ex: {
      type: 'code',
      db: 'boutique',
      prompt: `Pour chaque catégorie de produits qui compte **au moins 3 produits**, affiche la catégorie, le nombre de produits et le prix moyen arrondi à 2 décimales (\`ROUND(..., 2)\`). Trie du prix moyen le plus élevé au plus bas.

Le code actuel provoque une erreur : corrige-le.`,
      starter: `SELECT categorie, COUNT(*) AS nb_produits, ROUND(AVG(prix), 2) AS prix_moyen
FROM produits
WHERE COUNT(*) >= 3
GROUP BY categorie
ORDER BY prix_moyen DESC;`,
      solution: `SELECT categorie, COUNT(*) AS nb_produits, ROUND(AVG(prix), 2) AS prix_moyen
FROM produits
GROUP BY categorie
HAVING COUNT(*) >= 3
ORDER BY prix_moyen DESC;`,
      ordered: true,
      hint: '`WHERE` filtre les lignes avant le regroupement : à ce moment-là, les groupes n’existent pas encore. Quelle clause filtre les groupes eux-mêmes ?',
      explain: 'L’ordre d’exécution explique l’erreur : `WHERE` agit sur chaque ligne, avant `GROUP BY`, donc il ne peut pas utiliser `COUNT(*)`. `HAVING` filtre après le regroupement, sur les résultats des agrégats. Les catégories Maison (2 produits) et le produit sans catégorie disparaissent ; il reste Informatique, Audio, Livres et Accessoires, triés par prix moyen décroissant.'
    }
  },
  {
    id: 'kata.sql.commandes-par-client', title: 'Commandes par client', lang: 'sql', difficulty: 3, unit: 'sql.u7',
    ex: {
      type: 'code',
      db: 'boutique',
      prompt: `Pour **chaque** client, affiche son prénom, son nom et son nombre de commandes non annulées (statut différent de \`'annulee'\`). Les clients sans commande doivent apparaître avec 0.

Trie par nombre de commandes décroissant, puis par nom, puis par prénom.

Le code actuel fait disparaître une partie des clients : corrige-le.`,
      starter: `SELECT c.prenom, c.nom, COUNT(*) AS nb_commandes
FROM clients AS c
LEFT JOIN commandes AS co ON co.client_id = c.id
WHERE co.statut <> 'annulee'
GROUP BY c.id
ORDER BY nb_commandes DESC, c.nom, c.prenom;`,
      solution: `SELECT c.prenom, c.nom, COUNT(co.id) AS nb_commandes
FROM clients AS c
LEFT JOIN commandes AS co
  ON co.client_id = c.id AND co.statut <> 'annulee'
GROUP BY c.id
ORDER BY nb_commandes DESC, c.nom, c.prenom;`,
      ordered: true,
      hint: 'Une condition sur la table de droite placée dans `WHERE` supprime les lignes où elle vaut NULL, donc les clients sans commande. Où d’autre peut-on placer cette condition ? Et que compte `COUNT(*)` pour un client sans commande ?',
      explain: 'Avec `LEFT JOIN`, un client sans commande garde une ligne où les colonnes de `commandes` valent NULL. Le `WHERE co.statut <> \'annulee\'` élimine ces lignes, car comparer NULL ne donne ni vrai ni faux. Placée dans le `ON`, la condition filtre les commandes sans toucher aux clients. Enfin, `COUNT(co.id)` ne compte que les valeurs non NULL, donc 0 pour un client sans commande, alors que `COUNT(*)` compterait 1. `GROUP BY c.id` sépare bien les deux clients homonymes.'
    }
  },
  {
    id: 'kata.sql.au-dessus-moyenne', title: 'Au-dessus de la moyenne', lang: 'sql', difficulty: 3, unit: 'sql.u11',
    ex: {
      type: 'code',
      db: 'boutique',
      prompt: `Affiche le nom, la catégorie et le prix des produits **plus chers que le prix moyen de leur propre catégorie**. Trie par catégorie (ordre alphabétique), puis par prix décroissant.

Le code actuel compare chaque produit à la moyenne de tous les produits : corrige-le avec une sous-requête qui dépend du produit examiné.`,
      starter: `SELECT nom, categorie, prix
FROM produits
WHERE prix > (SELECT AVG(prix) FROM produits)
ORDER BY categorie, prix DESC;`,
      solution: `SELECT p.nom, p.categorie, p.prix
FROM produits AS p
WHERE p.prix > (
  SELECT AVG(p2.prix)
  FROM produits AS p2
  WHERE p2.categorie = p.categorie
)
ORDER BY p.categorie, p.prix DESC;`,
      ordered: true,
      hint: 'La table `produits` apparaît deux fois : donne-lui un alias différent dans la requête principale et dans la sous-requête, puis filtre la sous-requête sur la catégorie du produit examiné.',
      explain: 'La sous-requête est **corrélée** : elle utilise `p.categorie`, la catégorie du produit en cours d’examen, et se recalcule donc pour chaque produit. Comparer à la moyenne générale mélangerait des livres à 30 € et des écrans à 250 €. Pour le produit sans catégorie, `p2.categorie = NULL` ne trouve rien : la moyenne vaut NULL et le produit est écarté. Autre écriture possible : une jointure avec une sous-requête `GROUP BY categorie` qui calcule toutes les moyennes une seule fois.'
    }
  },

  // =====================================================================
  // HTML et CSS (4)
  // =====================================================================
  {
    id: 'kata.web.formulaire-accessible', title: 'Formulaire accessible', lang: 'html', difficulty: 2, unit: 'web.u5',
    ex: {
      type: 'code',
      prompt: `Ce formulaire d’inscription n’est pas utilisable au clavier ni avec un lecteur d’écran. Corrige-le :

- chaque champ a un \`label\` relié par \`for\` et \`id\` ; utilise les id \`email\`, \`mdp\`, \`newsletter\` et \`conditions\` ;
- le champ e-mail est de type \`email\` et obligatoire (\`required\`) ;
- le mot de passe est de type \`password\`, obligatoire, avec au moins 12 caractères (\`minlength\`) ;
- les deux cases à cocher sont regroupées dans un \`fieldset\` avec une \`legend\` ;
- le faux bouton \`div\` est remplacé par un vrai \`button\` de type \`submit\`.`,
      starter: `<form>
  <p>Inscription</p>
  E-mail <input type="text" name="email">
  Mot de passe <input type="text" name="mdp">
  <input type="checkbox" name="newsletter"> Recevoir la newsletter
  <input type="checkbox" name="conditions"> J'accepte les conditions
  <div class="bouton" onclick="envoyer()">Envoyer</div>
</form>
`,
      solution: `<form>
  <h2>Inscription</h2>
  <p>
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" autocomplete="email" required>
  </p>
  <p>
    <label for="mdp">Mot de passe (12 caractères minimum)</label>
    <input type="password" id="mdp" name="mdp" minlength="12" autocomplete="new-password" required>
  </p>
  <fieldset>
    <legend>Préférences</legend>
    <p>
      <input type="checkbox" id="newsletter" name="newsletter">
      <label for="newsletter">Recevoir la newsletter</label>
    </p>
    <p>
      <input type="checkbox" id="conditions" name="conditions" required>
      <label for="conditions">J'accepte les conditions</label>
    </p>
  </fieldset>
  <button type="submit">Envoyer</button>
</form>
`,
      checks: [
        { sel: 'input#email', attrs: { type: 'email' }, label: 'Le champ e-mail a l’id email et le type email' },
        { sel: 'input#email[required]', label: 'Le champ e-mail est obligatoire' },
        { sel: 'input#mdp[type="password"][required][minlength="12"]', label: 'Mot de passe : type password, obligatoire, 12 caractères minimum' },
        { sel: 'label[for="email"], label[for="mdp"], label[for="newsletter"], label[for="conditions"]', count: 4, label: 'Les 4 champs ont chacun un label relié par for' },
        { sel: 'input#newsletter[type="checkbox"], input#conditions[type="checkbox"]', count: 2, label: 'Les cases à cocher ont les id newsletter et conditions' },
        { sel: 'fieldset legend', label: 'Un fieldset avec une legend' },
        { sel: 'fieldset input[type="checkbox"]', count: 2, label: 'Les deux cases à cocher sont dans le fieldset' },
        { sel: 'button[type="submit"]', label: 'Un vrai bouton de type submit' },
        { none: 'div[onclick]', label: 'Plus de faux bouton div' }
      ],
      hint: 'Un label se relie à son champ quand son attribut `for` vaut l’`id` du champ. Les types `email` et `password`, ainsi que `required` et `minlength`, donnent au navigateur des vérifications gratuites.',
      explain: 'Un `label` relié par `for` et `id` est lu par les lecteurs d’écran et agrandit la zone cliquable (cliquer sur le texte coche la case). Les bons types de champ affichent le bon clavier sur mobile et activent la vérification du navigateur. `fieldset` et `legend` donnent un titre commun aux cases. Enfin, un vrai `button` est atteignable avec Tab et s’active avec Entrée, ce qu’un `div` cliquable ne permet pas.'
    }
  },
  {
    id: 'kata.web.carte-profil', title: 'Carte de profil en flex', lang: 'html', difficulty: 2, unit: 'web.u9',
    ex: {
      type: 'code',
      prompt: `Mets en forme cette carte de profil avec flexbox, en complétant le CSS :

- \`.carte\` est un conteneur flex : la photo à gauche, le texte à droite, centrés verticalement (\`align-items: center\`), avec un espace de \`16px\` entre eux (\`gap\`) ;
- \`.carte\` a un \`padding\` de \`16px\` et des coins arrondis (\`border-radius: 12px\`) ;
- la photo \`.carte img\` est ronde (\`border-radius: 50%\`) et ne rétrécit jamais (\`flex-shrink: 0\`) ;
- la liste \`.competences\` est elle aussi en flex, avec retour à la ligne (\`flex-wrap: wrap\`).`,
      starter: `<style>
  .carte { border: 1px solid #ccc; max-width: 480px; }
  .competences { list-style: none; padding: 0; }
  .competences li { background: #eef; padding: 4px 8px; border-radius: 4px; }
</style>
<article class="carte">
  <img src="avatar.png" alt="Portrait de Grace Hopper" width="96" height="96">
  <div>
    <h2>Grace Hopper</h2>
    <p>Informaticienne, pionnière des compilateurs.</p>
    <ul class="competences">
      <li>COBOL</li>
      <li>Compilateurs</li>
      <li>Débogage</li>
    </ul>
  </div>
</article>
`,
      solution: `<style>
  .carte { border: 1px solid #ccc; max-width: 480px; }
  .competences { list-style: none; padding: 0; }
  .competences li { background: #eef; padding: 4px 8px; border-radius: 4px; }

  .carte {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
  }
  .carte img {
    border-radius: 50%;
    flex-shrink: 0;
  }
  .competences {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
<article class="carte">
  <img src="avatar.png" alt="Portrait de Grace Hopper" width="96" height="96">
  <div>
    <h2>Grace Hopper</h2>
    <p>Informaticienne, pionnière des compilateurs.</p>
    <ul class="competences">
      <li>COBOL</li>
      <li>Compilateurs</li>
      <li>Débogage</li>
    </ul>
  </div>
</article>
`,
      checks: [
        { sel: '.carte', style: { display: 'flex' }, label: '.carte est un conteneur flex' },
        { sel: '.carte', style: { 'align-items': 'center' }, label: 'Photo et texte sont centrés verticalement' },
        { sel: '.carte', style: { 'column-gap': '16px' }, label: 'Un espace de 16px entre la photo et le texte' },
        { sel: '.carte', style: { 'padding-top': '16px', 'padding-left': '16px', 'border-top-left-radius': '12px' }, label: '.carte a un padding de 16px et des coins arrondis de 12px' },
        { sel: '.carte img', style: { 'border-top-left-radius': '50%', 'flex-shrink': '0' }, label: 'La photo est ronde et ne rétrécit pas' },
        { sel: '.competences', style: { display: 'flex', 'flex-wrap': 'wrap' }, label: '.competences est en flex avec retour à la ligne' }
      ],
      hint: 'Le conteneur flex est `.carte` : c’est sur lui que se placent `display`, `align-items` et `gap`. Les propriétés propres à la photo vont sur `.carte img`.',
      explain: '`display: flex` aligne les enfants directs de `.carte` (l’image et le bloc de texte) sur une ligne. `align-items` les centre sur l’axe vertical et `gap` les espace sans marge à calculer. Par défaut, un élément flex peut rétrécir : `flex-shrink: 0` protège la photo quand la carte est étroite. Une liste en `flex-wrap: wrap` passe à la ligne au lieu de déborder.'
    }
  },
  {
    id: 'kata.web.grille-projets', title: 'Grille de projets', lang: 'html', difficulty: 3, unit: 'web.u10',
    ex: {
      type: 'code',
      prompt: `Affiche les cartes de projets en grille avec CSS Grid, en complétant le CSS (ne change pas la largeur de \`.projets\`) :

- \`.projets\` est une grille de 3 colonnes de même largeur, avec un espace de \`20px\` entre les cases ;
- le projet vedette \`.vedette\` occupe 2 colonnes ;
- le pied de page \`.projets footer\` occupe toute la largeur de la grille.`,
      starter: `<style>
  .projets { width: 700px; }
  .projet { border: 1px solid #ccd; border-radius: 8px; padding: 12px; }
  .projets footer { text-align: center; }
</style>
<section class="projets">
  <article class="projet vedette"><h3>Chatbot</h3><p>Un assistant qui répond aux questions.</p></article>
  <article class="projet"><h3>Météo</h3><p>Une appli qui affiche la météo.</p></article>
  <article class="projet"><h3>Quiz</h3><p>Un jeu de questions.</p></article>
  <article class="projet"><h3>Portfolio</h3><p>Mon site personnel.</p></article>
  <article class="projet"><h3>Data</h3><p>Un tableau de bord.</p></article>
  <footer>5 projets</footer>
</section>
`,
      solution: `<style>
  .projets { width: 700px; }
  .projet { border: 1px solid #ccd; border-radius: 8px; padding: 12px; }
  .projets footer { text-align: center; }

  .projets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .vedette {
    grid-column: span 2;
  }
  .projets footer {
    grid-column: 1 / -1;
  }
</style>
<section class="projets">
  <article class="projet vedette"><h3>Chatbot</h3><p>Un assistant qui répond aux questions.</p></article>
  <article class="projet"><h3>Météo</h3><p>Une appli qui affiche la météo.</p></article>
  <article class="projet"><h3>Quiz</h3><p>Un jeu de questions.</p></article>
  <article class="projet"><h3>Portfolio</h3><p>Mon site personnel.</p></article>
  <article class="projet"><h3>Data</h3><p>Un tableau de bord.</p></article>
  <footer>5 projets</footer>
</section>
`,
      checks: [
        { sel: '.projets', style: { display: 'grid' }, label: '.projets est une grille' },
        { sel: '.projets', style: { 'grid-template-columns': '220px 220px 220px' }, label: '3 colonnes de même largeur (220px chacune avec les espaces)' },
        { sel: '.projets', style: { 'column-gap': '20px', 'row-gap': '20px' }, label: 'Un espace de 20px entre les cases' },
        { sel: '.vedette', style: { width: '434px' }, label: 'Le projet vedette occupe 2 colonnes' },
        { sel: '.projets footer', style: { width: '700px' }, label: 'Le pied de page occupe toute la largeur' }
      ],
      hint: '`repeat(3, 1fr)` crée 3 colonnes égales. Pour qu’un élément s’étende, utilise `grid-column` : `span 2` pour 2 colonnes, `1 / -1` pour aller de la première à la dernière ligne de grille.',
      explain: 'Avec `1fr`, l’espace libre est partagé à parts égales : (700 − 2 × 20) / 3 = 220px par colonne. `grid-column: span 2` fait s’étendre la carte vedette sur 2 colonnes, sans préciser où elle commence. `1 / -1` va de la première ligne de grille à la dernière : le pied de page couvre toute la largeur, quel que soit le nombre de colonnes. Les autres cartes se placent automatiquement dans les cases libres.'
    }
  },
  {
    id: 'kata.web.nav-responsive', title: 'Barre de navigation responsive', lang: 'html', difficulty: 3, unit: 'web.u11',
    ex: {
      type: 'code',
      prompt: `Rends cette barre de navigation responsive, en partant du mobile (*mobile first*) :

- par défaut, sur petit écran, \`.nav\` est en flex **en colonne**, et la liste \`.nav ul\` aussi : le logo, puis les liens les uns sous les autres ;
- à partir de \`700px\` de large (\`@media (min-width: 700px)\`), \`.nav\` passe en ligne, avec le logo à gauche et les liens à droite (\`justify-content: space-between\`), centrés verticalement ;
- à partir de \`700px\`, \`.nav ul\` passe aussi en ligne : les liens côte à côte.`,
      starter: `<style>
  .nav { background: #12263a; padding: 8px 16px; }
  .nav a { color: white; text-decoration: none; padding: 12px; }
  .nav ul { list-style: none; margin: 0; padding: 0; }
  .logo { font-weight: bold; }
</style>
<nav class="nav" aria-label="Navigation principale">
  <a class="logo" href="#">CodeQuest</a>
  <ul>
    <li><a href="#parcours">Parcours</a></li>
    <li><a href="#katas">Katas</a></li>
    <li><a href="#defi">Défi du jour</a></li>
  </ul>
</nav>
`,
      solution: `<style>
  .nav { background: #12263a; padding: 8px 16px; }
  .nav a { color: white; text-decoration: none; padding: 12px; }
  .nav ul { list-style: none; margin: 0; padding: 0; }
  .logo { font-weight: bold; }

  .nav {
    display: flex;
    flex-direction: column;
  }
  .nav ul {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 700px) {
    .nav {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .nav ul {
      flex-direction: row;
      gap: 8px;
    }
  }
</style>
<nav class="nav" aria-label="Navigation principale">
  <a class="logo" href="#">CodeQuest</a>
  <ul>
    <li><a href="#parcours">Parcours</a></li>
    <li><a href="#katas">Katas</a></li>
    <li><a href="#defi">Défi du jour</a></li>
  </ul>
</nav>
`,
      checks: [
        { sel: '.nav', style: { display: 'flex', 'flex-direction': 'column' }, vw: 360, label: 'Sur mobile (360px) : .nav est en flex, en colonne' },
        { sel: '.nav ul', style: { display: 'flex', 'flex-direction': 'column' }, vw: 360, label: 'Sur mobile : les liens sont les uns sous les autres' },
        { sel: '.nav', style: { 'flex-direction': 'row' }, vw: 700, label: 'Dès 700px de large : .nav passe en ligne' },
        { sel: '.nav', style: { 'justify-content': 'space-between', 'align-items': 'center' }, vw: 1000, label: 'Sur grand écran : logo à gauche, liens à droite, centrés verticalement' },
        { sel: '.nav ul', style: { display: 'flex', 'flex-direction': 'row' }, vw: 1000, label: 'Sur grand écran : les liens sont côte à côte' }
      ],
      hint: 'Écris d’abord les règles du mobile, sans media query. Dans `@media (min-width: 700px) { ... }`, ne remets que ce qui change : la direction, l’alignement et la répartition.',
      explain: 'En *mobile first*, les règles de base visent les petits écrans, et la media query `min-width` ajoute les changements pour les écrans plus larges. On ne réécrit que ce qui change : `display: flex` reste valable partout. `justify-content: space-between` pousse le logo et la liste aux deux extrémités, et `align-items: center` les aligne verticalement. La même structure HTML sert ainsi à toutes les tailles d’écran.'
    }
  }
]);
