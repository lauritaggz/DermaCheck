import { CAPTURE_MODE_SUMMARY, CAPTURE_POSE_HINTS, CAPTURE_REFERENCE_IMAGE } from '../../constants/captureAssets';

interface Props {
  /** Muestra ambas poses o solo la pose activa de la captura actual. */
  variant?: 'full' | 'pose';
  /** 1 o 2 cuando variant es pose. */
  captureIndex?: number;
  /** Estilo compacto para la pantalla de cámara. */
  compact?: boolean;
  className?: string;
}

export function CaptureReferenceGuide({
  variant = 'full',
  captureIndex = 1,
  compact = false,
  className = '',
}: Props) {
  const poseHint = CAPTURE_POSE_HINTS[Math.min(Math.max(captureIndex, 1), 2) - 1];

  if (variant === 'pose') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className={`relative overflow-hidden rounded-xl border-2 border-teal-400/40 bg-slate-900 flex-shrink-0 ${
            compact ? 'w-20 aspect-[3/4]' : 'w-28 sm:w-32 aspect-[3/4]'
          }`}
        >
          <img
            src={CAPTURE_REFERENCE_IMAGE}
            alt={`Referencia para la foto ${captureIndex}`}
            className="absolute top-0 h-full w-[200%] max-w-none object-cover object-top"
            style={{ left: captureIndex === 1 ? '0%' : '-100%' }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-semibold text-white">
              Ref.
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
            Foto {captureIndex}{captureIndex >= 2 ? '' : ' (opcional 2ª)'}
          </p>
          <p className={`text-white/75 leading-snug ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {poseHint}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`surface-card p-4 sm:p-5 ${className}`}>
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-brand-900">Ejemplo de captura (1 o 2 fotos)</p>
        <p className="text-xs text-textSecondary mt-1">
          {CAPTURE_MODE_SUMMARY} No uses esta imagen para el análisis.
        </p>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-brand-100 bg-brand-50/50">
        <img
          src={CAPTURE_REFERENCE_IMAGE}
          alt="Referencia de las dos poses para captura facial"
          className="w-full h-auto object-contain"
        />
        <div className="absolute bottom-0 inset-x-0 grid grid-cols-2 text-center text-[11px] sm:text-xs font-medium">
          <span className="py-2 bg-brand-900/75 text-white">Foto 1</span>
          <span className="py-2 bg-teal-700/75 text-white">Foto 2</span>
        </div>
      </div>
    </div>
  );
}
