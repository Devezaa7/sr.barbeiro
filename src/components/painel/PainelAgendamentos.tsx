import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, formatarDataBR, formatarHora } from "@/lib/agenda";

interface LinhaAdmin {
  id: string;
  data: string;
  hora_inicio: string;
  status: string;
  cliente_nome: string;
  cliente_telefone: string;
  servicos: { nome: string } | null;
  barbeiros: { nome: string } | null;
}

const ACOES: readonly { readonly status: string; readonly label: string }[] = [
  { status: "confirmado", label: "Confirmar" },
  { status: "concluido", label: "Concluir" },
  { status: "nao_compareceu", label: "Faltou" },
  { status: "cancelado", label: "Cancelar" },
];

export function PainelAgendamentos() {
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["admin-agendamentos"],
    queryFn: async (): Promise<LinhaAdmin[]> => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(
          "id, data, hora_inicio, status, cliente_nome, cliente_telefone, servicos(nome), barbeiros(nome)",
        )
        .order("data", { ascending: false })
        .order("hora_inicio", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as LinhaAdmin[];
    },
  });

  const atualizar = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Agendamento atualizado.");
      void queryClient.invalidateQueries({ queryKey: ["admin-agendamentos"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-indicadores"] });
    },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <ul className="grid gap-3">
      {agendamentos?.map((item) => (
        <li
          key={item.id}
          className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
        >
          <div>
            <p className="font-display text-base uppercase">
              {formatarDataBR(item.data)} · {formatarHora(item.hora_inicio)}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.servicos?.nome} · {item.barbeiros?.nome} · {item.cliente_nome} ·{" "}
              {item.cliente_telefone}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{STATUS_LABEL[item.status] ?? item.status}</Badge>
            {ACOES.filter((acao) => acao.status !== item.status).map((acao) => (
              <Button
                key={acao.status}
                size="sm"
                variant="ghost"
                onClick={() => atualizar.mutate({ id: item.id, status: acao.status })}
              >
                {acao.label}
              </Button>
            ))}
          </div>
        </li>
      ))}
      {agendamentos?.length === 0 && (
        <li className="text-sm text-muted-foreground">Nenhum agendamento registrado ainda.</li>
      )}
    </ul>
  );
}