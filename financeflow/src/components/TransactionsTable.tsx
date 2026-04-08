'use client';

import { useState } from 'react';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category_name: string;
  credit: number;
  debit: number;
  balance: number;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  title?: string;
}

export default function TransactionsTable({ transactions, title = 'Maiores Movimentações' }: TransactionsTableProps) {
  const [filter, setFilter] = useState<'saidas' | 'entradas' | 'todas'>('saidas');

  const filtered = transactions.filter((t) => {
    if (filter === 'saidas') return Number(t.debit) > 0;
    if (filter === 'entradas') return Number(t.credit) > 0;
    return true;
  });

  const sorted = [...filtered]
    .sort((a, b) => {
      const aVal = Number(a.debit) > 0 ? Number(a.debit) : Number(a.credit);
      const bVal = Number(b.debit) > 0 ? Number(b.debit) : Number(b.credit);
      return bVal - aVal;
    })
    .slice(0, 15);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-display font-bold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Mostrar:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-brand-500 px-3 py-1.5"
          >
            <option value="saidas">Apenas Saídas</option>
            <option value="entradas">Apenas Entradas</option>
            <option value="todas">Todas</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Aguardando importação de dados...</p>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((t) => {
                const isExpense = Number(t.debit) > 0;
                const amount = isExpense ? Number(t.debit) : Number(t.credit);
                const color = CATEGORY_COLORS[t.category_name] || '#64748b';
                const formattedDate = t.date.split('-').reverse().join('/');

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={t.description}>
                      {t.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {t.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={`text-sm font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isExpense ? '-' : '+'} {formatCurrency(amount)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
