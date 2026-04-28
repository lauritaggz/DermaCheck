import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { CameraIcon, ImageIcon, LightBulbIcon, TargetIcon, GridIcon } from '../components/Icons';

export function ImagePickerScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setPendingImage } = useAppState();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setPendingImage({
          uri: url,
          width: img.width,
          height: img.height,
          source: 'gallery',
        });
        navigate('/preview');
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function openCamera() {
    navigate('/camera');
  }

  function openGallery() {
    fileInputRef.current?.click();
  }

  return (
    <PageTransition>
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary mb-3">
              Captura de Imagen
            </h1>
            <p className="text-lg text-textSecondary">
              Selecciona el método de captura para tu análisis facial
            </p>
          </div>

          {/* Recommendations Card */}
          <div className="bg-gradient-to-br from-blue-50 to-primary/5 rounded-3xl p-8 mb-8 border-2 border-primary/10">
            <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-primary" />
              </div>
              Recomendaciones para mejores resultados
            </h2>
            
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-primary/10">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                  <LightBulbIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text mb-2">Iluminación</h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Luz natural uniforme. Evita sombras o contraluz directo.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-primary/10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <TargetIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text mb-2">Encuadre</h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Rostro completo centrado, mirando de frente a la cámara.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-primary/10">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center mb-4">
                  <GridIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text mb-2">Calidad</h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Imagen enfocada con buena resolución y nitidez.
                </p>
              </div>
            </div>
          </div>

          {/* Capture Method Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={openCamera}
              className="group relative bg-gradient-to-br from-primary via-primary to-primaryDark rounded-3xl p-1 
                       transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="bg-white rounded-[22px] p-8 h-full flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl 
                              flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CameraIcon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Cámara Web
                </h3>
                <p className="text-textSecondary mb-4">
                  Captura en tiempo real con guía de centrado
                </p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <span>Recomendado</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onClick={openGallery}
              className="group relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-1 
                       border-2 border-gray-200 hover:border-primary/30
                       transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="bg-white rounded-[22px] p-8 h-full flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl 
                              flex items-center justify-center mb-5 group-hover:scale-110 transition-transform
                              group-hover:from-primary/10 group-hover:to-blue-50">
                  <ImageIcon className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">
                  Galería
                </h3>
                <p className="text-textSecondary mb-4">
                  Selecciona una fotografía existente de tu dispositivo
                </p>
                <div className="flex items-center gap-2 text-sm text-textMuted font-medium group-hover:text-primary transition-colors">
                  <span>Cargar imagen</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center gap-2 text-textSecondary hover:text-primary transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
