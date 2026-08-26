import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITULO = "Redefinir senha | Sr. Barbeiro";
const DESCRICAO = "Defina uma nova senha para acessar sua conta na Sr. Barbeiro.";

export const Route = createFileRoute("/redefinir-senha")({
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
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    const parse = z.string().min(6).max(72).safeParse(senha);
    if (!parse.success) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setOcupado(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });

      if (error) {
        toast.error("Link expirado ou inválido. Solicite a redefinição novamente.");
        return;
      }

      toast.success("Senha atualizada. Faça login com a nova senha.");
      await supabase.auth.signOut();
      void navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Não foi possível atualizar a senha. Solicite um novo link.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form className="surface-panel grid w-full max-w-md gap-4 p-6" onSubmit={salvar}>
        <h1 className="text-xl font-semibold uppercase">Nova senha</h1>
        <div className="grid gap-2">
          <Label htmlFor="nova-senha">Nova senha</Label>
          <Input
            id="nova-senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="new-password"
            maxLength={72}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirma-senha">Confirmar senha</Label>
          <Input
            id="confirma-senha"
            type="password"
            value={confirmacao}
            onChange={(evento) => setConfirmacao(evento.target.value)}
            autoComplete="new-password"
            maxLength={72}
            required
          />
        </div>
        <Button type="submit" disabled={ocupado}>
          {ocupado && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Salvar nova senha
        </Button>
      </form>
    </main>
  );
}
