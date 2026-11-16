export function getWatchImageSrc(watch) {
  if (!watch) return '';

  const gallery = Array.isArray(watch.imagenes) ? [...watch.imagenes] : [];
  gallery.sort((a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER));
  const mainImage = gallery.find((image) => image?.orden === 1 && image.url);
  return mainImage?.url || gallery.find((image) => image?.url)?.url || watch.imagen_url || '';
}
