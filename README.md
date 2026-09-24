# Sistema de Controle de Chamados Internos ou SICCI

Sistema web para abertura, acompanhamento e distribuição de chamados internos de uma empresa.

## Tecnologias

- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- MySQL 8+
- React 19
- Vite
- Tailwind CSS
- PHPUnit
- Cypress

## Arquitetura

O projeto utiliza um único repositório com backend e frontend separados:

```text
.
├── backend/    # API REST em Laravel
├── frontend/   # Aplicação React
└── tests/      # Testes automatizados end-to-end
```

O backend concentra autenticação, validações, regras de negócio e acesso ao banco de dados. O frontend consome a API REST e é responsável pela experiência de uso. A API utiliza o prefixo `/api/v1` para facilitar a evolução dos contratos.

## Requisitos

Instale os seguintes softwares antes de iniciar:

- PHP 8.2 ou superior
- Composer 2+
- Node.js 20 ou superior
- npm 10 ou superior
- MySQL 8 ou superior

No Windows com XAMPP, certifique-se de que as extensões `openssl`, `mbstring`, `pdo_mysql` e `zip` estejam habilitadas no `php.ini` utilizado pelo PHP CLI.

## Instalação

Clone o repositório e acesse a pasta do projeto:

```powershell
git clone <URL_DO_REPOSITORIO>
cd SistemaDeControleDeChamadosInternos
```

### Backend

Instale as dependências PHP:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE internalcallcontrolsystem
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;
```

Configure as credenciais no arquivo `backend/.env`:

```dotenv
APP_NAME="Sistema de Controle de Chamados Internos"
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=internalcallcontrolsystem
DB_USERNAME=root
DB_PASSWORD=
```

Execute as migrations e os seeders:

```powershell
php artisan migrate --seed
```

### Frontend

Em outro terminal, instale as dependências do frontend:

```powershell
cd frontend
npm install
```

Configure a URL da API no arquivo `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

## Execução

Inicie o backend:

```powershell
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

Inicie o frontend em outro terminal:

```powershell
cd frontend
npm run dev
```

A aplicação ficará disponível em:

- Frontend: http://localhost:5173/login
- Dashboard: http://localhost:5173/dashboard
- Listagem de chamados: http://localhost:5173/chamados
- Novo chamado: http://localhost:5173/chamados/novo
- Backend: http://127.0.0.1:8000
- API: http://127.0.0.1:8000/api/v1

As telas de detalhes e edição usam os identificadores dos chamados:

```text
http://localhost:5173/chamados/{id}
http://localhost:5173/chamados/{id}/editar
```

## Funcionalidades

- Autenticação de usuários com Laravel Sanctum.
- Cadastro, edição, listagem e visualização de chamados.
- Controle de título, descrição, prioridade, status, responsável e data de abertura.
- Busca, filtros e ordenação na listagem de chamados.
- Atribuição manual de chamados a um atendente.
- Atribuição automática ao atendente com menor quantidade de chamados em aberto.
- Acompanhamento do status dos chamados.
- Controle de acesso por perfil de usuário.

## Perfis de usuário

### Solicitante

- Abre novos chamados.
- Visualiza e acompanha os próprios chamados.
- Consulta o status das solicitações realizadas.

### Atendente

- Visualiza todos os chamados.
- Atualiza status, prioridade e informações de atendimento.
- Assume chamados manualmente.
- Utiliza a distribuição automática de chamados.

Os atendentes disponíveis são cadastrados por seeders, sem necessidade de uma tela administrativa para cadastro de responsáveis.

### Credenciais de desenvolvimento

As contas abaixo são criadas pelo seeder padrão. Todas utilizam a senha `password`:

| Perfil | E-mail |
| --- | --- |
| Solicitante | `joao.silva@example.com` |
| Atendente | `ana.souza@example.com` |
| Atendente | `bruno.lima@example.com` |
| Atendente | `carla.mendes@example.com` |

## Regras de negócio

- As prioridades disponíveis são `baixa`, `média`, `alta` e `crítica`.
- Os status disponíveis são `aberto`, `em andamento`, `resolvido` e `fechado`.
- Chamados com status `aberto` ou `em andamento` são considerados em aberto para a distribuição automática.
- Chamados `resolvidos` ou `fechados` não entram na contagem de carga dos atendentes.
- Em caso de empate na distribuição automática, o atendente com menos chamados em andamento há mais tempo é priorizado.
- Todos os campos de entrada possuem limites mínimo e máximo definidos no frontend e validados novamente no backend.
- Elementos interativos possuem atributos `data-cy` para identificação nos testes automatizados com Cypress.

## API

Os endpoints principais seguem o padrão REST:

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Autentica um usuário |
| `POST` | `/api/v1/auth/logout` | Encerra a sessão autenticada |
| `GET` | `/api/v1/auth/me` | Retorna o usuário autenticado |
| `GET` | `/api/v1/dashboard` | Retorna contagens por status e chamados recentes |
| `GET` | `/api/v1/tickets` | Lista chamados |
| `POST` | `/api/v1/tickets` | Cria um chamado |
| `GET` | `/api/v1/tickets/{id}` | Exibe um chamado |
| `PUT` | `/api/v1/tickets/{id}` | Atualiza um chamado |
| `DELETE` | `/api/v1/tickets/{id}` | Remove um chamado |
| `GET` | `/api/v1/attendants` | Lista responsáveis disponíveis |
| `GET` | `/api/v1/tickets/assignment/preview` | Exibe o responsável recomendado |

Para realizar login, envie `email` e `password` para `/api/v1/auth/login`. O endpoint retorna um token Bearer e os dados do usuário autenticado.

As rotas protegidas exigem um token Sanctum no cabeçalho `Authorization`:

```text
Authorization: Bearer {token}
```

## Testes e qualidade

Backend:

```powershell
cd backend
php artisan test
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Os testes de interface são executados com Cypress após a inicialização do backend e do frontend.

Para executar os testes automatizados end-to-end os passos são o seguinte:
```powershell
cd test
npm install
npx cypress open
```
Com o cypress instalado, irá abrir um novo aplicativo na barra de tarefa referente ao cypress, então clique em "E2E Testing", escolha o browser de sua preferência e clique em "Start E2E Testing in ...", por último escolha a spec "AllSpecs" que contém todos os testes automatizados.  

## Decisões técnicas

- Laravel foi escolhido por oferecer uma estrutura completa para API, autenticação, validação, migrations, seeders e testes.
- React com Vite reduz o tempo de inicialização e mantém o frontend independente do backend.
- A comunicação REST separa as responsabilidades e permite que o frontend evolua sem acoplamento às views do Laravel.
- MySQL foi adotado como banco relacional da aplicação.
- Sanctum fornece autenticação adequada para a API e permite proteger as operações por usuário autenticado.
- A atribuição automática é calculada no backend para garantir consistência, independentemente do cliente que consuma a API.
- A validação é duplicada no frontend e no backend para melhorar a experiência do usuário sem abrir mão da segurança da API.