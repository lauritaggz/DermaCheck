import type { Recommendation } from '../types';

/**
 * Catálogo educativo basado en referencias DermNet (dermnetnz.org).
 * Redactado en español con lenguaje propio; no sustituye evaluación médica.
 */
export const skinAnalysisRecommendations: Recommendation[] = [
  {
    id: 'acne-care',
    title: 'Cuidado para piel con tendencia acneica',
    relatedConditionKeys: ['acne'],
    summary:
      'Rutina educativa basada en fuentes dermatológicas verificables. No reemplaza una evaluación médica.',
    suggestedIngredients: [
      {
        name: 'Ácido salicílico',
        purpose: 'Puede apoyar el cuidado de poros obstruidos y piel con tendencia grasa.',
        cautions: ['Introducir gradualmente.', 'Suspender si causa irritación importante.'],
      },
      {
        name: 'Niacinamida',
        purpose: 'Puede apoyar la barrera cutánea y el equilibrio de piel grasa o sensible.',
        cautions: ['Evitar combinar demasiados activos al mismo tiempo.'],
      },
      {
        name: 'Ácido azelaico',
        purpose: 'Activo cosmético que puede ayudar en el cuidado de lesiones leves y tono irregular.',
        cautions: ['Usar con paciencia; puede causar leve irritación al inicio.'],
      },
      {
        name: 'Peróxido de benzoilo',
        purpose: 'Puede apoyar el cuidado de lesiones inflamatorias leves en productos de venta libre.',
        cautions: ['Puede manchar telas.', 'Evitar contacto con ojos y mucosas.'],
      },
    ],
    suggestedProductTypes: [
      'limpiador suave',
      'hidratante no comedogénica',
      'protector solar SPF 30 o superior',
    ],
    morningRoutine: ['Limpieza suave', 'Hidratante ligera', 'Protector solar'],
    nightRoutine: [
      'Limpieza suave',
      'Producto de cuidado específico si la piel lo tolera',
      'Hidratante',
    ],
    avoid: [
      'exfoliantes agresivos',
      'productos con alcohol fuerte',
      'manipular lesiones',
      'mezclar muchos activos a la vez',
    ],
    whenToConsult: [
      'lesiones dolorosas o profundas',
      'cicatrices',
      'empeoramiento persistente',
      'acné extenso o inflamatorio',
    ],
    sources: [{ name: 'DermNet', title: 'Acne', url: 'https://dermnetnz.org/topics/acne' }],
  },
  {
    id: 'rosacea-care',
    title: 'Cuidado para piel con enrojecimiento o sensibilidad (rosácea)',
    relatedConditionKeys: ['rosacea'],
    summary:
      'Enfoque para piel sensible distinto al acné común. Orientación educativa, no diagnóstico.',
    suggestedIngredients: [
      {
        name: 'Protector solar mineral',
        purpose: 'Ayuda a proteger la piel sensible del sol, factor frecuente de brotes.',
        cautions: ['Reaplicar en exposición prolongada.'],
      },
      {
        name: 'Niacinamida',
        purpose: 'Puede apoyar la barrera cutánea en pieles sensibles.',
        cautions: ['Introducir de a uno los activos nuevos.'],
      },
      {
        name: 'Ceramidas',
        purpose: 'Apoyan la reparación de la barrera en piel enrojecida o reactiva.',
        cautions: ['Preferir fórmulas sin fragancia.'],
      },
    ],
    suggestedProductTypes: [
      'limpiador suave piel sensible',
      'hidratante calmante',
      'protector solar SPF 30 o superior',
    ],
    morningRoutine: ['Limpieza muy suave', 'Hidratante calmante', 'Protector solar'],
    nightRoutine: ['Limpieza suave', 'Hidratante reparadora'],
    avoid: [
      'fragancias y alcohol fuerte',
      'exfoliantes agresivos o múltiples activos exfoliantes',
      'tratar como acné común',
      'agua muy caliente al lavar el rostro',
    ],
    whenToConsult: [
      'enrojecimiento persistente o brotes frecuentes',
      'ardor intenso o dolor',
      'síntomas oculares (ojos rojos o irritados)',
      'empeoramiento progresivo',
    ],
    sources: [{ name: 'DermNet', title: 'Rosacea', url: 'https://dermnetnz.org/topics/rosacea' }],
  },
  {
    id: 'dermatitis-care',
    title: 'Cuidado para piel con eczema o dermatitis',
    relatedConditionKeys: ['dermatitis', 'eczema'],
    summary:
      'Prioriza reparación de barrera cutánea. Los corticoides son tratamiento médico, no cosmético.',
    suggestedIngredients: [
      {
        name: 'Ceramidas',
        purpose: 'Ayudan a restaurar la barrera lipídica en piel seca o irritada.',
        cautions: ['Aplicar con frecuencia en brotes de sequedad.'],
      },
      {
        name: 'Pantenol',
        purpose: 'Puede apoyar la calma y hidratación de piel sensible.',
        cautions: ['Evitar fragancias en la misma rutina.'],
      },
      {
        name: 'Avena coloidal',
        purpose: 'Ingrediente calmante frecuente en productos para piel reactiva.',
        cautions: ['Verificar tolerancia individual.'],
      },
    ],
    suggestedProductTypes: [
      'limpiador syndet sin jabón',
      'emoliente o crema hidratante espesa',
      'protector solar suave',
    ],
    morningRoutine: ['Limpieza suave', 'Emoliente', 'Protector solar si hay exposición'],
    nightRoutine: ['Limpieza suave', 'Emoliente generoso', 'Reaplicar hidratante en zonas secas'],
    avoid: [
      'fragancias y jabones agresivos',
      'agua muy caliente',
      'fricción o exfoliación intensa',
      'corticoides tópicos sin prescripción médica',
    ],
    whenToConsult: [
      'dolor, secreción o costras',
      'heridas abiertas',
      'extensión importante del enrojecimiento',
      'picazón intensa persistente',
    ],
    sources: [
      { name: 'DermNet', title: 'Dermatitis', url: 'https://dermnetnz.org/topics/dermatitis' },
    ],
  },
  {
    id: 'dryness-care',
    title: 'Cuidado para piel seca (xerosis)',
    relatedConditionKeys: ['dryness', 'resequedad'],
    summary:
      'Hidratación frecuente y hábitos suaves para piel con tirantez o descamación leve.',
    suggestedIngredients: [
      {
        name: 'Glicerina',
        purpose: 'Humectante que ayuda a retener agua en la capa externa de la piel.',
        cautions: ['Combinar con emoliente para mejor efecto.'],
      },
      {
        name: 'Ceramidas',
        purpose: 'Refuerzan la barrera cutánea en piel seca o deshidratada.',
        cautions: ['Aplicar sobre piel ligeramente húmeda.'],
      },
      {
        name: 'Ácido hialurónico',
        purpose: 'Aporta hidratación superficial; usar con emoliente encima.',
        cautions: ['En ambientes muy secos, sellar con crema.'],
      },
      {
        name: 'Urea (baja concentración)',
        purpose: 'Puede mejorar la hidratación en xerosis leve en formulaciones cosméticas.',
        cautions: ['Concentraciones altas pueden irritar; empezar con formulaciones suaves.'],
      },
    ],
    suggestedProductTypes: [
      'limpiador suave sin fragancia',
      'crema hidratante con ceramidas',
      'emoliente para piel seca',
    ],
    morningRoutine: ['Limpieza suave', 'Hidratante o emoliente', 'Protector solar'],
    nightRoutine: ['Limpieza suave', 'Emoliente generoso', 'Reaplicar en zonas muy secas'],
    avoid: [
      'baños largos o agua muy caliente',
      'jabones agresivos',
      'productos con alcohol fuerte',
      'frotar la piel al secar',
    ],
    whenToConsult: [
      'grietas dolorosas o sangrado',
      'picazón intensa persistente',
      'signos de infección',
      'resequedad extensa sin mejoría',
    ],
    sources: [
      { name: 'DermNet', title: 'Dry skin', url: 'https://dermnetnz.org/topics/dry-skin' },
    ],
  },
  {
    id: 'comedones-care',
    title: 'Cuidado para puntos negros y comedones',
    relatedConditionKeys: ['comedones', 'puntos-negros', 'puntos_negros'],
    summary:
      'Los comedones son poros obstruidos, no suciedad. Orientación para limpieza suave sin extracción agresiva.',
    suggestedIngredients: [
      {
        name: 'Ácido salicílico',
        purpose: 'Puede apoyar la limpieza de poros obstruidos en rutinas graduales.',
        cautions: ['Evitar exfoliación física agresiva al mismo tiempo.'],
      },
      {
        name: 'Niacinamida',
        purpose: 'Puede ayudar a equilibrar la producción de sebo sin resecar en exceso.',
        cautions: ['Introducir de a un activo por vez.'],
      },
    ],
    suggestedProductTypes: [
      'limpiador suave',
      'hidratante no comedogénica',
      'protector solar facial',
    ],
    morningRoutine: ['Limpieza suave', 'Hidratante ligera', 'Protector solar'],
    nightRoutine: ['Limpieza suave', 'Cuidado específico para poros si se tolera', 'Hidratante'],
    avoid: [
      'extraer o apretar comedones',
      'exfoliación física agresiva',
      'productos muy oleosos en piel grasa',
      'frotar la piel con fuerza',
    ],
    whenToConsult: [
      'inflamación importante o dolor',
      'lesiones extensas con enrojecimiento',
      'empeoramiento persistente',
      'sospecha de infección',
    ],
    sources: [
      { name: 'DermNet', title: 'Comedones', url: 'https://dermnetnz.org/topics/comedones' },
    ],
  },
  {
    id: 'hyperpigmentation-care',
    title: 'Cuidado para manchas e hiperpigmentación',
    relatedConditionKeys: ['hyperpigmentation', 'manchas'],
    summary:
      'La fotoprotección es la base. No se promete eliminación de manchas; los cambios suelen ser graduales.',
    suggestedIngredients: [
      {
        name: 'Protector solar SPF 50+',
        purpose: 'Esencial para prevenir el empeoramiento de manchas por exposición solar.',
        cautions: ['Reaplicar cada 2 horas en exposición directa.'],
      },
      {
        name: 'Vitamina C',
        purpose: 'Antioxidante cosmético que puede apoyar la luminosidad y protección complementaria.',
        cautions: ['Introducir gradualmente si la piel es sensible.'],
      },
      {
        name: 'Niacinamida',
        purpose: 'Puede apoyar la apariencia de tono más uniforme con uso constante.',
        cautions: ['Combinar siempre con fotoprotección diaria.'],
      },
      {
        name: 'Ácido azelaico',
        purpose: 'Activo cosmético que puede ayudar en manchas residuales leves.',
        cautions: ['No sustituye evaluación de lesiones pigmentadas sospechosas.'],
      },
    ],
    suggestedProductTypes: [
      'protector solar de amplio espectro',
      'hidratante ligera',
      'sérum antioxidante',
    ],
    morningRoutine: ['Limpieza suave', 'Sérum si se tolera', 'Protector solar generoso'],
    nightRoutine: ['Limpieza suave', 'Hidratante', 'Activo despigmentante suave si se tolera'],
    avoid: [
      'exposición solar sin protección',
      'prometer eliminación total de manchas',
      'exfoliantes agresivos sin fotoprotección',
      'autodiagnóstico de lesiones pigmentadas',
    ],
    whenToConsult: [
      'cambio rápido de tamaño, forma o color',
      'bordes irregulares o sangrado',
      'picor, dolor o crecimiento',
      'varios colores en la misma lesión',
    ],
    sources: [
      {
        name: 'DermNet',
        title: 'Pigmentation disorders',
        url: 'https://dermnetnz.org/topics/pigmentation-disorders',
      },
    ],
  },
];
