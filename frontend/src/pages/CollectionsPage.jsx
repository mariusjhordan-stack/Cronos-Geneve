import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { WatchImage } from '@/components/product/WatchImage';
import { getWatchImageAlt, getWatchImageSrc } from '@/lib/watchImages';

/** Colecciones: una portada por casa horológica. Ruta propia (/colecciones), distinta del catálogo general. */
export function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reduce = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [marcas, relojes] = await Promise.all([api.getMarcas(), api.getAllRelojes()]);
      const list = Array.isArray(relojes) ? relojes : relojes.results || [];
      setCollections(
        marcas
          .map((marca) => {
            const piezas = list.filter((r) => (r.marca ?? r.marca_detalle?.id) === marca.id);
            const cover = piezas.find((r) => r.stock > 0) || piezas[0];
            return { marca, piezas, cover, disponibles: piezas.filter((r) => r.stock > 0).length };
          })
          .filter((c) => c.piezas.length > 0),
      );
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las colecciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-section sm:px-6 lg:px-8 lg:py-section-lg">
      <header className="mx-auto mb-16 max-w-2xl text-center">
        <span className="mb-3 block font-mono text-[11px] uppercase tracking-[0.36em] text-cronos-bronze">Colecciones</span>
        <h1 className="font-serif text-4xl tracking-[0.02em] text-cronos-text sm:text-5xl">Una colección por casa</h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
          Explore las piezas agrupadas por manufactura. Para filtrar por calibre, categoría o precio, use el catálogo general.
        </p>
      </header>

      {loading && (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando colecciones">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] w-full animate-pulse bg-cronos-surface-2" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="py-16 text-center" role="alert">
          <p className="mb-5 font-sans text-sm text-cronos-muted">{error}</p>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(({ marca, cover, piezas, disponibles }, i) => (
            <motion.div
              key={marca.id}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/?marca=${marca.id}#catalogo`} className="group block focus:outline-none">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F4]">
                  <WatchImage
                    src={getWatchImageSrc(cover, 'card')}
                    alt={getWatchImageAlt(cover)}
                    className="h-full w-full"
                    imgClassName="transition-[transform,opacity] duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl tracking-[0.02em] text-cronos-text transition-colors duration-200 group-hover:text-cronos-bronze">
                      {marca.nombre}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-cronos-muted">
                      {piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'} · {disponibles} disponibles
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-cronos-bronze transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectionsPage;
