import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PainelAgendamentos } from "@/components/painel/PainelAgendamentos";
import { PainelBarbeiros } from "@/components/painel/PainelBarbeiros";
import { PainelIndicadores } from "@/components/painel/PainelIndicadores";
import { PainelServicos } from "@/components/painel/PainelServicos";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | Sr. Barbeiro" },
      { name: "description", content: "Gestão de agendamentos, serviços e equipe da Sr. Barbeiro." },
      { property: "og:title", content: "Painel administrativo | Sr. Barbeiro" },
      { property: "og:description", content: "Gestão completa da barbearia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelAdmin,
});

function PainelAdmin() {
  const { user, carregando } = useSessao();

  // A autorização real está nas policies do banco; aqui apenas ajustamos a UI.
  const { data: ehAdmin, isLoading } = useQuery({
    queryKey: ["sou-admin", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "administrador")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
  });

  if (carregando || isLoading) {
    return <LayoutPainel titulo="Painel" descricao="Carregando…" children={null} />;
  }

  if (!ehAdmin) {
    return (
      <LayoutPainel titulo="Acesso restrito" descricao="Área exclusiva do administrador">
        <p className="text-sm text-muted-foreground">
          Sua conta não tem permissão de administrador. Se isso está errado, peça ao responsável pela
          barbearia para atribuir o papel de administrador ao seu usuário.
        </p>
      </LayoutPainel>
    );
  }

  return (
    <LayoutPainel titulo="Painel administrativo" descricao="Agenda, serviços, equipe e indicadores">
      <Tabs defaultValue="agendamentos">
        <TabsList className="flex-wrap">
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="barbeiros">Equipe</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="agendamentos" className="mt-6">
          <PainelAgendamentos />
        </TabsContent>
        <TabsContent value="servicos" className="mt-6">
          <PainelServicos />
        </TabsContent>
        <TabsContent value="barbeiros" className="mt-6">
          <PainelBarbeiros />
        </TabsContent>
        <TabsContent value="indicadores" className="mt-6">
          <PainelIndicadores />
        </TabsContent>
      </Tabs>
    </LayoutPainel>
  );
}