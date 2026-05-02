import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { ScanIcon, SparklesIcon, ShieldIcon, DocumentIcon } from '../components/Icons';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenContainer maxWidth="full" className="bg-gradient-to-br from-surface via-white to-secondary/30">
        <div className="flex items-center justify-center min-h-screen py-4 sm:py-6 lg:py-8">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              
              {/* Left Column - Hero & Description */}
              <div className="text-center lg:text-left space-y-6">
                {/* Logo & Title */}
                <div className="inline-flex flex-col lg:flex-row items-center gap-3">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl flex items-center justify-center shadow-xl">
                    <ScanIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primaryDark bg-clip-text text-transparent">
                      DermaCheck
                    </h1>
                    <p className="text-base sm:text-lg text-textSecondary mt-1">
                      Análisis dermatológico inteligente
                    </p>
                  </div>
                </div>

                {/* What is DermaCheck */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-primary/10">
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text text-base mb-2">¿Qué es DermaCheck?</h3>
                      <p className="text-textSecondary text-sm leading-relaxed">
                        <strong className="text-text">DermaCheck</strong> es tu asistente inteligente de cuidado facial. 
                        Toma una foto de tu rostro y en segundos obtendrás un análisis con IA que identifica 
                        afecciones como acné, manchas, arrugas o resequedad.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <PrimaryButton
                    label="Iniciar Sesión"
                    onPress={() => navigate('/login')}
                    className="text-base py-3 px-6 shadow-lg hover:shadow-xl"
                  />
                  
                  <PrimaryButton
                    label="Crear Cuenta"
                    variant="secondary"
                    onPress={() => navigate('/register')}
                    className="text-base py-3 px-6"
                  />
                </div>
              </div>

              {/* Right Column - Features */}
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-primary via-primary to-primaryDark rounded-2xl p-1 shadow-xl">
                  <div className="bg-white rounded-[18px] p-5">
                    <h2 className="text-xl lg:text-2xl font-bold text-text mb-4 text-center">
                      Análisis Facial con IA
                    </h2>
                    
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-sm mb-1">Detección Precisa</h3>
                          <p className="text-xs text-textSecondary leading-relaxed">
                            Modelo YOLO entrenado para identificar múltiples afecciones cutáneas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-primary/5 to-white rounded-xl border border-primary/10">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primaryDark rounded-xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <DocumentIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-sm mb-1">Recomendaciones</h3>
                          <p className="text-xs text-textSecondary leading-relaxed">
                            Orientación sobre cuidados, ingredientes y productos cosméticos
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <ShieldIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-sm mb-1">Privacidad Total</h3>
                          <p className="text-xs text-textSecondary leading-relaxed">
                            Tus datos están protegidos y bajo tu control en todo momento
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50">
                  <p className="text-xs text-amber-900 text-center leading-relaxed">
                    DermaCheck es una herramienta de orientación cosmética basada en IA, 
                    no constituye diagnóstico médico profesional. Para condiciones persistentes, 
                    consulta con un dermatólogo certificado.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
