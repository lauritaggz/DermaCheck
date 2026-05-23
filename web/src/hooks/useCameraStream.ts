import { useCallback, useEffect, useState } from 'react';
import { loggerService } from '../services/loggerService';

interface UseCameraStreamResult {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  setSelectedDeviceId: (deviceId: string) => void;
  isLoading: boolean;
  error: string | null;
  stopStream: () => void;
}

export function useCameraStream(): UseCameraStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stopStream = useCallback(() => {
    setStream((current) => {
      if (current) {
        current.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
  }, []);

  useEffect(() => {
    async function initializeCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId((prev) => prev || videoDevices[0].deviceId);
        }
      } catch (err) {
        const errorName = err instanceof DOMException ? err.name : 'UnknownError';
        const message = err instanceof Error ? err.message : 'unknown_media_error';
        loggerService.error('No se pudo inicializar getUserMedia', { errorName, message });
        setError('No se pudo acceder a los dispositivos de cámara. Verifica los permisos.');
        setIsLoading(false);
      }
    }

    void initializeCamera();
  }, []);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startStream() {
      if (!selectedDeviceId) return;
      setIsLoading(true);
      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        activeStream = nextStream;
        nextStream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            loggerService.warn('El stream de cámara se interrumpió', {
              selectedDeviceId,
              trackLabel: track.label,
              readyState: track.readyState,
              muted: track.muted,
            });
          };
        });
        setStream(nextStream);
        setError(null);
      } catch (err) {
        const errorName = err instanceof DOMException ? err.name : 'UnknownError';
        const errorMessage = errorName === 'NotAllowedError'
          ? 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.'
          : 'No se pudo acceder a la cámara. Verifica los permisos del navegador.';
        if (errorName === 'NotAllowedError') {
          loggerService.error('Permisos de cámara denegados', { errorName, selectedDeviceId });
        } else {
          loggerService.error('Error al iniciar stream de cámara', { errorName, selectedDeviceId });
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    void startStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId]);

  return {
    stream,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isLoading,
    error,
    stopStream,
  };
}
