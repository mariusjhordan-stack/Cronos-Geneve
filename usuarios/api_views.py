from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from catalogo.models import Reloj
from .models import Direccion, Favorito, Perfil
from .serializers import (
    AgregarFavoritoSerializer,
    DireccionSerializer,
    FavoritoSerializer,
    PerfilSerializer,
    RegistroSerializer,
    UsuarioSerializer,
)

class RegistroAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegistroSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UsuarioSerializer(self.user).data
        return data


class LoginAPIView(TokenObtainPairView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = LoginTokenSerializer


class RefreshAPIView(TokenRefreshView):
    permission_classes = [AllowAny]
    authentication_classes = []


class LogoutAPIView(APIView):
    # AllowAny a propósito: el refresh token es la credencial que se revoca,
    # por lo que el logout debe funcionar aunque el access token haya expirado.
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        raw_refresh = request.data.get('refresh') if isinstance(request.data, dict) else None
        if not raw_refresh:
            return Response({'detail': 'Se requiere el refresh token.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(raw_refresh)
            token.blacklist()
        except (TokenError, AttributeError, ValueError):
            return Response({'detail': 'Token no válido o ya revocado.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Perfil.objects.get_or_create(usuario=request.user)
        return Response(UsuarioSerializer(request.user).data)


class PerfilAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_profile_payload(self, user, perfil):
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'telefono': perfil.telefono,
            'creado_en': perfil.creado_en,
            'actualizado_en': perfil.actualizado_en,
            'date_joined': user.date_joined,
            'perfil': PerfilSerializer(perfil).data,
        }

    def get(self, request):
        perfil, _ = Perfil.objects.get_or_create(usuario=request.user)
        return Response(self._get_profile_payload(request.user, perfil))

    def patch(self, request):
        perfil, _ = Perfil.objects.get_or_create(usuario=request.user)
        user = request.user

        user_fields_to_update = []
        if 'first_name' in request.data:
            user.first_name = str(request.data.get('first_name') or '').strip()
            user_fields_to_update.append('first_name')
        if 'last_name' in request.data:
            user.last_name = str(request.data.get('last_name') or '').strip()
            user_fields_to_update.append('last_name')

        perfil_fields_to_update = []
        if 'telefono' in request.data:
            perfil.telefono = str(request.data.get('telefono') or '').strip()
            perfil_fields_to_update.extend(['telefono', 'actualizado_en'])

        with transaction.atomic():
            if user_fields_to_update:
                user.save(update_fields=user_fields_to_update)
            if perfil_fields_to_update:
                perfil.save(update_fields=perfil_fields_to_update)

        return Response(self._get_profile_payload(user, perfil))


class DireccionesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = DireccionSerializer(Direccion.objects.filter(usuario=request.user), many=True).data
        return Response(data)

    def post(self, request):
        serializer = DireccionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            es_primera = not Direccion.objects.filter(usuario=request.user).exists()
            should_be_default = bool(serializer.validated_data.get('es_predeterminada')) or es_primera

            if should_be_default:
                Direccion.objects.filter(usuario=request.user, es_predeterminada=True).update(es_predeterminada=False)

            direccion = serializer.save(usuario=request.user, es_predeterminada=should_be_default)
        return Response(DireccionSerializer(direccion).data, status=status.HTTP_201_CREATED)


class DireccionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(Direccion, pk=pk, usuario=request.user)

    def get(self, request, pk):
        return Response(DireccionSerializer(self.get_object(request, pk)).data)

    def patch(self, request, pk):
        direccion = self.get_object(request, pk)
        serializer = DireccionSerializer(direccion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            cambio_predeterminada = serializer.validated_data.get('es_predeterminada')
            if cambio_predeterminada is True:
                # Caso B: Marcar como predeterminada desmarca todas las demás del usuario
                Direccion.objects.filter(usuario=request.user, es_predeterminada=True).exclude(pk=direccion.pk).update(es_predeterminada=False)
            elif cambio_predeterminada is False and direccion.es_predeterminada:
                # Si se desmarca la actual predeterminada y existen otras direcciones, promover la más reciente
                otros = Direccion.objects.filter(usuario=request.user).exclude(pk=direccion.pk).order_by('-actualizado_en', '-id')
                if otros.exists():
                    siguiente = otros.first()
                    siguiente.es_predeterminada = True
                    siguiente.save(update_fields=['es_predeterminada', 'actualizado_en'])
                else:
                    # Es la única dirección, debe permanecer predeterminada
                    serializer.validated_data['es_predeterminada'] = True

            direccion = serializer.save()
        return Response(DireccionSerializer(direccion).data)

    def delete(self, request, pk):
        direccion = self.get_object(request, pk)
        with transaction.atomic():
            era_predeterminada = direccion.es_predeterminada
            direccion.delete()
            if era_predeterminada:
                # Caso D: Eliminar la predeterminada promueve otra dirección de forma determinista (-actualizado_en, -id)
                # Caso E: Si era la única, no hay siguiente y queda en 0 direcciones limpiamente
                siguiente = Direccion.objects.filter(usuario=request.user).order_by('-actualizado_en', '-id').first()
                if siguiente:
                    siguiente.es_predeterminada = True
                    siguiente.save(update_fields=['es_predeterminada', 'actualizado_en'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoritosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favoritos = Favorito.objects.filter(usuario=request.user).select_related(
            'reloj', 'reloj__marca'
        ).prefetch_related('reloj__categorias')
        return Response(FavoritoSerializer(favoritos, many=True).data)

    def post(self, request):
        input_serializer = AgregarFavoritoSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        reloj = get_object_or_404(Reloj, pk=input_serializer.validated_data['reloj_id'])
        try:
            with transaction.atomic():
                favorito = Favorito.objects.create(usuario=request.user, reloj=reloj)
        except IntegrityError:
            return Response({'detail': 'Este reloj ya está en favoritos.'}, status=status.HTTP_409_CONFLICT)
        return Response(FavoritoSerializer(favorito).data, status=status.HTTP_201_CREATED)


class FavoritoDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, reloj_id):
        favorito = get_object_or_404(Favorito, usuario=request.user, reloj_id=reloj_id)
        favorito.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
