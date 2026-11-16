"""
Sincroniza la galería (ImagenReloj) con los assets locales generados por
frontend/scripts/process_watch_images.py  ->  frontend/public/images/relojes/manifest.json

    python manage.py sincronizar_imagenes            # crea/actualiza y retira galerías externas (hotlinks)
    python manage.py sincronizar_imagenes --simular  # muestra qué haría, sin escribir

Por qué existe: la galería anterior apuntaba a miniaturas de Google, tiendas de reventa y CDNs de marcas
(sin licencia verificable y de 225-554 px). Los assets viven ahora en el repositorio y este comando es la
única vía para enlazarlos a los relojes, de forma idempotente.
"""
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalogo.models import ImagenReloj, Reloj

MANIFEST = Path(settings.BASE_DIR) / 'frontend' / 'public' / 'images' / 'relojes' / 'manifest.json'


def sincronizar(manifest_path=MANIFEST, simular=False, escribir=print):
    if not Path(manifest_path).exists():
        raise CommandError(f'No existe {manifest_path}. Ejecuta frontend/scripts/process_watch_images.py primero.')
    data = json.loads(Path(manifest_path).read_text(encoding='utf-8'))
    resumen = {'relojes': 0, 'creadas': 0, 'actualizadas': 0, 'retiradas': 0, 'sin_reloj': []}

    with transaction.atomic():
        for slug, entry in data.items():
            reloj = Reloj.objects.filter(nombre=entry['reloj'], marca__nombre=entry['marca']).first()
            if reloj is None:
                resumen['sin_reloj'].append(entry['reloj'])
                continue
            resumen['relojes'] += 1
            ordenes = set()
            # Se libera la bandera antes de reasignarla para no chocar con la restricción de principal única.
            ImagenReloj.objects.filter(reloj=reloj, es_principal=True).update(es_principal=False)
            for img in sorted(entry['imagenes'], key=lambda i: i['orden']):
                ordenes.add(img['orden'])
                _, creada = ImagenReloj.objects.update_or_create(
                    reloj=reloj, orden=img['orden'],
                    defaults={
                        'url': img['url'], 'url_card': img['url_card'], 'es_principal': img['es_principal'],
                        'tipo': img['tipo'], 'alt_text': img['alt_text'],
                    },
                )
                resumen['creadas' if creada else 'actualizadas'] += 1
            sobrantes = ImagenReloj.objects.filter(reloj=reloj).exclude(orden__in=ordenes)
            resumen['retiradas'] += sobrantes.count()
            sobrantes.delete()
            principal = next(i for i in entry['imagenes'] if i['es_principal'])
            Reloj.objects.filter(pk=reloj.pk).update(imagen_url=principal['url'])
        if simular:
            transaction.set_rollback(True)
    return resumen


class Command(BaseCommand):
    help = 'Enlaza los assets locales de imagen con la galería de cada reloj (idempotente).'

    def add_arguments(self, parser):
        parser.add_argument('--simular', action='store_true', help='No guarda cambios.')

    def handle(self, *args, **options):
        r = sincronizar(simular=options['simular'])
        self.stdout.write(self.style.SUCCESS(
            f"{r['relojes']} relojes | {r['creadas']} creadas, {r['actualizadas']} actualizadas, {r['retiradas']} retiradas"
            + (' (simulación)' if options['simular'] else '')
        ))
        for nombre in r['sin_reloj']:
            self.stdout.write(self.style.WARNING(f'Sin reloj en BD: {nombre}'))
