import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { FacePreviewCard } from '../components/preview/FacePreviewCard';
import { useAppState } from '../context/AppContext';
import { evaluateImageBlob, type ImageQuality } from '../services/imageQualityService';
import { loggerService } from '../services/loggerService';

export function PreviewScreen() {
  const { pendingImage, setPendingImage } = useAppState();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [imageQuality, setImageQuality] = useState<ImageQuality | null>(null);

  useEffect(() => {
    if (!pendingImage) return;
    let active = true;
    evaluateImageBlob(pendingImage.blob)
      .then((q) => { if (active) setImageQuality(q); })
      .catch(() => { if (active) setImageQuality(null); });
    return () => { active = false; };
  }, [pendingImage]);

  if (!pendingImage) { navigate('/home'); return null; }

  function handleRetake() {
    URL.revokeObjectURL(pendingImage!.objectUrl);
    setPendingImage(null);
    navigate(pendingImage!.source === 'gallery' ? '/image-picker' : '/quality-scan');
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    loggerService.info('Usuario confirma envío a análisis');
    navigate('/analysis/conditions');
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
          <FlowStepper currentStep={3} />
          <SectionHeader title="Vista previa" description="Revisa tu imagen antes de iniciar el análisis con IA" align="center" />
          <FacePreviewCard imageUrl={pendingImage.objectUrl} width={pendingImage.width}
            height={pendingImage.height} imageQuality={imageQuality} analyzing={analyzing}
            onAnalyze={handleAnalyze} onRetake={handleRetake} />
          <p className="text-center text-sm text-textMuted mt-5">
            El análisis tomará unos segundos. Tu imagen se procesa de forma segura.
          </p>
        </div>
      </AppShell>
    </PageTransition>
  );
}
