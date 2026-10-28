// Parcours SQL et bases de données (2/4) : chapitre 2 « Modifier et résumer ».
CQ.addChapter('sql', {
  id: 'sql.c2',
  title: 'Modifier et résumer',
  units: [
    {
      id: 'sql.u4',
      title: 'INSERT, UPDATE et DELETE',
      summary: 'Ajouter, modifier et supprimer des lignes sans abîmer le reste de la table.',
      lessons: [
        {
          id: 'sql.u4.l1',
          title: 'Ajouter des lignes avec INSERT',
          minutes: 6,
          objective: 'Tu sais ajouter une ou plusieurs lignes dans une table avec INSERT INTO, en nommant les colonnes.',
          explain: `\`INSERT INTO\` ajoute des lignes : \`INSERT INTO table (col1, col2) VALUES (v1, v2);\`. Les valeurs suivent l'ordre des colonnes listées. Pour plusieurs lignes d'un coup : \`VALUES (...), (...), (...)\`.

Liste **toujours** les colonnes : la requête reste juste si quelqu'un ajoute une colonne ou change leur ordre, et tu peux en omettre. Une colonne omise reçoit sa valeur par défaut (\`DEFAULT\`), sinon NULL. Si elle est déclarée \`NOT NULL\` sans valeur par défaut, l'insertion échoue.

En SQLite, une colonne \`id INTEGER PRIMARY KEY\` se remplit toute seule : si tu ne la donnes pas, elle reçoit le plus grand id existant plus 1. Tu verras pourquoi à l'unité 8.

Dans CodeQuest, chaque exercice repart d'une copie neuve de la base : tu peux modifier sans crainte.`,
          example: {
            db: 'boutique',
            code: `INSERT INTO produits (nom, categorie, prix, stock)
VALUES ('Clé USB 128 Go', 'Accessoires', 14.9, 50),
       ('Station d''accueil USB-C', 'Informatique', 119.0, 4);

SELECT id, nom, categorie, prix
FROM produits
WHERE id > 18;`,
            output: `id | nom                     | categorie    | prix
---+-------------------------+--------------+-----
19 | Kit capteurs Arduino    | NULL         | 54.9
20 | Disque SSD 1 To         | Informatique | 99.9
21 | Clé USB 128 Go          | Accessoires  | 14.9
22 | Station d'accueil USB-C | Informatique | 119`,
            notes: [
              { line: 1, text: 'On liste les colonnes remplies. La colonne id est omise : SQLite la calcule.' },
              { line: 2, text: 'Deux lignes insérées d\'un coup, séparées par une virgule. Les valeurs suivent l\'ordre des colonnes.' },
              { line: 3, text: 'L\'apostrophe de « d\'accueil » est doublée pour ne pas fermer le texte.' },
              { line: 7, text: 'Le SELECT de contrôle montre les nouveaux id : 21 et 22, à la suite du plus grand id existant (20).' }
            ]
          },
          exercises: [
            {
              type: 'code',
              prompt: 'Ajoute le client **Yanis Mercier**, email `yanis.mercier@mail.fr`, ville **Rennes**, pays **France**, inscrit le `2024-10-28`. Ne donne pas d\'id : SQLite le choisira.',
              db: 'boutique',
              starter: `INSERT INTO clients (prenom, nom, email, ville, pays, date_inscription)
VALUES ();`,
              solution: `INSERT INTO clients (prenom, nom, email, ville, pays, date_inscription)
VALUES ('Yanis', 'Mercier', 'yanis.mercier@mail.fr', 'Rennes', 'France', '2024-10-28');`,
              verify: 'SELECT prenom, nom, email, ville, pays, date_inscription FROM clients',
              hint: 'Mets les six valeurs dans les parenthèses de VALUES, dans le même ordre que les colonnes, chaque texte entre apostrophes.',
              explain: 'Les valeurs sont associées aux colonnes dans l\'ordre de la liste, et l\'id omis reçoit automatiquement 22. La vérification compare la table clients après ton INSERT avec la table attendue.'
            },
            {
              type: 'fill',
              prompt: 'Complète l\'insertion de deux produits. Le second s\'appelle « Station d\'accueil ».',
              db: 'boutique',
              code: `INSERT ___ produits (nom, categorie, prix, stock)
___ ('Tapis de bureau', 'Accessoires', 24.9, 30),
       ('Station d___accueil', 'Informatique', 119.0, 4);`,
              blanks: [
                {
                  answers: ['INTO'],
                  options: ['INTO', 'TO', 'IN', 'TABLE'],
                  why: {
                    TO: 'La syntaxe est INSERT INTO, pas INSERT TO : SQLite répond « syntax error ».',
                    IN: 'IN sert dans les filtres (`ville IN (...)`), pas pour désigner la table à remplir.',
                    TABLE: 'INSERT TABLE n\'existe pas ; TABLE apparaît dans CREATE TABLE.'
                  }
                },
                {
                  answers: ['VALUES'],
                  options: ['VALUES', 'VALUE', 'SET', 'ROWS'],
                  why: {
                    VALUE: 'SQLite exige VALUES, au pluriel, même pour une seule ligne. VALUE donne une erreur de syntaxe.',
                    SET: 'SET s\'utilise avec UPDATE pour modifier des lignes existantes.',
                    ROWS: 'ROWS n\'est pas un mot-clé de INSERT.'
                  }
                },
                {
                  answers: ["''"],
                  options: ["''", "'", "\\'", '"'],
                  why: {
                    "'": 'Une apostrophe seule ferme le texte : SQLite lit \'Station d\' puis ne comprend plus la suite.',
                    "\\'": 'En SQL, l\'antislash n\'échappe rien : on double l\'apostrophe.',
                    '"': 'Le guillemet double est accepté dans le texte, mais le nom enregistré serait Station d"accueil, pas le bon nom.'
                  }
                }
              ],
              hint: 'Trois éléments : le mot qui suit INSERT, le mot qui introduit les lignes, et la façon d\'écrire une apostrophe dans un texte.',
              explain: 'INSERT INTO table (colonnes) VALUES (ligne1), (ligne2). Dans un texte SQL, une apostrophe s\'écrit en la doublant : \'Station d\'\'accueil\'.'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Quelle valeur renvoie la dernière requête ?',
            code: `-- Données de l'exercice
CREATE TABLE taches (
  id INTEGER PRIMARY KEY,
  titre TEXT NOT NULL,
  fait INTEGER DEFAULT 0
);
INSERT INTO taches (titre) VALUES ('Lire le guide');
INSERT INTO taches (titre, fait) VALUES ('Installer Git', 1), ('Créer le dépôt', 0);
INSERT INTO taches (titre) VALUES ('Premier commit');

SELECT titre FROM taches
WHERE fait = 0
ORDER BY id DESC
LIMIT 1;`,
            answer: 'Premier commit',
            mistakes: [
              { answer: 'Créer le dépôt', why: 'La colonne fait a une valeur par défaut : DEFAULT 0. « Premier commit », inséré sans fait, reçoit donc 0, pas NULL, et c\'est lui qui a le plus grand id.' },
              { answer: 'Lire le guide', why: 'ORDER BY id DESC met le plus grand id en premier. « Lire le guide » a l\'id 1, le plus petit.' }
            ],
            hint: 'Quelle valeur prend `fait` quand on ne la donne pas ? Et quel id reçoit chaque tâche ?',
            explain: 'Les id valent 1 à 4 dans l\'ordre d\'insertion. « Lire le guide » et « Premier commit » reçoivent fait = 0 par défaut. Parmi les tâches non faites (id 1, 3 et 4), la plus récente est « Premier commit ».'
          },
          recap: [
            '`INSERT INTO table (colonnes) VALUES (...), (...);` ajoute une ou plusieurs lignes.',
            'Lister les colonnes rend l\'insertion robuste et permet d\'en omettre.',
            'Une colonne omise prend sa valeur DEFAULT, sinon NULL (refusé si NOT NULL).',
            'En SQLite, `id INTEGER PRIMARY KEY` se remplit automatiquement.'
          ],
          check: {
            type: 'qcm',
            prompt: 'Pourquoi écrire `INSERT INTO clients (prenom, nom, pays, date_inscription) VALUES (...)` plutôt que `INSERT INTO clients VALUES (...)` ?',
            choices: [
              'La requête reste juste si l\'ordre ou le nombre de colonnes de la table change, et on peut laisser SQLite remplir l\'id',
              'Sans la liste des colonnes, SQLite refuse toujours l\'insertion',
              'La liste des colonnes rend l\'insertion plus rapide sur les grosses tables',
              'La liste des colonnes vérifie que l\'email n\'existe pas déjà'
            ],
            answer: 0,
            why: {
              1: 'SQLite accepte INSERT sans liste, à condition de donner une valeur pour chaque colonne, dans l\'ordre exact de la table. C\'est justement ce qui rend cette forme fragile.',
              2: 'La vitesse est la même : la liste sert à la clarté et à la robustesse.',
              3: 'Empêcher les doublons est le rôle d\'une contrainte UNIQUE sur la colonne, pas de la liste des colonnes.'
            },
            hint: 'Pense à ce qui arrive le jour où quelqu\'un ajoute une colonne à la table.',
            explain: 'Nommer les colonnes associe chaque valeur à sa colonne sans dépendre de leur position. On peut aussi omettre l\'id et les colonnes facultatives.'
          }
        },
        {
          id: 'sql.u4.l2',
          title: 'Modifier et supprimer : UPDATE et DELETE',
          minutes: 7,
          objective: 'Tu sais modifier et supprimer des lignes précises avec UPDATE et DELETE, en vérifiant d\'abord la cible avec un SELECT.',
          explain: `\`UPDATE table SET col = valeur WHERE condition;\` modifie les lignes qui vérifient la condition. On peut changer plusieurs colonnes (\`SET a = 1, b = 2\`) et partir de la valeur actuelle : \`SET stock = stock - 1\`.

\`DELETE FROM table WHERE condition;\` supprime des lignes.

**Attention** : sans \`WHERE\`, \`UPDATE\` modifie **toutes** les lignes et \`DELETE FROM clients;\` vide **toute** la table. Aucune confirmation, aucune corbeille. Bon réflexe : écris d'abord un \`SELECT\` avec le même \`WHERE\`, vérifie les lignes visées, puis remplace le \`SELECT\` par l'\`UPDATE\` ou le \`DELETE\`.

Pour pouvoir revenir en arrière, encadre les modifications dans une transaction : \`BEGIN;\`, puis \`COMMIT;\` pour valider ou \`ROLLBACK;\` pour tout annuler. Sur une vraie base, fais aussi une sauvegarde avant une grosse modification.`,
          example: {
            db: 'boutique',
            code: `-- 1. Vérifier les lignes visées
SELECT id, nom, prix FROM produits WHERE categorie = 'Livres';

-- 2. Appliquer une remise de 10 % à ces lignes seulement
UPDATE produits
SET prix = ROUND(prix * 0.9, 2)
WHERE categorie = 'Livres';

-- 3. Contrôler le résultat
SELECT id, nom, prix FROM produits WHERE categorie = 'Livres';`,
            output: `id | nom                      | prix
---+--------------------------+------
15 | Python pour la data      | 28.8
16 | Apprendre SQL            | 24.75
17 | Deep learning, les bases | 40.5`,
            notes: [
              { line: 2, text: 'Le SELECT montre les trois livres qui seront modifiés, avant de toucher à quoi que ce soit.' },
              { line: 6, text: 'Le nouveau prix est calculé à partir de l\'ancien, ligne par ligne.' },
              { line: 7, text: 'Le même WHERE que le SELECT : seules ces trois lignes changent. Sans lui, tout le catalogue serait remisé.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Que fait cette requête ?',
              code: 'DELETE FROM commandes;',
              choices: [
                'Elle supprime toutes les lignes de la table commandes, sans demander de confirmation',
                'Elle refuse de s\'exécuter : WHERE est obligatoire avec DELETE',
                'Elle supprime la table commandes elle-même, colonnes comprises',
                'Elle supprime seulement la dernière commande ajoutée'
              ],
              answer: 0,
              why: {
                1: 'WHERE est facultatif : SQLite exécute la requête sans broncher. Certains outils bloquent ce cas (le mode « safe updates » de MySQL, par exemple), mais ce n\'est pas une règle du langage.',
                2: 'La table et ses colonnes restent, vides. C\'est DROP TABLE qui supprime la table elle-même.',
                3: 'Sans WHERE, aucune ligne n\'est épargnée.'
              },
              hint: 'Sans condition, quelles lignes vérifient « la condition » ?',
              explain: 'Un DELETE sans WHERE vide la table, immédiatement et sans corbeille. Seule une transaction encore ouverte (ROLLBACK) ou une sauvegarde permet de revenir en arrière.'
            },
            {
              type: 'code',
              prompt: 'La cliente **Emma Dubois** (id 3) donne enfin son email : `emma.dubois@mail.fr`. Le code de départ oublie quelque chose d\'essentiel : corrige-le pour ne modifier que sa fiche.',
              db: 'boutique',
              starter: `UPDATE clients
SET email = 'emma.dubois@mail.fr';`,
              solution: `UPDATE clients
SET email = 'emma.dubois@mail.fr'
WHERE id = 3;`,
              verify: 'SELECT id, email FROM clients',
              hint: 'Tel quel, l\'UPDATE touche les 21 clients. Quelle colonne identifie Emma de façon sûre ?',
              explain: '`WHERE id = 3` cible une seule ligne. Filtrer sur l\'id est plus sûr que sur le nom : deux clients peuvent porter le même nom (la table contient d\'ailleurs deux Lucas Bernard).'
            }
          ],
          challenge: {
            type: 'bug',
            prompt: 'Ce script doit augmenter de 5 % le prix des produits **Audio**. Il affiche une erreur de syntaxe… et pourtant **tous** les prix ont augmenté. Clique sur la ligne fautive.',
            db: 'boutique',
            code: `UPDATE produits
SET prix = ROUND(prix * 1.05, 2);
WHERE categorie = 'Audio';`,
            bugLine: 2,
            why: 'Le point-virgule termine l\'instruction à la ligne 2. L\'UPDATE s\'exécute donc sans WHERE, sur tout le catalogue. La ligne 3, seule, n\'est pas une instruction valide : c\'est elle qui déclenche l\'erreur, mais le mal est fait.',
            fixes: [
              'SET prix = ROUND(prix * 1.05, 2)',
              "SET prix = ROUND(prix * 1.05, 2) AND categorie = 'Audio';",
              'SET prix = prix * 1.05;',
              'SET prix = ROUND(prix * 0.05, 2)'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: 'Le point-virgule est toujours là, et `ROUND(...) AND categorie = \'Audio\'` est une condition : chaque prix deviendrait 0 ou 1.',
              2: 'Le point-virgule coupe toujours l\'instruction avant le WHERE : tous les prix augmentent encore.',
              3: 'Le point-virgule a disparu, mais `prix * 0.05` vaut 5 % du prix : le casque à 129 € passerait à 6,45 €. Une hausse de 5 % se calcule avec `prix * 1.05`.'
            },
            hint: 'Où se termine une instruction SQL ? Lis le script en t\'arrêtant au premier point-virgule.',
            explain: 'Sans le point-virgule de la ligne 2, UPDATE, SET et WHERE forment une seule instruction et seuls les 4 produits Audio changent. Ce piège montre pourquoi on teste d\'abord sur une copie ou dans une transaction.'
          },
          recap: [
            '`UPDATE table SET col = valeur WHERE condition;` modifie les lignes visées.',
            '`DELETE FROM table WHERE condition;` supprime les lignes visées.',
            'Sans WHERE, UPDATE et DELETE touchent toute la table, sans confirmation.',
            'Réflexe : SELECT avec le même WHERE d\'abord, transaction (BEGIN / ROLLBACK) et sauvegarde pour les gros changements.'
          ],
          check: {
            type: 'predict',
            prompt: 'Quelle valeur renvoie la dernière requête ?',
            code: `-- Données de l'exercice
CREATE TABLE stock (article TEXT, quantite INTEGER);
INSERT INTO stock (article, quantite)
VALUES ('vis', 100), ('écrous', 40), ('rondelles', 0);

UPDATE stock SET quantite = quantite - 30 WHERE quantite >= 30;
DELETE FROM stock WHERE quantite = 0;

SELECT quantite FROM stock WHERE article = 'écrous';`,
            answer: '10',
            mistakes: [
              { answer: '40', why: 'Les écrous (40) vérifient `quantite >= 30` : l\'UPDATE leur retire 30.' },
              { answer: '0', why: 'Il reste 40 - 30 = 10 écrous ; le DELETE ne supprime que les lignes à 0, ici les rondelles.' }
            ],
            hint: 'Applique les deux instructions ligne par ligne : quelles lignes vérifient chaque WHERE ?',
            explain: 'L\'UPDATE passe les vis à 70 et les écrous à 10 ; les rondelles (0) ne vérifient pas la condition. Le DELETE supprime ensuite les rondelles. Les écrous valent donc 10.'
          }
        }
      ]
    },
    {
      id: 'sql.u5',
      title: 'Agrégations',
      summary: 'Résumer une table en quelques chiffres : nombre, somme, moyenne, minimum, maximum.',
      lessons: [
        {
          id: 'sql.u5.l1',
          title: 'Compter, additionner, faire la moyenne',
          minutes: 7,
          objective: 'Tu sais résumer une table en une ligne avec COUNT, SUM, AVG, MIN et MAX, en sachant comment ils traitent les NULL.',
          explain: `Une **fonction d'agrégation** résume plusieurs lignes en une seule valeur :

- \`COUNT(*)\` compte les lignes ; \`COUNT(colonne)\` compte les valeurs **non NULL** ; \`COUNT(DISTINCT colonne)\` compte les valeurs différentes.
- \`SUM\`, \`AVG\` (moyenne), \`MIN\`, \`MAX\` **ignorent** les NULL : ils ne les comptent pas comme 0.

\`WHERE\` s'applique **avant** le calcul : \`SELECT AVG(prix) FROM produits WHERE categorie = 'Livres'\` fait la moyenne des seuls livres. On arrondit avec \`ROUND(AVG(prix), 2)\`, et on peut agréger une expression : \`SUM(quantite * prix_unitaire)\`.

Particularité de SQLite (comme de SQL Server) : une division entre deux entiers donne un entier, \`7 / 2\` vaut \`3\`. \`AVG\` renvoie toujours un décimal, mais \`SUM(x) / COUNT(*)\` peut être tronqué : écris \`SUM(x) * 1.0 / COUNT(*)\`.

Dans un projet d'IA, ces fonctions font le premier contrôle des données : nombre de lignes, valeurs manquantes, minimum et maximum de chaque mesure.`,
          example: {
            db: 'labo',
            code: `SELECT COUNT(*) AS experiences,
       COUNT(exactitude) AS avec_score,
       ROUND(AVG(exactitude), 3) AS exactitude_moy,
       MAX(exactitude) AS meilleure,
       SUM(duree_min) AS minutes_gpu
FROM experiences
WHERE jeu_donnees = 'plantes';`,
            output: `experiences | avec_score | exactitude_moy | meilleure | minutes_gpu
------------+------------+----------------+-----------+------------
20          | 16         | 0.936          | 0.958     | 1887`,
            notes: [
              { line: 1, text: 'COUNT(*) compte les 20 entraînements lancés sur le jeu « plantes ».' },
              { line: 2, text: 'COUNT(exactitude) n\'en compte que 16 : les 4 entraînements en échec ont une exactitude NULL.' },
              { line: 3, text: 'AVG ignore ces NULL : c\'est la moyenne des 16 scores, pas des 20 lignes.' },
              { line: 7, text: 'WHERE filtre les lignes avant le calcul : le jeu « chats-chiens » n\'est pas compté.' }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: 'Quelle valeur renvoie la dernière requête ?',
              code: `-- Données de l'exercice
CREATE TABLE notes (film TEXT, note INTEGER);
INSERT INTO notes VALUES
  ('Dune', 5), ('Dune', 4), ('Her', NULL), ('Nope', 3);

SELECT AVG(note) FROM notes;`,
              answer: '4',
              accept: ['4.0'],
              mistakes: [
                { answer: '3', why: 'Ce serait vrai si NULL comptait pour 0 (12 / 4). Or AVG ignore les NULL : la moyenne porte sur 3 notes.' },
                { answer: 'NULL', why: 'Une valeur manquante ne rend pas toute la moyenne inconnue : AVG l\'ignore simplement.' }
              ],
              hint: 'Combien de notes AVG prend-il vraiment en compte ?',
              explain: 'AVG ignore la note NULL de « Her » : (5 + 4 + 3) / 3 = 4. SQLite affiche 4.0, car AVG renvoie toujours un nombre décimal.'
            },
            {
              type: 'code',
              prompt: 'Pour les produits de la catégorie **Informatique**, affiche en une seule ligne : le **nombre** de produits, le **prix moyen arrondi à 2 décimales** et le **stock total**, dans cet ordre.',
              db: 'boutique',
              starter: `SELECT COUNT(*)
FROM produits;`,
              solution: `SELECT COUNT(*), ROUND(AVG(prix), 2), SUM(stock)
FROM produits
WHERE categorie = 'Informatique';`,
              hint: 'Trois fonctions d\'agrégation séparées par des virgules, et un WHERE pour ne garder que la catégorie demandée.',
              explain: 'WHERE garde les 6 produits Informatique, puis chaque fonction les résume : 6 produits, 102,25 € de prix moyen, 119 unités en stock.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Une colonne `points` de type INTEGER contient trois lignes : 10, 15 et 16. Quelle valeur **SQLite** renvoie-t-il pour cette requête ?',
            code: 'SELECT SUM(points) / COUNT(*) FROM scores;',
            answer: '13',
            mistakes: [
              { answer: '13.67', why: 'Ce serait la vraie moyenne, mais SUM (41) et COUNT (3) sont deux entiers : SQLite fait une division entière.' },
              { answer: '13.666666666666666', why: 'C\'est ce que renverrait AVG(points). La division de deux entiers, elle, donne un entier.' }
            ],
            hint: 'Calcule SUM et COUNT, puis rappelle-toi ce que donne `7 / 2` en SQLite.',
            explain: '41 / 3 entre entiers donne 13 : la partie décimale est perdue. Pour obtenir 13.666…, utilise AVG(points) ou SUM(points) * 1.0 / COUNT(*).'
          },
          recap: [
            'COUNT(*) compte les lignes, COUNT(col) les valeurs non NULL, COUNT(DISTINCT col) les valeurs différentes.',
            'SUM, AVG, MIN et MAX ignorent les NULL.',
            'WHERE filtre avant le calcul ; ROUND arrondit le résultat.',
            'En SQLite, entier / entier donne un entier : multiplie par 1.0 si besoin.'
          ],
          check: {
            type: 'qcm',
            prompt: 'Sur la table `clients`, `COUNT(*)` renvoie 21 et `COUNT(email)` renvoie 18. Pourquoi ?',
            choices: [
              'Trois clients ont un email NULL : COUNT(colonne) ne compte que les valeurs non NULL',
              'Trois emails sont en double : COUNT(email) ne compte que les valeurs différentes',
              'COUNT(*) compte aussi les colonnes, pas seulement les lignes',
              'COUNT(email) ignore les emails qui ne se terminent pas par .fr'
            ],
            answer: 0,
            why: {
              1: 'C\'est COUNT(DISTINCT email) qui ne compte que les valeurs différentes. Il renvoie ici 17, car un email apparaît deux fois.',
              2: 'COUNT(*) compte des lignes : 21 clients, quel que soit le nombre de colonnes.',
              3: 'COUNT ne regarde pas le contenu du texte, seulement si la valeur est NULL ou non.'
            },
            hint: 'Quelle est la différence entre compter des lignes et compter des valeurs ?',
            explain: 'COUNT(*) compte les lignes, COUNT(email) les emails renseignés. L\'écart (3) mesure directement les valeurs manquantes : un contrôle utile avant toute analyse.'
          }
        }
      ]
    },
    {
      id: 'sql.u6',
      title: 'GROUP BY et HAVING',
      summary: 'Calculer des résumés par catégorie, par client ou par mois, et filtrer ces groupes.',
      lessons: [
        {
          id: 'sql.u6.l1',
          title: 'Regrouper et filtrer les groupes',
          minutes: 8,
          objective: 'Tu sais calculer des agrégats par groupe avec GROUP BY et filtrer les groupes avec HAVING.',
          explain: `\`GROUP BY colonne\` range les lignes en groupes, un par valeur différente, et calcule les agrégats **pour chaque groupe** : \`SELECT categorie, COUNT(*) FROM produits GROUP BY categorie;\`. Les valeurs NULL forment un groupe à part.

Dans le SELECT, mets seulement les colonnes du GROUP BY et des agrégats. SQLite tolère une autre colonne et en prend une valeur arbitraire du groupe ; PostgreSQL ou SQL Server refusent. Ne compte pas sur cette tolérance.

\`WHERE\` filtre les **lignes avant** le regroupement ; \`HAVING\` filtre les **groupes après**, et peut donc utiliser un agrégat : \`HAVING COUNT(*) >= 3\`. Écrire \`WHERE COUNT(*) >= 3\` donne l'erreur « misuse of aggregate ».

Ordre d'écriture : \`SELECT\`, \`FROM\`, \`WHERE\`, \`GROUP BY\`, \`HAVING\`, \`ORDER BY\`, \`LIMIT\`.`,
          example: {
            db: 'streaming',
            code: `SELECT genre,
       COUNT(*) AS nb_films,
       ROUND(AVG(duree_min)) AS duree_moy
FROM films
WHERE annee >= 2010
GROUP BY genre
HAVING COUNT(*) >= 2
ORDER BY nb_films DESC, genre;`,
            output: `genre           | nb_films | duree_moy
----------------+----------+----------
Science-fiction | 8        | 141
Drame           | 4        | 134
Comédie         | 3        | 107
Horreur         | 2        | 117
Thriller        | 2        | 142`,
            notes: [
              { line: 5, text: 'WHERE écarte d\'abord les films sortis avant 2010, ligne par ligne.' },
              { line: 6, text: 'Une ligne de résultat par genre ; COUNT et AVG sont calculés à l\'intérieur de chaque genre.' },
              { line: 7, text: 'HAVING écarte ensuite les genres qui ont moins de 2 films (ici la comédie musicale).' },
              { line: 8, text: 'On peut trier sur un alias d\'agrégat ; le genre départage les égalités.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Quelle requête affiche les catégories dont le **stock total** dépasse 100 unités ?',
              choices: [
                'SELECT categorie, SUM(stock) FROM produits GROUP BY categorie HAVING SUM(stock) > 100;',
                'SELECT categorie, SUM(stock) FROM produits WHERE SUM(stock) > 100 GROUP BY categorie;',
                'SELECT categorie, SUM(stock) FROM produits WHERE stock > 100 GROUP BY categorie;',
                'SELECT categorie, stock FROM produits GROUP BY categorie HAVING stock > 100;'
              ],
              answer: 0,
              why: {
                1: 'WHERE agit avant le regroupement, quand les sommes n\'existent pas encore : SQLite répond « misuse of aggregate: SUM() ».',
                2: 'Ce WHERE garde les produits qui ont chacun plus de 100 unités (un seul : le câble USB-C), puis fait les sommes. Ce n\'est pas la même question.',
                3: 'stock n\'est ni groupé ni agrégé : SQLite prend la valeur d\'un produit arbitraire du groupe. Le résultat n\'a pas de sens.'
              },
              hint: 'Le filtre porte sur un total par catégorie : il doit s\'appliquer après le calcul des groupes.',
              explain: 'HAVING filtre les groupes une fois les sommes calculées. Résultat : Accessoires (235) et Informatique (119).'
            },
            {
              type: 'fill',
              prompt: 'Complète la requête pour afficher, par catégorie, le nombre de produits et le prix le plus élevé, en ne gardant que les catégories d\'au moins 3 produits.',
              db: 'boutique',
              code: `SELECT categorie, COUNT(*) AS nb, MAX(prix) AS plus_cher
FROM produits
___ categorie
___ COUNT(*) >= 3;`,
              blanks: [
                {
                  answers: ['GROUP BY'],
                  options: ['GROUP BY', 'ORDER BY', 'DISTINCT', 'PARTITION BY'],
                  why: {
                    'ORDER BY': 'ORDER BY trie les lignes mais ne les regroupe pas : COUNT(*) compterait toute la table.',
                    DISTINCT: 'DISTINCT s\'écrit juste après SELECT et retire des doublons ; il ne calcule pas d\'agrégat par groupe.',
                    'PARTITION BY': 'PARTITION BY appartient aux fonctions de fenêtre (OVER), une notion plus avancée qui ne regroupe pas les lignes.'
                  }
                },
                {
                  answers: ['HAVING'],
                  options: ['HAVING', 'WHERE', 'AND', 'FILTER'],
                  why: {
                    WHERE: 'WHERE ne peut pas utiliser COUNT(*) et devrait de toute façon venir avant GROUP BY.',
                    AND: 'AND relie deux conditions ; il ne peut pas commencer une clause.',
                    FILTER: 'FILTER existe en SQLite, mais seulement collé à un agrégat (`COUNT(*) FILTER (WHERE ...)`), pas comme clause.'
                  }
                }
              ],
              hint: 'Un mot-clé crée les groupes, un autre filtre les groupes déjà calculés.',
              explain: 'GROUP BY categorie crée un groupe par catégorie ; HAVING COUNT(*) >= 3 garde Accessoires, Audio, Informatique et Livres.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'La table `ventes` contient les 6 lignes en commentaire. **Combien de lignes** renvoie la requête ?',
            code: `-- vendeur | montant
-- ada     | 100
-- linus   | 40
-- ada     | 30
-- grace   | 200
-- linus   | 50
-- NULL    | 70
SELECT vendeur, SUM(montant)
FROM ventes
WHERE montant > 35
GROUP BY vendeur
HAVING SUM(montant) >= 90;`,
            answer: '3',
            accept: ['trois'],
            mistakes: [
              { answer: '2', why: 'linus a deux ventes, 40 et 50, toutes deux supérieures à 35 : son total vaut 90, et `>= 90` le garde.' },
              { answer: '4', why: 'Le groupe NULL existe bien, mais son total (70) est inférieur à 90 : HAVING l\'écarte.' }
            ],
            hint: 'Procède dans l\'ordre d\'exécution : WHERE sur chaque ligne, puis GROUP BY, puis HAVING sur chaque total.',
            explain: 'WHERE retire la vente de 30. Totaux : ada 100, linus 90, grace 200, NULL 70. HAVING garde les totaux d\'au moins 90 : ada, linus et grace, soit 3 lignes.'
          },
          recap: [
            'GROUP BY crée une ligne de résultat par valeur différente ; les NULL forment un groupe.',
            'Dans le SELECT : colonnes groupées et agrégats seulement.',
            'WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après.',
            'Ordre : SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.'
          ],
          check: {
            type: 'code',
            prompt: 'Des clients se sont inscrits deux fois. Affiche chaque **email** présent **plusieurs fois** dans `clients`, avec son **nombre d\'apparitions**. Ignore les clients sans email.',
            db: 'boutique',
            starter: `SELECT email, COUNT(*) AS nb
FROM clients
GROUP BY email;`,
            solution: `SELECT email, COUNT(*) AS nb
FROM clients
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;`,
            hint: 'Garde les groupes de plus d\'une ligne. Attention : les trois clients sans email forment, eux aussi, un groupe.',
            explain: 'GROUP BY email fait un groupe par adresse et HAVING COUNT(*) > 1 garde les adresses répétées. Sans le WHERE, le groupe NULL (3 clients sans email) apparaîtrait comme un faux doublon. Résultat : lucas.b@mail.fr, 2 fois.'
          }
        }
      ]
    }
  ]
});
