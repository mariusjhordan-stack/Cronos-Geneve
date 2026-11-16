import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { WATCH_IMAGE_PLACEHOLDER as PLACEHOLDER } from '@/lib/watchImages';

/**
 * Imagen de reloj con tres estados visibles:
 *  - cargando: skeleton (el contenedor impone el aspect-ratio, así no hay saltos de layout)
 *  - listo: fundido suave de la imagen
 *  - error / sin imagen: ilustración de respaldo
 */
export function WatchImage({
  src,
  alt = '',
  className,
  imgClassName,
  loading = 'lazy',
  eager = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setFailed(false);
  }

  // Una imagen en caché puede estar completa antes de que React enlace onLoad.
  useEffect(() => {
    const node = imgRef.current;
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const usePlaceholder = !src || failed;
  const shownSrc = usePlaceholder ? PLACEHOLDER : src;

  return (
    <figure className={cn('watch-stage', className)}>
      {!loaded && !usePlaceholder && <span className="watch-stage__skeleton" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={shownSrc}
        alt={usePlaceholder ? 'Ilustración de reloj: fotografía del producto no disponible' : alt}
        loading={eager ? 'eager' : loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'watch-stage__img',
          usePlaceholder && 'watch-stage__img--placeholder',
          !loaded && !usePlaceholder && 'watch-stage__img--pending',
          imgClassName,
        )}
      />
    </figure>
  );
}

export default WatchImage;
