# 🛡️ Rapport de santé — « Le Jeu »

> Établi par l'agent **GARDIEN** (vérification / health-check) après la fusion des
> contributions des 4 agents (moteur de jeu, UI/navigation, Firebase/CI, doc).
>
> Date : 5 juin 2026 · Node v22.22.0 · npm 11.13.0

---

## 1. Statut baseline

| Vérification | Commande | Résultat | Temps | Détail |
|---|---|---|---|---|
| Typage | `npm run typecheck` | ✅ | ~5,0 s | `tsc --noEmit` — 0 erreur |
| Lint | `npm run lint` | ✅ | ~5,5 s | `eslint .` — 0 erreur, 0 warning |
| Tests | `npm test -- --ci --coverage=false` | ✅ | ~3,2 s (jest 1,8 s) | 5 suites, **29 tests** verts |
| Build Functions | `npm run functions:build` | ✅ | ~2,6 s | `tsc` (functions/) — 0 erreur |

**Baseline globale : ✅ SAINE.** Les 4 vérifications passent. Aucun problème **bloquant** détecté, donc aucune correction de code n'a été nécessaire.

Détail des suites de tests :
- `src/game/__tests__/engine.test.ts`
- `src/game/__tests__/enchere.test.ts`
- `src/game/__tests__/exchange.test.ts`
- `src/game/__tests__/scoring.test.ts`
- `__tests__/App.test.tsx`

---

## 2. Revue de cohérence du code fusionné

### Navigation ↔ écrans ✅
Tous les `navigation.navigate(...)` correspondent aux types de `src/navigation/types.ts` :

| Route | Params attendus (`types.ts`) | Appel réel | OK |
|---|---|---|---|
| `MatchSetup` | `{ format? }` \| undefined | Home/CreateHub/UserPublicProfile | ✅ |
| `GameLobby` | `{ matchId, settings, players }` | `MatchSetupScreen` (les 3 fournis) | ✅ |
| `Duel` | `{ duelId, matchId, local?, settings, players }` | `GameLobbyScreen` (tous fournis) | ✅ |
| `Spectator` | `{ matchId }` | `GameLobbyScreen` | ✅ |
| `PackDetail` | `{ packId }` | Home/Explore | ✅ |
| `ClubDetail` / `UserProfile` | `{ clubId }` / `{ userId }` | Social/Explore | ✅ |

### Flux de jeu ✅
`MatchSetupScreen → GameLobbyScreen → DuelScreen → SpectatorScreen` : les `settings` et `players`
sont transmis intacts de bout en bout. `DuelScreen` protège les accès tableau
(`players[0]?.id ?? 'playerA'`).

