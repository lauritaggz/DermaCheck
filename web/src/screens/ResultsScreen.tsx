import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PrimaryButton } from '../components';
import { ExpressionLinesFindingCard } from '../components/ExpressionLinesFindingCard';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { ChartIcon, DocumentIcon, AlertIcon, ShieldIcon, SparklesIcon } from '../components/Icons';
import type { DetectedCondition } from '../types';
import { apiUrl } from '../utils/api';

export function ResultsScreen() {
  const { analysisResult } = useAppState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'recommendations' | 'details'>('diagnosis');

  // Si no hay resultados, redirigir
  useEffect(() => {
    if (!analysisResult) {
      navigate('/home');
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) {
    return null;
  }

  const { diagnosis, image, expression_lines, combined_diagnosis } = analysisResult;

  const showExpressionLinesCard = Boolean(expression_lines?.detected);
  const findingsCount =
    diagnosis.condiciones_detectadas.length + (showExpressionLinesCard ? 1 : 0);

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
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-4 sm:p-6 border-l-4 border-amber-500 shadow-md">
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
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4 sm:p-6 border-l-4 border-red-600 shadow-md animate-pulse">
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

            {/* TABS DE ACCESO RÁPIDO PARA MÓVILES (Oculto en desktop lg) */}
            <div className="lg:hidden mb-6 bg-white/70 backdrop-blur-md rounded-2xl p-1.5 border border-gray-200 shadow-sm flex gap-1 sticky top-3 z-30">
              <button
                onClick={() => setActiveTab('diagnosis')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'diagnosis'
                    ? 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                📊 Diagnóstico
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'recommendations'
                    ? 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                ✨ Recomendaciones
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'details'
                    ? 'bg-gradient-to-r from-primary to-primaryDark text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                🩺 Detalles
              </button>
            </div>

            {/* Main Content Grid - Diseño widescreen */}
            <div className="grid lg:grid-cols-12 gap-6 mb-8">
              
              {/* Image Column - Más estrecha */}
              <div className={`lg:col-span-4 ${activeTab === 'diagnosis' ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-xl sticky top-6">
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
                      src={apiUrl(`/uploads/${image.path}`)}
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
                      {combined_diagnosis?.summary ?? diagnosis.resumen_general}
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
                <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-8 border border-gray-200 shadow-xl ${activeTab === 'diagnosis' ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} rounded-2xl flex items-center justify-center shadow-md`}>
                      <ChartIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Afecciones Detectadas
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {findingsCount} hallazgo{findingsCount !== 1 ? 's' : ''} identificado
                        {findingsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                
                  <div className="space-y-4">
                    {diagnosis.condiciones_detectadas.length > 0 ? (
                      diagnosis.condiciones_detectadas.map((condicion: DetectedCondition, idx) => (
                        <div key={condicion.id} className="group hover:scale-[1.01] transition-transform duration-200">
                          {/* Header de la condición - Diseño horizontal mejorado */}
                          <div className={`relative overflow-hidden rounded-2xl border-2 shadow-md hover:shadow-lg transition-shadow ${getConditionColorClasses(condicion.color_ui)}`}>
                            <div className="flex flex-col sm:flex-row items-stretch">
                              {/* Barra lateral con número - visible en sm+ */}
                              <div className={`hidden sm:flex w-16 bg-gradient-to-b ${getSeverityColor(diagnosis.severidad_general)} items-center justify-center flex-shrink-0`}>
                                <span className="text-3xl font-bold text-white">{idx + 1}</span>
                              </div>
                              
                              {/* Contenido principal */}
                              <div className="flex-1 p-4 sm:p-5">
                                {/* Cabecera para móvil con número */}
                                <div className="flex sm:hidden items-center gap-2 mb-3">
                                  <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSeverityColor(diagnosis.severidad_general)} flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                                    {idx + 1}
                                  </span>
                                  <h3 className="font-bold text-lg text-gray-900">{condicion.label}</h3>
                                </div>

                                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                  <div className="flex-1 w-full">
                                    <h3 className="hidden sm:block font-bold text-xl mb-2">{condicion.label}</h3>
                                    <p className="text-sm leading-relaxed opacity-90">
                                      {condicion.descripcion}
                                    </p>
                                  </div>
                                  
                                  {/* Estadísticas */}
                                  <div className="w-full md:w-auto flex-shrink-0 text-left md:text-right bg-white/50 rounded-xl p-4 min-w-0 md:min-w-[140px] flex md:flex-col justify-between items-center md:items-end gap-2 md:gap-0">
                                    <div>
                                      <div className="text-3xl md:text-4xl font-bold leading-none mb-1">
                                        {Math.round(condicion.confianza_promedio * 100)}%
                                      </div>
                                      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-75">
                                        Confianza
                                      </p>
                                    </div>
                                    <div className="pt-0 md:pt-2 border-l md:border-l-0 md:border-t border-current/20 pl-3 md:pl-0">
                                      <p className="text-xs md:text-sm font-medium">
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
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-md p-4 sm:p-8 text-center">
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

                    {showExpressionLinesCard && expression_lines && (
                      <ExpressionLinesFindingCard
                        expressionLines={expression_lines}
                        cardIndex={diagnosis.condiciones_detectadas.length + 1}
                      />
                    )}

                    {expression_lines?.error && !expression_lines.detected && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No fue posible analizar líneas de expresión en esta ocasión.
                      </p>
                    )}
                  </div>
              </div>

                {/* RECOMENDACIONES PERSONALIZADAS POR AFECCIÓN (HU08) */}
                {diagnosis.condiciones_detectadas.length > 0 && (
                  <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-8 border border-gray-200 shadow-xl space-y-6 ${activeTab === 'recommendations' ? 'block' : 'hidden lg:block'}`}>
                    <div className="flex items-center gap-3 mb-2 pb-4 border-b-2 border-gray-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                        <SparklesIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Recomendaciones Personalizadas
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Sugerencias de cuidado y hábitos adaptadas a tu perfil
                        </p>
                      </div>
                    </div>

                    {/* ADVERTENCIA DE ORIENTACIÓN COSMÉTICA (Evitar receta médica) */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex gap-4 items-start shadow-sm">
                      <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <ShieldIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          Nota de Orientación Cosmética y Educativa
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <strong>IMPORTANTE:</strong> Las siguientes sugerencias son de carácter exclusivamente orientativo y cosmético general. <strong>No constituyen una receta médica ni tratamiento dermatológico definitivo</strong>. Si experimentas molestias persistentes, dolor o si tu condición no mejora, te recomendamos agendar una consulta formal con un dermatólogo certificado.
                        </p>
                      </div>
                    </div>

                    {/* LISTADO DE RECOMENDACIONES POR AFECCIÓN */}
                    <div className="space-y-6">
                      {diagnosis.condiciones_detectadas.map((condicion: DetectedCondition) => {
                        if (!condicion.recomendaciones || condicion.recomendaciones.length === 0) return null;
                        
                        return (
                          <div 
                            key={`rec-${condicion.id}`} 
                            className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className={`w-3.5 h-3.5 rounded-full ${
                                  condicion.color_ui === 'red' ? 'bg-red-500' :
                                  condicion.color_ui === 'amber' ? 'bg-amber-500' :
                                  condicion.color_ui === 'green' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                                <h3 className="font-bold text-lg text-gray-900">
                                  Cuidado para {condicion.label}
                                </h3>
                              </div>

                              {/* Alerta de consulta médica específica si corresponde */}
                              {condicion.sugiere_consulta_dermatologo && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 shadow-sm animate-pulse">
                                  🩺 Consulta médica sugerida
                                </span>
                              )}
                            </div>

                            {/* Mostrar alerta informativa detallada de consulta médica si corresponde */}
                            {condicion.sugiere_consulta_dermatologo && (
                              <div className="mb-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start text-amber-950">
                                <span className="text-lg">🩺</span>
                                <div className="text-xs leading-relaxed">
                                  <strong>Recomendación especial:</strong> Debido al nivel o cantidad de detecciones de <strong>{condicion.label.toLowerCase()}</strong> en tu rostro, te sugerimos programar una valoración presencial con un dermatólogo para obtener un diagnóstico formal y un plan terapéutico específico.
                                </div>
                              </div>
                            )}

                            {/* Lista de sugerencias */}
                            <ul className="space-y-3">
                              {condicion.recomendaciones.map((rec, recIdx) => (
                                <li key={recIdx} className="flex gap-3 items-start group">
                                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 mt-0.5 group-hover:scale-110 transition-transform">
                                    <span className="text-[11px] font-bold text-indigo-700">{recIdx + 1}</span>
                                  </div>
                                  <span className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {rec}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Consejos Generales */}
                {diagnosis.consejos_generales.length > 0 && (
                  <div className={`bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-4 sm:p-8 border border-blue-200 shadow-xl ${activeTab === 'recommendations' ? 'block' : 'hidden lg:block'}`}>
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
                <div className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-md ${activeTab === 'details' ? 'block' : 'hidden lg:block'}`}>
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
                onClick={handleNewAnalysis}
                className="flex-1 text-lg py-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              />
              <PrimaryButton
                label="Volver al Inicio"
                variant="secondary"
                onClick={() => navigate('/home')}
                className="flex-1 text-lg py-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
