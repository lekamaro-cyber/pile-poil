// Parcours SQL et bases de données (1/4) : jeux de données, parcours et chapitre 1 « Lire des données ».
// Les requêtes s'exécutent dans CodeQuest sur un vrai moteur SQLite (sql.js).

// ---------- Jeu de données « boutique » : une boutique en ligne de matériel informatique ----------
CQ.addDataset('boutique', `
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT,
  ville TEXT,
  pays TEXT NOT NULL,
  date_inscription TEXT NOT NULL
);
INSERT INTO clients VALUES
  (1, 'Camille', 'Martin', 'camille.martin@mail.fr', 'Lyon', 'France', '2023-01-15'),
  (2, 'Lucas', 'Bernard', 'lucas.b@mail.fr', 'Paris', 'France', '2023-02-02'),
  (3, 'Emma', 'Dubois', NULL, 'Marseille', 'France', '2023-02-20'),
  (4, 'Hugo', 'Thomas', 'hugo.thomas@mail.fr', 'Lyon', 'France', '2023-03-11'),
  (5, 'Chloé', 'Robert', 'chloe.robert@mail.fr', 'Lille', 'France', '2023-04-05'),
  (6, 'Nathan', 'Richard', 'nathan.r@mail.be', 'Bruxelles', 'Belgique', '2023-04-28'),
  (7, 'Léa', 'Petit', 'lea.petit@mail.fr', 'Paris', 'France', '2023-05-19'),
  (8, 'Louis', 'Durand', 'louis.durand@mail.fr', 'Nantes', 'France', '2023-06-07'),
  (9, 'Manon', 'Leroy', NULL, 'Bordeaux', 'France', '2023-07-01'),
  (10, 'Jules', 'Moreau', 'jules.moreau@mail.ch', 'Genève', 'Suisse', '2023-08-14'),
  (11, 'Inès', 'Simon', 'ines.simon@mail.fr', 'Toulouse', 'France', '2023-09-09'),
  (12, 'Adam', 'Laurent', 'adam.l@mail.ca', 'Montréal', 'Canada', '2023-10-21'),
  (13, 'Sarah', 'Lefebvre', 'sarah.lefebvre@mail.fr', NULL, 'France', '2023-11-30'),
  (14, 'Gabriel', 'Michel', 'gabriel.m@mail.fr', 'Lyon', 'France', '2024-01-08'),
  (15, 'Jade', 'Garcia', 'jade.garcia@mail.be', 'Liège', 'Belgique', '2024-02-17'),
  (16, 'Raphaël', 'David', 'raphael.david@mail.fr', 'Paris', 'France', '2024-03-25'),
  (17, 'Louise', 'Bertrand', 'louise.b@mail.fr', 'Nantes', 'France', '2024-05-03'),
  (18, 'Arthur', 'Roux', 'arthur.roux@mail.ca', 'Québec', 'Canada', '2024-06-12'),
  (19, 'Alice', 'Vincent', NULL, NULL, 'France', '2024-08-29'),
  (20, 'Noah', 'Fournier', 'noah.fournier@mail.fr', 'Marseille', 'France', '2024-10-02'),
  (21, 'Lucas', 'Bernard', 'lucas.b@mail.fr', 'Paris', 'France', '2024-09-15');

CREATE TABLE produits (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie TEXT,
  prix REAL NOT NULL,
  stock INTEGER NOT NULL
);
INSERT INTO produits VALUES
  (1, 'Clavier mécanique', 'Informatique', 89.9, 25),
  (2, 'Souris sans fil', 'Informatique', 24.9, 60),
  (3, 'Écran 27 pouces', 'Informatique', 249.0, 8),
  (4, 'Webcam HD', 'Informatique', 59.9, 0),
  (5, 'Casque audio', 'Audio', 129.0, 15),
  (6, 'Écouteurs Bluetooth', 'Audio', 49.9, 40),
  (7, 'Enceinte portable', 'Audio', 79.0, 12),
  (8, 'Micro USB', 'Audio', 69.9, 5),
  (9, 'Lampe de bureau LED', 'Maison', 34.9, 30),
  (10, 'Multiprise connectée', 'Maison', 29.9, 0),
  (11, 'Support d''ordinateur', 'Accessoires', 39.9, 18),
  (12, 'Tapis de souris XXL', 'Accessoires', 19.9, 75),
  (13, 'Câble USB-C', 'Accessoires', 9.9, 120),
  (14, 'Hub USB-C 7 ports', 'Accessoires', 44.9, 22),
  (15, 'Python pour la data', 'Livres', 32.0, 14),
  (16, 'Apprendre SQL', 'Livres', 27.5, 9),
  (17, 'Deep learning, les bases', 'Livres', 45.0, 6),
  (18, 'Carte Raspberry Pi 5', 'Informatique', 89.9, 10),
  (19, 'Kit capteurs Arduino', NULL, 54.9, 7),
  (20, 'Disque SSD 1 To', 'Informatique', 99.9, 16);

CREATE TABLE commandes (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  date_commande TEXT NOT NULL,
  statut TEXT NOT NULL
);
INSERT INTO commandes VALUES
  (1, 1, '2024-01-08', 'livree'), (2, 2, '2024-01-15', 'livree'),
  (3, 4, '2024-01-22', 'livree'), (4, 1, '2024-02-03', 'livree'),
  (5, 5, '2024-02-11', 'annulee'), (6, 6, '2024-02-19', 'livree'),
  (7, 7, '2024-03-02', 'livree'), (8, 3, '2024-03-09', 'livree'),
  (9, 8, '2024-03-17', 'livree'), (10, 10, '2024-03-28', 'livree'),
  (11, 2, '2024-04-04', 'livree'), (12, 11, '2024-04-12', 'livree'),
  (13, 12, '2024-04-25', 'annulee'), (14, 14, '2024-05-06', 'livree'),
  (15, 9, '2024-05-14', 'livree'), (16, 1, '2024-05-21', 'livree'),
  (17, 15, '2024-06-03', 'livree'), (18, 16, '2024-06-10', 'livree'),
  (19, 4, '2024-06-18', 'livree'), (20, 18, '2024-07-02', 'livree'),
  (21, 20, '2024-07-15', 'livree'), (22, 7, '2024-07-29', 'livree'),
  (23, 2, '2024-08-07', 'livree'), (24, 6, '2024-08-21', 'annulee'),
  (25, 11, '2024-09-03', 'livree'), (26, 14, '2024-09-16', 'expediee'),
  (27, 1, '2024-09-30', 'expediee'), (28, 16, '2024-10-05', 'expediee'),
  (29, 20, '2024-10-12', 'en_attente'), (30, 5, '2024-10-20', 'en_attente');

CREATE TABLE lignes_commande (
  commande_id INTEGER NOT NULL REFERENCES commandes(id),
  produit_id INTEGER NOT NULL REFERENCES produits(id),
  quantite INTEGER NOT NULL,
  prix_unitaire REAL NOT NULL,
  PRIMARY KEY (commande_id, produit_id)
);
INSERT INTO lignes_commande VALUES
  (1, 1, 1, 89.9), (1, 13, 2, 9.9), (2, 5, 1, 129.0), (3, 15, 1, 32.0),
  (3, 16, 1, 27.5), (4, 2, 1, 24.9), (4, 12, 1, 19.9), (5, 3, 1, 249.0),
  (6, 6, 2, 49.9), (7, 20, 1, 99.9), (7, 14, 1, 44.9), (8, 9, 1, 34.9),
  (9, 18, 1, 89.9), (9, 13, 3, 9.9), (10, 7, 1, 79.0), (11, 3, 1, 229.0),
  (12, 15, 2, 32.0), (13, 8, 1, 69.9), (14, 1, 1, 89.9), (14, 2, 1, 24.9),
  (14, 12, 1, 19.9), (15, 6, 1, 49.9), (16, 11, 1, 39.9), (17, 5, 1, 119.0),
  (18, 20, 2, 99.9), (19, 13, 5, 9.9), (20, 4, 1, 59.9), (21, 16, 1, 27.5),
  (21, 15, 1, 32.0), (22, 7, 1, 79.0), (23, 14, 1, 44.9), (24, 1, 1, 89.9),
  (25, 9, 2, 34.9), (26, 18, 1, 89.9), (26, 13, 1, 9.9), (27, 3, 1, 249.0),
  (28, 6, 1, 49.9), (28, 13, 2, 9.9), (29, 2, 2, 24.9), (30, 12, 1, 19.9);
`);

