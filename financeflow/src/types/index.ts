export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category_id: string | null;
  category_name: string;
  credit: number;
  debit: number;
  balance: number;
  is_recurring: boolean;
  import_batch: string | null;
  created_at: string;
}

export interface ProjectedTransaction {
  id: string;
  user_id: string;
  date: string;
  year: number;
  month: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  projected_balance: number;
  import_batch: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  is_system: boolean;
  created_at: string;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  category_name: string;
  monthly_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  category_name: string;
  average_amount: number;
  frequency: number;
  last_detected_at: string;
  created_at: string;
}

export interface ImportHistory {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  records_imported: number;
  projections_imported: number;
  batch_id: string;
  created_at: string;
}

export interface DashboardKPIs {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyComparison {
  label: string;
  income: number;
  expenses: number;
}

export interface BalancePoint {
  date: string;
  balance: number;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
  category_name: string;
}

export interface ParsedProjection {
  date: string;
  year: number;
  month: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  projected_balance: number;
}

export type TabType = 'real' | 'projetado' | 'consolidado';
export type ThemeMode = 'light' | 'dark';
