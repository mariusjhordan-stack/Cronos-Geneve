import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

const CompareContext = createContext();
const MAX_PIECES = 3;

export function CompareProvider({ children }) {
  const [comparedPieces, setComparedPieces] = useState(() => {
    try {
      const saved = localStorage.getItem('cronos_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Ref espejo para lecturas síncronas sin estado obsoleto del render anterior.
  const piecesRef = useRef(comparedPieces);
  useEffect(() => {
    piecesRef.current = comparedPieces;
  }, [comparedPieces]);

  useEffect(() => {
    try {
      localStorage.setItem('cronos_compare', JSON.stringify(comparedPieces));
    } catch (e) {
      console.error('Error saving compare list', e);
    }
  }, [comparedPieces]);

  const addToCompare = useCallback((reloj) => {
    if (!reloj || reloj.id == null) return false;
    const current = piecesRef.current;
    if (current.some((p) => p.id === reloj.id)) return false;
    if (current.length >= MAX_PIECES) {
      toast.warning('La matriz comparativa permite contrastar un máximo de 3 piezas horológicas simultáneas.');
      return false;
    }
    setComparedPieces((prev) => {
      if (prev.some((p) => p.id === reloj.id)) return prev;
      if (prev.length >= MAX_PIECES) return prev;
      return [...prev, reloj];
    });
    return true;
  }, []);

  const removeFromCompare = useCallback((id) => {
    setComparedPieces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /**
   * Asigna una pieza a un slot posicional (0-2) sin usar estado obsoleto:
   * - reloj null/undefined => vacía ese slot.
   * - si la pieza ya está en otro slot => no duplica.
   * - si el slot está ocupado => reemplaza en el mismo índice (funciona lleno).
   * - si el slot está vacío más allá del largo actual => añade al final.
   */
  const setSlot = useCallback((slotIndex, reloj) => {
    if (slotIndex < 0 || slotIndex >= MAX_PIECES) return false;
    if (!reloj) {
      setComparedPieces((prev) => prev.filter((_, i) => i !== slotIndex));
      return true;
    }
    const current = piecesRef.current;
    const dupIdx = current.findIndex((p) => p.id === reloj.id);
    if (dupIdx !== -1 && dupIdx !== slotIndex) return false;
    if (dupIdx === slotIndex) return true;
    setComparedPieces((prev) => {
      const next = [...prev];
      if (slotIndex < next.length) {
        next[slotIndex] = reloj;
        return next;
      }
      if (next.some((p) => p.id === reloj.id)) return prev;
      if (next.length >= MAX_PIECES) return prev;
      next.push(reloj);
      return next;
    });
    return true;
  }, []);

  const toggleCompare = useCallback((reloj) => {
    if (piecesRef.current.some((p) => p.id === reloj.id)) {
      removeFromCompare(reloj.id);
      return false;
    }
    return addToCompare(reloj);
  }, [addToCompare, removeFromCompare]);

  const isCompared = useCallback((id) => piecesRef.current.some((p) => p.id === id), []);

  const clearCompare = useCallback(() => setComparedPieces([]), []);

  return (
    <CompareContext.Provider
      value={{
        comparedPieces,
        addToCompare,
        removeFromCompare,
        setSlot,
        toggleCompare,
        isCompared,
        clearCompare,
        totalCompared: comparedPieces.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
