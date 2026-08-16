ALTER TABLE public.agendamentos
  ADD CONSTRAINT agendamentos_cliente_nome_valido
    CHECK (char_length(btrim(cliente_nome)) BETWEEN 3 AND 100),
  ADD CONSTRAINT agendamentos_cliente_telefone_valido
    CHECK (btrim(cliente_telefone) ~ '^[0-9()+\-\s]{10,20}$'),
  ADD CONSTRAINT agendamentos_observacoes_tamanho
    CHECK (observacoes IS NULL OR char_length(observacoes) <= 300),
  ADD CONSTRAINT agendamentos_intervalo_valido
    CHECK (hora_fim > hora_inicio);

CREATE OR REPLACE FUNCTION public.normalizar_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.cliente_nome := btrim(NEW.cliente_nome);
  NEW.cliente_telefone := btrim(NEW.cliente_telefone);
  IF NEW.observacoes IS NOT NULL THEN
    NEW.observacoes := NULLIF(btrim(NEW.observacoes), '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalizar_agendamento ON public.agendamentos;
CREATE TRIGGER trg_normalizar_agendamento
  BEFORE INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.normalizar_agendamento();

ALTER TABLE public.bloqueios
  ADD CONSTRAINT bloqueios_intervalo_valido CHECK (hora_fim > hora_inicio),
  ADD CONSTRAINT bloqueios_motivo_tamanho CHECK (motivo IS NULL OR char_length(motivo) <= 200);