import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { CaptureMethodCard } from '../components/capture/CaptureMethodCard';
import { PhotoTipChip } from '../components/capture/PhotoTipChip';
import { SelectedCapturePreviews } from '../components/capture/SelectedCapturePreviews';
import { useAppState, MAX_FACE_CAPTURES } from '../context/AppContext';
import { getCapturePickerPoseTip } from '../constants/captureAssets';
import { CameraIcon, ImageIcon, LightBulbIcon, TargetIcon, GridIcon, ShieldIcon } from '../components/Icons';

export function ImagePickerScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pendingImages, addPendingImage, resetKioskSession } = useAppState();
  const imageCount = pendingImages.length;
  const canAddMore = imageCount < MAX_FACE_CAPTURES;

  const tips = useMemo(() => {
    const poseTip = getCapturePickerPoseTip(imageCount);
    return [
      { icon: <LightBulbIcon className="w-5 h-5 text-amber-500" />, title: 'Buena iluminación', description: 'Luz natural uniforme, sin sombras fuertes.' },
      { icon: <TargetIcon className="w-5 h-5 text-brand-500" />, title: poseTip.title, description: poseTip.description },
      { icon: <ShieldIcon className="w-5 h-5 text-teal-600" />, title: 'Sin obstrucciones', description: 'Sin objetos ni accesorios tapando la cara.' },
      { icon: <GridIcon className="w-5 h-5 text-brand-500" />, title: 'Imagen nítida', description: 'Fotografía enfocada con buena resolución.' },
    ];
  }, [imageCount]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!canAddMore) {
      alert(`Ya tienes ${MAX_FACE_CAPTURES} imágenes. Continúa a la vista previa.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      addPendingImage({
        blob: file,
        objectUrl,
        width: img.width,
        height: img.height,
        source: 'gallery',
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert('No se pudo procesar la imagen');
    };
    img.src = objectUrl;
  }

  const continueLabel = imageCount >= 2
    ? 'Continuar a vista previa'
    : 'Continuar con 1 foto';

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col pb-32">
          <FlowStepper currentStep={3} />
          <SectionHeader
            badge="Análisis facial con IA"
            title="Captura tu imagen"
            description="1 foto de frente centrada, o 2 laterales del rostro"
            align="center"
          />

          {imageCount > 0 && (
            <SelectedCapturePreviews images={pendingImages} className="mb-5" />
          )}

          <div className="surface-card p-5 mb-6">
            <p className="text-sm font-semibold text-brand-900 mb-4 text-center">Consejos para una mejor foto</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {tips.map((t) => <PhotoTipChip key={t.title} {...t} />)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <CaptureMethodCard
              variant="primary"
              icon={<CameraIcon className="w-8 h-8 text-white" />}
              title="Cámara web"
              description="Captura en tiempo real con indicaciones según cada foto"
              badge="Recomendado"
              onClick={() => navigate('/quality-scan')}
            />
            <CaptureMethodCard
              icon={<ImageIcon className="w-8 h-8 text-brand-500" />}
              title="Galería"
              description="Selecciona una o dos fotografías de tu dispositivo"
              badge="Cargar imagen"
              onClick={() => {
                if (!canAddMore) {
                  alert(`Ya tienes ${MAX_FACE_CAPTURES} imágenes. Continúa a la vista previa.`);
                  return;
                }
                fileInputRef.current?.click();
              }}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Seleccionar imagen"
          />

          <div className="text-center mt-auto">
            <button
              type="button"
              onClick={() => { resetKioskSession(); navigate('/'); }}
              className="text-sm text-textSecondary hover:text-brand-600 font-medium transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>

          {imageCount > 0 && (
            <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-6 pt-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent border-t border-brand-100/80">
              <div className="max-w-4xl mx-auto space-y-2">
                <p className="text-center text-xs text-textSecondary">
                  {canAddMore
                    ? imageCount === 0
                      ? 'Puedes continuar con 1 foto de frente o agregar 2 laterales.'
                      : 'Agrega el otro lateral o continúa con la foto que tienes.'
                    : 'Máximo de fotos alcanzado.'}
                </p>
                <PrimaryButton
                  label={continueLabel}
                  onClick={() => navigate('/preview')}
                  className="w-full !min-h-[56px] !text-base sm:!text-lg shadow-glow"
                />
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </PageTransition>
  );
}
