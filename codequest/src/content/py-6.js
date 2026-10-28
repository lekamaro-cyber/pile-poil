// Parcours Python, chapitre 6 : « Vers les vrais projets » (unités py.u18 à py.u21).
(function () {
  var u18 = {
    id: 'py.u18',
    title: 'Tests et débogage',
    summary: 'Vérifier ton code automatiquement, puis trouver méthodiquement la cause d\'un bug.',
    lessons: [
      {
        id: 'py.u18.l1',
        title: 'assert et tests unitaires',
        minutes: 8,
        objective: 'Tu sais écrire des tests unitaires avec assert (cas normal, cas limite, cas d\'erreur) et les organiser à la manière de pytest.',
        explain: `Un **test unitaire** vérifie automatiquement qu'une fonction donne le bon résultat. \`assert condition, "message"\` ne fait rien si la condition est vraie, et lève \`AssertionError\` avec le message sinon.

Un bon jeu de tests couvre :

- le **cas normal** : \`moyenne([10, 20]) == 15\` ;
- les **cas limites** : liste vide, un seul élément, valeurs négatives ;
- les **cas d'erreur** : la fonction lève-t-elle la bonne exception ?

Avec les floats, compare avec une tolérance : \`abs(a - b) < 1e-9\`.

**pytest**, l'outil de test le plus utilisé en Python, trouve seul les fichiers \`test_*.py\` et exécute chaque fonction dont le nom commence par \`test_\`. Pour vérifier une exception : \`with pytest.raises(ValueError):\`.

pytest ne tourne pas dans CodeQuest. À essayer sur ton ordinateur : \`pip install pytest\`, puis la commande \`pytest\` dans le dossier du projet. Ici, on appelle nous-mêmes les fonctions de test.`,
        example: {
          code: `def moyenne(notes):
    if not notes:
        raise ValueError("liste vide")
    return sum(notes) / len(notes)

def test_moyenne():
    assert moyenne([10, 20]) == 15
    assert moyenne([7]) == 7
    assert abs(moyenne([0.1, 0.2]) - 0.15) < 1e-9

def test_moyenne_liste_vide():
    try:
        moyenne([])
    except ValueError:
        return
    assert False, "ValueError attendue"

test_moyenne()
test_moyenne_liste_vide()
print("tests réussis")`,
          output: `tests réussis`,
          notes: [
            { line: 6, text: `Une fonction de test par comportement, nommée test_… : pytest la trouverait seul.` },
            { line: 9, text: `(0.1 + 0.2) / 2 vaut 0.15000000000000002 : on compare avec une tolérance, pas avec ==.` },
            { line: 15, text: `Si l'exception attendue arrive, le test s'arrête là : réussi.` },
            { line: 16, text: `Sinon, on fait échouer le test volontairement. Avec pytest : with pytest.raises(ValueError).` }
          ]
        },
        exercises: [
          {
            type: 'qcm',
            run: false,
            prompt: `Voici le fichier \`test_scores.py\`. Que se passe-t-il quand tu lances la commande \`pytest\` dans le dossier ?`,
            code: `import pytest
from scores import normaliser

def test_normaliser_bornes():
    assert normaliser([0, 50, 100]) == [0.0, 0.5, 1.0]

def test_normaliser_liste_vide():
    with pytest.raises(ValueError):
        normaliser([])

def verifier_negatifs():
    assert normaliser([-10, 10]) == [0.0, 1.0]`,
            choices: [
              `pytest exécute les 3 fonctions du fichier.`,
              `pytest exécute 2 tests : seules les fonctions dont le nom commence par test_ en sont.`,
              `pytest n'exécute rien : il faut appeler les fonctions à la fin du fichier.`,
              `pytest exécute 2 tests, et le second échoue forcément, puisque normaliser([]) lève une erreur.`
            ],
            answer: 1,
            why: {
              0: `pytest se fie au nom : verifier_negatifs ne commence pas par test_, elle est ignorée. Il faudrait la renommer test_negatifs.`,
              2: `C'est justement le rôle de pytest : il découvre et appelle lui-même les fonctions test_…. Pas besoin de les appeler à la main.`,
              3: `with pytest.raises(ValueError) attend cette erreur : le test réussit si normaliser([]) lève ValueError, et échoue sinon.`
            },
            hint: `Comment pytest reconnaît-il qu'une fonction est un test ?`,
            explain: `pytest cherche les fichiers test_*.py, puis les fonctions test_* à l'intérieur. Les deux tests sont exécutés, chacun isolément. Une fonction mal nommée est silencieusement ignorée : un piège classique.`
          },
          {
            type: 'fill',
            prompt: `Complète ce test : un cas normal, un cas d'arrondi et un cas d'erreur.`,
            code: `def pourcentage(part, total):
    if total == 0:
        raise ValueError("total nul")
    return round(100 * part / total, 1)

def test_pourcentage():
    ___ pourcentage(1, 4) == 25.0
    assert pourcentage(1, 3) == ___
    try:
        pourcentage(5, 0)
        leve = False
    except ___:
        leve = True
    assert leve, "pourcentage(5, 0) aurait dû lever ValueError"

test_pourcentage()
print("OK")`,
            blanks: [
              { answers: ['assert'], options: ['assert', 'return', 'if'], why: { 'return': `return renverrait le booléen et arrêterait le test sans rien vérifier.`, 'if': `Un if a besoin d'un bloc, et ne signale rien si la condition est fausse.` } },
              { answers: ['33.3'], why: { '33.33': `round(..., 1) garde une seule décimale : 33.3.`, '33': `round(..., 1) garde une décimale : 33.3, pas 33.` } },
              { answers: ['ValueError'], options: ['ValueError', 'ZeroDivisionError', 'Exception'], why: { 'ZeroDivisionError': `La fonction teste total == 0 avant de diviser et lève ValueError : ZeroDivisionError n'arrive jamais, et le test planterait.`, 'Exception': `Trop large : le test réussirait même si la fonction levait une autre erreur due à un bug. Un test vérifie l'exception précise.` } }
            ],
            output: `OK`,
            hint: `Le premier mot vérifie une condition. Pour le deuxième trou, calcule 100 / 3 arrondi à une décimale. Pour le troisième, relis la ligne 3.`,
            explain: `assert vérifie chaque attente. 100 × 1 / 3 arrondi à 1 décimale donne 33.3. Le cas d'erreur attend précisément ValueError, l'exception documentée de la fonction.`
          }
        ],
        challenge: {
          type: 'bug',
          prompt: `La fonction \`remise\` est fausse : remise(200, 10) renvoie -1800 au lieu de 180. Pourtant, le programme affiche « tests réussis ». Clique sur la ligne fautive **du test**.`,
          code: `def remise(prix, pourcent):
    return prix - prix * pourcent

def test_remise():
    assert (remise(200, 10) == 180, "10 % de 200 font 20")

try:
    test_remise()
    print("tests réussis")
except AssertionError as e:
    print("ÉCHEC :", e)`,
          bugLine: 5,
          why: `Avec des parenthèses, assert reçoit un seul argument : le tuple (False, "10 % de 200 font 20"). Un tuple non vide est toujours vrai, donc l'assertion ne peut jamais échouer.`,
          fixes: [
            `    assert remise(200, 10) == 180, "10 % de 200 font 20"`,
            `    assert remise(200, 10) != 180, "10 % de 200 font 20"`,
            `    assert "10 % de 200 font 20"`,
            `    assert [remise(200, 10) == 180]`
          ],
          fixAnswer: 0,
          fixWhy: {
            1: `Ce test vérifie le contraire du comportement voulu : il réussit justement parce que la fonction est fausse.`,
            2: `Une chaîne non vide est toujours vraie : ce test ne vérifie rien.`,
            3: `Une liste non vide est toujours vraie, même si elle contient False.`
          },
          output: `ÉCHEC : 10 % de 200 font 20`,
          hint: `Que reçoit assert quand on entoure la condition et le message de parenthèses ?`,
          explain: `Sans parenthèses, assert évalue la condition et n'utilise le message qu'en cas d'échec : le test détecte enfin le bug de remise. Réflexe utile : vérifie qu'un nouveau test échoue bien quand le code est faux. Python affiche d'ailleurs un avertissement « assertion is always true » sur ce piège.`
        },
        recap: [
          `assert condition, "message" lève AssertionError si la condition est fausse.`,
          `Teste le cas normal, les cas limites et les cas d'erreur.`,
          `Compare les floats avec une tolérance, jamais avec == directement.`,
          `pytest exécute seul les fonctions test_* des fichiers test_*.py.`,
          `Un test qui ne peut pas échouer ne protège de rien.`
        ],
        check: {
          type: 'code',
          prompt: `Écris \`tester_mediane(mediane)\` : elle reçoit une fonction \`mediane\` et la vérifie avec des assert. Les tests de CodeQuest lui passeront une version correcte (tes tests doivent réussir) et trois versions boguées (tes tests doivent lever AssertionError) : une qui oublie de trier, une qui se trompe sur les listes de taille paire, une qui ne lève pas ValueError sur une liste vide. Rappel : la médiane de [1, 2, 3, 4] vaut 2.5.`,
          starter: `def tester_mediane(mediane):
    # cas normal, liste impaire déjà triée
    assert mediane([1, 2, 3]) == 2
    # ajoute : liste non triée, liste de taille paire, liste vide
`,
          solution: `def tester_mediane(mediane):
    assert mediane([1, 2, 3]) == 2
    assert mediane([5, 1, 3]) == 3
    assert mediane([4, 1, 3, 2]) == 2.5
    try:
        mediane([])
        leve = False
    except ValueError:
        leve = True
    assert leve, "mediane([]) doit lever ValueError"
`,
          tests: [
            { code: `def mediane_ok(valeurs):
    if not valeurs:
        raise ValueError("liste vide")
    v = sorted(valeurs)
    n = len(v)
    if n % 2 == 1:
        return v[n // 2]
    return (v[n // 2 - 1] + v[n // 2]) / 2
tester_mediane(mediane_ok)`, label: `tes tests acceptent une médiane correcte` },
            { code: `def mediane_sans_tri(valeurs):
    if not valeurs:
        raise ValueError("liste vide")
    n = len(valeurs)
    if n % 2 == 1:
        return valeurs[n // 2]
    return (valeurs[n // 2 - 1] + valeurs[n // 2]) / 2
try:
    tester_mediane(mediane_sans_tri)
    detecte = False
except AssertionError:
    detecte = True
assert detecte`, label: `tes tests détectent l'oubli du tri` },
            { code: `def mediane_paire_fausse(valeurs):
    if not valeurs:
        raise ValueError("liste vide")
    v = sorted(valeurs)
    return v[len(v) // 2]
try:
    tester_mediane(mediane_paire_fausse)
    detecte = False
except AssertionError:
    detecte = True
assert detecte`, label: `tes tests détectent une erreur sur les listes de taille paire` },
            { code: `def mediane_vide_fausse(valeurs):
    if not valeurs:
        return 0
    v = sorted(valeurs)
    n = len(v)
    if n % 2 == 1:
        return v[n // 2]
    return (v[n // 2 - 1] + v[n // 2]) / 2
try:
    tester_mediane(mediane_vide_fausse)
    detecte = False
except AssertionError:
    detecte = True
assert detecte`, label: `tes tests détectent l'absence de ValueError sur une liste vide` }
          ],
          hint: `Chaque version boguée doit faire échouer au moins un de tes assert. Choisis une liste impaire non triée, une liste paire, et vérifie l'exception avec try/except comme dans l'exemple.`,
          explain: `Un jeu de tests vaut par les bugs qu'il détecte. Une liste non triée démasque l'oubli de sorted, une liste paire le calcul du milieu, et le try/except le cas d'erreur. C'est le principe du « test de mutation » : on vérifie ses tests en leur soumettant du code volontairement faux.`
        }
      },
      {
        id: 'py.u18.l2',
        title: 'Lire une traceback et déboguer',
        minutes: 7,
        objective: 'Tu sais lire une traceback (type, message, ligne, chaîne d\'appels) et localiser un bug avec une méthode et des affichages ciblés.',
        explain: `Quand une exception n'est pas attrapée, Python affiche une **traceback**. Lis-la **de bas en haut** :

- la **dernière ligne** donne le type et le message : \`KeyError: 'score'\` ;
- juste au-dessus, la ligne de code qui a échoué, avec son fichier et son numéro ;
- plus haut, la chaîne des appels qui y ont mené, du premier appel (en haut) au plus profond.

L'erreur se manifeste souvent loin de sa cause : un \`None\` renvoyé par oubli fait planter le code trois fonctions plus loin.

Une méthode en quatre temps :

- **reproduire** le bug avec la plus petite entrée possible ;
- **lire** la traceback : quelle ligne, quel type, quelle valeur ?
- **formuler une hypothèse** (« cette variable vaut None »), puis la **vérifier** avec \`print(f"{x=}")\` ou les points d'arrêt du débogueur de ton éditeur ;
- **corriger**, puis ajouter un test pour que le bug ne revienne pas.`,
        example: {
          code: `def prix_ttc(article):
    return round(article["prix"] * 1.2, 2)

def total(panier):
    somme = 0
    for article in panier:
        print(f"{article=}")
        somme += prix_ttc(article)
    return somme

panier = [{"nom": "câble", "prix": 5}, {"nom": "clé USB", "prix": 12.5}]
print(total(panier))`,
          output: `article={'nom': 'câble', 'prix': 5}
article={'nom': 'clé USB', 'prix': 12.5}
21.0`,
          notes: [
            { line: 7, text: `{article=} affiche le nom de la variable et sa valeur : idéal pour vérifier une hypothèse.` },
            { line: 8, text: `Si un article n'avait pas de clé "prix", la traceback pointerait la ligne 2, appelée depuis cette ligne 8.` },
            { line: 12, text: `Une fois le bug compris, on retire les print de débogage.` }
          ]
        },
        exercises: [
          {
            type: 'logic',
            lang: 'text',
            prompt: `Voici la traceback d'un programme \`app.py\`. À quel numéro de ligne de \`app.py\` l'erreur s'est-elle produite ?`,
            code: `Traceback (most recent call last):
  File "app.py", line 14, in <module>
    rapport = generer_rapport(utilisateurs)
  File "app.py", line 9, in generer_rapport
    lignes.append(formater(u))
  File "app.py", line 4, in formater
    return f"{u['nom']} : {u['score']:.1f}"
KeyError: 'score'`,
            answer: '4',
            accept: ['ligne 4'],
            mistakes: [
              { answer: '14', why: `La ligne 14 est le point de départ, tout en haut. Une traceback se lit de bas en haut : l'erreur est dans le dernier bloc File.` },
              { answer: '9', why: `La ligne 9 est un appel intermédiaire : generer_rapport a appelé formater, où l'erreur s'est produite.` }
            ],
            hint: `Le dernier bloc « File … line … » avant le message d'erreur indique où l'exception a été levée.`,
            explain: `L'exception KeyError: 'score' est levée ligne 4, dans formater : un des utilisateurs n'a pas de clé "score". Les lignes 14 et 9 montrent seulement le chemin des appels. Prochaine étape : afficher u avant la ligne 4 pour trouver l'utilisateur fautif.`
          },
          {
            type: 'bug',
            prompt: `Ce programme plante ligne 12 avec : \`TypeError: unsupported operand type(s) for +=: 'int' and 'NoneType'\`. La ligne 12 n'est que le symptôme. Clique sur la ligne qui cause le bug.`,
            code: `def nettoyer(score):
    if score < 0:
        return 0
    elif score > 100:
        return 100
    else:
        score

scores = [45, -3, 120, 80]
total = 0
for s in scores:
    total += nettoyer(s)
print(total)`,
            bugLine: 7,
            why: `La branche else évalue score sans le renvoyer. Une fonction qui se termine sans return renvoie None : nettoyer(45) vaut None, et l'addition échoue ligne 12.`,
            fixes: [
              `        return score`,
              `        print(score)`,
              `        score = score`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `print affiche la valeur mais la fonction renvoie toujours None : même erreur ligne 12.`,
              2: `Cette affectation ne change rien : la fonction se termine toujours sans return.`
            },
            output: `225`,
            hint: `Le message parle de NoneType. Quelle fonction renvoie None, et dans quel cas ?`,
            explain: `Le type NoneType dans le message est l'indice : une valeur vaut None alors qu'on attendait un nombre. En remontant à sa source, on trouve la branche sans return. C'est le cas typique d'une erreur visible loin de sa cause.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `La fonction \`statistiques\` a plusieurs bugs. Lance les tests, lis les messages d'échec, formule une hypothèse pour chacun (ajoute des \`print(f"{x=}")\` si besoin), puis corrige. Une liste vide doit lever \`ValueError\`.`,
          starter: `def statistiques(valeurs):
    plus_petit = valeurs[0]
    plus_grand = 0
    total = 0
    for v in valeurs:
        if v < plus_petit:
            plus_petit = v
        if v > plus_grand:
            plus_grand = v
        total += v
    return {"min": plus_petit, "max": plus_grand, "moyenne": total / (len(valeurs) - 1)}
`,
          solution: `def statistiques(valeurs):
    if not valeurs:
        raise ValueError("liste vide")
    plus_petit = valeurs[0]
    plus_grand = valeurs[0]
    total = 0
    for v in valeurs:
        if v < plus_petit:
            plus_petit = v
        if v > plus_grand:
            plus_grand = v
        total += v
    return {"min": plus_petit, "max": plus_grand, "moyenne": total / len(valeurs)}
`,
          tests: [
            { code: `assert statistiques([2, 4, 6]) == {"min": 2, "max": 6, "moyenne": 4.0}`, label: `statistiques([2, 4, 6]) donne min 2, max 6, moyenne 4.0` },
            { code: `assert statistiques([-5, -2, -9])["max"] == -2`, label: `avec des valeurs toutes négatives, le max vaut -2` },
            { code: `assert statistiques([7]) == {"min": 7, "max": 7, "moyenne": 7.0}`, label: `une liste d'un seul élément fonctionne` },
            { code: `try:
    statistiques([])
    leve = False
except ValueError:
    leve = True
assert leve`, label: `une liste vide lève ValueError` }
          ],
          hint: `Trois pistes : la valeur de départ de plus_grand convient-elle à des nombres négatifs ? Par quoi divise-t-on pour une moyenne ? Que fait valeurs[0] sur une liste vide ?`,
          explain: `Initialiser le maximum à 0 suppose des valeurs positives : on part du premier élément. La moyenne divise par len(valeurs), sinon une liste d'un élément provoque même une division par zéro. Enfin, on vérifie la liste vide avant valeurs[0], pour lever une erreur explicite au lieu d'une IndexError.`
        },
        recap: [
          `Une traceback se lit de bas en haut : type et message, puis la ligne fautive, puis le chemin des appels.`,
          `L'erreur visible est souvent un symptôme : remonte à la source de la mauvaise valeur.`,
          `Reproduire, lire, formuler une hypothèse, vérifier, corriger, ajouter un test.`,
          `print(f"{x=}") affiche le nom et la valeur d'une variable.`
        ],
        check: {
          type: 'predict',
          prompt: `Un client signale que le code promo « ete » ne marche pas. Tu ajoutes un affichage de débogage. Qu'affiche le programme ?`,
          code: `def appliquer_remise(prix, code):
    remises = {"ETE": 0.2, "VIP": 0.3}
    taux = remises.get(code, 0)
    print(f"{code=} {taux=}")
    return prix * (1 - taux)

print(appliquer_remise(100, "ete"))`,
          answer: `code='ete' taux=0
100`,
          mistakes: [
            { answer: `code=ete taux=0
100`, why: `La forme {x=} affiche la représentation de la valeur (repr) : une chaîne apparaît entre apostrophes.` },
            { answer: `code='ete' taux=0.2
80.0`, why: `Les clés de dict sont sensibles à la casse : "ete" n'est pas "ETE", donc get renvoie la valeur par défaut 0.` }
          ],
          hint: `"ete" et "ETE" sont-elles la même clé ? Et comment {x=} affiche-t-il une chaîne ?`,
          explain: `L'affichage révèle la cause : taux vaut 0 car la clé "ete" n'existe pas, seule "ETE" existe. 100 × (1 - 0) donne 100. La correction : normaliser l'entrée avec code.upper(), puis ajouter un test pour le code en minuscules.`
        }
      }
    ]
  };

  var u19 = {
    id: 'py.u19',
    title: 'Requêtes HTTP et API',
    summary: 'Comprendre ce qui circule entre ton programme et une API web, et l\'interroger proprement avec requests.',
    lessons: [
      {
        id: 'py.u19.l1',
        title: 'HTTP, statuts et JSON',
        minutes: 7,
        objective: 'Tu sais décrire une requête et une réponse HTTP (méthode, URL, statut, corps JSON) et exploiter en Python le JSON renvoyé par une API.',
        explain: `Quand ton programme interroge une **API web**, il envoie une **requête HTTP** et reçoit une **réponse**.

- La requête : une **méthode** (\`GET\` pour lire, \`POST\` pour créer, \`PUT\` ou \`PATCH\` pour modifier, \`DELETE\` pour supprimer), une **URL** avec d'éventuels paramètres (\`?ville=Lyon&jours=3\`), des **en-têtes** (souvent une clé d'API) et parfois un **corps**.
- La réponse : un **code de statut**, des en-têtes et un corps, le plus souvent en **JSON**.

Les statuts à connaître : **2xx** succès (200 OK, 201 Created) ; **4xx** erreur dans ta requête (400 invalide, 401 non authentifié, 403 interdit, 404 introuvable, 429 trop de requêtes) ; **5xx** erreur du serveur (500, 503).

Les grosses listes sont souvent **paginées** : la réponse indique \`page\`, \`par_page\` et \`total\`.

Le corps JSON se transforme en dict et listes avec \`json.loads\`. Dans cette leçon, les réponses sont des textes d'exemple : aucune requête ne part sur Internet.`,
        example: {
          code: `import json

statut = 200
corps = '{"ville": "Lyon", "previsions": [{"jour": "lun", "temp": 18}, {"jour": "mar", "temp": 21}]}'

if 200 <= statut < 300:
    donnees = json.loads(corps)
    for p in donnees["previsions"]:
        print(p["jour"], p["temp"], "°C")
    moyenne = sum(p["temp"] for p in donnees["previsions"]) / len(donnees["previsions"])
    print(f"Moyenne à {donnees['ville']} : {moyenne:.1f} °C")
elif statut == 404:
    print("Ville inconnue")`,
          output: `lun 18 °C
mar 21 °C
Moyenne à Lyon : 19.5 °C`,
          notes: [
            { line: 4, text: `Le corps reçu est du texte : une chaîne au format JSON.` },
            { line: 6, text: `On vérifie d'abord le statut : tout 2xx est un succès.` },
            { line: 7, text: `json.loads donne un dict ; "previsions" est une liste de dict qu'on parcourt.` }
          ]
        },
        exercises: [
          {
            type: 'predict',
            prompt: `Qu'affiche ce programme ?`,
            code: `import json

reponse = '{"id": 7, "actif": true, "role": null, "tags": ["ia", "web"]}'
user = json.loads(reponse)
print(user["actif"], user["role"], len(user["tags"]))
print(user["id"] + 1, user["tags"][-1])`,
            answer: `True None 2
8 web`,
            mistakes: [
              { answer: `true null 2
8 web`, why: `json.loads convertit les valeurs JSON en valeurs Python : true devient True, null devient None.` },
              { answer: `True None 2
71 web`, why: `En JSON, 7 sans guillemets est un nombre : user["id"] est l'entier 7, et 7 + 1 vaut 8.` }
            ],
            hint: `Quels sont les équivalents Python de true et null ? Et 7 est-il écrit entre guillemets dans le JSON ?`,
            explain: `json.loads produit un dict Python : true devient True, null devient None, les nombres restent des nombres et les tableaux deviennent des listes. On peut donc calculer et indexer directement.`
          },
          {
            type: 'qcm',
            prompt: `Ton script appelle une API de traduction et reçoit le statut **429**. Que faire ?`,
            choices: [
              `Attendre un peu puis réessayer : tu as envoyé trop de requêtes en peu de temps.`,
              `Vérifier l'URL : la ressource demandée n'existe pas.`,
              `Réessayer immédiatement en boucle : le serveur est en panne.`,
              `Vérifier ta clé d'API : tu n'es pas authentifié.`
            ],
            answer: 0,
            why: {
              1: `Une ressource inexistante renvoie 404.`,
              2: `Une panne du serveur renvoie un 5xx. Et réessayer en boucle sans attendre aggrave une surcharge, quel que soit le statut.`,
              3: `Une authentification absente ou invalide renvoie 401.`
            },
            hint: `Le 4 indique que le problème vient de ton côté. Quel 4xx parle de quantité de requêtes ?`,
            explain: `429 Too Many Requests : tu dépasses la limite de débit de l'API. On attend (souvent le délai indiqué par l'en-tête Retry-After), puis on réessaie, en espaçant de plus en plus les tentatives.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Une API d'évaluation renvoie un statut et un corps JSON. Écris \`meilleurs_modeles(statut, corps, seuil)\` : si le statut vaut 200, renvoie les noms des modèles dont la précision est au moins \`seuil\`, du plus précis au moins précis ; si le statut vaut 404, renvoie une liste vide ; pour tout autre statut, lève \`RuntimeError\` avec un message qui contient le statut.`,
          starter: `import json

CORPS = '{"modeles": [{"nom": "arbre", "precision": 0.84}, {"nom": "reseau", "precision": 0.91}, {"nom": "baseline", "precision": 0.71}]}'

def meilleurs_modeles(statut, corps, seuil):
    # décode le JSON si le statut vaut 200
    return []
`,
          solution: `import json

CORPS = '{"modeles": [{"nom": "arbre", "precision": 0.84}, {"nom": "reseau", "precision": 0.91}, {"nom": "baseline", "precision": 0.71}]}'

def meilleurs_modeles(statut, corps, seuil):
    if statut == 404:
        return []
    if statut != 200:
        raise RuntimeError(f"erreur HTTP {statut}")
    modeles = json.loads(corps)["modeles"]
    retenus = [m for m in modeles if m["precision"] >= seuil]
    retenus = sorted(retenus, key=lambda m: m["precision"], reverse=True)
    return [m["nom"] for m in retenus]
`,
          tests: [
            { code: `assert meilleurs_modeles(200, CORPS, 0.8) == ["reseau", "arbre"]`, label: `seuil 0.8 : ["reseau", "arbre"], du plus précis au moins précis` },
            { code: `assert meilleurs_modeles(200, CORPS, 0.95) == []`, label: `seuil 0.95 : aucun modèle retenu` },
            { code: `assert meilleurs_modeles(404, "", 0.5) == []`, label: `statut 404 : liste vide` },
            { code: `try:
    meilleurs_modeles(500, "", 0.5)
    message = ""
except RuntimeError as e:
    message = str(e)
assert "500" in message`, label: `statut 500 : RuntimeError dont le message contient 500` }
          ],
          hint: `Traite d'abord les statuts d'erreur, puis décode le JSON. sorted accepte key et reverse=True.`,
          explain: `On vérifie le statut avant de toucher au corps : un corps d'erreur n'a pas la structure attendue. Ensuite, une compréhension filtre les modèles et sorted les classe par précision décroissante. C'est la forme typique d'un traitement de réponse d'API.`
        },
        recap: [
          `Une requête : méthode, URL et paramètres, en-têtes, corps éventuel.`,
          `Une réponse : statut, en-têtes, corps souvent en JSON.`,
          `2xx succès, 4xx erreur dans la requête (401, 404, 429…), 5xx erreur du serveur.`,
          `json.loads transforme le corps en dict et listes Python.`
        ],
        check: {
          type: 'logic',
          prompt: `Une API renvoie ses résultats par pages. Voici la première réponse. Combien de requêtes GET faut-il **au total** pour récupérer tous les résultats ?`,
          code: `import json

corps = '{"page": 1, "par_page": 20, "total": 87, "resultats": ["..."]}'
infos = json.loads(corps)`,
          answer: '5',
          accept: ['cinq'],
          mistakes: [
            { answer: '4', why: `4 pages de 20 ne donnent que 80 résultats : une 5e page contient les 7 derniers.` },
            { answer: '4.35', why: `On ne peut pas faire une fraction de requête : 87 / 20 = 4.35, arrondi au nombre entier supérieur.` },
            { answer: '87', why: `Chaque requête renvoie jusqu'à 20 résultats (par_page), pas un seul.` }
          ],
          hint: `Chaque page contient au plus par_page résultats. Combien de pages faut-il pour couvrir total ?`,
          explain: `Il faut 87 / 20 = 4.35 pages, donc 5 requêtes (pages 1 à 5), la dernière ne contenant que 7 résultats. En Python : (total + par_page - 1) // par_page, ou math.ceil(total / par_page).`
        }
      },
      {
        id: 'py.u19.l2',
        title: 'La bibliothèque requests',
        minutes: 8,
        objective: 'Tu sais lire et écrire un appel d\'API avec requests (paramètres, timeout, raise_for_status, clé dans une variable d\'environnement) et gérer ses erreurs.',
        explain: `Sur ton ordinateur, la bibliothèque **requests** (\`pip install requests\`) envoie les requêtes HTTP. Elle ne tourne pas dans CodeQuest : les exemples sont à lire ici et à essayer chez toi.

- \`requests.get(url, params={...}, headers={...}, timeout=10)\` envoie un GET ; \`requests.post(url, json={...})\` envoie un corps JSON.
- La réponse \`r\` offre \`r.status_code\`, \`r.json()\` (le corps décodé) et \`r.text\`.
- \`r.raise_for_status()\` lève \`requests.HTTPError\` si le statut est 4xx ou 5xx.
- **Toujours un \`timeout\`** : sans lui, un serveur muet bloque ton programme indéfiniment.
- Attrape \`requests.Timeout\`, \`requests.ConnectionError\`, ou leur parent commun \`requests.RequestException\`.
- **Jamais de clé d'API dans le code** : elle finirait sur GitHub. Lis-la avec \`os.environ.get("METEO_API_KEY")\` et définis-la dans ton terminal (\`$env:METEO_API_KEY = "..."\` en PowerShell).`,
        example: {
          run: false,
          code: `import os
import requests

def temperature(ville):
    cle = os.environ.get("METEO_API_KEY")
    if cle is None:
        raise RuntimeError("Définis la variable d'environnement METEO_API_KEY")
    try:
        r = requests.get("https://api.exemple.com/v1/meteo", params={"ville": ville},
                         headers={"Authorization": f"Bearer {cle}"}, timeout=10)
        r.raise_for_status()
    except requests.Timeout:
        raise RuntimeError("Le service météo ne répond pas")
    except requests.HTTPError:
        raise RuntimeError(f"Erreur HTTP {r.status_code}")
    return r.json()["temperature"]

# print(temperature("Lyon"))  # à lancer sur ton ordinateur`,
          notes: [
            { line: 5, text: `La clé vient de l'environnement : le code peut être publié sans elle.` },
            { line: 9, text: `params construit l'URL ?ville=Lyon en encodant correctement les caractères spéciaux.` },
            { line: 10, text: `timeout=10 : au-delà de 10 secondes sans réponse, requests lève requests.Timeout.` },
            { line: 11, text: `raise_for_status transforme un statut 4xx ou 5xx en exception, attrapée juste en dessous.` }
          ]
        },
        exercises: [
          {
            type: 'fill',
            run: false,
            prompt: `Complète cet appel à une API de films (code à lire, non exécuté dans l'appli).`,
            code: `import requests

def films_sf():
    r = requests.get("https://api.exemple.com/v1/films",
                     ___={"genre": "science-fiction", "page": 1},
                     ___=10)
    r.___()
    return r.___()["resultats"]`,
            blanks: [
              { answers: ['params'], options: ['params', 'data', 'query'], why: { 'data': `data envoie un corps de formulaire, ce qui n'a pas de sens pour un GET : les filtres vont dans l'URL.`, 'query': `requests n'a pas de paramètre query : c'est params qui construit ?genre=...&page=1.` } },
              { answers: ['timeout'], options: ['timeout', 'delai', 'wait'], why: { 'delai': `requests ne connaît pas ce nom : TypeError (argument inattendu).`, 'wait': `requests ne connaît pas ce nom : TypeError (argument inattendu).` } },
              { answers: ['raise_for_status'], options: ['raise_for_status', 'raise', 'check_status'], why: { 'raise': `raise est un mot-clé de Python, pas une méthode de la réponse.`, 'check_status': `Cette méthode n'existe pas : AttributeError.` } },
              { answers: ['json'], options: ['json', 'text', 'loads'], why: { 'text': `r.text est un attribut (une chaîne), pas une méthode : r.text() lève TypeError, et on n'obtiendrait pas un dict.`, 'loads': `loads est une fonction du module json, pas une méthode de la réponse.` } }
            ],
            hint: `Les filtres d'un GET vont dans l'URL ; il faut toujours limiter l'attente ; puis vérifier le statut avant de décoder le corps.`,
            explain: `params ajoute ?genre=science-fiction&page=1 à l'URL, timeout limite l'attente, raise_for_status lève une exception si le statut est 4xx ou 5xx, et r.json() décode le corps JSON en dict.`
          },
          {
            type: 'bug',
            run: false,
            prompt: `Quand le serveur ne répond plus, ce programme reste bloqué indéfiniment au lieu d'afficher « Le serveur est trop lent ». Clique sur la ligne fautive.`,
            code: `import requests

def recuperer_profil(user_id):
    url = f"https://api.exemple.com/users/{user_id}"
    try:
        r = requests.get(url)
        r.raise_for_status()
        return r.json()
    except requests.Timeout:
        print("Le serveur est trop lent : réessaie plus tard")
    except requests.RequestException as e:
        print("Erreur réseau ou HTTP :", e)
    return None`,
            bugLine: 6,
            why: `Par défaut, requests n'a aucun délai maximal : sans timeout, il attend une réponse pour toujours. L'exception requests.Timeout ne peut donc jamais être levée.`,
            fixes: [
              `        r = requests.get(url, timeout=5)`,
              `        r = requests.get(url, timeout=None)`,
              `        r = requests.get(url, params={"timeout": 5})`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `timeout=None est justement la valeur par défaut : aucune limite d'attente.`,
              2: `Cela ajoute ?timeout=5 à l'URL, un paramètre envoyé au serveur : l'attente de ton programme reste illimitée.`
            },
            hint: `Combien de temps requests attend-il une réponse si on ne lui dit rien ?`,
            explain: `Avec timeout=5, requests lève requests.Timeout au bout de 5 secondes sans réponse, et le premier except affiche le message prévu. Mets un timeout sur chaque appel réseau.`
          }
        ],
        challenge: {
          type: 'order',
          run: false,
          prompt: `Remets dans l'ordre cette fonction qui réessaie après un statut 429 (trop de requêtes) ou 503 (service indisponible), en attendant 1, 2 puis 4 secondes. On suppose \`requests\` et \`time\` déjà importés.`,
          lines: [
            `def get_avec_reessais(url, essais=3):`,
            `    for tentative in range(essais):`,
            `        r = requests.get(url, timeout=10)`,
            `        if r.status_code not in (429, 503):`,
            `            return r`,
            `        time.sleep(2 ** tentative)`,
            `    r.raise_for_status()`
          ],
          hint: `Dans la boucle : envoyer, renvoyer la réponse si elle n'est pas « à réessayer », sinon attendre. Après la boucle, tous les essais ont échoué.`,
          explain: `Chaque tentative envoie la requête ; une réponse qui n'est ni 429 ni 503 est renvoyée telle quelle. Sinon, on attend 2 ** tentative secondes (1, 2, 4) : c'est l'attente exponentielle, qui évite de surcharger un serveur en difficulté. Après le dernier essai, raise_for_status lève l'erreur HTTP.`
        },
        recap: [
          `requests.get(url, params=..., headers=..., timeout=...) ; requests.post(url, json=...).`,
          `Toujours un timeout : requests n'en a pas par défaut.`,
          `raise_for_status() transforme un 4xx ou 5xx en exception ; r.json() décode le corps.`,
          `Clés d'API dans des variables d'environnement, lues avec os.environ.get.`,
          `Pour tester sans réseau, on passe une fausse fonction à la place de requests.get.`
        ],
        check: {
          type: 'code',
          prompt: `Pour tester du code réseau sans réseau, on lui **passe** la fonction d'envoi : en production \`requests.get\`, dans les tests une fausse fonction. Écris \`temperature(ville, get)\` : elle appelle \`get("https://api.exemple.com/meteo", params={"ville": ville}, timeout=5)\`, renvoie la température du JSON si le statut vaut 200, \`None\` si le statut vaut 404, et lève \`RuntimeError\` pour tout autre statut. La classe \`FausseReponse\` imite une réponse de requests.`,
          starter: `class FausseReponse:
    def __init__(self, status_code, donnees):
        self.status_code = status_code
        self.donnees = donnees

    def json(self):
        return self.donnees


def temperature(ville, get):
    # appelle get(...), puis traite r.status_code
    pass
`,
          solution: `class FausseReponse:
    def __init__(self, status_code, donnees):
        self.status_code = status_code
        self.donnees = donnees

    def json(self):
        return self.donnees


def temperature(ville, get):
    r = get("https://api.exemple.com/meteo", params={"ville": ville}, timeout=5)
    if r.status_code == 200:
        return r.json()["temperature"]
    if r.status_code == 404:
        return None
    raise RuntimeError(f"erreur HTTP {r.status_code}")
`,
          tests: [
            { code: `def faux_get(url, params=None, timeout=None):
    return FausseReponse(200, {"ville": params["ville"], "temperature": 18})
assert temperature("Lyon", faux_get) == 18`, label: `statut 200 : renvoie la température (18)` },
            { code: `recu = {}
def espion_get(url, params=None, timeout=None):
    recu["params"] = params
    recu["timeout"] = timeout
    return FausseReponse(200, {"temperature": 3})
temperature("Oslo", espion_get)
assert recu["params"] == {"ville": "Oslo"} and recu["timeout"] is not None`, label: `envoie params={"ville": ...} et un timeout` },
            { code: `def get_404(url, params=None, timeout=None):
    return FausseReponse(404, {"erreur": "introuvable"})
assert temperature("Atlantis", get_404) is None`, label: `statut 404 : renvoie None` },
            { code: `def get_503(url, params=None, timeout=None):
    return FausseReponse(503, {})
try:
    temperature("Lyon", get_503)
    leve = False
except RuntimeError:
    leve = True
assert leve`, label: `statut 503 : lève RuntimeError` }
          ],
          hint: `Dans temperature, get s'utilise exactement comme requests.get. Teste r.status_code avant d'appeler r.json().`,
          explain: `temperature ne dépend plus du réseau : elle reçoit la fonction d'envoi. Sur ton ordinateur, tu l'appelles avec temperature("Lyon", requests.get) ; dans les tests, avec une fausse fonction qui renvoie la réponse voulue. Cette injection de dépendance rend testables tous les cas, y compris les erreurs rares comme un 503.`
        }
      }
    ]
  };

  var u20 = {
    id: 'py.u20',
    title: 'Organisation de projets',
    summary: 'Structurer un projet en modules, l\'isoler dans un environnement virtuel et le rendre installable ailleurs.',
    lessons: [
      {
        id: 'py.u20.l1',
        title: 'Modules, environnement virtuel et dépendances',
        minutes: 8,
        objective: 'Tu sais découper un projet en modules importables, protéger le code de lancement avec if __name__ == "__main__", et organiser l\'arborescence d\'un projet avec son environnement virtuel.',
        explain: `Un script unique devient vite ingérable. Organise ton projet :

- **Modules** : un fichier \`.py\` par thème (\`modeles.py\`, \`stockage.py\`), importés avec \`from stockage import charger\`. Un module se contente de **définir** (fonctions, classes, constantes) : pas de \`print\` ni de traitement au niveau principal.
- **\`if __name__ == "__main__":\`** : \`__name__\` vaut \`"__main__"\` dans le fichier lancé directement, et le nom du module (\`"stockage"\`) dans un fichier importé. Le code de lancement placé sous ce test ne s'exécute donc pas quand on importe le module, par exemple depuis les tests.
- **Arborescence type** : \`src/\` pour le code, \`tests/\` pour les tests, un \`README.md\` qui explique l'installation et l'usage, et \`requirements.txt\`.
- **Environnement** (rappel de l'unité 11) : un \`.venv\` par projet, jamais versionné : ajoute \`.venv/\` au fichier \`.gitignore\`. Quiconque clone ton projet le recrée avec \`python -m venv .venv\`, l'active, puis lance \`pip install -r requirements.txt\`.`,
        example: {
          code: `# fichier statistiques.py
def moyenne(valeurs):
    return sum(valeurs) / len(valeurs)

def main():
    scores = [0.82, 0.91, 0.77]
    print(f"Moyenne : {moyenne(scores):.2f}")

if __name__ == "__main__":
    main()`,
          output: `Moyenne : 0.83`,
          notes: [
            { line: 2, text: `Les fonctions réutilisables sont définies en haut du module, sans effet de bord.` },
            { line: 5, text: `main() regroupe ce qui se passe quand on lance le programme.` },
            { line: 9, text: `Vrai avec python statistiques.py ; faux avec from statistiques import moyenne : main() ne s'exécute alors pas.` }
          ]
        },
        exercises: [
          {
            type: 'qcm',
            prompt: `Le fichier \`outils.py\` contient ce code. Dans un autre fichier, tu écris \`from outils import nettoyer\` et tu le lances. Qu'est-ce qui s'affiche au moment de l'import ?`,
            code: `print("chargement de outils")

def nettoyer(texte):
    return texte.strip().lower()

if __name__ == "__main__":
    print(nettoyer("  TEST "))`,
            choices: [
              `Rien : un import n'exécute pas le code du module.`,
              `« chargement de outils » seulement.`,
              `« chargement de outils » puis « test ».`,
              `Une erreur : on ne peut pas importer depuis un fichier qui contient un if au niveau principal.`
            ],
            answer: 1,
            why: {
              0: `Un import exécute tout le module, de haut en bas, une première fois : le print du niveau principal s'exécute.`,
              2: `Dans un module importé, __name__ vaut "outils", pas "__main__" : le bloc final ne s'exécute pas.`,
              3: `Un module peut contenir n'importe quelles instructions ; le if est même la façon recommandée de séparer le code de lancement.`
            },
            hint: `Un import exécute le module. Que vaut __name__ dans un module importé ?`,
            explain: `L'import exécute le module : la définition de nettoyer et le print du haut. Le test __name__ == "__main__" est faux, donc la démonstration ne s'exécute pas. C'est pourquoi on évite les print et les traitements au niveau principal d'un module.`
          },
          {
            type: 'bug',
            prompt: `Quand tu lances \`python convertisseur.py\`, rien ne s'affiche, alors que le programme devrait afficher trois conversions. Clique sur la ligne fautive.`,
            code: `def convertir(celsius):
    return celsius * 9 / 5 + 32

def main():
    for c in [0, 37, 100]:
        print(c, "°C =", convertir(c), "°F")

if __name__ == "main":
    main()`,
            bugLine: 8,
            why: `Dans le fichier lancé directement, __name__ vaut "__main__", avec deux tirets bas de chaque côté. Comparé à "main", le test est toujours faux : main() n'est jamais appelée.`,
            fixes: [
              `if __name__ == "__main__":`,
              `if __name__ != "main":`,
              `if __name__ == "convertisseur":`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `Ce test serait vrai au lancement, mais aussi lors d'un import (__name__ vaut alors "convertisseur") : main() s'exécuterait à chaque import, ce qu'on veut justement éviter.`,
              2: `C'est l'inverse de ce qu'on veut : ce test n'est vrai que lorsque le module est importé, jamais quand on le lance.`
            },
            output: `0 °C = 32.0 °F
37 °C = 98.6 °F
100 °C = 212.0 °F`,
            hint: `Quelle est la valeur exacte de __name__ dans le fichier qu'on lance ?`,
            explain: `La garde if __name__ == "__main__": est vraie seulement quand le fichier est lancé directement. Une faute de frappe dans "__main__" ne provoque aucune erreur : le bloc est simplement ignoré, ce qui rend ce bug discret.`
          }
        ],
        challenge: {
          type: 'logic',
          run: false,
          prompt: `Tu lances \`python app.py\`. Qu'affiche la **première** ligne de sortie ?`,
          code: `# fichier stockage.py
print(__name__)

# fichier app.py
import stockage
print(__name__)`,
          answer: 'stockage',
          accept: [`'stockage'`, `"stockage"`],
          mistakes: [
            { answer: '__main__', why: `Seul le fichier lancé directement (app.py) a __name__ égal à "__main__". C'est la deuxième ligne affichée.` },
            { answer: 'stockage.py', why: `__name__ contient le nom du module, sans l'extension .py.` },
            { answer: 'app', why: `La première ligne vient de stockage.py, exécuté au moment de l'import, avant le print de app.py.` }
          ],
          hint: `Quel fichier s'exécute en premier ? Et quelle valeur prend __name__ dans un module importé ?`,
          explain: `import stockage exécute stockage.py, où __name__ vaut "stockage" : c'est la première ligne. Puis app.py continue et affiche "__main__", car c'est le fichier lancé.`
        },
        recap: [
          `Un module par thème, qui définit sans rien exécuter ; on l'importe avec from module import nom.`,
          `if __name__ == "__main__": protège le code de lancement lors d'un import.`,
          `Arborescence type : src/, tests/, README.md, requirements.txt.`,
          `.venv/ ne se versionne pas (.gitignore) : il se recrée à partir de requirements.txt.`
        ],
        check: {
          type: 'code',
          prompt: `Réorganise ce script pour qu'il soit importable : mets le calcul dans une fonction \`compter_mots(texte)\` qui renvoie le dict des occurrences, le code de lancement dans une fonction \`main()\`, et appelle \`main()\` seulement sous \`if __name__ == "__main__":\`. Le programme doit toujours afficher 3.`,
          starter: `texte = "le chat et le chien et le lapin"
compte = {}
for mot in texte.split():
    compte[mot] = compte.get(mot, 0) + 1
print(compte["le"])
`,
          solution: `def compter_mots(texte):
    compte = {}
    for mot in texte.split():
        compte[mot] = compte.get(mot, 0) + 1
    return compte

def main():
    texte = "le chat et le chien et le lapin"
    print(compter_mots(texte)["le"])

if __name__ == "__main__":
    main()
`,
          tests: [
            { code: `assert compter_mots("a b a") == {"a": 2, "b": 1}`, label: `compter_mots("a b a") renvoie {"a": 2, "b": 1}` },
            { code: `assert compter_mots("") == {}`, label: `compter_mots("") renvoie {}` }
          ],
          expectOutput: `3`,
          checks: [
            { re: `def\\s+main\\s*\\(`, label: `Une fonction main()` },
            { re: `if\\s+__name__\\s*==\\s*["']__main__["']\\s*:`, label: `Le lancement est protégé par if __name__ == "__main__":` }
          ],
          hint: `compter_mots ne doit rien afficher : elle renvoie le dict. C'est main() qui fournit le texte et affiche le résultat.`,
          explain: `compter_mots est maintenant réutilisable et testable : un autre module peut l'importer sans déclencher d'affichage. main() rassemble le lancement, et le test sur __name__ ne l'exécute que si le fichier est lancé directement.`
        }
      }
    ]
  };

  var u21 = {
    id: 'py.u21',
    title: 'Projets complets',
    summary: 'Assembler classes, exceptions, JSON et tests dans une petite application qui tient debout.',
    lessons: [
      {
        id: 'py.u21.l1',
        title: 'Projet : gestionnaire de bibliothèque',
        minutes: 10,
        objective: 'Tu sais assembler une petite application complète : des classes, des exceptions métier, une sauvegarde JSON et des tests.',
        explain: `Tu vas assembler le chapitre dans une application : un gestionnaire de bibliothèque personnelle.

- \`Livre\` : une classe simple, avec \`vers_dict()\` et \`depuis_dict()\` pour passer de l'objet au JSON et inversement.
- \`Bibliotheque\` : gère la collection (ajouter, emprunter, rendre) et lève des exceptions claires comme \`LivreIntrouvable\`.
- La **sauvegarde** : une liste de dict écrite en JSON, relue au démarrage.
- Les **tests** : chaque règle a le sien.

Nouveauté : \`@classmethod\` déclare une méthode appelée sur la classe (\`Livre.depuis_dict(d)\`). Elle reçoit la classe, nommée \`cls\`, et fabrique un objet : c'est un constructeur alternatif.

Principe clé : sépare la **logique** (les classes, sans \`print\` ni \`input\`) de l'**interface** (affichage et saisie). La logique devient testable, et tu pourras remplacer le terminal par une page web ou une API sans la réécrire. Sur ton ordinateur, range ce code dans \`bibliotheque.py\`, \`test_bibliotheque.py\` et \`main.py\`.`,
        example: {
          code: `import json

class Livre:
    def __init__(self, isbn, titre, auteur, emprunte=False):
        self.isbn = isbn
        self.titre = titre
        self.auteur = auteur
        self.emprunte = emprunte

    def vers_dict(self):
        return {"isbn": self.isbn, "titre": self.titre, "auteur": self.auteur, "emprunte": self.emprunte}

    @classmethod
    def depuis_dict(cls, d):
        return cls(d["isbn"], d["titre"], d["auteur"], d["emprunte"])

texte = json.dumps([Livre("978-2", "Dune", "F. Herbert").vers_dict()])
copie = Livre.depuis_dict(json.loads(texte)[0])
print(texte)
print(copie.titre, copie.emprunte)`,
          output: `[{"isbn": "978-2", "titre": "Dune", "auteur": "F. Herbert", "emprunte": false}]
Dune False`,
          notes: [
            { line: 10, text: `vers_dict ne garde que des types que JSON sait représenter : chaînes, booléens, nombres.` },
            { line: 13, text: `@classmethod : la méthode reçoit la classe (cls) au lieu d'un objet.` },
            { line: 15, text: `cls(...) appelle le constructeur : on reconstruit un Livre à partir d'un dict.` },
            { line: 18, text: `Aller-retour complet : objet, dict, texte JSON, dict, objet.` }
          ]
        },
        exercises: [
          {
            type: 'code',
            prompt: `Étape 1, la logique. Complète \`Bibliotheque\` : \`emprunter(isbn)\` marque le livre comme emprunté, lève \`LivreIntrouvable\` si l'ISBN est inconnu et \`DejaEmprunte\` si le livre est déjà sorti ; \`disponibles()\` renvoie la liste triée des titres non empruntés.`,
            starter: `class LivreIntrouvable(Exception):
    pass

class DejaEmprunte(Exception):
    pass

class Livre:
    def __init__(self, isbn, titre, emprunte=False):
        self.isbn = isbn
        self.titre = titre
        self.emprunte = emprunte

class Bibliotheque:
    def __init__(self):
        self.livres = {}

    def ajouter(self, livre):
        self.livres[livre.isbn] = livre

    def emprunter(self, isbn):
        # LivreIntrouvable si l'isbn est inconnu, DejaEmprunte si déjà sorti
        pass

    def disponibles(self):
        # titres des livres non empruntés, triés
        return []
`,
            solution: `class LivreIntrouvable(Exception):
    pass

class DejaEmprunte(Exception):
    pass

class Livre:
    def __init__(self, isbn, titre, emprunte=False):
        self.isbn = isbn
        self.titre = titre
        self.emprunte = emprunte

class Bibliotheque:
    def __init__(self):
        self.livres = {}

    def ajouter(self, livre):
        self.livres[livre.isbn] = livre

    def emprunter(self, isbn):
        if isbn not in self.livres:
            raise LivreIntrouvable(isbn)
        livre = self.livres[isbn]
        if livre.emprunte:
            raise DejaEmprunte(livre.titre)
        livre.emprunte = True

    def disponibles(self):
        return sorted(livre.titre for livre in self.livres.values() if not livre.emprunte)
`,
            tests: [
              { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Fondation"))
b.ajouter(Livre("2", "Dune"))
assert b.disponibles() == ["Dune", "Fondation"]`, label: `disponibles() renvoie les titres triés` },
              { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Fondation"))
b.ajouter(Livre("2", "Dune"))
b.emprunter("2")
assert b.livres["2"].emprunte and b.disponibles() == ["Fondation"]`, label: `un livre emprunté disparaît des disponibles` },
              { code: `b = Bibliotheque()
try:
    b.emprunter("99")
    leve = False
except LivreIntrouvable:
    leve = True
assert leve`, label: `un ISBN inconnu lève LivreIntrouvable` },
              { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Fondation"))
b.emprunter("1")
try:
    b.emprunter("1")
    leve = False
except DejaEmprunte:
    leve = True
assert leve`, label: `emprunter deux fois le même livre lève DejaEmprunte` }
            ],
            hint: `Vérifie l'ISBN avant d'accéder au dict, puis l'état du livre. Pour disponibles, sorted accepte une expression génératrice avec un if.`,
            explain: `La logique ne fait aucun print : elle modifie l'état ou lève une exception précise. L'interface (terminal, web) décidera du message à afficher. C'est ce qui permet de tester chaque règle isolément.`
          },
          {
            type: 'fill',
            prompt: `Étape 2, la sauvegarde. Complète l'écriture et la relecture du fichier JSON. Au premier lancement, le fichier n'existe pas encore.`,
            code: `import json

class Livre:
    def __init__(self, titre, emprunte=False):
        self.titre = titre
        self.emprunte = emprunte

    def vers_dict(self):
        return {"titre": self.titre, "emprunte": self.emprunte}

def sauvegarder(livres, nom_fichier):
    with open(nom_fichier, ___, encoding="utf-8") as f:
        f.write(json.___([livre.vers_dict() for livre in livres]))

def charger(nom_fichier):
    try:
        with open(nom_fichier, encoding="utf-8") as f:
            donnees = json.loads(f.read())
    except ___:
        return []
    return [Livre(d["titre"], d["emprunte"]) for d in donnees]

print(len(charger("biblio.json")))
sauvegarder([Livre("Dune", True), Livre("Neuromancien")], "biblio.json")
print([(livre.titre, livre.emprunte) for livre in charger("biblio.json")])`,
            blanks: [
              { answers: [`"w"`, `'w'`], options: [`"w"`, `"a"`, `"r"`], why: { '"a"': `"a" ajouterait une seconde liste JSON à la suite de l'ancienne : le fichier ne serait plus du JSON valide.`, '"r"': `"r" ouvre en lecture : write lèverait une erreur.` } },
              { answers: ['dumps'], options: ['dumps', 'loads', 'dump'], why: { 'loads': `loads lit du JSON ; ici on veut produire le texte à écrire.`, 'dump': `json.dump existe, mais il prend le fichier en second argument : json.dump(donnees, f). Ici, on passe le texte à f.write.` } },
              { answers: ['FileNotFoundError'], options: ['FileNotFoundError', 'ValueError', 'KeyError'], why: { 'ValueError': `Un fichier absent lève FileNotFoundError ; le premier appel planterait.`, 'KeyError': `KeyError concerne une clé de dict absente, pas un fichier.` } }
            ],
            output: `0
[('Dune', True), ('Neuromancien', False)]`,
            hint: `Le fichier est réécrit entièrement à chaque sauvegarde. Quelle exception lève open sur un fichier qui n'existe pas ?`,
            explain: `"w" remplace le fichier par l'état actuel complet, dumps produit le texte JSON, et FileNotFoundError transforme l'absence de fichier (premier lancement) en bibliothèque vide. Les booléens font l'aller-retour sans perte.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Étape 3, l'assemblage. Complète \`rendre(isbn)\` (lève \`ValueError\` si le livre n'était pas emprunté), \`sauvegarder(nom_fichier)\` (écrit la liste des \`vers_dict()\` en JSON) et \`charger(nom_fichier)\` (ajoute les livres du fichier ; ne fait rien si le fichier n'existe pas). Un livre emprunté doit le rester après sauvegarde et rechargement.`,
          starter: `import json

class LivreIntrouvable(Exception):
    pass

class Livre:
    def __init__(self, isbn, titre, emprunte=False):
        self.isbn = isbn
        self.titre = titre
        self.emprunte = emprunte

    def vers_dict(self):
        return {"isbn": self.isbn, "titre": self.titre, "emprunte": self.emprunte}

    @classmethod
    def depuis_dict(cls, d):
        return cls(d["isbn"], d["titre"], d["emprunte"])

class Bibliotheque:
    def __init__(self):
        self.livres = {}

    def ajouter(self, livre):
        self.livres[livre.isbn] = livre

    def trouver(self, isbn):
        if isbn not in self.livres:
            raise LivreIntrouvable(isbn)
        return self.livres[isbn]

    def emprunter(self, isbn):
        livre = self.trouver(isbn)
        if livre.emprunte:
            raise ValueError(f"{livre.titre} est déjà emprunté")
        livre.emprunte = True

    def rendre(self, isbn):
        pass

    def sauvegarder(self, nom_fichier):
        pass

    def charger(self, nom_fichier):
        pass
`,
          solution: `import json

class LivreIntrouvable(Exception):
    pass

class Livre:
    def __init__(self, isbn, titre, emprunte=False):
        self.isbn = isbn
        self.titre = titre
        self.emprunte = emprunte

    def vers_dict(self):
        return {"isbn": self.isbn, "titre": self.titre, "emprunte": self.emprunte}

    @classmethod
    def depuis_dict(cls, d):
        return cls(d["isbn"], d["titre"], d["emprunte"])

class Bibliotheque:
    def __init__(self):
        self.livres = {}

    def ajouter(self, livre):
        self.livres[livre.isbn] = livre

    def trouver(self, isbn):
        if isbn not in self.livres:
            raise LivreIntrouvable(isbn)
        return self.livres[isbn]

    def emprunter(self, isbn):
        livre = self.trouver(isbn)
        if livre.emprunte:
            raise ValueError(f"{livre.titre} est déjà emprunté")
        livre.emprunte = True

    def rendre(self, isbn):
        livre = self.trouver(isbn)
        if not livre.emprunte:
            raise ValueError(f"{livre.titre} n'était pas emprunté")
        livre.emprunte = False

    def sauvegarder(self, nom_fichier):
        donnees = [livre.vers_dict() for livre in self.livres.values()]
        with open(nom_fichier, "w", encoding="utf-8") as f:
            f.write(json.dumps(donnees))

    def charger(self, nom_fichier):
        try:
            with open(nom_fichier, encoding="utf-8") as f:
                donnees = json.loads(f.read())
        except FileNotFoundError:
            return
        for d in donnees:
            self.ajouter(Livre.depuis_dict(d))
`,
          tests: [
            { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Dune"))
b.emprunter("1")
b.rendre("1")
assert not b.trouver("1").emprunte`, label: `rendre un livre emprunté le rend disponible` },
            { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Dune"))
try:
    b.rendre("1")
    leve = False
except ValueError:
    leve = True
assert leve`, label: `rendre un livre non emprunté lève ValueError` },
            { code: `b = Bibliotheque()
b.ajouter(Livre("1", "Dune"))
b.ajouter(Livre("2", "Fondation"))
b.emprunter("1")
b.sauvegarder("biblio.json")
c = Bibliotheque()
c.charger("biblio.json")
assert c.trouver("1").emprunte and not c.trouver("2").emprunte and c.trouver("2").titre == "Fondation"`, label: `sauvegarder puis charger conserve les livres et leur état` },
            { code: `b = Bibliotheque()
b.ajouter(Livre("7", "Solaris"))
b.sauvegarder("solo.json")
with open("solo.json", encoding="utf-8") as f:
    assert json.loads(f.read()) == [{"isbn": "7", "titre": "Solaris", "emprunte": False}]`, label: `le fichier contient une liste JSON de dict` },
            { code: `c = Bibliotheque()
c.charger("absent.json")
assert c.livres == {}`, label: `charger un fichier absent laisse la bibliothèque vide` }
          ],
          hint: `rendre ressemble à emprunter, à l'envers. Pour la sauvegarde, transforme chaque livre avec vers_dict ; pour le chargement, reconstruis chacun avec Livre.depuis_dict.`,
          explain: `Chaque méthode réutilise ce qui existe : trouver gère l'ISBN inconnu, vers_dict et depuis_dict font la conversion, et l'état emprunte traverse le JSON sous forme de booléen. Le programme se compose de petites briques testées une à une : c'est la méthode qui tient quand le projet grandit.`
        },
        recap: [
          `Sépare la logique (classes, exceptions) de l'interface (print, input, web).`,
          `vers_dict et un @classmethod depuis_dict font l'aller-retour objet et JSON.`,
          `Des exceptions métier claires (LivreIntrouvable) rendent les erreurs explicites.`,
          `Une sauvegarde réécrit tout l'état en mode "w" ; un fichier absent donne un état vide.`,
          `Chaque règle a son test : on avance par petites étapes vérifiées.`
        ],
        check: {
          type: 'predict',
          prompt: `Qu'affiche ce programme ?`,
          code: `class DejaEmprunte(Exception):
    pass

class Bibliotheque:
    def __init__(self):
        self.empruntes = []

    def emprunter(self, titre):
        if titre in self.empruntes:
            raise DejaEmprunte(titre)
        self.empruntes.append(titre)

b = Bibliotheque()
for titre in ["Dune", "Fondation", "Dune"]:
    try:
        b.emprunter(titre)
        print("ok :", titre)
    except DejaEmprunte as e:
        print("refusé :", e)
print(len(b.empruntes))`,
          answer: `ok : Dune
ok : Fondation
refusé : Dune
2`,
          mistakes: [
            { answer: `ok : Dune
ok : Fondation
refusé : Dune
3`, why: `raise interrompt emprunter avant le append : le second "Dune" n'est jamais ajouté.` },
            { answer: `ok : Dune
ok : Fondation
ok : Dune
2`, why: `Quand emprunter lève l'exception, la ligne print("ok :", titre) du try est sautée : on passe directement au except.` },
            { answer: `ok : Dune
ok : Fondation
refusé : DejaEmprunte
2`, why: `print(e) affiche le message passé à l'exception, ici le titre "Dune", pas le nom de la classe.` }
          ],
          hint: `Suis chaque tour de boucle : l'exception est-elle levée avant ou après l'ajout ? Que contient le message de e ?`,
          explain: `Les deux premiers emprunts réussissent. Le troisième lève DejaEmprunte("Dune") avant toute modification : le print du try est sauté, le except affiche le message, et la liste garde 2 titres. Une règle métier vérifiée avant de modifier l'état laisse les données cohérentes.`
        }
      }
    ]
  };

  CQ.addChapter('py', {
    id: 'py.c6',
    title: 'Vers les vrais projets',
    units: [u18, u19, u20, u21]
  });
})();