// ---------- Jeu de données « streaming » : une plateforme de films ----------
CQ.addDataset('streaming', `
CREATE TABLE realisateurs (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL,
  pays TEXT NOT NULL
);
INSERT INTO realisateurs VALUES
  (1, 'Christopher Nolan', 'Royaume-Uni'), (2, 'Denis Villeneuve', 'Canada'),
  (3, 'Hayao Miyazaki', 'Japon'), (4, 'Bong Joon-ho', 'Corée du Sud'),
  (5, 'Céline Sciamma', 'France'), (6, 'Justine Triet', 'France'),
  (7, 'Jordan Peele', 'États-Unis'), (8, 'Alex Garland', 'Royaume-Uni'),
  (9, 'Spike Jonze', 'États-Unis'), (10, 'Greta Gerwig', 'États-Unis'),
  (11, 'Damien Chazelle', 'États-Unis'), (12, 'Agnès Varda', 'France'),
  (13, 'Kathryn Bigelow', 'États-Unis');

CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  titre TEXT NOT NULL,
  annee INTEGER NOT NULL,
  genre TEXT NOT NULL,
  duree_min INTEGER NOT NULL,
  realisateur_id INTEGER REFERENCES realisateurs(id)
);
INSERT INTO films VALUES
  (1, 'Inception', 2010, 'Science-fiction', 148, 1),
  (2, 'Interstellar', 2014, 'Science-fiction', 169, 1),
  (3, 'Oppenheimer', 2023, 'Drame', 180, 1),
  (4, 'Dune', 2021, 'Science-fiction', 155, 2),
  (5, 'Premier Contact', 2016, 'Science-fiction', 116, 2),
  (6, 'Blade Runner 2049', 2017, 'Science-fiction', 164, 2),
  (7, 'Le Voyage de Chihiro', 2001, 'Animation', 125, 3),
  (8, 'Princesse Mononoké', 1997, 'Animation', 134, 3),
  (9, 'Mon voisin Totoro', 1988, 'Animation', 86, 3),
  (10, 'Parasite', 2019, 'Thriller', 132, 4),
  (11, 'Snowpiercer', 2013, 'Science-fiction', 126, 4),
  (12, 'Portrait de la jeune fille en feu', 2019, 'Drame', 122, 5),
  (13, 'Anatomie d''une chute', 2023, 'Thriller', 151, 6),
  (14, 'Get Out', 2017, 'Horreur', 104, 7),
  (15, 'Nope', 2022, 'Horreur', 130, 7),
  (16, 'Ex Machina', 2014, 'Science-fiction', 108, 8),
  (17, 'Her', 2013, 'Drame', 126, 9),
  (18, 'Lady Bird', 2017, 'Comédie', 94, 10),
  (19, 'Barbie', 2023, 'Comédie', 114, 10),
  (20, 'La La Land', 2016, 'Comédie musicale', 128, 11),
  (21, 'Whiplash', 2014, 'Drame', 106, 11),
  (22, 'Intouchables', 2011, 'Comédie', 112, NULL),
  (23, 'Matrix', 1999, 'Science-fiction', 136, NULL),
  (24, 'Everything Everywhere All at Once', 2022, 'Science-fiction', 139, NULL);

CREATE TABLE utilisateurs (
  id INTEGER PRIMARY KEY,
  pseudo TEXT NOT NULL UNIQUE,
  pays TEXT NOT NULL,
  abonnement TEXT NOT NULL,
  date_inscription TEXT NOT NULL
);
INSERT INTO utilisateurs VALUES
  (1, 'nova_92', 'France', 'premium', '2023-01-14'),
  (2, 'kenji', 'Japon', 'standard', '2023-02-03'),
  (3, 'lea.m', 'France', 'gratuit', '2023-03-22'),
  (4, 'samir_b', 'Belgique', 'premium', '2023-04-09'),
  (5, 'ines', 'France', 'standard', '2023-05-17'),
  (6, 'tom_h', 'Canada', 'gratuit', '2023-06-01'),
  (7, 'amara', 'Sénégal', 'standard', '2023-07-12'),
  (8, 'pixel', 'France', 'premium', '2023-08-30'),
  (9, 'hugo.r', 'Suisse', 'gratuit', '2023-10-05'),
  (10, 'yuna', 'Corée du Sud', 'premium', '2023-11-19'),
  (11, 'marco', 'Italie', 'standard', '2024-01-08'),
  (12, 'chloe_l', 'France', 'gratuit', '2024-02-26'),
  (13, 'dev_ops', 'Canada', 'standard', '2024-04-02'),
  (14, 'zoe', 'France', 'premium', '2024-06-15'),
  (15, 'rayan', 'Belgique', 'gratuit', '2024-09-01');

CREATE TABLE visionnages (
  id INTEGER PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
  film_id INTEGER NOT NULL REFERENCES films(id),
  date_vue TEXT NOT NULL,
  minutes_vues INTEGER NOT NULL,
  note INTEGER
);
INSERT INTO visionnages VALUES
  (1, 1, 1, '2024-01-05', 148, 5), (2, 1, 2, '2024-01-12', 169, 5),
  (3, 1, 4, '2024-02-02', 155, 4), (4, 1, 1, '2024-03-15', 148, 5),
  (5, 2, 7, '2024-01-08', 125, 5), (6, 2, 8, '2024-01-20', 134, 4),
  (7, 2, 10, '2024-02-14', 132, 5), (8, 3, 18, '2024-01-25', 94, 4),
  (9, 3, 19, '2024-02-10', 60, NULL), (10, 3, 20, '2024-03-01', 128, 5),
  (11, 4, 13, '2024-01-30', 151, 4), (12, 4, 10, '2024-02-22', 132, 5),
  (13, 4, 14, '2024-03-09', 104, 3), (14, 5, 12, '2024-02-05', 122, 5),
  (15, 5, 17, '2024-02-18', 126, 4), (16, 5, 3, '2024-04-01', 90, NULL),
  (17, 6, 16, '2024-02-25', 108, 4), (18, 6, 23, '2024-03-12', 136, 5),
  (19, 6, 1, '2024-04-08', 148, 4), (20, 7, 7, '2024-03-03', 125, 5),
  (21, 7, 9, '2024-03-20', 86, 4), (22, 7, 22, '2024-04-14', 112, 4),
  (23, 8, 5, '2024-03-08', 116, 5), (24, 8, 6, '2024-03-22', 164, 4),
  (25, 8, 4, '2024-04-19', 155, 5), (26, 8, 16, '2024-05-02', 108, NULL),
  (27, 9, 15, '2024-04-03', 70, 2), (28, 9, 14, '2024-04-27', 104, 4),
  (29, 10, 10, '2024-04-11', 132, 5), (30, 10, 11, '2024-05-06', 126, 4),
  (31, 10, 2, '2024-05-30', 169, 5), (32, 11, 20, '2024-05-12', 128, 3),
  (33, 11, 12, '2024-06-01', 122, NULL), (34, 12, 19, '2024-06-09', 114, 3),
  (35, 12, 18, '2024-06-23', 94, 4), (36, 13, 23, '2024-06-15', 136, 5),
  (37, 13, 16, '2024-07-01', 108, 5), (38, 13, 3, '2024-07-20', 180, 4),
  (39, 2, 7, '2024-07-28', 125, 5), (40, 6, 5, '2024-08-04', 30, NULL);
`);

