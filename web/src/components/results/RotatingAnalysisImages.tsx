import { useEffect, useState } from 'react';

interface Props {
  imageUrls: string[];
  className?: string;
  /** Tamaño reducido para incrustar en secciones de contenido. */
  compact?: boolean;
}

export function RotatingAnalysisImages({ imageUrls, className = '', compact = false }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isRotating = imageUrls.length >= 2;

  useEffect(() => {
    if (!isRotating) {
      setActiveIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % imageUrls.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isRotating, imageUrls.length]);

  if (imageUrls.length === 0) return null;

  return (
    <div className={className}>
      <div
        className={`relative scan-corners ai-card overflow-hidden mx-auto ${
          compact ? 'w-full max-w-[220px] aspect-[3/4]' : 'w-full max-w-xs aspect-[3/4]'
        }`}
      >
        {imageUrls.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={`Fotografía analizada ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-teal-700 border border-teal-200 z-10">
          IA · Analizada
        </div>
        {isRotating && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/55 text-white text-xs font-semibold backdrop-blur-sm z-10">
            Foto {activeIndex + 1} de {imageUrls.length}
          </span>
        )}
        <div className="scan-line-overlay pointer-events-none" aria-hidden="true" />
      </div>
      {isRotating && (
        <p className="text-center text-xs text-textMuted mt-2" role="status" aria-live="polite">
          Alternando entre las {imageUrls.length} fotografías analizadas
        </p>
      )}
    </div>
  );
}
