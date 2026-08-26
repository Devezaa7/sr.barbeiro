# Integração Futura com WhatsApp - Sr. Barbeiro

Este documento descreve os passos técnicos necessários para implementar o envio automático de notificações via WhatsApp, uma funcionalidade solicitada para o futuro.

## 1. Escolha do Provedor

Para um pequeno negócio, existem duas abordagens principais:

### Opção A: API Oficial (Meta Cloud API / Twilio) - **Recomendado**
- **Vantagens:** Oficial, estável, menos risco de banimento.
- **Desvantagens:** Requer verificação de empresa (CNPJ), aprovação prévia de modelos de mensagem (templates) pela Meta, e custo por mensagem.
- **Provedores:** Twilio, MessageBird ou integração direta com a Meta.

### Opção B: Provedores Não Oficiais (Z-API, Evolution API)
- **Vantagens:** Mais barato, permite enviar qualquer texto livremente sem aprovação de template.
- **Desvantagens:** Risco de banimento do número se usado incorretamente, requer manter um celular conectado (sessão web).

## 2. Fluxo de Implementação no Supabase

Atualmente, o sistema usa **Triggers (Gatilhos)** no banco de dados para criar notificações internas. Para o WhatsApp, o fluxo seria:

1.  **Gatilho no Banco:** Quando um registro é inserido ou alterado na tabela `agendamentos`.
2.  **Edge Function:** O gatilho dispara uma requisição para uma *Supabase Edge Function* (ex: `supabase/functions/enviar-whatsapp`).
3.  **Chamada de API:** A Edge Function utiliza uma *Secret Key* (armazenada de forma segura) para chamar a API do provedor escolhido.

### Exemplo de código da Edge Function:

```typescript
// Exemplo conceitual para Twilio
Deno.serve(async (req) => {
  const { agendamento } = await req.json();
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: `whatsapp:${agendamento.cliente_telefone}`,
      From: 'whatsapp:+1234567890',
      Body: `Olá ${agendamento.cliente_nome}, seu horário na Sr. Barbeiro está confirmado para ${agendamento.data} às ${agendamento.hora_inicio}!`,
    }),
  });

  return new Response(JSON.stringify({ success: response.ok }), { status: response.status });
});
```

## 3. Próximos Passos
1. Criar conta no provedor (ex: Twilio).
2. Obter um número de telefone dedicado para o bot.
3. Verificar a empresa no Gerenciador de Negócios da Meta.
4. Desenvolver e publicar a Edge Function no Supabase.
5. Configurar o Webhook/Trigger no banco de dados para chamar a função.
