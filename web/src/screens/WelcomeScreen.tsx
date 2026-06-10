import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/layout/BrandLogo';
import { SparklesIcon, ShieldIcon, DocumentIcon, ZapIcon } from '../components/Icons';

const FEATURES = [
  { icon: SparklesIcon, title: 'Detección con IA', desc: 'Modelo YOLO especializado en afecciones cutáneas faciales', color: 'from-blue-500 to-brand-500' },
  { icon: DocumentIcon, title: 'Recomendaciones', desc: 'Rutinas, ingredientes y consejos de cuidado personalizados', color: 'from-teal-500 to-teal-600' },
  { icon: ZapIcon, title: 'Resultados rápidos', desc: 'Análisis completo en menos de 10 segundos', color: 'from-amber-400 to-amber-500' },
  { icon: ShieldIcon, title: 'Privacidad total', desc: 'Tus imágenes y datos bajo tu control', color: 'from-emerald-500 to-emerald-600' },
];

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <AppShell>
        <div className="min-h-screen flex flex-col">
          {/* Hero superior */}
          <div className="bg-hero-gradient text-white px-6 py-12 sm:py-16 relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
            <div className="max-w-6xl mx-auto relative">
              <BrandLogo size="lg" subtitle="Análisis facial inteligente para el cuidado de tu piel" light />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-white/85 text-base sm:text-lg max-w-xl leading-relaxed"
              >
                Toma una foto de tu rostro y obtén un análisis preliminar con IA que identifica
                acné, manchas, líneas de expresión, rosácea y más.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mt-8"
              >
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="min-h-[52px] px-8 rounded-xl bg-white text-brand-700 font-semibold shadow-elevated hover:bg-brand-50 transition-all"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="min-h-[52px] px-8 rounded-xl border-2 border-white/60 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Crear cuenta gratis
                </button>
              </motion.div>
            </div>
          </div>

          {/* Features grid */}
          <div className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
            <h2 className="text-xl font-bold text-brand-900 text-center mb-8">
              ¿Por qué DermaCheck?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="surface-card p-5 surface-card-hover text-center"
                  >
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-soft`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-brand-900 text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-textSecondary leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10 surface-card p-5 border-l-4 border-l-amber-400 bg-amber-50/50">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Aviso médico:</strong> DermaCheck es orientación cosmética con IA.
                No sustituye el diagnóstico de un dermatólogo certificado.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}
