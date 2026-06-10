import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { CameraSelector } from '../components/capture/CameraSelector';
import { useAppState } from '../context/AppContext';
import { useCameraStream } from '../hooks/useCameraStream';
import { useLiveImageQuality } from '../hooks/useLiveImageQuality';
import { loggerService } from '../services/loggerService';

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturing, setCapturing] = useState(false);
  const { setPendingImage } = useAppState();
  const navigate = useNavigate();

  const {
    stream,
    resolvedCameras,
    selectedDeviceId,
    activeTrackLabel,
    selectCamera,
    isLoading,
    error,
    stopStream,
    refreshDevices,
  } = useCameraStream();

  const imageQuality = useLiveImageQuality({
    videoRef,
    isEnabled: Boolean(stream) && !isLoading,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().catch((err) => loggerService.warn('play error', { error: String(err) }));
    };
  }, [stream]);

  function handleSelectIriun() {
    const iriun = resolvedCameras.find((c) => c.isIriun);
    if (iriun) selectCamera(iriun.deviceId);
  }

  async function captureImage() {
    if (!videoRef.current || !canvasRef.current || !imageQuality?.isGood) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) { setCapturing(false); return; }
      setPendingImage({
        blob,
        objectUrl: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
        source: 'camera',
      });
      stopStream();
      navigate('/preview');
    }, 'image/jpeg', 0.95);
  }

  const isGood = imageQuality?.isGood;

  return (
    <PageTransition>
      <AppShell variant="focus">
        <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => { stopStream(); navigate('/image-picker'); }}
            className="mb-3 text-sm text-white/60 hover:text-white"
          >
            ← Volver
          </button>

          <FlowStepper currentStep={3} variant="dark" />

          <CameraSelector
            resolvedCameras={resolvedCameras}
            selectedDeviceId={selectedDeviceId}
            activeTrackLabel={activeTrackLabel}
            isLoading={isLoading}
            onSelect={selectCamera}
            onSelectIriun={handleSelectIriun}
            onRefresh={() => refreshDevices()}
          />

          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 max-h-[50vh] mx-auto w-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900">
                <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-[78%] h-[88%] rounded-[50%] border-[3px] transition-colors ${
                isGood ? 'border-emerald-400' : 'border-red-400/70'
              }`} />
            </div>

            {imageQuality && (
              <div className="absolute top-3 left-3 right-3">
                <div className={`px-3 py-2 rounded-lg text-xs font-medium backdrop-blur ${
                  isGood ? 'bg-emerald-500/30 text-emerald-100' : 'bg-red-500/30 text-red-100'
                }`}>
                  {isGood ? '✓ Listo para capturar' : `Ajustar: ${imageQuality.issues.join(', ')}`}
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                type="button"
                onClick={captureImage}
                disabled={capturing || !!error || isLoading || !isGood}
                className={`w-16 h-16 rounded-full border-4 disabled:opacity-40 ${
                  isGood ? 'bg-emerald-500 border-emerald-300' : 'bg-white/20 border-white/40'
                }`}
              />
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </AppShell>
    </PageTransition>
  );
}
