import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { hojeISOBrasilia } from "@/lib/agenda";

interface Indicadores {
  readonly hoje: number;
  readonly proximos: number;
  readonly concluidos30d: number;
  readonly cancelados30d: number;
}

function diasAtras(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toISOString().slice(0, 10);
}

export function PainelIndicadores() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-indicadores"],
    queryFn: async (): Promise<Indicadores> => {
      const hoje = hojeISOBrasilia();
      const inicio = diasAtras(30);

      const [doDia, futuros, concluidos, cancelados] = await Promise.all([
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .eq("data", hoje)
          .neq("status", "cancelado"),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .gt("data", hoje)
          .neq("status", "cancelado"),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .gte("data", inicio)
          .eq("status", "concluido"),
        supabase
          .from("agendamentos")
          .select("id", { count: "exact", head: true })
          .gte("data", inicio)
          .eq("status", "cancelado"),
      ]);

      const erro = doDia.error ?? futuros.error ?? concluidos.error ?? cancelados.error;
      if (erro) throw new Error(erro.message);

      return {
        hoje: doDia.count ?? 0,
        proximos: futuros.count ?? 0,
        concluidos30d: concluidos.count ?? 0,
        cancelados30d: cancelados.count ?? 0,
      };
    },
  });

  if (isLoading || !data) return <Skeleton className="h-32 w-full" />;

  const cartoes: readonly { readonly rotulo: string; readonly valor: number }[] = [
    { rotulo: "Agendamentos hoje", valor: data.hoje },
    { rotulo: "Próximos dias", valor: data.proximos },
    { rotulo: "Concluídos (30 dias)", valor: data.concluidos30d },
    { rotulo: "Cancelados (30 dias)", valor: data.cancelados30d },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cartoes.map((cartao) => (
        <div key={cartao.rotulo} className="surface-panel p-6">
          <p className="text-eyebrow">{cartao.rotulo}</p>
          <p className="mt-3 font-display text-4xl text-primary">{cartao.valor}</p>
        </div>
      ))}
    </div>
  );
}