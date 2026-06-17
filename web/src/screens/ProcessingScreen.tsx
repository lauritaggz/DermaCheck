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
import { useDermatologyAnalysis } from '../hooks/useDermatologyAnalysis';
import { resolveKioskUserId } from '../services/kioskService';
import type { ImageAsset } from '../types';

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
    consent,
  } = useAppState();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const { analyzeFaceImage, analyzeFaceImagesDouble, error, clearError } = useDermatologyAnalysis();
  const runStartedRef = useRef(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [processingCount, setProcessingCount] = useState(0);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      runStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (runStartedRef.current) return;

    const images: ImageAsset[] = imagesForAnalysis ?? pendingImages;

    if (!consent.accepted) {
      navigate('/consent');
      return;
    }

    if (images.length < MIN_FACE_CAPTURES) {
      navigate('/image-picker');
      return;
    }

    runStartedRef.current = true;
    setPreviewUrl(images[0]?.objectUrl);
    setProcessingCount(images.length);

    const isDouble = images.length >= 2;

    async function run() {
      try {
        const userId = await resolveKioskUserId();
        const result = isDouble
          ? await analyzeFaceImagesDouble({
              imageBlob1: images[0].blob,
              imageBlob2: images[1].blob,
              userId,
              confidenceThreshold: 0.25,
            })
          : await analyzeFaceImage({
              imageBlob: images[0].blob,
              userId,
              confidenceThreshold: 0.25,
            });

        if (!result) return;

        setAnalysisResult(result);
        setProgress(100);
        clearPendingImages();
        clearImagesForAnalysis();
        setTimeout(() => navigate('/analysis/results'), 500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al iniciar el análisis';
        setBootError(message);
        runStartedRef.current = false;
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

    run();
    return () => clearInterval(interval);
  }, [
    analyzeFaceImage,
    analyzeFaceImagesDouble,
    clearImagesForAnalysis,
    clearPendingImages,
    consent.accepted,
    imagesForAnalysis,
    navigate,
    pendingImages,
    setAnalysisResult,
  ]);

  const displayError = bootError ?? error;

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
            title="Analizando tu piel"
            description={
              processingCount >= 2
                ? 'Procesando 2 fotografías faciales'
                : 'Procesando tu fotografía facial'
            }
            align="center"
          />

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ScanLoadingAnimation imageUrl={previewUrl} />
            <AnalysisProgress progress={progress} steps={STEPS} />
          </div>

          <p className="text-center text-sm text-textMuted mt-8">
            Suele tomar 5–10 segundos. No cierres esta ventana.
          </p>
        </div>
      </AppShell>
    </PageTransition>
  );
}
