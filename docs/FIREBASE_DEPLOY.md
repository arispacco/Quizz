# Déploiement Firebase — Le Jeu

Guide pour déployer les Cloud Functions, les règles Realtime Database / Storage et configurer le secret Gemini.

## Prérequis

- [Firebase CLI](https://firebase.google.com/docs/cli) : `npm install -g firebase-tools`
- Compte Firebase avec un projet créé (région functions : `europe-west1`)
- Node.js 20+ (aligné avec `functions/package.json`)

## Configuration initiale

```bash
# 1. Copier et éditer le projet Firebase cible
cp .firebaserc.example .firebaserc
# Remplacer "your-firebase-project-id" par votre project ID

# 2. Se connecter
firebase login

# 3. Vérifier le projet actif
firebase use
```

### Config mobile (hors déploiement cloud)

| Plateforme | Template | Fichier cible |
|------------|----------|---------------|
| Android | `android/app/google-services.json.example` | `android/app/google-services.json` |
| iOS | `ios/LeJeu/GoogleService-Info.plist.example` | `ios/LeJeu/GoogleService-Info.plist` |

Option alternative : `react-native-config` + `.env` (voir `src/config/env.ts`).

## Secret GEMINI_API_KEY

Les functions `generateQuestions` et `generateQuestionsFromAudio` utilisent le secret Firebase `GEMINI_API_KEY`.

```bash
# Définir le secret (invite interactive ou pipe)
firebase functions:secrets:set GEMINI_API_KEY

# Vérifier qu'il est bien enregistré
firebase functions:secrets:access GEMINI_API_KEY
```

Obtenir une clé API : [Google AI Studio](https://aistudio.google.com/apikey).

> Les secrets sont liés au déploiement : redéployer les functions après création ou rotation d'un secret.

## Build local des functions

```bash
npm run functions:build
# ou
cd functions && npm ci && npm run build
```

## Commandes de déploiement

### Functions uniquement

```bash
npm run functions:deploy
# équivalent : firebase deploy --only functions
```

Le hook `predeploy` dans `firebase.json` compile TypeScript automatiquement.

### Règles Database + Storage

```bash
npm run firebase:deploy:rules
# équivalent : firebase deploy --only database,storage
```

Fichiers déployés :

- `database.rules.json` — Realtime Database
- `storage.rules` — Cloud Storage

### Déploiement complet (functions + rules)

```bash
npm run firebase:deploy:all
# équivalent : firebase deploy --only functions,database,storage
```

### Déploiement ciblé d'une function

```bash
firebase deploy --only functions:generateQuestions
firebase deploy --only functions:generateQuestionsFromAudio
```

## Émulateurs locaux (optionnel)

```bash
cd functions && npm run serve
# ou
firebase emulators:start --only functions,database,storage
```

Ports par défaut (voir `firebase.json`) : Functions 5001, Database 9000, Storage 9199.

## Vérifications post-déploiement

```bash
# Lister les functions déployées
firebase functions:list

# Logs en direct
firebase functions:log --only generateQuestions
```

Depuis l'app (utilisateur authentifié) :

- Callable `generateQuestions` — texte source ≥ 50 caractères
- Callable `generateQuestionsFromAudio` — `audioBase64` + `mimeType`

## CI/CD

Le workflow `.github/workflows/ci.yml` exécute `npm run typecheck` et compile les functions.

Les builds release (`.github/workflows/build-android.yml`, `build-ios.yml`) nécessitent les fichiers Firebase natifs ou des secrets CI injectés — voir les commentaires dans ces workflows.

## Dépannage

| Problème | Solution |
|----------|----------|
| `Secret GEMINI_API_KEY not found` | `firebase functions:secrets:set GEMINI_API_KEY` puis redéployer |
| `Permission denied` sur deploy | `firebase login` + droits Editor/Owner sur le projet |
| Function timeout | Augmenter `timeoutSeconds` dans `functions/src/index.ts` si besoin |
| App non connectée à Firebase | Vérifier `google-services.json` / `GoogleService-Info.plist` et rebuild natif |
