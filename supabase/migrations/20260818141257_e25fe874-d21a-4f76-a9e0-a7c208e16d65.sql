-- Permite ao administrador conceder/remover APENAS o papel de funcionário.
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY user_roles_insert_funcionario
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND role = 'funcionario'::public.app_role);

CREATE POLICY user_roles_delete_funcionario
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin() AND role = 'funcionario'::public.app_role);