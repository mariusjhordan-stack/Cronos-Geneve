import React from 'react';
import { Link } from 'react-router-dom';
import { AddressManager } from '@/components/profile/AddressManager';

export function AddressesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* 1. ENCABEZADO */}
      <div className="border-b border-cronos-line pb-6">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          LIBRETA DE DIRECCIONES
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.03em] uppercase mb-2 font-normal">
          MIS DIRECCIONES
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-2xl leading-relaxed">
          Administre las direcciones asociadas a su cuenta para sus pedidos.
        </p>
      </div>

      {/* 2. SUBNAVEGACIÓN DE CUENTA */}
      <nav
        aria-label="Navegación de Cuenta"
        className="flex items-center gap-4 sm:gap-6 border-b border-cronos-line pb-3 text-[11px] font-mono tracking-widest uppercase overflow-x-auto max-w-full"
      >
        <Link
          to="/perfil"
          className="shrink-0 whitespace-nowrap text-cronos-muted hover:text-cronos-text transition-colors py-1"
        >
          [ 01 &bull; PERFIL DE USUARIO ]
        </Link>
        <span
          className="shrink-0 whitespace-nowrap text-cronos-text border-b-2 border-cronos-bronze pb-1 font-medium"
        >
          [ 02 &bull; LIBRETA DE DIRECCIONES ]
        </span>
        <Link
          to="/mis-ordenes"
          className="shrink-0 whitespace-nowrap text-cronos-muted hover:text-cronos-text transition-colors py-1"
        >
          [ 03 &bull; HISTORIAL DE ÓRDENES ]
        </Link>
      </nav>

      {/* 3. GESTOR DE DIRECCIONES */}
      <AddressManager showTitle={true} />
    </div>
  );
}

export default AddressesPage;
