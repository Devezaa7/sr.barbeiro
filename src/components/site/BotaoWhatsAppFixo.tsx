import { MessageCircle } from "lucide-react";

import { linkWhatsApp } from "@/lib/negocio";

/** Atalho de contato presente em todas as páginas. */
export function BotaoWhatsAppFixo() {
  return (
    <a
      href={linkWhatsApp()}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Falar com a Sr. Barbeiro no WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}