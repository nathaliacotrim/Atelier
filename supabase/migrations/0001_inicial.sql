-- Estrutura inicial: perfis de marca, conversas (conteúdos), mensagens e memória da IA.
-- Rode no SQL Editor do Supabase (ou com `supabase db push`).

create table public.perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  arroba text not null,
  nome text not null,
  nicho text not null default '',
  publico text not null default '',
  produtos text not null default '',
  tom_de_voz text not null default '',
  objetivos text not null default '',
  referencias text not null default '',
  cor_primaria text not null default '#5C0F14',
  cor_secundaria text not null default '#F3E6D6',
  criado_em timestamptz not null default now()
);

create table public.conversas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  titulo text not null,
  formato text not null check (formato in ('reels', 'carrossel', 'stories')),
  objetivo text not null check (objetivo in ('crescimento', 'engajamento', 'vendas')),
  tema text not null default '',
  arte jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversa_id uuid not null references public.conversas (id) on delete cascade,
  papel text not null check (papel in ('user', 'assistant')),
  conteudo text not null,
  criado_em timestamptz not null default now()
);

create table public.memorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  texto text not null,
  origem text not null default 'ia' check (origem in ('ia', 'manual')),
  criado_em timestamptz not null default now()
);

create index on public.perfis (user_id);
create index on public.conversas (perfil_id, atualizado_em desc);
create index on public.mensagens (conversa_id, criado_em);
create index on public.memorias (perfil_id, criado_em);

-- Cada pessoa só enxerga e altera os próprios dados.
alter table public.perfis enable row level security;
alter table public.conversas enable row level security;
alter table public.mensagens enable row level security;
alter table public.memorias enable row level security;

create policy "dono" on public.perfis for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on public.conversas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on public.mensagens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on public.memorias for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
