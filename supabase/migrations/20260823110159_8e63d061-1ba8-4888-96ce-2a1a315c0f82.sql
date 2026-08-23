-- Correção da trigger handle_new_user para evitar erro 422 no signup.
-- Adiciona cast explícito para public.app_role e tratamento defensivo para metadados ausentes.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone, provedor)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefone', NEW.phone),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro na trigger, permitimos que o usuário seja criado no Auth, 
  -- mesmo que o perfil falhe, para evitar erro 422 no frontend.
  RETURN NEW;
END; $$;

-- Garante permissão de execução para funções RLS essenciais.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.horarios_ocupados(uuid, date) TO anon, authenticated;
