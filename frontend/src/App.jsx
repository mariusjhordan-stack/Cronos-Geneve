import React, { lazy, Suspense } from 'react';
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
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const ComparePage = lazy(() => import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const ConfirmationPage = lazy(() => import('@/pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })));
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage').then((m) => ({ default: m.PaymentReturnPage })));
import { AuthProvider, ProtectedRoute } from '@/context/AuthContext';
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AddressesPage = lazy(() => import('@/pages/AddressesPage').then((m) => ({ default: m.AddressesPage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage })));
import { BrandIntro } from '@/components/brand/BrandIntro';

/** Fundido entre páginas (250 ms) y regreso al inicio al cambiar de ruta. */
function PageTransition({ children }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  React.useEffect(() => {
    // Los enlaces con ancla (#catalogo) gestionan su propio desplazamiento.
    if (!window.location.hash) window.scrollTo({ top: 0 });
    // Título por página (SEO y pestañas): las fichas de reloj lo fijan con su nombre.
    if (TITLES[pathname]) document.title = `${TITLES[pathname]} | Cronos Genève`;
    else if (pathname === '/') document.title = 'Cronos Genève | Haute Horlogerie Suisse';
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

const TITLES = {
  '/colecciones': 'Colecciones',
  '/comparador': 'Comparador',
  '/checkout': 'Finalizar compra',
  '/login': 'Acceso',
  '/register': 'Crear cuenta',
  '/perfil': 'Mi perfil',
  '/direcciones': 'Mis direcciones',
  '/mis-ordenes': 'Mis órdenes',
  '/favoritos': 'Favoritos',
};

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="font-mono text-[11px] uppercase tracking-widest text-cronos-muted">Cargando…</span>
    </div>
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
              <Suspense fallback={<RouteFallback />}>
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
              </Suspense>
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
