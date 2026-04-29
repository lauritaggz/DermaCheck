import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { ChartIcon, DocumentIcon, AlertIcon, ShieldIcon } from '../components/Icons';
import type { DetectedCondition } from '../types';

export function ResultsScreen() {
  const { analysisResult } = useAppState();
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

  const { diagnosis, image } = analysisResult;

  function handleNewAnalysis() {
    navigate('/image-picker');
  }

  // Función para obtener color según severidad
  const getSeverityColor = (severidad: string) => {
    const colors = {
      ninguna: 'from-green-500 to-green-600',
      leve: 'from-blue-500 to-blue-600',
      moderada: 'from-amber-500 to-amber-600',
      severa: 'from-red-500 to-red-600',
    };
    return colors[severidad as keyof typeof colors] || colors.leve;
  };

  const getSeverityBgColor = (severidad: string) => {
    const colors = {
      ninguna: 'bg-green-50 border-green-200',
      leve: 'bg-blue-50 border-blue-200',
      moderada: 'bg-amber-50 border-amber-200',
      severa: 'bg-red-50 border-red-200',
    };
    return colors[severidad as keyof typeof colors] || colors.leve;
  };

  const getConditionColorClasses = (color: string) => {
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
          
          {/* Header con título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-xl flex items-center justify-center`}>
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

          {/* DISCLAIMER PRINCIPAL - Muy visible */}
          <div className="mb-8 bg-amber-50 rounded-2xl p-6 border-2 border-amber-300">
            <div className="flex gap-4">
              <AlertIcon className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 text-lg mb-2">
                  Resultado Preliminar - No Diagnóstico Médico
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                  {diagnosis.disclaimer}
                </p>
              </div>
            </div>
          </div>

          {/* ADVERTENCIA SI REQUIERE EVALUACIÓN */}
          {diagnosis.requiere_evaluacion && (
            <div className="mb-8 bg-red-50 rounded-2xl p-6 border-2 border-red-300 animate-pulse">
              <div className="flex gap-4">
                <ShieldIcon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg mb-2">
                    Se Recomienda Evaluación Médica Presencial
                  </h3>
                  {diagnosis.advertencias_generales.map((adv, idx) => (
                    <p key={idx} className="text-sm text-red-800 leading-relaxed mb-2 whitespace-pre-line">
                      {adv}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
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
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/${image.path}`}
                    alt="Imagen analizada"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Resumen General en Tarjeta de Imagen */}
                <div className={`mt-6 p-4 rounded-2xl border-2 ${getSeverityBgColor(diagnosis.severidad_general)}`}>
                  <h3 className="font-bold text-lg mb-2">
                    {diagnosis.mensaje_severidad.titulo}
                  </h3>
                  <p className="text-sm mb-2">
                    {diagnosis.resumen_general}
                  </p>
                  <p className="text-xs opacity-75">
                    {diagnosis.mensaje_severidad.consejo}
                  </p>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Condiciones Detectadas */}
              <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 shadow-lg">
                <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-xl flex items-center justify-center`}>
                    <ChartIcon className="w-6 h-6 text-white" />
                  </div>
                  Afecciones Detectadas
                </h2>
                
                <div className="space-y-4">
                  {diagnosis.condiciones_detectadas.length > 0 ? (
                    diagnosis.condiciones_detectadas.map((condicion: DetectedCondition) => (
                      <div key={condicion.id} className="space-y-3">
                        {/* Header de la condición */}
                        <div
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 ${getConditionColorClasses(condicion.color_ui)}`}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-lg mb-1">{condicion.label}</p>
                            <p className="text-sm opacity-75">{condicion.descripcion}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold">
                              {Math.round(condicion.confianza_promedio * 100)}%
                            </div>
                            <p className="text-xs opacity-75">Confianza</p>
                            <p className="text-xs opacity-75 mt-1">
                              {condicion.cantidad_detecciones} detección{condicion.cantidad_detecciones > 1 ? 'es' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Recomendaciones de la condición */}
                        {condicion.recomendaciones.length > 0 && (
                          <div className="ml-4 pl-4 border-l-2 border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Recomendaciones:</h4>
                            <ul className="space-y-1">
                              {condicion.recomendaciones.slice(0, 3).map((rec, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex gap-2">
                                  <span className="text-primary">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Advertencias de la condición */}
                        {condicion.advertencias.length > 0 && (
                          <div className="ml-4 pl-4 border-l-2 border-amber-300">
                            <h4 className="font-semibold text-sm text-amber-800 mb-2">Advertencias:</h4>
                            <ul className="space-y-1">
                              {condicion.advertencias.map((adv, idx) => (
                                <li key={idx} className="text-xs text-amber-700 flex gap-2">
                                  <span>•</span>
                                  <span>{adv}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
                      <p className="text-green-800 font-medium">
                        ¡Excelente! No se detectaron afecciones significativas en tu rostro.
                      </p>
                      <p className="text-sm text-green-700 mt-2">
                        {diagnosis.mensaje_severidad.mensaje}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Consejos Generales */}
              {diagnosis.consejos_generales.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-primary/5 rounded-3xl p-8 border-2 border-primary/20">
                  <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <DocumentIcon className="w-6 h-6 text-white" />
                    </div>
                    Consejos Generales de Cuidado
                  </h2>
                  
                  <div className="space-y-3">
                    {diagnosis.consejos_generales.map((consejo, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-primary/10">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <p className="text-textSecondary flex-1 leading-relaxed">{consejo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer Footer */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-4">
                  <ShieldIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Información Importante</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {diagnosis.mensaje_severidad.mensaje}
                    </p>
                    <p className="text-xs text-gray-600">
                      Este análisis fue generado el {new Date(analysisResult.timestamp).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
