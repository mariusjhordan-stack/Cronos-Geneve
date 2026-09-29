"""
WSGI config for Cronos Elite project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')

application = get_wsgi_application()
