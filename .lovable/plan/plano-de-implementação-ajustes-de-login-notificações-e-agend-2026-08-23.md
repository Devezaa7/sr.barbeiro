# Plano de Implementação - Ajustes de Login, Notificações e Agenda

Este plano descreve as alterações técnicas para remover o login social, implementar o indicador visual de notificações e confirmar as regras de negócio da agenda.

## Alterações Técnicas

### 1. Autenticação (Remover Google OAuth)
- **Arquivo:** `src/routes/auth.tsx`
  - Remover o botão "Entrar com Google" e a seção divisora ("ou").
  - Remover a função `entrarComGoogle` e os estados relacionados (`usarBroker`).
  - Ajustar o layout para centralizar o formulário de e-mail e senha.
- **Arquivo:** `src/lib/oauth.ts` (Opcional)
  - Manter o arquivo por enquanto para evitar quebras de importação, mas marcar como legado ou remover se não houver outras dependências.

### 2. Notificações Visuais (Admin e Barbeiro)
- **Novo Componente:** `src/components/notificacoes/IndicadorNotificacoes.tsx`
  - Criar um componente de sino (ícone) com um contador de notificações não lidas.
  - Implementar uma lista suspensa (Popover ou Dropdown) para visualizar as notificações recentes.
  - Adicionar funcionalidade para "marcar como lida" ao clicar ou visualizar.
- **Arquivo:** `src/components/painel/LayoutPainel.tsx`
  - Inserir o `IndicadorNotificacoes` no cabeçalho do painel, ao lado do botão de sair.
- **Segurança:** O componente filtrará notificações destinadas ao usuário logado ou ao administrador (conforme regras de RLS existentes).

### 3. Agenda e Calendário
- **Verificação:** `src/lib/consultas.ts` e `src/lib/agenda.ts`
  - Confirmar que a função `agendaDoDiaQuery` utiliza `supabase.rpc("horarios_ocupados")`.
  - Confirmar que `calcularSlotsDisponiveis` descarta horários que conflitam com `ocupados`.
- **Resultado:** A lógica atual já implementa o solicitado. Nenhuma alteração de código necessária, apenas validação da eficácia visual no frontend (que já utiliza os `slots` calculados).

### 4. Documentação de Integração (WhatsApp)
- Não haverá implementação de código para WhatsApp.
- Os detalhes técnicos sobre a integração futura (Meta Cloud API, Twilio, Edge Functions) serão registrados em um novo arquivo `docs/integracao-whatsapp.md` para referência do cliente.

## Análise de Segurança e Qualidade
- As notificações seguem o isolamento por `auth.uid()`.
- A remoção do Google OAuth simplifica o fluxo de autenticação e reduz a dependência de provedores externos.
- A lógica de agenda previne "double-booking" tanto no frontend (ocultando horários) quanto no banco (via restrições EXCLUDE).
