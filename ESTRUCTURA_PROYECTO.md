# 📁 Estructura del Proyecto DermaCheck

## 🎯 Vista General

DermaCheck es una **aplicación web** para análisis dermatológico con IA, compuesta por:

1. **Frontend Web** (React + Vite + TypeScript) → `web/`
2. **Backend API** (FastAPI + Python) → `backend/`

---

## 📂 Estructura Detallada

```
DermaCheck/
├── 🌐 web/                          # APLICACIÓN WEB (React + Vite)
│   ├── src/
│   │   ├── assets/                  # Imágenes y recursos
│   │   ├── components/              # Componentes UI reutilizables
│   │   │   ├── CheckboxRow.tsx
│   │   │   ├── Icons.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── ScreenContainer.tsx
│   │   │   └── TextField.tsx
│   │   ├── constants/               # Constantes y configuración
│   │   │   ├── analysisMessages.ts
│   │   │   ├── authMessages.ts
│   │   │   ├── disclaimers.ts
│   │   │   └── legalDocuments.ts
│   │   ├── context/                 # React Context API
│   │   │   └── AppContext.tsx       # Estado global (user, consent, analysis)
│   │   ├── data/                    # Catálogos de datos
│   │   │   └── recommendationCatalog.ts
│   │   ├── hooks/                   # Custom React Hooks
│   │   │   └── useOrientation.ts
│   │   ├── screens/                 # Pantallas/Rutas principales
│   │   │   ├── WelcomeScreen.tsx    # Pantalla de bienvenida
│   │   │   ├── LoginScreen.tsx      # Inicio de sesión
│   │   │   ├── RegisterScreen.tsx   # Registro
│   │   │   ├── ConsentScreen.tsx    # Aceptación de consentimientos
│   │   │   ├── HomeScreen.tsx       # Dashboard principal
│   │   │   ├── ImagePickerScreen.tsx # Selección de fuente (cámara/galería)
│   │   │   ├── CameraScreen.tsx     # Captura con cámara (getUserMedia)
│   │   │   ├── PreviewScreen.tsx    # Vista previa de imagen
│   │   │   ├── ProcessingScreen.tsx # Análisis en progreso
│   │   │   └── ResultsScreen.tsx    # Resultados + Diagnóstico (HU 6)
│   │   ├── services/                # Servicios de API
│   │   │   ├── authService.ts       # Auth (login/register)
│   │   │   ├── consentService.ts    # Consentimientos
│   │   │   └── analysisService.ts   # Análisis facial
│   │   ├── types/                   # Tipos TypeScript
│   │   │   └── index.ts             # Interfaces y tipos
│   │   ├── utils/                   # Utilidades
│   │   │   ├── api.ts               # Helper API
│   │   │   ├── apiErrors.ts         # Manejo de errores
│   │   │   └── networkErrors.ts     # Errores de red
│   │   ├── App.tsx                  # Componente raíz con Router
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Estilos Tailwind
│   ├── dist/                        # Build de producción (generado)
│   ├── node_modules/                # Dependencias (generado)
│   ├── public/                      # Assets públicos
│   ├── .env                         # Variables de entorno (gitignored)
│   ├── .env.development             # Env desarrollo
│   ├── .env.production              # Env producción
│   ├── .env.example                 # Template de variables
│   ├── package.json                 # Dependencias web
│   ├── vite.config.ts               # Configuración Vite
│   ├── tailwind.config.js           # Configuración Tailwind CSS
│   ├── postcss.config.js            # PostCSS config
│   ├── tsconfig.json                # TypeScript config
│   ├── eslint.config.js             # ESLint config
│   ├── index.html                   # HTML principal
│   ├── DEPLOYMENT.md                # Guía de despliegue
│   ├── TESTING_CHECKLIST.md         # Checklist de testing
│   ├── HU12_COMPLETION_SUMMARY.md   # Resumen HU 12
│   └── HU6_FRONTEND_COMPLETION.md   # Resumen HU 6 frontend
│
├── 🐍 backend/                      # BACKEND API (FastAPI + Python)
│   ├── app/
│   │   ├── data/                    # Catálogos médicos (HU 6)
│   │   │   ├── conditions_catalog.py    # 6 condiciones dermatológicas
│   │   │   ├── disclaimers.py           # Disclaimers médicos
│   │   │   └── __init__.py
│   │   ├── routers/                 # Endpoints API
│   │   │   ├── auth.py              # POST /auth/register, /auth/login
│   │   │   ├── consent.py           # POST /consent/accept
│   │   │   ├── analysis_inference.py    # POST /analysis/inference
│   │   │   ├── analysis_full.py         # POST /analysis/face-analyze (HU 6)
│   │   │   └── analysis_upload.py       # POST /analysis/upload
│   │   ├── schemas/                 # Schemas Pydantic
│   │   │   ├── analysis.py          # Schemas de análisis
│   │   │   ├── diagnosis.py         # Schemas de diagnóstico (HU 6)
│   │   │   └── __init__.py          # Exporta todos los schemas
│   │   ├── services/                # Lógica de negocio
│   │   │   ├── inference_service.py     # Servicio YOLO
│   │   │   └── diagnosis_service.py     # Servicio diagnóstico (HU 6)
│   │   ├── config.py                # Configuración del servidor
│   │   ├── database.py              # SQLAlchemy setup
│   │   ├── main.py                  # FastAPI app principal
│   │   ├── models.py                # Modelos DB (AppUser, SkinAnalysis, etc.)
│   │   ├── schemas.py               # Schemas legacy (auth, consent)
│   │   └── seed_legal_documents.py  # Seed documentos legales
│   ├── ml_models/
│   │   └── best.pt                  # Modelo YOLOv8m (gitignored)
│   ├── static/                      # Archivos estáticos
│   │   └── uploads/                 # Imágenes subidas
│   ├── tests/                       # Tests automatizados
│   │   └── test_analysis.py         # 17 tests pytest (HU 5)
│   ├── venv/                        # Virtual environment (gitignored)
│   ├── requirements.txt             # Dependencias Python
│   ├── dermacheck.db                # Base de datos SQLite (gitignored)
│   ├── .env                         # Variables de entorno (gitignored)
│   ├── .env.example                 # Template de variables
│   ├── HU5_COMPLETION_SUMMARY.md    # Resumen HU 5
│   ├── HU6_DIAGNOSIS_IMPLEMENTATION.md  # Resumen HU 6 backend
│   ├── MODELO_BEST_PT_FICHA_TECNICA.md  # Ficha técnica modelo
│   └── RESPUESTAS_RAPIDAS_MODELO.md     # Respuestas rápidas modelo
│
├── 📚 docs/                         # Documentación del proyecto
│   └── hu5/                         # Docs específicas de HU 5
│
├── 🚀 deploy/                       # Archivos de despliegue
│   └── production/                  # Configuración de producción
│
├── 📄 Archivos Raíz
│   ├── .gitignore                   # Archivos ignorados por Git
│   ├── .env                         # Variables de entorno global (gitignored)
│   ├── .env.example                 # Template de variables
│   ├── docker-compose.yml           # Docker para producción
│   ├── docker-compose.sqlite.yml    # Docker para desarrollo
│   ├── README.md                    # Documentación principal
│   ├── ESTRUCTURA_PROYECTO.md       # Esta documentación
│   └── HU6_RESUMEN_EJECUTIVO.md     # Resumen ejecutivo HU 6
```

