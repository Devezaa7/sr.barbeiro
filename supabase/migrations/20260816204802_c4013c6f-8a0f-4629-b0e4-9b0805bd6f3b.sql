REVOKE INSERT, UPDATE ON public.user_roles FROM authenticated;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.notificacoes FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE INSERT ON public.agendamentos FROM anon;
GRANT INSERT ON public.agendamentos TO anon;