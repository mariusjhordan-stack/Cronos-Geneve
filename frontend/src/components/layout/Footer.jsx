import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Award, Compass } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-[#2A2927] bg-[#171717] text-[#9E9B95] text-xs">
      {/* 1. Barra de Pilares Factuales de la Plataforma */}
      <div className="border-b border-[#262523] bg-[#1C1B19]/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3] mt-0.5" />
              <div>
                <span className="block font-mono text-technical tracking-widest text-[#F5F3EE] uppercase mb-1">
                  SELECCIÓN CURADA
                </span>
                <span className="text-[11px] text-[#8F8B83] leading-relaxed block font-sans">
                  Catálogo de 24 piezas de manufacturas horológicas de prestigio.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Award className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3] mt-0.5" />
              <div>
                <span className="block font-mono text-technical tracking-widest text-[#F5F3EE] uppercase mb-1">
                  FICHA TÉCNICA
                </span>
                <span className="text-[11px] text-[#8F8B83] leading-relaxed block font-sans">
                  Especificaciones detalladas de calibre, materiales y hermeticidad.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Clock className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3] mt-0.5" />
              <div>
                <span className="block font-mono text-technical tracking-widest text-[#F5F3EE] uppercase mb-1">
                  MATRIZ COMPARATIVA
                </span>
                <span className="text-[11px] text-[#8F8B83] leading-relaxed block font-sans">
                  Herramienta analítica para contrastar modelos y calibres simultáneamente.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Compass className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3] mt-0.5" />
              <div>
                <span className="block font-mono text-technical tracking-widest text-[#F5F3EE] uppercase mb-1">
                  COMPROBANTE DIGITAL
                </span>
                <span className="text-[11px] text-[#8F8B83] leading-relaxed block font-sans">
                  Registro oficial y confirmación detallada por cada orden emitida.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Editorial y Columnas de Navegación */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Bloque Identidad de la Maison */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.24em] text-white block">
              CRONOS GENÈVE
            </span>
            <p className="text-xs text-[#9E9B95] leading-relaxed font-sans max-w-sm">
              Plataforma editorial y vitrina digital dedicada a la documentación, catalogación y adquisición de piezas de alta relojería.
            </p>
            <div className="font-mono text-[10px] text-cronos-bronze tracking-[0.2em] pt-1 uppercase">
              HAUTE HORLOGERIE &bull; ÉDITION SUISSE
            </div>
          </div>

          {/* Columna Colecciones */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-technical tracking-widest text-white uppercase block">
              COLECCIONES
            </span>
            <ul className="space-y-2 text-[11px] font-sans">
              <li>
                <Link to="/#catalogo" className="hover:text-white transition-colors">
                  Catálogo General
                </Link>
              </li>
              <li>
                <Link to="/?orden=novedades#catalogo" className="hover:text-white transition-colors">
                  Novedades
                </Link>
              </li>
              <li>
                <Link to="/?movimiento=AUTOMATICO#catalogo" className="hover:text-white transition-colors">
                  Calibres Automáticos
                </Link>
              </li>
              <li>
                <Link to="/?movimiento=MANUAL#catalogo" className="hover:text-white transition-colors">
                  Cuerda Manual
                </Link>
              </li>
              <li>
                <Link to="/?movimiento=CUARZO#catalogo" className="hover:text-white transition-colors">
                  Cuarzo de Precisión
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna Servicio y Cuenta */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-technical tracking-widest text-white uppercase block">
              SERVICIO
            </span>
            <ul className="space-y-2 text-[11px] font-sans">
              <li>
                <Link to="/perfil" className="hover:text-white transition-colors">
                  Cuenta del Titular
                </Link>
              </li>
              <li>
                <Link to="/mis-ordenes" className="hover:text-white transition-colors">
                  Historial de Órdenes
                </Link>
              </li>
              <li>
                <Link to="/direcciones" className="hover:text-white transition-colors">
                  Direcciones de Envío
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="hover:text-white transition-colors">
                  Selección Privada
                </Link>
              </li>
              <li>
                <Link to="/comparador" className="hover:text-white transition-colors">
                  Matriz Comparativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna Atención e Información */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-technical tracking-widest text-white uppercase block">
              ATENCIÓN DIGITAL
            </span>
            <div className="space-y-2 text-[11px] font-sans text-[#8F8B83] leading-relaxed">
              <p>
                Asesoría técnica y soporte de adquisición en línea.
              </p>
              <p className="font-mono text-[10px] text-[#A3A09A]">
                Lunes a Viernes &bull; 09:00 - 18:00 UTC
              </p>
              <p className="font-mono text-[10px] text-cronos-bronze">
                concierge@cronos-geneve.ch
              </p>
            </div>
          </div>
        </div>

        {/* 3. Línea de Cierre Institucional */}
        <div className="mt-14 pt-8 border-t border-[#262523] flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono tracking-widest text-[#73706A] gap-4">
          <div>
            &copy; {CURRENT_YEAR} CRONOS GENÈVE. TODOS LOS DERECHOS RESERVADOS.
          </div>
          <div className="uppercase">
            HAUTE HORLOGERIE &bull; ÉDITION DIGITALE
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
