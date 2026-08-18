import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

/** Usuário cadastrado + papéis derivados da tabela user_roles. */
interface UsuarioComPapeis {
  readonly id: string;
  readonly nome: string;
  readonly email: string | null;
  readonly ehFuncionario: boolean;
  readonly ehAdministrador: boolean;
}

const CHAVE = ["admin-usuarios-papeis"] as const;

export function PainelUsuarios() {
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading } = useQuery({
    queryKey: CHAVE,
    queryFn: async (): Promise<UsuarioComPapeis[]> => {
      // Ambas as leituras só retornam dados para administradores (policies do banco).
      const [perfis, papeis] = await Promise.all([
        supabase.from("profiles").select("id, nome, email").order("nome", { ascending: true }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (perfis.error) throw new Error(perfis.error.message);
      if (papeis.error) throw new Error(papeis.error.message);

      return (perfis.data ?? []).map((perfil) => {
        const meus = (papeis.data ?? []).filter((linha) => linha.user_id === perfil.id);
        return {
          id: perfil.id,
          nome: perfil.nome?.trim() || "Sem nome",
          email: perfil.email,
          ehFuncionario: meus.some((linha) => linha.role === "funcionario"),
          ehAdministrador: meus.some((linha) => linha.role === "administrador"),
        };
      });
    },
  });

  const alternarFuncionario = useMutation({
    mutationFn: async (usuario: UsuarioComPapeis) => {
      // Apenas o papel "funcionario" é manipulável aqui — o banco também recusa outros.
      if (usuario.ehFuncionario) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", usuario.id)
          .eq("role", "funcionario");
        if (error) throw new Error(error.message);
        return "removido" as const;
      }
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: usuario.id, role: "funcionario" });
      if (error) throw new Error(error.message);
      return "concedido" as const;
    },
    onSuccess: (resultado) => {
      toast.success(
        resultado === "concedido"
          ? "Papel de funcionário concedido."
          : "Papel de funcionário removido.",
      );
      void queryClient.invalidateQueries({ queryKey: CHAVE });
    },
    onError: () =>
      toast.error("Não foi possível alterar o papel. Confirme que sua conta é administradora."),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (!usuarios?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum usuário cadastrado ainda. As contas aparecem aqui depois do cadastro em /auth.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Para virar funcionário, a pessoa precisa primeiro criar uma conta em <code>/auth</code>. O
        papel de administrador não é atribuível por aqui, por segurança.
      </p>

      <ul className="grid gap-3">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              <p className="font-display text-base uppercase">{usuario.nome}</p>
              <p className="truncate text-sm text-muted-foreground">
                {usuario.email ?? "e-mail não informado"} ·{" "}
                {usuario.ehAdministrador
                  ? "administrador"
                  : usuario.ehFuncionario
                    ? "funcionário"
                    : "cliente"}
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
                {usuario.ehFuncionario ? "Remover funcionário" : "Tornar funcionário"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
