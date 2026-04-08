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
    <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold">Contas Fixas Detectadas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transações recorrentes que se repetem mensalmente</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-amber-600">{formatCurrency(total)}</span>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(item.amount)}</p>
              <span className="recurring-badge">Recorrente</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
