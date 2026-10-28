// Parcours HTML et CSS, chapitre 1 : Structure HTML (web.u1 à web.u5).
CQ.addTrack({
  id: 'web',
  title: 'HTML et CSS',
  lang: 'html',
  summary: "Construire des pages web structurées, mises en forme, adaptées à tous les écrans et accessibles, jusqu'à ton propre portfolio.",
  why: "Chaque appli web, tableau de bord ou démo de modèle d'IA s'affiche avec du HTML et du CSS. Les écrire proprement te permet de présenter tes projets toi-même, sans dépendre d'un générateur de site.",
  requires: [],
  chapters: [
    {
      id: 'web.c1',
      title: 'Structure HTML',
      units: [
        // ---------------------------------------------------------------- web.u1
        {
          id: 'web.u1',
          title: "Structure d'un document HTML",
          summary: "Le squelette commun à toutes les pages : doctype, html, head et body.",
          lessons: [
            {
              id: 'web.u1.l1',
              title: "Le squelette d'une page",
              minutes: 6,
              objective: "Tu sais écrire le squelette d'un document HTML (doctype, `html`, `head`, `body`) avec des balises correctement fermées et emboîtées.",
              explain:
                "HTML décrit la **structure** d'une page : chaque contenu est entouré de **balises**. `<p>Bonjour</p>` forme un **élément** : balise ouvrante, contenu, balise fermante. Les **attributs** ajoutent des informations dans la balise ouvrante : `<html lang=\"fr\">`.\n\n" +
                "Un document complet suit toujours le même squelette :\n" +
                "- `<!doctype html>` annonce du HTML moderne ;\n" +
                "- `<html lang=\"fr\">` contient tout le document et indique sa langue (les lecteurs d'écran prononcent mieux) ;\n" +
                "- `<head>` décrit la page sans l'afficher : encodage (`<meta charset=\"utf-8\">`), adaptation au mobile (`<meta name=\"viewport\">`), titre de l'onglet (`<title>`) ;\n" +
                "- `<body>` contient tout ce qui s'affiche : ici un grand titre `<h1>` et un paragraphe `<p>`.\n\n" +
                "Les éléments s'emboîtent comme des poupées : on ferme d'abord le dernier ouvert. Certains éléments sont **vides** et n'ont pas de balise fermante, comme `<meta>` ou `<img>`. Un commentaire s'écrit `<!-- ... -->`.",
              example: {
                code: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lina Martin – Développeuse</title>
</head>
<body>
  <!-- Tout ce qui est visible va ici -->
  <h1>Lina Martin</h1>
  <p>Je construis des applis web et des petits projets d'IA.</p>
</body>
</html>`,
                notes: [
                  { line: 1, text: "Le doctype vient en tout premier, hors de `<html>` : il active le mode standard du navigateur." },
                  { line: 5, text: "La balise viewport demande au téléphone d'utiliser sa vraie largeur d'écran au lieu de dézoomer la page." },
                  { line: 6, text: "`<title>` s'affiche dans l'onglet et dans les résultats des moteurs de recherche, pas dans la page." },
                  { line: 10, text: "`<h1>` est dans `<body>` : c'est le grand titre visible de la page." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "Où s'affiche le texte placé dans la balise `<title>` ?",
                  choices: [
                    "En haut de la page, en gros caractères",
                    "Dans l'onglet du navigateur, les favoris et les résultats des moteurs de recherche",
                    "Nulle part : il ne sert qu'aux développeurs",
                    "Dans la console des outils de développement"
                  ],
                  answer: 1,
                  why: {
                    0: "Le grand titre visible, c'est `<h1>`, placé dans `<body>`. `<title>` est dans `<head>`, qui ne s'affiche jamais dans la page.",
                    2: "Il est bien visible, mais hors de la page : regarde le haut de ton navigateur quand plusieurs onglets sont ouverts.",
                    3: "La console n'affiche que des messages de JavaScript ou des erreurs, pas le contenu de `<head>`."
                  },
                  hint: "Pense à ce que tu lis quand plusieurs pages sont ouvertes en même temps.",
                  explain: "`<title>` fait partie de `<head>` : il décrit la page sans s'afficher dedans. Le navigateur l'utilise pour l'onglet et les favoris, les moteurs de recherche pour le titre du résultat. Un titre précis aide donc à retrouver ta page."
                },
                {
                  type: 'order',
                  prompt: "Remets ce document dans l'ordre pour obtenir une page valide.",
                  lines: [
                    '<!doctype html>',
                    '<html lang="fr">',
                    "  <head><title>Classifieur d'images</title></head>",
                    '  <body>',
                    "    <h1>Classifieur d'images</h1>",
                    '  </body>',
                    '</html>'
                  ],
                  hint: "Commence par la déclaration du type de document, puis ouvre les éléments du plus grand au plus petit.",
                  explain: "Le doctype vient en premier, hors de `<html>`. `<head>` précède `<body>`, et chaque élément se ferme dans l'ordre inverse de son ouverture : `</body>` avant `</html>`."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Ce document s'affiche, mais il est incomplet. Complète-le :\n\n- langue française sur `<html>` ;\n- un `<head>` qui contient l'encodage `utf-8`, la balise viewport et un titre d'onglet contenant « Portfolio » ;\n- le `<h1>` reste dans `<body>`.",
                starter: `<!doctype html>
<html>
<body>
  <h1>Lina Martin, développeuse</h1>
  <p>Projets web et intelligence artificielle.</p>
</body>
</html>`,
                solution: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portfolio de Lina Martin</title>
</head>
<body>
  <h1>Lina Martin, développeuse</h1>
  <p>Projets web et intelligence artificielle.</p>
</body>
</html>`,
                checks: [
                  { sel: 'html', attrs: { lang: 'fr' }, label: "La balise html indique la langue française (lang=\"fr\")" },
                  { sel: 'head meta[charset]', attrs: { charset: 'utf-8' }, label: "L'encodage utf-8 est déclaré dans le head" },
                  { sel: 'head meta[name="viewport"]', label: "La balise viewport est dans le head" },
                  { sel: 'head title', text: 'Portfolio', label: "Le titre d'onglet contient « Portfolio »" },
                  { sel: 'body h1', count: 1, label: "Le titre h1 est toujours dans le body" }
                ],
                hint: "Ajoute un bloc `<head>...</head>` entre `<html>` et `<body>`, puis un attribut sur la balise `<html>`.",
                explain: "`lang=\"fr\"` se place sur `<html>` car il concerne tout le document. Le `<head>` regroupe les informations sur la page (encodage, viewport, titre d'onglet) et se place avant `<body>`, qui garde le contenu visible."
              },
              recap: [
                "Un élément = balise ouvrante + contenu + balise fermante ; les attributs se placent dans la balise ouvrante.",
                "`<head>` décrit la page (encodage, viewport, titre d'onglet), `<body>` contient ce qui s'affiche.",
                "`lang=\"fr\"` sur `<html>` aide les lecteurs d'écran et les outils de traduction.",
                "Les éléments s'emboîtent : on ferme d'abord le dernier ouvert ; `<meta>` et `<img>` n'ont pas de fermeture."
              ],
              check: {
                type: 'bug',
                prompt: "Cette page s'affiche entièrement vide, alors que le `<body>` contient un titre. Clique sur la ligne fautive.",
                code: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Portfolio de Lina
</head>
<body>
  <h1>Lina Martin</h1>
</body>
</html>`,
                bugLine: 5,
                why: "La balise `<title>` n'est jamais fermée. Le navigateur prend donc tout ce qui suit, jusqu'à la fin du fichier, pour du texte de titre : `<body>` et `<h1>` ne sont jamais lus comme du HTML, et la page reste vide.",
                fixes: [
                  '  <title>Portfolio de Lina</title>',
                  '  <title>Portfolio de Lina<title>',
                  '  <title/>Portfolio de Lina',
                  '  <title>Portfolio de Lina</>'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "Une balise fermante commence par `/` : `<title>` ouvre un deuxième titre au lieu de fermer le premier.",
                  2: "En HTML, `<title/>` n'est pas une balise auto-fermante : le navigateur ignore le `/` et le titre reste ouvert.",
                  3: "`</>` n'est pas une balise : la fermante doit répéter le nom de l'élément, `</title>`."
                },
                hint: "Pour chaque balise ouvrante, cherche sa balise fermante.",
                explain: "Chaque élément non vide doit être fermé par `</nom>`. Ici, l'oubli est spectaculaire car le contenu de `<title>` est lu comme du texte brut : tout le reste du fichier y disparaît."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- web.u2
        {
          id: 'web.u2',
          title: 'Titres, paragraphes, liens et images',
          summary: "Hiérarchiser un texte et y ajouter des liens et des images accessibles.",
          lessons: [
            {
              id: 'web.u2.l1',
              title: 'Texte, liens et images',
              minutes: 7,
              objective: "Tu sais hiérarchiser un texte avec des titres et ajouter des liens et des images accessibles.",
              explain:
                "Les titres vont de `<h1>` à `<h6>` et forment le **plan** de la page : un seul `<h1>` (le sujet), puis `<h2>` pour les parties, `<h3>` pour les sous-parties, sans sauter de niveau. Choisis le niveau selon la structure, jamais selon la taille : la taille se règle en CSS.\n\n" +
                "Le texte courant va dans `<p>`. `<strong>` marque une information importante, `<em>` une insistance.\n\n" +
                "Un lien s'écrit `<a href=\"...\">texte</a>`. L'adresse peut être absolue (`https://github.com/...`), relative (`projets.html`) ou une ancre vers un élément de la page (`#contact` vise l'élément qui a `id=\"contact\"`). Le texte du lien dit où il mène : « Code source du projet », pas « cliquez ici ».\n\n" +
                "Une image s'écrit `<img src=\"...\" alt=\"...\">`. `alt` remplace l'image pour les lecteurs d'écran et quand elle ne charge pas : décris l'information qu'elle apporte. Une image purement décorative reçoit `alt=\"\"`. `width` et `height` réservent la place et évitent que la page saute au chargement.",
              example: {
                code: `<h1>Détecteur de spam</h1>
<p>Un modèle qui classe les e-mails en <strong>spam</strong> ou non.</p>
<h2>Résultats</h2>
<img src="matrice.png" alt="Matrice de confusion : 96 % des spams détectés"
     width="480" height="360">
<h2>Liens</h2>
<p>
  <a href="https://github.com/lina-dev/spam">Code source du détecteur</a>
  · <a href="#contact">Me contacter</a>
</p>`,
                notes: [
                  { line: 1, text: "Un seul `<h1>` : le sujet de la page. Les parties suivantes sont des `<h2>`." },
                  { line: 4, text: "Le texte alternatif donne l'information de l'image, pas son apparence (« image de graphique » ne dirait rien)." },
                  { line: 8, text: "Lien absolu vers un autre site, avec un texte qui annonce la destination." },
                  { line: 9, text: "Lien vers l'élément de la page qui a `id=\"contact\"`." }
                ]
              },
              exercises: [
                {
                  type: 'fill',
                  prompt: "Complète pour créer un lien vers le dépôt et afficher une image de démonstration.",
                  code: `<a ___="https://github.com/lina-dev/chatbot">Code du chatbot</a>
<img ___="demo.png" ___="Le chatbot répond à une question de maths">`,
                  blanks: [
                    { answers: ['href'], options: ['href', 'src', 'link', 'url'],
                      why: { src: "`src` indique le fichier à charger (image, script), pas la destination d'un lien.", link: "`link` est une balise de `<head>`, pas un attribut de `<a>`.", url: "Il n'existe pas d'attribut `url` : la destination d'un lien se met dans `href`." } },
                    { answers: ['src'], options: ['src', 'href', 'url', 'file'],
                      why: { href: "`href` sert aux liens : une image se charge avec `src`.", url: "Il n'existe pas d'attribut `url` sur `<img>`.", file: "Il n'existe pas d'attribut `file` sur `<img>`." } },
                    { answers: ['alt'], options: ['alt', 'title', 'caption', 'desc'],
                      why: { title: "`title` affiche une infobulle au survol, mais ne remplace pas l'image pour un lecteur d'écran.", caption: "`caption` est une balise de tableau, pas un attribut d'image.", desc: "Il n'existe pas d'attribut `desc` sur `<img>`." } }
                  ],
                  hint: "Un lien a une destination, une image a une source et un texte de remplacement.",
                  explain: "`href` donne la destination du lien, `src` le fichier de l'image, `alt` le texte qui la remplace. Ces trois attributs sont les plus utilisés du HTML."
                },
                {
                  type: 'qcm',
                  prompt: "Sur la page d'un projet, quelle image a le meilleur texte alternatif pour la capture du tableau de bord ?",
                  choices: [
                    '`<img src="dashboard.png" alt="image">`',
                    '`<img src="dashboard.png" alt="dashboard.png">`',
                    '`<img src="dashboard.png" alt="Tableau de bord : précision du modèle 94 %, 1 200 prédictions aujourd\'hui">`',
                    '`<img src="dashboard.png">`, car l\'image se voit déjà'
                  ],
                  answer: 2,
                  why: {
                    0: "« image » n'apprend rien : un lecteur d'écran annonce déjà qu'il s'agit d'une image.",
                    1: "Un nom de fichier n'est pas une description : la personne n'apprend rien sur le contenu.",
                    3: "Sans `alt`, un lecteur d'écran lit souvent le nom du fichier, et l'information est perdue si l'image ne charge pas."
                  },
                  hint: "Imagine que l'image ne charge pas : quel texte te donnerait la même information ?",
                  explain: "Un bon `alt` transmet l'information que l'image apporte dans son contexte. Ici, ce sont les chiffres clés du tableau de bord qui comptent, pas le fait que ce soit une capture."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Écris la fiche d'un projet :\n\n- un titre `<h2>` « Recommandation de films » ;\n- un paragraphe de description ;\n- l'image `affiche.png` avec un texte alternatif non vide ;\n- un lien absolu (qui commence par `https://`) vers le code, dont le texte contient le mot « code ».",
                starter: `<h2>Recommandation de films</h2>
<img src="affiche.png">
<a>Cliquez ici</a>`,
                solution: `<h2>Recommandation de films</h2>
<p>Un système qui propose des films à partir de tes notes précédentes.</p>
<img src="affiche.png" alt="Liste de cinq films recommandés avec leur score de pertinence">
<a href="https://github.com/lina-dev/films">Voir le code du projet</a>`,
                checks: [
                  { sel: 'h2', text: 'Recommandation de films', label: "Un titre h2 « Recommandation de films »" },
                  { sel: 'p', label: "Un paragraphe de description" },
                  { sel: 'img[src="affiche.png"][alt]:not([alt=""])', count: 1, label: "L'image affiche.png a un texte alternatif non vide" },
                  { sel: 'a[href^="https://"]', text: 'code', label: "Un lien https dont le texte parle du code" }
                ],
                hint: "Il manque un élément, et deux attributs sur les éléments existants. Remplace aussi le texte « Cliquez ici ».",
                explain: "La fiche suit le plan de la page (un `<h2>` sous le `<h1>` du site), l'image a un `alt` qui décrit son information, et le lien porte un `href` absolu et un texte qui annonce sa destination."
              },
              recap: [
                "Un seul `<h1>`, puis `<h2>`, `<h3>`… sans sauter de niveau : le niveau suit la structure, pas la taille.",
                "`<a href>` : adresse absolue, relative ou ancre `#id` ; le texte du lien dit où il mène.",
                "`<img src alt>` : `alt` décrit l'information apportée, `alt=\"\"` pour une image décorative.",
                "`<strong>` et `<em>` portent un sens (importance, insistance), pas seulement un style."
              ],
              check: {
                type: 'bug',
                prompt: "Cette page de projet s'affiche bien, mais son plan est incorrect pour un lecteur d'écran ou un moteur de recherche. Clique sur la ligne fautive.",
                code: `<h1>Chatbot de révision</h1>
<p>Un assistant qui t'interroge sur tes cours.</p>
<h3>Démonstration</h3>
<img src="chatbot.png" alt="Le chatbot pose une question sur la Révolution française">
<a href="https://github.com/lina-dev/chatbot">Code source du chatbot</a>`,
                bugLine: 3,
                why: "Le plan saute du `<h1>` au `<h3>` : il manque un niveau. Un lecteur d'écran qui liste les titres croit qu'une partie `<h2>` a disparu.",
                fixes: [
                  '<h2>Démonstration</h2>',
                  '<h1>Démonstration</h1>',
                  '<p><strong>Démonstration</strong></p>',
                  '<h3 class="grand">Démonstration</h3>'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "Un deuxième `<h1>` mettrait « Démonstration » au même niveau que le sujet de la page.",
                  2: "Un paragraphe en gras ressemble à un titre, mais n'en est pas un : il disparaît du plan de la page.",
                  3: "Une classe change l'apparence, pas le niveau : c'est toujours un `<h3>` sous un `<h1>`."
                },
                hint: "Liste les niveaux de titres dans l'ordre et cherche celui qui saute une marche.",
                explain: "Le niveau d'un titre exprime sa place dans le plan : sous le `<h1>`, une partie est un `<h2>`. Si `<h2>` te semble trop grand, change sa taille en CSS, pas son niveau."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- web.u3
        {
          id: 'web.u3',
          title: 'Listes et tableaux',
          summary: "Présenter des énumérations et des données à deux dimensions.",
          lessons: [
            {
              id: 'web.u3.l1',
              title: 'Listes et tableaux de données',
              minutes: 7,
              objective: "Tu sais choisir entre liste ordonnée et non ordonnée et construire un tableau de données avec légende et en-têtes.",
              explain:
                "Trois éléments pour les listes :\n" +
                "- `<ul>` : liste **non ordonnée**, quand l'ordre ne compte pas (technologies d'un projet) ;\n" +
                "- `<ol>` : liste **ordonnée**, numérotée, quand l'ordre compte (étapes d'installation) ;\n" +
                "- `<li>` : chaque élément, dans l'une ou l'autre. Une sous-liste se place à l'intérieur d'un `<li>`.\n\n" +
                "Un tableau présente des **données à deux dimensions**, jamais une mise en page. Sa structure :\n" +
                "- `<table>` contient tout ; `<caption>`, en premier, donne la légende ;\n" +
                "- `<thead>` regroupe la ligne d'en-têtes, `<tbody>` les lignes de données ;\n" +
                "- `<tr>` est une ligne, `<th>` une cellule d'en-tête, `<td>` une cellule de données.\n\n" +
                "`scope=\"col\"` sur un `<th>` indique qu'il titre une colonne (`scope=\"row\"` : une ligne). Un lecteur d'écran annonce alors « Précision : 91 % » au lieu d'un nombre isolé.",
              example: {
                code: `<ol>
  <li>Charger les données</li>
  <li>Entraîner le modèle</li>
  <li>Mesurer la précision</li>
</ol>
<table>
  <caption>Comparaison des modèles</caption>
  <thead>
    <tr><th scope="col">Modèle</th><th scope="col">Précision</th></tr>
  </thead>
  <tbody>
    <tr><td>Régression logistique</td><td>87 %</td></tr>
    <tr><td>Forêt aléatoire</td><td>91 %</td></tr>
  </tbody>
</table>`,
                notes: [
                  { line: 1, text: "Les étapes ont un ordre : `<ol>` les numérote automatiquement." },
                  { line: 7, text: "`<caption>` est le premier enfant de `<table>` : c'est le titre du tableau." },
                  { line: 9, text: "Les `<th scope=\"col\">` titrent chaque colonne." },
                  { line: 12, text: "Une ligne de données : une cellule `<td>` par colonne." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "Tu documentes un projet. Pour lequel de ces contenus une liste `<ol>` est-elle le bon choix ?",
                  choices: [
                    "Les technologies utilisées : Python, Flask, SQLite",
                    "Les étapes pour lancer le projet sur ta machine",
                    "Les liens vers tes profils GitHub et LinkedIn",
                    "Les qualités d'un bon jeu de données"
                  ],
                  answer: 1,
                  why: {
                    0: "Changer l'ordre des technologies ne change pas le sens : c'est une `<ul>`.",
                    2: "L'ordre de ces liens n'a pas de sens particulier : c'est une `<ul>`.",
                    3: "Une énumération de qualités n'a pas d'ordre imposé : c'est une `<ul>`."
                  },
                  hint: "Demande-toi si inverser deux éléments changerait le sens.",
                  explain: "`<ol>` sert quand l'ordre fait partie de l'information : des étapes, un classement. Si on peut mélanger les éléments sans rien perdre, c'est une `<ul>`."
                },
                {
                  type: 'order',
                  prompt: "Remets ce tableau dans l'ordre.",
                  lines: [
                    '<table>',
                    '  <caption>Précision des modèles</caption>',
                    '  <thead><tr><th scope="col">Modèle</th><th scope="col">Précision</th></tr></thead>',
                    '  <tbody>',
                    '    <tr><td>Forêt aléatoire</td><td>91 %</td></tr>',
                    '  </tbody>',
                    '</table>'
                  ],
                  hint: "La légende vient avant tout le reste, et les en-têtes avant les données.",
                  explain: "`<caption>` doit être le premier enfant de `<table>`. Les en-têtes (`<thead>`) précèdent les données (`<tbody>`), et chaque élément se ferme avant son parent."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Transforme ces données en vrai tableau :\n\n- une légende `<caption>` qui contient « Inscriptions » ;\n- une ligne d'en-têtes dans `<thead>` avec 3 cellules `<th scope=\"col\">` (Mois, Utilisateurs, Taux d'activité) ;\n- les 2 lignes de données dans `<tbody>`.",
                starter: `<table>
  <tr><td>Mois</td><td>Utilisateurs</td><td>Taux d'activité</td></tr>
  <tr><td>Janvier</td><td>1 200</td><td>64 %</td></tr>
  <tr><td>Février</td><td>1 850</td><td>71 %</td></tr>
</table>`,
                solution: `<table>
  <caption>Inscriptions à l'appli</caption>
  <thead>
    <tr><th scope="col">Mois</th><th scope="col">Utilisateurs</th><th scope="col">Taux d'activité</th></tr>
  </thead>
  <tbody>
    <tr><td>Janvier</td><td>1 200</td><td>64 %</td></tr>
    <tr><td>Février</td><td>1 850</td><td>71 %</td></tr>
  </tbody>
</table>`,
                checks: [
                  { sel: 'table > caption', text: 'Inscriptions', label: "Une légende qui contient « Inscriptions »" },
                  { sel: 'thead th[scope="col"]', count: 3, label: "3 en-têtes de colonne dans thead" },
                  { sel: 'tbody tr', count: 2, label: "2 lignes de données dans tbody" },
                  { sel: 'tbody td, tbody th[scope="row"]', count: 6, label: "6 cellules de données" }
                ],
                hint: "La première ligne actuelle contient des titres : ses cellules doivent devenir des `<th>` et passer dans `<thead>`.",
                explain: "Les titres de colonnes deviennent des `<th scope=\"col\">` regroupés dans `<thead>`, les données restent en `<td>` dans `<tbody>`, et `<caption>` résume le contenu du tableau."
              },
              recap: [
                "`<ul>` quand l'ordre ne compte pas, `<ol>` quand il compte ; chaque élément dans un `<li>`.",
                "Un tableau présente des données, jamais une mise en page.",
                "`<caption>` en premier, puis `<thead>` (en-têtes `<th>`) et `<tbody>` (données `<td>`).",
                "`scope=\"col\"` ou `scope=\"row\"` relie chaque donnée à son en-tête pour les lecteurs d'écran."
              ],
              check: {
                type: 'fill',
                prompt: "Complète : les étapes d'installation sont numérotées, et le tableau a une légende, des en-têtes de colonne et des cellules de données.",
                code: `<___>
  <li>Cloner le dépôt</li>
  <li>Installer les dépendances</li>
  <li>Lancer le serveur</li>
</ol>
<table>
  <___>Commandes utiles</caption>
  <thead>
    <tr><th ___="col">Commande</th><th scope="col">Rôle</th></tr>
  </thead>
  <tbody>
    <tr><___>npm start</td><td>Démarre le serveur</td></tr>
  </tbody>
</table>`,
                blanks: [
                  { answers: ['ol'], options: ['ol', 'ul', 'li', 'list'],
                    why: { ul: "`<ul>` ne numérote pas, et la fermeture `</ol>` ne correspondrait plus.", li: "`<li>` est un élément de liste, pas la liste elle-même.", list: "`<list>` n'existe pas en HTML." } },
                  { answers: ['caption'], options: ['caption', 'title', 'th', 'legend'],
                    why: { title: "`<title>` est le titre de l'onglet, dans `<head>`.", th: "`<th>` est une cellule d'en-tête, à l'intérieur d'une ligne `<tr>`.", legend: "`<legend>` titre un groupe de champs de formulaire, pas un tableau." } },
                  { answers: ['scope'], options: ['scope', 'col', 'for', 'span'],
                    why: { col: "`col` est la valeur ; l'attribut s'appelle `scope`.", for: "`for` relie un label à un champ de formulaire.", span: "`colspan` fusionne des colonnes ; `span` n'est pas l'attribut attendu ici." } },
                  { answers: ['td'], options: ['td', 'th', 'tr', 'tc'],
                    why: { th: "« npm start » est une donnée, pas un titre, et la fermeture `</td>` ne correspondrait plus.", tr: "`<tr>` est une ligne entière, pas une cellule.", tc: "`<tc>` n'existe pas en HTML." } }
                ],
                hint: "Regarde les balises fermantes : elles te disent quelle balise ouvrante il faut.",
                explain: "Des étapes ordonnées vont dans `<ol>`. Le tableau commence par sa légende `<caption>`, ses en-têtes portent `scope=\"col\"`, et les données sont dans des `<td>`."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- web.u4
        {
          id: 'web.u4',
          title: 'Formulaires',
          summary: "Recueillir des informations avec des champs adaptés, nommés et validés.",
          lessons: [
            {
              id: 'web.u4.l1',
              title: "Un formulaire d'inscription",
              minutes: 8,
              objective: "Tu sais construire un formulaire avec des champs adaptés, reliés à leurs labels et validés par le navigateur.",
              explain:
                "Un formulaire se place dans `<form action=\"/inscription\" method=\"post\">` : `action` est l'adresse qui reçoit les données, `method` la façon de les envoyer.\n\n" +
                "Chaque champ a besoin d'un **label** relié : `<label for=\"email\">` pointe vers le champ qui a `id=\"email\"`. On peut aussi placer le champ à l'intérieur du `<label>`. Cliquer sur le label active alors le champ, et un lecteur d'écran le lit. Un `placeholder` ne remplace pas un label : il disparaît dès qu'on tape.\n\n" +
                "Le `type` de `<input>` change tout : `email` vérifie le format et affiche un clavier avec @ sur mobile, `password` masque la saisie, `checkbox` crée une case ; `number`, `url`, `search` existent aussi.\n\n" +
                "`name` donne la clé sous laquelle la valeur est envoyée. `required`, `minlength`, `min`, `max` déclenchent la validation du navigateur, qui bloque l'envoi et affiche un message. Le serveur doit quand même tout revérifier.\n\n" +
                "Termine par `<button type=\"submit\">`. Un `<button type=\"button\">` n'envoie rien : il sert aux actions en JavaScript.",
              example: {
                code: `<form action="/inscription" method="post">
  <label for="email">Adresse e-mail</label>
  <input type="email" id="email" name="email" required>

  <label for="mdp">Mot de passe (8 caractères minimum)</label>
  <input type="password" id="mdp" name="mdp" minlength="8" required>

  <input type="checkbox" id="cgu" name="cgu" required>
  <label for="cgu">J'accepte les conditions d'utilisation</label>

  <button type="submit">Créer mon compte</button>
</form>`,
                notes: [
                  { line: 1, text: "Les données partent vers `/inscription` avec la méthode `post`." },
                  { line: 2, text: "`for=\"email\"` relie ce label au champ qui a `id=\"email\"`." },
                  { line: 3, text: "`type=\"email\"` et `required` : le navigateur refuse l'envoi si le champ est vide ou mal formé." },
                  { line: 6, text: "`minlength=\"8\"` impose au moins 8 caractères avant l'envoi." }
                ]
              },
              exercises: [
                {
                  type: 'order',
                  prompt: "Remets ce formulaire dans l'ordre : le champ e-mail, puis le mot de passe, chaque label juste avant son champ, et le bouton à la fin.",
                  lines: [
                    '<form action="/inscription" method="post">',
                    '  <label for="email">E-mail</label>',
                    '  <input type="email" id="email" name="email" required>',
                    '  <label for="mdp">Mot de passe</label>',
                    '  <input type="password" id="mdp" name="mdp" minlength="8" required>',
                    '  <button type="submit">Créer mon compte</button>',
                    '</form>'
                  ],
                  hint: "Repère les paires label et champ grâce aux valeurs de `for` et `id`.",
                  explain: "Tout est dans `<form>`. Chaque label précède le champ qu'il désigne (même valeur dans `for` et `id`), et le bouton d'envoi termine le formulaire."
                },
                {
                  type: 'bug',
                  prompt: "Quand on clique sur « Créer mon compte », rien n'est envoyé, même avec des champs bien remplis. Clique sur la ligne fautive.",
                  code: `<form action="/inscription" method="post">
  <label for="email">E-mail</label>
  <input type="email" id="email" name="email" required>
  <label for="mdp">Mot de passe</label>
  <input type="password" id="mdp" name="mdp" minlength="8" required>
  <button type="button">Créer mon compte</button>
</form>`,
                  bugLine: 6,
                  why: "`type=\"button\"` crée un bouton qui ne fait rien tout seul : il attend du JavaScript. Pour envoyer le formulaire, il faut `type=\"submit\"`.",
                  fixes: [
                    '  <button type="submit">Créer mon compte</button>',
                    '  <button type="send">Créer mon compte</button>',
                    '  <button type="button" required>Créer mon compte</button>',
                    '  <a href="/inscription">Créer mon compte</a>'
                  ],
                  fixAnswer: 0,
                  fixWhy: {
                    1: "`send` n'est pas un type de bouton valide.",
                    2: "`required` concerne les champs à remplir ; il ne change pas le comportement d'un bouton.",
                    3: "Un lien ouvre une page, mais n'envoie pas les données du formulaire."
                  },
                  hint: "Les champs sont corrects : regarde le seul élément qui déclenche l'envoi.",
                  explain: "C'est le bouton `type=\"submit\"` qui déclenche la validation puis l'envoi vers `action`. Écris toujours le `type` d'un bouton : ton intention est alors claire."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Réécris ce formulaire d'inscription à une appli de quiz :\n\n- un champ e-mail obligatoire de type `email`, avec `id=\"email\"` ;\n- un mot de passe obligatoire d'au moins 8 caractères, avec `id=\"mdp\"` ;\n- chaque champ a un `<label>` relié par `for` ;\n- un bouton `type=\"submit\"`.",
                starter: `<form action="/inscription" method="post">
  <p>E-mail</p>
  <input type="text" name="email">
  <p>Mot de passe</p>
  <input type="text" name="mdp">
  <button>Valider</button>
</form>`,
                solution: `<form action="/inscription" method="post">
  <label for="email">E-mail</label>
  <input type="email" id="email" name="email" required>
  <label for="mdp">Mot de passe (8 caractères minimum)</label>
  <input type="password" id="mdp" name="mdp" minlength="8" required>
  <button type="submit">Créer mon compte</button>
</form>`,
                checks: [
                  { sel: 'input#email[type="email"][required]', count: 1, label: "Un champ #email de type email, obligatoire" },
                  { sel: 'input#mdp[type="password"][required][minlength="8"]', count: 1, label: "Un mot de passe #mdp obligatoire, 8 caractères minimum" },
                  { sel: 'label[for="email"]', count: 1, label: "Un label relié au champ e-mail" },
                  { sel: 'label[for="mdp"]', count: 1, label: "Un label relié au mot de passe" },
                  { sel: 'form button[type="submit"]', label: "Un bouton d'envoi type=\"submit\"" }
                ],
                hint: "Les `<p>` deviennent des `<label>`, et chaque `<input>` a besoin d'un `id`, d'un bon `type` et de ses règles de validation.",
                explain: "Chaque `<label for>` désigne l'`id` de son champ. Le type `password` masque la saisie, `required` et `minlength` déclenchent la validation du navigateur, et le bouton `submit` envoie le tout."
              },
              recap: [
                "`<label for>` + `id` identique (ou champ placé dans le label) : le champ a un nom accessible.",
                "Le bon `type` (email, password, checkbox…) apporte clavier adapté et vérification.",
                "`name` est la clé envoyée au serveur ; `required`, `minlength`… déclenchent la validation du navigateur.",
                "Un placeholder ne remplace pas un label, et le serveur revérifie toujours les données."
              ],
              check: {
                type: 'logic',
                prompt: "Combien de champs de ce formulaire ont un label correctement relié ?",
                code: `<label for="prenom">Prénom</label>
<input type="text" id="prenom" name="prenom">

<label for="mail">E-mail</label>
<input type="email" id="email" name="email">

<label>Ville
  <input type="text" name="ville">
</label>

<input type="tel" id="tel" name="tel" placeholder="Téléphone">`,
                answer: '2',
                accept: ['deux'],
                mistakes: [
                  { answer: '1', why: "Tu n'as compté que le prénom. Le champ « Ville » est placé à l'intérieur de son `<label>` : c'est une liaison valide, sans `for` ni `id`." },
                  { answer: '3', why: "Le label « E-mail » pointe vers `mail`, mais le champ a `id=\"email\"` : ils ne sont pas reliés." },
                  { answer: '4', why: "Le téléphone n'a qu'un placeholder, qui ne remplace pas un label, et le label « E-mail » vise un `id` qui n'existe pas." }
                ],
                hint: "Pour chaque champ, vérifie que `for` et `id` sont identiques, ou que le champ est dans le label.",
                explain: "Prénom : `for` et `id` identiques. Ville : champ à l'intérieur du label. E-mail : `mail` différent de `email`, donc non relié. Téléphone : un placeholder n'est pas un label. Réponse : 2."
              }
            }
          ]
        },
        // ---------------------------------------------------------------- web.u5
        {
          id: 'web.u5',
          title: 'Sémantique HTML',
          summary: "Choisir la balise qui décrit le rôle de chaque zone de la page.",
          lessons: [
            {
              id: 'web.u5.l1',
              title: 'Une page qui a du sens',
              minutes: 7,
              objective: "Tu sais découper une page avec les balises sémantiques adaptées à chaque zone.",
              explain:
                "Une `<div>` ne dit rien de son contenu. Les balises **sémantiques**, elles, décrivent le rôle de chaque zone :\n" +
                "- `<header>` : en-tête (logo, titre, navigation) ;\n" +
                "- `<nav>` : bloc de liens de navigation principaux ;\n" +
                "- `<main>` : contenu principal, **un seul** par page ;\n" +
                "- `<section>` : partie thématique, avec son propre titre ;\n" +
                "- `<article>` : contenu autonome, qui garde son sens seul (un projet, un billet de blog) ;\n" +
                "- `<aside>` : contenu annexe (encadré, liens connexes) ;\n" +
                "- `<footer>` : pied de page (contact, mentions) ;\n" +
                "- `<figure>` et `<figcaption>` : une illustration et sa légende ; `<time datetime=\"2026-09-14\">` : une date lisible par les machines.\n\n" +
                "Les lecteurs d'écran s'en servent comme **repères** pour sauter directement au menu ou au contenu, et les moteurs de recherche comprennent mieux la page. Garde `<div>` et `<span>` pour les besoins purement visuels.",
              example: {
                code: `<header>
  <nav><a href="#projets">Projets</a> <a href="#contact">Contact</a></nav>
</header>
<main>
  <section id="projets">
    <h2>Projets</h2>
    <article>
      <h3>Détecteur de spam</h3>
      <p>Mis en ligne le <time datetime="2026-09-14">14 septembre</time>.</p>
    </article>
  </section>
</main>
<footer id="contact">lina@example.com</footer>`,
                notes: [
                  { line: 2, text: "`<nav>` signale le menu principal : un lecteur d'écran peut y aller directement." },
                  { line: 4, text: "`<main>` contient le contenu propre à cette page ; il n'y en a qu'un." },
                  { line: 7, text: "Chaque projet est un `<article>` : il aurait du sens partagé seul." },
                  { line: 9, text: "`datetime` donne la date dans un format que les machines comprennent." }
                ]
              },
              exercises: [
                {
                  type: 'qcm',
                  prompt: "Sur ton portfolio, chaque projet est présenté par une carte (titre, image, description, lien) qui pourrait être partagée seule. Quelle balise entoure chaque carte ?",
                  choices: ['`<section>`', '`<article>`', '`<aside>`', '`<div>`'],
                  answer: 1,
                  why: {
                    0: "`<section>` regroupe une partie thématique : c'est plutôt la zone « Projets » qui contient toutes les cartes.",
                    2: "`<aside>` est pour un contenu annexe, alors que les projets sont le cœur du portfolio.",
                    3: "`<div>` fonctionne visuellement, mais n'apporte aucun sens aux lecteurs d'écran ni aux moteurs de recherche."
                  },
                  hint: "Quelle balise désigne un contenu qui garde son sens hors de la page ?",
                  explain: "Un `<article>` est un contenu autonome : un projet, un billet, une fiche produit. La `<section id=\"projets\">` qui les regroupe porte le titre « Projets »."
                },
                {
                  type: 'fill',
                  prompt: "Complète avec les balises sémantiques qui correspondent aux balises fermantes.",
                  code: `<___>
  <a href="/">Accueil</a> <a href="/projets">Projets</a>
</nav>
<___>
  <h1>Mes projets d'IA</h1>
  <p>Trois projets réalisés en Python.</p>
</main>
<___>Contact : lina@example.com</footer>`,
                  blanks: [
                    { answers: ['nav'], options: ['nav', 'menu', 'header', 'div'],
                      why: { menu: "`<menu>` existe mais sert aux listes de commandes ; et la fermeture est `</nav>`.", header: "`<header>` peut contenir la navigation, mais la fermeture ici est `</nav>`.", div: "La fermeture est `</nav>`, et une `<div>` ne serait pas un repère de navigation." } },
                    { answers: ['main'], options: ['main', 'body', 'section', 'article'],
                      why: { body: "`<body>` contient toute la page, y compris la navigation et le pied de page.", section: "La fermeture est `</main>` : c'est le contenu principal de la page.", article: "La fermeture est `</main>`, et ce bloc n'est pas un contenu autonome mais le contenu principal." } },
                    { answers: ['footer'], options: ['footer', 'bottom', 'aside', 'end'],
                      why: { bottom: "`<bottom>` n'existe pas en HTML.", aside: "`<aside>` est un contenu annexe ; la fermeture est `</footer>`.", end: "`<end>` n'existe pas en HTML." } }
                  ],
                  hint: "Chaque balise ouvrante doit avoir le même nom que sa fermante.",
                  explain: "`<nav>` pour les liens de navigation, `<main>` pour le contenu principal, `<footer>` pour le pied de page. Ce sont des repères que les lecteurs d'écran proposent directement."
                }
              ],
              challenge: {
                type: 'code',
                prompt: "Remplace les `<div>` de cette page par des balises sémantiques :\n\n- un en-tête qui contient une navigation de 3 liens ;\n- un contenu principal avec 2 projets autonomes ;\n- un pied de page.\n\nIl ne doit plus rester aucune `<div>`.",
                starter: `<div class="entete">
  <div class="menu">
    <a href="#projets">Projets</a>
    <a href="#parcours">Parcours</a>
    <a href="#contact">Contact</a>
  </div>
</div>
<div class="contenu">
  <div class="projet"><h2>Chatbot de révision</h2><p>Un assistant de quiz.</p></div>
  <div class="projet"><h2>Météo prédictive</h2><p>Des prévisions par régression.</p></div>
</div>
<div class="pied">lina@example.com</div>`,
                solution: `<header class="entete">
  <nav class="menu">
    <a href="#projets">Projets</a>
    <a href="#parcours">Parcours</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main class="contenu">
  <article class="projet"><h2>Chatbot de révision</h2><p>Un assistant de quiz.</p></article>
  <article class="projet"><h2>Météo prédictive</h2><p>Des prévisions par régression.</p></article>
</main>
<footer class="pied">lina@example.com</footer>`,
                checks: [
                  { sel: 'header nav a', count: 3, label: "Un header qui contient une nav de 3 liens" },
                  { sel: 'main', count: 1, label: "Un seul main" },
                  { sel: 'main article', count: 2, label: "2 projets autonomes (article) dans le main" },
                  { sel: 'footer', count: 1, label: "Un pied de page footer" },
                  { none: 'div', label: "Plus aucune div" }
                ],
                hint: "Pour chaque `<div>`, demande-toi quel est son rôle : en-tête, navigation, contenu principal, contenu autonome ou pied de page.",
                explain: "Chaque zone prend la balise de son rôle : `<header>` et `<nav>` pour le haut, `<main>` pour le contenu principal, `<article>` pour chaque projet, `<footer>` pour le bas. Les classes peuvent rester pour le CSS."
              },
              recap: [
                "`<header>`, `<nav>`, `<main>`, `<footer>` découpent la page ; un seul `<main>`.",
                "`<section>` regroupe un thème avec son titre ; `<article>` est un contenu autonome.",
                "Les balises sémantiques servent de repères aux lecteurs d'écran et aident les moteurs de recherche.",
                "`<div>` et `<span>` restent pour les besoins purement visuels."
              ],
              check: {
                type: 'bug',
                prompt: "Une personne qui utilise un lecteur d'écran ne trouve aucun repère « navigation » sur cette page. Clique sur la ligne à corriger.",
                code: `<header>
  <h1>Lina Martin</h1>
  <div class="nav"><a href="#projets">Projets</a> <a href="#contact">Contact</a></div>
</header>
<main>
  <section id="projets">
    <h2>Projets</h2>
  </section>
</main>`,
                bugLine: 3,
                why: "Les liens du menu sont dans une `<div>` : la classe `nav` ne sert qu'au CSS et n'a aucun sens pour un lecteur d'écran. Il faut l'élément `<nav>`.",
                fixes: [
                  '  <nav><a href="#projets">Projets</a> <a href="#contact">Contact</a></nav>',
                  '  <section class="nav"><a href="#projets">Projets</a> <a href="#contact">Contact</a></section>',
                  '  <div id="nav"><a href="#projets">Projets</a> <a href="#contact">Contact</a></div>',
                  '  <aside><a href="#projets">Projets</a> <a href="#contact">Contact</a></aside>'
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "`<section>` désigne une partie thématique avec un titre, pas un bloc de navigation.",
                  2: "Un `id` ou une classe ne donne aucun rôle : c'est toujours une `<div>`.",
                  3: "`<aside>` signale un contenu annexe, pas le menu principal du site."
                },
                hint: "Le nom d'une classe n'a aucun effet sur le sens d'un élément.",
                explain: "Seule la balise donne le rôle. `<nav>` crée le repère « navigation » que les lecteurs d'écran listent, sans aucun attribut supplémentaire."
              }
            }
          ]
        }
      ]
    }
  ]
});
