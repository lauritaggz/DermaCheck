/** Validación de formularios de auth (cliente). Sin backend real. */

export const MIN_PASSWORD_LENGTH = 6;

/** Formato de correo razonable para producción (no RFC completo). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email: string): string | null {
  const t = email.trim();
  if (!t) return 'Introduce tu correo electrónico.';
  if (!EMAIL_REGEX.test(t)) {
    return 'Introduce un correo válido (ejemplo: nombre@dominio.com).';
  }
  return null;
}

export function validatePasswordLength(password: string): string | null {
  if (!password) return 'Introduce una contraseña.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export function validateName(name: string): string | null {
  const t = name.trim();
  if (!t) return 'Introduce tu nombre.';
  if (t.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirma tu contraseña.';
  if (password !== confirm) return 'Las contraseñas no coinciden.';
  return null;
}

export type LoginFieldKey = 'email' | 'password';
export type RegisterFieldKey = 'name' | 'email' | 'password' | 'confirmPassword';

export function validateLoginFields(email: string, password: string): Partial<Record<LoginFieldKey, string>> {
  const errors: Partial<Record<LoginFieldKey, string>> = {};
  const e = validateEmailFormat(email);
  if (e) errors.email = e;
  const p = validatePasswordLength(password);
  if (p) errors.password = p;
  return errors;
}

export function validateRegisterFields(
  name: string,
  email: string,
  password: string,
  confirm: string,
): Partial<Record<RegisterFieldKey, string>> {
  const errors: Partial<Record<RegisterFieldKey, string>> = {};
  const n = validateName(name);
  if (n) errors.name = n;
  const em = validateEmailFormat(email);
  if (em) errors.email = em;
  const pw = validatePasswordLength(password);
  if (pw) errors.password = pw;
  const c = validatePasswordConfirm(password, confirm);
  if (c) errors.confirmPassword = c;
  return errors;
}
