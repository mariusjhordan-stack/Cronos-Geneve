import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hero } from '@/components/catalog/Hero';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { api } from '@/services/api';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [relojes, setRelojes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract initial filters from search params
  const [filters, setFilters] = useState({
    buscar: searchParams.get('q') || searchParams.get('buscar') || '',
    marca: searchParams.get('marca') || '',
    movimiento: searchParams.get('movimiento') || '',
    orden: searchParams.get('orden') || 'novedades',
  });

  // Sync state when URL params change
  useEffect(() => {
    setFilters({
      buscar: searchParams.get('q') || searchParams.get('buscar') || '',
      marca: searchParams.get('marca') || '',
      movimiento: searchParams.get('movimiento') || '',
      orden: searchParams.get('orden') || 'novedades',
    });
  }, [searchParams]);

  // Load brands list once
  useEffect(() => {
    async function loadMarcas() {
      try {
        const marcasData = await api.getMarcas();
        setMarcas(marcasData);
      } catch (err) {
        console.error('Error al cargar manufacturas:', err);
      }
    }
    loadMarcas();
  }, []);

  // Fetch watches matching current filters
  const fetchRelojes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRelojes(filters);
      // DRF returns { count, next, previous, results: [...] } or array
      const items = Array.isArray(data) ? data : (data.results || []);
      setRelojes(items);
    } catch (err) {
      setError(err.message || 'Error al conectar con la bóveda de datos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRelojes();
  }, [fetchRelojes]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);

    // Update URL query params
    const newParams = new URLSearchParams();
    if (updated.buscar) newParams.set('q', updated.buscar);
    if (updated.marca) newParams.set('marca', updated.marca);
    if (updated.movimiento) newParams.set('movimiento', updated.movimiento);
    if (updated.orden && updated.orden !== 'novedades') newParams.set('orden', updated.orden);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setFilters({ buscar: '', marca: '', movimiento: '', orden: 'novedades' });
    setSearchParams(new URLSearchParams());
  };

  // Find protagonist piece for Hero (e.g. piece 2 Daytona or first in list)
  const protagonistPiece = relojes.find((r) => r.id === 2) || relojes[0];

  return (
    <div>
      {/* 1. Hero Editorial Asimétrico */}
      <Hero protagonistPiece={protagonistPiece} totalPiezas={relojes.length} />

      {/* 2. Galería Editorial de Catálogo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="catalogo">
        {/* Barra de Filtros Minimalista */}
        <CatalogToolbar
          marcas={marcas}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={relojes.length}
        />

        {/* Indicador de Inventario */}
        <div className="flex items-center justify-between border-b border-cronos-line pb-3 mb-8">
          <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
            INVENTARIO REGISTRADO &bull; {relojes.length} {relojes.length === 1 ? 'PIEZA' : 'PIEZAS'}
          </span>

          {(filters.buscar || filters.marca || filters.movimiento) && (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-cronos-bronze tracking-widest uppercase">FILTRO ACTIVO:</span>
              {filters.buscar && <span className="text-white">"{filters.buscar}"</span>}
              {filters.marca && (
                <span className="text-white">
                  {marcas.find((m) => String(m.id) === String(filters.marca))?.nombre || `Marca #${filters.marca}`}
                </span>
              )}
              {filters.movimiento && <span className="text-white">{filters.movimiento}</span>}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-cronos-bronze hover:text-white transition-colors ml-2 underline underline-offset-4"
              >
                [ BORRAR ]
              </button>
            </div>
          )}
        </div>

        {/* Loader o Grilla de Relojes */}
        {loading ? (
          <div className="border border-cronos-line py-28 text-center bg-cronos-surface/40">
            <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
              ACCEDIENDO A LA BÓVEDA DE ALTA RELOJERÍA...
            </span>
          </div>
        ) : error ? (
          <div className="border border-red-900/40 bg-red-950/20 p-8 text-center my-8">
            <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchRelojes}
              className="border border-red-400 px-4 py-2 font-mono text-xs uppercase text-red-300 hover:bg-red-900/40"
            >
              REINTENTAR CONEXIÓN
            </button>
          </div>
        ) : (
          <ProductGrid relojes={relojes} onResetFilters={handleResetFilters} />
        )}
      </section>
    </div>
  );
}
