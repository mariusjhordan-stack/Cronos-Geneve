from django.urls import path
from .views import pago_retorno_redirect

urlpatterns = [
    path('', pago_retorno_redirect, name='retorno_pago_redirect'),
]
