# Le Jeu — Application Quiz/Stratégie

Application mobile React Native CLI (TypeScript) de culture générale et stratégie, avec modes **Échange** et **Enchère**.

## Stack

- **Mobile**: React Native CLI 0.85 + TypeScript
- **Backend**: Firebase (Auth, Realtime Database, Storage, Cloud Functions)
- **IA**: Google Gemini (`gemini-2.5-flash`) via Cloud Functions
- **Hors ligne**: SQLite (`@op-engineering/op-sqlite`) + AsyncStorage
- **CI/CD**: GitHub Actions (lint, tests, build Android AAB, build iOS)

## Démarrage rapide

```bash
npm install
npm start
# Builds via GitHub Actions — pas de NDK/Java local requis
```

### Mode démo

Sans configuration Firebase, lancez l'app et choisissez **Mode démo** sur l'écran de bienvenue.

### Configuration Firebase

1. Créez un projet Firebase
2. Copiez `.env.example` vers `.env` et remplissez les valeurs
3. Ajoutez `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)
4. Déployez les Cloud Functions :

```bash
cd functions && npm install
firebase functions:secrets:set GEMINI_API_KEY
npm run deploy
```

## Structure

```
src/
  models/      # Types partagés + schémas RTDB/SQLite
  theme/       # Thème sombre/clair + tokens design
  ui/          # Composants globaux (Button, Card, Chrono...)
  game/        # Moteur de jeu pur (testable)
  services/    # Firebase, SQLite, IA, online, social
  screens/     # Écrans par domaine
  navigation/  # Tabs + stacks
functions/     # Cloud Functions Gemini
.github/       # Workflows CI/CD
docs/          # Cahier des charges, design, documentation jeu
```

## Builds GitHub Actions

| Workflow | Déclencheur | Résultat |
|----------|-------------|----------|
| `ci.yml` | Push / PR | Lint + typecheck + tests |
| `build-android.yml` | Manuel / tag `v*` | AAB signé debug |
| `build-ios.yml` | Manuel / tag `v*` | Build simulateur |

## Documentation projet

Voir le dossier [`docs/`](docs/) pour le cahier des charges, la documentation du jeu et le design.
