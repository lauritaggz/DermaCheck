# Acceso al servidor de produccion

Guia rapida para ingresar al servidor de produccion de DermaCheck.

## 1) Conectarte a la VPN (si estas fuera de la red de la universidad)

1. Abre FortiClient VPN.
2. Conectate con los datos entregados por el docente (Gateway, usuario y clave).
3. Verifica que la VPN quede en estado "Connected".

> Si estas en el laboratorio y en la misma red interna, normalmente puedes omitir este paso.

## 2) Conectarte por SSH

Usa una terminal (PowerShell, Git Bash, Terminal de VS Code o PuTTY) y ejecuta:

```bash
ssh alumno@10.51.0.27 -p 22
```

Si es la primera vez, acepta la huella del host escribiendo `yes`.

## 3) Ingresar credenciales

1. Escribe la contrasena del servidor cuando la pida SSH.
2. Presiona Enter.

> Nota: al escribir la contrasena no se muestra texto en pantalla, es normal.

## 4) Confirmar que ya estas dentro del servidor

Ejecuta estos comandos de verificacion:

```bash
whoami
pwd
hostname
```

Deberias ver:
- Tu usuario del servidor (por ejemplo `alumno`).
- Una ruta del sistema Linux.
- El nombre del host del servidor.

## 5) Ir al proyecto en produccion

```bash
cd ~/DermaCheck
ls
```

## 6) Ver estado del stack de produccion

```bash
docker compose --env-file deploy/production/.env -f deploy/production/docker-compose.prod.yml ps
```

## 7) Salir del servidor

```bash
exit
```

---

## Problemas comunes

- `Connection timed out`: no tienes VPN activa o no hay ruta a la red interna.
- `Permission denied`: usuario o contrasena incorrectos.
- `Could not resolve hostname`: IP o nombre mal escrito.
- `docker: command not found`: tu usuario no tiene Docker instalado/configurado en ese servidor.
