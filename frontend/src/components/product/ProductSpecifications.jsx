import React from 'react';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table';

export function ProductSpecifications({ reloj }) {
  const specs = [
    { label: 'Manufactura / Casa', value: reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Suiza' },
    { label: 'Referencia / Modelo', value: reloj.nombre },
    { label: 'Tipo de Calibre', value: reloj.movimiento_display || reloj.movimiento },
    { label: 'Diámetro de Caja', value: `${reloj.diametro_caja_mm} mm` },
    { label: 'Hermeticidad / WR', value: `${reloj.resistencia_agua_m} metros` },
    { label: 'Cristal de Esfera', value: reloj.cristal },
    { label: 'Material de Correa / Brazalete', value: reloj.material_correa },
    { label: 'Disponibilidad en Bóveda', value: reloj.stock > 0 ? `${reloj.stock} unidades listas para custodia` : 'Agotado (Bajo encargo especial)' },
    { label: 'País de Manufactura', value: reloj.marca_detalle?.pais_origen || 'Suiza' },
    { label: 'Certificación Horológica', value: 'Control Oficial Suizo de Cronómetros (COSC / METAS)' },
  ];

  return (
    <div className="border border-cronos-line bg-cronos-surface/40">
      <Table>
        <TableBody>
          {specs.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="w-1/3 font-mono text-[11px] uppercase tracking-widest text-cronos-muted border-r border-cronos-line/60">
                {item.label}
              </TableCell>
              <TableCell className="font-sans text-xs text-cronos-text">
                {item.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
