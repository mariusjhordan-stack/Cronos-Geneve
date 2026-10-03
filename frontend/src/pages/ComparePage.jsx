import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, RotateCcw } from 'lucide-react';
import { CompareTable } from '@/components/catalog/CompareTable';
import { EditorialPieceSelector } from '@/components/compare/EditorialPieceSelector';
import { Button } from '@/components/ui/Button';
import { useCompare } from '@/context/CompareContext';
import { api } from '@/services/api';

export function ComparePage() {
  const [searchParams] = useSearchParams();
  const { comparedPieces, setSlot, removeFromCompare, clearCompare } = useCompare();
  const [allWatches, setAllWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const hydratedRef = useRef(false);

  // Carga de catálogo para poblar los selectores de slots
  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const data = await api.getAllRelojes();
        if (cancelled) return;
        setAllWatches(data);

        // Hidratación inicial desde query params (?ids=1,2 o ?reloj_1=X...) una sola vez
        if (!hydratedRef.current) {
          hydratedRef.current = true;
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

          targetIds.slice(0, 3).forEach((id, slotIdx) => {
            const match = data.find((w) => w.id === id);
            if (match) setSlot(slotIdx, match);
          });
        }
      } catch (err) {
        console.error('Error al cargar catálogo para matriz:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCatalog();
    return () => { cancelled = true; };
  }, [searchParams, setSlot]);

  const handleSelectSlot = (slotIndex, relojId) => {
    if (!relojId) {
      setSlot(slotIndex, null);
      return;
    }
    const reloj = allWatches.find((w) => w.id === parseInt(relojId, 10));
    if (reloj) {
      setSlot(slotIndex, reloj);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. HEADER EDITORIAL DE LA MATRIZ */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          CRONOS GENÈVE / MATRIZ HOROLÓGICA
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-wide mb-3 font-normal">
          ANÁLISIS DE PIEZAS
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted leading-relaxed font-sans">
          Contraste analítico de tolerancias mecánicas, arquitectura de caja, cotizaciones y calibres de manufacturas de prestigio.
        </p>
      </div>

      {/* 2. SELECTORES DE PIEZAS EN RANURAS (HASTA 3) */}
      <div className="border border-cronos-line bg-cronos-surface-1 p-4 sm:p-6 mb-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const currentPiece = comparedPieces[slotIdx];
            return (
              <div key={slotIdx} className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  PIEZA 0{slotIdx + 1} {slotIdx === 2 ? '(OPCIONAL)' : ''}
                </label>
                <EditorialPieceSelector
                  slotIndex={slotIdx}
                  currentPiece={currentPiece}
                  allWatches={allWatches}
                  onSelectPiece={handleSelectSlot}
                  disabled={loading}
                />
              </div>
            );
          })}
        </div>

        {comparedPieces.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cronos-line/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cronos-muted uppercase tracking-wider">
              {comparedPieces.length} de 3 piezas seleccionadas
            </span>
            <button
              type="button"
              onClick={clearCompare}
              className="text-cronos-bronze hover:text-cronos-text uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>REINICIAR MATRIZ</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MATRIZ O ESTADOS */}
      {loading ? (
        <div className="border border-cronos-line py-20 text-center bg-white my-6 shadow-xs">
          <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
            CARGANDO MATRIZ HOROLÓGICA...
          </span>
        </div>
      ) : comparedPieces.length >= 2 ? (
        <CompareTable
          pieces={comparedPieces}
          onRemovePiece={removeFromCompare}
        />
      ) : comparedPieces.length === 1 ? (
        <div className="border border-cronos-line py-16 px-4 text-center bg-white my-6 shadow-xs">
          <Scale className="h-8 w-8 text-cronos-bronze mx-auto mb-3 stroke-[1.2]" />
          <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-1">
            CONTRASTE INCOMPLETO
          </span>
          <h3 className="font-serif text-2xl text-cronos-text mb-2 font-normal">
            Seleccione una segunda pieza
          </h3>
          <p className="text-xs text-cronos-muted max-w-sm mx-auto font-sans leading-relaxed mb-6">
            Para iniciar el análisis comparativo, elija un segundo guardatiempo en los selectores superiores o añádalo directamente desde el catálogo.
          </p>
          <Link to="/#catalogo">
            <Button variant="outline" size="sm">
              EXPLORAR COLECCIÓN &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-cronos-line py-20 px-4 text-center bg-white my-6 shadow-xs">
          <Scale className="h-10 w-10 text-cronos-tertiary mx-auto mb-4 stroke-[1.2]" />
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-1">
            MATRIZ VACÍA
          </span>
          <h3 className="font-serif text-2xl text-cronos-text mb-3 font-normal">
            Sin piezas en la matriz comparativa
          </h3>
          <p className="text-xs text-cronos-muted max-w-md mx-auto font-sans leading-relaxed mb-6">
            Seleccione dos o más piezas para iniciar la comparación. Puede explorar la colección completa y seleccionar "+ COMPARAR" en cada pieza.
          </p>
          <Link to="/#catalogo">
            <Button size="default">
              EXPLORAR COLECCIÓN &rarr;
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
