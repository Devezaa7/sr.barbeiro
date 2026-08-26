Sr. Barbeiro

Sistema web para agendamento de serviços da Sr. Barbeiro, com área para clientes, agenda de barbeiros e painel administrativo.

Funcionalidades

•
Agendamento de serviços com nome e telefone.

•
Cadastro e login por e-mail e senha.

•
Confirmação de e-mail e recuperação de senha.

•
Área do cliente com histórico de agendamentos.

•
Área do barbeiro com agenda, status dos atendimentos e bloqueio de horários.

•
Painel administrativo para gerenciar agendamentos, serviços, usuários e equipe.

•
Aprovação ou bloqueio de acesso de barbeiros.

•
Convite de barbeiros por e-mail através de uma Supabase Edge Function.

Tecnologias

•
React e TypeScript.

•
Vite e TanStack Router/Start.

•
Supabase Auth, Postgres, Row Level Security e Edge Functions.

•
Tailwind CSS e componentes UI reutilizáveis.

•
Vercel para hospedagem da aplicação.

Desenvolvimento local

Requisitos: Node.js 20 ou superior e npm.

Bash


npm install
npm run dev



A aplicação local normalmente estará disponível em:

Plain Text


http://localhost:8080



Variáveis de ambiente

Crie um arquivo .env na raiz do projeto. Nunca publique esse arquivo no GitHub.

Plain Text


VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_APP_URL=http://localhost:8080



As variáveis de produção devem ser configuradas diretamente na hospedagem, como Vercel.

Rotas principais

Plain Text


/auth                  Login, cadastro e recuperação de senha
/redefinir-senha       Definição de nova senha
/admin                 Painel administrativo
/agenda                Agenda do barbeiro
/minha-conta           Área do cliente



Supabase

A conta administrativa utiliza o papel administrador na tabela user_roles. Os papéis disponíveis são:

Plain Text


administrador
funcionario
cliente



As regras de autorização devem ser aplicadas pelas policies de Row Level Security do banco, e não somente pela interface.

Para publicar a função de convite de barbeiros:

Bash


npx supabase functions deploy convidar-barbeiro



A função usa a chave secreta somente no backend. Chaves sb_secret e service_role nunca devem ser colocadas em arquivos VITE_*, no frontend ou no GitHub.

URLs de autenticação

Em desenvolvimento:

Plain Text


http://localhost:8080/auth
http://localhost:8080/redefinir-senha



Em produção, substitua http://localhost:8080 pelo domínio oficial da aplicação e cadastre as URLs em Supabase → Authentication → URL Configuration.

A variável SITE_URL da Edge Function também deve apontar para o domínio de produção quando a aplicação estiver publicada.

Publicação

O deploy da aplicação é feito a partir da branch main. Antes de publicar, configure na plataforma de hospedagem:

•
VITE_SUPABASE_URL;

•
VITE_SUPABASE_PUBLISHABLE_KEY;

•
VITE_APP_URL.

Depois de alterar variáveis de ambiente, faça um novo deploy para que o frontend seja recompilado.

Segurança

Não versione .env, tokens de acesso, chaves sb_secret ou SUPABASE_SERVICE_ROLE_KEY. O arquivo .env.example deve conter somente nomes de variáveis e exemplos sem credenciais reais.

