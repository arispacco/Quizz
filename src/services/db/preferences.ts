import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getPreference(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setPreference(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removePreference(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
