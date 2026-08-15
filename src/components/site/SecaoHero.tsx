import { CalendarCheck, MapPin } from "lucide-react";

import heroImagem from "@/assets/hero-barbearia.jpg";
import heroVideo from "@/assets/hero-barbearia.mp4.asset.json";
import { Button } from "@/components/ui/button";
import { NEGOCIO, linkWhatsApp } from "@/lib/negocio";

export function SecaoHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <video
        src={heroVideo.url}
        poster={heroImagem}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background/65"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/80 to-background/40"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-24 md:px-6 md:py-36">
        <p className="text-eyebrow">Campo Grande · Rio de Janeiro</p>
        <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] font-semibold uppercase sm:text-5xl md:text-6xl">
          {NEGOCIO.nome}
        </h1>
        <div aria-hidden className="mt-5 h-px w-24 rule-gold" />
        <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
          Mais que corte: cuidado com o visual. Barbearia de bairro com padrão de atendimento
          construído dia após dia desde {NEGOCIO.desde}.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={linkWhatsApp()} target="_blank" rel="noreferrer noopener">
              <CalendarCheck className="size-4" aria-hidden />
              Agendar pelo WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#agendamento">Escolher horário online</a>
          </Button>
        </div>

        <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-border/70 pt-6">
          <div>
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">
              Avaliação no Google
            </dt>
            <dd className="font-display text-2xl text-primary">
              {NEGOCIO.avaliacaoNota}
              <span className="ml-2 align-middle text-sm text-muted-foreground">
                {NEGOCIO.avaliacaoTotal} avaliações
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">Em atividade</dt>
            <dd className="font-display text-2xl">desde {NEGOCIO.desde}</dd>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden />
            {NEGOCIO.enderecoResumido}
          </div>
        </dl>
      </div>
    </section>
  );
}