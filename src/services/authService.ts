import { apiUrl, getApiBaseUrl } from '../config/api';
import type { AuthCredentials, RegisterPayload, User } from '../types';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { delay } from '../utils/delay';
import {
  addAccount,
  emailExists,
  findAccountByEmail,
  mockAccountToUser,
  type MockStoredAccount,
} from './mockAccountStorage';

const MOCK_LATENCY_MS = 550;
const API_V1 = '/api/v1';

/** Errores de negocio mock (sin validar formato aquí; lo hace la pantalla). */
export const AuthMessages = {
  emailNotRegistered:
    'No encontramos una cuenta con este correo. ¿Quieres crear una?',
  wrongPassword: 'Contraseña incorrecta. Intenta de nuevo o usa “Olvidé mi contraseña” en una versión productiva.',
  emailAlreadyRegistered: 'Este correo ya está registrado. Inicia sesión o usa otro correo.',
} as const;

type ApiAuthUser = {
  id: string | number;
  email: string;
  name: string;
  created_at: string;
};

function mapApiAuthPayload(data: { user: ApiAuthUser }): User {
  const u = data.user;
  return {
    id: String(u.id),
    email: u.email,
    name: u.name,
    createdAt: u.created_at,
  };
}

async function loginWithApi(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
  const url = apiUrl(`${API_V1}/auth/login`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });
  if (!res.ok) {
    return { error: await parseApiErrorMessage(res) };
  }
  const data = (await res.json()) as { user: ApiAuthUser };
  return { user: mapApiAuthPayload(data) };
}

async function registerWithApi(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
  const url = apiUrl(`${API_V1}/auth/register`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      name: payload.name.trim(),
    }),
  });
  if (!res.ok) {
    return { error: await parseApiErrorMessage(res) };
  }
  const data = (await res.json()) as { user: ApiAuthUser };
  return { user: mapApiAuthPayload(data) };
}

async function loginMock(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
  await delay(MOCK_LATENCY_MS);
  const email = credentials.email.trim().toLowerCase();
  const acc = await findAccountByEmail(email);
  if (!acc) {
    return { error: AuthMessages.emailNotRegistered };
  }
  if (acc.password !== credentials.password) {
    return { error: AuthMessages.wrongPassword };
  }
  return { user: mockAccountToUser(acc) };
}

async function registerMock(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
  await delay(MOCK_LATENCY_MS);
  const email = payload.email.trim().toLowerCase();
  if (await emailExists(email)) {
    return { error: AuthMessages.emailAlreadyRegistered };
  }
  const userId = `user_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const account: MockStoredAccount = {
    id: userId,
    email,
    password: payload.password,
    name: payload.name.trim(),
    createdAt,
  };
  await addAccount(account);
  return { user: mockAccountToUser(account) };
}

export const authService = {
  /**
   * Con `EXPO_PUBLIC_API_BASE_URL`: registro en SQLite (servidor).
   * Sin URL: cuentas solo en AsyncStorage del móvil (demo offline).
   */
  async login(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
    if (getApiBaseUrl()) {
      return loginWithApi(credentials);
    }
    return loginMock(credentials);
  },

  async register(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
    if (getApiBaseUrl()) {
      return registerWithApi(payload);
    }
    return registerMock(payload);
  },
};
