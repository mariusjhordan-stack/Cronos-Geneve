from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from catalogo.serializers import RelojSerializer
from .models import Direccion, Favorito, Perfil

User = get_user_model()


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ['telefono', 'creado_en', 'actualizado_en']
        read_only_fields = ['creado_en', 'actualizado_en']


class UsuarioSerializer(serializers.ModelSerializer):
    perfil = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'date_joined', 'perfil']
        read_only_fields = ['id', 'username', 'email', 'date_joined']

    def get_perfil(self, obj):
        perfil, _ = Perfil.objects.get_or_create(usuario=obj)
        return PerfilSerializer(perfil).data


class RegistroSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Este nombre de usuario ya está registrado.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
        candidate = User(username=attrs['username'], email=attrs['email'])
        try:
            validate_password(attrs['password'], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages}) from None
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            Perfil.objects.create(usuario=user)
        return user


class DireccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        exclude = ['usuario']
        read_only_fields = ['creado_en', 'actualizado_en']


class FavoritoSerializer(serializers.ModelSerializer):
    reloj_detalle = RelojSerializer(source='reloj', read_only=True)

    class Meta:
        model = Favorito
        fields = ['id', 'reloj', 'reloj_detalle', 'creado_en']
        read_only_fields = ['id', 'reloj_detalle', 'creado_en']


class AgregarFavoritoSerializer(serializers.Serializer):
    reloj_id = serializers.IntegerField(min_value=1)
