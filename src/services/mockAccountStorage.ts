import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const ACCOUNTS_KEY = '@dermacheck/mock_accounts';

export type MockStoredAccount = {
  id: string;
  email: string;
  /** Solo demo local; en producción nunca se guardaría en claro */
  password: string;
  name: string;
  createdAt: string;
};

async function readAll(): Promise<MockStoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockStoredAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(accounts: MockStoredAccount[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function findAccountByEmail(email: string): Promise<MockStoredAccount | undefined> {
  const list = await readAll();
  const key = email.trim().toLowerCase();
  return list.find((a) => a.email === key);
}

export async function emailExists(email: string): Promise<boolean> {
  const acc = await findAccountByEmail(email);
  return !!acc;
}

export async function addAccount(account: MockStoredAccount): Promise<void> {
  const list = await readAll();
  list.push(account);
  await writeAll(list);
}

export function mockAccountToUser(a: MockStoredAccount): User {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    createdAt: a.createdAt,
  };
}
