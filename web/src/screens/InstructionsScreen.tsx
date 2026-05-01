import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { CameraIcon, LightBulbIcon, TargetIcon, CheckCircleIcon } from '../components/Icons';

export function InstructionsScreen() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenContainer>
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primaryDark rounded-3xl mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Instrucciones de Uso
              </h1>
              <p className="text-xl text-textSecondary max-w-2xl mx-auto">
                Sigue estos pasos para obtener el mejor análisis facial
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6 mb-10">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-text mb-3 flex items-center gap-3">
                      <CameraIcon className="w-7 h-7 text-primary" />
                      Posiciónate frente a la cámara
                    </h3>
                    <p className="text-lg text-textSecondary leading-relaxed mb-4">
                      Colócate a una distancia de aproximadamente 50-70 cm de la pantalla. 
                      Asegúrate de que tu rostro esté completamente visible dentro del óvalo guía.
                    </p>
                    <ul className="space-y-2 text-textSecondary">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Mira directamente a la cámara</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Mantén una expresión neutra</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>No uses lentes oscuros ni accesorios que cubran el rostro</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-text mb-3 flex items-center gap-3">
                      <LightBulbIcon className="w-7 h-7 text-amber-500" />
                      Verifica la iluminación
                    </h3>
                    <p className="text-lg text-textSecondary leading-relaxed mb-4">
                      La aplicación verificará automáticamente la calidad de la imagen. 
                      Cuando el óvalo se ponga verde, significa que la iluminación y nitidez son óptimas.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Calidad buena</span>
                        </div>
                        <p className="text-sm text-green-600">Óvalo verde - Listo para capturar</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Ajustar calidad</span>
                        </div>
                        <p className="text-sm text-red-600">Óvalo rojo - Sigue las indicaciones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-text mb-3 flex items-center gap-3">
                      <TargetIcon className="w-7 h-7 text-primary" />
                      Captura la imagen
                    </h3>
                    <p className="text-lg text-textSecondary leading-relaxed mb-4">
                      Cuando el sistema indique que la calidad es buena, el botón de captura se pondrá verde. 
                      Presiona el botón para tomar la fotografía y continuar con el análisis.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-900">
                        <strong className="font-semibold">Nota:</strong> El análisis tomará unos segundos. 
                        Recibirás un reporte detallado con recomendaciones personalizadas para el cuidado de tu piel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 md:p-8 border-2 border-amber-200/50 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">Importante</h3>
                  <ul className="space-y-2 text-amber-800">
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
                className="text-xl py-5 px-12 shadow-2xl hover:shadow-3xl"
              />
              <p className="text-sm text-textMuted mt-4">
                Al continuar, aceptas nuestros términos de uso y política de privacidad
              </p>
            </div>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
