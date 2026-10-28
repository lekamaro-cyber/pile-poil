// CodeQuest : bibliothèque de projets guidés (2/2).
// Projets intermédiaires à experts : application de notes, tableau de bord de données, API REST,
// machine learning (k plus proches voisins), analyse de données publiques, suivi de progression.
// Comme dans projets-1.js, le code de chaque étape est assemblé à partir de blocs pour que le starter
// d'une étape reprenne exactement la solution de l'étape précédente.
(function () {
  const py = (...blocs) => blocs.join('\n\n\n') + '\n';
  const js = (...blocs) => blocs.join('\n\n') + '\n';

  // =====================================================================================
  // Projet 8 : Application de notes (JavaScript, page DOM)
  // =====================================================================================
  const NO_HTML = `<section id="app">
  <h2>Mes notes</h2>
  <div class="formulaire">
    <label for="titre">Titre</label>
    <input id="titre" type="text" autocomplete="off">
    <label for="contenu">Contenu</label>
    <textarea id="contenu" rows="3"></textarea>
    <button id="ajouter" type="button">Ajouter la note</button>
    <p id="erreur" role="alert"></p>
  </div>
  <label for="recherche">Rechercher</label>
  <input id="recherche" type="search">
  <p id="compteur"></p>
  <ul id="liste"></ul>
</section>
<style>
  .formulaire { display: grid; gap: 4px; max-width: 360px; margin-bottom: 12px; }
  #erreur { color: #c92a2a; min-height: 1em; margin: 0; }
  #liste { list-style: none; padding: 0; }
  .note { border: 1px solid #dde1ee; border-radius: 6px; padding: 8px 12px; margin: 6px 0; }
  .note h3 { margin: 0 0 4px; font-size: 1rem; }
</style>`;
  const NO_MODELE = `let prochainId = 1;

function creerNote(titre, contenu) {
  const titrePropre = titre.trim();
  if (titrePropre === '') {
    throw new Error('Le titre est obligatoire.');
  }
  const note = { id: prochainId, titre: titrePropre, contenu: contenu.trim() };
  prochainId += 1;
  return note;
}

function ajouterNote(notes, note) {
  return [note, ...notes];
}`;
  const NO_MODELE_0 = `let prochainId = 1;

function creerNote(titre, contenu) {
  // À toi : retire les espaces autour du titre et du contenu.
  // Titre vide : throw new Error('Le titre est obligatoire.').
  // Renvoie { id, titre, contenu } avec id = prochainId, puis augmente prochainId.
}

function ajouterNote(notes, note) {
  // À toi : renvoie un NOUVEAU tableau avec la note en premier, suivie des anciennes.
}`;
  const NO_LISTE = `function supprimerNote(notes, id) {
  return notes.filter((note) => note.id !== id);
}

function rechercher(notes, texte) {
  const cherche = texte.trim().toLowerCase();
  if (cherche === '') return notes;
  return notes.filter((note) =>
    note.titre.toLowerCase().includes(cherche) || note.contenu.toLowerCase().includes(cherche)
  );
}`;
  const NO_LISTE_0 = `function supprimerNote(notes, id) {
  // À toi : renvoie un nouveau tableau sans la note qui a cet id.
}

function rechercher(notes, texte) {
  // À toi : notes dont le titre OU le contenu contient texte, sans tenir compte des majuscules.
  // Une recherche vide (ou faite d’espaces) renvoie toutes les notes.
}`;
  const NO_ETAT = `let notes = [];
const liste = document.querySelector('#liste');
const compteur = document.querySelector('#compteur');

function texteCompteur(nombre) {
  if (nombre === 0) return 'Aucune note';
  return nombre === 1 ? '1 note' : \`\${nombre} notes\`;
}`;
  const NO_AFFICHER = `function afficher(aAfficher) {
  liste.innerHTML = '';
  for (const note of aAfficher) {
    const li = document.createElement('li');
    li.className = 'note';
    const titre = document.createElement('h3');
    titre.textContent = note.titre;
    const contenu = document.createElement('p');
    contenu.textContent = note.contenu;
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'supprimer';
    bouton.dataset.id = note.id;
    bouton.textContent = 'Supprimer';
    li.append(titre, contenu, bouton);
    liste.append(li);
  }
  compteur.textContent = texteCompteur(aAfficher.length);
}`;
  const NO_AFFICHER_0 = `function afficher(aAfficher) {
  // À toi : vide la liste, puis pour chaque note crée :
  // <li class="note"><h3>titre</h3><p>contenu</p><button type="button" class="supprimer" data-id="…">Supprimer</button></li>
  // Utilise textContent (jamais innerHTML) pour le titre et le contenu.
  // Enfin, écris texteCompteur(aAfficher.length) dans compteur.
}`;
  const NO_DEMARRER = 'afficher(notes);';
  const NO_CHAMPS = `const champTitre = document.querySelector('#titre');
const champContenu = document.querySelector('#contenu');
const zoneErreur = document.querySelector('#erreur');`;
  const NO_AJOUT = `document.querySelector('#ajouter').addEventListener('click', () => {
  try {
    const note = creerNote(champTitre.value, champContenu.value);
    notes = ajouterNote(notes, note);
    champTitre.value = '';
    champContenu.value = '';
    zoneErreur.textContent = '';
    afficher(notes);
  } catch (erreur) {
    zoneErreur.textContent = erreur.message;
  }
});`;
  const NO_AJOUT_0 = `// À toi : au clic sur #ajouter, crée la note avec creerNote(champTitre.value, champContenu.value),
// ajoute-la à notes avec ajouterNote, vide les deux champs et zoneErreur, puis affiche les notes.
// Si creerNote lance une erreur, écris son message dans zoneErreur.`;
  const NO_AJOUT2 = NO_AJOUT.replace('    afficher(notes);', '    afficherFiltre();');
  const NO_SUPPR = `const champRecherche = document.querySelector('#recherche');

function afficherFiltre() {
  afficher(rechercher(notes, champRecherche.value));
}

liste.addEventListener('click', (evenement) => {
  const bouton = evenement.target.closest('button.supprimer');
  if (!bouton) return;
  notes = supprimerNote(notes, Number(bouton.dataset.id));
  afficherFiltre();
});

champRecherche.addEventListener('input', afficherFiltre);`;
  const NO_SUPPR_0 = `const champRecherche = document.querySelector('#recherche');

function afficherFiltre() {
  // À toi : affiche seulement les notes qui correspondent à champRecherche.value
}

// À toi : UN seul écouteur de clic sur liste. Si le clic vient d’un bouton .supprimer,
// retire la note (son id est dans bouton.dataset.id, sous forme de texte) et réaffiche.

// À toi : à chaque saisie (événement input) dans champRecherche, réaffiche les notes filtrées.`;
  const NO_FIXTURE = `const N = [
  { id: 1, titre: 'Courses', contenu: 'Pain, lait, café' },
  { id: 2, titre: 'Projet quiz', contenu: 'Ajouter un minuteur' },
  { id: 3, titre: 'Lecture', contenu: 'Chapitre sur les promesses' },
];
`;

  const NO_S1 = js(NO_MODELE);
  const NO_S2 = js(NO_MODELE, NO_LISTE);
  const NO_S3 = js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER, NO_DEMARRER);
  const NO_S4 = js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER, NO_CHAMPS, NO_AJOUT, NO_DEMARRER);
  const NO_S5 = js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER, NO_CHAMPS, NO_AJOUT2, NO_SUPPR, NO_DEMARRER);

  const projetNotes = {
    id: 'pj.notes',
    title: 'Application de notes',
    difficulty: 2,
    lang: 'javascript',
    summary: 'Une application de prise de notes dans le navigateur : créer, afficher, rechercher et supprimer.',
    result: 'Une page avec un formulaire « Titre / Contenu ». « Ajouter la note » place la note en tête de liste et vide les champs ; un titre vide affiche « Le titre est obligatoire. ». Le champ de recherche filtre les notes à chaque lettre tapée (titre ou contenu, sans tenir compte des majuscules), chaque note a un bouton « Supprimer », et un compteur indique « 2 notes ».',
    skills: ['js.u5', 'js.u6', 'js.u7', 'js.u8', 'js.u9', 'js.u10', 'js.u14'],
    steps: [
      {
        title: 'Étape 1 : le modèle d’une note',
        explain: 'Une note est un objet `{ id, titre, contenu }`. L’`id` unique permettra de supprimer la bonne note même si deux notes ont le même titre. `creerNote` **valide** les données : un titre vide est refusé avec `throw new Error(...)`. Le message de l’erreur sera affiché tel quel à l’utilisateur.\n\n`ajouterNote` ne modifie pas le tableau reçu : elle en **renvoie un nouveau**, avec la syntaxe de décomposition `[note, ...notes]`. Ne jamais modifier les données reçues rend le code plus prévisible : aucune fonction ne change un tableau dans le dos d’une autre.',
        ex: {
          type: 'code',
          prompt: 'Complète `creerNote(titre, contenu)` (nettoyage, validation, id unique) et `ajouterNote(notes, note)`, qui renvoie un nouveau tableau avec la note en premier.',
          starter: js(NO_MODELE_0),
          solution: NO_S1,
          tests: [
            { code: "const n = creerNote('  Idée de projet  ', ' Un tableau de bord ');\nassertEqual(n.titre, 'Idée de projet');\nassertEqual(n.contenu, 'Un tableau de bord');\nassert(typeof n.id === 'number', 'la note doit avoir un id numérique');", label: 'creerNote nettoie le titre et le contenu, et donne un id' },
            { code: "const a = creerNote('A', '');\nconst b = creerNote('B', '');\nassert(a.id !== b.id, 'deux notes doivent avoir des id différents');", label: 'Deux notes ont des id différents' },
            { code: "let message = null;\ntry { creerNote('   ', 'texte'); } catch (e) { message = e.message; }\nassertEqual(message, 'Le titre est obligatoire.');", label: 'Un titre vide lance l’erreur « Le titre est obligatoire. »' },
            { code: "const avant = [{ id: 1, titre: 'Ancienne', contenu: '' }];\nconst apres = ajouterNote(avant, { id: 2, titre: 'Nouvelle', contenu: '' });\nassertEqual(apres.map((n) => n.id), [2, 1]);\nassertEqual(avant.length, 1, 'le tableau de départ ne doit pas être modifié');", label: 'ajouterNote renvoie un nouveau tableau, la nouvelle note en premier' }
          ],
          hint: 'Dans `creerNote`, vérifie le titre nettoyé avant de toucher à `prochainId`. Pour `ajouterNote`, une seule ligne suffit avec `...`.',
          explain: 'L’id n’est consommé que si la note est valide, car la vérification vient avant. `[note, ...notes]` copie les anciennes notes dans un nouveau tableau : l’ancien reste intact, ce que vérifie le dernier test.'
        }
      },
      {
        title: 'Étape 2 : supprimer et rechercher',
        explain: 'Deux opérations sur la liste, toujours sans la modifier : on **renvoie un nouveau tableau** avec `filter`, qui garde les éléments pour lesquels la fonction renvoie `true`.\n\nLa recherche doit être **tolérante** : « QUIZ » doit trouver « Projet quiz ». On compare donc tout en minuscules avec `toLowerCase()`, et on cherche dans le titre **ou** le contenu avec `includes`. Une recherche vide renvoie toutes les notes : sinon, effacer le champ de recherche viderait l’écran.',
        ex: {
          type: 'code',
          prompt: 'Écris `supprimerNote(notes, id)` et `rechercher(notes, texte)` avec `filter`. Aucune des deux ne modifie le tableau reçu.',
          starter: js(NO_MODELE, NO_LISTE_0),
          solution: NO_S2,
          tests: [
            { code: NO_FIXTURE + "assertEqual(supprimerNote(N, 2).map((n) => n.id), [1, 3]);\nassertEqual(N.length, 3, 'le tableau de départ ne doit pas être modifié');", label: 'supprimerNote retire la note 2 sans toucher au tableau de départ' },
            { code: NO_FIXTURE + "assertEqual(rechercher(N, 'QUIZ').map((n) => n.id), [2]);", label: 'La recherche ignore les majuscules' },
            { code: NO_FIXTURE + "assertEqual(rechercher(N, 'promesses').map((n) => n.id), [3]);", label: 'La recherche porte aussi sur le contenu' },
            { code: NO_FIXTURE + "assertEqual(rechercher(N, '   ').length, 3);", label: 'Une recherche vide renvoie toutes les notes' }
          ],
          hint: '`notes.filter((note) => condition)` : pour supprimer, la condition est « l’id est différent ». Pour rechercher, combine deux `includes` avec `||`.',
          explain: '`filter` crée toujours un nouveau tableau, ce qui respecte la règle de l’étape 1. Mettre le texte cherché en minuscules une seule fois, avant le filtre, évite de refaire le calcul pour chaque note.'
        }
      },
      {
        title: 'Étape 3 : afficher les notes',
        explain: 'On relie la logique à la **page**. La variable `notes` contient l’état de l’application, et `afficher` dessine une liste de notes dans `#liste`. Elle commence par vider la liste : afficher, c’est toujours **redessiner à partir de l’état**.\n\nPoint de **sécurité** essentiel : le titre et le contenu viennent de l’utilisateur. Avec `innerHTML`, un titre comme `<img src=x onerror=...>` serait interprété comme du HTML et pourrait exécuter du code : c’est une faille **XSS**. Avec `textContent`, le texte est affiché tel quel, jamais interprété. Chaque bouton « Supprimer » garde l’id de sa note dans `data-id`.',
        ex: {
          type: 'code',
          dom: true,
          html: NO_HTML,
          prompt: 'Complète `afficher(aAfficher)` : un `li.note` par note avec `h3`, `p` et un bouton `.supprimer` portant `data-id`, puis le compteur. Utilise `textContent` pour les textes.',
          starter: js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER_0, NO_DEMARRER),
          solution: NO_S3,
          tests: [
            { code: "assertEqual(document.querySelector('#compteur').textContent, 'Aucune note');", label: 'Au démarrage, le compteur indique « Aucune note »' },
            { code: "afficher([{ id: 1, titre: 'Courses', contenu: 'Pain' }, { id: 2, titre: 'Lecture', contenu: 'Chapitre 4' }]);\nassertEqual(document.querySelectorAll('#liste li.note').length, 2);\nassertEqual(document.querySelector('#liste li h3').textContent, 'Courses');\nassertEqual(document.querySelector('#compteur').textContent, '2 notes');", label: 'Deux notes affichées, avec leur titre, et « 2 notes »' },
            { code: "afficher([{ id: 7, titre: 'Seule', contenu: 'x' }]);\nassertEqual(document.querySelectorAll('#liste li').length, 1, 'afficher doit remplacer la liste précédente');\nassertEqual(document.querySelector('#liste button.supprimer').dataset.id, '7');\nassertEqual(document.querySelector('#compteur').textContent, '1 note');", label: 'afficher remplace la liste ; le bouton porte data-id' },
            { code: "afficher([{ id: 5, titre: '<b>Important</b>', contenu: '<i>texte</i>' }]);\nassertEqual(document.querySelector('#liste h3').textContent, '<b>Important</b>');\nassert(document.querySelector('#liste b') === null, 'le titre doit être affiché comme du texte, pas interprété comme du HTML');", label: 'Le HTML tapé par l’utilisateur n’est jamais interprété (protection XSS)' }
          ],
          hint: 'Crée chaque élément avec `document.createElement`, remplis-le avec `textContent`, assemble avec `li.append(titre, contenu, bouton)`. `bouton.dataset.id = note.id` crée l’attribut `data-id`.',
          explain: 'Vider puis reconstruire évite les doublons à chaque affichage. `dataset.id` stocke l’id dans le HTML ; il y devient du texte (« 7 »), d’où la conversion avec `Number` qu’il faudra faire à la suppression.'
        }
      },
      {
        title: 'Étape 4 : ajouter une note depuis le formulaire',
        explain: 'Le bouton « Ajouter la note » relie tout : il lit les champs, appelle `creerNote`, met à jour l’état `notes`, puis **réaffiche**. C’est le cycle de toute interface : **événement, nouvel état, affichage**.\n\nComme `creerNote` lance une erreur pour un titre vide, l’écouteur l’entoure d’un `try` / `catch` : le message de l’erreur va dans `#erreur`, qui a `role="alert"` pour que les lecteurs d’écran l’annoncent. Après un ajout réussi, on vide les champs et le message d’erreur précédent.',
        ex: {
          type: 'code',
          dom: true,
          html: NO_HTML,
          prompt: 'Ajoute l’écouteur de clic de `#ajouter` : création de la note, mise à jour de `notes`, champs vidés, affichage ; en cas d’erreur, message dans `#erreur`.',
          starter: js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER, NO_CHAMPS, NO_AJOUT_0, NO_DEMARRER),
          solution: NO_S4,
          tests: [
            { code: "document.querySelector('#titre').value = 'Idée de projet';\ndocument.querySelector('#contenu').value = 'Un tableau de bord';\ndocument.querySelector('#ajouter').click();\nassertEqual(document.querySelectorAll('#liste li').length, 1);\nassertEqual(document.querySelector('#liste h3').textContent, 'Idée de projet');\nassertEqual(document.querySelector('#compteur').textContent, '1 note');", label: 'Un clic sur « Ajouter la note » affiche la nouvelle note' },
            { code: "assertEqual(document.querySelector('#titre').value, '');\nassertEqual(document.querySelector('#contenu').value, '');", label: 'Les champs sont vidés après l’ajout' },
            { code: "document.querySelector('#titre').value = '   ';\ndocument.querySelector('#ajouter').click();\nassertEqual(document.querySelector('#erreur').textContent, 'Le titre est obligatoire.');\nassertEqual(document.querySelectorAll('#liste li').length, 1);", label: 'Un titre vide affiche l’erreur sans rien ajouter' },
            { code: "document.querySelector('#titre').value = 'Courses';\ndocument.querySelector('#ajouter').click();\nassertEqual(document.querySelector('#liste h3').textContent, 'Courses');\nassertEqual(document.querySelector('#compteur').textContent, '2 notes');\nassertEqual(document.querySelector('#erreur').textContent, '');", label: 'La nouvelle note passe en premier et l’erreur disparaît' }
          ],
          hint: '`document.querySelector(\'#ajouter\').addEventListener(\'click\', () => { try { ... } catch (erreur) { ... } });` La valeur d’un champ se lit avec `.value`.',
          explain: '`notes = ajouterNote(notes, note)` remplace l’état par le nouveau tableau ; c’est pour cela que `notes` est déclarée avec `let`. Le `catch` reçoit l’objet erreur créé par `throw new Error(...)`, dont `message` contient le texte.'
        }
      },
      {
        title: 'Étape 5 : supprimer et rechercher dans la page',
        explain: 'Les boutons « Supprimer » sont recréés à chaque affichage : leur ajouter un écouteur un par un serait fastidieux. On utilise la **délégation d’événements** : **un seul écouteur sur la liste**, qui reçoit les clics de tous ses descendants. `evenement.target.closest(\'button.supprimer\')` retrouve le bouton cliqué (ou `null` si on a cliqué ailleurs).\n\nPour la recherche, l’événement `input` se déclenche à chaque lettre tapée. `afficherFiltre` affiche les notes qui correspondent au texte du champ ; utilise-la aussi après un ajout ou une suppression, pour que le filtre reste actif.',
        ex: {
          type: 'code',
          dom: true,
          html: NO_HTML,
          prompt: 'Complète `afficherFiltre()`, ajoute l’écouteur de clic délégué sur `liste` (suppression) et l’écouteur `input` sur `#recherche`. Dans l’écouteur d’ajout, remplace `afficher(notes)` par `afficherFiltre()`.',
          starter: js(NO_MODELE, NO_LISTE, NO_ETAT, NO_AFFICHER, NO_CHAMPS, NO_AJOUT, NO_SUPPR_0, NO_DEMARRER),
          solution: NO_S5,
          tests: [
            { code: "for (const [titre, contenu] of [['Courses', 'Pain, lait'], ['Projet quiz', 'Ajouter un minuteur'], ['Lecture', 'Chapitre sur les promesses']]) {\n  document.querySelector('#titre').value = titre;\n  document.querySelector('#contenu').value = contenu;\n  document.querySelector('#ajouter').click();\n}\nconst recherche = document.querySelector('#recherche');\nrecherche.value = 'quiz';\nrecherche.dispatchEvent(new Event('input'));\nassertEqual([...document.querySelectorAll('#liste h3')].map((h) => h.textContent), ['Projet quiz']);", label: 'Taper « quiz » ne garde que la note correspondante' },
            { code: "const recherche = document.querySelector('#recherche');\nrecherche.value = '';\nrecherche.dispatchEvent(new Event('input'));\nassertEqual(document.querySelectorAll('#liste li').length, 3);", label: 'Vider la recherche réaffiche les 3 notes' },
            { code: "const li = [...document.querySelectorAll('#liste li')].find((x) => x.querySelector('h3').textContent === 'Courses');\nli.querySelector('button.supprimer').click();\nassertEqual(document.querySelectorAll('#liste li').length, 2);\nassertEqual(notes.length, 2);\nassertEqual(document.querySelector('#compteur').textContent, '2 notes');", label: 'Le bouton « Supprimer » retire la bonne note' },
            { code: "const recherche = document.querySelector('#recherche');\nrecherche.value = 'lecture';\nrecherche.dispatchEvent(new Event('input'));\ndocument.querySelector('#liste button.supprimer').click();\nassertEqual(document.querySelectorAll('#liste li').length, 0);\nassertEqual(notes.length, 1);", label: 'Supprimer pendant une recherche garde le filtre actif' }
          ],
          hint: 'Dans l’écouteur de la liste : `const bouton = evenement.target.closest(\'button.supprimer\'); if (!bouton) return;`. L’id se convertit avec `Number(bouton.dataset.id)`.',
          explain: 'Un seul écouteur sur `#liste` suffit pour tous les boutons, présents et futurs. `afficherFiltre` est la seule fonction qui décide de ce qui est visible : ajout, suppression et recherche passent tous par elle, donc l’écran reste cohérent.'
        }
      }
    ],
    solution: {
      code: '/* Page HTML attendue (dans index.html, avant <script src="notes.js"></script>) :\n' + NO_HTML.replace(/\n<style>[\s\S]*$/, '') + '\n*/\n\n' + NO_S5,
      explain: 'L’application suit un schéma qu’on retrouve dans tous les frameworks (React, Vue…) : un **état** (`notes`), des **fonctions pures** qui calculent un nouvel état (`creerNote`, `ajouterNote`, `supprimerNote`, `rechercher`), et une fonction d’**affichage** qui redessine à partir de l’état. Les événements ne font que déclencher ce cycle.\n\nLa sécurité est traitée à la source : `textContent` partout où du texte saisi est affiché. La délégation d’événements évite de gérer un écouteur par bouton. Sur ta machine, l’état est perdu au rechargement : la variante explique comment le conserver.'
    },
    variant: 'Sauvegarde les notes dans `localStorage` sur ta machine : `localStorage.setItem(\'notes\', JSON.stringify(notes))` après chaque changement, et `JSON.parse` au démarrage (avec un `try` en cas de données abîmées). Ajoute la modification d’une note (un bouton « Modifier » qui remplit le formulaire). Ajoute des étiquettes (`#idée`, `#cours`) et un filtre par étiquette.'
  };

  // =====================================================================================
  // Projet 9 : Tableau de bord de données (JavaScript)
  // =====================================================================================
  const DB_HTML = `<section id="tableau-de-bord">
  <h2>Ventes de septembre</h2>
  <label for="region">Région</label>
  <select id="region">
    <option value="">Toutes</option>
    <option value="Ouest">Ouest</option>
    <option value="Est">Est</option>
    <option value="Sud">Sud</option>
  </select>
  <div id="cartes"></div>
  <h3>Chiffre d’affaires par catégorie</h3>
  <ul id="graphique" aria-label="Chiffre d’affaires par catégorie"></ul>
</section>
<style>
  #cartes { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 12px 0; }
  .carte { border: 1px solid #dde1ee; border-radius: 8px; padding: 10px 12px; }
  .carte h3 { margin: 0; font-size: 0.85rem; font-weight: normal; color: #5c6178; }
  .carte .valeur { margin: 4px 0 0; font-size: 1.4rem; font-weight: bold; }
  #graphique { list-style: none; padding: 0; }
  #graphique li { display: grid; grid-template-columns: 120px 1fr 90px; gap: 8px; align-items: center; margin: 6px 0; }
  .piste { height: 16px; background: #edf0f7; border-radius: 4px; }
  .barre { display: block; height: 100%; background: #3b5bdb; border-radius: 4px; }
  .montant { text-align: right; }
</style>`;
  const DB_DONNEES = `// Prix en centimes : les calculs en nombres entiers évitent les erreurs d’arrondi (0.1 + 0.2 !== 0.3).
const VENTES = [
  { date: '2026-09-01', produit: 'Clavier mécanique', categorie: 'Périphériques', region: 'Ouest', quantite: 2, prixCents: 8990 },
  { date: '2026-09-01', produit: 'Écran 27 pouces', categorie: 'Écrans', region: 'Est', quantite: 1, prixCents: 24900 },
  { date: '2026-09-02', produit: 'Souris sans fil', categorie: 'Périphériques', region: 'Est', quantite: 3, prixCents: 2990 },
  { date: '2026-09-02', produit: 'Câble USB-C', categorie: 'Accessoires', region: 'Ouest', quantite: 5, prixCents: 990 },
  { date: '2026-09-03', produit: 'Casque audio', categorie: 'Audio', region: 'Sud', quantite: 2, prixCents: 7990 },
  { date: '2026-09-03', produit: 'Écran 24 pouces', categorie: 'Écrans', region: 'Ouest', quantite: 2, prixCents: 15900 },
  { date: '2026-09-04', produit: 'Webcam HD', categorie: 'Périphériques', region: 'Sud', quantite: 1, prixCents: 5490 },
  { date: '2026-09-04', produit: 'Support d’écran', categorie: 'Accessoires', region: 'Est', quantite: 2, prixCents: 3490 },
];

function montant(vente) {
  return vente.quantite * vente.prixCents;
}`;
  const DB_TOTAUX = `function chiffreAffaires(ventes) {
  return ventes.reduce((total, vente) => total + montant(vente), 0);
}

function nombreArticles(ventes) {
  return ventes.reduce((total, vente) => total + vente.quantite, 0);
}`;
  const DB_TOTAUX_0 = `function chiffreAffaires(ventes) {
  // À toi : somme des montants de toutes les ventes (en centimes), avec reduce
}

function nombreArticles(ventes) {
  // À toi : somme des quantités, avec reduce
}`;
  const DB_GROUPES = `function totalPar(ventes, cle) {
  const totaux = {};
  for (const vente of ventes) {
    const groupe = vente[cle];
    totaux[groupe] = (totaux[groupe] || 0) + montant(vente);
  }
  return totaux;
}

function classement(totaux) {
  return Object.entries(totaux).sort((a, b) => b[1] - a[1]);
}`;
  const DB_GROUPES_0 = `function totalPar(ventes, cle) {
  // À toi : objet { valeurDeLaCle: totalDesMontants }, par exemple pour cle = 'region' :
  // { Ouest: 54730, Est: 40850, Sud: 21470 }
}

function classement(totaux) {
  // À toi : tableau de paires [nom, total], du plus grand total au plus petit
}`;
  const DB_STATS = `function formatEuros(cents) {
  const euros = Math.floor(cents / 100);
  const centimes = String(cents % 100).padStart(2, '0');
  return \`\${euros},\${centimes} €\`;
}

function statistiques(ventes) {
  const ca = chiffreAffaires(ventes);
  return {
    chiffreAffaires: ca,
    articles: nombreArticles(ventes),
    commandes: ventes.length,
    panierMoyen: ventes.length === 0 ? 0 : Math.round(ca / ventes.length),
  };
}`;
  const DB_STATS_0 = `function formatEuros(cents) {
  // À toi : 117050 devient '1170,50 €' et 5 devient '0,05 €'
}

function statistiques(ventes) {
  // À toi : { chiffreAffaires, articles, commandes (nombre de ventes), panierMoyen }
  // panierMoyen = chiffre d’affaires / commandes, arrondi au centime (0 s’il n’y a aucune vente)
}`;
  const DB_CARTES = `const zoneCartes = document.querySelector('#cartes');

function afficherCartes(stats) {
  const cartes = [
    ['Chiffre d’affaires', formatEuros(stats.chiffreAffaires)],
    ['Articles vendus', String(stats.articles)],
    ['Commandes', String(stats.commandes)],
    ['Panier moyen', formatEuros(stats.panierMoyen)],
  ];
  zoneCartes.innerHTML = '';
  for (const [titre, valeur] of cartes) {
    const carte = document.createElement('article');
    carte.className = 'carte';
    const h3 = document.createElement('h3');
    h3.textContent = titre;
    const p = document.createElement('p');
    p.className = 'valeur';
    p.textContent = valeur;
    carte.append(h3, p);
    zoneCartes.append(carte);
  }
}`;
  const DB_CARTES_0 = `const zoneCartes = document.querySelector('#cartes');

function afficherCartes(stats) {
  // À toi : vide zoneCartes, puis crée 4 cartes <article class="carte"><h3>titre</h3><p class="valeur">valeur</p></article> :
  // 'Chiffre d’affaires' (en euros), 'Articles vendus', 'Commandes', 'Panier moyen' (en euros)
}`;
  const DB_BARRES = `const zoneGraphique = document.querySelector('#graphique');

function afficherBarres(totaux) {
  const lignes = classement(totaux);
  const max = lignes.length > 0 ? lignes[0][1] : 0;
  zoneGraphique.innerHTML = '';
  for (const [nom, valeur] of lignes) {
    const li = document.createElement('li');
    const etiquette = document.createElement('span');
    etiquette.className = 'etiquette';
    etiquette.textContent = nom;
    const piste = document.createElement('span');
    piste.className = 'piste';
    const barre = document.createElement('span');
    barre.className = 'barre';
    barre.style.width = \`\${Math.round((valeur / max) * 100)}%\`;
    piste.append(barre);
    const somme = document.createElement('span');
    somme.className = 'montant';
    somme.textContent = formatEuros(valeur);
    li.append(etiquette, piste, somme);
    zoneGraphique.append(li);
  }
}`;
  const DB_BARRES_0 = `const zoneGraphique = document.querySelector('#graphique');

function afficherBarres(totaux) {
  // À toi : vide zoneGraphique, puis, dans l’ordre de classement(totaux), ajoute pour chaque catégorie :
  // <li><span class="etiquette">nom</span><span class="piste"><span class="barre"></span></span><span class="montant">…</span></li>
  // La barre la plus longue fait 100 % ; les autres sont proportionnelles (pourcentage arrondi).
}`;
  const DB_DEMARRER1 = 'afficherCartes(statistiques(VENTES));';
  const DB_DEMARRER2 = "afficherCartes(statistiques(VENTES));\nafficherBarres(totalPar(VENTES, 'categorie'));";
  const DB_FILTRE = `const selectRegion = document.querySelector('#region');

function rafraichir() {
  const region = selectRegion.value;
  const ventes = region === '' ? VENTES : VENTES.filter((vente) => vente.region === region);
  afficherCartes(statistiques(ventes));
  afficherBarres(totalPar(ventes, 'categorie'));
}

selectRegion.addEventListener('change', rafraichir);
rafraichir();`;
  const DB_FILTRE_0 = `const selectRegion = document.querySelector('#region');

function rafraichir() {
  // À toi : garde les ventes de la région choisie (toutes si la valeur est ''),
  // puis réaffiche les cartes et le graphique avec ces ventes.
}

// À toi : appelle rafraichir à chaque changement du menu (événement change).

${DB_DEMARRER2}`;

  const DB_S1 = js(DB_DONNEES, DB_TOTAUX);
  const DB_S2 = js(DB_DONNEES, DB_TOTAUX, DB_GROUPES);
  const DB_S3 = js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS);
  const DB_S4 = js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES, DB_DEMARRER1);
  const DB_S5 = js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES, DB_BARRES, DB_DEMARRER2);
  const DB_S6 = js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES, DB_BARRES, DB_FILTRE);
  const DB_VALEURS = "[...document.querySelectorAll('#cartes .valeur')].map((p) => p.textContent)";
  const DB_ETIQUETTES = "[...document.querySelectorAll('#graphique .etiquette')].map((s) => s.textContent)";

  const projetTableauDeBord = {
    id: 'pj.tableau-de-bord',
    title: 'Tableau de bord de données',
    difficulty: 3,
    lang: 'javascript',
    summary: 'Un tableau de bord de ventes : agrégations sur des données, cartes de chiffres clés, graphique en barres et filtre.',
    result: 'Une page qui résume les ventes d’une boutique de matériel informatique : quatre cartes (« Chiffre d’affaires : 1170,50 € », « Articles vendus : 18 », « Commandes : 8 », « Panier moyen : 146,31 € »), un graphique en barres du chiffre d’affaires par catégorie dessiné en HTML et CSS, et un menu « Région » qui recalcule tout instantanément.',
    skills: ['js.u5', 'js.u6', 'js.u7', 'js.u8', 'js.u9', 'web.u10'],
    steps: [
      {
        title: 'Étape 1 : les totaux avec reduce',
        explain: 'Un tableau de bord commence par des **agrégations** : réduire une liste de ventes à un seul nombre. C’est le rôle de `reduce` : il parcourt le tableau en gardant un **accumulateur**, ici un total qui part de 0.\n\nRemarque le choix des données : les prix sont en **centimes**, en nombres entiers. En JavaScript, `0.1 + 0.2` ne vaut pas exactement `0.3` ; sur des milliers de ventes, ces petites erreurs s’accumulent. Les vraies applications de paiement comptent toutes en centimes et ne convertissent en euros qu’à l’affichage. La fonction `montant` est fournie.',
        ex: {
          type: 'code',
          prompt: 'Complète `chiffreAffaires(ventes)` (somme des montants) et `nombreArticles(ventes)` (somme des quantités) avec `reduce`.',
          starter: js(DB_DONNEES, DB_TOTAUX_0),
          solution: DB_S1,
          tests: [
            { code: 'assertEqual(chiffreAffaires(VENTES), 117050);', label: 'Chiffre d’affaires total : 117050 centimes' },
            { code: 'assertEqual(nombreArticles(VENTES), 18);', label: '18 articles vendus' },
            { code: 'assertEqual(chiffreAffaires([VENTES[0]]), 17980);', label: 'Une seule vente : 2 claviers à 89,90 €' },
            { code: 'assertEqual(chiffreAffaires([]), 0);\nassertEqual(nombreArticles([]), 0);', label: 'Une liste vide donne 0 (valeur de départ de reduce)' }
          ],
          hint: '`ventes.reduce((total, vente) => total + ..., 0)` : le `0` final est la valeur de départ du total.',
          explain: 'Sans la valeur de départ `0`, `reduce` sur un tableau vide lèverait une erreur, et le premier élément serait pris comme total initial (un objet, pas un nombre). Toujours donner la valeur initiale.'
        }
      },
      {
        title: 'Étape 2 : regrouper par catégorie',
        explain: 'Question suivante : **où** se fait le chiffre d’affaires ? Il faut **regrouper** les ventes par catégorie (ou par région) et sommer chaque groupe. C’est le « group by » des bases de données et de pandas.\n\nOn construit un objet dont les clés sont les groupes : `totaux[groupe] = (totaux[groupe] || 0) + montant`. La partie `|| 0` traite le premier passage, quand le groupe n’existe pas encore. La fonction est **générique** : la clé de regroupement est un paramètre. Ensuite `classement` transforme l’objet en tableau trié avec `Object.entries` et `sort`.',
        ex: {
          type: 'code',
          prompt: 'Écris `totalPar(ventes, cle)` (total des montants par valeur de la clé) et `classement(totaux)` (paires `[nom, total]` triées du plus grand au plus petit).',
          starter: js(DB_DONNEES, DB_TOTAUX, DB_GROUPES_0),
          solution: DB_S2,
          tests: [
            { code: "assertEqual(totalPar(VENTES, 'categorie'), { 'Périphériques': 32440, 'Écrans': 56700, Accessoires: 11930, Audio: 15980 });", label: 'Totaux par catégorie' },
            { code: "assertEqual(totalPar(VENTES, 'region'), { Ouest: 54730, Est: 40850, Sud: 21470 });", label: 'La même fonction regroupe par région' },
            { code: "assertEqual(classement(totalPar(VENTES, 'categorie')), [['Écrans', 56700], ['Périphériques', 32440], ['Audio', 15980], ['Accessoires', 11930]]);", label: 'Le classement va du plus grand total au plus petit' },
            { code: 'assertEqual(classement({}), []);', label: 'Aucun total : classement vide' }
          ],
          hint: '`vente[cle]` lit la propriété dont le nom est dans `cle`. Pour trier des paires par leur deuxième élément en ordre décroissant : `.sort((a, b) => b[1] - a[1])`.',
          explain: 'Les crochets `vente[cle]` permettent d’utiliser une propriété choisie au moment de l’appel. `sort` avec une fonction de comparaison qui renvoie `b[1] - a[1]` place les plus grandes valeurs en premier.'
        }
      },
      {
        title: 'Étape 3 : les chiffres clés et le format en euros',
        explain: 'On rassemble les **indicateurs** dans un objet : chiffre d’affaires, articles, nombre de commandes et **panier moyen** (chiffre d’affaires divisé par le nombre de commandes). Ce calcul a un piège : avec zéro vente, la division donnerait `NaN`. On renvoie alors 0.\n\nPour l’affichage, `formatEuros` convertit des centimes en texte : `117050` devient `1170,50 €`. La partie entière s’obtient avec `Math.floor(cents / 100)`, les centimes avec le reste `% 100`, complétés à deux chiffres avec `padStart(2, \'0\')` : sans lui, 5 centimes s’afficheraient « 0,5 € ».',
        ex: {
          type: 'code',
          prompt: 'Écris `formatEuros(cents)` (format `1170,50 €`) et `statistiques(ventes)`, qui renvoie `{ chiffreAffaires, articles, commandes, panierMoyen }` (panier moyen arrondi au centime, 0 sans vente).',
          starter: js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS_0),
          solution: DB_S3,
          tests: [
            { code: "assertEqual(formatEuros(117050), '1170,50 €');\nassertEqual(formatEuros(990), '9,90 €');", label: 'formatEuros(117050) donne « 1170,50 € »' },
            { code: "assertEqual(formatEuros(5), '0,05 €');", label: 'Les centimes sont complétés à deux chiffres' },
            { code: 'assertEqual(statistiques(VENTES), { chiffreAffaires: 117050, articles: 18, commandes: 8, panierMoyen: 14631 });', label: 'Statistiques des 8 ventes (panier moyen arrondi)' },
            { code: 'assertEqual(statistiques([]), { chiffreAffaires: 0, articles: 0, commandes: 0, panierMoyen: 0 });', label: 'Sans vente : tout vaut 0, sans NaN' }
          ],
          hint: 'Pour le panier moyen : `Math.round(ca / ventes.length)`, mais seulement si `ventes.length` n’est pas 0 (opérateur `? :`).',
          explain: '`statistiques` réutilise les fonctions de l’étape 1 au lieu de refaire les calculs. Arrondir le panier moyen garde des centimes entiers, ce que `formatEuros` attend.'
        }
      },
      {
        title: 'Étape 4 : les cartes de chiffres clés',
        explain: 'Place à l’**affichage**. Chaque indicateur devient une **carte** : un petit titre et une grande valeur. La mise en page est déjà prévue dans le CSS fourni : `#cartes` est une grille qui place autant de cartes que la largeur le permet.\n\nPlutôt que d’écrire quatre fois le même code, on décrit les cartes dans un **tableau de paires** `[titre, valeur]` et on les crée dans une boucle. Ajouter un indicateur plus tard ne demandera qu’une ligne. Comme toujours, on vide la zone avant de la remplir, pour pouvoir réafficher sans doublon.',
        ex: {
          type: 'code',
          dom: true,
          html: DB_HTML,
          prompt: 'Complète `afficherCartes(stats)` : vide `#cartes` et crée 4 `article.carte` avec un `h3` (titre) et un `p.valeur`, dans l’ordre Chiffre d’affaires, Articles vendus, Commandes, Panier moyen.',
          starter: js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES_0, DB_DEMARRER1),
          solution: DB_S4,
          tests: [
            { code: "assertEqual(document.querySelectorAll('#cartes .carte').length, 4);", label: '4 cartes sont affichées' },
            { code: "assertEqual([...document.querySelectorAll('#cartes .carte h3')].map((h) => h.textContent), ['Chiffre d’affaires', 'Articles vendus', 'Commandes', 'Panier moyen']);", label: 'Les titres des cartes, dans l’ordre' },
            { code: 'assertEqual(' + DB_VALEURS + ", ['1170,50 €', '18', '8', '146,31 €']);", label: 'Les valeurs sont formatées (euros pour les montants)' },
            { code: 'afficherCartes(statistiques([]));\nassertEqual(' + DB_VALEURS + ", ['0,00 €', '0', '0', '0,00 €']);", label: 'Réafficher remplace les cartes au lieu d’en ajouter' }
          ],
          hint: '`for (const [titre, valeur] of cartes) { ... }` décompose chaque paire. Crée l’`article`, le `h3` et le `p`, puis `carte.append(h3, p)`.',
          explain: 'Les données d’affichage (titres et valeurs formatées) sont séparées de la construction du DOM. La boucle produit un HTML régulier, que le CSS met en forme sans rien connaître des chiffres.'
        }
      },
      {
        title: 'Étape 5 : un graphique en barres en HTML et CSS',
        explain: 'Pas besoin de bibliothèque pour un graphique en barres simple : chaque barre est un élément dont la **largeur** est un pourcentage. La plus grande catégorie fait 100 %, les autres sont **proportionnelles** : `valeur / max * 100`.\n\nChaque ligne contient l’étiquette, une « piste » grise avec la barre colorée dedans, et le montant en texte. Ce texte compte pour l’**accessibilité** : un lecteur d’écran ne « voit » pas une barre, mais il lit « Écrans, 567,00 € ». Un graphique doit toujours garder ses valeurs lisibles. Attention au cas vide : sans catégorie, il n’y a pas de maximum.',
        ex: {
          type: 'code',
          dom: true,
          html: DB_HTML,
          prompt: 'Complète `afficherBarres(totaux)` : un `li` par catégorie dans l’ordre du classement, avec `.etiquette`, `.piste` contenant `.barre` (largeur en %, arrondie) et `.montant`.',
          starter: js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES, DB_BARRES_0, DB_DEMARRER2),
          solution: DB_S5,
          tests: [
            { code: 'assertEqual(' + DB_ETIQUETTES + ", ['Écrans', 'Périphériques', 'Audio', 'Accessoires']);", label: 'Les catégories sont classées du plus grand au plus petit' },
            { code: "assertEqual([...document.querySelectorAll('#graphique .barre')].map((b) => b.style.width), ['100%', '57%', '28%', '21%']);", label: 'Largeurs proportionnelles : 100 %, 57 %, 28 %, 21 %' },
            { code: "assertEqual(document.querySelector('#graphique .montant').textContent, '567,00 €');", label: 'Chaque barre affiche son montant en texte' },
            { code: "afficherBarres({});\nassertEqual(document.querySelectorAll('#graphique li').length, 0);", label: 'Sans données, le graphique est vide (sans erreur)' }
          ],
          hint: 'Le maximum est le total de la première paire du classement. La largeur s’écrit `barre.style.width = ...` avec un texte comme `\'57%\'`.',
          explain: 'Comme le classement est trié, le maximum est simplement son premier élément. Avec un objet vide, la boucle ne tourne pas : la division par un maximum nul n’a jamais lieu.'
        }
      },
      {
        title: 'Étape 6 : filtrer par région',
        explain: 'Un tableau de bord devient vraiment utile quand on peut **explorer** : choisir une région et voir tous les chiffres se mettre à jour. Le menu déroulant déclenche l’événement `change` à chaque sélection.\n\nLa fonction `rafraichir` suit le même cycle que toute interface : lire le choix, **filtrer les données**, puis **réutiliser les fonctions existantes** (`statistiques`, `totalPar`, `afficherCartes`, `afficherBarres`). Aucun calcul n’est réécrit : c’est le bénéfice d’avoir séparé calculs et affichage dès le début. On appelle aussi `rafraichir` une fois au démarrage.',
        ex: {
          type: 'code',
          dom: true,
          html: DB_HTML,
          prompt: 'Complète `rafraichir()` (filtre sur la région choisie, `\'\'` pour toutes, puis réaffichage), branche-la sur l’événement `change` du menu, et remplace les deux appels de démarrage par `rafraichir()`.',
          starter: js(DB_DONNEES, DB_TOTAUX, DB_GROUPES, DB_STATS, DB_CARTES, DB_BARRES, DB_FILTRE_0),
          solution: DB_S6,
          tests: [
            { code: 'assertEqual(' + DB_VALEURS + "[0], '1170,50 €');", label: 'Au démarrage, toutes les régions sont affichées' },
            { code: "const menu = document.querySelector('#region');\nmenu.value = 'Ouest';\nmenu.dispatchEvent(new Event('change'));\nassertEqual(" + DB_VALEURS + ", ['547,30 €', '9', '3', '182,43 €']);", label: 'Région Ouest : les cartes sont recalculées' },
            { code: 'assertEqual(' + DB_ETIQUETTES + ", ['Écrans', 'Périphériques', 'Accessoires']);", label: 'Région Ouest : le graphique n’a plus que 3 catégories' },
            { code: "const menu = document.querySelector('#region');\nmenu.value = '';\nmenu.dispatchEvent(new Event('change'));\nassertEqual(document.querySelectorAll('#graphique li').length, 4);", label: 'Revenir à « Toutes » réaffiche les 4 catégories' }
          ],
          hint: '`const ventes = region === \'\' ? VENTES : VENTES.filter(...)`, puis appelle les deux fonctions d’affichage avec `ventes`.',
          explain: 'Le filtre ne modifie jamais `VENTES` : il crée une sélection à chaque changement, donc revenir à « Toutes » retrouve les données complètes. Tout le tableau de bord se recalcule à partir d’une seule source de données.'
        }
      }
    ],
    solution: {
      code: '/* Page HTML attendue (dans index.html, avant <script src="tableau.js"></script>) :\n' + DB_HTML.replace(/\n<style>[\s\S]*$/, '') + '\n*/\n\n' + DB_S6,
      explain: 'Le tableau de bord est construit en couches : données brutes, agrégations pures (`chiffreAffaires`, `totalPar`, `statistiques`), mise en forme (`formatEuros`, `classement`), affichage (`afficherCartes`, `afficherBarres`) et interaction (`rafraichir`). Chaque couche n’utilise que celle du dessous.\n\nLe graphique HTML/CSS reste lisible et accessible sans bibliothèque. Pour des graphiques plus riches (courbes, axes, info-bulles), une bibliothèque comme Chart.js prend le relais, mais les agrégations restent les mêmes. Avec de vraies données, elles viendraient d’une API avec `fetch`, et le reste du code ne changerait pas.'
    },
    variant: 'Ajoute un deuxième menu pour regrouper par catégorie ou par produit (le paramètre `cle` de `totalPar` sert enfin). Ajoute une carte « Meilleure vente » (le produit au plus gros montant). Affiche l’évolution par jour avec des barres verticales (`display: flex` et `align-items: flex-end`). Formate les grands montants avec un séparateur de milliers.'
  };

  // =====================================================================================
  // Projet 10 : API simple (JavaScript, logique testée ici puis Express sur ta machine)
  // =====================================================================================
  const AP_VALIDER = `function validerTache(donnees) {
  if (typeof donnees !== 'object' || donnees === null || Array.isArray(donnees)) {
    return ['Le corps de la requête doit être un objet JSON.'];
  }
  const erreurs = [];
  if (typeof donnees.titre !== 'string' || donnees.titre.trim() === '') {
    erreurs.push('titre : texte non vide obligatoire.');
  } else if (donnees.titre.length > 100) {
    erreurs.push('titre : 100 caractères maximum.');
  }
  if ('fait' in donnees && typeof donnees.fait !== 'boolean') {
    erreurs.push('fait : doit valoir true ou false.');
  }
  return erreurs;
}`;
  const AP_VALIDER_0 = `function validerTache(donnees) {
  // À toi : renvoie la liste des erreurs (tableau vide si tout va bien).
  // - donnees n’est pas un objet (null, tableau, texte…) : ['Le corps de la requête doit être un objet JSON.']
  // - titre absent, pas un texte, ou vide : 'titre : texte non vide obligatoire.'
  // - titre de plus de 100 caractères : 'titre : 100 caractères maximum.'
  // - fait présent mais pas un booléen : 'fait : doit valoir true ou false.'
}`;
  const AP_VALIDER2 = AP_VALIDER
    .replace('function validerTache(donnees) {', 'function validerTache(donnees, partielle = false) {')
    .replace(`  if (typeof donnees.titre !== 'string' || donnees.titre.trim() === '') {
    erreurs.push('titre : texte non vide obligatoire.');
  } else if (donnees.titre.length > 100) {
    erreurs.push('titre : 100 caractères maximum.');
  }`, `  if (!partielle || 'titre' in donnees) {
    if (typeof donnees.titre !== 'string' || donnees.titre.trim() === '') {
      erreurs.push('titre : texte non vide obligatoire.');
    } else if (donnees.titre.length > 100) {
      erreurs.push('titre : 100 caractères maximum.');
    }
  }`);
  const AP_REPONSE = `function reponse(status, body) {
  return { status, body };
}`;
  const apCreer = (corps) => `function creerApi() {
  const taches = [];
  let prochainId = 1;

  function handle({ method, path, body }) {
${corps}
    return reponse(404, { erreur: 'Route introuvable.' });
  }

  return { handle };
}`;
  const AP_LISTE_CREER = `    if (path === '/taches') {
      if (method === 'GET') {
        return reponse(200, taches.map((t) => ({ ...t })));
      }
      if (method === 'POST') {
        const erreurs = validerTache(body);
        if (erreurs.length > 0) return reponse(400, { erreurs });
        const tache = { id: prochainId, titre: body.titre.trim(), fait: body.fait === true };
        prochainId += 1;
        taches.push(tache);
        return reponse(201, { ...tache });
      }
    }`;
  const AP_LISTE_CREER_0 = `    // À toi :
    // GET  /taches -> 200 et la liste des tâches (des copies, pas les objets internes)
    // POST /taches -> 400 { erreurs } si validerTache(body) trouve des erreurs,
    //                 sinon 201 et la tâche créée { id, titre (sans espaces autour), fait (false par défaut) }`;
  const AP_PAR_ID = `    const correspondance = path.match(/^\\/taches\\/(\\d+)$/);
    if (correspondance) {
      const id = Number(correspondance[1]);
      const tache = taches.find((t) => t.id === id);
      if (!tache) return reponse(404, { erreur: \`Tâche \${id} introuvable.\` });
      if (method === 'GET') return reponse(200, { ...tache });
      if (method === 'PATCH') {
        const erreurs = validerTache(body, true);
        if (erreurs.length > 0) return reponse(400, { erreurs });
        if ('titre' in body) tache.titre = body.titre.trim();
        if ('fait' in body) tache.fait = body.fait;
        return reponse(200, { ...tache });
      }
      if (method === 'DELETE') {
        taches.splice(taches.indexOf(tache), 1);
        return reponse(204, null);
      }
    }`;
  const AP_PAR_ID_0 = `    // À toi : routes /taches/:id (l’id est un nombre dans le chemin, par exemple /taches/2)
    // - id inconnu -> 404 { erreur: 'Tâche 2 introuvable.' }
    // - GET    -> 200 et la tâche
    // - PATCH  -> validation partielle (validerTache(body, true)) : 400 { erreurs } ou 200 et la tâche modifiée
    // - DELETE -> 204 et body null`;
  const AP_LIRE_REQUETE = `function lireRequete(path) {
  // Fournie : '/taches?fait=true' donne { chemin: '/taches', filtres: { fait: 'true' } }.
  const [chemin, requete = ''] = path.split('?');
  const filtres = {};
  for (const paire of requete.split('&')) {
    if (paire === '') continue;
    const [cle, valeur = ''] = paire.split('=');
    filtres[decodeURIComponent(cle)] = decodeURIComponent(valeur);
  }
  return { chemin, filtres };
}`;
  const AP_CORPS_FINAL = `    const verbe = method.toUpperCase();
    const { chemin, filtres } = lireRequete(path);
    if (chemin === '/taches') {
      if (verbe === 'GET') {
        let liste = taches;
        if (filtres.fait === 'true' || filtres.fait === 'false') {
          liste = taches.filter((t) => String(t.fait) === filtres.fait);
        }
        return reponse(200, liste.map((t) => ({ ...t })));
      }
      if (verbe === 'POST') {
        const erreurs = validerTache(body);
        if (erreurs.length > 0) return reponse(400, { erreurs });
        const tache = { id: prochainId, titre: body.titre.trim(), fait: body.fait === true };
        prochainId += 1;
        taches.push(tache);
        return reponse(201, { ...tache });
      }
      return reponse(405, { erreur: 'Méthode non autorisée.' });
    }
    const correspondance = chemin.match(/^\\/taches\\/(\\d+)$/);
    if (correspondance) {
      const id = Number(correspondance[1]);
      const tache = taches.find((t) => t.id === id);
      if (!tache) return reponse(404, { erreur: \`Tâche \${id} introuvable.\` });
      if (verbe === 'GET') return reponse(200, { ...tache });
      if (verbe === 'PATCH') {
        const erreurs = validerTache(body, true);
        if (erreurs.length > 0) return reponse(400, { erreurs });
        if ('titre' in body) tache.titre = body.titre.trim();
        if ('fait' in body) tache.fait = body.fait;
        return reponse(200, { ...tache });
      }
      if (verbe === 'DELETE') {
        taches.splice(taches.indexOf(tache), 1);
        return reponse(204, null);
      }
      return reponse(405, { erreur: 'Méthode non autorisée.' });
    }`;
  const AP_CORPS_FINAL_0 = `    // À toi : améliore le routeur.
    // 1. Accepte les méthodes en minuscules : const verbe = method.toUpperCase();
    // 2. Sépare le chemin et les filtres : const { chemin, filtres } = lireRequete(path);
    //    puis utilise chemin et verbe à la place de path et method ci-dessous.
    // 3. GET /taches?fait=true (ou false) ne renvoie que les tâches correspondantes.
    // 4. Méthode non prévue sur /taches ou /taches/:id -> 405 { erreur: 'Méthode non autorisée.' }
` + AP_LISTE_CREER + '\n' + AP_PAR_ID;
  const AP_SETUP = "const api = creerApi();\napi.handle({ method: 'POST', path: '/taches', body: { titre: 'Lire la doc' } });\napi.handle({ method: 'POST', path: '/taches', body: { titre: 'Écrire les tests' } });\n";

  const AP_S1 = js(AP_VALIDER);
  const AP_S2 = js(AP_VALIDER, AP_REPONSE, apCreer(AP_LISTE_CREER));
  const AP_S3 = js(AP_VALIDER2, AP_REPONSE, apCreer(AP_LISTE_CREER + '\n' + AP_PAR_ID));
  const AP_S4 = js(AP_VALIDER2, AP_REPONSE, AP_LIRE_REQUETE, apCreer(AP_CORPS_FINAL));
  const AP_SERVEUR = `// ===== serveur.js (sur ta machine) =====
// Installation : npm init -y, puis npm install express
const express = require('express');
const { creerApi } = require('./api');

const app = express();
const api = creerApi();

app.use(express.json());

// Toutes les requêtes passent par le routeur testé dans CodeQuest.
app.use((req, res) => {
  const { status, body } = api.handle({ method: req.method, path: req.originalUrl, body: req.body });
  if (body === null) {
    res.status(status).end();
  } else {
    res.status(status).json(body);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`API sur http://localhost:\${port}\`);
});`;

  const projetApi = {
    id: 'pj.api',
    title: 'API simple',
    difficulty: 3,
    lang: 'javascript',
    summary: 'Une API REST de tâches : routeur, validation et codes HTTP testés ici, puis servis pour de vrai avec Node et Express.',
    result: 'Un serveur qui répond sur http://localhost:3000 : `GET /taches` renvoie la liste en JSON, `POST /taches` avec `{"titre": "Lire la doc"}` crée une tâche (201), `PATCH /taches/1` avec `{"fait": true}` la modifie, `DELETE /taches/1` la supprime (204), `GET /taches?fait=true` filtre. Les erreurs ont le bon code : 400 avec la liste des problèmes, 404 pour une tâche inconnue, 405 pour une méthode non prévue.',
    skills: ['js.u5', 'js.u6', 'js.u7', 'js.u14', 'api.u2', 'api.u3', 'api.u4', 'api.u5', 'api.u6', 'api.u7', 'api.u11'],
    steps: [
      {
        title: 'Étape 1 : valider les données reçues',
        explain: 'Une API reçoit des données de **n’importe qui** : une application, un script, une personne malveillante. Première règle du back-end : **ne jamais faire confiance au corps de la requête**. Avant d’enregistrer une tâche, on vérifie sa forme.\n\nLa fonction renvoie la **liste de toutes les erreurs**, pas seulement la première : le client corrige tout en une fois. Elle est **pure** (aucun serveur, aucune variable globale), donc testable ici. Note les vérifications de type : `typeof null` vaut `\'object\'` en JavaScript, d’où le test explicite `donnees === null`.',
        ex: {
          type: 'code',
          prompt: 'Complète `validerTache(donnees)` : elle renvoie un tableau de messages d’erreur (vide si tout est correct). Les messages exacts sont dans les commentaires.',
          starter: js(AP_VALIDER_0),
          solution: AP_S1,
          tests: [
            { code: "assertEqual(validerTache({ titre: 'Lire la doc' }), []);\nassertEqual(validerTache({ titre: 'Lire', fait: true }), []);", label: 'Une tâche correcte n’a aucune erreur' },
            { code: "assertEqual(validerTache({}), ['titre : texte non vide obligatoire.']);\nassertEqual(validerTache({ titre: '   ' }), ['titre : texte non vide obligatoire.']);", label: 'Un titre absent ou vide est refusé' },
            { code: "assertEqual(validerTache({ titre: 'x'.repeat(101) }), ['titre : 100 caractères maximum.']);", label: 'Un titre de 101 caractères est refusé' },
            { code: "assertEqual(validerTache({ titre: 7, fait: 'oui' }), ['titre : texte non vide obligatoire.', 'fait : doit valoir true ou false.']);", label: 'Toutes les erreurs sont listées' },
            { code: "const attendu = ['Le corps de la requête doit être un objet JSON.'];\nassertEqual(validerTache(null), attendu);\nassertEqual(validerTache([1, 2]), attendu);\nassertEqual(validerTache('Lire'), attendu);", label: 'null, un tableau ou un texte sont refusés' }
          ],
          hint: 'Commence par le cas « pas un objet » avec un `return` immédiat. Ensuite, un tableau `erreurs` que chaque vérification complète avec `push`.',
          explain: 'Le premier test renvoie tout de suite, car sans objet les autres vérifications n’ont pas de sens. Ensuite, chaque règle est indépendante et ajoute son message : c’est ce qui permet de tout signaler en une réponse.'
        }
      },
      {
        title: 'Étape 2 : le routeur, lister et créer',
        explain: 'Une API REST associe un **verbe HTTP** et un **chemin** à une action : `GET /taches` liste, `POST /taches` crée. On écrit cette logique dans une fonction `handle({ method, path, body })` qui renvoie `{ status, body }`, exactement ce qu’un serveur enverra.\n\nLes données vivent dans une **fermeture** : `creerApi` crée un tableau `taches` privé, accessible seulement par `handle`. Chaque appel à `creerApi` donne une API neuve, idéale pour des tests indépendants. Les **codes HTTP** ont un sens précis : 200 OK, 201 créé, 400 requête invalide, 404 introuvable. On renvoie des **copies** des tâches pour que le client ne puisse pas modifier les données internes.',
        ex: {
          type: 'code',
          prompt: 'Complète `handle` dans `creerApi` : `GET /taches` (200 et la liste), `POST /taches` (400 avec `{ erreurs }`, ou 201 et la tâche créée). Le reste renvoie déjà 404.',
          starter: js(AP_VALIDER, AP_REPONSE, apCreer(AP_LISTE_CREER_0)),
          solution: AP_S2,
          tests: [
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'GET', path: '/taches' }), { status: 200, body: [] });", label: 'GET /taches sur une API neuve : 200 et liste vide' },
            { code: "const api = creerApi();\nconst r = api.handle({ method: 'POST', path: '/taches', body: { titre: '  Lire la doc  ' } });\nassertEqual(r, { status: 201, body: { id: 1, titre: 'Lire la doc', fait: false } });", label: 'POST /taches : 201 et la tâche créée' },
            { code: AP_SETUP + "const liste = api.handle({ method: 'GET', path: '/taches' }).body;\nassertEqual(liste.map((t) => t.id), [1, 2]);\nliste[0].titre = 'Modifié par le client';\nassertEqual(api.handle({ method: 'GET', path: '/taches' }).body[0].titre, 'Lire la doc', 'la réponse doit contenir des copies');", label: 'GET liste les tâches créées, sous forme de copies' },
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'POST', path: '/taches', body: {} }), { status: 400, body: { erreurs: ['titre : texte non vide obligatoire.'] } });\nassertEqual(api.handle({ method: 'GET', path: '/taches' }).body, []);", label: 'POST invalide : 400 avec les erreurs, rien n’est créé' },
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'GET', path: '/utilisateurs' }).status, 404);", label: 'Une route inconnue renvoie 404' }
          ],
          hint: 'Pour copier un objet : `{ ...t }`. Pour copier toute la liste : `taches.map((t) => ({ ...t }))` (les parenthèses autour de l’objet sont obligatoires).',
          explain: 'Le tableau `taches` n’est visible que depuis `handle` : aucun code extérieur ne peut le corrompre. Renvoyer des copies prolonge cette protection : modifier la réponse ne change pas l’état du serveur, ce que vérifie le troisième test.'
        }
      },
      {
        title: 'Étape 3 : une tâche précise (GET, PATCH, DELETE)',
        explain: 'Pour agir sur **une** tâche, l’id est dans le chemin : `/taches/2`. Une **expression régulière** extrait ce nombre : `/^\\/taches\\/(\\d+)$/` reconnaît exactement « /taches/ suivi de chiffres », et les parenthèses capturent les chiffres.\n\n`PATCH` modifie **une partie** de la tâche : on peut envoyer seulement `{ "fait": true }`. Il faut donc une **validation partielle** : ajoute un paramètre `partielle` à `validerTache`, qui ne vérifie le titre que s’il est présent. `DELETE` renvoie **204** (« pas de contenu ») avec un corps `null`. Un id inconnu donne 404 avec un message précis.',
        ex: {
          type: 'code',
          prompt: 'Ajoute le paramètre `partielle = false` à `validerTache` (le titre n’est vérifié que s’il est présent quand `partielle` vaut `true`), puis les routes `/taches/:id` décrites dans le commentaire.',
          starter: js(AP_VALIDER, AP_REPONSE, apCreer(AP_LISTE_CREER + '\n' + AP_PAR_ID_0)),
          solution: AP_S3,
          tests: [
            { code: AP_SETUP + "assertEqual(api.handle({ method: 'GET', path: '/taches/2' }), { status: 200, body: { id: 2, titre: 'Écrire les tests', fait: false } });\nassertEqual(api.handle({ method: 'GET', path: '/taches/9' }), { status: 404, body: { erreur: 'Tâche 9 introuvable.' } });", label: 'GET /taches/2 renvoie la tâche ; /taches/9 renvoie 404' },
            { code: AP_SETUP + "assertEqual(api.handle({ method: 'PATCH', path: '/taches/1', body: { fait: true } }), { status: 200, body: { id: 1, titre: 'Lire la doc', fait: true } });\nassertEqual(api.handle({ method: 'GET', path: '/taches/1' }).body.fait, true);", label: 'PATCH avec seulement { fait: true } modifie la tâche' },
            { code: AP_SETUP + "assertEqual(api.handle({ method: 'PATCH', path: '/taches/1', body: { fait: 'oui' } }).status, 400);\nassertEqual(api.handle({ method: 'PATCH', path: '/taches/1', body: { titre: '' } }).status, 400);", label: 'PATCH invalide : 400' },
            { code: AP_SETUP + "assertEqual(api.handle({ method: 'DELETE', path: '/taches/1' }), { status: 204, body: null });\nassertEqual(api.handle({ method: 'GET', path: '/taches' }).body.map((t) => t.id), [2]);\nassertEqual(api.handle({ method: 'DELETE', path: '/taches/1' }).status, 404);", label: 'DELETE : 204, puis 404 si on recommence' },
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'GET', path: '/taches/abc' }).status, 404);", label: '/taches/abc ne correspond à aucune route : 404' }
          ],
          hint: '`const correspondance = path.match(/^\\/taches\\/(\\d+)$/);` donne `null` ou un tableau dont l’élément 1 est l’id en texte. Pour retirer la tâche : `taches.splice(taches.indexOf(tache), 1)`.',
          explain: 'La recherche de la tâche est faite une seule fois, avant de regarder la méthode : le 404 est commun à GET, PATCH et DELETE. Les ancres `^` et `$` de l’expression régulière refusent des chemins comme `/taches/2/extra`.'
        }
      },
      {
        title: 'Étape 4 : filtres et méthodes non autorisées',
        explain: 'Trois finitions qui distinguent une API sérieuse. **Les filtres** : `GET /taches?fait=true` ne renvoie que les tâches terminées. Les paramètres après `?` forment la **chaîne de requête** ; la fonction fournie `lireRequete` la découpe en objet.\n\n**Le code 405** : `PUT /taches` vise une route qui existe, mais avec une méthode non prévue. Répondre 404 serait faux ; 405 (« méthode non autorisée ») dit au client exactement ce qui ne va pas. Enfin, on accepte les méthodes **en minuscules** avec `toUpperCase()`, car certains clients les envoient ainsi.',
        ex: {
          type: 'code',
          prompt: 'Améliore `handle` en suivant les 4 points du commentaire : méthodes en minuscules, `lireRequete`, filtre `?fait=true` ou `false`, et réponse 405 pour une méthode non prévue.',
          starter: js(AP_VALIDER2, AP_REPONSE, AP_LIRE_REQUETE, apCreer(AP_CORPS_FINAL_0)),
          solution: AP_S4,
          tests: [
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'post', path: '/taches', body: { titre: 'Lire' } }).status, 201);\nassertEqual(api.handle({ method: 'get', path: '/taches' }).body.length, 1);", label: 'Les méthodes en minuscules sont acceptées' },
            { code: AP_SETUP + "api.handle({ method: 'PATCH', path: '/taches/1', body: { fait: true } });\nassertEqual(api.handle({ method: 'GET', path: '/taches?fait=true' }).body.map((t) => t.id), [1]);\nassertEqual(api.handle({ method: 'GET', path: '/taches?fait=false' }).body.map((t) => t.id), [2]);\nassertEqual(api.handle({ method: 'GET', path: '/taches' }).body.length, 2);", label: '?fait=true et ?fait=false filtrent la liste' },
            { code: AP_SETUP + "const attendu = { status: 405, body: { erreur: 'Méthode non autorisée.' } };\nassertEqual(api.handle({ method: 'PUT', path: '/taches' }), attendu);\nassertEqual(api.handle({ method: 'DELETE', path: '/taches' }), attendu);\nassertEqual(api.handle({ method: 'PUT', path: '/taches/1' }), attendu);", label: 'Une méthode non prévue renvoie 405' },
            { code: "const api = creerApi();\nassertEqual(api.handle({ method: 'GET', path: '/inconnu' }).status, 404);\nassertEqual(api.handle({ method: 'GET', path: '/taches/99' }).status, 404);", label: 'Les routes et tâches inconnues renvoient toujours 404' }
          ],
          hint: 'Dans chaque bloc de route, après les méthodes prévues, ajoute un `return reponse(405, ...)` : on n’y arrive que si aucune méthode n’a correspondu.',
          explain: 'Le 405 est placé à la fin de chaque bloc de route : si le chemin correspond mais qu’aucun verbe n’a répondu, c’est la méthode qui pose problème. Le filtre compare `String(t.fait)` au texte du paramètre, car tout ce qui vient de l’URL est du texte.'
        }
      },
      {
        title: 'Étape 5 : brancher l’API sur Express (sur ta machine)',
        explain: '**Cette étape se fait sur ton ordinateur** : un vrai serveur ne peut pas tourner dans CodeQuest. Installe Node.js (version LTS). Crée un dossier, lance `npm init -y` puis `npm install express`.\n\nCopie ton code dans `api.js` et ajoute à la fin `module.exports = { creerApi };`. Crée `serveur.js` (le code complet est dans la solution du projet) : `app.use(express.json())` lit le corps JSON, puis un seul `app.use((req, res) => { ... })` transmet chaque requête à `api.handle` avec `req.method`, `req.originalUrl` et `req.body`, et renvoie le résultat avec `res.status(status).json(body)`. Ton routeur testé reste le cœur du serveur : Express ne fait que le transport HTTP.',
        checklist: [
          'node --version affiche une version 20 ou plus récente',
          'npm install express a créé le dossier node_modules et ajouté express dans package.json',
          'api.js se termine par module.exports = { creerApi };',
          'node serveur.js affiche « API sur http://localhost:3000 »',
          'http://localhost:3000/taches ouvert dans le navigateur affiche []'
        ]
      },
      {
        title: 'Étape 6 : tester l’API comme un vrai client (sur ta machine)',
        explain: '**Sur ton ordinateur**, serveur lancé, teste chaque route avec `curl` dans un second terminal (sous Windows, utilise Git Bash pour garder les mêmes guillemets). L’option `-i` affiche le code HTTP. Exemple : `curl -i -X POST http://localhost:3000/taches -H "Content-Type: application/json" -d \'{"titre":"Lire la doc"}\'`.\n\nVérifie aussi la **variable d’environnement** `PORT` : `PORT=4000 node serveur.js` doit démarrer sur le port 4000 (c’est ainsi que les hébergeurs choisissent le port). Enfin, constate une limite : arrêter le serveur efface toutes les tâches. La suite logique est une base de données (parcours SQL et Back-end).',
        checklist: [
          'POST /taches avec {"titre":"Lire la doc"} répond 201 et la tâche avec l’id 1',
          'GET /taches/1 répond 200 et GET /taches/99 répond 404',
          'PATCH /taches/1 avec {"fait":"oui"} répond 400 et la liste des erreurs',
          'PUT /taches répond 405',
          'GET /taches?fait=true ne renvoie que les tâches terminées',
          'PORT=4000 node serveur.js démarre bien sur le port 4000'
        ]
      }
    ],
    solution: {
      code: '// ===== api.js : la logique, testée dans CodeQuest =====\n' + AP_S4 + '\nmodule.exports = { creerApi };\n\n\n' + AP_SERVEUR + '\n',
      explain: 'Le projet sépare la **logique** (`api.js` : validation, routage, codes HTTP) du **transport** (`serveur.js` : Express). La logique est une fonction pure de la requête vers la réponse, testable sans réseau ; le serveur ne fait que traduire HTTP en appels à `handle`. Changer de framework (Fastify, le module `http` de Node) ne toucherait que `serveur.js`.\n\nAvec Express seul, on écrirait plutôt une route par ligne (`app.get(\'/taches\', ...)`, `app.post(...)`) : c’est l’écriture la plus courante, et une bonne amélioration à essayer. Les données sont en mémoire : pour les garder, il faudra une base de données, et pour une API publique, une authentification et une limite de débit.'
    },
    variant: 'Réécris `serveur.js` avec une route Express par opération (`app.get(\'/taches/:id\', ...)` et `req.params.id`) en réutilisant `validerTache`. Ajoute un champ `echeance` validé au format AAAA-MM-JJ. Écris des tests automatiques avec le module intégré `node:test` qui appellent `handle` directement. Sauvegarde les tâches dans un fichier JSON à chaque modification.'
  };

  // =====================================================================================
  // Projet 11 : Mini-projet de machine learning (k plus proches voisins)
  // =====================================================================================
  const ML_DONNEES = `import math

# Données d'exemple inventées : [masse en grammes, diamètre en cm] et l'étiquette du fruit.
FRUITS = [
    ([152, 7.4], "pomme"), ([181, 8.6], "orange"), ([96, 6.1], "citron"), ([168, 7.9], "pomme"),
    ([214, 8.9], "orange"), ([110, 6.4], "citron"), ([139, 7.1], "pomme"), ([196, 8.2], "orange"),
    ([121, 6.8], "citron"), ([175, 8.0], "pomme"), ([232, 9.3], "orange"), ([88, 5.8], "citron"),
    ([160, 7.6], "pomme"), ([189, 8.7], "orange"), ([104, 6.0], "citron"), ([185, 8.1], "pomme"),
    ([205, 8.4], "orange"), ([128, 6.9], "citron"), ([145, 7.3], "pomme"), ([176, 8.3], "orange"),
    ([115, 6.6], "citron"), ([171, 7.7], "pomme"), ([224, 9.0], "orange"), ([99, 6.2], "citron"),
]`;
  const ML_DISTANCE = `def distance(a, b):
    total = 0
    for x, y in zip(a, b):
        total += (x - y) ** 2
    return math.sqrt(total)`;
  const ML_DISTANCE_0 = `def distance(a, b):
    # À toi : distance euclidienne entre deux listes de nombres de même longueur
    # (racine carrée de la somme des carrés des écarts)
    pass`;
  const ML_SEPARER = `def separer(donnees, tous_les=4):
    entrainement = []
    test = []
    for i, exemple in enumerate(donnees):
        if i % tous_les == tous_les - 1:
            test.append(exemple)
        else:
            entrainement.append(exemple)
    return entrainement, test`;
  const ML_SEPARER_0 = `def separer(donnees, tous_les=4):
    # À toi : un exemple sur tous_les va dans le test (les positions 3, 7, 11… pour tous_les=4),
    # tous les autres dans l'entraînement. Renvoie (entrainement, test).
    pass`;
  const ML_PREDIRE = `def predire(entrainement, point, k=3):
    voisins = sorted(entrainement, key=lambda exemple: distance(exemple[0], point))[:k]
    votes = {}
    for _, etiquette in voisins:
        votes[etiquette] = votes.get(etiquette, 0) + 1
    meilleure = voisins[0][1]
    for _, etiquette in voisins:
        if votes[etiquette] > votes[meilleure]:
            meilleure = etiquette
    return meilleure`;
  const ML_PREDIRE_0 = `def predire(entrainement, point, k=3):
    # À toi :
    # 1. trie les exemples d'entraînement par distance au point et garde les k premiers
    # 2. compte les votes de chaque étiquette parmi ces voisins
    # 3. renvoie l'étiquette qui a le plus de votes ; en cas d'égalité, celle du voisin le plus proche
    pass`;
  const ML_EXACTITUDE = `def exactitude(entrainement, test, k=3):
    bonnes = 0
    for point, etiquette in test:
        if predire(entrainement, point, k) == etiquette:
            bonnes += 1
    return bonnes / len(test)`;
  const ML_EXACTITUDE_0 = `def exactitude(entrainement, test, k=3):
    # À toi : proportion des exemples de test dont l'étiquette prédite est la bonne
    pass`;
  const ML_NORMALISER = `def bornes(exemples):
    nombre = len(exemples[0][0])
    minimums = [min(ex[0][j] for ex in exemples) for j in range(nombre)]
    maximums = [max(ex[0][j] for ex in exemples) for j in range(nombre)]
    return minimums, maximums


def normaliser(point, limites):
    minimums, maximums = limites
    return [(x - bas) / (haut - bas) for x, bas, haut in zip(point, minimums, maximums)]


def normaliser_tout(exemples, limites):
    return [(normaliser(point, limites), etiquette) for point, etiquette in exemples]`;
  const ML_NORMALISER_0 = `def bornes(exemples):
    # À toi : (liste des minimums, liste des maximums) de chaque caractéristique
    pass


def normaliser(point, limites):
    # À toi : ramène chaque caractéristique entre 0 et 1 : (x - minimum) / (maximum - minimum)
    pass


def normaliser_tout(exemples, limites):
    # À toi : la liste des exemples avec leurs points normalisés et leurs étiquettes inchangées
    pass`;
  const ML_SPLIT = 'ENT, TEST = separer(FRUITS)\n';

  const ML_S1 = py(ML_DONNEES, ML_DISTANCE);
  const ML_S2 = py(ML_DONNEES, ML_DISTANCE, ML_SEPARER);
  const ML_S3 = py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE);
  const ML_S4 = py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE, ML_EXACTITUDE);
  const ML_S5 = py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE, ML_EXACTITUDE, ML_NORMALISER);

  const projetMl = {
    id: 'pj.knn',
    title: 'Mini-projet de machine learning',
    difficulty: 3,
    lang: 'python',
    summary: 'Un classifieur des k plus proches voisins écrit en Python pur, évalué honnêtement, puis comparé à scikit-learn.',
    result: 'Un programme qui reconnaît un fruit (pomme, orange ou citron) à partir de sa masse et de son diamètre. Il sépare les données en entraînement et test, mesure son exactitude (environ 67 % sans précaution, 100 % sur ce petit test après normalisation), et montre pourquoi on ne mesure jamais un modèle sur ses données d’entraînement. Sur ta machine, scikit-learn retrouve les mêmes résultats.',
    skills: ['py.u7', 'py.u9', 'py.u15', 'data.u11', 'data.u12', 'data.u14'],
    steps: [
      {
        title: 'Étape 1 : mesurer la ressemblance',
        explain: 'L’algorithme des **k plus proches voisins** repose sur une idée simple : un fruit inconnu ressemble aux fruits connus les plus proches de lui. Il faut donc mesurer la « proximité » entre deux fruits décrits par des nombres (masse, diamètre).\n\nOn utilise la **distance euclidienne**, celle de la règle graduée, généralisée à autant de caractéristiques qu’on veut : racine carrée de la somme des carrés des écarts. `zip(a, b)` parcourt les deux listes en parallèle. Les données sont **inventées pour l’exemple**, mais plausibles.',
        ex: {
          type: 'code',
          prompt: 'Écris `distance(a, b)` : la distance euclidienne entre deux listes de nombres, avec `zip` et `math.sqrt`.',
          starter: py(ML_DONNEES, ML_DISTANCE_0),
          solution: ML_S1,
          tests: [
            { code: 'assert distance([0, 0], [3, 4]) == 5.0', label: 'distance([0, 0], [3, 4]) vaut 5 (triangle 3-4-5)' },
            { code: 'assert distance([1, 2, 3], [1, 2, 3]) == 0', label: 'Un point est à distance 0 de lui-même' },
            { code: 'assert distance([152, 7.4], [150, 7.4]) == 2.0', label: 'Deux fruits qui ne diffèrent que de 2 g sont à distance 2' },
            { code: 'assert distance([1, 5], [4, 1]) == distance([4, 1], [1, 5])', label: 'La distance est symétrique' }
          ],
          hint: 'Accumule `(x - y) ** 2` dans une boucle `for x, y in zip(a, b):`, puis renvoie la racine carrée du total.',
          explain: 'Élever au carré rend tous les écarts positifs et pénalise les gros écarts. Comme la fonction parcourt les listes avec `zip`, elle fonctionne pour 2, 3 ou 100 caractéristiques sans modification.'
        }
      },
      {
        title: 'Étape 2 : séparer entraînement et test',
        explain: 'Règle d’or du machine learning : **on n’évalue jamais un modèle sur les données qui ont servi à l’entraîner**. Ce serait comme réviser avec le corrigé de l’examen. On met donc de côté un **jeu de test**, que le modèle ne voit pas pendant l’apprentissage.\n\nIci la séparation est **déterministe** : un exemple sur quatre va dans le test. Les résultats sont donc reproductibles, et comme les fruits sont rangés en alternance, le test contient deux fruits de chaque sorte. En pratique, on mélange au hasard avec une **graine fixe** (`random_state` dans scikit-learn) pour la même reproductibilité.',
        ex: {
          type: 'code',
          prompt: 'Écris `separer(donnees, tous_les=4)` : les exemples aux positions 3, 7, 11… vont dans le test, les autres dans l’entraînement. Renvoie `(entrainement, test)`.',
          starter: py(ML_DONNEES, ML_DISTANCE, ML_SEPARER_0),
          solution: ML_S2,
          tests: [
            { code: ML_SPLIT + 'assert len(ENT) == 18 and len(TEST) == 6', label: '24 fruits : 18 pour l’entraînement, 6 pour le test' },
            { code: 'assert TEST[0] == FRUITS[3] and TEST[1] == FRUITS[7]', label: 'Le test contient les exemples 3, 7, 11…' },
            { code: 'assert all(exemple not in ENT for exemple in TEST)', label: 'Aucun exemple n’est à la fois dans l’entraînement et le test' },
            { code: 'assert separer(list(range(8)), 4) == ([0, 1, 2, 4, 5, 6], [3, 7])', label: 'Fonctionne sur n’importe quelle liste' }
          ],
          hint: '`enumerate(donnees)` donne la position `i` de chaque exemple. La condition « un sur quatre, à partir du quatrième » s’écrit avec le reste de la division : `i % tous_les == tous_les - 1`.',
          explain: 'Le reste `i % 4` vaut 0, 1, 2, 3, 0, 1… : la condition est vraie une fois sur quatre. Les deux listes sont disjointes par construction, puisque chaque exemple va dans l’une ou dans l’autre.'
        }
      },
      {
        title: 'Étape 3 : prédire avec les k plus proches voisins',
        explain: 'Pour classer un fruit inconnu : on trie tous les fruits d’entraînement par **distance** au fruit inconnu, on garde les **k plus proches**, et chacun **vote** pour son étiquette. L’étiquette majoritaire l’emporte.\n\n`sorted(..., key=lambda exemple: distance(exemple[0], point))` trie selon la distance. Pour le vote, un dictionnaire compte les voix. En cas d’**égalité** (possible avec k pair), on choisit l’étiquette du voisin le plus proche : une règle explicite vaut mieux qu’un résultat qui dépend du hasard. C’est tout l’algorithme : il n’y a pas d’« entraînement », le modèle mémorise les exemples.',
        ex: {
          type: 'code',
          prompt: 'Écris `predire(entrainement, point, k=3)` : les k voisins les plus proches votent ; en cas d’égalité, l’étiquette du voisin le plus proche l’emporte.',
          starter: py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE_0),
          solution: ML_S3,
          tests: [
            { code: ML_SPLIT + 'assert predire(ENT, [150, 7.3]) == "pomme"', label: 'Un fruit de 150 g et 7.3 cm est une pomme' },
            { code: 'assert predire(ENT, [100, 6.2]) == "citron" and predire(ENT, [230, 9.1]) == "orange"', label: 'Citron et orange typiques bien reconnus' },
            { code: 'assert predire([([0, 0], "a"), ([2, 0], "b")], [0.9, 0], k=2) == "a"', label: 'Égalité 1 contre 1 : le voisin le plus proche (a) l’emporte' },
            { code: 'assert predire([([0, 0], "a"), ([2, 0], "b")], [1.1, 0], k=2) == "b"', label: 'Égalité 1 contre 1 : le voisin le plus proche (b) l’emporte' }
          ],
          hint: 'Après le tri, `[:k]` garde les k premiers. Pour le vote, `votes.get(etiquette, 0) + 1`. Commence avec `meilleure = voisins[0][1]` et ne la remplace que si une étiquette a strictement plus de votes.',
          explain: 'Partir de l’étiquette du plus proche voisin et ne la remplacer que sur une majorité stricte règle les égalités sans code supplémentaire. Le tri complet est simple mais coûteux sur de gros jeux de données ; les bibliothèques utilisent des structures plus rapides.'
        }
      },
      {
        title: 'Étape 4 : mesurer l’exactitude',
        explain: 'Le modèle est-il bon ? L’**exactitude** est la proportion de prédictions justes sur le jeu de test. Ici, elle vaut environ **0.67** : 4 fruits sur 6. Le modèle confond des pommes et des oranges.\n\nUn piège classique : mesurer l’exactitude sur les données d’**entraînement**. Avec k = 1, chaque fruit est son propre plus proche voisin (distance 0) : on obtient 100 %, un score **trompeur** qui ne dit rien sur des fruits nouveaux. Autre limite honnête : avec 6 exemples de test, chaque erreur coûte 17 points ; un vrai projet en utilise des centaines.',
        ex: {
          type: 'code',
          prompt: 'Écris `exactitude(entrainement, test, k=3)` : la proportion des exemples de `test` correctement prédits par `predire`.',
          starter: py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE, ML_EXACTITUDE_0),
          solution: ML_S4,
          tests: [
            { code: ML_SPLIT + 'assert round(exactitude(ENT, TEST), 2) == 0.67', label: 'Exactitude sur le test : 0.67 (4 sur 6)' },
            { code: 'assert exactitude(ENT, ENT, k=1) == 1.0', label: 'Sur l’entraînement avec k=1 : 100 %, un score trompeur' },
            { code: 'assert predire(ENT, TEST[3][0], k=1) == "orange" and TEST[3][1] == "pomme"', label: 'La pomme de 185 g est prise pour une orange' }
          ],
          hint: 'Parcours `for point, etiquette in test:` et compte les prédictions égales à l’étiquette. Divise par `len(test)`.',
          explain: 'La division `/` donne un nombre à virgule entre 0 et 1. Comparer le score sur l’entraînement (1.0) et sur le test (0.67) montre l’écart entre « mémoriser » et « généraliser » : c’est le score de test qui compte.'
        }
      },
      {
        title: 'Étape 5 : normaliser les caractéristiques',
        explain: 'Pourquoi tant d’erreurs ? La masse varie sur plus de 100 grammes, le diamètre sur 3 centimètres : dans la distance, **la masse écrase le diamètre**. Le modèle ignore presque une information utile.\n\nLa solution est de **normaliser** : ramener chaque caractéristique entre 0 et 1 avec `(x - minimum) / (maximum - minimum)`. Point crucial : minimums et maximums sont calculés sur l’**entraînement seulement**, puis appliqués au test. Les calculer sur toutes les données ferait « fuiter » de l’information du test dans le modèle. Un fruit de test peut alors sortir un peu de [0, 1] : c’est normal.',
        ex: {
          type: 'code',
          prompt: 'Écris `bornes(exemples)`, `normaliser(point, limites)` et `normaliser_tout(exemples, limites)`, puis observe l’exactitude obtenue sur les données normalisées.',
          starter: py(ML_DONNEES, ML_DISTANCE, ML_SEPARER, ML_PREDIRE, ML_EXACTITUDE, ML_NORMALISER_0),
          solution: ML_S5,
          tests: [
            { code: ML_SPLIT + 'B = bornes(ENT)\nassert B == ([96, 6.0], [232, 9.3])', label: 'Bornes de l’entraînement : masse 96 à 232, diamètre 6.0 à 9.3' },
            { code: 'assert [round(x, 3) for x in normaliser([164, 7.65], B)] == [0.5, 0.5]', label: 'Un point au milieu des bornes devient [0.5, 0.5]' },
            { code: 'assert normaliser_tout(TEST, B)[0][1] == "pomme" and len(normaliser_tout(TEST, B)) == 6', label: 'normaliser_tout garde les étiquettes' },
            { code: 'assert exactitude(normaliser_tout(ENT, B), normaliser_tout(TEST, B)) == 1.0', label: 'Après normalisation : 6 fruits de test sur 6 bien classés' }
          ],
          hint: '`min(ex[0][j] for ex in exemples)` donne le minimum de la caractéristique numéro `j`. Dans `normaliser`, `zip(point, minimums, maximums)` parcourt les trois listes ensemble.',
          explain: 'Une fois normalisées, les deux caractéristiques pèsent autant dans la distance, et l’exactitude passe de 0.67 à 1.0 sur ce petit test. Le prétraitement des données compte souvent plus que le choix de l’algorithme.'
        }
      },
      {
        title: 'Étape 6 : comparer avec scikit-learn (sur ta machine)',
        explain: '**Cette étape se fait sur ton ordinateur** : scikit-learn ne tourne pas dans CodeQuest. Dans un environnement virtuel, installe la bibliothèque avec `pip install scikit-learn`, puis copie tes données et ta fonction `separer`.\n\nConstruis `X_train` (les points) et `y_train` (les étiquettes) à partir de `ENT`, de même pour le test. Normalise avec `MinMaxScaler` : `fit_transform` sur l’entraînement, `transform` seulement sur le test. Entraîne `KNeighborsClassifier(n_neighbors=3)` avec `fit`, prédis avec `predict`, mesure avec `accuracy_score`. Tu dois retrouver tes résultats ; un écart rare peut venir d’une règle différente en cas d’égalité de distances. Essaie enfin `train_test_split` avec `random_state` et `stratify=y`.',
        checklist: [
          'scikit-learn est installé : python -c "import sklearn" ne renvoie pas d’erreur',
          'Sans normalisation, KNeighborsClassifier(n_neighbors=3) donne 0.67 sur le même découpage',
          'Avec MinMaxScaler ajusté (fit) sur l’entraînement seulement, l’exactitude est de 1.0',
          'Avec train_test_split(X, y, test_size=0.25, random_state=0, stratify=y), tu as noté l’exactitude obtenue et constaté qu’elle change avec random_state',
          'Tu as essayé cross_val_score pour une estimation moins dépendante du découpage'
        ]
      }
    ],
    solution: {
      code: ML_S5 + `

# Démonstration complète (même résultat dans CodeQuest et sur ta machine).
ENT, TEST = separer(FRUITS)
print("Sans normalisation :", round(exactitude(ENT, TEST), 2))
B = bornes(ENT)
print("Avec normalisation :", exactitude(normaliser_tout(ENT, B), normaliser_tout(TEST, B)))


# Sur ta machine, la même chose avec scikit-learn :
# from sklearn.neighbors import KNeighborsClassifier
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.metrics import accuracy_score
# X_train = [p for p, _ in ENT]
# y_train = [e for _, e in ENT]
# X_test = [p for p, _ in TEST]
# y_test = [e for _, e in TEST]
# echelle = MinMaxScaler()
# modele = KNeighborsClassifier(n_neighbors=3)
# modele.fit(echelle.fit_transform(X_train), y_train)
# print(accuracy_score(y_test, modele.predict(echelle.transform(X_test))))
`,
      explain: 'Le projet reprend tout le cycle d’un projet de machine learning : données, mesure de similarité, découpage entraînement/test, modèle, évaluation, prétraitement. L’algorithme tient en quelques lignes ; l’essentiel du travail est d’évaluer honnêtement.\n\nTrois leçons à retenir : un score sur l’entraînement ne prouve rien ; des caractéristiques d’échelles différentes faussent les distances ; un petit jeu de test donne un score très incertain (ici, 6 exemples). Pour choisir k, on n’utilise pas le jeu de test (ce serait encore une fuite) : on utilise une validation croisée sur l’entraînement.'
    },
    variant: 'Ajoute une caractéristique (par exemple une note de couleur de 0 à 10) et vérifie que ton code fonctionne sans modification. Écris une matrice de confusion : un dictionnaire qui compte les couples (vraie étiquette, étiquette prédite). Pondère les votes par l’inverse de la distance, pour que les voisins très proches comptent davantage.'
  };

  // =====================================================================================
  // Projet 12 : Analyse de données publiques (comptages vélo)
  // =====================================================================================
  const DP_CSV = 'date,jour,compteur,passages,pluie_mm\n'
    + '2026-09-07,lundi,Pont nord,2140,0.0\n'
    + '2026-09-07,lundi,Quai sud,1385,0.0\n'
    + '2026-09-07,lundi,Avenue verte,918,0.0\n'
    + '2026-09-08,mardi,Pont nord,2265,0.2\n'
    + '2026-09-08,mardi, quai sud,1410,0.2\n'
    + '2026-09-08,mardi,Avenue verte,975,0.2\n'
    + '2026-09-09,mercredi,Pont nord,1530,6.4\n'
    + '2026-09-09,mercredi,Quai sud,960,6.4\n'
    + '2026-09-09,mercredi,Avenue verte,,6.4\n'
    + '2026-09-10,jeudi,PONT NORD,2310,0.0\n'
    + '2026-09-10,jeudi,Quai sud,1452,0.0\n'
    + '2026-09-10,jeudi,Avenue verte,1003,0.0\n'
    + '2026-09-10,jeudi,Avenue verte,1003,0.0\n'
    + '2026-09-11,vendredi,Pont nord,1690,3.1\n'
    + '2026-09-11,vendredi,Quai sud,-1,3.1\n'
    + '2026-09-11,vendredi,Avenue verte,702,3.1\n'
    + '2026-09-12,samedi,Pont nord,1205,0.0\n'
    + '2026-09-12,samedi,Quai sud,1650,0.0\n'
    + '2026-09-12,samedi,Avenue verte,1320,0.0\n'
    + '2026-09-13,dimanche,Pont nord,1080,1.8\n'
    + '2026-09-13,dimanche,Quai sud,1190,1.8\n'
    + '2026-09-13,dimanche,avenue verte ,880,1.8\n'
    + '2026-09-14,lundi,Pont nord,2205,0.0\n'
    + '2026-09-14,lundi,Quai sud,1398,0.0\n'
    + '2026-09-14,lundi,Avenue verte,,0.0\n';
  const DP_FILES = { 'compteurs_velo.csv': DP_CSV };
  const DP_CHARGER = `import csv


def charger(nom_fichier):
    # Fournie : la liste des lignes du CSV, sous forme de dictionnaires de textes.
    with open(nom_fichier) as f:
        return list(csv.DictReader(f))`;
  const DP_INSPECTER = `def inspecter(lignes):
    noms = sorted(set(ligne["compteur"] for ligne in lignes))
    vides = sum(1 for ligne in lignes if ligne["passages"].strip() == "")
    return {"lignes": len(lignes), "noms_bruts": noms, "passages_vides": vides}`;
  const DP_INSPECTER_0 = `def inspecter(lignes):
    # À toi : renvoie {"lignes": nombre de lignes,
    #                  "noms_bruts": liste triée des noms de compteurs distincts, tels qu'écrits,
    #                  "passages_vides": nombre de lignes sans valeur de passages}
    pass`;
  const DP_NETTOYER = `def normaliser_nom(nom):
    return nom.strip().capitalize()


def nettoyer(lignes):
    propres = []
    deja_vus = set()
    journal = {"manquant": 0, "invalide": 0, "doublon": 0}
    for ligne in lignes:
        nom = normaliser_nom(ligne["compteur"])
        texte = ligne["passages"].strip()
        if texte == "":
            journal["manquant"] += 1
            continue
        passages = int(texte)
        if passages < 0:
            journal["invalide"] += 1
            continue
        cle = (ligne["date"], nom)
        if cle in deja_vus:
            journal["doublon"] += 1
            continue
        deja_vus.add(cle)
        propres.append({
            "date": ligne["date"],
            "jour": ligne["jour"],
            "compteur": nom,
            "passages": passages,
            "pluie_mm": float(ligne["pluie_mm"]),
        })
    return propres, journal`;
  const DP_NETTOYER_0 = `def normaliser_nom(nom):
    # À toi : " quai sud" et "QUAI SUD" deviennent "Quai sud"
    pass


def nettoyer(lignes):
    # À toi : renvoie (propres, journal).
    # - nom du compteur normalisé
    # - passages vide : ligne retirée, journal["manquant"] + 1
    # - passages négatif : ligne retirée, journal["invalide"] + 1
    # - même date et même compteur déjà vus : ligne retirée, journal["doublon"] + 1
    # - sinon : {"date", "jour", "compteur", "passages" (int), "pluie_mm" (float)}
    journal = {"manquant": 0, "invalide": 0, "doublon": 0}
    pass`;
  const DP_AGREGER = `def type_jour(ligne):
    if ligne["jour"] in ("samedi", "dimanche"):
        return "week-end"
    return "semaine"


def moyenne_par(lignes, cle):
    groupes = {}
    for ligne in lignes:
        groupe = cle(ligne)
        if groupe not in groupes:
            groupes[groupe] = []
        groupes[groupe].append(ligne["passages"])
    return {groupe: round(sum(valeurs) / len(valeurs), 1) for groupe, valeurs in groupes.items()}`;
  const DP_AGREGER_0 = `def type_jour(ligne):
    # À toi : "week-end" pour samedi et dimanche, "semaine" sinon
    pass


def moyenne_par(lignes, cle):
    # À toi : cle est une FONCTION qui donne le groupe d'une ligne.
    # Renvoie {groupe: moyenne des passages du groupe, arrondie à 1 décimale}.
    pass`;
  const DP_PLUIE = `def effet_pluie(lignes, seuil=1.0):
    semaine = [ligne for ligne in lignes if type_jour(ligne) == "semaine"]
    compteurs = []
    for ligne in semaine:
        if ligne["compteur"] not in compteurs:
            compteurs.append(ligne["compteur"])
    resultat = {}
    for compteur in compteurs:
        sec = [l["passages"] for l in semaine if l["compteur"] == compteur and l["pluie_mm"] < seuil]
        pluie = [l["passages"] for l in semaine if l["compteur"] == compteur and l["pluie_mm"] >= seuil]
        if sec and pluie:
            moyenne_sec = sum(sec) / len(sec)
            moyenne_pluie = sum(pluie) / len(pluie)
            resultat[compteur] = round((moyenne_pluie - moyenne_sec) / moyenne_sec * 100, 1)
    return resultat`;
  const DP_PLUIE_0 = `def effet_pluie(lignes, seuil=1.0):
    # À toi : en semaine seulement, et pour chaque compteur (dans l'ordre d'apparition) :
    # écart en % entre la moyenne des jours de pluie (pluie_mm >= seuil) et celle des jours secs,
    # arrondi à 1 décimale. Un compteur sans jour sec ou sans jour de pluie est ignoré.
    pass`;
  const DP_RAPPORT = `def rapport(nom_fichier):
    brutes = charger(nom_fichier)
    propres, journal = nettoyer(brutes)
    moyennes = moyenne_par(propres, lambda ligne: ligne["compteur"])
    premier = max(moyennes, key=moyennes.get)
    effets = effet_pluie(propres)
    jours_pluie = sorted(set(l["date"] for l in propres if type_jour(l) == "semaine" and l["pluie_mm"] >= 1.0))
    lignes = [
        f"Lignes lues : {len(brutes)}, gardées : {len(propres)}",
        f"Retirées : {journal['manquant']} manquante(s), {journal['invalide']} invalide(s), {journal['doublon']} doublon(s)",
        f"Compteur le plus fréquenté : {premier} ({moyennes[premier]} passages par jour en moyenne)",
        "Effet de la pluie en semaine : " + ", ".join(f"{c} {e} %" for c, e in effets.items()),
        f"Prudence : {len(jours_pluie)} jours de semaine pluvieux seulement, tendance à confirmer sur plus de données.",
    ]
    return "\\n".join(lignes)`;
  const DP_RAPPORT_0 = `def rapport(nom_fichier):
    # À toi : charge, nettoie, puis renvoie ces 5 lignes reliées par des retours à la ligne :
    # Lignes lues : 25, gardées : 21
    # Retirées : 2 manquante(s), 1 invalide(s), 1 doublon(s)
    # Compteur le plus fréquenté : Pont nord (1803.1 passages par jour en moyenne)
    # Effet de la pluie en semaine : Pont nord -27.8 %, Quai sud -32.0 %, Avenue verte -27.3 %
    # Prudence : 2 jours de semaine pluvieux seulement, tendance à confirmer sur plus de données.
    pass`;
  const DP_PROPRES = 'P, J = nettoyer(charger("compteurs_velo.csv"))\n';

  const DP_S1 = py(DP_CHARGER, DP_INSPECTER);
  const DP_S2 = py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER);
  const DP_S3 = py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER);
  const DP_S4 = py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER, DP_PLUIE);
  const DP_S5 = py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER, DP_PLUIE, DP_RAPPORT);

  const projetDonnees = {
    id: 'pj.donnees-publiques',
    title: 'Analyse de données publiques',
    difficulty: 3,
    lang: 'python',
    summary: 'Une vraie démarche d’analyse sur des comptages de vélos : question, nettoyage, agrégations, conclusion prudente, puis pandas sur de vraies données ouvertes.',
    result: 'Un script qui part d’un extrait de comptages de vélos (fichier d’exemple aux chiffres plausibles, pas des chiffres officiels), le nettoie (noms incohérents, valeurs manquantes, erreur de capteur, doublon), compare semaine et week-end, et répond à la question « Passe-t-il moins de vélos quand il pleut ? » : en semaine, environ 28 à 32 % de passages en moins les jours de pluie selon le compteur, avec les limites de cette conclusion. Sur ta machine, la même analyse avec pandas sur un jeu de données ouvert réel.',
    skills: ['py.u8', 'py.u9', 'py.u12', 'py.u13', 'data.u3', 'data.u5', 'data.u6', 'data.u8'],
    steps: [
      {
        title: 'Étape 1 : la question et l’inspection',
        explain: 'Une analyse commence par une **question précise** : « Passe-t-il moins de vélos devant les compteurs quand il pleut ? ». Elle guide tous les choix qui suivent.\n\nLe fichier `compteurs_velo.csv` est un **extrait d’exemple** : une ligne par jour et par compteur, avec le nombre de passages et la pluie en millimètres. Les chiffres sont plausibles mais **inventés**, comme le sont souvent les jeux d’entraînement. Avant tout calcul, on **inspecte** : combien de lignes, quels noms de compteurs, combien de valeurs manquantes ? On découvre souvent ici des surprises, comme le même compteur écrit de plusieurs façons.',
        ex: {
          type: 'code',
          prompt: 'Écris `inspecter(lignes)` : renvoie le nombre de lignes, la liste triée des noms de compteurs distincts tels qu’ils sont écrits, et le nombre de lignes sans valeur de passages.',
          starter: py(DP_CHARGER, DP_INSPECTER_0),
          solution: DP_S1,
          files: DP_FILES,
          tests: [
            { code: 'I = inspecter(charger("compteurs_velo.csv"))\nassert I["lignes"] == 25', label: 'Le fichier contient 25 lignes de données' },
            { code: 'assert I["noms_bruts"] == [" quai sud", "Avenue verte", "PONT NORD", "Pont nord", "Quai sud", "avenue verte "]', label: '6 écritures différentes pour seulement 3 compteurs' },
            { code: 'assert I["passages_vides"] == 2', label: '2 lignes sans valeur de passages' }
          ],
          hint: '`sorted(set(...))` donne une liste triée sans doublon. Pour compter les lignes vides : `sum(1 for ligne in lignes if ...)`.',
          explain: 'L’inspection révèle 6 noms pour 3 compteurs : sans nettoyage, les moyennes par compteur seraient fausses. Le tri place l’espace et les majuscules avant les minuscules, ce qui regroupe visuellement les anomalies.'
        }
      },
      {
        title: 'Étape 2 : nettoyer les données',
        explain: 'Le **nettoyage** prend souvent la majeure partie du temps d’une analyse. Quatre problèmes à traiter. Les **noms incohérents** : on retire les espaces et on uniformise la casse. Les **valeurs manquantes** : on retire la ligne (inventer une valeur fausserait les moyennes). Les **valeurs impossibles** : `-1` passage est une erreur de capteur. Les **doublons** : la même mesure enregistrée deux fois.\n\nChaque retrait est **compté dans un journal** : une analyse honnête dit ce qu’elle a écarté. Pour repérer les doublons, un ensemble de couples `(date, compteur)` déjà vus permet un test rapide avec `in`.',
        ex: {
          type: 'code',
          prompt: 'Écris `normaliser_nom(nom)` puis `nettoyer(lignes)`, qui renvoie `(propres, journal)` selon les règles du commentaire.',
          starter: py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER_0),
          solution: DP_S2,
          files: DP_FILES,
          tests: [
            { code: 'assert normaliser_nom(" quai sud") == "Quai sud" and normaliser_nom("PONT NORD") == "Pont nord"', label: 'Les noms sont normalisés' },
            { code: DP_PROPRES + 'assert J == {"manquant": 2, "invalide": 1, "doublon": 1} and len(P) == 21', label: '4 lignes retirées (2 manquantes, 1 invalide, 1 doublon), 21 gardées' },
            { code: 'assert P[0] == {"date": "2026-09-07", "jour": "lundi", "compteur": "Pont nord", "passages": 2140, "pluie_mm": 0.0}', label: 'Les lignes propres ont des nombres, plus du texte' },
            { code: 'assert sorted(set(l["compteur"] for l in P)) == ["Avenue verte", "Pont nord", "Quai sud"]', label: 'Il ne reste que 3 noms de compteurs' }
          ],
          hint: 'Dans la boucle, traite les cas d’exclusion un par un avec `continue`. Le couple `(ligne["date"], nom)` doit être construit avec le nom **normalisé**.',
          explain: 'L’ordre des tests compte : on vérifie la valeur avant le doublon, pour ne pas enregistrer comme « vue » une ligne invalide. Les conversions `int` et `float` arrivent après les vérifications, sur des valeurs sûres.'
        }
      },
      {
        title: 'Étape 3 : agréger par groupe',
        explain: 'On calcule des **moyennes par groupe**. Pour ne pas écrire une fonction par regroupement, `moyenne_par` reçoit une **fonction clé** qui dit à quel groupe appartient une ligne, exactement comme le paramètre `key` de `sorted`. Avec `lambda l: l["compteur"]` on groupe par compteur ; avec `type_jour`, par semaine ou week-end ; avec un tuple, par les deux.\n\nLe croisement révèle un effet important : le Pont nord, très fréquenté en semaine (trajets domicile-travail), baisse le week-end, alors que l’Avenue verte, plutôt de loisir, augmente. Cette différence va compter pour la question de la pluie.',
        ex: {
          type: 'code',
          prompt: 'Écris `type_jour(ligne)` (`"week-end"` ou `"semaine"`) et `moyenne_par(lignes, cle)`, où `cle` est une fonction qui donne le groupe de chaque ligne. Moyennes arrondies à 1 décimale.',
          starter: py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER_0),
          solution: DP_S3,
          files: DP_FILES,
          tests: [
            { code: DP_PROPRES + 'assert moyenne_par(P, lambda l: l["compteur"]) == {"Pont nord": 1803.1, "Quai sud": 1349.3, "Avenue verte": 966.3}', label: 'Moyenne des passages par compteur' },
            { code: 'assert moyenne_par(P, type_jour) == {"semaine": 1489.5, "week-end": 1220.8}', label: 'Moyenne en semaine et le week-end' },
            { code: 'M = moyenne_par(P, lambda l: (l["compteur"], type_jour(l)))\nassert M[("Pont nord", "semaine")] == 2023.3 and M[("Pont nord", "week-end")] == 1142.5', label: 'Le Pont nord baisse fortement le week-end' },
            { code: 'assert M[("Avenue verte", "semaine")] == 899.5 and M[("Avenue verte", "week-end")] == 1100.0', label: 'L’Avenue verte augmente le week-end' }
          ],
          hint: 'Construis un dictionnaire `{groupe: [passages...]}` avec `groupe = cle(ligne)`, puis une compréhension de dictionnaire pour les moyennes.',
          explain: 'Passer une fonction en paramètre rend `moyenne_par` réutilisable pour tous les regroupements, y compris croisés (un tuple sert de clé). C’est le principe du `groupby` de pandas.'
        }
      },
      {
        title: 'Étape 4 : l’effet de la pluie, à conditions comparables',
        explain: 'Comparer naïvement tous les jours de pluie à tous les jours secs donne environ −26 %. Mais ce chiffre est **biaisé** : le dimanche, pluvieux dans l’extrait, a moins de passages pour une autre raison (c’est le week-end), et les lignes retirées au nettoyage ne touchent pas les mêmes compteurs les jours de pluie.\n\nOn compare donc à **conditions comparables** : en semaine seulement, et **compteur par compteur**. Un jour est pluvieux à partir de 1 mm, un seuil courant en climatologie. Ce réflexe (chercher ce qui, en plus du facteur étudié, distingue les groupes) protège des **facteurs de confusion**.',
        ex: {
          type: 'code',
          prompt: 'Écris `effet_pluie(lignes, seuil=1.0)` : en semaine, pour chaque compteur, l’écart en % entre la moyenne des jours de pluie et celle des jours secs (arrondi à 1 décimale), en ignorant un compteur sans jour sec ou sans jour de pluie.',
          starter: py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER, DP_PLUIE_0),
          solution: DP_S4,
          files: DP_FILES,
          tests: [
            { code: DP_PROPRES + 'assert effet_pluie(P) == {"Pont nord": -27.8, "Quai sud": -32.0, "Avenue verte": -27.3}', label: 'En semaine : 27 à 32 % de passages en moins les jours de pluie' },
            { code: 'assert list(effet_pluie(P).keys()) == ["Pont nord", "Quai sud", "Avenue verte"]', label: 'Les compteurs restent dans leur ordre d’apparition' },
            { code: 'assert effet_pluie(P, seuil=10.0) == {}', label: 'Avec un seuil de 10 mm, aucun jour de pluie : résultat vide, sans erreur' }
          ],
          hint: 'Filtre d’abord les lignes de semaine. Pour chaque compteur, construis deux listes (sec et pluie) avec des compréhensions, et ne calcule que si les deux sont non vides.',
          explain: 'L’écart est calculé par rapport aux jours secs du même compteur : on compare chaque compteur à lui-même. Le test `if sec and pluie` évite une division par zéro quand un groupe est vide.'
        }
      },
      {
        title: 'Étape 5 : le rapport et la conclusion',
        explain: 'Dernière étape d’une analyse : **communiquer**. Le rapport dit d’où viennent les chiffres (lignes lues et retirées), répond à la question, et **énonce ses limites**. Ici, les jours de semaine pluvieux ne sont que deux : la tendance est nette et cohérente sur les trois compteurs, mais elle reste à confirmer sur une période plus longue.\n\nAutre précaution : une corrélation n’est pas une preuve de causalité. Des jours de pluie peuvent coïncider avec autre chose (vacances, grève, travaux). Le rapport présente donc un constat chiffré et prudent, pas une loi générale.',
        ex: {
          type: 'code',
          prompt: 'Écris `rapport(nom_fichier)` : il renvoie les 5 lignes indiquées dans le commentaire, reliées par des retours à la ligne, en réutilisant les fonctions précédentes.',
          starter: py(DP_CHARGER, DP_INSPECTER, DP_NETTOYER, DP_AGREGER, DP_PLUIE, DP_RAPPORT_0),
          solution: DP_S5,
          files: DP_FILES,
          tests: [
            { code: 'R = rapport("compteurs_velo.csv").split("\\n")\nassert R[0] == "Lignes lues : 25, gardées : 21" and R[1] == "Retirées : 2 manquante(s), 1 invalide(s), 1 doublon(s)"', label: 'Le rapport dit d’où viennent les chiffres' },
            { code: 'assert R[2] == "Compteur le plus fréquenté : Pont nord (1803.1 passages par jour en moyenne)"', label: 'Le compteur le plus fréquenté est le Pont nord' },
            { code: 'assert R[3] == "Effet de la pluie en semaine : Pont nord -27.8 %, Quai sud -32.0 %, Avenue verte -27.3 %"', label: 'La réponse à la question, compteur par compteur' },
            { code: 'assert R[4].startswith("Prudence : 2 jours de semaine pluvieux")', label: 'Le rapport énonce sa limite principale' }
          ],
          hint: '`max(moyennes, key=moyennes.get)` donne la clé de plus grande valeur. Pour la ligne de la pluie, `", ".join(f"{c} {e} %" for c, e in effets.items())`.',
          explain: 'Le rapport n’ajoute aucun calcul nouveau : il assemble les résultats des fonctions testées. Les jours pluvieux sont comptés avec un ensemble de dates, car chaque jour apparaît sur plusieurs lignes (une par compteur).'
        }
      },
      {
        title: 'Étape 6 : la même analyse avec pandas sur de vraies données (sur ta machine)',
        explain: '**Cette étape se fait sur ton ordinateur** : pandas ne tourne pas dans CodeQuest. Cherche un jeu de données réel de **comptages vélo** sur un portail ouvert : data.gouv.fr (le portail national), ou le portail open data de ta ville ; plusieurs grandes villes publient leurs compteurs. Pour la météo, data.gouv.fr propose aussi des données climatologiques. Lis la description du jeu (licence, unités, fréquence) avant de télécharger.\n\nAvec pandas : `pd.read_csv(..., sep=";")` (les fichiers français utilisent souvent le point-virgule), `df.info()` et `df.isna().sum()` pour inspecter, `str.strip()` et `drop_duplicates()` pour nettoyer, `groupby` pour agréger, `merge` pour joindre comptages et météo par date.',
        checklist: [
          'Tu as téléchargé un jeu de comptages vélo réel et noté sa source, sa licence et sa période',
          'df.info() et df.isna().sum() t’ont permis de lister les colonnes, les types et les valeurs manquantes',
          'Le nettoyage (noms, valeurs impossibles, doublons) est fait et le nombre de lignes retirées est noté',
          'groupby donne la moyenne des passages par compteur et par type de jour (semaine ou week-end)',
          'Les comptages sont joints à des données de pluie par date avec merge, et l’écart pluie / sec est calculé par compteur en semaine',
          'Ta conclusion tient en trois phrases : le constat chiffré, la période couverte, les limites'
        ]
      }
    ],
    solution: {
      code: DP_S5 + '\n\n# Sur ta machine (ou dans CodeQuest avec le fichier virtuel) :\nprint(rapport("compteurs_velo.csv"))\n',
      explain: 'L’analyse suit la démarche complète : question, inspection, nettoyage tracé dans un journal, agrégations génériques (`moyenne_par` avec une fonction clé), comparaison à conditions comparables, rapport avec limites. **Conclusion sur cet extrait** : en semaine, les jours de pluie (au moins 1 mm) comptent environ 28 à 32 % de passages en moins selon le compteur, de façon cohérente sur les trois sites ; mais avec deux jours de semaine pluvieux seulement, c’est une tendance à confirmer.\n\nAvec pandas, chaque étape tient en une ou deux lignes (`groupby`, `merge`, `pivot_table`), mais les décisions restent les mêmes : quoi retirer, quoi comparer, quelles limites annoncer. C’est cette démarche qui fait la qualité d’une analyse.'
    },
    variant: 'Ajoute la température et cherche si la chaleur augmente la fréquentation le week-end. Calcule l’effet de la pluie par tranche (de 1 à 5 mm, plus de 5 mm). Sur ta machine, trace avec matplotlib les passages quotidiens de chaque compteur, en marquant les jours de pluie.'
  };

  // =====================================================================================
  // Projet 13 : Application de suivi de progression (JavaScript, expert)
  // =====================================================================================
  const SV_HTML = `<section id="suivi">
  <h2>Ma progression</h2>
  <div class="cartes">
    <article class="carte"><h3>XP total</h3><p id="xp"></p></article>
    <article class="carte"><h3>Niveau</h3><p id="niveau"></p></article>
    <article class="carte"><h3>Série</h3><p id="serie"></p></article>
    <article class="carte"><h3>Moyenne</h3><p id="moyenne"></p></article>
  </div>
  <h3>Objectif de la semaine</h3>
  <div id="objectif" class="jauge" role="progressbar" aria-label="Objectif de la semaine" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="remplissage"></div></div>
  <p id="objectif-texte"></p>
  <form id="ajout" novalidate>
    <h3>Ajouter une session</h3>
    <label for="date">Date</label>
    <input id="date" type="date" value="2026-10-28">
    <label for="minutes">Minutes</label>
    <input id="minutes" type="number" min="1" max="600">
    <label for="parcours">Parcours</label>
    <select id="parcours">
      <option value="py">Python</option>
      <option value="js">JavaScript</option>
      <option value="data">Data</option>
    </select>
    <button type="submit">Ajouter</button>
    <ul id="erreurs" role="alert"></ul>
  </form>
</section>
<style>
  .cartes { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .carte { border: 1px solid #dde1ee; border-radius: 8px; padding: 8px 12px; }
  .carte h3 { margin: 0; font-size: 0.85rem; font-weight: normal; color: #5c6178; }
  .carte p { margin: 4px 0 0; font-size: 1.2rem; font-weight: bold; }
  .jauge { height: 14px; background: #edf0f7; border-radius: 7px; overflow: hidden; }
  .remplissage { width: 0; height: 100%; background: #2f9e44; }
  #ajout { display: grid; gap: 4px; max-width: 320px; margin-top: 12px; }
  #erreurs { color: #c92a2a; margin: 0; padding-left: 18px; }
</style>`;
  const SV_DONNEES = `// Une session d’apprentissage : date (AAAA-MM-JJ), durée en minutes, XP gagnés, parcours.
const SESSIONS = [
  { date: '2026-10-12', minutes: 20, xp: 40, parcours: 'py' },
  { date: '2026-10-13', minutes: 35, xp: 70, parcours: 'py' },
  { date: '2026-10-14', minutes: 15, xp: 30, parcours: 'js' },
  { date: '2026-10-15', minutes: 25, xp: 50, parcours: 'js' },
  { date: '2026-10-19', minutes: 30, xp: 60, parcours: 'data' },
  { date: '2026-10-21', minutes: 20, xp: 40, parcours: 'py' },
  { date: '2026-10-22', minutes: 40, xp: 80, parcours: 'py' },
  { date: '2026-10-22', minutes: 10, xp: 20, parcours: 'js' },
  { date: '2026-10-23', minutes: 25, xp: 50, parcours: 'data' },
  { date: '2026-10-26', minutes: 30, xp: 60, parcours: 'js' },
  { date: '2026-10-27', minutes: 20, xp: 40, parcours: 'py' },
  { date: '2026-10-28', minutes: 15, xp: 30, parcours: 'py' },
];

const JOUR_MS = 24 * 60 * 60 * 1000;

function dateDepuisNumero(numero) {
  // Fournie : 20754 donne '2026-10-28' (nombre de jours depuis le 1er janvier 1970).
  return new Date(numero * JOUR_MS).toISOString().slice(0, 10);
}`;
  const SV_MODELE = `function numeroJour(date) {
  const [annee, mois, jour] = date.split('-').map(Number);
  return Date.UTC(annee, mois - 1, jour) / JOUR_MS;
}

function validerSession(session) {
  const erreurs = [];
  if (typeof session.date !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(session.date)) {
    erreurs.push('date : format AAAA-MM-JJ attendu.');
  }
  if (!Number.isInteger(session.minutes) || session.minutes < 1 || session.minutes > 600) {
    erreurs.push('minutes : entier entre 1 et 600.');
  }
  if (!Number.isInteger(session.xp) || session.xp < 0) {
    erreurs.push('xp : entier positif ou nul.');
  }
  return erreurs;
}`;
  const SV_MODELE_0 = `function numeroJour(date) {
  // À toi : '1970-01-02' donne 1. Découpe la date, utilise Date.UTC(annee, mois - 1, jour)
  // (les mois commencent à 0) et divise par JOUR_MS.
}

function validerSession(session) {
  // À toi : renvoie la liste des erreurs, dans cet ordre :
  // 'date : format AAAA-MM-JJ attendu.'   (vérifie le format avec une expression régulière)
  // 'minutes : entier entre 1 et 600.'
  // 'xp : entier positif ou nul.'
}`;
  const SV_XP = `function seuilNiveau(n) {
  // Fournie : XP nécessaires pour atteindre le niveau n (0, 100, 300, 600, 1000…).
  return 50 * n * (n - 1);
}

function xpTotal(sessions) {
  return sessions.reduce((total, session) => total + session.xp, 0);
}

function niveau(xp) {
  let n = 1;
  while (xp >= seuilNiveau(n + 1)) {
    n += 1;
  }
  return { niveau: n, xpDansNiveau: xp - seuilNiveau(n), xpPourSuivant: seuilNiveau(n + 1) - xp };
}`;
  const SV_XP_0 = `function seuilNiveau(n) {
  // Fournie : XP nécessaires pour atteindre le niveau n (0, 100, 300, 600, 1000…).
  return 50 * n * (n - 1);
}

function xpTotal(sessions) {
  // À toi : somme des XP de toutes les sessions
}

function niveau(xp) {
  // À toi : { niveau, xpDansNiveau (XP gagnés depuis le début du niveau), xpPourSuivant (XP manquants) }
}`;
  const SV_SERIES = `function joursActifs(sessions) {
  // Fournie : numéros des jours avec au moins une session, sans doublon, triés.
  return [...new Set(sessions.map((s) => numeroJour(s.date)))].sort((a, b) => a - b);
}

function serieActuelle(sessions, aujourdhui) {
  const jours = new Set(joursActifs(sessions));
  let jour = numeroJour(aujourdhui);
  if (!jours.has(jour)) jour -= 1;
  let serie = 0;
  while (jours.has(jour)) {
    serie += 1;
    jour -= 1;
  }
  return serie;
}

function meilleureSerie(sessions) {
  const jours = joursActifs(sessions);
  let meilleure = 0;
  let courante = 0;
  for (let i = 0; i < jours.length; i++) {
    courante = i > 0 && jours[i] === jours[i - 1] + 1 ? courante + 1 : 1;
    meilleure = Math.max(meilleure, courante);
  }
  return meilleure;
}`;
  const SV_SERIES_0 = `function joursActifs(sessions) {
  // Fournie : numéros des jours avec au moins une session, sans doublon, triés.
  return [...new Set(sessions.map((s) => numeroJour(s.date)))].sort((a, b) => a - b);
}

function serieActuelle(sessions, aujourdhui) {
  // À toi : nombre de jours consécutifs avec au moins une session, en remontant depuis aujourd’hui.
  // S’il n’y a pas encore de session aujourd’hui, la série d’hier compte encore.
}

function meilleureSerie(sessions) {
  // À toi : la plus longue suite de jours consécutifs avec au moins une session.
}`;
  const SV_SEMAINE = `function lundiDeLaSemaine(date) {
  // Fournie : numéro du lundi de la semaine de date. Le 1er janvier 1970 était un jeudi.
  const numero = numeroJour(date);
  return numero - ((numero + 3) % 7);
}

function minutesSemaine(sessions, aujourdhui) {
  const debut = lundiDeLaSemaine(aujourdhui);
  const fin = numeroJour(aujourdhui);
  return sessions
    .filter((s) => numeroJour(s.date) >= debut && numeroJour(s.date) <= fin)
    .reduce((total, s) => total + s.minutes, 0);
}

function objectifSemaine(sessions, aujourdhui, objectif) {
  const minutes = minutesSemaine(sessions, aujourdhui);
  return {
    minutes,
    objectif,
    pourcentage: Math.min(100, Math.round((minutes / objectif) * 100)),
    atteint: minutes >= objectif,
  };
}

function moyenneParJourActif(sessions) {
  const nombreJours = joursActifs(sessions).length;
  if (nombreJours === 0) return 0;
  const total = sessions.reduce((somme, s) => somme + s.minutes, 0);
  return Math.round(total / nombreJours);
}`;
  const SV_SEMAINE_0 = `function lundiDeLaSemaine(date) {
  // Fournie : numéro du lundi de la semaine de date. Le 1er janvier 1970 était un jeudi.
  const numero = numeroJour(date);
  return numero - ((numero + 3) % 7);
}

function minutesSemaine(sessions, aujourdhui) {
  // À toi : total des minutes des sessions entre le lundi de la semaine et aujourd’hui inclus
}

function objectifSemaine(sessions, aujourdhui, objectif) {
  // À toi : { minutes, objectif, pourcentage (arrondi, 100 au maximum), atteint (booléen) }
}

function moyenneParJourActif(sessions) {
  // À toi : total des minutes divisé par le nombre de jours actifs, arrondi (0 sans session)
}`;
  const SV_INTERFACE = `const AUJOURDHUI = '2026-10-28';
const OBJECTIF_MINUTES = 150;
let sessions = SESSIONS.slice();

function pluriel(nombre, mot) {
  return \`\${nombre} \${mot}\${nombre > 1 ? 's' : ''}\`;
}

function afficherTableau() {
  const xp = xpTotal(sessions);
  const n = niveau(xp);
  const objectif = objectifSemaine(sessions, AUJOURDHUI, OBJECTIF_MINUTES);
  document.querySelector('#xp').textContent = \`\${xp} XP\`;
  document.querySelector('#niveau').textContent = \`Niveau \${n.niveau} (\${n.xpPourSuivant} XP avant le niveau \${n.niveau + 1})\`;
  document.querySelector('#serie').textContent = pluriel(serieActuelle(sessions, AUJOURDHUI), 'jour');
  document.querySelector('#moyenne').textContent = \`\${moyenneParJourActif(sessions)} min par jour actif\`;
  const jauge = document.querySelector('#objectif');
  jauge.setAttribute('aria-valuenow', String(objectif.pourcentage));
  jauge.querySelector('.remplissage').style.width = \`\${objectif.pourcentage}%\`;
  document.querySelector('#objectif-texte').textContent = objectif.atteint
    ? \`Objectif atteint : \${objectif.minutes} / \${objectif.objectif} minutes\`
    : \`\${objectif.minutes} / \${objectif.objectif} minutes cette semaine\`;
}`;
  const SV_INTERFACE_0 = `const AUJOURDHUI = '2026-10-28';
const OBJECTIF_MINUTES = 150;
let sessions = SESSIONS.slice();

function pluriel(nombre, mot) {
  return \`\${nombre} \${mot}\${nombre > 1 ? 's' : ''}\`;
}

function afficherTableau() {
  // À toi : remplis la page à partir de sessions, AUJOURDHUI et OBJECTIF_MINUTES :
  // #xp            '570 XP'
  // #niveau        'Niveau 3 (30 XP avant le niveau 4)'
  // #serie         '3 jours' (utilise pluriel)
  // #moyenne       '26 min par jour actif'
  // #objectif      attribut aria-valuenow = pourcentage, et largeur de .remplissage = pourcentage en %
  // #objectif-texte '65 / 150 minutes cette semaine', ou 'Objectif atteint : 155 / 150 minutes'
}`;
  const SV_DEMARRER = 'afficherTableau();';
  const SV_FORMULAIRE = `const formulaire = document.querySelector('#ajout');
const listeErreurs = document.querySelector('#erreurs');

formulaire.addEventListener('submit', (evenement) => {
  evenement.preventDefault();
  const minutes = Number(document.querySelector('#minutes').value);
  const session = {
    date: document.querySelector('#date').value,
    minutes,
    xp: minutes * 2,
    parcours: document.querySelector('#parcours').value,
  };
  const erreurs = validerSession(session);
  listeErreurs.innerHTML = '';
  if (erreurs.length > 0) {
    for (const erreur of erreurs) {
      const li = document.createElement('li');
      li.textContent = erreur;
      listeErreurs.append(li);
    }
    return;
  }
  sessions.push(session);
  document.querySelector('#minutes').value = '';
  afficherTableau();
});`;
  const SV_FORMULAIRE_0 = `const formulaire = document.querySelector('#ajout');
const listeErreurs = document.querySelector('#erreurs');

// À toi : à l’envoi du formulaire (événement submit) :
// 1. evenement.preventDefault() EN PREMIER, sinon la page se recharge et tout est perdu
// 2. construis la session : date, minutes (nombre), xp = minutes * 2, parcours
// 3. vide listeErreurs ; si validerSession trouve des erreurs, ajoute un <li> par erreur et arrête-toi
// 4. sinon : ajoute la session à sessions, vide le champ #minutes et réaffiche le tableau`;

  const SV_S1 = js(SV_DONNEES, SV_MODELE);
  const SV_S2 = js(SV_DONNEES, SV_MODELE, SV_XP);
  const SV_S3 = js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES);
  const SV_S4 = js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE);
  const SV_S5 = js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE, SV_INTERFACE, SV_DEMARRER);
  const SV_S6 = js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE, SV_INTERFACE, SV_FORMULAIRE, SV_DEMARRER);
  const SV_PERSISTANCE = `// ----- Sur ta machine (étape 7) : date du jour et sauvegarde -----
const CLE_STOCKAGE = 'suivi-progression-sessions';

function dateDuJour() {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return \`\${d.getFullYear()}-\${mois}-\${jour}\`;
}

function chargerSessions() {
  try {
    const texte = localStorage.getItem(CLE_STOCKAGE);
    const donnees = texte ? JSON.parse(texte) : null;
    if (Array.isArray(donnees)) return donnees.filter((s) => validerSession(s).length === 0);
  } catch (erreur) {
    // Stockage indisponible ou données abîmées : on repart des données d’exemple.
  }
  return SESSIONS.slice();
}

function sauvegarderSessions() {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(sessions));
  } catch (erreur) {
    // Stockage indisponible : les sessions restent en mémoire.
  }
}`;
  const SV_FINAL = js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE, SV_PERSISTANCE,
    SV_INTERFACE.replace("const AUJOURDHUI = '2026-10-28';", 'const AUJOURDHUI = dateDuJour();').replace('let sessions = SESSIONS.slice();', 'let sessions = chargerSessions();'),
    SV_FORMULAIRE.replace('  sessions.push(session);\n', '  sessions.push(session);\n  sauvegarderSessions();\n'),
    SV_DEMARRER);
  const SV_TEXTE = (sel) => "document.querySelector('" + sel + "').textContent";

  const projetSuivi = {
    id: 'pj.suivi-progression',
    title: 'Application de suivi de progression',
    difficulty: 4,
    lang: 'javascript',
    summary: 'Une application complète de suivi d’apprentissage : modèle de données, calculs de dates fiables (séries, semaines), XP et niveaux, objectif hebdomadaire, interface et formulaire validé.',
    result: 'Un tableau de bord personnel qui affiche « 570 XP », « Niveau 3 (30 XP avant le niveau 4) », une série de « 3 jours », « 26 min par jour actif » et une jauge accessible de l’objectif de la semaine (« 65 / 150 minutes cette semaine »). Un formulaire ajoute une session, refuse les saisies invalides avec des messages précis et met tout à jour : après une session de 90 minutes, « Objectif atteint : 155 / 150 minutes ». Sur ta machine, les sessions sont sauvegardées et les calculs couverts par des tests automatiques.',
    skills: ['js.u5', 'js.u6', 'js.u7', 'js.u8', 'js.u9', 'js.u10', 'js.u14', 'js.u15'],
    steps: [
      {
        title: 'Étape 1 : le modèle de données et les dates',
        explain: 'Une session est un objet `{ date, minutes, xp, parcours }`, avec la date au format **AAAA-MM-JJ** : il se trie et se compare comme du texte, et il est sans ambiguïté (pas de confusion entre 03/04 et 04/03).\n\nPour calculer des séries de jours, il faut savoir que le 1er novembre suit le 31 octobre. Manipuler le texte des dates est un piège (mois de 28 à 31 jours, années bissextiles). On convertit donc chaque date en **numéro de jour** depuis le 1er janvier 1970 avec `Date.UTC`, qui travaille en temps universel : pas de décalage horaire ni de changement d’heure. Deux jours consécutifs ont des numéros consécutifs. On valide aussi chaque session avant de l’accepter.',
        ex: {
          type: 'code',
          prompt: 'Écris `numeroJour(date)` avec `Date.UTC` et `validerSession(session)`, qui renvoie la liste des erreurs (messages exacts dans les commentaires).',
          starter: js(SV_DONNEES, SV_MODELE_0),
          solution: SV_S1,
          tests: [
            { code: "assertEqual(numeroJour('1970-01-01'), 0);\nassertEqual(numeroJour('1970-01-02'), 1);\nassertEqual(dateDepuisNumero(numeroJour('2026-10-28')), '2026-10-28');", label: 'numeroJour compte les jours depuis le 1er janvier 1970' },
            { code: "assertEqual(numeroJour('2026-03-01') - numeroJour('2026-02-28'), 1);\nassertEqual(numeroJour('2024-03-01') - numeroJour('2024-02-28'), 2);\nassertEqual(dateDepuisNumero(numeroJour('2026-10-28') + 4), '2026-11-01');", label: 'Fins de mois et années bissextiles sont gérées' },
            { code: "assertEqual(validerSession({ date: '2026-10-28', minutes: 20, xp: 40 }), []);", label: 'Une session correcte n’a aucune erreur' },
            { code: "assertEqual(validerSession({ date: '28/10/2026', minutes: 0, xp: -5 }), ['date : format AAAA-MM-JJ attendu.', 'minutes : entier entre 1 et 600.', 'xp : entier positif ou nul.']);", label: 'Toutes les erreurs sont listées, dans l’ordre' },
            { code: "assertEqual(validerSession({ date: '2026-10-28', minutes: 12.5, xp: 25 }), ['minutes : entier entre 1 et 600.']);", label: '12.5 minutes est refusé (entier attendu)' }
          ],
          hint: '`date.split(\'-\').map(Number)` donne `[2026, 10, 28]`. Pour le format, l’expression régulière `/^\\d{4}-\\d{2}-\\d{2}$/` et sa méthode `test`. `Number.isInteger` refuse 12.5 et les textes.',
          explain: '`Date.UTC` renvoie des millisecondes depuis 1970, en temps universel : la division par `JOUR_MS` tombe juste. `Number.isInteger` vérifie à la fois le type et l’absence de décimales, en une seule condition.'
        }
      },
      {
        title: 'Étape 2 : XP et niveaux',
        explain: 'Chaque session rapporte des **XP** (points d’expérience). Le **niveau** se déduit du total : il faut 100 XP pour le niveau 2, 300 pour le niveau 3, 600 pour le niveau 4… Chaque niveau demande 100 XP de plus que le précédent, ce qui garde une progression motivante sans être interminable. La fonction fournie `seuilNiveau(n)` donne ces seuils.\n\n`niveau(xp)` renvoie plus qu’un nombre : un **objet** avec les XP gagnés dans le niveau en cours et ceux qui manquent pour le suivant. C’est ce dont l’interface aura besoin pour afficher « 30 XP avant le niveau 4 ».',
        ex: {
          type: 'code',
          prompt: 'Écris `xpTotal(sessions)` avec `reduce`, puis `niveau(xp)` qui renvoie `{ niveau, xpDansNiveau, xpPourSuivant }` à l’aide de `seuilNiveau`.',
          starter: js(SV_DONNEES, SV_MODELE, SV_XP_0),
          solution: SV_S2,
          tests: [
            { code: 'assertEqual(xpTotal(SESSIONS), 570);\nassertEqual(xpTotal([]), 0);', label: 'Total des XP : 570 (0 sans session)' },
            { code: 'assertEqual(niveau(0), { niveau: 1, xpDansNiveau: 0, xpPourSuivant: 100 });', label: 'Avec 0 XP : niveau 1, 100 XP avant le niveau 2' },
            { code: 'assertEqual(niveau(99), { niveau: 1, xpDansNiveau: 99, xpPourSuivant: 1 });\nassertEqual(niveau(100), { niveau: 2, xpDansNiveau: 0, xpPourSuivant: 200 });', label: 'Le passage de niveau se fait pile au seuil' },
            { code: 'assertEqual(niveau(570), { niveau: 3, xpDansNiveau: 270, xpPourSuivant: 30 });', label: 'Avec 570 XP : niveau 3, 30 XP avant le niveau 4' }
          ],
          hint: 'Pars de `n = 1` et augmente `n` tant que `xp >= seuilNiveau(n + 1)`. Les deux autres valeurs se calculent ensuite avec `seuilNiveau(n)` et `seuilNiveau(n + 1)`.',
          explain: 'La boucle s’arrête au premier seuil non atteint : `n` est alors le niveau courant. Les tests aux bornes (99 et 100) vérifient le cas le plus propice aux erreurs, `>` au lieu de `>=`.'
        }
      },
      {
        title: 'Étape 3 : la série de jours',
        explain: 'La **série** compte les jours consécutifs avec au moins une session. Grâce aux numéros de jours, « consécutif » signifie simplement « numéro + 1 ». La fonction fournie `joursActifs` donne les jours actifs, triés et sans doublon (deux sessions le même jour comptent pour un jour).\n\nUne règle de confort importante : **si tu n’as pas encore travaillé aujourd’hui, la série d’hier n’est pas perdue**, la journée n’est pas finie. On part donc d’aujourd’hui, ou d’hier si aujourd’hui est vide, et on remonte tant que les jours sont actifs. Un `Set` rend le test « ce jour est-il actif ? » instantané.',
        ex: {
          type: 'code',
          prompt: 'Écris `serieActuelle(sessions, aujourdhui)` (avec la règle de la journée en cours) et `meilleureSerie(sessions)`.',
          starter: js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES_0),
          solution: SV_S3,
          tests: [
            { code: "assertEqual(serieActuelle(SESSIONS, '2026-10-28'), 3);", label: 'Le 28 octobre : série de 3 jours (26, 27, 28)' },
            { code: "assertEqual(serieActuelle(SESSIONS, '2026-10-29'), 3);", label: 'Le 29 sans session encore : la série d’hier compte toujours' },
            { code: "assertEqual(serieActuelle(SESSIONS, '2026-10-30'), 0);\nassertEqual(serieActuelle([], '2026-10-28'), 0);", label: 'Deux jours sans session : série à 0' },
            { code: "const s = [{ date: '2026-09-30', minutes: 10, xp: 20 }, { date: '2026-10-01', minutes: 10, xp: 20 }];\nassertEqual(serieActuelle(s, '2026-10-01'), 2);", label: 'Une série continue d’un mois à l’autre' },
            { code: 'assertEqual(meilleureSerie(SESSIONS), 4);\nassertEqual(meilleureSerie([]), 0);', label: 'Meilleure série : 4 jours (du 12 au 15 octobre)' }
          ],
          hint: 'Crée `const jours = new Set(joursActifs(sessions))`. Pour `meilleureSerie`, parcours les jours triés : la série courante continue si le jour vaut le précédent + 1, sinon elle repart à 1.',
          explain: 'Les numéros de jours transforment un problème de calendrier en simple arithmétique : le passage du 30 septembre au 1er octobre n’a rien de particulier. `meilleureSerie` ne parcourt la liste qu’une fois, en gardant le maximum rencontré.'
        }
      },
      {
        title: 'Étape 4 : l’objectif hebdomadaire et la moyenne',
        explain: 'Un **objectif hebdomadaire** (150 minutes par semaine) motive davantage qu’un objectif quotidien rigide. La semaine commence le **lundi** : la fonction fournie `lundiDeLaSemaine` le calcule, sachant que le 1er janvier 1970 était un jeudi.\n\n`objectifSemaine` renvoie un objet prêt pour l’affichage : minutes faites, pourcentage **plafonné à 100** (une jauge à 130 % déborderait) et un booléen `atteint`. Enfin, la **moyenne par jour actif** (minutes totales divisées par le nombre de jours travaillés) donne une idée de la durée habituelle d’une session, sans pénaliser les jours de repos.',
        ex: {
          type: 'code',
          prompt: 'Écris `minutesSemaine(sessions, aujourdhui)`, `objectifSemaine(sessions, aujourdhui, objectif)` et `moyenneParJourActif(sessions)`.',
          starter: js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE_0),
          solution: SV_S4,
          tests: [
            { code: "assertEqual(minutesSemaine(SESSIONS, '2026-10-28'), 65);\nassertEqual(minutesSemaine(SESSIONS, '2026-10-23'), 125);", label: 'Minutes de la semaine en cours (depuis le lundi)' },
            { code: "assertEqual(objectifSemaine(SESSIONS, '2026-10-28', 150), { minutes: 65, objectif: 150, pourcentage: 43, atteint: false });", label: 'Objectif à 43 % le mercredi 28 octobre' },
            { code: "assertEqual(objectifSemaine(SESSIONS, '2026-10-23', 100), { minutes: 125, objectif: 100, pourcentage: 100, atteint: true });", label: 'Objectif dépassé : pourcentage plafonné à 100' },
            { code: 'assertEqual(moyenneParJourActif(SESSIONS), 26);\nassertEqual(moyenneParJourActif([]), 0);', label: 'Moyenne : 26 minutes par jour actif (0 sans session)' }
          ],
          hint: 'Avec `debut = lundiDeLaSemaine(aujourdhui)` et `fin = numeroJour(aujourdhui)`, garde les sessions dont le numéro de jour est entre les deux, puis additionne les minutes. `Math.min(100, ...)` plafonne.',
          explain: 'Les sessions après « aujourd’hui » sont exclues : on mesure la semaine écoulée. La moyenne divise par le nombre de jours actifs et non de sessions : deux sessions le même jour forment une seule journée de travail.'
        }
      },
      {
        title: 'Étape 5 : l’interface',
        explain: 'Tous les calculs sont prêts et testés : l’interface n’a plus qu’à les **afficher**. `afficherTableau` lit l’état (`sessions`) et remplit les cartes. La date du jour est fixée à `AUJOURDHUI` pour que l’affichage soit vérifiable ; sur ta machine, elle viendra de l’horloge.\n\nLa jauge de l’objectif est **accessible** : l’élément a `role="progressbar"`, et on met à jour son attribut `aria-valuenow`, que les lecteurs d’écran annoncent (« 43 % »). La partie visuelle est une barre intérieure dont la largeur suit le pourcentage. Le texte sous la jauge change quand l’objectif est atteint.',
        ex: {
          type: 'code',
          dom: true,
          html: SV_HTML,
          prompt: 'Complète `afficherTableau()` : les quatre cartes, la jauge (`aria-valuenow` et largeur de `.remplissage`) et le texte de l’objectif, aux formats indiqués dans le commentaire.',
          starter: js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE, SV_INTERFACE_0, SV_DEMARRER),
          solution: SV_S5,
          tests: [
            { code: 'assertEqual(' + SV_TEXTE('#xp') + ", '570 XP');\nassertEqual(" + SV_TEXTE('#niveau') + ", 'Niveau 3 (30 XP avant le niveau 4)');", label: 'Cartes XP et niveau' },
            { code: 'assertEqual(' + SV_TEXTE('#serie') + ", '3 jours');\nassertEqual(" + SV_TEXTE('#moyenne') + ", '26 min par jour actif');", label: 'Cartes série et moyenne' },
            { code: "const jauge = document.querySelector('#objectif');\nassertEqual(jauge.getAttribute('aria-valuenow'), '43');\nassertEqual(jauge.querySelector('.remplissage').style.width, '43%');", label: 'La jauge indique 43 % (attribut aria et largeur)' },
            { code: 'assertEqual(' + SV_TEXTE('#objectif-texte') + ", '65 / 150 minutes cette semaine');", label: 'Le texte de l’objectif' },
            { code: "sessions = [];\nafficherTableau();\nassertEqual(" + SV_TEXTE('#serie') + ", '0 jour');\nassertEqual(" + SV_TEXTE('#xp') + ", '0 XP');", label: 'Sans session : « 0 jour » et « 0 XP »' }
          ],
          hint: 'Calcule d’abord toutes les valeurs (`xpTotal`, `niveau`, `objectifSemaine`…), puis remplis chaque élément avec `textContent`. L’attribut s’écrit avec `setAttribute(\'aria-valuenow\', ...)`.',
          explain: '`afficherTableau` ne contient aucun calcul métier : elle ne fait qu’assembler des résultats testés. Le dernier test le prouve : en changeant l’état puis en réaffichant, toute la page suit.'
        }
      },
      {
        title: 'Étape 6 : ajouter une session',
        explain: 'Le formulaire boucle la boucle : **saisie, validation, nouvel état, affichage**. On écoute l’événement `submit` du formulaire (et non le clic du bouton) : il fonctionne aussi avec la touche Entrée. **Première ligne obligatoire** : `evenement.preventDefault()`, sinon le navigateur envoie le formulaire et recharge la page.\n\nLe formulaire a l’attribut `novalidate` : c’est notre propre `validerSession` qui vérifie la saisie, avec les mêmes règles partout, et ses messages s’affichent dans `#erreurs` (`role="alert"`). Un champ nombre vide donne `Number(\'\')`, soit 0 : il est donc refusé. Chaque minute rapporte 2 XP.',
        ex: {
          type: 'code',
          dom: true,
          html: SV_HTML,
          prompt: 'Ajoute l’écouteur `submit` du formulaire : `preventDefault`, construction de la session (`xp = minutes * 2`), affichage des erreurs dans `#erreurs`, ou ajout de la session et mise à jour du tableau.',
          starter: js(SV_DONNEES, SV_MODELE, SV_XP, SV_SERIES, SV_SEMAINE, SV_INTERFACE, SV_FORMULAIRE_0, SV_DEMARRER),
          solution: SV_S6,
          tests: [
            { code: "document.querySelector('#minutes').value = '0';\ndocument.querySelector('#ajout').requestSubmit();\nassertEqual([...document.querySelectorAll('#erreurs li')].map((li) => li.textContent), ['minutes : entier entre 1 et 600.']);\nassertEqual(sessions.length, 12);", label: '0 minute est refusé avec un message, sans rien ajouter' },
            { code: "document.querySelector('#date').value = '2026-10-28';\ndocument.querySelector('#minutes').value = '90';\ndocument.querySelector('#parcours').value = 'data';\ndocument.querySelector('#ajout').requestSubmit();\nassertEqual(sessions.length, 13);\nassertEqual(sessions[12], { date: '2026-10-28', minutes: 90, xp: 180, parcours: 'data' });\nassertEqual(document.querySelectorAll('#erreurs li').length, 0);", label: 'Une session de 90 minutes est ajoutée (180 XP)' },
            { code: 'assertEqual(' + SV_TEXTE('#xp') + ", '750 XP');\nassertEqual(" + SV_TEXTE('#niveau') + ", 'Niveau 4 (250 XP avant le niveau 5)');", label: 'Le tableau est mis à jour : 750 XP, niveau 4' },
            { code: 'assertEqual(' + SV_TEXTE('#objectif-texte') + ", 'Objectif atteint : 155 / 150 minutes');\nassertEqual(document.querySelector('#objectif').getAttribute('aria-valuenow'), '100');\nassertEqual(document.querySelector('#minutes').value, '');", label: 'Objectif atteint, jauge à 100 %, champ des minutes vidé' }
          ],
          hint: 'Commence l’écouteur par `evenement.preventDefault();`. Construis la session, appelle `validerSession`, et utilise `return` pour t’arrêter s’il y a des erreurs.',
          explain: 'La même fonction `validerSession` protège les données, qu’elles viennent du formulaire ou, plus tard, d’un fichier. Après l’ajout, un seul appel à `afficherTableau` met à jour XP, niveau, série, moyenne et jauge.'
        }
      },
      {
        title: 'Étape 7 : sauvegarder et tester (sur ta machine)',
        explain: '**Cette étape se fait sur ton ordinateur**, dans un vrai projet. Trois améliorations. **La date du jour** : remplace la date fixe par une fonction qui lit l’heure **locale** (`getFullYear`, `getMonth() + 1`, `getDate`, complétés à deux chiffres) ; `toISOString` donnerait la date UTC, fausse le soir. **La sauvegarde** : après chaque ajout, `localStorage.setItem(cle, JSON.stringify(sessions))`, et au chargement `JSON.parse` dans un `try`, en ne gardant que les sessions valides. **Les tests** : place les fonctions de calcul dans un module `progression.js` exporté, et écris des tests avec le module intégré `node:test`, lancés par `node --test`. La solution du projet contient le code de la date et de la sauvegarde.',
        checklist: [
          'AUJOURDHUI vient de la date locale de l’ordinateur, et la série est juste après 22 h',
          'Une session ajoutée est toujours là après un rechargement de la page',
          'Des données abîmées dans localStorage ne font pas planter la page (retour aux données d’exemple)',
          'Les calculs sont dans progression.js, séparés de l’interface',
          'node --test lance au moins un test par fonction de calcul (numeroJour, niveau, serieActuelle, objectifSemaine), tous réussis'
        ]
      }
    ],
    solution: {
      code: '/* Page HTML attendue (dans index.html, avant <script src="suivi.js"></script>) :\n' + SV_HTML.replace(/\n<style>[\s\S]*$/, '') + '\n*/\n\n' + SV_FINAL,
      explain: 'L’application est organisée comme un logiciel professionnel. Un **modèle** validé (`validerSession`). Des **calculs purs** sur des numéros de jours (`numeroJour`, `serieActuelle`, `objectifSemaine`…), qui éliminent les pièges du calendrier et se testent sans navigateur. Une **interface** qui ne fait qu’afficher l’état. Une **persistance** isolée dans deux fonctions qui tolèrent l’absence de stockage.\n\nLes choix de conception sont justifiés par l’usage : semaine du lundi au dimanche, série préservée pendant la journée en cours, pourcentage plafonné, jauge accessible. Pour aller vers une vraie application multi-appareils, il faudrait remplacer `localStorage` par une API (projet « API simple ») et des comptes utilisateurs.'
    },
    variant: 'Ajoute un historique des 7 derniers jours sous forme de barres verticales (minutes par jour). Affiche les XP par parcours (Python, JavaScript, Data) avec un regroupement comme dans le tableau de bord. Ajoute des badges débloqués (première série de 7 jours, 1000 XP) et une notification quand un badge est obtenu. Permets de changer l’objectif hebdomadaire et sauvegarde-le aussi.'
  };

  CQ.addProjects([projetNotes, projetTableauDeBord, projetApi, projetMl, projetDonnees, projetSuivi]);
})();