---

## 🔗 Arquitectura

```
┌─────────────────┐
│   Navegador     │
│   (Usuario)     │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   React Web     │  ← Frontend (Vite + React + TypeScript)
│   (Puerto 5173) │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│   FastAPI       │  ← Backend (Python + FastAPI)
│   (Puerto 8000) │
└────────┬────────┘
         │
         ├─────────────► SQLite/MySQL (Base de datos)
         │
         └─────────────► YOLOv8m (Modelo IA - best.pt)
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend Web
- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM 7** - Enrutamiento
- **Framer Motion** - Animaciones
- **Tailwind CSS 3** - Estilos
- **TanStack Query** - Gestión de estado asíncrono

### Backend
- **Python 3.12** - Lenguaje
- **FastAPI** - Framework web
- **SQLAlchemy** - ORM
- **Pydantic** - Validación de datos
- **Ultralytics YOLO** - Modelo de IA
- **PyTorch** - Deep Learning
- **Pytest** - Testing

### Base de Datos
- **SQLite** (desarrollo)
- **MySQL** (producción)

---

## 🚀 Comandos de Desarrollo

### Backend
```bash
cd backend

# Crear virtual environment
python -m venv venv

# Activar venv (Windows)
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor de desarrollo
uvicorn app.main:app --reload

