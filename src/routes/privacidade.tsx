import { createFileRoute } from "@tanstack/react-router";

import { BotaoWhatsAppFixo } from "@/components/site/BotaoWhatsAppFixo";
import { CabecalhoSite } from "@/components/site/CabecalhoSite";
import { RodapeSite } from "@/components/site/RodapeSite";
import { NEGOCIO } from "@/lib/negocio";

const TITULO = "Política de Privacidade | Sr. Barbeiro";
const DESCRICAO =
  "Como a Sr. Barbeiro coleta, usa e protege os dados dos clientes, e como solicitar a exclusão das suas informações, conforme a LGPD.";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-screen bg-background">
      <CabecalhoSite />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-eyebrow">LGPD</p>
        <h1 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">
          Política de privacidade
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground uppercase">Quais dados coletamos</h2>
            <p className="mt-2">
              Coletamos apenas o necessário para agendar e prestar o serviço: nome, telefone e, quando
              você cria uma conta, e-mail. Se optar por entrar com a conta Google, recebemos do Google
              seu nome e e-mail — nunca sua senha.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground uppercase">Para que usamos</h2>
            <p className="mt-2">
              Para reservar seu horário, identificar você na chegada, enviar confirmações e lembretes
              do atendimento e manter o histórico de serviços realizados. Não vendemos nem
              compartilhamos seus dados com terceiros para fins publicitários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground uppercase">Por quanto tempo</h2>
            <p className="mt-2">
              Mantemos os dados de agendamento enquanto sua conta existir ou pelo tempo necessário ao
              histórico de atendimento. Depois disso, são excluídos ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground uppercase">Seus direitos</h2>
            <p className="mt-2">
              Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo
              WhatsApp {NEGOCIO.telefoneExibicao} ou presencialmente em {NEGOCIO.enderecoResumido}. O
              atendimento é feito em até 15 dias.
            </p>
          </section>
        </div>
      </main>
      <RodapeSite />
      <BotaoWhatsAppFixo />
    </div>
  );
}