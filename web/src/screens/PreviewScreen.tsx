import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppState, MIN_FACE_CAPTURES } from '../context/AppContext';
import { evaluateImageBlob, type ImageQuality } from '../services/imageQualityService';
import { loggerService } from '../services/loggerService';

export function PreviewScreen() {
  const { pendingImages, clearPendingImages, queueImagesForAnalysis } = useAppState();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [qualities, setQualities] = useState<Array<ImageQuality | null>>([]);
  const imageCount = pendingImages.length;

  useEffect(() => {
    if (imageCount < MIN_FACE_CAPTURES) {
      navigate('/image-picker');
      return;
    }

    let active = true;
    Promise.all(pendingImages.map((img) => evaluateImageBlob(img.blob).catch(() => null)))
      .then((results) => {
        if (active) setQualities(results);
      });

    return () => { active = false; };
  }, [pendingImages, imageCount, navigate]);

  if (imageCount < MIN_FACE_CAPTURES) return null;

  const allGood = qualities.length === imageCount
    && qualities.every((q) => q?.isGood ?? true);
  const isDouble = imageCount >= 2;

  function handleRetake() {
    clearPendingImages();
    const source = pendingImages[0]?.source;
    navigate(source === 'gallery' ? '/image-picker' : '/quality-scan');
  }

  function handleAddSecond() {
    const source = pendingImages[0]?.source;
    navigate(source === 'gallery' ? '/image-picker' : '/quality-scan');
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    queueImagesForAnalysis([...pendingImages]);
    loggerService.info('Usuario confirma envío a análisis', { images: imageCount });
    navigate('/analysis/conditions');
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
          <FlowStepper currentStep={3} />
          <SectionHeader
            title="Vista previa"
            description={
              isDouble
                ? 'Revisa tus 2 fotografías antes de iniciar el análisis con IA'
                : 'Revisa tu fotografía antes de iniciar el análisis con IA'
            }
            align="center"
          />

          <div className="surface-card p-6">
            <div className={`grid gap-4 mb-6 ${isDouble ? 'sm:grid-cols-2' : 'max-w-sm mx-auto'}`}>
              {pendingImages.map((img, index) => {
                const quality = qualities[index];
                const isGood = quality?.isGood ?? true;
                return (
                  <div key={img.objectUrl}>
                    <p className="text-sm font-semibold text-brand-900 mb-2">
                      Fotografía {index + 1}
                    </p>
                    <div className="scan-corners ai-card aspect-[3/4] overflow-hidden relative">
                      <img
                        src={img.objectUrl}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                          isGood
                            ? 'bg-emerald-500 text-white shadow-soft'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {isGood ? '✓ Válida' : '⚠ Revisar'}
                      </div>
                    </div>
                    <p className="text-xs text-textMuted mt-2 text-center">
                      {img.width}×{img.height}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className={`rounded-xl p-4 mb-6 border-2 ${
                allGood ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              {allGood ? (
                <p className="text-sm text-emerald-800">
                  <strong>Imagen{isDouble ? 'es' : ''} válida{isDouble ? 's' : ''}.</strong>
                  {' '}Listas para el análisis dermatológico{isDouble ? ' combinado' : ''}.
                </p>
              ) : (
                <p className="text-sm text-amber-800">
                  <strong>Calidad mejorable en alguna foto.</strong> Puedes continuar o volver a capturar.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <PrimaryButton
                  label={analyzing ? 'Iniciando análisis…' : 'Analizar con IA'}
                  onClick={handleAnalyze}
                  loading={analyzing}
                  disabled={analyzing}
                  className="w-full"
                />
                <PrimaryButton
                  label="Volver a capturar"
                  variant="secondary"
                  onClick={handleRetake}
                  disabled={analyzing}
                  className="w-full"
                />
              </div>
              {!isDouble && (
                <PrimaryButton
                  label="Agregar segunda foto (opcional)"
                  variant="secondary"
                  onClick={handleAddSecond}
                  disabled={analyzing}
                  className="w-full"
                />
              )}
            </div>
          </div>

          <p className="text-center text-sm text-textMuted mt-5">
            {isDouble
              ? 'Se analizarán 2 fotografías en una sola petición.'
              : 'Puedes analizar con 1 foto o agregar una segunda para mayor cobertura.'}
            {' '}Suele tomar unos segundos.
          </p>
        </div>
      </AppShell>
    </PageTransition>
  );
}
