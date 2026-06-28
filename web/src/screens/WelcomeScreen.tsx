import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/layout/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';
import { useAppState } from '../context/AppContext';
import {
  CameraIcon,
  ChartIcon,
  CheckCircleIcon,
  DocumentIcon,
  GridIcon,
  ScanIcon,
  ShieldIcon,
  SparklesIcon,
  TargetIcon,
  ZapIcon,
} from '../components/Icons';

/* ─── Datos de contenido ─── */

const BUSINESS_BENEFITS = [
  {
    icon: SparklesIcon,
    title: 'Mejora la experiencia del cliente',
    desc: 'Ofrece una atención moderna e interactiva desde el primer contacto en tu local.',
    color: 'from-blue-500 to-brand-500',
  },
  {
    icon: ShieldIcon,
    title: 'Aumenta la confianza antes de comprar',
    desc: 'El cliente recibe orientación visual antes de elegir un producto o tratamiento.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: ChartIcon,
    title: 'Orienta la venta dermocosmética',
    desc: 'Conecta el análisis con productos de tu catálogo para facilitar la recomendación.',
    color: 'from-amber-400 to-amber-500',
  },
  {
    icon: TargetIcon,
    title: 'Te diferencia de la competencia',
    desc: 'Posiciona tu centro como referente en tecnología aplicada al cuidado de la piel.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: ZapIcon,
    title: 'Digitaliza la atención inicial',
    desc: 'Automatiza la orientación preliminar sin reemplazar la valoración profesional.',
    color: 'from-indigo-500 to-accent',
  },
  {
    icon: DocumentIcon,
    title: 'Recomendaciones consistentes',
    desc: 'Entrega criterios uniformes de cuidado basados en hallazgos visibles detectados.',
    color: 'from-brand-500 to-brand-600',
  },
];

const USER_BENEFITS = [
  'Recibe orientación rápida sobre el estado visible de su piel.',
  'Entiende mejor qué tipo de cuidado puede necesitar.',
  'Obtiene recomendaciones generales claras y comprensibles.',
  'Conoce productos relacionados disponibles en la tienda.',
  'Vive una experiencia moderna, guiada y sin fricción.',
];

const TOTEM_FEATURES = [
  { icon: GridIcon, label: 'Tótem o tablet en recepción o sala de ventas' },
  { icon: CameraIcon, label: 'Captura facial guiada paso a paso' },
  { icon: ScanIcon, label: 'Análisis preliminar mediante IA' },
  { icon: ChartIcon, label: 'Resultados visuales simples y comprensibles' },
  { icon: DocumentIcon, label: 'Recomendaciones generales de cuidado' },
  { icon: TargetIcon, label: 'Sugerencias desde tu catálogo asociado' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Fotografía guiada', desc: 'El usuario se toma una foto siguiendo instrucciones claras en pantalla.', icon: CameraIcon },
  { step: 2, title: 'Análisis con IA', desc: 'El sistema evalúa condiciones visibles de la piel de forma preliminar.', icon: ScanIcon },
  { step: 3, title: 'Resultados simples', desc: 'Se muestran hallazgos de forma visual, comprensible y no técnica.', icon: ChartIcon },
  { step: 4, title: 'Recomendaciones', desc: 'Se entregan consejos generales de cuidado adaptados a los hallazgos.', icon: DocumentIcon },
  { step: 5, title: 'Productos sugeridos', desc: 'Se sugieren productos disponibles en el catálogo de tu negocio.', icon: TargetIcon },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45 },
};