# Ejecutar tests
pytest

# Con coverage
pytest --cov=app
```

### Frontend Web
```bash
cd web

# Instalar dependencias
npm install

# Iniciar dev server
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

---

## 🌐 URLs de Desarrollo

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend Web | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8000 | 8000 |
| Swagger Docs | http://localhost:8000/docs | 8000 |
| ReDoc | http://localhost:8000/redoc | 8000 |

---

## 📡 Endpoints Principales del API

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión

### Consentimientos
- `POST /api/v1/consent/accept` - Aceptar consentimientos

### Análisis Facial
- `POST /api/v1/analysis/inference` - Inferencia simple YOLO
- `POST /api/v1/analysis/face-analyze` - Análisis completo + Diagnóstico (HU 6)
- `POST /api/v1/analysis/upload` - Subir imagen

---

## 🎯 Flujo de Usuario

1. **Bienvenida** → Usuario ve pantalla inicial
2. **Registro/Login** → Crea cuenta o inicia sesión
3. **Consentimientos** → Acepta términos y privacidad
4. **Dashboard** → Ve opciones principales
5. **Selección** → Elige cámara o galería
6. **Captura** → Toma/sube foto del rostro
7. **Preview** → Confirma la imagen
8. **Procesamiento** → IA analiza la imagen
9. **Resultados** → Ve diagnóstico con recomendaciones

---

## 📝 Variables de Entorno

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./dermacheck.db
MODEL_PATH=ml_models/best.pt
UPLOAD_DIR=static/uploads
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`web/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_VERSION=1.0.0
VITE_ENABLE_LOGGING=true
```

---

## 🔄 Estado de Ramas Git

| Rama | Descripción | Estado |
|------|-------------|--------|
| `main` / `master` | Rama principal estable | ✅ |
| `HU-12-Migracion-Web` | App web completa | ✅ |
| `HU-06-Diagnostico-Preliminar` | Backend + Frontend HU 6 | ✅ Activa |
| `HU-5-Analizar-afecciones-cutaneas` | Backend análisis | ✅ |

---

## 📊 Estado del Proyecto

| Componente | Estado | Última HU |
|------------|--------|-----------|
| Frontend Web | ✅ Funcional | HU 12 |
| Backend Auth | ✅ Funcional | HU 9 |
| Backend Análisis | ✅ Funcional | HU 5 |
| Backend Diagnóstico | ✅ Funcional | HU 6 |
| Frontend Diagnóstico | ✅ Funcional | HU 6 |
| Tests Backend | ✅ 17 tests | HU 5 |

---

## 🎯 Próximos Desarrollos

- [ ] Historial de análisis
- [ ] Exportación de diagnósticos en PDF
- [ ] Comparación de análisis previos
- [ ] Notificaciones por email
- [ ] PWA con soporte offline
- [ ] Internacionalización (i18n)

---

## 📚 Documentación Adicional

- `README.md` - Documentación general
- `web/DEPLOYMENT.md` - Guía de despliegue web
- `web/TESTING_CHECKLIST.md` - Checklist de testing
- `backend/MODELO_BEST_PT_FICHA_TECNICA.md` - Ficha técnica del modelo IA
- `backend/RESPUESTAS_RAPIDAS_MODELO.md` - FAQ del modelo
- `HU6_RESUMEN_EJECUTIVO.md` - Resumen ejecutivo HU 6

---

## 👥 Colaboración

Para contribuir al proyecto:

1. Crear una rama desde `main` con el formato `HU-XX-Descripcion`
2. Implementar cambios con commits descriptivos
3. Ejecutar tests antes de hacer push
4. Crear PR con descripción detallada
5. Esperar review y aprobación

---

**Última actualización:** Abril 28, 2026  
**Versión:** 2.0.0 (Solo Web)

---

## 📂 Estructura Detallada

