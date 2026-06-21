import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../components';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/layout/BrandLogo';
import { SectionHeader } from '../components/layout/SectionHeader';
import { useAppState } from '../context/AppContext';
import { ZapIcon, TargetIcon, LockIcon, CheckCircleIcon } from '../components/Icons';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';

const CONDITIONS = ['Acné', 'Hiperpigmentación', 'Líneas de expresión', 'Rosácea', 'Dermatitis', 'Resequedad'];

export function HomeScreen() {
  const { consent } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!consent.accepted) navigate('/consent');
  }, [consent.accepted, navigate]);

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <BrandLogo size="md" subtitle="Análisis facial en tótem" />
            <button type="button" onClick={() => navigate('/')}
              className="text-sm text-textSecondary hover:text-brand-600 font-medium px-4 py-2 rounded-lg hover:bg-white transition-colors">
              Volver
            </button>
          </header>

          <div className="grid lg:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="ai-card p-6 sm:p-8 h-full flex flex-col">
                <SectionHeader
                  badge="Análisis con IA"
                  title="Análisis dermatológico facial"
                  description="Detecta afecciones cutáneas con tecnología YOLO de vanguardia"
                  icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
                />

                <div className="flex-1 surface-card p-5 mb-6">
                  <p className="text-xs font-semibold text-textMuted normal-case mb-3">Afecciones que analizamos</p>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <span key={c} className="px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-medium text-brand-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <PrimaryButton label="Iniciar análisis" onClick={() => navigate('/instructions')} className="w-full" />
              </div>
            </motion.div>

            <div className="lg:col-span-2 space-y-4">
              {[
                { icon: ZapIcon, title: 'Análisis rápido', desc: '< 10 segundos', color: 'bg-amber-100 text-amber-600' },
                { icon: TargetIcon, title: 'Alta precisión', desc: 'Miles de imágenes de entrenamiento', color: 'bg-brand-100 text-brand-600' },
                { icon: LockIcon, title: '100% privado', desc: 'Sin registro de cliente', color: 'bg-emerald-100 text-emerald-600' },
              ].map(({ icon: Icon, title, desc, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="surface-card p-5 flex items-center gap-4 surface-card-hover"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-900 text-sm">{title}</h3>
                    <p className="text-xs text-textSecondary">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <DisclaimerBanner variant="warning" title="Aviso médico"
              message="Herramienta de orientación cosmética. No constituye diagnóstico médico profesional." />
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}
