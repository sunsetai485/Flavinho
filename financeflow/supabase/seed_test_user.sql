-- =============================================
-- Usuário de teste para login (email + senha)
-- Rode no SQL Editor do Supabase (como postgres).
--
-- E-mail: test@gmail.com
-- Senha:  SenhaTeste123!
--
-- Se o login falhar no app:
-- 1) Authentication → Providers → Email → desative "Confirm email" (testes)
-- 2) Authentication → URL Configuration → Site URL = URL do seu app
-- 3) Additional Redirect URLs: URL do app + http://localhost:3000
-- 4) Deploy: NEXT_PUBLIC_* do mesmo projeto + rebuild após mudar
-- =============================================

-- =============================================
-- OPCIONAL: recriar o usuário do zero
-- Se já existe test@gmail.com e você quer apagar e inserir de novo,
-- rode APENAS o bloco abaixo (sem /* */), depois rode o restante do arquivo.
-- =============================================
/*
begin;
delete from auth.identities
  where user_id in (select id from auth.users where lower(email) = lower('test@gmail.com'));
delete from auth.users where lower(email) = lower('test@gmail.com');
commit;
*/

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  uid  uuid := gen_random_uuid();
  mail text := 'test@gmail.com';
  pass text := 'SenhaTeste123!';
begin
  if exists (select 1 from auth.users where lower(email) = lower(mail)) then
    raise notice 'Usuário % já existe — nada foi alterado. Faça login com a senha que definiu ou use Authentication → Users → reset password. Para recriar, rode o bloco DELETE no topo deste arquivo (descomente).', mail;
  else
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

  raise notice 'Usuário % criado. Senha: %', mail, pass;
  end if;
end $$;

commit;
