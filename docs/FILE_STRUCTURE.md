# Structure des fichiers — Le Jeu

Arborescence commentée des fichiers importants du projet. Les dossiers natifs (`android/`, `ios/`), `node_modules/` et fichiers de config racine standards ne sont listés que lorsqu'ils sont pertinents.

---

## Racine du projet

```
Quizz/
├── App.tsx                    # Point d'entrée : bootstrap SQLite, providers, navigation
├── package.json               # Dépendances RN, scripts npm (test, lint, functions)
├── tsconfig.json              # Alias @/* → src/*, strict mode
├── babel.config.js            # module-resolver (@), reanimated plugin
├── firebase.json              # Config Firebase (functions, database, storage rules)
├── database.rules.json        # Règles de sécurité Realtime Database
├── storage.rules              # Règles Firebase Storage
├── jest.config.js             # Configuration tests unitaires
└── docs/                      # Documentation technique (ce dossier)
```

---

## `src/` — Code applicatif

### `src/config/`

| Fichier | Rôle |
|---------|------|
| `env.ts` | Configuration Firebase (clés vides par défaut). `isFirebaseConfigured()` retourne `false` tant que les clés ne sont pas renseignées. |

### `src/context/`

| Fichier | Rôle |
|---------|------|
| `AuthContext.tsx` | Provider d'authentification : état user/profile, mode démo, méthodes signIn/signUp/logout/enterDemoMode. |

### `src/data/`

| Fichier | Rôle |
|---------|------|
| `defaultPacks.ts` | Pack et questions intégrés pour le mode hors ligne (`DEFAULT_PACKS`, `DEFAULT_QUESTIONS`). |

### `src/game/` — Moteur de jeu (logique pure)

| Fichier | Rôle |
|---------|------|
| `index.ts` | Barrel export de tous les modules game. |
| `engine.ts` | State machine du duel : création, choix stratégique, handlers Échange/Enchère, fin de tour/duel. |
| `exchange.ts` | État et transitions du mode Échange (chrono, buzz, réponses). |
| `enchere.ts` | État et transitions du mode Enchère (enchères, phase réponse, résolution). |
| `scoring.ts` | Multiplicateurs de thème et calcul de points par phase de tournoi. |
| `tokens.ts` | Récompenses et coûts en jetons selon la phase du tournoi. |
| `__tests__/engine.test.ts` | Tests unitaires du moteur (duel, enchère, round 3). |
| `__tests__/scoring.test.ts` | Tests des multiplicateurs de thème. |

### `src/models/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Réexporte types et schémas. |
| `types.ts` | Contrats TypeScript métier : UserProfile, Pack, Question, Match, Duel, Bracket, Club, etc. |
| `schemas.ts` | Chemins RTDB (`RTDB_PATHS`), schéma SQL (`SQLITE_SCHEMA`), clés AsyncStorage (`ASYNC_STORAGE_KEYS`). |

### `src/navigation/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export RootNavigator et types. |
| `types.ts` | ParamLists TypeScript pour Auth, Main tabs et Root stack. |
| `RootNavigator.tsx` | Stack racine : bascule Auth/Main selon authentification ou mode démo. |
| `AuthNavigator.tsx` | Stack auth : Welcome → Login → Register → ForgotPassword. |
| `MainTabs.tsx` | Bottom tabs : Home, Explore, Create, Social, Profile (icônes Phosphor). |

### `src/screens/` — Écrans par domaine

#### `src/screens/auth/`

| Fichier | Rôle |
|---------|------|
| `WelcomeScreen.tsx` | Landing : inscription, connexion, entrée mode démo. |
| `LoginScreen.tsx` | Connexion email/mot de passe via AuthContext. |
| `RegisterScreen.tsx` | Inscription avec pseudo, création profil RTDB. |
| `ForgotPasswordScreen.tsx` | Réinitialisation mot de passe par email. |

#### `src/screens/home/`

| Fichier | Rôle |
|---------|------|
| `HomeScreen.tsx` | Accueil : raccourcis formats de jeu, packs populaires (SQLite + défaut). |

#### `src/screens/explore/`

| Fichier | Rôle |
|---------|------|
| `ExploreScreen.tsx` | Recherche et liste des packs ; placeholder tournois publics. |

#### `src/screens/create/`

| Fichier | Rôle |
|---------|------|
| `CreateHubScreen.tsx` | Hub : créer une partie ou un pack (manuel / import IA). |
| `MatchSetupScreen.tsx` | Wizard 4 étapes : format, équipes, chronos, récapitulatif → GameLobby. |
| `PackEditorScreen.tsx` | Éditeur manuel de pack, persistance SQLite. |
| `PackDetailScreen.tsx` | Fiche pack avec aperçu des questions. |
| `PackImportScreen.tsx` | Import texte/fichier + génération IA via Cloud Function. |

#### `src/screens/game/`

