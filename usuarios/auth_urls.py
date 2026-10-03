from django.urls import path
from .api_views import LoginAPIView, LogoutAPIView, MeAPIView, RefreshAPIView, RegistroAPIView

urlpatterns = [
    path('register/', RegistroAPIView.as_view(), name='auth_register'),
    path('login/', LoginAPIView.as_view(), name='auth_login'),
    path('refresh/', RefreshAPIView.as_view(), name='auth_refresh'),
    path('logout/', LogoutAPIView.as_view(), name='auth_logout'),
    path('me/', MeAPIView.as_view(), name='auth_me'),
]
