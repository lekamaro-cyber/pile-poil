// Parcours SQL et bases de données (3/4) : chapitre 3 « Relier les tables ».
CQ.addChapter('sql', {
  id: 'sql.c3',
  title: 'Relier les tables',
  units: [
    {
      id: 'sql.u7',
      title: 'Jointures',
      summary: 'Combiner les lignes de plusieurs tables grâce à leurs identifiants.',
      lessons: [
        {
          id: 'sql.u7.l1',
          title: 'Associer deux tables : INNER JOIN',
          minutes: 8,
          objective: 'Tu sais relier deux tables ou plus avec JOIN ... ON et préfixer les colonnes pour éviter les ambiguïtés.',
          explain: `Une base bien conçue ne recopie pas les informations : une commande ne contient pas le nom du client, seulement son identifiant \`commandes.client_id\`, qui renvoie à \`clients.id\`. Pour afficher les deux ensemble, on **joint** les tables :

\`FROM commandes AS co JOIN clients AS cl ON cl.id = co.client_id\`

\`ON\` dit quelles lignes vont ensemble. \`JOIN\` (ou \`INNER JOIN\`) ne garde que les lignes qui ont une correspondance des deux côtés. Les alias courts (\`co\`, \`cl\`) évitent de répéter les noms de tables.

Quand deux tables ont une colonne du même nom (\`id\`, \`nom\`), préfixe-la : \`cl.nom\`. Sinon SQLite répond « ambiguous column name ». On enchaîne autant de JOIN que nécessaire. Sans condition ON, chaque ligne est associée à **chaque** ligne de l'autre table : c'est le produit cartésien, rarement voulu.`,
          example: {
            db: 'boutique',
            code: `SELECT co.id, cl.prenom, cl.nom, co.date_commande
FROM commandes AS co
JOIN clients AS cl ON cl.id = co.client_id
WHERE co.statut = 'en_attente';`,
            output: `id | prenom | nom      | date_commande
---+--------+----------+--------------
29 | Noah   | Fournier | 2024-10-12
30 | Chloé  | Robert   | 2024-10-20`,
            notes: [
              { line: 1, text: 'Chaque colonne est préfixée par l\'alias de sa table : co pour commandes, cl pour clients.' },
              { line: 3, text: 'La condition ON associe chaque commande au client dont l\'id vaut son client_id.' },
              { line: 4, text: 'WHERE filtre après la jointure : on peut utiliser les colonnes des deux tables.' }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: 'Complète la requête pour afficher le nom de chaque produit de la commande 14, avec sa quantité.',
              db: 'boutique',
              code: `SELECT p.nom, l.quantite
FROM lignes_commande AS l
___ produits AS p ___ p.id = l.___
WHERE l.commande_id = 14;`,
              blanks: [
                {
                  answers: ['JOIN'],
                  options: ['JOIN', 'WITH', 'AND', 'UNION'],
                  why: {
                    WITH: 'WITH sert à nommer une requête intermédiaire (unité 11), pas à joindre une table.',
                    AND: 'AND relie deux conditions ; il ne peut pas ajouter une table.',
                    UNION: 'UNION empile les lignes de deux requêtes, il ne les associe pas côte à côte.'
                  }
                },
                {
                  answers: ['ON'],
                  options: ['ON', 'WHERE', 'IF', 'USING'],
                  why: {
                    WHERE: 'La condition de jointure s\'écrit avec ON, juste après la table jointe ; WHERE vient après toutes les jointures.',
                    IF: 'IF n\'existe pas dans une requête SQLite.',
                    USING: 'USING existe, mais il attend un nom de colonne commun entre parenthèses, `USING (id)`, pas une égalité.'
                  }
                },
                {
                  answers: ['produit_id'],
                  options: ['produit_id', 'id', 'commande_id', 'nom'],
                  why: {
                    id: 'lignes_commande n\'a pas de colonne id : sa clé est le couple (commande_id, produit_id).',
                    commande_id: 'commande_id renvoie à la table commandes ; comparer un id de produit à un id de commande associerait n\'importe quoi.',
                    nom: 'lignes_commande ne contient pas le nom du produit, seulement son identifiant.'
                  }
                }
              ],
              hint: 'Dans lignes_commande, quelle colonne contient l\'identifiant du produit ?',
              explain: '`JOIN produits AS p ON p.id = l.produit_id` associe chaque ligne de commande à son produit. La commande 14 contient le clavier mécanique, la souris sans fil et le tapis de souris.'
            },
            {
              type: 'code',
              prompt: 'Affiche le **prénom** du client, l\'**id** et la **date** de la commande, pour toutes les commandes passées par des clients qui habitent à **Lyon**.',
              db: 'boutique',
              starter: `SELECT cl.prenom, co.id, co.date_commande
FROM commandes AS co;`,
              solution: `SELECT cl.prenom, co.id, co.date_commande
FROM commandes AS co
JOIN clients AS cl ON cl.id = co.client_id
WHERE cl.ville = 'Lyon';`,
              hint: 'Joins clients à commandes sur l\'identifiant du client, puis filtre sur la ville.',
              explain: 'La jointure apporte les colonnes du client à chaque commande ; WHERE garde celles des clients lyonnais : 8 commandes, passées par Camille, Hugo et Gabriel.'
            }
          ],
          challenge: {
            type: 'bug',
            prompt: 'Ce code doit afficher le client de chacune des **3** commandes annulées. Il ne renvoie que 2 lignes, dont Sarah Lefebvre, qui n\'a jamais commandé. Clique sur la ligne fautive.',
            db: 'boutique',
            code: `SELECT cl.prenom, cl.nom, co.date_commande
FROM commandes AS co
JOIN clients AS cl ON cl.id = co.id
WHERE co.statut = 'annulee';`,
            bugLine: 3,
            why: 'La condition compare l\'id du client à l\'id de la **commande**. La commande 13 est associée au client 13 (Sarah), et la commande 24 disparaît car il n\'existe pas de client 24. La bonne colonne est co.client_id.',
            fixes: [
              'JOIN clients AS cl ON cl.id = co.client_id',
              'JOIN clients AS cl ON cl.client_id = co.id',
              'JOIN clients AS cl',
              'LEFT JOIN clients AS cl ON cl.id = co.id'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: 'La table clients n\'a pas de colonne client_id : SQLite répond « no such column: cl.client_id ».',
              2: 'Sans condition, chaque commande annulée est associée à chacun des 21 clients : 63 lignes.',
              3: 'LEFT JOIN garde la commande 24, mais avec un client NULL, et les deux autres restent associées au mauvais client.'
            },
            hint: 'Quelle colonne de commandes contient l\'identifiant du client ?',
            explain: 'Une clé étrangère (client_id) se joint à la clé primaire de la table qu\'elle désigne (clients.id). Résultat corrigé : Chloé Robert, Adam Laurent et Nathan Richard. Ce bug ne provoque aucune erreur : relis toujours la condition ON.'
          },
          recap: [
            '`JOIN table AS alias ON condition` associe les lignes qui se correspondent.',
            'INNER JOIN (ou JOIN) ne garde que les lignes qui ont une correspondance des deux côtés.',
            'On joint une clé étrangère à la clé primaire qu\'elle désigne : `cl.id = co.client_id`.',
            'Préfixe les colonnes (`cl.nom`) ; sans ON, on obtient un produit cartésien.'
          ],
          check: {
            type: 'predict',
            prompt: 'Quelle valeur renvoie la dernière requête ?',
            code: `-- Données de l'exercice
CREATE TABLE auteurs (id INTEGER, nom TEXT);
CREATE TABLE livres (titre TEXT, auteur_id INTEGER);
INSERT INTO auteurs VALUES (1, 'Ada'), (2, 'Linus'), (3, 'Grace');
INSERT INTO livres VALUES
  ('Moteurs', 1), ('Noyaux', 2), ('Compilateurs', 3),
  ('Notes', 1), ('Brouillon', 9);

SELECT COUNT(*)
FROM livres
JOIN auteurs ON auteurs.id = livres.auteur_id;`,
            answer: '4',
            mistakes: [
              { answer: '5', why: '« Brouillon » a un auteur_id (9) qui n\'existe pas dans auteurs : sans correspondance, INNER JOIN écarte la ligne.' },
              { answer: '3', why: 'On compte les lignes du résultat, pas les auteurs : Ada apparaît deux fois, une par livre.' }
            ],
            hint: 'Associe chaque livre à son auteur. Que devient un livre dont l\'auteur n\'existe pas ?',
            explain: 'Quatre livres trouvent leur auteur (Ada compte pour deux livres) ; « Brouillon » n\'a pas de correspondance et INNER JOIN le retire. COUNT(*) vaut donc 4.'
          }
        },
        {
          id: 'sql.u7.l2',
          title: 'LEFT JOIN et lignes sans correspondance',
          minutes: 8,
          objective: 'Tu sais garder toutes les lignes d\'une table avec LEFT JOIN et repérer celles qui n\'ont pas de correspondance.',
          explain: `\`INNER JOIN\` élimine les lignes sans partenaire. Or on veut souvent les garder : les clients sans commande, les films jamais regardés. \`LEFT JOIN\` garde **toutes** les lignes de la table de gauche (celle du FROM) ; quand rien ne correspond à droite, les colonnes de droite valent NULL.

Pour trouver les « orphelins », on filtre sur ce NULL : \`LEFT JOIN visionnages AS v ON ... WHERE v.id IS NULL\`.

Pour compter en gardant les zéros, compte une colonne de droite, \`COUNT(v.id)\`, et non \`COUNT(*)\`, qui compterait 1 pour une ligne sans correspondance.

Piège classique : une condition sur la table de droite placée dans \`WHERE\` élimine les lignes NULL et annule l'effet du LEFT JOIN. Mets-la dans le \`ON\`.

SQLite accepte aussi \`RIGHT JOIN\` et \`FULL JOIN\` depuis sa version 3.39, mais un LEFT JOIN suffit presque toujours.`,
          example: {
            db: 'streaming',
            code: `SELECT r.nom, f.titre
FROM realisateurs AS r
LEFT JOIN films AS f ON f.realisateur_id = r.id
WHERE r.pays = 'France';`,
            output: `nom            | titre
---------------+----------------------------------
Céline Sciamma | Portrait de la jeune fille en feu
Justine Triet  | Anatomie d'une chute
Agnès Varda    | NULL`,
            notes: [
              { line: 2, text: 'realisateurs est la table de gauche : toutes ses lignes seront gardées.' },
              { line: 3, text: 'Agnès Varda n\'a aucun film dans le catalogue : elle reste, avec un titre NULL. Un JOIN simple l\'aurait fait disparaître.' },
              { line: 4, text: 'Ce WHERE porte sur la table de gauche : il ne gêne pas le LEFT JOIN.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'La table `realisateurs` compte 13 réalisateurs, dont 2 sans aucun film. Sur les 24 films, 21 ont un réalisateur et 3 ont un `realisateur_id` NULL. Combien de lignes renvoie cette requête ?',
              code: `SELECT r.nom, f.titre
FROM realisateurs AS r
LEFT JOIN films AS f ON f.realisateur_id = r.id;`,
              choices: ['23', '13', '24', '26'],
              answer: 0,
              why: {
                1: 'Un réalisateur apparaît une fois par film : Nolan, avec 3 films, occupe 3 lignes. Le résultat a donc plus de 13 lignes.',
                2: 'Les 3 films sans réalisateur ne sont reliés à aucune ligne de la table de gauche : un LEFT JOIN depuis realisateurs ne les garde pas.',
                3: 'Ce serait le cas d\'un FULL JOIN, qui garderait aussi les 3 films sans réalisateur.'
              },
              hint: 'Compte les lignes associées (un film avec son réalisateur), puis ajoute les réalisateurs de gauche restés seuls.',
              explain: 'Les 21 films qui ont un réalisateur donnent 21 lignes ; les 2 réalisateurs sans film sont gardés avec un titre NULL : 21 + 2 = 23.'
            },
            {
              type: 'fill',
              prompt: 'Complète la requête pour afficher le pseudo des utilisateurs qui n\'ont **jamais** regardé de film.',
              db: 'streaming',
              code: `SELECT u.pseudo
FROM utilisateurs AS u
___ visionnages AS v ON v.utilisateur_id = u.id
WHERE v.id ___;`,
              blanks: [
                {
                  answers: ['LEFT JOIN'],
                  options: ['LEFT JOIN', 'JOIN', 'INNER JOIN', 'CROSS JOIN'],
                  why: {
                    JOIN: 'Un JOIN simple supprime justement les utilisateurs sans visionnage : le résultat serait vide.',
                    'INNER JOIN': 'INNER JOIN est identique à JOIN : les utilisateurs sans correspondance disparaissent.',
                    'CROSS JOIN': 'CROSS JOIN associe chaque utilisateur à chaque visionnage, sans tenir compte de la condition.'
                  }
                },
                {
                  answers: ['IS NULL'],
                  options: ['IS NULL', '= NULL', '= 0', 'IS NOT NULL'],
                  why: {
                    '= NULL': 'Une comparaison avec NULL ne vaut jamais vrai : aucune ligne ne passerait.',
                    '= 0': 'Il n\'existe aucun visionnage d\'id 0 : sans correspondance, v.id vaut NULL, pas 0.',
                    'IS NOT NULL': 'Ce filtre garderait au contraire les utilisateurs qui ont regardé des films.'
                  }
                }
              ],
              hint: 'Il faut garder tous les utilisateurs, puis ne retenir que ceux pour qui la partie « visionnage » est vide.',
              explain: 'LEFT JOIN garde chaque utilisateur ; pour ceux qui n\'ont aucun visionnage, toutes les colonnes de v valent NULL. `WHERE v.id IS NULL` les isole : zoe et rayan.'
            }
          ],
          challenge: {
            type: 'bug',
            prompt: 'Ce code doit afficher **tous** les utilisateurs avec leur nombre de films notés 5, y compris ceux qui en ont 0. Or ces derniers disparaissent. Clique sur la ligne fautive.',
            db: 'streaming',
            code: `SELECT u.pseudo, COUNT(v.id) AS nb_notes_5
FROM utilisateurs AS u
LEFT JOIN visionnages AS v ON v.utilisateur_id = u.id
WHERE v.note = 5
GROUP BY u.pseudo;`,
            bugLine: 4,
            why: 'Le WHERE s\'applique après la jointure : il élimine toutes les lignes où v.note n\'est pas 5, y compris les lignes NULL ajoutées par le LEFT JOIN. Les utilisateurs sans note 5 disparaissent avant le GROUP BY.',
            fixes: ['  AND v.note = 5', 'WHERE v.note = 5 OR v.note IS NULL', 'HAVING v.note = 5', 'WHERE v.note >= 5'],
            fixAnswer: 0,
            fixWhy: {
              1: 'Les utilisateurs sans aucun visionnage reviennent, mais pas ceux qui ont regardé des films sans jamais mettre 5 (hugo.r, chloe_l). Et les visionnages sans note (NULL) seraient comptés comme des 5 : marco passerait de 0 à 1.',
              2: 'HAVING doit suivre GROUP BY, et v.note n\'est pas un agrégat : la requête serait fausse.',
              3: 'La note maximale est 5 : `>= 5` équivaut à `= 5`, le problème reste entier.'
            },
            hint: 'Une condition sur la table de droite peut aussi faire partie de la condition de jointure. La ligne 3 se termine sans point-virgule…',
            explain: 'En remplaçant la ligne 4 par `AND v.note = 5`, la condition rejoint le ON : seuls les visionnages notés 5 sont associés, et les autres utilisateurs restent avec des colonnes NULL, comptées 0 par COUNT(v.id). Les 15 utilisateurs apparaissent.'
          },
          recap: [
            'LEFT JOIN garde toutes les lignes de la table de gauche ; sans correspondance, la droite vaut NULL.',
            '`LEFT JOIN ... WHERE droite.id IS NULL` trouve les lignes sans correspondance.',
            '`COUNT(droite.col)` compte 0 pour une ligne sans correspondance, COUNT(*) compterait 1.',
            'Une condition sur la table de droite se met dans le ON, pas dans le WHERE.'
          ],
          check: {
            type: 'code',
            prompt: 'Pour **chaque film**, affiche le **titre** et le **nombre de visionnages**, y compris les films jamais regardés (0). Trie du plus regardé au moins regardé, puis par titre en cas d\'égalité.',
            db: 'streaming',
            ordered: true,
            starter: `SELECT f.titre, COUNT(*) AS vues
FROM films AS f
JOIN visionnages AS v ON v.film_id = f.id
GROUP BY f.id;`,
            solution: `SELECT f.titre, COUNT(v.id) AS vues
FROM films AS f
LEFT JOIN visionnages AS v ON v.film_id = f.id
GROUP BY f.id
ORDER BY vues DESC, f.titre;`,
            hint: 'Trois changements : garder les films sans visionnage, compter une colonne de la table de droite, et trier sur deux critères.',
            explain: 'LEFT JOIN garde les 24 films ; COUNT(v.id) vaut 0 pour Whiplash et Everything Everywhere All at Once, que personne n\'a regardés. Avec COUNT(*), ils auraient compté 1.'
          }
        }
      ]
    },
    {
      id: 'sql.u8',
      title: 'Clés primaires et étrangères',
      summary: 'Garantir l\'identité de chaque ligne et la cohérence des liens entre tables.',
      lessons: [
        {
          id: 'sql.u8.l1',
          title: 'Identifier et relier : les clés',
          minutes: 7,
          objective: 'Tu sais déclarer une clé primaire, une clé étrangère et des contraintes simples, et activer leur contrôle dans SQLite.',
          explain: `La **clé primaire** (\`PRIMARY KEY\`) identifie chaque ligne de façon unique : deux clients peuvent avoir le même nom, jamais le même \`id\`. Elle peut porter sur plusieurs colonnes : \`PRIMARY KEY (commande_id, produit_id)\`. En SQLite, \`id INTEGER PRIMARY KEY\` est un alias du numéro de ligne interne (le rowid) et se remplit tout seul.

La **clé étrangère** (\`REFERENCES clients(id)\`) impose que la valeur existe dans l'autre table : impossible de créer une commande pour un client inexistant. C'est l'intégrité référentielle.

D'autres contraintes protègent les données : \`NOT NULL\` (obligatoire), \`UNIQUE\` (pas de doublon), \`CHECK (quantite > 0)\` (règle métier), \`DEFAULT\` (valeur par défaut).

**Particularité de SQLite** : le contrôle des clés étrangères est désactivé par défaut. Il faut exécuter \`PRAGMA foreign_keys = ON;\` à chaque connexion, sinon les REFERENCES ne sont pas vérifiées.`,
          example: {
            code: `PRAGMA foreign_keys = ON;  -- SQLite : contrôle désactivé par défaut

CREATE TABLE equipes (
  id  INTEGER PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE
);
CREATE TABLE membres (
  id        INTEGER PRIMARY KEY,
  pseudo    TEXT NOT NULL,
  equipe_id INTEGER NOT NULL REFERENCES equipes(id)
);
INSERT INTO equipes (nom) VALUES ('data'), ('web');
INSERT INTO membres (pseudo, equipe_id) VALUES ('ada', 1), ('linus', 2);
INSERT INTO membres (pseudo, equipe_id) VALUES ('grace', 7);`,
            notes: [
              { line: 1, text: 'Sans cette ligne, SQLite accepterait la dernière insertion sans rien dire.' },
              { line: 5, text: 'UNIQUE interdit deux équipes du même nom ; NOT NULL interdit un nom vide (NULL).' },
              { line: 10, text: 'La clé étrangère : equipe_id doit correspondre à un id existant de la table equipes.' },
              { line: 14, text: 'L\'équipe 7 n\'existe pas : SQLite refuse l\'insertion avec l\'erreur « FOREIGN KEY constraint failed ».' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'On reprend les tables de l\'exemple, mais **sans** la ligne `PRAGMA foreign_keys = ON;`. Que se passe-t-il quand on insère un membre avec `equipe_id = 7` (équipe inexistante) ?',
              choices: [
                'L\'insertion réussit : par défaut, SQLite ne vérifie pas les clés étrangères',
                'L\'insertion échoue : REFERENCES est toujours vérifié',
                'SQLite crée automatiquement l\'équipe 7',
                'SQLite remplace 7 par NULL'
              ],
              answer: 0,
              why: {
                1: 'C\'est le cas dans PostgreSQL, MySQL (InnoDB) ou SQL Server, mais pas dans SQLite, qui garde ce contrôle désactivé par défaut pour rester compatible avec ses anciennes versions.',
                2: 'Aucune base ne crée de ligne à ta place : une clé étrangère sert à refuser, pas à compléter.',
                3: 'SQLite ne modifie jamais silencieusement la valeur insérée. Et la colonne est déclarée NOT NULL.'
              },
              hint: 'Relis la particularité de SQLite signalée dans la leçon.',
              explain: 'Sans PRAGMA foreign_keys = ON, la déclaration REFERENCES est enregistrée mais pas appliquée : la ligne orpheline est acceptée. Dans une application, on exécute ce PRAGMA à chaque ouverture de connexion.'
            },
            {
              type: 'code',
              prompt: 'La table `equipes` existe déjà (data = 1, web = 2). Corrige la création de la table `projets` : `id` doit être la **clé primaire**, `nom` doit être **obligatoire**, et `equipe_id` doit être une **clé étrangère** vers `equipes(id)`. Garde l\'insertion du projet.',
              setup: `CREATE TABLE equipes (id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE);
INSERT INTO equipes (nom) VALUES ('data'), ('web');`,
              starter: `CREATE TABLE projets (
  id INTEGER,
  nom TEXT,
  equipe_id INTEGER
);
INSERT INTO projets (nom, equipe_id) VALUES ('Recommandation de films', 1);`,
              solution: `CREATE TABLE projets (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  equipe_id INTEGER REFERENCES equipes(id)
);
INSERT INTO projets (nom, equipe_id) VALUES ('Recommandation de films', 1);`,
              verify: `SELECT p.nom, e.nom,
  (SELECT pk FROM pragma_table_info('projets') WHERE name = 'id') AS cle_primaire,
  (SELECT "notnull" FROM pragma_table_info('projets') WHERE name = 'nom') AS nom_obligatoire,
  (SELECT COUNT(*) FROM pragma_foreign_key_list('projets') WHERE "table" = 'equipes' AND "from" = 'equipe_id') AS cle_etrangere
FROM projets AS p
JOIN equipes AS e ON e.id = p.equipe_id`,
              hint: 'Chaque contrainte s\'ajoute après le type de sa colonne : PRIMARY KEY, NOT NULL, REFERENCES table(colonne).',
              explain: 'La vérification lit la structure de la table (clé primaire, NOT NULL, clé étrangère) et contrôle que le projet est bien rattaché à l\'équipe data. `REFERENCES equipes(id)` suffit pour déclarer la clé étrangère.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'La table `tickets (id INTEGER PRIMARY KEY, titre TEXT)` contient les id 1 à 5. On supprime le ticket 5, puis on insère un nouveau ticket **sans préciser l\'id**. Quel id reçoit-il ?',
            code: `DELETE FROM tickets WHERE id = 5;
INSERT INTO tickets (titre) VALUES ('Nouveau ticket');`,
            answer: '5',
            accept: ['cinq'],
            mistakes: [
              { answer: '6', why: 'Ce serait le cas avec le mot-clé AUTOINCREMENT, qui interdit de réutiliser un id. Sans lui, SQLite prend le plus grand id existant (4) plus 1.' }
            ],
            hint: 'Relis la règle : sans id fourni, SQLite prend le plus grand id **existant** plus 1. Quel est-il après la suppression ?',
            explain: 'Après la suppression, le plus grand id est 4 : le nouveau ticket reçoit 5, l\'ancien numéro. Si un id ne doit jamais être réutilisé (références externes, journaux), on déclare `id INTEGER PRIMARY KEY AUTOINCREMENT`.'
          },
          recap: [
            'PRIMARY KEY identifie chaque ligne ; elle peut être composée de plusieurs colonnes.',
            'REFERENCES table(col) déclare une clé étrangère : la valeur doit exister dans l\'autre table.',
            'NOT NULL, UNIQUE, CHECK et DEFAULT protègent la qualité des données.',
            'SQLite : `PRAGMA foreign_keys = ON;` à chaque connexion, sinon les clés étrangères ne sont pas vérifiées.'
          ],
          check: {
            type: 'fill',
            prompt: 'Complète la table de liaison entre commandes et produits : chaque ligne doit désigner une commande existante, la quantité doit être positive, et un même produit ne peut apparaître qu\'une fois par commande.',
            code: `CREATE TABLE lignes (
  commande_id INTEGER NOT NULL ___ commandes(id),
  produit_id  INTEGER NOT NULL REFERENCES produits(id),
  quantite    INTEGER NOT NULL ___ (quantite > 0),
  ___ (commande_id, produit_id)
);`,
            blanks: [
              {
                answers: ['REFERENCES'],
                options: ['REFERENCES', 'FOREIGN', 'LINK', 'JOIN'],
                why: {
                  FOREIGN: 'FOREIGN KEY s\'écrit en fin de table (`FOREIGN KEY (col) REFERENCES ...`). Collé à la colonne, on écrit directement REFERENCES.',
                  LINK: 'LINK n\'est pas un mot-clé SQL.',
                  JOIN: 'JOIN s\'utilise dans les requêtes, pas dans la définition d\'une table.'
                }
              },
              {
                answers: ['CHECK'],
                options: ['CHECK', 'WHERE', 'IF', 'UNIQUE'],
                why: {
                  WHERE: 'WHERE filtre les lignes d\'une requête ; une règle de validation se déclare avec CHECK.',
                  IF: 'IF n\'existe pas dans un CREATE TABLE.',
                  UNIQUE: 'UNIQUE interdit les doublons, il ne vérifie pas qu\'une valeur est positive.'
                }
              },
              {
                answers: ['PRIMARY KEY'],
                options: ['PRIMARY KEY', 'UNIQUE KEY', 'INDEX', 'GROUP BY'],
                why: {
                  'UNIQUE KEY': 'UNIQUE KEY est une syntaxe MySQL ; SQLite attend UNIQUE (...) ou PRIMARY KEY (...).',
                  INDEX: 'Un index se crée à part avec CREATE INDEX ; il n\'identifie pas les lignes.',
                  'GROUP BY': 'GROUP BY appartient aux requêtes SELECT.'
                }
              }
            ],
            hint: 'Trois contraintes : un lien vers une autre table, une règle sur une valeur, et une clé sur deux colonnes.',
            explain: 'REFERENCES relie la ligne à une commande existante, CHECK refuse une quantité nulle ou négative, et la clé primaire composée (commande_id, produit_id) empêche d\'avoir deux fois le même produit dans une commande.'
          }
        }
      ]
    },
    {
      id: 'sql.u9',
      title: 'Relations entre tables',
      summary: 'Reconnaître et représenter les relations 1-n et n-n, avec leur table de liaison.',
      lessons: [
        {
          id: 'sql.u9.l1',
          title: 'Un à plusieurs, plusieurs à plusieurs',
          minutes: 8,
          objective: 'Tu sais reconnaître une relation 1-n ou n-n, la représenter avec des clés étrangères ou une table de liaison, et l\'interroger.',
          explain: `Trois formes de relations :

- **1-n** (un à plusieurs) : un client passe plusieurs commandes, une commande appartient à un seul client. La clé étrangère va du côté « plusieurs » : \`commandes.client_id\`.
- **n-n** (plusieurs à plusieurs) : une commande contient plusieurs produits, un produit apparaît dans plusieurs commandes. Aucune des deux tables ne peut porter la clé : on crée une **table de liaison**, ici \`lignes_commande\`, avec deux clés étrangères. Elle porte aussi les informations du lien : quantité, prix payé.
- **1-1** : plus rare, par exemple un profil détaillé séparé du compte.

Pour interroger une relation n-n, on traverse la table de liaison : deux JOIN.

Dans la base streaming, \`films.realisateur_id\` n'autorise qu'un réalisateur par film. Pour Matrix ou Intouchables, réalisés à deux, la colonne est restée NULL : le bon modèle serait une table de liaison \`film_realisateurs (film_id, realisateur_id)\`.`,
          example: {
            db: 'boutique',
            code: `SELECT co.id AS commande, p.nom, l.quantite
FROM commandes AS co
JOIN lignes_commande AS l ON l.commande_id = co.id
JOIN produits AS p ON p.id = l.produit_id
WHERE co.client_id = 1 AND co.statut = 'livree'
ORDER BY co.id, p.nom;`,
            output: `commande | nom                  | quantite
---------+----------------------+---------
1        | Clavier mécanique    | 1
1        | Câble USB-C          | 2
4        | Souris sans fil      | 1
4        | Tapis de souris XXL  | 1
16       | Support d'ordinateur | 1`,
            notes: [
              { line: 3, text: 'Premier JOIN : de la commande vers ses lignes (relation 1-n).' },
              { line: 4, text: 'Second JOIN : de chaque ligne vers son produit. La table de liaison relie commandes et produits (n-n).' },
              { line: 6, text: '« Clavier » passe avant « Câble » : SQLite compare les octets, et « â » vient après « l ».' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Sur la plateforme de streaming, un utilisateur peut regarder plusieurs films, et un film est regardé par plusieurs utilisateurs. Comment représenter ce lien ?',
              choices: [
                'C\'est une relation n-n : une table de liaison (visionnages) avec une clé étrangère vers chaque table',
                'C\'est une relation 1-n : une colonne film_id dans utilisateurs suffit',
                'C\'est une relation 1-n : une colonne utilisateur_id dans films suffit',
                'Une colonne films_vus dans utilisateurs, avec la liste des id séparés par des virgules'
              ],
              answer: 0,
              why: {
                1: 'Une colonne film_id dans utilisateurs ne peut contenir qu\'un seul film par utilisateur.',
                2: 'Une colonne utilisateur_id dans films ne permettrait qu\'un seul spectateur par film.',
                3: 'Une liste dans une case (« 1,4,7 ») ne se joint pas, ne se vérifie pas et se filtre mal : c\'est le défaut que la table de liaison évite.'
              },
              hint: 'Regarde le lien dans les deux sens : combien de films par utilisateur, combien d\'utilisateurs par film ?',
              explain: 'Plusieurs dans les deux sens : relation n-n, donc table de liaison. La table visionnages joue ce rôle et porte en plus les informations du lien : date, minutes vues, note.'
            },
            {
              type: 'code',
              prompt: 'Affiche les **titres** des films regardés par l\'utilisateur **kenji**, **sans doublon**, triés par titre.',
              db: 'streaming',
              ordered: true,
              starter: `SELECT f.titre
FROM films AS f;`,
              solution: `SELECT DISTINCT f.titre
FROM utilisateurs AS u
JOIN visionnages AS v ON v.utilisateur_id = u.id
JOIN films AS f ON f.id = v.film_id
WHERE u.pseudo = 'kenji'
ORDER BY f.titre;`,
              hint: 'Pars des utilisateurs, traverse la table de liaison visionnages, arrive aux films. kenji a regardé un film deux fois.',
              explain: 'Deux JOIN traversent la relation n-n. kenji a revu « Le Voyage de Chihiro » : sans DISTINCT, ce titre apparaîtrait deux fois. Résultat : 3 titres.'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Des articles de blog sont reliés à des tags par une table de liaison. Quelle valeur renvoie la dernière requête ?',
            code: `-- Données de l'exercice
CREATE TABLE articles (id INTEGER PRIMARY KEY, titre TEXT);
CREATE TABLE tags (id INTEGER PRIMARY KEY, nom TEXT);
CREATE TABLE article_tags (article_id INTEGER, tag_id INTEGER);
INSERT INTO articles VALUES (1, 'Débuter en SQL'), (2, 'Jointures'), (3, 'Git rebase');
INSERT INTO tags VALUES (1, 'sql'), (2, 'git'), (3, 'débutant');
INSERT INTO article_tags VALUES (1, 1), (1, 3), (2, 1), (3, 2), (3, 3);

SELECT COUNT(DISTINCT at.article_id)
FROM article_tags AS at
JOIN tags AS t ON t.id = at.tag_id
WHERE t.nom IN ('sql', 'débutant');`,
            answer: '3',
            mistakes: [
              { answer: '4', why: 'Quatre liens correspondent, mais l\'article 1 en a deux (sql et débutant). COUNT(DISTINCT article_id) ne le compte qu\'une fois.' },
              { answer: '2', why: '« Git rebase » a aussi le tag débutant (lien 3, 3) : il fait partie du résultat.' }
            ],
            hint: 'Liste les liens dont le tag est sql (1) ou débutant (3), puis compte les articles différents.',
            explain: 'Liens retenus : (1, 1), (1, 3), (2, 1), (3, 3). Articles différents : 1, 2 et 3. DISTINCT est indispensable dès qu\'une ligne peut être atteinte par plusieurs chemins de la table de liaison.'
          },
          recap: [
            '1-n : la clé étrangère va du côté « plusieurs ».',
            'n-n : une table de liaison avec deux clés étrangères, qui peut porter les informations du lien.',
            'Interroger une relation n-n : deux JOIN à travers la table de liaison.',
            'DISTINCT évite les doublons quand une ligne est atteinte plusieurs fois.'
          ],
          check: {
            type: 'order',
            prompt: 'Remets les lignes dans l\'ordre pour afficher le pseudo et le titre de chaque visionnage d\'un film d\'animation.',
            db: 'streaming',
            lines: [
              'SELECT u.pseudo, f.titre',
              'FROM utilisateurs AS u',
              'JOIN visionnages AS v ON v.utilisateur_id = u.id',
              'JOIN films AS f ON f.id = v.film_id',
              "WHERE f.genre = 'Animation';"
            ],
            hint: 'Une condition ON ne peut utiliser que des tables déjà citées au-dessus d\'elle.',
            explain: 'On part des utilisateurs, on rejoint la table de liaison, puis les films : le second ON utilise l\'alias v, qui doit donc être défini avant. Le WHERE vient après toutes les jointures.'
          }
        }
      ]
    },
    {
      id: 'sql.u10',
      title: 'Modélisation',
      summary: 'Concevoir des tables sans répétition et choisir les bons types.',
      lessons: [
        {
          id: 'sql.u10.l1',
          title: 'Concevoir des tables saines',
          minutes: 8,
          objective: 'Tu sais repérer les défauts d\'une table (répétitions, cases à plusieurs valeurs) et choisir des types adaptés pour chaque colonne.',
          explain: `Modéliser, c'est décider quelles tables créer et ce que contient chaque colonne. Trois signaux d'alerte :

- une même information **recopiée** sur plusieurs lignes (la ville du client dans chaque commande) : un jour, une copie sera modifiée et pas les autres ;
- **plusieurs valeurs dans une case** (\`'python, sql, git'\`) : impossible à filtrer ou à compter proprement ;
- des **colonnes numérotées** (\`produit1\`, \`produit2\`, \`produit3\`) : il manque une table.

La normalisation, en version simple : une valeur par case, une table par sujet, chaque information stockée une seule fois et désignée ailleurs par sa clé. On ne stocke pas non plus ce qui se calcule (un total de commande).

Types en SQLite : \`INTEGER\`, \`REAL\`, \`TEXT\`, \`BLOB\`. Pas de type date ni booléen : dates en texte \`AAAA-MM-JJ\`, booléens en 0/1. SQLite est souple : une colonne REAL accepte un texte comme \`'abc'\`. Ajoute \`STRICT\` après la parenthèse finale du CREATE TABLE pour qu'il refuse.`,
          example: {
            code: `-- Avant : commandes_brutes(id, client_nom, client_ville, produits)
--   (12, 'Ada Lovelace', 'Lyon', 'clavier, souris')

-- Après : une table par sujet, reliées par des clés
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  ville TEXT
) STRICT;
CREATE TABLE commandes (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  date_commande TEXT NOT NULL  -- format AAAA-MM-JJ
) STRICT;`,
            notes: [
              { line: 1, text: 'La table brute répète le nom et la ville du client à chaque commande, et range plusieurs produits dans une seule case.' },
              { line: 9, text: 'STRICT : SQLite refusera, par exemple, un texte dans une colonne INTEGER.' },
              { line: 12, text: 'La commande ne garde que l\'identifiant du client : le nom et la ville sont stockés une seule fois.' },
              { line: 13, text: 'Les produits iraient dans une table de liaison lignes_commande, comme à l\'unité 9.' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Quel est le principal défaut de cette table d\'inscriptions à des ateliers ?',
              code: `-- id | membre | email_membre      | atelier | date_atelier
-- 1  | Ada    | ada@example.com   | SQL     | 2026-11-04
-- 2  | Ada    | ada@example.com   | Git     | 2026-11-18
-- 3  | Linus  | linus@example.com | Git     | 2026-11-18`,
              choices: [
                'L\'email d\'un membre et la date d\'un atelier sont recopiés à chaque inscription : un changement oublié sur une ligne rend la base incohérente',
                'Les dates devraient être écrites au format JJ/MM/AAAA',
                'La colonne id est inutile, car le nom du membre suffit',
                'Une table ne devrait pas avoir plus de quatre colonnes'
              ],
              answer: 0,
              why: {
                1: 'Le format AAAA-MM-JJ est le bon choix : il se trie et se compare correctement en texte, ce que JJ/MM/AAAA ne permet pas.',
                2: 'Deux membres peuvent porter le même nom : il faut un identifiant unique.',
                3: 'Le nombre de colonnes n\'est pas un critère : ce qui compte, c\'est que chaque information soit stockée une seule fois.'
              },
              hint: 'Imagine qu\'Ada change d\'adresse email, ou que l\'atelier Git est déplacé.',
              explain: 'Le modèle sain sépare trois tables : membres (id, nom, email), ateliers (id, sujet, date) et inscriptions (membre_id, atelier_id). Chaque information n\'est alors stockée qu\'une fois.'
            },
            {
              type: 'bug',
              prompt: 'Les prix viennent d\'un fichier CSV, donc sous forme de texte. Le tri par prix donne Souris, Écran, Câble au lieu de Câble (9,90), Souris (24,90), Écran (249). Clique sur la ligne fautive.',
              code: `CREATE TABLE produits (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  prix TEXT NOT NULL
);
INSERT INTO produits (nom, prix) VALUES ('Câble', '9.9'), ('Écran', '249'), ('Souris', '24.9');
SELECT nom FROM produits ORDER BY prix;`,
              bugLine: 4,
              why: 'Avec le type TEXT, les prix restent du texte et sont triés caractère par caractère : « 24.9 » < « 249 » < « 9.9 », comme dans un dictionnaire.',
              fixes: ['  prix REAL NOT NULL', '  prix TEXT', '  prix BLOB NOT NULL', '  prix TEXT NOT NULL UNIQUE'],
              fixAnswer: 0,
              fixWhy: {
                1: 'Retirer NOT NULL ne change pas le type : le tri reste alphabétique.',
                2: 'BLOB stocke les valeurs telles quelles, donc en texte ici : le tri reste faux.',
                3: 'UNIQUE interdit les doublons mais ne change pas le type : le tri reste alphabétique.'
              },
              hint: 'Quel type faut-il pour qu\'un prix soit comparé comme un nombre ?',
              explain: 'Avec REAL, SQLite convertit le texte \'9.9\' en nombre au moment de l\'insertion, et le tri devient numérique. Choisir le bon type, c\'est aussi garantir des tris, des comparaisons et des calculs justes.'
            }
          ],
          challenge: {
            type: 'logic',
            prompt: 'Cette feuille de calcul d\'inscriptions doit être normalisée en trois tables : `membres`, `ateliers` et `inscriptions` (membre_id, atelier_id), sans doublon. Combien de lignes contiendra la table **inscriptions** ?',
            code: `-- membre | email             | atelier | date
-- Ada    | ada@example.com   | SQL     | 2026-11-04
-- Linus  | linus@example.com | SQL     | 2026-11-04
-- Ada    | ada@example.com   | Git     | 2026-11-18
-- Grace  | grace@example.com | Git     | 2026-11-18
-- Linus  | linus@example.com | Git     | 2026-11-18
-- Ada    | ada@example.com   | SQL     | 2026-11-04`,
            answer: '5',
            accept: ['cinq'],
            mistakes: [
              { answer: '6', why: 'La dernière ligne répète exactement la première (Ada à l\'atelier SQL) : c\'est un doublon, une seule inscription.' },
              { answer: '3', why: '3, c\'est le nombre de membres. La table inscriptions contient un lien par couple (membre, atelier).' }
            ],
            hint: 'Une inscription = un couple (membre, atelier) différent. Repère les lignes identiques.',
            explain: 'Couples différents : (Ada, SQL), (Linus, SQL), (Ada, Git), (Grace, Git), (Linus, Git). Au total, 3 membres + 2 ateliers + 5 inscriptions : chaque email et chaque date n\'apparaissent plus qu\'une fois.'
          },
          recap: [
            'Alerte : informations recopiées, plusieurs valeurs dans une case, colonnes numérotées.',
            'Une valeur par case, une table par sujet, chaque information stockée une fois et désignée par sa clé.',
            'SQLite : INTEGER, REAL, TEXT, BLOB ; dates en texte AAAA-MM-JJ, booléens en 0/1.',
            '`STRICT` fait respecter les types déclarés.'
          ],
          check: {
            type: 'code',
            prompt: 'Crée en mode **STRICT** la table `mesures` d\'un capteur de salle serveur : `id` (INTEGER, clé primaire), `capteur` (TEXT, obligatoire), `date_mesure` (TEXT, obligatoire, format AAAA-MM-JJ) et `temperature` (REAL, facultative). Puis insère la mesure du capteur `salle-serveurs` du `2026-10-28` : 21.5 degrés.',
            starter: `CREATE TABLE mesures (
  id INTEGER PRIMARY KEY,
  capteur TEXT,
  date_mesure TEXT,
  temperature TEXT
);
INSERT INTO mesures (capteur, date_mesure, temperature)
VALUES ('salle-serveurs', '2026-10-28', '21.5');`,
            solution: `CREATE TABLE mesures (
  id INTEGER PRIMARY KEY,
  capteur TEXT NOT NULL,
  date_mesure TEXT NOT NULL,
  temperature REAL
) STRICT;
INSERT INTO mesures (capteur, date_mesure, temperature)
VALUES ('salle-serveurs', '2026-10-28', 21.5);`,
            setup: '-- Base vide : tu crées toi-même la table.',
            verify: `SELECT name, upper(type), CASE WHEN pk = 1 THEN 0 ELSE "notnull" END, pk
FROM pragma_table_info('mesures')
UNION ALL
SELECT 'strict', (SELECT strict FROM pragma_table_list WHERE name = 'mesures'), NULL, NULL
UNION ALL
SELECT capteur, date_mesure, temperature, typeof(temperature) FROM mesures`,
            hint: 'Trois corrections dans la définition (deux NOT NULL, un type) et un mot-clé après la parenthèse finale. Pense aussi à la valeur insérée.',
            explain: 'La vérification lit la structure de la table : types, colonnes obligatoires, clé primaire et mode STRICT, puis contrôle que la température est bien stockée comme un nombre (real). En mode STRICT, insérer \'abc\' dans temperature serait refusé.'
          }
        }
      ]
    }
  ]
});
