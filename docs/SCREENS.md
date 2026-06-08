# Écrans — Le Jeu

Documentation de chaque écran dans `src/screens/`. Les références design pointent vers [design.md](./design.md).

---

## Navigation — récapitulatif des routes

### Auth Stack (`AuthStackParamList`)

| Route | Écran | Params |
|-------|-------|--------|
| `Welcome` | WelcomeScreen | — |
| `Login` | LoginScreen | — |
| `Register` | RegisterScreen | — |
| `ForgotPassword` | ForgotPasswordScreen | — |

### Main Tabs (`MainTabParamList`)

| Route | Écran | Label |
|-------|-------|-------|
| `Home` | HomeScreen | Accueil |
| `Explore` | ExploreScreen | Explorer |
| `Create` | CreateHubScreen | Créer |
| `Social` | SocialScreen | Social |
| `Profile` | ProfileScreen | Moi |

### Root Stack (`RootStackParamList`)

| Route | Écran | Params |
|-------|-------|--------|
| `Auth` | AuthNavigator | — |
| `Main` | MainTabs | — |
| `MatchSetup` | MatchSetupScreen | `{ format?: GameFormat }` |
| `PackEditor` | PackEditorScreen | `{ packId?: string }` |
| `PackDetail` | PackDetailScreen | `{ packId: string }` |
| `PackImport` | PackImportScreen | — |
| `GameLobby` | GameLobbyScreen | `{ matchId: string }` |
| `Duel` | DuelScreen | `{ duelId: string; local?: boolean }` |
| `TournamentBracket` | TournamentBracketScreen | `{ matchId: string }` |
| `Mercato` | MercatoScreen | `{ matchId: string }` |
| `Spectator` | SpectatorScreen | `{ matchId: string }` |
| `Settings` | SettingsScreen | — |
| `ClubDetail` | ClubDetailScreen | `{ clubId: string }` |
| `UserProfile` | UserPublicProfileScreen | `{ userId: string }` |

---

## Authentification

### WelcomeScreen

**Fichier :** `src/screens/auth/WelcomeScreen.tsx`

