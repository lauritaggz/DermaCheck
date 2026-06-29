# Despliegue en AWS EC2 — DermaCheck

Guía para publicar **API + MySQL + Web** en la instancia entregada por el curso.

## Datos de la instancia (referencia)

| Parámetro | Valor |
|-----------|--------|
| Instancia | `i-0d1b2209a7a5df2fb` |
| Usuario SSH | `ec2-user` |
| DNS público | `ec2-34-230-43-210.compute-1.amazonaws.com` |
| IP pública | `34.230.43.210` |
| Clave privada | `dermacheck.pem` |

## Requisitos previos

1. Archivo **`dermacheck.pem`** en la raíz del proyecto (no se sube a Git).
2. **Security Group** de la instancia con puertos abiertos:
   - `22` (SSH)
   - `80` (frontend web)
   - `8000` (API, opcional pero útil para Swagger y Netlify)
3. Modelos YOLO en `backend/ml_models/`:
   - `best.pt` (obligatorio)
   - `best_wrinkle_yolov8m.pt` (líneas de expresión)

## Paso 1 — Conectar por SSH (desde tu PC)

### Windows (PowerShell o Git Bash)

Coloca `dermacheck.pem` en la raíz del repo y ajusta permisos (Git Bash):

```bash
chmod 400 dermacheck.pem
ssh -i "dermacheck.pem" ec2-user@ec2-34-230-43-210.compute-1.amazonaws.com
```

En PowerShell, si SSH rechaza la clave:

```powershell
icacls "dermacheck.pem" /inheritance:r
icacls "dermacheck.pem" /grant:r "$($env:USERNAME):(R)"
ssh -i "dermacheck.pem" ec2-user@ec2-34-230-43-210.compute-1.amazonaws.com
```

## Paso 2 — Preparar el servidor (primera vez)

Dentro de la instancia EC2:

```bash
sudo dnf install -y git   # Amazon Linux
# o: sudo apt install -y git   # Ubuntu

git clone https://github.com/lauritaggz/DermaCheck.git
cd DermaCheck

chmod +x deploy/ec2/bootstrap.sh
./deploy/ec2/bootstrap.sh
```

Si Docker se acaba de instalar, **sal y vuelve a entrar por SSH**, luego:

```bash
cd ~/DermaCheck
cp deploy/ec2/env.ec2.example deploy/ec2/.env
nano deploy/ec2/.env   # contraseñas MySQL, SMTP, CORS
```

## Paso 3 — Subir modelos desde tu PC

Desde tu máquina local (otra terminal), en la raíz del repo:

```bash
scp -i "dermacheck.pem" backend/ml_models/best.pt ec2-user@ec2-34-230-43-210.compute-1.amazonaws.com:~/DermaCheck/backend/ml_models/
scp -i "dermacheck.pem" backend/ml_models/best_wrinkle_yolov8m.pt ec2-user@ec2-34-230-43-210.compute-1.amazonaws.com:~/DermaCheck/backend/ml_models/
```

## Paso 4 — Arrancar en producción

En el servidor:

```bash
cd ~/DermaCheck
./deploy/ec2/bootstrap.sh
```

O manualmente:

```bash
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml up -d --build
```

## Paso 5 — Verificar

```bash
curl -s http://127.0.0.1:8000/health
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml ps
```

Desde el navegador:

- **App web (HTTPS):** https://ec2-34-230-43-210.compute-1.amazonaws.com
- **API / Swagger:** https://ec2-34-230-43-210.compute-1.amazonaws.com:8000/docs

> **Certificado autofirmado:** la primera vez Chrome mostrará «La conexión no es privada». Pulsa **Avanzado** → **Acceder al sitio**. Es normal en EC2 sin dominio propio; es necesario para que la **cámara** funcione en el navegador.

## Frontend en Netlify (opcional)

Si el frontend sigue en Netlify, configura en Netlify → Environment variables:

```env
VITE_API_BASE_URL=http://ec2-34-230-43-210.compute-1.amazonaws.com:8000
```

Y en `deploy/ec2/.env` asegúrate de incluir la URL de Netlify en `CORS_ORIGINS`.

## Actualizar tras un `git pull`

```bash
cd ~/DermaCheck
git pull
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml up -d --build
```

## Comandos útiles

```bash
# Logs del API
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml logs -f api

# Parar todo
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml down
```

## Notas

- Los datos persisten en `deploy/ec2/data/` (MySQL, uploads, storage).
- El build del API puede tardar varios minutos (PyTorch + YOLO).
- La instancia necesita ~8 GB RAM recomendados para inferencia YOLO.
