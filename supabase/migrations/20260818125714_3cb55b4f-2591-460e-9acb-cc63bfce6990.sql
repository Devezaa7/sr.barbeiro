INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'administrador'::public.app_role
FROM auth.users u
WHERE u.email = 'guilhermydeveza33@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;