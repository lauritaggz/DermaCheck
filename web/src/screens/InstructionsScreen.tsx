import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { CameraIcon, LightBulbIcon, TargetIcon, CheckCircleIcon } from '../components/Icons';

export function InstructionsScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenContainer maxWidth="xl" className="bg-gradient-to-br from-surface via-white to-secondary/20">
        <div className="flex flex-col items-center justify-center min-h-screen py-6 px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/home')}
            className="absolute top-4 left-4 z-30 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg border border-gray-200 hover:border-primary/30 transition-all group"
            title="Volver al inicio"
          >
            <svg className="w-5 h-5 text-textSecondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primaryDark rounded-xl mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                Instrucciones de Uso
              </h1>
              <p className="text-base text-textSecondary max-w-2xl mx-auto">
                Sigue estos pasos para obtener el mejor análisis facial
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                      <CameraIcon className="w-5 h-5 text-primary" />
                      Posiciónate frente a la cámara
                    </h3>
                    <p className="text-sm text-textSecondary leading-relaxed mb-3">
                      Colócate a una distancia de aproximadamente 50-70 cm de la pantalla. 
                      Asegúrate de que tu rostro esté completamente visible dentro del óvalo guía.
                    </p>
                    <ul className="space-y-1.5 text-sm text-textSecondary">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Mira directamente a la cámara</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Mantén una expresión neutra</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>No uses lentes oscuros ni accesorios que cubran el rostro</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5 text-amber-500" />
                      Verifica la iluminación
                    </h3>
                    <p className="text-sm text-textSecondary leading-relaxed mb-3">
                      La aplicación verificará automáticamente la calidad de la imagen. 
                      Cuando el óvalo se ponga verde, significa que la iluminación y nitidez son óptimas.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-1 text-xs">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Calidad buena</span>
                        </div>
                        <p className="text-xs text-green-600">Óvalo verde - Listo para capturar</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700 font-semibold mb-1 text-xs">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Ajustar calidad</span>
                        </div>
                        <p className="text-xs text-red-600">Óvalo rojo - Sigue las indicaciones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                      <TargetIcon className="w-5 h-5 text-primary" />
                      Captura la imagen
                    </h3>
                    <p className="text-sm text-textSecondary leading-relaxed mb-3">
                      Cuando el sistema indique que la calidad es buena, el botón de captura se pondrá verde. 
                      Presiona el botón para tomar la fotografía y continuar con el análisis.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-900">
                        <strong className="font-semibold">Nota:</strong> El análisis tomará unos segundos. 
                        Recibirás un reporte detallado con recomendaciones personalizadas para el cuidado de tu piel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/50 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-2">Importante</h3>
                  <ul className="space-y-1.5 text-xs text-amber-800">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>Este es un análisis cosmético, no un diagnóstico médico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>Para condiciones persistentes, consulta con un dermatólogo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>Tus imágenes son privadas y no se comparten con terceros</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <PrimaryButton
                label="Comenzar Análisis"
                onPress={() => navigate('/image-picker')}
                className="text-base py-3.5 px-10 shadow-lg hover:shadow-xl"
              />
              <p className="text-xs text-textMuted mt-3">
                Al continuar, aceptas nuestros términos de uso y política de privacidad
              </p>
            </div>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
