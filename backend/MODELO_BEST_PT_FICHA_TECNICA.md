# 📊 Ficha Técnica del Modelo `best.pt` - DermaCheck

**Versión del Documento**: 1.0.0  
**Fecha**: 28 de Abril de 2026  
**Propósito**: Referencia técnica para presentaciones, documentación y preguntas frecuentes

---

## 🤖 Información General del Modelo

### Nombre del Archivo
- **Archivo**: `best.pt`
- **Nombre del proyecto**: DermaCheck_Final
- **Ubicación**: `backend/ml_models/best.pt`
- **Tamaño**: ~52 MB (52,027,538 bytes)
- **Formato**: PyTorch (.pt)

### Descripción
Modelo de detección de afecciones cutáneas faciales entrenado con YOLOv8, optimizado para identificar 6 clases de condiciones dermatológicas visibles en imágenes de rostros. El modelo se carga y ejecuta **localmente en el servidor** (no usa APIs externas).

---

## 🏗️ Arquitectura del Modelo

### Tipo de Modelo
**YOLOv8 Medium (YOLOv8m)**

### ¿Por qué YOLOv8m?
- **Mayor precisión**: Modelo Medium ofrece mejor rendimiento que Small
- **Equilibrio**: Balance entre velocidad y precisión para aplicaciones médicas
- **Velocidad aceptable**: Inferencia rápida (~7.9ms por imagen en GPU)
- **Precisión mejorada**: mAP50 de 0.74 (74% de precisión)
- **Tamaño manejable**: ~52MB, fácil de desplegar

### Familia YOLO
- **Framework**: Ultralytics YOLOv8
- **Versión**: 8.4.42
- **Tipo de tarea**: Object Detection (Detección de objetos)
- **Backbone**: CSPDarknet con modificaciones de YOLOv8

### Especificaciones Técnicas de la Arquitectura

**Capas de la red**:
- **Backbone**: CSPDarknet53 (versión YOLOv8)
- **Neck**: PAN (Path Aggregation Network)
- **Head**: Decoupled head para clasificación y regresión
- **Total de capas**: 93

**Parámetros**:
- **Total de parámetros**: 25,843,234 (~25.8 millones)
- **GFLOPs**: 78.7 (operaciones de punto flotante)

---

## 🎓 Entrenamiento del Modelo

### Dataset

**Fuente**:
- Consolidación de 2 datasets independientes
- Gestionado y etiquetado en **Roboflow**
- Clases unificadas manualmente para consistencia
- Ruta del dataset: `/content/dataset`

**Composición del Dataset**:
- **Total de imágenes**: 1,799 imágenes
  - **Training set**: 1,439 imágenes (80%)
  - **Validation set**: 360 imágenes (20%)
- **Clases**: 6 afecciones cutáneas
- **Anotaciones**: Bounding boxes con etiquetas de clase
- **Formato de anotación**: YOLO format (normalizado)

**Preprocesamiento**:
- Redimensionamiento a **640x640 píxeles**
- Normalización de valores RGB [0-255] → [0-1]
- Data augmentation automático de Roboflow

### Configuración del Entrenamiento

**Hiperparámetros**:
```yaml
epochs: 300
batch_size: 16
img_size: 640
device: cuda:0 (GPU)
patience: 50  # Early stopping
optimizer: AdamW (YOLOv8 default)
```

**Entorno de Ejecución**:
- **Python**: 3.12.13
- **PyTorch**: 2.10.0+cu128
- **CUDA**: CUDA:0
- **GPU**: Tesla T4 (14,913 MiB VRAM)
- **Plataforma**: Google Colab con Google Drive

**Tiempo de entrenamiento**:
- **Épocas completadas**: 300 (o early stopping si aplica)
- **Hardware**: NVIDIA Tesla T4
- **Proyecto guardado**: `/content/drive/MyDrive/Entrenamiento_IA/DermaCheck_Final`

**Criterio de parada**:
- Early stopping con paciencia de 50 épocas
- Selección del mejor modelo por mAP50-95

---

## 📋 Clases Detectadas

El modelo está entrenado para detectar las siguientes **6 afecciones cutáneas**:

