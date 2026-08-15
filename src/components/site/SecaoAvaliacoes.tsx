import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { avaliacoesQuery } from "@/lib/consultas";
import { NEGOCIO } from "@/lib/negocio";

export function SecaoAvaliacoes() {
  const { data: avaliacoes, isLoading } = useQuery(avaliacoesQuery);

  return (
    <section id="avaliacoes" className="border-t border-border/70 bg-card/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow">Avaliações</p>
            <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">
              Nota {NEGOCIO.avaliacaoNota} no Google
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {NEGOCIO.avaliacaoTotal} avaliações de clientes reais no Google
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((indice) => (
              <Skeleton key={`avaliacao-esqueleto-${indice}`} className="h-40 w-full" />
            ))}

          {avaliacoes?.map((avaliacao) => (
            <blockquote key={avaliacao.id} className="surface-panel flex h-full flex-col p-6">
              <p className="font-display text-sm tracking-[0.2em] text-primary">
                {avaliacao.nota},0
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {avaliacao.comentario}
              </p>
              <footer className="mt-5 border-t border-border/70 pt-3 text-xs tracking-widest uppercase">
                {avaliacao.nome_exibicao ?? "Cliente"}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}