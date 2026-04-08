import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';
import { CATEGORY_COLORS } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  let query = auth.supabase
    .from('transactions')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('date', { ascending: true });

  if (month && year) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (year) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const [transResult, goalsResult, projResult] = await Promise.all([
    query,
    auth.supabase.from('budget_goals').select('*').eq('user_id', auth.user.id).eq('is_active', true),
    auth.supabase.from('projected_transactions').select('*').eq('user_id', auth.user.id).order('date'),
  ]);

  if (transResult.error) {
    return NextResponse.json({ error: transResult.error.message }, { status: 500 });
  }

  const transactions = transResult.data || [];
  const goals = goalsResult.data || [];
  const projections = projResult.data || [];

  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpending: Record<string, number> = {};
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  const balancePoints: { date: string; balance: number }[] = [];

  transactions.forEach((t) => {
    const credit = Number(t.credit) || 0;
    const debit = Number(t.debit) || 0;
    totalIncome += credit;
    totalExpenses += debit;

    if (debit > 0 && t.category_name) {
      categorySpending[t.category_name] = (categorySpending[t.category_name] || 0) + debit;
    }

    const monthKey = t.date.substring(0, 7);
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expenses: 0 };
    monthlyData[monthKey].income += credit;
    monthlyData[monthKey].expenses += debit;

    balancePoints.push({ date: t.date, balance: Number(t.balance) || 0 });
  });

  const availableMonths = [...new Set(transactions.map((t) => t.date.substring(0, 7)))].sort();

  const categoryBreakdown = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category] || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyComparison = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({ label: key, income: val.income, expenses: val.expenses }));

  // Detect recurring transactions
  const months = [...new Set(transactions.map((t) => t.date.substring(0, 7)))];
  const recurring: { description: string; category: string; amount: number; frequency: number }[] = [];

  if (months.length >= 2) {
    const groups: Record<string, { transactions: typeof transactions; desc: string; cat: string }> = {};
    transactions.filter((t) => Number(t.debit) > 0).forEach((t) => {
      const key = `${t.description}_${t.category_name}`;
      if (!groups[key]) groups[key] = { transactions: [], desc: t.description, cat: t.category_name };
      groups[key].transactions.push(t);
    });

    Object.values(groups).forEach((group) => {
      if (group.transactions.length >= months.length * 0.7) {
        const amounts = group.transactions.map((t) => Number(t.debit));
        const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stddev = Math.sqrt(amounts.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / amounts.length);
        if (stddev / avg < 0.15) {
          recurring.push({
            description: group.desc,
            category: group.cat,
            amount: avg,
            frequency: group.transactions.length,
          });
        }
      }
    });
    recurring.sort((a, b) => b.amount - a.amount);
  }

  const projectionYears = [...new Set(projections.map((p) => p.year))].sort();

  return NextResponse.json({
    kpis: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses },
    categoryBreakdown,
    monthlyComparison,
    balancePoints,
    availableMonths,
    recurring,
    goals,
    categorySpending,
    projections,
    projectionYears,
  });
}
