'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { CATEGORY_COLORS } from '@/lib/utils';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler, ChartDataLabels
);
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#94a3b8';

const currencyCallback = (v: string | number) =>
  'R$ ' + Number(v).toLocaleString('pt-BR');

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

interface BalanceChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export function BalanceChart({ labels, data, title = 'Evolução do Saldo' }: BalanceChartProps) {
  const isMobile = useIsMobile();

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: 'Saldo',
      data,
      borderColor: '#0c91eb',
      backgroundColor: 'rgba(12, 145, 235, 0.1)',
      borderWidth: isMobile ? 2 : 3,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: isMobile ? 4 : 6,
      pointHoverBackgroundColor: '#0c91eb',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    }],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
      datalabels: { display: false },
    },
    scales: {
      y: {
        grid: { display: false },
        ticks: {
          callback: currencyCallback,
          maxTicksLimit: isMobile ? 4 : 6,
          font: { size: isMobile ? 9 : 12 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: isMobile ? 5 : 10,
          font: { size: isMobile ? 9 : 12 },
        },
      },
    },
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-display font-bold">{title}</h3>
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal</div>
      </div>
      <div className="relative h-[200px] sm:h-[300px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

interface ExpenseChartProps {
  categories: Record<string, number>;
  title?: string;
}

export function ExpenseChart({ categories, title = 'Distribuição de Gastos' }: ExpenseChartProps) {
  const isMobile = useIsMobile();
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  const colors = labels.map((l) => CATEGORY_COLORS[l] || '#cbd5e1');
  const total = data.reduce((a, b) => a + b, 0);

  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobile ? '65%' : '75%',
    plugins: {
      datalabels: {
        display: !isMobile,
        color: '#ffffff',
        font: { weight: 'bold' as const, size: 12 },
        formatter: (value: number) => `${((value / total) * 100).toFixed(1)}%`,
        anchor: 'center' as const,
        align: 'center' as const,
      },
      legend: {
        position: isMobile ? 'bottom' as const : 'right' as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 8 : 20,
          font: { size: isMobile ? 10 : 11, weight: 'bold' as const },
          boxWidth: isMobile ? 8 : 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (c) => ` R$ ${Number(c.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-display font-bold">{title}</h3>
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categorias</div>
      </div>
      <div className="relative h-[240px] sm:h-[300px] w-full">
        {data.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem dados</div>
        )}
      </div>
    </div>
  );
}

interface ComparisonChartProps {
  labels: string[];
  incomeData: number[];
  expensesData: number[];
  title?: string;
  incomeLabel?: string;
  expensesLabel?: string;
}

export function ComparisonChart({
  labels, incomeData, expensesData,
  title = 'Entradas vs. Saídas',
  incomeLabel = 'Entradas',
  expensesLabel = 'Saídas',
}: ComparisonChartProps) {
  const isMobile = useIsMobile();

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: incomeLabel,
        data: incomeData,
        backgroundColor: '#10b981',
        borderRadius: isMobile ? 4 : 8,
        borderSkipped: false,
        barThickness: 'flex' as unknown as number,
        maxBarThickness: isMobile ? 24 : 50,
      },
      {
        label: expensesLabel,
        data: expensesData,
        backgroundColor: '#ef4444',
        borderRadius: isMobile ? 4 : 8,
        borderSkipped: false,
        barThickness: 'flex' as unknown as number,
        maxBarThickness: isMobile ? 24 : 50,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 8 : 15,
          font: { size: isMobile ? 10 : 12, weight: 'bold' as const },
          boxWidth: isMobile ? 8 : 12,
        },
      },
      tooltip: { callbacks: { label: (c) => ` R$ ${Number(c.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } },
      datalabels: { display: false },
    },
    scales: {
      y: {
        grid: { display: false },
        ticks: {
          callback: currencyCallback,
          maxTicksLimit: isMobile ? 4 : 6,
          font: { size: isMobile ? 9 : 12 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: isMobile ? 6 : 12,
          font: { size: isMobile ? 9 : 12 },
        },
      },
    },
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-display font-bold">{title}</h3>
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparativo</div>
      </div>
      <div className="relative h-[240px] sm:h-[350px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
