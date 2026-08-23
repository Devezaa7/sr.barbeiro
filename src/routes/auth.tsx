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
  if (normalizada.includes("password is known to be weak")) {
    return "Senha muito fraca. Tente uma senha mais complexa com letras, números e símbolos.";
  }
  return "Não foi possível concluir. Tente novamente em instantes.";
}

function calcularForcaSenha(senha: string): { label: string; cor: string; percentual: number } {
  if (!senha) return { label: "", cor: "bg-muted", percentual: 0 };
  
  let pontos = 0;
  if (senha.length >= 8) pontos += 1;
  if (/[A-Z]/.test(senha)) pontos += 1;
  if (/[0-9]/.test(senha)) pontos += 1;
  if (/[^A-Za-z0-9]/.test(senha)) pontos += 1;
  
  if (senha.length < 6) return { label: "Muito curta", cor: "bg-destructive", percentual: 25 };
  if (pontos <= 1) return { label: "Fraca", cor: "bg-destructive", percentual: 33 };
  if (pontos === 2) return { label: "Média", cor: "bg-yellow-500", percentual: 66 };
  return { label: "Forte", cor: "bg-green-500", percentual: 100 };
}

function PaginaAuth() {
  const navigate = useNavigate();
  const { user, papeis, carregando } = useSessao();
  const [ocupado, setOcupado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<string>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const forca = calcularForcaSenha(senha);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  // Autenticação apenas por e-mail e senha.

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
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
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
                  {senha && (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex h-1 overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full transition-all duration-300 ${forca.cor}`}
                          style={{ width: `${forca.percentual}%` }}
                        />
                      </div>
                      <p className={`text-[10px] font-medium uppercase tracking-wider ${forca.label === "Forte" ? "text-green-500" : forca.label === "Média" ? "text-yellow-500" : "text-destructive"}`}>
                        Senha {forca.label}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Dica: Use ao menos 8 caracteres, mesclando letras, números e símbolos. Evite sequências óbvias (ex: 123456).
                  </p>
                </div>
                <Button type="submit" disabled={ocupado}>
                  {ocupado && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

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