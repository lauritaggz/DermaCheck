# DermaCheck

Plataforma web de análisis dermatológico facial con IA (YOLOv8), orientada a **tótem/tablet** en farmacias y centros estéticos. El usuario final no necesita registrarse: flujo anónimo con consentimiento, captura guiada, cola de análisis y resultados con recomendaciones y productos sugeridos.

## Características principales (Sprint 4)

- **Flujo tótem/kiosco**: bienvenida comercial, consentimiento (informado + privacidad obligatorios; entrenamiento opcional), captura y resultados sin login de usuario final
- **Multicaptura**: 1 foto de frente centrada **o** 2 fotos laterales (un lado y el otro)
- **Cola de análisis**: encolado con polling; el servidor sigue respondiendo mientras YOLO procesa en segundo plano
- **Correo anónimo**: envío opcional del resumen al correo del usuario **sin guardar el email**
- **Productos dermocosméticos**: búsqueda vía scraper (FarmaCompara) según ingredientes del catálogo educativo (referencia DermNet)
- **Detección combinada**: afecciones cutáneas + líneas de expresión (modelos YOLO)
- Autenticación registro/login (legacy, no usada en el flujo tótem)

## Tecnologías

| Capa | Stack |
|------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Python 3.12, FastAPI, Uvicorn, SQLAlchemy |
| IA | PyTorch, Ultralytics YOLO |
| BD dev | SQLite (+ WAL) |
| BD prod | MySQL 8.0 (Docker Compose) |
| Frontend prod | Netlify |
| Backend prod | Docker |

## Requisitos

- Node.js 20+
- Python 3.12+
- Git
- ~8 GB RAM (inferencia YOLO)
- Modelo `best.pt` (~132 MB) — ver sección [Modelo de IA](#modelo-de-ia)

## Instalación rápida (desarrollo)

### 1. Clonar e instalar

```bash
git clone https://github.com/lauritaggz/DermaCheck.git
cd DermaCheck

# Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Frontend
cd ../web
npm install
cp .env.example .env   # si existe; o crear con VITE_API_BASE_URL
```

### 2. Modelo de IA

Descarga `best.pt` y colócalo en `backend/ml_models/best.pt`  
(enlace en documentación interna / Google Drive del equipo).

### 3. Ejecutar

**Terminal 1 — Backend** (puerto 8000 o 8001 según prefieras):

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 — Frontend**:

```bash
cd web
npm run dev
# http://localhost:5173
```

Configura `web/.env`:

```env
VITE_API_BASE_URL=http://localhost:8001
```

Swagger: `http://localhost:8001/docs`

## Configuración (`backend/.env`)

Copia `backend/.env.example` → `backend/.env`. Variables relevantes:

```env
DATABASE_URL=sqlite:///./dermacheck.db
TZ=America/Santiago

# Cola de análisis (1 proceso uvicorn — no usar multi-worker sin Redis)
# ANALYSIS_QUEUE_MAX_SIZE=10
# ANALYSIS_MAX_CONCURRENT=1

# Correo (POST /api/v1/analysis/send-summary-email)
# EMAIL_ENABLED=true
# EMAIL_PROVIDER=resend
# EMAIL_API_KEY=re_xxxxxxxx

# Scraper de productos
# PRODUCT_SEARCH_ENABLE_PLAYWRIGHT=true
```

Ver `backend/.env.example` para SMTP, cola y scraper completos.

## Flujo del tótem (frontend)

1. **Welcome** — landing comercial B2B  
2. **Consentimiento** — 3 checkboxes; sesión anónima (`session_id`)  
3. **Instrucciones** → **Captura** (1 frontal o 2 laterales)  
4. **Procesamiento** — cola con posición visible  
5. **Resultados** — diagnóstico, recomendaciones, productos, envío opcional por correo  

«Nuevo análisis» reinicia la sesión del tótem (sin persistir consentimiento en `localStorage`).

## API principal

**Base:** `/api/v1`

| Área | Endpoints |
|------|-----------|
| Tótem | `GET /kiosk/config` |
| Consentimiento | `POST /consents/accept` |
| Análisis (cola) | `POST /analysis/jobs` → 202 + `job_id`; `GET /analysis/jobs/{id}` |
| Análisis (legacy sync) | `POST /analysis/face-analyze-total`, `POST /analysis/face-analyze-total-double` |
| Correo | `POST /analysis/send-summary-email` |
| Productos | `POST /api/products/search` |
| Salud | `GET /health`, `GET /analysis/jobs/health` |

### Ejemplo: encolar análisis

```bash
curl -X POST "http://localhost:8001/api/v1/analysis/jobs" \
  -F "user_id=1" \
  -F "face_image=@captura.jpg" \
  -F "consent_accepted=true" \
  -F "privacy_accepted=true" \
  -F "allow_training_storage=false" \
  -F "legal_version=2.0" \
  -F "session_id=sess-ejemplo-001"
```

Respuesta `202`: `{ "job_id", "status", "position", "poll_interval_seconds" }`.  
Consultar estado: `GET /api/v1/analysis/jobs/{job_id}` hasta `status: completed`.

## Docker Compose (local con MySQL)

```bash
docker compose up --build -d
# API: http://localhost:8001
# Web: http://localhost:3005
```

Todos los servicios usan `TZ=America/Santiago`. La cola de análisis requiere **un solo worker** Uvicorn en el contenedor `api`.

Producción en servidor: ver `deploy/production/docker-compose.prod.yml` y `deploy/production/env.production.example`.

## Frontend en Netlify

El build se configura en `netlify.toml`. Variable en Netlify:

```env
VITE_API_BASE_URL=https://tu-backend-publico
```

## Tests

```bash
cd backend
./venv/bin/pytest tests/ -v
```

Incluye tests de cola (`test_analysis_job_queue.py`), correo (`test_email.py`) y análisis.

## Estructura del proyecto

```
DermaCheck/
├── web/                    # Frontend React (tótem)
├── backend/
│   ├── app/
│   │   ├── routers/        # analysis_jobs, analysis_email, consent, kiosk…
│   │   ├── services/       # cola, email, scraper, inferencia
│   │   └── main.py
│   ├── ml_models/best.pt   # no versionado
│   └── tests/
├── docker-compose.yml
├── deploy/production/
└── netlify.toml
```

## Cola de análisis (importante)

- Cola **in-memory** en el mismo proceso FastAPI  
- **No** usar Gunicorn con varios workers sin Redis/Celery (cada worker tendría su propia cola)  
- Inferencia YOLO serializada con lock global (`ANALYSIS_MAX_CONCURRENT=1` por defecto)  
- Archivos temporales de jobs en `backend/storage/job_queue/` (se eliminan al completar)

## Disclaimer médico

DermaCheck es una herramienta de **orientación** basada en IA. **No** sustituye el diagnóstico de un dermatólogo. Ante dudas, dolor o empeoramiento, consulte a un profesional de salud.

---

**Versión documentada:** Sprint 4 · Junio 2026
