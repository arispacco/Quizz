# Guide d'installation et configuration — Le Jeu

Guide complet pour configurer l'environnement de développement, Firebase, les secrets Gemini, le mode démo et les builds CI/CD.

---

## Prérequis

| Outil | Version minimale |
|-------|------------------|
| Node.js | ≥ 22.11.0 |
| npm | 10+ |
| Java JDK | 17 (Android) |
| Android SDK + NDK | NDK 27.0.12077973 (CI) |
| Xcode + CocoaPods | macOS uniquement (iOS) |
| Firebase CLI | `npm i -g firebase-tools` |

---

## Installation initiale

### 1. Cloner et installer les dépendances

```bash
cd c:\Users\pacco\Quizz
npm install
```

### 2. Dépendances Cloud Functions

```bash
cd functions
npm install
cd ..
```

### 3. Lancer Metro

```bash
npm start
```

### 4. Lancer sur émulateur/appareil

```bash
# Android
npm run android

# iOS (macOS)
npm run ios
```

---

## Configuration Firebase

### Fichiers natifs

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com).
2. Ajouter une app Android et/iOS.
3. Télécharger et placer :
   - `android/app/google-services.json`
   - `ios/GoogleService-Info.plist`

### Variables d'environnement (`src/config/env.ts`)

Par défaut, `env.isFirebaseConfigured()` retourne `false` et les clés sont vides. Pour activer Firebase, modifier `env.ts` :

```typescript
export const env = {
  firebase: {
    apiKey: 'VOTRE_API_KEY',
    authDomain: 'votre-projet.firebaseapp.com',
    databaseURL: 'https://votre-projet-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'votre-projet',
    storageBucket: 'votre-projet.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:android:abcdef',
  },
  googleWebClientId: 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
  isFirebaseConfigured: () => true,
};
```

> Alternative recommandée en production : utiliser `react-native-config` ou des fichiers `.env` non commités.

### Activer les services Firebase

Dans la console Firebase, activer :
- **Authentication** → Email/Password (minimum)
- **Realtime Database** → région `europe-west1`
- **Storage**
- **Cloud Functions**

### Règles de sécurité

Les fichiers `database.rules.json` et `storage.rules` à la racine sont référencés par `firebase.json`. Les déployer :

```bash
firebase deploy --only database,storage
```

### Liaison du projet Firebase local

```bash
firebase login
firebase use --add
```

---

## Secret Gemini (génération IA)

### 1. Obtenir une clé API

Créer une clé sur [Google AI Studio](https://aistudio.google.com/) ou Google Cloud Console (API Gemini activée).

### 2. Configurer le secret Firebase

```bash
firebase functions:secrets:set GEMINI_API_KEY
# Coller la clé quand demandé
```

### 3. Build et déploiement des Functions

```bash
npm run functions:build
npm run functions:deploy
```

Ou manuellement :

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 4. Vérifier depuis l'app

1. Se connecter (pas en mode démo).
2. Aller dans **Créer → Import IA**.
3. Coller un texte ≥ 50 caractères → **Générer les questions**.

Erreur typique : `Firebase non configuré` → vérifier `env.ts` et l'authentification.

---

## Mode démo (hors ligne)

Le mode démo s'active automatiquement si Firebase n'est pas configuré (`isFirebaseReady() === false` au démarrage).

**Activation manuelle :** bouton « Mode démo (hors ligne) » sur `WelcomeScreen` → `AuthContext.enterDemoMode()`.

| Fonctionnalité | Mode démo |
|----------------|-----------|
| Navigation complète | ✓ |
| Packs locaux (SQLite) | ✓ |
| Duel local (game engine) | ✓ |
| Auth Firebase | ✗ |
| Génération IA | ✗ |
| Matchmaking en ligne | ✗ |
| Profil | `DEMO_PROFILE` fictif |

Le pack par défaut est seedé au bootstrap (`App.tsx` → `DEFAULT_PACKS[0]`).

---

## Scripts npm utiles

| Commande | Description |
|----------|-------------|
| `npm start` | Metro bundler |
| `npm run android` | Build + run Android |
| `npm run ios` | Build + run iOS |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests Jest |
| `npm run test:game` | Tests moteur de jeu uniquement |
| `npm run format` | Prettier sur `src/` |
| `npm run functions:build` | Compile TypeScript Functions |
| `npm run functions:deploy` | Déploie les Cloud Functions |

---

## GitHub Actions

### CI (`ci.yml`)

**Déclencheurs :** push/PR sur `main`, `master`, `develop` ; `workflow_dispatch`.

**Étapes :**
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test -- --ci`
5. Build Functions (`functions/npm ci && npm run build`)

### Build Android (`build-android.yml`)

**Déclencheurs :** tags `v*`, `workflow_dispatch`.

**Produit :** `app-release.aab` (artifact 14 jours).

**Prérequis locaux équivalents :**
```bash
cd android
./gradlew bundleRelease
```

> La signature release nécessite un keystore configuré dans `android/app/build.gradle` (non inclus par défaut).

### Build iOS (`build-ios.yml`)

**Déclencheurs :** tags `v*`, `workflow_dispatch`.

**Produit :** build simulateur non signé (artifact 14 jours).

**Prérequis locaux :**
```bash
cd ios && pod install && cd ..
npm run ios
```

---

## Polices personnalisées

Le thème référence : Rajdhani-Bold, Inter-Regular/Medium, RobotoMono-Bold, BebasNeue-Regular.

Les lier dans les projets natifs :
- **Android :** `android/app/src/main/assets/fonts/`
- **iOS :** `Info.plist` → `UIAppFonts`

Sans ces polices, React Native utilise les polices système par défaut.

---

## Dépannage

### `Firebase non configuré`

- Vérifier `src/config/env.ts` : `isFirebaseConfigured()` doit retourner `true`.
- Vérifier `google-services.json` / `GoogleService-Info.plist`.
- Rebuild natif après ajout des fichiers Firebase.

### SQLite / op-sqlite

- Erreur au démarrage : l'app continue (catch dans `App.tsx` Bootstrap).
- Sur émulateur, vérifier que le module natif est bien lié (rebuild complet).
- Commande : `cd android && ./gradlew clean` puis `npm run android`.

### Génération IA échoue

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `unauthenticated` | Non connecté | Quitter mode démo, se connecter |
| `invalid-argument` | Texte < 50 car. | Allonger le contenu source |
| `IA indisponible` | Functions non déployées | `npm run functions:deploy` |
| Timeout | Secret Gemini absent | `firebase functions:secrets:set GEMINI_API_KEY` |

### Metro / cache

```bash
npm start -- --reset-cache
```

### Erreurs TypeScript sur `@/`

Vérifier que `babel.config.js` contient `module-resolver` avec alias `@ → ./src`.

### Tests Jest

```bash
npm run test:game
```

Si échec sur imports `@/` : le preset Jest RN gère normalement le mapping via babel.

### Build Android CI — NDK

Le workflow installe `ndk;27.0.12077973`. En local, aligner via Android Studio SDK Manager.

### iOS — CocoaPods

```bash
cd ios
pod deintegrate && pod install
```

---

## Checklist premier lancement

- [ ] `npm install` réussi
- [ ] App démarre en mode démo
- [ ] Duel local jouable (Accueil → Face-to-face → Lobby → Duel)
- [ ] Pack par défaut visible dans Explorer
- [ ] (Optionnel) Firebase configuré + auth fonctionnelle
- [ ] (Optionnel) Functions déployées + import IA opérationnel
- [ ] `npm run lint && npm run typecheck && npm test` passent

---

## Ressources

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [React Native Firebase](https://rnfirebase.io/)
