-- Retorna somente os intervalos ocupados (agendamentos ativos + bloqueios),
-- sem qualquer dado pessoal, para montar o calendario publico.
CREATE OR REPLACE FUNCTION public.horarios_ocupados(_barbeiro_id UUID, _data DATE)
RETURNS TABLE (hora_inicio TIME, hora_fim TIME)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.hora_inicio, a.hora_fim
  FROM public.agendamentos a
  WHERE a.barbeiro_id = _barbeiro_id
    AND a.data = _data
    AND a.status IN ('pendente','confirmado','concluido')
  UNION ALL
  SELECT b.hora_inicio, b.hora_fim
  FROM public.bloqueios b
  WHERE b.barbeiro_id = _barbeiro_id
    AND b.data = _data;
$$;

GRANT EXECUTE ON FUNCTION public.horarios_ocupados(UUID, DATE) TO anon, authenticated;

-- Estas funcoes existem apenas para uso interno das policies de RLS.
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_barbeiro_of(UUID) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notificar_agendamento() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;