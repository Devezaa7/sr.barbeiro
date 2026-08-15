import ambiente from "@/assets/galeria-ambiente.jpg";
import ferramentas from "@/assets/galeria-ferramentas.jpg";
import { NEGOCIO } from "@/lib/negocio";

export function SecaoSobre() {
  return (
    <section id="sobre" className="border-t border-border/70 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="max-w-2xl">
          <p className="text-eyebrow">A barbearia</p>
          <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">
            Um ofício que se prova na cadeira
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              A {NEGOCIO.nome} trabalha com uma ideia simples: o corte é o começo, não o fim. O que
              sustenta a casa é o cuidado com o visual de cada cliente — leitura do formato do
              rosto, tipo de cabelo, desenho da barba e acabamento feito sem pressa.
            </p>
            <p>
              O padrão se repete em todo atendimento: pontualidade no horário marcado, ferramentas
              higienizadas e conversa franca sobre o que funciona para você.
            </p>
          </div>
        </div>

        {/* Composição intencionalmente assimétrica: um bloco largo com foto,
            um bloco tipográfico e um bloco estreito com imagem vertical. */}
        <div className="mt-14 grid gap-px bg-border/60 md:mt-20 md:grid-cols-12">
          <article className="relative isolate overflow-hidden bg-background md:col-span-7">
            <img
              src={ambiente}
              alt="Área de espera climatizada da barbearia"
              loading="lazy"
              width={1024}
              height={1024}
              className="absolute inset-0 -z-10 size-full object-cover opacity-45"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/30"
            />
            <div className="flex h-full min-h-64 flex-col justify-end p-7 md:p-10">
              <span className="text-eyebrow">01</span>
              <h3 className="mt-4 font-display text-2xl uppercase md:text-3xl">
                Ambiente climatizado
              </h3>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Loja na Estrada da Cachamorra com espaço limpo, climatizado e pensado para o cliente
                ficar à vontade enquanto espera a vez.
              </p>
            </div>
          </article>

          <article className="bg-background p-7 md:col-span-5 md:p-10">
            <span className="font-display text-6xl leading-none text-primary/25 md:text-7xl">
              02
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-wide uppercase">
              Atendimento por horário
            </h3>
            <div aria-hidden className="mt-4 h-px w-16 rule-gold" />
            <p className="mt-4 text-sm text-muted-foreground">
              Agenda organizada para você não perder tempo de espera. Cada serviço tem duração
              própria e horário reservado no nome de quem marcou.
            </p>
          </article>

          <article className="grid bg-background md:col-span-12 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="p-7 md:p-10">
              <span className="text-eyebrow">03</span>
              <h3 className="mt-4 max-w-md font-display text-2xl uppercase md:text-3xl">
                Corte, barba e atendimento infantil
              </h3>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                Da máquina à navalha: degradê, pezinho, desenho de barba com toalha quente e
                atendimento infantil com a paciência que a criança precisa.
              </p>
            </div>
            <img
              src={ferramentas}
              alt="Navalha, tesoura e máquina sobre bancada escura"
              loading="lazy"
              width={1024}
              height={1024}
              className="hidden size-full object-cover md:block"
            />
          </article>
        </div>
      </div>
    </section>
  );
}