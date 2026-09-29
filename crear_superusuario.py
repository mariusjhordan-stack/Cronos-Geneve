"""
Script para crear superusuario predeterminado en entornos de desarrollo académico.
Usuario: admin
Contraseña: admin123password
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')
django.setup()

from django.contrib.auth.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@cronoselite.com', 'admin123password')
    print("Superusuario 'admin' creado exitosamente (Clave: admin123password).")
else:
    print("El superusuario 'admin' ya existe en la base de datos.")
