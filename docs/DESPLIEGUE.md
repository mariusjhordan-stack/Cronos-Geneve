# Guía de despliegue — Cronos Genève

Esta guía describe cómo levantar la tienda en producción. **Nada de esto se ha ejecutado contra un servidor real ni con credenciales reales**; el stack de Docker sí se levantó y probó en local (ver «Qué se verificó»).

## Arquitectura
```
Internet ──HTTPS──▶ proxy TLS (Render / Caddy / Cloudflare / ALB)
                       └─▶ nginx (frontend React + proxy /api /admin /static)
                              └─▶ gunicorn (Django, 3 workers) ──▶ PostgreSQL
```
Un único origen para web y API: no hace falta CORS en el despliegue con Docker.

## Opción A — Docker Compose (un servidor)
1. Copia `.env.example` a un archivo **fuera del repositorio** (p. ej. `/etc/cronos/prod.env`) y completa:

| Variable | Valor |
|---|---|
| `POSTGRES_PASSWORD` | contraseña larga y aleatoria |
| `DJANGO_SECRET_KEY` | `python -c "import secrets;print(secrets.token_urlsafe(60))"` |
| `DJANGO_ALLOWED_HOSTS` | `tu-dominio.com,127.0.0.1,api` (127.0.0.1 lo usa el healthcheck del contenedor) |
| `FRONTEND_URL` | `https://tu-dominio.com` |
| `DJANGO_ADMIN_URL` | ruta secreta del admin, p. ej. `gestion-x7k2/` |
| `DJANGO_HSTS_SECONDS` | `3600` al inicio; `31536000` cuando HTTPS esté validado |
| `MERCADOPAGO_*` | ver «Mercado Pago» (credenciales **tuyas**) |

2. Levanta:
```bash
ENV_FILE=/etc/cronos/prod.env docker compose --env-file /etc/cronos/prod.env -f docker-compose.prod.yml up -d --build
```
Al arrancar la API ejecuta `migrate` y `createcachetable` (caché compartida entre workers para el límite de peticiones).
3. Pon delante un proxy que termine HTTPS y envíe `X-Forwarded-Proto: https` y `X-Forwarded-For`. Con ese proxy + nginx, `DJANGO_NUM_PROXIES=2` (ya fijado en el compose).
4. Crea el administrador: `docker compose -f docker-compose.prod.yml exec api python manage.py createsuperuser`.

## Opción B — Render (`render.yaml`)
Blueprint con API (Python), PostgreSQL y frontend estático. **Los planes están en `free`: la BD gratuita expira a los 30 días y el servicio duerme**; cambia a planes de pago antes de recibir clientes. Variables con `sync: false` se introducen en el panel de Render.

## Catálogo inicial (sin datos demo en producción)
El arranque **no** carga datos. El catálogo de 24 piezas es de demostración; si lo quieres cargar, hazlo una sola vez y de forma explícita:
```bash
docker compose -f docker-compose.prod.yml exec -e CONFIRMAR_CARGA_CATALOGO=true api python poblar_datos.py
```
Sin `CONFIRMAR_CARGA_CATALOGO=true` y con `DEBUG=false`, el script se niega. El script es *create-only*: no pisa stock ni precios existentes. Para un catálogo real, créalo desde el admin.

## Mercado Pago (requiere TUS credenciales)
1. En tu panel de desarrolladores crea la aplicación y obtén `MERCADOPAGO_ACCESS_TOKEN` (empieza con credenciales **TEST**) y `MERCADOPAGO_WEBHOOK_SECRET` (clave secreta de Webhooks).
2. Configura el webhook a `https://tu-dominio.com/api/pedidos/webhooks/mercadopago/` (evento *Pagos*).
3. `MERCADOPAGO_USD_PEN_RATE`: tipo de cambio aprobado por el negocio.
4. El código rechaza `MERCADOPAGO_ENVIRONMENT` distinto de `test` hasta que se habilite producción de forma explícita en `pedidos/payments.py` (decisión de salida a producción pendiente).
Comportamiento del webhook: firma HMAC obligatoria (401 si no coincide); consulta el pago a la API con el token; valida referencia y monto; idempotente. Si Mercado Pago o la red fallan responde **503**, y ante un error interno **500**, para que Mercado Pago reintente. Un 4xx del proveedor (p. ej. id inexistente del simulador) se confirma con 200 sin procesar.

## Backups (pendiente de configurar por ti)
```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U cronos cronos_geneve | gzip > cronos_$(date +%F).sql.gz
# restauración (en una BD vacía):
gunzip -c cronos_2026-01-01.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U cronos cronos_geneve
```
Programa el volcado diario y **copia los archivos fuera del servidor**. Ensaya la restauración antes de salir a producción. Con BD gestionada, activa los backups del proveedor.

## Monitorización
- `GET /healthz/` (200 si la app y la BD responden): úsalo en UptimeRobot/Render/balanceador.
- Los registros salen por stdout (`docker compose logs -f api`). Nivel con `DJANGO_LOG_LEVEL`.
- Pendiente: Sentry (o similar) para errores.

## Pruebas
```bash
python manage.py test                        # 90 pruebas de backend
cd frontend && npm run lint && npm run build
cd frontend && E2E_BASE_URL=http://localhost E2E_FORWARD_HTTPS=1 npx playwright test   # E2E contra el stack local
```
`npx playwright install chromium` la primera vez. Los E2E crean un usuario de prueba y **nunca** contra producción.
Los E2E de checkout llegan hasta la creación de la preferencia: sin credenciales de Mercado Pago comprueban que el servidor responde con un error controlado y no toca el stock. **No simulan pagos aprobados.**

## Qué se verificó (2026-11-16, Docker Desktop en Windows)
- `docker build` de la API y del frontend; `docker compose up` con PostgreSQL 17, gunicorn 23 (3 workers) y nginx 1.27: los tres contenedores sanos.
- `/healthz/`, API, admin, estáticos de Django, bundle JS e imágenes servidos por nginx; HTTP sin `X-Forwarded-Proto` redirige a HTTPS (301).
- BD de producción vacía al arrancar (0 relojes); `poblar_datos.py` se niega sin confirmación y carga con ella.
- Límite de peticiones: 10 intentos de login por cliente y minuto, compartido entre los 3 workers, y por IP de cliente real (otro cliente no se ve afectado).
- 14 pruebas E2E con Playwright pasan contra ese stack.
- **No verificado:** TLS real y dominio, pagos de Mercado Pago, backups programados, carga/rendimiento bajo tráfico.
