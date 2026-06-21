import { useEffect, useState } from 'react';

const MESSAGES = [
  'Analizando imagen facial…',
  'Detectando zonas de la piel…',
  'Procesando afecciones cutáneas…',
  'Generando recomendaciones…',
];

interface Props {
  /** Una sola imagen (compatibilidad). */
  imageUrl?: string;
  /** Varias imágenes: se muestran en rotación durante el análisis. */
  imageUrls?: string[];
}

export function ScanLoadingAnimation({ imageUrl, imageUrls }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const urls = imageUrls?.length
    ? imageUrls
    : imageUrl
      ? [imageUrl]
      : [];

  const isDoubleAnalysis = urls.length >= 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isDoubleAnalysis) {
      setActiveImageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % urls.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isDoubleAnalysis, urls.length]);

  const currentUrl = urls[activeImageIndex];

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <div className="scan-corners ai-card aspect-[3/4] overflow-hidden relative">
        {currentUrl ? (
          <>
            {urls.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`Imagen ${index + 1} en análisis`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            {isDoubleAnalysis && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/55 text-white text-xs font-semibold backdrop-blur-sm z-10">
                Foto {activeImageIndex + 1} de {urls.length}
              </span>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-brand-50 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-teal-500/10 pointer-events-none" />

        {/* Malla facial simulada */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" aria-hidden="true">
          <ellipse cx="50%" cy="45%" rx="28%" ry="35%" fill="none" stroke="#14B8A6" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50%" y1="15%" x2="50%" y2="75%" stroke="#1B5E96" strokeWidth="0.5" opacity="0.5" />
          <line x1="25%" y1="45%" x2="75%" y2="45%" stroke="#1B5E96" strokeWidth="0.5" opacity="0.5" />
          {[30, 45, 60].map((y) => (
            <circle key={y} cx="50%" cy={`${y}%`} r="3" fill="#14B8A6" opacity="0.8" />
          ))}
        </svg>

        <div className="scan-line-overlay" aria-hidden="true" />

        {/* Anillo pulsante */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[70%] h-[80%] rounded-[50%] border-2 border-teal-400/50 animate-pulse-ring" />
        </div>
      </div>

      <p
        className="text-center text-sm font-semibold text-brand-600 mt-4"
        role="status"
        aria-live="polite"
      >
        {isDoubleAnalysis
          ? `Analizando fotografía ${activeImageIndex + 1} de ${urls.length}…`
          : MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
