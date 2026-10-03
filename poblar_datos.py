"""
Script de inicialización y población de datos académicos para 'Cronos Elite' / 'Cronos Genève'.
Ejecutar con: python poblar_datos.py
Catálogo oficial FASE 1: 24 guardatiempos de alta manufactura con imágenes verificadas.
"""

import os
import django
from decimal import Decimal

# Configurar entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cronos_elite.settings')
django.setup()

from catalogo.models import Marca, Categoria, Reloj, ImagenReloj
from pedidos.models import Orden, DetalleOrden


def poblar():
    print("Iniciando carga de catálogo de alta relojería en Cronos Genève...")

    # 1. Crear Marcas de Prestigio
    marcas_data = [
        {
            "nombre": "Rolex",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.rolex.com",
            "descripcion": "Manufactura suiza fundada en 1905 en Ginebra, pionera en el primer reloj de pulsera hermético Oyster y líder indiscutible en cronometría de precisión."
        },
        {
            "nombre": "Omega",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.omegawatches.com",
            "descripcion": "Casa de Biel/Bienne fundada en 1848, célebre por haber alcanzado la Luna con el Speedmaster y cronometrar los Juegos Olímpicos con tecnología Co-Axial Master Chronometer."
        },
        {
            "nombre": "Patek Philippe",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.patek.com",
            "descripcion": "La máxima cúspide de la alta relojería ginebrina independiente desde 1839, custodia de las más refinadas complicaciones y acabados tradicionales artesanos."
        },
        {
            "nombre": "Audemars Piguet",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.audemarspiguet.com",
            "descripcion": "Legendaria casa de Le Brassus fundada en 1875, creadora del icónico Royal Oak diseñado por Gérald Genta en 1972 que revolucionó el concepto del lujo en acero."
        },
        {
            "nombre": "Cartier",
            "pais_origen": "Francia",
            "sitio_web": "https://www.cartier.com",
            "descripcion": "Fundada en París en 1847, pionera en la creación del primer reloj de pulsera para aviación con el Santos en 1904 y maestra de siluetas geométricas emblemáticas como el Tank."
        },
        {
            "nombre": "TAG Heuer",
            "pais_origen": "Suiza",
            "sitio_web": "https://www.tagheuer.com",
            "descripcion": "Líder en cronometraje deportivo de alta precisión desde 1860, pionera del cronógrafo automático y estrechamente vinculada a la velocidad y al automovilismo histórico."
        },
        {
            "nombre": "Grand Seiko",
            "pais_origen": "Japón",
            "sitio_web": "https://www.grand-seiko.com",
            "descripcion": "La cima de la precisión y maestría artesanal japonesa desde 1960, distinguida por el pulido Zaratsu sin distorsiones y el movimiento revolucionario Spring Drive."
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
        if not created:
            obj.pais_origen = m["pais_origen"]
            obj.sitio_web = m["sitio_web"]
            obj.descripcion = m["descripcion"]
            obj.save()
        marcas_dict[m["nombre"]] = obj
        action = "creada" if created else "actualizada"
        print(f" [+] Marca {action}: {obj.nombre}")

    # 2. Crear Categorías Horológicas
    categorias_data = [
        {"nombre": "Buceo Profesional (Diver)", "descripcion": "Resistencia a altas presiones submarinas y bisel giratorio graduado para control de inmersión."},
        {"nombre": "Cronógrafo de Carreras", "descripcion": "Piezas con complicación de cronógrafo, escala taquimétrica y medición fraccionaria de intervalos de tiempo."},
        {"nombre": "Aviador / Aeronáutica", "descripcion": "Esferas de alta legibilidad, husos horarios GMT de 24 horas y escalas de navegación."},
        {"nombre": "Alta Complicación", "descripcion": "Calendarios perpetuos, cajas acústicas, tourbillons y calibres mecánicos de máxima complejidad artesanal."},
        {"nombre": "Reloj de Gala / Vestir", "descripcion": "Líneas puras, perfiles ultrafinos, geometrías nobles y correas elegantes pensadas para ocasiones solemnes."}
    ]

    categorias_dict = {}
    for c in categorias_data:
        obj, created = Categoria.objects.get_or_create(
            nombre=c["nombre"],
            defaults={"descripcion": c["descripcion"]}
        )
        if not created:
            obj.descripcion = c["descripcion"]
            obj.save()
        categorias_dict[c["nombre"]] = obj
        action = "creada" if created else "actualizada"
        print(f" [+] Categoría {action}: {obj.nombre}")

    # 3. Catálogo Oficial: 24 Guardatiempos de Manufactura
    relojes_data = [
        # --- ROLEX (5 modelos) ---
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
            "descripcion": "El referente definitivo de los relojes de buceo submarino. Equipado con el calibre de manufactura 3235, espiral Parachrom azul paramagnética, reserva de marcha de 70 horas y bisel Cerachrom verde graduado.",
            "imagen_url": "/images/relojes/rolex-submariner-kermit.svg"
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
            "descripcion": "El cronógrafo deportivo por excelencia. Diseñado para cumplir con las exigencias de los pilotos de resistencia en las 24 Horas de Daytona. Calibre de manufactura 4131 con rueda de pilares y embrague vertical.",
            "imagen_url": "/images/relojes/rolex-daytona-panda.svg"
        },
        {
            "nombre": "Datejust 41 Esfera Azul Fluted",
            "marca": marcas_dict["Rolex"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("11200.00"),
            "stock": 5,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("41.0"),
            "cristal": "Zafiro con lente Cyclops magnificadora",
            "resistencia_agua_m": 100,
            "material_correa": "Acero Oystersteel con brazalete Jubilee de cinco eslabones",
            "descripcion": "El arquetipo del reloj clásico moderno. Bisel estriado en oro blanco de 18 quilates, esfera azul brillante con acabado sol y calibre 3235 con escape Chronergy de alta eficiencia energética.",
            "imagen_url": "/images/relojes/rolex-datejust-41.svg"
        },
        {
            "nombre": "GMT-Master II 'Pepsi' 40mm",
            "marca": marcas_dict["Rolex"],
            "categorias": [categorias_dict["Aviador / Aeronáutica"]],
            "precio": Decimal("19800.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.0"),
            "cristal": "Zafiro con lente Cyclops sobre la fecha",
            "resistencia_agua_m": 100,
            "material_correa": "Acero Oystersteel con brazalete Jubilee y cierre Oysterlock",
            "descripcion": "Concebido originalmente para pilotos transcontinentales. Bisel giratorio bidireccional con disco Cerachrom bicolor rojo y azul de 24 horas y aguja GMT de ajuste independiente para lectura simultánea de dos husos horarios.",
            "imagen_url": "/images/relojes/rolex-gmt-master-pepsi.svg"
        },
        {
            "nombre": "Explorer 36mm Esfera Negra",
            "marca": marcas_dict["Rolex"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("8900.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("36.0"),
            "cristal": "Zafiro resistente al rayado",
            "resistencia_agua_m": 100,
            "material_correa": "Acero Oystersteel con extensión de confort Easylink",
            "descripcion": "Homenaje a la histórica expedición del Everest en 1953. Proporciones clásicas de 36 mm con esfera negra lacada pura, numerales 3, 6 y 9 característicos y visualización Chromalight de alta visibilidad.",
            "imagen_url": "/images/relojes/rolex-explorer-36.svg"
        },

        # --- OMEGA (4 modelos) ---
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
            "descripcion": "El legendario cronógrafo que formó parte de los seis alunizajes de la historia espacial humana. Impulsado por el calibre Co-Axial Master Chronometer 3861 resistente a campos magnéticos extremos de 15,000 gauss.",
            "imagen_url": "/images/relojes/omega-speedmaster-moonwatch.svg"
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
            "descripcion": "Referencia de inmersión técnica profesional. Esfera de cerámica azul pulida con grabado láser de olas en relieve, válvula de escape de helio cónica y bisel de cerámica con escala en esmalte blanco.",
            "imagen_url": "/images/relojes/omega-seamaster-diver-300m.svg"
        },
        {
            "nombre": "Seamaster Aqua Terra 150M 41mm",
            "marca": marcas_dict["Omega"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("6400.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("41.0"),
            "cristal": "Zafiro abombado con tratamiento antirreflejos en ambas caras",
            "resistencia_agua_m": 150,
            "material_correa": "Acero inoxidable con eslabones centrales pulidos",
            "descripcion": "Tributo al legado marítimo de Omega. Esfera plateada con motivo horizontal 'Teak' que evoca las cubiertas de madera de los yates de lujo, calibre Master Chronometer 8900 con rotor bidireccional.",
            "imagen_url": "/images/relojes/omega-aqua-terra-150m.svg"
        },
        {
            "nombre": "Constellation Co-Axial 39mm",
            "marca": marcas_dict["Omega"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("7100.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.0"),
            "cristal": "Zafiro abombado resistente al rayado",
            "resistencia_agua_m": 50,
            "material_correa": "Acero inoxidable con toques en oro amarillo",
            "descripcion": "Distinguido por sus famosas garras en los laterales de la caja, bisel grabado con números romanos y la icónica estrella Constellation a las 6 en punto sobre esfera champán sedosa.",
            "imagen_url": "/images/relojes/omega-constellation-39.svg"
        },

        # --- PATEK PHILIPPE (3 modelos) ---
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
            "imagen_url": "/images/relojes/patek-philippe-nautilus-5711.svg"
        },
        {
            "nombre": "Calatrava 5227R Oro Rosa",
            "marca": marcas_dict["Patek Philippe"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("39500.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.0"),
            "cristal": "Zafiro de máxima pureza óptica",
            "resistencia_agua_m": 30,
            "material_correa": "Piel de aligátor marrón brillante cosida a mano",
            "descripcion": "La quintaesencia del reloj de vestir ginebrino. Caja en oro rosa de 18 quilates con fondo de oficial protegido por tapa con bisagra invisible antipolvo y esfera lacada en tono marfil cálido.",
            "imagen_url": "/images/relojes/patek-philippe-calatrava-5227.svg"
        },
        {
            "nombre": "Aquanaut 5167A 'Jumbo'",
            "marca": marcas_dict["Patek Philippe"],
            "categorias": [categorias_dict["Buceo Profesional (Diver)"], categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("46200.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.8"),
            "cristal": "Zafiro antirreflejos",
            "resistencia_agua_m": 120,
            "material_correa": "Material compuesto negro ultra resistente al agua salada y rayos UV",
            "descripcion": "Deportividad elegante y contemporánea. Esfera negra estructurada con motivo en relieve cuadriculado geodinámico, índices y agujas de oro con revestimiento luminiscente.",
            "imagen_url": "/images/relojes/patek-philippe-aquanaut-5167.svg"
        },

        # --- AUDEMARS PIGUET (3 modelos) ---
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
            "material_correa": "Brazalete integrado de acero inoxidable con cierre desplegable AP",
            "descripcion": "El reloj que revolucionó los estándares del lujo mundial en 1972. Esfera azul noche 'Bleu Nuit, Nuage 50' con motivo Petite Tapisserie, 8 tornillos hexagonales vistos en bisel octogonal y calibre ultrafino 7121.",
            "imagen_url": "/images/relojes/audemars-piguet-royal-oak-jumbo.svg"
        },
        {
            "nombre": "Royal Oak Offshore Chronograph 43mm",
            "marca": marcas_dict["Audemars Piguet"],
            "categorias": [categorias_dict["Cronógrafo de Carreras"], categorias_dict["Buceo Profesional (Diver)"]],
            "precio": Decimal("42300.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("43.0"),
            "cristal": "Zafiro curvado con tratamiento interior antirreflejos",
            "resistencia_agua_m": 100,
            "material_correa": "Caucho negro con textura deportiva y sistema de cambio rápido",
            "descripcion": "Interpretación robusta e hiperdeportiva del Royal Oak. Bisel de cerámica negra, esfera con motivo Méga Tapisserie en dos tonos y calibre de manufactura 4401 con cronógrafo flyback integrado.",
            "imagen_url": "/images/relojes/audemars-piguet-royal-oak-offshore.svg"
        },
        {
            "nombre": "Code 11.59 Automático 41mm",
            "marca": marcas_dict["Audemars Piguet"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"], categorias_dict["Alta Complicación"]],
            "precio": Decimal("31200.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("41.0"),
            "cristal": "Doble curvatura en zafiro con efecto óptico tridimensional",
            "resistencia_agua_m": 30,
            "material_correa": "Piel de aligátor azul con costuras artesanales",
            "descripcion": "Arquitectura de caja contemporánea que combina un cuerpo central octogonal con bisel y fondo redondos. Esfera azul ahumada con acabado rayo de sol y numerales estilizados aplicados en oro.",
            "imagen_url": "/images/relojes/audemars-piguet-code-1159.svg"
        },

        # --- CARTIER (3 modelos) ---
        {
            "nombre": "Santos de Cartier Grande 39.8mm",
            "marca": marcas_dict["Cartier"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"], categorias_dict["Aviador / Aeronáutica"]],
            "precio": Decimal("7950.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.8"),
            "cristal": "Zafiro biselado resistente a impactos",
            "resistencia_agua_m": 100,
            "material_correa": "Acero inoxidable con sistemas intercambiables SmartLink y QuickSwitch",
            "descripcion": "El reloj de pulsera moderno por excelencia creado originalmente en 1904 para el aviador Alberto Santos-Dumont. Bisel cuadrado con 8 tornillos visibles, números romanos negros y corona con espinela sintética facetada azul.",
            "imagen_url": "/images/relojes/cartier-santos-large.svg"
        },
        {
            "nombre": "Tank Must Grande 33.7mm",
            "marca": marcas_dict["Cartier"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("3650.00"),
            "stock": 6,
            "movimiento": Reloj.TipoMovimiento.CUARZO,
            "diametro_caja_mm": Decimal("33.7"),
            "cristal": "Cristal mineral templado de alta resistencia",
            "resistencia_agua_m": 30,
            "material_correa": "Piel de becerro graneada negra con hebilla ardillón de acero",
            "descripcion": "Inspirado en la geometría y las orugas de los tanques de la Primera Guerra Mundial en 1917. Esfera plateada opaline con minutería ferrocarril, números romanos y agujas en forma de espada en acero azulado.",
            "imagen_url": "/images/relojes/cartier-tank-must.svg"
        },
        {
            "nombre": "Ballon Bleu de Cartier 40mm",
            "marca": marcas_dict["Cartier"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("6900.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.0"),
            "cristal": "Zafiro convexo antirreflejos",
            "resistencia_agua_m": 30,
            "material_correa": "Acero inoxidable pulido y satinado con cierre desplegable",
            "descripcion": "Silueta fluida de doble convexidad que flota en la muñeca como un guijarro pulido. Corona acanalada con cabujón sintético azul protegida bajo un arco metálico integrado que deforma elegantemente la minutería.",
            "imagen_url": "/images/relojes/cartier-ballon-bleu-40.svg"
        },

        # --- TAG HEUER (3 modelos) ---
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
            "material_correa": "Piel de becerro perforada estilo competición con cierre desplegable",
            "descripcion": "El primer cronógrafo automático cuadrado hermético del mundo, inmortalizado por Steve McQueen en 'Le Mans' (1971). Esfera azul petróleo con subesferas cuadradas plateadas, corona a la izquierda y agujas rojas de competición.",
            "imagen_url": "/images/relojes/tag-heuer-monaco-calibre-11.svg"
        },
        {
            "nombre": "Carrera Chronograph 39mm 'Glassbox'",
            "marca": marcas_dict["TAG Heuer"],
            "categorias": [categorias_dict["Cronógrafo de Carreras"]],
            "precio": Decimal("6750.00"),
            "stock": 4,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("39.0"),
            "cristal": "Zafiro 'Glassbox' abombado que cubre la escala taquimétrica periférica",
            "resistencia_agua_m": 100,
            "material_correa": "Piel de becerro azul con pespuntes artesanales",
            "descripcion": "Homenaje a la legendaria Carrera Panamericana creada por Jack Heuer en 1963. Esfera azul circular cepillada con bisel interior curvado, rueda de pilares de alta precisión y calibre de manufactura TH20-00 con 80 horas de reserva.",
            "imagen_url": "/images/relojes/tag-heuer-carrera-glassbox.svg"
        },
        {
            "nombre": "Aquaracer Professional 300 43mm",
            "marca": marcas_dict["TAG Heuer"],
            "categorias": [categorias_dict["Buceo Profesional (Diver)"]],
            "precio": Decimal("3400.00"),
            "stock": 5,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("43.0"),
            "cristal": "Zafiro plano con tratamiento antirreflejos",
            "resistencia_agua_m": 300,
            "material_correa": "Acero inoxidable con sistema de ajuste fino micrométrico",
            "descripcion": "Reloj de buceo ergonómico todoterreno. Bisel giratorio unidireccional de 12 facetas con inserto de cerámica negra resistente a rayaduras, esfera estriada horizontalmente e índices octagonales luminiscentes.",
            "imagen_url": "/images/relojes/tag-heuer-aquaracer-300.svg"
        },

        # --- GRAND SEIKO (3 modelos) ---
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
            "descripcion": "El modelo insignia de la relojería nipona de alta gama. Su esfera blanca reproduce la textura de la nieve fresca en las montañas de Shinshu. Movimiento Spring Drive 9R65 que desliza la aguja de segundos con fluidez perpetua y absoluta.",
            "imagen_url": "/images/relojes/grand-seiko-snowflake-sbga211.svg"
        },
        {
            "nombre": "Evolution 9 'White Birch' SLGH005",
            "marca": marcas_dict["Grand Seiko"],
            "categorias": [categorias_dict["Reloj de Gala / Vestir"]],
            "precio": Decimal("9100.00"),
            "stock": 2,
            "movimiento": Reloj.TipoMovimiento.AUTOMATICO,
            "diametro_caja_mm": Decimal("40.0"),
            "cristal": "Zafiro de alta definición con revestimiento interior antirreflejos",
            "resistencia_agua_m": 100,
            "material_correa": "Acero inoxidable pulido Zaratsu sin distorsiones",
            "descripcion": "Inspirado en la atmósfera serena de los bosques de abedules blancos que rodean el taller de Shizukuishi. Impulsado por el revolucionario calibre Hi-Beat 9SA5 a 36,000 alternancias con escape de doble impulso.",
            "imagen_url": "/images/relojes/grand-seiko-white-birch-slgh005.svg"
        },
        {
            "nombre": "Sport Collection Spring Drive GMT SBGE201",
            "marca": marcas_dict["Grand Seiko"],
            "categorias": [categorias_dict["Aviador / Aeronáutica"], categorias_dict["Buceo Profesional (Diver)"]],
            "precio": Decimal("6500.00"),
            "stock": 3,
            "movimiento": Reloj.TipoMovimiento.SOLAR,
            "diametro_caja_mm": Decimal("44.0"),
            "cristal": "Zafiro de alta resistencia con bisel exterior recubierto de cristal de zafiro",
            "resistencia_agua_m": 200,
            "material_correa": "Acero inoxidable macizo con cierre de triple pliegue",
            "descripcion": "El guardatiempo definitivo para viajeros intercontinentales. Bisel giratorio de 24 horas protegido bajo cristal de zafiro, movimiento Spring Drive 9R66 de alta precisión y aguja GMT roja que permite monitorear tres zonas horarias.",
            "imagen_url": "/images/relojes/grand-seiko-sport-gmt-sbge201.svg"
        }
    ]

    for data in relojes_data:
        cats = data.pop("categorias")
        # Actualizar si existe o crear si es nuevo
        obj, created = Reloj.objects.get_or_create(
            nombre=data["nombre"],
            marca=data["marca"],
            defaults=data
        )
        if not created:
            for key, val in data.items():
                setattr(obj, key, val)
            obj.save()
        obj.categorias.set(cats)
        action = "registrado" if created else "actualizado"
        print(f" [+] Reloj {action}: {obj.marca.nombre} {obj.nombre} (${obj.precio}) -> {obj.imagen_url}")

    # 4. Carga de Galería de Imágenes Oficiales (FASE 1.5 - 2 imágenes por reloj)
    print("\nActualizando galería de alta resolución en ImagenReloj...")
    import json
    try:
        with open('scratch/url_validation_results.json', 'r', encoding='utf-8') as f:
            galeria_data = json.load(f)
            for item in galeria_data:
                reloj_obj = Reloj.objects.filter(id=item['watch_id']).first()
                if reloj_obj:
                    img_obj, img_created = ImagenReloj.objects.update_or_create(
                        reloj=reloj_obj,
                        orden=item['orden'],
                        defaults={
                            'url': item['url'],
                            'alt_text': item['alt_text']
                        }
                    )
            total_galeria = ImagenReloj.objects.count()
            print(f" [+] Total imágenes registradas en galería: {total_galeria} (24 piezas x 2 vistas)")
    except Exception as e:
        print(f" [!] Advertencia al sincronizar galería: {e}")

    # 5. Asegurar que existe al menos una orden de prueba
    if not Orden.objects.exists():
        reloj_demo = Reloj.objects.first()
        orden = Orden.objects.create(
            cliente_nombre="Ignacio De La Torre",
            cliente_email="ignacio.torre@clubfinanciero.pe",
            cliente_telefono="+51 999 888 777",
            direccion_envio="Malecón de la Reserva 715, Piso 14",
            ciudad="Miraflores, Lima",
            pais="Perú",
            estado=Orden.EstadoOrden.PAGADO,
            garantia_aceptada=True,
            notas="Entrega confidencial con escolta privada."
        )
        DetalleOrden.objects.create(
            orden=orden,
            reloj=reloj_demo,
            precio_unitario=reloj_demo.precio,
            cantidad=1
        )
        orden.actualizar_total()
        print(f" [+] Orden de prueba generada: Orden #{orden.id:05d} para {orden.cliente_nombre}")

    total_relojes = Reloj.objects.count()
    print(f"\n¡Base de datos de Cronos Genève poblada exitosamente con catálogo oficial de {total_relojes} piezas!")


if __name__ == '__main__':
    poblar()
