# Auditoría de imágenes — Fase 2

Estado **antes** de la Fase 2 y decisión tomada para cada reloj. Datos medidos descargando cada URL el 2026-11-16 (`catalogo.ImagenReloj` poblada desde `scratch/url_validation_results.json`).

## Resumen

* 24 relojes, 48 imágenes de galería, **todas externas** (hotlinks). 24 principales de ficha eran ilustraciones SVG de 500×500 con fondo propio.
* 30 de 48 son miniaturas de Google Imágenes (`encrypted-tbn0.gstatic.com`), 10 vienen de tiendas de reventa y 8 de CDNs de marcas. Ninguna tiene licencia de reutilización verificable.
* 36 imágenes miden menos de 800 px en su lado corto (mediana ≈ 447 px de ancho): se ven borrosas a tamaño de ficha.
* Solo 4 están en 4:5; fondos: blanco puro, grises, marrones, azules, negro (mezcla incompatible con el fondo #FAF8F4).
* 2 URLs ni siquiera se pudieron verificar (error de certificado SSL: `watchesoff5th.com`, `www.horando.de`).

**Decisión:** se retiraron las 48 URLs de la galería. No se sustituyen por otras sin licencia. En su lugar: ilustración 4:5 normalizada (provisional, etiquetada) + fotografías de Wikimedia Commons únicamente donde se pudo verificar el modelo y la licencia.

## Detalle por reloj

| ID | Reloj | Imagen principal anterior | Galería anterior (hotlinks) | Problemas detectados | Ahora |
|---|---|---|---|---|---|
| 1 | Rolex Submariner Date 41mm 'Kermit' | `rolex-submariner-kermit.svg` 500×500 | #1 watchesoff5th.com: no verificable<br>#2 miniatura de Google Imágenes 554×554 | URL no verificable (SSL); baja resolución; fondo distinto (#f0ddd7); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 2 | Rolex Cosmograph Daytona 'Panda' | `rolex-daytona-panda.svg` 500×500 | #1 miniatura de Google Imágenes 399×501<br>#2 miniatura de Google Imágenes 480×639 | baja resolución; fondo distinto (#626e8f); fondo distinto (#7e8b7c); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 3 | Omega Speedmaster Professional 'Moonwatch' | `omega-speedmaster-moonwatch.svg` 500×500 | #1 miniatura de Google Imágenes 225×224<br>#2 tienda / reventa 231×395 | baja resolución; fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes); sin licencia (tienda / reventa) | ilustracion (principal), detalle |
| 4 | Omega Seamaster Diver 300M Co-Axial | `omega-seamaster-diver-300m.svg` 500×500 | #1 tienda / reventa 960×960<br>#2 tienda / reventa 960×960 | fondo distinto (#e1d0c2); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (tienda / reventa) | ilustracion (principal) |
| 5 | Patek Philippe Nautilus 5711/1A Azul Imperial | `patek-philippe-nautilus-5711.svg` 500×500 | #1 miniatura de Google Imágenes 367×544<br>#2 miniatura de Google Imágenes 447×447 | baja resolución; fondo distinto (#bab9bf); fondo distinto (#fefefe); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | producto (principal) |
| 6 | Audemars Piguet Royal Oak 'Jumbo' Extra-Thin | `audemars-piguet-royal-oak-jumbo.svg` 500×500 | #1 miniatura de Google Imágenes 452×678<br>#2 www.horando.de: no verificable | URL no verificable (SSL); baja resolución; fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 7 | TAG Heuer Monaco Calibre 11 'Steve McQueen' | `tag-heuer-monaco-calibre-11.svg` 500×500 | #1 miniatura de Google Imágenes 554×554<br>#2 miniatura de Google Imágenes 554×554 | baja resolución; fondo distinto (#bb7880); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 8 | Grand Seiko Grand Seiko Heritage 'Snowflake' SBGA211 | `grand-seiko-snowflake-sbga211.svg` 500×500 | #1 CDN de la marca 1500×1000<br>#2 CDN de la marca 1500×1000 | fondo distinto (#d3d7dd); fondo distinto (#dcdee2); material de marca sin licencia de reutilización; principal = ilustración tipo placeholder; proporción ≠ 4:5 | ilustracion (principal) |
| 9 | Rolex Datejust 41 Esfera Azul Fluted | `rolex-datejust-41.svg` 500×500 | #1 miniatura de Google Imágenes 366×546<br>#2 tienda / reventa 506×506 | baja resolución; fondo distinto (#d2d5d9); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes); sin licencia (tienda / reventa) | ilustracion (principal) |
| 10 | Rolex GMT-Master II 'Pepsi' 40mm | `rolex-gmt-master-pepsi.svg` 500×500 | #1 miniatura de Google Imágenes 386×518<br>#2 miniatura de Google Imágenes 440×454 | baja resolución; fondo distinto (#118c88); fondo distinto (#d5d5d2); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal), detalle |
| 11 | Rolex Explorer 36mm Esfera Negra | `rolex-explorer-36.svg` 500×500 | #1 miniatura de Google Imágenes 335×597<br>#2 miniatura de Google Imágenes 419×477 | baja resolución; fondo distinto (#c4c9cc); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal), detalle |
| 12 | Omega Seamaster Aqua Terra 150M 41mm | `omega-aqua-terra-150m.svg` 500×500 | #1 tienda / reventa 960×960<br>#2 tienda / reventa 1600×1600 | fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (tienda / reventa) | ilustracion (principal) |
| 13 | Omega Constellation Co-Axial 39mm | `omega-constellation-39.svg` 500×500 | #1 miniatura de Google Imágenes 447×447<br>#2 miniatura de Google Imágenes 447×447 | baja resolución; fondo distinto (#e0d0b9); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 14 | Patek Philippe Calatrava 5227R Oro Rosa | `patek-philippe-calatrava-5227.svg` 500×500 | #1 miniatura de Google Imágenes 225×225<br>#2 miniatura de Google Imágenes 387×516 | baja resolución; fondo distinto (#77767a); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 15 | Patek Philippe Aquanaut 5167A 'Jumbo' | `patek-philippe-aquanaut-5167.svg` 500×500 | #1 miniatura de Google Imágenes 554×554<br>#2 miniatura de Google Imágenes 300×400 | baja resolución; fondo distinto (#949895); fondo distinto (#d1cec2); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 17 | Audemars Piguet Royal Oak Offshore Chronograph 43mm | `audemars-piguet-royal-oak-offshore.svg` 500×500 | #1 miniatura de Google Imágenes 365×547<br>#2 miniatura de Google Imágenes 386×518 | baja resolución; fondo distinto (#131513); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 18 | Audemars Piguet Code 11.59 Automático 41mm | `audemars-piguet-code-1159.svg` 500×500 | #1 miniatura de Google Imágenes 447×447<br>#2 miniatura de Google Imágenes 447×447 | baja resolución; fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 19 | Cartier Santos de Cartier Grande 39.8mm | `cartier-santos-large.svg` 500×500 | #1 tienda / reventa 500×500<br>#2 tienda / reventa 500×640 | baja resolución; fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (tienda / reventa) | ilustracion (principal) |
| 20 | Cartier Tank Must Grande 33.7mm | `cartier-tank-must.svg` 500×500 | #1 miniatura de Google Imágenes 382×523<br>#2 miniatura de Google Imágenes 554×554 | baja resolución; fondo distinto (#707073); fondo distinto (#982c29); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 21 | Cartier Ballon Bleu de Cartier 40mm | `cartier-ballon-bleu-40.svg` 500×500 | #1 miniatura de Google Imágenes 447×447<br>#2 miniatura de Google Imágenes 447×447 | baja resolución; fondo distinto (#33180e); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |
| 22 | TAG Heuer Carrera Chronograph 39mm 'Glassbox' | `tag-heuer-carrera-glassbox.svg` 500×500 | #1 CDN de la marca 1254×1568<br>#2 CDN de la marca 2048×724 | baja resolución; fondo distinto (#000000); fondo distinto (#0a0a0a); material de marca sin licencia de reutilización; principal = ilustración tipo placeholder; proporción ≠ 4:5 | ilustracion (principal) |
| 23 | TAG Heuer Aquaracer Professional 300 43mm | `tag-heuer-aquaracer-300.svg` 500×500 | #1 CDN de la marca 1254×1567<br>#2 CDN de la marca 2048×786 | baja resolución; fondo distinto (#000000); fondo distinto (#0a0a0a); material de marca sin licencia de reutilización; principal = ilustración tipo placeholder; proporción ≠ 4:5 | ilustracion (principal) |
| 24 | Grand Seiko Evolution 9 'White Birch' SLGH005 | `grand-seiko-white-birch-slgh005.svg` 500×500 | #1 CDN de la marca 1920×1357<br>#2 CDN de la marca 1500×1000 | fondo distinto (#191919); fondo distinto (#7e8285); material de marca sin licencia de reutilización; principal = ilustración tipo placeholder; proporción ≠ 4:5 | ilustracion (principal) |
| 25 | Grand Seiko Sport Collection Spring Drive GMT SBGE201 | `grand-seiko-sport-gmt-sbge201.svg` 500×500 | #1 miniatura de Google Imágenes 447×447<br>#2 miniatura de Google Imágenes 430×465 | baja resolución; fondo distinto (#7d7f80); fondo distinto (#ffffff); principal = ilustración tipo placeholder; proporción ≠ 4:5; sin licencia (miniatura de Google Imágenes) | ilustracion (principal) |

## Piezas sin fotografía adecuada (pendientes)

Se buscó en Wikimedia Commons con filtro de licencia (CC0, CC BY, CC BY-SA, dominio público). Resultado:

| Reloj | Resultado de la búsqueda | Acción necesaria |
|---|---|---|
| Rolex Submariner Date 41mm 'Kermit' | Solo hay Submariner antiguos sin fecha; ninguno es la ref. 126610LV «Kermit». | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Rolex Cosmograph Daytona 'Panda' | Solo Daytona vintage (16523, 16528); ninguno es el «Panda» actual. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Omega Seamaster Diver 300M Co-Axial | Sin resultados con licencia compatible. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| TAG Heuer Monaco Calibre 11 'Steve McQueen' | Hay Monaco con licencia CC BY-SA, pero son escaneos de folleto o ediciones distintas; no se pudo verificar que sea el Calibre 11 «Steve McQueen». | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Grand Seiko Grand Seiko Heritage 'Snowflake' SBGA211 | Sin resultados. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Rolex Datejust 41 Esfera Azul Fluted | La foto con licencia (ref. 126234) es un Datejust 36 de esfera gris; el modelo del catálogo es Datejust 41 azul fluted. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Omega Seamaster Aqua Terra 150M 41mm | Foto con licencia de un Aqua Terra antiguo dentro de su caja (fondo y escala inconsistentes). | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Omega Constellation Co-Axial 39mm | Solo un Constellation de 1958 en oro rosa; no corresponde al Co-Axial 39 mm. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Patek Philippe Calatrava 5227R Oro Rosa | Calatrava con licencia, pero otras referencias (3820R, 6006G…), no la 5227R. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Patek Philippe Aquanaut 5167A 'Jumbo' | Sin resultados para la 5167A; solo Aquanaut de edición limitada. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Audemars Piguet Royal Oak Offshore Chronograph 43mm | Foto con licencia (CC BY 3.0) de un Offshore en vitrina, baja calidad y fondo inutilizable. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Audemars Piguet Code 11.59 Automático 41mm | Solo el Code 11.59 Cronógrafo ref. 26393; el catálogo vende el automático 41 mm. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Cartier Santos de Cartier Grande 39.8mm | Foto con licencia de un Santos en exhibidor (reflejos y fondo no recortables con calidad). | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Cartier Tank Must Grande 33.7mm | Foto con licencia de un Tank vintage en oro, no el Tank Must de acero. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Cartier Ballon Bleu de Cartier 40mm | Sin resultados. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| TAG Heuer Carrera Chronograph 39mm 'Glassbox' | Solo Carrera CV2010 antiguo; el catálogo vende el Glassbox de 39 mm. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| TAG Heuer Aquaracer Professional 300 43mm | Foto de un Aquaracer anterior (CAF2010), no el Professional 300 de 43 mm. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Grand Seiko Evolution 9 'White Birch' SLGH005 | Sin resultados. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Grand Seiko Sport Collection Spring Drive GMT SBGE201 | Sin resultados. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |
| Audemars Piguet Royal Oak 'Jumbo' Extra-Thin | Foto con licencia de la ref. 15202 (el Jumbo Extra-Thin correcto) pero en la muñeca, con objetos alrededor: no cumple el estándar de producto. | Fotografía de prensa oficial con permiso por escrito, o foto propia en fondo neutro |

## Home y secciones editoriales

| Sección | Qué usa hoy | Problema | Reemplazo recomendado |
|---|---|---|---|
| Hero (`Hero.jsx`) | Pieza protagonista = la más cara con imagen (Nautilus 5711, ya con fotografía) | Coherente; la pieza está agotada | En Fase 3: elegir protagonista entre piezas **disponibles** |
| Ensayo de herencia (`HeritageEssay.jsx`) | Dos piezas del catálogo (ilustraciones salvo la Nautilus) | Ilustraciones planas junto a fotografía real: ruptura de estilo | Dos fotografías editoriales (taller, esfera en macro) de Unsplash/Pexels con licencia verificada, o prensa oficial |
| Piezas destacadas (`FeaturedPieces.jsx`) | Tres piezas del catálogo | Mezcla de ilustración y foto; incluye piezas agotadas | Fotografía de producto 4:5 de las tres piezas destacadas |
| Franja de marcas (`BrandStrip.jsx`) | Solo texto | — | Logotipos solo con permiso de cada marca; mantener texto |
| Colecciones (menú) | Redirige al catálogo | Sin imagen propia | Una imagen de portada por colección (Fase 3) |

## Cómo sustituir una ilustración por una fotografía

1. Añade la entrada en `frontend/scripts/watch_images_manifest.json` (fuente, URL, licencia, `modo: producto`).
2. Copia el original a `frontend/image-originals/<slug>/` (o usa `--descargar` si es Commons).
3. `python frontend/scripts/process_watch_images.py` → WebP 1200×1500 + miniatura, `manifest.json` y `docs/IMAGE-SOURCES.md`.
4. `python manage.py sincronizar_imagenes` actualiza la galería.
