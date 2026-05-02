import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { ScanIcon, SparklesIcon, ShieldIcon, DocumentIcon } from '../components/Icons';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenContainer maxWidth="full" className="bg-gradient-to-br from-surface via-white to-secondary/30">
        <div className="flex items-center justify-center min-h-screen py-6 sm:py-8 lg:py-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Column - Hero & Description */}
              <div className="text-center lg:text-left space-y-8">
                {/* Logo & Title */}
                <div className="inline-flex flex-col lg:flex-row items-center gap-4 lg:gap-5">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-primaryDark rounded-3xl flex items-center justify-center shadow-2xl">
                    <ScanIcon className="w-11 h-11 lg:w-14 lg:h-14 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primaryDark bg-clip-text text-transparent">
                      DermaCheck
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-textSecondary mt-2">
                      Análisis dermatológico inteligente
                    </p>
                  </div>
                </div>

                {/* What is DermaCheck */}
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-primary/10">
                  <div className="flex items-start gap-4 text-left">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text text-xl lg:text-2xl mb-3">¿Qué es DermaCheck?</h3>
                      <p className="text-textSecondary text-base lg:text-lg leading-relaxed">
                        <strong className="text-text">DermaCheck</strong> es tu asistente inteligente de cuidado facial. 
                        Toma una foto de tu rostro y en segundos obtendrás un análisis con inteligencia artificial que identifica 
                        afecciones como acné, manchas, arrugas o resequedad.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <PrimaryButton
                    label="Iniciar Sesión"
                    onPress={() => navigate('/login')}
                    className="text-lg lg:text-xl py-4 px-8 shadow-xl hover:shadow-2xl"
                  />
                  
                  <PrimaryButton
                    label="Crear Cuenta"
                    variant="secondary"
                    onPress={() => navigate('/register')}
                    className="text-lg lg:text-xl py-4 px-8"
                  />
                </div>
              </div>

              {/* Right Column - Features */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary via-primary to-primaryDark rounded-3xl p-1 shadow-2xl">
                  <div className="bg-white rounded-[22px] p-6 lg:p-8">
                    <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-text mb-6 text-center">
                      Análisis Facial con IA
                    </h2>
                    
                    <div className="grid gap-6">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <SparklesIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-lg lg:text-xl mb-2">Detección Precisa</h3>
                          <p className="text-sm lg:text-base text-textSecondary leading-relaxed">
                            Modelo YOLO entrenado para identificar múltiples afecciones cutáneas con alta precisión
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-primary/5 to-white rounded-2xl border border-primary/10">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <DocumentIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-lg lg:text-xl mb-2">Recomendaciones</h3>
                          <p className="text-sm lg:text-base text-textSecondary leading-relaxed">
                            Orientación sobre cuidados, ingredientes y productos cosméticos personalizados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl 
                                      flex items-center justify-center flex-shrink-0 shadow-lg">
                          <ShieldIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-lg lg:text-xl mb-2">Privacidad Total</h3>
                          <p className="text-sm lg:text-base text-textSecondary leading-relaxed">
                            Tus datos están protegidos y bajo tu control absoluto en todo momento
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 rounded-2xl p-5 lg:p-6 border-2 border-amber-200/50">
                  <p className="text-xs lg:text-sm text-amber-900 text-center leading-relaxed">
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
