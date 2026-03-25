import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConsentStatus, User } from '../types';

const USER_KEY = '@dermacheck/session_user';
const CONSENT_KEY = '@dermacheck/session_consent';

export async function loadPersistedSession(): Promise<{
  user: User | null;
  consent: ConsentStatus | null;
}> {
  try {
    const [userRaw, consentRaw] = await AsyncStorage.multiGet([USER_KEY, CONSENT_KEY]);
    const userJson = userRaw[1];
    const consentJson = consentRaw[1];
    const user = userJson ? (JSON.parse(userJson) as User) : null;
    const consent = consentJson ? (JSON.parse(consentJson) as ConsentStatus) : null;
    return { user, consent };
  } catch {
    return { user: null, consent: null };
  }
}

export async function savePersistedSession(user: User, consent: ConsentStatus): Promise<void> {
  await AsyncStorage.multiSet([
    [USER_KEY, JSON.stringify(user)],
    [CONSENT_KEY, JSON.stringify(consent)],
  ]);
}

export async function clearPersistedSession(): Promise<void> {
  await AsyncStorage.multiRemove([USER_KEY, CONSENT_KEY]);
}
