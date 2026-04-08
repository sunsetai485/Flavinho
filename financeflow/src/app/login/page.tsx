'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { mapAuthErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const emailNorm = email.trim().toLowerCase();

    const supabase = getSupabaseBrowser();

    try {
      if (isSignUp) {
        const { data, error: signErr } = await supabase.auth.signUp({
          email: emailNorm,
          password,
        });
        if (signErr) throw signErr;
        if (data.session) {
          window.location.assign('/');
          return;
        }
        setMessage(
          'Conta criada. Se o projeto exige confirmação de e-mail, abra o link enviado ou desative em Supabase → Authentication → Providers → Email → Confirm email.'
        );
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: emailNorm,
          password,
        });
        if (signInErr) throw signInErr;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError(
            'Login não gerou sessão. Confirme o e-mail do usuário em Authentication → Users ou desative "Confirm email" para testes.'
          );
          return;
        }
        window.location.assign('/');
      }
    } catch (err: unknown) {
      const raw = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Erro desconhecido';
      setError(mapAuthErrorMessage(raw));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 px-4 py-8 safe-area-inset">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 shadow-lg shadow-brand-600/30">
            F
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Finance<span className="text-brand-600">Flow</span>
            <span className="text-[10px] sm:text-xs font-medium bg-slate-100 dark:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 ml-1.5 sm:ml-2">PRO</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 text-xs sm:text-sm">Gestão financeira inteligente</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg sm:text-xl font-display font-bold mb-4 sm:mb-6">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-rose-100 dark:border-rose-800">{error}</div>
            )}

            {message && (
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
