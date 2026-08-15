import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { servicosQuery } from "@/lib/consultas";

function formatarPreco(preco: number | null): string {
  if (preco === null) return "A consultar";
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SecaoServicos() {
  const { data: servicos, isLoading, isError } = useQuery(servicosQuery);

  return (
    <section id="servicos" className="border-t border-border/70 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <p className="text-eyebrow">Serviços</p>
        <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">O que fazemos</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Cada serviço tem duração própria, respeitada na agenda. Os valores são administrados pelo
          painel da barbearia e podem ser atualizados a qualquer momento.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            [0, 1, 2, 3, 4].map((indice) => (
              <Skeleton key={`servico-esqueleto-${indice}`} className="h-36 w-full" />
            ))}

          {isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar os serviços agora. Tente novamente em instantes.
            </p>
          )}

          {servicos?.map((servico) => (
            <article key={servico.id} className="surface-panel flex flex-col justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold tracking-wide uppercase">{servico.nome}</h3>
                {servico.descricao && (
                  <p className="mt-2 text-sm text-muted-foreground">{servico.descricao}</p>
                )}
              </div>
              <div className="mt-6 flex items-baseline justify-between border-t border-border/70 pt-4">
                <span className="text-xs tracking-widest text-muted-foreground uppercase">
                  {servico.duracao_minutos} min
                </span>
                <span className="font-display text-lg text-primary">
                  {formatarPreco(servico.preco)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}