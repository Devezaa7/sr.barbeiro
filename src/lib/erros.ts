import { z } from "zod";

/**
 * Converte qualquer falha (validação, rede, banco) em uma mensagem curta e
 * compreensível para o cliente final — sem expor detalhes técnicos.
 */
export function mensagemAmigavel(erro: unknown, padrao = "Não foi possível concluir agora."): string {
  if (erro instanceof z.ZodError) {
    return erro.issues[0]?.message ?? "Verifique os dados informados.";
  }

  const bruta = erro instanceof Error ? erro.message : typeof erro === "string" ? erro : "";
  const texto = bruta.toLowerCase();

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Você parece estar sem internet. Verifique a conexão e tente novamente.";
  }
  if (
    texto.includes("failed to fetch") ||
    texto.includes("networkerror") ||
    texto.includes("network request failed") ||
    texto.includes("load failed") ||
    texto.includes("timeout")
  ) {
    return "Não conseguimos falar com o servidor. Verifique sua conexão e tente novamente.";
  }
  if (texto.includes("23p01") || texto.includes("exclusion")) {
    return "Esse horário acabou de ser reservado. Escolha outro, por favor.";
  }
  if (
    texto.includes("row-level security") ||
    texto.includes("permission denied") ||
    texto.includes("jwt") ||
    texto.includes("401")
  ) {
    return "Sua sessão expirou ou você não tem permissão para esta ação. Entre novamente.";
  }
  if (texto.includes("check constraint") || texto.includes("violates")) {
    return "Alguns dados não são válidos. Revise as informações e tente de novo.";
  }
  if (texto.includes("503") || texto.includes("502") || texto.includes("unavailable")) {
    return "O servidor está temporariamente indisponível. Tente novamente em instantes.";
  }

  return padrao;
}
