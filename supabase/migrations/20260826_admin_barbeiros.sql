-- Fluxo de acesso de barbeiros: aprovação e convite administrativo.
-- Execute esta migration no Supabase antes de testar o painel.
-- Não contém senhas nem chaves secretas.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'administrador'::public.app_role
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.barbeiros enable row level security;

-- Cada usuário autenticado pode ler os próprios papéis; somente admin altera papéis.
drop policy if exists "user_roles_read_own_or_admin" on public.user_roles;
create policy "user_roles_read_own_or_admin"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_roles_admin_manage" on public.user_roles;
create policy "user_roles_admin_manage"
on public.user_roles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- O próprio usuário pode ler seu perfil; administradores podem ler e atualizar todos.
drop policy if exists "profiles_read_own_or_admin" on public.profiles;
create policy "profiles_read_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Administradores gerenciam a equipe; barbeiros leem somente o próprio registro.
drop policy if exists "barbeiros_admin_manage" on public.barbeiros;
create policy "barbeiros_admin_manage"
on public.barbeiros
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "barbeiros_read_own" on public.barbeiros;
create policy "barbeiros_read_own"
on public.barbeiros
for select
to authenticated
using (profile_id = auth.uid() or public.is_admin());

-- Proteção extra no banco: um usuário só pode ser membro da equipe por meio
-- do papel funcionario; a UI não é a camada de segurança.
-- A política de user_roles acima é a regra efetiva para aprovar/bloquear.
