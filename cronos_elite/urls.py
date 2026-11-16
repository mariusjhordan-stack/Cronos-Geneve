"""
URL configuration for Cronos Elite project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Personalización del panel administrativo
admin.site.site_header = "Cronos Elite - Panel de Alta Relojería"
admin.site.site_title = "Cronos Elite Admin"
admin.site.index_title = "Gestión de Inventario y Operaciones"

def healthz(request):
    """Health check del balanceador/orquestador: confirma que la app responde y la BD es alcanzable."""
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except Exception:
        return JsonResponse({'status': 'error'}, status=503)
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('healthz/', healthz, name='healthz'),
    # Panel de Administración de Django (ruta configurable con DJANGO_ADMIN_URL)
    path(settings.ADMIN_URL, admin.site.urls),

    # Endpoints de API REST (DRF) para Frontend desacoplado
    path('api/', include('catalogo.api_urls')),
    path('api/auth/', include('usuarios.auth_urls')),
    path('api/me/', include('pedidos.me_urls')),
    path('api/', include('usuarios.api_urls')),
    path('api/pedidos/', include('pedidos.api_urls')),

    # Módulo de Pedidos y Transacciones (Templates Django legados)
    path('pedidos/', include('pedidos.urls')),

    # Redirección de retorno para pasarelas en caso de acceso directo al backend
    path('pago/retorno', include([
        path('', include('pedidos.retorno_urls')),
    ])),

    # Frontend Renderizado por Django (Catálogo, Detalles, Comparador)
    path('', include('catalogo.urls')),
]

# Servir archivos multimedia en entorno de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
