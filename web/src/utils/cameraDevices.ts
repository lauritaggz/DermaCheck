/** Etiqueta legible para un dispositivo de vídeo del navegador. */
export function getCameraLabel(device: MediaDeviceInfo, index: number): string {
  if (device.label?.trim()) {
    return device.label.trim();
  }
  return `Cámara ${index + 1}`;
}

const EXTERNAL_KEYWORDS = [
  'iriun',
  'droidcam',
  'epoccam',
  'ivcam',
  'camo',
  'usb camera',
  'uvc',
  'android',
  'iphone',
];

const BUILTIN_KEYWORDS = [
  'integrated',
  'built-in',
  'builtin',
  'integrate', // "Integrated_Webcam_HD: Integrate"
  'facetime',
  'chicony',
  'microdia',
  'hp hd',
  'lenovo easycamera',
  'acer hd',
  'realtek',
];

export function isLikelyBuiltInCamera(device: MediaDeviceInfo): boolean {
  const label = (device.label || '').toLowerCase();
  return BUILTIN_KEYWORDS.some((kw) => label.includes(kw));
}

export function isIriunCamera(device: MediaDeviceInfo): boolean {
  return (device.label || '').toLowerCase().includes('iriun');
}

export function isBuiltInTrackLabel(label: string): boolean {
  const l = label.toLowerCase();
  return BUILTIN_KEYWORDS.some((kw) => l.includes(kw));
}

export function isIriunTrackLabel(label: string): boolean {
  return label.toLowerCase().includes('iriun');
}

/** Cámara externa/virtual (Iriun, DroidCam…), nunca la integrada del portátil. */
export function isLikelyExternalCamera(device: MediaDeviceInfo): boolean {
  if (isLikelyBuiltInCamera(device)) return false;
  const label = (device.label || '').toLowerCase();
  return EXTERNAL_KEYWORDS.some((kw) => label.includes(kw));
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
  isIriun: boolean;
  isBuiltIn: boolean;
}

/**
 * Abre brevemente cada cámara para obtener el nombre real del track.
 * Necesario cuando enumerateDevices() devuelve etiquetas vacías.
 */
/** Orden de sondeo: Iriun y externas primero, integradas al final. */
export function sortDevicesForProbe(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  return [...devices].sort((a, b) => {
    const score = (d: MediaDeviceInfo) => {
      const label = (d.label || '').toLowerCase();
      if (label.includes('iriun')) return 0;
      if (BUILTIN_KEYWORDS.some((kw) => label.includes(kw))) return 3;
      if (EXTERNAL_KEYWORDS.some((kw) => label.includes(kw))) return 1;
      return 2;
    };
    return score(a) - score(b);
  });
}

/**
 * Dispositivo con el que pedir permiso sin abrir la cámara integrada por defecto.
 * En Linux, Iriun suele registrarse como último /dev/video*.
 */
export function pickPermissionDevice(devices: MediaDeviceInfo[]): MediaDeviceInfo | null {
  const unique = dedupeVideoDevices(devices);
  if (unique.length === 0) return null;

  const labeledIriun = unique.find((d) => isIriunCamera(d));
  if (labeledIriun) return labeledIriun;

  const nonBuiltin = unique.filter((d) => !isLikelyBuiltInCamera(d));
  if (nonBuiltin.length === 1) return nonBuiltin[0];

  if (unique.length >= 2) return unique[unique.length - 1];

  return unique[0];
}

/** Si el nombre no incluye «iriun», infiere Iriun por exclusión (una sola no integrada). */
export function inferIriunFlags(cameras: ResolvedCamera[]): ResolvedCamera[] {
  if (cameras.some((c) => c.isIriun)) return cameras;

  const nonBuiltin = cameras.filter((c) => !c.isBuiltIn);
  if (nonBuiltin.length === 1) {
    return cameras.map((c) =>
      c.deviceId === nonBuiltin[0].deviceId ? { ...c, isIriun: true } : c,
    );
  }

  if (cameras.length >= 2) {
    const last = cameras[cameras.length - 1];
    if (!last.isBuiltIn) {
      return cameras.map((c) =>
        c.deviceId === last.deviceId ? { ...c, isIriun: true } : c,
      );
    }
  }

  return cameras;
}

function mapDeviceToResolved(device: MediaDeviceInfo, index: number): ResolvedCamera {
  const label = (device.label || '').trim() || `Cámara ${index + 1}`;
  const lower = label.toLowerCase();
  return {
    deviceId: device.deviceId,
    label,
    isIriun: lower.includes('iriun'),
    isBuiltIn: BUILTIN_KEYWORDS.some((kw) => lower.includes(kw)),
  };
}

export async function resolveCameraLabels(
  devices: MediaDeviceInfo[],
): Promise<ResolvedCamera[]> {
  const unique = sortDevicesForProbe(dedupeVideoDevices(devices));
  const allLabeled = unique.every((d) => d.label?.trim());

  // Con permiso concedido y nombres visibles, no abrir otras cámaras en sondeo
  if (allLabeled) {
    return inferIriunFlags(unique.map((d, i) => mapDeviceToResolved(d, i)));
  }

  const resolved: ResolvedCamera[] = [];
  const iriunFromList = unique.find((d) => isIriunCamera(d));

  for (const device of unique) {
    if (iriunFromList && device.deviceId !== iriunFromList.deviceId && isLikelyBuiltInCamera(device)) {
      resolved.push(mapDeviceToResolved(device, resolved.length));
      continue;
    }

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

  return inferIriunFlags(resolved);
}

/**
 * Siempre prioriza Iriun. Si no hay Iriun, evita la cámara integrada del portátil.
 */
export function pickPreferredFromResolved(
  cameras: ResolvedCamera[],
  userPinnedId?: string,
): string {
  if (cameras.length === 0) return '';

  if (userPinnedId && cameras.some((c) => c.deviceId === userPinnedId)) {
    return userPinnedId;
  }

  const iriun = cameras.find((c) => c.isIriun);
  if (iriun) return iriun.deviceId;

  const external = cameras.find((c) => !c.isBuiltIn);
  if (external) return external.deviceId;

  return cameras[0].deviceId;
}

/** Restricciones suaves para cámaras virtuales como Iriun. */
export function buildVideoConstraints(
  deviceId: string,
  isVirtual = false,
): MediaTrackConstraints {
  if (isVirtual) {
    return {
      deviceId: { exact: deviceId },
      width: { min: 320, ideal: 640, max: 1280 },
      height: { min: 240, ideal: 480, max: 720 },
      frameRate: { ideal: 24, max: 30 },
    };
  }

  return {
    deviceId: { exact: deviceId },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };
}
