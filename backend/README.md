# DermaCheck API (FastAPI)

Puedes usar **base de datos local** de dos maneras:

## Opción A — SQLite (recomendada para empezar)

Un **archivo** `dermacheck.db` en la carpeta `backend/`. No hace falta instalar MySQL.

1. Copia `.env.example` a `.env` y deja la línea por defecto:

   `DATABASE_URL=sqlite:///./dermacheck.db`

2. Instala dependencias y arranca:

   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. La primera ejecución crea el archivo y las tablas. El archivo `dermacheck.db` está en `.gitignore`.

## Opción B — MySQL en tu PC (localhost)

1. Instala [MySQL](https://dev.mysql.com/downloads/mysql/) o MariaDB en Windows.
2. Crea la base:

   ```sql
   CREATE DATABASE dermacheck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. En `.env` usa (ajusta usuario y contraseña):

   `DATABASE_URL=mysql+pymysql://usuario:clave@127.0.0.1:3306/dermacheck?charset=utf8mb4`

4. Mismo arranque con `uvicorn` que arriba.

---

## Requisitos

- Python 3.11+
- (Solo si usas MySQL) servidor MySQL/MariaDB escuchando en `127.0.0.1:3306`

## Arranque (ambas opciones)

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Salud: `GET http://localhost:8000/health`
- Registro: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Aceptar documentos: `POST /api/v1/consents/accept`
- Listar por usuario: `GET /api/v1/consents/users/{user_id}/acceptances`

Al iniciar se crean tablas y se siembran los documentos legales (versión `1.0-demo`), alineados con la app móvil.

## App móvil (Expo)

En la raíz del proyecto Expo, crea `.env` con la IP de tu PC en la red local, por ejemplo:

`EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000`

(Usa `ipconfig` en Windows para ver tu IPv4.)

## Zona horaria

Las aceptaciones guardan `accepted_at` en **UTC** desde el servidor. Con MySQL en producción conviene servidor en UTC.
