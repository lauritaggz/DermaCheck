import type { ImageAsset } from '../../types';

interface Props {
  images: ImageAsset[];
  variant?: 'light' | 'dark';
  className?: string;
}

export function SelectedCapturePreviews({ images, variant = 'light', className = '' }: Props) {
  if (images.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        isDark
          ? 'bg-white/10 border-white/20'
          : 'bg-brand-50/80 border-brand-100'
      } ${className}`}
    >
      <p
        className={`text-xs font-semibold mb-3 ${
          isDark ? 'text-white/80' : 'text-brand-800'
        }`}
      >
        {images.length} foto{images.length !== 1 ? 's' : ''} seleccionada{images.length !== 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
        {images.map((img, index) => (
          <div key={img.objectUrl} className="flex flex-col items-center gap-2">
            <div
              className={`relative w-36 h-44 sm:w-44 sm:h-52 md:w-48 md:h-60 rounded-xl overflow-hidden border-2 shadow-soft ${
                isDark ? 'border-teal-400/50' : 'border-teal-300'
              }`}
            >
              <img
                src={img.objectUrl}
                alt={`Vista previa foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold ${
                  isDark ? 'bg-black/60 text-white' : 'bg-white/90 text-brand-800'
                }`}
              >
                {index + 1}
              </span>
            </div>
            <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-textSecondary'}`}>
              Foto {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
