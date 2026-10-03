import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Hero } from '@/components/catalog/Hero';
import { BrandStrip } from '@/components/home/BrandStrip';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { HeritageEssay } from '@/components/home/HeritageEssay';
import { FinalCta } from '@/components/home/FinalCta';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { api } from '@/services/api';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [relojes, setRelojes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Soporte de parámetros desde query regular y compatibilidad hash
  const hashParams = useMemo(() => {
    if (location.hash && location.hash.includes('?')) {
      const qs = location.hash.split('?')[1];
      return new URLSearchParams(qs);
    }
    return null;
  }, [location.hash]);

  // Filtros sincronizados con URL
  const currentPage = parseInt(searchParams.get('page') || hashParams?.get('page') || '1', 10);
  const filters = useMemo(() => ({
    buscar: searchParams.get('q') || searchParams.get('buscar') || hashParams?.get('q') || hashParams?.get('buscar') || '',
    marca: searchParams.get('marca') || hashParams?.get('marca') || '',
    categoria: searchParams.get('categoria') || hashParams?.get('categoria') || '',
    movimiento: searchParams.get('movimiento') || hashParams?.get('movimiento') || '',
    orden: searchParams.get('orden') || hashParams?.get('orden') || 'novedades',
    page: currentPage,
  }), [searchParams, hashParams, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 12));

  // Desplazamiento suave hacia la sección de catálogo cuando el hash es #catalogo
  useEffect(() => {
    if (location.hash === '#catalogo' || location.hash.startsWith('#catalogo')) {
      const el = document.getElementById('catalogo');
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, location.search, location.pathname]);

  // Carga de metadatos (marcas y categorías)
  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      try {
        const [marcasData, categoriasData] = await Promise.all([
          api.getMarcas(),
          api.getCategorias(),
        ]);
        if (!cancelled) {
          setMarcas(marcasData);
          setCategorias(categoriasData);
        }
      } catch (err) {
        console.error('Error al cargar metadatos de la bóveda:', err);
      }
    }
    loadMetadata();
    return () => { cancelled = true; };
  }, []);

  // Carga de relojes según filtros
  const fetchRelojes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRelojes(filters);
      const items = Array.isArray(data) ? data : (data.results || []);
      setRelojes(items);
      if (!Array.isArray(data)) {
        setTotalCount(data.count ?? items.length);
      } else {
        setTotalCount(items.length);
      }
    } catch (err) {
      // Si la página no es válida en DRF (ej. se filtró y quedó fuera de rango), volver a página 1
      if (err.message && (err.message.includes('Página no válida') || err.message.includes('Invalid page'))) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('page');
        setSearchParams(newParams);
        return;
      }
      setError(err.message || 'Error al conectar con la bóveda de datos');
    } finally {
      setLoading(false);
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchRelojes();
  }, [fetchRelojes]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    // Al modificar cualquier filtro, reiniciar la paginación a la primera página
    newParams.delete('page');

    const paramKey = key === 'buscar' ? 'q' : key;
    if (value && value !== 'novedades') {
      newParams.set(paramKey, value);
      if (key === 'buscar') newParams.delete('buscar');
    } else {
      newParams.delete(paramKey);
      if (key === 'buscar') newParams.delete('buscar');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newParams.set('page', String(newPage));
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSelectMarca = (marcaId) => {
    handleFilterChange('marca', String(marcaId));
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Selección determinista del guardatiempo protagonista (sin IDs hardcodeados)
  const protagonistPiece = useMemo(() => {
    if (!relojes || relojes.length === 0) return null;
    const conImagen = relojes.filter((r) => Boolean(r.imagen_url));
    if (conImagen.length === 0) return relojes[0];
    return [...conImagen].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio))[0];
  }, [relojes]);

  // Selección determinista de piezas destacadas (3 piezas distintas del protagonista)
  const featuredPieces = useMemo(() => {
    if (!relojes || relojes.length === 0) return [];
    const restantes = relojes.filter((r) => r.id !== protagonistPiece?.id && Boolean(r.imagen_url));
    return restantes.length >= 3 ? restantes.slice(0, 3) : relojes.slice(0, 3);
  }, [relojes, protagonistPiece]);

  const hasActiveFilters =
    Boolean(filters.buscar) ||
    Boolean(filters.marca) ||
    Boolean(filters.categoria) ||
    Boolean(filters.movimiento) ||
    (filters.orden && filters.orden !== 'novedades');

  return (
    <div>
      {/* 1. HERO ASIMÉTRICO */}
      <Hero
        protagonistPiece={protagonistPiece}
        totalPiezas={totalCount || relojes.length}
      />

      {/* 2. TIRA DE MANUFACTURAS */}
      <BrandStrip
        marcas={marcas}
        onSelectMarca={handleSelectMarca}
      />

      {/* 3. PIEZAS DESTACADAS (SÉLECTION DU MAÎTRE) */}
      <FeaturedPieces
        pieces={featuredPieces}
      />

      {/* 4. ENSAYO DE HERENCIA & ARQUITECTURA */}
      <HeritageEssay />

      {/* 5. CTA FINAL */}
      <FinalCta />

      {/* 6. CATÁLOGO GENERAL (VITRINA EDITORIAL) */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-32 scroll-mt-24" id="catalogo">
        {/* HEADER DE CATÁLOGO EDITORIAL */}
        <div className="mb-12 border-b border-cronos-line pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.28em] text-cronos-bronze uppercase block mb-2">
              CRONOS GENÈVE &bull; CATÁLOGO
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cronos-text tracking-[0.02em]">
              La Colección
            </h2>
            <p className="text-xs sm:text-sm text-cronos-muted max-w-xl font-sans leading-relaxed mt-2 font-normal">
              Una cuidada selección de 24 piezas mecánicas y de alta precisión de las casas relojeras más prestigiosas, catalogadas por manufactura, calibre y referencia.
            </p>
          </div>
          <div className="lg:text-right shrink-0">
            <span className="font-mono text-xs text-cronos-text uppercase tracking-widest block font-medium">
              {totalCount} {totalCount === 1 ? 'PIEZA REGISTRADA' : 'PIEZAS REGISTRADAS'}
            </span>
            {totalPages > 1 && (
              <span className="font-mono text-[10px] text-cronos-muted uppercase tracking-widest block mt-1">
                PÁGINA {String(currentPage).padStart(2, '0')} DE {String(totalPages).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* BARRA DE CONTROL & FILTROS */}
        <CatalogToolbar
          marcas={marcas}
          categorias={categorias}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* INDICADOR DE FILTROS ACTIVOS CON CHIPS REMOVIBLES */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-technical mb-8 pb-4 border-b border-cronos-line/60">
            <span className="text-cronos-bronze tracking-widest uppercase">FILTROS ACTIVOS:</span>
            {filters.buscar && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-cronos-line px-2.5 py-1 text-cronos-text">
                <span>"{filters.buscar}"</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('buscar', '')}
                  className="text-cronos-muted hover:text-cronos-text cursor-pointer"
                  title="Eliminar filtro de búsqueda"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.marca && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-cronos-line px-2.5 py-1 text-cronos-text">
                <span>{marcas.find((m) => String(m.id) === String(filters.marca))?.nombre || `Marca #${filters.marca}`}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('marca', '')}
                  className="text-cronos-muted hover:text-cronos-text cursor-pointer"
                  title="Eliminar filtro de manufactura"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.categoria && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-cronos-line px-2.5 py-1 text-cronos-text">
                <span>{categorias.find((c) => String(c.id) === String(filters.categoria))?.nombre || `Categoría #${filters.categoria}`}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('categoria', '')}
                  className="text-cronos-muted hover:text-cronos-text cursor-pointer"
                  title="Eliminar filtro de categoría"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.movimiento && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-cronos-line px-2.5 py-1 text-cronos-text">
                <span>{filters.movimiento}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('movimiento', '')}
                  className="text-cronos-muted hover:text-cronos-text cursor-pointer"
                  title="Eliminar filtro de calibre"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.orden && filters.orden !== 'novedades' && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-cronos-line px-2.5 py-1 text-cronos-text">
                <span>
                  {filters.orden === 'precio_asc' ? 'Precio: Menor a Mayor' :
                   filters.orden === 'precio_desc' ? 'Precio: Mayor a Menor' :
                   filters.orden === 'nombre_asc' ? 'Ref. (A - Z)' : filters.orden}
                </span>
                <button
                  type="button"
                  onClick={() => handleFilterChange('orden', 'novedades')}
                  className="text-cronos-muted hover:text-cronos-text cursor-pointer"
                  title="Restablecer orden"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-cronos-bronze hover:text-cronos-text transition-colors ml-auto sm:ml-2 underline underline-offset-4 cursor-pointer"
            >
              [ RESTABLECER TODO ]
            </button>
          </div>
        )}

        {/* GRILLA O ESTADOS DE CARGA/ERROR */}
        {loading ? (
          <div className="border border-cronos-line py-28 text-center bg-white shadow-editorial">
            <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
              CONSULTANDO COLECCIÓN DE ALTA RELOJERÍA...
            </span>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-8 text-center my-8">
            <p className="font-mono text-xs text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchRelojes}
              className="border border-red-400 px-4 py-2 font-mono text-xs uppercase text-red-300 hover:bg-red-900/40 cursor-pointer"
            >
              REINTENTAR CONSULTA
            </button>
          </div>
        ) : (
          <>
            <ProductGrid relojes={relojes} onResetFilters={handleResetFilters} />

            {/* PAGINACIÓN DISCRETA & EDITORIAL */}
            {totalPages > 1 && (
              <div className="mt-14 pt-8 border-t border-cronos-line flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="text-cronos-muted hover:text-cronos-text disabled:opacity-25 disabled:cursor-not-allowed transition-colors tracking-widest uppercase cursor-pointer flex items-center gap-1.5"
                >
                  &larr; ANTERIOR
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`h-9 w-9 flex items-center justify-center transition-colors cursor-pointer text-xs ${
                          isActive
                            ? 'border border-cronos-bronze text-cronos-bronze font-medium'
                            : 'text-cronos-muted hover:text-cronos-text hover:border hover:border-cronos-line'
                        }`}
                      >
                        {String(pageNum).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="text-cronos-muted hover:text-cronos-text disabled:opacity-25 disabled:cursor-not-allowed transition-colors tracking-widest uppercase cursor-pointer flex items-center gap-1.5"
                >
                  SIGUIENTE &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
