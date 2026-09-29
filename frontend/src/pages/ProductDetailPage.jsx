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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getReloj(id);
        setReloj(data);

        // Fetch related pieces (same brand or movement)
        const allWatchesRes = await api.getRelojes();
        const allWatches = Array.isArray(allWatchesRes) ? allWatchesRes : (allWatchesRes.results || []);
        const filtered = allWatches
          .filter((w) => w.id !== parseInt(id, 10) && (w.marca === data.marca || w.movimiento === data.movimiento))
          .slice(0, 3);
        setRelatedPieces(filtered);
      } catch (err) {
        setError(err.message || 'No fue posible acceder a la ficha técnica en bóveda');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          EXTRAYENDO REGISTRO HOROLÓGICO #{id}...
        </span>
      </div>
    );
  }

  if (error || !reloj) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="font-mono text-[10px] tracking-widest text-red-400 uppercase block mb-2">
          ERROR DE BÓVEDA
        </span>
        <h2 className="font-serif text-2xl text-white mb-4">Pieza horológica no localizada</h2>
        <p className="text-xs text-cronos-muted leading-relaxed font-sans mb-6">
          {error || 'El identificador solicitado no corresponde a ningún calibre activo en inventario.'}
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">
            &larr; RETORNAR AL CATÁLOGO
          </Button>
        </Link>
      </div>
    );
  }

  return <ProductDetail reloj={reloj} relatedPieces={relatedPieces} />;
}
