const STORAGE_KEY = 'dermacheck:camera-preferences';

export type CameraPreferences = {
  deviceId?: string;
  captureButton?: { xPercent: number; yPercent: number };
};

const DEFAULT_CAPTURE_BUTTON = { xPercent: 50, yPercent: 88 };

function readRaw(): CameraPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CameraPreferences;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRaw(prefs: CameraPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage no disponible
  }
}

export function loadCameraPreferences(): CameraPreferences {
  return readRaw();
}

export function getSavedCaptureButtonPosition(): { xPercent: number; yPercent: number } {
  const pos = readRaw().captureButton;
  if (
    pos
    && typeof pos.xPercent === 'number'
    && typeof pos.yPercent === 'number'
    && pos.xPercent >= 0
    && pos.xPercent <= 100
    && pos.yPercent >= 0
    && pos.yPercent <= 100
  ) {
    return pos;
  }
  return DEFAULT_CAPTURE_BUTTON;
}

export function saveCameraDeviceId(deviceId: string): void {
  writeRaw({ ...readRaw(), deviceId });
}

export function saveCaptureButtonPosition(xPercent: number, yPercent: number): void {
  writeRaw({
    ...readRaw(),
    captureButton: {
      xPercent: Math.min(100, Math.max(0, xPercent)),
      yPercent: Math.min(100, Math.max(0, yPercent)),
    },
  });
}
