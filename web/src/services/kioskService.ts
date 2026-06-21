import { KIOSK_USER_ID } from '../constants/kiosk';
import { apiUrl } from '../utils/api';

let cachedKioskUserId: string | null = null;

/**
 * Resuelve el user_id del tótem desde el backend (usuario técnico creado al arrancar).
 */
export async function resolveKioskUserId(): Promise<string> {
  if (cachedKioskUserId) {
    return cachedKioskUserId;
  }

  try {
    const response = await fetch(apiUrl('/api/v1/kiosk/config'), {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = (await response.json()) as { user_id?: string };
      if (data.user_id) {
        cachedKioskUserId = data.user_id;
        return cachedKioskUserId;
      }
    }
  } catch {
    // Fallback a variable de entorno si el backend no responde.
  }

  if (KIOSK_USER_ID) {
    return KIOSK_USER_ID;
  }

  throw new Error('No se pudo obtener la configuración del tótem. Verifica que el backend esté activo.');
}
