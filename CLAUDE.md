# Consignes pour Claude : dépôt pile-poil (jeu Ultimate Football, anciennement Ajusto)

L'utilisateur débute en développement (il connaît PowerShell) : réponses en français, explications simples, étapes
numérotées.

À chaque choix créatif ou à chaque décision à prendre (noms, textes, visuels, réglages…), donner de l'inspiration :
plusieurs idées concrètes (4 à 6), avec pour chacune ses points forts et ses risques, et une recommandation.
Pour un nom, faire une recherche rapide d'homonymes (applis, jeux, studios) et l'indiquer.

## Le projet

Jeu de football 3D pour smartphone Android (Samsung Galaxy S24, Chrome, PWA, paysage), en Three.js, développé par
étapes. Étape 1 faite (prototype jouable, version 0.1). Étapes suivantes, dans l'ordre :
2. vrai match (durée, mi-temps), IA offensive et défensive collective, gardiens, niveaux de difficulté ;
3. animations, collisions, règles (fautes, coups francs, penalties, hors-jeu, cartons, remplacements, vraies remises
   en jeu), statistiques ;
4. carrière joueur ; 5. carrière entraîneur et transferts ; 6. menus définitifs, sauvegardes, PWA finale.

Règles de l'utilisateur, à chaque étape :
- écrire les fichiers complets, vérifier les erreurs, tester les fonctions et le tactile, corriger avant de passer à
  l'étape suivante ;
- ne jamais dire qu'une fonction marche si elle n'est pas faite ; pas de faux boutons ni de fonction décorative ;
  pas d'animation qui fait semblant à la place d'une vraie mécanique ;
- code découpé en modules (moteur, joueurs, ballon, physique, IA, commandes, menus, match, carrières, sauvegardes) ;
- priorité à la fluidité sur téléphone (viser 60 images/s, qualité adaptative, pas de modèles 3D lourds) ;
- clubs, maillots, logos et noms inventés : aucun élément protégé.

## À chaque mise à jour du jeu

1. Augmenter `VERSION` dans `src/config.js` (0.1 → 0.2…). Changer aussi `CACHE` dans `sw.js` et y ajouter tout
   nouveau fichier dans `FILES` (sinon il manquera hors ligne).
2. Mettre à jour `README.md` (ce qui marche, ce qui reste à faire, commandes, tests).
3. Tester dans Chromium (Playwright) avant de pousser, servi en http (les modules ne marchent pas en file://) :
   aucune erreur, écrans concernés vérifiés, vrais événements tactiles pour les commandes. Le navigateur de test
   dessine la 3D sans carte graphique (lent) : mesurer la mécanique avec le mode pas à pas (`UF.setManual(true)`,
   `UF.step(n)`), et ne pas présenter ses images/s comme celles d'un téléphone.
4. Commit sur `main` puis push : GitHub Pages republie le site en 1 à 2 minutes.
5. Ajouter la version au tableau « Télécharger une version » du README, avec le lien ZIP du commit de la version :
   `https://github.com/lekamaro-cyber/pile-poil/archive/<SHA complet>.zip` (les tags sont refusés par le proxy de
   l'environnement : ne pas en pousser).
6. Fabriquer `UltimateFootball-v0.1.zip` (dossier `UltimateFootball-v0.1/` avec `index.html`, `css/`, `src/`, `lib/`,
   `manifest.webmanifest`, `sw.js`, les icônes `*.png`, `serveur-local.ps1` et `README.md`) et l'envoyer à l'utilisateur
   comme fichier à télécharger, avec le lien ZIP de la version et le lien « dernière version » :
   `https://github.com/lekamaro-cyber/pile-poil/archive/refs/heads/main.zip`.

## À ne pas changer

- Le nom du dépôt (donc l'adresse `/pile-poil/`) : l'appli déjà installée sur les téléphones ne marcherait plus.
- Le dossier `codequest/` : c'est un autre projet, indépendant. Ne pas le modifier ni le supprimer.
- Les clés de sauvegarde `uf.*` une fois des carrières sauvegardées : les renommer effacerait la progression.
- Three.js est inclus localement (`lib/three.module.min.js`, version 0.170.0, licence MIT) : pas de chargement depuis
  un site externe (le jeu doit marcher hors ligne).

Publication sur Google Play : suivre `PUBLIER-SUR-GOOGLE-PLAY.md` et `DECISIONS-PUBLICATION.md` (écrits pour Ajusto :
le compte développeur et le studio restent valables ; le nom, le titre et l'identifiant de l'appli sont à revoir).
