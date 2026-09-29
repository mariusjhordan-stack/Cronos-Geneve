import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { CartItem } from './CartItem';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, totalUnidades, totalMonto, isOpen, closeCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetHeader onClose={closeCart}>
        <div>
          <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
            CRONOS GENÈVE &bull; BÓVEDA PRIVADA
          </span>
          <SheetTitle>PRIVATE WATCH BAG</SheetTitle>
          <SheetDescription>
            {totalUnidades} {totalUnidades === 1 ? 'PIEZA REGISTRADA' : 'PIEZAS REGISTRADAS'}
          </SheetDescription>
        </div>
      </SheetHeader>

      <SheetContent>
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-16 px-4">
            <div className="border border-cronos-line p-4 mb-4 text-cronos-muted/50">
              <ShoppingBag className="h-8 w-8 stroke-[1.2]" />
            </div>
            <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-1">
              BÓVEDA VACÍA
            </span>
            <h3 className="font-serif text-lg text-white mb-2">
              Su bolsa no contiene piezas horológicas
            </h3>
            <p className="text-xs text-cronos-muted max-w-xs leading-relaxed mb-6 font-sans">
              Explore nuestra selección de manufacturas suizas para reservar calibres y solicitar custodia asegurada.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={closeCart}
            >
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-cronos-line/40">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </SheetContent>

      {items.length > 0 && (
        <SheetFooter>
          {/* Subtotal and Vault info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cronos-muted uppercase tracking-wider">COTIZACIÓN TOTAL</span>
              <span className="text-base text-white font-medium">{formatPrice(totalMonto)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-cronos-muted border-t border-cronos-line/40 pt-2">
              <span>CUSTODIA Y TRANSPORTE</span>
              <span className="text-cronos-bronze">INCLUIDO / ASEGURADO</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleCheckout}
            >
              <span>INICIAR PROTOCOLO DE ADQUISICIÓN</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] font-mono tracking-widest text-cronos-muted hover:text-red-400 transition-colors uppercase"
              >
                [ VACIAR BOLSA ]
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="text-[10px] font-mono tracking-widest text-cronos-muted hover:text-white transition-colors uppercase"
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
