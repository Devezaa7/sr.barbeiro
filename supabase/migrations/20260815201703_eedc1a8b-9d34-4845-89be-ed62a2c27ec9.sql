-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('administrador', 'funcionario', 'cliente');
CREATE TYPE public.agendamento_status AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE public.notificacao_tipo AS ENUM ('novo_agendamento', 'cancelamento', 'reagendamento');

-- =============== UTIL ===============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  telefone TEXT,
  email TEXT,
  provedor TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== USER ROLES ===============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'administrador');
$$;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Auto-create profile + default cliente role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone, provedor)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefone', NEW.phone),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============== SERVICOS ===============
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL DEFAULT 30 CHECK (duracao_minutos > 0),
  preco NUMERIC(10,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.servicos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos TO authenticated;
GRANT ALL ON public.servicos TO service_role;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "servicos_public_read" ON public.servicos FOR SELECT TO anon, authenticated USING (ativo = true OR public.is_admin());
CREATE POLICY "servicos_admin_write" ON public.servicos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_servicos_updated BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== BARBEIROS ===============
CREATE TABLE public.barbeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  especialidades TEXT,
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.barbeiros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.barbeiros TO authenticated;
GRANT ALL ON public.barbeiros TO service_role;
ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_barbeiros_profile ON public.barbeiros(profile_id);
CREATE POLICY "barbeiros_public_read" ON public.barbeiros FOR SELECT TO anon, authenticated USING (ativo = true OR public.is_admin() OR profile_id = auth.uid());
CREATE POLICY "barbeiros_admin_write" ON public.barbeiros FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_barbeiros_updated BEFORE UPDATE ON public.barbeiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_barbeiro_of(_barbeiro_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.barbeiros WHERE id = _barbeiro_id AND profile_id = auth.uid());
$$;

-- =============== HORARIOS DISPONIBILIDADE ===============
CREATE TABLE public.horarios_disponibilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.horarios_disponibilidade TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horarios_disponibilidade TO authenticated;
GRANT ALL ON public.horarios_disponibilidade TO service_role;
ALTER TABLE public.horarios_disponibilidade ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_horarios_barbeiro ON public.horarios_disponibilidade(barbeiro_id);
CREATE POLICY "horarios_public_read" ON public.horarios_disponibilidade FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "horarios_manage" ON public.horarios_disponibilidade FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_barbeiro_of(barbeiro_id))
  WITH CHECK (public.is_admin() OR public.is_barbeiro_of(barbeiro_id));

-- =============== BLOQUEIOS ===============
CREATE TABLE public.bloqueios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbeiro_id UUID REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bloqueios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloqueios TO authenticated;
GRANT ALL ON public.bloqueios TO service_role;
ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bloqueios_barbeiro_data ON public.bloqueios(barbeiro_id, data);
CREATE POLICY "bloqueios_public_read" ON public.bloqueios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bloqueios_manage" ON public.bloqueios FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_barbeiro_of(barbeiro_id))
  WITH CHECK (public.is_admin() OR public.is_barbeiro_of(barbeiro_id));

-- =============== AGENDAMENTOS ===============
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  barbeiro_id UUID NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status public.agendamento_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (hora_fim > hora_inicio)
);
GRANT SELECT, INSERT ON public.agendamentos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO authenticated;
GRANT ALL ON public.agendamentos TO service_role;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_agendamentos_barbeiro_data ON public.agendamentos(barbeiro_id, data);
CREATE INDEX idx_agendamentos_cliente ON public.agendamentos(cliente_id);

-- Impede dois agendamentos ativos para o mesmo barbeiro no mesmo intervalo
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE public.agendamentos ADD CONSTRAINT agendamentos_sem_conflito
  EXCLUDE USING gist (
    barbeiro_id WITH =,
    data WITH =,
    tsrange(('2000-01-01'::date + hora_inicio), ('2000-01-01'::date + hora_fim)) WITH &&
  ) WHERE (status IN ('pendente','confirmado','concluido'));

CREATE POLICY "agendamentos_insert_publico" ON public.agendamentos FOR INSERT TO anon, authenticated
  WITH CHECK (cliente_id IS NULL OR cliente_id = auth.uid());
CREATE POLICY "agendamentos_select" ON public.agendamentos FOR SELECT TO authenticated
  USING (cliente_id = auth.uid() OR public.is_admin() OR public.is_barbeiro_of(barbeiro_id));
CREATE POLICY "agendamentos_update" ON public.agendamentos FOR UPDATE TO authenticated
  USING (cliente_id = auth.uid() OR public.is_admin() OR public.is_barbeiro_of(barbeiro_id))
  WITH CHECK (cliente_id = auth.uid() OR public.is_admin() OR public.is_barbeiro_of(barbeiro_id));
CREATE POLICY "agendamentos_delete_admin" ON public.agendamentos FOR DELETE TO authenticated
  USING (public.is_admin());
