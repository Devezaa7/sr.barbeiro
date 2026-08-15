import { Link } from "@tanstack/react-router";
import { Instagram, Phone } from "lucide-react";

import { NEGOCIO } from "@/lib/negocio";

export function RodapeSite() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <p className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
            {NEGOCIO.nome}
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{NEGOCIO.posicionamento}</p>
        </div>

        <nav aria-label="Redes e páginas" className="flex flex-col gap-3 text-sm">
          <a
            href={NEGOCIO.instagramUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Instagram className="size-4" aria-hidden />
            {NEGOCIO.instagramHandle}
          </a>
          <a
            href={`tel:${NEGOCIO.telefoneE164}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Phone className="size-4" aria-hidden />
            {NEGOCIO.telefoneExibicao}
          </a>
          <Link to="/privacidade" className="text-muted-foreground hover:text-primary">
            Política de privacidade
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {NEGOCIO.nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}