import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NEGOCIO } from "@/lib/negocio";

export interface LayoutPainelProps {
  readonly titulo: string;
  readonly descricao: string;
  readonly children: ReactNode;
}

export function LayoutPainel({ titulo, descricao, children }: LayoutPainelProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /** Encerra a sessão limpando o cache antes de sair, para não vazar dados. */
  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-6">
          <a href="/" className="font-display text-base tracking-[0.2em] uppercase">
            {NEGOCIO.nome}
          </a>
          <Button variant="ghost" size="sm" onClick={sair}>
            <LogOut className="size-4" aria-hidden />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="text-2xl font-semibold uppercase md:text-3xl">{titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}