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

  CQ.addChapter('py', {
    id: 'py.c6',
    title: 'Vers les vrais projets',
    units: [u18]
  });
})();
