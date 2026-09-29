import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, RotateCcw } from 'lucide-react';
import { CompareTable } from '@/components/catalog/CompareTable';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useCompare } from '@/context/CompareContext';
import { api } from '@/services/api';

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { comparedPieces, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const [allWatches, setAllWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load catalog to populate slot selectors
  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await api.getRelojes();
        const items = Array.isArray(data) ? data : (data.results || []);
        setAllWatches(items);

        // Check if query params have ids: ?ids=1,2 or ?reloj_1=X&reloj_2=Y
        const idsParam = searchParams.get('ids');
        const r1 = searchParams.get('reloj_1');
        const r2 = searchParams.get('reloj_2');
        const r3 = searchParams.get('reloj_3');

        let targetIds = [];
        if (idsParam) {
          targetIds = idsParam.split(',').map((x) => parseInt(x.trim(), 10)).filter(Boolean);
        } else {
          if (r1) targetIds.push(parseInt(r1, 10));
          if (r2) targetIds.push(parseInt(r2, 10));
          if (r3) targetIds.push(parseInt(r3, 10));
        }

        if (targetIds.length > 0) {
          targetIds.slice(0, 3).forEach((id) => {
            const match = items.find((w) => w.id === id);
            if (match) addToCompare(match);
          });
        }
      } catch (err) {
        console.error('Error al cargar catálogo para matriz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleSelectSlot = (slotIndex, relojId) => {
    if (!relojId) {
      if (comparedPieces[slotIndex]) {
        removeFromCompare(comparedPieces[slotIndex].id);
      }
      return;
    }
    const reloj = allWatches.find((w) => w.id === parseInt(relojId, 10));
    if (reloj) {
      // If piece is already in another slot, don't duplicate
      if (comparedPieces.some((p, idx) => p.id === reloj.id && idx !== slotIndex)) {
        return;
      }
      if (comparedPieces[slotIndex]) {
        // replace
        removeFromCompare(comparedPieces[slotIndex].id);
      }
      addToCompare(reloj);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Editorial de la Matriz */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          ANÁLISIS COMPARATIVO DE CALIBRES
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-wide mb-3">
          MATRIZ HOROLÓGICA
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted leading-relaxed font-sans">
          Contraste analítico de tolerancias mecánicas, arquitectura de caja, cotizaciones y hermeticidad de manufacturas suizas de prestigio.
        </p>
      </div>

      {/* Selectores Horizontales de Piezas (Hasta 3) */}
      <div className="border border-cronos-line bg-cronos-surface p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const currentPiece = comparedPieces[slotIdx];
            return (
              <div key={slotIdx} className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  PIEZA 0{slotIdx + 1} {slotIdx === 2 ? '(OPCIONAL)' : ''}
                </label>
                <select
                  value={currentPiece ? currentPiece.id : ''}
                  onChange={(e) => handleSelectSlot(slotIdx, e.target.value)}
                  className="h-10 w-full border border-cronos-line bg-cronos-surface-2 px-3 text-xs text-white focus:border-cronos-bronze focus:outline-none cursor-pointer font-sans"
                >
                  <option value="">-- Seleccionar Guardatiempo --</option>
                  {allWatches.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.marca_nombre || w.marca_detalle?.nombre || 'Suiza'} - {w.nombre} (${parseFloat(w.precio).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {comparedPieces.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cronos-line/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cronos-muted">
              {comparedPieces.length} de 3 piezas seleccionadas
            </span>
            <button
              type="button"
              onClick={clearCompare}
              className="text-cronos-bronze hover:text-white uppercase flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>REINICIAR MATRIZ</span>
            </button>
          </div>
        )}
      </div>

      {/* Matriz Lado a Lado */}
      {comparedPieces.length >= 2 ? (
        <CompareTable
          pieces={comparedPieces}
          onRemovePiece={removeFromCompare}
        />
      ) : comparedPieces.length === 1 ? (
        <div className="border border-cronos-line py-16 text-center bg-cronos-surface/40 my-6">
          <Scale className="h-8 w-8 text-cronos-bronze mx-auto mb-3 stroke-[1.2]" />
          <h3 className="font-serif text-xl text-white mb-2">
            Seleccione al menos una segunda pieza
          </h3>
          <p className="text-xs text-cronos-muted max-w-sm mx-auto font-sans leading-relaxed mb-4">
            Para iniciar el contraste técnico, elija un segundo guardatiempo en los selectores superiores o añádalo desde el catálogo.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-cronos-line py-20 text-center bg-cronos-surface/40 my-6">
          <Scale className="h-10 w-10 text-cronos-muted/40 mx-auto mb-4 stroke-[1.2]" />
          <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-1">
            MATRIZ SIN CALIBRES
          </span>
          <h3 className="font-serif text-2xl text-white mb-3">
            No hay piezas en la matriz comparativa
          </h3>
          <p className="text-xs text-cronos-muted max-w-md mx-auto font-sans leading-relaxed mb-6">
            Explore el catálogo de Cronos Genève y haga clic en <strong>"+ COMPARAR"</strong> en cualquier pieza para contrastar sus tolerancias mecánicas y precios.
          </p>
          <Link to="/">
            <Button size="default">
              IR AL CATÁLOGO HOROLÓGICO &rarr;
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
