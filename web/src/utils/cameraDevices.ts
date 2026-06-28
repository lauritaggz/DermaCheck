/** Etiqueta legible para un dispositivo de vídeo del navegador. */
export function getCameraLabel(device: MediaDeviceInfo, index: number): string {
  if (device.label?.trim()) {
    return device.label.trim();
  }
  return `Cámara ${index + 1}`;
}

const FRONT_KEYWORDS = [
  'front',
  'frontal',
  'user',
  'selfie',
  'facetime',
  'facing front',
  'front camera',
  'cámara frontal',
  'camara frontal',
  'camera2 1', // Android: front often camera2 1
];

const BACK_KEYWORDS = ['back', 'rear', 'environment', 'trasera', 'posterior', 'camera2 0'];

const BUILTIN_KEYWORDS = [
  'integrated',
  'built-in',
  'builtin',
  'integrate',
  'chicony',
  'microdia',
  'hp hd',
  'lenovo easycamera',
  'acer hd',
  'realtek',
];

export function isFrontCameraLabel(label: string): boolean {
  const lower = label.toLowerCase();
  if (BACK_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  return FRONT_KEYWORDS.some((kw) => lower.includes(kw));
}

export function isLikelyBuiltInCamera(device: MediaDeviceInfo): boolean {
  const label = (device.label || '').toLowerCase();
  return BUILTIN_KEYWORDS.some((kw) => label.includes(kw));
}

export function isBuiltInTrackLabel(label: string): boolean {
  const l = label.toLowerCase();
  return BUILTIN_KEYWORDS.some((kw) => l.includes(kw));
}

/**
 * Elimina duplicados del mismo hardware (p. ej. /dev/video0 y /dev/video1 de la misma webcam).
 */
export function dedupeVideoDevices(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  const seen = new Set<string>();
  const result: MediaDeviceInfo[] = [];

  for (const device of devices) {
    const key = device.groupId && device.groupId.length > 0 ? device.groupId : device.deviceId;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(device);
  }

  return result;
}

export interface ResolvedCamera {
  deviceId: string;
  label: string;
  isFront: boolean;
  isBuiltIn: boolean;
}

export function isFrontCamera(device: ResolvedCamera): boolean {
  return device.isFront;
}

/** Orden de sondeo: frontales primero, integradas al final. */
export function sortDevicesForProbe(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  return [...devices].sort((a, b) => {
    const score = (d: MediaDeviceInfo) => {
      const label = (d.label || '').toLowerCase();
      if (isFrontCameraLabel(d.label || '')) return 0;
      if (BUILTIN_KEYWORDS.some((kw) => label.includes(kw))) return 3;
      return 2;
    };
    return score(a) - score(b);
  });
}

export function pickPermissionDevice(devices: MediaDeviceInfo[]): MediaDeviceInfo | null {
  const unique = dedupeVideoDevices(devices);
  if (unique.length === 0) return null;

  const front = unique.find((d) => isFrontCameraLabel(d.label || ''));
  if (front) return front;

  return unique[0];
}

function mapDeviceToResolved(device: MediaDeviceInfo, index: number): ResolvedCamera {
  const label = (device.label || '').trim() || `Cámara ${index + 1}`;
  const lower = label.toLowerCase();
  return {
    deviceId: device.deviceId,
    label,
    isFront: isFrontCameraLabel(label),
    isBuiltIn: BUILTIN_KEYWORDS.some((kw) => lower.includes(kw)),
  };
}

export async function resolveCameraLabels(
  devices: MediaDeviceInfo[],
): Promise<ResolvedCamera[]> {
  const unique = sortDevicesForProbe(dedupeVideoDevices(devices));
  const allLabeled = unique.every((d) => d.label?.trim());

  if (allLabeled) {
    return unique.map((d, i) => mapDeviceToResolved(d, i));
  }

  const resolved: ResolvedCamera[] = [];

  for (const device of unique) {
    let trackLabel = device.label || '';
    if (!trackLabel.trim()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: device.deviceId } },
          audio: false,
        });
        trackLabel = stream.getVideoTracks()[0]?.label || trackLabel;
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // dispositivo no disponible
      }
    }

    resolved.push(mapDeviceToResolved({ ...device, label: trackLabel }, resolved.length));
  }

  return resolved;
}

/** Intenta obtener deviceId de la cámara frontal vía facingMode (móvil/tablet). */
export async function probeFrontCameraDeviceId(): Promise<string | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });
    const settings = stream.getVideoTracks()[0]?.getSettings();
    stream.getTracks().forEach((t) => t.stop());
    return settings?.deviceId || null;
  } catch {
    return null;
  }
}

/**
 * Prioridad: prefs guardadas → label frontal → facingMode user → primera disponible.
 */
export async function pickPreferredFromResolved(
  cameras: ResolvedCamera[],
  savedDeviceId?: string,
): Promise<string> {
  if (cameras.length === 0) return '';

  if (savedDeviceId && cameras.some((c) => c.deviceId === savedDeviceId)) {
    return savedDeviceId;
  }

  const byLabel = cameras.find((c) => c.isFront);
  if (byLabel) return byLabel.deviceId;

  const probedId = await probeFrontCameraDeviceId();
  if (probedId && cameras.some((c) => c.deviceId === probedId)) {
    return probedId;
  }

  return cameras[0].deviceId;
}

export function buildVideoConstraints(deviceId: string): MediaTrackConstraints {
  return {
    deviceId: { exact: deviceId },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };
}
