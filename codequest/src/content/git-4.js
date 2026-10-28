// Parcours Git et outils (4/4) : chapitre 4 « Bonnes pratiques ».
CQ.addChapter('git', {
  id: 'git.c4',
  title: 'Bonnes pratiques',
  units: [
    {
      id: 'git.u10',
      title: 'Tests et débogage',
      summary: 'Lancer des tests, lire un code de sortie et une erreur, retrouver le commit qui a cassé quelque chose.',
      lessons: [
        {
          id: 'git.u10.l1',
          title: 'Tester, lire une erreur, trouver le coupable',
          minutes: 8,
          objective: 'Tu sais lancer des tests et lire leur code de sortie, interpréter un message d\'erreur, et retrouver avec git bisect le commit qui a introduit un bug.',
          explain: `Un **test automatisé** vérifie qu'un morceau de code donne le résultat attendu. On lance toute la suite d'un coup : \`pytest\` en Python, \`npm test\` en JavaScript. Chaque commande se termine par un **code de sortie** : 0 = succès, autre chose = échec. En Bash, il se lit dans \`$?\` ; en PowerShell, dans \`$LASTEXITCODE\` pour un programme externe (\`$?\` n'y vaut que True ou False). Les outils d'intégration continue, comme GitHub Actions, se fient à ce code.

Une trace d'erreur Python (traceback) se lit **de bas en haut** : la dernière ligne donne le type et le message (\`ZeroDivisionError: division by zero\`), celle du dessus le fichier et la ligne où l'erreur s'est produite ; plus haut, le chemin des appels qui y a mené.

Déboguer, c'est reproduire le problème, l'isoler, puis tester une hypothèse à la fois.

**git bisect** retrouve le commit fautif par dichotomie : \`git bisect start\`, \`git bisect bad\` (la version actuelle est cassée), \`git bisect good v1.0\` (celle-ci marchait). Git propose un commit au milieu ; tu testes et réponds \`good\` ou \`bad\`, et ainsi de suite. \`git bisect reset\` termine, et \`git bisect run commande\` automatise tout.

**À essayer** : lance une commande qui échoue (\`ls dossier-inexistant\`), puis \`echo $?\`.`,
          example: {
            code: `mkdir tests-demo && cd tests-demo
cat > test_prix.py <<'FIN'
def ttc(prix):
    return round(prix * 1.2, 2)

assert ttc(10) == 12.0
assert ttc(0) == 0
print("2 tests réussis")
FIN
python3 test_prix.py                  # sous Windows : python test_prix.py
echo "code de sortie : $?"            # PowerShell : $LASTEXITCODE`,
            output: `2 tests réussis
code de sortie : 0`,
            notes: [
              { line: 5, text: 'assert vérifie une condition : si elle est fausse, Python s\'arrête avec une AssertionError. C\'est le principe de base de pytest.' },
              { line: 9, text: 'Selon l\'installation, la commande s\'appelle python3 (Linux, WSL) ou python (Windows).' },
              { line: 10, text: '$? contient le code de sortie de la commande précédente : 0, tous les tests sont passés.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Ton script d\'entraînement plante avec cette trace. Où est l\'erreur, et quelle est sa cause la plus probable ?',
              lang: 'text',
              code: `Traceback (most recent call last):
  File "train.py", line 12, in <module>
    score = evaluer(modele, donnees_test)
  File "eval.py", line 5, in evaluer
    return correct / total
ZeroDivisionError: division by zero`,
              choices: [
                'Dans eval.py, ligne 5 : total vaut 0, sans doute parce que le jeu de test est vide',
                'Dans train.py, ligne 12 : c\'est la première ligne citée',
                'Python ne sait pas diviser deux variables',
                'Dans eval.py, ligne 1 : la fonction est mal déclarée'
              ],
              answer: 0,
              why: {
                1: 'Le haut de la trace montre le point de départ des appels. L\'erreur s\'est produite tout en bas, dans eval.py.',
                2: 'La division marche, sauf par zéro : le message ZeroDivisionError dit exactement ce qui s\'est passé.',
                3: 'La trace ne mentionne pas la ligne 1. Si la déclaration était fausse, ce serait une SyntaxError au lancement.'
              },
              hint: 'Lis la trace de bas en haut : type de l\'erreur, puis ligne qui l\'a provoquée.',
              explain: 'Dernière ligne : division par zéro. Juste au-dessus : eval.py, ligne 5, `correct / total`. Donc total vaut 0 ; en remontant, on voit que evaluer a reçu donnees_test, probablement vide. Il reste à vérifier cette hypothèse.'
            },
            {
              type: 'predict',
              prompt: 'Qu\'affiche ce script ? (La ligne 3 masque le message d\'erreur.)',
              code: `mkdir t && cd t
echo 'assert 2 + 2 == 5, "calcul faux"' > test_calcul.py
python3 test_calcul.py 2> /dev/null
echo "code : $?"`,
              answer: 'code : 1',
              mistakes: [
                { answer: 'code : 0', why: 'L\'assertion est fausse : Python s\'arrête sur une AssertionError et renvoie un code non nul.' },
                { answer: 'AssertionError: calcul faux\ncode : 1', why: '`2> /dev/null` envoie les messages d\'erreur nulle part : seul le echo s\'affiche.' }
              ],
              hint: 'L\'assertion est-elle vraie ? Que renvoie Python quand un programme s\'arrête sur une erreur ?',
              explain: '2 + 2 ne vaut pas 5 : l\'assert échoue, Python affiche l\'erreur (masquée ici) et se termine avec le code 1. Un outil d\'intégration continue marquerait l\'étape en rouge.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Le tag v1.0 fonctionnait ; la version actuelle, 100 commits plus tard, est cassée. Avec git bisect, combien de tests faudra-t-il **au maximum** pour trouver le premier commit fautif ?',
            code: `git bisect start
git bisect bad
git bisect good v1.0`,
            answer: '7',
            accept: ['sept'],
            mistakes: [
              { answer: '50', why: 'Ce serait le cas en testant les commits un par un depuis le milieu. Bisect coupe l\'intervalle en deux à chaque test.' },
              { answer: '6', why: '6 tests départagent au plus 64 commits (2 puissance 6). Il en faut un de plus pour 100.' },
              { answer: '100', why: 'C\'est la recherche commit par commit, dans le pire cas. Bisect divise le travail par deux à chaque étape.' }
            ],
            hint: 'Chaque test divise par deux le nombre de commits suspects. Combien de divisions pour passer de 100 à 1 ?',
            explain: '100, 50, 25, 13, 7, 4, 2, 1 : 7 tests suffisent, car 2 puissance 7 = 128 ≥ 100. Même pour 1 000 commits, 10 tests suffisent : c\'est toute la force de la dichotomie.'
          },
          recap: [
            'pytest ou npm test lancent les tests ; le code de sortie vaut 0 si tout passe.',
            '`$?` en Bash, `$LASTEXITCODE` en PowerShell pour un programme externe.',
            'Une trace Python se lit de bas en haut : type et message, puis fichier et ligne.',
            'git bisect : start, bad, good, puis good ou bad à chaque étape, et reset ; `git bisect run` automatise.'
          ],
          check: {
            type: 'fill',
            prompt: 'Le script crée 8 commits de réglage (seuil = 0.1 à 0.8). Le test passe tant que le seuil vaut au plus 0.5. Complète les commandes de bisect pour que le script affiche le premier commit fautif.',
            code: `mkdir bis && cd bis && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
for v in 1 2 3 4 5 6 7 8; do echo "seuil = 0.$v" > config.py && git add . && git commit -q -m "Réglage $v"; done
git bisect ___ > /dev/null
git bisect ___ > /dev/null                 # la version actuelle est cassée
git bisect good HEAD~7 > /dev/null         # le premier réglage marchait
git bisect run grep -q "seuil = 0.[1-5]" config.py > /dev/null
git log -1 --format=%s refs/bisect/bad     # le premier commit fautif
git bisect ___ > /dev/null                 # termine et revient sur main`,
            blanks: [
              {
                answers: ['start'],
                options: ['start', 'init', 'begin', 'run'],
                why: {
                  init: 'git bisect init n\'existe pas.',
                  begin: 'git bisect begin n\'existe pas.',
                  run: 'run lance la recherche automatique, mais il faut d\'abord démarrer et donner les bornes.'
                }
              },
              {
                answers: ['bad'],
                options: ['bad', 'good', 'skip', 'fail'],
                why: {
                  good: 'La version actuelle est cassée : c\'est la borne « bad ».',
                  skip: 'skip sert à sauter un commit impossible à tester.',
                  fail: 'Le mot attendu par bisect est bad.'
                }
              },
              {
                answers: ['reset'],
                options: ['reset', 'stop', 'end', 'good'],
                why: {
                  stop: 'git bisect stop n\'existe pas.',
                  end: 'git bisect end n\'existe pas.',
                  good: 'good répondrait à une étape ; la recherche est déjà terminée.'
                }
              }
            ],
            output: 'Réglage 6',
            hint: 'Démarrer, marquer la version actuelle comme cassée, et terminer à la fin.',
            explain: 'start ouvre la recherche, bad et good posent les bornes, run teste automatiquement (grep renvoie 0 si le seuil va de 0.1 à 0.5). Bisect désigne « Réglage 6 », le premier commit où le test échoue, puis reset ramène sur main.'
          }
        }
      ]
    },
    {
      id: 'git.u11',
      title: 'Organisation d\'un projet',
      summary: 'Ranger un dépôt, choisir ce que Git doit ignorer et rendre les dépendances reproductibles.',
      lessons: [
        {
          id: 'git.u11.l1',
          title: 'Arborescence, .gitignore et dépendances',
          minutes: 8,
          objective: 'Tu sais organiser un dépôt (arborescence, .gitignore) et installer ses dépendances de façon reproductible.',
          explain: `Une arborescence claire aide tout le monde, toi compris dans six mois. Pour un projet Python :

- à la racine : \`README.md\`, \`.gitignore\` et \`requirements.txt\` (les dépendances) ;
- \`src/\` pour le code, \`tests/\` pour les tests, \`data/\` pour les données, \`notebooks/\` pour les explorations.

En JavaScript, \`package.json\` déclare les dépendances et \`package-lock.json\` fixe leurs versions exactes : on commite les deux, mais **jamais** le dossier \`node_modules/\`.

Le fichier \`.gitignore\` liste ce que Git doit ignorer : \`*.log\` (un motif), \`data/\` (un dossier entier), \`!data/exemple.csv\` (une exception), \`#\` pour un commentaire. Il ne concerne que les fichiers **non suivis** : un fichier déjà commité doit d'abord être retiré avec \`git rm --cached\`. Une exception ne marche pas si son dossier parent est ignoré : écris \`data/*\` plutôt que \`data/\`.

Dépendances Python : un environnement virtuel isole les bibliothèques du projet. \`python -m venv .venv\`, puis activation (\`source .venv/bin/activate\` en Bash, \`.venv\\Scripts\\Activate.ps1\` en PowerShell), puis \`pip install -r requirements.txt\`. \`pip freeze > requirements.txt\` fige les versions installées.

**À essayer** : \`git check-ignore -v fichier\` indique quelle règle du .gitignore ignore ce fichier.`,
          example: {
            code: `mkdir -p projet-ia/src projet-ia/tests projet-ia/data && cd projet-ia
git init -q -b main
printf '.venv/\\n__pycache__/\\n*.log\\ndata/*\\n!data/exemple.csv\\n' > .gitignore
touch src/modele.py tests/test_modele.py train.log data/gros.csv data/exemple.csv
git status --short --untracked-files=all`,
            output: `?? .gitignore
?? data/exemple.csv
?? src/modele.py
?? tests/test_modele.py`,
            notes: [
              { line: 3, text: 'Le .gitignore ignore l\'environnement virtuel, les fichiers compilés de Python, les journaux et les données, sauf un petit exemple.' },
              { line: 4, text: 'On crée des fichiers de chaque sorte pour tester les règles.' },
              { line: 5, text: 'train.log et data/gros.csv n\'apparaissent pas : ils sont ignorés. --untracked-files=all détaille le contenu des dossiers.' }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: 'Complète ce `.gitignore` d\'un projet Python.',
              lang: 'text',
              code: `# Environnement virtuel Python
___
# Tous les fichiers journaux
___
# Secrets locaux
.env`,
              blanks: [
                {
                  answers: ['.venv/', '.venv', '/.venv/', '/.venv'],
                  why: {
                    'venv/': 'Le dossier créé par `python -m venv .venv` s\'appelle .venv, avec un point.',
                    '.venv/*.py': 'Il faut ignorer tout le dossier, pas seulement ses fichiers .py.'
                  }
                },
                {
                  answers: ['*.log'],
                  why: {
                    '.log': 'Sans étoile, seul un fichier nommé exactement « .log » serait ignoré.',
                    'log': 'Ce motif ignore un fichier ou dossier nommé « log », pas les fichiers qui se terminent par .log.'
                  }
                }
              ],
              hint: 'Un nom de dossier (celui créé par python -m venv), puis un motif avec une étoile.',
              explain: '`.venv/` ignore tout l\'environnement virtuel, qui se recrée avec `pip install -r requirements.txt` ; `*.log` ignore tous les fichiers dont le nom se termine par .log, dans tous les dossiers.'
            },
            {
              type: 'qcm',
              prompt: 'Pourquoi ne pas commiter `node_modules/` ou `.venv/` ?',
              choices: [
                'Ils se recréent à partir de package.json ou requirements.txt, sont très lourds et dépendent de la machine (Windows, Linux)',
                'Git refuse les dossiers dont le nom commence par un point ou contient un tiret bas',
                'Ils contiennent forcément des mots de passe',
                'GitHub supprime automatiquement ces dossiers'
              ],
              answer: 0,
              why: {
                1: 'Git accepte ces noms sans problème : c\'est justement pour cela qu\'il faut les ignorer explicitement.',
                2: 'Ils contiennent des bibliothèques, pas des secrets. Le vrai problème est leur poids et leur dépendance à la machine.',
                3: 'GitHub ne supprime rien : il stockerait ces milliers de fichiers inutiles.'
              },
              hint: 'Que contiennent ces dossiers, et peut-on les reconstruire ?',
              explain: 'Ce sont des dossiers générés : seule la liste des dépendances (avec leurs versions) se commite. Chacun recrée ensuite son environnement avec `npm install` ou `pip install -r requirements.txt`, adapté à sa machine.'
            }
          ],
          challenge: {
            type: 'bug',
            prompt: 'Ce script doit ignorer le dossier `data/` **sauf** `data/exemple.csv`, qui doit être suivi par Git. Or exemple.csv n\'apparaît pas dans git status. Clique sur la ligne fautive.',
            code: `mkdir -p proj/data && cd proj && git init -q -b main
touch data/gros.csv data/exemple.csv
printf 'data/\\n!data/exemple.csv\\n' > .gitignore
git status --short --untracked-files=all`,
            bugLine: 3,
            why: '`data/` ignore le dossier lui-même. Git n\'entre alors plus dans data/, et l\'exception `!data/exemple.csv` ne peut jamais s\'appliquer : on ne peut pas réinclure un fichier dont le dossier parent est ignoré.',
            fixes: [
              "printf 'data/*\\n!data/exemple.csv\\n' > .gitignore",
              "printf '!data/exemple.csv\\ndata/\\n' > .gitignore",
              "printf 'data/\\ndata/exemple.csv\\n' > .gitignore",
              "printf 'data\\n!exemple.csv\\n' > .gitignore"
            ],
            fixAnswer: 0,
            fixWhy: {
              1: 'Inverser l\'ordre ne change rien : le dossier data/ reste ignoré, et la dernière règle qui correspond l\'emporte de toute façon.',
              2: 'Sans le point d\'exclamation, la seconde ligne ignore aussi exemple.csv au lieu de l\'autoriser.',
              3: '`data` ignore encore le dossier entier, et `!exemple.csv` ne peut pas traverser un dossier ignoré.'
            },
            output: `?? .gitignore
?? data/exemple.csv`,
            hint: 'Faut-il ignorer le dossier lui-même, ou seulement ce qu\'il contient ?',
            explain: '`data/*` ignore le contenu du dossier, mais pas le dossier : Git y entre encore et peut appliquer l\'exception. `git check-ignore -v data/exemple.csv` aide à comprendre ce genre de cas.'
          },
          recap: [
            'Racine : README.md, .gitignore, liste des dépendances ; puis src/, tests/, data/.',
            '.gitignore : motifs (`*.log`), dossiers (`data/`), exceptions (`!fichier`), seulement pour les fichiers non suivis.',
            'Pour une exception dans un dossier, ignore son contenu (`data/*`), pas le dossier.',
            'venv + requirements.txt (Python), package.json + package-lock.json (JS) ; jamais .venv/ ni node_modules/ dans Git.'
          ],
          check: {
            type: 'order',
            prompt: 'Tu récupères le projet Python d\'une collègue pour lancer ses tests. Remets les commandes dans l\'ordre (sous PowerShell, la 4e ligne serait `.venv\\Scripts\\Activate.ps1`).',
            lines: [
              'git clone https://github.com/lea/projet-ia.git',
              'cd projet-ia',
              'python -m venv .venv',
              'source .venv/bin/activate',
              'pip install -r requirements.txt',
              'pytest'
            ],
            hint: 'Récupérer, entrer, créer l\'environnement, l\'activer, le remplir, puis tester.',
            explain: 'L\'environnement virtuel doit exister avant d\'être activé, et être activé avant l\'installation : sinon pip installe les bibliothèques pour tout le système. Les tests ne passent qu\'une fois les dépendances présentes.'
          }
        }
      ]
    },
    {
      id: 'git.u12',
      title: 'Bonnes pratiques de développement',
      summary: 'Des commits lisibles, des revues utiles, et des secrets qui ne quittent jamais ta machine.',
      lessons: [
        {
          id: 'git.u12.l1',
          title: 'Commits, revues et secrets',
          minutes: 8,
          objective: 'Tu sais découper ton travail en petits commits bien nommés, préparer une revue de code et protéger les secrets.',
          explain: `Quelques habitudes font la différence dans une équipe :

- **petits commits** : un changement logique par commit, plus facile à relire, à annuler (\`git revert\` crée un commit inverse) et à retrouver avec bisect. \`git add -p\` permet de choisir, morceau par morceau, ce qui part dans le commit ;
- **messages clairs** : une première ligne courte (environ 50 caractères), à l'impératif, qui dit ce que fait le commit ; si besoin, une ligne vide puis le pourquoi. « fix » ou « modifs » n'aident personne ;
- **revue de code** : une PR petite et bien décrite, relue d'abord par son auteur (\`git diff --staged\`) ; côté relecteur, des remarques précises et bienveillantes, des questions plutôt que des ordres.

**Secrets** (mots de passe, clés d'API, jetons, chaînes de connexion) : **jamais dans Git**. Ils vont dans des variables d'environnement, un fichier \`.env\` ignoré par Git, ou un coffre (Azure Key Vault, ou le coffre de ta solution PAM). Un secret poussé est **compromis** : le supprimer dans un nouveau commit ne suffit pas, il reste dans l'historique et dans tous les clones. Il faut le révoquer et le remplacer immédiatement. Le secret scanning de GitHub et des outils comme gitleaks détectent ces fuites.

**À essayer** : avant ton prochain commit, lance \`git add -p\` et réponds y ou n pour chaque morceau.`,
          example: {
            code: `mkdir propre && cd propre && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo ".env" > .gitignore                          # d'abord protéger
echo "API_KEY=sk-test-123" > .env                 # le secret reste local
echo 'import os; cle = os.environ["API_KEY"]' > client.py
git add . && git commit -q -m "Ajoute le client de l'API météo"
git ls-files                                      # fichiers suivis par Git`,
            output: `.gitignore
client.py`,
            notes: [
              { line: 3, text: 'Le .gitignore est créé avant le secret : aucun git add . ne pourra l\'embarquer.' },
              { line: 5, text: 'Le code lit la clé dans l\'environnement, sans jamais l\'écrire en dur.' },
              { line: 7, text: 'git ls-files le confirme : .env n\'est pas suivi, il ne partira jamais sur GitHub.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Quel message de commit est le meilleur ?',
              choices: [
                'Corrige la division par zéro quand le jeu de test est vide',
                'fix',
                'modifs du 28/10',
                'J\'ai changé plein de trucs dans eval.py et train.py et aussi le README'
              ],
              answer: 0,
              why: {
                1: '« fix » ne dit ni quoi, ni où : dans six mois, impossible de savoir ce que ce commit corrige.',
                2: 'La date est déjà enregistrée dans le commit ; le message doit dire ce qui change.',
                3: 'Plusieurs sujets dans un commit, un message long et vague : il fallait plutôt plusieurs petits commits, chacun avec un titre précis.'
              },
              hint: 'Un bon message permet de comprendre le commit sans ouvrir le code.',
              explain: 'Le premier message est court, à l\'impératif, et dit précisément ce que fait le commit. Dans git log --oneline, il se suffit à lui-même.'
            },
            {
              type: 'bug',
              prompt: 'Ce script ne doit commiter que `app.py`, avec un `.gitignore` qui protège `.env`. Or `.env` (et son mot de passe) se retrouve dans le commit. Clique sur la ligne fautive.',
              code: `mkdir app && cd app && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "DB_PASSWORD=motdepasse" > .env
echo "print('app')" > app.py
git add .
git commit -q -m "Initialise le projet"
git ls-files`,
              bugLine: 5,
              why: '`git add .` ajoute tout ce qui n\'est pas ignoré. Sans .gitignore, .env est ajouté comme n\'importe quel fichier, puis commité.',
              fixes: ['echo ".env" > .gitignore && git add .', 'git add app.py .env', 'git add -A', 'git add app.py'],
              fixAnswer: 0,
              fixWhy: {
                1: 'Nommer explicitement .env l\'ajoute à coup sûr.',
                2: '-A ajoute tout, comme `git add .` : même fuite.',
                3: 'Cette fois .env n\'est pas commité, mais rien ne le protège : le prochain `git add .` l\'embarquera. Et le .gitignore demandé manque.'
              },
              output: `.gitignore
app.py`,
              hint: 'Qu\'est-ce qui empêche durablement git add . de prendre un fichier ?',
              explain: 'Avec .env dans le .gitignore, `git add .` ne le voit plus : seuls .gitignore et app.py sont commités. Crée le .gitignore dès le début du projet, avant le premier secret.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Une branche compte 5 commits. Une clé d\'API a été ajoutée par erreur dans le commit 3, et les commits 4 et 5 l\'ont gardée. Tu supprimes la clé du fichier et fais un 6e commit. Combien de commits de la branche **contiennent encore la clé** ?',
            code: 'git log --oneline   # 6 commits, du plus récent au plus ancien',
            answer: '3',
            accept: ['trois'],
            mistakes: [
              { answer: '0', why: 'Le commit 6 retire la clé de la version actuelle, mais les commits 3, 4 et 5 restent intacts dans l\'historique : n\'importe qui peut les afficher avec git show.' },
              { answer: '1', why: 'Chaque commit est un instantané complet : 3, 4 et 5 contiennent tous le fichier avec la clé.' }
            ],
            hint: 'Un nouveau commit modifie-t-il les commits précédents ?',
            explain: 'Les commits 3, 4 et 5 contiennent la clé, et y resteront. Réécrire l\'historique est possible, mais les clones et les copies déjà récupérés la gardent : seule la révocation de la clé protège vraiment.'
          },
          recap: [
            'Un changement logique par commit ; `git add -p` pour choisir les morceaux.',
            'Message : titre court à l\'impératif, puis le pourquoi si besoin.',
            'Revue : PR petite et décrite, relue d\'abord par son auteur ; remarques précises et bienveillantes.',
            'Secrets hors de Git (.env ignoré, variables d\'environnement, coffre) ; un secret poussé se révoque immédiatement.'
          ],
          check: {
            type: 'qcm',
            prompt: 'Tu découvres qu\'un collègue a commité et poussé hier le mot de passe de la base de données de production. Quelle est la **première** chose à faire ?',
            choices: [
              'Faire changer ce mot de passe tout de suite (le révoquer), puis nettoyer le dépôt et prévenir l\'équipe',
              'Supprimer la ligne du fichier et faire un nouveau commit',
              'Passer le dépôt en privé sur GitHub',
              'Faire git commit --amend pour réécrire le dernier commit'
            ],
            answer: 0,
            why: {
              1: 'Le mot de passe reste dans l\'historique et dans tous les clones : quiconque a récupéré le dépôt peut encore le lire.',
              2: 'Le secret a déjà pu être copié, par des personnes ou par des robots qui parcourent GitHub en continu. Le rendre privé ne le rend pas secret à nouveau.',
              3: 'Le commit fautif a été poussé hier et n\'est peut-être plus le dernier ; et réécrire l\'historique ne retire pas le secret des copies existantes.'
            },
            hint: 'À partir du moment où le secret est sorti, que faut-il considérer ?',
            explain: 'Un secret poussé est compromis : on le révoque d\'abord, comme un badge perdu. Ensuite seulement, on nettoie l\'historique si nécessaire, on ajoute un .gitignore et un outil de détection pour éviter la récidive.'
          }
        }
      ]
    }
  ]
});
