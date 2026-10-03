import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { api } from '@/services/api';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState([]);

  // Ref espejo para evitar race conditions y lecturas obsoletas en clicks simultáneos
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  const pendingRef = useRef(new Set());

  // Carga de favoritos desde el backend para usuario autenticado
  const refreshFavorites = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      setFavorites([]);
      setError(null);
      setLoading(false);
      return [];
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      const data = await api.getFavoritos();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setFavorites(list);
      return list;
    } catch (err) {
      const msg = err.message || 'No fue posible consultar su selección de favoritos.';
      setError(msg);
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated]);

  // Sincronización automática con estado de autenticación (Login / Logout / Recarga)
  useEffect(() => {
    let active = true;

    if (isAuthenticated) {
      (async () => {
        setLoading(true);
        try {
          const data = await api.getFavoritos();
          if (active) {
            setFavorites(Array.isArray(data) ? data : (data?.results || []));
            setError(null);
          }
        } catch (err) {
          if (active) {
            setError(err.message || 'Error al sincronizar favoritos');
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    } else if (favoritesRef.current.length > 0) {
      setFavorites([]);
      setError(null);
      setLoading(false);
      pendingRef.current.clear();
      setPendingIds([]);
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Set de IDs para consultas O(1) de estado favorito
  const favoriteIds = useMemo(() => {
    return new Set(
      favorites
        .map((f) => (f.reloj != null ? Number(f.reloj) : (f.reloj_detalle?.id != null ? Number(f.reloj_detalle.id) : null)))
        .filter((id) => id != null)
    );
  }, [favorites]);

  const isFavorite = useCallback(
    (relojId) => {
      if (relojId == null) return false;
      return favoriteIds.has(Number(relojId));
    },
    [favoriteIds]
  );

  const pendingSet = useMemo(() => new Set(pendingIds.map(Number)), [pendingIds]);

  const isProcessing = useCallback(
    (relojId) => {
      if (relojId == null) return false;
      return pendingSet.has(Number(relojId));
    },
    [pendingSet]
  );

  const addFavorite = useCallback(
    async (reloj) => {
      if (!isAuthenticated) return { requireAuth: true };
      const relojId = typeof reloj === 'object' && reloj !== null ? reloj.id : reloj;
      const relojNombre = typeof reloj === 'object' && reloj !== null ? reloj.nombre : null;

      if (relojId == null) return { success: false };
      const numericId = Number(relojId);

      // Bloqueo estricto contra clicks rápidos / operaciones concurrentes
      if (pendingRef.current.has(numericId)) return { success: false, inFlight: true };
      if (favoriteIds.has(numericId)) return { success: true, alreadyFavorite: true };

      pendingRef.current.add(numericId);
      setPendingIds(Array.from(pendingRef.current));

      try {
        const nuevoFavorito = await api.addFavorito(numericId);
        setFavorites((prev) => {
          if (prev.some((f) => Number(f.reloj) === numericId)) return prev;
          return [...prev, nuevoFavorito];
        });
        toast.success(
          relojNombre
            ? `'${relojNombre}' añadido a sus favoritos privados.`
            : 'Pieza añadida a favoritos.'
        );
        return { success: true };
      } catch (err) {
        // Manejo transparente de 409 (ya existe en favoritos en backend)
        if (err.status === 409 || err.message?.includes('ya está en favoritos')) {
          await refreshFavorites(true);
          return { success: true };
        }
        toast.error(err.message || 'No fue posible añadir la pieza a favoritos.');
        return { success: false, error: err };
      } finally {
        pendingRef.current.delete(numericId);
        setPendingIds(Array.from(pendingRef.current));
      }
    },
    [isAuthenticated, favoriteIds, refreshFavorites]
  );

  const removeFavorite = useCallback(
    async (relojId, relojNombre) => {
      if (!isAuthenticated) return { requireAuth: true };
      if (relojId == null) return { success: false };
      const numericId = Number(relojId);

      // Bloqueo estricto contra clicks rápidos
      if (pendingRef.current.has(numericId)) return { success: false, inFlight: true };

      pendingRef.current.add(numericId);
      setPendingIds(Array.from(pendingRef.current));

      try {
        await api.removeFavorito(numericId);
        setFavorites((prev) => prev.filter((f) => Number(f.reloj) !== numericId));
        toast.info(
          relojNombre
            ? `'${relojNombre}' retirada de su selección privada.`
            : 'Pieza retirada de favoritos.'
        );
        return { success: true };
      } catch (err) {
        // Manejo transparente de 404 (ya no existe en backend)
        if (err.status === 404 || err.message?.includes('404')) {
          setFavorites((prev) => prev.filter((f) => Number(f.reloj) !== numericId));
          return { success: true };
        }
        toast.error(err.message || 'No fue posible retirar la pieza de favoritos.');
        return { success: false, error: err };
      } finally {
        pendingRef.current.delete(numericId);
        setPendingIds(Array.from(pendingRef.current));
      }
    },
    [isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (reloj) => {
      if (!isAuthenticated) return { requireAuth: true };
      const relojId = typeof reloj === 'object' && reloj !== null ? reloj.id : reloj;
      const relojNombre = typeof reloj === 'object' && reloj !== null ? reloj.nombre : null;

      if (relojId == null) return { success: false };
      const numericId = Number(relojId);

      if (favoriteIds.has(numericId)) {
        return removeFavorite(numericId, relojNombre);
      } else {
        return addFavorite(reloj);
      }
    },
    [isAuthenticated, favoriteIds, addFavorite, removeFavorite]
  );

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      totalFavorites: favorites.length,
      loading,
      error,
      isFavorite,
      isProcessing,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      favorites,
      favoriteIds,
      loading,
      error,
      isFavorite,
      isProcessing,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      refreshFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
