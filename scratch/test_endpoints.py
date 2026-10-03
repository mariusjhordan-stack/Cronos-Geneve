import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')
django.setup()

from django.test import Client

c = Client()
r_list = c.get('/api/relojes/')
print(f"GET /api/relojes/ Status: {r_list.status_code}")
data = r_list.json()
print(f"Total count: {data.get('count')}")
first = data['results'][0]
print(f"First item: ID={first['id']}, {first['nombre']}")
print(f"  imagen_url: {first['imagen_url'][:60]}...")
print(f"  imagenes: {len(first['imagenes'])} items")

r_detail = c.get(f"/api/relojes/{first['id']}/")
print(f"\nGET /api/relojes/{first['id']}/ Status: {r_detail.status_code}")
det = r_detail.json()
print(f"Detail name: {det['nombre']}")
print(f"Detail imagenes: {len(det['imagenes'])} items")
for img in det['imagenes']:
    print(f"  - Orden {img['orden']}: {img['url'][:70]}... | Alt: {img['alt_text']}")
