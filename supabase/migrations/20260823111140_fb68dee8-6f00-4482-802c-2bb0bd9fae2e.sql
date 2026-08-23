-- Esta migration atua como uma varredura de segurança final para garantir que nenhum GRANT foi omitido.
-- Ela segue a nova regra de projeto: toda migration deve ser autossuficiente em permissões.

-- 1. TABELAS (Permissões de leitura pública e escrita autenticada)
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

-- 2. FUNÇÕES (Permissões de execução para RLS e API)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_barbeiro_of(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.horarios_ocupados(uuid, date) TO anon, authenticated;

-- 3. SEQUÊNCIAS (Se houver SERIAL/IDENTITY que anon precise inserir, como em agendamentos se não usar UUID)
-- (Neste projeto usamos UUIDs, então GRANTS em sequências não são estritamente necessários agora, mas fica o registro)

-- 4. service_role (Admin total)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
