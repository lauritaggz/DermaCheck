import { KIOSK_USER_ID } from '../constants/kiosk';
import type { KioskConfig } from '../types';
import { apiUrl } from '../utils/api';

let cachedKioskConfig: KioskConfig | null = null;

/**
 * Carga y cachea la configuración pública del tótem (user_id y umbrales YOLO del servidor).
 */
export async function fetchKioskConfig(): Promise<KioskConfig | null> {
  if (cachedKioskConfig) {
    return cachedKioskConfig;
  }

  try {
    const response = await fetch(apiUrl('/api/v1/kiosk/config'), {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = (await response.json()) as KioskConfig;
      if (data.user_id) {
        cachedKioskConfig = data;
        return cachedKioskConfig;
      }
    }
  } catch {
    // Fallback a variable de entorno si el backend no responde.
  }

  return null;
}

/**
 * Resuelve el user_id del tótem desde el backend (usuario técnico creado al arrancar).
 */
export async function resolveKioskUserId(): Promise<string> {
  const config = await fetchKioskConfig();
  if (config?.user_id) {
    return config.user_id;
  }

  if (KIOSK_USER_ID) {
    return KIOSK_USER_ID;
  }

  throw new Error('No se pudo obtener la configuración del tótem. Verifica que el backend esté activo.');
}
