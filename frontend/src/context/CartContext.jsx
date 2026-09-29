import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('cronos_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addToCart = (reloj, cantidad = 1) => {
    if (!reloj || reloj.stock <= 0) {
      showNotification(`La pieza '${reloj?.nombre || ''}' se encuentra agotada.`, 'error');
      return false;
    }

    let addedSuccessfully = false;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.id === reloj.id);

      if (existingIndex > -1) {
        const currentItem = prevItems[existingIndex];
        const nextQty = currentItem.cantidad + cantidad;

        if (nextQty > reloj.stock) {
          showNotification(
            `Se ha alcanzado el límite máximo en bóveda para '${reloj.nombre}' (${reloj.stock} disponible${reloj.stock > 1 ? 's' : ''}).`,
            'warning'
          );
          const updated = [...prevItems];
          updated[existingIndex] = { ...currentItem, cantidad: reloj.stock };
          return updated;
        }

        const updated = [...prevItems];
        updated[existingIndex] = { ...currentItem, cantidad: nextQty };
        addedSuccessfully = true;
        return updated;
      } else {
        const finalQty = Math.min(cantidad, reloj.stock);
        addedSuccessfully = true;
        return [
          ...prevItems,
          {
            id: reloj.id,
            nombre: reloj.nombre,
            marca_nombre: reloj.marca_nombre || reloj.marca_detalle?.nombre || (typeof reloj.marca === 'string' ? reloj.marca : 'Manufactura Suiza'),
            precio: parseFloat(reloj.precio),
            stock: reloj.stock,
            imagen_url: reloj.imagen_url,
            movimiento_display: reloj.movimiento_display || reloj.movimiento,
            diametro_caja_mm: reloj.diametro_caja_mm,
            cantidad: finalQty,
          },
        ];
      }
    });

    if (addedSuccessfully) {
      showNotification(`'${reloj.nombre}' añadido con distinción a su selección privada.`, 'success');
      setIsOpen(true);
    }

    return addedSuccessfully;
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    setItems((prev) => {
      return prev
        .map((it) => {
          if (it.id === id) {
            if (newQty <= 0) return null;
            const validQty = Math.min(newQty, it.stock);
            return { ...it, cantidad: validQty };
          }
          return it;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalUnidades = items.reduce((sum, it) => sum + it.cantidad, 0);
  const totalMonto = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalUnidades,
        totalMonto,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((prev) => !prev),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notification,
        dismissNotification: () => setNotification(null),
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
