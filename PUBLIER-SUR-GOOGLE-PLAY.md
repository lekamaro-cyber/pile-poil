# Publier Ajusto sur Google Play : la marche à suivre

Liste à cocher, dans l'ordre. **Toi** = ce que toi seul peux faire (comptes, paiements, identité, testeurs).
**Claude** = ce que je prépare. Réutilisable pour les prochains jeux.

Chemin technique choisi : le jeu est mis dans une vraie appli Android avec **Capacitor** (le jeu tourne dans
l'appli, 100 % hors ligne), construite automatiquement par **GitHub Actions** (pas besoin d'installer Android
Studio). Première sortie **sans publicité** : les pubs AdMob viendront dans une mise à jour, une fois le jeu validé.

## Phase 1 : décisions (Toi, 1 soirée)

- [ ] 1. **Nom du studio** (nom d'éditeur affiché sous le jeu) : vérifier INPI / TMview, Google Play, nom de domaine.
- [ ] 2. **Type de compte** : personnel (pièce d'identité, test fermé de 12 testeurs pendant 14 jours obligatoire)
      ou organisation (micro-entreprise + numéro D-U-N-S, adresse de l'entreprise affichée à la place de la tienne).
- [ ] 3. **Identifiant de l'appli** (ex. `com.nomdustudio.ajusto`) : **définitif**, il ne pourra plus jamais changer.
- [ ] 4. **Public visé** : si les moins de 13 ans font partie du public, les règles « Familles » de Google
      s'appliquent (plus strictes, surtout pour les pubs plus tard). Google juge aussi sur l'apparence du jeu.

## Phase 2 : comptes (Toi, de quelques jours à 4 semaines)

- [ ] 5. Compte Google dédié au studio, sécurisé (clés de sécurité ou passkey, codes de secours hors ligne).
- [ ] 6. (Conseillé) Nom de domaine + adresse `contact@` (redirection vers le compte du studio).
- [ ] 7. (Organisation seulement) Micro-entreprise, puis numéro D-U-N-S (gratuit, jusqu'à 30 jours).
- [ ] 8. Compte développeur sur play.google.com/console : 25 $ une fois, vérification d'identité, e-mail et
      téléphone vérifiés, puis **vérification d'un téléphone Android** (appli Play Console, Android 10 ou plus,
      non rooté).

## Phase 3 : l'appli Android (Claude, plus une étape pour Toi)

- [ ] 9. Claude : projet Android Capacitor 8 (cible Android 16, API 36, exigée par Google depuis le 31 août 2026),
      dans le dossier `app-android/` de ce dépôt.
- [ ] 10. Claude : adapter le jeu à l'appli : partage et vibrations natifs, bouton retour d'Android, portrait,
      pas de plein écran ni de service worker dans l'appli.
- [ ] 11. Claude : construction automatique sur GitHub (GitHub Actions) d'un fichier `.aab` signé à chaque version.
- [ ] 12. Toi : créer la **clé d'importation** (comme la clé privée d'un certificat de signature de code) sur ton PC
      avec une commande PowerShell fournie, la sauvegarder (2 copies hors ligne + mot de passe dans le gestionnaire),
      puis l'ajouter dans les « secrets » du dépôt GitHub. Elle ne va jamais dans le dépôt lui-même.

## Phase 4 : la fiche du jeu (Claude prépare, Toi valides et colles dans la console)

- [ ] 13. Textes en 7 langues : titre (30 caractères), description courte (80), description longue (4 000).
- [ ] 14. Images : icône 512 × 512, image de présentation 1 024 × 500, 4 à 8 captures d'écran de téléphone.
- [ ] 15. Politique de confidentialité (page web : le jeu ne collecte aucune donnée, tout reste sur le téléphone).
- [ ] 16. Rubrique « Contenu de l'appli » de la console : confidentialité, accès à l'appli, annonces (non),
      classification du contenu (questionnaire IARC), public cible, sécurité des données (aucune donnée collectée).

## Phase 5 : tests (Toi et tes testeurs, au moins 14 jours)

- [ ] 17. Test interne : envoyer le `.aab`, installer l'appli sur ton téléphone depuis Google Play.
- [ ] 18. Test fermé : au moins 12 testeurs (en recruter 15 à 20), inscrits **sans interruption pendant 14 jours**,
      qui jouent vraiment. Claude corrige les bugs remontés.
- [ ] 19. Demander l'accès à la production (questionnaire sur le déroulement du test).

## Phase 6 : sortie et suite

- [ ] 20. Envoi en production : choix des pays, examen par Google (quelques jours, parfois plus).
- [ ] 21. Après la sortie : chaque mise à jour = nouvelle version + nouveau `.aab`. Suivre les avis et les plantages.
- [ ] 22. Plus tard : publicités AdMob (mise à jour séparée : consentement RGPD, déclarations « annonces » et
      « sécurité des données » à modifier).

## Coûts et durée

- 25 $ une fois (Google Play). Nom de domaine conseillé : environ 10 à 15 € par an.
- Durée réaliste : 4 à 6 semaines, surtout à cause des 14 jours de test fermé et des examens de Google.
