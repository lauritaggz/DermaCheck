import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { AnalysisProgress } from '../components/analysis/AnalysisProgress';
import { ScanLoadingAnimation } from '../components/analysis/ScanLoadingAnimation';
import { ErrorState } from '../components/ui/ErrorState';
import { useAppState, MIN_FACE_CAPTURES } from '../context/AppContext';
import { buildAnalysisConsentPayload, useDermatologyAnalysis } from '../hooks/useDermatologyAnalysis';
import type { QueueProgressUpdate } from '../services/analysisJobService';
import { isConsentComplete } from '../utils/consentHelpers';
import { resolveKioskUserId } from '../services/kioskService';
import type { AnalysisJobStatus, ImageAsset } from '../types';

const STEPS = [
  { label: 'Cargando imágenes', threshold: 20 },
  { label: 'Ejecutando análisis IA', threshold: 40 },
  { label: 'Detectando afecciones', threshold: 70 },
  { label: 'Generando recomendaciones', threshold: 90 },
];

export function ProcessingScreen() {
  const {
    imagesForAnalysis,
    pendingImages,
    setAnalysisResult,
    clearPendingImages,
    clearImagesForAnalysis,
    setResultImageUrls,
    consent,
  } = useAppState();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const { analyzeFaceImage, analyzeFaceImagesDouble, error, clearError } = useDermatologyAnalysis();
  const runStartedRef = useRef(false);
  const analysisLockRef = useRef<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [processingCount, setProcessingCount] = useState(0);
  const [bootError, setBootError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<AnalysisJobStatus | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const handleQueueUpdate = ({ status, position }: QueueProgressUpdate) => {
    setQueueStatus(status);
    setQueuePosition(position);
  };

  useEffect(() => {
    const images: ImageAsset[] = imagesForAnalysis ?? pendingImages;

    if (!isConsentComplete(consent)) {
      navigate('/consent');
      return;
    }

    const consentPayload = buildAnalysisConsentPayload(consent);
    if (!consentPayload) {
      navigate('/consent');
      return;
    }

    if (images.length < MIN_FACE_CAPTURES) {
      navigate('/image-picker');
      return;
    }

    const runKey = `${consentPayload.sessionId}:${images.length}:${images.map((img) => img.blob.size).join('-')}`;
    if (runStartedRef.current || analysisLockRef.current === runKey) return;

    runStartedRef.current = true;
    analysisLockRef.current = runKey;
    setPreviewUrls(images.map((img) => img.objectUrl));
    setProcessingCount(images.length);

    const isDouble = images.length >= 2;

    async function run(consentPayload: NonNullable<ReturnType<typeof buildAnalysisConsentPayload>>) {
      try {
        const userId = await resolveKioskUserId();
        const result = isDouble
          ? await analyzeFaceImagesDouble({
              imageBlob1: images[0].blob,
              imageBlob2: images[1].blob,
              userId,
              consent: consentPayload,
              onQueueUpdate: handleQueueUpdate,
            })
          : await analyzeFaceImage({
              imageBlob: images[0].blob,
              userId,
              consent: consentPayload,
              onQueueUpdate: handleQueueUpdate,
            });

        if (!result) return;

        setResultImageUrls(images.map((img) => img.objectUrl));
        setAnalysisResult(result);
        setProgress(100);
        clearPendingImages({ revokeUrls: false });
        clearImagesForAnalysis();
        setTimeout(() => navigate('/analysis/results'), 500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al iniciar el análisis';
        setBootError(message);
        runStartedRef.current = false;
        analysisLockRef.current = null;
      }
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 500);

    run(consentPayload);
    return () => clearInterval(interval);
  }, [
    analyzeFaceImage,
    analyzeFaceImagesDouble,
    clearImagesForAnalysis,
    clearPendingImages,
    consent,
    setResultImageUrls,
    imagesForAnalysis,
    navigate,
    pendingImages,
    setAnalysisResult,
  ]);

  const displayError = bootError ?? error;

  const queueMessage = (() => {
    if (queueStatus === 'queued') {
      if (queuePosition === 0) {
        return 'Próximo en procesarse';
      }
      if (queuePosition !== null && queuePosition > 0) {
        const label = queuePosition === 1 ? 'persona' : 'personas';
        return `En cola · ${queuePosition} ${label} antes que tú`;
      }
      return 'En cola de espera';
    }
    if (queueStatus === 'running') {
      return null;
    }
    return null;
  })();

  if (displayError) {
    return (
      <PageTransition>
        <AppShell>
          <ErrorState
            title="Error en el análisis"
            message={displayError}
            onAction={() => {
              clearError();
              setBootError(null);
              runStartedRef.current = false;
              analysisLockRef.current = null;
              navigate('/preview');
            }}
          />
        </AppShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
          <FlowStepper currentStep={4} />
          <SectionHeader
            badge="Procesamiento IA"
            title={queueStatus === 'queued' ? 'Esperando turno' : 'Analizando tu piel'}
            description={
              queueMessage
                ?? (processingCount >= 2
                  ? 'Procesando 2 fotografías faciales'
                  : 'Procesando tu fotografía facial')
            }
            align="center"
          />

          {queueStatus === 'queued' ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-lg text-textMuted text-center max-w-md">
                {queueMessage ?? 'En cola de espera'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <ScanLoadingAnimation imageUrls={previewUrls} />
              <AnalysisProgress progress={progress} steps={STEPS} />
            </div>
          )}

          <p className="text-center text-sm text-textMuted mt-8">
            {queueStatus === 'queued'
              ? 'El análisis comenzará en cuanto termine el turno anterior.'
              : 'Suele tomar 5–10 segundos. No cierres esta ventana.'}
          </p>
        </div>
      </AppShell>
    </PageTransition>
  );
}
