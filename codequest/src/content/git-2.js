// Parcours Git et outils (2/4) : chapitre 2 « Git en local ».
// Les scripts commencent par créer un dossier de travail, un dépôt et une identité locale (Ada) :
// tu peux les copier tels quels dans Git Bash pour les essayer.
CQ.addChapter('git', {
  id: 'git.c2',
  title: 'Git en local',
  units: [
    {
      id: 'git.u3',
      title: 'Git et contrôle de version',
      summary: 'Comprendre ce que fait Git, créer un dépôt et lire l\'état des fichiers.',
      lessons: [
        {
          id: 'git.u3.l1',
          title: 'Ton premier dépôt',
          minutes: 7,
          objective: 'Tu sais expliquer ce que fait Git, créer un dépôt et suivre l\'état des fichiers entre dossier de travail, index et dépôt.',
          explain: `Git enregistre l'historique d'un dossier sous forme d'**instantanés**, les commits. Tu peux revenir à une version précédente, comparer, savoir qui a changé quoi et pourquoi, et travailler à plusieurs sans t'écraser. Contrairement à OneDrive, rien n'est automatique : tu choisis quand enregistrer, quoi enregistrer, et tu expliques pourquoi dans un message.

Git est un logiciel installé sur ta machine ; **GitHub** est un service en ligne qui héberge des dépôts Git (unité 8). Sous Windows, installe Git for Windows (il fournit Git Bash) ou utilise Git dans WSL. Donne ton identité une fois pour toutes : \`git config --global user.name "Ada Lovelace"\` et \`git config --global user.email "ada@example.com"\`.

\`git init\` transforme le dossier courant en dépôt en créant un dossier caché \`.git\` : tout l'historique y vit. Un fichier passe par trois zones : le **dossier de travail** (tes fichiers), l'**index** (la zone de préparation, remplie par \`git add\`) et le **dépôt** (les commits). \`git status\` dit où en est chaque fichier.

**À essayer** : \`git --version\`, puis \`git init\` dans un dossier de test, et \`git status\`.`,
          example: {
            code: `mkdir journal-ia && cd journal-ia
git init -q -b main                    # crée le dépôt (dossier caché .git), branche main
git config user.name "Ada"             # identité pour ce dépôt (--global : pour tous)
git config user.email "ada@example.com"
echo "# Journal de mon projet IA" > README.md
git status --short                     # ?? = fichier non suivi
git add README.md                      # place le fichier dans l'index
git status --short                     # A = ajouté à l'index, prêt pour le commit`,
            output: `?? README.md
A  README.md`,
            notes: [
              { line: 2, text: '-q rend Git silencieux, -b main nomme la branche principale main.' },
              { line: 6, text: '--short donne une ligne par fichier. ?? : Git voit le fichier mais ne le suit pas encore.' },
              { line: 8, text: 'A dans la colonne de gauche : le fichier est dans l\'index et partira dans le prochain commit.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Quelle phrase est juste ?',
              choices: [
                'Git est un logiciel installé sur ta machine qui gère l\'historique ; GitHub est un service en ligne qui héberge des dépôts Git',
                'Git ne fonctionne qu\'avec une connexion à Internet',
                'Il faut un compte GitHub pour faire un commit',
                'Git enregistre automatiquement chaque modification, comme OneDrive'
              ],
              answer: 0,
              why: {
                1: 'Tout le travail local (commits, branches, historique) se fait sans réseau. Internet ne sert que pour échanger avec un dépôt distant.',
                2: 'Un commit est local : il suffit d\'avoir Git et une identité (user.name, user.email).',
                3: 'Rien n\'est automatique : c\'est toi qui choisis quand faire un commit, et ce qu\'il contient.'
              },
              hint: 'L\'un est un outil, l\'autre un site web.',
              explain: 'Git fonctionne entièrement en local. GitHub, GitLab ou Azure DevOps hébergent une copie du dépôt pour la partager : ce sont des services autour de Git.'
            },
            {
              type: 'predict',
              prompt: 'Qu\'affiche ce script ?',
              code: `mkdir demo && cd demo
git init -q -b main
echo "a" > a.txt
echo "b" > b.txt
git add a.txt
git status --short`,
              answer: `A  a.txt
?? b.txt`,
              accept: ['A a.txt\n?? b.txt'],
              mistakes: [
                { answer: 'A  a.txt\nA  b.txt', why: 'git add a.txt n\'ajoute que a.txt. b.txt reste non suivi (??).' },
                { answer: '?? a.txt\n?? b.txt', why: 'Après git add, a.txt est dans l\'index : il passe de ?? à A.' }
              ],
              hint: 'git add n\'a reçu qu\'un seul nom de fichier.',
              explain: 'a.txt est dans l\'index (A), b.txt est vu mais pas suivi (??). Pour tout ajouter d\'un coup : `git add .`.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Dans un dépôt neuf, tu crées 4 fichiers (a, b, c et d). Tu fais `git add` sur a, b et c, puis tu modifies c. Combien de **lignes** affiche `git status --short` ?',
            code: `for f in a b c d; do echo "$f" > $f.txt; done
git add a.txt b.txt c.txt
echo "modif" >> c.txt
git status --short`,
            answer: '4',
            accept: ['quatre'],
            mistakes: [
              { answer: '5', why: 'c.txt n\'apparaît qu\'une fois, sur une seule ligne « AM » : A pour l\'index, M pour le dossier de travail.' },
              { answer: '3', why: 'd.txt, jamais ajouté, apparaît aussi, avec ??.' }
            ],
            hint: 'Chaque fichier a au plus une ligne, avec deux colonnes : index à gauche, dossier de travail à droite.',
            explain: 'Sortie : `A  a.txt`, `A  b.txt`, `AM c.txt`, `?? d.txt`. La ligne AM signale que l\'index contient l\'ancienne version de c : il faudra refaire `git add c.txt` pour inclure la modification.'
          },
          recap: [
            'Git enregistre des instantanés (commits) choisis par toi, avec un message ; GitHub héberge des dépôts.',
            '`git config --global user.name` et `user.email` : une fois par machine.',
            '`git init` crée le dossier .git, qui contient tout l\'historique.',
            'Trois zones : dossier de travail, index (`git add`), dépôt (`git commit`) ; `git status` les résume.'
          ],
          check: {
            type: 'fill',
            prompt: 'Complète le script : il crée un dépôt, puis prépare `notes.txt` pour le prochain commit.',
            code: `mkdir depot && cd depot
git ___ -q -b main
echo "données" > notes.txt
git ___ notes.txt
git status --short`,
            blanks: [
              {
                answers: ['init'],
                options: ['init', 'start', 'clone', 'new'],
                why: {
                  start: 'git start n\'existe pas.',
                  clone: 'git clone copie un dépôt existant (souvent depuis GitHub) ; il ne transforme pas le dossier courant en dépôt.',
                  new: 'git new n\'existe pas.'
                }
              },
              {
                answers: ['add'],
                options: ['add', 'commit', 'save', 'push'],
                why: {
                  commit: 'commit enregistre ce qui est déjà dans l\'index ; ici, notes.txt n\'y est pas encore.',
                  save: 'git save n\'existe pas.',
                  push: 'push envoie des commits vers un dépôt distant ; il n\'y a ni commit ni dépôt distant ici.'
                }
              }
            ],
            output: 'A  notes.txt',
            hint: 'Une commande crée le dépôt, l\'autre place un fichier dans l\'index.',
            explain: '`git init` crée le dépôt, `git add` place le fichier dans l\'index : git status affiche alors A. La prochaine étape sera `git commit`.'
          }
        }
      ]
    },
    {
      id: 'git.u4',
      title: 'Commits',
      summary: 'Enregistrer des instantanés, relire ses modifications et corriger une erreur.',
      lessons: [
        {
          id: 'git.u4.l1',
          title: 'Enregistrer avec add et commit',
          minutes: 7,
          objective: 'Tu sais préparer des modifications avec git add et les enregistrer dans un commit avec un message clair, en lisant git status.',
          explain: `Un **commit** est un instantané du projet, accompagné d'un message, d'un auteur, d'une date et d'un identifiant unique, le hash (par exemple \`3f9a2c1\`). Le cycle de travail :

- modifier des fichiers ;
- \`git add fichier\` (ou \`git add .\` pour tout le dossier courant) : choisir ce qui partira dans le commit ;
- \`git commit -m "message"\` : enregistrer l'instantané. Sans \`-m\`, Git ouvre un éditeur pour écrire le message.

\`git commit -a -m "..."\` ajoute automatiquement les fichiers **déjà suivis** qui ont changé, mais jamais les nouveaux fichiers.

\`git status --short\` résume l'état : \`??\` non suivi, \`A\` ajouté, \`M\` modifié. La colonne de gauche décrit l'index, celle de droite le dossier de travail : \`M\` à gauche, modification prête ; \`M\` à droite, modification pas encore ajoutée. Un fichier suivi et inchangé n'apparaît pas.

Le message dit **ce que fait** le commit, à l'impératif : « Ajoute le nettoyage des données ».

**À essayer** : dans ton dépôt de test, fais deux commits successifs, puis \`git log --oneline\`.`,
          example: {
            code: `mkdir modele && cd modele
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "epochs = 5" > config.py
git add config.py
git commit -q -m "Ajoute la configuration d'entraînement"
echo "epochs = 10" > config.py
git status --short                    # modifié, pas encore ajouté
git log --format="%an : %s"           # auteur et message de chaque commit`,
            output: ` M config.py
Ada : Ajoute la configuration d'entraînement`,
            notes: [
              { line: 6, text: 'Le commit enregistre le contenu de l\'index ; -q évite l\'affichage du hash, qui change à chaque fois.' },
              { line: 8, text: 'Le M est dans la colonne de droite (précédé d\'un espace) : modifié dans le dossier de travail, pas encore dans l\'index.' },
              { line: 9, text: '%an est le nom de l\'auteur, %s le message : un seul commit pour l\'instant.' }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: 'Qu\'affiche ce script ? Regarde bien l\'ordre des lignes 5 à 7.',
              code: `mkdir app && cd app
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "v1" > app.py
git add app.py
echo "v2" > app.py
git commit -q -m "Première version"
git status --short`,
              answer: ' M app.py',
              accept: ['M app.py'],
              mistakes: [
                { answer: 'M  app.py', why: 'Après le commit, l\'index contient v1, exactement comme le commit : la colonne de gauche est vide. C\'est le dossier de travail (v2) qui diffère, d\'où le M à droite.' },
                { answer: 'A  app.py', why: 'Le commit a enregistré le contenu de l\'index : app.py est désormais suivi, il n\'est plus « ajouté ».' }
              ],
              hint: 'Le commit enregistre-t-il le fichier tel qu\'il est sur le disque, ou tel qu\'il était au moment du git add ?',
              explain: 'git add a placé v1 dans l\'index ; le commit enregistre v1. Le fichier sur le disque contient v2, qui n\'a pas été ajouté : git status signale une modification non préparée. Il faudrait refaire `git add app.py`.'
            },
            {
              type: 'fill',
              prompt: 'Complète le script pour enregistrer `idees.md` dans un commit.',
              code: `mkdir notes && cd notes
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "Idées de projets" > idees.md
git ___ idees.md
git ___ -q ___ "Ajoute le fichier d'idées"
git log --format=%s`,
              blanks: [
                {
                  answers: ['add'],
                  options: ['add', 'commit', 'push', 'save'],
                  why: {
                    commit: 'Le fichier n\'est pas encore dans l\'index : un commit ici n\'aurait rien à enregistrer.',
                    push: 'push envoie des commits vers un dépôt distant ; il n\'y en a pas ici.',
                    save: 'git save n\'existe pas.'
                  }
                },
                {
                  answers: ['commit'],
                  options: ['commit', 'add', 'log', 'push'],
                  why: {
                    add: 'Le fichier est déjà dans l\'index : il reste à l\'enregistrer.',
                    log: 'git log affiche l\'historique, il n\'enregistre rien.',
                    push: 'push n\'enregistre pas de nouvel instantané : il envoie des commits existants.'
                  }
                },
                {
                  answers: ['-m'],
                  options: ['-m', '-a', '-q', '--amend'],
                  why: {
                    '-a': '-a ajoute les fichiers suivis modifiés ; le texte entre guillemets serait alors pris pour un nom de fichier.',
                    '-q': '-q est déjà présent : il rend Git silencieux, il ne donne pas le message.',
                    '--amend': '--amend modifie le dernier commit ; or il n\'y en a encore aucun.'
                  }
                }
              ],
              output: 'Ajoute le fichier d\'idées',
              hint: 'Préparer, enregistrer, et l\'option qui introduit le message.',
              explain: '`git add` prépare, `git commit -m "message"` enregistre. git log --format=%s affiche ensuite le message de chaque commit.'
            }
          ],
          challenge: {
            type: 'bug',
            prompt: 'Ce script doit enregistrer `serveur.py` dans un premier commit, puis afficher son message. Le commit échoue avec « nothing added to commit ». Clique sur la ligne fautive.',
            code: `mkdir api && cd api
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "print('API')" > serveur.py
git commit -q -m "Ajoute le serveur"
git log --format=%s`,
            bugLine: 5,
            why: 'serveur.py est un nouveau fichier : tant qu\'il n\'est pas passé par l\'index avec git add, le commit n\'a rien à enregistrer.',
            fixes: [
              'git add serveur.py && git commit -q -m "Ajoute le serveur"',
              'git commit -q -a -m "Ajoute le serveur"',
              'git commit -q -m "Ajoute le serveur" serveur.py',
              'git status && git commit -q -m "Ajoute le serveur"'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: '-a n\'ajoute que les fichiers **déjà suivis**. Un nouveau fichier n\'est jamais ajouté par -a : même erreur.',
              2: 'Nommer le fichier après le message ne marche que pour un fichier déjà suivi : Git répond « pathspec did not match any file(s) known to git ».',
              3: 'git status affiche l\'état, il n\'ajoute rien : le commit échoue toujours.'
            },
            output: 'Ajoute le serveur',
            hint: 'Quelle étape du cycle manque avant le commit ? Attention aux raccourcis qui ne valent que pour les fichiers déjà suivis.',
            explain: 'Un nouveau fichier doit toujours passer par `git add`. Le raccourci `git commit -a` est pratique pour les fichiers déjà suivis, mais il oublie les nouveaux : vérifie `git status` avant de valider.'
          },
          recap: [
            'Cycle : modifier, `git add`, `git commit -m "message"`.',
            '`git commit -a` n\'ajoute que les fichiers déjà suivis, jamais les nouveaux.',
            'git status --short : colonne de gauche = index, colonne de droite = dossier de travail.',
            'Un message de commit dit ce que fait le commit, à l\'impératif.'
          ],
          check: {
            type: 'qcm',
            prompt: '`git status --short` affiche `MM config.py`. Que signifie cette ligne ?',
            choices: [
              'Une modification de config.py est dans l\'index, et le fichier a encore été modifié depuis dans le dossier de travail',
              'config.py a été commité deux fois',
              'config.py est en conflit entre deux branches',
              'config.py a été modifié par deux personnes'
            ],
            answer: 0,
            why: {
              1: 'git status ne parle pas des commits passés : il compare le dernier commit, l\'index et le dossier de travail.',
              2: 'Un conflit s\'affiche UU (unité 7).',
              3: 'git status ne connaît pas les auteurs : chaque colonne correspond à une zone, pas à une personne.'
            },
            hint: 'Chaque colonne correspond à une zone : la gauche à l\'index, la droite au dossier de travail.',
            explain: 'M à gauche : l\'index contient une version modifiée par rapport au dernier commit. M à droite : le fichier sur le disque diffère encore de l\'index. Un `git commit` maintenant n\'enregistrerait que la version de l\'index.'
          }
        },
        {
          id: 'git.u4.l2',
          title: 'Voir et défaire des changements',
          minutes: 8,
          objective: 'Tu sais afficher les différences avec git diff et annuler une modification, une préparation ou le dernier commit sans perdre ton travail.',
          explain: `Avant de valider, on relit :

- \`git diff\` montre ce qui a changé dans le dossier de travail et **n'est pas encore** dans l'index ;
- \`git diff --staged\` montre ce qui est dans l'index, donc ce qui partira au prochain commit.

Les lignes qui commencent par \`-\` sont retirées, celles qui commencent par \`+\` ajoutées.

Pour défaire :

- \`git restore fichier\` remet le fichier dans l'état de l'index (ou du dernier commit) : tes modifications non enregistrées sont **perdues définitivement** ;
- \`git restore --staged fichier\` retire le fichier de l'index sans toucher à son contenu ;
- \`git commit --amend\` remplace le dernier commit (message à corriger, fichier oublié), à réserver à un commit **pas encore partagé** avec git push.

Ces commandes sont les mêmes dans Git Bash, PowerShell ou WSL : Git ne dépend pas du shell.

**À essayer** : modifie un fichier suivi, lance \`git diff\`, puis \`git restore\` sur ce fichier.`,
          example: {
            code: `mkdir calc && cd calc
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
printf "taux = 0.01\\nepochs = 5\\n" > config.py
git add config.py && git commit -q -m "Ajoute la configuration"
printf "taux = 0.01\\nepochs = 20\\n" > config.py
git diff | grep "^[-+][^-+]"          # garde les lignes retirées (-) et ajoutées (+)
git restore config.py                 # annule la modification : définitif !
cat config.py`,
            output: `-epochs = 5
+epochs = 20
taux = 0.01
epochs = 5`,
            notes: [
              { line: 6, text: 'On change une seule ligne du fichier, sans faire git add.' },
              { line: 7, text: 'git diff affiche aussi un en-tête ; grep ne garde ici que les lignes retirées et ajoutées.' },
              { line: 8, text: 'git restore recopie la version de l\'index : epochs = 20 est perdu sans retour possible.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Tu as modifié `rapport.md` puis lancé `git add rapport.md`. `git diff` n\'affiche plus rien. Pourquoi ?',
              choices: [
                'git diff compare le dossier de travail à l\'index ; tes changements sont déjà dans l\'index, il faut git diff --staged',
                'git add a annulé tes modifications',
                'git diff ne montre que les changements déjà commités',
                'Le fichier est trop petit pour que Git détecte une différence'
              ],
              answer: 0,
              why: {
                1: 'git add ne supprime rien : il copie la version actuelle du fichier dans l\'index.',
                2: 'C\'est l\'inverse : git diff montre ce qui n\'est pas encore préparé. Pour comparer deux commits, on utilise `git diff HEAD~1 HEAD`.',
                3: 'Git détecte n\'importe quel changement, même d\'un seul caractère.'
              },
              hint: 'Quelles sont les deux zones comparées par git diff sans option ?',
              explain: 'Après git add, le dossier de travail et l\'index sont identiques : git diff n\'a rien à montrer. `git diff --staged` compare l\'index au dernier commit et montre ce que le prochain commit contiendra.'
            },
            {
              type: 'predict',
              prompt: 'Ada a ajouté par erreur son fichier de secrets `.env`. Qu\'affiche ce script ?',
              code: `mkdir projet && cd projet
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "a" > a.txt && git add a.txt && git commit -q -m "init"
echo "secret=123" > .env
echo "b" >> a.txt
git add .
git restore --staged .env
git status --short`,
              answer: `M  a.txt
?? .env`,
              accept: ['M a.txt\n?? .env'],
              mistakes: [
                { answer: 'M  a.txt', why: 'restore --staged retire .env de l\'index mais ne supprime pas le fichier : il redevient non suivi (??).' },
                { answer: 'M  a.txt\nA  .env', why: 'C\'était l\'état juste après git add . ; la ligne suivante retire justement .env de l\'index.' }
              ],
              hint: 'git add . a tout ajouté ; que fait exactement `git restore --staged` sur .env ?',
              explain: 'a.txt reste préparé (M à gauche). .env sort de l\'index mais reste sur le disque, non suivi. Pour qu\'il ne soit plus jamais proposé, on l\'ajoutera à un fichier .gitignore (unité 11).'
            }
          ],
          challenge: {
            type: 'fill',
            prompt: 'Ada a oublié `poids.py` dans son dernier commit, pas encore partagé. Complète la ligne qui **ajoute le fichier au dernier commit en gardant son message**, sans créer de nouveau commit.',
            code: `mkdir modele && cd modele
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "class Modele: pass" > modele.py && git add . && git commit -q -m "Ajoute le modèle"
echo "poids = 0.5" > poids.py          # le fichier oublié
git add poids.py
git commit -q ___
git log --format=%s`,
            blanks: [
              {
                answers: ['--amend --no-edit', '--no-edit --amend', '--amend -m "Ajoute le modèle"', "--amend -m 'Ajoute le modèle'"],
                why: {
                  '-m "Ajoute le modèle"': 'Cela crée un second commit avec le même message : l\'historique en compterait deux.',
                  '--amend': 'Correct sur le fond, mais sans --no-edit ni -m, Git ouvre un éditeur pour te faire confirmer le message.',
                  '-a': '-a ne remplace pas le dernier commit : il en crée un nouveau, et il faudrait un message.'
                }
              }
            ],
            output: 'Ajoute le modèle',
            hint: 'Une option remplace le dernier commit, une autre garde son message sans ouvrir d\'éditeur.',
            explain: '`git commit --amend --no-edit` remplace le dernier commit par un nouveau qui contient aussi poids.py, avec le même message. L\'historique ne montre qu\'un commit. N\'amende jamais un commit déjà poussé : tes collègues ont l\'ancien.'
          },
          recap: [
            '`git diff` : dossier de travail contre index ; `git diff --staged` : index contre dernier commit.',
            '`git restore fichier` jette les modifications non enregistrées, définitivement.',
            '`git restore --staged fichier` retire de l\'index sans toucher au fichier.',
            '`git commit --amend` corrige le dernier commit, seulement s\'il n\'est pas encore poussé.'
          ],
          check: {
            type: 'bug',
            prompt: 'Ada a ajouté par erreur `donnees.csv` (un gros fichier) à l\'index. Elle veut le **retirer de l\'index sans perdre le fichier**. Après son script, le fichier a disparu du disque. Clique sur la ligne fautive.',
            code: `mkdir ds && cd ds
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "x" > notes.md && git add notes.md && git commit -q -m "init"
echo "1,2,3" > donnees.csv
git add donnees.csv
rm donnees.csv
git status --short`,
            bugLine: 7,
            why: 'rm supprime le fichier du disque, et l\'index garde une copie en attente : git status affiche AD (ajouté, puis supprimé). C\'est l\'inverse de ce qui était voulu.',
            fixes: ['git restore --staged donnees.csv', 'git restore donnees.csv', 'git commit -q -m "Retire donnees.csv"', 'git reset -q --hard'],
            fixAnswer: 0,
            fixWhy: {
              1: 'Sans --staged, git restore agit sur le dossier de travail : il recopie la version de l\'index, et le fichier reste préparé (A).',
              2: 'Le commit enregistrerait au contraire donnees.csv dans l\'historique.',
              3: 'reset --hard remet tout à l\'état du dernier commit : le fichier, nouveau, serait effacé du disque. Une commande à manier avec beaucoup de prudence.'
            },
            output: '?? donnees.csv',
            hint: 'Il faut agir sur l\'index seulement, pas sur le fichier.',
            explain: '`git restore --staged donnees.csv` sort le fichier de l\'index : il redevient non suivi (??) et reste intact sur le disque.'
          }
        }
      ]
    },
    {
      id: 'git.u5',
      title: 'Historique',
      summary: 'Parcourir les commits, désigner une version précise et voir ce qu\'elle a changé.',
      lessons: [
        {
          id: 'git.u5.l1',
          title: 'Explorer l\'historique',
          minutes: 7,
          objective: 'Tu sais parcourir l\'historique avec git log, désigner un commit (hash, HEAD~n) et voir ce qu\'il a changé avec git show.',
          explain: `\`git log\` liste les commits, du plus récent au plus ancien. Options utiles :

- \`--oneline\` : une ligne par commit (hash court et message) ; \`-n 3\` : les 3 derniers ;
- \`--format="%h %an %s"\` : format personnalisé (hash, auteur, message) ;
- \`--stat\` : fichiers touchés ; \`git log -- fichier\` : seulement les commits qui modifient ce fichier ; \`--author=Ada\` et \`--grep=modèle\` filtrent.

Pour désigner un commit : son **hash** (les 7 premiers caractères suffisent en général), ou une position relative. \`HEAD\` est le commit sur lequel tu travailles, \`HEAD~1\` son parent, \`HEAD~2\` le parent du parent.

\`git show HEAD~1\` affiche un commit et ses modifications ; \`git show HEAD~2:train.py\` affiche le fichier tel qu'il était à ce moment-là. \`git diff HEAD~3 HEAD\` compare deux versions, et \`git blame fichier\` indique, pour chaque ligne, le dernier commit qui l'a modifiée.

**À essayer** : dans un projet cloné depuis GitHub, \`git log --oneline -n 10\`, puis \`git show\` suivi d'un des hash affichés.`,
          example: {
            code: `mkdir histo && cd histo
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "v1" > modele.py && git add . && git commit -q -m "Crée le modèle"
echo "# Données" > data.md && git add . && git commit -q -m "Documente les données"
echo "v2" > modele.py && git commit -q -am "Améliore le modèle"
git log --format="%an - %s"            # du plus récent au plus ancien
git log --format=%s -- modele.py       # seulement les commits qui touchent modele.py
git show HEAD~2:modele.py              # modele.py tel qu'il était 2 commits plus tôt`,
            output: `Ada - Améliore le modèle
Ada - Documente les données
Ada - Crée le modèle
Améliore le modèle
Crée le modèle
v1`,
            notes: [
              { line: 7, text: 'Le commit le plus récent est en haut. On évite ici le hash, qui change à chaque exécution.' },
              { line: 8, text: '« Documente les données » n\'a pas touché modele.py : il est filtré.' },
              { line: 9, text: 'HEAD~2 remonte de deux commits : au premier, où modele.py contenait v1.' }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: 'Complète les commandes décrites en commentaire.',
              code: `# Les 3 derniers commits, une ligne chacun
git log ___ -n 3
# Le détail du commit précédent (le parent de HEAD)
git show ___
# Seulement les commits qui ont modifié train.py
git log -- ___`,
              blanks: [
                {
                  answers: ['--oneline'],
                  options: ['--oneline', '--short', '--stat', '--all'],
                  why: {
                    '--short': 'git log n\'a pas d\'option --short (c\'est git status qui en a une).',
                    '--stat': '--stat ajoute la liste des fichiers touchés : plusieurs lignes par commit.',
                    '--all': '--all inclut toutes les branches, sans réduire l\'affichage à une ligne.'
                  }
                },
                {
                  answers: ['HEAD~1', 'HEAD~', 'HEAD^', 'HEAD^1'],
                  why: {
                    HEAD: 'HEAD désigne le commit actuel, pas son parent.',
                    'HEAD~2': 'HEAD~2 remonte de deux commits.',
                    'HEAD-1': 'La notation est HEAD~1 (tilde), pas HEAD-1.'
                  }
                },
                {
                  answers: ['train.py'],
                  why: { '-- train.py': 'Les deux tirets sont déjà écrits : il reste le nom du fichier.' }
                }
              ],
              hint: 'Une option d\'affichage compact, une position relative à HEAD, un chemin de fichier.',
              explain: '`--oneline` affiche une ligne par commit, `HEAD~1` désigne le parent de HEAD, et `--` sépare les options des chemins de fichiers.'
            },
            {
              type: 'predict',
              prompt: 'Qu\'affiche ce script ?',
              code: `mkdir journal && cd journal
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "collecte" > etapes.txt && git add . && git commit -q -m "Collecte"
echo "nettoyage" >> etapes.txt && git commit -q -am "Nettoyage"
echo "entrainement" >> etapes.txt && git commit -q -am "Entraînement"
git log --format=%s -n 2 HEAD~1`,
              answer: `Nettoyage
Collecte`,
              mistakes: [
                { answer: 'Entraînement\nNettoyage', why: 'HEAD~1 sert de point de départ : git log part du commit « Nettoyage » et remonte, sans afficher « Entraînement ».' },
                { answer: 'Nettoyage', why: '-n 2 affiche deux commits : le point de départ et son parent.' }
              ],
              hint: 'Quel commit désigne HEAD~1 ? git log affiche ce commit puis ses ancêtres.',
              explain: 'HEAD est « Entraînement », HEAD~1 est « Nettoyage ». git log part de là et remonte : Nettoyage, puis Collecte. -n 2 limite à deux commits.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'La branche main compte 7 commits, et tu es sur le dernier. Combien de commits affiche `git log --oneline HEAD~2` ?',
            code: 'git log --oneline HEAD~2',
            answer: '5',
            accept: ['cinq'],
            mistakes: [
              { answer: '2', why: 'HEAD~2 n\'est pas un nombre de commits à afficher : c\'est le point de départ de git log, qui remonte ensuite jusqu\'au premier commit.' },
              { answer: '7', why: 'Les deux commits plus récents que HEAD~2 ne sont pas affichés : git log ne remonte que vers les ancêtres.' }
            ],
            hint: 'Numérote les commits de 1 (le plus ancien) à 7 (HEAD). Lequel est HEAD~2 ?',
            explain: 'HEAD est le 7e commit, HEAD~2 le 5e. git log affiche ce commit et tous ses ancêtres : les commits 5, 4, 3, 2 et 1.'
          },
          recap: [
            '`git log --oneline`, `-n`, `--format`, `-- fichier` pour lire l\'historique.',
            'Un commit se désigne par son hash ou par HEAD~n (n commits avant HEAD).',
            '`git show commit` montre ses changements ; `git show commit:fichier` montre le fichier à cette date.',
            '`git blame fichier` indique le dernier commit de chaque ligne.'
          ],
          check: {
            type: 'qcm',
            prompt: 'Tu veux voir **ce qu\'a changé** l\'avant-dernier commit. Quelle commande choisis-tu ?',
            choices: ['git show HEAD~1', 'git log -n 2', 'git diff HEAD~1', 'git restore HEAD~1'],
            answer: 0,
            why: {
              1: 'git log -n 2 affiche les deux derniers commits (messages, auteurs, dates), sans leurs modifications.',
              2: 'git diff HEAD~1 compare HEAD~1 au dossier de travail : on y voit les changements du dernier commit et ceux non commités, pas ceux de l\'avant-dernier.',
              3: 'git restore modifie des fichiers ; ce n\'est pas une commande d\'affichage.'
            },
            hint: 'Une commande affiche un commit précis avec son contenu ; HEAD~1 désigne l\'avant-dernier.',
            explain: '`git show HEAD~1` affiche le message de l\'avant-dernier commit et le diff de ce qu\'il a changé par rapport à son propre parent.'
          }
        }
      ]
    },
    {
      id: 'git.u6',
      title: 'Branches',
      summary: 'Travailler sur plusieurs sujets en parallèle sans casser la branche principale.',
      lessons: [
        {
          id: 'git.u6.l1',
          title: 'Travailler avec des branches',
          minutes: 8,
          objective: 'Tu sais créer une branche, basculer entre branches et expliquer pourquoi les fichiers changent quand tu changes de branche.',
          explain: `Une **branche** est une étiquette mobile qui pointe vers un commit. À chaque nouveau commit, la branche courante avance d'un cran. \`main\` est la branche principale ; pour une nouvelle fonctionnalité ou une correction, on crée une branche à part : main reste stable, et on peut travailler sur plusieurs sujets en parallèle.

- \`git switch -c feature/export\` crée la branche et bascule dessus (ancienne écriture : \`git checkout -b\`) ;
- \`git switch main\` revient sur main ; \`git branch\` liste les branches, l'étoile marque la branche courante (HEAD) ;
- \`git branch nom\` crée une branche **sans** basculer dessus ;
- \`git branch -d nom\` supprime une branche déjà fusionnée.

Changer de branche **remplace les fichiers** du dossier de travail par ceux du dernier commit de cette branche. Avant de changer, enregistre ton travail (commit) ou mets-le de côté avec \`git stash\`. Nomme les branches clairement : \`feature/export-csv\`, \`fix/division-zero\`.

**À essayer** : crée une branche, fais-y un commit, reviens sur main et regarde le fichier avec \`cat\`.`,
          example: {
            code: `mkdir appli && cd appli
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "Accueil" > page.txt && git add . && git commit -q -m "Page d'accueil"
git switch -q -c feature/contact          # crée la branche et bascule dessus
echo "Contact" >> page.txt && git commit -q -am "Ajoute le contact"
git branch                                # * = branche courante
git switch -q main
cat page.txt                              # main n'a pas encore le contact`,
            output: `* feature/contact
  main
Accueil`,
            notes: [
              { line: 5, text: 'La nouvelle branche part du commit actuel de main.' },
              { line: 6, text: 'Ce commit fait avancer feature/contact ; main ne bouge pas.' },
              { line: 9, text: 'De retour sur main, Git a remis page.txt dans son état de main : une seule ligne.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Qu\'est-ce qu\'une branche Git ?',
              choices: [
                'Une étiquette qui pointe vers un commit et avance à chaque nouveau commit fait sur cette branche',
                'Une copie complète de tous les fichiers du projet dans un autre dossier',
                'Une sauvegarde du projet sur GitHub',
                'Un commit spécial qui ne peut pas être modifié'
              ],
              answer: 0,
              why: {
                1: 'Git ne copie pas le projet : créer une branche coûte presque rien, quelle que soit la taille du dépôt.',
                2: 'Une branche existe d\'abord en local ; on peut la publier sur GitHub, mais ce n\'est pas ce qui la définit.',
                3: 'Une branche n\'est pas un commit : elle désigne un commit, et se déplace.'
              },
              hint: 'Que se passe-t-il, en interne, quand tu fais un commit sur une branche ?',
              explain: 'Une branche n\'est qu\'un nom attaché à un commit. Créer, changer ou supprimer une branche est donc instantané ; ce sont les commits qui portent le contenu.'
            },
            {
              type: 'order',
              prompt: 'Remets les lignes dans l\'ordre : créer le dépôt, donner son identité, faire un premier commit, corriger une faute sur une branche, puis revenir sur main et afficher le fichier (où la faute est encore là).',
              lines: [
                'mkdir site && cd site && git init -q -b main',
                'git config user.name "Ada" && git config user.email "ada@example.com"',
                'echo "Bienvenu" > accueil.txt && git add . && git commit -q -m "Accueil"',
                'git switch -q -c fix/accord',
                'echo "Bienvenue" > accueil.txt && git commit -q -am "Corrige l\'accord"',
                'git switch -q main',
                'cat accueil.txt'
              ],
              output: 'Bienvenu',
              hint: 'La branche de correction doit partir d\'un commit existant, et le fichier affiché à la fin est celui de main.',
              explain: 'On crée la branche après le premier commit, on corrige dessus, puis on revient sur main : le fichier y affiche encore « Bienvenu ». La correction n\'arrivera sur main qu\'après une fusion (unité 7).'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Qu\'affiche ce script ? Attention à la ligne 5.',
            code: `mkdir b && cd b
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "v1" > f.txt && git add . && git commit -q -m "v1"
git branch experience
echo "v2" > f.txt && git commit -q -am "v2"
git switch -q experience
cat f.txt
git branch --show-current`,
            answer: `v1
experience`,
            mistakes: [
              { answer: 'v2\nexperience', why: '`git branch experience` crée la branche sans basculer dessus. Le commit v2 est fait sur main ; experience reste sur le commit v1.' },
              { answer: 'v2\nmain', why: 'git switch experience a bien changé de branche : --show-current affiche experience.' }
            ],
            hint: 'Sur quelle branche est fait le commit v2 ? Et où pointe experience ?',
            explain: 'git branch crée l\'étiquette experience sur le commit v1, mais on reste sur main, qui avance avec v2. En basculant sur experience, Git remet f.txt dans son état v1.'
          },
          recap: [
            'Une branche est une étiquette mobile sur un commit ; créer une branche ne copie rien.',
            '`git switch -c nom` crée et bascule ; `git switch nom` bascule ; `git branch` liste.',
            '`git branch nom` crée sans basculer ; `git branch -d nom` supprime une branche fusionnée.',
            'Changer de branche remplace les fichiers du dossier de travail : commite ou utilise git stash avant.'
          ],
          check: {
            type: 'fill',
            prompt: 'Complète les commandes décrites en commentaire.',
            code: `git ___ -c feature/export        # crée la branche et bascule dessus
git switch ___                   # revient sur la branche principale
git branch ___ feature/export    # supprime la branche une fois fusionnée`,
            blanks: [
              {
                answers: ['switch'],
                options: ['switch', 'branch', 'merge', 'init'],
                why: {
                  branch: '`git branch -c` copie une branche existante ; il ne bascule pas dessus.',
                  merge: 'merge fusionne une branche dans la branche courante.',
                  init: 'init crée un dépôt, pas une branche.'
                }
              },
              {
                answers: ['main'],
                options: ['main', 'HEAD', 'origin', '-c'],
                why: {
                  HEAD: 'HEAD désigne la position actuelle : on resterait où l\'on est.',
                  origin: 'origin est le nom d\'un dépôt distant (unité 8), pas d\'une branche locale.',
                  '-c': '-c crée une nouvelle branche ; il faudrait un nom après.'
                }
              },
              {
                answers: ['-d'],
                options: ['-d', '-c', '-m', '--all'],
                why: {
                  '-c': '-c copie une branche.',
                  '-m': '-m renomme une branche.',
                  '--all': '--all liste toutes les branches, locales et distantes.'
                }
              }
            ],
            hint: 'Basculer, revenir sur la branche principale, supprimer.',
            explain: '`git switch -c` crée et bascule, `git switch main` revient, `git branch -d` supprime une branche fusionnée. Si elle ne l\'est pas, Git refuse : `-D` force, au risque de perdre des commits.'
          }
        }
      ]
    },
    {
      id: 'git.u7',
      title: 'Fusion et conflits',
      summary: 'Intégrer le travail d\'une branche et résoudre les conflits sereinement.',
      lessons: [
        {
          id: 'git.u7.l1',
          title: 'Fusionner des branches',
          minutes: 8,
          objective: 'Tu sais fusionner une branche dans main et distinguer une avance rapide d\'une fusion avec commit de fusion.',
          explain: `Quand le travail d'une branche est prêt, on l'intègre : on se place sur la branche qui **reçoit** (\`git switch main\`), puis \`git merge feature\`.

Deux cas :

- **avance rapide** (fast-forward) : main n'a pas bougé depuis la création de feature. Git avance simplement l'étiquette main jusqu'au dernier commit de feature, sans créer de commit ;
- **fusion à trois voies** : les deux branches ont avancé. Git combine les deux versions à partir de leur ancêtre commun et crée un **commit de fusion**, qui a deux parents.

\`git log --graph --oneline\` dessine l'historique et montre ces bifurcations. \`git merge --no-ff feature\` force un commit de fusion même quand une avance rapide est possible, pour garder la trace de la branche. Une fois la branche fusionnée, supprime-la : \`git branch -d feature\`.

**À essayer** : reprends le dépôt de la leçon précédente et fusionne ta branche dans main.`,
          example: {
            code: `mkdir fusion && cd fusion
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "a" > a.txt && git add . && git commit -q -m "Base"
git switch -q -c feature
echo "b" > b.txt && git add . && git commit -q -m "Ajoute b"
git switch -q main
echo "c" > c.txt && git add . && git commit -q -m "Ajoute c"
git merge -q feature -m "Fusionne feature"
git log --format=%s --graph
ls`,
            output: `*   Fusionne feature
|\\
| * Ajoute b
* | Ajoute c
|/
* Base
a.txt
b.txt
c.txt`,
            notes: [
              { line: 8, text: 'main avance aussi pendant ce temps : une avance rapide n\'est plus possible.' },
              { line: 9, text: 'On fusionne depuis main, la branche qui reçoit. -m donne le message du commit de fusion.' },
              { line: 10, text: 'Le graphe montre la bifurcation après « Base », puis le commit de fusion qui réunit les deux lignes.' },
              { line: 11, text: 'main contient maintenant les fichiers des deux branches.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Depuis la création de la branche feature, main n\'a reçu **aucun** commit. Que fait `git merge feature` exécuté sur main ?',
              choices: [
                'Une avance rapide : main pointe simplement sur le dernier commit de feature, sans commit de fusion',
                'Un commit de fusion à deux parents',
                'Un conflit, car les deux branches contiennent les mêmes fichiers',
                'Rien : on ne peut pas fusionner une branche plus récente que main'
              ],
              answer: 0,
              why: {
                1: 'Un commit de fusion n\'est nécessaire que si les deux branches ont avancé chacune de leur côté (sauf avec --no-ff).',
                2: 'Avoir les mêmes fichiers ne crée pas de conflit : il faut des modifications différentes des mêmes lignes, des deux côtés.',
                3: 'C\'est justement le cas le plus simple : main n\'a qu\'à avancer.'
              },
              hint: 'Si main n\'a pas bougé, tous ses commits sont déjà dans l\'historique de feature.',
              explain: 'L\'historique de feature contient déjà tout main : Git déplace l\'étiquette main vers l\'avant (fast-forward). L\'historique reste une ligne droite.'
            },
            {
              type: 'predict',
              prompt: 'Combien de commits contient l\'historique de main à la fin ? Qu\'affiche le script ?',
              code: `mkdir ff && cd ff
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "1" > f.txt && git add . && git commit -q -m "Un"
git switch -q -c feature
echo "2" >> f.txt && git commit -q -am "Deux"
echo "3" >> f.txt && git commit -q -am "Trois"
git switch -q main
git merge -q feature
git log --format=%s | wc -l`,
              answer: '3',
              mistakes: [
                { answer: '4', why: 'main n\'a pas avancé pendant le travail sur feature : la fusion est une avance rapide, sans commit de fusion.' },
                { answer: '1', why: 'Après la fusion, main contient aussi les deux commits de feature.' }
              ],
              hint: 'main a-t-il reçu un commit pendant que tu travaillais sur feature ?',
              explain: 'Avance rapide : main pointe désormais sur « Trois ». L\'historique compte Un, Deux et Trois, soit 3 lignes comptées par wc -l.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'main compte 5 commits. Tu crées feature et y fais 2 commits. Pendant ce temps, main reçoit 1 commit. Tu fusionnes feature dans main (fusion à trois voies). Combien de commits affiche alors `git log --oneline` sur main ?',
            code: 'git switch main && git merge feature',
            answer: '9',
            accept: ['neuf'],
            mistakes: [
              { answer: '8', why: 'Une fusion à trois voies ajoute son propre commit, le commit de fusion.' },
              { answer: '6', why: 'git log affiche aussi les commits venus de feature, accessibles par le second parent du commit de fusion.' }
            ],
            hint: 'Additionne : les commits de départ, ceux de chaque branche, et ce que crée une fusion à trois voies.',
            explain: '5 commits communs + 1 sur main + 2 sur feature + 1 commit de fusion = 9. git log suit les deux parents du commit de fusion.'
          },
          recap: [
            'On fusionne depuis la branche qui reçoit : `git switch main` puis `git merge feature`.',
            'Avance rapide si main n\'a pas bougé ; sinon, commit de fusion à deux parents.',
            '`git log --graph --oneline` dessine l\'historique.',
            'Après la fusion : `git branch -d feature`.'
          ],
          check: {
            type: 'bug',
            prompt: 'Le but : intégrer feature/export dans **main**. Après le script, main ne contient toujours pas export.py. Clique sur la ligne fautive.',
            code: `mkdir m && cd m
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "app" > app.py && git add . && git commit -q -m "Base"
git switch -q -c feature/export
echo "export" > export.py && git add . && git commit -q -m "Ajoute l'export"
git merge -q main
git switch -q main
ls`,
            bugLine: 7,
            why: 'À la ligne 7, on est encore sur feature/export : on fusionne main dans feature/export (déjà à jour), au lieu de l\'inverse. main ne reçoit rien.',
            fixes: [
              'git switch -q main && git merge -q feature/export',
              'git merge -q feature/export',
              'git merge -q --no-ff main',
              'git switch -q feature/export'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: 'On est sur feature/export : fusionner une branche dans elle-même ne fait rien (« Already up to date »).',
              2: '--no-ff change la façon de fusionner, pas la direction : c\'est toujours main qui est fusionnée dans feature/export.',
              3: 'On est déjà sur feature/export : cette ligne ne fait rien, et main ne reçoit toujours pas l\'export.'
            },
            output: `app.py
export.py`,
            hint: 'Sur quelle branche est-on au moment de la ligne 7 ? Laquelle doit recevoir le travail ?',
            explain: 'git merge intègre la branche nommée **dans la branche courante**. Il faut donc d\'abord basculer sur main, puis fusionner feature/export : avance rapide, et export.py apparaît sur main.'
          }
        },
        {
          id: 'git.u7.l2',
          title: 'Résoudre un conflit',
          minutes: 8,
          objective: 'Tu sais lire les marqueurs d\'un conflit de fusion, choisir la bonne version et terminer la fusion.',
          explain: `Un **conflit** survient quand les deux branches ont modifié **les mêmes lignes** (ou des lignes voisines) d'un fichier : Git ne peut pas choisir à ta place. La fusion s'arrête, \`git status\` marque le fichier \`UU\`, et Git insère des marqueurs dans le fichier :

- de \`<<<<<<< HEAD\` à \`=======\` : ta version, celle de la branche courante ;
- de \`=======\` à \`>>>>>>> nom-de-branche\` : la version qui arrive.

Pour résoudre : ouvre le fichier, garde la bonne version (ou un mélange des deux), **supprime les trois marqueurs**, puis \`git add fichier\` et \`git commit\`. Tu peux aussi tout annuler avec \`git merge --abort\`. VS Code propose des boutons « Accept Current Change » et « Accept Incoming Change ».

Des modifications sur des lignes éloignées d'un même fichier ne créent pas de conflit : Git les combine seul. Pour limiter les conflits : des branches courtes, fusionnées souvent.

**À essayer** : dans un dépôt de test, modifie la même ligne sur deux branches, puis fusionne.`,
          example: {
            code: `mkdir conflit && cd conflit
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "seuil = 0.5" > config.py && git add . && git commit -q -m "Seuil initial"
git switch -q -c reglage
echo "seuil = 0.7" > config.py && git commit -q -am "Monte le seuil"
git switch -q main
echo "seuil = 0.6" > config.py && git commit -q -am "Ajuste le seuil"
git merge reglage > /dev/null          # échoue : même ligne modifiée des deux côtés
git status --short
cat config.py`,
            output: `UU config.py
<<<<<<< HEAD
seuil = 0.6
=======
seuil = 0.7
>>>>>>> reglage`,
            notes: [
              { line: 9, text: 'Sans la redirection, Git afficherait « CONFLICT (content): Merge conflict in config.py ». > /dev/null masque ce message, qui varie selon la langue de Git.' },
              { line: 10, text: 'UU : le fichier est en conflit, modifié des deux côtés (Unmerged).' },
              { line: 11, text: 'HEAD (main) voulait 0.6, la branche reglage voulait 0.7 : à toi de trancher.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Tu es sur main et tu as lancé `git merge reglage`. Dans ce fichier en conflit, quelle version vient de la branche **reglage** ?',
              lang: 'text',
              code: `<<<<<<< HEAD
seuil = 0.6
=======
seuil = 0.7
>>>>>>> reglage`,
              choices: [
                'seuil = 0.7, entre ======= et >>>>>>> reglage',
                'seuil = 0.6, entre <<<<<<< HEAD et =======',
                'Les deux lignes viennent de reglage',
                'Aucune : Git a déjà gardé la version la plus récente'
              ],
              answer: 0,
              why: {
                1: 'HEAD désigne la branche courante, main : seuil = 0.6 est ta version.',
                2: 'Chaque partie vient d\'une branche différente : c\'est tout le principe du conflit.',
                3: 'Git ne choisit jamais à ta place en cas de conflit, même selon les dates.'
              },
              hint: 'HEAD désigne la branche sur laquelle tu te trouves.',
              explain: 'Le haut (jusqu\'à =======) est la version de HEAD, la branche courante ; le bas (jusqu\'à >>>>>>>) est celle de la branche fusionnée, ici reglage.'
            },
            {
              type: 'fill',
              prompt: 'Le conflit est résolu dans le fichier (ligne 7). Complète les deux commandes qui **terminent la fusion**.',
              code: `mkdir c && cd c && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "seuil = 0.5" > config.py && git add . && git commit -q -m "Seuil initial"
git switch -q -c reglage && echo "seuil = 0.7" > config.py && git commit -q -am "Monte le seuil"
git switch -q main && echo "seuil = 0.6" > config.py && git commit -q -am "Ajuste le seuil"
git merge reglage > /dev/null
echo "seuil = 0.65" > config.py       # résolution : un compromis, sans marqueurs
git ___ config.py
git ___ -q -m "Fusionne reglage"
git log --format=%s -n 1`,
              blanks: [
                {
                  answers: ['add'],
                  options: ['add', 'merge', 'restore', 'push'],
                  why: {
                    merge: 'Une fusion est déjà en cours : relancer git merge échoue tant que le conflit n\'est pas marqué comme résolu.',
                    restore: 'restore remettrait une version du fichier et perdrait ta résolution.',
                    push: 'push n\'a rien à voir avec la résolution locale du conflit.'
                  }
                },
                {
                  answers: ['commit'],
                  options: ['commit', 'merge', 'status', 'switch'],
                  why: {
                    merge: 'git merge --continue existe aussi, mais `git merge` seul ne termine pas la fusion.',
                    status: 'git status affiche l\'état sans rien enregistrer.',
                    switch: 'Git refuse de changer de branche pendant une fusion non terminée.'
                  }
                }
              ],
              output: 'Fusionne reglage',
              hint: 'Marquer le fichier comme résolu, puis enregistrer le commit de fusion.',
              explain: '`git add` indique à Git que le conflit de ce fichier est résolu, et `git commit` crée le commit de fusion. Avant git add, vérifie qu\'aucun marqueur ne reste dans le fichier.'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Les deux branches modifient le **même fichier**, mais pas la même ligne. Qu\'affiche ce script ?',
            code: `mkdir nc && cd nc
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
printf "a = 1\\nb = 2\\nc = 3\\n" > f.py && git add . && git commit -q -m "Base"
git switch -q -c x
printf "a = 10\\nb = 2\\nc = 3\\n" > f.py && git commit -q -am "Change a"
git switch -q main
printf "a = 1\\nb = 2\\nc = 30\\n" > f.py && git commit -q -am "Change c"
git merge -q x -m "Fusion" > /dev/null
cat f.py`,
            answer: `a = 10
b = 2
c = 30`,
            mistakes: [
              { answer: 'a = 1\nb = 2\nc = 30', why: 'La fusion a réussi : la modification de a, faite sur x, est intégrée à main.' },
              { answer: '<<<<<<< HEAD\na = 1\nb = 2\nc = 30\n=======\na = 10\nb = 2\nc = 3\n>>>>>>> x', why: 'Pas de conflit ici : les deux branches ont modifié des lignes différentes, séparées par une ligne inchangée.' }
            ],
            hint: 'Un conflit demande des modifications des mêmes lignes, ou de lignes qui se touchent.',
            explain: 'Git fusionne ligne par ligne à partir de l\'ancêtre commun : a vient de x, c vient de main, b n\'a pas changé. Le fichier combine les deux modifications, sans conflit.'
          },
          recap: [
            'Conflit = mêmes lignes modifiées des deux côtés ; git status affiche UU.',
            'Haut (HEAD) : ta branche ; bas (après =======) : la branche fusionnée.',
            'Résoudre : éditer, supprimer les marqueurs, `git add`, `git commit`.',
            '`git merge --abort` annule la fusion en cours.'
          ],
          check: {
            type: 'order',
            prompt: 'Remets dans l\'ordre les étapes pour intégrer feature/seuil dans main, avec un conflit à résoudre.',
            lines: [
              'git switch main',
              'git merge feature/seuil',
              'code config.py   # résoudre et supprimer les marqueurs',
              'git add config.py',
              'git commit -m "Fusionne feature/seuil"',
              'git branch -d feature/seuil'
            ],
            hint: 'On fusionne depuis la branche qui reçoit, on résout, on marque, on enregistre, puis on fait le ménage.',
            explain: 'Basculer sur main, fusionner, résoudre le conflit dans l\'éditeur (`code` ouvre VS Code), marquer le fichier comme résolu, créer le commit de fusion, puis supprimer la branche devenue inutile.'
          }
        }
      ]
    }
  ]
});
