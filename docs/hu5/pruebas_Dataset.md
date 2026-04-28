# Diseño de conjunto de pruebas con imágenes variadas

## Objetivo
Definir un conjunto de imágenes de prueba para evaluar el comportamiento del dataset consolidado y del modelo entrenado frente a distintos tipos de entradas faciales.

## Enfoque
Las imágenes de prueba se utilizaron para revisar si el modelo reconoce correctamente las clases definidas en el proyecto y para detectar posibles errores de clasificación, confusiones entre afecciones o problemas asociados a la calidad de imagen.

## Qué se evaluó
Se evaluaron imágenes que representaran:

- cada afección incluida en el dataset;
- imágenes con más de una afección visible;
- imágenes sin afecciones claras;
- imágenes con variaciones de iluminación, enfoque y encuadre.

## Clases probadas
Las imágenes de prueba estuvieron asociadas a las siguientes clases:

- acné;
- rosácea;
- resequedad;
- arrugas o líneas de expresión;
- comedones;
- manchas solares;
- cicatrices.

## Criterio de prueba aplicado
Para cada afección se probaron 5 imágenes por caso, con el fin de observar el comportamiento del modelo en distintos escenarios y no basar la evaluación en una sola muestra.

## Tipos de imágenes de prueba
El conjunto de pruebas incluyó imágenes como las siguientes:

- imágenes claras con una sola afección dominante;
- imágenes con múltiples afecciones;
- imágenes con baja iluminación;
- imágenes borrosas;
- imágenes con rostro parcialmente visible;
- imágenes sin hallazgos relevantes;
- imágenes que pudieran generar confusión entre clases.

## Observaciones obtenidas
A partir de las pruebas realizadas, se observó que el modelo presenta un comportamiento más estable en imágenes claras y bien definidas. En cambio, se detectaron dificultades en imágenes borrosas y con baja iluminación, lo cual era esperable, ya que estas condiciones reducen la visibilidad de los patrones faciales necesarios para la detección de afecciones.

## Resultado esperado
Este conjunto de pruebas permitió comprobar de forma inicial si el dataset quedó bien representado, si las clases están siendo reconocidas de manera razonable por el modelo y qué tipos de imágenes generan más errores o menor confianza en la detección.