import { supabase } from './supabase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  dashboard: {
    get: (params?: { month?: string; year?: string }) => {
      const qs = new URLSearchParams();
      if (params?.month) qs.set('month', params.month);
      if (params?.year) qs.set('year', params.year);
      const query = qs.toString();
      return apiRequest<DashboardData>(`/api/dashboard${query ? `?${query}` : ''}`);
    },
  },

  transactions: {
    list: (params?: { month?: string; year?: string }) => {
      const qs = new URLSearchParams();
      if (params?.month) qs.set('month', params.month);
      if (params?.year) qs.set('year', params.year);
      const query = qs.toString();
      return apiRequest<TransactionRow[]>(`/api/transactions${query ? `?${query}` : ''}`);
    },
    delete: (id: string) => apiRequest(`/api/transactions?id=${id}`, { method: 'DELETE' }),
    deleteBatch: (batch: string) => apiRequest(`/api/transactions?batch=${batch}`, { method: 'DELETE' }),
  },

  projections: {
    list: (params?: { year?: string; month?: string }) => {
      const qs = new URLSearchParams();
      if (params?.year) qs.set('year', params.year);
      if (params?.month) qs.set('month', params.month);
      const query = qs.toString();
      return apiRequest<ProjectionRow[]>(`/api/projections${query ? `?${query}` : ''}`);
    },
    delete: (id: string) => apiRequest(`/api/projections?id=${id}`, { method: 'DELETE' }),
  },

  budgetGoals: {
    list: () => apiRequest<BudgetGoalRow[]>('/api/budget-goals'),
    save: (body: { category_name: string; monthly_limit: number }) =>
      apiRequest<BudgetGoalRow>('/api/budget-goals', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => apiRequest(`/api/budget-goals?id=${id}`, { method: 'DELETE' }),
  },

  import: {
    upload: (body: {
      realData?: unknown[][];
      projectionData?: unknown[][];
      filename: string;
      fileType: string;
    }) => apiRequest<ImportResult>('/api/import', { method: 'POST', body: JSON.stringify(body) }),
  },
};

interface TransactionRow {
  id: string;
  date: string;
  description: string;
  category_name: string;
  credit: number;
  debit: number;
  balance: number;
  import_batch: string | null;
}

interface ProjectionRow {
  id: string;
  date: string;
  year: number;
  month: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  projected_balance: number;
}

interface BudgetGoalRow {
  id: string;
  category_name: string;
  monthly_limit: number;
  is_active: boolean;
}

interface DashboardData {
  kpis: { totalIncome: number; totalExpenses: number; balance: number };
  categoryBreakdown: { category: string; amount: number; color: string }[];
  monthlyComparison: { label: string; income: number; expenses: number }[];
  balancePoints: { date: string; balance: number }[];
  availableMonths: string[];
  recurring: { description: string; category: string; amount: number; frequency: number }[];
  goals: BudgetGoalRow[];
  categorySpending: Record<string, number>;
  projections: ProjectionRow[];
  projectionYears: number[];
}

interface ImportResult {
  success: boolean;
  batchId: string;
  recordsImported: number;
  projectionsImported: number;
}

export type { TransactionRow, ProjectionRow, BudgetGoalRow, DashboardData, ImportResult };
