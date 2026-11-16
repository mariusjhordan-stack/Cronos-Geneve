# Auditoría de producción — Cronos Genève (Django + React)

Fecha: 2026-11-16 · Rama `feature/redesign`. Todo lo marcado como probado se ejecutó en esta auditoría; lo demás se indica como **no probado**.

## Veredicto
**No está listo para vender de verdad todavía.** La base técnica es sólida (pagos verificados en servidor, stock con bloqueo, 84 pruebas en verde, sin vulnerabilidades conocidas), pero faltan decisiones y credenciales externas (dominio, Mercado Pago real, almacenamiento de imágenes, backups) y varias piezas operativas.

## Cambios aplicados en esta auditoría
| Cambio | Archivo |
|---|---|
| **Corregido un error mío de la Fase 2**: `poblar_datos.py` tenía un `SyntaxError` y `render.yaml` lo ejecuta al arrancar, así que el despliegue habría fallado. Ahora compila, se probó contra PostgreSQL (24 relojes, 27 imágenes, idempotente) y hay un test que lo vigila. | `poblar_datos.py`, `usuarios/tests.py` |
| Límite de peticiones (login 10/min, registro 10/h, checkout 20/min; configurable por entorno) + test | `settings.py`, `usuarios/api_views.py`, `pedidos/api_views.py` |
| Logging a consola con nivel configurable | `settings.py` |
| Endpoint `/healthz/` (comprueba la BD), exento de redirección HTTPS | `cronos_elite/urls.py`, `settings.py` |
| URL del admin configurable (`DJANGO_ADMIN_URL`) | `settings.py`, `urls.py` |
| Cabeceras: `X_FRAME_OPTIONS=DENY`, `Referrer-Policy`, HSTS configurable | `settings.py` |
| `DB_SSL_REQUIRE` para BD en red interna de Docker | `settings.py` |
| Dockerfile (API), Dockerfile + nginx (frontend), `docker-compose.prod.yml`, `.dockerignore` | raíz y `frontend/` |
| CI de GitHub Actions (PostgreSQL, tests, migraciones, `pip-audit`, lint, build, `npm audit`) | `.github/workflows/ci.yml` |
| Carga diferida de rutas: bundle JS de 710 kB a 470 kB | `frontend/src/App.jsx` |
| SEO básico: meta description, Open Graph, `robots.txt`, título por página y por reloj | `index.html`, `App.jsx`, `ProductDetailPage.jsx` |

## LISTO PARA PRODUCCIÓN (probado)
- **Tests:** 84 pruebas de Django OK en SQLite **y en PostgreSQL 18** (instancia temporal).
- **Migraciones:** `makemigrations --check` sin cambios; `migrate` limpio en PostgreSQL.
- **Dependencias:** `pip-audit` sin vulnerabilidades; `npm audit --omit=dev` con 0.
- **Frontend:** `npm run build` y `npm run lint` sin errores.
- **Configuración de producción** (`DEBUG=false`, probado con el cliente de pruebas): HTTP redirige a HTTPS (301), la API responde por HTTPS, el admin antiguo da 404 y el nuevo existe, cabeceras HSTS/nosniff/Referrer-Policy/X-Frame presentes. `check --deploy` solo avisa de HSTS (subdominios/preload, decisión de negocio).
- **Fail-fast:** sin `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` o `DATABASE_URL` con `DEBUG=false`, la app no arranca. `.env` y `db.sqlite3` no están versionados.
- **Pagos (revisión de código + tests existentes):** el webhook exige firma HMAC válida, consulta el pago a la API de Mercado Pago con el token, valida `external_reference` y monto, es idempotente y el stock se reserva y libera con `transaction.atomic()` + `select_for_update()`. No se confía en el navegador.
- **Móvil (375 px, navegador integrado):** sin desbordamiento horizontal en inicio, ficha, colecciones, comparador, checkout, login y registro; sin errores de consola; carga diferida de rutas funciona.
- JWT: acceso de 10 min, refresco rotado con lista negra. Permisos por defecto `IsAuthenticated`.