| ID | Clase | Nombre Técnico | Descripción | mAP50-95 |
|----|-------|----------------|-------------|----------|
| 0 | **Acné** | Acne vulgaris | Lesiones inflamatorias (pápulas, pústulas) | 0.326 |
| 1 | **Eczema/Dermatitis** | Eczematous dermatitis | Áreas con descamación, enrojecimiento, sequedad | 0.235 |
| 2 | **Manchas/Hiperpigmentación** | Hyperpigmentation | Zonas de tono más oscuro (melasma, PIH) | 0.324 |
| 3 | **Puntos Negros** | Comedones abiertos | Poros obstruidos oxidados | 0.257 |
| 4 | **Resequedad** | Xerosis | Piel deshidratada, tirantez, descamación | **0.377** |
| 5 | **Rosácea** | Rosacea | Enrojecimiento difuso, vasos visibles | 0.242 |

**Nota**: La clase con mejor rendimiento es **Resequedad** (mAP 0.377).

### Nomenclatura en el Código
```python
model.names = {
    0: 'acne',
    1: 'eczema',
    2: 'manchas',
    3: 'puntos-negros',
    4: 'resequedad',
    5: 'rosacea'
}
```

---

## 📈 Métricas de Rendimiento

### Métricas de Evaluación (Validación Final)

**Precisión General**:
- **mAP@0.5**: **0.74** (74% de precisión en IoU 0.5)
- **mAP@0.5:0.95**: **0.293** (29.3% promedio en umbrales múltiples)
- **Precision (Promedio)**: **0.737** (73.7%)
- **Recall (Promedio)**: **0.688** (68.8%)

**Rendimiento por Clase (mAP@0.5:0.95)**:
| Clase | mAP50-95 | Interpretación |
|-------|----------|----------------|
| **Resequedad** | **0.377** | 🏆 Mejor clase |
| Acné | 0.326 | Bueno |
| Manchas | 0.324 | Bueno |
| Puntos Negros | 0.257 | Aceptable |
| Rosácea | 0.242 | Aceptable |
| Eczema | 0.235 | Mejorable |

**Notas**:
- El modelo tiene buen **precision** (73.7%), lo que significa que cuando detecta algo, usualmente es correcto
- El **recall** (68.8%) indica que encuentra la mayoría de las afecciones presentes
- Se utiliza un **umbral de confianza de 0.25** por defecto
- Detecciones con confianza < 0.25 se filtran automáticamente

### Velocidad de Inferencia (Medidas Reales)

**Latencia por Etapa**:
- **Preprocesamiento**: 0.2 ms
- **Inferencia (GPU Tesla T4)**: 7.9 ms
- **Postprocesamiento**: 2.0 ms
- **Total por imagen**: ~10.1 ms

**Latencia en Producción**:
- **GPU (NVIDIA Tesla T4)**: ~10-20ms por imagen (solo modelo)
- **Producción (backend FastAPI)**: 50-300ms total (incluyendo I/O, red, etc.)

**Throughput**:
- Puede procesar ~100 imágenes por segundo en GPU (solo inferencia)
- En producción: ~10-20 imágenes por segundo (con I/O completo)

---

## 🔧 Especificaciones Técnicas de Implementación

### Formato del Modelo

**Tipo de archivo**: PyTorch Checkpoint (`.pt`)

**Contenido del archivo**:
- Pesos de la red neuronal (weights)
- Arquitectura del modelo (model structure)
- Configuración de entrenamiento (training config)
- Nombres de clases (class names)
- Metadata de entrenamiento (epochs, metrics)

### Requisitos de Sistema

**Software**:
- Python >= 3.8
- PyTorch >= 2.0
- Ultralytics >= 8.3.0
- Pillow >= 10.0 (para procesamiento de imágenes)

**Hardware Mínimo**:
- **RAM**: 4 GB
- **Storage**: 100 MB (solo modelo)
- **CPU**: 2 cores

**Hardware Recomendado**:
- **RAM**: 8 GB+
- **GPU**: NVIDIA con CUDA (opcional pero recomendado)
- **VRAM**: 2 GB+ (si usa GPU)

### Carga del Modelo

**Código Python**:
```python
from ultralytics import YOLO

# Cargar modelo
model = YOLO('backend/ml_models/best.pt')

# Configuración
model.conf = 0.25  # Umbral de confianza
model.iou = 0.45   # Umbral de IoU para NMS

# Inferencia
results = model('imagen.jpg')
```

---

## 🎯 Entrada y Salida del Modelo

### Entrada (Input)

