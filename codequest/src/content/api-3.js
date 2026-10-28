// CodeQuest — parcours « Back-end et API », chapitre 3 : sécuriser et stocker.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  CQ.addChapter('api', {
    id: 'api.c3',
    title: 'Sécuriser et stocker',
    units: [
      // ------------------------------------------------------------------ api.u8
      {
        id: 'api.u8',
        title: 'Authentification et autorisations',
        summary: "Savoir qui fait la requête (sessions, jetons), puis décider s'il a le droit d'agir.",
        lessons: [
          {
            id: 'api.u8.l1',
            title: "S'authentifier : sessions et jetons",
            minutes: 8,
            objective: "Tu sais expliquer comment un serveur reconnaît un utilisateur connecté (session ou jeton) et extraire le jeton d'une requête.",
            explain: P(
              "**Authentifier**, c'est vérifier qui parle. HTTP étant sans état, l'utilisateur doit prouver son identité **à chaque requête**, après une connexion réussie :",
              "- **session** : le serveur crée un identifiant aléatoire, le garde (en mémoire, dans Redis ou en base) avec l'utilisateur associé, et l'envoie dans un **cookie** `HttpOnly; Secure; SameSite=Lax`. Le navigateur le renvoie tout seul ;\n- **jeton** (souvent un **JWT**) : le serveur signe un contenu comme `{ sub: 42, exp: ... }` avec une clé secrète ; le client l'envoie dans l'en-tête `Authorization: Bearer <jeton>`. Le serveur vérifie la signature et l'expiration, sans rien stocker.",
              "Un JWT est **signé, pas chiffré** : n'importe qui peut lire son contenu, simplement encodé en base64. N'y mets jamais de mot de passe ni de donnée sensible, et donne-lui une durée de vie courte.",
              "Sans preuve valide, réponds `401 Unauthorized`. À essayer sur ton ordinateur : `npm install jsonwebtoken` (jetons) ou `npm install express-session` (sessions)."
            ),
            example: {
              run: false,
              code: `const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Après vérification de l'e-mail et du mot de passe :
const jeton = jwt.sign({ sub: 42, role: 'editeur' }, SECRET, { expiresIn: '15m' });

function authentifier(req, res, next) {
  const [type, valeur] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !valeur) return res.status(401).json({ erreur: 'jeton manquant' });
  try {
    req.utilisateur = jwt.verify(valeur, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ erreur: 'jeton invalide ou expiré' });
  }
}`,
              notes: [
                { line: 2, text: "La clé de signature vient de l'environnement, jamais du code (voir le chapitre « En production »)." },
                { line: 5, text: "`sign` crée le jeton, valable 15 minutes. `sub` (subject) désigne l'utilisateur." },
                { line: 8, text: "On découpe `'Bearer abc.def.ghi'` en deux morceaux." },
                { line: 11, text: "`verify` contrôle la signature et l'expiration, puis rend le contenu : la suite de la chaîne connaît `req.utilisateur`." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Un JWT contient `{ \"sub\": 42, \"role\": \"editeur\", \"exp\": 1793000000 }`. Un utilisateur curieux copie son jeton et décode la partie du milieu. Que peut-il faire ?",
                choices: [
                  "Rien : le contenu est chiffré avec la clé secrète",
                  "Changer `role` en `admin` : le serveur fera confiance au nouveau contenu",
                  "Prolonger `exp` d'un an, car l'expiration n'est pas couverte par la signature",
                  "Lire le contenu, mais pas le modifier sans que la signature devienne invalide"
                ],
                answer: 3,
                why: {
                  0: "Un JWT standard est signé, pas chiffré : son contenu est seulement encodé en base64, lisible par tous.",
                  1: "Modifier le contenu casse la signature : `jwt.verify` lève une erreur et le serveur répond 401.",
                  2: "La signature couvre tout le contenu, y compris `exp`."
                },
                hint: "Distingue « signer » (prouver que le contenu n'a pas changé) et « chiffrer » (le rendre illisible).",
                explain: "La signature garantit l'intégrité : sans la clé secrète, impossible de produire un jeton modifié valide. Mais elle ne cache rien. D'où les deux règles : pas de secret dans un JWT, et toujours `verify` (jamais un simple décodage) côté serveur."
              },
              {
                type: 'code',
                prompt: "Écris `lireBearer(entetes)` qui renvoie le jeton de l'en-tête `authorization` (Node met les noms d'en-têtes en minuscules), ou `null` :\n\n- si l'en-tête manque ;\n- si le type n'est pas `Bearer` (sans tenir compte de la casse : `bearer` est accepté) ;\n- si le jeton est vide.",
                starter: `function lireBearer(entetes) {
  // ton code ici
  return entetes.authorization;
}
`,
                solution: `function lireBearer(entetes) {
  const valeur = entetes.authorization;
  if (typeof valeur !== 'string') return null;
  const morceaux = valeur.trim().split(' ');
  if (morceaux.length !== 2) return null;
  if (morceaux[0].toLowerCase() !== 'bearer') return null;
  return morceaux[1] || null;
}
`,
                tests: [
                  { code: "assertEqual(lireBearer({ authorization: 'Bearer abc.def.ghi' }), 'abc.def.ghi')", label: "Bearer abc.def.ghi : le jeton" },
                  { code: "assertEqual(lireBearer({ authorization: 'bearer xyz' }), 'xyz')", label: "Le type est insensible à la casse" },
                  { code: "assertEqual(lireBearer({}), null)", label: "En-tête absent : null" },
                  { code: "assertEqual(lireBearer({ authorization: 'Basic dXNlcjpwYXNz' }), null)", label: "Autre type (Basic) : null" },
                  { code: "assertEqual(lireBearer({ authorization: 'Bearer ' }), null)", label: "Jeton vide : null" }
                ],
                hint: "Vérifie d'abord que l'en-tête est une chaîne. `trim()` retire l'espace final de `'Bearer '`, puis `split(' ')` doit donner exactement deux morceaux.",
                explain: "Le middleware d'authentification commence toujours par extraire proprement la preuve : tout ce qui ne ressemble pas exactement à `Bearer <jeton>` est rejeté (puis traduit en 401). Ce n'est qu'une étape : le jeton extrait doit ensuite être vérifié (signature, expiration)."
              }
            ],
            challenge: {
              type: 'predict',
              prompt: "Ce serveur garde ses sessions en mémoire, avec une date d'expiration (en secondes). Qu'affiche ce programme ?",
              code: `const sessions = {
  s1: { utilisateur: 'ada', expire: 1000 },
  s2: { utilisateur: 'linus', expire: 500 }
};

function qui(cookie, maintenant) {
  const session = sessions[cookie];
  if (!session || session.expire <= maintenant) return 401;
  return session.utilisateur;
}

console.log(qui('s1', 800));
console.log(qui('s2', 800));
console.log(qui('s3', 800));
console.log(qui('s1', 1000));`,
              answer: `ada
401
401
401`,
              mistakes: [
                { answer: `ada
linus
401
ada`, why: "La session s2 a expiré à 500, avant 800. Et pour s1 à l'instant 1000, la condition `expire <= maintenant` est vraie : expirée aussi." },
                { answer: `ada
401
401
ada`, why: "Regarde l'opérateur : `<=`. À l'instant exact de l'expiration, la session n'est déjà plus valide." }
              ],
              hint: "Pour chaque appel, deux questions : la session existe-t-elle ? Son expiration est-elle strictement après `maintenant` ?",
              explain: "Une session inconnue (`s3`) ou expirée donne 401 : le client doit se reconnecter. Côté serveur, l'expiration est vérifiée à chaque requête, et c'est le serveur qui en décide : le cookie, lui, peut être conservé ou modifié par le client."
            },
            recap: [
              "HTTP est sans état : la preuve d'identité accompagne chaque requête.",
              "Session : identifiant aléatoire dans un cookie `HttpOnly`, données gardées côté serveur.",
              "JWT : jeton signé (pas chiffré) dans `Authorization: Bearer`, vérifié à chaque requête.",
              "Pas de preuve valide : 401."
            ],
            check: {
              type: 'order',
              lang: 'text',
              prompt: "Remets dans l'ordre une connexion avec session, de l'envoi du formulaire aux requêtes suivantes.",
              lines: [
                "Le client envoie l'e-mail et le mot de passe en HTTPS (POST /connexion)",
                "Le serveur cherche l'utilisateur par son e-mail",
                "Il compare le mot de passe reçu au hash enregistré",
                "Il crée une session et l'enregistre côté serveur",
                "Il renvoie un cookie HttpOnly contenant l'identifiant de session",
                "Le navigateur joint ce cookie à chaque requête suivante"
              ],
              hint: "Le serveur ne crée la session qu'une fois le mot de passe vérifié.",
              explain: "Identifier l'utilisateur, vérifier son mot de passe, puis seulement créer la session et la confier au navigateur via un cookie `HttpOnly` (illisible par le JavaScript de la page). Ensuite, le cookie sert de preuve à chaque requête, sans renvoyer le mot de passe."
            }
          },
          {
            id: 'api.u8.l2',
            title: 'Autoriser : rôles et propriété',
            minutes: 8,
            objective: "Tu sais décider côté serveur si un utilisateur authentifié a le droit d'agir, selon son rôle et la propriété de la ressource, et choisir entre 401, 403 et 404.",
            explain: P(
              "**Autoriser**, c'est décider si cet utilisateur **a le droit** de faire cette action. Deux règles se combinent souvent :",
              "- le **rôle** (contrôle d'accès par rôle) : un `lecteur` lit, un `editeur` modifie, un `admin` gère tout ;\n- la **propriété** : on ne modifie que ses propres ressources. Vérifier seulement « est connecté » permet à n'importe qui de lire `/factures/43` en changeant le numéro dans l'URL. Ce contrôle d'accès défaillant est en tête du classement OWASP des failles web.",
              "Les décisions s'appuient sur l'utilisateur **authentifié par le serveur** (`req.utilisateur`, issu de la session ou du jeton vérifié), jamais sur un champ envoyé par le client comme `req.body.role`.",
              "Codes : `401` si on ne sait pas qui tu es, `403` si on le sait mais que c'est interdit. Pour la ressource d'un autre utilisateur, beaucoup d'API renvoient `404`, pour ne pas révéler qu'elle existe.",
              "Principe du **moindre privilège** : chacun reçoit le minimum de droits nécessaire."
            ),
            example: {
              code: `const PERMISSIONS = {
  lecteur: ['lire'],
  editeur: ['lire', 'modifier'],
  admin: ['lire', 'modifier', 'supprimer']
};

function autoriser(utilisateur, action, article) {
  if (!utilisateur) return 401;
  if (!PERMISSIONS[utilisateur.role].includes(action)) return 403;
  const proprietaire = article.auteurId === utilisateur.id;
  if (action === 'modifier' && !proprietaire && utilisateur.role !== 'admin') return 403;
  return 200;
}

const article = { id: 5, auteurId: 2 };
console.log(autoriser(null, 'lire', article), autoriser({ id: 1, role: 'lecteur' }, 'modifier', article));
console.log(autoriser({ id: 2, role: 'editeur' }, 'modifier', article), autoriser({ id: 3, role: 'editeur' }, 'modifier', article));`,
              output: `401 403
200 403`,
              notes: [
                { line: 1, text: "Les droits de chaque rôle sont déclarés en un seul endroit, lisible et facile à auditer." },
                { line: 8, text: "Pas d'utilisateur authentifié : 401." },
                { line: 9, text: "Le rôle ne permet pas l'action : 403." },
                { line: 11, text: "Un éditeur ne modifie que ses propres articles ; l'admin, tous." }
              ]
            },
            exercises: [
              {
                type: 'bug',
                prompt: "Un simple lecteur a réussi à supprimer des articles. Clique sur la ligne fautive.",
                code: `function peutSupprimer(req) {
  return req.body.role === 'admin';
}

const req = {
  utilisateur: { id: 7, role: 'lecteur' },  // vérifié par le serveur (jeton)
  body: { role: 'admin' }                   // écrit par le client
};
console.log(peutSupprimer(req));`,
                bugLine: 2,
                why: "La décision repose sur `req.body`, que le client écrit lui-même : il lui suffit d'ajouter `\"role\": \"admin\"` à sa requête.",
                fixes: [
                  "  return req.utilisateur.role === 'admin';",
                  "  return req.body.role === 'admin' && req.body.role !== undefined;",
                  "  return req.headers.role === 'admin';"
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "La condition ajoutée ne change rien : le rôle vient toujours du client.",
                  2: "Les en-têtes sont aussi écrits par le client : même faille (et `req.headers` n'existe même pas ici)."
                },
                output: `false`,
                hint: "Parmi les données de `req`, lesquelles le client peut-il choisir librement ?",
                explain: "Seul `req.utilisateur`, rempli par le middleware d'authentification après vérification du jeton ou de la session, est fiable. Corps, query string et en-têtes sont entièrement contrôlés par le client : ils décrivent ce qu'il demande, jamais ce qu'il a le droit de faire."
              },
              {
                type: 'logic',
                prompt: "Une API applique ces règles à `GET /factures/43` : 401 sans preuve valide, 404 si la facture appartient à quelqu'un d'autre, 200 sinon. La facture 43 appartient à Zoé. Quatre requêtes :\n\n- (a) sans jeton ;\n- (b) Zoé, avec un jeton valide ;\n- (c) Linus, avec un jeton valide ;\n- (d) Zoé, avec un jeton expiré.\n\nÉcris les quatre codes dans l'ordre, séparés par des espaces.",
                answer: '401 200 404 401',
                accept: ['401,200,404,401', '401, 200, 404, 401', '401-200-404-401'],
                mistakes: [
                  { answer: '401 200 403 401', why: "Cette API a choisi de répondre 404 pour la facture d'un autre : on ne confirme pas à Linus que la facture 43 existe." },
                  { answer: '401 200 404 200', why: "Un jeton expiré ne prouve plus rien : c'est comme ne pas avoir de jeton, 401. Même si c'est la facture de Zoé." },
                  { answer: '401 200 404 403', why: "Le jeton expiré empêche de savoir qui parle : c'est un problème d'authentification (401), pas d'autorisation (403)." }
                ],
                hint: "Pour chaque requête : sait-on qui parle ? Si oui, est-ce sa facture ?",
                explain: "L'authentification passe en premier : sans preuve valide (a, d), 401. Ensuite seulement l'autorisation : Zoé lit sa facture (200), Linus reçoit 404 au lieu de 403 pour ne rien révéler. L'ordre des vérifications fait partie de la conception."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Écris `peut(utilisateur, action, doc)` pour une appli de documents partagés :\n\n- `utilisateur` vaut `null` : `false` ;\n- un utilisateur de rôle `'admin'` peut tout ;\n- le propriétaire (`doc.proprietaireId === utilisateur.id`) peut `'lire'`, `'modifier'` et `'supprimer'` ;\n- un utilisateur dont l'id figure dans `doc.partageAvec` peut seulement `'lire'` ;\n- toute autre combinaison : `false`.",
              starter: `function peut(utilisateur, action, doc) {
  // ton code ici
  return utilisateur !== null;
}
`,
              solution: `function peut(utilisateur, action, doc) {
  if (!utilisateur) return false;
  if (utilisateur.role === 'admin') return true;
  if (doc.proprietaireId === utilisateur.id) {
    return ['lire', 'modifier', 'supprimer'].includes(action);
  }
  if (doc.partageAvec.includes(utilisateur.id)) return action === 'lire';
  return false;
}
`,
              tests: [
                { code: "assertEqual(peut(null, 'lire', { proprietaireId: 1, partageAvec: [] }), false)", label: "Personne de connecté : false" },
                { code: "assertEqual(peut({ id: 9, role: 'admin' }, 'supprimer', { proprietaireId: 1, partageAvec: [] }), true)", label: "Un admin peut supprimer le document d'un autre" },
                { code: "assertEqual(peut({ id: 1, role: 'membre' }, 'modifier', { proprietaireId: 1, partageAvec: [] }), true)", label: "Le propriétaire peut modifier" },
                { code: "const doc = { proprietaireId: 1, partageAvec: [2] };\nassertEqual([peut({ id: 2, role: 'membre' }, 'lire', doc), peut({ id: 2, role: 'membre' }, 'modifier', doc)], [true, false]);", label: "Partagé avec moi : lire oui, modifier non" },
                { code: "assertEqual(peut({ id: 3, role: 'membre' }, 'lire', { proprietaireId: 1, partageAvec: [2] }), false)", label: "Un inconnu ne lit pas le document" }
              ],
              hint: "Traite les cas du plus fort au plus faible : absent, admin, propriétaire, partage. Chaque cas se termine par un `return`.",
              explain: "Les règles s'enchaînent du plus restrictif au plus permissif, et tout ce qui n'est pas explicitement permis est refusé (le `return false` final). Ce « refus par défaut » est la base d'un contrôle d'accès sûr : un oubli fait échouer une requête légitime, plutôt que d'ouvrir une faille."
            },
            recap: [
              "Authentifier (qui ?) puis autoriser (a-t-il le droit ?).",
              "Rôle et propriété de la ressource se combinent.",
              "Décider avec `req.utilisateur` vérifié, jamais avec ce qu'envoie le client.",
              "401 : inconnu ; 403 : interdit ; 404 : pour ne pas révéler une ressource d'autrui."
            ],
            check: {
              type: 'qcm',
              prompt: "Linus est bien connecté, avec le rôle `lecteur`. Il envoie `DELETE /articles/12` ; l'article existe et Linus peut le lire. Les lecteurs n'ont pas le droit de supprimer. Quel code renvoyer ?",
              choices: ['401', '403', '404', '400'],
              answer: 1,
              why: {
                0: "401 signifie « je ne sais pas qui tu es ». Ici, Linus est authentifié.",
                2: "Linus peut déjà lire l'article : répondre 404 ne cache rien et serait trompeur.",
                3: "La requête est bien formée ; c'est l'action qui est interdite."
              },
              hint: "Le serveur sait-il qui parle ? Si oui, le problème n'est plus l'authentification.",
              explain: "Linus est authentifié mais son rôle ne permet pas l'action : c'est exactement le sens de 403 Forbidden. Le 404 « de discrétion » ne se justifie que si l'utilisateur ne doit même pas savoir que la ressource existe."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u9
      {
        id: 'api.u9',
        title: 'Bases de données',
        summary: "Stocker durablement les données de l'API et passer des lignes SQL au JSON.",
        lessons: [
          {
            id: 'api.u9.l1',
            title: 'Stocker dans une base de données',
            minutes: 8,
            objective: "Tu sais expliquer pourquoi une API stocke ses données dans une base, envoyer une requête SQL depuis Node et transformer les lignes reçues en JSON pour le client.",
            explain: P(
              "Un tableau en mémoire disparaît à chaque redémarrage et n'est pas partagé entre plusieurs serveurs. Une **base de données** garde les données durablement, gère les accès simultanés et les **transactions** (tout ou rien).",
              "- **SQL** (PostgreSQL, MySQL, SQLite) : tables, schéma strict, jointures. Le choix par défaut.\n- **NoSQL** : documents JSON (MongoDB), clé-valeur très rapide (Redis, pour le cache et les sessions).",
              "Ton serveur parle à la base avec un **pilote** (`pg` pour PostgreSQL, `better-sqlite3` pour SQLite) ou un **ORM** (Prisma, Sequelize ; SQLAlchemy en Python) qui génère le SQL. Avec `pg`, les requêtes passent par le réseau et sont asynchrones : `await pool.query(...)`.",
              "Les colonnes SQL suivent souvent le `snake_case` (`date_creation`), le JSON de l'API le `camelCase` : une petite fonction de conversion sépare les deux mondes, et choisit ce qui sort.",
              "À essayer sur ton ordinateur : `npm install better-sqlite3`, puis lance l'exemple avec `node db.js`. Les évolutions du schéma se versionnent avec des **migrations**."
            ),
            example: {
              run: false,
              code: `const Database = require('better-sqlite3');
const db = new Database('boutique.db');      // fichier créé s'il n'existe pas

db.exec('CREATE TABLE IF NOT EXISTS produits (id INTEGER PRIMARY KEY, nom TEXT, prix_centimes INTEGER)');
db.prepare('INSERT INTO produits (nom, prix_centimes) VALUES (?, ?)').run('Clavier', 4990);

const ligne = db.prepare('SELECT * FROM produits WHERE id = ?').get(1);
console.log(ligne);   // { id: 1, nom: 'Clavier', prix_centimes: 4990 }

// Dans une route Express :
// app.get('/produits/:id', (req, res) => { const p = db.prepare('...').get(req.params.id); ... });`,
              notes: [
                { line: 2, text: "SQLite tient dans un fichier : parfait pour apprendre et pour les petits projets." },
                { line: 5, text: "`prepare` prépare la requête, `run` l'exécute pour une écriture. Les `?` reçoivent les valeurs (tu verras pourquoi c'est vital en sécurité)." },
                { line: 7, text: "`get` renvoie la première ligne sous forme d'objet (ou `undefined`)." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Ton API garde les inscriptions dans `const utilisateurs = []`. Elle tourne sur **deux serveurs** derrière un répartiteur de charge. Quel problème vas-tu rencontrer en premier ?",
                choices: [
                  "JavaScript limite les tableaux à 1 000 éléments",
                  "Aucun, tant que chaque serveur a assez de mémoire",
                  "Un utilisateur inscrit via le serveur A est inconnu du serveur B, et tout disparaît au redémarrage",
                  "Les tableaux JavaScript ne peuvent pas contenir d'objets"
                ],
                answer: 2,
                why: {
                  0: "Il n'existe pas de telle limite : un tableau peut contenir des millions d'éléments.",
                  1: "La mémoire n'est pas le problème : chaque serveur a son propre tableau, et la mémoire est vidée à chaque redémarrage ou déploiement.",
                  3: "Un tableau peut contenir n'importe quelle valeur, objets compris."
                },
                hint: "Où vit le tableau ? Combien y en a-t-il ? Que devient-il quand le processus s'arrête ?",
                explain: "La mémoire d'un processus lui est propre et volatile. Avec deux serveurs, il y a deux tableaux qui divergent ; au redémarrage, tout est perdu. Une base de données partagée résout les deux problèmes : c'est elle la source de vérité, les serveurs deviennent interchangeables."
              },
              {
                type: 'fill',
                run: false,
                prompt: "Avec `better-sqlite3`, `get` renvoie une ligne, `all` toutes les lignes, et `run` exécute une écriture. Complète cette couche d'accès aux données.",
                code: `function trouverProduit(db, id) {
  return db.prepare('SELECT id, nom, prix_centimes FROM produits WHERE id = ?').___(id);
}

function ajouterProduit(db, nom, prix) {
  const resultat = db.prepare('INSERT INTO produits (nom, prix_centimes) VALUES (?, ?)').___(nom, prix);
  return resultat.lastInsertRowid;
}

function listerProduits(db) {
  return db.prepare('SELECT * FROM produits ORDER BY nom').___();
}`,
                blanks: [
                  { answers: ['get'], options: ['get', 'all', 'run'], why: { 'all': "`all` renverrait un tableau ; on cherche un seul produit par son identifiant.", 'run': "`run` sert aux écritures et ne renvoie pas la ligne lue." } },
                  { answers: ['run'], options: ['get', 'all', 'run'], why: { 'get': "Un `INSERT` ne lit aucune ligne : `get` n'a rien à renvoyer.", 'all': "`all` est fait pour les `SELECT` ; un `INSERT` s'exécute avec `run`." } },
                  { answers: ['all'], options: ['get', 'all', 'run'], why: { 'get': "`get` ne renverrait que le premier produit de la liste.", 'run': "`run` ne renvoie pas les lignes d'un `SELECT`." } }
                ],
                hint: "Une ligne, plusieurs lignes, ou une écriture ?",
                explain: "`get` pour une ligne (ou `undefined`), `all` pour un tableau de lignes, `run` pour `INSERT`, `UPDATE`, `DELETE` (il renvoie `changes` et `lastInsertRowid`). Regrouper les requêtes dans de petites fonctions garde le SQL hors des routes."
              }
            ],
            challenge: {
              type: 'predict',
              prompt: "`requeteBase` imite un pilote de base de données asynchrone : elle répond après 10 ms. Qu'affiche ce programme ?",
              code: `function requeteBase(sql) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([{ id: 1, nom: 'Clavier' }]), 10);
  });
}

async function route() {
  console.log('avant la requête');
  const lignes = await requeteBase('SELECT * FROM produits');
  console.log('lignes :', lignes.length);
}

route();
console.log('le serveur continue');`,
              answer: `avant la requête
le serveur continue
lignes : 1`,
              mistakes: [
                { answer: `avant la requête
lignes : 1
le serveur continue`, why: "`await` met en pause la fonction `route`, pas tout le programme : `route()` rend la main dès le `await`, et la dernière ligne s'exécute aussitôt." },
                { answer: `le serveur continue
avant la requête
lignes : 1`, why: "Le début de `route` (jusqu'au premier `await`) s'exécute tout de suite, au moment de l'appel." }
              ],
              hint: "Une fonction `async` s'exécute normalement jusqu'à son premier `await`, puis rend la main à l'appelant.",
              explain: "`route()` affiche sa première ligne, lance la requête et se suspend sur `await`. Le reste du programme continue (c'est ainsi que Node sert d'autres requêtes pendant que la base travaille). Après 10 ms, `route` reprend avec le résultat."
            },
            recap: [
              "La mémoire du processus est volatile et non partagée : les données vont en base.",
              "SQL par défaut (PostgreSQL, SQLite) ; Redis pour le cache et les sessions.",
              "Pilote ou ORM ; avec un pilote réseau, les requêtes sont asynchrones (`await`).",
              "Une fonction convertit les lignes en JSON et choisit ce qui sort."
            ],
            check: {
              type: 'code',
              prompt: "La base renvoie des lignes comme `{ id: 3, email: 'zoe@ex.fr', mot_de_passe_hash: '$2b$12$...', est_admin: 0, date_creation: '2026-10-01' }` (SQLite stocke les booléens en 0 ou 1).\n\nÉcris `ligneVersUtilisateur(ligne)` qui renvoie l'objet envoyé au client : `{ id, email, estAdmin, creeLe }`, avec `estAdmin` en vrai booléen. Le hash du mot de passe ne doit **jamais** sortir.",
              starter: `function ligneVersUtilisateur(ligne) {
  // ton code ici
  return ligne;
}
`,
              solution: `function ligneVersUtilisateur(ligne) {
  return {
    id: ligne.id,
    email: ligne.email,
    estAdmin: ligne.est_admin === 1,
    creeLe: ligne.date_creation
  };
}
`,
              tests: [
                { code: "const ligne = { id: 3, email: 'zoe@ex.fr', mot_de_passe_hash: '$2b$12$abc', est_admin: 0, date_creation: '2026-10-01' };\nassertEqual(ligneVersUtilisateur(ligne), { id: 3, email: 'zoe@ex.fr', estAdmin: false, creeLe: '2026-10-01' });", label: "Conversion complète en camelCase" },
                { code: "const ligne = { id: 4, email: 'max@ex.fr', mot_de_passe_hash: 'x', est_admin: 1, date_creation: '2026-10-02' };\nassertEqual(ligneVersUtilisateur(ligne).estAdmin, true);", label: "est_admin 1 devient true" },
                { code: "const r = ligneVersUtilisateur({ id: 5, email: 'a@b.c', mot_de_passe_hash: 'secret', est_admin: 0, date_creation: '2026-10-03' });\nassert(!('mot_de_passe_hash' in r) && !Object.values(r).includes('secret'), 'le hash ne doit pas sortir');", label: "Le hash du mot de passe n'est jamais renvoyé" }
              ],
              hint: "Construis un nouvel objet avec seulement les quatre champs voulus, plutôt que de modifier ou supprimer dans la ligne.",
              explain: "Construire explicitement l'objet de sortie est une liste blanche, comme pour la validation des entrées : une colonne ajoutée plus tard en base (un jeton de réinitialisation, par exemple) ne fuira pas par accident. La conversion de type (`=== 1`) donne au client un vrai booléen JSON."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u10
      {
        id: 'api.u10',
        title: 'Sécurité web',
        summary: "Bloquer les injections SQL et le XSS, configurer CORS, et stocker les mots de passe correctement.",
        lessons: [
          {
            id: 'api.u10.l1',
            title: 'Injection SQL et XSS',
            minutes: 8,
            objective: "Tu sais reconnaître une injection SQL et une faille XSS, et les empêcher avec des requêtes paramétrées et l'échappement HTML.",
            explain: P(
              "Ces deux failles viennent de la même erreur : **mélanger des données et du code**.",
              "**Injection SQL.** Si tu construis une requête par concaténation (`\"... WHERE email = '\" + email + \"'\"`), un attaquant envoie `' OR '1'='1` et la condition devient toujours vraie : il lit, modifie ou efface la base. La parade : les **requêtes paramétrées**. Le SQL contient des marqueurs (`?` avec SQLite, `$1` avec PostgreSQL) et les valeurs passent à part : le pilote les traite toujours comme des données, jamais comme du SQL. Les ORM le font pour toi.",
              "**XSS** (injection de script). Si tu insères le texte d'un utilisateur dans du HTML tel quel, un commentaire `<script>...</script>` s'exécute chez tous les visiteurs et peut voler leur session. La parade : **échapper** à l'affichage (`&` devient `&amp;`, `<` devient `&lt;`, `>` devient `&gt;`, `\"` devient `&quot;`, `'` devient `&#39;`), préférer `textContent` à `innerHTML`, et des moteurs de gabarits qui échappent par défaut.",
              "Ne cherche pas à « nettoyer » les entrées en retirant des mots comme `script` : les contournements sont innombrables."
            ),
            example: {
              code: `const email = "' OR '1'='1";

// Dangereux : la donnée devient du code SQL
const sqlConcatene = "SELECT * FROM users WHERE email = '" + email + "'";
console.log(sqlConcatene);

// Sûr : le SQL ne change jamais, la valeur voyage à part
const sql = 'SELECT * FROM users WHERE email = ?';
const parametres = [email];
console.log(sql, parametres.length);
// En vrai : db.prepare(sql).get(email)`,
              output: `SELECT * FROM users WHERE email = '' OR '1'='1'
SELECT * FROM users WHERE email = ? 1`,
              notes: [
                { line: 1, text: "Une « adresse e-mail » fabriquée par un attaquant." },
                { line: 4, text: "Après concaténation, `OR '1'='1'` fait partie de la requête : la condition est vraie pour toutes les lignes." },
                { line: 8, text: "Le texte SQL est fixe ; le `?` sera rempli par le pilote, qui traite la valeur comme une simple chaîne." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Un formulaire de connexion construit sa requête par concaténation. Un attaquant tape `ada@ex.fr'--` comme e-mail. Qu'affiche ce programme ? (En SQL, `--` commence un commentaire.)",
                code: `function sqlConnexion(email, mdp) {
  return "SELECT id FROM users WHERE email = '" + email + "' AND hash = '" + mdp + "'";
}

console.log(sqlConnexion("ada@ex.fr'--", 'nimportequoi'));`,
                answer: `SELECT id FROM users WHERE email = 'ada@ex.fr'--' AND hash = 'nimportequoi'`,
                mistakes: [
                  { answer: `SELECT id FROM users WHERE email = 'ada@ex.fr'--' AND hash = 'nimportequoi''`, why: "Compte les guillemets : la fonction n'en ajoute qu'un à la fin, après `nimportequoi`." },
                  { answer: `SELECT id FROM users WHERE email = 'ada@ex.fr--' AND hash = 'nimportequoi'`, why: "L'apostrophe tapée par l'attaquant est recopiée telle quelle : elle ferme la chaîne SQL juste après `ada@ex.fr`." }
                ],
                hint: "Remplace `email` et `mdp` par leurs valeurs, caractère par caractère, sans rien ajouter.",
                explain: "L'apostrophe de l'attaquant ferme la chaîne, puis `--` transforme tout le reste en commentaire : la base n'exécute plus que `SELECT id FROM users WHERE email = 'ada@ex.fr'`. La vérification du mot de passe a disparu, l'attaquant est connecté en tant qu'Ada. Avec une requête paramétrée, cette apostrophe ne serait qu'un caractère de l'e-mail."
              },
              {
                type: 'code',
                prompt: "Écris `echapperHtml(texte)` qui remplace `&`, `<`, `>`, `\"` et `'` par `&amp;`, `&lt;`, `&gt;`, `&quot;` et `&#39;`, pour afficher sans danger un texte d'utilisateur dans une page.",
                starter: `function echapperHtml(texte) {
  // ton code ici
  return texte;
}
`,
                solution: `const ENTITES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function echapperHtml(texte) {
  let resultat = '';
  for (const c of texte) {
    resultat += ENTITES[c] || c;
  }
  return resultat;
}
`,
                tests: [
                  { code: "assertEqual(echapperHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;')", label: "Une balise script devient du texte inoffensif" },
                  { code: "assertEqual(echapperHtml('Tom & Jerry'), 'Tom &amp; Jerry')", label: "& devient &amp;" },
                  { code: "assertEqual(echapperHtml('a < b && c > d'), 'a &lt; b &amp;&amp; c &gt; d')", label: "Pas de double échappement" },
                  { code: "assertEqual(echapperHtml('<b title=\"x\">l\\'été</b>'), '&lt;b title=&quot;x&quot;&gt;l&#39;été&lt;/b&gt;')", label: "Guillemets doubles et apostrophes échappés" },
                  { code: "assertEqual(echapperHtml('Bonjour'), 'Bonjour')", label: "Un texte sans caractère spécial ne change pas" }
                ],
                hint: "Parcours le texte caractère par caractère avec `for...of` et un objet de correspondance. Si tu préfères `replaceAll`, remplace `&` en premier, sinon tu échappes deux fois.",
                explain: "Chaque caractère qui a un sens en HTML est remplacé par son entité : le navigateur l'affiche au lieu de l'interpréter. Parcourir caractère par caractère évite le piège du double échappement (`&lt;` qui deviendrait `&amp;lt;`). En pratique, les moteurs de gabarits (EJS, Handlebars, React) le font automatiquement."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Cette fonction échappe le texte placé entre des balises, mais le résultat contient encore des `<` actifs. Clique sur la ligne fautive.",
              code: `function echapper(texte) {
  return texte
    .replaceAll('&', '&amp;')
    .replace('<', '&lt;')
    .replaceAll('>', '&gt;');
}

console.log(echapper('<b>gras</b> & <i>italique</i>'));`,
              bugLine: 4,
              why: "Avec une chaîne comme motif, `replace` ne remplace que la **première** occurrence : seul le premier `<` est échappé, les trois autres restent actifs.",
              fixes: [
                "    .replaceAll('<', '&lt;')",
                "    .replace('<', '&lt;').replace('<', '&lt;')",
                "    .replaceAll('&lt;', '<')"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Deux remplacements ne suffisent pas : le texte contient quatre `<`. Il faut tous les traiter, quel que soit leur nombre.",
                2: "C'est l'inverse : on transformerait des entités en vraies balises."
              },
              output: `&lt;b&gt;gras&lt;/b&gt; &amp; &lt;i&gt;italique&lt;/i&gt;`,
              hint: "Compare la ligne 4 avec ses voisines.",
              explain: "`replace` avec une chaîne s'arrête au premier remplacement ; `replaceAll` (ou une expression régulière avec le drapeau `g`) traite toutes les occurrences. Un seul `<` oublié suffit pour injecter une balise `<img onerror=...>` : l'échappement doit être complet."
            },
            recap: [
              "Injection et XSS : des données traitées comme du code.",
              "SQL : requêtes paramétrées (`?`, `$1`), jamais de concaténation.",
              "HTML : échapper `& < > \" '` à l'affichage, `textContent` plutôt qu'`innerHTML`.",
              "Ne « nettoie » pas les entrées en retirant des mots : échappe ou paramètre."
            ],
            check: {
              type: 'fill',
              run: false,
              prompt: "Complète ces deux fonctions pour qu'elles utilisent des requêtes paramétrées : la première avec SQLite (`better-sqlite3`), la seconde avec PostgreSQL (`pg`).",
              code: `function trouverParEmail(db, email) {
  return db.prepare('SELECT id, email FROM users WHERE email = ___').get(___);
}

async function trouverCommandes(pool, clientId, statut) {
  const resultat = await pool.query(
    'SELECT * FROM commandes WHERE client_id = $1 AND statut = ___',
    [clientId, ___]
  );
  return resultat.rows;
}`,
              blanks: [
                { answers: ['?'], options: ['?', '$1', 'email'], why: { '$1': "`$1` est la syntaxe de PostgreSQL ; avec SQLite et `better-sqlite3`, le marqueur est `?`.", 'email': "Sans guillemets, `email` serait lu comme le nom de la colonne : la condition comparerait la colonne à elle-même et renverrait tout le monde." } },
                { answers: ['email'] },
                { answers: ['$2'], options: ['$2', '$1', '?'], why: { '$1': "`$1` est déjà pris par `clientId` : chaque valeur a son propre numéro.", '?': "Avec `pg`, les marqueurs sont numérotés : `$1`, `$2`…" } },
                { answers: ['statut'] }
              ],
              hint: "Le texte SQL ne contient que des marqueurs ; les valeurs sont passées à côté, dans le même ordre que les marqueurs.",
              explain: "Le SQL est un texte fixe avec des marqueurs, et les valeurs voyagent séparément : `get(email)` pour SQLite, le tableau `[clientId, statut]` pour PostgreSQL, où `$1` et `$2` désignent ses éléments dans l'ordre. Quoi que tape l'utilisateur, ce sera une donnée, jamais du SQL."
            }
          },
          {
            id: 'api.u10.l2',
            title: 'CORS et mots de passe',
            minutes: 8,
            objective: "Tu sais autoriser CORS pour les seules origines de confiance et stocker les mots de passe avec un hachage lent et salé, fourni par une bibliothèque éprouvée.",
            explain: P(
              "**CORS.** Par défaut, un navigateur empêche le JavaScript d'une page (`https://monsite.fr`) de lire la réponse d'une autre **origine** (`https://api.monsite.fr` : autre schéma, domaine ou port). Ton API l'autorise avec l'en-tête `Access-Control-Allow-Origin: https://monsite.fr`. Pour un `PUT`, un `DELETE` ou un corps JSON, le navigateur envoie d'abord une requête de **pré-vérification** `OPTIONS`. Garde une liste d'origines autorisées (paquet `cors` pour Express) ; `*` est interdit avec les cookies. CORS protège les utilisateurs d'un navigateur, pas ton serveur : `curl` l'ignore complètement.",
              "**Mots de passe.** Ne les stocke jamais en clair, ni chiffrés (c'est réversible), ni avec un hachage rapide comme MD5 ou SHA-256 (des milliards d'essais par seconde sur une carte graphique). Utilise un hachage **lent et salé** conçu pour ça, **bcrypt**, **scrypt** ou **Argon2**, via une bibliothèque reconnue (`npm install bcrypt`). Le **sel** aléatoire rend différents deux hachages du même mot de passe.",
              "Règle d'or : **jamais de cryptographie maison**. Tu assembles des briques éprouvées, tu ne les inventes pas."
            ),
            example: {
              run: false,
              code: `const bcrypt = require('bcrypt');
const cors = require('cors');

app.use(cors({ origin: ['https://monsite.fr'], credentials: true }));

async function inscrire(db, email, motDePasse) {
  const hash = await bcrypt.hash(motDePasse, 12);   // 12 = facteur de coût
  db.prepare('INSERT INTO users (email, hash) VALUES (?, ?)').run(email, hash);
}

async function verifier(motDePasse, utilisateur) {
  return bcrypt.compare(motDePasse, utilisateur.hash);
}`,
              notes: [
                { line: 4, text: "Seule cette origine peut lire les réponses depuis un navigateur, cookies compris." },
                { line: 7, text: "`hash` tire un sel aléatoire et l'inclut dans le résultat (`$2b$12$...`). Le facteur 12 règle la lenteur." },
                { line: 8, text: "Seul le hash est stocké : même avec la base volée, le mot de passe reste à deviner, lentement." },
                { line: 12, text: "`compare` relit le sel dans le hash, recalcule et compare en temps constant." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Laquelle de ces façons de stocker les mots de passe est la bonne ?",
                choices: [
                  "`sha256(motDePasse)` : c'est un hachage, donc irréversible",
                  "Chiffrer avec AES et garder la clé dans une variable d'environnement",
                  "`await bcrypt.hash(motDePasse, 12)`, puis `bcrypt.compare` à la connexion",
                  "Un algorithme maison : inverser le texte, ajouter un sel, puis le passer deux fois dans MD5"
                ],
                answer: 2,
                why: {
                  0: "SHA-256 est conçu pour être rapide : une carte graphique teste des milliards de mots de passe par seconde. Et sans sel, deux utilisateurs au même mot de passe ont le même hash.",
                  1: "Le chiffrement est réversible : qui vole la base et la clé récupère tous les mots de passe en clair.",
                  3: "Une construction maison n'a été analysée par personne, et MD5 reste rapide : c'est exactement ce qu'il ne faut pas faire."
                },
                hint: "Un bon stockage doit être irréversible, lent à attaquer et différent pour deux mots de passe identiques.",
                explain: "bcrypt est irréversible, salé automatiquement et volontairement lent (réglable avec le facteur de coût). À la connexion, `bcrypt.compare` refait le calcul avec le sel stocké. Argon2 et scrypt sont d'aussi bons choix ; l'important est d'utiliser une bibliothèque éprouvée."
              },
              {
                type: 'code',
                prompt: "Écris `entetesCors(requete, autorisees)` qui renvoie les en-têtes CORS à ajouter à la réponse. `requete` vaut `{ method, origine }`.\n\n- Si `origine` figure exactement dans la liste `autorisees` : `{ 'Access-Control-Allow-Origin': origine, Vary: 'Origin' }` (`Vary` prévient les caches que la réponse dépend de l'origine) ; pour une pré-vérification (`method` vaut `'OPTIONS'`), ajoute `'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'`.\n- Sinon (origine inconnue ou absente) : `{}`, et le navigateur bloquera la lecture.",
                starter: `function entetesCors(requete, autorisees) {
  // ton code ici
  return { 'Access-Control-Allow-Origin': '*' };
}
`,
                solution: `function entetesCors(requete, autorisees) {
  if (!requete.origine || !autorisees.includes(requete.origine)) return {};
  const entetes = { 'Access-Control-Allow-Origin': requete.origine, Vary: 'Origin' };
  if (requete.method === 'OPTIONS') {
    entetes['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
  }
  return entetes;
}
`,
                tests: [
                  { code: "assertEqual(entetesCors({ method: 'GET', origine: 'https://monsite.fr' }, ['https://monsite.fr']), { 'Access-Control-Allow-Origin': 'https://monsite.fr', Vary: 'Origin' })", label: "Origine autorisée : elle est renvoyée" },
                  { code: "assertEqual(entetesCors({ method: 'GET', origine: 'https://pirate.com' }, ['https://monsite.fr']), {})", label: "Origine inconnue : aucun en-tête" },
                  { code: "assertEqual(entetesCors({ method: 'GET' }, ['https://monsite.fr']), {})", label: "Sans origine (curl, autre serveur) : aucun en-tête" },
                  { code: "assertEqual(entetesCors({ method: 'OPTIONS', origine: 'https://monsite.fr' }, ['https://monsite.fr'])['Access-Control-Allow-Methods'], 'GET, POST, PUT, DELETE')", label: "Pré-vérification OPTIONS : méthodes autorisées" },
                  { code: "assertEqual(entetesCors({ method: 'GET', origine: 'https://monsite.fr.pirate.com' }, ['https://monsite.fr']), {})", label: "Une origine qui commence pareil n'est pas acceptée" }
                ],
                hint: "Compare l'origine avec `includes` sur la liste (égalité exacte), pas avec `startsWith`. Commence par le cas de refus.",
                explain: "On renvoie l'origine exacte de la requête seulement si elle est dans la liste : jamais `*`, et jamais une comparaison approximative (`monsite.fr.pirate.com` commence comme `monsite.fr`). Le paquet `cors` fait ce travail dans Express, mais savoir ce qu'il envoie aide à comprendre les erreurs CORS de la console du navigateur."
              }
            ],
            challenge: {
              type: 'logic',
              prompt: "Avec bcrypt, chaque +1 sur le facteur de coût **double** le temps de calcul. Sur ton serveur, `bcrypt.hash(motDePasse, 10)` prend 60 ms. Combien de millisecondes prend un hachage avec le facteur 13 ?",
              answer: '480',
              accept: ['480 ms', '480ms'],
              mistakes: [
                { answer: '90', why: "Le coût n'ajoute pas un temps fixe : il double le temps à chaque cran." },
                { answer: '240', why: "De 10 à 13, il y a trois crans, donc trois doublements : 60, 120, 240, puis 480." },
                { answer: '180', why: "Doubler trois fois, c'est multiplier par 2 × 2 × 2 = 8, pas par 3." }
              ],
              hint: "Passe de 10 à 11, puis à 12, puis à 13, en doublant à chaque fois.",
              explain: "60 × 2 × 2 × 2 = 480 ms. Le même facteur ralentit l'attaquant : chaque essai lui coûte 8 fois plus cher. On choisit le coût le plus élevé que le serveur supporte à la connexion (souvent 100 à 500 ms), et on l'augmente au fil des années."
            },
            recap: [
              "CORS : le navigateur bloque la lecture entre origines, sauf autorisation explicite de l'API.",
              "Liste d'origines précise, pas de `*` avec des cookies ; CORS ne protège pas le serveur.",
              "Mots de passe : bcrypt, scrypt ou Argon2 (lent et salé), jamais MD5, SHA-256 seul ni chiffrement.",
              "Jamais de cryptographie maison : des bibliothèques éprouvées."
            ],
            check: {
              type: 'bug',
              run: false,
              prompt: "Avec cette fonction, plus personne ne peut se connecter, même avec le bon mot de passe. Clique sur la ligne fautive.",
              code: `async function connecter(db, email, motDePasse) {
  const utilisateur = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!utilisateur) return false;
  return (await bcrypt.hash(motDePasse, 12)) === utilisateur.hash;
}`,
              bugLine: 4,
              why: "`bcrypt.hash` tire un nouveau sel aléatoire à chaque appel : le hash recalculé est différent de celui stocké, même pour le bon mot de passe. La comparaison est donc toujours fausse.",
              fixes: [
                "  return bcrypt.compare(motDePasse, utilisateur.hash);",
                "  return motDePasse === utilisateur.hash;",
                "  return (await bcrypt.hash(motDePasse, 10)) === utilisateur.hash;"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "On comparerait le mot de passe en clair avec son hash : toujours faux (et ça suppose de stocker le mot de passe en clair pour que ça marche).",
                2: "Changer le coût ne change rien : le sel reste aléatoire, le hash toujours différent."
              },
              hint: "Que contient un hash bcrypt, en plus du résultat du calcul ? Et que fait `hash` à chaque appel ?",
              explain: "`bcrypt.compare` lit le sel et le coût enregistrés dans le hash stocké, refait le calcul avec eux, puis compare en temps constant. C'est la seule bonne façon de vérifier un mot de passe : ne jamais recalculer un hash soi-même pour le comparer avec `===`."
            }
          }
        ]
      }
    ]
  });
})();
