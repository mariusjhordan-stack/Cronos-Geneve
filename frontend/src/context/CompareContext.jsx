import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [comparedPieces, setComparedPieces] = useState(() => {
    try {
      const saved = localStorage.getItem('cronos_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cronos_compare', JSON.stringify(comparedPieces));
    } catch (e) {
      console.error('Error saving compare list', e);
    }
  }, [comparedPieces]);

  const addToCompare = (reloj) => {
    if (comparedPieces.length >= 3) {
      alert('La matriz comparativa permite contrastar un máximo de 3 piezas horológicas simultáneas.');
      return false;
    }
    if (!comparedPieces.some((p) => p.id === reloj.id)) {
      setComparedPieces((prev) => [...prev, reloj]);
      return true;
    }
    return false;
  };

  const removeFromCompare = (id) => {
    setComparedPieces((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleCompare = (reloj) => {
    if (comparedPieces.some((p) => p.id === reloj.id)) {
      removeFromCompare(reloj.id);
      return false;
    } else {
      return addToCompare(reloj);
    }
  };

  const isCompared = (id) => comparedPieces.some((p) => p.id === id);

  const clearCompare = () => setComparedPieces([]);

  return (
    <CompareContext.Provider
      value={{
        comparedPieces,
        addToCompare,
        removeFromCompare,
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
