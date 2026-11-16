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
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      ) : (
        <span className="font-mono text-[9px] tracking-[0.18em] text-cronos-muted uppercase">
          Archivo reservado
        </span>
      )}
    </figure>
  );
}

export default WatchImage;
