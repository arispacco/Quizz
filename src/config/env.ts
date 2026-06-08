/**
 * Configuration Firebase pour l'app React Native.
 *
 * ## Mode 1 — Fichiers natifs (recommandé en production)
 *
 * Copier les templates et renseigner vos valeurs depuis la console Firebase :
 * - Android : `android/app/google-services.json.example` → `google-services.json`
 * - iOS : `ios/LeJeu/GoogleService-Info.plist.example` → `GoogleService-Info.plist`
 *   (ajouter le fichier au target LeJeu dans Xcode)
 *
 * Avec `@react-native-firebase/app`, Firebase s'initialise automatiquement au
 * démarrage natif. `ensureFirebase()` dans `services/firebase/config.ts` détecte
 * `firebase.apps.length > 0` sans appeler `initializeApp` depuis le JS.
 *
 * ## Mode 2 — react-native-config (optionnel, dev / CI)
 *
 * ```bash
 * npm install react-native-config
 * cp .env.example .env
 * ```
 *
 * Renseigner FIREBASE_* et GOOGLE_WEB_CLIENT_ID dans `.env`.
 * Suivre la doc react-native-config pour lier Gradle (Android) et un build phase
 * (iOS). Les variables sont injectées au build, pas au runtime Metro seul.
 *
 * Si react-native-config n'est pas installé, les variables restent vides et le
 * fallback JS est ignoré — seuls les fichiers natifs comptent.
 *
 * ## Mode offline
 *
 * Sans config Firebase, l'app reste utilisable en local (SQLite, parties locales).
 */

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type EnvConfig = Record<string, string | undefined>;

function loadReactNativeConfig(): EnvConfig {
  try {
    // Optional peer dependency — absent in default dev setup.
    const mod = require('react-native-config') as EnvConfig & { default?: EnvConfig };
    return mod.default ?? mod;
  } catch {
    return {};
  }
}

const Config = loadReactNativeConfig();

// Valeurs réelles du projet Firebase "Le Jeu" (le-jeu-7k2p9).
// Les fichiers natifs (google-services.json / GoogleService-Info.plist) restent
// la source de vérité au build natif ; ces constantes servent de fallback JS
// (react-native-config absent) afin que isFirebaseConfigured() soit fiable.
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyCr4WxWbcM9Eedpls4iqP3-RE1FsSN21BY',
  authDomain: 'le-jeu-7k2p9.firebaseapp.com',
  databaseURL: 'https://le-jeu-7k2p9-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'le-jeu-7k2p9',
  storageBucket: 'le-jeu-7k2p9.firebasestorage.app',
  messagingSenderId: '210207565315',
  appId: '1:210207565315:android:74569bdf55ec1937239036',
};

const firebase: FirebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY ?? DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: Config.FIREBASE_AUTH_DOMAIN ?? DEFAULT_FIREBASE_CONFIG.authDomain,
  databaseURL: Config.FIREBASE_DATABASE_URL ?? DEFAULT_FIREBASE_CONFIG.databaseURL,
  projectId: Config.FIREBASE_PROJECT_ID ?? DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET ?? DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID ?? DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: Config.FIREBASE_APP_ID ?? DEFAULT_FIREBASE_CONFIG.appId,
};

function hasJsFirebaseConfig(config: FirebaseConfig): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

export const env = {
  firebase,
  googleWebClientId: Config.GOOGLE_WEB_CLIENT_ID ?? '',
  /** True si react-native-config fournit une config JS complète (initializeApp manuel). */
  isFirebaseConfigured: () => hasJsFirebaseConfig(firebase),
};
