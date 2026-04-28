# DermaCheck Web - Aplicación de Análisis Dermatológico

Aplicación web desarrollada con React + Vite + TypeScript para análisis dermatológico con inteligencia artificial.

## 🚀 Características

- ✅ Interfaz web responsiva (tótems verticales y tablets horizontales)
- ✅ Acceso a cámara web con getUserMedia API
- ✅ Captura y procesamiento de imágenes
- ✅ Análisis con modelo YOLO (backend FastAPI)
- ✅ Progressive Web App (PWA)
- ✅ Code splitting y lazy loading
- ✅ Optimizada para carga < 3 segundos

## 📋 Requisitos

- Node.js 18+ y npm
- Backend FastAPI corriendo en el puerto 8000

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la IP de tu servidor backend
```

## ⚙️ Configuración

Edita el archivo `.env` con la URL de tu backend:

```env
VITE_API_BASE_URL=http://192.168.0.10:8000
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

## 🏗️ Build para producción

```bash
# Generar build optimizado
npm run build

# Previsualizar build
npm run preview
```

## 📱 PWA

La aplicación incluye soporte PWA con:
- Manifest.json configurado
- Service Worker para caché offline
- Optimizada para instalación en dispositivos

## 🎨 Tecnologías

- **React 18** - Framework UI
- **Vite 8** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework CSS
- **React Router** - Enrutamiento
- **getUserMedia API** - Acceso a cámara
- **Canvas API** - Procesamiento de imágenes

## 📐 Arquitectura

```
web/
├── public/          # Archivos estáticos (manifest, sw)
├── src/
│   ├── components/  # Componentes reutilizables
│   ├── screens/     # Pantallas de la aplicación
│   ├── services/    # Servicios API
│   ├── context/     # Context API (estado global)
│   ├── hooks/       # Custom hooks
│   ├── utils/       # Utilidades
│   ├── types/       # TypeScript types
│   ├── constants/   # Constantes
│   └── data/        # Datos estáticos
```

## 🔐 Seguridad

- Todas las rutas protegidas requieren autenticación
- Comunicación HTTPS recomendada en producción
- Permisos de cámara solicitados explícitamente

## 📄 Licencia

Proyecto educativo DermaCheck
