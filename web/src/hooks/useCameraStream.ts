import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildVideoConstraints,
  dedupeVideoDevices,
  pickPermissionDevice,
  pickPreferredFromResolved,
  resolveCameraLabels,
  sortDevicesForProbe,
  type ResolvedCamera,
} from '../utils/cameraDevices';
import { loadCameraPreferences, saveCameraDeviceId } from '../utils/cameraPreferences';
import { loggerService } from '../services/loggerService';

interface UseCameraStreamResult {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  resolvedCameras: ResolvedCamera[];
  selectedDeviceId: string;
  activeTrackLabel: string | null;
  selectCamera: (deviceId: string) => void;
  isLoading: boolean;
  error: string | null;
  stopStream: () => void;
  refreshDevices: () => Promise<void>;
}

async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
  const all = await navigator.mediaDevices.enumerateDevices();
  return dedupeVideoDevices(all.filter((d) => d.kind === 'videoinput'));
}

async function requestCameraPermission(): Promise<void> {
  const initial = await navigator.mediaDevices.enumerateDevices();
  const videoInputs = dedupeVideoDevices(initial.filter((d) => d.kind === 'videoinput'));

  const preferred = pickPermissionDevice(videoInputs);
  const ordered = sortDevicesForProbe(videoInputs);
  const candidates = [
    preferred,
    ...ordered.filter((d) => d.deviceId !== preferred?.deviceId),
  ].filter((d): d is MediaDeviceInfo => Boolean(d));

  for (const device of candidates) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: device.deviceId } },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      return;
    } catch {
      // probar la siguiente
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });
    stream.getTracks().forEach((t) => t.stop());
    return;
  } catch {
    // continuar con fallback genérico
  }

  const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  fallback.getTracks().forEach((t) => t.stop());
}

async function openCameraStream(deviceId: string): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { deviceId: { exact: deviceId } }, audio: false },
    { video: { deviceId: { ideal: deviceId } }, audio: false },
    { video: buildVideoConstraints(deviceId), audio: false },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export function useCameraStream(): UseCameraStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [resolvedCameras, setResolvedCameras] = useState<ResolvedCamera[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [activeTrackLabel, setActiveTrackLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userPinnedRef = useRef(false);
  const selectedIdRef = useRef('');
  const refreshLockRef = useRef(false);

  const stopStream = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setActiveTrackLabel(null);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (refreshLockRef.current) return;
    refreshLockRef.current = true;
    setIsLoading(true);
    stopStream();

    try {
      await requestCameraPermission();

      const videoDevices = await listVideoDevices();
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        setResolvedCameras([]);
        setError('No hay cámaras detectadas. Comprueba permisos del navegador.');
        return;
      }

      const resolved = await resolveCameraLabels(videoDevices);
      const prefs = loadCameraPreferences();
      const savedId = userPinnedRef.current ? selectedIdRef.current : prefs.deviceId;
      const nextId = await pickPreferredFromResolved(resolved, savedId);

      selectedIdRef.current = nextId;
      setResolvedCameras(resolved);
      setSelectedDeviceId(nextId);
      setError(null);
      loggerService.info('Cámaras resueltas', { cameras: resolved, selected: nextId });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : 'Error';
      setResolvedCameras([]);
      setError(
        name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Permítelo en el navegador y pulsa «Actualizar».'
          : 'No se pudo acceder a la cámara. Pulsa «Actualizar» o reinicia el navegador.',
      );
    } finally {
      refreshLockRef.current = false;
    }
  }, [stopStream]);

  const selectCamera = useCallback((deviceId: string) => {
    userPinnedRef.current = true;
    selectedIdRef.current = deviceId;
    saveCameraDeviceId(deviceId);
    stopStream();
    setSelectedDeviceId(deviceId);
  }, [stopStream]);

  useEffect(() => {
    selectedIdRef.current = selectedDeviceId;
  }, [selectedDeviceId]);

  useEffect(() => {
    void refreshDevices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- solo al montar

  useEffect(() => {
    const onChange = () => {
      void refreshDevices();
    };
    navigator.mediaDevices?.addEventListener('devicechange', onChange);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', onChange);
  }, [refreshDevices]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (!selectedDeviceId || resolvedCameras.length === 0) {
        setIsLoading(false);
        return;
      }

      const targetResolved = resolvedCameras.find((c) => c.deviceId === selectedDeviceId);
      if (!targetResolved) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      stopStream();

      try {
        const nextStream = await openCameraStream(selectedDeviceId);
        if (cancelled) {
          nextStream.getTracks().forEach((t) => t.stop());
          return;
        }

        const track = nextStream.getVideoTracks()[0];
        const trackLabel = track?.label || targetResolved.label;

        activeStream = nextStream;
        setActiveTrackLabel(trackLabel);
        setStream(nextStream);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setStream(null);
        setActiveTrackLabel(null);

        const name = err instanceof DOMException ? err.name : 'Error';
        setError(
          name === 'NotAllowedError'
            ? 'Permiso denegado.'
            : `No se pudo abrir «${targetResolved.label}». Prueba otra cámara en la lista.`,
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, [selectedDeviceId, resolvedCameras, stopStream]);

  return {
    stream,
    devices,
    resolvedCameras,
    selectedDeviceId,
    activeTrackLabel,
    selectCamera,
    isLoading,
    error,
    stopStream,
    refreshDevices,
  };
}
