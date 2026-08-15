import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessao } from "@/hooks/useSessao";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { NEGOCIO } from "@/lib/negocio";

const TITULO = "Entrar | Sr. Barbeiro";
const DESCRICAO =
  "Acesse sua conta na Sr. Barbeiro para ver, cancelar ou remarcar seus agendamentos em Campo Grande, RJ.";

export const Route = createFileRoute("/auth")({
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
  component: PaginaAuth,
});

const credenciaisSchema = z.object({
  email: z.string().trim().email({ message: "Informe um e-mail válido." }).max(255),
  senha: z.string().min(6, { message: "A senha precisa ter ao menos 6 caracteres." }).max(72),
});

/** Traduz o erro do provedor de autenticação sem expor detalhes técnicos. */
function mensagemDeErro(mensagem: string): string {
  const normalizada = mensagem.toLowerCase();
  if (normalizada.includes("rate limit") || normalizada.includes("too many")) {
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  }
  if (normalizada.includes("invalid login credentials")) {
    return "Senha inválida ou login inválido. Confira os dados e tente novamente.";
  }
  if (normalizada.includes("user already registered")) {
    return "Este e-mail já possui conta. Faça login.";
  }
  if (normalizada.includes("email not confirmed")) {
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  }
  return "Não foi possível concluir. Tente novamente em instantes.";
}

function PaginaAuth() {
  const navigate = useNavigate();
  const { user, papeis, carregando } = useSessao();
  const [ocupado, setOcupado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  // Usuário já autenticado não deve ver o formulário.
  useEffect(() => {
    if (carregando || !user) return;
    const destino = papeis.includes("administrador")
      ? "/admin"
      : papeis.includes("funcionario")
        ? "/agenda"
        : "/minha-conta";
    void navigate({ to: destino, replace: true });
  }, [carregando, user, papeis, navigate]);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    try {
      const dados = credenciaisSchema.parse({ email, senha });
      const { error } = await supabase.auth.signInWithPassword({
        email: dados.email,
        password: dados.senha,
      });
      if (error) throw new Error(error.message);
    } catch (erro) {
      toast.error(
        erro instanceof z.ZodError
          ? (erro.issues[0]?.message ?? "Dados inválidos.")
          : mensagemDeErro(erro instanceof Error ? erro.message : ""),
      );
    } finally {
      setOcupado(false);
    }
  }

  async function cadastrar(evento: React.FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    try {
      const dados = credenciaisSchema.parse({ email, senha });
      if (nome.trim().length < 3) throw new z.ZodError([]);
      const { data, error } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: {
          emailRedirectTo: window.location.origin,
          data: { nome: nome.trim(), telefone: telefone.trim() },
        },
      });
      if (error) throw new Error(error.message);
      if (!data.session) {
        toast.success("Conta criada. Confirme seu e-mail para acessar sua área.");
      }
    } catch (erro) {
      toast.error(
        erro instanceof z.ZodError
          ? (erro.issues[0]?.message ?? "Informe nome, e-mail e senha válidos.")
          : mensagemDeErro(erro instanceof Error ? erro.message : ""),
      );
    } finally {
      setOcupado(false);
    }
  }

  async function entrarComGoogle() {
    setOcupado(true);
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      toast.error("Não foi possível entrar com o Google agora.");
      setOcupado(false);
      return;
    }
    if (resultado.redirected) return;
    void navigate({ to: "/minha-conta", replace: true });
  }

  async function recuperarSenha() {
    const parse = z.string().trim().email().safeParse(email);
    if (!parse.success) {
      toast.error("Digite seu e-mail no campo acima para receber o link de redefinição.");
      return;
    }
    setOcupado(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parse.data, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setOcupado(false);
    toast[error ? "error" : "success"](
      error
        ? mensagemDeErro(error.message)
        : "Enviamos um link de redefinição para o seu e-mail.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <a href="/" className="block text-center">
          <span className="font-display text-xl font-semibold tracking-[0.2em] uppercase">
            {NEGOCIO.nome}
          </span>
        </a>

        <div className="surface-panel mt-8 p-6">
          <Tabs defaultValue="entrar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar">
              <form className="mt-6 grid gap-4" onSubmit={entrar}>
                <div className="grid gap-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    autoComplete="email"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-senha">Senha</Label>
                  <Input
                    id="login-senha"
                    type="password"
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="current-password"
                    maxLength={72}
                    required
                  />
                </div>
                <Button type="submit" disabled={ocupado}>
                  {ocupado && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Entrar
                </Button>
                <button
                  type="button"
                  onClick={recuperarSenha}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </form>
            </TabsContent>

            <TabsContent value="criar">
              <form className="mt-6 grid gap-4" onSubmit={cadastrar}>
                <div className="grid gap-2">
                  <Label htmlFor="cad-nome">Nome</Label>
                  <Input
                    id="cad-nome"
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cad-telefone">Telefone</Label>
                  <Input
                    id="cad-telefone"
                    value={telefone}
                    onChange={(evento) => setTelefone(evento.target.value)}
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cad-email">E-mail</Label>
                  <Input
                    id="cad-email"
                    type="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    autoComplete="email"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cad-senha">Senha</Label>
                  <Input
                    id="cad-senha"
                    type="password"
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="new-password"
                    maxLength={72}
                    required
                  />
                </div>
                <Button type="submit" disabled={ocupado}>
                  {ocupado && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs tracking-widest text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={entrarComGoogle} disabled={ocupado}>
            Entrar com Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Agendar não exige conta: você pode reservar apenas com nome e telefone na{" "}
          <a href="/#agendamento" className="text-primary hover:underline">
            página inicial
          </a>
          .
        </p>
      </div>
    </main>
  );
}