### Moteur de jeu ✅
`DuelScreen` importe 15 fonctions depuis `@/game` (`createDuel`, `confirmStrategicChoice`,
`handleExchange*`, `handleEnchere*`, `tick*`, `startNextRound`, `finishRound`,
`isRound3AutoMode`). **Toutes existent** (réexportées via `src/game/index.ts` →
`engine/exchange/enchere/scoring/tokens`). Aucune référence vers une fonction supprimée.
> Note : `createDuel` existe à la fois dans `@/game` (moteur, utilisé par l'écran) et dans
> `@/services/firebase/database` (RTDB). Pas de conflit : modules distincts, imports explicites.

### Références / imports ✅
`tsc --noEmit` couvre tout `src/**/*.{ts,tsx}` (tests inclus ; `functions` typé via son propre
build). 0 erreur ⇒ **aucun import vers un fichier/export inexistant** côté `src/` ni
`functions/src/`.

### Garde-fous Firebase / mode démo ✅
Tous les services réseau vérifient l'état Firebase avant tout appel :
- `online/matchmaking.ts` : `isFirebaseReady()` avant `createMatch/updateMatch`.
- `social/friends.ts`, `social/clubs.ts`, `social/activity.ts` : `ensureFirebase()` en garde + retour anticipé.
- `ai/generateQuestions.ts` : lève une erreur explicite si Firebase non configuré.
- `context/AuthContext.tsx` : `isDemoMode` initial = `!isFirebaseReady()`, profil démo isolé,
  `upsertUserProfile` appelé uniquement si `isFirebaseReady()`.

---

## 3. Problèmes détectés

Aucun problème **bloquant** ni **moyen**. Quelques points **mineurs** (dette / robustesse,
non corrigés volontairement car hors périmètre bloquant) :

| Sévérité | Fichier:ligne | Description | Correction suggérée |
|---|---|---|---|
| 🟢 Mineur | `src/services/firebase/database.ts:5-8` | `ref()` appelle `ensureFirebase()` mais **ignore son retour** ; les fonctions exportées (`upsertUserProfile`, `getUserProfile`, `setPresence`, `createMatch`…) ne s'auto-protègent pas. Sûr aujourd'hui (tous les appelants gardent), mais risque latent si un futur écran les appelle directement en mode démo → `database()` lèverait. | Faire `if (!ensureFirebase()) throw/return` dans `ref()`, ou exiger que tout appelant garde (à documenter). |
| 🟢 Mineur | `functions/src/index.ts:12-16` | `requireAuth(authHeader?: string)` reçoit en réalité `request.auth?.uid` ; le nom du paramètre est trompeur. Fonctionnel (présence de l'uid = authentifié). | Renommer le paramètre en `uid`. |
| 🟢 Mineur | `src/navigation/RootNavigator.tsx:44-45` | Routes `TournamentBracket` et `Mercato` **enregistrées mais jamais atteintes** par un `navigate(...)`. Code mort / fonctionnalité incomplète. | Brancher la navigation depuis le flux tournoi, ou retirer temporairement. |
| 🟢 Mineur | `src/screens/create/MatchSetupScreen.tsx:53-71` | Un objet `Match` complet est construit puis seul `match.players` est utilisé ; `roomCode`, `hostId`, `status`… sont calculés puis ignorés. `GameLobbyScreen` recalcule `roomCode` indépendamment depuis `matchId`. Pas de crash, mais duplication/divergence possible. | Ne construire que les champs nécessaires, ou propager le `match` complet. |

---

## 4. Risques de crash runtime

Analyse des accès aux params de route et aux index de tableau :
- ✅ `route.params.matchId.slice(...)` (`GameLobbyScreen`, `TournamentBracketScreen`) — `matchId` est **requis** par le type et toujours fourni par l'appelant.
- ✅ `route.params.players` / `settings` (`DuelScreen`, `GameLobbyScreen`) — requis et transmis.
- ✅ Accès indexés protégés : `players[0]?.id ?? 'playerA'`, `players.find(...)?.pseudo ?? id`.
- ✅ Aucun usage de Firebase non gardé en mode démo (voir §2).

**Conclusion : aucun risque de crash runtime évident.**

---

## 5. ✅ Checklist garde-fous — à lancer AVANT chaque commit

Exécuter dans l'ordre depuis la racine `c:\Users\pacco\Quizz`. **Ne committer que si tout est vert.**

```powershell
npm run typecheck                          # 1. Types : 0 erreur attendue
npm run lint                               # 2. Lint  : 0 erreur / 0 warning attendu
npm test -- --ci --coverage=false         # 3. Tests : 29 tests verts attendus
npm run functions:build                    # 4. Build Cloud Functions : 0 erreur attendue
```

En une seule commande (PowerShell, s'arrête à la première erreur) :

```powershell
npm run typecheck; if ($LASTEXITCODE) { throw "typecheck KO" }; `
npm run lint; if ($LASTEXITCODE) { throw "lint KO" }; `
npm test -- --ci --coverage=false; if ($LASTEXITCODE) { throw "tests KO" }; `
npm run functions:build; if ($LASTEXITCODE) { throw "functions build KO" }; `
"✅ Tous les garde-fous sont verts."
```

Règles complémentaires :
- ⚠️ **Ne pas builder Android/iOS en local** (pas de NDK, Java 17 instable) → les builds passent par **GitHub Actions** (`ci.yml`, `build-android.yml`, `build-ios.yml`).
- ⚠️ En ajoutant une route : déclarer ses params dans `src/navigation/types.ts`, l'enregistrer dans `RootNavigator.tsx`, et passer **tous** les params requis à chaque `navigate(...)`.
- ⚠️ Tout nouvel appel Firebase doit être gardé par `isFirebaseReady()` / `ensureFirebase()` (mode démo).
- ⚠️ Ne supprimer une fonction du moteur (`src/game/*`) qu'après avoir vérifié ses usages (`DuelScreen` notamment).

---

## 6. 🔁 Comment je vérifierai à l'avenir

À chaque nouvelle revue de santé, GARDIEN relancera exactement :

```powershell
npm run typecheck
npm run lint
npm test -- --ci --coverage=false
npm run functions:build
```

Puis, contrôles de cohérence ciblés :
- Diff des fichiers de navigation : `src/navigation/types.ts`, `src/navigation/RootNavigator.tsx`.
- Cohérence params : comparer chaque `navigation.navigate('X', {...})` aux types de `RootStackParamList`.
- Exports du moteur : `src/game/index.ts` vs imports de `src/screens/game/DuelScreen.tsx`.
- Gardes Firebase : présence de `isFirebaseReady()` / `ensureFirebase()` dans `src/services/**`.
- Référence baseline : ce fichier (`HEALTH_CHECK.md`) — toute régression par rapport au §1 est un signal d'alerte.

---

### Référence baseline (à conserver)
`typecheck ✅ · lint ✅ · 29 tests ✅ · functions build ✅` — état SAIN au 5 juin 2026.
