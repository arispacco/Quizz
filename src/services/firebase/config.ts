import firebase from '@react-native-firebase/app';
import { env } from '@/config/env';

let initialized = false;

export function ensureFirebase(): boolean {
  if (initialized || firebase.apps.length > 0) {
    initialized = true;
    return true;
  }

  if (!env.isFirebaseConfigured()) {
    return false;
  }

  firebase.initializeApp(env.firebase);
  initialized = true;
  return true;
}

export function isFirebaseReady(): boolean {
  return initialized || firebase.apps.length > 0;
}
