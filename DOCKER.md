# Docker Setup - DermaCheck

## Configuraciones Disponibles

### 1. docker-compose.yml (MySQL - Producción)
Configuración principal con MySQL para entorno de producción.

**Servicios:**
- `db`: MySQL 8.0
- `api`: Backend FastAPI
- `web`: Frontend React/Vite + Nginx

### 2. docker-compose.sqlite.yml (Desarrollo)
Configuración ligera con SQLite para desarrollo rápido.

## Uso Rápido

### Iniciar con MySQL (Producción)
```bash
# Construir e iniciar todos los servicios
docker compose up --build -d

# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

### Iniciar con SQLite (Desarrollo)
```bash
docker compose -f docker-compose.sqlite.yml up --build -d
```

## URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación web |
| Backend API | http://localhost:8000 | API REST |
| API Docs | http://localhost:8000/docs | Swagger UI interactivo |
| Redoc | http://localhost:8000/redoc | Documentación alternativa |

## Variables de Entorno

### Puertos Personalizados
Puedes cambiar los puertos usando variables de entorno:

```bash
# Cambiar puerto del frontend a 3001
WEB_HOST_PORT=3001 docker compose up -d

# Cambiar puerto del backend a 8001
API_HOST_PORT=8001 docker compose up -d

# Cambiar ambos
WEB_HOST_PORT=3001 API_HOST_PORT=8001 docker compose up -d
```

O crear un archivo `.env`:
```env
WEB_HOST_PORT=3000
API_HOST_PORT=8000
```

## Requisitos

### Antes de ejecutar Docker Compose:

1. **Modelo de IA requerido:**
   - Descargar `best.pt` (132MB) del [Google Drive](https://drive.google.com/file/d/1MNJyDRwYQiAkMlGNP6MjUEeEmCaxNgA_/view?usp=sharing)
   - Colocar en: `backend/ml_models/best.pt`

2. **Docker instalado:**
   - Docker Desktop (Windows/Mac)
   - Docker Engine + Docker Compose (Linux)

3. **Recursos mínimos:**
   - 4GB RAM disponible
   - 5GB espacio en disco
   - Puerto 3000 y 8000 libres (o personalizados)

## Gestión de Datos

### Volúmenes Persistentes

El sistema crea 2 volúmenes Docker persistentes:

- `mysql_data`: Base de datos MySQL
- `face_uploads`: Imágenes subidas por usuarios

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect dermacheck_mysql_data

# Hacer backup de la base de datos
docker exec dermacheck-db-1 mysqldump -u dermacheck -pdermacheck_change_in_production dermacheck > backup.sql

# Restaurar backup
docker exec -i dermacheck-db-1 mysql -u dermacheck -pdermacheck_change_in_production dermacheck < backup.sql
```

### Limpiar Datos
```bash
# Eliminar contenedores y volúmenes
docker compose down -v

# Limpiar sistema Docker completo (CUIDADO!)
docker system prune -a --volumes
```

## Troubleshooting

### Problema: "Port already in use"
```bash
# Cambiar puertos
WEB_HOST_PORT=3001 API_HOST_PORT=8001 docker compose up -d

# O detener el servicio que usa el puerto
lsof -ti:3000 | xargs kill  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Problema: "Cannot connect to MySQL"
```bash
# Ver logs de MySQL
docker compose logs db

# Verificar health check
docker inspect dermacheck-db-1 | grep -A 10 Health

# Reiniciar solo MySQL
docker compose restart db
```

### Problema: "Model file not found"
```bash
# Verificar que best.pt existe
ls -lh backend/ml_models/best.pt

# El archivo debe ser ~132MB
```

### Problema: "Frontend shows blank page"
```bash
# Verificar logs del frontend
docker compose logs web

# Reconstruir con variables correctas
docker compose build --no-cache web
docker compose up -d web
```

## Desarrollo con Docker

### Reconstruir solo un servicio
```bash
# Reconstruir solo el backend
docker compose build api
docker compose up -d api

# Reconstruir solo el frontend
docker compose build web
docker compose up -d web
```

### Ejecutar comandos dentro de contenedores
```bash
# Acceder a shell del backend
docker compose exec api /bin/bash

# Ejecutar tests
docker compose exec api pytest

# Acceder a MySQL
docker compose exec db mysql -u dermacheck -p

# Ver estructura de tablas
docker compose exec db mysql -u dermacheck -pdermacheck_change_in_production -e "USE dermacheck; SHOW TABLES;"
```

### Monitoreo en tiempo real
```bash
# Ver uso de recursos
docker stats

# Seguir logs de todos los servicios
docker compose logs -f

# Solo errores
docker compose logs --tail=50 | grep ERROR
```

## Seguridad en Producción

### IMPORTANTE: Cambiar credenciales antes de exponer a internet

Editar `docker-compose.yml`:
```yaml
environment:
  MYSQL_PASSWORD: TU_PASSWORD_SEGURO_AQUI
  MYSQL_ROOT_PASSWORD: TU_ROOT_PASSWORD_AQUI
  DATABASE_URL: mysql+pymysql://dermacheck:TU_PASSWORD_SEGURO_AQUI@db:3306/dermacheck?charset=utf8mb4
```

### Recomendaciones adicionales:
- [ ] Usar HTTPS con certificados SSL (Nginx + Let's Encrypt)
- [ ] Configurar firewall (solo puertos 80/443 abiertos)
- [ ] Limitar tasa de peticiones (rate limiting)
- [ ] Implementar backups automáticos
- [ ] Usar secrets de Docker para credenciales
- [ ] Configurar logs centralizados

## Despliegue en Producción

### Opción 1: VPS/VM (DigitalOcean, AWS EC2, etc.)
```bash
# Clonar repo
git clone https://github.com/lauritaggz/DermaCheck.git
cd DermaCheck

# Descargar modelo
# ... colocar best.pt en backend/ml_models/

# Configurar variables de producción
nano docker-compose.yml  # Cambiar passwords

# Iniciar
docker compose up -d

# Verificar
docker compose ps
curl http://localhost:8000/health
```

### Opción 2: Docker Swarm (Alta disponibilidad)
```bash
docker swarm init
docker stack deploy -c docker-compose.yml dermacheck
```

### Opción 3: Kubernetes
Ver archivos en `/deploy/kubernetes/` (si existen).

## Health Checks

Todos los servicios incluyen health checks:

```bash
# Ver estado de salud
docker compose ps

# Detalle de un servicio
docker inspect dermacheck-api-1 | grep -A 20 Health
```

Los servicios se reinician automáticamente si fallan los health checks.

## Actualización

```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y actualizar
docker compose up --build -d

# Verificar que todo funciona
docker compose ps
docker compose logs -f
```

---

**Última actualización:** Mayo 2026