// ---------- Jeu de données « labo » : suivi d'entraînements de modèles de classification d'images ----------
CQ.addDataset('labo', `
CREATE TABLE modeles (
  id INTEGER PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  famille TEXT NOT NULL,
  parametres_m REAL NOT NULL
);
INSERT INTO modeles VALUES
  (1, 'resnet18', 'CNN', 11.7), (2, 'resnet50', 'CNN', 25.6),
  (3, 'efficientnet-b0', 'CNN', 5.3), (4, 'mobilenet-v3', 'CNN', 5.4),
  (5, 'vit-tiny', 'Transformer', 5.7), (6, 'vit-small', 'Transformer', 22.1),
  (7, 'convnext-tiny', 'CNN', 28.6), (8, 'deit-small', 'Transformer', 22.1);

CREATE TABLE experiences (
  id INTEGER PRIMARY KEY,
  modele_id INTEGER NOT NULL REFERENCES modeles(id),
  jeu_donnees TEXT NOT NULL,
  epochs INTEGER NOT NULL,
  taux_apprentissage REAL NOT NULL,
  exactitude REAL,
  duree_min INTEGER NOT NULL,
  statut TEXT NOT NULL,
  date_lancement TEXT NOT NULL
);
INSERT INTO experiences VALUES
  (1, 1, 'plantes', 10, 0.001, 0.912, 42, 'terminee', '2026-09-01'),
  (2, 1, 'plantes', 20, 0.001, 0.927, 81, 'terminee', '2026-09-02'),
  (3, 1, 'plantes', 20, 0.01, NULL, 12, 'echec', '2026-09-02'),
  (4, 2, 'plantes', 10, 0.001, 0.941, 95, 'terminee', '2026-09-03'),
  (5, 2, 'plantes', 20, 0.001, 0.953, 188, 'terminee', '2026-09-04'),
  (6, 2, 'plantes', 20, 0.0005, 0.949, 190, 'terminee', '2026-09-05'),
  (7, 3, 'plantes', 10, 0.001, 0.935, 38, 'terminee', '2026-09-05'),
  (8, 3, 'plantes', 20, 0.001, 0.944, 74, 'terminee', '2026-09-06'),
  (9, 3, 'plantes', 30, 0.001, 0.946, 110, 'terminee', '2026-09-07'),
  (10, 4, 'plantes', 10, 0.001, 0.903, 25, 'terminee', '2026-09-08'),
  (11, 4, 'plantes', 20, 0.001, 0.918, 49, 'terminee', '2026-09-08'),
  (12, 5, 'plantes', 10, 0.0005, 0.921, 64, 'terminee', '2026-09-09'),
  (13, 5, 'plantes', 20, 0.0005, NULL, 30, 'echec', '2026-09-10'),
  (14, 5, 'plantes', 20, 0.0001, 0.938, 128, 'terminee', '2026-09-11'),
  (15, 6, 'plantes', 10, 0.0001, 0.951, 140, 'terminee', '2026-09-12'),
  (16, 6, 'plantes', 20, 0.0001, 0.958, 276, 'terminee', '2026-09-14'),
  (17, 6, 'plantes', 20, 0.001, NULL, 45, 'echec', '2026-09-15'),
  (18, 7, 'plantes', 10, 0.001, 0.947, 120, 'terminee', '2026-09-16'),
  (19, 7, 'plantes', 20, 0.001, NULL, 60, 'echec', '2026-09-17'),
  (20, 3, 'chats-chiens', 10, 0.001, 0.962, 31, 'terminee', '2026-09-18'),
  (21, 3, 'chats-chiens', 20, 0.001, 0.968, 60, 'terminee', '2026-09-19'),
  (22, 1, 'chats-chiens', 10, 0.001, 0.951, 35, 'terminee', '2026-09-20'),
  (23, 2, 'chats-chiens', 10, 0.001, 0.973, 80, 'terminee', '2026-09-21'),
  (24, 4, 'chats-chiens', 10, 0.001, 0.944, 20, 'terminee', '2026-09-22'),
  (25, 5, 'chats-chiens', 10, 0.0005, 0.957, 55, 'terminee', '2026-09-23'),
  (26, 6, 'chats-chiens', 10, 0.0001, 0.979, 120, 'terminee', '2026-09-24'),
  (27, 6, 'chats-chiens', 20, 0.0001, 0.981, 235, 'terminee', '2026-09-26'),
  (28, 7, 'chats-chiens', 10, 0.001, 0.970, 105, 'terminee', '2026-09-27'),
  (29, 4, 'chats-chiens', 20, 0.001, NULL, 8, 'echec', '2026-09-28'),
  (30, 1, 'plantes', 30, 0.0005, 0.931, 120, 'terminee', '2026-09-30');
`);

