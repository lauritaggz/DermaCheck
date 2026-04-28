import { AUTH_ERRORS } from '../constants/authMessages';
import { apiUrl, getApiBaseUrl } from '../utils/api';
import type { AuthCredentials, RegisterPayload, User } from '../types';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { formatApiNetworkError } from '../utils/networkErrors';

const API_V1 = '/api/v1';

export const AuthMessages = {
  emailNotRegistered:
    'No encontramos una cuenta con este correo. ¿Quieres crear una?',
  wrongPassword: 'Contraseña incorrecta. Intenta de nuevo.',
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
  try {
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
  } catch {
    return { error: formatApiNetworkError() };
  }
}

async function registerWithApi(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
  const url = apiUrl(`${API_V1}/auth/register`);
  try {
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
  } catch {
    return { error: formatApiNetworkError() };
  }
}

export const authService = {
  /**
   * Registro e inicio de sesión contra el servidor (SQLite en el API).
   * Requiere `VITE_API_BASE_URL` en el archivo `.env` de la carpeta web.
   */
  async login(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
    if (!getApiBaseUrl()) {
      return { error: AUTH_ERRORS.SERVER_REQUIRED };
    }
    return loginWithApi(credentials);
  },

  async register(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
    if (!getApiBaseUrl()) {
      return { error: AUTH_ERRORS.SERVER_REQUIRED };
    }
    return registerWithApi(payload);
  },
};
