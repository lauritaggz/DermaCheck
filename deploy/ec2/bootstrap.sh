#!/usr/bin/env bash
# Instala Docker en Amazon Linux / Ubuntu y prepara carpetas de datos.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "==> Instalando Docker (si no está)..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
  echo ""
  echo "Docker instalado. Cierra sesión SSH (exit) y vuelve a entrar para usar docker sin sudo."
  exit 0
fi

echo "==> Docker ya instalado: $(docker --version)"
docker compose version

echo "==> Creando carpetas de datos persistentes..."
mkdir -p deploy/ec2/data/mysql deploy/ec2/data/uploads deploy/ec2/data/storage
mkdir -p backend/ml_models

if [[ ! -f deploy/ec2/.env ]]; then
  cp deploy/ec2/env.ec2.example deploy/ec2/.env
  echo ""
  echo "Creado deploy/ec2/.env — edítalo con contraseñas y credenciales antes de arrancar:"
  echo "  nano deploy/ec2/.env"
  exit 0
fi

if [[ ! -f backend/ml_models/best.pt ]]; then
  echo ""
  echo "AVISO: falta backend/ml_models/best.pt (~50 MB). Súbelo desde tu PC con scp antes del build."
  exit 1
fi

echo "==> Arrancando stack EC2..."
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml up -d --build

echo ""
echo "==> Estado:"
docker compose --env-file deploy/ec2/.env -f deploy/ec2/docker-compose.ec2.yml ps

echo ""
echo "Comprueba salud del API:"
echo "  curl -s http://127.0.0.1:8000/health"
