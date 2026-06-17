import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../components';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { CameraIcon, LightBulbIcon, TargetIcon, CheckCircleIcon } from '../components/Icons';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';
import { CaptureReferenceGuide } from '../components/capture/CaptureReferenceGuide';

const STEPS = [
  { n: 1, icon: CameraIcon, color: 'bg-brand-500', title: 'Posiciónate frente a la cámara',
    desc: 'A 50–70 cm de la pantalla. Rostro visible dentro del óvalo guía.',
    tips: ['Mira directamente a la cámara', 'Expresión neutra', 'Sin accesorios que cubran el rostro'] },
  { n: 2, icon: LightBulbIcon, color: 'bg-amber-500', title: 'Verifica la iluminación',
    desc: 'La app validará la calidad. Óvalo verde = listo para capturar.',
    quality: true },
  { n: 3, icon: TargetIcon, color: 'bg-teal-500', title: 'Captura 1 o 2 imágenes',
    desc: 'Toma al menos una fotografía del rostro. Una segunda foto en otro ángulo es opcional y mejora el análisis combinado.',
    note: 'Recibirás un reporte combinado con recomendaciones orientativas en segundos.' },
];

export function InstructionsScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
          <button type="button" onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-sm text-textSecondary hover:text-brand-600 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>

          <FlowStepper currentStep={2} />
          <SectionHeader badge="Guía de captura" title="Instrucciones de uso"
            description="Sigue estos pasos para obtener el mejor análisis facial" align="center" />

          <CaptureReferenceGuide className="mb-6" />

          <div className="space-y-4 mb-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.n} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className="surface-card p-5 flex gap-4">
                  <div className={`w-11 h-11 rounded-xl ${step.color} text-white font-bold flex items-center justify-center flex-shrink-0 shadow-soft`}>
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-900 flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-brand-500" />{step.title}
                    </h3>
                    <p className="text-sm text-textSecondary mb-2">{step.desc}</p>
                    {step.tips && (
                      <ul className="space-y-1">
                        {step.tips.map((t) => (
                          <li key={t} className="flex items-center gap-2 text-sm text-textSecondary">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />{t}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.quality && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">✓ Óvalo verde = listo</div>
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">✗ Óvalo rojo = ajustar</div>
                      </div>
                    )}
                    {step.note && (
                      <p className="text-xs text-textMuted mt-2 p-2.5 bg-brand-50 rounded-lg border border-brand-100">{step.note}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <DisclaimerBanner variant="warning" title="Importante"
            message="Análisis cosmético orientativo. Tus imágenes son privadas y no se comparten con terceros." />

          <div className="text-center mt-8">
            <PrimaryButton label="Comenzar análisis" onClick={() => navigate('/image-picker')} className="px-12" />
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}
