import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { ScanIcon, SparklesIcon, ShieldIcon, DocumentIcon } from '../components/Icons';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl flex items-center justify-center shadow-xl">
                <ScanIcon className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primaryDark bg-clip-text text-transparent">
                DermaCheck
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-textSecondary max-w-2xl mx-auto mb-8">
              Análisis dermatológico inteligente con tecnología de vanguardia
            </p>

            {/* What is DermaCheck */}
            <div className="bg-gradient-to-br from-blue-50 to-primary/5 rounded-2xl p-6 max-w-3xl mx-auto border border-primary/10">
              <div className="flex items-start gap-4 text-left">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-text text-lg mb-2">¿Qué es DermaCheck?</h3>
                  <p className="text-textSecondary leading-relaxed">
                    <strong className="text-text">DermaCheck</strong> es tu asistente inteligente de cuidado facial. 
                    Toma una foto de tu rostro y en segundos obtendrás un análisis con inteligencia artificial que identifica 
                    afecciones como acné, manchas, arrugas o resequedad. Además, recibirás recomendaciones personalizadas 
                    de productos y rutinas para mejorar tu piel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feature Card */}
          <div className="bg-gradient-to-br from-primary via-primary to-primaryDark rounded-3xl p-1 mb-10 shadow-2xl">
            <div className="bg-white rounded-[22px] p-8 md:p-10">
              <h2 className="text-3xl font-bold text-text mb-6 text-center">
                Análisis Facial con Inteligencia Artificial
              </h2>
              
              <p className="text-lg text-textSecondary mb-8 text-center max-w-2xl mx-auto">
                Detecta afecciones cutáneas, recibe recomendaciones personalizadas 
                y cuida tu piel de manera profesional.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl 
                                flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-text mb-2">Detección Precisa</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Modelo YOLO entrenado para identificar múltiples afecciones cutáneas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl 
                                flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DocumentIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-text mb-2">Recomendaciones</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Orientación sobre cuidados, ingredientes y productos cosméticos
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl 
                                flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShieldIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-text mb-2">Privacidad Total</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Tus datos están protegidos y bajo tu control absoluto
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            <PrimaryButton
              label="Iniciar Sesión"
              onPress={() => navigate('/login')}
              className="text-lg py-4 shadow-lg hover:shadow-xl"
            />
            
            <PrimaryButton
              label="Crear Cuenta"
              variant="secondary"
              onPress={() => navigate('/register')}
              className="text-lg py-4"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200/50 max-w-2xl mx-auto">
            <p className="text-xs text-amber-900 text-center leading-relaxed">
              DermaCheck es una herramienta de orientación cosmética basada en IA, 
              no constituye diagnóstico médico profesional. Para condiciones persistentes, 
              consulta con un dermatólogo certificado.
            </p>
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
