import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { CompareProvider } from '@/context/CompareContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NotificationToast } from '@/components/layout/NotificationToast';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CompareProvider>
          <div className="flex min-h-screen flex-col bg-cronos-bg text-cronos-text">
            {/* Header / Navbar Editorial */}
            <Header />

            {/* Contenido Dinámico Principal */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reloj/:id" element={<ProductDetailPage />} />
                <Route path="/comparador" element={<ComparePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmacion/:id" element={<ConfirmationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Private Watch Bag (Drawer Lateral Editorial) */}
            <CartDrawer />

            {/* Notificaciones discretas */}
            <NotificationToast />

            {/* Footer Haute Horlogerie */}
            <Footer />
          </div>
        </CompareProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
