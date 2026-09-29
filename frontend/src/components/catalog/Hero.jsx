import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Hero({ protagonistPiece, totalPiezas = 8 }) {
  const piece = protagonistPiece || {
    id: 2,
    nombre: "Cosmograph Daytona 'Panda'",
    marca_nombre: "Rolex",
    imagen_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900",
  };

  const watchName = piece.nombre;
  const brandName = piece.marca_nombre || piece.marca_detalle?.nombre || 'Rolex';
  const imgUrl = piece.imagen_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900';

  return (
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Columna Izquierda: Manifiesto Editorial (7 cols) */}
          <div className="lg:col-span-7 lg:pr-8">
            <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-3">
              COLLECTION 2026 &bull; HAUTE HORLOGERIE
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white tracking-[0.06em] leading-[1.08] mb-6">
              THE ART OF <br />
              <span className="italic font-light text-white/90">MECHANICAL TIME</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-cronos-muted leading-relaxed font-sans mb-8">
              A curated selection of exceptional Swiss timepieces, rigorously certified for chronometric precision, ancestral craftsmanship and horological heritage.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 border-b border-cronos-bronze pb-1 text-xs font-medium tracking-[0.24em] text-white hover:text-cronos-bronze uppercase transition-colors"
              >
                <span>EXPLORER LA COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Swiss technical metadata strip */}
            <div className="mt-12 pt-6 border-t border-cronos-line/60 grid grid-cols-3 gap-6">
              <div>
                <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  ORIGINE
                </span>
                <span className="font-mono text-xs text-white">GENÈVE, SUISSE</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  CERTIFICATION
                </span>
                <span className="font-mono text-xs text-white">METAS &bull; COSC</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  INVENTAIRE
                </span>
                <span className="font-mono text-xs text-cronos-bronze">
                  {totalPiezas} PIÈCES
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Reloj Protagonista sin cajas ni tarjetas artificiales (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <Link
              to={`/reloj/${piece.id}`}
              className="group relative block w-full max-w-md transition-transform duration-500 hover:scale-[1.02]"
            >
              <div className="relative aspect-square w-full flex items-center justify-center p-6">
                <img
                  src={imgUrl}
                  alt={`${brandName} ${watchName}`}
                  className="max-h-[380px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900';
                  }}
                />
              </div>

              {/* Caption editorial */}
              <div className="mt-2 text-center">
                <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
                  PIÈCE MAÎTRESSE
                </span>
                <span className="font-serif text-sm tracking-widest text-cronos-muted group-hover:text-white transition-colors uppercase">
                  {brandName} &mdash; {watchName}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
