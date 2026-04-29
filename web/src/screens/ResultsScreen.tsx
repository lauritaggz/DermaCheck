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
      {/* Fondo con gradiente y patrón */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            
            {/* Header con título - Alineado a la izquierda */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <ChartIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Resultados del Análisis
                  </h1>
                  <p className="text-base text-gray-600 mt-1">
                    Análisis completado con inteligencia artificial
                  </p>
                </div>
              </div>
            </div>

            {/* DISCLAIMER PRINCIPAL - Banner superior */}
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border-l-4 border-amber-500 shadow-md">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <AlertIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-xl mb-2">
                    Resultado Preliminar - No Diagnóstico Médico
                  </h3>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {diagnosis.disclaimer}
                  </p>
                </div>
              </div>
            </div>

            {/* ADVERTENCIA SI REQUIERE EVALUACIÓN */}
            {diagnosis.requiere_evaluacion && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border-l-4 border-red-600 shadow-md animate-pulse">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <ShieldIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-xl mb-2">
                      Se Recomienda Evaluación Médica Presencial
                    </h3>
                    {diagnosis.advertencias_generales.map((adv, idx) => (
                      <p key={idx} className="text-sm text-red-900 leading-relaxed mb-2">
                        {adv}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid - Diseño widescreen */}
            <div className="grid lg:grid-cols-12 gap-6 mb-8">
              
              {/* Image Column - Más estrecha */}
              <div className="lg:col-span-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-xl sticky top-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Imagen Analizada
                    </h2>
                  </div>
                  
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-200 shadow-inner">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/${image.path}`}
                      alt="Imagen analizada"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Resumen General - Card compacta */}
                  <div className={`mt-6 p-5 rounded-2xl border-2 shadow-md ${getSeverityBgColor(diagnosis.severidad_general)}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <ChartIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          {diagnosis.mensaje_severidad.titulo}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed">
                      {diagnosis.resumen_general}
                    </p>
                    <div className="pt-3 border-t border-gray-300">
                      <p className="text-xs font-medium opacity-80">
                        {diagnosis.mensaje_severidad.consejo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Column - Más ancha */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Condiciones Detectadas */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-2xl flex items-center justify-center shadow-md`}>
                      <ChartIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Afecciones Detectadas
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {diagnosis.condiciones_detectadas.length} condición{diagnosis.condiciones_detectadas.length !== 1 ? 'es' : ''} identificada{diagnosis.condiciones_detectadas.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                
                  <div className="space-y-4">
                    {diagnosis.condiciones_detectadas.length > 0 ? (
                      diagnosis.condiciones_detectadas.map((condicion: DetectedCondition, idx) => (
                        <div key={condicion.id} className="group hover:scale-[1.01] transition-transform duration-200">
                          {/* Header de la condición - Diseño horizontal mejorado */}
                          <div className={`relative overflow-hidden rounded-2xl border-2 shadow-md hover:shadow-lg transition-shadow ${getConditionColorClasses(condicion.color_ui)}`}>
                            <div className="flex items-stretch">
                              {/* Barra lateral con número */}
                              <div className={`w-16 bg-gradient-to-b ${getSeverityColor(diagnosis.severidad_general)} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-3xl font-bold text-white">{idx + 1}</span>
                              </div>
                              
                              {/* Contenido principal */}
                              <div className="flex-1 p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-xl mb-2">{condicion.label}</h3>
                                    <p className="text-sm leading-relaxed opacity-90">
                                      {condicion.descripcion}
                                    </p>
                                  </div>
                                  
                                  {/* Estadísticas */}
                                  <div className="flex-shrink-0 text-right bg-white/50 rounded-xl p-4 min-w-[140px]">
                                    <div className="text-4xl font-bold leading-none mb-1">
                                      {Math.round(condicion.confianza_promedio * 100)}%
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                                      Confianza
                                    </p>
                                    <div className="pt-2 border-t border-current/20">
                                      <p className="text-sm font-medium">
                                        {condicion.cantidad_detecciones} detección{condicion.cantidad_detecciones > 1 ? 'es' : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Advertencias de la condición */}
                                {condicion.advertencias.length > 0 && (
                                  <div className="mt-4 pt-4 border-t-2 border-current/20">
                                    <div className="flex items-start gap-3">
                                      <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <h4 className="font-bold text-sm mb-2">Advertencias Médicas:</h4>
                                        <ul className="space-y-2">
                                          {condicion.advertencias.map((adv, advIdx) => (
                                            <li key={advIdx} className="text-sm flex gap-2 leading-relaxed">
                                              <span className="font-bold">•</span>
                                              <span>{adv}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-md p-8 text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl"></div>
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-green-900 font-bold text-xl mb-2">
                            ¡Excelente! No se detectaron afecciones significativas
                          </p>
                          <p className="text-green-800 leading-relaxed">
                            {diagnosis.mensaje_severidad.mensaje}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
              </div>

                {/* Consejos Generales */}
                {diagnosis.consejos_generales.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-8 border border-blue-200 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                        <DocumentIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Consejos Generales de Cuidado
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Recomendaciones para mantener tu piel saludable
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {diagnosis.consejos_generales.map((consejo, idx) => (
                        <div key={idx} className="flex gap-4 p-5 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-lg font-bold text-white">{idx + 1}</span>
                          </div>
                          <p className="text-gray-700 flex-1 leading-relaxed text-sm">{consejo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center">
                        <ShieldIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Información Importante</h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {diagnosis.mensaje_severidad.mensaje}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Análisis generado el {new Date(analysisResult.timestamp).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Full width */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <PrimaryButton
                label="Nuevo Análisis"
                onPress={handleNewAnalysis}
                className="flex-1 text-lg py-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              />
              <PrimaryButton
                label="Volver al Inicio"
                variant="secondary"
                onPress={() => navigate('/home')}
                className="flex-1 text-lg py-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