| Fichier | Rôle |
|---------|------|
| `GameLobbyScreen.tsx` | Lobby local : code salle, lancement duel ou spectateur. |
| `DuelScreen.tsx` | Écran principal de jeu : intègre le game engine en local. |
| `SpectatorScreen.tsx` | Vue spectateur (mock données temps réel). |

#### `src/screens/tournament/`

| Fichier | Rôle |
|---------|------|
| `TournamentBracketScreen.tsx` | Affichage bracket (données mock). |
| `MercatoScreen.tsx` | Fenêtre mercato : recrutement joueurs éliminés (mock). |

#### `src/screens/social/`

| Fichier | Rôle |
|---------|------|
| `SocialScreen.tsx` | Onglets Amis / Clubs / Activité (données mock + navigation). |
| `ClubDetailScreen.tsx` | Détail club : membres, classement, rejoindre. |

#### `src/screens/profile/`

| Fichier | Rôle |
|---------|------|
| `ProfileScreen.tsx` | Profil personnel : stats, historique SQLite, packs, déconnexion. |
| `UserPublicProfileScreen.tsx` | Profil public d'un autre joueur : suivre, défier. |

#### `src/screens/settings/`

| Fichier | Rôle |
|---------|------|
| `SettingsScreen.tsx` | Paramètres : thème clair/sombre, notifications, version. |

### `src/services/`

#### `src/services/db/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export preferences + sqlite. |
| `sqlite.ts` | CRUD packs, questions, historique matchs, stats locales (op-sqlite). |
| `preferences.ts` | Wrapper AsyncStorage pour préférences utilisateur. |

#### `src/services/firebase/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Barrel export config, auth, database, storage. |
| `config.ts` | Initialisation lazy Firebase ; `ensureFirebase()` / `isFirebaseReady()`. |
| `auth.ts` | Auth email, mapping vers UserProfile, reset password. |
| `database.ts` | CRUD RTDB users/matches/duels, subscriptions temps réel, présence. |
| `storage.ts` | Upload audio et texte vers Firebase Storage. |

#### `src/services/ai/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export generateQuestions. |
| `generateQuestions.ts` | Client callable Firebase : texte et audio → questions IA. |

#### `src/services/online/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export matchmaking, elo, bracket. |
| `matchmaking.ts` | Création match en ligne, join, start (RTDB). |
| `bracket.ts` | Génération bracket, avancement vainqueur. |
| `elo.ts` | Calcul ELO (K=32) et paliers. |

#### `src/services/social/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export friends, clubs, activity. |
| `friends.ts` | Follow/unfollow, liste followers (RTDB `follows/`). |
| `clubs.ts` | CRUD clubs, adhésion (RTDB `clubs/`, `clubMembers/`). |
| `activity.ts` | Publication et lecture fil d'activité (RTDB `activities/`). |

### `src/theme/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Export tokens et ThemeProvider. |
| `tokens.ts` | Palette arc-en-ciel, thèmes dark/light, spacing, radius, typography. |
| `ThemeProvider.tsx` | Contexte thème, persistance mode dark/light via AsyncStorage. |

### `src/ui/`

| Fichier | Rôle |
|---------|------|
| `index.ts` | Barrel export de tous les composants UI. |
| `Button.tsx` | Bouton avec variants primary/secondary/danger/gold/ghost. |
| `Card.tsx` | Carte avec accent coloré selon mode de jeu. |
| `Input.tsx` | Champ texte avec label et message d'erreur. |
| `Badge.tsx` | Pill colorée pour thèmes, statuts. |
| `Chrono.tsx` | Cercle de progression animé (Reanimated + SVG). |
| `Stepper.tsx` | Contrôle numérique +/- pour paramétrage. |
| `Toast.tsx` | Provider + hook useToast pour notifications éphémères. |

---

## `functions/src/` — Cloud Functions

| Fichier | Rôle |
|---------|------|
| `index.ts` | Points d'entrée HTTPS callable : `generateQuestions`, `generateQuestionsFromAudio`. |
| `gemini.ts` | Client Google GenAI (gemini-2.5-flash), prompts et schéma JSON structuré. |
| `schema.ts` | Schémas Zod et type `GeneratedQuestion` pour validation. |

---

## `.github/workflows/`

| Fichier | Rôle |
|---------|------|
| `ci.yml` | CI sur push/PR : lint, typecheck, tests Jest, build Functions. |
| `build-android.yml` | Build AAB release (tags `v*` ou manuel), upload artifact. |
| `build-ios.yml` | Build simulateur iOS unsigned (tags `v*` ou manuel), upload artifact. |

---

## Fichiers natifs (référence)

| Chemin | Rôle |
|--------|------|
| `android/app/google-services.json` | Config Firebase Android (à ajouter manuellement). |
| `ios/GoogleService-Info.plist` | Config Firebase iOS (à ajouter manuellement). |
| `android/` | Projet Gradle React Native. |
| `ios/LeJeu.xcworkspace` | Projet Xcode (CocoaPods). |
