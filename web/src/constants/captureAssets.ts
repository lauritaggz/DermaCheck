/** Imagen de referencia en public/ para guiar las dos capturas faciales. */
export const CAPTURE_REFERENCE_IMAGE = '/imagen_referencia.png';

/** Indicaciones en cámara según número de foto (1ª o 2ª). */
export const CAPTURE_POSE_HINTS = [
  'Primera foto: de frente centrado si solo usarás 1 imagen; si tomarás 2, un lateral suave de un lado.',
  'Segunda foto: lateral suave del otro lado del rostro, como en la referencia.',
] as const;

/** Consejo de encuadre en la pestaña de captura (galería / selector). */
export const CAPTURE_PICKER_POSE_TIP = {
  initial: {
    title: 'Encuadre del rostro',
    description: '1 foto de frente centrada, o 2 laterales (un lado y el otro).',
  },
  secondPhoto: {
    title: 'Segunda fotografía',
    description: 'Selecciona el otro lateral del rostro, con la misma iluminación.',
  },
} as const;

export function getCapturePickerPoseTip(imageCount: number) {
  return imageCount >= 1
    ? CAPTURE_PICKER_POSE_TIP.secondPhoto
    : CAPTURE_PICKER_POSE_TIP.initial;
}

/** Resumen del modo de captura para guías e instrucciones. */
export const CAPTURE_MODE_SUMMARY =
  'Puedes enviar 1 fotografía de frente centrada, o 2 fotografías laterales (un lado y el otro).';
