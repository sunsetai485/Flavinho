'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPICardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  labels?: { income: string; expenses: string; balance: string };
  badge?: string;
}

export default function KPICards({ totalIncome, totalExpenses, balance, labels, badge }: KPICardsProps) {
  const incomeLabel = labels?.income || 'Total Recebido';
  const expensesLabel = labels?.expenses || 'Total Gasto';
  const balanceLabel = labels?.balance || 'Saldo Líquido';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 sm:py-1 rounded-full">
            {badge || 'Entradas'}
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{incomeLabel}</h3>
        <p className="text-xl sm:text-3xl font-display font-bold mt-0.5 sm:mt-1">{formatCurrency(totalIncome)}</p>
      </div>

      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 dark:bg-rose-900/30 rounded-lg sm:rounded-xl flex items-center justify-center text-rose-600">
            <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 sm:py-1 rounded-full">
            {badge || 'Saídas'}
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{expensesLabel}</h3>
        <p className="text-xl sm:text-3xl font-display font-bold mt-0.5 sm:mt-1">{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:shadow-lg border-b-4 border-b-brand-500">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-50 dark:bg-brand-900/30 rounded-lg sm:rounded-xl flex items-center justify-center text-brand-600">
            <Scale className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 sm:py-1 rounded-full">
            Balanço
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{balanceLabel}</h3>
        <p className={`text-xl sm:text-3xl font-display font-bold mt-0.5 sm:mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
