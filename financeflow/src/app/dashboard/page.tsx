'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { api, type DashboardData } from '@/lib/api-client';
import { MONTH_NAMES, MONTH_NAME_TO_NUM } from '@/lib/utils';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import Navbar from '@/components/Navbar';
import KPICards from '@/components/KPICards';
import { BalanceChart, ExpenseChart, ComparisonChart } from '@/components/Charts';
import TransactionsTable from '@/components/TransactionsTable';
import RecurringList from '@/components/RecurringList';
import BudgetGoals from '@/components/BudgetGoals';
import MonthFilter from '@/components/MonthFilter';
import ProjectionsTable from '@/components/ProjectionsTable';
import StatusMessage from '@/components/StatusMessage';

type Tab = 'real' | 'projetado' | 'consolidado';

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [tab, setTab] = useState<Tab>('real');
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [projYear, setProjYear] = useState('');
  const [projMonth, setProjMonth] = useState('');
  const [status, setStatus] = useState<{ message: string | null; type: 'success' | 'error' | null }>({ message: null, type: null });
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    setIsDark(stored);
    if (stored) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const params: { month?: string; year?: string } = {};
      if (selectedMonth !== 'all') {
        const [y, m] = selectedMonth.split('-');
        params.year = y;
        params.month = m;
      }
      const result = await api.dashboard.get(params);
      setData(result);
      if (result.projectionYears.length > 0 && !projYear) {
        setProjYear(String(result.projectionYears[0]));
      }
    } catch (err) {
      setStatus({ message: err instanceof Error ? err.message : 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, projYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleImportFile = async (file: File) => {
    setStatus({ message: 'Processando arquivo...', type: 'success' });

    try {
      const buffer = await file.slice(0, 4).arrayBuffer();
      const sig = new Uint8Array(buffer);
      const isExcel = (sig[0] === 80 && sig[1] === 75) || (sig[0] === 208 && sig[1] === 207);

      if (isExcel) {
        const data = new Uint8Array(await file.arrayBuffer());
        const workbook = XLSX.read(data, { type: 'array' });

        let realData: unknown[][] | undefined;
        let projectionData: unknown[][] | undefined;

        const realSheet = workbook.SheetNames.find((n) => n.includes('Extrato'));
        if (realSheet) {
          realData = XLSX.utils.sheet_to_json(workbook.Sheets[realSheet], { header: 1, defval: '' }) as unknown[][];
        }

        const projSheet = workbook.SheetNames.find((n) => n.includes('Projetado'));
        if (projSheet) {
          projectionData = XLSX.utils.sheet_to_json(workbook.Sheets[projSheet], { header: 1, defval: '' }) as unknown[][];
        }

        if (!realData && !projectionData) {
          const firstSheet = workbook.SheetNames[0];
          realData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, defval: '' }) as unknown[][];
        }

        const result = await api.import.upload({
          realData,
          projectionData,
          filename: file.name,
          fileType: 'excel',
        });

        setStatus({
          message: `Importação concluída! ${result.recordsImported} transações e ${result.projectionsImported} projeções importadas.`,
          type: 'success',
        });
      } else {
        const text = await file.text();
        const parsed = Papa.parse(text, { skipEmptyLines: true });

        const result = await api.import.upload({
          realData: parsed.data as unknown[][],
          filename: file.name,
          fileType: 'csv',
        });

        setStatus({
          message: `Importação concluída! ${result.recordsImported} transações importadas.`,
          type: 'success',
        });
      }

      await fetchDashboard();
    } catch (err) {
      setStatus({ message: err instanceof Error ? err.message : 'Erro na importação', type: 'error' });
    }
  };

  const handleExportPDF = async () => {
    if (!mainRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .set({
        margin: 10,
        filename: `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      })
      .from(mainRef.current)
      .save();
  };

  const handleLogout = async () => {
    await getSupabaseBrowser().auth.signOut();
  };

  const handleAddGoal = async (category: string, limit: number) => {
    try {
      await api.budgetGoals.save({ category_name: category, monthly_limit: limit });
      await fetchDashboard();
    } catch (err) {
      setStatus({ message: err instanceof Error ? err.message : 'Erro ao salvar meta', type: 'error' });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.budgetGoals.delete(id);
      await fetchDashboard();
    } catch (err) {
      setStatus({ message: err instanceof Error ? err.message : 'Erro ao excluir meta', type: 'error' });
    }
  };

  // Compute derived data for charts
  const transactions = data?.balancePoints || [];
  const kpis = data?.kpis || { totalIncome: 0, totalExpenses: 0, balance: 0 };
  const categorySpending = data?.categorySpending || {};
  const monthlyComparison = data?.monthlyComparison || [];
  const recurring = data?.recurring || [];
  const goals = data?.goals || [];
  const availableMonths = data?.availableMonths || [];
  const projections = data?.projections || [];
  const projectionYears = data?.projectionYears || [];

  // Balance chart data
  const balanceLabels = transactions.map((t) => {
    const parts = t.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });
  const balanceData = transactions.map((t) => t.balance);

  // Monthly comparison chart
  const compLabels = monthlyComparison.map((m) => {
    const [y, mo] = m.label.split('-');
    return `${MONTH_NAMES[mo] || mo}/${y.substring(2)}`;
  });
  const compIncome = monthlyComparison.map((m) => m.income);
  const compExpenses = monthlyComparison.map((m) => m.expenses);

  // Projection data
  const filteredProjections = projections.filter((p) => {
    if (projYear && String(p.year) !== projYear) return false;
    if (projMonth && p.month !== projMonth) return false;
    return true;
  });

  const projKPIs = filteredProjections.reduce(
    (acc, p) => {
      if (p.type.toLowerCase() === 'receita') acc.income += p.amount;
      else acc.expenses += p.amount;
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const projCategorySpending: Record<string, number> = {};
  filteredProjections
    .filter((p) => p.type.toLowerCase() === 'despesa')
    .forEach((p) => {
      projCategorySpending[p.category] = (projCategorySpending[p.category] || 0) + p.amount;
    });

  // Projection balance chart
  const projSorted = [...filteredProjections].sort((a, b) => a.date.localeCompare(b.date));
  const projBalanceLabels = projSorted.map((p) => {
    const d = p.date.includes('-') ? p.date.split('-') : p.date.split('/').reverse();
    return `${d[2] || d[0]}/${d[1]}`;
  });
  const projBalanceData = projSorted.map((p) => p.projected_balance);

  // Projection monthly comparison
  const projMonthlyMap: Record<string, { income: number; expenses: number; label: string }> = {};
  filteredProjections.forEach((p) => {
    const monthNum = MONTH_NAME_TO_NUM[p.month.toLowerCase()] || '01';
    const key = `${p.year}-${monthNum}`;
    if (!projMonthlyMap[key]) {
      projMonthlyMap[key] = { income: 0, expenses: 0, label: `${MONTH_NAMES[monthNum]}/${String(p.year).substring(2)}` };
    }
    if (p.type.toLowerCase() === 'receita') projMonthlyMap[key].income += p.amount;
    else projMonthlyMap[key].expenses += p.amount;
  });
  const projMonthly = Object.entries(projMonthlyMap).sort(([a], [b]) => a.localeCompare(b));
  const projCompLabels = projMonthly.map(([, v]) => v.label);
  const projCompIncome = projMonthly.map(([, v]) => v.income);
  const projCompExpenses = projMonthly.map(([, v]) => v.expenses);

  // Consolidated data
  const consKPIs = {
    income: kpis.totalIncome + projKPIs.income,
    expenses: kpis.totalExpenses + projKPIs.expenses,
  };
  const consCategorySpending: Record<string, number> = { ...categorySpending };
  Object.entries(projCategorySpending).forEach(([cat, val]) => {
    consCategorySpending[cat] = (consCategorySpending[cat] || 0) + val;
  });

  // Consolidated monthly comparison
  const consMonthlyMap: Record<string, { income: number; expenses: number }> = {};
  monthlyComparison.forEach((m) => {
    consMonthlyMap[m.label] = { income: m.income, expenses: m.expenses };
  });
  projMonthly.forEach(([key, val]) => {
    if (!consMonthlyMap[key]) consMonthlyMap[key] = { income: 0, expenses: 0 };
    consMonthlyMap[key].income += val.income;
    consMonthlyMap[key].expenses += val.expenses;
  });
  const consMonthly = Object.entries(consMonthlyMap).sort(([a], [b]) => a.localeCompare(b));
  const consCompLabels = consMonthly.map(([key]) => {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[m] || m}/${y.substring(2)}`;
  });
  const consCompIncome = consMonthly.map(([, v]) => v.income);
  const consCompExpenses = consMonthly.map(([, v]) => v.expenses);

  // Available projection months
  const projAvailableMonths = [...new Set(
    projections
      .filter((p) => !projYear || String(p.year) === projYear)
      .map((p) => p.month)
  )];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-surface dark:bg-slate-950 transition-colors">
        <Navbar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onImportFile={handleImportFile}
          onExportPDF={handleExportPDF}
          onLogout={handleLogout}
          isLoading={loading}
        />

        <main ref={mainRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          <div className="mb-4 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-[10px] sm:text-sm font-bold text-brand-600 uppercase tracking-widest mb-0.5 sm:mb-1">Visão Geral</h2>
              <h1 className="text-xl sm:text-3xl font-display font-extrabold">Seu Dashboard Financeiro</h1>
            </div>
            <StatusMessage message={status.message} type={status.type} />
          </div>

          {/* Tab Navigation */}
          <div className="mb-4 sm:mb-8 flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
            {(['real', 'projetado', 'consolidado'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab-button text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap snap-start ${tab === t ? 'active' : 'inactive'}`}
              >
                {t === 'real' && '📊 Dados Reais'}
                {t === 'projetado' && '🔮 Projeção'}
                {t === 'consolidado' && '📈 Consolidado'}
              </button>
            ))}
          </div>

          {/* Tab: Real */}
          {tab === 'real' && (
            <div className="animate-fade-in">
              <MonthFilter months={availableMonths} selected={selectedMonth} onSelect={setSelectedMonth} />
              <KPICards totalIncome={kpis.totalIncome} totalExpenses={kpis.totalExpenses} balance={kpis.balance} />
              <RecurringList items={recurring} />
              <BudgetGoals goals={goals} categorySpending={categorySpending} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
                <BalanceChart labels={balanceLabels} data={balanceData} />
                <ExpenseChart categories={categorySpending} />
              </div>

              <div className="mb-4 sm:mb-8">
                <ComparisonChart labels={compLabels} incomeData={compIncome} expensesData={compExpenses} />
              </div>

              <TransactionsTableFromAPI month={selectedMonth} />
            </div>
          )}

          {/* Tab: Projetado */}
          {tab === 'projetado' && (
            <div className="animate-fade-in">
              {projectionYears.length > 0 && (
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 sm:mb-2">Filtrar por Ano</label>
                    <select
                      value={projYear}
                      onChange={(e) => setProjYear(e.target.value)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    >
                      {projectionYears.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 sm:mb-2">Filtrar por Mês</label>
                    <select
                      value={projMonth}
                      onChange={(e) => setProjMonth(e.target.value)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    >
                      <option value="">Todos os Meses</option>
                      {projAvailableMonths.map((m) => {
                        const num = MONTH_NAME_TO_NUM[m.toLowerCase()];
                        return (
                          <option key={m} value={m}>{num ? MONTH_NAMES[num] : m}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              <KPICards
                totalIncome={projKPIs.income}
                totalExpenses={projKPIs.expenses}
                balance={projKPIs.income - projKPIs.expenses}
                labels={{ income: 'Receitas Previstas', expenses: 'Despesas Previstas', balance: 'Saldo Projetado' }}
                badge="Projetado"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
                <BalanceChart labels={projBalanceLabels} data={projBalanceData} title="Evolução Projetada do Saldo" />
                <ExpenseChart categories={projCategorySpending} title="Distribuição de Despesas Projetadas" />
              </div>

              <div className="mb-4 sm:mb-8">
                <ComparisonChart
                  labels={projCompLabels}
                  incomeData={projCompIncome}
                  expensesData={projCompExpenses}
                  title="Receitas vs. Despesas Projetadas"
                  incomeLabel="Receitas"
                  expensesLabel="Despesas"
                />
              </div>

              <ProjectionsTable projections={filteredProjections} />
            </div>
          )}

          {/* Tab: Consolidado */}
          {tab === 'consolidado' && (
            <div className="animate-fade-in">
              <KPICards
                totalIncome={consKPIs.income}
                totalExpenses={consKPIs.expenses}
                balance={consKPIs.income - consKPIs.expenses}
                labels={{ income: 'Receitas (Executado + Projetado)', expenses: 'Despesas (Executado + Projetado)', balance: 'Saldo Final Estimado' }}
                badge="Total"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
                <BalanceChart labels={consCompLabels} data={consCompIncome.map((inc, i) => inc - consCompExpenses[i])} title="Evolução Consolidada do Saldo" />
                <ExpenseChart categories={consCategorySpending} title="Distribuição de Despesas Consolidada" />
              </div>

              <ComparisonChart
                labels={consCompLabels}
                incomeData={consCompIncome}
                expensesData={consCompExpenses}
                title="Receitas vs. Despesas Consolidadas"
                incomeLabel="Receitas"
                expensesLabel="Despesas"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TransactionsTableFromAPI({ month }: { month: string }) {
  const [transactions, setTransactions] = useState<{
    id: string;
    date: string;
    description: string;
    category_name: string;
    credit: number;
    debit: number;
    balance: number;
  }[]>([]);

  useEffect(() => {
    const params: { month?: string; year?: string } = {};
    if (month !== 'all') {
      const [y, m] = month.split('-');
      params.year = y;
      params.month = m;
    }
    api.transactions.list(params).then(setTransactions).catch(() => {});
  }, [month]);

  return <TransactionsTable transactions={transactions} />;
}
