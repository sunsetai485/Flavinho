// Encaminha o e-mail informado pelo comprador (dificuldade de acesso à compra) ao webhook n8n.
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_WEBHOOK =
  'https://n8n-webhook.i2pq5v.easypanel.host/webhook/24b86052-2278-4833-9186-360fb53192a6';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'JSON inválido.' }, { status: 400 });
  }

  const email =
    typeof body === 'object' && body !== null && 'email' in body && typeof (body as { email: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : '';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ success: false, message: 'Informe um e-mail válido.' }, { status: 400 });
  }

  const url = (process.env.PILOTO_LEAD_WEBHOOK_URL || DEFAULT_WEBHOOK).trim();
  if (!url.startsWith('https://')) {
    return NextResponse.json({ success: false, message: 'Webhook não configurado.' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const text = await res.text();
    let payload: Record<string, unknown> = {};
    if (text) {
      try {
        payload = JSON.parse(text) as Record<string, unknown>;
      } catch {
        payload = { message: text };
      }
    }

    if (!res.ok) {
      const message =
        typeof payload.message === 'string'
          ? payload.message
          : typeof payload.error === 'string'
            ? payload.error
            : `Falha ao registrar (${res.status})`;
      return NextResponse.json({ success: false, message, ...payload }, { status: res.status });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Não foi possível conectar. Tente novamente em instantes.' },
      { status: 502 }
    );
  }
}
