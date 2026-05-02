import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { ScanIcon, ZapIcon, TargetIcon, LockIcon, AlertIcon, CheckCircleIcon } from '../components/Icons';

export function HomeScreen() {
  const { user, setUser, consent } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !consent.accepted) {
      navigate('/consent');
    }
  }, [user, consent.accepted, navigate]);

  function handleLogout() {
    setUser(null);
    navigate('/');
  }

  function startAnalysis() {
    navigate('/instructions');
  }

  return (
    <PageTransition>
      <ScreenContainer maxWidth="full" className="bg-gradient-to-br from-surface via-white to-secondary/20">
        <div className="flex items-center justify-center min-h-screen py-4 sm:py-6">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="text-center lg:text-left mb-6">
              <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3">
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ScanIcon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      DermaCheck
                    </h1>
                    <p className="text-sm sm:text-base text-textSecondary">
                      Hola, <span className="font-semibold text-primary">{user?.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-textSecondary hover:text-primary transition-colors font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary/5"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              
              {/* Main CTA Card - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-primary via-primary to-primaryDark rounded-2xl p-1 shadow-xl h-full">
                  <div className="bg-white rounded-[18px] p-5 sm:p-6 h-full flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text mb-1">
                          Análisis Dermatológico IA
                        </h2>
                        <p className="text-sm sm:text-base text-textSecondary">
                          Detecta afecciones cutáneas con tecnología de vanguardia
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl p-4 mb-5 flex-1">
                      <h3 className="font-semibold text-text text-base mb-3 flex items-center gap-2">
                        <TargetIcon className="w-4 h-4 text-primary" />
                        Afecciones que analizamos
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                          'Acné y comedones',
                          'Hiperpigmentación',
                          'Líneas de expresión',
                          'Rosácea',
                          'Dermatitis',
                          'Resequedad cutánea'
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs lg:text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-textSecondary">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <PrimaryButton
                      label="Iniciar Análisis"
                      onPress={startAnalysis}
                      className="w-full text-base py-3 shadow-lg hover:shadow-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Side Cards - Stacked on large screens */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl p-4 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ZapIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-text text-base mb-1">Análisis Rápido</h3>
                  <p className="text-xs lg:text-sm text-textSecondary">Resultados en menos de 10 segundos</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primaryDark rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TargetIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-text text-base mb-1">Alta Precisión</h3>
                  <p className="text-xs lg:text-sm text-textSecondary">Modelo YOLO entrenado con miles de imágenes</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <LockIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-text text-base mb-1">100% Privado</h3>
                  <p className="text-xs lg:text-sm text-textSecondary">Tus datos están encriptados y protegidos</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 rounded-xl p-4 mt-6 border border-amber-200/50 max-w-4xl mx-auto">
              <div className="flex gap-3">
                <AlertIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs lg:text-sm text-amber-900 leading-relaxed">
                    <strong className="font-semibold">Aviso médico:</strong> Este sistema es una herramienta de orientación cosmética 
                    basada en IA. No constituye diagnóstico médico. Para condiciones persistentes, 
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
