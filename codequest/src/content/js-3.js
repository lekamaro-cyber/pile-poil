// Parcours JavaScript, chapitre 3 : la page web (js.u8 à js.u10).
// Les exercices de code de ce chapitre tournent dans une petite page HTML (dom: true).
// Les autres exercices placent le code DOM dans des fonctions non appelées : il reste exécutable sans page.
CQ.addChapter('js', {
  id: 'js.c3',
  title: 'La page web',
  units: [
    // ------------------------------------------------------------------ js.u8
    {
      id: 'js.u8',
      title: 'DOM',
      summary: 'Lire et modifier la page HTML depuis JavaScript.',
      requires: ['web.u2'],
      lessons: [
        {
          id: 'js.u8.l1',
          title: 'Sélectionner et modifier la page',
          minutes: 8,
          objective: "Tu sais sélectionner un élément de la page, modifier son texte et ses classes, et créer de nouveaux éléments.",
          explain:
            "Le navigateur transforme le HTML en un arbre d'objets : le **DOM**. JavaScript y accède par l'objet `document`.\n\n" +
            "- `document.querySelector('#score')` renvoie le premier élément qui correspond au sélecteur CSS, ou `null` s'il n'y en a aucun. `querySelectorAll('li')` les renvoie tous, dans une liste parcourable avec `for...of`.\n" +
            "- `el.textContent = 'texte'` remplace le texte. `innerHTML` interprète du HTML : ne l'utilise jamais avec un texte saisi par un utilisateur, qui pourrait y glisser du code (faille XSS).\n" +
            "- `el.classList.add('actif')`, `remove` et `toggle` gèrent les classes CSS : le style reste dans la feuille CSS.\n" +
            "- `document.createElement('li')` crée un élément, `parent.append(el)` l'insère à la fin du parent.\n\n" +
            "Les exercices de code de cette unité tournent dans une petite page HTML : ton code et les tests y ont accès à `document`. Les autres exercices de JavaScript tournent sans page, où `document` n'existe pas.",
          example: {
            code: `const titre = document.querySelector('h1');
titre.textContent = 'Mes notes (3)';
const liste = document.querySelector('#notes');
for (const texte of ['Courses', 'Projet IA', 'Sport']) {
  const li = document.createElement('li');
  li.textContent = texte;
  liste.append(li);
}
liste.querySelector('li').classList.add('important');
console.log(document.querySelectorAll('#notes li').length);`,
            run: false,
            notes: [
              { line: 1, text: "Un sélecteur CSS, comme dans une feuille de style : ici la première balise `h1` de la page." },
              { line: 5, text: "`createElement` crée la balise en mémoire ; elle n'apparaît qu'après `append`." },
              { line: 6, text: "`textContent` insère du texte brut : même un `<b>` saisi par l'utilisateur s'afficherait tel quel." },
              { line: 9, text: "`querySelector` marche aussi depuis un élément : il cherche alors seulement à l'intérieur." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "Un utilisateur tape un commentaire, rangé dans la variable `saisie`. Quelle ligne l'affiche sans risque dans l'élément `zone` ?",
              choices: [
                '`zone.textContent = saisie;`',
                '`zone.innerHTML = saisie;`',
                "`zone.innerHTML = '<p>' + saisie + '</p>';`",
                '`document.write(saisie);`'
              ],
              answer: 0,
              why: {
                1: "`innerHTML` interprète la saisie comme du HTML : quelqu'un peut y glisser une balise qui exécute du code (faille XSS).",
                2: "Entourer la saisie d'un paragraphe ne change rien : elle est toujours interprétée comme du HTML.",
                3: "`document.write` est une méthode ancienne qui écrit du HTML brut dans le document : même risque, et elle peut effacer la page."
              },
              hint: "Une seule de ces façons traite la saisie comme du texte pur.",
              explain: "`textContent` insère la saisie comme du texte : un `<script>` tapé par l'utilisateur s'affiche tel quel au lieu de s'exécuter. Garde `innerHTML` pour du HTML que tu écris toi-même."
            },
            {
              type: 'bug',
              prompt: "`afficherScore` devrait écrire le score dans `<span id=\"score\">`, mais elle plante avec `TypeError: Cannot set properties of null`. Clique sur la ligne fautive.",
              code: `function afficherScore(valeur) {
  const zone = document.querySelector('score');
  zone.textContent = \`Score : \${valeur}\`;
}`,
              bugLine: 2,
              why: "`querySelector('score')` cherche une balise `<score>`, qui n'existe pas : il renvoie `null`, et la ligne 3 essaie d'écrire dans `null`.",
              fixes: [
                "  const zone = document.querySelector('#score');",
                "  const zone = document.querySelector('.score');",
                "  const zone = document.createElement('score');"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Le point vise une **classe** `score`, or l'élément porte un **id** `score`.",
                2: "`createElement` fabrique un nouvel élément hors de la page : le texte ne s'afficherait nulle part."
              },
              hint: "Un sélecteur d'id commence par un caractère particulier, comme en CSS.",
              explain: "Avec `#score`, le sélecteur vise l'id. Retiens le réflexe : « Cannot set properties of null » signifie presque toujours qu'un `querySelector` n'a rien trouvé."
            }
          ],
          challenge: {
            type: 'code',
            dom: true,
            prompt: "Affiche le classement des modèles dans `#classement`, **du meilleur au moins bon** : un `li` par modèle, au format `alpha : 91`. Ajoute la classe `faible` aux `li` dont le score est sous 80. Enfin, écris `3 modèles, meilleur : alpha` dans `#resume`.",
            html: `<h2>Classement</h2>
<ol id="classement"></ol>
<p id="resume"></p>`,
            starter: `const resultats = [
  { modele: 'alpha', score: 91 },
  { modele: 'beta', score: 78 },
  { modele: 'gamma', score: 85 },
];
// 1. Trie une copie des résultats, du meilleur au moins bon
// 2. Pour chaque résultat, ajoute un li dans #classement
// 3. Remplis #resume
`,
            solution: `const resultats = [
  { modele: 'alpha', score: 91 },
  { modele: 'beta', score: 78 },
  { modele: 'gamma', score: 85 },
];
const tries = [...resultats].sort((a, b) => b.score - a.score);
const liste = document.querySelector('#classement');
for (const r of tries) {
  const li = document.createElement('li');
  li.textContent = \`\${r.modele} : \${r.score}\`;
  if (r.score < 80) {
    li.classList.add('faible');
  }
  liste.append(li);
}
document.querySelector('#resume').textContent = \`\${resultats.length} modèles, meilleur : \${tries[0].modele}\`;
`,
            tests: [
              { code: "assertEqual(document.querySelectorAll('#classement li').length, 3);", label: '3 éléments li dans #classement' },
              { code: "const textes = [...document.querySelectorAll('#classement li')].map(li => li.textContent);\nassertEqual(textes, ['alpha : 91', 'gamma : 85', 'beta : 78']);", label: 'li triés du meilleur au moins bon, au format « alpha : 91 »' },
              { code: "const faibles = document.querySelectorAll('#classement li.faible');\nassertEqual(faibles.length, 1);\nassertEqual(faibles[0].textContent, 'beta : 78');", label: 'seul beta a la classe faible' },
              { code: "assertEqual(document.querySelector('#resume').textContent, '3 modèles, meilleur : alpha');", label: 'le résumé est correct' }
            ],
            hint: "Reprends le tri de l'unité 7 sur une copie, puis la boucle `createElement` / `textContent` / `append` de l'exemple.",
            explain: "Le tri se fait sur les données, avant de toucher à la page : le DOM ne sert qu'à afficher. La classe `faible` laisse le style à la feuille CSS, et `tries[0]` donne le meilleur modèle."
          },
          recap: [
            "`querySelector` renvoie le premier élément ou `null` ; `querySelectorAll` les renvoie tous.",
            "`textContent` pour du texte, jamais `innerHTML` avec une saisie utilisateur.",
            "`classList.add`, `remove`, `toggle` pour les classes CSS.",
            "`createElement` crée, `append` insère dans la page."
          ],
          check: {
            type: 'fill',
            prompt: "Complète `ajouterNote` : elle crée un `li` avec le texte, lui ajoute la classe `important` si besoin, puis l'insère dans la liste `<ul id=\"notes\">`.",
            code: `function ajouterNote(texte, importante) {
  const li = document.___('li');
  li.___ = texte;
  if (importante) {
    li.classList.___('important');
  }
  document.querySelector('___').append(li);
}`,
            blanks: [
              {
                answers: ['createElement'],
                options: ['createElement', 'querySelector', 'append', 'newElement'],
                why: {
                  querySelector: "`querySelector` cherche un élément existant ; il n'en crée pas.",
                  append: "`append` insère un élément, il ne le crée pas.",
                  newElement: "Cette méthode n'existe pas : c'est `createElement`."
                }
              },
              {
                answers: ['textContent'],
                options: ['textContent', 'innerHTML', 'value', 'text'],
                why: {
                  innerHTML: "Fonctionnerait, mais interpréterait le texte comme du HTML : risque XSS si la note vient d'un utilisateur.",
                  value: "`value` est le contenu d'un champ de formulaire, pas d'un `li`.",
                  text: "Un `li` n'a pas de propriété `text` : c'est `textContent`."
                }
              },
              {
                answers: ['add'],
                options: ['add', 'push', 'toggle', 'append'],
                why: {
                  push: "`classList` n'est pas un tableau : on ajoute une classe avec `add`.",
                  toggle: "`toggle` retirerait la classe si elle était déjà là : ici, on veut l'ajouter à coup sûr.",
                  append: "`append` insère des éléments dans la page, pas des classes."
                }
              },
              {
                answers: ['#notes', 'ul#notes'],
                why: {
                  notes: "Sans `#`, le sélecteur cherche une balise `<notes>`. Pour un id, écris `#notes`.",
                  '.notes': "Le point sélectionne une classe ; un id se sélectionne avec `#`."
                }
              }
            ],
            hint: "Le dernier trou est un sélecteur CSS qui vise un id.",
            explain: "`createElement` fabrique le `li`, `textContent` y range le texte sans risque, `classList.add` ajoute la classe, et `querySelector('#notes')` trouve la liste où l'insérer avec `append`."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u9
    {
      id: 'js.u9',
      title: 'Événements',
      summary: 'Réagir aux clics et aux saisies, et écouter toute une liste avec un seul écouteur.',
      lessons: [
        {
          id: 'js.u9.l1',
          title: 'Écouter les événements',
          minutes: 8,
          objective: "Tu sais réagir à un clic ou à une saisie avec `addEventListener`, utiliser l'objet événement et déléguer l'écoute à un parent.",
          explain:
            "`el.addEventListener('click', fonction)` demande au navigateur d'appeler `fonction` à chaque clic. Tu passes la fonction elle-même, **sans parenthèses** : `addEventListener('click', valider())` appellerait `valider` tout de suite et enregistrerait son résultat.\n\n" +
            "La fonction reçoit un objet **événement** : `event.target` est l'élément d'origine (le bouton cliqué, le champ modifié), `event.key` la touche pressée pour `keydown`.\n\n" +
            "Événements courants : `click`, `input` (à chaque modification d'un champ), `change`, `keydown`, `submit` (formulaires, unité suivante).\n\n" +
            "**Propagation** : un événement « remonte » de l'élément cliqué vers ses parents, jusqu'à la page. On en profite pour la **délégation** : un seul écouteur sur la liste `ul` suffit pour tous ses `li`, même ceux ajoutés plus tard. Dans l'écouteur, `event.target.closest('li')` retrouve le `li` concerné, ou `null` si le clic est tombé ailleurs. `event.stopPropagation()` arrête la remontée ; sers-t'en rarement.",
          example: {
            code: `const compteur = document.querySelector('#compteur');
let likes = 0;
document.querySelector('#like').addEventListener('click', () => {
  likes += 1;
  compteur.textContent = \`\${likes} j'aime\`;
});
document.querySelector('#notes').addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (li) {
    li.classList.toggle('faite');
  }
});`,
            run: false,
            notes: [
              { line: 3, text: "La fonction fléchée est passée sans être appelée : le navigateur l'appellera à chaque clic." },
              { line: 4, text: "`likes` est déclaré hors de l'écouteur : sa valeur est conservée d'un clic à l'autre (closure)." },
              { line: 7, text: "Délégation : un seul écouteur sur la liste gère les clics de tous ses `li`, même futurs." },
              { line: 8, text: "`closest('li')` remonte depuis l'élément cliqué jusqu'au `li` le plus proche." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets dans l'ordre la fonction `brancherRecherche` : à chaque saisie dans le champ de recherche, elle affiche le nombre de caractères tapés dans la zone `info`.",
              lines: [
                'function brancherRecherche(champ, info) {',
                "  champ.addEventListener('input', (event) => {",
                '    const texte = event.target.value;',
                '    info.textContent = `${texte.length} caractères`;',
                '  });',
                '}'
              ],
              hint: "L'écouteur est à l'intérieur de la fonction, et le texte doit être lu avant d'être compté.",
              explain: "La fonction branche un écouteur `input` sur le champ. À chaque frappe, l'écouteur lit la valeur via `event.target` (le champ lui-même), puis met à jour la zone d'information."
            },
            {
              type: 'logic',
              prompt: "Le bouton est dans la carte, elle-même dans la page. L'utilisateur clique **une fois** sur le bouton. Combien de lignes s'affichent dans la console ?",
              code: `const carte = document.querySelector('.carte');
const bouton = carte.querySelector('button');
bouton.addEventListener('click', () => console.log('bouton'));
carte.addEventListener('click', () => console.log('carte'));
document.body.addEventListener('click', () => console.log('page'));
bouton.addEventListener('click', () => console.log('bouton encore'));`,
              run: false,
              answer: '4',
              accept: ['quatre'],
              mistakes: [
                { answer: '1', why: "L'événement ne s'arrête pas au bouton : il remonte vers la carte puis la page, qui ont chacune un écouteur." },
                { answer: '3', why: "Un élément peut avoir plusieurs écouteurs pour le même événement : le bouton en a deux, et les deux s'exécutent." },
                { answer: '2', why: "Il faut compter les deux écouteurs du bouton **et** ceux des parents, atteints par la remontée." }
              ],
              hint: "Compte les écouteurs du bouton, puis suis la remontée vers les parents.",
              explain: "Le clic déclenche les deux écouteurs du bouton (dans l'ordre d'ajout : `bouton`, `bouton encore`), puis remonte vers la carte et enfin la page : 4 lignes."
            }
          ],
          challenge: {
            type: 'code',
            dom: true,
            prompt: "Panier : un article coûte 12 €. Branche les boutons : `+` augmente la quantité, `-` la diminue **sans descendre sous 1**. Après chaque clic, appelle `afficher()` pour mettre à jour `#valeur` et `#total`.",
            html: `<div class="quantite">
  <button id="moins">-</button>
  <span id="valeur">1</span>
  <button id="plus">+</button>
</div>
<p id="total">Total : 12 €</p>`,
            starter: `const PRIX = 12;
let quantite = 1;
const valeur = document.querySelector('#valeur');
const total = document.querySelector('#total');

function afficher() {
  valeur.textContent = quantite;
  total.textContent = \`Total : \${quantite * PRIX} €\`;
}

// branche les boutons #plus et #moins ici
`,
            solution: `const PRIX = 12;
let quantite = 1;
const valeur = document.querySelector('#valeur');
const total = document.querySelector('#total');

function afficher() {
  valeur.textContent = quantite;
  total.textContent = \`Total : \${quantite * PRIX} €\`;
}

document.querySelector('#plus').addEventListener('click', () => {
  quantite += 1;
  afficher();
});
document.querySelector('#moins').addEventListener('click', () => {
  if (quantite > 1) {
    quantite -= 1;
  }
  afficher();
});
`,
            tests: [
              { code: "const plus = document.querySelector('#plus');\nplus.click();\nplus.click();\nassertEqual(document.querySelector('#valeur').textContent, '3');", label: 'deux clics sur + : la quantité passe à 3' },
              { code: "assertEqual(document.querySelector('#total').textContent, 'Total : 36 €');", label: 'le total suit : 36 €' },
              { code: "const moins = document.querySelector('#moins');\nfor (let i = 0; i < 5; i++) {\n  moins.click();\n}\nassertEqual(document.querySelector('#valeur').textContent, '1');", label: 'cinq clics sur - : la quantité ne descend pas sous 1' },
              { code: "assertEqual(document.querySelector('#total').textContent, 'Total : 12 €');", label: 'le total revient à 12 €' }
            ],
            hint: "Un écouteur `click` par bouton. Dans celui de `-`, ne diminue que si la quantité est supérieure à 1.",
            explain: "Chaque écouteur modifie la variable `quantite`, puis délègue l'affichage à `afficher()`. La donnée vit dans JavaScript, la page ne fait que l'afficher : c'est le principe que tu développeras dans le projet de l'unité 16."
          },
          recap: [
            "`addEventListener('click', f)` : passe la fonction sans l'appeler.",
            "`event.target` est l'élément d'origine de l'événement.",
            "Les événements remontent vers les parents : c'est la propagation.",
            "Délégation : un écouteur sur le parent et `event.target.closest(...)`."
          ],
          check: {
            type: 'qcm',
            prompt: "Les `li` d'une liste de notes sont ajoutés au fil de l'utilisation, après le chargement de la page. Quelle approche réagit au clic sur n'importe quel `li`, y compris les nouveaux ?",
            choices: [
              "Un seul écouteur `click` sur le `ul`, qui retrouve le `li` avec `event.target.closest('li')`",
              "Au chargement, une boucle sur `document.querySelectorAll('li')` qui ajoute un écouteur à chaque `li`",
              "`ul.addEventListener('click', basculer())`",
              "Un écouteur `click` sur chaque `li`, avec `event.stopPropagation()` pour éviter les doublons"
            ],
            answer: 0,
            why: {
              1: "La boucle ne voit que les `li` présents au chargement : ceux ajoutés ensuite n'ont pas d'écouteur.",
              2: "Les parenthèses appellent `basculer` immédiatement et enregistrent son résultat (`undefined`) comme écouteur.",
              3: "Il faudrait penser à ajouter un écouteur à chaque nouveau `li`, et `stopPropagation` n'apporte rien ici. La délégation évite tout ça."
            },
            hint: "Quel élément existe dès le chargement, et reçoit tous les clics de ses enfants ?",
            explain: "Le `ul` existe dès le départ, et les clics sur ses `li` remontent jusqu'à lui. Un seul écouteur suffit donc, quel que soit le nombre de `li` ajoutés ensuite : c'est la délégation."
          }
        }
      ]
    },

    // ------------------------------------------------------------------ js.u10
    {
      id: 'js.u10',
      title: 'Formulaires interactifs',
      summary: "Valider une saisie côté client et garder la main sur l'envoi d'un formulaire.",
      lessons: [
        {
          id: 'js.u10.l1',
          title: 'Valider un formulaire',
          minutes: 8,
          objective: "Tu sais intercepter l'envoi d'un formulaire avec `preventDefault`, lire et nettoyer ses champs, et afficher des messages d'erreur précis.",
          explain:
            "À l'envoi d'un formulaire, le navigateur déclenche l'événement `submit` sur la balise `form`, puis charge une nouvelle page. Pour traiter les données en JavaScript, écoute `submit` et appelle `event.preventDefault()` : le rechargement est annulé. Écoute bien `submit` sur le formulaire, pas `click` sur le bouton : la touche Entrée envoie aussi le formulaire.\n\n" +
            "`form.elements.email` donne le champ `name=\"email\"`. Sa valeur se lit avec `.value` : c'est toujours une **chaîne**, même pour `type=\"number\"`. Nettoie-la avec `trim()`, qui retire les espaces autour (le `strip()` de Python), et teste un caractère avec `texte.includes('@')`.\n\n" +
            "Les attributs HTML `required`, `minlength` ou `type=\"email\"` offrent une première validation. La tienne en JavaScript permet des messages précis et des règles sur mesure.\n\n" +
            "Mais la validation côté client sert le confort de l'utilisateur, pas la sécurité : n'importe qui peut la contourner. Le serveur doit toujours revérifier les données.",
          example: {
            code: `const form = document.querySelector('#inscription');
const erreur = document.querySelector('#erreur');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const pseudo = form.elements.pseudo.value.trim();
  if (pseudo.length < 3) {
    erreur.textContent = 'Le pseudo doit faire au moins 3 caractères.';
    return;
  }
  erreur.textContent = '';
  console.log('Inscription de', pseudo);
});`,
            run: false,
            notes: [
              { line: 3, text: "On écoute `submit` sur le formulaire : le clic sur le bouton et la touche Entrée sont couverts." },
              { line: 4, text: "Sans cette ligne, la page se recharge et le message d'erreur disparaît aussitôt." },
              { line: 5, text: "`trim()` empêche un pseudo fait d'espaces de passer la validation." },
              { line: 8, text: "`return` sort de l'écouteur : rien n'est traité tant qu'il y a une erreur." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              prompt: "Complète `erreurEmail`, qui renvoie le message d'erreur d'une adresse saisie, ou une chaîne vide si elle est acceptable.",
              code: `function erreurEmail(saisie) {
  const email = saisie.___();
  if (email === '') {
    return 'Adresse obligatoire';
  }
  if (!email.___('@')) {
    return 'Il manque le @';
  }
  return '';
}
console.log(erreurEmail('   '));
console.log(erreurEmail('ada.labo.fr'));
console.log(erreurEmail(' ada@labo.fr ') === '');`,
              blanks: [
                {
                  answers: ['trim'],
                  options: ['trim', 'strip', 'clean', 'length'],
                  why: {
                    strip: "`strip()` est la méthode Python ; en JavaScript, c'est `trim()`.",
                    clean: "Les chaînes n'ont pas de méthode `clean`.",
                    length: "`length` est une propriété (un nombre), pas une méthode de nettoyage."
                  }
                },
                {
                  answers: ['includes'],
                  options: ['includes', 'contains', 'has', 'in'],
                  why: {
                    contains: "`contains` n'existe pas sur les chaînes JavaScript : c'est `includes`.",
                    has: "`has` est une méthode de `Map` et `Set`, pas des chaînes.",
                    in: "En Python on écrit `'@' in email` ; en JavaScript, l'opérateur `in` teste les clés d'un objet, pas le contenu d'une chaîne."
                  }
                }
              ],
              output: `Adresse obligatoire
Il manque le @
true`,
              hint: "Le premier trou est l'équivalent de `strip()`, le second celui de `in` pour une chaîne.",
              explain: "`trim()` transforme `'   '` en `''`, détecté comme vide, et retire les espaces autour d'une adresse valide. `includes('@')` teste la présence du caractère. Une fonction pure comme celle-ci se teste sans page."
            },
            {
              type: 'bug',
              prompt: "À l'envoi, le message s'affiche un instant, puis la page se recharge et tout disparaît. Clique sur la ligne fautive.",
              code: `function brancherRecherche(form, message) {
  form.addEventListener('submit', (event) => {
    event.preventDefault;
    const ville = form.elements.ville.value.trim();
    message.textContent = \`Recherche de la météo à \${ville}...\`;
  });
}`,
              bugLine: 3,
              why: "`event.preventDefault` sans parenthèses lit la méthode sans l'appeler : l'envoi n'est jamais annulé, et la page se recharge.",
              fixes: ['    event.preventDefault();', '    return false;', '    event.stopPropagation();'],
              fixAnswer: 0,
              fixWhy: {
                1: "Avec `addEventListener`, la valeur renvoyée par l'écouteur est ignorée : l'envoi n'est pas annulé. Et ce `return` empêcherait en plus les lignes suivantes de s'exécuter.",
                2: "`stopPropagation` empêche l'événement de remonter vers les parents, pas l'action par défaut du navigateur."
              },
              hint: "Une méthode qu'on n'appelle pas ne fait rien.",
              explain: "`event.preventDefault()` annule l'action par défaut du navigateur, ici l'envoi et le rechargement. Les parenthèses font toute la différence entre « nommer » une fonction et l'exécuter."
            }
          ],
          challenge: {
            type: 'code',
            dom: true,
            prompt: "Formulaire d'inscription. À l'envoi : annule le rechargement, nettoie le pseudo et l'email avec `trim()`, puis affiche dans `#erreur` la **première** erreur trouvée : `Pseudo trop court` (moins de 3 caractères), `Email invalide` (pas de `@`) ou `Mot de passe trop court` (moins de 8 caractères). S'il n'y a pas d'erreur, vide `#erreur` et écris `Bienvenue, Ada !` (avec le pseudo) dans `#succes` ; sinon, vide `#succes`.",
            html: `<form id="inscription">
  <label>Pseudo <input name="pseudo"></label>
  <label>Email <input name="email"></label>
  <label>Mot de passe <input name="motdepasse" type="password"></label>
  <button>Créer le compte</button>
</form>
<p id="erreur"></p>
<p id="succes"></p>`,
            starter: `const form = document.querySelector('#inscription');
const erreur = document.querySelector('#erreur');
const succes = document.querySelector('#succes');

form.addEventListener('submit', (event) => {
  // 1. annule l'envoi
  // 2. lis et nettoie les champs
  // 3. affiche la première erreur, ou le message de bienvenue
});
`,
            solution: `const form = document.querySelector('#inscription');
const erreur = document.querySelector('#erreur');
const succes = document.querySelector('#succes');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const pseudo = form.elements.pseudo.value.trim();
  const email = form.elements.email.value.trim();
  const motdepasse = form.elements.motdepasse.value;
  let message = '';
  if (pseudo.length < 3) {
    message = 'Pseudo trop court';
  } else if (!email.includes('@')) {
    message = 'Email invalide';
  } else if (motdepasse.length < 8) {
    message = 'Mot de passe trop court';
  }
  erreur.textContent = message;
  succes.textContent = message === '' ? \`Bienvenue, \${pseudo} !\` : '';
});
`,
            tests: [
              { code: "const f = document.querySelector('#inscription');\nf.elements.pseudo.value = '  Al  ';\nf.elements.email.value = 'al@labo.fr';\nf.elements.motdepasse.value = 'motdepasse';\nconst ev = new Event('submit', { cancelable: true });\nf.dispatchEvent(ev);\nassert(ev.defaultPrevented, \"L'envoi n'est pas annulé : appelle event.preventDefault()\");\nassertEqual(document.querySelector('#erreur').textContent, 'Pseudo trop court');", label: "« Al » entouré d'espaces : envoi annulé et « Pseudo trop court »" },
              { code: "const f = document.querySelector('#inscription');\nf.elements.pseudo.value = 'Ada';\nf.elements.email.value = 'ada.labo.fr';\nf.elements.motdepasse.value = 'motdepasse';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nassertEqual(document.querySelector('#erreur').textContent, 'Email invalide');", label: 'email sans @ : « Email invalide »' },
              { code: "const f = document.querySelector('#inscription');\nf.elements.pseudo.value = 'Ada';\nf.elements.email.value = 'ada@labo.fr';\nf.elements.motdepasse.value = 'court';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nassertEqual(document.querySelector('#erreur').textContent, 'Mot de passe trop court');", label: 'mot de passe de 5 caractères : « Mot de passe trop court »' },
              { code: "const f = document.querySelector('#inscription');\nf.elements.pseudo.value = '  Ada ';\nf.elements.email.value = ' ada@labo.fr ';\nf.elements.motdepasse.value = 'motdepasse';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nassertEqual(document.querySelector('#erreur').textContent, '');\nassertEqual(document.querySelector('#succes').textContent, 'Bienvenue, Ada !');", label: 'tout est valide : « Bienvenue, Ada ! » et aucune erreur' },
              { code: "const f = document.querySelector('#inscription');\nf.elements.pseudo.value = '';\nf.dispatchEvent(new Event('submit', { cancelable: true }));\nassertEqual(document.querySelector('#succes').textContent, '');", label: 'après une nouvelle erreur, le message de bienvenue disparaît' }
            ],
            hint: "Range le message d'erreur dans une variable `let message = ''`, remplis-la avec une chaîne `if / else if`, puis mets à jour les deux zones à la fin.",
            explain: "La chaîne `if / else if` garantit qu'une seule erreur, la première, est retenue. Mettre à jour `#erreur` et `#succes` à chaque envoi, à partir de `message`, évite qu'un ancien message reste affiché."
          },
          recap: [
            "Écoute `submit` sur le `form`, pas `click` sur le bouton.",
            "`event.preventDefault()`, avec les parenthèses, annule le rechargement.",
            "Les valeurs des champs sont des chaînes : `trim()`, puis convertis si besoin.",
            "La validation côté client aide l'utilisateur ; le serveur doit revérifier."
          ],
          check: {
            type: 'order',
            prompt: "Remets dans l'ordre `brancherNewsletter`. Comme le veut l'usage, l'écouteur annule l'envoi en tout premier, puis lit l'email et affiche le résultat.",
            lines: [
              'function brancherNewsletter(form, info) {',
              "  form.addEventListener('submit', (event) => {",
              '    event.preventDefault();',
              '    const email = form.elements.email.value.trim();',
              "    info.textContent = email.includes('@') ? 'Inscription enregistrée' : 'Email invalide';",
              '  });',
              '}'
            ],
            hint: "L'écouteur `submit` reçoit l'événement ; tout le reste se passe à l'intérieur.",
            explain: "On branche l'écouteur sur l'événement `submit` du formulaire. Dedans : annuler l'envoi, lire et nettoyer la valeur, puis afficher le message. L'email doit être lu avant d'être testé."
          }
        }
      ]
    }
  ]
});