## PENDIENTE OBLIGATORIO
| # | Qué falta | Importancia | Solución |
|---|---|---|---|
| 1 | `render.yaml` ejecuta `poblar_datos.py` en **cada arranque**: mete datos de demostración en producción. | Alta | Quitarlo del `startCommand` y cargar el catálogo real una sola vez (`python poblar_datos.py` manual o fixtures). |
| 2 | Plan gratuito de Render: duerme y la BD gratuita expira a los 30 días. | Alta | Plan de pago para API y PostgreSQL antes de recibir clientes. |
| 3 | Sin backups ni prueba de restauración. | Alta | `pg_dump` diario a almacenamiento externo + un ensayo de restauración documentado; o backups gestionados del proveedor. |
| 4 | Sin monitorización de errores ni alertas (solo logs de consola). | Alta | Sentry (o similar) + alerta sobre `/healthz/` (UptimeRobot, etc.). |
| 5 | Webhook devuelve 200 aunque falle la reconciliación interna: Mercado Pago no reintenta. | Media-alta | Devolver 500 en el `except Exception` para que reintente (la reconciliación es idempotente) o programar una tarea que revise pedidos pendientes. |
| 6 | Sin pruebas E2E automatizadas (registro → login → carrito → checkout) ni en navegador real. | Media-alta | Playwright contra entorno de pruebas con Mercado Pago en modo test. No lo hice: requiere credenciales de sandbox. |
| 7 | Hay 20 relojes con ilustración en vez de fotografía y la foto del Nautilus (CC BY-SA, autor «Patek Philippe SA») tiene el permiso sin verificar; falta página de créditos. | Alta (legal/comercial) | Fotos de prensa con permiso o propias; página de créditos; ver `docs/IMAGE-AUDIT.md`. |
| 8 | Tipo de cambio USD→PEN fijo (`3.75`) en variable de entorno. | Media | Decidir política: tasa manual revisada o API de tipo de cambio; mostrarla antes de pagar (Fase 4 del plan). |
| 9 | Flujos de compra de la Fase 4/5 del plan sin hacer (409 al agotarse, páginas de pago exitoso/rechazado/pendiente, estados de carga y error en todas las pantallas, interceptor 401). | Media-alta | Seguir el plan por fases. |
| 10 | Panel administrativo (`/admin/`) sin personalizar para operación (filtros, acción «marcar enviada», inline de `DetalleOrden`). | Media | Fase 7 del plan. |

## MEJORAS RECOMENDADAS
- HSTS: tras validar HTTPS, `DJANGO_HSTS_SECONDS=31536000` (+ subdominios si aplica).
- Autenticación con cookies HttpOnly en lugar de tokens en el navegador (si hoy están en `localStorage`, un XSS los expone); añadir Content-Security-Policy.
- Doble factor para el admin; contraseñas de staff distintas.
- Fuentes de Google desde CDN: autoalojarlas (privacidad/RGPD y rendimiento).
- Imágenes: ya son WebP 4:5 y se sirven con caché de 30 días en el nginx incluido; con CDN delante mejora más.
- `sitemap.xml` y datos estructurados `Product` (JSON-LD) cuando exista dominio; el SPA sin prerender limita el SEO (valorar SSR/prerender).
- Accesibilidad: auditar con axe/Lighthouse (no ejecutado); el checkout no tiene `<h1>`; áreas táctiles menores de 32 px en parte del menú.
- Actualizar dependencias menores (`npm outdated`: react 19.3.1, vite 8.3.8, lucide-react…). Django 5.2 está soportado; no saltar a 6 sin probar.
- Cobertura de pruebas del frontend (hoy no hay).

## BLOQUEADO POR CREDENCIALES O SERVICIOS EXTERNOS
- Mercado Pago: token de producción, `MERCADOPAGO_WEBHOOK_SECRET` real y prueba del webhook con notificaciones reales. **No se probó ningún pago real ni simulado.**
- Dominio, DNS y certificado TLS (o proxy que termine HTTPS).
- Proveedor de hosting/BD de pago y almacenamiento de backups.
- Cuenta de Sentry / monitor de disponibilidad.
- Prueba de `docker build` y `docker compose`: **no probado**, el servicio de Docker Desktop no está en ejecución. Los archivos están escritos pero sin verificar.
- gunicorn **no probado** en esta máquina (no funciona en Windows); se probó la configuración con el cliente de pruebas de Django.

## Plan de trabajo para dejarlo desplegable
1. Quitar `poblar_datos.py` del arranque y definir la carga del catálogo real (1 h).
2. Elegir hosting de pago y crear PostgreSQL gestionado con backups; ensayar restauración (½ día).
3. Registrar dominio, TLS y variables (`DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `DJANGO_ADMIN_URL`, `DJANGO_HSTS_SECONDS`).
4. Probar `docker compose -f docker-compose.prod.yml up --build` en una máquina con Docker y corregir lo que falle.
5. Mercado Pago en sandbox: pago aprobado, rechazado, pendiente y webhook repetido; luego pasar a producción.
6. Cerrar Fases 4 y 5 del plan (pagos y estados de API) y añadir E2E con Playwright.
7. Sentry + monitor de `/healthz/`.
8. Fotos reales y página de créditos; Fase 7 (admin, responsive final, diagrama ER).
9. Prueba de carga ligera y revisión con Lighthouse/axe; HSTS a 1 año.
10. Salida controlada: primero con pedidos de prueba, luego público.
