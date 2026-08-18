GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_barbeiro_of(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notificar_agendamento() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.normalizar_agendamento() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS avaliacoes_insert_own ON public.avaliacoes;
CREATE POLICY avaliacoes_insert_own ON public.avaliacoes
  FOR INSERT TO authenticated
  WITH CHECK (cliente_id = auth.uid() AND publicada = false);