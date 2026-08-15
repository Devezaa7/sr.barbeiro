import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number | null;
  ativo: boolean;
  ordem: number;
}

export interface Barbeiro {
  id: string;
  nome: string;
  especialidades: string | null;
  foto_url: string | null;
  ativo: boolean;
  profile_id: string | null;
}

export interface Avaliacao {
  id: string;
  nome_exibicao: string | null;
  nota: number;
  comentario: string | null;
}

/** Lança em caso de erro para que o React Query trate via errorComponent/isError. */
function garantir<T>(resultado: { data: T | null; error: { message: string } | null }): T {
  if (resultado.error) throw new Error(resultado.error.message);
  if (resultado.data === null) throw new Error("Nenhum dado retornado pelo servidor.");
  return resultado.data;
}

export const servicosQuery = queryOptions({
  queryKey: ["servicos"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<Servico[]> =>
    garantir(
      await supabase
        .from("servicos")
        .select("id, nome, descricao, duracao_minutos, preco, ativo, ordem")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
    ) as Servico[],
});

export const barbeirosQuery = queryOptions({
  queryKey: ["barbeiros"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<Barbeiro[]> =>
    garantir(
      await supabase
        .from("barbeiros")
        .select("id, nome, especialidades, foto_url, ativo, profile_id")
        .eq("ativo", true)
        .order("nome", { ascending: true }),
    ) as Barbeiro[],
});

export const avaliacoesQuery = queryOptions({
  queryKey: ["avaliacoes"],
  staleTime: 10 * 60 * 1000,
  queryFn: async (): Promise<Avaliacao[]> =>
    garantir(
      await supabase
        .from("avaliacoes")
        .select("id, nome_exibicao, nota, comentario")
        .eq("publicada", true)
        .order("created_at", { ascending: true }),
    ) as Avaliacao[],
});

/**
 * Agenda de um barbeiro em uma data: janelas de expediente, bloqueios e
 * agendamentos já ocupados. Usada para calcular os horários livres.
 */
export function agendaDoDiaQuery(barbeiroId: string | null, dataISO: string | null) {
  return queryOptions({
    queryKey: ["agenda-dia", barbeiroId, dataISO],
    enabled: Boolean(barbeiroId && dataISO),
    staleTime: 30 * 1000,
    queryFn: async () => {
      if (!barbeiroId || !dataISO) throw new Error("Selecione barbeiro e data.");
      const diaSemana = new Date(`${dataISO}T12:00:00`).getDay();

      const [janelas, ocupados] = await Promise.all([
        supabase
          .from("horarios_disponibilidade")
          .select("hora_inicio, hora_fim")
          .eq("barbeiro_id", barbeiroId)
          .eq("dia_semana", diaSemana),
        // RPC para que visitantes sem login também vejam os horários ocupados,
        // sem expor nome ou telefone de outros clientes.
        supabase.rpc("horarios_ocupados", { _barbeiro_id: barbeiroId, _data: dataISO }),
      ]);

      return {
        janelas: garantir(janelas),
        ocupados: garantir(ocupados),
      };
    },
  });
}