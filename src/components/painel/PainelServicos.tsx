import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Servico } from "@/lib/consultas";

export function PainelServicos() {
  const queryClient = useQueryClient();
  const [novoNome, setNovoNome] = useState("");
  const [novaDuracao, setNovaDuracao] = useState("40");
  const [novoPreco, setNovoPreco] = useState("");

  const { data: servicos, isLoading } = useQuery({
    queryKey: ["admin-servicos"],
    queryFn: async (): Promise<Servico[]> => {
      const { data, error } = await supabase
        .from("servicos")
        .select("id, nome, descricao, duracao_minutos, preco, ativo, ordem")
        .order("ordem", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Servico[];
    },
  });

  function invalidar() {
    void queryClient.invalidateQueries({ queryKey: ["admin-servicos"] });
    void queryClient.invalidateQueries({ queryKey: ["servicos"] });
  }

  const salvar = useMutation({
    mutationFn: async (payload: { id: string; preco: number | null; duracao: number }) => {
      const { error } = await supabase
        .from("servicos")
        .update({ preco: payload.preco, duracao_minutos: payload.duracao })
        .eq("id", payload.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Serviço atualizado.");
      invalidar();
    },
    onError: () => toast.error("Não foi possível salvar o serviço."),
  });

  const criar = useMutation({
    mutationFn: async () => {
      const duracao = Number(novaDuracao);
      if (novoNome.trim().length < 3) throw new Error("Informe o nome do serviço.");
      if (!Number.isFinite(duracao) || duracao <= 0) throw new Error("Duração inválida.");
      const preco = novoPreco.trim() === "" ? null : Number(novoPreco.replace(",", "."));
      if (preco !== null && !Number.isFinite(preco)) throw new Error("Preço inválido.");

      const { error } = await supabase.from("servicos").insert({
        nome: novoNome.trim().slice(0, 80),
        duracao_minutos: duracao,
        preco,
        ordem: (servicos?.length ?? 0) + 1,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Serviço criado.");
      setNovoNome("");
      setNovoPreco("");
      invalidar();
    },
    onError: (erro) => toast.error(erro instanceof Error ? erro.message : "Erro ao criar."),
  });

  const alternarAtivo = useMutation({
    mutationFn: async (servico: Servico) => {
      const { error } = await supabase
        .from("servicos")
        .update({ ativo: !servico.ativo })
        .eq("id", servico.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidar,
    onError: () => toast.error("Não foi possível alterar a visibilidade."),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="grid gap-8">
      <ul className="grid gap-3">
        {servicos?.map((servico) => (
          <li key={servico.id} className="surface-panel p-4">
            <LinhaServico
              servico={servico}
              onSalvar={(preco, duracao) => salvar.mutate({ id: servico.id, preco, duracao })}
              onAlternar={() => alternarAtivo.mutate(servico)}
            />
          </li>
        ))}
      </ul>

      <form
        className="surface-panel grid gap-4 p-6 sm:grid-cols-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          criar.mutate();
        }}
      >
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="novo-servico">Novo serviço</Label>
          <Input
            id="novo-servico"
            value={novoNome}
            onChange={(evento) => setNovoNome(evento.target.value)}
            maxLength={80}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nova-duracao">Duração (min)</Label>
          <Input
            id="nova-duracao"
            type="number"
            min={5}
            max={480}
            value={novaDuracao}
            onChange={(evento) => setNovaDuracao(evento.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="novo-preco">Preço (R$)</Label>
          <Input
            id="novo-preco"
            value={novoPreco}
            onChange={(evento) => setNovoPreco(evento.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="sm:col-span-4">
          <Button type="submit" disabled={criar.isPending}>
            Adicionar serviço
          </Button>
        </div>
      </form>
    </div>
  );
}

interface LinhaServicoProps {
  readonly servico: Servico;
  readonly onSalvar: (preco: number | null, duracao: number) => void;
  readonly onAlternar: () => void;
}

function LinhaServico({ servico, onSalvar, onAlternar }: LinhaServicoProps) {
  const [preco, setPreco] = useState(servico.preco === null ? "" : String(servico.preco));
  const [duracao, setDuracao] = useState(String(servico.duracao_minutos));

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-display text-base uppercase">{servico.nome}</p>
        <p className="text-xs text-muted-foreground">
          {servico.ativo ? "Visível no site" : "Oculto no site"}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <Label htmlFor={`duracao-${servico.id}`} className="text-xs">
            Min
          </Label>
          <Input
            id={`duracao-${servico.id}`}
            className="w-20"
            type="number"
            min={5}
            max={480}
            value={duracao}
            onChange={(evento) => setDuracao(evento.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`preco-${servico.id}`} className="text-xs">
            R$
          </Label>
          <Input
            id={`preco-${servico.id}`}
            className="w-24"
            value={preco}
            onChange={(evento) => setPreco(evento.target.value)}
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            const precoNumero = preco.trim() === "" ? null : Number(preco.replace(",", "."));
            const duracaoNumero = Number(duracao);
            if (precoNumero !== null && !Number.isFinite(precoNumero)) {
              toast.error("Preço inválido.");
              return;
            }
            if (!Number.isFinite(duracaoNumero) || duracaoNumero <= 0) {
              toast.error("Duração inválida.");
              return;
            }
            onSalvar(precoNumero, duracaoNumero);
          }}
        >
          Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onAlternar}>
          {servico.ativo ? "Ocultar" : "Exibir"}
        </Button>
      </div>
    </div>
  );
}