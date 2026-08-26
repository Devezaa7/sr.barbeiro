export interface DadosConfirmacaoWhatsApp {
  readonly telefone: string | null | undefined;
  readonly nome: string | null | undefined;
  readonly data: string | null | undefined;
  readonly hora: string | null | undefined;
}

function normalizarTelefone(telefone: string) {
  const apenasNumeros = telefone.replace(/\D/g, "");

  // Números brasileiros locais com 10 ou 11 dígitos recebem o código +55.
  if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
    return `55${apenasNumeros}`;
  }

  // Se o cliente já informou o código do país, preservamos os dígitos.
  return apenasNumeros;
}

function formatarData(data: string) {
  const partes = data.split("-");
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return data;
}

/**
 * Abre o WhatsApp com uma mensagem pré-preenchida.
 *
 * Isso não envia automaticamente: o usuário ainda precisa clicar em Enviar
 * dentro do WhatsApp. A confirmação do agendamento deve ser salva antes desta
 * função ser chamada.
 */
export function abrirWhatsAppConfirmacao({
  telefone,
  nome,
  data,
  hora,
}: DadosConfirmacaoWhatsApp): boolean {
  const numero = normalizarTelefone(telefone ?? "");
  if (!numero || numero.length < 12) {
    return false;
  }

  const saudacao = nome?.trim() ? `Olá, ${nome.trim()}!` : "Olá!";
  const dataTexto = data ? formatarData(data) : "data combinada";
  const horaTexto = hora || "horário combinado";
  const mensagem = `${saudacao} Seu agendamento na Sr. Barbeiro foi confirmado para ${dataTexto} às ${horaTexto}. Até lá!`;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  const janela = window.open(url, "_blank", "noopener,noreferrer");
  if (janela) {
    janela.opener = null;
    return true;
  }

  // Fallback se o navegador bloquear a nova aba.
  window.location.assign(url);
  return true;
}
