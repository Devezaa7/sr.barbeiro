import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";
import {
  calcularSlotsDisponiveis,
  formatarDataBR,
  horaParaMinutos,
  minutosParaHora,
  paraDataISO,
} from "@/lib/agenda";
import { agendaDoDiaQuery, barbeirosQuery, servicosQuery } from "@/lib/consultas";
import { linkWhatsApp } from "@/lib/negocio";
import { cn } from "@/lib/utils";

/** Validação de identificação do cliente, aplicada antes de qualquer escrita. */
const contatoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, { message: "Informe seu nome completo." })
    .max(100, { message: "Nome muito longo." }),
  telefone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, { message: "Informe um telefone válido com DDD." }),
  observacoes: z.string().trim().max(300, { message: "Observação muito longa." }).optional(),
});

const PASSOS = ["Serviço", "Barbeiro", "Data e horário", "Confirmação"] as const;

export function FluxoAgendamento() {
  const queryClient = useQueryClient();
  const { user } = useSessao();

  const [passo, setPasso] = useState(0);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null);
  const [dataISO, setDataISO] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [concluido, setConcluido] = useState(false);

  const { data: servicos } = useQuery(servicosQuery);
  const { data: barbeiros } = useQuery(barbeirosQuery);
  const { data: agenda, isFetching: buscandoAgenda } = useQuery(
    agendaDoDiaQuery(barbeiroId, dataISO),
  );

  const servico = servicos?.find((item) => item.id === servicoId) ?? null;
  const barbeiro = barbeiros?.find((item) => item.id === barbeiroId) ?? null;

  // Estado derivado: nunca guardado em useState, sempre recalculado.
  const slots = useMemo(() => {
    if (!agenda || !servico || !dataISO) return [];
    return calcularSlotsDisponiveis({
      janelas: agenda.janelas,
      ocupados: agenda.ocupados,
      duracaoMinutos: servico.duracao_minutos,
      dataISO,
    });
  }, [agenda, servico, dataISO]);

  const criar = useMutation({
    mutationFn: async () => {
      const validado = contatoSchema.parse({ nome, telefone, observacoes });
      if (!servico || !barbeiroId || !dataISO || !hora) {
        throw new Error("Complete todas as etapas do agendamento.");
      }

      const horaFim = minutosParaHora(horaParaMinutos(hora) + servico.duracao_minutos);
      const { error } = await supabase.from("agendamentos").insert({
        cliente_id: user?.id ?? null,
        cliente_nome: validado.nome,
        cliente_telefone: validado.telefone,
        barbeiro_id: barbeiroId,
        servico_id: servico.id,
        data: dataISO,
        hora_inicio: hora,
        hora_fim: horaFim,
        observacoes: validado.observacoes ?? null,
      });

      if (error) {
        // Violação da restrição de exclusão = horário tomado nesse intervalo.
        if (error.code === "23P01") {
          throw new Error("Esse horário acabou de ser reservado. Escolha outro, por favor.");
        }
        throw new Error("Não foi possível concluir o agendamento. Tente novamente.");
      }
    },
    onSuccess: () => {
      setConcluido(true);
      void queryClient.invalidateQueries({ queryKey: ["agenda-dia"] });
      void queryClient.invalidateQueries({ queryKey: ["meus-agendamentos"] });
      toast.success("Agendamento registrado!");
    },
    onError: (erro: unknown) => {
      const mensagem =
        erro instanceof z.ZodError
          ? (erro.issues[0]?.message ?? "Verifique os dados informados.")
          : erro instanceof Error
            ? erro.message
            : "Erro inesperado.";
      toast.error(mensagem);
      void queryClient.invalidateQueries({ queryKey: ["agenda-dia"] });
    },
  });

  function reiniciar() {
    setPasso(0);
    setServicoId(null);
    setBarbeiroId(null);
    setDataISO(null);
    setHora(null);
    setObservacoes("");
    setConcluido(false);
  }

  if (concluido && servico && dataISO && hora) {
    const resumo = `Olá, confirmei um agendamento na Sr. Barbeiro: ${servico.nome} com ${barbeiro?.nome ?? "a equipe"} em ${formatarDataBR(dataISO)} às ${hora}. Nome: ${nome}.`;
    return (
      <div className="surface-panel mx-auto max-w-xl p-8 text-center">
        <Check className="mx-auto size-10 text-primary" aria-hidden />
        <h3 className="mt-4 text-2xl font-semibold uppercase">Horário reservado</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          {servico.nome} · {formatarDataBR(dataISO)} às {hora} · {barbeiro?.nome}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <a href={linkWhatsApp(resumo)} target="_blank" rel="noreferrer noopener">
              Confirmar no WhatsApp
            </a>
          </Button>
          <Button variant="outline" onClick={reiniciar}>
            Fazer novo agendamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel p-5 md:p-8">
      <ol className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-widest uppercase">
        {PASSOS.map((titulo, indice) => (
          <li
            key={titulo}
            className={cn(
              "flex items-center gap-2",
              indice === passo ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="font-display">{String(indice + 1).padStart(2, "0")}</span>
            {titulo}
          </li>
        ))}
      </ol>

      {passo === 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {servicos?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setServicoId(item.id);
                setHora(null);
                setPasso(1);
              }}
              className={cn(
                "border p-5 text-left transition-colors hover:border-primary",
                servicoId === item.id ? "border-primary" : "border-border",
              )}
            >
              <span className="block font-display text-base uppercase">{item.nome}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {item.duracao_minutos} min
              </span>
            </button>
          ))}
        </div>
      )}

      {passo === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {barbeiros?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setBarbeiroId(item.id);
                setHora(null);
                setPasso(2);
              }}
              className={cn(
                "border p-5 text-left transition-colors hover:border-primary",
                barbeiroId === item.id ? "border-primary" : "border-border",
              )}
            >
              <span className="block font-display text-base uppercase">{item.nome}</span>
              {item.especialidades && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.especialidades}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {passo === 2 && (
        <div className="grid gap-8 md:grid-cols-[auto_1fr]">
          <Calendar
            mode="single"
            locale={undefined}
            selected={dataISO ? new Date(`${dataISO}T12:00:00`) : undefined}
            onSelect={(data) => {
              setHora(null);
              setDataISO(data ? paraDataISO(data) : null);
            }}
            disabled={{ before: new Date() }}
            className="border border-border p-3"
          />

          <div>
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Horários livres
            </p>
            {!dataISO && (
              <p className="mt-4 text-sm text-muted-foreground">
                Escolha uma data no calendário para ver os horários.
              </p>
            )}
            {dataISO && buscandoAgenda && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Consultando a agenda…
              </p>
            )}
            {dataISO && !buscandoAgenda && slots.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum horário livre nesta data para o serviço escolhido.
              </p>
            )}
            {slots.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setHora(slot);
                      setPasso(3);
                    }}
                    className={cn(
                      "border py-2 text-sm transition-colors hover:border-primary",
                      hora === slot ? "border-primary text-primary" : "border-border",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {passo === 3 && servico && dataISO && hora && (
        <form
          className="grid max-w-xl gap-5"
          onSubmit={(evento) => {
            evento.preventDefault();
            criar.mutate();
          }}
        >
          <div className="border border-border p-4 text-sm">
            <p className="font-display text-base uppercase">{servico.nome}</p>
            <p className="mt-1 text-muted-foreground">
              {barbeiro?.nome} · {formatarDataBR(dataISO)} às {hora} · {servico.duracao_minutos} min
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agendamento-nome">Nome</Label>
            <Input
              id="agendamento-nome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agendamento-telefone">Telefone com DDD</Label>
            <Input
              id="agendamento-telefone"
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
              placeholder="(21) 99999-9999"
              maxLength={20}
              autoComplete="tel"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agendamento-obs">Observações (opcional)</Label>
            <Textarea
              id="agendamento-obs"
              value={observacoes}
              onChange={(evento) => setObservacoes(evento.target.value)}
              maxLength={300}
              rows={3}
            />
          </div>

          <Button type="submit" size="lg" disabled={criar.isPending}>
            {criar.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Confirmar agendamento
          </Button>
        </form>
      )}

      {passo > 0 && (
        <Button variant="ghost" className="mt-6" onClick={() => setPasso((atual) => atual - 1)}>
          Voltar
        </Button>
      )}
    </div>
  );
}