import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piloto ai | Acesso à compra',
  description:
    'Informe o e-mail da sua compra se estiver com dificuldade para acessar. Nossa equipe ajuda a recuperar o acesso.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen min-h-[100dvh] antialiased">
        {children}
      </body>
    </html>
  );
}
