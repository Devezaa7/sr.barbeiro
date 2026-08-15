import { createFileRoute } from "@tanstack/react-router";

import { FluxoAgendamento } from "@/components/agendamento/FluxoAgendamento";
import { BotaoWhatsAppFixo } from "@/components/site/BotaoWhatsAppFixo";
import { CabecalhoSite } from "@/components/site/CabecalhoSite";
import { RodapeSite } from "@/components/site/RodapeSite";
import { SecaoAvaliacoes } from "@/components/site/SecaoAvaliacoes";
import { SecaoContato } from "@/components/site/SecaoContato";
import { SecaoGaleria } from "@/components/site/SecaoGaleria";
import { SecaoHero } from "@/components/site/SecaoHero";
import { SecaoServicos } from "@/components/site/SecaoServicos";
import { SecaoSobre } from "@/components/site/SecaoSobre";

const TITULO = "Sr. Barbeiro | Barbearia em Campo Grande, Rio de Janeiro";
const DESCRICAO =
  "Barbearia em Campo Grande (RJ) desde 2020: corte, barba e atendimento infantil em ambiente climatizado. Nota 5,0 no Google. Agende seu horário online.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <CabecalhoSite />
      <main>
        <SecaoHero />
        <SecaoSobre />
        <SecaoServicos />

        <section id="agendamento" className="border-t border-border/70 bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
            <p className="text-eyebrow">Agendamento</p>
            <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">Escolha seu horário</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Serviço, barbeiro, data e horário. Sem cadastro obrigatório: basta nome e telefone.
            </p>
            <div className="mt-10">
              <FluxoAgendamento />
            </div>
          </div>
        </section>

        <SecaoGaleria />
        <SecaoAvaliacoes />
        <SecaoContato />
      </main>
      <RodapeSite />
      <BotaoWhatsAppFixo />
    </div>
  );
}
