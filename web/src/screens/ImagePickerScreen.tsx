import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { FlowStepper } from '../components/layout/FlowStepper';
import { SectionHeader } from '../components/layout/SectionHeader';
import { CaptureMethodCard } from '../components/capture/CaptureMethodCard';
import { PhotoTipChip } from '../components/capture/PhotoTipChip';
import { useAppState } from '../context/AppContext';
import { CameraIcon, ImageIcon, LightBulbIcon, TargetIcon, GridIcon, ShieldIcon } from '../components/Icons';

const TIPS = [
  { icon: <LightBulbIcon className="w-5 h-5 text-amber-500" />, title: 'Buena iluminación', description: 'Luz natural uniforme, sin sombras fuertes.' },
  { icon: <TargetIcon className="w-5 h-5 text-brand-500" />, title: 'Rostro centrado', description: 'Rostro completo de frente a la cámara.' },
  { icon: <ShieldIcon className="w-5 h-5 text-teal-600" />, title: 'Sin obstrucciones', description: 'Sin objetos ni accesorios tapando la cara.' },
  { icon: <GridIcon className="w-5 h-5 text-brand-500" />, title: 'Imagen nítida', description: 'Fotografía enfocada con buena resolución.' },
];

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
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPendingImage({ blob: file, objectUrl, width: img.width, height: img.height, source: 'gallery' });
      navigate('/preview');
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); alert('No se pudo procesar la imagen'); };
    img.src = objectUrl;
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
          <FlowStepper currentStep={3} />
          <SectionHeader badge="Análisis facial con IA" title="Captura tu imagen"
            description="Elige cómo proporcionar tu fotografía para el análisis" align="center" />

          <div className="surface-card p-5 mb-6">
            <p className="text-sm font-semibold text-brand-900 mb-4 text-center">Consejos para una mejor foto</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {TIPS.map((t) => <PhotoTipChip key={t.title} {...t} />)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <CaptureMethodCard variant="primary" icon={<CameraIcon className="w-8 h-8 text-white" />}
              title="Cámara web" description="Captura en tiempo real con guía de centrado y validación de calidad"
              badge="Recomendado" onClick={() => navigate('/quality-scan')} />
            <CaptureMethodCard icon={<ImageIcon className="w-8 h-8 text-brand-500" />}
              title="Galería" description="Selecciona una fotografía existente de tu dispositivo"
              badge="Cargar imagen" onClick={() => fileInputRef.current?.click()} />
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" aria-label="Seleccionar imagen" />

          <div className="text-center">
            <button type="button" onClick={() => navigate('/home')}
              className="text-sm text-textSecondary hover:text-brand-600 font-medium transition-colors">
              ← Volver al inicio
            </button>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}
