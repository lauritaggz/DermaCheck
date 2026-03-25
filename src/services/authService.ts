import { delay } from '../utils/delay';
import type { AuthCredentials, RegisterPayload, User } from '../types';
import {
  addAccount,
  emailExists,
  findAccountByEmail,
  mockAccountToUser,
  type MockStoredAccount,
} from './mockAccountStorage';

const MOCK_LATENCY_MS = 550;

/** Errores de negocio mock (sin validar formato aquí; lo hace la pantalla). */
export const AuthMessages = {
  emailNotRegistered:
    'No encontramos una cuenta con este correo. ¿Quieres crear una?',
  wrongPassword: 'Contraseña incorrecta. Intenta de nuevo o usa “Olvidé mi contraseña” en una versión productiva.',
  emailAlreadyRegistered: 'Este correo ya está registrado. Inicia sesión o usa otro correo.',
} as const;

export const authService = {
  async login(credentials: AuthCredentials): Promise<{ user: User } | { error: string }> {
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
  },

  async register(payload: RegisterPayload): Promise<{ user: User } | { error: string }> {
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
  },
};
