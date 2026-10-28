// Parcours Git et outils (3/4) : chapitre 3 « Collaborer ».
// Les exemples simulent GitHub avec un dépôt local « nu » (git init --bare) : ils tournent sans Internet.
CQ.addChapter('git', {
  id: 'git.c3',
  title: 'Collaborer',
  units: [
    {
      id: 'git.u8',
      title: 'GitHub',
      summary: 'Partager un dépôt, envoyer et récupérer des commits, proposer des modifications par pull request.',
      lessons: [
        {
          id: 'git.u8.l1',
          title: 'Dépôts distants : clone, push et pull',
          minutes: 8,
          objective: 'Tu sais relier un dépôt local à un dépôt distant, envoyer tes commits avec push et récupérer ceux des autres avec pull.',
          explain: `Un **dépôt distant** (remote) est une copie du dépôt hébergée ailleurs : GitHub, GitLab, Azure DevOps ou un serveur de l'entreprise. Par convention, le principal s'appelle \`origin\`.

- \`git clone URL\` copie un dépôt **avec tout son historique** et configure origin ;
- \`git remote -v\` liste les dépôts distants ; \`git remote add origin URL\` en ajoute un à un dépôt créé avec git init ;
- \`git push\` envoie tes commits ; la première fois, \`git push -u origin main\` relie ta branche main à celle d'origin ;
- \`git pull\` récupère les commits des autres et les intègre : c'est \`git fetch\` (télécharger) suivi d'une fusion.

Si le distant contient des commits que tu n'as pas, ton push est **refusé** (« rejected… fetch first ») : fais d'abord un pull, résous les éventuels conflits, puis pousse. Quand les deux côtés ont avancé, Git demande de choisir comment intégrer : \`git pull --no-rebase\` fusionne (ou, une fois pour toutes, \`git config --global pull.rebase false\`).

Pour t'authentifier sur GitHub, pas de mot de passe : sous Windows, Git Credential Manager (installé avec Git for Windows) ouvre le navigateur ; sinon, un jeton personnel ou une clé SSH.

**À essayer** : un dépôt distant peut être un simple dossier créé avec \`git init --bare\`. L'exemple le fait, sans Internet.`,
          example: {
            code: `git init -q --bare -b main github.git        # un dépôt distant « nu », comme sur GitHub
mkdir ada && cd ada && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "# Projet" > README.md && git add . && git commit -q -m "Premier commit"
git remote add origin ../github.git          # sur GitHub : https://github.com/ada/projet.git
git push -q -u origin main                   # envoie main et la relie à origin/main
cd .. && git clone -q github.git linus       # Linus récupère tout l'historique
cd linus && git log --format="%an : %s"`,
            output: 'Ada : Premier commit',
            notes: [
              { line: 1, text: 'Un dépôt « nu » (bare) n\'a pas de dossier de travail : il sert seulement à recevoir et à distribuer des commits, comme GitHub.' },
              { line: 5, text: 'origin est un simple nom pour l\'adresse du dépôt distant.' },
              { line: 6, text: '-u mémorise le lien : ensuite, git push et git pull suffisent, sans préciser origin main.' },
              { line: 8, text: 'Le clone de Linus contient le commit d\'Ada, avec son auteur et son message.' }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: 'Complète les commandes décrites en commentaire.',
              code: `git ___ https://github.com/ada/detecteur-spam.git   # copie le dépôt et son historique
cd detecteur-spam
git remote ___                                      # liste les dépôts distants et leurs adresses
git ___ -u origin main                              # envoie main, la première fois`,
              blanks: [
                {
                  answers: ['clone'],
                  options: ['clone', 'pull', 'init', 'fetch'],
                  why: {
                    pull: 'pull met à jour un dépôt qui existe déjà ; ici, tu n\'as encore rien en local.',
                    init: 'init crée un dépôt vide ; il ne télécharge rien.',
                    fetch: 'fetch télécharge les nouveautés d\'un remote déjà configuré, dans un dépôt existant.'
                  }
                },
                {
                  answers: ['-v'],
                  options: ['-v', 'add', 'list', '--all'],
                  why: {
                    add: '`git remote add` ajoute un dépôt distant ; il faudrait un nom et une adresse.',
                    list: '`git remote list` n\'existe pas : sans option, git remote affiche les noms, et -v ajoute les adresses.',
                    '--all': 'git remote n\'a pas d\'option --all.'
                  }
                },
                {
                  answers: ['push'],
                  options: ['push', 'pull', 'commit', 'send'],
                  why: {
                    pull: 'pull récupère des commits, il n\'en envoie pas.',
                    commit: 'commit enregistre en local ; rien ne part sur GitHub.',
                    send: 'git send n\'existe pas.'
                  }
                }
              ],
              hint: 'Copier un dépôt, afficher les remotes en détail, envoyer des commits.',
              explain: '`git clone` crée le dossier et configure origin ; `git remote -v` affiche les adresses (une pour fetch, une pour push) ; `git push -u origin main` publie main et mémorise le lien.'
            },
            {
              type: 'predict',
              prompt: 'Ada et Linus partagent un dépôt distant. Qu\'affiche la dernière commande, lancée dans le dépôt d\'Ada ?',
              code: `git init -q --bare -b main depot.git
mkdir ada && cd ada && git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "v1" > app.py && git add . && git commit -q -m "Première version"
git remote add origin ../depot.git && git push -q -u origin main
cd .. && git clone -q depot.git linus && cd linus
git config user.name "Linus" && git config user.email "linus@example.com"
echo "Doc" > doc.md && git add . && git commit -q -m "Ajoute la doc" && git push -q
cd ../ada && git pull -q
git log --format="%an : %s"`,
              answer: `Linus : Ajoute la doc
Ada : Première version`,
              mistakes: [
                { answer: 'Ada : Première version', why: 'Ce serait le cas sans `git pull`. À la ligne 9, Ada récupère le commit que Linus a poussé.' },
                { answer: 'Ada : Première version\nLinus : Ajoute la doc', why: 'git log affiche le plus récent en premier : le commit de Linus, venu après.' }
              ],
              hint: 'Suis les commits : qui pousse quoi, et qui récupère quoi ?',
              explain: 'Linus clone, commite et pousse. Ada, qui n\'a rien changé entre-temps, récupère son commit par pull : une simple avance rapide. Son historique contient les deux commits, le plus récent en haut.'
            }
          ],
          challenge: {
            type: 'qcm',
            prompt: '`git push` répond `! [rejected] main -> main (fetch first)`. Que fais-tu ?',
            choices: [
              'Je récupère et j\'intègre d\'abord les commits distants (git pull), je résous un éventuel conflit, puis je refais git push',
              'git push --force, pour que ma version passe',
              'Je supprime mon dossier local et je reclone le dépôt',
              'Je refais le commit avec git commit --amend, puis git push'
            ],
            answer: 0,
            why: {
              1: '--force écrase le dépôt distant avec ta version : les commits de tes collègues disparaissent. À proscrire sur une branche partagée.',
              2: 'Recloner te ferait perdre tes commits pas encore poussés.',
              3: 'Modifier ton commit ne change rien au problème : il manque toujours chez toi les commits du distant.'
            },
            hint: 'Le message dit que le distant contient du travail que tu n\'as pas encore.',
            explain: 'Le refus protège le travail des autres. Tu intègres leurs commits (pull, avec fusion), tu vérifies que tout fonctionne, puis tu pousses : ton push contient alors les deux historiques.'
          },
          recap: [
            '`git clone URL` copie un dépôt avec son historique et configure origin.',
            '`git push -u origin main` la première fois, puis `git push`.',
            '`git pull` = fetch + intégration ; avec des branches divergentes, `git pull --no-rebase` fusionne.',
            'Push refusé : pull d\'abord, jamais --force sur une branche partagée.'
          ],
          check: {
            type: 'logic',
            prompt: 'Ta branche main a **2 commits** que origin/main n\'a pas, et origin/main a **1 commit** que tu n\'as pas. Tu lances `git pull --no-rebase`, sans conflit. Combien de commits ta branche main a-t-elle **gagnés** ?',
            code: 'git pull --no-rebase',
            answer: '2',
            accept: ['deux'],
            mistakes: [
              { answer: '1', why: 'Le commit distant arrive, mais les deux historiques ont divergé : la fusion crée aussi un commit de fusion.' },
              { answer: '3', why: 'Tes 2 commits étaient déjà sur ta branche : ils ne sont pas « gagnés ».' }
            ],
            hint: 'pull = fetch + merge. Que crée un merge quand les deux côtés ont avancé ?',
            explain: 'Le commit distant rejoint ta branche, et la fusion à trois voies crée un commit de fusion : 2 commits de plus. Tu peux ensuite pousser, le distant étant désormais contenu dans ton historique.'
          }
        },
        {
          id: 'git.u8.l2',
          title: 'Pull requests et forks',
          minutes: 8,
          objective: 'Tu sais proposer une modification par pull request, et contribuer à un projet dont tu n\'es pas membre grâce à un fork.',
          explain: `Dans une équipe, on ne pousse pas directement sur main : on propose. Une **pull request** (PR ; « merge request » sur GitLab) demande, sur GitHub, la fusion d'une branche dans main. Elle réunit la description du changement, la discussion, la **revue de code** et les tests automatiques (CI) avant la fusion.

Le déroulé : créer une branche, faire ses commits, la pousser (\`git push -u origin fix/accents\`), puis ouvrir la PR sur GitHub, ou avec \`gh pr create\` (l'outil en ligne de commande GitHub CLI). Si un relecteur demande une correction, tu fais un nouveau commit sur la même branche et tu pousses : la PR se met à jour toute seule. Une fois approuvée, la PR est fusionnée, soit par un commit de fusion classique, soit en « squash », qui regroupe tous ses commits en un seul. Ensuite : \`git switch main\`, \`git pull\`, et suppression de la branche.

Un **fork** est ta copie personnelle, sur GitHub, d'un dépôt où tu n'as pas le droit d'écrire (un projet open source). Tu clones ton fork, tu y pousses ta branche, puis tu ouvres la PR vers le dépôt d'origine.

**À essayer** : sur GitHub, ouvre l'onglet « Pull requests » d'un projet open source que tu utilises et lis une PR fusionnée, avec ses commentaires.`,
          example: {
            run: false,
            code: `git switch -c fix/accents-csv
# ... modifications du code, puis :
git commit -am "Corrige l'encodage des accents dans l'export CSV"
git push -u origin fix/accents-csv
gh pr create --title "Corrige l'encodage CSV" --body "Les accents étaient perdus (issue #42)."
# Après la revue et la fusion sur GitHub :
git switch main
git pull
git branch -d fix/accents-csv`,
            notes: [
              { line: 1, text: 'Une branche par sujet, au nom explicite.' },
              { line: 4, text: 'La branche est publiée sur origin : elle devient visible sur GitHub.' },
              { line: 5, text: 'GitHub CLI ouvre la PR sans quitter le terminal ; le bouton « Compare & pull request » de GitHub fait la même chose.' },
              { line: 9, text: 'Après une fusion « squash », Git peut refuser -d (les commits de la branche ne sont pas dans main tels quels) : -D force alors la suppression.' }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: 'Tu veux corriger un exemple dans la documentation du projet open source projet/scikit-mini, dont tu n\'es pas membre. Remets les étapes dans l\'ordre.',
              lines: [
                'Forker le dépôt sur GitHub (bouton Fork)',
                'git clone https://github.com/ada/scikit-mini.git',
                'git switch -c docs/exemple-regression',
                'git commit -am "Corrige l\'exemple de régression"',
                'git push -u origin docs/exemple-regression',
                'Ouvrir la pull request vers projet/scikit-mini sur GitHub'
              ],
              hint: 'Tu ne peux cloner que ce qui existe ; tu ne peux proposer que ce que tu as poussé.',
              explain: 'Le fork crée ada/scikit-mini sur GitHub ; tu le clones, tu travailles sur une branche, tu la pousses dans ton fork (origin), puis tu ouvres la PR vers le dépôt d\'origine, où les mainteneurs la relisent.'
            },
            {
              type: 'qcm',
              prompt: 'Tu veux corriger une faute dans la documentation d\'une bibliothèque open source dont tu n\'es pas membre. Que fais-tu ?',
              choices: [
                'Je forke le projet, je pousse ma branche dans mon fork, puis j\'ouvre une pull request vers le dépôt d\'origine',
                'Je clone le projet et je pousse directement sur sa branche main',
                'Je clone le projet et je fais git push --force',
                'Je télécharge le ZIP du projet et je l\'envoie corrigé par e-mail aux mainteneurs'
              ],
              answer: 0,
              why: {
                1: 'Sans droit d\'écriture sur le dépôt, GitHub refuse ton push.',
                2: '--force ne donne pas de droits supplémentaires : le push est refusé de la même façon.',
                3: 'Les mainteneurs perdraient tout l\'outillage : diff, discussion, tests automatiques, historique. La PR est le canal prévu.'
              },
              hint: 'Il te faut un endroit où tu as le droit de pousser.',
              explain: 'Le fork te donne un dépôt à toi, où tu peux pousser. La pull request fait le lien avec le dépôt d\'origine : les mainteneurs relisent, commentent et décident de fusionner.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Ta pull request contient **4 commits**. Elle est fusionnée avec le bouton « Squash and merge ». Combien de commits sont ajoutés à main ?',
            code: '# Sur GitHub : Squash and merge',
            answer: '1',
            accept: ['un'],
            mistakes: [
              { answer: '4', why: 'C\'est ce que donnerait « Rebase and merge ». Le squash regroupe d\'abord les 4 commits en un seul.' },
              { answer: '5', why: 'C\'est ce que donnerait « Create a merge commit » : les 4 commits plus un commit de fusion.' }
            ],
            hint: 'Squash signifie « écraser » : que deviennent les 4 commits ?',
            explain: 'Le squash combine les changements des 4 commits en un seul commit sur main, avec un message récapitulatif. L\'historique de main reste lisible : une ligne par fonctionnalité.'
          },
          recap: [
            'Une PR propose de fusionner une branche ; elle porte la discussion, la revue et les tests.',
            'Corriger une PR : nouveau commit sur la même branche, puis push.',
            'Fusion classique, squash (un seul commit) ou rebase : c\'est l\'équipe qui choisit.',
            'Fork = ta copie d\'un dépôt où tu n\'as pas les droits ; la PR va vers le dépôt d\'origine.'
          ],
          check: {
            type: 'fill',
            prompt: 'Complète le déroulé d\'une contribution par pull request.',
            code: `git switch -c fix/seuil
git commit -am "Corrige le seuil de détection"
git ___ -u origin fix/seuil               # publie la branche sur GitHub
gh pr ___ --title "Corrige le seuil" --body "Seuil passé de 0.5 à 0.6"
# Après la fusion sur GitHub :
git switch main && git ___               # récupère main à jour`,
            blanks: [
              {
                answers: ['push'],
                options: ['push', 'pull', 'merge', 'clone'],
                why: {
                  pull: 'pull récupère ; ici, il faut envoyer la branche.',
                  merge: 'On ne fusionne pas soi-même : c\'est le rôle de la PR, après la revue.',
                  clone: 'Le dépôt est déjà cloné.'
                }
              },
              {
                answers: ['create'],
                options: ['create', 'open', 'new', 'push'],
                why: {
                  open: 'La sous-commande de GitHub CLI est `gh pr create`.',
                  new: 'La sous-commande de GitHub CLI est `gh pr create`.',
                  push: 'gh pr push n\'existe pas.'
                }
              },
              {
                answers: ['pull'],
                options: ['pull', 'push', 'fetch', 'clone'],
                why: {
                  push: 'Ton main local n\'a rien de nouveau à envoyer : c\'est le distant qui a reçu la fusion.',
                  fetch: 'fetch télécharge les commits sans mettre à jour ta branche main ; pull fait les deux.',
                  clone: 'Recloner serait inutile : le dépôt local existe déjà.'
                }
              }
            ],
            hint: 'Envoyer la branche, ouvrir la PR, puis récupérer le résultat de la fusion.',
            explain: 'push publie la branche, `gh pr create` ouvre la pull request, et après la fusion, `git pull` sur main récupère le commit fusionné. Il reste à supprimer la branche locale.'
          }
        }
      ]
    },
    {
      id: 'git.u9',
      title: 'README et documentation',
      summary: 'Présenter un projet avec un README clair, écrit en Markdown.',
      lessons: [
        {
          id: 'git.u9.l1',
          title: 'Écrire un README en Markdown',
          minutes: 7,
          lang: 'markdown',
          objective: 'Tu sais rédiger un README utile en Markdown : titres, listes, liens, code et instructions d\'installation.',
          explain: `Le fichier \`README.md\` est la page d'accueil d'un dépôt : GitHub l'affiche sous la liste des fichiers. Il répond à quatre questions : à quoi sert le projet, comment l'installer, comment l'utiliser, comment le tester ou y contribuer. Écris-le pour quelqu'un qui découvre le projet, avec des commandes à copier telles quelles.

Il s'écrit en **Markdown**, du texte simple avec quelques conventions :

- \`#\` titre principal, \`##\` section, \`###\` sous-section, toujours suivis d'une espace ;
- \`**gras**\`, \`*italique*\`, listes avec \`-\` ou \`1.\` ;
- lien : \`[texte](https://adresse)\`, image : \`![description](chemin/image.png)\` ;
- code en ligne entre accents graves ; bloc de code entre deux lignes de trois accents graves, avec le nom du langage (bash, python) pour la coloration ;
- une ligne vide sépare deux paragraphes.

Autres documents courants : \`CONTRIBUTING.md\` (comment contribuer), \`CHANGELOG.md\` (historique des versions), \`LICENSE\`. Dans le code, docstrings et commentaires expliquent le pourquoi.

**À essayer** : dans VS Code, ouvre un fichier .md et tape Ctrl+Maj+V pour voir l'aperçu.`,
          example: {
            code: `# Détecteur de spam

Classe des emails en **spam** ou **non-spam** avec un modèle Python.

## Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Utilisation
- Entraîner le modèle : \`python train.py\`
- Tester un email : \`python predict.py email.txt\`

Documentation : [wiki du projet](https://github.com/ada/spam/wiki)`,
            notes: [
              { line: 1, text: 'Un seul titre de niveau 1 : le nom du projet.' },
              { line: 3, text: 'Une phrase qui dit à quoi sert le projet, avant tout détail technique.' },
              { line: 6, text: 'Un bloc de code annoncé comme bash : GitHub le colore et ajoute un bouton pour le copier.' },
              { line: 14, text: 'Un lien : le texte affiché entre crochets, l\'adresse entre parenthèses.' }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: 'Complète ce début de README : un titre principal, le mot SQL en gras, et un lien vers la documentation.',
              code: `___ Analyse des ventes

Projet d'analyse en ___SQL___ sur une base SQLite.

Voir la [documentation]___https://github.com/ada/ventes/wiki)`,
              blanks: [
                {
                  answers: ['#'],
                  options: ['#', '##', '*', '='],
                  why: {
                    '##': '## est un titre de section (niveau 2). Le titre principal du README est de niveau 1.',
                    '*': 'Une étoile suivie d\'une espace en début de ligne crée une puce de liste, pas un titre.',
                    '=': 'Un = en début de ligne n\'a pas de sens en Markdown.'
                  }
                },
                {
                  answers: ['**'],
                  options: ['**', '*', '##', '"'],
                  why: {
                    '*': 'Une seule étoile de chaque côté met en italique, pas en gras.',
                    '##': '## ne sert qu\'aux titres, en début de ligne.',
                    '"': 'Les guillemets s\'affichent tels quels, sans mise en forme.'
                  }
                },
                {
                  answers: ['**'],
                  options: ['**', '*', '##', '"'],
                  why: {
                    '*': 'Les marques d\'ouverture et de fermeture doivent être identiques.',
                    '##': '## ne sert qu\'aux titres, en début de ligne.',
                    '"': 'Les guillemets s\'affichent tels quels, sans mise en forme.'
                  }
                },
                {
                  answers: ['('],
                  options: ['(', '[', '<', ':'],
                  why: {
                    '[': 'Les crochets entourent le texte du lien, déjà écrit ; l\'adresse va entre parenthèses.',
                    '<': '<adresse> crée un lien automatique, mais ne peut pas suivre [texte].',
                    ':': '[texte]: adresse est une autre syntaxe (lien de référence), écrite sur une ligne à part.'
                  }
                }
              ],
              hint: 'Titre de niveau 1, deux étoiles de chaque côté pour le gras, et un lien de la forme [texte](adresse).',
              explain: '`#` crée le titre principal, `**SQL**` met en gras, et `[documentation](https://...)` crée un lien dont seul le mot « documentation » est affiché.'
            },
            {
              type: 'bug',
              prompt: 'Sur GitHub, « Installation » ne s\'affiche pas comme un titre de section, mais comme du texte précédé de ##. Clique sur la ligne fautive.',
              code: `# Détecteur de spam

##Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\``,
              bugLine: 3,
              why: 'En Markdown (dans sa version standard, utilisée par GitHub), les # d\'un titre doivent être suivis d\'une espace. Sans elle, la ligne reste un paragraphe ordinaire.',
              fixes: ['## Installation', '#Installation#', '**Installation**', 'Installation :'],
              fixAnswer: 0,
              fixWhy: {
                1: 'Il manque toujours l\'espace après # : ce n\'est pas un titre.',
                2: 'Du gras ressemble à un titre, mais n\'en est pas un : il n\'apparaît pas dans la table des matières que GitHub génère.',
                3: 'C\'est un simple paragraphe, sans mise en forme.'
              },
              hint: 'Compare avec la ligne 1, qui s\'affiche bien comme un titre.',
              explain: '`## Installation`, avec une espace, crée un titre de niveau 2. GitHub s\'en sert aussi pour la table des matières et les liens d\'ancre vers chaque section.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Combien de **titres de niveau 2** GitHub affiche-t-il pour ce README ?',
            code: `# Projet météo
## Installation
##Configuration
## Utilisation
\`\`\`bash
## ceci est un commentaire Bash
\`\`\`
### Exemple
## Licence`,
            answer: '3',
            accept: ['trois'],
            mistakes: [
              { answer: '4', why: 'Tu as compté une ligne de trop : soit « ##Configuration », qui n\'est pas un titre faute d\'espace, soit la ligne du bloc de code, qui reste du code et n\'est jamais interprétée comme du Markdown.' },
              { answer: '5', why: '« ##Configuration » (sans espace) n\'est pas un titre, et la ligne du bloc de code non plus.' }
            ],
            hint: 'Pour chaque ligne qui commence par ##, vérifie : y a-t-il une espace après ? Est-elle dans un bloc de code ? Combien de # exactement ?',
            explain: 'Titres de niveau 2 : Installation, Utilisation et Licence. « ##Configuration » n\'a pas d\'espace, la ligne entre les trois accents graves est du code, et « ### Exemple » est de niveau 3.'
          },
          recap: [
            'Un README dit : à quoi sert le projet, comment l\'installer, l\'utiliser, le tester.',
            'Titres `#`, `##`, `###` suivis d\'une espace ; listes avec `-`.',
            'Lien `[texte](adresse)`, image `![description](chemin)`.',
            'Blocs de code entre trois accents graves, avec le langage, pour des commandes copiables.'
          ],
          check: {
            type: 'qcm',
            prompt: 'Tu publies ton projet de détection de spam sur GitHub. Que doit contenir **en priorité** ton README ?',
            choices: [
              'À quoi sert le projet, comment l\'installer et le lancer, avec des commandes à copier',
              'L\'historique détaillé de chaque modification depuis le début du projet',
              'Le code source complet des fichiers principaux, recopié',
              'La liste de toutes les fonctions avec leurs paramètres'
            ],
            answer: 0,
            why: {
              1: 'L\'historique est déjà dans git log ; un résumé par version va dans un CHANGELOG.md.',
              2: 'Le code est déjà dans le dépôt : le recopier crée une seconde version qui deviendra vite fausse.',
              3: 'Cette documentation de référence a sa place dans les docstrings ou dans une documentation dédiée, pas dans le README.'
            },
            hint: 'Pense à la personne qui arrive sur le dépôt pour la première fois.',
            explain: 'Le README doit permettre à quelqu\'un de comprendre le projet et de le faire tourner en quelques minutes. Le reste (historique, référence détaillée) a sa place ailleurs.'
          }
        }
      ]
    }
  ]
});
