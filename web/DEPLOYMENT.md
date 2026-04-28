# 🚀 Guía de Despliegue - DermaCheck Web

Esta guía detalla los pasos para desplegar la aplicación web DermaCheck en diferentes entornos, con enfoque especial en tótems y kioscos comerciales.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Build de Producción](#build-de-producción)
4. [Despliegue en Servidor Web](#despliegue-en-servidor-web)
5. [Despliegue en Tótems/Kioscos](#despliegue-en-tótemskioscos)
6. [Configuración PWA](#configuración-pwa)
7. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Necesario
- **Node.js** versión 18.x o superior
- **npm** versión 9.x o superior
- **Git** para control de versiones

### Infraestructura Backend
- Servidor FastAPI corriendo con el modelo YOLO
- Endpoint `/api/v1/analysis/inference` accesible
- Certificado SSL válido (para producción)

### Hardware para Tótems
- **Procesador**: Intel i3 o superior (o equivalente AMD)
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Almacenamiento**: Mínimo 128GB SSD
- **Pantalla**: Resolución mínima 1080p
- **Cámara**: Webcam HD (720p o superior) con driver compatible
- **Conectividad**: Ethernet (recomendado) o WiFi estable

---

## ⚙️ Configuración de Variables de Entorno

### 1. Crear archivo `.env` basado en el entorno

#### Para Desarrollo Local:
```bash
cp .env.development .env
```

#### Para Producción:
```bash
cp .env.production .env
```

### 2. Configurar URL del Backend

Edita el archivo `.env` y actualiza:

```env
# Producción (con SSL)
VITE_API_BASE_URL=https://api.dermacheck.com

# Desarrollo local
VITE_API_BASE_URL=http://localhost:8000

# Red local (tótem en red interna)
VITE_API_BASE_URL=http://192.168.1.100:8000
```

### 3. Variables Importantes

```env
# Versión de la aplicación
VITE_APP_VERSION=1.0.0

# Entorno
VITE_ENV=production

# Timeout para análisis IA (ajustar según rendimiento del servidor)
VITE_API_TIMEOUT=30000

# Nivel de logs (usar 'error' en producción)
VITE_LOG_LEVEL=error
```

---

## 🏗️ Build de Producción

### 1. Instalar Dependencias

```bash
cd web
npm install --production
```

### 2. Ejecutar Build

```bash
npm run build
```

Esto generará la carpeta `dist/` con los archivos optimizados.

### 3. Verificar Build

```bash
npm run preview
```

Abre `http://localhost:4173` para verificar la versión de producción localmente.

### 4. Métricas Esperadas

- **Tamaño del bundle**: < 500KB (gzipped)
- **Tiempo de carga inicial**: < 3 segundos
- **First Contentful Paint**: < 1.5 segundos

---

## 🌐 Despliegue en Servidor Web

### Opción 1: Nginx (Recomendado)

#### Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### Configurar Sitio

Crear archivo `/etc/nginx/sites-available/dermacheck`:

```nginx
server {
    listen 80;
    server_name dermacheck.com www.dermacheck.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dermacheck.com www.dermacheck.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dermacheck.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dermacheck.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/dermacheck/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing (fallback to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Habilitar Sitio

```bash
sudo ln -s /etc/nginx/sites-available/dermacheck /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Copiar Archivos

```bash
sudo mkdir -p /var/www/dermacheck
sudo cp -r dist/* /var/www/dermacheck/
sudo chown -R www-data:www-data /var/www/dermacheck
```

### Opción 2: Apache

```apache
<VirtualHost *:80>
    ServerName dermacheck.com
    DocumentRoot /var/www/dermacheck/dist
    
    <Directory /var/www/dermacheck/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

---

## 🖥️ Despliegue en Tótems/Kioscos

### Configuración Recomendada

#### 1. Sistema Operativo

**Opción A: Windows 10/11 Pro (Modo Kiosco)**

1. Instalar Windows 10/11 Pro
2. Configurar usuario local sin privilegios de administrador
3. Habilitar "Assigned Access" (Modo Kiosco)

**Opción B: Linux (Ubuntu 22.04 LTS) + Chromium Kiosk**

```bash
# Instalar Chromium
sudo apt update
sudo apt install chromium-browser unclutter

# Deshabilitar screensaver
sudo apt install xscreensaver
xscreensaver-command -exit

# Configurar autostart
mkdir -p ~/.config/autostart
```

#### 2. Configurar Navegador en Modo Kiosco

##### Windows - Crear acceso directo de Chrome:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk ^
  --start-fullscreen ^
  --incognito ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --disable-restore-session-state ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --noerrdialogs ^
  --disable-translate ^
  --disable-features=TranslateUI ^
  "http://localhost/dermacheck"
```

##### Linux - Script de arranque (`~/kiosk.sh`):

```bash
#!/bin/bash

# Ocultar cursor después de inactividad
unclutter -idle 0.5 -root &

# Deshabilitar screensaver
xset s off
xset s noblank
xset -dpms

# Iniciar Chromium en modo kiosco
while true; do
    chromium-browser \
        --kiosk \
        --start-fullscreen \
        --incognito \
        --disable-infobars \
        --disable-session-crashed-bubble \
        --disable-pinch \
        --overscroll-history-navigation=0 \
        --noerrdialogs \
        --disable-translate \
        --check-for-update-interval=31536000 \
        "http://localhost/dermacheck"
    
    sleep 5
done
```

Hacer ejecutable y añadir a autostart:

```bash
chmod +x ~/kiosk.sh

# Crear entrada de autostart
cat > ~/.config/autostart/kiosk.desktop <<EOF
[Desktop Entry]
Type=Application
Name=Kiosk DermaCheck
Exec=/home/kiosk/kiosk.sh
X-GNOME-Autostart-enabled=true
EOF
```

#### 3. Servir Aplicación Localmente

**Opción A: Nginx Local**

Instalar Nginx en el tótem y servir desde `/var/www/html/dermacheck`.

**Opción B: Servidor Node Simple**

Crear `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`DermaCheck running on http://localhost:${PORT}`);
});
```

Ejecutar:

```bash
npm install express
node server.js
```

#### 4. Configuración de Cámara

##### Verificar Dispositivos Disponibles

```bash
# Linux
v4l2-ctl --list-devices

# Windows (PowerShell)
Get-PnpDevice -Class Camera
```

##### Configurar Permisos (Linux)

```bash
# Añadir usuario al grupo video
sudo usermod -a -G video $USER

# Verificar permisos
ls -l /dev/video*
```

##### Probar Cámara en Navegador

Abrir Chrome/Chromium y navegar a: `chrome://settings/content/camera`

#### 5. Configuración de Red

```bash
# Configurar IP estática (Ubuntu)
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.1.50/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Aplicar:

```bash
sudo netplan apply
```

---

## 📱 Configuración PWA

### 1. Verificar Manifest

El archivo `public/manifest.json` debe estar correctamente configurado:

```json
{
  "name": "DermaCheck - Análisis Facial IA",
  "short_name": "DermaCheck",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "icons": [...]
}
```

### 2. Verificar Service Worker

Verificar que `sw.js` esté registrado correctamente en `main.tsx`.

### 3. Probar PWA

1. Abrir Chrome DevTools
2. Ir a Application > Manifest
3. Verificar que no haya errores
4. Probar "Add to Home Screen"

---

## 📊 Monitoreo y Mantenimiento

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Métricas de Rendimiento

Usar Lighthouse de Chrome para auditar:

```bash
npm install -g lighthouse
lighthouse https://dermacheck.com --view
```

Objetivos:
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 80

### Reinicio Automático (Linux)

Crear servicio systemd para reiniciar el navegador:

```bash
sudo nano /etc/systemd/system/dermacheck-kiosk.service
```

```ini
[Unit]
Description=DermaCheck Kiosk Mode
After=graphical.target

[Service]
Type=simple
User=kiosk
Environment=DISPLAY=:0
ExecStart=/home/kiosk/kiosk.sh
Restart=always
RestartSec=5

[Install]
WantedBy=graphical.target
```

Habilitar:

```bash
sudo systemctl enable dermacheck-kiosk
sudo systemctl start dermacheck-kiosk
```

### Actualización de Contenido

```bash
# Script de actualización
#!/bin/bash
cd /path/to/dermacheck
git pull origin main
cd web
npm install
npm run build
sudo cp -r dist/* /var/www/dermacheck/
sudo systemctl reload nginx
```

---

## 🔧 Solución de Problemas

### Problema: Cámara no funciona

**Causas comunes:**
1. Permisos denegados en el navegador
2. Driver de cámara no instalado
3. Cámara en uso por otra aplicación

**Soluciones:**
```bash
# Linux: Verificar dispositivos
ls -la /dev/video*

# Reiniciar servicio de cámara
sudo systemctl restart v4l2loopback

# Windows: Actualizar drivers
# Ir a Administrador de Dispositivos > Cámaras
```

### Problema: Error de red con backend

**Verificar conectividad:**
```bash
# Ping al servidor backend
ping api.dermacheck.com

# Probar endpoint directamente
curl -v https://api.dermacheck.com/api/v1/analysis/inference
```

**Verificar CORS:**
El backend debe permitir el origen del frontend en los headers CORS.

### Problema: Tiempo de carga lento

**Optimizaciones:**
1. Verificar que gzip esté habilitado en Nginx
2. Revisar que los assets estén cacheados correctamente
3. Verificar tamaño de las imágenes
4. Habilitar HTTP/2 en el servidor

```bash
# Verificar gzip
curl -I -H "Accept-Encoding: gzip" https://dermacheck.com

# Analizar tamaño del bundle
npm run build -- --analyze
```

### Problema: PWA no se instala

**Verificar:**
1. Certificado SSL válido (obligatorio para PWA)
2. Manifest.json accesible
3. Service Worker registrado correctamente
4. Navegador soporta PWA (Chrome, Edge, Safari 11.3+)

### Problema: Pantalla se apaga en el tótem

**Linux:**
```bash
# Deshabilitar todas las opciones de ahorro de energía
xset s off
xset -dpms
xset s noblank

# Añadir a crontab para ejecutar cada hora
crontab -e
0 * * * * DISPLAY=:0 xset s off && xset -dpms && xset s noblank
```

**Windows:**
```
Configuración > Sistema > Energía y suspensión
- Suspender: Nunca
- Pantalla: Nunca
```

---

## 📞 Soporte

Para asistencia técnica adicional:
- **Email**: soporte@dermacheck.com
- **Documentación**: https://docs.dermacheck.com
- **GitHub Issues**: https://github.com/lauritaggz/DermaCheck/issues

---

## 📝 Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Build de producción generado y probado
- [ ] Backend API accesible y funcional
- [ ] Certificado SSL instalado (producción)
- [ ] Servidor web configurado (Nginx/Apache)
- [ ] Permisos de cámara configurados
- [ ] Modo kiosco habilitado (tótems)
- [ ] Service Worker funcionando
- [ ] Tiempo de carga < 3 segundos verificado
- [ ] Compatibilidad cross-browser probada
- [ ] Logs de monitoreo configurados
- [ ] Plan de respaldo y actualizaciones establecido

---

**Versión del Documento**: 1.0.0  
**Última Actualización**: Abril 2026