/* ─── Sub-componentes internos ─── */

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="landing-section-label inline-block text-teal-600 mb-3 normal-case">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-brand-900 tracking-tight leading-tight">
      {children}
    </h2>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  desc,
  color,
  index,
}: {
  icon: typeof SparklesIcon;
  title: string;
  desc: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="surface-card p-6 surface-card-hover"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-soft`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-brand-900 text-sm sm:text-base mb-2">{title}</h3>
      <p className="text-sm text-textSecondary leading-relaxed">{desc}</p>
    </motion.div>
  );
}

const LANDING_HERO_IMAGE = '/landing-kiosk-hero.png';

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-none lg:mx-0 lg:w-full"
    >
      <div
        className="absolute -inset-6 rounded-[2.5rem] bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative rounded-[1.75rem] overflow-hidden shadow-elevated ring-1 ring-white/25">
        <img
          src={LANDING_HERO_IMAGE}
          alt="Cliente usando el tótem DermaCheck en una farmacia con captura facial guiada en pantalla"
          className="block w-full aspect-[3/4] object-cover object-center"
          width={640}
          height={853}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-900/50 via-brand-900/10 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="absolute -right-1 sm:-right-3 top-6 surface-card px-3 py-2 shadow-elevated text-xs font-semibold text-brand-700 hidden sm:block"
      >
        ✓ Listo en segundos
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="absolute -left-1 sm:-left-3 bottom-20 surface-card px-3 py-2 shadow-elevated text-xs font-semibold text-teal-700 hidden sm:block normal-case"
      >
        Tótem en punto físico
      </motion.div>
    </motion.div>
  );
}

/* ─── Pantalla principal ─── */

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { resetKioskSession } = useAppState();

  const startNewAnalysis = () => {
    resetKioskSession();
    navigate('/consent');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageTransition>
      <AppShell>
        <div className="min-h-screen flex flex-col landing-text">

          {/* ── Nav ── */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <BrandLogo size="sm" />
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo('solucion')}
                  className="hidden sm:inline-flex text-sm font-medium text-textSecondary hover:text-brand-600 transition-colors px-3 py-2"
                >
                  Para negocios
                </button>
                <button
                  type="button"
                  onClick={startNewAnalysis}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-3 py-2 transition-colors"
                >
                  Comenzar
                </button>
                <PrimaryButton
                  label="Probar análisis"
                  onClick={startNewAnalysis}
                  className="!min-h-[40px] !px-4 !text-sm"
                />
              </div>
            </div>
          </header>

          {/* ── Hero ── */}
          <section className="bg-hero-gradient text-white relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-14 items-center">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium normal-case bg-white/15 backdrop-blur px-3 py-1.5 rounded-full mb-6">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Solución tótem · IA · Dermocosmética
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight">
                      Análisis facial inteligente para clínicas, centros estéticos y tiendas de dermocosmética
                    </h1>
                    <p className="mt-5 text-white/85 text-base sm:text-lg leading-relaxed max-w-xl">
                      DermaCheck permite ofrecer una experiencia de análisis de piel mediante IA,
                      entregando orientación visual, recomendaciones generales y sugerencias de
                      productos desde un catálogo asociado.
                    </p>
                    <div className="flex flex-col xs:flex-row gap-3 mt-8">
                      <button
                        type="button"
                        onClick={startNewAnalysis}
                        className="min-h-[52px] px-8 rounded-xl bg-white text-brand-700 font-semibold shadow-elevated hover:bg-brand-50 transition-all text-sm sm:text-base"
                      >
                        Probar análisis
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollTo('solucion')}
                        className="min-h-[52px] px-8 rounded-xl border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-all text-sm sm:text-base"
                      >
                        Conocer solución para negocios
                      </button>
                    </div>
                    <p className="mt-5 text-sm text-white/60 max-w-md normal-case">
                      Orientación preliminar con IA · No constituye diagnóstico médico
                    </p>
                  </motion.div>
                </div>
                <HeroVisual />
              </div>
            </div>
          </section>

          {/* ── Problema ── */}
          <section className="px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
                <SectionLabel>El desafío</SectionLabel>
                <SectionTitle>
                  Muchas personas eligen productos para la piel sin orientación clara
                </SectionTitle>
                <p className="mt-4 text-textSecondary text-base sm:text-lg leading-relaxed">
                  Esto genera mala elección de productos, baja confianza en la compra y menor
                  conversión en tienda. Los centros que no ofrecen una experiencia guiada pierden
                  oportunidades de venta y diferenciación frente a la competencia.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── Solución tótem ── */}
          <section id="solucion" className="px-4 sm:px-6 py-16 sm:py-20 bg-white/60">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <motion.div {...fadeUp}>
                  <SectionLabel>La solución</SectionLabel>
                  <SectionTitle>
                    DermaCheck como tótem de análisis facial en punto físico
                  </SectionTitle>
                  <p className="mt-4 text-textSecondary leading-relaxed">
                    Instala DermaCheck en recepción, sala de ventas o mostrador. Tus clientes
                    obtienen una experiencia moderna de análisis de piel mientras tú conectas
                    el resultado con productos y servicios de tu negocio.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {TOTEM_FEATURES.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-brand-600" />
                        </span>
                        <span className="text-sm text-textSecondary leading-relaxed pt-1">{label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                  <div className="surface-card p-6 sm:p-8 border border-teal-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
                        <GridIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-900">Ideal para</p>
                        <p className="text-sm text-textSecondary">Punto de atención físico</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['Clínicas estéticas', 'Centros dermatológicos', 'Farmacias', 'Tiendas dermocosmética', 'Spas', 'Centros de belleza'].map((seg) => (
                        <div
                          key={seg}
                          className="text-sm font-medium text-brand-800 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5 text-center normal-case"
                        >
                          {seg}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Beneficios negocio ── */}
          <section className="px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <motion.div {...fadeUp} className="text-center mb-10 sm:mb-12">
                <SectionLabel>Para tu negocio</SectionLabel>
                <SectionTitle>Beneficios que impulsan ventas y experiencia</SectionTitle>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {BUSINESS_BENEFITS.map((b, i) => (
                  <BenefitCard key={b.title} {...b} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ── Beneficios usuario final ── */}
          <section className="px-4 sm:px-6 py-16 sm:py-20 bg-brand-50/50">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <motion.div {...fadeUp}>
                  <SectionLabel>Para tus clientes</SectionLabel>
                  <SectionTitle>Una experiencia clara y moderna</SectionTitle>
                  <p className="mt-4 text-textSecondary leading-relaxed">
                    El usuario final recibe orientación rápida y comprensible, sin necesidad de
                    conocimientos técnicos. La experiencia es guiada, visual y pensada para
                    generar confianza antes de la compra.
                  </p>
                </motion.div>
                <motion.ul {...fadeUp} className="space-y-3">
                  {USER_BENEFITS.map((item) => (
                    <li key={item} className="flex items-start gap-3 surface-card px-4 py-3.5">
                      <CheckCircleIcon className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-textSecondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </motion.ul>
              </div>
            </div>
          </section>

          {/* ── Catálogo conectado ── */}
          <section className="px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <motion.div
                {...fadeUp}
                className="ai-card p-8 sm:p-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
                <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <SectionLabel>Integración comercial</SectionLabel>
                    <SectionTitle>Recomendaciones conectadas a tu catálogo</SectionTitle>
                    <p className="mt-4 text-textSecondary leading-relaxed">
                      Las recomendaciones pueden vincularse a un catálogo definido por el negocio,
                      permitiendo sugerir productos disponibles en una sola tienda o proveedor
                      asociado. Esto facilita una experiencia más coherente para el usuario y una
                      oportunidad comercial directa para el centro.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      'Catálogo de una farmacia o tienda específica',
                      'Productos de un proveedor dermocosmético asociado',
                      'Sin recomendaciones genéricas fuera de tu inventario',
                      'Conexión directa entre análisis y venta',
                    ].map((point) => (
                      <div key={point} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 border border-teal-100">
                        <TargetIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-brand-800 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── Cómo funciona ── */}
          <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white/60">
            <div className="max-w-6xl mx-auto">
              <motion.div {...fadeUp} className="text-center mb-10 sm:mb-14">
                <SectionLabel>Proceso</SectionLabel>
                <SectionTitle>¿Cómo funciona?</SectionTitle>
                <p className="mt-3 text-textSecondary max-w-xl mx-auto">
                  Cinco pasos simples desde la captura hasta la sugerencia de productos.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                  <motion.div
                    key={step}
                    {...fadeUp}
                    transition={{ delay: i * 0.08 }}
                    className="surface-card p-5 text-center relative"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-hero-gradient text-white text-sm font-bold flex items-center justify-center mb-4 shadow-soft">
                      {step}
                    </div>
                    <div className="w-9 h-9 mx-auto rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <h3 className="font-bold text-brand-900 text-sm mb-1.5">{title}</h3>
                    <p className="text-sm text-textSecondary leading-relaxed normal-case">{desc}</p>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <span className="hidden lg:block absolute top-1/2 -right-2 w-4 text-brand-200 text-lg" aria-hidden="true">→</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Confianza / advertencia ── */}
          <section className="px-4 sm:px-6 py-12 sm:py-16">
            <div className="max-w-3xl mx-auto">
              <DisclaimerBanner
                variant="warning"
                title="Información importante"
                message="DermaCheck no reemplaza una consulta médica dermatológica. Sus resultados son informativos y orientativos. Ante lesiones sospechosas, molestias persistentes o síntomas severos, se recomienda consultar con un profesional de salud."
              />
            </div>
          </section>

          {/* ── CTA final ── */}
          <section id="demo" className="px-4 sm:px-6 py-16 sm:py-20">
            <motion.div
              {...fadeUp}
              className="max-w-4xl mx-auto bg-hero-gradient rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 dot-pattern opacity-20" aria-hidden="true" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Convierte tu punto de atención en una experiencia inteligente de análisis facial
                </h2>
                <p className="mt-4 text-white/80 max-w-xl mx-auto text-sm sm:text-base">
                  Implementa DermaCheck en tu clínica, farmacia o tienda y ofrece a tus clientes
                  una experiencia moderna que conecta análisis, orientación y productos.
                </p>
                <div className="flex flex-col xs:flex-row gap-3 justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => window.location.href = 'mailto:contacto@dermacheck.cl?subject=Solicitud%20de%20demo%20DermaCheck'}
                    className="min-h-[52px] px-8 rounded-xl bg-white text-brand-700 font-semibold shadow-elevated hover:bg-brand-50 transition-all text-sm sm:text-base"
                  >
                    Solicitar demo
                  </button>
                  <button
                    type="button"
                    onClick={startNewAnalysis}
                    className="min-h-[52px] px-8 rounded-xl border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-all text-sm sm:text-base"
                  >
                    Probar DermaCheck
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ── Footer ── */}
          <footer className="px-4 sm:px-6 py-8 border-t border-slate-100">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <BrandLogo size="sm" />
              <p className="text-xs text-textMuted max-w-sm normal-case">
                DermaCheck · Orientación preliminar con IA para el cuidado de la piel.
                No constituye diagnóstico médico.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-textSecondary hover:text-brand-600 transition-colors"
              >
                Acceso staff
              </button>
            </div>
          </footer>

        </div>
      </AppShell>
    </PageTransition>
  );
}
