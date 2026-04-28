import type { FaceDetection } from '../types';

/**
 * Mapea el nombre de clase del modelo YOLO a una etiqueta en español.
 */
export function formatClassLabel(raw: string): string {
  const token = raw.split(/[\s-]/u)[0]?.toLowerCase() ?? raw.toLowerCase();
  
  const map: Record<string, string> = {
    acne: 'Acné',
    eczema: 'Eczema',
    manchas: 'Manchas',
    puntos: 'Puntos negros',
    resequedad: 'Resequedad',
    rosacea: 'Rosácea',
    wrinkle: 'Líneas de expresión',
    wrinkles: 'Líneas de expresión',
    'puntos negros': 'Puntos negros',
    hyperpigmentation: 'Hiperpigmentación',
    dermatitis: 'Dermatitis',
  };
  
  if (token === 'puntos') return map.puntos;
  return map[token] || raw.split(/\s+/u)[0] || raw;
}

/**
 * Asigna un color basado en el tipo de afección para la UI.
 */
export function getConditionColor(className: string): string {
  const token = className.toLowerCase();
  
  if (token.includes('acne') || token.includes('puntos')) return 'blue';
  if (token.includes('wrinkle') || token.includes('línea')) return 'amber';
  if (token.includes('mancha') || token.includes('pigment')) return 'amber';
  if (token.includes('rosacea') || token.includes('dermatitis')) return 'red';
  if (token.includes('reseque')) return 'green';
  
  return 'blue'; // default
}

/**
 * Agrupa detecciones por clase y retorna la de mayor confianza para cada clase.
 */
export function aggregateByClass(detections: FaceDetection[]): Array<{
  id: string;
  label: string;
  className: string;
  confidence: number;
  color: string;
  severity: string;
}> {
  const best = new Map<string, { confidence: number; detection: FaceDetection }>();
  
  for (const d of detections) {
    const key = d.class_name.trim();
    const prev = best.get(key);
    
    if (!prev || d.confidence > prev.confidence) {
      best.set(key, { confidence: d.confidence, detection: d });
    }
  }
  
  return Array.from(best.entries())
    .map(([className, { confidence }], idx) => ({
      id: `detection-${idx}`,
      label: formatClassLabel(className),
      className,
      confidence: Math.round(confidence * 100),
      color: getConditionColor(className),
      severity: confidence > 0.7 ? 'moderate' : 'mild',
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Genera recomendaciones basadas en las afecciones detectadas.
 */
export function generateRecommendations(conditions: Array<{ className: string }>): string[] {
  const recommendations: string[] = [];
  const classNames = conditions.map(c => c.className.toLowerCase());
  
  // Recomendaciones por tipo de afección
  if (classNames.some(c => c.includes('acne') || c.includes('puntos'))) {
    recommendations.push('Limpieza diaria con productos suaves que contengan ácido salicílico o niacinamida');
    recommendations.push('Evita productos comedogénicos que puedan obstruir los poros');
  }
  
  if (classNames.some(c => c.includes('wrinkle') || c.includes('línea'))) {
    recommendations.push('Aplicar sérum con retinol o peptidos para reducir líneas de expresión');
    recommendations.push('Hidratación profunda para mantener la elasticidad de la piel');
  }
  
  if (classNames.some(c => c.includes('mancha') || c.includes('pigment'))) {
    recommendations.push('Usar sérum con vitamina C o ácido azelaico para uniformar el tono');
    recommendations.push('Aplicar tratamientos despigmentantes por la noche');
  }
  
  if (classNames.some(c => c.includes('rosacea') || c.includes('dermatitis'))) {
    recommendations.push('Usar productos calmantes con ingredientes como pantenol o avena coloidal');
    recommendations.push('Evitar productos con alcohol o fragancias fuertes');
  }
  
  if (classNames.some(c => c.includes('reseque'))) {
    recommendations.push('Aplicar cremas hidratantes ricas en ceramidas y ácido hialurónico');
    recommendations.push('Evitar limpiadores agresivos que resequen la piel');
  }
  
  // Recomendaciones generales
  recommendations.push('Usar protector solar SPF 50+ diariamente, incluso en días nublados');
  
  if (recommendations.length === 1) {
    recommendations.push('Mantener una rutina de limpieza e hidratación constante');
    recommendations.push('Consultar con un dermatólogo para un plan personalizado');
  }
  
  return recommendations;
}
