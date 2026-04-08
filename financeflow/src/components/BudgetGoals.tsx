'use client';

import { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils';

interface BudgetGoal {
  id: string;
  category_name: string;
  monthly_limit: number;
}

interface BudgetGoalsProps {
  goals: BudgetGoal[];
  categorySpending: Record<string, number>;
  onAddGoal: (category: string, limit: number) => void;
  onDeleteGoal: (id: string) => void;
}

const EXPENSE_CATEGORIES = Object.keys(CATEGORY_COLORS).filter((c) => !c.includes('Entrada') && !c.includes('Salário'));

export default function BudgetGoals({ goals, categorySpending, onAddGoal, onDeleteGoal }: BudgetGoalsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');

  const handleSave = () => {
    if (!selectedCategory || !limit) return;
    onAddGoal(selectedCategory, parseFloat(limit));
    setShowModal(false);
    setSelectedCategory('');
    setLimit('');
  };

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Metas de Orçamento</h3>
          </div>
          <button onClick={() => setShowModal(true)} className="text-xs font-bold bg-brand-600 text-white px-3 py-1 rounded-lg hover:bg-brand-700 transition-all">
            + Adicionar Meta
          </button>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const spent = categorySpending[goal.category_name] || 0;
              const pct = (spent / goal.monthly_limit) * 100;
              let color = '#10b981';
              if (pct >= 100) color = '#ef4444';
              else if (pct >= 80) color = '#f59e0b';

              return (
                <div key={goal.id} className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold">{goal.category_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Limite: {formatCurrency(goal.monthly_limit)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="budget-bar mb-2">
                    <div
                      className="budget-bar-fill"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{formatCurrency(spent)}</span>
                    <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-display font-bold mb-6">Definir Meta de Orçamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria...</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Limite Mensal (R$)</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="1000.00"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button onClick={handleSave} className="flex-1 btn-primary">Salvar Meta</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
