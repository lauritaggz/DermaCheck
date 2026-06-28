import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { CameraSelector } from '../components/capture/CameraSelector';
import { DraggableCaptureButton } from '../components/capture/DraggableCaptureButton';
import { SelectedCapturePreviews } from '../components/capture/SelectedCapturePreviews';
import { PrimaryButton } from '../components/PrimaryButton';
import { CAPTURE_POSE_HINTS } from '../constants/captureAssets';
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
  const showFixedContinue = canContinue && !atMaxCaptures;

  function handleContinue() {
    stopStream();
    navigate('/preview');
  }

  const isGood = imageQuality?.isGood;

  const continueLabel = pendingImages.length >= 2
    ? 'Continuar a vista previa'
    : 'Continuar con 1 foto';

  return (
    <PageTransition>
      <AppShell variant="focus">
        <div
          className={`min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto ${
            showFixedContinue ? 'pb-32' : 'pb-8'
          }`}
        >
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
              ? '1 foto de frente o 2 laterales'
              : pendingImages.length === 1
                ? '1 foto lista · Puedes tomar otra o continuar'
                : '2 fotos listas'}
          </div>

          <div className="mb-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20">
            <p className="text-xs font-semibold text-white/90 mb-1">
              Foto {captureNumber}{captureNumber >= 2 ? '' : ' (2ª opcional)'}
            </p>
            <p className="text-[11px] sm:text-xs text-white/70 leading-snug">
              {CAPTURE_POSE_HINTS[Math.min(Math.max(captureNumber, 1), 2) - 1]}
            </p>
          </div>

          {pendingImages.length > 0 && (
            <SelectedCapturePreviews
              images={pendingImages}
              variant="dark"
              className="mb-3"
            />
          )}

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 max-h-[50vh] mx-auto w-full mb-4">
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
              <div className="absolute top-3 left-3 right-3 pointer-events-none">
                <div className={`px-3 py-2 rounded-lg text-xs font-medium backdrop-blur ${
                  isGood ? 'bg-emerald-500/30 text-emerald-100' : 'bg-red-500/30 text-red-100'
                }`}>
                  {isGood ? '✓ Listo para capturar' : `Ajustar: ${imageQuality.issues.join(', ')}`}
                </div>
              </div>
            )}

            <DraggableCaptureButton
              disabled={capturing || !!error || isLoading || !isGood || atMaxCaptures}
              isReady={Boolean(isGood)}
              capturing={capturing}
              onCapture={captureImage}
              ariaLabel={pendingImages.length === 0 ? 'Capturar primera foto' : 'Capturar segunda foto'}
            />
          </div>

          <p className="text-[11px] text-white/50 text-center mb-3">
            Mantén pulsado y arrastra el botón verde para moverlo
          </p>

          <CameraSelector
            resolvedCameras={resolvedCameras}
            selectedDeviceId={selectedDeviceId}
            activeTrackLabel={activeTrackLabel}
            isLoading={isLoading}
            onSelect={selectCamera}
            onRefresh={() => refreshDevices()}
          />

          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {showFixedContinue && (
          <div className="fixed bottom-0 inset-x-0 z-40 px-4 pt-3 pb-6 bg-slate-950/95 border-t border-white/10 backdrop-blur-sm">
            <PrimaryButton
              label={continueLabel}
              variant="secondary"
              onClick={handleContinue}
              className="w-full max-w-3xl mx-auto !min-h-[56px] !text-base sm:!text-lg"
            />
          </div>
        )}
      </AppShell>
    </PageTransition>
  );
}
