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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            {badge || 'Entradas'}
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{incomeLabel}</h3>
        <p className="text-3xl font-display font-bold mt-1">{formatCurrency(totalIncome)}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
            <TrendingDown className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full">
            {badge || 'Saídas'}
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{expensesLabel}</h3>
        <p className="text-3xl font-display font-bold mt-1">{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-lg border-b-4 border-b-brand-500">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600">
            <Scale className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-full">
            Balanço
          </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{balanceLabel}</h3>
        <p className={`text-3xl font-display font-bold mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
