import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";

interface UsuarioComPapeis {
  readonly id: string;
  readonly nome: string;
  readonly email: string | null;
  readonly telefone: string | null;
  readonly ehFuncionario: boolean;
  readonly ehAdministrador: boolean;
  readonly barbeiroId: string | null;
  readonly barbeiroAtivo: boolean;
}

const CHAVE = ["admin-usuarios-papeis"] as const;

function mensagemDeErro(erro: unknown, fallback: string) {
  return erro instanceof Error && erro.message ? erro.message : fallback;
}

export function PainelUsuarios() {
  const { user: adminUser } = useSessao();
  const queryClient = useQueryClient();
  const [nomeConvite, setNomeConvite] = useState("");
  const [emailConvite, setEmailConvite] = useState("");
  const [telefoneConvite, setTelefoneConvite] = useState("");
  const [especialidadesConvite, setEspecialidadesConvite] = useState("");

  const { data: usuarios, isLoading } = useQuery({
    queryKey: CHAVE,
    queryFn: async (): Promise<UsuarioComPapeis[]> => {
      // Essas leituras devem ser permitidas somente pelas policies de administrador.
      const [perfis, papeis, barbeiros] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nome, email, telefone")
          .order("nome", { ascending: true }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("barbeiros").select("id, nome, ativo, profile_id"),
      ]);

      if (perfis.error) throw new Error(perfis.error.message);
      if (papeis.error) throw new Error(papeis.error.message);
      if (barbeiros.error) throw new Error(barbeiros.error.message);

      const barbeirosPorPerfil = new Map(
        (barbeiros.data ?? [])
          .filter((barbeiro) => barbeiro.profile_id)
          .map((barbeiro) => [
            barbeiro.profile_id as string,
            { id: barbeiro.id, ativo: barbeiro.ativo },
          ]),
      );

      return (perfis.data ?? []).map((perfil) => {
        const meusPapeis = (papeis.data ?? []).filter(
          (linha) => linha.user_id === perfil.id,
        );
        const barbeiro = barbeirosPorPerfil.get(perfil.id);

        return {
          id: perfil.id,
          nome: perfil.nome?.trim() || "Sem nome",
          email: perfil.email,
          telefone: perfil.telefone,
          ehFuncionario: meusPapeis.some((linha) => linha.role === "funcionario"),
          ehAdministrador: meusPapeis.some((linha) => linha.role === "administrador"),
          barbeiroId: barbeiro?.id ?? null,
          barbeiroAtivo: barbeiro?.ativo ?? false,
        };
      });
    },
  });

  function invalidar() {
    void queryClient.invalidateQueries({ queryKey: CHAVE });
    void queryClient.invalidateQueries({ queryKey: ["admin-barbeiros"] });
    void queryClient.invalidateQueries({ queryKey: ["barbeiros"] });
  }

  const alternarFuncionario = useMutation({
    mutationFn: async (usuario: UsuarioComPapeis) => {
      if (usuario.ehFuncionario) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", usuario.id)
          .eq("role", "funcionario");
        if (roleError) throw new Error(roleError.message);

        if (usuario.barbeiroId) {
          const { error: barberError } = await supabase
            .from("barbeiros")
            .update({ ativo: false })
            .eq("id", usuario.barbeiroId);
          if (barberError) throw new Error(barberError.message);
        }

        return "bloqueado" as const;
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: usuario.id,
        role: "funcionario",
      });
      if (roleError) throw new Error(roleError.message);

      if (usuario.barbeiroId) {
        const { error: barberError } = await supabase
          .from("barbeiros")
          .update({ nome: usuario.nome, ativo: true })
          .eq("id", usuario.barbeiroId);
        if (barberError) throw new Error(barberError.message);
      } else {
        const { error: barberError } = await supabase.from("barbeiros").insert({
          nome: usuario.nome,
          profile_id: usuario.id,
          ativo: true,
        });
        if (barberError) throw new Error(barberError.message);
      }

      return "aprovado" as const;
    },
    onSuccess: (resultado) => {
      toast.success(
        resultado === "aprovado"
          ? "Acesso de barbeiro aprovado."
          : "Acesso de barbeiro bloqueado.",
      );
      invalidar();
    },
    onError: (erro) =>
      toast.error(
        mensagemDeErro(
          erro,
          "Não foi possível alterar o acesso. Confirme que sua conta é administradora.",
        ),
      ),
  });

  const convidar = useMutation({
    mutationFn: async () => {
      if (nomeConvite.trim().length < 3) {
        throw new Error("Informe o nome do barbeiro.");
      }
      if (!/^\S+@\S+\.\S+$/.test(emailConvite.trim())) {
        throw new Error("Informe um e-mail válido.");
      }
      if (!adminUser) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      const { data, error } = await supabase.functions.invoke("convidar-barbeiro", {
        body: {
          nome: nomeConvite,
          email: emailConvite,
          telefone: telefoneConvite,
          especialidades: especialidadesConvite,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error(data?.error ?? "Não foi possível enviar o convite.");
    },
    onSuccess: () => {
      toast.success("Convite enviado ao barbeiro.");
      setNomeConvite("");
      setEmailConvite("");
      setTelefoneConvite("");
      setEspecialidadesConvite("");
      invalidar();
    },
    onError: (erro) =>
      toast.error(mensagemDeErro(erro, "Não foi possível enviar o convite.")),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-8">
      <section className="surface-panel grid gap-4 p-6">
        <div>
          <h2 className="text-eyebrow">Convidar barbeiro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O barbeiro receberá um link por e-mail para criar a própria senha.
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(evento) => {
            evento.preventDefault();
            convidar.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="convite-nome">Nome</Label>
            <Input
              id="convite-nome"
              value={nomeConvite}
              onChange={(evento) => setNomeConvite(evento.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="convite-email">E-mail</Label>
            <Input
              id="convite-email"
              type="email"
              value={emailConvite}
              onChange={(evento) => setEmailConvite(evento.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="convite-telefone">Telefone</Label>
            <Input
              id="convite-telefone"
              value={telefoneConvite}
              onChange={(evento) => setTelefoneConvite(evento.target.value)}
              maxLength={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="convite-especialidades">Especialidades</Label>
            <Input
              id="convite-especialidades"
              value={especialidadesConvite}
              onChange={(evento) => setEspecialidadesConvite(evento.target.value)}
              maxLength={160}
              placeholder="Corte, barba, navalha"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={convidar.isPending}>
              {convidar.isPending ? "Enviando convite..." : "Enviar convite"}
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Um barbeiro também pode criar a própria conta em <code>/auth</code>. Até ser aprovado,
          ele permanece como cliente e não acessa a agenda. O botão abaixo aprova ou bloqueia apenas
          o papel de funcionário; o banco também precisa validar essa regra.
        </p>

        {!usuarios?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <ul className="grid gap-3">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-base uppercase">{usuario.nome}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {usuario.email ?? "e-mail não informado"} · {usuario.telefone ?? "sem telefone"} ·{" "}
                    {usuario.ehAdministrador
                      ? "administrador"
                      : usuario.ehFuncionario
                        ? usuario.barbeiroAtivo
                          ? "barbeiro ativo"
                          : "barbeiro bloqueado"
                        : "cliente / pendente"}
                  </p>
                </div>

                {usuario.ehAdministrador ? (
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    Papel fixo
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant={usuario.ehFuncionario ? "ghost" : "outline"}
                    disabled={alternarFuncionario.isPending}
                    onClick={() => alternarFuncionario.mutate(usuario)}
                  >
                    {usuario.ehFuncionario ? "Bloquear barbeiro" : "Aprovar barbeiro"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
