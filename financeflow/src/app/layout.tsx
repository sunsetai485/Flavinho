import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piloto ai | Cadastro interno — problema de login',
  description:
    'Ferramenta interna para a equipe de suporte registrar o e-mail de usuários que não conseguem fazer login.',
  robots: { index: false, follow: false },
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
