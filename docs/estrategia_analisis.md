# Estrategia Técnica: DermaCheck (Módulo de Análisis)

## 1. Stack Tecnológico

| Componente | Herramienta | Función Técnica |
| :--- | :--- | :--- |
| **Dataset Management** | **Roboflow** | Centralización de imágenes, etiquetado y gestión de versiones del dataset. |
| **Model Core** | **YOLOv8** | Arquitectura de red para detección de patologías y segmentación visual. |
| **Servicio API** | **FastAPI** | Framework para el despliegue de endpoints de inferencia. |

---

## 2. Plan de Procesamiento y Entrenamiento

* **Fusión de Datos:** Se contempla la recolección de dos datasets independientes, los cuales serán consolidados en un repositorio único para maximizar la diversidad de muestras.
* **Ajuste de Clases:** Se definirá un esquema de etiquetado unificado para estandarizar las anotaciones provenientes de distintas fuentes.
* **Protocolo de Entrenamiento:** Se proyecta un ciclo de entrenamiento intensivo de 11 horas utilizando la infraestructura de Roboflow, orientado a la optimización de pesos para las afecciones cutáneas objetivo.

---

## 3. Especificaciones del Modelo (YOLOv8)

* **Clases de Detección:** Acné, rosácea, resequedad, arrugas/líneas, comedones, manchas solares y cicatrices.
* **Método:** Visión computacional supervisada sobre imágenes RGB.
* **Input Requerido:** Imágenes faciales con preprocesamiento obligatorio (redimensionamiento a 640x640 y normalización de píxeles).
* **Output Esperado:** Tensores con coordenadas de *bounding boxes* y niveles de confianza por clase en formato JSON.

---

## 4. Arquitectura de Integración (FastAPI)

* **Validación de Entrada:** Implementación de filtros para verificar formato, peso y resolución de la imagen capturada por la aplicación móvil.
* **Ejecución de Inferencia:** Orquestación de llamadas asíncronas al modelo exportado (`.pt` o `.onnx`) para evitar bloqueos en el servicio.
* **Estandarización de Respuesta:** Transformación de la salida cruda del modelo en una estructura de datos apta para el consumo de la interfaz de usuario.

---

## 5. Justificación de Selección

* **Optimización de Recursos:** YOLOv8 permite alcanzar métricas de precisión aceptables con un costo computacional inferior a arquitecturas Transformer o CNNs construidas desde cero.
* **Compatibilidad de Flujo:** Roboflow permite la exportación directa hacia YOLOv8, eliminando scripts de conversión intermedios que podrían inducir errores de etiquetado.
* **Velocidad de Respuesta:** El uso de FastAPI garantiza una latencia mínima en la comunicación entre la aplicación y el modelo, requisito crítico para la experiencia de usuario.

---

## 6. Limitaciones Técnicas Identificadas

* **Varianza del Dataset:** La precisión final estará estrictamente supeditada a la calidad y equilibrio de las muestras consolidadas en Roboflow.
* **Condiciones de Captura:** La eficacia de la inferencia podría verse degradada ante capturas con baja iluminación o ruido digital excesivo.
* **Requerimientos de Cómputo:** El entrenamiento y ajuste del modelo demandará el uso continuo de GPU durante los ciclos de 11 horas definidos.