# Entrenamiento de modelo de IA para clasificación de afecciones faciales

## 1. Objetivo

El objetivo de esta tarea fue preparar y entrenar un primer modelo de inteligencia artificial capaz de reconocer afecciones faciales visibles a partir de imágenes, utilizando un dataset consolidado y ajustado específicamente para el proyecto DermaCheck.

## 2. Descripción general del trabajo realizado

Para llevar a cabo esta tarea, primero se seleccionaron dos datasets que contenían imágenes útiles para el reconocimiento de afecciones faciales. Ambos datasets fueron integrados en Roboflow, con el fin de centralizar la gestión de imágenes, unificar clases y dejar una base de datos coherente para el entrenamiento del modelo.

Una vez combinados los datasets, se revisaron y ajustaron las clases existentes para que las imágenes quedaran correctamente etiquetadas bajo una misma lógica. Este proceso fue necesario para evitar inconsistencias entre etiquetas, reducir conflictos entre clases similares y asegurar que la información visual estuviera alineada con el objetivo del proyecto.

Posteriormente, con el dataset ya consolidado y corregido, se procedió al entrenamiento del modelo utilizando YOLOv8 small, ejecutando el proceso durante aproximadamente 11 horas.

## 3. Selección de datasets

En esta etapa se trabajó con dos datasets distintos que contenían imágenes relacionadas con afecciones faciales. La selección de ambos se realizó con el propósito de complementar la cobertura de clases y reunir una mayor cantidad de ejemplos visuales para el entrenamiento.

La decisión de combinar dos datasets respondió a la necesidad de:

- ampliar la cantidad de imágenes disponibles;
- mejorar la representación de las afecciones objetivo;
- aprovechar recursos ya existentes;
- acelerar la construcción de un primer modelo funcional.

## 4. Consolidación de datasets en Roboflow

Ambos datasets fueron cargados y combinados dentro de Roboflow. Esta plataforma permitió centralizar el trabajo de organización, revisión y ajuste de etiquetas en un mismo entorno, facilitando la preparación del dataset final.

La consolidación en Roboflow permitió:

- reunir todas las imágenes en un solo proyecto;
- revisar clases repetidas o inconsistentes;
- corregir etiquetas conflictivas;
- dejar una estructura común para el entrenamiento;
- preparar el dataset para exportación y uso con YOLOv8.

## 5. Ajuste y unificación de clases

Después de combinar los datasets, fue necesario ajustar las clases para que todas las imágenes quedaran etiquetadas bajo una estructura homogénea. Este paso fue importante porque, al trabajar con datasets distintos, podían existir diferencias en nombres de clases, categorías redundantes o etiquetas poco alineadas con el alcance definido para el proyecto.

El ajuste de clases permitió:

- unificar criterios de etiquetado;
- evitar duplicidad de clases;
- corregir inconsistencias entre datasets;
- mejorar la coherencia del conjunto de entrenamiento;
- evitar interferencias durante el procesamiento de imágenes y el entrenamiento del modelo.

Este proceso fue clave para que el modelo recibiera ejemplos correctamente organizados y pudiera aprender sobre una base más limpia y consistente.

## 6. Preparación final del dataset

Una vez realizadas las correcciones de clases, el dataset quedó preparado para su uso en entrenamiento. En esta fase, la prioridad fue asegurar que las imágenes y anotaciones estuvieran correctamente alineadas con las afecciones faciales que se buscaba detectar dentro del sistema.

Con esto se obtuvo un dataset consolidado, etiquetado y listo para ser utilizado como base del entrenamiento del modelo.

## 7. Entrenamiento del modelo

Con el dataset ya preparado, se procedió al entrenamiento del modelo utilizando **YOLOv8 small**.

La elección de esta versión del modelo respondió a un criterio práctico: utilizar una arquitectura lo suficientemente liviana para entrenar en un tiempo razonable, pero manteniendo una capacidad adecuada para obtener un primer resultado funcional dentro del contexto del proyecto.

El entrenamiento se ejecutó durante aproximadamente **11 horas**, lo que permitió generar una primera versión del modelo a partir del dataset consolidado y corregido.

## 8. Herramientas utilizadas

Las principales herramientas utilizadas durante esta tarea fueron:

- **Roboflow**, para combinar datasets, revisar imágenes y ajustar clases;
- **YOLOv8 small**, como modelo base para el entrenamiento;
- entorno de entrenamiento compatible con exportación desde Roboflow y ejecución del modelo.

## 9. Resultado obtenido

Como resultado de esta tarea, se obtuvo un primer modelo entrenado sobre un dataset previamente consolidado y corregido. Este modelo constituye la base inicial del análisis automatizado de afecciones faciales dentro del proyecto.

Además, esta etapa permitió dejar resuelto lo siguiente:

- selección de una estrategia de entrenamiento viable;
- consolidación de dos datasets en una sola fuente de trabajo;
- unificación de clases para evitar inconsistencias;
- generación de una primera versión entrenada del modelo.

## 10. Observaciones

Durante el desarrollo de esta tarea, uno de los puntos más importantes fue la necesidad de corregir y reorganizar las clases antes del entrenamiento. Esto fue esencial para evitar que diferencias entre datasets afectaran el aprendizaje del modelo o generaran problemas en etapas posteriores del procesamiento.

También se definió un enfoque práctico, priorizando la obtención de una primera versión funcional del modelo por sobre una optimización exhaustiva en esta etapa.

## 11. Conclusión

La tarea de entrenamiento del modelo de IA para el análisis de afecciones faciales se desarrolló a partir de la selección y combinación de dos datasets en Roboflow, seguido de un proceso de ajuste de clases para dejar las imágenes correctamente etiquetadas y alineadas con el objetivo del proyecto.

Una vez consolidado el dataset, se entrenó un modelo utilizando YOLOv8 small durante 11 horas, obteniendo así una primera base funcional para el reconocimiento automatizado de afecciones faciales en DermaCheck.

Este trabajo deja preparada una base sólida para continuar con las siguientes etapas del proyecto, como validación, pruebas adicionales e integración con backend.