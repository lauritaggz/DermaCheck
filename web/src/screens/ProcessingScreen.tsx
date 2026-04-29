import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { ScanIcon } from '../components/Icons';

export function ProcessingScreen() {
  const { pendingImage, user, setAnalysisResult } = useAppState();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingImage || !user) {
      navigate('/home');
      return;
    }

    async function runAnalysis() {
      try {
        // Convertir la imagen a Blob
        const blob = await fetch(pendingImage!.uri).then(r => r.blob());
        
        // Crear FormData
        const formData = new FormData();
        formData.append('face_image', blob, 'capture.jpg');
        formData.append('user_id', user!.id);
        formData.append('conf', '0.25');

        // Enviar al backend (endpoint con diagnóstico)
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/analysis/face-analyze`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.detail || 'Error al analizar la imagen');
          return;
        }

        const result = await response.json();
        
        // Guardar resultado completo (con diagnóstico)
        setAnalysisResult(result);

        // Actualizar progreso a 100%
        setProgress(100);

        // Navegar a resultados
        setTimeout(() => navigate('/results'), 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al analizar la imagen');
      }
    }

    // Simular progreso mientras se procesa
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    // Ejecutar análisis
    runAnalysis();

    return () => clearInterval(interval);
  }, [pendingImage, user, navigate, setAnalysisResult]);

  // Si hay error, mostrar botón para volver
  if (error) {
    return (
      <PageTransition>
        <ScreenContainer>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="max-w-2xl w-full text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold text-red-600 mb-4">
                  Error en el Análisis
                </h1>

                <div className="bg-red-50 rounded-2xl p-6 mb-6 border-2 border-red-200">
                  <p className="text-red-800">
                    {error}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/home')}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </ScreenContainer>
      </PageTransition>
    );
  }

  const steps = [
    { label: 'Cargando imagen', threshold: 20 },
    { label: 'Ejecutando análisis IA', threshold: 40 },
    { label: 'Detectando afecciones', threshold: 70 },
    { label: 'Generando recomendaciones', threshold: 90 },
  ];

  return (
    <PageTransition>
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-2xl w-full">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-primary to-primaryDark rounded-full 
                            flex items-center justify-center shadow-2xl">
                <ScanIcon className="w-14 h-14 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-3">
              Analizando Imagen
            </h1>
            <p className="text-lg text-textSecondary">
              Nuestro modelo de IA está procesando tu fotografía facial
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 shadow-xl mb-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-textSecondary">Progreso del análisis</span>
                <span className="text-lg font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary via-blue-500 to-primaryDark h-full 
                           transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isCompleted = progress > step.threshold;
                const isActive = progress > (steps[idx - 1]?.threshold || 0) && progress <= step.threshold;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all
                              ${isCompleted ? 'bg-green-50 border border-green-200' : 
                                isActive ? 'bg-blue-50 border border-blue-200' : 
                                'bg-gray-50 border border-gray-200'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                   ${isCompleted ? 'bg-green-500' : 
                                     isActive ? 'bg-blue-500 animate-pulse' : 
                                     'bg-gray-300'}`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors
                                   ${isCompleted ? 'text-green-700' : 
                                     isActive ? 'text-blue-700' : 
                                     'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Text */}
          <p className="text-center text-sm text-textMuted">
            Este proceso suele tomar entre 5 y 10 segundos. Por favor, no cierres esta ventana.
          </p>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