// ---------- Parcours et chapitre 1 ----------
CQ.addTrack({
  id: 'sql',
  title: 'SQL et bases de données',
  lang: 'sql',
  summary: 'Interroger, modifier et modéliser des bases de données relationnelles avec SQL, sur un vrai moteur SQLite.',
  why: 'Presque toutes les applications rangent leurs données dans une base relationnelle : comptes, commandes, journaux, historiques. Avant d\'entraîner un modèle d\'IA, on extrait et on vérifie ses données, très souvent en SQL.',
  requires: [],
  chapters: [
    {
      id: 'sql.c1',
      title: 'Lire des données',
      units: [
        {
          id: 'sql.u1',
          title: 'Tables, lignes et colonnes',
          summary: 'Comprendre comment une base range ses données et les lire avec SELECT.',
          lessons: [
            {
              id: 'sql.u1.l1',
              title: 'Ta première requête',
              minutes: 6,
              objective: 'Tu sais afficher le contenu d\'une table avec SELECT, en choisissant les colonnes, en calculant une colonne et en retirant les doublons.',
              explain: `Une base de données relationnelle range les informations dans des **tables**. Chaque **colonne** a un nom et un type (\`INTEGER\` pour un entier, \`REAL\` pour un décimal, \`TEXT\` pour du texte). Chaque **ligne** est un enregistrement : un client, un produit, une commande. Une table se déclare avec \`CREATE TABLE produits (id INTEGER, nom TEXT, prix REAL)\` et se remplit avec \`INSERT INTO\` : tu verras ces commandes en détail au chapitre 2.

Pour lire une table, on écrit \`SELECT colonnes FROM table;\`. L'étoile \`*\` prend toutes les colonnes. On peut calculer une colonne (\`prix * 1.2\`), l'arrondir avec \`ROUND(valeur, 2)\` et la renommer avec \`AS\`. \`SELECT DISTINCT\` retire les lignes en double.

Les mots-clés s'écrivent en majuscules par convention, mais SQL ne fait pas la différence. Dans CodeQuest, tes requêtes tournent sur un vrai moteur **SQLite**, la base intégrée aux téléphones, aux navigateurs et au module \`sqlite3\` de Python.`,
              example: {
                db: 'boutique',
                code: `-- Toutes les colonnes de la table produits
SELECT * FROM produits;

-- Deux colonnes et un calcul, renommé avec AS
SELECT nom, prix, ROUND(prix * 1.2, 2) AS prix_ttc FROM produits;

-- Les pays des clients, sans doublons
SELECT DISTINCT pays FROM clients;`,
                output: `pays
--------
France
Belgique
Suisse
Canada`,
                notes: [
                  { line: 2, text: 'L\'étoile affiche toutes les colonnes, dans l\'ordre de la table. Pratique pour découvrir une table, à éviter dans une application.' },
                  { line: 5, text: 'ROUND(prix * 1.2, 2) calcule le prix TTC arrondi à 2 décimales ; AS donne un nom lisible à cette colonne calculée.' },
                  { line: 8, text: 'DISTINCT garde chaque pays une seule fois, alors que la table compte 21 clients. CodeQuest affiche le résultat de la dernière requête.' }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: 'Que renvoie cette requête ?',
                  code: `SELECT nom, prix
FROM produits;`,
                  choices: [
                    'Toutes les lignes de la table produits, avec deux colonnes : nom puis prix',
                    'Seulement la première ligne de produits, avec son nom et son prix',
                    'Toutes les colonnes de produits, triées par nom puis par prix',
                    'Les colonnes nom et prix de toutes les tables de la base'
                  ],
                  answer: 0,
                  why: {
                    1: 'Sans filtre, SELECT renvoie toutes les lignes de la table. Pour en limiter le nombre, il faut une clause en plus (WHERE ou LIMIT, vues dans les prochaines leçons).',
                    2: 'La liste après SELECT choisit les colonnes affichées, elle ne trie rien. Le tri se demande avec ORDER BY.',
                    3: 'FROM produits désigne une seule table : la requête ne lit que celle-là.'
                  },
                  hint: 'Regarde séparément ce que choisit SELECT et ce que désigne FROM.',
                  explain: 'SELECT choisit les colonnes (ici nom puis prix, dans cet ordre) et FROM la table à lire. Sans autre clause, toutes les lignes sont renvoyées.'
                },
                {
                  type: 'code',
                  prompt: 'Le code de départ affiche toutes les colonnes de la table `clients`. Modifie-le pour n\'afficher que le **prénom**, le **nom** et la **ville** de chaque client, dans cet ordre.',
                  db: 'boutique',
                  starter: `SELECT *
FROM clients;`,
                  solution: `SELECT prenom, nom, ville
FROM clients;`,
                  hint: 'Remplace l\'étoile par la liste des colonnes, séparées par des virgules. Les noms de colonnes sont `prenom`, `nom` et `ville`.',
                  explain: 'La liste après SELECT fixe les colonnes et leur ordre. Les noms s\'écrivent exactement comme dans la table : `prenom`, sans accent.'
                }
              ],
              challenge: {
                type: 'bug',
                db: 'boutique',
                prompt: 'Ce code devait afficher le nom **et** le prix de chaque produit. Il n\'affiche qu\'une seule colonne, intitulée `prix`, qui contient… les noms des produits. Clique sur la ligne fautive.',
                code: `SELECT nom prix
FROM produits;`,
                bugLine: 1,
                why: 'Il manque la virgule entre `nom` et `prix`. SQL lit alors `prix` comme un alias de `nom` (le mot AS est facultatif) : la colonne nom est affichée sous le titre prix. Aucune erreur n\'est signalée, d\'où l\'intérêt de toujours relire le résultat.',
                fixes: ['SELECT nom, prix', 'SELECT nom AND prix', 'SELECT nom + prix', 'SELECT (nom prix)'],
                fixAnswer: 0,
                fixWhy: {
                  1: '`nom AND prix` est une condition logique : une seule colonne qui vaut 0 ou 1, pas deux colonnes.',
                  2: '`+` additionne : SQLite convertit le nom en nombre (0) et affiche une seule colonne qui contient le prix. Le nom a disparu.',
                  3: 'Les parenthèses ne séparent pas des colonnes : SQLite répond « syntax error ».'
                },
                hint: 'Regarde l\'exemple de la leçon : comment sépare-t-on deux colonnes après SELECT ?',
                explain: 'Avec la virgule, SELECT renvoie deux colonnes. Sans virgule, le second mot devient le titre de la première colonne : c\'est un alias implicite, une erreur silencieuse fréquente.'
              },
              recap: [
                'Une table a des colonnes typées (INTEGER, REAL, TEXT) et des lignes, une par enregistrement.',
                '`SELECT col1, col2 FROM table;` lit les colonnes choisies, dans l\'ordre demandé ; `*` les prend toutes.',
                'On peut calculer une colonne (`ROUND(prix * 1.2, 2)`) et la renommer avec `AS`.',
                '`SELECT DISTINCT` retire les doublons du résultat.'
              ],
              check: {
                type: 'fill',
                db: 'boutique',
                prompt: 'Complète la requête pour afficher la liste des villes des clients, chaque ville une seule fois.',
                code: `SELECT ___ ville
___ clients;`,
                blanks: [
                  {
                    answers: ['DISTINCT'],
                    options: ['DISTINCT', 'UNIQUE', 'ALL', 'ONLY'],
                    why: {
                      UNIQUE: 'UNIQUE sert à déclarer une contrainte dans CREATE TABLE, pas à filtrer un résultat.',
                      ALL: 'ALL est le comportement par défaut de SELECT : il garde les doublons.',
                      ONLY: 'ONLY n\'existe pas dans un SELECT SQLite.'
                    }
                  },
                  {
                    answers: ['FROM'],
                    options: ['FROM', 'IN', 'TABLE', 'WHERE'],
                    why: {
                      IN: 'IN sert à tester l\'appartenance à une liste dans un filtre, pas à désigner la table lue.',
                      TABLE: 'TABLE s\'utilise dans CREATE TABLE ; pour lire une table, SELECT attend FROM.',
                      WHERE: 'WHERE filtre les lignes, mais il faut d\'abord dire quelle table lire.'
                    }
                  }
                ],
                hint: 'Un mot-clé retire les doublons, un autre indique la table à lire.',
                explain: 'SELECT DISTINCT garde chaque valeur une seule fois et FROM indique la table. Remarque : la ville inconnue (NULL) apparaît, elle aussi, une fois dans le résultat.'
              }
            }
          ]
        },
        {
          id: 'sql.u2',
          title: 'SELECT et WHERE',
          summary: 'Filtrer les lignes : comparaisons, conditions combinées, listes, intervalles, motifs et valeurs manquantes.',
          lessons: [
            {
              id: 'sql.u2.l1',
              title: 'Filtrer avec WHERE',
              minutes: 7,
              objective: 'Tu sais filtrer les lignes avec WHERE en combinant des conditions avec AND, OR, NOT et des parenthèses.',
              explain: `\`WHERE\` garde seulement les lignes qui vérifient une condition. La clause se place après \`FROM\` : \`SELECT nom FROM produits WHERE prix < 30;\`

Comparaisons : \`=\`, \`<>\` (différent ; \`!=\` marche aussi en SQLite), \`<\`, \`>\`, \`<=\`, \`>=\`. Le texte s'écrit entre **apostrophes simples** : \`'Lyon'\`. Une apostrophe dans le texte se double : \`'Support d''ordinateur'\`.

On combine avec \`AND\` (les deux conditions), \`OR\` (au moins une) et \`NOT\` (l'inverse). Attention : \`AND\` passe **avant** \`OR\`, comme la multiplication avant l'addition. Dès que tu mélanges les deux, mets des parenthèses.

SQLite n'a pas de vrai type date : on stocke les dates en texte au format \`'AAAA-MM-JJ'\`. Dans ce format, l'ordre alphabétique est l'ordre chronologique, donc \`date_inscription >= '2024-01-01'\` fonctionne.`,
              example: {
                db: 'boutique',
                code: `SELECT nom, categorie, prix
FROM produits
WHERE (categorie = 'Audio' OR categorie = 'Livres')
  AND prix < 50;`,
                output: `nom                      | categorie | prix
-------------------------+-----------+-----
Écouteurs Bluetooth      | Audio     | 49.9
Python pour la data      | Livres    | 32
Apprendre SQL            | Livres    | 27.5
Deep learning, les bases | Livres    | 45`,
                notes: [
                  { line: 1, text: 'Le filtre ne change pas les colonnes affichées : SELECT et WHERE sont indépendants.' },
                  { line: 3, text: 'Les parenthèses regroupent les deux catégories acceptées. Le texte est entre apostrophes simples et respecte les majuscules.' },
                  { line: 4, text: 'AND ajoute une seconde condition : il faut être dans une des deux catégories ET coûter moins de 50.' }
                ]
              },
              exercises: [
                {
                  type: 'code',
                  prompt: 'Affiche le **nom** et la **catégorie** des produits en rupture de stock (colonne `stock` égale à 0).',
                  db: 'boutique',
                  starter: `SELECT nom, categorie
FROM produits;`,
                  solution: `SELECT nom, categorie
FROM produits
WHERE stock = 0;`,
                  hint: 'Ajoute une clause WHERE après FROM, avec une comparaison sur la colonne stock.',
                  explain: '`WHERE stock = 0` ne garde que les lignes dont le stock vaut exactement 0 : ici la webcam et la multiprise. Un nombre s\'écrit sans apostrophes.'
                },
                {
                  type: 'bug',
                  db: 'boutique',
                  prompt: 'Ce code doit afficher les produits **Audio ou Informatique** qui coûtent **moins de 50 €**. Il affiche pourtant le casque audio à 129 €. Clique sur la ligne fautive.',
                  code: `SELECT nom, categorie, prix
FROM produits
WHERE categorie = 'Audio' OR categorie = 'Informatique' AND prix < 50;`,
                  bugLine: 3,
                  why: 'AND est évalué avant OR. La condition est donc lue comme `Audio OR (Informatique AND prix < 50)` : tous les produits Audio passent, quel que soit leur prix.',
                  fixes: [
                    "WHERE (categorie = 'Audio' OR categorie = 'Informatique') AND prix < 50;",
                    "WHERE categorie = 'Audio' AND categorie = 'Informatique' AND prix < 50;",
                    "WHERE (categorie = 'Audio' OR categorie = 'Informatique') OR prix < 50;"
                  ],
                  fixAnswer: 0,
                  fixWhy: {
                    1: 'Un produit n\'a qu\'une catégorie : il ne peut pas être Audio ET Informatique. Cette requête ne renvoie rien.',
                    2: 'Avec OR à la fin, tous les produits à moins de 50 € passent, même les livres et les accessoires.'
                  },
                  hint: 'Lequel de AND et OR est évalué en premier ? Que fait la condition sur un produit Audio à 129 € ?',
                  explain: 'Les parenthèses forcent le regroupement voulu : d\'abord « Audio ou Informatique », puis « et moins de 50 € ». Résultat : les écouteurs Bluetooth et la souris sans fil.'
                }
              ],
              challenge: {
                type: 'logic',
                prompt: 'Les dates d\'inscription sont stockées en texte `AAAA-MM-JJ`. Parmi les 5 dates en commentaire, **combien** vérifient la condition ?',
                code: `-- '2023-12-31', '2024-01-01', '2024-06-30', '2024-07-01', '2024-10-02'
WHERE date_inscription >= '2024-01-01'
  AND date_inscription < '2024-07-01'`,
                answer: '2',
                accept: ['deux'],
                mistakes: [
                  { answer: '3', why: '`<` est strict : \'2024-07-01\' n\'est pas inférieur à \'2024-07-01\', il est exclu.' },
                  { answer: '1', why: '`>=` inclut la borne : \'2024-01-01\' est bien supérieur ou égal à \'2024-01-01\'.' }
                ],
                hint: 'Teste chaque date contre les deux conditions. Attention aux bornes : `>=` inclut, `<` exclut.',
                explain: 'Seules \'2024-01-01\' et \'2024-06-30\' sont dans l\'intervalle [1er janvier ; 1er juillet[. Cette écriture « borne incluse au début, exclue à la fin » sélectionne exactement le premier semestre 2024.'
              },
              recap: [
                '`WHERE condition` se place après FROM et garde les lignes où la condition est vraie.',
                'Le texte va entre apostrophes simples ; une apostrophe dans le texte se double.',
                'AND passe avant OR : mets des parenthèses dès que tu mélanges les deux.',
                'Les dates au format texte AAAA-MM-JJ se comparent correctement avec <, >, >=.'
              ],
              check: {
                type: 'qcm',
                prompt: 'Quelle clause sélectionne les produits de la catégorie Audio qui **ne sont pas** en rupture de stock ?',
                choices: [
                  "WHERE categorie = 'Audio' AND stock > 0",
                  "WHERE categorie = 'Audio' OR stock > 0",
                  'WHERE categorie = Audio AND stock > 0',
                  "WHERE categorie = 'Audio' AND NOT stock > 0"
                ],
                answer: 0,
                why: {
                  1: 'OR garde aussi tous les produits en stock des autres catégories (livres, accessoires…).',
                  2: 'Sans apostrophes, Audio est lu comme un nom de colonne : SQLite répond « no such column: Audio ».',
                  3: '`NOT stock > 0` garde au contraire les produits dont le stock vaut 0 : ceux en rupture.'
                },
                hint: 'Il faut deux conditions vraies en même temps, et une valeur texte correctement écrite.',
                explain: 'Les deux conditions doivent être vraies ensemble, donc AND ; la catégorie est un texte, donc entre apostrophes. stock > 0 exclut les produits en rupture.'
              }
            },
            {
              id: 'sql.u2.l2',
              title: 'IN, BETWEEN, LIKE et NULL',
              minutes: 7,
              objective: 'Tu sais filtrer avec IN, BETWEEN et LIKE, et repérer les valeurs manquantes avec IS NULL.',
              explain: `Quelques opérateurs rendent les filtres plus courts :

- \`ville IN ('Lyon', 'Paris')\` remplace une suite de \`OR\` ; \`NOT IN\` fait l'inverse.
- \`prix BETWEEN 10 AND 50\` : les deux bornes sont **incluses**.
- \`nom LIKE 'Clé%'\` : \`%\` remplace n'importe quelle suite de caractères (même vide), \`_\` exactement un caractère. En SQLite, LIKE ignore la casse des lettres sans accent : \`'usb'\` trouve \`'USB'\`, mais \`'é'\` ne trouve pas \`'É'\`.

\`NULL\` signifie « valeur inconnue ». Toute comparaison avec NULL donne NULL, ni vrai ni faux : \`email = NULL\` ne renvoie donc **jamais** de ligne. On écrit \`email IS NULL\` ou \`email IS NOT NULL\`. Même piège avec \`NOT IN\` : une ligne dont la valeur est NULL n'est gardée ni par \`IN\`, ni par \`NOT IN\`.`,
              example: {
                db: 'boutique',
                code: `SELECT nom, prix
FROM produits
WHERE nom LIKE '%usb%'
  AND prix BETWEEN 5 AND 50;`,
                output: `nom               | prix
------------------+-----
Câble USB-C       | 9.9
Hub USB-C 7 ports | 44.9`,
                notes: [
                  { line: 3, text: '%usb% : « usb » n\'importe où dans le nom. SQLite ignore ici la casse, donc USB-C est trouvé.' },
                  { line: 4, text: 'BETWEEN 5 AND 50 inclut 5 et 50. Le micro USB (69,90 €) correspond au motif mais il est trop cher.' }
                ]
              },
              exercises: [
                {
                  type: 'predict',
                  prompt: 'Quelle valeur renvoie la dernière requête ?',
                  code: `-- Données de l'exercice
CREATE TABLE fichiers (nom TEXT, taille_ko INTEGER);
INSERT INTO fichiers VALUES
  ('rapport.pdf', 820), ('photo.jpg', 2400),
  ('photo_2.png', 1900), ('photo', 1000);

SELECT nom FROM fichiers
WHERE nom LIKE 'photo_%'
  AND taille_ko BETWEEN 1000 AND 2000;`,
                  answer: 'photo_2.png',
                  mistakes: [
                    { answer: 'photo', why: 'Dans LIKE, `_` exige exactement un caractère après « photo ». Le fichier « photo » n\'en a aucun : il ne correspond pas au motif, même si sa taille convient.' },
                    { answer: 'photo.jpg', why: '« photo.jpg » correspond bien au motif (`_` accepte le point), mais sa taille (2400 Ko) sort de l\'intervalle 1000 à 2000.' }
                  ],
                  hint: 'Dans un motif LIKE, `_` n\'est pas un simple tiret bas : que remplace-t-il ?',
                  explain: '`_` remplace un caractère, `%` une suite quelconque. Seul « photo_2.png » a au moins un caractère après « photo » ET une taille comprise entre 1000 et 2000 Ko (bornes incluses).'
                },
                {
                  type: 'code',
                  prompt: 'Affiche le **nom** et le **prix** des produits des catégories Audio, Livres et Maison qui coûtent **entre 30 et 80 €** (bornes comprises). Utilise IN et BETWEEN.',
                  db: 'boutique',
                  starter: `SELECT nom, prix
FROM produits
WHERE categorie = 'Audio';`,
                  solution: `SELECT nom, prix
FROM produits
WHERE categorie IN ('Audio', 'Livres', 'Maison')
  AND prix BETWEEN 30 AND 80;`,
                  hint: 'IN prend une liste de valeurs entre parenthèses, séparées par des virgules ; BETWEEN prend deux bornes reliées par AND.',
                  explain: 'IN remplace trois conditions reliées par OR, et BETWEEN 30 AND 80 équivaut à `prix >= 30 AND prix <= 80`. Six produits correspondent.'
                }
              ],
              challenge: {
                type: 'logic',
                prompt: 'La table `produits` compte 20 produits : 6 en Informatique, 4 en Audio, 9 dans d\'autres catégories et 1 **sans catégorie** (NULL). Combien de lignes renvoie cette requête ?',
                code: `SELECT nom FROM produits
WHERE categorie NOT IN ('Informatique', 'Audio');`,
                answer: '9',
                accept: ['neuf'],
                mistakes: [
                  { answer: '10', why: 'Le produit sans catégorie n\'est pas gardé : `NULL NOT IN (...)` vaut NULL, pas vrai. Il faudrait ajouter `OR categorie IS NULL`.' },
                  { answer: '20', why: 'NOT IN exclut bien les 10 produits Informatique et Audio.' }
                ],
                hint: 'Que vaut une comparaison avec une valeur inconnue ?',
                explain: 'Les 9 produits des autres catégories passent. Le produit dont la catégorie est NULL est écarté, car comparer NULL à une liste ne donne ni vrai ni faux. Pour l\'inclure : `WHERE categorie NOT IN (...) OR categorie IS NULL`.'
              },
              recap: [
                '`IN (a, b, c)` teste l\'appartenance à une liste, `BETWEEN a AND b` un intervalle bornes incluses.',
                'LIKE : `%` pour une suite de caractères, `_` pour un seul ; en SQLite, la casse est ignorée sauf pour les lettres accentuées.',
                'NULL = valeur inconnue : on la teste avec `IS NULL` / `IS NOT NULL`, jamais avec `=`.',
                'Une valeur NULL n\'est gardée ni par IN ni par NOT IN.'
              ],
              check: {
                type: 'bug',
                db: 'boutique',
                prompt: 'Ce code doit afficher les clients dont l\'email est inconnu, pour leur demander de le compléter. Il ne renvoie **aucune ligne**, alors que trois clients n\'ont pas d\'email. Clique sur la ligne fautive.',
                code: `SELECT prenom, nom
FROM clients
WHERE email = NULL;`,
                bugLine: 3,
                why: 'Une comparaison avec NULL donne toujours NULL (ni vrai ni faux), donc `email = NULL` n\'est jamais vrai et aucune ligne n\'est gardée.',
                fixes: ['WHERE email IS NULL;', "WHERE email = 'NULL';", "WHERE email = '';", 'WHERE email == NULL;'],
                fixAnswer: 0,
                fixWhy: {
                  1: "'NULL' entre apostrophes est le texte de quatre lettres N-U-L-L, pas l'absence de valeur.",
                  2: "'' est un texte vide : c'est une valeur connue, différente de NULL.",
                  3: '`==` est un autre nom de `=` en SQLite : même problème, la comparaison avec NULL ne vaut jamais vrai.'
                },
                hint: 'NULL n\'est pas une valeur comme les autres : quel opérateur dédié la teste ?',
                explain: '`IS NULL` est l\'opérateur prévu pour tester l\'absence de valeur. La requête corrigée renvoie Emma Dubois, Manon Leroy et Alice Vincent.'
              }
            }
          ]
        },
        {
          id: 'sql.u3',
          title: 'ORDER BY et LIMIT',
          summary: 'Trier les résultats de façon fiable et n\'en garder qu\'une partie.',
          lessons: [
            {
              id: 'sql.u3.l1',
              title: 'Trier et limiter',
              minutes: 6,
              objective: 'Tu sais trier un résultat sur une ou plusieurs colonnes avec ORDER BY et en garder une partie avec LIMIT et OFFSET.',
              explain: `Sans \`ORDER BY\`, l'ordre des lignes n'est **pas garanti** : il peut changer après une mise à jour de la base. Pour un ordre fiable :

- \`ORDER BY prix\` trie du plus petit au plus grand (\`ASC\`, par défaut) ; \`ORDER BY prix DESC\` fait l'inverse.
- \`ORDER BY prix DESC, nom\` départage les égalités de prix par le nom.
- \`LIMIT 5\` garde les 5 premières lignes ; \`LIMIT 5 OFFSET 10\` saute d'abord les 10 premières (page 3 d'une liste de 5 éléments par page).

Les clauses s'écrivent toujours dans cet ordre : \`SELECT\`, \`FROM\`, \`WHERE\`, \`ORDER BY\`, \`LIMIT\`.

Particularités de SQLite : NULL est plus petit que tout, donc en tête d'un tri croissant (\`NULLS LAST\` le renvoie à la fin) ; le texte est comparé octet par octet, si bien que les lettres accentuées comme \`É\` passent après \`z\`. Sous SQL Server, que tu croiseras sûrement sous Windows, on écrit \`SELECT TOP 5\` au lieu de \`LIMIT 5\`.`,
              example: {
                db: 'boutique',
                code: `SELECT nom, prix
FROM produits
WHERE categorie = 'Informatique'
ORDER BY prix DESC, nom
LIMIT 3;`,
                output: `nom                  | prix
---------------------+-----
Écran 27 pouces      | 249
Disque SSD 1 To      | 99.9
Carte Raspberry Pi 5 | 89.9`,
                notes: [
                  { line: 4, text: 'Tri par prix décroissant. La carte Raspberry Pi et le clavier mécanique coûtent tous deux 89,90 € : le nom les départage.' },
                  { line: 5, text: 'LIMIT 3 garde les trois premières lignes du résultat trié. Le clavier, quatrième, est écarté.' }
                ]
              },
              exercises: [
                {
                  type: 'order',
                  db: 'boutique',
                  prompt: 'Remets les lignes dans l\'ordre pour afficher les 5 produits en stock les plus chers.',
                  lines: ['SELECT nom, prix', 'FROM produits', 'WHERE stock > 0', 'ORDER BY prix DESC', 'LIMIT 5;'],
                  hint: 'Les clauses suivent toujours le même ordre : on choisit, on lit, on filtre, on trie, on coupe.',
                  explain: 'SELECT, FROM, WHERE, ORDER BY, LIMIT : c\'est l\'ordre imposé par SQL. LIMIT vient en dernier car il coupe le résultat déjà filtré et trié.'
                },
                {
                  type: 'code',
                  prompt: 'Affiche le **prénom**, le **nom** et la **date d\'inscription** des **5 clients inscrits le plus récemment**, du plus récent au plus ancien.',
                  db: 'boutique',
                  ordered: true,
                  starter: `SELECT prenom, nom, date_inscription
FROM clients;`,
                  solution: `SELECT prenom, nom, date_inscription
FROM clients
ORDER BY date_inscription DESC
LIMIT 5;`,
                  hint: 'Trie sur la date dans l\'ordre décroissant, puis coupe le résultat.',
                  explain: 'Les dates au format AAAA-MM-JJ se trient correctement ; DESC met les plus récentes en premier et LIMIT 5 garde les cinq premières.'
                }
              ],
              challenge: {
                type: 'bug',
                db: 'boutique',
                prompt: 'Ce code doit lister les clients par ville, de A à Z, avec **les clients sans ville à la fin**. Or ils apparaissent en premier. Clique sur la ligne fautive.',
                code: `SELECT prenom, nom, ville
FROM clients
ORDER BY ville;`,
                bugLine: 3,
                why: 'En SQLite, NULL est considéré comme plus petit que toute valeur : dans un tri croissant, les villes inconnues arrivent donc en tête.',
                fixes: ['ORDER BY ville NULLS LAST;', 'ORDER BY ville DESC;', 'ORDER BY ville ASC;', 'WHERE ville IS NOT NULL ORDER BY ville;'],
                fixAnswer: 0,
                fixWhy: {
                  1: 'DESC met bien les NULL à la fin, mais trie aussi les villes de Z à A.',
                  2: 'ASC est déjà le tri par défaut : rien ne change, les NULL restent en tête.',
                  3: 'Ce filtre supprime les clients sans ville au lieu de les placer à la fin.'
                },
                hint: 'Il existe une option de ORDER BY qui choisit la place des valeurs NULL.',
                explain: '`NULLS LAST` (disponible depuis SQLite 3.30, comme dans PostgreSQL) garde le tri croissant et renvoie les NULL à la fin. Son contraire est `NULLS FIRST`.'
              },
              recap: [
                'Sans ORDER BY, l\'ordre des lignes n\'est pas garanti.',
                '`ORDER BY col DESC, autre_col` trie et départage les égalités.',
                '`LIMIT n OFFSET m` saute m lignes puis en garde n : c\'est la pagination.',
                'En SQLite, NULL passe en tête d\'un tri croissant (sauf avec NULLS LAST) et les lettres accentuées après z.'
              ],
              check: {
                type: 'predict',
                prompt: 'Quelle valeur renvoie la dernière requête ?',
                code: `-- Données de l'exercice
CREATE TABLE scores (joueur TEXT, points INTEGER);
INSERT INTO scores VALUES
  ('ada', 120), ('linus', 95), ('grace', 120), ('alan', 80);

SELECT joueur FROM scores
ORDER BY points DESC, joueur
LIMIT 1 OFFSET 1;`,
                answer: 'grace',
                mistakes: [
                  { answer: 'ada', why: 'ada est bien en tête du tri, mais OFFSET 1 saute la première ligne.' },
                  { answer: 'linus', why: 'ada et grace sont à égalité avec 120 points : elles occupent les deux premières places, départagées par ordre alphabétique.' }
                ],
                hint: 'Écris le classement complet (points décroissants, puis nom), puis saute une ligne.',
                explain: 'Classement : ada (120), grace (120), linus (95), alan (80). OFFSET 1 saute ada, LIMIT 1 garde la suivante : grace.'
              }
            }
          ]
        }
      ]
    }
  ]
});