```
DermaCheck/
├── 📱 src/                          # APP MÓVIL (React Native + Expo)
│   ├── components/                  # Componentes UI móvil
│   ├── constants/                   # Constantes y mensajes
│   ├── context/                     # Context API
│   ├── data/                        # Catálogos de datos
│   ├── navigation/                  # React Navigation
│   ├── screens/                     # Pantallas móvil
│   ├── services/                    # Servicios API
│   ├── types/                       # Tipos TypeScript
│   └── utils/                       # Utilidades
│
├── 🌐 web/                          # APP WEB (React + Vite) - HU 12
│   ├── src/
│   │   ├── assets/                  # Imágenes y recursos web
│   │   ├── components/              # Componentes UI web
│   │   ├── constants/               # Constantes web
│   │   ├── context/                 # Context API web
│   │   ├── data/                    # Catálogos web
│   │   ├── hooks/                   # Custom hooks (useOrientation)
│   │   ├── screens/                 # Pantallas web
│   │   │   ├── CameraScreen.tsx     # Acceso a cámara getUserMedia
│   │   │   ├── ImagePickerScreen.tsx
│   │   │   ├── ProcessingScreen.tsx # Análisis con IA
│   │   │   ├── ResultsScreen.tsx    # Diagnóstico (HU 6)
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ConsentScreen.tsx
│   │   │   ├── PreviewScreen.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   ├── services/                # Servicios API web
│   │   ├── types/                   # Tipos TypeScript web
│   │   ├── utils/                   # Utilidades web
│   │   ├── App.tsx                  # Componente raíz con Router
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Estilos Tailwind
│   ├── dist/                        # Build de producción (generado)
│   ├── node_modules/                # Dependencias web
│   ├── package.json                 # Deps web (React 19, Vite, etc.)
│   ├── vite.config.ts               # Configuración Vite
│   ├── tailwind.config.js           # Configuración Tailwind
│   ├── tsconfig.json                # TypeScript config web
│   ├── .env                         # Variables entorno desarrollo
│   ├── .env.development             # Env desarrollo
│   ├── .env.production              # Env producción
│   ├── DEPLOYMENT.md                # Guía de despliegue web
│   ├── TESTING_CHECKLIST.md         # Checklist HU 12
│   ├── HU12_COMPLETION_SUMMARY.md   # Resumen HU 12
│   └── HU6_FRONTEND_COMPLETION.md   # Implementación HU 6
│
├── 🐍 backend/                      # BACKEND API (FastAPI + Python)
│   ├── app/
│   │   ├── data/                    # Catálogos médicos (HU 6)
│   │   │   ├── conditions_catalog.py    # 6 condiciones dermatológicas
│   │   │   ├── disclaimers.py           # Disclaimers médicos
│   │   │   └── __init__.py
│   │   ├── routers/                 # Endpoints API
│   │   │   ├── auth.py              # Registro/Login
│   │   │   ├── consent.py           # Consentimientos
│   │   │   ├── analysis_inference.py    # Inferencia simple YOLO
│   │   │   ├── analysis_full.py         # Análisis completo + Diagnóstico (HU 6)
│   │   │   └── analysis_upload.py       # Subida de imágenes
│   │   ├── schemas/                 # Schemas Pydantic
│   │   │   ├── analysis.py          # Schemas de análisis
│   │   │   ├── diagnosis.py         # Schemas de diagnóstico (HU 6)
│   │   │   └── __init__.py          # Exporta todos los schemas
│   │   ├── services/                # Lógica de negocio
│   │   │   ├── inference_service.py     # Servicio YOLO
│   │   │   └── diagnosis_service.py     # Servicio diagnóstico (HU 6)
│   │   ├── config.py                # Configuración
│   │   ├── database.py              # SQLAlchemy setup
│   │   ├── main.py                  # FastAPI app principal
│   │   ├── models.py                # Modelos DB (AppUser, SkinAnalysis)
│   │   ├── schemas.py               # Schemas legacy (auth, consent)
│   │   └── seed_legal_documents.py  # Seed documentos legales
│   ├── ml_models/
│   │   └── best.pt                  # Modelo YOLOv8m (gitignored)
│   ├── static/                      # Archivos estáticos
│   │   └── uploads/                 # Imágenes subidas
│   ├── tests/                       # Tests (HU 5)
│   │   └── test_analysis.py         # 17 tests pytest
│   ├── requirements.txt             # Dependencias Python
│   ├── dermacheck.db                # Base de datos SQLite (gitignored)
│   ├── HU5_COMPLETION_SUMMARY.md    # Resumen HU 5
│   ├── HU6_DIAGNOSIS_IMPLEMENTATION.md  # Implementación HU 6
│   ├── MODELO_BEST_PT_FICHA_TECNICA.md  # Ficha técnica modelo
│   └── RESPUESTAS_RAPIDAS_MODELO.md     # Respuestas rápidas modelo
│
├── 📄 Archivos Raíz
│   ├── .env                         # Env global (gitignored)
│   ├── .env.example                 # Template env
│   ├── .gitignore                   # Archivos ignorados Git
│   ├── package.json                 # Deps móvil (React Native, Expo)
│   ├── package-lock.json
│   ├── App.tsx                      # Entry móvil
│   ├── index.ts                     # Entry móvil
│   ├── app.json                     # Config Expo
│   ├── tsconfig.json                # TS config móvil
│   ├── eas.json                     # Expo Application Services
│   ├── docker-compose.yml           # Docker para producción
│   ├── docker-compose.sqlite.yml    # Docker para desarrollo
│   ├── README.md                    # Documentación principal
│   └── HU6_RESUMEN_EJECUTIVO.md     # Resumen HU 6 completa
│
├── 📚 docs/                         # Documentación del proyecto
│   └── hu5/                         # Docs HU 5
│
├── 🚀 deploy/                       # Archivos de despliegue
│   └── production/
│
├── 🎨 assets/                       # Assets móvil
│   ├── images/
│   └── fonts/
│
└── 📦 node_modules/                 # Deps móvil (gitignored)
```

