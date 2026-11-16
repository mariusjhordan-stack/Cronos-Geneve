import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
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
import { CollectionsPage } from '@/pages/CollectionsPage';
import { BrandIntro } from '@/components/brand/BrandIntro';

/** Fundido entre páginas (250 ms) y regreso al inicio al cambiar de ruta. */
function PageTransition({ children }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  React.useEffect(() => {
    // Los enlaces con ancla (#catalogo) gestionan su propio desplazamiento.
    if (!window.location.hash) window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

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
              <PageTransition>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/colecciones" element={<CollectionsPage />} />
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
              </PageTransition>
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
