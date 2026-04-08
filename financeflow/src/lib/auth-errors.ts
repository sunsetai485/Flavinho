/** Mensagens mais claras para erros comuns do Auth (Supabase). */
export function mapAuthErrorMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) {
    return 'Confirme seu e-mail antes de entrar. No Supabase: Authentication → Providers → Email → desative "Confirm email" para testes, ou confirme o usuário em Users.';
  }
  if (m.includes('user already registered') || m.includes('already registered')) {
    return 'Este e-mail já está cadastrado. Use "Entrar" em vez de criar conta.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'Falha de rede. Verifique a URL do Supabase e se o projeto está ativo.';
  }
  if (m.includes('jwt') || m.includes('invalid api key')) {
    return 'Chave da API inválida. Confira NEXT_PUBLIC_SUPABASE_ANON_KEY no build/deploy.';
  }

  return raw;
}
