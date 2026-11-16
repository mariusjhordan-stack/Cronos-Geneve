# Fase 3 — Diseño y microinteracciones

Solo frontend (React). No hay cambios de backend ni migraciones.

## Sistema de diseño (tokens)
- `frontend/src/index.css` (`:root`): espaciado (`--space-*`, `--space-section`), radios (`--radius-*`), sombras suaves (`--shadow-*`), tipografía (`--text-label`), movimiento (`--motion-fast/base/slow`, 200–300 ms) y `--ease-premium`.
- `frontend/tailwind.config.js`: `rounded-token-*`, `py-section`, `duration-fast/base/slow`; `label` = 12 px y `technical` = 11 px.
- Todas las etiquetas monoespaciadas de 8, 9 y 10 px pasaron a 11 px (`text-[11px]`).

## Componentes
| Pieza | Cambio |
|---|---|
| `ui/Select.jsx` | Desplegable propio con buscador (≥ 5 opciones), teclado (↑ ↓ Enter Esc) y marca bronce en la opción activa. Mantiene la API del `<select>`: los formularios no cambian. Sustituye a todos los selects nativos (catálogo y checkout). |
| `ui/Checkbox.jsx` | Casilla negra con marca bronce; se usa en checkout y direcciones. |
| `ui/Button.jsx` | Dos estilos: primario relleno negro y secundario/contorno. `secondary`, `outline` y `editorial` quedan unificados. |

## Catálogo y home
- Catálogo: primera pieza disponible como tarjeta destacada (2 columnas, imagen + texto) junto a tarjetas normales en rejilla de 3; menos bordes y más aire. Filtros `sticky`.
- Home: hero, destacados y ensayo usan solo piezas con `stock > 0`. Nueva banda oscura `AtelierBand` a mitad de la página.
- Colecciones: ruta propia `/colecciones` (una portada por casa, con carga, error y reintento). Enlaza a `/?marca=<id>#catalogo`. «Catálogo» sigue en `/`.

## Microinteracciones
- Contador de la bolsa animado (cambia con desplazamiento y escala).
- Toast al añadir a la bolsa (ya existía) y fundido de 250 ms entre páginas (`PageTransition` en `App.jsx`, con scroll al inicio).
- Transiciones de 200–300 ms; se respeta `prefers-reduced-motion`.

## Verificación
- `npm run build` OK. `npm run lint`: 0 errores (4 avisos previos de fast-refresh).
- `python manage.py test`: 81 pruebas OK.
- Comprobado en navegador: dropdown con búsqueda filtra por casa (`?marca=7`), tarjeta destacada, filtros sticky, `/colecciones`, banda oscura.

## Pendiente / límites
- No probado en móvil real (solo el panel del navegador); el sheet de filtros móvil usa el mismo `Select`.
- El toast no tiene acción «Ver bolsa» porque la bolsa ya se abre sola al añadir.
- Hay `text-[11px]` en el logo del header (antes 8–9 px): conviene revisarlo visualmente en móvil.
- Las páginas de login/registro/perfil no se rediseñaron (entran en Fase 5).
