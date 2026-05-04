# Setup do Supabase — RSVP e Mural de Recados

Este guia tem **tudo** que precisa ser feito do lado do Supabase para o site funcionar.

---

## 1. Criar projeto

1. Acesse https://supabase.com e crie um novo projeto.
2. Anote a **URL do projeto** e a **anon public key** (Project Settings → API).
3. No diretório `wedding-src/`, copie `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   ```

   E preencha:

   ```
   PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

> ⚠️ A anon key é pública (pode aparecer no bundle do site). A segurança fica garantida pelas **Row Level Security (RLS)** + funções `SECURITY DEFINER` definidas abaixo.

> 🚀 **No deploy (GitHub Pages)**: configure as duas variáveis como **secrets do repositório**:
>
> 1. No GitHub: `Settings` → `Secrets and variables` → `Actions` → aba **Secrets** → **New repository secret**
> 2. Crie `PUBLIC_SUPABASE_URL` com a URL do projeto
> 3. Crie `PUBLIC_SUPABASE_ANON_KEY` com a anon key
>
> O workflow `.github/workflows/deploy.yml` já lê esses secrets na etapa de build.

---

## 2. Executar SQL no Supabase

Vá em **SQL Editor** no painel do Supabase e cole/execute o bloco abaixo de uma vez:

```sql
-- =========================================================
-- Extensões
-- =========================================================
create extension if not exists unaccent;

-- Wrapper IMMUTABLE em volta de unaccent() para poder usar em coluna gerada.
-- (unaccent é STABLE por padrão, o Postgres não aceita em GENERATED ALWAYS AS.)
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable strict parallel safe
as $$ select public.unaccent('public.unaccent'::regdictionary, $1) $$;

-- =========================================================
-- Tabela: convidados
-- =========================================================
create table if not exists public.convidados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_normalizado text generated always as (lower(public.immutable_unaccent(nome))) stored,
  confirmado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists convidados_nome_normalizado_idx
  on public.convidados (nome_normalizado);

alter table public.convidados enable row level security;

-- Bloqueia qualquer acesso direto via anon (só RPC pode tocar nesta tabela)
drop policy if exists "deny all anon convidados" on public.convidados;
create policy "deny all anon convidados"
  on public.convidados
  for all
  to anon
  using (false)
  with check (false);

-- =========================================================
-- Tabela: mensagens
-- =========================================================
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  mensagem text not null,
  created_at timestamptz not null default now()
);

alter table public.mensagens enable row level security;

drop policy if exists "deny all anon mensagens" on public.mensagens;
create policy "deny all anon mensagens"
  on public.mensagens
  for all
  to anon
  using (false)
  with check (false);

-- =========================================================
-- RPC: confirmar_presenca(nome_input)
--   - retorna TRUE  se encontrou o convidado e marcou confirmação
--   - retorna FALSE se o nome não está na lista
-- =========================================================
create or replace function public.confirmar_presenca(nome_input text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_normalizado text;
begin
  if nome_input is null or length(trim(nome_input)) < 2 then
    return false;
  end if;

  v_normalizado := lower(public.immutable_unaccent(trim(nome_input)));

  select id into v_id
  from public.convidados
  where nome_normalizado = v_normalizado
  limit 1;

  if v_id is null then
    return false;
  end if;

  update public.convidados
  set confirmado_em = coalesce(confirmado_em, now())
  where id = v_id;

  return true;
end;
$$;

revoke all on function public.confirmar_presenca(text) from public;
grant execute on function public.confirmar_presenca(text) to anon, authenticated;

-- =========================================================
-- RPC: inserir_mensagem(nome_input, mensagem_input)
-- =========================================================
create or replace function public.inserir_mensagem(
  nome_input text,
  mensagem_input text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_nome text;
  v_msg text;
begin
  v_nome := trim(coalesce(nome_input, ''));
  v_msg := trim(coalesce(mensagem_input, ''));

  if length(v_nome) < 2 then
    raise exception 'nome inválido';
  end if;
  if length(v_msg) < 1 then
    raise exception 'mensagem vazia';
  end if;
  if length(v_nome) > 120 then
    v_nome := substring(v_nome from 1 for 120);
  end if;
  if length(v_msg) > 1000 then
    v_msg := substring(v_msg from 1 for 1000);
  end if;

  insert into public.mensagens (nome, mensagem)
  values (v_nome, v_msg)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.inserir_mensagem(text, text) from public;
grant execute on function public.inserir_mensagem(text, text) to anon, authenticated;
```

---

## 3. Cadastrar a lista de convidados

Você pode inserir via SQL (ex.: copia/cola na aba SQL Editor):

```sql
insert into public.convidados (nome) values
  ('Lucas Tavares'),
  ('Letícia Carrarini'),
  ('João da Silva'),
  ('Maria de Souza');
-- ... etc
```

Ou usar a interface gráfica em **Table Editor → convidados → Insert row**.

> A coluna `nome_normalizado` é **gerada automaticamente** (lower + unaccent), então a comparação na hora do RSVP é tolerante a acentos e maiúsculas/minúsculas.

> Cada **pessoa** deve ter sua própria linha (use o nome que você espera que ela digite).

---

## 4. Como o fluxo funciona

### RSVP
1. Usuário digita o nome no formulário em `/rsvp`.
2. Frontend chama `supabase.rpc('confirmar_presenca', { nome_input })`.
3. A função SQL normaliza o nome, procura na tabela e:
   - Se encontrar: marca `confirmado_em = now()` (se ainda não estiver marcado) e retorna `true` → modal de sucesso.
   - Se não encontrar: retorna `false` → modal "Nome não encontrado".

### Mural
1. Usuário preenche nome + mensagem no rodapé.
2. Frontend chama `supabase.rpc('inserir_mensagem', { nome_input, mensagem_input })`.
3. A função insere a linha em `mensagens` e retorna o `id`.

---

## 5. Consultar resultados

No SQL Editor:

```sql
-- Quem já confirmou
select nome, confirmado_em
from public.convidados
where confirmado_em is not null
order by confirmado_em desc;

-- Quem ainda falta
select nome
from public.convidados
where confirmado_em is null
order by nome;

-- Mensagens recebidas
select created_at, nome, mensagem
from public.mensagens
order by created_at desc;
```

---

## 6. Checklist final

- [ ] Projeto criado no Supabase
- [ ] `.env` preenchido em `wedding-src/`
- [ ] SQL da seção 2 executado com sucesso
- [ ] Lista de convidados cadastrada
- [ ] Variáveis `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` configuradas no provedor de deploy
- [ ] Teste local: `npm run dev` e tentar RSVP com nome existente e inexistente
- [ ] Teste do mural enviando uma mensagem
