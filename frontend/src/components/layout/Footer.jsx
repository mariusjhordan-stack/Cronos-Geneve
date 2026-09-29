import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Award, Landmark } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-cronos-line bg-[#0E0F11] text-cronos-muted text-xs">
      {/* Horological credentials bar */}
      <div className="border-b border-cronos-line/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3]" />
              <div>
                <span className="block font-mono text-[10px] tracking-widest text-cronos-text uppercase">
                  CUSTODIA ASEGURADA
                </span>
                <span className="text-[11px] text-cronos-muted/80">
                  Transporte blindado de alta seguridad internacional.
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <Award className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3]" />
              <div>
                <span className="block font-mono text-[10px] tracking-widest text-cronos-text uppercase">
                  CERTIFICADO OFICIAL
                </span>
                <span className="text-[11px] text-cronos-muted/80">
                  Autenticidad notarial y registro de calibre inmutable.
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <Clock className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3]" />
              <div>
                <span className="block font-mono text-[10px] tracking-widest text-cronos-text uppercase">
                  CALIBRACIÓN SUIZA
                </span>
                <span className="text-[11px] text-cronos-muted/80">
                  Estándares METAS y COSC en cámara de hermeticidad.
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <Landmark className="h-5 w-5 text-cronos-bronze shrink-0 stroke-[1.3]" />
              <div>
                <span className="block font-mono text-[10px] tracking-widest text-cronos-text uppercase">
                  MANUFACTURE GENÈVE
                </span>
                <span className="text-[11px] text-cronos-muted/80">
                  Rue du Rhône 42, 1204 Genève, Suisse.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links and brand manifesto */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <span className="font-serif text-lg tracking-[0.25em] text-white block">
              CRONOS GENÈVE
            </span>
            <p className="text-xs text-cronos-muted/80 leading-relaxed font-sans max-w-sm">
              Casa relojera ginebrina dedicada a la preservación, certificación y custodia de piezas maestras de la alta relojería internacional.
            </p>
            <div className="font-mono text-[10px] text-cronos-bronze tracking-widest pt-2">
              SOCIÉTÉ ANONYME &bull; GENÈVE &bull; CH-660.1.234.567-8
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-[10px] tracking-widest text-white uppercase block">
              COLECCIONES
            </span>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/?marca=1" className="hover:text-cronos-bronze transition-colors">Rolex Oyster</Link></li>
              <li><Link to="/?marca=2" className="hover:text-cronos-bronze transition-colors">Omega Seamaster</Link></li>
              <li><Link to="/?marca=3" className="hover:text-cronos-bronze transition-colors">Patek Philippe</Link></li>
              <li><Link to="/?marca=4" className="hover:text-cronos-bronze transition-colors">Audemars Piguet</Link></li>
              <li><Link to="/?movimiento=AUTOMATICO" className="hover:text-cronos-bronze transition-colors">Calibres Automáticos</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <span className="font-mono text-[10px] tracking-widest text-white uppercase block">
              PROTOCOLO
            </span>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/comparador" className="hover:text-cronos-bronze transition-colors">Matriz Horológica</Link></li>
              <li><Link to="/checkout" className="hover:text-cronos-bronze transition-colors">Protocolo de Adquisición</Link></li>
              <li><span className="text-cronos-muted/60">Custodia en Bóveda</span></li>
              <li><span className="text-cronos-muted/60">Garantía Internacional</span></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-[10px] tracking-widest text-white uppercase block">
              HORARIO DE BÓVEDA
            </span>
            <p className="text-[11px] leading-relaxed text-cronos-muted/80">
              Lunes a Viernes: 09:00 - 18:00 CET<br />
              Atención bajo cita privada y protocolo notarial.<br />
              Liaison directe: concierge@cronos-geneve.ch
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-cronos-line/40 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono tracking-widest text-cronos-muted/60 gap-4">
          <div>
            &copy; {new Date().getFullYear()} CRONOS GENÈVE S.A. TOUS DROITS RÉSERVÉS.
          </div>
          <div>
            HAUTE HORLOGERIE SUISSE &bull; ARCHITECTURE DÉCOUPLÉE REACT + DJANGO
          </div>
        </div>
      </div>
    </footer>
  );
}
