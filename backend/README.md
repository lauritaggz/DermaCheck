# DermaCheck API (FastAPI)

Backend del análisis facial dermatológico: inferencia YOLO, cola de trabajos, consentimiento de tótem, correo de resumen y búsqueda de productos.

## Arranque local

### SQLite (recomendado para desarrollo)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

- Salud: `GET http://localhost:8001/health`
- Swagger: `http://localhost:8001/docs`
- La primera ejecución crea `dermacheck.db` y las tablas (archivo en `.gitignore`).
- SQLite usa modo **WAL** para mejor concurrencia durante la cola de análisis.

### MySQL (producción / Docker)

```env
DATABASE_URL=mysql+pymysql://usuario:clave@127.0.0.1:3306/dermacheck?charset=utf8mb4
```

O usa `docker compose up` desde la raíz del repo (ver README principal).

## Cola de análisis

Al iniciar, el lifespan de FastAPI arranca un worker asyncio que procesa jobs de inferencia en un thread pool.

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ANALYSIS_QUEUE_MAX_SIZE` | 10 | Máximo jobs en cola (503 si lleno) |
| `ANALYSIS_MAX_CONCURRENT` | 1 | Inferencias simultáneas |
| `ANALYSIS_JOB_TTL_SECONDS` | 3600 | Expiración de jobs completados |
| `ANALYSIS_JOB_POLL_INTERVAL_HINT` | 1.5 | Hint de polling para el frontend |

**Endpoints:**

- `POST /api/v1/analysis/jobs` — encola análisis (202 + `job_id`)
- `GET /api/v1/analysis/jobs/{job_id}` — estado y resultado
- `GET /api/v1/analysis/jobs/health` — métricas de cola

**Importante:** ejecutar **un solo proceso** Uvicorn. No uses `gunicorn --workers 4` con esta cola in-memory.

Los endpoints legacy `face-analyze-total` y `face-analyze-total-double` delegan internamente a la misma cola.

## Flujo tótem

1. `GET /api/v1/kiosk/config` — obtiene `user_id` técnico del tótem  
2. `POST /api/v1/consents/accept` — registra consentimiento con `session_id` anónimo  
3. `POST /api/v1/analysis/jobs` — encola 1 imagen (`face_image`) o 2 (`face_image_1`, `face_image_2`)  
4. Polling hasta `completed`  
5. Opcional: `POST /api/v1/analysis/send-summary-email`

Campos de consentimiento en análisis (multipart):

- `consent_accepted`, `privacy_accepted` (obligatorios)
- `allow_training_storage` (opcional; si `false`, procesamiento efímero sin guardar imagen)
- `legal_version`, `session_id`

## Correo de resumen

`POST /api/v1/analysis/send-summary-email`

- Envía HTML + texto plano con todas las afecciones detectadas, recomendaciones y componentes sugeridos
- **No persiste** el correo del destinatario
- Fecha/hora en zona `TZ` (default `America/Santiago`)
- Rate limit por IP/cliente

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=resend          # o smtp
EMAIL_API_KEY=re_xxxxxxxx
EMAIL_FROM=DermaCheck <no-reply@dermacheck.cl>
EMAIL_RATE_LIMIT_PER_MINUTE=5
```

Ver `.env.example` para configuración SMTP.

## Búsqueda de productos

`POST /api/products/search`

Scraper de FarmaCompara (Playwright). El frontend construye queries desde ingredientes del catálogo educativo (`web/src/data/recommendationCatalog.ts`, referencia DermNet).

```env
PRODUCT_SEARCH_CACHE_TTL_HOURS=12
PRODUCT_SEARCH_MAX_RESULTS=5
PRODUCT_SEARCH_ENABLE_PLAYWRIGHT=true
```

## Configuración de inferencia

Los umbrales de confianza YOLO se definen solo en el servidor (`app/config.py` vía `.env`). El cliente **no** puede enviarlos en formularios; se ignoran si llegaran por compatibilidad.

```env
DERMACHECK_DERM_CONF=0.25
DERMACHECK_EXPRESSION_LINES_CONF=0.65
```

Tras cambiar `.env`, reinicia uvicorn (o el contenedor `api` en producción). Para verificar los valores activos: `GET /api/v1/kiosk/config` → `inference_thresholds`, o `model_conf_threshold` en la respuesta de análisis.

## Zona horaria

```env
TZ=America/Santiago
```

Usada en correos (`format_datetime_local`) y recomendada en Docker para logs coherentes. Las marcas de tiempo en BD se guardan en UTC.

## Endpoints de referencia

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/health` | Salud del servicio |
| GET | `/api/v1/kiosk/config` | User ID del tótem y umbrales YOLO activos |
| POST | `/api/v1/consents/accept` | Consentimiento tótem |
| POST | `/api/v1/analysis/jobs` | Encolar análisis |
| GET | `/api/v1/analysis/jobs/{id}` | Estado del job |
| POST | `/api/v1/analysis/send-summary-email` | Resumen por correo |
| POST | `/api/v1/analysis/face-analyze-total` | Legacy síncrono (usa cola) |
| POST | `/api/v1/analysis/face-analyze-total-double` | Legacy doble foto |
| POST | `/api/products/search` | Productos FarmaCompara |
| POST | `/api/v1/auth/register` | Registro (legacy) |
| POST | `/api/v1/auth/login` | Login (legacy) |

## Tests

```bash
cd backend
./venv/bin/pytest tests/test_analysis_job_queue.py tests/test_email.py tests/test_analysis.py -v
```

## Almacenamiento

| Ruta | Contenido |
|------|-----------|
| `static/uploads/` | Capturas públicas montadas en `/uploads` |
| `storage/training_images/` | Imágenes solo si `allow_training_storage=true` |
| `storage/job_queue/{job_id}/` | Temporales de la cola (se borran al terminar) |

## Modelo YOLO

Coloca `best.pt` en `backend/ml_models/best.pt` (no versionado en Git).  
Documentación técnica: `MODELO_BEST_PT_FICHA_TECNICA.md`.

## Docker

Imagen en `backend/Dockerfile`: incluye `tzdata`, `TZ=America/Santiago` y directorios `storage/`.  
Compose raíz y `deploy/production/` montan volumen `storage/` persistente.

```bash
# Desde la raíz del repo
docker compose up --build -d
```

---

Documentación general del monorepo: [README.md](../README.md)
