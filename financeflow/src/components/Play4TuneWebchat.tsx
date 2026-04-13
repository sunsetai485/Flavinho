'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const API_ORIGIN =
  process.env.NEXT_PUBLIC_PLAY4TUNE_API_ORIGIN ?? 'https://api.play4tune.sunsetai.com.br';
const WIDGET_ID =
  process.env.NEXT_PUBLIC_WEBCHAT_WIDGET_ID ?? '31a5796b-bb3e-4677-bac1-b6c919eda968';

const STORAGE_KEY = 'play4tune_webchat_session_v1';
const POLL_MS = 3500;

type SessionPayload = {
  visitor_token: string;
  conversation_id: string;
};

type ApiMessage = {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
};

function loadSession(): SessionPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SessionPayload;
    if (p?.visitor_token && p?.conversation_id) return p;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(s: SessionPayload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function Play4TuneWebchat() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const api = useCallback(
    async (path: string, init?: RequestInit & { token?: string }) => {
      const { token, ...rest } = init ?? {};
      const headers = new Headers(rest.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (!headers.has('Content-Type') && rest.body) headers.set('Content-Type', 'application/json');
      const res = await fetch(`${API_ORIGIN}/api/v1${path}`, { ...rest, headers });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: unknown;
      };
      if (!res.ok) {
        const err = new Error(json.error ?? res.statusText ?? 'Erro na API') as Error & {
          status: number;
        };
        err.status = res.status;
        throw err;
      }
      if (json.success === false) {
        throw new Error(json.error ?? 'Erro na API');
      }
      return json.data;
    },
    []
  );

  const ensureSession = useCallback(async (): Promise<SessionPayload> => {
    const cached = loadSession();
    if (cached) {
      setSession(cached);
      return cached;
    }
    setBusy(true);
    setError(null);
    try {
      const data = (await api('/webchat/session', {
        method: 'POST',
        body: JSON.stringify({
          widget_id: WIDGET_ID,
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      })) as SessionPayload;
      saveSession(data);
      setSession(data);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao iniciar chat';
      setError(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [api]);

  const fetchMessages = useCallback(
    async (s: SessionPayload) => {
      try {
        const data = (await api(`/webchat/conversations/${s.conversation_id}/messages`, {
          token: s.visitor_token,
        })) as ApiMessage[];
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          setMessages(sorted);
        }
      } catch (e) {
        const st = typeof e === 'object' && e && 'status' in e ? (e as { status: number }).status : 0;
        if (st === 401 || st === 403) {
          clearSession();
          setSession(null);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    const s = loadSession();
    if (s) setSession(s);
  }, []);

  useEffect(() => {
    if (!open) return;
    let s = session;
    let cancelled = false;

    (async () => {
      try {
        if (!s) s = await ensureSession();
        if (cancelled || !s) return;
        await fetchMessages(s);
      } catch {
        /* ensureSession já definiu error */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, session, ensureSession, fetchMessages]);

  useEffect(() => {
    if (!open || !session) return;
    const id = window.setInterval(() => {
      fetchMessages(session);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [open, session, fetchMessages]);

  useEffect(() => {
    if (!listRef.current || !open) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      let s = session ?? loadSession();
      if (!s) s = await ensureSession();
      await api('/webchat/messages', {
        method: 'POST',
        token: s.visitor_token,
        body: JSON.stringify({ content: text }),
      });
      setInput('');
      await fetchMessages(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 font-sans text-sm">
      {open && (
        <div
          className="flex w-[min(100vw-2rem,380px)] max-h-[min(70vh,520px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
          role="dialog"
          aria-label="Chat"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-brand-600 px-4 py-3 text-white dark:border-slate-600">
            <span className="font-semibold">Suporte</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/10"
              aria-label="Fechar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {error && (
            <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 text-xs dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
              {error}
            </div>
          )}
          <div
            ref={listRef}
            className="min-h-[200px] flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950/50"
          >
            {messages.length === 0 && !busy && (
              <p className="text-center text-slate-500 text-xs dark:text-slate-400">
                Digite uma mensagem para falar com o time.
              </p>
            )}
            {messages.map((m) => {
              const mine = m.direction === 'inbound';
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      mine
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSend} className="border-t border-slate-200 p-2 dark:border-slate-600">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Sua mensagem…"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                disabled={busy}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
        aria-expanded={open}
        aria-label={open ? 'Fechar chat' : 'Abrir chat'}
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
