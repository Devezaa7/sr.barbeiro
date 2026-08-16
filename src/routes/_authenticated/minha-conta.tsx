import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, formatarDataBR, formatarHora, hojeISOBrasilia } from "@/lib/agenda";
import { mensagemAmigavel } from "@/lib/erros";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({
    meta: [
      { title: "Meus agendamentos | Sr. Barbeiro" },
      { name: "description", content: "Veja, cancele ou remarque seus horários na Sr. Barbeiro." },
      { property: "og:title", content: "Meus agendamentos | Sr. Barbeiro" },
      { property: "og:description", content: "Gerencie seus horários na Sr. Barbeiro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinhaConta,
});

interface LinhaAgendamento {
  id: string;
  data: string;
  hora_inicio: string;
  status: string;
  servicos: { nome: string } | null;
  barbeiros: { nome: string } | null;
}

function MinhaConta() {
  const { user } = useSessao();
  const queryClient = useQueryClient();

  const {
    data: agendamentos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meus-agendamentos", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<LinhaAgendamento[]> => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("id, data, hora_inicio, status, servicos(nome), barbeiros(nome)")
        .eq("cliente_id", user!.id)
        .order("data", { ascending: false })
        .order("hora_inicio", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as LinhaAgendamento[];
    },
  });

  const cancelar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: "cancelado" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Agendamento cancelado.");
      void queryClient.invalidateQueries({ queryKey: ["meus-agendamentos"] });
    },
    onError: (erro: unknown) =>
      toast.error(mensagemAmigavel(erro, "Não foi possível cancelar agora.")),
  });

  const hoje = hojeISOBrasilia();
  const futuros = agendamentos?.filter((item) => item.data >= hoje) ?? [];
  const anteriores = agendamentos?.filter((item) => item.data < hoje) ?? [];

  return (
    <LayoutPainel
      titulo="Meus agendamentos"
      descricao="Cancelamentos e remarcações devem ser feitos com pelo menos 2 horas de antecedência."
    >
      {isLoading && <Skeleton className="h-32 w-full" />}

      {isError && (
        <div className="surface-panel p-6 text-sm">
          <p className="text-muted-foreground">{mensagemAmigavel(error)}</p>
          <Button className="mt-4" variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      <section>
        <h2 className="text-eyebrow">Próximos</h2>
        {futuros.length === 0 && !isLoading && (
          <p className="mt-3 text-sm text-muted-foreground">
            Você não tem horários futuros.{" "}
            <a href="/#agendamento" className="text-primary hover:underline">
              Agendar agora
            </a>
          </p>
        )}
        <ul className="mt-4 grid gap-3">
          {futuros.map((item) => (
            <li
              key={item.id}
              className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-display text-base uppercase">{item.servicos?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatarDataBR(item.data)} às {formatarHora(item.hora_inicio)} ·{" "}
                  {item.barbeiros?.nome}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{STATUS_LABEL[item.status] ?? item.status}</Badge>
                {item.status !== "cancelado" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancelar.isPending}
                    onClick={() => cancelar.mutate(item.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-eyebrow">Histórico</h2>
        <ul className="mt-4 grid gap-2">
          {anteriores.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-2 text-sm"
            >
              <span>
                {formatarDataBR(item.data)} às {formatarHora(item.hora_inicio)} ·{" "}
                {item.servicos?.nome}
              </span>
              <span className="text-muted-foreground">
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </li>
          ))}
          {anteriores.length === 0 && !isLoading && (
            <li className="text-sm text-muted-foreground">Nenhum atendimento anterior.</li>
          )}
        </ul>
      </section>
    </LayoutPainel>
  );
}