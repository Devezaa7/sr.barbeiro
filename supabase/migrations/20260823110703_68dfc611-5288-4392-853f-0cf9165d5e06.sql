-- A regressão das permissões ocorreu porque, embora as tabelas e funções tenham sido recriadas ou alteradas em migrations recentes, 
-- os GRANTS (que não são padrão no Supabase para o schema public) não foram incluídos em todas as migrations subsequentes que tocaram nesses objetos.
-- Esta migration restaura todos os acessos necessários para o funcionamento do site (visitantes) e painéis (usuários logados).

-- GRANTS para tabelas (Necessários para o PostgREST acessar via API)
GRANT SELECT ON public.servicos TO anon, authenticated;
GRANT SELECT ON public.barbeiros TO anon, authenticated;
GRANT SELECT ON public.avaliacoes TO anon, authenticated;
GRANT SELECT ON public.horarios_disponibilidade TO anon, authenticated;
GRANT SELECT ON public.bloqueios TO anon, authenticated;
GRANT SELECT, INSERT ON public.agendamentos TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, UPDATE ON public.notificacoes TO authenticated;
GRANT INSERT ON public.avaliacoes TO authenticated;
GRANT UPDATE ON public.agendamentos TO authenticated;

-- GRANT ALL para service_role em todas as tabelas (boa prática para edge functions/admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- GRANTS para funções (Necessários para RLS e Queries customizadas)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_barbeiro_of(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.horarios_ocupados(uuid, date) TO anon, authenticated;
