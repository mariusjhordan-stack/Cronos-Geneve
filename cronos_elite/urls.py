"""
URL configuration for Cronos Elite project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Personalización del panel administrativo
admin.site.site_header = "Cronos Elite - Panel de Alta Relojería"
admin.site.site_title = "Cronos Elite Admin"
admin.site.index_title = "Gestión de Inventario y Operaciones"

urlpatterns = [
    # Panel de Administración de Django
    path('admin/', admin.site.urls),

    # Endpoints de API REST (DRF) para Frontend desacoplado
    path('api/', include('catalogo.api_urls')),
    path('api/pedidos/', include('pedidos.api_urls')),

    # Módulo de Pedidos y Transacciones (Templates Django legados)
    path('pedidos/', include('pedidos.urls')),

    # Frontend Renderizado por Django (Catálogo, Detalles, Comparador)
    path('', include('catalogo.urls')),
]

# Servir archivos multimedia en entorno de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
