# DermaCheck

Plataforma web de análisis dermatológico facial mediante inteligencia artificial. Utiliza Deep Learning (YOLOv8m) para detectar y analizar afecciones cutáneas, proporcionando diagnósticos preliminares estructurados.

## Características

- Sistema de autenticación y registro seguro
- Captura de imágenes desde cámara web o galería
- Detección de 6 afecciones cutáneas: acné, eczema, manchas, puntos negros, resequedad y rosácea
- Diagnóstico preliminar automatizado con descripción médica
- Interfaz responsive y moderna

## Tecnologías

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- React Router DOM
- Tailwind CSS
- Framer Motion

### Backend
- Python 3.12+
- FastAPI
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- PyTorch + Ultralytics YOLO
- OpenCV
- Pillow
- bcrypt

### Base de Datos
- SQLite (desarrollo)
- MySQL 8.0+ (producción)

### DevOps
- Docker & Docker Compose

## Modelo de IA

- **Arquitectura:** YOLOv8m (Medium)
- **Parámetros:** 25.8M
- **Dataset:** 1,799 imágenes
- **mAP50:** 0.74
- **Inferencia:** ~8ms por imagen
- **Clases:** 6 afecciones dermatológicas

## Requisitos Previos

- Node.js 18.0+
- Python 3.12+
- Git
- 8GB RAM mínimo
- 5GB espacio en disco

## Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/lauritaggz/DermaCheck.git
cd DermaCheck
```

### 2. Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd web
npm install
```

### 4. Modelo de IA

El archivo `best.pt` (132MB) no está en Git. Colócalo en `backend/ml_models/best.pt`.

## Configuración

### Backend: `backend/.env`

```env
DATABASE_URL=sqlite:///./dermacheck.db
MODEL_PATH=ml_models/best.pt
UPLOAD_DIR=static/uploads
MAX_FILE_SIZE_MB=10
CORS_ORIGINS=http://localhost:5173
BCRYPT_ROUNDS=12
```

### Frontend: `web/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Ejecución

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload
# http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
# http://localhost:5173
```

### Producción con Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## Estructura del Proyecto

```
DermaCheck/
├── web/                          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── context/
│   │   └── types/
│   └── package.json
│
├── backend/                      # Backend FastAPI
│   ├── app/
│   │   ├── routers/             # Endpoints
│   │   ├── services/            # Lógica de negocio
│   │   ├── data/                # Catálogos médicos
│   │   ├── models.py            # DB models
│   │   └── main.py
│   ├── ml_models/
│   │   └── best.pt              # Modelo YOLO
│   ├── tests/
│   └── requirements.txt
│
└── docker-compose.yml
```

## API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Consentimientos
- `POST /consent/accept` - Aceptar consentimientos

### Análisis
- `POST /analysis/inference` - Inferencia YOLO simple
- `POST /analysis/face-analyze` - Análisis completo + Diagnóstico
- `POST /analysis/upload` - Subir imagen

### Ejemplo: Análisis Completo

```bash
curl -X POST "http://localhost:8000/api/v1/analysis/face-analyze" \
  -F "face_image=@imagen.jpg" \
  -F "user_id=123" \
  -F "conf=0.25"
```

**Respuesta:**
```json
{
  "ok": true,
  "analysis": {
    "total_detections": 5,
    "detections": [...]
  },
  "diagnosis": {
    "resumen_general": "Se detectó acné en tu rostro.",
    "severidad_general": "leve",
    "condiciones_detectadas": [...],
    "consejos_generales": [...]
  }
}
```

## Testing

```bash
cd backend
pytest --cov=app
```

## Despliegue

### Docker Compose (Recomendado)
```bash
docker-compose up -d
```

### Manual

**Backend:**
```bash
cd backend
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Frontend:**
```bash
cd web
npm run build
# Servir carpeta dist/ con Nginx
```

## Disclaimer Médico

**IMPORTANTE:** DermaCheck es una herramienta de orientación cosmética basada en IA y **NO constituye un diagnóstico médico profesional**.

Los resultados son preliminares y tienen fines informativos únicamente. Para condiciones persistentes, dolorosas o preocupantes, consulte con un dermatólogo certificado.

Este software no debe ser utilizado como sustituto del juicio clínico profesional.

---

**Versión:** 2.0.0 | **Última actualización:** Abril 2026
