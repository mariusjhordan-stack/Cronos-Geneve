import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShieldCheck, Scale, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductCard } from '@/components/catalog/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';

export function ProductDetail({ reloj, relatedPieces = [] }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleCompare, isCompared } = useCompare();

  const brandName = reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Manufactura Suiza';
  const price = parseFloat(reloj.precio);
  const inStock = reloj.stock > 0;
  const compared = isCompared(reloj.id);

  const handleAddToCart = () => {
    addToCart(reloj, quantity);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Discreto */}
      <nav className="mb-8 font-mono text-[10px] tracking-widest text-cronos-muted uppercase flex items-center gap-2">
        <Link to="/" className="hover:text-cronos-bronze transition-colors">
          Catálogo
        </Link>
        <span>&bull;</span>
        <Link to={`/?marca=${reloj.marca}`} className="hover:text-cronos-bronze transition-colors">
          {brandName}
        </Link>
        <span>&bull;</span>
        <span className="text-white">{reloj.nombre}</span>
      </nav>

      {/* Main Showcase Section: 2 Columns (Image 50% & Purchase details 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-cronos-line">
        {/* Columna Izquierda: Escenario Fotográfico Grande (6 cols) */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square w-full border border-cronos-line bg-cronos-surface flex items-center justify-center p-8 sm:p-12">
            {reloj.imagen_url ? (
              <img
                src={reloj.imagen_url}
                alt={`${brandName} ${reloj.nombre}`}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
                }}
              />
            ) : (
              <div className="font-mono text-xs text-cronos-muted">
                [ ARCHIVO RESERVADO ]
              </div>
            )}

            {/* Stock Tag */}
            <div className="absolute top-4 right-4">
              {!inStock && (
                <Badge variant="destructive">[ AGOTADO EN BÓVEDA ]</Badge>
              )}
              {inStock && reloj.stock === 1 && (
                <Badge variant="unique">[ PIEZA ÚNICA ]</Badge>
              )}
              {inStock && reloj.stock > 1 && reloj.stock <= 3 && (
                <Badge variant="bronze">[ {reloj.stock} DISPONIBLES ]</Badge>
              )}
              {inStock && reloj.stock > 3 && (
                <Badge variant="default">[ EN BÓVEDA ]</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ficha de Adquisición (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            {brandName}
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.04em] leading-tight mb-4">
            {reloj.nombre}
          </h1>

          {/* Precio y Cotización Oficial */}
          <div className="mb-6 pb-6 border-b border-cronos-line">
            <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              COTIZACIÓN OFICIAL EN BÓVEDA
            </span>
            <div className="font-mono text-3xl text-white font-medium">
              {formatPrice(price)} <span className="text-xs text-cronos-muted">USD</span>
            </div>
            <span className="block font-mono text-[10px] text-cronos-muted mt-1.5">
              Impuestos de importación y seguro de custodia internacional incluidos.
            </span>
          </div>

          {/* Resumen Técnico Sintético */}
          <div className="py-4 border-b border-cronos-line space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest">MECANISMO:</span>
              <span className="text-white">{reloj.movimiento_display || reloj.movimiento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest">DIÁMETRO DE CAJA:</span>
              <span className="text-white">{reloj.diametro_caja_mm} MM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest">HERMETICIDAD:</span>
              <span className="text-white">{reloj.resistencia_agua_m} M WR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest">CRISTAL:</span>
              <span className="text-white text-right max-w-[240px] truncate">{reloj.cristal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cronos-muted uppercase tracking-widest">BRAZALETE:</span>
              <span className="text-white text-right max-w-[240px] truncate">{reloj.material_correa}</span>
            </div>
          </div>

          {/* Acciones de Adquisición */}
          <div className="pt-6 space-y-4">
            {inStock ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                    UNIDADES:
                  </span>
                  <div className="inline-flex items-center border border-cronos-line">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-cronos-muted hover:text-white transition-colors"
                      aria-label="Restar unidad"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= reloj.stock}
                      onClick={() => setQuantity((q) => Math.min(reloj.stock, q + 1))}
                      className="px-3 py-2 text-cronos-muted hover:text-white transition-colors disabled:opacity-30"
                      aria-label="Sumar unidad"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-cronos-muted">
                    ({reloj.stock} disponibles en inventario)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <span>RÉSERVER CETTE PIÈCE</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => toggleCompare(reloj)}
                    className="flex items-center justify-center gap-2"
                  >
                    {compared ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-cronos-bronze" />
                        <span>EN MATRIZ</span>
                      </>
                    ) : (
                      <>
                        <Scale className="h-3.5 w-3.5" />
                        <span>COMPARAR</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="border border-cronos-line bg-cronos-surface p-6 text-center">
                <span className="font-mono text-[10px] tracking-widest text-red-400 uppercase block mb-1">
                  DISPONIBILIDAD AGOTADA
                </span>
                <p className="text-xs text-cronos-muted font-sans mb-4">
                  Esta pieza horológica no cuenta con ejemplares libres en bóveda en este momento. Puede solicitar su registro en la lista privada de custodia.
                </p>
                <Button variant="outline" size="sm">
                  SOLICITAR ENCARGO PRIVADO &rarr;
                </Button>
              </div>
            )}

            {/* Security and Custody badge */}
            <div className="flex items-center gap-3 pt-4 border-t border-cronos-line/40 text-[11px] font-mono text-cronos-muted">
              <ShieldCheck className="h-4 w-4 text-cronos-bronze shrink-0" />
              <span>Custodia asegurada y emisión de Certificado Oficial de Autenticidad.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Sección Inferior: Descripción Editorial & Ficha Técnica */}
      <div className="py-16">
        <Tabs defaultValue="descripcion">
          <TabsList>
            <TabsTrigger value="descripcion">Histoire & Description</TabsTrigger>
            <TabsTrigger value="especificaciones">Fiche Technique</TabsTrigger>
            <TabsTrigger value="custodia">Protocole Notarié</TabsTrigger>
          </TabsList>

          <TabsContent value="descripcion">
            <div className="max-w-3xl space-y-4">
              <h3 className="font-serif text-2xl text-white tracking-wide">
                Arquitectura de Manufactura y Trascendencia
              </h3>
              <p className="font-sans text-sm sm:text-base text-cronos-text/90 leading-relaxed font-light">
                {reloj.descripcion}
              </p>
              {reloj.marca_detalle?.descripcion && (
                <div className="mt-8 border-l border-cronos-bronze pl-4 py-1">
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

          <TabsContent value="custodia">
            <div className="max-w-3xl space-y-4 font-sans text-sm text-cronos-muted leading-relaxed">
              <h3 className="font-serif text-2xl text-white tracking-wide">
                Protocolo de Custodia Notarial y Transporte Blindado
              </h3>
              <p>
                Cada guardatiempo que abandona las instalaciones de <strong>Cronos Genève</strong> es sometido a un riguroso examen cronométrico previo. Se emite un certificado notarial inviolable con número de serie irrepetible, fecha y hora de emisión UTC, así como la identidad titular registrada en la póliza internacional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-mono text-xs">
                <div className="border border-cronos-line p-4 bg-cronos-surface">
                  <span className="text-white block font-medium mb-1">SELLADO DE BÓVEDA</span>
                  <span>Caja hermética con microprecinto notarial de seguridad.</span>
                </div>
                <div className="border border-cronos-line p-4 bg-cronos-surface">
                  <span className="text-white block font-medium mb-1">TRANSPORTE ASEGURADO</span>
                  <span>Custodia armada y seguro con cobertura por el 100% de la cotización.</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Piezas Relacionadas */}
      {relatedPieces.length > 0 && (
        <div className="pt-12 border-t border-cronos-line">
          <div className="text-center mb-8">
            <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block mb-1">
              HAUTE HORLOGERIE
            </span>
            <h2 className="font-serif text-2xl text-white">PIEZAS DE LA MISMA CASA Y CALIBRE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-y border-cronos-line">
            {relatedPieces.map((piece) => (
              <ProductCard key={piece.id} reloj={piece} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
