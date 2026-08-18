import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSessao } from "@/hooks/useSessao";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo-sr-barbeiro.jpg.asset.json";

const SECOES = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#agendamento", label: "Agendar" },
  { href: "/#galeria", label: "Galeria" },
  { href: "/#contato", label: "Contato" },
] as const;

export interface CabecalhoSiteProps extends ComponentProps<"header"> {}

export function CabecalhoSite({ className, ...props }: CabecalhoSiteProps) {
  const [aberto, setAberto] = useState(false);
  const { user, papeis } = useSessao();

  const destinoConta = papeis.includes("administrador")
    ? "/admin"
    : papeis.includes("funcionario")
      ? "/agenda"
      : "/minha-conta";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5 leading-none">
          <img
            src={logoAsset.url}
            alt="Logo Sr. Barbeiro"
            width={40}
            height={40}
            className="size-9 rounded-sm object-cover md:size-10"
          />
          <span className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
            Sr. Barbeiro
          </span>
        </Link>

        <nav aria-label="Seções do site" className="hidden items-center gap-7 md:flex">
          {SECOES.map((secao) => (
            <a
              key={secao.href}
              href={secao.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {secao.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant={user ? "outline" : "default"} className="hidden md:inline-flex">
            <Link to={user ? destinoConta : "/auth"}>{user ? "Minha área" : "Entrar"}</Link>
          </Button>

          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4 text-eyebrow">Navegação</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-2">
                {SECOES.map((secao) => (
                  <a
                    key={secao.href}
                    href={secao.href}
                    onClick={() => setAberto(false)}
                    className="rounded px-3 py-3 text-base text-foreground hover:bg-secondary"
                  >
                    {secao.label}
                  </a>
                ))}
                <Link
                  to={user ? destinoConta : "/auth"}
                  onClick={() => setAberto(false)}
                  className="rounded px-3 py-3 text-base text-primary hover:bg-secondary"
                >
                  {user ? "Minha área" : "Entrar / criar conta"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}