Sr. Barbeiro — Site e Sistema de Agendamento

Site institucional e sistema de agendamento online para a barbearia Sr. Barbeiro, em Campo Grande, Rio de Janeiro. Desenvolvido por Guilhermy Deveza.

🔗 Site publicado: https://sr-barbeiro.vercel.app/

Sobre o projeto

Site completo com agendamento online, substituindo o agendamento manual por mensagem. Clientes escolhem serviço, barbeiro, data e horário diretamente pelo site, 24 horas por dia, sem precisar de cadastro obrigatório.

O sistema conta com três níveis de acesso — cliente, funcionário (barbeiro) e administrador — cada um com seu próprio painel e permissões específicas.

Funcionalidades
Página institucional: apresentação da barbearia, serviços, galeria, avaliações e localização.
Agendamento online: fluxo guiado (serviço → barbeiro → data/horário → confirmação), com opção de agendar sem criar conta (apenas nome e telefone).
Autenticação: cadastro e login por e-mail e senha, com indicador de força de senha e recuperação de senha por e-mail.
Painel do cliente: visualização e cancelamento dos próprios agendamentos.
Painel do funcionário: agenda pessoal, atualização de status dos atendimentos e bloqueio de horários.
Painel do administrador: gestão de serviços e preços, cadastro de barbeiros, moderação de avaliações e indicadores gerais.
Notificações internas: barbeiro e administrador são notificados automaticamente a cada novo agendamento, cancelamento ou remarcação.
Prevenção de conflito de horário: garantida diretamente no banco de dados (constraint de exclusão), impedindo dois agendamentos simultâneos para o mesmo barbeiro.
Stack técnica
Frontend: React, Vite, TypeScript, Tailwind CSS
Backend: Supabase (Lovable Cloud) — banco de dados Postgres, autenticação e Row Level Security (RLS)
Deploy: Vercel
Desenvolvimento assistido por: Lovable
Estrutura do projeto
src/
├── routes/          # Páginas e rotas (login, painéis, agendamento)
├── components/      # Componentes reutilizáveis de UI
├── lib/             # Utilitários e configuração de assets/imagens
└── assets/          # Imagens e logo do projeto

supabase/
└── migrations/      # Histórico de migrations do banco de dados (schema, RLS, funções)
Segurança
Row Level Security (RLS) habilitado em todas as tabelas do banco de dados.
Papéis de acesso (administrador, funcionario, cliente) controlados por uma tabela dedicada, nunca autoatribuíveis pela aplicação.
Funções auxiliares (is_admin, is_barbeiro_of) usadas nas políticas de RLS, com permissões de execução auditadas.
Regra de projeto: toda nova migration que criar ou alterar tabelas/funções deve incluir os GRANTs necessários, evitando regressões de permissão.
Rodando localmente
bash
npm install
npm run dev

Crie um arquivo .env na raiz do projeto com as variáveis de ambiente do Supabase (ver .env.example, se disponível, ou solicitar ao responsável pelo projeto).

Pendências conhecidas
Notificação por WhatsApp: ainda não implementada. Requer integração com um provedor externo (Meta WhatsApp Cloud API ou Twilio). Ver docs/integracao-whatsapp.md para o planejamento técnico.
E-mails transacionais: atualmente usando o serviço padrão do Supabase (sujeito a cair em spam). Recomenda-se configurar um provedor de SMTP próprio (ex: Resend) ao definir o domínio final do site.
Domínio próprio: o site ainda está publicado em subdomínio da Vercel; a migração para um domínio próprio (ex: srbarbeiro.com.br) está pendente.
Licença

Projeto proprietário, desenvolvido sob demanda para a barbearia Sr. Barbeiro. Todos os direitos reservados.
