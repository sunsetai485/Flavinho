'use client';

import { useState, FormEvent } from 'react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function getMessage(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  return null;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    setFeedback(null);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (res.ok) {
        const explicitFail =
          data.success === false ||
          data.success === 'false' ||
          data.ok === false ||
          (typeof data.error === 'string' && data.error.length > 0);

        if (!explicitFail) {
          setState('success');
          setFeedback(getMessage(data) || 'Registro enviado ao fluxo com sucesso.');
          setEmail('');
          return;
        }
      }

      setState('error');
      setFeedback(getMessage(data) || 'Não foi possível registrar. Tente novamente.');
    } catch {
      setState('error');
      setFeedback('Erro de rede. Verifique a conexão e tente de novo.');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 safe-area-inset">
      <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-center">
        <p className="text-[11px] sm:text-xs font-medium text-amber-200/95">
          Uso interno · exclusivo da equipe de suporte Piloto ai
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400 mb-3">Piloto ai · suporte</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Cadastro de e-mail do usuário
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed text-left">
            Ferramenta para a equipe registrar o <span className="text-slate-300">e-mail da conta</span> de quem não está
            conseguindo fazer login. O envio segue para o fluxo automatizado (n8n).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
                E-mail do usuário (conta com problema de login)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === 'loading'}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-60"
                placeholder="usuario@exemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'loading' ? 'Enviando…' : 'Registrar e enviar ao fluxo'}
            </button>
          </form>

          {feedback && (
            <div
              role="status"
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                state === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/40 text-rose-100'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      <footer className="pb-8 pt-4 text-center text-[11px] text-slate-600">
        Piloto ai · ferramenta interna · não compartilhar com clientes finais
      </footer>
    </div>
  );
}
