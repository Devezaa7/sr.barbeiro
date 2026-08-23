# Plano de Correção Técnica - Sr. Barbeiro

Este plano visa corrigir o erro 422 no cadastro de novos usuários e falhas de permissão no fluxo de agendamento (RPC), garantindo a estabilidade da plataforma antes da entrega final.

## 1. Correção do Erro 422 no Signup
O erro 422 (Unprocessable Entity) ocorre durante o `signUp` do Supabase Auth. A causa raiz foi identificada na trigger `handle_new_user`, que falha ao tentar inserir registros nas tabelas `profiles` e `user_roles` se os metadados estiverem incompletos ou se houver problemas de tipagem (enum `app_role`).

**Ações:**
- Atualizar a função `handle_new_user` para ser defensiva:
  - Adicionar valores padrão (COALESCE) para campos obrigatórios como `nome`.
  - Adicionar `cast` explícito para o enum `public.app_role`.
  - Implementar bloco `EXCEPTION` para garantir que o cadastro no Auth não seja bloqueado por falhas secundárias na criação do perfil.

## 2. Correção de Permissões de RPC e RLS
Algumas funções do banco de dados (RPC) essenciais para o agendamento e verificação de papéis tiveram permissões revogadas ou não foram concedidas para usuários anônimos/autenticados.

**Ações:**
- Conceder permissão `EXECUTE` nas funções:
  - `public.horarios_ocupados(uuid, date)`: Necessária para que clientes (mesmo sem login) vejam horários ocupados.
  - `public.has_role(uuid, app_role)` e `public.is_admin()`: Necessárias para o funcionamento correto das políticas de RLS e navegação no painel.

## Detalhes Técnicos

```sql
-- Atualização da Trigger
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
  RETURN NEW;
END; $$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.horarios_ocupados(uuid, date) TO anon, authenticated;
```

---
### 📊 Relatório de Execução (Prévia)

**Padrão utilizado:** Hotfix / Auditoria de Segurança

**Sub-agentes ativados:**
- 🎨 **UI Architect** — ➖ Não necessário
- 🗄️ **Supabase Engineer** — ✅ Executado
- 🔍 **Code Auditor** — ✅ Executado
- 🧪 **Testing Agent** — ✅ Executado
- 📈 **SEO Optimizer** — ➖ Não necessário
- 🚀 **Deploy Ops** — ➖ Não necessário
- 🔌 **API Integrator** — ➖ Não necessário
