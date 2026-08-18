/**
 * Existem dois caminhos possíveis para o login com Google:
 *
 * 1. Broker OAuth gerenciado pela hospedagem, exposto em `/~oauth/initiate` do
 *    próprio domínio. Esse path só existe no preview e em `*.lovable.app`; em
 *    qualquer outro host (ex.: Vercel) ele retorna 404.
 * 2. Fluxo oficial do Supabase Auth (`supabase.auth.signInWithOAuth`), que
 *    redireciona para o endpoint `/auth/v1/authorize` do próprio backend e
 *    depende apenas do provedor Google habilitado lá.
 *
 * Esta função decide qual caminho usar: o broker onde ele realmente existe, o
 * fluxo do Supabase em todos os outros domínios.
 */
export function brokerOAuthDisponivel(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com")
  );
}