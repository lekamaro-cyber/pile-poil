// CodeQuest — parcours « Back-end et API », chapitre 4 : en production.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  CQ.addChapter('api', {
    id: 'api.c4',
    title: 'En production',
    units: [
      // ------------------------------------------------------------------ api.u11
      {
        id: 'api.u11',
        title: "Variables d'environnement",
        summary: "Séparer la configuration et les secrets du code, et les lire de façon sûre.",
        lessons: [
          {
            id: 'api.u11.l1',
            title: "Configurer avec l'environnement",
            minutes: 7,
            objective: "Tu sais lire la configuration de ton API depuis les variables d'environnement, avec conversions et valeurs par défaut, en gardant les secrets hors de Git.",
            explain: P(
              "Le même code tourne sur ton PC, en test et en production : seule la **configuration** change (port, adresse de la base, clés d'API). On la passe par des **variables d'environnement**, lues dans `process.env` (comme `os.environ` en Python).",
              "- Toutes les valeurs sont des **chaînes** : `process.env.PORT` vaut `'8080'`, et `'false'` est une chaîne non vide, donc vraie dans un `if`. Convertis explicitement.\n- Donne des valeurs par défaut sûres pour le développement, mais **arrête le démarrage** si un secret obligatoire manque : mieux vaut planter tout de suite qu'à la première requête.\n- En local, un fichier `.env` (`PORT=8080`) se charge avec `node --env-file=.env server.js` (Node 20.6 et plus) ou le paquet `dotenv`. Ajoute `.env` à `.gitignore` et versionne un `.env.example` sans les valeurs.",
              "Définir une variable : `$env:PORT = \"8080\"` dans PowerShell (pour la session), ou `PORT=8080 node server.js` en Bash (pour une commande).",
              "Une clé d'API (OpenAI, Stripe) reste **côté serveur** : jamais dans le code du navigateur ni dans une appli mobile."
            ),
            example: {
              code: `function lireConfig(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL manquante');
  return {
    port: Number(env.PORT) || 3000,
    debug: env.DEBUG === 'true',
    databaseUrl: env.DATABASE_URL
  };
}

// Dans server.js : const config = lireConfig(process.env);
const config = lireConfig({ PORT: '8080', DEBUG: 'false', DATABASE_URL: 'postgres://localhost/dev' });
console.log(config.port + 1, config.debug);`,
              output: `8081 false`,
              notes: [
                { line: 2, text: "Un secret obligatoire manque : on refuse de démarrer, avec un message clair." },
                { line: 4, text: "Conversion explicite et valeur par défaut pour le développement." },
                { line: 5, text: "Seule la chaîne exacte `'true'` active le mode debug : `'false'` donne bien `false`." },
                { line: 10, text: "Recevoir `env` en paramètre rend la fonction testable sans toucher au vrai environnement." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Voici des valeurs telles qu'elles arrivent dans `process.env`. Qu'affiche ce programme ?",
                code: `const env = { PORT: '8080', DEBUG: 'false', WORKERS: '' };

console.log(env.PORT + 1);
console.log(env.DEBUG ? 'debug activé' : 'debug coupé');
console.log(Number(env.WORKERS) || 4);
console.log(typeof env.TIMEOUT);`,
                answer: `80801
debug activé
4
undefined`,
                mistakes: [
                  { answer: `8081
debug coupé
4
undefined`, why: "Tout est chaîne : `'8080' + 1` concatène, et `'false'` est une chaîne non vide, donc vraie." },
                  { answer: `80801
debug activé
0
undefined`, why: "`Number('')` vaut 0, qui est faux : `0 || 4` donne 4." }
                ],
                hint: "Une chaîne non vide est toujours vraie, même `'false'`. Et `+` avec une chaîne concatène.",
                explain: "Les variables d'environnement sont du texte. `'false'` active le debug par erreur, le port devient `'80801'`, et une variable absente vaut `undefined`. D'où la fonction de configuration : elle convertit chaque valeur une fois pour toutes, au démarrage."
              },
              {
                type: 'qcm',
                prompt: "Tu as mis ta clé d'API OpenAI dans `.env`, chargé avec `node --env-file=.env server.js`. Que fais-tu avant ton premier `git push` ?",
                choices: [
                  "Je versionne `.env` : le dépôt est privé",
                  "J'ajoute `.env` à `.gitignore` et je versionne un `.env.example` avec des valeurs vides",
                  "Je déplace la clé dans le JavaScript du front-end pour que l'appli l'utilise directement",
                  "J'encode la clé en base64 dans le code source"
                ],
                answer: 1,
                why: {
                  0: "Un dépôt privé peut devenir public, être cloné par un prestataire ou fuiter. Et un secret poussé reste dans l'historique Git même après suppression.",
                  2: "Tout ce qui est envoyé au navigateur est lisible par l'utilisateur : n'importe qui utiliserait ta clé à tes frais.",
                  3: "Le base64 est un encodage, pas un chiffrement : il se décode en une commande."
                },
                hint: "Le secret ne doit apparaître ni dans Git, ni chez le client.",
                explain: "`.gitignore` empêche de versionner `.env` ; `.env.example` documente les variables attendues sans leurs valeurs. En production, l'hébergeur fournit ces variables par son interface. Si un secret a fuité, considère-le comme compromis : révoque-le et génère-en un nouveau."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Écris `lireConfig(env)` qui renvoie `{ port, debug, origines, jwtSecret }` ou lève une erreur :\n\n- `port` : `Number(env.PORT)`, 3000 si `PORT` est absente ; si elle est présente mais n'est pas un entier entre 1 et 65535, lève `new Error('PORT invalide')` ;\n- `debug` : `true` seulement si `env.DEBUG` vaut `'true'` ou `'1'` ;\n- `origines` : `env.CORS_ORIGINS` découpée sur les virgules, espaces retirés, ou `[]` si absente ;\n- `jwtSecret` : `env.JWT_SECRET`, obligatoire et d'au moins 32 caractères, sinon `new Error('JWT_SECRET manquant ou trop court')`.",
              starter: `function lireConfig(env) {
  // ton code ici : cette version naïve tombe dans tous les pièges
  return {
    port: Number(env.PORT),
    debug: Boolean(env.DEBUG),
    origines: [],
    jwtSecret: env.JWT_SECRET
  };
}
`,
              solution: `function lireConfig(env) {
  let port = 3000;
  if (env.PORT !== undefined) {
    port = Number(env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT invalide');
  }
  const debug = env.DEBUG === 'true' || env.DEBUG === '1';
  const origines = env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',').map((o) => o.trim()) : [];
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET manquant ou trop court');
  }
  return { port: port, debug: debug, origines: origines, jwtSecret: env.JWT_SECRET };
}
`,
              tests: [
                { code: "const s = 'x'.repeat(32);\nassertEqual(lireConfig({ JWT_SECRET: s }), { port: 3000, debug: false, origines: [], jwtSecret: s });", label: "Valeurs par défaut quand seul le secret est fourni" },
                { code: "const s = 'x'.repeat(32);\nassertEqual(lireConfig({ PORT: '8080', DEBUG: '1', CORS_ORIGINS: 'https://a.fr, https://b.fr', JWT_SECRET: s }), { port: 8080, debug: true, origines: ['https://a.fr', 'https://b.fr'], jwtSecret: s });", label: "Conversion du port, de DEBUG=1 et de la liste d'origines" },
                { code: "assertEqual(lireConfig({ DEBUG: 'false', JWT_SECRET: 'x'.repeat(32) }).debug, false)", label: "DEBUG='false' donne false" },
                { code: "let message = null;\ntry { lireConfig({ PORT: 'abc', JWT_SECRET: 'x'.repeat(32) }); } catch (e) { message = e.message; }\nassertEqual(message, 'PORT invalide');", label: "PORT=abc : erreur « PORT invalide »" },
                { code: "let message = null;\ntry { lireConfig({ JWT_SECRET: 'court' }); } catch (e) { message = e.message; }\nassertEqual(message, 'JWT_SECRET manquant ou trop court');", label: "Secret trop court : erreur au démarrage" }
              ],
              hint: "Distingue « absente » (`=== undefined`, on prend le défaut) et « présente mais invalide » (on lève une erreur). `split(',')` puis `map` avec `trim` pour la liste.",
              explain: "Une configuration absente prend une valeur par défaut ; une configuration présente mais fausse arrête tout, car elle révèle une erreur de déploiement qu'il vaut mieux voir tout de suite. Le secret est exigé suffisamment long : une clé de signature JWT courte se devine par force brute."
            },
            recap: [
              "La configuration et les secrets vivent dans l'environnement, pas dans le code.",
              "`process.env` ne contient que des chaînes : convertis, et attention à `'false'`.",
              "Défaut sûr si absent, arrêt immédiat si un secret obligatoire manque.",
              "`.env` dans `.gitignore`, `.env.example` versionné, clés d'API seulement côté serveur."
            ],
            check: {
              type: 'fill',
              prompt: "Complète cette fonction de configuration : port converti avec un défaut, mode production détecté, et arrêt si la base n'est pas configurée en production.",
              code: `function config(env) {
  const port = ___(env.PORT) || 3000;
  const modeProd = env.NODE_ENV ___ 'production';
  if (modeProd && !env.DATABASE_URL) {
    ___ new Error('DATABASE_URL manquante');
  }
  return { port, modeProd };
}

console.log(config({ PORT: '4000' }));`,
              blanks: [
                { answers: ['Number'], options: ['Number', 'String', 'Boolean'], why: { 'String': "La valeur est déjà une chaîne : il faut la convertir en nombre.", 'Boolean': "`Boolean('4000')` donne `true`, pas un numéro de port." } },
                { answers: ['==='], options: ['===', '=', '!=='], why: { '=': "`=` affecte au lieu de comparer : on écraserait `NODE_ENV`, et la condition serait toujours vraie.", '!==': "Le mode production serait activé partout sauf en production." } },
                { answers: ['throw'], options: ['throw', 'return', 'console.log'], why: { 'return': "`return new Error(...)` renvoie l'erreur comme une valeur ordinaire : le serveur démarrerait quand même, sans base.", 'console.log': "Afficher l'erreur ne l'arrête pas : le serveur démarrerait et planterait à la première requête." } }
              ],
              output: `{ port: 4000, modeProd: false }`,
              hint: "Il faut convertir, comparer, puis interrompre le démarrage.",
              explain: "`Number` convertit le port, `===` compare sans conversion surprise, et `throw` arrête net le démarrage quand la configuration est incomplète en production. Hors production, l'absence de base est tolérée, ce qui facilite le développement."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u12
      {
        id: 'api.u12',
        title: 'Déploiement et maintenance',
        summary: "Mettre l'API en ligne, la surveiller et la faire évoluer sans casser ses clients.",
        lessons: [
          {
            id: 'api.u12.l1',
            title: 'Mettre son API en ligne',
            minutes: 7,
            objective: "Tu sais préparer une API Node pour l'hébergement : script de démarrage, port fourni par l'hébergeur, route de santé et arrêt propre.",
            explain: P(
              "Pour mettre ton API en ligne, trois grandes options :",
              "- une **plateforme** (PaaS : Render, Railway, Fly.io…) : tu relies ton dépôt Git, elle installe (`npm ci`), lance `npm start` et fournit HTTPS ;\n- des **fonctions serverless** (Vercel, AWS Lambda) : pas de serveur permanent, facturation à la requête ;\n- un **serveur** (VPS) avec Docker : plus de contrôle, plus de maintenance.",
              "Dans tous les cas, ton code doit :",
              "- écouter sur `process.env.PORT`, car c'est l'hébergeur qui choisit le port ;\n- déclarer `\"start\": \"node server.js\"` dans `package.json`, et figer les versions avec `package-lock.json` ;\n- exposer une route de **santé** (`GET /sante`), que la plateforme interroge pour savoir si l'instance est prête ;\n- s'arrêter **proprement** sur le signal `SIGTERM` : finir les requêtes en cours, fermer la base, puis quitter.",
              "Ne déploie qu'après les tests : une intégration continue (GitHub Actions, par exemple) lance `npm test` à chaque push."
            ),
            example: {
              run: false,
              code: `const app = require('./app');
const db = require('./db');

app.get('/sante', (req, res) => res.json({ statut: 'ok' }));

const port = Number(process.env.PORT) || 3000;
const serveur = app.listen(port, () => console.log('Écoute sur le port', port));

process.on('SIGTERM', () => {
  console.log('Arrêt demandé : on termine les requêtes en cours');
  serveur.close(() => {
    db.close();
    process.exit(0);
  });
});`,
              notes: [
                { line: 4, text: "La route de santé : la plateforme l'interroge avant d'envoyer du trafic à l'instance." },
                { line: 6, text: "Le port vient de l'hébergeur ; 3000 sert en local." },
                { line: 9, text: "`SIGTERM` est le signal envoyé par la plateforme lors d'un redéploiement." },
                { line: 11, text: "`close` cesse d'accepter des connexions et attend la fin de celles en cours." }
              ]
            },
            exercises: [
              {
                type: 'order',
                lang: 'text',
                prompt: "Tu pousses un correctif. Remets dans l'ordre ce qui se passe jusqu'à la mise en ligne, sans coupure pour les utilisateurs.",
                lines: [
                  "git push sur la branche main",
                  "L'intégration continue lance npm ci puis npm test",
                  "Les tests passent : la plateforme construit la nouvelle version",
                  "Elle démarre la nouvelle instance avec npm start",
                  "Elle attend que GET /sante réponde 200",
                  "Elle bascule le trafic, puis envoie SIGTERM à l'ancienne instance"
                ],
                hint: "Rien ne part en production si les tests échouent, et l'ancienne version ne s'arrête qu'une fois la nouvelle prête.",
                explain: "Les tests filtrent les erreurs avant tout déploiement. La nouvelle instance démarre à côté de l'ancienne ; la route de santé confirme qu'elle est prête, le trafic bascule, puis l'ancienne reçoit `SIGTERM` et termine proprement ses requêtes. C'est un déploiement sans interruption."
              },
              {
                type: 'code',
                prompt: "Écris `etatSante(verifications)` pour la route `/sante`. `verifications` est un objet de fonctions, par exemple `{ base: () => true, cache: () => { throw new Error('timeout'); } }`. Chaque fonction renvoie `true` si son service répond ; si elle renvoie autre chose ou lève une erreur, ce service est en panne.\n\nRenvoie `{ status, body: { statut, details } }`, où `details` donne `true` ou `false` pour chaque nom : `status` 200 et `statut` `'ok'` si tout va bien, sinon 503 et `'degrade'`.",
                starter: `function etatSante(verifications) {
  // ton code ici
  return { status: 200, body: { statut: 'ok', details: {} } };
}
`,
                solution: `function etatSante(verifications) {
  const details = {};
  for (const nom in verifications) {
    try {
      details[nom] = verifications[nom]() === true;
    } catch (e) {
      details[nom] = false;
    }
  }
  const toutOk = Object.values(details).every((v) => v);
  return {
    status: toutOk ? 200 : 503,
    body: { statut: toutOk ? 'ok' : 'degrade', details: details }
  };
}
`,
                tests: [
                  { code: "assertEqual(etatSante({ base: () => true, cache: () => true }), { status: 200, body: { statut: 'ok', details: { base: true, cache: true } } })", label: "Tout répond : 200 et ok" },
                  { code: "assertEqual(etatSante({ base: () => true, cache: () => { throw new Error('timeout'); } }), { status: 503, body: { statut: 'degrade', details: { base: true, cache: false } } })", label: "Une vérification lève une erreur : 503, sans planter" },
                  { code: "assertEqual(etatSante({ base: () => false }).status, 503)", label: "Une vérification renvoie false : 503" },
                  { code: "assertEqual(etatSante({}), { status: 200, body: { statut: 'ok', details: {} } })", label: "Aucune vérification : 200" }
                ],
                hint: "Appelle chaque fonction dans un `try`/`catch`. `Object.values(details).every(...)` dit si toutes les valeurs sont vraies (et renvoie `true` pour un objet vide).",
                explain: "La route de santé ne doit jamais planter elle-même : chaque vérification est isolée dans un `try`. Le code 503 (Service Unavailable) dit à la plateforme de ne plus envoyer de trafic à cette instance, et `details` indique tout de suite quel service est en cause."
              }
            ],
            challenge: {
              type: 'bug',
              run: false,
              prompt: "En local, tout marche. Sur la plateforme, le déploiement échoue : elle attend le serveur sur le port qu'elle fournit dans la variable `PORT`, ne le trouve jamais, et déclare l'instance en échec. Clique sur la ligne fautive.",
              code: `const app = require('./app');

const port = 3000;
app.listen(port, () => console.log('Écoute sur le port', port));`,
              bugLine: 3,
              why: "Le port est écrit en dur : le serveur écoute sur 3000 alors que la plateforme l'attend sur le port qu'elle a choisi.",
              fixes: [
                "const port = Number(process.env.PORT) || 3000;",
                "const port = 80;",
                "const port = process.env.PORT;"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Toujours un port en dur, et le port 80 demande en plus des droits d'administration sur la plupart des systèmes.",
                2: "Sur la plateforme, ça marcherait ; mais en local, `PORT` est absente et `listen(undefined)` choisit un port au hasard. Il manque la conversion et la valeur par défaut."
              },
              hint: "Qui choisit le port en production ?",
              explain: "En production, c'est l'hébergeur qui attribue le port, via `PORT`. La lecture avec conversion et valeur par défaut fonctionne partout : port imposé en ligne, 3000 en local. C'est l'erreur de premier déploiement la plus courante."
            },
            recap: [
              "PaaS, serverless ou VPS : du plus simple au plus contrôlable.",
              "Écouter sur `process.env.PORT`, démarrer avec `npm start`, versions figées par `package-lock.json`.",
              "Une route `/sante` : 200 si prêt, 503 sinon.",
              "Sur `SIGTERM` : finir les requêtes, fermer la base, quitter."
            ],
            check: {
              type: 'logic',
              prompt: "Ta plateforme démarre la nouvelle instance, l'interroge sur `GET /sante` toutes les 5 secondes (à 5 s, 10 s, 15 s, 20 s…) et bascule le trafic après **3 réponses 200 consécutives**. Ta base accepte les connexions 12 secondes après le démarrage ; avant, `/sante` répond 503. Au bout de combien de secondes le trafic bascule-t-il ?",
              answer: '25',
              accept: ['25 s', '25s', '25 secondes'],
              mistakes: [
                { answer: '15', why: "À 15 s, c'est seulement la première réponse 200. Il en faut trois de suite : 15, 20 et 25 s." },
                { answer: '27', why: "Les vérifications n'ont lieu qu'aux multiples de 5 secondes : la première réponse 200 tombe à 15 s, pas à 12 s." },
                { answer: '20', why: "Compte les réponses 200 : 15 s (1re), 20 s (2e), 25 s (3e)." }
              ],
              hint: "Écris la réponse obtenue à chaque vérification : 5 s, 10 s, 15 s…",
              explain: "À 5 et 10 s, la base n'est pas prête : 503. À 15, 20 et 25 s, `/sante` répond 200 : la troisième réponse consécutive arrive à 25 s, et le trafic bascule. Une route de santé honnête (qui vérifie vraiment la base) évite d'envoyer des utilisateurs vers une instance qui ne peut pas encore leur répondre."
            }
          },
          {
            id: 'api.u12.l2',
            title: "Faire vivre l'API",
            minutes: 7,
            objective: "Tu sais écrire des journaux utiles, faire évoluer une API sans casser ses clients et mettre à jour les dépendances sans risque.",
            explain: P(
              "Une API en production se surveille et s'entretient :",
              "- **Journaux** : écris des lignes JSON (`{\"niveau\":\"error\",\"route\":\"/commandes\",\"duree_ms\":182}`), faciles à filtrer dans l'outil de l'hébergeur (bibliothèque `pino`). Jamais de mot de passe, de jeton ni de numéro de carte dedans.\n- **Surveillance** : taux d'erreurs 5xx, temps de réponse, alertes ; un outil comme Sentry remonte les exceptions avec leur contexte.\n- **Versions de l'API** : ajouter un champ ne casse personne ; supprimer ou renommer un champ casse les clients (une appli mobile pas encore mise à jour). Publie alors `/v2/...` et garde `/v1` le temps de la migration.\n- **Dépendances** : versions **semver** `MAJEUR.MINEUR.CORRECTIF`. Dans `package.json`, `^1.4.2` accepte les `1.x.x` à partir de `1.4.2`, mais pas `2.0.0`, qui peut casser. `npm outdated` liste les retards, `npm audit` les failles connues : mets à jour, teste, puis déploie."
            ),
            example: {
              code: `function journal(niveau, message, contexte) {
  const ligne = { niveau, message, ...contexte };
  delete ligne.motDePasse;           // jamais de secret dans les journaux
  console.log(JSON.stringify(ligne));
}

journal('info', 'commande créée', { route: '/commandes', duree_ms: 42 });
journal('warn', 'connexion refusée', { email: 'ada@ex.fr', motDePasse: 'hunter2' });`,
              output: `{"niveau":"info","message":"commande créée","route":"/commandes","duree_ms":42}
{"niveau":"warn","message":"connexion refusée","email":"ada@ex.fr"}`,
              notes: [
                { line: 2, text: "`...contexte` recopie les champs du contexte dans la ligne (opérateur de décomposition)." },
                { line: 3, text: "Filet de sécurité : un mot de passe passé par erreur n'est jamais écrit." },
                { line: 4, text: "Une ligne JSON par événement. En vrai, on ajoute aussi l'heure (`pino` le fait pour toi)." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Les journaux structurés se filtrent comme des données. Qu'affiche ce programme ?",
                code: `const lignes = [
  '{"niveau":"info","route":"/produits","duree_ms":35}',
  '{"niveau":"error","route":"/commandes","duree_ms":1210}',
  '{"niveau":"info","route":"/commandes","duree_ms":88}',
  '{"niveau":"error","route":"/paiement","duree_ms":30}'
];

const evenements = lignes.map((l) => JSON.parse(l));
const erreurs = evenements.filter((e) => e.niveau === 'error');
console.log(erreurs.length);
console.log(erreurs.map((e) => e.route).join(' '));
console.log(evenements.filter((e) => e.duree_ms > 1000).length);`,
                answer: `2
/commandes /paiement
1`,
                mistakes: [
                  { answer: `2
/commandes /commandes /paiement
1`, why: "La deuxième ligne `/commandes` est de niveau `info` : elle n'est pas dans `erreurs`." },
                  { answer: `2
/commandes /paiement
2`, why: "Seule une requête dépasse 1000 ms (1210) ; `/paiement` est une erreur, mais rapide (30 ms)." }
                ],
                hint: "`filter` garde les éléments pour lesquels la condition est vraie ; traite chaque ligne une par une.",
                explain: "Parce que chaque ligne est du JSON, on peut compter les erreurs, lister les routes en cause ou repérer les requêtes lentes en une ligne de code. C'est exactement ce que font les outils des hébergeurs à grande échelle : impossible avec des journaux en texte libre."
              },
              {
                type: 'qcm',
                prompt: "Ton API publique renvoie `{ \"nom\": \"Ada Lovelace\" }`. Tu veux séparer le champ en `prenom` et `nomFamille`. Une appli mobile installée chez 10 000 personnes lit `nom`. Que fais-tu ?",
                choices: [
                  "Je renomme le champ dès aujourd'hui : les utilisateurs mettront l'appli à jour",
                  "Je garde `nom` mais je le mets à `null`",
                  "J'ajoute `prenom` et `nomFamille` en gardant `nom`, ou je publie une `/v2` en gardant `/v1` le temps de la migration",
                  "Je change le champ et je renvoie 301 vers la nouvelle version"
                ],
                answer: 2,
                why: {
                  0: "Beaucoup d'utilisateurs ne mettent pas à jour tout de suite : leur appli afficherait un nom vide ou planterait.",
                  1: "Le champ existe encore, mais l'appli afficherait « null » ou planterait : c'est aussi un changement cassant.",
                  3: "Une redirection ne transforme pas le format de la réponse : l'ancienne appli recevrait toujours un objet sans `nom`."
                },
                hint: "Ajouter un champ ne casse personne ; retirer ou modifier, si.",
                explain: "La compatibilité ascendante d'abord : on ajoute les nouveaux champs à côté de l'ancien. Si le changement est vraiment incompatible, une nouvelle version d'API cohabite avec l'ancienne, annoncée avec une date de fin, le temps que les clients migrent."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Écris `respecteCaret(plage, version)` : `plage` est de la forme `'^1.4.2'`, `version` de la forme `'1.9.0'`. Renvoie `true` si `version` a le même MAJEUR et n'est pas plus ancienne que la plage, en comparant **numériquement** MINEUR puis CORRECTIF. (On ignore le cas particulier des versions `0.x`.)",
              starter: `function respecteCaret(plage, version) {
  // ton code ici : comparer des chaînes ne marche pas
  return version >= plage.slice(1);
}
`,
              solution: `function respecteCaret(plage, version) {
  const min = plage.slice(1).split('.').map(Number);
  const v = version.split('.').map(Number);
  if (v[0] !== min[0]) return false;
  if (v[1] !== min[1]) return v[1] > min[1];
  return v[2] >= min[2];
}
`,
              tests: [
                { code: "assertEqual([respecteCaret('^1.4.2', '1.4.2'), respecteCaret('^1.4.2', '1.9.0')], [true, true])", label: "1.4.2 et 1.9.0 respectent ^1.4.2" },
                { code: "assertEqual([respecteCaret('^1.4.2', '1.4.1'), respecteCaret('^1.4.2', '1.3.9')], [false, false])", label: "Les versions plus anciennes sont refusées" },
                { code: "assertEqual(respecteCaret('^1.4.2', '2.0.0'), false)", label: "Changement de MAJEUR (2.0.0) refusé" },
                { code: "assertEqual(respecteCaret('^1.4.2', '1.10.0'), true)", label: "1.10.0 est plus récent que 1.4.2 (comparaison numérique)" }
              ],
              hint: "`split('.').map(Number)` transforme `'1.10.0'` en `[1, 10, 0]`. Compare le MAJEUR, puis le MINEUR, puis le CORRECTIF.",
              explain: "Le MAJEUR doit être identique (un changement de majeur peut casser) ; ensuite, il suffit d'être au moins aussi récent. La comparaison de chaînes échoue de deux façons : `'2.0.0' >= '1.4.2'` est vrai alors que 2.0.0 est exclu, et `'1.10.0' >= '1.4.2'` est faux car le caractère `1` vient avant `4`. Les versions se comparent en nombres."
            },
            recap: [
              "Journaux en JSON, sans aucun secret, et surveillance des erreurs 5xx et des temps de réponse.",
              "Ajouter un champ est sûr ; retirer ou renommer impose une nouvelle version d'API.",
              "Semver : MAJEUR (cassant), MINEUR (ajout compatible), CORRECTIF (correction).",
              "`npm outdated`, `npm audit`, puis mise à jour, tests et déploiement."
            ],
            check: {
              type: 'fill',
              lang: 'text',
              prompt: "Ton API est en version `2.3.1` et suit semver. Donne le nouveau numéro de version après chaque changement.",
              code: `2.3.1 + correction d'un bug, rien ne change pour les clients  ->  ___
2.3.1 + nouvelle route facultative, compatible                ->  ___
2.3.1 + suppression du champ "nom" dans les réponses          ->  ___`,
              blanks: [
                { answers: ['2.3.2'], options: ['2.3.2', '2.4.0', '3.0.0'], why: { '2.4.0': "Le MINEUR augmente pour une fonctionnalité ajoutée ; une correction n'augmente que le CORRECTIF.", '3.0.0': "Le MAJEUR est réservé aux changements qui cassent les clients." } },
                { answers: ['2.4.0'], options: ['2.3.2', '2.4.0', '3.0.0'], why: { '2.3.2': "Une nouvelle route est un ajout de fonctionnalité, pas une correction.", '3.0.0': "L'ajout est compatible : aucun client existant n'est cassé." } },
                { answers: ['3.0.0'], options: ['2.3.2', '2.4.0', '3.0.0'], why: { '2.3.2': "Supprimer un champ casse les clients qui le lisent : ce n'est pas une simple correction.", '2.4.0': "Le changement n'est pas compatible : il faut augmenter le MAJEUR." } }
              ],
              hint: "MAJEUR : ça casse. MINEUR : ça ajoute sans casser. CORRECTIF : ça répare. Quand un chiffre augmente, ceux à sa droite repartent à 0.",
              explain: "Une correction donne 2.3.2, un ajout compatible 2.4.0 (le correctif repart à 0), une suppression de champ 3.0.0. Ce numéro est un contrat : grâce à lui, `^2.3.1` dans un `package.json` accepte sans risque 2.3.2 et 2.4.0, mais jamais 3.0.0."
            }
          }
        ]
      }
    ]
  });
})();
