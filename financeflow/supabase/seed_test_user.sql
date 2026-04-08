-- =============================================
-- Usuário de teste para login (email + senha)
-- Rode no SQL Editor do Supabase (como postgres).
--
-- Se o login falhar no app:
-- 1) Authentication → Providers → Email → desative "Confirm email" (testes)
-- 2) Authentication → URL Configuration → Site URL = URL do seu app (ex.: https://seu-dominio.com)
-- 3) Additional Redirect URLs: inclua a mesma URL e http://localhost:3000
-- 4) No deploy: NEXT_PUBLIC_* devem ser as chaves do MESMO projeto Supabase e rebuild após mudar
--
-- E-mail: test@gmail.com
-- Senha:  SenhaTeste123!
--
-- Se der erro de coluna, o schema do auth mudou: use o painel
-- Authentication → Users → Add user (recomendado).
-- =============================================

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  uid  uuid := gen_random_uuid();
  mail text := 'test@gmail.com';
  pass text := 'SenhaTeste123!';
begin
  if exists (select 1 from auth.users where email = mail) then
    raise exception 'Já existe usuário com e-mail %', mail;
  end if;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    mail,
    extensions.crypt(pass, extensions.gen_salt('bf')),
    timezone('utc', now()),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object(),
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  );

  -- id da identity costuma ser o mesmo uuid do user para provider "email"
  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    uid,
    uid,
    uid::text,
    jsonb_build_object(
      'sub', uid::text,
      'email', mail,
      'email_verified', true
    ),
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  );
end $$;

commit;
