# Consignes pour Claude : dépôt pile-poil (jeu Justo)

L'utilisateur débute en développement : réponses en français, explications simples, étapes numérotées.

## À chaque mise à jour du jeu

1. Augmenter `VERSION` en haut du script de `index.html` (1.3 → 1.4, etc.).
2. Mettre à jour `README.md` si une fonction change.
3. Tester dans Chromium (Playwright) avant de pousser : aucune erreur, écrans concernés vérifiés.
4. Commit sur `main` puis push : GitHub Pages republie le site en 1 à 2 minutes.
5. Ajouter la version au tableau « Télécharger une version » du README, avec le lien ZIP du commit de la version :
   `https://github.com/lekamaro-cyber/pile-poil/archive/<SHA complet>.zip` (les tags sont refusés par le proxy de
   l'environnement : ne pas en pousser).
6. Fabriquer `Justo-v1.4.zip` (dossier `Justo-v1.4/` avec `index.html`, `manifest.webmanifest`, `sw.js`,
   les icônes `*.png` et `README.md`) et l'envoyer à l'utilisateur comme fichier à télécharger, avec le lien ZIP de
   la version et le lien « dernière version » : `https://github.com/lekamaro-cyber/pile-poil/archive/refs/heads/main.zip`.

## À ne pas changer

- Les clés de sauvegarde `pilepoil.*` et la graine du défi du jour `pilepoil-AAAA-MM-JJ` : les renommer effacerait
  les records des joueurs et changerait le parcours du jour.
- Le nom du dépôt (donc l'adresse `/pile-poil/`) : l'appli déjà installée sur les téléphones ne marcherait plus.
- Les 7 langues du bloc `LANGS` doivent toujours avoir exactement les mêmes clés.
