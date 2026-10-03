import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-xs text-cronos-text border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('border-b border-cronos-line text-cronos-muted uppercase font-mono text-[10px] tracking-[0.18em]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-cronos-line', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('border-b border-cronos-line transition-colors hover:bg-cronos-surface-2/50', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th className={cn('h-11 px-4 text-left font-normal align-middle text-cronos-muted font-mono tracking-widest text-[10px] uppercase', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('p-4 align-middle font-sans text-xs text-cronos-text', className)} {...props}>
      {children}
    </td>
  );
}
