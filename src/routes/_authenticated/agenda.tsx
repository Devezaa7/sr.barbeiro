import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, formatarDataBR, formatarHora, hojeISOBrasilia } from "@/lib/agenda";
import { mensagemAmigavel } from "@/lib/erros";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Minha agenda | Sr. Barbeiro" },
      { name: "description", content: "Agenda do barbeiro: atendimentos do dia e bloqueios." },
      { property: "og:title", content: "Minha agenda | Sr. Barbeiro" },
      { property: "og:description", content: "Atendimentos atribuídos e bloqueios de horário." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgendaBarbeiro,
});

interface Atendimento {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  cliente_nome: string;
  cliente_telefone: string;
  servicos: { nome: string } | null;
}

function AgendaBarbeiro() {
  const { user } = useSessao();
  const queryClient = useQueryClient();
  const [dataBloqueio, setDataBloqueio] = useState(hojeISOBrasilia());
  const [inicioBloqueio, setInicioBloqueio] = useState("12:00");
  const [fimBloqueio, setFimBloqueio] = useState("13:00");
  const [motivo, setMotivo] = useState("");

  const { data: barbeiro } = useQuery({
    queryKey: ["meu-barbeiro", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbeiros")
        .select("id, nome")
        .eq("profile_id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: atendimentos, isLoading } = useQuery({
    queryKey: ["agenda-barbeiro", barbeiro?.id],
    enabled: Boolean(barbeiro?.id),
    queryFn: async (): Promise<Atendimento[]> => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(
          "id, data, hora_inicio, hora_fim, status, cliente_nome, cliente_telefone, servicos(nome)",
        )
        .eq("barbeiro_id", barbeiro!.id)
        .gte("data", hojeISOBrasilia())
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Atendimento[];
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Status atualizado.");
      void queryClient.invalidateQueries({ queryKey: ["agenda-barbeiro"] });
    },
    onError: (erro: unknown) =>
      toast.error(mensagemAmigavel(erro, "Não foi possível atualizar o status.")),
  });

  const criarBloqueio = useMutation({
    mutationFn: async () => {
      if (!barbeiro?.id) throw new Error("Cadastro de barbeiro não encontrado.");
      if (fimBloqueio <= inicioBloqueio) throw new Error("O fim deve ser depois do início.");
      const { error } = await supabase.from("bloqueios").insert({
        barbeiro_id: barbeiro.id,
        data: dataBloqueio,
        hora_inicio: inicioBloqueio,
        hora_fim: fimBloqueio,
        motivo: motivo.trim().slice(0, 120) || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Horário bloqueado.");
      setMotivo("");
      void queryClient.invalidateQueries({ queryKey: ["agenda-dia"] });
    },
    onError: (erro: unknown) => toast.error(mensagemAmigavel(erro, "Não foi possível bloquear.")),
  });

  if (!barbeiro) {
    return (
      <LayoutPainel titulo="Minha agenda" descricao="Área do barbeiro">
        <p className="text-sm text-muted-foreground">
          Seu login ainda não está vinculado a um cadastro de barbeiro. Peça ao administrador para
          fazer o vínculo no painel.
        </p>
      </LayoutPainel>
    );
  }

  return (
    <LayoutPainel
      titulo="Minha agenda"
      descricao={`${barbeiro.nome} · atendimentos de hoje em diante`}
    >
      {isLoading && <Skeleton className="h-32 w-full" />}

      <ul className="grid gap-3">
        {atendimentos?.map((item) => (
          <li
            key={item.id}
            className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-display text-base uppercase">
                {formatarDataBR(item.data)} · {formatarHora(item.hora_inicio)}–
                {formatarHora(item.hora_fim)}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.servicos?.nome} · {item.cliente_nome} · {item.cliente_telefone}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{STATUS_LABEL[item.status] ?? item.status}</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => atualizarStatus.mutate({ id: item.id, status: "concluido" })}
              >
                Concluído
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => atualizarStatus.mutate({ id: item.id, status: "nao_compareceu" })}
              >
                Não compareceu
              </Button>
            </div>
          </li>
        ))}
        {atendimentos?.length === 0 && !isLoading && (
          <li className="text-sm text-muted-foreground">Nenhum atendimento agendado.</li>
        )}
      </ul>

      <section className="surface-panel mt-12 p-6">
        <h2 className="text-eyebrow">Bloquear horário</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(evento) => {
            evento.preventDefault();
            criarBloqueio.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="bloqueio-data">Data</Label>
            <Input
              id="bloqueio-data"
              type="date"
              value={dataBloqueio}
              onChange={(evento) => setDataBloqueio(evento.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bloqueio-inicio">Início</Label>
            <Input
              id="bloqueio-inicio"
              type="time"
              value={inicioBloqueio}
              onChange={(evento) => setInicioBloqueio(evento.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bloqueio-fim">Fim</Label>
            <Input
              id="bloqueio-fim"
              type="time"
              value={fimBloqueio}
              onChange={(evento) => setFimBloqueio(evento.target.value)}
              required
            />
          </div>
          <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="bloqueio-motivo">Motivo</Label>
            <Input
              id="bloqueio-motivo"
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              maxLength={120}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={criarBloqueio.isPending} className="w-full">
              Bloquear
            </Button>
          </div>
        </form>
      </section>
    </LayoutPainel>
  );
}