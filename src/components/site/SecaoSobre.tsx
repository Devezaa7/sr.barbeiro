import { sobreImagem1, sobreImagem2, sobreImagem3 } from "@/lib/imagens";

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
              Aqui o trabalho parte de uma ideia simples: o corte é o começo, não o fim. O que
              sustenta a casa é a leitura do formato do rosto, o tipo de cabelo, o desenho da barba
              e o acabamento feito sem pressa.
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
              src={sobreImagem2.src}
              alt={sobreImagem2.alt}
              loading="lazy"
              width={sobreImagem2.largura}
              height={sobreImagem2.altura}
              className="foto-tratada absolute inset-0 -z-10 size-full object-cover opacity-60"
            />
            <div
              aria-hidden
              className="foto-overlay absolute inset-0 -z-10"
            />
            <div className="flex h-full min-h-64 flex-col justify-end p-7 md:p-10">
              <span className="text-eyebrow">01</span>
              <h3 className="mt-4 font-display text-2xl uppercase md:text-3xl">
                Ferramenta afiada, higiene em primeiro lugar
              </h3>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Navalha, tesoura e máquina higienizadas antes de cada atendimento. Ambiente limpo e
                climatizado do começo ao fim.
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

          <article className="grid bg-background md:col-span-12 md:grid-cols-[minmax(0,1fr)_260px_260px]">
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
              src={sobreImagem3.src}
              alt={sobreImagem3.alt}
              loading="lazy"
              width={sobreImagem3.largura}
              height={sobreImagem3.altura}
              className="foto-tratada hidden size-full object-cover md:block"
            />
            <img
              src={sobreImagem1.src}
              alt={sobreImagem1.alt}
              loading="lazy"
              width={sobreImagem1.largura}
              height={sobreImagem1.altura}
              className="foto-tratada hidden size-full object-cover md:block"
            />
          </article>
        </div>
      </div>
    </section>
  );
}