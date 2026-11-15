# Cronos Genève

Aplicación de alta relojería con **Django + Django REST Framework** para la API y **React + Vite + Tailwind CSS** para la experiencia web. Autenticación mediante JWT y pagos de prueba con Mercado Pago Checkout Pro.

## Desarrollo local

Requisitos: Python 3.11+ y Node.js/npm.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python poblar_datos.py
python manage.py runserver
```

En otra terminal:

```powershell
cd frontend
npm ci
npm run dev
```

La configuración local puede usar SQLite. Copia `.env.example` a `.env` y completa solo las credenciales de prueba si vas a probar Checkout Pro. Nunca guardes tokens o secretos en Git.

## Comprobaciones

```powershell
python manage.py check
python manage.py test
python manage.py check_mercadopago
cd frontend
npm run build
```

## Despliegue de demostración en Render

El `render.yaml` prepara tres servicios: React como sitio estático, Django como web service y PostgreSQL. La SPA usa una regla de rewrite para que React Router atienda las rutas internas. Django recibe `DATABASE_URL`, recopila estáticos con WhiteNoise, migra el esquema e inserta el catálogo inicial sin importar el SQLite local ni sus usuarios u órdenes.

Después de conectar el repositorio en Render, el Blueprint solicita `FRONTEND_URL`, `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET`. Introduce las credenciales de prueba directamente en Render, nunca en el repositorio. `MERCADOPAGO_ENVIRONMENT` permanece en `test`; el retorno apunta al frontend HTTPS y el webhook al host HTTPS de Django.

El Blueprint está en **plan gratuito solo para demostración**: los servicios web pueden suspenderse por inactividad y la base PostgreSQL gratuita vence a los 30 días. No uses esos recursos para pedidos o pagos reales; selecciona recursos de pago duraderos antes de depender del despliegue.

El despliegue crea una base vacía en PostgreSQL y carga solo el catálogo. La base SQLite local se conserva intacta y sus datos personales, usuarios y órdenes históricas no se transfieren automáticamente.
