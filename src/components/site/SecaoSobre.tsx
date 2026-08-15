import { NEGOCIO } from "@/lib/negocio";

const PILARES = [
  {
    titulo: "Atendimento por horário",
    texto:
      "Agenda organizada para você não perder tempo de espera. Cada serviço tem duração própria e horário reservado.",
  },
  {
    titulo: "Ambiente climatizado",
    texto:
      "Loja na Estrada da Cachamorra com espaço climatizado, limpo e pensado para o cliente ficar à vontade.",
  },
  {
    titulo: "Corte, barba e infantil",
    texto:
      "Da máquina à navalha, incluindo atendimento infantil com a paciência que a criança precisa.",
  },
];

export function SecaoSobre() {
  return (
    <section id="sobre" className="border-t border-border/70 bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.1fr_1fr] md:px-6 md:py-28">
        <div>
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

        <ul className="grid gap-4">
          {PILARES.map((pilar) => (
            <li key={pilar.titulo} className="surface-panel p-6">
              <h3 className="text-base font-semibold tracking-wide uppercase">{pilar.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pilar.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}