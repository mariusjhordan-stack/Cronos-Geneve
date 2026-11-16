/**
 * Sistema ÚNICO de resolución de imágenes de reloj.
 *
 * Todo componente (catálogo, ficha, carrito, home, comparador…) pide aquí la imagen; nadie vuelve a
 * implementar "galería -> imagen_url -> placeholder". Entrada: un reloj tal como lo sirve la API
 * (`imagenes[]` de ImagenReloj + `imagen_url` heredado) o cualquier objeto con alguno de esos campos.
 *
 * Estándar de las imágenes: lienzo 4:5 (1200x1500), fondo #FAF8F4. `WATCH_IMAGE_RATIO` es la razón que deben
 * usar contenedores y skeletons para que nada salte al cargar.
 */
export const WATCH_IMAGE_RATIO = '4 / 5';
export const WATCH_IMAGE_PLACEHOLDER = '/images/relojes/placeholder-reloj.svg';

const FALLBACK_ORDER = Number.MAX_SAFE_INTEGER;

function normalize(image, index) {
  return {
    id: image.id ?? `img-${index}`,
    url: image.url,
    urlCard: image.url_card || image.url,
    alt: image.alt_text || '',
    tipo: image.tipo || 'PRODUCTO',
    esPrincipal: Boolean(image.es_principal),
    orden: image.orden ?? FALLBACK_ORDER,
    esIlustracion: image.tipo === 'ILUSTRACION',
  };
}

/** Galería ordenada: principal primero y luego por `orden`. Siempre devuelve un arreglo. */
export function getWatchGallery(watch) {
  if (!watch) return [];
  const gallery = (Array.isArray(watch.imagenes) ? watch.imagenes : [])
    .filter((image) => image?.url)
    .map(normalize)
    .sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal) || a.orden - b.orden);

  if (gallery.length === 0 && watch.imagen_url) {
    return [normalize({ id: 'primary', url: watch.imagen_url, orden: 1, es_principal: true, alt_text: watch.nombre }, 0)];
  }
  return gallery;
}

/**
 * Imagen principal. `size`: 'full' (1200x1500, ficha/hero) o 'card' (600x750, tarjetas y miniaturas).
 * Devuelve '' si no hay ninguna: `WatchImage` pinta entonces el placeholder.
 */
export function getWatchImageSrc(watch, size = 'full') {
  const [main] = getWatchGallery(watch);
  if (main) return size === 'card' ? main.urlCard : main.url;
  return watch?.imagen_url || '';
}

/** Segunda imagen para el hover: la primera fotografía no principal (nunca una ilustración ni la misma URL). */
export function getWatchHoverSrc(watch, size = 'card') {
  const [main, ...rest] = getWatchGallery(watch);
  if (!main) return '';
  const hover = rest.find((image) => !image.esIlustracion && image.url !== main.url);
  if (!hover) return '';
  return size === 'card' ? hover.urlCard : hover.url;
}

/** Texto alternativo de la imagen principal. */
export function getWatchImageAlt(watch) {
  const [main] = getWatchGallery(watch);
  if (main?.alt) return main.alt;
  const brand = watch?.marca_nombre || watch?.marca_detalle?.nombre || '';
  return [brand, watch?.nombre].filter(Boolean).join(' ') || 'Reloj';
}
