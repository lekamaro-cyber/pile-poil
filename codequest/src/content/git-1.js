// Parcours Git et outils (1/4) : parcours et chapitre 1 « Le terminal ».
// Bash et Git ne s'exécutent pas dans CodeQuest : chaque leçon donne la commande à essayer sur ta machine.
// Le validateur exécute réellement les exemples et les exercices predict / fill / order / bug qui ont une sortie.
CQ.addTrack({
  id: 'git',
  title: 'Git et outils',
  lang: 'bash',
  summary: 'Maîtriser le terminal Bash, versionner ton code avec Git et collaborer sur GitHub, avec des repères pour qui vient de PowerShell.',
  why: 'Tous les projets de développement passent par un terminal et par Git : récupérer un projet, suivre ses modifications, travailler à plusieurs sans s\'écraser. Sur les serveurs Linux et dans les chaînes de déploiement, Bash est la langue commune.',
  requires: [],
  chapters: [
    {
      id: 'git.c1',
      title: 'Le terminal',
      units: [
        {
          id: 'git.u1',
          title: 'Terminal et fichiers',
          summary: 'Se repérer dans l\'arborescence et manipuler fichiers et dossiers en Bash, en partant de ce que tu sais en PowerShell.',
          lessons: [
            {
              id: 'git.u1.l1',
              title: 'Se repérer dans le terminal',
              minutes: 7,
              objective: 'Tu sais te déplacer dans l\'arborescence et lister des fichiers en Bash, en reliant chaque commande à son équivalent PowerShell.',
              explain: `Tu connais PowerShell ; Bash est son équivalent sous Linux et macOS, et l'outil de base des serveurs et du développement. Sous Windows, deux façons de l'avoir : **Git Bash**, installé avec Git for Windows, ou **WSL** (\`wsl --install\` dans un PowerShell administrateur), un vrai Linux intégré à Windows.

Les commandes de base ont leur équivalent : \`pwd\` (\`Get-Location\`), \`ls\` (\`Get-ChildItem\`), \`cd\` (\`Set-Location\`). PowerShell propose les alias \`ls\`, \`cd\` et \`pwd\`, mais les options diffèrent : \`ls -a\` affiche les fichiers cachés en Bash ; en PowerShell, c'est \`Get-ChildItem -Force\`.

Chemins : une seule racine \`/\`, pas de lettre de lecteur, et le séparateur est \`/\`. \`C:\\Users\\ada\` devient \`/c/Users/ada\` dans Git Bash et \`/mnt/c/Users/ada\` dans WSL. \`~\` désigne ton dossier personnel, \`.\` le dossier courant, \`..\` le dossier parent. Un chemin qui commence par \`/\` est absolu, sinon il est relatif au dossier courant. Linux distingue les majuscules : \`Notes.txt\` et \`notes.txt\` sont deux fichiers différents.

**À essayer** : ouvre Git Bash, tape \`pwd\`, puis \`ls -a\`, puis \`cd ..\` et à nouveau \`pwd\`.`,
              example: {
                code: `mkdir -p projet/donnees projet/src  # PowerShell : New-Item -ItemType Directory projet/src
cd projet                           # PowerShell : Set-Location projet
touch notes.md                      # crée un fichier vide
ls                                  # PowerShell : Get-ChildItem (alias ls, dir)
cd src                              # chemin relatif : le dossier src d'ici
ls ..                               # .. = le dossier parent, donc projet`,
                output: `donnees
notes.md
src
donnees
notes.md
src`,
                notes: [
                  { line: 1, text: '-p crée aussi les dossiers parents manquants, ici projet. Tu reverras mkdir et touch à la leçon suivante.' },
                  { line: 4, text: 'ls liste le dossier courant, trié par ordre alphabétique.' },
                  { line: 5, text: 'src ne commence pas par / : c\'est un chemin relatif, cherché dans le dossier courant (projet).' },
                  { line: 6, text: 'Depuis src, .. désigne projet : on obtient la même liste qu\'à la ligne 4.' }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: 'Tu es dans `/home/ada/projets/ia`. Quelle commande t\'amène dans `/home/ada/projets/web` ?',
                  choices: ['cd ../web', 'cd /web', 'cd web', 'cd ..\\web'],
                  answer: 0,
                  why: {
                    1: '`/web` commence par `/` : c\'est un chemin absolu, qui désigne un dossier web à la racine du système.',
                    2: '`web` est relatif au dossier courant : Bash cherche `/home/ada/projets/ia/web`.',
                    3: 'En Bash, l\'antislash n\'est pas un séparateur : il protège le caractère qui suit. `..\\web` devient `..web`, un dossier qui n\'existe pas.'
                  },
                  hint: 'Il faut d\'abord remonter d\'un niveau, puis descendre dans web.',
                  explain: '`..` remonte de ia à projets, puis `/web` descend dans le dossier voisin. Le séparateur de Bash est toujours la barre oblique `/`.'
                },
                {
                  type: 'predict',
                  prompt: 'Qu\'affiche ce script ?',
                  code: `mkdir -p labo/data labo/modeles
cd labo/data
touch train.csv test.csv
cd ../modeles
ls ../data`,
                  answer: `test.csv
train.csv`,
                  mistakes: [
                    { answer: 'train.csv\ntest.csv', why: 'ls trie les noms par ordre alphabétique, pas par ordre de création : « test » passe avant « train ».' },
                    { answer: 'data\nmodeles', why: 'Ce serait la sortie de `ls ..`. Ici, on liste `../data`, le contenu du dossier data.' }
                  ],
                  hint: 'Depuis modeles, où mène `../data` ? Et dans quel ordre ls affiche-t-il les fichiers ?',
                  explain: 'Depuis labo/modeles, `..` remonte dans labo, puis `data` désigne labo/data, qui contient les deux fichiers créés à la ligne 3. ls les affiche par ordre alphabétique, un par ligne quand la sortie n\'est pas un terminal.'
                }
              ],
              challenge: {
                type: 'logic',
                prompt: 'Tu es dans `/srv/app/logs`. Tu tapes la commande ci-dessous. Dans quel dossier te trouves-tu ensuite ? Donne le chemin absolu.',
                code: 'cd ../../data/./brut/..',
                answer: '/srv/data',
                accept: ['/srv/data/'],
                mistakes: [
                  { answer: '/srv/data/brut', why: 'Le dernier `..` remonte de brut vers son parent, data.' },
                  { answer: '/srv/app/data', why: 'Il y a deux `..` au début : on remonte de logs à app, puis de app à srv.' }
                ],
                hint: 'Traite le chemin morceau par morceau : `..` remonte, `.` ne bouge pas, un nom descend.',
                explain: '/srv/app/logs, puis `..` donne /srv/app, `..` donne /srv, `data` donne /srv/data, `.` ne change rien, `brut` donne /srv/data/brut, et `..` ramène à /srv/data.'
              },
              recap: [
                'Bash sous Windows : Git Bash (avec Git for Windows) ou WSL.',
                '`pwd`, `ls`, `cd` correspondent à Get-Location, Get-ChildItem, Set-Location.',
                'Chemins : séparateur `/`, racine unique `/`, `~` dossier personnel, `.` dossier courant, `..` parent.',
                'Un chemin qui commence par `/` est absolu ; Linux distingue majuscules et minuscules.'
              ],
              check: {
                type: 'fill',
                prompt: 'Complète les commandes Bash équivalentes aux commandes PowerShell en commentaire.',
                code: `# PowerShell : Set-Location ~/projets
___ ~/projets
# PowerShell : Get-ChildItem -Force   (avec les fichiers cachés)
___ -a
# PowerShell : Get-Location
___`,
                blanks: [
                  {
                    answers: ['cd'],
                    options: ['cd', 'pwd', 'ls', 'Set-Location'],
                    why: {
                      pwd: 'pwd affiche le dossier courant, il ne change pas de dossier.',
                      ls: 'ls liste un dossier sans s\'y déplacer.',
                      'Set-Location': 'Set-Location est la cmdlet PowerShell : Bash ne la connaît pas.'
                    }
                  },
                  {
                    answers: ['ls'],
                    options: ['ls', 'cat', 'show', 'Get-ChildItem'],
                    why: {
                      cat: 'cat affiche le contenu d\'un fichier, pas la liste d\'un dossier.',
                      show: 'show n\'est pas une commande Bash.',
                      'Get-ChildItem': 'Get-ChildItem est la cmdlet PowerShell : Bash ne la connaît pas.'
                    }
                  },
                  {
                    answers: ['pwd'],
                    options: ['pwd', 'cd', 'whoami', 'Get-Location'],
                    why: {
                      cd: 'cd sans argument ne t\'indique rien : il te ramène dans ton dossier personnel.',
                      whoami: 'whoami affiche ton nom d\'utilisateur, pas ton dossier courant.',
                      'Get-Location': 'Get-Location est la cmdlet PowerShell : Bash ne la connaît pas.'
                    }
                  }
                ],
                hint: 'Trois commandes de deux ou trois lettres : se déplacer, lister, afficher où l\'on est.',
                explain: '`cd` change de dossier, `ls -a` liste en incluant les fichiers cachés (ceux dont le nom commence par un point), `pwd` (print working directory) affiche le dossier courant.'
              }
            },
            {
              id: 'git.u1.l2',
              title: 'Créer, copier, déplacer, supprimer',
              minutes: 7,
              objective: 'Tu sais créer, copier, déplacer, renommer et supprimer des fichiers et dossiers en Bash, sans perdre de données par accident.',
              explain: `Les commandes de base, avec leur équivalent PowerShell :

- \`mkdir -p a/b\` crée un dossier et ses parents (\`New-Item -ItemType Directory\`) ; \`touch f.txt\` crée un fichier vide.
- \`cp source cible\` copie (\`Copy-Item\`) ; pour un dossier : \`cp -r\` (\`-Recurse\`).
- \`mv source cible\` déplace **ou renomme** (\`Move-Item\`, \`Rename-Item\`).
- \`rm f.txt\` supprime (\`Remove-Item\`) ; \`rm -r dossier\` supprime un dossier et son contenu.
- \`cat f.txt\` affiche un fichier (\`Get-Content\`) ; \`head -n 5 f.txt\` ses 5 premières lignes.

Les pièges : il n'y a **pas de corbeille**, \`rm\` est définitif et \`rm -rf\` ne demande rien. \`cp\` et \`mv\` **écrasent** la cible sans prévenir (l'option \`-i\` demande confirmation). Un nom qui contient des espaces se met entre guillemets, \`rm "mes notes.txt"\`, sinon Bash voit deux fichiers. Enfin, un joker comme \`*.csv\` est remplacé par la liste des fichiers **par Bash**, avant que la commande ne s'exécute.

**À essayer** : dans un dossier de test, crée \`a.txt\` avec \`touch\`, copie-le, renomme la copie avec \`mv\`, puis supprime-la.`,
              example: {
                code: `mkdir -p rapport/brouillons && cd rapport
echo "Résultats du modèle" > resultats.txt   # écrit une ligne dans un fichier (unité 2)
cp resultats.txt brouillons/copie.txt        # PowerShell : Copy-Item
mv resultats.txt final.txt                   # renommer = déplacer ; PowerShell : Move-Item
rm brouillons/copie.txt                      # PowerShell : Remove-Item (pas de corbeille)
ls
cat final.txt                                # PowerShell : Get-Content`,
                output: `brouillons
final.txt
Résultats du modèle`,
                notes: [
                  { line: 1, text: '`&&` enchaîne deux commandes : la seconde ne s\'exécute que si la première a réussi.' },
                  { line: 4, text: 'mv vers un nouveau nom dans le même dossier : c\'est un renommage.' },
                  { line: 5, text: 'Le fichier est supprimé définitivement, sans passer par une corbeille.' },
                  { line: 7, text: 'cat affiche le contenu du fichier renommé.' }
                ]
              },
              exercises: [
                {
                  type: 'fill',
                  prompt: 'Complète le script : crée `projet/src/utils` d\'un coup, copie le **dossier** `data` vers `sauvegarde`, et renomme `brouillon.md` en `notes.md`.',
                  code: `mkdir tri && cd tri && mkdir data && touch data/train.csv brouillon.md
mkdir ___ projet/src/utils
cp ___ data sauvegarde
mv brouillon.md ___
ls`,
                  blanks: [
                    {
                      answers: ['-p'],
                      options: ['-p', '-r', '-f', '-a'],
                      why: {
                        '-r': 'mkdir n\'a pas d\'option -r : c\'est -p (parents) qui crée les dossiers intermédiaires.',
                        '-f': 'mkdir n\'a pas d\'option -f.',
                        '-a': 'mkdir n\'a pas d\'option -a.'
                      }
                    },
                    {
                      answers: ['-r', '-R'],
                      options: ['-r', '-p', '-f', '-i'],
                      why: {
                        '-p': 'cp -p conserve les dates et les droits, mais ne copie pas un dossier : « -r not specified; omitting directory ».',
                        '-f': 'cp -f force l\'écrasement, mais ne copie toujours pas un dossier.',
                        '-i': 'cp -i demande confirmation avant d\'écraser ; il ne copie pas un dossier.'
                      }
                    },
                    {
                      answers: ['notes.md'],
                      why: { 'brouillon.md': 'Il faut donner le nouveau nom comme cible de mv.' }
                    }
                  ],
                  output: `data
notes.md
projet
sauvegarde`,
                  hint: 'Une option pour les dossiers parents, une option récursive, puis le nouveau nom.',
                  explain: '`mkdir -p` crée projet, src et utils en une fois ; `cp -r` copie un dossier avec tout son contenu (équivalent de `Copy-Item -Recurse`) ; `mv ancien nouveau` renomme.'
                },
                {
                  type: 'predict',
                  prompt: 'Qu\'affiche ce script ?',
                  code: `mkdir essai && cd essai
echo "v1" > config.txt
cp config.txt config.bak
echo "v2" > config.txt
mv config.bak config.txt
cat config.txt`,
                  answer: 'v1',
                  mistakes: [
                    { answer: 'v2', why: 'mv écrase la cible sans prévenir : config.txt (v2) est remplacé par la sauvegarde config.bak, qui contient v1.' }
                  ],
                  hint: 'Suis le contenu de chaque fichier ligne par ligne. Que fait mv quand la cible existe déjà ?',
                  explain: 'config.bak garde v1 ; config.txt passe à v2 ; puis mv renomme config.bak en config.txt en écrasant la version v2, sans demander. Avec `mv -i`, Bash aurait demandé confirmation.'
                }
              ],
              challenge: {
                type: 'bug',
                prompt: 'Ce script doit supprimer le fichier « vieux brouillon.txt » et garder « garder.txt ». Il affiche deux erreurs et le fichier est toujours là. Clique sur la ligne fautive.',
                code: `mkdir menage && cd menage
touch "vieux brouillon.txt" garder.txt
rm vieux brouillon.txt
ls`,
                bugLine: 3,
                why: 'Sans guillemets, Bash coupe la commande aux espaces : rm reçoit deux noms, « vieux » et « brouillon.txt », qui n\'existent pas.',
                fixes: ['rm "vieux brouillon.txt"', 'rm vieux_brouillon.txt', 'rm -r vieux brouillon.txt', 'rm -f vieux brouillon.txt'],
                fixAnswer: 0,
                fixWhy: {
                  1: 'Le fichier s\'appelle avec un espace, pas avec un tiret bas : ce nom n\'existe pas.',
                  2: '-r sert aux dossiers ; le nom est toujours coupé en deux.',
                  3: '-f masque les erreurs, mais rm cherche toujours « vieux » et « brouillon.txt » : le fichier reste.'
                },
                output: 'garder.txt',
                hint: 'Regarde comment le fichier a été créé à la ligne 2.',
                explain: 'Les guillemets font de « vieux brouillon.txt » un seul argument. Sous Windows, tu croiseras souvent ce cas avec des chemins comme « Program Files » ; la touche Tab complète le nom et ajoute les protections nécessaires.'
              },
              recap: [
                '`mkdir -p`, `touch`, `cp` (`-r` pour un dossier), `mv` (déplacer ou renommer), `rm` (`-r` pour un dossier), `cat`.',
                'Pas de corbeille : rm est définitif, rm -rf ne demande rien.',
                'cp et mv écrasent la cible sans prévenir ; `-i` demande confirmation.',
                'Un nom avec des espaces se met entre guillemets.'
              ],
              check: {
                type: 'qcm',
                prompt: 'Quelle commande Bash correspond à `Remove-Item .\\cache -Recurse -Force` ?',
                choices: ['rm -rf cache', 'rm cache', 'rmdir cache', 'del /s cache'],
                answer: 0,
                why: {
                  1: 'Sans -r, rm refuse de supprimer un dossier : « Is a directory ».',
                  2: 'rmdir ne supprime qu\'un dossier vide.',
                  3: 'del /s appartient à l\'invite de commandes cmd.exe de Windows ; elle n\'existe pas en Bash.'
                },
                hint: 'Il faut une option pour le contenu du dossier et une pour ne rien demander.',
                explain: '-r (récursif) supprime le dossier et tout son contenu, -f (force) ne demande rien : l\'équivalent de -Recurse -Force. Relis toujours une commande rm -rf avant d\'appuyer sur Entrée.'
              }
            }
          ]
        },
        {
          id: 'git.u2',
          title: 'Commandes essentielles',
          summary: 'Enchaîner des commandes, rediriger leur sortie, utiliser variables, droits et scripts.',
          lessons: [
            {
              id: 'git.u2.l1',
              title: 'Pipes et redirections : du texte, pas des objets',
              minutes: 8,
              objective: 'Tu sais enchaîner des commandes avec le pipe et rediriger leur sortie dans un fichier, en sachant qu\'en Bash le pipe transporte du texte.',
              explain: `Le pipe \`|\` envoie la sortie d'une commande à l'entrée de la suivante, comme en PowerShell. Différence majeure : en PowerShell, le pipe transporte des **objets** (\`Get-Process | Sort-Object CPU\` trie sur une propriété) ; en Bash, il transporte du **texte**, ligne par ligne. On travaille donc avec des outils qui filtrent et découpent des lignes :

- \`grep motif\` garde les lignes qui contiennent le motif (\`Select-String\`) ; \`grep -c\` les compte ;
- \`sort\` trie (\`-n\` numérique, \`-r\` inverse) ; \`uniq -c\` compte les lignes identiques **consécutives**, d'où le \`sort\` placé avant ;
- \`wc -l\` compte les lignes (\`Measure-Object -Line\`) ; \`head\` et \`tail\` gardent le début ou la fin (\`Select-Object -First\`, \`-Last\`) ; \`cut\` découpe des colonnes.

Redirections : \`>\` écrit la sortie dans un fichier en l'**écrasant**, \`>>\` ajoute à la fin, \`2>\` redirige les messages d'erreur.

**À essayer** : \`history | grep git | tail -n 5\` affiche tes 5 dernières commandes contenant « git ».`,
              example: {
                code: `mkdir logs && cd logs
printf "INFO start\\nERROR disk full\\nINFO request\\nERROR timeout\\nERROR disk full\\n" > app.log
grep ERROR app.log | sort | uniq -c | sort -rn
grep -c INFO app.log
# PowerShell : Select-String ERROR app.log | Group-Object Line | Sort-Object Count -Descending`,
                output: `      2 ERROR disk full
      1 ERROR timeout
2`,
                notes: [
                  { line: 2, text: 'printf écrit cinq lignes (\\n = retour à la ligne) dans app.log, un journal d\'application.' },
                  { line: 3, text: 'grep garde les erreurs, sort les regroupe, uniq -c compte chaque ligne identique, sort -rn trie par nombre décroissant.' },
                  { line: 4, text: 'grep -c compte directement les lignes qui contiennent INFO.' },
                  { line: 5, text: 'En PowerShell, on manipule des objets et leurs propriétés (Line, Count) au lieu de texte.' }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: 'En PowerShell, `Get-ChildItem | Sort-Object Length` trie les fichiers par taille. Pourquoi `ls -l | sort` ne le fait-il pas en Bash ?',
                  choices: [
                    'sort reçoit des lignes de texte et les trie alphabétiquement depuis le début de la ligne : il faut lui indiquer la colonne et le tri numérique (sort -k5 -n)',
                    'sort ne peut pas lire ce qui arrive par un pipe',
                    'ls -l n\'affiche pas la taille des fichiers',
                    'Bash trie toujours par date de modification'
                  ],
                  answer: 0,
                  why: {
                    1: 'sort lit très bien son entrée depuis un pipe : c\'est même son usage le plus courant.',
                    2: 'ls -l affiche bien la taille, en 5e colonne, mais au milieu d\'une ligne de texte.',
                    3: 'sort ne connaît pas les dates : il compare des caractères.'
                  },
                  hint: 'Qu\'est-ce qui circule dans un pipe Bash : un objet avec des propriétés, ou une ligne de texte ?',
                  explain: 'Le texte n\'a pas de propriétés : `sort -k5 -n` trie sur la 5e colonne, en nombres. Pour ce cas précis, `ls -lS` trie directement par taille.'
                },
                {
                  type: 'predict',
                  prompt: 'Le fichier contient les étiquettes d\'un jeu de données d\'images. Qu\'affiche ce script ?',
                  code: `mkdir data && cd data
printf "chat\\nchien\\nchat\\noiseau\\nchat\\n" > etiquettes.txt
sort etiquettes.txt | uniq | wc -l`,
                  answer: '3',
                  mistakes: [
                    { answer: '5', why: 'uniq retire les doublons de la liste triée : il ne reste que les étiquettes différentes.' },
                    { answer: 'chat\nchien\noiseau', why: 'Ce serait la sortie de `sort | uniq`. wc -l, en bout de chaîne, compte ces lignes au lieu de les afficher.' }
                  ],
                  hint: 'Suis le texte à chaque étape du pipe : trié, dédoublonné, puis compté.',
                  explain: 'sort regroupe les lignes identiques, uniq n\'en garde qu\'un exemplaire, wc -l compte les lignes restantes : 3 classes différentes. C\'est un contrôle rapide avant d\'entraîner un modèle.'
                }
              ],
              challenge: {
                type: 'order',
                prompt: 'Remets les lignes dans l\'ordre : le script doit afficher les 2 étiquettes les plus fréquentes, avec leur nombre, en passant par des fichiers intermédiaires.',
                lines: [
                  'mkdir data && cd data',
                  'printf "chat\\nchien\\nchat\\noiseau\\nchat\\nchien\\n" > etiquettes.txt',
                  'sort etiquettes.txt > triees.txt',
                  'uniq -c triees.txt > comptes.txt',
                  'sort -rn comptes.txt > classement.txt',
                  'head -n 2 classement.txt'
                ],
                output: `      3 chat
      2 chien`,
                hint: 'Chaque commande lit le fichier écrit par la précédente.',
                explain: 'Trier, compter les lignes identiques, trier par nombre décroissant, garder le début. Avec des pipes, tout tient sur une ligne : `sort etiquettes.txt | uniq -c | sort -rn | head -n 2`.'
              },
              recap: [
                'Le pipe `|` passe la sortie d\'une commande à la suivante ; en Bash, c\'est du texte, en PowerShell des objets.',
                'grep filtre, sort trie, uniq -c compte (après sort), wc -l compte les lignes, head / tail coupent.',
                '`>` écrase un fichier, `>>` ajoute à la fin, `2>` redirige les erreurs.'
              ],
              check: {
                type: 'fill',
                prompt: 'Complète le script pour qu\'il affiche **3** : les deux lignes ERROR du journal, plus une alerte ajoutée à la main, comptées à la fin.',
                code: `mkdir tri && cd tri
printf "ERROR db\\nINFO ok\\nERROR api\\n" > app.log
grep ERROR app.log ___ erreurs.txt
echo "WARN lent" ___ erreurs.txt
cat erreurs.txt ___ wc -l`,
                blanks: [
                  {
                    answers: ['>'],
                    options: ['>', '>>', '|', '<'],
                    why: {
                      '>>': 'Ici, `>>` donnerait le même résultat car le fichier n\'existe pas encore ; mais `>` exprime « créer ou remplacer », et c\'est ce qu\'on veut à la première écriture.',
                      '|': 'Un pipe envoie la sortie à une commande, pas dans un fichier : Bash chercherait une commande nommée erreurs.txt.',
                      '<': '`<` lit un fichier en entrée, il n\'écrit rien.'
                    }
                  },
                  {
                    answers: ['>>'],
                    options: ['>>', '>', '|', '<'],
                    why: {
                      '>': '`>` écraserait le fichier : il ne resterait que « WARN lent », et le script afficherait 1.',
                      '|': 'echo enverrait son texte à une commande nommée erreurs.txt, qui n\'existe pas.',
                      '<': '`<` sert à lire un fichier, pas à y écrire.'
                    }
                  },
                  {
                    answers: ['|'],
                    options: ['|', '>', '>>', '<'],
                    why: {
                      '>': 'La sortie de cat irait dans un fichier nommé wc, et rien ne serait compté.',
                      '>>': 'Même problème : la sortie serait ajoutée à un fichier nommé wc.',
                      '<': 'cat lirait un fichier nommé wc, qui n\'existe pas.'
                    }
                  }
                ],
                output: '3',
                hint: 'Créer le fichier, ajouter à la fin, puis passer le contenu à une autre commande.',
                explain: '`>` crée erreurs.txt avec les 2 lignes ERROR, `>>` ajoute une 3e ligne sans effacer les autres, et `|` passe le contenu à wc -l, qui compte 3 lignes.'
              }
            },
            {
              id: 'git.u2.l2',
              title: 'Variables d\'environnement, droits et scripts',
              minutes: 8,
              objective: 'Tu sais définir et lire une variable d\'environnement en Bash, lire les droits d\'un fichier et rendre un script exécutable.',
              explain: `Une variable se crée avec \`NOM=valeur\`, **sans espace** autour du \`=\`, et se lit avec \`$NOM\`. \`export NOM=valeur\` en fait une **variable d'environnement**, transmise aux programmes lancés ensuite (Python, Node, Git…). En PowerShell : \`$env:NOM = "valeur"\`. Entoure les variables de guillemets doubles (\`"$NOM"\`) pour qu'un espace ne coupe pas la valeur en deux ; entre guillemets simples, \`$NOM\` n'est pas remplacé.

\`PATH\` liste les dossiers où le shell cherche les commandes, séparés par \`:\` (par \`;\` sous Windows, dans \`$env:Path\`).

Droits : \`ls -l\` affiche par exemple \`-rwxr-xr--\` : lecture (r), écriture (w), exécution (x), pour le propriétaire, puis le groupe, puis les autres. C'est plus simple que les ACL NTFS (\`Get-Acl\`, \`icacls\`). \`chmod +x script.sh\` rend un script exécutable, \`./script.sh\` le lance. \`sudo commande\` exécute **une** commande en administrateur, comme « Exécuter en tant qu'administrateur ».

**À essayer** : \`echo $HOME\` et \`echo $PATH\` dans Git Bash, puis \`$env:Path\` dans PowerShell.`,
              example: {
                code: `mkdir outils && cd outils
MODELE="resnet18"                 # variable du shell : pas d'espace autour de =
export EPOCHS=5                   # variable d'environnement, transmise aux programmes
cat > train.sh <<'FIN'
#!/usr/bin/env bash
echo "Entraînement de $1 pendant $EPOCHS epochs"
FIN
chmod +x train.sh                 # ajoute le droit d'exécution
./train.sh "$MODELE"              # $1 vaudra resnet18 dans le script
ls -l train.sh | cut -c1-10       # type de fichier et droits`,
                output: `Entraînement de resnet18 pendant 5 epochs
-rwxr-xr-x`,
                notes: [
                  { line: 4, text: 'cat > fichier <<\'FIN\' écrit les lignes suivantes dans train.sh, jusqu\'à la ligne FIN.' },
                  { line: 5, text: 'La première ligne (shebang) indique quel programme doit exécuter le script.' },
                  { line: 9, text: 'Le script lit son argument dans $1 et EPOCHS dans son environnement, grâce à export.' },
                  { line: 10, text: 'rwx pour le propriétaire, r-x pour le groupe et les autres : tout le monde peut lire et exécuter.' }
                ]
              },
              exercises: [
                {
                  type: 'fill',
                  prompt: 'Complète les équivalents Bash des commandes PowerShell en commentaire.',
                  code: `# PowerShell : $env:API_URL = "https://api.codequest.test"
___ API_URL="https://api.codequest.test"
# PowerShell : Write-Output $env:API_URL
echo ___`,
                  blanks: [
                    {
                      answers: ['export'],
                      options: ['export', 'set', '$env:', 'var'],
                      why: {
                        set: 'En Bash, set change les options du shell ou les paramètres $1, $2… : il ne crée pas de variable d\'environnement.',
                        '$env:': '$env: est la syntaxe de PowerShell ; Bash ne la comprend pas.',
                        var: 'var appartient à JavaScript.'
                      }
                    },
                    {
                      answers: ['"$API_URL"', '$API_URL', '${API_URL}', '"${API_URL}"'],
                      why: {
                        API_URL: 'Sans $, echo affiche le texte « API_URL » lui-même.',
                        "'$API_URL'": 'Entre guillemets simples, Bash ne remplace pas la variable : echo affiche $API_URL tel quel.',
                        '$env:API_URL': '$env: est la syntaxe PowerShell. Bash lit $env (vide) suivi de « :API_URL ».'
                      }
                    }
                  ],
                  output: 'https://api.codequest.test',
                  hint: 'Un mot-clé transmet la variable aux programmes ; pour la lire, on la préfixe d\'un symbole.',
                  explain: '`export NOM=valeur` crée une variable d\'environnement ; `"$NOM"` la lit. Les guillemets doubles protègent la valeur si elle contient des espaces.'
                },
                {
                  type: 'bug',
                  prompt: 'Ce script, écrit par réflexe PowerShell, devrait afficher « Projet : codequest ». Il affiche « Projet : » suivi d\'une erreur. Clique sur la ligne fautive.',
                  code: `PROJET = "codequest"
echo "Projet : $PROJET"`,
                  bugLine: 1,
                  why: 'Avec des espaces autour de `=`, Bash comprend « exécute la commande PROJET avec les arguments = et codequest » : « PROJET: command not found ». La variable n\'est jamais créée.',
                  fixes: ['PROJET="codequest"', '$PROJET = "codequest"', 'set PROJET = "codequest"', 'PROJET == "codequest"'],
                  fixAnswer: 0,
                  fixWhy: {
                    1: 'C\'est la syntaxe PowerShell. Bash remplace d\'abord $PROJET par sa valeur (vide), puis tente d\'exécuter la commande `=` : erreur.',
                    2: 'set ne crée pas de variable en Bash : il remplace les paramètres $1, $2, $3 par « PROJET », « = » et « codequest ».',
                    3: 'Bash cherche toujours une commande nommée PROJET : « command not found ».'
                  },
                  output: 'Projet : codequest',
                  hint: 'En Bash, les espaces séparent une commande de ses arguments. Où ne faut-il surtout pas en mettre ?',
                  explain: '`NOM=valeur`, collé, est une affectation. C\'est l\'erreur la plus fréquente quand on vient de PowerShell, où `$NOM = "valeur"` est la règle.'
                }
              ],
              challenge: {
                type: 'predict',
                prompt: 'La dernière ligne lance un **nouveau** Bash qui affiche deux variables. Qu\'affiche ce script ?',
                code: `VILLE="Lyon"
export PAYS="France"
bash -c 'echo "ville=$VILLE pays=$PAYS"'`,
                answer: 'ville= pays=France',
                mistakes: [
                  { answer: 'ville=Lyon pays=France', why: 'VILLE n\'est pas exportée : elle n\'existe que dans le shell courant. Le nouveau Bash ne la reçoit pas.' },
                  { answer: 'ville=$VILLE pays=$PAYS', why: 'Les guillemets simples empêchent le shell courant de remplacer les variables, mais le nouveau Bash, lui, les remplace en exécutant echo.' }
                ],
                hint: 'Quelles variables un programme lancé depuis le shell reçoit-il ?',
                explain: 'Seules les variables exportées passent aux programmes lancés. Le nouveau Bash trouve PAYS dans son environnement, mais pas VILLE, remplacée par une chaîne vide. C\'est pourquoi une clé d\'API se transmet à un script Python avec export.'
              },
              recap: [
                '`NOM=valeur` sans espace ; `$NOM` pour lire ; `"$NOM"` pour protéger les espaces.',
                '`export` transmet la variable aux programmes lancés (PowerShell : `$env:NOM`).',
                'PATH liste les dossiers des commandes, séparés par `:`.',
                'Droits rwx pour propriétaire, groupe, autres ; `chmod +x` puis `./script.sh`.'
              ],
              check: {
                type: 'qcm',
                prompt: '`ls -l deploy.sh` affiche `-rw-r--r--`. Que se passe-t-il quand tu tapes `./deploy.sh`, et comment corriger ?',
                choices: [
                  'Bash répond « Permission denied » : le fichier n\'a pas le droit x. On corrige avec chmod +x deploy.sh',
                  'Le script s\'exécute normalement : le droit r suffit pour lancer un script',
                  'Bash répond « command not found » : il faut ajouter le dossier au PATH',
                  'Il suffit de lancer sudo ./deploy.sh'
                ],
                answer: 0,
                why: {
                  1: 'r permet de lire le fichier, pas de l\'exécuter comme un programme. (`bash deploy.sh` marcherait, car c\'est alors bash qui lit le fichier.)',
                  2: 'Avec ./, le chemin est explicite : le PATH n\'intervient pas. Le refus vient des droits.',
                  3: 'Même l\'administrateur ne peut pas exécuter un fichier qui n\'a aucun droit x : sudo répond « command not found ». Et contourner un problème de droits avec sudo est une mauvaise habitude.'
                },
                hint: 'Lis les trois premiers caractères de droits : lequel manque pour exécuter ?',
                explain: '-rw-r--r-- : lecture et écriture pour le propriétaire, lecture pour les autres, mais aucun x. `chmod +x deploy.sh` ajoute l\'exécution, et ls -l affiche alors -rwxr-xr-x.'
              }
            }
          ]
        }
      ]
    }
  ]
});
