#!/usr/bin/env bash
# Renueva el certificado Let's Encrypt y recarga el contenedor web.
# Pensado para ejecutarse por cron (root) en la instancia EC2.
#
#   sudo crontab -e
#   0 3 * * 1 /home/ec2-user/DermaCheck/deploy/ec2/renew-cert.sh >> /var/log/dermacheck-renew.log 2>&1
set -euo pipefail

REPO="/home/ec2-user/DermaCheck"
DOMAIN="dermacheck2.duckdns.org"
COMPOSE="docker compose --env-file ${REPO}/deploy/ec2/.env -f ${REPO}/deploy/ec2/docker-compose.ec2.yml"

cd "$REPO"

echo "==> $(date) Renovando certificado para ${DOMAIN}"

# Liberar el puerto 80 (lo usa el contenedor web) para el desafío HTTP-01
$COMPOSE stop web

# Renovar (solo actúa si faltan <30 días para expirar)
docker run --rm -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot renew --standalone --quiet || true

# Copiar certificados renovados a la carpeta que monta nginx
cp -L "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${REPO}/deploy/ec2/certs/fullchain.pem"
cp -L "/etc/letsencrypt/live/${DOMAIN}/privkey.pem"   "${REPO}/deploy/ec2/certs/privkey.pem"
chmod 644 "${REPO}/deploy/ec2/certs/fullchain.pem"
chmod 640 "${REPO}/deploy/ec2/certs/privkey.pem"

# Levantar de nuevo el web con el certificado actualizado
$COMPOSE up -d web

echo "==> $(date) Renovación finalizada"
