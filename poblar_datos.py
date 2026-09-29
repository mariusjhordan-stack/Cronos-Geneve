"""
Script de inicialización y población de datos académicos para 'Cronos Elite'.
Ejecutar con: python poblar_datos.py
"""

import os
import django
from decimal import Decimal

# Configurar entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')
django.setup()

from catalogo.models import Marca, Categoria, Reloj
from pedidos.models import Orden, DetalleOrden


def poblar():
    print("Iniciando carga de datos de alta relojería en Cronos Elite...")

    # 1. Crear Marcas de Prestigio
    marcas_data = [
        {
            "nombre": "Rolex",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.rolex.com",
            "descripcion": "Manufactura suiza fundada en 1905, pionera en el primer reloj de pulsera hermético Oyster."
        },
        {
            "nombre": "Omega",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.omegawatches.com",
            "descripcion": "Reconocida por cronometrar los Juegos Olímpicos y haber llegado a la Luna con el Speedmaster."
        },
        {
            "nombre": "Patek Philippe",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.patek.com",
            "descripcion": "La máxima cúspide de la alta relojería ginebrina independiente y de gran complicación artesanal."
        },
        {
            "nombre": "Audemars Piguet",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.audemarspiguet.com",
            "descripcion": "Legendaria casa de Le Brassus, creadora del icónico Royal Oak diseñado por Gérald Genta en 1972."
        },
        {
            "nombre": "TAG Heuer",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.tagheuer.com",
            "descripcion": "Líder en cronometraje deportivo de alta precisión, estrechamente ligada al automovilismo de Fórmula 1."
        },
        {
            "nombre": "Grand Seiko",
            "pais_origen": "Japón",
            "sitio_web": "https://www.grand-seiko.com",
            "descripcion": "La cúspide de la precisión japonesa, famosa por el revolucionario movimiento Spring Drive y diales inspirados en la naturaleza."
        }
    ]

    marcas_dict = {}
    for m in marcas_data:
        obj, created = Marca.objects.get_or_create(
            nombre=m["nombre"],
            defaults={
                "pais_origen": m["pais_origen"],
                "sitio_web": m["sitio_web"],
                "descripcion": m["descripcion"]
            }
        )
        marcas_dict[m["nombre"]] = obj
        if created:
            print(f" [+] Marca creada: {obj.nombre}")

    # 2. Crear Categorías
    categorias_data = [
        {"nombre": "Buceo Profesional (Diver)", "descripcion": "Resistencia a altas presiones y bisel giratorio unidireccional."},
        {"nombre": "Cronógrafo de Carreras", "descripcion": "Piezas con escala taquimétrica y medición fraccionaria del tiempo."},
        {"nombre": "Aviador / Aeronáutica", "descripcion": "Esferas de alta legibilidad y escala de cálculo regla de cálculo."},
        {"nombre": "Alta Complicación", "descripcion": "Calendarios perpetuos, fases lunares y tourbillons artesanales."},
        {"nombre": "Reloj de Gala / Vestir", "descripcion": "Diseños ultrafinos en metales nobles y correas de piel exótica."}
    ]

    categorias_dict = {}
    for c in categorias_data:
        obj, created = Categoria.objects.get_or_create(
            nombre=c["nombre"],
            defaults={"descripcion": c["descripcion"]}
        )
        categorias_dict[c["nombre"]] = obj
        if created:
            print(f" [+] Categoría creada: {obj.nombre}")

    # 3. Crear Relojes con Especificaciones Técnicas Rigurosas
    relojes_data = [
        {
            "nombre": "Submariner Date 41mm 'Kermit'",
            "marca": marcas_dict["Rolex"],
            "categorias": [categorias_dict["Buceo Profesional (Diver)"]],
            "precio": Decimal("14500.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("41.0"),
            "cristal": "Zafiro con lente Cyclops sobre la fecha",
            "resistencia_agua_m": 300,
            "material_correa": "Acero Oystersteel con cierre Glidelock",
            "descripcion": "El referente definitivo de los relojes de buceo submarino. Equipado con el calibre de manufactura 3235, espiral Parachrom azul paramagnética y reserva de marcha de 70 horas.",
            "imagen_url": "https://images.unsplash.com/photo-1547996160-71dfabb1d0a5?w=800"
        },
        {
            "nombre": "Cosmograph Daytona 'Panda'",
            "marca": marcas_dict["Rolex"],
            "categorias": [categorias_dict["Cronógrafo de Carreras"]],
            "precio": Decimal("32800.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.0"),
            "cristal": "Zafiro antirreflejos de alta densidad",
            "resistencia_agua_m": 100,
            "material_correa": "Acero Oystersteel con eslabones macizos",
            "descripcion": "El cronógrafo deportivo por excelencia. Diseñado para cumplir con las exigencias de los pilotos de resistencia en las 24 Horas de Daytona. Calibre 4131 con rueda de pilares y embrague vertical.",
            "imagen_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
        },
        {
            "nombre": "Speedmaster Professional 'Moonwatch'",
            "marca": marcas_dict["Omega"],
            "categorias": [categorias_dict["Cronógrafo de Carreras"], categorias_dict["Aviador / Aeronáutica"]],
            "precio": Decimal("7800.00"),
            "stock": 6,
            "movimiento": Reloj.TipoMovimiento.MANUAL,
            "diametro_caja_mm": Decimal("42.0"),
            "cristal": "Cristal de zafiro abombado con tratamiento interior antirreflejos",
            "resistencia_agua_m": 50,
            "material_correa": "Acero inoxidable pulido y cepillado",
            "descripcion": "El legendario cronógrafo que formó parte de los seis alunizajes de la historia espacial humana. Impulsado por el calibre Co-Axial Master Chronometer 3861 certificado por METAS.",
            "imagen_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"
        },
        {
            "nombre": "Seamaster Diver 300M Co-Axial",
            "marca": marcas_dict["Omega"],
            "categorias": [categorias_dict["Buceo Profesional (Diver)"]],
            "precio": Decimal("5900.00"),
            "stock": 5,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("42.0"),
            "cristal": "Zafiro irrayable con tratamiento en ambas caras",
            "resistencia_agua_m": 300,
            "material_correa": "Caucho azul de alta resistencia con hebilla de ardillón",
            "descripcion": "Icónico reloj del agente 007 James Bond. Esfera de cerámica pulida con grabado láser de olas en relieve, válvula de escape de helio cónica y bisel de cerámica con escala en esmalte blanco.",
            "imagen_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800"
        },
        {
            "nombre": "Nautilus 5711/1A Azul Imperial",
            "marca": marcas_dict["Patek Philippe"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"], categorias_dict["Alta Complicación"]],
            "precio": Decimal("118000.00"),
            "stock": 1,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.0"),
            "cristal": "Zafiro ultra fino de transparencia total",
            "resistencia_agua_m": 120,
            "material_correa": "Acero inoxidable integrado con pulido satinado manual",
            "descripcion": "La cumbre del coleccionismo moderno de lujo. Caja con forma de ojo de buey y bisel octogonal suave con aristas biseladas. Movimiento automático calibre 26-330 S C con rotor central en oro de 21 quilates.",
            "imagen_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"
        },
        {
            "nombre": "Royal Oak 'Jumbo' Extra-Thin",
            "marca": marcas_dict["Audemars Piguet"],
            "categorias": [categorias_dict["Alta Complicación"], categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("74500.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.0"),
            "cristal": "Zafiro antirreflejos de alta resistencia",
            "resistencia_agua_m": 50,
            "material_correa": "Brazalete integrado de acero inoxidable",
            "descripcion": "El reloj que revolucionó los estándares del lujo mundial en 1972. Esfera azul noche 'Bleu Nuit, Nuage 50' con motivo Petite Tapisserie y calibre ultrafino 7121 con 55 horas de reserva de marcha.",
            "imagen_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
        },
        {
            "nombre": "Monaco Calibre 11 'Steve McQueen'",
            "marca": marcas_dict["TAG Heuer"],
            "categorias": [categorias_dict["Cronógrafo de Carreras"]],
            "precio": Decimal("8100.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.0"),
            "cristal": "Zafiro biselado y abombado",
            "resistencia_agua_m": 100,
            "material_correa": "Piel de becerro perforada estilo competición",
            "descripcion": "El primer cronógrafo automático cuadrado hermético del mundo. Inmortalizado por el astro Steve McQueen en el rodaje de la película de culto 'Le Mans'. Corona situada a la izquierda en homenaje a la pieza original de 1969.",
            "imagen_url": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800"
        },
        {
            "nombre": "Grand Seiko Heritage 'Snowflake' SBGA211",
            "marca": marcas_dict["Grand Seiko"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("6200.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.SOLAR,
            "diametro_caja_mm": Decimal("41.0"),
            "cristal": "Zafiro de doble curvatura de máxima claridad",
            "resistencia_agua_m": 100,
            "material_correa": "Titanio de alta intensidad pulido Zaratsu",
            "descripcion": "El modelo insignia de la relojería nipona de alta gama. Su esfera reproduce la textura de la nieve fresca en las montañas de Shinshu. Movimiento Spring Drive 9R65 que desliza la aguja de segundos con fluidez perpetua y absoluta.",
            "imagen_url": "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800"
        }
    ]

    for data in relojes_data:
        cats = data.pop("categorias")
        obj, created = Reloj.objects.get_or_create(
            nombre=data["nombre"],
            marca=data["marca"],
            defaults=data
        )
        if created:
            obj.categorias.set(cats)
            print(f" [+] Reloj registrado: {obj.marca.nombre} {obj.nombre} (${obj.precio})")

    # 4. Crear una Orden de Demostración
    if not Orden.objects.exists():
        reloj_demo = Reloj.objects.first()
        orden = Orden.objects.create(
            cliente_nombre="Ignacio De La Torre",
            cliente_email="ignacio.torre@clubfinanciero.pe",
            cliente_telefono="+51 999 888 777",
            direccion_envio="Malecón de la Reserva 715, Piso 14",
            ciudad="Miraflores, Lima",
            estado=Orden.EstadoOrden.PAGADO,
            notas="Entrega confidencial con escolta privada."
        )
        DetalleOrden.objects.create(
            orden=orden,
            reloj=reloj_demo,
            precio_unitario=reloj_demo.precio,
            cantidad=1
        )
        print(f" [+] Orden de prueba generada: Orden #{orden.id:05d} para {orden.cliente_nombre}")

    print("\n¡Base de datos de Cronos Elite poblada exitosamente con catálogo de lujo y orden de prueba!")


if __name__ == '__main__':
    poblar()
