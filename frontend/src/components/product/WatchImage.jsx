import React from 'react';
import { cn } from '@/lib/utils';

const PLACEHOLDER = '/images/relojes/placeholder-reloj.svg';

export function WatchImage({
  src,
  alt = '',
  className,
  imgClassName,
  loading = 'lazy',
  eager = false,
}) {
  return (
    <figure className={cn('watch-stage', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : loading}
          decoding="async"
          className={cn('watch-stage__img', imgClassName)}
          onError={(e) => {
            if (e.currentTarget.getAttribute('data-fallback') === '1') return;
            e.currentTarget.setAttribute('data-fallback', '1');
            e.currentTarget.alt = 'Ilustración de reloj: fotografía del producto no disponible';
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      ) : (
        <img
          src={PLACEHOLDER}
          alt="Ilustración de reloj: fotografía del producto no disponible"
          loading={eager ? 'eager' : loading}
          decoding="async"
          className="watch-stage__img watch-stage__img--placeholder"
        />
      )}
    </figure>
  );
}

export default WatchImage;
