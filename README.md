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

## Tests

```bash
npm test
```

Unitarios con Vitest (dominio, casos de uso, EventBus y handler de alertas). No requieren PostgreSQL.

## Migraciones Docker

Las migraciones en `docker-entrypoint-initdb.d` solo se ejecutan la primera vez que se crea el volumen `postgres_data`.

Si alguien ya levantó el contenedor con volumen vacío o sin migración:

```bash
docker compose down -v   # borra volumen
docker compose up -d     # recrea BD + ejecuta SQL
```

### Error `relation "alerts" does not exist`

Significa que PostgreSQL **no tiene la tabla `alerts`** (migración `003_create_alerts.sql`). Suele pasar si el volumen Docker se creó **antes** de añadir esa migración: `docker-entrypoint-initdb.d` solo corre en el **primer** arranque del volumen.

**Opción A — conservar datos** (aplicar solo la migración faltante):

```bash
# Windows (PowerShell), desde la raíz del proyecto
Get-Content backend\migrations\003_create_alerts.sql | docker exec -i coordinadora-postgres psql -U user -d coordinadora_events
```

Linux/macOS:

```bash
docker exec -i coordinadora-postgres psql -U user -d coordinadora_events < backend/migrations/003_create_alerts.sql
```

**Opción B — BD limpia** (borra todos los datos):

```bash
docker compose down -v
docker compose up -d
```

## Datos de prueba (dashboard)

```bash
# 1. Aplicar migraciones (incluye tabla alerts — HU3 e índices — 004)
npm run migrate

# 2. API en marcha
npm run dev

# 3. En otra terminal
npm run populate
```

`populate` crea eventos (incluye CRITICAL → alertas async), incidentes y cambios de estado **solo vía HTTP**. Si falta la tabla `alerts`, ejecuta `npm run migrate` primero.
