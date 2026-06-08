import storage from '@react-native-firebase/storage';
import { ensureFirebase } from './config';

export async function uploadAudioFile(
  localPath: string,
  remotePath: string,
): Promise<string> {
  ensureFirebase();
  const ref = storage().ref(remotePath);
  await ref.putFile(localPath);
  return ref.getDownloadURL();
}

export async function uploadTextContent(
  content: string,
  remotePath: string,
): Promise<string> {
  ensureFirebase();
  const ref = storage().ref(remotePath);
  await ref.putString(content, 'raw', { contentType: 'text/plain' });
  return ref.getDownloadURL();
}
