import { Clock, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAPA_EMBED_URL, NEGOCIO, linkWhatsApp } from "@/lib/negocio";

export function SecaoContato() {
  return (
    <section id="contato" className="border-t border-border/70">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
        <div>
          <p className="text-eyebrow">Localização e contato</p>
          <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">Onde nos encontrar</h2>

          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span className="text-muted-foreground">{NEGOCIO.enderecoCompleto}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${NEGOCIO.telefoneE164}`} className="hover:text-primary">
                {NEGOCIO.telefoneExibicao}
              </a>
            </li>
            <li className="flex gap-3">
              <Instagram className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <a
                href={NEGOCIO.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                {NEGOCIO.instagramHandle}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="space-y-1 text-muted-foreground">
                {NEGOCIO.horarioFuncionamento.map((faixa) => (
                  <p key={faixa.dias}>
                    <span className="text-foreground">{faixa.dias}:</span> {faixa.horario}
                  </p>
                ))}
              </div>
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href={linkWhatsApp()} target="_blank" rel="noreferrer noopener">
                <MessageCircle className="size-4" aria-hidden />
                Falar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${NEGOCIO.telefoneE164}`}>Ligar agora</a>
            </Button>
          </div>
        </div>

        <div className="min-h-72 overflow-hidden border border-border/70">
          <iframe
            title="Mapa com a localização da Sr. Barbeiro"
            src={MAPA_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full min-h-72"
          />
        </div>
      </div>
    </section>
  );
}