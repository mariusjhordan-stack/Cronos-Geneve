import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Scale } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalUnidades, openCart } = useCart();
  const { totalCompared } = useCompare();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cronos-line bg-cronos-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Monogram */}
        <Link to="/" className="group flex flex-col text-left focus:outline-none">
          <span className="font-serif text-lg tracking-[0.28em] text-white transition-colors group-hover:text-cronos-bronze">
            CRONOS GENÈVE
          </span>
          <span className="font-mono text-[9px] tracking-widest-brand text-cronos-muted group-hover:text-cronos-bronze/80">
            MANUFACTURE &bull; SUISSE
          </span>
        </Link>

        {/* Desktop Central Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-xs uppercase tracking-[0.2em] transition-colors py-1 ${
              isActive('/')
                ? 'text-white border-b border-cronos-bronze font-medium'
                : 'text-cronos-muted hover:text-cronos-text'
            }`}
          >
            Catálogo
          </Link>
          <Link
            to="/?orden=novedades"
            className="text-xs uppercase tracking-[0.2em] text-cronos-muted hover:text-cronos-text transition-colors py-1"
          >
            Colecciones
          </Link>
          <Link
            to="/comparador"
            className={`text-xs uppercase tracking-[0.2em] transition-colors py-1 inline-flex items-center gap-1.5 ${
              isActive('/comparador')
                ? 'text-white border-b border-cronos-bronze font-medium'
                : 'text-cronos-muted hover:text-cronos-text'
            }`}
          >
            <span>Comparador</span>
            {totalCompared > 0 && (
              <span className="h-4 w-4 rounded-full bg-cronos-bronze text-[#111214] text-[9px] font-mono flex items-center justify-center font-bold">
                {totalCompared}
              </span>
            )}
          </Link>
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] text-cronos-muted/70 hover:text-cronos-bronze transition-colors py-1"
            title="Panel de Operaciones Django"
          >
            Bóveda Admin
          </a>
        </nav>

        {/* Right actions: Bag & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={openCart}
            className="group flex items-center gap-2 border border-cronos-line px-3.5 py-2 hover:border-cronos-bronze transition-colors focus:outline-none"
            aria-label="Abrir selección de piezas"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-cronos-muted group-hover:text-cronos-bronze transition-colors" />
            <span className="text-xs font-mono tracking-widest text-cronos-text">
              BOLSA (<span className="text-cronos-bronze font-medium">{totalUnidades}</span>)
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cronos-muted hover:text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cronos-line bg-cronos-surface px-6 py-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-[0.22em] text-cronos-text py-2"
          >
            Catálogo
          </Link>
          <Link
            to="/?orden=novedades"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-[0.22em] text-cronos-muted py-2"
          >
            Colecciones
          </Link>
          <Link
            to="/comparador"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-cronos-text py-2"
          >
            <span>Comparador</span>
            {totalCompared > 0 && (
              <span className="px-2 py-0.5 rounded bg-cronos-bronze text-[#111214] text-[10px] font-mono font-bold">
                {totalCompared}
              </span>
            )}
          </Link>
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs uppercase tracking-[0.22em] text-cronos-bronze py-2"
          >
            Bóveda Admin (Django) &rarr;
          </a>
        </div>
      )}
    </header>
  );
}
