'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Projection {
  id: string;
  date: string;
  description: string;
  type: string;
  category: string;
  amount: number;
}

interface ProjectionsTableProps {
  projections: Projection[];
}

export default function ProjectionsTable({ projections }: ProjectionsTableProps) {
  const [filter, setFilter] = useState<'despesas' | 'receitas' | 'todas'>('despesas');

  const filtered = projections.filter((p) => {
    if (filter === 'despesas') return p.type.toLowerCase() === 'despesa';
    if (filter === 'receitas') return p.type.toLowerCase() === 'receita';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="text-sm sm:text-lg font-display font-bold">Detalhamento da Projeção</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Mostrar:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-brand-500 px-3 py-1.5"
          >
            <option value="despesas">Apenas Despesas</option>
            <option value="receitas">Apenas Receitas</option>
            <option value="todas">Todas</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="px-4 sm:px-6 py-12 text-center text-slate-400 text-sm">Nenhum registro encontrado</div>
      ) : (
        <>
          {/* Mobile: card layout */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {sorted.map((p) => {
              const isIncome = p.type.toLowerCase() === 'receita';
              const formattedDate = p.date.includes('-') ? p.date.split('-').reverse().join('/') : p.date;
              return (
                <div key={p.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight line-clamp-2 flex-1" title={p.description}>
                      {p.description}
                    </p>
                    <span className={`text-sm font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(p.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">{formattedDate}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isIncome ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                      {p.type}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">{p.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sorted.map((p) => {
                  const isIncome = p.type.toLowerCase() === 'receita';
                  const formattedDate = p.date.includes('-') ? p.date.split('-').reverse().join('/') : p.date;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">{formattedDate}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={p.description}>{p.description}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isIncome ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>{p.type}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{p.category}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>{isIncome ? '+' : '-'} {formatCurrency(p.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
