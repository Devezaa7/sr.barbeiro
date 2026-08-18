/**
 * O login social gerenciado usa o broker OAuth da plataforma de hospedagem,
 * exposto no path `/~oauth/initiate` do próprio domínio. Esse path é servido
 * apenas pelos domínios da plataforma (preview e `*.lovable.app`) e pelo
 * ambiente local; em qualquer outro host (ex.: deploy na Vercel) a chamada
 * resulta em 404.
 *
 * Por isso o botão de Google só é oferecido onde o broker realmente existe.
 * Nos demais domínios o acesso continua disponível por e-mail e senha.
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