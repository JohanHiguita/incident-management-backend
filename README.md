# Backend — Plataforma de Gestión de Incidentes y Monitoreo Operacional


Las migraciones en `docker-entrypoint-initdb.d` solo se ejecutan la primera vez que se crea el volumen `postgres_data`.

Si alguien ya levantó el contenedor con volumen vacío o sin migración:

```bash
docker compose down -v   # borra volumen
docker compose up -d     # recrea BD + ejecuta SQL
```
