# 📁 Estructura del Proyecto DermaCheck

## 🎯 Vista General

Este proyecto contiene **tres aplicaciones distintas**:

1. **App Móvil** (React Native con Expo) → `src/`
2. **App Web** (React con Vite) → `web/src/`
3. **Backend API** (FastAPI con Python) → `backend/`

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
