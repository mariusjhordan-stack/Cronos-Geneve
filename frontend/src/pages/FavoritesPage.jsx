import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/Button';

export function FavoritesPage() {
  const { favorites, loading, error, removeFavorite, refreshFavorites, isProcessing } = useFavorites();
  const { addToCart } = useCart();

  const handleRemove = async (relojId, relojNombre) => {
    await removeFavorite(relojId, relojNombre);
  };

  const handleAddToCart = (watch) => {
    if (!watch) return;
    if (watch.stock <= 0) {
      toast.error(`'${watch.nombre}' se encuentra actualmente agotada.`);
      return;
    }
    addToCart(watch, 1);
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 lg:px-8">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CONSULTANDO SELECCIÓN PRIVADA…
        </span>
      </div>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="border border-cronos-line bg-white p-8 sm:p-10 shadow-xs">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4 stroke-[1.2]" />
          <h2 className="font-serif text-2xl text-cronos-text mb-2 uppercase">
            ERROR AL CONSULTAR SELECCIÓN
          </h2>
          <p className="text-xs text-cronos-muted font-sans max-w-md mx-auto mb-6 leading-relaxed">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => refreshFavorites()} className="gap-2 font-mono text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>REINTENTAR</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* 1. ENCABEZADO EDITORIAL DE LA PÁGINA */}
      <div className="border-b border-cronos-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            SÉLECTION PRIVÉE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.04em] uppercase mb-2">
            FAVORITOS
          </h1>
          <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-2xl leading-relaxed">
            Una selección personal de piezas.
          </p>
        </div>
        {favorites.length > 0 && (
          <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
            [ {favorites.length} {favorites.length === 1 ? 'PIEZA GUARDADA' : 'PIEZAS GUARDADAS'} ]
          </span>
        )}
      </div>

      {/* 2. ESTADO VACÍO */}
      {favorites.length === 0 ? (
        <div className="border border-cronos-line bg-white p-12 sm:p-16 text-center shadow-xs">
          <Heart className="h-10 w-10 text-cronos-bronze mx-auto mb-4 stroke-[1.2]" />
          <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-2">
            SÉLECTION VIDE
          </span>
          <h2 className="font-serif text-2xl text-cronos-text mb-3 uppercase">
            NO HAY PIEZAS GUARDADAS
          </h2>
          <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-md mx-auto mb-8 leading-relaxed">
            Su selección privada está vacía. Explore nuestro catálogo de manufacturas para conservar las piezas de su preferencia.
          </p>
          <Link to="/#catalogo">
            <Button variant="outline" size="sm" className="font-mono text-xs tracking-widest">
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        /* 3. VITRINA DE FAVORITOS (GRID DE 3 COLUMNAS EN DESKTOP) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {favorites.map((favorite) => {
            const watch = favorite.reloj_detalle;
            if (!watch) return null;

            const brandName = watch.marca_nombre || 'Manufactura Suiza';
            const price = parseFloat(watch.precio) || 0;
            const inStock = watch.stock > 0;
            const isRemoving = isProcessing(favorite.reloj);

            return (
              <article
                key={favorite.id}
                className="group relative flex flex-col justify-between border border-cronos-line bg-white p-6 sm:p-7 transition-all duration-300 shadow-xs hover:border-cronos-line"
              >
                <div>
                  {/* Fila superior: Marca e indicador de stock */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase">
                      {brandName}
                    </span>
                    <div>
                      {!inStock && (
                        <span className="font-mono text-[9px] tracking-widest text-red-600">
                          [ AGOTADO ]
                        </span>
                      )}
                      {inStock && watch.stock === 1 && (
                        <span className="font-mono text-[9px] tracking-widest text-cronos-bronze font-medium">
                          [ PIEZA ÚNICA ]
                        </span>
                      )}
                      {inStock && watch.stock > 1 && (
                        <span className="font-mono text-[9px] tracking-widest text-cronos-muted">
                          [ {watch.stock} EN BÓVEDA ]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nombre del modelo */}
                  <h2 className="font-serif text-xl sm:text-2xl text-cronos-text tracking-[0.02em] leading-snug mb-4">
                    <Link
                      to={`/reloj/${favorite.reloj}`}
                      className="hover:text-cronos-bronze transition-colors focus:outline-none"
                    >
                      {watch.nombre}
                    </Link>
                  </h2>

                  {/* Fotografía en lienzo editorial */}
                  <div className="relative aspect-[4/5] w-full flex items-center justify-center p-4 mb-4 border border-cronos-line bg-cronos-surface-1">
                    <Link
                      to={`/reloj/${favorite.reloj}`}
                      className="flex h-full w-full items-center justify-center"
                      aria-label={`Ver especificaciones de ${watch.nombre}`}
                    >
                      {watch.imagen_url ? (
                        <img
                          src={watch.imagen_url}
                          alt={`${brandName} ${watch.nombre}`}
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              '/images/relojes/placeholder-reloj.svg';
                          }}
                        />
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center border border-cronos-line bg-cronos-surface-2">
                          <span className="font-mono text-[9px] tracking-widest text-cronos-muted">
                            [ ARCHIVO RESERVADO ]
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Calibre / Especificaciones técnicas */}
                  <div className="text-center font-mono text-[10px] tracking-widest text-cronos-muted mb-3">
                    {watch.movimiento_display || watch.movimiento || 'Calibre suizo'}
                    {watch.diametro_caja_mm && ` &bull; ${watch.diametro_caja_mm} MM`}
                    {watch.resistencia_agua_m && ` &bull; ${watch.resistencia_agua_m} M WR`}
                  </div>

                  {/* Precio */}
                  <div className="text-center font-mono text-base sm:text-lg text-cronos-text tracking-wider mb-5">
                    {formatPrice(price)}{' '}
                    <span className="text-[10px] text-cronos-muted">USD</span>
                  </div>
                </div>

                {/* Acciones: Añadir a la bolsa y Retirar de selección */}
                <div className="border-t border-cronos-line pt-4 space-y-2.5">
                  {inStock ? (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(watch)}
                      className="w-full py-2.5 px-4 bg-cronos-text hover:bg-[#2B2927] text-white font-mono text-xs tracking-[0.18em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>AÑADIR A LA BOLSA</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 text-center font-mono text-[10px] tracking-widest text-cronos-muted uppercase border border-cronos-line bg-cronos-surface-1 select-none">
                      [ PIEZA AGOTADA ]
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => handleRemove(favorite.reloj, watch.nombre)}
                    className="w-full py-2 text-center font-mono text-[10px] tracking-widest text-cronos-muted hover:text-red-600 uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{isRemoving ? 'RETIRANDO…' : 'RETIRAR DE SELECCIÓN'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
