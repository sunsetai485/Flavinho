'use client';

import { Clock } from 'lucide-react';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils';

interface RecurringItem {
  description: string;
  category: string;
  amount: number;
  frequency: number;
}

interface RecurringListProps {
  items: RecurringItem[];
}

export default function RecurringList({ items }: RecurringListProps) {
  if (items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-display font-bold">Contas Fixas Detectadas</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Recorrentes mensais</p>
          </div>
        </div>
        <span className="text-lg sm:text-2xl font-bold text-amber-600 sm:ml-4">{formatCurrency(total)}</span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">{item.description}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{item.category}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-base font-bold">{formatCurrency(item.amount)}</p>
              <span className="recurring-badge text-[9px] sm:text-[11px]">Recorrente</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
