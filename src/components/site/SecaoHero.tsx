import { CalendarCheck, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { heroPoster, heroVideo } from "@/lib/imagens";
import { NEGOCIO, linkWhatsApp } from "@/lib/negocio";

export function SecaoHero() {
  const refVideo = useRef<HTMLVideoElement>(null);

  // Alguns navegadores ignoram o atributo autoplay em SSR/hidratação;
  // como o vídeo é mudo, chamar play() manualmente é permitido.
  useEffect(() => {
    const video = refVideo.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => {
      /* autoplay bloqueado: o poster permanece visível */
    });
  }, []);

  return (
    <section className="relative isolate overflow-hidden">
      <video
        ref={refVideo}
        src={heroVideo}
        poster={heroPoster.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
        tabIndex={-1}
        className="foto-tratada absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background/65"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/80 to-background/40"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 py-24 text-center md:px-6 md:py-36">
        <h1 className="text-5xl leading-[1.02] font-semibold uppercase sm:text-6xl md:text-7xl lg:text-8xl">
          {NEGOCIO.nome}
        </h1>
        <div aria-hidden className="mt-6 h-px w-24 rule-gold" />
        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
          Precisão em cada detalhe. Corte, barba e cuidado com o visual desde {NEGOCIO.desde}.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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

        <dl className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-border/70 pt-6">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden />
            {NEGOCIO.enderecoCurto}
          </div>
        </dl>
      </div>
    </section>
  );
}