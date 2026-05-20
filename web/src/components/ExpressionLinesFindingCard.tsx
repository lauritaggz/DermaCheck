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
        <div className="flex items-stretch">
          <div
            className={`w-16 bg-gradient-to-b ${BAR_GRADIENT} flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-3xl font-bold text-white">{cardIndex}</span>
          </div>

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">Líneas de expresión detectadas</h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Se detectaron zonas asociadas a líneas de expresión en la imagen analizada.
                </p>
              </div>

              <div className="flex-shrink-0 text-right bg-white/50 rounded-xl p-4 min-w-[140px]">
                <div className="text-4xl font-bold leading-none mb-1">{confidencePercent}%</div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                  Confianza promedio
                </p>
                <div className="pt-2 border-t border-current/20">
                  <p className="text-sm font-medium">
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
