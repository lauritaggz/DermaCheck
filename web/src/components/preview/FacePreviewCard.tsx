import type { ImageQuality } from '../../services/imageQualityService';
import { PrimaryButton } from '../PrimaryButton';

interface Props {
  imageUrl: string;
  width: number;
  height: number;
  imageQuality: ImageQuality | null;
  analyzing: boolean;
  onAnalyze: () => void;
  onRetake: () => void;
}

export function FacePreviewCard({
  imageUrl,
  width,
  height,
  imageQuality,
  analyzing,
  onAnalyze,
  onRetake,
}: Props) {
  const isGood = imageQuality?.isGood ?? true;

  return (
    <div className="surface-card p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="scan-corners ai-card aspect-[3/4] overflow-hidden relative">
            <img src={imageUrl} alt="Vista previa de tu rostro" className="w-full h-full object-cover" />
            <div
              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                isGood
                  ? 'bg-emerald-500 text-white shadow-soft'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isGood ? '✓ Lista para analizar' : '⚠ Revisar calidad'}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-brand-900 mb-4">Confirmar imagen</h2>

          <div
            className={`rounded-xl p-4 mb-5 border-2 ${
              isGood ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}
          >
            {isGood ? (
              <p className="text-sm text-emerald-800">
                <strong>Imagen válida.</strong> Cumple los requisitos para el análisis facial con IA.
              </p>
            ) : (
              <div className="text-sm text-amber-800">
                <strong>Calidad mejorable</strong>
                <ul className="mt-2 space-y-1">
                  {(imageQuality?.issues ?? []).map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-center">
              <p className="text-[10px] text-textMuted uppercase tracking-wide">Resolución</p>
              <p className="text-sm font-bold text-brand-800">{width}×{height}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-center">
              <p className="text-[10px] text-textMuted uppercase tracking-wide">Estado</p>
              <p className="text-sm font-bold text-brand-800">{isGood ? 'Aprobada' : 'Revisar'}</p>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            <PrimaryButton
              label={analyzing ? 'Iniciando análisis…' : 'Analizar con IA'}
              onClick={onAnalyze}
              loading={analyzing}
              disabled={analyzing}
              className="w-full"
            />
            <PrimaryButton
              label="Cambiar imagen"
              variant="secondary"
              onClick={onRetake}
              disabled={analyzing}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
