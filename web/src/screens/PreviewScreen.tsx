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
      <ScreenContainer maxWidth="xl" className="bg-gradient-to-br from-surface via-white to-secondary/20">
        <div className="flex flex-col items-center justify-center min-h-screen py-4 sm:py-6">
          <div className="w-full max-w-4xl px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-5 text-center">
              Previsualización
            </h1>

            <div className="bg-white rounded-xl p-5 sm:p-6 mb-5 border border-borderLight shadow-lg">
              {/* Layout horizontal: imagen a la izquierda, contenido a la derecha */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagen pequeña */}
                <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={pendingImage.uri}
                      alt="Imagen capturada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Contenido: texto y botones */}
                <div className="flex-1 flex flex-col">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                    <p className="text-sm text-blue-800">
                      <strong>✓ Imagen válida</strong><br />
                      La imagen cumple con los requisitos para el análisis.
                    </p>
                  </div>

                  <div className="text-sm text-textSecondary space-y-2.5 mb-6 flex-1">
                    <p>• Rostro centrado y visible</p>
                    <p>• Iluminación adecuada</p>
                    <p>• Resolución: {pendingImage.width} x {pendingImage.height}px</p>
                  </div>

                  {/* Botones en el contenido */}
                  <div className="space-y-3">
                    <PrimaryButton
                      label={analyzing ? 'Analizando...' : 'Analizar con IA'}
                      onPress={handleAnalyze}
                      loading={analyzing}
                      disabled={analyzing}
                      className="w-full py-3.5 text-base"
                    />

                    <PrimaryButton
                      label="Tomar otra foto"
                      variant="secondary"
                      onPress={handleRetake}
                      disabled={analyzing}
                      className="w-full py-3 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-textMuted text-center mt-5">
              El análisis tomará unos segundos. La imagen será procesada por nuestro modelo de IA.
            </p>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
