import { useQuery } from "@tanstack/react-query";

import corteImagem from "@/assets/galeria-corte.jpg";
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

        {isLoading && (
          <div className="mt-10 space-y-px">
            {[0, 1, 2, 3, 4].map((indice) => (
              <Skeleton key={`servico-esqueleto-${indice}`} className="h-24 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <p className="mt-10 text-sm text-destructive">
            Não foi possível carregar os serviços agora. Tente novamente em instantes.
          </p>
        )}

        {/* Lista editorial: o primeiro serviço vira bloco de destaque com foto,
            os demais seguem como linhas com preço integrado à composição. */}
        <div className="mt-12 border-t border-border/60">
          {servicos?.map((servico, indice) => {
            const ordem = String(indice + 1).padStart(2, "0");

            if (indice === 0) {
              return (
                <article
                  key={servico.id}
                  className="grid border-b border-border/60 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
                >
                  <div className="py-8 pr-0 md:py-12 md:pr-12">
                    <span className="font-display text-sm tracking-[0.3em] text-primary">
                      {ordem} · mais pedido
                    </span>
                    <h3 className="mt-4 font-display text-3xl uppercase md:text-5xl">
                      {servico.nome}
                    </h3>
                    {servico.descricao && (
                      <p className="mt-4 max-w-md text-sm text-muted-foreground">
                        {servico.descricao}
                      </p>
                    )}
                    <p className="mt-6 flex flex-wrap items-baseline gap-x-4">
                      <span className="font-display text-3xl text-primary">
                        {formatarPreco(servico.preco)}
                      </span>
                      <span className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                        {servico.duracao_minutos} minutos na cadeira
                      </span>
                    </p>
                  </div>
                  <img
                    src={corteImagem}
                    alt="Acabamento de corte masculino degradê"
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="hidden h-full max-h-72 w-full object-cover md:block"
                  />
                </article>
              );
            }

            return (
              <article
                key={servico.id}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-border/60 py-7 transition-colors hover:bg-card/40 md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-9 md:pr-2"
              >
                <span className="font-display text-sm tracking-[0.3em] text-muted-foreground">
                  {ordem}
                </span>
                <div>
                  <h3 className="font-display text-xl uppercase transition-colors group-hover:text-primary md:text-2xl">
                    {servico.nome}
                  </h3>
                  {servico.descricao && (
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                      {servico.descricao}
                    </p>
                  )}
                  <p className="mt-3 text-xs tracking-[0.25em] text-muted-foreground uppercase md:hidden">
                    {servico.duracao_minutos} min · {formatarPreco(servico.preco)}
                  </p>
                </div>
                <p className="col-start-2 hidden text-right md:col-start-3 md:block">
                  <span className="block font-display text-2xl text-primary">
                    {formatarPreco(servico.preco)}
                  </span>
                  <span className="mt-1 block text-xs tracking-[0.25em] text-muted-foreground uppercase">
                    {servico.duracao_minutos} min
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}