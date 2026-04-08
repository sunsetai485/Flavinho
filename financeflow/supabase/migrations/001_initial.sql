-- =============================================
-- FinanceFlow Pro - Database Schema
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- Tabela: categories (Categorias de transações)
-- =============================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text default '📦',
  color text default '#64748b',
  type text check (type in ('expense', 'income', 'both')) default 'expense',
  is_system boolean default false,
  created_at timestamptz default now() not null
);

create index idx_categories_user on public.categories(user_id);

-- =============================================
-- Tabela: transactions (Transações reais/executadas)
-- =============================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  credit numeric(15,2) default 0,
  debit numeric(15,2) default 0,
  balance numeric(15,2) default 0,
  is_recurring boolean default false,
  import_batch text,
  created_at timestamptz default now() not null
);

create index idx_transactions_user on public.transactions(user_id);
create index idx_transactions_date on public.transactions(user_id, date);
create index idx_transactions_category on public.transactions(category_id);
create index idx_transactions_batch on public.transactions(import_batch);

-- =============================================
-- Tabela: projected_transactions (Projeções futuras)
-- =============================================
create table public.projected_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  year integer not null,
  month text not null,
  type text check (type in ('receita', 'despesa')) not null,
  category text not null,
  description text not null,
  amount numeric(15,2) not null,
  projected_balance numeric(15,2) default 0,
  import_batch text,
  created_at timestamptz default now() not null
);

create index idx_projected_user on public.projected_transactions(user_id);
create index idx_projected_date on public.projected_transactions(user_id, year, month);

-- =============================================
-- Tabela: budget_goals (Metas de orçamento)
-- =============================================
create table public.budget_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_name text not null,
  monthly_limit numeric(15,2) not null,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, category_name)
);

create index idx_budget_goals_user on public.budget_goals(user_id);

-- =============================================
-- Tabela: recurring_transactions (Contas fixas detectadas)
-- =============================================
create table public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  category_name text not null,
  average_amount numeric(15,2) not null,
  frequency integer default 0,
  last_detected_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index idx_recurring_user on public.recurring_transactions(user_id);

-- =============================================
-- Tabela: import_history (Histórico de importações)
-- =============================================
create table public.import_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  file_type text not null,
  records_imported integer default 0,
  projections_imported integer default 0,
  batch_id text not null,
  created_at timestamptz default now() not null
);

create index idx_import_history_user on public.import_history(user_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.projected_transactions enable row level security;
alter table public.budget_goals enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.import_history enable row level security;

-- Categories policies
create policy "Users can view their own categories"
  on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories"
  on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories"
  on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories"
  on public.categories for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view their own transactions"
  on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions"
  on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions"
  on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions"
  on public.transactions for delete using (auth.uid() = user_id);

-- Projected transactions policies
create policy "Users can view their own projections"
  on public.projected_transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own projections"
  on public.projected_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own projections"
  on public.projected_transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own projections"
  on public.projected_transactions for delete using (auth.uid() = user_id);

-- Budget goals policies
create policy "Users can view their own budget goals"
  on public.budget_goals for select using (auth.uid() = user_id);
create policy "Users can insert their own budget goals"
  on public.budget_goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own budget goals"
  on public.budget_goals for update using (auth.uid() = user_id);
create policy "Users can delete their own budget goals"
  on public.budget_goals for delete using (auth.uid() = user_id);

-- Recurring transactions policies
create policy "Users can view their own recurring transactions"
  on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own recurring transactions"
  on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own recurring transactions"
  on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own recurring transactions"
  on public.recurring_transactions for delete using (auth.uid() = user_id);

-- Import history policies
create policy "Users can view their own import history"
  on public.import_history for select using (auth.uid() = user_id);
create policy "Users can insert their own import history"
  on public.import_history for insert with check (auth.uid() = user_id);

-- =============================================
-- Seed: Categorias padrão (inseridas por trigger)
-- =============================================
create or replace function public.create_default_categories()
returns trigger as $$
begin
  insert into public.categories (user_id, name, icon, color, type, is_system) values
    (new.id, '🏠 Moradia & Contas', '🏠', '#3b82f6', 'expense', true),
    (new.id, '🍔 Alimentação & Lazer', '🍔', '#10b981', 'expense', true),
    (new.id, '🚗 Transporte & Veículo', '🚗', '#f59e0b', 'expense', true),
    (new.id, '👶 Filhos, Babá & Educação', '👶', '#8b5cf6', 'expense', true),
    (new.id, '🛍️ Compras & Assinaturas', '🛍️', '#ec4899', 'expense', true),
    (new.id, '💳 Financeiro & Cartões', '💳', '#ef4444', 'expense', true),
    (new.id, '🔄 Outros PIX e Transf.', '🔄', '#14b8a6', 'expense', true),
    (new.id, '📦 Outros Gastos', '📦', '#64748b', 'expense', true),
    (new.id, 'Entrada/Rendimento', '💰', '#10b981', 'income', true);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_categories();
