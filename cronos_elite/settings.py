"""
Django settings for Cronos Elite project.
Desarrollado con fines académicos y de producción para arquitectura desacoplada.
"""

from pathlib import Path
import os
import re
import sys
from datetime import timedelta
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def _load_local_payment_env(env_path):
    """Load only Mercado Pago settings from the local .env without overriding process env."""
    payment_keys = {
        'PUBLIC_BASE_URL',
        'FRONTEND_URL',
        'BACKEND_PUBLIC_URL',
        'MERCADOPAGO_RETURN_BASE_URL',
        'MERCADOPAGO_WEBHOOK_URL',
        'MERCADOPAGO_ACCESS_TOKEN',
        'MERCADOPAGO_ENVIRONMENT',
        'MERCADOPAGO_WEBHOOK_SECRET',
        'MERCADOPAGO_WEBHOOK_URL',
        'MERCADOPAGO_RETURN_BASE_URL',
        'MERCADOPAGO_USD_PEN_RATE',
        'MERCADOPAGO_RESERVATION_MINUTES',
    }
    try:
        lines = env_path.read_text(encoding='utf-8-sig').splitlines()
    except FileNotFoundError:
        return

    for line in lines:
        entry = line.strip()
        if not entry or entry.startswith('#'):
            continue
        if entry.startswith('export '):
            entry = entry[7:].lstrip()
        key, separator, value = entry.partition('=')
        key = key.strip()
        if not separator or key not in payment_keys:
            continue
        if os.environ.get(key, '').strip():
            continue

        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        else:
            value = re.split(r'\s+#', value, maxsplit=1)[0].rstrip()
        os.environ[key] = value


_load_local_payment_env(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '').strip()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'true').strip().lower() in {'1', 'true', 'yes', 'on'}
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured('Configura DJANGO_SECRET_KEY fuera del entorno de desarrollo.')
    SECRET_KEY = 'development-only-key-do-not-use-in-production'

FRONTEND_URL = os.environ.get('FRONTEND_URL', '').strip().rstrip('/')
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '').strip()
BACKEND_PUBLIC_URL = (
    os.environ.get('BACKEND_PUBLIC_URL', '').strip().rstrip('/')
    or (f'https://{RENDER_EXTERNAL_HOSTNAME}' if RENDER_EXTERNAL_HOSTNAME else '')
)
ALLOWED_HOSTS = [host.strip() for host in os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',') if host.strip()]
if RENDER_EXTERNAL_HOSTNAME and RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
if DEBUG:
    ALLOWED_HOSTS.extend(host for host in ('localhost', '127.0.0.1', '.trycloudflare.com') if host not in ALLOWED_HOSTS)
elif not ALLOWED_HOSTS:
    raise ImproperlyConfigured('Configura DJANGO_ALLOWED_HOSTS para el entorno de producción.')

# Application definition
INSTALLED_APPS = [
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',

    # Local apps
    'catalogo.apps.CatalogoConfig',
    'pedidos.apps.PedidosConfig',
    'usuarios.apps.UsuariosConfig',
]

MIDDLEWARE = [
    # CorsMiddleware debe ir antes de CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
if not DEBUG:
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')

ROOT_URLCONF = 'cronos_elite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'pedidos.context_processors.carrito_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'cronos_elite.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
if DATABASE_URL:
    try:
        import dj_database_url
    except ImportError as exc:
        raise ImproperlyConfigured('Instala dj-database-url para usar DATABASE_URL.') from exc
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=(not DEBUG) and os.environ.get('DB_SSL_REQUIRE', 'true').strip().lower() in {'1', 'true', 'yes', 'on'},
        )
    }
elif DEBUG:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
else:
    raise ImproperlyConfigured('Configura DATABASE_URL PostgreSQL para el entorno de producción.')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'usuarios.password_validators.PasswordComplexityValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Lima'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
if not DEBUG:
    STORAGES = {
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
    }

# Media files (Archivos cargados por usuarios/administradores)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================
# CONFIGURACIÓN DE CORS (Cross-Origin Resource Sharing)
# Permite conexiones desde Vite/React (5173, 5174) o Next.js/React (3000)
# ==========================================
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
configured_cors_origins = [origin.strip().rstrip('/') for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()]
if not DEBUG:
    CORS_ALLOWED_ORIGINS = []
for origin in configured_cors_origins + ([FRONTEND_URL] if FRONTEND_URL else []):
    if origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(origin)

CORS_ALLOWED_ORIGIN_REGEXES = [r'^https://.*\.trycloudflare\.com$'] if DEBUG else []

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://*.trycloudflare.com',
]
configured_csrf_origins = [origin.strip().rstrip('/') for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()]
if not DEBUG:
    CSRF_TRUSTED_ORIGINS = []
for origin in configured_csrf_origins + [value for value in (FRONTEND_URL, BACKEND_PUBLIC_URL) if value]:
    if origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)

CORS_ALLOW_CREDENTIALS = True

