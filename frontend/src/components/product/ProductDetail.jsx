import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Minus, ShieldCheck, Scale, Check, Heart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductCard } from '@/components/catalog/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export function ProductDetail({ reloj, relatedPieces = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [prevId, setPrevId] = useState(reloj.id);

  if (reloj.id !== prevId) {
    setPrevId(reloj.id);
    setActiveImageIndex(0);
  }

  const { addToCart } = useCart();
  const { toggleCompare, isCompared } = useCompare();
  const { isFavorite, toggleFavorite, isProcessing } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const brandName = reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Manufactura Suiza';
  const price = parseFloat(reloj.precio);
  const inStock = reloj.stock > 0;
  const compared = isCompared(reloj.id);
  const isFav = isFavorite(reloj.id);
  const processingFav = isProcessing(reloj.id);

  // Lista normalizada de imágenes de galería (con fallback a imagen_url)
  const galleryList = (reloj.imagenes && reloj.imagenes.length > 0)
    ? reloj.imagenes
    : (reloj.imagen_url ? [{ id: 'primary', url: reloj.imagen_url, orden: 1, alt_text: reloj.nombre }] : []);

  const activeImage = galleryList[activeImageIndex] || galleryList[0] || null;

  const handlePrevImage = () => {
    if (galleryList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? galleryList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (galleryList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === galleryList.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(reloj, quantity);
  };

  const handleFavorite = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (processingFav) return;
    await toggleFavorite(reloj);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. NAVEGACIÓN DE RETORNO Y BREADCRUMB EDITORIAL */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cronos-line/60 pb-4">
        <Link
          to="/#catalogo"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cronos-bronze hover:text-cronos-text uppercase transition-colors group focus:outline-none"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
          <span>VOLVER AL CATÁLOGO</span>
        </Link>

        <nav className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-cronos-bronze transition-colors">
            INICIO
          </Link>
          <span className="text-cronos-tertiary">/</span>
          <Link to="/#catalogo" className="hover:text-cronos-bronze transition-colors">
            CATÁLOGO
          </Link>
          <span className="text-cronos-tertiary">/</span>
          <Link to={`/?marca=${reloj.marca}#catalogo`} className="hover:text-cronos-bronze transition-colors">
            {brandName}
          </Link>
          <span className="text-cronos-tertiary">/</span>
          <span className="text-cronos-text font-medium truncate max-w-[200px] sm:max-w-xs">{reloj.nombre}</span>
        </nav>
      </div>

      {/* 2. HERO DEL PRODUCT DETAIL: 58% Galería Fotográfica / 42% Información */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pb-16 border-b border-cronos-line">
        {/* Columna Izquierda: Escaparate y Galería Fotográfica (7 cols = ~58%) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Lienzo Principal de la Imagen Activa */}
          <div className="relative aspect-square w-full border border-cronos-line bg-cronos-surface-1 flex items-center justify-center p-6 sm:p-12 overflow-hidden group">
            {activeImage?.url ? (
              <img
                key={activeImage.url}
                src={activeImage.url}
                alt={activeImage.alt_text || `${brandName} ${reloj.nombre}`}
                className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/images/relojes/placeholder-reloj.svg';
                }}
              />
            ) : (
              <div className="font-mono text-xs text-cronos-muted">
                [ ARCHIVO RESERVADO ]
              </div>
            )}

            {/* Controles de Navegación de Galería (Anterior / Siguiente) */}
            {galleryList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 border border-cronos-line bg-white/90 text-cronos-muted hover:text-cronos-text hover:border-cronos-text transition-colors cursor-pointer focus:outline-none shadow-sm"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 border border-cronos-line bg-white/90 text-cronos-muted hover:text-cronos-text hover:border-cronos-text transition-colors cursor-pointer focus:outline-none shadow-sm"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-4 w-4 stroke-[1.5]" />
                </button>
              </>
            )}

            {/* Contador Discreto de Galería [ 1 / 2 ] */}
            {galleryList.length > 1 && (
              <div className="absolute bottom-3 right-3 font-mono text-[9px] tracking-widest text-cronos-muted bg-white/90 border border-cronos-line px-2.5 py-1 select-none shadow-xs">
                [ {activeImageIndex + 1} / {galleryList.length} ]
              </div>
            )}

            {/* Indicador Discreto de Stock */}
            <div className="absolute top-4 right-4">
              {!inStock && (
                <span className="font-mono text-[9px] tracking-widest text-red-600 bg-red-50 border border-red-200 px-2.5 py-1">
                  [ AGOTADO EN BÓVEDA ]
                </span>
              )}
              {inStock && reloj.stock === 1 && (
                <span className="font-mono text-[9px] tracking-widest text-cronos-bronze bg-cronos-surface-2 border border-cronos-bronze/40 px-2.5 py-1">
                  [ PIEZA ÚNICA ]
                </span>
              )}
              {inStock && reloj.stock > 1 && reloj.stock <= 3 && (
                <span className="font-mono text-[9px] tracking-widest text-cronos-muted bg-white border border-cronos-line px-2.5 py-1 shadow-xs">
                  [ {reloj.stock} DISPONIBLES ]
                </span>
              )}
              {inStock && reloj.stock > 3 && (
                <span className="font-mono text-[9px] tracking-widest text-cronos-muted bg-white border border-cronos-line px-2.5 py-1 shadow-xs">
                  [ EN BÓVEDA ]
                </span>
              )}
            </div>
          </div>

          {/* Carrusel de Miniaturas (Thumbnails) */}
          {galleryList.length > 1 && (
            <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {galleryList.map((item, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 border p-1 bg-white transition-all cursor-pointer flex items-center justify-center focus:outline-none ${
                      isSelected
                        ? 'border-cronos-text ring-1 ring-cronos-text'
                        : 'border-cronos-line opacity-70 hover:opacity-100 hover:border-cronos-muted'
                    }`}
                    aria-label={`Seleccionar vista ${idx + 1}`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text || `Vista ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/images/relojes/placeholder-reloj.svg';
                      }}
                    />
                    <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-cronos-muted">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Información Editorial y Acciones (5 cols = ~42%) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            CRONOS GENÈVE / MANUFACTURE
          </span>

          <span className="font-mono text-xs tracking-widest text-cronos-muted uppercase block mb-1">
            {brandName}
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.02em] leading-tight mb-4 font-normal">
            {reloj.nombre}
          </h1>

          {/* Precio y Cotización */}
          <div className="mb-6 pb-6 border-b border-cronos-line">
            <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              COTIZACIÓN OFICIAL EN BÓVEDA
            </span>
            <div className="font-mono text-3xl text-cronos-text font-normal">
              {formatPrice(price)} <span className="text-xs text-cronos-muted">USD</span>
            </div>
            <span className="block font-mono text-[10px] text-cronos-muted mt-1.5">
              Valores expresados en dólares estadounidenses (USD).
            </span>
          </div>

          {/* Resumen Técnico Sintético */}
          <div className="py-4 border-b border-cronos-line space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest text-[11px]">CALIBRE:</span>
              <span className="text-cronos-text">{reloj.movimiento_display || reloj.movimiento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest text-[11px]">DIÁMETRO DE CAJA:</span>
              <span className="text-cronos-text">{reloj.diametro_caja_mm} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest text-[11px]">HERMETICIDAD:</span>
              <span className="text-cronos-text">{reloj.resistencia_agua_m} m WR</span>
            </div>
            {reloj.cristal && (
              <div className="flex justify-between">
                <span className="text-cronos-muted uppercase tracking-widest text-[11px]">CRISTAL:</span>
                <span className="text-cronos-text text-right max-w-[220px] truncate">{reloj.cristal}</span>
              </div>
            )}
            {reloj.material_correa && (
              <div className="flex justify-between">
                <span className="text-cronos-muted uppercase tracking-widest text-[11px]">BRAZALETE:</span>
                <span className="text-cronos-text text-right max-w-[220px] truncate">{reloj.material_correa}</span>
              </div>
            )}
          </div>

          {/* Disponibilidad y Acciones de Adquisición */}
          <div className="pt-6 space-y-4">
            {inStock ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                      UNIDADES:
                    </span>
                    <div className="inline-flex items-center border border-cronos-line bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-cronos-muted hover:text-cronos-text hover:bg-cronos-surface-1 transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Restar unidad"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs text-cronos-text">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= reloj.stock}
                        onClick={() => setQuantity((q) => Math.min(reloj.stock, q + 1))}
                        className="px-3 py-1.5 text-cronos-muted hover:text-cronos-text hover:bg-cronos-surface-1 transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Sumar unidad"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-cronos-bronze tracking-wider uppercase">
                    [ DISPONIBLE ]
                  </span>
                </div>

                {/* Botón Principal y Secundarios */}
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-mono text-xs uppercase"
                  >
                    <span>AÑADIR A LA BOLSA</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => toggleCompare(reloj)}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-mono tracking-wider uppercase transition-colors ${
                        compared
                          ? 'border-cronos-bronze text-cronos-bronze bg-cronos-surface-1/50'
                          : 'border-cronos-line text-cronos-text hover:border-cronos-text hover:bg-cronos-surface-1'
                      }`}
                    >
                      {compared ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-cronos-bronze stroke-[2]" />
                          <span>EN MATRIZ</span>
                        </>
                      ) : (
                        <>
                          <Scale className="h-3.5 w-3.5 stroke-[1.4]" />
                          <span>+ COMPARAR</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={processingFav}
                      onClick={handleFavorite}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-mono tracking-wider uppercase transition-colors ${
                        isFav
                          ? 'border-cronos-bronze text-cronos-bronze bg-cronos-surface-1/50'
                          : 'border-cronos-line text-cronos-muted hover:text-cronos-text hover:border-cronos-text hover:bg-cronos-surface-1'
                      }`}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 stroke-[1.4] transition-all duration-200 ${
                          isFav ? 'fill-cronos-bronze text-cronos-bronze' : ''
                        }`}
                      />
                      <span>{isFav ? 'EN FAVORITOS' : 'FAVORITOS'}</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-cronos-line bg-white p-6 text-center">
                <span className="font-mono text-[10px] tracking-widest text-red-600 uppercase block mb-1">
                  DISPONIBILIDAD AGOTADA
                </span>
                <p className="text-xs text-cronos-muted font-sans mb-4 leading-relaxed">
                  Esta pieza horológica no cuenta con ejemplares disponibles en este momento. Puede consultar modelos similares en nuestro catálogo o comparar especificaciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => toggleCompare(reloj)}
                    className="flex items-center justify-center gap-2 text-xs font-mono"
                  >
                    <Scale className="h-3.5 w-3.5 stroke-[1.4]" />
                    <span>{compared ? 'EN MATRIZ' : '+ COMPARAR'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={processingFav}
                    onClick={handleFavorite}
                    className={`flex items-center justify-center gap-2 text-xs font-mono transition-colors ${
                      isFav
                        ? 'border-cronos-bronze text-cronos-bronze bg-cronos-surface-1/50'
                        : 'border-cronos-line text-cronos-muted hover:text-cronos-text hover:border-cronos-text hover:bg-cronos-surface-1'
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 stroke-[1.4] transition-all duration-200 ${
                        isFav ? 'fill-cronos-bronze text-cronos-bronze' : ''
                      }`}
                    />
                    <span>{isFav ? 'EN FAVORITOS' : 'FAVORITOS'}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Información Técnica Verificada */}
            <div className="flex items-center gap-3 pt-4 border-t border-cronos-line/60 text-[11px] font-mono text-cronos-muted">
              <ShieldCheck className="h-4 w-4 text-cronos-bronze shrink-0 stroke-[1.4]" />
              <span>Información técnica y especificaciones verificadas de la manufactura.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN EDITORIAL & FICHA TÉCNICA */}
      <div className="py-16">
        <Tabs defaultValue="descripcion">
          <TabsList>
            <TabsTrigger value="descripcion">Historia y descripción</TabsTrigger>
            <TabsTrigger value="especificaciones">Ficha técnica</TabsTrigger>
            <TabsTrigger value="adquisicion">Protocolo de adquisición</TabsTrigger>
          </TabsList>

          <TabsContent value="descripcion">
            <div className="max-w-3xl space-y-4">
              <h3 className="font-serif text-2xl text-cronos-text tracking-wide font-normal">
                Arquitectura de Manufactura y Trascendencia
              </h3>
              <p className="font-sans text-sm sm:text-base text-cronos-text/85 leading-relaxed font-light whitespace-pre-line">
                {reloj.descripcion}
              </p>
              {reloj.marca_detalle?.descripcion && (
                <div className="mt-8 border-l-2 border-cronos-bronze bg-white p-5 border border-cronos-line shadow-xs">
                  <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
                    HERENCIA DE LA MANUFACTURA {brandName}
                  </span>
                  <p className="font-sans text-xs text-cronos-muted leading-relaxed">
                    {reloj.marca_detalle.descripcion}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="especificaciones">
            <div className="max-w-4xl">
              <ProductSpecifications reloj={reloj} />
            </div>
          </TabsContent>

          <TabsContent value="adquisicion">
            <div className="max-w-3xl space-y-4 font-sans text-sm text-cronos-muted leading-relaxed">
              <h3 className="font-serif text-2xl text-cronos-text tracking-wide font-normal">
                Protocolo de Adquisición
              </h3>
              <p className="text-cronos-text/80">
                Cada solicitud de adquisición se procesa a través de la plataforma de <strong className="text-cronos-text font-medium">Cronos Genève</strong> con registro de orden, código identificador único y confirmación detallada con las especificaciones de la pieza.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-mono text-xs">
                <div className="border border-cronos-line p-5 bg-white shadow-xs">
                  <span className="text-cronos-text block font-medium mb-1">REGISTRO DE ORDEN</span>
                  <span className="text-cronos-muted text-[11px] leading-relaxed">Comprobante digital con código de adquisición único y desglose de piezas.</span>
                </div>
                <div className="border border-cronos-line p-5 bg-white shadow-xs">
                  <span className="text-cronos-text block font-medium mb-1">DIRECCIÓN CONSIGNADA</span>
                  <span className="text-cronos-muted text-[11px] leading-relaxed">Envío gestionado según los datos de entrega especificados por el titular.</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 4. PIEZAS RELACIONADAS DE LA MISMA CASA O CALIBRE */}
      {relatedPieces.length > 0 && (
        <div className="pt-12 border-t border-cronos-line">
          <div className="mb-8">
            <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-1">
              CRONOS GENÈVE / SÉLECTION PARALLÈLE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-cronos-text font-normal">
              PIEZAS DE LA MISMA CASA Y CALIBRE
            </h2>
          </div>

          <div className="border-t border-l border-cronos-line">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {relatedPieces.map((piece) => (
                <div key={piece.id} className="border-r border-b border-cronos-line bg-white">
                  <ProductCard reloj={piece} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
