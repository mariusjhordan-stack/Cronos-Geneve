import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { CartItem } from './CartItem';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, totalUnidades, totalMonto, isOpen, closeCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  // Cerrar drawer automáticamente si cambia la ruta activa
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      closeCart();
    }
  }, [location.pathname, closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleExplore = () => {
    closeCart();
    if (location.pathname === '/') {
      const el = document.getElementById('catalogo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/#catalogo');
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetHeader onClose={closeCart}>
        <div>
          <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block mb-1">
            CRONOS GENÈVE &bull; BOLSA DE ADQUISICIÓN
          </span>
          <SheetTitle>TU SELECCIÓN</SheetTitle>
          <SheetDescription>
            {totalUnidades} {totalUnidades === 1 ? 'PIEZA REGISTRADA' : 'PIEZAS REGISTRADAS'}
          </SheetDescription>
        </div>
      </SheetHeader>

      <SheetContent>
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-20 px-4">
            <div className="border border-cronos-line p-5 mb-5 text-cronos-muted bg-[#FAF9F6]">
              <ShoppingBag className="h-8 w-8 stroke-[1.2]" />
            </div>
            <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-1.5">
              BOLSA VACÍA
            </span>
            <h3 className="font-serif text-2xl text-cronos-text mb-3">
              Su selección no contiene piezas
            </h3>
            <p className="text-xs text-cronos-muted max-w-xs leading-relaxed mb-6 font-sans">
              Explore nuestra selección de guardatiempos y añada una pieza para iniciar su proceso de adquisición.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExplore}
            >
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-cronos-line">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onNavigate={closeCart}
              />
            ))}
          </div>
        )}
      </SheetContent>

      {items.length > 0 && (
        <SheetFooter>
          {/* Resumen de totales */}
          <div className="space-y-3 mb-5 border-b border-cronos-line pb-4">
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-cronos-muted uppercase tracking-wider">TOTAL ESTIMADO</span>
              <span className="text-lg text-cronos-text font-medium">
                {formatPrice(totalMonto)} <span className="text-xs text-cronos-muted font-normal">USD</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-sans text-xs uppercase"
              onClick={handleCheckout}
            >
              <span>INICIAR PROCESO DE ADQUISICIÓN</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] font-mono tracking-widest text-cronos-muted hover:text-red-700 transition-colors uppercase cursor-pointer"
              >
                [ VACIAR BOLSA ]
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="text-[10px] font-mono tracking-widest text-cronos-muted hover:text-cronos-text transition-colors uppercase cursor-pointer"
              >
                CONTINUAR EXPLORANDO
              </button>
            </div>
          </div>
        </SheetFooter>
      )}
    </Sheet>
  );
}

export default CartDrawer;
