# API FastAPI — imagen de producción / despliegue
FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=America/Santiago

# Instalar dependencias del sistema para PyMySQL y zona horaria
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    libgl1 \
    libglib2.0-0 \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Navegador Chromium + dependencias del sistema para el scraper de productos (Playwright)
RUN playwright install --with-deps chromium

COPY app ./app
COPY ml_models ./ml_models

# Crear directorios necesarios
RUN mkdir -p /app/static/uploads /app/storage/training_images /app/storage/job_queue

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
