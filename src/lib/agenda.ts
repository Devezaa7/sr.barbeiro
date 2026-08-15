/**
 * Regras de agenda no fuso de Brasília.
 *
 * Toda a matemática de horários é feita em minutos desde a meia-noite para
 * evitar armadilhas de timezone: as colunas do banco são DATE e TIME puros,
 * ou seja, sem deslocamento. Só a "data de hoje" precisa considerar o fuso.
 */

export const FUSO_BRASILIA = "America/Sao_Paulo";
export const PASSO_SLOT_MINUTOS = 15;

export interface JanelaHorario {
  readonly hora_inicio: string;
  readonly hora_fim: string;
}

export interface IntervaloOcupado extends JanelaHorario {}

/** "14:30:00" | "14:30" -> 870 */
export function horaParaMinutos(hora: string): number {
  const [h = "0", m = "0"] = hora.split(":");
  return Number(h) * 60 + Number(m);
}

/** 870 -> "14:30" */
export function minutosParaHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Data no formato ISO (yyyy-mm-dd) usando o calendário local da data informada. */
export function paraDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** "2026-08-15" -> "15/08/2026" */
export function formatarDataBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

/** Remove segundos de um TIME do banco: "14:30:00" -> "14:30" */
export function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}

/** Agora (minutos desde a meia-noite) no fuso de Brasília. */
export function minutosAgoraBrasilia(): number {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BRASILIA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return horaParaMinutos(partes.replace("24:", "00:"));
}

/** Data de hoje (ISO) no fuso de Brasília. */
export function hojeISOBrasilia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_BRASILIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface CalcularSlotsParams {
  /** Janelas de expediente do barbeiro naquele dia da semana. */
  readonly janelas: readonly JanelaHorario[];
  /** Bloqueios e agendamentos ativos que já ocupam a agenda. */
  readonly ocupados: readonly IntervaloOcupado[];
  /** Duração do serviço escolhido, em minutos. */
  readonly duracaoMinutos: number;
  /** Data alvo em ISO, para descartar horários já passados. */
  readonly dataISO: string;
}

/**
 * Retorna os horários de início livres, garantindo que o serviço inteiro
 * caiba na janela de expediente e não invada nenhum intervalo ocupado.
 */
export function calcularSlotsDisponiveis({
  janelas,
  ocupados,
  duracaoMinutos,
  dataISO,
}: CalcularSlotsParams): string[] {
  if (duracaoMinutos <= 0 || janelas.length === 0) return [];

  const hoje = hojeISOBrasilia();
  if (dataISO < hoje) return [];
  // Margem de 30 min para o cliente conseguir chegar.
  const minimoHoje = dataISO === hoje ? minutosAgoraBrasilia() + 30 : -1;

  const ocupadosMin = ocupados.map((o) => ({
    inicio: horaParaMinutos(o.hora_inicio),
    fim: horaParaMinutos(o.hora_fim),
  }));

  const slots: string[] = [];
  for (const janela of janelas) {
    const abertura = horaParaMinutos(janela.hora_inicio);
    const fechamento = horaParaMinutos(janela.hora_fim);

    for (let inicio = abertura; inicio + duracaoMinutos <= fechamento; inicio += PASSO_SLOT_MINUTOS) {
      if (inicio < minimoHoje) continue;
      const fim = inicio + duracaoMinutos;
      const conflita = ocupadosMin.some((o) => inicio < o.fim && fim > o.inicio);
      if (!conflita) slots.push(minutosParaHora(inicio));
    }
  }

  return [...new Set(slots)].sort();
}

export const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não compareceu",
};