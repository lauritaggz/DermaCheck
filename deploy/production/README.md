# Despliegue en producción — Servidor académico (Grupo VII)

Guía para publicar el **API DermaCheck** (FastAPI + MySQL) en el servidor del curso. La app móvil Expo solo necesita la URL pública o de intranet del API (`EXPO_PUBLIC_API_BASE_URL`).

Los **datos de la base de datos** y las **imágenes subidas** se guardan en disco bajo **`deploy/production/data/`** (`mysql/` y `uploads/`), no en volúmenes anónimos de Docker, para poder hacer copias de seguridad y localizar todo el despliegue en una sola carpeta.

---

## Características del servidor (referencia curso)

| Recurso | Valor |
|--------|--------|
| Sistema operativo | **Ubuntu 24.04** |
| RAM | **8 GB** |
| Disco | **50 GB** |
| CPU | **8 núcleos** |

Con **8 GB RAM**, dejar MySQL + API en Docker suele ser suficiente; si el servidor se queda corto de memoria, revisa `docker stats` y cierra otros servicios o añade swap.

---

## Conexión al servidor

### Desde laboratorio (red universidad)

- **SSH**, puerto **22**.
- Herramientas: PuTTY, Terminus, terminal integrada, etc.

### Desde casa

1. Instalar **FortiClient VPN** (instalador indicado por la asignatura).
2. Conectar con los parámetros que entregue el docente (**Gateway remoto**, usuario y clave de intranet).
3. Una vez en la VPN, el servidor suele ser alcanzable en la **IP de la red interna** (ej. `10.51.0.x`), no desde Internet público sin VPN.

### Datos típicos de acceso SSH (ajusta si el docente cambia algo)

| Parámetro | Valor de referencia |
|-----------|---------------------|
| IP | `10.51.0.27` |
| Puerto | `22` |
| Usuario | `alumno` |
| Contraseña | La entregada por el curso (**no la guardes en Git**) |

Ejemplo:

```bash
ssh alumno@10.51.0.27 -p 22
```

**Seguridad:** si el repositorio es público o se comparte, **no subas** contraseñas del servidor ni el archivo `.env` de producción. Rota credenciales si alguna vez se filtraron.

---

## Requisitos en el servidor (Ubuntu 24.04)

1. **Docker Engine** y **Docker Compose plugin** (v2).

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
# Cierra sesión SSH y vuelve a entrar para que aplique el grupo docker
```

2. **Git** (para clonar el proyecto).

```bash
sudo apt-get install -y git
```

3. (Opcional) **UFW** — abrir solo lo necesario:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp   # o el API_HOST_PORT que uses
sudo ufw enable
```

---

## Desplegar DermaCheck (API + MySQL)

En el servidor, **desde tu usuario con permiso docker** (o con `sudo` delante de `docker`):

```bash
cd ~
git clone <URL_DE_TU_REPO> DermaCheck
cd DermaCheck

cp deploy/production/env.production.example deploy/production/.env
nano deploy/production/.env   # o vim: define MYSQL_* y DATABASE_URL con las mismas claves
```

Genera contraseñas seguras, por ejemplo:

```bash
openssl rand -base64 24
```

Las carpetas `deploy/production/data/mysql` y `deploy/production/data/uploads` vienen en el repo con `.gitkeep`; el contenido real **no se sube a Git** (`.gitignore`). Si clonas en un servidor nuevo, ya existen las rutas; la primera vez que arranca MySQL inicializa los ficheros dentro de `data/mysql`.

Arranque:

```bash
docker compose --env-file deploy/production/.env -f deploy/production/docker-compose.prod.yml up -d --build
```

Comprobaciones:

```bash
docker compose --env-file deploy/production/.env -f deploy/production/docker-compose.prod.yml ps
curl -s "http://127.0.0.1:${API_HOST_PORT:-8000}/health"
```

Sustituye `API_HOST_PORT` si lo definiste distinto en `.env` (por defecto en plantilla: `8000` en el servidor dedicado).

Desde otro equipo **en la misma red/VPN**:

```text
http://10.51.0.27:8000/health
```

(Ajusta IP y puerto según tu `.env`.)

---

## App móvil (Expo / APK)

En la máquina donde construyes la app, en `.env` de la **raíz del proyecto** (no `deploy/production`):

```env
EXPO_PUBLIC_API_BASE_URL=http://10.51.0.27:8000
```

- Sin barra final.
- Si más adelante montas **HTTPS** (dominio + certificado), usa `https://...`.
- Tras cambiar la variable, **vuelve a generar el build** de la app (las `EXPO_PUBLIC_*` se fijan en compilación).

---

## Operación habitual

| Acción | Comando (desde raíz del repo) |
|--------|--------------------------------|
| Ver logs API | `docker compose --env-file deploy/production/.env -f deploy/production/docker-compose.prod.yml logs -f api` |
| Parar | `docker compose --env-file deploy/production/.env -f deploy/production/docker-compose.prod.yml down` |
| Actualizar código | `git pull` y repetir `up -d --build` |

**Copias de seguridad:** para respaldar todo, basta con parar los contenedores (`docker compose ... down`) y copiar el directorio `deploy/production/data/` (o solo `data/mysql` si solo te importa la BD).

---

## HTTPS y dominio (opcional, no exigido en el laboratorio)

Si en el futuro tenéis dominio y certificado (Let’s Encrypt), podéis poner **Nginx** o **Caddy** delante del contenedor `api`, escuchando en 443 y proxy_pass a `http://127.0.0.1:8000`. No está automatizado en este repo para no acoplar DNS del curso.

---

## Resumen de archivos en esta carpeta

| Archivo | Uso |
|---------|-----|
| `docker-compose.prod.yml` | Stack producción (MySQL + API). |
| `env.production.example` | Plantilla de variables; copiar a `.env` solo en el servidor. |
| `data/mysql/` | Datos de **MySQL** en el servidor (bind mount; ignorado por Git salvo `.gitkeep`). |
| `data/uploads/` | **Imágenes** de análisis facial subidas al API (ignorado por Git salvo `.gitkeep`). |
| `README.md` | Esta guía. |

El archivo `deploy/production/.env` debe existir solo en el servidor y está en `.gitignore` del repositorio.
