import type { ExpressionLinesResult } from '../types';

interface Props {
  expressionLines: ExpressionLinesResult;
  cardIndex: number;
}

const CARD_COLOR = 'bg-purple-50 border-purple-200 text-purple-800';
const BAR_GRADIENT = 'from-purple-500 to-purple-600';

/**
 * Tarjeta de hallazgo visual para líneas de expresión (sin recomendaciones de producto).
 */
export function ExpressionLinesFindingCard({ expressionLines, cardIndex }: Props) {
  const confidencePercent = Math.round(expressionLines.average_confidence * 100);

  return (
    <div className="group hover:scale-[1.01] transition-transform duration-200">
      <div
        className={`relative overflow-hidden rounded-2xl border-2 shadow-md hover:shadow-lg transition-shadow ${CARD_COLOR}`}
      >
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Barra lateral con número - visible en sm+ */}
          <div
            className={`hidden sm:flex w-16 bg-gradient-to-b ${BAR_GRADIENT} items-center justify-center flex-shrink-0`}
          >
            <span className="text-3xl font-bold text-white">{cardIndex}</span>
          </div>

          <div className="flex-1 p-4 sm:p-5">
            {/* Cabecera para móvil con número */}
            <div className="flex sm:hidden items-center gap-2 mb-3">
              <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${BAR_GRADIENT} flex items-center justify-center text-white font-bold text-base shadow-sm`}>
                {cardIndex}
              </span>
              <h3 className="font-bold text-lg text-purple-900">Líneas de expresión detectadas</h3>
            </div>

            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1 w-full">
                <h3 className="hidden sm:block font-bold text-xl mb-2">Líneas de expresión detectadas</h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Se detectaron zonas asociadas a líneas de expresión en la imagen analizada.
                </p>
              </div>

              {/* Estadísticas */}
              <div className="w-full md:w-auto flex-shrink-0 text-left md:text-right bg-white/50 rounded-xl p-4 min-w-0 md:min-w-[140px] flex md:flex-col justify-between items-center md:items-end gap-2 md:gap-0">
                <div>
                  <div className="text-3xl md:text-4xl font-bold leading-none mb-1">{confidencePercent}%</div>
                  <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-75">
                    Confianza promedio
                  </p>
                </div>
                <div className="pt-0 md:pt-2 border-l md:border-l-0 md:border-t border-current/20 pl-3 md:pl-0">
                  <p className="text-xs md:text-sm font-medium">
                    {expressionLines.count} detección{expressionLines.count !== 1 ? 'es' : ''}{' '}
                    aprox.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-current/20">
              <p className="text-xs leading-relaxed opacity-90">
                <span className="font-semibold">Nota: </span>
                Este resultado se muestra solo como hallazgo visual preliminar. Las
                recomendaciones específicas para líneas de expresión serán incorporadas en una
                próxima etapa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
