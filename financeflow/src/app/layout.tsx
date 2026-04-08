import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceFlow Pro | Dashboard de Gestão Financeira',
  description: 'Sistema financeiro com projeções, metas de orçamento e análise inteligente de gastos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0074ca" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen min-h-[100dvh] pb-8 sm:pb-12 antialiased">
        {children}
      </body>
    </html>
  );
}
