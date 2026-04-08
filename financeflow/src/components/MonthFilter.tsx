'use client';

import { Calendar } from 'lucide-react';
import { MONTH_NAMES } from '@/lib/utils';

interface MonthFilterProps {
  months: string[];
  selected: string;
  onSelect: (month: string) => void;
}

export default function MonthFilter({ months, selected, onSelect }: MonthFilterProps) {
  if (months.length <= 1) return null;

  const formatLabel = (monthKey: string) => {
    if (monthKey === 'all') return 'Visão Geral';
    const [year, month] = monthKey.split('-');
    return `${MONTH_NAMES[month] || month}/${year.substring(2)}`;
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Calendar className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Período de Análise</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onSelect('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            selected === 'all'
              ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          Visão Geral
        </button>
        {months.map((m) => (
          <button
            key={m}
            onClick={() => onSelect(m)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selected === m
                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {formatLabel(m)}
          </button>
        ))}
      </div>
    </div>
  );
}
