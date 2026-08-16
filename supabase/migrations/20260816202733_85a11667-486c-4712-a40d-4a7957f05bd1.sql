-- 1) Bloqueios: remover leitura pública (dados internos de equipe)
DROP POLICY IF EXISTS bloqueios_public_read ON public.bloqueios;
CREATE POLICY bloqueios_select_interno ON public.bloqueios
  FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_barbeiro_of(barbeiro_id));

-- 2) Revogar escrita do papel anônimo, exceto criação de agendamento
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.servicos FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.barbeiros FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.horarios_disponibilidade FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.bloqueios FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.notificacoes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.avaliacoes FROM anon;
REVOKE UPDATE, DELETE ON public.agendamentos FROM anon;
REVOKE SELECT ON public.bloqueios FROM anon;

-- 3) Revogar DELETE de tabelas que o app nunca apaga
REVOKE DELETE ON public.profiles FROM authenticated;
REVOKE DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.notificacoes FROM authenticated;
GRANT UPDATE ON public.notificacoes TO authenticated;