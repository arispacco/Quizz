# SUIVI — Le Jeu

Fichier de suivi opérationnel du projet **Le Jeu** (application React Native CLI 0.85 + TypeScript, Firebase, IA Gemini, SQLite hors ligne).

> **Rappel important** : l'utilisateur n'a **pas de NDK Android local** et un **Java 17 instable**. **Aucun build natif ne se fait en local** : tous les builds Android (AAB) et iOS passent par **GitHub Actions**. En local on se contente de : `npm install`, `npm start` (Metro), `npm run typecheck`, `npm run lint`, `npm test`, et le déploiement Firebase (qui ne nécessite pas de NDK).

Légende : `[ ]` à faire · `[x]` fait · `[~]` partiel / infrastructure prête mais non branchée.

---

## 1. Mise en route / Configuration initiale

- [ ] **Installer les dépendances du projet**

  **Comment faire** (depuis la racine `c:\Users\pacco\Quizz`) :
  ```bash
  npm install
  ```

- [ ] **Installer les dépendances des Cloud Functions**

  **Comment faire** :
  ```bash
  cd functions
  npm install
  cd ..
  ```
  Fichier concerné : `functions/package.json`.

- [ ] **Installer Firebase CLI (si absent)**

  **Comment faire** :
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

- [ ] **Créer le projet Firebase**

  **Comment faire** : sur [Firebase Console](https://console.firebase.google.com), créer un projet, puis activer :
  - **Authentication** → Email/Password (minimum)
  - **Realtime Database** → région `europe-west1`
  - **Storage**
  - **Cloud Functions**

  Ajouter une app **Android** (package `com.lejeu`) et une app **iOS**.

- [ ] **Lier le projet Firebase local (`.firebaserc`)**

  **Comment faire** :
  ```bash
  cp .firebaserc.example .firebaserc
  ```
  Puis remplacer `your-firebase-project-id` par votre vrai *project ID* dans `.firebaserc`.
  Vérifier : `firebase use`.

- [ ] **Copier et renseigner les fichiers `.example`**

  **Comment faire** :
  ```bash
  cp .env.example .env
  ```
  Renseigner les vraies valeurs Firebase dans `.env` (clés `FIREBASE_*` et `GOOGLE_WEB_CLIENT_ID`).
  Fichiers concernés : `.env.example` → `.env`.

  > Important : actuellement la config réellement lue par l'app est `src/config/env.ts` (et non `.env`). Voir section 4 pour brancher les vraies valeurs.

- [ ] **Ajouter les fichiers natifs Firebase**

  **Comment faire** : depuis la console Firebase, télécharger et placer :
  | Plateforme | Fichier source | Cible |
  |------------|----------------|-------|
  | Android | `google-services.json` | `android/app/google-services.json` |
  | iOS | `GoogleService-Info.plist` | `ios/LeJeu/GoogleService-Info.plist` |

  Des fichiers `.example` existent (`android/app/google-services.json.example`, `ios/LeJeu/GoogleService-Info.plist.example`) — ne PAS les utiliser en production, ce sont des stubs CI.

- [ ] **Configurer le secret Gemini (`GEMINI_API_KEY`)**

  **Comment faire** : obtenir une clé sur [Google AI Studio](https://aistudio.google.com/apikey), puis :
  ```bash
  firebase functions:secrets:set GEMINI_API_KEY
  # coller la clé quand demandé
  firebase functions:secrets:access GEMINI_API_KEY   # vérifier
  ```
  Functions concernées : `generateQuestions`, `generateQuestionsFromAudio` (`functions/src/index.ts`).

- [ ] **Déployer les règles + les Cloud Functions**

  **Comment faire** :
  ```bash
  npm run functions:build          # compile functions/
  npm run firebase:deploy:all      # functions + database + storage
  ```
  Fichiers concernés : `database.rules.json`, `storage.rules`, `firebase.json`.
  Vérifier : `firebase functions:list`.

---

## 2. Faire tourner l'app

- [ ] **Lancer en mode démo (sans Firebase)**

  **Comment faire** : lancer Metro puis l'app, et choisir **« Mode démo (hors ligne) »** sur l'écran de bienvenue (`WelcomeScreen` → `AuthContext.enterDemoMode()`).
  Le mode démo s'active aussi automatiquement si Firebase n'est pas configuré.
  Disponible en démo : navigation, packs locaux SQLite, duel local. Indisponible : auth Firebase, IA, matchmaking en ligne.

- [ ] **Lancer le bundler Metro**

  **Comment faire** :
  ```bash
  npm start
  # en cas de souci de cache :
  npm start -- --reset-cache
  ```

- [ ] **Builds via GitHub Actions (pas de build natif local)**

  > Rappel : ne **pas** lancer `npm run android` / `npm run ios` ni `./gradlew` en local (pas de NDK, Java 17 instable). Tout passe par les workflows.

  **Comment déclencher un build (2 options) :**
  - **Manuellement** : onglet *Actions* du dépôt GitHub → workflow **« Build Android AAB »** ou **« Build iOS »** → bouton *Run workflow* (déclencheur `workflow_dispatch`).
    En ligne de commande (CLI GitHub) :
    ```bash
    gh workflow run build-android.yml
    gh workflow run build-ios.yml
    ```
  - **Par tag de version** : pousser un tag `v*` déclenche automatiquement les deux builds :
    ```bash
    git tag v0.0.1
    git push origin v0.0.1
    ```

  **Où récupérer le résultat :**
  - **Android** : artifact `app-release-aab` (fichier `app-release.aab`), conservé 14 jours. Onglet *Actions* → run terminé → section *Artifacts*.
  - **iOS** : artifact `ios-simulator-build` (build simulateur non signé), conservé 14 jours.

  Fichiers concernés : `.github/workflows/build-android.yml`, `.github/workflows/build-ios.yml`, `.github/workflows/ci.yml`.

---

## 3. Polices et assets

- [ ] **Ajouter les fichiers de polices**

  Le thème référence : **Rajdhani-Bold**, **Inter-Regular / Inter-Medium**, **RobotoMono-Bold**, **BebasNeue-Regular**.
  Actuellement `assets/fonts/` ne contient qu'un `.gitkeep` → sans ces fichiers, RN utilise les polices système par défaut.

  **Comment faire** :
  1. Télécharger les `.ttf` (Google Fonts) et les placer dans `assets/fonts/`.
  2. Déclarer le dossier des assets dans `react-native.config.js` (créer si absent) :
     ```js
     module.exports = {
       assets: ['./assets/fonts'],
     };
     ```
  3. Lier les polices aux projets natifs :
     ```bash
     npx react-native-asset
     ```
     (copie vers `android/app/src/main/assets/fonts/` et ajoute les entrées `UIAppFonts` dans `ios/.../Info.plist`).
  4. Rebuild natif **via GitHub Actions** (pas en local) pour que les polices soient embarquées.

- [x] **Icônes Phosphor**

  `phosphor-react-native` est déjà installé et utilisé. Rien à faire, sauf vérifier que `react-native-svg` (dépendance requise) est bien présent — c'est le cas dans `package.json`.

---

## 4. À finaliser avant production

- [ ] **Keystore release Android + signing config**

  Actuellement `android/app/build.gradle` utilise `signingConfig signingConfigs.debug` pour le bloc `release` (ligne ~103) → l'AAB est signé en **debug**, non publiable sur le Play Store.

  **Comment faire** :
  1. Générer un keystore release :
     ```bash
     keytool -genkeypair -v -keystore lejeu-release.keystore -alias lejeu -keyalg RSA -keysize 2048 -validity 10000
     ```
  2. Ajouter un `signingConfigs.release` dans `android/app/build.gradle` lisant les identifiants depuis des variables d'environnement / `gradle.properties` (ne PAS committer le keystore ni les mots de passe).
  3. Pour le build CI : stocker le keystore (base64) et les mots de passe en **secrets GitHub**, puis adapter `.github/workflows/build-android.yml` pour les injecter avant `./gradlew bundleRelease`.
  Fichiers concernés : `android/app/build.gradle`, `.github/workflows/build-android.yml`.

- [ ] **Ajouter `GoogleService-Info.plist` au target Xcode iOS**

  Placer le fichier réel dans `ios/LeJeu/` ne suffit pas : il doit être **ajouté au target dans Xcode** (sinon non embarqué dans l'app).

  **Comment faire** (sur macOS, ou documenter pour la personne qui ouvre Xcode) :
  1. Ouvrir `ios/LeJeu.xcworkspace` dans Xcode.
  2. Glisser `GoogleService-Info.plist` dans le navigateur de projet, cocher **« Copy items if needed »** et cocher le target **LeJeu**.
  Fichier concerné : `ios/LeJeu/GoogleService-Info.plist`.

- [ ] **Renseigner les vraies valeurs Firebase dans la config app**

  La config réellement utilisée est `src/config/env.ts` : par défaut `isFirebaseConfigured()` renvoie `false` et les clés sont vides.

  **Comment faire** : éditer `src/config/env.ts` avec les vraies valeurs (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `googleWebClientId`) et faire renvoyer `true` à `isFirebaseConfigured()`. Renseigner aussi `.env` et les `.example` avec les vraies valeurs.
  Fichiers concernés : `src/config/env.ts`, `.env`, `.env.example`, `.firebaserc`.

- [ ] **Vérifier le package name `com.lejeu`**

  Confirmé dans `android/app/build.gradle` (`applicationId "com.lejeu"`). Vérifier la cohérence avec : l'app Android dans la console Firebase, le bundle ID iOS dans Xcode, et `google-services.json` / `GoogleService-Info.plist`.

---

## 5. Fonctionnalités à compléter (vs cahier des charges)

> Source : `docs/cahier_des_charges.md`. Ne pas modifier ce document.

### Déjà en place
- [x] Inscription / connexion **email + mot de passe** (`src/services/firebase/auth.ts`, `LoginScreen`, `RegisterScreen`)
- [x] Récupération de mot de passe par email (`ForgotPasswordScreen`, `resetPassword`)
- [x] Mode **mono-appareil** + **duel local** (moteur de jeu pur dans `src/game/`)
- [x] Packs locaux SQLite + pack par défaut seedé au démarrage (`src/services/db/sqlite.ts`)
- [x] Éditeur de packs manuel (`PackEditorScreen`)
- [x] Import IA depuis **texte** → `generateQuestions` (`PackImportScreen`, `src/services/ai/`)
- [x] Système de **jetons** et **scoring** (game engine : `tokens.ts`, `scoring.ts`)
- [x] Écrans présents (squelettes/fonctionnels) : Bracket tournoi, Mercato, Spectateur, Social, Clubs, Profils

### À compléter / à brancher
- [ ] **OAuth Google / Apple réels** — non implémentés (seul email/mot de passe existe ; `LoginScreen` n'a pas de boutons Google/Apple).

  **Comment faire** : implémenter `signInWithGoogle` / `signInWithApple` dans `src/services/firebase/auth.ts` (libs `@react-native-google-signin/google-signin` et `@invertase/react-native-apple-authentication`), ajouter les boutons dans `LoginScreen.tsx`, configurer `googleWebClientId`.

- [ ] **Mode Local (LAN) P2P** — non implémenté (le mode `local` se limite à un lobby avec code, synchro partielle).

  **Comment faire** : ajouter la découverte/communication pair-à-pair sur le réseau Wi-Fi ; brancher sur `GameLobbyScreen` / `DuelScreen`.

- [ ] **Mode En ligne (matchmaking RTDB)** — `[~]` infrastructure prête mais **non branchée** : `src/services/online/matchmaking.ts` n'est utilisé par aucun écran.

  **Comment faire** : appeler `createOnlineMatch()` / `subscribeToMatch()` depuis `MatchSetupScreen` / `GameLobbyScreen` / `DuelScreen` et synchroniser l'état du duel via RTDB.

- [ ] **Spectateurs temps réel complets** — `[~]` `SpectatorScreen` existe, mais `ExploreScreen` indique « Phase 2 ». Pas de flux temps réel ni de lien de partage.

  **Comment faire** : brancher `subscribeToMatch` / `subscribeToDuel` sur `SpectatorScreen`, générer un lien d'invitation spectateur.

- [ ] **Mercato fonctionnel** — `[~]` `MercatoScreen` affiche des données **mock** (`AVAILABLE`) et le bouton « Recruter » ne fait rien.

  **Comment faire** : alimenter depuis l'état réel du tournoi, implémenter le rachat (débit jetons = valeur du joueur), persister dans RTDB.

- [ ] **ELO en ligne** — `[~]` `src/services/online/elo.ts` existe mais n'est appelé par aucun écran.

  **Comment faire** : appeler la mise à jour ELO en fin de partie **en ligne uniquement**, afficher le classement (Explore/Profil).

- [ ] **Génération audio (IA)** — `[~]` la function `generateQuestionsFromAudio` existe mais l'UI d'import (`PackImportScreen`) ne gère que le texte ; flux audio non branché ni testé.

  **Comment faire** : ajouter la sélection d'un fichier audio (DocumentPicker), encoder en base64, appeler `generateQuestionsFromAudio`, tester de bout en bout.

- [ ] **Recherche d'utilisateurs / amis** — `SocialScreen` affiche « Recherche bientôt disponible » (toast).

  **Comment faire** : implémenter la recherche via `src/services/social/friends.ts` + RTDB.

- [ ] **Clubs (discussion, tournois privés, classement interne)** — à vérifier/compléter (`src/services/social/clubs.ts`, `ClubDetailScreen`).

- [ ] **Tournois (sous-formats, mercato, jetons d'accès aux phases)** — vérifier la complétude du bracket et des règles d'accès (quarts/demies/finale) côté `TournamentBracketScreen`.

- [ ] **XP / niveaux / titres / cosmétiques** — système de progression à compléter selon §9.2 du cahier.

---

## 6. Tests et qualité

- [ ] **Vérification de types**

  **Comment faire** :
  ```bash
  npm run typecheck   # tsc --noEmit
  ```

- [ ] **Lint**

  **Comment faire** :
  ```bash
  npm run lint        # eslint .
  npm run format      # prettier (corrige le formatage src/ + App.tsx)
  ```

- [ ] **Tests unitaires**

  **Comment faire** :
  ```bash
  npm test            # toute la suite Jest
  npm run test:game   # uniquement le moteur de jeu (src/game)
  ```

- [ ] **Quand les lancer** : avant chaque commit/push, et après toute modification du moteur de jeu (`src/game/`) ou des services. La CI (`.github/workflows/ci.yml`) rejoue lint + typecheck + tests + build functions sur push/PR vers `main`/`master`/`develop`.

---

## 7. Workflow de développement recommandé

- [ ] **Une branche par fonctionnalité**

  **Comment faire** :
  ```bash
  git checkout -b feat/nom-fonctionnalite
  ```

- [ ] **Vérifier avant chaque commit** (pour ne rien casser)

  **Comment faire** (enchaîner les 3 commandes ; en PowerShell, séparer par `;`) :
  ```bash
  npm run typecheck
  npm run lint
  npm test
  ```
  Ne committer que si les trois passent.

- [ ] **Pousser et laisser la CI valider**

  **Comment faire** :
  ```bash
  git push -u origin feat/nom-fonctionnalite
  ```
  Ouvrir une PR vers `develop`/`main` ; vérifier que le workflow **CI** est vert avant de fusionner.

- [ ] **Builds de test (APK/AAB/iOS)** : déclencher manuellement les workflows Android/iOS (section 2) plutôt que de builder en local.

- [ ] **Bonnes pratiques projet**
  - Garder le **moteur de jeu** (`src/game/`) pur (pas d'appels réseau, pas d'effets de bord) et couvert par des tests.
  - Utiliser l'alias `@` (`@/models`, `@/ui`, …) configuré dans `tsconfig.json` + `babel.config.js`.
  - Ne pas committer de secrets : `.env`, `.firebaserc`, `google-services.json`, `GoogleService-Info.plist`, keystore.
  - Mettre à jour ce fichier `SUIVI.md` en cochant les tâches au fur et à mesure.