CREATE TRIGGER trg_agendamentos_updated BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== NOTIFICACOES ===============
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tipo public.notificacao_tipo NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notificacoes_destinatario ON public.notificacoes(destinatario_id, lida);
CREATE POLICY "notificacoes_select_own" ON public.notificacoes FOR SELECT TO authenticated
  USING (destinatario_id = auth.uid());
CREATE POLICY "notificacoes_update_own" ON public.notificacoes FOR UPDATE TO authenticated
  USING (destinatario_id = auth.uid()) WITH CHECK (destinatario_id = auth.uid());

-- Gera notificacoes para o barbeiro e para os administradores
CREATE OR REPLACE FUNCTION public.notificar_agendamento()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tipo public.notificacao_tipo;
  v_msg TEXT;
  v_barbeiro_profile UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_tipo := 'novo_agendamento';
    v_msg := 'Novo agendamento: ' || NEW.cliente_nome || ' em ' || to_char(NEW.data, 'DD/MM/YYYY') || ' as ' || to_char(NEW.hora_inicio, 'HH24:MI');
  ELSIF NEW.status = 'cancelado' AND OLD.status <> 'cancelado' THEN
    v_tipo := 'cancelamento';
    v_msg := 'Agendamento cancelado: ' || NEW.cliente_nome || ' em ' || to_char(NEW.data, 'DD/MM/YYYY') || ' as ' || to_char(NEW.hora_inicio, 'HH24:MI');
  ELSIF NEW.data <> OLD.data OR NEW.hora_inicio <> OLD.hora_inicio THEN
    v_tipo := 'reagendamento';
    v_msg := 'Agendamento remarcado: ' || NEW.cliente_nome || ' para ' || to_char(NEW.data, 'DD/MM/YYYY') || ' as ' || to_char(NEW.hora_inicio, 'HH24:MI');
  ELSE
    RETURN NEW;
  END IF;

  SELECT profile_id INTO v_barbeiro_profile FROM public.barbeiros WHERE id = NEW.barbeiro_id;
  IF v_barbeiro_profile IS NOT NULL THEN
    INSERT INTO public.notificacoes (destinatario_id, agendamento_id, tipo, mensagem)
    VALUES (v_barbeiro_profile, NEW.id, v_tipo, v_msg);
  END IF;

  INSERT INTO public.notificacoes (destinatario_id, agendamento_id, tipo, mensagem)
  SELECT ur.user_id, NEW.id, v_tipo, v_msg
  FROM public.user_roles ur
  WHERE ur.role = 'administrador' AND ur.user_id IS DISTINCT FROM v_barbeiro_profile;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_agendamentos_notificar AFTER INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.notificar_agendamento();

-- =============== AVALIACOES ===============
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  nome_exibicao TEXT,
  nota SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  publicada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.avaliacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avaliacoes_public_read" ON public.avaliacoes FOR SELECT TO anon, authenticated
  USING (publicada = true OR cliente_id = auth.uid() OR public.is_admin());
CREATE POLICY "avaliacoes_insert_own" ON public.avaliacoes FOR INSERT TO authenticated
  WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "avaliacoes_admin_write" ON public.avaliacoes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============== SEED ===============
INSERT INTO public.servicos (nome, descricao, duracao_minutos, preco, ordem) VALUES
  ('Corte masculino', 'Corte na tesoura ou maquina, com finalizacao.', 40, NULL, 1),
  ('Barba', 'Modelagem de barba com toalha quente e navalha.', 30, NULL, 2),
  ('Corte e barba', 'Combo completo de corte e barba.', 70, NULL, 3),
  ('Corte infantil', 'Atendimento para criancas, com paciencia e cuidado.', 40, NULL, 4),
  ('Sobrancelha', 'Alinhamento de sobrancelha masculina.', 15, NULL, 5);

INSERT INTO public.barbeiros (nome, especialidades, ativo) VALUES
  ('Equipe Sr. Barbeiro', 'Corte, barba e atendimento infantil', true);

INSERT INTO public.horarios_disponibilidade (barbeiro_id, dia_semana, hora_inicio, hora_fim)
SELECT b.id, d.dia, '09:00'::time, '20:00'::time
FROM public.barbeiros b, (VALUES (1),(2),(3),(4),(5)) AS d(dia)
WHERE b.nome = 'Equipe Sr. Barbeiro';

INSERT INTO public.horarios_disponibilidade (barbeiro_id, dia_semana, hora_inicio, hora_fim)
SELECT b.id, 6, '09:00'::time, '18:00'::time
FROM public.barbeiros b WHERE b.nome = 'Equipe Sr. Barbeiro';

INSERT INTO public.avaliacoes (nome_exibicao, nota, comentario, publicada) VALUES
  ('Cliente Google', 5, 'Atendimento impecavel e acabamento perfeito. Frequento desde 2021.', true),
  ('Cliente Google', 5, 'Ambiente climatizado, equipe atenciosa e sempre pontual no horario marcado.', true),
  ('Cliente Google', 5, 'Levo meu filho tambem, tratam a crianca muito bem. Recomendo.', true);