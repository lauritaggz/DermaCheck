import { delay } from '../utils/delay';
import type { AuthCredentials, RegisterPayload, User } from '../types';

const MOCK_LATENCY_MS = 650;

function makeUser(params: { id?: string; email: string; name: string; createdAt?: string }): User {
  return {
    id: params.id ?? `user_${Date.now()}`,
    email: params.email,
    name: params.name,
    createdAt: params.createdAt ?? new Date().toISOString(),
  };
}

/** Sprint 1: credenciales aceptadas si email y password no vacíos y email contiene @ */
function validateCredentials(email: string, password: string): string | null {
  if (!email.trim() || !password.trim()) {
    return 'Completa correo y contraseña.';
  }
  if (!email.includes('@')) {
    return 'Introduce un correo válido.';
  }
  if (password.length < 4) {
    return 'La contraseña debe tener al menos 4 caracteres (demo).';
  }
  return null;
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
    await delay(MOCK_LATENCY_MS);
    const err = validateCredentials(credentials.email, credentials.password);
    if (err) return { error: err };
    const user = makeUser({
      email: credentials.email.trim().toLowerCase(),
      name: credentials.email.split('@')[0] ?? 'Usuario',
    });
    return { user };
  },

  async register(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
    await delay(MOCK_LATENCY_MS);
    const err = validateCredentials(payload.email, payload.password);
    if (err) return { error: err };
    if (!payload.name.trim()) {
      return { error: 'Indica tu nombre.' };
    }
    const user = makeUser({
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim(),
    });
    return { user };
  },
};
