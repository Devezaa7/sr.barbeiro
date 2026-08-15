import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Barbeiro } from "@/lib/consultas";

export function PainelBarbeiros() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [especialidades, setEspecialidades] = useState("");

  const { data: barbeiros, isLoading } = useQuery({
    queryKey: ["admin-barbeiros"],
    queryFn: async (): Promise<Barbeiro[]> => {
      const { data, error } = await supabase
        .from("barbeiros")
        .select("id, nome, especialidades, foto_url, ativo, profile_id")
        .order("nome", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Barbeiro[];
    },
  });

  function invalidar() {
    void queryClient.invalidateQueries({ queryKey: ["admin-barbeiros"] });
    void queryClient.invalidateQueries({ queryKey: ["barbeiros"] });
  }

  const criar = useMutation({
    mutationFn: async () => {
      if (nome.trim().length < 3) throw new Error("Informe o nome do profissional.");
      const { error } = await supabase.from("barbeiros").insert({
        nome: nome.trim().slice(0, 80),
        especialidades: especialidades.trim().slice(0, 160) || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Profissional adicionado.");
      setNome("");
      setEspecialidades("");
      invalidar();
    },
    onError: (erro) => toast.error(erro instanceof Error ? erro.message : "Erro ao adicionar."),
  });

  const alternar = useMutation({
    mutationFn: async (barbeiro: Barbeiro) => {
      const { error } = await supabase
        .from("barbeiros")
        .update({ ativo: !barbeiro.ativo })
        .eq("id", barbeiro.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidar,
    onError: () => toast.error("Não foi possível alterar o profissional."),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-8">
      <ul className="grid gap-3">
        {barbeiros?.map((barbeiro) => (
          <li
            key={barbeiro.id}
            className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-display text-base uppercase">{barbeiro.nome}</p>
              <p className="text-sm text-muted-foreground">
                {barbeiro.especialidades ?? "Sem especialidades cadastradas"} ·{" "}
                {barbeiro.ativo ? "ativo" : "inativo"} ·{" "}
                {barbeiro.profile_id ? "login vinculado" : "sem login vinculado"}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => alternar.mutate(barbeiro)}>
              {barbeiro.ativo ? "Desativar" : "Ativar"}
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="surface-panel grid gap-4 p-6 sm:grid-cols-2"
        onSubmit={(evento) => {
          evento.preventDefault();
          criar.mutate();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="novo-barbeiro">Novo profissional</Label>
          <Input
            id="novo-barbeiro"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            maxLength={80}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="novas-especialidades">Especialidades</Label>
          <Input
            id="novas-especialidades"
            value={especialidades}
            onChange={(evento) => setEspecialidades(evento.target.value)}
            maxLength={160}
            placeholder="Corte social, barba, navalha"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={criar.isPending}>
            Adicionar profissional
          </Button>
        </div>
      </form>
    </div>
  );
}