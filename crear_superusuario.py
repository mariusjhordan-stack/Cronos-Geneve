"""Invoca el flujo interactivo de Django para crear un superusuario."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')
django.setup()

from django.core.management import call_command

call_command('createsuperuser', interactive=True)
