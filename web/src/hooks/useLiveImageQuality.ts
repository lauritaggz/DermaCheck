import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { evaluateImageData, type ImageQuality } from '../services/imageQualityService';
import { loggerService } from '../services/loggerService';

interface UseLiveImageQualityArgs {
  videoRef: RefObject<HTMLVideoElement | null>;
  isEnabled: boolean;
  intervalMs?: number;
}

export function useLiveImageQuality({
  videoRef,
  isEnabled,
  intervalMs = 500,
}: UseLiveImageQualityArgs): ImageQuality | null {
  const [quality, setQuality] = useState<ImageQuality | null>(null);
  const canvas = useMemo(() => document.createElement('canvas'), []);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setQuality(null);
      return;
    }

    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

      const now = performance.now();
      if (lastTickRef.current) {
        const delta = now - lastTickRef.current;
        if (delta > intervalMs * 2.5) {
          loggerService.warn('Caída crítica de FPS en escaneo de calidad', {
            expectedIntervalMs: intervalMs,
            observedDeltaMs: Math.round(delta),
          });
        }
      }
      lastTickRef.current = now;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setQuality(evaluateImageData(imageData, canvas.width, canvas.height));
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
      lastTickRef.current = null;
    };
  }, [canvas, intervalMs, isEnabled, videoRef]);

  return quality;
}
