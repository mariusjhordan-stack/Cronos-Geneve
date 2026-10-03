import React from 'react';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table';

export function ProductSpecifications({ reloj }) {
  const categoriesList = reloj.categorias_detalle?.map((c) => c.nombre).join(', ') || null;

  const rawSpecs = [
    { label: 'MANUFACTURA / CASA', value: reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Manufactura Suiza' },
    { label: 'REFERENCIA / MODELO', value: reloj.nombre },
    { label: 'TIPO DE CALIBRE', value: reloj.movimiento_display || reloj.movimiento },
    { label: 'DIÁMETRO DE CAJA', value: reloj.diametro_caja_mm ? `${reloj.diametro_caja_mm} mm` : null },
    { label: 'HERMETICIDAD / WR', value: reloj.resistencia_agua_m ? `${reloj.resistencia_agua_m} metros (${Math.round(reloj.resistencia_agua_m / 10)} bar)` : null },
    { label: 'CRISTAL HOROLÓGICO', value: reloj.cristal || null },
    { label: 'MATERIAL DE BRAZALETE', value: reloj.material_correa || null },
    { label: 'CATEGORÍA / COMPLICACIÓN', value: categoriesList },
    { label: 'PAÍS DE ORIGEN', value: reloj.marca_detalle?.pais_origen || null },
    {
      label: 'ESTADO DE BÓVEDA',
      value: reloj.stock > 0
        ? `${reloj.stock} ${reloj.stock === 1 ? 'unidad disponible en catálogo' : 'unidades disponibles en catálogo'}`
        : 'Agotado (Sin unidades disponibles en catálogo)'
    },
  ];

  // Excluir especificaciones sin valor real para no inventar datos
  const specs = rawSpecs.filter((item) => Boolean(item.value));

  return (
    <div className="border border-cronos-line bg-white shadow-xs overflow-hidden">
      <Table>
        <TableBody>
          {specs.map((item, idx) => (
            <TableRow key={idx} className="border-b border-cronos-line/70 last:border-b-0 hover:bg-cronos-surface-1 transition-colors">
              <TableCell className="w-2/5 sm:w-1/3 p-3.5 sm:p-4 font-mono text-[10px] tracking-widest text-cronos-muted uppercase border-r border-cronos-line/70 align-top bg-cronos-surface-1/40 sm:bg-transparent">
                {item.label}
              </TableCell>
              <TableCell className="p-3.5 sm:p-4 font-sans text-xs sm:text-sm text-cronos-text leading-relaxed font-normal">
                {item.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
