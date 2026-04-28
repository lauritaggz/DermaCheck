import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { ChartIcon, DocumentIcon, AlertIcon } from '../components/Icons';

export function ResultsScreen() {
  const { pendingImage, analysisResult } = useAppState();
  const navigate = useNavigate();

  // Si no hay resultados, redirigir
  useEffect(() => {
    if (!analysisResult) {
      navigate('/home');
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) {
    return null;
  }

  function handleNewAnalysis() {
    navigate('/image-picker');
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      red: 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <PageTransition>
      <ScreenContainer scroll>
      <div className="py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <ChartIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-primary">
                Resultados del Análisis
              </h1>
            </div>
            <p className="text-lg text-textSecondary">
              Análisis completado con inteligencia artificial
            </p>
          </div>

          {/* Main Content Grid */}
          {pendingImage && (
            <div className="grid lg:grid-cols-5 gap-6 mb-8">
              {/* Image Column */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 border-2 border-primary/10 shadow-lg sticky top-6">
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Imagen Analizada
                  </h2>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
                    <img
                      src={pendingImage.uri}
                      alt="Imagen analizada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Results Column */}
              <div className="lg:col-span-3 space-y-6">
                {/* Conditions Detected */}
                <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 shadow-lg">
                  <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center">
                      <ChartIcon className="w-6 h-6 text-white" />
                    </div>
                    Afecciones Detectadas
                  </h2>
                  
                  <div className="space-y-4">
                    {analysisResult.conditions.length > 0 ? (
                      analysisResult.conditions.map(condition => (
                        <div
                          key={condition.id}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 ${getColorClasses(condition.color)}`}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-lg mb-1">{condition.label}</p>
                            <p className="text-sm opacity-75 capitalize">Severidad: {condition.severity}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">{condition.confidence}%</div>
                            <p className="text-xs opacity-75">Confianza</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
                        <p className="text-green-800 font-medium">
                          ¡Excelente! No se detectaron afecciones significativas en tu rostro.
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          Continúa con tu rutina de cuidado diario para mantener una piel saludable.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-blue-50 to-primary/5 rounded-3xl p-8 border-2 border-primary/20">
                  <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <DocumentIcon className="w-6 h-6 text-white" />
                    </div>
                    Recomendaciones Personalizadas
                  </h2>
                  
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-primary/10">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <p className="text-textSecondary flex-1 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200/50">
                  <div className="flex gap-4">
                    <AlertIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-amber-900 mb-2">Aviso Médico Importante</h3>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Este análisis es una herramienta de orientación cosmética basada en IA y 
                        <strong> no constituye un diagnóstico médico</strong>. Para condiciones persistentes, 
                        dolorosas o preocupantes, consulta presencialmente con un dermatólogo certificado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <PrimaryButton
              label="Nuevo Análisis"
              onPress={handleNewAnalysis}
              className="flex-1 text-lg py-4 shadow-lg hover:shadow-xl"
            />
            <PrimaryButton
              label="Volver al Inicio"
              variant="secondary"
              onPress={() => navigate('/home')}
              className="flex-1 text-lg py-4"
            />
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
