"""
ASGI config for Cronos Elite project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')

application = get_asgi_application()
