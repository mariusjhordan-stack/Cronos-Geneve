import urllib.request
import urllib.error
import ssl
import json
import time

URLS_DATA = [
    # 1. Rolex Submariner Date 41mm 'Kermit' (id: 1)
    {
        "watch_id": 1,
        "watch_name": "Rolex Submariner Date 41mm 'Kermit'",
        "marca": "Rolex",
        "images": [
            {
                "orden": 1,
                "url": "https://watchesoff5th.com/cdn/shop/products/rolex-submariner-date-41mm-black-dial-new-release-2023-mkii-bezel-126610lv-455497_1280x.jpg?v=1693305086",
                "alt_text": "Rolex Submariner Date 41mm Kermit Vista Frontal Esfera Negra Bisel Verde"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBcGsm9oL4w9xphVNtAhsP8LWYUOtI2AkxGExGY1PcgQTFCXU2zyR9BTA&s=10",
                "alt_text": "Rolex Submariner Date 41mm Kermit Vista Detalle"
            }
        ]
    },
    # 2. Rolex Cosmograph Daytona 'Panda' (id: 2)
    {
        "watch_id": 2,
        "watch_name": "Rolex Cosmograph Daytona 'Panda'",
        "marca": "Rolex",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyU-C3OmpG0O0u0D08VCO_Ys6fWCPIgE6HOpVOALDLwSFuwUjuFGOjeUw&s=10",
                "alt_text": "Rolex Cosmograph Daytona Panda Esfera Blanca Vista Frontal"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM8oifiur5enuR2kDmnAhI6qf2D4gDVrKFvsjcvfQhRjdC9YFrcRg7aMkR&s=10",
                "alt_text": "Rolex Cosmograph Daytona Panda Detalle Subesferas"
            }
        ]
    },
    # 3. Rolex Datejust 41 Esfera Azul Fluted (id: 9)
    {
        "watch_id": 9,
        "watch_name": "Rolex Datejust 41 Esfera Azul Fluted",
        "marca": "Rolex",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZgOKcPclS5dcABCxLA6Xs9pWTF2gkfD1_jMqHQVRGzg&s=10",
                "alt_text": "Rolex Datejust 41 Esfera Azul Bisel Estriado"
            },
            {
                "orden": 2,
                "url": "https://cdn.wristler.eu/square-large/981a4e1169d5b484974a82d4a5f9ec24-3bmuydDaA45kS431Zj5q.jpeg",
                "alt_text": "Rolex Datejust 41 Brazalete Jubilee y Esfera Azul"
            }
        ]
    },
    # 4. Rolex GMT-Master II 'Pepsi' 40mm (id: 10)
    {
        "watch_id": 10,
        "watch_name": "Rolex GMT-Master II 'Pepsi' 40mm",
        "marca": "Rolex",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSji2xCoDFH22iCmv931lhqcllQbTFO4mxMCMloqP8Nvw&s=10",
                "alt_text": "Rolex GMT-Master II Pepsi Bisel Rojo y Azul"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhEO-YW0vmWPYyxjfmLE01pjno3S1cjVdr4jFNqvPAcg&s=10",
                "alt_text": "Rolex GMT-Master II Pepsi Vista Perspectiva"
            }
        ]
    },
    # 5. Rolex Explorer 36mm Esfera Negra (id: 11)
    {
        "watch_id": 11,
        "watch_name": "Rolex Explorer 36mm Esfera Negra",
        "marca": "Rolex",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDTOmqNX5K0aEVj1l_nL6Ty7xbp5LlwSMvEP2qpwDHPg&s=10",
                "alt_text": "Rolex Explorer 36mm Esfera Negra 3-6-9"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIvrJd-GevVNF2WzOzHIfxfAZbdAoZNpWnwyRVdUbRyw&s=10",
                "alt_text": "Rolex Explorer 36mm Brazalete Oyster"
            }
        ]
    },
    # 6. Omega Speedmaster Professional 'Moonwatch' (id: 3)
    {
        "watch_id": 3,
        "watch_name": "Omega Speedmaster Professional 'Moonwatch'",
        "marca": "Omega",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_rWGq5oOS3s_CuKen8NMrGhPOBVDxvSuZo9NAIKXWgw&s",
                "alt_text": "Omega Speedmaster Professional Moonwatch Vista Frontal"
            },
            {
                "orden": 2,
                "url": "https://m.media-amazon.com/images/I/61qLm-mL7BL._AC_SY395_.jpg",
                "alt_text": "Omega Speedmaster Moonwatch Cronógrafo en Detalle"
            }
        ]
    },
    # 7. Omega Seamaster Diver 300M Co-Axial (id: 4)
    {
        "watch_id": 4,
        "watch_name": "Omega Seamaster Diver 300M Co-Axial",
        "marca": "Omega",
        "images": [
            {
                "orden": 1,
                "url": "https://img.chrono24.com/images/uhren/48165226-s443dww88s0utk0gjptlegci-ExtraLarge.jpg",
                "alt_text": "Omega Seamaster Diver 300M Esfera Azul Ondas"
            },
            {
                "orden": 2,
                "url": "https://img.chrono24.com/images/uhren/48165226-g4va6vjn9h4pm1fsqyoxenif-ExtraLarge.jpg",
                "alt_text": "Omega Seamaster Diver 300M Vista Lateral y Corona"
            }
        ]
    },
    # 8. Omega Seamaster Aqua Terra 150M 41mm (id: 12)
    {
        "watch_id": 12,
        "watch_name": "Omega Seamaster Aqua Terra 150M 41mm",
        "marca": "Omega",
        "images": [
            {
                "orden": 1,
                "url": "https://img.chrono24.com/images/uhren/47941747-5rf61p96u8g9hcd624b2b672-ExtraLarge.jpg",
                "alt_text": "Omega Seamaster Aqua Terra 150M Esfera Teak"
            },
            {
                "orden": 2,
                "url": "https://content.thewosgroup.com/productimage/17332350/17332350_1.jpg",
                "alt_text": "Omega Aqua Terra 150M Detalle de Esfera y Brazalete"
            }
        ]
    },
    # 9. Omega Constellation Co-Axial 39mm (id: 13)
    {
        "watch_id": 13,
        "watch_name": "Omega Constellation Co-Axial 39mm",
        "marca": "Omega",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2LZTsAAi2lGlTHooWDktsC6wMTUGJR2y6vOGshFKUrg&s=10",
                "alt_text": "Omega Constellation Co-Axial Garras y Bisel Romano"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOn-KSaACbvn4uhQwvqysM_yShqIkztr2H3NrDUW5YWQ&s=10",
                "alt_text": "Omega Constellation 39mm Detalle Esfera y Estrella"
            }
        ]
    },
    # 10. Patek Philippe Nautilus 5711/1A Azul Imperial (id: 5)
    {
        "watch_id": 5,
        "watch_name": "Patek Philippe Nautilus 5711/1A Azul Imperial",
        "marca": "Patek Philippe",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6maRG4K9JJ1KjaYJc9eguPJbMmxpicbr89NccO5kRsg&s=10",
                "alt_text": "Patek Philippe Nautilus 5711 Esfera Azul Estriada"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7CuqpSuFG9a9cTk0XM55ZRFFPAY8IoIEH8uIY1XI7WQ&s=10",
                "alt_text": "Patek Philippe Nautilus 5711 Bisel Porro y Brazalete"
            }
        ]
    },
    # 11. Patek Philippe Calatrava 5227R Oro Rosa (id: 14)
    {
        "watch_id": 14,
        "watch_name": "Patek Philippe Calatrava 5227R Oro Rosa",
        "marca": "Patek Philippe",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjnL-12V9UMZthre57wEGMTMOI5f75h1ACK-tWf4xpuA&s",
                "alt_text": "Patek Philippe Calatrava 5227R Oro Rosa Esfera Marfil"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDE4Zkw8angicfOdOeoiADZyeT0KuZVDLwYQ3GwZJ-8w&s=10",
                "alt_text": "Patek Philippe Calatrava 5227R Detalle Perfil Elegante"
            }
        ]
    },
    # 12. Patek Philippe Aquanaut 5167A 'Jumbo' (id: 15)
    {
        "watch_id": 15,
        "watch_name": "Patek Philippe Aquanaut 5167A 'Jumbo'",
        "marca": "Patek Philippe",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Q2Bcd8Xx9DUit8fBj1K7ooVDwzc1s6BFUYLo2IeK7g&s=10",
                "alt_text": "Patek Philippe Aquanaut 5167A Cuadriculado Geodinámico"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBUUUz8y0ienq7VBeTSCOstoL9a7-cVUc9PeWONdG2Gg&s=10",
                "alt_text": "Patek Philippe Aquanaut 5167A Correa Tropical Compuesta"
            }
        ]
    },
    # 13. Audemars Piguet Royal Oak 'Jumbo' Extra-Thin (id: 6)
    {
        "watch_id": 6,
        "watch_name": "Audemars Piguet Royal Oak 'Jumbo' Extra-Thin",
        "marca": "Audemars Piguet",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-WbQ6Bm4lGPed86RdxXz0JN0N89KGc3BlmX2X5pqsGfEzZfZ6gKB87ZQn&s=10",
                "alt_text": "Audemars Piguet Royal Oak Jumbo Petite Tapisserie Azul"
            },
            {
                "orden": 2,
                "url": "https://www.horando.de/cdn/shop/files/00007_4fad44de-2b53-482a-98b7-45517655a578.jpg?v=1773997954&width=1800",
                "alt_text": "Audemars Piguet Royal Oak Jumbo Bisel Octogonal y Tornillos"
            }
        ]
    },
    # 14. Audemars Piguet Royal Oak Offshore Chronograph 43mm (id: 17)
    {
        "watch_id": 17,
        "watch_name": "Audemars Piguet Royal Oak Offshore Chronograph 43mm",
        "marca": "Audemars Piguet",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO86Q70jv8PKyLPrNN4da9VYtGwsUn83lvSIO2GI3Kuw&s=10",
                "alt_text": "Audemars Piguet Royal Oak Offshore Cronógrafo Mega Tapisserie"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGSJ9SPG_jm_8bFdvua0iRfXuRSf71cfXTJhv5B78qBg&s=10",
                "alt_text": "Audemars Piguet Royal Oak Offshore Pulsadores Cerámicos"
            }
        ]
    },
    # 15. Audemars Piguet Code 11.59 Automático 41mm (id: 18)
    {
        "watch_id": 18,
        "watch_name": "Audemars Piguet Code 11.59 Automático 41mm",
        "marca": "Audemars Piguet",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjhPiyxoc4MW6Rt9MT03q61C5KzNHubamsV2KKJdcqLg&s=10",
                "alt_text": "Audemars Piguet Code 11.59 Caja Octogonal Media y Cristal Doble Curvatura"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7-mwLbjm9FcUmKatDHdozcNtJx_LmyLwMOF35Semkog&s=10",
                "alt_text": "Audemars Piguet Code 11.59 Detalle de Esfera y Asas Caladas"
            }
        ]
    },
    # 16. Cartier Santos de Cartier Grande 39.8mm (id: 19)
    {
        "watch_id": 19,
        "watch_name": "Cartier Santos de Cartier Grande 39.8mm",
        "marca": "Cartier",
        "images": [
            {
                "orden": 1,
                "url": "https://i.ebayimg.com/images/g/EoEAAeSwEutqsd48/s-l960.webp",
                "alt_text": "Cartier Santos de Cartier Grande Esfera Blanca Números Romanos"
            },
            {
                "orden": 2,
                "url": "https://i.ebayimg.com/images/g/YY8AAOSwW8xkiw5r/s-l1600.webp",
                "alt_text": "Cartier Santos de Cartier Bisel con Tornillos y Brazalete SmartLink"
            }
        ]
    },
    # 17. Cartier Tank Must Grande 33.7mm (id: 20)
    {
        "watch_id": 20,
        "watch_name": "Cartier Tank Must Grande 33.7mm",
        "marca": "Cartier",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXLMfVj40A-Kn2WlwhQNpcoqfvHKG7PQQvEBubVDl6Gw&s=10",
                "alt_text": "Cartier Tank Must Grande Agujas de Acero Azulado en Forma de Espada"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpxATFBY9V1D_9L3l4-ILBDNeC72n4aTQ-SXZxwpHeFA&s=10",
                "alt_text": "Cartier Tank Must Corona con Cabujón de Espinela Sintética"
            }
        ]
    },
    # 18. Cartier Ballon Bleu de Cartier 40mm (id: 21)
    {
        "watch_id": 21,
        "watch_name": "Cartier Ballon Bleu de Cartier 40mm",
        "marca": "Cartier",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDU-oks3SOQFU_0g6vs1jmuSWqiM4FsE6J-TSxfX1roBSWArQjj1602uo&s=10",
                "alt_text": "Cartier Ballon Bleu 40mm Corona Encastrada con Cabujón Zafiro"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSopYoelMzQzfJNdI2FHQu3x7iOQgzcDw6Af8CJFpimLg&s=10",
                "alt_text": "Cartier Ballon Bleu Esfera Guilloché y Números Romanos"
            }
        ]
    },
    # 19. TAG Heuer Monaco Calibre 11 'Steve McQueen' (id: 7)
    {
        "watch_id": 7,
        "watch_name": "TAG Heuer Monaco Calibre 11 'Steve McQueen'",
        "marca": "TAG Heuer",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrWLILHGmy58qVAVh8zfER0EHb3ch347F-98X2t8ny0K3RWQX-lTS4jaEc&s=10",
                "alt_text": "TAG Heuer Monaco Calibre 11 Caja Cuadrada Corona a las 9"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStQ88RXhqxOmelBuPGC77-IlU8rnj5wdoJ3AdcCsovr-gwMu84cCdxDQs&s=10",
                "alt_text": "TAG Heuer Monaco Calibre 11 Esfera Azul y Agujas Rojas de Cronógrafo"
            }
        ]
    },
    # 20. TAG Heuer Carrera Chronograph 39mm 'Glassbox' (id: 22)
    {
        "watch_id": 22,
        "watch_name": "TAG Heuer Carrera Chronograph 39mm 'Glassbox'",
        "marca": "TAG Heuer",
        "images": [
            {
                "orden": 1,
                "url": "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dwca82ef44/TAG_Heuer_Carrera/CBS2210.FC6534/CBS2210.FC6534_Soldier.png?impolicy=TrimRatioResize&width=1254&ratioHeight=5&ratioWidth=4&expansion=true",
                "alt_text": "TAG Heuer Carrera Glassbox 39mm Esfera Negra Vista Frontal"
            },
            {
                "orden": 2,
                "url": "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw9c3bfe56/TAG_Heuer_Carrera/CBS2210.FC6534/CBS2210.FC6534_Profile.png?impolicy=resizeTrim&width=3600&padding=0",
                "alt_text": "TAG Heuer Carrera Glassbox Perfil Cristal Zafiro Cúpula"
            }
        ]
    },
    # 21. TAG Heuer Aquaracer Professional 300 43mm (id: 23)
    {
        "watch_id": 23,
        "watch_name": "TAG Heuer Aquaracer Professional 300 43mm",
        "marca": "TAG Heuer",
        "images": [
            {
                "orden": 1,
                "url": "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw895014f4/TAG_Heuer_Aquaracer/WBP201A.BA0632/WBP201A.BA0632_Soldier.png?impolicy=TrimRatioResize&width=1254&ratioHeight=5&ratioWidth=4&expansion=true",
                "alt_text": "TAG Heuer Aquaracer 300 Bisel Cerámico Dodecagonal Negro"
            },
            {
                "orden": 2,
                "url": "https://www.tagheuer.com/on/demandware.static/-/Sites-tagheuer-master/default/dw1e8fab09/TAG_Heuer_Aquaracer/WBP201A.BA0632/WBP201A.BA0632_Profile.png?impolicy=resizeTrim&width=3600&padding=0",
                "alt_text": "TAG Heuer Aquaracer 300 Vista Perfil Caja y Brazalete Acero"
            }
        ]
    },
    # 22. Grand Seiko Heritage 'Snowflake' SBGA211 (id: 8)
    {
        "watch_id": 8,
        "watch_name": "Grand Seiko Grand Seiko Heritage 'Snowflake' SBGA211",
        "marca": "Grand Seiko",
        "images": [
            {
                "orden": 1,
                "url": "https://www.grand-seiko.com/es-es/-/media/Images/GlobalEn/GrandSeiko/Home/collections/Products/SBGA211/SBGA211_dial.jpg",
                "alt_text": "Grand Seiko Snowflake SBGA211 Esfera Textura Nieve Shinshu"
            },
            {
                "orden": 2,
                "url": "https://www.grand-seiko.com/es-es/-/media/Images/GlobalEn/GrandSeiko/Home/collections/Products/SBGA211/SBGA211_caseside.jpg",
                "alt_text": "Grand Seiko Snowflake SBGA211 Perfil Pulido Zaratsu Titanio"
            }
        ]
    },
    # 23. Grand Seiko Evolution 9 'White Birch' SLGH005 (id: 24)
    {
        "watch_id": 24,
        "watch_name": "Grand Seiko Evolution 9 'White Birch' SLGH005",
        "marca": "Grand Seiko",
        "images": [
            {
                "orden": 1,
                "url": "https://www.grand-seiko.com/us-en/-/media/Images/GlobalEn/GrandSeiko/Home/collections/Products/SLGH005/18_SLGH005_5_set_pc.jpg",
                "alt_text": "Grand Seiko White Birch SLGH005 Esfera Bosque Abedules Shizukuishi"
            },
            {
                "orden": 2,
                "url": "https://www.grand-seiko.com/us-en/-/media/Images/GlobalEn/GrandSeiko/Home/collections/Products/SLGH005/15_SLGH005_2_web.jpg",
                "alt_text": "Grand Seiko White Birch SLGH005 Detalle Calibre Hi-Beat 9SA5"
            }
        ]
    },
    # 24. Grand Seiko Sport Collection Spring Drive GMT SBGE201 (id: 25)
    {
        "watch_id": 25,
        "watch_name": "Grand Seiko Sport Collection Spring Drive GMT SBGE201",
        "marca": "Grand Seiko",
        "images": [
            {
                "orden": 1,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFmoG29x40lfEzmWEuiqThsvgd_oRKIeeg3ACEzY1YwQ&s=10",
                "alt_text": "Grand Seiko Sport GMT SBGE201 Bisel Giratorio Cristal Zafiro"
            },
            {
                "orden": 2,
                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4eGkhmHsq4gUizl7QvfR7eY4vraL_tokJ0ye8e4Wngw&s=10",
                "alt_text": "Grand Seiko Sport GMT SBGE201 Aguja GMT Roja y Corona a las 4"
            }
        ]
    }
]

