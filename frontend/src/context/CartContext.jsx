import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cronos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cronos_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (reloj, cantidad = 1) => {
    if (!reloj) return false;

    if (reloj.stock <= 0) {
      toast.error(`La pieza '${reloj.nombre || ''}' se encuentra agotada en bóveda.`);
      return false;
    }

    const requestedQty = Math.max(1, parseInt(cantidad, 10) || 1);

    // Resolver la imagen principal (priorizando galería de FASE 1.5)
    let resolvedImage = '';
    if (Array.isArray(reloj.imagenes) && reloj.imagenes.length > 0) {
      const primary = reloj.imagenes.find((img) => img.orden === 1);
      resolvedImage = primary ? primary.url : reloj.imagenes[0].url;
    } else if (reloj.imagen_url) {
      resolvedImage = reloj.imagen_url;
    } else {
      resolvedImage = '/images/relojes/placeholder-reloj.svg';
    }

    // Comprobar disponibilidad actual en el carrito
    const existingItem = items.find((it) => it.id === reloj.id);
    const currentQtyInCart = existingItem ? existingItem.cantidad : 0;

    if (currentQtyInCart >= reloj.stock) {
      toast.warning(
        `Se ha alcanzado el límite máximo en bóveda para '${reloj.nombre}' (${reloj.stock} disponible${reloj.stock > 1 ? 's' : ''}).`
      );
      setIsOpen(true);
      return false;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.id === reloj.id);

      if (existingIndex > -1) {
        const currentItem = prevItems[existingIndex];
        const nextQty = Math.min(currentItem.cantidad + requestedQty, reloj.stock);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...currentItem,
          cantidad: nextQty,
          precio: parseFloat(reloj.precio),
          stock: reloj.stock,
          imagen_url: resolvedImage,
        };
        return updated;
      }

      const finalQty = Math.min(requestedQty, reloj.stock);
      return [
        ...prevItems,
        {
          id: reloj.id,
          nombre: reloj.nombre,
          marca_nombre:
            reloj.marca_nombre ||
            reloj.marca_detalle?.nombre ||
            (typeof reloj.marca === 'string' ? reloj.marca : 'Manufactura Suiza'),
          precio: parseFloat(reloj.precio),
          stock: reloj.stock,
          imagen_url: resolvedImage,
          movimiento_display: reloj.movimiento_display || reloj.movimiento || 'Mecánico',
          diametro_caja_mm: reloj.diametro_caja_mm,
          cantidad: finalQty,
        },
      ];
    });

    if (currentQtyInCart + requestedQty > reloj.stock) {
      toast.warning(
        `Se ajustó la cantidad al stock disponible en bóveda (${reloj.stock} unidades para '${reloj.nombre}').`
      );
    } else {
      toast.success(`'${reloj.nombre}' añadido a su selección privada.`);
    }

    // Apertura inmediata e incondicional del drawer en el primer clic
    setIsOpen(true);
    return true;
  };

  const removeFromCart = (id) => {
    const item = items.find((it) => it.id === id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (item) {
      toast.info(`'${item.nombre}' retirado de su bolsa.`);
    }
  };

  const updateQuantity = (id, newQty) => {
    const parsed = parseInt(newQty, 10);
    if (isNaN(parsed)) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          // Mantiene mínimo 1 y no supera el stock disponible
          const safeQty = Math.max(1, Math.min(parsed, it.stock));
          return { ...it, cantidad: safeQty };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Su bolsa de adquisición ha sido vaciada.');
  };

  // Reemplaza el contenido con datos vigentes validados por el backend (P8).
  const replaceCart = (validatedItems) => {
    const mapped = (validatedItems || []).map((v) => ({
      id: v.id,
      nombre: v.nombre,
      marca_nombre: v.marca_nombre || 'Manufactura Suiza',
      precio: parseFloat(v.precio),
      stock: v.stock,
      imagen_url: v.imagen_url || '/images/relojes/placeholder-reloj.svg',
      movimiento_display: v.movimiento_display || v.movimiento || '',
      diametro_caja_mm: v.diametro_caja_mm,
      cantidad: Math.max(1, parseInt(v.cantidad, 10) || 1),
    }));
    setItems(mapped);
  };

  const totalUnidades = items.reduce((sum, it) => sum + (parseInt(it.cantidad, 10) || 0), 0);
  const totalMonto = items.reduce(
    (sum, it) => sum + (parseFloat(it.precio) || 0) * (parseInt(it.cantidad, 10) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalUnidades,
        totalMonto,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        replaceCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
