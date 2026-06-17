import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../components';
import { ExpressionLinesFindingCard } from '../components/ExpressionLinesFindingCard';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { AnalyzedImagePanel } from '../components/results/AnalyzedImagePanel';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';
import { GeneralTipsGrid } from '../components/results/GeneralTipsGrid';
import { MedicalAlertBanner } from '../components/results/MedicalAlertBanner';
import { ProductSuggestionsSection } from '../components/results/ProductSuggestionsSection';
import { RecommendationPanel } from '../components/results/RecommendationPanel';
import { SkinConditionCard } from '../components/results/SkinConditionCard';
import { StructuredRecommendationsSection } from '../components/results/StructuredRecommendationsSection';
import { EmptyState } from '../components/ui/EmptyState';
import { SendAnalysisEmail } from '../components/results/SendAnalysisEmail';
import { useAppState } from '../context/AppContext';
import { ChartIcon } from '../components/Icons';
import { getMatchedRecommendations } from '../utils/recommendationMatcher';
import { useProductSuggestions } from '../hooks/useProductSuggestions';
import { apiUrl } from '../utils/api';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export function ResultsScreen() {
  const { analysisResult } = useAppState();
  const navigate = useNavigate();

  useEffect(() => { if (!analysisResult) navigate('/instructions'); }, [analysisResult, navigate]);
  if (!analysisResult) return null;

  const { diagnosis, image, expression_lines, combined_diagnosis, images_processed } = analysisResult;
  const showLines = Boolean(expression_lines?.detected);
  const count = diagnosis.condiciones_detectadas.length + (showLines ? 1 : 0);
  const matched = useMemo(
    () => getMatchedRecommendations(
      diagnosis.condiciones_detectadas.map((c) => c.id),
      showLines,
    ),
    [diagnosis.condiciones_detectadas, showLines],
  );
  const {
    products: suggestedProducts,
    loading: productsLoading,
    error: productsError,
    queriesUsed,
    warning: productsWarning,
  } = useProductSuggestions({
    detectedConditions: diagnosis.condiciones_detectadas,
    matchedRecommendations: matched,
    enabled: matched.length > 0 || diagnosis.condiciones_detectadas.length > 0,
  });

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FlowStepper currentStep={5} />

          {/* Hero de resultados */}
          <div className="bg-hero-gradient rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-10" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <ChartIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Resultados del análisis</h1>
                <p className="text-white/80 text-sm mt-1">
                  {count} hallazgo{count !== 1 ? 's' : ''} · Análisis con IA completado
                  {images_processed && images_processed > 1
                    ? ` · ${images_processed} fotografías analizadas`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 mb-8">
            <DisclaimerBanner variant="warning" title="Resultado preliminar — no diagnóstico médico"
              message={diagnosis.disclaimer} />
            {diagnosis.requiere_evaluacion && (
              <MedicalAlertBanner warnings={diagnosis.advertencias_generales} />
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-4">
              <AnalyzedImagePanel
                imageUrl={apiUrl(`/uploads/${image.path}`)}
                severity={diagnosis.severidad_general}
                title={diagnosis.mensaje_severidad.titulo}
                summary={combined_diagnosis?.summary ?? diagnosis.resumen_general}
                advice={diagnosis.mensaje_severidad.consejo}
              />
            </div>

            <motion.div className="lg:col-span-8 space-y-6" variants={stagger} initial="initial" animate="animate">
              <motion.div variants={item} className="surface-card p-6">
                <h2 className="text-xl font-bold text-brand-900 mb-1">Afecciones detectadas</h2>
                <p className="text-sm text-textSecondary mb-5">{count} hallazgo{count !== 1 ? 's' : ''} identificado{count !== 1 ? 's' : ''}</p>

                <div className="space-y-4">
                  {diagnosis.condiciones_detectadas.length > 0
                    ? diagnosis.condiciones_detectadas.map((c, i) => (
                        <SkinConditionCard key={c.id} condition={c} index={i + 1} />
                      ))
                    : (
                      <EmptyState variant="success" title="Sin afecciones significativas"
                        description={diagnosis.mensaje_severidad.mensaje}
                        icon={<svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>} />
                    )}
                  {showLines && expression_lines && (
                    <ExpressionLinesFindingCard expressionLines={expression_lines}
                      cardIndex={diagnosis.condiciones_detectadas.length + 1} />
                  )}
                </div>
              </motion.div>

              {diagnosis.condiciones_detectadas.length > 0 && (
                <motion.div variants={item} className="surface-card p-6">
                  <RecommendationPanel conditions={diagnosis.condiciones_detectadas} />
                </motion.div>
              )}

              {matched.length > 0 && (
                <motion.div variants={item} className="surface-card p-6">
                  <StructuredRecommendationsSection recommendations={matched} />
                </motion.div>
              )}

              {diagnosis.consejos_generales.length > 0 && (
                <motion.div variants={item} className="surface-card p-6">
                  <GeneralTipsGrid tips={diagnosis.consejos_generales} />
                </motion.div>
              )}

              <motion.div variants={item} className="surface-card p-6">
                <ProductSuggestionsSection
                  products={suggestedProducts}
                  loading={productsLoading}
                  error={productsError}
                  queriesUsed={queriesUsed}
                  warning={productsWarning}
                />
              </motion.div>

              <motion.div variants={item}>
                <SendAnalysisEmail analysis={analysisResult} />
              </motion.div>

              <motion.div variants={item}>
                <DisclaimerBanner variant="info" title="Información importante"
                  message={`${diagnosis.mensaje_severidad.mensaje} Generado el ${new Date(analysisResult.timestamp).toLocaleString('es-ES')}.`} />
              </motion.div>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <PrimaryButton label="Nuevo análisis" onClick={() => navigate('/image-picker')} className="flex-1" />
            <PrimaryButton label="Volver al inicio" variant="secondary" onClick={() => navigate('/')} className="flex-1" />
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}
