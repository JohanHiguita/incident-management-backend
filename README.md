# Backend — Plataforma de Gestión de Incidentes y Monitoreo Operacional

## Requisitos

- Node.js 20+
- Docker Desktop

## Arranque

```bash
# 1. Base de datos (desde la raíz del proyecto)
docker compose up -d

# 2. Variables de entorno
cd backend
cp .env.example .env   # Windows: Copy-Item .env.example .env

# 3. Instalar y ejecutar
npm install
npm run dev
```

La API queda en `http://localhost:3000` (configurable con `PORT` en `.env`).

Producción compilada:

```bash
npm run build
npm start
```

## Migraciones Docker

Las migraciones en `docker-entrypoint-initdb.d` solo se ejecutan la primera vez que se crea el volumen `postgres_data`.

Si alguien ya levantó el contenedor con volumen vacío o sin migración:

```bash
docker compose down -v   # borra volumen
docker compose up -d     # recrea BD + ejecuta SQL
```