| | |
|---|---|
| **Route** | `Auth → Welcome` |
| **Props** | Aucune (navigation via hooks) |
| **État local** | Aucun |
| **Services** | `AuthContext.enterDemoMode()` |
| **Design** | [§3.1 Écran de bienvenue](./design.md#3-écrans--authentification) |

**Comportement :** Affiche le logo « LE JEU », boutons Commencer (→ Register), Connexion (→ Login), Mode démo hors ligne.

---

### LoginScreen

**Fichier :** `src/screens/auth/LoginScreen.tsx`

| | |
|---|---|
| **Route** | `Auth → Login` |
| **État local** | `email`, `password`, `loading` |
| **Services** | `AuthContext.signIn`, `useToast` |
| **Design** | [§3.3 Connexion](./design.md#3-écrans--authentification) |

**Comportement :** Formulaire email/mot de passe, lien mot de passe oublié, redirection automatique après connexion réussie.

---

### RegisterScreen

**Fichier :** `src/screens/auth/RegisterScreen.tsx`

| | |
|---|---|
| **Route** | `Auth → Register` |
| **État local** | `pseudo`, `email`, `password`, `confirm`, `loading` |
| **Services** | `AuthContext.signUp` (→ Firebase Auth + `upsertUserProfile`) |
| **Design** | [§3.2 Inscription](./design.md#3-écrans--authentification) |

**Comportement :** Validation confirmation mot de passe, création compte et profil RTDB.

---

### ForgotPasswordScreen

**Fichier :** `src/screens/auth/ForgotPasswordScreen.tsx`

| | |
|---|---|
| **Route** | `Auth → ForgotPassword` |
| **État local** | `email`, `loading` |
| **Services** | `AuthContext.sendReset` |
| **Design** | [§3.3 Connexion — mot de passe oublié](./design.md#3-écrans--authentification) |

---

## Accueil et exploration

### HomeScreen

**Fichier :** `src/screens/home/HomeScreen.tsx`

| | |
|---|---|
| **Route** | `Main → Home` |
| **État local** | `packs: Pack[]` |
| **Services** | `getAllPacks()` (SQLite), `DEFAULT_PACKS` (fallback), `AuthContext.profile` |
| **Navigation sortante** | `MatchSetup` (avec `format`), `PackDetail` (indirect via packs) |
| **Design** | [§5 Écrans — Accueil](./design.md#5-écrans--accueil) |

**Comportement :** Salutation personnalisée, 3 boutons formats (Tournoi, Face-to-face, All-team), top 3 packs populaires.

---

### ExploreScreen

**Fichier :** `src/screens/explore/ExploreScreen.tsx`

| | |
|---|---|
| **Route** | `Main → Explore` |
| **État local** | `packs`, `query`, `filter` (`packs` \| `tournaments`) |
| **Services** | `getAllPacks()`, `DEFAULT_PACKS` |
| **Navigation sortante** | `PackDetail` |
| **Design** | [§6 Écrans — Explorer](./design.md#6-écrans--explorer) |

**Comportement :** Recherche textuelle sur packs, filtre Packs/Tournois (tournois = placeholder Phase 2).

---

## Création

### CreateHubScreen

**Fichier :** `src/screens/create/CreateHubScreen.tsx`

| | |
|---|---|
| **Route** | `Main → Create` |
| **État local** | Aucun |
| **Navigation sortante** | `MatchSetup`, `PackEditor`, `PackImport` |
| **Design** | [§7.1 Hub de création](./design.md#7-écrans--création) |

---

### MatchSetupScreen

**Fichier :** `src/screens/create/MatchSetupScreen.tsx`

| | |
|---|---|
| **Route** | `MatchSetup` |
| **Params** | `format?` — pré-sélection depuis Home |
| **État local** | `step` (1–4), `format`, `connectionMode`, `exchangeTime`, `enchereTime`, `teamCount` |
| **Services** | Aucun persistant (match créé en mémoire, non sauvé RTDB) |
| **Navigation sortante** | `GameLobby` avec `matchId` UUID |
| **Design** | [§7.2 Paramétrage](./design.md#7-écrans--création) |

**Étapes :**
1. Format + mode connexion
2. Nombre d'équipes (Stepper)
3. Chronos Échange/Enchère
4. Récapitulatif + lancement

---

### PackEditorScreen

**Fichier :** `src/screens/create/PackEditorScreen.tsx`

| | |
|---|---|
| **Route** | `PackEditor` |
| **Params** | `packId?` — édition d'un pack existant |
| **État local** | `name`, `description`, `mainTheme`, `visibility`, `questions`, `draftIntitule`, `draftReponses` |
| **Services** | `getPackById`, `getPackQuestions`, `savePack`, `AuthContext.profile` |
| **Design** | [§7.3 Éditeur manuel](./design.md#7-écrans--création) |

---

### PackDetailScreen

**Fichier :** `src/screens/create/PackDetailScreen.tsx`

| | |
|---|---|
| **Route** | `PackDetail` |
| **Params** | `packId: string` |
| **État local** | `pack`, `questions` |
| **Services** | `getPackById`, `getPackQuestions`, `DEFAULT_PACKS`, `DEFAULT_QUESTIONS` |
| **Design** | [§14.2 Fiche d'un pack](./design.md#14-écrans--bibliothèque-de-packs) |

---

### PackImportScreen

**Fichier :** `src/screens/create/PackImportScreen.tsx`

| | |
|---|---|
| **Route** | `PackImport` |
| **État local** | `text`, `loading`, `generated`, `packName` |
| **Services** | `generateQuestionsFromText`, `savePack`, `DocumentPicker` |
| **Design** | [§7.4 Import IA](./design.md#7-écrans--création) |

**Comportement :** Import fichier texte, appel Cloud Function, édition des questions générées, sauvegarde SQLite.

---

## Jeu

### GameLobbyScreen

**Fichier :** `src/screens/game/GameLobbyScreen.tsx`

| | |
|---|---|
| **Route** | `GameLobby` |
| **Params** | `matchId: string` |
| **État local** | Aucun |
| **Navigation sortante** | `Duel` (local), `Spectator` |
| **Design** | [§10 Écrans — Lobby](./design.md#10-écrans--lobby) |

**Comportement :** Affiche code salle (6 premiers caractères du matchId), statuts joueurs mock, lance le duel.

---

### DuelScreen

**Fichier :** `src/screens/game/DuelScreen.tsx`

| | |
|---|---|
| **Route** | `Duel` |
| **Params** | `duelId`, `local?` |
| **État local** | `duel` (Duel), `selectedMode`, `selectedTheme`, `bidAmount` |
| **Services / Engine** | `@/game` (createDuel, confirmStrategicChoice, handleExchange*, handleEnchere*, finishRound, startNextRound), `DEFAULT_QUESTIONS` |
| **Design** | [§11 Déroulement du jeu](./design.md#11-écrans--déroulement-du-jeu) |

**Phases UI :**
- `choosing` — sélection mode/thème
- `playing` + `echange` — chrono, validation réponses
- `playing` + `enchere` — enchères puis réponses
- `round_result` — score intermédiaire
- `finished` — victoire + jetons

**Chrono :** `setInterval` 1s décrémente `timeRemaining` et déclenche timeouts.

---

### SpectatorScreen

**Fichier :** `src/screens/game/SpectatorScreen.tsx`

| | |
|---|---|
| **Route** | `Spectator` |
| **Params** | `matchId` |
| **État local** | Aucun (données statiques) |
| **Design** | [§13 Écran Spectateur](./design.md#13-écran-spectateur) |

---

## Tournoi

### TournamentBracketScreen

**Fichier :** `src/screens/tournament/TournamentBracketScreen.tsx`

| | |
|---|---|
| **Route** | `TournamentBracket` |
| **Params** | `matchId` |
| **État local** | `BRACKET` (mock constant) |
| **Design** | [§12.1 Bracket](./design.md#12-écrans--tournoi) |

---

### MercatoScreen

**Fichier :** `src/screens/tournament/MercatoScreen.tsx`

| | |
|---|---|
| **Route** | `Mercato` |
| **Params** | `matchId` (non utilisé actuellement) |
| **État local** | `players` (mock `AVAILABLE`) |
| **Design** | [§12.2 Mercato](./design.md#12-écrans--tournoi) |

---

## Social

### SocialScreen

**Fichier :** `src/screens/social/SocialScreen.tsx`

| | |
|---|---|
| **Route** | `Main → Social` |
| **État local** | `tab` (`friends` \| `clubs` \| `activity`) |
| **Données** | `MOCK_CLUBS`, `MOCK_FRIENDS` (pas encore branchés RTDB) |
| **Navigation sortante** | `ClubDetail`, `UserProfile` |
| **Design** | [§8 Écrans — Social](./design.md#8-écrans--social) |

---

### ClubDetailScreen

**Fichier :** `src/screens/social/ClubDetailScreen.tsx`

| | |
|---|---|
| **Route** | `ClubDetail` |
| **Params** | `clubId` |
| **Services** | Mock (futur : `getClub`, `joinClub`) |
| **Design** | [§8.3 Page d'un club](./design.md#8-écrans--social) |

---

## Profil

### ProfileScreen

**Fichier :** `src/screens/profile/ProfileScreen.tsx`

| | |
|---|---|
| **Route** | `Main → Profile` |
| **État local** | `tab` (`stats` \| `history` \| `packs`), `packs`, `history` |
| **Services** | `getAllPacks`, `getMatchHistory`, `AuthContext` |
| **Navigation sortante** | `Settings` |
| **Design** | [§9.1 Profil personnel](./design.md#9-écrans--profil) |

---

### UserPublicProfileScreen

**Fichier :** `src/screens/profile/UserPublicProfileScreen.tsx`

| | |
|---|---|
| **Route** | `UserProfile` |
| **Params** | `userId` |
| **Services** | Mock (futur : `getUserProfile`, `followUser`) |
| **Design** | [§9.2 Profil public](./design.md#9-écrans--profil) |

---

## Paramètres

### SettingsScreen

**Fichier :** `src/screens/settings/SettingsScreen.tsx`

| | |
|---|---|
| **Route** | `Settings` |
| **État local** | Aucun (thème via contexte) |
| **Services** | `useTheme` (toggle dark/light → AsyncStorage) |
| **Design** | [§15 Écrans — Paramètres](./design.md#15-écrans--paramètres) |

---

## Matrice écran → services

| Écran | SQLite | Firebase | Game Engine | IA |
|-------|--------|----------|-------------|-----|
| Home | ✓ | — | — | — |
| Explore | ✓ | — | — | — |
| PackEditor | ✓ | — | — | — |
| PackDetail | ✓ | — | — | — |
| PackImport | ✓ | ✓ (Functions) | — | ✓ |
| MatchSetup | — | — | — | — |
| GameLobby | — | — | — | — |
| Duel | — | — | ✓ | — |
| Profile | ✓ | — | — | — |
| Login/Register | — | ✓ | — | — |
| Social | — | (prévu) | — | — |
