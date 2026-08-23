import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatarDataBR } from "@/lib/agenda";
import { mensagemAmigavel } from "@/lib/erros";

interface Notificacao {
  id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export function IndicadorNotificacoes() {
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async (): Promise<Notificacao[]> => {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("id, mensagem, lida, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);
      return data as Notificacao[];
    },
    // Atualiza a cada 2 minutos para manter o painel vivo
    refetchInterval: 2 * 60 * 1000,
  });

  const marcarLida = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
    onError: (erro) => toast.error(mensagemAmigavel(erro, "Não foi possível marcar como lida.")),
  });

  const naoLidas = notificacoes?.filter((n) => !n.lida).length ?? 0;

  return (
    <DropdownMenu open={aberto} onOpenChange={setAberto}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {naoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-border/70 p-4">
          <h3 className="font-display text-xs tracking-widest uppercase">Notificações</h3>
        </div>
        <ScrollArea className="h-80">
          {isLoading && (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && notificacoes?.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma notificação.</div>
          )}
          <div className="grid">
            {notificacoes?.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex items-start gap-3 border-b border-border/50 p-4 last:border-0 ${
                  !n.lida ? "bg-primary/5" : ""
                }`}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!n.lida) marcarLida.mutate(n.id);
                }}
              >
                <div className="mt-1 flex-1 text-xs leading-relaxed">
                  <p className={!n.lida ? "font-medium" : "text-muted-foreground"}>{n.mensagem}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!n.lida && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      marcarLida.mutate(n.id);
                    }}
                  >
                    <Check className="size-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
