# Auditoría de producción — Cronos Genève (Django + React)

Fecha: 2026-11-16 · Rama `feature/redesign` · Segunda ronda (cierre de pendientes). Lo marcado como probado se ejecutó; lo demás se indica como **no probado**. Guía operativa: [DESPLIEGUE.md](DESPLIEGUE.md).

## Veredicto
Los pendientes técnicos que no dependen de credenciales están cerrados y verificados en un stack real de Docker (PostgreSQL + gunicorn + nginx). **Aún no se puede vender**: faltan tus credenciales (Mercado Pago), dominio/TLS, hosting de pago y backups.

## LISTO (probado)
| Punto | Evidencia |
|---|---|
| **Producción no carga datos demo.** Se quitó `poblar_datos.py` de `render.yaml`; el script se niega con `DEBUG=false` salvo `CONFIRMAR_CARGA_CATALOGO=true`. | Test que lee `render.yaml`; test del script en modo producción; en Docker: BD con 0 relojes al arrancar, el script se negó, y cargó 24 con la confirmación. |
| **Webhook con reintentos correctos.** Error interno → **500**; Mercado Pago/red caídos, 5xx, 429 o credenciales → **503**; 4xx del proveedor (id inexistente del simulador) → 200 sin procesar. Firma inválida sigue en 401. | 3 tests nuevos + los 9 existentes de webhook. |
| **Checkout no filtra detalles internos.** Antes el cliente recibía textos como «MERCADOPAGO_ENVIRONMENT debe ser…». Ahora recibe un mensaje genérico y el detalle va al registro. | Hallado por el E2E; test nuevo. |
| **Límite de peticiones real.** Con la caché por defecto cada worker de gunicorn contaba aparte (12 intentos y ningún 429). Ahora `DatabaseCache` compartida + `NUM_PROXIES`. | En Docker: cliente A recibe 429 tras 10 intentos con 3 workers; cliente B sigue en 401. |
| **E2E (Playwright), 14 pruebas pasan** contra el stack de Docker: catálogo + desplegable con buscador, ficha, colecciones, registro/logout/login, login fallido, ruta protegida, carrito persistente, comparador, checkout (validaciones + error controlado sin tocar stock) y 5 rutas sin desbordamiento horizontal en móvil (Pixel 7). | `npx playwright test` (44 s). |
| **Docker/gunicorn/nginx verificados.** `docker build` y `docker compose up`: db, api y web sanos; `/healthz/`, API, admin, estáticos, JS e imágenes servidos; HTTP sin `X-Forwarded-Proto` → 301. | Ver DESPLIEGUE.md. |
| Backend: 90 pruebas OK (SQLite; 1 omitida si faltan las dependencias de producción, pasa en el venv; PostgreSQL 18 verificado en la ronda anterior), migraciones sin cambios; `pip-audit` y `npm audit` limpios; lint y build OK. | Ejecutados. |
| Desde la ronda anterior: `/healthz/`, logging, admin con ruta configurable, cabeceras de seguridad, rutas con carga diferida (JS 470 kB), SEO básico, CI. | Ver historial. |

## PENDIENTE OBLIGATORIO (técnico)
| # | Qué falta | Importancia | Cómo |
|---|---|---|---|
| 1 | Sentry (o equivalente) para errores en producción: el código no lo integra. | Alta | Añadir `sentry-sdk` con DSN por variable de entorno (necesita tu cuenta; ver abajo). |
| 2 | Tarea de conciliación de pagos pendientes: si el webhook falla y el cliente cierra el navegador, la orden puede quedar pendiente hasta que expire la reserva. | Media-alta | Comando periódico que consulte las órdenes pendientes a la API de Mercado Pago (necesita token para probarlo). |
| 3 | Fotos reales de 20 relojes y permiso de la foto del Nautilus (CC BY-SA, autor «Patek Philippe SA»); página de créditos. | Alta (legal/comercial) | Ver `docs/IMAGE-AUDIT.md`. |
| 4 | Fases 4 y 5 del plan (estados de pago en el frontend, 409 al agotarse, estados de carga/error en todas las pantallas, interceptor 401) y Fase 7 (admin). | Media-alta | Siguientes fases, tras tu OK. |
| 5 | El E2E de checkout no cubre el pago aprobado/rechazado/pendiente. | Alta | Hacerlo en sandbox con tus credenciales TEST (nunca simulando aprobaciones). |

## REQUIERE TUS CREDENCIALES / ACCIÓN
| Qué | Para qué |
|---|---|
| Credenciales TEST de Mercado Pago (`ACCESS_TOKEN`, `WEBHOOK_SECRET`) y configurar la URL del webhook | Probar pago real de sandbox: aprobado, rechazado, pendiente, webhook repetido. Producción solo cuando decidas habilitarla. |
| Dominio, DNS y terminador TLS (Caddy/Cloudflare/Render) | HTTPS; después subir `DJANGO_HSTS_SECONDS` a 31536000. |
| Hosting y PostgreSQL de **pago** (Render free duerme y la BD expira a los 30 días) | Disponibilidad y datos de clientes. |
| Programar backups externos y **ensayar la restauración** (comandos en DESPLIEGUE.md) | Recuperación ante desastre. |
| Cuenta de Sentry y monitor de `/healthz/` | Alertas. |
| Decidir el tipo de cambio USD→PEN (hoy `3.75` fijo) | Cobros correctos. |
| Fotos con permiso / propias | Sustituir las 20 ilustraciones. |
| Primera ejecución del job E2E de GitHub Actions | Está escrito con los mismos comandos que corrí en local, pero **no se ha ejecutado en GitHub**. |

## RECOMENDACIONES NO BLOQUEANTES
- Tokens JWT: valorar cookies HttpOnly y una Content-Security-Policy.
- Doble factor para el admin.
- Autoalojar las fuentes de Google (privacidad y rendimiento).
- `sitemap.xml` y JSON-LD `Product` al tener dominio; el SPA sin prerender limita el SEO.
- Accesibilidad: pasar axe/Lighthouse (no ejecutado); el checkout no tiene `<h1>`.
- Actualizar dependencias menores (`npm outdated`).
- Pruebas unitarias del frontend; ampliar E2E a favoritos, direcciones y pedidos.
- CDN para imágenes; prueba de carga ligera.
- Gunicorn: 3 workers *sync*; ajustar según CPU y tráfico real.

## Cambios de esta ronda
`render.yaml`, `poblar_datos.py`, `pedidos/api_views.py` (webhook y mensajes), `cronos_elite/settings.py` (caché compartida y `NUM_PROXIES`), `docker-compose.prod.yml`, `frontend/playwright.config.js`, `frontend/e2e/flujos.spec.js`, `.github/workflows/ci.yml` (job E2E), `docs/DESPLIEGUE.md`, pruebas en `pedidos/test_payments.py` y `usuarios/tests.py`.