# URL pública configurada para el túnel de desarrollo (Cloudflare) o entorno desplegado.
# FUENTE ÚNICA DE VERDAD para URLs públicas de retornos y webhooks de pasarelas de pago.
PUBLIC_BASE_URL = os.environ.get('PUBLIC_BASE_URL', '').strip().rstrip('/')
if PUBLIC_BASE_URL and PUBLIC_BASE_URL.startswith('https://'):
    if PUBLIC_BASE_URL not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(PUBLIC_BASE_URL)
    if PUBLIC_BASE_URL not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(PUBLIC_BASE_URL)

# Mercado Pago Checkout Pro: exclusivamente tokens TEST hasta una decisión
# explícita de salida a producción. El tipo de cambio debe configurarse
# manualmente; el proyecto almacena los precios del catálogo en USD.
MERCADOPAGO_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN', '').strip()
MERCADOPAGO_ENVIRONMENT = os.environ.get('MERCADOPAGO_ENVIRONMENT', '').strip().lower()
MERCADOPAGO_WEBHOOK_SECRET = os.environ.get('MERCADOPAGO_WEBHOOK_SECRET', '').strip()
# Derivadas de PUBLIC_BASE_URL como fuente única de verdad.
MERCADOPAGO_RETURN_BASE_URL = os.environ.get('MERCADOPAGO_RETURN_BASE_URL', '').strip() or FRONTEND_URL or PUBLIC_BASE_URL
MERCADOPAGO_WEBHOOK_URL = os.environ.get('MERCADOPAGO_WEBHOOK_URL', '').strip() or (
    f'{BACKEND_PUBLIC_URL or PUBLIC_BASE_URL}/api/pedidos/webhooks/mercadopago/' if (BACKEND_PUBLIC_URL or PUBLIC_BASE_URL) else ''
)
MERCADOPAGO_USD_PEN_RATE = os.environ.get('MERCADOPAGO_USD_PEN_RATE', '').strip()
MERCADOPAGO_RESERVATION_MINUTES = int(os.environ.get('MERCADOPAGO_RESERVATION_MINUTES', '30'))
MERCADOPAGO_API_BASE_URL = 'https://api.mercadopago.com'

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    # HSTS: empieza en 1 hora; subir a 31536000 (1 año) por entorno cuando HTTPS esté validado en el dominio final.
    SECURE_HSTS_SECONDS = int(os.environ.get('DJANGO_HSTS_SECONDS', '3600'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get('DJANGO_HSTS_SUBDOMAINS', 'false').lower() in {'1', 'true', 'yes'}
    SECURE_HSTS_PRELOAD = False
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'
    # El health check del orquestador llega por HTTP interno: no debe redirigirse a HTTPS.
    SECURE_REDIRECT_EXEMPT = [r'^healthz/?$']

# Caché compartida entre workers de gunicorn: sin ella, cada worker lleva su propio contador y el límite de
# peticiones (throttling) no se cumple. Usa la propia base de datos (`python manage.py createcachetable`).
if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'django_cache',
        }
    }

# Ruta del panel de administración configurable (evita el /admin/ por defecto que escanean los bots).
ADMIN_URL = os.environ.get('DJANGO_ADMIN_URL', 'admin/').strip().lstrip('/')
if ADMIN_URL and not ADMIN_URL.endswith('/'):
    ADMIN_URL += '/'

# Las pruebas automáticas ejecutan decenas de logins/checkouts seguidos: se relajan los límites (la prueba de throttling fija el suyo).
TESTING = 'test' in sys.argv

# Registros a consola (stdout) con formato legible por Render/Docker/CloudWatch.
LOG_LEVEL = os.environ.get('DJANGO_LOG_LEVEL', 'INFO' if not DEBUG else 'DEBUG').upper()
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {'format': '%(asctime)s %(levelname)s %(name)s %(message)s'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'standard'},
    },
    'root': {'handlers': ['console'], 'level': LOG_LEVEL},
    'loggers': {
        'django.request': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'django.security': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
    },
}

# ==========================================
# CONFIGURACIÓN DE DJANGO REST FRAMEWORK (DRF)
# ==========================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    # Nº de proxies de confianza delante de Django (nginx + balanceador TLS): el límite se aplica por cliente real,
    # no por la IP del proxy. Render = 1; docker-compose con proxy TLS delante de nginx = 2.
    'NUM_PROXIES': int(os.environ.get('DJANGO_NUM_PROXIES', '1')),
    # Limitación de peticiones: frena fuerza bruta en login/registro y abuso del checkout.
    'DEFAULT_THROTTLE_RATES': {
        'auth': os.environ.get('THROTTLE_AUTH_RATE', '100000/min' if TESTING else '10/min'),
        'register': os.environ.get('THROTTLE_REGISTER_RATE', '100000/min' if TESTING else '10/hour'),
        'checkout': os.environ.get('THROTTLE_CHECKOUT_RATE', '100000/min' if TESTING else '20/min'),
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
