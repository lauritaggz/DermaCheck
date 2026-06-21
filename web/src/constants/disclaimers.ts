export const CONSENT_SUMMARY = `
DermaCheck es una herramienta de orientación educativa sobre el cuidado cosmético de la piel. Utiliza imágenes faciales para generar un análisis preliminar mediante inteligencia artificial.

DermaCheck no entrega diagnóstico médico, no indica tratamiento clínico y no reemplaza la evaluación de un dermatólogo certificado.

Al continuar, autorizas que tu imagen facial sea capturada y procesada temporalmente para generar el resultado del análisis. Las recomendaciones entregadas son generales y deben interpretarse como orientación inicial.

Si presentas dolor, irritación intensa, lesiones que empeoran, heridas, sangrado, cambios rápidos en la piel o cualquier preocupación médica, debes consultar con un profesional de salud.
`.trim();

export const PRIVACY_SUMMARY = `
DermaCheck procesa imágenes faciales únicamente para entregar el análisis dermatológico orientativo solicitado.

En el flujo de usuario final no se requiere crear cuenta ni iniciar sesión. Si decides ingresar tu correo para recibir el resumen del análisis, este se usará solo para enviar dicho resumen y no será almacenado como cuenta de usuario.

Por defecto, las imágenes faciales se procesan para generar el análisis. El almacenamiento de imágenes para mejorar modelos de inteligencia artificial requiere una autorización opcional separada.

DermaCheck no vende tus datos personales ni comparte tus imágenes faciales con terceros para fines comerciales.

Puedes solicitar información o eliminación de tus datos mediante el canal de contacto definido por DermaCheck.
`.trim();

export const TRAINING_CONSENT_SUMMARY = `
Autorizo que DermaCheck almacene una copia de mis imágenes faciales de forma separada, sin asociarlas a nombre, correo ni cuenta de usuario, con el fin de investigación interna, clasificación y mejora de modelos de inteligencia artificial.

Entiendo que esta autorización es opcional y que puedo usar el análisis aunque no la acepte.

Las imágenes autorizadas para mejora del modelo serán almacenadas en un entorno privado, con identificadores aleatorios, sin metadatos EXIF y con acceso restringido.
`.trim();

export const CONSENT_TRAINING_OPTIONAL_NOTE =
  'Puedes usar DermaCheck aunque no autorices el uso de tus imágenes para mejora del modelo. Esa autorización es opcional.';

export const CONSENT_MINORS_NOTICE =
  'Si eres menor de edad, debes usar este servicio con autorización de tu madre, padre o tutor legal.';
