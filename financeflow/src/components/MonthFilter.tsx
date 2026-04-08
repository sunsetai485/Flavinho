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
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
        <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Período de Análise</h3>
      </div>
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
        <button
          onClick={() => onSelect('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all border snap-start ${
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
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all border snap-start ${
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
