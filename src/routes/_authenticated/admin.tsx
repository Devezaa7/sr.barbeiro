import { createFileRoute, redirect } from "@tanstack/react-router";

import { PainelAgendamentos } from "@/components/painel/PainelAgendamentos";
import { PainelBarbeiros } from "@/components/painel/PainelBarbeiros";
import { PainelIndicadores } from "@/components/painel/PainelIndicadores";
import { PainelServicos } from "@/components/painel/PainelServicos";
import { PainelUsuarios } from "@/components/painel/PainelUsuarios";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { temPapel, useSessao } from "@/hooks/useSessao";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw redirect({ to: "/auth" });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
    if (roleError || !isAdmin) {
      throw redirect({ to: "/minha-conta" });
    }

    return { user };
  },
  head: () => ({
    meta: [
      { title: "Painel administrativo | Sr. Barbeiro" },
      {
        name: "description",
        content: "Gestão de agendamentos, serviços e equipe da Sr. Barbeiro.",
      },
      { property: "og:title", content: "Painel administrativo | Sr. Barbeiro" },
      { property: "og:description", content: "Gestão completa da barbearia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelAdmin,
});

function PainelAdmin() {
  const { papeis, carregando } = useSessao();
  const ehAdmin = temPapel(papeis, "administrador");

  if (carregando) {
    return (
      <LayoutPainel titulo="Painel administrativo" descricao="Carregando suas permissões…">
        <div className="h-40 animate-pulse rounded-md bg-muted" />
      </LayoutPainel>
    );
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
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
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
        <TabsContent value="usuarios" className="mt-6">
          <PainelUsuarios />
        </TabsContent>
        <TabsContent value="indicadores" className="mt-6">
          <PainelIndicadores />
        </TabsContent>
      </Tabs>
    </LayoutPainel>
  );
}