---

## 🎯 ¿Por qué hay dos `src/`?

### ✅ **Esto es CORRECTO y necesario:**

1. **`src/`** = App Móvil (React Native)
   - Para iOS y Android
   - Usa Expo
   - Componentes nativos (Camera, ImagePicker)

2. **`web/src/`** = App Web (React)
   - Para navegadores
   - Usa Vite + React
   - APIs web (getUserMedia, canvas)

**Son dos aplicaciones diferentes que comparten el mismo backend.**

---

## 🔗 Integración Backend ↔ Frontend

### Endpoints Principales:

| Endpoint | Usado por | Funcionalidad |
|----------|-----------|---------------|
| `/api/v1/auth/register` | Móvil + Web | Registro |
| `/api/v1/auth/login` | Móvil + Web | Login |
| `/api/v1/consent/accept` | Móvil + Web | Aceptar consentimientos |
| `/api/v1/analysis/inference` | Móvil | Inferencia simple YOLO |
| `/api/v1/analysis/face-analyze` | **Web** | Análisis completo + Diagnóstico (HU 6) |

---

## 📝 Archivos de Configuración

### App Móvil (React Native)
- `package.json` (raíz)
- `tsconfig.json` (raíz)
- `app.json`
- `eas.json`

### App Web (React)
- `web/package.json`
- `web/tsconfig.json`
- `web/vite.config.ts`
- `web/tailwind.config.js`

### Backend
- `backend/requirements.txt`
- `backend/app/config.py`

---

## 🛠️ Comandos Útiles

### Backend:
```bash
cd backend
uvicorn app.main:app --reload    # Dev
pytest                           # Tests
```

### App Web:
```bash
cd web
npm run dev                      # Dev
npm run build                    # Build producción
```

### App Móvil:
```bash
npm start                        # Dev Expo
npm run android                  # Android
npm run ios                      # iOS
```

---

## ✅ Todo Está Bien Organizado

La estructura actual es **correcta y sigue las mejores prácticas**:

✅ Separación clara entre móvil, web y backend  
✅ Cada aplicación con sus propias dependencias  
✅ Backend compartido por ambos frontends  
✅ Documentación completa por HU  
✅ Tests en backend  

---

## 🔄 Ramas Git Activas

- `HU-12-Migracion-Web` → App web completa
- `HU-06-Diagnostico-Preliminar` → Backend + Frontend HU 6 (activa)
- `HU-5-Analizar-afecciones-cutaneas` → Backend análisis

---

## 📊 Estado Actual del Proyecto

| Componente | Estado | Rama |
|------------|--------|------|
| App Móvil | ✅ Funcional | main/master |
| App Web | ✅ Funcional | HU-12 |
| Backend Auth | ✅ Funcional | main |
| Backend Análisis (HU 5) | ✅ Funcional | HU-5 |
| Backend Diagnóstico (HU 6) | ✅ Funcional | HU-06 |
| Frontend Diagnóstico (HU 6) | ✅ Funcional | HU-06 |

---

## 🎯 Próximos Sprints

La estructura está preparada para:
- Historial de análisis (nueva HU)
- Exportación PDF
- Comparación de análisis
- Notificaciones push (móvil)
- PWA offline (web)
