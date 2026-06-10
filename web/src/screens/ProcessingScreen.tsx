import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { AnalysisProgress } from '../components/analysis/AnalysisProgress';
import { ScanLoadingAnimation } from '../components/analysis/ScanLoadingAnimation';
import { ErrorState } from '../components/ui/ErrorState';
import { useAppState } from '../context/AppContext';
import { useDermatologyAnalysis } from '../hooks/useDermatologyAnalysis';

const STEPS = [
  { label: 'Cargando imagen', threshold: 20 },
  { label: 'Ejecutando análisis IA', threshold: 40 },
  { label: 'Detectando afecciones', threshold: 70 },
  { label: 'Generando recomendaciones', threshold: 90 },
];

export function ProcessingScreen() {
  const { pendingImage, user, setAnalysisResult, setPendingImage } = useAppState();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const { analyzeFaceImage, error, clearError } = useDermatologyAnalysis();

  useEffect(() => {
    if (!pendingImage || !user) { navigate('/home'); return; }
    const img = pendingImage;
    const u = user;

    async function run() {
      try {
        const result = await analyzeFaceImage({ imageBlob: img.blob, userId: u.id, confidenceThreshold: 0.25 });
        if (!result) return;
        setAnalysisResult(result);
        setProgress(100);
        setTimeout(() => navigate('/analysis/results'), 500);
      } finally {
        URL.revokeObjectURL(img.objectUrl);
        setPendingImage(null);
      }
    }

    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 90) { clearInterval(interval); return 90; } return p + 10; });
    }, 500);
    run();
    return () => clearInterval(interval);
  }, [pendingImage, user, navigate, setAnalysisResult, setPendingImage, analyzeFaceImage]);

  if (error) {
    return (
      <PageTransition>
        <AppShell>
          <ErrorState title="Error en el análisis" message={error} onAction={() => { clearError(); navigate('/home'); }} />
        </AppShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
          <FlowStepper currentStep={4} />
          <SectionHeader badge="Procesamiento IA" title="Analizando tu piel"
            description="Nuestro modelo está procesando tu fotografía facial" align="center" />

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ScanLoadingAnimation imageUrl={pendingImage?.objectUrl} />
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
