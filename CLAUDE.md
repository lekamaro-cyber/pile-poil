# Consignes pour Claude : dépôt pile-poil (jeu Justo)

L'utilisateur débute en développement : réponses en français, explications simples, étapes numérotées.

## À chaque mise à jour du jeu

1. Augmenter `VERSION` en haut du script de `index.html` (1.3 → 1.4, etc.).
2. Mettre à jour `README.md` si une fonction change.
3. Tester dans Chromium (Playwright) avant de pousser : aucune erreur, écrans concernés vérifiés.
4. Commit sur `main` puis push : GitHub Pages republie le site en 1 à 2 minutes.
5. Créer et pousser le tag de version : `git tag -a v1.4 -m "Justo 1.4" && git push origin v1.4`.
6. Fabriquer `Justo-v1.4.zip` (dossier `Justo-v1.4/` avec `index.html`, `manifest.webmanifest`, `sw.js`,
   les icônes `*.png` et `README.md`), l'envoyer à l'utilisateur comme fichier à télécharger, et donner le lien
   permanent : `https://github.com/lekamaro-cyber/pile-poil/archive/refs/tags/v1.4.zip`.

## À ne pas changer

- Les clés de sauvegarde `pilepoil.*` et la graine du défi du jour `pilepoil-AAAA-MM-JJ` : les renommer effacerait
  les records des joueurs et changerait le parcours du jour.
- Le nom du dépôt (donc l'adresse `/pile-poil/`) : l'appli déjà installée sur les téléphones ne marcherait plus.
- Les 7 langues du bloc `LANGS` doivent toujours avoir exactement les mêmes clés.
