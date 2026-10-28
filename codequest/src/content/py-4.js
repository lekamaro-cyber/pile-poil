// Parcours Python, chapitre 4 : « Code robuste » (unités py.u12 à py.u14).
(function () {
  var u12 = {
    id: 'py.u12',
    title: 'Gestion des exceptions',
    summary: 'Attraper les erreurs prévisibles et signaler proprement celles de ton propre code.',
    lessons: [
      {
        id: 'py.u12.l1',
        title: 'Attraper une erreur',
        minutes: 7,
        objective: 'Tu sais intercepter une exception précise avec try/except et choisir entre else et finally.',
        explain: `Quand Python rencontre une erreur à l'exécution, il **lève une exception** : le programme s'arrête, sauf si tu l'attrapes.

- \`try:\` contient le code qui peut échouer.
- \`except ValueError:\` s'exécute seulement si cette exception précise arrive. \`except ValueError as e:\` donne accès au message.
- \`else:\` s'exécute si **aucune** exception n'a eu lieu.
- \`finally:\` s'exécute **toujours**, erreur ou pas : fermer, nettoyer, journaliser.

Attrape une exception **précise**. Un \`except:\` nu attrape tout, y compris tes propres bugs : une faute de frappe devient silencieuse.

C'est le même principe que \`try { } catch { } finally { }\` en PowerShell, mais Python choisit le bloc \`except\` selon le **type** de l'exception.`,
        example: {
          code: `def lire_age(texte):
    try:
        age = int(texte)
    except ValueError:
        print(f"'{texte}' n'est pas un nombre")
        return None
    else:
        print("Conversion réussie")
        return age
    finally:
        print("Fin de lire_age")

print(lire_age("42"))
print(lire_age("quarante"))`,
          output: `Conversion réussie
Fin de lire_age
42
'quarante' n'est pas un nombre
Fin de lire_age
None`,
          notes: [
            { line: 3, text: `int("quarante") lève ValueError : la suite du bloc try est abandonnée.` },
            { line: 4, text: `Seule une ValueError est attrapée ici. Une autre erreur continuerait sa route.` },
            { line: 7, text: `else ne tourne que si le try a réussi : on y met la suite « normale ».` },
            { line: 10, text: `finally s'exécute même après un return : c'est pour ça que « Fin de lire_age » s'affiche avant la valeur.` }
          ]
        },
        exercises: [
          {
            type: 'predict',
            prompt: `Qu'affiche ce programme ?`,
            code: `donnees = ["12", "abc", "7", "0"]
total = 0
for d in donnees:
    try:
        total += 10 // int(d)
    except ValueError:
        print("ignoré :", d)
    except ZeroDivisionError:
        print("division par zéro")
print(total)`,
            answer: `ignoré : abc
division par zéro
1`,
            mistakes: [
              { answer: `ignoré : abc
ignoré : 0
1`, why: `int("0") réussit : "0" est un entier valide. C'est la division 10 // 0 qui échoue, avec ZeroDivisionError, donc c'est le second except qui s'exécute.` },
              { answer: `ignoré : abc
division par zéro
2`, why: `10 // 12 vaut 0 (division entière) et 10 // 7 vaut 1 : le total final est 1.` }
            ],
            hint: `Pour chaque élément, demande-toi quelle opération échoue : la conversion int(d) ou la division.`,
            explain: `"12" donne 10 // 12 = 0, "abc" lève ValueError à la conversion, "7" donne 1, et "0" se convertit bien mais 10 // 0 lève ZeroDivisionError. Grâce aux deux except, la boucle continue après chaque erreur.`
          },
          {
            type: 'fill',
            prompt: `Complète la fonction : elle renvoie le quotient arrondi, ou "impossible" si on divise par zéro.`,
            code: `def diviser(a, b):
    ___:
        resultat = a / b
    ___ ZeroDivisionError:
        return "impossible"
    ___:
        return round(resultat, 2)

print(diviser(7, 2))
print(diviser(1, 0))`,
            blanks: [
              { answers: ['try'], options: ['try', 'if', 'with'], why: { 'if': `if teste une condition, il n'intercepte pas d'erreur.`, 'with': `with sert à gérer une ressource (un fichier), pas à attraper une erreur.` } },
              { answers: ['except'], options: ['except', 'catch', 'else'], why: { 'catch': `catch est le mot de PowerShell et de JavaScript ; Python utilise except.`, 'else': `else ne prend pas de type d'exception : il s'exécute quand il n'y a PAS eu d'erreur.` } },
              { answers: ['else'], options: ['else', 'finally', 'except'], why: { 'finally': `finally s'exécuterait aussi après l'erreur : resultat n'existerait pas, et son return remplacerait "impossible".`, 'except': `Un except sans type attraperait tout, et il ne s'exécute que s'il y a une erreur.` } }
            ],
            output: `3.5
impossible`,
            hint: `Le troisième bloc ne doit tourner que si la division a réussi.`,
            explain: `try contient la division risquée, except ZeroDivisionError gère le cas b == 0, et else ne s'exécute que si aucune exception n'a eu lieu : resultat existe alors forcément.`
          }
        ],
        challenge: {
          type: 'logic',
          prompt: `Combien de lignes ce programme affiche-t-il au total ?`,
          code: `def f(x):
    try:
        print("A")
        y = 10 / x
        print("B")
    except ZeroDivisionError:
        print("C")
    else:
        print("D")
    finally:
        print("E")

f(2)
f(0)`,
          answer: '7',
          accept: ['sept'],
          mistakes: [
            { answer: '8', why: `Pour f(0), l'exception interrompt le try immédiatement à la ligne 4 : "B" ne s'affiche pas.` },
            { answer: '6', why: `N'oublie pas qu'avec f(2), le try réussit : "D" (else) s'affiche, puis "E" (finally). Et finally s'exécute aussi pour f(0).` },
            { answer: '5', why: `finally s'exécute à chaque appel, avec ou sans erreur : compte "E" deux fois.` }
          ],
          hint: `Déroule chaque appel séparément : quels blocs s'exécutent quand le try réussit, et quand il échoue ?`,
          explain: `f(2) affiche A, B, D, E (4 lignes). f(0) affiche A, puis l'erreur saute directement au except : C, puis E (3 lignes). Total : 7.`
        },
        recap: [
          `try contient le code risqué ; except TypeErreur gère un type d'erreur précis.`,
          `except ... as e donne accès au message de l'exception.`,
          `else s'exécute seulement si le try a réussi ; finally s'exécute toujours.`,
          `Évite le except: nu, qui cache aussi tes propres bugs.`
        ],
        check: {
          type: 'code',
          prompt: `Les scores d'un modèle ont été exportés en texte, et certaines valeurs sont abîmées ("N/A", vide…). Écris \`convertir_scores(textes)\` qui renvoie la liste des scores convertis en float, en **ignorant** les valeurs invalides. Utilise try/except avec l'exception précise.`,
          starter: `def convertir_scores(textes):
    scores = []
    for t in textes:
        scores.append(float(t))
    return scores
`,
          solution: `def convertir_scores(textes):
    scores = []
    for t in textes:
        try:
            scores.append(float(t))
        except ValueError:
            pass
    return scores
`,
          tests: [
            { code: `assert convertir_scores(["0.91", "0.75"]) == [0.91, 0.75]`, label: `convertir_scores(["0.91", "0.75"]) renvoie [0.91, 0.75]` },
            { code: `assert convertir_scores(["0.8", "N/A", "", "0.6"]) == [0.8, 0.6]`, label: `les valeurs "N/A" et "" sont ignorées` },
            { code: `assert convertir_scores([]) == []`, label: `convertir_scores([]) renvoie []` }
          ],
          checks: [ { re: 'except\\s+ValueError', label: `Attrape précisément ValueError` } ],
          hint: `Quelle exception float("N/A") lève-t-il ? Place seulement la conversion dans le try.`,
          explain: `float() lève ValueError sur une chaîne qui n'est pas un nombre. En l'attrapant autour de la seule conversion, la boucle passe à la valeur suivante sans masquer d'autres erreurs.`
        }
      },
      {
        id: 'py.u12.l2',
        title: 'Lever ses propres exceptions',
        minutes: 7,
        objective: 'Tu sais lever une exception avec raise pour refuser une donnée invalide, et créer ta propre exception.',
        explain: `Attraper ne suffit pas : ton code doit aussi **signaler** les problèmes. \`raise ValueError("message")\` arrête la fonction et remonte l'erreur à l'appelant, qui décide quoi faire.

Règle pratique : une fonction qui reçoit une donnée impossible **lève** une exception, plutôt que de renvoyer une valeur bizarre (\`-1\`, \`None\`) que l'appelant oubliera de tester.

- Choisis le bon type : \`ValueError\` (valeur incorrecte), \`TypeError\` (mauvais type), \`KeyError\` (clé absente).
- Pour une erreur propre à ton application, crée ta propre exception : \`class StockInsuffisant(Exception): pass\`. C'est une classe (unité 14) ; pour l'instant, retiens cette forme.
- \`except (ValueError, KeyError) as e:\` attrape plusieurs types d'un coup.
- Dans un \`except\`, un \`raise\` seul relance l'exception en cours, par exemple après l'avoir journalisée.

En PowerShell, l'équivalent de \`raise\` est \`throw\`.`,
        example: {
          code: `class StockInsuffisant(Exception):
    pass

def retirer(stock, quantite):
    if quantite <= 0:
        raise ValueError("la quantité doit être positive")
    if quantite > stock:
        raise StockInsuffisant(f"demandé {quantite}, disponible {stock}")
    return stock - quantite

for q in [3, -1, 50]:
    try:
        print("reste", retirer(10, q))
    except (ValueError, StockInsuffisant) as e:
        print("refusé :", e)`,
          output: `reste 7
refusé : la quantité doit être positive
refusé : demandé 50, disponible 10`,
          notes: [
            { line: 1, text: `Une exception personnalisée : une classe qui hérite de Exception. pass suffit.` },
            { line: 6, text: `raise arrête retirer immédiatement : la ligne 9 n'est pas atteinte.` },
            { line: 14, text: `Un tuple de types attrape plusieurs exceptions ; e contient le message passé à raise.` }
          ]
        },
        exercises: [
          {
            type: 'bug',
            prompt: `Ce code devrait afficher « erreur : liste vide », mais il affiche « moyenne : liste vide ». Clique sur la ligne fautive.`,
            code: `def moyenne(notes):
    if len(notes) == 0:
        return ValueError("liste vide")
    return sum(notes) / len(notes)

try:
    m = moyenne([])
    print("moyenne :", m)
except ValueError as e:
    print("erreur :", e)`,
            bugLine: 3,
            why: `return ValueError(...) fabrique un objet exception et le renvoie comme une valeur ordinaire. Rien n'est levé : le try réussit et m contient l'objet, affiché comme « liste vide ».`,
            fixes: [
              `        raise ValueError("liste vide")`,
              `        return None`,
              `        print(ValueError("liste vide"))`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `Renvoyer None ne lève rien : le programme afficherait « moyenne : None » et l'appelant ne serait pas prévenu.`,
              2: `print affiche le message mais ne lève rien ; la fonction continue et la ligne 4 divise par zéro (ZeroDivisionError, non attrapée ici).`
            },
            output: `erreur : liste vide`,
            hint: `Quelle est la différence entre renvoyer une exception et la lever ?`,
            explain: `Seul raise interrompt la fonction et déclenche le bloc except de l'appelant. Une exception renvoyée par return n'est qu'une valeur comme une autre.`
          },
          {
            type: 'qcm',
            prompt: `La fonction \`inscrire(age)\` reçoit parfois un âge négatif à cause d'un formulaire mal rempli. Quelle conception est la meilleure ?`,
            choices: [
              `Renvoyer -1 quand l'âge est invalide.`,
              `Lever ValueError avec un message clair ; l'appelant décide quoi faire.`,
              `Afficher un message avec print et continuer l'inscription.`,
              `Entourer tout le corps de la fonction par try/except: pass.`
            ],
            answer: 1,
            why: {
              0: `-1 est une valeur « magique » : si l'appelant oublie de la tester, l'erreur se propage silencieusement (un âge de -1 enregistré en base, par exemple).`,
              2: `print prévient un humain qui regarde la console, pas le code appelant : l'inscription continue avec une donnée fausse.`,
              3: `except: pass avale toutes les erreurs, y compris tes bugs : c'est le pire choix pour déboguer.`
            },
            hint: `Qui doit être prévenu du problème : l'écran, ou le code qui a appelé la fonction ?`,
            explain: `Lever une exception arrête le traitement au bon endroit et oblige l'appelant à gérer le cas (ou le programme s'arrête avec un message explicite). C'est la façon standard de refuser une donnée invalide en Python.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Écris \`lire_point(texte)\` qui transforme une chaîne comme \`"3,4"\` en tuple d'entiers \`(3, 4)\`. Si le texte n'a pas exactement deux parties séparées par une virgule, ou si une partie n'est pas un entier, la fonction lève \`FormatInvalide\` (et jamais ValueError ou IndexError).`,
          starter: `class FormatInvalide(Exception):
    pass

def lire_point(texte):
    parties = texte.split(",")
    # vérifie le nombre de parties et convertis-les
    return (int(parties[0]), int(parties[1]))
`,
          solution: `class FormatInvalide(Exception):
    pass

def lire_point(texte):
    parties = texte.split(",")
    if len(parties) != 2:
        raise FormatInvalide(f"2 valeurs attendues : {texte!r}")
    try:
        return (int(parties[0]), int(parties[1]))
    except ValueError:
        raise FormatInvalide(f"entiers attendus : {texte!r}")
`,
          tests: [
            { code: `assert lire_point("3,4") == (3, 4)`, label: `lire_point("3,4") renvoie (3, 4)` },
            { code: `assert lire_point(" 10 , -2 ") == (10, -2)`, label: `les espaces autour des nombres sont acceptés` },
            { code: `try:
    lire_point("3;4")
    leve = False
except FormatInvalide:
    leve = True
assert leve`, label: `"3;4" lève FormatInvalide` },
            { code: `try:
    lire_point("a,4")
    leve = False
except FormatInvalide:
    leve = True
assert leve`, label: `"a,4" lève FormatInvalide (pas ValueError)` },
            { code: `try:
    lire_point("1,2,3")
    leve = False
except FormatInvalide:
    leve = True
assert leve`, label: `"1,2,3" lève FormatInvalide` }
          ],
          checks: [ { re: 'raise\\s+FormatInvalide', label: `Lève FormatInvalide avec raise` } ],
          hint: `Deux vérifications : le nombre de parties avec len, puis la conversion dans un try. Dans le except ValueError, lève l'exception de ton application.`,
          explain: `On vérifie d'abord la structure (len(parties) != 2), puis on traduit l'éventuelle ValueError de int() en FormatInvalide. L'appelant n'a ainsi qu'une seule exception à connaître, avec un message qui cite le texte fautif.`
        },
        recap: [
          `raise Type("message") arrête la fonction et signale le problème à l'appelant.`,
          `Lever une exception vaut mieux que renvoyer une valeur magique comme -1.`,
          `class MonErreur(Exception): pass crée une exception propre à ton application.`,
          `except (A, B) as e attrape plusieurs types ; raise seul relance l'exception en cours.`
        ],
        check: {
          type: 'order',
          prompt: `Remets dans l'ordre : la fonction refuse une note hors de 0 à 20, puis le programme l'appelle avec 25 et affiche l'erreur.`,
          lines: [
            `def verifier_note(note):`,
            `    if not 0 <= note <= 20:`,
            `        raise ValueError(f"note hors limites : {note}")`,
            `    return note`,
            `try:`,
            `    verifier_note(25)`,
            `except ValueError as e:`,
            `    print("Erreur :", e)`
          ],
          output: `Erreur : note hors limites : 25`,
          hint: `La fonction vérifie d'abord, et ne renvoie la note qu'à la fin. L'appel risqué est dans le try.`,
          explain: `Le raise est dans le if, avant le return : une note invalide n'est jamais renvoyée. Le programme principal place l'appel dans try et affiche le message transmis par l'exception.`
        }
      }
    ]
  };

  var u13 = {
    id: 'py.u13',
    title: 'Lecture et écriture de fichiers',
    summary: 'Lire et produire des fichiers texte, CSV et JSON, les formats des journaux, des jeux de données et des API.',
    lessons: [
      {
        id: 'py.u13.l1',
        title: 'Fichiers texte avec with open',
        minutes: 7,
        objective: 'Tu sais lire un fichier texte ligne à ligne et écrire ou compléter un fichier avec with open.',
        explain: `\`open(nom, mode)\` ouvre un fichier ; \`with\` garantit sa **fermeture**, même si une exception survient.

- \`"r"\` : lecture (mode par défaut) ; \`"w"\` : écriture, qui **efface** le contenu existant ; \`"a"\` : ajout à la fin.
- \`f.read()\` lit tout d'un coup ; \`for ligne in f:\` lit ligne par ligne sans tout charger en mémoire, ce qui compte pour un gros journal ou un jeu de données.
- Chaque ligne lue garde son \`\\n\` final : \`ligne.strip()\` l'enlève.
- \`f.write(texte)\` n'ajoute **pas** de retour à la ligne : écris \`"\\n"\` toi-même.
- Précise \`encoding="utf-8"\` pour lire et écrire les accents sans surprise.

Un fichier absent lève \`FileNotFoundError\`, que tu sais maintenant attraper.

Dans CodeQuest, les fichiers sont **virtuels** : ils vivent en mémoire le temps de l'exécution. Sur ton ordinateur, le même code lit et écrit de vrais fichiers.`,
        example: {
          code: `with open("journal.txt", "w", encoding="utf-8") as f:
    f.write("démarrage\\n")
    f.write("entraînement terminé\\n")

with open("journal.txt", "a", encoding="utf-8") as f:
    f.write("score : 0.93\\n")

with open("journal.txt", encoding="utf-8") as f:
    for numero, ligne in enumerate(f, start=1):
        print(numero, ligne.strip())`,
          output: `1 démarrage
2 entraînement terminé
3 score : 0.93`,
          notes: [
            { line: 1, text: `"w" crée le fichier, ou l'efface s'il existe déjà. Le fichier est fermé à la sortie du bloc with.` },
            { line: 5, text: `"a" ajoute à la fin sans toucher au contenu existant : idéal pour un journal.` },
            { line: 9, text: `Parcourir f donne une ligne à la fois ; enumerate numérote à partir de 1.` },
            { line: 10, text: `strip() retire le \\n de fin, sinon print afficherait une ligne vide en plus.` }
          ]
        },
        exercises: [
          {
            type: 'order',
            prompt: `Remets dans l'ordre ce programme qui compte les lignes d'erreur du journal \`serveur.log\`.`,
            files: { 'serveur.log': `INFO démarrage
ERROR disque plein
INFO requête /api/users
ERROR délai dépassé
` },
            lines: [
              `nb_erreurs = 0`,
              `with open("serveur.log", encoding="utf-8") as f:`,
              `    for ligne in f:`,
              `        if ligne.startswith("ERROR"):`,
              `            nb_erreurs += 1`,
              `print(nb_erreurs, "erreur(s)")`
            ],
            output: `2 erreur(s)`,
            hint: `Le compteur doit exister avant la lecture, et le résultat ne s'affiche qu'une fois tout le fichier parcouru.`,
            explain: `On initialise le compteur, on ouvre le fichier dans un with, on parcourt les lignes une à une, et on affiche après la boucle (indentation 0), une fois le fichier fermé.`
          },
          {
            type: 'predict',
            prompt: `Qu'affiche ce programme ?`,
            code: `with open("notes.txt", "w") as f:
    f.write("Ada")
    f.write("Linus\\n")
with open("notes.txt", "w") as f:
    f.write("Grace\\n")
with open("notes.txt", "a") as f:
    f.write("Alan\\n")
with open("notes.txt") as f:
    print(f.read())`,
            answer: `Grace
Alan`,
            mistakes: [
              { answer: `AdaLinus
Grace
Alan`, why: `Le deuxième open en mode "w" efface tout le contenu précédent avant d'écrire "Grace".` },
              { answer: `Alan`, why: `Le mode "a" ajoute à la fin : "Grace" est conservé.` }
            ],
            hint: `Suis l'état du fichier après chaque bloc with, en te rappelant ce que fait chaque mode.`,
            explain: `Le premier bloc écrit "AdaLinus", le deuxième l'efface (mode "w") et écrit "Grace", le troisième ajoute "Alan" (mode "a"). La lecture affiche les deux lignes restantes.`
          }
        ],
        challenge: {
          type: 'bug',
          prompt: `Le fichier \`bloques.txt\` contient la liste des comptes bloqués, dont "eve". Ce programme devrait afficher « accès refusé », mais il affiche « bienvenue ». Clique sur la ligne fautive.`,
          files: { 'bloques.txt': `mallory
eve
trudy
` },
          code: `utilisateurs_bloques = []
with open("bloques.txt", encoding="utf-8") as f:
    for ligne in f:
        utilisateurs_bloques.append(ligne)
nom = "eve"
if nom in utilisateurs_bloques:
    print("accès refusé")
else:
    print("bienvenue")`,
          bugLine: 4,
          why: `Chaque ligne lue se termine par "\\n" : la liste contient "eve\\n", pas "eve". Le test in compare des chaînes exactes, donc il échoue.`,
          fixes: [
            `        utilisateurs_bloques.append(ligne.strip())`,
            `        utilisateurs_bloques.append(ligne.upper())`,
            `        utilisateurs_bloques = ligne.strip()`
          ],
          fixAnswer: 0,
          fixWhy: {
            1: `upper() change la casse mais garde le "\\n" : la liste contiendrait "EVE\\n".`,
            2: `Cette ligne remplace la liste par une simple chaîne à chaque tour : il ne reste que "trudy", et "eve" in "trudy" est faux.`
          },
          output: `accès refusé`,
          hint: `Affiche repr(ligne) dans la boucle : qu'y a-t-il à la fin de chaque ligne ?`,
          explain: `strip() enlève le retour à la ligne (et les espaces) de chaque ligne avant de l'ajouter. C'est un réflexe à avoir dès qu'on compare le contenu d'un fichier à une chaîne.`
        },
        recap: [
          `with open(...) as f ferme le fichier automatiquement, même en cas d'erreur.`,
          `"r" lit, "w" efface puis écrit, "a" ajoute à la fin.`,
          `for ligne in f lit ligne par ligne ; strip() retire le \\n final.`,
          `write n'ajoute pas de retour à la ligne : écris "\\n" toi-même.`
        ],
        check: {
          type: 'code',
          prompt: `Écris \`filtrer(source, destination, mot)\` : elle copie dans le fichier \`destination\` les lignes de \`source\` qui contiennent \`mot\`, et renvoie le nombre de lignes copiées. Si \`source\` n'existe pas, elle renvoie 0 sans planter. Un fichier \`avis.txt\` (avis d'utilisateurs sur une appli) est disponible pour tester.`,
          files: { 'avis.txt': `Super appli, rapide
Trop lente au démarrage
Interface claire et rapide
Plante parfois
` },
          starter: `def filtrer(source, destination, mot):
    compte = 0
    # ouvre source en lecture et destination en écriture
    return compte
`,
          solution: `def filtrer(source, destination, mot):
    compte = 0
    try:
        with open(source, encoding="utf-8") as entree:
            with open(destination, "w", encoding="utf-8") as sortie:
                for ligne in entree:
                    if mot in ligne:
                        sortie.write(ligne)
                        compte += 1
    except FileNotFoundError:
        return 0
    return compte
`,
          tests: [
            { code: `assert filtrer("avis.txt", "rapide.txt", "rapide") == 2`, label: `filtrer("avis.txt", "rapide.txt", "rapide") renvoie 2` },
            { code: `filtrer("avis.txt", "rapide2.txt", "rapide")
with open("rapide2.txt", encoding="utf-8") as f:
    assert f.read() == "Super appli, rapide\\nInterface claire et rapide\\n"`, label: `le fichier destination contient exactement les 2 lignes, avec leurs retours à la ligne` },
            { code: `assert filtrer("absent.txt", "x.txt", "a") == 0`, label: `un fichier source absent renvoie 0` }
          ],
          checks: [ { re: 'with\\s+open', label: `Utilise with open` } ],
          hint: `Les lignes lues gardent leur "\\n" : tu peux les écrire telles quelles. Entoure l'ouverture de source d'un try pour FileNotFoundError.`,
          explain: `Deux with imbriqués ouvrent la source en lecture et la destination en écriture. Chaque ligne retenue est écrite telle quelle, avec son retour à la ligne. Le try autour de l'ouverture transforme l'absence du fichier en résultat 0.`
        }
      },
      {
        id: 'py.u13.l2',
        title: 'CSV et JSON',
        minutes: 8,
        objective: 'Tu sais lire un CSV avec csv.DictReader et sauvegarder puis recharger des données en JSON.',
        explain: `Deux formats reviennent partout en data et sur le web.

**CSV** : un tableau en texte, une ligne par enregistrement. \`csv.DictReader(f)\` lit la première ligne comme en-tête et donne chaque ligne sous forme de dictionnaire. Attention : **toutes les valeurs sont des chaînes**, convertis-les (\`float(ligne["score"])\`). Pour écrire : \`csv.writer(f).writerow([...])\`.

**JSON** : le format des API et des fichiers de configuration. Il représente dictionnaires, listes, chaînes, nombres, \`true\`, \`false\` et \`null\`.

- \`json.dumps(objet)\` transforme un objet Python en texte JSON ;
- \`json.loads(texte)\` fait l'inverse.

Pour un fichier : \`f.write(json.dumps(donnees))\`, puis \`json.loads(f.read())\`. Sur ton ordinateur, \`json.dump(donnees, f)\` et \`json.load(f)\` font la même chose en un appel. Ouvre aussi tes CSV avec \`newline=""\`, comme le recommande la documentation du module csv.`,
        example: {
          files: { 'scores.csv': `modele,precision
baseline,0.71
arbre,0.84
reseau,0.91
` },
          code: `import csv
import json

with open("scores.csv", encoding="utf-8") as f:
    lignes = list(csv.DictReader(f))

meilleur = max(lignes, key=lambda l: float(l["precision"]))
print(meilleur["modele"], meilleur["precision"])

with open("resultat.json", "w", encoding="utf-8") as f:
    f.write(json.dumps({"meilleur": meilleur["modele"], "n": len(lignes)}))

with open("resultat.json", encoding="utf-8") as f:
    print(f.read())`,
          output: `reseau 0.91
{"meilleur": "reseau", "n": 3}`,
          notes: [
            { line: 5, text: `Chaque ligne devient un dict : {"modele": "baseline", "precision": "0.71"}. L'en-tête n'est pas une donnée.` },
            { line: 7, text: `float() est indispensable : comparer des chaînes donnerait l'ordre alphabétique, pas numérique.` },
            { line: 11, text: `json.dumps produit du texte : guillemets doubles, et les nombres restent des nombres.` }
          ]
        },
        exercises: [
          {
            type: 'fill',
            prompt: `Complète pour transformer la configuration en texte JSON, puis pour la relire.`,
            code: `import json

config = {"modele": "mini", "epoques": 3, "actif": True}
texte = json.___(config)
print(texte)
copie = json.___(texte)
print(copie["epoques"] + 1)`,
            blanks: [
              { answers: ['dumps'], options: ['dumps', 'loads', 'load'], why: { 'loads': `loads fait l'inverse : il lit du texte JSON et renvoie un objet Python.`, 'load': `load lit depuis un fichier ouvert, et dans le mauvais sens : ici on veut produire du texte.` } },
              { answers: ['loads'], options: ['loads', 'dumps', 'dump'], why: { 'dumps': `dumps sur une chaîne produirait une chaîne JSON entre guillemets ; copie["epoques"] lèverait alors une TypeError.`, 'dump': `dump écrit dans un fichier ; ici on part d'une chaîne pour retrouver un dict.` } }
            ],
            output: `{"modele": "mini", "epoques": 3, "actif": true}
4`,
            hint: `Le s final signifie « string » : dumps va vers une chaîne, loads part d'une chaîne.`,
            explain: `json.dumps convertit le dict en texte (True devient true). json.loads reconstruit un dict à partir de ce texte, avec le nombre 3 de type int : on peut donc calculer 3 + 1.`
          },
          {
            type: 'logic',
            prompt: `Le fichier \`ventes.csv\` contient l'en-tête \`produit,quantite\` puis les lignes \`clavier,3\` et \`souris,5\`. Qu'affiche la dernière ligne du programme ?`,
            files: { 'ventes.csv': `produit,quantite
clavier,3
souris,5
` },
            code: `import csv
with open("ventes.csv", encoding="utf-8") as f:
    lignes = list(csv.DictReader(f))
print(lignes[0]["quantite"] * 2)`,
            answer: '33',
            accept: [`"33"`, `'33'`],
            mistakes: [
              { answer: '6', why: `DictReader renvoie des chaînes : lignes[0]["quantite"] vaut "3", et "3" * 2 répète la chaîne. Il faudrait int(...) pour obtenir 6.` },
              { answer: '10', why: `lignes[0] est la première ligne de données (clavier), pas souris : l'en-tête n'est pas compté comme une ligne.` }
            ],
            hint: `Quel est le type des valeurs fournies par csv.DictReader ?`,
            explain: `lignes[0] est {"produit": "clavier", "quantite": "3"}. Multiplier la chaîne "3" par 2 la répète : "33". C'est un piège classique avec les CSV : on convertit toujours les colonnes numériques.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Le fichier \`evaluations.csv\` contient des phrases annotées avec une catégorie et un score. Écris \`csv_vers_json(source, destination)\` qui calcule la **moyenne des scores par catégorie** (arrondie à 2 décimales), l'écrit en JSON dans \`destination\` et renvoie ce dictionnaire.`,
          files: { 'evaluations.csv': `texte,categorie,score
bonjour,salutation,0.9
merci,politesse,0.8
salut,salutation,0.7
pardon,politesse,0.6
au revoir,salutation,0.8
` },
          starter: `import csv
import json

def csv_vers_json(source, destination):
    sommes = {}
    nombres = {}
    with open(source, encoding="utf-8") as f:
        for ligne in csv.DictReader(f):
            # additionne les scores par catégorie
            pass
    moyennes = {}
    # calcule les moyennes, puis écris-les en JSON dans destination
    return moyennes
`,
          solution: `import csv
import json

def csv_vers_json(source, destination):
    sommes = {}
    nombres = {}
    with open(source, encoding="utf-8") as f:
        for ligne in csv.DictReader(f):
            cat = ligne["categorie"]
            sommes[cat] = sommes.get(cat, 0) + float(ligne["score"])
            nombres[cat] = nombres.get(cat, 0) + 1
    moyennes = {}
    for cat in sommes:
        moyennes[cat] = round(sommes[cat] / nombres[cat], 2)
    with open(destination, "w", encoding="utf-8") as f:
        f.write(json.dumps(moyennes))
    return moyennes
`,
          tests: [
            { code: `assert csv_vers_json("evaluations.csv", "moyennes.json") == {"salutation": 0.8, "politesse": 0.7}`, label: `renvoie {"salutation": 0.8, "politesse": 0.7}` },
            { code: `csv_vers_json("evaluations.csv", "m2.json")
with open("m2.json", encoding="utf-8") as f:
    assert json.loads(f.read()) == {"salutation": 0.8, "politesse": 0.7}`, label: `le fichier JSON écrit contient le même dictionnaire` }
          ],
          hint: `dict.get(cle, 0) évite de tester si la catégorie existe déjà. N'oublie pas float() : le score lu est une chaîne.`,
          explain: `On accumule somme et effectif par catégorie pendant la lecture, puis on divise. json.dumps transforme le dict en texte écrit dans le fichier ; json.loads permet de vérifier qu'on retrouve exactement les mêmes données.`
        },
        recap: [
          `csv.DictReader donne chaque ligne sous forme de dict, avec des valeurs toujours en chaînes.`,
          `Convertis les colonnes numériques avec int() ou float() avant de calculer.`,
          `json.dumps : objet Python vers texte ; json.loads : texte vers objet Python.`,
          `JSON garde les types de base (nombres, booléens, listes, dict) : idéal pour sauvegarder un état.`
        ],
        check: {
          type: 'qcm',
          prompt: `Tu veux sauvegarder l'historique d'entraînement \`{"epoques": [1, 2], "pertes": [0.9, 0.5], "fini": True}\` dans un fichier, pour le recharger plus tard dans un autre script Python. Quelle méthode choisir ?`,
          choices: [
            `f.write(json.dumps(historique)) puis json.loads(f.read()) pour relire.`,
            `f.write(str(historique)) puis eval(f.read()) pour relire.`,
            `Un CSV avec csv.writer, une colonne par clé.`,
            `f.write(historique) directement.`
          ],
          answer: 0,
          why: {
            1: `eval exécute n'importe quel code Python contenu dans le fichier : c'est dangereux si le fichier a été modifié, et ce n'est pas un format lisible par d'autres outils.`,
            2: `Le CSV convient aux tableaux plats ; ici les valeurs sont des listes, et tout serait relu sous forme de chaînes, sans les types.`,
            3: `write n'accepte que des chaînes : passer un dict lève une TypeError.`
          },
          hint: `Cherche le format qui conserve dict, listes, nombres et booléens, sans exécuter de code à la relecture.`,
          explain: `JSON conserve la structure imbriquée et les types de base (le True Python devient true, puis redevient True). dumps et loads font l'aller-retour en toute sécurité, et le fichier reste lisible par n'importe quel langage.`
        }
      }
    ]
  };

  var u14 = {
    id: 'py.u14',
    title: 'Programmation orientée objet',
    summary: 'Regrouper données et comportements dans tes propres types, puis les spécialiser par héritage.',
    lessons: [
      {
        id: 'py.u14.l1',
        title: 'Classes et objets',
        minutes: 8,
        objective: 'Tu sais définir une classe avec __init__, des attributs et des méthodes, et créer plusieurs objets indépendants.',
        explain: `Une **classe** est un plan de construction ; un **objet** (ou instance) est une chose fabriquée avec ce plan. La classe regroupe des données, les **attributs**, et les actions sur ces données, les **méthodes**.

- \`__init__\` s'exécute à la création de l'objet : il initialise ses attributs.
- \`self\` désigne l'objet en cours : \`self.solde\` est le solde de **cet** objet-là.
- Une méthode est une fonction définie dans la classe. On l'appelle avec \`objet.methode()\` et Python passe \`self\` tout seul.
- Un **attribut de classe**, défini hors des méthodes, est partagé par tous les objets.

Tu utilises déjà des objets : une liste a des méthodes comme \`append\`. En PowerShell, \`Get-Process\` renvoie aussi des objets avec propriétés et méthodes ; ici, tu fabriques les tiens.`,
        example: {
          code: `class Compte:
    taux = 0.02

    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self.solde = solde

    def deposer(self, montant):
        self.solde += montant

    def interets(self):
        return round(self.solde * Compte.taux, 2)

a = Compte("Ada", 100)
b = Compte("Linus")
a.deposer(50)
print(a.titulaire, a.solde, b.solde, a.interets())`,
          output: `Ada 150 0 3.0`,
          notes: [
            { line: 2, text: `Attribut de classe : un seul taux, partagé par tous les comptes.` },
            { line: 4, text: `Compte("Ada", 100) appelle __init__ avec self = le nouvel objet.` },
            { line: 9, text: `La méthode modifie l'attribut de l'objet sur lequel on l'appelle : a, pas b.` },
            { line: 16, text: `a.deposer(50) équivaut à Compte.deposer(a, 50).` }
          ]
        },
        exercises: [
          {
            type: 'qcm',
            prompt: `Après ce code, que contient \`c2.mesures\` ?`,
            code: `class Capteur:
    def __init__(self, nom):
        self.nom = nom
        self.mesures = []

    def ajouter(self, valeur):
        self.mesures.append(valeur)

c1 = Capteur("salon")
c2 = Capteur("cuisine")
c1.ajouter(21)
c1.ajouter(22)
c2.ajouter(19)`,
            choices: [`[21, 22, 19]`, `[19]`, `[]`, `Rien : ajouter attend 2 arguments et lève une TypeError.`],
            answer: 1,
            why: {
              0: `Ce serait le cas si mesures était un attribut de classe partagé. Ici, chaque appel à __init__ crée une nouvelle liste propre à l'objet.`,
              2: `c2.ajouter(19) a bien ajouté 19 à la liste de c2.`,
              3: `self est passé automatiquement : c2.ajouter(19) fournit les 2 arguments (self = c2, valeur = 19).`
            },
            hint: `Combien de listes différentes ont été créées, et à quel moment ?`,
            explain: `self.mesures = [] s'exécute à chaque création : c1 et c2 ont chacun leur propre liste. Les ajouts sur c1 ne touchent pas c2.`
          },
          {
            type: 'bug',
            prompt: `Ce code devrait afficher « neo 15 », mais il affiche « neo 0 ». Clique sur la ligne fautive.`,
            code: `class Joueur:
    def __init__(self, pseudo):
        self.pseudo = pseudo
        self.points = 0

    def marquer(self, n):
        points = self.points + n

j = Joueur("neo")
j.marquer(10)
j.marquer(5)
print(j.pseudo, j.points)`,
            bugLine: 7,
            why: `points (sans self.) est une variable locale à la méthode : elle disparaît à la fin de l'appel. L'attribut self.points n'est jamais modifié.`,
            fixes: [
              `        self.points += n`,
              `        points += n`,
              `        return self.points + n`
            ],
            fixAnswer: 0,
            fixWhy: {
              1: `points est une variable locale jamais définie : points += n lève UnboundLocalError.`,
              2: `La méthode renverrait la somme, mais le résultat n'est stocké nulle part : j.points resterait à 0.`
            },
            output: `neo 15`,
            hint: `Quelle différence entre points et self.points dans une méthode ?`,
            explain: `Pour modifier l'état d'un objet, il faut écrire dans un attribut via self. self.points += n met à jour l'objet j, qui garde la valeur entre deux appels.`
          }
        ],
        challenge: {
          type: 'predict',
          prompt: `Qu'affiche ce programme ?`,
          code: `class Robot:
    compteur = 0

    def __init__(self, nom):
        self.nom = nom
        Robot.compteur += 1
        self.numero = Robot.compteur

r1 = Robot("R2")
r2 = Robot("C3")
r1.compteur = 100
print(r1.numero, r2.numero, Robot.compteur, r1.compteur)`,
          answer: `1 2 2 100`,
          mistakes: [
            { answer: `1 2 100 100`, why: `r1.compteur = 100 crée un attribut d'instance propre à r1, qui masque l'attribut de classe pour r1 seulement. Robot.compteur reste à 2.` },
            { answer: `2 2 2 100`, why: `self.numero copie la valeur du compteur au moment de la création : 1 pour r1, puis 2 pour r2.` }
          ],
          hint: `Distingue bien Robot.compteur (sur la classe) et r1.compteur après l'affectation de la ligne 11.`,
          explain: `Chaque création incrémente l'attribut de classe et copie sa valeur dans numero. L'affectation r1.compteur = 100 ne modifie pas la classe : elle ajoute un attribut à r1, consulté en priorité quand on lit r1.compteur.`
        },
        recap: [
          `Une classe décrit des attributs (données) et des méthodes (actions).`,
          `__init__ initialise chaque nouvel objet ; self désigne l'objet en cours.`,
          `Pour modifier l'état d'un objet, écris dans self.attribut, pas dans une variable locale.`,
          `Un attribut de classe est partagé ; un attribut créé avec self est propre à chaque objet.`
        ],
        check: {
          type: 'code',
          prompt: `Complète la classe \`Panier\` d'une boutique en ligne. \`ajouter(nom, prix, quantite=1)\` enregistre le prix de l'article et ajoute la quantité (si l'article est déjà présent, les quantités s'additionnent). \`total()\` renvoie le prix total, arrondi à 2 décimales.`,
          starter: `class Panier:
    def __init__(self):
        self.prix = {}
        self.quantites = {}

    def ajouter(self, nom, prix, quantite=1):
        # enregistre le prix et ajoute la quantité
        pass

    def total(self):
        return 0
`,
          solution: `class Panier:
    def __init__(self):
        self.prix = {}
        self.quantites = {}

    def ajouter(self, nom, prix, quantite=1):
        self.prix[nom] = prix
        self.quantites[nom] = self.quantites.get(nom, 0) + quantite

    def total(self):
        somme = 0
        for nom, q in self.quantites.items():
            somme += self.prix[nom] * q
        return round(somme, 2)
`,
          tests: [
            { code: `p = Panier()
p.ajouter("clavier", 49.9)
assert p.total() == 49.9`, label: `un clavier à 49.9 donne un total de 49.9` },
            { code: `p = Panier()
p.ajouter("câble", 4.5, 2)
p.ajouter("câble", 4.5)
assert p.quantites["câble"] == 3 and p.total() == 13.5`, label: `deux ajouts du même article additionnent les quantités` },
            { code: `p = Panier()
p.ajouter("autocollant", 0.1, 3)
assert p.total() == 0.3`, label: `le total est arrondi à 2 décimales (0.1 × 3 donne 0.3)` },
            { code: `a = Panier()
b = Panier()
a.ajouter("souris", 20)
assert b.total() == 0 and a.total() == 20`, label: `deux paniers sont indépendants` }
          ],
          hint: `self.quantites.get(nom, 0) donne la quantité actuelle, ou 0 si l'article est nouveau.`,
          explain: `Les deux dictionnaires sont créés dans __init__, donc propres à chaque panier. ajouter met à jour l'état via self, et total parcourt les articles pour additionner prix × quantité, puis arrondit pour éviter 0.30000000000000004.`
        }
      },
      {
        id: 'py.u14.l2',
        title: 'Héritage et méthodes spéciales',
        minutes: 8,
        objective: 'Tu sais créer une sous-classe avec super() et définir des méthodes spéciales (__str__, __eq__, __len__…) pour que tes objets s\'utilisent comme des types Python.',
        explain: `**Héritage** : \`class Rapport(Document):\` crée une classe qui reçoit tout ce que fait \`Document\` ; tu ajoutes ou **redéfinis** seulement ce qui change. Dans le \`__init__\` de la sous-classe, \`super().__init__(...)\` appelle celui du parent, sans dupliquer son code.

Les **méthodes spéciales**, entourées de \`__\`, branchent tes objets sur la syntaxe de Python :

- \`__str__\` : texte de \`print(obj)\` et \`str(obj)\` ;
- \`__repr__\` : représentation pour le débogage, utilisée par exemple quand on affiche une liste d'objets ;
- \`__eq__\` : sens de \`==\` (sans elle, deux objets ne sont égaux que s'ils sont le même objet) ;
- \`__lt__\` : sens de \`<\`, ce qui rend \`sorted()\` possible ;
- \`__len__\`, \`__contains__\`, \`__add__\` : \`len(obj)\`, \`x in obj\`, \`a + b\`.

Tes propres types s'utilisent alors aussi naturellement que les listes ou les chaînes.`,
        example: {
          code: `class Document:
    def __init__(self, titre):
        self.titre = titre

    def __str__(self):
        return f"Document « {self.titre} »"

class Rapport(Document):
    def __init__(self, titre, pages):
        super().__init__(titre)
        self.pages = pages

    def __str__(self):
        return super().__str__() + f" ({len(self)} pages)"

    def __len__(self):
        return len(self.pages)

r = Rapport("Bilan IA", ["intro", "résultats", "suite"])
print(r)
print(len(r), isinstance(r, Document))`,
          output: `Document « Bilan IA » (3 pages)
3 True`,
          notes: [
            { line: 8, text: `Rapport hérite de Document : il en reçoit l'attribut titre et la méthode __str__.` },
            { line: 10, text: `super().__init__(titre) laisse le parent initialiser ce qu'il connaît.` },
            { line: 14, text: `On redéfinit __str__ en réutilisant celui du parent, et len(self) appelle __len__.` },
            { line: 21, text: `Un Rapport est aussi un Document : isinstance le confirme.` }
          ]
        },
        exercises: [
          {
            type: 'predict',
            prompt: `Qu'affiche ce programme ?`,
            code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, autre):
        return self.x == autre.x and self.y == autre.y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

a = Point(1, 2)
b = Point(1, 2)
print(a == b, a is b)
print([a, Point(0, 0)])`,
            answer: `True False
[Point(1, 2), Point(0, 0)]`,
            mistakes: [
              { answer: `True True
[Point(1, 2), Point(0, 0)]`, why: `is teste l'identité : a et b sont deux objets distincts, même si __eq__ les déclare égaux.` },
              { answer: `False False
[Point(1, 2), Point(0, 0)]`, why: `Ce serait le cas sans __eq__. Ici, == appelle __eq__, qui compare les coordonnées.` }
            ],
            hint: `== utilise __eq__ ; is vérifie s'il s'agit du même objet en mémoire. Une liste affiche ses éléments avec __repr__.`,
            explain: `a == b appelle a.__eq__(b), qui compare x et y : True. a is b est False car ce sont deux objets créés séparément. Pour afficher la liste, Python utilise __repr__ de chaque élément.`
          },
          {
            type: 'order',
            prompt: `Remets dans l'ordre : \`Velo\` hérite de \`Vehicule\` et fixe le nombre de roues à 2 grâce au constructeur du parent.`,
            lines: [
              `class Vehicule:`,
              `    def __init__(self, roues):`,
              `        self.roues = roues`,
              `class Velo(Vehicule):`,
              `    def __init__(self):`,
              `        super().__init__(2)`,
              `v = Velo()`,
              `print(v.roues)`
            ],
            output: `2`,
            hint: `La classe parente doit être définie avant la sous-classe qui la cite entre parenthèses.`,
            explain: `Vehicule est définie en premier, puis Velo(Vehicule) dont le __init__ sans paramètre délègue au parent avec super().__init__(2). L'objet v a donc l'attribut roues créé par le parent.`
          }
        ],
        challenge: {
          type: 'code',
          prompt: `Complète la classe \`Vecteur\` (vecteur 2D, courant en jeu vidéo ou en IA) : \`__add__\` renvoie un **nouveau** Vecteur somme, \`__eq__\` compare les coordonnées, \`__str__\` renvoie \`"(x, y)"\`. Puis écris la sous-classe \`Vitesse(Vecteur)\` dont le \`__str__\` ajoute \`" m/s"\` en réutilisant celui du parent avec \`super()\`.`,
          starter: `class Vecteur:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # __add__, __eq__ et __str__ ici


class Vitesse(Vecteur):
    pass
`,
          solution: `class Vecteur:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, autre):
        return Vecteur(self.x + autre.x, self.y + autre.y)

    def __eq__(self, autre):
        return self.x == autre.x and self.y == autre.y

    def __str__(self):
        return f"({self.x}, {self.y})"


class Vitesse(Vecteur):
    def __str__(self):
        return super().__str__() + " m/s"
`,
          tests: [
            { code: `assert Vecteur(1, 2) + Vecteur(3, 4) == Vecteur(4, 6)`, label: `Vecteur(1, 2) + Vecteur(3, 4) == Vecteur(4, 6)` },
            { code: `assert str(Vecteur(1, -2)) == "(1, -2)"`, label: `str(Vecteur(1, -2)) vaut "(1, -2)"` },
            { code: `v = Vecteur(1, 1)
w = v + Vecteur(2, 2)
assert v == Vecteur(1, 1) and w == Vecteur(3, 3)`, label: `l'addition ne modifie pas le premier vecteur` },
            { code: `assert str(Vitesse(3, 0)) == "(3, 0) m/s"`, label: `str(Vitesse(3, 0)) vaut "(3, 0) m/s"` },
            { code: `assert isinstance(Vitesse(0, 0), Vecteur)`, label: `une Vitesse est un Vecteur` }
          ],
          checks: [ { re: 'super\\(\\)', label: `Vitesse réutilise le __str__ du parent avec super()` } ],
          hint: `__add__ reçoit self et autre, et doit faire return Vecteur(...) au lieu de modifier self.`,
          explain: `__add__ crée un nouvel objet, comme 1 + 2 ne modifie ni 1 ni 2. __eq__ définit l'égalité par les coordonnées. Vitesse n'a besoin de redéfinir que __str__ : tout le reste (constructeur, +, ==) est hérité.`
        },
        recap: [
          `class Enfant(Parent): hérite de tout ; on redéfinit seulement ce qui change.`,
          `super().__init__(...) réutilise le constructeur du parent.`,
          `__str__ et __repr__ contrôlent l'affichage ; __eq__ et __lt__ les comparaisons.`,
          `__len__, __contains__ et __add__ rendent possibles len(obj), x in obj et a + b.`
        ],
        check: {
          type: 'fill',
          prompt: `Complète pour que \`len(p)\` et \`"Nuit" in p\` fonctionnent, et pour que \`PlaylistPartagee\` réutilise le constructeur de \`Playlist\`.`,
          code: `class Playlist:
    def __init__(self, titres):
        self.titres = titres

    def ___(self):
        return len(self.titres)

    def ___(self, titre):
        return titre in self.titres

class PlaylistPartagee(Playlist):
    def __init__(self, titres, auteur):
        ___.__init__(titres)
        self.auteur = auteur

p = PlaylistPartagee(["Intro", "Nuit", "Aube"], "Ada")
print(len(p), "Nuit" in p, p.auteur)`,
          blanks: [
            { answers: ['__len__'], options: ['__len__', 'len', '__size__', '__count__'], why: { 'len': `Une méthode nommée len ne serait pas appelée par len(p) : Python cherche __len__.`, '__size__': `__size__ n'est pas une méthode spéciale de Python.`, '__count__': `__count__ n'est pas une méthode spéciale de Python.` } },
            { answers: ['__contains__'], options: ['__contains__', '__in__', 'contains', '__has__'], why: { '__in__': `Le mot-clé in appelle __contains__, pas __in__ (qui n'existe pas).`, 'contains': `Sans les doubles tirets bas, c'est une méthode ordinaire que in n'utilise pas.`, '__has__': `__has__ n'est pas une méthode spéciale de Python.` } },
            { answers: ['super()'], options: ['super()', 'Playlist', 'self', 'super'], why: { 'Playlist': `Playlist.__init__(titres) appelle la méthode sans objet : il manque self, d'où une TypeError.`, 'self': `self.__init__ rappelle le __init__ de PlaylistPartagee avec un seul argument : TypeError.`, 'super': `super est une fonction : il faut l'appeler avec des parenthèses.` } }
          ],
          output: `3 True Ada`,
          hint: `Les méthodes spéciales portent le nom de l'opération entouré de doubles tirets bas ; pour in, pense au verbe anglais « contenir ».`,
          explain: `len(p) appelle p.__len__() et "Nuit" in p appelle p.__contains__("Nuit"). super().__init__(titres) exécute le constructeur de Playlist sur l'objet en cours, qui reçoit ainsi son attribut titres.`
        }
      }
    ]
  };

  CQ.addChapter('py', {
    id: 'py.c4',
    title: 'Code robuste',
    units: [u12, u13, u14]
  });
})();