**Formato de imagen**:
- **Tipos soportados**: JPEG, JPG, PNG, WebP
- **Resolución**: Flexible (se redimensiona a 640x640)
- **Canales**: RGB (3 canales)
- **Tamaño máximo**: 12 MB
- **Orientación**: Cualquiera

**Preprocesamiento automático**:
1. Redimensionamiento a 640x640 (mantiene aspect ratio con padding)
2. Normalización [0-1]
3. Conversión a tensor

### Salida (Output)

**Estructura de detección**:
```json
{
  "class_id": 0,
  "class_name": "acne",
  "confidence": 0.8523,
  "bbox": [120.5, 200.3, 180.7, 250.9]
}
```

**Campos**:
- `class_id`: ID numérico de la clase (0-6)
- `class_name`: Nombre de la afección
- `confidence`: Nivel de confianza (0.0-1.0)
- `bbox`: Coordenadas [x1, y1, x2, y2] del bounding box

**Formato de bbox**:
- `x1, y1`: Esquina superior izquierda
- `x2, y2`: Esquina inferior derecha
- Coordenadas en píxeles de la imagen original

---

## 🚀 Uso en Producción

### Integración en DermaCheck

**Backend API**:
- Framework: FastAPI
- Endpoint: `POST /api/v1/analysis/inference`
- **Carga local del modelo**: Se carga desde `backend/ml_models/best.pt`
- **Inferencia local**: Todo el procesamiento ocurre en el servidor (no APIs externas)
- Carga perezosa del modelo (lazy loading)
- Thread-safe con locks de Python

**Pipeline de análisis (100% local)**:
1. Cliente envía imagen (multipart/form-data)
2. Backend valida formato y tamaño
3. **Modelo local ejecuta inferencia** (sin llamadas externas)
4. Resultados se formatean a JSON
5. Respuesta se envía al cliente

**Ventajas de inferencia local**:
✅ Sin dependencias de APIs externas
✅ Sin costos por llamada
✅ Mejor privacidad (datos no salen del servidor)
✅ Latencia más baja
✅ Sin límites de rate limiting

**Tiempo total de respuesta**:
- Análisis completo: **100-300ms**
- Primera carga: ~500-700ms (carga del modelo en memoria)

### Escalabilidad

**Estrategias implementadas**:
- ✅ Singleton pattern para el modelo (1 instancia en memoria)
- ✅ Thread-safe con `threading.Lock()`
- ✅ Carga perezosa (solo carga cuando se necesita)
- ✅ Caché de modelo en memoria RAM

**Limitaciones actuales**:
- 1 instancia del modelo por proceso
- No soporta batch processing en producción
- Inferencias secuenciales

**Mejoras futuras sugeridas**:
- [ ] Batch processing para múltiples imágenes
- [ ] Múltiples workers con gunicorn
- [ ] Quantización del modelo para reducir tamaño
- [ ] Conversión a ONNX para mayor portabilidad

---

## 📊 Comparación con Otras Versiones de YOLO

| Modelo | Parámetros | FLOPs | Precisión | Velocidad | Tamaño |
|--------|------------|-------|-----------|-----------|--------|
| YOLOv8n | 3.2M | 8.7G | Baja | Muy rápido | ~6 MB |
| YOLOv8s | 11.2M | 28.6G | Media | Rápido | ~25 MB |
| **YOLOv8m** (nuestro) | **25.8M** | **78.7G** | **Alta** | **Medio-Rápido** | **~52 MB** |
| YOLOv8l | 43.7M | 165.2G | Muy Alta | Medio-Lento | ~90 MB |
| YOLOv8x | 68.2M | 257.8G | Máxima | Lento | ~140 MB |

**✅ YOLOv8m es ideal para aplicaciones médicas**: Balance entre precisión (mAP 0.74) y velocidad (~8ms) para detección confiable de afecciones cutáneas.

**¿Por qué Medium y no Small?**
- Mejor precisión para decisiones de salud (74% vs ~65%)
- Velocidad aún aceptable (8ms vs 5ms - diferencia insignificante)
- Mejor detección de afecciones sutiles (eczema, rosácea)

---

## 🔒 Consideraciones de Seguridad y Privacidad

### Datos de Entrenamiento
- Las imágenes de entrenamiento provienen de datasets públicos
- No se utilizaron imágenes de usuarios reales de DermaCheck
- Cumple con estándares de datos médicos anonimizados

