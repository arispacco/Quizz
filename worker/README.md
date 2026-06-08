# Le Jeu — Worker IA (Cloudflare)

Ce Worker remplace les deux Cloud Functions Firebase (`generateQuestions` et
`generateQuestionsFromAudio`) qui appelaient Gemini. Il permet d'utiliser l'IA
**sans** le plan payant Firebase Blaze. Firebase reste utilisé gratuitement pour
l'Auth, la Realtime Database et le Storage.

> Les anciennes Cloud Functions dans `../functions/` ne sont plus utilisées par
> l'application et n'ont **pas** besoin d'être déployées. Le dossier est conservé
> à titre de référence.

## Routes exposées

| Méthode | Route                       | Corps JSON                                      |
| ------- | --------------------------- | ----------------------------------------------- |
| POST    | `/generateQuestions`        | `{ text, theme?, count? }`                      |
| POST    | `/generateQuestionsFromAudio` | `{ audioBase64, mimeType, theme?, count? }`   |

Réponse (identique aux anciennes fonctions) :

```json
{ "questions": [{ "intitule": "...", "theme": "...", "difficulty": 3, "reponses": ["..."] }] }
```

## Sécurité

Chaque requête doit fournir l'en-tête `Authorization: Bearer <idToken>` où
`<idToken>` est l'ID token Firebase de l'utilisateur connecté. Le Worker vérifie
la signature RS256 du JWT contre les clés publiques X.509 de Google
(`securetoken@system.gserviceaccount.com`), et valide `aud`, l'émetteur et
l'expiration. Toute requête non autorisée reçoit un `401`.

## Mise en ligne (gratuit)

1. **Créez un compte Cloudflare gratuit** : https://dash.cloudflare.com/sign-up
2. **Installez les dépendances** (depuis ce dossier `worker/`) :

   ```powershell
   npm install
   ```

3. **Connectez Wrangler à votre compte** :

   ```powershell
   npx wrangler login
   ```

4. **Renseignez l'ID du projet Firebase** dans `wrangler.toml` :
   - Ouvrez `../.firebaserc` et copiez la valeur de `projects.default`.
   - Remplacez `REPLACE_WITH_FIREBASE_PROJECT_ID` dans `[vars]` par cette valeur.

5. **Définissez la clé API Gemini en secret** (ne jamais la mettre dans un fichier) :

   ```powershell
   npx wrangler secret put GEMINI_API_KEY
   ```

   Collez votre clé quand l'invite apparaît. (Clé : https://aistudio.google.com/apikey)

6. **Déployez** :

   ```powershell
   npx wrangler deploy
   ```

   Wrangler affiche l'URL publique, par ex. `https://le-jeu-ai.<votre-sous-domaine>.workers.dev`.

7. **Branchez l'application** : copiez cette URL dans
   `../src/config/ai.ts` (constante `AI_BACKEND_URL`).

## Développement local

```powershell
npm install
npx wrangler dev
```

Pour un test local, créez un fichier `.dev.vars` (non versionné) :

```
FIREBASE_PROJECT_ID = "votre-projet-firebase"
GEMINI_API_KEY = "votre-cle-gemini"
```

## Vérification du build

```powershell
npm run typecheck
```
