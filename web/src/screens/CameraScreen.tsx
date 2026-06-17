import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { CameraSelector } from '../components/capture/CameraSelector';
import { CaptureReferenceGuide } from '../components/capture/CaptureReferenceGuide';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppState, MAX_FACE_CAPTURES } from '../context/AppContext';
import { useCameraStream } from '../hooks/useCameraStream';
import { useLiveImageQuality } from '../hooks/useLiveImageQuality';
import { loggerService } from '../services/loggerService';

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturing, setCapturing] = useState(false);
  const { pendingImages, addPendingImage, clearPendingImages } = useAppState();
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
    if (pendingImages.length >= MAX_FACE_CAPTURES) {
      stopStream();
      navigate('/preview');
    }
  }, [pendingImages.length, navigate, stopStream]);

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
    if (pendingImages.length >= MAX_FACE_CAPTURES) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) { setCapturing(false); return; }
      addPendingImage({
        blob,
        objectUrl: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
        source: 'camera',
      });
      setCapturing(false);
    }, 'image/jpeg', 0.95);
  }

  const captureNumber = pendingImages.length + 1;
  const canContinue = pendingImages.length >= 1;
  const atMaxCaptures = pendingImages.length >= MAX_FACE_CAPTURES;

  function handleContinue() {
    stopStream();
    navigate('/preview');
  }

  const isGood = imageQuality?.isGood;

  return (
    <PageTransition>
      <AppShell variant="focus">
        <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => { stopStream(); clearPendingImages(); navigate('/image-picker'); }}
            className="mb-3 text-sm text-white/60 hover:text-white"
          >
            ← Volver
          </button>

          <FlowStepper currentStep={3} variant="dark" />

          <div className="mb-3 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-center text-sm text-white/90">
            {pendingImages.length === 0
              ? 'Captura 1 foto (puedes agregar una segunda opcional)'
              : pendingImages.length === 1
                ? '1 foto lista · Segunda foto opcional'
                : '2 fotos listas'}
          </div>

          <CaptureReferenceGuide
            variant="pose"
            captureIndex={captureNumber}
            compact
            className="mb-3 px-1"
          />

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

            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 px-4">
              {canContinue && !atMaxCaptures && (
                <PrimaryButton
                  label="Continuar con 1 foto"
                  variant="secondary"
                  onClick={handleContinue}
                  className="w-full max-w-xs !min-h-[44px] !text-sm"
                />
              )}
              <button
                type="button"
                onClick={captureImage}
                disabled={capturing || !!error || isLoading || !isGood || atMaxCaptures}
                className={`w-16 h-16 rounded-full border-4 disabled:opacity-40 ${
                  isGood ? 'bg-emerald-500 border-emerald-300' : 'bg-white/20 border-white/40'
                }`}
                aria-label={pendingImages.length === 0 ? 'Capturar primera foto' : 'Capturar segunda foto'}
              />
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </AppShell>
    </PageTransition>
  );
}
