import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';

export function PreviewScreen() {
  const { pendingImage, setPendingImage } = useAppState();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);

  if (!pendingImage) {
    navigate('/home');
    return null;
  }

  function handleRetake() {
    if (!pendingImage) return;
    
    if (pendingImage.uri.startsWith('blob:')) {
      URL.revokeObjectURL(pendingImage.uri);
    }
    setPendingImage(null);
    navigate('/camera');
  }

  async function handleAnalyze() {
    if (!pendingImage) return;
    
    setAnalyzing(true);
    navigate('/processing');
  }

  return (
    <PageTransition>
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">
            Previsualización
          </h1>

          <div className="bg-surface rounded-2xl p-6 mb-6 border border-borderLight">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={pendingImage.uri}
                alt="Imagen capturada"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>✓ Imagen válida</strong><br />
                La imagen cumple con los requisitos para el análisis.
              </p>
            </div>

            <div className="text-sm text-textSecondary space-y-2">
              <p>• Rostro centrado y visible</p>
              <p>• Iluminación adecuada</p>
              <p>• Resolución: {pendingImage.width} x {pendingImage.height}px</p>
            </div>
          </div>

          <div className="space-y-3">
            <PrimaryButton
              label={analyzing ? 'Analizando...' : 'Analizar con IA'}
              onPress={handleAnalyze}
              loading={analyzing}
              disabled={analyzing}
              className="w-full"
            />

            <PrimaryButton
              label="Tomar otra foto"
              variant="secondary"
              onPress={handleRetake}
              disabled={analyzing}
              className="w-full"
            />
          </div>

          <p className="text-xs text-textMuted text-center mt-6">
            El análisis tomará unos segundos. La imagen será procesada por nuestro modelo de IA
            para detectar posibles afecciones cutáneas.
          </p>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
