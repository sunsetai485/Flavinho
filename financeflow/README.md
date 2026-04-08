# FinanceFlow Pro

Sistema financeiro robusto com dashboard de gestão, projeções e análise inteligente de gastos.

## Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Gráficos**: Chart.js + react-chartjs-2
- **Import**: PapaParse (CSV) + SheetJS (Excel)
- **Deploy**: Docker + EasyPanel

## Funcionalidades

- Dashboard com 3 abas: Dados Reais, Projeção Futura, Visão Consolidada
- KPIs: Total Recebido, Total Gasto, Saldo Líquido
- Gráficos interativos (Evolução do Saldo, Distribuição de Gastos, Entradas vs Saídas)
- Importação de CSV/Excel com parsing inteligente de colunas
- Classificação automática de despesas por categoria
- Detecção automática de contas recorrentes
- Metas de orçamento por categoria com barra de progresso
- Projeções financeiras com filtros por ano/mês
- Dark mode
- Exportação para PDF
- Autenticação com e-mail e senha
- Row Level Security (cada usuário vê apenas seus dados)

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá no **SQL Editor** e execute o conteúdo de `supabase/migrations/001_initial.sql`
3. Copie as credenciais em **Settings > API**

### 2. Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Preencha com seus dados:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 3. Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### 4. Build para Produção

```bash
npm run build
npm start
```

## Deploy no EasyPanel

O repositório tem um **`Dockerfile` na raiz** (não só em `financeflow/`), para o build encontrar o arquivo quando o contexto é o clone inteiro do GitHub.

### Opção 1: Via GitHub (Recomendado)

1. Suba o código para um repositório GitHub
2. No EasyPanel, crie um novo serviço **App**
3. Conecte com seu repositório GitHub
4. Deixe o caminho do Dockerfile como **`Dockerfile`** (raiz) ou vazio/padrão
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. O EasyPanel detecta automaticamente o `Dockerfile`
6. Configure a porta como `3000`

### Opção 2: Via Docker Compose

1. Copie o `docker-compose.yml` para seu servidor
2. Crie o arquivo `.env` com as variáveis
3. Execute:

```bash
docker compose up -d
```

### Configuração no EasyPanel

1. **Build Args**: Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` como build arguments
2. **Porta**: 3000
3. **Healthcheck**: GET http://localhost:3000
4. **Domínio**: Configure seu domínio personalizado nas configurações do serviço

## Estrutura do Projeto

```
financeflow/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── transactions/       # CRUD transações
│   │   │   ├── projections/        # CRUD projeções
│   │   │   ├── budget-goals/       # CRUD metas
│   │   │   ├── categories/         # Categorias
│   │   │   ├── dashboard/          # Dados agregados
│   │   │   └── import/             # Upload de arquivos
│   │   ├── login/                  # Página de login
│   │   ├── dashboard/              # Dashboard principal
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/                 # Componentes React
│   │   ├── Navbar.tsx
│   │   ├── KPICards.tsx
│   │   ├── Charts.tsx
│   │   ├── TransactionsTable.tsx
│   │   ├── ProjectionsTable.tsx
│   │   ├── RecurringList.tsx
│   │   ├── BudgetGoals.tsx
│   │   ├── MonthFilter.tsx
│   │   └── StatusMessage.tsx
│   ├── lib/                        # Utilitários
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── api-client.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql         # SQL para criar tabelas
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## Tabelas do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `categories` | Categorias de transações (criadas automaticamente por usuário) |
| `transactions` | Transações reais importadas do extrato bancário |
| `projected_transactions` | Projeções financeiras futuras |
| `budget_goals` | Metas de orçamento por categoria |
| `recurring_transactions` | Transações recorrentes detectadas |
| `import_history` | Histórico de importações de arquivos |

Todas as tabelas possuem **Row Level Security (RLS)** habilitado - cada usuário acessa apenas seus próprios dados.
