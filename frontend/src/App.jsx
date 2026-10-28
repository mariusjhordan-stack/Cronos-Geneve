import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { CompareProvider } from '@/context/CompareContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage';
import { AuthProvider, ProtectedRoute } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AddressesPage } from '@/pages/AddressesPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { BrandIntro } from '@/components/brand/BrandIntro';

export function App() {
  return (
    <BrowserRouter>
      {/* Brand Intro Maison (Fase 9.7.1 — Apertura de marca, 1x por sesión) */}
      <BrandIntro />

      <AuthProvider>
       <FavoritesProvider>
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
                <Route path="/pago/retorno" element={<PaymentReturnPage />} />
                <Route path="/confirmacion/:id" element={<ConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/direcciones" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                <Route path="/mis-ordenes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Private Watch Bag (Drawer Lateral Editorial) */}
            <CartDrawer />

            {/* Notificaciones Sonner configuradas con estética suiza */}
            <Toaster />

            {/* Footer Haute Horlogerie */}
            <Footer />
          </div>
        </CompareProvider>
       </CartProvider>
      </FavoritesProvider>
     </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
