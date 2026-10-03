import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductDetail } from '@/components/product/ProductDetail';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

export function ProductDetailPage() {
  const { id } = useParams();
  const [reloj, setReloj] = useState(null);
  const [relatedPieces, setRelatedPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const data = await api.getReloj(id);
        if (cancelled) return;
        setReloj(data);

        // Cargar piezas relacionadas (misma manufactura o movimiento)
        const allWatches = await api.getAllRelojes();
        if (cancelled) return;
        const filtered = allWatches
          .filter((w) => w.id !== parseInt(id, 10) && (w.marca === data.marca || w.movimiento === data.movimiento))
          .slice(0, 3);
        setRelatedPieces(filtered);
      } catch (err) {
        if (!cancelled) setError(err.message || 'No fue posible acceder a la ficha técnica en la bóveda');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CONSULTANDO REGISTRO DE MANUFACTURA...
        </span>
      </div>
    );
  }

  if (error || !reloj) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-2">
          CRONOS GENÈVE / ARCHIVO DE BÓVEDA
        </span>
        <h2 className="font-serif text-3xl text-cronos-text mb-4 font-normal">
          PIEZA NO ENCONTRADA
        </h2>
        <p className="text-xs text-cronos-muted leading-relaxed font-sans mb-6">
          {error || 'El identificador solicitado no corresponde a ningún calibre activo en el inventario.'}
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/#catalogo">
            <Button variant="default" size="sm">
              VOLVER A LA COLECCIÓN &rarr;
            </Button>
          </Link>
          {error && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              REINTENTAR
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <ProductDetail reloj={reloj} relatedPieces={relatedPieces} />;
}