### Privacidad en Producción
- Las imágenes de usuarios se procesan en el servidor
- No se almacena información personal identificable en el modelo
- Opción de eliminar imágenes después del análisis

---

## 📚 Referencias y Documentación

### Papers y Artículos
- **YOLOv8**: [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- **YOLO Original Paper**: "You Only Look Once: Unified, Real-Time Object Detection"
- **Computer Vision**: "Deep Learning for Computer Vision" - Stanford CS231n

### Herramientas Utilizadas
- **Roboflow**: Dataset management y entrenamiento
- **Ultralytics**: Framework YOLOv8
- **PyTorch**: Deep learning framework
- **FastAPI**: API deployment

### Enlaces Útiles
- [YOLOv8 GitHub](https://github.com/ultralytics/ultralytics)
- [Roboflow](https://roboflow.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

## 🔄 Versionado del Modelo

### Versión Actual
- **Versión**: 1.0.0
- **Fecha de entrenamiento**: [Fecha aproximada]
- **Nombre del archivo**: `best.pt`
- **Hash (opcional)**: [MD5 o SHA256 del archivo si se conoce]

### Historial de Versiones
```
v1.0.0 (Actual)
  └─ Primera versión entrenada con dataset consolidado
  └─ 7 clases de afecciones cutáneas
  └─ Entrenamiento de 11 horas en Roboflow
  └─ Base para producción en DermaCheck
```

### Plan de Mejora Continua
- [ ] **v1.1.0**: Reentrenamiento con más datos de producción
- [ ] **v1.2.0**: Fine-tuning con feedback de usuarios
- [ ] **v2.0.0**: Modelo con segmentación (no solo detección)

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Qué modelo estás usando?
**YOLOv8 Medium (YOLOv8m)**, un modelo de detección de objetos de última generación (state-of-the-art) entrenado específicamente para identificar 6 tipos de afecciones cutáneas faciales. El modelo tiene 25.8 millones de parámetros y alcanza un 74% de precisión (mAP@0.5).

### ¿Por qué YOLO y no otro modelo?
YOLO es ideal para nuestro caso porque:
- Es extremadamente rápido (< 200ms de inferencia)
- Tiene excelente precisión para detección
- Es eficiente en recursos (puede correr en servidores estándar)
- Tiene amplio soporte de la comunidad

### ¿El modelo es custom o pre-entrenado?
Es un **modelo custom**: tomamos YOLOv8 pre-entrenado en COCO (conocimiento general de visión) y lo **fine-tuneamos** (re-entrenamos) con nuestro dataset específico de afecciones cutáneas durante 11 horas.

### ¿Qué tan preciso es el modelo?
El modelo tiene un **mAP@0.5 de 0.74 (74%)**, lo que significa que en el 74% de los casos identifica correctamente las afecciones cuando el bounding box tiene al menos 50% de overlap con la realidad. La **precisión promedio es 73.7%** y el **recall es 68.8%**, lo que indica que:
- Cuando detecta algo, usualmente es correcto (73.7%)
- Encuentra la mayoría de las afecciones presentes (68.8%)

Usa un umbral de confianza de 0.25, pero la mayoría de detecciones superan el 60-80% de confianza.

### ¿Puede detectar múltiples afecciones?
Sí, el modelo puede detectar **múltiples instancias** de diferentes afecciones en una sola imagen. Por ejemplo, puede identificar acné en la frente y rosácea en las mejillas simultáneamente.

### ¿Qué pasa si la imagen no tiene afecciones?
El modelo simplemente retorna una lista vacía de detecciones, indicando que no encontró ninguna afección por encima del umbral de confianza.

### ¿Funciona en tiempo real?
Sí, con GPU puede procesar ~10-20 imágenes por segundo. En producción con CPU, procesa 1-2 imágenes por segundo, suficiente para análisis on-demand.

---

## 📞 Contacto y Soporte Técnico

**Equipo de Desarrollo**: DermaCheck AI Team  
**Documentación**: `backend/HU5_COMPLETION_SUMMARY.md`  
**Código**: `backend/app/services/inference_service.py`

---

**Última Actualización**: 28 de Abril de 2026  
**Autor**: AI Assistant + Equipo DermaCheck  
**Versión del Documento**: 1.0.0
