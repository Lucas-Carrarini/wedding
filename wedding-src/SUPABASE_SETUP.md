# Setup do Supabase — Presenças e Mural de Recados

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
-- (se você já rodou a versão anterior do schema, descomente para limpar)
-- =========================================================
-- drop function if exists public.confirmar_presenca(text);
-- drop function if exists public.immutable_unaccent(text);
-- drop table if exists public.convidados;

-- =========================================================
-- Tabela: presencas (lista livre de quem confirmou presença)
-- =========================================================
create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 2 and 80),
  created_at timestamptz not null default now()
);

alter table public.presencas enable row level security;
revoke all on public.presencas from anon, authenticated;

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
-- RPC: registrar_presenca(nome_input)
--   - insere uma linha em public.presencas e retorna o id
-- =========================================================
create or replace function public.registrar_presenca(nome_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_nome text;
begin
  v_nome := trim(coalesce(nome_input, ''));
  if length(v_nome) < 2 or length(v_nome) > 80 then
    raise exception 'nome inválido';
  end if;

  insert into public.presencas (nome) values (v_nome)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.registrar_presenca(text) from public;
grant execute on function public.registrar_presenca(text) to anon, authenticated;

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

## 3. Como o fluxo funciona

### RSVP (lista livre)
1. Usuário digita o nome no formulário em `/rsvp`.
2. Frontend chama `supabase.rpc('registrar_presenca', { nome_input })`.
3. A função insere uma linha em `presencas` com nome + `created_at` e retorna o `id` → modal de sucesso.

> Não há lista prévia de convidados — qualquer nome válido (2 a 80 caracteres) é aceito. Você consulta depois quem confirmou.

### Mural
1. Usuário preenche nome + mensagem no rodapé.
2. Frontend chama `supabase.rpc('inserir_mensagem', { nome_input, mensagem_input })`.
3. A função insere a linha em `mensagens` e retorna o `id`.

---

## 4. Consultar resultados

No SQL Editor:

```sql
-- Quem confirmou presença (ordem cronológica)
select created_at, nome
from public.presencas
order by created_at desc;

-- Total de confirmações
select count(*) as total from public.presencas;

-- Mensagens recebidas
select created_at, nome, mensagem
from public.mensagens
order by created_at desc;
```

---

## 5. Checklist final

- [ ] Projeto criado no Supabase
- [ ] `.env` preenchido em `wedding-src/`
- [ ] SQL da seção 2 executado com sucesso
- [ ] Variáveis `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` configuradas no provedor de deploy
- [ ] Teste local: `npm run dev` → enviar RSVP e ver linha em `presencas`
- [ ] Teste do mural enviando uma mensagem
