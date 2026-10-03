import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, UserRound, Heart, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from '@/components/ui/Sheet';
import { Separator } from '@/components/ui/Separator';
import { toast } from 'sonner';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalUnidades, openCart } = useCart();
  const { totalCompared } = useCompare();
  const { totalFavorites } = useFavorites();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Cerrar el Sheet de menú móvil ante cualquier navegación (atrás/adelante o programática)
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const isHome = location.pathname === '/';
  const isColecciones = isHome && location.search.includes('orden=novedades');
  const isCatalogo = isHome && !isColecciones;
  const isComparador = location.pathname === '/comparador';

  const handleCatalogClick = () => {
    if (isHome) {
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleColeccionesClick = () => {
    if (isHome) {
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente.');
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al cerrar sesión');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cronos-line bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Monograma de Marca Editorial */}
        <Link to="/" className="group flex flex-col text-left focus:outline-none select-none shrink-0">
          <span className="font-serif text-lg sm:text-xl tracking-[0.22em] sm:tracking-[0.28em] text-cronos-text transition-colors group-hover:text-cronos-bronze">
            CRONOS GENÈVE
          </span>
          <span className="font-mono text-[8px] sm:text-[9px] tracking-widest sm:tracking-widest-brand text-cronos-muted group-hover:text-cronos-bronze/80">
            HAUTE HORLOGERIE &bull; SUISSE
          </span>
        </Link>

        {/* Navegación Central para Pantallas Grandes (Desktop >= 1024px) */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link
            to="/#catalogo"
            onClick={handleCatalogClick}
            className={`text-[11px] font-sans uppercase tracking-[0.22em] transition-colors py-1.5 relative ${
              isCatalogo
                ? 'text-cronos-text font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-cronos-text'
                : 'text-cronos-muted hover:text-cronos-text'
            }`}
          >
            Catálogo
          </Link>
          <Link
            to="/?orden=novedades#catalogo"
            onClick={handleColeccionesClick}
            className={`text-[11px] font-sans uppercase tracking-[0.22em] transition-colors py-1.5 relative ${
              isColecciones
                ? 'text-cronos-text font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-cronos-text'
                : 'text-cronos-muted hover:text-cronos-text'
            }`}
          >
            Colecciones
          </Link>
          <Link
            to="/comparador"
            className={`text-[11px] font-sans uppercase tracking-[0.22em] transition-colors py-1.5 relative inline-flex items-center gap-2 ${
              isComparador
                ? 'text-cronos-text font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-cronos-text'
                : 'text-cronos-muted hover:text-cronos-text'
            }`}
          >
            <span>Comparador</span>
            {totalCompared > 0 && (
              <span className="px-1.5 py-0.5 rounded-none bg-cronos-text text-white text-[9px] font-mono font-medium">
                {totalCompared}
              </span>
            )}
          </Link>
        </nav>

        {/* Acciones del Extremo Derecho: Autenticación, Favoritos, Bolsa y Menú Móvil */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Favoritos en Desktop */}
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            title="Selección Privada · Favoritos"
            className="hidden sm:inline-flex items-center gap-1.5 text-cronos-muted hover:text-cronos-text transition-colors p-1.5"
          >
            <Heart
              className={`h-4 w-4 stroke-[1.4] transition-colors ${
                totalFavorites > 0 ? 'fill-cronos-bronze text-cronos-bronze' : ''
              }`}
            />
            {totalFavorites > 0 && (
              <span className="font-mono text-[10px] text-cronos-bronze font-medium">
                ({totalFavorites})
              </span>
            )}
          </Link>

          {/* Accesos de Usuario en Desktop (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-4 border-l border-cronos-line/60 pl-5">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="font-mono text-[10px] tracking-widest text-cronos-muted hover:text-cronos-text transition-colors"
                >
                  PERFIL
                </Link>
                <Link
                  to="/direcciones"
                  className="font-mono text-[10px] tracking-widest text-cronos-muted hover:text-cronos-text transition-colors"
                >
                  DIRECCIONES
                </Link>
                <Link
                  to="/mis-ordenes"
                  className="font-mono text-[10px] tracking-widest text-cronos-muted hover:text-cronos-text transition-colors"
                >
                  ÓRDENES
                </Link>
                <button
                  type="button"
                  aria-label="Cerrar sesión"
                  onClick={handleLogout}
                  className="text-cronos-muted hover:text-cronos-text transition-colors p-1"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-3.5 w-3.5 stroke-[1.4]" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-cronos-muted hover:text-cronos-text transition-colors"
              >
                <UserRound className="h-3.5 w-3.5 stroke-[1.4]" />
                <span>ACCESO</span>
              </Link>
            )}
          </div>

          {/* Botón de Bolsa de Adquisición (Siempre visible) */}
          <button
            type="button"
            onClick={openCart}
            className="group flex items-center gap-2 border border-cronos-line bg-white px-3 sm:px-4 py-2 hover:border-cronos-text transition-colors focus:outline-none rounded-none cursor-pointer shrink-0"
            aria-label="Abrir selección de piezas en bolsa"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-cronos-muted group-hover:text-cronos-text transition-colors stroke-[1.4]" />
            <span className="text-[11px] font-mono tracking-widest text-cronos-text">
              BOLSA <span className="text-cronos-bronze font-medium">({totalUnidades})</span>
            </span>
          </button>

          {/* Botón de Menú para Tablet y Mobile (< 1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-cronos-muted hover:text-cronos-text p-2 focus:outline-none transition-colors shrink-0"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5 stroke-[1.4]" />
          </button>
        </div>
      </div>

      {/* Drawer Lateral Unificado para Tablet y Móvil usando Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetHeader onClose={() => setMobileMenuOpen(false)}>
          <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
            CRONOS GENÈVE &bull; NAVEGACIÓN
          </span>
          <SheetTitle>MENÚ EDITORIAL</SheetTitle>
          <SheetDescription>ÍNDICE DE ALTA RELOJERÍA</SheetDescription>
        </SheetHeader>

        <SheetContent>
          <div className="space-y-6 pt-2">
            <nav className="space-y-1 font-sans">
              <Link
                to="/#catalogo"
                onClick={handleCatalogClick}
                className="block text-xs uppercase tracking-[0.22em] text-cronos-text hover:text-cronos-bronze py-3 transition-colors border-b border-cronos-line"
              >
                Catálogo General
              </Link>
              <Link
                to="/?orden=novedades#catalogo"
                onClick={handleColeccionesClick}
                className="block text-xs uppercase tracking-[0.22em] text-cronos-muted hover:text-cronos-text py-3 transition-colors border-b border-cronos-line"
              >
                Colecciones &bull; Novedades
              </Link>
              <Link
                to="/comparador"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-cronos-text hover:text-cronos-bronze py-3 transition-colors border-b border-cronos-line"
              >
                <span>Matriz Comparativa</span>
                {totalCompared > 0 && (
                  <span className="px-2 py-0.5 rounded-none bg-cronos-text text-white text-[10px] font-mono font-medium">
                    {totalCompared}
                  </span>
                )}
              </Link>
              <Link
                to="/favoritos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-cronos-text hover:text-cronos-bronze py-3 transition-colors border-b border-cronos-line"
              >
                <span>Selección Privada &bull; Favoritos</span>
                {totalFavorites > 0 && (
                  <span className="px-2 py-0.5 rounded-none bg-cronos-bronze text-white text-[10px] font-mono font-medium">
                    {totalFavorites}
                  </span>
                )}
              </Link>
            </nav>

            <Separator />

            {/* Bloque de Cuenta / Espace Client */}
            <div className="space-y-3">
              <span className="font-mono text-technical tracking-widest text-cronos-muted uppercase block">
                CUENTA DEL TITULAR
              </span>

              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-xs uppercase tracking-[0.22em] text-cronos-text hover:text-cronos-bronze transition-colors"
                  >
                    Perfil &bull; {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                  </Link>
                  <Link
                    to="/direcciones"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-xs uppercase tracking-[0.22em] text-cronos-muted hover:text-cronos-text transition-colors"
                  >
                    Direcciones de Envío
                  </Link>
                  <Link
                    to="/mis-ordenes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-xs uppercase tracking-[0.22em] text-cronos-muted hover:text-cronos-text transition-colors"
                  >
                    Historial de Órdenes
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left py-2.5 text-xs uppercase tracking-[0.22em] text-cronos-bronze hover:text-cronos-text transition-colors cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center border border-cronos-line bg-white py-3 text-xs uppercase tracking-[0.22em] text-cronos-text hover:border-cronos-text transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center border border-cronos-line bg-cronos-surface-2 py-3 text-xs uppercase tracking-[0.22em] text-cronos-text hover:border-cronos-text transition-colors"
                  >
                    Registrar Titular
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>

        <SheetFooter>
          <div className="text-[10px] font-mono text-cronos-muted text-center tracking-widest uppercase">
            CRONOS GENÈVE &bull; HAUTE HORLOGERIE
          </div>
        </SheetFooter>
      </Sheet>
    </header>
  );
}

export default Header;
