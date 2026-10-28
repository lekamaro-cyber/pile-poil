// CodeQuest — parcours « Data science et IA » (data), chapitre 5 « IA moderne » : data.u15 à data.u19.
// Aucun exercice n'appelle une vraie API ni n'exécute de bibliothèque d'IA.
(function () {
  var units = [];

  // ---------- data.u15 Introduction aux réseaux de neurones ----------
  units.push({
    id: 'data.u15',
    title: 'Introduction aux réseaux de neurones',
    summary: "Comprendre un neurone (poids, biais, activation), calculer une passe avant à la main et saisir l'idée de la descente de gradient.",
    lessons: [{
      id: 'data.u15.l1',
      title: 'Un neurone, puis une couche',
      minutes: 8,
      objective: "Tu sais calculer à la main la sortie d'un neurone et d'une couche, et expliquer comment la descente de gradient ajuste un poids.",
      explain: "Un **neurone** artificiel fait trois choses :\n\n" +
        "- il multiplie chaque entrée par un **poids** et additionne : c'est un produit scalaire (unité 10) ;\n" +
        "- il ajoute un **biais**, qui décale le résultat : z = w · x + b ;\n" +
        "- il applique une **activation** : ReLU, `max(0, z)`, ou la sigmoïde, `1 / (1 + e^(-z))`, qui donne un nombre entre 0 et 1.\n\n" +
        "Une **couche** est un ensemble de neurones qui reçoivent les mêmes entrées : un produit matrice-vecteur, plus un biais, plus l'activation. Un réseau enchaîne des couches : c'est la **passe avant**.\n\n" +
        "Pour apprendre, on mesure l'erreur (la **perte**), on calcule dans quel sens modifier chaque poids pour la réduire (le **gradient**), puis on fait un petit pas dans ce sens (le **taux d'apprentissage**). On répète des milliers de fois : c'est la **descente de gradient**. PyTorch ou TensorFlow font exactement cela, avec des millions de poids et des gradients calculés automatiquement.",
      example: {
        code: `import math

def sigmoide(z):
    return 1 / (1 + math.exp(-z))

def neurone(x, w, b):
    z = sum(xi * wi for xi, wi in zip(x, w)) + b
    return sigmoide(z)

x = [1.0, 2.0]
w = [0.5, -0.25]
print(neurone(x, w, 0.0))
print(round(neurone(x, w, 2.0), 3))`,
        output: `0.5
0.881`,
        notes: [
          { line: 4, text: "La sigmoïde écrase n'importe quel nombre entre 0 et 1 : pratique pour une probabilité." },
          { line: 7, text: "Somme pondérée des entrées (un produit scalaire), plus le biais." },
          { line: 12, text: "z = 1 × 0.5 + 2 × (-0.25) + 0 = 0, et sigmoïde(0) = 0.5." },
          { line: 13, text: "Le biais 2.0 décale z à 2 : la sortie monte à environ 0.881." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Un réseau a plusieurs couches, mais on a oublié la fonction d'activation : chaque couche calcule seulement `W · x + b`. Quelle est la conséquence ?",
          choices: [
            "Aucune : l'activation sert seulement à accélérer les calculs.",
            "Tout le réseau revient à une seule opération linéaire : empiler les couches n'apporte rien, il ne peut apprendre que des relations linéaires.",
            "Le réseau ne peut plus être entraîné du tout.",
            "Les sorties sont forcément comprises entre 0 et 1."
          ],
          answer: 1,
          why: {
            0: "L'activation ajoute des calculs, elle ne les accélère pas. Son rôle est de casser la linéarité.",
            2: "Il peut être entraîné, mais il reste aussi limité qu'un modèle linéaire, quel que soit son nombre de couches.",
            3: "C'est l'effet de la sigmoïde ; sans activation, les sorties peuvent prendre n'importe quelle valeur."
          },
          hint: "Que donne une transformation linéaire appliquée au résultat d'une autre transformation linéaire ?",
          explain: "Composer des fonctions linéaires donne encore une fonction linéaire : sans activation, dix couches valent une seule couche. Les activations comme ReLU, placées entre les couches, permettent au réseau d'apprendre des formes complexes."
        },
        {
          type: 'code',
          prompt: "Écris `couche(x, W, b)` qui calcule la sortie d'une couche de neurones avec l'activation ReLU : pour chaque ligne `w` de `W` et le biais `bi` de même position dans `b`, le neurone renvoie `max(0, w · x + bi)`. Le résultat a un élément par neurone.",
          starter: `def couche(x, W, b):
    # ton code ici
    return []
`,
          solution: `def couche(x, W, b):
    sorties = []
    for w, bi in zip(W, b):
        z = sum(xi * wi for xi, wi in zip(x, w)) + bi
        sorties.append(max(0, z))
    return sorties
`,
          tests: [
            { code: `assert couche([2, 1], [[1, -1], [-2, 1], [0, 3]], [0, 1, -1]) == [1, 0, 2]`, label: "trois neurones donnent [1, 0, 2] (le deuxième est coupé par ReLU)" },
            { code: `assert couche([1, 1], [[0.5, 0.5]], [0]) == [1.0]`, label: "un seul neurone : 0.5 + 0.5 = 1.0" },
            { code: `assert couche([3], [[-1]], [1]) == [0]`, label: "une somme négative donne 0" }
          ],
          hint: "`zip(W, b)` associe chaque ligne de poids à son biais ; à l'intérieur, c'est le produit scalaire de l'unité 10.",
          explain: "Chaque neurone fait un produit scalaire avec les entrées, ajoute son biais, puis ReLU remplace les valeurs négatives par 0. Dans le premier test, le deuxième neurone calcule -4 + 1 + 1 = -2 : il est « éteint ». En NumPy, toute la couche s'écrirait `np.maximum(0, W @ x + b)`."
        }
      ],
      challenge: {
        type: 'predict',
        prompt: "Ce petit réseau a une couche cachée de 2 neurones (ReLU) et un neurone de sortie sans activation. Calcule la passe avant : qu'affiche ce programme ?",
        code: `def relu(z):
    return max(0, z)

x = [1, 2]
W1 = [[1, 1], [2, -2]]
b1 = [0, 0]
h = [relu(sum(wi * xi for wi, xi in zip(w, x)) + bi) for w, bi in zip(W1, b1)]
W2 = [3, -2]
sortie = sum(wi * hi for wi, hi in zip(W2, h)) - 1
print(h)
print(sortie)`,
        answer: `[3, 0]
8`,
        mistakes: [
          { answer: `[3, -2]
12`, why: "ReLU remplace les valeurs négatives par 0 : le deuxième neurone donne `max(0, -2) = 0`, pas -2." },
          { answer: `[3, 0]
9`, why: "Le neurone de sortie ajoute aussi son biais, -1 : 3 × 3 + (-2) × 0 - 1 = 8." }
        ],
        hint: "Calcule d'abord les deux neurones cachés, applique ReLU, puis le neurone de sortie avec son biais.",
        explain: "Couche cachée : 1 + 2 = 3, puis 2 - 4 = -2, que ReLU transforme en 0, d'où h = [3, 0]. Sortie : 3 × 3 + (-2) × 0 - 1 = 8. Une passe avant n'est qu'une suite de produits scalaires, de biais et d'activations."
      },
      recap: [
        "Un neurone : z = w · x + b, puis une activation (ReLU ou sigmoïde).",
        "Une couche : un produit matrice-vecteur, plus un biais, plus l'activation.",
        "Sans activation, empiler des couches ne sert à rien : le tout reste linéaire.",
        "Descente de gradient : prédire, mesurer l'erreur, calculer le gradient, faire un petit pas, recommencer."
      ],
      check: {
        type: 'order',
        prompt: "On cherche le poids `w` tel que `w × 2.0` donne 6.0. La perte est `(w × 2.0 - 6.0) ** 2` ; sa dérivée par rapport à `w`, le gradient, vaut `2 × erreur × 2.0`. Remets dans l'ordre cette descente de gradient.",
        lines: [
          `w = 0.0`,
          `for etape in range(50):`,
          `    prediction = w * 2.0`,
          `    erreur = prediction - 6.0`,
          `    gradient = 2 * erreur * 2.0`,
          `    w = w - 0.05 * gradient`,
          `print(round(w, 3))`
        ],
        output: `3.0`,
        hint: "Dans la boucle : prédire, mesurer l'erreur, calculer le gradient, puis corriger le poids.",
        explain: "À chaque étape, on prédit, on mesure l'erreur, on calcule le gradient, puis on déplace `w` d'un petit pas dans le sens qui réduit la perte. Partant de 0, `w` se rapproche de 3.0 étape après étape. Un vrai réseau fait la même chose pour chacun de ses poids."
      }
    }]
  });

  // ---------- data.u16 Traitement du langage ----------
  units.push({
    id: 'data.u16',
    title: 'Traitement du langage',
    summary: "Transformer du texte en nombres : tokenisation, sac de mots, similarité cosinus et embeddings.",
    lessons: [{
      id: 'data.u16.l1',
      title: 'Du texte aux nombres',
      minutes: 8,
      objective: "Tu sais transformer un texte en sac de mots, calculer une similarité cosinus entre deux textes et expliquer ce qu'apporte un embedding.",
      explain: "Un modèle ne manipule que des nombres : il faut d'abord transformer le texte.\n\n" +
        "- **tokenisation** : découper le texte en unités, les **tokens**. Ici des mots, après passage en minuscules et retrait de la ponctuation. Les grands modèles de langage utilisent des morceaux de mots : « incroyablement » peut compter plusieurs tokens ;\n" +
        "- **sac de mots** : compter chaque mot. Le texte devient un vecteur de comptes, mais l'ordre des mots est perdu ;\n" +
        "- **similarité cosinus** : le produit scalaire de deux vecteurs divisé par le produit de leurs normes (leurs longueurs). Elle vaut 1 pour des textes aux mots proportionnels, 0 s'ils n'ont aucun mot en commun.\n\n" +
        "Limite du sac de mots : « voiture » et « automobile » n'ont rien en commun. Un **embedding** représente un mot ou une phrase par un vecteur de quelques centaines de nombres, appris sur d'énormes quantités de texte, où des sens proches donnent des vecteurs proches. C'est la base de la recherche sémantique et des grands modèles de langage.",
      example: {
        code: `from collections import Counter

def tokeniser(texte):
    for signe in ".,!?;:":
        texte = texte.replace(signe, " ")
    return texte.lower().split()

phrase = "Le chat dort. Le chien, lui, ne dort pas !"
mots = tokeniser(phrase)
print(mots[:4])
print(len(mots))
sac = Counter(mots)
print(sac["le"], sac["dort"], sac["oiseau"])`,
        output: `['le', 'chat', 'dort', 'le']
9
2 2 0`,
        notes: [
          { line: 5, text: "Chaque signe de ponctuation est remplacé par une espace." },
          { line: 6, text: "Minuscules, puis découpage sur les espaces : « Le » et « le » deviennent le même token." },
          { line: 12, text: "`Counter` compte chaque token : c'est le sac de mots." },
          { line: 13, text: "Un mot absent compte 0, sans erreur." }
        ]
      },
      exercises: [
        {
          type: 'predict',
          prompt: "Qu'affiche ce programme ?",
          code: `from collections import Counter

a = Counter("le chien mord le facteur".split())
b = Counter("le facteur mord le chien".split())
print(a == b)
print(len(a), a["le"])`,
          answer: `True
4 2`,
          mistakes: [
            { answer: `False
4 2`, why: "Les deux phrases ont exactement les mêmes mots, avec les mêmes nombres d'apparitions : leurs sacs de mots sont identiques, même si le sens est inversé." },
            { answer: `True
5 2`, why: "`len(a)` compte les mots différents : le, chien, mord, facteur, soit 4. « le » apparaît deux fois, mais c'est une seule clé." }
          ],
          hint: "Un sac de mots ne garde que les mots et leurs nombres d'apparitions.",
          explain: "Les deux sacs contiennent le : 2, chien : 1, mord : 1, facteur : 1. Ils sont égaux, alors que les phrases disent l'inverse l'une de l'autre. C'est la principale limite du sac de mots : l'ordre, et donc une partie du sens, disparaît."
        },
        {
          type: 'fill',
          prompt: "Complète la similarité cosinus : le produit scalaire divisé par le produit des deux normes.",
          code: `import math

def cosinus(u, v):
    produit = sum(a * b for a, b in ___(u, v))
    norme_u = math.sqrt(sum(a * a for a in u))
    norme_v = math.sqrt(sum(b * b for b in v))
    return produit / (___)

print(round(cosinus([1, 0, 1, 1], [0, 1, 1, 1]), 3))
print(cosinus([2, 0], [0, 5]))`,
          blanks: [
            { answers: ['zip'], options: ['zip', 'range', 'sum'],
              why: { 'range': "`range` produit des entiers ; il ne parcourt pas deux listes en même temps.", 'sum': "La somme est déjà faite par le `sum` du début : ici, il faut associer les éléments de même position." } },
            { answers: ['norme_u * norme_v', 'norme_v * norme_u', 'norme_u*norme_v', 'norme_v*norme_u'],
              why: { 'norme_u + norme_v': "On divise par le produit des normes, pas par leur somme.", 'norme_u': "Il faut diviser par les deux normes, sinon le résultat dépendrait de la longueur de v." } }
          ],
          output: `0.667
0.0`,
          hint: "Le produit scalaire associe les éléments de même position ; la division se fait par les deux normes à la fois.",
          explain: "Pour [1, 0, 1, 1] et [0, 1, 1, 1] : produit scalaire 2, normes √3 et √3, donc 2 / 3, environ 0.667. Les vecteurs [2, 0] et [0, 5] n'ont aucune composante commune : cosinus 0. Diviser par les normes rend le score indépendant de la longueur des textes."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "Écris `similarite(t1, t2)` qui renvoie la similarité cosinus entre les sacs de mots de deux textes :\n\n" +
          "- tokenise chaque texte (ponctuation `.,!?` retirée, minuscules, `split()`) ;\n" +
          "- construis le vocabulaire commun : la liste triée de tous les mots des deux textes ;\n" +
          "- transforme chaque texte en vecteur de comptes sur ce vocabulaire ;\n" +
          "- renvoie le cosinus des deux vecteurs, ou `0.0` si un des textes est vide.",
        starter: `import math

def similarite(t1, t2):
    # ton code ici
    return 0.0
`,
        solution: `import math

def tokeniser(texte):
    for signe in ".,!?":
        texte = texte.replace(signe, " ")
    return texte.lower().split()

def similarite(t1, t2):
    m1 = tokeniser(t1)
    m2 = tokeniser(t2)
    vocabulaire = sorted(set(m1 + m2))
    u = [m1.count(mot) for mot in vocabulaire]
    v = [m2.count(mot) for mot in vocabulaire]
    produit = sum(a * b for a, b in zip(u, v))
    norme_u = math.sqrt(sum(a * a for a in u))
    norme_v = math.sqrt(sum(b * b for b in v))
    if norme_u == 0 or norme_v == 0:
        return 0.0
    return produit / (norme_u * norme_v)
`,
        tests: [
          { code: `assert abs(similarite('Le chat dort.', 'le chat dort') - 1) < 1e-9`, label: "deux textes aux mêmes mots ont une similarité de 1" },
          { code: `assert abs(similarite('le chat dort', 'le chien dort') - 2 / 3) < 1e-9`, label: "« le chat dort » et « le chien dort » : 2/3" },
          { code: `assert similarite('voiture rouge', 'automobile bleue') == 0.0`, label: "aucun mot commun : 0, même si le sens est proche" },
          { code: `assert similarite('', 'bonjour') == 0.0`, label: "un texte vide donne 0.0" }
        ],
        hint: "Réutilise le `tokeniser` de l'exemple et le cosinus de l'exercice précédent ; `liste.count(mot)` compte les apparitions d'un mot.",
        explain: "Les deux textes sont projetés sur le même vocabulaire, donc sur des vecteurs de même longueur, comparables position par position. Le troisième test montre la limite du sac de mots : « voiture » et « automobile » ne se ressemblent pas pour lui. Des embeddings leur donneraient des vecteurs proches."
      },
      recap: [
        "Tokeniser : découper le texte en unités (des mots, ou des morceaux de mots pour les grands modèles).",
        "Sac de mots : un vecteur de comptes ; simple, mais l'ordre des mots est perdu.",
        "Similarité cosinus : produit scalaire divisé par le produit des normes.",
        "Un embedding est un vecteur appris où des sens proches donnent des vecteurs proches."
      ],
      check: {
        type: 'qcm',
        prompt: "Avec un sac de mots, « J'ai acheté une voiture » et « J'ai acheté une automobile » sont moins semblables qu'on le voudrait. Avec des embeddings de phrases, leur similarité est proche de 1. Pourquoi ?",
        choices: [
          "Les embeddings comparent les textes lettre par lettre.",
          "Les embeddings sont des vecteurs appris sur de grandes quantités de texte, où des mots employés dans des contextes semblables reçoivent des vecteurs proches.",
          "Les embeddings contiennent un dictionnaire des synonymes écrit à la main.",
          "Les embeddings ignorent les mots rares comme « automobile »."
        ],
        answer: 1,
        why: {
          0: "« voiture » et « automobile » n'ont presque aucune lettre en commun : une comparaison lettre par lettre les jugerait différents.",
          2: "Personne n'écrit ces vecteurs à la main : ils sont appris automatiquement à partir des textes.",
          3: "Ignorer le mot ferait perdre de l'information ; c'est au contraire son vecteur appris qui le rapproche de « voiture »."
        },
        hint: "D'où viennent les nombres d'un embedding ?",
        explain: "Un modèle apprend les embeddings en lisant d'énormes quantités de texte : des mots qui apparaissent dans les mêmes contextes (« conduire une … », « garer sa … ») obtiennent des vecteurs proches. La similarité cosinus s'utilise ensuite comme avec les sacs de mots, mais sur ces vecteurs plus riches."
      }
    }]
  });

  // ---------- data.u17 Utilisation d'API d'IA ----------
  units.push({
    id: 'data.u17',
    title: "Utilisation d'API d'IA",
    summary: "Appeler un modèle d'IA par une API : requêtes, clés secrètes, facturation au token, quotas et alternatives.",
    lessons: [{
      id: 'data.u17.l1',
      title: 'Appeler un modèle sans se ruiner',
      minutes: 7,
      objective: "Tu sais lire une requête vers une API d'IA, protéger ta clé et estimer ce que coûte un usage avant de le lancer.",
      explain: "Pour utiliser un grand modèle hébergé, on envoie une **requête HTTP** (souvent un POST dont le corps JSON contient le nom du modèle, les messages et une limite de tokens en sortie) et on reçoit la réponse en JSON.\n\n" +
        "- **clé d'API** : elle t'identifie et elle est liée à ton moyen de paiement. Jamais dans le code ni sur GitHub : mets-la dans une **variable d'environnement**, lue avec `os.environ`, ou dans un fichier `.env` ignoré par git ;\n" +
        "- **facturation au token** : tu paies les tokens envoyés et les tokens reçus, à des prix différents. Les tarifs changent souvent : consulte la page de tarifs du fournisseur ;\n" +
        "- **coûts qui grimpent** : une boucle sur 10 000 documents, ou une conversation dont tout l'historique est renvoyé à chaque appel. Fixe une limite de dépenses dans ton compte ;\n" +
        "- **quotas** : un nombre maximal de requêtes par minute ; au-delà, l'API répond par une erreur (souvent le code 429).\n\n" +
        "Alternatives : les offres gratuites limitées, ou les **modèles locaux** (avec Ollama ou Hugging Face, par exemple), gratuits à l'usage mais gourmands en mémoire. Aucun exercice de CodeQuest n'appelle une vraie API.",
      example: {
        run: false,
        code: `import os
import json

cle = os.environ.get("CLE_API_IA")
if cle is None:
    print("Clé absente : définis la variable d'environnement CLE_API_IA")

requete = {
    "model": "nom-du-modele",
    "max_tokens": 300,
    "messages": [{"role": "user", "content": "Résume ce texte en 3 phrases."}],
}
corps = json.dumps(requete)
# Envoi (sur ton ordinateur) : un POST avec ce corps et la clé dans un en-tête,
# dont le nom exact dépend du fournisseur : lis sa documentation.`,
        notes: [
          { line: 4, text: "`os.environ.get` lit la clé hors du code ; elle renvoie `None` si la variable n'existe pas, au lieu de planter." },
          { line: 10, text: "`max_tokens` plafonne la longueur de la réponse, donc aussi son coût." },
          { line: 11, text: "La liste des messages : dans une conversation, on y ajoute les échanges précédents, qui sont facturés à chaque appel." },
          { line: 13, text: "`json.dumps` transforme la requête en texte JSON, le corps de la requête HTTP." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Tu publies ton projet d'IA sur GitHub. Où ranges-tu ta clé d'API ?",
          choices: [
            "Dans le code, dans une constante `CLE = 'sk-...'` : c'est plus simple.",
            "Dans une variable d'environnement (ou un fichier `.env` listé dans `.gitignore`), lue au démarrage avec `os.environ`.",
            "Dans le README, pour que les autres puissent tester le projet.",
            "Dans le code, puis je la supprime dans le commit suivant."
          ],
          answer: 1,
          why: {
            0: "Toute personne qui lit le dépôt peut copier la clé et dépenser à ta place. Des robots parcourent GitHub à la recherche de clés publiées.",
            2: "Une clé publiée est une clé donnée à tout le monde : les autres doivent utiliser leur propre clé.",
            3: "L'historique de git garde l'ancien commit : la clé reste lisible. Il faut la révoquer et en créer une nouvelle."
          },
          hint: "Demande-toi ce que peut faire un inconnu qui lit ton dépôt, historique compris.",
          explain: "La clé ne doit jamais entrer dans le dépôt. Le code lit la variable d'environnement ; sa valeur est définie sur ta machine ou sur le serveur. Si une clé a fuité, révoque-la tout de suite dans ton compte : la supprimer du code ne suffit pas."
        },
        {
          type: 'logic',
          prompt: "Prix inventés pour l'exercice (les vrais tarifs sont sur la page de tarifs de chaque fournisseur, et ils changent) : 2 € par million de tokens envoyés, 8 € par million de tokens reçus.\n\nTon appli fait 3 000 appels par jour, chacun avec 1 500 tokens envoyés et 500 tokens reçus. Combien coûtent 30 jours, en euros ?",
          answer: '630',
          accept: ['630 €', '630€', '630 euros'],
          mistakes: [
            { answer: '270', why: "C'est seulement le coût des tokens envoyés. Les 45 millions de tokens reçus coûtent 360 € de plus." },
            { answer: '21', why: "C'est le coût d'une seule journée (9 € + 12 €). Il faut multiplier par 30 jours." }
          ],
          hint: "Calcule séparément les tokens envoyés et reçus sur 30 jours, en millions, puis applique chaque prix.",
          explain: "Envoyés : 3 000 × 1 500 × 30 = 135 millions de tokens, soit 270 €. Reçus : 3 000 × 500 × 30 = 45 millions, soit 360 €. Total : 630 € par mois, pour une appli qui semblait modeste. Fais toujours ce calcul avant de lancer un traitement en boucle."
        }
      ],
      challenge: {
        type: 'predict',
        prompt: "Un assistant conversationnel renvoie tout l'historique de la conversation à chaque appel, et chaque échange ajoute 100 tokens. Qu'affiche ce programme ?",
        code: `historique = 0
total_envoye = 0
for tour in range(1, 11):
    historique += 100           # chaque échange ajoute 100 tokens
    total_envoye += historique  # tout l'historique est renvoyé
print(historique, total_envoye)`,
        answer: `1000 5500`,
        mistakes: [
          { answer: `1000 1000`, why: "À chaque tour, on renvoie tout l'historique : 100, puis 200, puis 300… tokens. Les envois s'additionnent : 100 + 200 + … + 1 000 = 5 500." },
          { answer: `1100 6600`, why: "`range(1, 11)` fait 10 tours (de 1 à 10), pas 11." }
        ],
        hint: "Suis les deux variables pendant les trois premiers tours, puis repère la régularité.",
        explain: "L'historique grandit de 100 tokens par tour, mais chaque appel renvoie l'historique entier : 100 + 200 + … + 1 000 = 5 500 tokens facturés, plus de 5 fois la taille finale de la conversation. Le coût croît bien plus vite que la conversation : résumer ou raccourcir l'historique limite la facture."
      },
      recap: [
        "Une API d'IA : une requête HTTP en JSON (modèle, messages, limite de tokens), une réponse en JSON.",
        "La clé ne va jamais dans le code : variable d'environnement, ou `.env` ignoré par git.",
        "On paie les tokens envoyés et reçus : estime le coût avant de lancer une boucle, d'après la page de tarifs.",
        "Renvoyer tout l'historique fait grimper les coûts ; fixe une limite de dépenses.",
        "Alternatives : offres gratuites limitées, modèles locaux."
      ],
      check: {
        type: 'bug',
        run: false,
        prompt: "Ce programme fonctionne, mais il ne doit pas être publié tel quel sur GitHub. Clique sur la ligne à corriger.",
        code: `import os

CLE = "sk-proj-4f9a8c2e7b1d"

def entetes():
    return {"Content-Type": "application/json", "Authorization": "Bearer " + CLE}

print("Clé chargée" if CLE else "Clé manquante")`,
        bugLine: 3,
        why: "La clé est écrite en clair dans le code : une fois publiée, elle permet à n'importe qui d'utiliser ton compte, à tes frais. Elle doit être lue dans une variable d'environnement, définie hors du dépôt.",
        fixes: [
          `CLE = os.environ.get("CLE_API_IA", "")`,
          `CLE = "sk-proj-****"`,
          `CLE = "sk-proj-4f9a8c2e7b1d"  # secret`
        ],
        fixAnswer: 0,
        fixWhy: {
          1: "Une clé masquée ne fonctionne plus, et le vrai problème reste : aucune clé ne doit être écrite dans le code.",
          2: "Un commentaire ne cache rien : la clé reste lisible par toute personne qui ouvre le fichier."
        },
        hint: "Quelle ligne contient une information qui doit rester secrète ?",
        explain: "Avec `os.environ.get('CLE_API_IA', '')`, le code ne contient plus aucun secret : chaque personne définit sa propre clé sur sa machine. Si la variable n'existe pas, le programme affiche « Clé manquante » au lieu de planter."
      }
    }]
  });

  // ---------- data.u18 Éthique, biais et limites des modèles ----------
  units.push({
    id: 'data.u18',
    title: 'Éthique, biais et limites des modèles',
    summary: "Repérer les biais, les hallucinations, les risques pour la vie privée et l'impact environnemental des modèles.",
    lessons: [{
      id: 'data.u18.l1',
      title: 'Ce que les modèles font mal',
      minutes: 7,
      objective: "Tu sais repérer un biais dans des données ou des résultats, reconnaître une hallucination, et identifier les risques pour la vie privée et l'environnement.",
      explain: "Un modèle apprend ce qu'il voit, y compris les défauts de ses données.\n\n" +
        "- **biais des données** : si un groupe est sous-représenté, ou si les décisions passées étaient injustes, le modèle reproduit ces écarts. Un modèle de recrutement entraîné sur des embauches passées peut ainsi défavoriser un groupe. Mesure les performances **par groupe** : un bon score global peut cacher un groupe mal servi ;\n" +
        "- **hallucinations** : un grand modèle de langage produit le texte le plus probable, pas le texte vrai. Il peut inventer une source, une citation ou une fonction Python, avec assurance. Vérifie dans la documentation et teste le code ;\n" +
        "- **vie privée** : ce que tu envoies à une API peut être conservé. N'envoie pas de données personnelles d'autres personnes sans leur accord (en Europe, le RGPD encadre ces usages) ;\n" +
        "- **impact** : entraîner et utiliser un grand modèle consomme de l'électricité et du matériel. Un modèle plus petit, voire une règle simple, suffit souvent.",
      example: {
        code: `resultats = [  # (groupe, prédiction correcte ?)
    ("A", True), ("A", True), ("A", True), ("A", False), ("A", True),
    ("A", True), ("A", True), ("A", True), ("B", False), ("B", True),
]
for g in ("A", "B"):
    lignes = [ok for groupe, ok in resultats if groupe == g]
    print(g, len(lignes), sum(lignes) / len(lignes))
print("global", sum(ok for _, ok in resultats) / len(resultats))`,
        output: `A 8 0.875
B 2 0.5
global 0.8`,
        notes: [
          { line: 6, text: "On isole les résultats d'un groupe ; `sum` compte les `True`." },
          { line: 7, text: "Le groupe A est bien servi (87,5 %), le groupe B beaucoup moins (50 %)." },
          { line: 8, text: "Le score global de 80 % cache cet écart. Et B n'a que 2 exemples : trop peu pour bien apprendre, et pour bien mesurer." }
        ]
      },
      exercises: [
        {
          type: 'logic',
          prompt: "Un modèle de reconnaissance vocale est entraîné sur 9 000 heures d'enregistrements : 8 100 heures de voix d'hommes adultes, le reste de voix de femmes et d'enfants.\n\nQuel pourcentage des données représente les voix de femmes et d'enfants ?",
          answer: '10',
          accept: ['10 %', '10%'],
          mistakes: [
            { answer: '90', why: "90 % est la part des voix d'hommes adultes (8 100 / 9 000). Les autres voix n'ont que 900 heures." },
            { answer: '900', why: "900 est le nombre d'heures, pas le pourcentage : 900 / 9 000 = 10 %." }
          ],
          hint: "Calcule d'abord le nombre d'heures restantes, puis divise par le total.",
          explain: "9 000 - 8 100 = 900 heures, soit 10 % des données. Le modèle risque de bien mieux reconnaître les voix d'hommes adultes : il faut mesurer son taux d'erreur par groupe, et compléter les données des groupes sous-représentés."
        },
        {
          type: 'qcm',
          prompt: "Tu demandes à un assistant IA comment nettoyer un DataFrame. Il répond avec assurance : « Utilise `df.clean_all(strict=True)`, qui supprime en une fois doublons et valeurs manquantes. » Que fais-tu ?",
          choices: [
            "Je l'utilise : la réponse est précise et détaillée, donc fiable.",
            "Je demande à l'assistant s'il est sûr : s'il confirme, c'est vrai.",
            "Je vérifie dans la documentation de pandas et je teste sur un petit exemple : cette méthode n'existe peut-être pas.",
            "Je n'utilise plus jamais d'assistant IA."
          ],
          answer: 2,
          why: {
            0: "L'assurance et les détails ne prouvent rien : un modèle de langage produit un texte plausible, pas forcément vrai.",
            1: "Le modèle peut confirmer son erreur avec la même assurance : se relire ne lui permet pas de vérifier.",
            3: "Les assistants restent utiles ; il faut seulement vérifier ce qu'ils affirment avant de s'en servir."
          },
          hint: "Comment savoir, sans faire confiance à personne, si une méthode pandas existe ?",
          explain: "`clean_all` n'existe pas dans pandas : c'est une hallucination typique, un nom plausible inventé. La documentation officielle et un test rapide tranchent en quelques secondes. Les vraies méthodes sont `drop_duplicates` et `dropna` (unité 6)."
        }
      ],
      challenge: {
        type: 'predict',
        prompt: "Un modèle décide d'accepter ou non des demandes de prêt. Pour chaque demande, on sait si elle aurait dû être acceptée. Qu'affiche ce programme ?",
        code: `# (groupe, aurait dû être acceptée, acceptée par le modèle)
demandes = [("H", 1, 1), ("H", 1, 1), ("H", 0, 0), ("H", 1, 1),
            ("F", 1, 0), ("F", 1, 1), ("F", 0, 0), ("F", 1, 0)]
for g in ("H", "F"):
    meritantes = [acc for gr, merite, acc in demandes if gr == g and merite == 1]
    print(g, sum(meritantes), "/", len(meritantes))`,
        answer: `H 3 / 3
F 1 / 3`,
        mistakes: [
          { answer: `H 3 / 4
F 1 / 4`, why: "On ne garde que les demandes qui auraient dû être acceptées (`merite == 1`) : il y en a 3 par groupe, pas 4." },
          { answer: `H 3 / 3
F 3 / 3`, why: "`sum(meritantes)` compte les demandes réellement acceptées : pour F, une seule des trois l'a été." }
        ],
        hint: "Pour chaque groupe, garde seulement les demandes méritantes, puis compte combien ont été acceptées.",
        explain: "Parmi les demandes qui méritaient d'être acceptées, le modèle en accepte 3 sur 3 pour H, mais 1 sur 3 pour F : c'est le rappel par groupe de l'unité 14. L'exactitude globale (6 sur 8) cache cet écart. Avec si peu de données, il faut enquêter avant de conclure, mais un tel écart doit alerter."
      },
      recap: [
        "Un modèle reproduit les biais de ses données : mesure ses performances par groupe.",
        "Un bon score global peut cacher un groupe mal servi.",
        "Hallucination : un texte plausible mais faux ; vérifie dans la documentation et teste.",
        "Vie privée : pas de données personnelles d'autrui sans accord ; anonymise, ou travaille en local.",
        "Un modèle plus petit suffit souvent, et consomme moins."
      ],
      check: {
        type: 'qcm',
        prompt: "Tu veux faire résumer par une API d'IA en ligne les messages de ton groupe d'amis, exportés depuis une messagerie. Quelle démarche est la plus responsable ?",
        choices: [
          "Envoyer tout l'export : ce sont des messages privés, personne ne le saura.",
          "Demander l'accord du groupe, retirer noms et numéros, lire ce que le fournisseur fait des données envoyées, ou utiliser un modèle local.",
          "Envoyer les messages un par un plutôt qu'en un seul bloc, pour limiter les risques.",
          "Utiliser le plus gros modèle disponible, pour avoir le meilleur résumé possible."
        ],
        answer: 1,
        why: {
          0: "Ces messages contiennent des données personnelles d'autres personnes : les envoyer à un service tiers sans leur accord pose un problème de vie privée, que quelqu'un le sache ou non.",
          2: "Découper l'envoi ne change rien : toutes les données partent quand même chez le fournisseur, et le nombre d'appels augmente.",
          3: "Un plus gros modèle consomme plus d'énergie et coûte plus cher, sans régler la question de la vie privée."
        },
        hint: "À qui appartiennent ces messages, et où vont-ils une fois envoyés ?",
        explain: "Les messages concernent d'autres personnes : leur accord compte. Anonymiser limite les risques, la politique de conservation du fournisseur dit ce qu'il garde, et un modèle local évite que les données quittent ta machine. Un modèle de taille raisonnable suffit pour résumer."
      }
    }]
  });

  // ---------- data.u19 Projets de data science ----------
  units.push({
    id: 'data.u19',
    title: 'Projets de data science',
    summary: "Mener une petite analyse complète : question, nettoyage, analyse et conclusion honnête.",
    lessons: [{
      id: 'data.u19.l1',
      title: 'Une analyse de bout en bout',
      minutes: 8,
      objective: "Tu sais mener une petite analyse complète : poser une question précise, nettoyer, calculer, puis conclure sans dire plus que ce que montrent les données.",
      explain: "Une analyse de données suit toujours la même démarche :\n\n" +
        "- **la question** : précise et mesurable. « Les sessions durent-elles plus longtemps les jours où l'appli envoie une notification ? » plutôt que « Les notifications marchent-elles ? » ;\n" +
        "- **charger et inspecter** : nombre de lignes, colonnes, types, valeurs manquantes ;\n" +
        "- **nettoyer** : doublons, valeurs illisibles ou aberrantes, en comptant ce qu'on retire ;\n" +
        "- **analyser** : des statistiques par groupe, un graphique si besoin ;\n" +
        "- **conclure honnêtement** : la taille de l'échantillon, les limites, ce qu'on ne sait pas. Une différence entre deux groupes ne prouve pas une cause : les notifications ont peut-être été envoyées les jours où les joueurs étaient déjà plus actifs.\n\n" +
        "Tous les outils sont déjà là : `csv`, compréhensions, dictionnaires, moyenne, médiane. Sur ton ordinateur, pandas rend chaque étape plus courte.",
      example: {
        code: `import csv

with open("trajets.csv") as f:
    lignes = list(csv.DictReader(f))
propres = [l for l in lignes if l["duree_min"].strip() != ""]
print(len(lignes), "lignes,", len(lignes) - len(propres), "retirée(s)")

for meteo in ("sec", "pluie"):
    durees = [float(l["duree_min"]) for l in propres if l["meteo"] == meteo]
    print(meteo, len(durees), "trajets, moyenne", round(sum(durees) / len(durees), 1), "min")`,
        files: { 'trajets.csv': "jour,meteo,duree_min\n1,sec,21\n2,pluie,28\n3,sec,24\n4,sec,\n5,pluie,25\n6,sec,22\n7,pluie,28\n8,sec,23\n" },
        output: `8 lignes, 1 retirée(s)
sec 4 trajets, moyenne 22.5 min
pluie 3 trajets, moyenne 27.0 min`,
        notes: [
          { line: 4, text: "Charger : une question précise d'abord (les trajets à vélo sont-ils plus longs sous la pluie ?), puis les données." },
          { line: 5, text: "Nettoyer : la ligne sans durée est retirée, et on annonce combien de lignes ont été retirées." },
          { line: 8, text: "Analyser : une moyenne par groupe, avec la taille de chaque groupe." },
          { line: 10, text: "Conclure honnêtement : sous la pluie, 4,5 minutes de plus en moyenne, mais sur 3 trajets seulement. C'est une piste, pas une preuve." }
        ]
      },
      exercises: [
        {
          type: 'qcm',
          prompt: "Tu as un fichier de sessions de jeu (joueur, jour, notification envoyée ou non, minutes jouées). Quelle question est la mieux posée pour commencer une analyse ?",
          choices: [
            "Les notifications marchent-elles ?",
            "Les sessions des jours avec notification durent-elles en moyenne plus longtemps que celles des jours sans notification ?",
            "Pourquoi les joueurs adorent-ils le jeu ?",
            "Que disent les données ?"
          ],
          answer: 1,
          why: {
            0: "« Marcher » n'est pas mesurable tel quel : plus de sessions ? des sessions plus longues ? plus d'achats ?",
            2: "Le fichier ne contient rien sur les goûts des joueurs, et la question suppose déjà la réponse.",
            3: "Sans question, on finit par chercher n'importe quel motif, et on en trouve toujours un par hasard."
          },
          hint: "Une bonne question dit ce qu'on mesure, sur quelles données, et ce qu'on compare.",
          explain: "La bonne question nomme la mesure (la durée moyenne des sessions), les deux groupes comparés (avec ou sans notification), et ne demande que des colonnes présentes dans le fichier. On sait alors exactement quoi calculer."
        },
        {
          type: 'order',
          prompt: "Remets dans l'ordre ce programme qui charge `sessions.csv`, écarte les durées illisibles et calcule la durée moyenne des sessions avec notification. L'import vient en premier.",
          files: { 'sessions.csv': "joueur,jour,notif,minutes\nada,1,oui,32\nada,2,non,20\nlinus,1,oui,25\ngrace,2,non,18\ngrace,3,oui,\nalan,3,non,abc\nalan,4,oui,28\nmia,4,non,22\n" },
          lines: [
            `import csv`,
            `with open("sessions.csv") as f:`,
            `    lignes = list(csv.DictReader(f))`,
            `valides = [l for l in lignes if l["minutes"].strip().isdigit()]`,
            `avec = [int(l["minutes"]) for l in valides if l["notif"] == "oui"]`,
            `moyenne = sum(avec) / len(avec)`,
            `print(len(valides), "sessions valides,", len(avec), "avec notification, moyenne", round(moyenne, 1))`
          ],
          output: `6 sessions valides, 3 avec notification, moyenne 28.3`,
          hint: "Charger, nettoyer, choisir un groupe, calculer, afficher : chaque ligne utilise le résultat de la précédente.",
          explain: "C'est la démarche de la leçon en quelques lignes : charger, nettoyer (`isdigit` écarte la case vide et `'abc'`), choisir le groupe, calculer, puis afficher. Le nombre de sessions gardées fait partie du résultat : sans lui, la moyenne ne veut pas dire grand-chose."
        }
      ],
      challenge: {
        type: 'code',
        prompt: "Écris `comparer(nom_fichier)` qui analyse un fichier de sessions (colonnes `joueur`, `jour`, `notif`, `minutes`) et renvoie un dictionnaire `{'oui': (nombre, moyenne), 'non': (nombre, moyenne)}` :\n\n" +
          "- une session en double (même `joueur` et même `jour`) ne compte qu'une fois ;\n" +
          "- les durées vides ou illisibles sont ignorées ;\n" +
          "- chaque moyenne est arrondie à 1 décimale ; si un groupe est vide, renvoie `(0, None)` pour lui.",
        files: { 'sessions.csv': "joueur,jour,notif,minutes\nada,1,oui,32\nada,2,non,20\nlinus,1,oui,25\nlinus,1,oui,25\ngrace,2,non,18\ngrace,3,oui,\nalan,3,non,abc\nalan,4,oui,28\nmia,4,non,22\n" },
        starter: `import csv

def comparer(nom_fichier):
    # ton code ici
    return {'oui': (0, None), 'non': (0, None)}
`,
        solution: `import csv

def comparer(nom_fichier):
    with open(nom_fichier) as f:
        lignes = list(csv.DictReader(f))
    vus = set()
    groupes = {'oui': [], 'non': []}
    for l in lignes:
        cle = (l["joueur"], l["jour"])
        texte = l["minutes"].strip()
        if cle in vus or not texte.isdigit():
            continue
        vus.add(cle)
        groupes[l["notif"]].append(int(texte))
    resultat = {}
    for g, durees in groupes.items():
        if durees:
            resultat[g] = (len(durees), round(sum(durees) / len(durees), 1))
        else:
            resultat[g] = (0, None)
    return resultat
`,
        tests: [
          { code: `assert comparer('sessions.csv') == {'oui': (3, 28.3), 'non': (3, 20.0)}`, label: "sessions.csv : 3 sessions de chaque côté, 28.3 contre 20.0 minutes" },
          { code: `with open('petit.csv', 'w') as f:
    f.write('joueur,jour,notif,minutes\\nzoe,1,oui,10\\nzoe,1,oui,10\\nzoe,2,oui,20\\n')
assert comparer('petit.csv') == {'oui': (2, 15.0), 'non': (0, None)}`, label: "doublon compté une fois, et (0, None) pour un groupe vide" }
        ],
        hint: "Garde un set des couples `(joueur, jour)` déjà vus et un dictionnaire de listes de durées par groupe ; calcule les moyennes à la fin.",
        explain: "Le nettoyage retire un doublon et deux durées illisibles, puis on compare deux groupes de 3 sessions : 28.3 minutes avec notification contre 20.0 sans. La fonction renvoie aussi les effectifs : une moyenne sans la taille du groupe ne permet pas de juger."
      },
      recap: [
        "Commence par une question précise, mesurable avec les colonnes dont tu disposes.",
        "Charge, inspecte, puis nettoie en comptant ce que tu retires.",
        "Compare des groupes en donnant toujours leur taille avec leur moyenne.",
        "Une différence entre groupes n'est pas une cause ; avec peu de données, c'est une piste, pas une preuve.",
        "Pour mesurer un effet, il faut une expérience avec attribution au hasard (un test A/B)."
      ],
      check: {
        type: 'qcm',
        prompt: "Ton analyse donne : 3 sessions avec notification (28.3 minutes en moyenne) et 3 sessions sans (20.0 minutes). Les notifications n'ont pas été envoyées au hasard. Quelle conclusion est honnête ?",
        choices: [
          "Les notifications font jouer plus de 40 % plus longtemps : il faut en envoyer tous les jours.",
          "Sur ces 6 sessions, celles avec notification durent en moyenne 8 minutes de plus ; c'est trop peu de données, et sans envoi au hasard on ne peut pas parler d'un effet des notifications.",
          "Il n'y a aucune différence entre les deux groupes.",
          "Les données sont inutilisables : il faut tout jeter."
        ],
        answer: 1,
        why: {
          0: "Avec 6 sessions, l'écart peut être dû au hasard ; et une différence entre groupes ne prouve pas que les notifications en sont la cause.",
          2: "Une différence de 8 minutes est bien observée ; on ne peut simplement pas la généraliser.",
          3: "Les données donnent une piste utile ; il faut la présenter avec ses limites, puis en collecter davantage."
        },
        hint: "Une conclusion honnête donne le chiffre observé, sa base (combien de données) et ce qu'elle ne permet pas d'affirmer.",
        explain: "La conclusion honnête décrit ce qui est observé, avec la taille de l'échantillon, et nomme les limites : trop peu de sessions, et des notifications qui n'ont pas été attribuées au hasard. Pour mesurer un effet, il faudrait une expérience : envoyer des notifications au hasard à la moitié des joueurs (un test A/B), sur bien plus de sessions."
      }
    }]
  });

  CQ.addChapter('data', { id: 'data.c5', title: 'IA moderne', units: units });
})();
