# Consignes pour Claude : dépôt pile-poil (jeu Ajusto, anciennement Justo)

L'utilisateur débute en développement : réponses en français, explications simples, étapes numérotées.

À chaque choix créatif ou à chaque décision à prendre (noms, textes, visuels, réglages…), donner de l'inspiration :
plusieurs idées concrètes (4 à 6), avec pour chacune ses points forts et ses risques, et une recommandation.
Pour un nom, faire une recherche rapide d'homonymes (applis, jeux, studios) et l'indiquer.

Publication sur Google Play : suivre `PUBLIER-SUR-GOOGLE-PLAY.md` et respecter les choix de
`DECISIONS-PUBLICATION.md` (studio, identifiant de l'appli définitif, public « Familles », etc.).

## À chaque mise à jour du jeu

1. Augmenter `VERSION` en haut du script de `index.html` (1.3 → 1.4, etc.).
2. Mettre à jour `README.md` si une fonction change.
3. Tester dans Chromium (Playwright) avant de pousser : aucune erreur, écrans concernés vérifiés.
4. Commit sur `main` puis push : GitHub Pages republie le site en 1 à 2 minutes.
5. Ajouter la version au tableau « Télécharger une version » du README, avec le lien ZIP du commit de la version :
   `https://github.com/lekamaro-cyber/pile-poil/archive/<SHA complet>.zip` (les tags sont refusés par le proxy de
   l'environnement : ne pas en pousser).
6. Fabriquer `Ajusto-v1.9.zip` (dossier `Ajusto-v1.9/` avec `index.html`, `manifest.webmanifest`, `sw.js`,
   les icônes `*.png` et `README.md`) et l'envoyer à l'utilisateur comme fichier à télécharger, avec le lien ZIP de
   la version et le lien « dernière version » : `https://github.com/lekamaro-cyber/pile-poil/archive/refs/heads/main.zip`.

## À ne pas changer

- Les clés de sauvegarde `pilepoil.*` et la graine du défi du jour `pilepoil-AAAA-MM-JJ` : les renommer effacerait
  les records des joueurs et changerait le parcours du jour.
- Le nom du dépôt (donc l'adresse `/pile-poil/`) : l'appli déjà installée sur les téléphones ne marcherait plus.
- Les 7 langues du bloc `LANGS` doivent toujours avoir exactement les mêmes clés.
- Le parcours du défi du jour doit rester le même pour tout le monde (même date = même règle du jour, mêmes trous) :
  - ce qui dépend de la règle du jour (`DAILY_RULES`) est tiré avec `rng`, toujours dans le même ordre ;
  - les nouveautés des modes Classique et Chrono (murs dorés, bonus…) sont tirées avec `Math.random`, jamais `rng` ;
  - après chaque changement, vérifier que les 3 premiers trous du 2026-10-20 (règle « Tout respire ») restent
    0.22000 0.12000 0.31034 (le 3e respire), avec le `CONFIG` par défaut. Valeurs de la version 1.8 : changer la
    génération change les parcours de tous les jours, à ne faire que volontairement.