def validate_url(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            status = response.status
            content_type = response.headers.get('Content-Type', '')
            content_length = response.headers.get('Content-Length', 'unknown')
            return {
                'ok': 200 <= status < 400,
                'status': status,
                'content_type': content_type,
                'content_length': content_length,
                'error': None
            }
    except urllib.error.HTTPError as e:
        return {
            'ok': False,
            'status': e.code,
            'content_type': e.headers.get('Content-Type', '') if e.headers else '',
            'content_length': '0',
            'error': f"HTTPError {e.code}: {e.reason}"
        }
    except urllib.error.URLError as e:
        return {
            'ok': False,
            'status': 0,
            'content_type': '',
            'content_length': '0',
            'error': f"URLError: {e.reason}"
        }
    except Exception as e:
        return {
            'ok': False,
            'status': 0,
            'content_type': '',
            'content_length': '0',
            'error': str(e)
        }

if __name__ == '__main__':
    print(f"Iniciando validación exhaustiva de las 48 URLs (24 relojes x 2 imágenes)...")
    results = []
    failed_count = 0
    success_count = 0
    
    for item in URLS_DATA:
        watch_name = item['watch_name']
        print(f"\n--- [{item['marca']}] {watch_name} (ID: {item['watch_id']}) ---")
        for img in item['images']:
            res = validate_url(img['url'])
            status_str = f"HTTP {res['status']}" if res['status'] else "FAILED"
            is_image = 'image' in res['content_type'].lower()
            
            if res['ok']:
                success_count += 1
                flag = "[OK]"
            else:
                failed_count += 1
                flag = "[ERROR]"
                
            print(f"  {flag} Img {img['orden']}: {status_str} | Type: {res['content_type'][:30]} | Length: {res['content_length']} bytes")
            print(f"       URL: {img['url'][:90]}...")
            if res['error']:
                print(f"       Motivo: {res['error']}")
                
            results.append({
                'watch_id': item['watch_id'],
                'watch_name': watch_name,
                'orden': img['orden'],
                'url': img['url'],
                'alt_text': img['alt_text'],
                'status': res['status'],
                'ok': res['ok'],
                'is_image': is_image,
                'content_type': res['content_type'],
                'content_length': res['content_length'],
                'error': res['error']
            })
            time.sleep(0.1)

    print("\n" + "="*70)
    print(f"RESUMEN DE VALIDACIÓN HTTP:")
    print(f"  Total URLs probadas: {len(results)}")
    print(f"  Exitosas (HTTP 200/Image): {success_count}")
    print(f"  Fallidas (Bloqueo/Error/403/404): {failed_count}")
    print("="*70)
    
    with open('scratch/url_validation_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("Resultados guardados en scratch/url_validation_results.json")
