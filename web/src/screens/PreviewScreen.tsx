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
      <ScreenContainer maxWidth="lg" className="bg-gradient-to-br from-surface via-white to-secondary/20">
        <div className="flex flex-col items-center justify-center min-h-screen py-4 sm:py-6">
          <div className="w-full max-w-md px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center">
              Previsualización
            </h1>

            <div className="bg-white rounded-xl p-4 mb-4 border border-borderLight shadow-lg">
              {/* Imagen más pequeña con max-height */}
              <div className="relative w-full max-w-xs mx-auto mb-4">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={pendingImage.uri}
                    alt="Imagen capturada"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-800">
                  <strong>✓ Imagen válida</strong><br />
                  La imagen cumple con los requisitos para el análisis.
                </p>
              </div>

              <div className="text-xs text-textSecondary space-y-1">
                <p>• Rostro centrado y visible</p>
                <p>• Iluminación adecuada</p>
                <p>• Resolución: {pendingImage.width} x {pendingImage.height}px</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <PrimaryButton
                label={analyzing ? 'Analizando...' : 'Analizar con IA'}
                onPress={handleAnalyze}
                loading={analyzing}
                disabled={analyzing}
                className="w-full py-3 text-sm"
              />

              <PrimaryButton
                label="Tomar otra foto"
                variant="secondary"
                onPress={handleRetake}
                disabled={analyzing}
                className="w-full py-2.5 text-sm"
              />
            </div>

            <p className="text-xs text-textMuted text-center mt-4">
              El análisis tomará unos segundos. La imagen será procesada por nuestro modelo de IA.
            </p>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
