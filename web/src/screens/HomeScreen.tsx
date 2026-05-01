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
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <ScanIcon className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                DermaCheck
              </h1>
            </div>
            <p className="text-xl text-textSecondary">
              Hola, <span className="font-semibold text-primary">{user?.name}</span>
            </p>
          </div>

          {/* Main CTA Card */}
          <div className="bg-gradient-to-br from-primary via-primary to-primaryDark rounded-3xl p-1 mb-8 shadow-xl">
            <div className="bg-white rounded-[22px] p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-11 h-11 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-text mb-2">
                    Análisis Dermatológico IA
                  </h2>
                  <p className="text-textSecondary">
                    Detecta afecciones cutáneas con tecnología de vanguardia
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-primary" />
                  Afecciones que analizamos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Acné y comedones',
                    'Hiperpigmentación',
                    'Líneas de expresión',
                    'Rosácea',
                    'Dermatitis',
                    'Resequedad cutánea'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-textSecondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <PrimaryButton
                label="Iniciar Análisis"
                onPress={startAnalysis}
                className="w-full text-lg py-4 shadow-lg hover:shadow-xl"
              />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ZapIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text mb-2">Análisis Rápido</h3>
              <p className="text-sm text-textSecondary">Resultados precisos en menos de 10 segundos</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text mb-2">Alta Precisión</h3>
              <p className="text-sm text-textSecondary">Modelo YOLO entrenado con miles de imágenes</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LockIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text mb-2">100% Privado</h3>
              <p className="text-sm text-textSecondary">Tus datos están encriptados y protegidos</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 rounded-2xl p-5 mb-6 border-2 border-amber-200/50">
            <div className="flex gap-4">
              <AlertIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Aviso médico:</strong> Este sistema es una herramienta de orientación cosmética 
                  basada en IA. No constituye diagnóstico médico. Para condiciones persistentes o preocupantes, 
                  consulta con un dermatólogo certificado.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="text-textSecondary hover:text-primary transition-colors font-medium text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
