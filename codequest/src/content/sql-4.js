// Parcours SQL et bases de données (4/4) : chapitre 4 « Requêtes avancées ».
CQ.addChapter('sql', {
  id: 'sql.c4',
  title: 'Requêtes avancées',
  units: [
    {
      id: 'sql.u11',
      title: 'Requêtes imbriquées',
      summary: 'Utiliser le résultat d\'une requête dans une autre : sous-requêtes, EXISTS et étapes nommées avec WITH.',
      lessons: [
        {
          id: 'sql.u11.l1',
          title: 'Sous-requêtes : une valeur, une liste',
          minutes: 8,
          objective: 'Tu sais utiliser une sous-requête comme valeur ou comme liste dans un WHERE, et éviter le piège de NOT IN avec NULL.',
          explain: `Une **sous-requête** est un SELECT entre parenthèses, placé dans une autre requête. Trois usages courants :

- **une valeur** : \`WHERE prix > (SELECT AVG(prix) FROM produits)\`. La sous-requête doit renvoyer une seule ligne et une seule colonne.
- **une liste**, avec IN : \`WHERE id IN (SELECT client_id FROM commandes WHERE statut = 'en_attente')\`. Une seule colonne, autant de lignes que nécessaire.
- **une table** dans le FROM, avec un alias : \`FROM (SELECT ...) AS t\`.

Lis une sous-requête de l'intérieur vers l'extérieur, et exécute-la d'abord seule pour vérifier ce qu'elle renvoie.

Deux pièges. Si une sous-requête « valeur » renvoie plusieurs lignes, SQLite garde la première sans prévenir (PostgreSQL refuse). Et \`NOT IN\` n'est plus jamais vrai dès que la liste contient un NULL : filtre avec \`IS NOT NULL\` ou utilise \`NOT EXISTS\` (leçon suivante).`,
          example: {
            db: 'boutique',
            code: `SELECT nom, prix
FROM produits
WHERE prix > (SELECT AVG(prix) FROM produits)
ORDER BY prix DESC;`,
            output: `nom                  | prix
---------------------+-----
Écran 27 pouces      | 249
Casque audio         | 129
Disque SSD 1 To      | 99.9
Clavier mécanique    | 89.9
Carte Raspberry Pi 5 | 89.9
Enceinte portable    | 79
Micro USB            | 69.9`,
            notes: [
              { line: 3, text: 'La sous-requête calcule une seule valeur, le prix moyen (64,005 €), puis chaque produit est comparé à cette valeur.' },
              { line: 4, text: 'Impossible d\'écrire `WHERE prix > AVG(prix)` : un agrégat ne peut pas apparaître dans un WHERE. La sous-requête contourne ce problème, et le tri s\'applique au résultat final.' }
            ]
          },
          exercises: [
            {
              type: 'code',
              prompt: 'Avec une sous-requête **IN**, affiche le **prénom** et le **nom** des clients qui ont au moins une commande au statut `en_attente`.',
              db: 'boutique',
              starter: `SELECT prenom, nom
FROM clients
WHERE id IN ();`,
              solution: `SELECT prenom, nom
FROM clients
WHERE id IN (SELECT client_id FROM commandes WHERE statut = 'en_attente');`,
              hint: 'La sous-requête doit renvoyer une seule colonne : les identifiants des clients concernés, pris dans la table commandes.',
              explain: 'La sous-requête renvoie la liste des client_id des commandes en attente (20 et 5) ; IN garde les clients dont l\'id fait partie de cette liste : Chloé Robert et Noah Fournier.'
            },
            {
              type: 'qcm',
              prompt: 'Dans `SELECT nom FROM produits WHERE prix > ( ... )`, quelle sous-requête convient pour garder les produits plus chers que la moyenne ?',
              choices: [
                'SELECT AVG(prix) FROM produits',
                'SELECT prix FROM produits',
                'SELECT nom, prix FROM produits',
                'SELECT categorie, AVG(prix) FROM produits GROUP BY categorie'
              ],
              answer: 0,
              why: {
                1: 'Elle renvoie 20 prix. SQLite ne garde que le premier (89,90 €, celui du clavier) sans prévenir, et PostgreSQL refuserait : le résultat n\'a pas de sens.',
                2: 'Deux colonnes là où une seule valeur est attendue : SQLite répond « row value misused ».',
                3: 'Une ligne par catégorie et deux colonnes : SQLite répond « row value misused ».'
              },
              hint: 'Après un opérateur de comparaison comme `>`, il faut une seule valeur.',
              explain: 'AVG(prix) sans GROUP BY renvoie exactement une ligne et une colonne : une valeur, que `>` peut comparer à chaque prix.'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Quelle valeur renvoie la dernière requête ? Elle cherche les produits jamais vendus.',
            code: `-- Données de l'exercice
CREATE TABLE produits (id INTEGER, nom TEXT);
CREATE TABLE ventes (produit_id INTEGER);
INSERT INTO produits VALUES (1, 'clavier'), (2, 'souris'), (3, 'écran');
INSERT INTO ventes VALUES (1), (1), (NULL);

SELECT COUNT(*) FROM produits
WHERE id NOT IN (SELECT produit_id FROM ventes);`,
            answer: '0',
            accept: ['zéro', 'zero'],
            mistakes: [
              { answer: '2', why: 'C\'est la réponse attendue… sans la vente dont produit_id est NULL. `2 NOT IN (1, 1, NULL)` revient à `2 <> 1 AND 2 <> 1 AND 2 <> NULL` : la dernière comparaison vaut NULL, donc le tout n\'est jamais vrai.' }
            ],
            hint: 'Développe `2 NOT IN (1, 1, NULL)` en une suite de comparaisons reliées par AND.',
            explain: 'Une seule valeur NULL dans la liste suffit à rendre NOT IN inutilisable : aucune ligne n\'est gardée et COUNT vaut 0. Correction : `SELECT produit_id FROM ventes WHERE produit_id IS NOT NULL`, ou NOT EXISTS.'
          },
          recap: [
            'Une sous-requête « valeur » renvoie une ligne et une colonne : `WHERE prix > (SELECT AVG(prix) ...)`.',
            'Une sous-requête « liste » s\'utilise avec IN : une colonne, plusieurs lignes.',
            'Teste toujours la sous-requête seule avant de l\'imbriquer.',
            'NOT IN échoue en silence si la liste contient un NULL.'
          ],
          check: {
            type: 'fill',
            prompt: 'Complète pour afficher les films **plus longs que la moyenne** de tous les films, réalisés par un réalisateur **japonais**.',
            db: 'streaming',
            code: `SELECT titre, duree_min
FROM films
WHERE duree_min > (SELECT ___(duree_min) FROM films)
  AND realisateur_id ___ (SELECT id FROM realisateurs WHERE pays = 'Japon');`,
            blanks: [
              {
                answers: ['AVG'],
                options: ['AVG', 'MAX', 'SUM', 'COUNT'],
                why: {
                  MAX: 'Aucun film n\'est plus long que le plus long : le résultat serait vide.',
                  SUM: 'La somme des durées dépasse 3000 minutes : aucun film n\'est plus long.',
                  COUNT: 'COUNT donne le nombre de films (24), pas une durée.'
                }
              },
              {
                answers: ['IN'],
                options: ['IN', '=', 'LIKE', 'BETWEEN'],
                why: {
                  '=': 'Ici, la sous-requête ne renvoie qu\'un réalisateur et `=` marcherait par chance. Mais avec deux réalisateurs japonais, SQLite ne garderait que le premier : IN est le bon choix pour une liste.',
                  LIKE: 'LIKE compare du texte à un motif, pas un identifiant à une liste.',
                  BETWEEN: 'BETWEEN attend deux bornes, pas une liste de valeurs.'
                }
              }
            ],
            hint: 'Une sous-requête renvoie une valeur, l\'autre une liste d\'identifiants.',
            explain: 'La première sous-requête renvoie la durée moyenne (129,375 min), la seconde la liste des réalisateurs japonais. Seul « Princesse Mononoké » (134 min) remplit les deux conditions.'
          }
        },
        {
          id: 'sql.u11.l2',
          title: 'EXISTS et requêtes en étapes avec WITH',
          minutes: 8,
          objective: 'Tu sais tester l\'existence de lignes liées avec EXISTS et NOT EXISTS, et découper une requête en étapes nommées avec WITH.',
          explain: `\`EXISTS (sous-requête)\` est vrai dès que la sous-requête renvoie **au moins une ligne** ; ce qu'elle sélectionne ne compte pas, on écrit souvent \`SELECT 1\`. Elle est en général **corrélée** : elle utilise une colonne de la requête principale (\`WHERE f.realisateur_id = r.id\`) et se réévalue pour chaque ligne. \`NOT EXISTS\` trouve les lignes sans correspondance, sans le piège des NULL de \`NOT IN\`.

\`WITH\` crée une **CTE** (Common Table Expression) : une requête intermédiaire nommée, que la suite utilise comme une table.

\`WITH totaux AS (SELECT ...) SELECT ... FROM totaux WHERE ...;\`

On enchaîne plusieurs étapes séparées par des virgules : \`WITH a AS (...), b AS (SELECT ... FROM a)\`. Une requête longue devient une suite d'étapes lisibles, que tu peux tester une par une. Une CTE peut même contenir des valeurs écrites à la main : \`WITH t(x) AS (VALUES (1), (2))\`.`,
          example: {
            db: 'streaming',
            code: `SELECT r.nom
FROM realisateurs AS r
WHERE NOT EXISTS (
  SELECT 1
  FROM films AS f
  WHERE f.realisateur_id = r.id
);`,
            output: `nom
---------------
Agnès Varda
Kathryn Bigelow`,
            notes: [
              { line: 3, text: 'Pour chaque réalisateur, on se demande : existe-t-il au moins un film à son nom ? NOT EXISTS garde ceux pour qui la réponse est non.' },
              { line: 6, text: 'La corrélation : r.id vient de la requête principale. Les films sans réalisateur (NULL) ne perturbent pas le résultat.' }
            ]
          },
          exercises: [
            {
              type: 'bug',
              prompt: 'Ce code doit afficher les réalisateurs qui n\'ont **aucun film** dans le catalogue. Il ne renvoie **rien**, alors qu\'il y en a deux. Clique sur la ligne fautive.',
              db: 'streaming',
              code: `SELECT nom
FROM realisateurs
WHERE id NOT IN (SELECT realisateur_id FROM films);`,
              bugLine: 3,
              why: 'Trois films (Matrix, Intouchables, Everything Everywhere All at Once) ont un realisateur_id NULL. La liste renvoyée contient donc NULL, et `NOT IN` n\'est alors jamais vrai.',
              fixes: [
                'WHERE id NOT IN (SELECT realisateur_id FROM films WHERE realisateur_id IS NOT NULL);',
                'WHERE id NOT IN (SELECT id FROM films);',
                'WHERE id IN (SELECT realisateur_id FROM films);',
                'WHERE NOT id IN (SELECT realisateur_id FROM films);'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: 'On compare alors des id de réalisateurs (1 à 13) à des id de films (1 à 24) : tous les réalisateurs sont « trouvés », le résultat reste vide et n\'a aucun sens.',
                2: 'IN donne l\'inverse : les réalisateurs qui ont au moins un film.',
                3: '`NOT id IN (...)` est exactement la même chose que `id NOT IN (...)` : le NULL bloque toujours tout.'
              },
              hint: 'Exécute la sous-requête seule : que contient la liste qu\'elle renvoie ?',
              explain: 'En retirant les NULL de la liste, NOT IN redevient fiable et renvoie Agnès Varda et Kathryn Bigelow. NOT EXISTS, comme dans l\'exemple, évite ce piège sans y penser.'
            },
            {
              type: 'code',
              prompt: 'Avec **EXISTS**, affiche le **pseudo** des utilisateurs qui ont regardé **au moins un film d\'animation** (genre `Animation`).',
              db: 'streaming',
              starter: `SELECT u.pseudo
FROM utilisateurs AS u
WHERE EXISTS ();`,
              solution: `SELECT u.pseudo
FROM utilisateurs AS u
WHERE EXISTS (
  SELECT 1
  FROM visionnages AS v
  JOIN films AS f ON f.id = v.film_id
  WHERE v.utilisateur_id = u.id
    AND f.genre = 'Animation'
);`,
              hint: 'Dans la sous-requête, joins visionnages et films, puis relie-la à l\'utilisateur courant avec `v.utilisateur_id = u.id`.',
              explain: 'Pour chaque utilisateur, la sous-requête cherche un visionnage d\'un film d\'animation. kenji et amara en ont. Contrairement à un JOIN, EXISTS ne crée pas de doublon : kenji, qui a vu deux films d\'animation (dont un deux fois), n\'apparaît qu\'une fois.'
            }
          ],
          challenge: {
            type: 'predict',
            prompt: 'Quelle valeur renvoie cette requête en deux étapes ?',
            code: `WITH ventes(vendeur, montant) AS (
  VALUES ('ada', 120), ('linus', 90), ('ada', 40),
         ('grace', 150), ('linus', 10)
),
totaux AS (
  SELECT vendeur, SUM(montant) AS total
  FROM ventes
  GROUP BY vendeur
)
SELECT COUNT(*) FROM totaux
WHERE total > (SELECT AVG(total) FROM totaux);`,
            answer: '2',
            accept: ['deux'],
            mistakes: [
              { answer: '3', why: 'C\'est ce qu\'on obtiendrait en comparant à la moyenne des 5 ventes (82). Mais la sous-requête lit totaux : la moyenne porte sur les 3 totaux par vendeur.' },
              { answer: '1', why: 'grace (150) dépasse bien la moyenne des totaux (136,67), mais ada aussi, avec 120 + 40 = 160.' }
            ],
            hint: 'Calcule d\'abord la table totaux (une ligne par vendeur), puis la moyenne de ces totaux.',
            explain: 'totaux contient ada 160, linus 100 et grace 150 ; leur moyenne vaut 136,67. ada et grace la dépassent : 2. Chaque étape nommée se lit et se vérifie séparément.'
          },
          recap: [
            '`EXISTS (sous-requête)` est vrai si la sous-requête renvoie au moins une ligne.',
            'Une sous-requête corrélée utilise une colonne de la requête principale et se réévalue pour chaque ligne.',
            'NOT EXISTS trouve les lignes sans correspondance, sans le piège des NULL.',
            '`WITH nom AS (...)` découpe une requête en étapes nommées et testables.'
          ],
          check: {
            type: 'order',
            prompt: 'Remets les lignes dans l\'ordre : la requête calcule d\'abord la quantité vendue par produit, puis affiche le nom de chaque produit avec ce total.',
            db: 'boutique',
            lines: [
              'WITH ventes AS (',
              '  SELECT produit_id, SUM(quantite) AS total',
              '  FROM lignes_commande GROUP BY produit_id',
              ')',
              'SELECT p.nom, v.total FROM ventes AS v',
              'JOIN produits AS p ON p.id = v.produit_id',
              'ORDER BY v.total DESC;'
            ],
            hint: 'La CTE se définit en premier, entre parenthèses ; la requête principale l\'utilise ensuite comme une table.',
            explain: 'WITH ventes AS ( ... ) définit l\'étape ; la requête principale lit ventes, la joint à produits et trie. Le câble USB-C arrive en tête avec 13 unités vendues.'
          }
        }
      ]
    },
    {
      id: 'sql.u12',
      title: 'Projets d\'analyse de données',
      summary: 'Mener une analyse complète en plusieurs requêtes : contrôler, calculer, recouper, conclure.',
      lessons: [
        {
          id: 'sql.u12.l1',
          title: 'Analyse guidée : les ventes de la boutique',
          minutes: 10,
          objective: 'Tu sais mener une analyse en plusieurs requêtes : contrôler les données, calculer un indicateur à deux niveaux et classer les résultats.',
          explain: `Une analyse se mène par étapes, comme une enquête :

- **Formuler la question** précisément : « quel chiffre d'affaires par mois, hors commandes annulées ? »
- **Contrôler les données** : nombre de lignes, valeurs NULL, doublons, statuts présents, dates extrêmes.
- **Construire la requête par étapes**, en vérifiant chaque résultat intermédiaire ; \`WITH\` garde chaque étape lisible.
- **Recouper** : un total doit être cohérent avec un calcul plus simple.
- **Interpréter avec prudence** : 30 commandes, c'est peu pour conclure.

Ici, le chiffre d'affaires (CA) d'une ligne vaut \`quantite * prix_unitaire\`, le prix réellement payé ce jour-là. Le mois s'extrait du texte de la date avec \`substr(date_commande, 1, 7)\`, qui donne \`'2024-03'\` : un avantage du format AAAA-MM-JJ.`,
          example: {
            db: 'boutique',
            code: `-- Étape 1 : contrôler les données avant de calculer
SELECT statut,
       COUNT(*) AS commandes,
       MIN(date_commande) AS premiere,
       MAX(date_commande) AS derniere
FROM commandes
GROUP BY statut
ORDER BY commandes DESC, statut;`,
            output: `statut     | commandes | premiere   | derniere
-----------+-----------+------------+-----------
livree     | 22        | 2024-01-08 | 2024-09-03
annulee    | 3         | 2024-02-11 | 2024-08-21
expediee   | 3         | 2024-09-16 | 2024-10-05
en_attente | 2         | 2024-10-12 | 2024-10-20`,
            notes: [
              { line: 2, text: 'Quatre statuts existent : il faut décider lesquels compter. Les commandes annulées ne rapportent rien.' },
              { line: 4, text: 'MIN et MAX sur des dates en texte ISO donnent la période couverte : de janvier à octobre 2024.' },
              { line: 8, text: 'Le second critère de tri départage les statuts à égalité (3 commandes).' }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: 'Pour calculer le chiffre d\'affaires, pourquoi utiliser `lignes_commande.prix_unitaire` plutôt que `produits.prix` ?',
              choices: [
                'Le prix d\'un produit peut changer après la commande (promotion, hausse) : prix_unitaire garde le prix réellement payé',
                'La colonne produits.prix contient des valeurs NULL',
                'prix_unitaire est plus rapide à lire pour SQLite',
                'produits.prix est stocké en texte, pas en nombre'
              ],
              answer: 0,
              why: {
                1: 'produits.prix est déclaré NOT NULL : aucun prix ne manque.',
                2: 'La vitesse n\'est pas en jeu : c\'est une question d\'exactitude du résultat.',
                3: 'produits.prix est déclaré REAL : c\'est bien un nombre.'
              },
              hint: 'Compare le prix actuel de l\'écran 27 pouces avec ce qu\'a payé le client de la commande 11.',
              explain: 'L\'écran coûte aujourd\'hui 249 €, mais la commande 11 l\'a payé 229 € en promotion. Utiliser produits.prix fausserait le CA : c\'est pourquoi la table de liaison conserve le prix payé.'
            },
            {
              type: 'fill',
              prompt: 'Étape 2 : complète la requête qui calcule le chiffre d\'affaires de chaque mois, hors commandes annulées.',
              db: 'boutique',
              code: `SELECT ___(co.date_commande, 1, 7) AS mois,
       ROUND(___(l.quantite * l.prix_unitaire), 2) AS chiffre_affaires
FROM commandes AS co
JOIN lignes_commande AS l ON l.commande_id = co.id
WHERE co.statut <> 'annulee'
GROUP BY ___
ORDER BY mois;`,
              blanks: [
                {
                  answers: ['substr'],
                  options: ['substr', 'ROUND', 'LIKE', 'DISTINCT'],
                  why: {
                    ROUND: 'ROUND arrondit un nombre ; il ne découpe pas un texte.',
                    LIKE: 'LIKE compare un texte à un motif, il ne renvoie pas un morceau de texte.',
                    DISTINCT: 'DISTINCT retire des doublons ; il ne prend pas d\'arguments comme une fonction.'
                  }
                },
                {
                  answers: ['SUM'],
                  options: ['SUM', 'COUNT', 'AVG', 'MAX'],
                  why: {
                    COUNT: 'COUNT compterait les lignes de commande, pas les montants.',
                    AVG: 'AVG donnerait le montant moyen d\'une ligne, pas le total du mois.',
                    MAX: 'MAX donnerait la plus grosse ligne du mois, pas le total.'
                  }
                },
                {
                  answers: ['mois', 'substr(co.date_commande, 1, 7)'],
                  why: {
                    'co.date_commande': 'Grouper par date complète ferait un groupe par jour, pas par mois.',
                    'co.id': 'Grouper par commande donnerait le total de chaque commande, pas de chaque mois.'
                  }
                }
              ],
              hint: 'Il faut extraire les 7 premiers caractères de la date, additionner les montants, et faire un groupe par mois.',
              explain: '`substr(date, 1, 7)` extrait « AAAA-MM », SUM additionne les montants des lignes, et GROUP BY mois fait un total par mois. SQLite accepte l\'alias mois dans le GROUP BY ; SQL Server, lui, exigerait de répéter l\'expression. Septembre 2024 est le meilleur mois (418,60 €).'
            }
          ],
          challenge: {
            type: 'code',
            prompt: 'Étape 3 : calcule le **panier moyen**, c\'est-à-dire le montant moyen d\'une commande non annulée, arrondi à 2 décimales. Le code de départ donne 67,79 : c\'est faux, car une commande peut avoir plusieurs lignes.',
            db: 'boutique',
            starter: `SELECT ROUND(AVG(l.quantite * l.prix_unitaire), 2)
FROM commandes AS co
JOIN lignes_commande AS l ON l.commande_id = co.id
WHERE co.statut <> 'annulee';`,
            solution: `WITH totaux AS (
  SELECT co.id, SUM(l.quantite * l.prix_unitaire) AS total
  FROM commandes AS co
  JOIN lignes_commande AS l ON l.commande_id = co.id
  WHERE co.statut <> 'annulee'
  GROUP BY co.id
)
SELECT ROUND(AVG(total), 2) FROM totaux;`,
            hint: 'Deux étapes : d\'abord le total de chaque commande (une CTE avec GROUP BY), puis la moyenne de ces totaux.',
            explain: 'Le code de départ fait la moyenne des lignes, pas des commandes. Il faut deux niveaux d\'agrégation : SUM par commande, puis AVG sur les totaux. Le vrai panier moyen est de 92,90 €. Une sous-requête dans le FROM marche aussi.'
          },
          recap: [
            'Contrôle les données (statuts, NULL, dates extrêmes) avant de calculer.',
            'Un indicateur se calcule sur les bonnes lignes : ici, hors commandes annulées et au prix payé.',
            'Une moyenne de totaux demande deux niveaux : SUM par groupe, puis AVG (CTE ou sous-requête).',
            '`substr(date, 1, 7)` regroupe par mois grâce au format AAAA-MM-JJ.'
          ],
          check: {
            type: 'code',
            prompt: 'Étape 4 : affiche le **prénom**, le **nom** et le **CA total arrondi à 2 décimales** des clients dont le CA (commandes non annulées) **dépasse 200 €**, du plus grand au plus petit.',
            db: 'boutique',
            ordered: true,
            starter: `SELECT cl.prenom, cl.nom
FROM clients AS cl;`,
            solution: `SELECT cl.prenom, cl.nom, ROUND(SUM(l.quantite * l.prix_unitaire), 2) AS ca
FROM clients AS cl
JOIN commandes AS co ON co.client_id = cl.id
JOIN lignes_commande AS l ON l.commande_id = co.id
WHERE co.statut <> 'annulee'
GROUP BY cl.id
HAVING SUM(l.quantite * l.prix_unitaire) > 200
ORDER BY ca DESC;`,
            hint: 'Trois tables à joindre, un WHERE sur le statut, un groupe par client (par son id : deux clients portent le même nom), un HAVING sur le total, puis un tri.',
            explain: 'La requête combine tout le parcours : jointures, filtre, regroupement par client, HAVING et tri. Cinq clients dépassent 200 €, Camille Martin en tête (443,40 €). Grouper par cl.id évite de fusionner deux homonymes.'
          }
        },
        {
          id: 'sql.u12.l2',
          title: 'Analyse guidée : choisir un modèle d\'IA',
          minutes: 10,
          objective: 'Tu sais comparer des entraînements de modèles en SQL (échecs, moyennes, durées) et justifier un choix à partir de critères explicites.',
          explain: `Situation : ton équipe a entraîné plusieurs modèles de classification d'images sur le jeu « plantes » (photos de feuilles malades). La table \`experiences\` garde chaque entraînement : modèle, exactitude, durée, statut. Il faut choisir le modèle à déployer.

La démarche reste la même :

- **contrôler** : combien d'entraînements par modèle, combien d'échecs (exactitude NULL) ;
- **comparer** sur une base juste : seulement les entraînements terminés, et assez nombreux pour qu'une moyenne ait un sens ;
- **décider** selon un critère clair : la meilleure exactitude n'est pas toujours le meilleur choix si elle coûte trois fois plus de temps de calcul.

Astuce SQLite : une comparaison vaut 1 (vrai) ou 0 (faux), donc \`SUM(statut = 'echec')\` compte les échecs. Dans d'autres bases, on écrit \`SUM(CASE WHEN statut = 'echec' THEN 1 ELSE 0 END)\`.`,
          example: {
            db: 'labo',
            code: `SELECT m.nom,
       COUNT(*) AS lancements,
       SUM(e.statut = 'echec') AS echecs,
       ROUND(AVG(e.exactitude), 3) AS exactitude_moy
FROM experiences AS e
JOIN modeles AS m ON m.id = e.modele_id
WHERE e.jeu_donnees = 'plantes'
GROUP BY m.nom
ORDER BY exactitude_moy DESC;`,
            output: `nom             | lancements | echecs | exactitude_moy
----------------+------------+--------+---------------
vit-small       | 3          | 1      | 0.954
resnet50        | 3          | 0      | 0.948
convnext-tiny   | 2          | 1      | 0.947
efficientnet-b0 | 3          | 0      | 0.942
vit-tiny        | 3          | 1      | 0.929
resnet18        | 4          | 1      | 0.923
mobilenet-v3    | 2          | 0      | 0.911`,
            notes: [
              { line: 3, text: 'statut = \'echec\' vaut 1 ou 0 : la somme compte les échecs.' },
              { line: 4, text: 'AVG ignore les exactitudes NULL des échecs : la moyenne porte sur les entraînements terminés.' },
              { line: 8, text: 'deit-small n\'apparaît pas : il n\'a jamais été entraîné, et le JOIN ne garde que les modèles qui ont des expériences.' }
            ]
          },
          exercises: [
            {
              type: 'predict',
              prompt: 'Quelle valeur renvoie cette requête, qui calcule un pourcentage d\'échec ?',
              code: `WITH runs(modele, statut) AS (
  VALUES ('a', 'terminee'), ('a', 'echec'),
         ('b', 'terminee'), ('a', 'terminee')
)
SELECT SUM(statut = 'echec') * 100 / COUNT(*)
FROM runs
WHERE modele = 'a';`,
              answer: '33',
              mistakes: [
                { answer: '33.33', why: 'SUM et COUNT sont des entiers (1 * 100 et 3) : SQLite fait une division entière et perd les décimales. Pour 33,33, écris `* 100.0`.' },
                { answer: '25', why: 'WHERE garde seulement le modèle a : 3 lancements, pas 4.' }
              ],
              hint: 'Combien de lignes pour le modèle a, et combien d\'échecs ? Puis attention au type du calcul.',
              explain: 'Le modèle a compte 3 lancements dont 1 échec : 1 * 100 / 3 = 33 en division entière. Pour un pourcentage décimal, écris `SUM(statut = \'echec\') * 100.0 / COUNT(*)`.'
            },
            {
              type: 'code',
              prompt: 'Sur le jeu `plantes`, et pour les seuls entraînements **terminés**, affiche par modèle : le **nom**, le **nombre d\'entraînements** et la **durée moyenne arrondie à l\'unité** (`ROUND(AVG(...))`). Ne garde que les modèles qui ont **au moins 3** entraînements terminés.',
              db: 'labo',
              starter: `SELECT m.nom, COUNT(*), ROUND(AVG(e.duree_min))
FROM experiences AS e
JOIN modeles AS m ON m.id = e.modele_id
GROUP BY m.nom;`,
              solution: `SELECT m.nom, COUNT(*) AS terminees, ROUND(AVG(e.duree_min)) AS duree_moy
FROM experiences AS e
JOIN modeles AS m ON m.id = e.modele_id
WHERE e.jeu_donnees = 'plantes' AND e.statut = 'terminee'
GROUP BY m.nom
HAVING COUNT(*) >= 3;`,
              hint: 'Le WHERE choisit les lignes (jeu et statut), le HAVING choisit les groupes (au moins 3 lignes).',
              explain: 'Trois modèles ont au moins 3 entraînements terminés : efficientnet-b0 (74 min en moyenne), resnet18 (81 min) et resnet50 (158 min). Les autres ont trop peu d\'essais pour une moyenne fiable.'
            }
          ],
          challenge: {
            type: 'code',
            prompt: 'Décision : parmi les modèles qui ont **au moins 3** entraînements terminés sur `plantes` **et** une exactitude moyenne d\'**au moins 0.94**, affiche celui dont la **durée moyenne est la plus courte** : son nom, son exactitude moyenne arrondie à 3 décimales et sa durée moyenne arrondie à l\'unité. Utilise une CTE.',
            db: 'labo',
            starter: `WITH stats AS (
  SELECT m.nom
  FROM modeles AS m
)
SELECT nom FROM stats;`,
            solution: `WITH stats AS (
  SELECT m.nom,
         COUNT(*) AS n,
         AVG(e.exactitude) AS exactitude_moy,
         AVG(e.duree_min) AS duree_moy
  FROM experiences AS e
  JOIN modeles AS m ON m.id = e.modele_id
  WHERE e.jeu_donnees = 'plantes' AND e.statut = 'terminee'
  GROUP BY m.nom
)
SELECT nom, ROUND(exactitude_moy, 3), ROUND(duree_moy)
FROM stats
WHERE n >= 3 AND exactitude_moy >= 0.94
ORDER BY duree_moy
LIMIT 1;`,
            hint: 'Dans la CTE, calcule par modèle le nombre d\'entraînements, l\'exactitude moyenne et la durée moyenne. Ensuite, filtre, trie et garde une ligne.',
            explain: 'La CTE produit une ligne de statistiques par modèle ; la requête principale applique les critères comme sur une table ordinaire. Deux modèles passent les filtres : resnet50 (0.948, 158 min) et efficientnet-b0 (0.942, 74 min). efficientnet-b0 est presque aussi exact, pour deux fois moins de calcul.'
          },
          recap: [
            'Compte les échecs avant de comparer : `SUM(statut = \'echec\')` en SQLite.',
            'Compare sur une base juste : WHERE pour les lignes valides, HAVING pour un nombre d\'essais suffisant.',
            'Une CTE de statistiques par modèle rend le critère de décision lisible.',
            'Une moyenne sur 2 essais est fragile : précise les limites de ta conclusion.'
          ],
          check: {
            type: 'qcm',
            prompt: 'vit-small a la meilleure exactitude moyenne sur « plantes » (0.954), mais sur 2 entraînements terminés seulement, avec 1 échec, et une durée moyenne de 208 min. efficientnet-b0 obtient 0.942 sur 3 entraînements, en 74 min. Quelle conclusion est la plus solide ?',
            choices: [
              'Les données ne suffisent pas à départager : relancer quelques entraînements de vit-small avant de trancher, avec efficientnet-b0 comme bon compromis en attendant',
              'Déployer vit-small : sa moyenne est la plus haute, la question est réglée',
              'Écarter définitivement vit-small : un modèle qui a échoué une fois est inutilisable',
              'Calculer la moyenne de tous les modèles et déployer celui qui s\'en approche le plus'
            ],
            answer: 0,
            why: {
              1: '1,2 point d\'écart sur 2 essais peut venir des variations normales d\'un entraînement à l\'autre, et le coût de calcul est presque triple.',
              2: 'Un échec isolé vient souvent d\'un réglage : ici, l\'entraînement 17 utilisait un taux d\'apprentissage dix fois plus élevé. On en cherche la cause, on n\'élimine pas le modèle.',
              3: 'Viser la moyenne n\'a pas de sens : on cherche le meilleur compromis entre exactitude et coût, pas un modèle ordinaire.'
            },
            hint: 'Combien d\'essais soutiennent chaque moyenne ? Et que coûte chaque modèle ?',
            explain: 'Une bonne conclusion d\'analyse donne un choix et ses limites : efficientnet-b0 est solide (3 essais, rapide), vit-small est prometteur mais insuffisamment testé. SQL fournit les chiffres ; la décision reste un raisonnement.'
          }
        }
      ]
    }
  ]
});
