import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceFlow Pro | Dashboard de Gestão Financeira',
  description: 'Sistema financeiro com projeções, metas de orçamento e análise inteligente de gastos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen pb-12 antialiased">
        {children}
      </body>
    </html>
  );
}
