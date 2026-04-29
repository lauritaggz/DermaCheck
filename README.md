# 🔬 DermaCheck - Plataforma Web de Análisis Dermatológico con IA

**Aplicación web profesional para análisis dermatológico facial mediante inteligencia artificial**

DermaCheck es una plataforma web que utiliza modelos de Deep Learning (YOLOv8m) para detectar y analizar afecciones cutáneas en el rostro, proporcionando diagnósticos preliminares estructurados y consejos generales de cuidado de la piel.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Modelo de IA](#-modelo-de-ia)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema de registro e inicio de sesión seguro
- Encriptación de contraseñas con bcrypt (12 rondas)
- Gestión de consentimientos informados (GDPR compliant)
- Persistencia de sesión en LocalStorage

### 📸 Captura de Imágenes
- Acceso a cámara web mediante `getUserMedia` API
- Selección de cámara (frontal/trasera)
- Carga de imágenes desde galería
- Vista previa antes del análisis

### 🤖 Análisis con IA
- Detección de 6 afecciones cutáneas:
  - Acné
  - Eczema/Dermatitis
  - Manchas
  - Puntos negros (comedones)
  - Resequedad
  - Rosácea
- Procesamiento en tiempo real (~8ms por imagen)
- Umbral de confianza ajustable (default: 0.25)

### 📊 Diagnóstico Preliminar Automatizado (HU 6)
- Resumen general del estado de la piel
- Clasificación por severidad (ninguna, leve, moderada, severa)
- Descripción médica detallada de cada condición
- Advertencias médicas importantes
- Consejos generales de cuidado (no tratamiento específico)
- Disclaimers legales prominentes
- Recomendación de evaluación presencial si es necesario

### 🎨 Interfaz Profesional
- Diseño responsive (mobile-first)
- Tema moderno con Tailwind CSS
- Animaciones suaves con Framer Motion
- Glassmorphism y efectos de profundidad
- Layout widescreen optimizado
- Dark mode ready

---

## 🛠️ Tecnologías

### Frontend Web
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2.5 | Framework UI |
| TypeScript | 5.7+ | Tipado estático |
| Vite | 8.0+ | Build tool y dev server |
| React Router DOM | 7.14+ | Enrutamiento SPA |
| Framer Motion | 12.38+ | Animaciones |
| Tailwind CSS | 3.4+ | Estilos utility-first |
| TanStack Query | 5.100+ | Gestión de estado asíncrono |

### Backend API
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Python | 3.12+ | Lenguaje base |
| FastAPI | 0.115+ | Framework web |
| Uvicorn | 0.34+ | ASGI server |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.10+ | Validación de datos |
| Ultralytics YOLO | 8.3+ | Framework IA |
| PyTorch | 2.10+ | Deep Learning |
| OpenCV | 4.10+ | Procesamiento de imágenes |
| Pillow | 11.1+ | Manipulación de imágenes |
| bcrypt | 4.2+ | Encriptación |
| Pytest | 8.3+ | Testing |

### Base de Datos
- **Desarrollo:** SQLite 3
- **Producción:** MySQL 8.0+

### DevOps
- Docker & Docker Compose
- Git & GitHub
- GitHub Actions (CI/CD ready)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegador Web                             │
│                   (Usuario Final)                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS/HTTP
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend - React Web                        │
│                   (Puerto 5173)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Registro/Login      • Captura de imagen           │   │
│  │ • Consentimientos     • Preview                     │   │
│  │ • Dashboard           • Procesamiento con IA        │   │
│  │ • Resultados + Diagnóstico (HU 6)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API (JSON)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend - FastAPI                           │
│                   (Puerto 8000)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routers:                                             │   │
│  │  • /auth           - Registro/Login                 │   │
│  │  • /consent        - Consentimientos                │   │
│  │  • /analysis       - Análisis + Diagnóstico (HU 6)  │   │
│  │                                                      │   │
│  │ Services:                                            │   │
│  │  • inference_service.py  - YOLO inference          │   │
│  │  • diagnosis_service.py  - Diagnóstico (HU 6)      │   │
│  │                                                      │   │
│  │ Data Catalogs:                                       │   │
│  │  • conditions_catalog.py - 6 condiciones           │   │
│  │  • disclaimers.py        - Disclaimers médicos     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────┬───────────────────────────┘
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────────────┐
│  Base de Datos   │    │   Modelo YOLOv8m             │
│  SQLite/MySQL    │    │   (best.pt - 25.8M params)   │
│                  │    │   • 6 clases detectables     │
│  • app_users     │    │   • mAP50: 0.74             │
│  • skin_analyses │    │   • Inferencia: 7.9ms       │
│  • legal_docs    │    │   • Local (no API externa)  │
└──────────────────┘    └──────────────────────────────┘
```

---

## 🤖 Modelo de IA

### YOLOv8m (Medium)
- **Tipo:** Object Detection
- **Framework:** Ultralytics YOLO 8.4.42
- **Arquitectura:** YOLOv8m (Medium)
- **Parámetros:** 25,843,234 (25.8M)
- **GFLOPs:** 78.7
- **Tamaño de entrada:** 640x640 píxeles
- **Modelo final:** `backend/ml_models/best.pt`

### Entrenamiento
- **Épocas:** 300
- **Batch size:** 16
- **GPU:** Tesla T4 (14GB)
- **Dataset:** 1,799 imágenes (1,439 train + 360 val)
- **Clases:** 6 (acne, eczema, manchas, puntos-negros, resequedad, rosacea)

### Performance
| Métrica | Valor |
|---------|-------|
| mAP50-95 | 0.293 |
| mAP50 | 0.740 |
| Precision | 0.737 |
| Recall | 0.688 |
| Preprocessing | 0.2 ms |
| Inference | 7.9 ms |
| Postprocessing | 2.0 ms |

### Métricas por Clase
| Clase | mAP50-95 |
|-------|----------|
| Acné | 0.326 |
| Eczema | 0.235 |
| Manchas | 0.324 |
| Puntos negros | 0.257 |
| Resequedad | 0.377 |
| Rosácea | 0.242 |

> 📄 **Ver más:** `backend/MODELO_BEST_PT_FICHA_TECNICA.md`

---

## 📦 Requisitos Previos

### Sistema
- **OS:** Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM:** 8GB mínimo, 16GB recomendado
- **Disco:** 5GB espacio libre

### Software
- **Node.js:** 18.0+ ([descargar](https://nodejs.org/))
- **Python:** 3.12+ ([descargar](https://www.python.org/downloads/))
- **Git:** 2.0+ ([descargar](https://git-scm.com/))

### Opcional
- **Docker:** 20.0+ (para despliegue con contenedores)
- **CUDA:** 11.8+ (para GPU acceleration)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/lauritaggz/DermaCheck.git
cd DermaCheck
```

### 2. Configurar Backend

```bash
cd backend

# Crear virtual environment
python -m venv venv

# Activar venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Verificar instalación
python -c "import fastapi, ultralytics; print('✓ Backend OK')"
```

### 3. Configurar Frontend

```bash
cd ../web

# Instalar dependencias
npm install

# Verificar instalación
npm run lint
```

### 4. Obtener el Modelo de IA

> ⚠️ **El archivo `best.pt` no está en Git (132MB)**

**Opción A:** Descargar desde Google Drive (compartido internamente)
```bash
# Colocar en: backend/ml_models/best.pt
https://drive.google.com/file/d/1MNJyDRwYQiAkMlGNP6MjUEeEmCaxNgA_/view?usp=sharing
```

**Opción B:** Entrenar tu propio modelo
```bash
cd backend
python train_model.py --data dataset/data.yaml --epochs 300
```

---

## ⚙️ Configuración

### Backend: `backend/.env`

```env
# Base de datos
DATABASE_URL=sqlite:///./dermacheck.db
# DATABASE_URL=mysql+pymysql://user:password@localhost/dermacheck  # Producción

# Modelo de IA
MODEL_PATH=ml_models/best.pt

# Uploads
UPLOAD_DIR=static/uploads
MAX_FILE_SIZE_MB=10

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Seguridad
BCRYPT_ROUNDS=12
```

### Frontend: `web/.env`

```env
# API
VITE_API_BASE_URL=http://localhost:8000

# App
VITE_APP_VERSION=2.0.0
VITE_ENABLE_LOGGING=true
```

> 📄 **Ver ejemplos:** `.env.example` en cada carpeta

---

## ▶️ Ejecución

### Desarrollo

#### Terminal 1 - Backend
```bash
cd backend
uvicorn app.main:app --reload

# Servidor corriendo en: http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

#### Terminal 2 - Frontend
```bash
cd web
npm run dev

# App corriendo en: http://localhost:5173
```

### Producción

#### Con Docker Compose
```bash
# Build e inicio
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

#### Build manual
```bash
# Frontend
cd web
npm run build
npm run preview

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 📁 Estructura del Proyecto

```
DermaCheck/
├── 🌐 web/                              # Frontend React
│   ├── src/
│   │   ├── components/                  # Componentes reutilizables
│   │   ├── screens/                     # Páginas/Rutas
│   │   ├── services/                    # Servicios API
│   │   ├── context/                     # Context API
│   │   ├── hooks/                       # Custom hooks
│   │   ├── types/                       # TypeScript types
│   │   ├── constants/                   # Constantes
│   │   ├── utils/                       # Utilidades
│   │   └── App.tsx                      # Root component
│   ├── dist/                            # Build producción
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── 🐍 backend/                          # Backend FastAPI
│   ├── app/
│   │   ├── routers/                     # Endpoints API
│   │   │   ├── auth.py
│   │   │   ├── consent.py
│   │   │   ├── analysis_full.py         # HU 6
│   │   │   └── analysis_inference.py
│   │   ├── services/                    # Lógica de negocio
│   │   │   ├── inference_service.py
│   │   │   └── diagnosis_service.py     # HU 6
│   │   ├── data/                        # Catálogos médicos
│   │   │   ├── conditions_catalog.py
│   │   │   └── disclaimers.py
│   │   ├── schemas/                     # Pydantic schemas
│   │   │   ├── analysis.py
│   │   │   └── diagnosis.py             # HU 6
│   │   ├── models.py                    # SQLAlchemy models
│   │   ├── database.py                  # DB setup
│   │   ├── main.py                      # FastAPI app
│   │   └── config.py
│   ├── ml_models/
│   │   └── best.pt                      # Modelo YOLO (gitignored)
│   ├── static/
│   │   └── uploads/                     # Imágenes subidas
│   ├── tests/
│   │   └── test_analysis.py             # 17 tests
│   ├── requirements.txt
│   └── .env
│
├── 📚 docs/                             # Documentación
│   └── hu5/
│
├── 🚀 deploy/                           # Despliegue
│   └── production/
│
├── 📄 Archivos raíz
│   ├── README.md                        # Esta documentación
│   ├── ESTRUCTURA_PROYECTO.md           # Estructura detallada
│   ├── HU6_RESUMEN_EJECUTIVO.md         # Resumen HU 6
│   ├── docker-compose.yml
│   ├── docker-compose.sqlite.yml
│   └── .gitignore
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

#### Autenticación
```http
POST /auth/register
POST /auth/login
```

#### Consentimientos
```http
POST /consent/accept
```

#### Análisis Facial
```http
POST /analysis/inference              # Inferencia simple YOLO
POST /analysis/face-analyze           # Análisis completo + Diagnóstico (HU 6)
POST /analysis/upload                 # Solo subir imagen
```

### Ejemplo: Análisis con Diagnóstico (HU 6)

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/analysis/face-analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "face_image=@/path/to/image.jpg" \
  -F "user_id=123" \
  -F "conf=0.25"
```

**Response:**
```json
{
  "ok": true,
  "user_id": "123",
  "image": {
    "filename": "face_20260428_210530.jpg",
    "path": "static/uploads/123/face_20260428_210530.jpg",
    "size_bytes": 245678
  },
  "analysis": {
    "model_conf_threshold": 0.25,
    "total_detections": 5,
    "detections": [
      {
        "class_id": 0,
        "class_name": "acne",
        "confidence": 0.82,
        "bbox": [120, 150, 180, 210]
      }
    ],
    "processing_time_ms": 247.3
  },
  "diagnosis": {
    "resumen_general": "Se detectó acné en tu rostro.",
    "severidad_general": "leve",
    "requiere_evaluacion": false,
    "condiciones_detectadas": [
      {
        "id": "acne",
        "label": "Acné",
        "confianza_promedio": 0.82,
        "cantidad_detecciones": 5,
        "descripcion": "Afección cutánea caracterizada por...",
        "advertencias": ["Si persiste por más de 3 meses..."],
        "color_ui": "blue"
      }
    ],
    "disclaimer": "Este análisis es un resultado preliminar...",
    "mensaje_severidad": {
      "titulo": "Condiciones Leves Detectadas",
      "mensaje": "Se observan algunas afecciones menores...",
      "consejo": "Mantén una rutina de cuidado diaria..."
    },
    "advertencias_generales": [],
    "consejos_generales": [
      "Limpia tu rostro dos veces al día...",
      "Usa protector solar diariamente..."
    ]
  },
  "timestamp": "2026-04-28T21:05:30.123456Z"
}
```

> 📖 **Documentación completa:** `http://localhost:8000/docs` (Swagger UI)

---

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=app --cov-report=html

# Test específico
pytest tests/test_analysis.py -v

# Ver reporte HTML
open htmlcov/index.html
```

**Coverage actual:** ~85%

### Frontend

```bash
cd web

# Linter
npm run lint

# Type checking
npm run build
```

---

## 🌍 Despliegue

### Opción 1: Docker Compose (Recomendado)

```bash
# Producción con MySQL
docker-compose up -d

# Desarrollo con SQLite
docker-compose -f docker-compose.sqlite.yml up -d
```

### Opción 2: Servidor Tradicional

#### Backend (Uvicorn + Gunicorn)
```bash
cd backend
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Frontend (Nginx)
```bash
cd web
npm run build

# Servir con nginx
sudo cp -r dist/* /var/www/html/
```

> 📄 **Ver guía completa:** `web/DEPLOYMENT.md`

---

## 📊 Estado del Proyecto

### Historias de Usuario Completadas

| HU | Descripción | Estado | Rama |
|----|-------------|--------|------|
| HU 1 | Registro e inicio de sesión | ✅ | `main` |
| HU 2 | Capturar fotografía del rostro | ✅ | `main` |
| HU 3 | Cargar imagen desde galería | ✅ | `main` |
| HU 9 | Aceptar consentimientos | ✅ | `main` |
| HU 5 | Analizar afecciones cutáneas | ✅ | `HU-5` |
| HU 6 | Diagnóstico preliminar automatizado | ✅ | `HU-06` |
| HU 12 | Migración a entorno web | ✅ | `HU-12` |

### Próximas HUs (Sprint siguiente)
- [ ] HU 7: Historial de análisis
- [ ] HU 8: Exportar diagnóstico en PDF
- [ ] HU 10: Comparación de análisis
- [ ] HU 11: Notificaciones por email

---

## 🤝 Contribución

### Workflow

1. **Fork** del repositorio
2. **Crear rama** desde `main`:
   ```bash
   git checkout -b HU-XX-Descripcion
   ```
3. **Commits descriptivos:**
   ```bash
   git commit -m "feat(scope): descripción clara del cambio"
   ```
4. **Push** a tu fork
5. **Pull Request** con descripción detallada

### Convenciones

#### Commits (Conventional Commits)
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Formateo, sin cambios de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

#### Código
- **Frontend:** ESLint + Prettier
- **Backend:** Black + isort + flake8
- **TypeScript:** Strict mode
- **Python:** Type hints

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.

```
Copyright (c) 2026 DermaCheck Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 Equipo

- **Desarrollo:** Laura Tagliapietra
- **Diseño UI/UX:** Laura Tagliapietra
- **Modelo IA:** Laura Tagliapietra
- **QA:** Laura Tagliapietra

---

## 📞 Contacto

- **GitHub:** [@lauritaggz](https://github.com/lauritaggz)
- **Email:** contacto@dermacheck.com (placeholder)
- **Issues:** [GitHub Issues](https://github.com/lauritaggz/DermaCheck/issues)

---

## 🙏 Agradecimientos

- **Ultralytics** por el framework YOLO
- **FastAPI** por el excelente framework web
- **React** por la biblioteca UI
- **Tailwind CSS** por el sistema de diseño
- **Roboflow** por herramientas de dataset management

---

## ⚠️ Disclaimer Médico

**IMPORTANTE:** DermaCheck es una herramienta de orientación cosmética basada en inteligencia artificial y **NO constituye un diagnóstico médico profesional**. 

Los resultados proporcionados son preliminares y tienen fines informativos únicamente. Para condiciones persistentes, dolorosas o preocupantes, consulte presencialmente con un dermatólogo certificado.

Este software no debe ser utilizado como sustituto del juicio clínico profesional ni para tomar decisiones médicas.

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

[![Star on GitHub](https://img.shields.io/github/stars/lauritaggz/DermaCheck?style=social)](https://github.com/lauritaggz/DermaCheck)

</div>

---

**Última actualización:** Abril 28, 2026 | **Versión:** 2.0.0
